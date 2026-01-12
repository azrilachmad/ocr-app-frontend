import React from 'react';
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText, Divider, useTheme, useMediaQuery } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const DetailRow = ({ label, value }) => (
    <Box sx={{ display: 'flex', mb: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 'bold', width: '180px', flexShrink: 0 }}>{label}</Typography>
        <Typography variant="body1" sx={{ mr: 1 }}>:</Typography>
        <Typography variant="body1" color="text.secondary">{value ?? '-'}</Typography>
    </Box>
);

const GeneralInsightDisplay = ({ data }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    return (
        <Box>
            <Typography variant="h6" gutterBottom>Ringkasan</Typography>
            <Typography variant="body1" paragraph>{data.ringkasan || data.summary || 'Tidak ada ringkasan.'}</Typography>
            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>Poin-Poin Kunci</Typography>
            <List dense>
                {(data.poin_kunci || data.key_points)?.map((point, index) => (
                    <ListItem key={index} disableGutters>
                        <ListItemIcon sx={{ minWidth: '32px' }}><CheckCircleOutlineIcon color="primary" fontSize="small" /></ListItemIcon>
                        <ListItemText primary={point} />
                    </ListItem>
                ))}
            </List>
            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>Meta Dokumen</Typography>
            <DetailRow label="Kemungkinan Tipe" value={data.meta_dokumen?.possible_document_type} />
            <DetailRow label="Kemungkinan Penulis" value={data.meta_dokumen?.kemungkinan_penulis || data.meta_dokumen?.possible_author} />
        </Box>
    );
};

export default GeneralInsightDisplay;