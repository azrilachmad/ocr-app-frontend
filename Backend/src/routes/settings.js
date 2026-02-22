const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');

// User settings (require auth)
router.get('/', authenticate, settingsController.getSettings);
router.put('/', authenticate, settingsController.updateSettings);

// Document types (require auth to scope by user)
router.get('/document-types', authenticate, settingsController.getAllDocumentTypes);
router.post('/document-types', authenticate, settingsController.createDocumentType);
router.put('/document-types/:id', authenticate, settingsController.updateDocumentType);
router.delete('/document-types/:id', authenticate, settingsController.deleteDocumentType);

// Test AI API connection
router.post('/test-ai', authenticate, settingsController.testAiConnection);

module.exports = router;
