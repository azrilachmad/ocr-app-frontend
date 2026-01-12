import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    InputAdornment,
    IconButton,
    Checkbox,
    FormControlLabel,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    Lock as LockIcon,
    Help as HelpIcon
} from '@mui/icons-material';
import { login } from '../../services/authService';

const LoginPage = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Email validation regex
    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // Validate form fields
    const validateForm = () => {
        const errors = { email: '', password: '' };
        let isValid = true;

        // Email validation
        if (!email.trim()) {
            errors.email = 'Email is required.';
            isValid = false;
        } else if (!isValidEmail(email)) {
            errors.email = 'Please enter a valid email address.';
            isValid = false;
        }

        // Password validation
        if (!password) {
            errors.password = 'Password is required.';
            isValid = false;
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters.';
            isValid = false;
        }

        setFieldErrors(errors);
        return isValid;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        // Validate form first
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const result = await login(email, password, rememberMe);

            if (result.success) {
                // Store user info in localStorage (optional, for quick access)
                localStorage.setItem('user', JSON.stringify(result.data.user));

                setSnackbar({
                    open: true,
                    message: 'Login successful! Redirecting...',
                    severity: 'success'
                });

                // Navigate to dashboard after short delay
                setTimeout(() => {
                    navigate('/dashboard');
                }, 500);
            }
        } catch (err) {
            // Map backend error messages to user-friendly messages
            let errorMessage = err.message;
            if (err.message.includes('Invalid email or password')) {
                errorMessage = 'Email or password is incorrect. Please try again.';
            } else if (err.message.includes('network') || err.message.includes('Network')) {
                errorMessage = 'Unable to connect to server. Please check your connection.';
            }

            setError(errorMessage);
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                py: 4
            }}
        >
            <Container maxWidth="sm">
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 4,
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}
                >
                    <CardContent sx={{ p: { xs: 4, md: 6 } }}>
                        {/* Logo & Header */}
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Box
                                component="img"
                                src="/logo.png"
                                alt="Synchro Scan Logo"
                                sx={{
                                    width: 64,
                                    height: 64,
                                    borderRadius: 2,
                                    mx: 'auto',
                                    mb: 2
                                }}
                            />
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    color: '#1F2937',
                                    mb: 1
                                }}
                            >
                                Welcome Back
                            </Typography>
                            <Typography sx={{ color: '#6B7280', fontSize: '15px' }}>
                                Sign in to your Synchro Scan account
                            </Typography>
                        </Box>

                        {/* Error Alert */}
                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleLogin}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    type="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                                    }}
                                    placeholder="Enter your email"
                                    error={!!fieldErrors.email}
                                    helperText={fieldErrors.email}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon sx={{ color: fieldErrors.email ? '#EF4444' : '#9CA3AF' }} />
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: 2 }
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                                    }}
                                    placeholder="Enter your password"
                                    error={!!fieldErrors.password}
                                    helperText={fieldErrors.password}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon sx={{ color: fieldErrors.password ? '#EF4444' : '#9CA3AF' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: 2 }
                                    }}
                                />

                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            size="small"
                                            sx={{ color: '#6366F1', '&.Mui-checked': { color: '#6366F1' } }}
                                        />
                                    }
                                    label={<Typography sx={{ fontSize: '14px', color: '#4B5563' }}>Remember me</Typography>}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    disabled={loading}
                                    sx={{
                                        py: 1.5,
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                                        boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #5558E3 0%, #7C3AED 100%)',
                                        }
                                    }}
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </Box>
                        </form>

                    </CardContent>
                </Card>

                {/* Footer */}
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                        © Copyright on Synchro 2017 - 2025 | All rights reserved.
                    </Typography>
                </Box>
            </Container>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default LoginPage;
