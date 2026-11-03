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

// PUT: Actualizar el perfil del usuario logueado (y su estado de PC si se envía)
router.put('/perfil', verificarToken, upload.single('fotoPerfil'), async (req, res) => {
    try {
        console.log("¡Ruta PUT /perfil alcanzada con éxito!");
        console.log("Body recibido:", req.body);
        console.log("Archivo recibido:", req.file);

        const userId = req.user.id;
        const { nombre, apellido, curso, password, estadoComputadora } = req.body;

        // Buscamos al usuario incluyendo su computadora asignada
        const usuario = await Usuario.findByPk(userId, {
            include: [{ model: Computadora, as: 'computadora' }]
        });

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

        // --- ACTUALIZAR EL ESTADO DE LA COMPUTADORA SI SE ENVÍÓ ---
        if (estadoComputadora && usuario.computadora) {
            const estadoAnterior = usuario.computadora.estado;
            usuario.computadora.estado = estadoComputadora;
            await usuario.computadora.save(); // Guarda el estado en la BD

            // Registrar en la bitácora el cambio de estado junto al perfil
            await Auditoria.create({
                descripcion: `Actualización de perfil y equipo: El usuario ${usuario.nombre} actualizó su perfil y cambió la PC "${usuario.computadora.nombre}" de [${estadoAnterior}] a [${estadoComputadora}].`,
                idUsuario: usuario.idUsuario,
                estado: 'exitoso'
            });
        } else {
            // Registro de auditoría solo para perfil
            await Auditoria.create({
                descripcion: `Actualización de perfil: El usuario ${usuario.nombre} actualizó su información personal y/o foto.`,
                idUsuario: usuario.idUsuario,
                estado: 'exitoso'
            });
        }

        // Emitir evento por WebSockets si está configurado
        const io = req.app.get('socketio');
        if (io) {
            io.emit('usuarioActualizado', {
                id: usuario.idUsuario, 
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                fotoPerfil: usuario.fotoPerfil
            });
        }

        return res.json({ 
            msg: '¡Perfil y estado actualizados con éxito!', 
            usuario: { 
                nombre: usuario.nombre, 
                apellido: usuario.apellido, 
                curso: usuario.curso,
                fotoPerfil: usuario.fotoPerfil 
            },
            computadora: usuario.computadora ? {
                idComputadora: usuario.computadora.idComputadora,
                nombre: usuario.computadora.nombre,
                estado: usuario.computadora.estado
            } : null
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

        const computadoraAnteriorId = usuario.computadoraId;

        // 1. Si tenía otra computadora antes, liberarla a 'disponible'
        if (computadoraAnteriorId && computadoraAnteriorId !== Number(computadoraId)) {
            const compuAnterior = await Computadora.findByPk(computadoraAnteriorId);
            if (compuAnterior) {
                compuAnterior.estado = 'disponible';
                await compuAnterior.save();
            }
        }

        // 2. Asignar la nueva computadora al usuario
        usuario.computadoraId = computadoraId || null;
        await usuario.save();

        // 3. CAMBIAR AUTOMÁTICAMENTE EL ESTADO DE LA PC A 'EN USO'
        if (computadoraId) {
            const nuevaCompu = await Computadora.findByPk(computadoraId);
            if (nuevaCompu) {
                nuevaCompu.estado = 'en uso';
                await nuevaCompu.save(); // <--- Esto guarda el cambio en la BD
            }
        } else if (computadoraAnteriorId) {
            const compuAnterior = await Computadora.findByPk(computadoraAnteriorId);
            if (compuAnterior) {
                compuAnterior.estado = 'disponible';
                await compuAnterior.save();
            }
        }

        // Auditoría
        await Auditoria.create({
            descripcion: `Asignación de equipo: Se asignó la computadora ID ${computadoraId || 'Ninguna'} al usuario ${usuario.nombre}.`,
            idUsuario: req.user.id || req.user.idUsuario,
            estado: 'exitoso'
        });

        res.json({ msg: 'Computadora asignada y estado actualizado con éxito', usuario });
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


// GET: Obtener la computadora asignada al usuario logueado
router.get('/mi-computadora', verificarToken, async (req, res) => {
    try {
        const userId = req.user.id; // ID extraído del token JWT

        const usuario = await Usuario.findByPk(userId, {
            include: [{
                model: Computadora,
                as: 'computadora',
                include: [{ model: Carrito, as: 'carrito' }]
            }]
        });

        if (!usuario || !usuario.computadora) {
            return res.json({ asignada: false, msg: 'No tienes ninguna computadora asignada actualmente.' });
        }

        return res.json({
            asignada: true,
            computadora: usuario.computadora
        });
    } catch (error) {
        console.error("Error al obtener computadora asignada:", error);
        return res.status(500).json({ msg: 'Error al consultar la computadora', error: error.message });
    }
});

// PUT: El usuario actualiza el estado de su PC asignada desde su perfil
router.put('/mi-computadora/estado', verificarToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { nuevoEstado } = req.body; // 'disponible', 'en uso', 'mantenimiento'

        const usuario = await Usuario.findByPk(userId, {
            include: [{ model: Computadora, as: 'computadora' }]
        });

        if (!usuario || !usuario.computadora) {
            return res.status(404).json({ msg: 'No tienes una computadora asignada para actualizar.' });
        }

        const computadora = usuario.computadora;
        const estadoAnterior = computadora.estado;
        computadora.estado = nuevoEstado;
        await computadora.save(); // <--- Guarda el cambio en la BD

        await Auditoria.create({
            descripcion: `Cambio de estado propio: El usuario ${usuario.nombre} cambió la PC "${computadora.nombre}" de [${estadoAnterior}] a [${nuevoEstado}].`,
            idUsuario: userId,
            estado: 'exitoso'
        });

        return res.json({ msg: 'Estado de la computadora actualizado con éxito', computadora });
    } catch (error) {
        console.error("Error al cambiar estado de computadora:", error);
        res.status(500).json({ msg: 'Error al actualizar estado', error: error.message });
    }
});


module.exports = router;