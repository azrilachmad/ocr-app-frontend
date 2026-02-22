// File: src/services/adminService.js
import api from './authService';

/**
 * Get admin dashboard stats
 */
export const getAdminStats = async () => {
    const response = await api.get('/admin/stats');
    return response.data;
};

/**
 * Get all users (paginated, searchable)
 */
export const getUsers = async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
};

/**
 * Get user by ID
 */
export const getUserById = async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
};

/**
 * Create a new user
 */
export const createUser = async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
};

/**
 * Update user
 */
export const updateUser = async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
};

/**
 * Reset user password
 */
export const resetUserPassword = async (id, newPassword) => {
    const response = await api.put(`/admin/users/${id}/reset-password`, { newPassword });
    return response.data;
};

/**
 * Delete user
 */
export const deleteUser = async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
};

/**
 * Update user feature toggles
 */
export const updateUserFeatures = async (id, features) => {
    const response = await api.put(`/admin/users/${id}/features`, { features });
    return response.data;
};

/**
 * Get activity log
 */
export const getActivityLog = async (params = {}) => {
    const response = await api.get('/admin/activity', { params });
    return response.data;
};

/**
 * Get all documents (admin)
 */
export const getAdminDocuments = async (params = {}) => {
    const response = await api.get('/admin/documents', { params });
    return response.data;
};

/**
 * Delete document (admin)
 */
export const deleteAdminDocument = async (id) => {
    const response = await api.delete(`/admin/documents/${id}`);
    return response.data;
};

/**
 * Get system configuration (admin)
 */
export const getSystemConfig = async () => {
    const response = await api.get('/admin/system-config');
    return response.data;
};

/**
 * Update system configuration (admin)
 */
export const updateSystemConfig = async (configData) => {
    const response = await api.put('/admin/system-config', configData);
    return response.data;
};

/**
 * Get scan statistics (admin)
 */
export const getScanStatistics = async (params = {}) => {
    const response = await api.get('/admin/scan-statistics', { params });
    return response.data;
};

// --- User Document Type Management ---

/**
 * Get document types for a specific user
 */
export const getUserDocumentTypes = async (userId) => {
    const response = await api.get(`/admin/users/${userId}/document-types`);
    return response.data;
};

/**
 * Create document type for a specific user
 */
export const createUserDocumentType = async (userId, data) => {
    const response = await api.post(`/admin/users/${userId}/document-types`, data);
    return response.data;
};

/**
 * Update document type for a specific user
 */
export const updateUserDocumentType = async (userId, typeId, data) => {
    const response = await api.put(`/admin/users/${userId}/document-types/${typeId}`, data);
    return response.data;
};

/**
 * Delete document type for a specific user
 */
export const deleteUserDocumentType = async (userId, typeId) => {
    const response = await api.delete(`/admin/users/${userId}/document-types/${typeId}`);
    return response.data;
};
