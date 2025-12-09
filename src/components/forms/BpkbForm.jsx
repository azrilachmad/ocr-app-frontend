// src/components/forms/BpkbForm.jsx
import React from 'react';
import { Grid, TextField, Typography, Divider, Box } from '@mui/material';

// Helper untuk mendapatkan nilai dengan aman dari objek bersarang
const getSafeValue = (data, path, defaultValue = '') => {
    return path.split('.').reduce((acc, part) => acc && acc[part] != null ? acc[part] : defaultValue, data);
};

const BpkbForm = ({ data, handleDataChange }) => {
    return (
        <Box>
            <TextField
                label="Nomor BPKB"
                value={getSafeValue(data, 'no')}
                onChange={(e) => handleDataChange('no', e.target.value)}
                fullWidth
                margin="normal"
                size="small"
                sx={{ mb: 2 }}
            />
            <Divider />

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>I. Identitas Pemilik</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}><TextField label="Nama Pemilik" value={getSafeValue(data, 'identitas_pemilik.nama_pemilik')} onChange={(e) => handleDataChange('identitas_pemilik.nama_pemilik', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={6}><TextField label="Pekerjaan" value={getSafeValue(data, 'identitas_pemilik.pekerjaan')} onChange={(e) => handleDataChange('identitas_pemilik.pekerjaan', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12}><TextField label="Alamat" value={getSafeValue(data, 'identitas_pemilik.alamat')} onChange={(e) => handleDataChange('identitas_pemilik.alamat', e.target.value)} fullWidth margin="dense" size="small" multiline rows={2} /></Grid>
                <Grid item xs={12} md={6}><TextField label="Nomor KTP" value={getSafeValue(data, 'identitas_pemilik.nomor_ktp')} onChange={(e) => handleDataChange('identitas_pemilik.nomor_ktp', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={6}><TextField label="Lokasi Dikeluarkan" value={getSafeValue(data, 'identitas_pemilik.lokasi_dikeluarkan')} onChange={(e) => handleDataChange('identitas_pemilik.lokasi_dikeluarkan', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={6}><TextField label="Tanggal Dikeluarkan" type="date" value={getSafeValue(data, 'identitas_pemilik.tanggal_dikeluarkan')} onChange={(e) => handleDataChange('identitas_pemilik.tanggal_dikeluarkan', e.target.value)} fullWidth margin="dense" size="small" InputLabelProps={{ shrink: true }} /></Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>II. Identitas Kendaraan</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}><TextField label="Nomor Registrasi" value={getSafeValue(data, 'identitas_kendaraan.nomor_registrasi')} onChange={(e) => handleDataChange('identitas_kendaraan.nomor_registrasi', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={4}><TextField label="Merk" value={getSafeValue(data, 'identitas_kendaraan.merk')} onChange={(e) => handleDataChange('identitas_kendaraan.merk', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={4}><TextField label="Tipe" value={getSafeValue(data, 'identitas_kendaraan.tipe')} onChange={(e) => handleDataChange('identitas_kendaraan.tipe', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={4}><TextField label="Jenis" value={getSafeValue(data, 'identitas_kendaraan.jenis')} onChange={(e) => handleDataChange('identitas_kendaraan.jenis', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={4}><TextField label="Model" value={getSafeValue(data, 'identitas_kendaraan.model')} onChange={(e) => handleDataChange('identitas_kendaraan.model', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={4}><TextField label="Tahun Pembuatan" value={getSafeValue(data, 'identitas_kendaraan.tahun_pembuatan')} onChange={(e) => handleDataChange('identitas_kendaraan.tahun_pembuatan', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={4}><TextField label="Isi Silinder" value={getSafeValue(data, 'identitas_kendaraan.isi_silinder')} onChange={(e) => handleDataChange('identitas_kendaraan.isi_silinder', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={4}><TextField label="Warna" value={getSafeValue(data, 'identitas_kendaraan.warna')} onChange={(e) => handleDataChange('identitas_kendaraan.warna', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={4}><TextField label="Bahan Bakar" value={getSafeValue(data, 'identitas_kendaraan.bahan_bakar')} onChange={(e) => handleDataChange('identitas_kendaraan.bahan_bakar', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={4}><TextField label="Jumlah Submu" value={getSafeValue(data, 'identitas_kendaraan.jumlah_sumbu')} onChange={(e) => handleDataChange('identitas_kendaraan.jumlah_sumbu', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={4}><TextField label="Jumlah Roda" value={getSafeValue(data, 'identitas_kendaraan.jumlah_roda')} onChange={(e) => handleDataChange('identitas_kendaraan.jumlah_roda', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={6}><TextField label="Nomor Rangka" value={getSafeValue(data, 'identitas_kendaraan.nomor_rangka')} onChange={(e) => handleDataChange('identitas_kendaraan.nomor_rangka', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={6}><TextField label="Nomor Mesin" value={getSafeValue(data, 'identitas_kendaraan.nomor_mesin')} onChange={(e) => handleDataChange('identitas_kendaraan.nomor_mesin', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={6}><TextField label="No. Sertifikat Uji Tipe" value={getSafeValue(data, 'identitas_kendaraan.no_sertifikat_uji_tipe')} onChange={(e) => handleDataChange('identitas_kendaraan.no_sertifikat_uji_tipe', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>III. Dokumen Registrasi Pertama</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}><TextField label="Nomor Faktur" value={getSafeValue(data, 'dokumen_registrasi_pertama.nomor_faktur')} onChange={(e) => handleDataChange('dokumen_registrasi_pertama.nomor_faktur', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={6}><TextField label="Tanggal Faktur" type="date" value={getSafeValue(data, 'dokumen_registrasi_pertama.tanggal')} onChange={(e) => handleDataChange('dokumen_registrasi_pertama.tanggal', e.target.value)} fullWidth margin="dense" size="small" InputLabelProps={{ shrink: true }} /></Grid>
                <Grid item xs={12} md={6}><TextField label="ATPM/Importir" value={getSafeValue(data, 'dokumen_registrasi_pertama.atpm_importir')} onChange={(e) => handleDataChange('dokumen_registrasi_pertama.atpm_importir', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={6}><TextField label="Nomor PIB" value={getSafeValue(data, 'dokumen_registrasi_pertama.nomor_pib')} onChange={(e) => handleDataChange('dokumen_registrasi_pertama.nomor_pib', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={6}><TextField label="Nomor SUT" value={getSafeValue(data, 'dokumen_registrasi_pertama.nomor_sut')} onChange={(e) => handleDataChange('dokumen_registrasi_pertama.nomor_sut', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={6}><TextField label="Nomor TPT" value={getSafeValue(data, 'dokumen_registrasi_pertama.nomor_tpt')} onChange={(e) => handleDataChange('dokumen_registrasi_pertama.nomor_tpt', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={6}><TextField label="No. Form A / B / C" value={getSafeValue(data, 'dokumen_registrasi_pertama.no_form_abc')} onChange={(e) => handleDataChange('dokumen_registrasi_pertama.no_form_abc', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={6}><TextField label="Kantor Bea Cukai" value={getSafeValue(data, 'dokumen_registrasi_pertama.kantor_bea_cukai')} onChange={(e) => handleDataChange('dokumen_registrasi_pertama.kantor_bea_cukai', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12}><Typography variant="h8" >Lain-Lain:</Typography></Grid>
                <Grid item xs={12} md={6}><TextField label="No. Risalah Lelang" value={getSafeValue(data, 'dokumen_registrasi_pertama.lain_lain.no_risalah_lelang')} onChange={(e) => handleDataChange('dokumen_registrasi_pertama.lain_lain.no_risalah_lelang', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={6}><TextField label="No. Skep DUM TNI/Polri" value={getSafeValue(data, 'dokumen_registrasi_pertama.lain_lain.no_skep_DUM')} onChange={(e) => handleDataChange('dokumen_registrasi_pertama.lain_lain.no_skep_DUM', e.target.value)} fullWidth margin="dense" size="small" /></Grid>

            </Grid>
            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>IV. Perubahan Identitas</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}><TextField label="Perubahan" value={getSafeValue(data, 'perubahan_identitas.perubahan')} onChange={(e) => handleDataChange('perubahan_identitas.perubahan', e.target.value)} fullWidth margin="dense" size="small" multiline rows={2} /></Grid>
                <Grid item xs={12} md={6}><TextField label="Jenis Perubahan" value={getSafeValue(data, 'perubahan_identitas.jenis_perubahan')} onChange={(e) => handleDataChange('perubahan_identitas.jenis_perubahan', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={6}><TextField label="Dikeluarkan di" value={getSafeValue(data, 'perubahan_identitas.lokasi_perubahan_dikeluarkan')} onChange={(e) => handleDataChange('perubahan_identitas.lokasi_perubahan_dikeluarkan', e.target.value)} fullWidth margin="dense" size="small" /></Grid>
                <Grid item xs={12} md={6}><TextField label="Tanggal" type="date" value={getSafeValue(data, 'perubahan_identitas.tanggal_perubahan_dikeluarkan')} onChange={(e) => handleDataChange('perubahan_identitas.tanggal_perubahan_dikeluarkan', e.target.value)} fullWidth margin="dense" size="small" InputLabelProps={{ shrink: true }} /></Grid>

            </Grid>
        </Box>
    );
};
export default BpkbForm;