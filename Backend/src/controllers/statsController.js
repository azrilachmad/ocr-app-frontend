const { Document } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

/**
 * GET /api/stats/overview
 * Get dashboard overview statistics
 */
const getOverview = async (req, res, next) => {
    try {
        const userId = req.userId;

        // Total scans
        const totalScans = await Document.count({ where: { userId } });

        // By status
        const successful = await Document.count({
            where: { userId, status: 'completed' }
        });
        const processing = await Document.count({
            where: { userId, status: 'processing' }
        });
        const failed = await Document.count({
            where: { userId, status: 'failed' }
        });

        // Saved documents count
        const savedCount = await Document.count({
            where: { userId, saved: true }
        });

        // Success rate
        const successRate = totalScans > 0
            ? ((successful / totalScans) * 100).toFixed(1)
            : 0;

        res.json({
            success: true,
            data: {
                totalScans,
                successful,
                processing,
                failed,
                savedCount,
                successRate: parseFloat(successRate)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/stats/chart
 * Get scan activity data for chart (by date range)
 * Uses Indonesian timezone (WIB/UTC+7) for date grouping
 */
const getChartData = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { startDate, endDate } = req.query;

        // Indonesian timezone offset (UTC+7)
        const WIB_OFFSET = 7 * 60 * 60 * 1000;

        // Default to last 7 days in WIB
        const nowWIB = new Date(Date.now() + WIB_OFFSET);

        let end, start;

        if (endDate) {
            // Parse as WIB date (end of day)
            end = new Date(endDate + 'T23:59:59.999+07:00');
        } else {
            end = new Date();
        }

        if (startDate) {
            // Parse as WIB date (start of day)
            start = new Date(startDate + 'T00:00:00.000+07:00');
        } else {
            // Default to 7 days ago
            start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        const documents = await Document.findAll({
            where: {
                userId,
                scannedAt: {
                    [Op.between]: [start, end]
                }
            },
            attributes: [
                // Convert to WIB timezone before extracting date
                [literal("DATE(scanned_at + INTERVAL 7 HOUR)"), 'date'],
                [fn('COUNT', col('id')), 'scans']
            ],
            group: [literal("DATE(scanned_at + INTERVAL 7 HOUR)")],
            order: [[literal("DATE(scanned_at + INTERVAL 7 HOUR)"), 'ASC']],
            raw: true
        });

        res.json({
            success: true,
            data: documents
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/stats/by-type
 * Get document count by type
 */
const getByType = async (req, res, next) => {
    try {
        const userId = req.userId;

        const typeStats = await Document.findAll({
            where: { userId },
            attributes: [
                'documentType',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['documentType'],
            order: [[fn('COUNT', col('id')), 'DESC']]
        });

        // Calculate percentages
        const total = typeStats.reduce((sum, t) => sum + parseInt(t.dataValues.count), 0);
        const result = typeStats.map(t => ({
            type: t.documentType,
            count: parseInt(t.dataValues.count),
            percentage: total > 0
                ? ((parseInt(t.dataValues.count) / total) * 100).toFixed(1)
                : 0
        }));

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/stats/recent
 * Get recent scans
 */
const getRecentScans = async (req, res, next) => {
    try {
        const userId = req.userId;
        const limit = parseInt(req.query.limit) || 5;

        const recentScans = await Document.findAll({
            where: { userId },
            order: [['scannedAt', 'DESC']],
            limit
        });

        res.json({
            success: true,
            data: recentScans
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getOverview,
    getChartData,
    getByType,
    getRecentScans
};
