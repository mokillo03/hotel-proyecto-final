import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/useAuth.jsx'; 
import { useNavigate, Link } from 'react-router-dom';
import { 
    Container, 
    Box, 
    Typography, 
    TextField, 
    Button, 
    CircularProgress, 
    Alert 
} from '@mui/material';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    
    // Obtener las funciones y estados del contexto
    const { login, loading, error, user } = useAuth(); 
    
    // 1. MANEJO DE REDIRECCIÓN EN EFECTO (MÁS SEGURO)
    useEffect(() => {
        if (user) {
            // Redirigir basado en el rol
            let path = '/';
            if (user.rol === 'Administrador') {
                path = '/admin/dashboard';
            } else if (user.rol === 'Operador') {
                path = '/operator/dashboard';
            }
            // Navegamos al path correcto
            navigate(path, { replace: true });
        }
    }, [user, navigate]); // Depende de 'user' y 'navigate'

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Solo llamamos al login; el useEffect superior maneja la redirección al cambiar 'user'.
        await login(email, password); 
    };

    // 2. RENDERIZADO SEGURO: Si el usuario ya está logueado o está cargando, NO renderizar el formulario.
    if (user || loading) {
        // Retornamos un spinner simple mientras se carga la redirección
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    // 3. Renderizar el formulario SÓLO si el usuario NO está logueado.
    return (
        <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 4,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 3
                }}
            >
                {/* ... (Contenido del formulario sigue aquí) ... */}
                <Typography component="h1" variant="h4" gutterBottom>
                    Iniciar Sesión
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" mb={3}>
                    Hotel Management
                </Typography>
                
                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Correo Electrónico"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Contraseña"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, height: 50 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Acceder'}
                    </Button>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                         <Link to="/register" style={{ textDecoration: 'none', color: '#1976d2' }}>
                            ¿No tienes cuenta? Regístrate aquí
                        </Link>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
};

export default LoginPage;