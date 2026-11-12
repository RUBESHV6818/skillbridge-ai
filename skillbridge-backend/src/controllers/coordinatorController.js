const User = require('../models/User');
const Resume = require('../models/Resume');
const Application = require('../models/Application');
const InterviewSession = require('../models/InterviewSession');

function readinessScore(scores) {
  const values = [[scores.resumeReviewScore, 40], [scores.interviewScore, 35]].filter(([score]) => Number.isFinite(score));
  return values.length
    ? Math.round(values.reduce((total, [score, weight]) => total + score * weight, 0) / values.reduce((total, [, weight]) => total + weight, 0))
    : null;
}

function relativeActivity(date) {
  if (!date) return 'No recorded activity';
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function normalizeDepartment(value) {
  const department = String(value || '').trim();
  if (/\b(cse|computer science)\b/i.test(department)) return 'CSE';
  if (/\b(it|information technology)\b/i.test(department)) return 'IT';
  if (/\b(ece|electronics)\b/i.test(department)) return 'ECE';
  return department || 'Unspecified';
}

exports.getCohortStudents = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'student', verified: true }).select('name email department cgpa batchYear createdAt assignedMentor targetRole targetRoleConfirmed').populate('assignedMentor', 'name').sort({ name: 1 }).limit(5000);
    const ids = users.map((user) => user._id);
    const [resumes, applications, sessions] = ids.length ? await Promise.all([
      Resume.find({ user: { $in: ids } }).select('user fileName aiResumeIntelligence isPrimary uploadedAt').sort({ isPrimary: -1, uploadedAt: -1 }),
      Application.find({ user: { $in: ids } }).select('user company role package status appliedDate updatedAt').sort({ updatedAt: -1 }),
      InterviewSession.find({ user: { $in: ids }, completedAt: { $ne: null } }).select('user evaluation completedAt').sort({ completedAt: -1 }),
    ]) : [[], [], []];

    const resumeByUser = new Map();
    resumes.forEach((resume) => {
      const key = resume.user.toString();
      if (!resumeByUser.has(key)) resumeByUser.set(key, resume);
    });
    const latestSessionByUser = new Map();
    sessions.forEach((session) => {
      const key = session.user.toString();
      if (!latestSessionByUser.has(key)) latestSessionByUser.set(key, session);
    });
    const appsByUser = new Map();
    applications.forEach((application) => {
      const key = application.user.toString();
      if (!appsByUser.has(key)) appsByUser.set(key, []);
      appsByUser.get(key).push(application);
    });

    res.json(users.map((user) => {
      const id = user._id.toString();
      const resume = resumeByUser.get(id);
      const session = latestSessionByUser.get(id);
      const userApplications = appsByUser.get(id) || [];
      const resumeReview = resume?.aiResumeIntelligence?.result;
      const targetRole = user.targetRoleConfirmed ? String(user.targetRole || '').trim() : '';
      const resumeReviewScore = resumeReview?.targetRole === targetRole
        && Number.isFinite(resumeReview?.overallScore) ? resumeReview.overallScore : null;
      const scores = {
        resumeReviewScore,
        interviewScore: Number.isFinite(session?.evaluation?.overallScore) ? session.evaluation.overallScore : null,
      };
      const readiness = readinessScore(scores);
      const pipelineApp = userApplications.find((item) => !['wishlist', 'rejected'].includes(item.status));
      let status = 'applied';
      let statusLabel = userApplications.length ? 'Application tracked' : 'No application tracked';
      if (userApplications.some((item) => item.status === 'offer')) {
        status = 'offer';
        const offer = userApplications.find((item) => item.status === 'offer');
        statusLabel = `Offer recorded (${offer.company})`;
      } else if (userApplications.some((item) => item.status === 'interview')) {
        status = 'interviewing';
        const current = userApplications.find((item) => item.status === 'interview');
        statusLabel = `Interview stage (${current.company})`;
      } else if (readiness !== null && readiness < 60) {
        status = 'action_required';
        statusLabel = 'Review readiness signals';
      }
      const activityDates = [resume?.uploadedAt, session?.completedAt, ...userApplications.map((item) => item.updatedAt || item.appliedDate)].filter(Boolean).map((date) => new Date(date));
      const lastActivity = activityDates.sort((a, b) => b - a)[0];
      return {
        id,
        name: user.name,
        email: user.email,
        rollNo: '',
        department: normalizeDepartment(user.department),
        cgpa: user.cgpa ?? '—',
        readinessScore: readiness,
        resumeReviewScore: scores.resumeReviewScore,
        interviewScore: scores.interviewScore,
        status,
        statusLabel,
        lastActive: relativeActivity(lastActivity),
        activeApplication: pipelineApp ? `${pipelineApp.company} — ${pipelineApp.role} (${pipelineApp.status})` : 'No active application recorded',
        mentor: user.assignedMentor?.name || 'Not assigned',
        mentorId: user.assignedMentor?._id?.toString() || null,
      };
    }));
  } catch (err) { next(err); }
};

exports.getMentors = async (req, res, next) => {
  try {
    const mentors = await User.find({ role: 'mentor', status: 'active', verified: true }).select('name email department').sort({ name: 1 });
    res.json(mentors.map((mentor) => ({ id: mentor._id.toString(), name: mentor.name, email: mentor.email, department: mentor.department })));
  } catch (err) { next(err); }
};

exports.assignMentor = async (req, res, next) => {
  try {
    const { mentorId } = req.body;
    if (mentorId && !/^[a-f\d]{24}$/i.test(mentorId)) return res.status(400).json({ message: 'Choose a valid mentor.' });
    const student = await User.findOne({ _id: req.params.studentId, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    if (mentorId) {
      const mentor = await User.findOne({ _id: mentorId, role: 'mentor', status: 'active', verified: true });
      if (!mentor) return res.status(404).json({ message: 'Active, verified mentor not found.' });
      student.assignedMentor = mentor._id;
    } else {
      student.assignedMentor = null;
    }
    await student.save();
    const updated = await student.populate('assignedMentor', 'name');
    res.json({ id: student._id.toString(), mentorId: updated.assignedMentor?._id?.toString() || null, mentor: updated.assignedMentor?.name || 'Not assigned' });
  } catch (err) { next(err); }
};

function packageLpa(value) {
  const match = String(value || '').match(/(\d+(?:\.\d+)?)\s*(?:lpa|lakh|lakhs|lac|l)/i);
  return match ? Number(match[1]) : null;
}

exports.getPlacementAnalytics = async (req, res, next) => {
  try {
    const studentIds = await User.find({ role: 'student', verified: true }).distinct('_id');
    const offers = studentIds.length ? await Application.find({ user: { $in: studentIds }, status: 'offer' }).select('user company package isCampus') : [];
    const placedIds = new Set(offers.map((offer) => offer.user.toString()));
    const priced = offers.map((offer) => packageLpa(offer.package)).filter(Number.isFinite);
    const average = priced.length ? priced.reduce((sum, value) => sum + value, 0) / priced.length : null;
    const highest = priced.length ? Math.max(...priced) : null;
    const bands = [
      { band: 'Below ₹5 LPA', count: 0 },
      { band: '₹5 – 7 LPA', count: 0 },
      { band: '₹7 – 10 LPA', count: 0 },
      { band: 'Above ₹10 LPA', count: 0 },
    ];
    priced.forEach((value) => {
      if (value < 5) bands[0].count += 1;
      else if (value < 7) bands[1].count += 1;
      else if (value <= 10) bands[2].count += 1;
      else bands[3].count += 1;
    });
    const byCompany = new Map();
    offers.forEach((offer) => byCompany.set(offer.company, (byCompany.get(offer.company) || 0) + 1));
    const campusOffers = offers.filter((offer) => offer.isCampus).length;
    const offCampusOffers = offers.length - campusOffers;
    const totalStudents = studentIds.length;
    const placedCount = placedIds.size;
    res.json({
      totalRegistered: totalStudents,
      placedCount,
      placementRate: totalStudents ? Math.round((placedCount / totalStudents) * 1000) / 10 : 0,
      averagePackage: average === null ? '—' : `₹${average.toFixed(1)} LPA`,
      highestPackage: highest === null ? '—' : `₹${highest.toFixed(1)} LPA`,
      companyDistribution: [...byCompany].map(([name, count]) => ({ name, offers: count })).sort((a, b) => b.offers - a.offers).slice(0, 8),
      salaryBands: bands,
      channelSplit: [
        { name: 'On-Campus Drives', value: campusOffers },
        { name: 'Off-Campus / Direct', value: offCampusOffers },
      ],
      pricedOfferCount: priced.length,
    });
  } catch (err) { next(err); }
};
