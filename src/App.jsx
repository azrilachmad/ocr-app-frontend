// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DocumentUploadPage from './pages/documentUpload';
import DocumentListPage from './pages/documentList';
import ScanHistoryPage from './pages/scanHistory';
import SettingsPage from './pages/Settings';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/documents" element={<DocumentListPage />} />
          <Route path="/upload" element={<DocumentUploadPage />} />
          <Route path="/history" element={<ScanHistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

