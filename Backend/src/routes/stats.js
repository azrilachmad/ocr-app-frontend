const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

router.get('/overview', statsController.getOverview);
router.get('/chart', statsController.getChartData);
router.get('/by-type', statsController.getByType);
router.get('/recent', statsController.getRecentScans);

module.exports = router;
