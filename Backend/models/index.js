const sequelize = require('../config/db');

const Usuario = require('./Usuario');
const Carrito = require('./Carrito');
const Inventario = require('./Inventario');
const Computadora = require('./Computadora');
const Reporte = require('./Reporte');



// Carrito <-> Computadora
Carrito.hasMany(Computadora, { foreignKey: 'carritoId', as: 'computadoras', onDelete: 'CASCADE' });
Computadora.belongsTo(Carrito, { foreignKey: 'carritoId', as: 'carrito' });

// Computadora <-> Usuario
Computadora.hasMany(Usuario, { foreignKey: 'computadoraId', as: 'usuarios' });
Usuario.belongsTo(Computadora, { foreignKey: 'computadoraId', as: 'computadora' });

// Usuario <-> Reporte
Usuario.hasMany(Reporte, { foreignKey: 'idUsuario' });
Reporte.belongsTo(Usuario, { foreignKey: 'idUsuario', as: 'autor' });

// Computadora <-> Reporte
Computadora.hasMany(Reporte, { foreignKey: 'computadoraId', as: 'reportes' });
Reporte.belongsTo(Computadora, { foreignKey: 'computadoraId', as: 'computadora' });



module.exports = {
    sequelize,
    Usuario,
    Carrito,
    Computadora,
    Inventario,
    Reporte
};

