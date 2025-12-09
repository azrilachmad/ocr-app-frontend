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
  Avatar,
  IconButton
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CloudUpload as CloudUploadIcon,
  History as HistoryIcon,
  Folder as FolderIcon,
  ShowChart as AnalyticsIcon,
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const Sidebar = ({ drawerWidth, mobileOpen, handleDrawerToggle }) => {
  const location = useLocation();

  const navItems = [
    { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { text: 'Upload Document', path: '/upload', icon: <CloudUploadIcon /> },
    { text: 'Scan History', path: '/history', icon: <HistoryIcon /> },
    { text: 'Saved Document', path: '/documents', icon: <FolderIcon />, highlighted: true },
    { text: 'Analytics', path: '/analytics', icon: <AnalyticsIcon /> },
    { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
  ];

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
          sx={{ 
            width: 34, 
            height: 44, 
            borderRadius: 1,
            bgcolor: '#6366F1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <HelpIcon sx={{ color: 'white', fontSize: 18 }} />
        </Box>
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

      {/* Navigation Items */}
      <Box sx={{ flexGrow: 1, py: 3 }}>
        <List sx={{ px: 1.5 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isHighlighted = item.highlighted;
            
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  onClick={mobileOpen ? handleDrawerToggle : null}
                  sx={{
                    borderRadius: 1,
                    color: isHighlighted ? 'white' : '#374151',
                    background: isHighlighted 
                      ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)'
                      : 'transparent',
                    boxShadow: isHighlighted 
                      ? '0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.1)'
                      : 'none',
                    '&:hover': {
                      bgcolor: isHighlighted ? undefined : '#F9FAFB',
                      background: isHighlighted 
                        ? 'linear-gradient(135deg, #5558E3 0%, #7C3AED 100%)'
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
                      fontWeight: 500,
                      lineHeight: '24px'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User Profile Section */}
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid #E5E7EB',
        minHeight: 73
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          position: 'relative'
        }}>
          <Avatar 
            sx={{ width: 40, height: 40 }}
            src="https://api.builder.io/api/v1/image/assets/TEMP/0b145d2cab8ccc18471d7a25fcc40230b865abc5?width=80"
            alt="John Anderson"
          >
            JA
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography sx={{ 
              color: '#1F2937', 
              fontSize: '14px', 
              fontWeight: 500,
              lineHeight: '20px'
            }}>
              John Anderson
            </Typography>
            <Typography sx={{ 
              color: '#6B7280', 
              fontSize: '12px',
              lineHeight: '16px'
            }}>
              john@synchro.app
            </Typography>
          </Box>
          <IconButton size="small" sx={{ color: '#9CA3AF' }}>
            <MoreVertIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
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
