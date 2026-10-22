// src/routes/root.js
const express = require('express');
const router = express.Router();

// Simple health check / welcome page
router.get('/', (req, res) => {
  res.send('SkillBridge AI Backend – API is running. Use /api/... endpoints.');
});

module.exports = router;
