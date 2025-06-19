// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout'; // Sesuaikan path jika berbeda
import DocumentUploadPage from './pages/documentUpload'; // Contoh halaman lain untuk nanti
import DocumentListPage from './pages/documentList'; // Impor halaman baru
import InvoiceDetailPage from './pages/InvoiceDetail';
import StnkDetailPage from './pages/stnkDetail';
import BpkbDetailPage from './pages/bpkbDetail';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate replace to="/documents" />} /> {/* Arahkan ke halaman daftar */}
          <Route path="/documents" element={<DocumentListPage />} />
          <Route path="/upload" element={<DocumentUploadPage />} />
          
          {/* Rute untuk detail akan kita buat nanti */}
          <Route path="/invoice/:id" element={<InvoiceDetailPage />} />
          <Route path="/stnk/:id" element={<StnkDetailPage />} />
          <Route path="/bpkb/:id" element={<BpkbDetailPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;