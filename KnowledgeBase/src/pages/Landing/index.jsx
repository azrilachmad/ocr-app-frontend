import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, TextField, Button, Paper, CircularProgress,
    Alert, InputAdornment, IconButton, Grid
} from '@mui/material';
import {
    Visibility, VisibilityOff, AutoStories as KBIcon,
    Dashboard as DashboardIcon, SmartToy as AIIcon,
    FolderOpen as FolderIcon, Search as SearchIcon,
    Security as SecurityIcon, Speed as SpeedIcon,
    CloudDone as CloudIcon, Groups as GroupsIcon,
    CheckCircle as CheckIcon, ArrowForward,
    AccountBalance as MuseumIcon, Description as DocIcon,
    TrendingUp as TrendIcon
} from '@mui/icons-material';
import { login } from '../../services/api';
import { useAuth } from '../../App';

const Landing = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showLogin, setShowLogin] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) return setError('Please fill in all fields');
        try {
            setLoading(true);
            setError('');
            const res = await login(email, password);
            setUser(res.data?.data?.user);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: <KBIcon sx={{ fontSize: 36 }} />, title: 'Knowledge Articles', desc: 'Akses pustaka pengetahuan organisasi dengan kategori topik terstruktur, artikel, dan konten wiki yang selalu terupdate.', color: '#6366F1' },
        { icon: <FolderIcon sx={{ fontSize: 36 }} />, title: 'File Directory', desc: 'Telusuri dan unduh dokumen asli — laporan PDF, spreadsheet, policy, dan file-file penting dari satu tempat.', color: '#0EA5E9' },
        { icon: <AIIcon sx={{ fontSize: 36 }} />, title: 'AI Analytics', desc: 'Tanya apa saja dan dapatkan insight dari seluruh basis data menggunakan AI yang memahami konteks dokumen Anda.', color: '#8B5CF6' },
        { icon: <SearchIcon sx={{ fontSize: 36 }} />, title: 'Smart Search', desc: 'Pencarian cerdas lintas artikel, file, dan data OCR. Temukan informasi dalam hitungan detik.', color: '#10B981' },
    ];

    const stats = [
        { number: '12,500+', label: 'Artefak Tercatat', icon: <MuseumIcon /> },
        { number: '8,400+', label: 'Dokumen Digital', icon: <DocIcon /> },
        { number: '45,000+', label: 'Arsip Foto', icon: <CloudIcon /> },
        { number: '340+', label: 'Situs Budaya', icon: <TrendIcon /> },
    ];

    const capabilities = [
        { title: 'Digitalisasi Dokumen', desc: 'Konversi dokumen fisik menjadi data terstruktur menggunakan teknologi OCR canggih', icon: '📄' },
        { title: 'Analisis Cerdas AI', desc: 'Dapatkan insight, ringkasan, dan analisis lintas dokumen dengan bantuan AI', icon: '🤖' },
        { title: 'Manajemen Pengetahuan', desc: 'Kelola seluruh pengetahuan organisasi dalam satu platform terintegrasi', icon: '📚' },
        { title: 'Kolaborasi Tim', desc: 'Akses bersama untuk semua level — eksekutif, manajer, dan staf operasional', icon: '👥' },
        { title: 'Keamanan Data', desc: 'Verifikasi dan validasi data terjamin dengan workflow review dan approval', icon: '🔒' },
        { title: 'Dashboard Analitik', desc: 'Visualisasi data organisasi dengan dashboard interaktif dan laporan real-time', icon: '📊' },
    ];

    const workflows = [
        { step: '01', title: 'Upload Dokumen', desc: 'Unggah dokumen PDF, Excel, atau gambar ke platform' },
        { step: '02', title: 'Ekstraksi Data', desc: 'AI & OCR memproses dan mengekstrak informasi dari dokumen' },
        { step: '03', title: 'Verifikasi', desc: 'Review dan validasi akurasi data yang diekstrak' },
        { step: '04', title: 'Knowledge Base', desc: 'Data siap diakses, dicari, dan dianalisis oleh seluruh tim' },
    ];

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#0F172A', overflowX: 'hidden' }}>

            {/* ===== NAVBAR ===== */}
            <Box sx={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
                px: 4, py: 2, background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1200, mx: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{
                            width: 40, height: 40, borderRadius: 2,
                            background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <KBIcon sx={{ fontSize: 22, color: 'white' }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '16px', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
                                IHA Knowledge Base
                            </Typography>
                            <Typography sx={{ fontSize: '10px', color: '#64748B', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                Indonesian Heritage Agency
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Typography component="a" href="#features" sx={{ fontSize: '13px', color: '#94A3B8', cursor: 'pointer', '&:hover': { color: 'white' }, transition: 'color 0.2s', display: { xs: 'none', md: 'block' } }}>
                            Fitur
                        </Typography>
                        <Typography component="a" href="#workflow" sx={{ fontSize: '13px', color: '#94A3B8', cursor: 'pointer', '&:hover': { color: 'white' }, transition: 'color 0.2s', display: { xs: 'none', md: 'block' } }}>
                            Cara Kerja
                        </Typography>
                        <Typography component="a" href="#capabilities" sx={{ fontSize: '13px', color: '#94A3B8', cursor: 'pointer', '&:hover': { color: 'white' }, transition: 'color 0.2s', display: { xs: 'none', md: 'block' } }}>
                            Kapabilitas
                        </Typography>
                        <Button variant="contained" onClick={() => setShowLogin(true)} sx={{
                            background: 'linear-gradient(135deg, #4F46E5, #6366F1)', fontSize: '13px',
                            px: 3, py: 0.8, borderRadius: 2, fontWeight: 600,
                            '&:hover': { boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }
                        }}>
                            Sign In
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* ===== HERO SECTION ===== */}
            <Box sx={{
                minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', px: 4, pt: 10, position: 'relative'
            }}>
                {/* Background decorations */}
                <Box sx={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)' }} />
                <Box sx={{ position: 'absolute', bottom: '10%', right: '5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)' }} />
                <Box sx={{ position: 'absolute', top: '30%', right: '20%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)' }} />

                <Box sx={{ maxWidth: 800, position: 'relative', zIndex: 1 }} className="fade-in-up">
                    <Typography sx={{
                        fontSize: '13px', fontWeight: 600, color: '#6366F1', letterSpacing: '3px',
                        textTransform: 'uppercase', mb: 3
                    }}>
                        Platform Manajemen Pengetahuan
                    </Typography>
                    <Typography sx={{
                        fontSize: { xs: '36px', md: '56px' }, fontWeight: 800, color: 'white',
                        lineHeight: 1.1, mb: 3
                    }}>
                        Pusat Pengetahuan{' '}
                        <Box component="span" sx={{
                            background: 'linear-gradient(135deg, #6366F1, #0EA5E9)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>
                            Warisan Budaya
                        </Box>
                        {' '}Indonesia
                    </Typography>
                    <Typography sx={{
                        fontSize: { xs: '16px', md: '18px' }, color: '#94A3B8', maxWidth: 600, mx: 'auto',
                        lineHeight: 1.8, mb: 5
                    }}>
                        Kelola, temukan, dan analisis seluruh dokumen organisasi secara cerdas.
                        Dari digitalisasi dokumen hingga insight berbasis AI — semua dalam satu platform terpadu.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button variant="contained" size="large" endIcon={<ArrowForward />}
                            onClick={() => setShowLogin(true)}
                            sx={{
                                px: 4, py: 1.5, borderRadius: 2, fontSize: '15px', fontWeight: 600,
                                background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                                boxShadow: '0 4px 20px rgba(79,70,229,0.4)',
                                '&:hover': { boxShadow: '0 8px 30px rgba(79,70,229,0.5)', transform: 'translateY(-2px)' },
                                transition: 'all 0.3s'
                            }}>
                            Mulai Sekarang
                        </Button>
                        <Button variant="outlined" size="large"
                            href="#features"
                            sx={{
                                px: 4, py: 1.5, borderRadius: 2, fontSize: '15px', fontWeight: 600,
                                borderColor: 'rgba(255,255,255,0.15)', color: '#CBD5E1',
                                '&:hover': { borderColor: '#6366F1', color: 'white', bgcolor: 'rgba(99,102,241,0.05)' }
                            }}>
                            Pelajari Lebih
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* ===== STATS BAR ===== */}
            <Box sx={{
                py: 6, px: 4,
                background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(14,165,233,0.05) 100%)',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
                <Box sx={{
                    maxWidth: 1000, mx: 'auto',
                    display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 4
                }}>
                    {stats.map((s, i) => (
                        <Box key={i} sx={{ textAlign: 'center' }} className="fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                            <Box sx={{ color: '#6366F1', mb: 1 }}>{s.icon}</Box>
                            <Typography sx={{ fontSize: '32px', fontWeight: 800, color: 'white', lineHeight: 1 }}>
                                {s.number}
                            </Typography>
                            <Typography sx={{ fontSize: '13px', color: '#94A3B8', mt: 0.5 }}>{s.label}</Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* ===== FEATURES SECTION ===== */}
            <Box id="features" sx={{ py: 10, px: 4 }}>
                <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#6366F1', letterSpacing: '2px', textTransform: 'uppercase', mb: 1.5 }}>
                            Fitur Utama
                        </Typography>
                        <Typography sx={{ fontSize: '32px', fontWeight: 800, color: 'white', mb: 1.5 }}>
                            Semua yang Anda Butuhkan
                        </Typography>
                        <Typography sx={{ fontSize: '16px', color: '#94A3B8', maxWidth: 500, mx: 'auto' }}>
                            Platform knowledge base yang lengkap untuk mengelola pengetahuan organisasi
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                        {features.map((f, i) => (
                            <Paper key={i} elevation={0} className="fade-in-up" sx={{
                                p: 4, borderRadius: 3,
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                transition: 'all 0.3s ease',
                                animationDelay: `${i * 0.1}s`,
                                '&:hover': {
                                    background: 'rgba(255,255,255,0.06)',
                                    transform: 'translateY(-4px)',
                                    borderColor: `${f.color}40`,
                                    boxShadow: `0 8px 30px ${f.color}10`
                                }
                            }}>
                                <Box sx={{
                                    width: 56, height: 56, borderRadius: 2, mb: 2.5,
                                    background: `${f.color}15`, color: f.color,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {f.icon}
                                </Box>
                                <Typography sx={{ fontSize: '18px', fontWeight: 700, color: 'white', mb: 1 }}>
                                    {f.title}
                                </Typography>
                                <Typography sx={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.7 }}>
                                    {f.desc}
                                </Typography>
                            </Paper>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* ===== WORKFLOW SECTION ===== */}
            <Box id="workflow" sx={{
                py: 10, px: 4,
                background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.03), transparent)'
            }}>
                <Box sx={{ maxWidth: 900, mx: 'auto' }}>
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#0EA5E9', letterSpacing: '2px', textTransform: 'uppercase', mb: 1.5 }}>
                            Cara Kerja
                        </Typography>
                        <Typography sx={{ fontSize: '32px', fontWeight: 800, color: 'white', mb: 1.5 }}>
                            Dari Dokumen ke Pengetahuan
                        </Typography>
                        <Typography sx={{ fontSize: '16px', color: '#94A3B8', maxWidth: 500, mx: 'auto' }}>
                            Transformasi dokumen menjadi basis pengetahuan dalam 4 langkah sederhana
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
                        {workflows.map((w, i) => (
                            <Box key={i} className="fade-in-up" sx={{
                                textAlign: 'center', position: 'relative',
                                animationDelay: `${i * 0.15}s`
                            }}>
                                <Box sx={{
                                    width: 64, height: 64, borderRadius: '50%', mx: 'auto', mb: 2,
                                    background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
                                    position: 'relative', zIndex: 1
                                }}>
                                    <Typography sx={{ fontSize: '20px', fontWeight: 800, color: 'white' }}>
                                        {w.step}
                                    </Typography>
                                </Box>
                                {i < 3 && (
                                    <Box sx={{
                                        position: 'absolute', top: 32, left: '60%', width: '80%', height: '2px',
                                        background: 'linear-gradient(90deg, rgba(99,102,241,0.3), transparent)',
                                        display: { xs: 'none', md: 'block' }
                                    }} />
                                )}
                                <Typography sx={{ fontSize: '16px', fontWeight: 600, color: 'white', mb: 0.5 }}>
                                    {w.title}
                                </Typography>
                                <Typography sx={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.6 }}>
                                    {w.desc}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* ===== CAPABILITIES GRID ===== */}
            <Box id="capabilities" sx={{ py: 10, px: 4 }}>
                <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#8B5CF6', letterSpacing: '2px', textTransform: 'uppercase', mb: 1.5 }}>
                            Kapabilitas
                        </Typography>
                        <Typography sx={{ fontSize: '32px', fontWeight: 800, color: 'white', mb: 1.5 }}>
                            Solusi Lengkap untuk Organisasi
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                        {capabilities.map((c, i) => (
                            <Box key={i} className="fade-in-up" sx={{
                                p: 3.5, borderRadius: 3,
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                transition: 'all 0.3s',
                                animationDelay: `${i * 0.08}s`,
                                '&:hover': { background: 'rgba(255,255,255,0.05)', transform: 'translateY(-3px)' }
                            }}>
                                <Typography sx={{ fontSize: '28px', mb: 2 }}>{c.icon}</Typography>
                                <Typography sx={{ fontSize: '15px', fontWeight: 600, color: 'white', mb: 1 }}>
                                    {c.title}
                                </Typography>
                                <Typography sx={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.6 }}>
                                    {c.desc}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>

            {/* ===== CTA SECTION ===== */}
            <Box sx={{ py: 10, px: 4 }}>
                <Box sx={{
                    maxWidth: 800, mx: 'auto', textAlign: 'center', p: 6, borderRadius: 4,
                    background: 'linear-gradient(135deg, rgba(79,70,229,0.15) 0%, rgba(139,92,246,0.1) 100%)',
                    border: '1px solid rgba(99,102,241,0.15)',
                    position: 'relative', overflow: 'hidden'
                }}>
                    <Box sx={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(99,102,241,0.08)' }} />
                    <Box sx={{ position: 'absolute', bottom: -40, left: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(14,165,233,0.06)' }} />
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography sx={{ fontSize: '28px', fontWeight: 800, color: 'white', mb: 1.5 }}>
                            Siap Memulai?
                        </Typography>
                        <Typography sx={{ fontSize: '16px', color: '#94A3B8', mb: 4, maxWidth: 500, mx: 'auto' }}>
                            Akses seluruh pengetahuan organisasi Anda dalam satu platform. Login atau hubungi administrator untuk mendapatkan akses.
                        </Typography>
                        <Button variant="contained" size="large" endIcon={<ArrowForward />}
                            onClick={() => setShowLogin(true)}
                            sx={{
                                px: 5, py: 1.5, fontSize: '16px', fontWeight: 700, borderRadius: 2,
                                background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                                boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                                '&:hover': { boxShadow: '0 8px 30px rgba(99,102,241,0.5)' }
                            }}>
                            Sign In ke Platform
                        </Button>
                    </Box>
                </Box>
            </Box>

            {/* ===== FOOTER ===== */}
            <Box sx={{
                py: 4, px: 4, textAlign: 'center',
                borderTop: '1px solid rgba(255,255,255,0.05)'
            }}>
                <Typography sx={{ fontSize: '12px', color: '#64748B' }}>
                    © Synchro 2017 – 2026 | Indonesian Heritage Agency Knowledge Base Platform
                </Typography>
                <Typography sx={{ fontSize: '11px', color: '#475569', mt: 0.5 }}>
                    Powered by Synchro Scan — AI Document Processing & Knowledge Management
                </Typography>
            </Box>

            {/* ===== LOGIN MODAL ===== */}
            {showLogin && (
                <Box sx={{
                    position: 'fixed', inset: 0, zIndex: 2000,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    px: 2
                }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowLogin(false); }}
                >
                    <Paper elevation={0} sx={{
                        width: '100%', maxWidth: 420, p: 5, borderRadius: 3,
                        background: 'rgba(255,255,255,0.97)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        animation: 'fadeInUp 0.3s ease-out'
                    }}>
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                            <Box sx={{
                                width: 56, height: 56, borderRadius: 2, mx: 'auto', mb: 2,
                                background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <KBIcon sx={{ fontSize: 28, color: 'white' }} />
                            </Box>
                            <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>Welcome Back</Typography>
                            <Typography sx={{ fontSize: '14px', color: '#64748B', mt: 0.5 }}>Sign in to access knowledge base</Typography>
                        </Box>

                        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

                        <form onSubmit={handleLogin}>
                            <TextField
                                fullWidth placeholder="Email address" type="email"
                                value={email} onChange={(e) => setEmail(e.target.value)}
                                sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#F8FAFC' } }}
                            />
                            <TextField
                                fullWidth placeholder="Password"
                                type={showPassword ? 'text' : 'password'}
                                value={password} onChange={(e) => setPassword(e.target.value)}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                                {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#F8FAFC' } }}
                            />
                            <Button
                                type="submit" fullWidth variant="contained" size="large" disabled={loading}
                                sx={{
                                    py: 1.5, borderRadius: 2, fontSize: '15px',
                                    background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                                    boxShadow: '0 4px 14px rgba(79,70,229,0.4)',
                                    '&:hover': { boxShadow: '0 6px 20px rgba(79,70,229,0.5)' }
                                }}
                            >
                                {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Sign In'}
                            </Button>
                        </form>

                        <Button fullWidth onClick={() => setShowLogin(false)} sx={{ mt: 1.5, color: '#94A3B8', fontSize: '13px' }}>
                            Kembali
                        </Button>
                    </Paper>
                </Box>
            )}
        </Box>
    );
};

export default Landing;
