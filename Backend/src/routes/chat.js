const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// All chat routes require authentication
router.use(authenticate);

// Session endpoints
router.get('/sessions', chatController.getSessions);
router.post('/sessions', chatController.createSession);
router.delete('/sessions/:sessionId', chatController.deleteSession);

// Message endpoints
router.get('/sessions/:sessionId/messages', chatController.getSessionMessages);
router.post('/sessions/:sessionId/message', chatController.sendMessage);

module.exports = router;
