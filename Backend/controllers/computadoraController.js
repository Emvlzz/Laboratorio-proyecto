const { Computadora } = require('../models');

exports.obtenerComputadorasPorCarrito = async (req, res) => {
    try {
        const { carritoId } = req.params;
        const computadoras = await Computadora.findAll({ where: { carritoId } });
        res.json(computadoras);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.actualizarEstadoComputadora = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; // operativa, en_reparacion, baja

        const computadora = await Computadora.findByPk(id);
        if (!computadora) return res.status(404).json({ msg: 'Computadora no encontrada' });

        computadora.estado = estado;
        await computadora.save();

        res.json({ msg: 'Estado de la computadora actualizado', computadora });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};