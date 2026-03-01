const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const KBArticle = sequelize.define('KBArticle', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'category_id'
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING(280),
        allowNull: false,
        unique: true
    },
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: true
    },
    summary: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    tags: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Comma-separated keyword tags'
    },
    attachments: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Array of { fileName, filePath, fileSize }'
    },
    relatedArticleIds: {
        type: DataTypes.JSON,
        allowNull: true,
        field: 'related_article_ids',
        comment: 'Array of related article IDs'
    },
    authorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'author_id'
    },
    status: {
        type: DataTypes.ENUM('draft', 'published'),
        defaultValue: 'published'
    },
    viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'view_count'
    }
}, {
    tableName: 'kb_articles',
    timestamps: true
});

module.exports = KBArticle;
