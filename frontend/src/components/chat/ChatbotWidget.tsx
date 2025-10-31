import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type ChatRole = 'user' | 'bot';
type ChatItem = { id: string; role: ChatRole; content: string; ts: number };

const defaultSuggestions = [
  'Bantuan memilih mobil',
  'Simulasi kredit',
  'Jadwal test drive',
  'Promo & diskon',
];

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatItem[]>(() => {
    try {
      const raw = localStorage.getItem('chatbot_widget_messages');
      return raw ? JSON.parse(raw) : [
        { id: crypto.randomUUID(), role: 'bot', content: 'Halo! Ada yang bisa saya bantu hari ini?', ts: Date.now() },
      ];
    } catch {
      return [{ id: crypto.randomUUID(), role: 'bot', content: 'Halo! Ada yang bisa saya bantu hari ini?', ts: Date.now() }];
    }
  });
  const navigate = useNavigate();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('chatbot_widget_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages]);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  const { user } = useAuth();

  // Session ID khusus untuk widget hero, disimpan di localStorage
  const [sessionId] = useState<string>(() => {
    try {
      const existing = localStorage.getItem('chatbot_widget_session_id');
      if (existing) return existing;
      const id = crypto.randomUUID();
      localStorage.setItem('chatbot_widget_session_id', id);
      return id;
    } catch {
      return `session_${Date.now()}`;
    }
  });

  const getBotReply = (q: string) => {
    const lower = q.toLowerCase();
    if (lower.includes('kredit') || lower.includes('cicil')) {
      return 'Untuk simulasi kredit, Anda bisa buka menu Simulasi dan pilih tenor serta DP. Mau saya arahkan ke halaman simulasi?';
    }
    if (lower.includes('test') || lower.includes('drive')) {
      return 'Anda bisa menjadwalkan test drive di halaman Test Drive. Pilih tanggal dan lokasi yang tersedia.';
    }
    if (lower.includes('promo') || lower.includes('diskon')) {
      return 'Promo aktif tersedia di halaman Konten/Promo. Anda bisa melihat detail promo di sana.';
    }
    if (lower.includes('mobil') || lower.includes('rekomendasi')) {
      return 'Saya bisa membantu rekomendasi berdasarkan budget dan kebutuhan. Sebutkan budget atau tipe mobil yang Anda cari.';
    }
    return 'Saya memahami pertanyaan Anda. Jika perlu bantuan langsung, tekan "Hubungi Admin" di bawah untuk chat manusia.';
  };

  // HAPUS deklarasi awal ini:
  // const escalateToAdmin = () => {
  //   setOpen(false);
  //   navigate('/chat');
  // };

  // Deteksi intent sederhana dari teks user
  const detectIntent = (q: string): string => {
    const lower = q.toLowerCase();
    if (lower.includes('kredit') || lower.includes('cicil')) return 'credit_simulation';
    if (lower.includes('test') || lower.includes('drive')) return 'test_drive';
    if (lower.includes('promo') || lower.includes('diskon')) return 'promotion_info';
    if (lower.includes('mobil') || lower.includes('rekomendasi')) return 'car_recommendation';
    return 'general';
  };

  // Cari knowledge yang paling relevan (is_active = true) dengan FTS pada kolom question
  const findKnowledgeMatch = async (q: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('chatbot_knowledge_base')
        .select('id, question, answer, priority, is_active, updated_at')
        .eq('is_active', true)
        .textSearch('question', q, { type: 'websearch', config: 'indonesian' })
        .order('priority', { ascending: false })
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.warn('findKnowledgeMatch error', error);
        return null;
      }
      if (data && data.length > 0) {
        return (data[0] as any).id as string;
      }
      return null;
    } catch (err) {
      console.warn('findKnowledgeMatch exception', err);
      return null;
    }
  };

  // Pastikan ada room user_to_admin, jika belum ada maka buat
  const ensureAdminRoom = async (): Promise<{ roomId: string | null; adminId: string | null }> => {
    try {
      if (!user?.id) return { roomId: null, adminId: null };
  
      // Cari admin showroom (ambil yang pertama)
      const { data: adminRow, error: adminErr } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
  
      if (adminErr) {
        console.warn('Gagal mencari admin, fallback ke env:', adminErr.message);
      }
  
      const adminId =
        (adminRow?.id as string | undefined) ||
        (process.env.REACT_APP_ADMIN_USER_ID as string | undefined) ||
        null;
  
      if (!adminId) {
        console.warn('Tidak ditemukan adminId untuk eskalasi.');
        return { roomId: null, adminId: null };
      }
  
      // Cek room aktif existing tipe user_to_admin antara user dan admin
      const { data: rooms, error: roomErr } = await supabase
        .from('chat_rooms')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${adminId}),and(user1_id.eq.${adminId},user2_id.eq.${user.id})`)
        .eq('status', 'active')
        .eq('room_type', 'user_to_admin')
        .limit(1);
  
      if (roomErr) {
        console.warn('Gagal cek room admin:', roomErr.message);
      }
  
      if (rooms && rooms.length > 0) {
        const roomId = (rooms[0] as any).id as string;
        return { roomId, adminId };
      }
  
      // Buat room baru jika belum ada
      const { data: created, error: createErr } = await supabase
        .from('chat_rooms')
        .insert([{
          user1_id: user.id,
          user2_id: adminId,
          car_id: null,
          room_type: 'user_to_admin',
          status: 'active'
        }])
        .select()
        .single();
  
      if (createErr) {
        console.error('Gagal membuat room admin:', createErr);
        return { roomId: null, adminId };
      }
  
      const newRoomId = (created as any).id as string;
  
      // Tandai room dieskalasi agar terlihat di panel admin
      try {
        await supabase.from('chat_rooms').update({ is_escalated: true }).eq('id', newRoomId);
      } catch (e) {
        console.warn('Gagal menandai is_escalated di chat_rooms:', e);
      }
  
      return { roomId: newRoomId, adminId };
    } catch (e) {
      console.error('ensureAdminRoom error:', e);
      return { roomId: null, adminId: null };
    }
  };

  // Kirim pesan awal "butuh bantuan" ke admin dalam room tertentu
  const sendHelpMessageToAdmin = async (roomId: string, adminId: string) => {
    try {
      if (!user?.id) return;
      await supabase.from('chat_messages').insert([{
        room_id: roomId,
        sender_id: user.id,
        receiver_id: adminId,
        message_text: 'Halo Admin, saya butuh bantuan dari chatbot.',
        message_type: 'text',
        chat_type: 'user'
      }]);
    } catch (e) {
      console.warn('Gagal mengirim pesan bantuan ke admin:', e);
    }
  };

  // SATUKAN ke satu fungsi async ini (tidak ada deklarasi ganda)
  const escalateToAdmin = async () => {
    try {
      // Tuliskan pesan sistem di UI
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: 'bot', content: 'Percakapan dialihkan ke Admin. Harap tunggu respon.', ts: Date.now() }
      ]);
  
      // Pastikan ada room admin
      const { roomId, adminId } = await ensureAdminRoom();
  
      // Catat eskalasi ke chatbot_conversations dengan escalated_to_room_id
      try {
        const { data: u } = await supabase.auth.getUser();
        const authId = u?.user?.id ?? null;
  
        await supabase.from('chatbot_conversations').insert([{
          user_id: authId,
          session_id: sessionId,
          user_question: '(eskalasi) hubungi admin',
          bot_response: 'Percakapan dialihkan ke Admin.',
          matched_knowledge_id: null,
          detected_intent: 'escalation_to_admin',
          confidence_score: null,
          extracted_entities: null,
          is_helpful: null,
          feedback_text: null,
          is_escalated: true,
          escalated_to_room_id: roomId ?? null
        }]);
      } catch (e) {
        console.warn('Gagal mencatat eskalasi ke chatbot_conversations:', e);
      }
  
      // Kirim pesan awal ke admin jika room tersedia
      if (roomId && adminId) {
        await sendHelpMessageToAdmin(roomId, adminId);
        setOpen(false);
        navigate('/chat', { state: { activeRoomId: roomId } });
      } else {
        // Jika tidak bisa memastikan room admin, tetap tutup widget dan arahkan ke chat umum
        setOpen(false);
        navigate('/chat');
      }
    } catch (e) {
      console.error('Eskalasi ke admin gagal:', e);
      setOpen(false);
      navigate('/chat');
    }
  };

  // Pindahkan send ke dalam komponen agar akses state/variabel valid
  const send = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    const userMsg: ChatItem = { id: crypto.randomUUID(), role: 'user', content, ts: Date.now() };
    setMessages((prev: ChatItem[]) => [...prev, userMsg]);
    setInput('');

    // Bot response (mock)
    setTimeout(() => {
      const reply = getBotReply(content);
      const botMsg: ChatItem = { id: crypto.randomUUID(), role: 'bot', content: reply, ts: Date.now() };
      setMessages((prev: ChatItem[]) => [...prev, botMsg]);

      // Catat percakapan ke chatbot_conversations
      (async () => {
        try {
          const { data: u } = await supabase.auth.getUser();
          const authId = u?.user?.id ?? null;

          // Lengkapi intent dan knowledge match
          const intent = detectIntent(content);
          const matchedId = await findKnowledgeMatch(content);

          const { error } = await supabase.from('chatbot_conversations').insert([{
            user_id: authId,
            session_id: sessionId,
            user_question: content,
            bot_response: reply,
            matched_knowledge_id: matchedId,     // diisi dari FTS
            detected_intent: intent,             // diisi dari keyword detection
            confidence_score: null,
            extracted_entities: null,
            is_helpful: null,
            feedback_text: null,
            is_escalated: false,
            escalated_to_room_id: null
          }]);

          if (error) {
            console.error('Insert chatbot_conversations ditolak oleh RLS:', error);
          }
        } catch (err) {
          console.error('Gagal mencatat percakapan (widget) ke chatbot_conversations:', err);
        }
      })();
    }, 500);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        aria-label="Buka chatbot bantuan"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="hidden sm:inline">Bantuan</span>
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-6 z-50 w-[360px] max-w-[92vw] bg-white border rounded-xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Asisten Showroom</div>
                  <div className="text-xs text-gray-500">Online • respons cepat</div>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded" onClick={() => setOpen(false)} aria-label="Tutup">
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Messages */}
            <div ref={listRef} className="max-h-[320px] overflow-y-auto p-3 space-y-2">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${
                      m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggestions */}
            <div className="px-3 pb-2 flex gap-2 flex-wrap">
              {defaultSuggestions.map(s => (
                <button
                  key={s}
                  className="text-xs px-2 py-1 rounded-full border hover:bg-gray-50"
                  onClick={() => send(s)}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t space-y-2">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && canSend && send()}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  placeholder="Tulis pertanyaan Anda..."
                />
                <button
                  disabled={!canSend}
                  onClick={() => send()}
                  className={`p-2 rounded-lg ${canSend ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-500'}`}
                  aria-label="Kirim"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={escalateToAdmin}
                className="w-full text-sm px-3 py-2 rounded-lg border hover:bg-gray-50"
              >
                Hubungi Admin
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}