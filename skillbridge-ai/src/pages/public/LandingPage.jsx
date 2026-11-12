import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OriginalHome from '../../../../skillbridge-frontend/src/pages/Home.jsx';

const LandingPage = () => {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    const homeByRole = {
      coordinator: '/coordinator/cohort',
      mentor: '/mentor/students',
      admin: '/admin/users',
    };
    return <Navigate to={homeByRole[role] || '/dashboard'} replace />;
  }

  return <OriginalHome />;
};

export default LandingPage;
