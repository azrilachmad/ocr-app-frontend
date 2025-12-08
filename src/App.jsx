// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DocumentUploadPage from './pages/documentUpload';
import DocumentListPage from './pages/documentList';
import ScanHistoryPage from './pages/scanHistory';
import InvoiceDetailPage from './pages/InvoiceDetail';
import StnkDetailPage from './pages/stnkDetail';
import BpkbDetailPage from './pages/bpkbDetail';
import KtpDetailPage from './pages/ktpDetail';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/documents" element={<DocumentListPage />} />
          <Route path="/upload" element={<DocumentUploadPage />} />
          <Route path="/history" element={<ScanHistoryPage />} />

          {/* Detail routes */}
          <Route path="/invoice/:id" element={<InvoiceDetailPage />} />
          <Route path="/stnk/:id" element={<StnkDetailPage />} />
          <Route path="/bpkb/:id" element={<BpkbDetailPage />} />
          <Route path="/ktp/:id" element={<KtpDetailPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
