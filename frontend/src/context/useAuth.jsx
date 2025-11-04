import { useContext } from 'react';
import { AuthContext } from './AuthContext.jsx'; // Importa el contexto real

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
    // Si usas TypeScript, aquí iría el tipado, pero en JS puro funciona así:
    return useContext(AuthContext); 
};