import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../layouts/AppLayout';
import PublicLayout from '../layouts/PublicLayout';

// Public Pages
const LandingPage = lazy(() => import('../pages/public/LandingPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));
const VerifyPage = lazy(() => import('../pages/auth/VerifyPage'));

// Student Pages
const CareerDashboardPage = lazy(() => import('../pages/student/CareerDashboardPage'));
const ResumeManagementPage = lazy(() => import('../pages/student/ResumeManagementPage'));
const ResumeIntelligencePage = lazy(() => import('../pages/student/ResumeIntelligencePage'));
const JDMatcherPage = lazy(() => import('../pages/student/JDMatcherPage'));
const SkillGapPage = lazy(() => import('../pages/student/SkillGapPage'));
const RoadmapPage = lazy(() => import('../pages/student/RoadmapPage'));
const MockInterviewPage = lazy(() => import('../pages/student/MockInterviewPage'));
const PlacementTrackerPage = lazy(() => import('../pages/student/PlacementTrackerPage'));
const CareerReportPage = lazy(() => import('../pages/student/CareerReportPage'));
const ProfilePage = lazy(() => import('../pages/student/ProfilePage'));
const NotificationsPage = lazy(() => import('../pages/student/NotificationsPage'));

// Coordinator Pages
const CohortOverviewPage = lazy(() => import('../pages/coordinator/CohortOverviewPage'));
const PlacementAnalyticsPage = lazy(() => import('../pages/coordinator/PlacementAnalyticsPage'));

// Mentor Pages
const AssignedStudentsPage = lazy(() => import('../pages/mentor/AssignedStudentsPage'));
const ReviewQueuePage = lazy(() => import('../pages/mentor/ReviewQueuePage'));

// Admin Pages
const UserDirectoryPage = lazy(() => import('../pages/admin/UserDirectoryPage'));
const PlatformSettingsPage = lazy(() => import('../pages/admin/PlatformSettingsPage'));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<div role="status" style={{ padding: 24 }}>Loading page…</div>}>
    <Routes>
      {/* Public Pages with Topbar/Footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* Public Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify" element={<VerifyPage />} />

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
    </Suspense>
  );
};

export default AppRoutes;
