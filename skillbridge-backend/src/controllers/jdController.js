// src/controllers/jdController.js
const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const { analyzeJDMatch } = require('../services/aiJDMatcher');

const SAMPLE_JDS = [
  {
    id: 'jd_fw_01',
    company: 'Freshworks Inc.',
    role: 'Associate Software Academy (Product Engineer)',
    location: 'Chennai (Global Infocity)',
    packageRange: '₹6.5 - ₹8.0 LPA',
    batchEligible: '2025 B.E. / B.Tech (CSE / IT / ECE)',
    eligibilityCgpa: '7.5 CGPA and above with no standing backlogs',
    driveDate: 'Campus Drive Upcoming',
    overview: 'Looking for enthusiastic engineering graduates with strong fundamentals in modern JavaScript, React, and backend RESTful services. Candidates must demonstrate sound understanding of data structures, clean code principles, and unit testing.',
    keywords: ['react', 'javascript', 'typescript', 'node.js', 'express', 'postgresql', 'mysql', 'testing', 'git', 'docker'],
    rawText: `Job Description: Associate Software Academy (Freshworks)
Locations: Chennai, Tamil Nadu, India
Eligibility: Minimum 75% or 7.5 CGPA.
Key Responsibilities:
- Design, build, and maintain frontend user experiences using React and TypeScript.
- Write robust, scalable server-side microservices using Node.js and Express.
- Work with relational and NoSQL databases (PostgreSQL, MongoDB).
- Implement automated test suites using Jest or standard testing libraries.
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
    driveDate: 'Campus Drive Upcoming',
    overview: 'Zoho is looking for problem solvers who can write clean, modular, and optimized code from first principles. Strong core programming (Java / C++ / Python / JS) and database design skills required.',
    keywords: ['java', 'c++', 'c', 'python', 'javascript', 'sql', 'database', 'mongodb', 'data structures', 'algorithms', 'git'],
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
    driveDate: 'Campus Drive Upcoming',
    overview: 'TCS Digital hiring track for advanced technical engineering roles in Cloud, AI, and Fullstack systems engineering.',
    keywords: ['fullstack', 'react', 'node.js', 'python', 'java', 'sql', 'cloud', 'aws', 'docker', 'git'],
    rawText: `TCS Digital 2025 Campus Drive:
Eligible Streams: CSE, IT, AI-DS, ECE.
Candidates will undergo Digital Aptitude & Advanced Coding Test followed by Technical & Managerial Interviews.`,
  },
];

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// @desc    Get sample job descriptions for placement drives
// @route   GET /api/jd/samples
// @access  Public or Protected
exports.getSampleJDs = async (req, res, next) => {
  try {
    res.json(SAMPLE_JDS);
  } catch (err) {
    next(err);
  }
};

// @desc    Match a Job Description against user's resume
// @route   POST /api/jd/match
// @access  Private
exports.matchJD = async (req, res, next) => {
  try {
    const { text, resumeId } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Job Description text or sample ID is required' });
    }

    // Find sample if ID was sent, otherwise use the raw text
    const sample = SAMPLE_JDS.find(s => s.id === text || text.includes(s.company));
    const jdText = sample ? sample.rawText : text;
    const company = sample ? sample.company : 'Custom Target Company';
    const role = sample ? sample.role : 'Target Role';

    // Find the candidate's resume
    let resume = null;
    if (resumeId && mongoose.isValidObjectId(resumeId)) {
      resume = await Resume.findOne({ _id: resumeId, user: req.user._id });
    }
    if (!resume) {
      resume = await Resume.findOne({ user: req.user._id, isPrimary: true });
    }
    if (!resume) {
      resume = await Resume.findOne({ user: req.user._id }).sort({ uploadedAt: -1 });
    }

    if (!resume) {
      return res.status(404).json({ message: 'No resume found for matching. Please upload a resume first.' });
    }

    const fullResumeText = String(resume.extractedText || '').trim();
    const aiResult = await analyzeJDMatch({
      jdText,
      resumeText: fullResumeText,
      resumeName: resume.fileName,
      sample,
    });
    if (aiResult) {
      return res.json({
        id: sample ? sample.id : `jd_custom_${Date.now()}`,
        company: sample?.company || aiResult.company,
        role: sample?.role || aiResult.role,
        location: sample?.location || 'Not specified',
        packageRange: sample?.packageRange || 'Not specified',
        batchEligible: sample?.batchEligible || 'Not listed in the pasted description',
        eligibilityCgpa: sample?.eligibilityCgpa || 'Not listed in the pasted description',
        driveDate: sample?.driveDate || 'Not listed in the pasted description',
        matchPercentage: aiResult.matchPercentage,
        analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        matchedResumeId: resume._id,
        resumeFileName: resume.fileName,
        overview: aiResult.overview,
        requirements: aiResult.requirements,
        missingCount: aiResult.missingCount,
        matchedCount: aiResult.matchedCount,
        analyzedSkillCount: aiResult.analyzedSkillCount,
        recommendation: aiResult.recommendation,
        analysisProvider: aiResult.analysisProvider,
        analysisModel: aiResult.analysisModel,
        analysisMode: 'AI semantic resume-to-job comparison',
      });
    }

    const resumeText = fullResumeText.toLowerCase();

    // Determine target keywords to look for from the JD
    const commonTechSkills = [
      'react', 'angular', 'vue', 'javascript', 'typescript', 'html', 'css', 'tailwind',
      'node.js', 'node', 'express', 'python', 'django', 'fastapi', 'java', 'spring',
      'c++', 'c#', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'docker', 'kubernetes',
      'aws', 'azure', 'git', 'github', 'ci/cd', 'rest', 'api', 'testing', 'jest', 'linux'
    ];

    const jdLower = jdText.toLowerCase();
    const jdSkills = commonTechSkills.filter(s => {
      const escaped = escapeRegExp(s);
      const isWordCharEnd = /\w/.test(s[s.length - 1]);
      const endPat = isWordCharEnd ? '\\b' : '(?:$|[\\s,;()\\[\\]/])';
      return new RegExp(`\\b${escaped}${endPat}`, 'i').test(jdLower);
    });

    if (jdSkills.length === 0) {
      return res.status(422).json({ message: 'No supported technical skills were found in this job description. Add technical requirements and try again.' });
    }

    const matchedList = [];
    const missingList = [];
    const goodToHaveList = [];

    jdSkills.forEach(skill => {
      const escaped = escapeRegExp(skill);
      const isWordCharEnd = /\w/.test(skill[skill.length - 1]);
      const endPat = isWordCharEnd ? '\\b' : '(?:$|[\\s,;()\\[\\]/])';
      const isMatched = new RegExp(`\\b${escaped}${endPat}`, 'i').test(resumeText);

      const capitalized = skill.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      const position = jdLower.indexOf(skill);
      const nearbyText = jdLower.slice(Math.max(0, position - 80), Math.min(jdLower.length, position + skill.length + 80));
      const isOptional = /nice[- ]to[- ]have|good[- ]to[- ]have|preferred|desirable|bonus|\ba plus\b/.test(nearbyText);

      if (isMatched) {
        const item = {
          skill: capitalized,
          matched: true,
          context: `Detected in your uploaded resume (${resume.fileName})`,
        };
        (isOptional ? goodToHaveList : matchedList).push(item);
      } else {
        const item = {
          skill: capitalized,
          matched: false,
          context: `Mentioned in ${company}'s job description but not found in your resume`,
        };
        (isOptional ? goodToHaveList : missingList).push(item);
      }
    });

    const totalMatched = matchedList.filter((item) => item.matched).length + goodToHaveList.filter((item) => item.matched).length;
    const matchPercentage = Math.round((totalMatched / jdSkills.length) * 100);
    const missingSkills = [...missingList, ...goodToHaveList.filter((item) => !item.matched)];

    res.json({
      id: sample ? sample.id : `jd_custom_${Date.now()}`,
      company,
      role,
      location: sample ? sample.location : 'Not specified',
      packageRange: sample ? sample.packageRange : 'Not specified',
      batchEligible: sample ? sample.batchEligible : 'Not listed in the pasted description',
      eligibilityCgpa: sample ? sample.eligibilityCgpa : 'Not listed in the pasted description',
      driveDate: sample ? sample.driveDate : 'Not listed in the pasted description',
      matchPercentage,
      analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      matchedResumeId: resume._id,
      resumeFileName: resume.fileName,
      overview: sample ? sample.overview : 'Custom Job Description parsed and matched against your resume profile.',
      requirements: {
        mustHave: [...matchedList, ...missingList],
        goodToHave: goodToHaveList,
      },
      missingCount: missingSkills.length,
      matchedCount: totalMatched,
      analyzedSkillCount: jdSkills.length,
      analysisProvider: 'Local keyword fallback',
      analysisMode: 'Keyword presence only; AI analysis was unavailable',
      recommendation: missingSkills.length === 0
        ? '🎯 Outstanding fit! Your resume matches all core technical criteria for this role.'
        : `💡 Review these detected skill gaps and include them only if they reflect your actual experience: ${missingSkills.slice(0, 3).map(m => m.skill).join(', ')}.`
    });
  } catch (err) {
    next(err);
  }
};
