import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, Skeleton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Avatar
} from '@mui/material';
import {
    People as PeopleIcon,
    PersonOff as PersonOffIcon,
    Description as DocIcon,
    TrendingUp as TrendingIcon
} from '@mui/icons-material';
import { getAdminStats } from '../../services/adminService';

const StatCard = ({ title, value, icon, color, loading }) => (
    <Paper
        elevation={0}
        sx={{
            p: 3,
            borderRadius: 2,
            border: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
        }}
    >
        <Box sx={{
            width: 48, height: 48, borderRadius: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: `${color}15`, color: color,
        }}>
            {icon}
        </Box>
        <Box>
            <Typography sx={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>
                {title}
            </Typography>
            {loading ? (
                <Skeleton width={60} height={32} />
            ) : (
                <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#1F2937' }}>
                    {value}
                </Typography>
            )}
        </Box>
    </Paper>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await getAdminStats();
            setStats(response.data);
        } catch (err) {
            setError('Failed to load dashboard statistics.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Never';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, pt: { xs: 10, md: 12 } }}>
            {/* Header */}
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1F2937', mb: 1 }}>
                Admin Dashboard
            </Typography>
            <Typography sx={{ color: '#6B7280', mb: 4, fontSize: '14px' }}>
                Overview of system statistics and recent activity
            </Typography>

            {error && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 2 }}>
                    <Typography sx={{ color: '#DC2626', fontSize: '14px' }}>{error}</Typography>
                </Paper>
            )}

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Users"
                        value={stats?.totalUsers || 0}
                        icon={<PeopleIcon />}
                        color="#6366F1"
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Users"
                        value={stats?.activeUsers || 0}
                        icon={<TrendingIcon />}
                        color="#10B981"
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Inactive Users"
                        value={stats?.inactiveUsers || 0}
                        icon={<PersonOffIcon />}
                        color="#EF4444"
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Documents"
                        value={stats?.totalDocuments || 0}
                        icon={<DocIcon />}
                        color="#F59E0B"
                        loading={loading}
                    />
                </Grid>
            </Grid>

            {/* Active Today */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB', mb: 4 }}>
                <Typography sx={{ fontWeight: 600, color: '#1F2937', mb: 0.5, fontSize: '16px' }}>
                    Active Today
                </Typography>
                <Typography sx={{ fontSize: '36px', fontWeight: 700, color: '#6366F1' }}>
                    {loading ? <Skeleton width={40} height={48} /> : stats?.activeToday || 0}
                </Typography>
                <Typography sx={{ color: '#6B7280', fontSize: '13px' }}>
                    Users logged in today
                </Typography>
            </Paper>

            {/* Recent Users */}
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #E5E7EB' }}>
                    <Typography sx={{ fontWeight: 600, color: '#1F2937', fontSize: '16px' }}>
                        Recently Registered Users
                    </Typography>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Last Login</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Registered</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <TableRow key={i}>
                                        {[1, 2, 3, 4, 5].map(j => (
                                            <TableCell key={j}><Skeleton /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : stats?.recentUsers?.length > 0 ? (
                                stats.recentUsers.map((user) => (
                                    <TableRow key={user.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#6366F1', fontSize: '14px' }}>
                                                    {(user.name || user.email)?.[0]?.toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
                                                        {user.name || '-'}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>
                                                        {user.email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.role}
                                                size="small"
                                                sx={{
                                                    bgcolor: user.role === 'admin' ? '#EDE9FE' : '#F3F4F6',
                                                    color: user.role === 'admin' ? '#7C3AED' : '#374151',
                                                    fontWeight: 500, fontSize: '12px', height: 24,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.isActive ? 'Active' : 'Inactive'}
                                                size="small"
                                                sx={{
                                                    bgcolor: user.isActive ? '#D1FAE5' : '#FEE2E2',
                                                    color: user.isActive ? '#059669' : '#DC2626',
                                                    fontWeight: 500, fontSize: '12px', height: 24,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>
                                                {formatDate(user.lastLoginAt)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>
                                                {formatDate(user.createdAt)}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <Typography sx={{ color: '#9CA3AF' }}>No users found</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default AdminDashboard;
