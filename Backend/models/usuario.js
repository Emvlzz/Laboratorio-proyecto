const { DataTypes } = require('sequelize');
const  sequelize  = require('../config/db');

const Usuario = sequelize.define('Usuario', {
            fotoPerfil: {
        type: DataTypes.STRING,
        allowNull: true
    },
    idUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    apellido: {
        type: DataTypes.STRING,
        allowNull: true
    },
    curso: {
        type: DataTypes.STRING,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rol: {
        type: DataTypes.STRING,
        defaultValue: 'alumno'
    },
    computadoraId: { 
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'computadoras',
            key: 'idComputadora'
        },

    },

    resetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetTokenExpire: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'usuarios',
    timestamps: true
});

module.exports = Usuario;