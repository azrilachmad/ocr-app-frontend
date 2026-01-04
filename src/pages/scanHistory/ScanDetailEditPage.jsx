import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    TextField,
    Toolbar,
    IconButton,
    Snackbar,
    Alert,
    Chip,
    Divider,
    Paper,
    InputAdornment
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
    Edit as EditIcon,
    Cancel as CancelIcon,
    CheckCircle as CheckCircleIcon,
    Image as ImageIcon,
    Download as DownloadIcon,
    Print as PrintIcon,
    VerifiedUser as VerifiedIcon,
    Analytics as AnalyticsIcon,
    HealthAndSafety as HealthIcon,
    Rule as ValidationIcon,
    Refresh as RefreshIcon,
    Archive as ArchiveIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Notifications as NotificationsIcon,
    AccountCircle as AccountIcon,
    Info as InfoIcon
} from '@mui/icons-material';

const ScanDetailEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialMode = searchParams.get('mode') === 'edit' ? true : false;
    const [isEditing, setIsEditing] = useState(initialMode);

    // Mock Data
    const [formData, setFormData] = useState({
        fileName: 'KTP - Kartu Tanda Penduduk',
        type: 'KTP',
        scannedAt: 'Nov 14, 2025 • 09:04',
        status: 'completed',
        fileSize: '2.4 MB',
        format: 'JPEG',
        resolution: '1920x1080',
        uploaded: '2 hours ago',
        content: {
            nik: '3174012801950003',
            nama: 'BUDI SANTOSO',
            tempat_lahir: 'JAKARTA',
            tanggal_lahir: '28-01-1995',
            jenis_kelamin: 'LAKI-LAKI',
            golongan_darah: 'O',
            alamat: 'JL. SUDIRMAN NO. 123 RT 005 RW 012',
            kelurahan: 'MENTENG',
            kecamatan: 'MENTENG',
            agama: 'ISLAM',
            status_perkawinan: 'KAWIN',
            pekerjaan: 'KARYAWAN SWASTA',
            kewarganegaraan: 'WNI',
            berlaku_hingga: 'SEUMUR HIDUP'
        },
        timeline: [
            { label: 'Document Uploaded', time: '14 Nov 2025, 09:04', desc: 'File uploaded successfully - ktp_budi_santoso.jpg' },
            { label: 'AI Processing Started', time: '14 Nov 2025, 09:04', desc: 'Gemini AI initiated document analysis' },
            { label: 'Document Type Detected', time: '14 Nov 2025, 09:04', desc: 'Identified as KTP (Kartu Tanda Penduduk)' },
            { label: 'OCR Completed', time: '14 Nov 2025, 09:05', desc: 'All text fields extracted successfully' },
            { label: 'Document Saved', time: '14 Nov 2025, 09:05', desc: 'Document saved to database with ID: DOC-2025-001234' }
        ]
    });

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleBack = () => navigate('/history');
    const toggleEdit = () => setIsEditing(!isEditing);
    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
    const handleSave = () => {
        setSnackbar({ open: true, message: 'Changes saved successfully!', severity: 'success' });
        setIsEditing(false);
    };

    // Header Component
    const Header = () => (
        <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: 0, zIndex: 1100 }}>
            <Toolbar sx={{ minHeight: { xs: 64, md: 72 }, px: { xs: 2, md: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <IconButton onClick={handleBack} sx={{ color: '#4B5563' }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: '18px', color: '#111827', lineHeight: 1.2 }}>
                            Document Details
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>
                            {formData.fileName}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                        placeholder="Search documents..."
                        size="small"
                        sx={{ bgcolor: '#F3F4F6', borderRadius: 2, display: { xs: 'none', md: 'flex' }, width: 240, '& fieldset': { border: 'none' } }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9CA3AF', fontSize: 20 }} /></InputAdornment>
                        }}
                    />
                    <IconButton><NotificationsIcon sx={{ color: '#6B7280' }} /></IconButton>
                    <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AccountIcon sx={{ color: '#4F46E5' }} />
                    </Box>
                </Box>
            </Toolbar>
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB' }}>
            <Header />

            <Container maxWidth="xl" sx={{ py: 3 }}>

                {/* Info Banner */}
                <Box sx={{
                    bgcolor: '#EFF6FF',
                    borderRadius: 2,
                    p: 2,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderLeft: '4px solid #3B82F6'
                }}>
                    <InfoIcon sx={{ color: '#3B82F6' }} />
                    <Box>
                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1E3A8A' }}>
                            Document verified by Gemini AI
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#1E40AF' }}>
                            Confidence Score 98.5% • Processed on Nov 14, 2025
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* Left Column */}
                    <Grid item xs={12} md={3.5}>
                        {/* Preview Card */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB', overflow: 'hidden', mb: 3 }}>
                            <Box sx={{ bgcolor: '#7C3AED', py: 1.5, px: 2 }}>
                                <Typography sx={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>Document Preview</Typography>
                            </Box>
                            <CardContent sx={{ p: 2 }}>
                                <Box sx={{
                                    aspectRatio: '3/4',
                                    bgcolor: '#F3F4F6',
                                    borderRadius: 2,
                                    mb: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <ImageIcon sx={{ fontSize: 64, color: '#D1D5DB' }} />
                                </Box>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<DownloadIcon />}
                                    sx={{
                                        bgcolor: '#6366F1',
                                        textTransform: 'none',
                                        mb: 1.5,
                                        '&:hover': { bgcolor: '#4F46E5' }
                                    }}
                                >
                                    Download Original
                                </Button>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<PrintIcon />}
                                    sx={{
                                        textTransform: 'none',
                                        color: '#374151',
                                        borderColor: '#E5E7EB',
                                        bgcolor: '#F9FAFB'
                                    }}
                                >
                                    Print Document
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Document Info */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB' }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Typography sx={{ fontSize: '13px', fontWeight: 700, mb: 2, color: '#374151' }}>Document Info</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {[
                                        { label: 'File Size:', value: formData.fileSize },
                                        { label: 'Format:', value: formData.format },
                                        { label: 'Resolution:', value: formData.resolution },
                                        { label: 'Uploaded:', value: formData.uploaded }
                                    ].map((item, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>{item.label}</Typography>
                                            <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#111827' }}>{item.value}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Right Column */}
                    <Grid item xs={12} md={8.5}>
                        {/* Extracted Data */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB', mb: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Extracted Data</Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            size="small"
                                            startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                                            variant="outlined"
                                            onClick={toggleEdit}
                                            sx={{ textTransform: 'none', color: '#6B7280', borderColor: '#E5E7EB' }}
                                        >
                                            {isEditing ? 'Cancel Edit' : 'Edit'}
                                        </Button>
                                    </Box>
                                </Box>

                                <Grid container spacing={3}>
                                    {Object.entries(formData.content).map(([key, value]) => (
                                        <Grid item xs={12} sm={6} key={key}>
                                            <Typography sx={{ fontSize: '12px', color: '#4B5563', mb: 0.5 }}>
                                                {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                            </Typography>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                value={value}
                                                InputProps={{
                                                    readOnly: !isEditing,
                                                    endAdornment: key === 'nik' ? <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} /> : null,
                                                    sx: { fontSize: '13px', bgcolor: isEditing ? '#fff' : '#FAFAFA' }
                                                }}
                                                sx={{ '& fieldset': { borderColor: '#E5E7EB' } }}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* AI Analysis */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB', mb: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                    <AnalyticsIcon sx={{ color: '#6366F1' }} />
                                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>AI Analysis</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {[
                                        {
                                            icon: <VerifiedIcon sx={{ color: '#059669' }} />,
                                            title: 'Document Authenticity',
                                            desc: 'High confidence (98.5%) - Document appears to be authentic with no signs of tampering or forgery.',
                                            bg: '#ECFDF5',
                                            color: '#047857'
                                        },
                                        {
                                            icon: <ImageIcon sx={{ color: '#2563EB' }} />,
                                            title: 'Image Quality',
                                            desc: 'Excellent - Clear text, good lighting, minimal blur. All fields are readable.',
                                            bg: '#EFF6FF',
                                            color: '#1D4ED8'
                                        },
                                        {
                                            icon: <ValidationIcon sx={{ color: '#9333EA' }} />,
                                            title: 'Data Validation',
                                            desc: 'NIK format valid, date format correct, all mandatory fields present.',
                                            bg: '#FAF5FF',
                                            color: '#7E22CE'
                                        }
                                    ].map((item, idx) => (
                                        <Box key={idx} sx={{ bgcolor: item.bg, p: 2, borderRadius: 2, display: 'flex', gap: 2 }}>
                                            <Box sx={{ mt: 0.5 }}>{item.icon}</Box>
                                            <Box>
                                                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: item.color, mb: 0.5 }}>{item.title}</Typography>
                                                <Typography sx={{ fontSize: '12px', color: item.color }}>{item.desc}</Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Bottom Actions */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB' }}>
                            <CardContent sx={{ p: 2 }}>
                                <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#111827', mb: 2 }}>Actions</Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    {[
                                        { label: 'Re-scan', icon: <RefreshIcon />, color: '#4B5563' },
                                        { label: 'Archive', icon: <ArchiveIcon />, color: '#4B5563' },
                                        { label: 'Delete', icon: <DeleteIcon />, color: '#EF4444', isDelete: true }
                                    ].map((action, idx) => (
                                        <Button
                                            key={idx}
                                            fullWidth
                                            variant="outlined"
                                            startIcon={action.icon}
                                            sx={{
                                                textTransform: 'none',
                                                py: 1.5,
                                                color: action.color,
                                                borderColor: '#E5E7EB',
                                                bgcolor: action.isDelete ? '#FEF2F2' : 'white',
                                                borderColor: action.isDelete ? '#FCA5A5' : '#E5E7EB',
                                                '&:hover': {
                                                    bgcolor: action.isDelete ? '#FEE2E2' : '#F9FAFB'
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                                {action.label}
                                            </Box>
                                        </Button>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default ScanDetailEditPage;
