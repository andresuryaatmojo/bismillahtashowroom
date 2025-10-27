import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, LifeBuoy, MessageSquare, AlertCircle, ChevronRight } from 'lucide-react';

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

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const sendUserMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: BotMessage = { id: crypto.randomUUID(), role: 'user', text: text.trim(), createdAt: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    // Simulasi jawaban bot (placeholder)
    setTimeout(() => {
      const botReply: BotMessage = {
        id: crypto.randomUUID(),
        role: 'bot',
        text: generateBotReply(text),
        createdAt: Date.now()
      };
      setMessages(prev => [...prev, botReply]);
      setIsThinking(false);
    }, 900);
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

  const handleEscalate = () => {
    setIsEscalated(true);
    setMessages(prev => [
      ...prev,
      { id: crypto.randomUUID(), role: 'system', text: 'Percakapan dialihkan ke Admin. Harap tunggu respon.', createdAt: Date.now() }
    ]);
  };

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
          onClick={handleEscalate}
          title="Eskalasi ke Admin"
        >
          <LifeBuoy className="inline w-4 h-4 mr-1" />
          {isEscalated ? 'Sudah dialihkan' : 'Eskalasikan ke Admin'}
        </button>
      </header>

      <div className="p-3 bg-white border-b">
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map(s => (
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
}