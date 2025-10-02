/**
 * EntitasUlasan - Kelas untuk mengelola ulasan dan review dari customer
 * Menangani rating, komentar, moderasi, dan analisis sentiment ulasan
 */

export interface IEntitasUlasan {
  idUlasan: string;
  idCustomer: string;
  idMobil: string;
  idPenjual: string;
  ratingUlasan: number;
  judulUlasan: string;
  isiUlasan: string;
  tanggalUlasan: Date;
  statusUlasan: string;
  isVerified: boolean;
  jumlahLike: number;
  jumlahDislike: number;
  updatedAt: Date;
}

export interface IUlasanFilter {
  rating?: number;
  idMobil?: string;
  idPenjual?: string;
  statusUlasan?: string;
  isVerified?: boolean;
  tanggalMulai?: Date;
  tanggalAkhir?: Date;
}

export interface IUlasanAnalytics {
  totalUlasan: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topKeywords: string[];
  verificationRate: number;
}

export interface IUlasanModeration {
  idUlasan: string;
  moderatorId: string;
  action: string;
  reason: string;
  timestamp: Date;
}

export interface IUlasanResponse {
  idResponse: string;
  idUlasan: string;
  responderId: string;
  responderType: string; // 'DEALER', 'ADMIN', 'CUSTOMER'
  isiResponse: string;
  tanggalResponse: Date;
}

export class EntitasUlasan implements IEntitasUlasan {
  // Attributes
  public idUlasan: string;
  public idCustomer: string;
  public idMobil: string;
  public idPenjual: string;
  public ratingUlasan: number;
  public judulUlasan: string;
  public isiUlasan: string;
  public tanggalUlasan: Date;
  public statusUlasan: string;
  public isVerified: boolean;
  public jumlahLike: number;
  public jumlahDislike: number;
  public updatedAt: Date;

  constructor(data: Partial<IEntitasUlasan> = {}) {
    this.idUlasan = data.idUlasan || this.generateId();
    this.idCustomer = data.idCustomer || '';
    this.idMobil = data.idMobil || '';
    this.idPenjual = data.idPenjual || '';
    this.ratingUlasan = data.ratingUlasan || 0;
    this.judulUlasan = data.judulUlasan || '';
    this.isiUlasan = data.isiUlasan || '';
    this.tanggalUlasan = data.tanggalUlasan || new Date();
    this.statusUlasan = data.statusUlasan || 'PENDING';
    this.isVerified = data.isVerified || false;
    this.jumlahLike = data.jumlahLike || 0;
    this.jumlahDislike = data.jumlahDislike || 0;
    this.updatedAt = data.updatedAt || new Date();
  }

  // Main Methods

  /**
   * Membuat ulasan baru dengan validasi dan moderasi otomatis
   * @param ulasanData - Data ulasan yang akan dibuat
   * @returns Promise<IEntitasUlasan> - Ulasan yang telah dibuat
   */
  public async buatUlasan(ulasanData: Partial<IEntitasUlasan>): Promise<IEntitasUlasan> {
    try {
      console.log('[EntitasUlasan] Membuat ulasan baru...');
      
      await this.simulateDelay(300);
      
      // Validasi data ulasan
      await this.validateUlasanData(ulasanData);
      
      // Check apakah customer sudah pernah review mobil ini
      await this.checkDuplicateReview(ulasanData.idCustomer!, ulasanData.idMobil!);
      
      // Verify customer eligibility (sudah beli/test drive)
      const isEligible = await this.verifyCustomerEligibility(ulasanData.idCustomer!, ulasanData.idMobil!);
      
      // Set initial data
      Object.assign(this, ulasanData);
      this.idUlasan = this.generateId();
      this.tanggalUlasan = new Date();
      this.statusUlasan = 'PENDING';
      this.isVerified = isEligible;
      this.updatedAt = new Date();
      
      // Auto-moderation check
      const moderationResult = await this.performAutoModeration();
      
      if (moderationResult.approved) {
        this.statusUlasan = 'APPROVED';
      } else {
        this.statusUlasan = 'FLAGGED';
        await this.flagForManualReview(moderationResult.reasons);
      }
      
      // Sentiment analysis
      const sentiment = await this.analyzeSentiment(this.isiUlasan);
      
      // Save to database
      await this.saveToDatabase();
      
      // Update related entities
      await this.updateMobilRating(this.idMobil, this.ratingUlasan);
      await this.updatePenjualRating(this.idPenjual, this.ratingUlasan);
      
      // Send notifications
      await this.sendNotifications();
      
      // Log activity
      await this.logUlasanActivity('CREATE', this.idUlasan);
      
      // Generate insights
      await this.generateUlasanInsights();
      
      console.log(`[EntitasUlasan] Ulasan berhasil dibuat: ${this.idUlasan}`);
      return this.toJSON();
      
    } catch (error) {
      console.error('[EntitasUlasan] Error membuat ulasan:', error);
      await this.handleUlasanError(error as Error);
      throw error;
    }
  }

  /**
   * Mengambil ulasan berdasarkan filter tertentu
   * @param filter - Filter untuk pencarian ulasan
   * @param sortBy - Kriteria pengurutan
   * @param limit - Jumlah maksimal hasil
   * @returns Promise<IEntitasUlasan[]> - Array ulasan yang sesuai filter
   */
  public async ambilUlasan(filter: IUlasanFilter = {}, sortBy: string = 'tanggal', limit: number = 20): Promise<IEntitasUlasan[]> {
    try {
      console.log('[EntitasUlasan] Mengambil ulasan dengan filter:', filter);
      
      await this.simulateDelay(250);
      
      // Validasi filter
      await this.validateFilter(filter);
      
      // Fetch all reviews from database
      const allUlasan = await this.fetchAllUlasan();
      
      // Apply filters
      let filteredUlasan = await this.applyFilters(allUlasan, filter);
      
      // Sort results
      filteredUlasan = await this.sortUlasan(filteredUlasan, sortBy);
      
      // Limit results
      filteredUlasan = filteredUlasan.slice(0, limit);
      
      // Enrich with additional data
      filteredUlasan = await this.enrichUlasanData(filteredUlasan);
      
      // Update analytics
      await this.updateFilterAnalytics(filter, filteredUlasan.length);
      
      // Log search activity
      await this.logUlasanActivity('SEARCH', '', { filter, resultCount: filteredUlasan.length });
      
      console.log(`[EntitasUlasan] Ditemukan ${filteredUlasan.length} ulasan`);
      return filteredUlasan;
      
    } catch (error) {
      console.error('[EntitasUlasan] Error mengambil ulasan:', error);
      await this.handleUlasanError(error as Error);
      throw error;
    }
  }

  /**
   * Melakukan moderasi ulasan (approve/reject/flag)
   * @param idUlasan - ID ulasan yang akan dimoderasi
   * @param action - Aksi moderasi ('APPROVE', 'REJECT', 'FLAG')
   * @param moderatorId - ID moderator
   * @param reason - Alasan moderasi
   * @returns Promise<boolean> - Status berhasil/gagal
   */
  public async moderasiUlasan(idUlasan: string, action: string, moderatorId: string, reason?: string): Promise<boolean> {
    try {
      console.log(`[EntitasUlasan] Melakukan moderasi ${action} untuk ulasan ${idUlasan}...`);
      
      await this.simulateDelay(200);
      
      // Validasi action
      const validActions = ['APPROVE', 'REJECT', 'FLAG', 'UNFLAG'];
      if (!validActions.includes(action)) {
        throw new Error(`Action moderasi tidak valid: ${action}`);
      }
      
      // Validasi moderator authority
      await this.validateModeratorAuthority(moderatorId, action);
      
      // Get ulasan data
      const ulasan = await this.getUlasanById(idUlasan);
      if (!ulasan) {
        throw new Error(`Ulasan ${idUlasan} tidak ditemukan`);
      }
      
      // Check current status
      if (ulasan.statusUlasan === 'DELETED') {
        throw new Error('Tidak dapat memoderasi ulasan yang sudah dihapus');
      }
      
      // Perform moderation action
      const oldStatus = ulasan.statusUlasan;
      let newStatus = oldStatus;
      
      switch (action) {
        case 'APPROVE':
          newStatus = 'APPROVED';
          break;
        case 'REJECT':
          newStatus = 'REJECTED';
          break;
        case 'FLAG':
          newStatus = 'FLAGGED';
          break;
        case 'UNFLAG':
          newStatus = 'APPROVED';
          break;
      }
      
      // Update ulasan status
      await this.updateUlasanStatus(idUlasan, newStatus);
      
      // Record moderation history
      const moderationRecord: IUlasanModeration = {
        idUlasan,
        moderatorId,
        action,
        reason: reason || '',
        timestamp: new Date()
      };
      
      await this.saveModerationRecord(moderationRecord);
      
      // Send notifications
      await this.sendModerationNotifications(ulasan, action, moderatorId);
      
      // Update statistics
      await this.updateModerationStats(action, oldStatus, newStatus);
      
      // Log moderation activity
      await this.logUlasanActivity('MODERATE', idUlasan, { action, moderatorId, reason });
      
      // Generate moderation insights
      await this.generateModerationInsights(action, ulasan);
      
      console.log(`[EntitasUlasan] Moderasi ${action} berhasil untuk ulasan ${idUlasan}`);
      return true;
      
    } catch (error) {
      console.error('[EntitasUlasan] Error moderasi ulasan:', error);
      await this.handleUlasanError(error as Error);
      return false;
    }
  }

  /**
   * Menganalisis sentiment dan statistik ulasan
   * @param timeRange - Rentang waktu analisis (hari)
   * @param filters - Filter tambahan untuk analisis
   * @returns Promise<IUlasanAnalytics> - Data analytics ulasan
   */
  public async analisisUlasan(timeRange: number = 30, filters: IUlasanFilter = {}): Promise<IUlasanAnalytics> {
    try {
      console.log(`[EntitasUlasan] Menganalisis ulasan ${timeRange} hari terakhir...`);
      
      await this.simulateDelay(500);
      
      // Get ulasan dalam rentang waktu
      const ulasanData = await this.getUlasanInTimeRange(timeRange, filters);
      
      // Hitung total ulasan
      const totalUlasan = ulasanData.length;
      
      // Hitung average rating
      const averageRating = totalUlasan > 0 
        ? ulasanData.reduce((sum, ulasan) => sum + ulasan.ratingUlasan, 0) / totalUlasan 
        : 0;
      
      // Analisis distribusi rating
      const ratingDistribution = await this.analyzeRatingDistribution(ulasanData);
      
      // Sentiment analysis
      const sentimentAnalysis = await this.performSentimentAnalysis(ulasanData);
      
      // Extract top keywords
      const topKeywords = await this.extractTopKeywords(ulasanData);
      
      // Calculate verification rate
      const verifiedCount = ulasanData.filter(ulasan => ulasan.isVerified).length;
      const verificationRate = totalUlasan > 0 ? (verifiedCount / totalUlasan) * 100 : 0;
      
      // Generate trend analysis
      const trendAnalysis = await this.analyzeTrends(ulasanData, timeRange);
      
      // Analyze engagement metrics
      const engagementMetrics = await this.analyzeEngagement(ulasanData);
      
      // Generate quality insights
      const qualityInsights = await this.analyzeQuality(ulasanData);
      
      // Competitive analysis
      const competitiveAnalysis = await this.performCompetitiveAnalysis(ulasanData);
      
      const analytics: IUlasanAnalytics = {
        totalUlasan,
        averageRating,
        ratingDistribution,
        sentimentAnalysis,
        topKeywords,
        verificationRate
      };
      
      // Generate comprehensive report
      await this.generateAnalyticsReport(analytics, trendAnalysis, engagementMetrics, qualityInsights);
      
      // Update dashboard metrics
      await this.updateAnalyticsDashboard(analytics);
      
      // Generate actionable insights
      await this.generateActionableInsights(analytics, trendAnalysis);
      
      // Log analytics activity
      await this.logUlasanActivity('ANALYTICS', '', { timeRange, totalUlasan, averageRating });
      
      console.log('[EntitasUlasan] Analisis ulasan selesai:', analytics);
      return analytics;
      
    } catch (error) {
      console.error('[EntitasUlasan] Error analisis ulasan:', error);
      await this.handleUlasanError(error as Error);
      throw error;
    }
  }

  /**
   * Memberikan respons terhadap ulasan customer
   * @param idUlasan - ID ulasan yang akan direspons
   * @param responseData - Data respons
   * @returns Promise<IUlasanResponse> - Respons yang telah dibuat
   */
  public async responUlasan(idUlasan: string, responseData: Partial<IUlasanResponse>): Promise<IUlasanResponse> {
    try {
      console.log(`[EntitasUlasan] Membuat respons untuk ulasan ${idUlasan}...`);
      
      await this.simulateDelay(250);
      
      // Validasi ulasan exists
      const ulasan = await this.getUlasanById(idUlasan);
      if (!ulasan) {
        throw new Error(`Ulasan ${idUlasan} tidak ditemukan`);
      }
      
      // Validasi responder authority
      await this.validateResponderAuthority(responseData.responderId!, responseData.responderType!);
      
      // Validasi response content
      await this.validateResponseContent(responseData.isiResponse!);
      
      // Check existing responses
      const existingResponses = await this.getExistingResponses(idUlasan);
      
      // Create response
      const response: IUlasanResponse = {
        idResponse: this.generateResponseId(),
        idUlasan,
        responderId: responseData.responderId!,
        responderType: responseData.responderType!,
        isiResponse: responseData.isiResponse!,
        tanggalResponse: new Date()
      };
      
      // Auto-moderate response
      const moderationResult = await this.moderateResponse(response);
      
      if (moderationResult.approved) {
        // Save response
        await this.saveResponse(response);
        
        // Update ulasan engagement
        await this.updateUlasanEngagement(idUlasan, 'RESPONSE_ADDED');
        
        // Send notifications
        await this.sendResponseNotifications(ulasan, response);
        
        // Update response analytics
        await this.updateResponseAnalytics(response);
        
        // Generate response insights
        await this.generateResponseInsights(ulasan, response);
      } else {
        throw new Error(`Response ditolak: ${moderationResult.reasons.join(', ')}`);
      }
      
      // Log response activity
      await this.logUlasanActivity('RESPONSE', idUlasan, { responseId: response.idResponse, responderType: response.responderType });
      
      console.log(`[EntitasUlasan] Respons berhasil dibuat: ${response.idResponse}`);
      return response;
      
    } catch (error) {
      console.error('[EntitasUlasan] Error membuat respons:', error);
      await this.handleUlasanError(error as Error);
      throw error;
    }
  }

  // Helper Methods
  private generateId(): string {
    return `ULS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateResponseId(): string {
    return `RSP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async validateUlasanData(data: Partial<IEntitasUlasan>): Promise<void> {
    try {
      const errors: string[] = [];
      
      if (!data.idCustomer) {
        errors.push('ID Customer harus diisi');
      }
      
      if (!data.idMobil) {
        errors.push('ID Mobil harus diisi');
      }
      
      if (!data.ratingUlasan || data.ratingUlasan < 1 || data.ratingUlasan > 5) {
        errors.push('Rating harus antara 1-5');
      }
      
      if (!data.isiUlasan || data.isiUlasan.trim().length < 10) {
        errors.push('Isi ulasan minimal 10 karakter');
      }
      
      if (data.isiUlasan && data.isiUlasan.length > 2000) {
        errors.push('Isi ulasan maksimal 2000 karakter');
      }
      
      if (errors.length > 0) {
        throw new Error(`Validasi ulasan gagal: ${errors.join(', ')}`);
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasUlasan] Validation error:', error);
      throw error;
    }
  }

  private async checkDuplicateReview(idCustomer: string, idMobil: string): Promise<void> {
    try {
      // Simulasi check duplicate
      const existingReview = Math.random() < 0.1; // 10% chance of duplicate
      
      if (existingReview) {
        throw new Error('Customer sudah pernah memberikan ulasan untuk mobil ini');
      }
      
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasUlasan] Duplicate check error:', error);
      throw error;
    }
  }

  private async verifyCustomerEligibility(idCustomer: string, idMobil: string): Promise<boolean> {
    try {
      // Simulasi verifikasi eligibility
      // Check apakah customer pernah beli atau test drive mobil ini
      const hasPurchased = Math.random() < 0.3; // 30% chance
      const hasTestDrive = Math.random() < 0.6; // 60% chance
      
      await this.simulateDelay(150);
      return hasPurchased || hasTestDrive;
    } catch (error) {
      console.error('[EntitasUlasan] Eligibility verification error:', error);
      return false;
    }
  }

  private async performAutoModeration(): Promise<{ approved: boolean; reasons: string[] }> {
    try {
      const reasons: string[] = [];
      let approved = true;
      
      // Check for inappropriate content
      const inappropriateWords = ['spam', 'fake', 'scam', 'terrible', 'worst'];
      const hasInappropriate = inappropriateWords.some(word => 
        this.isiUlasan.toLowerCase().includes(word)
      );
      
      if (hasInappropriate) {
        approved = false;
        reasons.push('Konten tidak pantas terdeteksi');
      }
      
      // Check for excessive caps
      const capsRatio = (this.isiUlasan.match(/[A-Z]/g) || []).length / this.isiUlasan.length;
      if (capsRatio > 0.5) {
        approved = false;
        reasons.push('Terlalu banyak huruf kapital');
      }
      
      // Check for minimum quality
      if (this.isiUlasan.length < 20) {
        approved = false;
        reasons.push('Ulasan terlalu pendek');
      }
      
      await this.simulateDelay(100);
      return { approved, reasons };
    } catch (error) {
      console.error('[EntitasUlasan] Auto moderation error:', error);
      return { approved: false, reasons: ['Error dalam moderasi otomatis'] };
    }
  }

  private async flagForManualReview(reasons: string[]): Promise<void> {
    try {
      const flagData = {
        idUlasan: this.idUlasan,
        reasons,
        flaggedAt: new Date(),
        priority: reasons.length > 2 ? 'HIGH' : 'MEDIUM'
      };
      
      console.log('[EntitasUlasan] Ulasan diflag untuk review manual:', flagData);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasUlasan] Error flagging for manual review:', error);
    }
  }

  private async analyzeSentiment(text: string): Promise<{ sentiment: string; confidence: number }> {
    try {
      // Simulasi sentiment analysis
      const positiveWords = ['bagus', 'baik', 'puas', 'recommended', 'excellent', 'mantap'];
      const negativeWords = ['buruk', 'jelek', 'kecewa', 'terrible', 'bad', 'awful'];
      
      const lowerText = text.toLowerCase();
      const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
      const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
      
      let sentiment = 'neutral';
      let confidence = 0.5;
      
      if (positiveCount > negativeCount) {
        sentiment = 'positive';
        confidence = Math.min(0.9, 0.5 + (positiveCount * 0.1));
      } else if (negativeCount > positiveCount) {
        sentiment = 'negative';
        confidence = Math.min(0.9, 0.5 + (negativeCount * 0.1));
      }
      
      await this.simulateDelay(100);
      return { sentiment, confidence };
    } catch (error) {
      console.error('[EntitasUlasan] Sentiment analysis error:', error);
      return { sentiment: 'neutral', confidence: 0.5 };
    }
  }

  private async saveToDatabase(): Promise<void> {
    try {
      console.log('[EntitasUlasan] Menyimpan ulasan ke database...');
      await this.simulateDelay(200);
    } catch (error) {
      console.error('[EntitasUlasan] Database save error:', error);
      throw error;
    }
  }

  private async updateMobilRating(idMobil: string, newRating: number): Promise<void> {
    try {
      console.log(`[EntitasUlasan] Updating rating mobil ${idMobil} dengan rating ${newRating}`);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasUlasan] Error updating mobil rating:', error);
    }
  }

  private async updatePenjualRating(idPenjual: string, newRating: number): Promise<void> {
    try {
      console.log(`[EntitasUlasan] Updating rating penjual ${idPenjual} dengan rating ${newRating}`);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasUlasan] Error updating penjual rating:', error);
    }
  }

  private async sendNotifications(): Promise<void> {
    try {
      const notifications = [
        { type: 'CUSTOMER', message: 'Terima kasih atas ulasan Anda' },
        { type: 'PENJUAL', message: 'Ulasan baru diterima untuk mobil Anda' },
        { type: 'ADMIN', message: 'Ulasan baru perlu direview' }
      ];
      
      console.log('[EntitasUlasan] Sending notifications:', notifications);
      await this.simulateDelay(150);
    } catch (error) {
      console.error('[EntitasUlasan] Error sending notifications:', error);
    }
  }

  private async fetchAllUlasan(): Promise<IEntitasUlasan[]> {
    try {
      console.log('[EntitasUlasan] Fetching all ulasan...');
      
      // Simulasi data ulasan
      const ulasanList: IEntitasUlasan[] = [];
      const statuses = ['APPROVED', 'PENDING', 'REJECTED', 'FLAGGED'];
      const mobilIds = ['MOB-001', 'MOB-002', 'MOB-003', 'MOB-004', 'MOB-005'];
      const penjualIds = ['PJL-001', 'PJL-002', 'PJL-003'];
      
      // Generate 100-200 sample ulasan
      const ulasanCount = Math.floor(Math.random() * 100) + 100;
      
      for (let i = 0; i < ulasanCount; i++) {
        const createdDate = new Date(Date.now() - Math.random() * 31536000000); // dalam 1 tahun terakhir
        const rating = Math.floor(Math.random() * 5) + 1;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const mobilId = mobilIds[Math.floor(Math.random() * mobilIds.length)];
        const penjualId = penjualIds[Math.floor(Math.random() * penjualIds.length)];
        
        const ulasan: IEntitasUlasan = {
          idUlasan: this.generateId(),
          idCustomer: `CUST-${Math.floor(Math.random() * 1000) + 1}`,
          idMobil: mobilId,
          idPenjual: penjualId,
          ratingUlasan: rating,
          judulUlasan: this.generateUlasanTitle(rating),
          isiUlasan: this.generateUlasanContent(rating),
          tanggalUlasan: createdDate,
          statusUlasan: status,
          isVerified: Math.random() < 0.7, // 70% verified
          jumlahLike: Math.floor(Math.random() * 50),
          jumlahDislike: Math.floor(Math.random() * 10),
          updatedAt: new Date(createdDate.getTime() + Math.random() * 86400000) // +1 day
        };
        
        ulasanList.push(ulasan);
      }
      
      await this.simulateDelay(300);
      return ulasanList;
      
    } catch (error) {
      console.error('[EntitasUlasan] Error fetching ulasan:', error);
      return [];
    }
  }

  private generateUlasanTitle(rating: number): string {
    const titles: Record<number, string[]> = {
      5: ['Sangat Puas dengan Pembelian', 'Mobil Impian Terwujud', 'Pelayanan Luar Biasa', 'Highly Recommended'],
      4: ['Puas dengan Kualitas', 'Mobil Bagus Sesuai Ekspektasi', 'Pelayanan Memuaskan', 'Worth It'],
      3: ['Cukup Baik', 'Sesuai Harga', 'Standar Kualitas', 'Lumayan'],
      2: ['Kurang Memuaskan', 'Ada Beberapa Kekurangan', 'Perlu Perbaikan', 'Biasa Saja'],
      1: ['Sangat Kecewa', 'Tidak Sesuai Ekspektasi', 'Banyak Masalah', 'Tidak Recommended']
    };
    
    const ratingTitles = titles[rating] || titles[3];
    return ratingTitles[Math.floor(Math.random() * ratingTitles.length)];
  }

  private generateUlasanContent(rating: number): string {
    const contents: Record<number, string[]> = {
      5: [
        'Sangat puas dengan pembelian mobil ini. Kualitas bagus, pelayanan ramah, proses cepat.',
        'Mobil impian akhirnya terwujud. Terima kasih atas pelayanan yang luar biasa.',
        'Recommended banget! Dari awal konsultasi sampai serah terima sangat profesional.'
      ],
      4: [
        'Secara keseluruhan puas. Mobil sesuai ekspektasi, hanya ada sedikit delay di pengiriman.',
        'Kualitas mobil bagus, pelayanan juga baik. Harga sesuai dengan yang ditawarkan.',
        'Proses pembelian lancar, staff helpful. Mobil kondisi prima.'
      ],
      3: [
        'Cukup baik untuk harga segini. Ada beberapa hal yang bisa diperbaiki.',
        'Standar lah, sesuai ekspektasi. Tidak ada yang istimewa tapi tidak mengecewakan juga.',
        'Lumayan, tapi masih ada room for improvement di pelayanan.'
      ],
      2: [
        'Agak kecewa dengan pelayanan. Mobil sih oke tapi prosesnya ribet.',
        'Ada beberapa masalah kecil yang mengganggu. Semoga bisa diperbaiki.',
        'Kurang memuaskan, terutama di bagian after sales service.'
      ],
      1: [
        'Sangat kecewa dengan pembelian ini. Banyak masalah yang tidak dijelaskan di awal.',
        'Tidak sesuai ekspektasi sama sekali. Pelayanan buruk, mobil bermasalah.',
        'Tidak recommended. Banyak hidden cost dan pelayanan tidak profesional.'
      ]
    };
    
    const ratingContents = contents[rating] || contents[3];
    return ratingContents[Math.floor(Math.random() * ratingContents.length)];
  }

  private async validateFilter(filter: IUlasanFilter): Promise<void> {
    try {
      if (filter.rating && (filter.rating < 1 || filter.rating > 5)) {
        throw new Error('Rating filter harus antara 1-5');
      }
      
      if (filter.tanggalMulai && filter.tanggalAkhir && filter.tanggalMulai > filter.tanggalAkhir) {
        throw new Error('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasUlasan] Filter validation error:', error);
      throw error;
    }
  }

  private async applyFilters(ulasanList: IEntitasUlasan[], filter: IUlasanFilter): Promise<IEntitasUlasan[]> {
    try {
      let filtered = [...ulasanList];
      
      if (filter.rating) {
        filtered = filtered.filter(ulasan => ulasan.ratingUlasan >= filter.rating!);
      }
      
      if (filter.idMobil) {
        filtered = filtered.filter(ulasan => ulasan.idMobil === filter.idMobil);
      }
      
      if (filter.idPenjual) {
        filtered = filtered.filter(ulasan => ulasan.idPenjual === filter.idPenjual);
      }
      
      if (filter.statusUlasan) {
        filtered = filtered.filter(ulasan => ulasan.statusUlasan === filter.statusUlasan);
      }
      
      if (filter.isVerified !== undefined) {
        filtered = filtered.filter(ulasan => ulasan.isVerified === filter.isVerified);
      }
      
      if (filter.tanggalMulai) {
        filtered = filtered.filter(ulasan => ulasan.tanggalUlasan >= filter.tanggalMulai!);
      }
      
      if (filter.tanggalAkhir) {
        filtered = filtered.filter(ulasan => ulasan.tanggalUlasan <= filter.tanggalAkhir!);
      }
      
      return filtered;
    } catch (error) {
      console.error('[EntitasUlasan] Error applying filters:', error);
      return ulasanList;
    }
  }

  private async sortUlasan(ulasanList: IEntitasUlasan[], sortBy: string): Promise<IEntitasUlasan[]> {
    try {
      const sorted = [...ulasanList];
      
      sorted.sort((a, b) => {
        switch (sortBy) {
          case 'rating':
            return b.ratingUlasan - a.ratingUlasan;
          case 'like':
            return b.jumlahLike - a.jumlahLike;
          case 'tanggal':
          default:
            return b.tanggalUlasan.getTime() - a.tanggalUlasan.getTime();
        }
      });
      
      return sorted;
    } catch (error) {
      console.error('[EntitasUlasan] Error sorting ulasan:', error);
      return ulasanList;
    }
  }

  private async enrichUlasanData(ulasanList: IEntitasUlasan[]): Promise<IEntitasUlasan[]> {
    try {
      // Simulasi enrichment dengan data tambahan
      return ulasanList.map(ulasan => ({
        ...ulasan,
        // Tambahan data yang mungkin diperlukan
      }));
    } catch (error) {
      console.error('[EntitasUlasan] Error enriching ulasan data:', error);
      return ulasanList;
    }
  }

  private async validateModeratorAuthority(moderatorId: string, action: string): Promise<void> {
    try {
      // Simulasi validasi authority
      const hasAuthority = Math.random() < 0.9; // 90% success rate
      
      if (!hasAuthority) {
        throw new Error(`Moderator ${moderatorId} tidak memiliki authority untuk ${action}`);
      }
      
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasUlasan] Moderator authority validation error:', error);
      throw error;
    }
  }

  private async getUlasanById(idUlasan: string): Promise<IEntitasUlasan | null> {
    try {
      // Simulasi get ulasan by ID
      const allUlasan = await this.fetchAllUlasan();
      return allUlasan.find(ulasan => ulasan.idUlasan === idUlasan) || null;
    } catch (error) {
      console.error('[EntitasUlasan] Error getting ulasan by ID:', error);
      return null;
    }
  }

  private async updateUlasanStatus(idUlasan: string, newStatus: string): Promise<void> {
    try {
      console.log(`[EntitasUlasan] Updating status ulasan ${idUlasan} to ${newStatus}`);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasUlasan] Error updating ulasan status:', error);
      throw error;
    }
  }

  private async saveModerationRecord(record: IUlasanModeration): Promise<void> {
    try {
      console.log('[EntitasUlasan] Saving moderation record:', record);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasUlasan] Error saving moderation record:', error);
    }
  }

  private async sendModerationNotifications(ulasan: IEntitasUlasan, action: string, moderatorId: string): Promise<void> {
    try {
      const notifications = [
        { 
          type: 'CUSTOMER', 
          idCustomer: ulasan.idCustomer,
          message: `Status ulasan Anda telah diupdate: ${action}` 
        },
        { 
          type: 'ADMIN', 
          message: `Moderasi ${action} dilakukan oleh ${moderatorId} untuk ulasan ${ulasan.idUlasan}` 
        }
      ];
      
      console.log('[EntitasUlasan] Sending moderation notifications:', notifications);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasUlasan] Error sending moderation notifications:', error);
    }
  }

  private async updateModerationStats(action: string, oldStatus: string, newStatus: string): Promise<void> {
    try {
      const stats = {
        action,
        oldStatus,
        newStatus,
        timestamp: new Date()
      };
      
      console.log('[EntitasUlasan] Updating moderation stats:', stats);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasUlasan] Error updating moderation stats:', error);
    }
  }

  private async getUlasanInTimeRange(days: number, filters: IUlasanFilter): Promise<IEntitasUlasan[]> {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const allUlasan = await this.fetchAllUlasan();
      
      let filtered = allUlasan.filter(ulasan => ulasan.tanggalUlasan >= cutoffDate);
      filtered = await this.applyFilters(filtered, filters);
      
      return filtered;
    } catch (error) {
      console.error('[EntitasUlasan] Error getting ulasan in time range:', error);
      return [];
    }
  }

  private async analyzeRatingDistribution(ulasanList: IEntitasUlasan[]): Promise<Record<number, number>> {
    try {
      const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      
      ulasanList.forEach(ulasan => {
        distribution[ulasan.ratingUlasan]++;
      });
      
      return distribution;
    } catch (error) {
      console.error('[EntitasUlasan] Error analyzing rating distribution:', error);
      return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    }
  }

  private async performSentimentAnalysis(ulasanList: IEntitasUlasan[]): Promise<{ positive: number; neutral: number; negative: number }> {
    try {
      let positive = 0, neutral = 0, negative = 0;
      
      for (const ulasan of ulasanList) {
        const sentiment = await this.analyzeSentiment(ulasan.isiUlasan);
        
        switch (sentiment.sentiment) {
          case 'positive':
            positive++;
            break;
          case 'negative':
            negative++;
            break;
          default:
            neutral++;
            break;
        }
      }
      
      const total = ulasanList.length;
      return {
        positive: total > 0 ? (positive / total) * 100 : 0,
        neutral: total > 0 ? (neutral / total) * 100 : 0,
        negative: total > 0 ? (negative / total) * 100 : 0
      };
    } catch (error) {
      console.error('[EntitasUlasan] Error performing sentiment analysis:', error);
      return { positive: 0, neutral: 0, negative: 0 };
    }
  }

  private async extractTopKeywords(ulasanList: IEntitasUlasan[]): Promise<string[]> {
    try {
      const wordCounts: Map<string, number> = new Map();
      const stopWords = ['dan', 'atau', 'yang', 'ini', 'itu', 'dengan', 'untuk', 'dari', 'ke', 'di', 'pada'];
      
      ulasanList.forEach(ulasan => {
        const words = ulasan.isiUlasan.toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 3 && !stopWords.includes(word));
        
        words.forEach(word => {
          wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        });
      });
      
      return Array.from(wordCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(entry => entry[0]);
    } catch (error) {
      console.error('[EntitasUlasan] Error extracting keywords:', error);
      return [];
    }
  }

  private async analyzeTrends(ulasanList: IEntitasUlasan[], timeRange: number): Promise<any> {
    try {
      // Analisis tren rating dan volume over time
      const dailyStats: Record<string, { count: number; avgRating: number; totalRating: number }> = {};
      
      ulasanList.forEach(ulasan => {
        const dateKey = ulasan.tanggalUlasan.toISOString().split('T')[0];
        if (!dailyStats[dateKey]) {
          dailyStats[dateKey] = { count: 0, avgRating: 0, totalRating: 0 };
        }
        dailyStats[dateKey].count++;
        dailyStats[dateKey].totalRating += ulasan.ratingUlasan;
        dailyStats[dateKey].avgRating = dailyStats[dateKey].totalRating / dailyStats[dateKey].count;
      });
      
      return {
        dailyStats,
        trend: this.calculateTrend(dailyStats)
      };
    } catch (error) {
      console.error('[EntitasUlasan] Error analyzing trends:', error);
      return {};
    }
  }

  private calculateTrend(dailyStats: Record<string, any>): string {
    const dates = Object.keys(dailyStats).sort();
    if (dates.length < 2) return 'stable';
    
    const firstHalf = dates.slice(0, Math.floor(dates.length / 2));
    const secondHalf = dates.slice(Math.floor(dates.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, date) => sum + dailyStats[date].avgRating, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, date) => sum + dailyStats[date].avgRating, 0) / secondHalf.length;
    
    const diff = secondAvg - firstAvg;
    
    if (diff > 0.2) return 'improving';
    if (diff < -0.2) return 'declining';
    return 'stable';
  }

  private async analyzeEngagement(ulasanList: IEntitasUlasan[]): Promise<any> {
    try {
      const totalLikes = ulasanList.reduce((sum, ulasan) => sum + ulasan.jumlahLike, 0);
      const totalDislikes = ulasanList.reduce((sum, ulasan) => sum + ulasan.jumlahDislike, 0);
      const avgLikes = ulasanList.length > 0 ? totalLikes / ulasanList.length : 0;
      const avgDislikes = ulasanList.length > 0 ? totalDislikes / ulasanList.length : 0;
      
      return {
        totalLikes,
        totalDislikes,
        avgLikes,
        avgDislikes,
        engagementRate: totalLikes + totalDislikes > 0 ? (totalLikes / (totalLikes + totalDislikes)) * 100 : 0
      };
    } catch (error) {
      console.error('[EntitasUlasan] Error analyzing engagement:', error);
      return {};
    }
  }

  private async analyzeQuality(ulasanList: IEntitasUlasan[]): Promise<any> {
    try {
      const avgLength = ulasanList.reduce((sum, ulasan) => sum + ulasan.isiUlasan.length, 0) / ulasanList.length;
      const verifiedCount = ulasanList.filter(ulasan => ulasan.isVerified).length;
      const verificationRate = (verifiedCount / ulasanList.length) * 100;
      
      const qualityScore = this.calculateQualityScore(ulasanList);
      
      return {
        avgLength,
        verificationRate,
        qualityScore,
        detailedUlasanCount: ulasanList.filter(ulasan => ulasan.isiUlasan.length > 100).length
      };
    } catch (error) {
      console.error('[EntitasUlasan] Error analyzing quality:', error);
      return {};
    }
  }

  private calculateQualityScore(ulasanList: IEntitasUlasan[]): number {
    let totalScore = 0;
    
    ulasanList.forEach(ulasan => {
      let score = 0;
      
      // Length score (0-30 points)
      if (ulasan.isiUlasan.length > 50) score += 10;
      if (ulasan.isiUlasan.length > 100) score += 10;
      if (ulasan.isiUlasan.length > 200) score += 10;
      
      // Verification score (20 points)
      if (ulasan.isVerified) score += 20;
      
      // Engagement score (0-20 points)
      const engagementRatio = ulasan.jumlahLike / (ulasan.jumlahLike + ulasan.jumlahDislike + 1);
      score += engagementRatio * 20;
      
      // Rating consistency (0-30 points)
      // Assume detailed reviews with extreme ratings (1 or 5) get lower consistency scores
      if (ulasan.ratingUlasan >= 2 && ulasan.ratingUlasan <= 4) score += 30;
      else if (ulasan.isiUlasan.length > 100) score += 20; // Detailed extreme reviews still get some points
      else score += 10;
      
      totalScore += score;
    });
    
    return ulasanList.length > 0 ? totalScore / ulasanList.length : 0;
  }

  private async performCompetitiveAnalysis(ulasanList: IEntitasUlasan[]): Promise<any> {
    try {
      // Simulasi competitive analysis
      const mobilPerformance: Record<string, { count: number; avgRating: number; totalRating: number }> = {};
      
      ulasanList.forEach(ulasan => {
        if (!mobilPerformance[ulasan.idMobil]) {
          mobilPerformance[ulasan.idMobil] = { count: 0, avgRating: 0, totalRating: 0 };
        }
        mobilPerformance[ulasan.idMobil].count++;
        mobilPerformance[ulasan.idMobil].totalRating += ulasan.ratingUlasan;
        mobilPerformance[ulasan.idMobil].avgRating = 
          mobilPerformance[ulasan.idMobil].totalRating / mobilPerformance[ulasan.idMobil].count;
      });
      
      return {
        mobilPerformance,
        topPerformers: Object.entries(mobilPerformance)
          .sort((a, b) => b[1].avgRating - a[1].avgRating)
          .slice(0, 5)
          .map(([id, data]) => ({ idMobil: id, ...data }))
      };
    } catch (error) {
      console.error('[EntitasUlasan] Error performing competitive analysis:', error);
      return {};
    }
  }

  private async validateResponderAuthority(responderId: string, responderType: string): Promise<void> {
    try {
      const validTypes = ['DEALER', 'ADMIN', 'CUSTOMER'];
      if (!validTypes.includes(responderType)) {
        throw new Error(`Responder type tidak valid: ${responderType}`);
      }
      
      // Simulasi authority check
      const hasAuthority = Math.random() < 0.95; // 95% success rate
      if (!hasAuthority) {
        throw new Error(`Responder ${responderId} tidak memiliki authority sebagai ${responderType}`);
      }
      
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasUlasan] Responder authority validation error:', error);
      throw error;
    }
  }

  private async validateResponseContent(content: string): Promise<void> {
    try {
      if (!content || content.trim().length < 10) {
        throw new Error('Respons minimal 10 karakter');
      }
      
      if (content.length > 1000) {
        throw new Error('Respons maksimal 1000 karakter');
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasUlasan] Response content validation error:', error);
      throw error;
    }
  }

  private async getExistingResponses(idUlasan: string): Promise<IUlasanResponse[]> {
    try {
      // Simulasi get existing responses
      const responses: IUlasanResponse[] = [];
      const responseCount = Math.floor(Math.random() * 3); // 0-2 existing responses
      
      for (let i = 0; i < responseCount; i++) {
        responses.push({
          idResponse: this.generateResponseId(),
          idUlasan,
          responderId: `RESP-${i + 1}`,
          responderType: i === 0 ? 'DEALER' : 'ADMIN',
          isiResponse: 'Terima kasih atas feedback Anda.',
          tanggalResponse: new Date(Date.now() - Math.random() * 86400000)
        });
      }
      
      await this.simulateDelay(100);
      return responses;
    } catch (error) {
      console.error('[EntitasUlasan] Error getting existing responses:', error);
      return [];
    }
  }

  private async moderateResponse(response: IUlasanResponse): Promise<{ approved: boolean; reasons: string[] }> {
    try {
      const reasons: string[] = [];
      let approved = true;
      
      // Basic content moderation
      if (response.isiResponse.length < 10) {
        approved = false;
        reasons.push('Respons terlalu pendek');
      }
      
      // Check for inappropriate content
      const inappropriateWords = ['spam', 'fake', 'scam'];
      const hasInappropriate = inappropriateWords.some(word => 
        response.isiResponse.toLowerCase().includes(word)
      );
      
      if (hasInappropriate) {
        approved = false;
        reasons.push('Konten tidak pantas terdeteksi');
      }
      
      await this.simulateDelay(100);
      return { approved, reasons };
    } catch (error) {
      console.error('[EntitasUlasan] Response moderation error:', error);
      return { approved: false, reasons: ['Error dalam moderasi respons'] };
    }
  }

  private async saveResponse(response: IUlasanResponse): Promise<void> {
    try {
      console.log('[EntitasUlasan] Menyimpan respons:', response);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasUlasan] Error saving response:', error);
      throw error;
    }
  }

  private async updateUlasanEngagement(idUlasan: string, action: string): Promise<void> {
    try {
      console.log(`[EntitasUlasan] Updating engagement untuk ulasan ${idUlasan}: ${action}`);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasUlasan] Error updating ulasan engagement:', error);
    }
  }

  private async sendResponseNotifications(ulasan: IEntitasUlasan, response: IUlasanResponse): Promise<void> {
    try {
      const notifications = [
        {
          type: 'CUSTOMER',
          idCustomer: ulasan.idCustomer,
          message: `Ada respons baru untuk ulasan Anda dari ${response.responderType}`
        },
        {
          type: 'ADMIN',
          message: `Respons baru dibuat oleh ${response.responderId} untuk ulasan ${ulasan.idUlasan}`
        }
      ];
      
      console.log('[EntitasUlasan] Sending response notifications:', notifications);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasUlasan] Error sending response notifications:', error);
    }
  }

  // Logging and Analytics Methods
  private async updateFilterAnalytics(filter: IUlasanFilter, resultCount: number): Promise<void> {
    try {
      const analytics = {
        filter,
        resultCount,
        timestamp: new Date()
      };
      
      console.log('[EntitasUlasan] Filter analytics updated:', analytics);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasUlasan] Error updating filter analytics:', error);
    }
  }

  private async updateResponseAnalytics(response: IUlasanResponse): Promise<void> {
    try {
      const analytics = {
        responderType: response.responderType,
        responseLength: response.isiResponse.length,
        timestamp: new Date()
      };
      
      console.log('[EntitasUlasan] Response analytics updated:', analytics);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasUlasan] Error updating response analytics:', error);
    }
  }

  private async updateAnalyticsDashboard(analytics: IUlasanAnalytics): Promise<void> {
    try {
      const dashboardUpdate = {
        metrics: analytics,
        lastUpdated: new Date()
      };
      
      console.log('[EntitasUlasan] Analytics dashboard updated:', dashboardUpdate);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasUlasan] Error updating analytics dashboard:', error);
    }
  }

  private async generateAnalyticsReport(
    analytics: IUlasanAnalytics,
    trends: any,
    engagement: any,
    quality: any
  ): Promise<void> {
    try {
      const report = {
        summary: analytics,
        trends,
        engagement,
        quality,
        generatedAt: new Date(),
        recommendations: this.generateAnalyticsRecommendations(analytics, trends, quality)
      };
      
      console.log('[EntitasUlasan] Analytics report generated:', report);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasUlasan] Error generating analytics report:', error);
    }
  }

  private generateAnalyticsRecommendations(analytics: IUlasanAnalytics, trends: any, quality: any): string[] {
    const recommendations: string[] = [];
    
    if (analytics.averageRating < 3.5) {
      recommendations.push('Tingkatkan kualitas produk dan layanan untuk meningkatkan rating');
    }
    
    if (analytics.verificationRate < 60) {
      recommendations.push('Implementasi sistem verifikasi yang lebih baik');
    }
    
    if (quality.qualityScore < 60) {
      recommendations.push('Dorong customer untuk memberikan ulasan yang lebih detail');
    }
    
    if (trends.trend === 'declining') {
      recommendations.push('Perlu investigasi penyebab penurunan rating');
    }
    
    return recommendations;
  }

  private async generateActionableInsights(analytics: IUlasanAnalytics, trends: any): Promise<void> {
    try {
      const insights = {
        criticalIssues: this.identifyCriticalIssues(analytics, trends),
        opportunities: this.identifyOpportunities(analytics),
        actionItems: this.generateActionItems(analytics, trends)
      };
      
      console.log('[EntitasUlasan] Actionable insights generated:', insights);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasUlasan] Error generating actionable insights:', error);
    }
  }

  private identifyCriticalIssues(analytics: IUlasanAnalytics, trends: any): string[] {
    const issues: string[] = [];
    
    if (analytics.averageRating < 3.0) {
      issues.push('Rating rata-rata sangat rendah');
    }
    
    if (analytics.sentimentAnalysis.negative > 40) {
      issues.push('Sentiment negatif tinggi');
    }
    
    if (trends.trend === 'declining') {
      issues.push('Tren rating menurun');
    }
    
    return issues;
  }

  private identifyOpportunities(analytics: IUlasanAnalytics): string[] {
    const opportunities: string[] = [];
    
    if (analytics.verificationRate > 80) {
      opportunities.push('Tingkat verifikasi tinggi - leverage untuk marketing');
    }
    
    if (analytics.sentimentAnalysis.positive > 60) {
      opportunities.push('Sentiment positif tinggi - kumpulkan testimonial');
    }
    
    return opportunities;
  }

  private generateActionItems(analytics: IUlasanAnalytics, trends: any): string[] {
    const actions: string[] = [];
    
    if (analytics.averageRating < 4.0) {
      actions.push('Lakukan survey kepuasan customer');
      actions.push('Review dan perbaiki proses layanan');
    }
    
    if (analytics.totalUlasan < 100) {
      actions.push('Implementasi program insentif untuk ulasan');
    }
    
    return actions;
  }

  private async generateUlasanInsights(): Promise<void> {
    try {
      const insights = {
        idUlasan: this.idUlasan,
        ratingImpact: this.calculateRatingImpact(),
        sentimentScore: await this.analyzeSentiment(this.isiUlasan),
        engagementPotential: this.calculateEngagementPotential()
      };
      
      console.log('[EntitasUlasan] Ulasan insights generated:', insights);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasUlasan] Error generating ulasan insights:', error);
    }
  }

  private calculateRatingImpact(): number {
    // Simulasi kalkulasi dampak rating terhadap overall rating
    const impact = this.ratingUlasan > 3 ? 0.1 : -0.1;
    return impact;
  }

  private calculateEngagementPotential(): number {
    // Simulasi kalkulasi potensi engagement berdasarkan konten
    let potential = 0.5; // base potential
    
    if (this.isiUlasan.length > 100) potential += 0.2;
    if (this.ratingUlasan === 5 || this.ratingUlasan === 1) potential += 0.2;
    if (this.isVerified) potential += 0.1;
    
    return Math.min(1.0, potential);
  }

  private async generateResponseInsights(ulasan: IEntitasUlasan, response: IUlasanResponse): Promise<void> {
    try {
      const insights = {
        responseQuality: this.assessResponseQuality(response),
        expectedEngagement: this.predictResponseEngagement(ulasan, response),
        customerSatisfactionImpact: this.predictSatisfactionImpact(response)
      };
      
      console.log('[EntitasUlasan] Response insights generated:', insights);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasUlasan] Error generating response insights:', error);
    }
  }

  private assessResponseQuality(response: IUlasanResponse): number {
    let quality = 0.5; // base quality
    
    if (response.isiResponse.length > 50) quality += 0.2;
    if (response.isiResponse.toLowerCase().includes('terima kasih')) quality += 0.1;
    if (response.responderType === 'DEALER') quality += 0.1;
    if (response.isiResponse.includes('solusi') || response.isiResponse.includes('perbaikan')) quality += 0.1;
    
    return Math.min(1.0, quality);
  }

  private predictResponseEngagement(ulasan: IEntitasUlasan, response: IUlasanResponse): number {
    let engagement = 0.3; // base engagement
    
    if (ulasan.ratingUlasan <= 2) engagement += 0.3; // negative reviews get more attention
    if (response.responderType === 'DEALER') engagement += 0.2;
    if (response.isiResponse.length > 100) engagement += 0.2;
    
    return Math.min(1.0, engagement);
  }

  private predictSatisfactionImpact(response: IUlasanResponse): number {
    let impact = 0.5; // neutral impact
    
    if (response.isiResponse.toLowerCase().includes('maaf')) impact += 0.2;
    if (response.isiResponse.toLowerCase().includes('solusi')) impact += 0.3;
    if (response.responderType === 'DEALER') impact += 0.1;
    
    return Math.min(1.0, impact);
  }

  private async generateModerationInsights(action: string, ulasan: IEntitasUlasan): Promise<void> {
    try {
      const insights = {
        action,
        ulasanProfile: {
          rating: ulasan.ratingUlasan,
          length: ulasan.isiUlasan.length,
          verified: ulasan.isVerified
        },
        moderationImpact: this.assessModerationImpact(action, ulasan),
        recommendedFollowUp: this.generateModerationFollowUp(action, ulasan)
      };
      
      console.log('[EntitasUlasan] Moderation insights generated:', insights);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasUlasan] Error generating moderation insights:', error);
    }
  }

  private assessModerationImpact(action: string, ulasan: IEntitasUlasan): string {
    if (action === 'REJECT' && ulasan.ratingUlasan >= 4) {
      return 'HIGH_NEGATIVE'; // Rejecting positive review has high negative impact
    } else if (action === 'APPROVE' && ulasan.ratingUlasan <= 2) {
      return 'MEDIUM_NEGATIVE'; // Approving negative review has medium negative impact
    } else if (action === 'APPROVE' && ulasan.ratingUlasan >= 4) {
      return 'POSITIVE'; // Approving positive review has positive impact
    }
    return 'NEUTRAL';
  }

  private generateModerationFollowUp(action: string, ulasan: IEntitasUlasan): string[] {
    const followUps: string[] = [];
    
    if (action === 'REJECT') {
      followUps.push('Send explanation to customer');
      followUps.push('Offer alternative feedback channel');
    } else if (action === 'APPROVE' && ulasan.ratingUlasan <= 2) {
      followUps.push('Prepare response from dealer');
      followUps.push('Monitor for additional negative feedback');
    } else if (action === 'FLAG') {
      followUps.push('Schedule manual review');
      followUps.push('Investigate customer history');
    }
    
    return followUps;
  }

  private async logUlasanActivity(action: string, idUlasan: string, metadata?: any): Promise<void> {
    try {
      const logEntry = {
        action,
        idUlasan,
        metadata,
        timestamp: new Date(),
        userId: 'system' // In real implementation, get from context
      };
      
      console.log('[EntitasUlasan] Activity logged:', logEntry);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasUlasan] Error logging activity:', error);
    }
  }

  private async handleUlasanError(error: Error): Promise<void> {
    try {
      const errorLog = {
        error: error.message,
        stack: error.stack,
        context: {
          idUlasan: this.idUlasan,
          method: 'handleUlasanError'
        },
        timestamp: new Date()
      };
      
      console.error('[EntitasUlasan] Error handled:', errorLog);
      
      // Send error notification to admin
      await this.sendErrorNotification(errorLog);
      
      await this.simulateDelay(50);
    } catch (logError) {
      console.error('[EntitasUlasan] Error in error handler:', logError);
    }
  }

  private async sendErrorNotification(errorLog: any): Promise<void> {
    try {
      const notification = {
        type: 'ERROR',
        severity: 'HIGH',
        message: `Error in EntitasUlasan: ${errorLog.error}`,
        timestamp: new Date()
      };
      
      console.log('[EntitasUlasan] Error notification sent:', notification);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasUlasan] Error sending error notification:', error);
    }
  }

  // Utility Methods
  public toJSON(): IEntitasUlasan {
    return {
      idUlasan: this.idUlasan,
      idCustomer: this.idCustomer,
      idMobil: this.idMobil,
      idPenjual: this.idPenjual,
      ratingUlasan: this.ratingUlasan,
      judulUlasan: this.judulUlasan,
      isiUlasan: this.isiUlasan,
      tanggalUlasan: this.tanggalUlasan,
      statusUlasan: this.statusUlasan,
      isVerified: this.isVerified,
      jumlahLike: this.jumlahLike,
      jumlahDislike: this.jumlahDislike,
      updatedAt: this.updatedAt
    };
  }

  public toString(): string {
    return `EntitasUlasan(${this.idUlasan}): ${this.judulUlasan} - Rating: ${this.ratingUlasan}/5`;
  }

  public static fromJSON(data: IEntitasUlasan): EntitasUlasan {
    return new EntitasUlasan(data);
  }

  public static createEmpty(): EntitasUlasan {
    return new EntitasUlasan();
  }

  // Validation Methods
  public isValid(): boolean {
    return !!(
      this.idCustomer &&
      this.idMobil &&
      this.ratingUlasan >= 1 &&
      this.ratingUlasan <= 5 &&
      this.isiUlasan &&
      this.isiUlasan.length >= 10
    );
  }

  public getValidationErrors(): string[] {
    const errors: string[] = [];
    
    if (!this.idCustomer) errors.push('ID Customer harus diisi');
    if (!this.idMobil) errors.push('ID Mobil harus diisi');
    if (!this.ratingUlasan || this.ratingUlasan < 1 || this.ratingUlasan > 5) {
      errors.push('Rating harus antara 1-5');
    }
    if (!this.isiUlasan) errors.push('Isi ulasan harus diisi');
    else if (this.isiUlasan.length < 10) errors.push('Isi ulasan minimal 10 karakter');
    
    return errors;
  }

  // Status Methods
  public isPending(): boolean {
    return this.statusUlasan === 'PENDING';
  }

  public isApproved(): boolean {
    return this.statusUlasan === 'APPROVED';
  }

  public isRejected(): boolean {
    return this.statusUlasan === 'REJECTED';
  }

  public isFlagged(): boolean {
    return this.statusUlasan === 'FLAGGED';
  }

  public canBeModerated(): boolean {
    return ['PENDING', 'FLAGGED'].includes(this.statusUlasan);
  }

  public canReceiveResponse(): boolean {
    return this.statusUlasan === 'APPROVED';
  }

  // Rating Methods
  public isPositiveRating(): boolean {
    return this.ratingUlasan >= 4;
  }

  public isNegativeRating(): boolean {
    return this.ratingUlasan <= 2;
  }

  public isNeutralRating(): boolean {
    return this.ratingUlasan === 3;
  }

  // Engagement Methods
  public getTotalEngagement(): number {
    return this.jumlahLike + this.jumlahDislike;
  }

  public getEngagementRatio(): number {
    const total = this.getTotalEngagement();
    return total > 0 ? this.jumlahLike / total : 0;
  }

  public isHighEngagement(): boolean {
    return this.getTotalEngagement() > 10;
  }

  // Time Methods
  public getAgeInDays(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.tanggalUlasan.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public isRecent(): boolean {
    return this.getAgeInDays() <= 7;
  }

  public isOld(): boolean {
    return this.getAgeInDays() > 30;
  }
}