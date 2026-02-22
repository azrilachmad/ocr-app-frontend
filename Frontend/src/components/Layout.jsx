import React, { useState } from 'react';
import { Box, CssBaseline, Typography } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

const drawerWidth = 256;

const Layout = ({ children, user }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F9FAFB' }}>
      <CssBaseline />
      <Header handleDrawerToggle={handleDrawerToggle} drawerWidth={drawerWidth} />
      <Sidebar
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        user={user}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: '#F9FAFB',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{
          flexGrow: 1, py: 10,
          px: 3,
        }}>
          {children}
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 3,
            textAlign: 'center',
            borderTop: '1px solid #E5E7EB',
            bgcolor: 'white'
          }}
        >
          <Typography sx={{ color: '#9CA3AF', fontSize: '13px' }}>
            © Copyright on Synchro 2017 - 2025 | All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;

