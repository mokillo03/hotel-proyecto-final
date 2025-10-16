// /backend/config/mp.config.js

require('dotenv').config();
const { MercadoPagoConfig } = require('mercadopago');

// Creamos la instancia del cliente con tu Access Token
const mpClient = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN, // Variable del .env
});

// Exportamos SOLAMENTE el cliente principal
module.exports = mpClient;