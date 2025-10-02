import axios from 'axios';

// Base URL untuk API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Interface untuk data user
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  role: 'buyer' | 'seller' | 'dealer' | 'admin' | 'super_admin' | 'moderator' | 'support';
  profilePicture?: string;
  isVerified: boolean;
  lastLogin?: Date;
}

// Interface untuk login request
export interface LoginRequest {
  username: string;
  password: string;
}

// Interface untuk register request
export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: 'buyer' | 'seller' | 'dealer';
}

// Interface untuk auth response
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

class KontrollerAuth {
  private static instance: KontrollerAuth;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private currentUser: User | null = null;

  private constructor() {
    // Load token dari localStorage saat inisialisasi
    this.loadTokenFromStorage();
  }

  public static getInstance(): KontrollerAuth {
    if (!KontrollerAuth.instance) {
      KontrollerAuth.instance = new KontrollerAuth();
    }
    return KontrollerAuth.instance;
  }

  // Load token dari localStorage
  private loadTokenFromStorage(): void {
    this.token = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        this.clearStorage();
      }
    }
  }

  // Save token ke localStorage
  private saveTokenToStorage(token: string, refreshToken: string, user: User): void {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.token = token;
    this.refreshToken = refreshToken;
    this.currentUser = user;
  }

  // Clear storage
  private clearStorage(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    this.token = null;
    this.refreshToken = null;
    this.currentUser = null;
  }

  // Login user
  public async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      
      if (response.data.success && response.data.data) {
        const { user, token, refreshToken } = response.data.data;
        this.saveTokenToStorage(token, refreshToken, user);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login gagal. Silakan coba lagi.'
      };
    }
  }

  // Register user
  public async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      
      if (response.data.success && response.data.data) {
        const { user, token, refreshToken } = response.data.data;
        this.saveTokenToStorage(token, refreshToken, user);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Register error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.'
      };
    }
  }

  // Logout user
  public async logout(): Promise<void> {
    try {
      if (this.token) {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearStorage();
    }
  }

  // Refresh token
  public async refreshAccessToken(): Promise<boolean> {
    try {
      if (!this.refreshToken) {
        return false;
      }

      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken: this.refreshToken
      });

      if (response.data.success && response.data.data) {
        const { token, refreshToken, user } = response.data.data;
        this.saveTokenToStorage(token, refreshToken, user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearStorage();
      return false;
    }
  }

  // Verify email
  public async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, { token });
      return response.data;
    } catch (error: any) {
      console.error('Email verification error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Verifikasi email gagal.'
      };
    }
  }

  // Forgot password
  public async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      return response.data;
    } catch (error: any) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal mengirim email reset password.'
      };
    }
  }

  // Reset password
  public async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        newPassword
      });
      return response.data;
    } catch (error: any) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Reset password gagal.'
      };
    }
  }

  // Change password
  public async changePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      if (!this.token) {
        return {
          success: false,
          message: 'Anda harus login terlebih dahulu.'
        };
      }

      const response = await axios.post(`${API_BASE_URL}/auth/change-password`, {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      return response.data;
    } catch (error: any) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal mengubah password.'
      };
    }
  }

  // Get current user
  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Get access token
  public getAccessToken(): string | null {
    return this.token;
  }

  // Check if user is authenticated
  public isAuthenticated(): boolean {
    return this.token !== null && this.currentUser !== null;
  }

  // Check if user has specific role
  public hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  // Check if user is admin
  public isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Update current user data
  public updateCurrentUser(userData: Partial<User>): void {
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...userData };
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
  }
}

export default KontrollerAuth;