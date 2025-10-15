const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');
const Usuario = require('./Usuario'); // Necesario para la relación
const Habitacion = require('./Habitacion'); // Necesario para la relación

const Reserva = sequelize.define('Reserva', {
    fecha_entrada: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    fecha_salida: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    huespedes: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    estado: {
        type: DataTypes.ENUM('Confirmada', 'Pendiente', 'Cancelada', 'Check-in', 'Check-out'),
        allowNull: false,
        defaultValue: 'Pendiente',
    },
    total_pagar: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    metodo_pago: {
        type: DataTypes.STRING(50),
        allowNull: false,
    }
}, {
    tableName: 'Reservas',
    timestamps: true,
    paranoid: true, // Para Soft Delete
});

// Definición de las relaciones
Reserva.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Reserva.belongsTo(Habitacion, { foreignKey: 'habitacion_id' });
Usuario.hasMany(Reserva, { foreignKey: 'usuario_id' });
Habitacion.hasMany(Reserva, { foreignKey: 'habitacion_id' });

module.exports = Reserva;