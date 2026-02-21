import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Paper, TextField, Switch,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Avatar, InputAdornment, Snackbar, Alert, CircularProgress,
    Chip, Pagination
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { getUsers, updateUserFeatures } from '../../services/adminService';

const FEATURE_LIST = [
    { key: 'knowledgeBase', label: 'Knowledge Base', description: 'AI Agent for data analysis' },
    { key: 'batchScan', label: 'Batch Scan', description: 'Bulk document scanning' },
];

const FeatureToggle = () => {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [updating, setUpdating] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchUsers = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const response = await getUsers({ page, limit: 10, search, status: 'active' });
            setUsers(response.data.users);
            setPagination(response.data.pagination);
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to load users.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleToggleFeature = async (userId, featureKey, currentValue) => {
        const updateKey = `${userId}-${featureKey}`;
        try {
            setUpdating(prev => ({ ...prev, [updateKey]: true }));
            await updateUserFeatures(userId, { [featureKey]: !currentValue });

            // Update local state
            setUsers(prev =>
                prev.map(u =>
                    u.id === userId
                        ? { ...u, features: { ...u.features, [featureKey]: !currentValue } }
                        : u
                )
            );
            setSnackbar({ open: true, message: 'Feature updated successfully.', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to update feature.', severity: 'error' });
        } finally {
            setUpdating(prev => ({ ...prev, [updateKey]: false }));
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, pt: { xs: 8, md: 10 } }}>
            {/* Feature Legend */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #E5E7EB', display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {FEATURE_LIST.map(f => (
                    <Box key={f.key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={f.label} size="small" sx={{ bgcolor: '#EDE9FE', color: '#7C3AED', fontWeight: 600, fontSize: '12px' }} />
                        <Typography sx={{ color: '#6B7280', fontSize: '13px' }}>{f.description}</Typography>
                    </Box>
                ))}
            </Paper>

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

            {/* Table */}
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Role</TableCell>
                                {FEATURE_LIST.map(f => (
                                    <TableCell key={f.key} align="center" sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>
                                        {f.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={2 + FEATURE_LIST.length} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} sx={{ color: '#6366F1' }} />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2 + FEATURE_LIST.length} align="center" sx={{ py: 6 }}>
                                        <Typography sx={{ color: '#9CA3AF' }}>No users found</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366F1', fontSize: '14px' }}>
                                                    {(user.name || user.email)?.[0]?.toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{user.name || '-'}</Typography>
                                                    <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>{user.email}</Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={user.role} size="small" sx={{
                                                bgcolor: user.role === 'admin' ? '#EDE9FE' : '#F3F4F6',
                                                color: user.role === 'admin' ? '#7C3AED' : '#374151',
                                                fontWeight: 500, fontSize: '12px', height: 24,
                                            }} />
                                        </TableCell>
                                        {FEATURE_LIST.map(f => {
                                            const isEnabled = user.features?.[f.key] ?? false;
                                            const isUpdating = updating[`${user.id}-${f.key}`];
                                            return (
                                                <TableCell key={f.key} align="center">
                                                    {isUpdating ? (
                                                        <CircularProgress size={20} sx={{ color: '#6366F1' }} />
                                                    ) : (
                                                        <Switch
                                                            checked={isEnabled}
                                                            onChange={() => handleToggleFeature(user.id, f.key, isEnabled)}
                                                            size="small"
                                                            sx={{
                                                                '& .MuiSwitch-switchBase.Mui-checked': { color: '#7C3AED' },
                                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#7C3AED' }
                                                            }}
                                                        />
                                                    )}
                                                </TableCell>
                                            );
                                        })}
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
                            onChange={(_, page) => fetchUsers(page)}
                            color="primary"
                        />
                    </Box>
                )}
            </Paper>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default FeatureToggle;
