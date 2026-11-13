// src/middleware/authenticate.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT and attach user to request
exports.authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (user.passwordChangedAt && decoded.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
      return res.status(401).json({ message: 'Your password changed. Please sign in again.' });
    }
    if (!user.verified) {
      return res.status(403).json({ message: 'Email not verified' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'This account has been suspended. Contact your platform administrator.' });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token verification failed' });
  }
};
