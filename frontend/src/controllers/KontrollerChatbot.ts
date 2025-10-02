const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Interface untuk pesan chat
export interface PesanChat {
  id: string;
  pengirim: 'user' | 'bot' | 'human';
  pesan: string;
  waktu: string;
  tipe: 'text' | 'image' | 'file' | 'quick_reply' | 'card' | 'carousel';
  metadata?: {
    confidence?: number;
    intent?: string;
    entities?: any[];
    quickReplies?: string[];
    cards?: CardData[];
    attachments?: AttachmentData[];
  };
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

// Interface untuk data kartu
export interface CardData {
  title: string;
  subtitle?: string;
  image?: string;
  buttons: ButtonData[];
}

// Interface untuk tombol
export interface ButtonData {
  text: string;
  type: 'postback' | 'url' | 'phone';
  value: string;
}

// Interface untuk attachment
export interface AttachmentData {
  type: 'image' | 'file' | 'audio' | 'video';
  url: string;
  name: string;
  size?: number;
}

// Interface untuk sesi chat
export interface SesiChat {
  id: string;
  userId: string;
  status: 'active' | 'escalated' | 'closed';
  startTime: string;
  endTime?: string;
  pesan: PesanChat[];
  context: {
    intent?: string;
    entities?: any;
    userInfo?: any;
    previousQuestions?: string[];
    escalationReason?: string;
  };
  humanAgent?: {
    id: string;
    name: string;
    joinTime: string;
  };
  satisfaction?: {
    rating: number;
    feedback: string;
  };
}

// Interface untuk konfigurasi chatbot
export interface KonfigurasiChatbot {
  isEnabled: boolean;
  welcomeMessage: string;
  fallbackMessage: string;
  escalationThreshold: number;
  maxRetries: number;
  supportedLanguages: string[];
  businessHours: {
    start: string;
    end: string;
    timezone: string;
    workingDays: number[];
  };
  quickReplies: string[];
  knowledgeBase: {
    categories: string[];
    faqs: FAQ[];
  };
}

// Interface untuk FAQ
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  confidence: number;
}

// Interface untuk analisis intent
export interface AnalisisIntent {
  intent: string;
  confidence: number;
  entities: {
    [key: string]: any;
  };
  context: any;
}

export class KontrollerChatbot {
  private token: string | null = null;
  private sesiAktif: SesiChat | null = null;
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private eventListeners: { [event: string]: Function[] } = {};

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  /**
   * Inisialisasi antarmuka chatbot
   * @returns Promise<{success: boolean, sesi: SesiChat, config: KonfigurasiChatbot}>
   */
  public async inisialisasiAntarmuka(): Promise<{
    success: boolean;
    sesi: SesiChat;
    config: KonfigurasiChatbot;
  }> {
    try {
      // Buat sesi chat baru
      const response = await fetch(`${API_BASE_URL}/chatbot/sesi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.sesiAktif = data.data.sesi;

      // Muat konfigurasi chatbot
      const config = await this.muatKonfigurasiChatbot();

      // Inisialisasi WebSocket untuk real-time communication
      await this.inisialisasiWebSocket();

      // Kirim pesan selamat datang
      if (config.welcomeMessage) {
        await this.kirimPesanBot(config.welcomeMessage, 'text');
      }

      return {
        success: true,
        sesi: this.sesiAktif!,  // Non-null assertion since we just set it above
        config
      };

    } catch (error) {
      console.error('Error initializing chatbot interface:', error);
      
      // Fallback: buat sesi lokal
      const fallbackSesi: SesiChat = {
        id: `local_${Date.now()}`,
        userId: 'anonymous',
        status: 'active',
        startTime: new Date().toISOString(),
        pesan: [],
        context: {}
      };

      this.sesiAktif = fallbackSesi;

      return {
        success: false,
        sesi: fallbackSesi,
        config: this.getDefaultConfig()
      };
    }
  }

  /**
   * Kirim pesan ke chatbot
   * @param pertanyaan - Pertanyaan dari user
   * @returns Promise<PesanChat>
   */
  public async kirimPesanKeChatbot(pertanyaan: string): Promise<PesanChat> {
    try {
      if (!this.sesiAktif) {
        throw new Error('Sesi chat belum diinisialisasi');
      }

      // Buat pesan user
      const pesanUser: PesanChat = {
        id: `msg_${Date.now()}_user`,
        pengirim: 'user',
        pesan: pertanyaan,
        waktu: new Date().toISOString(),
        tipe: 'text',
        status: 'sending'
      };

      // Tambahkan ke sesi
      this.sesiAktif.pesan.push(pesanUser);
      this.emitEvent('pesanBaru', pesanUser);

      // Kirim ke server untuk diproses
      const response = await fetch(`${API_BASE_URL}/chatbot/pesan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          sesiId: this.sesiAktif.id,
          pesan: pertanyaan,
          context: this.sesiAktif.context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update status pesan user
      pesanUser.status = 'sent';
      this.emitEvent('pesanUpdate', pesanUser);

      // Proses respons bot
      const pesanBot = data.data.respons;
      this.sesiAktif.pesan.push(pesanBot);
      this.sesiAktif.context = { ...this.sesiAktif.context, ...data.data.context };

      this.emitEvent('pesanBaru', pesanBot);

      return pesanBot;

    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      
      // Fallback: respons error
      const pesanError: PesanChat = {
        id: `msg_${Date.now()}_error`,
        pengirim: 'bot',
        pesan: 'Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi customer service.',
        waktu: new Date().toISOString(),
        tipe: 'text',
        status: 'sent'
      };

      if (this.sesiAktif) {
        this.sesiAktif.pesan.push(pesanError);
      }

      this.emitEvent('pesanBaru', pesanError);
      return pesanError;
    }
  }

  /**
   * Eskalasi percakapan ke manusia
   * @param historyChat - Riwayat percakapan
   * @param alasan - Alasan eskalasi
   * @returns Promise<{success: boolean, agent?: any}>
   */
  public async eskalasiKeManusia(
    historyChat: PesanChat[],
    alasan: string = 'Permintaan pengguna'
  ): Promise<{
    success: boolean;
    agent?: any;
    estimatedWaitTime?: number;
  }> {
    try {
      if (!this.sesiAktif) {
        throw new Error('Sesi chat belum diinisialisasi');
      }

      const response = await fetch(`${API_BASE_URL}/chatbot/eskalasi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          sesiId: this.sesiAktif.id,
          historyChat,
          alasan,
          context: this.sesiAktif.context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update status sesi
      this.sesiAktif.status = 'escalated';
      this.sesiAktif.context.escalationReason = alasan;

      // Kirim pesan notifikasi eskalasi
      const pesanEskalasi: PesanChat = {
        id: `msg_${Date.now()}_escalation`,
        pengirim: 'bot',
        pesan: data.data.message || 'Percakapan Anda sedang dialihkan ke customer service. Mohon tunggu sebentar.',
        waktu: new Date().toISOString(),
        tipe: 'text',
        status: 'sent'
      };

      this.sesiAktif.pesan.push(pesanEskalasi);
      this.emitEvent('pesanBaru', pesanEskalasi);
      this.emitEvent('eskalasi', { alasan, estimatedWaitTime: data.data.estimatedWaitTime });

      return {
        success: true,
        agent: data.data.agent,
        estimatedWaitTime: data.data.estimatedWaitTime
      };

    } catch (error) {
      console.error('Error escalating to human:', error);
      return {
        success: false
      };
    }
  }

  /**
   * Ambil alih percakapan oleh human agent
   * @param agentId - ID agent yang mengambil alih
   * @returns Promise<boolean>
   */
  public async takeOverPercakapan(agentId?: string): Promise<boolean> {
    try {
      if (!this.sesiAktif) {
        throw new Error('Sesi chat belum diinisialisasi');
      }

      const response = await fetch(`${API_BASE_URL}/chatbot/takeover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          sesiId: this.sesiAktif.id,
          agentId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update informasi agent
      this.sesiAktif.humanAgent = {
        id: data.data.agent.id,
        name: data.data.agent.name,
        joinTime: new Date().toISOString()
      };

      // Kirim pesan notifikasi takeover
      const pesanTakeover: PesanChat = {
        id: `msg_${Date.now()}_takeover`,
        pengirim: 'human',
        pesan: `Halo! Saya ${data.data.agent.name} dari customer service. Ada yang bisa saya bantu?`,
        waktu: new Date().toISOString(),
        tipe: 'text',
        status: 'sent'
      };

      this.sesiAktif.pesan.push(pesanTakeover);
      this.emitEvent('pesanBaru', pesanTakeover);
      this.emitEvent('takeover', { agent: data.data.agent });

      return true;

    } catch (error) {
      console.error('Error taking over conversation:', error);
      return false;
    }
  }

  /**
   * Proses pertanyaan baru dengan analisis intent
   * @param pertanyaanBaru - Pertanyaan baru dari user
   * @returns Promise<{intent: string, respons: PesanChat, suggestions?: string[]}>
   */
  public async prosesPertanyaanBaru(pertanyaanBaru: string): Promise<{
    intent: string;
    respons: PesanChat;
    suggestions?: string[];
  }> {
    try {
      // Analisis intent terlebih dahulu
      const analisisIntent = await this.analisisIntent(pertanyaanBaru);

      // Proses berdasarkan intent
      let respons: PesanChat;
      let suggestions: string[] = [];

      switch (analisisIntent.intent) {
        case 'informasi_mobil':
          respons = await this.prosesInformasiMobil(pertanyaanBaru, analisisIntent.entities);
          suggestions = ['Lihat spesifikasi lengkap', 'Bandingkan dengan mobil lain', 'Jadwalkan test drive'];
          break;

        case 'harga_kredit':
          respons = await this.prosesInformasiKredit(pertanyaanBaru, analisisIntent.entities);
          suggestions = ['Simulasi kredit', 'Syarat kredit', 'Promo terbaru'];
          break;

        case 'test_drive':
          respons = await this.prosesTestDrive(pertanyaanBaru, analisisIntent.entities);
          suggestions = ['Jadwal tersedia', 'Syarat test drive', 'Lokasi dealer'];
          break;

        case 'komplain':
          respons = await this.prosesKomplain(pertanyaanBaru);
          suggestions = ['Hubungi customer service', 'Kirim email', 'Chat dengan agent'];
          break;

        default:
          respons = await this.kirimPesanKeChatbot(pertanyaanBaru);
          suggestions = ['Tanya tentang mobil', 'Info kredit', 'Jadwal test drive'];
      }

      return {
        intent: analisisIntent.intent,
        respons,
        suggestions
      };

    } catch (error) {
      console.error('Error processing new question:', error);
      
      // Fallback
      const fallbackRespons = await this.kirimPesanKeChatbot(pertanyaanBaru);
      return {
        intent: 'unknown',
        respons: fallbackRespons
      };
    }
  }

  /**
   * Analisis intent dari pertanyaan user
   * @param pertanyaan - Pertanyaan user
   * @returns Promise<AnalisisIntent>
   */
  private async analisisIntent(pertanyaan: string): Promise<AnalisisIntent> {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({ pertanyaan })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;

    } catch (error) {
      console.error('Error analyzing intent:', error);
      return {
        intent: 'unknown',
        confidence: 0,
        entities: {},
        context: {}
      };
    }
  }

  /**
   * Proses pertanyaan tentang informasi mobil
   */
  private async prosesInformasiMobil(pertanyaan: string, entities: any): Promise<PesanChat> {
    // Implementation for car information processing
    return this.kirimPesanBot(
      'Saya akan membantu Anda mencari informasi mobil. Mobil apa yang ingin Anda ketahui?',
      'text'
    );
  }

  /**
   * Proses pertanyaan tentang kredit
   */
  private async prosesInformasiKredit(pertanyaan: string, entities: any): Promise<PesanChat> {
    return this.kirimPesanBot(
      'Untuk informasi kredit, saya bisa membantu Anda dengan simulasi kredit. Apakah Anda ingin mengetahui cicilan untuk mobil tertentu?',
      'text'
    );
  }

  /**
   * Proses pertanyaan tentang test drive
   */
  private async prosesTestDrive(pertanyaan: string, entities: any): Promise<PesanChat> {
    return this.kirimPesanBot(
      'Untuk test drive, Anda bisa memilih jadwal yang tersedia. Apakah Anda ingin melihat jadwal test drive?',
      'text'
    );
  }

  /**
   * Proses komplain
   */
  private async prosesKomplain(pertanyaan: string): Promise<PesanChat> {
    // Auto-escalate complaints
    await this.eskalasiKeManusia(this.sesiAktif?.pesan || [], 'Komplain pelanggan');
    
    return this.kirimPesanBot(
      'Saya memahami kekhawatiran Anda. Saya akan menghubungkan Anda dengan customer service untuk penanganan lebih lanjut.',
      'text'
    );
  }

  /**
   * Kirim pesan dari bot
   */
  private kirimPesanBot(pesan: string, tipe: PesanChat['tipe'] = 'text'): PesanChat {
    const pesanBot: PesanChat = {
      id: `msg_${Date.now()}_bot`,
      pengirim: 'bot',
      pesan,
      waktu: new Date().toISOString(),
      tipe,
      status: 'sent'
    };

    if (this.sesiAktif) {
      this.sesiAktif.pesan.push(pesanBot);
    }

    this.emitEvent('pesanBaru', pesanBot);
    return pesanBot;
  }

  /**
   * Inisialisasi WebSocket connection
   */
  private async inisialisasiWebSocket(): Promise<void> {
    try {
      const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/chatbot/ws`;
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      };

      this.websocket.onclose = () => {
        console.log('WebSocket disconnected');
        this.handleWebSocketReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  }

  /**
   * Handle WebSocket message
   */
  private handleWebSocketMessage(data: any): void {
    switch (data.type) {
      case 'pesan_baru':
        if (this.sesiAktif) {
          this.sesiAktif.pesan.push(data.pesan);
          this.emitEvent('pesanBaru', data.pesan);
        }
        break;
      case 'agent_join':
        this.emitEvent('agentJoin', data.agent);
        break;
      case 'typing':
        this.emitEvent('typing', data);
        break;
    }
  }

  /**
   * Handle WebSocket reconnection
   */
  private handleWebSocketReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.inisialisasiWebSocket();
      }, 1000 * this.reconnectAttempts);
    }
  }

  /**
   * Muat konfigurasi chatbot
   */
  private async muatKonfigurasiChatbot(): Promise<KonfigurasiChatbot> {
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;

    } catch (error) {
      console.error('Error loading chatbot config:', error);
      return this.getDefaultConfig();
    }
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): KonfigurasiChatbot {
    return {
      isEnabled: true,
      welcomeMessage: 'Halo! Saya asisten virtual Mobilindo. Ada yang bisa saya bantu?',
      fallbackMessage: 'Maaf, saya tidak mengerti. Bisa dijelaskan lebih detail?',
      escalationThreshold: 3,
      maxRetries: 3,
      supportedLanguages: ['id', 'en'],
      businessHours: {
        start: '08:00',
        end: '17:00',
        timezone: 'Asia/Jakarta',
        workingDays: [1, 2, 3, 4, 5]
      },
      quickReplies: [
        'Info mobil',
        'Simulasi kredit',
        'Test drive',
        'Hubungi sales'
      ],
      knowledgeBase: {
        categories: ['mobil', 'kredit', 'service', 'umum'],
        faqs: []
      }
    };
  }

  /**
   * Event listener management
   */
  public addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  public removeEventListener(event: string, callback: Function): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  private emitEvent(event: string, data: any): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Tutup sesi chat
   */
  public async tutupSesi(): Promise<boolean> {
    try {
      if (this.sesiAktif) {
        await fetch(`${API_BASE_URL}/chatbot/sesi/${this.sesiAktif.id}/tutup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.token && { 'Authorization': `Bearer ${this.token}` })
          }
        });

        this.sesiAktif.status = 'closed';
        this.sesiAktif.endTime = new Date().toISOString();
      }

      if (this.websocket) {
        this.websocket.close();
        this.websocket = null;
      }

      this.emitEvent('sesiTutup', this.sesiAktif);
      return true;

    } catch (error) {
      console.error('Error closing chat session:', error);
      return false;
    }
  }

  /**
   * Get current session
   */
  public getSesiAktif(): SesiChat | null {
    return this.sesiAktif;
  }
}

export default KontrollerChatbot;