const { Usuario, Auditoria } = require('../models');
const bcrypt = require('bcrypt');

// Obtener el perfil del usuario autenticado
const obtenerPerfil = async (req, res) => {
    try {
        const userId = req.user.id; // Obtenido del token JWT
        const usuario = await Usuario.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });
        
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }
        
        return res.json(usuario);
    } catch (error) {
        console.error("Error al obtener perfil:", error);
        return res.status(500).json({ msg: 'Error al obtener el perfil', error: error.message });
    }
};

// Actualizar el perfil del usuario autenticado
const actualizarPerfil = async (req, res) => {
    try {
        const userId = req.user.id;
        const { nombre, apellido, curso, password } = req.body;

        const usuario = await Usuario.findByPk(userId);
        if (!usuario) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        usuario.nombre = nombre || usuario.nombre;
        usuario.apellido = apellido !== undefined ? apellido : usuario.apellido;
        usuario.curso = curso !== undefined ? curso : usuario.curso;

        // Si envía una contraseña nueva, la encriptamos
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            usuario.password = await bcrypt.hash(password, salt);
        }

        await usuario.save();

        // --- REGISTRO EN LA BITÁCORA DE AUDITORÍA ---
        await Auditoria.create({
            descripcion: `Actualización de perfil: El usuario ${usuario.nombre} (${usuario.credenciales}) actualizó su información personal.`,
            idUsuario: usuario.idUsuario,
            estado: 'exitoso'
        });

        return res.json({ 
            msg: '¡Perfil actualizado con éxito!', 
            usuario: { 
                nombre: usuario.nombre, 
                apellido: usuario.apellido, 
                curso: usuario.curso 
            } 
        });
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        return res.status(500).json({ msg: 'Error al actualizar el perfil', error: error.message });
    }
};

module.exports = {
    // ... tus otras funciones de usuarios (si las tienes) ...
    obtenerPerfil,
    actualizarPerfil
};