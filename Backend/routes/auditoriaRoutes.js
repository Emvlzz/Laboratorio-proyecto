const express = require('express');
const router = express.Router();
const { obtenerAuditorias, eliminarAuditoria } = require('../controllers/auditoriaController');
const { verificarToken, esAdmin } = require('../middlewares/auth');

router.get('/', [verificarToken, esAdmin], obtenerAuditorias);
router.delete('/:id', [verificarToken, esAdmin], eliminarAuditoria);

module.exports = router;