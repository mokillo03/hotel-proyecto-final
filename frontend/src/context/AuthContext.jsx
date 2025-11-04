import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// 1. Crear el Contexto
export const AuthContext = createContext();


// URL base de la API (usará el proxy de vite.config.js)
const API_URL = '/api/auth'; 

// 3. Proveedor del Contexto
export const AuthProvider = ({ children }) => {
    // Inicializar estado leyendo del almacenamiento local (persistir sesión)
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 4. Efecto para mantener el token en el header de Axios
    useEffect(() => {
        if (token) {
            // Configurar el header de autorización globalmente
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            // Limpiar si no hay token
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }, [token, user]);

    // 5. Funciones de Autenticación
    
    // Función de LOGIN
    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });
            const { token, user: userData } = response.data;

            setToken(token);
            setUser(userData);
            return true;
            
        } catch (err) {
            const msg = err.response?.data?.msg || "Error de conexión o credenciales inválidas.";
            setError(msg);
            setLoading(false);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Función de LOGOUT
    const logout = () => {
        setToken(null);
        setUser(null);
        // El useEffect se encargará de limpiar el localStorage
    };

    // Función de REGISTRO (Similar a login, pero usa el endpoint /register)
    const register = async (formData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/register`, { ...formData });
            const { token, user: userData } = response.data;

            // Loguear automáticamente después del registro
            setToken(token);
            setUser(userData);
            return true;
            
        } catch (err) {
            const msg = err.response?.data?.msg || "Error en el registro. Verifique el email.";
            setError(msg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    // 6. Valores que el contexto provee
    const value = {
        user,
        token,
        loading,
        error,
        isLoggedIn: !!user,
        isAdmin: user?.rol === 'Administrador',
        isOperator: user?.rol === 'Operador',
        login,
        logout,
        register,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};