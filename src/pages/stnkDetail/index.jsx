// src/pages/stnkDetail/index.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { getStnkById } from '../../services/apiService';
import {
    Container, Typography, Paper, CircularProgress, Alert,
    Box, Grid, Divider, Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Komponen helper untuk membuat baris data yang rapi
const DetailRow = ({ label, value }) => (
    <Grid container item xs={12} spacing={1}>
        <Grid item xs={4} md={3}>
            <Typography component="span" sx={{ fontWeight: 'bold' }}>{label}</Typography>
        </Grid>
        <Grid item xs={1}>
            <Typography component="span">:</Typography>
        </Grid>
        <Grid item xs={7} md={8}>
            <Typography component="span">{value ?? '-'}</Typography>
        </Grid>
    </Grid>
);

const displayDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';

function StnkDetailPage() {
    const { id } = useParams();
    const [stnk, setStnk] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await getStnkById(id);
                setStnk(data);
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
    if (!stnk) return <Container sx={{ mt: 5 }}><Typography>Data STNK tidak ditemukan.</Typography></Container>;

    return (
        <Container sx={{ mt: 3, mb: 3 }}>
            <Button component={RouterLink} to="/documents" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                Kembali ke Daftar
            </Button>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Detail STNK: {stnk.no ?? '-'}
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                    <Grid item xs={12} >
                        <Typography variant="h6" gutterBottom>Data Pemilik</Typography>
                        <Grid container spacing={1}>
                            <DetailRow label="Nama Pemilik" value={stnk.namaPemilik} />
                            <DetailRow label="Alamat" value={stnk.alamat} />
                            <DetailRow label="NIK" value={stnk.nik} />
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>Data Kendaraan</Typography>
                        <Grid container spacing={1}>
                            <DetailRow label="Nomor Registrasi" value={`${stnk.nomorRegistrasi}`} />
                            <DetailRow label="Merk" value={`${stnk.merk ?? ''}`} />
                            <DetailRow label="Tipe" value={`${stnk.tipe ?? ''}`} />
                            <DetailRow label="Jenis" value={`${stnk.jenis ?? ''}`} />
                            <DetailRow label="Model" value={`${stnk.model ?? ''}`} />
                            <DetailRow label="Tahun Pembuatan" value={stnk.tahunPembuatan} />
                            <DetailRow label="Isi Silinder" value={stnk.isiSilinderDayaListrik} />
                            <DetailRow label="Warna" value={stnk.warna} />
                            <DetailRow label="Bahan Bakar" value={stnk.bahanBakar} />
                            <DetailRow label="Warna TNKB" value={stnk.warnaTnkb} />
                            <DetailRow label="Tahun Registrasi" value={stnk.tahunRegistrasi} />
                        </Grid>
                    </Grid>
                    <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Nomor Identifikasi</Typography>
                        <Grid container spacing={1}>
                            <DetailRow label="Nomor Rangka" value={stnk.nomorRangka} />
                            <DetailRow label="Nomor Mesin" value={stnk.nomorMesin} />
                            <DetailRow label="Nomor BPKB" value={stnk.nomorBpkb} />
                            <DetailRow label="Nomor Urut Pendaftaran" value={stnk.nomorUrutPendaftaran} />
                            <DetailRow label="Kode Lokasi" value={stnk.kodeLokasi} />

                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Masa Berlaku</Typography>
                        <Grid container spacing={1}>
                            <DetailRow label="Berlaku Sampai" value={displayDate(stnk.berlakuSampai)} />
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}
export default StnkDetailPage;