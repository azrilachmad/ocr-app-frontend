import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, IconButton, TextField, InputAdornment,
    Select, MenuItem, FormControl, InputLabel, Skeleton, Pagination,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    Button, Snackbar, Alert, Avatar, Tooltip
} from '@mui/material';
import {
    Search as SearchIcon,
    Delete as DeleteIcon,
    Description as DocIcon
} from '@mui/icons-material';
import { getAdminDocuments, deleteAdminDocument } from '../../services/adminService';

const DocumentManagement = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [deleteDialog, setDeleteDialog] = useState({ open: false, doc: null });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchDocuments = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const params = { page, limit: 10 };
            if (search) params.search = search;
            if (statusFilter !== 'all') params.status = statusFilter;
            if (typeFilter !== 'all') params.documentType = typeFilter;

            const response = await getAdminDocuments(params);
            setDocuments(response.data.documents);
            setPagination(response.data.pagination);
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to load documents.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, typeFilter]);

    useEffect(() => {
        fetchDocuments(1);
    }, [fetchDocuments]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            fetchDocuments(1);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteAdminDocument(deleteDialog.doc.id);
            setDeleteDialog({ open: false, doc: null });
            setSnackbar({ open: true, message: 'Document deleted successfully.', severity: 'success' });
            fetchDocuments(pagination.page);
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to delete document.', severity: 'error' });
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusChip = (status) => {
        const config = {
            completed: { bgcolor: '#D1FAE5', color: '#059669', label: 'Completed' },
            processing: { bgcolor: '#FEF3C7', color: '#D97706', label: 'Processing' },
            failed: { bgcolor: '#FEE2E2', color: '#DC2626', label: 'Failed' }
        };
        const c = config[status] || config.processing;
        return (
            <Chip label={c.label} size="small"
                sx={{ bgcolor: c.bgcolor, color: c.color, fontWeight: 500, fontSize: '12px', height: 24 }} />
        );
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, pt: { xs: 11, md: 13 } }}>
            {/* Filters */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB', mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                    size="small"
                    placeholder="Search by filename..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleSearch}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: '#F9FAFB' } }}
                />
                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{ borderRadius: 1.5 }}
                    >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="processing">Processing</MenuItem>
                        <MenuItem value="failed">Failed</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Document Type</InputLabel>
                    <Select
                        value={typeFilter}
                        label="Document Type"
                        onChange={(e) => setTypeFilter(e.target.value)}
                        sx={{ borderRadius: 1.5 }}
                    >
                        <MenuItem value="all">All Types</MenuItem>
                        <MenuItem value="ktp">KTP</MenuItem>
                        <MenuItem value="invoice">Invoice</MenuItem>
                        <MenuItem value="receipt">Receipt</MenuItem>
                        <MenuItem value="document">Document</MenuItem>
                    </Select>
                </FormControl>
                <Typography sx={{ ml: 'auto', fontSize: '13px', color: '#6B7280' }}>
                    {pagination.total} documents total
                </Typography>
            </Paper>

            {/* Documents Table */}
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Document</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Owner</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Size</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Scanned</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <TableRow key={i}>
                                        {[1, 2, 3, 4, 5, 6, 7].map(j => (
                                            <TableCell key={j}><Skeleton /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : documents.length > 0 ? (
                                documents.map((doc) => (
                                    <TableRow key={doc.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{
                                                    width: 36, height: 36, borderRadius: 1,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    bgcolor: '#EDE9FE', color: '#7C3AED'
                                                }}>
                                                    <DocIcon sx={{ fontSize: 18 }} />
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#1F2937', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {doc.fileName}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '12px', color: '#9CA3AF' }}>
                                                        ID: {doc.id}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Avatar sx={{ width: 28, height: 28, bgcolor: '#6366F1', fontSize: '12px' }}>
                                                    {(doc.user?.name || doc.user?.email)?.[0]?.toUpperCase() || '?'}
                                                </Avatar>
                                                <Box>
                                                    <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>
                                                        {doc.user?.name || '-'}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '11px', color: '#9CA3AF' }}>
                                                        {doc.user?.email || '-'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={doc.documentType} size="small"
                                                sx={{ bgcolor: '#F3F4F6', color: '#374151', fontWeight: 500, fontSize: '12px', height: 24, textTransform: 'uppercase' }} />
                                        </TableCell>
                                        <TableCell>{getStatusChip(doc.status)}</TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>
                                                {doc.fileSize || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>
                                                {formatDate(doc.scannedAt)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Delete document">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setDeleteDialog({ open: true, doc })}
                                                    sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEE2E2' } }}
                                                >
                                                    <DeleteIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                        <DocIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 1 }} />
                                        <Typography sx={{ color: '#9CA3AF' }}>No documents found</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2, borderTop: '1px solid #E5E7EB' }}>
                        <Pagination
                            count={pagination.totalPages}
                            page={pagination.page}
                            onChange={(e, page) => fetchDocuments(page)}
                            color="primary"
                            size="small"
                        />
                    </Box>
                )}
            </Paper>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, doc: null })}>
                <DialogTitle sx={{ fontWeight: 600 }}>Delete Document</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete "<strong>{deleteDialog.doc?.fileName}</strong>"?
                        This will also delete the file from storage. This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteDialog({ open: false, doc: null })} sx={{ color: '#6B7280' }}>
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 1.5 }}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}
                    sx={{ borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default DocumentManagement;
