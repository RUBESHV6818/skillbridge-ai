import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  Chip,
  Skeleton,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Milestone,
  Check,
  Info,
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { SkillChip } from '../../components/common/SkillChip';
import { colors } from '../../theme/theme';
import skillGapService from '../../services/skillGapService';

export const SkillGapPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    skillGapService.getAnalysis().then((res) => {
      if (isMounted) {
        setData(res.data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return (
          <Chip
            label="High Priority"
            size="small"
            sx={{
              backgroundColor: colors.errorBg,
              color: colors.error,
              border: `1px solid ${colors.errorBorder}`,
              fontWeight: 700,
              fontSize: '0.6875rem',
              height: 20,
            }}
          />
        );
      case 'medium':
        return (
          <Chip
            label="Medium Priority"
            size="small"
            sx={{
              backgroundColor: colors.warningBg,
              color: colors.warning,
              border: `1px solid ${colors.warningBorder}`,
              fontWeight: 600,
              fontSize: '0.6875rem',
              height: 20,
            }}
          />
        );
      default:
        return (
          <Chip
            label="Optional"
            size="small"
            sx={{
              backgroundColor: colors.surfaceSubtle,
              color: colors.inkSecondary,
              border: `1px solid ${colors.border}`,
              fontSize: '0.6875rem',
              height: 20,
            }}
          />
        );
    }
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Skill Gap Analyzer" subtitle="Evaluating technical competence against campus placement benchmarks..." />
        <Skeleton variant="rounded" height={240} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="rounded" height={360} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Skill Gap Analyzer"
        subtitle={`Diagnosing proficiency gaps for ${data.targetProfile}. Prioritized by campus recruiter shortlisting frequency.`}
        action={
          <Button
            component={RouterLink}
            to="/learning-roadmap"
            variant="contained"
            endIcon={<Milestone size={15} />}
            sx={{ fontSize: '0.8125rem' }}
          >
            Open 6-Week Roadmap
          </Button>
        }
      />

      {/* Row 1: Horizontal Category Benchmark Bars */}
      <Card sx={{ p: { xs: 2.5, sm: 3 }, mb: 3.5, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.1rem', color: colors.ink }}>
              Technical Domain Proficiency vs. Campus Recruiter Benchmark
            </Typography>
            <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
              Horizontal bar analysis comparing your verified skills against minimum thresholds for ₹6 - 8 LPA roles
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: 1, backgroundColor: colors.accent }} />
              <Typography variant="caption" sx={{ color: colors.inkSecondary }}>Your Score</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: 1, backgroundColor: colors.border }} />
              <Typography variant="caption" sx={{ color: colors.inkSecondary }}>Benchmark</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
          {data.categoryBars.map((bar, idx) => (
            <Box key={idx} sx={{ p: 2, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.84375rem', color: colors.ink }}>
                  {bar.category}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: colors.accent, fontVariantNumeric: 'tabular-nums' }}>
                    You: {bar.current}%
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary, fontVariantNumeric: 'tabular-nums' }}>
                    Recruiter target: {bar.required}%
                  </Typography>
                  {bar.gap > 0 ? (
                    <Chip
                      label={`Deficit: -${bar.gap}%`}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        backgroundColor: colors.errorBg,
                        color: colors.error,
                        border: `1px solid ${colors.errorBorder}`,
                      }}
                    />
                  ) : (
                    <Chip
                      label="Above threshold"
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        backgroundColor: colors.successBg,
                        color: colors.success,
                        border: `1px solid ${colors.successBorder}`,
                      }}
                    />
                  )}
                </Box>
              </Box>

              {/* Stacked comparison bar */}
              <Box sx={{ position: 'relative', width: '100%', height: 8, borderRadius: 4, backgroundColor: colors.borderLight, overflow: 'hidden' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${bar.current}%`,
                    backgroundColor: bar.gap > 0 ? (bar.gap > 20 ? colors.error : colors.warning) : colors.accent,
                    borderRadius: 4,
                    transition: 'width 300ms ease',
                  }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      </Card>

      {/* Row 2: Skills You Have vs Missing Skills by Category */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {data.skillsCategorized.map((cat, idx) => (
          <Card key={idx} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.1rem', color: colors.ink, mb: 2 }}>
              {cat.category}
            </Typography>

            <Grid container spacing={3}>
              {/* Left Column: Verified Skills You Have */}
              <Grid item xs={12} md={5}>
                <Box sx={{ p: 2, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}`, height: '100%' }}>
                  <Typography variant="caption" sx={{ color: colors.success, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', mb: 1.5 }}>
                    Verified on your resume
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {cat.have.map((item, hIdx) => (
                      <Box key={hIdx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, borderRadius: 1, backgroundColor: colors.surface, border: `1px solid ${colors.borderLight}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle2 size={15} color={colors.success} strokeWidth={2.2} />
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: colors.ink }}>
                            {item.name}
                          </Typography>
                        </Box>
                        <Chip
                          label={item.proficiency}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            fontWeight: 500,
                            backgroundColor: colors.surfaceSubtle,
                            color: colors.inkSecondary,
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>

              {/* Right Column: Missing Skills with Priority & Actionable Links */}
              <Grid item xs={12} md={7}>
                <Box sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${colors.borderLight}`, height: '100%' }}>
                  <Typography variant="caption" sx={{ color: colors.warning, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', mb: 1.5 }}>
                    Identified gaps to acquire
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {cat.missing.map((item, mIdx) => (
                      <Box
                        key={mIdx}
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          border: `1px solid ${item.priority === 'high' ? colors.errorBorder : colors.borderLight}`,
                          backgroundColor: item.priority === 'high' ? colors.errorBg : colors.surfaceSubtle,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AlertTriangle size={15} color={item.priority === 'high' ? colors.error : colors.warning} />
                            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.84375rem', color: colors.ink }}>
                              {item.name}
                            </Typography>
                          </Box>
                          {getPriorityBadge(item.priority)}
                        </Box>

                        <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', lineHeight: 1.5, mb: 1 }}>
                          {item.reason}
                        </Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.75, borderTop: `1px solid ${colors.borderLight}` }}>
                          <Typography variant="caption" sx={{ color: colors.ink, fontWeight: 500 }}>
                            Resource: {item.actionableResource}
                          </Typography>
                          <Button
                            component={RouterLink}
                            to="/learning-roadmap"
                            variant="text"
                            size="small"
                            endIcon={<ArrowRight size={12} />}
                            sx={{ p: 0, fontSize: '0.71875rem', color: colors.accent, fontWeight: 600 }}
                          >
                            Study in roadmap
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default SkillGapPage;
