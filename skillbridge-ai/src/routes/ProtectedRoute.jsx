import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F1F0F6',
          gap: 2,
        }}
      >
        <CircularProgress size={32} sx={{ color: '#4F46A5' }} />
        <Typography variant="body2" color="text.secondary">
          Restoring your session...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect based on current active role
    if (role === 'coordinator') {
      return <Navigate to="/coordinator/cohort" replace />;
    } else if (role === 'mentor') {
      return <Navigate to="/mentor/students" replace />;
    } else if (role === 'admin') {
      return <Navigate to="/admin/users" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
