const jwt = require('jsonwebtoken');
const { User, Settings, DocumentType } = require('../models');
const { COOKIE_OPTIONS, getClearCookieOptions } = require('../config/cookieConfig');

/**
 * Generate JWT token (24 hours expiry)
 * @param {number} userId - Target user ID
 * @param {number|null} impersonatorId - Admin ID if impersonating
 */
const generateToken = (userId, impersonatorId = null) => {
    const payload = { userId };
    if (impersonatorId) {
        payload.impersonatorId = impersonatorId;
    }
    return jwt.sign(
        payload,
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

        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact administrator.'
            });
        }

        // Update last login timestamp
        await user.update({ lastLoginAt: new Date() });

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

        // Seed default document types for the new user
        const defaultTemplates = [
            {
                name: 'KTP',
                description: 'Kartu Tanda Penduduk (Indonesian ID Card) - 14 fields configured',
                fields: [
                    { name: 'NIK', required: true }, { name: 'Nama', required: true },
                    { name: 'Tempat/Tgl Lahir', required: true }, { name: 'Jenis Kelamin', required: true },
                    { name: 'Alamat', required: true }, { name: 'RT/RW', required: false },
                    { name: 'Kel/Desa', required: true }, { name: 'Kecamatan', required: true },
                    { name: 'Agama', required: true }, { name: 'Status Perkawinan', required: true },
                    { name: 'Pekerjaan', required: false }, { name: 'Kewarganegaraan', required: true },
                    { name: 'Berlaku Hingga', required: true }, { name: 'Gol. Darah', required: false }
                ],
                active: true
            },
            {
                name: 'KK',
                description: 'Kartu Keluarga (Family Card) - 8 fields configured',
                fields: [
                    { name: 'No. KK', required: true }, { name: 'Nama Kepala Keluarga', required: true },
                    { name: 'Alamat', required: true }, { name: 'RT/RW', required: false },
                    { name: 'Desa/Kelurahan', required: true }, { name: 'Kecamatan', required: true },
                    { name: 'Kabupaten/Kota', required: true }, { name: 'Provinsi', required: true }
                ],
                active: true
            },
            {
                name: 'Invoice',
                description: 'Invoice / Faktur / Receipt - 10 fields configured',
                fields: [
                    { name: 'Invoice Number', required: true }, { name: 'Invoice Date', required: true },
                    { name: 'Due Date', required: false }, { name: 'Vendor Name', required: true },
                    { name: 'Vendor Address', required: false }, { name: 'Customer Name', required: true },
                    { name: 'Customer Address', required: false }, { name: 'Total Amount', required: true },
                    { name: 'Tax Amount', required: false }, { name: 'Line Items', required: false }
                ],
                active: true
            }
        ];

        for (const template of defaultTemplates) {
            await DocumentType.create({
                userId: user.id,
                ...template
            });
        }

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
        const userData = req.user.toJSON();

        // Add impersonation info if applicable
        if (req.isImpersonating) {
            userData.isImpersonating = true;
            const impersonator = await User.findByPk(req.impersonatorId, {
                attributes: ['id', 'name', 'email', 'role']
            });
            if (impersonator) {
                userData.impersonator = impersonator.toJSON();
            }
        }

        res.json({
            success: true,
            data: userData
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
        const clearOpts = getClearCookieOptions();
        res.clearCookie('token', clearOpts);
        // Also clear admin_token if exists (from impersonation)
        res.clearCookie('admin_token', clearOpts);

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
