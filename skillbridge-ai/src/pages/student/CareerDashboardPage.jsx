import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  Chip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Link,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  ArrowRight,
  TrendingUp,
  FileText,
  Headphones,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { ScoreRing } from '../../components/common/ScoreRing';
import { colors } from '../../theme/theme';
import dashboardService from '../../services/dashboardService';

export const CareerDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;
    dashboardService.getSummary().then((res) => {
      if (isMounted) {
        setData(res.data);
        setLoading(false);
      }
    }).catch((error) => {
      if (isMounted) {
        setLoadError(error.response?.data?.message || 'Could not load your dashboard. Please refresh and try again.');
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusChip = (status) => {
    switch (status) {
      case 'offer':
        return (
          <Chip
            label="Offer Received"
            size="small"
            sx={{
              backgroundColor: colors.successBg,
              color: colors.success,
              border: `1px solid ${colors.successBorder}`,
              fontWeight: 600,
            }}
          />
        );
      case 'interview':
        return (
          <Chip
            label="Interview Scheduled"
            size="small"
            sx={{
              backgroundColor: colors.accentLight,
              color: colors.accent,
              border: `1px solid ${colors.accentBorder}`,
              fontWeight: 600,
            }}
          />
        );
      case 'oa':
      case 'assessment':
        return (
          <Chip
            label="OA Cleared"
            size="small"
            sx={{
              backgroundColor: colors.warningBg,
              color: colors.warning,
              border: `1px solid ${colors.warningBorder}`,
              fontWeight: 600,
            }}
          />
        );
      case 'rejected':
        return <Chip label="Archived" size="small" sx={{ backgroundColor: colors.surfaceSubtle, color: colors.inkSecondary, border: `1px solid ${colors.border}` }} />;
      default:
        return (
          <Chip
            label="Applied"
            size="small"
            sx={{
              backgroundColor: colors.surfaceSubtle,
              color: colors.inkSecondary,
              border: `1px solid ${colors.border}`,
            }}
          />
        );
    }
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Career Readiness Dashboard" subtitle="Loading placement diagnostic metrics..." />
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rounded" height={260} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rounded" height={260} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12}>
            <Skeleton variant="rounded" height={320} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (loadError) {
    return <Box><PageHeader title="Career Readiness Dashboard" subtitle="Your saved placement activity and practice signals." /><Alert severity="error">{loadError}</Alert></Box>;
  }

  return (
    <Box>
      <PageHeader
        title="Career Readiness Dashboard"
        subtitle="A snapshot of your saved resume, interview practice, and application tracker."
        action={
          <Button
            component={RouterLink}
            to="/resumes"
            variant="contained"
            startIcon={<FileText size={16} />}
            sx={{ fontSize: '0.8125rem' }}
          >
            Manage Resumes
          </Button>
        }
      />

      {/* Row 1: Health Score Diagnostic + Core Pillars */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        {/* Career Health Composite Score Card */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: 2,
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: colors.inkSecondary, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Overall Readiness
                </Typography>
                <Chip
                  label={data.healthScore === null ? 'Add activity' : data.healthScore >= 75 ? 'Strong signals' : 'In progress'}
                  size="small"
                  sx={{
                    backgroundColor: colors.successBg,
                    color: colors.success,
                    border: `1px solid ${colors.successBorder}`,
                    fontSize: '0.71875rem',
                    fontWeight: 600,
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
                {data.healthScore === null ? <Typography variant="h3" sx={{ color: colors.inkSecondary }}>No score yet</Typography> : <ScoreRing
                  score={data.healthScore}
                  max={100}
                  size={135}
                  strokeWidth={10}
                  label="Health Score"
                  tooltip="Weighted average of the saved AI resume review, role-fit analysis, and latest completed mock interview. Missing scores are excluded. This is an estimate, not a placement prediction."
                />}
              </Box>

              <Typography variant="body2" sx={{ textAlign: 'center', color: colors.inkSecondary, fontSize: '0.8125rem', px: 1, mt: 1 }}>
                Current estimate from your saved data; it is not a peer ranking or placement prediction.
              </Typography>
            </Box>

            {/* Sub-weights */}
            <Box sx={{ pt: 2, mt: 2, borderTop: `1px solid ${colors.borderLight}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                  AI Resume Review ({data.healthBreakdown.resumeWeight ?? 40}%)
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: colors.ink, fontVariantNumeric: 'tabular-nums' }}>
                  {data.healthBreakdown.resumeScore ?? '—'}/100
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                  Interview Drills ({data.healthBreakdown.interviewWeight ?? 35}%)
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: colors.ink, fontVariantNumeric: 'tabular-nums' }}>
                  {data.healthBreakdown.interviewScore ?? '—'}/100
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                  AI Role Alignment ({data.healthBreakdown.skillWeight ?? 25}%)
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: colors.ink, fontVariantNumeric: 'tabular-nums' }}>
                  {data.healthBreakdown.skillScore ?? '—'}/100
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* 4 Stat Cards in 2x2 Grid */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2} sx={{ height: '100%' }}>
            <Grid item xs={12} sm={6}>
              <StatCard
                title="AI Resume Review"
                value={data.healthBreakdown.resumeScore ?? '—'}
                unit="/ 100"
                tooltip="Saved AI review of the extracted resume text. This is guidance, not an ATS score or hiring prediction."
                subtitle={data.primaryResumeName ? `Primary: ${data.primaryResumeName}` : 'Upload a resume to see text signals'}
                icon={FileText}
                action={
                  <Button
                    component={RouterLink}
                    to="/resume-intelligence"
                    size="small"
                    sx={{ fontSize: '0.75rem', p: '2px 8px' }}
                  >
                    View report
                  </Button>
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StatCard
                title="Mock Interview Score"
                value={data.healthBreakdown.interviewScore ?? '—'}
                unit="/ 100"
                tooltip="Score from your latest completed written interview practice session."
                subtitle={data.latestInterviewAt ? `Completed: ${new Date(data.latestInterviewAt).toLocaleDateString()}` : 'No completed practice session'}
                icon={Headphones}
                action={
                  <Button
                    component={RouterLink}
                    to="/mock-interview"
                    size="small"
                    sx={{ fontSize: '0.75rem', p: '2px 8px' }}
                  >
                    Start drill
                  </Button>
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StatCard
                title="Applications & Funnel"
                value={data.stats.appliedJobs}
                unit="applied"
                tooltip="Total companies applied to on-campus and direct off-campus"
                subtitle={`${data.stats.assessments} assessments • ${data.stats.interviewsScheduled} interviews`}
                icon={Briefcase}
                action={
                  <Button
                    component={RouterLink}
                    to="/placement-tracker"
                    size="small"
                    sx={{ fontSize: '0.75rem', p: '2px 8px' }}
                  >
                    Tracker
                  </Button>
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <StatCard
                title="Offers Tracked"
                value={data.stats.offersCount}
                unit="offer"
                tooltip="Formal offer letters received through campus placement cell"
                subtitle="From your placement tracker"
                variant="highlight"
                icon={CheckCircle2}
                action={<Button component={RouterLink} to="/placement-tracker" size="small">View tracker</Button>}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Row 2: Progress Analytics Chart (Recharts) */}
      <Card sx={{ p: { xs: 2.5, sm: 3 }, mb: 3.5, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2.5, gap: 1 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.15rem', color: colors.ink }}>
              Readiness History
            </Typography>
            <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
              Daily readiness and roadmap progress snapshots for {data.targetRole || 'your current profile'}. Completing a roadmap task saves today’s progress.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, sm: 1 }, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: colors.accent }} />
              <Typography variant="caption" sx={{ color: colors.inkSecondary }}>Overall</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: colors.success }} />
              <Typography variant="caption" sx={{ color: colors.inkSecondary }}>AI Resume Review</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: colors.warning }} />
              <Typography variant="caption" sx={{ color: colors.inkSecondary }}>Mock Interview</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#7c5ce7' }} />
              <Typography variant="caption" sx={{ color: colors.inkSecondary }}>Roadmap Progress</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ width: '100%', height: 260 }}>
          {data.progressTimeline?.length ? <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.progressTimeline}
              margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.borderLight} vertical={false} />
              <XAxis
                dataKey="date"
                stroke={colors.inkTertiary}
                fontSize={12}
                tickLine={false}
                minTickGap={28}
              />
              <YAxis
                domain={[0, 100]}
                stroke={colors.inkTertiary}
                fontSize={12}
                tickLine={false}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: 6,
                  fontSize: 12,
                  boxShadow: '0 4px 12px rgba(23, 22, 28, 0.08)',
                }}
              />
              <Line
                type="monotone"
                dataKey="overall"
                name="Overall Readiness"
                stroke={colors.accent}
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: colors.accent }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="resume"
                name="AI Resume Review"
                stroke={colors.success}
                strokeWidth={1.8}
                dot={{ r: 3, fill: colors.success }}
              />
              <Line
                type="monotone"
                dataKey="interview"
                name="Mock Interview"
                stroke={colors.warning}
                strokeWidth={1.8}
                dot={{ r: 3, fill: colors.warning }}
              />
              <Line
                type="monotone"
                dataKey="roadmap"
                name="Roadmap Progress"
                stroke="#7c5ce7"
                strokeWidth={2}
                connectNulls
                dot={{ r: 3, fill: '#7c5ce7' }}
              />
            </LineChart>
          </ResponsiveContainer> : <Box sx={{ height: '100%', display: 'grid', placeItems: 'center', color: colors.inkSecondary }}>
            <Typography variant="body2">Your first readiness snapshot will appear here once a saved AI score is available.</Typography>
          </Box>}
        </Box>
      </Card>

      {/* Row 3: Two Columns - What to do next (Left) & Recent Applications Snapshot (Right) */}
      <Grid container spacing={3}>
        {/* "What to do next" 3 Concrete Actions */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.1rem', color: colors.ink }}>
                  What to do next
                </Typography>
                <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                  Suggested from the information saved to your account
                </Typography>
              </Box>
              <Sparkles size={18} color={colors.accent} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {(data?.nextActions || data?.recommendedActions || []).map((act, idx) => (
                <Box
                  key={act.id}
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    border: `1px solid ${colors.borderLight}`,
                    backgroundColor: colors.surfaceSubtle,
                    transition: 'all 120ms ease',
                    '&:hover': {
                      borderColor: colors.accentBorder,
                      backgroundColor: colors.surface,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                    <Chip
                      label={act.category}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        backgroundColor: colors.accentLight,
                        color: colors.accent,
                        borderRadius: 1,
                      }}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: colors.inkSecondary }}>
                      <Clock size={12} />
                      <Typography variant="caption" sx={{ fontSize: '0.6875rem' }}>
                        {act.estTime}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.84375rem', color: colors.ink, mb: 0.5 }}>
                    {act.title}
                  </Typography>

                  <Typography variant="caption" sx={{ color: colors.inkSecondary, lineHeight: 1.55, display: 'block', mb: 1.5 }}>
                    {act.description}
                  </Typography>

                  <Button
                    component={RouterLink}
                    to={act.actionUrl}
                    variant="text"
                    size="small"
                    endIcon={<ArrowRight size={13} />}
                    sx={{
                      p: 0,
                      fontSize: '0.78125rem',
                      fontWeight: 600,
                      color: colors.accent,
                      '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
                    }}
                  >
                    {act.actionText}
                  </Button>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>

        {/* Recent Applications Snapshot */}
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.1rem', color: colors.ink }}>
                  Active Drive Snapshot
                </Typography>
                <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                  Recent campus placement applications and status
                </Typography>
              </Box>
              <Button
                component={RouterLink}
                to="/placement-tracker"
                variant="outlined"
                size="small"
                endIcon={<ChevronRight size={14} />}
                sx={{ fontSize: '0.75rem', py: 0.4 }}
              >
                Full Kanban
              </Button>
            </Box>

            <TableContainer sx={{ mt: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Company & Role</TableCell>
                    <TableCell>Package</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Next Milestone</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data?.recentApplications || []).map((app) => (
                    <TableRow key={app.id} hover>
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.84375rem', color: colors.ink }}>
                          {app.company}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                          {app.role}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: colors.ink }}>
                        {app.package}
                      </TableCell>
                      <TableCell>{getStatusChip(app.status)}</TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', maxWidth: 160 }}>
                          {app.nextStep}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!data?.recentApplications?.length && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: colors.inkSecondary }}>No applications saved yet. Add one in Placement Tracker to see it here.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 2.5, p: 1.5, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                Application stages shown here come from your placement tracker.
              </Typography>
              <Link
                component={RouterLink}
                to="/mock-interview"
                sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.accent, textDecoration: 'none' }}
              >
                Practice interview →
              </Link>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CareerDashboardPage;
