// src/routes/authRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    const { password: _, ...userInfo } = user.toObject();
    res.status(201).json({ token, user: userInfo });
  } catch (err) {
    next(err);
  }
});

// Login existing user
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    const { password: _, ...userInfo } = user.toObject();
    res.json({ token, user: userInfo });
  } catch (err) {
    next(err);
  }
});

// Get current user (requires auth middleware in server.js)
router.get('/me', async (req, res, next) => {
  try {
    // req.user is set by authenticate middleware
    res.json(req.user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
