const express = require('express');
const router = express.Router();
const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'tu_clave_secreta_super_segura';

// 1. Ruta de Registro
router.post('/register', async (req, res) => {
    try {
        const { nombre, apellido, curso, email, password, rol } = req.body;

        // Buscamos usando 'credenciales' (que es como se llama la columna en tu BD)
        const usuarioExistente = await Usuario.findOne({ where: { credenciales: email } });
        if (usuarioExistente) {
            return res.status(400).json({ msg: 'El correo electrónico ya está registrado.' });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el usuario asignando el email del formulario a la columna 'credenciales'
        const nuevoUsuario = await Usuario.create({
            nombre,
            apellido: apellido || '',
            curso: curso || 'General',
            credenciales: email, 
            password: hashedPassword,
            rol: rol || 'alumno'
        });

        return res.status(201).json({ 
            msg: '¡Usuario registrado con éxito!', 
            usuario: { 
                id: nuevoUsuario.idUsuario, 
                nombre: nuevoUsuario.nombre, 
                credenciales: nuevoUsuario.credenciales, 
                rol: nuevoUsuario.rol 
            } 
        });
    } catch (error) {
        console.error("Error en /register:", error);
        return res.status(500).json({ msg: 'Error interno en el servidor', error: error.message });
    }
});

// 2. Ruta de Login
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

        // Generar el Token JWT
        const token = jwt.sign(
            { id: usuario.idUsuario, rol: usuario.rol, credenciales: usuario.credenciales }, 
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