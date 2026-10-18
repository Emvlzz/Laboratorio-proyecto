
// utils/logger.js
const { Auditoria } = require('../models');

/**
 * Guarda una acción en la tabla 'auditorias' (Bitácora).
 * @param {number|null} idUsuario - ID del usuario que realizó la acción.
 * @param {string} accion - Nombre corto de la acción (ej: 'CREAR_COMPUTADORA').
 * @param {string} detalles - Descripción más amplia o JSON con los datos.
 */
const registrarBitacora = async (idUsuario, accion, detalles = '') => {
    try {
        await Auditoria.create({
            idUsuario: idUsuario || null,
            accion: accion,
            detalles: typeof detalles === 'object' ? JSON.stringify(detalles) : detalles,
            fecha: new Date()
        });
    } catch (error) {
        console.error('Error al guardar en la bitácora:', error.message);
    }
};

module.exports = registrarBitacora;


