const express = require('express');
const router = express.Router();
const { Usuario, Computadora, Carrito } = require('../models');

// GET: Listar usuarios incluyendo su computadora y carrito asignado
router.get('/', async (req, res) => {
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
router.put('/:id/computadora', async (req, res) => {
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

router.delete('/:id', async (req, res) => {
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