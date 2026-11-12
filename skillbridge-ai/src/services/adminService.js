import api, { USE_MOCK, mockDelay } from './api';

let mockUsersStore = [
  {
    id: 'usr_stu_001',
    name: 'Aarthi Raman',
    email: 'aarthi.raman@student.demo.skillbridge.local',
    role: 'student',
    status: 'active',
    department: 'CSE',
    registeredAt: '2025-08-10',
    lastLogin: '10 mins ago',
  },
  {
    id: 'usr_coord_001',
    name: 'Prof. K. Soundararajan',
    email: 'placement.cell@coordinator.demo.skillbridge.local',
    role: 'coordinator',
    status: 'active',
    department: 'Training & Placement Directorate',
    registeredAt: '2025-06-01',
    lastLogin: '1 hour ago',
  },
  {
    id: 'usr_mentor_001',
    name: 'Priya Sundaram',
    email: 'priya.sundaram@mentor.demo.skillbridge.local',
    role: 'mentor',
    status: 'active',
    department: 'Freshworks (Alumni Mentor)',
    registeredAt: '2025-07-15',
    lastLogin: 'Yesterday',
  },
  {
    id: 'u_04',
    name: 'Mohammed Faizal',
    email: 'mohammed.faizal@cit.edu.in',
    role: 'student',
    status: 'active',
    department: 'CSE',
    registeredAt: '2025-08-12',
    lastLogin: '2 hours ago',
  },
  {
    id: 'u_05',
    name: 'Divya K',
    email: 'divya.k@cit.edu.in',
    role: 'student',
    status: 'active',
    department: 'IT',
    registeredAt: '2025-08-14',
    lastLogin: 'Yesterday',
  },
  {
    id: 'usr_adm_001',
    name: 'Rajeshwaran S',
    email: 'admin@admin.demo.skillbridge.local',
    role: 'admin',
    status: 'active',
    department: 'Platform Operations',
    registeredAt: '2025-05-01',
    lastLogin: 'Just now',
  },
];

let mockPlatformSettings = {
  institutionName: 'Chennai Institute of Technology',
  placementSeasonYear: '2025–2026',
  aiProvider: 'Configured AI provider',
  aiModel: 'gemini-3.6-flash',
  emailDelivery: { mode: 'console', state: 'development' },
  atsWeights: {
    resumeFormatting: 25,
    keywordDensity: 35,
    sectionIntegrity: 20,
    impactActionVerbs: 20,
  },
  compositeWeights: {
    resumeScoreWeight: 40,
    mockInterviewWeight: 35,
    skillAlignmentWeight: 25,
  },
  campusDriveAutoArchiveDays: 30,
};

export const adminService = {
  getUsers: async () => {
    if (USE_MOCK) {
      return mockDelay([...mockUsersStore], 220);
    }
    return api.get('/admin/users');
  },

  updateUserRole: async (userId, newRole) => {
    if (USE_MOCK) {
      mockUsersStore = mockUsersStore.map((u) =>
        u.id === userId ? { ...u, role: newRole } : u
      );
      return mockDelay({ success: true, userId, newRole }, 180);
    }
    return api.patch(`/admin/users/${userId}/role`, { role: newRole });
  },

  toggleUserStatus: async (userId) => {
    if (USE_MOCK) {
      mockUsersStore = mockUsersStore.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u
      );
      return mockDelay({ success: true, userId }, 180);
    }
    return api.patch(`/admin/users/${userId}/status`);
  },

  getSettings: async () => {
    if (USE_MOCK) {
      return mockDelay({ ...mockPlatformSettings }, 200);
    }
    return api.get('/admin/settings');
  },

  updateSettings: async (updated) => {
    if (USE_MOCK) {
      mockPlatformSettings = { ...mockPlatformSettings, ...updated };
      return mockDelay({ success: true, settings: mockPlatformSettings }, 250);
    }
    return api.put('/admin/settings', updated);
  },
};

export default adminService;
