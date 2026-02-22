import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, TextField, Switch, FormControlLabel,
    Button, Skeleton, Snackbar, Alert, Divider, Chip, InputAdornment
} from '@mui/material';
import {
    Save as SaveIcon,
    CloudUpload as UploadIcon,
    InsertDriveFile as FileIcon,
    Schedule as ScheduleIcon,
    Speed as SpeedIcon,
    SmartToy as AiIcon,
    Build as BuildIcon
} from '@mui/icons-material';
import { getSystemConfig, updateSystemConfig } from '../../services/adminService';

const CONFIG_META = {
    max_upload_size: { label: 'Max Upload Size', icon: <UploadIcon />, suffix: 'MB', color: '#6366F1', type: 'number' },
    allowed_file_types: { label: 'Allowed File Types', icon: <FileIcon />, suffix: '', color: '#8B5CF6', type: 'text' },
    max_scans_per_day: { label: 'Max Scans Per Day', icon: <SpeedIcon />, suffix: 'scans', color: '#EC4899', type: 'number' },
    auto_delete_unsaved_days: { label: 'Auto-Delete Unsaved After', icon: <ScheduleIcon />, suffix: 'days', color: '#F59E0B', type: 'number' },
    default_ai_model: { label: 'Default AI Model', icon: <AiIcon />, suffix: '', color: '#10B981', type: 'text' },
    maintenance_mode: { label: 'Maintenance Mode', icon: <BuildIcon />, suffix: '', color: '#EF4444', type: 'boolean' }
};

const SystemSettings = () => {
    const [configs, setConfigs] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const response = await getSystemConfig();
            const configMap = {};
            response.data.forEach(c => { configMap[c.key] = c.value; });
            setConfigs(configMap);
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to load system configuration.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setConfigs(prev => ({ ...prev, [key]: value }));
        setDirty(true);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateSystemConfig(configs);
            setDirty(false);
            setSnackbar({ open: true, message: 'Configuration saved successfully!', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to save configuration.', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const renderConfigField = (key) => {
        const meta = CONFIG_META[key];
        if (!meta) return null;
        const value = configs[key] || '';

        if (meta.type === 'boolean') {
            return (
                <Paper key={key} elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{
                                width: 44, height: 44, borderRadius: 1.5,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                bgcolor: `${meta.color}15`, color: meta.color
                            }}>
                                {meta.icon}
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F2937' }}>
                                    {meta.label}
                                </Typography>
                                <Typography sx={{ fontSize: '12px', color: '#9CA3AF' }}>
                                    {value === 'true' ? 'Enabled — scanning is disabled for all users' : 'Disabled — system running normally'}
                                </Typography>
                            </Box>
                        </Box>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={value === 'true'}
                                    onChange={(e) => handleChange(key, String(e.target.checked))}
                                    color="error"
                                />
                            }
                            label=""
                        />
                    </Box>
                </Paper>
            );
        }

        return (
            <Paper key={key} elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #E5E7EB' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{
                        width: 44, height: 44, borderRadius: 1.5,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: `${meta.color}15`, color: meta.color
                    }}>
                        {meta.icon}
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#1F2937' }}>
                            {meta.label}
                        </Typography>
                    </Box>
                </Box>
                <TextField
                    fullWidth
                    size="small"
                    type={meta.type}
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                    InputProps={{
                        endAdornment: meta.suffix ? (
                            <InputAdornment position="end">
                                <Typography sx={{ fontSize: '13px', color: '#9CA3AF' }}>{meta.suffix}</Typography>
                            </InputAdornment>
                        ) : null
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: '#F9FAFB' } }}
                />
                {key === 'allowed_file_types' && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1.5 }}>
                        {value.split(',').filter(Boolean).map(ext => (
                            <Chip key={ext} label={`.${ext.trim()}`} size="small"
                                sx={{ bgcolor: '#EDE9FE', color: '#7C3AED', fontWeight: 500, fontSize: '11px', height: 22 }} />
                        ))}
                    </Box>
                )}
            </Paper>
        );
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, pt: { xs: 11, md: 13 } }}>
            {/* Save Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={!dirty || saving}
                    sx={{
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 600,
                        bgcolor: '#7C3AED',
                        '&:hover': { bgcolor: '#6D28D9' }
                    }}
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </Box>

            {/* Config Fields */}
            {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Skeleton key={i} variant="rounded" height={90} sx={{ borderRadius: 2 }} />
                    ))}
                </Box>
            ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    {Object.keys(CONFIG_META).map(key => renderConfigField(key))}
                </Box>
            )}

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}
                    sx={{ borderRadius: 2 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SystemSettings;
