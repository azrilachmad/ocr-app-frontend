const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * ActivityLog Model
 * Tracks all user actions across the platform for auditing and monitoring.
 * Designed to grow fast — indexed on user_id, created_at, and [action, created_at].
 */
const ActivityLog = sequelize.define('ActivityLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Nullable for failed login attempts (user not yet identified)
        references: {
            model: 'users',
            key: 'id'
        }
    },
    action: {
        type: DataTypes.ENUM(
            'LOGIN', 'LOGOUT', 'REGISTER',
            'VIEW', 'CREATE', 'UPDATE', 'DELETE',
            'UPLOAD', 'DOWNLOAD',
            'IMPERSONATE', 'STOP_IMPERSONATE',
            'EXPORT', 'SEARCH'
        ),
        allowNull: false
    },
    resource: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Resource path, e.g. auth, admin/users, kb/articles'
    },
    resourceId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Specific resource ID, e.g. user ID, document ID'
    },
    details: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Additional metadata: method, path, statusCode, userAgent, etc.'
    },
    ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'IPv4 or IPv6 address'
    },
    city: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'City from IP geolocation'
    },
    region: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Province/State from IP geolocation'
    },
    country: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'Country code (e.g. ID, US)'
    },
    userAgent: {
        type: DataTypes.STRING(500),
        allowNull: true
    }
}, {
    tableName: 'activity_logs',
    timestamps: true,
    updatedAt: false, // Logs are immutable — no updates needed
    indexes: [
        {
            name: 'idx_activity_user_id',
            fields: ['user_id']
        },
        {
            name: 'idx_activity_created_at',
            fields: ['created_at']
        },
        {
            name: 'idx_activity_action_created',
            fields: ['action', 'created_at']
        },
        {
            name: 'idx_activity_ip',
            fields: ['ip_address']
        }
    ]
});

module.exports = ActivityLog;
