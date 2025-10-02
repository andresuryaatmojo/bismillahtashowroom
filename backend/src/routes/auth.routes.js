const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token akses diperlukan'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token tidak valid'
      });
    }
    req.user = user;
    next();
  });
}

// Register new user
router.post('/register', AuthController.register);

// Login user
router.post('/login', AuthController.login);

// Get user profile (requires authentication)
router.get('/profile', authenticateToken, AuthController.getProfile);

// Refresh token
router.post('/refresh-token', AuthController.refreshToken);

// Logout
router.post('/logout', AuthController.logout);

module.exports = router;