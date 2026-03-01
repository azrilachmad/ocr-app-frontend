import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Chip, IconButton, Breadcrumbs,
    Link, CircularProgress, Divider, Button
} from '@mui/material';
import {
    ArrowBack, Description as DocIcon, Download as DownloadIcon,
    Visibility, CalendarToday
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getArticle } from '../../services/api';

const Article = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            setLoading(true);
            getArticle(slug)
                .then(res => setArticle(res.data?.data || null))
                .catch(() => setArticle(null))
                .finally(() => setLoading(false));
        }
    }, [slug]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!article) {
        return (
            <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography sx={{ fontSize: '18px', color: '#64748B' }}>Article not found</Typography>
            </Box>
        );
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
            {/* Header */}
            <Box sx={{
                px: 4, py: 2, bgcolor: 'white', borderBottom: '1px solid #E2E8F0',
                display: 'flex', alignItems: 'center', gap: 2
            }}>
                <IconButton onClick={() => navigate(-1)} size="small"><ArrowBack /></IconButton>
                <Breadcrumbs>
                    <Link component="button" onClick={() => navigate('/home')} sx={{ color: '#64748B', fontSize: '14px' }}>
                        Knowledge Base
                    </Link>
                    {article.category && (
                        <Link component="button"
                            onClick={() => navigate(`/categories/${article.category.slug}`)}
                            sx={{ color: '#64748B', fontSize: '14px' }}>
                            {article.category.name}
                        </Link>
                    )}
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', maxWidth: 300 }} noWrap>
                        {article.title}
                    </Typography>
                </Breadcrumbs>
            </Box>

            <Box sx={{ display: 'flex', maxWidth: 1100, mx: 'auto', px: 4, py: 4, gap: 4 }}>
                {/* Main Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                        {/* Title */}
                        <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', mb: 1.5, lineHeight: 1.3 }}>
                            {article.title}
                        </Typography>

                        {/* Meta */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                            {article.category && (
                                <Chip label={article.category.name} size="small" sx={{
                                    bgcolor: `${article.category.color}15`, color: article.category.color, fontWeight: 500
                                }} />
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <CalendarToday sx={{ fontSize: 14, color: '#94A3B8' }} />
                                <Typography sx={{ fontSize: '12px', color: '#94A3B8' }}>{formatDate(article.createdAt)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Visibility sx={{ fontSize: 14, color: '#94A3B8' }} />
                                <Typography sx={{ fontSize: '12px', color: '#94A3B8' }}>{article.viewCount} views</Typography>
                            </Box>
                        </Box>

                        {article.summary && (
                            <Box sx={{
                                p: 2.5, borderRadius: 2, bgcolor: '#F0F9FF', border: '1px solid #BAE6FD', mb: 3
                            }}>
                                <Typography sx={{ fontSize: '14px', color: '#0369A1', fontWeight: 500, lineHeight: 1.6 }}>
                                    {article.summary}
                                </Typography>
                            </Box>
                        )}

                        <Divider sx={{ mb: 3 }} />

                        {/* Article Body (Markdown) */}
                        <Box sx={{
                            '& h1': { fontSize: '24px', fontWeight: 700, mt: 3, mb: 1.5, color: '#0F172A' },
                            '& h2': { fontSize: '20px', fontWeight: 600, mt: 2.5, mb: 1, color: '#1E293B' },
                            '& h3': { fontSize: '16px', fontWeight: 600, mt: 2, mb: 0.8, color: '#334155' },
                            '& p': { fontSize: '14px', lineHeight: 1.8, color: '#374151', mb: 1.5 },
                            '& ul, & ol': { pl: 3, mb: 1.5 },
                            '& li': { fontSize: '14px', lineHeight: 1.7, color: '#374151', mb: 0.5 },
                            '& strong': { fontWeight: 600, color: '#1E293B' },
                            '& table': { width: '100%', borderCollapse: 'collapse', my: 2, fontSize: '13px' },
                            '& th': { bgcolor: '#F1F5F9', fontWeight: 600, textAlign: 'left', px: 2, py: 1, border: '1px solid #E2E8F0' },
                            '& td': { px: 2, py: 1, border: '1px solid #E2E8F0', color: '#374151' },
                            '& code': { bgcolor: '#F1F5F9', px: 1, py: 0.3, borderRadius: 1, fontSize: '12px', fontFamily: 'monospace' },
                            '& blockquote': { borderLeft: '3px solid #6366F1', pl: 2, ml: 0, color: '#64748B', fontStyle: 'italic' }
                        }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {article.content}
                            </ReactMarkdown>
                        </Box>
                    </Paper>

                    {/* Tags */}
                    {article.tags && (
                        <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Typography sx={{ fontSize: '13px', color: '#94A3B8', mr: 1 }}>Tags:</Typography>
                            {article.tags.split(',').map((tag, i) => (
                                <Chip key={i} label={tag.trim()} size="small" variant="outlined" sx={{
                                    fontSize: '11px', borderColor: '#E2E8F0', color: '#64748B'
                                }} />
                            ))}
                        </Box>
                    )}
                </Box>

                {/* Sidebar */}
                <Box sx={{ width: 280, flexShrink: 0, display: { xs: 'none', md: 'block' } }}>
                    {/* Attachments */}
                    {article.attachments && article.attachments.length > 0 && (
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #E2E8F0', mb: 3 }}>
                            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', mb: 2 }}>
                                📎 File Terkait
                            </Typography>
                            {article.attachments.map((att, i) => (
                                <Box key={i} sx={{
                                    display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, mb: 1,
                                    borderRadius: 1.5, border: '1px solid #F1F5F9', cursor: 'pointer',
                                    '&:hover': { bgcolor: '#F8FAFC' }
                                }}>
                                    <DocIcon sx={{ fontSize: 20, color: '#6366F1' }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#374151' }} noWrap>
                                            {att.fileName}
                                        </Typography>
                                        <Typography sx={{ fontSize: '11px', color: '#94A3B8' }}>{att.fileSize}</Typography>
                                    </Box>
                                    <DownloadIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                                </Box>
                            ))}
                        </Paper>
                    )}

                    {/* Related Articles */}
                    {article.relatedArticles && article.relatedArticles.length > 0 && (
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
                            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', mb: 2 }}>
                                📄 Artikel Terkait
                            </Typography>
                            {article.relatedArticles.map((rel, i) => (
                                <Box key={i} onClick={() => navigate(`/articles/${rel.slug}`)} sx={{
                                    p: 1.5, mb: 1, borderRadius: 1.5, cursor: 'pointer',
                                    '&:hover': { bgcolor: '#EEF2FF' }
                                }}>
                                    <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#4F46E5' }}>
                                        {rel.title}
                                    </Typography>
                                    {rel.summary && (
                                        <Typography sx={{ fontSize: '11px', color: '#94A3B8', mt: 0.3 }} noWrap>
                                            {rel.summary}
                                        </Typography>
                                    )}
                                </Box>
                            ))}
                        </Paper>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default Article;
