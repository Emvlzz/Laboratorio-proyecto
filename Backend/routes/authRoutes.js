const express = require('express');
const router = express.Router();
const { Usuario, Auditoria } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

const JWT_SECRET = process.env.JWT_SECRET || 'mordekaiser';

// --- CONFIGURACIÓN DE NODEMAILER (Gmail App Password) ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'lautarovalenzuela98787@gmail.com',         // <--- Tu correo de Gmail aquí
        pass: 'qile pjus xaen eotz'      // <--- Tu contraseña de aplicación aquí
    }
});

// 1. LOGIN (Usando email)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado.' });
        }

        const esValido = await bcrypt.compare(password, usuario.password);
        if (!esValido) {
            return res.status(401).json({ msg: 'Contraseña incorrecta.' });
        }

        const token = jwt.sign(
            { 
                id: usuario.idUsuario, 
                rol: usuario.rol, 
                email: usuario.email, 
                nombre: usuario.nombre 
            }, 
            JWT_SECRET, 
            { expiresIn: '2h' }
        );

        await Auditoria.create({
            descripcion: `Inicio de sesión: El usuario ${usuario.nombre} (${usuario.email}) con rol [${usuario.rol}] accedió al sistema.`,
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

// 2. REGISTER (Usando email)
router.post('/register', async (req, res) => {
    try {
        const { nombre, apellido, curso, email, password, rol } = req.body;

        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(400).json({ msg: 'Ya existe un usuario registrado con este correo electrónico.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const nuevoUsuario = await Usuario.create({
            nombre,
            apellido,
            curso,
            email,
            password: hashedPassword,
            rol: rol || 'alumno' 
        });

        await Auditoria.create({
            descripcion: `Nuevo registro: Se creó la cuenta de usuario ${nuevoUsuario.nombre} (${nuevoUsuario.email}) con rol [${nuevoUsuario.rol}].`,
            idUsuario: nuevoUsuario.idUsuario,
            estado: 'exitoso'
        });

        return res.status(201).json({
            msg: '¡Usuario registrado con éxito!',
            usuario: {
                id: nuevoUsuario.idUsuario,
                nombre: nuevoUsuario.nombre,
                email: nuevoUsuario.email,
                rol: nuevoUsuario.rol
            }
        });
    } catch (error) {
        console.error("Error en /register:", error);
        return res.status(500).json({ msg: 'Error interno en el servidor', error: error.message });
    }
});

// 3. FORGOT PASSWORD (Solicitar recuperación con email)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            return res.status(404).json({ msg: 'No se encontró ningún usuario con ese correo electrónico.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expireTime = Date.now() + 3600000; // Expira en 1 hora

        usuario.resetToken = token;
        usuario.resetTokenExpire = expireTime;
        await usuario.save();

        const resetLink = `http://localhost:5173/reset-password?token=${token}`;

        await transporter.sendMail({
            to: usuario.email,
            subject: 'Recuperación de Contraseña - Sistema de Laboratorio',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #007bff;">Recuperación de Contraseña</h2>
                    <p>Hola <strong>${usuario.nombre}</strong>,</p>
                    <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para continuar:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" target="_blank" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Restablecer Contraseña</a>
                    </div>
                    <p style="font-size: 14px; color: #666;">Este enlace expirará en 1 hora.</p>
                    <p style="font-size: 14px; color: #666;">Si tú no solicitaste este cambio, puedes ignorar este mensaje de forma segura.</p>
                </div>
            `
        });

        return res.json({ msg: 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña.' });
    } catch (error) {
        console.error("Error en forgot-password:", error);
        return res.status(500).json({ msg: 'Error al procesar la solicitud', error: error.message });
    }
});

// 4. RESET PASSWORD (Restablecer con token)
router.post('/reset-password', async (req, res) => {
    try {
        const { token, nuevaPassword } = req.body;

        const usuario = await Usuario.findOne({
            where: {
                resetToken: token,
                resetTokenExpire: { [Op.gt]: Date.now() }
            }
        });

        if (!usuario) {
            return res.status(400).json({ msg: 'El token de recuperación es inválido o ha expirado.' });
        }

        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(nuevaPassword, salt);

        usuario.resetToken = null;
        usuario.resetTokenExpire = null;
        await usuario.save();

        return res.json({ msg: '¡Contraseña restablecida con éxito! Ya puedes iniciar sesión.' });
    } catch (error) {
        console.error("Error en reset-password:", error);
        return res.status(500).json({ msg: 'Error al restablecer la contraseña', error: error.message });
    }
});

module.exports = router;