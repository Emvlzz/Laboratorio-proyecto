const { Aula } = require('../models');

exports.obtenerAulas = async (req, res) => {
    try {
        const aulas = await Aula.findAll();
        res.json(aulas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.crearAula = async (req, res) => {
    try {
        const { nombre, ubicacion } = req.body;
        const nuevaAula = await Aula.create({ nombre, ubicacion });
        res.status(201).json(nuevaAula);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};