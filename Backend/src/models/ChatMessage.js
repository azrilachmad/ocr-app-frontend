const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const ChatSession = require('./ChatSession');

const ChatMessage = sequelize.define('ChatMessage', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    sessionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: ChatSession,
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    role: {
        type: DataTypes.ENUM('user', 'assistant', 'system'),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    timestamps: true,
    tableName: 'ChatMessages',
    indexes: [
        {
            fields: ['sessionId', 'createdAt'] // Fast lookup for chat history
        }
    ]
});

// Associations are defined in index.js

module.exports = ChatMessage;
