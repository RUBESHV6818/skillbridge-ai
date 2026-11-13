import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Box, Card, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { CheckCircle2, XCircle, GraduationCap, MailCheck, Sparkles } from 'lucide-react';
import { colors } from '../../theme/theme';
import authService from '../../services/authService';
import { API_BASE_URL } from '../../services/apiBaseUrl';

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

    fetch(`${API_BASE_URL}/auth/verify/${token}`)
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

  const statusTitle = {
    verifying: 'Confirming your email',
    awaiting_email: 'Check your inbox',
    delivery_error: 'Email delivery needs attention',
    success: 'You’re verified',
    error: 'This link needs attention',
  }[status];

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(340px, .92fr) minmax(520px, 1.08fr)' }, background: 'linear-gradient(135deg, #f8f7fc 0%, #f1eff8 100%)', '@keyframes verifyRise': { from: { opacity: 0, transform: 'translateY(18px)' }, to: { opacity: 1, transform: 'translateY(0)' } }, '@keyframes verifyFloat': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } }, '@media (prefers-reduced-motion: reduce)': { '& *, & *::before, & *::after': { animationDuration: '0.01ms !important', animationIterationCount: '1 !important' } } }}>
      <Box sx={{ position: 'relative', display: { xs: 'none', md: 'flex' }, minHeight: '100vh', alignItems: 'flex-end', overflow: 'hidden', p: { md: 5, lg: 7 }, color: '#fff', background: 'linear-gradient(145deg, #7770c8 0%, #40358b 55%, #25204e 100%)', '&::before': { content: '""', position: 'absolute', width: 380, height: 380, borderRadius: '50%', top: '7%', right: '-12%', background: 'rgba(225,218,255,.16)', filter: 'blur(2px)' }, '&::after': { content: '""', position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(25,22,58,.02) 0%, rgba(25,22,58,.08) 36%, rgba(25,22,58,.91) 100%)' } }}>
        <Box component="svg" viewBox="0 0 900 900" aria-hidden="true" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .94 }}>
          <defs><linearGradient id="verify-card" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff"/><stop offset="1" stopColor="#e8e5f7"/></linearGradient><linearGradient id="verify-envelope" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#f8f6ff"/><stop offset="1" stopColor="#c5c0e7"/></linearGradient></defs>
          <circle cx="690" cy="210" r="135" fill="#fff2c9" opacity=".3"/><circle cx="690" cy="210" r="185" fill="#fff2c9" opacity=".08"/>
          <path d="M0 570Q220 495 435 580T900 545V900H0Z" fill="#6a62a5" opacity=".55"/>
          <g style={{ animation: 'verifyFloat 5s ease-in-out infinite' }}><rect x="190" y="230" width="520" height="360" rx="34" fill="url(#verify-card)" opacity=".96"/><rect x="225" y="270" width="155" height="13" rx="6" fill="#b9b4d8"/><rect x="225" y="302" width="290" height="10" rx="5" fill="#d2cfe3"/><rect x="225" y="326" width="245" height="10" rx="5" fill="#d2cfe3"/><path d="M225 385h450v155H225z" fill="url(#verify-envelope)"/><path d="m225 393 225 139 225-139" fill="none" stroke="#aaa4d2" strokeWidth="13" strokeLinejoin="round"/><circle cx="635" cy="520" r="67" fill="#5145ad"/><path d="m603 520 22 22 44-48" fill="none" stroke="#fff" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round"/></g>
          <path d="M0 736H900V900H0Z" fill="#29245c" opacity=".45"/><g fill="#fff" opacity=".55"><circle cx="130" cy="180" r="4"/><circle cx="770" cy="368" r="4"/><circle cx="102" cy="420" r="3"/><circle cx="540" cy="150" r="3"/></g>
        </Box>
        <Box sx={{ position: 'relative', zIndex: 2, maxWidth: 560, animation: 'verifyRise .8s ease-out both' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2.5, px: 1.5, py: .8, borderRadius: 99, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.22)', backdropFilter: 'blur(10px)' }}><Sparkles size={16}/><Typography variant="caption" sx={{ color: 'inherit', fontWeight: 600, letterSpacing: '.04em' }}>A SECURE START TO YOUR JOURNEY</Typography></Box>
          <Typography sx={{ color: '#fff', fontFamily: "'Playfair Display', Georgia, serif", fontSize: { md: '2.8rem', lg: '3.6rem' }, lineHeight: 1.08, fontWeight: 700, letterSpacing: '-.035em', mb: 2 }}>One quick check, then you’re in.</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,.82)', fontSize: '1.05rem', lineHeight: 1.75, maxWidth: 480 }}>Confirm your email address to secure your account and continue setting up your career preparation space.</Typography>
        </Box>
      </Box>

      <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', px: { xs: 2, sm: 4, lg: 6 }, py: { xs: 4, sm: 6 } }}>
      <Box sx={{ width: '100%', maxWidth: 500, animation: 'verifyRise .65s .08s ease-out both' }}>
        <Box sx={{ mb: 3, textAlign: 'left' }}>
          <Box component={Link} to="/login" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: 'inherit', mb: 2.5 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 1.5, backgroundColor: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><GraduationCap size={21}/></Box>
            <Typography variant="h5" sx={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: '1.3rem', letterSpacing: '-.02em' }}>SkillBridge <span style={{ color: colors.accent }}>AI</span></Typography>
          </Box>
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', sm: '2.25rem' }, fontWeight: 700, color: colors.ink, mb: .8, letterSpacing: '-.035em', lineHeight: 1.15 }}>{statusTitle}</Typography>
          <Typography variant="body1" sx={{ color: colors.inkSecondary, lineHeight: 1.65 }}>Finish setting up your account and get started with SkillBridge.</Typography>
        </Box>
      <Card sx={{ width: '100%', p: { xs: 2.5, sm: 3.5 }, textAlign: 'center', boxShadow: '0 24px 70px rgba(43,35,100,.10)', border: '1px solid rgba(78,65,171,.10)', borderRadius: 3, background: 'rgba(255,255,255,.96)' }}>

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
      </Box>
    </Box>
  );
};

export default VerifyPage;
