const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Google Drive Service
 * Downloads files from Google Drive using user's OAuth access token.
 * No server-side credentials needed — uses the token obtained from
 * Google Picker on the frontend.
 */

// Google Workspace MIME types that need export (not direct download)
const GOOGLE_WORKSPACE_MIME_TYPES = {
    'application/vnd.google-apps.document': 'application/pdf',
    'application/vnd.google-apps.spreadsheet': 'application/pdf',
    'application/vnd.google-apps.presentation': 'application/pdf',
    'application/vnd.google-apps.drawing': 'application/pdf',
};

// Allowed MIME types for OCR processing
const ALLOWED_MIME_TYPES = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    // Google Workspace types (will be exported to PDF)
    ...Object.keys(GOOGLE_WORKSPACE_MIME_TYPES),
];

/**
 * Make an authenticated HTTPS GET request to Google API.
 * Returns a Promise that resolves to the response object.
 */
const googleApiRequest = (url, accessToken, responseType = 'json') => {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const options = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname + parsedUrl.search,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        };

        const req = https.request(options, (res) => {
            // Handle redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return googleApiRequest(res.headers.location, accessToken, responseType)
                    .then(resolve)
                    .catch(reject);
            }

            if (res.statusCode !== 200) {
                let body = '';
                res.on('data', (chunk) => { body += chunk; });
                res.on('end', () => {
                    let errorMessage = `Google Drive API error (${res.statusCode})`;
                    try {
                        const parsed = JSON.parse(body);
                        errorMessage = parsed.error?.message || errorMessage;
                    } catch (e) { /* ignore parse error */ }
                    reject(new Error(errorMessage));
                });
                return;
            }

            if (responseType === 'stream') {
                resolve(res);
            } else {
                let body = '';
                res.on('data', (chunk) => { body += chunk; });
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        reject(new Error('Failed to parse Google Drive API response'));
                    }
                });
            }
        });

        req.on('error', (err) => {
            reject(new Error(`Network error connecting to Google Drive: ${err.message}`));
        });

        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Google Drive API request timed out'));
        });

        req.end();
    });
};

/**
 * Get file metadata from Google Drive.
 * @param {string} fileId - Google Drive file ID
 * @param {string} accessToken - User's OAuth access token
 * @returns {Promise<{id, name, mimeType, size}>}
 */
const getDriveFileMetadata = async (fileId, accessToken) => {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size`;
    const metadata = await googleApiRequest(url, accessToken);
    return {
        id: metadata.id,
        name: metadata.name,
        mimeType: metadata.mimeType,
        size: parseInt(metadata.size) || 0, // Google Workspace files may not have size
    };
};

/**
 * Download a binary file from Google Drive.
 * @param {string} fileId - Google Drive file ID
 * @param {string} accessToken - User's OAuth access token
 * @param {string} destPath - Local destination file path
 * @returns {Promise<number>} - File size in bytes
 */
const downloadBinaryFile = (fileId, accessToken, destPath) => {
    return new Promise(async (resolve, reject) => {
        try {
            const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
            const stream = await googleApiRequest(url, accessToken, 'stream');

            const writeStream = fs.createWriteStream(destPath);
            let downloadedBytes = 0;

            stream.on('data', (chunk) => {
                downloadedBytes += chunk.length;
            });

            stream.pipe(writeStream);

            writeStream.on('finish', () => resolve(downloadedBytes));
            writeStream.on('error', (err) => {
                // Cleanup partial file
                fs.unlink(destPath, () => { });
                reject(new Error(`Failed to save downloaded file: ${err.message}`));
            });

            stream.on('error', (err) => {
                writeStream.destroy();
                fs.unlink(destPath, () => { });
                reject(new Error(`Download stream error: ${err.message}`));
            });
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Export a Google Workspace file (Docs, Sheets, Slides) to a downloadable format.
 * @param {string} fileId - Google Drive file ID
 * @param {string} accessToken - User's OAuth access token
 * @param {string} exportMimeType - Target MIME type (e.g., 'application/pdf')
 * @param {string} destPath - Local destination file path
 * @returns {Promise<number>} - File size in bytes
 */
const exportWorkspaceFile = (fileId, accessToken, exportMimeType, destPath) => {
    return new Promise(async (resolve, reject) => {
        try {
            const url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(exportMimeType)}`;
            const stream = await googleApiRequest(url, accessToken, 'stream');

            const writeStream = fs.createWriteStream(destPath);
            let downloadedBytes = 0;

            stream.on('data', (chunk) => {
                downloadedBytes += chunk.length;
            });

            stream.pipe(writeStream);

            writeStream.on('finish', () => resolve(downloadedBytes));
            writeStream.on('error', (err) => {
                fs.unlink(destPath, () => { });
                reject(new Error(`Failed to save exported file: ${err.message}`));
            });

            stream.on('error', (err) => {
                writeStream.destroy();
                fs.unlink(destPath, () => { });
                reject(new Error(`Export stream error: ${err.message}`));
            });
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Download a file from Google Drive, handling both binary and Workspace files.
 * Workspace files (Google Docs, Sheets, etc.) are automatically exported to PDF.
 *
 * @param {string} fileId - Google Drive file ID
 * @param {string} accessToken - User's OAuth access token
 * @param {string} uploadDir - Upload directory path
 * @param {object} [fileInfo] - Optional pre-fetched file metadata { name, mimeType }
 * @returns {Promise<{filePath, fileName, fileSize, mimeType, isExported}>}
 */
const downloadDriveFile = async (fileId, accessToken, uploadDir, fileInfo = null) => {
    // Get metadata if not provided
    const metadata = fileInfo || await getDriveFileMetadata(fileId, accessToken);
    const { name, mimeType } = metadata;

    // Check if MIME type is allowed
    const isAllowed = ALLOWED_MIME_TYPES.some(t => mimeType.startsWith(t) || mimeType === t);
    if (!isAllowed) {
        throw new Error(`Unsupported file type: ${mimeType}. Only images, PDFs, and Google Docs/Sheets/Slides are supported.`);
    }

    // Determine if this is a Google Workspace file that needs export
    const isWorkspaceFile = GOOGLE_WORKSPACE_MIME_TYPES.hasOwnProperty(mimeType);
    const exportMimeType = isWorkspaceFile ? GOOGLE_WORKSPACE_MIME_TYPES[mimeType] : null;

    // Generate unique filename (same pattern as multer)
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    let ext = path.extname(name);

    // If workspace file, force .pdf extension
    if (isWorkspaceFile) {
        ext = '.pdf';
    }

    // If no extension, infer from MIME type
    if (!ext) {
        const mimeExtMap = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
            'image/webp': '.webp',
            'application/pdf': '.pdf',
        };
        ext = mimeExtMap[mimeType] || '.bin';
    }

    const baseName = path.basename(name, path.extname(name));
    const destFileName = `${baseName}-${uniqueSuffix}${ext}`;
    const destPath = path.join(uploadDir, destFileName);

    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Download or export the file
    let fileSize;
    if (isWorkspaceFile) {
        fileSize = await exportWorkspaceFile(fileId, accessToken, exportMimeType, destPath);
    } else {
        fileSize = await downloadBinaryFile(fileId, accessToken, destPath);
    }

    // Build the final filename for display
    const displayName = isWorkspaceFile ? `${baseName}.pdf` : name;

    return {
        filePath: destPath,
        fileName: displayName,
        originalName: name,
        fileSize,
        mimeType: isWorkspaceFile ? exportMimeType : mimeType,
        isExported: isWorkspaceFile,
    };
};

/**
 * Validate access token by making a simple API call.
 * @param {string} accessToken
 * @returns {Promise<boolean>}
 */
const validateAccessToken = async (accessToken) => {
    try {
        const url = 'https://www.googleapis.com/oauth2/v3/tokeninfo';
        // Use a simple fetch-like call
        await googleApiRequest(`${url}?access_token=${accessToken}`, accessToken);
        return true;
    } catch (err) {
        return false;
    }
};

module.exports = {
    downloadDriveFile,
    getDriveFileMetadata,
    validateAccessToken,
    ALLOWED_MIME_TYPES,
    GOOGLE_WORKSPACE_MIME_TYPES,
};
