// src/pages/documentList/index.jsx
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Tabs, Tab, Paper, CircularProgress, Alert, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Link as RouterLink } from 'react-router-dom';

// Impor fungsi-fungsi API
import { getAllInvoices, getAllStnks, getAllBpkbs } from '../../services/apiService';

// Helper fungsi untuk format mata uang yang lebih aman
const formatNumber = (value, defaultValue = '-') => {
    // 1. Ubah input menjadi angka
    const number = parseInt(value * 1);
    console.log(value)
    console.log(number)

    // 2. Jika input bukan angka, kembalikan nilai default
    if (isNaN(number)) {
        return defaultValue;
    }

    // 3. Format angka ke dalam string dengan standar Indonesia ('id-ID')
    //    dan pastikan tidak ada angka desimal (maximumFractionDigits: 0)
    return number.toLocaleString('id-ID', {
        maximumFractionDigits: 0
    });
};

// Konfigurasi kolom untuk setiap jenis datatable
const invoiceColumns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'documentNumber', headerName: 'Nomor Dokumen', flex: 1 },
    { field: 'vendorName', headerName: 'Nama Vendor', flex: 1 },
    { field: 'issueDate', headerName: 'Tanggal Terbit', width: 150, type: 'date', valueGetter: (params) => params.value ? new Date(params.value) : null },
    { field: 'grandTotal', headerName: 'Total', width: 180, type: 'number', valueFormatter: (params) => params?.value ? formatNumber(params?.value) : params?.value  },
    {
        field: 'actions', headerName: 'Aksi', width: 150, sortable: false,
        renderCell: (params) => (
            <Button variant="outlined" size="small" component={RouterLink} to={`/invoice/${params.row.id}`}>Detail</Button>
        ),
    },
];

const stnkColumns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'nomorRegistrasi', headerName: 'Nomor Polisi', flex: 1 },
    { field: 'namaPemilik', headerName: 'Nama Pemilik', flex: 1 },
    { field: 'merk', headerName: 'Merk', width: 150 },
    { field: 'berlakuSampai', headerName: 'Berlaku Sampai', width: 150, type: 'date', valueGetter: (params) => params.value ? new Date(params.value) : null },
    {
        field: 'actions', headerName: 'Aksi', width: 150, sortable: false,
        renderCell: (params) => (
            <Button variant="outlined" size="small" component={RouterLink} to={`/stnk/${params.row.id}`}>Detail</Button>
        ),
    },
];

const bpkbColumns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'nomorBpkb', headerName: 'Nomor BPKB', flex: 1 },
    { field: 'nomorRegistrasi', headerName: 'Nomor Polisi', width: 150 },
    { field: 'namaPemilik', headerName: 'Nama Pemilik', flex: 1 },
    { field: 'merk', headerName: 'Merk', width: 150 },
    {
        field: 'actions', headerName: 'Aksi', width: 150, sortable: false,
        renderCell: (params) => (
            <Button variant="outlined" size="small" component={RouterLink} to={`/bpkb/${params.row.id}`}>Detail</Button>
        ),
    },
];

function DocumentListPage() {
    const [tabIndex, setTabIndex] = useState(0);
    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState(invoiceColumns);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            setRows([]);
            try {
                let data = [];
                if (tabIndex === 0) {
                    setColumns(invoiceColumns);
                    data = await getAllInvoices();
                } else if (tabIndex === 1) {
                    setColumns(stnkColumns);
                    data = await getAllStnks();
                } else if (tabIndex === 2) {
                    setColumns(bpkbColumns);
                    data = await getAllBpkbs();
                }
                setRows(data || []); // Pastikan data adalah array
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [tabIndex]);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                <CircularProgress />
            </Container>
        );
    }
    
    // 2. Tampilkan pesan error jika terjadi kesalahan
    if (error) {
        return <Container sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;
    }

    return (
        <Container sx={{ mt: 3, mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>Daftar Dokumen</Typography>
            <Paper elevation={3}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabIndex} onChange={handleTabChange} aria-label="document tabs">
                        <Tab label="Invoice" />
                        <Tab label="STNK" />
                        <Tab label="BPKB" />
                    </Tabs>
                </Box>
                <Box sx={{ p: 0, height: 600, width: '100%' }}>
                    {loading ? (
                         <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><CircularProgress /></Box>
                    ) : error ? (
                        <Alert severity="error" sx={{m: 2}}>{error}</Alert>
                    ) : (
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                            disableRowSelectionOnClick
                        />
                    )}
                </Box>
            </Paper>
        </Container>
    );
}

export default DocumentListPage;