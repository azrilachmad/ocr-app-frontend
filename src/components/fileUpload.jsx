// src/components/FileUpload.jsx
import React, { useState } from 'react';
import { Button, CircularProgress, Box, Typography, Alert } from '@mui/material';
// import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// Pastikan path ke apiService benar jika FileUpload melakukan API call sendiri
// Untuk contoh kita, API call akan dilakukan di HomePage
// import { uploadInvoice } from '../services/apiService';

const FileUpload = ({ onSubmitFile, isProcessing }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === "application/pdf" || file.type.startsWith("image/")) {
        setSelectedFile(file);
        setFileName(file.name);
        setError('');
      } else {
        setSelectedFile(null);
        setFileName('');
        setError('Tipe file tidak valid. Harap pilih file gambar atau PDF.');
      }
    } else {
      setSelectedFile(null);
      setFileName('');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Silakan pilih file terlebih dahulu.');
      return;
    }
    setError('');
    onSubmitFile(selectedFile); // Kirim file ke parent component untuk di-handle
  };

  return (
    <Box component="form" onSubmit={handleSubmit} className="w-full max-w-lg mx-auto p-4 space-y-4">
      <Typography variant="h5" component="h2" className="text-center text-gray-700 mb-6">
        Unggah Dokumen Invoice
      </Typography>

      {error && <Alert severity="error" className="mb-4">{error}</Alert>}

      <Box className="flex flex-col items-center">
        <Button
          component="label"
          variant="outlined"
        //   startIcon={<CloudUploadIcon />}
          className="mb-2"
          disabled={isProcessing}
        >
          Pilih File (Gambar atau PDF)
          <input
            type="file"
            hidden
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            key={selectedFile ? 'file-selected' : 'no-file'} // Untuk mereset input file
          />
        </Button>
        {fileName && (
          <Typography variant="body2" className="text-gray-600">
            File terpilih: {fileName}
          </Typography>
        )}
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={!selectedFile || isProcessing}
        fullWidth
        className="mt-4 py-3"
      >
        {isProcessing ? <CircularProgress size={24} color="inherit" /> : 'Proses Invoice'}
      </Button>
    </Box>
  );
};

export default FileUpload;