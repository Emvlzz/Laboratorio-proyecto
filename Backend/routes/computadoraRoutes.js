const express = require('express');
const router = express.Router();
const { Computadora, Carrito, Usuario, Auditoria } = require('../models');
const { verificarToken } = require('../middlewares/auth');

// 1. Crear computadora
router.post('/', verificarToken, async (req, res) => {
    try {
        if (req.user && req.user.rol !== 'administrador') {
            return res.status(403).json({ msg: 'Acceso denegado.' });
        }
        const { nombre, descripcion, carritoId, usuarioId } = req.body;
        
        // REGLA AUTOMÁTICA: Si nace con usuario, está en uso; si no, disponible.
        const estadoInicial = usuarioId ? 'en uso' : 'disponible';

        const nuevaComputadora = await Computadora.create({ 
            nombre, 
            descripcion, 
            carritoId, 
            usuarioId: usuarioId || null,
            estado: estadoInicial 
        });

        const idAdmin = req.user?.id || req.user?.idUsuario || null;
        await Auditoria.create({
            descripcion: `Gestión de computadoras: Se creó la computadora "${nombre}" con estado [${estadoInicial}].`,
            idUsuario: idAdmin,
            estado: 'exitoso'
        });

        res.status(201).json({ msg: 'Computadora creada con éxito', computadora: nuevaComputadora });
    } catch (error) {
        res.status(500).json({ msg: 'Error al crear computadora', error: error.message });
    }
});

router.get('/', verificarToken, async (req, res) => {
    try {
        const computadoras = await Computadora.findAll({
            include: [
                { model: Carrito, as: 'carrito' },
                { model: Usuario, as: 'usuarios', attributes: ['idUsuario', 'nombre', 'apellido', 'email'] }
            ]
        });
        res.json(computadoras);
    } catch (error) {
        console.error("Error al obtener computadoras:", error);
        res.status(500).json({ msg: 'Error al obtener computadoras', error: error.message });
    }
});

// PUT /computadoras/:id/asignar - Asignar computadora a un usuario
router.put('/:id/asignar', verificarToken, async (req, res) => {
    try {
        if (req.user && req.user.rol !== 'administrador') {
            return res.status(403).json({ msg: 'Acceso denegado. Solo administradores.' });
        }

        const { id: computadoraId } = req.params; // ID de la computadora
        const { usuarioId } = req.body; // ID del usuario (o null/vacío para desasignar)

        const computadora = await Computadora.findByPk(computadoraId, {
            include: [{ model: Usuario, as: 'usuarios' }]
        });

        if (!computadora) {
            return res.status(404).json({ msg: 'Computadora no encontrada.' });
        }

        // Si se envió un usuarioId, se lo asignamos actualizando al usuario
        if (usuarioId) {
            const usuario = await Usuario.findByPk(usuarioId);
            if (!usuario) {
                return res.status(404).json({ msg: 'Usuario no encontrado.' });
            }
            // Asignamos la computadora al usuario
            usuario.computadoraId = computadoraId;
            await usuario.save();
        } else {
            // Si no mandaron usuarioId, buscamos si algún usuario la tenía y se la quitamos
            await Usuario.update({ computadoraId: null }, { where: { computadoraId } });
        }

        // Recargamos la computadora con sus usuarios actualizados para verificar el estado
        await computadora.reload({
            include: [{ model: Usuario, as: 'usuarios' }]
        });

        // APLICAR REGLA DE NEGOCIO AUTOMÁTICA:
        // Si tiene usuarios asociados -> 'en uso'. Si no tiene -> 'disponible'.
        const tieneUsuarios = computadora.usuarios && computadora.usuarios.length > 0;
        computadora.estado = tieneUsuarios ? 'en uso' : 'disponible';
        await computadora.save();

        // Auditoría
        await Auditoria.create({
            descripcion: `Admin actualizó la PC "${computadora.nombre}": Estado cambiado automáticamente a [${computadora.estado}].`,
            idUsuario: req.user.id || req.user.idUsuario,
            estado: 'exitoso'
        });

        return res.json({ 
            msg: `Computadora actualizada a estado [${computadora.estado}]`, 
            computadora 
        });

    } catch (error) {
        console.error("Error al asignar computadora:", error);
        return res.status(500).json({ msg: 'Error al procesar la asignación', error: error.message });
    }
});

// PUT /computadoras/:id/estado - Actualizar estado operativo por el Administrador
router.put('/:id/estado', verificarToken, async (req, res) => {
    try {
        // Verificar que sea administrador
        if (req.user && req.user.rol !== 'administrador') {
            return res.status(403).json({ msg: 'Acceso denegado. Solo administradores.' });
        }

        const { id } = req.params;
        const { nuevoEstado } = req.body; // Ej: 'disponible', 'en uso', 'mantenimiento'

        const computadora = await Computadora.findByPk(id);
        if (!computadora) {
            return res.status(404).json({ msg: 'Computadora no encontrada.' });
        }

        const estadoAnterior = computadora.estado;
        computadora.estado = nuevoEstado;
        await computadora.save(); // Guarda el cambio en la base de datos

        // Registrar el cambio en la bitácora de auditoría
        await Auditoria.create({
            descripcion: `Admin cambió estado de la PC "${computadora.nombre}" de [${estadoAnterior}] a [${nuevoEstado}].`,
            idUsuario: req.user.id || req.user.idUsuario,
            estado: 'exitoso'
        });

        // Opcional: Notificar a otros paneles abiertos por WebSockets
        const io = req.app.get('socketio');
        if (io) {
            io.emit('computadoraActualizada', computadora);
        }

        return res.json({ 
            msg: 'Estado de la computadora actualizado con éxito', 
            computadora 
        });

    } catch (error) {
        console.error("Error al actualizar estado de computadora:", error);
        return res.status(500).json({ msg: 'Error al actualizar el estado', error: error.message });
    }
});

// 4. Eliminar computadora
router.delete('/:id', verificarToken, async (req, res) => {
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