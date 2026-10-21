const express = require('express');
const router = express.Router();
const { Usuario, Computadora, Carrito, Auditoria } = require('../models');
const { verificarToken } = require('../middlewares/auth');
const bcrypt = require('bcrypt');


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

// PUT: Actualizar el perfil del usuario logueado
router.put('/perfil', verificarToken, async (req, res) => {
    try {
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

        await usuario.save();

        // --- REGISTRO EN LA BITÁCORA DE AUDITORÍA ---
        await Auditoria.create({
            descripcion: `Actualización de perfil: El usuario ${usuario.nombre} (${usuario.credenciales}) actualizó su información personal.`,
            idUsuario: usuario.idUsuario,
            estado: 'exitoso'
        });

        return res.json({ 
            msg: '¡Perfil actualizado con éxito!', 
            usuario: { 
                nombre: usuario.nombre, 
                apellido: usuario.apellido, 
                curso: usuario.curso 
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
        const { computadoraId } = req.body; // Puede ser null para desasignar

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