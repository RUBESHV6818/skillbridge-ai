const User = require('../models/User');
const Resume = require('../models/Resume');
const Application = require('../models/Application');
const InterviewSession = require('../models/InterviewSession');
const MentorReview = require('../models/MentorReview');
const { createNotification } = require('../services/notificationService');

exports.getAssignedStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student', assignedMentor: req.user._id }).select('name email department cgpa batchYear targetRole targetRoleConfirmed').sort({ name: 1 });
    const ids = students.map((student) => student._id);
    const [resumes, applications, sessions, reviews] = ids.length ? await Promise.all([
      Resume.find({ user: { $in: ids } }).select('user aiResumeIntelligence uploadedAt').sort({ isPrimary: -1, uploadedAt: -1 }),
      Application.find({ user: { $in: ids } }).select('user company role status updatedAt').sort({ updatedAt: -1 }),
      InterviewSession.find({ user: { $in: ids }, completedAt: { $ne: null } }).select('user evaluation completedAt').sort({ completedAt: -1 }),
      MentorReview.find({ student: { $in: ids }, status: 'pending' }).select('student'),
    ]) : [[], [], [], []];
    const latest = (records) => { const map = new Map(); records.forEach((record) => { const key = record.user?.toString() || record.student?.toString(); if (!map.has(key)) map.set(key, record); }); return map; };
    const resumeByStudent = latest(resumes);
    const appByStudent = latest(applications);
    const interviewByStudent = latest(sessions);
    const pendingByStudent = new Map();
    reviews.forEach(({ student }) => pendingByStudent.set(student.toString(), (pendingByStudent.get(student.toString()) || 0) + 1));
    res.json(students.map((student) => {
      const id = student._id.toString();
      const resume = resumeByStudent.get(id);
      const application = appByStudent.get(id);
      const interview = interviewByStudent.get(id);
      const resumeReview = resume?.aiResumeIntelligence?.result;
      const targetRole = student.targetRoleConfirmed ? String(student.targetRole || '').trim() : '';
      const resumeReviewScore = resumeReview?.targetRole === targetRole
        && Number.isFinite(resumeReview?.overallScore) ? resumeReview.overallScore : null;
      return { id, name: student.name, email: student.email, department: student.department || 'Unspecified', cgpa: student.cgpa ?? null,
        resumeReviewScore,
        interviewScore: Number.isFinite(interview?.evaluation?.overallScore) ? interview.evaluation.overallScore : null,
        activeApplication: application ? `${application.company} — ${application.role} (${application.status})` : 'No application recorded',
        pendingReviews: pendingByStudent.get(id) || 0, lastActive: [resume?.uploadedAt, interview?.completedAt, application?.updatedAt].filter(Boolean).sort((a, b) => b - a)[0] || null };
    }));
  } catch (err) { next(err); }
};

function reviewJSON(review) {
  return { id: review._id.toString(), studentId: review.student._id?.toString() || review.student.toString(), studentName: review.student.name || '', email: review.student.email || '', department: review.student.department || '',
    title: review.title, section: review.section, submissionType: 'Resume suggestion', submittedAt: review.createdAt, before: review.before, content: review.suggestion, rationale: review.rationale,
    status: review.status, mentorComment: review.feedbackComment, targetCompany: 'Resume review' };
}

exports.getReviewQueue = async (req, res, next) => {
  try {
    const reviews = await MentorReview.find({ mentor: req.user._id }).populate('student', 'name email department').sort({ createdAt: -1 }).limit(200);
    res.json(reviews.map(reviewJSON));
  } catch (err) { next(err); }
};

exports.requestReview = async (req, res, next) => {
  try {
    const student = await User.findById(req.user._id).select('assignedMentor');
    if (!student?.assignedMentor) return res.status(409).json({ message: 'Ask your placement coordinator to assign a mentor before requesting feedback.' });
    const { title, section, before, suggestion, rationale, resumeId, sourceSuggestionId } = req.body;
    if (![title, before, suggestion].every((value) => typeof value === 'string' && value.trim())) return res.status(400).json({ message: 'Title, current wording, and suggested wording are required.' });
    let resume = null;
    if (resumeId) {
      resume = await Resume.findOne({ _id: resumeId, user: req.user._id }).select('_id');
      if (!resume) return res.status(404).json({ message: 'Resume not found.' });
    }
    if (sourceSuggestionId) {
      const existing = await MentorReview.findOne({ student: req.user._id, sourceSuggestionId: String(sourceSuggestionId).slice(0, 100), status: 'pending' }).select('_id status createdAt');
      if (existing) return res.status(200).json({ id: existing._id.toString(), status: existing.status, createdAt: existing.createdAt });
    }
    const review = await MentorReview.create({ student: req.user._id, mentor: student.assignedMentor, resume: resume?._id || null,
      title: title.trim().slice(0, 160), sourceSuggestionId: String(sourceSuggestionId || '').slice(0, 100), section: String(section || 'Resume').trim().slice(0, 100), before: before.trim(), suggestion: suggestion.trim(), rationale: String(rationale || '').trim() });
    res.status(201).json({ id: review._id.toString(), status: review.status, createdAt: review.createdAt });
  } catch (err) { next(err); }
};

exports.getStudentReviews = async (req, res, next) => {
  try {
    const reviews = await MentorReview.find({ student: req.user._id }).populate('mentor', 'name email').sort({ createdAt: -1 }).limit(100);
    res.json(reviews.map((review) => ({ id: review._id.toString(), sourceSuggestionId: review.sourceSuggestionId, title: review.title, section: review.section, status: review.status, feedbackComment: review.feedbackComment, mentor: review.mentor?.name || '', createdAt: review.createdAt, reviewedAt: review.reviewedAt })));
  } catch (err) { next(err); }
};

exports.respondToReview = async (req, res, next) => {
  try {
    const { feedbackComment, status } = req.body;
    if (!['approved', 'needs_changes'].includes(status) || typeof feedbackComment !== 'string' || !feedbackComment.trim()) return res.status(400).json({ message: 'Choose a decision and provide feedback.' });
    const review = await MentorReview.findOne({ _id: req.params.reviewId, mentor: req.user._id }).populate('student', 'name');
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    if (review.status !== 'pending') return res.status(409).json({ message: 'This review has already been answered.' });
    review.status = status;
    review.feedbackComment = feedbackComment.trim().slice(0, 2000);
    review.reviewedAt = new Date();
    await review.save();
    await createNotification(review.student._id, { title: 'Mentor feedback received', message: `Your mentor reviewed “${review.title}”.`, category: 'mentor', type: 'system' });
    res.json(reviewJSON(review));
  } catch (err) { next(err); }
};
