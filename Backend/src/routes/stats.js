const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Existing stats
router.get('/overview', statsController.getOverview);
router.get('/chart', statsController.getChartData);
router.get('/by-type', statsController.getByType);
router.get('/recent', statsController.getRecentScans);

// Analytics (Fitur #3 — Dashboard Analytics)
router.get('/trends', analyticsController.getTrends);
router.get('/type-distribution', analyticsController.getTypeDistribution);
router.get('/confidence-avg', analyticsController.getConfidenceAverage);
router.get('/processing-time', analyticsController.getProcessingTimeAvg);

module.exports = router;
