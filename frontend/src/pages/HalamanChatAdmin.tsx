import React, { useEffect, useRef, useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, User, MessageSquare, ShieldCheck, Send, Paperclip, Car, MoreVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fetchMessages, type ChatRoomDb, type ChatMessageDb, getRoomPeerId, sendAttachmentMessage, deleteRoomHistory } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

type Role = 'buyer' | 'seller' | 'admin';
type StatusPercakapan = 'open' | 'escalated' | 'closed';

interface AdminMessage {
  id: string;
  role: Role;
  text: string;
  createdAt: number;
}

interface Percakapan {
  id: string;
  title: string;
  context?: string;
  unreadCount: number;
  status: StatusPercakapan;
  updatedAt: number;
  participants: Role[];
  messages: AdminMessage[];
}

export default function HalamanChatAdmin() {
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusPercakapan | 'all'>('all');
  const [percakapanList, setPercakapanList] = useState<Percakapan[]>([]);
  const [aktif, setAktif] = useState<Percakapan | null>(null);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  
  // Tambahan: ref dan state untuk menu header
  const headerMenuRef = useRef<HTMLDivElement | null>(null);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);

  useEffect(() => {
    const seed: Percakapan[] = [
      {
        id: 'conv-1',
        title: 'Pembeli: Andi ↔ Dealer: Jaya Motor',
        context: 'Test Drive • Avanza 2020',
        unreadCount: 2,
        status: 'escalated',
        updatedAt: Date.now() - 1000 * 60 * 5,
        participants: ['buyer', 'seller', 'admin'] as Role[],
        messages: [
          { id: 'm1', role: 'buyer', text: 'Halo, mau tanya jadwal test drive.', createdAt: Date.now() - 1000 * 60 * 30 },
          { id: 'm2', role: 'seller', text: 'Baik Pak, tersedia besok jam 10.', createdAt: Date.now() - 1000 * 60 * 25 },
          { id: 'm3', role: 'buyer', text: 'Kalau jam 14 bisa?', createdAt: Date.now() - 1000 * 60 * 20 },
        ]
      },
      {
        id: 'conv-2',
        title: 'Pembeli: Sari ↔ Dealer: Prima Auto',
        context: 'Kredit • HR-V 2021',
        unreadCount: 0,
        status: 'open',
        updatedAt: Date.now() - 1000 * 60 * 60,
        participants: ['buyer', 'seller'] as Role[],
        messages: [
          { id: 'n1', role: 'seller', text: 'DP 20%, tenor 60 bulan tersedia.', createdAt: Date.now() - 1000 * 60 * 90 },
        ]
      }
    ];
    setPercakapanList(seed);
    setAktif(seed[0]);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aktif]);

  const filtered = percakapanList.filter(p => {
    const matchQuery =
      !query ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      (p.context || '').toLowerCase().includes(query.toLowerCase());
    const matchStatus = filterStatus === 'all' ? true : p.status === filterStatus;
    return matchQuery && matchStatus;
  });

  const joinPercakapan = () => {
    if (!aktif) return;
    if (!aktif.participants.includes('admin')) {
      const updated = { 
        ...aktif, 
        participants: [...aktif.participants, 'admin' as Role], 
        status: 'escalated' as StatusPercakapan 
      };
      setAktif(updated);
      setPercakapanList(prev => prev.map(p => p.id === updated.id ? updated : p));
    }
  };

  const tutupPercakapan = () => {
    if (!aktif) return;
    const updated = { ...aktif, status: 'closed' as StatusPercakapan };
    setAktif(updated);
    setPercakapanList(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const kirimPesanAdmin = () => {
    if (!aktif || !input.trim()) return;
    const msg: AdminMessage = { id: crypto.randomUUID(), role: 'admin', text: input.trim(), createdAt: Date.now() };
    const updated = { ...aktif, messages: [...aktif.messages, msg], updatedAt: Date.now() };
    setAktif(updated);
    setPercakapanList(prev => prev.map(p => p.id === updated.id ? updated : p));
    setInput('');
  };

  // State Supabase mirip HalamanChat
  const [rooms, setRooms] = useState<ChatRoomDb[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoomDb | null>(null);
  const [messages, setMessages] = useState<ChatMessageDb[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State UI: gunakan kategori seperti halaman chat: semua | eskalasi | chatbot | mobil | arsip
  const [adminFilter, setAdminFilter] = useState<'semua' | 'eskalasi' | 'chatbot' | 'mobil' | 'arsip'>('semua');
  const [adminQuery, setAdminQuery] = useState('');
  const location = useLocation();

  useEffect(() => {
  (async () => {
    try {
      setLoading(true);
      setError(null);
      let query = supabase.from('chat_rooms').select('*');

      if (adminFilter === 'eskalasi') {
        query = query.eq('is_escalated', true);
      } else if (adminFilter === 'chatbot') {
        // Ambil room chatbot langsung + room eskalasi untuk disaring di klien
        query = query.or('room_type.eq.user_to_bot,is_escalated.eq.true');
      } else if (adminFilter === 'mobil') {
        query = query
          .not('car_id', 'is', null)
          .eq('room_type', 'user_to_admin')
          .eq('is_escalated', false)
          .eq('escalation_history', 0)
          .is('resolved_at', null);
      } else if (adminFilter === 'semua') {
        // TERMASUK room chatbot agar badge terlihat di daftar
        query = query.or('room_type.eq.user_to_admin,room_type.eq.user_to_bot,is_escalated.eq.true');
      }

        const { data, error: err } = await query.order('last_message_at', { ascending: false });
        if (err) throw err;
        setRooms((data || []) as ChatRoomDb[]);
      } catch (e) {
        console.error('Gagal memuat rooms admin', e);
        setError('Gagal memuat daftar percakapan');
      } finally {
        setLoading(false);
      }
    })();
  }, [adminFilter]);

  // Subscribe ke perubahan chat_rooms agar daftar auto-refresh saat ada UPDATE/INSERT
  useEffect(() => {
  const channel = supabase
    .channel('admin-chat-rooms')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_rooms' }, async () => {
      try {
        setLoading(true);
        let query = supabase.from('chat_rooms').select('*');
        if (adminFilter === 'eskalasi') {
          query = query
            .eq('is_escalated', true)
            .is('resolved_at', null);
        } else if (adminFilter === 'chatbot') {
          // Konsisten dengan fetch awal
          query = query.or('room_type.eq.user_to_bot,is_escalated.eq.true');
        } else if (adminFilter === 'mobil') {
          query = query
            .not('car_id', 'is', null)
            .eq('room_type', 'user_to_admin')
            .eq('is_escalated', false)
            .eq('escalation_history', 0)
            .is('resolved_at', null);
        } else if (adminFilter === 'arsip') {
          // Arsip: percakapan yang sudah selesai eskalasi
          query = query
            .not('resolved_at', 'is', null)
            .gt('escalation_history', 0);
        } else if (adminFilter === 'semua') {
          // Konsisten dengan fetch awal: sertakan user_to_bot juga
          query = query.or('room_type.eq.user_to_admin,room_type.eq.user_to_bot,is_escalated.eq.true');
        }

          const { data, error } = await query.order('last_message_at', { ascending: false });
          if (!error) setRooms((data || []) as ChatRoomDb[]);
        } finally {
          setLoading(false);
        }
      })
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };
  }, [adminFilter]);

  // Helper: ekstrak teks dari last_message_preview (string atau JSON)
const extractPreviewText = (preview?: string | null) => {
  if (!preview) return '';
  const raw = preview.trim();
  // Coba regex cepat
  const jsonTextMatch = raw.match(/"text":"([^"]+)"/); 
  if (jsonTextMatch?.[1]) return jsonTextMatch[1];
  const jsonMsgMatch = raw.match(/"message_text":"([^"]+)"/); 
  if (jsonMsgMatch?.[1]) return jsonMsgMatch[1];
  // Coba parse JSON
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') return parsed;
    if (parsed?.text) return String(parsed.text);
    if (parsed?.message_text) return String(parsed.message_text);
    if (parsed?.carInfo?.title) return String(parsed.carInfo.title);
  } catch {}
  // Fallback: asumsi plain text
  return raw;
};

// Deteksi thread berasal dari chatbot (room user_to_bot ATAU pesan terakhir mengandung kata 'chatbot')
const isChatbotThread = (room: ChatRoomDb) => {
  if (room.room_type === 'user_to_bot') return true;
  const text = extractPreviewText((room as any).last_message_preview).toLowerCase();
  return text.includes('chatbot');
};

// Filter rooms berdasarkan kategori dan pencarian
const filteredRooms = rooms.filter((r) => {
  const byCategory =
    adminFilter === 'semua'
      ? (r.room_type === 'user_to_admin' || r.is_escalated === true || r.room_type === 'user_to_bot' || isChatbotThread(r))
      : adminFilter === 'eskalasi'
      ? (r.is_escalated === true && !(r as any).resolved_at)
      : adminFilter === 'chatbot'
      ? isChatbotThread(r)
      : adminFilter === 'mobil'
      ? !!r.car_id && r.room_type === 'user_to_admin' && !r.is_escalated && (r.escalation_history || 0) === 0 && !(r as any).resolved_at
      : adminFilter === 'arsip'
      ? !!(r as any).resolved_at && (r.escalation_history || 0) > 0
      : true;

  const q = adminQuery.trim().toLowerCase();
  const textIndexable = `${r.user1_id} ${r.user2_id} ${r.car_id ?? ''} ${extractPreviewText((r as any).last_message_preview)}`.toLowerCase();
  return byCategory && (q === '' || textIndexable.includes(q));
});

  // Preselect room jika datang dari navigasi dengan state.activeRoomId
  useEffect(() => {
    const activeRoomId = (location.state as any)?.activeRoomId;
    if (activeRoomId && rooms.length) {
      const r = rooms.find(x => x.id === activeRoomId);
      if (r) setActiveRoom(r);
    }
  }, [rooms, location.state]);

  // Ketika room aktif berubah: muat pesan
  useEffect(() => {
    (async () => {
      if (!activeRoom) return;
      try {
        setLoading(true);
        const ms = await fetchMessages(activeRoom.id);
        setMessages(ms);
      } catch (e) {
        console.error('Gagal memuat pesan room admin', e);
        setError('Gagal memuat pesan');
      } finally {
        setLoading(false);
      }
    })();
  }, [activeRoom?.id]);

  // Tutup menu saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerMenuRef.current && !headerMenuRef.current.contains(event.target as Node)) {
        setShowHeaderMenu(false);
      }
    };
    if (showHeaderMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHeaderMenu]);

  // Tutup menu saat pindah ke chat lain
  useEffect(() => {
    setShowHeaderMenu(false);
  }, [activeRoom?.id]);

  // Handler pilih room
  const handleSelectRoom = (room: ChatRoomDb) => {
    setActiveRoom(room);
  };

  // Cache nama pengguna dari Supabase (id -> full_name/username)
  const [userNameMap, setUserNameMap] = useState<Record<string, string>>({});

  // Muat nama pengguna saat rooms berubah
  useEffect(() => {
    const loadUserNames = async () => {
      const ids = Array.from(
        new Set(
          rooms
            .flatMap(r => [r.user1_id, r.user2_id])
            .filter(Boolean)
        )
      ) as string[];

      if (ids.length === 0) return;

      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, username')
        .in('id', ids);

      if (error) {
        console.warn('Gagal memuat nama pengguna:', error.message);
        return;
      }

      const map: Record<string, string> = {};
      (data || []).forEach(u => {
        map[u.id] = u.full_name?.trim() || u.username?.trim() || u.id;
      });
      setUserNameMap(prev => ({ ...prev, ...map }));
    };

    loadUserNames();
  }, [rooms]);

  // Helper untuk mengambil nama tampilan
  const namaPengguna = (id?: string | null) => {
    if (!id) return '';
    return userNameMap[id] || id;
  };

  // Cache judul mobil (id -> title/brand+model)
  const [carTitleMap, setCarTitleMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadCarTitles = async () => {
      const ids = Array.from(
        new Set(
          rooms
            .map(r => r.car_id)
            .filter((cId): cId is string => !!cId)
        )
      );
      if (ids.length === 0) return;
  
      const { data, error } = await supabase
        .from('cars')
        .select('id, title, car_brands(name), car_models(name)')
        .in('id', ids);
  
      if (error) {
        console.warn('Gagal memuat judul mobil:', error.message);
        return;
      }
  
      const map: Record<string, string> = {};
      (data || []).forEach((c: any) => {
        const brand = Array.isArray(c?.car_brands) ? (c.car_brands[0]?.name ?? '') : (c?.car_brands?.name ?? '');
        const model = Array.isArray(c?.car_models) ? (c.car_models[0]?.name ?? '') : (c?.car_models?.name ?? '');
        const composed = c?.title?.trim() || [brand, model].filter(Boolean).join(' ').trim();
        map[c.id] = composed || c.id;
      });
      setCarTitleMap(prev => ({ ...prev, ...map }));
    };
  
    loadCarTitles();
  }, [rooms]);

  // Profil admin yang login
  const { user: profile } = useAuth();

  // Admin bisa membalas jika:
  // 1. Menjadi peserta room aktif, ATAU
  // 2. Room sudah dieskalasi (is_escalated = true)
  const isAdminParticipant =
      !!(activeRoom && profile?.id && (activeRoom.user1_id === profile.id || activeRoom.user2_id === profile.id));
  const isEscalatedRoom = !!(activeRoom && activeRoom.is_escalated);
  const isResolvedEscalation = !!(activeRoom && (activeRoom as any).resolved_at);
  const canReply = (isAdminParticipant || isEscalatedRoom) && !isResolvedEscalation;

  // Referensi untuk rooms yang sudah diproses (tidak lagi mengirim lampiran otomatis)
  const autoSentCarForRoomsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    // Nonaktifkan auto-kirim lampiran mobil; cukup reset marker saat pindah room
    if (activeRoom?.id) {
      autoSentCarForRoomsRef.current.delete(activeRoom.id);
    }
  }, [activeRoom?.id]);

  // Kirim pesan dari admin pada room aktif
  const handleSendSupport = async () => {
      if (!canReply || !activeRoom || !profile?.id) return;
      const text = input.trim();
      if (!text) return;

      // Tentukan penerima
      let receiverId;
      if (isAdminParticipant) {
          receiverId = profile.id === activeRoom.user1_id ? activeRoom.user2_id : activeRoom.user1_id;
      } else {
          receiverId = activeRoom.user1_id;
      }

      // Cek apakah sudah ada lampiran mobil untuk room ini
      const hasCarAttachmentForRoom = !!activeRoom.car_id && messages.some((mm) => {
        if (mm.message_type === 'car_info') {
          try {
            const parsed = JSON.parse(mm.message_text);
            const carIdInMsg = parsed?.carId || parsed?.carInfo?.carId;
            return carIdInMsg === activeRoom.car_id;
          } catch {
            return true;
          }
        }
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

      try {
        // Jika room punya car_id dan belum ada lampiran, kirim gabungan teks + carInfo pada kiriman pertama
        if (activeRoom.car_id && !hasCarAttachmentForRoom) {
          const { data: carInfo, error: carError } = await supabase
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

          if (!carError && carInfo) {
            const brand = Array.isArray((carInfo as any)?.car_brands)
              ? (carInfo as any).car_brands[0]?.name || ''
              : (carInfo as any).car_brands?.name || '';
            const model = Array.isArray((carInfo as any)?.car_models)
              ? (carInfo as any).car_models[0]?.name || ''
              : (carInfo as any).car_models?.name || '';
            const carTitle = (carInfo.title?.trim() || `${brand} ${model}`.trim()) || carInfo.id;
            const carPriceStr = carInfo.price ? `Rp ${carInfo.price.toLocaleString('id-ID')}` : 'Harga tidak tersedia';
            const carImage = Array.isArray((carInfo as any)?.car_images) && (carInfo as any).car_images.length > 0
              ? (carInfo as any).car_images[0].image_url
              : null;

            const payload = {
              room_id: activeRoom.id,
              sender_id: profile.id,
              receiver_id: receiverId,
              message_text: JSON.stringify({
                text,
                carInfo: {
                  carId: carInfo.id,
                  title: carTitle,
                  price: carPriceStr,
                  year: carInfo.year,
                  mileage: carInfo.mileage,
                  color: carInfo.color,
                  imageUrl: carImage
                }
              }),
              message_type: 'text' as ChatMessageDb['message_type'],
              chat_type: 'admin' as ChatMessageDb['chat_type'],
              is_read: false
            };

            const { error: insertErr } = await supabase.from('chat_messages').insert([payload]);
            if (insertErr) {
              console.error('Gagal kirim pesan gabungan teks+carInfo:', insertErr.message);
              return;
            }

            setInput('');
            const msgs = await fetchMessages(activeRoom.id);
            setMessages(msgs);
            endRef.current?.scrollIntoView({ behavior: 'smooth' });
            return;
          }
        }

        // Jika lampiran sudah ada atau tidak ada car_id, kirim teks biasa
        const { error } = await supabase
          .from('chat_messages')
          .insert({
              room_id: activeRoom.id,
              sender_id: profile.id,
              receiver_id: receiverId,
              message_text: text,
              message_type: 'text',
              chat_type: 'admin'
          });

        if (error) {
            console.error('Gagal kirim pesan admin:', error.message);
            return;
        }

        setInput('');
        const msgs = await fetchMessages(activeRoom.id);
        setMessages(msgs);
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        console.error('Gagal kirim pesan:', err);
      }
  };

  // Fungsi untuk menyelesaikan eskalasi
  const handleResolveEscalation = async () => {
    if (!activeRoom || !profile?.id || !activeRoom.is_escalated) return;

    const confirmResolve = window.confirm(
      'Apakah Anda yakin ingin menyelesaikan eskalasi ini? Chat akan ditandai sebagai selesai.'
    );
    if (!confirmResolve) return;

    try {
      const resolvedAt = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('chat_rooms')
        .update({
          is_escalated: false,
          resolved_at: resolvedAt,
          resolved_by: profile.id
        })
        .eq('id', activeRoom.id);

      if (updateError) {
        console.error('Gagal menyelesaikan eskalasi:', updateError.message);
        alert('Gagal menyelesaikan eskalasi. Silakan coba lagi.');
        return;
      }

      // Kirim pesan sistem
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          room_id: activeRoom.id,
          sender_id: profile.id,
          receiver_id: activeRoom.user1_id,
          message_text: '✅ Eskalasi telah diselesaikan oleh admin. Terima kasih atas kesabaran Anda.',
          message_type: 'system'
        });

      if (messageError) {
        console.error('Gagal kirim pesan sistem:', messageError.message);
      }

      // Refresh thread agar badge header berubah
      const msgs = await fetchMessages(activeRoom.id);
      setMessages(msgs);

      // Sinkronkan state lokal agar daftar (sidebar) langsung ikut berubah
      setActiveRoom(prev => prev ? {
        ...prev,
        is_escalated: false,
        resolved_at: resolvedAt,
        resolved_by: profile.id
      } : null);

      setRooms(prev => prev.map(r => 
        r.id === activeRoom.id 
          ? { ...r, is_escalated: false, resolved_at: resolvedAt, resolved_by: profile.id }
          : r
      ));

      alert('Eskalasi berhasil diselesaikan!');
    } catch (error) {
      console.error('Error menyelesaikan eskalasi:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    }
  };

  // Ref untuk input file tersembunyi
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAttachClick = () => {
      if (!canReply) return;
      fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
          const file = e.target.files?.[0];
          if (!file || !canReply || !activeRoom || !profile?.id) return;
  
          const peerId = profile.id === activeRoom.user1_id ? activeRoom.user2_id : activeRoom.user1_id;
  
          // Kirim attachment via service
          await sendAttachmentMessage(activeRoom.id, profile.id, peerId, file);
  
          // Refresh thread
          const msgs = await fetchMessages(activeRoom.id);
          setMessages(msgs);
          endRef.current?.scrollIntoView({ behavior: 'smooth' });
  
          // Reset input file agar bisa pilih file yang sama lagi jika perlu
          e.target.value = '';
      } catch (err: any) {
          console.error('Gagal kirim lampiran:', err?.message || err);
      }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar percakapan */}
      <aside className="w-80 border-r flex flex-col">
        <div className="p-3 border-b flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            className="flex-1 border rounded px-2 py-1 text-sm"
            value={adminQuery}
            onChange={(e) => setAdminQuery(e.target.value)}
            placeholder="Cari pengguna atau mobil"
          />
          <Filter className="w-4 h-4 text-gray-500" />
        </div>

        {/* Dropdown kategori: Semua | Eskalasi | Chatbot | Mobil | Arsip */}
        <div className="px-3 py-2 border-b">
          <select
            className="w-full border rounded px-2 py-1 text-sm"
            value={adminFilter}
            onChange={(e) => setAdminFilter(e.target.value as 'semua' | 'eskalasi' | 'chatbot' | 'mobil' | 'arsip')}
          >
            <option value="semua">Semua</option>
            <option value="eskalasi">Eskalasi</option>
            <option value="chatbot">Chatbot</option>
            <option value="mobil">Tanya</option>
            <option value="arsip">Arsip</option>
          </select>
        </div>

        {/* Daftar room pakai filteredRooms */}
        <div className="flex-1 overflow-y-auto">
          {filteredRooms.map((room) => {
            const user1Name = namaPengguna(room.user1_id);
            const user2Name = namaPengguna(room.user2_id);
            const showArrow = room.is_escalated || !!(room as any).resolved_at;
            const threadTitle = showArrow ? `${user1Name} ↔ ${user2Name}` : `${user1Name}`;
            const chatbotThread = isChatbotThread(room);
            
            return (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room)}
                className={`w-full text-left px-3 py-2 border-b hover:bg-gray-50 ${activeRoom?.id === room.id ? 'bg-blue-50' : ''}`}
              >
                <div className="font-medium truncate">
                  {threadTitle}
                  {chatbotThread ? (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded">
              Chatbot
            </span>
          ) : room.is_escalated && !(room as any).resolved_at ? (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-100 text-red-600 rounded">
              Eskalasi
            </span>
          ) : (room as any).resolved_at ? (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-600 rounded">
              Selesai eskalasi
            </span>
          ) : null}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {room.car_id
                    ? (() => {
                        const text = extractPreviewText((room as any).last_message_preview);
                        return text || 'Pesan dengan lampiran mobil';
                      })()
                    : chatbotThread
                    ? 'Chatbot'
                    : room.room_type === 'user_to_admin'
                    ? 'User-to-Admin'
                    : 'User-to-User'}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Thread percakapan */}
      <main className="flex-1 flex flex-col">
        <header className="p-4 border-b flex items-center gap-3">
          <User className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <div className="font-semibold">
              {activeRoom
                ? `${namaPengguna(activeRoom.user1_id)}${(isEscalatedRoom || isResolvedEscalation) ? ` ↔ ${namaPengguna(activeRoom.user2_id)}` : ''}`
                : 'Pilih percakapan'}
              {activeRoom?.is_escalated && (
                <span className={`ml-2 px-2 py-1 text-xs rounded ${
                  (activeRoom as any).resolved_at 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {(activeRoom as any).resolved_at ? '✅ Eskalasi Selesai' : '🚨 Eskalasi'}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {activeRoom?.car_id
                ? `Mobil • ${carTitleMap[activeRoom.car_id] || activeRoom.car_id}`
                : activeRoom
                ? activeRoom.room_type === 'user_to_bot'
                ? 'Chatbot'
                : activeRoom.room_type === 'user_to_admin'
                ? 'User-to-Admin'
                : 'User-to-User'
              : ''}
            </div>
          </div>
          
          {/* Untuk room user-to-admin showroom, hanya "Join" (tanpa eskalasi) */}
          <button onClick={joinPercakapan} className="px-3 py-2 text-sm bg-blue-600 text-white rounded" style={{ display: 'none' }}>
            <ShieldCheck className="inline w-4 h-4 mr-1" />
            {activeRoom?.room_type === 'user_to_admin' ? 'Join' : 'Join/Eskalasi'}
          </button>
          
          {activeRoom?.is_escalated && !(activeRoom as any).resolved_at && (
            <button 
              onClick={handleResolveEscalation} 
              className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              <CheckCircle className="inline w-4 h-4 mr-1" />
              Selesaikan Eskalasi
            </button>
          )}
          <button onClick={tutupPercakapan} className="px-3 py-2 text-sm bg-gray-200 rounded" style={{ display: 'none' }}>
            <XCircle className="inline w-4 h-4 mr-1" />
            Tutup
          </button>

          {/* Tombol titik-tiga dengan dropdown */}
          <div className="relative" ref={headerMenuRef}>
            <button
              onClick={() => setShowHeaderMenu(prev => !prev)}
              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
              disabled={!activeRoom}
              title="Menu"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showHeaderMenu && activeRoom && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
                <button
                  onClick={async () => {
                    if (!activeRoom?.id) return;
                    const ok = window.confirm('Hapus semua pesan dalam obrolan ini? Tindakan tidak dapat dibatalkan.');
                    if (!ok) {
                      setShowHeaderMenu(false);
                      return;
                    }
                    try {
                      const beforeMsgs = await fetchMessages(activeRoom.id);
                      console.log('Messages before delete:', beforeMsgs?.length ?? 0);

                      const res = await deleteRoomHistory(activeRoom.id);
                      console.log('deleteRoomHistory result:', res);

                      const afterMsgs = await fetchMessages(activeRoom.id);
                      setMessages(afterMsgs);

                      setShowHeaderMenu(false);
                    } catch (err) {
                      console.error('Gagal menghapus obrolan:', err);
                      alert('Terjadi kesalahan saat menghapus obrolan. Lihat console untuk detail.');
                      setShowHeaderMenu(false);
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Hapus Obrolan
                </button>
              </div>
            )}
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-4 space-y-2">
          {!activeRoom ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                Pilih percakapan di kiri
              </div>
            </div>
          ) : (
            <>
              {messages.map(m => {
                const isUser2 = activeRoom && m.sender_id === activeRoom.user2_id;
                const isMine = profile?.id && m.sender_id === profile.id;
                const isAdminEscalationMsg = isEscalatedRoom && m.chat_type === 'admin';
              
                let rowCls, bubbleCls;
                if (isAdminEscalationMsg) {
                  // Admin saat eskalasi: hijau di tengah
                  rowCls = 'justify-center';
                  bubbleCls = 'bg-green-100 text-green-800 border border-green-200 rounded-lg';
                } else {
                  // Admin menjawab pertanyaan showroom: kanan biru (sebagai pesan milik sendiri)
                  rowCls = isMine ? 'justify-end' : (isUser2 ? 'justify-end' : 'justify-start');
                  bubbleCls = (isMine || isUser2)
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none';
                }
              
                const attachments = (m as any).chat_attachments;
                const att = Array.isArray(attachments) ? attachments[0] : attachments;

                // Helper function to check if file is an image
                const isImage = (fileName: string) => {
                  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
                  return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
                };

                // Parse teks + carInfo untuk pesan text/car_info
                let isiPesan = m.message_type === 'text' ? m.message_text : (att?.file_name || m.message_text);
                let carInfoData: { carId: string; title: string; imageUrl: string | null } | null = null;

                if (m.message_type === 'text') {
                  try {
                    const parsed = JSON.parse(m.message_text || '{}');
                    if (parsed && typeof parsed === 'object') {
                      if (typeof parsed.text === 'string') {
                        isiPesan = parsed.text;
                      }
                      if (parsed.carInfo) {
                        carInfoData = {
                          carId: parsed.carInfo.carId,
                          title: parsed.carInfo.title,
                          imageUrl: parsed.carInfo.imageUrl ?? null
                        };
                      }
                    }
                  } catch {
                    // biarkan sebagai teks biasa jika bukan JSON
                  }
                } else if (m.message_type === 'car_info') {
                  try {
                    const parsed = JSON.parse(m.message_text || '{}');
                    carInfoData = {
                      carId: parsed.carId,
                      title: parsed.title,
                      imageUrl: parsed.imageUrl ?? null
                    };
                    isiPesan = parsed.title || 'Informasi mobil';
                  } catch {
                    // fallback ke teks mentah bila parsing gagal
                  }
                }

                return (
                  <div key={m.id} className={`flex ${rowCls}`}>
                    <div className={`max-w-[75%] rounded-2xl ${bubbleCls} ${m.message_type === 'image' || (att?.file_name && isImage(att.file_name)) ? 'p-1' : 'px-3 py-2'}`}>
                      {/* Tampilkan gambar langsung jika tipe image */}
                      {(m.message_type === 'image' || (att?.file_name && isImage(att.file_name))) && att?.file_url ? (
                        <div className="relative">
                          <img 
                            src={att.file_url} 
                            alt="Gambar"
                            className="max-w-full h-auto rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                            style={{ maxHeight: '300px', minWidth: '150px' }}
                            onClick={() => window.open(att.file_url, '_blank')}
                          />
                          <div className="absolute bottom-1 right-2 bg-black bg-opacity-50 text-white text-[10px] px-1.5 py-0.5 rounded">
                            {new Date(m.sent_at || m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Preview mobil di dalam bubble jika ada carInfo */}
                          {carInfoData && (
                            <div className="mb-2 bg-white border border-gray-200 rounded-lg p-2 flex items-center">
                              <div className="flex-shrink-0 mr-2">
                                {carInfoData.imageUrl ? (
                                  <img
                                    src={carInfoData.imageUrl}
                                    alt={carInfoData.title}
                                    className="w-10 h-10 object-cover rounded-md"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      const next = e.currentTarget.nextElementSibling as HTMLElement;
                                      if (next) next.style.display = 'flex';
                                    }}
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gray-200 rounded-md flex items-center justify-center">
                                    <Car className="w-5 h-5 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate text-black">
                                  {carInfoData.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Klik untuk detail
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Label admin jika pesan dari admin */}
                          {isAdminEscalationMsg && (
                            <div className="text-xs font-semibold text-green-700 mb-1">
                              👨‍💼 Admin
                            </div>
                          )}

                          {/* Teks atau nama file untuk non-image */}
                          <div className="text-sm break-words">
                            {isiPesan}
                          </div>

                          {/* Link file jika ada dan bukan gambar */}
                          {att?.file_url && m.message_type !== 'text' && !(att?.file_name && isImage(att.file_name)) && (
                            <div className="mt-1">
                              <a href={att.file_url} target="_blank" rel="noreferrer" className={isAdminEscalationMsg
                                ? 'text-green-600 underline'
                                : (isMine || isUser2) ? 'text-blue-100 underline' : 'text-blue-600 underline'}
                              >
                                Buka lampiran
                              </a>
                            </div>
                          )}
                          {/* Timestamp untuk non-image */}
                          <div className={`text-[11px] mt-1 ${
                            isAdminEscalationMsg ? 'text-green-600' : (isMine || isUser2) ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(m.sent_at || m.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </>
          )}
        </section>

        {/* Car attachment preview - shows when car will be sent with first message */}
        {activeRoom?.car_id && (() => {
          const hasCarAttachmentForRoom = messages.some((mm) => {
            if (mm.message_type === 'car_info') return true;
            if (mm.message_type === 'text') {
              try {
                const parsed = JSON.parse(mm.message_text);
                const carIdInMsg = parsed?.carId || parsed?.carInfo?.carId;
                return carIdInMsg === activeRoom.car_id;
              } catch {
                return false;
              }
            }
            return false;
          });
          
          return !hasCarAttachmentForRoom && canReply ? (
            <div className="px-3 py-2 border-t bg-blue-50">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Car className="w-4 h-4" />
                <span>Lampiran mobil akan dikirim bersama pesan pertama</span>
                <div className="flex-1" />
                <div className="bg-white border border-blue-200 rounded px-2 py-1 text-xs">
                  {carTitleMap[activeRoom.car_id] || activeRoom.car_id}
                </div>
              </div>
            </div>
          ) : null;
        })()}

        {/* Footer: aktif untuk escalated chat atau jika admin adalah participant */}
        <footer className="p-3 border-t bg-white flex gap-2">
          {/* Status indicator */}
          {activeRoom && (
            <div className="flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
              {isResolvedEscalation ? (
                <span className="flex items-center text-green-600">
                  ✅ <span className="ml-1">Eskalasi Selesai</span>
                </span>
              ) : isEscalatedRoom ? (
                <span className="flex items-center">
                  🚨 <span className="ml-1">Eskalasi</span>
                </span>
              ) : isAdminParticipant ? (
                <span className="flex items-center">
                  👨‍💼 <span className="ml-1">Participant</span>
                </span>
              ) : (
                <span className="flex items-center">
                  👁️ <span className="ml-1">Read-only</span>
                </span>
              )}
            </div>
          )}
          
          {/* Tombol klip untuk lampiran */}
          <button
            className={`px-3 py-2 rounded ${canReply ? 'bg-gray-200 hover:bg-gray-300' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            disabled={!canReply}
            onClick={handleAttachClick}
            title="Lampirkan file/foto"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          {/* Input file tersembunyi */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelected}
            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,application/x-zip-compressed,video/*,audio/*"
          />
          <input
            className={`flex-1 border rounded px-3 py-2 ${canReply ? 'border-gray-300 focus:border-blue-500' : 'border-gray-200 bg-gray-50'}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isResolvedEscalation
                ? 'Eskalasi sudah selesai - tidak dapat membalas'
                : canReply 
                  ? isEscalatedRoom 
                    ? 'Balas sebagai Admin...' 
                    : 'Tulis pesan...'
                  : 'Mode baca saja - tidak dapat membalas'
            }
            disabled={!canReply}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendSupport();
              }
            }}
          />
          <button
            className={`px-4 py-2 rounded ${canReply ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
            disabled={!canReply}
            onClick={handleSendSupport}
          >
            <Send className="inline w-4 h-4 mr-1" />
            Kirim
          </button>
        </footer>
      </main>
    </div>
  );
}