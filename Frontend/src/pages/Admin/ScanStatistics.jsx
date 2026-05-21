import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// --- Extracted Chart Component ---
const DailyScanChart = ({ dailyScans, daysInRange, formatDate }) => {
    const containerRef = useRef(null);
    const [chartWidth, setChartWidth] = useState(0);
    const [hovered, setHovered] = useState(null); // index

    // Measure container width
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver(entries => {
            for (const e of entries) setChartWidth(e.contentRect.width);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // Fill missing days
    const rawScans = dailyScans || [];
    const scanMap = {};
    rawScans.forEach(d => { scanMap[d.date] = d; });

    const range = daysInRange || 30;
    const endD = new Date();
    const allDays = [];
    for (let i = range - 1; i >= 0; i--) {
        const d = new Date(endD);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const entry = scanMap[key] || { date: key, total: '0', saved: '0', verified: '0', failed: '0' };
        allDays.push({
            date: key,
            total: parseInt(entry.total),
            saved: parseInt(entry.saved || 0),
            verified: parseInt(entry.verified || 0),
            failed: parseInt(entry.failed || 0)
        });
    }

    const maxVal = Math.max(1, ...allDays.map(d => d.total));
    const chartH = 240;
    const padL = 40;
    const padR = 16;
    const padT = 20;
    const padB = 36;
    const plotW = Math.max(1, chartWidth - padL - padR);
    const plotH = chartH - padT - padB;
    const stepX = allDays.length > 1 ? plotW / (allDays.length - 1) : plotW;

    const getX = (i) => padL + i * stepX;
    const getY = (val) => padT + plotH - (val / maxVal) * plotH;

    // SVG paths
    const linePts = allDays.map((d, i) => `${getX(i)},${getY(d.total)}`).join(' ');
    const areaPath = allDays.length > 0
        ? `M${getX(0)},${padT + plotH} L${allDays.map((d, i) => `${getX(i)},${getY(d.total)}`).join(' L')} L${getX(allDays.length - 1)},${padT + plotH} Z`
        : '';

    const yTicks = [0, Math.round(maxVal / 2), maxVal];
    const labelEvery = Math.max(1, Math.floor(allDays.length / 10));

    if (allDays.length === 0) {
        return <Typography sx={{ color: '#9CA3AF', textAlign: 'center', py: 4 }}>No scan data for this period</Typography>;
    }

    return (
        <Box ref={containerRef} sx={{ width: '100%', position: 'relative' }}>
            {chartWidth > 0 && (
                <svg width={chartWidth} height={chartH} style={{ display: 'block' }}>
                    <defs>
                        <linearGradient id="scanAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366F1" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#6366F1" stopOpacity="0.01" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {yTicks.map(v => (
                        <g key={v}>
                            <line x1={padL} y1={getY(v)} x2={chartWidth - padR} y2={getY(v)} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 3" />
                            <text x={padL - 8} y={getY(v) + 4} textAnchor="end" fontSize="11" fill="#9CA3AF" fontFamily="sans-serif">{v}</text>
                        </g>
                    ))}

                    {/* Area fill */}
                    <path d={areaPath} fill="url(#scanAreaGrad)" />

                    {/* Line */}
                    <polyline points={linePts} fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

                    {/* Hover vertical line */}
                    {hovered !== null && (
                        <line x1={getX(hovered)} y1={padT} x2={getX(hovered)} y2={padT + plotH} stroke="#6366F1" strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />
                    )}

                    {/* Data points + hover zones */}
                    {allDays.map((d, i) => {
                        const x = getX(i);
                        const y = getY(d.total);
                        const isHovered = hovered === i;
                        return (
                            <g key={i}>
                                {/* Invisible hover zone */}
                                <rect
                                    x={x - stepX / 2} y={padT} width={stepX} height={plotH}
                                    fill="transparent" style={{ cursor: 'pointer' }}
                                    onMouseEnter={() => setHovered(i)}
                                    onMouseLeave={() => setHovered(null)}
                                />
                                {/* Dot */}
                                <circle cx={x} cy={y} r={isHovered ? 6 : d.total > 0 ? 4 : 2}
                                    fill={isHovered ? '#6366F1' : 'white'}
                                    stroke="#6366F1" strokeWidth="2"
                                    style={{ transition: 'r 0.15s, fill 0.15s' }}
                                />
                                {/* Value label on hover or when has data */}
                                {(isHovered || d.total > 0) && (
                                    <text x={x} y={y - 10} textAnchor="middle" fontSize="11" fontWeight="600" fill="#4F46E5" fontFamily="sans-serif">
                                        {d.total}
                                    </text>
                                )}
                                {/* X-axis labels */}
                                {i % labelEvery === 0 && (
                                    <text x={x} y={chartH - 8} textAnchor="middle" fontSize="10" fill="#9CA3AF" fontFamily="sans-serif">
                                        {formatDate(d.date)}
                                    </text>
                                )}
                            </g>
                        );
                    })}

                    {/* Stacked mini bars */}
                    {allDays.map((d, i) => {
                        if (d.total === 0) return null;
                        const bw = Math.max(4, Math.min(16, stepX * 0.5));
                        const bx = getX(i) - bw / 2;
                        const baseY = padT + plotH;
                        const unitH = plotH / maxVal;
                        return (
                            <g key={`bar-${i}`} opacity={hovered === i ? 0.9 : 0.5}>
                                {d.verified > 0 && <rect x={bx} y={baseY - d.verified * unitH} width={bw} height={d.verified * unitH} fill="#10B981" rx="2" />}
                                {d.saved > 0 && <rect x={bx} y={baseY - (d.verified + d.saved) * unitH} width={bw} height={d.saved * unitH} fill="#3B82F6" rx="2" />}
                                {d.failed > 0 && <rect x={bx} y={baseY - (d.verified + d.saved + d.failed) * unitH} width={bw} height={d.failed * unitH} fill="#EF4444" rx="2" />}
                            </g>
                        );
                    })}
                </svg>
            )}

            {/* Hover tooltip */}
            {hovered !== null && allDays[hovered] && (
                <Box sx={{
                    position: 'absolute',
                    top: 8,
                    left: Math.min(getX(hovered) - 60, chartWidth - 150),
                    bgcolor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    px: 1.5, py: 1,
                    zIndex: 10,
                    pointerEvents: 'none',
                    minWidth: 120
                }}>
                    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#374151', mb: 0.5 }}>
                        {formatDate(allDays[hovered].date)}
                    </Typography>
                    <Typography sx={{ fontSize: '11px', color: '#6366F1' }}>Total: <b>{allDays[hovered].total}</b></Typography>
                    {allDays[hovered].saved > 0 && <Typography sx={{ fontSize: '11px', color: '#3B82F6' }}>Saved: <b>{allDays[hovered].saved}</b></Typography>}
                    {allDays[hovered].verified > 0 && <Typography sx={{ fontSize: '11px', color: '#10B981' }}>Verified: <b>{allDays[hovered].verified}</b></Typography>}
                    {allDays[hovered].failed > 0 && <Typography sx={{ fontSize: '11px', color: '#EF4444' }}>Failed: <b>{allDays[hovered].failed}</b></Typography>}
                </Box>
            )}
        </Box>
    );
};

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


            {/* Daily Scan Trend (Area Chart) */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB', mb: 3 }}>
                <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ChartIcon sx={{ color: '#7C3AED' }} /> Daily Scan Trend
                </Typography>
                {loading ? (
                    <Skeleton variant="rounded" height={220} />
                ) : <DailyScanChart dailyScans={data?.dailyScans} daysInRange={data?.summary?.daysInRange} formatDate={formatDate} />}
                <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#6366F1' }} />
                        <Typography sx={{ fontSize: '11px', color: '#6B7280' }}>Total</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: '#10B981' }} />
                        <Typography sx={{ fontSize: '11px', color: '#6B7280' }}>Verified</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: '#3B82F6' }} />
                        <Typography sx={{ fontSize: '11px', color: '#6B7280' }}>Saved</Typography>
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
