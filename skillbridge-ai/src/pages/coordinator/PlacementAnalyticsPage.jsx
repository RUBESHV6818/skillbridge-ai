import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  TrendingUp,
  Building2,
  Users,
  Award,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { colors } from '../../theme/theme';
import coordinatorService from '../../services/coordinatorService';

export const PlacementAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    coordinatorService.getAnalytics().then((res) => {
      if (isMounted) {
        setData(res.data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Box>
        <PageHeader title="Placement Drives & CTC Analytics" subtitle="Loading recruitment cohort telemetry..." />
        <Skeleton variant="rounded" height={420} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  const PIE_COLORS = [colors.accent, colors.border];

  return (
    <Box>
      <PageHeader
        title="Placement Drives & CTC Analytics"
        subtitle="Institutional placement metrics, recruiter conversion distribution, and salary packaging bands for CIT 2025."
      />

      {/* Top 4 KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Registered"
            value={data.totalRegistered}
            unit="students"
            tooltip="Final year B.E./B.Tech students active in the 2025 placement cycle"
            subtitle="CIT Chennai 2025 Batch"
            icon={Users}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Placed Students"
            value={data.placedCount}
            unit="offers"
            tooltip="Students who have received one or more formal offer letters"
            trend={12}
            trendLabel="vs last year"
            variant="highlight"
            icon={Award}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Placement Rate"
            value={`${data.placementRate}%`}
            tooltip="Percentage of eligible registered candidates placed to date"
            trend={5}
            trendLabel="target: 85%"
            icon={TrendingUp}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average CTC Package"
            value={data.averagePackage}
            tooltip="Mean annual cost-to-company across all accepted campus offers"
            subtitle={`Highest: ${data.highestPackage}`}
            icon={Building2}
          />
        </Grid>
      </Grid>

      {/* Row 2: Offers by Company Bar Chart + CTC Package Distribution */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        {/* Recruiter Breakdown */}
        <Grid item xs={12} md={7}>
          <Card sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.05rem', color: colors.ink }}>
                  Offers Secured by Campus Recruiter
                </Typography>
                <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                  Top recruiters ranked by volume of formal offers issued
                </Typography>
              </Box>
            </Box>

            <Box sx={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.companyDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.borderLight} vertical={false} />
                  <XAxis dataKey="name" stroke={colors.inkTertiary} fontSize={11} tickLine={false} />
                  <YAxis stroke={colors.inkTertiary} fontSize={11} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="offers" name="Offers Issued" fill={colors.accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>

        {/* CTC Package Bands */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 2, height: '100%' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.05rem', color: colors.ink }}>
                CTC Package Distribution Bands
              </Typography>
              <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                Tier classification across total accepted offers
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
              {data.salaryBands.map((band, idx) => {
                const total = data.placedCount;
                const pct = Math.round((band.count / total) * 100);

                return (
                  <Box key={idx} sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                        {band.band}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: colors.accent, fontVariantNumeric: 'tabular-nums' }}>
                        {band.count} offers ({pct}%)
                      </Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 6, borderRadius: 3, backgroundColor: colors.borderLight }}>
                      <Box sx={{ width: `${pct}%`, height: '100%', borderRadius: 3, backgroundColor: colors.accent }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PlacementAnalyticsPage;
