const express = require('express');
const router = express.Router();
const CarController = require('../controllers/car.controller');
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

// Get all cars with pagination and filters
router.get('/', CarController.getAllCars);

// Search cars
router.get('/search', CarController.searchCars);

// Get car statistics
router.get('/stats', CarController.getCarStats);

// Get cars by seller
router.get('/seller/:sellerId', CarController.getCarsBySeller);

// Get car by ID (increment view count)
router.get('/:id', CarController.getCarById);

// Create new car (requires authentication)
router.post('/', authenticateToken, CarController.createCar);

// Update car (requires authentication and ownership)
router.put('/:id', authenticateToken, CarController.updateCar);

// Delete car (requires authentication and ownership)
router.delete('/:id', authenticateToken, CarController.deleteCar);

// Approve car (admin only - simplified for testing)
router.put('/:id/approve', authenticateToken, CarController.approveCar);

module.exports = router;