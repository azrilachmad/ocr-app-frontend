import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem, Divider,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
  Snackbar, Alert
} from '@mui/material';
import { Menu as MenuIcon, Notifications as NotificationsIcon, KeyboardArrowDown, Logout } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout, getProfile } from '../services/authService';

// Konfigurasi halaman untuk title dan subtitle
const pageConfig = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Monitor your OCR scanning activities' },
  '/upload': { title: 'Upload Document', subtitle: 'Upload and process documents with AI' },
  '/history': { title: 'Scan History', subtitle: 'View and manage your scan history' },
  '/documents': { title: 'Saved Documents', subtitle: 'Browse all saved document records' },
  '/settings': { title: 'Settings', subtitle: 'Manage your account preferences' },
};

// Helper function to get page config for dynamic routes
const getPageConfig = (pathname) => {
  // Check exact match first
  if (pageConfig[pathname]) {
    return pageConfig[pathname];
  }

  // Handle dynamic routes
  if (pathname.startsWith('/history/')) {
    return { title: 'Document Details', subtitle: 'View and edit document information' };
  }

  // Default fallback
  return { title: 'Synchro Scan', subtitle: '' };
};

const Header = ({ handleDrawerToggle, drawerWidth }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loggingOut, setLoggingOut] = useState(false);
  const open = Boolean(anchorEl);

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Try to get from localStorage first for quick display
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Then verify with API
        const response = await getProfile();
        if (response.success) {
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  // Get user initials
  const getInitials = (name, email) => {
    if (name && typeof name === 'string') {
      const parts = name.split(' ');
      if (parts.length >= 2 && parts[0] && parts[1]) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email && typeof email === 'string') {
      return email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Ambil konfigurasi halaman berdasarkan path
  const currentPage = getPageConfig(location.pathname);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Open logout confirmation dialog
  const handleLogoutClick = () => {
    handleMenuClose();
    setLogoutDialogOpen(true);
  };

  // Close logout dialog
  const handleLogoutDialogClose = () => {
    setLogoutDialogOpen(false);
  };

  // Confirm logout
  const handleLogoutConfirm = async () => {
    setLoggingOut(true);
    try {
      await logout();
      // Clear localStorage
      localStorage.removeItem('user');

      // Show success toast
      setSnackbar({
        open: true,
        message: 'Logout successful. Redirecting...',
        severity: 'success'
      });

      setLogoutDialogOpen(false);

      // Redirect after short delay to show toast
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect even if API fails
      localStorage.removeItem('user');
      setSnackbar({
        open: true,
        message: 'Logout successful.',
        severity: 'success'
      });
      setLogoutDialogOpen(false);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const displayName = (user?.name || (user?.email && typeof user.email === 'string' ? user.email.split('@')[0] : null)) || 'User';
  const displayEmail = user?.email || '';
  const displayRole = user?.role === 'admin' ? 'Administrator' : 'User';
  const initials = getInitials(user?.name || '', user?.email || '');

  return (
    <>
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
            {/* <IconButton sx={{ color: '#9CA3AF' }}>
              <NotificationsIcon />
            </IconButton> */}

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
                {initials}
              </Avatar>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography sx={{ color: '#111827', fontSize: '14px', fontWeight: 600, lineHeight: 1.2 }}>
                  {displayName}
                </Typography>
                <Typography sx={{ color: '#6B7280', fontSize: '12px', lineHeight: 1.2 }}>
                  {displayRole}
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
                <Typography sx={{ fontWeight: 600, color: '#111827' }}>{displayName}</Typography>
                <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>{displayEmail}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleLogoutClick} sx={{ color: '#DC2626' }}>
                <Logout sx={{ fontSize: 18, mr: 1.5 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutDialogClose}
        PaperProps={{
          sx: { borderRadius: 3, minWidth: 350 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to logout from your account?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleLogoutDialogClose}
            sx={{ color: '#6B7280' }}
            disabled={loggingOut}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            color="error"
            disabled={loggingOut}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Header;
