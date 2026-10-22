import api, { USE_MOCK, mockDelay } from './api';

let mockReviewQueue = [
  {
    id: 'rev_01',
    studentName: 'Aarthi Raman',
    rollNo: '211421104002',
    department: 'CSE',
    submissionType: 'Resume Bullet Rewrite',
    title: 'Razorpay Payment & Latency Optimization Bullet',
    submittedAt: 'Yesterday at 5:20 PM',
    content: 'Architected a full-stack e-commerce portal utilizing React, Node.js, and Razorpay API; reduced checkout latency by 28% and handled 1,200+ simulated concurrent carts.',
    status: 'pending',
    targetCompany: 'Freshworks (Technical Round 2)',
  },
  {
    id: 'rev_02',
    studentName: 'Mohammed Faizal',
    rollNo: '211421104048',
    department: 'CSE',
    submissionType: 'Mock Interview Transcript',
    title: 'SQL Indexing & ACID Isolation Levels Response',
    submittedAt: 'Today at 10:15 AM',
    content: 'Leftmost prefix rule explained for compound index (dept_id, salary). Candidate missed index scan fallback behavior during inequality queries.',
    status: 'pending',
    targetCompany: 'TCS Digital',
  },
  {
    id: 'rev_03',
    studentName: 'Divya K',
    rollNo: '211421104021',
    department: 'IT',
    submissionType: 'Resume Bullet Rewrite',
    title: 'Cloud S3 Presigned URL Upload Bullet',
    submittedAt: '2 days ago',
    content: 'Implemented secure client-side S3 multipart upload using AWS SDK presigned URLs, eliminating server bandwidth bottlenecks for 50MB+ media attachments.',
    status: 'pending',
    targetCompany: 'Zoho Corporation',
  },
];

export const mentorService = {
  getReviewQueue: async () => {
    if (USE_MOCK) {
      return mockDelay([...mockReviewQueue], 220);
    }
    return api.get('/mentor/reviews');
  },

  approveReview: async (reviewId, feedbackComment) => {
    if (USE_MOCK) {
      mockReviewQueue = mockReviewQueue.map((r) =>
        r.id === reviewId ? { ...r, status: 'approved', mentorComment: feedbackComment } : r
      );
      return mockDelay({ success: true, reviewId }, 200);
    }
    return api.post(`/mentor/reviews/${reviewId}/approve`, { feedbackComment });
  },
};

export default mentorService;
