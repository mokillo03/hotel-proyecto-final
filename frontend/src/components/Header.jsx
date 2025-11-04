import React from 'react';
import { useAuth } from '../context/useAuth';
import { Link as RouterLink } from 'react-router-dom';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Button, 
    Box 
} from '@mui/material';

const Header = () => {
    const { isLoggedIn, user, logout } = useAuth();
    
    // Función para obtener el texto del botón de dashboard según el rol
    const getDashboardPath = () => {
        if (!user) return '/';
        switch (user.rol) {
            case 'Administrador':
                return { path: '/admin/dashboard', label: 'Admin Dashboard' };
            case 'Operador':
                return { path: '/operator/dashboard', label: 'Operator Dashboard' };
            default:
                return { path: '/habitaciones', label: 'Ver Habitaciones' };
        }
    };

    const dashboard = getDashboardPath();

    return (
        <AppBar position="static" color="primary">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    <RouterLink to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                        Hotel App
                    </RouterLink>
                </Typography>

                <Box>
                    {isLoggedIn ? (
                        <>
                            <Button 
                                color="inherit" 
                                component={RouterLink} 
                                to={dashboard.path}
                                sx={{ mr: 2 }}
                            >
                                {dashboard.label}
                            </Button>
                            <Button color="inherit" onClick={logout}>
                                Salir ({user.nombre})
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button 
                                color="inherit" 
                                component={RouterLink} 
                                to="/habitaciones"
                                sx={{ mr: 2 }}
                            >
                                Habitaciones
                            </Button>
                            <Button 
                                color="inherit" 
                                component={RouterLink} 
                                to="/login"
                                sx={{ border: '1px solid white' }}
                            >
                                Acceder
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
