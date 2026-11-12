import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Skeleton,
} from '@mui/material';
import { PageHeader } from '../../components/common/PageHeader';
import { colors } from '../../theme/theme';
import adminService from '../../services/adminService';

export const PlatformSettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [loadError, setLoadError] = useState('');

  const atsTotal = settings ? Object.values(settings.atsWeights || {}).reduce((sum, value) => sum + Number(value || 0), 0) : 0;
  const compositeTotal = settings ? Object.values(settings.compositeWeights || {}).reduce((sum, value) => sum + Number(value || 0), 0) : 0;
  const hasValidWeights = (values, keys) => keys.every((key) => values?.[key] !== '' && Number.isFinite(Number(values?.[key])) && Number(values[key]) >= 0 && Number(values[key]) <= 100);
  const weightsValid = Boolean(settings)
    && hasValidWeights(settings?.atsWeights, ['resumeFormatting', 'keywordDensity', 'sectionIntegrity', 'impactActionVerbs'])
    && hasValidWeights(settings?.compositeWeights, ['resumeScoreWeight', 'mockInterviewWeight', 'skillAlignmentWeight'])
    && Math.abs(atsTotal - 100) < 0.000001
    && Math.abs(compositeTotal - 100) < 0.000001;

  const updateWeight = (group, key, value) => {
    setSettings((previous) => ({
      ...previous,
      [group]: { ...previous[group], [key]: value === '' ? '' : Number(value) },
    }));
  };

  const fetchSettings = async () => {
    setLoading(true);
    setLoadError('');
    adminService.getSettings().then((res) => {
      setSettings(res.data);
    }).catch((error) => {
      setLoadError(error.response?.data?.message || 'Could not load platform settings.');
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await adminService.updateSettings(settings);
      if (response.data?.settings) setSettings(response.data.settings);
      setToast({ type: 'success', text: 'Platform configuration updated.' });
    } catch (error) {
      setToast({ type: 'error', text: error.response?.data?.message || 'Failed to update settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box>
        <PageHeader title="Platform Settings" subtitle="Loading saved platform configuration..." />
        <Skeleton variant="rounded" height={420} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  if (loadError || !settings) return <Box><PageHeader title="Platform Settings" subtitle="Saved platform branding and scoring weights." /><Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchSettings}>Try again</Button>}>{loadError || 'Platform settings are unavailable.'}</Alert></Box>;

  return (
    <Box>
      <PageHeader
        title="Platform Settings"
        subtitle="Configure institution branding and the weights used by resume review and dashboard scoring."
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
                Used as the institution label in placement reporting.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                    Institution Name
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    required
                    inputProps={{ maxLength: 160 }}
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
                    AI Provider
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    disabled
                    value={settings.aiProvider}
                    helperText={settings.aiProvider?.includes('configured') && !settings.aiProvider?.includes('not configured')
                      ? `AI requests use the server-side ${settings.aiModel || 'selected model'} configuration. API keys are never shown here.`
                      : 'Add the selected provider API key to the backend environment and restart the server to enable AI analysis.'}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                    Email Delivery
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    disabled
                    value={settings.emailDelivery?.mode === 'smtp'
                      ? `SMTP · ${String(settings.emailDelivery.state || 'checking').replace(/_/g, ' ')}`
                      : settings.emailDelivery?.mode === 'console'
                        ? 'Local development console'
                        : `Unavailable · ${settings.emailDelivery?.state || 'not configured'}`}
                    helperText={settings.emailDelivery?.mode === 'smtp'
                      ? ['connection_failed', 'delivery_failed', 'misconfigured'].includes(settings.emailDelivery.state)
                        ? 'SMTP is configured, but the latest connection or send failed. Review the backend terminal and provider settings.'
                        : 'Verification and password-reset messages use backend SMTP. Credentials remain server-side.'
                      : settings.emailDelivery?.mode === 'console'
                        ? 'Configure SMTP to send messages to real inboxes. Local links are written to the backend terminal.'
                        : 'Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, and APP_BASE_URL in the backend environment.'}
                  />
                </Box>
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.05rem', color: colors.ink, mb: 1 }}>
                Rule-based Text Fallback Weights (%)
              </Typography>
              <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mb: 2.5 }}>
                These settings apply only to the transparent text-analysis fallback when AI review is unavailable. They do not change AI-generated scores.
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  ['resumeFormatting', 'Text length & structure'],
                  ['keywordDensity', 'Listed technical skills'],
                  ['sectionIntegrity', 'Resume section signals'],
                  ['impactActionVerbs', 'Metrics & impact signals'],
                ].map(([key, label]) => (
                  <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.84375rem', fontWeight: 600 }}>{label}</Typography>
                    <TextField
                      size="small"
                      type="number"
                      inputProps={{ min: 0, max: 100, step: 1 }}
                      value={settings.atsWeights[key]}
                      onChange={(event) => updateWeight('atsWeights', key, event.target.value)}
                      sx={{ width: 90 }}
                    />
                  </Box>
                ))}
                <Alert severity={Math.abs(atsTotal - 100) < 0.000001 ? 'success' : 'warning'}>
                  Fallback total: {atsTotal}% (must equal 100%)
                </Alert>
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
                    AI Resume Review Weight:
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={settings.compositeWeights.resumeScoreWeight}
                    inputProps={{ min: 0, max: 100, step: 1 }}
                    onChange={(e) => updateWeight('compositeWeights', 'resumeScoreWeight', e.target.value)}
                    sx={{ width: 90 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.84375rem', fontWeight: 600 }}>
                    Interview Practice Weight:
                  </Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={settings.compositeWeights.mockInterviewWeight}
                    inputProps={{ min: 0, max: 100, step: 1 }}
                    onChange={(e) => updateWeight('compositeWeights', 'mockInterviewWeight', e.target.value)}
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
                    inputProps={{ min: 0, max: 100, step: 1 }}
                    onChange={(e) => updateWeight('compositeWeights', 'skillAlignmentWeight', e.target.value)}
                    sx={{ width: 90 }}
                  />
                </Box>

                <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: colors.surfaceSubtle, border: `1px solid ${colors.borderLight}`, mt: 1 }}>
                  <Typography variant="caption" sx={{ color: Math.abs(compositeTotal - 100) < 0.000001 ? colors.inkSecondary : colors.error }}>
                    Composite total: {compositeTotal}% (must equal 100%)
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Submit */}
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button type="submit" variant="contained" disabled={saving || !weightsValid} sx={{ px: 3, py: 1 }}>
              {saving ? 'Saving...' : 'Save Configuration Changes'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default PlatformSettingsPage;
