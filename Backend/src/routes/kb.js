const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { KBCategory, KBArticle, KBFile, Document, sequelize } = require('../models');
const { Op } = require('sequelize');

// =============================================
// STATS & DASHBOARD
// =============================================

/**
 * GET /api/kb/stats
 * Quick statistics for dashboard
 */
router.get('/stats', authenticate, async (req, res, next) => {
    try {
        const totalArticles = await KBArticle.count({ where: { status: 'published' } });
        const totalCategories = await KBCategory.count();
        const totalFiles = await KBFile.count();
        const lastArticle = await KBArticle.findOne({ order: [['createdAt', 'DESC']], attributes: ['createdAt'] });

        res.json({
            success: true,
            data: {
                totalArticles,
                totalCategories,
                totalFiles,
                lastUpdated: lastArticle?.createdAt || new Date()
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/kb/popular
 * Popular / recent articles for dashboard
 */
router.get('/popular', authenticate, async (req, res, next) => {
    try {
        const articles = await KBArticle.findAll({
            where: { status: 'published' },
            attributes: ['id', 'title', 'slug', 'summary', 'tags', 'viewCount', 'createdAt'],
            include: [{ model: KBCategory, as: 'category', attributes: ['name', 'slug', 'color', 'icon'] }],
            order: [['viewCount', 'DESC'], ['createdAt', 'DESC']],
            limit: 5
        });
        res.json({ success: true, data: articles });
    } catch (error) {
        next(error);
    }
});

// =============================================
// CATEGORIES
// =============================================

/**
 * GET /api/kb/categories
 * List all categories with article counts
 */
router.get('/categories', authenticate, async (req, res, next) => {
    try {
        const categories = await KBCategory.findAll({
            order: [['order', 'ASC'], ['name', 'ASC']],
            include: [
                { model: KBArticle, as: 'articles', attributes: ['id'] },
                { model: KBFile, as: 'files', attributes: ['id'] }
            ]
        });

        const result = categories.map(cat => ({
            ...cat.toJSON(),
            articleCount: cat.articles?.length || 0,
            fileCount: cat.files?.length || 0,
            articles: undefined,
            files: undefined
        }));

        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/kb/categories/:slug/articles
 * List articles in a category
 */
router.get('/categories/:slug/articles', authenticate, async (req, res, next) => {
    try {
        const category = await KBCategory.findOne({
            where: { slug: req.params.slug },
            include: [{
                model: KBArticle, as: 'articles',
                where: { status: 'published' },
                required: false,
                order: [['createdAt', 'DESC']]
            }]
        });

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found.' });
        }

        res.json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
});

// =============================================
// ARTICLES
// =============================================

/**
 * GET /api/kb/articles/:slug
 * Get single article with related articles
 */
router.get('/articles/:slug', authenticate, async (req, res, next) => {
    try {
        const article = await KBArticle.findOne({
            where: { slug: req.params.slug, status: 'published' },
            include: [{ model: KBCategory, as: 'category', attributes: ['id', 'name', 'slug', 'icon', 'color'] }]
        });

        if (!article) {
            return res.status(404).json({ success: false, message: 'Article not found.' });
        }

        // Increment view count
        await article.increment('viewCount');

        // Fetch related articles
        let relatedArticles = [];
        if (article.relatedArticleIds && article.relatedArticleIds.length > 0) {
            relatedArticles = await KBArticle.findAll({
                where: { id: article.relatedArticleIds, status: 'published' },
                attributes: ['id', 'title', 'slug', 'summary', 'tags']
            });
        }

        res.json({ success: true, data: { ...article.toJSON(), relatedArticles } });
    } catch (error) {
        next(error);
    }
});

// =============================================
// FILES
// =============================================

/**
 * GET /api/kb/files
 * List files with optional filters
 */
router.get('/files', authenticate, async (req, res, next) => {
    try {
        const { categoryId, fileType, search } = req.query;
        const where = {};

        if (categoryId) where.categoryId = categoryId;
        if (fileType) where.fileType = fileType;
        if (search) where.fileName = { [Op.like]: `%${search}%` };

        const files = await KBFile.findAll({
            where,
            include: [{ model: KBCategory, as: 'category', attributes: ['id', 'name', 'slug'] }],
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, data: files });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/kb/files/:id/download
 * Download a file
 */
router.get('/files/:id/download', authenticate, async (req, res, next) => {
    try {
        const file = await KBFile.findByPk(req.params.id);
        if (!file) {
            return res.status(404).json({ success: false, message: 'File not found.' });
        }

        const path = require('path');
        const fs = require('fs');
        const absolutePath = path.resolve(file.filePath);

        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({ success: false, message: 'Physical file not found on server.' });
        }

        res.download(absolutePath, file.fileName);
    } catch (error) {
        next(error);
    }
});

// =============================================
// SEARCH (across articles, files, and OCR data)
// =============================================

/**
 * GET /api/kb/search?q=query
 * Global search across KB content
 */
router.get('/search', authenticate, async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q || q.trim() === '') {
            return res.json({ success: true, data: { articles: [], files: [], documents: [] } });
        }

        const searchTerm = `%${q.trim()}%`;

        // Search articles
        const articles = await KBArticle.findAll({
            where: {
                status: 'published',
                [Op.or]: [
                    { title: { [Op.like]: searchTerm } },
                    { content: { [Op.like]: searchTerm } },
                    { tags: { [Op.like]: searchTerm } },
                    { summary: { [Op.like]: searchTerm } }
                ]
            },
            attributes: ['id', 'title', 'slug', 'summary', 'tags', 'categoryId'],
            include: [{ model: KBCategory, as: 'category', attributes: ['name', 'slug', 'color'] }],
            limit: 10
        });

        // Search files
        const files = await KBFile.findAll({
            where: {
                [Op.or]: [
                    { fileName: { [Op.like]: searchTerm } },
                    { description: { [Op.like]: searchTerm } }
                ]
            },
            include: [{ model: KBCategory, as: 'category', attributes: ['name', 'slug'] }],
            limit: 10
        });

        // Search OCR documents (saved ones)
        const documents = await Document.findAll({
            where: {
                saved: true,
                [Op.or]: [
                    { fileName: { [Op.like]: searchTerm } }
                ]
            },
            attributes: ['id', 'fileName', 'documentType', 'status', 'scannedAt'],
            limit: 10
        });

        res.json({ success: true, data: { articles, files, documents } });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
