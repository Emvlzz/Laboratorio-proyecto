const express = require('express');
const router = express.Router();
const { Usuario, Reporte } = require('../models'); // 👈 Importamos el modelo Reporte
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mordekaiser';

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar el usuario por credenciales
        const usuario = await Usuario.findOne({ where: { credenciales: email } });
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        // Validar contraseña
        const esValido = await bcrypt.compare(password, usuario.password);
        if (!esValido) {
            return res.status(401).json({ msg: 'Contraseña incorrecta.' });
        }

        // Generar el Token JWT
        const token = jwt.sign(
            { 
                id: usuario.idUsuario, 
                rol: usuario.rol, 
                credenciales: usuario.credenciales, 
                nombre: usuario.nombre 
            }, 
            JWT_SECRET, 
            { expiresIn: '2h' }
        );

        // --- CREAR EL REPORTE AUTOMÁTICO DE INICIO DE SESIÓN ---
        const ahora = new Date();
        await Reporte.create({
            descripcion: `Inicio de sesión: El usuario ${usuario.nombre} (${usuario.credenciales}) con rol [${usuario.rol}] accedió al sistema el día ${ahora.toLocaleDateString()} a las ${ahora.toLocaleTimeString()}.`,
            estado: 'completado' // O 'pendiente' / 'informativo' según prefieras
        });

        return res.json({
            token,
            rol: usuario.rol,
            nombre: usuario.nombre,
            msg: 'Inicio de sesión exitoso'
        });
    } catch (error) {
        console.error("Error en /login:", error);
        return res.status(500).json({ msg: 'Error interno en el servidor', error: error.message });
    }
});

module.exports = router;