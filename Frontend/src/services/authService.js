// File: src/services/authService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance with credentials (for cookies)
const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important: send cookies with requests
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Login user
 * @param {string} email 
 * @param {string} password 
 * @param {boolean} rememberMe 
 * @returns {Promise<object>} user data
 */
export const login = async (email, password, rememberMe = false) => {
    try {
        const response = await api.post('/auth/login', {
            email,
            password,
            rememberMe
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Login failed. Please try again.');
    }
};

/**
 * Register new user
 * @param {string} email 
 * @param {string} password 
 * @param {string} name 
 * @returns {Promise<object>} user data
 */
export const register = async (email, password, name = '') => {
    try {
        const response = await api.post('/auth/register', {
            email,
            password,
            name
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
};

/**
 * Get current user profile
 * @returns {Promise<object>} user data
 */
export const getProfile = async () => {
    try {
        const response = await api.get('/auth/me');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to get profile.');
    }
};

/**
 * Logout user
 * @returns {Promise<object>}
 */
export const logout = async () => {
    try {
        const response = await api.post('/auth/logout');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Logout failed.');
    }
};

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export const checkAuth = async () => {
    try {
        await api.get('/auth/me');
        return true;
    } catch (error) {
        return false;
    }
};

export default api;
