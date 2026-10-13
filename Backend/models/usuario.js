const { DataTypes } = require('sequelize');
const  sequelize  = require('../config/db');

const Usuario = sequelize.define('Usuario', {
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
    credenciales: {
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
    computadoraId: { // <--- NUEVO: Clave foránea para la computadora asignada
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'computadoras',
            key: 'idComputadora'
        }
    }
}, {
    tableName: 'usuarios',
    timestamps: true
});

module.exports = Usuario;