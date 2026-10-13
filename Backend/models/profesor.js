const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Profesor = sequelize.define('Profesor', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
}, { tableName: 'profesores', timestamps: true });

module.exports = Profesor;