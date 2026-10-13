const { Sequelize } = require('sequelize');

// Conexión directa a MySQL sin .env
const sequelize = new Sequelize('laboratorio_db', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false ,
    port: 3307
});

module.exports = sequelize;