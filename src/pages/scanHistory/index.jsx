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
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
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
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const ScanHistoryPage = () => {
  const [documentType, setDocumentType] = useState('all');
  const [status, setStatus] = useState('all');
  const [dateRange, setDateRange] = useState('last7days');
  const [selectedRows, setSelectedRows] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scanData, setScanData] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const navigate = useNavigate();

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
        saved: true,
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
        saved: true,
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
        saved: false,
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
        saved: true,
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
        saved: false,
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
        saved: true,
        icon: <BadgeIcon />
      },
    ];
    setScanData(mockData);
  }, []);

  const stats = [
    {
      label: 'Total Scans',
      value: '1,247',
      icon: <DocumentIcon sx={{ fontSize: 20 }} />,
      color: '#2563EB',
      bgColor: '#EFF6FF'
    },
    {
      label: 'Successful',
      value: '1,189',
      icon: <CheckCircleIcon sx={{ fontSize: 20 }} />,
      color: '#16A34A',
      bgColor: '#F0FDF4'
    },
    {
      label: 'Processing',
      value: '42',
      icon: <ScheduleIcon sx={{ fontSize: 20 }} />,
      color: '#CA8A04',
      bgColor: '#FEFCE8'
    },
    {
      label: 'Failed',
      value: '16',
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

  // Removed Menu handlers as we are using direct buttons

  const handleViewDetail = (id) => {
    navigate(`/history/${id}`);
  };

  const handleEditDetail = (id) => {
    navigate(`/history/${id}?mode=edit`);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    // Mock delete logic
    setScanData(prev => prev.filter(item => item.id !== itemToDelete.id));
    setDeleteDialogOpen(false);
    setItemToDelete(null);
    setSnackbar({ open: true, message: 'Item deleted successfully', severity: 'success' });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
                      mb: 0
                    }}
                  >
                    {stat.value}
                  </Typography>
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
                xs: '1fr 120px',
                md: '2fr 1fr 1.2fr 1fr 1fr 80px 120px'
              },
              borderBottom: '1px solid #E5E7EB',
              bgcolor: '#F9FAFB',
              py: 2,
              px: 2,
              gap: 2
            }}
          >
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
            <Typography sx={{ color: '#4B5563', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', display: { xs: 'none', md: 'block' }, textAlign: 'center' }}>
              SAVED
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
                  xs: '1fr 120px',
                  md: '2fr 1fr 1.2fr 1fr 1fr 80px 120px'
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



              {/* Saved Status */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                {row.saved ? (
                  <CheckCircleIcon sx={{ fontSize: 20, color: '#10B981' }} />
                ) : (
                  <CloseIcon sx={{ fontSize: 20, color: '#9CA3AF' }} />
                )}
              </Box>

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start' }}>
                <IconButton
                  size="small"
                  onClick={() => handleViewDetail(row.id)}
                  sx={{ color: '#3B82F6', bgcolor: '#EFF6FF', '&:hover': { bgcolor: '#DBEAFE' } }}
                  title="View Details"
                >
                  <ViewIcon sx={{ fontSize: 18 }} />
                </IconButton>
                {row.saved && (
                  <IconButton
                    size="small"
                    onClick={() => handleEditDetail(row.id)}
                    sx={{ color: '#F59E0B', bgcolor: '#FEF3C7', '&:hover': { bgcolor: '#FDE68A' } }}
                    title="Edit"
                  >
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                )}
                <IconButton
                  size="small"
                  onClick={() => handleDeleteClick(row)}
                  sx={{ color: '#EF4444', bgcolor: '#FEE2E2', '&:hover': { bgcolor: '#FECACA' } }}
                  title="Delete"
                >
                  <DeleteIcon sx={{ fontSize: 18 }} />
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#DC2626' }}>
          Delete Item
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#374151' }}>
            Are you sure you want to delete <strong>{itemToDelete?.fileName}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: 'none', color: '#6B7280' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmDelete}
            sx={{
              textTransform: 'none',
              bgcolor: '#DC2626',
              '&:hover': { bgcolor: '#B91C1C' }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ScanHistoryPage;
