const mongoose = require('mongoose');
const { Schema } = mongoose;

const platformSettingsSchema = new Schema({
  key: { type: String, unique: true, default: 'global' },
  institutionName: { type: String, trim: true, maxlength: 160, default: '' },
  placementSeasonYear: { type: String, trim: true, maxlength: 40, default: '' },
  atsWeights: {
    resumeFormatting: { type: Number, min: 0, max: 100, default: 20 },
    keywordDensity: { type: Number, min: 0, max: 100, default: 35 },
    sectionIntegrity: { type: Number, min: 0, max: 100, default: 25 },
    impactActionVerbs: { type: Number, min: 0, max: 100, default: 20 },
  },
  compositeWeights: {
    resumeScoreWeight: { type: Number, min: 0, max: 100, default: 40 },
    mockInterviewWeight: { type: Number, min: 0, max: 100, default: 35 },
    skillAlignmentWeight: { type: Number, min: 0, max: 100, default: 25 },
  },
  campusDriveAutoArchiveDays: { type: Number, min: 1, max: 365, default: 30 },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
