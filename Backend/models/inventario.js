// models/Inventario.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Inventario = sequelize.define('Inventario', {
    idItem: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombreItem: { type: DataTypes.STRING, allowNull: false },
    cantidadDisponible: { type: DataTypes.INTEGER, defaultValue: 0 },
    stockMinimo: { type: DataTypes.INTEGER, defaultValue: 5 }
}, { tableName: 'inventarios', timestamps: true });

module.exports = Inventario;