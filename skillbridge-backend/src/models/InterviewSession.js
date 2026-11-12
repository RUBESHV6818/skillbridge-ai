const mongoose = require('mongoose');
const { Schema } = mongoose;

const interviewSessionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  config: { type: Schema.Types.Mixed, required: true },
  questions: { type: [Schema.Types.Mixed], required: true },
  answers: { type: Schema.Types.Mixed, default: {} },
  evaluation: { type: Schema.Types.Mixed, default: null },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);
