import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';

// Componentes y lógica del proyecto
import App from './App.jsx';
import theme from './theme.js';
import { AuthProvider } from './context/AuthContext.jsx'; 
import './index.css';

// 1. Obtener el contenedor principal (el div#root)
const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element.');

// 2. Crear la raíz de React
const root = createRoot(container);

// 3. Renderizar la aplicación, envolviendo los providers en el orden correcto
root.render(
  <StrictMode>
    <BrowserRouter> {/* 1. Maneja la navegación URL */}
      <AuthProvider> {/* 2. Maneja el estado global de usuario (Login/Rol) */}
        <ThemeProvider theme={theme}> {/* 3. Aplica los estilos de Material UI */}
          <App />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);