// src/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { authenticate } = require('../middleware/authenticate');
const { sendVerificationEmail, sendPasswordResetEmail, getEmailDeliveryStatus } = require('../services/emailService');

const router = express.Router();
const registrationLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });
const passwordResetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false });
const verificationEmailLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false });
const demoPersonas = [
  { name: 'Aarthi Raman', email: 'aarthi.raman@student.demo.skillbridge.local', role: 'student', department: 'Computer Science and Engineering', college: 'Chennai Institute of Technology', batchYear: 2025, cgpa: 8.42, targetRole: 'Full Stack Engineer', targetRoleConfirmed: true },
  { name: 'Prof. K. Soundararajan', email: 'placement.cell@coordinator.demo.skillbridge.local', role: 'coordinator', department: 'Training & Placement Directorate', college: 'Chennai Institute of Technology' },
  { name: 'Priya Sundaram', email: 'priya.sundaram@mentor.demo.skillbridge.local', role: 'mentor', department: 'Alumni Mentor', college: 'Chennai Institute of Technology' },
  { name: 'Rajeshwaran S', email: 'admin@admin.demo.skillbridge.local', role: 'admin', department: 'Platform Administration', college: 'SkillBridge AI' },
];

function serializeUser(user) {
  return {
    id: user._id.toString(),
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    verified: user.verified,
    phone: user.phone || '',
    department: user.department || '',
    college: user.college || '',
    batchYear: user.batchYear ?? null,
    cgpa: user.cgpa ?? null,
    targetRole: user.targetRole || '',
    targetRoleConfirmed: Boolean(user.targetRoleConfirmed),
    linkedin: user.linkedin || '',
    github: user.github || '',
    notificationPreferences: user.notificationPreferences || {
      driveAlerts: true,
      mentorComments: true,
      weeklyRoadmapReminders: false,
    },
  };
}

// Register a new user
router.post('/register', registrationLimiter, async (req, res, next) => {
  try {
    const { name, password, role, targetRole, department, college, batchYear } = req.body || {};
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password required' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    // generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    const user = new User({
      name,
      email,
      password: hashed,
      role,
      targetRole: typeof targetRole === 'string' ? targetRole.trim().slice(0, 120) : '',
      targetRoleConfirmed: typeof targetRole === 'string' && Boolean(targetRole.trim()),
      department: typeof department === 'string' ? department.trim().slice(0, 120) : '',
      college: typeof college === 'string' ? college.trim().slice(0, 160) : '',
      batchYear: Number.isInteger(Number(batchYear)) ? Number(batchYear) : null,
      verificationToken,
      verificationTokenExpires,
    });
    await user.save();
    let emailDelivery;
    try {
      emailDelivery = await sendVerificationEmail(user.email, verificationToken);
    } catch (mailErr) {
      console.error(`[Auth] Verification email delivery failed: ${mailErr.code || mailErr.message}`);
      emailDelivery = { mode: 'unavailable', state: 'delivery_failed' };
    }
    const message = emailDelivery.mode === 'smtp'
      ? 'Your account was created and a verification link was sent to your email.'
      : emailDelivery.mode === 'console'
        ? 'Your account was created. In local development, the verification link is printed in the backend terminal.'
        : 'Your account was created, but the verification email could not be delivered. Check the email settings or resend the link.';
    res.status(201).json({ message, user: serializeUser(user), emailDelivery });
  } catch (err) {
    next(err);
  }
});

router.post('/forgot-password', passwordResetLimiter, async (req, res, next) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });

    const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await User.findOne({ email: new RegExp(`^${escapedEmail}$`, 'i') });
    if (user && user.status !== 'suspended') {
      const token = crypto.randomBytes(32).toString('hex');
      user.passwordResetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      try {
        await sendPasswordResetEmail(user.email, token);
      } catch (mailErr) {
        // Keep the same public response for existing and unknown addresses.
        console.error(`[Auth] Password-reset email delivery failed: ${mailErr.code || mailErr.message}`);
      }
    }

    // Same response for existing and unknown addresses to prevent account enumeration.
    const deliveryMode = getEmailDeliveryStatus().mode;
    const message = deliveryMode === 'console'
      ? 'If an eligible account exists, its reset link is printed in the backend terminal.'
      : deliveryMode === 'unavailable'
        ? 'Password reset email delivery is not configured. Contact the platform administrator.'
        : 'If an eligible account exists, check its inbox for reset instructions. If no email arrives, retry or contact the platform administrator.';
    res.json({ message, deliveryMode });
  } catch (err) { next(err); }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    const token = typeof req.body.token === 'string' ? req.body.token.trim() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!email || !token || !password) return res.status(400).json({ message: 'Email, reset token, and new password are required.' });
    if (password.length < 8 || password.length > 128) return res.status(400).json({ message: 'Password must be between 8 and 128 characters.' });

    const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      email: new RegExp(`^${escapedEmail}$`, 'i'),
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { $gt: new Date() },
      status: { $ne: 'suspended' },
    }).select('+passwordResetTokenHash +passwordResetExpires');
    if (!user) return res.status(400).json({ message: 'This reset link is invalid or expired. Request a new one.' });

    user.password = await bcrypt.hash(password, 12);
    user.passwordChangedAt = new Date();
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json({ message: 'Your password has been reset. You can now sign in.' });
  } catch (err) { next(err); }
});
// Verify email token
router.get('/verify/:token', async (req, res, next) => {
  try {
    const { token } = req.params;
    const now = new Date();
    const user = await User.findOne({ verificationToken: token, verificationTokenExpires: { $gt: now } });
    if (!user) {
      // Email security scanners and React development mode can open a link more
      // than once. Treat a recently consumed token as success, without keeping
      // the original bearer token in the database.
      const usedTokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const alreadyVerified = await User.findOne({
        verificationTokenUsedHash: usedTokenHash,
        verified: true,
      });
      if (alreadyVerified) {
        return res.json({ message: 'Email was already verified successfully', alreadyVerified: true });
      }
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
    user.verified = true;
    user.verificationTokenUsedHash = crypto.createHash('sha256').update(token).digest('hex');
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
});

// Resend verification email
router.post('/resend-verification', verificationEmailLimiter, async (req, res, next) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
    const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await User.findOne({ email: new RegExp(`^${escapedEmail}$`, 'i') });

    if (user && !user.verified && user.status !== 'suspended') {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.verificationToken = verificationToken;
      user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      user.verificationTokenUsedHash = undefined;
      await user.save();
      await sendVerificationEmail(user.email, verificationToken);
    }

    res.json({
      message: 'If the address belongs to an unverified account, a new verification link has been sent.',
      deliveryMode: getEmailDeliveryStatus().mode,
    });
  } catch (err) {
    next(err);
  }
});



// Login existing user
router.post('/demo-login', async (req, res, next) => {
  try {
    // Demo personas are only available in local development, never in production.
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_DEMO_LOGIN === 'false') {
      return res.status(404).json({ message: 'Demo sign-in is unavailable.' });
    }
    const { role } = req.body || {};
    const persona = demoPersonas.find((item) => item.role === role);
    if (!persona) return res.status(400).json({ message: 'Choose a valid demo persona.' });
    const demoPassword = 'PlacementReady#2025';
    const demoUsers = {};
    for (const item of demoPersonas) {
      let account = await User.findOne({ email: item.email });
      if (!account) {
        account = await User.create({ ...item, password: await bcrypt.hash(demoPassword, 10), verified: true, status: 'active' });
      } else if (account.role !== item.role || !(await bcrypt.compare(demoPassword, account.password))) {
        return res.status(409).json({ message: 'A real account already uses a demo email. Sign in with that account’s own password instead.' });
      }
      demoUsers[item.role] = account;
    }
    const demoStudent = demoUsers.student;
    const demoMentor = demoUsers.mentor;
    if (demoStudent && demoMentor && !demoStudent.assignedMentor) {
      demoStudent.assignedMentor = demoMentor._id;
      await demoStudent.save();
    }
    const user = demoUsers[role];
    if (role === 'student' && !user.targetRoleConfirmed) user.targetRoleConfirmed = Boolean(user.targetRole);
    user.lastLoginAt = new Date();
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: serializeUser(user) });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'This account has been suspended. Contact your platform administrator.' });
    }
    if (!user.verified) {
      return res.status(403).json({ message: 'Please verify your email before logging in. Check backend console for verification link.' });
    }
    user.lastLoginAt = new Date();
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: serializeUser(user) });
  } catch (err) {
    next(err);
  }
});

// Get current user (protected)
router.get('/me', authenticate, async (req, res, next) => {
  try {
    res.json(serializeUser(req.user));
  } catch (err) {
    next(err);
  }
});

router.put('/me', authenticate, async (req, res, next) => {
  try {
    const body = req.body || {};
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name || name.length > 100) {
      return res.status(400).json({ message: 'Name is required and must be 100 characters or fewer.' });
    }

    const fields = ['phone', 'department', 'college', 'targetRole', 'linkedin', 'github'];
    for (const field of fields) {
      if (body[field] !== undefined && typeof body[field] !== 'string') {
        return res.status(400).json({ message: `${field} must be text.` });
      }
    }
    const batchYear = body.batchYear === '' || body.batchYear === null ? null : Number(body.batchYear);
    const cgpa = body.cgpa === '' || body.cgpa === null ? null : Number(body.cgpa);
    if (batchYear !== null && (!Number.isInteger(batchYear) || batchYear < 1900 || batchYear > 2200)) {
      return res.status(400).json({ message: 'Enter a valid graduation year.' });
    }
    if (cgpa !== null && (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10)) {
      return res.status(400).json({ message: 'CGPA must be between 0 and 10.' });
    }

    req.user.name = name;
    const targetRoleChanged = body.targetRole !== undefined && body.targetRole.trim() !== req.user.targetRole;
    if (body.targetRoleConfirmed !== undefined && typeof body.targetRoleConfirmed !== 'boolean') {
      return res.status(400).json({ message: 'Confirming a target role must be a true or false value.' });
    }
    if (body.targetRoleConfirmed === true && !(typeof body.targetRole === 'string' ? body.targetRole.trim() : req.user.targetRole)) {
      return res.status(400).json({ message: 'Enter a target role before confirming it.' });
    }
    fields.forEach((field) => {
      if (body[field] !== undefined) req.user[field] = body[field].trim();
    });
    if (body.targetRoleConfirmed !== undefined) req.user.targetRoleConfirmed = body.targetRoleConfirmed;
    else if (targetRoleChanged) req.user.targetRoleConfirmed = false;
    req.user.batchYear = batchYear;
    req.user.cgpa = cgpa;

    if (body.notificationPreferences !== undefined) {
      const preferences = body.notificationPreferences;
      const preferenceKeys = ['driveAlerts', 'mentorComments', 'weeklyRoadmapReminders'];
      if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences) ||
        preferenceKeys.some((key) => typeof preferences[key] !== 'boolean')) {
        return res.status(400).json({ message: 'Notification preferences must contain boolean values for all options.' });
      }
      req.user.notificationPreferences = Object.fromEntries(preferenceKeys.map((key) => [key, preferences[key]]));
    }

    await req.user.save();
    res.json(serializeUser(req.user));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
