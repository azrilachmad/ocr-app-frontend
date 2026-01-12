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
    Paper,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
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
    Rule as ValidationIcon,
    Refresh as RefreshIcon,
    Delete as DeleteIcon,
    Info as InfoIcon,
    Description as DocumentIcon,
    People as PeopleIcon,
    DirectionsCar as CarIcon,
    CreditCard as CardIcon,
    Receipt as ReceiptIcon
} from '@mui/icons-material';
import { getDocumentById, updateDocument, deleteDocument, saveDocument } from '../../services/apiService';

// Document type icons
// Helper function to construct image URL from filePath
// Use environment variable for API base URL (strip /api suffix for uploads)
const API_HOST = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api').replace(/\/api$/, '');

const getImageUrl = (filePath) => {
    if (!filePath) return null;

    // Normalize path separators (Windows to Unix)
    let normalizedPath = filePath.replace(/\\/g, '/');

    // If path is absolute (Windows or Unix), extract only the uploads part
    // Example: "D:/path/to/Backend/uploads/file.jpg" -> "uploads/file.jpg"
    if (normalizedPath.includes('/uploads/')) {
        normalizedPath = normalizedPath.substring(normalizedPath.indexOf('/uploads/') + 1);
    }

    // Remove leading "./" if present
    if (normalizedPath.startsWith('./')) {
        normalizedPath = normalizedPath.substring(2);
    }

    // Ensure path starts with "uploads/"
    if (!normalizedPath.startsWith('uploads/')) {
        normalizedPath = `uploads/${normalizedPath}`;
    }

    return `${API_HOST}/${normalizedPath}`;
};

const getDocumentTypeConfig = (type) => {
    const configs = {
        'KTP': { icon: <DocumentIcon />, color: '#2563EB' },
        'KK': { icon: <PeopleIcon />, color: '#16A34A' },
        'STNK': { icon: <CarIcon />, color: '#EA580C' },
        'BPKB': { icon: <CardIcon />, color: '#7C3AED' },
        'Invoice': { icon: <ReceiptIcon />, color: '#DC2626' }
    };
    return configs[type] || { icon: <DocumentIcon />, color: '#6B7280' };
};

const ScanDetailEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialMode = searchParams.get('mode') === 'edit';

    const [isEditing, setIsEditing] = useState(initialMode);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [document, setDocument] = useState(null);
    const [editedContent, setEditedContent] = useState({});
    const [editedFileName, setEditedFileName] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Fetch document data
    useEffect(() => {
        const fetchDocument = async () => {
            setIsLoading(true);
            try {
                const data = await getDocumentById(id);
                setDocument(data);

                // Parse content - handle double-stringified JSON
                let parsedContent = data.content || {};

                // Keep parsing while content is a string (handles double/triple stringify)
                while (typeof parsedContent === 'string') {
                    try {
                        const parsed = JSON.parse(parsedContent);
                        // If parsing a string results in a primitive, stop
                        if (typeof parsed !== 'object' || parsed === null) {
                            parsedContent = { raw_content: parsedContent };
                            break;
                        }
                        parsedContent = parsed;
                    } catch (e) {
                        console.error('Failed to parse content JSON:', e);
                        parsedContent = { raw_content: parsedContent };
                        break;
                    }
                }

                setEditedContent(parsedContent);
                setEditedFileName(data.fileName || '');
            } catch (error) {
                console.error('Failed to fetch document:', error);
                setSnackbar({ open: true, message: 'Failed to load document: ' + error.message, severity: 'error' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchDocument();
    }, [id]);

    const handleBack = () => navigate('/history');
    const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

    const toggleEdit = () => {
        if (isEditing) {
            // Cancel editing - reset to original data with proper parsing
            let parsedContent = document?.content || {};
            if (typeof parsedContent === 'string') {
                try {
                    parsedContent = JSON.parse(parsedContent);
                } catch (e) {
                    parsedContent = { raw_content: parsedContent };
                }
            }
            setEditedContent(parsedContent);
            setEditedFileName(document?.fileName || '');
        }
        setIsEditing(!isEditing);
    };

    const handleContentChange = (key, value) => {
        setEditedContent(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateDocument(id, {
                content: editedContent,
                fileName: editedFileName
            });

            // Update local state
            setDocument(prev => ({
                ...prev,
                content: editedContent,
                fileName: editedFileName
            }));

            setSnackbar({ open: true, message: 'Changes saved successfully!', severity: 'success' });
            setIsEditing(false);
        } catch (error) {
            setSnackbar({ open: true, message: 'Save failed: ' + error.message, severity: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteDocument(id);
            setSnackbar({ open: true, message: 'Document deleted successfully!', severity: 'success' });
            setTimeout(() => navigate('/history'), 1500);
        } catch (error) {
            setSnackbar({ open: true, message: 'Delete failed: ' + error.message, severity: 'error' });
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
        }
    };

    // Save as new (for unsaved documents)
    const handleSaveAsNew = async () => {
        setIsSaving(true);
        try {
            await saveDocument(id, {
                content: editedContent,
                fileName: editedFileName
            });

            // Update local state
            setDocument(prev => ({
                ...prev,
                content: editedContent,
                fileName: editedFileName,
                saved: true
            }));

            setSnackbar({ open: true, message: 'Document saved successfully!', severity: 'success' });
            setIsEditing(false);

            // Redirect to history after short delay
            setTimeout(() => navigate('/history'), 1500);
        } catch (error) {
            setSnackbar({ open: true, message: 'Save failed: ' + error.message, severity: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta'
        });
    };

    const formatLabel = (key) => {
        return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    if (isLoading) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!document) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <DocumentIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
                    <Typography sx={{ color: '#6B7280', fontSize: '18px', mb: 2 }}>Document not found</Typography>
                    <Button variant="contained" onClick={handleBack}>Back to History</Button>
                </Box>
            </Box>
        );
    }

    const typeConfig = getDocumentTypeConfig(document.documentType);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB' }}>
            <Toolbar sx={{ minHeight: { xs: 56, sm: 89 } }} />

            {/* Header */}
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #E5E7EB', py: 2 }}>
                <Container maxWidth="xl">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton onClick={handleBack} sx={{ color: '#4B5563' }}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: '18px', color: '#111827', lineHeight: 1.2 }}>
                                    {document.fileName || 'Untitled Document'}
                                </Typography>
                                <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>
                                    {document.documentType || 'Document'} • {document.status === 'completed' ? 'Completed' : document.status}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {isEditing ? (
                                <>
                                    <Button
                                        variant="outlined"
                                        startIcon={<CancelIcon />}
                                        onClick={toggleEdit}
                                        disabled={isSaving}
                                        sx={{ textTransform: 'none', color: '#6B7280', borderColor: '#E5E7EB' }}
                                    >
                                        Cancel
                                    </Button>
                                    {document.saved ? (
                                        <Button
                                            variant="contained"
                                            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            sx={{ textTransform: 'none', bgcolor: '#6366F1', '&:hover': { bgcolor: '#4F46E5' } }}
                                        >
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                                            onClick={handleSaveAsNew}
                                            disabled={isSaving}
                                            sx={{ textTransform: 'none', bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
                                        >
                                            {isSaving ? 'Saving...' : 'Save Document'}
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <>
                                    {document.saved ? (
                                        <Button
                                            variant="outlined"
                                            startIcon={<EditIcon />}
                                            onClick={toggleEdit}
                                            sx={{ textTransform: 'none', color: '#6B7280', borderColor: '#E5E7EB' }}
                                        >
                                            Edit
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            startIcon={<EditIcon />}
                                            onClick={toggleEdit}
                                            sx={{
                                                textTransform: 'none',
                                                bgcolor: '#10B981',
                                                '&:hover': { bgcolor: '#059669' }
                                            }}
                                        >
                                            Edit & Save
                                        </Button>
                                    )}
                                </>
                            )}
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="xl" sx={{ py: 3 }}>
                {/* Info Banner */}
                <Box sx={{
                    bgcolor: document.status === 'completed' ? '#ECFDF5' : (document.status === 'failed' ? '#FEF2F2' : '#FEFCE8'),
                    borderRadius: 2,
                    p: 2,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    borderLeft: `4px solid ${document.status === 'completed' ? '#10B981' : (document.status === 'failed' ? '#EF4444' : '#F59E0B')}`
                }}>
                    {document.status === 'completed' ? <CheckCircleIcon sx={{ color: '#10B981' }} /> : <InfoIcon sx={{ color: document.status === 'failed' ? '#EF4444' : '#F59E0B' }} />}
                    <Box>
                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: document.status === 'completed' ? '#065F46' : (document.status === 'failed' ? '#DC2626' : '#92400E') }}>
                            {document.status === 'completed' ? 'Document processed successfully' : (document.status === 'failed' ? 'Document processing failed' : 'Document is being processed')}
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: document.status === 'completed' ? '#047857' : (document.status === 'failed' ? '#DC2626' : '#B45309') }}>
                            Confidence Score: {document.confidenceScore || '-'}% • Processed on {formatDate(document.scannedAt || document.createdAt)}
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    {/* Left Column - Preview */}
                    <Grid item xs={12} md={4}>
                        {/* Preview Card */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB', overflow: 'hidden', mb: 3 }}>
                            <Box sx={{ bgcolor: typeConfig.color, py: 1.5, px: 2 }}>
                                <Typography sx={{ color: 'white', fontSize: '13px', fontWeight: 600 }}>Document Preview</Typography>
                            </Box>
                            <CardContent sx={{ p: 2 }}>
                                {document.filePath ? (
                                    <Box
                                        onClick={() => setImageDialogOpen(true)}
                                        sx={{
                                            cursor: 'pointer',
                                            position: 'relative',
                                            '&:hover .preview-overlay': {
                                                opacity: 1
                                            }
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={getImageUrl(document.filePath)}
                                            alt="Document preview"
                                            sx={{
                                                width: '100%',
                                                borderRadius: 2,
                                                mb: 2,
                                                maxHeight: 400,
                                                objectFit: 'contain',
                                                bgcolor: '#F3F4F6'
                                            }}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        <Box
                                            className="preview-overlay"
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 16,
                                                bgcolor: 'rgba(0,0,0,0.4)',
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                opacity: 0,
                                                transition: 'opacity 0.2s ease'
                                            }}
                                        >
                                            <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
                                                Click to view full size
                                            </Typography>
                                        </Box>
                                    </Box>
                                ) : null}
                                <Box sx={{
                                    aspectRatio: '3/4',
                                    bgcolor: '#F3F4F6',
                                    borderRadius: 2,
                                    mb: 2,
                                    display: document.filePath ? 'none' : 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <ImageIcon sx={{ fontSize: 64, color: '#D1D5DB' }} />
                                </Box>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<DownloadIcon />}
                                    sx={{ bgcolor: '#6366F1', textTransform: 'none', mb: 1.5, '&:hover': { bgcolor: '#4F46E5' } }}
                                    href={document.filePath ? getImageUrl(document.filePath) : '#'}
                                    target="_blank"
                                    disabled={!document.filePath}
                                >
                                    Download Original
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Document Info */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB' }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Typography sx={{ fontSize: '13px', fontWeight: 700, mb: 2, color: '#374151' }}>Document Info</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {[
                                        { label: 'Document Type:', value: document.documentType || '-' },
                                        { label: 'File Size:', value: document.fileSize || '-' },
                                        { label: 'Processing Time:', value: document.processingTime || '-' },
                                        { label: 'Status:', value: document.status || '-' },
                                        { label: 'Saved:', value: document.saved ? 'Yes' : 'No' },
                                        { label: 'Created:', value: formatDate(document.createdAt) }
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

                    {/* Right Column - Extracted Data */}
                    <Grid item xs={12} md={8}>
                        {/* File Name Edit */}
                        {isEditing && (
                            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB', mb: 3 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography sx={{ fontSize: '14px', fontWeight: 600, mb: 2, color: '#374151' }}>Document Name</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={editedFileName}
                                        onChange={(e) => setEditedFileName(e.target.value)}
                                        placeholder="Enter document name"
                                        sx={{ '& fieldset': { borderColor: '#E5E7EB' } }}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Extracted Data */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB', mb: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: `${typeConfig.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: typeConfig.color }}>
                                            {typeConfig.icon}
                                        </Box>
                                        <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>Extracted Data</Typography>
                                    </Box>
                                    <Chip
                                        label={document.documentType || 'Document'}
                                        size="small"
                                        sx={{ bgcolor: `${typeConfig.color}15`, color: typeConfig.color, fontWeight: 600 }}
                                    />
                                </Box>

                                {editedContent && Object.keys(editedContent).length > 0 ? (
                                    <Grid container spacing={2}>
                                        {Object.entries(editedContent).map(([key, value]) => (
                                            <Grid item xs={12} sm={6} key={key}>
                                                <Typography sx={{ fontSize: '12px', color: '#4B5563', mb: 0.5, fontWeight: 500 }}>
                                                    {formatLabel(key)}
                                                </Typography>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={value || ''}
                                                    onChange={(e) => handleContentChange(key, e.target.value)}
                                                    InputProps={{
                                                        readOnly: !isEditing,
                                                        sx: { fontSize: '13px', bgcolor: isEditing ? '#fff' : '#FAFAFA' }
                                                    }}
                                                    sx={{ '& fieldset': { borderColor: '#E5E7EB' } }}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Box sx={{ py: 4, textAlign: 'center' }}>
                                        <Typography sx={{ color: '#6B7280' }}>No extracted data available</Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB' }}>
                            <CardContent sx={{ p: 2 }}>
                                <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#111827', mb: 2 }}>Actions</Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={<RefreshIcon />}
                                        onClick={() => navigate(`/upload?rescan=${id}`)}
                                        sx={{ textTransform: 'none', py: 1.5, color: '#4B5563', borderColor: '#E5E7EB', bgcolor: 'white' }}
                                    >
                                        Re-scan
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        startIcon={isDeleting ? <CircularProgress size={16} /> : <DeleteIcon />}
                                        onClick={() => setDeleteDialogOpen(true)}
                                        disabled={isDeleting}
                                        sx={{
                                            textTransform: 'none',
                                            py: 1.5,
                                            color: '#EF4444',
                                            borderColor: '#FCA5A5',
                                            bgcolor: '#FEF2F2',
                                            '&:hover': { bgcolor: '#FEE2E2' }
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => !isDeleting && setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 3, minWidth: 400 } }}>
                <DialogTitle sx={{ fontWeight: 600, color: '#DC2626' }}>Delete Document</DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: '#374151' }}>
                        Are you sure you want to delete <strong>{document?.fileName || 'this document'}</strong>?
                    </Typography>
                    <Typography sx={{ color: '#6B7280', fontSize: '14px', mt: 1 }}>
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: '#6B7280' }} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        disabled={isDeleting}
                        startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
                        sx={{ bgcolor: '#DC2626', '&:hover': { bgcolor: '#B91C1C' }, borderRadius: 2, textTransform: 'none' }}
                    >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Image Preview Dialog */}
            <Dialog
                open={imageDialogOpen}
                onClose={() => setImageDialogOpen(false)}
                maxWidth="xl"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: 'rgba(0,0,0,0.95)',
                        boxShadow: 'none',
                        borderRadius: 2,
                        maxHeight: '95vh'
                    }
                }}
            >
                <DialogTitle sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'white',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <Typography sx={{ fontWeight: 600 }}>
                        {document?.fileName || 'Document Preview'}
                    </Typography>
                    <IconButton onClick={() => setImageDialogOpen(false)} sx={{ color: 'white' }}>
                        <CancelIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    minHeight: '60vh'
                }}>
                    {document?.filePath && (
                        <Box
                            component="img"
                            src={getImageUrl(document.filePath)}
                            alt="Document full preview"
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                objectFit: 'contain',
                                borderRadius: 2
                            }}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        href={document?.filePath ? getImageUrl(document?.filePath) : '#'}
                        target="_blank"
                        sx={{ bgcolor: '#6366F1', textTransform: 'none', '&:hover': { bgcolor: '#4F46E5' } }}
                    >
                        Download Original
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => setImageDialogOpen(false)}
                        sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', textTransform: 'none' }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default ScanDetailEditPage;
