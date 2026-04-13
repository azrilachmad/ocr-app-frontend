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
        const { title, targetDocumentId } = req.body;

        const session = await ChatSession.create({
            userId: req.userId,
            title: title || 'New Chat',
            targetDocumentId: targetDocumentId || null
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

        // 4. Fetch context
        const User = require('../models').User; // Ensure User is accessible
        let documentContext = '';

        if (session.targetDocumentId) {
            // SINGLE-DOC DEEP CHAT MODE
            const targetDoc = await Document.findOne({
                where: { id: session.targetDocumentId, saved: true },
                include: [{ model: User, as: 'user', attributes: ['name'] }]
            });

            if (targetDoc) {
                documentContext = `--- [DEEP ANALYSIS MODE] ORGANIZATIONAL KNOWLEDGE BASE DOCUMENT ---\n\n`;
                documentContext += `[Document ID: ${targetDoc.id}] File: ${targetDoc.fileName}\n`;
                documentContext += `Category/Type: ${targetDoc.documentType}\n`;
                documentContext += `Uploaded By: ${targetDoc.user?.name || 'System'}\n`;
                documentContext += `Date Scanned: ${new Date(targetDoc.scannedAt).toLocaleDateString('id-ID')}\n\n`;
                
                documentContext += `CRITICAL INSTRUCTION FOR DEEP ANALYSIS MODE:
1. You are specifically focusing on analyzing the ONE document provided below.
2. If the user asks a question whose answer is NOT found anywhere within this document's text or data, you MUST politely state that the information is not available in the current document.
3. DO NOT answer using outside knowledge if the question violates the scope of this document.

Below is the FULL EXTRACTED TEXT and data of the document:\n\n`;

                if (targetDoc.content) {
                    let parsedContent = targetDoc.content;
                    if (typeof parsedContent === 'string') {
                        try { parsedContent = JSON.parse(parsedContent); } catch { /* ignore */ }
                    }

                    if (typeof parsedContent === 'object' && parsedContent !== null) {
                        documentContext += `--- STRUCTURED DATA ---\n${JSON.stringify(parsedContent, null, 2)}\n\n`;
                        if (parsedContent['raw_text']) {
                            documentContext += `--- FULL RAW TEXT ---\n${parsedContent['raw_text']}\n\n`;
                        }
                    } else if (typeof parsedContent === 'string') {
                        documentContext += `--- FULL RAW TEXT ---\n${parsedContent}\n\n`;
                    }
                }
            } else {
                documentContext = 'Document not found or inaccessible.';
            }
        } else {
            // GENERAL KB MODE
            const kbDocs = await Document.findAll({
                where: { saved: true },
                order: [['scannedAt', 'DESC']],
                include: [{ model: User, as: 'user', attributes: ['name'] }],
                limit: 50 // Limit to avoid hitting token caps
            });

            documentContext = '--- ORGANIZATIONAL KNOWLEDGE BASE DOCUMENTS ---\n\n';
            kbDocs.forEach(doc => {
                documentContext += `[Document ID: ${doc.id}] File: ${doc.fileName}\n`;
                documentContext += `Category/Type: ${doc.documentType}\n`;
                documentContext += `Uploaded By: ${doc.user?.name || 'System'}\n`;
                documentContext += `Date Scanned: ${new Date(doc.scannedAt).toLocaleDateString('id-ID')}\n`;
                
                if (doc.content) {
                    let parsedContent = doc.content;
                    if (typeof parsedContent === 'string') {
                        try { parsedContent = JSON.parse(parsedContent); } catch { /* ignore */ }
                    }

                    if (typeof parsedContent === 'object' && parsedContent !== null) {
                        if (parsedContent['Report Title']) {
                            documentContext += `Title: ${parsedContent['Report Title']}\n`;
                        }
                        if (parsedContent['Summary']) {
                            documentContext += `Summary: ${parsedContent['Summary']}\n`;
                        }
                        
                        // Add other structured fields but exclude large raw text to keep it concise
                        const cleanContext = { ...parsedContent };
                        delete cleanContext['Report Title'];
                        delete cleanContext['Summary'];
                        delete cleanContext['raw_text'];
                        delete cleanContext['summary'];
                        
                        if (Object.keys(cleanContext).length > 0) {
                            documentContext += `Data: ${JSON.stringify(cleanContext)}\n`;
                        }
                    } else if (typeof parsedContent === 'string') {
                        // Truncate raw text to 1000 chars to avoid flooding
                        const truncatedText = parsedContent.length > 1000 ? parsedContent.substring(0, 1000) + '...' : parsedContent;
                        documentContext += `Content: ${truncatedText}\n`;
                    }
                }
                documentContext += `\n--------------------------------------------\n\n`;
            });
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
