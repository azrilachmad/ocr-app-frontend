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
