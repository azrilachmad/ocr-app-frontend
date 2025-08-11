// src/pages/bpkbDetail/index.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { getBpkbById, getFileById } from '../../services/apiService';
import { Container, Typography, Paper, CircularProgress, Alert, Box, Grid, Divider, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Komponen helper yang bisa dipakai ulang (atau impor dari file terpisah)
const DetailRow = ({ label, value }) => (
    <Grid container item xs={12} spacing={1} sx={{ alignItems: 'flex-start' }}>
        <Grid item xs={4} md={3}>
            <Typography component="span" sx={{ fontWeight: 'bold' }}>{label}</Typography>
        </Grid>
        <Grid item xs={1} sx={{ textAlign: 'center' }}>
            <Typography component="span">:</Typography>
        </Grid>
        <Grid item xs={7} md={8}>
            <Typography component="span" sx={{ wordBreak: 'break-word' }}>{value ?? '-'}</Typography>
        </Grid>
    </Grid>
);

const displayDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';

function BpkbDetailPage() {
    const { id } = useParams();
    const [bpkb, setBpkb] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [file, setFile] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await getBpkbById(id);
                const image = await getFileById('bpkb', id);
                setFile(image);
                setBpkb(data);
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
    if (!bpkb) return <Container sx={{ mt: 5 }}><Typography>Data BPKB tidak ditemukan.</Typography></Container>;

    return (
        <Container sx={{ mt: 3, mb: 3 }}>
            <Button component={RouterLink} to="/documents" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
                Kembali ke Daftar
            </Button>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Detail BPKB No: {bpkb.nomorBpkb ?? '-'}
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={1}>
                    <Grid item xs={12} >
                        <img
                            // Gunakan endpoint baru yang kita buat di backend sebagai src
                            src={`${file.file_data}`}
                            alt={bpkb.user_defilned_filename}
                            style={{
                                width: '200px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                marginTop: '4px'
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} >
                        <DetailRow label="Tanggal Diproses" value={bpkb.tanggal_diproses} />
                    </Grid>
                </Grid>
                <Divider sx={{ mt: 3, mb: 2 }} />

                <Typography variant="h6" gutterBottom>I. Identitas Pemilik</Typography>
                <Grid container spacing={1} sx={{ pl: 2, mb: 2 }}>
                    <DetailRow label="Nama Pemilik" value={bpkb.namaPemilik} />
                    <DetailRow label="Pekerjaan" value={bpkb.pekerjaan} />
                    <DetailRow label="Alamat" value={bpkb.alamat} />
                    <DetailRow label="No. KTP" value={bpkb.nomorKtp} />
                    <DetailRow label="Dikeluarkan di" value={bpkb.lokasiDikeluarkan} />
                    <DetailRow label="Tanggal" value={bpkb.tanggalDikeluarkan} />
                </Grid>
                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>II. Identitas Kendaraan</Typography>
                <Grid container spacing={1} sx={{ pl: 2, mb: 2 }}>
                    <DetailRow label="Nomor Registrasi" value={bpkb.nomorRegistrasi} />
                    <DetailRow label="Merk" value={`${bpkb.merk ?? ''} `} />
                    <DetailRow label="Tipe" value={`${bpkb.tipe ?? ''}`} />
                    <DetailRow label="Jenis" value={bpkb.jenis} />
                    <DetailRow label="Model" value={bpkb.model} />
                    <DetailRow label="Tahun Pembuatan" value={bpkb.tahunPembuatan} />
                    <DetailRow label="Isi Silinder" value={bpkb.isiSilinder} />
                    <DetailRow label="Warna" value={bpkb.warna} />
                    <DetailRow label="Nomor Rangka" value={bpkb.nomorRangka} />
                    <DetailRow label="Nomor Mesin" value={bpkb.nomorMesin} />
                    <DetailRow label="Bahan Bakar" value={bpkb.bahanBakar} />
                    <DetailRow label="Jumlah Sumbu" value={bpkb.jumlahSumbu} />
                    <DetailRow label="Jumlah Roda" value={bpkb.jumlahRoda} />
                    <DetailRow label="No. Sertifikat Uji Tipe" value={bpkb.noSertifikatUjiTipe} />
                </Grid>
                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" gutterBottom>III. Dokumen Registrasi</Typography>
                <Grid container spacing={1} sx={{ pl: 2 }}>
                    <DetailRow label="Nomor Faktur" value={bpkb.nomorFaktur} />
                    <DetailRow label="Tanggal Faktur" value={displayDate(bpkb.tanggalFaktur)} />
                    <DetailRow label="ATPM / Importir" value={bpkb.atpmImportir} />
                    <DetailRow label="Nomor PIB" value={bpkb.nomorPib} />
                    <DetailRow label="No. SUT" value={bpkb.nomorSut} />
                    <DetailRow label="No. TPT" value={bpkb.nomorTpt} />
                    <DetailRow label="No. Form A / B / C" value={bpkb.noFormAbc} />
                    <DetailRow label="Kantor Bea Cukai" value={bpkb.kantorBeaCukai} />
                    <DetailRow label="Lain-lain" value={
                        <>
                            <DetailRow label="No. Risalah Lelang" value={bpkb.noRisalahLelang} />
                            <DetailRow label="No. Skep DUM TNI/Polri" value={bpkb.noSkepDum} />
                        </>
                    } />
                </Grid>

                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>IV. Perubahan Identitas</Typography>
                <Grid container spacing={1} sx={{ pl: 2, mb: 2 }}>
                    <DetailRow label="Perubahan" value={bpkb.perubahan} />
                    <DetailRow label="Jenis Perubahan" value={bpkb.jenisPerubahan} />
                    <DetailRow label="Dikeluarkan di" value={bpkb.lokasiPerubahanDikeluarkan} />
                    <DetailRow label="Tanggal" value={bpkb.tanggalPerubahanDikeluarkan} />
                </Grid>
                <Divider sx={{ my: 2 }} />
            </Paper>
        </Container >
    );
}
export default BpkbDetailPage;