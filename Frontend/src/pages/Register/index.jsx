import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
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
    Alert,
    Snackbar,
    Link
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    Lock as LockIcon,
    Person as PersonIcon,
    Help as HelpIcon
} from '@mui/icons-material';
import { register } from '../../services/authService';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Email validation regex
    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // Clear field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors({ ...fieldErrors, [name]: '' });
        }
    };

    // Validate form fields
    const validateForm = () => {
        const errors = {
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        };
        let isValid = true;

        // Name validation (optional but if entered, min 2 chars)
        if (formData.name && formData.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters.';
            isValid = false;
        }

        // Email validation
        if (!formData.email.trim()) {
            errors.email = 'Email is required.';
            isValid = false;
        } else if (!isValidEmail(formData.email)) {
            errors.email = 'Please enter a valid email address.';
            isValid = false;
        }

        // Password validation
        if (!formData.password) {
            errors.password = 'Password is required.';
            isValid = false;
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters.';
            isValid = false;
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password.';
            isValid = false;
        } else if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match.';
            isValid = false;
        }

        setFieldErrors(errors);
        return isValid;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        // Validate form first
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const result = await register(formData.email, formData.password, formData.name);

            if (result.success) {
                localStorage.setItem('user', JSON.stringify(result.data.user));

                setSnackbar({
                    open: true,
                    message: 'Registration successful! Redirecting...',
                    severity: 'success'
                });

                setTimeout(() => {
                    navigate('/dashboard');
                }, 500);
            }
        } catch (err) {
            // Map backend error messages to user-friendly messages
            let errorMessage = err.message;
            if (err.message.includes('already registered') || err.message.includes('already exists')) {
                errorMessage = 'This email is already registered. Please use a different email or login.';
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
                                Create Account
                            </Typography>
                            <Typography sx={{ color: '#6B7280', fontSize: '15px' }}>
                                Register for Synchro Scan
                            </Typography>
                        </Box>

                        {/* Error Alert */}
                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        {/* Register Form */}
                        <form onSubmit={handleRegister}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    error={!!fieldErrors.name}
                                    helperText={fieldErrors.name}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon sx={{ color: fieldErrors.name ? '#EF4444' : '#9CA3AF' }} />
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: 2 }
                                    }}
                                />

                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
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
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    error={!!fieldErrors.password}
                                    helperText={fieldErrors.password || 'Minimum 6 characters'}
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

                                <TextField
                                    fullWidth
                                    label="Confirm Password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    error={!!fieldErrors.confirmPassword}
                                    helperText={fieldErrors.confirmPassword}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockIcon sx={{ color: fieldErrors.confirmPassword ? '#EF4444' : '#9CA3AF' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    edge="end"
                                                >
                                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        sx: { borderRadius: 2 }
                                    }}
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
                                    {loading ? 'Creating Account...' : 'Create Account'}
                                </Button>

                                {/* Login Link */}
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography sx={{ color: '#6B7280', fontSize: '14px' }}>
                                        Already have an account?{' '}
                                        <Link
                                            component={RouterLink}
                                            to="/login"
                                            underline="hover"
                                            sx={{ color: '#6366F1', fontWeight: 600 }}
                                        >
                                            Sign in
                                        </Link>
                                    </Typography>
                                </Box>
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

            {/* Snackbar */}
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

export default RegisterPage;
