import React, { useState } from 'react';
import { Alert, Box, Button, Card, Link, TextField, Typography } from '@mui/material';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { colors } from '../../theme/theme';
import authService from '../../services/authService';

export const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const email = params.get('email') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(!token || !email ? 'This reset link is incomplete. Request a new password reset link.' : '');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (password.length < 8 || password.length > 128) {
      setError('Password must be between 8 and 128 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.resetPassword({ email, token, password });
      setMessage(response.data?.message || 'Your password has been reset. You can now sign in.');
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset your password. Request a new reset link and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg, px: 2, py: 6 }}>
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        <Box sx={{ mb: 3.5 }}>
          <Box component={RouterLink} to="/" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: 'inherit', mb: 2 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 1.5, backgroundColor: colors.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF' }}><GraduationCap size={20} /></Box>
            <Typography variant="h5" sx={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: '1.25rem' }}>SkillBridge <span style={{ color: colors.accent }}>AI</span></Typography>
          </Box>
          <Typography variant="h2" sx={{ fontSize: '1.75rem', fontWeight: 700, color: colors.ink, mb: 0.75 }}>Choose a new password</Typography>
          <Typography variant="body2" sx={{ color: colors.inkSecondary }}>Use at least 8 characters. This reset link expires after one hour.</Typography>
        </Box>
        <Card sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {submitted ? (
            <Box sx={{ textAlign: 'center', py: 1 }}>
              <Alert severity="success" sx={{ mb: 2, textAlign: 'left' }}>{message}</Alert>
              <Button component={RouterLink} to="/login" variant="contained" fullWidth>Return to sign in</Button>
            </Box>
          ) : (
            <form onSubmit={handleSubmit}>
              <TextField fullWidth required type="password" label="New password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} inputProps={{ minLength: 8, maxLength: 128 }} sx={{ mb: 2 }} />
              <TextField fullWidth required type="password" label="Confirm new password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} inputProps={{ minLength: 8, maxLength: 128 }} sx={{ mb: 2.5 }} />
              <Button type="submit" variant="contained" fullWidth disabled={loading || !token || !email} sx={{ py: 1.1, mb: 2 }}>{loading ? 'Updating password…' : 'Reset password'}</Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link component={RouterLink} to="/forgot-password" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, color: colors.inkSecondary, textDecoration: 'none', fontSize: '0.8125rem' }}><ArrowLeft size={14} /> Request a new reset link</Link>
              </Box>
            </form>
          )}
        </Card>
      </Box>
    </Box>
  );
};

export default ResetPasswordPage;
