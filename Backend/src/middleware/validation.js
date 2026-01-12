/**
 * Input validation and sanitization middleware
 * Uses express-validator for robust input validation
 */
const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed.',
            errors: errors.array().map(e => ({
                field: e.path,
                message: e.msg
            }))
        });
    }
    next();
};

/**
 * Sanitize and escape HTML to prevent XSS
 */
const sanitizeHtml = (value) => {
    if (typeof value !== 'string') return value;
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
};

/**
 * Auth validations
 */
const authValidation = {
    login: [
        body('email')
            .trim()
            .isEmail()
            .withMessage('Please provide a valid email address.')
            .normalizeEmail()
            .isLength({ max: 255 })
            .withMessage('Email must not exceed 255 characters.'),
        body('password')
            .notEmpty()
            .withMessage('Password is required.')
            .isLength({ min: 1, max: 128 })
            .withMessage('Password must be between 1 and 128 characters.'),
        handleValidation
    ],

    register: [
        body('name')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('Name must not exceed 100 characters.')
            .customSanitizer(sanitizeHtml),
        body('email')
            .trim()
            .isEmail()
            .withMessage('Please provide a valid email address.')
            .normalizeEmail()
            .isLength({ max: 255 })
            .withMessage('Email must not exceed 255 characters.'),
        body('password')
            .isLength({ min: 6, max: 128 })
            .withMessage('Password must be between 6 and 128 characters.')
            .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])/)
            .withMessage('Password must contain at least one letter and one number.'),
        handleValidation
    ]
};

/**
 * Document validations
 */
const documentValidation = {
    getById: [
        param('id')
            .isInt({ min: 1 })
            .withMessage('Invalid document ID.'),
        handleValidation
    ],

    update: [
        param('id')
            .isInt({ min: 1 })
            .withMessage('Invalid document ID.'),
        body('fileName')
            .optional()
            .trim()
            .isLength({ max: 255 })
            .withMessage('File name must not exceed 255 characters.')
            .matches(/^[a-zA-Z0-9_\-\.\s]+$/)
            .withMessage('File name contains invalid characters.')
            .customSanitizer(sanitizeHtml),
        body('content')
            .optional(),
        handleValidation
    ],

    delete: [
        param('id')
            .isInt({ min: 1 })
            .withMessage('Invalid document ID.'),
        handleValidation
    ],

    save: [
        param('id')
            .isInt({ min: 1 })
            .withMessage('Invalid document ID.'),
        body('fileName')
            .optional()
            .trim()
            .isLength({ max: 255 })
            .withMessage('File name must not exceed 255 characters.')
            .customSanitizer(sanitizeHtml),
        handleValidation
    ]
};

/**
 * Settings validations
 */
const settingsValidation = {
    update: [
        body('apiKey')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('API key must not exceed 500 characters.'),
        body('aiModel')
            .optional()
            .trim()
            .isIn(['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'])
            .withMessage('Invalid AI model selected.'),
        handleValidation
    ],

    testAi: [
        body('apiKey')
            .notEmpty()
            .withMessage('API key is required for testing.')
            .trim()
            .isLength({ max: 500 })
            .withMessage('API key must not exceed 500 characters.'),
        body('aiModel')
            .optional()
            .trim(),
        handleValidation
    ]
};

/**
 * Stats validations
 */
const statsValidation = {
    chart: [
        query('startDate')
            .optional()
            .isISO8601()
            .withMessage('Start date must be a valid date (YYYY-MM-DD).'),
        query('endDate')
            .optional()
            .isISO8601()
            .withMessage('End date must be a valid date (YYYY-MM-DD).'),
        handleValidation
    ]
};

module.exports = {
    handleValidation,
    sanitizeHtml,
    authValidation,
    documentValidation,
    settingsValidation,
    statsValidation
};
