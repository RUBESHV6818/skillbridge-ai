import api, { USE_MOCK, mockDelay } from './api';

export const MOCK_SKILL_GAP_DATA = {
  overallReadiness: 76,
  targetProfile: 'Full Stack Engineer (Campus Placement Band: ₹6 - 8 LPA)',
  categoryBars: [
    { category: 'Frontend Development', current: 88, required: 82, gap: 0, status: 'surplus' },
    { category: 'Backend & APIs', current: 72, required: 85, gap: 13, status: 'deficit' },
    { category: 'Databases & Schema Design', current: 76, required: 80, gap: 4, status: 'minor_gap' },
    { category: 'DevOps & Deployment', current: 42, required: 70, gap: 28, status: 'critical_deficit' },
    { category: 'Core CS & DSA', current: 81, required: 85, gap: 4, status: 'minor_gap' },
  ],
  skillsCategorized: [
    {
      category: 'Frontend & UI Engineering',
      have: [
        { name: 'React 18 & Hooks', proficiency: 'Advanced', verified: true },
        { name: 'TypeScript Fundamentals', proficiency: 'Intermediate', verified: true },
        { name: 'Redux Toolkit & Context API', proficiency: 'Intermediate', verified: true },
        { name: 'Tailwind CSS & Responsive Layouts', proficiency: 'Advanced', verified: true },
      ],
      missing: [
        {
          name: 'Jest & React Testing Library',
          priority: 'high',
          reason: 'Explicit requirement in Freshworks and Zoho campus hiring criteria.',
          actionableResource: 'Jest official docs + CIT unit testing crash course',
        },
        {
          name: 'Next.js Server Side Rendering (SSR)',
          priority: 'low',
          reason: 'Bonus points for frontend-focused product roles.',
          actionableResource: 'Next.js App Router tutorial',
        },
      ],
    },
    {
      category: 'Backend & System Architecture',
      have: [
        { name: 'Node.js & Express.js', proficiency: 'Intermediate', verified: true },
        { name: 'RESTful API Architecture', proficiency: 'Intermediate', verified: true },
        { name: 'JWT & Session Authentication', proficiency: 'Intermediate', verified: true },
      ],
      missing: [
        {
          name: 'Redis In-Memory Caching',
          priority: 'high',
          reason: 'Expected in technical interview system design questions for scale.',
          actionableResource: 'Redis University RU101 course notes',
        },
        {
          name: 'Rate Limiting & API Security Middleware',
          priority: 'medium',
          reason: 'Differentiates junior student projects from production-grade code.',
          actionableResource: 'Express Rate Limit implementation guide',
        },
      ],
    },
    {
      category: 'Databases & Data Modeling',
      have: [
        { name: 'PostgreSQL Relational Queries', proficiency: 'Intermediate', verified: true },
        { name: 'MongoDB Document Modeling', proficiency: 'Intermediate', verified: true },
        { name: 'Prisma ORM Client', proficiency: 'Intermediate', verified: true },
      ],
      missing: [
        {
          name: 'Compound SQL Indexing & Query Profiling (EXPLAIN ANALYZE)',
          priority: 'high',
          reason: 'Frequently asked in Round 2 database interviews at Zoho & Freshworks.',
          actionableResource: 'Use The Index, Luke! SQL performance tutorial',
        },
        {
          name: 'ACID Transaction Locks & Isolation Levels',
          priority: 'medium',
          reason: 'Essential DBMS theoretical topic tested in technical screenings.',
          actionableResource: 'Postgres Transactions documentation',
        },
      ],
    },
    {
      category: 'DevOps, CI/CD & Cloud Basics',
      have: [
        { name: 'Git Branching & GitHub Collaboration', proficiency: 'Advanced', verified: true },
        { name: 'Docker Container Basics (Dockerfile)', proficiency: 'Beginner', verified: true },
        { name: 'Linux Shell Navigation (Bash)', proficiency: 'Intermediate', verified: true },
      ],
      missing: [
        {
          name: 'GitHub Actions Automated CI/CD Pipelines',
          priority: 'medium',
          reason: 'Proves code verification workflow on pull requests.',
          actionableResource: 'GitHub Actions for Node.js workflows',
        },
        {
          name: 'AWS S3 Asset Upload & EC2 Deployment',
          priority: 'medium',
          reason: 'Required by cloud and fullstack campus roles.',
          actionableResource: 'AWS Free Tier deployment tutorial',
        },
      ],
    },
  ],
};

export const skillGapService = {
  getAnalysis: async () => {
    if (USE_MOCK) {
      return mockDelay(MOCK_SKILL_GAP_DATA, 280);
    }
    return api.get('/student/skill-gap');
  },
};

export default skillGapService;
