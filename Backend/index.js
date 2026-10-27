const express = require("express");
const http = require('http'); 
const { Server } = require('socket.io'); 
const path = require('path');
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


const app = express(); // Cambiamos 'server' a 'app' para Express
const httpServer = http.createServer(app); // Creamos el servidor HTTP

// <-- 4. Configurar Socket.io con las mismas políticas de CORS de tu frontend
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});


app.use(express.json());

// Guardamos 'io' globalmente para usarlo en los controladores
app.set('socketio', io);

// <-- 5. Hacer pública la carpeta 'uploads' para que las fotos de perfil se puedan ver desde el navegador
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de comprobación raíz
app.get('/', (req, res) => {
    res.status(200).json({ message: 'El server funciona correctamente' });
});

// 1. Rutas públicas (Login y Registro)
app.use('/auth', authRoutes);

// 2. Rutas protegidas con el middleware de autenticación
app.use('/Usuarios', miMiddleware.verificarToken, UsuariosRoutes);
app.use('/alumnos', miMiddleware.verificarToken, alumnoRoutes);
app.use('/profesores', miMiddleware.verificarToken, profesorRoutes);
app.use('/aulas', miMiddleware.verificarToken, aulaRoutes);
app.use('/computadoras', miMiddleware.verificarToken, computadoraRoutes);
app.use('/carritos', miMiddleware.verificarToken, carritoRoutes);
app.use('/inventario', miMiddleware.verificarToken, inventarioRoutes);
app.use('/auditoria', miMiddleware.verificarToken, auditoriaRoutes);
app.use('/reportes', miMiddleware.verificarToken, ReporteRoutes);

// <-- 6. Escuchar eventos de conexión de Socket.io
io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado por WebSockets:', socket.id);
});

const PORT = 3000;

httpServer.listen(PORT, async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });
        console.log("Conexión exitosa a la Base de Datos");
        console.log(`El servidor está ON en el puerto ${PORT}`);
    } catch (error) {
        console.error("Error al iniciar el servidor o DB:", error);
    }
});