const InterviewSession = require('../models/InterviewSession');
const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const { createNotification } = require('../services/notificationService');
const { generateQuestions, generateFollowUp, evaluateAnswers } = require('../services/aiInterviewService');
const { runSampleCases } = require('../services/codeExecutionService');

exports.runCodeSamples = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid interview session ID.' });
    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user._id }).select('config questions');
    if (!session) return res.status(404).json({ message: 'Interview session not found.' });
    if (session.config.track !== 'coding') return res.status(400).json({ message: 'Sample execution is available only for coding interviews.' });
    const question = session.questions.find((item) => item.id === req.body?.questionId);
    if (!question) return res.status(404).json({ message: 'Coding question not found in this interview.' });
    const language = session.config.codeLanguage || 'JavaScript';
    if (!['Java', 'Python'].includes(language)) return res.status(400).json({ message: 'JavaScript samples run in your browser. Select Java or Python to use the server-side sample runner.' });
    const result = await runSampleCases({ language, code: req.body?.code, sampleTestCases: question.sampleTestCases });
    res.json(result);
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ message: error.message });
    next(error);
  }
};

exports.startSession = async (req, res, next) => {
  try {
    const role = typeof req.body?.role === 'string' ? req.body.role.trim().slice(0, 100) : '';
    if (!role) return res.status(400).json({ message: 'Choose a target role before starting your interview.' });
    const validTracks = ['aptitude', 'coding', 'technical', 'hr'];
    const track = validTracks.includes(req.body.track) ? req.body.track : 'technical';
    const allowedQuestionCounts = { aptitude: [10, 15], coding: [2, 3], technical: [3, 5], hr: [3, 5] };
    const requested = allowedQuestionCounts[track].includes(Number(req.body.numQuestions))
      ? Number(req.body.numQuestions)
      : allowedQuestionCounts[track][0];
    const config = {
      role,
      difficulty: ['Beginner', 'Intermediate', 'Advanced'].includes(req.body.difficulty) ? req.body.difficulty : 'Intermediate',
      track,
      interviewType: track,
      mode: ['aptitude', 'coding'].includes(track) ? 'written' : (req.body.mode === 'voice' ? 'voice' : 'written'),
      numQuestions: requested,
      codeLanguage: ['JavaScript', 'Python', 'Java'].includes(req.body.codeLanguage) ? req.body.codeLanguage : 'JavaScript',
    };
    let resume;
    if (track === 'technical' && req.body.resumeId) {
      if (!mongoose.isValidObjectId(req.body.resumeId)) return res.status(400).json({ message: 'Choose a valid uploaded resume.' });
      resume = await Resume.findOne({ _id: req.body.resumeId, user: req.user._id });
      if (!resume) return res.status(404).json({ message: 'The selected resume was not found in your account. Refresh the resume list and try again.' });
    } else if (track === 'technical') {
      resume = await Resume.findOne({ user: req.user._id, isPrimary: true })
        || await Resume.findOne({ user: req.user._id }).sort({ uploadedAt: -1 });
    }
    if (track === 'technical' && (!resume || !String(resume.extractedText || '').trim())) {
      return res.status(422).json({ message: 'Upload a readable PDF or DOCX resume before starting a personalized interview.' });
    }
    if (resume?.extractedText?.length > 60000) {
      return res.status(422).json({ message: 'This resume is too long to send safely for question generation. Upload a shorter version and try again.' });
    }
    const skillGaps = resume?.aiRoleAnalysis?.targetRole === config.role
      ? (resume.aiRoleAnalysis.result?.skillsCategorized || []).flatMap((category) => (category.missing || []).map((gap) => gap.name)).slice(0, 8)
      : [];
    const aiInterview = await generateQuestions({
      role: config.role,
      difficulty: config.difficulty,
      interviewType: config.interviewType,
      track,
      count: requested,
      codeLanguage: config.codeLanguage,
      resumeText: track === 'technical' ? (resume?.extractedText || '') : '',
      skillGaps,
    });
    if (!aiInterview) {
      return res.status(503).json({ message: 'The configured AI provider could not create and verify questions for this role and resume. No generic questions were substituted. Check the selected provider key, model access, or quota, then retry.' });
    }
    const questions = aiInterview.questions;
    if (resume) {
      config.resumeId = resume._id.toString();
      config.resumeName = resume.fileName;
    }
    config.questionProvider = aiInterview.provider;
    config.questionModel = aiInterview.model;
    const session = await InterviewSession.create({ user: req.user._id, config, questions });
    res.status(201).json({ sessionId: session._id.toString(), config, questions: questions.map(({ evaluationFocus, correctOptionIndex, answerExplanation, ...question }) => question) });
  } catch (err) { next(err); }
};

exports.createFollowUp = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ message: 'Interview session not found.' });
    if (session.evaluation) return res.status(409).json({ message: 'This interview has already been evaluated.' });
    const firstQuestion = session.questions[0];
    if (!['technical', 'hr'].includes(session.config.track || 'technical')) {
      return res.status(400).json({ message: 'Adaptive spoken follow-ups are available for technical and HR interview tracks.' });
    }
    if (!firstQuestion || String(req.body.questionId || '') !== firstQuestion.id) {
      return res.status(400).json({ message: 'The adaptive follow-up is available after the first interview question.' });
    }
    if (firstQuestion.followUpQuestion) {
      return res.json({ question: firstQuestion.followUpQuestion, provider: session.config.questionProvider || 'AI provider', model: firstQuestion.followUpModel || '' });
    }
    const answer = typeof req.body.answer === 'string' ? req.body.answer.trim().slice(0, 10000) : '';
    if (!answer) return res.status(400).json({ message: 'Answer the first question before requesting a follow-up.' });
    const resume = session.config.resumeId
      ? await Resume.findOne({ _id: session.config.resumeId, user: req.user._id }).select('extractedText')
      : null;
    if (session.config.track === 'technical' && !resume?.extractedText) return res.status(422).json({ message: 'The resume used for this interview is no longer available.' });

    const followUp = await generateFollowUp({
      role: session.config.role,
      difficulty: session.config.difficulty,
      question: firstQuestion.question,
      answer,
      resumeEvidence: firstQuestion.resumeEvidence,
      resumeText: resume?.extractedText || '',
    });
    if (!followUp) {
      return res.status(503).json({ message: 'The configured AI provider could not create an adaptive follow-up right now. You can continue to the next question or retry.' });
    }
    firstQuestion.followUpQuestion = followUp.question;
    firstQuestion.followUpModel = followUp.model;
    session.markModified('questions');
    await session.save();
    res.json({ question: followUp.question, provider: followUp.provider, model: followUp.model });
  } catch (err) { next(err); }
};

exports.submitAnswers = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ message: 'Interview session not found.' });
    if (session.evaluation) return res.json(session.evaluation);
    const incoming = req.body.answers && typeof req.body.answers === 'object' ? req.body.answers : (session.answers || {});
    const provided = {};
    session.questions.forEach((question) => {
      const answer = incoming[question.id];
      if (typeof answer === 'string') {
        provided[question.id] = answer.slice(0, 10000);
      } else if (answer && typeof answer === 'object' && !Array.isArray(answer)) {
        if (question.kind === 'aptitude') {
          const selectedOptionIndex = answer.selectedOptionIndex;
          if (Number.isInteger(selectedOptionIndex) && selectedOptionIndex >= 0 && selectedOptionIndex < (question.options || []).length) {
            provided[question.id] = { selectedOptionIndex };
          }
        } else if (question.kind === 'coding') {
          provided[question.id] = {
            language: ['JavaScript', 'Python', 'Java'].includes(answer.language) ? answer.language : (session.config.codeLanguage || 'JavaScript'),
            code: typeof answer.code === 'string' ? answer.code.slice(0, 12000) : '',
            testRunSummary: typeof answer.testRunSummary === 'string' ? answer.testRunSummary.slice(0, 1000) : '',
          };
        } else {
          provided[question.id] = {
            initialAnswer: typeof answer.initialAnswer === 'string' ? answer.initialAnswer.slice(0, 10000) : '',
            followUpQuestion: question.followUpQuestion || '',
            followUpAnswer: typeof answer.followUpAnswer === 'string' ? answer.followUpAnswer.slice(0, 10000) : '',
          };
        }
      }
    });
    const selectedResume = session.config.resumeId
      ? await Resume.findOne({ _id: session.config.resumeId, user: req.user._id }).select('extractedText')
      : null;
    if (session.config.track === 'technical' && !selectedResume?.extractedText) {
      return res.status(422).json({ message: 'The resume used for this interview is no longer available. Start a new interview with an uploaded resume.' });
    }
    // Keep submitted transcripts if AI evaluation is temporarily unavailable so the student can retry without losing answers.
    session.answers = provided;
    await session.save();
    const aiEvaluation = await evaluateAnswers({ session, answers: provided, resumeText: selectedResume?.extractedText || '' });
    if (!aiEvaluation) {
      return res.status(503).json({ message: 'The configured AI provider could not evaluate these answers right now. Your transcripts are saved with this session; retry later. No fallback marks were generated.' });
    }
    const evaluation = {
      sessionId: session._id.toString(),
      overallScore: aiEvaluation.overallScore,
      role: session.config.role,
      difficulty: session.config.difficulty,
      interviewType: session.config.interviewType,
      mode: session.config.mode || 'written',
      resumeName: session.config.resumeName || '',
      questionProvider: session.config.questionProvider || 'AI provider',
      questionModel: session.config.questionModel || '',
      completedAt: new Date().toISOString(),
      analysisProvider: aiEvaluation.provider,
      analysisModel: aiEvaluation.model,
      summary: aiEvaluation.summary,
      positives: aiEvaluation.positives,
      improvementAreas: aiEvaluation.improvementAreas,
      nextSteps: aiEvaluation.nextSteps,
      dimensionScores: aiEvaluation.dimensionScores,
      questionsFeedback: aiEvaluation.questionsFeedback,
    };
    session.evaluation = evaluation;
    session.completedAt = new Date();
    await session.save();
    const scoreDescription = `${aiEvaluation.provider} evaluated your submitted answers: ${aiEvaluation.overallScore}/100.`;
    await createNotification(req.user._id, {
      title: 'Interview practice completed',
      message: `Your ${session.config.role} ${session.config.mode === 'voice' ? 'voice interview' : 'written practice session'} is complete. ${scoreDescription}`,
      category: 'Interview Practice',
      type: 'interview',
    });
    res.json(evaluation);
  } catch (err) { next(err); }
};

exports.getLatestResults = async (req, res, next) => {
  try {
    const session = await InterviewSession.findOne({ user: req.user._id, completedAt: { $ne: null } }).sort({ completedAt: -1 });
    if (!session) return res.status(404).json({ message: 'No completed interview sessions yet.' });
    res.json(session.evaluation);
  } catch (err) { next(err); }
};
