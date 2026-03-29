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
// mode: 'safe' (default) = create tables only if not exist
//        'alter'          = add/modify columns to match model (safe for production)
//        'force'          = drop & recreate all tables (DESTROYS DATA!)
const syncModels = async (mode = 'safe') => {
    try {
        const syncOptions = {};
        if (mode === 'force') {
            syncOptions.force = true;
            console.log('⚠️  Force sync: dropping and recreating ALL tables...');
        } else if (mode === 'alter') {
            syncOptions.alter = true;
            console.log('🔄 Alter sync: updating table schemas to match models...');
        }

        await sequelize.sync(syncOptions);
        console.log('✅ All models synchronized successfully.');
    } catch (error) {
        console.error('❌ Error synchronizing models:', error.message);
        if (mode !== 'alter') {
            // Fallback: try alter mode if safe mode failed
            try {
                console.log('⏳ Retrying with ALTER mode...');
                await sequelize.sync({ alter: true });
                console.log('✅ Models synchronized with ALTER mode.');
            } catch (alterError) {
                console.error('❌ ALTER sync also failed:', alterError.message);
                throw alterError;
            }
        } else {
            throw error;
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

