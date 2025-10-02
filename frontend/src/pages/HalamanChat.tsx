import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, Paperclip, Smile, Search, ArrowLeft, User, MessageSquare, Clock, Check, CheckCheck, X, Plus, Image, File } from 'lucide-react';

// Interfaces
interface Pesan {
  id: string;
  pengirimId: string;
  penerimaId: string;
  isiPesan: string;
  tipePesan: 'text' | 'image' | 'file' | 'system';
  waktuKirim: string;
  statusBaca: 'sent' | 'delivered' | 'read';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyTo?: string;
}

interface Kontak {
  id: string;
  nama: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: string;
  role: 'customer' | 'dealer' | 'admin';
  isTyping: boolean;
}

interface ChatRoom {
  id: string;
  nama: string;
  avatar: string;
  pesanTerakhir: Pesan | null;
  jumlahPesanBelumBaca: number;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

interface StateHalaman {
  loading: boolean;
  error: string | null;
  activeChat: ChatRoom | null;
  chatList: ChatRoom[];
  pesanList: Pesan[];
  kontakList: Kontak[];
  currentUser: Kontak;
  pesanBaru: string;
  isTyping: boolean;
  showEmojiPicker: boolean;
  showAttachmentMenu: boolean;
  searchQuery: string;
  filteredChats: ChatRoom[];
  selectedMessages: string[];
  showChatInfo: boolean;
  uploadProgress: number;
  isUploading: boolean;
  replyingTo: Pesan | null;
}

const HalamanChat: React.FC = () => {
  const [state, setState] = useState<StateHalaman>({
    loading: false,
    error: null,
    activeChat: null,
    chatList: [],
    pesanList: [],
    kontakList: [],
    currentUser: {
      id: 'user_001',
      nama: 'John Doe',
      avatar: '/images/avatars/user.jpg',
      status: 'online',
      lastSeen: new Date().toISOString(),
      role: 'customer',
      isTyping: false
    },
    pesanBaru: '',
    isTyping: false,
    showEmojiPicker: false,
    showAttachmentMenu: false,
    searchQuery: '',
    filteredChats: [],
    selectedMessages: [],
    showChatInfo: false,
    uploadProgress: 0,
    isUploading: false,
    replyingTo: null
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Method: bukaInterfaceChat
  const bukaInterfaceChat = async (idPenerima: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Find existing chat room or create new one
      let chatRoom = state.chatList.find(chat => 
        chat.participants.includes(idPenerima) && 
        chat.participants.includes(state.currentUser.id)
      );
      
      if (!chatRoom) {
        // Create new chat room
        const penerima = state.kontakList.find(k => k.id === idPenerima) || {
          id: idPenerima,
          nama: 'Dealer Support',
          avatar: '/images/avatars/dealer.jpg',
          status: 'online' as const,
          lastSeen: new Date().toISOString(),
          role: 'dealer' as const,
          isTyping: false
        };
        
        chatRoom = {
          id: `chat_${Date.now()}`,
          nama: penerima.nama,
          avatar: penerima.avatar,
          pesanTerakhir: null,
          jumlahPesanBelumBaca: 0,
          participants: [state.currentUser.id, idPenerima],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setState(prev => ({
          ...prev,
          chatList: [chatRoom!, ...prev.chatList],
          kontakList: prev.kontakList.some(k => k.id === idPenerima) 
            ? prev.kontakList 
            : [...prev.kontakList, penerima]
        }));
      }
      
      // Load messages for this chat
      await loadMessages(chatRoom.id);
      
      setState(prev => ({
        ...prev,
        activeChat: chatRoom!,
        loading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Gagal membuka chat',
        loading: false
      }));
    }
  };

  // Method: tulisPesan
  const tulisPesan = (isiPesan: string) => {
    setState(prev => ({ ...prev, pesanBaru: isiPesan }));
    
    // Show typing indicator
    if (!state.isTyping) {
      setState(prev => ({ ...prev, isTyping: true }));
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to hide typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, isTyping: false }));
    }, 1000);
  };

  // Method: kirimPesan
  const kirimPesan = async (isiPesan: string) => {
    if (!isiPesan.trim() || !state.activeChat) return;
    
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const pesanBaru: Pesan = {
        id: `msg_${Date.now()}`,
        pengirimId: state.currentUser.id,
        penerimaId: state.activeChat!.participants.find(p => p !== state.currentUser.id) || '',
        isiPesan: isiPesan.trim(),
        tipePesan: 'text',
        waktuKirim: new Date().toISOString(),
        statusBaca: 'sent',
        replyTo: state.replyingTo?.id
      };
      
      // Add message to list
      setState(prev => ({
        ...prev,
        pesanList: [...prev.pesanList, pesanBaru],
        pesanBaru: '',
        isTyping: false,
        replyingTo: null,
        loading: false
      }));
      
      // Update chat room with last message
      setState(prev => ({
        ...prev,
        chatList: prev.chatList.map(chat =>
          chat.id === state.activeChat!.id
            ? {
                ...chat,
                pesanTerakhir: pesanBaru,
                updatedAt: new Date().toISOString()
              }
            : chat
        )
      }));
      
      // Simulate message delivery
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          pesanList: prev.pesanList.map(msg =>
            msg.id === pesanBaru.id
              ? { ...msg, statusBaca: 'delivered' }
              : msg
          )
        }));
      }, 1000);
      
      // Simulate message read
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          pesanList: prev.pesanList.map(msg =>
            msg.id === pesanBaru.id
              ? { ...msg, statusBaca: 'read' }
              : msg
          )
        }));
      }, 3000);
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Gagal mengirim pesan',
        loading: false
      }));
    }
  };

  // Method: menungguBalasan
  const menungguBalasan = async () => {
    // Simulate waiting for reply with typing indicator from other user
    if (state.activeChat) {
      const otherUserId = state.activeChat.participants.find(p => p !== state.currentUser.id);
      if (otherUserId) {
        setState(prev => ({
          ...prev,
          kontakList: prev.kontakList.map(kontak =>
            kontak.id === otherUserId
              ? { ...kontak, isTyping: true }
              : kontak
          )
        }));
        
        // Simulate reply after 2-5 seconds
        setTimeout(() => {
          const replies = [
            'Terima kasih atas pertanyaannya. Saya akan membantu Anda.',
            'Baik, saya akan cek informasi tersebut untuk Anda.',
            'Mohon tunggu sebentar, saya sedang memproses permintaan Anda.',
            'Apakah ada yang bisa saya bantu lagi?'
          ];
          
          const randomReply = replies[Math.floor(Math.random() * replies.length)];
          
          const balasan: Pesan = {
            id: `msg_${Date.now()}`,
            pengirimId: otherUserId!,
            penerimaId: state.currentUser.id,
            isiPesan: randomReply,
            tipePesan: 'text',
            waktuKirim: new Date().toISOString(),
            statusBaca: 'delivered'
          };
          
          setState(prev => ({
            ...prev,
            pesanList: [...prev.pesanList, balasan],
            kontakList: prev.kontakList.map(kontak =>
              kontak.id === otherUserId
                ? { ...kontak, isTyping: false }
                : kontak
            ),
            chatList: prev.chatList.map(chat =>
              chat.id === state.activeChat!.id
                ? {
                    ...chat,
                    pesanTerakhir: balasan,
                    jumlahPesanBelumBaca: chat.jumlahPesanBelumBaca + 1,
                    updatedAt: new Date().toISOString()
                  }
                : chat
            )
          }));
        }, Math.random() * 3000 + 2000);
      }
    }
  };

  // Method: putuskanLanjutkanChat
  const putuskanLanjutkanChat = (lanjutkan: boolean) => {
    if (lanjutkan) {
      // Continue chat - focus on input
      const inputElement = document.querySelector('input[placeholder="Ketik pesan..."]') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    } else {
      // End chat - show confirmation
      if (window.confirm('Apakah Anda yakin ingin mengakhiri chat ini?')) {
        keluarDariChat();
      }
    }
  };

  // Method: tulisPesanBaru
  const tulisPesanBaru = (isiPesan: string) => {
    tulisPesan(isiPesan);
  };

  // Method: keluarDariChat
  const keluarDariChat = () => {
    setState(prev => ({
      ...prev,
      activeChat: null,
      pesanList: [],
      pesanBaru: '',
      isTyping: false,
      showEmojiPicker: false,
      showAttachmentMenu: false,
      selectedMessages: [],
      showChatInfo: false,
      replyingTo: null
    }));
  };

  // Method: kirimKeUser
  const kirimKeUser = async (pesan: Pesan) => {
    try {
      // Simulate sending message to user
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({
        ...prev,
        pesanList: prev.pesanList.map(msg =>
          msg.id === pesan.id
            ? { ...msg, statusBaca: 'delivered' }
            : msg
        )
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Gagal mengirim pesan ke user'
      }));
    }
  };

  // Helper functions
  const loadMessages = async (chatId: string) => {
    try {
      // Simulate loading messages from API
      const mockMessages: Pesan[] = [
        {
          id: 'msg_001',
          pengirimId: 'dealer_001',
          penerimaId: state.currentUser.id,
          isiPesan: 'Halo! Ada yang bisa saya bantu?',
          tipePesan: 'text',
          waktuKirim: new Date(Date.now() - 3600000).toISOString(),
          statusBaca: 'read'
        },
        {
          id: 'msg_002',
          pengirimId: state.currentUser.id,
          penerimaId: 'dealer_001',
          isiPesan: 'Saya tertarik dengan Toyota Avanza. Bisa minta info lebih detail?',
          tipePesan: 'text',
          waktuKirim: new Date(Date.now() - 3500000).toISOString(),
          statusBaca: 'read'
        }
      ];
      
      setState(prev => ({ ...prev, pesanList: mockMessages }));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Kemarin';
    } else {
      return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered': return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read': return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const handleFileUpload = async (file: File) => {
    setState(prev => ({ ...prev, isUploading: true, uploadProgress: 0 }));
    
    try {
      // Simulate file upload progress
      for (let i = 0; i <= 100; i += 10) {
        setState(prev => ({ ...prev, uploadProgress: i }));
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const fileMessage: Pesan = {
        id: `msg_${Date.now()}`,
        pengirimId: state.currentUser.id,
        penerimaId: state.activeChat!.participants.find(p => p !== state.currentUser.id) || '',
        isiPesan: `File: ${file.name}`,
        tipePesan: file.type.startsWith('image/') ? 'image' : 'file',
        waktuKirim: new Date().toISOString(),
        statusBaca: 'sent',
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        fileSize: file.size
      };
      
      setState(prev => ({
        ...prev,
        pesanList: [...prev.pesanList, fileMessage],
        isUploading: false,
        uploadProgress: 0,
        showAttachmentMenu: false
      }));
      
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Gagal mengupload file',
        isUploading: false,
        uploadProgress: 0
      }));
    }
  };

  const searchChats = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
    
    if (!query.trim()) {
      setState(prev => ({ ...prev, filteredChats: prev.chatList }));
      return;
    }
    
    const filtered = state.chatList.filter(chat =>
      chat.nama.toLowerCase().includes(query.toLowerCase()) ||
      chat.pesanTerakhir?.isiPesan.toLowerCase().includes(query.toLowerCase())
    );
    
    setState(prev => ({ ...prev, filteredChats: filtered }));
  };

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.pesanList]);

  // Load initial data
  useEffect(() => {
    const mockChats: ChatRoom[] = [
      {
        id: 'chat_001',
        nama: 'Toyota Dealer',
        avatar: '/images/avatars/toyota-dealer.jpg',
        pesanTerakhir: {
          id: 'msg_last_001',
          pengirimId: 'dealer_001',
          penerimaId: state.currentUser.id,
          isiPesan: 'Baik, saya akan kirimkan brosur lengkapnya',
          tipePesan: 'text',
          waktuKirim: new Date(Date.now() - 1800000).toISOString(),
          statusBaca: 'delivered'
        },
        jumlahPesanBelumBaca: 2,
        participants: [state.currentUser.id, 'dealer_001'],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: 'chat_002',
        nama: 'Honda Support',
        avatar: '/images/avatars/honda-dealer.jpg',
        pesanTerakhir: {
          id: 'msg_last_002',
          pengirimId: state.currentUser.id,
          penerimaId: 'dealer_002',
          isiPesan: 'Terima kasih atas informasinya',
          tipePesan: 'text',
          waktuKirim: new Date(Date.now() - 7200000).toISOString(),
          statusBaca: 'read'
        },
        jumlahPesanBelumBaca: 0,
        participants: [state.currentUser.id, 'dealer_002'],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString()
      }
    ];
    
    setState(prev => ({
      ...prev,
      chatList: mockChats,
      filteredChats: mockChats
    }));
  }, []);

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Sidebar - Chat List */}
      <div className={`w-80 bg-white border-r border-gray-200 flex flex-col ${state.activeChat ? 'hidden lg:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Chat</h1>
            <button
              onClick={() => {/* Open new chat modal */}}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari chat..."
              value={state.searchQuery}
              onChange={(e) => searchChats(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {state.filteredChats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Belum ada chat</p>
            </div>
          ) : (
            state.filteredChats.map(chat => (
              <div
                key={chat.id}
                onClick={() => bukaInterfaceChat(chat.participants.find(p => p !== state.currentUser.id) || '')}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  state.activeChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={chat.avatar}
                      alt={chat.nama}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/avatars/default.jpg';
                      }}
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">{chat.nama}</h3>
                      <span className="text-xs text-gray-500">
                        {chat.pesanTerakhir && formatTime(chat.pesanTerakhir.waktuKirim)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate">
                        {chat.pesanTerakhir?.isiPesan || 'Belum ada pesan'}
                      </p>
                      {chat.jumlahPesanBelumBaca > 0 && (
                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                          {chat.jumlahPesanBelumBaca}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {state.activeChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={keluarDariChat}
                    className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  
                  <img
                    src={state.activeChat?.avatar || '/images/avatars/default.jpg'}
                    alt={state.activeChat?.nama || 'Avatar'}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/avatars/default.jpg';
                    }}
                  />
                  
                  <div>
                    <h2 className="font-semibold text-gray-900">{state.activeChat?.nama || 'Unknown'}</h2>
                    <p className="text-sm text-gray-500">
                      {state.kontakList.find(k => 
                        state.activeChat!.participants.includes(k.id) && k.id !== state.currentUser.id
                      )?.isTyping ? 'Sedang mengetik...' : 'Online'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Video className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setState(prev => ({ ...prev, showChatInfo: !prev.showChatInfo }))}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {state.pesanList.map(pesan => (
                <div
                  key={pesan.id}
                  className={`flex ${pesan.pengirimId === state.currentUser.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${pesan.pengirimId === state.currentUser.id ? 'order-2' : 'order-1'}`}>
                    {/* Reply indicator */}
                    {pesan.replyTo && (
                      <div className="text-xs text-gray-500 mb-1 px-3">
                        Membalas pesan
                      </div>
                    )}
                    
                    <div
                      className={`rounded-lg p-3 ${
                        pesan.pengirimId === state.currentUser.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      {pesan.tipePesan === 'text' && (
                        <p className="text-sm">{pesan.isiPesan}</p>
                      )}
                      
                      {pesan.tipePesan === 'image' && (
                        <div>
                          <img
                            src={pesan.fileUrl}
                            alt="Shared image"
                            className="rounded-lg max-w-full h-auto mb-2"
                          />
                          {pesan.isiPesan && <p className="text-sm">{pesan.isiPesan}</p>}
                        </div>
                      )}
                      
                      {pesan.tipePesan === 'file' && (
                        <div className="flex items-center space-x-2">
                          <File className="w-6 h-6" />
                          <div>
                            <p className="text-sm font-medium">{pesan.fileName}</p>
                            <p className="text-xs opacity-75">
                              {pesan.fileSize && (pesan.fileSize / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      )}
                      
                      <div className={`flex items-center justify-between mt-1 ${
                        pesan.pengirimId === state.currentUser.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <span className="text-xs">{formatTime(pesan.waktuKirim)}</span>
                        {pesan.pengirimId === state.currentUser.id && (
                          <div className="ml-2">
                            {getStatusIcon(pesan.statusBaca)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {pesan.pengirimId !== state.currentUser.id && (
                    <img
                      src={state.activeChat?.avatar || '/images/avatars/default.jpg'}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover order-1 mr-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/avatars/default.jpg';
                      }}
                    />
                  )}
                </div>
              ))}
              
              {/* Upload Progress */}
              {state.isUploading && (
                <div className="flex justify-end">
                  <div className="max-w-xs bg-blue-500 text-white rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span className="text-sm">Mengupload... {state.uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-400 rounded-full h-1 mt-2">
                      <div
                        className="bg-white h-1 rounded-full transition-all duration-300"
                        style={{ width: `${state.uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Reply indicator */}
            {state.replyingTo && (
              <div className="bg-gray-100 border-t border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-8 bg-blue-500 rounded"></div>
                    <div>
                      <p className="text-xs text-gray-500">Membalas</p>
                      <p className="text-sm text-gray-700 truncate">{state.replyingTo.isiPesan}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setState(prev => ({ ...prev, replyingTo: null }))}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              <div className="flex items-end space-x-2">
                {/* Attachment Menu */}
                <div className="relative">
                  <button
                    onClick={() => setState(prev => ({ ...prev, showAttachmentMenu: !prev.showAttachmentMenu }))}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  
                  {state.showAttachmentMenu && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                      <button
                        onClick={() => {
                          fileInputRef.current?.click();
                          setState(prev => ({ ...prev, showAttachmentMenu: false }));
                        }}
                        className="flex items-center space-x-2 w-full p-2 text-left hover:bg-gray-100 rounded"
                      >
                        <Image className="w-4 h-4" />
                        <span className="text-sm">Gambar</span>
                      </button>
                      <button
                        onClick={() => {
                          fileInputRef.current?.click();
                          setState(prev => ({ ...prev, showAttachmentMenu: false }));
                        }}
                        className="flex items-center space-x-2 w-full p-2 text-left hover:bg-gray-100 rounded"
                      >
                        <File className="w-4 h-4" />
                        <span className="text-sm">File</span>
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Message Input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={state.pesanBaru}
                    onChange={(e) => tulisPesan(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        kirimPesan(state.pesanBaru);
                        menungguBalasan();
                      }
                    }}
                    placeholder="Ketik pesan..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <button
                    onClick={() => setState(prev => ({ ...prev, showEmojiPicker: !prev.showEmojiPicker }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Send Button */}
                <button
                  onClick={() => {
                    kirimPesan(state.pesanBaru);
                    menungguBalasan();
                  }}
                  disabled={!state.pesanBaru.trim() || state.loading}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              
              {/* Chat Actions */}
              <div className="flex justify-center space-x-4 mt-3">
                <button
                  onClick={() => putuskanLanjutkanChat(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Lanjutkan Chat
                </button>
                <button
                  onClick={() => putuskanLanjutkanChat(false)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Akhiri Chat
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Chat</h3>
              <p className="text-gray-600">Pilih chat dari daftar untuk mulai percakapan</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,.doc,.docx"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFileUpload(file);
          }
        }}
        className="hidden"
      />
      
      {/* Error Message */}
      {state.error && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
          <div className="flex items-center">
            <X className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{state.error}</span>
            <button
              onClick={() => setState(prev => ({ ...prev, error: null }))}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalamanChat;