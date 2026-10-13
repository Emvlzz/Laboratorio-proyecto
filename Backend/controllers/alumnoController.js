const { Alumno } = require('../models');

exports.obtenerAlumnos = async (req, res) => {
    try {
        const alumnos = await Alumno.findAll();
        res.json(alumnos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.crearAlumno = async (req, res) => {
    try {
        const { nombre, email, matricula } = req.body;
        const alumno = await Alumno.create({ nombre, email, matricula });
        res.status(201).json(alumno);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};