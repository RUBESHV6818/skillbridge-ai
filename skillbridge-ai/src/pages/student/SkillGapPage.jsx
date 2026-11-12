import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  TextField,
  Chip,
  Skeleton,
  LinearProgress,
  Tooltip,
  Alert,
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
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

function analysisErrorMessage(error) {
  if (error.code === 'ECONNABORTED') return 'The AI analysis is taking longer than expected. Please wait a moment, then try again.';
  if (!error.response) return 'Could not reach the backend at localhost:5001. Check that the backend is running.';
  if (error.response.data?.message) return error.response.data.message;
  return 'Could not load your AI role analysis. Please try again.';
}

export const SkillGapPage = () => {
  const { user, updateUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reanalyzing, setReanalyzing] = useState(false);
  const [targetRole, setTargetRole] = useState(user?.targetRole || '');

  useEffect(() => {
    let isMounted = true;
    skillGapService.getAnalysis().then((res) => {
      if (isMounted) {
        setData(res.data);
        setLoading(false);
      }
    }).catch((err) => {
      if (isMounted) {
        setError(err.response?.status === 404
          ? 'Upload a resume first to analyze it for your target role.'
          : analysisErrorMessage(err));
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const rerunAnalysis = async () => {
    setReanalyzing(true);
    try {
      const response = await skillGapService.getAnalysis(true);
      setData(response.data);
      setError('');
    } catch (err) {
      setError(analysisErrorMessage(err));
    } finally {
      setReanalyzing(false);
    }
  };

  const saveRoleAndAnalyze = async (event) => {
    event.preventDefault();
    const role = targetRole.trim();
    if (!role) return;
    setReanalyzing(true);
    setError('');
    try {
      const { data: profile } = await authService.getProfile();
      const { data: savedProfile } = await authService.updateProfile({
        ...profile,
        targetRole: role,
        targetRoleConfirmed: true,
        batchYear: profile.batchYear ?? null,
        cgpa: profile.cgpa ?? null,
      });
      updateUser(savedProfile);
      setTargetRole(savedProfile.targetRole);
      const response = await skillGapService.getAnalysis(true);
      setData(response.data);
    } catch (err) {
      setError(analysisErrorMessage(err));
    } finally {
      setReanalyzing(false);
    }
  };

  const renderRoleForm = () => (
    <Card component="form" onSubmit={saveRoleAndAnalyze} sx={{ p: { xs: 2.5, sm: 3 }, mb: 3, borderRadius: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.05rem', color: colors.ink, mb: 0.75 }}>
        Analyze your resume for a role
      </Typography>
      <Typography variant="body2" sx={{ color: colors.inkSecondary, mb: 2 }}>
        Enter any role title. AI will build a relevant skill profile from the role and compare it with your uploaded resume.
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField
          fullWidth
          size="small"
          label="Target role"
          placeholder="e.g. Machine Learning Engineer"
          value={targetRole}
          onChange={(event) => setTargetRole(event.target.value)}
          inputProps={{ maxLength: 120 }}
          required
        />
        <Button type="submit" variant="contained" disabled={reanalyzing || !targetRole.trim()} startIcon={<Sparkles size={15} />} sx={{ whiteSpace: 'nowrap' }}>
          {reanalyzing ? 'Analyzing...' : 'Analyze with AI'}
        </Button>
      </Box>
    </Card>
  );

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return (
          <Chip
            label="Target Role Focus"
            size="small"
            sx={{
              backgroundColor: colors.accentLight,
              color: colors.accent,
              border: `1px solid ${colors.accentBorder}`,
              fontWeight: 700,
              fontSize: '0.6875rem',
              height: 20,
            }}
          />
        );
      case 'medium':
        return (
          <Chip
            label="Supporting Skill"
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
            label="Lower Role Focus"
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
        <PageHeader title="Skill Gap Analyzer" subtitle="AI is reviewing your extracted resume against your selected role..." />
        <Skeleton variant="rounded" height={240} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="rounded" height={360} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (error) {
    const canRetryAI = /temporarily overloaded|taking longer than expected|timed out/i.test(error);
    return (
      <Box>
        <PageHeader title="Skill Gap Analyzer" subtitle="AI analysis of your resume against your selected target role." />
        <Alert
          severity={error.includes('API_KEY') ? 'warning' : 'info'}
          action={error.includes('API_KEY') ? null : canRetryAI ? (
            <Button onClick={rerunAnalysis} disabled={reanalyzing} color="inherit" size="small">
              {reanalyzing ? 'Retrying...' : 'Retry with AI'}
            </Button>
          ) : (
            <Button component={RouterLink} to="/resumes" color="inherit" size="small">Manage resumes</Button>
          )}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // A retry can temporarily have no report data. Keep the page recoverable
  // instead of reading `analysisAvailable` from null and crashing the app.
  if (!data) {
    return (
      <Box>
        <PageHeader title="Skill Gap Analyzer" subtitle="AI analysis of your resume against your selected target role." />
        <Alert severity={reanalyzing ? 'info' : 'warning'}>
          {reanalyzing ? 'AI is analyzing your resume. This may take a moment.' : 'No analysis data is available yet. Retry the AI analysis.'}
        </Alert>
        {!reanalyzing && (
          <Button onClick={rerunAnalysis} variant="outlined" startIcon={<Sparkles size={15} />} sx={{ mt: 2 }}>
            Retry with AI
          </Button>
        )}
      </Box>
    );
  }

  if (!data.analysisAvailable) {
    return (
      <Box>
        <PageHeader
          title="Skill Gap Analyzer"
          subtitle="Enter your role here to run an AI analysis against your uploaded resume."
        />
        {renderRoleForm()}
        <Alert severity="info">{data.message}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Skill Gap Analyzer"
        subtitle={`${data.analysisProvider} reviewed the extracted resume text for ${data.targetProfile}. A resume mention is evidence to inspect, not proof of proficiency.`}
        action={(
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button onClick={rerunAnalysis} disabled={reanalyzing} variant="outlined" startIcon={<Sparkles size={15} />} sx={{ fontSize: '0.8125rem' }}>
              {reanalyzing ? 'Analyzing...' : 'Reanalyze with AI'}
            </Button>
            <Button component={RouterLink} to="/learning-roadmap" variant="contained" endIcon={<Milestone size={15} />} sx={{ fontSize: '0.8125rem' }}>
              Open 6-Week Roadmap
            </Button>
          </Box>
        )}
      />

      {renderRoleForm()}

      <Alert severity="info" icon={<Sparkles size={18} />} sx={{ mb: 3, borderRadius: 1.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
          {data.scoreLabel}: {data.resumeSkillCoverage}/100
        </Typography>
        <Typography variant="body2">{data.summary}</Typography>
        {data.scoreExplanation && <Typography variant="caption" sx={{ display: 'block', mt: 0.75 }}>{data.scoreExplanation}</Typography>}
        <Typography variant="caption" sx={{ display: 'block', mt: 0.75, opacity: 0.85 }}>
          Powered by {data.analysisProvider} ({data.analysisModel}){data.cached ? ' · saved analysis' : ' · newly analyzed'} · {data.limitations}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.85 }}>
          The extracted resume text is sent to {data.analysisProvider} to produce this report.
        </Typography>
      </Alert>

      {data.strengths?.length > 0 && (
        <Card sx={{ p: { xs: 2.5, sm: 3 }, mb: 3, borderRadius: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.05rem', color: colors.ink, mb: 1.5 }}>Role-relevant strengths found</Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5, color: colors.inkSecondary }}>
            {data.strengths.map((strength, index) => <li key={index}><Typography variant="body2">{strength}</Typography></li>)}
          </Box>
        </Card>
      )}

      {/* AI-assessed role alignment by skill category */}
      <Card sx={{ p: { xs: 2.5, sm: 3 }, mb: 3.5, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.1rem', color: colors.ink }}>
              AI Role Alignment by Category
            </Typography>
            <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
              {data.analysisProvider} builds skill categories for your selected role and compares them with evidence in your extracted resume.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: 1, backgroundColor: colors.accent }} />
              <Typography variant="caption" sx={{ color: colors.inkSecondary }}>Evidence matched</Typography>
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
                    {bar.detectedCount} of {bar.totalSkills} areas evidenced ({bar.current}%)
                  </Typography>
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
                    backgroundColor: colors.accent,
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
              {/* Left Column: Terms detected in resume text */}
              <Grid item xs={12} md={5}>
                <Box sx={{ p: 2, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}`, height: '100%' }}>
                  <Typography variant="caption" sx={{ color: colors.success, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', mb: 1.5 }}>
                    Evidence found in resume
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {cat.have.map((item, hIdx) => (
                      <React.Fragment key={hIdx}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, borderRadius: 1, backgroundColor: colors.surface, border: `1px solid ${colors.borderLight}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CheckCircle2 size={15} color={colors.success} strokeWidth={2.2} />
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: colors.ink }}>
                            {item.name}
                          </Typography>
                        </Box>
                        <Chip
                            label="Mentioned"
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
                      {item.evidence && (
                        <Typography variant="caption" sx={{ display: 'block', ml: 3.25, mt: -0.5, mb: 0.5, color: colors.inkSecondary }}>
                          “{item.evidence}”
                        </Typography>
                      )}
                      </React.Fragment>
                    ))}
                  </Box>
                </Box>
              </Grid>

              {/* Right Column: Missing Skills with Priority & Actionable Links */}
              <Grid item xs={12} md={7}>
                <Box sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${colors.borderLight}`, height: '100%' }}>
                  <Typography variant="caption" sx={{ color: colors.warning, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', mb: 1.5 }}>
                    Relevant role skills not evidenced in resume
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {cat.missing.map((item, mIdx) => (
                      <Box
                        key={mIdx}
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          border: `1px solid ${item.priority === 'high' ? colors.accentBorder : colors.borderLight}`,
                          backgroundColor: item.priority === 'high' ? colors.accentLight : colors.surfaceSubtle,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AlertTriangle size={15} color={item.priority === 'high' ? colors.accent : item.priority === 'medium' ? colors.warning : colors.inkTertiary} />
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
                            Suggested next step: {item.actionableResource}
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
