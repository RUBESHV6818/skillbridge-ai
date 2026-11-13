// src/routes/root.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// Simple health check / welcome page
router.get('/', (req, res) => {
  res.send('SkillBridge AI Backend – API is running. Use /api/... endpoints.');
});

router.get('/health/live', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/health/ready', (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? 'ready' : 'not_ready',
    database: databaseReady ? 'connected' : 'disconnected',
  });
});

module.exports = router;
