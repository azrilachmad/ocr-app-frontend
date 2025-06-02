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
  const [imagePreviewUrl, setImagePreviewUrl] = useState(''); // State for image preview URL

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    // Clear previous preview if any
    if (imagePreviewUrl) {
      setImagePreviewUrl('');
    }

    if (file) {
      if (file.type === "application/pdf" || file.type.startsWith("image/")) {
        setSelectedFile(file);
        setFileName(file.name);
        setError('');

        // If the file is an image, create a preview URL
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreviewUrl(reader.result);
          };
          reader.readAsDataURL(file);
        } else {
          setImagePreviewUrl(''); // Not an image, ensure no preview
        }
      } else {
        setSelectedFile(null);
        setFileName('');
        setImagePreviewUrl(''); // Clear preview for invalid file type
        setError('Tipe file tidak valid. Harap pilih file gambar atau PDF.');
      }
    } else {
      // No file selected (e.g., user cancelled the dialog)
      setSelectedFile(null);
      setFileName('');
      setImagePreviewUrl(''); // Clear preview
      // setError(''); // Optionally clear error or decide based on context
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

      {/* Image Preview Section */}
      {imagePreviewUrl && (
        <Box className="mb-4 flex justify-center">
          <img
            src={imagePreviewUrl}
            alt="Preview"
            style={{
              maxHeight: '600px', // Adjust as needed
              maxWidth: '100%',
              height: 'auto',
              border: '1px solid #ddd',
              borderRadius: '4px',
              objectFit: 'contain',
            }}
          />
        </Box>
      )}

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
            // Using a key that changes when no file is selected helps in resetting the input
            // This allows the onChange to fire even if the same file is re-selected after being cleared.
            key={fileName || 'no-file-input'}
          />
        </Button>
        {fileName && (
          <Typography variant="body2" className="text-gray-600 mt-1">
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