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
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { ScoreRing } from '../../components/common/ScoreRing';
import { SkillChip } from '../../components/common/SkillChip';
import { colors } from '../../theme/theme';
import resumeService from '../../services/resumeService';
import mentorService from '../../services/mentorService';

export const ResumeIntelligencePage = () => {
  const [searchParams] = useSearchParams();
  const requestedResumeId = searchParams.get('resumeId');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'critical' | 'recommended' | 'optional'
  const [toast, setToast] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [mentorRequests, setMentorRequests] = useState({});
  const [requestingReview, setRequestingReview] = useState('');

  useEffect(() => {
    let isMounted = true;
    resumeService.getIntelligence(requestedResumeId).then((res) => {
      if (isMounted) {
        setData(res.data);
        setSuggestions(res.data?.rewriteSuggestions || []);
        setLoading(false);
      }
    }).catch((error) => {
      if (isMounted) {
        setLoadError(error.response?.data?.message || 'Could not load the resume review. Upload a readable PDF or DOCX and try again.');
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [requestedResumeId]);

  useEffect(() => {
    mentorService.getMyReviews().then(({ data: reviews }) => {
      const statuses = {};
      reviews.forEach((review) => { if (review.sourceSuggestionId && !statuses[review.sourceSuggestionId]) statuses[review.sourceSuggestionId] = review; });
      setMentorRequests(statuses);
    }).catch(() => {});
  }, []);

  const requestMentorReview = async (item) => {
    setRequestingReview(item.id);
    try {
      const { data: request } = await mentorService.requestReview({
        sourceSuggestionId: item.id,
        resumeId: data?.resumeId,
        title: item.section,
        section: item.section,
        before: item.before || 'No matching line was identified in the uploaded resume.',
        suggestion: item.after,
        rationale: item.rationale,
      });
      setMentorRequests((current) => ({ ...current, [item.id]: request }));
      setToast({ type: 'success', text: 'Your mentor feedback request was submitted.' });
    } catch (error) {
      setToast({ type: 'error', text: error.response?.data?.message || 'Could not submit the mentor feedback request.' });
    } finally { setRequestingReview(''); }
  };

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
        <PageHeader title="Resume Review" subtitle="AI is reviewing your complete extracted resume..." />
        <Skeleton variant="rounded" height={220} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="rounded" height={340} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (!data) {
    return <Box>
      <PageHeader title="Resume Review" subtitle="An evidence-based review of your extracted resume." />
      <Alert severity="info" action={<Button component={RouterLink} to="/resumes" color="inherit" size="small">Manage resumes</Button>}>
        {loadError || 'Upload a readable PDF or DOCX to see your review.'}
      </Alert>
    </Box>;
  }

  return (
    <Box>
      <PageHeader
        title="Resume Review"
        subtitle={`${data.analysisProvider !== 'Text analysis fallback' ? `${data.analysisProvider} reviewed` : 'Text review of'} "${data.fileName}" for ${data.targetRole || 'general resume quality'}. This is guidance, not an ATS score or hiring decision.`}
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

      {data.analysisSummary && <Alert severity="info" sx={{ mb: 3 }}>{data.analysisSummary} {data.analysisProvider !== 'Text analysis fallback' && `Analysis by ${data.analysisProvider} (${data.analysisModel}).`}</Alert>}

      {/* Resume quality estimate and its component signals */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        {/* Overall text signal */}
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
                {data.analysisProvider !== 'Text analysis fallback' ? 'AI Resume Review' : 'Resume Content Signal'}
              </Typography>
              <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
                <ScoreRing
                  score={data.overallScore}
                  max={100}
                  size={140}
                  strokeWidth={10}
                  label={data.analysisProvider !== 'Text analysis fallback' ? 'AI review' : 'Text review'}
                  tooltip={data.analysisProvider !== 'Text analysis fallback' ? `${data.analysisProvider} estimate based on resume evidence. It is not an ATS score or hiring decision.` : 'Text-based fallback estimate. It is not an ATS score.'}
                />
              </Box>
              <Typography variant="body2" sx={{ textAlign: 'center', color: colors.inkSecondary, fontSize: '0.8125rem', px: 1 }}>
                {data.analysisProvider !== 'Text analysis fallback' ? `An AI estimate from ${data.analysisProvider}, based on the complete extracted resume text.` : 'A rule-based estimate from the extracted resume text.'}
              </Typography>
            </Box>

            <Box sx={{ pt: 2, mt: 2, borderTop: `1px solid ${colors.borderLight}` }}>
              <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mb: 0.5 }}>
                Review scope:
              </Typography>
              <Typography variant="caption" sx={{ color: colors.ink, fontWeight: 500, lineHeight: 1.5, display: 'block' }}>
                {data.analysisProvider !== 'Text analysis fallback' ? `Target role: ${data.targetRole || 'Not selected'}. Resume mentions are evidence to inspect, not proof of proficiency.` : `The review found ${data.matchedKeywordsCount ?? 0} terms from a built-in vocabulary; this fallback is not role-specific.`}
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
          {data.extractedSkills.engineering?.length > 0 && (
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ p: 2, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}`, height: '100%' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: colors.inkSecondary, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', mb: 1.25 }}>
                  Engineering Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {data.extractedSkills.engineering.map((sk) => (
                    <SkillChip key={sk} name={sk} status="matched" />
                  ))}
                </Box>
              </Box>
            </Grid>
          )}
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
                      Suggested Edit (verify all claims)
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
                  {mentorRequests[item.id] ? (
                    <Box sx={{ textAlign: { xs: 'right', sm: 'left' } }}>
                      <Chip size="small" label={mentorRequests[item.id].status === 'pending' ? 'Mentor review pending' : mentorRequests[item.id].status === 'approved' ? 'Mentor approved' : 'Changes requested'} color={mentorRequests[item.id].status === 'approved' ? 'success' : 'default'} />
                      {mentorRequests[item.id].feedbackComment && <Typography variant="caption" sx={{ display: 'block', mt: 0.5, maxWidth: 260, color: colors.inkSecondary }}>{mentorRequests[item.id].feedbackComment}</Typography>}
                    </Box>
                  ) : (
                    <Button variant="outlined" size="small" disabled={requestingReview === item.id} onClick={() => requestMentorReview(item)} sx={{ fontSize: '0.75rem', py: 0.4 }}>
                      {requestingReview === item.id ? 'Sending…' : 'Ask mentor to review'}
                    </Button>
                  )}
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
