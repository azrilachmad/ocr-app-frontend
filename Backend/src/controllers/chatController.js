const { ChatSession, ChatMessage, Document } = require('../models');
const aiService = require('../services/aiService');

/**
 * @desc    Get all chat sessions for the logged in user
 * @route   GET /api/chat/sessions
 * @access  Private
 */
const getSessions = async (req, res) => {
    try {
        const sessions = await ChatSession.findAll({
            where: { userId: req.userId, isActive: true },
            order: [['updatedAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: sessions
        });
    } catch (error) {
        console.error('Error fetching chat sessions:', error);
        res.status(500).json({ success: false, message: 'Server error fetching chat sessions' });
    }
};

/**
 * @desc    Get messages for a specific chat session
 * @route   GET /api/chat/sessions/:sessionId/messages
 * @access  Private
 */
const getSessionMessages = async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Verify ownership
        const session = await ChatSession.findOne({
            where: { id: sessionId, userId: req.userId }
        });

        if (!session) {
            return res.status(404).json({ success: false, message: 'Chat session not found' });
        }

        const messages = await ChatMessage.findAll({
            where: { sessionId },
            order: [['createdAt', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Error fetching chat messages:', error);
        res.status(500).json({ success: false, message: 'Server error fetching chat messages' });
    }
};

/**
 * @desc    Create a new chat session
 * @route   POST /api/chat/sessions
 * @access  Private
 */
const createSession = async (req, res) => {
    try {
        const { title } = req.body;

        const session = await ChatSession.create({
            userId: req.userId,
            title: title || 'New Chat'
        });

        res.status(201).json({
            success: true,
            data: session
        });
    } catch (error) {
        console.error('Error creating chat session:', error);
        res.status(500).json({ success: false, message: 'Server error creating chat session' });
    }
};

/**
 * @desc    Send a message and get AI response
 * @route   POST /api/chat/sessions/:sessionId/message
 * @access  Private
 */
const sendMessage = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ success: false, message: 'Message content is required' });
        }

        // 1. Verify session ownership
        const session = await ChatSession.findOne({
            where: { id: sessionId, userId: req.userId }
        });

        if (!session) {
            return res.status(404).json({ success: false, message: 'Chat session not found' });
        }

        // 2. Fetch history
        const history = await ChatMessage.findAll({
            where: { sessionId },
            order: [['createdAt', 'ASC']],
            attributes: ['role', 'content']
        });

        // 3. Save User Message
        const userMessage = await ChatMessage.create({
            sessionId,
            role: 'user',
            content: prompt
        });

        // Update session title if it's the first message
        if (history.length === 0 && session.title === 'New Chat') {
            const newTitle = await aiService.generateChatTitle(prompt);
            session.title = newTitle;
            // We also update timestamp to put it at top of list
            session.changed('updatedAt', true);
            await session.save();
        } else {
            session.changed('updatedAt', true);
            await session.save();
        }

        // 4. Fetch context (User's OCR documents)
        // We get the latest 5 documents with extractedText
        const recentDocs = await Document.findAll({
            where: { userId: req.userId },
            order: [['createdAt', 'DESC']],
            limit: 5,
            attributes: ['filename', 'extractedText']
        });

        let documentContext = '';
        recentDocs.forEach(doc => {
            if (doc.extractedText) {
                documentContext += `--- Document: ${doc.filename} ---\n${doc.extractedText}\n\n`;
            }
        });

        // 5. Generate AI Response
        const aiResponseText = await aiService.generateChatResponse(history, prompt, documentContext);

        // 6. Save AI Message
        const assistantMessage = await ChatMessage.create({
            sessionId,
            role: 'assistant',
            content: aiResponseText
        });

        res.status(200).json({
            success: true,
            data: {
                userMessage,
                assistantMessage,
                sessionTitle: session.title
            }
        });
    } catch (error) {
        console.error('Error sending chat message:', error);
        res.status(500).json({ success: false, message: 'Server error getting AI response' });
    }
};

/**
 * @desc    Delete a chat session
 * @route   DELETE /api/chat/sessions/:sessionId
 * @access  Private
 */
const deleteSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await ChatSession.findOne({
            where: { id: sessionId, userId: req.userId }
        });

        if (!session) {
            return res.status(404).json({ success: false, message: 'Chat session not found' });
        }

        await session.destroy();

        res.status(200).json({
            success: true,
            message: 'Chat session deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting chat session:', error);
        res.status(500).json({ success: false, message: 'Server error deleting chat session' });
    }
};

module.exports = {
    getSessions,
    getSessionMessages,
    createSession,
    sendMessage,
    deleteSession
};
