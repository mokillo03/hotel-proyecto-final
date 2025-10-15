const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config'); 

const Habitacion = sequelize.define('Habitacion', {
    numero: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
    },
    tipo: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    precio_noche: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    estado: {
        type: DataTypes.ENUM('Disponible', 'Ocupada', 'Limpieza', 'Cerrada'),
        allowNull: false,
        defaultValue: 'Disponible'
    },
    // ... otros campos como capacidad, servicios, imagen_url
}, {
    tableName: 'Habitaciones', 
    timestamps: true,
    //soft delete
    paranoid:true,
});

module.exports = Habitacion;