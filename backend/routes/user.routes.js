const Consulta = require('../models/Consulta');
const express = require('express');
const router = express.Router();
const Habitacion = require('../models/Habitacion');
const Reserva = require('../models/Reserva');
const { verifyToken } = require('../middlewares/authMiddlewares'); 

// ------------------------------------------------------------------------
// A. RUTAS PÚBLICAS (No requieren token)
// ------------------------------------------------------------------------

// 1. Ver habitaciones y servicios (GET /api/user/habitaciones)
// El usuario puede ver todas las habitaciones disponibles
router.get('/habitaciones', async (req, res) => {
    try {
        // Excluir habitaciones cerradas y las que están lógicamente eliminadas
        const habitaciones = await Habitacion.findAll({
            where: { 
                estado: 'Disponible' 
            },
            attributes: { exclude: ['deletedAt'] }
        });
        res.json(habitaciones);
    } catch (error) {
        res.status(500).json({ msg: 'Error al obtener habitaciones', error });
    }
});


// ------------------------------------------------------------------------
// B. RUTAS PROTEGIDAS (Requieren verifyToken)
// ------------------------------------------------------------------------

// 2. Realizar reserva (POST /api/user/reservas)
router.post('/reservas', verifyToken, async (req, res) => {
    try {
        const { habitacion_id, fecha_entrada, fecha_salida, huespedes, total_pagar, metodo_pago } = req.body;
        
        // El ID del usuario que hace la reserva viene del token
        const usuario_id = req.usuario.id; 
        
        // Lógica de validación (simplificada): 
        // En un sistema real, aquí iría una validación compleja de cruce de fechas 
        // y disponibilidad, pero por ahora solo verificamos el ID.
        
        const nuevaReserva = await Reserva.create({
            usuario_id,
            habitacion_id,
            fecha_entrada,
            fecha_salida,
            huespedes,
            total_pagar,
            metodo_pago,
            estado: 'Pendiente' // Se confirma/paga después
        });

        // Actualizar estado de la habitación (Asumimos que la habitación se marca Ocupada por la reserva)
        await Habitacion.update({ estado: 'Ocupada' }, { where: { id: habitacion_id } });

        res.status(201).json({ msg: 'Reserva creada exitosamente', reserva: nuevaReserva });

    } catch (error) {
        console.error('Error al realizar reserva:', error);
        res.status(500).json({ msg: 'Error del servidor al crear reserva.', error });
    }
});


// 3. Consultas por mail (POST /api/user/consultas) - No requiere token, es pública
// Se asume que usa un formulario simple
router.post('/consultas', async (req, res) => {
    try {
        const { email, asunto, mensaje } = req.body;
        // En un proyecto real, aquí usarías un servicio como Nodemailer para enviar el mail.
        
        // Por ahora, solo guardamos la consulta en la DB
        const nuevaConsulta = await Consulta.create({ // Accedemos directamente al modelo
            email,
            asunto,
            mensaje,
            estado: 'Abierta'
        });

        res.status(201).json({ msg: 'Consulta enviada con éxito.', id: nuevaConsulta.id });

    } catch (error) {
        res.status(500).json({ msg: 'Error al enviar consulta', error });
    }
});

module.exports = router;