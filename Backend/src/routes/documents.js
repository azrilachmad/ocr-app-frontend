const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticate, isVerificator } = require('../middleware/auth');
const { documentValidation } = require('../middleware/validation');
const { Document } = require('../models');
const { exportToExcel, exportBatchToExcel, exportToCSV, exportToPDF } = require('../services/exportService');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

// All routes require authentication
router.use(authenticate);

router.get('/', documentController.getAllDocuments);
router.get('/recent-scans', documentController.getRecentScans);

/**
 * GET /api/documents/types
 * List document types grouped by mode: template vs insight.
 * Templates = all active templates from DocumentType table.
 * Insights = distinct doc types from saved documents that are NOT templates.
 */
router.get('/types', async (req, res, next) => {
    try {
        // 1. Get all active template names (always include even if no docs exist)
        const templateRows = await DocumentType.findAll({
            where: { active: true },
            attributes: ['name'],
            raw: true
        });
        const templateNames = [...new Set(templateRows.map(r => r.name))].sort();

        // 2. Get all distinct document types from saved documents
        const docTypeRows = await Document.findAll({
            where: { saved: true },
            attributes: [[require('sequelize').fn('DISTINCT', require('sequelize').col('document_type')), 'documentType']],
            raw: true
        });
        const allDocTypes = docTypeRows.map(r => r.documentType).filter(Boolean);

        // 3. Insights = doc types NOT in template list
        const templateSet = new Set(templateNames);
        const insights = allDocTypes.filter(t => !templateSet.has(t)).sort();

        res.json({
            success: true,
            data: { templates: templateNames, insights }
        });
    } catch (error) {
        next(error);
    }
});

// --- Fitur #4: Tag endpoints ---

/**
 * GET /api/documents/tags
 * List all unique tags used by the current user.
 */
router.get('/tags', async (req, res, next) => {
    try {
        const documents = await Document.findAll({
            where: {
                userId: req.userId,
                tags: { [Op.ne]: null }
            },
            attributes: ['tags'],
            raw: true
        });

        const tagSet = new Set();
        documents.forEach(doc => {
            const tags = Array.isArray(doc.tags) ? doc.tags :
                (typeof doc.tags === 'string' ? JSON.parse(doc.tags) : []);
            tags.forEach(t => tagSet.add(t));
        });

        res.json({
            success: true,
            data: Array.from(tagSet).sort()
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/documents/:id/tags
 * Update tags for a document.
 */
router.put('/:id/tags', isVerificator, async (req, res, next) => {
    try {
        const isPrivileged = ['verificator', 'admin', 'superadmin'].includes(req.user.role);
        const whereClause = { id: req.params.id };
        if (!isPrivileged) whereClause.userId = req.userId;

        const document = await Document.findOne({ where: whereClause });

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found.' });
        }

        const { tags } = req.body;

        if (!Array.isArray(tags)) {
            return res.status(400).json({ success: false, message: 'Tags must be an array of strings.' });
        }

        if (tags.some(t => typeof t !== 'string' || t.length > 50)) {
            return res.status(400).json({ success: false, message: 'Each tag must be a string (max 50 chars).' });
        }

        if (tags.length > 20) {
            return res.status(400).json({ success: false, message: 'Maximum 20 tags per document.' });
        }

        // Deduplicate and normalize
        document.tags = [...new Set(tags.map(t => t.trim().toLowerCase()).filter(Boolean))];
        await document.save();

        res.json({
            success: true,
            message: 'Tags updated successfully.',
            data: { tags: document.tags }
        });
    } catch (error) {
        next(error);
    }
});

// --- Fitur #5: Export endpoints ---

/**
 * GET /api/documents/:id/export?format=excel|csv|pdf
 * Export a single document.
 */
router.get('/:id/export', async (req, res, next) => {
    try {
        const { format = 'excel' } = req.query;
        const document = await Document.findOne({
            where: { id: req.params.id, userId: req.userId }
        });

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found.' });
        }

        const safeFileName = (document.fileName || 'document').replace(/[^a-zA-Z0-9_\-. ]/g, '_');

        switch (format) {
            case 'csv': {
                const csv = exportToCSV(document);
                res.setHeader('Content-Type', 'text/csv; charset=utf-8');
                res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}.csv"`);
                return res.send(csv);
            }
            case 'pdf': {
                const pdfBuffer = await exportToPDF(document);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}.pdf"`);
                return res.send(pdfBuffer);
            }
            case 'excel':
            default: {
                const workbook = await exportToExcel(document);
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}.xlsx"`);
                return workbook.xlsx.write(res).then(() => res.end());
            }
        }
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/documents/export-batch
 * Export multiple documents. Body: { ids: [...], format: 'excel' }
 */
router.post('/export-batch', async (req, res, next) => {
    try {
        const { ids, format = 'excel' } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: 'Document IDs array is required.' });
        }

        const documents = await Document.findAll({
            where: { id: { [Op.in]: ids }, userId: req.userId }
        });

        if (documents.length === 0) {
            return res.status(404).json({ success: false, message: 'No documents found.' });
        }

        const timestamp = new Date().toISOString().split('T')[0];

        if (format === 'csv') {
            // CSV batch: combine all into one file
            let csv = 'Document #,File Name,Document Type,Status,Confidence,Scanned At\n';
            documents.forEach((doc, i) => {
                csv += `${i + 1},"${doc.fileName}","${doc.documentType}","${doc.status}","${doc.confidenceScore || 'N/A'}%","${doc.scannedAt ? new Date(doc.scannedAt).toLocaleString('id-ID') : 'N/A'}"\n`;
            });
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="synchro-export-${timestamp}.csv"`);
            return res.send(csv);
        }

        // Default: Excel batch
        const workbook = await exportBatchToExcel(documents);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="synchro-export-${timestamp}.xlsx"`);
        return workbook.xlsx.write(res).then(() => res.end());
    } catch (error) {
        next(error);
    }
});

// --- Existing CRUD routes ---

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

router.put('/:id', isVerificator, documentValidation.update, documentController.updateDocument);
router.delete('/:id', documentValidation.delete, documentController.deleteDocument);
router.post('/:id/save', documentValidation.save, documentController.saveDocument);

// --- Fitur #6: Document status transitions ---

/**
 * POST /api/documents/:id/verify
 * Mark a saved document as verified.
 */
router.post('/:id/verify', isVerificator, async (req, res, next) => {
    try {
        const document = await Document.findOne({
            where: { id: req.params.id }
        });

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found.' });
        }

        if (document.status !== 'saved') {
            return res.status(400).json({
                success: false,
                message: 'Only saved documents can be verified. Current status: ' + document.status
            });
        }

        document.status = 'verified';
        await document.save();

        res.json({
            success: true,
            message: 'Document verified successfully.',
            data: document
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
