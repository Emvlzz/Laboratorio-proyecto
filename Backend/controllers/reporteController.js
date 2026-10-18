const { Reporte } = require('../models');

// Obtener todos los reportes
const obtenerReportes = async (req, res) => {
    try {
        const reportes = await Reporte.findAll({ order: [['createdAt', 'DESC']] });
        return res.json(reportes);
    } catch (error) {
        console.error("Error al obtener reportes:", error);
        return res.status(500).json({ msg: 'Error al obtener reportes', error: error.message });
    }
};

// Crear un nuevo reporte
const crearReporte = async (req, res) => {
    try {
        const { descripcion } = req.body;

        if (!descripcion) {
            return res.status(400).json({ msg: 'La descripción del reporte es obligatoria.' });
        }

        const nuevoReporte = await Reporte.create({
            descripcion,
            estado: 'pendiente'
        });

        return res.status(201).json({ msg: 'Reporte creado con éxito', reporte: nuevoReporte });
    } catch (error) {
        console.error("Error al crear reporte:", error);
        return res.status(500).json({ msg: 'Error al crear reporte', error: error.message });
    }
};

// Actualizar estado de un reporte (ej. pendiente -> resuelto)
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