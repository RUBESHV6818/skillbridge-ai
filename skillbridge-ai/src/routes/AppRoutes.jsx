import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../layouts/AppLayout';
import PublicLayout from '../layouts/PublicLayout';

// Public Pages
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';

// Student Pages
import CareerDashboardPage from '../pages/student/CareerDashboardPage';
import ResumeManagementPage from '../pages/student/ResumeManagementPage';
import ResumeIntelligencePage from '../pages/student/ResumeIntelligencePage';
import JDMatcherPage from '../pages/student/JDMatcherPage';
import SkillGapPage from '../pages/student/SkillGapPage';
import RoadmapPage from '../pages/student/RoadmapPage';
import MockInterviewPage from '../pages/student/MockInterviewPage';
import PlacementTrackerPage from '../pages/student/PlacementTrackerPage';
import CareerReportPage from '../pages/student/CareerReportPage';
import ProfilePage from '../pages/student/ProfilePage';
import NotificationsPage from '../pages/student/NotificationsPage';

// Coordinator Pages
import CohortOverviewPage from '../pages/coordinator/CohortOverviewPage';
import PlacementAnalyticsPage from '../pages/coordinator/PlacementAnalyticsPage';

// Mentor Pages
import AssignedStudentsPage from '../pages/mentor/AssignedStudentsPage';
import ReviewQueuePage from '../pages/mentor/ReviewQueuePage';

// Admin Pages
import UserDirectoryPage from '../pages/admin/UserDirectoryPage';
import PlatformSettingsPage from '../pages/admin/PlatformSettingsPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages with Topbar/Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* Public Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Authenticated Application Shell */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Student Modules */}
        <Route path="/dashboard" element={<CareerDashboardPage />} />
        <Route path="/resumes" element={<ResumeManagementPage />} />
        <Route path="/resume-intelligence" element={<ResumeIntelligencePage />} />
        <Route path="/jd-matcher" element={<JDMatcherPage />} />
        <Route path="/skill-gap" element={<SkillGapPage />} />
        <Route path="/learning-roadmap" element={<RoadmapPage />} />
        <Route path="/mock-interview" element={<MockInterviewPage />} />
        <Route path="/placement-tracker" element={<PlacementTrackerPage />} />
        <Route path="/career-report" element={<CareerReportPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />

        {/* Coordinator Modules */}
        <Route
          path="/coordinator/cohort"
          element={
            <ProtectedRoute allowedRoles={['coordinator', 'admin']}>
              <CohortOverviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coordinator/analytics"
          element={
            <ProtectedRoute allowedRoles={['coordinator', 'admin']}>
              <PlacementAnalyticsPage />
            </ProtectedRoute>
          }
        />

        {/* Mentor Modules */}
        <Route
          path="/mentor/students"
          element={
            <ProtectedRoute allowedRoles={['mentor', 'admin']}>
              <AssignedStudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mentor/reviews"
          element={
            <ProtectedRoute allowedRoles={['mentor', 'admin']}>
              <ReviewQueuePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Modules */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserDirectoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PlatformSettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
