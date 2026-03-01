const { sequelize } = require('../config/database');
const User = require('./User');
const Document = require('./Document');
const DocumentType = require('./DocumentType');
const Settings = require('./Settings');
const SystemConfig = require('./SystemConfig');
const ChatSession = require('./ChatSession');
const ChatMessage = require('./ChatMessage');
const KBCategory = require('./KBCategory');
const KBArticle = require('./KBArticle');
const KBFile = require('./KBFile');

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

// KB associations
KBCategory.hasMany(KBArticle, { foreignKey: 'categoryId', as: 'articles' });
KBArticle.belongsTo(KBCategory, { foreignKey: 'categoryId', as: 'category' });

KBCategory.hasMany(KBFile, { foreignKey: 'categoryId', as: 'files' });
KBFile.belongsTo(KBCategory, { foreignKey: 'categoryId', as: 'category' });

KBCategory.hasMany(KBCategory, { foreignKey: 'parentId', as: 'children' });
KBCategory.belongsTo(KBCategory, { foreignKey: 'parentId', as: 'parent' });

User.hasMany(KBArticle, { foreignKey: 'authorId', as: 'articles' });
KBArticle.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// Sync all models
const syncModels = async (force = false) => {
    try {
        await sequelize.sync({ force });
        console.log('✅ All models synchronized successfully.');
    } catch (error) {
        console.error('❌ Error synchronizing models:', error.message);
        // Fallback: try to sync KB models individually
        try {
            console.log('⏳ Attempting to sync KB models individually...');
            await KBCategory.sync({ force });
            await KBArticle.sync({ force });
            await KBFile.sync({ force });
            console.log('✅ KB models synchronized individually.');
        } catch (kbError) {
            console.error('❌ KB model sync also failed:', kbError.message);
        }
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
    KBCategory,
    KBArticle,
    KBFile,
    syncModels
};

