import React from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Button,
  Toolbar
} from '@mui/material';
import {
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Storage as StorageIcon,
  CloudUpload as CloudUploadIcon,
  PermIdentity,
  Groups,
  TwoWheeler,
  Help,
  Bolt,
  Visibility,
  Save,
  Download,
  FilterList,
  Settings as SettingsIcon
} from '@mui/icons-material';

const Dashboard = () => {
  const statsCards = [
    { title: 'Total Scans', value: '1,247', change: '+12%', icon: <DescriptionIcon />, color: '#2563EB', positive: true },
    { title: 'Successful', value: '1,189', change: '+8%', icon: <CheckCircleIcon />, color: '#9333EA', positive: true },
    { title: 'Processing', value: '23', badge: 'Pending', icon: <ScheduleIcon />, color: '#D97706', warning: true },
    { title: 'Saved Records', value: '533', badge: 'Total', icon: <StorageIcon />, color: '#059669' },
  ];

  const documentTypes = [
    { name: 'KTP', icon: <PermIdentity />, color: '#6366F1' },
    { name: 'KK', icon: <Groups />, color: '#6366F1' },
    { name: 'STNK', icon: <TwoWheeler />, color: '#6366F1' },
    { name: 'BPKB', icon: <Help />, color: '#6366F1' },
  ];

  const recentScans = [
    { doc: 'KTP_20240115_001', type: 'KTP', status: 'Completed', confidence: 98, time: '2 mins ago', user: 'Ahmad Rizki', size: '3.2 MB', typeColor: '#1E40AF', statusColor: '#166534' },
    { doc: 'KK_20240115_002', type: 'KK', status: 'Processing', confidence: 45, time: '5 mins ago', user: 'Ahmad Rizki', size: '4.1 MB', typeColor: '#6B21A8', statusColor: '#92400E' },
    { doc: 'STNK_20240115_003', type: 'STNK', status: 'Completed', confidence: 96, time: '12 mins ago', user: 'Ahmad Rizki', size: '2.8 MB', typeColor: '#065F46', statusColor: '#166534' },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB' }}>
      <Toolbar sx={{ minHeight: { xs: 56, sm: 89 } }} />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1,
                        bgcolor: `${stat.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stat.color
                      }}
                    >
                      {stat.icon}
                    </Box>
                    {stat.change && (
                      <Chip
                        label={stat.change}
                        size="small"
                        sx={{
                          bgcolor: stat.positive ? '#DCFCE7' : '#FEF3C7',
                          color: stat.positive ? '#16A34A' : '#D97706',
                          fontWeight: 600,
                          fontSize: '12px'
                        }}
                      />
                    )}
                    {stat.badge && (
                      <Chip
                        label={stat.badge}
                        size="small"
                        sx={{
                          bgcolor: stat.warning ? '#FEF3C7' : '#F3F4F6',
                          color: stat.warning ? '#D97706' : '#4B5563',
                          fontWeight: 600,
                          fontSize: '12px'
                        }}
                      />
                    )}
                  </Box>
                  <Typography sx={{ color: '#6B7280', fontSize: '14px', fontWeight: 500, mb: 1 }}>
                    {stat.title}
                  </Typography>
                  <Typography sx={{ color: '#111827', fontSize: '30px', fontWeight: 700 }}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Quick Scan Section */}
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Typography sx={{ color: '#111827', fontSize: '20px', fontWeight: 700, mb: 0.5 }}>
                      Quick Scan
                    </Typography>
                    <Typography sx={{ color: '#6B7280', fontSize: '14px' }}>
                      Upload and process documents instantly
                    </Typography>
                  </Box>
                  <IconButton size="small" sx={{ color: '#6366F1' }}>
                    <SettingsIcon />
                  </IconButton>
                </Box>

                {/* Drop Zone */}
                <Box
                  sx={{
                    border: '2px dashed #D1D5DB',
                    borderRadius: 3,
                    p: 6,
                    textAlign: 'center',
                    bgcolor: '#FAFAFA',
                    mb: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#F5F5F5' }
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: '#EEF2FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      mb: 2
                    }}
                  >
                    <CloudUploadIcon sx={{ fontSize: 40, color: '#6366F1' }} />
                  </Box>
                  <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#111827', mb: 1 }}>
                    Drop your document here
                  </Typography>
                  <Typography sx={{ fontSize: '14px', color: '#6B7280', mb: 0.5 }}>
                    or click to browse from your computer
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#9CA3AF' }}>
                    Supports: JPG, PNG, PDF (Max 10MB)
                  </Typography>
                </Box>

                {/* Document Type Buttons */}
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {documentTypes.map((doc) => (
                    <Button
                      key={doc.name}
                      variant="outlined"
                      startIcon={doc.icon}
                      sx={{
                        borderColor: '#E5E7EB',
                        color: '#374151',
                        textTransform: 'none',
                        px: 2,
                        py: 1.5,
                        fontSize: '12px',
                        fontWeight: 500,
                        '&:hover': { borderColor: doc.color, color: doc.color, bgcolor: `${doc.color}08` }
                      }}
                    >
                      {doc.name}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* AI Status Card */}
          <Grid item xs={12} md={4}>
            <Card 
              elevation={0} 
              sx={{ 
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                borderRadius: 3,
                color: 'white',
                height: '100%'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography sx={{ fontSize: '18px', fontWeight: 700 }}>
                    AI Status
                  </Typography>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10B981', opacity: 0.9 }} />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1,
                      bgcolor: 'rgba(255,255,255,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Bolt sx={{ color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '14px' }}>Gemini AI</Typography>
                    <Typography sx={{ fontSize: '12px', opacity: 0.8 }}>Model: Pro Vision</Typography>
                  </Box>
                </Box>

                {/* Processing Power */}
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1, p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: '14px' }}>Processing Power</Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>92%</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={92} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 1,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': { bgcolor: '#10B981' }
                    }} 
                  />
                </Box>

                {/* Stats */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '14px' }}>Avg. Processing Time</Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>2.3s</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '14px' }}>Accuracy Rate</Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>98.7%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: '14px' }}>Today's Scans</Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>147</Typography>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    mt: 3,
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    textTransform: 'none',
                    py: 1.5,
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  View AI Analytics
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Scans Table */}
          <Grid item xs={12}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#111827', mb: 0.5 }}>
                    Recent Scans
                  </Typography>
                  <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
                    Latest OCR processing results
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <Select
                    size="small"
                    defaultValue="all"
                    sx={{ minWidth: 120, fontSize: '14px' }}
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="ktp">KTP</MenuItem>
                    <MenuItem value="kk">KK</MenuItem>
                  </Select>
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    sx={{ textTransform: 'none', fontSize: '14px', color: '#374151', borderColor: '#D1D5DB' }}
                  >
                    Filter
                  </Button>
                </Box>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Document</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Confidence</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Scanned</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentScans.map((scan, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <PermIdentity sx={{ color: '#2563EB', fontSize: 20 }} />
                            </Box>
                            <Box>
                              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{scan.doc}</Typography>
                              <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>{scan.size}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<PermIdentity sx={{ fontSize: 14 }} />}
                            label={scan.type}
                            size="small"
                            sx={{ bgcolor: `${scan.typeColor}15`, color: scan.typeColor, fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                            label={scan.status}
                            size="small"
                            sx={{ bgcolor: `${scan.statusColor}15`, color: scan.statusColor, fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={scan.confidence}
                              sx={{ width: 60, height: 8, borderRadius: 1, bgcolor: '#E5E7EB', '& .MuiLinearProgress-bar': { bgcolor: '#10B981' } }}
                            />
                            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{scan.confidence}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '14px', color: '#111827' }}>{scan.time}</Typography>
                          <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>by {scan.user}</Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton size="small" sx={{ color: '#6366F1' }}><Visibility fontSize="small" /></IconButton>
                            <IconButton size="small" sx={{ color: '#059669' }}><Save fontSize="small" /></IconButton>
                            <IconButton size="small" sx={{ color: '#4B5563' }}><Download fontSize="small" /></IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
