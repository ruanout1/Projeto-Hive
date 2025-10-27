const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

router.get('/servicos', clienteController.getServicos);
router.post('/servicos', clienteController.createServico);

module.exports = router;

