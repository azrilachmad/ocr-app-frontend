// src/components/InvoiceResult.jsx
import React from 'react';
import {
  Box, Typography, Paper, Alert, Grid, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import PaymentsIcon from '@mui/icons-material/Payments';
import EventNoteIcon from '@mui/icons-material/EventNote';
import NotesIcon from '@mui/icons-material/Notes';

// Fungsi helper untuk memformat angka sebagai mata uang (contoh sederhana)
const formatCurrency = (amount, currencySymbol = '$') => {
  if (amount === null || amount === undefined) return '-';
  return `${currencySymbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Fungsi helper untuk memformat tanggal
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('id-ID', { // 'id-ID' untuk format Indonesia
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch (e) {
    return dateString; // Kembalikan string asli jika format tidak valid
  }
};

const SectionCard = ({ title, icon, children }) => (
  <Paper elevation={2} className="p-4 mb-6">
    <Box display="flex" alignItems="center" mb={2}>
      {icon && React.cloneElement(icon, { className: "mr-2 text-slate-600" })}
      <Typography variant="h6" component="h3" className="text-slate-700">
        {title}
      </Typography>
    </Box>
    <Divider className="mb-3"/>
    {children}
  </Paper>
);

const InfoListItem = ({ primary, secondary, dense = true }) => (
  <ListItem dense={dense} className="px-0">
    <ListItemText
      primary={<Typography variant="body2" className="font-semibold text-gray-600">{primary}</Typography>}
      secondary={<Typography variant="body2" color="textSecondary">{secondary || '-'}</Typography>}
    />
  </ListItem>
);


const InvoiceResult = ({ data, error }) => {
  if (error && !data) {
    return (
      <Alert severity="error" className="mt-4">
        Error: {typeof error === 'object' ? JSON.stringify(error) : error}
      </Alert>
    );
  }

  if (!data || !data.extracted_data) {
    return null;
  }

  const d = data.extracted_data; // Alias untuk data ekstraksi

  return (
    <Box className="mt-6 w-full max-w-3xl mx-auto"> {/* Meningkatkan max-width */}
      <Typography variant="h5" component="h2" className="mb-2 text-center text-slate-800">
        Detail Invoice: {d.nomor_invoice || data.fileName}
      </Typography>
      <Typography variant="body2" className="mb-6 text-center text-gray-500">
        File: {data.fileName} | Tipe: {data.processedFileType}
      </Typography>

      <Grid container spacing={3}>
        {/* Informasi Umum & Vendor */}
        <Grid item xs={12} md={6}>
          <SectionCard title="Informasi Invoice & Vendor" icon={<BusinessIcon />}>
            <List dense>
              <InfoListItem primary="Nomor Invoice" secondary={d.nomor_invoice} />
              <InfoListItem primary="Tanggal Invoice" secondary={formatDate(d.tanggal_invoice)} />
              <InfoListItem primary="Tanggal Jatuh Tempo" secondary={formatDate(d.tanggal_jatuh_tempo)} />
              <Divider className="my-2"/>
              <InfoListItem primary="Nama Vendor" secondary={d.nama_vendor?.replace(/\n/g, ', ')} />
              <InfoListItem primary="Alamat Vendor" secondary={d.alamat_vendor} />
              <InfoListItem primary="Telepon Vendor" secondary={d.telepon_vendor} />
              <InfoListItem primary="Email Vendor" secondary={d.email_vendor} />
              <InfoListItem primary="Website Vendor" secondary={d.website_vendor} />
              <InfoListItem primary="NPWP Vendor" secondary={d.npwp_vendor} />
            </List>
          </SectionCard>
        </Grid>

        {/* Informasi Pelanggan */}
        <Grid item xs={12} md={6}>
          <SectionCard title="Informasi Pelanggan" icon={<PersonIcon />}>
            <List dense>
              <InfoListItem primary="Nama Pelanggan" secondary={d.nama_pelanggan} />
              <InfoListItem primary="Alamat Pelanggan" secondary={d.alamat_pelanggan} />
              <InfoListItem primary="Telepon Pelanggan" secondary={d.telepon_pelanggan} />
              <InfoListItem primary="Email Pelanggan" secondary={d.email_pelanggan} />
            </List>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Item Baris */}
      {d.item_baris && d.item_baris.length > 0 && (
        <SectionCard title="Rincian Item" icon={<ReceiptIcon />}>
          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table size="small" aria-label="rincian item">
              <TableHead className="bg-slate-100">
                <TableRow>
                  <TableCell className="font-semibold">Deskripsi</TableCell>
                  <TableCell align="right" className="font-semibold">Kuantitas</TableCell>
                  <TableCell align="right" className="font-semibold">Satuan</TableCell>
                  <TableCell align="right" className="font-semibold">Harga Satuan</TableCell>
                  <TableCell align="right" className="font-semibold">Total Harga Item</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {d.item_baris.map((item, index) => (
                  <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <TableCell component="th" scope="row">{item.deskripsi || '-'}</TableCell>
                    <TableCell align="right">{item.kuantitas || '-'}</TableCell>
                    <TableCell align="right">{item.satuan || '-'}</TableCell>
                    <TableCell align="right">{formatCurrency(item.harga_satuan, d.mata_uang)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.total_harga_item, d.mata_uang)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </SectionCard>
      )}

      {/* Ringkasan Finansial */}
      <SectionCard title="Ringkasan Pembayaran" icon={<PaymentsIcon />}>
        <Grid container spacing={1}>
          <Grid item xs={6}><Typography variant="body2" className="text-gray-600">Subtotal Sebelum Diskon/Pajak:</Typography></Grid>
          <Grid item xs={6}><Typography variant="body2" align="right" className="font-semibold">{formatCurrency(d.subtotal_sebelum_diskon_pajak_global, d.mata_uang)}</Typography></Grid>

          {d.diskon_global_jumlah !== null && d.diskon_global_jumlah !== undefined && (
            <>
              <Grid item xs={6}><Typography variant="body2" className="text-gray-600">Diskon Global {d.diskon_global_persen ? `(${d.diskon_global_persen}%)` : ''}:</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" align="right" className="font-semibold text-red-600">-{formatCurrency(d.diskon_global_jumlah, d.mata_uang)}</Typography></Grid>
            </>
          )}
          {d.subtotal_setelah_diskon_global !== null && d.subtotal_setelah_diskon_global !== undefined && (
             <>
              <Grid item xs={6}><Typography variant="body2" className="text-gray-600">Subtotal Setelah Diskon:</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" align="right" className="font-semibold">{formatCurrency(d.subtotal_setelah_diskon_global, d.mata_uang)}</Typography></Grid>
            </>
          )}

          {d.pajak_ppn_jumlah !== null && d.pajak_ppn_jumlah !== undefined && (
            <>
              <Grid item xs={6}><Typography variant="body2" className="text-gray-600">PPN {d.pajak_ppn_persen ? `(${d.pajak_ppn_persen}%)` : ''}:</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" align="right" className="font-semibold">{formatCurrency(d.pajak_ppn_jumlah, d.mata_uang)}</Typography></Grid>
            </>
          )}
           {d.pajak_pph_jumlah !== null && d.pajak_pph_jumlah !== undefined && (
            <>
              <Grid item xs={6}><Typography variant="body2" className="text-gray-600">PPh {d.pajak_pph_persen ? `(${d.pajak_pph_persen}%)` : ''}:</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" align="right" className="font-semibold">{formatCurrency(d.pajak_pph_jumlah, d.mata_uang)}</Typography></Grid>
            </>
          )}
          {d.biaya_pengiriman !== null && d.biaya_pengiriman !== undefined && (
            <>
              <Grid item xs={6}><Typography variant="body2" className="text-gray-600">Biaya Pengiriman:</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" align="right" className="font-semibold">{formatCurrency(d.biaya_pengiriman, d.mata_uang)}</Typography></Grid>
            </>
          )}
           {d.biaya_lain !== null && d.biaya_lain !== undefined && (
            <>
              <Grid item xs={6}><Typography variant="body2" className="text-gray-600">Biaya Lain:</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" align="right" className="font-semibold">{formatCurrency(d.biaya_lain, d.mata_uang)}</Typography></Grid>
            </>
          )}

          <Grid item xs={12}><Divider className="my-2"/></Grid>

          <Grid item xs={6}><Typography variant="h6" component="p" className="text-slate-700">Total Keseluruhan:</Typography></Grid>
          <Grid item xs={6}><Typography variant="h6" component="p" align="right" className="text-slate-700">{formatCurrency(d.total_keseluruhan, d.mata_uang)}</Typography></Grid>
        </Grid>
      </SectionCard>

      {/* Informasi Pembayaran & Catatan */}
      <Grid container spacing={3}>
        {d.metode_pembayaran && (
        <Grid item xs={12} md={6}>
          <SectionCard title="Informasi Pembayaran" icon={<EventNoteIcon />}>
            <InfoListItem primary="Metode Pembayaran" secondary={d.metode_pembayaran}/>
            <InfoListItem primary="Nomor Rekening" secondary={d.rekening_bank_vendor}/>
          </SectionCard>
        </Grid>
        )}
        {d.catatan && (
        <Grid item xs={12} md={d.metode_pembayaran ? 6 : 12}>
          <SectionCard title="Catatan" icon={<NotesIcon />}>
            <Typography variant="body2" color="textSecondary" className="whitespace-pre-line">
              {d.catatan}
            </Typography>
          </SectionCard>
        </Grid>
        )}
      </Grid>

      {/* Raw JSON (opsional, bisa untuk debug) */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">Tampilkan Raw JSON Data</summary>
        <Box
          component="pre"
          className="bg-gray-800 text-white p-3 rounded-md text-xs overflow-x-auto whitespace-pre-wrap break-all mt-2"
        >
          {JSON.stringify(d, null, 2)}
        </Box>
      </details>

       {data.ocr_source_text_preview && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">Tampilkan Preview Teks OCR</summary>
          <Box
            component="pre"
            className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto whitespace-pre-wrap break-all mt-2 max-h-60"
          >
            {data.ocr_source_text_preview}
          </Box>
        </details>
      )}
    </Box>
  );
};

export default InvoiceResult;