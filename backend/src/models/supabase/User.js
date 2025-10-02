const { supabaseHelpers } = require('../../config/supabase');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  constructor(data = {}) {
    this.id = data.id || uuidv4();
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'buyer';  // Force buyer as default
    this.fullName = data.full_name || data.fullName;
    this.phoneNumber = data.phone_number || data.phoneNumber;
    this.address = data.address;
    this.profilePicture = data.profile_picture || data.profilePicture;
    this.isVerified = data.is_verified !== undefined ? data.is_verified : (data.isVerified || false);
    this.isActive = data.is_active !== undefined ? data.is_active : (data.isActive !== undefined ? data.isActive : true);
    this.lastLogin = data.last_login || data.lastLogin;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
    
    console.log('User constructor - role set to:', this.role);
  }

  // Static methods untuk database operations
  static async create(userData) {
    try {
      // Hash password sebelum menyimpan
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      }

      // Convert camelCase to snake_case for database
      const dbData = {
        id: userData.id || uuidv4(),
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'buyer',
        full_name: userData.fullName || userData.full_name,
        phone_number: userData.phoneNumber || userData.phone_number,
        address: userData.address,
        profile_picture: userData.profilePicture || userData.profile_picture,
        is_verified: userData.isVerified !== undefined ? userData.isVerified : (userData.is_verified || false),
        is_active: userData.isActive !== undefined ? userData.isActive : (userData.is_active !== undefined ? userData.is_active : true),
        last_login: userData.lastLogin || userData.last_login
      };

      console.log('Database data to insert:', dbData);
      
      // Don't create a User instance before inserting, just insert directly
      const result = await supabaseHelpers.insert('users', dbData);
      return result[0] ? new User(result[0]) : null;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const data = await supabaseHelpers.findById('users', id);
      return data ? new User(data) : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const data = await supabaseHelpers.select('users', {
        where: { email },
        limit: 1
      });
      return data && data.length > 0 ? new User(data[0]) : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const data = await supabaseHelpers.select('users', {
        where: { username },
        limit: 1
      });
      return data && data.length > 0 ? new User(data[0]) : null;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  static async findAll(options = {}) {
    try {
      const data = await supabaseHelpers.select('users', options);
      return data.map(user => new User(user));
    } catch (error) {
      console.error('Error finding all users:', error);
      throw error;
    }
  }

  static async count(where = {}) {
    try {
      return await supabaseHelpers.count('users', where);
    } catch (error) {
      console.error('Error counting users:', error);
      throw error;
    }
  }

  // Instance methods
  async save() {
    try {
      const userData = {
        username: this.username,
        email: this.email,
        password: this.password,
        role: this.role,
        full_name: this.fullName,
        phone_number: this.phoneNumber,
        address: this.address,
        profile_picture: this.profilePicture,
        is_verified: this.isVerified,
        last_login: this.lastLogin
      };

      // Hash password jika berubah
      if (this.password && !this.password.startsWith('$2a$')) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(this.password, salt);
      }

      const result = await supabaseHelpers.update('users', this.id, userData);
      if (result && result[0]) {
        Object.assign(this, result[0]);
      }
      return this;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  async delete() {
    try {
      return await supabaseHelpers.delete('users', this.id);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async verifyPassword(password) {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  async updateLastLogin() {
    try {
      this.lastLogin = new Date();
      return await this.save();
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  // Utility methods
  toJSON() {
    const { password, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateRole(role) {
    const validRoles = ['buyer', 'seller', 'admin'];
    return validRoles.includes(role);
  }
}

module.exports = User;