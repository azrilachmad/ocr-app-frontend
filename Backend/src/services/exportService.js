/**
 * Export Service
 * Generates Excel, CSV, and PDF exports from OCR document data.
 */

let ExcelJS, PDFDocument;
try { ExcelJS = require('exceljs'); } catch { ExcelJS = null; }
try { PDFDocument = require('pdfkit'); } catch { PDFDocument = null; }

/**
 * Flatten nested JSON content into key-value pairs for export.
 */
const flattenContent = (content) => {
    const result = {};
    if (!content || typeof content !== 'object') return result;

    const flatten = (obj, prefix = '') => {
        for (const [key, value] of Object.entries(obj)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (Array.isArray(value)) {
                result[fullKey] = JSON.stringify(value);
            } else if (typeof value === 'object' && value !== null) {
                flatten(value, fullKey);
            } else {
                result[fullKey] = value !== null && value !== undefined ? String(value) : '';
            }
        }
    };

    flatten(content);
    return result;
};

/**
 * Format field labels for display: snake_case → Title Case
 */
const formatLabel = (key) => {
    return key.split(/[_.]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

/**
 * Export a single document to an Excel workbook.
 * @param {object} document - Sequelize Document instance
 * @returns {ExcelJS.Workbook}
 */
const exportToExcel = async (document) => {
    if (!ExcelJS) throw new Error('exceljs package is not installed. Run: npm install exceljs');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Synchro Scan';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(document.documentType || 'Document');

    // Header section
    const headerStyle = { font: { bold: true, size: 11, color: { argb: 'FF4F46E5' } } };
    const valueStyle = { font: { size: 11 } };

    sheet.addRow(['Synchro Scan — Document Export']).font = { bold: true, size: 14, color: { argb: 'FF4F46E5' } };
    sheet.addRow([]);
    const infoFields = [
        ['File Name', document.fileName],
        ['Document Type', document.documentType],
        ['Status', document.status],
        ['Confidence Score', document.confidenceScore ? `${document.confidenceScore}%` : 'N/A'],
        ['Processing Time', document.processingTime || 'N/A'],
        ['Scanned At', document.scannedAt ? new Date(document.scannedAt).toLocaleString('id-ID') : 'N/A'],
        ['Tags', Array.isArray(document.tags) && document.tags.length > 0 ? document.tags.join(', ') : 'None']
    ];
    infoFields.forEach(([label, value]) => {
        const row = sheet.addRow([label, value]);
        row.getCell(1).font = headerStyle.font;
        row.getCell(2).font = valueStyle.font;
    });

    sheet.addRow([]);
    sheet.addRow(['─'.repeat(50)]);
    sheet.addRow(['EXTRACTED DATA']).font = { bold: true, size: 12 };
    sheet.addRow([]);

    // Content fields
    let content = document.content;
    if (typeof content === 'string') {
        try { content = JSON.parse(content); } catch { content = { raw_text: content }; }
    }

    const flatContent = flattenContent(content);
    const headerRow = sheet.addRow(['Field', 'Value']);
    headerRow.font = { bold: true, size: 11 };
    headerRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };
    headerRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E7EB' } };

    for (const [key, value] of Object.entries(flatContent)) {
        sheet.addRow([formatLabel(key), value]);
    }

    // Column widths
    sheet.getColumn(1).width = 30;
    sheet.getColumn(2).width = 70;

    return workbook;
};

/**
 * Export multiple documents to a single Excel workbook.
 * Groups documents by type, one sheet per type.
 */
const exportBatchToExcel = async (documents) => {
    if (!ExcelJS) throw new Error('exceljs package is not installed. Run: npm install exceljs');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Synchro Scan';
    workbook.created = new Date();

    // Group by document type
    const grouped = {};
    documents.forEach(doc => {
        const type = doc.documentType || 'Other';
        if (!grouped[type]) grouped[type] = [];
        grouped[type].push(doc);
    });

    for (const [type, docs] of Object.entries(grouped)) {
        const sheet = workbook.addWorksheet(type.substring(0, 31)); // Excel sheet name max 31 chars

        // Collect all unique field names across docs of this type
        const allFields = new Set();
        docs.forEach(doc => {
            let content = doc.content;
            if (typeof content === 'string') { try { content = JSON.parse(content); } catch { content = {}; } }
            const flat = flattenContent(content);
            Object.keys(flat).forEach(k => allFields.add(k));
        });

        const fields = Array.from(allFields);

        // Header row
        const headers = ['#', 'File Name', 'Status', 'Confidence', 'Scanned At', ...fields.map(formatLabel)];
        const headerRow = sheet.addRow(headers);
        headerRow.font = { bold: true };
        headerRow.eachCell(cell => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        });

        // Data rows
        docs.forEach((doc, i) => {
            let content = doc.content;
            if (typeof content === 'string') { try { content = JSON.parse(content); } catch { content = {}; } }
            const flat = flattenContent(content);

            const rowData = [
                i + 1,
                doc.fileName,
                doc.status,
                doc.confidenceScore ? `${doc.confidenceScore}%` : 'N/A',
                doc.scannedAt ? new Date(doc.scannedAt).toLocaleString('id-ID') : 'N/A',
                ...fields.map(f => flat[f] || '')
            ];
            sheet.addRow(rowData);
        });

        // Auto-width columns
        sheet.columns.forEach(col => { col.width = 20; });
        sheet.getColumn(2).width = 35;
    }

    return workbook;
};

/**
 * Export a single document to CSV string.
 */
const exportToCSV = (document) => {
    const rows = [];
    rows.push('Field,Value');

    rows.push(`File Name,"${(document.fileName || '').replace(/"/g, '""')}"`);
    rows.push(`Document Type,"${document.documentType || ''}"`);
    rows.push(`Status,"${document.status || ''}"`);
    rows.push(`Confidence,"${document.confidenceScore || 'N/A'}%"`);
    rows.push(`Scanned At,"${document.scannedAt ? new Date(document.scannedAt).toLocaleString('id-ID') : 'N/A'}"`);
    rows.push('');

    let content = document.content;
    if (typeof content === 'string') {
        try { content = JSON.parse(content); } catch { content = { raw_text: content }; }
    }

    const flatContent = flattenContent(content);
    for (const [key, value] of Object.entries(flatContent)) {
        const escapedValue = String(value).replace(/"/g, '""');
        rows.push(`"${formatLabel(key)}","${escapedValue}"`);
    }

    return rows.join('\n');
};

/**
 * Export a single document to a PDF buffer.
 */
const exportToPDF = (document) => {
    if (!PDFDocument) throw new Error('pdfkit package is not installed. Run: npm install pdfkit');

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers = [];

        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Title
        doc.fontSize(18).fillColor('#4F46E5').text('Synchro Scan', { align: 'center' });
        doc.fontSize(10).fillColor('#6B7280').text('Document Export Report', { align: 'center' });
        doc.moveDown(1.5);

        // Divider
        doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.5);

        // Document info
        const info = [
            ['File Name', document.fileName],
            ['Document Type', document.documentType],
            ['Status', document.status],
            ['Confidence', document.confidenceScore ? `${document.confidenceScore}%` : 'N/A'],
            ['Processing Time', document.processingTime || 'N/A'],
            ['Scanned At', document.scannedAt ? new Date(document.scannedAt).toLocaleString('id-ID') : 'N/A'],
            ['Tags', Array.isArray(document.tags) && document.tags.length > 0 ? document.tags.join(', ') : 'None']
        ];

        info.forEach(([label, value]) => {
            doc.fontSize(10).fillColor('#374151').font('Helvetica-Bold').text(`${label}: `, { continued: true });
            doc.font('Helvetica').fillColor('#111827').text(String(value || ''));
        });

        doc.moveDown(1);
        doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
        doc.moveDown(0.5);

        doc.fontSize(13).fillColor('#4F46E5').font('Helvetica-Bold').text('Extracted Data');
        doc.moveDown(0.5);

        // Content
        let content = document.content;
        if (typeof content === 'string') {
            try { content = JSON.parse(content); } catch { content = { raw_text: content }; }
        }

        const flatContent = flattenContent(content);

        for (const [key, value] of Object.entries(flatContent)) {
            // Check if we need a new page
            if (doc.y > 700) doc.addPage();

            doc.fontSize(9).fillColor('#6B7280').font('Helvetica-Bold').text(formatLabel(key));
            doc.fontSize(10).fillColor('#111827').font('Helvetica').text(String(value || '-'), { width: 495 });
            doc.moveDown(0.3);
        }

        // Footer
        doc.moveDown(2);
        doc.fontSize(8).fillColor('#9CA3AF').text(
            `Generated by Synchro Scan on ${new Date().toLocaleString('id-ID')}`,
            { align: 'center' }
        );

        doc.end();
    });
};

module.exports = {
    exportToExcel,
    exportBatchToExcel,
    exportToCSV,
    exportToPDF,
    flattenContent,
    formatLabel
};
