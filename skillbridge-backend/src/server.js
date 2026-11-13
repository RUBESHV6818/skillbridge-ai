require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { getAIConfig } = require('./services/aiProvider');
const { getEmailDeliveryStatus } = require('./services/emailService');

const { errorHandler, notFound } = require('./middleware/error');
const { authenticate } = require('./middleware/authenticate');
const { verifyEmailTransport } = require('./services/emailService');
const { startRoadmapReminderScheduler } = require('./services/roadmapReminderScheduler');

// Routes
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const jdRoutes = require('./routes/jdRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const skillGapRoutes = require('./routes/skillGapRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const reportRoutes = require('./routes/reportRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const coordinatorRoutes = require('./routes/coordinatorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mentorRoutes = require('./routes/mentorRoutes');

const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters before the backend can start.');
}
if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGINS) {
  throw new Error('CORS_ORIGINS must list the deployed frontend origin in production.');
}
if (process.env.NODE_ENV === 'production') {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI must point to the production database.');
  if (!process.env.RESUME_STORAGE_DIR) throw new Error('RESUME_STORAGE_DIR must point to persistent private storage.');
  if (!process.env.APP_BASE_URL || !process.env.APP_BASE_URL.startsWith('https://')) {
    throw new Error('APP_BASE_URL must be the HTTPS address of the deployed frontend.');
  }
  if (!getAIConfig().configured) throw new Error('Configure the selected AI provider key before starting in production.');
  if (getEmailDeliveryStatus().mode !== 'smtp') throw new Error('Configure working SMTP settings before starting in production.');
  if (!process.env.PISTON_API_URL) throw new Error('PISTON_API_URL must point to the approved code runner in production.');

  for (const origin of allowedOrigins) {
    let parsedOrigin;
    try { parsedOrigin = new URL(origin); } catch { throw new Error('CORS_ORIGINS must contain valid origin URLs.'); }
    if (parsedOrigin.protocol !== 'https:' || parsedOrigin.origin !== origin) {
      throw new Error('Production CORS_ORIGINS must contain HTTPS origins without paths or trailing slashes.');
    }
  }
}

const rootRoutes = require('./routes/root');

// Global middlewares
app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header are typically server-to-server or local health checks.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting (basic)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Public liveness/readiness checks for local monitoring and hosting probes.
app.use('/', rootRoutes);

// DB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge_ai';
mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected');
    startRoadmapReminderScheduler();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Public routes (auth)
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/resumes', authenticate, resumeRoutes);
app.use('/api/jd', jdRoutes);
app.use('/api/student/applications', authenticate, applicationRoutes);
app.use('/api/student/skill-gap', authenticate, skillGapRoutes);
app.use('/api/student/roadmap', authenticate, roadmapRoutes);
app.use('/api/student/report', authenticate, reportRoutes);
app.use('/api/interview', authenticate, interviewRoutes);
app.use('/api/student/dashboard', authenticate, dashboardRoutes);
app.use('/api/student/notifications', authenticate, notificationRoutes);
app.use('/api/coordinator', authenticate, coordinatorRoutes);
app.use('/api/mentor', authenticate, mentorRoutes);
app.use('/api/admin', authenticate, adminRoutes);

// 404 handler
app.use(notFound);
// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  verifyEmailTransport();
});
