// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout'; // Sesuaikan path jika berbeda
import InvoiceListPage from './pages/InvoiceList'; // Halaman yang sudah kita buat
import InvoiceUploadPage from './pages/InvoiceUpload'; // Contoh halaman lain untuk nanti
import InvoiceDetailPage from './pages/InvoiceDetail'; // Contoh halaman lain untuk nanti
import InvoiceEditPage from './pages/InvoiceEdit'; // Impor halaman baru

function App() {
  return (
    <Router>
      <Layout> {/* Layout sekarang membungkus semua Routes */}
        <Routes>
          <Route path="/" element={<Navigate replace to="/invoices" />} /> {/* Redirect halaman utama ke /invoices */}
          <Route path="/invoices" element={<InvoiceListPage />} />
          <Route path="/upload-invoice" element={<InvoiceUploadPage />} />
          <Route path="/invoice/:id" element={<InvoiceDetailPage />} />
          <Route path="/invoice/:id/edit" element={<InvoiceEditPage />} />
          {/* Tambahkan rute lainnya di sini */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;