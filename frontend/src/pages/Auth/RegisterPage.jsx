import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
    Container, 
    Box, 
    Typography, 
    TextField, 
    Button, 
    CircularProgress, 
    Alert 
} from '@mui/material';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        telefono: '',
    });
    const navigate = useNavigate();
    const { register, loading, error, user } = useAuth();

    // Redirigir si el usuario ya está logueado
    if (user) {
        navigate('/', { replace: true });
        return null;
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await register(formData);
        
        if (success) {
            // El AuthContext ya loguea al usuario, solo redirigimos al home
            navigate('/');
        }
    };

    return (
        <Container component="main" maxWidth="sm" sx={{ mt: 6 }}>
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
                <Typography component="h1" variant="h4" gutterBottom>
                    Crear Cuenta
                </Typography>
                
                {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal" required fullWidth
                        label="Nombre" name="nombre" value={formData.nombre}
                        onChange={handleChange} autoFocus
                    />
                    <TextField
                        margin="normal" required fullWidth
                        label="Apellido" name="apellido" value={formData.apellido}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal" required fullWidth
                        label="Correo Electrónico" name="email" type="email"
                        value={formData.email} onChange={handleChange}
                    />
                    <TextField
                        margin="normal" required fullWidth
                        label="Contraseña" name="password" type="password"
                        value={formData.password} onChange={handleChange}
                    />
                    <TextField
                        margin="normal" fullWidth
                        label="Teléfono (Opcional)" name="telefono"
                        value={formData.telefono} onChange={handleChange}
                    />
                    
                    <Button
                        type="submit" fullWidth
                        variant="contained" color="secondary"
                        sx={{ mt: 3, mb: 2, height: 50 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrarse'}
                    </Button>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                         <RouterLink to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
                            ¿Ya tienes cuenta? Inicia Sesión
                        </RouterLink>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
};

export default RegisterPage;
