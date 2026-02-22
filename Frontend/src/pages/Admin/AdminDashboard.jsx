import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, Skeleton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Avatar, LinearProgress
} from '@mui/material';
import {
    People as PeopleIcon,
    PersonOff as PersonOffIcon,
    Description as DocIcon,
    TrendingUp as TrendingIcon,
    Scanner as ScanIcon,
    Today as TodayIcon,
    Storage as StorageIcon,
    CheckCircle as CheckIcon,
    Speed as SpeedIcon
} from '@mui/icons-material';
import { getAdminStats } from '../../services/adminService';

const StatCard = ({ title, value, icon, color, loading, subtitle }) => (
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
                <>
                    <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#1F2937' }}>
                        {value}
                    </Typography>
                    {subtitle && (
                        <Typography sx={{ fontSize: '12px', color: '#9CA3AF', mt: -0.5 }}>
                            {subtitle}
                        </Typography>
                    )}
                </>
            )}
        </Box>
    </Paper>
);

const formatStorageSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

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

    const totalScans = stats?.totalDocuments || 0;
    const completedScans = stats?.completedScans || 0;
    const processingScans = stats?.processingScans || 0;
    const failedScans = stats?.failedScans || 0;

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, pt: { xs: 11, md: 13 } }}>
            {error && (
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 2 }}>
                    <Typography sx={{ color: '#DC2626', fontSize: '14px' }}>{error}</Typography>
                </Paper>
            )}

            {/* User Stats Cards */}
            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Users
            </Typography>
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
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
                        title="Active Today"
                        value={stats?.activeToday || 0}
                        icon={<TodayIcon />}
                        color="#3B82F6"
                        loading={loading}
                        subtitle="Logged in today"
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
            </Grid>

            {/* Scan Stats Cards */}
            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#6B7280', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Scans & Storage
            </Typography>
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Scans"
                        value={stats?.totalDocuments || 0}
                        icon={<ScanIcon />}
                        color="#8B5CF6"
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Scans Today"
                        value={stats?.scansToday || 0}
                        icon={<TodayIcon />}
                        color="#F59E0B"
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Success Rate"
                        value={loading ? '' : `${stats?.successRate || 0}%`}
                        icon={<SpeedIcon />}
                        color="#10B981"
                        loading={loading}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Storage Usage"
                        value={loading ? '' : formatStorageSize(stats?.storageUsage || 0)}
                        icon={<StorageIcon />}
                        color="#EC4899"
                        loading={loading}
                    />
                </Grid>
            </Grid>

            {/* Scan Status Breakdown */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB', mb: 4 }}>
                <Typography sx={{ fontWeight: 600, color: '#1F2937', mb: 2.5, fontSize: '16px' }}>
                    Scan Status Breakdown
                </Typography>
                {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Skeleton height={40} />
                        <Skeleton height={40} />
                        <Skeleton height={40} />
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        {/* Completed */}
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckIcon sx={{ fontSize: 16, color: '#10B981' }} />
                                    <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Completed</Typography>
                                </Box>
                                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{completedScans}</Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={totalScans > 0 ? (completedScans / totalScans) * 100 : 0}
                                sx={{
                                    height: 8, borderRadius: 4,
                                    bgcolor: '#D1FAE5',
                                    '& .MuiLinearProgress-bar': { bgcolor: '#10B981', borderRadius: 4 }
                                }}
                            />
                        </Box>
                        {/* Processing */}
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                                    <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Processing</Typography>
                                </Box>
                                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{processingScans}</Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={totalScans > 0 ? (processingScans / totalScans) * 100 : 0}
                                sx={{
                                    height: 8, borderRadius: 4,
                                    bgcolor: '#FEF3C7',
                                    '& .MuiLinearProgress-bar': { bgcolor: '#F59E0B', borderRadius: 4 }
                                }}
                            />
                        </Box>
                        {/* Failed */}
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#EF4444' }} />
                                    <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Failed</Typography>
                                </Box>
                                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{failedScans}</Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={totalScans > 0 ? (failedScans / totalScans) * 100 : 0}
                                sx={{
                                    height: 8, borderRadius: 4,
                                    bgcolor: '#FEE2E2',
                                    '& .MuiLinearProgress-bar': { bgcolor: '#EF4444', borderRadius: 4 }
                                }}
                            />
                        </Box>
                    </Box>
                )}
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
