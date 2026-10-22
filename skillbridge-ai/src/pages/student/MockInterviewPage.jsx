import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  LinearProgress,
  Divider,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Headphones,
  Video,
  Play,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Send,
  FileCheck,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { ScoreRing } from '../../components/common/ScoreRing';
import { colors } from '../../theme/theme';
import interviewService, { MOCK_INTERVIEW_QUESTIONS } from '../../services/interviewService';

export const MockInterviewPage = () => {
  const [stage, setStage] = useState('setup'); // 'setup' | 'interview' | 'results'
  const [config, setConfig] = useState({
    role: 'Full Stack Engineer',
    difficulty: 'Entry SDE-1',
    interviewType: 'Mixed Technical & HR',
    numQuestions: 3,
  });

  // Interview active session state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(180);
  const [timerActive, setTimerActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Results state
  const [evaluation, setEvaluation] = useState(null);

  // Timer countdown
  useEffect(() => {
    let timer = null;
    if (stage === 'interview' && timerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stage, timerActive, timeLeft]);

  const handleStartInterview = async () => {
    const res = await interviewService.startSession(config);
    setQuestions(res.data.questions);
    setCurrentIndex(0);
    setAnswers({});
    setCurrentAnswer('');
    setTimeLeft(res.data.questions[0]?.timeLimitSeconds || 180);
    setTimerActive(true);
    setStage('interview');
  };

  const handleNextQuestion = () => {
    // Save current answer
    const currentQId = questions[currentIndex]?.id;
    const updatedAnswers = { ...answers, [currentQId]: currentAnswer };
    setAnswers(updatedAnswers);

    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setCurrentAnswer(updatedAnswers[questions[nextIdx]?.id] || '');
      setTimeLeft(questions[nextIdx]?.timeLimitSeconds || 180);
    } else {
      // Last question reached
      handleSubmitSession(updatedAnswers);
    }
  };

  const handleSkipQuestion = () => {
    handleNextQuestion();
  };

  const handleSubmitSession = async (finalAnswers = answers) => {
    setTimerActive(false);
    setSubmitting(true);
    try {
      const res = await interviewService.submitAnswers('ses_active', finalAnswers);
      setEvaluation(res.data);
      setStage('results');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. SETUP SCREEN
  if (stage === 'setup') {
    return (
      <Box>
        <PageHeader
          title="AI Mock Interview Drills"
          subtitle="Simulate high-stakes campus placement technical and behavioral rounds with realistic automated rubric scoring."
        />

        <Grid container spacing={3.5}>
          {/* Left Form: Configuration */}
          <Grid item xs={12} md={7}>
            <Card sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.15rem', color: colors.ink, mb: 1 }}>
                Configure Interview Session
              </Typography>
              <Typography variant="body2" sx={{ color: colors.inkSecondary, mb: 3, fontSize: '0.84375rem' }}>
                Select your target placement track and difficulty level to calibrate question complexity and scoring rubrics.
              </Typography>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, fontSize: '0.8125rem' }}>
                    Target Engineering Role
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={config.role}
                    onChange={(e) => setConfig({ ...config, role: e.target.value })}
                  >
                    <MenuItem value="Full Stack Engineer">Full Stack Engineer (React/Node)</MenuItem>
                    <MenuItem value="Frontend Specialist">Frontend Specialist (React/TS)</MenuItem>
                    <MenuItem value="Backend Engineer">Backend & Systems Engineer</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, fontSize: '0.8125rem' }}>
                    Placement Experience Tier
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={config.difficulty}
                    onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
                  >
                    <MenuItem value="Entry SDE-1">Entry SDE-1 (Campus Band: ₹4 - 8 LPA)</MenuItem>
                    <MenuItem value="Product Track">Product Tier-1 (Zoho/Freshworks Band: ₹7 - 12 LPA)</MenuItem>
                    <MenuItem value="Aptitude & Systems">Comprehensive Systems & Core CS</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, fontSize: '0.8125rem' }}>
                    Interview Focus Type
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={config.interviewType}
                    onChange={(e) => setConfig({ ...config, interviewType: e.target.value })}
                  >
                    <MenuItem value="Mixed Technical & HR">Mixed (Technical + Behavioral STAR)</MenuItem>
                    <MenuItem value="Pure Technical">Pure Technical (Architecture & Code Logic)</MenuItem>
                    <MenuItem value="Managerial & HR">Managerial / Culture Fit</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75, fontSize: '0.8125rem' }}>
                    Session Length
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={config.numQuestions}
                    onChange={(e) => setConfig({ ...config, numQuestions: Number(e.target.value) })}
                  >
                    <MenuItem value={3}>3 Questions (Express Drill • ~10 mins)</MenuItem>
                    <MenuItem value={5}>5 Questions (Standard Round • ~20 mins)</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleStartInterview}
                    startIcon={<Play size={16} />}
                    sx={{ py: 1.2, fontSize: '0.9375rem' }}
                  >
                    Start Written Mock Drill
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* Right Column: Audio/Video Coming Soon Note */}
          <Grid item xs={12} md={5}>
            <Card
              sx={{
                p: 3,
                borderRadius: 2,
                border: `1px dashed ${colors.border}`,
                backgroundColor: colors.surfaceSubtle,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1.5,
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.borderLight}`,
                    color: colors.inkSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.75,
                  }}
                >
                  <Video size={18} />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.05rem', color: colors.ink }}>
                    Voice & Video AI Interviewer
                  </Typography>
                  <Chip
                    label="Coming Soon v2.0"
                    size="small"
                    sx={{
                      backgroundColor: colors.borderLight,
                      color: colors.inkSecondary,
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      height: 20,
                    }}
                  />
                </Box>

                <Typography variant="body2" sx={{ color: colors.inkSecondary, lineHeight: 1.6, fontSize: '0.84375rem', mb: 2 }}>
                  Full voice synthesis and speech-to-text mock interviews with simulated video recruiters are scheduled for the next major release.
                </Typography>

                <Typography variant="caption" sx={{ color: colors.inkTertiary, lineHeight: 1.5, display: 'block' }}>
                  Current phase delivers real-time written technical response analysis, keyword extraction, and STAR model critique.
                </Typography>
              </Box>

              <Box sx={{ p: 2, borderRadius: 1.5, backgroundColor: colors.surface, border: `1px solid ${colors.borderLight}`, mt: 3 }}>
                <Typography variant="caption" sx={{ color: colors.ink, fontWeight: 600, display: 'block', mb: 0.5 }}>
                  Last Mock Session Baseline:
                </Typography>
                <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block' }}>
                  68/100 (Full Stack Track, completed 2 days ago)
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // 2. ACTIVE FOCUSED INTERVIEW SCREEN
  if (stage === 'interview') {
    const currentQ = questions[currentIndex];
    const wordsCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;

    return (
      <Box sx={{ maxWidth: 860, mx: 'auto', py: 2 }}>
        {/* Top Slim Status Bar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: colors.ink }}>
              Question {currentIndex + 1} of {questions.length}
            </Typography>
            <Chip
              label={currentQ?.category}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.6875rem',
                fontWeight: 600,
                backgroundColor: colors.accentLight,
                color: colors.accent,
              }}
            />
          </Box>

          {/* Timer Display */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.5,
              borderRadius: 1.5,
              backgroundColor: timeLeft < 30 ? colors.errorBg : colors.surfaceSubtle,
              border: `1px solid ${timeLeft < 30 ? colors.errorBorder : colors.borderLight}`,
              color: timeLeft < 30 ? colors.error : colors.ink,
              fontWeight: 700,
              fontSize: '0.84375rem',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <Clock size={15} />
            <span>{formatTimer(timeLeft)}</span>
          </Box>
        </Box>

        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={((currentIndex + 1) / questions.length) * 100}
          sx={{
            height: 4,
            borderRadius: 2,
            mb: 3,
            backgroundColor: colors.borderLight,
            '& .MuiLinearProgress-bar': {
              backgroundColor: colors.accent,
            },
          }}
        />

        {/* Question Prompt Card */}
        <Card sx={{ p: { xs: 2.5, sm: 3.5 }, mb: 3, borderRadius: 2 }}>
          <Typography
            variant="h3"
            sx={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700,
              fontSize: { xs: '1.2rem', sm: '1.4rem' },
              color: colors.ink,
              lineHeight: 1.4,
              mb: 1.5,
            }}
          >
            {currentQ?.question}
          </Typography>

          <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block' }}>
            Tip: Provide a structured answer citing theoretical mechanics, real project tradeoffs, and clean terminology.
          </Typography>
        </Card>

        {/* Answer Input Card */}
        <Card sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: colors.ink }}>
              Your Response
            </Typography>
            <Typography variant="caption" sx={{ color: colors.inkSecondary, fontVariantNumeric: 'tabular-nums' }}>
              {wordsCount} words • Auto-saved
            </Typography>
          </Box>

          <TextField
            multiline
            rows={8}
            fullWidth
            placeholder="Type your structured technical response here..."
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.9375rem',
                lineHeight: 1.6,
              },
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, pt: 2, borderTop: `1px solid ${colors.borderLight}` }}>
            <Button
              variant="text"
              onClick={handleSkipQuestion}
              sx={{ color: colors.inkSecondary, fontSize: '0.8125rem' }}
            >
              Skip Question
            </Button>

            <Button
              variant="contained"
              onClick={handleNextQuestion}
              disabled={submitting || !currentAnswer.trim()}
              endIcon={currentIndex < questions.length - 1 ? <ArrowRight size={15} /> : <CheckCircle2 size={15} />}
              sx={{ px: 3, py: 0.9, fontSize: '0.84375rem' }}
            >
              {currentIndex < questions.length - 1 ? 'Next Question' : submitting ? 'Evaluating...' : 'Submit Session'}
            </Button>
          </Box>
        </Card>
      </Box>
    );
  }

  // 3. RESULTS SCREEN
  if (stage === 'results' && evaluation) {
    return (
      <Box>
        <PageHeader
          title="Mock Interview Evaluation & Critique"
          subtitle={`Completed on ${evaluation.completedAt} for ${evaluation.role} (${evaluation.difficulty}).`}
          action={
            <Button
              variant="contained"
              startIcon={<RotateCcw size={15} />}
              onClick={() => setStage('setup')}
              sx={{ fontSize: '0.8125rem' }}
            >
              Practice Another Drill
            </Button>
          }
        />

        {/* Overall Score Header Card */}
        <Card sx={{ p: { xs: 2.5, sm: 3.5 }, mb: 3.5, borderRadius: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <ScoreRing
                score={evaluation.overallScore}
                max={100}
                size={140}
                strokeWidth={10}
                label="Interview Score"
                tooltip="Weighted combination of technical correctness, clarity of thought, and domain vocabulary."
              />
            </Grid>

            <Grid item xs={12} sm={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip
                  label={`Beats ${evaluation.percentile}% of applicants`}
                  size="small"
                  sx={{
                    backgroundColor: colors.successBg,
                    color: colors.success,
                    border: `1px solid ${colors.successBorder}`,
                    fontWeight: 600,
                  }}
                />
                <Chip
                  label={evaluation.interviewType}
                  size="small"
                  sx={{
                    backgroundColor: colors.surfaceSubtle,
                    color: colors.inkSecondary,
                    border: `1px solid ${colors.border}`,
                  }}
                />
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.25rem', color: colors.ink, mb: 1 }}>
                Evaluator Summary
              </Typography>
              <Typography variant="body2" sx={{ color: colors.inkSecondary, lineHeight: 1.6, fontSize: '0.875rem' }}>
                {evaluation.summary}
              </Typography>
            </Grid>
          </Grid>
        </Card>

        {/* Per-Question Detailed Feedback Cards */}
        <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.15rem', color: colors.ink, mb: 2 }}>
          Question-by-Question Diagnostic Feedback
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {evaluation.questionsFeedback.map((item, idx) => (
            <Card key={idx} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box sx={{ maxWidth: '80%' }}>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                    Question {idx + 1}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, fontSize: '0.96875rem', color: colors.ink, mt: 0.25 }}>
                    {item.question}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      color: item.score >= 75 ? colors.success : colors.warning,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {item.score}/100
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                    Clarity: {item.clarity}%
                  </Typography>
                </Box>
              </Box>

              {/* User Answer Box */}
              <Box sx={{ p: 2, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}`, mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: colors.inkSecondary, textTransform: 'uppercase', letterSpacing: '0.02em', display: 'block', mb: 0.5 }}>
                  Your Submitted Answer:
                </Typography>
                <Typography variant="body2" sx={{ color: colors.ink, fontSize: '0.84375rem', lineHeight: 1.6 }}>
                  "{item.userAnswer}"
                </Typography>
              </Box>

              {/* Critique */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: colors.accent, textTransform: 'uppercase', letterSpacing: '0.02em', display: 'block', mb: 0.5 }}>
                  Rubric Critique:
                </Typography>
                <Typography variant="body2" sx={{ color: colors.inkSecondary, fontSize: '0.84375rem', lineHeight: 1.55 }}>
                  {item.critique}
                </Typography>
              </Box>

              {/* Covered vs Missed Points */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: colors.successBg, border: `1px solid ${colors.successBorder}` }}>
                    <Typography variant="caption" sx={{ color: colors.success, fontWeight: 700, display: 'block', mb: 0.75 }}>
                      Key Points Covered
                    </Typography>
                    {item.keyPointsCovered.map((pt, pIdx) => (
                      <Box key={pIdx} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                        <CheckCircle2 size={13} color={colors.success} />
                        <Typography variant="caption" sx={{ color: colors.ink, fontSize: '0.75rem' }}>
                          {pt}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: colors.warningBg, border: `1px solid ${colors.warningBorder}` }}>
                    <Typography variant="caption" sx={{ color: colors.warning, fontWeight: 700, display: 'block', mb: 0.75 }}>
                      Missing Nuances / Enhancements
                    </Typography>
                    {item.keyPointsMissed.map((pt, pIdx) => (
                      <Box key={pIdx} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                        <AlertCircle size={13} color={colors.warning} />
                        <Typography variant="caption" sx={{ color: colors.ink, fontSize: '0.75rem' }}>
                          {pt}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Card>
          ))}
        </Box>
      </Box>
    );
  }

  return null;
};

export default MockInterviewPage;
