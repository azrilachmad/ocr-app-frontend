/**
 * Activity Logger Middleware
 *
 * Reusable middleware to track user activity across routes.
 * Designed to be placed AFTER `authenticate` middleware so `req.userId` is available.
 *
 * Usage:
 *   const { logActivity } = require('../middleware/activityLogger');
 *
 *   // Basic: auto-detect resource from path
 *   router.get('/categories', authenticate, logActivity('VIEW', 'kb/categories'), handler);
 *
 *   // With dynamic resource ID from route params
 *   router.get('/:id', authenticate, logActivity('VIEW', 'documents', { resourceIdParam: 'id' }), handler);
 *
 *   // With custom details
 *   router.post('/export', authenticate, logActivity('EXPORT', 'reports', { extraDetails: { format: 'pdf' } }), handler);
 */

const { getClientIp, lookupIp } = require('../services/geoService');

/**
 * Create an activity log entry (fire-and-forget, non-blocking).
 * Requires ActivityLog model to be loaded — we lazy-require it to avoid circular deps.
 */
const createLogEntry = async ({ userId, action, resource, resourceId, details, ipAddress, userAgent }) => {
    try {
        // Lazy require to avoid circular dependency with models/index.js
        const ActivityLog = require('../models/ActivityLog');

        // Geo lookup (also non-blocking, has internal timeout + cache)
        const geo = await lookupIp(ipAddress);

        await ActivityLog.create({
            userId,
            action,
            resource,
            resourceId: resourceId || null,
            details: details || null,
            ipAddress,
            city: geo?.city || null,
            region: geo?.region || null,
            country: geo?.country || null,
            userAgent: userAgent ? userAgent.substring(0, 500) : null
        });
    } catch (error) {
        // Never let logging errors break the application
        console.error('[ActivityLogger] Failed to create log entry:', error.message);
    }
};

/**
 * Middleware factory for route-level activity logging.
 *
 * @param {string} action - Action type: LOGIN, VIEW, CREATE, UPDATE, DELETE, etc.
 * @param {string} resource - Resource name: 'auth', 'admin/users', 'kb/articles', etc.
 * @param {Object} [options] - Additional options
 * @param {string} [options.resourceIdParam] - Route param name to use as resourceId (e.g. 'id', 'slug')
 * @param {Object} [options.extraDetails] - Static extra details to include
 * @returns {import('express').RequestHandler}
 */
const logActivity = (action, resource, options = {}) => {
    return (req, res, next) => {
        const { resourceIdParam, extraDetails } = options;

        // Capture data before response is sent
        const ipAddress = getClientIp(req);
        const userAgent = req.headers['user-agent'] || null;
        const userId = req.userId || null;
        const resourceId = resourceIdParam ? req.params[resourceIdParam] : null;

        // Listen for response finish event (after response is sent to client)
        res.on('finish', () => {
            const details = {
                method: req.method,
                path: req.originalUrl,
                statusCode: res.statusCode,
                ...extraDetails
            };

            // Fire-and-forget: do NOT await — this runs asynchronously after response
            createLogEntry({
                userId,
                action,
                resource,
                resourceId,
                details,
                ipAddress,
                userAgent
            });
        });

        next();
    };
};

/**
 * Direct logging function for use inside controllers (not as middleware).
 * Useful for login/logout/register where you need to log from within the handler.
 *
 * @param {import('express').Request} req - Express request object
 * @param {string} action - Action type
 * @param {string} resource - Resource name
 * @param {Object} [extraData] - Additional data
 * @param {string} [extraData.resourceId] - Specific resource ID
 * @param {Object} [extraData.details] - Extra metadata
 * @param {number} [extraData.userId] - Override userId (useful for login before req.userId is set)
 */
const logFromController = (req, action, resource, extraData = {}) => {
    const ipAddress = getClientIp(req);
    const userAgent = req.headers['user-agent'] || null;

    // Fire-and-forget
    createLogEntry({
        userId: extraData.userId || req.userId || null,
        action,
        resource,
        resourceId: extraData.resourceId || null,
        details: {
            method: req.method,
            path: req.originalUrl,
            ...extraData.details
        },
        ipAddress,
        userAgent
    });
};

module.exports = { logActivity, logFromController, createLogEntry };
