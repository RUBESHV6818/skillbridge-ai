import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Divider,
  Chip,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  FileCheck,
  Download,
  GraduationCap,
  CheckCircle2,
  Building2,
  Calendar,
  Sparkles,
  Printer,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { ScoreRing } from '../../components/common/ScoreRing';
import { colors } from '../../theme/theme';
import reportService from '../../services/reportService';

export const CareerReportPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState('');
  const [downloadError, setDownloadError] = useState('');

  // Section picker state
  const [sections, setSections] = useState({
    summary: true,
    scores: true,
    skills: true,
    pipeline: true,
    interviews: true,
  });

  const fetchReport = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await reportService.getReportData(sections);
      setReport(res.data);
    } catch {
      setLoadError('Could not compile the report from your account data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleToggleSection = (sec) => {
    setSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const handleDownload = () => {
    setDownloading(true);
    setDownloadError('');
    try {
      const result = reportService.downloadReport(report, sections);
      setDownloadSuccess(result.fileName);
      setTimeout(() => setDownloadSuccess(''), 5000);
    } catch {
      setDownloadError('Could not prepare the report file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Career Readiness Report" subtitle="Compiling placement audit documentation..." />
        <Skeleton variant="rounded" height={480} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (loadError || !report) {
    return (
      <Box>
        <PageHeader title="Career Readiness Report" subtitle="Compile a report from your saved profile and placement data." />
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchReport}>Try again</Button>}>
          {loadError || 'No report data is available.'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Career Readiness Report Generator"
        subtitle="Review a snapshot of your profile, resume signals, and placement applications currently on file."
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshCw size={16} />}
              onClick={fetchReport}
              disabled={loading}
              sx={{ fontSize: '0.8125rem' }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Download size={16} />}
              onClick={handleDownload}
              disabled={downloading}
              sx={{ fontSize: '0.8125rem' }}
            >
              {downloading ? 'Preparing report...' : 'Download Report'}
            </Button>
          </Box>
        }
      />

      <style>{`@media print {
        @page { margin: 16mm; }
        body * { visibility: hidden !important; }
        .career-report-document, .career-report-document * { visibility: visible !important; }
        .career-report-document { position: fixed !important; inset: 0 auto auto 0 !important; width: 100% !important; min-height: 0 !important; padding: 0 !important; border: 0 !important; box-shadow: none !important; z-index: 99999 !important; }
      }`}</style>

      {downloadSuccess && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 1.5, fontSize: '0.84375rem' }}>
          Downloaded <strong>{downloadSuccess}</strong>. Open it in a browser to print or save as PDF.
        </Alert>
      )}
      {downloadError && <Alert severity="error" sx={{ mb: 3 }}>{downloadError}</Alert>}

      <Grid container spacing={3.5}>
        {/* Left Column: Section Picker Controls */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 80 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.05rem', color: colors.ink, mb: 1 }}>
              Configure Report Sections
            </Typography>
            <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mb: 2 }}>
              Choose which modules to include in your exported placement summary.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { id: 'summary', label: 'Student Profile & CGPA' },
                { id: 'scores', label: 'Composite Health & AI Scores' },
                { id: 'skills', label: 'Verified Technical Skills & Gaps' },
                { id: 'pipeline', label: 'Placement Offers & Active Funnel' },
                { id: 'interviews', label: 'Mock Interview Activity & Score' },
              ].map((item) => (
                <FormControlLabel
                  key={item.id}
                  control={
                    <Checkbox
                      checked={sections[item.id]}
                      onChange={() => handleToggleSection(item.id)}
                      size="small"
                      sx={{ color: colors.border, '&.Mui-checked': { color: colors.accent } }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: colors.ink }}>
                      {item.label}
                    </Typography>
                  }
                />
              ))}
            </Box>

            <Divider sx={{ my: 2.5 }} />

            <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', lineHeight: 1.5, mb: 2 }}>
              Personal planning report based on saved account data. Scores are estimates; resume mentions are evidence to review, not proof of proficiency or placement eligibility.
            </Typography>

            <Button
              variant="outlined"
              fullWidth
              startIcon={<Printer size={15} />}
              onClick={() => window.print()}
              sx={{ fontSize: '0.78125rem' }}
            >
              Print Preview
            </Button>
          </Card>
        </Grid>

        {/* Right Column: Live Editorial Document Preview */}
        <Grid item xs={12} md={8}>
          <Card
            className="career-report-document"
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 2,
              backgroundColor: colors.surface,
              boxShadow: '0 4px 20px rgba(23, 22, 28, 0.05)',
              border: `1px solid ${colors.border}`,
              minHeight: 700,
            }}
          >
            {/* Document Header */}
            <Box sx={{ pb: 3, borderBottom: `2px solid ${colors.ink}`, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography
                    variant="h2"
                    sx={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontWeight: 700,
                      fontSize: '1.45rem',
                      letterSpacing: '-0.02em',
                      color: colors.ink,
                    }}
                  >
                    Placement Readiness & Skill Audit
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mt: 0.5 }}>
                    SkillBridge • {report.institution}{report.placementSeasonYear ? ` · ${report.placementSeasonYear}` : ''}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: colors.ink, display: 'block' }}>
                    Report Ref: {report.reportId}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.inkTertiary, fontSize: '0.6875rem' }}>
                    Generated: {report.generatedAt}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* 1. Student Academic Details */}
            {sections.summary && (
              <Box sx={{ mb: 3.5 }}>
                <Typography variant="caption" sx={{ color: colors.accent, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', mb: 1 }}>
                  1. Candidate Academic Profile
                </Typography>
                <Grid container spacing={2} sx={{ p: 2, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}` }}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ color: colors.inkSecondary }}>Candidate Name</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{report.student.name}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ color: colors.inkSecondary }}>Roll Number</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{report.student.rollNo}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ color: colors.inkSecondary }}>Cumulative CGPA</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: report.student.cgpa === 'Not provided' ? colors.inkSecondary : colors.success }}>{report.student.cgpa}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ color: colors.inkSecondary }}>Graduation Batch</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{report.student.batch}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" sx={{ color: colors.inkSecondary }}>Target Role</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{report.student.targetRole}</Typography>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* 2. Placement Health Diagnostic Scores */}
            {sections.scores && (
              <Box sx={{ mb: 3.5 }}>
                <Typography variant="caption" sx={{ color: colors.accent, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', mb: 1 }}>
                  2. Diagnostic Placement Health Index
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, textAlign: 'center', borderRadius: 1.5, border: `1px solid ${colors.borderLight}` }}>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: colors.accent, fontVariantNumeric: 'tabular-nums' }}>
                        {report.readinessSummary.compositeScore === null ? '—' : `${report.readinessSummary.compositeScore}/100`}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mt: 0.5 }}>
                        Career Health Composite
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, textAlign: 'center', borderRadius: 1.5, border: `1px solid ${colors.borderLight}` }}>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: colors.success, fontVariantNumeric: 'tabular-nums' }}>
                        {report.scores.resumeReviewScore == null ? '—' : `${report.scores.resumeReviewScore}/100`}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mt: 0.5 }}>
                        AI Resume Review
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, textAlign: 'center', borderRadius: 1.5, border: `1px solid ${colors.borderLight}` }}>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: colors.warning, fontVariantNumeric: 'tabular-nums' }}>
                        {report.scores.interviewScore === null ? '—' : `${report.scores.interviewScore}/100`}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mt: 0.5 }}>
                        Mock Interview Fluency
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ p: 2, textAlign: 'center', borderRadius: 1.5, border: `1px solid ${colors.borderLight}` }}>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: colors.accent, fontVariantNumeric: 'tabular-nums' }}>
                        {report.scores.skillMatchScore == null ? '—' : `${report.scores.skillMatchScore}/100`}
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mt: 0.5 }}>
                        AI Role Alignment
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mt: 1, px: 0.5 }}>
                  Composite uses the placement cell’s configured weights for saved resume review, role-gap, and mock interview scores. Unavailable scores are excluded. {report.readinessSummary.qualificationStatus}
                </Typography>
                <Typography variant="caption" sx={{ color: colors.inkTertiary, display: 'block', mt: 0.5, px: 0.5 }}>
                  AI sources: {[
                    report.analysisSources?.resumeReview && `Resume review: ${report.analysisSources.resumeReview}`,
                    report.analysisSources?.skillGap && `Role analysis: ${report.analysisSources.skillGap}`,
                    report.analysisSources?.interview && `Interview: ${report.analysisSources.interview}`,
                  ].filter(Boolean).join(' · ') || 'No saved AI analysis source is available.'}
                </Typography>
              </Box>
            )}

            {/* 3. Saved AI role findings and resume evidence */}
            {sections.skills && (
              <Box sx={{ mb: 3.5 }}>
                <Typography variant="caption" sx={{ color: colors.accent, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', mb: 1 }}>
                  3. Resume Evidence & Role Gaps
                </Typography>
                <Typography variant="body2" sx={{ color: colors.inkSecondary, mb: 1.5 }}>
                  {report.careerSummary}
                </Typography>
                <Box sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${colors.borderLight}`, mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: colors.success, display: 'block', mb: 1 }}>
                    Skills mentioned in the saved role analysis:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {report.detectedSkills.map((sk, idx) => (
                      <Chip key={idx} label={sk} size="small" sx={{ backgroundColor: colors.surfaceSubtle, fontSize: '0.71875rem' }} />
                    ))}
                    {report.detectedSkills.length === 0 && <Typography variant="body2">No skills are available from a saved role analysis yet. Run Skill Gap Analyzer for this target role.</Typography>}
                  </Box>
                </Box>
                <Box sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${colors.borderLight}` }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: colors.warning, display: 'block', mb: 1 }}>
                    Target skills not evidenced in the saved AI analysis:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {report.identifiedGaps.map((gap, idx) => (
                      <Chip key={idx} label={gap} size="small" variant="outlined" sx={{ fontSize: '0.71875rem' }} />
                    ))}
                    {report.identifiedGaps.length === 0 && <Typography variant="body2">No missing skills are listed in the saved role analysis.</Typography>}
                  </Box>
                </Box>
                {!!report.priorityActions?.length && (
                  <Box sx={{ p: 2, mt: 1.5, borderRadius: 1.5, border: `1px solid ${colors.borderLight}` }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: colors.accent, display: 'block', mb: 1 }}>
                      Suggested next steps from your saved role analysis:
                    </Typography>
                    {report.priorityActions.map((action, idx) => (
                      <Typography key={idx} variant="body2" sx={{ color: colors.inkSecondary, mb: idx === report.priorityActions.length - 1 ? 0 : 0.75 }}>
                        <strong>{action.title}</strong>{action.reason ? ` — ${action.reason}` : ''}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {/* 4. Placement Offers & Pipeline */}
            {sections.pipeline && (
              <Box sx={{ mb: 3.5 }}>
                <Typography variant="caption" sx={{ color: colors.accent, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', mb: 1 }}>
                  4. Recruitment Offers & Active Pipeline
                </Typography>
                <Box sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${colors.borderLight}` }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>Offers:</Typography>
                  {report.placementOffers.length > 0 ? report.placementOffers.map((item, idx) => (
                    <Typography key={idx} variant="body2" sx={{ color: colors.inkSecondary, mb: 1.5, fontSize: '0.84375rem' }}>
                      {item.company} • {item.role} • {item.package}
                    </Typography>
                  )) : <Typography variant="body2" sx={{ color: colors.inkSecondary, mb: 1.5, fontSize: '0.84375rem' }}>No offers recorded.</Typography>}

                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>Active applications:</Typography>
                  {report.activePipelines.length > 0 ? report.activePipelines.map((item, idx) => (
                    <Typography key={idx} variant="body2" sx={{ color: colors.inkSecondary, fontSize: '0.84375rem' }}>
                      {item.company} ({item.role}) • {item.stage}
                    </Typography>
                  )) : <Typography variant="body2" sx={{ color: colors.inkSecondary, fontSize: '0.84375rem' }}>No active applications recorded.</Typography>}
                </Box>
              </Box>
            )}

            {sections.interviews && (
              <Box sx={{ mb: 3.5 }}>
                <Typography variant="caption" sx={{ color: colors.accent, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', mb: 1 }}>
                  5. Interview Activity
                </Typography>
                <Typography variant="body2" sx={{ color: colors.inkSecondary }}>{report.interviewSummary}</Typography>
              </Box>
            )}

            {/* Faculty & Placement Cell Sign-off */}
            <Box sx={{ pt: 4, mt: 4, borderTop: `1px dashed ${colors.border}` }}>
              <Grid container spacing={4}>
                <Grid item xs={6}>
                  <Box sx={{ height: 40 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                    Generated by SkillBridge
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Box sx={{ height: 40 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                    For Personal Planning
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block' }}>
                    Confirm eligibility and academic records with your placement office.
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CareerReportPage;
