const bcrypt = require('bcrypt');
const Usuario = require('../models/Usuario')
const express = require('express');
const router = express.Router();
const Habitacion = require('../models/Habitacion');
const { verifyToken, checkRole } = require('../middlewares/authMiddlewares');
// Importamos la instancia de Sequelize desde la configuración
const { sequelize } = require('../config/db.config'); // <-- ¡Necesitas esta línea!
const Reserva = require('../models/Reserva'); // <-- Y esta para el modelo
// ...

// Las rutas temporales están comentadas.

// 1. CREAR HABITACIÓN
// RUTA CORREGIDA: Incluimos la barra inicial para que se una correctamente a /api/admin
router.post('/habitaciones', verifyToken, checkRole(['Administrador']), async (req, res) => {
    try {
        const habitacion = await Habitacion.create(req.body);
        res.status(201).json(habitacion);
    } catch (error) {
        res.status(500).json({ msg: 'Error al crear la habitación', error });
    }
});


// 2. LEER TODAS LAS HABITACIONES
// RUTA CORREGIDA: /habitaciones
router.get('/habitaciones', verifyToken, checkRole(['Administrador', 'Operador']), async (req, res) => {
    try {
        const habitaciones = await Habitacion.findAll(); 
        res.json(habitaciones);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener habitaciones', error });
    }
});


// 3. LEER UNA HABITACIÓN por ID
router.get('/habitaciones/:id', verifyToken, checkRole(['Administrador','Operador']), async (req, res) => {
    try {
        const habitacion = await Habitacion.findByPk(req.params.id); 
        
        if (!habitacion) {
            return res.status(404).json({ msg: 'Habitación no encontrada' });
        }
        res.json(habitacion);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener la habitación', error });
    }
});


// 4. ACTUALIZAR HABITACIÓN
router.put('/habitaciones/:id', verifyToken, checkRole(['Administrador']), async (req, res) => {
    try {
        const [updatedRows] = await Habitacion.update(req.body, {
            where: { id: req.params.id }
        });

        if (updatedRows === 0) {
            return res.status(404).json({ msg: 'Habitación no encontrada para actualizar' });
        }
        const habitacionActualizada = await Habitacion.findByPk(req.params.id);
        res.json(habitacionActualizada);
    } catch (error) {
        res.status(500).json({ msg: 'Error al actualizar la habitación', error });
    }
});


// 5. ELIMINAR HABITACIÓN
router.delete('/habitaciones/:id', verifyToken, checkRole(['Administrador','Operador']), async (req, res) => {
    try {
        const deletedRows = await Habitacion.destroy({
            where: { id: req.params.id }
        });

        if (deletedRows === 0) {
            return res.status(404).json({ msg: 'Habitación no encontrada para eliminar' });
        }
        res.status(204).send(); 
    } catch (error) {
        res.status(500).json({ msg: 'Error al eliminar la habitación', error });
    }
});


// ------------------------------------------------------------------------
// CRUD DE OPERADORES (Solo Administrador)
// ------------------------------------------------------------------------

// 6. CREAR OPERADOR (POST /api/admin/operadores)
router.post('/operadores', verifyToken, checkRole(['Administrador']), async (req, res) => {
    try {
        const { nombre, apellido, email, password, telefono } = req.body;
        
        // 1. Verificar si el usuario ya existe
        let existingUser = await Usuario.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ msg: 'El email ya está registrado.' });
        }

        // 2. Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 3. Crear el nuevo usuario CON ROL 'Operador'
        const newOperator = await Usuario.create({
            nombre,
            apellido,
            email,
            password_hash,
            telefono,
            rol: 'Operador' // <--- ¡Aseguramos el rol!
        });

        // Omitimos la generación de token aquí, ya que el Admin lo está creando.
        res.status(201).json({ 
            id: newOperator.id, 
            nombre: newOperator.nombre, 
            rol: newOperator.rol, 
            email: newOperator.email 
        });

    } catch (error) {
        console.error('Error al crear operador:', error);
        res.status(500).json({ msg: 'Error del servidor al crear operador.' });
    }
});


// 7. LEER TODOS LOS OPERADORES (GET /api/admin/operadores)
router.get('/operadores', verifyToken, checkRole(['Administrador']), async (req, res) => {
    try {
        // FindAll con filtro para mostrar solo los Operadores
        const operadores = await Usuario.findAll({ 
            where: { rol: 'Operador' },
            attributes: { exclude: ['password_hash'] } // Excluye el hash por seguridad
        }); 
        res.json(operadores);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener operadores', error });
    }
});


// 8. ACTUALIZAR OPERADOR (PUT /api/admin/operadores/:id)
router.put('/operadores/:id', verifyToken, checkRole(['Administrador']), async (req, res) => {
    try {
        // Evitamos que el Admin se cambie a sí mismo (o a otros roles) accidentalmente
        const { rol, password, ...updateData } = req.body; 
        
        const [updatedRows] = await Usuario.update(updateData, {
            where: { id: req.params.id, rol: 'Operador' } // Solo actualizar si es Operador
        });

        if (updatedRows === 0) {
            return res.status(404).json({ msg: 'Operador no encontrado o no es un Operador válido.' });
        }
        
        const operadorActualizado = await Usuario.findByPk(req.params.id, {
            attributes: { exclude: ['password_hash'] }
        });
        res.json(operadorActualizado);
    } catch (error) {
        res.status(500).json({ msg: 'Error al actualizar operador', error });
    }
});


// 9. "ELIMINAR" OPERADOR (DELETE /api/admin/operadores/:id) - Soft Delete
router.delete('/operadores/:id', verifyToken, checkRole(['Administrador']), async (req, res) => {
    try {
        // El destroy() hará el Soft Delete gracias a 'paranoid: true'
        const deletedRows = await Usuario.destroy({
            where: { id: req.params.id, rol: 'Operador' } // Solo soft delete si es Operador
        });

        if (deletedRows === 0) {
            return res.status(404).json({ msg: 'Operador no encontrado para eliminar.' });
        }
        res.status(204).send(); 
    } catch (error) {
        res.status(500).json({ msg: 'Error al eliminar operador', error });
    }

    // /backend/routes/admin.routes.js
});
// ... (al final del archivo)

// 10. Consultas varias parametrizadas y gráficos (GET /api/admin/reportes/ventas-mensuales)
router.get('/reportes/ventas-mensuales', verifyToken, checkRole(['Administrador']), async (req, res) => {
    try {
        // Ejemplo: Agrupar el total de ventas (reservas confirmadas) por mes
        const ventasMensuales = await Reserva.findAll({
            attributes: [
                [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt')), 'mes'],
                [sequelize.fn('sum', sequelize.col('total_pagar')), 'total_ventas'],
            ],
            where: {
                estado: 'Confirmada' // Solo considerar las ventas reales
            },
            group: ['mes'],
            order: [[sequelize.literal('mes'), 'ASC']],
            raw: true
        });

        res.json(ventasMensuales);
    } catch (error) {
        console.error('Error al generar reporte:', error);
        res.status(500).json({ msg: 'Error al generar reporte de ventas', error });
    }
    
});


module.exports = router;