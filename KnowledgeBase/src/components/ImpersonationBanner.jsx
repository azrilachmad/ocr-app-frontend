import React, { useState } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import api from '../services/api';
import { useAuth } from '../App';

const ImpersonationBanner = () => {
    const { user } = useAuth();
    const [openDialog, setOpenDialog] = useState(false);

    if (!user || (!user.isImpersonating)) return null;

    const impersonatedUser = user.name || 'User';
    const adminName = user.impersonator?.name || 'Super Admin';

    const handleConfirmStop = async () => {
        try {
            await api.post('/admin/stop-impersonate');
            await api.post('/auth/logout');
            // Assuming the Synchro Scan is running at the same base origin on port 3000
            window.location.href = '/';
        } catch (error) {
            console.error('Failed to stop impersonating', error);
            window.location.href = '/';
        }
    };

    return (
        <>
            <Box
                sx={{
                    backgroundColor: '#FFB800',
                    color: '#000',
                    padding: '8px 24px',
                    height: '48px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 100000,
                    flexShrink: 0,
                    position: 'relative'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SwapHorizIcon fontSize="small" />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Sedang impersonate sebagai <strong>{impersonatedUser}</strong> (admin: {adminName})
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    size="small"
                    onClick={() => setOpenDialog(true)}
                    sx={{
                        backgroundColor: '#FFF',
                        color: '#000',
                        fontWeight: 600,
                        textTransform: 'none',
                        boxShadow: 'none',
                        '&:hover': {
                            backgroundColor: '#F3F4F6',
                            boxShadow: 'none'
                        }
                    }}
                >
                    Berhenti Impersonate
                </Button>
            </Box>

            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
            >
                <DialogTitle>Konfirmasi Berhenti Impersonate</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Apakah Anda yakin ingin mengakhiri sesi impersonate ini dan logout dari sistem?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="inherit">Batal</Button>
                    <Button onClick={handleConfirmStop} variant="contained" color="primary" autoFocus>
                        Ya, Berhenti & Logout
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ImpersonationBanner;
