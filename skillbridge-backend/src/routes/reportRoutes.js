const express = require('express');
const { generateCareerReport } = require('../controllers/reportController');

const router = express.Router();
router.post('/generate', generateCareerReport);

module.exports = router;
