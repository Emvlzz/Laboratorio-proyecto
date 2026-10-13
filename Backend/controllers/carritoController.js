const { Carrito, Computadora, Aula } = require('../models');

exports.obtenerCarritos = async (req, res) => {
    try {
        const carritos = await Carrito.findAll({ include: [Aula, Computadora] });
        res.json(carritos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.crearCarritoConEquipos = async (req, res) => {
    try {
        const { codigo, aulaId } = req.body;
        
        // Crear el carrito
        const carrito = await Carrito.create({ codigo, aulaId });

        // Crear automáticamente las 32 computadoras (Equipo 1: Profesor, Equipos 2-32: Alumnos)
        const computadoras = [];
        for (let i = 1; i <= 32; i++) {
            computadoras.push({
                numeroEquipo: i,
                tipo: i === 1 ? 'profesor' : 'alumno',
                carritoId: carrito.id
            });
        }
        await Computadora.bulkCreate(computadoras);

        res.status(201).json({ msg: 'Carrito creado con sus 32 equipos correctamente', carrito });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};