import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, LifeBuoy, MessageSquare, AlertCircle, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Role = 'user' | 'bot' | 'system';

interface BotMessage {
  id: string;
  role: Role;
  text: string;
  createdAt: number;
}

const SUGGESTIONS = [
  'Jadwal test drive',
  'Syarat pembelian kredit',
  'Ketersediaan unit',
  'Estimasi biaya balik nama',
  'Garansi dan layanan purna jual',
];

export default function AntarmukaChatbot() {
  const [messages, setMessages] = useState<BotMessage[]>([
    { id: crypto.randomUUID(), role: 'system', text: 'Halo! Saya asisten Mobilindo. Ada yang bisa dibantu?', createdAt: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isEscalated, setIsEscalated] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [roomId, setRoomId] = useState<string | null>(null);

  // ID sesi lokal untuk mengelompokkan percakapan
  const [sessionId] = useState<string>(() => {
    const existing = localStorage.getItem('chatbot_session_id');
    if (existing) return existing;
    const sid = crypto.randomUUID();
    localStorage.setItem('chatbot_session_id', sid);
    return sid;
  });

  // Daftar tag untuk filter
  const [tags, setTags] = useState<{ id: number; name: string }[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<number | 'all'>('all');
  const [tagKnowledgeSuggestions, setTagKnowledgeSuggestions] = useState<string[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [tagSuggestions, setTagSuggestions] = useState<string[]>(SUGGESTIONS);

  // Tentukan saran yang akan ditampilkan (prioritas: knowledge → tags dinamis → default)
  const suggestionsToShow: string[] =
    tagKnowledgeSuggestions.length > 0
      ? tagKnowledgeSuggestions
      : tagSuggestions.length > 0
      ? tagSuggestions
      : SUGGESTIONS;
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Memastikan ada room 'user_to_bot' untuk user saat halaman dibuka
  useEffect(() => {
    (async () => {
      if (!user?.id) return;
      try {
        const botId = process.env.REACT_APP_BOT_USER_ID || user.id; // fallback ke self jika BOT tidak dikonfigurasi
        const { data: rooms, error } = await supabase
          .from('chat_rooms')
          .select('*')
          .eq('user1_id', user.id)
          .eq('room_type', 'user_to_bot')
          .eq('status', 'active')
          .limit(1);
        if (error) throw error;

        if (rooms && rooms.length > 0) {
          setRoomId(rooms[0].id);
        } else {
          const { data: created, error: insErr } = await supabase
            .from('chat_rooms')
            .insert([{
              user1_id: user.id,
              user2_id: botId,
              car_id: null,
              room_type: 'user_to_bot',
              status: 'active'
            }])
            .select()
            .single();
          if (insErr) throw insErr;
          setRoomId(created.id);
        }
      } catch (e) {
        console.error('Gagal memastikan room chatbot:', e);
      }
    })();
  }, [user?.id]);

  // Muat daftar tag aktif (id, name)
  useEffect(() => {
    (async () => {
      try {
        setLoadingTags(true);
        const { data, error } = await supabase
          .from('chatbot_tags')
          .select('id, name')
          .eq('is_active', true)
          .order('name', { ascending: true });
        if (error) throw error;
        setTags((data || []).map((r: any) => ({ id: r.id as number, name: r.name as string })));
      } catch (err) {
        console.warn('Gagal memuat tag:', err);
        setTags([]);
      } finally {
        setLoadingTags(false);
      }
    })();
  }, []);

  // Saat tag dipilih, ambil daftar knowledge terkait untuk ditampilkan sebagai saran pertanyaan
  useEffect(() => {
    (async () => {
      if (selectedTagId === 'all') {
        setTagKnowledgeSuggestions([]);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('chatbot_knowledge_tags')
          .select('chatbot_knowledge_base(question)')
          .eq('tag_id', selectedTagId)
          .limit(10);
        if (error) throw error;
        const suggestions = (data || [])
          .map((r: any) => r.chatbot_knowledge_base?.question)
          .filter((q: any) => typeof q === 'string');
        setTagKnowledgeSuggestions(suggestions as string[]);
      } catch (err) {
        console.warn('Gagal memuat saran knowledge berdasarkan tag:', err);
        setTagKnowledgeSuggestions([]);
      }
    })();
  }, [selectedTagId]);
  // REMOVED: duplicate state and effects
  // const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  // const [loadingTags, setLoadingTags] = useState(false);
  // useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isThinking]);
  // useEffect(() => { /* load tag suggestions */ }, []);

  // Muat daftar tag aktif untuk saran (fallback ke SUGGESTIONS jika gagal)
  useEffect(() => {
    (async () => {
      try {
        setLoadingTags(true);
        const { data, error } = await supabase
          .from('chatbot_tags')
          .select('name')
          .eq('is_active', true)
          .order('name', { ascending: true });
  
        if (error) throw error;
        setTagSuggestions((data || []).map((r: any) => r.name as string));
      } catch (err) {
        console.warn('Gagal memuat tag saran, menggunakan default:', err);
        setTagSuggestions([]);
      } finally {
        setLoadingTags(false);
      }
    })();
  }, []);
  
  // Cari jawaban di knowledge base (is_active = true, urut prioritas) dengan filter tag (jika ada)
  // Ubah signature dan pastikan semua return berupa objek
  async function getBotAnswerFor(text: string): Promise<{ answer: string | null; knowledgeId?: string; confidence?: number }> {
    try {
      const term = text.trim();
      if (!term) return { answer: null, confidence: 0 };
  
      let query = supabase
        .from('chatbot_knowledge_base')
        .select('id, question, answer, priority, is_active, updated_at')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .order('updated_at', { ascending: false })
        .limit(1);
  
      // Full-text search pada kolom 'question'
      query = query.textSearch('question', term, { type: 'websearch', config: 'indonesian' });
  
      // Jika ada tag terpilih, batasi ke knowledge yang memiliki tag tersebut
      if (selectedTagId !== 'all') {
        const { data: rel, error: relErr } = await supabase
          .from('chatbot_knowledge_tags')
          .select('knowledge_id')
          .eq('tag_id', selectedTagId);
        if (relErr) throw relErr;
        const ids = (rel || []).map((r: any) => r.knowledge_id);
        if (ids.length > 0) {
          query = query.in('id', ids);
        } else {
          // Tidak ada knowledge untuk tag ini
          return { answer: null, confidence: 0.2 };
        }
      }
  
      const { data, error } = await query;
      if (error) throw error;
  
      if (data && data.length > 0) {
        const row = data[0] as any;
        return { answer: row.answer as string, knowledgeId: row.id as string, confidence: 0.9 };
      }
      return { answer: null, confidence: 0.4 };
    } catch (err) {
      console.error('Gagal mencari jawaban:', err);
      return { answer: null, confidence: 0 };
    }
  }
  
  const sendUserMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: BotMessage = { id: crypto.randomUUID(), role: 'user', text: text.trim(), createdAt: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);
  
    // Simpan pesan user ke chat_messages (jika room tersedia)
    if (roomId && user?.id) {
      try {
        const botId = process.env.REACT_APP_BOT_USER_ID || user.id;
        await supabase.from('chat_messages').insert([{
          room_id: roomId,
          sender_id: user.id,
          receiver_id: botId,
          message_text: text.trim(),
          message_type: 'text',
          chat_type: 'user'
        }]);
      } catch (err) {
        console.warn('Gagal menyimpan pesan user:', err);
      }
    }

    // Cari jawaban dari knowledge base
    const result = await getBotAnswerFor(text);
    const botReply: BotMessage = {
      id: crypto.randomUUID(),
      role: 'bot',
      text: result.answer ?? generateBotReply(text),
      createdAt: Date.now()
    };
    setMessages(prev => [...prev, botReply]);
    setIsThinking(false);

    // Simpan balasan bot ke chat_messages (jika room tersedia)
    if (roomId && user?.id) {
      try {
        const botId = process.env.REACT_APP_BOT_USER_ID || user.id;
        await supabase.from('chat_messages').insert([{
          room_id: roomId,
          sender_id: botId,
          receiver_id: user.id,
          message_text: botReply.text,
          message_type: 'text',
          chat_type: 'bot'
        }]);
      } catch (err) {
        console.warn('Gagal menyimpan pesan bot:', err);
      }
    }

    // Catat percakapan ke chatbot_conversations
    try {
      await supabase.from('chatbot_conversations').insert([{
        user_id: user?.auth_user_id ?? null,            // gunakan UUID auth user
        session_id: sessionId,                          // varchar(100), aman
        user_question: text.trim(),                     // NOT NULL
        bot_response: botReply.text,                    // NOT NULL
        matched_knowledge_id: result.knowledgeId ?? null,
        detected_intent: null,
        confidence_score: result.confidence ?? null,
        extracted_entities: null,
        is_helpful: null,
        feedback_text: null,
        is_escalated: isEscalated,
        escalated_to_room_id: isEscalated ? roomId : null
      }]);
    } catch (err) {
      console.error('Gagal mencatat percakapan ke chatbot_conversations:', err);
    }
  };

    const generateBotReply = (q: string) => {
      const ql = q.toLowerCase();
      if (ql.includes('test drive')) {
        return 'Untuk jadwal test drive, silakan pilih tanggal di menu "Test Drive". Kami akan konfirmasi dalam 1x24 jam.';
      }
      if (ql.includes('kredit') || ql.includes('dp')) {
        return 'Skema kredit tersedia dari beberapa bank rekanan. DP minimal 20% dan tenor hingga 60 bulan. Detail simulasi ada di menu "Simulasi Kredit".';
      }
      if (ql.includes('unit') || ql.includes('stok')) {
        return 'Ketersediaan unit bisa dicek di halaman Katalog. Jika Anda punya unit spesifik, kirimkan merk & model untuk kami cek.';
      }
      return 'Terima kasih atas pertanyaannya. Saya akan bantu dengan informasi yang relevan. Jika perlu, Anda bisa eskalasi ke Admin.';
    };

    const handleSend = () => sendUserMessage(input);

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <header className="bg-white border-b p-4 flex items-center gap-3">
          <Bot className="w-6 h-6 text-blue-600" />
          <div>
            <div className="font-semibold">Bantuan (Chatbot)</div>
            <div className="text-xs text-gray-500">Jawaban cepat, bisa eskalasi ke Admin</div>
          </div>
          <button
            className={`ml-auto px-3 py-2 rounded text-sm ${isEscalated ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white'}`}
            disabled={isEscalated}
            onClick={async () => {
              setIsEscalated(true);
              setMessages(prev => [
                ...prev,
                { id: crypto.randomUUID(), role: 'system', text: 'Percakapan dialihkan ke Admin. Harap tunggu respon.', createdAt: Date.now() }
              ]);
              // Tandai room tereskalasi
              if (roomId) {
                try {
                  await supabase.from('chat_rooms').update({ is_escalated: true }).eq('id', roomId);
                } catch (err) {
                  console.warn('Gagal menandai eskalasi:', err);
                }
              }
            }}
            title="Eskalasi ke Admin"
          >
            <LifeBuoy className="inline w-4 h-4 mr-1" />
            {isEscalated ? 'Sudah dialihkan' : 'Eskalasikan ke Admin'}
          </button>
        </header>
  
        <div className="p-3 bg-white border-b space-y-3">
          {/* Chip Tag */}
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 text-sm rounded-full border ${selectedTagId === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setSelectedTagId('all')}
            >
              Semua Tag
            </button>
            {tags.map(t => (
              <button
                key={t.id}
                className={`px-3 py-1 text-sm rounded-full border ${selectedTagId === t.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                onClick={() => setSelectedTagId(t.id)}
                disabled={loadingTags}
              >
                <MessageSquare className="inline w-4 h-4 mr-1" />
                {t.name}
              </button>
            ))}
          </div>
  
          {/* Indikator memuat tag */}
          {loadingTags && (
            <div className="text-xs text-gray-500">Memuat tag...</div>
          )}
  
          {/* Saran pertanyaan: knowledge terkait tag atau fallback dinamis dari chatbot_tags */}
          <div className="flex flex-wrap gap-2">
            {suggestionsToShow.map((s: string) => (
              <button
                key={s}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full"
                onClick={() => sendUserMessage(s)}
              >
                <MessageSquare className="inline w-4 h-4 mr-1" />
                {s}
              </button>
            ))}
          </div>
        </div>
  
        <main className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map(m => (
            <div
              key={m.id}
              className={`max-w-[80%] p-3 rounded ${m.role === 'user' ? 'ml-auto bg-blue-50' : m.role === 'bot' ? 'bg-gray-50' : 'mx-auto bg-yellow-50'}`}
            >
              <div className="text-sm">{m.text}</div>
              <div className="text-[11px] text-gray-500 mt-1">{new Date(m.createdAt).toLocaleTimeString()}</div>
            </div>
          ))}
          {isThinking && (
            <div className="max-w-[60%] p-3 rounded bg-gray-50">
              <div className="text-sm text-gray-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 animate-pulse" />
                Bot sedang menyusun jawaban...
              </div>
            </div>
          )}
          <div ref={endRef} />
        </main>
  
        <footer className="p-3 border-t bg-white flex gap-2">
          <input
            className="flex-1 border rounded px-3 py-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis pertanyaan Anda..."
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSend}>
            <Send className="inline w-4 h-4 mr-1" />
            Kirim
          </button>
        </footer>
  
        {isEscalated && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded shadow flex items-center">
            <ChevronRight className="w-4 h-4 mr-1" />
            Percakapan sedang dialihkan ke Admin
          </div>
        )}
      </div>
    );
  };