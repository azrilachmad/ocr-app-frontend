// src/pages/InvoiceUpload/index.jsx
import React, { useState } from 'react';
import axios from 'axios';
import {
    Container, Typography, Button, Box, Paper, CircularProgress, Alert,
    TextField, Grid, Divider, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SendIcon from '@mui/icons-material/Send';
import SaveIcon from '@mui/icons-material/Save';
// import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
// import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

const API_BASE_URL = 'http://localhost:3001/api/invoice';

function InvoiceUploadPage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [ocrResult, setOcrResult] = useState(null);

    const [isLoadingOcr, setIsLoadingOcr] = useState(false);
    const [ocrError, setOcrError] = useState(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setFileName(file.name);
            setOcrResult(null);
            setSubmitSuccess(false);
            setOcrError(null);
            setSubmitError(null);
        }
    };

    const handleProcessOcr = async () => {
        if (!selectedFile) {
            setOcrError('Silakan pilih file terlebih dahulu.');
            return;
        }
        setIsLoadingOcr(true);
        setOcrError(null);
        setSubmitSuccess(false);
        setOcrResult(null);
        const formData = new FormData();
        formData.append('invoiceImageFile', selectedFile);
        try {
            const response = await axios.post(`${API_BASE_URL}/process-ocr`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setOcrResult(response.data.data);
        } catch (err) {
            setOcrError(err.response?.data?.message || err.message || 'Gagal memproses OCR.');
        } finally {
            setIsLoadingOcr(false);
        }
    };

    const handleSubmitData = async () => {
        if (!ocrResult) {
            setSubmitError('Tidak ada data hasil OCR untuk disimpan.');
            return;
        }
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);
        try {
            await axios.post(`${API_BASE_URL}/submit-data`, ocrResult);
            setSubmitSuccess(true);
            setOcrResult(null);
            setSelectedFile(null);
            setFileName('');
        } catch (err) {
            setSubmitError(err.response?.data?.message || err.message || 'Gagal menyimpan data.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOcrDataChange = (path, value) => {
        setOcrResult(prevResult => {
            const newResult = JSON.parse(JSON.stringify(prevResult));
            let current = newResult;
            const keys = path.split('.');
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {}; // Buat objek jika belum ada
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newResult;
        });
    };

    const handleOcrItemChange = (itemIndex, fieldName, value) => {
        setOcrResult(prevResult => {
            const newResult = JSON.parse(JSON.stringify(prevResult));
            if (newResult.item_baris && newResult.item_baris[itemIndex]) {
                let val = value;
                if (['kuantitas', 'harga_satuan', 'diskon_persen', 'diskon_jumlah', 'total_harga'].includes(fieldName)) {
                    val = value === '' ? null : parseFloat(value); // Izinkan null jika kosong
                    if (isNaN(val)) val = null; // Jika bukan angka, set null
                }
                newResult.item_baris[itemIndex][fieldName] = val;
            }
            return newResult;
        });
    };

    // Helper untuk mendapatkan nilai dengan aman (mencegah error jika path tidak ada)
    const getSafeValue = (path, defaultValue = '') => {
        let current = ocrResult;
        const keys = path.split('.');
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return defaultValue;
            }
        }
        return current === null ? defaultValue : current;
    };


    return (
        <Container sx={{ mt: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>Upload dan Proses Invoice</Typography>

            {/* Langkah 1: Upload dan Proses OCR */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Langkah 1: Pilih dan Proses File Invoice</Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                        <TextField fullWidth variant="outlined" label="File Invoice" value={fileName || "Belum ada file dipilih"} InputProps={{ readOnly: true }} size="small" />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Button variant="contained" component="label" fullWidth startIcon={<CloudUploadIcon />}>
                            Pilih File <input type="file" hidden onChange={handleFileChange} accept="image/*,application/pdf" />
                        </Button>
                    </Grid>
                </Grid>
                <Button variant="contained" color="primary" onClick={handleProcessOcr} disabled={!selectedFile || isLoadingOcr} sx={{ mt: 2 }} startIcon={isLoadingOcr ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}>
                    {isLoadingOcr ? 'Memproses OCR...' : 'Proses OCR'}
                </Button>
                {ocrError && <Alert severity="error" sx={{ mt: 2 }}>{ocrError}</Alert>}
            </Paper>

            {/* Langkah 2: Form Verifikasi Data (jika ocrResult ada) */}
            {ocrResult && (
                <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>Langkah 2: Verifikasi dan Edit Data</Typography>

                    {/* Informasi Umum */}
                    <Typography variant="h6" gutterBottom>Informasi Umum</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField label="Tipe Dokumen" value={getSafeValue('informasi_umum.tipe_dokumen')} onChange={(e) => handleOcrDataChange('informasi_umum.tipe_dokumen', e.target.value)} fullWidth margin="dense" size="small" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField label="Nomor Dokumen" value={getSafeValue('informasi_umum.nomor_dokumen')} onChange={(e) => handleOcrDataChange('informasi_umum.nomor_dokumen', e.target.value)} fullWidth margin="dense" size="small" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField label="Tanggal Terbit" type="date" value={getSafeValue('informasi_umum.tanggal_terbit')} onChange={(e) => handleOcrDataChange('informasi_umum.tanggal_terbit', e.target.value)} fullWidth margin="dense" size="small" InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField label="Tanggal Jatuh Tempo" type="date" value={getSafeValue('informasi_umum.tanggal_jatuh_tempo')} onChange={(e) => handleOcrDataChange('informasi_umum.tanggal_jatuh_tempo', e.target.value)} fullWidth margin="dense" size="small" InputLabelProps={{ shrink: true }} />
                        </Grid>
                        {/* Tambahkan field informasi umum lainnya */}
                    </Grid>
                    <Divider sx={{ my: 2 }} />

                    {/* Pihak Terlibat */}
                    <Typography variant="h6" gutterBottom>Pihak Terlibat</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1">Vendor</Typography>
                            <TextField label="Nama Vendor" value={getSafeValue('pihak_terlibat.vendor.nama')} onChange={(e) => handleOcrDataChange('pihak_terlibat.vendor.nama', e.target.value)} fullWidth margin="dense" size="small" />
                            <TextField label="Alamat Vendor" value={getSafeValue('pihak_terlibat.vendor.alamat')} onChange={(e) => handleOcrDataChange('pihak_terlibat.vendor.alamat', e.target.value)} fullWidth margin="dense" size="small" multiline rows={2} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1">Pelanggan</Typography>
                            <TextField label="Nama Pelanggan" value={getSafeValue('pihak_terlibat.pelanggan.nama')} onChange={(e) => handleOcrDataChange('pihak_terlibat.pelanggan.nama', e.target.value)} fullWidth margin="dense" size="small" />
                            <TextField label="Alamat Penagihan Pelanggan" value={getSafeValue('pihak_terlibat.pelanggan.alamat_penagihan')} onChange={(e) => handleOcrDataChange('pihak_terlibat.pelanggan.alamat_penagihan', e.target.value)} fullWidth margin="dense" size="small" multiline rows={2} />
                        </Grid>
                    </Grid>
                    <Divider sx={{ my: 2 }} />

                    {/* Item Baris */}
                    <Typography variant="h6" gutterBottom>Item Invoice</Typography>
                    {ocrResult.item_baris?.map((item, index) => (
                        <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0' }}>
                            <Typography variant="subtitle2" gutterBottom>Item {index + 1}</Typography>
                            <Grid container spacing={1}>
                                <Grid item xs={12} md={4}><TextField label="Deskripsi" value={item.deskripsi || ''} onChange={(e) => handleOcrItemChange(index, 'deskripsi', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                                <Grid item xs={6} md={2}><TextField label="Kuantitas" type="number" value={item.kuantitas || ''} onChange={(e) => handleOcrItemChange(index, 'kuantitas', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                                <Grid item xs={6} md={2}><TextField label="Satuan" value={item.satuan || ''} onChange={(e) => handleOcrItemChange(index, 'satuan', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                                <Grid item xs={6} md={2}><TextField label="Harga Satuan" type="number" value={item.harga_satuan || ''} onChange={(e) => handleOcrItemChange(index, 'harga_satuan', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                                <Grid item xs={6} md={2}><TextField label="Total Harga" type="number" value={item.total_harga || ''} onChange={(e) => handleOcrItemChange(index, 'total_harga', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                                {/* Tambahkan tombol untuk hapus item jika diperlukan */}
                            </Grid>
                        </Paper>
                    ))}
                    {/* Tambahkan tombol untuk tambah item baru jika diperlukan */}
                    <Divider sx={{ my: 2 }} />

                    {/* Rekapitulasi Finansial */}
                    <Typography variant="h6" gutterBottom>Rekapitulasi Finansial</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}><TextField label="Subtotal" type="number" value={getSafeValue('rekapitulasi_finansial.subtotal')} onChange={(e) => handleOcrDataChange('rekapitulasi_finansial.subtotal', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                        <Grid item xs={12} md={4}><TextField label="Diskon Global" type="number" value={getSafeValue('rekapitulasi_finansial.total_diskon_global_jumlah')} onChange={(e) => handleOcrDataChange('rekapitulasi_finansial.total_diskon_global_jumlah', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                        <Grid item xs={12} md={4}><TextField label="Total Tagihan Akhir" type="number" value={getSafeValue('rekapitulasi_finansial.total_tagihan_akhir')} onChange={(e) => handleOcrDataChange('rekapitulasi_finansial.total_tagihan_akhir', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                        {/* Tambahkan field finansial lainnya */}
                    </Grid>
                    <Divider sx={{ my: 2 }} />

                    {/* Raw JSON (opsional, bisa untuk debug) */}
                    <details className="mt-6 mb-4">
                        <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">Tampilkan Raw JSON Data</summary>
                        <Box
                            component="pre"
                            className="bg-gray-800 text-white p-3 rounded-md text-xs overflow-x-auto whitespace-pre-wrap break-all mt-2"
                        >
                            {JSON.stringify(ocrResult, null, 2)}
                        </Box>
                    </details>

                    {/* Raw OCR Text (Read-only) */}
                    <Typography variant="h6" gutterBottom>Raw OCR Text (Referensi)</Typography>
                    <TextField value={getSafeValue('raw_ocr_text')} multiline rows={5} fullWidth variant="outlined" InputProps={{ readOnly: true }} margin="dense" />

                    <Button variant="contained" color="secondary" onClick={handleSubmitData} disabled={isSubmitting} sx={{ mt: 3 }} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}>
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Data ke Database'}
                    </Button>
                    {submitError && <Alert severity="error" sx={{ mt: 2 }}>{submitError}</Alert>}


                </Paper>
            )}

            {submitSuccess && <Alert severity="success" sx={{ mt: 2 }}>Data invoice berhasil disimpan ke database!</Alert>}
        </Container>
    );
}

export default InvoiceUploadPage;