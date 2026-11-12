const express = require('express');
const { getNotifications, updateReadStatus, markAllRead } = require('../controllers/notificationController');

const router = express.Router();
router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', updateReadStatus);

module.exports = router;
