/**
 * Queue Service — BullMQ-based async OCR processing queue.
 *
 * If Redis is not available, the service degrades gracefully:
 * all methods become no-ops and the system falls back to synchronous processing.
 */
const { processDocument } = require('./ocrService');
const { validateOcrResult } = require('./validationService');

let Queue, Worker, redisConnection, ocrQueue, ocrWorker;
let isQueueAvailable = false;

/**
 * Attempt to initialize the BullMQ queue and worker.
 * Called once on server startup. If Redis is unavailable, queue features are disabled.
 */
const initQueue = async () => {
    try {
        const { Queue: BullQueue, Worker: BullWorker } = require('bullmq');
        const IORedis = require('ioredis');

        const redisHost = process.env.REDIS_HOST || 'localhost';
        const redisPort = parseInt(process.env.REDIS_PORT) || 6379;

        redisConnection = new IORedis(redisPort, redisHost, {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            retryStrategy: (times) => {
                if (times > 3) return null; // Stop retrying after 3 attempts
                return Math.min(times * 500, 3000);
            }
        });

        // Test connection
        await redisConnection.ping();

        ocrQueue = new BullQueue('ocr-queue', { connection: redisConnection });

        // Concurrency from env or default 3
        const concurrency = parseInt(process.env.QUEUE_CONCURRENCY) || 3;

        ocrWorker = new BullWorker('ocr-queue', async (job) => {
            return processOcrJob(job);
        }, {
            connection: redisConnection.duplicate(),
            concurrency,
            removeOnComplete: { count: 100 },
            removeOnFail: { count: 200 }
        });

        // Worker event handlers
        ocrWorker.on('completed', async (job, result) => {
            console.log(`✅ OCR job ${job.id} completed for document ${job.data.documentId}`);
            await updateBatchProgress(job.data.batchId);
        });

        ocrWorker.on('failed', async (job, err) => {
            console.error(`❌ OCR job ${job.id} failed: ${err.message}`);
            await handleJobFailure(job, err);
        });

        isQueueAvailable = true;
        console.log(`🚀 OCR Queue initialized (Redis: ${redisHost}:${redisPort}, concurrency: ${concurrency})`);
    } catch (error) {
        isQueueAvailable = false;
        console.warn('⚠️  Redis not available — queue features disabled, using sync processing.', error.message);
    }
};

/**
 * Process a single OCR job from the queue.
 */
const processOcrJob = async (job) => {
    const { documentId, filePath, documentType, aiOptions } = job.data;

    // Lazy-require to avoid circular deps
    const { Document } = require('../models');

    const doc = await Document.findByPk(documentId);
    if (!doc) throw new Error(`Document ${documentId} not found`);

    // Update status to processing
    doc.status = 'processing';
    await doc.save();

    const startTime = Date.now();

    // Call Gemini AI
    const ocrResult = await processDocument(filePath, documentType, aiOptions);
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';

    // Validate results
    const warnings = validateOcrResult(ocrResult.documentType || documentType, ocrResult.content);

    // Update document with results
    doc.documentType = ocrResult.documentType || documentType;
    doc.status = 'completed';
    doc.content = ocrResult.content;
    doc.confidenceScore = ocrResult.confidence || 95;
    doc.processingTime = processingTime;
    doc.validationWarnings = warnings;
    doc.errorMessage = null;
    await doc.save();

    return { documentId, status: 'completed' };
};

/**
 * Handle a failed job — update document and batch.
 */
const handleJobFailure = async (job, err) => {
    try {
        const { Document } = require('../models');
        const doc = await Document.findByPk(job.data.documentId);
        if (!doc) return;

        doc.retryCount = job.attemptsMade;
        doc.errorMessage = err.message;

        // If all retries exhausted, mark as permanently failed
        if (job.attemptsMade >= (job.opts?.attempts || 3)) {
            doc.status = 'failed';
        }

        await doc.save();
        await updateBatchProgress(job.data.batchId);
    } catch (updateErr) {
        console.error('Error updating failed job status:', updateErr);
    }
};

/**
 * Update batch progress counters.
 */
const updateBatchProgress = async (batchId) => {
    if (!batchId) return;

    try {
        const { Document, OcrBatch } = require('../models');
        const { Op } = require('sequelize');

        const batch = await OcrBatch.findByPk(batchId);
        if (!batch) return;

        const completed = await Document.count({
            where: { batchId, status: { [Op.in]: ['completed', 'saved', 'verified'] } }
        });
        const failed = await Document.count({
            where: { batchId, status: 'failed' }
        });

        batch.completedFiles = completed;
        batch.failedFiles = failed;

        const totalDone = completed + failed;
        if (totalDone >= batch.totalFiles) {
            batch.status = failed > 0 ? 'completed_with_errors' : 'completed';
            batch.completedAt = new Date();
        } else if (totalDone > 0) {
            batch.status = 'processing';
        }

        await batch.save();
    } catch (error) {
        console.error('Error updating batch progress:', error);
    }
};

/**
 * Enqueue a single OCR job.
 */
const enqueueOcrJob = async (documentId, filePath, documentType, aiOptions, batchId = null) => {
    if (!isQueueAvailable || !ocrQueue) {
        return false; // Caller should fall back to sync
    }

    await ocrQueue.add('process-ocr', {
        documentId,
        filePath,
        documentType,
        aiOptions,
        batchId
    }, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 10000 // 10s, then 30s, then 90s
        },
        removeOnComplete: true
    });

    return true;
};

/**
 * Enqueue a batch of OCR jobs.
 */
const enqueueBatch = async (batchId, documents, aiOptions) => {
    if (!isQueueAvailable || !ocrQueue) return false;

    const jobs = documents.map(doc => ({
        name: 'process-ocr',
        data: {
            documentId: doc.id,
            filePath: doc.filePath,
            documentType: doc.documentType || 'auto',
            aiOptions,
            batchId
        },
        opts: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 10000 },
            removeOnComplete: true
        }
    }));

    await ocrQueue.addBulk(jobs);
    return true;
};

/**
 * Retry all failed documents in a batch.
 */
const retryFailedInBatch = async (batchId, aiOptions) => {
    const { Document } = require('../models');

    const failedDocs = await Document.findAll({
        where: { batchId, status: 'failed' }
    });

    if (failedDocs.length === 0) return 0;

    // Reset status to queued
    for (const doc of failedDocs) {
        doc.status = 'queued';
        doc.retryCount = 0;
        doc.errorMessage = null;
        await doc.save();
    }

    // Re-update batch counters
    const { OcrBatch } = require('../models');
    const batch = await OcrBatch.findByPk(batchId);
    if (batch) {
        batch.failedFiles = 0;
        batch.status = 'processing';
        batch.completedAt = null;
        await batch.save();
    }

    // Re-enqueue
    await enqueueBatch(batchId, failedDocs, aiOptions);

    return failedDocs.length;
};

/**
 * Retry a single failed document.
 */
const retrySingleDocument = async (documentId, aiOptions) => {
    const { Document } = require('../models');
    const doc = await Document.findByPk(documentId);
    if (!doc || doc.status !== 'failed') return false;

    doc.status = 'queued';
    doc.retryCount = 0;
    doc.errorMessage = null;
    await doc.save();

    return enqueueOcrJob(doc.id, doc.filePath, doc.documentType, aiOptions, doc.batchId);
};

/**
 * Get queue health info.
 */
const getQueueStatus = async () => {
    if (!isQueueAvailable || !ocrQueue) {
        return { available: false, message: 'Queue not available (Redis not connected)' };
    }

    const waiting = await ocrQueue.getWaitingCount();
    const active = await ocrQueue.getActiveCount();
    const failed = await ocrQueue.getFailedCount();

    return {
        available: true,
        waiting,
        active,
        failed,
        concurrency: parseInt(process.env.QUEUE_CONCURRENCY) || 3
    };
};

module.exports = {
    initQueue,
    enqueueOcrJob,
    enqueueBatch,
    retryFailedInBatch,
    retrySingleDocument,
    getQueueStatus,
    updateBatchProgress,
    isQueueReady: () => isQueueAvailable
};
