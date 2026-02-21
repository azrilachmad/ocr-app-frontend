import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const PageLoader = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                width: '100%',
                gap: 2
            }}
        >
            <CircularProgress
                size={40}
                thickness={4}
                sx={{
                    color: '#6366F1',
                    animationDuration: '750ms'
                }}
            />
            <Typography
                sx={{
                    color: '#6B7280',
                    fontSize: '14px',
                    fontWeight: 500,
                    letterSpacing: '0.025em'
                }}
            >
                Loading page...
            </Typography>
        </Box>
    );
};

export default PageLoader;
