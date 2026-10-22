import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  Divider,
} from '@mui/material';
import {
  FileText,
  Star,
  Trash2,
  Sparkles,
  ExternalLink,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { FileDropzone } from '../../components/common/FileDropzone';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { colors } from '../../theme/theme';
import resumeService from '../../services/resumeService';

export const ResumeManagementPage = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: '' }

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchResumes = async () => {
    try {
      const res = await resumeService.getResumes();
      setResumes(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUploadSuccess = async (file) => {
    try {
      const newResume = await resumeService.uploadResume(file);
      setResumes((prev) => [newResume.data, ...prev.filter((r) => r.id !== newResume.data.id)]);
      setFeedback({
        type: 'success',
        text: `"${file.name}" was uploaded successfully and parsed by our ATS diagnostic engine.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to upload resume document.',
      });
    }
  };

  const handleSetPrimary = async (resume) => {
    if (resume.isPrimary) return;
    try {
      await resumeService.setPrimary(resume.id);
      setResumes((prev) =>
        prev.map((r) => ({
          ...r,
          isPrimary: r.id === resume.id,
        }))
      );
      setFeedback({
        type: 'success',
        text: `"${resume.fileName}" is now set as your primary campus recruitment resume.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: 'Failed to update primary resume status.',
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await resumeService.deleteResume(deleteTarget.id);
      setResumes((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setFeedback({
        type: 'success',
        text: `"${deleteTarget.fileName}" was removed from your stored resumes.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: 'Could not delete resume document.',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Resume Management"
        subtitle="Upload and benchmark multiple resume versions tailored for product, service, and fullstack recruitment drives."
      />

      {feedback && (
        <Alert
          severity={feedback.type}
          onClose={() => setFeedback(null)}
          sx={{ mb: 3, fontSize: '0.84375rem', borderRadius: 1.5 }}
        >
          {feedback.text}
        </Alert>
      )}

      {/* Upload Dropzone Section */}
      <Card sx={{ p: { xs: 2.5, sm: 3 }, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 0.5, color: colors.ink }}>
          Upload New Resume
        </Typography>
        <Typography variant="body2" sx={{ color: colors.inkSecondary, mb: 2.5, fontSize: '0.84375rem' }}>
          Upload your latest resume in PDF or DOCX format. The parser extracts technical skills, projects, and benchmarks readability against campus JDs.
        </Typography>

        <FileDropzone onFileUpload={handleUploadSuccess} maxSizeMB={5} accept=".pdf,.docx,.doc" />
      </Card>

      {/* Resumes List Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.15rem', color: colors.ink }}>
            Your Stored Resumes ({resumes.length})
          </Typography>
          <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
            One resume must be designated as Primary for college placement drives and JD matching.
          </Typography>
        </Box>
      </Box>

      {/* Loading Skeletons */}
      {loading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" height={100} sx={{ borderRadius: 2 }} />
        </Box>
      )}

      {/* Empty State */}
      {!loading && resumes.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No resumes on file"
          description="You haven't uploaded any resumes yet. Drop your first PDF above to generate your initial ATS diagnostic report."
          actionLabel="Upload First Resume"
          onAction={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />
      )}

      {/* Resumes Grid/List */}
      {!loading && resumes.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {resumes.map((resume) => (
            <Card
              key={resume.id}
              sx={{
                p: 2.5,
                borderRadius: 2,
                border: resume.isPrimary
                  ? `1.5px solid ${colors.accent}`
                  : `1px solid ${colors.border}`,
                backgroundColor: resume.isPrimary ? colors.surface : colors.surface,
                transition: 'all 140ms ease',
                '&:hover': {
                  borderColor: colors.accent,
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                {/* Left metadata */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, minWidth: 0, flex: 1 }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 1.5,
                      backgroundColor: resume.isPrimary ? colors.accentLight : colors.surfaceSubtle,
                      color: resume.isPrimary ? colors.accent : colors.inkSecondary,
                      border: `1px solid ${resume.isPrimary ? colors.accentBorder : colors.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={20} />
                  </Box>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.25 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          color: colors.ink,
                          wordBreak: 'break-all',
                        }}
                      >
                        {resume.fileName}
                      </Typography>
                      {resume.isPrimary && (
                        <Chip
                          icon={<Star size={12} fill={colors.accent} color={colors.accent} />}
                          label="Primary Drive Resume"
                          size="small"
                          sx={{
                            backgroundColor: colors.accentLight,
                            color: colors.accent,
                            border: `1px solid ${colors.accentBorder}`,
                            fontWeight: 600,
                            fontSize: '0.6875rem',
                            height: 22,
                          }}
                        />
                      )}
                    </Box>

                    <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block' }}>
                      {resume.fileSize} • Uploaded {resume.uploadedAt} • Last analysed: {resume.lastAnalysed}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                          ATS Score:
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: resume.atsScore >= 75 ? colors.success : colors.warning,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {resume.atsScore}/100
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                          Matched Keywords:
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: colors.ink, fontVariantNumeric: 'tabular-nums' }}>
                          {resume.matchedKeywordsCount} detected
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Right Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, alignSelf: { xs: 'flex-end', sm: 'center' } }}>
                  {!resume.isPrimary && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleSetPrimary(resume)}
                      sx={{ fontSize: '0.75rem', py: 0.5 }}
                    >
                      Set as Primary
                    </Button>
                  )}

                  <Button
                    component={RouterLink}
                    to="/resume-intelligence"
                    variant="contained"
                    size="small"
                    startIcon={<Sparkles size={14} />}
                    sx={{ fontSize: '0.75rem', py: 0.5 }}
                  >
                    AI Intelligence
                  </Button>

                  <Tooltip title="Delete resume document" arrow>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(resume)}
                      sx={{
                        color: colors.inkTertiary,
                        border: `1px solid ${colors.borderLight}`,
                        borderRadius: 1.5,
                        p: 0.75,
                        '&:hover': { color: colors.error, borderColor: colors.errorBorder },
                      }}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* Confirmation Modal for Deletion */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete resume document?"
        message={`Are you sure you want to delete "${deleteTarget?.fileName}"? All parsed ATS metrics, keyword caches, and rewrite history associated with this file will be discarded.`}
        confirmLabel="Delete document"
        isDestructive
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default ResumeManagementPage;
