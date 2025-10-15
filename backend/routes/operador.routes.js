const Consulta = require('../models/Consulta');
const express = require('express');
const router = express.Router();
const Habitacion = require('../models/Habitacion');
const Reserva = require('../models/Reserva');
const { verifyToken, checkRole } = require('../middlewares/authMiddlewares');

// Aplicar protección: TODAS las rutas de este archivo requieren Operador o Administrador
router.use(verifyToken, checkRole(['Administrador', 'Operador']));

// ------------------------------------------------------------------------
// FUNCIONES DE OPERADOR (Rutas /api/operator)
// ------------------------------------------------------------------------

// 1. Consultar habitaciones (MAPA) (GET /api/operator/habitaciones)
// Muestra el estado de TODAS las habitaciones (incluso Limpieza, Ocupada)
router.get('/habitaciones', async (req, res) => {
    try {
        // En un sistema real, se podría añadir filtros por estado aquí
        const habitaciones = await Habitacion.findAll({ attributes: { exclude: ['deletedAt'] } });
        res.json(habitaciones);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener el mapa de habitaciones', error });
    }
});


// 2. Consultar y liberar reservas (GET y PUT /api/operator/reservas)
// Consultar reservas
router.get('/reservas', async (req, res) => {
    try {
        // Traer todas las reservas activas (Pendientes, Confirmadas, Check-in)
        const reservas = await Reserva.findAll({
            where: { estado: ['Pendiente', 'Confirmada', 'Check-in'] },
            attributes: { exclude: ['deletedAt'] }
        });
        res.json(reservas);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener reservas', error });
    }
});

// Liberar (Check-out o Cancelar) una reserva
router.put('/reservas/:id/liberar', async (req, res) => {
    try {
        const reserva = await Reserva.findByPk(req.params.id);
        if (!reserva) {
            return res.status(404).json({ msg: 'Reserva no encontrada' });
        }
        
        // Marcar la reserva como finalizada
        await reserva.update({ estado: 'Check-out' });
        
        // Liberar la habitación (marcar como Disponible)
        await Habitacion.update({ estado: 'Disponible' }, { where: { id: reserva.habitacion_id } });

        res.json({ msg: 'Reserva finalizada y habitación liberada.' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al liberar reserva', error });
    }
});


// 3. Abrir/cerrar habitación (PUT /api/operator/habitaciones/:id/estado)
router.put('/habitaciones/:id/estado', async (req, res) => {
    try {
        const { nuevo_estado } = req.body; // Espera un JSON como { "nuevo_estado": "Cerrada" }
        
        if (!['Disponible', 'Cerrada', 'Limpieza'].includes(nuevo_estado)) {
            return res.status(400).json({ msg: 'Estado de habitación no válido.' });
        }
        
        const [updatedRows] = await Habitacion.update({ estado: nuevo_estado }, {
            where: { id: req.params.id }
        });

        if (updatedRows === 0) {
            return res.status(404).json({ msg: 'Habitación no encontrada' });
        }
        res.json({ msg: `Habitación ${req.params.id} actualizada a ${nuevo_estado}.` });
    } catch (error) {
        res.status(500).json({ msg: 'Error al cambiar estado de habitación', error });
    }
});


// 4. Responder mail (GET y PUT /api/operator/consultas)
// Consultar todas las consultas pendientes/abiertas
router.get('/consultas', async (req, res) => {
    try {
        const consultas = await Consulta.findAll({
            where: { estado: 'Abierta' }
        });
        res.json(consultas);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener consultas', error });
    }
});

// Responder una consulta
router.put('/consultas/:id/responder', async (req, res) => {
    try {
        const { respuesta } = req.body;
        
        const [updatedRows] = await Consulta.update(
            { respuesta: respuesta, estado: 'Respondida' }, 
            { where: { id: req.params.id, estado: 'Abierta' } }
        );

        if (updatedRows === 0) {
            return res.status(404).json({ msg: 'Consulta no encontrada o ya respondida.' });
        }
        res.json({ msg: 'Consulta marcada como Respondida.' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al responder consulta', error });
    }
});

module.exports = router;