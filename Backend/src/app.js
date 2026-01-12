const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const statsRoutes = require('./routes/stats');
const settingsRoutes = require('./routes/settings');
const ocrRoutes = require('./routes/ocr');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Security: Helmet for setting secure HTTP headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable for API-only server
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' } // Allow cross-origin resource loading for images
}));

// Rate limiting - general API
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window per IP
    message: {
        success: false,
        message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiting - auth endpoints (stricter)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 login attempts per window
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiting - OCR processing (prevent abuse)
const ocrLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 OCR requests per minute
    message: {
        success: false,
        message: 'Too many OCR requests, please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
        : true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Cookie parser
app.use(cookieParser());

// Body parsers with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (for uploaded documents) - protected from listing
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    dotfiles: 'deny', // Deny access to dotfiles
    index: false // Disable directory indexing
}));

// Health check (no rate limiting)
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Synchro Scan API is running',
        timestamp: new Date().toISOString()
    });
});

// Apply rate limiters to routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/ocr', ocrLimiter);
app.use('/api', generalLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ocr', ocrRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

module.exports = app;

