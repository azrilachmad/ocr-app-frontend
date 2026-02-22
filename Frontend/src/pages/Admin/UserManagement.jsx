import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, Paper, TextField, Button, IconButton,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Avatar, Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, InputLabel, Select, MenuItem, Switch, Pagination,
    InputAdornment, Tooltip, Snackbar, Alert, CircularProgress
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Delete as DeleteIcon,
    LockReset as ResetIcon,
    Visibility as ViewIcon,
    FileCopy as FileCopyIcon
} from '@mui/icons-material';
import {
    getUsers, createUser, updateUser, deleteUser, resetUserPassword,
    getUserDocumentTypes, createUserDocumentType, updateUserDocumentType, deleteUserDocumentType
} from '../../services/adminService';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Dialog states
    const [createDialog, setCreateDialog] = useState(false);
    const [editDialog, setEditDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [resetDialog, setResetDialog] = useState(false);
    const [templatesDialog, setTemplatesDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    // Form data
    const [formData, setFormData] = useState({ email: '', password: '', name: '', role: 'user' });
    const [newPassword, setNewPassword] = useState('');

    // Templates Management State
    const [userTemplates, setUserTemplates] = useState([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [templateForm, setTemplateForm] = useState({ name: '', description: '', fields: [], active: true });

    // Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchUsers = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const response = await getUsers({
                page,
                limit: 10,
                search,
                role: roleFilter !== 'all' ? roleFilter : '',
                status: statusFilter !== 'all' ? statusFilter : ''
            });
            setUsers(response.data.users);
            setPagination(response.data.pagination);
        } catch (err) {
            showSnackbar('Failed to load users.', 'error');
        } finally {
            setLoading(false);
        }
    }, [search, roleFilter, statusFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCreate = async () => {
        try {
            setFormLoading(true);
            await createUser(formData);
            showSnackbar('User created successfully.');
            setCreateDialog(false);
            setFormData({ email: '', password: '', name: '', role: 'user' });
            fetchUsers();
        } catch (err) {
            showSnackbar(err.response?.data?.message || 'Failed to create user.', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            setFormLoading(true);
            await updateUser(selectedUser.id, formData);
            showSnackbar('User updated successfully.');
            setEditDialog(false);
            fetchUsers();
        } catch (err) {
            showSnackbar(err.response?.data?.message || 'Failed to update user.', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setFormLoading(true);
            await deleteUser(selectedUser.id);
            showSnackbar('User deleted successfully.');
            setDeleteDialog(false);
            fetchUsers();
        } catch (err) {
            showSnackbar(err.response?.data?.message || 'Failed to delete user.', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const handleResetPassword = async () => {
        try {
            setFormLoading(true);
            await resetUserPassword(selectedUser.id, newPassword);
            showSnackbar('Password reset successfully.');
            setResetDialog(false);
            setNewPassword('');
        } catch (err) {
            showSnackbar(err.response?.data?.message || 'Failed to reset password.', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const handleToggleActive = async (user) => {
        try {
            await updateUser(user.id, { isActive: !user.isActive });
            showSnackbar(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully.`);
            fetchUsers(pagination.page);
        } catch (err) {
            showSnackbar('Failed to update user status.', 'error');
        }
    };

    const openEditDialog = (user) => {
        setSelectedUser(user);
        setFormData({ name: user.name || '', email: user.email, role: user.role });
        setEditDialog(true);
    };

    const openTemplatesDialog = async (user) => {
        setSelectedUser(user);
        setTemplatesDialog(true);
        setLoadingTemplates(true);
        try {
            const response = await getUserDocumentTypes(user.id);
            setUserTemplates(response.data.map(dt => ({
                ...dt,
                fields: typeof dt.fields === 'string' ? JSON.parse(dt.fields) : dt.fields
            })));
        } catch (error) {
            showSnackbar('Failed to load user document types.', 'error');
        } finally {
            setLoadingTemplates(false);
        }
    };

    const handleSaveTemplate = async () => {
        try {
            setFormLoading(true);
            if (editingTemplate) {
                const response = await updateUserDocumentType(selectedUser.id, editingTemplate.id, templateForm);
                setUserTemplates(prev => prev.map(dt => dt.id === editingTemplate.id ? {
                    ...response.data,
                    fields: typeof response.data.fields === 'string' ? JSON.parse(response.data.fields) : response.data.fields
                } : dt));
                showSnackbar('Document template updated.');
            } else {
                const response = await createUserDocumentType(selectedUser.id, templateForm);
                setUserTemplates(prev => [...prev, {
                    ...response.data,
                    fields: typeof response.data.fields === 'string' ? JSON.parse(response.data.fields) : response.data.fields
                }]);
                showSnackbar('Document template created.');
            }
            setEditingTemplate(null);
            setTemplateForm({ name: '', description: '', fields: [], active: true });
        } catch (err) {
            showSnackbar(err.response?.data?.message || 'Failed to save template.', 'error');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteTemplate = async (templateId) => {
        if (!window.confirm('Are you sure you want to delete this document type?')) return;
        try {
            await deleteUserDocumentType(selectedUser.id, templateId);
            setUserTemplates(prev => prev.filter(dt => dt.id !== templateId));
            showSnackbar('Document template deleted.');
        } catch (err) {
            showSnackbar('Failed to delete template.', 'error');
        }
    };

    // Helper to edit a template inline
    const handleEditTemplateForm = (template) => {
        setEditingTemplate(template);
        setTemplateForm({
            name: template.name,
            description: template.description || '',
            fields: template.fields || [],
            active: template.active
        });
    };

    const handleCancelTemplateEdit = () => {
        setEditingTemplate(null);
        setTemplateForm({ name: '', description: '', fields: [], active: true });
    };

    // Helper for fields
    const addField = () => {
        setTemplateForm(prev => ({
            ...prev,
            fields: [...prev.fields, { name: '', required: false }]
        }));
    };

    const updateField = (index, key, value) => {
        const newFields = [...templateForm.fields];
        newFields[index] = { ...newFields[index], [key]: value };
        setTemplateForm({ ...templateForm, fields: newFields });
    };

    const removeField = (index) => {
        const newFields = [...templateForm.fields];
        newFields.splice(index, 1);
        setTemplateForm(prev => ({ ...prev, fields: newFields }));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, pt: { xs: 11, md: 13 } }}>
            {/* Header Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setFormData({ email: '', password: '', name: '', role: 'user' });
                        setCreateDialog(true);
                    }}
                    sx={{
                        bgcolor: '#6366F1', borderRadius: 2, textTransform: 'none', fontWeight: 600,
                        '&:hover': { bgcolor: '#4F46E5' }
                    }}
                >
                    Add User
                </Button>
            </Box>

            {/* Filters */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #E5E7EB', display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                    size="small"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#9CA3AF' }} /></InputAdornment>
                    }}
                    sx={{ minWidth: 250, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Role</InputLabel>
                    <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} label="Role" sx={{ borderRadius: 2 }}>
                        <MenuItem value="all">All Roles</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="user">User</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} label="Status" sx={{ borderRadius: 2 }}>
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                </FormControl>
            </Paper>

            {/* Users Table */}
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>User</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Role</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Last Login</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }}>Registered</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#6B7280', fontSize: '13px' }} align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} sx={{ color: '#6366F1' }} />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <Typography sx={{ color: '#9CA3AF' }}>No users found</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id} sx={{ '&:hover': { bgcolor: '#F9FAFB' } }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Avatar sx={{ width: 36, height: 36, bgcolor: '#6366F1', fontSize: '14px' }}>
                                                    {(user.name || user.email)?.[0]?.toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{user.name || '-'}</Typography>
                                                    <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>{user.email}</Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip label={user.role} size="small" sx={{
                                                bgcolor: user.role === 'admin' ? '#EDE9FE' : '#F3F4F6',
                                                color: user.role === 'admin' ? '#7C3AED' : '#374151',
                                                fontWeight: 500, fontSize: '12px', height: 24,
                                            }} />
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={user.isActive}
                                                onChange={() => handleToggleActive(user)}
                                                size="small"
                                                sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#10B981' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#10B981' } }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>{formatDate(user.lastLoginAt)}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>{formatDate(user.createdAt)}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Manage Templates"><IconButton size="small" onClick={() => openTemplatesDialog(user)}><FileCopyIcon sx={{ fontSize: 18, color: '#10B981' }} /></IconButton></Tooltip>
                                            <Tooltip title="Edit"><IconButton size="small" onClick={() => openEditDialog(user)}><EditIcon sx={{ fontSize: 18, color: '#6B7280' }} /></IconButton></Tooltip>
                                            <Tooltip title="Reset Password"><IconButton size="small" onClick={() => { setSelectedUser(user); setResetDialog(true); }}><ResetIcon sx={{ fontSize: 18, color: '#F59E0B' }} /></IconButton></Tooltip>
                                            <Tooltip title="Delete"><IconButton size="small" onClick={() => { setSelectedUser(user); setDeleteDialog(true); }}><DeleteIcon sx={{ fontSize: 18, color: '#EF4444' }} /></IconButton></Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {pagination.totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderTop: '1px solid #E5E7EB' }}>
                        <Pagination
                            count={pagination.totalPages}
                            page={pagination.page}
                            onChange={(_, page) => fetchUsers(page)}
                            color="primary"
                        />
                    </Box>
                )}
            </Paper>

            {/* Create User Dialog */}
            <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 600 }}>Create New User</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
                    <TextField label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth size="small" />
                    <TextField label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} fullWidth size="small" required />
                    <TextField label="Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} fullWidth size="small" required helperText="Min. 6 characters" />
                    <FormControl fullWidth size="small">
                        <InputLabel>Role</InputLabel>
                        <Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} label="Role">
                            <MenuItem value="user">User</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setCreateDialog(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained" disabled={formLoading || !formData.email || !formData.password}
                        sx={{ bgcolor: '#6366F1', textTransform: 'none', '&:hover': { bgcolor: '#4F46E5' } }}>
                        {formLoading ? <CircularProgress size={20} /> : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 600 }}>Edit User</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
                    <TextField label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth size="small" />
                    <TextField label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} fullWidth size="small" />
                    <FormControl fullWidth size="small">
                        <InputLabel>Role</InputLabel>
                        <Select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} label="Role">
                            <MenuItem value="user">User</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setEditDialog(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button onClick={handleUpdate} variant="contained" disabled={formLoading}
                        sx={{ bgcolor: '#6366F1', textTransform: 'none', '&:hover': { bgcolor: '#4F46E5' } }}>
                        {formLoading ? <CircularProgress size={20} /> : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 600 }}>Delete User</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete <strong>{selectedUser?.name || selectedUser?.email}</strong>? This action cannot be undone. All documents and settings will be removed.</Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setDeleteDialog(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button onClick={handleDelete} variant="contained" disabled={formLoading} color="error" sx={{ textTransform: 'none' }}>
                        {formLoading ? <CircularProgress size={20} /> : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reset Password Dialog */}
            <Dialog open={resetDialog} onClose={() => setResetDialog(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 600 }}>Reset Password</DialogTitle>
                <DialogContent sx={{ pt: '16px !important' }}>
                    <Typography sx={{ mb: 2, color: '#6B7280', fontSize: '14px' }}>
                        Reset password for <strong>{selectedUser?.name || selectedUser?.email}</strong>
                    </Typography>
                    <TextField
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        fullWidth size="small"
                        helperText="Min. 6 characters"
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => { setResetDialog(false); setNewPassword(''); }} sx={{ textTransform: 'none' }}>Cancel</Button>
                    <Button onClick={handleResetPassword} variant="contained" disabled={formLoading || newPassword.length < 6}
                        sx={{ bgcolor: '#F59E0B', textTransform: 'none', '&:hover': { bgcolor: '#D97706' } }}>
                        {formLoading ? <CircularProgress size={20} /> : 'Reset Password'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Manage Templates Dialog */}
            <Dialog open={templatesDialog} onClose={() => setTemplatesDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}>
                <DialogTitle sx={{ fontWeight: 600 }}>Manage Templates for {selectedUser?.name || selectedUser?.email}</DialogTitle>
                <DialogContent dividers sx={{ pt: '16px !important', bgcolor: '#F9FAFB' }}>
                    {loadingTemplates ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={30} /></Box>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                            {/* Template Form (Create / Edit) */}
                            <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB', elevation: 0 }}>
                                <Typography sx={{ mb: 2, fontWeight: 600, fontSize: '15px' }}>
                                    {editingTemplate ? `Edit Template: ${editingTemplate.name}` : 'Create New Template'}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <TextField label="Template Name" size="small" value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} fullWidth required />
                                    <TextField label="Description" size="small" value={templateForm.description} onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })} fullWidth multiline rows={2} />

                                    <Box sx={{ mt: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                            <Typography sx={{ fontWeight: 500, fontSize: '14px', color: '#374151' }}>Extracted Fields</Typography>
                                            <Button size="small" startIcon={<AddIcon />} onClick={addField} sx={{ textTransform: 'none' }}>Add Field</Button>
                                        </Box>
                                        {templateForm.fields.length === 0 ? (
                                            <Typography sx={{ color: '#9CA3AF', fontSize: '13px', fontStyle: 'italic' }}>No fields defined. Add fields that the AI should extract from this document type.</Typography>
                                        ) : (
                                            templateForm.fields.map((field, idx) => (
                                                <Box key={idx} sx={{ display: 'flex', gap: 1.5, mb: 1.5, alignItems: 'center' }}>
                                                    <TextField size="small" value={field.name} onChange={(e) => updateField(idx, 'name', e.target.value)} placeholder="Field Name (e.g. NIK, Total Amount)" fullWidth />
                                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                                        <Select value={field.required ? 'true' : 'false'} onChange={(e) => updateField(idx, 'required', e.target.value === 'true')}>
                                                            <MenuItem value="true">Required</MenuItem>
                                                            <MenuItem value="false">Optional</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                    <IconButton size="small" color="error" onClick={() => removeField(idx)}><DeleteIcon fontSize="small" /></IconButton>
                                                </Box>
                                            ))
                                        )}
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                                        {editingTemplate && (
                                            <Button size="small" onClick={handleCancelTemplateEdit} sx={{ textTransform: 'none' }}>Cancel Edit</Button>
                                        )}
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={handleSaveTemplate}
                                            disabled={!templateForm.name.trim() || formLoading}
                                            sx={{ textTransform: 'none', bgcolor: '#6366F1' }}
                                        >
                                            {formLoading ? <CircularProgress size={16} /> : (editingTemplate ? 'Update Template' : 'Add Template')}
                                        </Button>
                                    </Box>
                                </Box>
                            </Paper>

                            {/* Existing Templates List */}
                            <Box>
                                <Typography sx={{ mb: 2, fontWeight: 600, fontSize: '15px' }}>Existing Templates ({userTemplates.length})</Typography>
                                {userTemplates.length === 0 ? (
                                    <Typography sx={{ color: '#6B7280', fontSize: '14px' }}>This user has no document templates configured.</Typography>
                                ) : (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        {userTemplates.map(template => (
                                            <Paper key={template.id} sx={{ p: 2, borderRadius: 2, border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#1F2937' }}>{template.name}</Typography>
                                                    <Typography sx={{ fontSize: '12px', color: '#6B7280' }}>
                                                        {template.description || 'No description'} • {template.fields?.length || 0} fields
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" onClick={() => handleEditTemplateForm(template)} disabled={editingTemplate?.id === template.id}>
                                                            <EditIcon sx={{ fontSize: 18, color: '#6366F1' }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" onClick={() => handleDeleteTemplate(template.id)}>
                                                            <DeleteIcon sx={{ fontSize: 18, color: '#EF4444' }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Paper>
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
                    <Button onClick={() => setTemplatesDialog(false)} variant="outlined" sx={{ textTransform: 'none' }}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UserManagement;
