import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Paper, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Avatar, Chip, InputAdornment, CircularProgress, Pagination
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { getActivityLog } from '../../services/adminService';

const ActivityLog = () => {
    const [activity, setActivity] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchActivity = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const response = await getActivityLog({ page, limit: 15, search });
            setActivity(response.data.activity);
            setPagination(response.data.pagination);
        } catch (err) {
            console.error('Failed to load activity log:', err);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        fetchActivity();
    }, [fetchActivity]);

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getTimeSince = (dateStr) => {
        if (!dateStr) return 'Never logged in';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins} min ago`;
        if (hours < 24) return `${hours} hrs ago`;
        if (days < 30) return `${days} days ago`;
        return formatDate(dateStr);
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, pt: { xs: 11, md: 13 } }}>
            {/* Search */}
            <TextField
                size="small"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9CA3AF' }} /></InputAdornment>
                }}
                sx={{ mb: 3, minWidth: 300, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            {/* Activity Table */}
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Documents</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Last Login</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Registered</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} sx={{ color: '#6366F1' }} />
                                    </TableCell>
                                </TableRow>
                            ) : activity.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Typography sx={{ color: '#9CA3AF' }}>No activity found</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                activity.map((item) => (
                                    <TableRow key={item.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366F1', fontSize: '14px' }}>
                                                    {(item.name || item.email)?.[0]?.toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{item.name || '-'}</Typography>
                                                    <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>{item.email}</Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={item.role} size="small" sx={{
                                                bgcolor: item.role === 'admin' ? '#EDE9FE' : '#F3F4F6',
                                                color: item.role === 'admin' ? '#7C3AED' : '#374151',
                                                fontWeight: 500, fontSize: '12px', height: 24,
                                            }} />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={item.isActive ? 'Active' : 'Inactive'}
                                                size="small"
                                                sx={{
                                                    bgcolor: item.isActive ? '#D1FAE5' : '#FEE2E2',
                                                    color: item.isActive ? '#059669' : '#DC2626',
                                                    fontWeight: 500, fontSize: '12px', height: 24,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F2937' }}>
                                                {item.documentCount}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography sx={{ fontSize: '13px', color: '#1F2937', fontWeight: 500 }}>
                                                    {getTimeSince(item.lastLoginAt)}
                                                </Typography>
                                                {item.lastLoginAt && (
                                                    <Typography sx={{ fontSize: '11px', color: '#9CA3AF' }}>
                                                        {formatDate(item.lastLoginAt)}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>
                                                {formatDate(item.createdAt)}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {pagination.totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderTop: '1px solid #E5E7EB' }}>
                        <Pagination
                            count={pagination.totalPages}
                            page={pagination.page}
                            onChange={(_, page) => fetchActivity(page)}
                            color="primary"
                        />
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default ActivityLog;
