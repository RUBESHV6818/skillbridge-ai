require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');

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
// Root route (health check)
const rootRoutes = require('./routes/root');
app.use('/', rootRoutes);

// Global middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting (basic)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

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
