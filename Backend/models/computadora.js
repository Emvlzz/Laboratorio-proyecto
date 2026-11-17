const { DataTypes } = require('sequelize');
const sequelize  = require('../config/db');

const Computadora = sequelize.define('Computadora', {
    idComputadora: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: true
    },
    estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'disponible' // Valor por defecto al crear una PC
    },
    carritoId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'carritos',
            key: 'idCarrito'
        }
    }
}, {
    tableName: 'computadoras',
    timestamps: true
});

module.exports = Computadora;