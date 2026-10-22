import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  Sliders,
  CheckCircle2,
  Cpu,
  Building2,
  ShieldAlert,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { colors } from '../../theme/theme';
import adminService from '../../services/adminService';

export const PlatformSettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    adminService.getSettings().then((res) => {
      setSettings(res.data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateSettings(settings);
      setToast({ type: 'success', text: 'Platform configuration updated.' });
    } catch {
      setToast({ type: 'error', text: 'Failed to update settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Platform Controls & AI Weights" subtitle="Loading system parameters..." />
        <Skeleton variant="rounded" height={420} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Platform Controls & AI Weights"
        subtitle="Configure institution credentials, ATS scoring rubric weights, and Google Gemini AI model parameters."
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

      <form onSubmit={handleSave}>
        <Grid container spacing={3.5}>
          {/* Institution Info */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.05rem', color: colors.ink, mb: 1 }}>
                College & Placement Directorate Branding
              </Typography>
              <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mb: 2.5 }}>
                Used on official reports, PDF exports, and institutional emails.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                    Institution Name
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={settings.institutionName}
                    onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                    Active Placement Season
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={settings.placementSeasonYear}
                    onChange={(e) => setSettings({ ...settings, placementSeasonYear: e.target.value })}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                    AI Parsing Engine
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    disabled
                    value={settings.aiProvider}
                    helperText="Connected to Google Gemini AI backend (Node/Express microservice)"
                  />
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Composite Scoring Rubric Weights */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.05rem', color: colors.ink, mb: 1 }}>
                Career Health Score Formula Weights (%)
              </Typography>
              <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mb: 2.5 }}>
                Weights must sum to 100% to calculate student placement readiness scores.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.84375rem', fontWeight: 600 }}>
                    ATS Resume Score Weight:
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={settings.compositeWeights.resumeScoreWeight}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        compositeWeights: {
                          ...settings.compositeWeights,
                          resumeScoreWeight: Number(e.target.value),
                        },
                      })
                    }
                    sx={{ width: 90 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.84375rem', fontWeight: 600 }}>
                    AI Mock Interview Score Weight:
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={settings.compositeWeights.mockInterviewWeight}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        compositeWeights: {
                          ...settings.compositeWeights,
                          mockInterviewWeight: Number(e.target.value),
                        },
                      })
                    }
                    sx={{ width: 90 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.84375rem', fontWeight: 600 }}>
                    Target Skill Alignment Weight:
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={settings.compositeWeights.skillAlignmentWeight}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        compositeWeights: {
                          ...settings.compositeWeights,
                          skillAlignmentWeight: Number(e.target.value),
                        },
                      })
                    }
                    sx={{ width: 90 }}
                  />
                </Box>

                <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}`, mt: 1 }}>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                    Total: {settings.compositeWeights.resumeScoreWeight + settings.compositeWeights.mockInterviewWeight + settings.compositeWeights.skillAlignmentWeight}% (Formula Balanced)
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Submit */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button type="submit" variant="contained" disabled={saving} sx={{ px: 3, py: 1 }}>
              {saving ? 'Saving...' : 'Save Configuration Changes'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default PlatformSettingsPage;
