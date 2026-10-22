import api, { USE_MOCK, mockDelay } from './api';

let mockRoadmapWeeks = [
  {
    weekNumber: 1,
    title: 'Unit Testing & Code Coverage',
    goal: 'Eliminate the #1 rejection flag on your resume by mastering automated testing for React & Node.js.',
    completed: true,
    tasks: [
      {
        id: 't_w1_1',
        text: 'Configure Jest and React Testing Library in your e-commerce repository',
        completed: true,
        duration: '2 hours',
        resourceTitle: 'React Testing Library Documentation',
        resourceUrl: 'https://testing-library.com/docs/react-testing-library/intro/',
      },
      {
        id: 't_w1_2',
        text: 'Write 6 unit tests covering cart addition, removal, and discount calculation',
        completed: true,
        duration: '3 hours',
        resourceTitle: 'Jest Matchers & Assertions Guide',
        resourceUrl: 'https://jestjs.io/docs/using-matchers',
      },
      {
        id: 't_w1_3',
        text: 'Update your primary resume bullet point to cite "85% test coverage via Jest"',
        completed: true,
        duration: '30 mins',
        resourceTitle: 'ATS Resume Bullet Formulator',
        resourceUrl: '#',
      },
    ],
  },
  {
    weekNumber: 2,
    title: 'SQL Performance, Indexing & Transactions',
    goal: 'Prepare for Round 2 database technical rounds at Zoho and Freshworks with query optimization.',
    completed: true,
    tasks: [
      {
        id: 't_w2_1',
        text: 'Learn B-Tree index mechanics and run EXPLAIN ANALYZE on slow mock queries',
        completed: true,
        duration: '2.5 hours',
        resourceTitle: 'Use The Index, Luke! Database Tuning Guide',
        resourceUrl: 'https://use-the-index-luke.com/',
      },
      {
        id: 't_w2_2',
        text: 'Implement compound index on orders (user_id, created_at) to avoid table scans',
        completed: true,
        duration: '1.5 hours',
        resourceTitle: 'PostgreSQL Indexing Tutorial',
        resourceUrl: 'https://www.postgresql.org/docs/current/indexes.html',
      },
      {
        id: 't_w2_3',
        text: 'Review ACID isolation levels (Read Committed vs Serializable) for interview questions',
        completed: false,
        duration: '1 hour',
        resourceTitle: 'Postgres Transaction Isolation documentation',
        resourceUrl: 'https://www.postgresql.org/docs/current/transaction-iso.html',
      },
    ],
  },
  {
    weekNumber: 3,
    title: 'Redis Caching & API Rate Limiting',
    goal: 'Integrate Redis into your backend to showcase caching and distributed state handling.',
    completed: false,
    tasks: [
      {
        id: 't_w3_1',
        text: 'Spin up a local Redis container and configure redis-node client in Express',
        completed: false,
        duration: '2 hours',
        resourceTitle: 'Redis Crash Course for Node.js',
        resourceUrl: 'https://redis.io/docs/latest/develop/connect/clients/nodejs/',
      },
      {
        id: 't_w3_2',
        text: 'Implement Cache-Aside pattern on product catalog GET endpoint with 10-minute TTL',
        completed: false,
        duration: '3 hours',
        resourceTitle: 'Cache-Aside Pattern by Microsoft Azure Docs',
        resourceUrl: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside',
      },
      {
        id: 't_w3_3',
        text: 'Add express-rate-limit middleware with Redis store to prevent endpoint abuse',
        completed: false,
        duration: '1.5 hours',
        resourceTitle: 'Express Rate Limit with Redis Store',
        resourceUrl: 'https://www.npmjs.com/package/rate-limit-redis',
      },
    ],
  },
  {
    weekNumber: 4,
    title: 'CI/CD Automation & Docker Compose',
    goal: 'Automate build verification and multi-container orchestration for your capstone project.',
    completed: false,
    tasks: [
      {
        id: 't_w4_1',
        text: 'Write GitHub Actions workflow to run linting and Jest test suite on every PR',
        completed: false,
        duration: '2 hours',
        resourceTitle: 'GitHub Actions for Node.js workflows',
        resourceUrl: 'https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs',
      },
      {
        id: 't_w4_2',
        text: 'Create a docker-compose.yml running frontend, backend, PostgreSQL, and Redis',
        completed: false,
        duration: '2.5 hours',
        resourceTitle: 'Docker Compose Getting Started',
        resourceUrl: 'https://docs.docker.com/compose/gettingstarted/',
      },
    ],
  },
  {
    weekNumber: 5,
    title: 'System Design Fundamentals for SDE-1',
    goal: 'Learn architectural building blocks for junior technical interviews (load balancers, CDN, caching).',
    completed: false,
    tasks: [
      {
        id: 't_w5_1',
        text: 'Design a URL Shortener (TinyURL) considering database choices, hashing, and collisions',
        completed: false,
        duration: '3 hours',
        resourceTitle: 'System Design Primer — URL Shortener',
        resourceUrl: 'https://github.com/donnemartin/system-design-primer',
      },
      {
        id: 't_w5_2',
        text: 'Understand Horizontal vs Vertical scaling, stateless server design, and database sharding',
        completed: false,
        duration: '2 hours',
        resourceTitle: 'Scale From Zero to Millions of Users',
        resourceUrl: 'https://bytebytego.com/',
      },
    ],
  },
  {
    weekNumber: 6,
    title: 'Campus Mock Interview Drills & Polishing',
    goal: 'Simulate high-pressure campus placement rounds and finalize company-tailored cheat sheets.',
    completed: false,
    tasks: [
      {
        id: 't_w6_1',
        text: 'Complete 3 AI mock interview drills on SkillBridge (Technical + Behavioral)',
        completed: false,
        duration: '2 hours',
        resourceTitle: 'SkillBridge AI Mock Interview Module',
        resourceUrl: '/mock-interview',
      },
      {
        id: 't_w6_2',
        text: 'Review standard HR questions (Why CIT? Conflict in team project? Relocation preferences?)',
        completed: false,
        duration: '1.5 hours',
        resourceTitle: 'STAR Method Interview Technique Guide',
        resourceUrl: 'https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique',
      },
      {
        id: 't_w6_3',
        text: 'Download your updated Placement Readiness Report for your faculty mentor',
        completed: false,
        duration: '15 mins',
        resourceTitle: 'SkillBridge Career Report Generator',
        resourceUrl: '/career-report',
      },
    ],
  },
];

export const roadmapService = {
  getRoadmap: async () => {
    if (USE_MOCK) {
      const allTasks = mockRoadmapWeeks.flatMap((w) => w.tasks);
      const completedTasks = allTasks.filter((t) => t.completed);
      const progressPercent = Math.round((completedTasks.length / allTasks.length) * 100);

      return mockDelay(
        {
          targetRole: 'Full Stack Engineer',
          totalWeeks: 6,
          currentWeek: 2,
          progressPercent,
          completedTasksCount: completedTasks.length,
          totalTasksCount: allTasks.length,
          weeks: [...mockRoadmapWeeks],
        },
        250
      );
    }
    return api.get('/student/roadmap');
  },

  toggleTask: async (taskId) => {
    if (USE_MOCK) {
      mockRoadmapWeeks = mockRoadmapWeeks.map((week) => {
        const updatedTasks = week.tasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        const allCompleted = updatedTasks.every((t) => t.completed);
        return {
          ...week,
          tasks: updatedTasks,
          completed: allCompleted,
        };
      });

      const allTasks = mockRoadmapWeeks.flatMap((w) => w.tasks);
      const completedTasks = allTasks.filter((t) => t.completed);
      const progressPercent = Math.round((completedTasks.length / allTasks.length) * 100);

      return mockDelay(
        {
          success: true,
          taskId,
          progressPercent,
          completedTasksCount: completedTasks.length,
          totalTasksCount: allTasks.length,
        },
        120
      );
    }
    return api.patch(`/student/roadmap/tasks/${taskId}/toggle`);
  },

  regenerateRoadmap: async (options = {}) => {
    if (USE_MOCK) {
      // Reset some tasks or tailor to new focus
      return mockDelay(
        {
          message: 'Roadmap successfully regenerated based on latest skill gap analysis and target campus drives.',
        },
        500
      );
    }
    return api.post('/student/roadmap/regenerate', options);
  },
};

export default roadmapService;
