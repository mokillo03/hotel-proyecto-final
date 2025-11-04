import React from 'react';
import { useAuth } from '../context/useAuth';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress, Alert } from '@mui/material';

// El componente ProtectedRoute recibe el rol requerido y el componente a renderizar
const ProtectedRoute = ({ children, requiredRole }) => {
    const { isLoggedIn, user, loading } = useAuth();

    if (loading) {
        // Mostrar un spinner mientras se carga el estado de autenticación
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isLoggedIn) {
        // 1. Si no está logueado, redirigir al login
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.rol !== requiredRole) {
        // 2. Si está logueado pero el rol no coincide (ej: usuario normal intenta ir a admin)
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">Acceso denegado. Permisos insuficientes para el rol: {user.rol}.</Alert>
                <Navigate to="/" replace />
            </Box>
        );
    }

    // 3. Si está logueado y el rol es correcto, renderizar el componente hijo
    return children;
};

export default ProtectedRoute;