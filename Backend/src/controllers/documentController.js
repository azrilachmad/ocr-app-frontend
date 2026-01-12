const { Document, User } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

/**
 * GET /api/documents
 * Get all documents with filters and pagination
 */
const getAllDocuments = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            documentType,
            status,
            saved,
            search,
            startDate,
            endDate
        } = req.query;

        const offset = (page - 1) * limit;

        // Build where clause
        const where = { userId: req.userId };

        if (documentType && documentType !== 'all') {
            where.documentType = documentType;
        }

        if (status && status !== 'all') {
            where.status = status;
        }

        if (saved !== undefined) {
            where.saved = saved === 'true';
        } else {
            // Default to showing only saved documents
            where.saved = true;
        }

        if (search) {
            where.fileName = { [Op.like]: `%${search}%` };
        }

        if (startDate && endDate) {
            where.scannedAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const { count, rows } = await Document.findAndCountAll({
            where,
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
 * Update document (edit content)
 */
const updateDocument = async (req, res, next) => {
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

        // Only saved documents can be edited
        if (!document.saved) {
            return res.status(400).json({
                success: false,
                message: 'Only saved documents can be edited.'
            });
        }

        const { content, fileName } = req.body;

        if (content !== undefined) {
            // Ensure content is stored as JSON string
            document.content = typeof content === 'string' ? content : JSON.stringify(content);
        }
        if (fileName) document.fileName = fileName;

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
 * Mark document as saved
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

        document.saved = true;
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
 * Get last 10 unsaved scans
 */
const getRecentScans = async (req, res, next) => {
    try {
        const scans = await Document.findAll({
            where: {
                userId: req.userId,
                saved: false
            },
            order: [['scannedAt', 'DESC']],
            limit: 10
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
        // Get all unsaved documents for this user, ordered by date
        const allUnsaved = await Document.findAll({
            where: {
                userId: userId,
                saved: false
            },
            order: [['scannedAt', 'DESC']]
        });

        // If more than 10, delete the older ones
        if (allUnsaved.length > 10) {
            const toDelete = allUnsaved.slice(10);
            for (const doc of toDelete) {
                // Delete file from storage if exists
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
