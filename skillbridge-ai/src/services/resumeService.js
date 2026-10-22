import api, { USE_MOCK, mockDelay } from './api';

let mockResumesStore = [
  {
    id: 'res_01',
    fileName: 'Aarthi_Raman_FullStack_2025.pdf',
    fileSize: '412 KB',
    fileType: 'application/pdf',
    uploadedAt: '3 days ago',
    lastAnalysed: 'Yesterday at 4:15 PM',
    isPrimary: true,
    atsScore: 72,
    targetRole: 'Full Stack Engineer',
    matchedKeywordsCount: 22,
    missingKeywordsCount: 8,
  },
  {
    id: 'res_02',
    fileName: 'Aarthi_Raman_Frontend_React.pdf',
    fileSize: '380 KB',
    fileType: 'application/pdf',
    uploadedAt: '1 week ago',
    lastAnalysed: 'Oct 14, 2025',
    isPrimary: false,
    atsScore: 78,
    targetRole: 'Frontend Specialist (React)',
    matchedKeywordsCount: 26,
    missingKeywordsCount: 4,
  },
  {
    id: 'res_03',
    fileName: 'Aarthi_Raman_Generic_Campus.docx',
    fileSize: '240 KB',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    uploadedAt: '2 weeks ago',
    lastAnalysed: 'Oct 07, 2025',
    isPrimary: false,
    atsScore: 64,
    targetRole: 'Software Engineer (General)',
    matchedKeywordsCount: 17,
    missingKeywordsCount: 14,
  },
];

const mockIntelligenceData = {
  resumeId: 'res_01',
  fileName: 'Aarthi_Raman_FullStack_2025.pdf',
  overallScore: 72,
  percentile: 79,
  breakdown: [
    {
      id: 'sec_format',
      label: 'Formatting Compliance',
      score: 82,
      max: 100,
      status: 'good',
      description: 'Clean single-column layout, standard margins, and ATS-parseable headings. No nested tables or graphic icons detected.',
    },
    {
      id: 'sec_keywords',
      label: 'Keyword Alignment',
      score: 68,
      max: 100,
      status: 'warning',
      description: 'Strong JavaScript & React keyword density. Missing automated unit testing (Jest/Mocha), Redis, and CI/CD terminology.',
    },
    {
      id: 'sec_sections',
      label: 'Section Completeness',
      score: 90,
      max: 100,
      status: 'good',
      description: 'Standard Education, Technical Skills, Projects, and Experience sections present with proper chronological ordering.',
    },
    {
      id: 'sec_impact',
      label: 'Action & Impact Verbs',
      score: 74,
      max: 100,
      status: 'warning',
      description: '4 bullet points include quantifiable metrics (%, numbers). 2 project bullets remain purely task-descriptive.',
    },
  ],
  extractedSkills: {
    frontend: ['React 18', 'Redux Toolkit', 'TypeScript', 'HTML5 & CSS3', 'Tailwind CSS', 'Next.js'],
    backend: ['Node.js', 'Express.js', 'RESTful API Design', 'JWT Auth', 'WebSockets'],
    database: ['PostgreSQL', 'MongoDB', 'Prisma ORM', 'SQL Schema Design'],
    tools: ['Git & GitHub', 'Docker (Basic)', 'Linux CLI', 'Postman', 'Vite'],
  },
  rewriteSuggestions: [
    {
      id: 'sug_01',
      section: 'Projects — E-Commerce Cart',
      severity: 'critical', // 'critical' | 'recommended' | 'optional'
      before: 'Built an e-commerce website with React and Node.js with payment integration.',
      after: 'Architected a full-stack e-commerce portal utilizing React, Node.js, and Razorpay API; reduced checkout latency by 28% and handled 1,200+ simulated concurrent carts.',
      rationale: 'Replaces generic passive phrasing with specific payment gateway API details and measurable performance gains.',
      status: 'pending', // 'pending' | 'accepted' | 'dismissed'
    },
    {
      id: 'sug_02',
      section: 'Experience — Web Dev Intern',
      severity: 'recommended',
      before: 'Worked on frontend bugs and improved user interface for client dashboard.',
      after: 'Resolved 24+ high-priority UI defects across client dashboard components using React DevTools, cutting initial bundle load time by 18%.',
      rationale: 'Quantifies defect volume and links UI refactoring directly to bundle size optimization.',
      status: 'pending',
    },
    {
      id: 'sug_03',
      section: 'Projects — Task Management Backend',
      severity: 'recommended',
      before: 'Used MongoDB to store user and order information for multi-tenant system.',
      after: 'Designed normalized MongoDB collections with compound indexing for accounts and tasks, maintaining sub-50ms query response under load.',
      rationale: 'Highlights compound indexing and query response latency, crucial for backend screening rounds.',
      status: 'pending',
    },
    {
      id: 'sug_04',
      section: 'Leadership / Academic Projects',
      severity: 'optional',
      before: 'Created college symposium event registration web page for participants.',
      after: 'Engineered responsive event registration portal for CIT TechFest handling 850+ participant submissions with automated email pass generation.',
      rationale: 'Showcases collegiate scale and automated transaction delivery rather than basic page setup.',
      status: 'pending',
    },
  ],
};

export const resumeService = {
  getResumes: async () => {
    if (USE_MOCK) {
      return mockDelay([...mockResumesStore], 250);
    }
    return api.get('/resumes');
  },

  uploadResume: async (file) => {
    // Validate file type
    const validExtensions = ['pdf', 'docx', 'doc'];
    const extension = file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(extension)) {
      throw new Error('Only PDF and DOCX documents are accepted for ATS parsing.');
    }

    // Validate size: 5MB
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size exceeds the 5MB maximum limit.');
    }

    if (USE_MOCK) {
      const newResume = {
        id: `res_${Date.now()}`,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        fileType: file.type || 'application/pdf',
        uploadedAt: 'Just now',
        lastAnalysed: 'Analysis in progress',
        isPrimary: mockResumesStore.length === 0, // First uploaded becomes primary
        atsScore: 75,
        targetRole: 'Engineering Candidate',
        matchedKeywordsCount: 20,
        missingKeywordsCount: 6,
      };
      mockResumesStore = [newResume, ...mockResumesStore];
      return mockDelay(newResume, 600);
    }

    const formData = new FormData();
    formData.append('resume', file);
    return api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  setPrimary: async (resumeId) => {
    if (USE_MOCK) {
      mockResumesStore = mockResumesStore.map((res) => ({
        ...res,
        isPrimary: res.id === resumeId,
      }));
      return mockDelay({ success: true, primaryId: resumeId }, 200);
    }
    return api.patch(`/resumes/${resumeId}/set-primary`);
  },

  deleteResume: async (resumeId) => {
    if (USE_MOCK) {
      mockResumesStore = mockResumesStore.filter((res) => res.id !== resumeId);
      return mockDelay({ success: true, deletedId: resumeId }, 250);
    }
    return api.delete(`/resumes/${resumeId}`);
  },

  getIntelligence: async (resumeId = 'res_01') => {
    if (USE_MOCK) {
      return mockDelay({ ...mockIntelligenceData, resumeId }, 350);
    }
    return api.get(`/resumes/${resumeId}/intelligence`);
  },
};

export default resumeService;
