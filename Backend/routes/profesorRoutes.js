const express = require('express');
const router = express.Router();
const profesorController = require('../controllers/profesorController');

router.get('/', profesorController.obtenerProfesores);
router.post('/', profesorController.crearProfesor);

module.exports = router;