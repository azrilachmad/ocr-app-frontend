import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Button, Badge } from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon, Add as AddIcon } from '@mui/icons-material';

const Header = ({ handleDrawerToggle, drawerWidth }) => {
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
            Dashboard Overview
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '14px' }}>
            Monitor your OCR scanning activities
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <IconButton sx={{ color: '#9CA3AF' }}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: '#6366F1',
              '&:hover': { bgcolor: '#5558E3' },
              textTransform: 'none',
              px: 3,
              py: 1.5,
              fontSize: '16px',
              fontWeight: 500
            }}
          >
            New Scan
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
