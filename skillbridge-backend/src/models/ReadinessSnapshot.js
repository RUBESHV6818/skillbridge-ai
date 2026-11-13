const mongoose = require('mongoose');
const { Schema } = mongoose;

const readinessSnapshotSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  snapshotDate: { type: String, required: true },
  targetRole: { type: String, default: '' },
  healthScore: { type: Number, default: null, min: 0, max: 100 },
  resumeScore: { type: Number, default: null, min: 0, max: 100 },
  interviewScore: { type: Number, default: null, min: 0, max: 100 },
  skillScore: { type: Number, default: null, min: 0, max: 100 },
  roadmapProgress: { type: Number, default: null, min: 0, max: 100 },
}, { timestamps: true });

readinessSnapshotSchema.index({ user: 1, targetRole: 1, snapshotDate: 1 }, { unique: true });
readinessSnapshotSchema.index({ user: 1, targetRole: 1, snapshotDate: -1 });

module.exports = mongoose.model('ReadinessSnapshot', readinessSnapshotSchema);
