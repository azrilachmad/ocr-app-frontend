const { ChatSession, ChatMessage, Document, Settings, KBArticle, KBFile, KBCategory } = require('../models');
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

        // 1.5 Fetch and Validate User AI Settings BEFORE starting generation
        const userSettings = await Settings.findOne({ where: { userId: req.userId } });

        if (!userSettings || !userSettings.aiModel || !userSettings.languageDetection) {
            return res.status(400).json({
                success: false,
                message: 'AI Model or Language configuration missing. Please update your profile settings.'
            });
        }

        const aiModel = userSettings.aiModel;
        const apiKey = userSettings.apiKey || null;
        const temperature = userSettings.confidenceThreshold !== undefined ? Number(userSettings.confidenceThreshold) : 0.85;
        const languageDetection = userSettings.languageDetection;

        // Update session title if it's the first message
        if (history.length === 0 && session.title === 'New Chat') {
            const newTitle = await aiService.generateChatTitle(prompt, aiModel, apiKey);
            session.title = newTitle;
            // We also update timestamp to put it at top of list
            session.changed('updatedAt', true);
            await session.save();
        } else {
            session.changed('updatedAt', true);
            await session.save();
        }

        // 4. Fetch context — OCR documents + KB articles + KB files
        // OCR documents (user's scanned docs)
        const recentDocs = await Document.findAll({
            where: { userId: req.userId },
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        let documentContext = '';
        recentDocs.forEach(doc => {
            if (doc.content) {
                const textContext = typeof doc.content === 'object' ? JSON.stringify(doc.content, null, 2) : doc.content;
                documentContext += `--- OCR Document: ${doc.fileName} ---\n${textContext}\n\n`;
            }
        });

        // KB Articles (all published knowledge base articles)
        const kbArticles = await KBArticle.findAll({
            where: { status: 'published' },
            include: [{ model: KBCategory, as: 'category', attributes: ['name', 'slug'] }],
            order: [['createdAt', 'DESC']],
            limit: 30
        });

        kbArticles.forEach(art => {
            if (art.content) {
                const catName = art.category?.name || 'Uncategorized';
                documentContext += `--- KB Article [${catName}]: ${art.title} ---\n`;
                if (art.summary) documentContext += `Summary: ${art.summary}\n`;
                documentContext += `${art.content}\n\n`;
            }
        });

        // KB File metadata (so AI knows what files exist)
        const kbFiles = await KBFile.findAll({
            include: [{ model: KBCategory, as: 'category', attributes: ['name'] }],
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        if (kbFiles.length > 0) {
            documentContext += `--- Available Files in Knowledge Base ---\n`;
            kbFiles.forEach(f => {
                documentContext += `• ${f.fileName} (${f.fileType?.toUpperCase()}, ${f.fileSize}) — Category: ${f.category?.name || 'General'}`;
                if (f.description) documentContext += ` — ${f.description}`;
                documentContext += `\n`;
            });
            documentContext += `\n`;
        }

        // 5. Generate AI Response
        const aiResponseText = await aiService.generateChatResponse(history, prompt, documentContext, aiModel, apiKey, temperature, languageDetection);

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
        require('fs').writeFileSync('C:/Users/azril/.gemini/antigravity/brain/8a40289e-5bba-4f22-9711-6ae70c9f09e7/debug.txt', error.stack || String(error));
        res.status(500).json({ success: false, message: 'Server error getting AI response', error: error.message });
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
