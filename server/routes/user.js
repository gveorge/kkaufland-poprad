const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes
router.get('/view/user', userController.list);
router.get('/add/user', userController.add);
router.post('/add/user', userController.create);
router.get('/edit/user/:id', userController.edit);
router.post('/edit/user/:id', userController.update);
router.get('/view/user/:id', userController.view);
router.get('/remove/user/:id',userController.delete);

module.exports = router;

