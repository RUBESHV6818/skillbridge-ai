import api, { USE_MOCK, mockDelay } from './api';

export const MOCK_DASHBOARD_DATA = {
  healthScore: 74,
  healthBreakdown: {
    resumeWeight: 40,
    resumeScore: 72,
    interviewWeight: 35,
    interviewScore: 68,
    skillWeight: 25,
    skillScore: 79,
  },
  stats: {
    appliedJobs: 14,
    shortlists: 5,
    interviewsScheduled: 3,
    offersCount: 1,
    activeCampusDrives: 8,
  },
  progressTimeline: [
    { week: 'W1 (Aug)', overall: 54, resume: 58, interview: 42 },
    { week: 'W2 (Aug)', overall: 59, resume: 62, interview: 48 },
    { week: 'W3 (Sep)', overall: 63, resume: 65, interview: 55 },
    { week: 'W4 (Sep)', overall: 67, resume: 69, interview: 60 },
    { week: 'W5 (Oct)', overall: 71, resume: 70, interview: 64 },
    { week: 'W6 (Oct)', overall: 74, resume: 72, interview: 68 },
  ],
  recentApplications: [
    {
      id: 'app_01',
      company: 'Zoho Corporation',
      role: 'Member Technical Staff (MTS)',
      package: '₹5.6 LPA',
      location: 'Chennai (Estancia)',
      appliedDate: '2 weeks ago',
      status: 'offer',
      statusLabel: 'Offer Letter Received',
      nextStep: 'Acceptance deadline: Oct 28',
    },
    {
      id: 'app_02',
      company: 'Freshworks',
      role: 'Associate Software Academy',
      package: '₹7.2 LPA',
      location: 'Chennai (Global Infocity)',
      appliedDate: '10 days ago',
      status: 'interview',
      statusLabel: 'Technical Round 2',
      nextStep: 'Scheduled for tomorrow, 2:30 PM',
    },
    {
      id: 'app_03',
      company: 'TCS Digital',
      role: 'Systems Engineer',
      package: '₹7.0 LPA',
      location: 'Pan-India',
      appliedDate: '3 weeks ago',
      status: 'assessment',
      statusLabel: 'OA Cleared',
      nextStep: 'Awaiting interview slot allocation',
    },
    {
      id: 'app_04',
      company: 'Cognizant',
      role: 'GenC Elevate',
      package: '₹4.5 LPA',
      location: 'Coimbatore / Chennai',
      appliedDate: '4 days ago',
      status: 'applied',
      statusLabel: 'Resume Screened',
      nextStep: 'Aptitude & Coding round pending',
    },
  ],
  nextActions: [
    {
      id: 'act_01',
      title: 'Add automated testing project bullet to your resume',
      description: 'Your resume lists React and Node.js, but Freshworks & Zoho JDs explicitly penalize candidates lacking unit test evidence (Jest or Mocha).',
      category: 'Resume Optimization',
      priority: 'high',
      estTime: '15 mins',
      actionUrl: '/resume-intelligence',
      actionText: 'Review suggestion',
    },
    {
      id: 'act_02',
      title: 'Complete mock interview on SQL Indexing & ACID transactions',
      description: 'DBMS and indexing queries caused the largest score deduction in your last mock interview session.',
      category: 'Interview Drill',
      priority: 'high',
      estTime: '20 mins',
      actionUrl: '/mock-interview',
      actionText: 'Start mock drill',
    },
    {
      id: 'act_03',
      title: 'Compare resume against Freshworks SDE-1 JD',
      description: 'New campus drive opened 2 days ago. Run a match to benchmark your keyword overlap before applying.',
      category: 'JD Matching',
      priority: 'medium',
      estTime: '5 mins',
      actionUrl: '/jd-matcher',
      actionText: 'Run JD check',
    },
  ],
};

export const dashboardService = {
  getSummary: async () => {
    if (USE_MOCK) {
      return mockDelay(MOCK_DASHBOARD_DATA, 280);
    }
    return api.get('/student/dashboard');
  },
};

export default dashboardService;
