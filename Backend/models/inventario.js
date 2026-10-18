// models/Inventario.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Inventario = sequelize.define('Inventario', {
    idInventario: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    nombreItem: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    categoria: { 
        type: DataTypes.STRING, 
        defaultValue: 'General' // Ej: Periféricos, Cables, Herramientas, Componentes
    },
    cantidad: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        defaultValue: 1 
    },
    ubicacion: { 
        type: DataTypes.STRING, 
        defaultValue: 'Laboratorio' // Ej: Armario A, Estante 2, Depósito
    },
    descripcion: { 
        type: DataTypes.TEXT,
        allowNull: true
    }
}, { 
    tableName: 'inventarios', 
    timestamps: true 
});

module.exports = Inventario;

