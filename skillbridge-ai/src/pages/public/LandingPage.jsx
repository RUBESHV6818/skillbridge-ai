import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  Chip,
} from '@mui/material';
import {
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  FileText,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Building2,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { colors } from '../../theme/theme';
import { ScoreRing } from '../../components/common/ScoreRing';
import { SkillChip } from '../../components/common/SkillChip';

export const LandingPage = () => {
  const [expandedFaq, setExpandedFaq] = useState(false);

  const handleFaqChange = (panel) => (event, isExpanded) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  const workflowSteps = [
    {
      num: '01',
      title: 'Register & set target roles',
      description: 'Set your engineering stream, graduating batch, and target profiles (e.g. Full Stack, Backend, Cloud).',
    },
    {
      num: '02',
      title: 'Upload your current resume',
      description: 'Drop your single or multi-page PDF or DOCX file (up to 5MB) for multi-level ATS parsing.',
    },
    {
      num: '03',
      title: 'AI Resume Intelligence analysis',
      description: 'Get an ATS readability score breakdown across formatting, keywords, section integrity, and quantifiable impact bullets.',
    },
    {
      num: '04',
      title: 'Job Description (JD) matching',
      description: 'Paste any company job posting to extract must-have vs good-to-have requirements and benchmark against your profile.',
    },
    {
      num: '05',
      title: 'Skill gap detection & prioritization',
      description: 'See the exact technical gaps standing between you and the shortlist threshold, categorized with urgent priorities.',
    },
    {
      num: '06',
      title: 'Curated week-by-week learning roadmap',
      description: 'Follow an actionable, checkable study plan with verified documentation and practice problems instead of infinite video playlists.',
    },
    {
      num: '07',
      title: 'Role-specific AI mock interviews',
      description: 'Practice targeted technical and behavioral questions with immediate per-response rubric scoring and critique.',
    },
    {
      num: '08',
      title: 'Placement tracker & readiness reporting',
      description: 'Manage active campus drives on a Kanban board and generate verified PDF readiness summaries for coordinators and mentors.',
    },
  ];

  const audiences = [
    {
      role: 'Final-Year Students & Fresh Grads',
      focus: 'Bridging the college-to-industry gap',
      points: [
        'Understand why your resume gets rejected by enterprise ATS systems before an engineer reads it.',
        'Target tier-1 product and high-volume campus recruiters (TCS, Zoho, Freshworks, Infosys) with tailored variants.',
        'Replace guesswork with a weekly checklist of skills to build before drive season begins.',
      ],
    },
    {
      role: 'Placement Cell Coordinators',
      focus: 'Institutional cohort visibility',
      points: [
        'Track department-wide readiness across 400+ students without messy spreadsheets.',
        'Identify students stuck below the 65% interview benchmark early enough to intervene.',
        'Share verified company-specific recruitment packages and eligibility cutoffs.',
      ],
    },
    {
      role: 'Alumni & Faculty Mentors',
      focus: 'Targeted feedback without burnout',
      points: [
        'Review student resumes with AI pre-analysis highlighting weak verbs and missing metrics.',
        'Leave line-item suggestions on project descriptions and mock interview transcripts.',
        'Focus your 30-minute mentoring slots on higher-order system design and career clarity.',
      ],
    },
  ];

  const faqs = [
    {
      q: 'How does SkillBridge calculate the ATS score?',
      a: 'The scoring engine benchmarks resumes against industry standard ATS parsers. It evaluates 4 distinct dimensions: formatting compliance (margins, fonts, tables), keyword density relative to standard engineering job descriptions, essential section presence (Education, Skills, Experience, Projects), and readability/impact metrics.',
    },
    {
      q: 'Can I upload multiple versions of my resume for different roles?',
      a: 'Yes. You can store up to 5 resumes, mark one as primary for campus placement eligibility, and compare each against specific job descriptions (e.g. Frontend vs Cloud Engineer).',
    },
    {
      q: 'Does this replace our college Training and Placement (T&P) portal?',
      a: 'SkillBridge complements your existing ERP or placement portal. While your college portal handles drive registration and hall tickets, SkillBridge prepares the student to clear the initial resume shortlists and technical rounds.',
    },
    {
      q: 'How are mock interview questions selected?',
      a: 'Questions are dynamically pulled based on your declared target role, difficulty tier, and detected resume skills. Each response is analyzed for technical correctness, clarity, and keyword completeness.',
    },
  ];

  return (
    <Box sx={{ pt: { xs: 4, md: 8 }, pb: 8 }}>
      {/* 1. HERO SECTION */}
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
          {/* Left Column: Asymmetric, Playfair, Plain Microcopy */}
          <Grid item xs={12} md={6}>
            <Box sx={{ maxWidth: 540 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 1,
                  backgroundColor: colors.surfaceSubtle,
                  border: `1px solid ${colors.border}`,
                  mb: 2.5,
                }}
              >
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: colors.accent }} />
                <Typography variant="caption" sx={{ fontWeight: 600, color: colors.inkSecondary, letterSpacing: '0.02em' }}>
                  2025–2026 Campus Placement Season
                </Typography>
              </Box>

              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.25rem', sm: '2.75rem', md: '3.1rem' },
                  fontWeight: 700,
                  lineHeight: 1.15,
                  letterSpacing: '-0.025em',
                  color: colors.ink,
                  mb: 2.5,
                }}
              >
                Clear engineering placement rounds with real preparation.
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  fontSize: '1.0625rem',
                  lineHeight: 1.65,
                  color: colors.inkSecondary,
                  mb: 3.5,
                }}
              >
                SkillBridge AI diagnoses your resume against genuine job descriptions, finds missing skills, generates a week-by-week study plan, and runs structured mock interviews before campus recruiters arrive.
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowRight size={17} />}
                  sx={{ px: 3, py: 1.2, fontSize: '0.9375rem' }}
                >
                  Start student assessment
                </Button>
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: colors.ink,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    borderBottom: `1px solid ${colors.border}`,
                    pb: 0.25,
                    '&:hover': { borderColor: colors.ink },
                  }}
                >
                  Sign in to existing account →
                </Link>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 4, pt: 3, borderTop: `1px solid ${colors.borderLight}` }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: colors.ink, fontVariantNumeric: 'tabular-nums' }}>
                    480+
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                    Students tracked
                  </Typography>
                </Box>
                <Box sx={{ width: 1, height: 24, backgroundColor: colors.borderLight }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: colors.ink, fontVariantNumeric: 'tabular-nums' }}>
                    ₹7.2 LPA
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                    Median target CTC
                  </Typography>
                </Box>
                <Box sx={{ width: 1, height: 24, backgroundColor: colors.borderLight }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: colors.ink }}>
                    8 Core Modules
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                    Single unified pipeline
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Right Column: Real-Looking Cropped Product Component Preview (NOT an AI illustration) */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 3,
                borderRadius: 2.5,
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                boxShadow: '0 8px 30px rgba(23, 22, 28, 0.06)',
                position: 'relative',
              }}
            >
              {/* Fake Chrome Bar */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 2, mb: 2.5, borderBottom: `1px solid ${colors.borderLight}` }}>
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#E2E0EC' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#E2E0EC' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#E2E0EC' }} />
                </Box>
                <Typography variant="caption" sx={{ color: colors.inkTertiary, fontSize: '0.6875rem' }}>
                  skillbridge.app/dashboard • live preview
                </Typography>
                <Box sx={{ width: 24 }} />
              </Box>

              {/* Student Header In Card */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, fontSize: '0.6875rem' }}>
                    Student Diagnostic Summary
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.2rem', color: colors.ink, mt: 0.25 }}>
                    Aarthi Raman
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                    B.Tech CSE • Target: Full Stack Engineer
                  </Typography>
                </Box>
                <Chip
                  label="Campus Active"
                  size="small"
                  sx={{
                    backgroundColor: colors.successBg,
                    color: colors.success,
                    border: `1px solid ${colors.successBorder}`,
                    fontWeight: 600,
                    fontSize: '0.71875rem',
                  }}
                />
              </Box>

              {/* Score breakdown row */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 2.5, mb: 3, p: 2, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}` }}>
                <ScoreRing
                  score={72}
                  max={100}
                  size={96}
                  strokeWidth={7}
                  label="ATS Score"
                  tooltip="Calculated against 12 campus full-stack JDs"
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: colors.ink, mb: 0.5 }}>
                    Key Diagnosis
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary, lineHeight: 1.5, display: 'block', mb: 1 }}>
                    Resume mentions React and Tailwind, but lacks automated testing (Jest) and SQL schema design demanded by Zoho & Freshworks.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    <SkillChip name="React" status="matched" />
                    <SkillChip name="Node.js" status="matched" />
                    <SkillChip name="Jest / Testing" status="missing" priority="high" />
                  </Box>
                </Box>
              </Box>

              {/* Action item snapshot */}
              <Box sx={{ p: 2, borderRadius: 1.5, border: `1px solid ${colors.borderLight}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: colors.ink, fontSize: '0.75rem', letterSpacing: '0.02em' }}>
                    RECOMMENDED NEXT ACTION
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.accent, fontWeight: 600, fontSize: '0.71875rem' }}>
                    Week 3 of 6
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: colors.ink, fontWeight: 500 }}>
                  Complete 5 unit tests for your e-commerce cart component using Jest
                </Typography>
                <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mt: 0.5 }}>
                  Matches TCS Digital & Freshworks coding benchmark.
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* 2. HOW IT WORKS (Strict 8-Step Vertical List as requested) */}
      <Box id="workflow" sx={{ mt: { xs: 8, md: 12 }, py: 8, backgroundColor: colors.surface, borderTop: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 640, mb: 6 }}>
            <Typography variant="caption" sx={{ color: colors.accent, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Sequential Pipeline
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', md: '2.1rem' }, mt: 1, mb: 1.5 }}>
              How SkillBridge prepares you for placement rounds
            </Typography>
            <Typography variant="body2" sx={{ color: colors.inkSecondary, fontSize: '0.9375rem', lineHeight: 1.6 }}>
              A structured, human-tested 8-stage sequence from day one of final year to accepting your placement offer.
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {workflowSteps.map((step) => (
              <Grid item xs={12} sm={6} md={3} key={step.num}>
                <Box
                  sx={{
                    p: 2.5,
                    height: '100%',
                    borderRadius: 2,
                    border: `1px solid ${colors.borderLight}`,
                    backgroundColor: colors.surfaceSubtle,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontWeight: 700,
                      fontSize: '1.25rem',
                      color: colors.accent,
                      mb: 1,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {step.num}
                  </Typography>
                  <Typography variant="h5" sx={{ fontSize: '0.9375rem', fontWeight: 700, color: colors.ink, mb: 1, lineHeight: 1.35 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary, lineHeight: 1.6, fontSize: '0.78125rem' }}>
                    {step.description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 3. WHO IT'S FOR */}
      <Container id="audience" maxWidth="lg" sx={{ mt: { xs: 8, md: 12 } }}>
        <Box sx={{ maxWidth: 640, mb: 6 }}>
          <Typography variant="caption" sx={{ color: colors.accent, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Built for Real Campus Environments
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', md: '2.1rem' }, mt: 1, mb: 1.5 }}>
            Designed for students, coordinators, and mentors
          </Typography>
          <Typography variant="body2" sx={{ color: colors.inkSecondary, fontSize: '0.9375rem', lineHeight: 1.6 }}>
            Every role receives dedicated tooling tailored to their responsibility in the recruitment cycle.
          </Typography>
        </Box>

        <Grid container spacing={3.5}>
          {audiences.map((aud, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <Card sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                <Typography variant="caption" sx={{ color: colors.accent, fontWeight: 600, fontSize: '0.75rem' }}>
                  {aud.focus}
                </Typography>
                <Typography variant="h4" sx={{ fontSize: '1.15rem', fontWeight: 700, mt: 0.5, mb: 2, color: colors.ink }}>
                  {aud.role}
                </Typography>
                <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
                  {aud.points.map((pt, pIdx) => (
                    <Box
                      component="li"
                      key={pIdx}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.25,
                        mb: 1.5,
                        fontSize: '0.8125rem',
                        lineHeight: 1.55,
                        color: colors.inkSecondary,
                      }}
                    >
                      <Box sx={{ color: colors.success, flexShrink: 0, mt: '2px' }}>
                        <CheckCircle2 size={15} />
                      </Box>
                      <span>{pt}</span>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 4. FAQ ACCORDION */}
      <Container id="faq" maxWidth="md" sx={{ mt: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.75rem', md: '2.1rem' }, mb: 1 }}>
            Frequently answered questions
          </Typography>
          <Typography variant="body2" sx={{ color: colors.inkSecondary }}>
            Everything you need to know about ATS scoring, mock interviews, and privacy.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {faqs.map((faq, index) => {
            const panelId = `panel${index}`;
            return (
              <Accordion
                key={index}
                expanded={expandedFaq === panelId}
                onChange={handleFaqChange(panelId)}
                sx={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px !important',
                  '&:before': { display: 'none' },
                  boxShadow: 'none',
                }}
              >
                <AccordionSummary expandIcon={<ChevronDown size={18} color={colors.inkSecondary} />}>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.9375rem', color: colors.ink }}>
                    {faq.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0, pb: 2.5 }}>
                  <Typography variant="body2" sx={{ color: colors.inkSecondary, lineHeight: 1.65, fontSize: '0.84375rem' }}>
                    {faq.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </Container>

      {/* 5. BOTTOM CALLOUT */}
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Box
          sx={{
            p: { xs: 3, md: 4.5 },
            borderRadius: 2,
            backgroundColor: colors.surface,
            border: `1px solid ${colors.accentBorder}`,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2.5,
          }}
        >
          <Box>
            <Typography variant="h3" sx={{ fontSize: '1.35rem', fontWeight: 700, mb: 0.5, color: colors.ink }}>
              Ready to evaluate your placement readiness?
            </Typography>
            <Typography variant="body2" sx={{ color: colors.inkSecondary, fontSize: '0.875rem' }}>
              Sign in with your CIT student credentials or register your department batch in under 2 minutes.
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            sx={{ px: 3, py: 1.1, whiteSpace: 'nowrap' }}
          >
            Create student profile
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;
