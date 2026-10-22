import api, { USE_MOCK, mockDelay } from './api';

export const SAMPLE_JDS = [
  {
    id: 'jd_fw_01',
    company: 'Freshworks Inc.',
    role: 'Associate Software Academy (Product Engineer)',
    location: 'Chennai (Global Infocity)',
    packageRange: '₹6.5 - ₹8.0 LPA',
    batchEligible: '2025 B.E. / B.Tech (CSE / IT / ECE)',
    eligibilityCgpa: '7.5 CGPA and above with no standing backlogs',
    driveDate: 'Oct 28, 2025',
    matchPercentage: 73,
    overview: 'Looking for enthusiastic engineering graduates with strong fundamentals in modern JavaScript, React, and backend RESTful services. Candidates must demonstrate sound understanding of data structures, clean code principles, and unit testing.',
    requirements: {
      mustHave: [
        { skill: 'JavaScript (ES6+) & TypeScript', matched: true, context: 'Strong evidence in 2 projects' },
        { skill: 'React 18 & State Management (Redux/Context)', matched: true, context: 'Matched in e-commerce project' },
        { skill: 'RESTful API Design & Node.js/Express', matched: true, context: 'Matched in backend projects' },
        { skill: 'Relational Database (PostgreSQL/MySQL)', matched: true, context: 'PostgreSQL matched in resume' },
        { skill: 'Unit Testing (Jest / React Testing Library)', matched: false, context: 'Missing in resume bullet points' },
        { skill: 'Data Structures & Algorithms (Arrays, Trees, Graphs)', matched: true, context: 'Coursework & LeetCode mentioned' },
      ],
      goodToHave: [
        { skill: 'In-Memory Caching (Redis)', matched: false, context: 'Not detected' },
        { skill: 'Docker Containerization & Linux Basics', matched: true, context: 'Basic Docker detected' },
        { skill: 'CI/CD Pipelines (GitHub Actions)', matched: false, context: 'Not detected' },
        { skill: 'Cloud Fundamentals (AWS S3 / EC2)', matched: false, context: 'Not detected' },
      ],
    },
    rawText: `Job Description: Associate Software Academy (Freshworks)
Locations: Chennai, Tamil Nadu, India
Eligibility: 2025 Passouts (B.E./B.Tech in CSE, IT, ECE) with minimum 75% or 7.5 CGPA.
Key Responsibilities:
- Design, build, and maintain frontend user experiences using React and TypeScript.
- Write robust, scalable server-side microservices using Node.js and Express.
- Work with relational and NoSQL databases (PostgreSQL, MongoDB).
- Implement automated test suites using Jest to maintain >80% code coverage.
- Collaborate with product designers and QA engineers in Agile sprint cycles.`,
  },
  {
    id: 'jd_zh_02',
    company: 'Zoho Corporation',
    role: 'Member Technical Staff (Software Developer)',
    location: 'Chennai / Tenkasi',
    packageRange: '₹5.6 - ₹7.0 LPA',
    batchEligible: '2025 B.E. / B.Tech / MCA',
    eligibilityCgpa: 'No minimum CGPA cutoff; pure merit-based coding assessment',
    driveDate: 'Nov 04, 2025',
    matchPercentage: 81,
    overview: 'Zoho is looking for problem solvers who can write clean, modular, and optimized code from first principles without relying on bloated third-party frameworks. Strong core programming (C / C++ / Java / JS) and database design skills required.',
    requirements: {
      mustHave: [
        { skill: 'Core Programming & Logic (JS / Java / C++)', matched: true, context: 'Verified in multiple projects' },
        { skill: 'Database Schema Design & Normalization', matched: true, context: 'MongoDB & PostgreSQL matched' },
        { skill: 'Object-Oriented Design Principles (SOLID)', matched: true, context: 'Evident in project architecture' },
        { skill: 'DOM Manipulation & Vanilla JavaScript Fundamentals', matched: true, context: 'Strong match' },
      ],
      goodToHave: [
        { skill: 'Multi-threading & Asynchronous I/O', matched: true, context: 'Node.js async loops noted' },
        { skill: 'Performance Profiling & Memory Optimization', matched: false, context: 'Missing in project descriptions' },
      ],
    },
    rawText: `Job Role: Member Technical Staff (Zoho)
Selection Rounds:
Round 1: Basic Programming & Aptitude (C/C++/Java/JS)
Round 2: Advanced Programming (Data Structures & Complex Logic)
Round 3: Object Oriented System Design & Schema Creation
Round 4: Technical HR Interview`,
  },
  {
    id: 'jd_tcs_03',
    company: 'TCS Digital',
    role: 'Systems Engineer — Digital Track',
    location: 'Pan-India',
    packageRange: '₹7.0 - ₹7.5 LPA',
    batchEligible: '2025 B.E. / B.Tech / M.Tech',
    eligibilityCgpa: '7.0 CGPA throughout 10th, 12th, and Degree',
    driveDate: 'Nov 12, 2025',
    matchPercentage: 76,
    overview: 'TCS Digital hiring track for advanced technical engineering roles in Cloud, AI, and Fullstack systems engineering.',
    requirements: {
      mustHave: [
        { skill: 'Fullstack Web Architecture', matched: true, context: 'React + Node matched' },
        { skill: 'SQL Queries & Indexing', matched: true, context: 'PostgreSQL queries matched' },
        { skill: 'Python / Java / C++ Problem Solving', matched: true, context: 'DSA coursework verified' },
        { skill: 'Cloud & Infrastructure Concepts', matched: false, context: 'Needs AWS / Azure keywords' },
      ],
      goodToHave: [
        { skill: 'Microservices & API Gateway Concepts', matched: true, context: 'Express REST APIs matched' },
        { skill: 'DevOps & Git Workflow', matched: true, context: 'Git verified' },
      ],
    },
    rawText: `TCS Digital 2025 Campus Drive:
Eligible Streams: CSE, IT, AI-DS, ECE.
Candidates will undergo Digital Aptitude & Advanced Coding Test followed by Technical & Managerial Interviews.`,
  },
];

export const jdService = {
  getSampleJDs: async () => {
    if (USE_MOCK) {
      return mockDelay(SAMPLE_JDS, 200);
    }
    return api.get('/jd/samples');
  },

  matchJD: async (jdTextOrUrl, resumeId = 'res_01') => {
    if (USE_MOCK) {
      // Find matching sample or construct custom match
      const matchedSample = SAMPLE_JDS.find(
        (jd) => jdTextOrUrl.includes(jd.company) || jdTextOrUrl.includes(jd.id)
      ) || SAMPLE_JDS[0];

      return mockDelay(
        {
          ...matchedSample,
          analyzedAt: 'Just now',
          matchedResumeId: resumeId,
        },
        350
      );
    }
    return api.post('/jd/match', { text: jdTextOrUrl, resumeId });
  },
};

export default jdService;
