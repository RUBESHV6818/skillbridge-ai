const Roadmap = require('../models/Roadmap');
const ReadinessSnapshot = require('../models/ReadinessSnapshot');
const Resume = require('../models/Resume');
const { buildSkillGapData } = require('./skillGapController');

const resource = (title, url) => ({ title, url });
const plans = {
  fullstack: {
    targetRole: 'Full Stack Engineer',
    weeks: [
      ['Testing & code quality', 'Make your projects easier to trust by adding repeatable tests.', [
        ['Add tests for a core UI flow', '2 hours', resource('Testing Library', 'https://testing-library.com/docs/'), resource('https://testing-library.com/docs/')],
        ['Add API tests for validation and error cases', '2 hours', resource('Jest documentation', 'https://jestjs.io/docs/getting-started'), resource('https://jestjs.io/docs/getting-started')],
      ]],
      ['SQL performance & transactions', 'Practice reading query plans and protecting multi-step updates.', [
        ['Create a relational schema for a small placement tracker', '2 hours', resource('PostgreSQL tutorial', 'https://www.postgresql.org/docs/current/tutorial.html'), resource('https://www.postgresql.org/docs/current/tutorial.html')],
        ['Add an index and compare query plans with EXPLAIN ANALYZE', '2 hours', resource('PostgreSQL EXPLAIN', 'https://www.postgresql.org/docs/current/using-explain.html'), resource('https://www.postgresql.org/docs/current/using-explain.html')],
      ]],
      ['Caching & API reliability', 'Understand how caching and request limits support reliable services.', [
        ['Add Redis caching to one read-heavy endpoint', '3 hours', resource('Redis documentation', 'https://redis.io/docs/latest/'), resource('https://redis.io/docs/latest/')],
        ['Add request validation and rate limits to public routes', '2 hours', resource('Express rate limit', 'https://express-rate-limit.mintlify.app/'), resource('https://express-rate-limit.mintlify.app/')],
      ]],
      ['CI/CD & containers', 'Make builds repeatable and catch errors before deployment.', [
        ['Create a GitHub Actions workflow that builds the frontend and backend', '2 hours', resource('GitHub Actions for Node.js', 'https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs'), resource('https://docs.github.com/en/actions/automating-builds-and-tests/building-and-testing-nodejs')],
        ['Run the application services with Docker Compose', '3 hours', resource('Docker Compose quickstart', 'https://docs.docker.com/compose/gettingstarted/'), resource('https://docs.docker.com/compose/gettingstarted/')],
      ]],
      ['System design foundations', 'Explain the tradeoffs behind a small service architecture.', [
        ['Sketch a URL shortener with API, database, and cache components', '2 hours', resource('System Design Primer', 'https://github.com/donnemartin/system-design-primer'), resource('https://github.com/donnemartin/system-design-primer')],
        ['Describe pagination, indexing, and failure handling for your project', '1.5 hours', resource('Microsoft architecture center', 'https://learn.microsoft.com/en-us/azure/architecture/'), resource('https://learn.microsoft.com/en-us/azure/architecture/')],
      ]],
      ['Interview practice & portfolio polish', 'Turn your project work into clear, evidence-based interview answers.', [
        ['Complete a timed data structures practice set', '2 hours', resource('VisuAlgo', 'https://visualgo.net/en'), resource('https://visualgo.net/en')],
        ['Write a concise walkthrough of one project decision and its tradeoffs', '1 hour', resource('STAR interview method', 'https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique'), resource('https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique')],
      ]],
    ],
  },
  frontend: {
    targetRole: 'Frontend Engineer',
    weeks: [
      ['React fundamentals & testing', 'Build reliable components and test user-visible behavior.', [
        ['Test a form and its validation states', '2 hours', resource('Testing Library', 'https://testing-library.com/docs/'), resource('https://testing-library.com/docs/')],
        ['Refactor one component into accessible reusable pieces', '2 hours', resource('React documentation', 'https://react.dev/learn'), resource('https://react.dev/learn')],
      ]],
      ['TypeScript & state management', 'Use types and predictable state to reduce UI bugs.', [
        ['Add TypeScript types to a page data model', '2 hours', resource('TypeScript Handbook', 'https://www.typescriptlang.org/docs/handbook/intro.html'), resource('https://www.typescriptlang.org/docs/handbook/intro.html')],
        ['Document where local state and shared state belong', '1 hour', resource('Redux style guide', 'https://redux.js.org/style-guide/'), resource('https://redux.js.org/style-guide/')],
      ]],
      ['Responsive design & accessibility', 'Make key flows usable across screen sizes and input methods.', [
        ['Check the main flow at mobile, tablet, and desktop widths', '2 hours', resource('MDN responsive design', 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design'), resource('https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design')],
        ['Audit keyboard navigation and form labels on one page', '1.5 hours', resource('W3C WAI tutorials', 'https://www.w3.org/WAI/tutorials/'), resource('https://www.w3.org/WAI/tutorials/')],
      ]],
      ['Performance & rendering', 'Measure frontend performance and improve the largest bottleneck.', [
        ['Capture a Lighthouse report and prioritize its top issue', '1.5 hours', resource('Lighthouse documentation', 'https://developer.chrome.com/docs/lighthouse/overview/'), resource('https://developer.chrome.com/docs/lighthouse/overview/')],
        ['Lazy-load one route or expensive component', '2 hours', resource('React lazy', 'https://react.dev/reference/react/lazy'), resource('https://react.dev/reference/react/lazy')],
      ]],
      ['Frontend architecture', 'Keep page, component, and API responsibilities clear.', [
        ['Map one user flow from route through service call to response', '1 hour', resource('React thinking in React', 'https://react.dev/learn/thinking-in-react'), resource('https://react.dev/learn/thinking-in-react')],
        ['Add an error and empty state to a data-backed page', '1.5 hours', resource('React error boundaries', 'https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary'), resource('https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary')],
      ]],
      ['Portfolio & interview practice', 'Present your frontend work with clear evidence and tradeoffs.', [
        ['Record before/after performance and accessibility improvements', '1 hour', resource('Web.dev learn', 'https://web.dev/learn/'), resource('https://web.dev/learn/')],
        ['Practice explaining a UI architecture decision in two minutes', '1 hour', resource('STAR interview method', 'https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique'), resource('https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique')],
      ]],
    ],
  },
  backend: {
    targetRole: 'Backend Engineer',
    weeks: [
      ['API contracts & validation', 'Design predictable endpoints with useful validation and errors.', [
        ['Document request and response examples for one API', '1 hour', resource('OpenAPI specification', 'https://spec.openapis.org/oas/latest.html'), resource('https://spec.openapis.org/oas/latest.html')],
        ['Add validation for invalid IDs and missing fields', '2 hours', resource('Express guide', 'https://expressjs.com/en/guide/routing.html'), resource('https://expressjs.com/en/guide/routing.html')],
      ]],
      ['Database modeling & query plans', 'Choose indexes and schemas to fit real access patterns.', [
        ['Model a user-owned resource with ownership checks', '2 hours', resource('Mongoose guide', 'https://mongoosejs.com/docs/guide.html'), resource('https://mongoosejs.com/docs/guide.html')],
        ['Use EXPLAIN to inspect a filtered and sorted query', '2 hours', resource('PostgreSQL EXPLAIN', 'https://www.postgresql.org/docs/current/using-explain.html'), resource('https://www.postgresql.org/docs/current/using-explain.html')],
      ]],
      ['Authentication & security', 'Apply safe authentication, authorization, and input handling.', [
        ['Check that every private query is scoped to the signed-in user', '1.5 hours', resource('OWASP API Security', 'https://owasp.org/www-project-api-security/'), resource('https://owasp.org/www-project-api-security/')],
        ['Review password handling, token expiry, and secret configuration', '1 hour', resource('OWASP Authentication Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html'), resource('https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html')],
      ]],
      ['Caching & background work', 'Improve latency and move slow tasks out of request paths.', [
        ['Add a cache to a safe read-only endpoint', '2 hours', resource('Redis documentation', 'https://redis.io/docs/latest/'), resource('https://redis.io/docs/latest/')],
        ['Identify a slow operation that should run asynchronously', '1 hour', resource('Node.js event loop guide', 'https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop'), resource('https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop')],
      ]],
      ['Reliability & deployment', 'Make the service observable and easy to run consistently.', [
        ['Add health checks and structured error logging', '1.5 hours', resource('Express error handling', 'https://expressjs.com/en/guide/error-handling.html'), resource('https://expressjs.com/en/guide/error-handling.html')],
        ['Containerize the API and database for local development', '2.5 hours', resource('Docker Compose quickstart', 'https://docs.docker.com/compose/gettingstarted/'), resource('https://docs.docker.com/compose/gettingstarted/')],
      ]],
      ['System design & interview practice', 'Explain service boundaries, data flow, and scaling tradeoffs.', [
        ['Design a rate-limited job application API', '2 hours', resource('System Design Primer', 'https://github.com/donnemartin/system-design-primer'), resource('https://github.com/donnemartin/system-design-primer')],
        ['Practice a timed SQL and API design exercise', '2 hours', resource('PostgreSQL tutorial', 'https://www.postgresql.org/docs/current/tutorial.html'), resource('https://www.postgresql.org/docs/current/tutorial.html')],
      ]],
    ],
  },
};

function buildWeeks(focus) {
  return plans[focus].weeks.map(([title, goal, tasks], weekIndex) => ({
    weekNumber: weekIndex + 1,
    title,
    goal,
    completed: false,
    tasks: tasks.map(([text, duration, taskResource]) => ({
      id: `w${weekIndex + 1}_${text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}`,
      text,
      duration,
      completed: false,
      resourceTitle: taskResource.title,
      resourceUrl: taskResource.url,
    })),
  }));
}

const gapWeekByCategory = {
  'Frontend & UI Engineering': 1,
  'Databases & Data Modeling': 2,
  'Backend & System Architecture': 3,
  'DevOps, CI/CD & Cloud Basics': 4,
  'Core CS & Algorithms': 6,
};

function addResumeFocusTasks(weeks, resume, targetRole, focus, completedByTask = new Map()) {
  if (!resume) return { weeks, personalizedSkills: [] };
  const aiAnalysis = resume.aiRoleAnalysis?.targetRole === targetRole
    ? resume.aiRoleAnalysis.result
    : null;
  const fallbackAnalysis = buildSkillGapData(resume, targetRole);
  const sourceCategories = aiAnalysis?.skillsCategorized?.length
    ? aiAnalysis.skillsCategorized
    : fallbackAnalysis.skillsCategorized;
  const gaps = sourceCategories
    .flatMap((category) => (category.missing || []).map((item) => ({ ...item, category: category.category })))
    .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] ?? 1) - ({ high: 0, medium: 1, low: 2 }[b.priority] ?? 1))
    .slice(0, 12);
  const personalizedSkills = [];
  gaps.forEach((gap) => {
    const slug = gap.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const task = {
      id: `resume_gap_${slug}`,
      text: aiAnalysis
        ? `${gap.name}: ${gap.actionableResource || 'Complete a hands-on project and document the result.'}`
        : `Build a small example that demonstrates ${gap.name}, then document what you implemented.`,
      duration: gap.priority === 'high' ? '3 hours' : '2 hours',
      completed: completedByTask.get(`resume_gap_${slug}`) || false,
      resourceTitle: aiAnalysis ? 'AI-recommended next step for this resume gap' : 'Review the detected resume skill gap',
      resourceUrl: '/skill-gap',
    };
    const weekNumber = aiAnalysis ? Math.min(5, personalizedSkills.length === 1 ? 1 : Math.ceil(personalizedSkills.length / 3)) : (gapWeekByCategory[gap.category] || 6);
    const week = weeks.find((entry) => entry.weekNumber === weekNumber);
    if (week) week.tasks.push(task);
    personalizedSkills.push(gap.name);
  });
  weeks.forEach((week) => { week.completed = week.tasks.length > 0 && week.tasks.every((task) => task.completed); });
  return { weeks, personalizedSkills };
}

function buildAiWeeks(targetRole, resume) {
  const analysis = resume?.aiRoleAnalysis?.targetRole === targetRole ? resume.aiRoleAnalysis.result : null;
  if (!analysis?.skillsCategorized?.length) return null;
  const priorityWeight = { high: 0, medium: 1, low: 2 };
  const gaps = analysis.skillsCategorized
    .flatMap((category) => (category.missing || []).map((gap) => ({ ...gap, category: category.category })))
    .sort((a, b) => (priorityWeight[a.priority] ?? 1) - (priorityWeight[b.priority] ?? 1))
    .slice(0, 5);
  const strengths = (analysis.strengths || []).slice(0, 2);
  const weeks = gaps.map((gap, index) => {
    const slug = String(gap.name).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    return {
      weekNumber: index + 1,
      title: `${gap.name}: learn, build, and prove it`,
      goal: `Close this ${gap.priority || 'medium'}-priority gap for ${targetRole} with work you can accurately show on your resume.`,
      completed: false,
      tasks: [
        {
          id: `ai_gap_learn_${slug}`,
          text: `${gap.name}: ${gap.actionableResource || gap.nextStep || 'Complete a hands-on learning exercise.'}`,
          completed: false,
          duration: gap.priority === 'high' ? '3 hours' : '2 hours',
          resourceTitle: 'AI recommendation from your skill-gap analysis',
          resourceUrl: '/skill-gap',
        },
        {
          id: `ai_gap_prove_${slug}`,
          text: `Build or extend one project with ${gap.name}, then record the implementation, result, and a truthful resume bullet.`,
          completed: false,
          duration: '3 hours',
          resourceTitle: 'Turn this skill into portfolio evidence',
          resourceUrl: '/resume-intelligence',
        },
      ],
    };
  });
  while (weeks.length < 5) {
    const weekNumber = weeks.length + 1;
    weeks.push({
      weekNumber,
      title: 'Integrate your new role skills',
      goal: `Connect the skills you practiced into one coherent ${targetRole} project.`,
      completed: false,
      tasks: [{
        id: `ai_gap_integration_${weekNumber}`,
        text: `Integrate the highest-priority skills from your roadmap into one project feature and write down the design decisions.`,
        completed: false,
        duration: '3 hours',
        resourceTitle: 'Portfolio integration task',
        resourceUrl: '/skill-gap',
      }],
    });
  }
  weeks.push({
    weekNumber: 6,
    title: 'Validate progress and prepare for interviews',
    goal: 'Turn the new skills into verifiable portfolio and interview evidence.',
    completed: false,
    tasks: [
    ...strengths.map((strength, index) => ({ id: `ai_strength_${index}`, text: `Document evidence for this existing strength: ${strength}`, completed: false, duration: '1 hour', resourceTitle: 'Resume evidence review', resourceUrl: '/resume-intelligence' })),
    { id: 'ai_interview_role_review', text: `Complete a mock interview for ${targetRole} and explain how your new projects address the identified gaps.`, completed: false, duration: '2 hours', resourceTitle: 'AI Mock Interview', resourceUrl: '/mock-interview' },
    ],
  });
  return weeks;
}

function toResponse(roadmap) {
  const weeks = roadmap.weeks.map((week) => ({
    weekNumber: week.weekNumber,
    title: week.title,
    goal: week.goal,
    completed: week.completed,
    tasks: week.tasks.map((task) => ({
      id: task.id,
      text: task.text,
      completed: task.completed,
      duration: task.duration,
      resourceTitle: task.resourceTitle,
      resourceUrl: task.resourceUrl,
    })),
  }));
  const tasks = weeks.flatMap((week) => week.tasks);
  const completedTasksCount = tasks.filter((task) => task.completed).length;
  const totalTasksCount = tasks.length;
  const currentWeek = weeks.find((week) => !week.completed)?.weekNumber || weeks.length;

  return {
    focus: roadmap.focus,
    targetRole: roadmap.targetRole,
    generatedBy: roadmap.generatedBy || 'role-and-resume-analysis',
    generatorVersion: roadmap.generatorVersion || 1,
    basedOnResumeName: roadmap.basedOnResumeName || '',
    personalizedSkills: roadmap.personalizedSkills || [],
    totalWeeks: weeks.length,
    currentWeek,
    progressPercent: totalTasksCount ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0,
    completedTasksCount,
    totalTasksCount,
    weeks,
  };
}

function focusForTargetRole(targetRole = '') {
  const value = targetRole.toLowerCase();
  if (value.includes('front')) return 'frontend';
  if (value.includes('back') || value.includes('api') || value.includes('platform')) return 'backend';
  return 'fullstack';
}

async function getOrCreateRoadmap(userId, targetRole = '') {
  let roadmap = await Roadmap.findOne({ user: userId });
  if (roadmap) return roadmap;

  const focus = focusForTargetRole(targetRole);
  try {
    roadmap = await Roadmap.create({
      user: userId,
      focus,
      targetRole: plans[focus].targetRole,
      weeks: buildWeeks(focus),
    });
    return roadmap;
  } catch (err) {
    if (err.code !== 11000) throw err;
    return Roadmap.findOne({ user: userId });
  }
}

async function getCurrentResume(userId) {
  const primary = await Resume.findOne({ user: userId, isPrimary: true });
  if (primary) return primary;
  return Resume.findOne({ user: userId }).sort({ uploadedAt: -1 });
}

async function refreshResumeFocus(roadmap, targetRole) {
  const resume = await getCurrentResume(roadmap.user);
  const resumeId = resume?._id?.toString() || '';
  const analysisAt = resume?.aiRoleAnalysis?.analyzedAt ? new Date(resume.aiRoleAnalysis.analyzedAt) : null;
  if ((roadmap.basedOnResume?.toString() || '') === resumeId && roadmap.targetRole === targetRole && String(roadmap.basedOnAnalysisAt || '') === String(analysisAt || '') && roadmap.generatorVersion === 2) return;

  const completedByTask = new Map(roadmap.weeks.flatMap((week) => week.tasks).map((task) => [task.id, task.completed]));
  const aiWeeks = buildAiWeeks(targetRole, resume);
  const weeks = (aiWeeks || buildWeeks(roadmap.focus)).map((week) => {
    week.tasks = week.tasks.map((task) => ({ ...task, completed: completedByTask.get(task.id) || false }));
    week.completed = week.tasks.length > 0 && week.tasks.every((task) => task.completed);
    return week;
  });
  const personalized = aiWeeks
    ? { weeks, personalizedSkills: aiWeeks.flatMap((week) => week.tasks.filter((task) => task.id.startsWith('ai_gap_')).map((task) => task.text.split(':')[0])) }
    : addResumeFocusTasks(weeks, resume, targetRole, roadmap.focus, completedByTask);
  roadmap.weeks = personalized.weeks;
  roadmap.basedOnResume = resume?._id || null;
  roadmap.basedOnResumeName = resume?.fileName || '';
  roadmap.targetRole = targetRole || roadmap.targetRole;
  roadmap.basedOnAnalysisAt = analysisAt;
  roadmap.generatedBy = aiWeeks ? `${resume?.aiRoleAnalysis?.result?.analysisProvider || 'AI'} skill-gap analysis` : 'role-and-resume-analysis';
  roadmap.generatorVersion = 2;
  roadmap.personalizedSkills = personalized.personalizedSkills;
  await roadmap.save();
}

exports.getRoadmap = async (req, res, next) => {
  try {
    const targetRole = req.user.targetRoleConfirmed ? req.user.targetRole : '';
    const roadmap = await getOrCreateRoadmap(req.user._id, targetRole);
    await refreshResumeFocus(roadmap, targetRole);
    res.json(toResponse(roadmap));
  } catch (err) {
    next(err);
  }
};

exports.toggleTask = async (req, res, next) => {
  try {
    const roadmap = await Roadmap.findOne({ user: req.user._id });
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found.' });
    const task = roadmap.weeks.flatMap((week) => week.tasks).find((item) => item.id === req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Roadmap task not found.' });

    task.completed = !task.completed;
    roadmap.weeks.forEach((week) => {
      week.completed = week.tasks.length > 0 && week.tasks.every((item) => item.completed);
    });
    await roadmap.save();
    const summary = toResponse(roadmap);
    try {
      const snapshotDate = new Date().toISOString().slice(0, 10);
      await ReadinessSnapshot.findOneAndUpdate(
        { user: req.user._id, targetRole: roadmap.targetRole, snapshotDate },
        {
          $set: { roadmapProgress: summary.progressPercent },
          $setOnInsert: { user: req.user._id, targetRole: roadmap.targetRole, snapshotDate },
        },
        { upsert: true, setDefaultsOnInsert: true },
      );
    } catch (snapshotError) {
      // Progress persistence is primary; history logging must not block a task update.
      console.warn('Could not save roadmap progress history:', snapshotError.message);
    }
    res.json({
      success: true,
      taskId: task.id,
      progressPercent: summary.progressPercent,
      completedTasksCount: summary.completedTasksCount,
      totalTasksCount: summary.totalTasksCount,
    });
  } catch (err) {
    next(err);
  }
};

exports.regenerateRoadmap = async (req, res, next) => {
  try {
    const selectedRole = req.user.targetRoleConfirmed ? req.user.targetRole : '';
    const roadmap = await getOrCreateRoadmap(req.user._id, selectedRole);
    const targetRole = selectedRole || roadmap.targetRole;
    const focus = req.body.focus || roadmap.focus;
    if (!Object.hasOwn(plans, focus)) {
      return res.status(400).json({ message: 'Choose fullstack, frontend, or backend as the roadmap focus.' });
    }
    const completedByTask = new Map(roadmap.weeks.flatMap((week) => week.tasks).map((task) => [task.id, task.completed]));
    roadmap.focus = focus;
    roadmap.targetRole = plans[focus].targetRole;
    const baseWeeks = buildWeeks(focus).map((week) => {
      week.tasks = week.tasks.map((task) => ({ ...task, completed: completedByTask.get(task.id) || false }));
      week.completed = week.tasks.length > 0 && week.tasks.every((task) => task.completed);
      return week;
    });
    const resume = await getCurrentResume(req.user._id);
    const aiWeeks = buildAiWeeks(targetRole, resume);
    const personalized = aiWeeks
      ? { weeks: aiWeeks, personalizedSkills: aiWeeks.flatMap((week) => week.tasks.filter((task) => task.id.startsWith('ai_gap_')).map((task) => task.text.split(':')[0])) }
      : addResumeFocusTasks(baseWeeks, resume, targetRole, focus, completedByTask);
    roadmap.weeks = personalized.weeks.map((week) => ({
      ...week,
      tasks: week.tasks.map((task) => ({ ...task, completed: completedByTask.get(task.id) || false })),
    }));
    roadmap.weeks.forEach((week) => { week.completed = week.tasks.length > 0 && week.tasks.every((task) => task.completed); });
    roadmap.basedOnResume = resume?._id || null;
    roadmap.basedOnResumeName = resume?.fileName || '';
    roadmap.basedOnAnalysisAt = resume?.aiRoleAnalysis?.analyzedAt ? new Date(resume.aiRoleAnalysis.analyzedAt) : null;
    roadmap.generatedBy = aiWeeks ? `${resume?.aiRoleAnalysis?.result?.analysisProvider || 'AI'} skill-gap analysis` : 'role-and-resume-analysis';
    roadmap.generatorVersion = 2;
    roadmap.personalizedSkills = personalized.personalizedSkills;
    await roadmap.save();
    res.json({ message: `Your ${plans[focus].targetRole} roadmap was updated. Completed tasks that remain in the plan were kept.` });
  } catch (err) {
    next(err);
  }
};

