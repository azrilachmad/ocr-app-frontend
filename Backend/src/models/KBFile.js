const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const KBFile = sequelize.define('KBFile', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fileName: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'file_name'
    },
    filePath: {
        type: DataTypes.STRING(500),
        allowNull: false,
        field: 'file_path'
    },
    fileSize: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: 'file_size'
    },
    fileType: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'file_type',
        comment: 'pdf, xlsx, docx, etc.'
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'category_id'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    uploadedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'uploaded_by'
    }
}, {
    tableName: 'kb_files',
    timestamps: true
});

module.exports = KBFile;
