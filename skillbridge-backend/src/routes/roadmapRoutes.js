const express = require('express');
const { getRoadmap, toggleTask, regenerateRoadmap } = require('../controllers/roadmapController');

const router = express.Router();

router.get('/', getRoadmap);
router.post('/regenerate', regenerateRoadmap);
router.patch('/tasks/:taskId/toggle', toggleTask);

module.exports = router;
