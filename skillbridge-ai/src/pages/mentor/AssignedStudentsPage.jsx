import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  Button,
  Chip,
  Avatar,
  Skeleton,
} from '@mui/material';
import {
  Users,
  MessageSquare,
  FileText,
  CheckCircle2,
  Calendar,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { colors } from '../../theme/theme';
import mentorService from '../../services/mentorService';

export const AssignedStudentsPage = () => {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mentorService.getAssignedStudents().then((res) => setMentees(res.data)).catch(() => setMentees([])).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box>
        <PageHeader title="Assigned Mentees" subtitle="Loading your industry mentee cohort..." />
        <Skeleton variant="rounded" height={360} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Assigned Mentees (Industry Mentorship Track)"
        subtitle={`${mentees.length} student${mentees.length === 1 ? '' : 's'} currently assigned to you.`}
        action={
          <Button
            component={RouterLink}
            to="/mentor/reviews"
            variant="contained"
            startIcon={<FileText size={15} />}
            sx={{ fontSize: '0.8125rem' }}
          >
            Review Queue
          </Button>
        }
      />

      <Grid container spacing={3}>
        {mentees.map((mentee) => (
          <Grid item xs={12} md={4} key={mentee.id}>
            <Card sx={{ p: 3, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Avatar sx={{ width: 42, height: 42, backgroundColor: colors.accentLight, color: colors.accent, fontWeight: 700, border: `1px solid ${colors.accentBorder}` }}>
                    {mentee.name.split(' ').map((n) => n[0]).join('')}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: colors.ink }}>
                      {mentee.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                    {mentee.email} • {mentee.department} • CGPA: {mentee.cgpa ?? '—'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ p: 1.75, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}`, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography variant="caption" sx={{ color: colors.inkSecondary }}>AI Resume Review:</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: colors.accent, fontVariantNumeric: 'tabular-nums' }}>
                      {mentee.resumeReviewScore == null ? '—' : `${mentee.resumeReviewScore}/100`}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography variant="caption" sx={{ color: colors.inkSecondary }}>Latest Interview Score:</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: colors.success, fontVariantNumeric: 'tabular-nums' }}>
                      {mentee.interviewScore == null ? '—' : `${mentee.interviewScore}/100`}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: colors.inkSecondary }}>Active Application:</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: colors.ink }}>
                      {mentee.activeApplication}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ pt: 2, borderTop: `1px solid ${colors.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                  {mentee.pendingReviews} pending review{mentee.pendingReviews === 1 ? '' : 's'}
                </Typography>
                <Button
                  component={RouterLink}
                  to="/mentor/reviews"
                  size="small"
                  variant="outlined"
                  endIcon={<ArrowRight size={13} />}
                  sx={{ fontSize: '0.75rem', py: 0.4 }}
                >
                  Inspect reviews
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
        {!mentees.length && <Grid item xs={12}><Card sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}><Typography variant="body1" sx={{ fontWeight: 600, color: colors.ink }}>No students are assigned to you yet.</Typography><Typography variant="body2" sx={{ mt: 1, color: colors.inkSecondary }}>A placement coordinator can assign students from the cohort directory.</Typography></Card></Grid>}
      </Grid>
    </Box>
  );
};

export default AssignedStudentsPage;
