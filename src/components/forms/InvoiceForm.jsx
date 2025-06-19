// src/components/forms/InvoiceForm.jsx
import React from 'react';
import { Grid, TextField, Typography, Divider, Paper, Box } from '@mui/material';

// Helper untuk mendapatkan nilai dengan aman dari objek bersarang
const getSafeValue = (data, path, defaultValue = '') => {
    return path.split('.').reduce((acc, part) => acc && acc[part] != null ? acc[part] : defaultValue, data);
};

const InvoiceForm = ({ data, handleDataChange, handleItemChange }) => {
    return (
        <Box>
            {/* --- INFORMASI UMUM --- */}
            <Typography variant="h6" gutterBottom>Informasi Umum</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}><TextField label="Tipe Dokumen" value={getSafeValue(data, 'informasi_umum.tipe_dokumen')} onChange={(e) => handleDataChange('informasi_umum.tipe_dokumen', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
                <Grid item xs={12} md={6}><TextField label="Judul Dokumen" value={getSafeValue(data, 'informasi_umum.judul_dokumen')} onChange={(e) => handleDataChange('informasi_umum.judul_dokumen', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
                <Grid item xs={12} md={6}><TextField label="Nomor Dokumen" value={getSafeValue(data, 'informasi_umum.nomor_dokumen')} onChange={(e) => handleDataChange('informasi_umum.nomor_dokumen', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
                <Grid item xs={12} md={6}><TextField label="Nomor Faktur Pajak" value={getSafeValue(data, 'informasi_umum.nomor_faktur_pajak')} onChange={(e) => handleDataChange('informasi_umum.nomor_faktur_pajak', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
                <Grid item xs={12} md={6}><TextField label="Nomor PO" value={getSafeValue(data, 'informasi_umum.nomor_purchase_order')} onChange={(e) => handleDataChange('informasi_umum.nomor_purchase_order', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
                <Grid item xs={12} md={6}><TextField label="Nomor SO" value={getSafeValue(data, 'informasi_umum.nomor_sales_order')} onChange={(e) => handleDataChange('informasi_umum.nomor_sales_order', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
                <Grid item xs={12} md={6}><TextField label="Tanggal Terbit" type="date" value={getSafeValue(data, 'informasi_umum.tanggal_terbit')} onChange={(e) => handleDataChange('informasi_umum.tanggal_terbit', e.target.value)} fullWidth margin="dense" size="small" InputLabelProps={{ shrink: true }}/></Grid>
                <Grid item xs={12} md={6}><TextField label="Tanggal Jatuh Tempo" type="date" value={getSafeValue(data, 'informasi_umum.tanggal_jatuh_tempo')} onChange={(e) => handleDataChange('informasi_umum.tanggal_jatuh_tempo', e.target.value)} fullWidth margin="dense" size="small" InputLabelProps={{ shrink: true }}/></Grid>
                <Grid item xs={12} md={6}><TextField label="Nama Salesman" value={getSafeValue(data, 'informasi_umum.nama_salesman')} onChange={(e) => handleDataChange('informasi_umum.nama_salesman', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />

            {/* --- PIHAK TERLIBAT --- */}
            <Typography variant="h6" gutterBottom>Pihak Terlibat</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Vendor</Typography>
                    <TextField label="Nama Vendor" value={getSafeValue(data, 'pihak_terlibat.vendor.nama')} onChange={(e) => handleDataChange('pihak_terlibat.vendor.nama', e.target.value)} fullWidth margin="dense" size="small"/>
                    <TextField label="Alamat Vendor" value={getSafeValue(data, 'pihak_terlibat.vendor.alamat')} onChange={(e) => handleDataChange('pihak_terlibat.vendor.alamat', e.target.value)} fullWidth margin="dense" size="small" multiline rows={2}/>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Pelanggan</Typography>
                    <TextField label="Nama Pelanggan" value={getSafeValue(data, 'pihak_terlibat.pelanggan.nama')} onChange={(e) => handleDataChange('pihak_terlibat.pelanggan.nama', e.target.value)} fullWidth margin="dense" size="small"/>
                    <TextField label="Alamat Penagihan" value={getSafeValue(data, 'pihak_terlibat.pelanggan.alamat_penagihan')} onChange={(e) => handleDataChange('pihak_terlibat.pelanggan.alamat_penagihan', e.target.value)} fullWidth margin="dense" size="small" multiline rows={2}/>
                </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />

            {/* --- ITEM BARIS --- */}
            <Typography variant="h6" gutterBottom>Item Invoice</Typography>
            {data.item_baris?.map((item, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={1}>
                        <Grid item xs={12} md={4}><TextField label={`Deskripsi Item ${index + 1}`} value={item.deskripsi || ''} onChange={(e) => handleItemChange(index, 'deskripsi', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
                        <Grid item xs={6} md={2}><TextField label="Kuantitas" type="number" value={item.kuantitas ?? ''} onChange={(e) => handleItemChange(index, 'kuantitas', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
                        <Grid item xs={6} md={2}><TextField label="Harga Satuan" type="number" value={item.harga_satuan ?? ''} onChange={(e) => handleItemChange(index, 'harga_satuan', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
                        <Grid item xs={6} md={2}><TextField label="Diskon (%)" type="number" value={item.diskon_item_persen ?? ''} onChange={(e) => handleItemChange(index, 'diskon_item_persen', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
                        <Grid item xs={6} md={2}><TextField label="Total" type="number" value={item.total_harga_item ?? ''} onChange={(e) => handleItemChange(index, 'total_harga_item', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
                    </Grid>
                </Paper>
            ))}
            <Divider sx={{ my: 2 }} />

            {/* --- REKAPITULASI FINANSIAL --- */}
            <Typography variant="h6" gutterBottom>Rekapitulasi Finansial</Typography>
            <Grid container spacing={2}>
                 <Grid item xs={12} sm={6} md={4}><TextField label="Subtotal" type="number" value={getSafeValue(data, 'rekapitulasi_finansial.subtotal_sebelum_diskon_pajak_global')} onChange={(e) => handleDataChange('rekapitulasi_finansial.subtotal_sebelum_diskon_pajak_global', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
                 <Grid item xs={12} sm={6} md={4}><TextField label="Diskon Global" type="number" value={getSafeValue(data, 'rekapitulasi_finansial.diskon_global_jumlah')} onChange={(e) => handleDataChange('rekapitulasi_finansial.diskon_global_jumlah', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
                 <Grid item xs={12} sm={6} md={4}><TextField label="PPN" type="number" value={getSafeValue(data, 'rekapitulasi_finansial.pajak_ppn_jumlah')} onChange={(e) => handleDataChange('rekapitulasi_finansial.pajak_ppn_jumlah', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
                 <Grid item xs={12} sm={6} md={4}><TextField label="Total Tagihan" type="number" value={getSafeValue(data, 'rekapitulasi_finansial.total_keseluruhan')} onChange={(e) => handleDataChange('rekapitulasi_finansial.total_keseluruhan', e.target.value)} fullWidth margin="dense" size="small"/></Grid>
            </Grid>
        </Box>
    );
};
export default InvoiceForm;