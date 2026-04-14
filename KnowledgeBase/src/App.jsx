import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { getProfile } from './services/api';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Categories from './pages/Categories';
import Article from './pages/Article';
import FileExplorer from './pages/FileExplorer';
import AIAssistant from './pages/AIAssistant';
import ImpersonationBanner from './components/ImpersonationBanner';
import './index.css';

const theme = createTheme({
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  palette: {
    primary: { main: '#4F46E5', light: '#6366F1', dark: '#3730A3' },
    secondary: { main: '#0EA5E9' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 10 }
      }
    }
  }
});

// Auth Context
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(res => setUser(res.data?.data || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthContext.Provider value={{ user, setUser, loading }}>
        <BrowserRouter>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <ImpersonationBanner />
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
              <Routes>
                <Route path="/" element={user ? <Navigate to="/home" replace /> : <Landing />} />
                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/categories/:slug" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
                <Route path="/articles/:slug" element={<ProtectedRoute><Article /></ProtectedRoute>} />
                <Route path="/files" element={<ProtectedRoute><FileExplorer /></ProtectedRoute>} />
                <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </Box>
        </BrowserRouter>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}

export default App;
