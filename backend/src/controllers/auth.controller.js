const User = require('../models/supabase/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      const { username, email, password, fullName, phoneNumber } = req.body;

      // Validate required fields
      if (!username || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, dan password wajib diisi'
        });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar'
        });
      }

      // Check if username already exists
      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username sudah digunakan'
        });
      }

      // Create new user
      const userData = {
        username,
        email,
        password,
        fullName: fullName || null,
        phoneNumber: phoneNumber || null,
        role: 'buyer'  // Explicitly set to buyer
      };

      console.log('AUTH CONTROLLER - Creating user with data:', JSON.stringify(userData, null, 2));
      console.log('AUTH CONTROLLER - Role explicitly set to:', userData.role);
      const newUser = await User.create(userData);
      console.log('AUTH CONTROLLER - User created with role:', newUser ? newUser.role : 'No user returned');

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: newUser.id, 
          email: newUser.email,
          username: newUser.username,
          role: newUser.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Remove password from response
      const userResponse = { ...newUser };
      delete userResponse.password;

      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        data: {
          user: userResponse,
          token
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat registrasi',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email dan password wajib diisi'
        });
      }

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah'
        });
      }

      // Check if user is active (skip check for admin users temporarily)
      if (!user.isActive && user.role !== 'admin') {
        return res.status(401).json({
          success: false,
          message: 'Akun tidak aktif'
        });
      }

      // Verify password
      const isValidPassword = await user.verifyPassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah'
        });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Remove password from response
      const userResponse = { ...user };
      delete userResponse.password;

      res.json({
        success: true,
        message: 'Login berhasil',
        data: {
          user: userResponse,
          token
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat login',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get user profile (requires authentication)
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.userId);

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
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil profil',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Refresh token
  static async refreshToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token diperlukan'
        });
      }

      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Check if user still exists and is active
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Token tidak valid'
        });
      }

      // Generate new token
      const newToken = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        data: {
          token: newToken
        }
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        message: 'Token tidak valid',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Logout (optional - mainly for client-side token removal)
  static async logout(req, res) {
    try {
      // In a stateless JWT system, logout is mainly handled client-side
      // But we can add server-side logic here if needed (like token blacklisting)
      
      res.json({
        success: true,
        message: 'Logout berhasil'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat logout',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = AuthController;