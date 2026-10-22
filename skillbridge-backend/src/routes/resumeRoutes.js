// src/routes/resumeRoutes.js
const express = require('express');
const { resumeUpload } = require('../middleware/upload');
const {
  getResumes,
  uploadResume,
  setPrimaryResume,
  deleteResume,
  getIntelligence,
} = require('../controllers/resumeController');

const router = express.Router();

// GET /api/resumes - list user's resumes
router.get('/', getResumes);

// POST /api/resumes/upload - upload a resume file
router.post('/upload', resumeUpload.single('resume'), uploadResume);

// PATCH /api/resumes/:id/set-primary - mark a resume as primary
router.patch('/:id/set-primary', setPrimaryResume);

// DELETE /api/resumes/:id - delete a resume
router.delete('/:id', deleteResume);

// GET /api/resumes/:id/intelligence - placeholder intelligence data
router.get('/:id/intelligence', getIntelligence);

module.exports = router;
