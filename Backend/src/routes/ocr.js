const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');
const { Document, Settings, DocumentType } = require('../models');
const { processDocument } = require('../services/ocrService');
const { cleanupOldScans } = require('../controllers/documentController');
const path = require('path');
const fs = require('fs');

/**
 * POST /api/ocr/process
 * Process document(s) with OCR using Gemini AI
 */
router.post('/process', authenticate, uploadMiddleware.multiple, async (req, res, next) => {
    try {
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded.'
            });
        }

        // Get user settings for API key and model
        const userSettings = await Settings.findOne({ where: { userId: req.userId } });
        if (!userSettings || !userSettings.apiKey) {
            return res.status(400).json({
                success: false,
                message: 'API key is required. Please configure your Gemini API key in Settings.'
            });
        }

        const options = req.body.options ? JSON.parse(req.body.options) : {};
        const documentType = options.documentType || 'auto';

        // Fetch available document type templates for better auto-detection
        const availableTemplates = await DocumentType.findAll({
            where: { active: true },
            attributes: ['name', 'description', 'fields']
        });

        // AI options from user settings + available templates
        const aiOptions = {
            apiKey: userSettings.apiKey,
            aiModel: userSettings.aiModel || 'gemini-2.5-flash',
            availableTemplates: availableTemplates.map(t => t.toJSON())
        };

        // Process each file
        const results = [];
        const startTime = Date.now();

        for (const file of files) {
            try {
                // Call Gemini AI for OCR processing with user settings and available templates
                const ocrResult = await processDocument(file.path, documentType, aiOptions);

                const processingTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';

                // Create document record
                const document = await Document.create({
                    userId: req.userId,
                    fileName: file.originalname,
                    filePath: file.path,
                    fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                    documentType: ocrResult.documentType || documentType,
                    status: 'completed',
                    saved: false,
                    content: ocrResult.content,
                    confidenceScore: ocrResult.confidence || 95,
                    processingTime: processingTime
                });

                results.push({
                    id: document.id,
                    fileName: document.fileName,
                    documentType: document.documentType,
                    status: document.status,
                    content: document.content,
                    confidenceScore: document.confidenceScore,
                    processingTime: document.processingTime
                });

            } catch (ocrError) {
                console.error('OCR Error for file:', file.originalname, ocrError);

                // Still create a record but mark as failed
                const document = await Document.create({
                    userId: req.userId,
                    fileName: file.originalname,
                    filePath: file.path,
                    fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                    documentType: documentType,
                    status: 'failed',
                    saved: false,
                    content: { error: ocrError.message },
                    confidenceScore: 0,
                    processingTime: '0s'
                });

                results.push({
                    id: document.id,
                    fileName: document.fileName,
                    documentType: document.documentType,
                    status: 'failed',
                    error: ocrError.message
                });
            }
        }

        // Check if all failed
        const allFailed = results.every(r => r.status === 'failed');
        if (allFailed) {
            return res.status(500).json({
                success: false,
                message: 'All documents failed to process.',
                data: results
            });
        }

        // Cleanup old unsaved scans (keep only 10 most recent)
        await cleanupOldScans(req.userId);

        res.json({
            success: true,
            message: 'Documents processed successfully.',
            data: results.length === 1 ? results[0] : results
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/ocr/rescan/:id
 * Re-process an existing document using stored file path
 */
router.post('/rescan/:id', authenticate, async (req, res, next) => {
    try {
        const documentId = req.params.id;

        // Find existing document
        const existingDoc = await Document.findOne({
            where: { id: documentId, userId: req.userId }
        });

        if (!existingDoc) {
            return res.status(404).json({
                success: false,
                message: 'Document not found.'
            });
        }

        // Check if file still exists
        if (!existingDoc.filePath || !fs.existsSync(existingDoc.filePath)) {
            return res.status(400).json({
                success: false,
                message: 'Original file not found. Cannot rescan.'
            });
        }

        // Get user settings for API key and model
        const userSettings = await Settings.findOne({ where: { userId: req.userId } });
        if (!userSettings || !userSettings.apiKey) {
            return res.status(400).json({
                success: false,
                message: 'API key is required. Please configure your Gemini API key in Settings.'
            });
        }

        // Fetch available document type templates for better auto-detection
        const availableTemplates = await DocumentType.findAll({
            where: { active: true },
            attributes: ['name', 'description', 'fields']
        });

        // AI options from user settings + available templates
        const aiOptions = {
            apiKey: userSettings.apiKey,
            aiModel: userSettings.aiModel || 'gemini-2.5-flash',
            availableTemplates: availableTemplates.map(t => t.toJSON())
        };

        const startTime = Date.now();

        // Re-process with OCR using templates
        const ocrResult = await processDocument(existingDoc.filePath, 'auto', aiOptions);
        const processingTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';

        // Update document with new results
        existingDoc.documentType = ocrResult.documentType || existingDoc.documentType;
        existingDoc.status = 'completed';
        existingDoc.content = ocrResult.content;
        existingDoc.confidenceScore = ocrResult.confidence || 95;
        existingDoc.processingTime = processingTime;
        existingDoc.scannedAt = new Date();
        await existingDoc.save();

        res.json({
            success: true,
            message: 'Document rescanned successfully.',
            data: {
                id: existingDoc.id,
                fileName: existingDoc.fileName,
                documentType: existingDoc.documentType,
                status: existingDoc.status,
                content: existingDoc.content,
                confidenceScore: existingDoc.confidenceScore,
                processingTime: existingDoc.processingTime
            }
        });
    } catch (error) {
        console.error('Rescan error:', error);
        next(error);
    }
});

/**
 * POST /api/ocr/submit
 * Save processed document data (mark as saved)
 */
router.post('/submit', authenticate, uploadMiddleware.multiple, async (req, res, next) => {
    try {
        const { document_type, content, userDefinedFilename, documentId } = req.body;
        const files = req.files;

        // If documentId is provided, update existing document
        if (documentId) {
            const existingDoc = await Document.findOne({
                where: { id: documentId, userId: req.userId }
            });

            if (!existingDoc) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found.'
                });
            }

            // Update the document
            existingDoc.saved = true;
            existingDoc.content = typeof content === 'string' ? JSON.parse(content) : content;
            if (userDefinedFilename) {
                existingDoc.fileName = userDefinedFilename;
            }
            await existingDoc.save();

            return res.json({
                success: true,
                message: 'Document updated and saved.',
                data: existingDoc
            });
        }

        // Create new document if no documentId
        if (!document_type || !content) {
            return res.status(400).json({
                success: false,
                message: 'Document type and content are required.'
            });
        }

        const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;

        const document = await Document.create({
            userId: req.userId,
            fileName: userDefinedFilename || (files?.[0]?.originalname || 'document'),
            filePath: files?.[0]?.path || null,
            fileSize: files?.[0] ? `${(files[0].size / 1024 / 1024).toFixed(2)} MB` : null,
            documentType: document_type,
            status: 'completed',
            saved: true,
            content: parsedContent,
            confidenceScore: 98.0,
            processingTime: '0s'
        });

        res.status(201).json({
            success: true,
            message: 'Document saved successfully.',
            data: document
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
