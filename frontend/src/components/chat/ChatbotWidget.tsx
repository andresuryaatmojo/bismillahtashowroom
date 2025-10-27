import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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

  const send = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;
    const userMsg: ChatItem = { id: crypto.randomUUID(), role: 'user', content, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Bot response (mock)
    setTimeout(() => {
      const reply = getBotReply(content);
      const botMsg: ChatItem = { id: crypto.randomUUID(), role: 'bot', content: reply, ts: Date.now() };
      setMessages(prev => [...prev, botMsg]);
    }, 500);
  };

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

  const escalateToAdmin = () => {
    setOpen(false);
    navigate('/chat');
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