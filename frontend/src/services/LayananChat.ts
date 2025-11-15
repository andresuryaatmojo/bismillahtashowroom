// LayananChat.ts - Service untuk mengelola pesan/chat

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  message: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface UnreadMessagesResponse {
  unreadCount: number;
  conversations: {
    conversationId: string;
    lastMessage: string;
    unreadCount: number;
    lastMessageAt: Date;
  }[];
}

export class LayananChat {
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
   * Mengambil jumlah pesan yang belum dibaca
   */
  static async getUnreadCount(): Promise<number> {
    try {
      const response = await this.fetchAPI('/api/chat/unread-count');
      return response.count || 0;
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
      return 0;
    }
  }

  /**
   * Mengambil detail pesan yang belum dibaca per conversation
   */
  static async getUnreadMessages(): Promise<UnreadMessagesResponse> {
    try {
      const response = await this.fetchAPI('/api/chat/unread');
      return response;
    } catch (error) {
      console.error('Error fetching unread messages:', error);
      return {
        unreadCount: 0,
        conversations: []
      };
    }
  }

  /**
   * Menandai pesan sebagai sudah dibaca
   */
  static async markAsRead(conversationId: string): Promise<boolean> {
    try {
      await this.fetchAPI(`/api/chat/${conversationId}/read`, {
        method: 'PUT',
      });
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }

  /**
   * Mock data untuk development/testing
   * Hapus method ini jika API backend sudah siap
   */
  static async getMockUnreadCount(): Promise<number> {
    // Simulasi delay API
    await new Promise(resolve => setTimeout(resolve, 300));

    // Menggunakan localStorage untuk simulasi count yang persisten
    // Anda bisa set nilai ini di console browser dengan:
    // localStorage.setItem('mockUnreadMessages', '5')
    const mockCount = localStorage.getItem('mockUnreadMessages');
    return mockCount ? parseInt(mockCount, 10) : 0;
  }

  /**
   * Mock data untuk development/testing - detail unread messages
   */
  static async getMockUnreadMessages(): Promise<UnreadMessagesResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      unreadCount: 3,
      conversations: [
        {
          conversationId: 'conv1',
          lastMessage: 'Apakah mobil Honda CR-V masih tersedia?',
          unreadCount: 2,
          lastMessageAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        },
        {
          conversationId: 'conv2',
          lastMessage: 'Terima kasih atas informasinya',
          unreadCount: 1,
          lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        }
      ]
    };
  }
}

export default LayananChat;
