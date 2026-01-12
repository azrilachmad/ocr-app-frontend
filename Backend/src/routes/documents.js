const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');
const { documentValidation } = require('../middleware/validation');
const { Document } = require('../models');
const path = require('path');
const fs = require('fs');

// All routes require authentication
router.use(authenticate);

router.get('/', documentController.getAllDocuments);
router.get('/recent-scans', documentController.getRecentScans);

// Get document by ID with validation
router.get('/:id', documentValidation.getById, documentController.getDocumentById);

// Serve document file with path traversal protection
router.get('/:id/file', documentValidation.getById, async (req, res, next) => {
    try {
        const document = await Document.findOne({
            where: { id: req.params.id, userId: req.userId }
        });

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found.' });
        }

        if (!document.filePath) {
            return res.status(404).json({ success: false, message: 'File not found.' });
        }

        // Security: Resolve and validate file path to prevent path traversal
        const uploadsDir = path.resolve(__dirname, '../../uploads');
        const resolvedPath = path.resolve(document.filePath);

        // Ensure the file is within the uploads directory
        if (!resolvedPath.startsWith(uploadsDir)) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        if (!fs.existsSync(resolvedPath)) {
            return res.status(404).json({ success: false, message: 'File not found.' });
        }

        // Determine content type based on file extension
        const ext = path.extname(resolvedPath).toLowerCase();
        const contentTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.pdf': 'application/pdf',
            '.webp': 'image/webp'
        };

        res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.sendFile(resolvedPath);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', documentValidation.update, documentController.updateDocument);
router.delete('/:id', documentValidation.delete, documentController.deleteDocument);
router.post('/:id/save', documentValidation.save, documentController.saveDocument);

module.exports = router;

