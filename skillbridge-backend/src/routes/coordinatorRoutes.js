const express = require('express');
const { authorizeRole } = require('../middleware/authorizeRole');
const { getCohortStudents, getPlacementAnalytics, getMentors, assignMentor } = require('../controllers/coordinatorController');

const router = express.Router();
router.use(authorizeRole('coordinator', 'admin'));
router.get('/students', getCohortStudents);
router.get('/mentors', getMentors);
router.put('/students/:studentId/mentor', assignMentor);
router.get('/analytics', getPlacementAnalytics);

module.exports = router;
