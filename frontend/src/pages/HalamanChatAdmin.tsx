import React, { useEffect, useRef, useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, User, MessageSquare, ShieldCheck, Send } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-96 bg-white border-r flex flex-col">
        <div className="p-3 border-b">
          <div className="font-semibold mb-2">Chat Admin</div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="w-full pl-9 pr-3 py-2 border rounded"
                placeholder="Cari percakapan..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <select
              className="border rounded px-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
            >
              <option value="all">Semua</option>
              <option value="open">Open</option>
              <option value="escalated">Escalated</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(p => (
            <button
              key={p.id}
              className={`w-full text-left p-3 border-b hover:bg-gray-50 ${aktif?.id === p.id ? 'bg-blue-50' : ''}`}
              onClick={() => setAktif(p)}
            >
              <div className="flex justify-between">
                <div className="font-medium">{p.title}</div>
                {p.unreadCount > 0 && (
                  <span className="text-xs bg-blue-600 text-white px-2 rounded">{p.unreadCount}</span>
                )}
              </div>
              <div className="text-xs text-gray-500">{p.context} • {new Date(p.updatedAt).toLocaleString()}</div>
              <div className="mt-1">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  p.status === 'open' ? 'bg-green-100 text-green-700' :
                  p.status === 'escalated' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-200 text-gray-700'
                }`}>
                  {p.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Thread */}
      <main className="flex-1 flex flex-col">
        <header className="p-4 bg-white border-b flex items-center gap-3">
          <User className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <div className="font-semibold">{aktif?.title || 'Pilih percakapan'}</div>
            <div className="text-xs text-gray-500">{aktif?.context}</div>
          </div>
          <button onClick={joinPercakapan} className="px-3 py-2 text-sm bg-blue-600 text-white rounded">
            <ShieldCheck className="inline w-4 h-4 mr-1" />
            Join/Eskalasi
          </button>
          <button onClick={tutupPercakapan} className="px-3 py-2 text-sm bg-gray-200 rounded">
            <XCircle className="inline w-4 h-4 mr-1" />
            Tutup
          </button>
        </header>

        <section className="flex-1 overflow-y-auto p-4 space-y-2">
          {!aktif ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                Pilih percakapan di kiri
              </div>
            </div>
          ) : (
            <>
              {aktif.messages.map(m => (
                <div
                  key={m.id}
                  className={`max-w-[70%] p-3 rounded ${
                    m.role === 'admin' ? 'ml-auto bg-blue-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="text-sm">{m.text}</div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    {new Date(m.createdAt).toLocaleTimeString()} • {m.role}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </>
          )}
        </section>

        <footer className="p-3 border-t bg-white flex gap-2">
          <input
            className="flex-1 border rounded px-3 py-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis pesan sebagai Admin..."
            disabled={!aktif}
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            onClick={kirimPesanAdmin}
            disabled={!aktif || !input.trim()}
          >
            <Send className="inline w-4 h-4 mr-1" />
            Kirim
          </button>
        </footer>
      </main>
    </div>
  );
}