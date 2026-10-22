import api, { USE_MOCK, mockDelay } from './api';

export const reportService = {
  getReportData: async (sections = {}) => {
    if (USE_MOCK) {
      return mockDelay(
        {
          generatedAt: 'October 21, 2025 at 10:45 AM',
          institution: 'Chennai Institute of Technology',
          department: 'Department of Computer Science and Engineering',
          student: {
            name: 'Aarthi Raman',
            rollNo: '211421104002',
            email: 'aarthi.raman@cit.edu.in',
            cgpa: '8.42 / 10.0',
            batch: '2021 — 2025 (Final Year)',
            targetRole: 'Full Stack Engineer (MERN / Postgres)',
          },
          readinessSummary: {
            compositeScore: 74,
            cohortPercentile: 'Top 21%',
            qualificationStatus: 'Eligible for Product Tier-1 Campus Drives (CTC ≥ ₹7 LPA)',
            mentorAssigned: 'Priya Sundaram (Staff Frontend Engineer, Freshworks)',
          },
          scores: {
            atsScore: 72,
            interviewScore: 68,
            skillMatchScore: 79,
          },
          verifiedSkills: [
            'React 18 & Redux Toolkit',
            'TypeScript & ES6+ JavaScript',
            'Node.js & Express RESTful APIs',
            'PostgreSQL & MongoDB Schema Design',
            'Docker Basics & Linux CLI',
            'Data Structures (Array, String, Tree, Graph)',
          ],
          identifiedGaps: [
            'Automated Unit Testing with Jest / RTL (In progress — Week 1)',
            'Compound SQL Indexing & Query Profiling (Scheduled — Week 2)',
            'Redis In-Memory Caching (Scheduled — Week 3)',
          ],
          placementOffers: [
            { company: 'Zoho Corporation', role: 'Member Technical Staff (MTS)', package: '₹5.6 LPA', status: 'Offer Received' },
          ],
          activePipelines: [
            { company: 'Freshworks', role: 'Associate Software Academy', package: '₹7.2 LPA', stage: 'Technical Round 2' },
            { company: 'TCS Digital', role: 'Systems Engineer', package: '₹7.0 LPA', stage: 'Online Assessment Cleared' },
          ],
        },
        300
      );
    }
    return api.post('/student/report/generate', { sections });
  },

  downloadPdf: async (reportId) => {
    if (USE_MOCK) {
      // Simulate download delay
      return mockDelay({ success: true, fileName: 'SkillBridge_Readiness_Report_Aarthi_Raman.pdf' }, 800);
    }
    return api.get(`/student/report/${reportId}/pdf`, { responseType: 'blob' });
  },
};

export default reportService;
