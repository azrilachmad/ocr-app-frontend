// src/pages/documentUpload/index.jsx
import React, { useState, useRef } from 'react';
import {
    Container, Typography, Button, Box, Paper, CircularProgress, Alert,
    List, ListItem, ListItemText, Chip
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SendIcon from '@mui/icons-material/Send';
import SaveIcon from '@mui/icons-material/Save';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// Impor fungsi API yang sudah kita sesuaikan
import { processDocuments, submitProcessedData } from '../../services/apiService';
import GeneralInsightDisplay from '../../components/GeneralInsightDisplay';

// Nanti kita akan buat komponen ini untuk menampilkan form yang bisa diedit
// import OcrResultForm from '../../components/OcrResultForm';

function DocumentUploadPage() {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [ocrResponse, setOcrResponse] = useState(null); // Akan berisi { document_type, content }
    const [userDefinedFilename, setUserDefinedFilename] = useState(null);

    const [isProcessing, setIsProcessing] = useState(false);
    const [processError, setProcessError] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState('');

    const fileInputRef = useRef();

    const [openDialog, setOpenDialog] = React.useState(false);

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSubmitDialog = async (event) => {
        event.preventDefault();

        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess('');
        try {
            // 1. Siapkan payload lengkap untuk service
            const submissionPayload = {
                document_type: ocrResponse.document_type,
                content: ocrResponse,
                userDefinedFilename: userDefinedFilename,
                documentFiles: selectedFiles
            };
            // return console.log(submissionPayload);

            // 2. Kirim payload ke service
            await submitProcessedData(submissionPayload);
            setSubmitSuccess(`Data dan file berhasil disimpan!`);
            clearSelection();
            handleCloseDialog();
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setIsSubmitting(false);
        }


    };


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


    const clearSelection = () => {
        setSelectedFiles([]);
        setOcrResponse(null);
        setProcessError(null);
        setSubmitError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <>
            <Container sx={{ mt: 3, mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Upload dan Proses Dokumen
                </Typography>

                <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                    <Box className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Button variant="contained" component="label" startIcon={<CloudUploadIcon />}>
                            Pilih File
                            <input ref={fileInputRef} type="file" hidden multiple onChange={handleFileChange} accept="image/*,application/pdf" />
                        </Button>
                        {/* <Typography variant="body2" sx={{ mt: 1 }}>Bisa pilih lebih dari satu file (misal: untuk BPKB)</Typography> */}
                    </Box>

                    {selectedFiles.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle1">File yang dipilih:</Typography>
                            <List dense>{selectedFiles.map((file, index) => <ListItem key={index}><ListItemText primary={file.name} /></ListItem>)}</List>
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

                {/* Menampilkan pesan sukses setelah submit */}
                {submitSuccess && <Alert severity="success" sx={{ mt: 2, mb: 2 }}>{submitSuccess}</Alert>}

                {ocrResponse && (
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Chip label={ocrResponse.document_type === 'DOKUMEN_UMUM'  ? 'DOKUMEN UMUM' : ocrResponse.document_type} color="success" sx={{ mb: 2, fontWeight: 'bold' }} />
                        <Typography variant="h5" gutterBottom>
                            {ocrResponse.document_type === 'DOKUMEN_UMUM' ? 'Hasil Ekstraksi Data' : 'Hasil Ekstraksi Data (Verifikasi & Simpan'}
                        </Typography>

                        {/* Untuk sekarang, kita tampilkan JSON mentah untuk verifikasi */}
                        {/* Langkah selanjutnya adalah mengganti ini dengan form dinamis */}

                        {ocrResponse.document_type === 'DOKUMEN_UMUM' ? (<>
                            <GeneralInsightDisplay data={ocrResponse.content} />
                        </>) : (<>
                            <Box sx={{ maxHeight: '400px', overflowY: 'auto', p: 1, backgroundColor: '#f5f5f5', borderRadius: 1, mt: 2 }}>
                                <pre>{JSON.stringify(ocrResponse.content, null, 2)}</pre>
                            </Box>
                        </>)}

                        {ocrResponse.document_type === 'DOKUMEN_UMUM' ? (<></>) : (<>
                            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                                <Button variant="contained" color="secondary" onClick={handleOpenDialog} disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}>
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan ke Database'}
                                </Button>

                                <Button variant="outlined" color="error" onClick={clearSelection}>Batal & Upload Ulang</Button>
                            </Box>

                            {submitError && <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>}

                        </>)}
                    </Paper>
                )}
            </Container>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Simpan File</DialogTitle>
                <DialogContent sx={{ paddingBottom: 0 }}>
                    <DialogContentText>
                        Apakah Anda yakin ingin menyimpan data dan file dokumen ini ke dalam database? Pastikan semua data hasil ekstraksi sudah diperiksa dan benar.
                    </DialogContentText>
                    <form onSubmit={handleSubmitDialog}>
                        <TextField
                            autoFocus
                            required
                            margin="dense"
                            id="name"
                            name="userDefinedFilename"
                            label="File Name"
                            fullWidth
                            variant="standard"
                            onChange={(e) => setUserDefinedFilename(e.target.value)}
                        />
                        <DialogActions>
                            <Button onClick={handleCloseDialog}>Batal</Button>
                            <Button type="submit">Simpan</Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>
        </>

    );
}

export default DocumentUploadPage;