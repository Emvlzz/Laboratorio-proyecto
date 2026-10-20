const express = require("express");
const sequelize = require('./config/db');
const miMiddleware = require('./middlewares/auth');

// Importación de rutas
const authRoutes = require('./routes/authRoutes');
const UsuariosRoutes = require('./routes/UsuariosRoutes.js');
const alumnoRoutes = require('./routes/alumnoRoutes');
const profesorRoutes = require('./routes/profesorRoutes');
const aulaRoutes = require('./routes/aulaRoutes');
const computadoraRoutes = require('./routes/computadoraRoutes');
const carritoRoutes = require('./routes/carritoRoutes');
const inventarioRoutes = require('./routes/inventarioRoutes');
const auditoriaRoutes = require('./routes/auditoriaRoutes.js');
const ReporteRoutes = require('./routes/reporteRoutes.js');

const server = express();
server.use(express.json());


server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Ruta de comprobación raíz
server.get('/', (req, res) => {
    res.status(200).json({ message: 'El server funciona correctamente' });
});

// 1. Rutas públicas (Login y Registro)
server.use('/auth', authRoutes);

// 2. Rutas protegidas con el middleware de autenticación
server.use('/Usuarios', miMiddleware.verificarToken, UsuariosRoutes);
server.use('/alumnos', miMiddleware.verificarToken, alumnoRoutes);
server.use('/profesores', miMiddleware.verificarToken, profesorRoutes);
server.use('/aulas', miMiddleware.verificarToken, aulaRoutes);
server.use('/computadoras', miMiddleware.verificarToken, computadoraRoutes);
server.use('/carritos', miMiddleware.verificarToken, carritoRoutes);
server.use('/inventario',miMiddleware.verificarToken, inventarioRoutes);
server.use('/auditoria',miMiddleware.verificarToken, auditoriaRoutes);
server.use('/reportes', miMiddleware.verificarToken, ReporteRoutes);

const PORT = 3000;

server.listen(PORT, async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        console.log("Conexión exitosa a la Base de Datos");
        console.log(`El servidor está ON en el puerto ${PORT}`);
    } catch (error) {
        console.error("Error al iniciar el servidor o DB:", error);
    }
});