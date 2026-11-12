import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  LinearProgress,
  Divider,
  Alert,
  Tooltip,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import {
  Headphones,
  Video,
  Play,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Send,
  FileCheck,
  Mic,
  MicOff,
  Volume2,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { ScoreRing } from '../../components/common/ScoreRing';
import { colors } from '../../theme/theme';
import interviewService from '../../services/interviewService';
import resumeService from '../../services/resumeService';
import { useAuth } from '../../context/AuthContext';

const QUESTION_COUNTS_BY_TRACK = {
  aptitude: [10, 15],
  coding: [2, 3],
  technical: [3, 5],
  hr: [3, 5],
};
const DEFAULT_QUESTION_COUNT_BY_TRACK = {
  aptitude: 10,
  coding: 2,
  technical: 3,
  hr: 3,
};

export const MockInterviewPage = () => {
  const { user } = useAuth();
  const [stage, setStage] = useState('setup'); // 'setup' | 'interview' | 'results'
  const [config, setConfig] = useState({
    role: user?.targetRole || 'Full Stack Engineer',
    difficulty: 'Intermediate',
    track: 'technical',
    interviewType: 'technical',
    mode: 'voice',
    numQuestions: 3,
    codeLanguage: 'JavaScript',
  });

  // Interview active session state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [testRunSummary, setTestRunSummary] = useState('');
  const [testRunLoading, setTestRunLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180);
  const [timerActive, setTimerActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Results state
  const [evaluation, setEvaluation] = useState(null);
  const [latestEvaluation, setLatestEvaluation] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [sessionError, setSessionError] = useState('');
  const [resumeOptions, setResumeOptions] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [resumeLoading, setResumeLoading] = useState(true);
  const [resumeLoadError, setResumeLoadError] = useState('');
  const [startingInterview, setStartingInterview] = useState(false);
  const [interviewBasis, setInterviewBasis] = useState(null);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpTurn, setFollowUpTurn] = useState(false);
  const [followUpAttempted, setFollowUpAttempted] = useState(false);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef(null);
  const recordingBaseRef = useRef('');
  const speechRecognitionSupported = typeof window !== 'undefined'
    && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  const speechSynthesisSupported = typeof window !== 'undefined'
    && Boolean(window.speechSynthesis && window.SpeechSynthesisUtterance);

  const stopVoiceCapture = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch { /* Recording may already have ended. */ }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const speakCurrentQuestion = () => {
    const spokenPrompt = followUpTurn ? followUpQuestion : questions[currentIndex]?.question;
    if (!speechSynthesisSupported || !spokenPrompt) return;
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(spokenPrompt);
    utterance.lang = 'en-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceCapture = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setSpeechError('Voice transcription is not supported in this browser. Use a supported browser or choose Written Practice from the setup screen.');
      return;
    }
    setSpeechError('');
    recordingBaseRef.current = currentAnswer.trim();
    const recognition = new Recognition();
    recognition.lang = 'en-IN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join(' ').trim();
      const base = recordingBaseRef.current;
      setCurrentAnswer([base, transcript].filter(Boolean).join(' '));
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      const messages = {
        'not-allowed': 'Microphone permission is blocked. Allow microphone access in your browser settings, then try again.',
        'service-not-allowed': 'This browser does not allow speech recognition here. Choose Written Practice from the setup screen to continue.',
        network: 'Speech recognition could not connect. Check your internet connection, then try again.',
        'no-speech': 'No speech was detected. Try speaking again.',
      };
      setSpeechError(messages[event.error] || 'Voice capture stopped. You can try again.');
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setSpeechError('Could not start the microphone. Stop any active recording and try again.');
      setIsListening(false);
    }
  };

  // Timer countdown
  useEffect(() => {
    let timer = null;
    if (stage === 'interview' && timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stage, timerActive, timeLeft]);

  useEffect(() => {
    if (stage === 'interview' && config.mode === 'voice') {
      const timer = setTimeout(speakCurrentQuestion, 350);
      return () => {
        clearTimeout(timer);
        window.speechSynthesis?.cancel();
      };
    }
    return undefined;
  }, [stage, currentIndex, questions, config.mode, followUpTurn, followUpQuestion]);

  useEffect(() => () => {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    interviewService.getLatestResults()
      .then((res) => setLatestEvaluation(res.data))
      .catch(() => setLatestEvaluation(null));
  }, []);

  useEffect(() => {
    let active = true;
    resumeService.getResumes()
      .then(({ data }) => {
        if (!active) return;
        const resumes = Array.isArray(data) ? data : (data?.resumes || []);
        setResumeOptions(resumes);
        const defaultResume = resumes.find((resume) => resume.isPrimary) || resumes[0];
        if (defaultResume) setSelectedResumeId(String(defaultResume.id || defaultResume._id));
        setResumeLoadError('');
      })
      .catch((error) => {
        if (active) setResumeLoadError(error.response?.data?.message || 'Could not load your uploaded resumes. Refresh and try again.');
      })
      .finally(() => { if (active) setResumeLoading(false); });
    return () => { active = false; };
  }, []);

  const handleStartInterview = async () => {
    setSessionError('');
    setStartingInterview(true);
    try {
      const res = await interviewService.startSession({
        ...config,
        ...(config.track === 'technical' ? { resumeId: selectedResumeId } : {}),
      });
      setSessionId(res.data.sessionId);
      setQuestions(res.data.questions);
      setInterviewBasis({
        role: res.data.config?.role || config.role,
        resumeName: res.data.config?.resumeName || '',
        provider: res.data.config?.questionProvider || 'AI provider',
        model: res.data.config?.questionModel || '',
      });
      setCurrentIndex(0);
      setAnswers({});
      setCurrentAnswer(res.data.questions[0]?.starterCode || '');
      setTestRunSummary('');
      setFollowUpQuestion('');
      setFollowUpTurn(false);
      setFollowUpAttempted(false);
      setTimeLeft(res.data.questions[0]?.timeLimitSeconds || 180);
      setTimerActive(true);
      setStage('interview');
    } catch (error) {
      setSessionError(error.response?.data?.message || 'Could not start an interview session. Please try again.');
    } finally {
      setStartingInterview(false);
    }
  };

  const advanceToNextQuestion = (updatedAnswers) => {
    setAnswers(updatedAnswers);
    setFollowUpTurn(false);
    setFollowUpQuestion('');
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setCurrentAnswer(questions[nextIdx]?.starterCode || '');
      setTestRunSummary('');
      setTimeLeft(questions[nextIdx]?.timeLimitSeconds || 180);
    } else {
      handleSubmitSession(updatedAnswers);
    }
  };

  const handleNextQuestion = async () => {
    stopVoiceCapture();
    window.speechSynthesis?.cancel();
    setSpeechError('');
    const currentQId = questions[currentIndex]?.id;
    if (followUpTurn) {
      const firstAnswer = answers[currentQId] || '';
      const conversationalAnswer = {
        initialAnswer: firstAnswer,
        followUpQuestion,
        followUpAnswer: currentAnswer,
      };
      advanceToNextQuestion({ ...answers, [currentQId]: conversationalAnswer });
      return;
    }

    const answerValue = config.track === 'aptitude'
      ? (currentAnswer === '' ? '' : { selectedOptionIndex: Number(currentAnswer) })
      : config.track === 'coding'
        ? { language: config.codeLanguage, code: currentAnswer, testRunSummary }
        : currentAnswer;
    const updatedAnswers = { ...answers, [currentQId]: answerValue };
    setAnswers(updatedAnswers);
    if (['technical', 'hr'].includes(config.track) && currentIndex === 0 && !followUpAttempted && currentAnswer.trim()) {
      setFollowUpAttempted(true);
      setFollowUpLoading(true);
      setSessionError('');
      try {
        const { data } = await interviewService.getAdaptiveFollowUp(sessionId, {
          questionId: currentQId,
          answer: currentAnswer,
        });
        setFollowUpQuestion(data.question);
        setFollowUpTurn(true);
        setCurrentAnswer('');
        setTimeLeft(90);
      } catch (error) {
        setFollowUpAttempted(false);
        setSessionError(error.response?.data?.message || 'The AI provider could not prepare a follow-up. Continue to the next question and retry later.');
      } finally {
        setFollowUpLoading(false);
      }
      return;
    }
    advanceToNextQuestion(updatedAnswers);
  };

  const handleRunSampleTests = async () => {
    const question = questions[currentIndex];
    if (!question?.sampleTestCases?.length) return;
    if (config.codeLanguage === 'JavaScript' && !question.functionName) return;
    if (config.codeLanguage === 'JavaScript' && !/^[A-Za-z_$][\w$]*$/.test(question.functionName)) {
      setTestRunSummary('This question has an invalid function name. You can still submit your solution for AI review.');
      return;
    }
    setTestRunLoading(true);
    setTestRunSummary('Running sample cases…');
    try {
      if (config.codeLanguage !== 'JavaScript') {
        const { data } = await interviewService.runCode(sessionId, { questionId: question.id, code: currentAnswer });
        if (data.compileError) {
          setTestRunSummary(`Compilation failed: ${data.compileError}`);
          return;
        }
        if (data.runtimeError) {
          setTestRunSummary(`Runtime error: ${data.runtimeError}`);
          return;
        }
        const passedRemote = data.results.filter((item) => item.pass).length;
        setTestRunSummary(`${passedRemote}/${data.results.length} sample tests passed (${data.language} ${data.runtime})${data.results.some((item) => !item.pass) ? ` · ${data.results.filter((item) => !item.pass).map((item) => `Test ${item.index}: expected ${item.expected}, got ${item.actual}`).join(' · ')}` : ''}`);
        return;
      }
      const cases = question.sampleTestCases;
      const functionName = question.functionName;
      const source = currentAnswer;
      const workerCode = `self.onmessage = ({ data }) => { try { const getSolution = new Function(data.source + '\\n; return typeof ' + data.functionName + ' === "function" ? ' + data.functionName + ' : null;'); const solve = getSolution(); if (!solve) throw new Error('Define the required function: ' + data.functionName); const results = data.cases.map((test, i) => { const actual = solve(JSON.parse(test.input)); const expected = JSON.parse(test.expectedOutput); const pass = JSON.stringify(actual) === JSON.stringify(expected); return { pass, index: i + 1, expected: JSON.stringify(expected), actual: JSON.stringify(actual) }; }); self.postMessage({ results }); } catch (error) { self.postMessage({ error: error.message || 'Could not run this solution.' }); } };`;
      const blob = new Blob([workerCode], { type: 'text/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);
      const result = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => { worker.terminate(); reject(new Error('Execution stopped after 2 seconds. Check for an infinite loop.')); }, 2000);
        worker.onmessage = (event) => { clearTimeout(timeout); resolve(event.data); };
        worker.onerror = () => { clearTimeout(timeout); reject(new Error('The sample runner could not execute this code.')); };
        worker.postMessage({ source, functionName, cases });
      });
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      if (result.error) throw new Error(result.error);
      const passed = result.results.filter((item) => item.pass).length;
      setTestRunSummary(`${passed}/${result.results.length} sample tests passed${result.results.some((item) => !item.pass) ? ` · ${result.results.filter((item) => !item.pass).map((item) => `Test ${item.index}: expected ${item.expected}, got ${item.actual}`).join(' · ')}` : ''}`);
    } catch (error) {
      setTestRunSummary(error.message);
    } finally {
      setTestRunLoading(false);
    }
  };

  const handleSkipQuestion = () => {
    stopVoiceCapture();
    window.speechSynthesis?.cancel();
    setSpeechError('');
    const currentQId = questions[currentIndex]?.id;
    if (followUpTurn) {
      advanceToNextQuestion(answers);
      return;
    }
    if (currentIndex === 0) setFollowUpAttempted(true);
    advanceToNextQuestion({ ...answers, [currentQId]: '' });
  };

  const handleSubmitSession = async (finalAnswers = answers) => {
    stopVoiceCapture();
    window.speechSynthesis?.cancel();
    setTimerActive(false);
    setSubmitting(true);
    try {
      const res = await interviewService.submitAnswers(sessionId, finalAnswers);
      setEvaluation(res.data);
      setLatestEvaluation(res.data);
      setStage('results');
    } catch (error) {
      setSessionError(error.response?.data?.message || 'Could not submit your answers. Your responses are still on this page; please retry.');
      setTimerActive(true);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTestAlertSeverity = (summary) => {
    if (summary === 'Running sample cases…') return 'info';
    const counts = /^(\d+)\/(\d+) sample tests passed/.exec(summary || '');
    return counts && counts[1] === counts[2] ? 'success' : 'warning';
  };

  // 1. SETUP SCREEN
  if (stage === 'setup') {
    return (
      <Box>
        <PageHeader
          title="One-on-One Mock Interview"
          subtitle="Practice a role-focused interview by voice, then review detailed AI feedback on your answers."
        />

        {sessionError && <Alert severity="error" sx={{ mb: 2 }}>{sessionError}</Alert>}

        <Grid container spacing={3.5}>
          {/* Left Form: Configuration */}
          <Grid item xs={12} md={7}>
            <Card sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.15rem', color: colors.ink, mb: 1 }}>
                Configure Interview Session
              </Typography>
              <Typography variant="body2" sx={{ color: colors.inkSecondary, mb: 3, fontSize: '0.84375rem' }}>
                Choose a track and difficulty. The configured AI provider creates questions for that format; the technical track is additionally grounded in the exact resume you select. The interview pauses if valid questions cannot be created.
              </Typography>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, fontSize: '0.8125rem' }}>
                    Target Role
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="e.g. Machine Learning Engineer"
                    value={config.role}
                    onChange={(e) => setConfig({ ...config, role: e.target.value })}
                    inputProps={{ maxLength: 100 }}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, fontSize: '0.8125rem', color: colors.ink }}>
                    Interview Track
                  </Typography>
                  <TextField select fullWidth size="small" value={config.track} onChange={(e) => {
                    const track = e.target.value;
                    setConfig((previous) => ({
                      ...previous,
                      track,
                      interviewType: track,
                      mode: ['aptitude', 'coding'].includes(track) ? 'written' : previous.mode,
                      numQuestions: DEFAULT_QUESTION_COUNT_BY_TRACK[track],
                    }));
                    setCurrentAnswer('');
                  }}>
                    <MenuItem value="aptitude">Aptitude · Multiple choice</MenuItem>
                    <MenuItem value="coding">Coding · Problem solving</MenuItem>
                    <MenuItem value="technical">Technical Interview · Resume based</MenuItem>
                    <MenuItem value="hr">HR Interview · Behavioral</MenuItem>
                  </TextField>
                </Grid>

                {['technical', 'hr'].includes(config.track) && <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, fontSize: '0.8125rem' }}>
                    Interview Mode
                  </Typography>
                  <TextField select fullWidth size="small" value={config.mode} onChange={(e) => setConfig({ ...config, mode: e.target.value })}>
                    <MenuItem value="voice">One-on-one Voice Interview</MenuItem>
                    <MenuItem value="written">Written Practice</MenuItem>
                  </TextField>
                </Grid>}

                {config.track === 'coding' && <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, fontSize: '0.8125rem' }}>
                    Programming Language
                  </Typography>
                  <TextField select fullWidth size="small" value={config.codeLanguage} onChange={(e) => setConfig({ ...config, codeLanguage: e.target.value })}>
                    <MenuItem value="JavaScript">JavaScript</MenuItem>
                    <MenuItem value="Python">Python</MenuItem>
                    <MenuItem value="Java">Java</MenuItem>
                  </TextField>
                </Grid>}

                {config.track === 'technical' && <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, fontSize: '0.8125rem' }}>
                    Resume for Personalized Questions
                  </Typography>
                  <TextField select fullWidth size="small" value={selectedResumeId} onChange={(e) => setSelectedResumeId(e.target.value)} disabled={resumeLoading || resumeOptions.length === 0}
                    helperText={resumeLoading ? 'Loading your uploaded resumes…' : 'The AI provider will use this resume and your target role to build technical questions.'}>
                    {resumeOptions.map((resume) => {
                      const id = String(resume.id || resume._id);
                      return <MenuItem key={id} value={id}>{resume.fileName}{resume.isPrimary ? ' · Primary' : ''}</MenuItem>;
                    })}
                  </TextField>
                  {resumeLoadError && <Alert severity="error" sx={{ mt: 1 }}>{resumeLoadError}</Alert>}
                  {!resumeLoading && !resumeOptions.length && (
                    <Alert severity="info" sx={{ mt: 1 }}>Upload a readable resume in Resume Management before starting a personalized interview.</Alert>
                  )}
                </Grid>}

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, fontSize: '0.8125rem' }}>
                    Question Difficulty
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={config.difficulty}
                    onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
                  >
                    <MenuItem value="Beginner">Beginner</MenuItem>
                    <MenuItem value="Intermediate">Intermediate</MenuItem>
                    <MenuItem value="Advanced">Advanced</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, fontSize: '0.8125rem' }}>
                    Session Length
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={config.numQuestions}
                    onChange={(e) => setConfig({ ...config, numQuestions: Number(e.target.value) })}
                  >
                    {QUESTION_COUNTS_BY_TRACK[config.track].map((count) => (
                      <MenuItem key={count} value={count}>
                        {count} Questions{config.track === 'aptitude' ? ' · Multiple-choice practice' : config.track === 'coding' ? ' · Coding challenge' : ' · Interview round'}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleStartInterview}
                    disabled={startingInterview || (config.track === 'technical' && (resumeLoading || !selectedResumeId)) || !config.role.trim()}
                    startIcon={<Play size={16} />}
                    sx={{ py: 1.2, fontSize: '0.9375rem' }}
                  >
                    {startingInterview ? 'AI is preparing your interview…' : config.track === 'aptitude' ? 'Start Aptitude Practice' : config.track === 'coding' ? 'Start Coding Challenge' : config.mode === 'voice' ? 'Start Voice Interview' : 'Start Written Practice'}
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* Right Column: selected practice overview */}
          <Grid item xs={12} md={5}>
            <Card
              sx={{
                p: 3,
                borderRadius: 2,
                border: `1px dashed ${colors.border}`,
                backgroundColor: colors.surfaceSubtle,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1.5,
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.borderLight}`,
                    color: colors.inkSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.75,
                  }}
                >
                  <Video size={18} />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.05rem', color: colors.ink }}>
                    {config.track === 'aptitude' ? 'Aptitude practice' : config.track === 'coding' ? 'Coding workspace' : config.track === 'hr' ? 'HR conversation' : 'Technical interview'}
                  </Typography>
                  {config.mode === 'voice' && <Chip
                    label={speechRecognitionSupported && speechSynthesisSupported ? 'Voice ready' : 'Limited browser support'}
                    size="small" sx={{ backgroundColor: colors.borderLight, color: colors.inkSecondary, fontSize: '0.65rem', fontWeight: 600, height: 20 }}
                  />}
                </Box>

                <Typography variant="body2" sx={{ color: colors.inkSecondary, lineHeight: 1.6, fontSize: '0.84375rem', mb: 2 }}>
                  {config.track === 'aptitude' ? 'Answer AI-generated multiple-choice questions. Your selected answers are checked against the hidden answer key and reviewed with reasoning feedback.'
                    : config.track === 'coding' ? 'Solve general data-structures-and-algorithms screening problems, run sample cases in your selected language, and submit your solution for AI feedback on correctness, algorithm choices, and edge cases.'
                      : config.track === 'hr' ? 'Practice general behavioral and motivation questions for your selected role. In voice mode, the interviewer speaks and can ask an adaptive follow-up based on your answer.'
                        : 'AI builds each technical question from your selected target role and exact resume. In voice mode, the interviewer can ask an adaptive follow-up based on your answer.'}
                </Typography>

                <Typography variant="caption" sx={{ color: colors.inkTertiary, lineHeight: 1.5, display: 'block' }}>
                  {['aptitude', 'coding'].includes(config.track)
                    ? 'Questions and your submitted answers are sent to the configured AI provider for feedback. Aptitude questions use a multiple-choice answer key; code sample tests run locally in your browser.'
                    : config.mode === 'voice' && speechRecognitionSupported && speechSynthesisSupported
                      ? `Your browser speaks the questions and creates the transcript. ${config.track === 'technical' ? 'The selected resume text and your answers' : 'Your answers'} are sent to the configured AI provider for this session. Microphone permission is requested only when you start speaking.`
                      : config.mode === 'voice' ? 'Voice features are limited in this browser. Choose Written Practice, or use a supported browser. Mobile microphone recognition may require HTTPS.'
                        : 'AI reviews your written answers against this interview track and selected role.'}
                </Typography>
              </Box>

              <Box sx={{ p: 2, borderRadius: 1.5, backgroundColor: colors.surface, border: `1px solid ${colors.borderLight}`, mt: 3 }}>
                <Typography variant="caption" sx={{ color: colors.ink, fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Last Mock Session Baseline:
                </Typography>
                <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block' }}>
                  {latestEvaluation
                    ? `${latestEvaluation.overallScore}/100 (${latestEvaluation.role}, completed ${new Date(latestEvaluation.completedAt).toLocaleDateString()})`
                    : 'No completed sessions yet. Results will appear here after you finish an interview.'}
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // 2. ACTIVE FOCUSED INTERVIEW SCREEN
  if (stage === 'interview') {
    const currentQ = questions[currentIndex];
    const questionPrompt = followUpTurn ? followUpQuestion : currentQ?.question;
    const wordsCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;

    return (
      <Box sx={{ maxWidth: config.track === 'coding' ? 1440 : 860, mx: 'auto', py: 2 }}>
        {sessionError && <Alert severity="error" sx={{ mb: 2 }}>{sessionError}</Alert>}
        {/* Top Slim Status Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: colors.ink }}>
              Question {currentIndex + 1} of {questions.length}
            </Typography>
            <Chip
              label={followUpTurn ? 'AI adaptive follow-up' : currentQ?.category}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.6875rem',
                fontWeight: 600,
                backgroundColor: colors.accentLight,
                color: colors.accent,
              }}
            />
          </Box>

          {/* Timer Display */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.5,
              borderRadius: 1.5,
              backgroundColor: timeLeft < 30 ? colors.errorBg : colors.surfaceSubtle,
              border: `1px solid ${timeLeft < 30 ? colors.errorBorder : colors.borderLight}`,
              color: timeLeft < 30 ? colors.error : colors.ink,
              fontWeight: 700,
              fontSize: '0.84375rem',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <Clock size={15} />
            <span>{formatTimer(timeLeft)}</span>
          </Box>
        </Box>

        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={((currentIndex + 1) / questions.length) * 100}
          sx={{
            height: 4,
            borderRadius: 2,
            mb: 3,
            backgroundColor: colors.borderLight,
            '& .MuiLinearProgress-bar': {
              backgroundColor: colors.accent,
            },
          }}
        />

          {interviewBasis && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {interviewBasis.provider} generated this {config.track} interview for <strong>{interviewBasis.role}</strong>
            {interviewBasis.resumeName ? <> using <strong>{interviewBasis.resumeName}</strong></> : null}
            {interviewBasis.model ? ` · ${interviewBasis.model}` : ''}.
          </Alert>
        )}

        <Grid container spacing={2.5} alignItems="stretch">
        <Grid item xs={12} lg={config.track === 'coding' ? 5 : 12}>
        {/* Question Prompt Card */}
        <Card sx={{ p: { xs: 2.5, sm: 3.5 }, height: '100%', borderRadius: 2 }}>
          {config.track === 'coding' ? (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                <Box>
                  <Typography variant="overline" sx={{ color: colors.accent, fontWeight: 700, letterSpacing: '0.08em' }}>Coding challenge</Typography>
                  <Typography variant="h3" sx={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: { xs: '1.35rem', sm: '1.7rem' }, color: colors.ink, lineHeight: 1.3 }}>
                    {currentQ?.title || 'Problem'}
                  </Typography>
                </Box>
                <Chip label={config.difficulty} size="small" sx={{ backgroundColor: colors.accentLight, color: colors.accent, fontWeight: 700 }} />
              </Box>

              <Typography variant="subtitle2" sx={{ color: colors.ink, fontWeight: 700, mb: 0.75 }}>Problem statement</Typography>
              <Typography variant="body1" sx={{ color: colors.inkSecondary, lineHeight: 1.7, whiteSpace: 'pre-wrap', mb: 2.5 }}>{currentQ?.question}</Typography>

              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, height: '100%', borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}` }}>
                    <Typography variant="subtitle2" sx={{ color: colors.ink, fontWeight: 700, mb: 0.75 }}>Input format</Typography>
                    <Typography variant="body2" sx={{ color: colors.inkSecondary, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{currentQ?.inputFormat}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, height: '100%', borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}` }}>
                    <Typography variant="subtitle2" sx={{ color: colors.ink, fontWeight: 700, mb: 0.75 }}>Output format</Typography>
                    <Typography variant="body2" sx={{ color: colors.inkSecondary, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{currentQ?.outputFormat}</Typography>
                  </Box>
                </Grid>
              </Grid>

              <Typography variant="subtitle2" sx={{ color: colors.ink, fontWeight: 700, mb: 0.75 }}>Constraints</Typography>
              <Box component="ul" sx={{ mt: 0, mb: 2.5, pl: 2.5, color: colors.inkSecondary }}>
                {(currentQ?.constraints || []).map((constraint, index) => <Typography component="li" variant="body2" key={index} sx={{ mb: 0.5, lineHeight: 1.55 }}>{constraint}</Typography>)}
              </Box>

              <Typography variant="subtitle2" sx={{ color: colors.ink, fontWeight: 700, mb: 1 }}>Examples</Typography>
              <Grid container spacing={1.5}>
                {(currentQ?.examples || []).map((example, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Box sx={{ p: 2, height: '100%', borderRadius: 1.5, border: `1px solid ${colors.border}`, backgroundColor: colors.surface }}>
                      <Typography variant="caption" sx={{ color: colors.accent, fontWeight: 700, display: 'block', mb: 1 }}>Example {index + 1}</Typography>
                      <Typography variant="caption" sx={{ color: colors.inkSecondary, fontWeight: 700 }}>Input</Typography>
                      <Box component="pre" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.8rem', p: 1.25, my: 0.5, borderRadius: 1, backgroundColor: colors.surfaceSubtle }}>{example.input}</Box>
                      <Typography variant="caption" sx={{ color: colors.inkSecondary, fontWeight: 700 }}>Output</Typography>
                      <Box component="pre" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.8rem', p: 1.25, my: 0.5, borderRadius: 1, backgroundColor: colors.surfaceSubtle }}>{example.output}</Box>
                      <Typography variant="body2" sx={{ color: colors.inkSecondary, lineHeight: 1.55, mt: 1 }}><strong>Explanation:</strong> {example.explanation}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
          <Box>
              {config.mode === 'voice' && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              <Button variant="outlined" size="small" startIcon={<Volume2 size={15} />} onClick={speakCurrentQuestion} disabled={!speechSynthesisSupported}>
                {followUpTurn ? 'Repeat follow-up' : 'Repeat question'}
              </Button>
              <Typography variant="caption" sx={{ color: colors.inkSecondary, alignSelf: 'center' }}>
                {followUpTurn ? 'Based on your answer · spoken aloud' : 'Interviewer question · spoken aloud'}
              </Typography>
            </Box>
          )}
          <Typography
            variant="h3"
            sx={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700,
              fontSize: { xs: '1.2rem', sm: '1.4rem' },
              color: colors.ink,
              lineHeight: 1.4,
              mb: 1.5,
            }}
          >
            {questionPrompt}
          </Typography>

          <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block' }}>
            {followUpTurn
              ? 'Answer this follow-up with one specific detail from your reasoning or experience.'
              : 'Answer using your own reasoning and relevant examples from your experience.'}
          </Typography>
          {!followUpTurn && currentQ?.resumeEvidence && (
            <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}` }}>
              <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mb: 0.25 }}>
                Resume detail AI used to shape this question
              </Typography>
              <Typography variant="body2" sx={{ color: colors.ink, fontSize: '0.8125rem' }}>
                “{currentQ.resumeEvidence}”
              </Typography>
            </Box>
          )}
          </Box>
          )}
        </Card>

        </Grid>
        <Grid item xs={12} lg={config.track === 'coding' ? 7 : 12}>
        {/* Answer Input Card */}
        <Card sx={{ p: { xs: 2.5, sm: 3.5 }, height: '100%', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: colors.ink }}>
              {config.track === 'aptitude' ? 'Choose one answer' : config.track === 'coding' ? `Your ${config.codeLanguage} solution` : config.mode === 'voice' ? 'Your spoken response transcript' : 'Your Response'}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.inkSecondary, fontVariantNumeric: 'tabular-nums' }}>
              {config.track === 'coding' ? `${currentAnswer.length} characters` : `${wordsCount} words`} • Kept for this session
            </Typography>
          </Box>

          {config.track === 'aptitude' ? (
            <RadioGroup value={currentAnswer} onChange={(event) => setCurrentAnswer(event.target.value)}>
              {(currentQ?.options || []).map((option, index) => (
                <FormControlLabel key={index} value={String(index)} control={<Radio />} label={`${String.fromCharCode(65 + index)}. ${option}`} sx={{ m: 0, mb: 1, p: 1.25, border: `1px solid ${colors.border}`, borderRadius: 1.5, backgroundColor: currentAnswer === String(index) ? colors.accentLight : colors.surface }} />
              ))}
            </RadioGroup>
          ) : config.track === 'coding' ? (
            <Box>
              <Box sx={{ mb: 2, p: 1.5, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}` }}>
                <Typography variant="caption" sx={{ color: colors.inkSecondary, fontWeight: 700, display: 'block', mb: 0.75 }}>Run these sample tests</Typography>
                {(currentQ?.sampleTestCases || []).map((test, index) => (
                  <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.78rem', mb: 0.5 }}>
                    Case {index + 1}: input {test.input} → expected {test.expectedOutput}
                  </Typography>
                ))}
              </Box>
              <TextField multiline rows={12} fullWidth value={currentAnswer} onChange={(event) => { setCurrentAnswer(event.target.value); setTestRunSummary(''); }} spellCheck={false}
                placeholder={`Write your ${config.codeLanguage} solution here…`} inputProps={{ 'aria-label': `${config.codeLanguage} coding solution`, style: { fontFamily: 'Consolas, Monaco, monospace', fontSize: '0.875rem' } }}
                sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#171923', color: '#f4f4f5', alignItems: 'flex-start' } }} />
              <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                {config.codeLanguage === 'JavaScript' ? (
                  <>
                    <Button variant="outlined" onClick={handleRunSampleTests} disabled={testRunLoading || !currentAnswer.trim()}>
                      {testRunLoading ? 'Running…' : 'Run sample tests'}
                    </Button>
                    <Typography variant="caption" sx={{ color: colors.inkSecondary }}>JavaScript runs in a temporary browser worker (2-second limit).</Typography>
                  </>
                ) : (
                  <>
                    <Button variant="outlined" onClick={handleRunSampleTests} disabled={testRunLoading || !currentAnswer.trim()}>
                      {testRunLoading ? 'Running…' : 'Run sample tests'}
                    </Button>
                    <Typography variant="caption" sx={{ color: colors.inkSecondary }}>{config.codeLanguage} runs in an isolated Piston execution environment.</Typography>
                  </>
                )}
              </Box>
              {config.codeLanguage !== 'JavaScript' && <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mt: 1 }}>
                When you run samples, your solution and sample inputs are sent to Piston for execution. Your resume is not sent.
              </Typography>}
              {testRunSummary && <Alert severity={getTestAlertSeverity(testRunSummary)} sx={{ mt: 1.5 }}>{testRunSummary}</Alert>}
            </Box>
          ) : (
          <TextField
            multiline
            rows={8}
            fullWidth
            placeholder={config.mode === 'voice' ? 'Your spoken words will appear here after you tap Start speaking...' : 'Type your structured technical response here...'}
            value={currentAnswer}
            onChange={(e) => {
              if (config.mode !== 'voice') setCurrentAnswer(e.target.value);
            }}
            InputProps={{ readOnly: config.mode === 'voice' }}
            inputProps={{
              readOnly: config.mode === 'voice',
              'aria-label': config.mode === 'voice' ? 'Live transcript of your spoken answer' : 'Your written answer',
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                ...(config.mode === 'voice' ? { backgroundColor: colors.surfaceSubtle } : {}),
              },
            }}
          />
          )}

          {config.mode === 'voice' && (
            <Box sx={{ mt: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant={isListening ? 'contained' : 'outlined'}
                  color={isListening ? 'error' : 'primary'}
                  startIcon={isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  onClick={isListening ? stopVoiceCapture : startVoiceCapture}
                  disabled={!speechRecognitionSupported && isListening}
                >
                  {isListening ? 'Stop speaking' : 'Start speaking'}
                </Button>
                <Typography variant="caption" sx={{ color: isListening ? colors.success : colors.inkSecondary }}>
                  {isListening ? 'Listening… Your spoken words will appear above.' : 'Tap Start speaking to answer aloud.'}
                </Typography>
              </Box>
              {speechError && <Alert severity="info" sx={{ mt: 1.5 }}>{speechError}</Alert>}
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, pt: 2, borderTop: `1px solid ${colors.borderLight}` }}>
            <Button
              variant="text"
              onClick={() => {
                if (sessionError && currentIndex === 0 && !followUpTurn) {
                  setFollowUpAttempted(true);
                  setSessionError('');
                  advanceToNextQuestion({ ...answers, [currentQ?.id]: currentAnswer });
                } else {
                  handleSkipQuestion();
                }
              }}
              disabled={isListening || submitting || followUpLoading}
              sx={{ color: colors.inkSecondary, fontSize: '0.8125rem' }}
            >
              {sessionError && currentIndex === 0 && !followUpTurn ? 'Continue without follow-up' : 'Skip Question'}
            </Button>

            <Button
              variant="contained"
              onClick={handleNextQuestion}
              disabled={submitting || isListening || followUpLoading || !currentAnswer.trim()}
              endIcon={followUpTurn || currentIndex < questions.length - 1 ? <ArrowRight size={15} /> : <CheckCircle2 size={15} />}
              sx={{ px: 3, py: 0.9, fontSize: '0.84375rem' }}
            >
              {followUpLoading
                ? 'AI is preparing a follow-up…'
                : followUpTurn
                  ? 'Continue to next question'
                  : ['technical', 'hr'].includes(config.track) && currentIndex === 0 && !followUpAttempted
                    ? sessionError ? 'Retry AI follow-up' : 'Ask AI follow-up'
                      : currentIndex < questions.length - 1
                        ? 'Next Question'
                        : submitting ? 'Evaluating...' : 'Submit Session'}
            </Button>
          </Box>
        </Card>
        </Grid>
        </Grid>
      </Box>
    );
  }

  // 3. RESULTS SCREEN
  if (stage === 'results' && evaluation) {
    return (
      <Box>
        <PageHeader
          title="Mock Interview Evaluation & Critique"
          subtitle={`Completed on ${evaluation.completedAt} · ${String(evaluation.interviewType || 'technical').toUpperCase()} track · ${evaluation.role} · ${evaluation.difficulty}.`}
          action={
            <Button
              variant="contained"
              startIcon={<RotateCcw size={15} />}
              onClick={() => setStage('setup')}
              sx={{ fontSize: '0.8125rem' }}
            >
              Practice Another Drill
            </Button>
          }
        />

        {/* Overall Score Header Card */}
        <Card sx={{ p: { xs: 2.5, sm: 3.5 }, mb: 3.5, borderRadius: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <ScoreRing
                score={evaluation.overallScore}
                max={100}
                size={140}
                strokeWidth={10}
                label="Interview Score"
                tooltip={evaluation.analysisProvider !== 'Structured practice estimate' ? `${evaluation.analysisProvider} practice feedback based on your ${evaluation.mode === 'voice' ? 'spoken-answer transcript' : 'written answers'}. It is not an employer assessment.` : 'Structured practice estimate based on answer length and matching concepts. It is not an employer assessment.'}
              />
            </Grid>

            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip
                  label={evaluation.analysisProvider !== 'Structured practice estimate' ? `${evaluation.analysisProvider} feedback${evaluation.analysisModel ? ` · ${evaluation.analysisModel}` : ''}` : 'Structured practice estimate'}
                  size="small"
                  sx={{
                    backgroundColor: colors.successBg,
                    color: colors.success,
                    border: `1px solid ${colors.successBorder}`,
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label={evaluation.interviewType}
                  size="small"
                  sx={{
                    backgroundColor: colors.surfaceSubtle,
                    color: colors.inkSecondary,
                    border: `1px solid ${colors.border}`,
                  }}
                />
                <Chip
                  label={evaluation.mode === 'voice' ? 'Voice interview' : 'Written practice'}
                  size="small"
                  sx={{ backgroundColor: colors.surfaceSubtle, color: colors.inkSecondary, border: `1px solid ${colors.border}` }}
                />
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.25rem', color: colors.ink, mb: 1 }}>
                Evaluator Summary
              </Typography>
              <Typography variant="body2" sx={{ color: colors.inkSecondary, lineHeight: 1.6, fontSize: '0.875rem' }}>
                {evaluation.summary}
              </Typography>
            </Grid>
          </Grid>
        </Card>

        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: { xs: 2.5, sm: 3 }, height: '100%', borderRadius: 2, borderTop: `4px solid ${colors.success}` }}>
              <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1rem', color: colors.success, mb: 1.5 }}>
                What went well
              </Typography>
              {(evaluation.positives || []).map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1.25, alignItems: 'flex-start' }}>
                  <CheckCircle2 size={16} color={colors.success} style={{ marginTop: 2, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: colors.inkSecondary, lineHeight: 1.55 }}>{item}</Typography>
                </Box>
              ))}
              {!evaluation.positives?.length && <Typography variant="body2" color="text.secondary">See the question feedback below for demonstrated strengths.</Typography>}
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: { xs: 2.5, sm: 3 }, height: '100%', borderRadius: 2, borderTop: `4px solid ${colors.warning}` }}>
              <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1rem', color: colors.warning, mb: 1.5 }}>
                Areas to improve
              </Typography>
              {(evaluation.improvementAreas || []).map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1.25, alignItems: 'flex-start' }}>
                  <AlertCircle size={16} color={colors.warning} style={{ marginTop: 2, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: colors.inkSecondary, lineHeight: 1.55 }}>{item}</Typography>
                </Box>
              ))}
              {!evaluation.improvementAreas?.length && <Typography variant="body2" color="text.secondary">See the question feedback below for specific gaps.</Typography>}
            </Card>
          </Grid>
          {evaluation.dimensionScores && (
            <Grid item xs={12}>
              <Card sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1rem', color: colors.ink, mb: 2 }}>Score breakdown</Typography>
                <Typography variant="caption" sx={{ display: 'block', color: colors.inkSecondary, mb: 2 }}>
                  {evaluation.interviewType === 'aptitude'
                    ? 'The aptitude score is calculated directly from the AI-generated answer keys; it does not use subjective AI marks.'
                    : `${evaluation.analysisProvider} based these practice ratings on your answers to this session’s questions. They are coaching feedback, not an employer assessment.`}
                </Typography>
                <Grid container spacing={2}>
                  {(evaluation.interviewType === 'aptitude' ? [
                    ['Answer-key accuracy', evaluation.dimensionScores.technicalAccuracy],
                    ['Questions answered', evaluation.dimensionScores.completeness],
                  ] : [
                    [evaluation.interviewType === 'coding' ? 'Code correctness' : evaluation.interviewType === 'hr' ? 'Answer quality' : 'Technical accuracy', evaluation.dimensionScores.technicalAccuracy],
                    [evaluation.interviewType === 'coding' ? 'Problem solving' : 'Relevance', evaluation.dimensionScores.relevance],
                    ['Clarity', evaluation.dimensionScores.clarity],
                    ['Completeness', evaluation.dimensionScores.completeness],
                  ]).map(([label, value]) => (
                    <Grid item xs={12} sm={6} md={3} key={label}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography variant="body2" sx={{ color: colors.inkSecondary }}>{label}</Typography>
                        <Typography variant="body2" sx={{ color: colors.ink, fontWeight: 700 }}>{value}/100</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={Number(value) || 0} sx={{ height: 7, borderRadius: 5 }} />
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>
          )}
          {!!evaluation.nextSteps?.length && (
            <Grid item xs={12}>
              <Card sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 2, backgroundColor: colors.surfaceSubtle }}>
                <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '1rem', color: colors.ink, mb: 1.5 }}>Your practice plan</Typography>
                {evaluation.nextSteps.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'flex-start' }}>
                    <Chip label={index + 1} size="small" sx={{ height: 22, minWidth: 22, fontWeight: 700 }} />
                    <Typography variant="body2" sx={{ color: colors.inkSecondary, lineHeight: 1.55, pt: 0.25 }}>{item}</Typography>
                  </Box>
                ))}
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Per-Question Detailed Feedback Cards */}
        <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.15rem', color: colors.ink, mb: 2 }}>
          Question-by-Question Diagnostic Feedback
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {evaluation.questionsFeedback.map((item, idx) => (
            <Card key={idx} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box sx={{ maxWidth: '80%' }}>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                    Question {idx + 1}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '0.96875rem', color: colors.ink, mt: 0.25 }}>
                    {item.question}
                  </Typography>
                  {item.followUpQuestion && (
                    <Typography variant="body2" sx={{ color: colors.accent, fontSize: '0.8125rem', mt: 1 }}>
                      AI follow-up: {item.followUpQuestion}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: item.score >= 75 ? colors.success : colors.warning,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {item.score}/100
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                    Clarity: {item.clarity}%
                  </Typography>
                </Box>
              </Box>

              {/* User Answer Box */}
              <Box sx={{ p: 2, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}`, mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: colors.inkSecondary, textTransform: 'uppercase', letterSpacing: '0.02em', display: 'block', mb: 0.5 }}>
                  Your Submitted Answer:
                </Typography>
                <Typography variant="body2" sx={{ color: colors.ink, fontSize: '0.84375rem', lineHeight: 1.6 }}>
                  "{item.userAnswer}"
                </Typography>
                {item.correctAnswer && (
                  <Typography variant="body2" sx={{ mt: 1, fontSize: '0.8125rem', color: item.answerCorrect ? colors.success : colors.warning, fontWeight: 600 }}>
                    {item.answerCorrect ? 'Correct answer.' : `Correct answer: ${item.correctAnswer}`}
                  </Typography>
                )}
                {item.answerExplanation && <Typography variant="body2" sx={{ mt: 0.75, fontSize: '0.8125rem', color: colors.inkSecondary }}>Reasoning: {item.answerExplanation}</Typography>}
              </Box>

              {/* Critique */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.02em', display: 'block', mb: 0.5 }}>
                  Feedback:
                </Typography>
                <Typography variant="body2" sx={{ color: colors.inkSecondary, fontSize: '0.84375rem', lineHeight: 1.55 }}>
                  {item.critique}
                </Typography>
              </Box>

              {item.scoreRationale && (
                <Box sx={{ mb: 2, p: 1.5, borderRadius: 1.5, backgroundColor: colors.accentLight, border: `1px solid ${colors.accentBorder}` }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: colors.accent, display: 'block', mb: 0.35 }}>
                    Why {evaluation.analysisProvider} gave this score
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.inkSecondary, fontSize: '0.8125rem', lineHeight: 1.55 }}>
                    {item.scoreRationale}
                  </Typography>
                </Box>
              )}

              {/* Covered vs Missed Points */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: colors.successBg, border: `1px solid ${colors.successBorder}` }}>
                    <Typography variant="caption" sx={{ color: colors.success, fontWeight: 700, display: 'block', mb: 0.75 }}>
                      Key Points Covered
                    </Typography>
                    {item.keyPointsCovered.map((pt, pIdx) => (
                      <Box key={pIdx} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                        <CheckCircle2 size={13} color={colors.success} />
                        <Typography variant="caption" sx={{ color: colors.ink, fontSize: '0.75rem' }}>
                          {pt}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: colors.warningBg, border: `1px solid ${colors.warningBorder}` }}>
                    <Typography variant="caption" sx={{ color: colors.warning, fontWeight: 700, display: 'block', mb: 0.75 }}>
                      Missing Nuances / Enhancements
                    </Typography>
                    {item.keyPointsMissed.map((pt, pIdx) => (
                      <Box key={pIdx} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                        <AlertCircle size={13} color={colors.warning} />
                        <Typography variant="caption" sx={{ color: colors.ink, fontSize: '0.75rem' }}>
                          {pt}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Card>
          ))}
        </Box>
      </Box>
    );
  }

  return null;
};

export default MockInterviewPage;
