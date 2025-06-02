// src/components/Sidebar.jsx
import React from 'react';
import { Drawer, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Divider, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description'; // Contoh ikon lain
import { Link as RouterLink } from 'react-router-dom';

const Sidebar = ({ drawerWidth, mobileOpen, handleDrawerToggle }) => {
  const drawerItems = [
    { text: 'Daftar Invoice', path: '/invoices', icon: <DashboardIcon /> },
    { text: 'Upload Invoice', path: '/upload-invoice', icon: <CloudUploadIcon /> },
    // Tambahkan item navigasi lain di sini
    // { text: 'Pengaturan', path: '/settings', icon: <SettingsIcon /> },
  ];

  const drawerContent = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Anda bisa meletakkan logo atau judul singkat di sini */}
        <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }}/>
        <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main', fontWeight: 'bold'}}>
           OCR App
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {drawerItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              component={RouterLink} 
              to={item.path} 
              onClick={mobileOpen ? handleDrawerToggle : null} // Tutup drawer di mobile setelah klik
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="navigation sidebar"
    >
      {/* Drawer untuk Mobile (Temporary) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
      {/* Drawer untuk Desktop (Permanent) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open // Drawer permanen selalu 'open'
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;