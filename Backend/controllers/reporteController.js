const { Reporte, Usuario, Computadora } = require('../models');

const obtenerReportes = async (req, res) => {
    try {
        const usuarioLogueado = req.user; 

        let opcionesConsulta = {
            include: [
                { model: Usuario, as: 'autor', attributes: ['nombre', 'apellido', 'rol', 'email'] },
                { model: Computadora, as: 'computadora', attributes: ['nombre'] }
            ],
            order: [['createdAt', 'DESC']]
        };

        if (usuarioLogueado.rol !== 'administrador') {
            opcionesConsulta.where = { idUsuario: usuarioLogueado.id };
        }

        const reportes = await Reporte.findAll(opcionesConsulta);
        return res.json(reportes);
    } catch (error) {
        console.error("Error al obtener reportes:", error);
        return res.status(500).json({ msg: 'Error al obtener reportes', error: error.message });
    }
};

// Crear un nuevo reporte de incidencia desde la app
const crearReporte = async (req, res) => {
    try {
        const { descripcion, computadoraId } = req.body;
        const idUsuario = req.user.id; // Obtenido del token verificado

        if (!descripcion) {
            return res.status(400).json({ msg: 'La descripción del reporte es obligatoria.' });
        }

        const nuevoReporte = await Reporte.create({
            descripcion,
            estado: 'pendiente',
            idUsuario,
            computadoraId: computadoraId || null
        });

        // Emitir evento en tiempo real para el panel del admin
        const io = req.app.get('socketio');
        if (io) {
            const reporteConDetalles = await Reporte.findByPk(nuevoReporte.id, {
                include: [
                    { model: Usuario, as: 'autor', attributes: ['nombre', 'apellido', 'rol', 'email'] },
                    { model: Computadora, as: 'computadora', attributes: ['nombre'] }
                ]
            });
            io.emit('nuevoReporte', reporteConDetalles);
        }

        return res.status(201).json({ msg: 'Reporte creado con éxito', reporte: nuevoReporte });
    } catch (error) {
        console.error("Error al crear reporte:", error);
        return res.status(500).json({ msg: 'Error al crear reporte', error: error.message });
    }
};

// Actualizar el estado de un reporte
const actualizarEstadoReporte = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const reporte = await Reporte.findByPk(id);
        if (!reporte) {
            return res.status(404).json({ msg: 'Reporte no encontrado' });
        }

        reporte.estado = estado || reporte.estado;
        await reporte.save();

        return res.json({ msg: 'Reporte actualizado con éxito', reporte });
    } catch (error) {
        console.error("Error al actualizar reporte:", error);
        return res.status(500).json({ msg: 'Error al actualizar reporte', error: error.message });
    }
};

// Eliminar un reporte
const eliminarReporte = async (req, res) => {
    try {
        const { id } = req.params;
        const reporte = await Reporte.findByPk(id);
        
        if (!reporte) {
            return res.status(404).json({ msg: 'Reporte no encontrado' });
        }

        await reporte.destroy();
        return res.json({ msg: 'Reporte eliminado con éxito' });
    } catch (error) {
        console.error("Error al eliminar reporte:", error);
        return res.status(500).json({ msg: 'Error al eliminar reporte', error: error.message });
    }
};

module.exports = {
    obtenerReportes,
    crearReporte,
    actualizarEstadoReporte,
    eliminarReporte
};