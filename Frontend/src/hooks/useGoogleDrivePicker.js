// src/hooks/useGoogleDrivePicker.js
// Google Drive Auth + File Browser integration hook
// Handles: OAuth sign-in, Drive API file listing, folder navigation
import { useState, useCallback, useRef, useEffect } from 'react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

// MIME types we support for OCR
const OCR_SUPPORTED_MIMES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/vnd.google-apps.document',
    'application/vnd.google-apps.spreadsheet',
    'application/vnd.google-apps.presentation',
    'application/vnd.google-apps.folder',
];

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';

/**
 * Load an external script dynamically.
 */
const loadScript = (src, id) => {
    return new Promise((resolve, reject) => {
        if (document.getElementById(id)) { resolve(); return; }
        const script = document.createElement('script');
        script.id = id;
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load: ${src}`));
        document.head.appendChild(script);
    });
};

/**
 * Make authenticated Google API request from browser.
 */
const driveApiFetch = async (endpoint, accessToken, params = {}) => {
    const url = new URL(`${DRIVE_API_BASE}${endpoint}`);
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });
    url.searchParams.set('key', GOOGLE_API_KEY);

    const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error?.message || `Drive API error (${res.status})`);
    }
    return res.json();
};

/**
 * Parse a Google Drive file/folder ID from a shared URL.
 * Supports formats:
 *   - https://drive.google.com/file/d/FILE_ID/view
 *   - https://drive.google.com/open?id=FILE_ID
 *   - https://docs.google.com/document/d/FILE_ID/edit
 *   - https://docs.google.com/spreadsheets/d/FILE_ID/edit
 *   - https://docs.google.com/presentation/d/FILE_ID/edit
 *   - Raw file ID string
 */
export const parseDriveUrl = (input) => {
    if (!input || typeof input !== 'string') return null;
    const trimmed = input.trim();

    // Pattern: /d/FILE_ID/ or /d/FILE_ID
    const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
    if (dMatch) return dMatch[1];

    // Pattern: ?id=FILE_ID
    const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
    if (idMatch) return idMatch[1];

    // Raw ID (alphanumeric + dashes + underscores, 10+ chars)
    if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) return trimmed;

    return null;
};

/**
 * Custom hook for Google Drive integration.
 * Provides: OAuth sign-in, file listing, folder navigation, URL parsing.
 */
const useGoogleDrivePicker = () => {
    const [isConfigured] = useState(!!GOOGLE_CLIENT_ID && !!GOOGLE_API_KEY);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userProfile, setUserProfile] = useState(null);

    // File browser state
    const [files, setFiles] = useState([]);
    const [isLoadingFiles, setIsLoadingFiles] = useState(false);
    const [currentFolder, setCurrentFolder] = useState({ id: 'root', name: 'My Drive' });
    const [folderPath, setFolderPath] = useState([{ id: 'root', name: 'My Drive' }]);
    const [nextPageToken, setNextPageToken] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const accessTokenRef = useRef(null);
    const tokenClientRef = useRef(null);

    /**
     * Initialize Google Identity Services
     */
    const initGIS = useCallback(async () => {
        await loadScript('https://accounts.google.com/gsi/client', 'google-gsi-script');

        if (!tokenClientRef.current) {
            tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: SCOPES,
                callback: '', // Set dynamically
            });
        }
    }, []);

    /**
     * Sign in with Google — get OAuth access token
     */
    const signIn = useCallback(async () => {
        if (!isConfigured) {
            setError('Google Drive is not configured.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await initGIS();

            return new Promise((resolve, reject) => {
                tokenClientRef.current.callback = async (tokenResponse) => {
                    if (tokenResponse.error) {
                        setError(`Sign in failed: ${tokenResponse.error}`);
                        setIsLoading(false);
                        reject(tokenResponse.error);
                        return;
                    }

                    accessTokenRef.current = tokenResponse.access_token;
                    setIsSignedIn(true);

                    // Fetch user profile
                    try {
                        const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                            headers: { 'Authorization': `Bearer ${tokenResponse.access_token}` },
                        });
                        if (profileRes.ok) {
                            const profile = await profileRes.json();
                            setUserProfile({
                                name: profile.name,
                                email: profile.email,
                                picture: profile.picture,
                            });
                        }
                    } catch (e) {
                        // Profile fetch is optional
                    }

                    setIsLoading(false);

                    // Load root files
                    await loadFiles('root');
                    resolve();
                };

                tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
            });
        } catch (err) {
            setError(err.message || 'Failed to sign in with Google.');
            setIsLoading(false);
        }
    }, [isConfigured, initGIS]);

    /**
     * Sign out — revoke token and clear state
     */
    const signOut = useCallback(() => {
        if (accessTokenRef.current) {
            window.google?.accounts?.oauth2?.revoke(accessTokenRef.current, () => { });
        }
        accessTokenRef.current = null;
        setIsSignedIn(false);
        setUserProfile(null);
        setFiles([]);
        setCurrentFolder({ id: 'root', name: 'My Drive' });
        setFolderPath([{ id: 'root', name: 'My Drive' }]);
        setSearchQuery('');
        setNextPageToken(null);
    }, []);

    /**
     * List files in a folder
     */
    const loadFiles = useCallback(async (folderId = 'root', pageToken = null, append = false) => {
        if (!accessTokenRef.current) return;

        setIsLoadingFiles(true);
        setError(null);

        try {
            // Build query
            const mimeFilter = OCR_SUPPORTED_MIMES.map(m => `mimeType='${m}'`).join(' or ');
            let q = `'${folderId}' in parents and trashed=false and (${mimeFilter})`;

            const data = await driveApiFetch('/files', accessTokenRef.current, {
                q,
                fields: 'files(id,name,mimeType,size,thumbnailLink,iconLink,modifiedTime,webViewLink,shared),nextPageToken',
                pageSize: 50,
                orderBy: 'folder,name',
                pageToken: pageToken || undefined,
            });

            const fileList = (data.files || []).map(f => ({
                fileId: f.id,
                name: f.name,
                mimeType: f.mimeType,
                size: parseInt(f.size) || 0,
                thumbnailLink: f.thumbnailLink,
                iconLink: f.iconLink,
                modifiedTime: f.modifiedTime,
                webViewLink: f.webViewLink,
                shared: f.shared,
                isFolder: f.mimeType === 'application/vnd.google-apps.folder',
                isCloudFile: true,
                source: 'google_drive',
            }));

            if (append) {
                setFiles(prev => [...prev, ...fileList]);
            } else {
                setFiles(fileList);
            }
            setNextPageToken(data.nextPageToken || null);
        } catch (err) {
            setError(`Failed to load files: ${err.message}`);
        } finally {
            setIsLoadingFiles(false);
        }
    }, []);

    /**
     * Search files across Drive
     */
    const searchFiles = useCallback(async (query) => {
        if (!accessTokenRef.current || !query.trim()) {
            if (!query.trim()) {
                // Clear search, reload current folder
                await loadFiles(currentFolder.id);
                setSearchQuery('');
            }
            return;
        }

        setIsLoadingFiles(true);
        setError(null);
        setSearchQuery(query);

        try {
            const mimeFilter = OCR_SUPPORTED_MIMES
                .filter(m => m !== 'application/vnd.google-apps.folder')
                .map(m => `mimeType='${m}'`)
                .join(' or ');
            const q = `name contains '${query.replace(/'/g, "\\'")}' and trashed=false and (${mimeFilter})`;

            const data = await driveApiFetch('/files', accessTokenRef.current, {
                q,
                fields: 'files(id,name,mimeType,size,thumbnailLink,iconLink,modifiedTime,webViewLink,shared)',
                pageSize: 50,
                orderBy: 'modifiedTime desc',
            });

            const fileList = (data.files || []).map(f => ({
                fileId: f.id,
                name: f.name,
                mimeType: f.mimeType,
                size: parseInt(f.size) || 0,
                thumbnailLink: f.thumbnailLink,
                iconLink: f.iconLink,
                modifiedTime: f.modifiedTime,
                isFolder: false,
                isCloudFile: true,
                source: 'google_drive',
            }));

            setFiles(fileList);
            setNextPageToken(null);
        } catch (err) {
            setError(`Search failed: ${err.message}`);
        } finally {
            setIsLoadingFiles(false);
        }
    }, [currentFolder, loadFiles]);

    /**
     * Navigate into a folder
     */
    const openFolder = useCallback(async (folder) => {
        setCurrentFolder({ id: folder.fileId, name: folder.name });
        setFolderPath(prev => [...prev, { id: folder.fileId, name: folder.name }]);
        setSearchQuery('');
        await loadFiles(folder.fileId);
    }, [loadFiles]);

    /**
     * Navigate to a specific point in the breadcrumb path
     */
    const navigateToPath = useCallback(async (index) => {
        const target = folderPath[index];
        if (!target) return;
        setCurrentFolder(target);
        setFolderPath(prev => prev.slice(0, index + 1));
        setSearchQuery('');
        await loadFiles(target.id);
    }, [folderPath, loadFiles]);

    /**
     * Load more files (pagination)
     */
    const loadMore = useCallback(async () => {
        if (nextPageToken && !isLoadingFiles) {
            await loadFiles(currentFolder.id, nextPageToken, true);
        }
    }, [nextPageToken, isLoadingFiles, currentFolder, loadFiles]);

    /**
     * Get file metadata by ID (for URL paste feature)
     */
    const getFileMetadata = useCallback(async (fileId) => {
        if (!accessTokenRef.current) {
            throw new Error('Please sign in with Google first to access private files.');
        }

        const data = await driveApiFetch(`/files/${fileId}`, accessTokenRef.current, {
            fields: 'id,name,mimeType,size,thumbnailLink,iconLink,modifiedTime',
        });

        return {
            fileId: data.id,
            name: data.name,
            mimeType: data.mimeType,
            size: parseInt(data.size) || 0,
            thumbnailLink: data.thumbnailLink,
            iconLink: data.iconLink,
            isCloudFile: true,
            source: 'google_drive',
        };
    }, []);

    /**
     * Get the current access token
     */
    const getAccessToken = useCallback(() => accessTokenRef.current, []);

    return {
        // Config
        isConfigured,
        // Auth
        isSignedIn,
        isLoading,
        signIn,
        signOut,
        userProfile,
        getAccessToken,
        // File browser
        files,
        isLoadingFiles,
        currentFolder,
        folderPath,
        nextPageToken,
        searchQuery,
        loadFiles,
        searchFiles,
        openFolder,
        navigateToPath,
        loadMore,
        // URL features
        getFileMetadata,
        parseDriveUrl,
        // Error
        error,
        clearError: () => setError(null),
    };
};

export default useGoogleDrivePicker;
