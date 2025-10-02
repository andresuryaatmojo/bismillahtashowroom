import axios from 'axios';
import KontrollerAuth, { User } from './KontrollerAuth';

// Base URL untuk API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Interface untuk update profil request
export interface UpdateProfileRequest {
  fullName?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  profilePicture?: string;
}

// Interface untuk response API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Interface untuk notification settings
export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  transactionUpdates: boolean;
  newMessageAlerts: boolean;
}

// Interface untuk privacy settings
export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showPhoneNumber: boolean;
  showEmail: boolean;
  showLastSeen: boolean;
  allowDirectMessages: boolean;
}

// Interface untuk security settings
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  sessionTimeout: number;
  allowedDevices: string[];
}

class KontrollerProfil {
  private static instance: KontrollerProfil;
  private authController: KontrollerAuth;

  private constructor() {
    this.authController = KontrollerAuth.getInstance();
  }

  public static getInstance(): KontrollerProfil {
    if (!KontrollerProfil.instance) {
      KontrollerProfil.instance = new KontrollerProfil();
    }
    return KontrollerProfil.instance;
  }

  // Get authorization headers
  private getAuthHeaders() {
    const token = this.authController.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Get user profile
  public async getUserProfile(): Promise<User | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/profile`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        // Update current user in auth controller
        this.authController.updateCurrentUser(response.data.data);
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get user profile error:', error);
      
      // Return current user from auth controller as fallback
      return this.authController.getCurrentUser();
    }
  }

  // Update user profile
  public async updateProfile(profileData: UpdateProfileRequest): Promise<ApiResponse<User>> {
    try {
      const response = await axios.put(`${API_BASE_URL}/profile`, profileData, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success && response.data.data) {
        // Update current user in auth controller
        this.authController.updateCurrentUser(response.data.data);
      }

      return response.data;
    } catch (error: any) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal memperbarui profil. Silakan coba lagi.'
      };
    }
  }

  // Upload profile picture
  public async uploadProfilePicture(file: File): Promise<ApiResponse<{ profilePicture: string }>> {
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await axios.post(`${API_BASE_URL}/profile/upload-picture`, formData, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success && response.data.data) {
        // Update current user with new profile picture
        this.authController.updateCurrentUser({
          profilePicture: response.data.data.profilePicture
        });
      }

      return response.data;
    } catch (error: any) {
      console.error('Upload profile picture error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal mengunggah foto profil.'
      };
    }
  }

  // Delete profile picture
  public async deleteProfilePicture(): Promise<ApiResponse> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/profile/picture`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        // Update current user to remove profile picture
        this.authController.updateCurrentUser({ profilePicture: undefined });
      }

      return response.data;
    } catch (error: any) {
      console.error('Delete profile picture error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal menghapus foto profil.'
      };
    }
  }

  // Get notification settings
  public async getNotificationSettings(): Promise<NotificationSettings | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/profile/notifications`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get notification settings error:', error);
      
      // Return default settings
      return {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        marketingEmails: false,
        transactionUpdates: true,
        newMessageAlerts: true
      };
    }
  }

  // Update notification settings
  public async updateNotificationSettings(settings: NotificationSettings): Promise<ApiResponse> {
    try {
      const response = await axios.put(`${API_BASE_URL}/profile/notifications`, settings, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error: any) {
      console.error('Update notification settings error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal memperbarui pengaturan notifikasi.'
      };
    }
  }

  // Get privacy settings
  public async getPrivacySettings(): Promise<PrivacySettings | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/profile/privacy`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get privacy settings error:', error);
      
      // Return default settings
      return {
        profileVisibility: 'public',
        showPhoneNumber: false,
        showEmail: false,
        showLastSeen: true,
        allowDirectMessages: true
      };
    }
  }

  // Update privacy settings
  public async updatePrivacySettings(settings: PrivacySettings): Promise<ApiResponse> {
    try {
      const response = await axios.put(`${API_BASE_URL}/profile/privacy`, settings, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error: any) {
      console.error('Update privacy settings error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal memperbarui pengaturan privasi.'
      };
    }
  }

  // Get security settings
  public async getSecuritySettings(): Promise<SecuritySettings | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/profile/security`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get security settings error:', error);
      
      // Return default settings
      return {
        twoFactorEnabled: false,
        loginAlerts: true,
        sessionTimeout: 30,
        allowedDevices: []
      };
    }
  }

  // Update security settings
  public async updateSecuritySettings(settings: SecuritySettings): Promise<ApiResponse> {
    try {
      const response = await axios.put(`${API_BASE_URL}/profile/security`, settings, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error: any) {
      console.error('Update security settings error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal memperbarui pengaturan keamanan.'
      };
    }
  }

  // Enable two-factor authentication
  public async enableTwoFactor(): Promise<ApiResponse<{ qrCode: string; backupCodes: string[] }>> {
    try {
      const response = await axios.post(`${API_BASE_URL}/profile/enable-2fa`, {}, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error: any) {
      console.error('Enable 2FA error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal mengaktifkan autentikasi dua faktor.'
      };
    }
  }

  // Disable two-factor authentication
  public async disableTwoFactor(password: string): Promise<ApiResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/profile/disable-2fa`, { password }, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error: any) {
      console.error('Disable 2FA error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal menonaktifkan autentikasi dua faktor.'
      };
    }
  }

  // Verify account (send verification email)
  public async sendVerificationEmail(): Promise<ApiResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/profile/send-verification`, {}, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error: any) {
      console.error('Send verification email error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal mengirim email verifikasi.'
      };
    }
  }

  // Delete account
  public async deleteAccount(password: string, reason?: string): Promise<ApiResponse> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/profile/delete-account`, {
        headers: this.getAuthHeaders(),
        data: { password, reason }
      });

      if (response.data.success) {
        // Logout user after successful account deletion
        await this.authController.logout();
      }

      return response.data;
    } catch (error: any) {
      console.error('Delete account error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal menghapus akun.'
      };
    }
  }

  // Get account activity log
  public async getActivityLog(page: number = 1, limit: number = 10): Promise<any[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/profile/activity-log`, {
        headers: this.getAuthHeaders(),
        params: { page, limit }
      });

      if (response.data.success) {
        return response.data.data;
      }

      return [];
    } catch (error: any) {
      console.error('Get activity log error:', error);
      
      // Return mock activity log for development
      return [
        {
          id: '1',
          action: 'login',
          description: 'Login berhasil',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: '2',
          action: 'profile_update',
          description: 'Profil diperbarui',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ];
    }
  }

  // Validate profile data
  public validateProfileData(data: UpdateProfileRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate full name
    if (data.fullName !== undefined) {
      if (!data.fullName || data.fullName.trim().length < 2) {
        errors.push('Nama lengkap harus minimal 2 karakter');
      }
      if (data.fullName.length > 100) {
        errors.push('Nama lengkap maksimal 100 karakter');
      }
    }

    // Validate username
    if (data.username !== undefined) {
      if (!data.username || data.username.trim().length < 3) {
        errors.push('Username harus minimal 3 karakter');
      }
      if (data.username.length > 50) {
        errors.push('Username maksimal 50 karakter');
      }
      if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
        errors.push('Username hanya boleh mengandung huruf, angka, dan underscore');
      }
    }

    // Validate email
    if (data.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!data.email || !emailRegex.test(data.email)) {
        errors.push('Format email tidak valid');
      }
    }

    // Validate phone number
    if (data.phoneNumber !== undefined) {
      const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
      if (data.phoneNumber && !phoneRegex.test(data.phoneNumber)) {
        errors.push('Format nomor telepon tidak valid');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get profile completion percentage
  public getProfileCompletion(): number {
    const user = this.authController.getCurrentUser();
    if (!user) return 0;

    const fields = [
      user.fullName,
      user.username,
      user.email,
      user.phoneNumber,
      user.address,
      user.profilePicture
    ];

    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  }

  // Get missing profile fields
  public getMissingProfileFields(): string[] {
    const user = this.authController.getCurrentUser();
    if (!user) return [];

    const missingFields: string[] = [];

    if (!user.fullName || user.fullName.trim() === '') {
      missingFields.push('Nama Lengkap');
    }
    if (!user.phoneNumber || user.phoneNumber.trim() === '') {
      missingFields.push('Nomor Telepon');
    }
    if (!user.address || user.address.trim() === '') {
      missingFields.push('Alamat');
    }
    if (!user.profilePicture) {
      missingFields.push('Foto Profil');
    }

    return missingFields;
  }
}

export default KontrollerProfil;