const { Profesor } = require('../models');

exports.obtenerProfesores = async (req, res) => {
    try {
        const profesores = await Profesor.findAll();
        res.json(profesores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.crearProfesor = async (req, res) => {
    try {
        const { nombre, email, departamento } = req.body;
        const profesor = await Profesor.create({ nombre, email, departamento });
        res.status(201).json(profesor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};