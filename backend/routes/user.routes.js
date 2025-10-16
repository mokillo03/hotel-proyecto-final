const Consulta = require('../models/Consulta');
const express = require('express');
const router = express.Router();
const Habitacion = require('../models/Habitacion');
const Reserva = require('../models/Reserva');
const { verifyToken } = require('../middlewares/authMiddlewares'); 
//pagos

const { Preference } = require('mercadopago');
const mpClient = require('../config/mp.config');
const preferencesService = new Preference(mpClient);

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
// 2. Realizar reserva y crear preferencia de pago (POST /api/user/reservas)
router.post('/reservas', verifyToken, async (req, res) => {
    try {
        const { habitacion_id, fecha_entrada, fecha_salida, huespedes, total_pagar } = req.body;
        const usuario_id = req.usuario.id; 
        
        // 1. Crear la reserva en DB con estado 'Pendiente'
        const nuevaReserva = await Reserva.create({
            usuario_id,
            habitacion_id,
            fecha_entrada,
            fecha_salida,
            huespedes,
            total_pagar,
            metodo_pago: 'Mercado Pago',
            estado: 'Pendiente' // Se confirma después de la notificación
        });
        
        // 2. Crear la preferencia de pago en Mercado Pago
        const preference = {
            items: [
                {
                    title: `Reserva Habitación #${habitacion_id}`,
                    unit_price: Number(total_pagar),
                    quantity: 1,
                }
            ],
            // Rutas de respuesta para Mercado Pago (cambiar al dominio de despliegue)
            back_urls: {
                success: "https://tudominio.com/reserva/feedback/success", // URL de tu frontend
                failure: "https://tudominio.com/reserva/feedback/failure",
                pending: "https://tudominio.com/reserva/feedback/pending",
            },
            // IMPORTANTE: Metadatos para identificar la reserva cuando MP nos notifique
            external_reference: nuevaReserva.id.toString(), 
            auto_return: 'approved',
        };

        const mp_response = await preferencesService.create({ body: preference });
        
        // 3. Responder al frontend con el link de pago
        res.status(201).json({ 
            msg: 'Reserva pendiente. Redirigir al pago.', 
            reserva_id: nuevaReserva.id,
            init_point: mp_response.init_point // URL para redireccionar al usuario a pagar
        });

    } catch (error) {
        console.error('Error al crear preferencia de pago:', error);
        res.status(500).json({ msg: 'Error en el checkout.', error: error.message });
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

// RUTA PÚBLICA: Mercado Pago nos notifica el pago
// POST /api/user/notificaciones/mp
router.post('/notificaciones/mp', async (req, res) => {
    try {
        const { topic, id } = req.query; // MP envía los datos como query params
        
        if (topic === 'payment') {
            const payment_info = await mpClient.payment.get({ id });
            const { external_reference, status } = payment_info.body;
            const reservaId = external_reference;

            if (status === 'approved') {
                // El pago fue aprobado: ¡CONFIRMAR LA RESERVA EN DB!
                await Reserva.update(
                    { estado: 'Confirmada', metodo_pago: 'Mercado Pago Aprobado' },
                    { where: { id: reservaId } }
                );

                // Opcional: Actualizar el estado de la Habitación a 'Ocupada/Confirmada'
            } else if (status === 'rejected' || status === 'cancelled') {
                // El pago falló: Marcar reserva como Cancelada
                await Reserva.update(
                    { estado: 'Cancelada' },
                    { where: { id: reservaId } }
                );
            }
        }
        
        // Siempre debe responder 200 OK para que MP sepa que recibimos la notificación
        res.status(200).send('OK'); 

    } catch (error) {
        console.error('Error procesando notificación MP:', error);
        res.status(500).send('Error');
    }
});

module.exports = router;