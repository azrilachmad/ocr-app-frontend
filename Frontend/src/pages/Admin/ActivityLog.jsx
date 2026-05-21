import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Paper, TextField, Select, MenuItem, FormControl,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Avatar, Chip, InputAdornment, CircularProgress, Pagination, Button
} from '@mui/material';
import {
    Search as SearchIcon,
    Login as LoginIcon,
    Logout as LogoutIcon,
    Upload as UploadIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Visibility as ViewIcon,
    Download as DownloadIcon,
    PersonSearch as ImpersonateIcon,
    Add as CreateIcon,
    ManageSearch as SearchActionIcon
} from '@mui/icons-material';
import { getActivityLog } from '../../services/adminService';

// Action config: icon, color, label
const ACTION_CONFIG = {
    LOGIN:              { icon: <LoginIcon fontSize="small" />,       bgcolor: '#D1FAE5', color: '#059669', label: 'Login' },
    LOGOUT:             { icon: <LogoutIcon fontSize="small" />,      bgcolor: '#FEE2E2', color: '#DC2626', label: 'Logout' },
    REGISTER:           { icon: <CreateIcon fontSize="small" />,      bgcolor: '#DBEAFE', color: '#2563EB', label: 'Register' },
    VIEW:               { icon: <ViewIcon fontSize="small" />,        bgcolor: '#EDE9FE', color: '#7C3AED', label: 'View' },
    CREATE:             { icon: <CreateIcon fontSize="small" />,      bgcolor: '#D1FAE5', color: '#059669', label: 'Create' },
    UPDATE:             { icon: <EditIcon fontSize="small" />,        bgcolor: '#FEF3C7', color: '#D97706', label: 'Update' },
    DELETE:             { icon: <DeleteIcon fontSize="small" />,      bgcolor: '#FEE2E2', color: '#DC2626', label: 'Delete' },
    UPLOAD:             { icon: <UploadIcon fontSize="small" />,      bgcolor: '#DBEAFE', color: '#2563EB', label: 'Upload' },
    DOWNLOAD:           { icon: <DownloadIcon fontSize="small" />,    bgcolor: '#E0E7FF', color: '#4F46E5', label: 'Download' },
    EXPORT:             { icon: <DownloadIcon fontSize="small" />,    bgcolor: '#E0E7FF', color: '#4F46E5', label: 'Export' },
    IMPERSONATE:        { icon: <ImpersonateIcon fontSize="small" />, bgcolor: '#FEF3C7', color: '#D97706', label: 'Impersonate' },
    STOP_IMPERSONATE:   { icon: <ImpersonateIcon fontSize="small" />, bgcolor: '#F3F4F6', color: '#6B7280', label: 'Stop Impersonate' },
    SEARCH:             { icon: <SearchActionIcon fontSize="small" />,bgcolor: '#F3F4F6', color: '#6B7280', label: 'Search' },
};

const ActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchLogs = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const params = { page, limit: 20, search };
            if (actionFilter) params.action = actionFilter;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await getActivityLog(params);
            setLogs(response.data.activity || []);
            setPagination(response.data.pagination || { total: 0, page: 1, totalPages: 1 });
        } catch (err) {
            console.error('Failed to load activity log:', err);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, [search, actionFilter, startDate, endDate]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getTimeSince = (dateStr) => {
        if (!dateStr) return '-';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return formatDate(dateStr);
    };

    const getActionConfig = (action) => ACTION_CONFIG[action] || { bgcolor: '#F3F4F6', color: '#6B7280', label: action };

    const getResourceLabel = (resource) => {
        if (!resource) return '-';
        const map = {
            'auth': 'Authentication',
            'auth/login': 'Authentication',
            'auth/logout': 'Authentication',
            'admin/users': 'User Management',
            'admin/impersonate': 'Impersonation',
            'kb/articles': 'KB Articles',
            'kb/files': 'KB Files',
            'documents': 'Documents',
            'ocr': 'OCR Processing',
        };
        return map[resource] || resource;
    };

    const getDescription = (log) => {
        const user = log.user;
        const userName = user?.name || user?.email || 'Unknown';
        const details = log.details || {};

        switch (log.action) {
            case 'LOGIN':
                return `${userName} logged in`;
            case 'LOGOUT':
                return `${userName} logged out`;
            case 'REGISTER':
                return `New user registered: ${userName}`;
            case 'UPLOAD':
                return `${userName} uploaded a document`;
            case 'DELETE':
                return `${userName} deleted ${log.resource || 'a resource'}${log.resourceId ? ` #${log.resourceId}` : ''}`;
            case 'UPDATE':
                return `${userName} updated ${log.resource || 'a resource'}${log.resourceId ? ` #${log.resourceId}` : ''}`;
            case 'VIEW':
                return `${userName} viewed ${log.resource || 'a resource'}`;
            case 'IMPERSONATE':
                return `${userName} started impersonating ${details.targetName || details.targetEmail || `user #${log.resourceId}`}`;
            case 'STOP_IMPERSONATE':
                return `${userName} stopped impersonation`;
            case 'EXPORT':
                return `${userName} exported ${log.resource || 'data'}`;
            case 'SEARCH':
                return `${userName} searched ${log.resource || ''}`;
            default:
                return `${userName} performed ${log.action} on ${log.resource || 'system'}`;
        }
    };

    const handleClearFilters = () => {
        setSearch('');
        setActionFilter('');
        setStartDate('');
        setEndDate('');
    };

    const actionTypes = ['LOGIN', 'LOGOUT', 'REGISTER', 'VIEW', 'CREATE', 'UPDATE', 'DELETE', 'UPLOAD', 'DOWNLOAD', 'EXPORT', 'IMPERSONATE', 'STOP_IMPERSONATE', 'SEARCH'];

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, pt: { xs: 11, md: 13 } }}>
            {/* Filters */}
            <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        size="small"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9CA3AF' }} /></InputAdornment>,
                            sx: { fontSize: '14px' }
                        }}
                        sx={{ minWidth: 240, flex: 1, maxWidth: 320, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ color: '#374151', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>Action:</Typography>
                        <FormControl size="small" sx={{ minWidth: 140 }}>
                            <Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} displayEmpty sx={{ fontSize: '14px' }}>
                                <MenuItem value="">All Actions</MenuItem>
                                {actionTypes.map(a => (
                                    <MenuItem key={a} value={a}>{ACTION_CONFIG[a]?.label || a}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ color: '#374151', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>Date:</Typography>
                        <TextField size="small" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputProps={{ sx: { fontSize: '13px' } }} sx={{ width: 150 }} />
                        <Typography sx={{ color: '#9CA3AF', fontSize: '13px' }}>—</Typography>
                        <TextField size="small" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputProps={{ sx: { fontSize: '13px' } }} sx={{ width: 150 }} />
                    </Box>

                    <Button sx={{ color: '#4F46E5', textTransform: 'none', fontSize: '14px', '&:hover': { bgcolor: '#EEF2FF' } }} onClick={handleClearFilters}>
                        Clear Filters
                    </Button>
                </Box>
            </Paper>

            {/* Activity Table */}
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Action</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Resource</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>IP Address</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Time</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} sx={{ color: '#6366F1' }} />
                                    </TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Typography sx={{ color: '#9CA3AF' }}>No activity logs found</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => {
                                    const config = getActionConfig(log.action);
                                    const user = log.user;
                                    return (
                                        <TableRow key={log.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                                            {/* User */}
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366F1', fontSize: '13px' }}>
                                                        {(user?.name || user?.email)?.[0]?.toUpperCase() || '?'}
                                                    </Avatar>
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography sx={{ fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                                                            {user?.name || '-'}
                                                        </Typography>
                                                        <Typography sx={{ fontSize: '11px', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                                                            {user?.email || '-'}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>

                                            {/* Action Badge */}
                                            <TableCell>
                                                <Chip
                                                    icon={config.icon}
                                                    label={config.label}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: config.bgcolor,
                                                        color: config.color,
                                                        fontWeight: 600,
                                                        fontSize: '11px',
                                                        height: 26,
                                                        '& .MuiChip-icon': { color: config.color }
                                                    }}
                                                />
                                            </TableCell>

                                            {/* Description */}
                                            <TableCell>
                                                <Typography sx={{ fontSize: '13px', color: '#374151', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {getDescription(log)}
                                                </Typography>
                                            </TableCell>

                                            {/* Resource */}
                                            <TableCell>
                                                <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>
                                                    {getResourceLabel(log.resource)}
                                                </Typography>
                                            </TableCell>

                                            {/* IP */}
                                            <TableCell>
                                                <Typography sx={{ fontSize: '12px', color: '#6B7280', fontFamily: 'monospace' }}>
                                                    {log.ipAddress || '-'}
                                                </Typography>
                                            </TableCell>

                                            {/* Time */}
                                            <TableCell>
                                                <Box>
                                                    <Typography sx={{ fontSize: '13px', color: '#1F2937', fontWeight: 500 }}>
                                                        {getTimeSince(log.createdAt)}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '11px', color: '#9CA3AF' }}>
                                                        {formatDate(log.createdAt)}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {pagination.totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderTop: '1px solid #E5E7EB' }}>
                        <Pagination
                            count={pagination.totalPages}
                            page={pagination.page}
                            onChange={(_, page) => fetchLogs(page)}
                            color="primary"
                        />
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default ActivityLog;
