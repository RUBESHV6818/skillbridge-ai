// src/models/User.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'coordinator', 'mentor', 'admin'], default: 'student' },
  assignedMentor: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  status: { type: String, enum: ['active', 'suspended'], default: 'active', index: true },
  phone: { type: String, trim: true, maxlength: 40, default: '' },
  department: { type: String, trim: true, maxlength: 120, default: '' },
  college: { type: String, trim: true, maxlength: 160, default: '' },
  batchYear: { type: Number, min: 1900, max: 2200, default: null },
  cgpa: { type: Number, min: 0, max: 10, default: null },
  targetRole: { type: String, trim: true, maxlength: 120, default: '' },
  targetRoleConfirmed: { type: Boolean, default: false },
  linkedin: { type: String, trim: true, maxlength: 250, default: '' },
  github: { type: String, trim: true, maxlength: 250, default: '' },
  notificationPreferences: {
    driveAlerts: { type: Boolean, default: true },
    mentorComments: { type: Boolean, default: true },
    weeklyRoadmapReminders: { type: Boolean, default: false },
  },
  lastRoadmapReminderAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: null },
  passwordChangedAt: { type: Date, default: null },
  verified: { type: Boolean, default: false }, // email verification flag
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
  // Hashed proof that a verification token was already consumed successfully.
  verificationTokenUsedHash: { type: String, select: false },
  passwordResetTokenHash: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
});

module.exports = mongoose.model('User', userSchema);
