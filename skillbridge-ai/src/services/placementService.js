import api, { USE_MOCK, mockDelay } from './api';

export const KANBAN_STAGES = [
  { id: 'wishlist', label: 'Wishlist', description: 'Target campus drives' },
  { id: 'applied', label: 'Applied', description: 'Resume submitted' },
  { id: 'oa', label: 'Online Assessment', description: 'Coding & Aptitude test' },
  { id: 'interview', label: 'Technical Rounds', description: '1st/2nd round interviews' },
  { id: 'offer', label: 'Offer Received', description: 'Formal letter received' },
  { id: 'rejected', label: 'Archived', description: 'Not shortlisted' },
];

let mockApplicationsStore = [
  {
    id: 'app_01',
    company: 'Zoho Corporation',
    role: 'Member Technical Staff (MTS)',
    package: '₹5.6 LPA',
    status: 'offer',
    isCampus: true,
    appliedDate: '2025-09-20',
    location: 'Chennai (Estancia)',
    notes: 'Offer letter received Oct 18. Acceptance confirmation deadline Oct 28. Department coordinator approved.',
  },
  {
    id: 'app_02',
    company: 'Freshworks',
    role: 'Associate Software Academy',
    package: '₹7.2 LPA',
    status: 'interview',
    isCampus: true,
    appliedDate: '2025-10-02',
    location: 'Chennai (Global Infocity)',
    notes: 'Round 1 coding cleared (Score: 280/300). Technical Round 2 scheduled for tomorrow at 2:30 PM with Senior Tech Lead.',
  },
  {
    id: 'app_03',
    company: 'TCS Digital',
    role: 'Systems Engineer',
    package: '₹7.0 LPA',
    status: 'oa',
    isCampus: true,
    appliedDate: '2025-09-28',
    location: 'Pan-India',
    notes: 'National Qualifier Test (NQT) score: 84 percentile. Awaiting interview slot notification.',
  },
  {
    id: 'app_04',
    company: 'Cognizant',
    role: 'GenC Elevate',
    package: '₹4.5 LPA',
    status: 'applied',
    isCampus: true,
    appliedDate: '2025-10-12',
    location: 'Coimbatore / Chennai',
    notes: 'Campus drive screening completed by T&P cell. Online aptitude round scheduled for next week.',
  },
  {
    id: 'app_05',
    company: 'Accenture India',
    role: 'Advanced Associate Software Engineer',
    package: '₹6.5 LPA',
    status: 'wishlist',
    isCampus: true,
    appliedDate: '2025-10-15',
    location: 'Bangalore / Chennai',
    notes: 'Drive opening on Nov 15. Need to complete cloud deployment bullet before submitting resume.',
  },
  {
    id: 'app_06',
    company: 'Wipro Limited',
    role: 'Turbo Track Engineer',
    package: '₹6.5 LPA',
    status: 'rejected',
    isCampus: true,
    appliedDate: '2025-09-10',
    location: 'Chennai',
    notes: 'Eliminated in Round 2 coding test on graph traversal. Review BFS/DFS algorithms.',
  },
];

export const placementService = {
  getApplications: async () => {
    if (USE_MOCK) {
      return mockDelay([...mockApplicationsStore], 250);
    }
    return api.get('/student/applications');
  },

  updateStatus: async (appId, newStatus) => {
    if (USE_MOCK) {
      mockApplicationsStore = mockApplicationsStore.map((app) =>
        app.id === appId ? { ...app, status: newStatus } : app
      );
      return mockDelay({ success: true, appId, newStatus }, 150);
    }
    return api.patch(`/student/applications/${appId}/status`, { status: newStatus });
  },

  addApplication: async (appData) => {
    if (USE_MOCK) {
      const newApp = {
        id: `app_${Date.now()}`,
        company: appData.company,
        role: appData.role,
        package: appData.package || '₹5.0 LPA',
        status: appData.status || 'applied',
        isCampus: appData.isCampus !== false,
        appliedDate: new Date().toISOString().split('T')[0],
        location: appData.location || 'Chennai',
        notes: appData.notes || '',
      };
      mockApplicationsStore = [newApp, ...mockApplicationsStore];
      return mockDelay(newApp, 300);
    }
    return api.post('/student/applications', appData);
  },

  deleteApplication: async (appId) => {
    if (USE_MOCK) {
      mockApplicationsStore = mockApplicationsStore.filter((app) => app.id !== appId);
      return mockDelay({ success: true, appId }, 200);
    }
    return api.delete(`/student/applications/${appId}`);
  },
};

export default placementService;
