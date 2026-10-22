import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  Chip,
  Skeleton,
  Alert,
  Divider,
} from '@mui/material';
import {
  FileText,
  CheckCircle2,
  MessageSquare,
  Clock,
  Sparkles,
  Send,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { colors } from '../../theme/theme';
import mentorService from '../../services/mentorService';

export const ReviewQueuePage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeComments, setActiveComments] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    mentorService.getReviewQueue().then((res) => {
      setReviews(res.data);
      setLoading(false);
    });
  }, []);

  const handleApprove = async (reviewId) => {
    const comment = activeComments[reviewId] || 'Approved by mentor. Well-quantified impact.';
    try {
      await mentorService.approveReview(reviewId, comment);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, status: 'approved', mentorComment: comment } : r))
      );
      setToast({ type: 'success', text: 'Feedback dispatched to student dashboard.' });
    } catch {
      setToast({ type: 'error', text: 'Failed to record approval.' });
    }
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Mentor Review Queue" subtitle="Loading pending student submissions..." />
        <Skeleton variant="rounded" height={340} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Mentor Review Queue"
        subtitle="Review student resume bullet revisions and mock interview responses awaiting industry sign-off."
      />

      {toast && (
        <Alert
          severity={toast.type}
          onClose={() => setToast(null)}
          sx={{ mb: 3, borderRadius: 1.5, fontSize: '0.84375rem' }}
        >
          {toast.text}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {reviews.map((rev) => (
          <Card key={rev.id} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: colors.ink }}>
                    {rev.studentName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                    ({rev.rollNo} • {rev.department})
                  </Typography>
                  <Chip
                    label={rev.submissionType}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      backgroundColor: colors.accentLight,
                      color: colors.accent,
                    }}
                  />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600, fontSize: '0.96875rem', color: colors.ink }}>
                  {rev.title}
                </Typography>
              </Box>

              <Chip
                label={rev.status === 'approved' ? 'Approved' : 'Pending Review'}
                size="small"
                sx={{
                  backgroundColor: rev.status === 'approved' ? colors.successBg : colors.warningBg,
                  color: rev.status === 'approved' ? colors.success : colors.warning,
                  border: `1px solid ${rev.status === 'approved' ? colors.successBorder : colors.warningBorder}`,
                  fontWeight: 600,
                  fontSize: '0.71875rem',
                }}
              />
            </Box>

            {/* Submission Content */}
            <Box sx={{ p: 2, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}`, mb: 2 }}>
              <Typography variant="caption" sx={{ color: colors.inkSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, display: 'block', mb: 0.5 }}>
                Student Submission for: {rev.targetCompany}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.ink, lineHeight: 1.6, fontSize: '0.875rem' }}>
                "{rev.content}"
              </Typography>
            </Box>

            {/* Mentor Action Bar */}
            {rev.status === 'pending' ? (
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add mentor commentary or suggested tweaks..."
                  value={activeComments[rev.id] || ''}
                  onChange={(e) =>
                    setActiveComments({ ...activeComments, [rev.id]: e.target.value })
                  }
                />
                <Button
                  variant="contained"
                  onClick={() => handleApprove(rev.id)}
                  startIcon={<CheckCircle2 size={15} />}
                  sx={{ whiteSpace: 'nowrap', py: 0.8, fontSize: '0.8125rem' }}
                >
                  Approve Bullet
                </Button>
              </Box>
            ) : (
              <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: colors.successBg, border: `1px solid ${colors.successBorder}` }}>
                <Typography variant="caption" sx={{ color: colors.success, fontWeight: 700, display: 'block', mb: 0.25 }}>
                  Mentor Feedback Dispatched:
                </Typography>
                <Typography variant="body2" sx={{ color: colors.ink, fontSize: '0.8125rem' }}>
                  "{rev.mentorComment}"
                </Typography>
              </Box>
            )}
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default ReviewQueuePage;
