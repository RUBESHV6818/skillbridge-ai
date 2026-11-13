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
import { Eye, EyeOff, GraduationCap, Check, X, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
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
    targetRole: '',
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
    'Mechanical Engineer',
    'Machine Learning Engineer',
    'Data Scientist',
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
      const result = await register(formData);
      if (result.user?.verified === false) {
        const params = new URLSearchParams({
          email: result.user.email,
          delivery: result.emailDelivery?.mode || 'unavailable',
        });
        navigate(`/verify?${params.toString()}`, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
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
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(320px, .88fr) minmax(560px, 1.12fr)' },
        background: 'linear-gradient(135deg, #f8f7fc 0%, #f1eff8 100%)',
        '@keyframes registerRise': {
          from: { opacity: 0, transform: 'translateY(18px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '@keyframes registerGlow': {
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
          position: 'relative', display: { xs: 'none', md: 'flex' }, minHeight: '100vh', overflow: 'hidden',
          alignItems: 'flex-end', p: { md: 4, lg: 6 }, color: '#fff',
          background: 'linear-gradient(145deg, #40358b 0%, #25204e 100%)',
          '&::before': { content: '""', position: 'absolute', zIndex: 1, width: 340, height: 340, borderRadius: '50%', top: '8%', right: '-14%', background: 'rgba(180,166,255,.18)', filter: 'blur(4px)', animation: 'registerGlow 8s ease-in-out infinite' },
          '&::after': { content: '""', position: 'absolute', zIndex: 1, inset: 0, background: 'linear-gradient(180deg, rgba(25,22,58,.03) 0%, rgba(25,22,58,.2) 35%, rgba(25,22,58,.93) 100%)' },
        }}
      >
        <Box component="svg" viewBox="0 0 1000 1100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .9, zIndex: 0 }}>
          <defs>
            <linearGradient id="register-sky" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#8177d6"/><stop offset="1" stopColor="#37306e"/></linearGradient>
            <linearGradient id="register-building" x1="0" y1="0" x2=".9" y2="1"><stop stopColor="#f3edff"/><stop offset="1" stopColor="#a9a2d7"/></linearGradient>
            <linearGradient id="register-ground" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#776cae"/><stop offset="1" stopColor="#342d68"/></linearGradient>
          </defs>
          <rect width="1000" height="1100" fill="url(#register-sky)"/><circle cx="770" cy="235" r="126" fill="#fff4cf" opacity=".48"/><circle cx="770" cy="235" r="178" fill="#fff4cf" opacity=".11"/>
          <path d="M0 555Q210 460 390 570T760 540T1100 570V1100H0Z" fill="#615897" opacity=".5"/><path d="M98 860V422L500 245 902 422V860Z" fill="url(#register-building)" opacity=".92"/><path d="m58 432 442-206 442 206-23 28-419-181-419 181Z" fill="#fff8e8"/>
          <rect x="137" y="454" width="726" height="22" fill="#8178b5" opacity=".65"/>{[0,1,2,3,4].map((i)=><g key={i}><rect x={171+i*139} y="496" width="47" height="318" rx="20" fill="#fffaf0" opacity=".9"/><rect x={181+i*139} y="516" width="27" height="270" rx="12" fill="#8178bd" opacity=".56"/></g>)}
          <rect x="120" y="816" width="760" height="26" fill="#f8f0dd"/><path d="M0 842H1000V1100H0Z" fill="url(#register-ground)"/><path d="M370 1100 453 842H547L630 1100Z" fill="#d7d1f1" opacity=".4"/><path d="M112 883H888M185 930H815M260 980H740" stroke="#f5f0ff" strokeWidth="5" opacity=".24"/>
          {[105,870].map((x)=><g key={x} opacity=".82"><path d={`M${x} 837v-96`} stroke="#242044" strokeWidth="9"/><circle cx={x} cy="718" r="41" fill="#a9c6bf"/><circle cx={x-22} cy="740" r="31" fill="#80a99e"/><circle cx={x+24} cy="743" r="30" fill="#739b91"/></g>)}
          <g opacity=".8"><circle cx="334" cy="857" r="14" fill="#f6c7a5"/><path d="M316 876q18-17 36 0v42h-36Z" fill="#e6b775"/><path d="m322 917-9 28m25-28 10 28" stroke="#28234f" strokeWidth="8" strokeLinecap="round"/></g>
          <g opacity=".78"><circle cx="688" cy="862" r="14" fill="#efc2a5"/><path d="M670 881q18-17 36 0v42h-36Z" fill="#bcb7ef"/><path d="m676 922-9 28m25-28 10 28" stroke="#28234f" strokeWidth="8" strokeLinecap="round"/></g>
          <g fill="#fff" opacity=".58"><circle cx="130" cy="180" r="4"/><circle cx="259" cy="293" r="3"/><circle cx="911" cy="344" r="4"/><circle cx="630" cy="155" r="3"/></g>
        </Box>
        <Box sx={{ position: 'relative', zIndex: 2, maxWidth: 560, animation: 'registerRise .8s ease-out both' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2.5, px: 1.5, py: .8, borderRadius: 99, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.22)', backdropFilter: 'blur(10px)' }}><Sparkles size={16}/><Typography variant="caption" sx={{ color: 'inherit', fontWeight: 600, letterSpacing: '.04em' }}>A MORE PERSONAL WAY TO PREPARE</Typography></Box>
          <Typography sx={{ color: '#fff', fontFamily: "'Playfair Display', Georgia, serif", fontSize: { md: '2.65rem', lg: '3.35rem' }, lineHeight: 1.08, fontWeight: 700, letterSpacing: '-.035em', mb: 2 }}>Create your profile. Make your next move count.</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,.82)', fontSize: '1rem', lineHeight: 1.75, maxWidth: 470, mb: 3 }}>A few details help SkillBridge shape resume insights, skill plans, and interview practice around your goals.</Typography>
          <Box sx={{ display: 'grid', gap: 1.3 }}>{['Set the role you want to work toward', 'See strengths and skills to build', 'Practice for real placement rounds'].map((item)=><Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1.1, color: 'rgba(255,255,255,.92)' }}><CheckCircle2 size={17}/><Typography variant="body2" sx={{ color: 'inherit' }}>{item}</Typography></Box>)}</Box>
          <Typography variant="caption" sx={{ display: 'block', mt: 5, color: 'rgba(255,255,255,.62)' }}>A clearer start for the career you’re building.</Typography>
        </Box>
      </Box>

      <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', px: { xs: 2, sm: 4, lg: 5 }, py: { xs: 4, sm: 5 }, overflowY: 'auto' }}>
      <Box sx={{ width: '100%', maxWidth: 680, animation: 'registerRise .65s .08s ease-out both' }}>
        {/* Header */}
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
              fontSize: { xs: '2rem', sm: '2.2rem' },
              fontWeight: 700,
              color: colors.ink,
              mb: 0.9,
              letterSpacing: '-0.035em',
              lineHeight: 1.15,
            }}
          >
            Create your SkillBridge account
          </Typography>
          <Typography variant="body1" sx={{ color: colors.inkSecondary, lineHeight: 1.65 }}>
            Set up your profile for resume insights, role-focused skill plans, and interview practice.
          </Typography>
        </Box>

        {/* Card */}
        <Card sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3, border: '1px solid rgba(78, 65, 171, .10)', boxShadow: '0 24px 70px rgba(43, 35, 100, .10)', background: 'rgba(255,255,255,.96)' }}>
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
                  <MenuItem value="">I haven’t chosen a target role yet</MenuItem>
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
    </Box>
  );
};

export default RegisterPage;
