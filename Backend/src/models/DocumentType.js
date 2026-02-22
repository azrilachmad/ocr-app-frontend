const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DocumentType = sequelize.define('DocumentType', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE',
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    fields: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
        // Format: [{ name: 'NIK', required: true }, ...]
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'document_types',
    timestamps: true
});

module.exports = DocumentType;
