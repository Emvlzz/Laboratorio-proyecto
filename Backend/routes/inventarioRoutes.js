const express = require('express');
const router = express.Router();
const { Inventario } = require('../models');
const registrarBitacora = require('../utils/logger');

const auth = require('../middlewares/auth');
const verificarToken = auth.verificarToken;
const esAdmin = auth.esAdmin;

// Verificación de seguridad para evitar que crashee si falta exportar algo
if (typeof verificarToken !== 'function' || typeof esAdmin !== 'function') {
    console.error("⚠️ CUIDADO: 'verificarToken' o 'esAdmin' no son funciones válidas. Revisa 'middlewares/auth.js'");
}

// GET /inventario - Obtener todos los artículos
router.get('/', verificarToken, esAdmin, async (req, res) => {
    try {
        const items = await Inventario.findAll({ order: [['createdAt', 'DESC']] });
        return res.json(items);
    } catch (error) {
        console.error("Error al obtener inventario:", error);
        return res.status(500).json({ msg: 'Error al obtener inventario', error: error.message });
    }
});

// POST /inventario - Registrar nuevo artículo
router.post('/', verificarToken, esAdmin, async (req, res) => {
    try {
        const { nombreItem, categoria, cantidad, ubicacion, descripcion } = req.body;
        const idAdmin = req.user?.idUsuario || req.user?.id || null;

        if (!nombreItem || cantidad === undefined) {
            return res.status(400).json({ msg: 'El nombre y la cantidad son obligatorios.' });
        }

        const nuevoItem = await Inventario.create({
            nombreItem,
            categoria: categoria || 'General',
            cantidad: parseInt(cantidad, 10),
            ubicacion: ubicacion || 'Laboratorio',
            descripcion: descripcion || ''
        });

        await registrarBitacora(
            idAdmin,
            'REGISTRO_INVENTARIO',
            `Se registró en el inventario el artículo: "${nombreItem}" (Cantidad: ${cantidad})`
        );

        return res.status(201).json({ msg: 'Artículo registrado con éxito', item: nuevoItem });
    } catch (error) {
        console.error("Error al registrar en inventario:", error);
        return res.status(500).json({ msg: 'Error al registrar en inventario', error: error.message });
    }
});

// DELETE /inventario/:id - Eliminar artículo
router.delete('/:id', verificarToken, esAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const idAdmin = req.user?.idUsuario || req.user?.id || null;

        const item = await Inventario.findByPk(id);
        if (!item) return res.status(404).json({ msg: 'Artículo no encontrado' });

        const nombreGuardado = item.nombreItem;
        await item.destroy();

        await registrarBitacora(
            idAdmin,
            'ELIMINAR_INVENTARIO',
            `Se eliminó del inventario el artículo ID ${id} ("${nombreGuardado}")`
        );

        return res.json({ msg: 'Artículo eliminado del inventario' });
    } catch (error) {
        console.error("Error al eliminar del inventario:", error);
        return res.status(500).json({ msg: 'Error al eliminar artículo', error: error.message });
    }
});

module.exports = router;