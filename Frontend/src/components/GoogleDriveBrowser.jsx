// src/components/GoogleDriveBrowser.jsx
// Custom Google Drive file browser with folder navigation, search, and multi-select
import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Button, TextField, IconButton, Chip, Checkbox,
    CircularProgress, Avatar, InputAdornment, Breadcrumbs, Link, Divider,
    Alert, Tooltip
} from '@mui/material';
import {
    Search as SearchIcon,
    Folder as FolderIcon,
    InsertDriveFile as FileIcon,
    PictureAsPdf as PdfIcon,
    Image as ImageIcon,
    Description as DocIcon,
    TableChart as SheetIcon,
    Slideshow as SlidesIcon,
    ArrowBack as BackIcon,
    CloudQueue as CloudIcon,
    Logout as LogoutIcon,
    NavigateNext as NavNextIcon,
    CheckCircle as CheckIcon,
    Home as HomeIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';

const GOOGLE_MIME_ICONS = {
    'application/vnd.google-apps.folder': { icon: FolderIcon, color: '#FFA000' },
    'application/vnd.google-apps.document': { icon: DocIcon, color: '#4285F4' },
    'application/vnd.google-apps.spreadsheet': { icon: SheetIcon, color: '#0F9D58' },
    'application/vnd.google-apps.presentation': { icon: SlidesIcon, color: '#F4B400' },
    'application/pdf': { icon: PdfIcon, color: '#EA4335' },
    'image/jpeg': { icon: ImageIcon, color: '#8B5CF6' },
    'image/png': { icon: ImageIcon, color: '#8B5CF6' },
    'image/gif': { icon: ImageIcon, color: '#8B5CF6' },
    'image/webp': { icon: ImageIcon, color: '#8B5CF6' },
};

const getFileIconInfo = (mimeType) => {
    return GOOGLE_MIME_ICONS[mimeType] || { icon: FileIcon, color: '#6B7280' };
};

const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const GoogleDriveBrowser = ({ drive, onFilesSelected, maxFiles = 10 }) => {
    const [selectedFileIds, setSelectedFileIds] = useState(new Set());
    const [searchInput, setSearchInput] = useState('');
    const searchTimeoutRef = useRef(null);

    const {
        isSignedIn, isLoading, signIn, signOut, userProfile,
        files, isLoadingFiles, currentFolder, folderPath,
        nextPageToken, searchQuery,
        loadFiles, searchFiles, openFolder, navigateToPath, loadMore,
        error, clearError,
    } = drive;

    // Debounced search
    const handleSearchChange = (value) => {
        setSearchInput(value);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            if (value.trim()) {
                searchFiles(value);
            } else {
                loadFiles(currentFolder.id);
            }
        }, 500);
    };

    const toggleFileSelection = (file) => {
        if (file.isFolder) return; // Can't select folders
        setSelectedFileIds(prev => {
            const next = new Set(prev);
            if (next.has(file.fileId)) {
                next.delete(file.fileId);
            } else if (next.size < maxFiles) {
                next.add(file.fileId);
            }
            return next;
        });
    };

    const handleImport = () => {
        const selected = files.filter(f => selectedFileIds.has(f.fileId) && !f.isFolder);
        if (selected.length > 0 && onFilesSelected) {
            onFilesSelected(selected, drive.getAccessToken());
        }
        setSelectedFileIds(new Set());
    };

    const selectedCount = selectedFileIds.size;
    const nonFolderFiles = files.filter(f => !f.isFolder);
    const folders = files.filter(f => f.isFolder);

    // ─── Not signed in state ───
    if (!isSignedIn) {
        return (
            <Box sx={{
                border: '1px solid #E5E7EB', borderRadius: 3, overflow: 'hidden',
                bgcolor: '#FFFFFF',
            }}>
                <Box sx={{
                    p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 2, minHeight: 200, justifyContent: 'center',
                }}>
                    <Box sx={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4285F4 0%, #34A853 33%, #FBBC05 66%, #EA4335 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(66, 133, 244, 0.3)',
                    }}>
                        <CloudIcon sx={{ fontSize: 28, color: 'white' }} />
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#1F2937', mb: 0.5 }}>
                            Import from Google Drive
                        </Typography>
                        <Typography sx={{ fontSize: '13px', color: '#6B7280', maxWidth: 320 }}>
                            Sign in with your Google account to browse and select files from your Drive
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        onClick={signIn}
                        disabled={isLoading}
                        startIcon={isLoading ? <CircularProgress size={18} /> : (
                            <Box
                                component="img"
                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                sx={{ width: 18, height: 18 }}
                            />
                        )}
                        sx={{
                            py: 1.2, px: 3, borderRadius: 2,
                            textTransform: 'none', fontSize: '14px', fontWeight: 600,
                            borderColor: '#DADCE0', color: '#3C4043', bgcolor: 'white',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                            '&:hover': { bgcolor: '#F8F9FA', borderColor: '#DADCE0', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' },
                        }}
                    >
                        {isLoading ? 'Signing in...' : 'Sign in with Google'}
                    </Button>
                    {error && (
                        <Alert severity="error" sx={{ mt: 1, fontSize: '12px', width: '100%' }} onClose={clearError}>
                            {error}
                        </Alert>
                    )}
                </Box>
            </Box>
        );
    }

    // ─── Signed in — File browser ───
    return (
        <Box sx={{
            border: '1px solid #E5E7EB', borderRadius: 3, overflow: 'hidden',
            bgcolor: '#FFFFFF',
        }}>
            {/* Header: User info + actions */}
            <Box sx={{
                px: 2.5, py: 1.5, bgcolor: '#F8FAFC',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                        src={userProfile?.picture}
                        sx={{ width: 32, height: 32, fontSize: '14px', bgcolor: '#4285F4' }}
                    >
                        {userProfile?.name?.[0] || 'G'}
                    </Avatar>
                    <Box>
                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1F2937', lineHeight: 1.2 }}>
                            {userProfile?.name || 'Google Account'}
                        </Typography>
                        <Typography sx={{ fontSize: '11px', color: '#6B7280' }}>
                            {userProfile?.email || 'Connected to Google Drive'}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Refresh">
                        <IconButton
                            size="small"
                            onClick={() => loadFiles(currentFolder.id)}
                            disabled={isLoadingFiles}
                        >
                            <RefreshIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Sign out">
                        <IconButton size="small" onClick={signOut}>
                            <LogoutIcon sx={{ fontSize: 18, color: '#6B7280' }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Search bar */}
            <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #F3F4F6' }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search files in Google Drive..."
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ fontSize: 20, color: '#9CA3AF' }} />
                            </InputAdornment>
                        ),
                        sx: {
                            borderRadius: 2, fontSize: '13px', bgcolor: '#F9FAFB',
                            '& fieldset': { borderColor: '#E5E7EB' },
                        },
                    }}
                />
            </Box>

            {/* Breadcrumbs */}
            {!searchQuery && (
                <Box sx={{ px: 2.5, py: 1, borderBottom: '1px solid #F3F4F6', bgcolor: '#FAFBFC' }}>
                    <Breadcrumbs
                        separator={<NavNextIcon sx={{ fontSize: 16, color: '#D1D5DB' }} />}
                        sx={{ fontSize: '12px' }}
                    >
                        {folderPath.map((folder, index) => {
                            const isLast = index === folderPath.length - 1;
                            return isLast ? (
                                <Typography key={folder.id} sx={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>
                                    {index === 0 ? <HomeIcon sx={{ fontSize: 14, mr: 0.5, mb: -0.3 }} /> : null}
                                    {folder.name}
                                </Typography>
                            ) : (
                                <Link
                                    key={folder.id}
                                    component="button"
                                    variant="body2"
                                    onClick={() => navigateToPath(index)}
                                    sx={{
                                        fontSize: '12px', color: '#6B7280', textDecoration: 'none',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                                        '&:hover': { color: '#4285F4' },
                                    }}
                                >
                                    {index === 0 ? <HomeIcon sx={{ fontSize: 14, mr: 0.5 }} /> : null}
                                    {folder.name}
                                </Link>
                            );
                        })}
                    </Breadcrumbs>
                </Box>
            )}

            {/* Search indicator */}
            {searchQuery && (
                <Box sx={{
                    px: 2.5, py: 1, borderBottom: '1px solid #F3F4F6',
                    bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <Typography sx={{ fontSize: '12px', color: '#1D4ED8' }}>
                        <SearchIcon sx={{ fontSize: 14, mr: 0.5, mb: -0.3 }} />
                        Results for "{searchQuery}" — {files.length} files found
                    </Typography>
                    <Button
                        size="small"
                        onClick={() => { setSearchInput(''); handleSearchChange(''); }}
                        sx={{ fontSize: '11px', textTransform: 'none', color: '#1D4ED8', minWidth: 'auto' }}
                    >
                        Clear
                    </Button>
                </Box>
            )}

            {/* Error */}
            {error && (
                <Box sx={{ px: 2.5, pt: 1 }}>
                    <Alert severity="error" sx={{ fontSize: '12px' }} onClose={clearError}>
                        {error}
                    </Alert>
                </Box>
            )}

            {/* File list */}
            <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
                {isLoadingFiles && files.length === 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6, gap: 1.5 }}>
                        <CircularProgress size={24} sx={{ color: '#4285F4' }} />
                        <Typography sx={{ fontSize: '13px', color: '#6B7280' }}>Loading files...</Typography>
                    </Box>
                ) : files.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <FileIcon sx={{ fontSize: 48, color: '#D1D5DB', mb: 1 }} />
                        <Typography sx={{ fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>
                            {searchQuery ? 'No files found' : 'This folder is empty'}
                        </Typography>
                        <Typography sx={{ fontSize: '12px', color: '#9CA3AF', mt: 0.5 }}>
                            {searchQuery ? 'Try a different search term' : 'Only supported file types are shown (images, PDFs, documents)'}
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {/* Folders first */}
                        {folders.length > 0 && (
                            <>
                                {folders.map(folder => (
                                    <Box
                                        key={folder.fileId}
                                        onClick={() => openFolder(folder)}
                                        sx={{
                                            display: 'flex', alignItems: 'center', gap: 1.5,
                                            px: 2.5, py: 1.25, cursor: 'pointer',
                                            borderBottom: '1px solid #F9FAFB',
                                            '&:hover': { bgcolor: '#F0F7FF' },
                                            transition: 'background 0.15s',
                                        }}
                                    >
                                        <FolderIcon sx={{ fontSize: 22, color: '#FFA000' }} />
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography noWrap sx={{ fontSize: '13px', fontWeight: 500, color: '#1F2937' }}>
                                                {folder.name}
                                            </Typography>
                                        </Box>
                                        <NavNextIcon sx={{ fontSize: 18, color: '#D1D5DB' }} />
                                    </Box>
                                ))}
                                {nonFolderFiles.length > 0 && (
                                    <Divider sx={{ borderColor: '#F3F4F6' }} />
                                )}
                            </>
                        )}

                        {/* Files */}
                        {nonFolderFiles.map(file => {
                            const { icon: IconComp, color } = getFileIconInfo(file.mimeType);
                            const isSelected = selectedFileIds.has(file.fileId);
                            const isGoogleDoc = file.mimeType?.startsWith('application/vnd.google-apps.');

                            return (
                                <Box
                                    key={file.fileId}
                                    onClick={() => toggleFileSelection(file)}
                                    sx={{
                                        display: 'flex', alignItems: 'center', gap: 1.5,
                                        px: 2.5, py: 1.25, cursor: 'pointer',
                                        borderBottom: '1px solid #F9FAFB',
                                        bgcolor: isSelected ? '#EFF6FF' : 'transparent',
                                        '&:hover': { bgcolor: isSelected ? '#DBEAFE' : '#FAFBFC' },
                                        transition: 'background 0.15s',
                                    }}
                                >
                                    <Checkbox
                                        checked={isSelected}
                                        size="small"
                                        sx={{
                                            p: 0.25,
                                            color: '#D1D5DB',
                                            '&.Mui-checked': { color: '#4285F4' },
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={() => toggleFileSelection(file)}
                                    />
                                    {file.thumbnailLink ? (
                                        <Box
                                            component="img"
                                            src={file.thumbnailLink}
                                            sx={{
                                                width: 32, height: 32, borderRadius: 1,
                                                objectFit: 'cover', border: '1px solid #F3F4F6',
                                            }}
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <IconComp sx={{ fontSize: 24, color }} />
                                    )}
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography noWrap sx={{ fontSize: '13px', fontWeight: 500, color: '#1F2937' }}>
                                            {file.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography sx={{ fontSize: '11px', color: '#9CA3AF' }}>
                                                {formatDate(file.modifiedTime)}
                                            </Typography>
                                            {!isGoogleDoc && (
                                                <Typography sx={{ fontSize: '11px', color: '#9CA3AF' }}>
                                                    · {formatFileSize(file.size)}
                                                </Typography>
                                            )}
                                            {isGoogleDoc && (
                                                <Chip
                                                    label="→ PDF"
                                                    size="small"
                                                    sx={{
                                                        height: 16, fontSize: '9px', fontWeight: 600,
                                                        bgcolor: '#FEF3C7', color: '#92400E',
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                    {isSelected && (
                                        <CheckIcon sx={{ fontSize: 18, color: '#4285F4' }} />
                                    )}
                                </Box>
                            );
                        })}

                        {/* Load more */}
                        {nextPageToken && (
                            <Box sx={{ textAlign: 'center', py: 1.5 }}>
                                <Button
                                    size="small"
                                    onClick={loadMore}
                                    disabled={isLoadingFiles}
                                    sx={{
                                        textTransform: 'none', fontSize: '12px', color: '#4285F4',
                                        fontWeight: 600,
                                    }}
                                >
                                    {isLoadingFiles ? 'Loading...' : 'Load more files'}
                                </Button>
                            </Box>
                        )}
                    </>
                )}
            </Box>

            {/* Selection footer */}
            {selectedCount > 0 && (
                <Box sx={{
                    px: 2.5, py: 1.5, borderTop: '1px solid #E5E7EB',
                    bgcolor: '#EFF6FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <Typography sx={{ fontSize: '13px', color: '#1D4ED8', fontWeight: 500 }}>
                        {selectedCount} file{selectedCount > 1 ? 's' : ''} selected
                        {selectedCount >= maxFiles && (
                            <Typography component="span" sx={{ fontSize: '11px', color: '#6B7280', ml: 1 }}>
                                (max {maxFiles})
                            </Typography>
                        )}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            size="small"
                            onClick={() => setSelectedFileIds(new Set())}
                            sx={{ textTransform: 'none', fontSize: '12px', color: '#6B7280' }}
                        >
                            Clear
                        </Button>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={handleImport}
                            sx={{
                                textTransform: 'none', fontSize: '12px', fontWeight: 600,
                                bgcolor: '#4285F4', borderRadius: 1.5,
                                '&:hover': { bgcolor: '#3367D6' },
                            }}
                        >
                            Import {selectedCount} file{selectedCount > 1 ? 's' : ''}
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default GoogleDriveBrowser;
