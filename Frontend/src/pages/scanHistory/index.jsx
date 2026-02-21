import React, { useState, useEffect, useCallback } from 'react';
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
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
  Toolbar
} from '@mui/material';
import {
  FilterList as FilterIcon,
  FileDownload as ExportIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Description as DocumentIcon,
  People as PeopleIcon,
  DirectionsCar as CarIcon,
  CreditCard as CardIcon,
  Badge as BadgeIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Save as SaveIcon,
  Replay as RescanIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getDocuments, getRecentScans, deleteDocument, rescanDocument } from '../../services/apiService';

// Document type icons and colors
const getDocumentTypeConfig = (type) => {
  const configs = {
    'KTP': { icon: <DocumentIcon />, color: '#2563EB' },
    'KK': { icon: <PeopleIcon />, color: '#16A34A' },
    'STNK': { icon: <CarIcon />, color: '#EA580C' },
    'BPKB': { icon: <CardIcon />, color: '#7C3AED' },
    'Invoice': { icon: <ReceiptIcon />, color: '#DC2626' },
    'SIM': { icon: <BadgeIcon />, color: '#0891B2' },
    'Passport': { icon: <BadgeIcon />, color: '#4F46E5' }
  };
  return configs[type] || { icon: <DocumentIcon />, color: '#6B7280' };
};

// Status chip component
const StatusChip = ({ status }) => {
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
        '& .MuiChip-icon': { color: config.color }
      }}
    />
  );
};

const ScanHistoryPage = () => {
  const [documentType, setDocumentType] = useState('all');
  const [status, setStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [savedDocuments, setSavedDocuments] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rescannningId, setRescanningId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    processing: 0,
    failed: 0
  });

  const navigate = useNavigate();
  const itemsPerPage = 10;

  // Fetch saved documents from API
  const fetchSavedDocuments = useCallback(async () => {
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        saved: 'true' // Only saved documents
      };

      if (documentType !== 'all') params.documentType = documentType;
      if (status !== 'all') params.status = status;
      if (searchQuery) params.search = searchQuery;

      const response = await getDocuments(params);
      setSavedDocuments(response.data || []);
      setPagination(response.pagination || { total: 0, totalPages: 1 });

      // Calculate stats from saved documents
      const allDocsResponse = await getDocuments({ limit: 1000, saved: 'true' });
      const allDocs = allDocsResponse.data || [];
      setStats({
        total: allDocs.length,
        completed: allDocs.filter(d => d.status === 'completed').length,
        processing: allDocs.filter(d => d.status === 'processing').length,
        failed: allDocs.filter(d => d.status === 'failed').length
      });
    } catch (error) {
      console.error('Failed to fetch saved documents:', error);
      setSnackbar({ open: true, message: 'Failed to load saved documents: ' + error.message, severity: 'error' });
    }
  }, [currentPage, documentType, status, searchQuery]);

  // Fetch recent scans (unsaved, max 10)
  const fetchRecentScans = useCallback(async () => {
    try {
      const scans = await getRecentScans();
      setRecentScans(scans || []);
    } catch (error) {
      console.error('Failed to fetch recent scans:', error);
    }
  }, []);

  // Combined fetch
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchSavedDocuments(), fetchRecentScans()]);
    setIsLoading(false);
  }, [fetchSavedDocuments, fetchRecentScans]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return { date: '-', time: '-' };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

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

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      await deleteDocument(itemToDelete.id);
      setSavedDocuments(prev => prev.filter(item => item.id !== itemToDelete.id));
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setSnackbar({ open: true, message: 'Document deleted successfully', severity: 'success' });
      fetchAllData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Delete failed: ' + error.message, severity: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleClearFilters = () => {
    setDocumentType('all');
    setStatus('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const statsData = [
    { label: 'Total Saved', value: stats.total, icon: <SaveIcon sx={{ fontSize: 20 }} />, color: '#2563EB', bgColor: '#EFF6FF' },
    { label: 'Successful', value: stats.completed, icon: <CheckCircleIcon sx={{ fontSize: 20 }} />, color: '#16A34A', bgColor: '#F0FDF4' },
    { label: 'Processing', value: stats.processing, icon: <ScheduleIcon sx={{ fontSize: 20 }} />, color: '#CA8A04', bgColor: '#FEFCE8' },
    { label: 'Failed', value: stats.failed, icon: <ErrorIcon sx={{ fontSize: 20 }} />, color: '#DC2626', bgColor: '#FEF2F2' },
  ];

  // Table Row Component for Saved Documents
  const SavedDocumentRow = ({ row, index, isLast }) => {
    const typeConfig = getDocumentTypeConfig(row.documentType);
    const { date, time } = formatDate(row.scannedAt || row.createdAt);

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 120px', md: '2fr 1fr 1.2fr 1fr 1fr 120px' },
          borderBottom: !isLast ? '1px solid #E5E7EB' : 'none',
          py: 2, px: 2, gap: 2, alignItems: 'center',
          '&:hover': { bgcolor: '#F9FAFB' }
        }}
      >
        {/* Document Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 48, height: 48, borderRadius: 1, bgcolor: `${typeConfig.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: typeConfig.color }}>
            {typeConfig.icon}
          </Box>
          <Box>
            <Typography sx={{ color: '#111827', fontSize: '14px', fontWeight: 600, mb: 0.25 }}>
              {row.fileName || 'Untitled Document'}
            </Typography>
            <Typography sx={{ color: '#6B7280', fontSize: '12px' }}>
              {row.fileSize || '-'}
            </Typography>
          </Box>
        </Box>

        {/* Type */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Chip
            label={row.documentType || 'Unknown'}
            size="small"
            sx={{ bgcolor: `${typeConfig.color}15`, color: typeConfig.color, fontWeight: 500, fontSize: '12px' }}
          />
        </Box>

        {/* Status */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <StatusChip status={row.status} />
        </Box>

        {/* Date */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Typography sx={{ color: '#111827', fontSize: '14px', mb: 0.25 }}>{date}</Typography>
          <Typography sx={{ color: '#6B7280', fontSize: '12px' }}>{time}</Typography>
        </Box>

        {/* Processing Time */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Typography sx={{ color: '#111827', fontSize: '14px' }}>
            {row.processingTime || '-'}
          </Typography>
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
          <IconButton
            size="small"
            onClick={() => handleEditDetail(row.id)}
            sx={{ color: '#F59E0B', bgcolor: '#FEF3C7', '&:hover': { bgcolor: '#FDE68A' } }}
            title="Edit"
          >
            <EditIcon sx={{ fontSize: 18 }} />
          </IconButton>
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
    );
  };

  // Table Row Component for Recent Scans (with detail, rescan, delete actions)
  const RecentScanRow = ({ row, index, isLast }) => {
    const typeConfig = getDocumentTypeConfig(row.documentType);
    const { date, time } = formatDate(row.scannedAt || row.createdAt);

    const handleRescan = () => {
      // Navigate to upload page with rescan parameter
      navigate(`/upload?rescan=${row.id}`);
    };

    const handleDeleteRecentScan = () => {
      setItemToDelete(row);
      setDeleteDialogOpen(true);
    };

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 100px', md: '2fr 1fr 1.2fr 1fr 1fr 100px' },
          borderBottom: !isLast ? '1px solid #E5E7EB' : 'none',
          py: 2, px: 2, gap: 2, alignItems: 'center',
          '&:hover': { bgcolor: '#FFFBEB' }
        }}
      >
        {/* Document Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: `${typeConfig.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: typeConfig.color }}>
            {typeConfig.icon}
          </Box>
          <Box>
            <Typography sx={{ color: '#111827', fontSize: '13px', fontWeight: 500, mb: 0.25 }}>
              {row.fileName || 'Untitled Document'}
            </Typography>
            <Typography sx={{ color: '#6B7280', fontSize: '11px' }}>
              {row.fileSize || '-'}
            </Typography>
          </Box>
        </Box>

        {/* Type */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Chip
            label={row.documentType || 'Unknown'}
            size="small"
            sx={{ bgcolor: `${typeConfig.color}15`, color: typeConfig.color, fontWeight: 500, fontSize: '11px', height: 22 }}
          />
        </Box>

        {/* Status */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <StatusChip status={row.status} />
        </Box>

        {/* Date */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Typography sx={{ color: '#111827', fontSize: '13px', mb: 0.25 }}>{date}</Typography>
          <Typography sx={{ color: '#6B7280', fontSize: '11px' }}>{time}</Typography>
        </Box>

        {/* Processing Time */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Typography sx={{ color: '#111827', fontSize: '13px' }}>
            {row.processingTime || '-'}
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-start' }}>
          <IconButton
            size="small"
            onClick={() => handleViewDetail(row.id)}
            sx={{ color: '#3B82F6', bgcolor: '#EFF6FF', '&:hover': { bgcolor: '#DBEAFE' } }}
            title="View Details"
          >
            <ViewIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleRescan}
            sx={{ color: '#10B981', bgcolor: '#ECFDF5', '&:hover': { bgcolor: '#D1FAE5' } }}
            title="Rescan"
          >
            <RescanIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleDeleteRecentScan}
            sx={{ color: '#EF4444', bgcolor: '#FEE2E2', '&:hover': { bgcolor: '#FECACA' } }}
            title="Delete"
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: '#F9FAFB', minHeight: '100vh', pb: 4 }}>
      <Toolbar sx={{ minHeight: { xs: 56, sm: 89 } }} />

      {/* Header Actions */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #E5E7EB', py: 2 }}>
        <Container maxWidth="xl">
          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 1.5
          }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchAllData}
              disabled={isLoading}
              sx={{
                borderColor: '#D1D5DB', color: '#374151', textTransform: 'none', px: 2,
                '&:hover': { borderColor: '#9CA3AF', bgcolor: '#F9FAFB' }
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/upload"
              sx={{
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                textTransform: 'none', px: 2.5, boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                '&:hover': { background: 'linear-gradient(135deg, #5558E3 0%, #7C3AED 100%)' }
              }}
            >
              New Scan
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Filter Section */}
      <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #E5E7EB', py: 2 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search saved documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9CA3AF' }} /></InputAdornment>,
                sx: { fontSize: '14px', bgcolor: 'white' }
              }}
              sx={{ minWidth: 200 }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: '#374151', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                Document Type:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={documentType} onChange={(e) => setDocumentType(e.target.value)} sx={{ fontSize: '14px', bgcolor: 'white' }}>
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="KTP">KTP</MenuItem>
                  <MenuItem value="KK">KK</MenuItem>
                  <MenuItem value="SIM">SIM</MenuItem>
                  <MenuItem value="STNK">STNK</MenuItem>
                  <MenuItem value="BPKB">BPKB</MenuItem>
                  <MenuItem value="Invoice">Invoice</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: '#374151', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                Status:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select value={status} onChange={(e) => setStatus(e.target.value)} sx={{ fontSize: '14px', bgcolor: 'white' }}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="processing">Processing</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Button
              sx={{ color: '#4F46E5', textTransform: 'none', fontSize: '14px', '&:hover': { bgcolor: '#EEF2FF' } }}
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 3 }}>
        {/* Statistics Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
          {statsData.map((stat, index) => (
            <Paper key={index} elevation={0} sx={{ p: 3, border: '1px solid #E5E7EB', borderRadius: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ color: '#6B7280', fontSize: '14px', mb: 1 }}>{stat.label}</Typography>
                  <Typography sx={{ color: '#111827', fontSize: '30px', fontWeight: 700, lineHeight: '36px' }}>
                    {isLoading ? '-' : stat.value.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: stat.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                  {stat.icon}
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Loading State */}
        {isLoading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

        {/* Saved Documents Section */}
        <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 1.5, overflow: 'hidden', mb: 4 }}>
          {/* Section Header */}
          <Box sx={{ bgcolor: '#F9FAFB', py: 2, px: 2, borderBottom: '1px solid #E5E7EB' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SaveIcon sx={{ color: '#6366F1', fontSize: 24 }} />
              <Typography sx={{ color: '#111827', fontSize: '16px', fontWeight: 600 }}>
                Saved Documents
              </Typography>
              <Chip label={pagination.total} size="small" sx={{ bgcolor: '#EEF2FF', color: '#6366F1', fontWeight: 600, ml: 1 }} />
            </Box>
          </Box>

          {/* Table Header */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 120px', md: '2fr 1fr 1.2fr 1fr 1fr 120px' },
            borderBottom: '1px solid #E5E7EB', bgcolor: 'white', py: 1.5, px: 2, gap: 2
          }}>
            <Typography sx={{ color: '#4B5563', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px' }}>DOCUMENT</Typography>
            <Typography sx={{ color: '#4B5563', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', display: { xs: 'none', md: 'block' } }}>TYPE</Typography>
            <Typography sx={{ color: '#4B5563', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', display: { xs: 'none', md: 'block' } }}>STATUS</Typography>
            <Typography sx={{ color: '#4B5563', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', display: { xs: 'none', md: 'block' } }}>SCANNED DATE</Typography>
            <Typography sx={{ color: '#4B5563', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', display: { xs: 'none', md: 'block' } }}>PROCESSING TIME</Typography>
            <Typography sx={{ color: '#4B5563', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', textAlign: 'center' }}>ACTIONS</Typography>
          </Box>

          {/* Empty State */}
          {!isLoading && savedDocuments.length === 0 && (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <SaveIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 2 }} />
              <Typography sx={{ color: '#6B7280', fontSize: '16px', mb: 1 }}>No saved documents</Typography>
              <Typography sx={{ color: '#9CA3AF', fontSize: '14px' }}>Documents you save will appear here</Typography>
            </Box>
          )}

          {/* Table Rows */}
          {savedDocuments.map((row, index) => (
            <SavedDocumentRow key={row.id} row={row} index={index} isLast={index === savedDocuments.length - 1} />
          ))}
        </Paper>

        {/* Pagination for Saved Documents */}
        {pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Typography sx={{ color: '#6B7280', fontSize: '14px' }}>
              Showing <Box component="span" sx={{ fontWeight: 500, color: '#111827' }}>{((currentPage - 1) * itemsPerPage) + 1}</Box> to{' '}
              <Box component="span" sx={{ fontWeight: 500, color: '#111827' }}>{Math.min(currentPage * itemsPerPage, pagination.total)}</Box> of{' '}
              <Box component="span" sx={{ fontWeight: 500, color: '#111827' }}>{pagination.total}</Box> saved documents
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                sx={{ minWidth: 35, px: 1, borderColor: '#D1D5DB', color: '#374151' }}
              >
                ‹
              </Button>
              {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "contained" : "outlined"}
                    onClick={() => handlePageChange(pageNum)}
                    sx={{
                      minWidth: 35, px: 1.5,
                      ...(currentPage === pageNum
                        ? { background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', boxShadow: 'none' }
                        : { borderColor: '#D1D5DB', color: '#374151' })
                    }}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {pagination.totalPages > 5 && <Typography sx={{ px: 1, color: '#6B7280', display: 'flex', alignItems: 'center' }}>...</Typography>}
              <Button
                variant="outlined"
                disabled={currentPage === pagination.totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                sx={{ minWidth: 35, px: 1, borderColor: '#D1D5DB', color: '#374151' }}
              >
                ›
              </Button>
            </Box>
          </Box>
        )}

        {/* Recent Scans Section */}
        <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 1.5, overflow: 'hidden' }}>
          {/* Section Header */}
          <Box sx={{ bgcolor: '#FEF3C7', py: 2, px: 2, borderBottom: '1px solid #E5E7EB' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <HistoryIcon sx={{ color: '#D97706', fontSize: 24 }} />
              <Typography sx={{ color: '#92400E', fontSize: '16px', fontWeight: 600 }}>
                Recent Scans (Unsaved)
              </Typography>
            </Box>
            <Typography sx={{ color: '#A16207', fontSize: '12px', mt: 0.5 }}>
              Only the last 10 unsaved scans are kept. Save important documents to avoid losing them.
            </Typography>
          </Box>

          {/* Table Header */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 100px', md: '2fr 1fr 1.2fr 1fr 1fr 100px' },
            borderBottom: '1px solid #E5E7EB', bgcolor: 'white', py: 1.5, px: 2, gap: 2
          }}>
            <Typography sx={{ color: '#4B5563', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px' }}>DOCUMENT</Typography>
            <Typography sx={{ color: '#4B5563', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', display: { xs: 'none', md: 'block' } }}>TYPE</Typography>
            <Typography sx={{ color: '#4B5563', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', display: { xs: 'none', md: 'block' } }}>STATUS</Typography>
            <Typography sx={{ color: '#4B5563', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', display: { xs: 'none', md: 'block' } }}>SCANNED DATE</Typography>
            <Typography sx={{ color: '#4B5563', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', display: { xs: 'none', md: 'block' } }}>PROCESSING TIME</Typography>
            <Typography sx={{ color: '#4B5563', fontSize: '12px', fontWeight: 600, letterSpacing: '0.6px', textAlign: 'center' }}>ACTIONS</Typography>
          </Box>

          {/* Empty State */}
          {!isLoading && recentScans.length === 0 && (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <HistoryIcon sx={{ fontSize: 40, color: '#D1D5DB', mb: 1.5 }} />
              <Typography sx={{ color: '#6B7280', fontSize: '14px' }}>No recent scans</Typography>
            </Box>
          )}

          {/* Table Rows */}
          {recentScans.map((row, index) => (
            <RecentScanRow key={row.id} row={row} index={index} isLast={index === recentScans.length - 1} />
          ))}
        </Paper>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => !isDeleting && setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3, minWidth: 400 } }}>
        <DialogTitle sx={{ fontWeight: 600, color: '#DC2626' }}>Delete Document</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#374151' }}>
            Are you sure you want to delete <strong>{itemToDelete?.fileName}</strong>?
          </Typography>
          <Typography sx={{ color: '#6B7280', fontSize: '14px', mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#6B7280' }} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            sx={{ bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' }, borderRadius: 2, textTransform: 'none' }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ScanHistoryPage;
