// src/models/Resume.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const resumeSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true }, // bytes
  fileType: { type: String, required: true }, // mime type
  filePath: { type: String, required: true }, // stored path on disk
  uploadedAt: { type: Date, default: Date.now },
  lastAnalysed: { type: Date },
  isPrimary: { type: Boolean, default: false },
  // Placeholder analysis fields
  atsScore: { type: Number, default: null },
  targetRole: { type: String, default: '' },
  matchedKeywordsCount: { type: Number, default: 0 },
  missingKeywordsCount: { type: Number, default: 0 },
  extractedTextLength: { type: Number, default: 0 },
});

// Helper to format dates similar to frontend mock
function formatDate(date) {
  if (!date) return '';
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

resumeSchema.methods.toResponseJSON = function () {
  return {
    _id: this._id,
    id: this._id,
    fileName: this.fileName,
    fileSize: this.fileSize,
    fileType: this.fileType,
    uploadedAt: formatDate(this.uploadedAt),
    lastAnalysed: this.lastAnalysed ? formatDate(this.lastAnalysed) : null,
    isPrimary: this.isPrimary,
    atsScore: this.atsScore,
    targetRole: this.targetRole,
    matchedKeywordsCount: this.matchedKeywordsCount,
    missingKeywordsCount: this.missingKeywordsCount,
    extractedTextLength: this.extractedTextLength,
  };
};

module.exports = mongoose.model('Resume', resumeSchema);
