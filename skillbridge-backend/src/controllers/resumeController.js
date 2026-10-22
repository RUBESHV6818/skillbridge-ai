// src/controllers/resumeController.js
const fs = require('fs');
const path = require('path');
const Resume = require('../models/Resume');
const { extractTextFromFile } = require('../services/pdfService');

// Helper to build placeholder intelligence JSON matching frontend mock
function buildIntelligence(resume) {
  // Simple static example; replace with Gemini output later
  return {
    atsScore: resume.atsScore ?? 78,
    targetRole: resume.targetRole || 'Software Engineer',
    matchedKeywordsCount: resume.matchedKeywordsCount ?? 12,
    missingKeywordsCount: resume.missingKeywordsCount ?? 5,
    extractedSkills: ['React', 'Node.js', 'Express', 'MongoDB'],
    suggestions: [
      'Add a section for testing frameworks (Jest, Mocha).',
      'Include quantitative achievements (e.g., "Improved load time by 30%.")',
    ],
    // Additional fields that the frontend may expect
    extractedTextLength: resume.extractedTextLength ?? 0,
  };
}

// @desc    Get all resumes for logged‑in user
// @route   GET /api/resumes
// @access  Private
exports.getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort({ uploadedAt: -1 });
    res.json(resumes.map((r) => r.toResponseJSON()));
  } catch (err) {
    next(err);
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
    const extractedText = await extractTextFromFile(file);
    const extractedLength = extractedText.length;

    // Determine if this should be primary (first resume for user)
    const existingCount = await Resume.countDocuments({ user: req.user._id });
    const isPrimary = existingCount === 0;

    const resume = new Resume({
      user: req.user._id,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      filePath: file.path,
      uploadedAt: new Date(),
      isPrimary,
      // Placeholder analysis values – will be replaced by Gemini later
      atsScore: null,
      targetRole: '',
      matchedKeywordsCount: 0,
      missingKeywordsCount: 0,
      extractedTextLength: extractedLength,
    });

    await resume.save();
    // If this is the first resume, also set lastAnalysed to now (optional)
    if (isPrimary) {
      resume.lastAnalysed = new Date();
      await resume.save();
    }
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
    // Unset other resumes
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
    // Remove file from disk
    if (fs.existsSync(resume.filePath)) {
      fs.unlinkSync(resume.filePath);
    }
    await resume.remove();
    res.json({ success: true, deletedId: id });
  } catch (err) {
    next(err);
  }
};

// @desc    Get placeholder intelligence data for a resume
// @route   GET /api/resumes/:id/intelligence
// @access  Private
exports.getIntelligence = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findOne({ _id: id, user: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    const intel = buildIntelligence(resume);
    // Also update lastAnalysed timestamp
    resume.lastAnalysed = new Date();
    await resume.save();
    res.json(intel);
  } catch (err) {
    next(err);
  }
};
