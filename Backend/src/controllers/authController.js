const jwt = require('jsonwebtoken');
const { User, Settings } = require('../models');

// Cookie options for 24 hours
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin in production
    path: '/',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
};

/**
 * Generate JWT token (24 hours expiry)
 */
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

/**
 * POST /api/auth/login
 * User login - sets HTTP-only cookie
 */
const login = async (req, res, next) => {
    try {
        const { email, password, rememberMe } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        // Find user
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Generate token
        const token = generateToken(user.id);

        // Set cookie options (extend to 7 days if rememberMe)
        const cookieOptions = { ...COOKIE_OPTIONS };
        if (rememberMe) {
            cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        }

        // Set HTTP-only cookie
        res.cookie('token', token, cookieOptions);

        res.json({
            success: true,
            message: 'Login successful.',
            data: {
                user: user.toJSON()
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/register
 * Register new user - sets HTTP-only cookie
 */
const register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        // Password validation
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters.'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered.'
            });
        }

        // Create user
        const user = await User.create({ email, password, name });

        // Create default settings for user
        await Settings.create({ userId: user.id });

        // Generate token
        const token = generateToken(user.id);

        // Set HTTP-only cookie
        res.cookie('token', token, COOKIE_OPTIONS);

        res.status(201).json({
            success: true,
            message: 'Registration successful.',
            data: {
                user: user.toJSON()
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/auth/me
 * Get current user profile
 */
const getProfile = async (req, res, next) => {
    try {
        res.json({
            success: true,
            data: req.user.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/logout
 * Logout user - clears cookie
 */
const logout = async (req, res, next) => {
    try {
        // Clear the token cookie with same options used when setting it
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/'
        });

        res.json({
            success: true,
            message: 'Logout successful.'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    login,
    register,
    getProfile,
    logout
};
