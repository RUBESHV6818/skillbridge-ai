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
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { ScoreRing } from '../../components/common/ScoreRing';
import { colors } from '../../theme/theme';
import reportService from '../../services/reportService';

export const CareerReportPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Section picker state
  const [sections, setSections] = useState({
    summary: true,
    scores: true,
    skills: true,
    pipeline: true,
    interviews: true,
  });

  const fetchReport = async () => {
    try {
      const res = await reportService.getReportData(sections);
      setReport(res.data);
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

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadSuccess(false);
    try {
      await reportService.downloadPdf('rep_current');
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
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

  return (
    <Box>
      <PageHeader
        title="Career Readiness Report Generator"
        subtitle="Generate a verified placement credential report for college coordinators, faculty advisors, and campus recruiters."
        action={
          <Button
            variant="contained"
            startIcon={<Download size={16} />}
            onClick={handleDownload}
            disabled={downloading}
            sx={{ fontSize: '0.8125rem' }}
          >
            {downloading ? 'Compiling PDF Document...' : 'Download Official PDF'}
          </Button>
        }
      />

      {downloadSuccess && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 1.5, fontSize: '0.84375rem' }}>
          Report downloaded: <strong>SkillBridge_Readiness_Report_Aarthi_Raman.pdf</strong>. Generated with cryptographic hash for placement verification.
        </Alert>
      )}

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
                { id: 'scores', label: 'Composite Health & ATS Scores' },
                { id: 'skills', label: 'Verified Technical Skills & Gaps' },
                { id: 'pipeline', label: 'Placement Offers & Active Funnel' },
                { id: 'interviews', label: 'Mock Interview Transcript Audit' },
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
              This document serves as your verified placement cell readiness passport for campus eligibility.
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
                    Directorate of Training & Placement • {report.institution}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: colors.ink, display: 'block' }}>
                    Document Ref: CIT-SB-2025-0482
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
                    <Typography variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: colors.success }}>{report.student.cgpa}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" sx={{ color: colors.inkSecondary }}>Graduation Batch</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{report.student.batch}</Typography>
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
                  <Grid item xs={4}>
                    <Box sx={{ p: 2, textAlign: 'center', borderRadius: 1.5, border: `1px solid ${colors.borderLight}` }}>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: colors.accent, fontVariantNumeric: 'tabular-nums' }}>
                        {report.readinessSummary.compositeScore}/100
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mt: 0.5 }}>
                        Career Health Composite
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ p: 2, textAlign: 'center', borderRadius: 1.5, border: `1px solid ${colors.borderLight}` }}>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: colors.success, fontVariantNumeric: 'tabular-nums' }}>
                        {report.scores.atsScore}/100
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mt: 0.5 }}>
                        ATS Resume Benchmark
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ p: 2, textAlign: 'center', borderRadius: 1.5, border: `1px solid ${colors.borderLight}` }}>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: colors.warning, fontVariantNumeric: 'tabular-nums' }}>
                        {report.scores.interviewScore}/100
                      </Typography>
                      <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mt: 0.5 }}>
                        Mock Interview Fluency
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mt: 1, px: 0.5 }}>
                  Certification: {report.readinessSummary.qualificationStatus} ({report.readinessSummary.cohortPercentile}).
                </Typography>
              </Box>
            )}

            {/* 3. Verified Skills & Critical Gaps */}
            {sections.skills && (
              <Box sx={{ mb: 3.5 }}>
                <Typography variant="caption" sx={{ color: colors.accent, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', mb: 1 }}>
                  3. Verified Technical Competencies
                </Typography>
                <Box sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${colors.borderLight}`, mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: colors.success, display: 'block', mb: 1 }}>
                    Audited Proficiencies:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {report.verifiedSkills.map((sk, idx) => (
                      <Chip key={idx} label={sk} size="small" sx={{ backgroundColor: colors.surfaceSubtle, fontSize: '0.71875rem' }} />
                    ))}
                  </Box>
                </Box>
              </Box>
            )}

            {/* 4. Placement Offers & Pipeline */}
            {sections.pipeline && (
              <Box sx={{ mb: 3.5 }}>
                <Typography variant="caption" sx={{ color: colors.accent, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', mb: 1 }}>
                  4. Recruitment Offers & Active Pipeline
                </Typography>
                <Box sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${colors.borderLight}` }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Secured Placement Offer:
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.inkSecondary, mb: 1.5, fontSize: '0.84375rem' }}>
                    Zoho Corporation • Member Technical Staff (MTS) • Package: <strong>₹5.6 LPA CTC</strong>
                  </Typography>

                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Active In-Progress Drives:
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.inkSecondary, fontSize: '0.84375rem' }}>
                    Freshworks (Associate Academy, Round 2) • TCS Digital (Systems Engineer, OA Cleared)
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Faculty & Placement Cell Sign-off */}
            <Box sx={{ pt: 4, mt: 4, borderTop: `1px dashed ${colors.border}` }}>
              <Grid container spacing={4}>
                <Grid item xs={6}>
                  <Box sx={{ height: 40 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                    Prof. K. Soundararajan
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block' }}>
                    Associate Dean — Industry Relations & Placement
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  <Box sx={{ height: 40 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                    Priya Sundaram
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block' }}>
                    Assigned Alumni Industry Mentor (Freshworks)
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
