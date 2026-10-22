import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  TextField,
  Button,
  MenuItem,
  Chip,
  Skeleton,
  Alert,
  Divider,
} from '@mui/material';
import {
  FileSearch,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Briefcase,
  ArrowRight,
  ExternalLink,
  Milestone,
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { ScoreRing } from '../../components/common/ScoreRing';
import { colors } from '../../theme/theme';
import jdService, { SAMPLE_JDS } from '../../services/jdService';
import resumeService from '../../services/resumeService';

export const JDMatcherPage = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jdInput, setJdInput] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let isMounted = true;
    resumeService.getResumes().then((res) => {
      if (isMounted) {
        setResumes(res.data);
        const primary = res.data.find((r) => r.isPrimary) || res.data[0];
        if (primary) setSelectedResumeId(primary.id);
        // Pre-fill with Freshworks sample JD
        setJdInput(SAMPLE_JDS[0].rawText);
        setMatchResult(SAMPLE_JDS[0]);
        setInitialLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectSample = (sample) => {
    setJdInput(sample.rawText);
    handleAnalyze(sample.rawText);
  };

  const handleAnalyze = async (textToAnalyze = jdInput) => {
    if (!textToAnalyze.trim()) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await jdService.matchJD(textToAnalyze, selectedResumeId);
      setMatchResult(res.data);
      setFeedback({
        type: 'success',
        text: `Matched against ${res.data.company} — ${res.data.role}. Overall fit score: ${res.data.matchPercentage}%.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: 'Failed to process job description. Please ensure the text contains standard technical requirements.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box>
        <PageHeader title="Job Description Intelligence" subtitle="Loading campus job descriptions and resume profiles..." />
        <Skeleton variant="rounded" height={200} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="rounded" height={360} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Job Description (JD) Intelligence"
        subtitle="Benchmark your resume against actual campus recruitment postings to identify must-have requirements before applying."
      />

      {feedback && (
        <Alert
          severity={feedback.type}
          onClose={() => setFeedback(null)}
          sx={{ mb: 3, borderRadius: 1.5, fontSize: '0.84375rem' }}
        >
          {feedback.text}
        </Alert>
      )}

      {/* Input Form & Quick Samples */}
      <Card sx={{ p: { xs: 2.5, sm: 3 }, mb: 3.5, borderRadius: 2 }}>
        <Grid container spacing={2.5}>
          {/* Resume Selector */}
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, fontSize: '0.8125rem' }}>
              Select Resume for Matching
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
            >
              {resumes.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.fileName} {r.isPrimary ? '(Primary Drive Resume)' : ''}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Quick Pre-fill Samples */}
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, fontSize: '0.8125rem' }}>
              Load Verified Campus Posting
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {SAMPLE_JDS.map((sample) => (
                <Button
                  key={sample.id}
                  variant="outlined"
                  size="small"
                  onClick={() => handleSelectSample(sample)}
                  sx={{
                    fontSize: '0.75rem',
                    py: 0.6,
                    px: 1.25,
                    borderColor: matchResult?.id === sample.id ? colors.accent : colors.border,
                    backgroundColor: matchResult?.id === sample.id ? colors.accentLight : 'transparent',
                    color: matchResult?.id === sample.id ? colors.accent : colors.ink,
                  }}
                >
                  {sample.company}
                </Button>
              ))}
            </Box>
          </Grid>

          {/* JD Input Textarea */}
          <Grid item xs={12}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, fontSize: '0.8125rem' }}>
              Paste Job Description or Recruitment Notice
            </Typography>
            <TextField
              multiline
              rows={4}
              fullWidth
              placeholder="Paste company job requirements, technical stack, eligibility criteria, or drive circular..."
              value={jdInput}
              onChange={(e) => setJdInput(e.target.value)}
            />
          </Grid>

          {/* Submit */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button
              variant="contained"
              onClick={() => handleAnalyze()}
              disabled={loading || !jdInput.trim()}
              startIcon={<Sparkles size={15} />}
              sx={{ px: 3, py: 0.9, fontSize: '0.84375rem' }}
            >
              {loading ? 'Parsing Requirements & Keywords...' : 'Analyze JD Match'}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Analysis Output Results */}
      {matchResult && (
        <Grid container spacing={3}>
          {/* Left Column: Match Score & Drive Summary */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                    Target Drive
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.25rem', color: colors.ink, mt: 0.25 }}>
                    {matchResult.company}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                    {matchResult.role}
                  </Typography>
                </Box>
                <Chip
                  label={matchResult.packageRange}
                  size="small"
                  sx={{
                    backgroundColor: colors.successBg,
                    color: colors.success,
                    border: `1px solid ${colors.successBorder}`,
                    fontWeight: 700,
                    fontSize: '0.71875rem',
                  }}
                />
              </Box>

              <Box sx={{ my: 2.5, display: 'flex', justifyContent: 'center' }}>
                <ScoreRing
                  score={matchResult.matchPercentage}
                  max={100}
                  size={135}
                  strokeWidth={10}
                  label="JD Match Fit"
                  tooltip="Calculated by matching parsed hard technical skills, tools, and project evidence against mandatory JD qualifications."
                />
              </Box>

              <Box sx={{ p: 2, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}`, mb: 2.5 }}>
                <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mb: 0.5, fontWeight: 600 }}>
                  Eligibility & Dates:
                </Typography>
                <Typography variant="caption" sx={{ color: colors.ink, display: 'block', mb: 0.5 }}>
                  <strong>CGPA Cutoff:</strong> {matchResult.eligibilityCgpa}
                </Typography>
                <Typography variant="caption" sx={{ color: colors.ink, display: 'block' }}>
                  <strong>Drive Date:</strong> {matchResult.driveDate}
                </Typography>
              </Box>

              <Button
                component={RouterLink}
                to="/learning-roadmap"
                variant="outlined"
                fullWidth
                startIcon={<Milestone size={15} />}
                sx={{ fontSize: '0.78125rem', py: 0.8 }}
              >
                Add Missing Skills to Roadmap
              </Button>
            </Card>
          </Grid>

          {/* Right Column: Must-Have vs Good-To-Have Requirements */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 2 }}>
              {/* Must-Have Section */}
              <Box sx={{ mb: 3.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.05rem', color: colors.ink }}>
                    Must-Have Requirements (Screening Filters)
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                    Missing any of these risks automated resume rejection
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {matchResult.requirements.mustHave.map((item, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        border: `1px solid ${item.matched ? colors.borderLight : colors.errorBorder}`,
                        backgroundColor: item.matched ? colors.surface : colors.errorBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        {item.matched ? (
                          <CheckCircle2 size={16} color={colors.success} strokeWidth={2.2} />
                        ) : (
                          <AlertCircle size={16} color={colors.error} strokeWidth={2.2} />
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.84375rem',
                            color: item.matched ? colors.ink : colors.error,
                          }}
                        >
                          {item.skill}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: colors.inkSecondary, fontSize: '0.75rem' }}>
                        {item.context}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 2.5 }} />

              {/* Good-To-Have Section */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.05rem', color: colors.ink }}>
                    Good-To-Have / Differentiator Skills
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                    Gives a competitive advantage during technical interviews
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {matchResult.requirements.goodToHave.map((item, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        border: `1px solid ${colors.borderLight}`,
                        backgroundColor: item.matched ? colors.surfaceSubtle : colors.surface,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        {item.matched ? (
                          <CheckCircle2 size={16} color={colors.accent} strokeWidth={2} />
                        ) : (
                          <Box sx={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${colors.inkTertiary}` }} />
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            fontSize: '0.84375rem',
                            color: colors.ink,
                          }}
                        >
                          {item.skill}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: colors.inkSecondary, fontSize: '0.75rem' }}>
                        {item.context}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default JDMatcherPage;
