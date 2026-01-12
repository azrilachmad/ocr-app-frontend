const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Settings = sequelize.define('Settings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        field: 'user_id'
    },
    aiModel: {
        type: DataTypes.STRING(50),
        defaultValue: 'gemini-1.5-pro',
        field: 'ai_model'
    },
    apiKey: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'api_key'
    },
    confidenceThreshold: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.85,
        field: 'confidence_threshold'
    },
    languageDetection: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'language_detection'
    },
    autoCorrect: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'auto_correct'
    }
}, {
    tableName: 'settings',
    timestamps: true
});

module.exports = Settings;
