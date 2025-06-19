// src/components/Header.jsx
import React from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Header = ({ handleDrawerToggle, drawerWidth }) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        // Untuk tampilan desktop, atur width dan ml agar tidak tumpang tindih dengan sidebar permanen
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }} // Tombol menu hanya muncul di layar kecil (mobile)
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div">
          OCR APPS
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;