require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres', // Especifica el dialecto
        logging: false // Deshabilita el logging de SQL en consola
    }
);

async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL establecida correctamente.');
        // Opcional: sincronizar modelos (crea las tablas si no existen)
        // await sequelize.sync({ force: false }); 
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos:', error);
        process.exit(1); // Sale si la conexión falla
    }
}

module.exports = { sequelize, connectDB };