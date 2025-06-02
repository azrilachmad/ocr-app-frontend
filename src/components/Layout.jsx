// src/components/Layout.jsx
import React, { useState } from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

const drawerWidth = 240; // Definisikan lebar sidebar yang konsisten

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline /> {/* Menambahkan reset CSS dasar dari MUI */}
      <Header handleDrawerToggle={handleDrawerToggle} drawerWidth={drawerWidth} />
      <Sidebar 
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, // Padding konten utama
          width: { sm: `calc(100% - ${drawerWidth}px)` }, // Lebar konten utama di desktop
          backgroundColor: (theme) => theme.palette.grey[100], // Warna latar belakang konten
          minHeight: '100vh' // Memastikan konten memenuhi tinggi layar
        }}
      >
        <Toolbar /> {/* Spacer untuk konten agar tidak tertutup AppBar */}
        {children} {/* Di sini konten halaman (misalnya InvoiceListPage) akan dirender */}
      </Box>
    </Box>
  );
};

export default Layout;