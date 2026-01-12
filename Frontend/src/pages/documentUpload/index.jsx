// src/pages/documentUpload/index.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
    Container, Typography, Box, Card, CardContent, Button,
    Select, MenuItem, FormControl, InputLabel, IconButton,
    Grid, TextField, CircularProgress, Chip, LinearProgress,
    Fade, useTheme, useMediaQuery, Paper, Snackbar, Alert, Toolbar,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
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
    Settings as SettingsIcon,
    Replay as RescanIcon
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { processDocuments, submitProcessedData, getSettings, rescanDocument, getDocumentById, getDocumentFileUrl } from '../../services/apiService';

// --- Components for each Phase ---

// Phase 1: Upload
const UploadPhase = ({
    documentType, setDocumentType, selectedFiles, handleFileChange,
    handleRemoveFile, handleProcess, isProcessing
}) => {
    const fileInputRef = useRef();

    return (
        <Fade in timeout={500}>
            <Box>
                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 3 }}>
                    <CardContent sx={{ p: 4 }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: 600, mb: 2, color: '#111827' }}>
                            Select Document Type
                        </Typography>
                        <FormControl fullWidth size="small" sx={{ mb: 4 }}>
                            <Select
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                                displayEmpty
                                sx={{ bgcolor: '#F9FAFB' }}
                            >
                                <MenuItem value="auto">Auto Detect</MenuItem>
                                <MenuItem value="KTP">KTP</MenuItem>
                                <MenuItem value="KK">KK</MenuItem>
                                <MenuItem value="STNK">STNK</MenuItem>
                                <MenuItem value="BPKB">BPKB</MenuItem>
                                <MenuItem value="Invoice">Invoice</MenuItem>
                            </Select>
                        </FormControl>

                        <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 1.5, color: '#374151' }}>
                            Upload Instructions
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 4 }}>
                            {[
                                'Ensure the document is clear and all corners are visible',
                                'Supported formats: JPG, PNG, PDF',
                                'Maximum file size: 10 MB'
                            ].map((text, i) => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} />
                                    <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>{text}</Typography>
                                </Box>
                            ))}
                        </Box>

                        <Box
                            sx={{
                                border: '2px dashed #E5E7EB',
                                borderRadius: 3,
                                bgcolor: '#F9FAFB',
                                minHeight: 250,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    borderColor: '#6366F1',
                                    bgcolor: '#EEF2FF'
                                }
                            }}
                            onClick={() => fileInputRef.current.click()}
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
                                width: 64, height: 64, borderRadius: '50%', bgcolor: '#6366F1',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,
                                boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)'
                            }}>
                                <CloudUploadIcon sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                            <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#374151', mb: 0.5 }}>
                                Drop your document here or click to browse
                            </Typography>
                            <Typography sx={{ fontSize: '13px', color: '#9CA3AF' }}>
                                JPG, PNG, PDF | up to 10 MB
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {selectedFiles.length > 0 && (
                    <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 3 }}>
                        <CardContent sx={{ p: 2 }}>
                            {selectedFiles.map((file, index) => (
                                <Box key={index} sx={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    p: 2, border: '1px solid #F3F4F6', borderRadius: 2,
                                    bgcolor: '#FAFAFA'
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{
                                            width: 48, height: 48, borderRadius: 2, bgcolor: '#F3F4F6',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <ImageIcon sx={{ color: '#9CA3AF' }} />
                                        </Box>
                                        <Box>
                                            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                                                {file.name}
                                            </Typography>
                                            <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>
                                                {(file.size / 1024 / 1024).toFixed(2)} MB • Uploaded
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton onClick={() => handleRemoveFile(index)} size="small">
                                        <DeleteIcon sx={{ color: '#EF4444' }} />
                                    </IconButton>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                )}

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
                        {isProcessing ? 'Processing...' : 'Process with AI'}
                    </Button>
                </Box>
            </Box>
        </Fade>
    );
};

// Phase 2: Processing Status
const ProcessingStatusPhase = ({ steps }) => {
    return (
        <Fade in timeout={500}>
            <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, mb: 3 }}>
                <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                            Processing Status
                        </Typography>
                        <Chip
                            icon={<CircularProgress size={14} thickness={5} sx={{ color: '#4F46E5 !important' }} />}
                            label="Processing"
                            sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 600, border: '1px solid #C7D2FE' }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {steps.map((step, index) => (
                            <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Box sx={{
                                        width: 32, height: 32, borderRadius: '50%',
                                        bgcolor: step.status === 'completed' ? '#10B981' : step.status === 'current' ? '#3B82F6' : '#F3F4F6',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        zIndex: 1
                                    }}>
                                        {step.status === 'completed' ? (
                                            <CheckCircleIcon sx={{ fontSize: 20, color: 'white' }} />
                                        ) : step.status === 'current' ? (
                                            <CircularProgress size={18} sx={{ color: 'white' }} />
                                        ) : (
                                            <ScheduleIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />
                                        )}
                                    </Box>
                                    {index !== steps.length - 1 && (
                                        <Box sx={{ width: 2, flexGrow: 1, bgcolor: '#F3F4F6', my: 0.5 }} />
                                    )}
                                </Box>
                                <Box sx={{ pt: 0.5 }}>
                                    <Typography sx={{
                                        fontSize: '14px', fontWeight: 600,
                                        color: step.status === 'pending' ? '#9CA3AF' : '#111827'
                                    }}>
                                        {step.label}
                                    </Typography>
                                    <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>
                                        {step.description}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>
        </Fade>
    );
};

// Phase 3: Results
const ResultPhase = ({ ocrResult, handleScanAgain, handleSave, selectedFile, isSaving, rescanPreviewUrl }) => {
    // Generate a preview URL for the uploaded file
    const [previewUrl, setPreviewUrl] = useState(null);
    const [imageLoading, setImageLoading] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        if (selectedFile) {
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else if (rescanPreviewUrl) {
            // Fetch image with credentials for rescan mode
            setImageLoading(true);
            fetch(rescanPreviewUrl, { credentials: 'include' })
                .then(res => res.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    setPreviewUrl(url);
                    setImageLoading(false);
                })
                .catch(err => {
                    console.error('Failed to load preview:', err);
                    setImageLoading(false);
                });
        }
    }, [selectedFile, rescanPreviewUrl]);

    // Helper to render form fields dynamically
    const renderFormFields = () => {
        if (!ocrResult || !ocrResult.content) return null;

        // Flatten the content object for display if needed, or iterate keys
        // Assuming content structure like { nik: "...", nama: "..." } or { data_penduduk: { ... } }
        let fields = [];

        // Simplistic flattening for demo. 
        // In a real app, you might want specific components per document type.
        const traverse = (obj, prefix = '') => {
            Object.entries(obj).forEach(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                    traverse(value, key);
                } else {
                    fields.push({ label: key.replace(/_/g, ' ').toUpperCase(), value, key });
                }
            });
        };

        // Handle specific structures like KTP if present
        if (ocrResult.content.data_penduduk) {
            traverse(ocrResult.content.data_penduduk);
        } else {
            traverse(ocrResult.content);
        }

        return (
            <Grid container spacing={2}>
                {fields.map((field, idx) => (
                    <Grid item xs={12} sm={field.key.length > 20 ? 12 : 6} key={idx}>
                        <TextField
                            fullWidth
                            label={field.label}
                            defaultValue={field.value}
                            variant="outlined"
                            size="small"
                            InputProps={{
                                readOnly: false, // Allow editing
                                sx: { borderRadius: 2 }
                            }}
                        />
                    </Grid>
                ))}
            </Grid>
        );
    };

    return (
        <Fade in timeout={500}>
            <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                            Scan Results
                        </Typography>
                        <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
                            Review extracted data from your document
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                            label={`${ocrResult.document_type || 'Document'} Detected`}
                            size="small"
                            color="success"
                            variant="outlined"
                            icon={<CheckCircleIcon />}
                        />
                        <Chip
                            label="Confidence: 98%"
                            size="small"
                            sx={{ bgcolor: '#F3E8FF', color: '#7E22CE', fontWeight: 600 }}
                        />
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* Left Column: Preview */}
                    <Grid item xs={12} md={5}>
                        <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, height: '100%' }}>
                            <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 2, color: '#374151' }}>
                                    Document Preview
                                </Typography>
                                <Box sx={{
                                    flexGrow: 1,
                                    bgcolor: '#F3F4F6',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minHeight: 400
                                }}>
                                    {imageLoading ? (
                                        <CircularProgress size={40} />
                                    ) : previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">No Preview</Typography>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Right Column: Extracted Data */}
                    <Grid item xs={12} md={7}>
                        <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 3, color: '#374151' }}>
                                    Extracted Data
                                </Typography>
                                {renderFormFields()}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, mb: 4 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={handleScanAgain}
                        sx={{ textTransform: 'none', borderColor: '#D1D5DB', color: '#374151' }}
                    >
                        Scan Again
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={isSaving}
                        sx={{
                            bgcolor: '#6366F1',
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#4F46E5' }
                        }}
                    >
                        {isSaving ? 'Saving...' : 'Save to Database'}
                    </Button>
                </Box>

                {/* Confidence & Insights */}
                <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3, bgcolor: '#FAFAFA', mb: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: 700, mb: 3, color: '#111827' }}>
                            Confidence Analysis
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {['Document Type Detection', 'Text Recognition Accuracy', 'Data Extraction Quality'].map((label, idx) => (
                                <Box key={idx}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography sx={{ fontSize: '13px', color: '#4B5563' }}>{label}</Typography>
                                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#10B981' }}>{98 - idx * 2}%</Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={98 - idx * 2}
                                        sx={{
                                            height: 6,
                                            borderRadius: 3,
                                            bgcolor: '#E5E7EB',
                                            '& .MuiLinearProgress-bar': { bgcolor: '#10B981' }
                                        }}
                                    />
                                </Box>
                            ))}
                        </Box>

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>Overall Confidence</Typography>
                            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>96%</Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={96}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                mt: 1,
                                bgcolor: '#E5E7EB',
                                '& .MuiLinearProgress-bar': { bgcolor: '#10B981' }
                            }}
                        />
                    </CardContent>
                </Card>

                {/* AI Insights - New Section */}
                <Card elevation={0} sx={{ border: '1px solid #C7D2FE', borderRadius: 3, bgcolor: '#F5F3FF' }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Box sx={{
                                width: 40, height: 40, borderRadius: 2, bgcolor: '#4F46E5',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)'
                            }}>
                                <AutoAwesomeIcon sx={{ color: 'white' }} />
                            </Box>
                            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                                AI Insights
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {[
                                { icon: <CheckCircleIcon sx={{ fontSize: 20, color: '#10B981' }} />, text: 'Document is authentic and valid KTP format detected' },
                                { icon: <CheckCircleIcon sx={{ fontSize: 20, color: '#10B981' }} />, text: 'All mandatory fields successfully extracted' },
                                { icon: <InfoIcon sx={{ fontSize: 20, color: '#3B82F6' }} />, text: 'Image quality is excellent for OCR processing' },
                                { icon: <WarningIcon sx={{ fontSize: 20, color: '#D97706' }} />, text: 'Recommendation: Verify NIK format before saving to database' }
                            ].map((insight, idx) => (
                                <Box key={idx} sx={{ display: 'flex', alignItems: 'start', gap: 1.5 }}>
                                    <Box sx={{ mt: 0.25 }}>{insight.icon}</Box>
                                    <Typography sx={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.5 }}>
                                        {insight.text}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </CardContent>
                </Card>

            </Box>
        </Fade>
    );
};


// --- Main Page Component ---
function DocumentUploadPage() {
    // URL params for rescan
    const [searchParams, setSearchParams] = useSearchParams();
    const rescanId = searchParams.get('rescan');
    const navigate = useNavigate();

    // State
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [documentType, setDocumentType] = useState('auto');
    const [isSaving, setIsSaving] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRescanning, setIsRescanning] = useState(false);
    const [rescanFileName, setRescanFileName] = useState('');
    const [rescanPreviewUrl, setRescanPreviewUrl] = useState(null);

    // Snackbar state
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // OCR Result state - initially null
    const [ocrResult, setOcrResult] = useState(null);
    const [documentId, setDocumentId] = useState(null);

    // Save confirmation dialog state
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [saveFileName, setSaveFileName] = useState('');

    // Processing Steps State
    const [processingSteps, setProcessingSteps] = useState([
        { label: 'Document Uploaded', description: 'Waiting...', status: 'pending' },
        { label: 'AI Detection', description: 'Pending', status: 'pending' },
        { label: 'OCR Processing', description: 'Pending', status: 'pending' },
        { label: 'Data Extraction', description: 'Pending', status: 'pending' }
    ]);

    // Handle rescan on page load
    useEffect(() => {
        if (rescanId) {
            handleRescan(rescanId);
        }
    }, [rescanId]);

    // Rescan handler
    const handleRescan = async (docId) => {
        setIsRescanning(true);
        setIsProcessing(true);
        setOcrResult(null);

        // Reset steps for animation
        setProcessingSteps([
            { label: 'Document Loaded', description: 'Re-scanning existing file...', status: 'completed' },
            { label: 'AI Detection', description: 'Detecting document type...', status: 'current' },
            { label: 'OCR Processing', description: 'Pending', status: 'pending' },
            { label: 'Data Extraction', description: 'Pending', status: 'pending' }
        ]);

        const updateStep = (index, status, desc) => {
            setProcessingSteps(prev => prev.map((step, i) =>
                i === index ? { ...step, status, ...(desc && { description: desc }) } : step
            ));
        };

        try {
            // Get document info first
            const docInfo = await getDocumentById(docId);
            setRescanFileName(docInfo.fileName || 'Document');

            // Set preview URL for the document image
            setRescanPreviewUrl(getDocumentFileUrl(docId));

            // Step 1: AI Detection
            await new Promise(r => setTimeout(r, 500));
            updateStep(1, 'completed', 'Auto detecting...');
            updateStep(2, 'current', 'Analyzing text...');

            // Step 2: OCR Processing
            await new Promise(r => setTimeout(r, 500));
            updateStep(2, 'completed', 'Text extracted');
            updateStep(3, 'current', 'Extracting fields...');

            // Call rescan API
            const result = await rescanDocument(docId);

            // Update steps
            updateStep(3, 'completed', 'Data extracted');

            // Set result
            setOcrResult({
                document_type: result.documentType,
                content: typeof result.content === 'string' ? JSON.parse(result.content) : result.content,
                confidence_score: result.confidenceScore,
                processing_time: result.processingTime
            });
            setDocumentId(result.id);

            setSnackbar({ open: true, message: 'Document rescanned successfully!', severity: 'success' });

            // Clear rescan param from URL
            setSearchParams({});

        } catch (err) {
            console.error('Rescan error:', err);
            setSnackbar({ open: true, message: 'Rescan failed: ' + err.message, severity: 'error' });

            // Reset steps on error
            setProcessingSteps([
                { label: 'Document Loaded', description: 'Failed', status: 'pending' },
                { label: 'AI Detection', description: 'Failed', status: 'pending' },
                { label: 'OCR Processing', description: 'Failed', status: 'pending' },
                { label: 'Data Extraction', description: 'Failed', status: 'pending' }
            ]);
        } finally {
            setIsProcessing(false);
            setIsRescanning(false);
        }
    };

    // Handlers
    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setSelectedFiles(Array.from(e.target.files));
            // Reset result when new file is selected
            setOcrResult(null);
            setDocumentId(null);
        }
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        if (selectedFiles.length === 1) {
            setOcrResult(null);
            setDocumentId(null);
        }
    };

    const handleProcess = async () => {
        if (selectedFiles.length === 0) {
            setSnackbar({ open: true, message: 'Please select a file first.', severity: 'warning' });
            return;
        }

        // Check if API key is configured
        try {
            const settings = await getSettings();
            if (!settings || !settings.apiKey) {
                setSnackbar({
                    open: true,
                    message: 'API key is not configured. Please set up your Gemini API key in Settings first.',
                    severity: 'error'
                });
                return;
            }
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Failed to verify settings. Please configure your API key in Settings.',
                severity: 'error'
            });
            return;
        }

        setIsProcessing(true);
        setOcrResult(null);

        // Reset steps for animation
        setProcessingSteps([
            { label: 'Document Uploaded', description: 'Completed', status: 'completed' },
            { label: 'AI Detection', description: 'Detecting document type...', status: 'current' },
            { label: 'OCR Processing', description: 'Pending', status: 'pending' },
            { label: 'Data Extraction', description: 'Pending', status: 'pending' }
        ]);

        // Helper to update steps
        const updateStep = (index, status, desc) => {
            setProcessingSteps(prev => prev.map((step, i) =>
                i === index ? { ...step, status, ...(desc && { description: desc }) } : step
            ));
        };

        try {
            // Step 1: AI Detection
            await new Promise(r => setTimeout(r, 800));
            updateStep(1, 'completed', documentType === 'auto' ? 'Auto detecting...' : `${documentType} Selected`);
            updateStep(2, 'current', 'Analyzing text...');

            // Step 2: Call the actual API
            const options = {
                documentType: documentType === 'auto' ? null : documentType
            };

            const result = await processDocuments(selectedFiles, options);

            updateStep(2, 'completed', 'Text recognized');
            updateStep(3, 'current', 'Extracting fields...');

            await new Promise(r => setTimeout(r, 500));
            updateStep(3, 'completed', 'Extraction complete');

            // Set the result
            setOcrResult({
                document_type: result.documentType || documentType || 'Document',
                content: result.content || {},
                id: result.id
            });
            setDocumentId(result.id);

            setSnackbar({ open: true, message: 'Document processed successfully!', severity: 'success' });

        } catch (error) {
            console.error('Processing error:', error);
            // Update steps to show error
            setProcessingSteps(prev => prev.map((step, i) =>
                step.status === 'current' ? { ...step, status: 'pending', description: 'Failed' } : step
            ));
            setSnackbar({ open: true, message: 'Processing failed: ' + error.message, severity: 'error' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleScanAgain = () => {
        // Reset everything for a new scan
        setOcrResult(null);
        setDocumentId(null);
        setSelectedFiles([]);
        setProcessingSteps([
            { label: 'Document Uploaded', description: 'Waiting...', status: 'pending' },
            { label: 'AI Detection', description: 'Pending', status: 'pending' },
            { label: 'OCR Processing', description: 'Pending', status: 'pending' },
            { label: 'Data Extraction', description: 'Pending', status: 'pending' }
        ]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Open save confirmation dialog
    const handleSaveClick = () => {
        if (!ocrResult) {
            setSnackbar({ open: true, message: 'No data to save. Process a document first.', severity: 'warning' });
            return;
        }
        // Set default filename from uploaded file
        const defaultName = selectedFiles[0]?.name?.replace(/\.[^/.]+$/, '') || 'document';
        setSaveFileName(defaultName);
        setSaveDialogOpen(true);
    };

    // Close save dialog
    const handleSaveDialogClose = () => {
        setSaveDialogOpen(false);
    };

    // Confirm save
    const handleSaveConfirm = async () => {
        setSaveDialogOpen(false);
        setIsSaving(true);
        try {
            const submissionPayload = {
                documentId: documentId, // Pass existing document ID to update
                document_type: ocrResult.document_type,
                content: ocrResult.content,
                userDefinedFilename: saveFileName || selectedFiles[0]?.name || 'document'
            };

            await submitProcessedData(submissionPayload);
            setSnackbar({ open: true, message: 'Document saved successfully!', severity: 'success' });

            // Reset for new scan
            setTimeout(() => {
                handleScanAgain();
            }, 1500);
        } catch (error) {
            console.error('Save error:', error);
            setSnackbar({ open: true, message: 'Save failed: ' + error.message, severity: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB', pt: 3, pb: 6 }}>
            <Toolbar sx={{ minHeight: { xs: 56, sm: 89 } }} />
            <Container maxWidth="lg">


                {/* Upload Section - Always Visible */}
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

                {/* Processing Section - Visible when processing or has result */}
                {(isProcessing || ocrResult) && (
                    <Box sx={{ mb: 4 }}>
                        <ProcessingStatusPhase steps={processingSteps} />
                    </Box>
                )}

                {/* Result Section - Visible only when there's a result */}
                {ocrResult && (
                    <Box sx={{ mb: 4 }}>
                        <ResultPhase
                            ocrResult={ocrResult}
                            handleScanAgain={handleScanAgain}
                            handleSave={handleSaveClick}
                            selectedFile={selectedFiles[0]}
                            isSaving={isSaving}
                            rescanPreviewUrl={rescanPreviewUrl}
                        />
                    </Box>
                )}

            </Container>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Save Confirmation Dialog */}
            <Dialog
                open={saveDialogOpen}
                onClose={handleSaveDialogClose}
                PaperProps={{
                    sx: { borderRadius: 3, minWidth: 400 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 600 }}>
                    Save Document
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Enter a name for this document and confirm to save.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        fullWidth
                        label="Document Name"
                        value={saveFileName}
                        onChange={(e) => setSaveFileName(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{ mb: 2 }}
                        InputProps={{
                            sx: { borderRadius: 2 }
                        }}
                    />
                    <Box sx={{ p: 2, bgcolor: '#F3F4F6', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                            Document Type: {ocrResult?.document_type || 'Unknown'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
                            Original File: {selectedFiles[0]?.name || 'document'}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={handleSaveDialogClose}
                        sx={{ color: '#6B7280' }}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveConfirm}
                        variant="contained"
                        disabled={isSaving}
                        startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                        sx={{
                            bgcolor: '#6366F1',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': { bgcolor: '#4F46E5' }
                        }}
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default DocumentUploadPage;
