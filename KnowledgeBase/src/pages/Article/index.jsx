import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Chip, IconButton, Breadcrumbs,
    Link, CircularProgress, Divider, Button, Tooltip
} from '@mui/material';
import {
    ArrowBack, Description as DocIcon, Download as DownloadIcon,
    CalendarToday, Speed as SpeedIcon, Psychology as AIIcon,
    Person as PersonIcon, InsertDriveFile as FileIcon,
    Assessment as ConfidenceIcon
} from '@mui/icons-material';
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
                <Typography sx={{ fontSize: '18px', color: '#64748B' }}>Dokumen tidak ditemukan</Typography>
                <Button onClick={() => navigate('/home')} sx={{ mt: 2, color: '#6366F1' }}>Kembali ke Home</Button>
            </Box>
        );
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Parse content — could be JSON string or object
    const parseContent = (raw) => {
        if (!raw) return {};
        if (typeof raw === 'object') return raw;
        try {
            return JSON.parse(raw);
        } catch {
            return { raw_text: raw };
        }
    };

    const content = parseContent(article.content);

    // Extract key fields
    const reportTitle = content['Report Title'] || content['report_title'] || null;
    const summary = content['Summary'] || content['summary'] || content['Ringkasan'] || null;

    // Get remaining fields (excluding title and summary) for structured data display
    const structuredFields = Object.entries(content).filter(([key]) =>
        !['Report Title', 'report_title', 'Summary', 'summary', 'Ringkasan', 'raw_text', 'detected_type', 'confidence'].includes(key)
    );

    const hasRawText = content['raw_text'];

    const handleDownload = () => {
        if (article.filePath) {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
            window.open(`${baseUrl}/kb/files/${article.id}/download`, '_blank');
        }
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
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', maxWidth: 400 }} noWrap>
                        {reportTitle || article.title}
                    </Typography>
                </Breadcrumbs>
            </Box>

            <Box sx={{ maxWidth: 1100, mx: 'auto', px: 4, py: 4 }}>
                <Box sx={{ display: 'flex', gap: 4 }}>
                    {/* Main Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #E2E8F0' }}>
                            {/* Title */}
                            <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', mb: 2, lineHeight: 1.3 }}>
                                {reportTitle || article.title}
                            </Typography>

                            {/* Meta chips */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
                                {article.category && (
                                    <Chip label={article.category.name} size="small" sx={{
                                        bgcolor: `${article.category.color}15`, color: article.category.color, fontWeight: 600
                                    }} />
                                )}
                                <Chip
                                    icon={<CalendarToday sx={{ fontSize: 14 }} />}
                                    label={formatDate(article.createdAt)}
                                    size="small" variant="outlined"
                                    sx={{ fontSize: '12px', borderColor: '#E2E8F0' }}
                                />
                                {article.confidenceScore && (
                                    <Chip
                                        icon={<ConfidenceIcon sx={{ fontSize: 14 }} />}
                                        label={`Confidence: ${article.confidenceScore}%`}
                                        size="small" variant="outlined"
                                        sx={{ fontSize: '12px', borderColor: '#E2E8F0', color: '#10B981' }}
                                    />
                                )}
                                {article.processingTime && (
                                    <Chip
                                        icon={<SpeedIcon sx={{ fontSize: 14 }} />}
                                        label={`Proses: ${article.processingTime}`}
                                        size="small" variant="outlined"
                                        sx={{ fontSize: '12px', borderColor: '#E2E8F0' }}
                                    />
                                )}
                            </Box>

                            <Divider sx={{ mb: 3 }} />

                            {/* Summary Section */}
                            {summary && (
                                <Box sx={{ mb: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <AIIcon sx={{ fontSize: 20, color: '#6366F1' }} />
                                        <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                                            Ringkasan Dokumen
                                        </Typography>
                                    </Box>
                                    <Paper elevation={0} sx={{
                                        p: 3, borderRadius: 2,
                                        bgcolor: '#F8FAFF',
                                        border: '1px solid #E0E7FF',
                                    }}>
                                        <Typography sx={{
                                            fontSize: '14px', color: '#374151', lineHeight: 2,
                                            whiteSpace: 'pre-wrap', textAlign: 'justify'
                                        }}>
                                            {summary}
                                        </Typography>
                                    </Paper>
                                </Box>
                            )}

                            {/* Structured Fields (for template-mode documents like KTP, Invoice) */}
                            {structuredFields.length > 0 && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', mb: 2 }}>
                                        📋 Data Terstruktur
                                    </Typography>
                                    <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                                        {structuredFields.map(([key, value], i) => {
                                            const isObject = typeof value === 'object' && value !== null;
                                            const displayValue = isObject ? JSON.stringify(value, null, 2) : String(value || '-');
                                            const isLong = displayValue.length > 100;

                                            return (
                                                <Box key={key} sx={{
                                                    display: 'flex',
                                                    borderBottom: i < structuredFields.length - 1 ? '1px solid #F1F5F9' : 'none',
                                                    '&:hover': { bgcolor: '#FAFBFE' }
                                                }}>
                                                    <Box sx={{
                                                        width: 180, flexShrink: 0, p: 2, bgcolor: '#F8FAFC',
                                                        borderRight: '1px solid #F1F5F9',
                                                        display: 'flex', alignItems: 'flex-start'
                                                    }}>
                                                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                                                            {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ flex: 1, p: 2, minWidth: 0 }}>
                                                        {isObject ? (
                                                            <Box component="pre" sx={{
                                                                fontSize: '12px', color: '#374151', fontFamily: 'monospace',
                                                                whiteSpace: 'pre-wrap', m: 0, bgcolor: '#F9FAFB',
                                                                p: 1.5, borderRadius: 1
                                                            }}>
                                                                {displayValue}
                                                            </Box>
                                                        ) : isLong ? (
                                                            <Typography sx={{
                                                                fontSize: '13px', color: '#374151', lineHeight: 1.8,
                                                                whiteSpace: 'pre-wrap'
                                                            }}>
                                                                {displayValue}
                                                            </Typography>
                                                        ) : (
                                                            <Typography sx={{ fontSize: '13px', color: '#374151' }}>
                                                                {displayValue}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Paper>
                                </Box>
                            )}

                            {/* Raw text fallback */}
                            {hasRawText && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', mb: 2 }}>
                                        📝 Konten Dokumen
                                    </Typography>
                                    <Typography sx={{
                                        fontSize: '14px', color: '#374151', lineHeight: 1.8,
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {content.raw_text}
                                    </Typography>
                                </Box>
                            )}
                        </Paper>

                        {/* Tags */}
                        {article.tags && (
                            <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                <Typography sx={{ fontSize: '13px', color: '#94A3B8', mr: 1 }}>Tipe:</Typography>
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
                        {/* Document Info Card */}
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #E2E8F0', mb: 3 }}>
                            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', mb: 2 }}>
                                📄 Informasi Dokumen
                            </Typography>
                            {[
                                { label: 'Nama File', value: article.title },
                                { label: 'Tipe', value: article.category?.name },
                                { label: 'Ukuran', value: article.fileSize },
                                { label: 'Confidence', value: article.confidenceScore ? `${article.confidenceScore}%` : null },
                                { label: 'Waktu Proses', value: article.processingTime },
                                { label: 'Tanggal Scan', value: formatDate(article.createdAt) },
                            ].filter(item => item.value).map((item, i) => (
                                <Box key={i} sx={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    py: 1, borderBottom: '1px solid #F8FAFC'
                                }}>
                                    <Typography sx={{ fontSize: '12px', color: '#94A3B8' }}>{item.label}</Typography>
                                    <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#374151', maxWidth: 160, textAlign: 'right' }} noWrap>
                                        {item.value}
                                    </Typography>
                                </Box>
                            ))}

                            {/* Download Button */}
                            {article.filePath && (
                                <Button
                                    fullWidth variant="contained"
                                    startIcon={<DownloadIcon />}
                                    onClick={handleDownload}
                                    sx={{
                                        mt: 2, bgcolor: '#6366F1', textTransform: 'none',
                                        fontWeight: 600, borderRadius: 2,
                                        '&:hover': { bgcolor: '#4F46E5' }
                                    }}
                                >
                                    Download File
                                </Button>
                            )}
                        </Paper>

                        {/* AI Insight CTA */}
                        <Paper elevation={0} sx={{
                            p: 3, borderRadius: 2,
                            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                        }}>
                            <AIIcon sx={{ fontSize: 28, color: 'white', mb: 1 }} />
                            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: 'white', mb: 0.5 }}>
                                Tanya AI tentang dokumen ini
                            </Typography>
                            <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', mb: 2, lineHeight: 1.5 }}>
                                Dapatkan insight lebih dalam dari konten dokumen ini menggunakan AI assistant.
                            </Typography>
                            <Button
                                fullWidth variant="contained"
                                onClick={() => navigate('/ai-assistant')}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)', color: 'white', textTransform: 'none',
                                    fontWeight: 600, borderRadius: 2, backdropFilter: 'blur(4px)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                                }}
                            >
                                Buka AI Assistant
                            </Button>
                        </Paper>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Article;
