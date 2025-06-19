// src/pages/documentUpload/index.jsx
import React, { useState, useRef } from 'react';
import {
    Container, Typography, Button, Box, Paper, CircularProgress, Alert,
    List, ListItem, ListItemText, IconButton, Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SendIcon from '@mui/icons-material/Send';
import ClearIcon from '@mui/icons-material/Clear';
import SaveIcon from '@mui/icons-material/Save';

// Impor fungsi API yang sudah kita sesuaikan
import { processDocuments, submitProcessedData } from '../../services/apiService'; 

// Nanti kita bisa buat komponen ini untuk menampilkan form yang bisa diedit
// import OcrResultForm from '../../components/OcrResultForm';

function DocumentUploadPage() {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [ocrResponse, setOcrResponse] = useState(null); // Akan berisi { document_type, content }
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [processError, setProcessError] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState('');
    
    const fileInputRef = useRef();

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            setSelectedFiles(files);
            setOcrResponse(null);
            setProcessError(null);
            setSubmitError(null);
            setSubmitSuccess('');
        }
    };

    const handleProcessOcr = async () => {
        setIsProcessing(true);
        setProcessError(null);
        setOcrResponse(null);
        try {
            const data = await processDocuments(selectedFiles);
            setOcrResponse(data);
        } catch (err) {
            setProcessError(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = async () => {
        if (!ocrResponse) {
            setSubmitError("Tidak ada data untuk disimpan.");
            return;
        }
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess('');
        try {
            // Kita kirim seluruh objek ocrResponse yang berisi {document_type, content}
            await submitProcessedData(ocrResponse);
            setSubmitSuccess(`Data ${ocrResponse.document_type} berhasil disimpan!`);
            clearSelection(); // Bersihkan form setelah sukses
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearSelection = () => {
        setSelectedFiles([]);
        setOcrResponse(null);
        setProcessError(null);
        setSubmitError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <Container sx={{ mt: 3, mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Upload dan Proses Dokumen
            </Typography>

            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Box className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Button variant="contained" component="label" startIcon={<CloudUploadIcon />}>
                        Pilih File
                        <input
                            ref={fileInputRef} type="file" hidden multiple
                            onChange={handleFileChange} accept="image/*,application/pdf"
                        />
                    </Button>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Bisa pilih lebih dari satu file (misal: untuk BPKB)
                    </Typography>
                </Box>

                {selectedFiles.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1">File yang dipilih:</Typography>
                        <List dense>
                            {selectedFiles.map((file, index) => (
                                <ListItem key={index} disableGutters>
                                    <ListItemText primary={file.name} />
                                </ListItem>
                            ))}
                        </List>
                        <Button color="error" size="small" onClick={clearSelection}>Hapus Pilihan</Button>
                    </Box>
                )}

                <Button
                    variant="contained" color="primary" onClick={handleProcessOcr}
                    disabled={selectedFiles.length === 0 || isProcessing}
                    sx={{ mt: 3, width: '100%' }} size="large"
                    startIcon={isProcessing ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                >
                    {isProcessing ? 'Memproses...' : 'Proses Dokumen'}
                </Button>
            </Paper>

            {/* Menampilkan Error dari Proses OCR */}
            {processError && <Alert severity="error" sx={{ mb: 2 }}>{processError}</Alert>}
            
            {/* Menampilkan Hasil OCR */}
            {ocrResponse && (
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Chip label={ocrResponse.document_type} color="success" sx={{mb: 2, fontWeight:'bold'}} />
                    <Typography variant="h5" gutterBottom>
                        Hasil Ekstraksi Data (Verifikasi & Simpan)
                    </Typography>
                    
                    {/* Untuk sekarang, kita tampilkan JSON mentah. Nanti ini akan menjadi form. */}
                    <Box sx={{ maxHeight: '400px', overflowY: 'auto', p: 1, backgroundColor: '#f5f5f5', borderRadius: 1, mt: 2 }}>
                        <pre>{JSON.stringify(ocrResponse.content, null, 2)}</pre>
                    </Box>

                    <Button 
                        variant="contained" 
                        color="secondary" 
                        sx={{mt: 3}} 
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20}/> : <SaveIcon />}
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Simpan ke Database'}
                    </Button>
                    {submitError && <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>}
                </Paper>
            )}

            {/* Menampilkan pesan sukses setelah submit */}
            {submitSuccess && <Alert severity="success" sx={{ mt: 2 }}>{submitSuccess}</Alert>}

        </Container>
    );
}

export default DocumentUploadPage;