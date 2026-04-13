import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Typography, TextField, Button, Paper, IconButton,
    CircularProgress, Avatar, Drawer, List, ListItemButton,
    ListItemText, ListItemIcon, Divider, Tooltip,
    Dialog, DialogTitle, DialogContent
} from '@mui/material';
import {
    Send as SendIcon, ArrowBack, Add as AddIcon,
    Delete as DeleteIcon, SmartToy as AIIcon,
    Chat as ChatIcon, AutoStories as KBIcon,
    FindInPage as FindInPageIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ChartRenderer, { parseChartBlocks } from '../../components/ChartRenderer';
import {
    getChatSessions, createChatSession, getChatMessages,
    sendChatMessage, deleteChatSession, getPopularArticles
} from '../../services/api';
import { useAuth } from '../../App';

const DRAWER_WIDTH = 280;

const AIAssistant = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionsLoading, setSessionsLoading] = useState(true);

    const location = useLocation();
    const deepScanTarget = location.state?.targetDocumentId || null;
    const deepScanTitle = location.state?.docTitle || 'Dokumen';
    const hasInitializedDeepScan = useRef(false);

    const [docModalOpen, setDocModalOpen] = useState(false);
    const [recentDocs, setRecentDocs] = useState([]);
    const [docsLoading, setDocsLoading] = useState(false);

    const handleOpenDocModal = async () => {
        setDocModalOpen(true);
        setDocsLoading(true);
        try {
            const res = await getPopularArticles();
            setRecentDocs(res.data?.data || []);
        } catch (e) {
            console.error('Failed fetching docs', e);
        } finally {
            setDocsLoading(false);
        }
    };

    const handleSelectDeepScan = async (doc) => {
        try {
            const createRes = await createChatSession(`Analisis: ${doc.fileName}`, doc.id);
            if (createRes.data?.data) {
                setSessions(prev => [createRes.data.data, ...prev]);
                setActiveSession(createRes.data.data.id);
                setMessages([]);
            }
        } catch (e) {
            console.error('Failed creating deep scan session', e);
        }
        setDocModalOpen(false);
    };

    // Fetch sessions on mount
    useEffect(() => {
        fetchSessions();
    }, []);

    // Fetch messages when active session changes
    useEffect(() => {
        if (activeSession) fetchMessages(activeSession);
        else setMessages([]);
    }, [activeSession]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchSessions = async () => {
        try {
            setSessionsLoading(true);
            const res = await getChatSessions();
            let list = res.data?.data || [];

            // Check if we need to initialize a deep scan
            if (deepScanTarget && !hasInitializedDeepScan.current) {
                hasInitializedDeepScan.current = true;
                const existingSession = list.find(s => s.targetDocumentId === deepScanTarget);

                if (existingSession) {
                    setActiveSession(existingSession.id);
                } else {
                    // Create new deep scan session
                    const createRes = await createChatSession(`Analisis: ${deepScanTitle}`, deepScanTarget);
                    if (createRes.data?.data) {
                        list = [createRes.data.data, ...list];
                        setActiveSession(createRes.data.data.id);
                    }
                }

                // Clear location state to prevent re-triggering on refresh
                navigate('/ai-assistant', { replace: true, state: {} });
            } else if (!activeSession && list.length > 0) {
                setActiveSession(list[0].id);
            }

            setSessions(list);
        } catch (e) {
            console.error('Failed to fetch sessions:', e);
        } finally {
            setSessionsLoading(false);
        }
    };

    const fetchMessages = async (sessionId) => {
        try {
            const res = await getChatMessages(sessionId);
            setMessages(res.data?.data || []);
        } catch (e) {
            console.error('Failed to fetch messages:', e);
        }
    };

    const handleNewSession = async () => {
        try {
            const res = await createChatSession('New Conversation');
            const newSession = res.data?.data;
            if (newSession) {
                setSessions(prev => [newSession, ...prev]);
                setActiveSession(newSession.id);
                setMessages([]);
            }
        } catch (e) {
            console.error('Failed to create session:', e);
        }
    };

    const handleDeleteSession = async (sessionId) => {
        try {
            await deleteChatSession(sessionId);
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            if (activeSession === sessionId) {
                const remaining = sessions.filter(s => s.id !== sessionId);
                setActiveSession(remaining.length > 0 ? remaining[0].id : null);
            }
        } catch (e) {
            console.error('Failed to delete session:', e);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');

        // If no active session, create one
        let sessionId = activeSession;
        if (!sessionId) {
            try {
                const res = await createChatSession(userMsg.substring(0, 30));
                const newSession = res.data?.data;
                if (newSession) {
                    setSessions(prev => [newSession, ...prev]);
                    sessionId = newSession.id;
                    setActiveSession(sessionId);
                }
            } catch (e) {
                console.error('Failed to create session:', e);
                return;
            }
        }

        // Add user message optimistically
        setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'user',
            content: userMsg,
            createdAt: new Date().toISOString()
        }]);

        try {
            setLoading(true);
            const res = await sendChatMessage(sessionId, userMsg);
            const responseData = res.data?.data;
            if (responseData?.assistantMessage) {
                setMessages(prev => [...prev, responseData.assistantMessage]);
            }
            // Refresh sessions list to update title
            fetchSessions();
        } catch (err) {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'assistant',
                content: 'Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi.',
                createdAt: new Date().toISOString()
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#F8FAFC' }}>
            {/* Sidebar */}
            <Box sx={{
                width: DRAWER_WIDTH, flexShrink: 0, borderRight: '1px solid #E2E8F0',
                bgcolor: 'white', display: 'flex', flexDirection: 'column'
            }}>
                {/* Sidebar Header */}
                <Box sx={{
                    p: 2, borderBottom: '1px solid #E2E8F0',
                    display: 'flex', alignItems: 'center', gap: 1
                }}>
                    <IconButton size="small" onClick={() => navigate('/home')} sx={{ color: '#64748B' }}>
                        <ArrowBack fontSize="small" />
                    </IconButton>
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                            AI Assistant
                        </Typography>
                    </Box>
                    <Tooltip title="New conversation">
                        <IconButton size="small" onClick={handleNewSession} sx={{
                            bgcolor: '#6366F1', color: 'white', '&:hover': { bgcolor: '#4F46E5' }
                        }}>
                            <AddIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Sessions List */}
                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    {sessionsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : sessions.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
                            <ChatIcon sx={{ fontSize: 40, color: '#CBD5E1', mb: 1 }} />
                            <Typography sx={{ fontSize: '13px', color: '#94A3B8' }}>
                                Belum ada percakapan
                            </Typography>
                        </Box>
                    ) : (
                        <List sx={{ px: 1, py: 0.5 }}>
                            {sessions.map((session) => (
                                <ListItemButton
                                    key={session.id}
                                    selected={activeSession === session.id}
                                    onClick={() => setActiveSession(session.id)}
                                    sx={{
                                        borderRadius: 2, mb: 0.5, py: 1.2,
                                        '&.Mui-selected': {
                                            bgcolor: '#EEF2FF', '&:hover': { bgcolor: '#E0E7FF' }
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        <ChatIcon sx={{ fontSize: 18, color: activeSession === session.id ? '#6366F1' : '#94A3B8' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={session.title || 'Untitled'}
                                        primaryTypographyProps={{
                                            fontSize: '13px', fontWeight: activeSession === session.id ? 600 : 400,
                                            color: activeSession === session.id ? '#4F46E5' : '#374151',
                                            noWrap: true
                                        }}
                                    />
                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }}
                                        sx={{ opacity: 0.3, '&:hover': { opacity: 1, color: '#EF4444' } }}>
                                        <DeleteIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </Box>
            </Box>

            {/* Main Chat Area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Chat Header */}
                <Box sx={{
                    px: 3, py: 2, borderBottom: '1px solid #E2E8F0', bgcolor: 'white',
                    display: 'flex', alignItems: 'center', gap: 2
                }}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: 2,
                        background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <AIIcon sx={{ fontSize: 20, color: 'white' }} />
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography sx={{ fontSize: '15px', fontWeight: 600, color: '#0F172A' }}>
                                Knowledge Base AI
                            </Typography>
                            <Typography sx={{ fontSize: '12px', color: '#64748B' }}>
                                Analisis dokumen dan data organisasi Anda
                            </Typography>
                        </Box>
                        {sessions.find(s => s.id === activeSession)?.targetDocumentId && (
                            <Box sx={{
                                display: 'flex', alignItems: 'center', gap: 1,
                                px: 1.5, py: 0.5, borderRadius: 2,
                                bgcolor: '#F0FDF4', border: '1px solid #BBF7D0'
                            }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22C55E' }} />
                                <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#166534' }}>
                                    Deep Analysis Mode
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Messages */}
                <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 3 }}>
                    {messages.length === 0 && !loading && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <AIIcon sx={{ fontSize: 64, color: '#E2E8F0', mb: 2 }} />
                            <Typography sx={{ fontSize: '20px', fontWeight: 600, color: '#374151', mb: 1 }}>
                                Mulai Percakapan
                            </Typography>
                            <Typography sx={{ fontSize: '14px', color: '#94A3B8', maxWidth: 400, mx: 'auto' }}>
                                Tanyakan apa saja tentang dokumen, laporan, atau data organisasi Anda
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mt: 3 }}>
                                {['Ringkas laporan keuangan 2025', 'Bandingkan data antar museum', 'Cari informasi cagar budaya'].map((q, i) => (
                                    <Button key={i} variant="outlined" size="small"
                                        onClick={() => setInput(q)}
                                        sx={{
                                            borderRadius: 5, fontSize: '12px', borderColor: '#E2E8F0',
                                            color: '#64748B', textTransform: 'none',
                                            '&:hover': { borderColor: '#6366F1', color: '#6366F1', bgcolor: '#EEF2FF' }
                                        }}>
                                        {q}
                                    </Button>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {messages.map((msg, i) => (
                        <Box key={msg.id || i} sx={{
                            display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            mb: 2, animationDelay: '0.1s'
                        }} className="fade-in-up">
                            {msg.role !== 'user' && (
                                <Avatar sx={{
                                    width: 32, height: 32, mr: 1.5, mt: 0.5,
                                    background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', fontSize: '14px'
                                }}>
                                    <AIIcon sx={{ fontSize: 18 }} />
                                </Avatar>
                            )}
                            <Paper elevation={0} sx={{
                                maxWidth: '70%', p: 2, borderRadius: 2.5,
                                bgcolor: msg.role === 'user' ? '#4F46E5' : 'white',
                                color: msg.role === 'user' ? 'white' : '#1F2937',
                                border: msg.role !== 'user' ? '1px solid #E2E8F0' : 'none',
                                wordBreak: 'break-word', overflowX: 'auto',
                                '& table': { borderCollapse: 'collapse', width: '100%', my: 1, fontSize: '13px' },
                                '& th, & td': { border: '1px solid #E2E8F0', px: 1.5, py: 0.8, textAlign: 'left' },
                                '& th': { bgcolor: '#F8FAFC', fontWeight: 600 },
                                '& ul, & ol': { pl: 2.5, my: 0.5 },
                                '& li': { mb: 0.3, fontSize: '14px' },
                                '& h1, & h2, & h3': { mt: 1, mb: 0.5 },
                                '& p': { my: 0.3, fontSize: '14px', lineHeight: 1.7 },
                                '& code': { bgcolor: '#F1F5F9', px: 0.8, py: 0.2, borderRadius: 1, fontSize: '12px' },
                                '& strong': { fontWeight: 600 }
                            }}>
                                {msg.role === 'user' ? (
                                    <Typography sx={{ fontSize: '14px', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                        {msg.content}
                                    </Typography>
                                ) : (
                                    parseChartBlocks(msg.content).map((block, bi) =>
                                        block.type === 'chart' ? (
                                            <ChartRenderer key={bi} chartData={block.data} />
                                        ) : (
                                            <ReactMarkdown key={bi} remarkPlugins={[remarkGfm]}>
                                                {block.content}
                                            </ReactMarkdown>
                                        )
                                    )
                                )}
                            </Paper>
                            {msg.role === 'user' && (
                                <Avatar sx={{
                                    width: 32, height: 32, ml: 1.5, mt: 0.5,
                                    bgcolor: '#6366F1', fontSize: '13px'
                                }}>
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </Avatar>
                            )}
                        </Box>
                    ))}

                    {loading && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <Avatar sx={{
                                width: 32, height: 32,
                                background: 'linear-gradient(135deg, #8B5CF6, #6366F1)'
                            }}>
                                <AIIcon sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid #E2E8F0' }}>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    {[0, 1, 2].map(i => (
                                        <Box key={i} sx={{
                                            width: 8, height: 8, borderRadius: '50%', bgcolor: '#94A3B8',
                                            animation: 'float 1.4s ease-in-out infinite',
                                            animationDelay: `${i * 0.16}s`
                                        }} />
                                    ))}
                                </Box>
                            </Paper>
                        </Box>
                    )}
                    <div ref={messagesEndRef} />
                </Box>

                {/* Input */}
                <Box component="form" onSubmit={handleSend} sx={{
                    px: 3, py: 2, borderTop: '1px solid #E2E8F0', bgcolor: 'white'
                }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 1,
                        border: '2px solid #E2E8F0', borderRadius: 3, px: 2, py: 0.5,
                        transition: 'border-color 0.3s', '&:focus-within': { borderColor: '#6366F1' }
                    }}>
                        <Tooltip title="Mode Chat 1 Dokumen Spesifik">
                            <IconButton onClick={handleOpenDocModal} sx={{
                                color: '#6366F1', bgcolor: '#EEF2FF', width: 36, height: 36,
                                '&:hover': { bgcolor: '#E0E7FF' }
                            }}>
                                <AddIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                        </Tooltip>
                        <TextField
                            fullWidth multiline maxRows={4} placeholder="Ketik pertanyaan Anda..."
                            value={input} onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                            InputProps={{ sx: { '& fieldset': { border: 'none' } } }}
                            sx={{ '& .MuiInputBase-root': { p: 0 } }}
                        />
                        <IconButton type="submit" disabled={!input.trim() || loading} sx={{
                            bgcolor: input.trim() ? '#4F46E5' : '#E2E8F0',
                            color: 'white', width: 40, height: 40,
                            '&:hover': { bgcolor: '#3730A3' },
                            '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' }
                        }}>
                            <SendIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Box>
                    <Typography sx={{ textAlign: 'center', mt: 1, fontSize: '11px', color: '#CBD5E1' }}>
                        AI dapat membuat kesalahan. Verifikasi informasi penting secara manual.
                    </Typography>
                </Box>
            </Box>
            {/* Find In Page / Select Doc Modal */}
            <Dialog open={docModalOpen} onClose={() => setDocModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '16px', fontWeight: 600 }}>
                    <AddIcon sx={{ color: '#6366F1' }} />
                    Pilih Dokumen untuk Deep Analysis
                </DialogTitle>
                <DialogContent dividers>
                    <Typography sx={{ fontSize: '13px', color: '#64748B', mb: 2 }}>
                        Pilih satu dokumen untuk dianasilis secara spesifik.
                        AI akan memfokuskan memori hanya pada isi dokumen ini.
                    </Typography>

                    {docsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : recentDocs.length === 0 ? (
                        <Typography sx={{ textAlign: 'center', py: 2, color: '#94A3B8', fontSize: '14px' }}>
                            Oops, Anda belum memiliki dokumen yang diproses.
                        </Typography>
                    ) : (
                        <List sx={{ p: 0 }}>
                            {recentDocs.map((doc) => (
                                <ListItemButton key={doc.id} onClick={() => handleSelectDeepScan(doc)}
                                    sx={{
                                        borderRadius: 2, mb: 1, border: '1px solid #E2E8F0',
                                        '&:hover': { borderColor: '#6366F1', bgcolor: '#EEF2FF' }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <KBIcon sx={{ fontSize: 20, color: '#64748B' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={doc.fileName}
                                        secondary={`${doc.documentType} • ${new Date(doc.scannedAt).toLocaleDateString('id-ID')}`}
                                        primaryTypographyProps={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', noWrap: true }}
                                        secondaryTypographyProps={{ fontSize: '11px' }}
                                    />
                                    <Button size="small" variant="text" sx={{ minWidth: 'auto', textTransform: 'none', fontSize: '12px', fontWeight: 600 }}>
                                        Pilih
                                    </Button>
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default AIAssistant;
