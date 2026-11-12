const nodemailer = require('nodemailer');

function readSmtpConfig() {
  const host = String(process.env.EMAIL_HOST || '').trim();
  const portText = String(process.env.EMAIL_PORT || '').trim();
  const user = String(process.env.EMAIL_USER || '').trim();
  const pass = String(process.env.EMAIL_PASS || '').trim();
  const hasAnySetting = Boolean(host || user || pass);
  if (!hasAnySetting) return { configured: false, transporter: null, error: null };

  const port = Number(portText);
  if (!host || !portText || !user || !pass || !Number.isInteger(port) || port < 1 || port > 65535) {
    return {
      configured: false,
      transporter: null,
      error: 'SMTP configuration is incomplete. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS.',
    };
  }

  const explicitSecure = String(process.env.EMAIL_SECURE || '').trim().toLowerCase();
  const secure = explicitSecure ? explicitSecure === 'true' : port === 465;
  const explicitRequireTls = String(process.env.EMAIL_REQUIRE_TLS || '').trim().toLowerCase();
  const requireTLS = explicitRequireTls ? explicitRequireTls === 'true' : port === 587 && !secure;

  return {
    configured: true,
    transporter: nodemailer.createTransport({
      host,
      port,
      secure,
      requireTLS,
      auth: { user, pass },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    }),
    error: null,
  };
}

const smtp = readSmtpConfig();
let connectionState = smtp.transporter ? 'checking' : smtp.error ? 'misconfigured' : 'not_configured';

function getPublicAppUrl(path) {
  const configured = String(process.env.APP_BASE_URL || '').trim();
  const base = configured || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173');
  if (!base) {
    const error = new Error('APP_BASE_URL must be set to the public SkillBridge web address.');
    error.code = 'EMAIL_APP_URL_NOT_CONFIGURED';
    error.statusCode = 503;
    throw error;
  }

  let parsed;
  try {
    parsed = new URL(base);
  } catch {
    const error = new Error('APP_BASE_URL must be a valid HTTP or HTTPS URL.');
    error.code = 'EMAIL_APP_URL_INVALID';
    error.statusCode = 503;
    throw error;
  }
  if (!['http:', 'https:'].includes(parsed.protocol) || (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:')) {
    const error = new Error('APP_BASE_URL must use HTTPS in production.');
    error.code = 'EMAIL_APP_URL_INVALID';
    error.statusCode = 503;
    throw error;
  }
  return `${parsed.origin}${path}`;
}

function getEmailDeliveryStatus() {
  if (smtp.error) return { mode: 'unavailable', state: 'misconfigured' };
  if (smtp.transporter) return { mode: 'smtp', state: connectionState };
  if (process.env.NODE_ENV !== 'production' && process.env.EMAIL_DEV_MODE !== 'false') {
    return { mode: 'console', state: 'development' };
  }
  return { mode: 'unavailable', state: 'not_configured' };
}

async function verifyEmailTransport() {
  if (!smtp.transporter) {
    const status = getEmailDeliveryStatus();
    console.info(`[Email Service] Delivery mode: ${status.mode}${smtp.error ? ` (${smtp.error})` : ''}.`);
    return status;
  }

  try {
    await smtp.transporter.verify();
    connectionState = 'connected';
    console.info('[Email Service] SMTP connection verified.');
  } catch (error) {
    connectionState = 'connection_failed';
    console.error(`[Email Service] SMTP connection check failed: ${error.code || error.message}`);
  }
  return getEmailDeliveryStatus();
}

function consoleFallbackAllowed() {
  return process.env.NODE_ENV !== 'production' && process.env.EMAIL_DEV_MODE !== 'false';
}

async function deliverEmail(message) {
  if (smtp.error) {
    const error = new Error(smtp.error);
    error.code = 'EMAIL_CONFIGURATION_INVALID';
    error.statusCode = 503;
    throw error;
  }

  if (!smtp.transporter) {
    if (!consoleFallbackAllowed()) {
      const error = new Error('Email delivery is not configured. Set the SMTP environment variables in the backend.');
      error.code = 'EMAIL_NOT_CONFIGURED';
      error.statusCode = 503;
      throw error;
    }
    console.info('\n[Email Service] Local development delivery:');
    console.info(`To: ${message.to}`);
    console.info(`Subject: ${message.subject}`);
    console.info(message.text);
    return { mode: 'console', messageId: null };
  }

  try {
    const result = await smtp.transporter.sendMail({
      ...message,
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    });
    connectionState = 'connected';
    console.info(`[Email Service] Email accepted by SMTP (message ${result.messageId || 'queued'}).`);
    return { mode: 'smtp', messageId: result.messageId || null };
  } catch (cause) {
    connectionState = 'delivery_failed';
    console.error(`[Email Service] SMTP send failed: ${cause.code || cause.message}`);
    const error = new Error('The email could not be sent. Check the backend SMTP configuration and mail provider.');
    error.code = 'EMAIL_DELIVERY_FAILED';
    error.statusCode = 503;
    throw error;
  }
}

async function sendVerificationEmail(email, token) {
  const url = getPublicAppUrl(`/verify?token=${encodeURIComponent(token)}`);
  return deliverEmail({
    to: email,
    subject: 'Verify your SkillBridge account',
    text: `Welcome to SkillBridge. Verify your email using this link (it expires in 24 hours):\n\n${url}\n\nIf you did not create this account, you can ignore this message.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#242338"><h2>Verify your SkillBridge account</h2><p>Confirm this email address to finish creating your SkillBridge account. This link expires in 24 hours.</p><p><a href="${url}" style="display:inline-block;background:#5146ad;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none">Verify email</a></p><p>If the button does not work, copy this address into your browser:</p><p><a href="${url}">${url}</a></p><p>If you did not create this account, you can ignore this message.</p></div>`,
  });
}

async function sendPasswordResetEmail(email, token) {
  const query = new URLSearchParams({ token, email });
  const url = getPublicAppUrl(`/reset-password?${query.toString()}`);
  return deliverEmail({
    to: email,
    subject: 'Reset your SkillBridge password',
    text: `A password reset was requested for your SkillBridge account. Use this link within one hour; it can only be used once:\n\n${url}\n\nIf you did not request this, ignore this message.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#242338"><h2>Reset your SkillBridge password</h2><p>This link expires in one hour and can only be used once.</p><p><a href="${url}" style="display:inline-block;background:#5146ad;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none">Choose a new password</a></p><p>If you did not request a password reset, ignore this message.</p></div>`,
  });
}

async function sendRoadmapReminderEmail(email, details) {
  const url = getPublicAppUrl('/learning-roadmap');
  const tasks = (details.nextTasks || []).slice(0, 3);
  const taskText = tasks.length
    ? tasks.map((task, index) => `${index + 1}. ${task}`).join('\n')
    : 'Open your roadmap to choose your next task.';
  const taskHtml = tasks.length
    ? `<ul>${tasks.map((task) => `<li>${escapeHtml(task)}</li>`).join('')}</ul>`
    : '<p>Open your roadmap to choose your next task.</p>';
  return deliverEmail({
    to: email,
    subject: `Your ${details.targetRole || 'career'} roadmap check-in`,
    text: `Hi ${details.name || 'there'},\n\nYour learning roadmap is ${details.progress}% complete. Keep building evidence toward ${details.targetRole || 'your target role'}.\n\nSuggested next tasks:\n${taskText}\n\nOpen your roadmap: ${url}\n\nYou can turn off weekly reminders in your SkillBridge profile settings.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#242338"><h2>Your weekly roadmap check-in</h2><p>Hi ${escapeHtml(details.name || 'there')},</p><p>Your learning roadmap is <strong>${Number(details.progress) || 0}%</strong> complete. Keep building evidence toward <strong>${escapeHtml(details.targetRole || 'your target role')}</strong>.</p><h3>Suggested next tasks</h3>${taskHtml}<p><a href="${url}" style="display:inline-block;background:#5146ad;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none">Open my roadmap</a></p><p style="color:#68677a;font-size:13px">You can turn off weekly reminders in your SkillBridge profile settings.</p></div>`,
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendRoadmapReminderEmail,
  getEmailDeliveryStatus,
  verifyEmailTransport,
};
