import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem, Divider } from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon, KeyboardArrowDown, Logout } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

// Konfigurasi halaman untuk title dan subtitle
const pageConfig = {
  '/': { title: 'Dashboard', subtitle: 'Monitor your OCR scanning activities' },
  '/upload': { title: 'Upload Document', subtitle: 'Upload and process documents with AI' },
  '/history': { title: 'Scan History', subtitle: 'View and manage your scan history' },
  '/documents': { title: 'Saved Documents', subtitle: 'Browse all saved document records' },
  '/settings': { title: 'Settings', subtitle: 'Manage your account preferences' },
};

const Header = ({ handleDrawerToggle, drawerWidth }) => {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Ambil konfigurasi halaman berdasarkan path
  const currentPage = pageConfig[location.pathname] || { title: 'Page', subtitle: '' };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    // Tambahkan logic logout di sini
    console.log('Logout clicked');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: 'white',
        borderBottom: '1px solid #E5E7EB',
      }}
    >
      <Toolbar sx={{ py: 2 }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' }, color: '#111827' }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" sx={{ color: '#111827', fontWeight: 700, fontSize: '24px' }}>
            {currentPage.title}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '14px' }}>
            {currentPage.subtitle}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Notifications */}
          <IconButton sx={{ color: '#9CA3AF' }}>
            <NotificationsIcon />
          </IconButton>

          {/* User Profile Dropdown */}
          <Box
            onClick={handleMenuClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              py: 1,
              px: 1.5,
              borderRadius: 2,
              '&:hover': { bgcolor: '#F9FAFB' }
            }}
          >
            <Avatar
              sx={{ width: 36, height: 36, bgcolor: '#6366F1', fontSize: '14px', fontWeight: 600 }}
            >
              JA
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography sx={{ color: '#111827', fontSize: '14px', fontWeight: 600, lineHeight: 1.2 }}>
                John Anderson
              </Typography>
              <Typography sx={{ color: '#6B7280', fontSize: '12px', lineHeight: 1.2 }}>
                Administrator
              </Typography>
            </Box>
            <KeyboardArrowDown sx={{ color: '#9CA3AF', fontSize: 20 }} />
          </Box>

          {/* Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1,
                minWidth: 180,
                borderRadius: 2,
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.5,
                  fontSize: '14px',
                }
              }
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography sx={{ fontWeight: 600, color: '#111827' }}>John Anderson</Typography>
              <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>john@synchro.app</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: '#DC2626' }}>
              <Logout sx={{ fontSize: 18, mr: 1.5 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
