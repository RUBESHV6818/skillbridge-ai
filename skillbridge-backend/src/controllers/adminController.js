const mongoose = require('mongoose');
const User = require('../models/User');
const PlatformSettings = require('../models/PlatformSettings');
const { getEmailDeliveryStatus } = require('../services/emailService');
const { getAIConfig } = require('../services/aiProvider');

const ROLES = ['student', 'coordinator', 'mentor', 'admin'];

function relativeTime(value) {
  const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Yesterday' : `${days} days ago`;
}

async function getOrCreateSettings() {
  try {
    return await PlatformSettings.findOneAndUpdate(
      { key: 'global' },
      { $setOnInsert: { key: 'global' } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  } catch (err) {
    if (err.code === 11000) return PlatformSettings.findOne({ key: 'global' });
    throw err;
  }
}

function settingsResponse(settings) {
  const aiConfig = getAIConfig();
  return {
    institutionName: settings.institutionName,
    placementSeasonYear: settings.placementSeasonYear,
    aiProvider: `${aiConfig.provider} (${aiConfig.configured ? 'configured' : 'not configured'})`,
    aiModel: aiConfig.model,
    emailDelivery: getEmailDeliveryStatus(),
    atsWeights: settings.atsWeights,
    compositeWeights: settings.compositeWeights,
    campusDriveAutoArchiveDays: settings.campusDriveAutoArchiveDays,
  };
}

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('name email role status department college createdAt lastLoginAt').sort({ createdAt: -1 }).limit(5000);
    res.json(users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || 'active',
      department: [user.college, user.department].filter(Boolean).join(' · ') || 'Not set',
      registeredAt: user.createdAt ? user.createdAt.toISOString().slice(0, 10) : '—',
      lastLogin: user.lastLoginAt ? relativeTime(user.lastLoginAt) : 'Not recorded',
    })));
  } catch (err) { next(err); }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid user ID.' });
    if (!ROLES.includes(role)) return res.status(400).json({ message: 'Choose a valid account role.' });
    if (id === req.user._id.toString()) return res.status(400).json({ message: 'You cannot change your own role.' });
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'admin' && user.status !== 'suspended' && role !== 'admin') {
      const activeAdmins = await User.countDocuments({ role: 'admin', status: 'active' });
      if (activeAdmins <= 1) return res.status(400).json({ message: 'The last active administrator cannot be demoted.' });
    }
    user.role = role;
    await user.save();
    res.json({ success: true, id: user._id.toString(), role: user.role });
  } catch (err) { next(err); }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid user ID.' });
    if (id === req.user._id.toString()) return res.status(400).json({ message: 'You cannot suspend your own account.' });
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    if (user.role === 'admin' && nextStatus === 'suspended') {
      const activeAdmins = await User.countDocuments({ role: 'admin', status: 'active' });
      if (activeAdmins <= 1) return res.status(400).json({ message: 'The last active administrator cannot be suspended.' });
    }
    user.status = nextStatus;
    await user.save();
    res.json({ success: true, id: user._id.toString(), status: user.status });
  } catch (err) { next(err); }
};

exports.getSettings = async (req, res, next) => {
  try {
    res.json(settingsResponse(await getOrCreateSettings()));
  } catch (err) { next(err); }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const { institutionName, placementSeasonYear, atsWeights, compositeWeights, campusDriveAutoArchiveDays } = req.body || {};
    if (typeof institutionName !== 'string' || !institutionName.trim() || institutionName.trim().length > 160) {
      return res.status(400).json({ message: 'Institution name is required and must be 160 characters or fewer.' });
    }
    if (typeof placementSeasonYear !== 'string' || placementSeasonYear.trim().length > 40) {
      return res.status(400).json({ message: 'Enter a valid placement season label.' });
    }
    const atsKeys = ['resumeFormatting', 'keywordDensity', 'sectionIntegrity', 'impactActionVerbs'];
    const compositeKeys = ['resumeScoreWeight', 'mockInterviewWeight', 'skillAlignmentWeight'];
    const validWeights = (weights, keys) => weights && typeof weights === 'object' && keys.every((key) => weights[key] !== '' && weights[key] !== null && weights[key] !== undefined && Number.isFinite(Number(weights[key])) && Number(weights[key]) >= 0 && Number(weights[key]) <= 100) && Math.abs(keys.reduce((sum, key) => sum + Number(weights[key]), 0) - 100) < 0.000001;
    if (!validWeights(atsWeights, atsKeys)) return res.status(400).json({ message: 'Resume review weights must be numbers that total 100%.' });
    if (!validWeights(compositeWeights, compositeKeys)) return res.status(400).json({ message: 'Composite score weights must be numbers that total 100%.' });
    const archiveDays = Number(campusDriveAutoArchiveDays);
    if (!Number.isInteger(archiveDays) || archiveDays < 1 || archiveDays > 365) return res.status(400).json({ message: 'Auto-archive days must be between 1 and 365.' });

    const settings = await getOrCreateSettings();
    settings.institutionName = institutionName.trim();
    settings.placementSeasonYear = placementSeasonYear.trim();
    settings.atsWeights = Object.fromEntries(atsKeys.map((key) => [key, Number(atsWeights[key])]));
    settings.compositeWeights = Object.fromEntries(compositeKeys.map((key) => [key, Number(compositeWeights[key])]));
    settings.campusDriveAutoArchiveDays = archiveDays;
    settings.updatedBy = req.user._id;
    await settings.save();
    res.json({ success: true, settings: settingsResponse(settings) });
  } catch (err) { next(err); }
};
