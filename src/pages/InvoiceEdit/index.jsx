// src/pages/InvoiceEdit/index.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import {
    Container, Typography, Button, Box, Paper, CircularProgress, Alert,
    TextField, Grid, Divider, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const API_BASE_URL = 'http://localhost:3001/api/invoice'; // Sesuaikan jika port backend Anda berbeda

function InvoiceEditPage() {
    const { id: invoiceId } = useParams();
    const navigate = useNavigate();

    // State untuk menyimpan data invoice yang akan diedit.
    // Strukturnya dibuat agar mirip dengan output Gemini untuk reusability fungsi handler.
    const [formData, setFormData] = useState(null);
    
    const [loading, setLoading] = useState(true); // Loading untuk mengambil data awal
    const [error, setError] = useState(null);
    
    const [isSaving, setIsSaving] = useState(false); // Loading untuk proses simpan
    const [saveError, setSaveError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Helper untuk konversi tanggal YYYY-MM-DD
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        // Cek apakah sudah YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString;
        }
        try {
            return new Date(dateString).toISOString().split('T')[0];
        } catch (e) {
            return '';
        }
    };

    useEffect(() => {
        const fetchInvoiceToEdit = async () => {
            if (!invoiceId) {
                setError("ID Invoice tidak valid.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_BASE_URL}/${invoiceId}`);
                const fetchedInvoice = response.data.data.invoice;

                // Transformasi data dari format database ke format form (mirip output Gemini)
                setFormData({
                    informasi_umum: {
                        tipe_dokumen: fetchedInvoice.invoiceType || 'tidak_diketahui',
                        judul_dokumen: fetchedInvoice.documentTitle,
                        nomor_dokumen: fetchedInvoice.documentNumber,
                        nomor_faktur_pajak: fetchedInvoice.taxInvoiceNumber,
                        nomor_purchase_order: fetchedInvoice.purchaseOrderNumber,
                        nomor_sales_order: fetchedInvoice.salesOrderNumber,
                        tanggal_terbit: formatDateForInput(fetchedInvoice.issueDate),
                        tanggal_jatuh_tempo: formatDateForInput(fetchedInvoice.dueDate),
                        nama_salesman: fetchedInvoice.salespersonName
                    },
                    pihak_terlibat: {
                        vendor: {
                            nama: fetchedInvoice.vendorName,
                            alamat: fetchedInvoice.vendorAddress,
                            telepon: fetchedInvoice.vendorPhone,
                            npwp: fetchedInvoice.vendorNpwp
                        },
                        pelanggan: {
                            nama: fetchedInvoice.customerName,
                            alamat_penagihan: fetchedInvoice.customerBillingAddress,
                            alamat_pengiriman: fetchedInvoice.customerShippingAddress,
                            telepon: fetchedInvoice.customerPhone,
                            npwp: fetchedInvoice.customerNpwp
                        }
                    },
                    item_baris: fetchedInvoice.lineItems?.map(item => ({
                        id: item.id, // Simpan ID item jika ada, untuk referensi (backend tidak memakainya saat ini)
                        deskripsi: item.description,
                        kuantitas: parseFloat(item.quantity) || null,
                        satuan: item.unit,
                        harga_satuan: parseFloat(item.unitPrice) || null,
                        diskon_persen: parseFloat(item.discountPercentage) || null,
                        diskon_jumlah: parseFloat(item.discountAmount) || null,
                        total_harga: parseFloat(item.totalPrice) || null,
                        nomor_batch: item.batchNumber,
                        tanggal_kedaluwarsa: formatDateForInput(item.expiryDate)
                    })) || [],
                    rekapitulasi_finansial: {
                        subtotal: parseFloat(fetchedInvoice.subtotal) || null,
                        total_diskon_global_jumlah: parseFloat(fetchedInvoice.globalDiscountAmount) || null,
                        dasar_pengenaan_pajak_dpp: parseFloat(fetchedInvoice.taxableAmountDpp) || null,
                        pajak_ppn_jumlah: parseFloat(fetchedInvoice.vatAmount) || null,
                        ongkos_kirim: parseFloat(fetchedInvoice.shippingCost) || null,
                        biaya_meterai: parseFloat(fetchedInvoice.stampDutyFee) || null,
                        total_tagihan_akhir: parseFloat(fetchedInvoice.grandTotal) || null,
                        mata_uang: fetchedInvoice.currency,
                        terbilang: fetchedInvoice.amountInWords
                    },
                    detail_pembayaran: {
                        metode: fetchedInvoice.paymentMethod,
                        nama_bank: fetchedInvoice.paymentBankName,
                        nomor_rekening: fetchedInvoice.paymentAccountNumber,
                        nama_pemilik_rekening: fetchedInvoice.paymentAccountName
                    },
                    informasi_legal_otorisasi: {
                        nama_penandatangan: fetchedInvoice.signerName,
                        jabatan_penandatangan: fetchedInvoice.signerPosition,
                        nomor_sipa: fetchedInvoice.sipaNumber,
                        nomor_sik: fetchedInvoice.sikNumber,
                        catatan: fetchedInvoice.notes
                    },
                    raw_ocr_text: fetchedInvoice.rawOcrText // Penting untuk dikirim kembali
                });

            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Gagal mengambil data invoice untuk diedit.');
                console.error("Error fetching invoice to edit:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoiceToEdit();
    }, [invoiceId]);

    const handleDataChange = (path, value) => {
        setFormData(prevData => {
            const newData = JSON.parse(JSON.stringify(prevData));
            let current = newData;
            const keys = path.split('.');
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    const handleItemChange = (itemIndex, fieldName, value) => {
        setFormData(prevData => {
            const newData = JSON.parse(JSON.stringify(prevData));
            if (newData.item_baris && newData.item_baris[itemIndex]) {
                let val = value;
                if (['kuantitas', 'harga_satuan', 'diskon_persen', 'diskon_jumlah', 'total_harga'].includes(fieldName)) {
                    val = value === '' ? null : parseFloat(value);
                    if (isNaN(val)) val = null;
                }
                newData.item_baris[itemIndex][fieldName] = val;
            }
            return newData;
        });
    };
    
    const getSafeValue = (path, defaultValue = '') => {
        if (!formData) return defaultValue;
        let current = formData;
        const keys = path.split('.');
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else { return defaultValue; }
        }
        return current === null ? defaultValue : current;
    };

    const handleSaveChanges = async () => {
        if (!formData) {
            setSaveError('Tidak ada data untuk disimpan.');
            return;
        }
        setIsSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        const apiUrl = `${API_BASE_URL}/${invoiceId}`;
        try {
            await axios.put(apiUrl, formData); // formData sudah dalam struktur yang diharapkan backend
            setSaveSuccess(true);
            setTimeout(() => navigate(`/invoice/${invoiceId}`, { state: { message: 'Invoice berhasil diperbarui!' } }), 1500);
        } catch (err) {
            setSaveError(err.response?.data?.message || err.message || 'Gagal memperbarui invoice.');
            console.error("Save Error (PUT request):", err);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;
    if (!formData) return <Container sx={{ mt: 5 }}><Typography>Memuat data invoice untuk diedit...</Typography></Container>;

    return (
        <Container sx={{ mt: 3, mb: 3 }}>
            <Button component={RouterLink} to={`/invoice/${invoiceId}`} startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                Batal & Kembali ke Detail
            </Button>
            <Typography variant="h4" gutterBottom>Edit Invoice #{invoiceId}</Typography>

            <Paper elevation={3} sx={{p:3}}>
                {/* Informasi Umum */}
                <Typography variant="h6" gutterBottom>Informasi Umum</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField label="Tipe Dokumen" value={getSafeValue('informasi_umum.tipe_dokumen')} onChange={(e) => handleDataChange('informasi_umum.tipe_dokumen', e.target.value)} fullWidth margin="dense" size="small"/>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField label="Nomor Dokumen" value={getSafeValue('informasi_umum.nomor_dokumen')} onChange={(e) => handleDataChange('informasi_umum.nomor_dokumen', e.target.value)} fullWidth margin="dense" size="small"/>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField label="Tanggal Terbit" type="date" value={getSafeValue('informasi_umum.tanggal_terbit')} onChange={(e) => handleDataChange('informasi_umum.tanggal_terbit', e.target.value)} fullWidth margin="dense" size="small" InputLabelProps={{ shrink: true }}/>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField label="Tanggal Jatuh Tempo" type="date" value={getSafeValue('informasi_umum.tanggal_jatuh_tempo')} onChange={(e) => handleDataChange('informasi_umum.tanggal_jatuh_tempo', e.target.value)} fullWidth margin="dense" size="small" InputLabelProps={{ shrink: true }}/>
                    </Grid>
                    {/* Tambahkan field informasi_umum lainnya di sini jika diperlukan */}
                </Grid>
                <Divider sx={{ my: 2 }} />

                {/* Pihak Terlibat */}
                <Typography variant="h6" gutterBottom>Pihak Terlibat</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1">Vendor</Typography>
                        <TextField label="Nama Vendor" value={getSafeValue('pihak_terlibat.vendor.nama')} onChange={(e) => handleDataChange('pihak_terlibat.vendor.nama', e.target.value)} fullWidth margin="dense" size="small"/>
                        <TextField label="Alamat Vendor" value={getSafeValue('pihak_terlibat.vendor.alamat')} onChange={(e) => handleDataChange('pihak_terlibat.vendor.alamat', e.target.value)} fullWidth margin="dense" size="small" multiline rows={2}/>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1">Pelanggan</Typography>
                        <TextField label="Nama Pelanggan" value={getSafeValue('pihak_terlibat.pelanggan.nama')} onChange={(e) => handleDataChange('pihak_terlibat.pelanggan.nama', e.target.value)} fullWidth margin="dense" size="small"/>
                        <TextField label="Alamat Penagihan Pelanggan" value={getSafeValue('pihak_terlibat.pelanggan.alamat_penagihan')} onChange={(e) => handleDataChange('pihak_terlibat.pelanggan.alamat_penagihan', e.target.value)} fullWidth margin="dense" size="small" multiline rows={2}/>
                    </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                
                {/* Item Baris */}
                <Typography variant="h6" gutterBottom>Item Invoice</Typography>
                {formData.item_baris?.map((item, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0' }}>
                        <Typography variant="subtitle2" gutterBottom>Item {index + 1}</Typography>
                        <Grid container spacing={1}>
                            <Grid item xs={12} md={4}><TextField label="Deskripsi" value={item.deskripsi || ''} onChange={(e) => handleItemChange(index, 'deskripsi', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
                            <Grid item xs={6} md={2}><TextField label="Kuantitas" type="number" value={item.kuantitas ?? ''} onChange={(e) => handleItemChange(index, 'kuantitas', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
                            <Grid item xs={6} md={2}><TextField label="Satuan" value={item.satuan || ''} onChange={(e) => handleItemChange(index, 'satuan', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
                            <Grid item xs={6} md={2}><TextField label="Harga Satuan" type="number" value={item.harga_satuan ?? ''} onChange={(e) => handleItemChange(index, 'harga_satuan', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
                            <Grid item xs={6} md={2}><TextField label="Total Harga" type="number" value={item.total_harga ?? ''} onChange={(e) => handleItemChange(index, 'total_harga', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
                            {/* Tambahkan field item lainnya jika perlu: diskon_persen, diskon_jumlah, nomor_batch, tanggal_kedaluwarsa */}
                        </Grid>
                    </Paper>
                ))}
                {/* Di sini bisa ditambahkan tombol untuk menambah/menghapus item jika diperlukan di masa depan */}
                <Divider sx={{ my: 2 }} />

                {/* Rekapitulasi Finansial */}
                <Typography variant="h6" gutterBottom>Rekapitulasi Finansial</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}><TextField label="Subtotal" type="number" value={getSafeValue('rekapitulasi_finansial.subtotal')} onChange={(e) => handleDataChange('rekapitulasi_finansial.subtotal', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
                    <Grid item xs={12} md={4}><TextField label="Diskon Global" type="number" value={getSafeValue('rekapitulasi_finansial.total_diskon_global_jumlah')} onChange={(e) => handleDataChange('rekapitulasi_finansial.total_diskon_global_jumlah', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
                    <Grid item xs={12} md={4}><TextField label="Total Tagihan Akhir" type="number" value={getSafeValue('rekapitulasi_finansial.total_tagihan_akhir')} onChange={(e) => handleDataChange('rekapitulasi_finansial.total_tagihan_akhir', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
                    {/* Tambahkan field finansial lainnya */}
                </Grid>
                <Divider sx={{ my: 2 }} />
                
                {/* Raw OCR Text tidak perlu diedit, tapi tetap dikirim sebagai bagian dari formData */}
                <input type="hidden" value={getSafeValue('raw_ocr_text')} />


                <Button variant="contained" color="primary" onClick={handleSaveChanges} disabled={isSaving} sx={{ mt: 3 }} startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}>
                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
                {saveError && <Alert severity="error" sx={{ mt: 2 }}>{saveError}</Alert>}
                {saveSuccess && <Alert severity="success" sx={{ mt: 2 }}>Invoice berhasil diperbarui!</Alert>}
            </Paper>
        </Container>
    );
}

export default InvoiceEditPage;