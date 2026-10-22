import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const seedUsers = [
  {
    name: 'Aarthi Raman',
    email: 'aarthi.raman@cit.edu.in',
    password: 'PlacementReady#2025',
    role: 'student',
    department: 'Computer Science and Engineering',
    college: 'Chennai Institute of Technology',
    batchYear: 2025,
    cgpa: 8.42,
    targetRole: 'Full Stack Engineer',
    careerHealthScore: 74,
    resumeScore: 72,
    interviewScore: 68,
    phone: '+91 98401 22849',
    linkedin: 'linkedin.com/in/aarthi-raman-dev',
    github: 'github.com/aarthiraman',
  },
  {
    name: 'Prof. K. Soundararajan',
    email: 'placement.cell@cit.edu.in',
    password: 'PlacementReady#2025',
    role: 'coordinator',
    department: 'Training & Placement Directorate',
    college: 'Chennai Institute of Technology',
    phone: '+91 94440 18273',
  },
  {
    name: 'Priya Sundaram',
    email: 'priya.sundaram@alumni.cit.edu.in',
    password: 'PlacementReady#2025',
    role: 'mentor',
    department: 'Freshworks (Staff Frontend Engineer)',
    college: 'Chennai Institute of Technology Alumni',
    phone: '+91 98842 10934',
    linkedin: 'linkedin.com/in/priyasundaram-dev',
  },
  {
    name: 'Rajeshwaran S',
    email: 'admin@skillbridge.edu.in',
    password: 'PlacementReady#2025',
    role: 'admin',
    department: 'Platform Operations Directorate',
    college: 'SkillBridge Core Platform',
    phone: '+91 98410 77123',
  },
];

const runSeed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillbridge_ai';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing demo users...');
    await User.deleteMany({
      email: { $in: seedUsers.map((u) => u.email) },
    });

    console.log('[Seed] Inserting authenticated demo accounts...');
    for (const userData of seedUsers) {
      await User.create(userData);
      console.log(`  ✓ Created ${userData.role.toUpperCase()}: ${userData.name} (${userData.email})`);
    }

    console.log('[Seed] Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Failed to seed database: ${error.message}`);
    process.exit(1);
  }
};

runSeed();
