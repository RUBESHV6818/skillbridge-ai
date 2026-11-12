const crypto = require('crypto');
const Resume = require('../models/Resume');
const Application = require('../models/Application');
const InterviewSession = require('../models/InterviewSession');
const PlatformSettings = require('../models/PlatformSettings');

const STATUS_LABELS = {
  wishlist: 'Wishlist',
  applied: 'Applied',
  oa: 'Online Assessment',
  interview: 'Interview',
  offer: 'Offer Received',
  rejected: 'Archived',
};

exports.generateCareerReport = async (req, res, next) => {
  try {
    const [resume, applications, interview, platformSettings] = await Promise.all([
      Resume.findOne({ user: req.user._id }).sort({ isPrimary: -1, uploadedAt: -1 }),
      Application.find({ user: req.user._id }).sort({ updatedAt: -1, createdAt: -1 }),
      InterviewSession.findOne({ user: req.user._id, completedAt: { $ne: null } }).sort({ completedAt: -1 }),
      PlatformSettings.findOne({ key: 'global' }).select('compositeWeights institutionName placementSeasonYear'),
    ]);

    const targetRole = req.user.targetRoleConfirmed ? String(req.user.targetRole || '').trim() : '';
    const savedRoleAnalysis = resume?.aiRoleAnalysis?.targetRole === targetRole
      ? resume.aiRoleAnalysis.result
      : null;
    const skillAnalysis = savedRoleAnalysis;
    const skillCategories = Array.isArray(skillAnalysis?.skillsCategorized)
      ? skillAnalysis.skillsCategorized
      : [];
    const detectedSkills = skillCategories.flatMap((category) =>
      (Array.isArray(category.have) ? category.have : [])
        .map((skill) => skill?.name)
        .filter(Boolean));
    const identifiedGaps = skillCategories.flatMap((category) =>
      (Array.isArray(category.missing) ? category.missing : [])
        .map((skill) => skill?.name)
        .filter(Boolean));

    const resumeReview = resume?.aiResumeIntelligence?.result;
    const resumeReviewMatchesRole = resumeReview?.targetRole === targetRole;
    const resumeReviewScore = resumeReviewMatchesRole && Number.isFinite(resumeReview?.overallScore)
      ? resumeReview.overallScore
      : null;
    const interviewScore = Number.isFinite(interview?.evaluation?.overallScore)
      ? interview.evaluation.overallScore
      : null;
    const skillMatchScore = skillAnalysis?.resumeSkillCoverage ?? null;
    const weights = platformSettings?.compositeWeights || { resumeScoreWeight: 40, mockInterviewWeight: 35, skillAlignmentWeight: 25 };
    const availableScores = [
      [resumeReviewScore, weights.resumeScoreWeight],
      [interviewScore, weights.mockInterviewWeight],
      [skillMatchScore, weights.skillAlignmentWeight],
    ].filter(([score, weight]) => Number.isFinite(score) && Number.isFinite(weight) && weight > 0);
    const compositeWeight = availableScores.reduce((sum, [, weight]) => sum + weight, 0);
    const compositeScore = compositeWeight
      ? Math.round(availableScores.reduce((sum, [score, weight]) => sum + score * weight, 0) / compositeWeight)
      : null;

    const appResponse = (application) => ({
      company: application.company,
      role: application.role,
      package: application.package || 'Not provided',
      status: STATUS_LABELS[application.status] || application.status,
    });

    res.json({
      reportId: `SB-${crypto.randomUUID()}`,
      generatedAt: new Date().toLocaleString(),
      institution: platformSettings?.institutionName || req.user.college || 'Not provided',
      placementSeasonYear: platformSettings?.placementSeasonYear || 'Not set',
      department: req.user.department || 'Not provided',
      student: {
        name: req.user.name || 'Not provided',
        rollNo: req.user.rollNo || 'Not provided',
        email: req.user.email || 'Not provided',
        cgpa: req.user.cgpa ? `${req.user.cgpa} / 10.0` : 'Not provided',
        batch: req.user.batchYear ? String(req.user.batchYear) : 'Not provided',
        targetRole: targetRole || 'Not provided',
      },
      readinessSummary: {
        compositeScore,
        cohortPercentile: null,
        qualificationStatus: 'Placement eligibility rules are not configured. Confirm requirements with your placement office.',
        mentorAssigned: req.user.mentorName || null,
      },
      scores: {
        resumeReviewScore,
        interviewScore,
        skillMatchScore,
      },
      analysisSources: {
        resumeReview: resumeReviewMatchesRole ? resumeReview?.analysisProvider || null : null,
        skillGap: skillAnalysis?.analysisProvider || (skillAnalysis ? 'AI role analysis' : null),
        interview: interview?.evaluation?.analysisProvider || null,
      },
      resumeFileName: resume?.fileName || null,
      detectedSkills,
      identifiedGaps,
      careerSummary: skillAnalysis?.summary || (targetRole
        ? 'Run Skill Gap Analyzer for this target role to add its saved AI findings here.'
        : 'Choose and confirm a target role, then run Skill Gap Analyzer to create a role-specific summary.'),
      priorityActions: (skillAnalysis?.priorityActions || []).slice(0, 5),
      placementOffers: applications.filter((application) => application.status === 'offer').map(appResponse),
      activePipelines: applications
        .filter((application) => ['wishlist', 'applied', 'oa', 'interview'].includes(application.status))
        .map((application) => ({ ...appResponse(application), stage: STATUS_LABELS[application.status] })),
      interviewSummary: interviewScore !== null
        ? `Latest ${interview.config?.role || 'role'} mock interview completed ${new Date(interview.completedAt).toLocaleDateString()} · ${interviewScore}/100. ${interview.evaluation?.summary || ''}`.trim()
        : 'No completed mock interview with saved scoring data is available yet.',
    });
  } catch (err) {
    next(err);
  }
};
