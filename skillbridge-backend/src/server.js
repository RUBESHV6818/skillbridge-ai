require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');

const { errorHandler, notFound } = require('./middleware/error');
const { authenticate } = require('./middleware/authenticate');

// Routes
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');

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
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Public routes (auth)
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/resumes', authenticate, resumeRoutes);

// 404 handler
app.use(notFound);
// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
