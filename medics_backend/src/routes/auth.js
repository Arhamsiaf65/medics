const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);

// Session management
router.get('/sessions', authenticate, authController.getSessions);
router.delete('/sessions/:id', authenticate, authController.deleteSession);

module.exports = router;
