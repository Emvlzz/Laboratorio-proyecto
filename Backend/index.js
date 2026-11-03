const express = require("express");
const http = require('http'); 
const { Server } = require('socket.io'); 
const path = require('path');
const cors = require('cors'); // <-- Importamos cors para manejarlo limpiamente
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

const app = express();
const httpServer = http.createServer(app);

// 1. Definimos los únicos orígenes permitidos (localhost y tu IP de red local)
const allowedOrigins = [
    'http://localhost:5173',
    'http://192.168.1.4:5173',
    'http://181.80.139.118:5173'
];

// 2. Configurar Socket.io limitando los orígenes a la lista blanca
const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
    }
});

app.use(express.json());

// Guardamos 'io' globalmente para usarlo en los controladores
app.set('socketio', io);

// Hacer pública la carpeta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Middleware de CORS estricto para Express usando la lista blanca
app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Si el origen de la petición está en nuestra lista permitida, lo autorizamos
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

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

// Escuchar eventos de conexión de Socket.io
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