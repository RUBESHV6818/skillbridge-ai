import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button, Container, Divider } from '@mui/material';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { colors } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

export const PublicLayout = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: colors.bg }}>
      {/* Top Navigation */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${colors.border}`,
          color: colors.ink,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ height: 64, justifyContent: 'space-between' }}>
            {/* Logo */}
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 1.5,
                  backgroundColor: colors.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <GraduationCap size={19} strokeWidth={2.2} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontWeight: 700,
                    fontSize: '1.15rem',
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  SkillBridge <span style={{ color: colors.accent }}>AI</span>
                </Typography>
                <Typography variant="caption" sx={{ color: colors.inkTertiary, display: 'block', fontSize: '0.6875rem' }}>
                  Placement Readiness Platform
                </Typography>
              </Box>
            </Box>

            {/* Nav links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
              <Box
                component={RouterLink}
                to="/#workflow"
                sx={{ color: colors.inkSecondary, textDecoration: 'none', fontSize: '0.84375rem', fontWeight: 500, '&:hover': { color: colors.ink } }}
              >
                How It Works
              </Box>
              <Box
                component={RouterLink}
                to="/#audience"
                sx={{ color: colors.inkSecondary, textDecoration: 'none', fontSize: '0.84375rem', fontWeight: 500, '&:hover': { color: colors.ink } }}
              >
                Who It's For
              </Box>
              <Box
                component={RouterLink}
                to="/#faq"
                sx={{ color: colors.inkSecondary, textDecoration: 'none', fontSize: '0.84375rem', fontWeight: 500, '&:hover': { color: colors.ink } }}
              >
                FAQ
              </Box>
            </Box>

            {/* CTA buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {isAuthenticated ? (
                <Button
                  component={RouterLink}
                  to="/dashboard"
                  variant="contained"
                  endIcon={<ArrowRight size={16} />}
                  sx={{ px: 2, py: 0.75, fontSize: '0.8125rem' }}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="text"
                    sx={{ color: colors.ink, fontWeight: 600, fontSize: '0.8125rem' }}
                  >
                    Sign in
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    sx={{ px: 2, py: 0.75, fontSize: '0.8125rem' }}
                  >
                    Get started
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Page Body */}
      <Box sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      {/* Honest Footer */}
      <Box
        component="footer"
        sx={{
          backgroundColor: colors.surface,
          borderTop: `1px solid ${colors.border}`,
          py: 5,
          mt: 'auto',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 3,
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <GraduationCap size={18} color={colors.accent} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: colors.ink }}>
                  SkillBridge AI
                </Typography>
                <Typography variant="caption" sx={{ color: colors.inkTertiary }}>
                  v1.4.0
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block', maxWidth: 440, lineHeight: 1.6 }}>
                Engineering skills assessment, resume intelligence, and campus recruitment readiness system. Built for realistic placement outcomes.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box component={RouterLink} to="/login" sx={{ color: colors.inkSecondary, textDecoration: 'none', fontSize: '0.78125rem', '&:hover': { color: colors.accent } }}>
                Student Sign In
              </Box>
              <Box component={RouterLink} to="/register" sx={{ color: colors.inkSecondary, textDecoration: 'none', fontSize: '0.78125rem', '&:hover': { color: colors.accent } }}>
                Coordinator Access
              </Box>
              <Typography variant="caption" sx={{ color: colors.inkTertiary }}>
                Designed with care • CIT Placement Cell
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default PublicLayout;
