// src/App.jsx
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { ProtectedRoute, PublicRoute, AdminRoute } from './components/RouteGuards';
import PageLoader from './components/PageLoader';

// Lazy load page components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DocumentUploadPage = lazy(() => import('./pages/documentUpload'));
const ScanHistoryPage = lazy(() => import('./pages/scanHistory'));
const ScanDetailEditPage = lazy(() => import('./pages/scanHistory/ScanDetailEditPage'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const KnowledgeBase = lazy(() => import('./pages/User/KnowledgeBase'));
const LoginPage = lazy(() => import('./pages/Login'));
const RegisterPage = lazy(() => import('./pages/Register'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/Admin/UserManagement'));
const FeatureToggle = lazy(() => import('./pages/Admin/FeatureToggle'));
const ActivityLog = lazy(() => import('./pages/Admin/ActivityLog'));
const DocumentManagement = lazy(() => import('./pages/Admin/DocumentManagement'));
const SystemSettings = lazy(() => import('./pages/Admin/SystemSettings'));
const ScanStatistics = lazy(() => import('./pages/Admin/ScanStatistics'));

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes - redirect to dashboard if already logged in */}
          <Route path="/" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />

          {/* Protected routes with Layout - redirect to login if not authenticated */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* User routes */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/upload" element={<DocumentUploadPage />} />
                    <Route path="/history" element={<ScanHistoryPage />} />
                    <Route path="/history/:id" element={<ScanDetailEditPage />} />
                    <Route path="/knowledge-base" element={<KnowledgeBase />} />
                    <Route path="/settings" element={<SettingsPage />} />

                    {/* Admin routes */}
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/features" element={<FeatureToggle />} />
                    <Route path="/admin/activity" element={<ActivityLog />} />
                    <Route path="/admin/documents" element={<DocumentManagement />} />
                    <Route path="/admin/settings" element={<SystemSettings />} />
                    <Route path="/admin/statistics" element={<ScanStatistics />} />
                  </Routes>
                </Suspense>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
