import React, { useState, useEffect, useRef } from 'react';
import './HalamanChatAdmin.css';

// Interface untuk Chat
interface Chat {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  subject: string;
  status: 'active' | 'waiting' | 'resolved' | 'transferred';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'sales' | 'billing' | 'general';
  createdAt: Date;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  assignedTo?: string;
  messages: Message[];
  customerInfo: CustomerInfo;
}

// Interface untuk Message
interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderType: 'customer' | 'admin';
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file' | 'system';
  attachments?: Attachment[];
  isRead: boolean;
}

// Interface untuk Attachment
interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

// Interface untuk Customer Info
interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  joinDate: Date;
  totalChats: number;
  lastActive: Date;
  location?: string;
  timezone?: string;
}

// Interface untuk Filter Options
interface FilterOptions {
  status: string;
  priority: string;
  category: string;
  assignedTo: string;
  dateRange: string;
}

// Interface untuk Admin
interface Admin {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  activeChats: number;
  maxChats: number;
}

// Interface untuk Status Halaman
interface StatusHalaman {
  isLoading: boolean;
  error: string | null;
  success: string | null;
  selectedChatId: string | null;
  showTransferModal: boolean;
  showCustomerInfo: boolean;
  isTyping: boolean;
  onlineUsers: number;
}

const HalamanChatAdmin: React.FC = () => {
  // State management
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    priority: 'all',
    category: 'all',
    assignedTo: 'all',
    dateRange: 'today'
  });
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentAdmin] = useState<Admin>({
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@mobilindo.com',
    status: 'online',
    activeChats: 3,
    maxChats: 10
  });
  const [status, setStatus] = useState<StatusHalaman>({
    isLoading: false,
    error: null,
    success: null,
    selectedChatId: null,
    showTransferModal: false,
    showCustomerInfo: false,
    isTyping: false,
    onlineUsers: 0
  });
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate mock data
  const generateMockChats = (): Chat[] => {
    const mockChats: Chat[] = [];
    const statuses: Chat['status'][] = ['active', 'waiting', 'resolved', 'transferred'];
    const priorities: Chat['priority'][] = ['low', 'medium', 'high', 'urgent'];
    const categories: Chat['category'][] = ['technical', 'sales', 'billing', 'general'];
    
    for (let i = 1; i <= 15; i++) {
      const chat: Chat = {
        id: `chat-${i}`,
        customerName: `Customer ${i}`,
        customerEmail: `customer${i}@email.com`,
        customerAvatar: `https://ui-avatars.com/api/?name=Customer+${i}&background=random`,
        subject: `Chat Subject ${i}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        lastMessage: `Last message from chat ${i}`,
        lastMessageTime: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        unreadCount: Math.floor(Math.random() * 5),
        assignedTo: Math.random() > 0.5 ? 'admin-1' : undefined,
        messages: generateMockMessages(`chat-${i}`),
        customerInfo: {
          id: `customer-${i}`,
          name: `Customer ${i}`,
          email: `customer${i}@email.com`,
          phone: `+62812345678${i}`,
          joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          totalChats: Math.floor(Math.random() * 20) + 1,
          lastActive: new Date(Date.now() - Math.random() * 60 * 60 * 1000),
          location: 'Jakarta, Indonesia',
          timezone: 'Asia/Jakarta'
        }
      };
      mockChats.push(chat);
    }
    return mockChats;
  };

  const generateMockMessages = (chatId: string): Message[] => {
    const messages: Message[] = [];
    const messageCount = Math.floor(Math.random() * 10) + 5;
    
    for (let i = 1; i <= messageCount; i++) {
      const isCustomer = Math.random() > 0.5;
      const message: Message = {
        id: `message-${chatId}-${i}`,
        chatId,
        senderId: isCustomer ? 'customer-1' : 'admin-1',
        senderName: isCustomer ? 'Customer' : 'Admin',
        senderType: isCustomer ? 'customer' : 'admin',
        content: `Message content ${i} for ${chatId}`,
        timestamp: new Date(Date.now() - (messageCount - i) * 60 * 1000),
        type: 'text',
        isRead: Math.random() > 0.3
      };
      messages.push(message);
    }
    return messages;
  };

  const generateMockAdmins = (): Admin[] => {
    return [
      {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@mobilindo.com',
        status: 'online',
        activeChats: 3,
        maxChats: 10
      },
      {
        id: 'admin-2',
        name: 'Support Manager',
        email: 'manager@mobilindo.com',
        status: 'online',
        activeChats: 5,
        maxChats: 15
      },
      {
        id: 'admin-3',
        name: 'Technical Support',
        email: 'tech@mobilindo.com',
        status: 'away',
        activeChats: 2,
        maxChats: 8
      }
    ];
  };

  // Load initial data
  useEffect(() => {
    setStatus(prev => ({ ...prev, isLoading: true }));
    
    setTimeout(() => {
      setChats(generateMockChats());
      setAdmins(generateMockAdmins());
      setStatus(prev => ({ 
        ...prev, 
        isLoading: false,
        onlineUsers: Math.floor(Math.random() * 50) + 10
      }));
    }, 1000);
  }, []);

  // Auto scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Method: pilihFilterStatus
  const pilihFilterStatus = (filterType: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Method: pilihChatTertentu
  const pilihChatTertentu = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setSelectedChat(chat);
      setStatus(prev => ({ ...prev, selectedChatId: chatId }));
      
      // Mark messages as read
      const updatedChats = chats.map(c => 
        c.id === chatId 
          ? { ...c, unreadCount: 0, messages: c.messages.map(m => ({ ...m, isRead: true })) }
          : c
      );
      setChats(updatedChats);
    }
  };

  // Method: tulisBalasanLiveSupport
  const tulisBalasanLiveSupport = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    setStatus(prev => ({ ...prev, isTyping: true }));

    try {
      const message: Message = {
        id: `message-${Date.now()}`,
        chatId: selectedChat.id,
        senderId: currentAdmin.id,
        senderName: currentAdmin.name,
        senderType: 'admin',
        content: newMessage.trim(),
        timestamp: new Date(),
        type: 'text',
        isRead: true
      };

      // Update selected chat
      const updatedChat = {
        ...selectedChat,
        messages: [...selectedChat.messages, message],
        lastMessage: newMessage.trim(),
        lastMessageTime: new Date()
      };

      setSelectedChat(updatedChat);

      // Update chats list
      const updatedChats = chats.map(c => 
        c.id === selectedChat.id ? updatedChat : c
      );
      setChats(updatedChats);

      setNewMessage('');
      setStatus(prev => ({ 
        ...prev, 
        success: 'Pesan berhasil dikirim',
        isTyping: false 
      }));

      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: null }));
      }, 3000);

    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        error: 'Gagal mengirim pesan',
        isTyping: false 
      }));
      setTimeout(() => {
        setStatus(prev => ({ ...prev, error: null }));
      }, 3000);
    }
  };

  // Method: tandaiChatSelesai
  const tandaiChatSelesai = async (chatId: string) => {
    setStatus(prev => ({ ...prev, isLoading: true }));

    try {
      const updatedChats = chats.map(chat => 
        chat.id === chatId 
          ? { ...chat, status: 'resolved' as const }
          : chat
      );
      
      setChats(updatedChats);
      
      if (selectedChat?.id === chatId) {
        setSelectedChat(prev => prev ? { ...prev, status: 'resolved' } : null);
      }

      setStatus(prev => ({ 
        ...prev, 
        isLoading: false,
        success: 'Chat berhasil ditandai selesai' 
      }));

      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: null }));
      }, 3000);

    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Gagal menandai chat selesai' 
      }));
      setTimeout(() => {
        setStatus(prev => ({ ...prev, error: null }));
      }, 3000);
    }
  };

  // Method: tungguBalasanUser
  const tungguBalasanUser = async (chatId: string) => {
    setStatus(prev => ({ ...prev, isLoading: true }));

    try {
      const updatedChats = chats.map(chat => 
        chat.id === chatId 
          ? { ...chat, status: 'waiting' as const }
          : chat
      );
      
      setChats(updatedChats);
      
      if (selectedChat?.id === chatId) {
        setSelectedChat(prev => prev ? { ...prev, status: 'waiting' } : null);
      }

      setStatus(prev => ({ 
        ...prev, 
        isLoading: false,
        success: 'Chat ditandai menunggu balasan user' 
      }));

      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: null }));
      }, 3000);

    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Gagal mengubah status chat' 
      }));
      setTimeout(() => {
        setStatus(prev => ({ ...prev, error: null }));
      }, 3000);
    }
  };

  // Method: transferKeAdminLain
  const transferKeAdminLain = async (chatId: string, targetAdminId: string) => {
    setStatus(prev => ({ ...prev, isLoading: true }));

    try {
      const targetAdmin = admins.find(a => a.id === targetAdminId);
      if (!targetAdmin) {
        throw new Error('Admin target tidak ditemukan');
      }

      const updatedChats = chats.map(chat => 
        chat.id === chatId 
          ? { 
              ...chat, 
              status: 'transferred' as const,
              assignedTo: targetAdminId 
            }
          : chat
      );
      
      setChats(updatedChats);
      
      if (selectedChat?.id === chatId) {
        setSelectedChat(prev => prev ? { 
          ...prev, 
          status: 'transferred',
          assignedTo: targetAdminId 
        } : null);
      }

      setStatus(prev => ({ 
        ...prev, 
        isLoading: false,
        success: `Chat berhasil ditransfer ke ${targetAdmin.name}`,
        showTransferModal: false
      }));

      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: null }));
      }, 3000);

    } catch (error) {
      setStatus(prev => ({ 
        ...prev, 
        isLoading: false,
        error: 'Gagal mentransfer chat' 
      }));
      setTimeout(() => {
        setStatus(prev => ({ ...prev, error: null }));
      }, 3000);
    }
  };

  // Helper functions
  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getStatusColor = (status: Chat['status']): string => {
    switch (status) {
      case 'active': return 'success';
      case 'waiting': return 'warning';
      case 'resolved': return 'info';
      case 'transferred': return 'secondary';
      default: return 'primary';
    }
  };

  const getPriorityColor = (priority: Chat['priority']): string => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'primary';
    }
  };

  const getCategoryIcon = (category: Chat['category']): string => {
    switch (category) {
      case 'technical': return '🔧';
      case 'sales': return '💰';
      case 'billing': return '📄';
      case 'general': return '💬';
      default: return '❓';
    }
  };

  const getStatusIcon = (status: Admin['status']): string => {
    switch (status) {
      case 'online': return '🟢';
      case 'away': return '🟡';
      case 'busy': return '🔴';
      case 'offline': return '⚫';
      default: return '❓';
    }
  };

  // Filter chats based on current filters
  const filteredChats = chats.filter(chat => {
    if (filters.status !== 'all' && chat.status !== filters.status) return false;
    if (filters.priority !== 'all' && chat.priority !== filters.priority) return false;
    if (filters.category !== 'all' && chat.category !== filters.category) return false;
    if (filters.assignedTo !== 'all' && chat.assignedTo !== filters.assignedTo) return false;
    if (searchQuery && !chat.customerName.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !chat.subject.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Calculate statistics
  const stats = {
    total: chats.length,
    active: chats.filter(c => c.status === 'active').length,
    waiting: chats.filter(c => c.status === 'waiting').length,
    resolved: chats.filter(c => c.status === 'resolved').length,
    unread: chats.reduce((sum, c) => sum + c.unreadCount, 0)
  };

  if (status.isLoading && chats.length === 0) {
    return (
      <div className="halaman-chat-admin">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Memuat data chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="halaman-chat-admin">
      {/* Header */}
      <div className="chat-header">
        <div className="header-left">
          <h1>Live Support Chat</h1>
          <div className="online-indicator">
            <span className="online-dot"></span>
            {status.onlineUsers} pengguna online
          </div>
        </div>
        <div className="header-right">
          <div className="admin-info">
            <img 
              src={currentAdmin.avatar || `https://ui-avatars.com/api/?name=${currentAdmin.name}&background=007bff&color=fff`} 
              alt={currentAdmin.name}
              className="admin-avatar"
            />
            <div className="admin-details">
              <span className="admin-name">{currentAdmin.name}</span>
              <span className="admin-status">
                {getStatusIcon(currentAdmin.status)} {currentAdmin.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {status.error && (
        <div className="alert alert-error">
          <span>⚠️ {status.error}</span>
        </div>
      )}
      {status.success && (
        <div className="alert alert-success">
          <span>✅ {status.success}</span>
        </div>
      )}

      <div className="chat-content">
        {/* Sidebar */}
        <div className="chat-sidebar">
          {/* Statistics */}
          <div className="chat-stats">
            <div className="stat-item">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total Chat</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.active}</span>
              <span className="stat-label">Aktif</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.waiting}</span>
              <span className="stat-label">Menunggu</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.unread}</span>
              <span className="stat-label">Belum Dibaca</span>
            </div>
          </div>

          {/* Filters */}
          <div className="chat-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Cari chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-group">
              <select
                value={filters.status}
                onChange={(e) => pilihFilterStatus('status', e.target.value)}
                className="filter-select"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="waiting">Menunggu</option>
                <option value="resolved">Selesai</option>
                <option value="transferred">Transfer</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => pilihFilterStatus('priority', e.target.value)}
                className="filter-select"
              >
                <option value="all">Semua Prioritas</option>
                <option value="urgent">Urgent</option>
                <option value="high">Tinggi</option>
                <option value="medium">Sedang</option>
                <option value="low">Rendah</option>
              </select>

              <select
                value={filters.category}
                onChange={(e) => pilihFilterStatus('category', e.target.value)}
                className="filter-select"
              >
                <option value="all">Semua Kategori</option>
                <option value="technical">Teknis</option>
                <option value="sales">Penjualan</option>
                <option value="billing">Billing</option>
                <option value="general">Umum</option>
              </select>
            </div>
          </div>

          {/* Chat List */}
          <div className="chat-list">
            {filteredChats.map(chat => (
              <div
                key={chat.id}
                className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                onClick={() => pilihChatTertentu(chat.id)}
              >
                <div className="chat-item-header">
                  <img
                    src={chat.customerAvatar || `https://ui-avatars.com/api/?name=${chat.customerName}&background=random`}
                    alt={chat.customerName}
                    className="customer-avatar"
                  />
                  <div className="chat-item-info">
                    <div className="customer-name">{chat.customerName}</div>
                    <div className="chat-subject">{chat.subject}</div>
                  </div>
                  {chat.unreadCount > 0 && (
                    <div className="unread-badge">{chat.unreadCount}</div>
                  )}
                </div>
                <div className="chat-item-meta">
                  <div className="chat-badges">
                    <span className={`badge badge-${getStatusColor(chat.status)}`}>
                      {chat.status}
                    </span>
                    <span className={`badge badge-${getPriorityColor(chat.priority)}`}>
                      {chat.priority}
                    </span>
                    <span className="category-icon">
                      {getCategoryIcon(chat.category)}
                    </span>
                  </div>
                  <div className="last-message-time">
                    {formatTime(chat.lastMessageTime)}
                  </div>
                </div>
                <div className="last-message">
                  {chat.lastMessage}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-main">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="chat-main-header">
                <div className="chat-customer-info">
                  <img
                    src={selectedChat.customerAvatar || `https://ui-avatars.com/api/?name=${selectedChat.customerName}&background=random`}
                    alt={selectedChat.customerName}
                    className="customer-avatar"
                  />
                  <div className="customer-details">
                    <h3>{selectedChat.customerName}</h3>
                    <p>{selectedChat.subject}</p>
                    <div className="chat-meta">
                      <span className={`badge badge-${getStatusColor(selectedChat.status)}`}>
                        {selectedChat.status}
                      </span>
                      <span className={`badge badge-${getPriorityColor(selectedChat.priority)}`}>
                        {selectedChat.priority}
                      </span>
                      <span className="category-badge">
                        {getCategoryIcon(selectedChat.category)} {selectedChat.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="chat-actions">
                  <button
                    onClick={() => setStatus(prev => ({ ...prev, showCustomerInfo: true }))}
                    className="btn btn-secondary"
                  >
                    Info Customer
                  </button>
                  <button
                    onClick={() => tungguBalasanUser(selectedChat.id)}
                    className="btn btn-warning"
                    disabled={selectedChat.status === 'waiting'}
                  >
                    Tunggu Balasan
                  </button>
                  <button
                    onClick={() => setStatus(prev => ({ ...prev, showTransferModal: true }))}
                    className="btn btn-info"
                  >
                    Transfer
                  </button>
                  <button
                    onClick={() => tandaiChatSelesai(selectedChat.id)}
                    className="btn btn-success"
                    disabled={selectedChat.status === 'resolved'}
                  >
                    Selesai
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {selectedChat.messages.map(message => (
                  <div
                    key={message.id}
                    className={`message ${message.senderType === 'admin' ? 'message-admin' : 'message-customer'}`}
                  >
                    <div className="message-content">
                      <div className="message-text">{message.content}</div>
                      <div className="message-time">
                        {formatTime(message.timestamp)}
                        {message.senderType === 'admin' && (
                          <span className={`message-status ${message.isRead ? 'read' : 'sent'}`}>
                            {message.isRead ? '✓✓' : '✓'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="chat-input">
                <div className="input-container">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ketik pesan..."
                    className="message-textarea"
                    rows={3}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        tulisBalasanLiveSupport();
                      }
                    }}
                  />
                  <div className="input-actions">
                    <button
                      onClick={tulisBalasanLiveSupport}
                      disabled={!newMessage.trim() || status.isTyping}
                      className="btn btn-primary send-btn"
                    >
                      {status.isTyping ? 'Mengirim...' : 'Kirim'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="no-chat-content">
                <h3>Pilih chat untuk memulai</h3>
                <p>Pilih salah satu chat dari daftar untuk mulai berkomunikasi dengan customer</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transfer Modal */}
      {status.showTransferModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Transfer Chat</h3>
              <button
                onClick={() => setStatus(prev => ({ ...prev, showTransferModal: false }))}
                className="btn btn-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>Transfer chat ini ke admin lain:</p>
              <div className="admin-list">
                {admins.filter(admin => admin.id !== currentAdmin.id).map(admin => (
                  <div
                    key={admin.id}
                    className="admin-item"
                    onClick={() => selectedChat && transferKeAdminLain(selectedChat.id, admin.id)}
                  >
                    <img
                      src={admin.avatar || `https://ui-avatars.com/api/?name=${admin.name}&background=007bff&color=fff`}
                      alt={admin.name}
                      className="admin-avatar"
                    />
                    <div className="admin-info">
                      <div className="admin-name">{admin.name}</div>
                      <div className="admin-status">
                        {getStatusIcon(admin.status)} {admin.status}
                      </div>
                      <div className="admin-workload">
                        {admin.activeChats}/{admin.maxChats} chats
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Info Modal */}
      {status.showCustomerInfo && selectedChat && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Informasi Customer</h3>
              <button
                onClick={() => setStatus(prev => ({ ...prev, showCustomerInfo: false }))}
                className="btn btn-close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="customer-info-detail">
                <img
                  src={selectedChat.customerInfo.avatar || `https://ui-avatars.com/api/?name=${selectedChat.customerInfo.name}&background=random`}
                  alt={selectedChat.customerInfo.name}
                  className="customer-avatar-large"
                />
                <div className="customer-details">
                  <h4>{selectedChat.customerInfo.name}</h4>
                  <p><strong>Email:</strong> {selectedChat.customerInfo.email}</p>
                  <p><strong>Telepon:</strong> {selectedChat.customerInfo.phone}</p>
                  <p><strong>Bergabung:</strong> {formatDate(selectedChat.customerInfo.joinDate)}</p>
                  <p><strong>Total Chat:</strong> {selectedChat.customerInfo.totalChats}</p>
                  <p><strong>Terakhir Aktif:</strong> {formatTime(selectedChat.customerInfo.lastActive)}</p>
                  <p><strong>Lokasi:</strong> {selectedChat.customerInfo.location}</p>
                  <p><strong>Timezone:</strong> {selectedChat.customerInfo.timezone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalamanChatAdmin;