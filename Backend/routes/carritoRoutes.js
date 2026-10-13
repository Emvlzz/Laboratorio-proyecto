const express = require('express');
const router = express.Router();
// 👇 Asegúrate de importar Carrito y Computadora desde los modelos
const { Carrito, Computadora } = require('../models');

// GET: Listar todos los carritos
router.get('/', async (req, res) => {
    try {
        const carritos = await Carrito.findAll({
            include: [{ model: Computadora, as: 'computadoras' }] // Opcional, trae las compus de cada carrito
        });
        res.json(carritos);
    } catch (error) {
        console.error("Error al obtener carritos:", error);
        res.status(500).json({ msg: 'Error al obtener carritos', error: error.message });
    }
});

// POST: Crear un carrito
router.post('/', async (req, res) => {
    try {
        if (req.user && req.user.rol !== 'administrador') {
            return res.status(403).json({ msg: 'Acceso denegado. Solo administradores.' });
        }

        const { nombre, descripcion, curso } = req.body;
        const nuevoCarrito = await Carrito.create({ nombre, descripcion, curso });

        res.status(201).json({ msg: 'Carrito creado con éxito', carrito: nuevoCarrito });
    } catch (error) {
        console.error("Error al crear carrito:", error);
        res.status(500).json({ msg: 'Error al crear el carrito', error: error.message });
    }
});

// DELETE: Eliminar un carrito
router.delete('/:id', async (req, res) => {
    try {
        if (req.user && req.user.rol !== 'administrador') {
            return res.status(403).json({ msg: 'Acceso denegado.' });
        }

        const { id } = req.params;
        const carrito = await Carrito.findByPk(id);

        if (!carrito) {
            return res.status(404).json({ msg: 'Carrito no encontrado' });
        }

        await carrito.destroy();
        res.status(200).json({ msg: 'Carrito eliminado con éxito' });
    } catch (error) {
        console.error("Error al eliminar carrito:", error);
        res.status(500).json({ msg: 'Error al eliminar el carrito', error: error.message });
    }
});

module.exports = router;