import axios from 'axios';
import KontrollerAuth from './KontrollerAuth';

// Base URL untuk API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';

// Interface untuk pesan chat
export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  message: string;
  messageType: 'text' | 'image' | 'file' | 'location' | 'contact' | 'system';
  attachments?: ChatAttachment[];
  replyTo?: string;
  isRead: boolean;
  isDelivered: boolean;
  timestamp: Date;
  editedAt?: Date;
  deletedAt?: Date;
  metadata?: {
    carId?: string;
    offerId?: string;
    appointmentId?: string;
    [key: string]: any;
  };
}

// Interface untuk attachment chat
export interface ChatAttachment {
  id: string;
  type: 'image' | 'document' | 'video' | 'audio';
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  thumbnail?: string;
}

// Interface untuk chat room
export interface ChatRoom {
  id: string;
  carId: string;
  buyerId: string;
  sellerId: string;
  status: 'active' | 'closed' | 'archived';
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  participants: ChatParticipant[];
  carInfo: {
    id: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    images: string[];
  };
}

// Interface untuk participant chat
export interface ChatParticipant {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  role: 'buyer' | 'seller' | 'admin';
  isOnline: boolean;
  lastSeen: Date;
  joinedAt: Date;
}

// Interface untuk typing indicator
export interface TypingIndicator {
  chatId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

// Interface untuk chat context
export interface ChatContext {
  chatRoom: ChatRoom;
  messages: ChatMessage[];
  participants: ChatParticipant[];
  hasMoreMessages: boolean;
  isLoading: boolean;
}

// Interface untuk status keputusan
export interface StatusKeputusan {
  chatId: string;
  hasDecision: boolean;
  decision?: {
    type: 'offer' | 'counter_offer' | 'accept' | 'reject' | 'negotiate';
    amount?: number;
    terms?: string;
    expiryDate?: Date;
    status: 'pending' | 'accepted' | 'rejected' | 'expired';
    createdBy: string;
    createdAt: Date;
  };
}

class KontrollerChat {
  private static instance: KontrollerChat;
  private authController: KontrollerAuth;
  private websocket: WebSocket | null = null;
  private messageListeners: Map<string, (message: ChatMessage) => void> = new Map();
  private typingListeners: Map<string, (typing: TypingIndicator) => void> = new Map();
  private statusListeners: Map<string, (status: any) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  private constructor() {
    this.authController = KontrollerAuth.getInstance();
  }

  public static getInstance(): KontrollerChat {
    if (!KontrollerChat.instance) {
      KontrollerChat.instance = new KontrollerChat();
    }
    return KontrollerChat.instance;
  }

  // Get authorization headers
  private getAuthHeaders() {
    const token = this.authController.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Inisialisasi chat untuk mobil dan penjual tertentu
  public async inisialisasiChat(idMobil: string, idPenjual: string): Promise<ChatRoom | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        throw new Error('User must be logged in to initialize chat');
      }

      const currentUser = this.authController.getCurrentUser();
      if (!currentUser) {
        throw new Error('Current user not found');
      }

      const response = await axios.post(`${API_BASE_URL}/chat/initialize`, {
        carId: idMobil,
        sellerId: idPenjual,
        buyerId: currentUser.id
      }, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        const chatRoom = response.data.data;
        
        // Initialize WebSocket connection for this chat
        this.connectWebSocket(chatRoom.id);
        
        return chatRoom;
      }

      return null;
    } catch (error: any) {
      console.error('Inisialisasi chat error:', error);
      
      // Return mock chat room for development
      return this.getMockChatRoom(idMobil, idPenjual);
    }
  }

  // Identifikasi penerima berdasarkan ID mobil
  public async identifikasiPenerima(idMobil: string): Promise<{ sellerId: string; sellerInfo: any } | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/cars/${idMobil}/seller`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return {
          sellerId: response.data.data.sellerId,
          sellerInfo: response.data.data.sellerInfo
        };
      }

      return null;
    } catch (error: any) {
      console.error('Identifikasi penerima error:', error);
      
      // Return mock seller info for development
      return {
        sellerId: 'seller-' + idMobil,
        sellerInfo: {
          id: 'seller-' + idMobil,
          name: 'John Doe',
          avatar: '/images/avatars/seller.jpg',
          rating: 4.8,
          responseTime: '< 1 jam',
          isOnline: true
        }
      };
    }
  }

  // Muat interface chat (get chat rooms list)
  public async muatInterfaceChat(): Promise<ChatRoom[]> {
    try {
      if (!this.authController.isAuthenticated()) {
        return [];
      }

      const response = await axios.get(`${API_BASE_URL}/chat/rooms`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return [];
    } catch (error: any) {
      console.error('Muat interface chat error:', error);
      
      // Return mock chat rooms for development
      return this.getMockChatRooms();
    }
  }

  // Muat konteks chat (messages and participants)
  public async muatKonteksChat(idChat: string, page: number = 1, limit: number = 50): Promise<ChatContext | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/${idChat}/context?page=${page}&limit=${limit}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        const context = response.data.data;
        
        // Connect to WebSocket for real-time updates
        this.connectWebSocket(idChat);
        
        return context;
      }

      return null;
    } catch (error: any) {
      console.error('Muat konteks chat error:', error);
      
      // Return mock chat context for development
      return this.getMockChatContext(idChat);
    }
  }

  // Cek status keputusan dalam chat
  public async cekStatusKeputusan(idChat: string): Promise<StatusKeputusan | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/${idChat}/decision-status`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Cek status keputusan error:', error);
      
      // Return mock decision status for development
      return {
        chatId: idChat,
        hasDecision: false
      };
    }
  }

  // Send message
  public async sendMessage(
    chatId: string,
    message: string,
    messageType: 'text' | 'image' | 'file' = 'text',
    attachments?: File[],
    replyTo?: string
  ): Promise<ChatMessage | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        throw new Error('User must be logged in to send message');
      }

      const formData = new FormData();
      formData.append('message', message);
      formData.append('messageType', messageType);
      
      if (replyTo) {
        formData.append('replyTo', replyTo);
      }

      if (attachments && attachments.length > 0) {
        attachments.forEach((file, index) => {
          formData.append(`attachments[${index}]`, file);
        });
      }

      const response = await axios.post(`${API_BASE_URL}/chat/${chatId}/messages`, formData, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Send message error:', error);
      return null;
    }
  }

  // Mark messages as read
  public async markAsRead(chatId: string, messageIds: string[]): Promise<boolean> {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat/${chatId}/read`, {
        messageIds
      }, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Mark as read error:', error);
      return false;
    }
  }

  // Send typing indicator
  public sendTypingIndicator(chatId: string, isTyping: boolean): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({
        type: 'typing',
        chatId,
        isTyping
      }));
    }
  }

  // WebSocket connection management
  private connectWebSocket(chatId: string): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      return;
    }

    const token = this.authController.getAccessToken();
    if (!token) {
      console.error('No access token available for WebSocket connection');
      return;
    }

    try {
      this.websocket = new WebSocket(`${WS_BASE_URL}/chat?token=${token}&chatId=${chatId}`);

      this.websocket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.websocket.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect(chatId);
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  private handleWebSocketMessage(data: any): void {
    switch (data.type) {
      case 'message':
        this.messageListeners.forEach(listener => listener(data.message));
        break;
      case 'typing':
        this.typingListeners.forEach(listener => listener(data.typing));
        break;
      case 'status':
        this.statusListeners.forEach(listener => listener(data.status));
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  private attemptReconnect(chatId: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connectWebSocket(chatId);
      }, delay);
    }
  }

  // Event listeners
  public onMessage(callback: (message: ChatMessage) => void): string {
    const id = Date.now().toString();
    this.messageListeners.set(id, callback);
    return id;
  }

  public onTyping(callback: (typing: TypingIndicator) => void): string {
    const id = Date.now().toString();
    this.typingListeners.set(id, callback);
    return id;
  }

  public onStatus(callback: (status: any) => void): string {
    const id = Date.now().toString();
    this.statusListeners.set(id, callback);
    return id;
  }

  public removeListener(id: string): void {
    this.messageListeners.delete(id);
    this.typingListeners.delete(id);
    this.statusListeners.delete(id);
  }

  // Close chat
  public async closeChat(chatId: string): Promise<boolean> {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat/${chatId}/close`, {}, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Close chat error:', error);
      return false;
    }
  }

  // Archive chat
  public async archiveChat(chatId: string): Promise<boolean> {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat/${chatId}/archive`, {}, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Archive chat error:', error);
      return false;
    }
  }

  // Delete message
  public async deleteMessage(chatId: string, messageId: string): Promise<boolean> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/chat/${chatId}/messages/${messageId}`, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Delete message error:', error);
      return false;
    }
  }

  // Edit message
  public async editMessage(chatId: string, messageId: string, newMessage: string): Promise<boolean> {
    try {
      const response = await axios.put(`${API_BASE_URL}/chat/${chatId}/messages/${messageId}`, {
        message: newMessage
      }, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Edit message error:', error);
      return false;
    }
  }

  // Disconnect WebSocket
  public disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    this.messageListeners.clear();
    this.typingListeners.clear();
    this.statusListeners.clear();
  }

  // Format timestamp
  public formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes} menit yang lalu`;
    if (hours < 24) return `${hours} jam yang lalu`;
    if (days < 7) return `${days} hari yang lalu`;
    
    return timestamp.toLocaleDateString('id-ID');
  }

  // Mock data for development
  private getMockChatRoom(idMobil: string, idPenjual: string): ChatRoom {
    return {
      id: 'chat-' + Date.now(),
      carId: idMobil,
      buyerId: 'current-user',
      sellerId: idPenjual,
      status: 'active',
      unreadCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      participants: [
        {
          id: '1',
          userId: 'current-user',
          name: 'You',
          role: 'buyer',
          isOnline: true,
          lastSeen: new Date(),
          joinedAt: new Date()
        },
        {
          id: '2',
          userId: idPenjual,
          name: 'John Doe',
          avatar: '/images/avatars/seller.jpg',
          role: 'seller',
          isOnline: true,
          lastSeen: new Date(),
          joinedAt: new Date()
        }
      ],
      carInfo: {
        id: idMobil,
        brand: 'Toyota',
        model: 'Avanza',
        year: 2023,
        price: 250000000,
        images: ['/images/cars/avanza-1.jpg']
      }
    };
  }

  private getMockChatRooms(): ChatRoom[] {
    return [
      {
        id: 'chat-1',
        carId: 'car-1',
        buyerId: 'current-user',
        sellerId: 'seller-1',
        status: 'active',
        unreadCount: 2,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
        participants: [],
        carInfo: {
          id: 'car-1',
          brand: 'Toyota',
          model: 'Avanza',
          year: 2023,
          price: 250000000,
          images: ['/images/cars/avanza-1.jpg']
        },
        lastMessage: {
          id: 'msg-1',
          chatId: 'chat-1',
          senderId: 'seller-1',
          receiverId: 'current-user',
          message: 'Halo, apakah masih berminat dengan mobil ini?',
          messageType: 'text',
          isRead: false,
          isDelivered: true,
          timestamp: new Date()
        }
      }
    ];
  }

  private getMockChatContext(idChat: string): ChatContext {
    return {
      chatRoom: this.getMockChatRooms()[0],
      messages: [
        {
          id: 'msg-1',
          chatId: idChat,
          senderId: 'seller-1',
          receiverId: 'current-user',
          message: 'Halo, apakah masih berminat dengan mobil ini?',
          messageType: 'text',
          isRead: false,
          isDelivered: true,
          timestamp: new Date(Date.now() - 3600000)
        },
        {
          id: 'msg-2',
          chatId: idChat,
          senderId: 'current-user',
          receiverId: 'seller-1',
          message: 'Ya, saya tertarik. Bisa nego harga?',
          messageType: 'text',
          isRead: true,
          isDelivered: true,
          timestamp: new Date(Date.now() - 1800000)
        }
      ],
      participants: [
        {
          id: '1',
          userId: 'current-user',
          name: 'You',
          role: 'buyer',
          isOnline: true,
          lastSeen: new Date(),
          joinedAt: new Date()
        },
        {
          id: '2',
          userId: 'seller-1',
          name: 'John Doe',
          avatar: '/images/avatars/seller.jpg',
          role: 'seller',
          isOnline: true,
          lastSeen: new Date(),
          joinedAt: new Date()
        }
      ],
      hasMoreMessages: false,
      isLoading: false
    };
  }
}

export default KontrollerChat;