import api from './api';

export const mentorService = {
  getReviewQueue: async () => {
    return api.get('/mentor/reviews');
  },

  getAssignedStudents: async () => api.get('/mentor/students'),
  respondToReview: async (reviewId, feedbackComment, status) => api.post(`/mentor/reviews/${reviewId}/respond`, { feedbackComment, status }),
  requestReview: async (submission) => api.post('/mentor/student/reviews', submission),
  getMyReviews: async () => api.get('/mentor/student/reviews'),
};

export default mentorService;
