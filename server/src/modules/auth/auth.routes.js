const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

// Removed 'protect' and 'authorize' to solve bootstrap deadlock
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;