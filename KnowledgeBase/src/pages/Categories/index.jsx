import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Chip, IconButton, Breadcrumbs,
    Link, CircularProgress, TextField, InputAdornment
} from '@mui/material';
import {
    ArrowBack, Search as SearchIcon, Article as ArticleIcon,
    AccessTime, Visibility
} from '@mui/icons-material';
import { getCategoryArticles } from '../../services/api';

const Categories = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchFilter, setSearchFilter] = useState('');

    useEffect(() => {
        if (slug) {
            setLoading(true);
            getCategoryArticles(slug)
                .then(res => setCategory(res.data?.data || null))
                .catch(() => setCategory(null))
                .finally(() => setLoading(false));
        }
    }, [slug]);

    const filteredArticles = category?.articles?.filter(a =>
        a.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (a.tags && a.tags.toLowerCase().includes(searchFilter.toLowerCase()))
    ) || [];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!category) {
        return (
            <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography sx={{ fontSize: '18px', color: '#64748B' }}>Category not found</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
            {/* Header */}
            <Box sx={{
                px: 4, py: 2, bgcolor: 'white', borderBottom: '1px solid #E2E8F0',
                display: 'flex', alignItems: 'center', gap: 2
            }}>
                <IconButton onClick={() => navigate('/home')} size="small"><ArrowBack /></IconButton>
                <Breadcrumbs>
                    <Link component="button" onClick={() => navigate('/home')} sx={{ color: '#64748B', fontSize: '14px' }}>
                        Knowledge Base
                    </Link>
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                        {category.name}
                    </Typography>
                </Breadcrumbs>
            </Box>

            {/* Category Hero */}
            <Box sx={{
                px: 4, py: 5, background: `linear-gradient(135deg, ${category.color}15, ${category.color}05)`,
                borderBottom: '1px solid #E2E8F0'
            }}>
                <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                    <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', mb: 1 }}>
                        {category.name}
                    </Typography>
                    <Typography sx={{ fontSize: '15px', color: '#64748B', mb: 3 }}>
                        {category.description}
                    </Typography>
                    <TextField
                        fullWidth placeholder="Cari artikel dalam kategori ini..."
                        value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)}
                        size="small"
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94A3B8' }} /></InputAdornment>,
                        }}
                        sx={{
                            maxWidth: 400,
                            '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'white' }
                        }}
                    />
                </Box>
            </Box>

            {/* Article List */}
            <Box sx={{ maxWidth: 800, mx: 'auto', px: 4, py: 4 }}>
                <Typography sx={{ fontSize: '13px', color: '#94A3B8', mb: 3 }}>
                    {filteredArticles.length} artikel ditemukan
                </Typography>

                {filteredArticles.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <ArticleIcon sx={{ fontSize: 48, color: '#E2E8F0', mb: 1 }} />
                        <Typography sx={{ color: '#94A3B8' }}>Tidak ada artikel</Typography>
                    </Box>
                ) : (
                    filteredArticles.map((article, i) => (
                        <Paper key={article.id} elevation={0}
                            onClick={() => navigate(`/articles/${article.slug}`)}
                            sx={{
                                p: 3, mb: 2, borderRadius: 2, border: '1px solid #E2E8F0',
                                cursor: 'pointer', transition: 'all 0.2s',
                                '&:hover': { borderColor: category.color, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transform: 'translateX(4px)' }
                            }}
                        >
                            <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#0F172A', mb: 0.5 }}>
                                {article.title}
                            </Typography>
                            {article.summary && (
                                <Typography sx={{ fontSize: '13px', color: '#64748B', mb: 1.5, lineHeight: 1.6 }}>
                                    {article.summary}
                                </Typography>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {article.tags && article.tags.split(',').slice(0, 3).map((tag, j) => (
                                    <Chip key={j} label={tag.trim()} size="small" sx={{
                                        fontSize: '11px', height: 22, bgcolor: `${category.color}10`, color: category.color
                                    }} />
                                ))}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                                    <Visibility sx={{ fontSize: 14, color: '#CBD5E1' }} />
                                    <Typography sx={{ fontSize: '11px', color: '#CBD5E1' }}>{article.viewCount || 0}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    ))
                )}
            </Box>
        </Box>
    );
};

export default Categories;
