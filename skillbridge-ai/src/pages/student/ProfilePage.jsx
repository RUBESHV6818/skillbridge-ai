import React, { useState } from 'react';
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
import { colors } from '../../theme/theme';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || 'Aarthi Raman',
    email: user?.email || 'aarthi.raman@cit.edu.in',
    phone: user?.phone || '+91 98401 22849',
    department: user?.department || 'Computer Science and Engineering',
    college: user?.college || 'Chennai Institute of Technology',
    batchYear: user?.batchYear || 2025,
    cgpa: user?.cgpa || 8.42,
    targetRole: user?.targetRole || 'Full Stack Engineer',
    linkedin: user?.linkedin || 'linkedin.com/in/aarthi-raman-dev',
    github: user?.github || 'github.com/aarthiraman',
  });

  const [notifications, setNotifications] = useState({
    driveAlerts: true,
    mentorComments: true,
    weeklyRoadmapReminders: false,
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 400);
  };

  return (
    <Box>
      <PageHeader
        title="Student Profile & Settings"
        subtitle="Manage your academic credentials, campus placement target roles, and mentor contact preferences."
      />

      {savedSuccess && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 1.5, fontSize: '0.84375rem' }}>
          Profile and placement preferences saved successfully.
        </Alert>
      )}

      <form onSubmit={handleSave}>
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
                  {user?.avatar || 'AR'}
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.2rem', color: colors.ink }}>
                    {formData.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.inkSecondary }}>
                    Roll No: 211421104002 • Final Year B.Tech • CIT Chennai
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
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
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
                Configure email alerts for campus recruitment milestones.
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
                      Campus Drive & Slot Announcements
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
                      checked={notifications.weeklyRoadmapReminders}
                      onChange={(e) =>
                        setNotifications({ ...notifications, weeklyRoadmapReminders: e.target.checked })
                      }
                      size="small"
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                      Weekly Roadmap Goal Reminders
                    </Typography>
                  }
                />
              </Box>
            </Card>

            <Card sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '1.05rem', color: colors.ink, mb: 1 }}>
                Assigned Career Mentor
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: colors.ink }}>
                Priya Sundaram
              </Typography>
              <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', mb: 1.5 }}>
                Staff Frontend Engineer • Freshworks Inc.
              </Typography>
              <Typography variant="caption" sx={{ color: colors.inkSecondary, lineHeight: 1.5, display: 'block' }}>
                CIT Alumni Mentor for final-year candidates targeting Product Tier-1 SDE roles.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default ProfilePage;
