import api from './apiService';

/**
 * Get all chat sessions for the user
 * @returns {Promise<Object>} API response with sessions array
 */
const getSessions = async () => {
    const response = await api.get('/chat/sessions');
    return response.data;
};

/**
 * Get messages for a specific chat session
 * @param {string} sessionId 
 * @returns {Promise<Object>} API response with messages array
 */
const getSessionMessages = async (sessionId) => {
    const response = await api.get(`/chat/sessions/${sessionId}/messages`);
    return response.data;
};

/**
 * Create a new chat session
 * @param {string} title Optional title for the session
 * @returns {Promise<Object>} API response with new session
 */
const createSession = async (title = 'New Chat') => {
    const response = await api.post('/chat/sessions', { title });
    return response.data;
};

/**
 * Send a message to get an AI response
 * @param {string} sessionId 
 * @param {string} prompt User message text
 * @returns {Promise<Object>} API response with the AI reply and updated history
 */
const sendMessage = async (sessionId, prompt) => {
    const response = await api.post(`/chat/sessions/${sessionId}/message`, { prompt });
    return response.data;
};

/**
 * Delete a chat session
 * @param {string} sessionId 
 * @returns {Promise<Object>} API response
 */
const deleteSession = async (sessionId) => {
    const response = await api.delete(`/chat/sessions/${sessionId}`);
    return response.data;
};

const chatService = {
    getSessions,
    getSessionMessages,
    createSession,
    sendMessage,
    deleteSession
};

export default chatService;
