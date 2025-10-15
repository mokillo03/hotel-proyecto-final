const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors'); // Necesario para que React y Node se comuniquen
const { connectDB, sequelize } = require('./config/db.config');
const authRoutes = require ('./routes/auth.routes');
const adminRoutes = require ('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');
const opeatorRoutes = require('./routes/operador.routes');

// Importamos los modelos para que Sequelize los conozca
require('./models/Usuario'); 
require('./models/Habitacion');
require('./models/Reserva');
require('./models/Consulta');


const app = express();
const PORT = 3001; 

// Middlewares
app.use(cors()); // Permite la comunicación Frontend-Backend
app.use(express.json()); // Permite procesar cuerpos de petición JSON

// Función de conexión y sincronización
async function initializeApp() {
    await connectDB();
    
    // **SINCRONIZACIÓN DE MODELOS**
    // Esto crea o actualiza las tablas en la DB basadas en los modelos definidos.
    // Usar { alter: true } es más seguro que { force: true }
    try {
        await sequelize.sync({ alter: true }); 
        console.log('✅ Base de datos sincronizada con los modelos.');
    } catch (error) {
        console.error('❌ Error al sincronizar modelos:', error);
        process.exit(1);
    }
    
    //coneccion de rutas
    app.use('/api/auth',authRoutes);
    app.use('/api/admin',adminRoutes);
    app.use('/api/user',userRoutes);
    app.use('/api/operator',opeatorRoutes);

    // Iniciar el servidor
    app.listen(PORT, () => {
        console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    });
}

// Inicializar la aplicación
initializeApp();

// --- Definición de Rutas (Aquí vendrá la lógica de Auth, Habitaciones, etc.) ---
// Ejemplo:
// const authRoutes = require('./routes/auth.routes');
// app.use('/api/auth', authRoutes);