/**
 * Validation Service for OCR Results
 * Runs validation rules against extracted OCR data and returns warnings.
 * Warnings are informational — data is always saved regardless.
 */

/**
 * Built-in validation rules per document type.
 * Each field maps to an array of rule objects.
 */
const VALIDATION_RULES = {
    'KTP': {
        'nik': [
            { rule: 'required', message: 'NIK tidak ditemukan' },
            { rule: 'length', value: 16, message: 'NIK harus 16 digit' },
            { rule: 'numeric', message: 'NIK harus berupa angka' }
        ],
        'nama': [
            { rule: 'required', message: 'Nama tidak ditemukan' }
        ],
        'tempat_lahir': [
            { rule: 'required', message: 'Tempat lahir tidak ditemukan' }
        ],
        'tanggal_lahir': [
            { rule: 'required', message: 'Tanggal lahir tidak ditemukan' },
            { rule: 'dateFormat', message: 'Format tanggal lahir tidak valid (DD-MM-YYYY)' }
        ],
        'jenis_kelamin': [
            { rule: 'enum', values: ['LAKI-LAKI', 'PEREMPUAN', 'Laki-laki', 'Perempuan'], message: 'Jenis kelamin tidak valid' }
        ],
        'alamat': [
            { rule: 'required', message: 'Alamat tidak ditemukan' }
        ]
    },
    'KK': {
        'no_kk': [
            { rule: 'required', message: 'Nomor KK tidak ditemukan' },
            { rule: 'length', value: 16, message: 'Nomor KK harus 16 digit' },
            { rule: 'numeric', message: 'Nomor KK harus berupa angka' }
        ],
        'kepala_keluarga': [
            { rule: 'required', message: 'Nama kepala keluarga tidak ditemukan' }
        ]
    },
    'STNK': {
        'no_registrasi': [
            { rule: 'required', message: 'Nomor registrasi tidak ditemukan' }
        ],
        'nama_pemilik': [
            { rule: 'required', message: 'Nama pemilik tidak ditemukan' }
        ],
        'no_rangka': [
            { rule: 'required', message: 'Nomor rangka tidak ditemukan' },
            { rule: 'minLength', value: 10, message: 'Nomor rangka terlalu pendek (min 10 karakter)' }
        ],
        'no_mesin': [
            { rule: 'required', message: 'Nomor mesin tidak ditemukan' }
        ]
    },
    'BPKB': {
        'no_bpkb': [
            { rule: 'required', message: 'Nomor BPKB tidak ditemukan' }
        ],
        'no_registrasi': [
            { rule: 'required', message: 'Nomor registrasi tidak ditemukan' }
        ],
        'nama_pemilik': [
            { rule: 'required', message: 'Nama pemilik tidak ditemukan' }
        ]
    },
    'Invoice': {
        'no_invoice': [
            { rule: 'required', message: 'Nomor invoice tidak ditemukan' }
        ],
        'tanggal': [
            { rule: 'required', message: 'Tanggal invoice tidak ditemukan' }
        ],
        'total': [
            { rule: 'required', message: 'Total tidak ditemukan' }
        ]
    }
};

/**
 * Check if a string looks like a valid date in common formats.
 */
const isValidDateString = (str) => {
    if (!str || typeof str !== 'string') return false;
    // Accept DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD, and natural language dates
    const patterns = [
        /^\d{2}[-/]\d{2}[-/]\d{4}$/,
        /^\d{4}[-/]\d{2}[-/]\d{2}$/,
        /^\d{1,2}\s+\w+\s+\d{4}$/i
    ];
    return patterns.some(p => p.test(str.trim()));
};

/**
 * Apply a single validation rule against a value.
 * @returns {string|null} Warning message if validation fails, null if passes.
 */
const applyRule = (value, rule) => {
    const strValue = value !== null && value !== undefined ? String(value).trim() : '';

    switch (rule.rule) {
        case 'required':
            if (!strValue || strValue === '-' || strValue.toLowerCase() === 'n/a') {
                return rule.message;
            }
            break;

        case 'length':
            if (strValue && strValue.replace(/\s/g, '').length !== rule.value) {
                return `${rule.message} (ditemukan ${strValue.replace(/\s/g, '').length} karakter)`;
            }
            break;

        case 'minLength':
            if (strValue && strValue.length < rule.value) {
                return `${rule.message} (ditemukan ${strValue.length} karakter)`;
            }
            break;

        case 'numeric':
            if (strValue && !/^\d+$/.test(strValue.replace(/\s/g, ''))) {
                return rule.message;
            }
            break;

        case 'dateFormat':
            if (strValue && !isValidDateString(strValue)) {
                return rule.message;
            }
            break;

        case 'enum':
            if (strValue && !rule.values.some(v => v.toLowerCase() === strValue.toLowerCase())) {
                return `${rule.message} (ditemukan: "${strValue}")`;
            }
            break;

        default:
            break;
    }

    return null;
};

/**
 * Validate OCR extraction results against known rules.
 * @param {string} documentType - The detected document type
 * @param {object} content - The extracted content object
 * @returns {Array<{field: string, message: string, severity: string}>} Array of warnings
 */
const validateOcrResult = (documentType, content) => {
    const warnings = [];

    if (!content || typeof content !== 'object') {
        return warnings;
    }

    const rules = VALIDATION_RULES[documentType];
    if (!rules) {
        // No rules for this document type — that's fine
        return warnings;
    }

    for (const [field, fieldRules] of Object.entries(rules)) {
        const value = content[field];

        for (const rule of fieldRules) {
            const warningMessage = applyRule(value, rule);
            if (warningMessage) {
                warnings.push({
                    field,
                    message: warningMessage,
                    severity: rule.rule === 'required' ? 'error' : 'warning'
                });
                // Only report the first failing rule per field
                break;
            }
        }
    }

    return warnings;
};

module.exports = {
    validateOcrResult,
    VALIDATION_RULES
};
