const express = require('express');
const router = express.Router();
const User = require('../models/supabase/User');
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

// Get all users (admin only - simplified for testing)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const users = await User.findAll(options);
    const totalUsers = await User.count();

    // Remove passwords from response
    const usersResponse = users.map(user => {
      const userObj = { ...user };
      delete userObj.password;
      return userObj;
    });

    res.json({
      success: true,
      data: {
        users: usersResponse,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / parseInt(limit)),
          totalItems: totalUsers,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data pengguna',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan'
      });
    }

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.json({
      success: true,
      data: userResponse
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data pengguna',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user profile (requires authentication)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan'
      });
    }

    const {
      username,
      fullName,
      phoneNumber,
      profilePicture
    } = req.body;

    // Update user properties
    if (username) user.username = username;
    if (fullName) user.fullName = fullName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    // Remove password from response
    const userResponse = { ...user };
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: userResponse
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui profil',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Change password (requires authentication)
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password lama dan password baru wajib diisi'
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan'
      });
    }

    // Verify current password
    const isValidPassword = await user.verifyPassword(currentPassword);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password lama tidak benar'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password berhasil diubah'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengubah password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete user account (requires authentication)
router.delete('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan'
      });
    }

    await user.delete();

    res.json({
      success: true,
      message: 'Akun berhasil dihapus'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus akun',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user statistics (requires authentication)
router.get('/profile/stats', authenticateToken, async (req, res) => {
  try {
    const Car = require('../models/supabase/Car');
    
    const totalCars = await Car.count({ seller_id: req.user.userId });
    const availableCars = await Car.count({ seller_id: req.user.userId, status: 'available' });
    const soldCars = await Car.count({ seller_id: req.user.userId, status: 'sold' });
    const pendingCars = await Car.count({ seller_id: req.user.userId, status: 'pending' });

    const stats = {
      totalCars,
      availableCars,
      soldCars,
      pendingCars
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil statistik',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;