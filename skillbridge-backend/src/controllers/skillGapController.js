const Resume = require('../models/Resume');
const { analyzeResumeForRole } = require('../services/aiResumeAnalysis');

const GROUPS = [
  {
    category: 'Frontend & UI Engineering',
    categoryLabel: 'Frontend Development',
    skills: [
      { name: 'React', terms: ['react'], resource: 'React official documentation' },
      { name: 'JavaScript', terms: ['javascript', 'ecmascript'], resource: 'MDN JavaScript Guide' },
      { name: 'TypeScript', terms: ['typescript'], resource: 'TypeScript Handbook' },
      { name: 'HTML & CSS', terms: ['html', 'css'], resource: 'MDN HTML and CSS guides' },
      { name: 'Redux', terms: ['redux'], resource: 'Redux Toolkit documentation' },
      { name: 'Automated UI Testing', terms: ['jest', 'vitest', 'testing library', 'cypress'], resource: 'Testing Library documentation' },
    ],
  },
  {
    category: 'Backend & System Architecture',
    categoryLabel: 'Backend & APIs',
    skills: [
      { name: 'Node.js', terms: ['node.js', 'nodejs'], resource: 'Node.js Learn documentation' },
      { name: 'Express', terms: ['express.js', 'express'], resource: 'Express.js guide' },
      { name: 'REST APIs', terms: ['rest api', 'restful api'], resource: 'MDN HTTP and REST overview' },
      { name: 'Python or Java', terms: ['python', 'java'], resource: 'Choose one language and build a small API' },
      { name: 'Authentication & JWT', terms: ['jwt', 'authentication', 'oauth'], resource: 'OWASP Authentication Cheat Sheet' },
      { name: 'Caching', terms: ['redis', 'caching'], resource: 'Redis documentation' },
    ],
  },
  {
    category: 'Databases & Data Modeling',
    categoryLabel: 'Databases & Schema Design',
    skills: [
      { name: 'SQL', terms: ['sql', 'postgresql', 'mysql'], resource: 'PostgreSQL tutorial' },
      { name: 'MongoDB', terms: ['mongodb'], resource: 'MongoDB University learning paths' },
      { name: 'Database Schema Design', terms: ['schema', 'data model', 'normalization'], resource: 'PostgreSQL data modeling guide' },
      { name: 'Indexes & Query Tuning', terms: ['indexing', 'indexes', 'explain analyze', 'query optimization'], resource: 'Use The Index, Luke!' },
      { name: 'Transactions', terms: ['acid', 'transaction', 'isolation level'], resource: 'PostgreSQL transaction documentation' },
    ],
  },
  {
    category: 'DevOps, CI/CD & Cloud Basics',
    categoryLabel: 'DevOps & Deployment',
    skills: [
      { name: 'Git & GitHub', terms: ['git', 'github'], resource: 'GitHub Skills' },
      { name: 'Docker', terms: ['docker'], resource: 'Docker Get Started guide' },
      { name: 'Linux', terms: ['linux', 'bash'], resource: 'Linux command line basics' },
      { name: 'CI/CD', terms: ['ci/cd', 'github actions', 'jenkins'], resource: 'GitHub Actions documentation' },
      { name: 'AWS', terms: ['aws', 'amazon web services'], resource: 'AWS Skill Builder' },
      { name: 'Cloud deployment', terms: ['azure', 'gcp', 'google cloud', 'deployment'], resource: 'Deploy a sample application to a cloud provider' },
    ],
  },
  {
    category: 'Core CS & Algorithms',
    categoryLabel: 'Core CS & DSA',
    skills: [
      { name: 'Data Structures', terms: ['data structure', 'array', 'linked list', 'tree', 'graph'], resource: 'VisuAlgo data structure visualizations' },
      { name: 'Algorithms', terms: ['algorithm', 'sorting', 'searching', 'dynamic programming'], resource: 'Princeton Algorithms course' },
      { name: 'Object-Oriented Programming', terms: ['object-oriented', 'oop', 'inheritance', 'polymorphism'], resource: 'Refactoring Guru OOP concepts' },
      { name: 'Operating Systems', terms: ['operating system', 'process scheduling', 'deadlock'], resource: 'Operating Systems: Three Easy Pieces' },
      { name: 'Computer Networks', terms: ['computer network', 'tcp/ip', 'http protocol', 'networking'], resource: 'Cloudflare Learning Center' },
    ],
  },
];

const MECHANICAL_GROUPS = [
  {
    category: 'CAD & Technical Drawing', categoryLabel: 'CAD & Technical Drawing',
    skills: [
      { name: 'CAD fundamentals', terms: ['cad'], resource: 'CAD practice using a sample part drawing' },
      { name: 'SolidWorks', terms: ['solidworks'], resource: 'SolidWorks tutorials' },
      { name: 'AutoCAD', terms: ['autocad'], resource: 'AutoCAD learning resources' },
      { name: 'CATIA', terms: ['catia'], resource: 'CATIA learning resources' },
      { name: 'GD&T', terms: ['gd&t', 'geometric dimensioning'], resource: 'GD&T fundamentals' },
      { name: 'Engineering drawings', terms: ['engineering drawing', 'technical drawing'], resource: 'Engineering drawing practice' },
    ],
  },
  {
    category: 'Mechanical Analysis', categoryLabel: 'Mechanical Analysis',
    skills: [
      { name: 'Thermodynamics', terms: ['thermodynamics'], resource: 'Thermodynamics problem practice' },
      { name: 'Fluid mechanics', terms: ['fluid mechanics'], resource: 'Fluid mechanics problem practice' },
      { name: 'Heat transfer', terms: ['heat transfer'], resource: 'Heat transfer fundamentals' },
      { name: 'Finite element analysis', terms: ['finite element analysis', 'fea'], resource: 'Finite element analysis fundamentals' },
      { name: 'ANSYS', terms: ['ansys'], resource: 'ANSYS learning resources' },
      { name: 'Materials science', terms: ['materials science', 'material science'], resource: 'Materials science fundamentals' },
    ],
  },
  {
    category: 'Manufacturing & Quality', categoryLabel: 'Manufacturing & Quality',
    skills: [
      { name: 'Manufacturing processes', terms: ['manufacturing process', 'manufacturing processes'], resource: 'Manufacturing process overview' },
      { name: 'CNC machining', terms: ['cnc', 'computer numerical control'], resource: 'CNC machining fundamentals' },
      { name: 'Lean manufacturing', terms: ['lean manufacturing'], resource: 'Lean manufacturing overview' },
      { name: 'Quality control', terms: ['quality control', 'quality assurance'], resource: 'Quality control fundamentals' },
      { name: 'Metrology', terms: ['metrology'], resource: 'Measurement and metrology fundamentals' },
    ],
  },
  {
    category: 'Mechanical Design & Core Principles', categoryLabel: 'Mechanical Design & Core Principles',
    skills: [
      { name: 'Machine design', terms: ['machine design'], resource: 'Machine design fundamentals' },
      { name: 'Mechanics of materials', terms: ['mechanics of materials', 'strength of materials'], resource: 'Mechanics of materials practice' },
      { name: 'Engineering mechanics', terms: ['engineering mechanics'], resource: 'Engineering mechanics practice' },
      { name: 'Automotive systems', terms: ['automotive', 'vehicle systems'], resource: 'Automotive systems overview' },
      { name: 'Product design', terms: ['product design', 'design for manufacturing'], resource: 'Design for manufacturing fundamentals' },
    ],
  },
];

function containsTerm(text, term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[^a-z0-9])${escaped}s?(?:$|[^a-z0-9])`, 'i').test(text);
}

function priorityForCategory(category, targetRole) {
  const role = String(targetRole || '').toLowerCase();
  if (/mechanical|automotive|aerospace/.test(role)) {
    return category === 'Manufacturing & Quality' ? 'medium' : 'high';
  }
  const isFrontend = /front[- ]?end|ui|web interface/.test(role);
  const isBackend = /back[- ]?end|python|data engineer|platform/.test(role);
  if (isFrontend) {
    if (category === 'Frontend & UI Engineering' || category === 'Core CS & Algorithms') return 'high';
    if (category === 'Backend & System Architecture' || category === 'Databases & Data Modeling') return 'medium';
    return 'low';
  }
  if (isBackend) {
    if (category === 'Backend & System Architecture' || category === 'Databases & Data Modeling' || category === 'Core CS & Algorithms') return 'high';
    if (category === 'DevOps, CI/CD & Cloud Basics') return 'medium';
    return 'low';
  }
  if (category === 'DevOps, CI/CD & Cloud Basics') return 'medium';
  return 'high';
}

function analyzeGroup(group, resumeText, targetRole) {
  const have = [];
  const missing = [];
  const priority = priorityForCategory(group.category, targetRole);
  group.skills.forEach((skill) => {
    const found = skill.terms.some((term) => containsTerm(resumeText, term));
    if (found) {
      have.push({ name: skill.name, evidence: 'Mentioned in extracted resume text' });
    } else {
      missing.push({
        name: skill.name,
        priority,
        reason: `Not detected in the extracted resume text. It is a ${priority === 'high' ? 'core' : priority === 'medium' ? 'supporting' : 'lower-priority'} area for ${targetRole || 'your selected role'}. Alternate wording may not be recognized.`,
        actionableResource: skill.resource,
      });
    }
  });
  return { have, missing };
}

function buildSkillGapData(resume, targetRole = '') {
  const resumeText = (resume.extractedText || '').toLowerCase();
  const selectedRole = String(targetRole || '').trim();
  const isMechanical = /mechanical|automotive|aerospace/i.test(selectedRole);
  const isSoftware = /software|developer|full[ -]?stack|front[ -]?end|back[ -]?end|devops|qa|quality assurance|data analyst|data engineer|python/i.test(selectedRole);
  const groups = isMechanical ? MECHANICAL_GROUPS : isSoftware ? GROUPS : null;
  if (!groups) {
    return {
      analysisAvailable: false,
      targetProfile: selectedRole,
      message: selectedRole ? `A role-specific skill list is not available for “${selectedRole}” yet. No unrelated software score was calculated.` : 'Choose and confirm a target role in your profile before calculating role-specific skill coverage.',
      resumeSkillCoverage: null,
      overallReadiness: null,
      categoryBars: [],
      skillsCategorized: [],
    };
  }
  const skillsCategorized = groups.map((group) => ({
    category: group.category,
    ...analyzeGroup(group, resumeText, selectedRole),
  }));

  const categoryBars = groups.map((group, index) => {
    const detectedCount = skillsCategorized[index].have.length;
    const totalSkills = group.skills.length;
    const current = Math.round((detectedCount / totalSkills) * 100);
    return {
      category: group.categoryLabel,
      current,
      detectedCount,
      totalSkills,
    };
  });

  const allSkills = groups.flatMap((group) => group.skills);
  const matchedCount = skillsCategorized.reduce((total, category) => total + category.have.length, 0);
  const resumeSkillCoverage = Math.round((matchedCount / allSkills.length) * 100);

  return {
    analysisAvailable: true,
    overallReadiness: resumeSkillCoverage,
    resumeSkillCoverage,
    targetProfile: selectedRole,
    categoryBars,
    skillsCategorized,
  };
}

exports.buildSkillGapData = buildSkillGapData;

exports.getSkillGap = async (req, res, next) => {
  try {
    const targetRole = req.user.targetRoleConfirmed ? String(req.user.targetRole || '').trim() : '';
    if (!targetRole) {
      return res.json({
        analysisAvailable: false,
        targetProfile: '',
        message: 'Choose and save a target role in your profile before requesting an AI role analysis.',
        resumeSkillCoverage: null,
        overallReadiness: null,
        categoryBars: [],
        skillsCategorized: [],
      });
    }

    const resume = await Resume.findOne({ user: req.user._id, isPrimary: true })
      || await Resume.findOne({ user: req.user._id }).sort({ uploadedAt: -1 });

    if (!resume) {
      return res.status(404).json({ message: 'Upload a resume to generate your skill gap analysis.' });
    }

    const analysis = await analyzeResumeForRole(resume, targetRole, { refresh: req.query.refresh === 'true' });
    res.json(analysis);
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ message: err.message, code: err.code });
    next(err);
  }
};

