import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: String,
      required: true,
    },
    fileSizeBytes: {
      type: Number,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      default: '',
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    atsScore: {
      type: Number,
      default: 72,
    },
    targetRole: {
      type: String,
      default: 'Full Stack Engineer',
    },
    matchedKeywordsCount: {
      type: Number,
      default: 20,
    },
    missingKeywordsCount: {
      type: Number,
      default: 8,
    },
    lastAnalysed: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Format relative date for human-readable display
function formatRelativeDate(date) {
  if (!date) return 'Recently';
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Format exact time for "Last analysed"
function formatAnalysedTime(date) {
  if (!date) return 'Analysis in progress';
  const d = new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (isToday) return `Today at ${timeStr}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday at ${timeStr}`;
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${timeStr}`;
}

resumeSchema.methods.toResponseJSON = function () {
  return {
    id: this._id.toString(),
    _id: this._id.toString(),
    fileName: this.fileName,
    fileSize: this.fileSize,
    fileType: this.fileType,
    uploadedAt: formatRelativeDate(this.createdAt),
    lastAnalysed: formatAnalysedTime(this.lastAnalysed),
    isPrimary: this.isPrimary,
    atsScore: this.atsScore,
    targetRole: this.targetRole,
    matchedKeywordsCount: this.matchedKeywordsCount,
    missingKeywordsCount: this.missingKeywordsCount,
    extractedTextLength: this.extractedText ? this.extractedText.length : 0,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
