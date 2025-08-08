import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { getKtpById } from '../../services/apiService';
import {
    Container, Typography, Paper, CircularProgress, Alert,
    Box, Grid, Divider, Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/ocr';

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

function KtpDetailPage() {
    const { id } = useParams();
    const [ktp, setKtp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await getKtpById(id);
                // const image = await getFileById(id)
                setKtp(data);
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
    if (!ktp) return <Container sx={{ mt: 5 }}><Typography>Data KTP tidak ditemukan.</Typography></Container>;
    console.log(ktp);

    return (
        <Container sx={{ mt: 3, mb: 3 }}>
            <Button component={RouterLink} to="/documents" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                Kembali ke Daftar
            </Button>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Detail KTP: {ktp.nik ?? '-'}
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                    <Grid item xs={12} >
                        <Typography variant="h6" gutterBottom>Data Pemilik</Typography>
                        <Grid container spacing={1}>
                            <DetailRow label="NIK" value={ktp.nik} />
                            <DetailRow label="Nama" value={ktp.nama} />
                            <DetailRow label="Tempat Tanggal Lahir" value={ktp.tempat_tgl_lahir} />
                            <DetailRow label="Golongan Darah" value={ktp.gol_darah} />
                            <DetailRow label="Alamat" value={ktp.alamat} />
                            <DetailRow label="RT" value={ktp.rt} />
                            <DetailRow label="RW" value={ktp.rw} />
                            <DetailRow label="Kelurahan / Desa" value={ktp.kel_desa} />
                            <DetailRow label="Kecamatan" value={ktp.kecamatan} />
                            <DetailRow label="Agama" value={ktp.agama} />
                            <DetailRow label="Status Perkawinan" value={ktp.status_perkawinan} />
                            <DetailRow label="Kewarganegaraan" value={ktp.kewarganegaraan} />
                            <DetailRow label="provinsi" value={ktp.provinsi} />
                            <DetailRow label="Kabupaten / Kota" value={ktp.kabupaten_kota} />
                            <DetailRow label="Tanggal Dibuat" value={ktp.tanggal_dibuat} />
                            <DetailRow label="Berlaku Hingga" value={ktp.berlaku_hingga} />
                        </Grid>
                    </Grid>
                    <Grid item xs={12} >
                        <Grid container spacing={1}>
                            <DetailRow label="Tanggal Diproses" value={ktp.tanggal_diproses} />
                            <DetailRow label="File" value={<img
                                // Gunakan endpoint baru yang kita buat di backend sebagai src
                                src={`${API_BASE_URL}/files/?documentType=ktp&documentId=${ktp.id}`}
                                alt={ktp.user_defilned_filename}
                                style={{
                                    width: '400px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    marginTop: '4px'
                                }}
                            />} />

                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}
export default KtpDetailPage;