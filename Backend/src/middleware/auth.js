const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware to verify JWT token from cookie and attach user to request
 */
const authenticate = async (req, res, next) => {
    try {
        // Get token from cookie first, then from header as fallback
        let token = req.cookies?.token;

        // Fallback to Authorization header (for API clients)
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user
        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        // Attach user to request
        req.user = user;
        req.userId = user.id;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Session expired. Please login again.'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Authentication error.'
        });
    }
};

/**
 * Middleware to check if user is admin or superadmin
 */
const isAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
};

/**
 * Middleware to check if user is superadmin
 */
const isSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'superadmin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Superadmin privileges required.'
        });
    }
};

/**
 * Middleware to check if user account is active
 */
const isActiveUser = (req, res, next) => {
    if (req.user && req.user.isActive) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Account is deactivated. Please contact administrator.'
        });
    }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
    try {
        let token = req.cookies?.token;

        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.userId);
            if (user) {
                req.user = user;
                req.userId = user.id;
            }
        }
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

module.exports = { authenticate, isAdmin, isSuperAdmin, isActiveUser, optionalAuth };

