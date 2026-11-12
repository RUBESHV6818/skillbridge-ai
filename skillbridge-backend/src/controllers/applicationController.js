const mongoose = require('mongoose');
const Application = require('../models/Application');
const { createNotification } = require('../services/notificationService');

const STATUS_LABELS = {
  wishlist: 'Wishlist', applied: 'Applied', oa: 'Online Assessment',
  interview: 'Technical Rounds', offer: 'Offer Received', rejected: 'Archived',
};

function parseDate(value) {
  if (value === undefined || value === null || value === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

exports.getApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ user: req.user._id }).sort({ updatedAt: -1, createdAt: -1 });
    res.json(applications.map((application) => application.toResponseJSON()));
  } catch (err) {
    next(err);
  }
};

exports.createApplication = async (req, res, next) => {
  try {
    const { company, role, package: compensation, status, isCampus, appliedDate, location, notes } = req.body;
    if (typeof company !== 'string' || !company.trim() || company.trim().length > 120 || typeof role !== 'string' || !role.trim() || role.trim().length > 160) {
      return res.status(400).json({ message: 'Company and role are required.' });
    }
    if (status && !Application.STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid application status.' });
    }
    if (compensation !== undefined && (typeof compensation !== 'string' || compensation.length > 80)) return res.status(400).json({ message: 'Package must be 80 characters or fewer.' });
    if (isCampus !== undefined && typeof isCampus !== 'boolean') return res.status(400).json({ message: 'Campus status must be true or false.' });
    if (location !== undefined && (typeof location !== 'string' || location.length > 160)) return res.status(400).json({ message: 'Location must be 160 characters or fewer.' });
    if (notes !== undefined && (typeof notes !== 'string' || notes.length > 3000)) return res.status(400).json({ message: 'Notes must be 3000 characters or fewer.' });
    const parsedAppliedDate = appliedDate === undefined ? new Date() : parseDate(appliedDate);
    if (!parsedAppliedDate) return res.status(400).json({ message: 'Enter a valid application date.' });

    const application = await Application.create({
      user: req.user._id,
      company: company.trim(),
      role: role.trim(),
      package: compensation?.trim() || '',
      status: status || 'applied',
      isCampus: isCampus !== false,
      appliedDate: parsedAppliedDate,
      location: location?.trim() || '',
      notes: notes?.trim() || '',
    });
    await createNotification(req.user._id, {
      title: 'Application added to your tracker',
      message: `You added ${application.company} — ${application.role} at the ${STATUS_LABELS[application.status]} stage.`,
      category: 'Placement Tracker',
      type: 'application',
    });
    res.status(201).json(application.toResponseJSON());
  } catch (err) {
    next(err);
  }
};

exports.updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid application ID.' });
    const fields = ['company', 'role', 'package', 'status', 'isCampus', 'appliedDate', 'location', 'notes'];
    const supplied = fields.filter((field) => Object.prototype.hasOwnProperty.call(req.body || {}, field));
    if (!supplied.length) return res.status(400).json({ message: 'Provide at least one application field to update.' });

    const application = await Application.findOne({ _id: id, user: req.user._id });
    if (!application) return res.status(404).json({ message: 'Application not found.' });
    const previousStatus = application.status;
    const body = req.body || {};
    if (supplied.includes('company')) {
      if (typeof body.company !== 'string' || !body.company.trim() || body.company.trim().length > 120) return res.status(400).json({ message: 'Company is required and must be 120 characters or fewer.' });
      application.company = body.company.trim();
    }
    if (supplied.includes('role')) {
      if (typeof body.role !== 'string' || !body.role.trim() || body.role.trim().length > 160) return res.status(400).json({ message: 'Role is required and must be 160 characters or fewer.' });
      application.role = body.role.trim();
    }
    if (supplied.includes('package')) {
      if (typeof body.package !== 'string' || body.package.length > 80) return res.status(400).json({ message: 'Package must be 80 characters or fewer.' });
      application.package = body.package.trim();
    }
    if (supplied.includes('status')) {
      if (!Application.STATUSES.includes(body.status)) return res.status(400).json({ message: 'Invalid application status.' });
      application.status = body.status;
    }
    if (supplied.includes('isCampus')) {
      if (typeof body.isCampus !== 'boolean') return res.status(400).json({ message: 'Campus status must be true or false.' });
      application.isCampus = body.isCampus;
    }
    if (supplied.includes('appliedDate')) {
      const date = parseDate(body.appliedDate);
      if (!date) return res.status(400).json({ message: 'Enter a valid application date.' });
      application.appliedDate = date;
    }
    if (supplied.includes('location')) {
      if (typeof body.location !== 'string' || body.location.length > 160) return res.status(400).json({ message: 'Location must be 160 characters or fewer.' });
      application.location = body.location.trim();
    }
    if (supplied.includes('notes')) {
      if (typeof body.notes !== 'string' || body.notes.length > 3000) return res.status(400).json({ message: 'Notes must be 3000 characters or fewer.' });
      application.notes = body.notes.trim();
    }

    await application.save();
    if (previousStatus !== application.status) {
      await createNotification(req.user._id, {
        title: 'Application stage updated',
        message: `${application.company} — ${application.role} moved from ${STATUS_LABELS[previousStatus]} to ${STATUS_LABELS[application.status]}.`,
        category: 'Placement Tracker',
        type: 'application',
      });
    }
    res.json(application.toResponseJSON());
  } catch (err) { next(err); }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid application ID.' });
    }
    if (!Application.STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid application status.' });
    }

    const application = await Application.findOne({ _id: id, user: req.user._id });
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }
    const previousStatus = application.status;
    application.status = status;
    await application.save();
    if (previousStatus !== status) {
      await createNotification(req.user._id, {
        title: 'Application stage updated',
        message: `${application.company} — ${application.role} moved from ${STATUS_LABELS[previousStatus]} to ${STATUS_LABELS[status]}.`,
        category: 'Placement Tracker',
        type: 'application',
      });
    }
    res.json(application.toResponseJSON());
  } catch (err) {
    next(err);
  }
};

exports.deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid application ID.' });
    }
    const application = await Application.findOneAndDelete({ _id: id, user: req.user._id });
    if (!application) {
      return res.status(404).json({ message: 'Application not found.' });
    }
    res.json({ success: true, id: application._id.toString() });
  } catch (err) {
    next(err);
  }
};
