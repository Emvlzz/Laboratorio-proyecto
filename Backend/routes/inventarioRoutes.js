const express = require('express');
const router = express.Router();
const { Inventario, Auditoria } = require('../models');

const auth = require('../middlewares/auth');
const verificarToken = auth.verificarToken;
const esAdmin = auth.esAdmin;



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

        await Auditoria.create({
            descripcion: `Gestión de inventario: Se registró el artículo "${nombreItem}" (Cantidad: ${cantidad}, Categoría: ${categoria || 'General'}).`,
            idUsuario: idAdmin,
            estado: 'exitoso'
        });

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

        await Auditoria.create({
            descripcion: `Gestión de inventario: Se eliminó el artículo "${nombreGuardado}" (ID: ${id}).`,
            idUsuario: idAdmin,
            estado: 'exitoso'
        });

        return res.json({ msg: 'Artículo eliminado del inventario' });
    } catch (error) {
        console.error("Error al eliminar del inventario:", error);
        return res.status(500).json({ msg: 'Error al eliminar artículo', error: error.message });
    }
});
// POST /inventario/:id/movimiento - Aumentar o bajar stock (CU013)
router.post('/:id/movimiento', verificarToken, esAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { tipoMovimiento, cantidad, motivo } = req.body; // tipoMovimiento: 'entrada' o 'salida'
        const idAdmin = req.user?.idUsuario || req.user?.id || null;

        const item = await Inventario.findByPk(id);
        if (!item) {
            return res.status(404).json({ msg: 'Artículo no encontrado en el inventario.' });
        }

        const cantNum = parseInt(cantidad, 10);
        if (isNaN(cantNum) || cantNum <= 0) {
            return res.status(400).json({ msg: 'La cantidad debe ser un número mayor a 0.' });
        }

        let stockActual = item.cantidad;

        if (tipoMovimiento === 'entrada') {
            stockActual += cantNum;
        } else if (tipoMovimiento === 'salida') {
            if (stockActual < cantNum) {
                return res.status(400).json({ msg: 'Stock insuficiente para realizar la salida.' }); // Flujo F1 de la documentación[cite: 30]
            }
            stockActual -= cantNum;
        } else {
            return res.status(400).json({ msg: 'Tipo de movimiento inválido (debe ser "entrada" o "salida").' });
        }

        // Actualizar stock
        item.cantidad = stockActual;
        await item.save();

        // --- REGISTRO EN LA BITÁCORA DE AUDITORÍA ---
        await Auditoria.create({
            descripcion: `Movimiento de inventario (CU013): Se registró una ${tipoMovimiento} de ${cantNum} unidad(es) en el artículo "${item.nombreItem}". Motivo: ${motivo || 'Ajuste manual'}. Stock resultante: ${stockActual}.`,
            idUsuario: idAdmin,
            estado: 'exitoso'
        });

        return res.json({ 
            msg: `Stock actualizado correctamente (${tipoMovimiento} de ${cantNum})`, 
            item 
        });
    } catch (error) {
        console.error("Error al registrar movimiento de inventario:", error);
        return res.status(500).json({ msg: 'Error al procesar el movimiento de stock', error: error.message });
    }
});
module.exports = router;