const mongoose = require('mongoose');
const { Schema } = mongoose;

const mentorReviewSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  resume: { type: Schema.Types.ObjectId, ref: 'Resume', default: null },
  sourceSuggestionId: { type: String, trim: true, maxlength: 100, default: '' },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  section: { type: String, trim: true, maxlength: 100, default: 'Resume' },
  before: { type: String, required: true, trim: true, maxlength: 3000 },
  suggestion: { type: String, required: true, trim: true, maxlength: 3000 },
  rationale: { type: String, trim: true, maxlength: 1000, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'needs_changes'], default: 'pending', index: true },
  feedbackComment: { type: String, trim: true, maxlength: 2000, default: '' },
  reviewedAt: { type: Date, default: null },
}, { timestamps: true });

mentorReviewSchema.index({ mentor: 1, status: 1, createdAt: -1 });
module.exports = mongoose.model('MentorReview', mentorReviewSchema);
