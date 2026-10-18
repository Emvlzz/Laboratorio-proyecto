const express = require('express');
const router = express.Router();
const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'mordekaiser';

// 1. Ruta de Registro
router.post('/register', async (req, res) => {
    try {
        const { nombre, apellido, curso, credenciales, password, rol } = req.body;

        if (!credenciales || !password || !nombre) {
            return res.status(400).json({ msg: 'Faltan campos obligatorios.' });
        }

        // Verificar si ya existe
        const existe = await Usuario.findOne({ where: { credenciales } });
        if (existe) {
            return res.status(400).json({ msg: 'El usuario ya está registrado.' });
        }

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el usuario con todos los campos
        const nuevoUsuario = await Usuario.create({
            nombre,
            apellido: apellido || null,
            curso: curso || null,
            credenciales,
            password: hashedPassword,
            rol: rol || 'alumno'
        });

        res.status(201).json({ msg: 'Usuario registrado con éxito', usuario: nuevoUsuario });
    } catch (error) {
        console.error("Error en /register:", error);
        res.status(500).json({ msg: 'Error interno en el servidor', error: error.message });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar el usuario por 'credenciales'
        const usuario = await Usuario.findOne({ where: { credenciales: email } });
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        // Validar contraseña
        const esValido = await bcrypt.compare(password, usuario.password);
        if (!esValido) {
            return res.status(401).json({ msg: 'Contraseña incorrecta.' });
        }

        // Generar el Token JWT (Añadimos 'nombre' aquí 👇)
        const token = jwt.sign(
            { 
                id: usuario.idUsuario, 
                rol: usuario.rol, 
                credenciales: usuario.credenciales, 
                nombre: usuario.nombre // <--- ¡Asegúrate de incluir esto!
            }, 
            JWT_SECRET, 
            { expiresIn: '2h' }
        );

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