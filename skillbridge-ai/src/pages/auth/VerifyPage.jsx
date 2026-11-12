import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Box, Card, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { CheckCircle2, XCircle } from 'lucide-react';
import { colors } from '../../theme/theme';
import authService from '../../services/authService';

export const VerifyPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Validating your email verification token...');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const delivery = searchParams.get('delivery');
    if (!token) {
      if (email) {
        setStatus(delivery === 'unavailable' ? 'delivery_error' : 'awaiting_email');
        setMessage(delivery === 'unavailable'
          ? 'Your account was created, but its verification email could not be delivered. Check the email setup or resend the link.'
          : delivery === 'console'
            ? 'In local development, the verification link is printed in the backend terminal.'
            : `A verification link was sent to ${email}. Open it to activate your account.`);
      } else {
        setStatus('error');
        setMessage('No verification token or account email was provided.');
      }
      return;
    }

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    fetch(`${API_BASE}/auth/verify/${token}`)
      .then(async (r) => {
        const data = await r.json();
        if (r.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully! You can now log in.');
          setTimeout(() => navigate('/login'), 2500);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification token is invalid or has expired.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Network error connecting to verification server.');
      });
  }, [searchParams, navigate]);

  const handleResend = async () => {
    const email = searchParams.get('email');
    if (!email) return;
    setResending(true);
    try {
      const response = await authService.resendVerification(email);
      const deliveryMode = response.data?.deliveryMode;
      setStatus(deliveryMode === 'unavailable' ? 'delivery_error' : 'awaiting_email');
      setMessage(deliveryMode === 'console'
        ? 'In local development, the verification link is printed in the backend terminal.'
        : deliveryMode === 'unavailable'
          ? 'Email delivery is not configured. Contact the platform administrator.'
          : response.data?.message || 'If the account is awaiting verification, a new link has been sent. Check your inbox.');
    } catch (error) {
      setStatus('delivery_error');
      setMessage(error.response?.data?.message || 'The verification email could not be sent. Check the backend SMTP settings and try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
        padding: 3,
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          width: '100%',
          padding: 4,
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" fontWeight={700} gutterBottom>
          🎓 SkillBridge Verification
        </Typography>

        {status === 'verifying' && (
          <Box sx={{ my: 4 }}>
            <CircularProgress size={44} sx={{ color: colors.primary }} />
            <Typography variant="body1" sx={{ mt: 2, color: colors.textSecondary }}>
              {message}
            </Typography>
          </Box>
        )}

        {(status === 'awaiting_email' || status === 'delivery_error') && (
          <Box sx={{ my: 3 }}>
            <Alert severity={status === 'delivery_error' ? 'error' : 'success'} sx={{ mb: 2, textAlign: 'left' }}>
              {message}
            </Alert>
            <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
              Verification address: <strong>{searchParams.get('email')}</strong>
            </Typography>
            <Button variant="contained" onClick={handleResend} disabled={resending} fullWidth>
              {resending ? 'Sending…' : 'Resend verification email'}
            </Button>
            <Button variant="text" onClick={() => navigate('/login')} sx={{ mt: 1 }} fullWidth>
              Return to sign in
            </Button>
          </Box>
        )}

        {status === 'success' && (
          <Box sx={{ my: 3 }}>
            <CheckCircle2 size={56} color={colors.success} style={{ margin: '0 auto' }} />
            <Typography variant="h6" fontWeight={600} sx={{ mt: 2, color: colors.success }}>
              Verification Complete!
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: colors.textSecondary }}>
              {message} Redirecting to login...
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{ mt: 3, backgroundColor: colors.primary }}
            >
              Go to Login
            </Button>
          </Box>
        )}

        {status === 'error' && (
          <Box sx={{ my: 3 }}>
            <XCircle size={56} color={colors.error} style={{ margin: '0 auto' }} />
            <Typography variant="h6" fontWeight={600} sx={{ mt: 2, color: colors.error }}>
              Verification Failed
            </Typography>
            <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
              {message}
            </Alert>
            <Button
              variant="outlined"
              onClick={() => navigate('/login')}
              sx={{ mt: 3 }}
            >
              Return to Login
            </Button>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default VerifyPage;
