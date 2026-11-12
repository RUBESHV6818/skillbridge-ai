const User = require('../models/User');
const Roadmap = require('../models/Roadmap');
const { sendRoadmapReminderEmail } = require('./emailService');

const CHECK_INTERVAL_MS = 60 * 1000;
const MIN_REMINDER_INTERVAL_MS = 6.5 * 24 * 60 * 60 * 1000;
const inFlight = new Set();
let timer = null;
let lastWindowKey = '';

function getReminderClock(timeZone = process.env.ROADMAP_REMINDER_TIMEZONE || 'Asia/Kolkata') {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  return Object.fromEntries(parts.filter((part) => part.type !== 'literal').map(({ type, value }) => [type, value]));
}

function isReminderWindow(clock) {
  return clock.weekday === 'Mon' && clock.hour === '09' && Number(clock.minute) < 5;
}

function roadmapProgress(roadmap) {
  const tasks = (roadmap.weeks || []).flatMap((week) => week.tasks || []);
  const completed = tasks.filter((task) => task.completed).length;
  return { tasks, completed, progress: tasks.length ? Math.round((completed / tasks.length) * 100) : 0 };
}

async function sendForUser(user, now) {
  const userId = String(user._id);
  if (inFlight.has(userId)) return;
  inFlight.add(userId);
  try {
    const roadmap = await Roadmap.findOne({ user: user._id }).lean();
    if (!roadmap) return;
    const { tasks, completed, progress } = roadmapProgress(roadmap);
    if (!tasks.length || completed >= tasks.length) return;
    const nextTasks = tasks.filter((task) => !task.completed).slice(0, 3).map((task) => task.text);
    await sendRoadmapReminderEmail(user.email, {
      name: user.name,
      targetRole: roadmap.targetRole || user.targetRole,
      progress,
      nextTasks,
    });
    await User.updateOne({ _id: user._id }, { $set: { lastRoadmapReminderAt: now } });
    console.info(`[Roadmap Reminders] Sent weekly check-in to ${user._id}.`);
  } catch (error) {
    console.error(`[Roadmap Reminders] Could not send check-in to ${userId}: ${error.code || error.message}`);
  } finally {
    inFlight.delete(userId);
  }
}

async function sendDueRoadmapReminders(now = new Date()) {
  const eligibleUsers = await User.find({
    role: 'student',
    status: 'active',
    verified: true,
    'notificationPreferences.weeklyRoadmapReminders': true,
    $or: [
      { lastRoadmapReminderAt: null },
      { lastRoadmapReminderAt: { $exists: false } },
      { lastRoadmapReminderAt: { $lte: new Date(now.getTime() - MIN_REMINDER_INTERVAL_MS) } },
    ],
  }).select('_id name email targetRole').lean();

  for (const user of eligibleUsers) await sendForUser(user, now);
  return eligibleUsers.length;
}

async function checkAndSend() {
  let clock;
  try {
    clock = getReminderClock();
  } catch (error) {
    console.error(`[Roadmap Reminders] Invalid ROADMAP_REMINDER_TIMEZONE: ${error.message}`);
    return;
  }
  if (!isReminderWindow(clock)) return;
  const windowKey = `${clock.year}-${clock.month}-${clock.day}`;
  if (lastWindowKey === windowKey) return;
  lastWindowKey = windowKey;
  try {
    const count = await sendDueRoadmapReminders();
    console.info(`[Roadmap Reminders] Weekly run complete; checked ${count} eligible account(s).`);
  } catch (error) {
    lastWindowKey = '';
    console.error(`[Roadmap Reminders] Weekly run failed: ${error.message}`);
  }
}

function startRoadmapReminderScheduler() {
  if (timer) return;
  const timezone = process.env.ROADMAP_REMINDER_TIMEZONE || 'Asia/Kolkata';
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
  } catch {
    console.error(`[Roadmap Reminders] Invalid ROADMAP_REMINDER_TIMEZONE "${timezone}"; scheduler disabled.`);
    return;
  }
  console.info(`[Roadmap Reminders] Scheduler enabled for Mondays at 9:00 AM (${timezone}).`);
  timer = setInterval(checkAndSend, CHECK_INTERVAL_MS);
  timer.unref?.();
  checkAndSend();
}

module.exports = { startRoadmapReminderScheduler, sendDueRoadmapReminders };
