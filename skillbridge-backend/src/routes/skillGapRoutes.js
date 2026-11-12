const express = require('express');
const { getSkillGap } = require('../controllers/skillGapController');

const router = express.Router();
router.get('/', getSkillGap);

module.exports = router;
