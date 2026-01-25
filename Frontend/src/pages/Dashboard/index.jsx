import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Toolbar,
  TextField,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Storage as StorageIcon,
  PermIdentity,
  Groups,
  TwoWheeler,
  CalendarMonth,
  Receipt as ReceiptIcon,
  CreditCard as CardIcon,
  Visibility as ViewIcon,
  Upload as UploadIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { getStatsOverview, getStatsChart, getStatsByType, getStatsRecent } from '../../services/apiService';

// Indonesian timezone helpers (WIB/UTC+7)
const getWIBDate = (date = new Date()) => {
  // Get current time in WIB
  const wibOffset = 7 * 60; // UTC+7 in minutes
  const utcDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
  return new Date(utcDate.getTime() + (wibOffset * 60000));
};

const formatDateWIB = (date) => {
  if (!date) return '';
  const d = getWIBDate(new Date(date));
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', timeZone: 'Asia/Jakarta' });
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

// Document type config
const documentTypeConfig = {
  'KTP': { icon: <PermIdentity />, color: '#3B82F6' },
  'KK': { icon: <Groups />, color: '#8B5CF6' },
  'STNK': { icon: <TwoWheeler />, color: '#22C55E' },
  'BPKB': { icon: <CardIcon />, color: '#F59E0B' },
  'Invoice': { icon: <ReceiptIcon />, color: '#EF4444' }
};

const getTypeConfig = (type) => {
  return documentTypeConfig[type] || { icon: <DescriptionIcon />, color: '#6B7280' };
};

const Dashboard = () => {
  const navigate = useNavigate();

  // Date range state - default 7 hari terakhir (WIB)
  const todayWIB = getWIBDate();
  const defaultStartDate = new Date(todayWIB);
  defaultStartDate.setDate(defaultStartDate.getDate() - 6);

  const [startDate, setStartDate] = useState(formatDateWIB(defaultStartDate));
  const [endDate, setEndDate] = useState(formatDateWIB(todayWIB));
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Data states
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Fetch all dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch chart data when date range changes
  useEffect(() => {
    fetchChartData();
  }, [startDate, endDate]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [overviewData, typeStats, recent] = await Promise.all([
        getStatsOverview(),
        getStatsByType(),
        getStatsRecent(5)
      ]);

      setOverview(overviewData || {});
      setTypeData(Array.isArray(typeStats) ? typeStats : []);
      setRecentScans(Array.isArray(recent) ? recent : []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setSnackbar({ open: true, message: 'Failed to load dashboard data', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const data = await getStatsChart(startDate, endDate);
      setChartData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    }
  };

  // Stats cards data
  const statsCards = useMemo(() => {
    if (!overview) return [];
    return [
      { title: 'Total Scans', value: overview.totalScans?.toLocaleString() || '0', icon: <DescriptionIcon />, color: '#2563EB' },
      { title: 'Successful', value: overview.successful?.toLocaleString() || '0', change: `${overview.successRate || 0}%`, icon: <CheckCircleIcon />, color: '#16A34A', positive: true },
      { title: 'Processing', value: overview.processing?.toString() || '0', badge: 'Pending', icon: <ScheduleIcon />, color: '#D97706', warning: true },
      { title: 'Saved Records', value: overview.savedCount?.toLocaleString() || '0', badge: 'Total', icon: <StorageIcon />, color: '#9333EA' },
    ];
  }, [overview]);

  // Process chart data for visualization
  const processedChartData = useMemo(() => {
    if (!Array.isArray(chartData) || chartData.length === 0) return [];
    return chartData.map(d => ({
      date: d.date,
      displayDate: formatDisplayDate(d.date),
      scans: parseInt(d.scans) || 0
    }));
  }, [chartData]);

  // Calculate chart total
  const rangeTotal = processedChartData.reduce((sum, d) => sum + d.scans, 0);

  // Generate SVG path untuk line chart
  const generateChartPath = () => {
    if (!Array.isArray(processedChartData) || processedChartData.length === 0) return { linePath: '', areaPath: '', points: [], maxScans: 0 };

    const maxScans = Math.max(...processedChartData.map(d => d.scans), 1);
    const chartHeight = 180;
    const chartWidth = 600;
    const padding = 20;

    const points = processedChartData.map((d, i) => {
      const x = padding + (i / (processedChartData.length - 1 || 1)) * (chartWidth - padding * 2);
      const y = chartHeight - padding - (d.scans / maxScans) * (chartHeight - padding * 2);
      return { x, y, scans: d.scans, date: d.displayDate };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    const areaPath = points.length > 0
      ? `${linePath} L ${points[points.length - 1].x},${chartHeight - padding} L ${points[0].x},${chartHeight - padding} Z`
      : '';

    return { linePath, areaPath, points, maxScans };
  };

  const { linePath, areaPath, points, maxScans } = generateChartPath();

  // Document type colors for donut chart
  const typeColors = ['#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4'];

  // Validate date range (max 1 month)
  const handleStartDateChange = (e) => {
    const newStart = e.target.value;
    const start = new Date(newStart);
    const end = new Date(endDate);
    const diffDays = (end - start) / (1000 * 60 * 60 * 24);

    if (diffDays <= 30 && diffDays >= 0) {
      setStartDate(newStart);
    }
  };

  const handleEndDateChange = (e) => {
    const newEnd = e.target.value;
    const start = new Date(startDate);
    const end = new Date(newEnd);
    const diffDays = (end - start) / (1000 * 60 * 60 * 24);

    if (diffDays <= 30 && diffDays >= 0) {
      setEndDate(newEnd);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB' }}>
      <Toolbar sx={{ minHeight: { xs: 56, sm: 89 } }} />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1,
                        bgcolor: `${stat.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: stat.color
                      }}
                    >
                      {stat.icon}
                    </Box>
                    {stat.change && (
                      <Chip
                        label={stat.change}
                        size="small"
                        sx={{
                          bgcolor: stat.positive ? '#DCFCE7' : '#FEF3C7',
                          color: stat.positive ? '#16A34A' : '#D97706',
                          fontWeight: 600,
                          fontSize: '12px'
                        }}
                      />
                    )}
                    {stat.badge && (
                      <Chip
                        label={stat.badge}
                        size="small"
                        sx={{
                          bgcolor: stat.warning ? '#FEF3C7' : '#F3F4F6',
                          color: stat.warning ? '#D97706' : '#4B5563',
                          fontWeight: 600,
                          fontSize: '12px'
                        }}
                      />
                    )}
                  </Box>
                  <Typography sx={{ color: '#6B7280', fontSize: '14px', fontWeight: 500, mb: 1 }}>
                    {stat.title}
                  </Typography>
                  <Typography sx={{ color: '#111827', fontSize: '30px', fontWeight: 700 }}>
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Scan Activity Chart */}
          <Grid item xs={12} md={8}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography sx={{ color: '#111827', fontSize: '20px', fontWeight: 700 }}>
                      Scan Activity
                    </Typography>
                    <Typography sx={{ color: '#6B7280', fontSize: '14px' }}>
                      {rangeTotal} scans in selected period
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarMonth sx={{ color: '#6B7280', fontSize: 20 }} />
                      <TextField
                        type="date"
                        size="small"
                        value={startDate}
                        onChange={handleStartDateChange}
                        sx={{
                          width: 150,
                          '& .MuiOutlinedInput-root': { fontSize: '13px' }
                        }}
                      />
                      <Typography sx={{ color: '#6B7280' }}>to</Typography>
                      <TextField
                        type="date"
                        size="small"
                        value={endDate}
                        onChange={handleEndDateChange}
                        sx={{
                          width: 150,
                          '& .MuiOutlinedInput-root': { fontSize: '13px' }
                        }}
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Line Chart */}
                <Box sx={{ height: 220, position: 'relative', overflow: 'hidden' }}>
                  {processedChartData.length === 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 2 }}>
                      <DescriptionIcon sx={{ fontSize: 48, color: '#D1D5DB' }} />
                      <Typography sx={{ color: '#6B7280' }}>No scan activity in this period</Typography>
                    </Box>
                  ) : (
                    <>
                      {/* Y-axis labels */}
                      <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        {[maxScans, Math.floor(maxScans * 0.75), Math.floor(maxScans * 0.5), Math.floor(maxScans * 0.25), 0].map((val, i) => (
                          <Typography key={i} sx={{ fontSize: '11px', color: '#9CA3AF', width: 30, textAlign: 'right' }}>
                            {val || 0}
                          </Typography>
                        ))}
                      </Box>

                      {/* Chart Area */}
                      <Box sx={{ ml: 5, height: '100%', position: 'relative' }}>
                        {/* Grid lines */}
                        <Box sx={{ position: 'absolute', top: 20, left: 0, right: 0, bottom: 20 }}>
                          {[0, 1, 2, 3, 4].map((i) => (
                            <Box key={i} sx={{ position: 'absolute', left: 0, right: 0, top: `${i * 25}%`, borderBottom: '1px dashed #E5E7EB' }} />
                          ))}
                        </Box>

                        {/* SVG Chart */}
                        <svg width="100%" height="200" viewBox="0 0 600 200" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0 }}>
                          <defs>
                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.05" />
                            </linearGradient>
                          </defs>
                          {areaPath && <path d={areaPath} fill="url(#areaGradient)" />}
                          {linePath && (
                            <path
                              d={linePath}
                              fill="none"
                              stroke="#6366F1"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          )}
                          {points.map((p, i) => (
                            <g key={i}>
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r="12"
                                fill="transparent"
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={() => setHoveredPoint({ ...p, index: i })}
                                onMouseLeave={() => setHoveredPoint(null)}
                              />
                              <circle
                                cx={p.x}
                                cy={p.y}
                                r={hoveredPoint?.index === i ? 6 : 4}
                                fill="#6366F1"
                                style={{ transition: 'r 0.15s ease' }}
                              />
                            </g>
                          ))}
                        </svg>

                        {/* Tooltip */}
                        {hoveredPoint && (() => {
                          // Calculate tooltip position with edge detection
                          const isNearTop = hoveredPoint.y < 60;
                          const isNearRight = hoveredPoint.x > 520;
                          const isNearLeft = hoveredPoint.x < 80;

                          // Horizontal positioning
                          let leftPos = `calc(${(hoveredPoint.x / 600) * 100}%)`;
                          let transformX = 'translateX(-50%)';

                          if (isNearRight) {
                            transformX = 'translateX(-90%)';
                          } else if (isNearLeft) {
                            transformX = 'translateX(-10%)';
                          }

                          // Vertical positioning - show below when near top
                          const topPos = isNearTop
                            ? `calc(${(hoveredPoint.y / 200) * 100}% + 20px)`
                            : `calc(${(hoveredPoint.y / 200) * 100}% - 65px)`;

                          return (
                            <Box
                              sx={{
                                position: 'absolute',
                                left: leftPos,
                                top: topPos,
                                transform: transformX,
                                bgcolor: '#1F2937',
                                color: 'white',
                                px: 1.5,
                                py: 1,
                                borderRadius: 1,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                zIndex: 100,
                                pointerEvents: 'none',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <Typography sx={{ fontSize: '13px', fontWeight: 600, mb: 0.25 }}>
                                {hoveredPoint.scans} scans
                              </Typography>
                              <Typography sx={{ fontSize: '11px', color: '#9CA3AF' }}>
                                {hoveredPoint.date}
                              </Typography>
                              {/* Arrow pointer */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  ...(isNearTop ? {
                                    top: -6,
                                    width: 0,
                                    height: 0,
                                    borderLeft: '6px solid transparent',
                                    borderRight: '6px solid transparent',
                                    borderBottom: '6px solid #1F2937'
                                  } : {
                                    bottom: -6,
                                    width: 0,
                                    height: 0,
                                    borderLeft: '6px solid transparent',
                                    borderRight: '6px solid transparent',
                                    borderTop: '6px solid #1F2937'
                                  })
                                }}
                              />
                            </Box>
                          );
                        })()}

                        {/* X-axis labels */}
                        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', px: 2 }}>
                          {processedChartData.filter((_, i) => i % Math.ceil(processedChartData.length / 7) === 0 || i === processedChartData.length - 1).map((d, i) => (
                            <Typography key={i} sx={{ fontSize: '11px', color: '#9CA3AF' }}>{d.displayDate}</Typography>
                          ))}
                        </Box>
                      </Box>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Document Types Donut Chart */}
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography sx={{ color: '#111827', fontSize: '20px', fontWeight: 700, mb: 3 }}>
                  Document Types
                </Typography>

                {typeData.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, flexDirection: 'column', gap: 2 }}>
                    <DescriptionIcon sx={{ fontSize: 48, color: '#D1D5DB' }} />
                    <Typography sx={{ color: '#6B7280' }}>No documents yet</Typography>
                  </Box>
                ) : (
                  <>
                    {/* Donut Chart */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                      <Box sx={{ position: 'relative', width: 160, height: 160 }}>
                        <svg width="160" height="160" viewBox="0 0 160 160">
                          {typeData.map((item, index) => {
                            const circumference = 2 * Math.PI * 55;
                            const percentage = parseFloat(item.percentage) / 100;
                            const strokeDasharray = `${circumference * percentage} ${circumference * (1 - percentage)}`;
                            const previousPercentages = typeData.slice(0, index).reduce((sum, d) => sum + parseFloat(d.percentage) / 100, 0);
                            const strokeDashoffset = -circumference * previousPercentages;

                            return (
                              <circle
                                key={item.type}
                                cx="80" cy="80" r="55"
                                fill="none"
                                stroke={typeColors[index % typeColors.length]}
                                strokeWidth="20"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                transform="rotate(-90 80 80)"
                              />
                            );
                          })}
                        </svg>
                        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                          <Typography sx={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>
                            {typeData.reduce((sum, t) => sum + t.count, 0).toLocaleString()}
                          </Typography>
                          <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>Total</Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Legend */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      {typeData.map((item, index) => (
                        <Box key={item.type} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: typeColors[index % typeColors.length] }} />
                          <Typography sx={{ fontSize: '13px', color: '#374151' }}>{item.type}</Typography>
                          <Typography sx={{ fontSize: '13px', color: '#6B7280', ml: 'auto' }}>{item.percentage}%</Typography>
                        </Box>
                      ))}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Scans Table */}
          <Grid item xs={12}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#111827', mb: 0.5 }}>
                    Recent Scans
                  </Typography>
                  <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
                    Latest OCR processing results
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => navigate('/upload')}
                  sx={{ textTransform: 'none', borderColor: '#E5E7EB', color: '#374151' }}
                >
                  New Scan
                </Button>
              </Box>

              {recentScans.length === 0 ? (
                <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <DescriptionIcon sx={{ fontSize: 64, color: '#D1D5DB' }} />
                  <Typography sx={{ color: '#6B7280', fontSize: '16px' }}>No scans yet</Typography>
                  <Button
                    variant="contained"
                    startIcon={<UploadIcon />}
                    onClick={() => navigate('/upload')}
                    sx={{ mt: 1, bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' }, textTransform: 'none' }}
                  >
                    Start Scanning
                  </Button>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Document</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Scanned</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {recentScans.map((scan) => {
                        const typeConfig = getTypeConfig(scan.documentType);
                        const statusColors = {
                          completed: { bg: '#DCFCE7', color: '#16A34A' },
                          processing: { bg: '#FEF3C7', color: '#D97706' },
                          failed: { bg: '#FEE2E2', color: '#DC2626' }
                        };
                        const statusStyle = statusColors[scan.status] || statusColors.processing;

                        return (
                          <TableRow key={scan.id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/history/${scan.id}`)}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: `${typeConfig.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: typeConfig.color }}>
                                  {typeConfig.icon}
                                </Box>
                                <Box>
                                  <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                                    {scan.fileName || 'Untitled'}
                                  </Typography>
                                  <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>
                                    {scan.fileSize || '-'}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={scan.documentType || 'Unknown'}
                                size="small"
                                sx={{ bgcolor: `${typeConfig.color}15`, color: typeConfig.color, fontWeight: 500 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={scan.status === 'completed' ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : scan.status === 'failed' ? <ErrorIcon sx={{ fontSize: 14 }} /> : <ScheduleIcon sx={{ fontSize: 14 }} />}
                                label={scan.status?.charAt(0).toUpperCase() + scan.status?.slice(1)}
                                size="small"
                                sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 500 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontSize: '14px', color: '#111827' }}>
                                {formatRelativeTime(scan.scannedAt || scan.createdAt)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/history/${scan.id}`);
                                }}
                                sx={{ color: '#6B7280' }}
                              >
                                <ViewIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box >
  );
};

export default Dashboard;
