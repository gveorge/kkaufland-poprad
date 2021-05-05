const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Routes
router.get('/view/tovar', productController.list);
router.get('/add/tovar', productController.add);
router.post('/add/tovar', productController.create);
router.get('/edit/tovar/:id', productController.edit);
router.post('/edit/tovar/:id', productController.update);
router.get('/view/tovar/:id', productController.view);
router.get('/remove/tovar/:id',productController.delete);
router.get('/stock/tovar/:id',productController.stock);
router.post('/stock/tovar/:id',productController.change_stock);

module.exports = router;