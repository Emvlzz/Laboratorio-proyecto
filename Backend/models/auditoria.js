// models/Auditoria.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Auditoria = sequelize.define('Auditoria', {
    idRegistro: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    accion: { type: DataTypes.STRING, allowNull: false },
    fechaHora: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'auditorias', timestamps: true });

module.exports = Auditoria;