// src/App.jsx
import React from 'react';
import { CssBaseline, AppBar, Toolbar, Typography, Box } from '@mui/material';
import HomePage from './pages/Home'; // Sesuaikan path

function App() {
  return (
    <>
      <CssBaseline />
      <AppBar position="static" className="bg-slate-700"> {/* Contoh styling AppBar dengan Tailwind */}
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Aplikasi OCR Invoice
          </Typography>
        </Toolbar>
      </AppBar>
      <HomePage />
      <Box component="footer" sx={{ bgcolor: 'background.paper', p: 6 }} className="mt-auto text-center">
         <Typography variant="body2" color="text.secondary">
             © {new Date().getFullYear()} POC OCR Invoice App.
         </Typography>
      </Box>
    </>
  );
}

export default App;