const { sequelize } = require('../config/database');
const User = require('./User');
const Document = require('./Document');
const DocumentType = require('./DocumentType');
const Settings = require('./Settings');
const SystemConfig = require('./SystemConfig');
const ChatSession = require('./ChatSession');
const ChatMessage = require('./ChatMessage');

// Define associations
User.hasMany(Document, { foreignKey: 'userId', as: 'documents' });
Document.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(DocumentType, { foreignKey: 'userId', as: 'documentTypes' });
DocumentType.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Settings, { foreignKey: 'userId', as: 'settings' });
Settings.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(ChatSession, { foreignKey: 'userId', as: 'chatSessions' });
ChatSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });

ChatSession.hasMany(ChatMessage, { foreignKey: 'sessionId', as: 'messages' });
ChatMessage.belongsTo(ChatSession, { foreignKey: 'sessionId', as: 'session' });

// Sync all models
const syncModels = async (force = false) => {
    try {
        await sequelize.sync({ force });
        console.log('✅ All models synchronized successfully.');
    } catch (error) {
        console.error('❌ Error synchronizing models:', error.message);
    }
};

module.exports = {
    sequelize,
    User,
    Document,
    DocumentType,
    Settings,
    SystemConfig,
    ChatSession,
    ChatMessage,
    syncModels
};
