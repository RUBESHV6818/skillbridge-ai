import api, { USE_MOCK, mockDelay } from './api';

// Realistic mock users for instant testing and role evaluation
export const MOCK_USERS = {
  student: {
    id: 'usr_stu_001',
    name: 'Aarthi Raman',
    email: 'aarthi.raman@student.demo.skillbridge.local',
    role: 'student',
    avatar: 'AR',
    department: 'Computer Science and Engineering',
    college: 'Chennai Institute of Technology',
    batchYear: 2025,
    cgpa: 8.42,
    targetRole: 'Full Stack Engineer',
    targetRoleConfirmed: true,
    careerHealthScore: 74,
    resumeScore: 72,
    interviewScore: 68,
    appliedJobsCount: 14,
    shortlistsCount: 5,
    interviewsCount: 3,
    offersCount: 1,
    phone: '+91 98401 22849',
    linkedin: 'linkedin.com/in/aarthi-raman-dev',
    github: 'github.com/aarthiraman',
  },
  coordinator: {
    id: 'usr_coord_001',
    name: 'Prof. K. Soundararajan',
    email: 'placement.cell@coordinator.demo.skillbridge.local',
    role: 'coordinator',
    avatar: 'KS',
    department: 'Training & Placement Directorate',
    college: 'Chennai Institute of Technology',
    designation: 'Associate Dean — Industry Relations & Placement',
    activeDrives: 8,
    totalRegistered: 486,
    placedCount: 312,
  },
  mentor: {
    id: 'usr_mentor_001',
    name: 'Priya Sundaram',
    email: 'priya.sundaram@mentor.demo.skillbridge.local',
    role: 'mentor',
    avatar: 'PS',
    currentCompany: 'Freshworks',
    designation: 'Staff Frontend Engineer',
    experienceYears: 7,
    menteesAssigned: 12,
    reviewsPending: 3,
  },
  admin: {
    id: 'usr_adm_001',
    name: 'Rajeshwaran S',
    email: 'admin@admin.demo.skillbridge.local',
    role: 'admin',
    avatar: 'RS',
    designation: 'Platform Administrator',
  },
};

export const authService = {
  demoLogin: async (role) => {
    const response = await api.post('/auth/demo-login', { role });
    if (response.data.token) {
      localStorage.setItem('skillbridge_token', response.data.token);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('skillbridge_user', JSON.stringify(response.data.user));
    }
    return response;
  },

  login: async (email, password) => {
    if (USE_MOCK) {
      // Find matching mock user or default to student
      const normalizedEmail = email.toLowerCase().trim();
      let matchedUser = Object.values(MOCK_USERS).find((u) => u.email.toLowerCase() === normalizedEmail);

      // If user typed custom credentials, pick student role with their name or email
      if (!matchedUser) {
        matchedUser = {
          ...MOCK_USERS.student,
          id: `usr_${Date.now()}`,
          name: email.split('@')[0].replace('.', ' '),
          email: normalizedEmail,
        };
      }

      const mockResponse = {
        token: `sb_mock_jwt_${matchedUser.role}_${Date.now()}`,
        user: matchedUser,
      };

      localStorage.setItem('skillbridge_token', mockResponse.token);
      localStorage.setItem('token', mockResponse.token);
      localStorage.setItem('skillbridge_user', JSON.stringify(mockResponse.user));
      return mockDelay(mockResponse, 300);
    }

    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('skillbridge_token', response.data.token);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('skillbridge_user', JSON.stringify(response.data.user));
    }
    return response;
  },

  register: async (registrationData) => {
    if (USE_MOCK) {
      const newUser = {
        id: `usr_${Date.now()}`,
        name: registrationData.name,
        email: registrationData.email,
        role: registrationData.role || 'student',
        verified: true,
        avatar: registrationData.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
        department: registrationData.department || 'Computer Science and Engineering',
        college: registrationData.college || 'Engineering College',
        batchYear: registrationData.batchYear || 2025,
        targetRole: registrationData.targetRole || '',
        targetRoleConfirmed: Boolean(registrationData.targetRole),
        careerHealthScore: 60,
        resumeScore: 58,
        interviewScore: 50,
      };

      const mockResponse = {
        token: `sb_mock_jwt_${newUser.role}_${Date.now()}`,
        user: newUser,
      };

      localStorage.setItem('skillbridge_token', mockResponse.token);
      localStorage.setItem('token', mockResponse.token);
      localStorage.setItem('skillbridge_user', JSON.stringify(newUser));
      return mockDelay(mockResponse, 350);
    }

    const response = await api.post('/auth/register', registrationData);
    if (response.data.token && response.data.user?.verified !== false) {
      localStorage.setItem('skillbridge_token', response.data.token);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('skillbridge_user', JSON.stringify(response.data.user));
    } else {
      localStorage.removeItem('skillbridge_token');
      localStorage.removeItem('token');
      localStorage.removeItem('skillbridge_user');
    }
    return response;
  },

  getCurrentUser: () => {
    const raw = localStorage.getItem('skillbridge_user');
    if (!raw) return null;
    try {
      const u = JSON.parse(raw);
      if (!u) return null;
      return {
        id: u.id || u._id,
        _id: u._id || u.id,
        name: u.name || 'Student',
        email: u.email || '',
        role: u.role || 'student',
        avatar: (u.name || 'S')
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
        department: u.department || '',
        college: u.college || '',
        batchYear: u.batchYear ?? '',
        cgpa: u.cgpa ?? '',
        phone: u.phone || '',
        targetRole: u.targetRole || '',
        linkedin: u.linkedin || '',
        github: u.github || '',
        notificationPreferences: u.notificationPreferences || {
          driveAlerts: true,
          mentorComments: true,
          weeklyRoadmapReminders: false,
        },
        ...u,
      };
    } catch {
      return null;
    }
  },

  getProfile: async () => api.get('/auth/me'),

  updateProfile: async (profile) => {
    const response = await api.put('/auth/me', profile);
    localStorage.setItem('skillbridge_user', JSON.stringify(response.data));
    return response;
  },

  getToken: () => {
    return localStorage.getItem('skillbridge_token') || localStorage.getItem('token');
  },

  logout: async () => {
    localStorage.removeItem('skillbridge_token');
    localStorage.removeItem('token');
    localStorage.removeItem('skillbridge_user');
    if (!USE_MOCK) {
      try {
        await api.post('/auth/logout');
      } catch {
        // Silent catch for logout
      }
    }
    return Promise.resolve();
  },

  forgotPassword: async (email) => {
    if (USE_MOCK) {
      return mockDelay({
        message: `Password reset link has been dispatched to ${email}. Check your inbox within 10 minutes.`,
      }, 400);
    }
    return api.post('/auth/forgot-password', { email });
  },

  resendVerification: async (email) => {
    if (USE_MOCK) {
      return mockDelay({ message: 'Demo accounts are already verified. You can sign in with a demo persona.' }, 300);
    }
    return api.post('/auth/resend-verification', { email });
  },

  resetPassword: async ({ email, token, password }) => api.post('/auth/reset-password', { email, token, password }),
};

export default authService;
