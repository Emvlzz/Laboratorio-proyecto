const express = require('express');
const router = express.Router();
const aulaController = require('../controllers/aulaController');

router.get('/', aulaController.obtenerAulas);
router.post('/', aulaController.crearAula);

module.exports = router;