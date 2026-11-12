import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
} from '@mui/material';
import { GraduationCap, ArrowLeft, MailCheck } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { colors } from '../../theme/theme';
import authService from '../../services/authService';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isEmailValid = Boolean(email && /\S+@\S+\.\S+/.test(email));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!isEmailValid) return;

    setLoading(true);
    setErrorMessage('');
    try {
      const res = await authService.forgotPassword(email);
      setSuccessMessage(res.data?.message || 'Password reset link sent.');
      setDeliveryMode(res.data?.deliveryMode || 'smtp');
      setSubmitted(true);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Could not request a reset link. Please try again.');
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
        {/* Brand header */}
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
            Reset your password
          </Typography>
          <Typography variant="body2" sx={{ color: colors.inkSecondary }}>
            Enter your registered email address. If an account exists, we’ll send a secure reset link.
          </Typography>
        </Box>

        <Card sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 2 }}>
          {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
          {submitted ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: colors.successBg,
                  color: colors.success,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <MailCheck size={24} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontSize: '1.15rem' }}>
                {deliveryMode === 'console' ? 'Reset link ready' : deliveryMode === 'unavailable' ? 'Email delivery unavailable' : 'Check your inbox'}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.inkSecondary, mb: 3, lineHeight: 1.6 }}>
                {successMessage}
              </Typography>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                fullWidth
                sx={{ py: 1 }}
              >
                Return to sign in
              </Button>
            </Box>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <Box sx={{ mb: 2.5 }}>
                <Typography
                  component="label"
                  htmlFor="reset-email"
                  variant="body2"
                  sx={{ display: 'block', fontWeight: 600, mb: 0.75, fontSize: '0.8125rem' }}
                >
                  Email address
                </Typography>
                <TextField
                  id="reset-email"
                  fullWidth
                  placeholder="e.g. aarthi.raman@cit.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(true)}
                  error={touched && !isEmailValid}
                  helperText={touched && !isEmailValid ? 'Please enter a valid email address' : ''}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || !isEmailValid}
                sx={{ py: 1.1, fontSize: '0.875rem', mb: 2 }}
              >
                {loading ? 'Dispatching link...' : 'Send reset link'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    color: colors.inkSecondary,
                    textDecoration: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    '&:hover': { color: colors.ink, textDecoration: 'underline' },
                  }}
                >
                  <ArrowLeft size={14} /> Back to sign in
                </Link>
              </Box>
            </form>
          )}
        </Card>
      </Box>
    </Box>
  );
};

export default ForgotPasswordPage;
