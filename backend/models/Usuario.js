const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/db.config');

const Usuario = sequelize.define('Usuario' , {

    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },

    apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },

    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique:true, //debe ser unico para el login
        validate:{
            isEmail: true, //validacion de sequelize
        }
    },

    password_hash: {
        type: DataTypes.STRING(255),
        allowNull:false,
    },

    rol:{
        type: DataTypes.ENUM('Usuario','Operador','Administrador'),
        allowNull: false,
        defaultValue: 'Usuario' //por defecto es un usuario regular
    },

    telefono:{
        type: DataTypes.STRING(20),
        allowNull: true,
    }, 
},{
    //opciones del modelo
    tableName:'Usuarios',//asegura que ese el nombre de tabla que creamos
    timestamps: true, //secualize añade campos
    paranoid: true, //softdelete 
});

module.exports = Usuario;