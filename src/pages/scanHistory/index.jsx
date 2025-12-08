import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Checkbox,
  Menu,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  FilterList as FilterIcon,
  FileDownload as ExportIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  Description as DocumentIcon,
  People as PeopleIcon,
  DirectionsCar as CarIcon,
  CreditCard as CardIcon,
  Badge as BadgeIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const ScanHistoryPage = () => {
  const [documentType, setDocumentType] = useState('all');
  const [status, setStatus] = useState('all');
  const [dateRange, setDateRange] = useState('last7days');
  const [selectedRows, setSelectedRows] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scanData, setScanData] = useState([]);

  // Mock data for demonstration
  useEffect(() => {
    const mockData = [
      {
        id: 1,
        fileName: 'KTP_3174012345678901.jpg',
        fileSize: '2.4 MB',
        resolution: '1920x1080',
        type: 'KTP',
        typeColor: '#2563EB',
        status: 'completed',
        date: 'Nov 14, 2025',
        time: '10:24 AM',
        processingTime: '2.3s',
        confidence: 98,
        icon: <DocumentIcon />
      },
      {
        id: 2,
        fileName: 'KK_3174010000000001.jpg',
        fileSize: '3.1 MB',
        resolution: '2048x1536',
        type: 'KK',
        typeColor: '#16A34A',
        status: 'completed',
        date: 'Nov 14, 2025',
        time: '09:15 AM',
        processingTime: '3.7s',
        confidence: 96,
        icon: <PeopleIcon />
      },
      {
        id: 3,
        fileName: 'STNK_B1234XYZ.jpg',
        fileSize: '1.8 MB',
        resolution: '1600x1200',
        type: 'STNK',
        typeColor: '#EA580C',
        status: 'processing',
        date: 'Nov 14, 2025',
        time: '08:42 AM',
        processingTime: '-',
        confidence: null,
        icon: <CarIcon />
      },
      {
        id: 4,
        fileName: 'BPKB_B5678ABC.jpg',
        fileSize: '2.2 MB',
        resolution: '1920x1440',
        type: 'BPKB',
        typeColor: '#7C3AED',
        status: 'completed',
        date: 'Nov 13, 2025',
        time: '04:18 PM',
        processingTime: '4.1s',
        confidence: 94,
        icon: <CardIcon />
      },
      {
        id: 5,
        fileName: 'SIM_3174010000000002.jpg',
        fileSize: '1.2 MB',
        resolution: '1200x900',
        type: 'SIM',
        typeColor: '#DC2626',
        status: 'failed',
        date: 'Nov 13, 2025',
        time: '02:35 PM',
        processingTime: '1.8s',
        confidence: 34,
        icon: <CardIcon />
      },
      {
        id: 6,
        fileName: 'Passport_A12345678.jpg',
        fileSize: '2.7 MB',
        resolution: '1800x1350',
        type: 'Passport',
        typeColor: '#4F46E5',
        status: 'completed',
        date: 'Nov 13, 2025',
        time: '11:20 AM',
        processingTime: '3.2s',
        confidence: 97,
        icon: <BadgeIcon />
      },
    ];
    setScanData(mockData);
  }, []);

  const stats = [
    {
      label: 'Total Scans',
      value: '1,247',
      change: '12% from last month',
      changeType: 'positive',
      icon: <DocumentIcon sx={{ fontSize: 20 }} />,
      color: '#2563EB',
      bgColor: '#EFF6FF'
    },
    {
      label: 'Successful',
      value: '1,189',
      change: '95.3% success rate',
      changeType: 'positive',
      icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
      color: '#16A34A',
      bgColor: '#F0FDF4'
    },
    {
      label: 'Processing',
      value: '42',
      change: 'In queue',
      changeType: 'neutral',
      icon: <ScheduleIcon sx={{ fontSize: 20 }} />,
      color: '#CA8A04',
      bgColor: '#FEFCE8'
    },
    {
      label: 'Failed',
      value: '16',
      change: '1.3% error rate',
      changeType: 'negative',
      icon: <ErrorIcon sx={{ fontSize: 20 }} />,
      color: '#DC2626',
      bgColor: '#FEF2F2'
    },
  ];

  const getStatusChip = (status) => {
    const statusConfig = {
      completed: {
        label: 'Completed',
        color: '#15803D',
        bgColor: '#F0FDF4',
        icon: <CheckCircleIcon sx={{ fontSize: 12 }} />
      },
      processing: {
        label: 'Processing',
        color: '#A16207',
        bgColor: '#FEFCE8',
        icon: <ScheduleIcon sx={{ fontSize: 12 }} />
      },
      failed: {
        label: 'Failed',
        color: '#DC2626',
        bgColor: '#FEF2F2',
        icon: <ErrorIcon sx={{ fontSize: 12 }} />
      }
    };

    const config = statusConfig[status] || statusConfig.processing;

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        size="small"
        sx={{
          color: config.color,
          bgcolor: config.bgColor,
          fontWeight: 500,
          fontSize: '12px',
          height: '24px',
          '& .MuiChip-icon': {
            color: config.color
          }
        }}
      />
    );
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedRows(scanData.map(row => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pb: 4 }}>
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid #E5E7EB',
          py: 3
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2
          }}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  color: '#111827',
                  fontWeight: 700,
                  fontSize: { xs: '20px', md: '24px' },
                  lineHeight: '32px',
                  mb: 0.5
                }}
              >
                Scan History
              </Typography>
              <Typography
                sx={{
                  color: '#6B7280',
                  fontSize: '14px',
                  lineHeight: '20px'
                }}
              >
                View and manage all your document scanning history
              </Typography>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              gap: 1.5,
              flexWrap: 'wrap'
            }}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                sx={{
                  borderColor: '#D1D5DB',
                  color: '#374151',
                  textTransform: 'none',
                  px: 2,
                  '&:hover': {
                    borderColor: '#9CA3AF',
                    bgcolor: '#F9FAFB'
                  }
                }}
              >
                Filter
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                sx={{
                  borderColor: '#D1D5DB',
                  color: '#374151',
                  textTransform: 'none',
                  px: 2,
                  '&:hover': {
                    borderColor: '#9CA3AF',
                    bgcolor: '#F9FAFB'
                  }
                }}
              >
                Export
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                component={RouterLink}
                to="/upload"
                sx={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  textTransform: 'none',
                  px: 2.5,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5558E3 0%, #7C3AED 100%)',
                  }
                }}
              >
                New Scan
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Filter Section */}
      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid #E5E7EB',
          py: 2
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            flexWrap: 'wrap'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: '#374151', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                Document Type:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  sx={{ 
                    fontSize: '14px',
                    bgcolor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E5E7EB'
                    }
                  }}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="ktp">KTP</MenuItem>
                  <MenuItem value="kk">KK</MenuItem>
                  <MenuItem value="stnk">STNK</MenuItem>
                  <MenuItem value="bpkb">BPKB</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: '#374151', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                Status:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  sx={{ 
                    fontSize: '14px',
                    bgcolor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E5E7EB'
                    }
                  }}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: '#374151', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                Date Range:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  sx={{ 
                    fontSize: '14px',
                    bgcolor: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E5E7EB'
                    }
                  }}
                >
                  <MenuItem value="last7days">Last 7 Days</MenuItem>
                  <MenuItem value="last30days">Last 30 Days</MenuItem>
                  <MenuItem value="last90days">Last 90 Days</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Button
              sx={{
                color: '#4F46E5',
                textTransform: 'none',
                fontSize: '14px',
                '&:hover': {
                  bgcolor: '#EEF2FF'
                }
              }}
              onClick={() => {
                setDocumentType('all');
                setStatus('all');
                setDateRange('last7days');
              }}
            >
              Clear Filters
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 3 }}>
        {/* Statistics Cards */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)'
            },
            gap: 3,
            mb: 3
          }}
        >
          {stats.map((stat, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid #E5E7EB',
                borderRadius: 1.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ color: '#6B7280', fontSize: '14px', mb: 1 }}>
                    {stat.label}
                  </Typography>
                  <Typography
                    sx={{
                      color: '#111827',
                      fontSize: '30px',
                      fontWeight: 700,
                      lineHeight: '36px',
                      mb: 1
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {stat.changeType === 'positive' && (
                      <Box component="span" sx={{ color: stat.color }}>↑</Box>
                    )}
                    {stat.changeType === 'negative' && (
                      <Box component="span" sx={{ color: stat.color }}>↓</Box>
                    )}
                    <Typography
                      sx={{
                        color: stat.changeType === 'neutral' ? '#2563EB' : stat.color,
                        fontSize: '12px'
                      }}
                    >
                      {stat.change}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    bgcolor: stat.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: stat.color
                  }}
                >
                  {stat.icon}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Data Table */}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid #E5E7EB',
            borderRadius: 1.5,
            overflow: 'hidden'
          }}
        >
          {/* Table Header */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '40px 1fr 80px',
                md: '40px 2fr 1fr 1.2fr 1fr 1fr 1.2fr 80px'
              },
              borderBottom: '1px solid #E5E7EB',
              bgcolor: '#F9FAFB',
              py: 2,
              px: 2,
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Checkbox
                size="small"
                checked={selectedRows.length === scanData.length}
                indeterminate={selectedRows.length > 0 && selectedRows.length < scanData.length}
                onChange={handleSelectAll}
              />
            </Box>
            <Typography sx={{ color: '#4B5563', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', display: { xs: 'block', md: 'block' } }}>
              DOCUMENT
            </Typography>
            <Typography sx={{ color: '#4B5563', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', display: { xs: 'none', md: 'block' } }}>
              TYPE
            </Typography>
            <Typography sx={{ color: '#4B5563', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', display: { xs: 'none', md: 'block' } }}>
              STATUS
            </Typography>
            <Typography sx={{ color: '#4B5563', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', display: { xs: 'none', md: 'block' } }}>
              SCANNED DATE
            </Typography>
            <Typography sx={{ color: '#4B5563', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', display: { xs: 'none', md: 'block' } }}>
              PROCESSING TIME
            </Typography>
            <Typography sx={{ color: '#4B5563', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', display: { xs: 'none', md: 'block' } }}>
              CONFIDENCE
            </Typography>
            <Typography sx={{ color: '#4B5563', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', textAlign: 'center' }}>
              ACTIONS
            </Typography>
          </Box>

          {/* Table Rows */}
          {scanData.map((row, index) => (
            <Box
              key={row.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '40px 1fr 80px',
                  md: '40px 2fr 1fr 1.2fr 1fr 1fr 1.2fr 80px'
                },
                borderBottom: index < scanData.length - 1 ? '1px solid #E5E7EB' : 'none',
                py: 2,
                px: 2,
                gap: 2,
                alignItems: 'center',
                '&:hover': {
                  bgcolor: '#F9FAFB'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Checkbox
                  size="small"
                  checked={selectedRows.includes(row.id)}
                  onChange={() => handleSelectRow(row.id)}
                />
              </Box>

              {/* Document Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1,
                    bgcolor: `${row.typeColor}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: row.typeColor
                  }}
                >
                  {row.icon}
                </Box>
                <Box>
                  <Typography
                    sx={{
                      color: '#111827',
                      fontSize: '14px',
                      fontWeight: 600,
                      mb: 0.25
                    }}
                  >
                    {row.fileName}
                  </Typography>
                  <Typography sx={{ color: '#6B7280', fontSize: '12px' }}>
                    {row.fileSize} • {row.resolution}
                  </Typography>
                </Box>
              </Box>

              {/* Type */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Chip
                  label={row.type}
                  size="small"
                  sx={{
                    bgcolor: `${row.typeColor}15`,
                    color: row.typeColor,
                    fontWeight: 500,
                    fontSize: '12px'
                  }}
                />
              </Box>

              {/* Status */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                {getStatusChip(row.status)}
              </Box>

              {/* Date */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography sx={{ color: '#111827', fontSize: '14px', mb: 0.25 }}>
                  {row.date}
                </Typography>
                <Typography sx={{ color: '#6B7280', fontSize: '12px' }}>
                  {row.time}
                </Typography>
              </Box>

              {/* Processing Time */}
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography sx={{ color: '#111827', fontSize: '14px' }}>
                  {row.processingTime}
                </Typography>
              </Box>

              {/* Confidence */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
                {row.confidence !== null ? (
                  <>
                    <LinearProgress
                      variant="determinate"
                      value={row.confidence}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 1,
                        bgcolor: '#E5E7EB',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#16A34A',
                          borderRadius: 1
                        }
                      }}
                    />
                    <Typography sx={{ color: '#111827', fontSize: '14px', fontWeight: 500, minWidth: 40 }}>
                      {row.confidence}%
                    </Typography>
                  </>
                ) : (
                  <Typography sx={{ color: '#111827', fontSize: '14px' }}>-</Typography>
                )}
              </Box>

              {/* Actions */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                <IconButton size="small" sx={{ color: '#4B5563' }}>
                  <ViewIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton size="small" sx={{ color: '#4B5563' }}>
                  <DownloadIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton size="small" sx={{ color: '#4B5563' }} onClick={handleMenuClick}>
                  <MoreVertIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Paper>

        {/* Pagination */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 3,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2
          }}
        >
          <Typography sx={{ color: '#6B7280', fontSize: '14px' }}>
            Showing <Box component="span" sx={{ fontWeight: 500, color: '#111827' }}>1</Box> to{' '}
            <Box component="span" sx={{ fontWeight: 500, color: '#111827' }}>10</Box> of{' '}
            <Box component="span" sx={{ fontWeight: 500, color: '#111827' }}>1,247</Box> results
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              disabled
              sx={{
                minWidth: 35,
                px: 1,
                borderColor: '#D1D5DB',
                color: '#374151',
                '&.Mui-disabled': {
                  opacity: 0.5
                }
              }}
            >
              ‹
            </Button>
            <Button
              variant="contained"
              sx={{
                minWidth: 35,
                px: 1.5,
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                boxShadow: 'none'
              }}
            >
              1
            </Button>
            <Button
              variant="outlined"
              sx={{
                minWidth: 35,
                px: 1.5,
                borderColor: '#D1D5DB',
                color: '#374151'
              }}
            >
              2
            </Button>
            <Button
              variant="outlined"
              sx={{
                minWidth: 35,
                px: 1.5,
                borderColor: '#D1D5DB',
                color: '#374151'
              }}
            >
              3
            </Button>
            <Typography sx={{ px: 1, color: '#6B7280', display: 'flex', alignItems: 'center' }}>...</Typography>
            <Button
              variant="outlined"
              sx={{
                minWidth: 45,
                px: 1.5,
                borderColor: '#D1D5DB',
                color: '#374151'
              }}
            >
              125
            </Button>
            <Button
              variant="outlined"
              sx={{
                minWidth: 35,
                px: 1,
                borderColor: '#D1D5DB',
                color: '#374151'
              }}
            >
              ›
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Download</MenuItem>
        <MenuItem onClick={handleMenuClose}>Delete</MenuItem>
      </Menu>
    </Box>
  );
};

export default ScanHistoryPage;
