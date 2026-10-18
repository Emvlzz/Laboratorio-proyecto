const { Auditoria, Usuario } = require('../models');

const obtenerAuditorias = async (req, res) => {
    try {
        const auditorias = await Auditoria.findAll({
            order: [['fechaHora', 'DESC']],
            include: [{
                model: Usuario,
                as: 'Usuario', 
                attributes: ['nombre', 'apellido', 'credenciales', 'rol']
            }]
        });
        return res.json(auditorias);
    } catch (error) {
        console.error("Error al obtener auditorías:", error);
        return res.status(500).json({ msg: 'Error al obtener registros de auditoría', error: error.message });
    }
};

module.exports = {
    obtenerAuditorias
};