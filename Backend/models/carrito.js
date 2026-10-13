const { DataTypes } = require('sequelize');
const  sequelize  = require('../config/db');

const Carrito = sequelize.define('Carrito', {
    idCarrito: {
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
    curso: { // Curso o aula asignado al carrito
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'carritos',
    timestamps: true
});

module.exports = Carrito;