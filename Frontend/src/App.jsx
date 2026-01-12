// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { ProtectedRoute, PublicRoute } from './components/RouteGuards';
import Dashboard from './pages/Dashboard';
import DocumentUploadPage from './pages/documentUpload';
import ScanHistoryPage from './pages/scanHistory';
import ScanDetailEditPage from './pages/scanHistory/ScanDetailEditPage';
import SettingsPage from './pages/Settings';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';

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
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/upload" element={<DocumentUploadPage />} />
                <Route path="/history" element={<ScanHistoryPage />} />
                <Route path="/history/:id" element={<ScanDetailEditPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
