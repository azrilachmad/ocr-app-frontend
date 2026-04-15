// src/pages/documentUpload/index.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
    Container, Typography, Box, Card, CardContent, Button,
    Select, MenuItem, FormControl, IconButton,
    Grid, TextField, CircularProgress, Chip, LinearProgress,
    Fade, Paper, Snackbar, Alert, Toolbar,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
    Collapse, Divider, RadioGroup, Radio, FormControlLabel, FormLabel
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    AutoAwesome as AutoAwesomeIcon,
    CheckCircle as CheckCircleIcon,
    Schedule as ScheduleIcon,
    Image as ImageIcon,
    Save as SaveIcon,
    Refresh as RefreshIcon,
    Info as InfoIcon,
    Warning as WarningIcon,
    Error as ErrorIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    PlaylistAddCheck as SaveAllIcon,
    Close as CloseIcon,
    PictureAsPdf as PdfIcon,
    Description as DocIcon,
    TableChart as XlsIcon,
    InsertDriveFile as GenericFileIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { processDocuments, submitProcessedData, getSettings, rescanDocument, getDocumentById, getDocumentFileUrl, getDocumentTypes } from '../../services/apiService';

// --- Helper Components ---

const getFileIcon = (fileName, sxProps = {}) => {
    const ext = fileName?.split('.').pop().toLowerCase() || '';
    if (['pdf'].includes(ext)) return <PdfIcon sx={{ color: '#EF4444', ...sxProps }} />;
    if (['doc', 'docx'].includes(ext)) return <DocIcon sx={{ color: '#2563EB', ...sxProps }} />;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return <XlsIcon sx={{ color: '#10B981', ...sxProps }} />;
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return <ImageIcon sx={{ color: '#8B5CF6', ...sxProps }} />;
    return <GenericFileIcon sx={{ color: '#6B7280', ...sxProps }} />;
};

// File status badge
const FileStatusBadge = ({ status }) => {
    const config = {
        pending: { color: '#9CA3AF', bgColor: '#F3F4F6', label: 'Pending', icon: <ScheduleIcon sx={{ fontSize: 14 }} /> },
        processing: { color: '#3B82F6', bgColor: '#EFF6FF', label: 'Processing', icon: <CircularProgress size={12} thickness={5} /> },
        completed: { color: '#10B981', bgColor: '#ECFDF5', label: 'Completed', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
        failed: { color: '#EF4444', bgColor: '#FEF2F2', label: 'Failed', icon: <ErrorIcon sx={{ fontSize: 14 }} /> }
    };
    const { color, bgColor, label, icon } = config[status] || config.pending;

    return (
        <Chip
            size="small"
            icon={icon}
            label={label}
            sx={{
                bgcolor: bgColor,
                color: color,
                fontWeight: 600,
                fontSize: '11px',
                height: 24,
                '& .MuiChip-icon': { color: color }
            }}
        />
    );
};

// Individual file result card
const FileResultCard = ({
    fileResult,
    index,
    onSave,
    onRemove,
    onContentChange,
    isSaving,
    isExpanded,
    onToggleExpand,
    expectedType
}) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isImage, setIsImage] = useState(false);
    const [isPdf, setIsPdf] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);

    useEffect(() => {
        if (fileResult.file) {
            const ext = fileResult.file.name?.split('.').pop().toLowerCase() || '';
            const imageExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
            setIsImage(imageExts.includes(ext));
            setIsPdf(ext === 'pdf');

            const url = URL.createObjectURL(fileResult.file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [fileResult.file]);

    const formatLabel = (key) => {
        return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    // Parse content if it's a string
    const getContent = () => {
        let content = fileResult.result?.content || {};
        if (typeof content === 'string') {
            try {
                content = JSON.parse(content);
            } catch (e) {
                content = { raw: content };
            }
        }
        return content;
    };

    const content = getContent();

    return (
        <Card
            elevation={0}
            sx={{
                border: '1px solid #E5E7EB',
                borderRadius: 3,
                mb: 2,
                overflow: 'hidden'
            }}
        >
            {/* Header - Always visible */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    bgcolor: fileResult.status === 'completed' ? '#F0FDF4' :
                        fileResult.status === 'failed' ? '#FEF2F2' : '#F9FAFB',
                    cursor: 'pointer'
                }}
                onClick={onToggleExpand}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        width: 40, height: 40, borderRadius: 2, bgcolor: '#F3F4F6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden'
                    }}>
                        {previewUrl && isImage ? (
                            <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            getFileIcon(fileResult.fileName, { fontSize: 24 })
                        )}
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                            {fileResult.fileName}
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>
                            {fileResult.result?.documentType || 'Processing...'} • {fileResult.fileSize}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FileStatusBadge status={fileResult.status} />
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Box>
            </Box>

            {/* Expandable Content */}
            <Collapse in={isExpanded}>
                <Divider />
                <CardContent sx={{ p: 3 }}>
                    {fileResult.status === 'processing' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                            <CircularProgress size={32} sx={{ color: '#6366F1', mb: 2 }} />
                            <Typography sx={{ color: '#6B7280', fontSize: '14px' }}>
                                Processing with AI...
                            </Typography>
                        </Box>
                    )}

                    {fileResult.status === 'failed' && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                            <ErrorIcon sx={{ fontSize: 48, color: '#EF4444', mb: 2 }} />
                            <Typography sx={{ color: '#EF4444', fontSize: '14px', fontWeight: 600 }}>
                                Processing Failed
                            </Typography>
                            <Typography sx={{ color: '#6B7280', fontSize: '13px', mt: 1 }}>
                                {fileResult.error || 'Unknown error occurred'}
                            </Typography>
                        </Box>
                    )}

                    {fileResult.status === 'completed' && (
                        <Grid container spacing={3}>
                            {/* Preview Column */}
                            <Grid item xs={12} md={4}>
                                <Box sx={{
                                    bgcolor: '#F3F4F6',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: 200,
                                    borderBottomLeftRadius: 0,
                                    borderBottomRightRadius: 0
                                }}>
                                    {previewUrl && isImage ? (
                                        <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }} />
                                    ) : previewUrl && isPdf ? (
                                        <Box sx={{ p: 5, textAlign: 'center', color: '#6B7280' }}>
                                            <PdfIcon sx={{ fontSize: 64, color: '#EF4444', mb: 1 }} />
                                            <Typography>PDF Document</Typography>
                                        </Box>
                                    ) : (
                                        getFileIcon(fileResult.fileName, { fontSize: 64 })
                                    )}
                                </Box>
                                <Box sx={{
                                    display: 'flex',
                                    bgcolor: '#E5E7EB',
                                    borderBottomLeftRadius: 8,
                                    borderBottomRightRadius: 8,
                                    overflow: 'hidden'
                                }}>
                                    <Button
                                        fullWidth
                                        variant="text"
                                        onClick={() => {
                                            if (!previewUrl) return;
                                            if (isImage) setPreviewOpen(true);
                                            else window.open(previewUrl, '_blank');
                                        }}
                                        sx={{
                                            borderRadius: 0,
                                            color: '#374151',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            borderRight: '1px solid #D1D5DB',
                                            py: 1.5,
                                            '&:hover': { bgcolor: '#D1D5DB' }
                                        }}
                                    >
                                        Preview
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="text"
                                        component="a"
                                        href={previewUrl}
                                        download={fileResult.fileName}
                                        sx={{
                                            borderRadius: 0,
                                            color: '#6366F1',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            py: 1.5,
                                            '&:hover': { bgcolor: '#D1D5DB' }
                                        }}
                                    >
                                        Download
                                    </Button>
                                </Box>
                                <Box sx={{ mt: 2, p: 2, bgcolor: '#F9FAFB', borderRadius: 2 }}>
                                    <Typography sx={{ fontSize: '12px', color: '#6B7280', mb: 1 }}>Document Info</Typography>
                                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                                        Type: {fileResult.result?.documentType || 'Unknown'}
                                    </Typography>
                                    <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>
                                        Confidence: {fileResult.result?.confidenceScore || 95}%
                                    </Typography>
                                </Box>
                                {/* Type Mismatch Warning */}
                                {expectedType && expectedType !== 'auto' && fileResult.result?.documentType &&
                                    fileResult.result.documentType.toLowerCase() !== expectedType.toLowerCase() && (
                                        <Box sx={{
                                            mt: 2, p: 2, bgcolor: '#FEF3C7', borderRadius: 2,
                                            display: 'flex', alignItems: 'flex-start', gap: 1
                                        }}>
                                            <WarningIcon sx={{ fontSize: 18, color: '#D97706', mt: 0.25 }} />
                                            <Box>
                                                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#92400E' }}>
                                                    Type Mismatch
                                                </Typography>
                                                <Typography sx={{ fontSize: '11px', color: '#92400E' }}>
                                                    Expected "{expectedType}" but detected "{fileResult.result.documentType}".
                                                    Please verify the document.
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                            </Grid>

                            {/* Form Fields Column */}
                            <Grid item xs={12} md={8}>
                                <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 2, color: '#374151' }}>
                                    Extracted Data
                                </Typography>
                                <Grid container spacing={2}>
                                    {Object.entries(content).map(([key, value]) => {
                                        const isObject = typeof value === 'object' && value !== null;
                                        const displayValue = isObject ? JSON.stringify(value, null, 2) : (value || '');
                                        // Force multiline if it's the new Summary field or just naturally long
                                        const isLongText = isObject || String(displayValue).length > 60 || key === 'Summary';

                                        return (
                                            <Grid item xs={12} sm={isLongText ? 12 : 6} key={key}>
                                                <TextField
                                                    fullWidth
                                                    label={formatLabel(key)}
                                                    value={displayValue}
                                                    onChange={(e) => {
                                                        let newValue = e.target.value;
                                                        if (isObject) {
                                                            try { newValue = JSON.parse(newValue); } catch (err) { }
                                                        }
                                                        onContentChange(index, key, newValue);
                                                    }}
                                                    size="small"
                                                    multiline={isLongText}
                                                    minRows={isLongText ? 4 : 1}
                                                    maxRows={isLongText ? 15 : undefined}
                                                    InputProps={{
                                                        sx: { borderRadius: 2, fontSize: '13px' }
                                                    }}
                                                    InputLabelProps={{
                                                        sx: { fontSize: '13px' }
                                                    }}
                                                />
                                            </Grid>
                                        );
                                    })}
                                </Grid>

                                {/* Actions */}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => onRemove(index)}
                                        sx={{
                                            textTransform: 'none',
                                            color: '#EF4444',
                                            borderColor: '#FCA5A5',
                                            '&:hover': { bgcolor: '#FEF2F2', borderColor: '#EF4444' }
                                        }}
                                    >
                                        Remove
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
                                        onClick={() => onSave(index)}
                                        disabled={isSaving}
                                        sx={{
                                            textTransform: 'none',
                                            bgcolor: '#6366F1',
                                            '&:hover': { bgcolor: '#4F46E5' }
                                        }}
                                    >
                                        {isSaving ? 'Saving...' : 'Save This'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    )}
                </CardContent>
            </Collapse>

            {/* Image Preview Dialog */}
            <Dialog
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                maxWidth="lg" fullWidth
                PaperProps={{ sx: { bgcolor: 'rgba(0,0,0,0.95)', boxShadow: 'none', borderRadius: 2, maxHeight: '95vh' } }}
            >
                <DialogTitle sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontWeight: 600 }}>{fileResult.fileName}</Typography>
                    <IconButton onClick={() => setPreviewOpen(false)} sx={{ color: 'white' }} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                    {previewUrl && (
                        <img src={previewUrl} alt="Document full preview" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8 }} />
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
};

// Upload Phase Component
const UploadPhase = ({
    documentType, setDocumentType, selectedFiles, handleFileChange,
    handleRemoveFile, handleProcess, isProcessing
}) => {
    const fileInputRef = useRef();
    const [availableTemplates, setAvailableTemplates] = useState([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

    // Fetch document templates on component mount
    const [processMode, setProcessMode] = useState('template'); // 'template' or 'insight'
    useEffect(() => {
        const fetchTemplates = async () => {
            setIsLoadingTemplates(true);
            try {
                const templatesData = await getDocumentTypes();
                // Filter only active templates
                const activeTemplates = templatesData.filter(t => t.active !== false);
                setAvailableTemplates(activeTemplates);
            } catch (error) {
                console.error("Failed to fetch document templates:", error);
            } finally {
                setIsLoadingTemplates(false);
            }
        };

        fetchTemplates();
    }, []);

    // Auto-force Auto Detect when multiple files are selected
    const isMultipleFiles = selectedFiles.length > 1;
    const effectiveDocumentType = (isMultipleFiles || processMode === 'insight') ? 'auto' : documentType;
    const isTypeDisabled = selectedFiles.length === 0 || isMultipleFiles || processMode === 'insight';

    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Only set false if we're leaving the drop zone (not entering a child)
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        // Filter only allowed types
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        const validFiles = droppedFiles.filter(f => allowedTypes.includes(f.type));

        if (validFiles.length === 0) {
            return; // silently ignore invalid files
        }

        // Simulate file input change
        const fakeEvent = { target: { files: validFiles } };
        handleFileChange(fakeEvent);
    };

    return (
        <Fade in timeout={500}>
            <Box sx={{ mt: 12 }}>
                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 3 }}>
                    <CardContent sx={{ p: 4 }}>
                        {/* Upload Instructions - First */}
                        <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 1.5, color: '#374151' }}>
                            Upload Instructions
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 4 }}>
                            {[
                                'Ensure the document is clear and all corners are visible',
                                'Supported formats: JPG, PNG, PDF',
                                'Maximum file size: 50 MB per file',
                                'You can upload multiple files at once',
                                'Drag & drop files directly into the upload area'
                            ].map((text, i) => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} />
                                    <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>{text}</Typography>
                                </Box>
                            ))}
                        </Box>

                        {/* Upload Area with Drag & Drop */}
                        <Box
                            sx={{
                                border: isDragging ? '2px dashed #6366F1' : '2px dashed #E5E7EB',
                                borderRadius: 3,
                                bgcolor: isDragging ? '#EEF2FF' : '#F9FAFB',
                                minHeight: 200,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                transform: isDragging ? 'scale(1.01)' : 'scale(1)',
                                boxShadow: isDragging ? '0 0 0 4px rgba(99, 102, 241, 0.1)' : 'none',
                                '&:hover': {
                                    borderColor: '#6366F1',
                                    bgcolor: '#EEF2FF'
                                }
                            }}
                            onClick={() => fileInputRef.current.click()}
                            onDragOver={handleDragOver}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                hidden
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*,application/pdf"
                                multiple
                            />
                            <Box sx={{
                                width: 64, height: 64, borderRadius: '50%',
                                bgcolor: isDragging ? '#4F46E5' : '#6366F1',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,
                                boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)',
                                transition: 'all 0.2s'
                            }}>
                                <CloudUploadIcon sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Typography sx={{ fontSize: '16px', fontWeight: 600, color: isDragging ? '#4F46E5' : '#374151', mb: 0.5 }}>
                                {isDragging ? 'Release to upload files' : 'Drop your documents here or click to browse'}
                            </Typography>
                            <Typography sx={{ fontSize: '13px', color: '#9CA3AF' }}>
                                JPG, PNG, PDF | up to 50 MB each | Multiple files supported
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                    <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 3 }}>
                        <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                                    Selected Files ({selectedFiles.length})
                                </Typography>
                                <Button
                                    size="small"
                                    onClick={() => handleRemoveFile(-1)}
                                    sx={{ textTransform: 'none', color: '#EF4444' }}
                                >
                                    Clear All
                                </Button>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {selectedFiles.map((file, index) => (
                                    <Box key={index} sx={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        p: 1.5, border: '1px solid #F3F4F6', borderRadius: 2,
                                        bgcolor: '#FAFAFA'
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{
                                                width: 36, height: 36, borderRadius: 1.5, bgcolor: '#F3F4F6',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {getFileIcon(file.name, { fontSize: 20 })}
                                            </Box>
                                            <Box>
                                                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                                                    {file.name}
                                                </Typography>
                                                <Typography sx={{ fontSize: '11px', color: '#6B7280' }}>
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <IconButton onClick={() => handleRemoveFile(index)} size="small">
                                            <CloseIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* Processing Mode Selection */}
                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 3, opacity: selectedFiles.length === 0 ? 0.6 : 1 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 1, color: '#111827' }}>
                            Processing Mode
                        </Typography>
                        <FormControl disabled={selectedFiles.length === 0} component="fieldset">
                            <RadioGroup
                                row
                                value={processMode}
                                onChange={(e) => setProcessMode(e.target.value)}
                            >
                                <FormControlLabel
                                    value="template"
                                    control={<Radio sx={{ color: '#6366F1', '&.Mui-checked': { color: '#6366F1' } }} />}
                                    label={<Box><Typography sx={{ fontWeight: 600, fontSize: '14px' }}>Template Mode</Typography><Typography sx={{ fontSize: '12px', color: '#6B7280' }}>Extract specific fields like KTP, Invoice, SIM.</Typography></Box>}
                                />
                                <FormControlLabel
                                    value="insight"
                                    control={<Radio sx={{ color: '#10B981', '&.Mui-checked': { color: '#10B981' } }} />}
                                    label={<Box><Typography sx={{ fontWeight: 600, fontSize: '14px' }}>Insight Mode</Typography><Typography sx={{ fontSize: '12px', color: '#6B7280' }}>Read entire document, generate title, summary, key points, and conclusion.</Typography></Box>}
                                />
                            </RadioGroup>
                        </FormControl>
                    </CardContent>
                </Card>

                {/* Document Type Selection - After Upload */}
                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 3, opacity: isTypeDisabled && selectedFiles.length === 0 ? 0.6 : 1 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 1, color: '#111827' }}>
                            Select Document Type Template
                        </Typography>
                        <Typography sx={{ fontSize: '13px', color: '#6B7280', mb: 2 }}>
                            {selectedFiles.length === 0
                                ? 'Upload files first to select document type'
                                : processMode === 'insight'
                                    ? 'Insight Mode dynamically analyzes the document, template selection is disabled.'
                                    : isMultipleFiles
                                        ? 'Multiple files detected - Auto Detect will be used for each file'
                                        : 'Choose a template or let AI auto-detect the document type'
                            }
                        </Typography>
                        <FormControl fullWidth size="small" disabled={isTypeDisabled}>
                            <Select
                                value={effectiveDocumentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                                displayEmpty
                                sx={{
                                    bgcolor: isTypeDisabled ? '#F3F4F6' : '#F9FAFB',
                                    '& .Mui-disabled': { color: '#9CA3AF' }
                                }}
                            >
                                <MenuItem value="auto">Auto Detect</MenuItem>
                                {isLoadingTemplates ? (
                                    <MenuItem disabled value="">
                                        <CircularProgress size={16} sx={{ mr: 1, color: '#9CA3AF' }} />
                                        Loading templates...
                                    </MenuItem>
                                ) : (
                                    availableTemplates.map((template) => (
                                        <MenuItem key={template.id} value={template.name}>
                                            {template.name}
                                        </MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                        {isMultipleFiles && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, p: 1.5, bgcolor: '#FEF3C7', borderRadius: 2 }}>
                                <InfoIcon sx={{ fontSize: 18, color: '#D97706' }} />
                                <Typography sx={{ fontSize: '12px', color: '#92400E' }}>
                                    When uploading multiple files, each file will be auto-detected individually for best accuracy.
                                </Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>

                {/* Process Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={handleProcess}
                        disabled={selectedFiles.length === 0 || isProcessing}
                        startIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                        sx={{
                            bgcolor: '#6366F1',
                            py: 1.5, px: 4,
                            textTransform: 'none',
                            fontSize: '15px',
                            fontWeight: 600,
                            borderRadius: 2,
                            boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)',
                            '&:hover': { bgcolor: '#4F46E5' }
                        }}
                    >
                        {isProcessing ? 'Processing...' : `Process ${selectedFiles.length || ''} File${selectedFiles.length > 1 ? 's' : ''} with AI`}
                    </Button>
                </Box>
            </Box>
        </Fade>
    );
};


// --- Main Page Component ---
function DocumentUploadPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const rescanId = searchParams.get('rescan');
    const navigate = useNavigate();

    // State
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [documentType, setDocumentType] = useState('auto');
    const [processMode, setProcessMode] = useState('template');
    const [isProcessing, setIsProcessing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    // Results state - array of file results
    const [fileResults, setFileResults] = useState([]);
    const [expandedIndex, setExpandedIndex] = useState(0);
    const [savingIndex, setSavingIndex] = useState(-1);
    const [isSavingAll, setIsSavingAll] = useState(false);

    // Save dialog
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [saveDialogIndex, setSaveDialogIndex] = useState(-1);
    const [saveFileName, setSaveFileName] = useState('');

    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    // Handle rescan on page load
    useEffect(() => {
        if (rescanId) {
            handleRescan(rescanId);
        }
    }, [rescanId]);

    const handleRescan = async (docId) => {
        setIsProcessing(true);
        try {
            const docInfo = await getDocumentById(docId);

            // Create a placeholder file result
            const initialResult = {
                id: docId,
                fileName: docInfo.fileName || 'Document',
                fileSize: docInfo.fileSize || '-',
                file: null,
                status: 'processing',
                result: null,
                error: null
            };
            setFileResults([initialResult]);
            setExpandedIndex(0);

            // Call rescan API
            const result = await rescanDocument(docId);

            // Update with result
            setFileResults([{
                ...initialResult,
                status: 'completed',
                result: {
                    id: result.id,
                    documentType: result.documentType,
                    content: typeof result.content === 'string' ? JSON.parse(result.content) : result.content,
                    confidenceScore: result.confidenceScore,
                    processingTime: result.processingTime
                }
            }]);

            setSnackbar({ open: true, message: 'Document rescanned successfully!', severity: 'success' });
            setSearchParams({});
        } catch (err) {
            setFileResults(prev => prev.map((f, i) => i === 0 ? { ...f, status: 'failed', error: err.message } : f));
            setSnackbar({ open: true, message: 'Rescan failed: ' + err.message, severity: 'error' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newFiles = Array.from(files);
            setSelectedFiles(prev => [...prev, ...newFiles]);
            setFileResults([]);
        }
    };

    const handleRemoveFile = (index) => {
        if (index === -1) {
            setSelectedFiles([]);
        } else {
            setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        }
        setFileResults([]);
    };

    const handleProcess = async () => {
        if (selectedFiles.length === 0) {
            setSnackbar({ open: true, message: 'Please select files first.', severity: 'warning' });
            return;
        }

        // Check API key
        try {
            const settings = await getSettings();
            if (!settings?.apiKey) {
                setSnackbar({
                    open: true,
                    message: 'API key not configured. Please set up your Gemini API key in Settings.',
                    severity: 'error'
                });
                return;
            }
        } catch (error) {
            setSnackbar({ open: true, message: 'Failed to verify settings.', severity: 'error' });
            return;
        }

        setIsProcessing(true);

        // Initialize all files as processing
        const initialResults = selectedFiles.map((file, index) => ({
            id: null,
            fileName: file.name,
            fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            file: file,
            status: 'pending',
            result: null,
            error: null
        }));
        setFileResults(initialResults);
        setExpandedIndex(0);

        // Process files one by one for better progress tracking and to avoid timeouts
        try {
            const options = { documentType: documentType === 'auto' ? null : documentType, mode: processMode };
            const allResults = [];

            for (let i = 0; i < selectedFiles.length; i++) {
                // Update current file to processing
                setFileResults(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'processing' } : f));
                setExpandedIndex(i);

                try {
                    // Send each file individually
                    const result = await processDocuments([selectedFiles[i]], options);
                    const apiResult = Array.isArray(result) ? result[0] : result;

                    // Update this file's result
                    setFileResults(prev => prev.map((f, idx) => {
                        if (idx === i && apiResult) {
                            return {
                                ...f,
                                id: apiResult.id,
                                status: apiResult.status === 'failed' ? 'failed' : 'completed',
                                result: {
                                    id: apiResult.id,
                                    documentType: apiResult.documentType,
                                    content: typeof apiResult.content === 'string' ? JSON.parse(apiResult.content) : apiResult.content,
                                    confidenceScore: apiResult.confidenceScore,
                                    processingTime: apiResult.processingTime
                                },
                                error: apiResult.error || null
                            };
                        }
                        return f;
                    }));

                    allResults.push({ status: apiResult?.status || 'completed' });
                } catch (fileError) {
                    console.error(`Processing error for file ${selectedFiles[i].name}:`, fileError);
                    setFileResults(prev => prev.map((f, idx) =>
                        idx === i ? { ...f, status: 'failed', error: fileError.message } : f
                    ));
                    allResults.push({ status: 'failed' });
                }
            }

            const successCount = allResults.filter(r => r.status !== 'failed').length;
            setSnackbar({
                open: true,
                message: `Processed ${successCount}/${selectedFiles.length} files successfully!`,
                severity: successCount === selectedFiles.length ? 'success' : 'warning'
            });

        } catch (error) {
            console.error('Processing error:', error);
            setFileResults(prev => prev.map(f => f.status === 'pending' ? { ...f, status: 'failed', error: error.message } : f));
            setSnackbar({ open: true, message: 'Processing failed: ' + error.message, severity: 'error' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleContentChange = (fileIndex, key, value) => {
        setFileResults(prev => prev.map((f, i) => {
            if (i === fileIndex && f.result) {
                return {
                    ...f,
                    result: {
                        ...f.result,
                        content: { ...f.result.content, [key]: value }
                    }
                };
            }
            return f;
        }));
    };

    const handleSaveClick = (index) => {
        const fileResult = fileResults[index];
        if (!fileResult || fileResult.status !== 'completed') return;

        setSaveDialogIndex(index);
        setSaveFileName(fileResult.fileName.replace(/\.[^/.]+$/, ''));
        setSaveDialogOpen(true);
    };

    const handleSaveConfirm = async () => {
        setSaveDialogOpen(false);
        const index = saveDialogIndex;
        const fileResult = fileResults[index];

        if (!fileResult) return;

        setSavingIndex(index);
        try {
            const submissionPayload = {
                documentId: fileResult.id,
                document_type: fileResult.result.documentType,
                content: fileResult.result.content,
                userDefinedFilename: saveFileName || fileResult.fileName
            };

            await submitProcessedData(submissionPayload);

            // Remove saved file from results
            setFileResults(prev => prev.filter((_, i) => i !== index));

            // Adjust expanded index if needed
            if (expandedIndex >= fileResults.length - 1) {
                setExpandedIndex(Math.max(0, fileResults.length - 2));
            }

            setSnackbar({ open: true, message: `"${saveFileName}" saved successfully!`, severity: 'success' });

        } catch (error) {
            setSnackbar({ open: true, message: 'Save failed: ' + error.message, severity: 'error' });
        } finally {
            setSavingIndex(-1);
        }
    };

    const handleRemoveResult = (index) => {
        setFileResults(prev => prev.filter((_, i) => i !== index));
        if (expandedIndex >= fileResults.length - 1) {
            setExpandedIndex(Math.max(0, fileResults.length - 2));
        }
    };

    const handleSaveAll = async () => {
        const completedFiles = fileResults.filter(f => f.status === 'completed');
        if (completedFiles.length === 0) {
            setSnackbar({ open: true, message: 'No files to save.', severity: 'warning' });
            return;
        }

        setIsSavingAll(true);
        let savedCount = 0;

        for (let i = fileResults.length - 1; i >= 0; i--) {
            const fileResult = fileResults[i];
            if (fileResult.status !== 'completed') continue;

            try {
                const submissionPayload = {
                    documentId: fileResult.id,
                    document_type: fileResult.result.documentType,
                    content: fileResult.result.content,
                    userDefinedFilename: fileResult.fileName.replace(/\.[^/.]+$/, '')
                };

                await submitProcessedData(submissionPayload);
                savedCount++;

                // Remove from list
                setFileResults(prev => prev.filter((_, idx) => idx !== i));
            } catch (error) {
                console.error(`Failed to save ${fileResult.fileName}:`, error);
            }
        }

        setIsSavingAll(false);
        setSnackbar({
            open: true,
            message: `Saved ${savedCount} files successfully!`,
            severity: savedCount > 0 ? 'success' : 'error'
        });
    };

    const handleScanAgain = () => {
        setSelectedFiles([]);
        setFileResults([]);
        setExpandedIndex(0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const completedCount = fileResults.filter(f => f.status === 'completed').length;

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB', pt: 3, pb: 6 }}>
            <Container maxWidth="lg">

                {/* Upload Section */}
                {fileResults.length === 0 && (
                    <Box sx={{ mb: 4 }}>
                        <UploadPhase
                            documentType={documentType}
                            setDocumentType={setDocumentType}
                            selectedFiles={selectedFiles}
                            handleFileChange={handleFileChange}
                            handleRemoveFile={handleRemoveFile}
                            handleProcess={handleProcess}
                            isProcessing={isProcessing}
                        />
                    </Box>
                )}

                {/* Results Section */}
                {fileResults.length > 0 && (
                    <Fade in timeout={500}>
                        <Box>
                            {/* Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Box>
                                    <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                                        Processing Results
                                    </Typography>
                                    <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
                                        {completedCount} of {fileResults.length} files completed
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<RefreshIcon />}
                                        onClick={handleScanAgain}
                                        sx={{ textTransform: 'none', borderColor: '#D1D5DB', color: '#374151' }}
                                    >
                                        New Scan
                                    </Button>
                                    {completedCount > 1 && (
                                        <Button
                                            variant="contained"
                                            startIcon={isSavingAll ? <CircularProgress size={16} color="inherit" /> : <SaveAllIcon />}
                                            onClick={handleSaveAll}
                                            disabled={isSavingAll || completedCount === 0}
                                            sx={{
                                                textTransform: 'none',
                                                bgcolor: '#10B981',
                                                '&:hover': { bgcolor: '#059669' }
                                            }}
                                        >
                                            {isSavingAll ? 'Saving All...' : `Save All (${completedCount})`}
                                        </Button>
                                    )}
                                </Box>
                            </Box>

                            {/* Progress Overview */}
                            {isProcessing && (
                                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 3 }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                            <CircularProgress size={24} sx={{ color: '#6366F1' }} />
                                            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                                                Processing files with AI...
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(completedCount / fileResults.length) * 100}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                bgcolor: '#E5E7EB',
                                                '& .MuiLinearProgress-bar': { bgcolor: '#6366F1' }
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {/* File Results */}
                            {fileResults.map((fileResult, index) => (
                                <FileResultCard
                                    key={`${fileResult.fileName}-${index}`}
                                    fileResult={fileResult}
                                    index={index}
                                    onSave={handleSaveClick}
                                    onRemove={handleRemoveResult}
                                    onContentChange={handleContentChange}
                                    isSaving={savingIndex === index}
                                    isExpanded={expandedIndex === index}
                                    onToggleExpand={() => setExpandedIndex(expandedIndex === index ? -1 : index)}
                                    expectedType={documentType}
                                />
                            ))}
                        </Box>
                    </Fade>
                )}

            </Container>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Save Dialog */}
            <Dialog
                open={saveDialogOpen}
                onClose={() => setSaveDialogOpen(false)}
                PaperProps={{ sx: { borderRadius: 3, minWidth: 400 } }}
            >
                <DialogTitle sx={{ fontWeight: 600 }}>Save Document</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Enter a name for this document.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Document Name"
                        value={saveFileName}
                        onChange={(e) => setSaveFileName(e.target.value)}
                        variant="outlined"
                        size="small"
                        InputProps={{ sx: { borderRadius: 2 } }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setSaveDialogOpen(false)} sx={{ color: '#6B7280' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveConfirm}
                        variant="contained"
                        startIcon={<SaveIcon />}
                        sx={{
                            bgcolor: '#6366F1',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': { bgcolor: '#4F46E5' }
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default DocumentUploadPage;
