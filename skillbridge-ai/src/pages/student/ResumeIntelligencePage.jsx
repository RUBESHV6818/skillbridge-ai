import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  Chip,
  Skeleton,
  Alert,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  FileText,
  RotateCcw,
  Check,
  X,
  FileSearch,
  ExternalLink,
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { ScoreRing } from '../../components/common/ScoreRing';
import { SkillChip } from '../../components/common/SkillChip';
import { colors } from '../../theme/theme';
import resumeService from '../../services/resumeService';

export const ResumeIntelligencePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'critical' | 'recommended' | 'optional'
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let isMounted = true;
    resumeService.getIntelligence().then((res) => {
      if (isMounted) {
        setData(res.data);
        setSuggestions(res.data.rewriteSuggestions);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSuggestionAction = (suggestionId, action) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, status: action } : s))
    );
    const item = suggestions.find((s) => s.id === suggestionId);
    if (action === 'accepted') {
      setToast({
        type: 'success',
        text: `Bullet rewrite accepted for "${item.section}". Added to your revision clipboard.`,
      });
    } else {
      setToast({
        type: 'info',
        text: `Suggestion dismissed.`,
      });
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'critical':
        return (
          <Chip
            label="Critical Fix"
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
      case 'recommended':
        return (
          <Chip
            label="Recommended"
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
            label="Style / Polish"
            size="small"
            sx={{
              backgroundColor: colors.surfaceSubtle,
              color: colors.inkSecondary,
              border: `1px solid ${colors.border}`,
              fontWeight: 500,
              fontSize: '0.6875rem',
              height: 20,
            }}
          />
        );
    }
  };

  const filteredSuggestions = suggestions.filter((s) => {
    if (activeTab === 'all') return true;
    return s.severity === activeTab;
  });

  if (loading) {
    return (
      <Box>
        <PageHeader title="AI Resume Intelligence" subtitle="Analyzing ATS readability and extracting skill vectors..." />
        <Skeleton variant="rounded" height={220} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="rounded" height={340} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="AI Resume Intelligence"
        subtitle={`Detailed ATS parse of "${data.fileName}". Benchmarked against tier-1 campus recruiter parsers.`}
        action={
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              component={RouterLink}
              to="/jd-matcher"
              variant="outlined"
              startIcon={<FileSearch size={15} />}
              sx={{ fontSize: '0.8125rem' }}
            >
              Match with Target JD
            </Button>
            <Button
              component={RouterLink}
              to="/skill-gap"
              variant="contained"
              endIcon={<ArrowRight size={15} />}
              sx={{ fontSize: '0.8125rem' }}
            >
              Skill Gap Analyzer
            </Button>
          </Box>
        }
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

      {/* Row 1: Overall ATS Score & 4 Pillar Breakdowns */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        {/* Main ATS Ring */}
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
              <Typography variant="caption" sx={{ fontWeight: 600, color: colors.inkSecondary, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                ATS Compliance Score
              </Typography>
              <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
                <ScoreRing
                  score={data.overallScore}
                  max={100}
                  size={140}
                  strokeWidth={10}
                  label="ATS Match"
                  tooltip="Calculated across syntax, heading structure, and keyword overlap against 40+ engineering JDs."
                />
              </Box>
              <Typography variant="body2" sx={{ textAlign: 'center', color: colors.inkSecondary, fontSize: '0.8125rem', px: 1 }}>
                Beats <strong>{data.percentile}%</strong> of campus resumes parsed this placement cycle.
              </Typography>
            </Box>

            <Box sx={{ pt: 2, mt: 2, borderTop: `1px solid ${colors.borderLight}` }}>
              <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mb: 0.5 }}>
                Primary Observation:
              </Typography>
              <Typography variant="caption" sx={{ color: colors.ink, fontWeight: 500, lineHeight: 1.5, display: 'block' }}>
                Your resume mentions React and Node.js, but lacks automated testing (Jest) and CI/CD tools. Most campus JDs above ₹6 LPA penalize missing unit test proof.
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* 4 Diagnostic Pillars */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            {data.breakdown.map((item) => (
              <Grid item xs={12} sm={6} key={item.id}>
                <Card
                  sx={{
                    p: 2.5,
                    height: '100%',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.84375rem', color: colors.ink }}>
                        {item.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: item.score >= 75 ? colors.success : colors.warning,
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {item.score}%
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: colors.inkSecondary, lineHeight: 1.55, display: 'block' }}>
                      {item.description}
                    </Typography>
                  </Box>

                  <Box sx={{ width: '100%', height: 4, borderRadius: 2, backgroundColor: colors.borderLight, mt: 2 }}>
                    <Box
                      sx={{
                        width: `${item.score}%`,
                        height: '100%',
                        borderRadius: 2,
                        backgroundColor: item.score >= 75 ? colors.success : colors.warning,
                      }}
                    />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* Row 2: Extracted Skills Grouped by Category */}
      <Card sx={{ p: { xs: 2.5, sm: 3 }, mb: 3.5, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.1rem', color: colors.ink }}>
              Extracted Skill Entities
            </Typography>
            <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
              Hard technical skills recognized and indexed from your resume text
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/skill-gap"
            size="small"
            variant="outlined"
            endIcon={<ArrowRight size={13} />}
            sx={{ fontSize: '0.75rem' }}
          >
            Compare with Missing
          </Button>
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 2, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}`, height: '100%' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: colors.inkSecondary, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', mb: 1.25 }}>
                Frontend & UI
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {data.extractedSkills.frontend.map((sk) => (
                  <SkillChip key={sk} name={sk} status="matched" />
                ))}
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 2, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}`, height: '100%' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: colors.inkSecondary, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', mb: 1.25 }}>
                Backend & APIs
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {data.extractedSkills.backend.map((sk) => (
                  <SkillChip key={sk} name={sk} status="matched" />
                ))}
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 2, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}`, height: '100%' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: colors.inkSecondary, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', mb: 1.25 }}>
                Databases & ORM
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {data.extractedSkills.database.map((sk) => (
                  <SkillChip key={sk} name={sk} status="matched" />
                ))}
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 2, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}`, height: '100%' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: colors.inkSecondary, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', mb: 1.25 }}>
                Tools & Runtime
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {data.extractedSkills.tools.map((sk) => (
                  <SkillChip key={sk} name={sk} status="matched" />
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Row 3: Interactive Rewrite Suggestions (Before / After with Accept / Dismiss) */}
      <Card sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2.5, gap: 1.5 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.15rem', color: colors.ink }}>
              AI Bullet Point Rewrite Suggestions
            </Typography>
            <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
              Replaces weak task descriptions with active verbs, metrics, and recruiter-aligned keywords.
            </Typography>
          </Box>

          {/* Filter Pills */}
          <Box sx={{ display: 'flex', gap: 0.75 }}>
            {[
              { id: 'all', label: 'All (4)' },
              { id: 'critical', label: 'Critical' },
              { id: 'recommended', label: 'Recommended' },
              { id: 'optional', label: 'Optional' },
            ].map((tab) => (
              <Box
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                sx={{
                  cursor: 'pointer',
                  px: 1.25,
                  py: 0.4,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  backgroundColor: activeTab === tab.id ? colors.accentLight : colors.surfaceSubtle,
                  color: activeTab === tab.id ? colors.accent : colors.inkSecondary,
                  border: `1px solid ${activeTab === tab.id ? colors.accentBorder : colors.borderLight}`,
                  transition: 'all 120ms ease',
                }}
              >
                {tab.label}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Suggestion Cards */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {filteredSuggestions.map((item) => (
            <Box
              key={item.id}
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: `1px solid ${
                  item.status === 'accepted'
                    ? colors.successBorder
                    : item.status === 'dismissed'
                    ? colors.borderLight
                    : colors.border
                }`,
                backgroundColor: item.status === 'dismissed' ? colors.surfaceSubtle : colors.surface,
                opacity: item.status === 'dismissed' ? 0.65 : 1,
                transition: 'all 140ms ease',
              }}
            >
              {/* Card Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.75 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.84375rem', color: colors.ink }}>
                    {item.section}
                  </Typography>
                  {getSeverityBadge(item.severity)}
                </Box>

                {item.status !== 'pending' && (
                  <Chip
                    icon={item.status === 'accepted' ? <Check size={12} /> : <X size={12} />}
                    label={item.status === 'accepted' ? 'Accepted' : 'Dismissed'}
                    size="small"
                    sx={{
                      backgroundColor: item.status === 'accepted' ? colors.successBg : colors.surfaceSubtle,
                      color: item.status === 'accepted' ? colors.success : colors.inkSecondary,
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>

              {/* Before / After Comparison Grid */}
              <Grid container spacing={2} sx={{ mb: 1.5 }}>
                {/* Before */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 1.75,
                      borderRadius: 1.5,
                      backgroundColor: colors.errorBg,
                      border: `1px solid ${colors.errorBorder}`,
                      height: '100%',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: colors.error, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', mb: 0.75 }}>
                      Current phrasing (Weak impact)
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.ink, fontSize: '0.84375rem', lineHeight: 1.55 }}>
                      "{item.before}"
                    </Typography>
                  </Box>
                </Grid>

                {/* After */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      p: 1.75,
                      borderRadius: 1.5,
                      backgroundColor: colors.successBg,
                      border: `1px solid ${colors.successBorder}`,
                      height: '100%',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: colors.success, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', mb: 0.75 }}>
                      Suggested ATS Rewrite (Action + Metrics)
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.ink, fontWeight: 600, fontSize: '0.84375rem', lineHeight: 1.55 }}>
                      "{item.after}"
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Rationale & Actions */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, gap: 1.5, pt: 1 }}>
                <Typography variant="caption" sx={{ color: colors.inkSecondary, maxWidth: 620, lineHeight: 1.5 }}>
                  <strong>Diagnostic Rationale:</strong> {item.rationale}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                  {item.status === 'pending' ? (
                    <>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleSuggestionAction(item.id, 'dismissed')}
                        sx={{ fontSize: '0.75rem', py: 0.4, color: colors.inkSecondary }}
                      >
                        Dismiss
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Check size={14} />}
                        onClick={() => handleSuggestionAction(item.id, 'accepted')}
                        sx={{ fontSize: '0.75rem', py: 0.4 }}
                      >
                        Accept Revision
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<RotateCcw size={13} />}
                      onClick={() => handleSuggestionAction(item.id, 'pending')}
                      sx={{ fontSize: '0.75rem', color: colors.inkSecondary }}
                    >
                      Undo choice
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
};

export default ResumeIntelligencePage;
