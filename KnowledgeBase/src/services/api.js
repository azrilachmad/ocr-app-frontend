import axios from 'axios';

// Dynamic Base URL Resolution
const getApiBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return envUrl;
    }
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return `${window.location.protocol}//${window.location.host}/api`;
    }
    return envUrl || '/api';
};

const api = axios.create({
    baseURL: getApiBaseUrl(),
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });
export const logout = () => api.post('/auth/logout');
export const getProfile = () => api.get('/auth/me');

// KB Categories
export const getCategories = () => api.get('/kb/categories');
export const getCategoryArticles = (slug) => api.get(`/kb/categories/${slug}/articles`);

// KB Articles
export const getArticle = (slug) => api.get(`/kb/articles/${slug}`);
export const searchKB = (query) => api.get(`/kb/search?q=${encodeURIComponent(query)}`);

// KB Dashboard
export const getKBStats = () => api.get('/kb/stats');
export const getPopularArticles = () => api.get('/kb/popular');

// KB Files
export const getFiles = (params) => api.get('/kb/files', { params });
export const downloadFile = (id) => api.get(`/kb/files/${id}/download`, { responseType: 'blob' });

// AI Chat (reuse existing chat endpoints)
export const getChatSessions = () => api.get('/chat/sessions');
export const createChatSession = (title, targetDocumentId = null) => api.post('/chat/sessions', { title, targetDocumentId });
export const getChatMessages = (sessionId) => api.get(`/chat/sessions/${sessionId}/messages`);
export const sendChatMessage = (sessionId, prompt) => api.post(`/chat/sessions/${sessionId}/message`, { prompt });
export const deleteChatSession = (sessionId) => api.delete(`/chat/sessions/${sessionId}`);

export default api;
