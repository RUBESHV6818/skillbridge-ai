const express = require('express');
const { authorizeRole } = require('../middleware/authorizeRole');
const { getUsers, updateUserRole, toggleUserStatus, getSettings, updateSettings } = require('../controllers/adminController');

const router = express.Router();
router.use(authorizeRole('admin'));
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', toggleUserStatus);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
