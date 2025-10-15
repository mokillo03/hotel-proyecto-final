const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Consulta = sequelize.define('Consulta', {
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    asunto: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    mensaje: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    respuesta: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    estado: {
        type: DataTypes.ENUM('Abierta', 'Respondida'),
        allowNull: false,
        defaultValue: 'Abierta'
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'Consultas',
    timestamps: true,
    paranoid: true, // Para soft delete (buena práctica)
});

module.exports = Consulta;