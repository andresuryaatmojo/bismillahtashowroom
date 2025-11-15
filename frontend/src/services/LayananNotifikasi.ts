// LayananNotifikasi.ts - Service untuk mengelola notifikasi in-app

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export interface InAppNotification {
  id: string;
  userId: string;
  type: 'in_app';
  title: string;
  message: string;
  category: 'system' | 'promotion' | 'reminder' | 'alert' | 'update';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
}

export interface NotificationResponse {
  notifications: InAppNotification[];
  unreadCount: number;
  totalCount: number;
}

export class LayananNotifikasi {
  private static async fetchAPI(
    endpoint: string,
    options?: RequestInit
  ): Promise<any> {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Mengambil semua notifikasi untuk user yang sedang login
   */
  static async getNotifikasi(params?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  }): Promise<NotificationResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.unreadOnly) queryParams.append('unreadOnly', 'true');

      const response = await this.fetchAPI(`/api/notifikasi?${queryParams.toString()}`);
      return response;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Return empty data on error
      return {
        notifications: [],
        unreadCount: 0,
        totalCount: 0
      };
    }
  }

  /**
   * Mengambil jumlah notifikasi yang belum dibaca
   */
  static async getUnreadCount(): Promise<number> {
    try {
      const response = await this.fetchAPI('/api/notifikasi/unread-count');
      return response.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Menandai notifikasi sebagai sudah dibaca
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      await this.fetchAPI(`/api/notifikasi/${notificationId}/read`, {
        method: 'PUT',
      });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Menandai semua notifikasi sebagai sudah dibaca
   */
  static async markAllAsRead(): Promise<boolean> {
    try {
      await this.fetchAPI('/api/notifikasi/read-all', {
        method: 'PUT',
      });
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  /**
   * Menghapus notifikasi
   */
  static async deleteNotifikasi(notificationId: string): Promise<boolean> {
    try {
      await this.fetchAPI(`/api/notifikasi/${notificationId}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Menghapus semua notifikasi yang sudah dibaca
   */
  static async deleteAllRead(): Promise<boolean> {
    try {
      await this.fetchAPI('/api/notifikasi/read', {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      return false;
    }
  }

  /**
   * Mock data untuk development/testing
   * Hapus method ini jika API backend sudah siap
   */
  static async getMockNotifikasi(): Promise<NotificationResponse> {
    // Simulasi delay API
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockNotifications: InAppNotification[] = [
      {
        id: '1',
        userId: 'user123',
        type: 'in_app',
        title: 'Selamat Datang!',
        message: 'Terima kasih telah bergabung dengan Mobilindo Showroom',
        category: 'system',
        priority: 'medium',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: '2',
        userId: 'user123',
        type: 'in_app',
        title: 'Promo Spesial!',
        message: 'Diskon hingga 50jt untuk pembelian mobil Honda CR-V',
        category: 'promotion',
        priority: 'high',
        actionUrl: '/katalog/honda-crv',
        actionText: 'Lihat Detail',
        isRead: false,
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
      },
      {
        id: '3',
        userId: 'user123',
        type: 'in_app',
        title: 'Pengingat Test Drive',
        message: 'Jadwal test drive Anda untuk Toyota Avanza besok pukul 10:00',
        category: 'reminder',
        priority: 'urgent',
        actionUrl: '/riwayat-test-drive',
        actionText: 'Lihat Jadwal',
        isRead: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        id: '4',
        userId: 'user123',
        type: 'in_app',
        title: 'Mobil Favorit Anda Tersedia',
        message: 'Mitsubishi Xpander yang ada di wishlist Anda sekarang tersedia',
        category: 'alert',
        priority: 'medium',
        actionUrl: '/wishlist',
        actionText: 'Lihat Wishlist',
        isRead: true,
        readAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        id: '5',
        userId: 'user123',
        type: 'in_app',
        title: 'Update Aplikasi',
        message: 'Fitur baru: Bandingkan hingga 5 mobil sekaligus!',
        category: 'update',
        priority: 'low',
        actionUrl: '/perbandingan',
        actionText: 'Coba Sekarang',
        isRead: true,
        readAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      }
    ];

    const unreadNotifications = mockNotifications.filter(n => !n.isRead);

    return {
      notifications: mockNotifications,
      unreadCount: unreadNotifications.length,
      totalCount: mockNotifications.length
    };
  }
}

export default LayananNotifikasi;
