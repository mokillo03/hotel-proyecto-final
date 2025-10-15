// Archivo: /backend/middlewares/authMiddlewares.js

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'mokillo032012';

// ------------------------------------------------------------------------
// 1. MIDDLEWARE: VERIFICAR TOKEN (Autenticación)
// ------------------------------------------------------------------------
const verifyToken = (req, res, next) => {
    // 1. Obtener el token del header (generalmente: Authorization: Bearer <token>)
    const authHeader = req.header('Authorization');
    
    // Si no hay encabezado Authorization o no empieza con 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'Acceso denegado. No se proporcionó token.' });
    }

    // Extraer solo el token (quitando 'Bearer ')
    const token = authHeader.replace('Bearer ', '');

    try {
        // 2. Verificar el token usando la clave secreta
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 3. Adjuntar la información del usuario (id, rol) a la solicitud (req)
        // Esto permite que las rutas sepan quién está haciendo la petición
        req.usuario = decoded; 
        
        // 4. Continuar a la siguiente función (la ruta o el siguiente middleware)
        next();
        
    } catch (error) {
        // Si el token no es válido o expiró
        res.status(401).json({ msg: 'Token no válido o expirado.' });
    }
};

// ------------------------------------------------------------------------
// 2. MIDDLEWARE: VERIFICAR ROL (Autorización)
// ------------------------------------------------------------------------

/**
 * Función que genera un middleware para verificar si el usuario tiene un rol específico.
 * @param {string[]} requiredRoles - Array de roles permitidos (ej: ['Administrador', 'Operador'])
 */
const checkRole = (requiredRoles) => (req, res, next) => {
    // Se asume que verifyToken ya se ejecutó y adjuntó el rol a req.usuario
    if (!req.usuario || !req.usuario.rol) {
        return res.status(500).json({ msg: 'Error de servidor: Rol de usuario no encontrado.' });
    }
    
    const userRole = req.usuario.rol;
    
    // Comprobar si el rol del usuario está incluido en los roles requeridos
    if (requiredRoles.includes(userRole)) {
        // El usuario tiene el rol correcto, continuar
        next();
    } else {
        // El usuario no tiene el rol correcto
        res.status(403).json({ msg: 'Acceso prohibido. Permisos insuficientes.' });
    }
};


module.exports = { 
    verifyToken,
    checkRole
};