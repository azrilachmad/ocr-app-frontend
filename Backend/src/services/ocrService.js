const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

/**
 * Get the document type specific prompt
 * @param {string} documentType - The document type
 * @param {Array} availableTemplates - List of available document type templates from settings
 */
const getPromptForDocumentType = (documentType, availableTemplates = []) => {
    const prompts = {
        'KTP': `Analyze this Indonesian ID Card (KTP) image and extract all visible information.
Return the data in JSON format with these exact fields:
{
    "nik": "16-digit NIK number",
    "nama": "Full name",
    "tempat_lahir": "Place of birth",
    "tanggal_lahir": "Date of birth (DD-MM-YYYY)",
    "jenis_kelamin": "Gender (LAKI-LAKI/PEREMPUAN)",
    "alamat": "Full address",
    "rt_rw": "RT/RW",
    "kel_desa": "Village/Kelurahan",
    "kecamatan": "District",
    "agama": "Religion",
    "status_perkawinan": "Marital status",
    "pekerjaan": "Occupation",
    "kewarganegaraan": "Citizenship",
    "berlaku_hingga": "Valid until"
}
Only return the JSON object, no additional text.`,

        'KK': `Analyze this Indonesian Family Card (Kartu Keluarga/KK) image and extract all visible information.
Return the data in JSON format with these exact fields:
{
    "no_kk": "KK number",
    "kepala_keluarga": "Head of family name",
    "alamat": "Full address",
    "rt_rw": "RT/RW",
    "kel_desa": "Village/Kelurahan",
    "kecamatan": "District",
    "kabupaten_kota": "City/Regency",
    "provinsi": "Province",
    "anggota_keluarga": [
        {
            "nama": "Member name",
            "nik": "NIK",
            "hubungan": "Relationship",
            "jenis_kelamin": "Gender",
            "tanggal_lahir": "Birth date"
        }
    ]
}
Only return the JSON object, no additional text.`,

        'STNK': `Analyze this Indonesian Vehicle Registration Certificate (STNK) image and extract all visible information.
Return the data in JSON format with these exact fields:
{
    "no_registrasi": "Registration number",
    "nama_pemilik": "Owner name",
    "alamat": "Address",
    "merk": "Vehicle brand",
    "tipe": "Vehicle type",
    "jenis": "Vehicle category",
    "model": "Model",
    "tahun_pembuatan": "Year of manufacture",
    "isi_silinder": "Engine capacity (cc)",
    "no_rangka": "Chassis number",
    "no_mesin": "Engine number",
    "warna": "Color",
    "bahan_bakar": "Fuel type",
    "masa_berlaku": "Valid until"
}
Only return the JSON object, no additional text.`,

        'BPKB': `Analyze this Indonesian Vehicle Ownership Book (BPKB) image and extract all visible information.
Return the data in JSON format with these exact fields:
{
    "no_bpkb": "BPKB number",
    "no_registrasi": "Registration number",
    "nama_pemilik": "Owner name",
    "alamat": "Address",
    "merk": "Vehicle brand",
    "tipe": "Vehicle type",
    "jenis": "Vehicle category",
    "model": "Model",
    "tahun_pembuatan": "Year of manufacture",
    "isi_silinder": "Engine capacity (cc)",
    "no_rangka": "Chassis number",
    "no_mesin": "Engine number",
    "warna": "Color"
}
Only return the JSON object, no additional text.`,

        'Invoice': `Analyze this Invoice/Receipt image and extract all visible information.
Return the data in JSON format with these exact fields:
{
    "no_invoice": "Invoice number",
    "tanggal": "Invoice date",
    "nama_perusahaan": "Company name",
    "alamat_perusahaan": "Company address",
    "nama_pelanggan": "Customer name",
    "alamat_pelanggan": "Customer address",
    "items": [
        {
            "nama_barang": "Item name",
            "jumlah": "Quantity",
            "harga_satuan": "Unit price",
            "total": "Total"
        }
    ],
    "subtotal": "Subtotal",
    "pajak": "Tax",
    "total": "Grand total",
    "metode_pembayaran": "Payment method"
}
Only return the JSON object, no additional text.`
    };

    // Build auto-detect prompt with available templates
    if (documentType === 'auto' || !prompts[documentType]) {
        // Get list of known templates (built-in + custom from settings)
        const builtInTypes = ['KTP', 'KK', 'STNK', 'BPKB', 'Invoice'];
        const customTypes = availableTemplates
            .filter(t => t.active && !builtInTypes.includes(t.name))
            .map(t => t.name);
        const allAvailableTypes = [...builtInTypes, ...customTypes];

        // Build custom template descriptions if available
        let customTemplateInfo = '';
        if (customTypes.length > 0) {
            const customDescriptions = availableTemplates
                .filter(t => t.active && !builtInTypes.includes(t.name))
                .map(t => {
                    const fieldsDesc = t.fields && t.fields.length > 0
                        ? ` with fields: ${t.fields.map(f => f.name || f).join(', ')}`
                        : '';
                    return `- ${t.name}: ${t.description || 'Custom document type'}${fieldsDesc}`;
                })
                .join('\n');
            customTemplateInfo = `\n\nAdditional custom document templates available:\n${customDescriptions}`;
        }

        return `Analyze this document image. First, identify what type of document it is.

Available document types in the system (prioritize matching with these):
${allAvailableTypes.map(t => `- ${t}`).join('\n')}${customTemplateInfo}

Instructions:
1. Identify the document type - try to match with one of the available types above
2. If it matches a known type (KTP, KK, STNK, BPKB, Invoice), extract fields according to that template
3. If it matches a custom type, extract the specified fields
4. If no match, classify as "Other" and extract all visible data

Return the data in JSON format:
{
    "detected_type": "The document type (must be one from the list above if it matches, otherwise 'Other')",
    "confidence": "HIGH/MEDIUM/LOW - how confident you are about the type match",
    "fields": {
        // All extracted fields as key-value pairs
        // Use snake_case for field names
    }
}
Only return the JSON object, no additional text.`;
    }

    return prompts[documentType];
};


/**
 * Process a document image with Gemini AI OCR
 * @param {string} filePath - Path to the image file
 * @param {string} documentType - Type of document (KTP, KK, STNK, BPKB, Invoice, auto)
 * @param {object} options - { apiKey, aiModel, availableTemplates } from user settings
 * @returns {Promise<object>} - Extracted data
 */
const processDocument = async (filePath, documentType = 'auto', options = {}) => {
    const { apiKey, aiModel = 'gemini-2.5-flash', availableTemplates = [] } = options;

    if (!apiKey) {
        throw new Error('API key is required. Please configure your API key in settings.');
    }

    try {
        // Initialize Gemini AI with user's API key
        const genAI = new GoogleGenerativeAI(apiKey);

        // Read the image file
        const imageBuffer = fs.readFileSync(filePath);
        const base64Image = imageBuffer.toString('base64');

        // Determine MIME type
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.pdf': 'application/pdf'
        };
        const mimeType = mimeTypes[ext] || 'image/jpeg';

        // Get the model from user settings
        const model = genAI.getGenerativeModel({ model: aiModel });

        // Prepare the prompt with available templates for better auto-detection
        const prompt = getPromptForDocumentType(documentType, availableTemplates);

        // Generate content with the image
        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType
                }
            },
            prompt
        ]);

        const response = await result.response;
        const text = response.text();

        // Parse the JSON response
        let extractedData;
        try {
            // Try to extract JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                extractedData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            // Return raw text if JSON parsing fails
            extractedData = { raw_text: text };
        }

        // Determine final document type
        let finalDocumentType = documentType;
        if (documentType === 'auto' && extractedData.detected_type) {
            finalDocumentType = extractedData.detected_type;
            // Move fields to top level if auto-detected
            if (extractedData.fields) {
                extractedData = extractedData.fields;
            }
        }

        return {
            success: true,
            documentType: finalDocumentType,
            content: extractedData,
            confidence: 95 // Placeholder confidence score
        };

    } catch (error) {
        console.error('OCR processing error:', error);
        throw new Error(`OCR processing failed: ${error.message}`);
    }
};

module.exports = {
    processDocument,
    getPromptForDocumentType
};
