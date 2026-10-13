const sequelize = require('../config/db');


const Usuario = require('./Usuario');
const Carrito = require('./Carrito');
const Inventario = require('./Inventario');


const Computadora = require('./Computadora');
const Reporte = require('./Reporte');
const Auditoria = require('./Auditoria');

// --- ASOCIACIONES ---
Carrito.hasMany(Computadora, { foreignKey: 'carritoId', as: 'computadoras', onDelete: 'CASCADE' });
Computadora.belongsTo(Carrito, { foreignKey: 'carritoId', as: 'carrito' });

Computadora.hasMany(Usuario, { foreignKey: 'computadoraId', as: 'usuarios' });
Usuario.belongsTo(Computadora, { foreignKey: 'computadoraId', as: 'computadora' });

Usuario.hasMany(Reporte, { foreignKey: 'idUsuario' });
Reporte.belongsTo(Usuario, { foreignKey: 'idUsuario', as: 'autor' });

Usuario.hasMany(Auditoria, { foreignKey: 'idUsuario' });
Auditoria.belongsTo(Usuario, { foreignKey: 'idUsuario' });

module.exports = {
    sequelize,
    Usuario,
    Carrito,
    Computadora,
    Inventario,
    Reporte,
    Auditoria
};