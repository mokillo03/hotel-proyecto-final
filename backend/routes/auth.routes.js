// Archivo: /backend/routes/auth.routes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario'); // Importamos el modelo de Usuario

// Se recomienda usar una variable de entorno para la clave secreta de JWT
const JWT_SECRET = process.env.JWT_SECRET || 'mokillo032012'; 

// --- RUTA 1: REGISTRO DE NUEVO USUARIO (POST /api/auth/register) ---
router.post('/register', async (req, res) => {
    try {
        const { nombre, apellido, email, password, telefono, rol } = req.body;

        // 1. Verificar si el usuario ya existe
        let existingUser = await Usuario.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ msg: 'El email ya está registrado.' });
        }

        // 2. Hashear la contraseña
        const salt = await bcrypt.genSalt(10); // Genera un "salt" para mayor seguridad
        const password_hash = await bcrypt.hash(password, salt);

        // 3. Crear el nuevo usuario
        const newUser = await Usuario.create({
            nombre,
            apellido,
            email,
            password_hash,
            telefono,
            // Asignamos el rol por defecto o el que se envíe (solo Admin lo enviará)
            rol: rol || 'Usuario' 
        });

        // 4. Generar Token de autenticación (JWT)
        const token = jwt.sign(
            { id: newUser.id, rol: newUser.rol },
            JWT_SECRET,
            { expiresIn: '1h' } // El token expira en 1 hora
        );

        // 5. Respuesta exitosa
        res.status(201).json({ 
            msg: 'Registro exitoso.', 
            token,
            user: { id: newUser.id, nombre: newUser.nombre, rol: newUser.rol, email: newUser.email }
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ msg: 'Error del servidor.', error: error.message });
    }
});


// --- RUTA 2: INICIO DE SESIÓN (POST /api/auth/login) ---
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar el usuario por email
        const user = await Usuario.findOne({ where: { email } });
        if (!user) {
            // No revelamos si falló el email o la contraseña por seguridad
            return res.status(400).json({ msg: 'Credenciales inválidas.' });
        }

        // 2. Comparar la contraseña ingresada con el hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Credenciales inválidas.' });
        }

        // 3. Generar Token de autenticación (JWT)
        const token = jwt.sign(
            { id: user.id, rol: user.rol },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 4. Respuesta exitosa
        res.json({ 
            msg: 'Inicio de sesión exitoso.', 
            token,
            user: { id: user.id, nombre: user.nombre, rol: user.rol, email: user.email }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ msg: 'Error del servidor.', error: error.message });
    }
});


module.exports = router;