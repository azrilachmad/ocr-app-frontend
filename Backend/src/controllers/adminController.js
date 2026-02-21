const { User, Document, Settings } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
 */
const getDashboardStats = async (req, res, next) => {
    try {
        const totalUsers = await User.count({ where: { role: { [Op.ne]: 'superadmin' } } });
        const activeUsers = await User.count({ where: { isActive: true, role: { [Op.ne]: 'superadmin' } } });
        const inactiveUsers = await User.count({ where: { isActive: false } });
        const totalDocuments = await Document.count();

        // Users logged in today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
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

        // Merge with existing features
        const updatedFeatures = { ...user.features, ...features };
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

module.exports = {
    getDashboardStats,
    getUsers,
    getUserById,
    createUser,
    updateUser,
    resetUserPassword,
    deleteUser,
    updateUserFeatures,
    getActivityLog
};
