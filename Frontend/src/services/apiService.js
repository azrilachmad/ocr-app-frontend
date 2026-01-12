// File: src/services/apiService.js
import axios from 'axios';

// Base URL for API - points to the backend server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance with credentials (for cookies)
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important: send cookies with requests
});

/**
 * Process documents with OCR
 * @param {File[]} files - Array of files to process
 * @param {object} options - Processing options (documentType, etc.)
 * @returns {Promise<object>} - OCR result with document_type and content
 */
export const processDocuments = async (files, options = {}) => {
    if (!files || files.length === 0) {
        throw new Error('No files selected for processing.');
    }

    const formData = new FormData();

    // Add files to FormData
    files.forEach(file => {
        formData.append('documentFiles', file);
    });

    // Append AI options if provided
    if (options) {
        formData.append('options', JSON.stringify(options));
    }

    try {
        const response = await api.post('/ocr/process', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || err.message || 'Failed to process document.');
    }
};

/**
 * Rescan an existing document by ID
 * @param {string} documentId - Document ID to rescan
 * @returns {Promise<object>} - Updated OCR result
 */
export const rescanDocument = async (documentId) => {
    try {
        const response = await api.post(`/ocr/rescan/${documentId}`);
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || err.message || 'Failed to rescan document.');
    }
};

/**
 * Save processed document data to database
 * @param {object} dataToSubmit - Document data to save
 * @returns {Promise<object>} - Saved document record
 */
export const submitProcessedData = async (submissionPayload) => {
    const { document_type, content, userDefinedFilename, documentId } = submissionPayload;

    if (!documentId && (!document_type || !content)) {
        throw new Error('Document type and content are required.');
    }

    const formData = new FormData();

    // If documentId is provided, just update existing document
    if (documentId) {
        formData.append('documentId', documentId);
    }

    if (document_type) {
        formData.append('document_type', document_type);
    }

    if (content) {
        formData.append('content', JSON.stringify(content));
    }

    if (userDefinedFilename) {
        formData.append('userDefinedFilename', userDefinedFilename);
    }

    // No need to re-upload files when updating existing document

    try {
        const response = await api.post('/ocr/submit', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to save document.');
    }
};

/**
 * Get all documents from database
 * @param {object} params - Query parameters (type, status, limit, etc.)
 * @returns {Promise<object>} - List of documents
 */
export const getDocuments = async (params = {}) => {
    try {
        const response = await api.get('/documents', { params });
        return response.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to fetch documents.');
    }
};

/**
 * Get recent unsaved scans (last 10)
 * @returns {Promise<object>} - List of recent scans
 */
export const getRecentScans = async () => {
    try {
        const response = await api.get('/documents/recent-scans');
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to fetch recent scans.');
    }
};

/**
 * Get a single document by ID
 * @param {string} id - Document ID
 * @returns {Promise<object>} - Document details
 */
export const getDocumentById = async (id) => {
    try {
        const response = await api.get(`/documents/${id}`);
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to fetch document.');
    }
};

/**
 * Get document file URL for preview
 * @param {string} id - Document ID
 * @returns {string} - URL to fetch document file
 */
export const getDocumentFileUrl = (id) => {
    return `${API_BASE_URL}/documents/${id}/file`;
};

/**
 * Update a document
 * @param {string} id - Document ID
 * @param {object} data - Updated data
 * @returns {Promise<object>} - Updated document
 */
export const updateDocument = async (id, data) => {
    try {
        const response = await api.put(`/documents/${id}`, data);
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to update document.');
    }
};

/**
 * Save a document (mark as saved)
 * @param {string} id - Document ID
 * @param {object} data - Optional data to update (content, fileName)
 * @returns {Promise<object>} - Saved document
 */
export const saveDocument = async (id, data = {}) => {
    try {
        const response = await api.post(`/documents/${id}/save`, data);
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to save document.');
    }
};

/**
 * Delete a document
 * @param {string} id - Document ID
 * @returns {Promise<object>} - Success message
 */
export const deleteDocument = async (id) => {
    try {
        const response = await api.delete(`/documents/${id}`);
        return response.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to delete document.');
    }
};

/**
 * Get dashboard statistics
 * @returns {Promise<object>} - Stats data
 */
export const getStats = async () => {
    try {
        const response = await api.get('/stats/overview');
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to fetch statistics.');
    }
};

/**
 * Get chart data for dashboard
 * @param {string} period - Time period (week, month, year)
 * @returns {Promise<object>} - Chart data
 */
export const getChartData = async (period = 'month') => {
    try {
        const response = await api.get('/stats/chart', { params: { period } });
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to fetch chart data.');
    }
};

// =====================
// Settings API
// =====================

/**
 * Get user settings
 * @returns {Promise<object>} - User settings
 */
export const getSettings = async () => {
    try {
        const response = await api.get('/settings');
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to fetch settings.');
    }
};

/**
 * Update user settings
 * @param {object} data - Settings data to update
 * @returns {Promise<object>} - Updated settings
 */
export const updateSettings = async (data) => {
    try {
        const response = await api.put('/settings', data);
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to update settings.');
    }
};

// =====================
// Document Types API
// =====================

/**
 * Get all document types
 * @returns {Promise<object[]>} - List of document types
 */
export const getDocumentTypes = async () => {
    try {
        const response = await api.get('/settings/document-types');
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to fetch document types.');
    }
};

/**
 * Create a new document type
 * @param {object} data - Document type data
 * @returns {Promise<object>} - Created document type
 */
export const createDocumentType = async (data) => {
    try {
        const response = await api.post('/settings/document-types', data);
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to create document type.');
    }
};

/**
 * Update a document type
 * @param {string} id - Document type ID
 * @param {object} data - Updated data
 * @returns {Promise<object>} - Updated document type
 */
export const updateDocumentType = async (id, data) => {
    try {
        const response = await api.put(`/settings/document-types/${id}`, data);
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to update document type.');
    }
};

/**
 * Delete a document type
 * @param {string} id - Document type ID
 * @returns {Promise<object>} - Success message
 */
export const deleteDocumentType = async (id) => {
    try {
        const response = await api.delete(`/settings/document-types/${id}`);
        return response.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to delete document type.');
    }
};

/**
 * Test AI API connection
 * @param {object} data - { aiModel, apiKey }
 * @returns {Promise<object>} - Test result with response time
 */
export const testAiConnection = async (data) => {
    try {
        const response = await api.post('/settings/test-ai', data);
        return response.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'AI API test failed.');
    }
};

// ============= DASHBOARD STATS API =============

/**
 * Get dashboard overview statistics
 * @returns {Promise<object>} - Overview stats (totalScans, successful, processing, failed, savedCount)
 */
export const getStatsOverview = async () => {
    try {
        const response = await api.get('/stats/overview');
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to fetch overview stats.');
    }
};

/**
 * Get scan activity data for chart
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<object[]>} - Array of { date, scans }
 */
export const getStatsChart = async (startDate, endDate) => {
    try {
        const response = await api.get('/stats/chart', {
            params: { startDate, endDate }
        });
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to fetch chart data.');
    }
};

/**
 * Get document count by type
 * @returns {Promise<object[]>} - Array of { type, count, percentage }
 */
export const getStatsByType = async () => {
    try {
        const response = await api.get('/stats/by-type');
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to fetch stats by type.');
    }
};

/**
 * Get recent scans for dashboard
 * @param {number} limit - Number of recent scans to fetch (default 5)
 * @returns {Promise<object[]>} - Array of recent documents
 */
export const getStatsRecent = async (limit = 5) => {
    try {
        const response = await api.get('/stats/recent', { params: { limit } });
        return response.data.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Failed to fetch recent scans.');
    }
};

export default api;
