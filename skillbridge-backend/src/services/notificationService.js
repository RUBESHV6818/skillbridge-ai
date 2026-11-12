const Notification = require('../models/Notification');
const User = require('../models/User');

async function createNotification(userId, details) {
  try {
    const user = await User.findById(userId).select('notificationPreferences');
    if (!user) return;
    const preferences = user.notificationPreferences || {};
    const category = String(details.category || '').toLowerCase();
    if ((details.type === 'application' || category === 'placement tracker') && preferences.driveAlerts === false) return;
    if (category === 'mentor' && preferences.mentorComments === false) return;
    await Notification.create({ user: userId, ...details });
  } catch (err) {
    // A notification failure must not undo the primary user action.
    console.error('Could not save in-app notification:', err.message);
  }
}

module.exports = { createNotification };
