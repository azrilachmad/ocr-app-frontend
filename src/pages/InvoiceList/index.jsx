// src/pages/InvoiceList/index.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, CircularProgress,
    Alert, Box, Button
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom'; // Untuk navigasi
import AddIcon from '@mui/icons-material/Add'; // Ikon untuk tombol tambah

const API_BASE_URL = 'http://localhost:3001/api/invoice';

function InvoiceListPage() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                setLoading(true);
                setError(null);
                // Menggunakan endpoint /get-invoice sesuai definisi di backend route.js
                const response = await axios.get(`${API_BASE_URL}/get-invoice`);
                setInvoices(response.data.data.invoices || []);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Gagal mengambil data invoice.');
                console.error("Error fetching invoices:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    if (loading) {
        return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Container>;
    }
    if (error) {
        return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;
    }

    return (
        <Container sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Daftar Invoice
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    component={RouterLink}
                    to="/upload-invoice" // Arahkan ke halaman upload
                    startIcon={<AddIcon />}
                >
                    Tambah Invoice Baru
                </Button>
            </Box>

            {invoices.length === 0 ? (
                <Typography>Tidak ada invoice yang ditemukan.</Typography>
            ) : (
                <TableContainer component={Paper} elevation={3}>
                    <Table sx={{ minWidth: 650 }} aria-label="tabel invoice">
                        <TableHead sx={{ backgroundColor: 'primary.light' }}>
                            <TableRow>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>ID</TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Nomor Dokumen</TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Nama Vendor</TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Nama Pelanggan</TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Tanggal Terbit</TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }} align="right">Total Tagihan</TableCell>
                                <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }} align="center">Aksi</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {invoices.map((invoice) => (
                                <TableRow
                                    key={invoice.id}
                                    hover
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell component="th" scope="row">{invoice.id}</TableCell>
                                    <TableCell>{invoice.documentNumber || '-'}</TableCell>
                                    <TableCell>{invoice.vendorName || '-'}</TableCell>
                                    <TableCell>{invoice.customerName || '-'}</TableCell>
                                    <TableCell>{invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('id-ID') : '-'}</TableCell>
                                    <TableCell align="right">{invoice.grandTotal ? parseFloat(invoice.grandTotal).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' }) : '-'}</TableCell>
                                    <TableCell align="center">
                                        <Button 
                                            variant="outlined"
                                            size="small" 
                                            component={RouterLink} 
                                            to={`/invoice/${invoice.id}`} // Path ke halaman detail
                                        >
                                            Lihat Detail
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
}

export default InvoiceListPage;