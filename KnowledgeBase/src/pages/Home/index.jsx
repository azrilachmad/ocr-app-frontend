import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, TextField, Button, Paper, InputAdornment,
    Avatar, IconButton, Menu, MenuItem, Chip, CircularProgress
} from '@mui/material';
import {
    Search as SearchIcon, SmartToy as AIIcon, AutoStories as ArticleIcon,
    FolderOpen as FolderIcon, TrendingUp as TrendIcon, Logout as LogoutIcon,
    Description as DocIcon, School as SchoolIcon,
    AccountBalance as MuseumIcon, Gavel as PolicyIcon,
    Assessment as ReportIcon, Lightbulb as InsightIcon,
    PictureAsPdf as PdfIcon, Close as CloseIcon,
    Category as CatIcon, Update as UpdateIcon,
    ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { logout, getCategories, searchKB, getKBStats, getPopularArticles } from '../../services/api';
import { useAuth } from '../../App';

const ICON_MAP = {
    Assessment: <ReportIcon />, TrendingUp: <TrendIcon />, Gavel: <PolicyIcon />,
    AccountBalance: <MuseumIcon />, Lightbulb: <InsightIcon />, School: <SchoolIcon />,
    Article: <ArticleIcon />, FolderOpen: <FolderIcon />
};



const Home = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchResults, setSearchResults] = useState(null);
    const [searching, setSearching] = useState(false);
    const [stats, setStats] = useState(null);
    const [popularDocs, setPopularDocs] = useState([]);

    // Live search suggestions
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const debounceRef = useRef(null);
    const searchBoxRef = useRef(null);

    useEffect(() => {
        Promise.all([
            getCategories().then(res => setCategories(res.data?.data || [])).catch(console.error),
            getKBStats().then(res => setStats(res.data?.data || null)).catch(console.error),
            getPopularArticles().then(res => setPopularDocs(res.data?.data || [])).catch(console.error),
        ]).finally(() => setLoading(false));
    }, []);

    // Click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try { await logout(); } catch (e) { /* ignore */ }
        setUser(null);
    };

    // Debounced live search
    const handleSearchInput = (value) => {
        setSearchQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!value.trim() || value.trim().length < 2) {
            setSuggestions([]); setShowSuggestions(false); return;
        }
        setSuggestionsLoading(true); setShowSuggestions(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await searchKB(value);
                const data = res.data?.data || {};
                const items = [];
                (data.articles || []).forEach(art => items.push({ type: 'article', title: art.title, subtitle: art.category?.name || art.summary, slug: art.slug }));
                (data.files || []).forEach(file => items.push({ type: 'file', title: file.fileName, subtitle: file.fileSize, id: file.id }));
                (data.documents || []).forEach(doc => items.push({ type: 'document', title: doc.fileName, subtitle: 'OCR Document' }));
                setSuggestions(items.slice(0, 8));
            } catch (err) { setSuggestions([]); } finally { setSuggestionsLoading(false); }
        }, 300);
    };

    const handleSuggestionClick = (item) => {
        setShowSuggestions(false);
        if (item.type === 'article') navigate(`/articles/${item.slug}`);
        else if (item.type === 'file') window.open(`/api/kb/files/${item.id}/download`, '_blank');
    };

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setShowSuggestions(false);
        if (!searchQuery.trim()) { setSearchResults(null); return; }
        try {
            setSearching(true);
            const res = await searchKB(searchQuery);
            setSearchResults(res.data?.data || null);
        } catch (err) { console.error(err); } finally { setSearching(false); }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
            {/* Header */}
            <Box sx={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid #E2E8F0', px: 4, py: 1.5
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1200, mx: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: 1.5,
                            background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <ArticleIcon sx={{ fontSize: 20, color: 'white' }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                                IHA Knowledge Base
                            </Typography>
                            <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>
                                Indonesian Heritage Agency
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button variant="outlined" startIcon={<FolderIcon />}
                            onClick={() => navigate('/files')}
                            sx={{ mr: 0.5, fontSize: '13px', px: 2, borderColor: '#E2E8F0', color: '#64748B', '&:hover': { borderColor: '#6366F1', color: '#6366F1' } }}>
                            Files
                        </Button>
                        <Button variant="contained" startIcon={<AIIcon />}
                            onClick={() => navigate('/ai-assistant')}
                            sx={{
                                mr: 1, background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                                fontSize: '13px', px: 2.5, py: 0.8,
                                '&:hover': { boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }
                            }}>
                            Ask AI
                        </Button>
                        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                            <Avatar sx={{ width: 34, height: 34, bgcolor: '#6366F1', fontSize: '14px' }}>
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                        </IconButton>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                            PaperProps={{ sx: { mt: 1, borderRadius: 2, minWidth: 200 } }}>
                            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #E2E8F0' }}>
                                <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>{user?.name}</Typography>
                                <Typography sx={{ fontSize: '12px', color: '#64748B' }}>{user?.email}</Typography>
                            </Box>
                            <MenuItem onClick={handleLogout} sx={{ color: '#EF4444', mt: 0.5 }}>
                                <LogoutIcon sx={{ mr: 1, fontSize: 18 }} /> Sign Out
                            </MenuItem>
                        </Menu>
                    </Box>
                </Box>
            </Box>

            {/* Hero Section */}
            <Box sx={{
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                pt: 8, pb: 12, px: 4, textAlign: 'center', position: 'relative', zIndex: 20
            }}>
                <Box sx={{
                    position: 'absolute', top: -100, right: -100, width: 300, height: 300,
                    borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)'
                }} />
                <Box sx={{ maxWidth: 680, mx: 'auto', position: 'relative', zIndex: 1 }}>
                    <Typography sx={{ fontSize: '36px', fontWeight: 800, color: 'white', mb: 1.5 }}>
                        Temukan Pengetahuan Anda
                    </Typography>
                    <Typography sx={{ fontSize: '16px', color: '#94A3B8', mb: 4 }}>
                        Cari artikel, dokumen, laporan, atau tanya langsung ke AI Assistant
                    </Typography>

                    {/* Search Bar with Live Suggestions */}
                    <Box ref={searchBoxRef} sx={{ position: 'relative', maxWidth: 600, mx: 'auto' }}>
                        <Paper component="form" onSubmit={handleSearch} elevation={0} sx={{
                            display: 'flex', alignItems: 'center',
                            borderRadius: showSuggestions && suggestions.length > 0 ? '24px 24px 0 0' : '24px',
                            overflow: 'hidden', border: '2px solid rgba(99,102,241,0.3)',
                            transition: 'all 0.2s',
                            '&:focus-within': { borderColor: '#6366F1', boxShadow: '0 4px 20px rgba(99,102,241,0.15)' }
                        }}>
                            <TextField
                                fullWidth placeholder="Cari dokumen, artikel, atau topik..."
                                autoComplete="off" value={searchQuery}
                                onChange={(e) => handleSearchInput(e.target.value)}
                                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                                onKeyDown={(e) => { if (e.key === 'Escape') setShowSuggestions(false); }}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8', ml: 1 }} /></InputAdornment>,
                                    endAdornment: searchQuery && (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => { setSearchQuery(''); setSuggestions([]); setShowSuggestions(false); setSearchResults(null); }}>
                                                <CloseIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    sx: { '& fieldset': { border: 'none' }, fontSize: '15px' }
                                }}
                                sx={{ flex: 1 }}
                            />
                            <Button type="submit" variant="contained" disabled={searching} sx={{
                                m: 0.5, px: 3, borderRadius: '20px', background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                            }}>
                                {searching ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Cari'}
                            </Button>
                        </Paper>

                        {/* Live Suggestions Dropdown */}
                        {showSuggestions && (suggestions.length > 0 || suggestionsLoading) && (
                            <Paper elevation={8} sx={{
                                position: 'absolute', top: '100%', left: 0, right: 0,
                                borderRadius: '0 0 16px 16px', border: '2px solid rgba(99,102,241,0.3)', borderTop: 'none',
                                bgcolor: 'white', zIndex: 9999, maxHeight: 400, overflowY: 'auto',
                                boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
                            }}>
                                {suggestionsLoading && suggestions.length === 0 ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 2.5, py: 2 }}>
                                        <CircularProgress size={18} sx={{ color: '#94A3B8' }} />
                                        <Typography sx={{ fontSize: '14px', color: '#94A3B8' }}>Mencari...</Typography>
                                    </Box>
                                ) : (
                                    suggestions.map((item, i) => (
                                        <Box key={i} onClick={() => handleSuggestionClick(item)}
                                            sx={{
                                                display: 'flex', alignItems: 'center', gap: 2,
                                                px: 2.5, py: 1.5, cursor: 'pointer',
                                                borderTop: i > 0 ? '1px solid #F1F5F9' : 'none',
                                                transition: 'background 0.15s',
                                                '&:hover': { bgcolor: '#F8FAFC' },
                                                '&:last-child': { borderRadius: '0 0 14px 14px' }
                                            }}>
                                            {item.type === 'file' ? <PdfIcon sx={{ fontSize: 20, color: '#EF4444', flexShrink: 0 }} />
                                                : item.type === 'article' ? <ArticleIcon sx={{ fontSize: 20, color: '#6366F1', flexShrink: 0 }} />
                                                    : <SearchIcon sx={{ fontSize: 20, color: '#94A3B8', flexShrink: 0 }} />}
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography sx={{ fontSize: '14px', color: '#1F2937', fontWeight: 500 }} noWrap>{item.title}</Typography>
                                                {item.subtitle && <Typography sx={{ fontSize: '12px', color: '#94A3B8' }} noWrap>{item.subtitle}</Typography>}
                                            </Box>
                                            <Typography sx={{ fontSize: '11px', color: '#CBD5E1', flexShrink: 0 }}>
                                                {item.type === 'article' ? 'Artikel' : item.type === 'file' ? 'File' : 'Dokumen'}
                                            </Typography>
                                        </Box>
                                    ))
                                )}
                                {!suggestionsLoading && suggestions.length > 0 && (
                                    <Box sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'center' }}>
                                        <Button size="small" onClick={handleSearch} sx={{ fontSize: '12px', color: '#6366F1' }}>
                                            Lihat semua hasil untuk "{searchQuery}"
                                        </Button>
                                    </Box>
                                )}
                            </Paper>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Quick Statistics */}
            {stats && (
                <Box sx={{ maxWidth: 1200, mx: 'auto', px: 4, mt: 4, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
                        {[
                            { label: 'Total Dokumen', value: stats.totalDocuments, icon: <ArticleIcon />, color: '#6366F1' },
                            { label: 'Tipe Dokumen', value: stats.totalCategories, icon: <CatIcon />, color: '#0EA5E9' },
                            { label: 'Total File', value: stats.totalFiles, icon: <FolderIcon />, color: '#10B981' },
                            { label: 'Terakhir Update', value: stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString('id-ID') : '-', icon: <UpdateIcon />, color: '#F59E0B', isText: true },
                        ].map((stat, i) => (
                            <Paper key={i} elevation={0} sx={{
                                p: 2.5, borderRadius: 3, border: '1px solid #E2E8F0',
                                bgcolor: 'white', display: 'flex', alignItems: 'center', gap: 2,
                                transition: 'all 0.2s', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }
                            }}>
                                <Box sx={{
                                    width: 44, height: 44, borderRadius: 2,
                                    bgcolor: `${stat.color}12`, color: stat.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {stat.icon}
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>{stat.label}</Typography>
                                    <Typography sx={{ fontSize: stat.isText ? '16px' : '24px', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                                        {stat.value}
                                    </Typography>
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                </Box>
            )}

            {/* Search Results */}
            {searchResults && (
                <Box sx={{ maxWidth: 1200, mx: 'auto', px: 4, py: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                        <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>
                            Hasil Pencarian: "{searchQuery}"
                        </Typography>
                        <Button size="small" onClick={() => { setSearchResults(null); setSearchQuery(''); }}>Tutup</Button>
                    </Box>
                    {searchResults.articles?.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#64748B', mb: 1.5 }}>
                                📄 Artikel ({searchResults.articles.length})
                            </Typography>
                            {searchResults.articles.map(art => (
                                <Paper key={art.id} elevation={0} onClick={() => navigate(`/articles/${art.slug}`)} sx={{
                                    p: 2.5, mb: 1.5, borderRadius: 2, border: '1px solid #E2E8F0', cursor: 'pointer',
                                    '&:hover': { borderColor: '#6366F1', transform: 'translateX(4px)' }, transition: 'all 0.2s'
                                }}>
                                    <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>{art.title}</Typography>
                                    {art.summary && <Typography sx={{ fontSize: '13px', color: '#64748B', mt: 0.5 }}>{art.summary}</Typography>}
                                </Paper>
                            ))}
                        </Box>
                    )}
                    {searchResults.files?.length > 0 && (
                        <Box sx={{ mb: 3 }}>
                            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#64748B', mb: 1.5 }}>📁 File ({searchResults.files.length})</Typography>
                            {searchResults.files.map(file => (
                                <Paper key={file.id} elevation={0} sx={{ p: 2, mb: 1, borderRadius: 2, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <DocIcon sx={{ color: '#EF4444' }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{file.fileName}</Typography>
                                        <Typography sx={{ fontSize: '12px', color: '#94A3B8' }}>{file.fileSize}</Typography>
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    )}
                    {searchResults.articles?.length === 0 && searchResults.files?.length === 0 && searchResults.documents?.length === 0 && (
                        <Typography sx={{ textAlign: 'center', color: '#94A3B8', py: 4 }}>Tidak ada hasil ditemukan</Typography>
                    )}
                </Box>
            )}

            {/* Categories Grid (original layout) */}
            <Box sx={{ maxWidth: 1200, mx: 'auto', px: 4, py: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                    <Box>
                        <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>
                            Kategori Topik
                        </Typography>
                        <Typography sx={{ fontSize: '14px', color: '#64748B', mt: 0.5 }}>
                            Telusuri pengetahuan berdasarkan kategori
                        </Typography>
                    </Box>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3 }}>
                        {categories.map((cat, i) => (
                            <Paper key={cat.id} elevation={0} className="fade-in-up"
                                onClick={() => navigate(`/categories/${cat.slug}`)}
                                sx={{
                                    p: 3, borderRadius: 3, border: '1px solid #E2E8F0', cursor: 'pointer',
                                    transition: 'all 0.3s ease', animationDelay: `${i * 0.08}s`,
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
                                        borderColor: cat.color
                                    }
                                }}>
                                <Box sx={{
                                    width: 48, height: 48, borderRadius: 2, mb: 2,
                                    background: `${cat.color}12`, color: cat.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {ICON_MAP[cat.icon] || <ArticleIcon />}
                                </Box>
                                <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', mb: 0.5 }}>
                                    {cat.name}
                                </Typography>
                                <Typography sx={{ fontSize: '13px', color: '#64748B', mb: 2, lineHeight: 1.5 }}>
                                    {cat.description}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip label={`${cat.articleCount || 0} dokumen`} size="small" sx={{
                                        bgcolor: `${cat.color}10`, color: cat.color, fontWeight: 500, fontSize: '11px'
                                    }} />
                                    <Chip label="AI Ready" size="small" sx={{
                                        height: 20, fontSize: '10px', fontWeight: 600,
                                        bgcolor: '#EEF2FF', color: '#6366F1'
                                    }} />
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                )}
            </Box>

            {/* Dokumen Terbaru */}
            {popularDocs.length > 0 && (
            <Box sx={{ maxWidth: 1200, mx: 'auto', px: 4, pb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box>
                        <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>
                            Dokumen Terbaru
                        </Typography>
                        <Typography sx={{ fontSize: '14px', color: '#64748B', mt: 0.5 }}>
                            Dokumen yang baru saja di-scan dan disimpan
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                    {popularDocs.map((doc) => (
                        <Paper key={doc.id} elevation={0}
                            onClick={() => navigate(`/articles/doc-${doc.id}`)}
                            sx={{
                                p: 2.5, borderRadius: 2, border: '1px solid #E2E8F0', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 2,
                                transition: 'all 0.2s',
                                '&:hover': { borderColor: '#6366F1', transform: 'translateX(4px)', boxShadow: '0 4px 12px rgba(99,102,241,0.08)' }
                            }}>
                            <Box sx={{
                                width: 40, height: 40, borderRadius: 2, flexShrink: 0,
                                bgcolor: '#EEF2FF', color: '#6366F1',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <DocIcon sx={{ fontSize: 20 }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }} noWrap>
                                    {doc.fileName}
                                </Typography>
                                <Typography sx={{ fontSize: '12px', color: '#94A3B8' }}>
                                    {doc.documentType} • {doc.fileSize || 'N/A'} • {new Date(doc.scannedAt).toLocaleDateString('id-ID')}{doc.user?.name ? ` • oleh ${doc.user.name}` : ''}
                                </Typography>
                            </Box>
                            <Button size="small" sx={{ fontSize: '12px', color: '#6366F1', flexShrink: 0, minWidth: 'auto' }}>
                                Lihat <ArrowIcon sx={{ fontSize: 14, ml: 0.3 }} />
                            </Button>
                        </Paper>
                    ))}
                </Box>
            </Box>
            )}

            {/* AI CTA Section */}
            <Box sx={{ maxWidth: 1200, mx: 'auto', px: 4, pb: 6 }}>
                <Paper elevation={0} sx={{
                    p: 5, borderRadius: 3, textAlign: 'center',
                    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                    position: 'relative', overflow: 'hidden'
                }}>
                    <Box sx={{
                        position: 'absolute', top: -50, right: -50, width: 200, height: 200,
                        borderRadius: '50%', background: 'rgba(255,255,255,0.05)'
                    }} />
                    <AIIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.9)', mb: 2 }} />
                    <Typography sx={{ fontSize: '24px', fontWeight: 700, color: 'white', mb: 1 }}>
                        Tanya AI Assistant
                    </Typography>
                    <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', mb: 3, maxWidth: 500, mx: 'auto' }}>
                        Dapatkan insight, analisis, dan jawaban dari seluruh basis pengetahuan Anda menggunakan AI
                    </Typography>
                    <Button variant="contained" size="large" startIcon={<AIIcon />}
                        onClick={() => navigate('/ai-assistant')}
                        sx={{
                            bgcolor: 'white', color: '#4F46E5', fontWeight: 700, px: 4, py: 1.5,
                            borderRadius: 2, fontSize: '15px',
                            '&:hover': { bgcolor: '#F0F0FF' }
                        }}>
                        Mulai Bertanya
                    </Button>
                </Paper>
            </Box>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', py: 3, borderTop: '1px solid #E2E8F0' }}>
                <Typography sx={{ fontSize: '12px', color: '#94A3B8' }}>
                    © Synchro 2017 – 2026 | IHA Knowledge Base Platform
                </Typography>
            </Box>
        </Box>
    );
};

export default Home;
