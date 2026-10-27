const express = require('express');
const router = express.Router();
const { Usuario, Computadora, Carrito, Auditoria } = require('../models');
const { verificarToken } = require('../middlewares/auth');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

// Configuración de Multer para la subida de fotos de perfil
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Carpeta uploads en el backend
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// IMPORTANTE: Deben ir antes de las rutas con parámetros (:id)

// GET: Obtener el perfil del usuario logueado
router.get('/perfil', verificarToken, async (req, res) => {
    try {
        const userId = req.user.id; // Obtenido del token JWT
        const usuario = await Usuario.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });
        
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        
        return res.json(usuario);
    } catch (error) {
        console.error("Error al obtener perfil:", error);
        return res.status(500).json({ msg: 'Error al obtener el perfil', error: error.message });
    }
});

// PUT: Actualizar el perfil del usuario logueado (Única ruta activa y correcta)
router.put('/perfil', verificarToken, upload.single('fotoPerfil'), async (req, res) => {
    try {
        console.log("¡Ruta PUT /perfil alcanzada con éxito!");
        console.log("Body recibido:", req.body);
        console.log("Archivo recibido:", req.file);

        const userId = req.user.id;
        const { nombre, apellido, curso, password } = req.body;

        const usuario = await Usuario.findByPk(userId);
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        usuario.nombre = nombre || usuario.nombre;
        usuario.apellido = apellido !== undefined ? apellido : usuario.apellido;
        usuario.curso = curso !== undefined ? curso : usuario.curso;

        // Si envía una contraseña nueva, la encriptamos
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            usuario.password = await bcrypt.hash(password, salt);
        }

        // Si se subió una nueva foto de perfil, guardamos la ruta relativa
        if (req.file) {
            usuario.fotoPerfil = `uploads/${req.file.filename}`;
        }

        await usuario.save();

        // Emitir evento por WebSockets para actualizar la foto y datos en tiempo real
        const io = req.app.get('socketio');
        if (io) {
            io.emit('usuarioActualizado', {
                id: usuario.idUsuario, 
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                fotoPerfil: usuario.fotoPerfil
            });
        }

        // --- REGISTRO EN LA BITÁCORA DE AUDITORÍA ---
        await Auditoria.create({
            descripcion: `Actualización de perfil: El usuario ${usuario.nombre} actualizó su información personal y/o foto.`,
            idUsuario: usuario.idUsuario,
            estado: 'exitoso'
        });

        return res.json({ 
            msg: '¡Perfil actualizado con éxito!', 
            usuario: { 
                nombre: usuario.nombre, 
                apellido: usuario.apellido, 
                curso: usuario.curso,
                fotoPerfil: usuario.fotoPerfil 
            } 
        });
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        return res.status(500).json({ msg: 'Error al actualizar el perfil', error: error.message });
    }
});

// GET: Listar usuarios incluyendo su computadora y carrito asignado
router.get('/', verificarToken, async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            include: [{
                model: Computadora,
                as: 'computadora',
                include: [{ model: Carrito, as: 'carrito' }]
            }]
        });
        res.json(usuarios);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ msg: 'Error al obtener usuarios', error: error.message });
    }
});

// PUT: Asignar o actualizar computadora a un usuario (Solo Administrador)
router.put('/:id/computadora', verificarToken, async (req, res) => {
    try {
        if (req.user && req.user.rol !== 'administrador') {
            return res.status(403).json({ msg: 'Acceso denegado. Solo administradores.' });
        }

        const { id } = req.params;
        const { computadoraId } = req.body; 

        const usuario = await Usuario.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        usuario.computadoraId = computadoraId || null;
        await usuario.save();

        res.json({ msg: 'Computadora asignada con éxito al usuario', usuario });
    } catch (error) {
        console.error("Error al asignar computadora:", error);
        res.status(500).json({ msg: 'Error al asignar computadora', error: error.message });
    }
});

// DELETE: Eliminar usuario (Solo Administrador)
router.delete('/:id', verificarToken, async (req, res) => {
    try {
        if (req.user && req.user.rol !== 'administrador') {
            return res.status(403).json({ msg: 'Acceso denegado.' });
        }
        const { id } = req.params;
        const usuario = await Usuario.findByPk(id);
        if (!usuario) return res.status(404).json({ msg: 'Usuario no encontrado' });
        await usuario.destroy();
        res.status(200).json({ msg: 'Usuario eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ msg: 'Error al eliminar usuario', error: error.message });
    }
});

module.exports = router;