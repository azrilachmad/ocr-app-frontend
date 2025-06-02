// src/pages/InvoiceDetail/index.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container, Typography, Paper, CircularProgress, Alert, Box, Grid,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const API_BASE_URL = 'http://localhost:3001/api/invoice';

function InvoiceDetailPage() {
    const { id: invoiceId } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteError, setDeleteError] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);


    useEffect(() => {
        const fetchInvoiceDetail = async () => {
            if (!invoiceId) return;
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_BASE_URL}/${invoiceId}`);
                setInvoice(response.data.data.invoice);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Gagal mengambil detail invoice.');
                console.error("Error fetching invoice detail:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoiceDetail();
    }, [invoiceId]);

    const handleDelete = async () => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus invoice #${invoiceId}?`)) {
            setIsDeleting(true);
            setDeleteError(null);
            try {
                await axios.delete(`${API_BASE_URL}/${invoiceId}`);
                // Redirect ke halaman daftar invoice setelah berhasil hapus
                navigate('/invoices', { state: { message: `Invoice #${invoiceId} berhasil dihapus.` } });
            } catch (err) {
                setDeleteError(err.response?.data?.message || err.message || 'Gagal menghapus invoice.');
                console.error("Error deleting invoice:", err);
                setIsDeleting(false);
            }
            // Tidak perlu setIsDeleting(false) jika navigasi berhasil, karena komponen akan unmount
        }
    };

    const displayData = (data, defaultValue = '-') => data ?? defaultValue;
    const displayDate = (dateString, defaultValue = '-') => dateString ? new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : defaultValue;
    const displayCurrency = (amount, currencyCode, defaultValue = '-') => {
        const validAmount = parseFloat(amount);
        if (isNaN(validAmount)) {
            return defaultValue;
        }

        // JIKA currencyCode null, undefined, atau string kosong, gunakan 'IDR' sebagai default
        const finalCurrencyCode = currencyCode || 'IDR';

        try {
            return validAmount.toLocaleString('id-ID', {
                style: 'currency',
                currency: finalCurrencyCode // Gunakan finalCurrencyCode yang sudah divalidasi
            });
        } catch (e) {
            // Jika karena suatu alasan finalCurrencyCode masih tidak valid (sangat jarang jika sudah ada default 'IDR')
            console.warn("Error saat format mata uang dengan kode:", finalCurrencyCode, e);
            // Sebagai fallback, tampilkan hanya angkanya
            return validAmount.toLocaleString('id-ID');
        }
    };

    if (loading) return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;
    if (!invoice) return <Container sx={{ mt: 5 }}><Typography>Invoice tidak ditemukan.</Typography></Container>;

    return (
        <Container sx={{ mt: 3, mb: 3 }}>
            <Button component={RouterLink} to="/invoices" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                Kembali ke Daftar
            </Button>

            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Detail Invoice: {displayData(invoice.documentNumber)}
                    </Typography>
                    <Box sx={{ mt: { xs: 2, sm: 0 } }}>
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            sx={{ mr: 1 }}
                            component={RouterLink} // Tambahkan ini
                            to={`/invoice/${invoiceId}/edit`} // Arahkan ke rute edit
                        // disabled={false} // Hapus atau set ke false
                        >
                            Edit
                        </Button>
                        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? <CircularProgress size={20} color="inherit" /> : 'Hapus'}
                        </Button>
                    </Box>
                </Box>
                {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6">Informasi Umum</Typography>
                        <Typography><strong>Tipe Dokumen:</strong> {displayData(invoice.invoiceType)}</Typography>
                        <Typography><strong>Judul:</strong> {displayData(invoice.documentTitle)}</Typography>
                        <Typography><strong>No. Faktur Pajak:</strong> {displayData(invoice.taxInvoiceNumber)}</Typography>
                        <Typography><strong>No. PO:</strong> {displayData(invoice.purchaseOrderNumber)}</Typography>
                        <Typography><strong>No. SO:</strong> {displayData(invoice.salesOrderNumber)}</Typography>
                        <Typography><strong>Tanggal Terbit:</strong> {displayDate(invoice.issueDate)}</Typography>
                        <Typography><strong>Tanggal Jatuh Tempo:</strong> {displayDate(invoice.dueDate)}</Typography>
                        <Typography><strong>Salesman:</strong> {displayData(invoice.salespersonName)}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6">Pihak Terlibat</Typography>
                        <Typography><strong>Vendor:</strong> {displayData(invoice.vendorName)}</Typography>
                        <Typography sx={{ fontSize: '0.9rem', pl: 1 }}>Alamat: {displayData(invoice.vendorAddress)}</Typography>
                        <Typography sx={{ fontSize: '0.9rem', pl: 1 }}>NPWP: {displayData(invoice.vendorNpwp)}</Typography>
                        <Typography><strong>Pelanggan:</strong> {displayData(invoice.customerName)}</Typography>
                        <Typography sx={{ fontSize: '0.9rem', pl: 1 }}>Alamat: {displayData(invoice.customerBillingAddress)}</Typography>
                    </Grid>
                    <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6">Rekapitulasi Finansial</Typography>
                        <Typography><strong>Subtotal:</strong> {displayCurrency(invoice.subtotal, invoice.currency)}</Typography>
                        <Typography><strong>Diskon Global:</strong> {displayCurrency(invoice.globalDiscountAmount, invoice.currency)}</Typography>
                        <Typography><strong>DPP:</strong> {displayCurrency(invoice.taxableAmountDpp, invoice.currency)}</Typography>
                        <Typography><strong>PPN:</strong> {displayCurrency(invoice.vatAmount, invoice.currency)}</Typography>
                        <Typography><strong>Ongkos Kirim:</strong> {displayCurrency(invoice.shippingCost, invoice.currency)}</Typography>
                        <Typography><strong>Total Tagihan:</strong> {displayCurrency(invoice.grandTotal, invoice.currency)}</Typography>
                        <Typography><strong>Terbilang:</strong> {displayData(invoice.amountInWords)}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6">Detail Pembayaran</Typography>
                        <Typography><strong>Metode:</strong> {displayData(invoice.paymentMethod)}</Typography>
                        <Typography><strong>Bank:</strong> {displayData(invoice.paymentBankName)}</Typography>
                        <Typography><strong>No. Rekening:</strong> {displayData(invoice.paymentAccountNumber)}</Typography>
                    </Grid>
                    <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                    <Grid item xs={12}>
                        <Typography variant="h6">Informasi Legal & Catatan</Typography>
                        <Typography><strong>Nama Penandatangan:</strong> {displayData(invoice.signerName)}</Typography>
                        <Typography><strong>Jabatan:</strong> {displayData(invoice.signerPosition)}</Typography>
                        <Typography><strong>No. SIPA:</strong> {displayData(invoice.sipaNumber)}</Typography>
                        <Typography><strong>No. SIK:</strong> {displayData(invoice.sikNumber)}</Typography>
                        <Typography><strong>Catatan:</strong> {displayData(invoice.notes)}</Typography>
                    </Grid>
                </Grid>

                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Item Invoice</Typography>
                <TableContainer component={Paper} elevation={2}>
                    <Table size="small">
                        <TableHead sx={{ backgroundColor: 'grey.200' }}>
                            <TableRow>
                                <TableCell>Deskripsi</TableCell>
                                <TableCell align="right">Kuantitas</TableCell>
                                <TableCell>Satuan</TableCell>
                                <TableCell align="right">Harga Satuan</TableCell>
                                <TableCell align="right">Diskon (%)</TableCell>
                                <TableCell align="right">Total Harga</TableCell>
                                <TableCell>Batch</TableCell>
                                <TableCell>ED</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {invoice.lineItems?.map((item, index) => (
                                <TableRow key={item.id || index}>
                                    <TableCell>{displayData(item.description)}</TableCell>
                                    <TableCell align="right">{displayData(item.quantity)}</TableCell>
                                    <TableCell>{displayData(item.unit)}</TableCell>
                                    <TableCell align="right">{displayCurrency(item.unitPrice, invoice.currency)}</TableCell>
                                    <TableCell align="right">{displayData(item.discountPercentage)}</TableCell>
                                    <TableCell align="right">{displayCurrency(item.totalPrice, invoice.currency)}</TableCell>
                                    <TableCell>{displayData(item.batchNumber)}</TableCell>
                                    <TableCell>{displayDate(item.expiryDate)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
}
export default InvoiceDetailPage;