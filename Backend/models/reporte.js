// models/Reporte.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Reporte = sequelize.define('Reporte', {
    idReporte: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    descripcion: { 
        type: DataTypes.TEXT, 
        allowNull: false 
    },
    estado: { 
        type: DataTypes.STRING, 
        defaultValue: 'pendiente' 
    },

    idUsuario: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    computadoraId: {
        type: DataTypes.INTEGER,
        allowNull: true, 
        references: {
            model: 'computadoras',
            key: 'idComputadora'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
    }
}, { 
    tableName: 'reportes', 
    timestamps: true 
});

module.exports = Reporte;