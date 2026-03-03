const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Generates a response from the Gemini AI model based on the chat history and document context.
 */
const generateChatResponse = async (history, prompt, documentContext = '', aiModel, apiKey = null, temperature, languageDetection) => {
    if (!aiModel || temperature === undefined || !languageDetection) {
        throw new Error('AI Provider configuration (model, temperature, language) is dynamically required but missing.');
    }
    try {
        const keyToUse = apiKey || process.env.GEMINI_API_KEY || 'dummy_key';
        const genAI = new GoogleGenerativeAI(keyToUse);
        const model = genAI.getGenerativeModel({ model: aiModel });

        let systemInstructionText = `You are a highly intelligent Knowledge Base & Document Assistant for the IHA (Indonesian Heritage Agency) platform, powered by Synchro Scan. You help users understand, analyze, and cross-reference organizational documents, knowledge articles, and operational data.

CONTEXT SOURCES:
- "OCR Document": User's scanned/uploaded documents processed by Synchro Scan
- "KB Article [Category]": Published knowledge base articles organized by categories
- "Available Files": Raw files (PDFs, Excel) available for download in the file directory

BEHAVIORAL RULES:
1. FUZZY MATCHING: Aggressively fuzzy-match user queries against document/article names. Never ask users to spell things perfectly.
2. PROACTIVE ANALYTICS: Use Markdown Tables, Bulleted Lists, and Headers for comparisons, summaries, and financial data. Make responses scannable and beautiful.
3. CROSS-REFERENCING: When asked general questions, scan ALL provided contexts (OCR docs + KB articles + file metadata) and combine data.
4. SOURCE CITATIONS: ALWAYS cite your sources at the end of your response using this format:
   📌 **Sumber:**
   - [Article/Document Name]
   - [Another Source]
   Only cite sources you actually used. Include category name for KB articles, e.g., "[Laporan Operasional] Laporan Galeri Nasional 2025".
5. HONESTY: Only answer based on provided contexts. If info is unavailable, say so clearly and suggest where the user might find it.
6. FRIENDLY TONE: Be conversational, helpful, and natural. Avoid robotic language.
7. CHARTS & VISUALS: When data involves numbers, suggest comparisons or trends. If the user asks for charts, provide the data in clean table format and mention that chart visualization is available.`;

        const detectLang = languageDetection ? languageDetection.toLowerCase() : 'auto';

        if (detectLang === 'id') {
            systemInstructionText += "\n\nCRITICAL INSTRUCTION: You MUST communicate and answer exclusively in Indonesian, maintaining a friendly and natural conversational tone.";
        } else if (detectLang === 'en') {
            systemInstructionText += "\n\nCRITICAL INSTRUCTION: You MUST communicate and answer exclusively in English, maintaining a friendly and natural conversational tone.";
        } else {
            systemInstructionText += "\n\nCRITICAL INSTRUCTION: You MUST automatically detect the language used by the user in their prompt and reply naturally in that EXACT same language.";
        }

        if (documentContext) {
            // Truncate context to prevent exceeding model's token limit
            const MAX_CONTEXT_CHARS = 30000;
            const truncatedContext = documentContext.length > MAX_CONTEXT_CHARS
                ? documentContext.substring(0, MAX_CONTEXT_CHARS) + '\n\n[... context truncated for brevity ...]'
                : documentContext;
            systemInstructionText += `\n\nHere is the organizational knowledge and document data for context:\n\n${truncatedContext}\n\nUse the above data to answer questions accurately. Always cite which specific document or article your answer is based on.`;
        }

        const systemInstructionContent = {
            role: "system",
            parts: [{ text: systemInstructionText }]
        };

        // Format history for Gemini API — strict alternating 'user' and 'model' roles
        const formattedHistory = [];
        let lastRole = null;

        for (const msg of history) {
            const mappedRole = msg.role === 'assistant' ? 'model' : 'user';

            if (mappedRole === lastRole) {
                if (formattedHistory.length > 0) {
                    formattedHistory[formattedHistory.length - 1].parts[0].text += `\n\n${msg.content}`;
                }
            } else {
                formattedHistory.push({
                    role: mappedRole,
                    parts: [{ text: msg.content }]
                });
                lastRole = mappedRole;
            }
        }

        // History MUST end with 'model' response or be empty (next action is sendMessage → 'user')
        if (formattedHistory.length > 0 && formattedHistory[formattedHistory.length - 1].role === 'user') {
            formattedHistory.pop();
        }

        const chat = model.startChat({
            history: formattedHistory,
            systemInstruction: systemInstructionContent,
            generationConfig: {
                maxOutputTokens: 4096,
                temperature: Number(temperature),
            },
        });

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error in AI Service:', error);
        return `API Error: ${error.message}`;
    }
};

/**
 * Summarizes the first user prompt to generate a short title for the chat session.
 */
const generateChatTitle = async (prompt, aiModel, apiKey = null) => {
    if (!aiModel) {
        throw new Error('AI Model parameter is dynamically required but missing.');
    }
    try {
        const keyToUse = apiKey || process.env.GEMINI_API_KEY || 'dummy_key';
        const genAI = new GoogleGenerativeAI(keyToUse);
        const model = genAI.getGenerativeModel({ model: aiModel });
        const result = await model.generateContent(`Generate a very short, concise title (max 4-5 words) summarizing this request: "${prompt}"`);
        const response = await result.response;
        return response.text().replace(/["'\n]/g, '').trim();
    } catch (error) {
        return prompt.length > 30 ? prompt.substring(0, 27) + '...' : prompt;
    }
};

module.exports = {
    generateChatResponse,
    generateChatTitle
};
