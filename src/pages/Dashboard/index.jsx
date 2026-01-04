import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Button,
  Toolbar,
  TextField
} from '@mui/material';
import {
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Storage as StorageIcon,
  PermIdentity,
  Groups,
  TwoWheeler,
  Visibility,
  Save,
  Download,
  FilterList,
  CalendarMonth
} from '@mui/icons-material';

// Helper untuk format tanggal
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Generate dummy scan activity data (30 hari terakhir)
const generateDummyScanData = () => {
  const data = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: formatDate(date),
      displayDate: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
      scans: Math.floor(Math.random() * 50) + 10, // Random 10-60 scans per hari
    });
  }
  return data;
};

const allScanData = generateDummyScanData();

// Dummy data untuk stats cards (dihitung dari scan data)
const totalScans = allScanData.reduce((sum, d) => sum + d.scans, 0);
const successRate = 0.95;
const successfulScans = Math.floor(totalScans * successRate);
const processingScans = Math.floor(Math.random() * 20) + 5;
const savedRecords = Math.floor(totalScans * 0.85);

// Document type distribution
const documentTypeData = [
  { name: 'KTP', count: Math.floor(totalScans * 0.30), color: '#3B82F6', percentage: '30%' },
  { name: 'STNK', count: Math.floor(totalScans * 0.25), color: '#22C55E', percentage: '25%' },
  { name: 'BPKB', count: Math.floor(totalScans * 0.20), color: '#F59E0B', percentage: '20%' },
  { name: 'KK', count: Math.floor(totalScans * 0.25), color: '#8B5CF6', percentage: '25%' },
];

// Recent scans dummy data
const recentScansData = [
  { doc: 'KTP_20260104_001', type: 'KTP', status: 'Completed', confidence: 98, time: '2 mins ago', user: 'John Anderson', size: '3.2 MB', typeColor: '#3B82F6', statusColor: '#16A34A' },
  { doc: 'KK_20260104_002', type: 'KK', status: 'Processing', confidence: 45, time: '5 mins ago', user: 'John Anderson', size: '4.1 MB', typeColor: '#8B5CF6', statusColor: '#D97706' },
  { doc: 'STNK_20260104_003', type: 'STNK', status: 'Completed', confidence: 96, time: '12 mins ago', user: 'John Anderson', size: '2.8 MB', typeColor: '#22C55E', statusColor: '#16A34A' },
  { doc: 'BPKB_20260104_004', type: 'BPKB', status: 'Completed', confidence: 94, time: '25 mins ago', user: 'John Anderson', size: '5.2 MB', typeColor: '#F59E0B', statusColor: '#16A34A' },
  { doc: 'KTP_20260104_005', type: 'KTP', status: 'Failed', confidence: 32, time: '1 hour ago', user: 'John Anderson', size: '1.8 MB', typeColor: '#3B82F6', statusColor: '#DC2626' },
];

const Dashboard = () => {
  // Date range state - default 7 hari terakhir
  const today = new Date();
  const defaultStartDate = new Date(today);
  defaultStartDate.setDate(defaultStartDate.getDate() - 6);

  const [startDate, setStartDate] = useState(formatDate(defaultStartDate));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Filter scan data berdasarkan date range
  const filteredScanData = useMemo(() => {
    return allScanData.filter(d => d.date >= startDate && d.date <= endDate);
  }, [startDate, endDate]);

  // Hitung total scans dalam range
  const rangeTotal = filteredScanData.reduce((sum, d) => sum + d.scans, 0);

  // Stats cards data
  const statsCards = [
    { title: 'Total Scans', value: totalScans.toLocaleString(), change: '+12%', icon: <DescriptionIcon />, color: '#2563EB', positive: true },
    { title: 'Successful', value: successfulScans.toLocaleString(), change: '+8%', icon: <CheckCircleIcon />, color: '#16A34A', positive: true },
    { title: 'Processing', value: processingScans.toString(), badge: 'Pending', icon: <ScheduleIcon />, color: '#D97706', warning: true },
    { title: 'Saved Records', value: savedRecords.toLocaleString(), badge: 'Total', icon: <StorageIcon />, color: '#9333EA' },
  ];

  // Generate SVG path untuk line chart
  const generateChartPath = () => {
    if (filteredScanData.length === 0) return { linePath: '', areaPath: '', points: [] };

    const maxScans = Math.max(...filteredScanData.map(d => d.scans));
    const chartHeight = 180;
    const chartWidth = 600;
    const padding = 20;

    const points = filteredScanData.map((d, i) => {
      const x = padding + (i / (filteredScanData.length - 1 || 1)) * (chartWidth - padding * 2);
      const y = chartHeight - padding - (d.scans / maxScans) * (chartHeight - padding * 2);
      return { x, y, scans: d.scans, date: d.displayDate };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x},${chartHeight - padding} L ${points[0].x},${chartHeight - padding} Z`;

    return { linePath, areaPath, points, maxScans };
  };

  const { linePath, areaPath, points, maxScans } = generateChartPath();

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
                          {/* Invisible larger circle for easier hover */}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="12"
                            fill="transparent"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredPoint({ ...p, index: i })}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                          {/* Visible circle */}
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
                      const isNearTop = hoveredPoint.y < 60;
                      const isNearRight = hoveredPoint.x > 520;
                      const isNearLeft = hoveredPoint.x < 80;

                      // Calculate horizontal position
                      let leftPos = `calc(${(hoveredPoint.x / 600) * 100}% + 40px)`;
                      let transformX = 'translateX(-50%)';
                      let arrowLeft = '50%';
                      let arrowTransform = 'translateX(-50%)';

                      if (isNearRight) {
                        leftPos = `calc(${(hoveredPoint.x / 600) * 100}% + 20px)`;
                        transformX = 'translateX(-90%)';
                        arrowLeft = '85%';
                        arrowTransform = 'translateX(-50%)';
                      } else if (isNearLeft) {
                        leftPos = `calc(${(hoveredPoint.x / 600) * 100}% + 60px)`;
                        transformX = 'translateX(-10%)';
                        arrowLeft = '15%';
                        arrowTransform = 'translateX(-50%)';
                      }

                      return (
                        <Box
                          sx={{
                            position: 'absolute',
                            left: leftPos,
                            top: isNearTop
                              ? `calc(${(hoveredPoint.y / 200) * 100}% + 20px)`
                              : `calc(${(hoveredPoint.y / 200) * 100}% - 60px)`,
                            transform: transformX,
                            bgcolor: '#1F2937',
                            color: 'white',
                            px: 1.5,
                            py: 1,
                            borderRadius: 1,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            zIndex: 10,
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
                          {/* Arrow */}
                          <Box
                            sx={{
                              position: 'absolute',
                              ...(isNearTop ? {
                                top: -6,
                                borderBottom: '6px solid #1F2937',
                                borderTop: 'none'
                              } : {
                                bottom: -6,
                                borderTop: '6px solid #1F2937',
                                borderBottom: 'none'
                              }),
                              left: arrowLeft,
                              transform: arrowTransform,
                              width: 0,
                              height: 0,
                              borderLeft: '6px solid transparent',
                              borderRight: '6px solid transparent',
                            }}
                          />
                        </Box>
                      );
                    })()}

                    {/* X-axis labels */}
                    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', px: 2 }}>
                      {filteredScanData.filter((_, i) => i % Math.ceil(filteredScanData.length / 7) === 0 || i === filteredScanData.length - 1).map((d, i) => (
                        <Typography key={i} sx={{ fontSize: '11px', color: '#9CA3AF' }}>{d.displayDate}</Typography>
                      ))}
                    </Box>
                  </Box>
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

                {/* Donut Chart */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Box sx={{ position: 'relative', width: 160, height: 160 }}>
                    <svg width="160" height="160" viewBox="0 0 160 160">
                      {documentTypeData.map((item, index) => {
                        const circumference = 2 * Math.PI * 55;
                        const percentage = parseInt(item.percentage) / 100;
                        const strokeDasharray = `${circumference * percentage} ${circumference * (1 - percentage)}`;
                        const previousPercentages = documentTypeData.slice(0, index).reduce((sum, d) => sum + parseInt(d.percentage) / 100, 0);
                        const strokeDashoffset = -circumference * previousPercentages;

                        return (
                          <circle
                            key={item.name}
                            cx="80" cy="80" r="55"
                            fill="none"
                            stroke={item.color}
                            strokeWidth="20"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90 80 80)"
                          />
                        );
                      })}
                    </svg>
                    <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>{totalScans.toLocaleString()}</Typography>
                      <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>Total</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Legend */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  {documentTypeData.map((item) => (
                    <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                      <Typography sx={{ fontSize: '13px', color: '#374151' }}>{item.name}</Typography>
                      <Typography sx={{ fontSize: '13px', color: '#6B7280', ml: 'auto' }}>{item.percentage}</Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Scans Table */}
          <Grid item xs={12}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #E5E7EB' }}>
                <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#111827', mb: 0.5 }}>
                  Recent Scans
                </Typography>
                <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
                  Latest OCR processing results
                </Typography>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#FAFAFA' }}>
                      <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Document</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, fontSize: '12px', color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Scanned</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentScansData.map((scan, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: `${scan.typeColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {scan.type === 'KTP' && <PermIdentity sx={{ color: scan.typeColor, fontSize: 20 }} />}
                              {scan.type === 'KK' && <Groups sx={{ color: scan.typeColor, fontSize: 20 }} />}
                              {scan.type === 'STNK' && <TwoWheeler sx={{ color: scan.typeColor, fontSize: 20 }} />}
                              {scan.type === 'BPKB' && <DescriptionIcon sx={{ color: scan.typeColor, fontSize: 20 }} />}
                            </Box>
                            <Box>
                              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{scan.doc}</Typography>
                              <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>{scan.size}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={scan.type}
                            size="small"
                            sx={{ bgcolor: `${scan.typeColor}15`, color: scan.typeColor, fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={scan.status === 'Completed' ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : scan.status === 'Processing' ? <ScheduleIcon sx={{ fontSize: 14 }} /> : undefined}
                            label={scan.status}
                            size="small"
                            sx={{ bgcolor: `${scan.statusColor}15`, color: scan.statusColor, fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '14px', color: '#111827' }}>{scan.time}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
