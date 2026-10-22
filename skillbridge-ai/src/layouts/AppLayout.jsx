import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Tooltip,
  useMediaQuery,
  useTheme,
  InputBase,
} from '@mui/material';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  FileSearch,
  BarChart3,
  Milestone,
  Headphones,
  Kanban,
  FileCheck,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  Menu as MenuIcon,
  ChevronLeft,
  Users,
  TrendingUp,
  Shield,
  Sliders,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/theme';

const DRAWER_WIDTH = 256;
const COLLAPSED_DRAWER_WIDTH = 72;

export const AppLayout = () => {
  const { user, role, logout, switchRoleDev } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleProfileOpen = (event) => setProfileAnchor(event.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);

  const handleLogout = async () => {
    handleProfileClose();
    await logout();
    navigate('/login');
  };

  // Role-based navigation items
  const studentNav = [
    { label: 'Career Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Resume Management', path: '/resumes', icon: FileText },
    { label: 'Resume Intelligence', path: '/resume-intelligence', icon: Sparkles, badge: 'AI' },
    { label: 'JD Matcher', path: '/jd-matcher', icon: FileSearch },
    { label: 'Skill Gap Analyzer', path: '/skill-gap', icon: BarChart3 },
    { label: 'Learning Roadmap', path: '/learning-roadmap', icon: Milestone },
    { label: 'AI Mock Interview', path: '/mock-interview', icon: Headphones },
    { label: 'Placement Tracker', path: '/placement-tracker', icon: Kanban },
    { label: 'Career Report', path: '/career-report', icon: FileCheck },
  ];

  const coordinatorNav = [
    { label: 'Cohort Overview', path: '/coordinator/cohort', icon: Users },
    { label: 'Placement Drives', path: '/coordinator/analytics', icon: TrendingUp },
  ];

  const mentorNav = [
    { label: 'Assigned Mentees', path: '/mentor/students', icon: Users },
    { label: 'Review Queue', path: '/mentor/reviews', icon: FileText, badge: '3' },
  ];

  const adminNav = [
    { label: 'User Directory', path: '/admin/users', icon: Shield },
    { label: 'Platform Controls', path: '/admin/settings', icon: Sliders },
  ];

  let currentNav = studentNav;
  if (role === 'coordinator') currentNav = coordinatorNav;
  if (role === 'mentor') currentNav = mentorNav;
  if (role === 'admin') currentNav = adminNav;

  const currentDrawerWidth = isMobile
    ? DRAWER_WIDTH
    : collapsed
    ? COLLAPSED_DRAWER_WIDTH
    : DRAWER_WIDTH;

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand Header */}
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
          px: collapsed && !isMobile ? 1 : 2.5,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
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
              width: 32,
              height: 32,
              borderRadius: 1.5,
              backgroundColor: colors.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            <GraduationCap size={18} strokeWidth={2.2} />
          </Box>
          {(!collapsed || isMobile) && (
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                SkillBridge <span style={{ color: colors.accent }}>AI</span>
              </Typography>
              <Typography variant="caption" sx={{ color: colors.inkTertiary, display: 'block', fontSize: '0.6875rem' }}>
                Engineering Placement Platform
              </Typography>
            </Box>
          )}
        </Box>

        {!isMobile && (
          <IconButton
            size="small"
            onClick={handleDrawerToggle}
            sx={{
              color: colors.inkSecondary,
              display: collapsed ? 'none' : 'flex',
              p: 0.5,
            }}
          >
            <ChevronLeft size={18} />
          </IconButton>
        )}
      </Box>

      {/* Role Pill Banner */}
      {(!collapsed || isMobile) && (
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 1.5,
              backgroundColor: colors.surfaceSubtle,
              border: `1px solid ${colors.borderLight}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: colors.accentLight,
                color: colors.accent,
                border: `1px solid ${colors.accentBorder}`,
              }}
            >
              {user?.avatar || 'U'}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.name || 'Aarthi Raman'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: colors.inkSecondary,
                  fontSize: '0.6875rem',
                  display: 'block',
                  textTransform: 'capitalize',
                }}
              >
                {role === 'coordinator'
                  ? 'Placement Coordinator'
                  : role === 'mentor'
                  ? 'Career Mentor'
                  : role === 'admin'
                  ? 'Administrator'
                  : 'Final-year B.Tech'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Nav List */}
      <List sx={{ px: 1, py: 1.5, flex: 1, overflowY: 'auto' }}>
        {currentNav.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={collapsed && !isMobile ? item.label : ''} placement="right" arrow>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  onClick={() => isMobile && setMobileOpen(false)}
                  sx={{
                    borderRadius: 1.5,
                    px: collapsed && !isMobile ? 1.5 : 1.75,
                    py: 1,
                    minHeight: 40,
                    justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                    backgroundColor: isActive ? colors.accentLight : 'transparent',
                    color: isActive ? colors.accent : colors.inkSecondary,
                    fontWeight: isActive ? 600 : 500,
                    '&:hover': {
                      backgroundColor: isActive ? colors.accentLight : colors.surfaceSubtle,
                      color: isActive ? colors.accent : colors.ink,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed && !isMobile ? 'auto' : 32,
                      color: isActive ? colors.accent : colors.inkSecondary,
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.75} />
                  </ListItemIcon>
                  {(!collapsed || isMobile) && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: '0.84375rem',
                        fontWeight: isActive ? 600 : 500,
                        lineHeight: 1.3,
                      }}
                    />
                  )}
                  {(!collapsed || isMobile) && item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.65rem',
                        fontWeight: 600,
                        backgroundColor: isActive ? colors.accent : colors.border,
                        color: isActive ? '#FFFFFF' : colors.inkSecondary,
                        borderRadius: 1,
                        px: 0.5,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* Footer System Status */}
      {(!collapsed || isMobile) && (
        <Box sx={{ p: 2, borderTop: `1px solid ${colors.borderLight}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: colors.success,
              }}
            />
            <Typography variant="caption" sx={{ color: colors.inkSecondary, fontSize: '0.71875rem' }}>
              Service Status: All systems ready
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );

  // Derive topbar title from pathname
  const getPageTitle = () => {
    const allRoutes = [...studentNav, ...coordinatorNav, ...mentorNav, ...adminNav];
    const match = allRoutes.find((r) => r.path === location.pathname);
    if (match) return match.label;
    if (location.pathname === '/profile') return 'Student Profile & Settings';
    if (location.pathname === '/notifications') return 'Notifications';
    return 'Career Readiness';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: colors.bg }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            backgroundColor: colors.surface,
            borderRight: `1px solid ${colors.border}`,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Persistent Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: currentDrawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: currentDrawerWidth,
            boxSizing: 'border-box',
            backgroundColor: colors.surface,
            borderRight: `1px solid ${colors.border}`,
            transition: 'width 180ms ease-in-out',
            overflowX: 'hidden',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Body Area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
        {/* Slim Top Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            backgroundColor: colors.surface,
            color: colors.ink,
            borderBottom: `1px solid ${colors.border}`,
            zIndex: (theme) => theme.zIndex.drawer - 1,
          }}
        >
          <Toolbar sx={{ minHeight: '56px !important', px: { xs: 2, md: 3 }, gap: 2 }}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open navigation menu"
              onClick={handleDrawerToggle}
              sx={{ display: { md: 'none' }, mr: 0.5 }}
            >
              <MenuIcon size={20} />
            </IconButton>

            {/* Current Section Title */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: '0.9375rem',
                color: colors.ink,
                letterSpacing: '-0.01em',
              }}
            >
              {getPageTitle()}
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            {/* Search Input Box */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                backgroundColor: colors.surfaceSubtle,
                border: `1px solid ${colors.border}`,
                borderRadius: 1.5,
                px: 1.5,
                py: 0.4,
                width: { sm: 220, md: 260 },
              }}
            >
              <Search size={15} color={colors.inkTertiary} style={{ marginRight: 8 }} />
              <InputBase
                placeholder="Search skills, JDs, companies..."
                sx={{ fontSize: '0.8125rem', width: '100%', color: colors.ink }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: colors.inkTertiary,
                  fontSize: '0.6875rem',
                  border: `1px solid ${colors.border}`,
                  px: 0.5,
                  borderRadius: 0.75,
                  ml: 0.5,
                }}
              >
                ⌘K
              </Typography>
            </Box>

            {/* Notifications Button */}
            <Tooltip title="View notifications" arrow>
              <IconButton
                component={RouterLink}
                to="/notifications"
                size="small"
                sx={{
                  color: colors.inkSecondary,
                  border: `1px solid ${colors.borderLight}`,
                  borderRadius: 1.5,
                  p: 0.75,
                }}
              >
                <Bell size={17} />
              </IconButton>
            </Tooltip>

            {/* Profile Menu Trigger */}
            <Box
              onClick={handleProfileOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                p: 0.5,
                borderRadius: 1.5,
                '&:hover': { backgroundColor: colors.surfaceSubtle },
              }}
            >
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: colors.accentLight,
                  color: colors.accent,
                  border: `1px solid ${colors.accentBorder}`,
                }}
              >
                {user?.avatar || 'AR'}
              </Avatar>
              <Typography
                variant="body2"
                sx={{
                  display: { xs: 'none', md: 'block' },
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  color: colors.ink,
                }}
              >
                {user?.name?.split(' ')[0] || 'Aarthi'}
              </Typography>
            </Box>

            <Menu
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={handleProfileClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  width: 210,
                  mt: 1,
                  p: 0.5,
                },
              }}
            >
              <Box sx={{ px: 1.5, py: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.84375rem' }}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" sx={{ color: colors.inkSecondary, display: 'block' }}>
                  {user?.email}
                </Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem
                component={RouterLink}
                to="/profile"
                onClick={handleProfileClose}
                sx={{ fontSize: '0.8125rem', gap: 1.25, py: 0.75 }}
              >
                <User size={15} color={colors.inkSecondary} />
                Profile & Settings
              </MenuItem>
              <MenuItem
                component={RouterLink}
                to="/notifications"
                onClick={handleProfileClose}
                sx={{ fontSize: '0.8125rem', gap: 1.25, py: 0.75 }}
              >
                <Bell size={15} color={colors.inkSecondary} />
                Notifications
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem
                onClick={handleLogout}
                sx={{ fontSize: '0.8125rem', gap: 1.25, py: 0.75, color: colors.error }}
              >
                <LogOut size={15} color={colors.error} />
                Sign out
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        {/* Content Viewport */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            maxWidth: 1240,
            width: '100%',
            mx: 'auto',
            pb: 10, // Generous padding for bottom role switcher
          }}
        >
          <Outlet />
        </Box>

        {/* Dev-Only Role Switcher Footer Bar (Required for Hackathon Evaluation) */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 12,
            right: 16,
            zIndex: 1300,
            backgroundColor: 'rgba(23, 22, 28, 0.94)',
            backdropFilter: 'blur(8px)',
            color: '#FFFFFF',
            px: 2,
            py: 0.85,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#A19EB0',
              fontWeight: 600,
              fontSize: '0.6875rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Demo Role Switcher:
          </Typography>
          {[
            { id: 'student', label: 'Student' },
            { id: 'coordinator', label: 'Coordinator' },
            { id: 'mentor', label: 'Mentor' },
            { id: 'admin', label: 'Admin' },
          ].map((r) => {
            const isCurrent = role === r.id;
            return (
              <Box
                key={r.id}
                onClick={() => {
                  switchRoleDev(r.id);
                  if (r.id === 'student') navigate('/dashboard');
                  else if (r.id === 'coordinator') navigate('/coordinator/cohort');
                  else if (r.id === 'mentor') navigate('/mentor/students');
                  else if (r.id === 'admin') navigate('/admin/users');
                }}
                sx={{
                  cursor: 'pointer',
                  px: 1.25,
                  py: 0.35,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  fontWeight: isCurrent ? 600 : 400,
                  backgroundColor: isCurrent ? colors.accent : 'rgba(255, 255, 255, 0.08)',
                  color: isCurrent ? '#FFFFFF' : '#D1CFDF',
                  transition: 'all 120ms ease',
                  '&:hover': {
                    backgroundColor: isCurrent ? colors.accentHover : 'rgba(255, 255, 255, 0.16)',
                    color: '#FFFFFF',
                  },
                }}
              >
                {r.label}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default AppLayout;
