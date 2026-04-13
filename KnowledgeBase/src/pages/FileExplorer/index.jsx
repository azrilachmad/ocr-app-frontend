import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Chip, IconButton, TextField, InputAdornment,
    ToggleButton, ToggleButtonGroup, CircularProgress, Select, MenuItem,
    FormControl, InputLabel, Button, Tooltip
} from '@mui/material';
import {
    ArrowBack, Search as SearchIcon, GridView, ViewList,
    PictureAsPdf, TableChart, Description as DocIcon,
    Download as DownloadIcon, Folder as FolderIcon,
    InsertDriveFile as FileIcon, Person as PersonIcon
} from '@mui/icons-material';
import { getFiles, getCategories } from '../../services/api';

const FILE_ICONS = {
    pdf: <PictureAsPdf sx={{ fontSize: 32, color: '#EF4444' }} />,
    xlsx: <TableChart sx={{ fontSize: 32, color: '#10B981' }} />,
    xls: <TableChart sx={{ fontSize: 32, color: '#10B981' }} />,
    docx: <DocIcon sx={{ fontSize: 32, color: '#3B82F6' }} />,
    doc: <DocIcon sx={{ fontSize: 32, color: '#3B82F6' }} />,
    default: <FileIcon sx={{ fontSize: 32, color: '#6366F1' }} />
};

const FileExplorer = () => {
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    useEffect(() => {
        Promise.all([
            getFiles({ search: searchQuery || undefined, documentType: filterCategory || undefined }),
            getCategories()
        ])
            .then(([filesRes, catRes]) => {
                setFiles(filesRes.data?.data || []);
                setCategories(catRes.data?.data || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [searchQuery, filterType, filterCategory]);

    const handleDownload = (fileId, fileName) => {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
        window.open(`${baseUrl}/kb/files/${fileId}/download`, '_blank');
    };

    const getFileIcon = (type) => FILE_ICONS[type] || FILE_ICONS.default;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{
                px: 4, py: 2, bgcolor: 'white', borderBottom: '1px solid #E2E8F0',
                display: 'flex', alignItems: 'center', gap: 2
            }}>
                <IconButton onClick={() => navigate('/home')} size="small"><ArrowBack /></IconButton>
                <FolderIcon sx={{ color: '#6366F1' }} />
                <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#0F172A' }}>
                    File Directory
                </Typography>
            </Box>

            {/* Filters Bar */}
            <Box sx={{
                px: 4, py: 2, bgcolor: 'white', borderBottom: '1px solid #E2E8F0',
                display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap'
            }}>
                <TextField
                    placeholder="Cari file..." size="small" value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 20, color: '#94A3B8' }} /></InputAdornment>
                    }}
                    sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />

                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Tipe File</InputLabel>
                    <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="Tipe File" sx={{ borderRadius: 2 }}>
                        <MenuItem value="">Semua</MenuItem>
                        <MenuItem value="pdf">PDF</MenuItem>
                        <MenuItem value="xlsx">Excel</MenuItem>
                        <MenuItem value="docx">Word</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Tipe Dokumen</InputLabel>
                    <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} label="Tipe Dokumen" sx={{ borderRadius: 2 }}>
                        <MenuItem value="">Semua</MenuItem>
                        {categories.map(cat => (
                            <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box sx={{ ml: 'auto' }}>
                    <ToggleButtonGroup value={viewMode} exclusive onChange={(e, v) => v && setViewMode(v)} size="small">
                        <ToggleButton value="grid"><GridView sx={{ fontSize: 18 }} /></ToggleButton>
                        <ToggleButton value="list"><ViewList sx={{ fontSize: 18 }} /></ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Box>

            {/* Content */}
            <Box sx={{ maxWidth: 1200, mx: 'auto', px: 4, py: 4, boxSizing: 'border-box' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : files.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <FolderIcon sx={{ fontSize: 64, color: '#E2E8F0', mb: 2 }} />
                        <Typography sx={{ fontSize: '16px', color: '#94A3B8' }}>Tidak ada file ditemukan</Typography>
                    </Box>
                ) : viewMode === 'grid' ? (
                    /* Grid View */
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, width: '100%' }}>
                        {files.map(file => (
                            <Paper key={file.id} elevation={0} sx={{
                                p: 3, borderRadius: 2, border: '1px solid #E2E8F0', textAlign: 'center',
                                cursor: 'pointer', transition: 'all 0.2s', minWidth: 0, overflow: 'hidden',
                                '&:hover': { borderColor: '#6366F1', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transform: 'translateY(-2px)' }
                            }}
                                onClick={() => handleDownload(file.id, file.fileName)}
                            >
                                <Box sx={{ mb: 2 }}>{getFileIcon(file.fileType)}</Box>
                                <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#1F2937', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {file.fileName}
                                </Typography>
                                <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>
                                    {file.fileSize}
                                </Typography>
                                {file.category && (
                                    <Chip label={file.category.name} size="small" sx={{
                                        mt: 1, fontSize: '10px', height: 20, bgcolor: '#F1F5F9'
                                    }} />
                                )}
                                {file.uploadedBy && (
                                    <Typography sx={{ fontSize: '10px', color: '#B0B8C4', mt: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3 }}>
                                        <PersonIcon sx={{ fontSize: 12 }} /> {file.uploadedBy}
                                    </Typography>
                                )}
                            </Paper>
                        ))}
                    </Box>
                ) : (
                    /* List View */
                    <Paper elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                        {files.map((file, i) => (
                            <Box key={file.id} sx={{
                                display: 'flex', alignItems: 'center', gap: 2, px: 3, py: 2,
                                borderBottom: i < files.length - 1 ? '1px solid #F1F5F9' : 'none',
                                cursor: 'pointer', transition: 'bgcolor 0.2s',
                                '&:hover': { bgcolor: '#F8FAFC' }
                            }}
                                onClick={() => handleDownload(file.id, file.fileName)}
                            >
                                {getFileIcon(file.fileType)}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#1F2937' }} noWrap>
                                        {file.fileName}
                                    </Typography>
                                    {file.description && (
                                        <Typography sx={{ fontSize: '12px', color: '#94A3B8' }} noWrap>
                                            {file.description}
                                        </Typography>
                                    )}
                                </Box>
                                <Typography sx={{ fontSize: '12px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                                    {file.fileSize}
                                </Typography>
                                {file.category && (
                                    <Chip label={file.category.name} size="small" sx={{ fontSize: '11px', height: 22 }} />
                                )}
                                {file.uploadedBy && (
                                    <Tooltip title={`Diproses oleh ${file.uploadedBy}`} arrow>
                                        <Chip icon={<PersonIcon sx={{ fontSize: 14 }} />} label={file.uploadedBy} size="small" variant="outlined" sx={{ fontSize: '11px', height: 22, borderColor: '#E2E8F0' }} />
                                    </Tooltip>
                                )}
                                <IconButton size="small" sx={{ color: '#6366F1' }}>
                                    <DownloadIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Box>
                        ))}
                    </Paper>
                )}
            </Box>
        </Box>
    );
};

export default FileExplorer;
