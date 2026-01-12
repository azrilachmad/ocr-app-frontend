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
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'document_type'
    },
    status: {
        type: DataTypes.ENUM('processing', 'completed', 'failed'),
        defaultValue: 'processing'
    },
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
