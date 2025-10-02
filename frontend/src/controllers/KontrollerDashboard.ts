import axios from 'axios';
import KontrollerAuth from './KontrollerAuth';

// Base URL untuk API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Interface untuk statistik dashboard
export interface DashboardStats {
  totalCars: number;
  activeCars: number;
  soldCars: number;
  totalViews: number;
  totalInquiries: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingTransactions: number;
}

// Interface untuk aktivitas terbaru
export interface RecentActivity {
  id: string;
  type: 'car_added' | 'car_sold' | 'inquiry_received' | 'profile_updated' | 'transaction_completed';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  color: string;
}

// Interface untuk mobil populer
export interface PopularCar {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  image: string;
  views: number;
  inquiries: number;
}

// Interface untuk data dashboard
export interface DashboardData {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  popularCars: PopularCar[];
  profileCompletion: number;
  trustScore: number;
}

// Interface untuk quick actions
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: string;
  enabled: boolean;
}

class KontrollerDashboard {
  private static instance: KontrollerDashboard;
  private authController: KontrollerAuth;

  private constructor() {
    this.authController = KontrollerAuth.getInstance();
  }

  public static getInstance(): KontrollerDashboard {
    if (!KontrollerDashboard.instance) {
      KontrollerDashboard.instance = new KontrollerDashboard();
    }
    return KontrollerDashboard.instance;
  }

  // Get authorization headers
  private getAuthHeaders() {
    const token = this.authController.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Get dashboard data
  public async getDashboardData(): Promise<DashboardData | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get dashboard data error:', error);
      
      // Return mock data for development
      return this.getMockDashboardData();
    }
  }

  // Get dashboard statistics
  public async getDashboardStats(): Promise<DashboardStats | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get dashboard stats error:', error);
      
      // Return mock stats for development
      return {
        totalCars: 25,
        activeCars: 18,
        soldCars: 7,
        totalViews: 1250,
        totalInquiries: 89,
        totalRevenue: 2500000000,
        monthlyRevenue: 450000000,
        pendingTransactions: 3
      };
    }
  }

  // Get recent activities
  public async getRecentActivities(): Promise<RecentActivity[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/activities`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return [];
    } catch (error: any) {
      console.error('Get recent activities error:', error);
      
      // Return mock activities for development
      return [
        {
          id: '1',
          type: 'car_added',
          title: 'Mobil Baru Ditambahkan',
          description: 'Toyota Avanza 2023 berhasil ditambahkan ke katalog',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          icon: 'car',
          color: 'success'
        },
        {
          id: '2',
          type: 'inquiry_received',
          title: 'Pertanyaan Baru',
          description: 'Ahmad bertanya tentang Honda Civic 2022',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          icon: 'message',
          color: 'primary'
        },
        {
          id: '3',
          type: 'car_sold',
          title: 'Mobil Terjual',
          description: 'Mitsubishi Pajero 2021 berhasil terjual',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          icon: 'check',
          color: 'warning'
        }
      ];
    }
  }

  // Get popular cars
  public async getPopularCars(): Promise<PopularCar[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/popular-cars`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return [];
    } catch (error: any) {
      console.error('Get popular cars error:', error);
      
      // Return mock popular cars for development
      return [
        {
          id: '1',
          brand: 'Toyota',
          model: 'Avanza',
          year: 2023,
          price: 250000000,
          image: '/images/cars/avanza.jpg',
          views: 156,
          inquiries: 12
        },
        {
          id: '2',
          brand: 'Honda',
          model: 'Civic',
          year: 2022,
          price: 450000000,
          image: '/images/cars/civic.jpg',
          views: 134,
          inquiries: 8
        },
        {
          id: '3',
          brand: 'Mitsubishi',
          model: 'Pajero',
          year: 2021,
          price: 650000000,
          image: '/images/cars/pajero.jpg',
          views: 98,
          inquiries: 6
        }
      ];
    }
  }

  // Get quick actions based on user role
  public getQuickActions(): QuickAction[] {
    const user = this.authController.getCurrentUser();
    const userRole = user?.role || 'buyer';

    const commonActions: QuickAction[] = [
      {
        id: 'browse_cars',
        title: 'Jelajahi Mobil',
        description: 'Lihat katalog mobil terbaru',
        icon: 'search',
        color: 'primary',
        action: '/katalog',
        enabled: true
      },
      {
        id: 'update_profile',
        title: 'Perbarui Profil',
        description: 'Lengkapi informasi profil Anda',
        icon: 'user',
        color: 'secondary',
        action: '/profil',
        enabled: true
      }
    ];

    const sellerActions: QuickAction[] = [
      {
        id: 'add_car',
        title: 'Tambah Mobil',
        description: 'Jual mobil Anda dengan mudah',
        icon: 'plus',
        color: 'success',
        action: '/tambah-mobil',
        enabled: true
      },
      {
        id: 'manage_cars',
        title: 'Kelola Mobil',
        description: 'Lihat dan edit mobil yang dijual',
        icon: 'settings',
        color: 'warning',
        action: '/kelola-mobil',
        enabled: true
      }
    ];

    const adminActions: QuickAction[] = [
      {
        id: 'manage_users',
        title: 'Kelola Pengguna',
        description: 'Manajemen pengguna sistem',
        icon: 'users',
        color: 'danger',
        action: '/admin/users',
        enabled: true
      },
      {
        id: 'system_reports',
        title: 'Laporan Sistem',
        description: 'Lihat laporan dan analitik',
        icon: 'chart',
        color: 'primary',
        action: '/admin/reports',
        enabled: true
      }
    ];

    let actions = [...commonActions];

    if (userRole === 'seller' || userRole === 'dealer') {
      actions = [...actions, ...sellerActions];
    }

    if (userRole === 'admin') {
      actions = [...actions, ...adminActions];
    }

    return actions;
  }

  // Calculate profile completion percentage
  public calculateProfileCompletion(): number {
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

  // Calculate trust score (mock implementation)
  public calculateTrustScore(): number {
    const user = this.authController.getCurrentUser();
    if (!user) return 0;

    let score = 0;

    // Base score for verified email
    if (user.isVerified) score += 30;

    // Score for profile completion
    const profileCompletion = this.calculateProfileCompletion();
    score += Math.round(profileCompletion * 0.4);

    // Additional score based on role and activity (mock)
    if (user.role === 'dealer') score += 20;
    if (user.role === 'seller') score += 10;

    return Math.min(score, 100);
  }

  // Get mock dashboard data for development
  private getMockDashboardData(): DashboardData {
    return {
      stats: {
        totalCars: 25,
        activeCars: 18,
        soldCars: 7,
        totalViews: 1250,
        totalInquiries: 89,
        totalRevenue: 2500000000,
        monthlyRevenue: 450000000,
        pendingTransactions: 3
      },
      recentActivities: [
        {
          id: '1',
          type: 'car_added',
          title: 'Mobil Baru Ditambahkan',
          description: 'Toyota Avanza 2023 berhasil ditambahkan ke katalog',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          icon: 'car',
          color: 'success'
        },
        {
          id: '2',
          type: 'inquiry_received',
          title: 'Pertanyaan Baru',
          description: 'Ahmad bertanya tentang Honda Civic 2022',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          icon: 'message',
          color: 'primary'
        }
      ],
      popularCars: [
        {
          id: '1',
          brand: 'Toyota',
          model: 'Avanza',
          year: 2023,
          price: 250000000,
          image: '/images/cars/avanza.jpg',
          views: 156,
          inquiries: 12
        }
      ],
      profileCompletion: this.calculateProfileCompletion(),
      trustScore: this.calculateTrustScore()
    };
  }

  // Format currency to Indonesian Rupiah
  public formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Format number with Indonesian locale
  public formatNumber(number: number): string {
    return new Intl.NumberFormat('id-ID').format(number);
  }

  // Get relative time string
  public getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Baru saja';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} menit yang lalu`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} jam yang lalu`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} hari yang lalu`;
    }
  }
}

export default KontrollerDashboard;