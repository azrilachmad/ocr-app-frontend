// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { ProtectedRoute, PublicRoute, AdminRoute } from './components/RouteGuards';
import Dashboard from './pages/Dashboard';
import DocumentUploadPage from './pages/documentUpload';
import ScanHistoryPage from './pages/scanHistory';
import ScanDetailEditPage from './pages/scanHistory/ScanDetailEditPage';
import SettingsPage from './pages/Settings';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';

// Admin pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import FeatureToggle from './pages/Admin/FeatureToggle';
import ActivityLog from './pages/Admin/ActivityLog';

function App() {
  return (
    <Router>
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
              <Routes>
                {/* User routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<DocumentUploadPage />} />
                <Route path="/history" element={<ScanHistoryPage />} />
                <Route path="/history/:id" element={<ScanDetailEditPage />} />
                <Route path="/settings" element={<SettingsPage />} />

                {/* Admin routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/features" element={<FeatureToggle />} />
                <Route path="/admin/activity" element={<ActivityLog />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
