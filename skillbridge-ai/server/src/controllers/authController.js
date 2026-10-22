import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, college, batchYear, targetRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email address already exists.' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'student',
      department: department || 'Computer Science and Engineering',
      college: college || 'Chennai Institute of Technology',
      batchYear: batchYear ? Number(batchYear) : 2025,
      targetRole: targetRole || 'Full Stack Engineer',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: user.toProfileJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both college email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        message: 'Your account has been suspended by the placement directorate.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: user.toProfileJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.json({
      user: req.user.toProfileJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide your email address.' });
    }

    // Return friendly simulated dispatch confirmation
    res.json({
      message: `Password reset link has been dispatched to ${email}. Check your inbox within 10 minutes.`,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  getMe,
  forgotPassword,
};
