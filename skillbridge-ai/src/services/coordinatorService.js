import api, { USE_MOCK, mockDelay } from './api';

export const MOCK_STUDENTS = [
  {
    id: 'stu_01',
    name: 'Aarthi Raman',
    rollNo: '211421104002',
    department: 'CSE',
    cgpa: 8.42,
    readinessScore: 74,
    atsScore: 72,
    interviewScore: 68,
    status: 'offer',
    statusLabel: 'Offer (Zoho)',
    lastActive: '10 mins ago',
    activeApplication: 'Freshworks (Round 2)',
    mentor: 'Priya Sundaram',
  },
  {
    id: 'stu_02',
    name: 'Mohammed Faizal',
    rollNo: '211421104048',
    department: 'CSE',
    cgpa: 8.15,
    readinessScore: 68,
    atsScore: 66,
    interviewScore: 70,
    status: 'interviewing',
    statusLabel: 'Interviewing (TCS Digital)',
    lastActive: '2 hours ago',
    activeApplication: 'TCS Digital (Technical Interview)',
    mentor: 'Priya Sundaram',
  },
  {
    id: 'stu_03',
    name: 'Divya K',
    rollNo: '211421104021',
    department: 'IT',
    cgpa: 8.78,
    readinessScore: 81,
    atsScore: 82,
    interviewScore: 79,
    status: 'offer',
    statusLabel: 'Offer (TCS Digital)',
    lastActive: 'Yesterday',
    activeApplication: 'Zoho (Final Round)',
    mentor: 'R. Balasubramanian',
  },
  {
    id: 'stu_04',
    name: 'Karthik Raja S',
    rollNo: '211421104033',
    department: 'ECE',
    cgpa: 7.62,
    readinessScore: 59,
    atsScore: 58,
    interviewScore: 54,
    status: 'action_required',
    statusLabel: 'Needs Remediation',
    lastActive: '3 days ago',
    activeApplication: 'Cognizant (Screened)',
    mentor: 'Unassigned',
  },
  {
    id: 'stu_05',
    name: 'Swetha Narayanan',
    rollNo: '211421104092',
    department: 'CSE',
    cgpa: 8.91,
    readinessScore: 86,
    atsScore: 88,
    interviewScore: 83,
    status: 'offer',
    statusLabel: 'Offer (Freshworks)',
    lastActive: '4 hours ago',
    activeApplication: 'Freshworks (₹7.2 LPA)',
    mentor: 'Priya Sundaram',
  },
  {
    id: 'stu_06',
    name: 'Vignesh P',
    rollNo: '211421104112',
    department: 'IT',
    cgpa: 7.45,
    readinessScore: 62,
    atsScore: 60,
    interviewScore: 65,
    status: 'applied',
    statusLabel: 'OA Pending',
    lastActive: '5 hours ago',
    activeApplication: 'Wipro (Turbo Track)',
    mentor: 'R. Balasubramanian',
  },
];

export const MOCK_PLACEMENT_ANALYTICS = {
  totalRegistered: 486,
  placedCount: 312,
  placementRate: 64.2,
  averagePackage: '₹6.4 LPA',
  highestPackage: '₹14.2 LPA',
  companyDistribution: [
    { name: 'TCS Digital', offers: 68 },
    { name: 'Cognizant', offers: 54 },
    { name: 'Zoho Corp', offers: 42 },
    { name: 'Wipro Limited', offers: 38 },
    { name: 'Freshworks', offers: 24 },
    { name: 'Accenture', offers: 32 },
  ],
  salaryBands: [
    { band: '₹3.6 - 5.0 LPA', count: 142 },
    { band: '₹5.0 - 7.0 LPA', count: 108 },
    { band: '₹7.0 - 10.0 LPA', count: 48 },
    { band: '> ₹10.0 LPA', count: 14 },
  ],
  channelSplit: [
    { name: 'On-Campus Drives', value: 78 },
    { name: 'Off-Campus / Direct', value: 22 },
  ],
};

export const coordinatorService = {
  getCohortStudents: async () => {
    if (USE_MOCK) {
      return mockDelay(MOCK_STUDENTS, 250);
    }
    return api.get('/coordinator/students');
  },

  getAnalytics: async () => {
    if (USE_MOCK) {
      return mockDelay(MOCK_PLACEMENT_ANALYTICS, 250);
    }
    return api.get('/coordinator/analytics');
  },
};

export default coordinatorService;
