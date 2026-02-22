const { Settings, DocumentType } = require('../models');

/**
 * GET /api/settings
 * Get user settings
 */
const getSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne({
            where: { userId: req.userId }
        });

        // Create default settings if not exists
        if (!settings) {
            settings = await Settings.create({ userId: req.userId });
        }

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/settings
 * Update user settings
 */
const updateSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne({
            where: { userId: req.userId }
        });

        if (!settings) {
            settings = await Settings.create({
                userId: req.userId,
                ...req.body
            });
        } else {
            const { aiModel, apiKey, confidenceThreshold, languageDetection, autoCorrect } = req.body;

            if (aiModel !== undefined) settings.aiModel = aiModel;
            if (apiKey !== undefined) settings.apiKey = apiKey;
            if (confidenceThreshold !== undefined) settings.confidenceThreshold = confidenceThreshold;
            if (languageDetection !== undefined) settings.languageDetection = languageDetection;
            if (autoCorrect !== undefined) settings.autoCorrect = autoCorrect;

            await settings.save();
        }

        res.json({
            success: true,
            message: 'Settings updated successfully.',
            data: settings
        });
    } catch (error) {
        next(error);
    }
};

// --- Document Type Configuration ---

/**
 * GET /api/document-types
 * Get all document types
 */
const getAllDocumentTypes = async (req, res, next) => {
    try {
        const documentTypes = await DocumentType.findAll({
            where: { userId: req.userId },
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: documentTypes
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/document-types
 * Create new document type
 */
const createDocumentType = async (req, res, next) => {
    try {
        const { name, description, fields, active } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Document type name is required.'
            });
        }

        const documentType = await DocumentType.create({
            userId: req.userId,
            name,
            description,
            fields: fields || [],
            active: active !== undefined ? active : true
        });

        res.status(201).json({
            success: true,
            message: 'Document type created successfully.',
            data: documentType
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/document-types/:id
 * Update document type
 */
const updateDocumentType = async (req, res, next) => {
    try {
        const documentType = await DocumentType.findOne({
            where: { id: req.params.id, userId: req.userId }
        });

        if (!documentType) {
            return res.status(404).json({
                success: false,
                message: 'Document type not found.'
            });
        }

        const { name, description, fields, active } = req.body;

        if (name !== undefined) documentType.name = name;
        if (description !== undefined) documentType.description = description;
        if (fields !== undefined) documentType.fields = fields;
        if (active !== undefined) documentType.active = active;

        await documentType.save();

        res.json({
            success: true,
            message: 'Document type updated successfully.',
            data: documentType
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/document-types/:id
 * Delete document type
 */
const deleteDocumentType = async (req, res, next) => {
    try {
        const documentType = await DocumentType.findOne({
            where: { id: req.params.id, userId: req.userId }
        });

        if (!documentType) {
            return res.status(404).json({
                success: false,
                message: 'Document type not found.'
            });
        }

        await documentType.destroy();

        res.json({
            success: true,
            message: 'Document type deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/settings/test-ai
 * Test AI API connection
 */
const testAiConnection = async (req, res, next) => {
    try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');

        // Get API key from request body only (from user settings)
        const apiKey = req.body.apiKey;
        const aiModel = req.body.aiModel || 'gemini-2.5-flash';

        if (!apiKey) {
            return res.status(400).json({
                success: false,
                message: 'API key is required. Please configure your API key in settings.'
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: aiModel });

        const startTime = Date.now();

        // Simple test prompt
        const result = await model.generateContent('Say "Hello! AI connection successful." in exactly those words.');
        const response = await result.response;
        const text = response.text();

        const responseTime = Date.now() - startTime;

        res.json({
            success: true,
            message: 'AI API connection successful!',
            data: {
                model: aiModel,
                responseTime: `${responseTime}ms`,
                testResponse: text.substring(0, 100)
            }
        });
    } catch (error) {
        console.error('AI API test failed:', error);

        let errorMessage = 'AI API connection failed.';
        if (error.message.includes('API_KEY_INVALID')) {
            errorMessage = 'Invalid API key. Please check your Gemini API key.';
        } else if (error.message.includes('PERMISSION_DENIED')) {
            errorMessage = 'Permission denied. API key may not have access to this model.';
        } else if (error.message.includes('QUOTA_EXCEEDED')) {
            errorMessage = 'API quota exceeded. Please try again later.';
        } else if (error.message.includes('model')) {
            errorMessage = `Model "${req.body.aiModel || 'gemini-2.5-flash'}" is not available. Please select a different model.`;
        }

        res.status(400).json({
            success: false,
            message: errorMessage,
            error: error.message
        });
    }
};

module.exports = {
    getSettings,
    updateSettings,
    getAllDocumentTypes,
    createDocumentType,
    updateDocumentType,
    deleteDocumentType,
    testAiConnection
};

