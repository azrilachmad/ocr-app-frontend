/**
 * Analytics Controller
 * Provides rich analytics data for dashboard charts and statistics.
 */
const { Document, User } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

/**
 * GET /api/stats/trends?period=week|month|year
 * Returns scan count per day for the given period.
 */
const getTrends = async (req, res, next) => {
    try {
        const { period = 'month' } = req.query;
        const now = new Date();
        let startDate;

        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            case 'month':
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
        }

        const results = await Document.findAll({
            where: {
                userId: req.userId,
                scannedAt: { [Op.gte]: startDate }
            },
            attributes: [
                [fn('DATE', col('scanned_at')), 'date'],
                [fn('COUNT', col('id')), 'total'],
                [fn('SUM', literal("CASE WHEN status IN ('completed','saved','verified') THEN 1 ELSE 0 END")), 'successful'],
                [fn('SUM', literal("CASE WHEN status = 'failed' THEN 1 ELSE 0 END")), 'failed']
            ],
            group: [fn('DATE', col('scanned_at'))],
            order: [[fn('DATE', col('scanned_at')), 'ASC']],
            raw: true
        });

        // Fill in missing dates with zeros
        const dateMap = {};
        results.forEach(r => {
            const d = r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date);
            dateMap[d] = {
                total: parseInt(r.total) || 0,
                successful: parseInt(r.successful) || 0,
                failed: parseInt(r.failed) || 0
            };
        });

        const labels = [];
        const totals = [];
        const successful = [];
        const failed = [];

        const cursor = new Date(startDate);
        while (cursor <= now) {
            const key = cursor.toISOString().split('T')[0];
            labels.push(key);
            totals.push(dateMap[key]?.total || 0);
            successful.push(dateMap[key]?.successful || 0);
            failed.push(dateMap[key]?.failed || 0);
            cursor.setDate(cursor.getDate() + 1);
        }

        res.json({
            success: true,
            data: {
                labels,
                datasets: [
                    { label: 'Total Scans', data: totals },
                    { label: 'Successful', data: successful },
                    { label: 'Failed', data: failed }
                ]
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/stats/type-distribution
 * Returns document count per type (for pie chart).
 */
const getTypeDistribution = async (req, res, next) => {
    try {
        const results = await Document.findAll({
            where: { userId: req.userId },
            attributes: [
                'documentType',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['documentType'],
            order: [[fn('COUNT', col('id')), 'DESC']],
            raw: true
        });

        const total = results.reduce((sum, r) => sum + parseInt(r.count), 0);
        const data = results.map(r => ({
            name: r.documentType || 'Other',
            value: parseInt(r.count),
            percentage: total > 0 ? parseFloat(((parseInt(r.count) / total) * 100).toFixed(1)) : 0
        }));

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/stats/confidence-avg
 * Returns average confidence score per document type.
 */
const getConfidenceAverage = async (req, res, next) => {
    try {
        const results = await Document.findAll({
            where: {
                userId: req.userId,
                confidenceScore: { [Op.ne]: null },
                status: { [Op.in]: ['completed', 'saved', 'verified'] }
            },
            attributes: [
                'documentType',
                [fn('AVG', col('confidence_score')), 'avgConfidence'],
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['documentType'],
            order: [[fn('AVG', col('confidence_score')), 'DESC']],
            raw: true
        });

        const data = results.map(r => ({
            name: r.documentType || 'Other',
            avgConfidence: parseFloat(parseFloat(r.avgConfidence).toFixed(1)),
            count: parseInt(r.count)
        }));

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/stats/processing-time
 * Returns average processing time per document type.
 */
const getProcessingTimeAvg = async (req, res, next) => {
    try {
        const results = await Document.findAll({
            where: {
                userId: req.userId,
                processingTime: { [Op.ne]: null },
                status: { [Op.in]: ['completed', 'saved', 'verified'] }
            },
            attributes: ['documentType', 'processingTime'],
            raw: true
        });

        // Group and calculate average (processingTime is stored as string like "2.3s")
        const grouped = {};
        results.forEach(r => {
            const type = r.documentType || 'Other';
            if (!grouped[type]) grouped[type] = [];
            const seconds = parseFloat(String(r.processingTime).replace('s', ''));
            if (!isNaN(seconds)) grouped[type].push(seconds);
        });

        const data = Object.entries(grouped).map(([name, times]) => ({
            name,
            avgTime: parseFloat((times.reduce((a, b) => a + b, 0) / times.length).toFixed(1)),
            count: times.length
        }));

        data.sort((a, b) => b.count - a.count);

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTrends,
    getTypeDistribution,
    getConfidenceAverage,
    getProcessingTimeAvg
};
