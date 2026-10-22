import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  Button,
  Chip,
  Checkbox,
  LinearProgress,
  Skeleton,
  Alert,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Milestone,
  CheckCircle2,
  Clock,
  ExternalLink,
  Sparkles,
  RotateCcw,
  BookOpen,
  Calendar,
  Layers,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { colors } from '../../theme/theme';
import roadmapService from '../../services/roadmapService';

export const RoadmapPage = () => {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Regenerate dialog state
  const [openRegenerate, setOpenRegenerate] = useState(false);
  const [regenerateFocus, setRegenerateFocus] = useState('fullstack');
  const [regenerating, setRegenerating] = useState(false);

  const fetchRoadmap = async () => {
    try {
      const res = await roadmapService.getRoadmap();
      setRoadmap(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleToggleTask = async (taskId) => {
    try {
      const res = await roadmapService.toggleTask(taskId);
      // Update local state smoothly
      setRoadmap((prev) => {
        const updatedWeeks = prev.weeks.map((week) => {
          const updatedTasks = week.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          );
          const allCompleted = updatedTasks.every((t) => t.completed);
          return {
            ...week,
            tasks: updatedTasks,
            completed: allCompleted,
          };
        });
        return {
          ...prev,
          progressPercent: res.data.progressPercent,
          completedTasksCount: res.data.completedTasksCount,
          weeks: updatedWeeks,
        };
      });
    } catch {
      setToast({ type: 'error', text: 'Failed to update task state.' });
    }
  };

  const handleConfirmRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await roadmapService.regenerateRoadmap({ focus: regenerateFocus });
      setToast({ type: 'success', text: res.data.message });
      setOpenRegenerate(false);
      fetchRoadmap();
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="AI Learning Roadmap" subtitle="Structuring personalized week-by-week curriculum..." />
        <Skeleton variant="rounded" height={140} sx={{ mb: 3, borderRadius: 2 }} />
        <Skeleton variant="rounded" height={380} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="AI Learning Roadmap"
        subtitle="A sequenced 6-week curriculum tailored to your detected skill gaps for upcoming campus placement drives."
        action={
          <Button
            variant="outlined"
            startIcon={<RotateCcw size={15} />}
            onClick={() => setOpenRegenerate(true)}
            sx={{ fontSize: '0.8125rem' }}
          >
            Regenerate Roadmap
          </Button>
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

      {/* Progress & Milestone Summary Strip */}
      <Card sx={{ p: { xs: 2.5, sm: 3 }, mb: 3.5, borderRadius: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Typography variant="caption" sx={{ color: colors.inkSecondary, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Curriculum Trajectory
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, fontSize: '1.4rem', color: colors.ink, mt: 0.25 }}>
              Week {roadmap.currentWeek} of {roadmap.totalWeeks}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
              Target: {roadmap.targetRole}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={8}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', color: colors.ink }}>
                Overall Completion Progress
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: colors.accent, fontVariantNumeric: 'tabular-nums' }}>
                {roadmap.completedTasksCount} / {roadmap.totalTasksCount} tasks ({roadmap.progressPercent}%)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={roadmap.progressPercent}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.borderLight,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: colors.accent,
                  borderRadius: 4,
                },
              }}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Week-by-Week Roadmap Timeline */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {roadmap.weeks.map((week) => (
          <Card
            key={week.weekNumber}
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: 2,
              border: week.completed
                ? `1px solid ${colors.successBorder}`
                : week.weekNumber === roadmap.currentWeek
                ? `1.5px solid ${colors.accent}`
                : `1px solid ${colors.border}`,
              backgroundColor: colors.surface,
              transition: 'border-color 140ms ease',
            }}
          >
            {/* Week Header */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2, gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 1.5,
                    backgroundColor: week.completed ? colors.successBg : colors.surfaceSubtle,
                    color: week.completed ? colors.success : colors.inkSecondary,
                    border: `1px solid ${week.completed ? colors.successBorder : colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.84375rem',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  W{week.weekNumber}
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.05rem', color: colors.ink }}>
                    {week.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                    Goal: {week.goal}
                  </Typography>
                </Box>
              </Box>

              {week.completed ? (
                <Chip
                  icon={<CheckCircle2 size={13} color={colors.success} />}
                  label="Week Completed"
                  size="small"
                  sx={{
                    backgroundColor: colors.successBg,
                    color: colors.success,
                    border: `1px solid ${colors.successBorder}`,
                    fontWeight: 600,
                    fontSize: '0.71875rem',
                  }}
                />
              ) : week.weekNumber === roadmap.currentWeek ? (
                <Chip
                  label="In Progress"
                  size="small"
                  sx={{
                    backgroundColor: colors.accentLight,
                    color: colors.accent,
                    border: `1px solid ${colors.accentBorder}`,
                    fontWeight: 600,
                    fontSize: '0.71875rem',
                  }}
                />
              ) : (
                <Chip
                  label="Upcoming"
                  size="small"
                  sx={{
                    backgroundColor: colors.surfaceSubtle,
                    color: colors.inkSecondary,
                    fontSize: '0.71875rem',
                  }}
                />
              )}
            </Box>

            {/* Checkable Tasks */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 2 }}>
              {week.tasks.map((task) => (
                <Box
                  key={task.id}
                  sx={{
                    p: 1.75,
                    borderRadius: 1.5,
                    border: `1px solid ${colors.borderLight}`,
                    backgroundColor: task.completed ? colors.surfaceSubtle : colors.surface,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    transition: 'all 120ms ease',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1 }}>
                    <Checkbox
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.id)}
                      size="small"
                      sx={{
                        color: colors.border,
                        p: 0.5,
                        '&.Mui-checked': { color: colors.accent },
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.84375rem',
                        fontWeight: 500,
                        color: task.completed ? colors.inkSecondary : colors.ink,
                        textDecoration: task.completed ? 'line-through' : 'none',
                        lineHeight: 1.4,
                      }}
                    >
                      {task.text}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5, color: colors.inkSecondary }}>
                      <Clock size={12} />
                      <Typography variant="caption" sx={{ fontSize: '0.71875rem' }}>
                        {task.duration}
                      </Typography>
                    </Box>

                    {task.resourceUrl && (
                      <Link
                        href={task.resourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          fontSize: '0.75rem',
                          color: colors.accent,
                          textDecoration: 'none',
                          fontWeight: 600,
                          '&:hover': { textDecoration: 'underline' },
                        }}
                      >
                        <BookOpen size={13} />
                        <span>Docs</span>
                        <ExternalLink size={11} />
                      </Link>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        ))}
      </Box>

      {/* Regenerate Modal Dialog */}
      <Dialog
        open={openRegenerate}
        onClose={() => setOpenRegenerate(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif" }}>
          Regenerate AI Learning Roadmap
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <Typography variant="body2" sx={{ color: colors.inkSecondary, mb: 2, fontSize: '0.84375rem', lineHeight: 1.55 }}>
            Recalculate your week-by-week preparation plan. The AI engine will re-align all remaining tasks to prioritize upcoming campus drive dates and newly detected gaps.
          </Typography>

          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', mb: 0.75 }}>
            Primary Focus Track
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={regenerateFocus}
            onChange={(e) => setRegenerateFocus(e.target.value)}
          >
            <MenuItem value="fullstack">Full Stack Engineer (MERN / Postgres)</MenuItem>
            <MenuItem value="frontend">Frontend Specialist (React / TypeScript)</MenuItem>
            <MenuItem value="backend">Backend & System Architecture (Node / Distributed)</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setOpenRegenerate(false)} disabled={regenerating}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleConfirmRegenerate} disabled={regenerating}>
            {regenerating ? 'Regenerating...' : 'Regenerate plan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoadmapPage;
