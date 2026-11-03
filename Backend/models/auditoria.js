const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Auditoria = sequelize.define('Auditoria', {
    idAuditoria: { 
        type: DataTypes.INTEGER, 
        autoIncrement: true, 
        primaryKey: true 
    },
    descripcion: { 
        type: DataTypes.TEXT, 
        allowNull: false 
    },
    idUsuario: { 
        type: DataTypes.INTEGER, 
        allowNull: true 
    },
    estado: { 
        type: DataTypes.STRING, 
        defaultValue: 'exitoso' 
    },
    fecha: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
    },
}, { 
    tableName: 'auditorias', 
    timestamps: true 
});

module.exports = Auditoria;