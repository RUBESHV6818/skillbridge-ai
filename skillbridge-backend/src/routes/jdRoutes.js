// src/routes/jdRoutes.js
const express = require('express');
const { getSampleJDs, matchJD } = require('../controllers/jdController');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

// GET /api/jd/samples - list campus drive sample JDs
router.get('/samples', getSampleJDs);

// POST /api/jd/match - match JD against student resume (protected)
router.post('/match', authenticate, matchJD);

module.exports = router;
