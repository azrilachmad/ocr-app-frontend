// src/components/forms/StnkForm.jsx
import React from 'react';
import { Grid, TextField, Typography } from '@mui/material';

const getSafeValue = (data, path, defaultValue = '') => {
    return path.split('.').reduce((acc, part) => acc && acc[part] != null ? acc[part] : defaultValue, data);
};

const StnkForm = ({ data, handleDataChange }) => {
    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}><TextField label="No." value={getSafeValue(data, 'data_kendaraan.no')} onChange={(e) => handleDataChange('data_kendaraan.no', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
            <Grid item xs={12} md={6}><TextField label="Nomor Registrasi" value={getSafeValue(data, 'data_kendaraan.nomor_registrasi')} onChange={(e) => handleDataChange('data_kendaraan.nomor_registrasi', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
            <Grid item xs={12} md={6}><TextField label="Nama Pemilik" value={getSafeValue(data, 'data_kendaraan.nama_pemilik')} onChange={(e) => handleDataChange('data_kendaraan.nama_pemilik', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
            <Grid item xs={12} md={6}><TextField label="Alamat" value={getSafeValue(data, 'data_kendaraan.alamat')} onChange={(e) => handleDataChange('data_kendaraan.alamat', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
            <Grid item xs={12} md={4}><TextField label="Merk" value={getSafeValue(data, 'data_kendaraan.merk')} onChange={(e) => handleDataChange('data_kendaraan.merk', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
            <Grid item xs={12} md={4}><TextField label="Tipe" value={getSafeValue(data, 'data_kendaraan.tipe')} onChange={(e) => handleDataChange('data_kendaraan.tipe', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
            <Grid item xs={12} md={4}><TextField label="Model" value={getSafeValue(data, 'data_kendaraan.model')} onChange={(e) => handleDataChange('data_kendaraan.model', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
            <Grid item xs={12} md={4}><TextField label="Tahun Pembuatan" value={getSafeValue(data, 'data_kendaraan.tahun_pembuatan')} onChange={(e) => handleDataChange('data_kendaraan.tahun_pembuatan', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
            <Grid item xs={12} md={4}><TextField label="Isi Silinder" value={getSafeValue(data, 'data_kendaraan.isi_silinder')} onChange={(e) => handleDataChange('data_kendaraan.isi_silinder', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
            <Grid item xs={12} md={4}><TextField label="Warna" value={getSafeValue(data, 'data_kendaraan.warna')} onChange={(e) => handleDataChange('data_kendaraan.warna', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
            <Grid item xs={12} md={6}><TextField label="Nomor Rangka" value={getSafeValue(data, 'data_kendaraan.nomor_rangka')} onChange={(e) => handleDataChange('data_kendaraan.nomor_rangka', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
            <Grid item xs={12} md={6}><TextField label="Nomor Mesin" value={getSafeValue(data, 'data_kendaraan.nomor_mesin')} onChange={(e) => handleDataChange('data_kendaraan.nomor_mesin', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
            <Grid item xs={12} md={6}><TextField label="Berlaku Sampai" type="date" value={getSafeValue(data, 'data_kendaraan.berlaku_sampai')} onChange={(e) => handleDataChange('data_kendaraan.berlaku_sampai', e.target.value)} fullWidth margin="dense" size="small" InputLabelProps={{ shrink: true }}/></Grid>
        </Grid>
    );
};
export default StnkForm;