// src/components/ConfirmationDialog.jsx
import React from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    CircularProgress
} from '@mui/material';

const ConfirmationDialog = ({ open, onClose, onConfirm, title, message, isSubmitting }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" disabled={isSubmitting}>
          Batal
        </Button>
        <Button onClick={onConfirm} color="primary" variant="contained" autoFocus disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={24} color="inherit"/> : 'Ya, Simpan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;