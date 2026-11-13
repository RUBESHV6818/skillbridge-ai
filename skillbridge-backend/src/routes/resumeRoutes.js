// src/routes/resumeRoutes.js
const express = require('express');
const { resumeUpload } = require('../middleware/upload');
const {
  getResumes,
  downloadResume,
  uploadResume,
  setPrimaryResume,
  deleteResume,
  getIntelligence,
} = require('../controllers/resumeController');

const router = express.Router();

// GET /api/resumes - list user's resumes
router.get('/', getResumes);

// GET /api/resumes/:id/file - download only a resume owned by the current user
router.get('/:id/file', downloadResume);

// POST /api/resumes/upload - upload a resume file
router.post('/upload', resumeUpload.single('resume'), uploadResume);

// PATCH /api/resumes/:id/set-primary - mark a resume as primary
router.patch('/:id/set-primary', setPrimaryResume);

// DELETE /api/resumes/:id - delete a resume
router.delete('/:id', deleteResume);

// GET /api/resumes/intelligence - primary/latest resume intelligence
router.get('/intelligence', getIntelligence);

// GET /api/resumes/:id/intelligence - specific resume intelligence
router.get('/:id/intelligence', getIntelligence);

module.exports = router;
