const { Computadora, Usuario, Auditoria } = require('../models');

// Asignar o desasignar computadora a un usuario (con cambio de estado automático)
const asignarComputadora = async (req, res) => {
    try {
        const { idComputadora } = req.params;
        const { usuarioId } = req.body; // Recibe el ID del usuario o null para desasignar

        // 1. Buscar la computadora
        const computadora = await Computadora.findByPk(idComputadora);
        if (!computadora) {
            return res.status(404).json({ msg: 'Computadora no encontrada' });
        }

        // 2. Si mandaron un usuarioId, verificamos que el usuario exista
        if (usuarioId) {
            const usuario = await Usuario.findByPk(usuarioId);
            if (!usuario) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }
        }

        // 3. APLICAR REGLA DE NEGOCIO AUTOMÁTICA:
        // Si hay usuarioId -> 'en uso'. Si es null/vacío -> 'disponible'.
        computadora.usuarioId = usuarioId || null;
        computadora.estado = usuarioId ? 'en uso' : 'disponible';

        await computadora.save();

        // 4. Registrar en la bitácora de auditoría
        await Auditoria.create({
            descripcion: `Actualización de equipo: La computadora "${computadora.nombre}" ahora se encuentra "${computadora.estado}".`,
            idUsuario: req.user.id, // ID del administrador que realiza la acción
            estado: 'exitoso'
        });

        // 5. Notificar en tiempo real por WebSockets (opcional pero recomendado)
        const io = req.app.get('socketio');
        if (io) {
            io.emit('computadoraActualizada', computadora);
        }

        return res.json({
            msg: `Computadora actualizada con éxito a estado: ${computadora.estado}`,
            computadora
        });

    } catch (error) {
        console.error("Error al actualizar la computadora:", error);
        return res.status(500).json({ msg: 'Error al actualizar el estado de la computadora', error: error.message });
    }
};

module.exports = {
    asignarComputadora
};