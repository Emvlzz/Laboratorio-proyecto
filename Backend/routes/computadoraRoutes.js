const express = require('express');
const router = express.Router();
const computadoraController = require('../controllers/computadoraController');
const { Computadora, Carrito, Auditoria } = require('../models');
const { verificarToken } = require('../middlewares/auth');

router.post('/', async (req, res) => {
    try {
        if (req.user && req.user.rol !== 'administrador') {
            return res.status(403).json({ msg: 'Acceso denegado.' });
        }
        const { nombre, descripcion, carritoId } = req.body;
        const nuevaComputadora = await Computadora.create({ nombre, descripcion, carritoId });

        const idAdmin = req.user?.id || req.user?.idUsuario || null;
        await Auditoria.create({
            descripcion: `Gestión de computadoras: Se creó la computadora "${nombre}" (ID: ${nuevaComputadora.idComputadora}).`,
            idUsuario: idAdmin,
            estado: 'exitoso'
        });

        res.status(201).json({ msg: 'Computadora creada con éxito', computadora: nuevaComputadora });
    } catch (error) {
        res.status(500).json({ msg: 'Error al crear computadora', error: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const computadoras = await Computadora.findAll({
            include: [{ model: Carrito, as: 'carrito' }]
        });
        res.json(computadoras);
    } catch (error) {
        console.error("Error al obtener computadoras:", error);
        res.status(500).json({ msg: 'Error al obtener computadoras', error: error.message });
    }
});

// PUT /computadoras/:id/estado - Actualizar estado operativo por el Administrador
router.put('/:id/estado', verificarToken, async (req, res) => {
    try {
        if (req.user && req.user.rol !== 'administrador') {
            return res.status(403).json({ msg: 'Acceso denegado. Solo administradores.' });
        }

        const { id } = req.params;
        const { nuevoEstado } = req.body; // 'disponible', 'en uso', 'mantenimiento'

        const computadora = await Computadora.findByPk(id);
        if (!computadora) {
            return res.status(404).json({ msg: 'Computadora no encontrada.' });
        }

        const estadoAnterior = computadora.estado;
        computadora.estado = nuevoEstado;
        await computadora.save(); // <--- Fuerza la actualización en MySQL

        // Auditoría
        await Auditoria.create({
            descripcion: `Admin cambió estado de la PC "${computadora.nombre}" de [${estadoAnterior}] a [${nuevoEstado}].`,
            idUsuario: req.user.id || req.user.idUsuario,
            estado: 'exitoso'
        });

        return res.json({ msg: 'Estado de la computadora actualizado con éxito', computadora });
    } catch (error) {
        console.error("Error al actualizar estado de computadora:", error);
        return res.status(500).json({ msg: 'Error al actualizar el estado', error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        if (req.user && req.user.rol !== 'administrador') {
            return res.status(403).json({ msg: 'Acceso denegado. Solo los administradores pueden eliminar computadoras.' });
        }

        const { id } = req.params;
        const computadora = await Computadora.findByPk(id);

        if (!computadora) {
            return res.status(404).json({ msg: 'Computadora no encontrada' });
        }

        const nombreCompu = computadora.nombre;
        await computadora.destroy();

        const idAdmin = req.user?.id || req.user?.idUsuario || null;
        await Auditoria.create({
            descripcion: `Gestión de computadoras: Se eliminó la computadora "${nombreCompu}" (ID: ${id}).`,
            idUsuario: idAdmin,
            estado: 'exitoso'
        });

        res.status(200).json({ msg: 'Computadora eliminada con éxito' });
    } catch (error) {
        console.error("Error al eliminar computadora:", error);
        res.status(500).json({ msg: 'Error al eliminar la computadora', error: error.message });
    }
});

module.exports = router;