const mongoose = require('mongoose');
const Notification = require('../models/Notification');

function toResponse(item) {
  return {
    id: item._id.toString(),
    title: item.title,
    message: item.message,
    category: item.category,
    type: item.type,
    unread: !item.readAt,
    createdAt: item.createdAt,
  };
}

exports.getNotifications = async (req, res, next) => {
  try {
    const [items, unreadCount] = await Promise.all([
      Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100),
      Notification.countDocuments({ user: req.user._id, readAt: null }),
    ]);
    res.json({ notifications: items.map(toResponse), unreadCount });
  } catch (err) { next(err); }
};

exports.updateReadStatus = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid notification ID.' });
    if (typeof req.body.read !== 'boolean') return res.status(400).json({ message: 'Read status must be true or false.' });
    const item = await Notification.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Notification not found.' });
    item.readAt = req.body.read ? (item.readAt || new Date()) : null;
    await item.save();
    res.json(toResponse(item));
  } catch (err) { next(err); }
};

exports.markAllRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany({ user: req.user._id, readAt: null }, { $set: { readAt: new Date() } });
    res.json({ success: true, updatedCount: result.modifiedCount });
  } catch (err) { next(err); }
};
