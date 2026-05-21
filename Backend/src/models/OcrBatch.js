const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * OcrBatch Model
 * Tracks batch OCR processing operations.
 * A batch groups multiple documents uploaded together for async processing.
 */
const OcrBatch = sequelize.define('OcrBatch', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id'
    },
    totalFiles: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'total_files'
    },
    completedFiles: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'completed_files'
    },
    failedFiles: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'failed_files'
    },
    /**
     * Batch status:
     *   pending              → batch created, jobs being enqueued
     *   processing           → at least one job is being processed
     *   completed            → all jobs finished successfully
     *   completed_with_errors → all jobs finished, some failed
     *   cancelled            → user cancelled remaining jobs
     *   paused               → user paused the queue
     */
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'completed_with_errors', 'cancelled', 'paused'),
        defaultValue: 'pending'
    },
    options: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'OCR options: { documentType, mode, aiModel, languageDetection }'
    },
    startedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'started_at'
    },
    completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'completed_at'
    }
}, {
    tableName: 'ocr_batches',
    timestamps: true
});

module.exports = OcrBatch;
