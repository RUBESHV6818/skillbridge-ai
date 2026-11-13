// src/controllers/resumeController.js
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const PlatformSettings = require('../models/PlatformSettings');
const { extractTextFromFile } = require('../services/pdfService');
const { createNotification } = require('../services/notificationService');
const { analyzeResumeIntelligence } = require('../services/aiResumeIntelligence');

// Curated tech skills vocabulary for intelligent extraction
const SKILL_DICTIONARY = {
  frontend: [
    'react', 'react.js', 'vue', 'vue.js', 'angular', 'svelte', 'next.js', 'nuxt.js',
    'javascript', 'typescript', 'html', 'html5', 'css', 'css3', 'tailwind', 'tailwind css',
    'bootstrap', 'sass', 'redux', 'redux toolkit', 'material-ui', 'mui', 'webpack', 'vite'
  ],
  backend: [
    'node.js', 'node', 'express', 'express.js', 'nest.js', 'nestjs', 'python', 'django',
    'flask', 'fastapi', 'java', 'spring', 'spring boot', 'c++', 'c#', '.net', 'asp.net',
    'golang', 'go', 'rust', 'ruby', 'rails', 'php', 'laravel', 'rest', 'restful api',
    'graphql', 'grpc', 'jwt', 'websockets', 'microservices'
  ],
  database: [
    'mongodb', 'postgresql', 'postgres', 'mysql', 'sql', 'sqlite', 'redis', 'elasticsearch',
    'cassandra', 'dynamodb', 'mariadb', 'oracle', 'firebase', 'supabase', 'prisma', 'mongoose'
  ],
  tools: [
    'git', 'github', 'gitlab', 'docker', 'kubernetes', 'k8s', 'aws', 'amazon web services',
    'azure', 'gcp', 'google cloud', 'ci/cd', 'jenkins', 'github actions', 'linux', 'bash',
    'jira', 'postman', 'nginx', 'terraform', 'figma'
  ],
  engineering: [
    'solidworks', 'autocad', 'catia', 'fusion 360', 'ansys', 'siemens nx', 'creo', 'gd&t',
    'thermodynamics', 'fluid mechanics', 'heat transfer', 'finite element analysis', 'fea',
    'manufacturing processes', 'cnc', 'lean manufacturing', 'quality control', 'metrology',
    'machine design', 'mechanics of materials', 'strength of materials', 'engineering mechanics',
    'automotive', 'vehicle systems', 'materials science', 'product design', 'cad'
  ],
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Intelligently extract categorized skills from real text
function extractSkillsFromText(text) {
  const normalized = (text || '').toLowerCase();
  const extracted = {
    frontend: [],
    backend: [],
    database: [],
    tools: [],
    engineering: [],
  };

  for (const [category, keywords] of Object.entries(SKILL_DICTIONARY)) {
    for (const kw of keywords) {
      const escaped = escapeRegExp(kw);
      const isWordCharStart = /\w/.test(kw[0]);
      const isWordCharEnd = /\w/.test(kw[kw.length - 1]);

      const startPattern = isWordCharStart ? '\\b' : '(?:^|[\\s,;()\\[\\]/])';
      const endPattern = isWordCharEnd ? '\\b' : '(?:$|[\\s,;()\\[\\]/])';

      const regex = new RegExp(`${startPattern}${escaped}${endPattern}`, 'i');
      if (regex.test(normalized)) {
        // Capitalize nicely for display
        const displayKw = kw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        extracted[category].push(displayKw);
      }
    }
  }

  return extracted;
}

// Produce a transparent, rule-based content signal from extracted text.
function analyzeResumeText(text, extractedSkills, atsWeights = {}) {
  const lines = (text || '').split('\n').map(l => l.trim()).filter(Boolean);
  const totalWords = text ? text.split(/\s+/).length : 0;

  // 1. Check sections
  const lower = (text || '').toLowerCase();
  const hasEducation = /education|academic|b\.tech|b\.e|degree|university|college/i.test(lower);
  const hasSkills = /skills|technical skills|competencies|technologies/i.test(lower);
  const hasProjects = /projects|personal projects|academic projects/i.test(lower);
  const hasExperience = /experience|internship|work experience|employment/i.test(lower);

  let sectionScore = 50;
  if (hasEducation) sectionScore += 12;
  if (hasSkills) sectionScore += 13;
  if (hasProjects) sectionScore += 15;
  if (hasExperience) sectionScore += 10;
  sectionScore = Math.min(sectionScore, 100);

  // 2. Keyword density
  const totalSkillsCount =
    extractedSkills.frontend.length +
    extractedSkills.backend.length +
    extractedSkills.database.length +
    extractedSkills.tools.length +
    extractedSkills.engineering.length;

  let keywordScore = Math.min(40 + totalSkillsCount * 4, 95);

  // 3. Length and section signals (this does not inspect visual formatting)
  let formatScore = 80;
  if (totalWords > 200 && totalWords < 1200) formatScore += 15;
  if (lines.length > 25) formatScore += 5;
  formatScore = Math.min(formatScore, 98);

  // 4. Action & Impact verbs (looking for numbers, %, metrics)
  const metricMatches = (text || '').match(/\b\d+(\.\d+)?%|\b\d+\+\b|\b\$\d+|\b\d+\s*(users|clients|requests|ms|sec)/gi) || [];
  let impactScore = Math.min(50 + metricMatches.length * 8, 92);

  // Overall Score
  const overallScore = Math.round(
    sectionScore * (atsWeights.sectionIntegrity ?? 25) / 100 +
    keywordScore * (atsWeights.keywordDensity ?? 35) / 100 +
    formatScore * (atsWeights.resumeFormatting ?? 20) / 100 +
    impactScore * (atsWeights.impactActionVerbs ?? 20) / 100
  );

  const breakdown = [
    {
      id: 'sec_format',
      label: 'Length & Text Structure',
      score: formatScore,
      max: 100,
      status: formatScore >= 80 ? 'good' : 'warning',
      description: `Extracted ${totalWords} words across ${lines.length} non-empty lines. This text check cannot assess visual layout or ATS compatibility.`,
    },
    {
      id: 'sec_keywords',
      label: 'Detected Technical Skills',
      score: keywordScore,
      max: 100,
      status: keywordScore >= 75 ? 'good' : 'warning',
      description: `Detected ${totalSkillsCount} listed technical or engineering terms across software, tools, and mechanical engineering vocabularies. A mention does not establish proficiency or job fit.`,
    },
    {
      id: 'sec_sections',
      label: 'Section Completeness',
      score: sectionScore,
      max: 100,
      status: sectionScore >= 80 ? 'good' : 'warning',
      description: `Verification: Education (${hasEducation ? '✅' : '❌'}), Skills (${hasSkills ? '✅' : '❌'}), Projects (${hasProjects ? '✅' : '❌'}), Experience/Internships (${hasExperience ? '✅' : '❌'}).`,
    },
    {
      id: 'sec_impact',
      label: 'Numbers & Metrics Found',
      score: impactScore,
      max: 100,
      status: impactScore >= 70 ? 'good' : 'warning',
      description: `Found ${metricMatches.length} number or percentage patterns in the extracted text. Their context and accuracy are not verified.`,
    },
  ];

  // Suggestions preserve the candidate's claims and never invent outcomes.
  const rewriteSuggestions = [];

  // Find candidate bullet points to improve
  const bulletCandidates = lines.filter(l => l.length > 40 && l.length < 160 && !l.endsWith(':'));

  if (bulletCandidates.length > 0) {
    const b1 = bulletCandidates[0];
    rewriteSuggestions.push({
      id: 'sug_01',
      section: 'Projects / Technical Highlights',
      severity: 'recommended',
      before: b1,
      after: `${b1.replace(/^[-•*]\s*/, '')} Add a specific result only if you can verify it.`,
      rationale: 'Clarify your contribution and include a real, verifiable outcome where available.',
      status: 'pending',
    });
  }

  if (bulletCandidates.length > 1) {
    const b2 = bulletCandidates[1];
    rewriteSuggestions.push({
      id: 'sug_02',
      section: 'Technical Experience',
      severity: 'recommended',
      before: b2,
      after: `${b2.replace(/^[-•*]\s*/, '')} Add a specific result only if you can verify it.`,
      rationale: 'Make the action and your contribution clear; do not add metrics you did not measure.',
      status: 'pending',
    });
  }

  if (rewriteSuggestions.length === 0) {
    rewriteSuggestions.push({
      id: 'sug_01',
      section: 'Core Summary & Impact',
      severity: 'recommended',
      before: '',
      after: 'Add a short summary describing your actual role, strongest relevant skills, and one project or experience you can discuss.',
      rationale: 'No suitable resume line was found to rewrite. This is a general prompt, not text extracted from your resume.',
      status: 'pending',
    });
  }

  return {
    overallScore,
    breakdown,
    extractedSkills,
    rewriteSuggestions,
  };
}

// Build intelligence response
async function buildIntelligence(resume, user) {
  const targetRole = user?.targetRoleConfirmed ? user.targetRole : '';
  const aiAnalysis = await analyzeResumeIntelligence(resume, targetRole);
  const extractedSkills = extractSkillsFromText(resume.extractedText);
  const settings = await PlatformSettings.findOne({ key: 'global' }).select('atsWeights');
  const analysis = aiAnalysis || analyzeResumeText(resume.extractedText, extractedSkills, settings?.atsWeights);

  return {
    resumeId: resume._id,
    fileName: resume.fileName,
    overallScore: analysis.overallScore,
    targetRole: user?.targetRoleConfirmed ? user.targetRole : 'Not selected',
    analysisProvider: aiAnalysis ? aiAnalysis.analysisProvider : 'Text analysis fallback',
    analysisModel: aiAnalysis?.analysisModel || '',
    analysisSummary: aiAnalysis?.summary || '',
    matchedKeywordsCount:
      extractedSkills.frontend.length +
      extractedSkills.backend.length +
      extractedSkills.database.length +
      extractedSkills.tools.length +
      extractedSkills.engineering.length,
    missingKeywordsCount: null,
    breakdown: analysis.breakdown,
    extractedSkills: analysis.extractedSkills || extractedSkills,
    rewriteSuggestions: analysis.rewriteSuggestions,
    extractedTextLength: resume.extractedTextLength ?? (resume.extractedText ? resume.extractedText.length : 0),
  };
}

// @desc    Get all resumes for logged‑in user
// @route   GET /api/resumes
// @access  Private
exports.getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ uploadedAt: -1 });
    res.json(resumes.map(r => r.toResponseJSON()));
  } catch (err) {
    next(err);
  }
};

// @desc    Download a resume owned by the logged-in user
// @route   GET /api/resumes/:id/file
// @access  Private
exports.downloadResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ message: 'Resume not found' });

    const resume = await Resume.findOne({ _id: id, user: req.user._id }).select('filePath fileName');
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    const uploadRoot = path.resolve(__dirname, '../../uploads/resumes');
    const filePath = path.resolve(resume.filePath);
    if (!filePath.startsWith(`${uploadRoot}${path.sep}`)) {
      return res.status(404).json({ message: 'Resume file not found' });
    }
    await fs.promises.access(filePath, fs.constants.R_OK);
    const downloadName = path.basename(String(resume.fileName || 'resume').replace(/\\/g, '/'));
    return res.download(filePath, downloadName);
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 'EACCES') {
      return res.status(404).json({ message: 'Resume file not found' });
    }
    return next(err);
  }
};

// @desc    Upload a new resume file
// @route   POST /api/resumes/upload
// @access  Private
exports.uploadResume = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file provided' });
    }
    let extractedText;
    try {
      extractedText = await extractTextFromFile(file);
    } catch (error) {
      await fs.promises.unlink(file.path).catch(() => {});
      return res.status(400).json({ message: error.message || 'Could not read text from this resume.' });
    }
    const extractedLength = (extractedText || '').length;

    // Determine if this should be primary (first resume for user)
    const existingCount = await Resume.countDocuments({ user: req.user._id });
    const isPrimary = existingCount === 0;

    const extractedSkills = extractSkillsFromText(extractedText);
    const resume = new Resume({
      user: req.user._id,
      fileName: path.basename(String(file.originalname || 'resume').replace(/\\/g, '/')),
      fileSize: file.size,
      fileType: file.mimetype,
      filePath: file.path,
      uploadedAt: new Date(),
      lastAnalysed: null,
      isPrimary,
      atsScore: null,
      targetRole: req.user.targetRoleConfirmed ? req.user.targetRole : '',
      matchedKeywordsCount: Object.values(extractedSkills).reduce((count, skills) => count + skills.length, 0),
      missingKeywordsCount: null,
      extractedTextLength: extractedLength,
      extractedText: extractedText,
    });

    try {
      await resume.save();
    } catch (error) {
      await fs.promises.unlink(file.path).catch(() => {});
      throw error;
    }
    await createNotification(req.user._id, {
      title: 'Resume uploaded and text extracted',
      message: `${resume.fileName} is uploaded and its text was extracted. Open Resume Intelligence for an AI review.`,
      category: 'Resume',
      type: 'resume',
    });
    res.status(201).json(resume.toResponseJSON());
  } catch (err) {
    next(err);
  }
};

// @desc    Set a resume as primary
// @route   PATCH /api/resumes/:id/set-primary
// @access  Private
exports.setPrimaryResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findOne({ _id: id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    await Resume.updateMany({ user: req.user._id }, { isPrimary: false });
    resume.isPrimary = true;
    await resume.save();
    res.json({ success: true, primaryId: resume._id });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private
exports.deleteResume = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findOne({ _id: id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    await Resume.deleteOne({ _id: resume._id });
    const uploadRoot = path.resolve(__dirname, '../../uploads/resumes');
    const filePath = path.resolve(resume.filePath);
    if (filePath.startsWith(`${uploadRoot}${path.sep}`)) {
      await fs.promises.unlink(filePath).catch((error) => {
        if (error.code !== 'ENOENT') console.warn('Could not remove deleted resume file:', error.message);
      });
    }
    res.json({ success: true, deletedId: id });
  } catch (err) {
    next(err);
  }
};

// @desc    Get intelligence data for a resume
// @route   GET /api/resumes/:id/intelligence
// @access  Private
exports.getIntelligence = async (req, res, next) => {
  try {
    const { id } = req.params;
    let resume = null;

    if (id && mongoose.isValidObjectId(id)) {
      resume = await Resume.findOne({ _id: id, user: req.user._id });
    }

    // Fallback: If id is missing, not an ObjectId (e.g. 'res_01' or 'primary'), find primary or latest
    if (!resume) {
      resume = await Resume.findOne({ user: req.user._id, isPrimary: true });
    }
    if (!resume) {
      resume = await Resume.findOne({ user: req.user._id }).sort({ uploadedAt: -1 });
    }

    if (!resume) {
      return res.status(404).json({
        message: 'No resume found for analysis. Please upload a resume first.',
        breakdown: [],
        extractedSkills: { frontend: [], backend: [], database: [], tools: [], engineering: [] },
        rewriteSuggestions: []
      });
    }

    const intel = await buildIntelligence(resume, req.user);
    if (intel.analysisProvider && intel.analysisProvider !== 'Text analysis fallback') {
      resume.lastAnalysed = new Date();
      await resume.save();
    }
    res.json(intel);
  } catch (err) {
    next(err);
  }
};
