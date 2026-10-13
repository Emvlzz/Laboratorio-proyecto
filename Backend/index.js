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
server.use('/Usuarios', miMiddleware, UsuariosRoutes);
server.use('/alumnos', miMiddleware, alumnoRoutes);
server.use('/profesores', miMiddleware, profesorRoutes);
server.use('/aulas', miMiddleware, aulaRoutes);
server.use('/computadoras', miMiddleware, computadoraRoutes);
server.use('/carritos', miMiddleware, carritoRoutes);

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