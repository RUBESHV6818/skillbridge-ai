import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Alert,
  Avatar,
  FormControlLabel,
  Switch,
  Skeleton,
} from '@mui/material';
import {
  User,
  GraduationCap,
  Save,
  CheckCircle2,
  Mail,
  Phone,
  Linkedin,
  Github,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import { colors } from '../../theme/theme';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    college: user?.college || '',
    batchYear: user?.batchYear ?? '',
    cgpa: user?.cgpa ?? '',
    targetRole: user?.targetRole || '',
    targetRoleConfirmed: Boolean(user?.targetRoleConfirmed),
    linkedin: user?.linkedin || '',
    github: user?.github || '',
  });

  const [notifications, setNotifications] = useState(user?.notificationPreferences || {
    driveAlerts: true, mentorComments: true, weeklyRoadmapReminders: false,
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let active = true;
    authService.getProfile().then(({ data }) => {
      if (!active) return;
      setFormData({
        name: data.name || '', email: data.email || '', phone: data.phone || '',
        department: data.department || '', college: data.college || '',
        batchYear: data.batchYear ?? '', cgpa: data.cgpa ?? '',
        targetRole: data.targetRole || '', targetRoleConfirmed: Boolean(data.targetRoleConfirmed),
        linkedin: data.linkedin || '', github: data.github || '',
      });
      setNotifications(data.notificationPreferences || {
        driveAlerts: true, mentorComments: true, weeklyRoadmapReminders: false,
      });
      updateUser(data);
      setErrorMessage('');
    }).catch((error) => {
      if (active) setErrorMessage(error.response?.data?.message || 'Could not load your profile. Please refresh and try again.');
    }).finally(() => {
      if (active) setLoadingProfile(false);
    });
    return () => { active = false; };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    try {
      const { data } = await authService.updateProfile({
        ...formData,
        batchYear: formData.batchYear === '' ? null : Number(formData.batchYear),
        cgpa: formData.cgpa === '' ? null : Number(formData.cgpa),
        notificationPreferences: notifications,
      });
      updateUser(data);
      setFormData((current) => ({ ...current, ...data }));
      setNotifications(data.notificationPreferences);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Student Profile & Settings"
        subtitle="Manage your profile details and saved notification preferences."
      />

      {savedSuccess && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 1.5, fontSize: '0.84375rem' }}>
          Profile and placement preferences saved successfully.
        </Alert>
      )}

      {errorMessage && <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }}>{errorMessage}</Alert>}

      {loadingProfile && <Box sx={{ display: 'grid', gap: 2 }}><Skeleton variant="rounded" height={180} /><Skeleton variant="rounded" height={220} /></Box>}

      {!loadingProfile && <form onSubmit={handleSave}>
        <Grid container spacing={3.5}>
          {/* Left Column: Personal & Academic Info */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, pb: 2.5, borderBottom: `1px solid ${colors.borderLight}` }}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    backgroundColor: colors.accentLight,
                    color: colors.accent,
                    border: `1px solid ${colors.accentBorder}`,
                  }}
                >
                  {(formData.name || 'S').split(/\s+/).map((part) => part[0]).join('').toUpperCase().slice(0, 2)}
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.2rem', color: colors.ink }}>
                    {formData.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                    {formData.batchYear ? `Graduation year: ${formData.batchYear}` : 'Graduation year not set'}{formData.department ? ` • ${formData.department}` : ''}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                    Full Name
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    required
                    inputProps={{ maxLength: 100 }}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                    Academic College Email
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    disabled
                    value={formData.email}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                    Department / Branch
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    inputProps={{ maxLength: 120 }}
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                    Graduation Year
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    inputProps={{ min: 1900, max: 2200, step: 1 }}
                    value={formData.batchYear}
                    onChange={(e) => setFormData({ ...formData, batchYear: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                    Current CGPA
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    inputProps={{ min: 0, max: 10, step: 0.01 }}
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                    Target Placement Role
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.targetRole}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value, targetRoleConfirmed: false })}
                  />
                  <Typography variant="caption" sx={{ display: 'block', color: colors.inkSecondary, mt: 0.5 }}>
                    Skill coverage is compared with this role. Leave it unconfirmed until you want a role-specific analysis.
                  </Typography>
                  <FormControlLabel
                    control={(
                      <Switch
                        checked={Boolean(formData.targetRoleConfirmed)}
                        disabled={!formData.targetRole.trim()}
                        onChange={(event) => setFormData({ ...formData, targetRoleConfirmed: event.target.checked })}
                      />
                    )}
                    label="Use this role for skill analysis"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                    LinkedIn Profile
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                    GitHub Profile
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    startIcon={<Save size={15} />}
                    sx={{ px: 3, py: 1 }}
                  >
                    {saving ? 'Saving...' : 'Save Profile Changes'}
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          {/* Right Column: Preferences & Mentorship */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.05rem', color: colors.ink, mb: 1 }}>
                Notification Preferences
              </Typography>
              <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mb: 2 }}>
                Placement and mentor alerts appear in Notifications. Weekly roadmap reminders are sent by email on Mondays at 9:00 AM India time.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.driveAlerts}
                      onChange={(e) =>
                        setNotifications({ ...notifications, driveAlerts: e.target.checked })
                      }
                      size="small"
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                      Placement Tracker Updates
                    </Typography>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications.mentorComments}
                      onChange={(e) =>
                        setNotifications({ ...notifications, mentorComments: e.target.checked })
                      }
                      size="small"
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                      Mentor Feedback Notifications
                    </Typography>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(notifications.weeklyRoadmapReminders)}
                      onChange={(e) => setNotifications({ ...notifications, weeklyRoadmapReminders: e.target.checked })}
                      size="small"
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                      Weekly Roadmap Goal Reminders (Email)
                    </Typography>
                  }
                />
              </Box>
            </Card>

            <Card sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.05rem', color: colors.ink, mb: 1 }}>
                Mentorship
              </Typography>
              <Typography variant="caption" sx={{ color: colors.inkSecondary, lineHeight: 1.5, display: 'block' }}>
                A mentor has not been assigned to this account yet. Mentor assignments will appear here when enabled by your placement coordinator.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </form>}
    </Box>
  );
};

export default ProfilePage;
