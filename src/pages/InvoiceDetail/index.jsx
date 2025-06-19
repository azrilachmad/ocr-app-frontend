// src/pages/invoiceDetail/index.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { getInvoiceById } from '../../services/apiService';
import { Container, Typography, Paper, CircularProgress, Alert, Box, Grid, Divider, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Helper fungsi untuk format data
const displayData = (data, defaultValue = '-') => data ?? defaultValue;
const displayDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('id-ID') : '-';
const formatNumber = (value) => {
    const number = parseFloat(value * 1);
    return isNaN(number) ? '-' : number.toLocaleString('id-ID', { maximumFractionDigits: 0 });
};

function InvoiceDetailPage() {
    const { id } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getInvoiceById(id);
                setInvoice(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;
    if (!invoice) return <Container sx={{ mt: 5 }}><Typography>Invoice tidak ditemukan.</Typography></Container>;

    return (
        <Container sx={{ mt: 3, mb: 3 }}>
            <Button component={RouterLink} to="/documents" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                Kembali ke Daftar Dokumen
            </Button>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Detail Invoice: {displayData(invoice.documentNumber)}
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6">Informasi Umum</Typography>
                        <Typography><strong>Judul:</strong> {displayData(invoice.documentTitle)}</Typography>
                        <Typography><strong>Tipe Invoice:</strong> {displayData(invoice.penjualan)}</Typography>
                        <Typography><strong>Tanggal Terbit:</strong> {displayDate(invoice.issueDate)}</Typography>
                        <Typography><strong>Issue Date:</strong> {displayDate(invoice.issueDate)}</Typography>
                        <Typography><strong>Jatuh Tempo:</strong> {displayDate(invoice.dueDate)}</Typography>
                        <Typography><strong></strong> </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6">Pihak Terlibat</Typography>
                        <Typography><strong>Vendor:</strong> {displayData(invoice.vendorName)}</Typography>
                        <Typography><strong>Alamat Vendor:</strong> {displayData(invoice.vendorAddress)}</Typography>
                        <Typography><strong></strong> { }</Typography>
                        <Typography><strong>Pelanggan:</strong> {displayData(invoice.customerName)}</Typography>
                        <Typography><strong>Alamat Pelanggan:</strong> {displayData(invoice.customerBillingAddress)}</Typography>
                        <Typography><strong>NPWP:</strong> {displayData(invoice.customerNpwp)}</Typography>
                        <Typography><strong>No. Telp:</strong> {displayData(invoice.customerPhone)}</Typography>


                    </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Rincian Item</Typography>
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Deskripsi</TableCell>
                                <TableCell align="right">Kuantitas</TableCell>
                                <TableCell align="right">Harga Satuan</TableCell>
                                <TableCell align="right">Total</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {invoice.lineItems?.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{displayData(item.description)}</TableCell>
                                    <TableCell align="right">{formatNumber(item.quantity)}</TableCell>
                                    <TableCell align="right">{formatNumber(item.unitPrice)}</TableCell>
                                    <TableCell align="right">{formatNumber(item.totalPrice)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <Typography sx={{ p: 3 }}><strong>Grand Total:</strong> {displayData(formatNumber(invoice.grandTotal))}</Typography>

                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
}
export default InvoiceDetailPage;