import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your college or professional email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'coordinator', 'mentor', 'admin'],
      default: 'student',
    },
    avatar: {
      type: String,
      default: function () {
        return this.name
          ? this.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
          : 'SB';
      },
    },
    department: {
      type: String,
      default: 'Computer Science and Engineering',
    },
    college: {
      type: String,
      default: 'Chennai Institute of Technology',
    },
    batchYear: {
      type: Number,
      default: 2025,
    },
    cgpa: {
      type: Number,
      default: 8.42,
    },
    targetRole: {
      type: String,
      default: 'Full Stack Engineer',
    },
    careerHealthScore: {
      type: Number,
      default: 74,
    },
    resumeScore: {
      type: Number,
      default: 72,
    },
    interviewScore: {
      type: Number,
      default: 68,
    },
    phone: {
      type: String,
      default: '+91 98401 22849',
    },
    linkedin: {
      type: String,
      default: 'linkedin.com/in/aarthi-raman-dev',
    },
    github: {
      type: String,
      default: 'github.com/aarthiraman',
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Clean JSON representation for frontend compatibility
userSchema.methods.toProfileJSON = function () {
  return {
    id: this._id.toString(),
    _id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    department: this.department,
    college: this.college,
    batchYear: this.batchYear,
    cgpa: this.cgpa,
    targetRole: this.targetRole,
    careerHealthScore: this.careerHealthScore,
    resumeScore: this.resumeScore,
    interviewScore: this.interviewScore,
    phone: this.phone,
    linkedin: this.linkedin,
    github: this.github,
    status: this.status,
  };
};

export const User = mongoose.model('User', userSchema);
export default User;
