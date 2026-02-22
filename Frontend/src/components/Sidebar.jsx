import React from 'react';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CloudUpload as CloudUploadIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  People as PeopleIcon,
  ToggleOn as ToggleOnIcon,
  Timeline as TimelineIcon,
  AdminPanelSettings as AdminIcon,
  Shield as ShieldIcon,
  Description as DescriptionIcon,
  BarChart as BarChartIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const Sidebar = ({ drawerWidth, mobileOpen, handleDrawerToggle, user }) => {
  const location = useLocation();

  // Base user navigation (always show Dashboard and Settings)
  const userNavItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
  ];

  // Add conditional items based on user features
  if (user?.features?.knowledgeBase !== false) {
    userNavItems.push({ text: 'Knowledge Base', path: '/knowledge-base', icon: <ChatIcon /> });
  }

  // These might not be toggled right now, but we can add safeguards
  userNavItems.push({ text: 'Upload Document', path: '/upload', icon: <CloudUploadIcon /> });
  userNavItems.push({ text: 'Scan History', path: '/history', icon: <HistoryIcon /> });
  userNavItems.push({ text: 'Settings', path: '/settings', icon: <SettingsIcon /> });

  // Superadmin navigation
  const adminNavItems = [
    { text: 'Admin Dashboard', path: '/admin/dashboard', icon: <DashboardIcon /> },
  ];

  if (user?.features?.knowledgeBase !== false) {
    adminNavItems.push({ text: 'Knowledge Base', path: '/knowledge-base', icon: <ChatIcon /> });
  }

  adminNavItems.push(
    { text: 'User Management', path: '/admin/users', icon: <PeopleIcon /> },
    { text: 'Feature Toggle', path: '/admin/features', icon: <ToggleOnIcon /> },
    { text: 'Activity Log', path: '/admin/activity', icon: <TimelineIcon /> },
    { text: 'Documents', path: '/admin/documents', icon: <DescriptionIcon /> },
    { text: 'System Settings', path: '/admin/settings', icon: <SettingsIcon /> },
    { text: 'Scan Statistics', path: '/admin/statistics', icon: <BarChartIcon /> }
  );

  const isSuperAdmin = user?.role === 'superadmin';
  const navItems = isSuperAdmin ? adminNavItems : userNavItems;

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
      {/* Logo/Branding Section */}
      <Box sx={{
        px: 3,
        py: 2.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderBottom: '1px solid #E5E7EB',
        minHeight: 64
      }}>
        <Box
          component="img"
          src="/logo.png"
          alt="Synchro Scan Logo"
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
          }}
        />
        <Typography
          variant="h6"
          sx={{
            color: '#1F2937',
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: '28px'
          }}
        >
          Synchro Scan
        </Typography>
      </Box>

      {/* Role Badge */}
      {isSuperAdmin && (
        <Box sx={{ px: 3, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldIcon sx={{ color: '#7C3AED', fontSize: 18 }} />
          <Chip
            label="Super Admin"
            size="small"
            sx={{
              bgcolor: '#F3E8FF',
              color: '#7C3AED',
              fontWeight: 600,
              fontSize: '11px',
              height: 24,
            }}
          />
        </Box>
      )}

      {/* Navigation Items */}
      <Box sx={{ flexGrow: 1, py: isSuperAdmin ? 1 : 3 }}>
        {isSuperAdmin && (
          <Typography sx={{ px: 3, py: 1, fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Administration
          </Typography>
        )}
        <List sx={{ px: 1.5 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  onClick={mobileOpen ? handleDrawerToggle : null}
                  sx={{
                    borderRadius: 1,
                    color: isActive ? 'white' : '#374151',
                    background: isActive
                      ? isSuperAdmin
                        ? 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)'
                        : 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                      : 'transparent',
                    boxShadow: isActive
                      ? '0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1)'
                      : 'none',
                    '&:hover': {
                      bgcolor: isActive ? undefined : '#F9FAFB',
                      background: isActive
                        ? isSuperAdmin
                          ? 'linear-gradient(135deg, #6D28D9 0%, #7E22CE 100%)'
                          : 'linear-gradient(135deg, #5558E3 0%, #7C3AED 100%)'
                        : undefined,
                    },
                    py: 1.5,
                    px: 2,
                  }}
                >
                  <ListItemIcon sx={{
                    color: 'inherit',
                    minWidth: 40,
                    '& svg': { fontSize: 20 }
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '16px',
                      fontWeight: isActive ? 600 : 500,
                      lineHeight: '24px'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="navigation sidebar"
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: 'white',
            borderRight: '1px solid #E5E7EB'
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: 'white',
            borderRight: '1px solid #E5E7EB'
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
