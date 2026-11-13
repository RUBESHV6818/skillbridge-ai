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
import { Eye, EyeOff, GraduationCap, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/theme';
import authService, { MOCK_USERS } from '../../services/authService';

export const LoginPage = () => {
  const { login, demoLogin } = useAuth();
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
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const needsEmailVerification = /verify your email/i.test(formError);

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
      await demoLogin(roleKey);
      const targetPath =
        persona.role === 'coordinator' ? '/coordinator/cohort' :
        persona.role === 'mentor' ? '/mentor/students' :
        persona.role === 'admin' ? '/admin/users' :
        '/dashboard';
      navigate(targetPath, { replace: true });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Could not sign in to the demo account. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingVerification(true);
    setVerificationMessage('');
    try {
      const response = await authService.resendVerification(email.trim());
      setVerificationMessage(response.data?.deliveryMode === 'console'
        ? 'In local development, the verification link is printed in the backend terminal.'
        : response.data?.deliveryMode === 'unavailable'
          ? 'Email delivery is not configured. Contact the platform administrator.'
          : response.data?.message || 'If this account needs verification, a new email has been sent.');
    } catch (error) {
      setVerificationMessage(error.response?.data?.message || 'Could not send the verification email. Check the address and try again.');
    } finally {
      setResendingVerification(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(340px, 0.92fr) minmax(520px, 1.08fr)' },
        background: 'linear-gradient(135deg, #f8f7fc 0%, #f1eff8 100%)',
        '@keyframes loginRise': {
          from: { opacity: 0, transform: 'translateY(18px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '@keyframes loginGlow': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -12px, 0)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          '& *, & *::before, & *::after': { animationDuration: '0.01ms !important', animationIterationCount: '1 !important' },
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: { xs: 'none', md: 'flex' },
          minHeight: '100vh',
          overflow: 'hidden',
          alignItems: 'flex-end',
          p: { md: 5, lg: 7 },
          color: '#fff',
          background: 'linear-gradient(145deg, #40358b 0%, #25204e 100%)',
          '&::after': {
            content: '""', position: 'absolute', inset: 0, zIndex: 1,
            background: 'linear-gradient(180deg, rgba(25, 22, 58, .04) 0%, rgba(25, 22, 58, .14) 36%, rgba(25, 22, 58, .92) 100%)',
          },
          '&::before': {
            content: '""', position: 'absolute', zIndex: 1, width: 360, height: 360, borderRadius: '50%',
            top: '10%', right: '-14%', background: 'rgba(180, 166, 255, .17)', filter: 'blur(4px)',
            animation: 'loginGlow 8s ease-in-out infinite',
          },
        }}
      >
        <Box component="svg" viewBox="0 0 1000 1100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.9, zIndex: 0 }}>
          <defs>
            <linearGradient id="campus-sky" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#8177d6" /><stop offset="1" stopColor="#37306e" /></linearGradient>
            <linearGradient id="campus-building" x1="0" y1="0" x2="0.9" y2="1"><stop stopColor="#f3edff" /><stop offset="1" stopColor="#a9a2d7" /></linearGradient>
            <linearGradient id="campus-ground" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#776cae" /><stop offset="1" stopColor="#342d68" /></linearGradient>
          </defs>
          <rect width="1000" height="1100" fill="url(#campus-sky)" />
          <circle cx="770" cy="235" r="126" fill="#fff4cf" opacity=".48" />
          <circle cx="770" cy="235" r="178" fill="#fff4cf" opacity=".11" />
          <path d="M0 555 Q210 460 390 570 T760 540 T1100 570 V1100 H0Z" fill="#615897" opacity=".5" />
          <path d="M98 860V422L500 245 902 422V860Z" fill="url(#campus-building)" opacity=".91" />
          <path d="M58 432 500 226 942 432 919 460 500 279 81 460Z" fill="#fff8e8" />
          <rect x="137" y="454" width="726" height="22" fill="#8178b5" opacity=".65" />
          {[0, 1, 2, 3, 4].map((column) => <g key={column}>
            <rect x={171 + column * 139} y="496" width="47" height="318" rx="20" fill="#fffaf0" opacity=".9" />
            <rect x={181 + column * 139} y="516" width="27" height="270" rx="12" fill="#8178bd" opacity=".56" />
          </g>)}
          <rect x="120" y="816" width="760" height="26" fill="#f8f0dd" />
          <path d="M0 842H1000V1100H0Z" fill="url(#campus-ground)" />
          <path d="M370 1100 453 842H547L630 1100Z" fill="#d7d1f1" opacity=".4" />
          <path d="M112 883H888M185 930H815M260 980H740" stroke="#f5f0ff" strokeWidth="5" opacity=".24" />
          {[105, 870].map((x) => <g key={x} opacity=".82">
            <path d={`M${x} 837v-96`} stroke="#242044" strokeWidth="9" />
            <circle cx={x} cy="718" r="41" fill="#a9c6bf" />
            <circle cx={x - 22} cy="740" r="31" fill="#80a99e" />
            <circle cx={x + 24} cy="743" r="30" fill="#739b91" />
          </g>)}
          <g opacity=".8"><circle cx="334" cy="857" r="14" fill="#f6c7a5" /><path d="M316 876q18-17 36 0v42h-36Z" fill="#e6b775" /><path d="m322 917-9 28m25-28 10 28" stroke="#28234f" strokeWidth="8" strokeLinecap="round" /></g>
          <g opacity=".78"><circle cx="688" cy="862" r="14" fill="#efc2a5" /><path d="M670 881q18-17 36 0v42h-36Z" fill="#bcb7ef" /><path d="m676 922-9 28m25-28 10 28" stroke="#28234f" strokeWidth="8" strokeLinecap="round" /></g>
          <g fill="#fff" opacity=".58"><circle cx="130" cy="180" r="4" /><circle cx="259" cy="293" r="3" /><circle cx="911" cy="344" r="4" /><circle cx="630" cy="155" r="3" /><circle cx="375" cy="161" r="2" /></g>
        </Box>
        <Box sx={{ position: 'relative', zIndex: 2, maxWidth: 570, animation: 'loginRise .8s ease-out both' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2.5, px: 1.5, py: 0.8, borderRadius: 99, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.22)', backdropFilter: 'blur(10px)' }}>
            <Sparkles size={16} />
            <Typography variant="caption" sx={{ color: 'inherit', fontWeight: 600, letterSpacing: '.04em' }}>YOUR CAREER, WITH A CLEARER PATH</Typography>
          </Box>
          <Typography sx={{ color: '#fff', fontFamily: "'Playfair Display', Georgia, serif", fontSize: { md: '2.8rem', lg: '3.6rem' }, lineHeight: 1.08, fontWeight: 700, letterSpacing: '-.035em', mb: 2.25, textShadow: '0 2px 20px rgba(20, 17, 50, .2)' }}>
            Turn your next step into your next opportunity.
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,.82)', fontSize: '1.05rem', lineHeight: 1.75, maxWidth: 490, mb: 3.5 }}>
            Build confidence with AI resume insights, focused skill plans, interview practice, and a placement journey that stays organized.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
            {['Know your strengths', 'Practice with purpose', 'Track your progress'].map((label) => (
              <Box key={label} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8, borderRadius: 99, px: 1.35, py: 0.9, color: 'rgba(255,255,255,.92)', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.18)', backdropFilter: 'blur(8px)' }}>
                <CheckCircle2 size={15} />
                <Typography variant="caption" sx={{ color: 'inherit', fontWeight: 500 }}>{label}</Typography>
              </Box>
            ))}
          </Box>
          <Typography variant="caption" sx={{ display: 'block', mt: 6, color: 'rgba(255,255,255,.62)' }}>
            A thoughtful bridge between where you are and where you want to be.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', px: { xs: 2, sm: 4, lg: 6 }, py: { xs: 4, sm: 6 }, overflowY: 'auto' }}>
      <Box sx={{ width: '100%', maxWidth: 480, animation: 'loginRise .65s .08s ease-out both' }}>
        {/* Brand identity */}
        <Box sx={{ mb: 3, textAlign: 'left' }}>
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.5,
              textDecoration: 'none',
              color: 'inherit',
              mb: 2.5,
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
              fontSize: { xs: '2rem', sm: '2.25rem' },
              fontWeight: 700,
              color: colors.ink,
              mb: 0.9,
              letterSpacing: '-0.035em',
              lineHeight: 1.15,
            }}
          >
            Welcome back.
          </Typography>
          <Typography variant="body1" sx={{ color: colors.inkSecondary, lineHeight: 1.65 }}>
            Sign in and pick up where your career journey left off.
          </Typography>
        </Box>

        {/* Main Card */}
        <Card sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3, border: '1px solid rgba(78, 65, 171, .10)', boxShadow: '0 24px 70px rgba(43, 35, 100, .10)', background: 'rgba(255,255,255,.96)' }}>
          {formError && (
            <Alert severity="error" sx={{ mb: 2.5, fontSize: '0.8125rem' }}>
              {formError}
              {needsEmailVerification && (
                <Button size="small" onClick={handleResendVerification} disabled={resendingVerification || !/\S+@\S+\.\S+/.test(email)} sx={{ display: 'block', mt: 0.5 }}>
                  {resendingVerification ? 'Sending…' : 'Resend verification email'}
                </Button>
              )}
            </Alert>
          )}
          {verificationMessage && <Alert severity="info" sx={{ mb: 2 }}>{verificationMessage}</Alert>}

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
    </Box>
  );
};

export default LoginPage;
