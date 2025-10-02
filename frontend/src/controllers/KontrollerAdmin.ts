import axios from 'axios';
import KontrollerAuth from './KontrollerAuth';

// Base URL untuk API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Interface untuk data admin
export interface DataAdmin {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'support';
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  profile?: {
    avatar?: string;
    phone?: string;
    department?: string;
    position?: string;
  };
}

// Interface untuk permission
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  description?: string;
}

// Interface untuk konfigurasi sistem
export interface KonfigurasiSistem {
  id: string;
  category: 'general' | 'payment' | 'notification' | 'security' | 'feature';
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array';
  description: string;
  isPublic: boolean;
  isEditable: boolean;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  updatedBy?: string;
  updatedAt?: Date;
}

// Interface untuk statistik dashboard
export interface StatistikDashboard {
  users: {
    total: number;
    active: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
    growth: number;
  };
  cars: {
    total: number;
    active: number;
    sold: number;
    newToday: number;
    averagePrice: number;
    topBrands: { brand: string; count: number }[];
  };
  transactions: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    totalRevenue: number;
    revenueToday: number;
    revenueThisMonth: number;
    growth: number;
  };
  ads: {
    total: number;
    active: number;
    expired: number;
    premium: number;
    revenue: number;
    topPerforming: { id: string; title: string; views: number }[];
  };
  support: {
    totalTickets: number;
    openTickets: number;
    resolvedToday: number;
    averageResponseTime: number;
    satisfaction: number;
  };
  system: {
    serverStatus: 'healthy' | 'warning' | 'critical';
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeConnections: number;
  };
}

// Interface untuk log aktivitas
export interface LogAktivitas {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

// Interface untuk laporan sistem
export interface LaporanSistem {
  id: string;
  type: 'user_activity' | 'sales' | 'performance' | 'security' | 'custom';
  title: string;
  description: string;
  parameters: any;
  data: any;
  generatedBy: string;
  generatedAt: Date;
  format: 'json' | 'csv' | 'pdf' | 'excel';
  fileUrl?: string;
  status: 'generating' | 'completed' | 'failed';
}

// Interface untuk notifikasi admin
export interface NotifikasiAdmin {
  id: string;
  type: 'system' | 'user' | 'transaction' | 'security' | 'maintenance';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  isRead: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  metadata?: any;
  createdAt: Date;
}

// Interface untuk backup sistem
export interface BackupSistem {
  id: string;
  type: 'full' | 'incremental' | 'database' | 'files';
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  size: number;
  location: string;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  metadata?: {
    tables?: string[];
    fileTypes?: string[];
    compression?: boolean;
    encryption?: boolean;
  };
}

class KontrollerAdmin {
  private static instance: KontrollerAdmin;
  private authController: KontrollerAuth;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();

  private constructor() {
    this.authController = KontrollerAuth.getInstance();
  }

  public static getInstance(): KontrollerAdmin {
    if (!KontrollerAdmin.instance) {
      KontrollerAdmin.instance = new KontrollerAdmin();
    }
    return KontrollerAdmin.instance;
  }

  // Get authorization headers
  private getAuthHeaders() {
    const token = this.authController.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Check admin permissions
  private async checkAdminPermission(resource: string, action: string): Promise<boolean> {
    try {
      const user = this.authController.getCurrentUser();
      if (!user || !['admin', 'super_admin'].includes(user.role)) {
        return false;
      }

      // Super admin has all permissions
      if (user.role === 'super_admin') {
        return true;
      }

      // Check specific permissions for admin
      const response = await axios.get(`${API_BASE_URL}/admin/permissions/check`, {
        params: { resource, action },
        headers: this.getAuthHeaders()
      });

      return response.data.success && response.data.data.hasPermission;
    } catch (error) {
      console.error('Check admin permission error:', error);
      return false;
    }
  }

  // Cache management
  private getCacheKey(method: string, params: any): string {
    return `admin_${method}_${JSON.stringify(params)}`;
  }

  private isValidCache(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private setCache(key: string, data: any, ttlMinutes: number = 5): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + ttlMinutes * 60 * 1000);
  }

  // Get dashboard statistics
  public async getDashboardStats(): Promise<StatistikDashboard | null> {
    try {
      if (!await this.checkAdminPermission('dashboard', 'read')) {
        throw new Error('Insufficient permissions');
      }

      const cacheKey = this.getCacheKey('dashboard_stats', {});
      
      if (this.isValidCache(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await axios.get(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        this.setCache(cacheKey, response.data.data, 5); // Cache for 5 minutes
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get dashboard stats error:', error);
      return this.getMockDashboardStats();
    }
  }

  // Get system configuration
  public async getKonfigurasiSistem(category?: string): Promise<KonfigurasiSistem[]> {
    try {
      if (!await this.checkAdminPermission('system', 'read')) {
        throw new Error('Insufficient permissions');
      }

      const params = category ? { category } : {};
      const cacheKey = this.getCacheKey('system_config', params);
      
      if (this.isValidCache(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await axios.get(`${API_BASE_URL}/admin/system/config`, {
        params,
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        this.setCache(cacheKey, response.data.data, 30); // Cache for 30 minutes
        return response.data.data;
      }

      return [];
    } catch (error: any) {
      console.error('Get konfigurasi sistem error:', error);
      return this.getMockKonfigurasiSistem();
    }
  }

  // Update system configuration
  public async updateKonfigurasiSistem(key: string, value: any): Promise<boolean> {
    try {
      if (!await this.checkAdminPermission('system', 'update')) {
        throw new Error('Insufficient permissions');
      }

      const response = await axios.put(`${API_BASE_URL}/admin/system/config/${key}`, {
        value
      }, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        this.clearConfigCache();
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Update konfigurasi sistem error:', error);
      return false;
    }
  }

  // Get all admins
  public async getAllAdmins(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: string
  ): Promise<{ admins: DataAdmin[]; pagination: any } | null> {
    try {
      if (!await this.checkAdminPermission('admin', 'read')) {
        throw new Error('Insufficient permissions');
      }

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (role) params.append('role', role);

      const response = await axios.get(`${API_BASE_URL}/admin/admins?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get all admins error:', error);
      return this.getMockAdmins();
    }
  }

  // Create new admin
  public async createAdmin(adminData: Partial<DataAdmin>): Promise<boolean> {
    try {
      if (!await this.checkAdminPermission('admin', 'create')) {
        throw new Error('Insufficient permissions');
      }

      const response = await axios.post(`${API_BASE_URL}/admin/admins`, adminData, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        this.clearAdminCache();
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Create admin error:', error);
      return false;
    }
  }

  // Update admin
  public async updateAdmin(adminId: string, adminData: Partial<DataAdmin>): Promise<boolean> {
    try {
      if (!await this.checkAdminPermission('admin', 'update')) {
        throw new Error('Insufficient permissions');
      }

      const response = await axios.put(`${API_BASE_URL}/admin/admins/${adminId}`, adminData, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        this.clearAdminCache();
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Update admin error:', error);
      return false;
    }
  }

  // Delete admin
  public async deleteAdmin(adminId: string): Promise<boolean> {
    try {
      if (!await this.checkAdminPermission('admin', 'delete')) {
        throw new Error('Insufficient permissions');
      }

      const response = await axios.delete(`${API_BASE_URL}/admin/admins/${adminId}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        this.clearAdminCache();
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Delete admin error:', error);
      return false;
    }
  }

  // Get activity logs
  public async getLogAktivitas(
    page: number = 1,
    limit: number = 50,
    filters?: {
      userId?: string;
      action?: string;
      resource?: string;
      severity?: string;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<{ logs: LogAktivitas[]; pagination: any } | null> {
    try {
      if (!await this.checkAdminPermission('logs', 'read')) {
        throw new Error('Insufficient permissions');
      }

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            if (value instanceof Date) {
              params.append(key, value.toISOString());
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await axios.get(`${API_BASE_URL}/admin/logs/activity?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get log aktivitas error:', error);
      return this.getMockLogAktivitas();
    }
  }

  // Generate system report
  public async generateLaporan(
    type: string,
    parameters: any,
    format: 'json' | 'csv' | 'pdf' | 'excel' = 'json'
  ): Promise<LaporanSistem | null> {
    try {
      if (!await this.checkAdminPermission('reports', 'create')) {
        throw new Error('Insufficient permissions');
      }

      const response = await axios.post(`${API_BASE_URL}/admin/reports/generate`, {
        type,
        parameters,
        format
      }, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Generate laporan error:', error);
      return this.getMockLaporan();
    }
  }

  // Get admin notifications
  public async getNotifikasiAdmin(
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<{ notifications: NotifikasiAdmin[]; pagination: any } | null> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (unreadOnly) params.append('unreadOnly', 'true');

      const response = await axios.get(`${API_BASE_URL}/admin/notifications?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get notifikasi admin error:', error);
      return this.getMockNotifikasiAdmin();
    }
  }

  // Mark notification as read
  public async markNotificationRead(notificationId: string): Promise<boolean> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/admin/notifications/${notificationId}/read`, {}, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Mark notification read error:', error);
      return false;
    }
  }

  // Create system backup
  public async createBackup(
    type: 'full' | 'incremental' | 'database' | 'files',
    options?: any
  ): Promise<BackupSistem | null> {
    try {
      if (!await this.checkAdminPermission('system', 'manage')) {
        throw new Error('Insufficient permissions');
      }

      const response = await axios.post(`${API_BASE_URL}/admin/system/backup`, {
        type,
        options
      }, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Create backup error:', error);
      return null;
    }
  }

  // Get backup history
  public async getBackupHistory(
    page: number = 1,
    limit: number = 10
  ): Promise<{ backups: BackupSistem[]; pagination: any } | null> {
    try {
      if (!await this.checkAdminPermission('system', 'read')) {
        throw new Error('Insufficient permissions');
      }

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await axios.get(`${API_BASE_URL}/admin/system/backups?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get backup history error:', error);
      return this.getMockBackupHistory();
    }
  }

  // Manage user accounts
  public async manageUser(
    userId: string,
    action: 'activate' | 'deactivate' | 'suspend' | 'delete',
    reason?: string
  ): Promise<boolean> {
    try {
      if (!await this.checkAdminPermission('users', 'manage')) {
        throw new Error('Insufficient permissions');
      }

      const response = await axios.post(`${API_BASE_URL}/admin/users/${userId}/manage`, {
        action,
        reason
      }, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Manage user error:', error);
      return false;
    }
  }

  // Clear cache methods
  private clearConfigCache(): void {
    const keysToDelete: string[] = [];
    
    // Convert iterator to array to avoid downlevelIteration issue
    const cacheKeys = Array.from(this.cache.keys());
    for (const key of cacheKeys) {
      if (key.includes('system_config')) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    });
  }

  private clearAdminCache(): void {
    const keysToDelete: string[] = [];
    
    // Convert iterator to array to avoid downlevelIteration issue
    const cacheKeys = Array.from(this.cache.keys());
    for (const key of cacheKeys) {
      if (key.includes('admin')) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    });
  }

  // Format utilities
  public formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  public formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  // Mock data for development
  private getMockDashboardStats(): StatistikDashboard {
    return {
      users: {
        total: 15420,
        active: 12350,
        newToday: 45,
        newThisWeek: 312,
        newThisMonth: 1250,
        growth: 8.5
      },
      cars: {
        total: 8950,
        active: 7200,
        sold: 1750,
        newToday: 23,
        averagePrice: 285000000,
        topBrands: [
          { brand: 'Toyota', count: 2150 },
          { brand: 'Honda', count: 1890 },
          { brand: 'Suzuki', count: 1420 },
          { brand: 'Daihatsu', count: 1180 },
          { brand: 'Mitsubishi', count: 950 }
        ]
      },
      transactions: {
        total: 3250,
        completed: 2890,
        pending: 280,
        cancelled: 80,
        totalRevenue: 925000000000,
        revenueToday: 45000000,
        revenueThisMonth: 1250000000,
        growth: 12.3
      },
      ads: {
        total: 5680,
        active: 4920,
        expired: 760,
        premium: 1240,
        revenue: 185000000,
        topPerforming: [
          { id: 'ad-1', title: 'Toyota Avanza 2023', views: 2450 },
          { id: 'ad-2', title: 'Honda Brio 2022', views: 2180 },
          { id: 'ad-3', title: 'Suzuki Ertiga 2023', views: 1950 }
        ]
      },
      support: {
        totalTickets: 1250,
        openTickets: 85,
        resolvedToday: 23,
        averageResponseTime: 2.5,
        satisfaction: 4.6
      },
      system: {
        serverStatus: 'healthy',
        uptime: 2592000, // 30 days
        responseTime: 145,
        errorRate: 0.02,
        activeConnections: 1250
      }
    };
  }

  private getMockKonfigurasiSistem(): KonfigurasiSistem[] {
    return [
      {
        id: '1',
        category: 'general',
        key: 'site_name',
        value: 'Mobilindo Showroom',
        type: 'string',
        description: 'Nama situs web',
        isPublic: true,
        isEditable: true,
        validation: { required: true }
      },
      {
        id: '2',
        category: 'general',
        key: 'maintenance_mode',
        value: false,
        type: 'boolean',
        description: 'Mode maintenance situs',
        isPublic: false,
        isEditable: true
      },
      {
        id: '3',
        category: 'payment',
        key: 'midtrans_server_key',
        value: 'SB-Mid-server-xxx',
        type: 'string',
        description: 'Midtrans server key',
        isPublic: false,
        isEditable: true,
        validation: { required: true }
      }
    ];
  }

  private getMockAdmins(): { admins: DataAdmin[]; pagination: any } {
    return {
      admins: [
        {
          id: 'admin-1',
          username: 'superadmin',
          email: 'admin@mobilindo.com',
          fullName: 'Super Administrator',
          role: 'super_admin',
          permissions: [],
          isActive: true,
          lastLogin: new Date('2024-01-20T10:30:00Z'),
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-20T10:30:00Z'),
          profile: {
            avatar: '/images/avatars/admin1.jpg',
            phone: '08123456789',
            department: 'IT',
            position: 'System Administrator'
          }
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    };
  }

  private getMockLogAktivitas(): { logs: LogAktivitas[]; pagination: any } {
    return {
      logs: [
        {
          id: 'log-1',
          userId: 'admin-1',
          userEmail: 'admin@mobilindo.com',
          action: 'login',
          resource: 'auth',
          details: { method: 'email' },
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date('2024-01-20T10:30:00Z'),
          severity: 'info'
        }
      ],
      pagination: {
        page: 1,
        limit: 50,
        total: 1,
        totalPages: 1
      }
    };
  }

  private getMockLaporan(): LaporanSistem {
    return {
      id: 'report-1',
      type: 'sales',
      title: 'Laporan Penjualan Bulanan',
      description: 'Laporan penjualan untuk bulan Januari 2024',
      parameters: { month: 1, year: 2024 },
      data: { totalSales: 125, revenue: 3500000000 },
      generatedBy: 'admin-1',
      generatedAt: new Date(),
      format: 'json',
      status: 'completed'
    };
  }

  private getMockNotifikasiAdmin(): { notifications: NotifikasiAdmin[]; pagination: any } {
    return {
      notifications: [
        {
          id: 'notif-1',
          type: 'system',
          title: 'Server Performance Alert',
          message: 'Server response time is above normal threshold',
          severity: 'warning',
          isRead: false,
          actionRequired: true,
          actionUrl: '/admin/system/performance',
          createdAt: new Date('2024-01-20T10:00:00Z')
        }
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1
      }
    };
  }

  private getMockBackupHistory(): { backups: BackupSistem[]; pagination: any } {
    return {
      backups: [
        {
          id: 'backup-1',
          type: 'full',
          status: 'completed',
          size: 1073741824, // 1GB
          location: '/backups/full_20240120_103000.tar.gz',
          createdBy: 'admin-1',
          createdAt: new Date('2024-01-20T10:30:00Z'),
          completedAt: new Date('2024-01-20T11:15:00Z'),
          metadata: {
            compression: true,
            encryption: true
          }
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    };
  }
}

export default KontrollerAdmin;