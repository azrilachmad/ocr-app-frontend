import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getProfile } from '../services/authService';
import { Box, CircularProgress } from '@mui/material';

/**
 * ProtectedRoute - Requires authentication
 * Redirects to login if not authenticated
 * Passes user data to children via cloneElement
 */
export const ProtectedRoute = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await getProfile();
                setUser(response.data);
            } catch (error) {
                setUser(null);
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

    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Redirect superadmin to admin dashboard if trying to access user pages
    if (user.role === 'superadmin' && !location.pathname.startsWith('/admin')) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    // Pass user data to children
    return React.cloneElement(children, { user });
};

/**
 * AdminRoute - Requires superadmin role
 * Redirects to dashboard if not superadmin
 */
export const AdminRoute = ({ children, user }) => {
    if (!user || user.role !== 'superadmin') {
        return <Navigate to="/dashboard" replace />;
    }
    return React.cloneElement(children, { user });
};

/**
 * PublicRoute - Only accessible when NOT authenticated
 * Redirects to appropriate dashboard based on role
 */
export const PublicRoute = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await getProfile();
                setUser(response.data);
            } catch (error) {
                setUser(null);
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

    if (user) {
        // Redirect based on role
        if (user.role === 'superadmin') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};
