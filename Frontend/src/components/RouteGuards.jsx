import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { checkAuth } from '../services/authService';
import { Box, CircularProgress } from '@mui/material';

/**
 * ProtectedRoute - Requires authentication
 * Redirects to login if not authenticated
 */
export const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const isAuth = await checkAuth();
                setIsAuthenticated(isAuth);
            } catch (error) {
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };
        verifyAuth();
    }, []);

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
            >
                <CircularProgress sx={{ color: 'white' }} />
            </Box>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login, save the attempted location
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};

/**
 * PublicRoute - Only accessible when NOT authenticated
 * Redirects to dashboard if already authenticated
 */
export const PublicRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const isAuth = await checkAuth();
                setIsAuthenticated(isAuth);
            } catch (error) {
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };
        verifyAuth();
    }, []);

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
            >
                <CircularProgress sx={{ color: 'white' }} />
            </Box>
        );
    }

    if (isAuthenticated) {
        // Already logged in, redirect to dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};
