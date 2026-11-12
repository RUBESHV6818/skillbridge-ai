const Resume = require('../models/Resume');
const Application = require('../models/Application');
const InterviewSession = require('../models/InterviewSession');
const PlatformSettings = require('../models/PlatformSettings');
const ReadinessSnapshot = require('../models/ReadinessSnapshot');

const STATUS_LABELS = {
  wishlist: 'Wishlist', applied: 'Applied', oa: 'Online Assessment',
  interview: 'Interview', offer: 'Offer Received', rejected: 'Archived',
};

exports.getDashboard = async (req, res, next) => {
  try {
    const [resumes, applications, interview, platformSettings] = await Promise.all([
      Resume.find({ user: req.user._id }).sort({ isPrimary: -1, uploadedAt: -1 }),
      Application.find({ user: req.user._id }).sort({ updatedAt: -1, createdAt: -1 }),
      InterviewSession.findOne({ user: req.user._id, completedAt: { $ne: null } }).sort({ completedAt: -1 }),
      PlatformSettings.findOne({ key: 'global' }).select('compositeWeights'),
    ]);
    const primaryResume = resumes.find((resume) => resume.isPrimary) || resumes[0] || null;
    const targetRole = req.user.targetRoleConfirmed ? String(req.user.targetRole || '').trim() : '';
    const skillAnalysis = primaryResume?.aiRoleAnalysis?.targetRole === targetRole
      ? primaryResume.aiRoleAnalysis.result
      : null;
    const resumeReview = primaryResume?.aiResumeIntelligence?.result;
    const resumeReviewMatchesRole = resumeReview?.targetRole === targetRole;
    const weights = platformSettings?.compositeWeights || { resumeScoreWeight: 40, mockInterviewWeight: 35, skillAlignmentWeight: 25 };
    const scores = {
      resumeScore: resumeReviewMatchesRole && Number.isFinite(resumeReview?.overallScore) ? resumeReview.overallScore : null,
      interviewScore: Number.isFinite(interview?.evaluation?.overallScore) ? interview.evaluation.overallScore : null,
      skillScore: skillAnalysis?.resumeSkillCoverage ?? null,
      resumeWeight: weights.resumeScoreWeight,
      interviewWeight: weights.mockInterviewWeight,
      skillWeight: weights.skillAlignmentWeight,
    };
    const weighted = [
      [scores.resumeScore, scores.resumeWeight],
      [scores.interviewScore, scores.interviewWeight],
      [scores.skillScore, scores.skillWeight],
    ].filter(([score, weight]) => Number.isFinite(score) && Number.isFinite(weight) && weight > 0);
    const healthScore = weighted.length
      ? Math.round(weighted.reduce((sum, [score, weight]) => sum + score * weight, 0) / weighted.reduce((sum, [, weight]) => sum + weight, 0))
      : null;

    let progressTimeline = [];
    if (healthScore !== null) {
      const today = new Date().toISOString().slice(0, 10);
      const cutoff = new Date();
      cutoff.setUTCDate(cutoff.getUTCDate() - 90);
      try {
        await ReadinessSnapshot.findOneAndUpdate(
          { user: req.user._id, targetRole, snapshotDate: today },
          {
            $set: {
              healthScore,
              resumeScore: scores.resumeScore,
              interviewScore: scores.interviewScore,
              skillScore: scores.skillScore,
            },
            $setOnInsert: { user: req.user._id, targetRole, snapshotDate: today },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );

        const snapshots = await ReadinessSnapshot.find({
          user: req.user._id,
          targetRole,
          snapshotDate: { $gte: cutoff.toISOString().slice(0, 10) },
        }).sort({ snapshotDate: -1 }).lean();

        // Keep the latest saved snapshot in each week, then show the chart chronologically.
        const latestByWeek = new Map();
        snapshots.forEach((snapshot) => {
          const date = new Date(`${snapshot.snapshotDate}T00:00:00.000Z`);
          date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
          const weekStart = date.toISOString().slice(0, 10);
          if (!latestByWeek.has(weekStart)) {
            latestByWeek.set(weekStart, {
              week: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
              overall: snapshot.healthScore,
              resume: snapshot.resumeScore,
              interview: snapshot.interviewScore,
            });
          }
        });
        progressTimeline = [...latestByWeek.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([, point]) => point);
      } catch (snapshotError) {
        // A history-storage issue should not prevent the dashboard's current scores from loading.
        console.warn('Could not save or load dashboard readiness history:', snapshotError.message);
      }
    }
    const nextActions = [];
    if (!primaryResume) nextActions.push({ id: 'upload-resume', title: 'Add a resume for review', description: 'Upload a PDF or DOCX so SkillBridge can analyze the extracted resume text.', category: 'Resume', priority: 'high', estTime: '5 mins', actionUrl: '/resumes', actionText: 'Upload resume' });
    else if (!resumeReviewMatchesRole || !resumeReview) nextActions.push({ id: 'review-resume', title: 'Generate an AI resume review', description: `Your primary resume is ${primaryResume.fileName}. Run its AI review to refresh your resume score.`, category: 'Resume', priority: 'high', estTime: '5 mins', actionUrl: '/resume-intelligence', actionText: 'Review resume' });
    if (!targetRole) nextActions.push({ id: 'set-target-role', title: 'Choose a target role', description: 'Save the role you want so role alignment and roadmap suggestions are relevant.', category: 'Profile', priority: 'high', estTime: '2 mins', actionUrl: '/profile', actionText: 'Set target role' });
    else if (primaryResume && !skillAnalysis) nextActions.push({ id: 'analyze-role', title: `Analyze your resume for ${targetRole}`, description: 'Create a role-specific AI skill-gap analysis for the dashboard.', category: 'Skill Gap', priority: 'high', estTime: '2 mins', actionUrl: '/skill-gap', actionText: 'Analyze role fit' });
    else if (skillAnalysis?.priorityActions?.length) nextActions.push({ id: 'close-skill-gap', title: skillAnalysis.priorityActions[0].title, description: skillAnalysis.priorityActions[0].reason || 'Work on the highest-priority gap in your role analysis.', category: 'Learning Roadmap', priority: 'medium', estTime: '30 mins', actionUrl: '/learning-roadmap', actionText: 'Open roadmap' });
    if (!interview) nextActions.push({ id: 'practice-interview', title: 'Try a written interview drill', description: 'Practice questions for your role and review your saved interview feedback.', category: 'Practice', priority: 'medium', estTime: '15 mins', actionUrl: '/mock-interview', actionText: 'Start a drill' });
    if (!applications.length) nextActions.push({ id: 'track-application', title: 'Track your first application', description: 'Keep application stages and notes together in your placement tracker.', category: 'Applications', priority: 'medium', estTime: '2 mins', actionUrl: '/placement-tracker', actionText: 'Open tracker' });

    res.json({
      healthScore,
      healthBreakdown: scores,
      targetRole: targetRole || null,
      analysisSources: {
        resumeReview: resumeReviewMatchesRole ? resumeReview?.analysisProvider || null : null,
        skillGap: skillAnalysis?.analysisProvider || null,
        interview: interview?.evaluation?.analysisProvider || null,
      },
      hasResume: Boolean(primaryResume),
      primaryResumeName: primaryResume?.fileName || null,
      latestInterviewAt: interview?.completedAt || null,
      stats: {
        appliedJobs: applications.filter((item) => item.status === 'applied').length,
        assessments: applications.filter((item) => item.status === 'oa').length,
        interviewsScheduled: applications.filter((item) => item.status === 'interview').length,
        offersCount: applications.filter((item) => item.status === 'offer').length,
      },
      progressTimeline,
      nextActions,
      recentApplications: applications.slice(0, 5).map((item) => ({
        id: item._id.toString(), company: item.company, role: item.role,
        package: item.package || 'Not provided', appliedDate: item.appliedDate,
        status: item.status, nextStep: `Current stage: ${STATUS_LABELS[item.status] || item.status}`,
      })),
    });
  } catch (err) { next(err); }
};
