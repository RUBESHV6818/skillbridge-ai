const mongoose = require('mongoose');
const { Schema } = mongoose;

const taskSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  duration: { type: String, default: '' },
  resourceTitle: { type: String, default: '' },
  resourceUrl: { type: String, default: '' },
}, { _id: false });

const weekSchema = new Schema({
  weekNumber: { type: Number, required: true },
  title: { type: String, required: true },
  goal: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  tasks: { type: [taskSchema], default: [] },
}, { _id: false });

const roadmapSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  basedOnResume: { type: Schema.Types.ObjectId, ref: 'Resume', default: null },
  basedOnResumeName: { type: String, default: '' },
  basedOnAnalysisAt: { type: Date, default: null },
  generatedBy: { type: String, default: 'role-and-resume-analysis' },
  generatorVersion: { type: Number, default: 1 },
  personalizedSkills: { type: [String], default: [] },
  focus: { type: String, enum: ['fullstack', 'frontend', 'backend'], default: 'fullstack' },
  targetRole: { type: String, required: true },
  weeks: { type: [weekSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);
