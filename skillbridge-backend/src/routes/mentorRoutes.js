const express = require('express');
const { authorizeRole } = require('../middleware/authorizeRole');
const { getAssignedStudents, getReviewQueue, requestReview, getStudentReviews, respondToReview } = require('../controllers/mentorController');

const router = express.Router();
router.get('/students', authorizeRole('mentor'), getAssignedStudents);
router.get('/reviews', authorizeRole('mentor'), getReviewQueue);
router.post('/reviews/:reviewId/respond', authorizeRole('mentor'), respondToReview);
router.get('/student/reviews', authorizeRole('student'), getStudentReviews);
router.post('/student/reviews', authorizeRole('student'), requestReview);
module.exports = router;
