import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    IconButton,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Collapse,
    Checkbox,
    Chip,
    CircularProgress,
    Divider
} from '@mui/material';
import {
    Psychology as AiIcon,
    Description as DocumentIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import {
    getDocumentTypes,
    createDocumentType,
    updateDocumentType as updateDocTypeApi,
    deleteDocumentType as deleteDocTypeApi
} from '../../services/apiService';

// Default document types (fallback if API fails)
const defaultDocumentTypes = [
    {
        id: 1,
        name: 'KTP (Kartu Tanda Penduduk)',
        description: 'Indonesian Identity Card',
        active: true,
        fields: [
            { name: 'NIK', required: true },
            { name: 'Nama Lengkap', required: true },
            { name: 'Tempat Lahir', required: false },
            { name: 'Tanggal Lahir', required: true },
            { name: 'Jenis Kelamin', required: true },
            { name: 'Alamat', required: true },
        ]
    },
    {
        id: 2,
        name: 'KK (Kartu Keluarga)',
        description: 'Family Card',
        active: true,
        fields: [
            { name: 'No. KK', required: true },
            { name: 'Nama Kepala Keluarga', required: true },
            { name: 'Alamat', required: true },
        ]
    },
    {
        id: 3,
        name: 'STNK (Surat Tanda Nomor Kendaraan)',
        description: 'Vehicle Registration',
        active: true,
        fields: [
            { name: 'No. Polisi', required: true },
            { name: 'Nama Pemilik', required: true },
            { name: 'Merk', required: true },
        ]
    },
    {
        id: 4,
        name: 'BPKB (Buku Pemilik Kendaraan Bermotor)',
        description: 'Vehicle Ownership Book',
        active: true,
        fields: [
            { name: 'No. BPKB', required: true },
            { name: 'No. Polisi', required: true },
            { name: 'Nama Pemilik', required: true },
        ]
    }
];

const SettingsPage = () => {
    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingDocType, setIsSavingDocType] = useState(false);
    const [isDeletingDocType, setIsDeletingDocType] = useState(false);

    // Document Types State
    const [documentTypes, setDocumentTypes] = useState([]);
    const [expandedDocTypes, setExpandedDocTypes] = useState({});
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingDocType, setEditingDocType] = useState(null);
    const [newDocType, setNewDocType] = useState({ name: '', description: '', fields: [] });
    const [newFieldName, setNewFieldName] = useState('');
    const [newFieldRequired, setNewFieldRequired] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [docTypeToDelete, setDocTypeToDelete] = useState(null);

    // Snackbar state
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Fetch document types on mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const docTypesData = await getDocumentTypes();
                if (docTypesData && docTypesData.length > 0) {
                    setDocumentTypes(docTypesData.map(dt => ({
                        ...dt,
                        fields: typeof dt.fields === 'string' ? JSON.parse(dt.fields) : (dt.fields || [])
                    })));
                } else {
                    setDocumentTypes(defaultDocumentTypes);
                }
            } catch (error) {
                console.error('Failed to fetch document types:', error);
                setDocumentTypes(defaultDocumentTypes);
            }
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Document Type handlers
    const toggleDocTypeExpand = (id) => {
        setExpandedDocTypes(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleDocTypeActive = async (docType) => {
        try {
            const updated = await updateDocTypeApi(docType.id, { active: !docType.active });
            setDocumentTypes(prev => prev.map(dt =>
                dt.id === docType.id ? { ...updated, fields: typeof updated.fields === 'string' ? JSON.parse(updated.fields) : updated.fields } : dt
            ));
        } catch (error) {
            setSnackbar({ open: true, message: error.message, severity: 'error' });
        }
    };

    const handleOpenDialog = (docType = null) => {
        if (docType) {
            setEditingDocType(docType);
            setNewDocType({ name: docType.name, description: docType.description, fields: [...docType.fields] });
        } else {
            setEditingDocType(null);
            setNewDocType({ name: '', description: '', fields: [] });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingDocType(null);
        setNewDocType({ name: '', description: '', fields: [] });
        setNewFieldName('');
        setNewFieldRequired(false);
    };

    const handleAddField = () => {
        if (newFieldName.trim()) {
            setNewDocType(prev => ({
                ...prev,
                fields: [...prev.fields, { name: newFieldName.trim(), required: newFieldRequired }]
            }));
            setNewFieldName('');
            setNewFieldRequired(false);
        }
    };

    const handleRemoveField = (index) => {
        setNewDocType(prev => ({
            ...prev,
            fields: prev.fields.filter((_, i) => i !== index)
        }));
    };

    const handleSaveDocType = async () => {
        if (!newDocType.name.trim()) {
            setSnackbar({ open: true, message: 'Document type name is required', severity: 'error' });
            return;
        }

        setIsSavingDocType(true);
        try {
            if (editingDocType) {
                const updated = await updateDocTypeApi(editingDocType.id, {
                    name: newDocType.name,
                    description: newDocType.description,
                    fields: newDocType.fields
                });
                setDocumentTypes(prev => prev.map(dt =>
                    dt.id === editingDocType.id ? { ...updated, fields: typeof updated.fields === 'string' ? JSON.parse(updated.fields) : updated.fields } : dt
                ));
                setSnackbar({ open: true, message: 'Document type updated successfully!', severity: 'success' });
            } else {
                const created = await createDocumentType({
                    name: newDocType.name,
                    description: newDocType.description,
                    fields: newDocType.fields,
                    active: true
                });
                setDocumentTypes(prev => [...prev, { ...created, fields: typeof created.fields === 'string' ? JSON.parse(created.fields) : created.fields }]);
                setSnackbar({ open: true, message: 'Document type created successfully!', severity: 'success' });
            }
            handleCloseDialog();
        } catch (error) {
            setSnackbar({ open: true, message: error.message, severity: 'error' });
        } finally {
            setIsSavingDocType(false);
        }
    };

    const handleDeleteDocType = async (id) => {
        setIsDeletingDocType(true);
        try {
            await deleteDocTypeApi(id);
            setDocumentTypes(prev => prev.filter(dt => dt.id !== id));
            setSnackbar({ open: true, message: 'Document type deleted', severity: 'info' });
            setDeleteConfirmOpen(false);
            setDocTypeToDelete(null);
        } catch (error) {
            setSnackbar({ open: true, message: error.message, severity: 'error' });
        } finally {
            setIsDeletingDocType(false);
        }
    };

    const handleOpenDeleteConfirm = (docType) => {
        setDocTypeToDelete(docType);
        setDeleteConfirmOpen(true);
    };

    const handleCloseDeleteConfirm = () => {
        setDeleteConfirmOpen(false);
        setDocTypeToDelete(null);
    };

    if (isLoading) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB', pt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <CircularProgress sx={{ color: '#6366F1' }} />
                </Box>
            </Box>
        );
    }

    return (
        <>
            <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB', pt: 3, mt: 8 }}>

                <Container maxWidth="lg" sx={{ py: 4 }}>


                    {/* Info Banner */}
                    <Box sx={{
                        p: 2.5, mb: 3, borderRadius: 3,
                        bgcolor: '#EEF2FF', border: '1px solid #C7D2FE',
                        display: 'flex', alignItems: 'center', gap: 2
                    }}>
                        <Box sx={{
                            width: 40, height: 40, borderRadius: 1,
                            bgcolor: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <AiIcon sx={{ color: 'white' }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                                AI Configuration are managed by Super Admin
                            </Typography>
                            <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>
                                AI Configuration, API Key, Confidence Threshold, and Language Detection are managed by Super Admin.
                            </Typography>
                        </Box>
                    </Box>

                    {/* Document Type Configuration Section */}
                    <Card elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 3 }}>
                        <CardContent sx={{ p: 4 }}>
                            {/* Section Header */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 1,
                                            bgcolor: '#FEF3C7',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <DocumentIcon sx={{ color: '#F59E0B' }} />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                                            Document Type Configuration
                                        </Typography>
                                        <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>
                                            Configure data fields for each document type
                                        </Typography>
                                    </Box>
                                </Box>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => handleOpenDialog()}
                                    sx={{
                                        bgcolor: '#10B981',
                                        textTransform: 'none',
                                        px: 2.5,
                                        py: 1,
                                        '&:hover': { bgcolor: '#059669' }
                                    }}
                                >
                                    Add Document Type
                                </Button>
                            </Box>

                            {/* Document Types List */}
                            {documentTypes.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography sx={{ color: '#6B7280' }}>No document types configured</Typography>
                                </Box>
                            ) : (
                                documentTypes.map((docType) => (
                                    <Box key={docType.id} sx={{ mb: 2 }}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                p: 2,
                                                bgcolor: '#F9FAFB',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: expandedDocTypes[docType.id] ? '8px 8px 0 0' : 2,
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => toggleDocTypeExpand(docType.id)}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <IconButton size="small">
                                                    {expandedDocTypes[docType.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                </IconButton>
                                                <Box>
                                                    <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>
                                                        {docType.name}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>
                                                        {docType.description} - {docType.fields?.length || 0} fields configured
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} onClick={(e) => e.stopPropagation()}>
                                                <Chip
                                                    label={docType.active ? 'Active' : 'Inactive'}
                                                    size="small"
                                                    onClick={() => toggleDocTypeActive(docType)}
                                                    sx={{
                                                        bgcolor: docType.active ? '#DCFCE7' : '#F3F4F6',
                                                        color: docType.active ? '#16A34A' : '#6B7280',
                                                        fontWeight: 500,
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                                <IconButton size="small" onClick={() => handleOpenDialog(docType)}>
                                                    <EditIcon fontSize="small" sx={{ color: '#6366F1' }} />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => handleOpenDeleteConfirm(docType)}>
                                                    <DeleteIcon fontSize="small" sx={{ color: '#DC2626' }} />
                                                </IconButton>
                                            </Box>
                                        </Box>

                                        <Collapse in={expandedDocTypes[docType.id]}>
                                            <Box sx={{
                                                p: 3,
                                                border: '1px solid #E5E7EB',
                                                borderTop: 'none',
                                                borderRadius: '0 0 8px 8px',
                                                bgcolor: 'white'
                                            }}>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                                                    {(docType.fields || []).map((field, index) => (
                                                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Checkbox
                                                                checked
                                                                size="small"
                                                                sx={{
                                                                    color: '#6366F1',
                                                                    '&.Mui-checked': { color: '#6366F1' }
                                                                }}
                                                            />
                                                            <Typography sx={{ fontSize: '14px', color: '#374151' }}>
                                                                {field.name}
                                                            </Typography>
                                                            <Chip
                                                                label={field.required ? 'Required' : 'Optional'}
                                                                size="small"
                                                                sx={{
                                                                    ml: 'auto',
                                                                    fontSize: '11px',
                                                                    height: 22,
                                                                    bgcolor: field.required ? '#FEE2E2' : '#F3F4F6',
                                                                    color: field.required ? '#DC2626' : '#6B7280'
                                                                }}
                                                            />
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>
                                        </Collapse>
                                    </Box>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </Container>
            </Box>

            {/* Add/Edit Document Type Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>
                    {editingDocType ? 'Edit Document Type' : 'Add New Document Type'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            fullWidth
                            label="Document Type Name"
                            value={newDocType.name}
                            onChange={(e) => setNewDocType({ ...newDocType, name: e.target.value })}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            value={newDocType.description}
                            onChange={(e) => setNewDocType({ ...newDocType, description: e.target.value })}
                            sx={{ mb: 3 }}
                        />

                        <Divider sx={{ mb: 2 }} />

                        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#111827', mb: 2 }}>
                            Fields ({newDocType.fields.length})
                        </Typography>

                        {/* Add Field Input */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField
                                size="small"
                                placeholder="Field name"
                                value={newFieldName}
                                onChange={(e) => setNewFieldName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddField()}
                                sx={{ flex: 1 }}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Checkbox
                                    size="small"
                                    checked={newFieldRequired}
                                    onChange={(e) => setNewFieldRequired(e.target.checked)}
                                />
                                <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>Required</Typography>
                            </Box>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleAddField}
                                sx={{ textTransform: 'none' }}
                            >
                                Add
                            </Button>
                        </Box>

                        {/* Fields List */}
                        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                            {newDocType.fields.map((field, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        p: 1.5,
                                        bgcolor: '#F9FAFB',
                                        borderRadius: 1,
                                        mb: 1
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Checkbox checked size="small" sx={{ color: '#6366F1', '&.Mui-checked': { color: '#6366F1' } }} />
                                        <Typography sx={{ fontSize: '14px' }}>{field.name}</Typography>
                                        <Chip
                                            label={field.required ? 'Required' : 'Optional'}
                                            size="small"
                                            sx={{
                                                fontSize: '11px',
                                                height: 20,
                                                bgcolor: field.required ? '#FEE2E2' : '#E5E7EB',
                                                color: field.required ? '#DC2626' : '#6B7280'
                                            }}
                                        />
                                    </Box>
                                    <IconButton size="small" onClick={() => handleRemoveField(index)}>
                                        <DeleteIcon fontSize="small" sx={{ color: '#DC2626' }} />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={handleCloseDialog} sx={{ textTransform: 'none', color: '#6B7280' }} disabled={isSavingDocType}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveDocType}
                        disabled={isSavingDocType}
                        startIcon={isSavingDocType ? <CircularProgress size={16} color="inherit" /> : null}
                        sx={{ textTransform: 'none', bgcolor: '#6366F1', '&:hover': { bgcolor: '#5558E3' } }}
                    >
                        {isSavingDocType ? 'Saving...' : (editingDocType ? 'Save Changes' : 'Create Document Type')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 600, color: '#DC2626' }}>
                    Delete Document Type
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ color: '#374151' }}>
                        Are you sure you want to delete <strong>{docTypeToDelete?.name}</strong>? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={handleCloseDeleteConfirm} sx={{ textTransform: 'none', color: '#6B7280' }} disabled={isDeletingDocType}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => handleDeleteDocType(docTypeToDelete?.id)}
                        disabled={isDeletingDocType}
                        startIcon={isDeletingDocType ? <CircularProgress size={16} color="inherit" /> : null}
                        sx={{
                            textTransform: 'none',
                            bgcolor: '#DC2626',
                            '&:hover': { bgcolor: '#B91C1C' }
                        }}
                    >
                        {isDeletingDocType ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

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
        </>
    );
};

export default SettingsPage;
