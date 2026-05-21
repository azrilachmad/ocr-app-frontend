const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id'
    },
    fileName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'file_name'
    },
    filePath: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'file_path'
    },
    fileSize: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'file_size'
    },
    resolution: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    documentType: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'document_type'
    },
    /**
     * Unified document lifecycle status:
     *   queued     → file uploaded, waiting in OCR queue
     *   processing → currently being processed by Gemini AI
     *   completed  → OCR done, awaiting user review
     *   saved      → user reviewed & saved the results
     *   verified   → user manually verified data correctness
     *   failed     → OCR failed after retries
     */
    status: {
        type: DataTypes.ENUM('queued', 'processing', 'completed', 'saved', 'verified', 'failed'),
        defaultValue: 'queued'
    },
    // Legacy column kept for backward compatibility during migration.
    // New code should rely on `status` instead.
    saved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    content: {
        type: DataTypes.JSON,
        allowNull: true
    },
    confidenceScore: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        field: 'confidence_score'
    },
    processingTime: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'processing_time'
    },
    // --- New fields for tagging ---
    tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of string tags for document labeling'
    },
    // --- New fields for async queue ---
    batchId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'batch_id',
        comment: 'Reference to OcrBatch for batch processing'
    },
    retryCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'retry_count'
    },
    errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'error_message'
    },
    // --- New fields for validation ---
    validationWarnings: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        field: 'validation_warnings',
        comment: 'Array of validation warning objects from OCR results'
    },
    fileHash: {
        type: DataTypes.STRING(64),
        allowNull: true,
        field: 'file_hash',
        comment: 'SHA-256 hash of the uploaded file for duplicate detection'
    },
    scannedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'scanned_at'
    }
}, {
    tableName: 'documents',
    timestamps: true
});

module.exports = Document;
