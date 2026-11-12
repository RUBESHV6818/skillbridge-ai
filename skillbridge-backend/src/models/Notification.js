const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  message: { type: String, required: true, trim: true, maxlength: 1000 },
  category: { type: String, required: true, trim: true, maxlength: 60 },
  type: { type: String, enum: ['application', 'interview', 'resume', 'system'], default: 'system' },
  readAt: { type: Date, default: null },
}, { timestamps: true });

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
