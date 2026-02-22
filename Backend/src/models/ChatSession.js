const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const ChatSession = sequelize.define('ChatSession', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'New Chat'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true,
    tableName: 'ChatSessions'
});

// Associations are defined in index.js

module.exports = ChatSession;
