const express = require('express');
const router = express.Router();
const { 
    obtenerReportes, 
    crearReporte, 
    actualizarEstadoReporte, 
    eliminarReporte 
} = require('../controllers/reporteController');

const { verificarToken, esAdmin } = require('../middlewares/auth');

router.get('/', [verificarToken, esAdmin], obtenerReportes);

router.post('/', verificarToken, crearReporte);

router.put('/:id', [verificarToken, esAdmin], actualizarEstadoReporte);


router.delete('/:id', [verificarToken, esAdmin], eliminarReporte);

module.exports = router;