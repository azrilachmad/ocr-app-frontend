const { User, Document, Settings, SystemConfig } = require('../models');
const { Op, fn, col } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
 */
const getDashboardStats = async (req, res, next) => {
    try {
        // User stats
        const totalUsers = await User.count({ where: { role: { [Op.ne]: 'superadmin' } } });
        const activeUsers = await User.count({ where: { isActive: true, role: { [Op.ne]: 'superadmin' } } });
        const inactiveUsers = await User.count({ where: { isActive: false } });

        // Document/Scan stats
        const totalDocuments = await Document.count();
        const completedScans = await Document.count({ where: { status: 'completed' } });
        const processingScans = await Document.count({ where: { status: 'processing' } });
        const failedScans = await Document.count({ where: { status: 'failed' } });

        // Success rate
        const successRate = totalDocuments > 0
            ? parseFloat(((completedScans / totalDocuments) * 100).toFixed(1))
            : 0;

        // Scans today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const scansToday = await Document.count({
            where: { scannedAt: { [Op.gte]: today } }
        });

        // Storage usage - sum all file sizes
        const allDocs = await Document.findAll({
            attributes: ['fileSize'],
            where: { fileSize: { [Op.ne]: null } },
            raw: true
        });
        let totalStorageBytes = 0;
        allDocs.forEach(doc => {
            if (doc.fileSize) {
                const sizeStr = doc.fileSize.toString().toLowerCase();
                const num = parseFloat(sizeStr);
                if (!isNaN(num)) {
                    if (sizeStr.includes('gb')) totalStorageBytes += num * 1024 * 1024 * 1024;
                    else if (sizeStr.includes('mb')) totalStorageBytes += num * 1024 * 1024;
                    else if (sizeStr.includes('kb')) totalStorageBytes += num * 1024;
                    else totalStorageBytes += num; // assume bytes
                }
            }
        });

        // Users logged in today
        const activeToday = await User.count({
            where: {
                lastLoginAt: { [Op.gte]: today },
                role: { [Op.ne]: 'superadmin' }
            }
        });

        // Recent users (last 5 registered)
        const recentUsers = await User.findAll({
            where: { role: { [Op.ne]: 'superadmin' } },
            order: [['createdAt', 'DESC']],
            limit: 5,
            attributes: ['id', 'name', 'email', 'role', 'isActive', 'lastLoginAt', 'createdAt']
        });

        res.json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                inactiveUsers,
                totalDocuments,
                completedScans,
                processingScans,
                failedScans,
                successRate,
                scansToday,
                storageUsage: totalStorageBytes,
                activeToday,
                recentUsers
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/users
 * List all users (paginated, searchable)
 */
const getUsers = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            role = '',
            status = ''
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const where = { role: { [Op.ne]: 'superadmin' } };

        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        if (role && role !== 'all') {
            where.role = role;
        }

        if (status === 'active') {
            where.isActive = true;
        } else if (status === 'inactive') {
            where.isActive = false;
        }

        const { rows: users, count: total } = await User.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset,
            attributes: ['id', 'name', 'email', 'role', 'isActive', 'features', 'lastLoginAt', 'createdAt', 'updatedAt']
        });

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/users/:id
 * Get user detail
 */
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: ['id', 'name', 'email', 'role', 'isActive', 'features', 'lastLoginAt', 'createdAt', 'updatedAt']
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Count user's documents
        const documentCount = await Document.count({ where: { userId: user.id } });

        res.json({
            success: true,
            data: {
                ...user.toJSON(),
                documentCount
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/admin/users
 * Create a new user
 */
const createUser = async (req, res, next) => {
    try {
        const { email, password, name, role = 'user' } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters.'
            });
        }

        // Check if email exists
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered.'
            });
        }

        // Prevent creating superadmin
        const userRole = role === 'superadmin' ? 'admin' : role;

        const user = await User.create({
            email,
            password,
            name,
            role: userRole
        });

        // Create default settings
        await Settings.create({ userId: user.id });

        res.status(201).json({
            success: true,
            message: 'User created successfully.',
            data: user.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admin/users/:id
 * Update user details
 */
const updateUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Prevent modifying superadmin
        if (user.role === 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot modify superadmin account.'
            });
        }

        const { name, email, role, isActive } = req.body;
        const updates = {};

        if (name !== undefined) updates.name = name;
        if (email !== undefined) {
            // Check if email already used by another user
            const existing = await User.findOne({ where: { email, id: { [Op.ne]: user.id } } });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use by another user.'
                });
            }
            updates.email = email;
        }
        if (role !== undefined && role !== 'superadmin') updates.role = role;
        if (isActive !== undefined) updates.isActive = isActive;

        await user.update(updates);

        res.json({
            success: true,
            message: 'User updated successfully.',
            data: user.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admin/users/:id/reset-password
 * Reset user password
 */
const resetUserPassword = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        if (user.role === 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot reset superadmin password from here.'
            });
        }

        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters.'
            });
        }

        await user.update({ password: newPassword });

        res.json({
            success: true,
            message: 'Password reset successfully.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/admin/users/:id
 * Delete a user
 */
const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        if (user.role === 'superadmin') {
            return res.status(403).json({
                success: false,
                message: 'Cannot delete superadmin account.'
            });
        }

        // Delete associated settings and documents
        await Settings.destroy({ where: { userId: user.id } });
        await Document.destroy({ where: { userId: user.id } });
        await user.destroy();

        res.json({
            success: true,
            message: 'User deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admin/users/:id/features
 * Update feature toggles for a user
 */
const updateUserFeatures = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        const { features } = req.body;

        if (!features || typeof features !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Features must be a valid object.'
            });
        }

        // Ensure current features is an object (Sequelize sometimes returns JSON columns as string depending on DB dialect)
        let currentFeatures = user.features || {};
        if (typeof currentFeatures === 'string') {
            try {
                currentFeatures = JSON.parse(currentFeatures);
            } catch (e) {
                console.error('Error parsing user features:', currentFeatures);
                currentFeatures = { knowledgeBase: false, batchScan: true }; // Fallback default
            }
        }

        // Merge with existing features
        const updatedFeatures = { ...currentFeatures, ...features };

        // Save back to DB
        await user.update({ features: updatedFeatures });

        res.json({
            success: true,
            message: 'Features updated successfully.',
            data: { features: updatedFeatures }
        });
    } catch (error) {
        next(error);
    }
};

// --- User Document Types Management (Admin) ---

/**
 * GET /api/admin/users/:id/document-types
 * Get all document types for a specific user
 */
const getUserDocumentTypes = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const documentTypes = await DocumentType.findAll({
            where: { userId },
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: documentTypes
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/admin/users/:id/document-types
 * Create new document type for a specific user
 */
const createUserDocumentType = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const { name, description, fields, active } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Document type name is required.' });
        }

        const documentType = await DocumentType.create({
            userId,
            name,
            description,
            fields: fields || [],
            active: active !== undefined ? active : true
        });

        res.status(201).json({
            success: true,
            message: 'Document type created successfully.',
            data: documentType
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admin/users/:id/document-types/:typeId
 * Update document type for a specific user
 */
const updateUserDocumentType = async (req, res, next) => {
    try {
        const { id: userId, typeId } = req.params;

        const documentType = await DocumentType.findOne({
            where: { id: typeId, userId }
        });

        if (!documentType) {
            return res.status(404).json({ success: false, message: 'Document type not found for this user.' });
        }

        const { name, description, fields, active } = req.body;

        if (name !== undefined) documentType.name = name;
        if (description !== undefined) documentType.description = description;
        if (fields !== undefined) documentType.fields = fields;
        if (active !== undefined) documentType.active = active;

        await documentType.save();

        res.json({
            success: true,
            message: 'Document type updated successfully.',
            data: documentType
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/admin/users/:id/document-types/:typeId
 * Delete document type for a specific user
 */
const deleteUserDocumentType = async (req, res, next) => {
    try {
        const { id: userId, typeId } = req.params;

        const documentType = await DocumentType.findOne({
            where: { id: typeId, userId }
        });

        if (!documentType) {
            return res.status(404).json({ success: false, message: 'Document type not found for this user.' });
        }

        await documentType.destroy();

        res.json({
            success: true,
            message: 'Document type deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
};


/**
 * GET /api/admin/activity
 * Get user activity log (login history)
 */
const getActivityLog = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const where = { role: { [Op.ne]: 'superadmin' } };

        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const { rows: users, count: total } = await User.findAndCountAll({
            where,
            order: [['lastLoginAt', 'DESC']],
            limit: parseInt(limit),
            offset,
            attributes: ['id', 'name', 'email', 'role', 'isActive', 'lastLoginAt', 'createdAt']
        });

        // Get document counts per user
        const activityData = await Promise.all(
            users.map(async (user) => {
                const documentCount = await Document.count({ where: { userId: user.id } });
                return {
                    ...user.toJSON(),
                    documentCount
                };
            })
        );

        res.json({
            success: true,
            data: {
                activity: activityData,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/documents
 * List all documents across all users (paginated, searchable, filterable)
 */
const getDocuments = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            status = '',
            documentType = ''
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build where clause
        const where = {};

        if (status && status !== 'all') {
            where.status = status;
        }

        if (documentType && documentType !== 'all') {
            where.documentType = documentType;
        }

        if (search) {
            where[Op.or] = [
                { fileName: { [Op.like]: `%${search}%` } }
            ];
        }

        const { rows: documents, count: total } = await Document.findAndCountAll({
            where,
            order: [['scannedAt', 'DESC']],
            limit: parseInt(limit),
            offset,
            include: [{
                model: User,
                attributes: ['id', 'name', 'email'],
                as: 'user'
            }]
        });

        res.json({
            success: true,
            data: {
                documents,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/admin/documents/:id
 * Delete any document by ID (admin)
 */
const adminDeleteDocument = async (req, res, next) => {
    try {
        const document = await Document.findByPk(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found.'
            });
        }

        // Delete file from storage if exists
        const fs = require('fs');
        if (document.filePath && fs.existsSync(document.filePath)) {
            fs.unlinkSync(document.filePath);
        }

        await document.destroy();

        res.json({
            success: true,
            message: 'Document deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Default system configuration
 */
const DEFAULT_CONFIG = {
    max_upload_size: { value: '10', description: 'Maximum upload file size in MB' },
    allowed_file_types: { value: 'jpg,jpeg,png,pdf,webp', description: 'Comma-separated list of allowed file extensions' },
    max_scans_per_day: { value: '100', description: 'Maximum scans per user per day' },
    auto_delete_unsaved_days: { value: '7', description: 'Auto-delete unsaved scans after N days' },
    default_ai_model: { value: 'gemini-2.5-flash', description: 'Default AI model for new users' },
    maintenance_mode: { value: 'false', description: 'Enable maintenance mode (disable scanning)' }
};

/**
 * GET /api/admin/system-config
 * Get all system configuration settings
 */
const getSystemConfig = async (req, res, next) => {
    try {
        let configs = await SystemConfig.findAll({ order: [['key', 'ASC']] });

        // Initialize defaults if empty
        if (configs.length === 0) {
            const entries = Object.entries(DEFAULT_CONFIG).map(([key, { value, description }]) => ({
                key, value, description
            }));
            await SystemConfig.bulkCreate(entries);
            configs = await SystemConfig.findAll({ order: [['key', 'ASC']] });
        }

        res.json({
            success: true,
            data: configs
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/admin/system-config
 * Update system configuration (accepts object of key-value pairs)
 */
const updateSystemConfig = async (req, res, next) => {
    try {
        const updates = req.body; // { key1: value1, key2: value2, ... }

        for (const [key, value] of Object.entries(updates)) {
            await SystemConfig.upsert({
                key,
                value: String(value),
                description: DEFAULT_CONFIG[key]?.description || ''
            });
        }

        const configs = await SystemConfig.findAll({ order: [['key', 'ASC']] });

        res.json({
            success: true,
            message: 'System configuration updated successfully.',
            data: configs
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/admin/scan-statistics
 * Get aggregated scan statistics across all users
 */
const getScanStatistics = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;

        // Date range (default last 30 days)
        const end = endDate ? new Date(endDate + 'T23:59:59.999+07:00') : new Date();
        const start = startDate
            ? new Date(startDate + 'T00:00:00.000+07:00')
            : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Daily scan trend
        const { literal } = require('sequelize');
        const dailyScans = await Document.findAll({
            where: {
                scannedAt: { [Op.between]: [start, end] }
            },
            attributes: [
                [literal("DATE(scanned_at + INTERVAL 7 HOUR)"), 'date'],
                [fn('COUNT', col('id')), 'total'],
                [literal("SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)"), 'completed'],
                [literal("SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)"), 'failed']
            ],
            group: [literal("DATE(scanned_at + INTERVAL 7 HOUR)")],
            order: [[literal("DATE(scanned_at + INTERVAL 7 HOUR)"), 'ASC']],
            raw: true
        });

        // By document type
        const byType = await Document.findAll({
            attributes: [
                'documentType',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['documentType'],
            order: [[fn('COUNT', col('id')), 'DESC']],
            raw: true
        });

        const totalDocs = byType.reduce((sum, t) => sum + parseInt(t.count), 0);
        const typeBreakdown = byType.map(t => ({
            type: t.documentType,
            count: parseInt(t.count),
            percentage: totalDocs > 0 ? parseFloat(((parseInt(t.count) / totalDocs) * 100).toFixed(1)) : 0
        }));

        // Top users by scan count
        const topUsers = await Document.findAll({
            attributes: [
                'userId',
                [fn('COUNT', col('Document.id')), 'scanCount']
            ],
            include: [{
                model: User,
                attributes: ['name', 'email'],
                as: 'user'
            }],
            group: ['userId', 'user.id', 'user.name', 'user.email'],
            order: [[fn('COUNT', col('Document.id')), 'DESC']],
            limit: 10,
            raw: true,
            nest: true
        });

        // Average scans per day in the range
        const daysDiff = Math.max(1, Math.ceil((end - start) / (24 * 60 * 60 * 1000)));
        const totalScansInRange = dailyScans.reduce((sum, d) => sum + parseInt(d.total), 0);
        const avgPerDay = parseFloat((totalScansInRange / daysDiff).toFixed(1));

        res.json({
            success: true,
            data: {
                dailyScans,
                typeBreakdown,
                topUsers,
                summary: {
                    totalScansInRange,
                    avgPerDay,
                    daysInRange: daysDiff
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardStats,
    getUsers,
    getUserById,
    createUser,
    updateUser,
    resetUserPassword,
    deleteUser,
    updateUserFeatures,
    getActivityLog,
    getDocuments,
    adminDeleteDocument,
    getSystemConfig,
    updateSystemConfig,
    getScanStatistics,
    getUserDocumentTypes,
    createUserDocumentType,
    updateUserDocumentType,
    deleteUserDocumentType
};
