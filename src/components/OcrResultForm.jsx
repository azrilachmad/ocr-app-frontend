// src/components/OcrResultForm.jsx
import React from 'react';
import InvoiceForm from './forms/InvoiceForm';
import StnkForm from './forms/StnkForm';
import BpkbForm from './forms/BpkbForm';
import { Box, Typography } from '@mui/material';

const OcrResultForm = ({ ocrResponse, handleDataChange, handleItemChange }) => {
    if (!ocrResponse) return null;
    const { document_type, content } = ocrResponse;

    switch (document_type) {
        case 'INVOICE':
            return <InvoiceForm data={content} handleDataChange={handleDataChange} handleItemChange={handleItemChange} />;
        case 'STNK':
            return <StnkForm data={content} handleDataChange={handleDataChange} />;
        case 'BPKB':
            return <BpkbForm data={content} handleDataChange={handleDataChange} />;
        default:
            return (
                <Box>
                    <Typography color="error">Tampilan form untuk tipe '{document_type}' belum tersedia.</Typography>
                    <pre>{JSON.stringify(content, null, 2)}</pre>
                </Box>
            );
    }
};
export default OcrResultForm;