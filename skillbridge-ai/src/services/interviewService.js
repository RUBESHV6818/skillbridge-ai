import api, { USE_MOCK, mockDelay } from './api';

export const MOCK_INTERVIEW_QUESTIONS = [
  {
    id: 'q_01',
    category: 'Technical — React & Frontend',
    question: 'Explain how the Virtual DOM in React works and what causes unnecessary re-renders. How does useMemo or React.memo mitigate this?',
    timeLimitSeconds: 180,
    idealKeywords: ['reconciliation', 'diffing algorithm', 'shallow comparison', 'memoization', 'render cycle'],
  },
  {
    id: 'q_02',
    category: 'Technical — Database & Backend',
    question: 'How do compound indexes work in relational databases like PostgreSQL? In what scenario would a query fail to utilize a compound index on (user_id, created_at)?',
    timeLimitSeconds: 180,
    idealKeywords: ['leftmost prefix', 'B-tree index', 'cardinality', 'range scan', 'sort operation'],
  },
  {
    id: 'q_03',
    category: 'Technical — System Design & Scale',
    question: 'Explain the Cache-Aside pattern when using Redis with a primary SQL database. How do you handle cache invalidation and cache stampede?',
    timeLimitSeconds: 180,
    idealKeywords: ['TTL', 'invalidation', 'stale data', 'mutex lock', 'probabilistic early expiration'],
  },
  {
    id: 'q_04',
    category: 'Behavioral — Problem Solving',
    question: 'Describe a difficult technical bug you encountered in a team project. How did you diagnose it, and how did you communicate the resolution to your peers?',
    timeLimitSeconds: 180,
    idealKeywords: ['STAR format', 'debugging tools', 'root cause', 'git bisect', 'peer review'],
  },
  {
    id: 'q_05',
    category: 'Behavioral & Campus Culture',
    question: 'Why are you specifically interested in joining Freshworks / Zoho over larger IT services companies? What does your 1-year learning curve look like?',
    timeLimitSeconds: 180,
    idealKeywords: ['product mindset', 'ownership', 'engineering culture', 'code quality', 'growth'],
  },
];

export const MOCK_INTERVIEW_EVALUATION = {
  sessionId: 'ses_mock_9921',
  overallScore: 72,
  percentile: 76,
  role: 'Full Stack Engineer',
  difficulty: 'Entry SDE-1',
  interviewType: 'Mixed Technical & HR',
  completedAt: 'Just now',
  summary: 'Strong grasp of React rendering mechanics and asynchronous JavaScript. Minor technical deductions in database indexing leftmost prefix rules and cache stampede prevention.',
  questionsFeedback: [
    {
      questionId: 'q_01',
      question: 'Explain how the Virtual DOM in React works and what causes unnecessary re-renders. How does useMemo or React.memo mitigate this?',
      score: 82,
      clarity: 85,
      correctness: 80,
      userAnswer: 'The Virtual DOM is a lightweight JavaScript representation of the actual DOM. When state changes, React creates a new tree and diffs it against the previous one using the reconciliation algorithm. If parents re-render, children re-render by default. We use React.memo to do shallow prop comparisons and useMemo to cache expensive computed values.',
      critique: 'Accurate and well-structured answer. Well-articulated distinction between reconciliation and shallow prop comparisons.',
      keyPointsCovered: ['Reconciliation algorithm', 'Shallow prop comparison', 'useMemo cache caching'],
      keyPointsMissed: ['Mentioning fiber architecture or batching'],
    },
    {
      questionId: 'q_02',
      question: 'How do compound indexes work in relational databases like PostgreSQL? In what scenario would a query fail to utilize a compound index on (user_id, created_at)?',
      score: 64,
      clarity: 70,
      correctness: 60,
      userAnswer: 'Compound indexes combine two columns into one index tree. If we query by user_id and created_at together, it is very fast. It fails to work if we only query by created_at because user_id is the first column in the index.',
      critique: 'Correct identification of the leftmost prefix rule. Could be improved by mentioning B-Tree sort ordering and how range queries on the first column prevent index usage on the second.',
      keyPointsCovered: ['Leftmost prefix concept', 'Multi-column index basics'],
      keyPointsMissed: ['B-Tree traversal mechanics', 'Range query impacts on secondary index columns'],
    },
    {
      questionId: 'q_04',
      question: 'Describe a difficult technical bug you encountered in a team project. How did you diagnose it, and how did you communicate the resolution to your peers?',
      score: 75,
      clarity: 80,
      correctness: 72,
      userAnswer: 'In our college project, we had a race condition during Razorpay payment webhooks where cart items were cleared before the order entry committed. I used Postman and server logs to reproduce the concurrent requests, wrapped the logic in a database transaction, and walked the team through the commit order.',
      critique: 'Good concrete example with database transactions. Follows the STAR method effectively with clear personal accountability.',
      keyPointsCovered: ['Specific reproducible scenario', 'Transaction resolution', 'Team communication'],
      keyPointsMissed: ['Mentioning automated regression test additions'],
    },
  ],
};

export const interviewService = {
  startSession: async (config) => {
    if (USE_MOCK) {
      const count = config.numQuestions || 3;
      return mockDelay(
        {
          sessionId: `ses_${Date.now()}`,
          config,
          questions: MOCK_INTERVIEW_QUESTIONS.slice(0, count),
        },
        300
      );
    }
    return api.post('/interview/start', config);
  },

  submitAnswers: async (sessionId, answers) => {
    if (USE_MOCK) {
      return mockDelay(MOCK_INTERVIEW_EVALUATION, 650);
    }
    return api.post(`/interview/${sessionId}/submit`, { answers });
  },

  getLatestResults: async () => {
    if (USE_MOCK) {
      return mockDelay(MOCK_INTERVIEW_EVALUATION, 250);
    }
    return api.get('/interview/latest');
  },
};

export default interviewService;
