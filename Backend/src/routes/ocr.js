const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/upload');
const { Op } = require('sequelize');
const { Document, Settings, DocumentType, SystemConfig, OcrBatch, User } = require('../models');
const { processDocument } = require('../services/ocrService');
const { validateOcrResult } = require('../services/validationService');
const { enqueueOcrJob, enqueueBatch, retryFailedInBatch, retrySingleDocument, getQueueStatus, isQueueReady } = require('../services/queueService');
const { cleanupOldScans } = require('../controllers/documentController');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

/**
 * Compute SHA-256 hash of a file.
 */
const computeFileHash = (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);
        stream.on('data', (data) => hash.update(data));
        stream.on('end', () => resolve(hash.digest('hex')));
        stream.on('error', reject);
    });
};

/**
 * Check for duplicate files by hash. Returns array of duplicate info.
 */
const checkDuplicates = async (fileHashes, userId) => {
    if (!fileHashes.length) return [];
    const hashValues = fileHashes.map(fh => fh.hash);
    const existing = await Document.findAll({
        where: {
            fileHash: { [Op.in]: hashValues },
            status: { [Op.notIn]: ['failed'] }
        },
        attributes: ['id', 'fileName', 'fileHash', 'documentType', 'status', 'scannedAt', 'userId'],
        include: [{ model: User, as: 'user', attributes: ['id', 'name'] }]
    });
    if (!existing.length) return [];
    const hashMap = {};
    existing.forEach(doc => { hashMap[doc.fileHash] = doc; });
    return fileHashes
        .filter(fh => hashMap[fh.hash])
        .map(fh => {
            const dup = hashMap[fh.hash];
            return {
                uploadedFileName: fh.fileName,
                existingDocumentId: dup.id,
                existingFileName: dup.fileName,
                existingDocumentType: dup.documentType,
                existingStatus: dup.status,
                existingScannedAt: dup.scannedAt,
                uploadedBy: dup.user?.name || 'Unknown'
            };
        });
};

/**
 * Helper: build AI options from user settings + available templates.
 */
const buildAiOptions = async (userId, requestedMode = 'template') => {
    const userSettings = await Settings.findOne({ where: { userId } });
    if (!userSettings || !userSettings.apiKey) {
        throw { status: 400, message: 'API key is required. Please configure your Gemini API key in Settings.' };
    }
    if (!userSettings.aiModel || !userSettings.languageDetection) {
        throw { status: 400, message: 'AI Model or Language configuration missing. Please update your profile settings.' };
    }

    const availableTemplates = await DocumentType.findAll({
        where: { active: true },
        attributes: ['name', 'description', 'fields']
    });

    return {
        apiKey: userSettings.apiKey,
        aiModel: userSettings.aiModel,
        availableTemplates: availableTemplates.map(t => t.toJSON()),
        mode: requestedMode,
        languageDetection: userSettings.languageDetection
    };
};

/**
 * Helper: check daily scan limit.
 */
const checkScanLimit = async (userId, fileCount) => {
    const maxScansConfig = await SystemConfig.findOne({ where: { key: 'max_scans_per_day' } });
    if (maxScansConfig && maxScansConfig.value && maxScansConfig.value.trim() !== '' && maxScansConfig.value !== '0') {
        const scanLimit = parseInt(maxScansConfig.value, 10);
        if (!isNaN(scanLimit) && scanLimit > 0) {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const todayScansCount = await Document.count({
                where: { userId, scannedAt: { [Op.gte]: startOfDay } }
            });
            if (todayScansCount + fileCount > scanLimit) {
                throw {
                    status: 403,
                    message: `Daily scan limit reached. You can only scan up to ${scanLimit} documents per day. You have already scanned ${todayScansCount} today.`
                };
            }
        }
    }
};

/**
 * POST /api/ocr/process
 * Process document(s) with OCR using Gemini AI (synchronous — for ≤10 files).
 */
router.post('/process', authenticate, uploadMiddleware.multiple, async (req, res, next) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded.' });
        }

        const options = req.body.options ? JSON.parse(req.body.options) : {};
        const documentType = options.documentType || 'auto';
        const requestedMode = options.mode || 'template';
        const skipDuplicateCheck = options.skipDuplicateCheck === true;

        // Build AI options
        let aiOptions;
        try {
            aiOptions = await buildAiOptions(req.userId, requestedMode);
        } catch (err) {
            return res.status(err.status || 400).json({ success: false, message: err.message });
        }

        // Check scan limit
        try {
            await checkScanLimit(req.userId, files.length);
        } catch (err) {
            return res.status(err.status || 403).json({ success: false, message: err.message });
        }

        // Compute file hashes and check duplicates
        const fileHashes = [];
        for (const file of files) {
            try {
                const hash = await computeFileHash(file.path);
                fileHashes.push({ fileName: file.originalname, hash, file });
            } catch (err) {
                fileHashes.push({ fileName: file.originalname, hash: null, file });
            }
        }

        if (!skipDuplicateCheck) {
            const duplicates = await checkDuplicates(fileHashes.filter(fh => fh.hash), req.userId);
            if (duplicates.length > 0) {
                return res.status(409).json({
                    success: false,
                    code: 'DUPLICATE_DETECTED',
                    message: `${duplicates.length} file(s) have already been uploaded previously.`,
                    data: { duplicates }
                });
            }
        }

        // Build hash lookup for later
        const hashLookup = {};
        fileHashes.forEach(fh => { if (fh.hash) hashLookup[fh.file.originalname] = fh.hash; });

        // Process each file synchronously
        const results = [];

        for (const file of files) {
            const startTime = Date.now();
            try {
                const isPdf = path.extname(file.originalname).toLowerCase() === '.pdf';
                const fileAiOptions = { ...aiOptions };
                if (isPdf && requestedMode === 'template' && documentType === 'auto') {
                    fileAiOptions.mode = 'insight';
                }

                const ocrResult = await processDocument(file.path, documentType, fileAiOptions);
                const processingTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';

                // Validate results
                const validationWarnings = validateOcrResult(
                    ocrResult.documentType || documentType,
                    ocrResult.content
                );

                const document = await Document.create({
                    userId: req.userId,
                    fileName: file.originalname,
                    filePath: file.path,
                    fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                    fileHash: hashLookup[file.originalname] || null,
                    documentType: ocrResult.documentType || documentType,
                    status: 'completed',
                    saved: false,
                    content: ocrResult.content,
                    confidenceScore: ocrResult.confidence || 95,
                    processingTime,
                    validationWarnings
                });

                results.push({
                    id: document.id,
                    fileName: document.fileName,
                    documentType: document.documentType,
                    status: document.status,
                    content: document.content,
                    confidenceScore: document.confidenceScore,
                    processingTime: document.processingTime,
                    validationWarnings
                });

            } catch (ocrError) {
                console.error('OCR Error for file:', file.originalname, ocrError);

                const document = await Document.create({
                    userId: req.userId,
                    fileName: file.originalname,
                    filePath: file.path,
                    fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                    fileHash: hashLookup[file.originalname] || null,
                    documentType: documentType,
                    status: 'failed',
                    saved: false,
                    content: { error: ocrError.message },
                    confidenceScore: 0,
                    processingTime: '0s',
                    errorMessage: ocrError.message
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

        const allFailed = results.every(r => r.status === 'failed');
        if (allFailed) {
            return res.status(500).json({
                success: false,
                message: 'All documents failed to process.',
                data: results
            });
        }

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

// ==================================================
// FITUR #6: Async Batch Processing
// ==================================================

/**
 * POST /api/ocr/process-batch
 * Upload files for async batch OCR processing.
 * Files are saved immediately, jobs are queued for background processing.
 * Returns a batchId for progress tracking.
 */
router.post('/process-batch', authenticate, uploadMiddleware.batch, async (req, res, next) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded.' });
        }

        if (!isQueueReady()) {
            return res.status(503).json({
                success: false,
                message: 'Queue service unavailable (Redis not connected). Please use standard upload for small batches.'
            });
        }

        const options = req.body.options ? JSON.parse(req.body.options) : {};
        const documentType = options.documentType || 'auto';
        const requestedMode = options.mode || 'template';
        const skipDuplicateCheck = options.skipDuplicateCheck === true;

        // Build AI options
        let aiOptions;
        try {
            aiOptions = await buildAiOptions(req.userId, requestedMode);
        } catch (err) {
            return res.status(err.status || 400).json({ success: false, message: err.message });
        }

        // Check scan limit
        try {
            await checkScanLimit(req.userId, files.length);
        } catch (err) {
            return res.status(err.status || 403).json({ success: false, message: err.message });
        }

        // Compute file hashes and check duplicates
        const fileHashes = [];
        for (const file of files) {
            try {
                const hash = await computeFileHash(file.path);
                fileHashes.push({ fileName: file.originalname, hash, file });
            } catch (err) {
                fileHashes.push({ fileName: file.originalname, hash: null, file });
            }
        }

        if (!skipDuplicateCheck) {
            const duplicates = await checkDuplicates(fileHashes.filter(fh => fh.hash), req.userId);
            if (duplicates.length > 0) {
                return res.status(409).json({
                    success: false,
                    code: 'DUPLICATE_DETECTED',
                    message: `${duplicates.length} file(s) have already been uploaded previously.`,
                    data: { duplicates }
                });
            }
        }

        const hashLookup = {};
        fileHashes.forEach(fh => { if (fh.hash) hashLookup[fh.file.originalname] = fh.hash; });

        // Create batch record
        const batch = await OcrBatch.create({
            userId: req.userId,
            totalFiles: files.length,
            status: 'pending',
            options: { documentType, mode: requestedMode, aiModel: aiOptions.aiModel },
            startedAt: new Date()
        });

        // Create document records with status 'queued'
        const documents = [];
        for (const file of files) {
            const isPdf = path.extname(file.originalname).toLowerCase() === '.pdf';
            const effectiveType = (isPdf && requestedMode === 'template' && documentType === 'auto')
                ? 'auto' : documentType;

            const doc = await Document.create({
                userId: req.userId,
                fileName: file.originalname,
                filePath: file.path,
                fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                fileHash: hashLookup[file.originalname] || null,
                documentType: effectiveType,
                status: 'queued',
                saved: false,
                batchId: batch.id,
                retryCount: 0
            });
            documents.push(doc);
        }

        // Enqueue all jobs — adjust aiOptions per file for PDF insight mode
        const enrichedDocs = documents.map(doc => {
            const isPdf = path.extname(doc.filePath || '').toLowerCase() === '.pdf';
            const docAiOptions = { ...aiOptions };
            if (isPdf && requestedMode === 'template' && documentType === 'auto') {
                docAiOptions.mode = 'insight';
            }
            return { ...doc.toJSON(), _aiOptions: docAiOptions };
        });

        // Use per-doc aiOptions
        for (const doc of enrichedDocs) {
            await enqueueOcrJob(doc.id, doc.filePath, doc.documentType, doc._aiOptions, batch.id);
        }

        // Update batch status
        batch.status = 'processing';
        await batch.save();

        res.status(202).json({
            success: true,
            message: `${files.length} files queued for processing.`,
            data: {
                batchId: batch.id,
                totalFiles: files.length,
                status: 'processing'
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/ocr/batch/:batchId/status
 * Get batch processing progress.
 */
router.get('/batch/:batchId/status', authenticate, async (req, res, next) => {
    try {
        const batch = await OcrBatch.findOne({
            where: { id: req.params.batchId, userId: req.userId }
        });

        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found.' });
        }

        // Get per-status counts
        const statusCounts = await Document.findAll({
            where: { batchId: batch.id },
            attributes: [
                'status',
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        const counts = { queued: 0, processing: 0, completed: 0, saved: 0, verified: 0, failed: 0 };
        statusCounts.forEach(s => { counts[s.status] = parseInt(s.count) || 0; });

        const totalDone = counts.completed + counts.saved + counts.verified + counts.failed;
        const progress = batch.totalFiles > 0 ? parseFloat(((totalDone / batch.totalFiles) * 100).toFixed(1)) : 0;

        res.json({
            success: true,
            data: {
                batchId: batch.id,
                status: batch.status,
                totalFiles: batch.totalFiles,
                progress,
                counts,
                startedAt: batch.startedAt,
                completedAt: batch.completedAt
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/ocr/batch/:batchId/results
 * Get all document results for a batch.
 */
router.get('/batch/:batchId/results', authenticate, async (req, res, next) => {
    try {
        const batch = await OcrBatch.findOne({
            where: { id: req.params.batchId, userId: req.userId }
        });

        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found.' });
        }

        const documents = await Document.findAll({
            where: { batchId: batch.id },
            order: [['scannedAt', 'ASC']],
            attributes: ['id', 'fileName', 'documentType', 'status', 'confidenceScore',
                'processingTime', 'errorMessage', 'retryCount', 'validationWarnings', 'scannedAt']
        });

        res.json({
            success: true,
            data: {
                batch: {
                    id: batch.id,
                    status: batch.status,
                    totalFiles: batch.totalFiles,
                    completedFiles: batch.completedFiles,
                    failedFiles: batch.failedFiles
                },
                documents
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/ocr/batch/:batchId/retry-failed
 * Re-queue all failed documents in a batch.
 */
router.post('/batch/:batchId/retry-failed', authenticate, async (req, res, next) => {
    try {
        const batch = await OcrBatch.findOne({
            where: { id: req.params.batchId, userId: req.userId }
        });

        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found.' });
        }

        let aiOptions;
        try {
            aiOptions = await buildAiOptions(req.userId, batch.options?.mode || 'template');
        } catch (err) {
            return res.status(err.status || 400).json({ success: false, message: err.message });
        }

        const retriedCount = await retryFailedInBatch(batch.id, aiOptions);

        res.json({
            success: true,
            message: `${retriedCount} failed documents re-queued.`,
            data: { retriedCount }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/ocr/retry/:documentId
 * Retry a single failed document.
 */
router.post('/retry/:documentId', authenticate, async (req, res, next) => {
    try {
        const document = await Document.findOne({
            where: { id: req.params.documentId, userId: req.userId }
        });

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found.' });
        }

        if (document.status !== 'failed') {
            return res.status(400).json({ success: false, message: 'Only failed documents can be retried.' });
        }

        let aiOptions;
        try {
            aiOptions = await buildAiOptions(req.userId);
        } catch (err) {
            return res.status(err.status || 400).json({ success: false, message: err.message });
        }

        const success = await retrySingleDocument(document.id, aiOptions);
        if (!success) {
            return res.status(503).json({ success: false, message: 'Queue not available. Please try again later.' });
        }

        res.json({
            success: true,
            message: 'Document re-queued for processing.'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/ocr/queue-status
 * Get current queue health status.
 */
router.get('/queue-status', authenticate, async (req, res, next) => {
    try {
        const status = await getQueueStatus();
        res.json({ success: true, data: status });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/ocr/batches
 * List all batches for the current user.
 */
router.get('/batches', authenticate, async (req, res, next) => {
    try {
        const batches = await OcrBatch.findAll({
            where: { userId: req.userId },
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        res.json({ success: true, data: batches });
    } catch (error) {
        next(error);
    }
});

// ==================================================
// Existing: Rescan & Submit
// ==================================================

/**
 * POST /api/ocr/rescan/:id
 * Re-process an existing document using stored file path
 */
router.post('/rescan/:id', authenticate, async (req, res, next) => {
    try {
        const documentId = req.params.id;
        const existingDoc = await Document.findOne({
            where: { id: documentId, userId: req.userId }
        });

        if (!existingDoc) {
            return res.status(404).json({ success: false, message: 'Document not found.' });
        }

        if (!existingDoc.filePath || !fs.existsSync(existingDoc.filePath)) {
            return res.status(400).json({ success: false, message: 'Original file not found. Cannot rescan.' });
        }

        let aiOptions;
        try {
            aiOptions = await buildAiOptions(req.userId);
        } catch (err) {
            return res.status(err.status || 400).json({ success: false, message: err.message });
        }

        const startTime = Date.now();
        const ocrResult = await processDocument(existingDoc.filePath, 'auto', aiOptions);
        const processingTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';

        const validationWarnings = validateOcrResult(
            ocrResult.documentType || existingDoc.documentType,
            ocrResult.content
        );

        existingDoc.documentType = ocrResult.documentType || existingDoc.documentType;
        existingDoc.status = 'completed';
        existingDoc.content = ocrResult.content;
        existingDoc.confidenceScore = ocrResult.confidence || 95;
        existingDoc.processingTime = processingTime;
        existingDoc.validationWarnings = validationWarnings;
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
                processingTime: existingDoc.processingTime,
                validationWarnings
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

        if (documentId) {
            const existingDoc = await Document.findOne({
                where: { id: documentId, userId: req.userId }
            });

            if (!existingDoc) {
                return res.status(404).json({ success: false, message: 'Document not found.' });
            }

            existingDoc.saved = true;
            existingDoc.status = 'saved';
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

        if (!document_type || !content) {
            return res.status(400).json({ success: false, message: 'Document type and content are required.' });
        }

        const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;

        const document = await Document.create({
            userId: req.userId,
            fileName: userDefinedFilename || (files?.[0]?.originalname || 'document'),
            filePath: files?.[0]?.path || null,
            fileSize: files?.[0] ? `${(files[0].size / 1024 / 1024).toFixed(2)} MB` : null,
            documentType: document_type,
            status: 'saved',
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
