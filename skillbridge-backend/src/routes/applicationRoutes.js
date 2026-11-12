const express = require('express');
const {
  getApplications,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
} = require('../controllers/applicationController');

const router = express.Router();

router.get('/', getApplications);
router.post('/', createApplication);
router.patch('/:id', updateApplication);
router.patch('/:id/status', updateApplicationStatus);
router.delete('/:id', deleteApplication);

module.exports = router;
