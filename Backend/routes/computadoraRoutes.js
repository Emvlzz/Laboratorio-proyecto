const express = require('express');
const router = express.Router();
const computadoraController = require('../controllers/computadoraController');
const { Computadora, Carrito } = require('../models');
router.post('/', async (req, res) => {
    try {
        if (req.user && req.user.rol !== 'administrador') {
            return res.status(403).json({ msg: 'Acceso denegado.' });
        }
        const { nombre, descripcion, carritoId } = req.body;
        const nuevaComputadora = await Computadora.create({ nombre, descripcion, carritoId });
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
router.put('/:id/estado', computadoraController.actualizarEstadoComputadora);
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

        await computadora.destroy();
        res.status(200).json({ msg: 'Computadora eliminada con éxito' });
    } catch (error) {
        console.error("Error al eliminar computadora:", error);
        res.status(500).json({ msg: 'Error al eliminar la computadora', error: error.message });
    }
});
module.exports = router;