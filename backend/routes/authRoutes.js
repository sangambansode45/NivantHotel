const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// This should be POST /api/auth/login
router.post('/login', authController.login);
router.get('/verify', auth, authController.verify);

module.exports = router;