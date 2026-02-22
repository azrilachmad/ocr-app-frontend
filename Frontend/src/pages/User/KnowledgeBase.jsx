import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Paper, List, ListItem, ListItemButton, ListItemText,
    TextField, IconButton, CircularProgress, Divider, Avatar, Tooltip
} from '@mui/material';
import { Send as SendIcon, Add as AddIcon, Delete as DeleteIcon, Person as PersonIcon } from '@mui/icons-material';
import { SmartToy as BotIcon } from '@mui/icons-material';
import chatService from '../../services/chatService';

const KnowledgeBase = () => {
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Load Sessions on Mount
    useEffect(() => {
        loadSessions();
    }, []);

    // Load Messages when Active Session changes
    useEffect(() => {
        if (activeSession) {
            loadMessages(activeSession.id);
        } else {
            setMessages([]);
        }
    }, [activeSession]);

    // Scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const loadSessions = async () => {
        try {
            const res = await chatService.getSessions();
            if (res.success) {
                setSessions(res.data);
                if (res.data.length > 0 && !activeSession) {
                    setActiveSession(res.data[0]);
                }
            }
        } catch (error) {
            console.error('Failed to load sessions:', error);
        }
    };

    const loadMessages = async (sessionId) => {
        try {
            const res = await chatService.getSessionMessages(sessionId);
            if (res.success) {
                setMessages(res.data);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const handleCreateSession = async () => {
        try {
            const res = await chatService.createSession();
            if (res.success) {
                setSessions([res.data, ...sessions]);
                setActiveSession(res.data);
            }
        } catch (error) {
            console.error('Failed to create session:', error);
        }
    };

    const handleDeleteSession = async (e, sessionId) => {
        e.stopPropagation(); // prevent selecting the session
        try {
            await chatService.deleteSession(sessionId);
            setSessions(sessions.filter(s => s.id !== sessionId));
            if (activeSession?.id === sessionId) {
                setActiveSession(null);
            }
        } catch (error) {
            console.error('Failed to delete session:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        let currentSessionId = activeSession?.id;

        // If no active session, create one first
        if (!currentSessionId) {
            try {
                const res = await chatService.createSession();
                if (res.success) {
                    currentSessionId = res.data.id;
                    setSessions([res.data, ...sessions]);
                    setActiveSession(res.data);
                } else {
                    return;
                }
            } catch (error) {
                console.error('Error creating initial session:', error);
                return;
            }
        }

        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: inputValue,
            createdAt: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const res = await chatService.sendMessage(currentSessionId, userMessage.content);
            if (res.success) {
                setMessages(prev => [...prev, res.data.assistantMessage]);
                // Refresh sessions to get updated title
                loadSessions();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => [...prev, {
                id: Date.now(),
                role: 'system',
                content: 'Sorry, I encountered an error processing your request. Please try again.',
                createdAt: new Date().toISOString()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 120px)', gap: 3, pt: 3 }}>

            {/* Sidebar (History) */}
            <Paper sx={{ width: 280, display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600 }}>Chat History</Typography>
                    <Tooltip title="New Chat">
                        <IconButton onClick={handleCreateSession} size="small" sx={{ bgcolor: '#F3F4F6' }}>
                            <AddIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
                <List sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
                    {sessions.map((session) => (
                        <ListItem key={session.id} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                selected={activeSession?.id === session.id}
                                onClick={() => setActiveSession(session)}
                                sx={{ borderRadius: 2, '&.Mui-selected': { bgcolor: '#EEF2FF' } }}
                            >
                                <ListItemText
                                    primary={session.title}
                                    primaryTypographyProps={{ noWrap: true, fontSize: '14px', fontWeight: activeSession?.id === session.id ? 600 : 400 }}
                                />
                                <IconButton
                                    size="small"
                                    onClick={(e) => handleDeleteSession(e, session.id)}
                                    sx={{ opacity: 0.5, '&:hover': { opacity: 1, color: '#DC2626' } }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </ListItemButton>
                        </ListItem>
                    ))}
                    {sessions.length === 0 && (
                        <Typography sx={{ p: 2, textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
                            No active chats
                        </Typography>
                    )}
                </List>
            </Paper>

            {/* Chat Area */}
            <Paper sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', borderRadius: 3, overflow: 'hidden' }}>

                {/* Messages View */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, bgcolor: '#F9FAFB' }}>
                    {messages.length === 0 && !isLoading && (
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                            <BotIcon sx={{ fontSize: 64, color: '#6366F1', mb: 2 }} />
                            <Typography variant="h6">How can I help you today?</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>Ask me anything about your scanned documents.</Typography>
                        </Box>
                    )}

                    {messages.map((msg) => (
                        <Box key={msg.id} sx={{
                            display: 'flex',
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            mb: 3
                        }}>
                            {msg.role !== 'user' && (
                                <Avatar sx={{ bgcolor: '#6366F1', mr: 2, width: 36, height: 36 }}>
                                    <BotIcon fontSize="small" />
                                </Avatar>
                            )}
                            <Box sx={{
                                maxWidth: '75%',
                                bgcolor: msg.role === 'user' ? '#6366F1' : 'white',
                                color: msg.role === 'user' ? 'white' : '#1F2937',
                                p: 2,
                                borderRadius: msg.role === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                whiteSpace: 'pre-wrap',
                                border: msg.role !== 'user' ? '1px solid #E5E7EB' : 'none'
                            }}>
                                <Typography sx={{ fontSize: '15px', lineHeight: 1.5 }}>{msg.content}</Typography>
                            </Box>
                            {msg.role === 'user' && (
                                <Avatar sx={{ bgcolor: '#9CA3AF', ml: 2, width: 36, height: 36 }}>
                                    <PersonIcon fontSize="small" />
                                </Avatar>
                            )}
                        </Box>
                    ))}

                    {/* Typing indicator */}
                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}>
                            <Avatar sx={{ bgcolor: '#6366F1', mr: 2, width: 36, height: 36 }}>
                                <BotIcon fontSize="small" />
                            </Avatar>
                            <Box sx={{
                                bgcolor: 'white', p: 2, borderRadius: '20px 20px 20px 0',
                                border: '1px solid #E5E7EB', display: 'flex', gap: 1, alignItems: 'center'
                            }}>
                                <CircularProgress size={16} thickness={5} />
                                <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>Thinking...</Typography>
                            </Box>
                        </Box>
                    )}
                    <div ref={messagesEndRef} />
                </Box>

                <Divider />

                {/* Input Area */}
                <Box sx={{ p: 2, bgcolor: 'white' }}>
                    <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        placeholder="Type your message... (Shift+Enter for newline)"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        InputProps={{
                            endAdornment: (
                                <IconButton
                                    color="primary"
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isLoading}
                                >
                                    <SendIcon />
                                </IconButton>
                            ),
                            sx: { borderRadius: 3, bgcolor: '#F9FAFB' }
                        }}
                    />
                </Box>
            </Paper>
        </Box>
    );
};

export default KnowledgeBase;
