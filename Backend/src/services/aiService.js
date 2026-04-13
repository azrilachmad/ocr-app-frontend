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

        let systemInstructionText = `You are a highly intelligent Knowledge Base & Document Assistant for the IHA (Indonesian Heritage Agency) platform, powered by Synchro Scan OCR. Your primary job is to answer questions strictly based on the provided "ORGANIZATIONAL KNOWLEDGE BASE DOCUMENTS" context.

CONTEXT FORMAT:
You will be given a list of documents. Each document contains:
- ID, File name, Category, Uploaded By, Date Scanned
- "Title": The extracted document title.
- "Summary": Highly detailed summary of the document.
- "Data": Structured JSON data extracted from the document (if any).
- "Content": Raw extracted text snippet.

BEHAVIORAL RULES:
1. STRICT ACCURACY: Base your answers EXCLUSIVELY on the provided context. If the context does not contain the answer, say so politely. Do not hallucinate or make up data.
2. FUZZY MATCHING: Users may not spell document names or titles perfectly. Meaning/intent match is more important than exact spelling.
3. PROACTIVE ANALYTICS: Use Markdown Tables, Bulleted Lists, and Headers to present comparisons, financial figures, or summaries clearly. Make responses beautiful and easy to scan.
4. CROSS-REFERENCING: If the user asks a broad question, combine insights from multiple documents across the knowledge base.
5. SOURCE CITATIONS: ALWAYS cite your sources at the very end of your response using this exact format:
   📌 **Sumber Dokumen:**
   - [Document Title or File Name] (Category: X)
   - [Another Document Title] (Category: Y)
   Only cite sources you actively used for the answer.
6. FRIENDLY TONE: Be professional yet assistive and natural.`;
7. CHARTS & VISUALIZATIONS: When the user asks for a chart, graph, visualization, or when data would benefit from visual representation, output chart data using this EXACT format:

\`\`\`chart
{
  "type": "bar",
  "title": "Chart Title Here",
  "data": [
    {"name": "Label1", "value": 100},
    {"name": "Label2", "value": 200}
  ],
  "xKey": "name",
  "yKeys": ["value"],
  "yLabels": ["Display Label"]
}
\`\`\`

Supported chart types: "bar", "line", "pie", "area".
CRITICAL CHART RULE: If the user explicitly requests a specific chart type (e.g., "pie chart", "line chart", "area chart"), you MUST use that exact type in the "type" field. Do NOT default to bar chart. Match the user's request exactly.

Example for pie chart:
\`\`\`chart
{
  "type": "pie",
  "title": "Distribusi Data",
  "data": [
    {"name": "Kategori A", "value": 40},
    {"name": "Kategori B", "value": 35},
    {"name": "Kategori C", "value": 25}
  ],
  "xKey": "name",
  "yKeys": ["value"]
}
\`\`\`

For multi-series data, use multiple yKeys: "yKeys": ["series1", "series2"] with corresponding data fields.
IMPORTANT: Always include explanatory text before and/or after the chart. Never output ONLY a chart without context.
When the user mentions "grafik", "chart", "visualisasi", "diagram", or "perbandingan", proactively include charts.`;

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
