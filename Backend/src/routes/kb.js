const express = require('express');
const router = express.Router();
const { authenticate, requireFeature } = require('../middleware/auth');
const { Document, DocumentType, User, sequelize } = require('../models');
const userInclude = { model: User, as: 'user', attributes: ['id', 'name'] };
const { Op } = require('sequelize');

// All KB routes require authentication + knowledgeBase feature enabled
router.use(authenticate, requireFeature('knowledgeBase'));
const path = require('path');
const fs = require('fs');

// =============================================
// STATS & DASHBOARD
// =============================================

/**
 * GET /api/kb/stats
 * Quick statistics for dashboard — from real OCR documents
 */
router.get('/stats', authenticate, async (req, res, next) => {
    try {
        const totalDocuments = await Document.count({ where: { status: { [Op.in]: ['saved', 'verified'] } } });
        const documentTypes = await Document.count({
            where: { status: { [Op.in]: ['saved', 'verified'] } },
            distinct: true,
            col: 'documentType'
        });
        const totalFiles = await Document.count({
            where: { status: { [Op.in]: ['saved', 'verified'] }, filePath: { [Op.ne]: null } }
        });
        const lastDocument = await Document.findOne({
            where: { status: { [Op.in]: ['saved', 'verified'] } },
            order: [['scannedAt', 'DESC']],
            attributes: ['scannedAt']
        });

        res.json({
            success: true,
            data: {
                totalDocuments,
                totalCategories: documentTypes,
                totalFiles,
                lastUpdated: lastDocument?.scannedAt || null
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/kb/popular
 * Most recent saved documents for dashboard
 */
router.get('/popular', authenticate, async (req, res, next) => {
    try {
        const documents = await Document.findAll({
            where: { status: { [Op.in]: ['saved', 'verified'] } },
            attributes: ['id', 'fileName', 'documentType', 'fileSize', 'confidenceScore', 'scannedAt'],
            include: [userInclude],
            order: [['scannedAt', 'DESC']],
            limit: 5
        });

        res.json({ success: true, data: documents });
    } catch (error) {
        next(error);
    }
});

// =============================================
// CATEGORIES (Document Types)
// =============================================

/**
 * GET /api/kb/categories
 * List document types used in saved documents
 */
router.get('/categories', authenticate, async (req, res, next) => {
    try {
        // Get distinct document types with counts from actual documents
        const results = await Document.findAll({
            where: { status: { [Op.in]: ['saved', 'verified'] } },
            attributes: [
                'documentType',
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'documentCount']
            ],
            group: ['documentType'],
            order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']],
            raw: true
        });

        // Map to category-like structure for frontend compatibility
        const ICON_MAP = {
            'KTP': 'Assessment',
            'NPWP': 'TrendingUp',
            'Invoice': 'Article',
            'Receipt': 'FolderOpen',
            'General': 'Article',
        };
        const COLOR_MAP = {
            'KTP': '#6366F1',
            'NPWP': '#0EA5E9',
            'Invoice': '#10B981',
            'Receipt': '#F59E0B',
            'General': '#8B5CF6',
        };

        const categories = results.map((row, idx) => ({
            id: idx + 1,
            name: row.documentType || 'Lainnya',
            slug: (row.documentType || 'lainnya').toLowerCase().replace(/\s+/g, '-'),
            description: `Dokumen tipe ${row.documentType || 'Lainnya'} yang sudah di-scan`,
            icon: ICON_MAP[row.documentType] || 'Article',
            color: COLOR_MAP[row.documentType] || '#6366F1',
            articleCount: parseInt(row.documentCount) || 0,
            fileCount: parseInt(row.documentCount) || 0,
            order: idx + 1
        }));

        res.json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/kb/categories/:slug/articles
 * List documents filtered by document type
 */
router.get('/categories/:slug/articles', authenticate, async (req, res, next) => {
    try {
        const slug = req.params.slug;
        // Convert slug back to document type name
        const documentType = slug.replace(/-/g, ' ');

        const documents = await Document.findAll({
            where: {
                status: { [Op.in]: ['saved', 'verified'] },
                documentType: { [Op.like]: `%${documentType}%` }
            },
            order: [['scannedAt', 'DESC']]
        });

        // Wrap in category-like structure for frontend compatibility
        const category = {
            name: documents[0]?.documentType || slug,
            slug: slug,
            description: `Dokumen tipe ${documents[0]?.documentType || slug}`,
            articles: documents.map(doc => ({
                id: doc.id,
                title: doc.fileName,
                slug: `doc-${doc.id}`,
                summary: `${doc.documentType} • ${doc.fileSize || 'N/A'} • Confidence: ${doc.confidenceScore || 'N/A'}%`,
                content: typeof doc.content === 'string' ? doc.content : JSON.stringify(doc.content),
                status: 'published',
                createdAt: doc.scannedAt
            }))
        };

        res.json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
});

// =============================================
// ARTICLES (Individual Documents)
// =============================================

/**
 * GET /api/kb/articles/:slug
 * Get single document — slug format: doc-{id}
 */
router.get('/articles/:slug', authenticate, async (req, res, next) => {
    try {
        const slug = req.params.slug;
        let document;

        if (slug.startsWith('doc-')) {
            const docId = slug.replace('doc-', '');
            document = await Document.findOne({
                where: { id: docId, status: { [Op.in]: ['saved', 'verified'] } },
                include: [userInclude]
            });
        } else {
            // Fallback: try to find by fileName similarity
            document = await Document.findOne({
                where: { status: { [Op.in]: ['saved', 'verified'] }, fileName: { [Op.like]: `%${slug.replace(/-/g, ' ')}%` } },
                include: [userInclude]
            });
        }

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found.' });
        }

        // Parse content to extract useful fields
        let parsedContent = document.content;
        if (typeof parsedContent === 'string') {
            try { parsedContent = JSON.parse(parsedContent); } catch { /* keep as string */ }
        }

        // Format as article-like structure
        const article = {
            id: document.id,
            title: document.fileName,
            slug: `doc-${document.id}`,
            summary: `${document.documentType} • ${document.fileSize || 'N/A'}`,
            content: parsedContent,
            tags: document.documentType,
            status: 'published',
            createdAt: document.scannedAt,
            category: {
                name: document.documentType,
                slug: document.documentType?.toLowerCase().replace(/\s+/g, '-'),
                color: '#6366F1'
            },
            // Extra OCR data
            uploadedBy: document.user?.name || 'Unknown',
            confidenceScore: document.confidenceScore,
            processingTime: document.processingTime,
            resolution: document.resolution,
            fileSize: document.fileSize,
            filePath: document.filePath,
            relatedArticles: []
        };

        res.json({ success: true, data: article });
    } catch (error) {
        next(error);
    }
});

// =============================================
// FILES (Document files from uploads)
// =============================================

/**
 * GET /api/kb/files
 * List documents with file info
 */
router.get('/files', authenticate, async (req, res, next) => {
    try {
        const { documentType, search } = req.query;
        const where = { status: { [Op.in]: ['saved', 'verified'] } };

        if (documentType) {
            where.documentType = documentType;
        }
        if (search) {
            where.fileName = { [Op.like]: `%${search}%` };
        }

        const documents = await Document.findAll({
            where,
            include: [userInclude],
            order: [['scannedAt', 'DESC']]
        });

        // Map to file-like structure for frontend compatibility
        const files = documents.map(doc => {
            const ext = doc.fileName ? path.extname(doc.fileName).replace('.', '').toLowerCase() : '';
            return {
                id: doc.id,
                fileName: doc.fileName,
                filePath: doc.filePath,
                fileSize: doc.fileSize || 'N/A',
                fileType: ext || 'image',
                description: `${doc.documentType} • Confidence: ${doc.confidenceScore || 'N/A'}%`,
                uploadedBy: doc.user?.name || 'Unknown',
                category: {
                    id: null,
                    name: doc.documentType,
                    slug: doc.documentType?.toLowerCase().replace(/\s+/g, '-')
                },
                createdAt: doc.scannedAt
            };
        });

        res.json({ success: true, data: files });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/kb/files/:id/download
 * Download a document's original file
 */
router.get('/files/:id/download', authenticate, async (req, res, next) => {
    try {
        const document = await Document.findOne({
            where: { id: req.params.id, status: { [Op.in]: ['saved', 'verified'] } }
        });

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found.' });
        }

        if (!document.filePath) {
            return res.status(404).json({ success: false, message: 'No file associated with this document.' });
        }

        const absolutePath = path.resolve(document.filePath);
        const uploadsDir = path.resolve(__dirname, '../../uploads');

        // Security: ensure file is within uploads directory
        if (!absolutePath.startsWith(uploadsDir)) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({ success: false, message: 'Physical file not found on server.' });
        }

        // Ensure download filename has the correct extension
        let downloadName = document.fileName;
        const actualExt = path.extname(absolutePath).toLowerCase(); // e.g. '.pdf'
        const nameExt = path.extname(downloadName).toLowerCase();
        if (!nameExt && actualExt) {
            // fileName has no extension — append from actual file
            downloadName += actualExt;
        } else if (nameExt !== actualExt && actualExt) {
            // fileName has wrong extension — replace with actual
            downloadName = path.basename(downloadName, nameExt) + actualExt;
        }

        res.download(absolutePath, downloadName);
    } catch (error) {
        next(error);
    }
});

// =============================================
// SEARCH (across saved OCR documents)
// =============================================

/**
 * GET /api/kb/search?q=query
 * Search across saved documents
 */
/**
 * GET /api/kb/search?q=query&tags=tag1,tag2
 * Search across saved/verified documents (full-text including content)
 */
router.get('/search', authenticate, async (req, res, next) => {
    try {
        const { q, tags: tagFilter } = req.query;
        if (!q || q.trim() === '') {
            return res.json({ success: true, data: { articles: [], files: [], documents: [] } });
        }

        const searchTerm = `%${q.trim()}%`;
        const safeQuery = q.trim().replace(/'/g, "''");

        // Build where clause
        const whereClause = {
            // Saved and verified documents appear in KB
            status: { [Op.in]: ['saved', 'verified'] },
            // Full-text search: filename, type, AND content (Fitur #1)
            [Op.and]: [
                {
                    [Op.or]: [
                        { fileName: { [Op.like]: searchTerm } },
                        { documentType: { [Op.like]: searchTerm } },
                        sequelize.literal(`CAST(content AS CHAR) LIKE '%${safeQuery}%'`)
                    ]
                }
            ]
        };

        // Fitur #4: Tag filtering in KB search
        if (tagFilter) {
            const tagList = tagFilter.split(',').map(t => t.trim().toLowerCase());
            const tagConditions = tagList.map(tag =>
                sequelize.literal(`JSON_CONTAINS(tags, '"${tag.replace(/'/g, "''")}"')`)
            );
            whereClause[Op.and].push({ [Op.or]: tagConditions });
        }

        const documents = await Document.findAll({
            where: whereClause,
            include: [userInclude],
            order: [['scannedAt', 'DESC']],
            limit: 20
        });

        /**
         * Generate a snippet showing where the search term was found in content.
         */
        const getMatchSnippet = (content, query) => {
            if (!content || !query) return null;
            let text = typeof content === 'string' ? content : JSON.stringify(content);
            const lowerText = text.toLowerCase();
            const lowerQuery = query.toLowerCase();
            const idx = lowerText.indexOf(lowerQuery);
            if (idx === -1) return null;

            const start = Math.max(0, idx - 50);
            const end = Math.min(text.length, idx + query.length + 50);
            let snippet = (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');
            return snippet;
        };

        const articles = documents.map(doc => ({
            id: doc.id,
            title: doc.fileName,
            slug: `doc-${doc.id}`,
            summary: `${doc.documentType} • ${doc.fileSize || 'N/A'} • Confidence: ${doc.confidenceScore || 'N/A'}%`,
            matchSnippet: getMatchSnippet(doc.content, q.trim()),
            tags: doc.tags || [],
            status: doc.status,
            category: {
                name: doc.documentType,
                slug: doc.documentType?.toLowerCase().replace(/\s+/g, '-'),
                color: '#6366F1'
            }
        }));

        const files = documents.filter(doc => doc.filePath).map(doc => ({
            id: doc.id,
            fileName: doc.fileName,
            fileSize: doc.fileSize || 'N/A',
            tags: doc.tags || [],
            category: {
                name: doc.documentType,
                slug: doc.documentType?.toLowerCase().replace(/\s+/g, '-')
            }
        }));

        res.json({ success: true, data: { articles, files, documents: [] } });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
