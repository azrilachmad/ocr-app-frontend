const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const KBCategory = sequelize.define('KBCategory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    icon: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'Article'
    },
    color: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: '#6366F1'
    },
    parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'parent_id'
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'kb_categories',
    timestamps: true
});

module.exports = KBCategory;
