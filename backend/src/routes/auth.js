const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', AuthController.validateRegister, AuthController.register);
router.post('/login', AuthController.validateLogin, AuthController.login);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);
router.get('/verify', authenticateToken, AuthController.verifyToken);
router.get('/saved-blogs', authenticateToken, AuthController.getSavedBlogs);

// Temporary route to make user admin (remove in production)
router.post('/make-admin', authenticateToken, async (req, res) => {
  try {
    const User = require('../models/User');
    await User.updateRole(req.user.userId, 'admin');
    res.json({ message: 'User role updated to admin' });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
