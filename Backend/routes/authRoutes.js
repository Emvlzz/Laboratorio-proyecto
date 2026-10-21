const express = require('express');
const router = express.Router();
const { Usuario, Auditoria } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'mordekaiser';

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar el usuario por sus credenciales
        const usuario = await Usuario.findOne({ where: { credenciales: email } });
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        // Validar contraseña
        const esValido = await bcrypt.compare(password, usuario.password);
        if (!esValido) {
            return res.status(401).json({ msg: 'Contraseña incorrecta.' });
        }

        // Generar token JWT
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

        // --- REGISTRO AUTOMÁTICO EN LA BITÁCORA DE AUDITORÍA (LOGIN) ---
        await Auditoria.create({
            descripcion: `Inicio de sesión: El usuario ${usuario.nombre} con id: ${usuario.idUsuario} y (${usuario.credenciales}) con rol [${usuario.rol}] accedió al sistema.`,
            idUsuario: usuario.idUsuario,
            estado: 'exitoso'
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

// Register
router.post('/register', async (req, res) => {
    try {
        const { nombre, apellido, curso, credenciales, password, rol } = req.body;

        // Validar
        const usuarioExistente = await Usuario.findOne({ where: { credenciales } });
        if (usuarioExistente) {
            return res.status(400).json({ msg: 'Ya existe un usuario registrado con estas credenciales.' });
        }

        // Encript
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear
        const nuevoUsuario = await Usuario.create({
            nombre,
            apellido,
            curso,
            credenciales,
            password: hashedPassword,
            rol: rol || 'alumno' 
        });

        // --- REGISTRO AUTOMÁTICO EN LA BITÁCORA DE AUDITORÍA (REGISTRO) ---
        await Auditoria.create({
            descripcion: `Nuevo registro: Se creó la cuenta de usuario ${nuevoUsuario.nombre} (${nuevoUsuario.credenciales}) con rol [${nuevoUsuario.rol}].`,
            idUsuario: nuevoUsuario.idUsuario,
            estado: 'exitoso'
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

module.exports = router;