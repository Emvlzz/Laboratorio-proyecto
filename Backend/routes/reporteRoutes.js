const express = require('express');
const router = express.Router();
const { 
    obtenerReportes, 
    crearReporte, 
    actualizarEstadoReporte, 
    eliminarReporte 
} = require('../controllers/reporteController');

const { verificarToken, esAdmin } = require('../middlewares/auth');

// Cualquier usuario autenticado (alumno, profesor, admin) puede listar reportes.
// El controlador se encarga de filtrar automáticamente qué ve cada rol.
router.get('/', verificarToken, obtenerReportes);

// Cualquier usuario logueado puede crear un reporte
router.post('/', verificarToken, crearReporte);

// Solo el administrador puede cambiar el estado de un reporte
router.put('/:id', [verificarToken, esAdmin], actualizarEstadoReporte);

// Solo el administrador puede eliminar reportes
router.delete('/:id', [verificarToken, esAdmin], eliminarReporte);

module.exports = router;