const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Aula = sequelize.define('Aula', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    anio: { type: DataTypes.STRING, allowNull: false },
    division: { type: DataTypes.STRING }
}, { tableName: 'aulas', timestamps: true });

module.exports = Aula;