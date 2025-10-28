import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Send, MoreVertical, Paperclip, Smile, ArrowLeft, User, MessageSquare, Clock, Check, CheckCheck, X, Image, File, Car } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchRoomsForUser,
  fetchMessages,
  sendTextMessage,
  subscribeRoomMessages,
  markIncomingAsRead,
  getRoomPeerId,
  type ChatRoomDb,
  type ChatMessageDb,
  sendAttachmentMessage,
  fetchLatestMessageForRoom,
  deleteRoomHistory,
  sendTextWithCarInfoMessage
} from '../services/chatService';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Interfaces
interface Pesan {
  id: string;
  pengirimId: string;
  penerimaId: string;
  isiPesan: string;
  tipePesan: 'text' | 'image' | 'file' | 'system' | 'car_info';
  waktuKirim: string;
  statusBaca: 'sent' | 'delivered' | 'read';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  replyTo?: string;
  carInfo?: {
    carId: string;
    title: string;
    price: string;
    year: string;
    mileage: number;
    color: string;
    imageUrl: string | null;
  };
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
  selectedMessages: string[];
  showChatInfo: boolean;
  uploadProgress: number;
  isUploading: boolean;
  replyingTo: Pesan | null;
  showHeaderMenu: boolean;
}

// HalamanChat component
function HalamanChat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [rooms, setRooms] = useState<ChatRoomDb[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoomDb | null>(null);
  const [messages, setMessages] = useState<ChatMessageDb[]>([]);
  const [inputText, setInputText] = useState('');
  const [fileToSend, setFileToSend] = useState<File | null>(null);
  const [roleFilter, setRoleFilter] = useState<'all' | 'buyer' | 'seller'>('all');
  const [carInfo, setCarInfo] = useState<any>(null);
  const [carInfoMap, setCarInfoMap] = useState<Record<string, any>>({});
  const unsubscribeRef = useRef<null | (() => void)>(null);
  const [pendingCarId, setPendingCarId] = useState<string | null>(null);
  
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
    selectedMessages: [],
    showChatInfo: false,
    uploadProgress: 0,
    isUploading: false,
    replyingTo: null,
    showHeaderMenu: false
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const headerMenuRef = useRef<HTMLDivElement>(null);
  const peerProfileCacheRef = useRef<Map<string, any>>(new Map());
  
  // Asumsi role user saat ini. Ganti dengan sumber role nyata (mis. dari context/profil).
  const myRole: 'buyer' | 'seller' = 'buyer';

  // Handler untuk klik card mobil
  const handleCarClick = (carId: string) => {
    navigate(`/detail-mobil/${carId}`);
  };

  const getPeerRole = useCallback((room: ChatRoomDb): 'buyer' | 'seller' => {
    return myRole === 'buyer' ? 'seller' : 'buyer';
  }, [myRole]);

  // Helper: deteksi room self-chat
  const isSelfRoom = useCallback(
    (room: ChatRoomDb) => {
      const me = user?.id || '';
      return room.user1_id === me && room.user2_id === me;
    },
    [user?.id]
  );

  const filteredRooms = useMemo(() => {
    const base = rooms.filter(r => !isSelfRoom(r));
    if (roleFilter === 'all') return base;
    return base.filter((r) => getPeerRole(r) === roleFilter);
  }, [rooms, roleFilter, getPeerRole, isSelfRoom]);

  const roleCounts = useMemo(() => {
    const base = rooms.filter(r => !isSelfRoom(r));
    let seller = 0, buyer = 0;
    base.forEach((r) => {
      if (getPeerRole(r) === 'seller') seller++;
      else buyer++;
    });
    return { all: base.length, seller, buyer };
  }, [rooms, getPeerRole, isSelfRoom]);
  
  // Bangun base chat list (nama/avatar) hanya saat rooms/user berubah
  
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const rs = await fetchRoomsForUser(user.id);
        setRooms(rs);
        if (!activeRoom && rs.length) setActiveRoom(rs[0]);
        
        // Fetch car info untuk rooms yang memiliki car_id
        const carIds = rs.filter(r => r.car_id).map(r => r.car_id);
        if (carIds.length > 0) {
          const { data: cars } = await supabase
            .from('cars')
            .select('id, title, price, car_brands(name), car_models(name)')
            .in('id', carIds);
          
          if (cars) {
            const carMap = cars.reduce((acc, car) => {
              acc[car.id] = car;
              return acc;
            }, {} as Record<string, any>);
            setCarInfoMap(carMap);
          }
        }
      } catch (e) {
        console.error('Gagal memuat rooms', e);
      }
    })();
  }, [user?.id]);

  // Preselect room jika datang dari "Chat Penjual" (navigate state.activeRoomId)
  useEffect(() => {
    const activeRoomId = (location.state as any)?.activeRoomId;
    if (activeRoomId && rooms.length) {
      const r = rooms.find(x => x.id === activeRoomId);
      if (r) {
        setActiveRoom(r);
      }
    }
  }, [rooms, location.state]);

  // Sinkronkan activeRoom (Supabase) ke activeChat (UI) agar panel terbuka
  useEffect(() => {
    if (!activeRoom) return;
    const uiChat = state.chatList.find(c => c.id === activeRoom.id);
    if (uiChat) {
      setState(prev => ({ ...prev, activeChat: uiChat }));
    }
  }, [activeRoom?.id, state.chatList]);

  // Ambil informasi mobil untuk semua room yang memiliki car_id
  useEffect(() => {
    const fetchAllCarInfo = async () => {
      const roomsWithCars = rooms.filter(room => room.car_id);
      if (roomsWithCars.length === 0) return;

      const carIds = [...new Set(roomsWithCars.map(room => room.car_id))];
      
      try {
        const { data, error } = await supabase
          .from('cars')
          .select(`
            id,
            title,
            price,
            year,
            color,
            mileage,
            car_brands(name),
            car_models(name),
            car_images(image_url)
          `)
          .in('id', carIds);

        if (error) {
          console.error('Error fetching cars info:', error);
          return;
        }

        const carMap: Record<string, any> = {};
        data?.forEach(car => {
          carMap[car.id] = car;
        });
        
        setCarInfoMap(carMap);
      } catch (error) {
        console.error('Error fetching cars info:', error);
      }
    };

    fetchAllCarInfo();
  }, [rooms]);

  useEffect(() => {
    // Kosongkan pesan sebelum fetch agar preview tidak salah menempel
    setMessages([]);
    (async () => {
      if (!activeRoom) return;
      try {
        const ms = await fetchMessages(activeRoom.id);
        setMessages(ms);
        if (user?.id) await markIncomingAsRead(activeRoom.id, user.id);
      } catch (e) {
        console.error('Gagal memuat pesan', e);
      }
    })();

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (activeRoom) {
      unsubscribeRef.current = subscribeRoomMessages(activeRoom.id, (m) => {
        setMessages(prev => [...prev, m]);
      });
    }
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [activeRoom?.id, user?.id]);

  // Normalisasi tipe pesan DB ke tipe UI
  const normalizeMessageType = (t: ChatMessageDb['message_type']): Pesan['tipePesan'] => {
    if (t === 'text') return 'text';
    if (t === 'image') return 'image';
    if (t === 'file' || t === 'audio' || t === 'video') return 'file';
    if (t === 'car_info') return 'car_info';
    return 'system';
  };

  const toPesanFromDb = (m: ChatMessageDb): Pesan => {
    const attachments = (m as any).chat_attachments;
    const attachment = Array.isArray(attachments) ? attachments[0] : attachments;
    
    const tipe = normalizeMessageType(m.message_type);
    let isiPesan = m.message_text;
    let carInfoParsed: Pesan['carInfo'] | undefined;

    if (tipe === 'text') {
      try {
        const parsed = JSON.parse(m.message_text || '{}');
        if (parsed && typeof parsed === 'object' && (parsed.text || parsed.carInfo)) {
          if (parsed.text) {
            isiPesan = String(parsed.text);
          }
          if (parsed.carInfo) {
            carInfoParsed = {
              carId: parsed.carInfo.carId,
              title: parsed.carInfo.title,
              price: parsed.carInfo.price,
              year: String(parsed.carInfo.year ?? ''),
              mileage: Number(parsed.carInfo.mileage ?? 0),
              color: String(parsed.carInfo.color ?? ''),
              imageUrl: parsed.carInfo.imageUrl ?? null
            };
          }
        }
      } catch {
        // biarkan sebagai teks biasa jika bukan JSON
      }
    } else if (tipe === 'car_info') {
      try {
        const parsed = JSON.parse(m.message_text || '{}');
        carInfoParsed = {
          carId: parsed.carId,
          title: parsed.title,
          price: parsed.price,
          year: String(parsed.year ?? ''),
          mileage: Number(parsed.mileage ?? 0),
          color: String(parsed.color ?? ''),
          imageUrl: parsed.imageUrl ?? null
        };
        isiPesan = parsed.title || 'Informasi mobil';
      } catch {
        // fallback ke teks mentah bila parsing gagal
      }
    }

    return {
      id: m.id,
      pengirimId: m.sender_id,
      penerimaId: m.receiver_id,
      isiPesan,
      tipePesan: tipe,
      waktuKirim: m.sent_at || m.created_at,
      statusBaca: m.is_read ? 'read' : 'delivered',
      fileUrl: attachment?.file_url,
      fileName: attachment?.file_name,
      fileSize: attachment?.file_size || undefined,
      replyTo: m.reply_to_message_id || undefined,
      carInfo: carInfoParsed
    };
  };

  // Ambil informasi mobil berdasarkan car_id dari room yang aktif
  useEffect(() => {
    const fetchCarInfo = async () => {
      if (!activeRoom?.car_id) {
        setCarInfo(null);
        setPendingCarId(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('cars')
          .select(`
            id,
            title,
            price,
            year,
            color,
            mileage,
            car_brands(name),
            car_models(name),
            car_images(image_url)
          `)
          .eq('id', activeRoom.car_id)
          .single();

        if (error) {
          console.error('Error fetching car info:', error);
          setCarInfo(null);
          setPendingCarId(null);
          return;
        }

        setCarInfo(data);

        // DETEKSI: jika sudah ada lampiran mobil (car_info atau text+carInfo), jangan tampilkan bubble composer lagi
        const hasCarAttachmentForRoom = messages.some((mm) => {
          // Pesan car_info: coba cocokkan carId dari payload, jika gagal parse anggap sudah ada lampiran
          if (mm.message_type === 'car_info') {
            try {
              const parsed = JSON.parse(mm.message_text);
              const carIdInMsg = parsed?.carId || parsed?.carInfo?.carId;
              return carIdInMsg === activeRoom.car_id;
            } catch {
              return true; // format lama: tetap anggap lampiran sudah dikirim
            }
          }
          // Pesan text: cek apakah ada carInfo di payload JSON
          if (mm.message_type === 'text') {
            try {
              const parsed = JSON.parse(mm.message_text);
              return parsed?.carInfo?.carId === activeRoom.car_id;
            } catch {
              return false;
            }
          }
          return false;
        });

        setPendingCarId(hasCarAttachmentForRoom ? null : activeRoom.car_id);
      } catch (error) {
        console.error('Error fetching car info:', error);
        setCarInfo(null);
        setPendingCarId(null);
      }
    };

    fetchCarInfo();
  }, [activeRoom?.car_id, messages]);

  // Tampilkan pesan dari Supabase ke UI (state.pesanList) agar area chat memakai data real
  useEffect(() => {
    if (!activeRoom) return;
    const list: Pesan[] = messages.map(toPesanFromDb);
    setState(prev => ({ ...prev, pesanList: list }));
  }, [messages, activeRoom?.id]);

  const handleSelectRoom = (room: ChatRoomDb) => {
    setActiveRoom(room);
    // Reset pesan agar efek berikutnya tidak memakai pesan dari room sebelumnya
    setMessages([]);
    const uiChat = state.chatList.find(c => c.id === room.id);
    if (uiChat) {
      setState(prev => ({ ...prev, activeChat: uiChat }));
    }
  };

  const sendCarInfoMessage = async (roomId: string, senderId: string, receiverId: string, carId: string) => {
    if (!carInfo) return null;
    
    try {
      // Kirim bubble lampiran mobil saja (tanpa teks) sebagai pesan 'text' berisi JSON dengan carInfo
      const sent = await sendTextWithCarInfoMessage(roomId, senderId, receiverId, '', carId);
      return sent;
    } catch (e) {
      console.error('Gagal mengirim info mobil', e);
      return null;
    }
  };

  const handleSend = async () => {
    if (!user?.id || !activeRoom) return;
    const receiverId = getRoomPeerId(activeRoom, user.id);

    // Cegah kirim pesan ke diri sendiri
    if (receiverId === user.id) {
      setState(prev => ({ ...prev, error: 'Tidak dapat mengirim pesan ke diri sendiri.' }));
      return;
    }

    try {
      // Jika ada lampiran mobil dan ada teks, kirim gabungan dalam satu pesan
      if (pendingCarId && state.pesanBaru.trim()) {
        const sentCombined = await sendTextWithCarInfoMessage(
          activeRoom.id,
          user.id,
          receiverId,
          state.pesanBaru.trim(),
          pendingCarId
        );
        setMessages(prev => [...prev, sentCombined]);
        setPendingCarId(null);
        setInputText('');
        setState(prev => ({ ...prev, pesanBaru: '' }));
        return;
      }

      // Jika ada lampiran mobil tapi tidak ada teks, kirim sebagai car_info saja
      if (pendingCarId && !state.pesanBaru.trim()) {
        const sentCar = await sendTextWithCarInfoMessage(
          activeRoom.id,
          user.id,
          receiverId,
          '',
          pendingCarId
        );
        if (sentCar) setMessages(prev => [...prev, sentCar]);
        setPendingCarId(null);
        return;
      }

      if (fileToSend) {
        const { message, attachment } = await sendAttachmentMessage(activeRoom.id, user.id, receiverId, fileToSend);
        const withAtt = { ...message, chat_attachments: [attachment] } as ChatMessageDb & { chat_attachments: any[] };
        setMessages(prev => [...prev, withAtt]);
        setFileToSend(null);
        setInputText('');
        setState(prev => ({ ...prev, pesanBaru: '' }));
      } else if (inputText.trim()) {
        const sent = await sendTextMessage(activeRoom.id, user.id, receiverId, inputText.trim());
        setMessages(prev => [...prev, sent]);
        setInputText('');
        setState(prev => ({ ...prev, pesanBaru: '' }));
      }
    } catch (e) {
      console.error('Gagal mengirim pesan', e);
      setState(prev => ({ ...prev, error: 'Gagal mengirim pesan' }));
    }
  };

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
    setInputText(isiPesan);
    
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
  
  // Method to handle sending messages with Supabase
  const handleSendMessage = async () => {
    await handleSend();
  };

  // Method: menungguBalasan - Tidak digunakan lagi karena menggunakan data real dari Supabase
  // Fungsi ini dipertahankan untuk kompatibilitas tapi tidak lagi menghasilkan pesan dummy
  const menungguBalasan = async () => {
    // Tidak melakukan apa-apa, karena sekarang menggunakan Supabase realtime
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
    if (!activeRoom || !user) {
      setState(prev => ({ ...prev, error: 'Tidak ada room aktif atau user tidak login' }));
      return;
    }

    setState(prev => ({ ...prev, isUploading: true, uploadProgress: 0 }));
    
    try {
      // Get receiver ID
      const receiverId = getRoomPeerId(activeRoom, user.id);
      
      // Upload file using sendAttachmentMessage
      const { message, attachment } = await sendAttachmentMessage(
        activeRoom.id, 
        user.id, 
        receiverId, 
        file
      );
      
      console.log('File berhasil diupload:', { message, attachment });
      
      // Langsung tambahkan pesan ke state lokal untuk update UI instant
      const newPesan: Pesan = {
        id: message.id,
        pengirimId: message.sender_id,
        penerimaId: message.receiver_id,
        isiPesan: message.message_text,
        tipePesan: normalizeMessageType(message.message_type),
        waktuKirim: message.sent_at || message.created_at,
        statusBaca: 'sent',
        fileUrl: attachment.file_url,
        fileName: attachment.file_name,
        fileSize: attachment.file_size || undefined
      };
      
      // Update state dengan pesan baru
      setState(prev => ({
        ...prev,
        pesanList: [...prev.pesanList, newPesan],
        isUploading: false,
        uploadProgress: 0,
        showAttachmentMenu: false
      }));
      
      // Update messages state juga untuk konsistensi
      setMessages(prev => [...prev, { ...message, chat_attachments: [attachment] }]);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setState(prev => ({
        ...prev,
        error: `Gagal mengupload file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isUploading: false,
        uploadProgress: 0
      }));
    }
  };



  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.pesanList]);

  // Fetch profil berdasarkan peerId (cocokkan ke users.id atau users.auth_user_id)
  const fetchPeerProfile = async (peerId: string) => {
    const cache = peerProfileCacheRef.current;
    if (cache.has(peerId)) return cache.get(peerId);

    const { data, error } = await supabase
      .from('users')
      .select('id,auth_user_id,full_name,username,profile_picture')
      .or(`id.eq.${peerId},auth_user_id.eq.${peerId}`)
      .maybeSingle();

    if (error) {
      console.warn('Gagal fetch profil peer:', error.message);
      return null;
    }
    cache.set(peerId, data);
    return data;
  };

  // Bangun base chat list (nama/avatar) hanya saat rooms/user berubah
  useEffect(() => {
    if (!user?.id) return;
    
    const buildBaseChatList = async () => {
      if (!rooms.length) return;
      
      const chatRooms: ChatRoom[] = await Promise.all(
        rooms.map(async (room) => {
          const peerId = getRoomPeerId(room, user.id);
          const profile = await fetchPeerProfile(peerId);

          const displayName =
            profile?.full_name ||
            profile?.username ||
            'Penjual';

          const avatarUrl =
            profile?.profile_picture ||
            '/images/avatars/dealer.jpg';
          
          return {
            id: room.id,
            nama: displayName,
            avatar: avatarUrl,
            pesanTerakhir: null, // isi di-update terpisah saat messages berubah
            jumlahPesanBelumBaca: (user.id === room.user1_id ? room.unread_count_user1 : room.unread_count_user2) || 0,
            participants: [user.id, peerId],
            createdAt: room.created_at,
            updatedAt: room.updated_at
          };
        })
      );
      
      setState(prev => ({
        ...prev,
        chatList: chatRooms,
        filteredChats: chatRooms
      }));
    };
    
    buildBaseChatList();
  }, [rooms, user?.id]);
  
  // Saat messages berubah, update pesanTerakhir hanya untuk room aktif (hindari rebuild avatar/nama)
  useEffect(() => {
    if (!activeRoom) return;
    const lastMessage = messages.length ? messages[messages.length - 1] : null;

    // Selalu set pesanTerakhir: null jika tidak ada pesan
    const last = lastMessage ? toPesanFromDb(lastMessage) : null;

    setState((prev) => {
      const updated = prev.chatList.map((chat) =>
        chat.id === activeRoom.id ? { ...chat, pesanTerakhir: last } : chat
      );
      return { ...prev, chatList: updated };
    });
  }, [messages, activeRoom?.id]);

  // Close header menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(event.target as Node)) {
        setState(prev => ({ ...prev, showHeaderMenu: false }));
      }
    };

    if (state.showHeaderMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [state.showHeaderMenu]);

  return (
    <div 
      className="container mx-auto max-w-6xl px-4 bg-gray-100/50 backdrop-blur-sm flex overflow-hidden"
      style={{ height: 'calc(100vh - 64px)' }}
    >
      {/* Sidebar - Chat List */}
      <div className={`w-72 bg-white/70 backdrop-blur-sm border-r border-gray-200 flex flex-col ${state.activeChat ? 'hidden lg:flex' : 'flex'}`}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/70 backdrop-blur-sm p-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-gray-900">Chat</h1>
          </div>
        </div>
        
        {/* Dropdown filter di bawah header */}
        <div className="border-b bg-white/70 backdrop-blur-sm px-3 py-2">
          <select
            className="text-sm px-3 py-1 rounded-md border border-gray-300 bg-white w-48 sm:w-56 md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as 'all' | 'buyer' | 'seller')}
          >
            <option value="all">Semua ({roleCounts.all})</option>
            <option value="seller">Penjual ({roleCounts.seller})</option>
            <option value="buyer">Pembeli ({roleCounts.buyer})</option>
          </select>
        </div>
        
        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {state.chatList.length === 0 ? (
            <div className="p-3 text-center text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Belum ada chat</p>
            </div>
          ) : (
            state.chatList
              .filter(chat => {
                const roomToCheck = rooms.find(r => r.id === chat.id);
                // Wajib punya room asli, dan bukan self-room
                if (!roomToCheck || (roomToCheck && (roomToCheck.user1_id === user?.id && roomToCheck.user2_id === user?.id))) {
                  return false;
                }
                if (roleFilter === 'all') return true;
                return getPeerRole(roomToCheck) === roleFilter;
              })
              .map(chat => {
                const roomToCheck = rooms.find(r => r.id === chat.id);
                const peerRole = roomToCheck ? getPeerRole(roomToCheck) : 'seller';
                
                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      // Gunakan handleSelectRoom dari Supabase
                      const roomToSelect = rooms.find(r => r.id === chat.id);
                      if (roomToSelect) {
                        handleSelectRoom(roomToSelect);
                      }
                    }}
                    className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      state.activeChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={chat.avatar}
                        alt={chat.nama}
                        className="w-10 h-10 rounded-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          if (img.dataset.fallbackApplied === '1') return;
                          img.src = '/images/avatars/default.jpg';
                          img.dataset.fallbackApplied = '1';
                        }}
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <h3 className="font-medium text-sm text-gray-900 truncate">{chat.nama}</h3>
                          <span
                            className={`ml-2 px-2 py-0.5 text-xs rounded ${
                              peerRole === 'seller'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {peerRole === 'seller' ? 'penjual' : 'pembeli'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {chat.pesanTerakhir && formatTime(chat.pesanTerakhir.waktuKirim)}
                        </span>
                      </div>
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600 truncate">
                            {chat.pesanTerakhir?.isiPesan || 'Belum ada pesan'}
                          </p>
                          {chat.jumlahPesanBelumBaca > 0 && (
                            <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[16px] text-center">
                              {chat.jumlahPesanBelumBaca}
                            </span>
                          )}
                        </div>
                        
                        {/* Car Information in Sidebar */}
                        {/* Dihapus: tidak lagi menampilkan keterangan mobil di thread */}
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {state.activeChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white/70 backdrop-blur-sm border-b border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={keluarDariChat}
                    className="lg:hidden p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  
                  <img
                    src={state.activeChat?.avatar || '/images/avatars/default.jpg'}
                    alt={state.activeChat?.nama || 'Avatar'}
                    className="w-8 h-8 rounded-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (img.dataset.fallbackApplied === '1') return;
                      img.src = '/images/avatars/default.jpg';
                      img.dataset.fallbackApplied = '1';
                    }}
                  />
                  
                  <div>
                    <div className="flex items-center">
                      <h2 className="font-semibold text-sm text-gray-900">{state.activeChat?.nama || 'Unknown'}</h2>
                      {activeRoom && (
                        <span
                          className={`ml-2 px-2 py-0.5 text-xs rounded ${
                            getPeerRole(activeRoom) === 'seller' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {getPeerRole(activeRoom) === 'seller' ? 'Penjual' : 'Pembeli'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {state.kontakList.find(k => 
                        state.activeChat!.participants.includes(k.id) && k.id !== state.currentUser.id
                      )?.isTyping ? 'Sedang mengetik...' : 'Online'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <div className="relative" ref={headerMenuRef}>
                    <button
                      onClick={() => setState(prev => ({ ...prev, showHeaderMenu: !prev.showHeaderMenu }))}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {state.showHeaderMenu && (
                      <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
                        <button
                          onClick={() => {
                            setState(prev => ({ ...prev, showChatInfo: !prev.showChatInfo, showHeaderMenu: false }));
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                        >
                          Info Chat
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={async () => {
                            if (!activeRoom) return;
                            if (window.confirm('Hapus semua pesan dalam obrolan ini? Tindakan tidak dapat dibatalkan.')) {
                              try {
                                if (!activeRoom?.id) {
                                  console.warn('No active room id');
                                  return;
                                }

                                // Cek jumlah pesan sebelum delete
                                const beforeMsgs = await fetchMessages(activeRoom.id);
                                console.log('Messages before delete:', beforeMsgs?.length ?? 0);

                                const res = await deleteRoomHistory(activeRoom.id);
                                console.log('deleteRoomHistory result:', res);

                                // Cek jumlah pesan sesudah delete
                                const afterMsgs = await fetchMessages(activeRoom.id);
                                console.log('Messages after delete:', afterMsgs?.length ?? 0);

                                if (!res || res.deletedMessageCount === 0) {
                                  // Tidak ada baris terhapus. Bisa jadi RLS menolak atau fungsi tidak dieksekusi.
                                  alert('Tidak ada pesan yang terhapus. Cek kebijakan RLS Supabase atau duplikasi fungsi.');
                                } else {
                                  alert(`Berhasil menghapus ${res.deletedMessageCount} pesan dan ${res.deletedAttachmentCount} lampiran.`);
                                }
                                
                                // Hapus semua pesan dari state
                                setMessages([]);
                                // Update chat list untuk menghapus preview pesan terakhir
                                setState(prev => {
                                  const updated = prev.chatList.map(c => 
                                    c.id === activeRoom.id ? { ...c, pesanTerakhir: null } : c
                                  );
                                  return { ...prev, chatList: updated, showHeaderMenu: false };
                                });
                                
                                console.log('Chat berhasil dihapus');
                              } catch (e) {
                                console.error('Gagal hapus chat', e);
                                alert('Terjadi kesalahan saat menghapus obrolan. Lihat console untuk detail.');
                                setState(prev => ({ ...prev, showHeaderMenu: false }));
                              }
                            } else {
                              setState(prev => ({ ...prev, showHeaderMenu: false }));
                            }
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Hapus Obrolan
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Menghapus tampilan informasi mobil di bagian atas */}
            
            {/* Messages Area */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
              {state.pesanList.map(pesan => (
                <div
                  key={pesan.id}
                  className={`flex ${pesan.pengirimId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-sm ${pesan.pengirimId === user?.id ? 'order-2' : 'order-1'}`}>
                    {/* Reply indicator */}
                    {pesan.replyTo && (
                      <div className="text-xs text-gray-500 mb-1 px-2">
                        Membalas pesan
                      </div>
                    )}
                    
                    <div
                      className={`rounded-2xl ${
                        pesan.pengirimId === user?.id
                          ? 'bg-blue-500 text-white rounded-br-none'
                          : 'bg-gray-200 text-gray-900 rounded-bl-none'
                      } ${pesan.tipePesan === 'image' ? 'p-1' : 'p-3'}`}
                    >
                      {pesan.tipePesan === 'text' && (
                        <>
                          {pesan.carInfo && (
                            <div className={`mb-2 flex items-center justify-between ${pesan.pengirimId === user?.id ? 'bg-blue-400/30' : 'bg-white'} border ${pesan.pengirimId === user?.id ? 'border-blue-200/50' : 'border-gray-200'} rounded-lg p-2`}>
                              <div className="flex items-center space-x-2">
                                <div className="w-10 h-10 rounded overflow-hidden bg-gray-100">
                                  {pesan.carInfo.imageUrl ? (
                                    <img src={pesan.carInfo.imageUrl} alt="Mobil" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <Car className="w-5 h-5" />
                                    </div>
                                  )}
                                </div>
                                <div className="text-sm font-medium">
                                  {pesan.carInfo.title}
                                </div>
                              </div>
                            </div>
                          )}
                          <p className="text-sm">{pesan.isiPesan}</p>
                          <div className={`flex items-center justify-between mt-1 ${
                            pesan.pengirimId === user?.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <span className="text-xs">{formatTime(pesan.waktuKirim)}</span>
                            {pesan.pengirimId === user?.id && (
                              <div className="ml-2">
                                {getStatusIcon(pesan.statusBaca)}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                      
                      {pesan.tipePesan === 'car_info' && (
                        <div className="relative">
                          <div 
                            className="bg-white border border-gray-200 rounded-lg p-2 cursor-pointer hover:bg-gray-50 transition-colors duration-200 flex items-center"
                            onClick={() => {
                              if (pesan.carInfo?.carId) {
                                handleCarClick(pesan.carInfo.carId);
                              }
                            }}
                            title="Klik untuk melihat detail mobil"
                          >
                            <div className="flex-shrink-0 mr-2">
                              {pesan.carInfo?.imageUrl ? (
                                <img
                                  src={pesan.carInfo.imageUrl}
                                  alt={pesan.carInfo.title}
                                  className="w-10 h-10 object-cover rounded-md"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (nextElement) {
                                      nextElement.style.display = 'flex';
                                    }
                                  }}
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                                  <Car className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {pesan.carInfo?.title}
                              </h4>
                            </div>
                            <Car className="w-4 h-4 text-gray-500 ml-2" />
                          </div>
                          <button 
                            className="absolute -top-2 -right-2 bg-gray-100 rounded-full p-1 shadow-sm hover:bg-gray-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Tambahkan logika untuk menghapus lampiran jika diperlukan
                            }}
                            title="Hapus lampiran"
                          >
                            <X className="w-3 h-3 text-gray-500" />
                          </button>
                        </div>
                      )}
                      
                      {pesan.tipePesan === 'image' && (
                        <div className="relative">
                          <img
                            src={pesan.fileUrl}
                            alt="Gambar"
                            className="max-w-full h-auto rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ maxHeight: '300px', minWidth: '150px' }}
                            onClick={() => window.open(pesan.fileUrl, '_blank')}
                          />
                          {/* Timestamp overlay untuk gambar */}
                          <div className="absolute bottom-1 right-2 bg-black bg-opacity-50 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                            <span>{formatTime(pesan.waktuKirim)}</span>
                            {pesan.pengirimId === user?.id && (
                              <div className="text-white">
                                {getStatusIcon(pesan.statusBaca)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {pesan.tipePesan === 'file' && (
                        <>
                          <div className="flex items-center space-x-2">
                            <File className="w-5 h-5" />
                            <div>
                              <p className="text-xs font-medium">{pesan.fileName}</p>
                              <p className="text-xs opacity-75">
                                {pesan.fileSize && (pesan.fileSize / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <div className={`flex items-center justify-between mt-1 ${
                            pesan.pengirimId === user?.id ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <span className="text-xs">{formatTime(pesan.waktuKirim)}</span>
                            {pesan.pengirimId === user?.id && (
                              <div className="ml-2">
                                {getStatusIcon(pesan.statusBaca)}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Upload Progress */}
              {state.isUploading && (
                <div className="flex justify-end">
                  <div className="max-w-xs bg-blue-500 text-white rounded-lg p-2">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                      <span className="text-xs">Mengupload... {state.uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-400 rounded-full h-1 mt-1">
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
              <div className="bg-gray-100 border-t border-gray-200 p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-1 h-6 bg-blue-500 rounded"></div>
                    <div>
                      <p className="text-xs text-gray-500">Membalas</p>
                      <p className="text-xs text-gray-700 truncate">{state.replyingTo.isiPesan}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setState(prev => ({ ...prev, replyingTo: null }))}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
            
            {/* Message Input */}
            <div className="bg-white/70 backdrop-blur-sm border-t border-gray-200 p-3 sticky bottom-0 z-10">
              {/* Composer Car Attachment Bubble */}
              {pendingCarId && carInfo && (
                <div className="flex items-center justify-between mb-2 border border-blue-200 bg-blue-50 rounded-lg p-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded overflow-hidden bg-gray-100">
                      {carInfo.car_images?.[0]?.image_url ? (
                        <img
                          src={carInfo.car_images[0].image_url}
                          alt="Mobil"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Car className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {carInfo.title ||
                          `${carInfo.car_brands?.name || ''} ${carInfo.car_models?.name || ''}`.trim()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setPendingCarId(null)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                    aria-label="Batalkan lampiran mobil"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-end space-x-2">
                {/* Attachment Menu */}
                <div className="relative">
                  <button
                    onClick={() => setState(prev => ({ ...prev, showAttachmentMenu: !prev.showAttachmentMenu }))}
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  
                  {state.showAttachmentMenu && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-1">
                      <button
                        onClick={() => {
                          fileInputRef.current?.click();
                          setState(prev => ({ ...prev, showAttachmentMenu: false }));
                        }}
                        className="flex items-center space-x-2 w-full p-1.5 text-left hover:bg-gray-100 rounded"
                      >
                        <Image className="w-3.5 h-3.5" />
                        <span className="text-xs">Gambar</span>
                      </button>
                      <button
                        onClick={() => {
                          fileInputRef.current?.click();
                          setState(prev => ({ ...prev, showAttachmentMenu: false }));
                        }}
                        className="flex items-center space-x-2 w-full p-1.5 text-left hover:bg-gray-100 rounded"
                      >
                        <File className="w-3.5 h-3.5" />
                        <span className="text-xs">File</span>
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Message Input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={state.pesanBaru}
                    onChange={(e) => {
                      setState(prev => ({ ...prev, pesanBaru: e.target.value }));
                      setInputText(e.target.value);
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Ketik pesan..."
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  
                  <button
                    onClick={() => setState(prev => ({ ...prev, showEmojiPicker: !prev.showEmojiPicker }))}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={(!state.pesanBaru.trim() && !pendingCarId && !fileToSend) || state.loading || !activeRoom}
                  className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-2">Pilih Chat</h3>
              <p className="text-sm text-gray-600">Pilih chat dari daftar untuk mulai percakapan</p>
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