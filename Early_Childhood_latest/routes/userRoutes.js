const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes
router.get('/users', userController.getAllUsers);
router.post('/login', userController.loginUser);
router.post('/users', userController.createUser);

module.exports = router;
