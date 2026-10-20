const sequelize = require('../config/db');

const Usuario = require('./Usuario');
const Carrito = require('./Carrito');
const Inventario = require('./Inventario');
const Computadora = require('./Computadora');
const Auditoria = require('./Auditoria');
const Reporte = require('./Reporte');

// Relaciones
Carrito.hasMany(Computadora, { foreignKey: 'carritoId', as: 'computadoras', onDelete: 'CASCADE' });
Computadora.belongsTo(Carrito, { foreignKey: 'carritoId', as: 'carrito' });

Computadora.hasMany(Usuario, { foreignKey: 'computadoraId', as: 'usuarios' });
Usuario.belongsTo(Computadora, { foreignKey: 'computadoraId', as: 'computadora' });

Usuario.hasMany(Auditoria, { foreignKey: 'idUsuario' });
Auditoria.belongsTo(Usuario, { foreignKey: 'idUsuario', as: 'autor' });

Computadora.hasMany(Auditoria, { foreignKey: 'computadoraId', as: 'auditorias' });
Auditoria.belongsTo(Computadora, { foreignKey: 'computadoraId', as: 'computadora' });

Usuario.hasMany(Reporte, { foreignKey: 'idUsuario' });
Reporte.belongsTo(Usuario, { foreignKey: 'idUsuario', as: 'autor' });

Computadora.hasMany(Reporte, { foreignKey: 'computadoraId', as: 'reportes' });
Reporte.belongsTo(Computadora, { foreignKey: 'computadoraId', as: 'computadora' });

module.exports = {
    sequelize,
    Usuario,
    Carrito,
    Computadora,
    Inventario,
    Auditoria,
    Reporte
};