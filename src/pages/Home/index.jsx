// src/pages/Home/index.jsx
import React, { useState } from 'react';
import { Container, Box, Typography, CircularProgress, Alert } from '@mui/material';
import FileUpload from '../../components/fileUpload'; // Sesuaikan path
import { uploadDocument } from '../../services/apiService'; // Sesuaikan path

const HomePage = () => {
  const [documentData, setDocumentData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSubmit = async (file) => {
    setIsLoading(true);
    setDocumentData(null); // Reset data sebelumnya
    setError('');       // Reset error sebelumnya

    try {
      const data = await uploadDocument(file);
      setDocumentData(data);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat memproses dokumen.");
      setDocumentData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="lg" className="py-8">
      <Box className="flex flex-col items-center">
        <FileUpload onSubmitFile={handleFileSubmit} isProcessing={isLoading} />

        {isLoading && (
          <Box className="text-center my-6">
            <CircularProgress />
            <Typography variant="body1" className="mt-2 text-gray-600">
              Memproses dokumen... Ini mungkin memakan waktu beberapa saat.
            </Typography>
          </Box>
        )}

        {/* Tampilkan error hanya jika tidak loading dan ada pesan error */}
        {!isLoading && error && (
          <Box className="w-full max-w-lg mx-auto mt-4">
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {/* Tampilkan data hasil OCR hanya jika tidak loading, tidak ada error, dan ada data */}
        {!isLoading && !error && documentData && (
          <></>
        )}

        {/* Pesan default jika tidak ada apa-apa */}
        {!isLoading && !documentData && !error && (
          <Typography variant="body1" className="text-center text-gray-500 mt-6">
            Silakan unggah file untuk melihat hasilnya.
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default HomePage;