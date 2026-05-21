const { Document, User } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const { sequelize } = require('../config/database');
const path = require('path');
const fs = require('fs');

/**
 * GET /api/documents
 * Get all documents with filters, tag filtering, full-text search, and pagination
 */
const getAllDocuments = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            documentType,
            documentTypes, // comma-separated list for mode filtering
            status,
            saved,
            search,
            tags,
            startDate,
            endDate
        } = req.query;

        const offset = (page - 1) * limit;

        // Build where clause — verificator+ sees all docs, user sees own only
        const isPrivileged = ['verificator', 'admin', 'superadmin'].includes(req.user?.role);
        const where = {};
        if (!isPrivileged) {
            where.userId = req.userId;
        }

        if (documentType && documentType !== 'all') {
            where.documentType = documentType;
        } else if (documentTypes) {
            // Support comma-separated document types (for mode filtering)
            const typeList = documentTypes.split(',').map(t => t.trim()).filter(Boolean);
            if (typeList.length > 0) {
                where.documentType = { [Op.in]: typeList };
            }
        }

        if (status && status !== 'all') {
            // Support comma-separated status filter
            const statuses = status.split(',').map(s => s.trim());
            where.status = statuses.length === 1 ? statuses[0] : { [Op.in]: statuses };
        }

        if (saved !== undefined) {
            where.saved = saved === 'true';
        } else {
            // Default: show saved + verified documents (backward compat)
            where[Op.or] = [
                { saved: true },
                { status: { [Op.in]: ['saved', 'verified'] } }
            ];
        }

        // Fitur #1: Full-text search in filename, type, AND content
        if (search) {
            where[Op.and] = where[Op.and] || [];
            where[Op.and].push({
                [Op.or]: [
                    { fileName: { [Op.like]: `%${search}%` } },
                    { documentType: { [Op.like]: `%${search}%` } },
                    // Full-text search inside JSON content
                    literal(`CAST(content AS CHAR) LIKE '%${search.replace(/'/g, "''")}%'`)
                ]
            });
        }

        // Fitur #4: Tag filtering
        if (tags) {
            const tagList = tags.split(',').map(t => t.trim().toLowerCase());
            where[Op.and] = where[Op.and] || [];
            // Match any of the provided tags (OR logic)
            const tagConditions = tagList.map(tag =>
                literal(`JSON_CONTAINS(tags, '"${tag.replace(/'/g, "''")}"')`)
            );
            where[Op.and].push({ [Op.or]: tagConditions });
        }

        if (startDate || endDate) {
            where.scannedAt = {};
            if (startDate) where.scannedAt[Op.gte] = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.scannedAt[Op.lte] = end;
            }
        }

        // Include uploader info for privileged roles
        const includeOptions = isPrivileged ? [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'role']
        }] : [];

        const { count, rows } = await Document.findAndCountAll({
            where,
            include: includeOptions,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['scannedAt', 'DESC']]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/documents/:id
 * Get single document by ID
 */
const getDocumentById = async (req, res, next) => {
    try {
        // Verificator+ can view any document, regular user only own
        const isPrivileged = ['verificator', 'admin', 'superadmin'].includes(req.user?.role);
        const whereClause = { id: req.params.id };
        if (!isPrivileged) whereClause.userId = req.userId;

        // Include uploader info for privileged roles
        const includeOptions = isPrivileged ? [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'role']
        }] : [];

        const document = await Document.findOne({
            where: whereClause,
            include: includeOptions
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found.'
            });
        }

        res.json({
            success: true,
            data: document
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/documents/:id
 * Update document (edit content, tags)
 */
const updateDocument = async (req, res, next) => {
    try {
        const isPrivileged = ['verificator', 'admin', 'superadmin'].includes(req.user?.role);
        const whereClause = { id: req.params.id };
        if (!isPrivileged) whereClause.userId = req.userId;

        const document = await Document.findOne({ where: whereClause });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found.'
            });
        }

        // Only saved/verified documents can be edited
        if (!['saved', 'verified'].includes(document.status) && !document.saved) {
            return res.status(400).json({
                success: false,
                message: 'Only saved or verified documents can be edited.'
            });
        }

        const { content, fileName, tags } = req.body;

        if (content !== undefined) {
            document.content = typeof content === 'string' ? content : JSON.stringify(content);
        }
        if (fileName) document.fileName = fileName;

        // Fitur #4: Tag update via document edit
        if (tags !== undefined) {
            if (!Array.isArray(tags)) {
                return res.status(400).json({ success: false, message: 'Tags must be an array of strings.' });
            }
            if (tags.length > 20) {
                return res.status(400).json({ success: false, message: 'Maximum 20 tags per document.' });
            }
            document.tags = [...new Set(tags.map(t => String(t).trim().toLowerCase()).filter(Boolean))];
        }

        await document.save();

        res.json({
            success: true,
            message: 'Document updated successfully.',
            data: document
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/documents/:id
 * Delete document
 */
const deleteDocument = async (req, res, next) => {
    try {
        const isPrivileged = ['verificator', 'admin', 'superadmin'].includes(req.user?.role);
        const whereClause = { id: req.params.id };
        if (!isPrivileged) whereClause.userId = req.userId;

        const document = await Document.findOne({ where: whereClause });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found.'
            });
        }

        // Delete file from storage if exists
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
 * POST /api/documents/:id/save
 * Mark document as saved (lifecycle transition: completed → saved)
 */
const saveDocument = async (req, res, next) => {
    try {
        const document = await Document.findOne({
            where: {
                id: req.params.id,
                userId: req.userId
            }
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found.'
            });
        }

        // Update content and fileName if provided
        const { content, fileName } = req.body;
        if (content !== undefined) {
            document.content = typeof content === 'string' ? content : JSON.stringify(content);
        }
        if (fileName !== undefined) {
            document.fileName = fileName;
        }

        // Verificator+ documents are auto-verified; regular user → saved (needs review)
        const isPrivileged = ['verificator', 'admin', 'superadmin'].includes(req.user?.role);
        document.saved = true;
        document.status = isPrivileged ? 'verified' : 'saved';
        await document.save();

        res.json({
            success: true,
            message: 'Document saved successfully.',
            data: document
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/documents/recent-scans
 * Get unsaved/completed scans (pending user review)
 */
const getRecentScans = async (req, res, next) => {
    try {
        const scans = await Document.findAll({
            where: {
                userId: req.userId,
                status: { [Op.in]: ['completed', 'queued', 'processing', 'failed'] }
            },
            order: [['scannedAt', 'DESC']],
            limit: 50
        });

        res.json({
            success: true,
            data: scans
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Cleanup old unsaved scans, keeping only 10 most recent per user
 */
const cleanupOldScans = async (userId) => {
    try {
        const allUnsaved = await Document.findAll({
            where: {
                userId: userId,
                saved: false,
                status: { [Op.in]: ['completed', 'failed'] },
                batchId: null // Don't clean batch items
            },
            order: [['scannedAt', 'DESC']]
        });

        // If more than 10, delete the older ones
        if (allUnsaved.length > 10) {
            const toDelete = allUnsaved.slice(10);
            for (const doc of toDelete) {
                if (doc.filePath && fs.existsSync(doc.filePath)) {
                    fs.unlinkSync(doc.filePath);
                }
                await doc.destroy();
            }
            console.log(`🧹 Cleaned up ${toDelete.length} old unsaved scans for user ${userId}`);
        }
    } catch (error) {
        console.error('Error cleaning up old scans:', error);
    }
};

module.exports = {
    getAllDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument,
    saveDocument,
    getRecentScans,
    cleanupOldScans
};
