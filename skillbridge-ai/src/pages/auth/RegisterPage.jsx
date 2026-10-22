import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  MenuItem,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  Grid,
} from '@mui/material';
import { Eye, EyeOff, GraduationCap, Check, X } from 'lucide-react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/theme';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: 'student',
    name: '',
    email: '',
    college: 'Chennai Institute of Technology',
    department: 'Computer Science and Engineering',
    batchYear: '2025',
    targetRole: 'Full Stack Engineer',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const departments = [
    'Computer Science and Engineering',
    'Information Technology',
    'Artificial Intelligence & Data Science',
    'Electronics and Communication',
    'Electrical and Electronics',
    'Mechanical Engineering',
  ];

  const targetRoles = [
    'Full Stack Engineer',
    'Frontend Specialist (React)',
    'Backend Engineer (Node/Java)',
    'DevOps & Cloud Associate',
    'Data Analyst / BI Engineer',
    'QA & Automation Engineer',
  ];

  // Password requirement checks
  const pwd = formData.password;
  const hasMinLength = pwd.length >= 8;
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  const isPasswordStrong = hasMinLength && hasUppercase && hasNumber && hasSpecial;
  const passwordsMatch = pwd && formData.confirmPassword && pwd === formData.confirmPassword;

  const isEmailValid = Boolean(formData.email && /\S+@\S+\.\S+/.test(formData.email));
  const isNameValid = Boolean(formData.name.trim().length >= 3);

  const isFormValid =
    isNameValid &&
    isEmailValid &&
    isPasswordStrong &&
    passwordsMatch &&
    formData.department;

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleBlur = (field) => () => {
    setTouched({ ...touched, [field]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!isFormValid) return;

    setLoading(true);
    setFormError('');

    try {
      await register(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.bg,
        px: 2,
        py: 6,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 540 }}>
        {/* Header */}
        <Box sx={{ mb: 3.5, textAlign: 'left' }}>
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.5,
              textDecoration: 'none',
              color: 'inherit',
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                backgroundColor: colors.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <GraduationCap size={20} strokeWidth={2.2} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 700,
                fontSize: '1.25rem',
                letterSpacing: '-0.02em',
              }}
            >
              SkillBridge <span style={{ color: colors.accent }}>AI</span>
            </Typography>
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: colors.ink,
              mb: 0.75,
              letterSpacing: '-0.02em',
            }}
          >
            Create student or staff profile
          </Typography>
          <Typography variant="body2" sx={{ color: colors.inkSecondary }}>
            Set up your placement profile to unlock AI ATS analysis, skill roadmaps, and campus drive tracking.
          </Typography>
        </Box>

        {/* Card */}
        <Card sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 2 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2.5, fontSize: '0.8125rem' }}>
              {formError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              {/* Account Type */}
              <Grid item xs={12}>
                <Typography component="label" htmlFor="register-role" variant="body2" sx={{ display: 'block', fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                  Register as
                </Typography>
                <TextField
                  id="register-role"
                  select
                  fullWidth
                  value={formData.role}
                  onChange={handleChange('role')}
                >
                  <MenuItem value="student">Student / Fresh Graduate</MenuItem>
                  <MenuItem value="coordinator">Placement Coordinator / Officer</MenuItem>
                  <MenuItem value="mentor">Industry / Alumni Mentor</MenuItem>
                </TextField>
              </Grid>

              {/* Full Name */}
              <Grid item xs={12} sm={6}>
                <Typography component="label" htmlFor="register-name" variant="body2" sx={{ display: 'block', fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                  Full name
                </Typography>
                <TextField
                  id="register-name"
                  fullWidth
                  placeholder="e.g. Aarthi Raman"
                  value={formData.name}
                  onChange={handleChange('name')}
                  onBlur={handleBlur('name')}
                  error={touched.name && !isNameValid}
                  helperText={touched.name && !isNameValid ? 'Please enter your full name' : ''}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12} sm={6}>
                <Typography component="label" htmlFor="register-email" variant="body2" sx={{ display: 'block', fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                  College or personal email
                </Typography>
                <TextField
                  id="register-email"
                  fullWidth
                  placeholder="e.g. aarthi.r@cit.edu.in"
                  value={formData.email}
                  onChange={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email && !isEmailValid}
                  helperText={touched.email && !isEmailValid ? 'Valid email required' : ''}
                />
              </Grid>

              {/* Department */}
              <Grid item xs={12} sm={8}>
                <Typography component="label" htmlFor="register-department" variant="body2" sx={{ display: 'block', fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                  Branch / Department
                </Typography>
                <TextField
                  id="register-department"
                  select
                  fullWidth
                  value={formData.department}
                  onChange={handleChange('department')}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Batch Year */}
              <Grid item xs={12} sm={4}>
                <Typography component="label" htmlFor="register-batch" variant="body2" sx={{ display: 'block', fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                  Passing batch
                </Typography>
                <TextField
                  id="register-batch"
                  select
                  fullWidth
                  value={formData.batchYear}
                  onChange={handleChange('batchYear')}
                >
                  <MenuItem value="2024">2024 (Graduated)</MenuItem>
                  <MenuItem value="2025">2025 (Final Year)</MenuItem>
                  <MenuItem value="2026">2026 (Third Year)</MenuItem>
                  <MenuItem value="2027">2027 (Second Year)</MenuItem>
                </TextField>
              </Grid>

              {/* Target Role */}
              <Grid item xs={12}>
                <Typography component="label" htmlFor="register-target-role" variant="body2" sx={{ display: 'block', fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                  Target placement role
                </Typography>
                <TextField
                  id="register-target-role"
                  select
                  fullWidth
                  value={formData.targetRole}
                  onChange={handleChange('targetRole')}
                >
                  {targetRoles.map((roleOption) => (
                    <MenuItem key={roleOption} value={roleOption}>
                      {roleOption}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Password */}
              <Grid item xs={12} sm={6}>
                <Typography component="label" htmlFor="register-password" variant="body2" sx={{ display: 'block', fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                  Password
                </Typography>
                <TextField
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange('password')}
                  onBlur={handleBlur('password')}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          aria-label="toggle password visibility"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Confirm Password */}
              <Grid item xs={12} sm={6}>
                <Typography component="label" htmlFor="register-confirm-password" variant="body2" sx={{ display: 'block', fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                  Confirm password
                </Typography>
                <TextField
                  id="register-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  error={touched.confirmPassword && !passwordsMatch}
                  helperText={touched.confirmPassword && !passwordsMatch ? 'Passwords do not match' : ''}
                />
              </Grid>

              {/* Real Password Strength Checklist */}
              {formData.password && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      backgroundColor: colors.surfaceSubtle,
                      border: `1px solid ${colors.borderLight}`,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600, color: colors.inkSecondary, display: 'block', mb: 0.75 }}>
                      Password requirements:
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
                      {[
                        { label: '8+ characters', met: hasMinLength },
                        { label: '1 uppercase letter', met: hasUppercase },
                        { label: '1 number', met: hasNumber },
                        { label: '1 special symbol (!@#)', met: hasSpecial },
                      ].map((item, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          {item.met ? (
                            <Check size={12} color={colors.success} strokeWidth={3} />
                          ) : (
                            <X size={12} color={colors.inkTertiary} strokeWidth={2} />
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: '0.6875rem',
                              color: item.met ? colors.success : colors.inkSecondary,
                              fontWeight: item.met ? 600 : 400,
                            }}
                          >
                            {item.label}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Grid>
              )}

              {/* Submit */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading || !isFormValid}
                  sx={{ py: 1.1, fontSize: '0.875rem' }}
                >
                  {loading ? 'Creating account...' : 'Create account & continue'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Card>

        {/* Footer */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: colors.inkSecondary, fontSize: '0.84375rem' }}>
            Already have an account?{' '}
            <Link
              component={RouterLink}
              to="/login"
              sx={{ color: colors.accent, fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Sign in
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;
