const { GoogleGenerativeAI } = require('@google/generative-ai');

// In a real application, ensure GEMINI_API_KEY is in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

/**
 * Generates a response from the Gemini AI model based on the chat history and document context.
 * @param {Array} history - Array of previous messages { role: 'user' | 'assistant', content: string }
 * @param {string} prompt - The new user prompt
 * @param {string} documentContext - The OCR text from user's documents to be used as context
 * @returns {Promise<string>} The AI's response text
 */
const generateChatResponse = async (history, prompt, documentContext = '') => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Fast and capable model

        // Construct the system instruction/context
        let systemInstruction = "You are a helpful and intelligent AI assistant for an OCR (Optical Character Recognition) application. Your goal is to help the user understand and analyze their scanned documents. Be concise and polite.";

        if (documentContext) {
            systemInstruction += `\n\nHere is the text from the user's documents for context:\n\n${documentContext}\n\nPlease use the above document text to answer their questions accurately.`;
        }

        // Format history for Gemini API
        // Gemini expects 'user' and 'model' roles
        const formattedHistory = history.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({
            history: formattedHistory,
            systemInstruction: {
                parts: [{ text: systemInstruction }],
                role: "system"
            },
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.7,
            },
        });

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error in AI Service:', error);
        // Fallback for development if API key is not set or invalid
        if (error.message.includes('API key not valid') || error.message.includes('dummy_key')) {
            return "I am a simulated AI assistant. To get real responses, please provide a valid GEMINI_API_KEY in the backend .env file. Based on your prompt, I acknowledge your input.";
        }
        throw new Error('Failed to generate AI response');
    }
};

/**
 * Summarizes the first user prompt to generate a short title for the chat session.
 * @param {string} prompt - The first user prompt
 */
const generateChatTitle = async (prompt) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(`Generate a very short, concise title (max 4-5 words) summarizing this request: "${prompt}"`);
        const response = await result.response;
        // Clean up quotes and newlines
        return response.text().replace(/["'\n]/g, '').trim();
    } catch (error) {
        // Fallback
        return prompt.length > 30 ? prompt.substring(0, 27) + '...' : prompt;
    }
}

module.exports = {
    generateChatResponse,
    generateChatTitle
};
