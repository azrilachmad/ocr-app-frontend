// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DocumentUploadPage from './pages/documentUpload';
import ScanHistoryPage from './pages/scanHistory';
import ScanDetailEditPage from './pages/scanHistory/ScanDetailEditPage';
import SettingsPage from './pages/Settings';
import LoginPage from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        {/* Login route without Layout */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes with Layout */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/upload" element={<DocumentUploadPage />} />
              <Route path="/history" element={<ScanHistoryPage />} />
              <Route path="/history/:id" element={<ScanDetailEditPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;

