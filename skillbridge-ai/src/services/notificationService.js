import api from './api';

const notificationService = {
  getNotifications: () => api.get('/student/notifications'),
  setRead: (notificationId, read) => api.patch(`/student/notifications/${notificationId}/read`, { read }),
  markAllRead: () => api.patch('/student/notifications/read-all'),
};

export default notificationService;
