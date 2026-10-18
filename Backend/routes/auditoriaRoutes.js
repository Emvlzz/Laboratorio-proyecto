const express = require('express');
const router = express.Router();
const { obtenerAuditorias } = require('../controllers/auditoriaController');
const { verificarToken, esAdmin } = require('../middlewares/auth');

// GET /auditoria - Obtener bitácora (SOLO PARA EL ADMINISTRADOR)
router.get('/', [verificarToken, esAdmin], obtenerAuditorias);

module.exports = router;