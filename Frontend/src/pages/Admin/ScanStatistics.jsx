import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Skeleton, TextField, Avatar,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, LinearProgress
} from '@mui/material';
import {
    TrendingUp as TrendIcon,
    CalendarToday as CalendarIcon,
    Speed as SpeedIcon,
    BarChart as ChartIcon
} from '@mui/icons-material';
import { getScanStatistics } from '../../services/adminService';

const ScanStatistics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            const response = await getScanStatistics(params);
            setData(response.data);
        } catch (err) {
            console.error('Failed to load scan statistics:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        fetchStats();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    const maxDailyScans = data?.dailyScans?.length > 0
        ? Math.max(...data.dailyScans.map(d => parseInt(d.total)))
        : 1;

    const typeColors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#3B82F6'];

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, pt: { xs: 11, md: 13 } }}>
            {/* Date Filters */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E5E7EB', mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                    size="small" type="date" label="Start Date"
                    value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />
                <TextField
                    size="small" type="date" label="End Date"
                    value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />
                <Box
                    component="button"
                    onClick={handleFilter}
                    sx={{
                        px: 3, py: 1, borderRadius: 1.5, border: 'none', cursor: 'pointer',
                        bgcolor: '#7C3AED', color: 'white', fontWeight: 600, fontSize: '14px',
                        '&:hover': { bgcolor: '#6D28D9' }
                    }}
                >
                    Apply Filter
                </Box>
            </Paper>

            {/* Summary Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
                {loading ? (
                    [1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={90} sx={{ borderRadius: 2 }} />)
                ) : (
                    <>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 48, height: 48, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#EDE9FE', color: '#7C3AED' }}>
                                <TrendIcon />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>Total Scans (Period)</Typography>
                                <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#1F2937' }}>{data?.summary?.totalScansInRange || 0}</Typography>
                            </Box>
                        </Paper>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 48, height: 48, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#DBEAFE', color: '#3B82F6' }}>
                                <SpeedIcon />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>Avg. Scans / Day</Typography>
                                <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#1F2937' }}>{data?.summary?.avgPerDay || 0}</Typography>
                            </Box>
                        </Paper>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ width: 48, height: 48, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#D1FAE5', color: '#10B981' }}>
                                <CalendarIcon />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>Days in Range</Typography>
                                <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#1F2937' }}>{data?.summary?.daysInRange || 0}</Typography>
                            </Box>
                        </Paper>
                    </>
                )}
            </Box>

            {/* Daily Scan Trend (Bar Chart) */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB', mb: 3 }}>
                <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ChartIcon sx={{ color: '#7C3AED' }} /> Daily Scan Trend
                </Typography>
                {loading ? (
                    <Skeleton variant="rounded" height={200} />
                ) : data?.dailyScans?.length > 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 200, overflowX: 'auto', pb: 3, position: 'relative' }}>
                        {data.dailyScans.map((day, idx) => {
                            const total = parseInt(day.total);
                            const completed = parseInt(day.completed || 0);
                            const failed = parseInt(day.failed || 0);
                            const barHeight = (total / maxDailyScans) * 160;
                            const completedH = total > 0 ? (completed / total) * barHeight : 0;
                            const failedH = total > 0 ? (failed / total) * barHeight : 0;

                            return (
                                <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 28 }}>
                                    <Typography sx={{ fontSize: '10px', color: '#6B7280', mb: 0.5 }}>{total}</Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column-reverse', height: 160 }}>
                                        <Box sx={{ width: 20, height: completedH, bgcolor: '#10B981', borderRadius: '2px 2px 0 0', minHeight: total > 0 ? 2 : 0 }} />
                                        {failedH > 0 && (
                                            <Box sx={{ width: 20, height: failedH, bgcolor: '#EF4444', borderRadius: '2px 2px 0 0' }} />
                                        )}
                                        {barHeight - completedH - failedH > 0 && (
                                            <Box sx={{ width: 20, height: Math.max(0, barHeight - completedH - failedH), bgcolor: '#F59E0B', borderRadius: '2px 2px 0 0' }} />
                                        )}
                                    </Box>
                                    <Typography sx={{ fontSize: '9px', color: '#9CA3AF', mt: 0.5, transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                                        {formatDate(day.date)}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                ) : (
                    <Typography sx={{ color: '#9CA3AF', textAlign: 'center', py: 4 }}>No scan data for this period</Typography>
                )}
                <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: '#10B981' }} />
                        <Typography sx={{ fontSize: '11px', color: '#6B7280' }}>Completed</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: '#F59E0B' }} />
                        <Typography sx={{ fontSize: '11px', color: '#6B7280' }}>Processing</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: '#EF4444' }} />
                        <Typography sx={{ fontSize: '11px', color: '#6B7280' }}>Failed</Typography>
                    </Box>
                </Box>
            </Paper>

            {/* Two Column Layout: Type Breakdown & Top Users */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                {/* Document Type Breakdown */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB' }}>
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', mb: 2 }}>
                        Document Type Breakdown
                    </Typography>
                    {loading ? (
                        [1, 2, 3].map(i => <Skeleton key={i} height={40} sx={{ mb: 1 }} />)
                    ) : data?.typeBreakdown?.length > 0 ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {data.typeBreakdown.map((item, idx) => (
                                <Box key={item.type}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Chip label={item.type} size="small"
                                                sx={{ bgcolor: `${typeColors[idx % typeColors.length]}15`, color: typeColors[idx % typeColors.length], fontWeight: 600, fontSize: '11px', height: 22, textTransform: 'uppercase' }} />
                                        </Box>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                                            {item.count} ({item.percentage}%)
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={item.percentage}
                                        sx={{
                                            height: 6, borderRadius: 3,
                                            bgcolor: '#F3F4F6',
                                            '& .MuiLinearProgress-bar': { bgcolor: typeColors[idx % typeColors.length], borderRadius: 3 }
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Typography sx={{ color: '#9CA3AF', textAlign: 'center', py: 4 }}>No data</Typography>
                    )}
                </Paper>

                {/* Top Users */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB' }}>
                    <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', mb: 2 }}>
                        Top Users by Scan Count
                    </Typography>
                    {loading ? (
                        [1, 2, 3, 4, 5].map(i => <Skeleton key={i} height={40} sx={{ mb: 1 }} />)
                    ) : data?.topUsers?.length > 0 ? (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ '& th': { fontWeight: 600, color: '#6B7280', fontSize: '12px', borderBottom: '1px solid #E5E7EB' } }}>
                                        <TableCell>#</TableCell>
                                        <TableCell>User</TableCell>
                                        <TableCell align="right">Scans</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.topUsers.map((u, idx) => (
                                        <TableRow key={u.userId} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                                            <TableCell sx={{ width: 40 }}>
                                                <Chip label={idx + 1} size="small"
                                                    sx={{
                                                        bgcolor: idx < 3 ? '#FEF3C7' : '#F3F4F6',
                                                        color: idx < 3 ? '#D97706' : '#6B7280',
                                                        fontWeight: 700, fontSize: '11px', height: 22, minWidth: 22
                                                    }} />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 28, height: 28, bgcolor: '#6366F1', fontSize: '12px' }}>
                                                        {(u.user?.name || u.user?.email)?.[0]?.toUpperCase() || '?'}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>{u.user?.name || '-'}</Typography>
                                                        <Typography sx={{ fontSize: '11px', color: '#9CA3AF' }}>{u.user?.email || '-'}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#7C3AED' }}>
                                                    {u.scanCount}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography sx={{ color: '#9CA3AF', textAlign: 'center', py: 4 }}>No data</Typography>
                    )}
                </Paper>
            </Box>
        </Box>
    );
};

export default ScanStatistics;
