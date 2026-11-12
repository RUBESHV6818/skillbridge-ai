const express = require('express');
const { startSession, createFollowUp, submitAnswers, getLatestResults, runCodeSamples } = require('../controllers/interviewController');
const rateLimit = require('express-rate-limit');

const router = express.Router();
router.post('/start', startSession);
router.get('/latest', getLatestResults);
router.post('/:id/run-code', rateLimit({ windowMs: 60 * 1000, max: 15, standardHeaders: true, legacyHeaders: false }), runCodeSamples);
router.post('/:id/follow-up', createFollowUp);
router.post('/:id/submit', submitAnswers);

module.exports = router;
