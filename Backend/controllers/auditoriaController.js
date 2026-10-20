const { Auditoria, Usuario } = require('../models');

// Obtener todos los registros de la bitácora de auditoría
const obtenerAuditorias = async (req, res) => {
    try {
        const auditorias = await Auditoria.findAll({
            include: [{ model: Usuario, as: 'autor', attributes: ['nombre', 'apellido', 'rol', 'credenciales'] }],
            order: [['createdAt', 'DESC']]
        });
        return res.json(auditorias);
    } catch (error) {
        console.error("Error al obtener la auditoría:", error);
        return res.status(500).json({ msg: 'Error al obtener registros de auditoría', error: error.message });
    }
};

// Eliminar un registro de auditoría
const eliminarAuditoria = async (req, res) => {
    try {
        const { id } = req.params;
        const auditoria = await Auditoria.findByPk(id);
        
        if (!auditoria) {
            return res.status(404).json({ msg: 'Registro de auditoría no encontrado' });
        }

        await auditoria.destroy();
        return res.json({ msg: 'Registro de auditoría eliminado con éxito' });
    } catch (error) {
        console.error("Error al eliminar auditoría:", error);
        return res.status(500).json({ msg: 'Error al eliminar auditoría', error: error.message });
    }
};

module.exports = {
    obtenerAuditorias,
    eliminarAuditoria
};