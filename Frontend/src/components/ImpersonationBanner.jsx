import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import api from '../services/authService';

const ImpersonationBanner = ({ user }) => {
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        if (!user || (!user.isImpersonating)) return;
        
        const style = document.createElement('style');
        style.innerHTML = `
            body .MuiAppBar-root { top: 48px !important; }
            body .MuiDrawer-paper { top: 48px !important; height: calc(100% - 48px) !important; }
            main { margin-top: 48px !important; }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, [user]);

    if (!user || (!user.isImpersonating)) return null;

    const impersonatedUser = user.name || 'User'; 
    const adminName = user.impersonator?.name || 'Super Admin';

    const handleConfirmStop = async () => {
        try {
            await api.post('/admin/stop-impersonate');
            await api.post('/auth/logout');
            window.location.href = '/login';
        } catch (error) {
            console.error('Failed to stop impersonating', error);
            window.location.href = '/login';
        }
    };

    return (
        <>
            <Box 
                sx={{ 
                    position: 'fixed',
                    top: 0, left: 0, right: 0,
                    height: '48px',
                    backgroundColor: '#FFB800', 
                    color: '#000',
                    padding: '8px 24px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    zIndex: 100000,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
