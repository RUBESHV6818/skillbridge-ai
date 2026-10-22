import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Link,
  Alert,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Eye, EyeOff, GraduationCap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/theme';
import { MOCK_USERS } from '../../services/authService';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Validation & error states
  const [touched, setTouched] = useState({ email: false, password: false });
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailError = touched.email && (!email || !/\S+@\S+\.\S+/.test(email));
  const passwordError = touched.password && (!password || password.length < 6);
  const isFormValid = email && /\S+@\S+\.\S+/.test(email) && password && password.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!isFormValid) return;

    setLoading(true);
    setFormError('');

    try {
      const user = await login(email, password);
      const redirectPath = location.state?.from?.pathname || (
        user.role === 'coordinator' ? '/coordinator/cohort' :
        user.role === 'mentor' ? '/mentor/students' :
        user.role === 'admin' ? '/admin/users' :
        '/dashboard'
      );
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Invalid credentials. Please verify your college email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (roleKey) => {
    const persona = MOCK_USERS[roleKey];
    setEmail(persona.email);
    setPassword('PlacementReady#2025');
    setLoading(true);
    try {
      await login(persona.email, 'PlacementReady#2025');
      const targetPath =
        persona.role === 'coordinator' ? '/coordinator/cohort' :
        persona.role === 'mentor' ? '/mentor/students' :
        persona.role === 'admin' ? '/admin/users' :
        '/dashboard';
      navigate(targetPath, { replace: true });
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
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        {/* Brand identity */}
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
            Sign in to your account
          </Typography>
          <Typography variant="body2" sx={{ color: colors.inkSecondary }}>
            Enter your college or placement cell credentials to access your preparation dashboard.
          </Typography>
        </Box>

        {/* Main Card */}
        <Card sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 2 }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2.5, fontSize: '0.8125rem' }}>
              {formError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Box sx={{ mb: 2 }}>
              <Typography
                component="label"
                htmlFor="login-email"
                variant="body2"
                sx={{ display: 'block', fontWeight: 600, mb: 0.75, fontSize: '0.8125rem', color: colors.ink }}
              >
                College email address
              </Typography>
              <TextField
                id="login-email"
                fullWidth
                placeholder="e.g. aarthi.raman@cit.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched({ ...touched, email: true })}
                error={emailError}
                helperText={emailError ? 'Please enter a valid academic or professional email address' : ''}
              />
            </Box>

            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                <Typography
                  component="label"
                  htmlFor="login-password"
                  variant="body2"
                  sx={{ fontWeight: 600, fontSize: '0.8125rem', color: colors.ink }}
                >
                  Password
                </Typography>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  variant="caption"
                  sx={{ color: colors.accent, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  Forgot password?
                </Link>
              </Box>
              <TextField
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched({ ...touched, password: true })}
                error={passwordError}
                helperText={passwordError ? 'Password must be at least 6 characters' : ''}
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
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    size="small"
                    sx={{ color: colors.inkTertiary, '&.Mui-checked': { color: colors.accent } }}
                  />
                }
                label={<Typography variant="body2" sx={{ fontSize: '0.8125rem', color: colors.inkSecondary }}>Remember this device</Typography>}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || !isFormValid}
              sx={{ py: 1.1, fontSize: '0.875rem', mb: 2.5 }}
            >
              {loading ? 'Authenticating...' : 'Sign in to platform'}
            </Button>
          </form>

          {/* Quick Demo Personas Selector for Hackathon Reviewers */}
          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" sx={{ color: colors.inkTertiary, px: 1, fontSize: '0.6875rem' }}>
              OR SIGN IN AS DEMO PERSONA
            </Typography>
          </Divider>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleQuickDemoLogin('student')}
              sx={{
                textAlign: 'left',
                justifyContent: 'flex-start',
                py: 0.8,
                px: 1.25,
                fontSize: '0.75rem',
                borderColor: colors.borderLight,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: colors.ink }}>
                Aarthi Raman
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: colors.inkSecondary }}>
                Student (Final Yr)
              </Typography>
            </Button>

            <Button
              variant="outlined"
              size="small"
              onClick={() => handleQuickDemoLogin('coordinator')}
              sx={{
                textAlign: 'left',
                justifyContent: 'flex-start',
                py: 0.8,
                px: 1.25,
                fontSize: '0.75rem',
                borderColor: colors.borderLight,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: colors.ink }}>
                Prof. Soundararajan
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: colors.inkSecondary }}>
                Placement Cell
              </Typography>
            </Button>

            <Button
              variant="outlined"
              size="small"
              onClick={() => handleQuickDemoLogin('mentor')}
              sx={{
                textAlign: 'left',
                justifyContent: 'flex-start',
                py: 0.8,
                px: 1.25,
                fontSize: '0.75rem',
                borderColor: colors.borderLight,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: colors.ink }}>
                Priya Sundaram
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: colors.inkSecondary }}>
                Alumni Mentor
              </Typography>
            </Button>

            <Button
              variant="outlined"
              size="small"
              onClick={() => handleQuickDemoLogin('admin')}
              sx={{
                textAlign: 'left',
                justifyContent: 'flex-start',
                py: 0.8,
                px: 1.25,
                fontSize: '0.75rem',
                borderColor: colors.borderLight,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: colors.ink }}>
                Platform Admin
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: colors.inkSecondary }}>
                Full System Access
              </Typography>
            </Button>
          </Box>
        </Card>

        {/* Footer Link */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: colors.inkSecondary, fontSize: '0.84375rem' }}>
            New student or department coordinator?{' '}
            <Link
              component={RouterLink}
              to="/register"
              sx={{ color: colors.accent, fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Register here
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
