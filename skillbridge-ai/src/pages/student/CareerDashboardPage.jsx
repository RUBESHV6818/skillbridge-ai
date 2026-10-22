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

  useEffect(() => {
    let isMounted = true;
    dashboardService.getSummary().then((res) => {
      if (isMounted) {
        setData(res.data);
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

  return (
    <Box>
      <PageHeader
        title="Career Readiness Dashboard"
        subtitle="Holistic diagnosis of your ATS resume benchmark, mock interview rigor, and active campus drives."
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
                  label="Placement Ready"
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
                <ScoreRing
                  score={data.healthScore}
                  max={100}
                  size={135}
                  strokeWidth={10}
                  label="Health Score"
                  tooltip="Weighted formula: 40% ATS Resume Score + 35% AI Mock Interview Score + 25% Target Skill Alignment"
                />
              </Box>

              <Typography variant="body2" sx={{ textAlign: 'center', color: colors.inkSecondary, fontSize: '0.8125rem', px: 1, mt: 1 }}>
                Calculated across <strong>14 campus fullstack JDs</strong>. Top 21% of CIT 2025 cohort.
              </Typography>
            </Box>

            {/* Sub-weights */}
            <Box sx={{ pt: 2, mt: 2, borderTop: `1px solid ${colors.borderLight}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                  Resume Quality (40%)
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: colors.ink, fontVariantNumeric: 'tabular-nums' }}>
                  {data.healthBreakdown.resumeScore}/100
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                  Interview Drills (35%)
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: colors.ink, fontVariantNumeric: 'tabular-nums' }}>
                  {data.healthBreakdown.interviewScore}/100
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                  Target Skill Fit (25%)
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: colors.ink, fontVariantNumeric: 'tabular-nums' }}>
                  {data.healthBreakdown.skillScore}/100
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
                title="Primary ATS Score"
                value={data.healthBreakdown.resumeScore}
                unit="/ 100"
                tooltip="Based on Aarthi_Raman_FullStack_2025.pdf against standard ATS parsers"
                trend={4}
                trendLabel="vs last revision"
                subtitle="Primary: FullStack_2025.pdf"
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
                value={data.healthBreakdown.interviewScore}
                unit="/ 100"
                tooltip="Average score across 4 simulated technical & behavioral sessions"
                trend={8}
                trendLabel="vs initial baseline"
                subtitle="Last evaluated: 2 days ago"
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
                subtitle={`${data.stats.shortlists} shortlists • ${data.stats.interviewsScheduled} interviews scheduled`}
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
                title="Active Offers"
                value={data.stats.offersCount}
                unit="offer"
                tooltip="Formal offer letters received through campus placement cell"
                subtitle="Zoho Corp (MTS) • ₹5.6 LPA CTC"
                variant="highlight"
                icon={CheckCircle2}
                action={
                  <Chip
                    label="Offer Accepted"
                    size="small"
                    sx={{
                      backgroundColor: colors.accent,
                      color: '#FFFFFF',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      height: 20,
                    }}
                  />
                }
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
              Readiness Trajectory (6-Week Trend)
            </Typography>
            <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
              Tracking ATS optimization, interview fluency, and overall placement preparedness.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: colors.accent }} />
              <Typography variant="caption" sx={{ color: colors.inkSecondary }}>Overall</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: colors.success }} />
              <Typography variant="caption" sx={{ color: colors.inkSecondary }}>ATS Resume</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: colors.warning }} />
              <Typography variant="caption" sx={{ color: colors.inkSecondary }}>Mock Interview</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.progressTimeline}
              margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.borderLight} vertical={false} />
              <XAxis
                dataKey="week"
                stroke={colors.inkTertiary}
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                domain={[30, 90]}
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
                name="ATS Resume"
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
            </LineChart>
          </ResponsiveContainer>
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
                  3 highest-impact actions prioritized by your gap analysis
                </Typography>
              </Box>
              <Sparkles size={18} color={colors.accent} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {data.nextActions.map((act, idx) => (
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
                  {data.recentApplications.map((app) => (
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
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 2.5, p: 1.5, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                Next upcoming: <strong>Freshworks Technical Round 2</strong> tomorrow at 2:30 PM
              </Typography>
              <Link
                component={RouterLink}
                to="/mock-interview"
                sx={{ fontSize: '0.75rem', fontWeight: 600, color: colors.accent, textDecoration: 'none' }}
              >
                Practice freshworks drill →
              </Link>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CareerDashboardPage;
