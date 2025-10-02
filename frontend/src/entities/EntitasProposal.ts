/**
 * EntitasProposal - Kelas untuk mengelola proposal penjualan dan penawaran
 * Menangani pembuatan, tracking, dan manajemen proposal untuk customer
 */

export interface IEntitasProposal {
  idProposal: string;
  idCustomer: string;
  idMobil: string;
  idSales: string;
  judulProposal: string;
  deskripsiProposal: string;
  hargaProposal: number;
  statusProposal: string;
  tanggalDibuat: Date;
  tanggalExpired: Date;
  updatedAt: Date;
}

export interface IProposalAnalytics {
  totalProposal: number;
  proposalAccepted: number;
  proposalRejected: number;
  proposalPending: number;
  conversionRate: number;
  averageProposalValue: number;
  averageResponseTime: number;
}

export interface IProposalTemplate {
  idTemplate: string;
  namaTemplate: string;
  kategori: string;
  content: string;
  variables: string[];
}

export interface IProposalHistory {
  idHistory: string;
  idProposal: string;
  action: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  userId: string;
}

export class EntitasProposal implements IEntitasProposal {
  // Attributes
  public idProposal: string;
  public idCustomer: string;
  public idMobil: string;
  public idSales: string;
  public judulProposal: string;
  public deskripsiProposal: string;
  public hargaProposal: number;
  public statusProposal: string;
  public tanggalDibuat: Date;
  public tanggalExpired: Date;
  public updatedAt: Date;

  constructor(data: Partial<IEntitasProposal> = {}) {
    this.idProposal = data.idProposal || this.generateId();
    this.idCustomer = data.idCustomer || '';
    this.idMobil = data.idMobil || '';
    this.idSales = data.idSales || '';
    this.judulProposal = data.judulProposal || '';
    this.deskripsiProposal = data.deskripsiProposal || '';
    this.hargaProposal = data.hargaProposal || 0;
    this.statusProposal = data.statusProposal || 'DRAFT';
    this.tanggalDibuat = data.tanggalDibuat || new Date();
    this.tanggalExpired = data.tanggalExpired || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 days
    this.updatedAt = data.updatedAt || new Date();
  }

  // Main Methods

  /**
   * Membuat proposal baru dengan template dan data yang diberikan
   * @param templateId - ID template yang akan digunakan
   * @param customData - Data custom untuk proposal
   * @returns Promise<IEntitasProposal> - Data proposal yang dibuat
   */
  public async buatProposal(templateId?: string, customData?: any): Promise<IEntitasProposal> {
    try {
      console.log('[EntitasProposal] Membuat proposal baru...');
      
      await this.simulateDelay(300);
      
      // Validasi data proposal
      await this.validateProposalData();
      
      // Load template jika ada
      let template: IProposalTemplate | null = null;
      if (templateId) {
        template = await this.loadProposalTemplate(templateId);
      }
      
      // Generate konten proposal
      await this.generateProposalContent(template, customData);
      
      // Hitung harga proposal
      await this.calculateProposalPrice();
      
      // Set status dan tanggal
      this.statusProposal = 'DRAFT';
      this.tanggalDibuat = new Date();
      this.updatedAt = new Date();
      
      // Simpan proposal ke database
      await this.saveProposalToDatabase();
      
      // Log aktivitas
      await this.logProposalActivity('CREATE', 'Proposal baru dibuat');
      
      // Kirim notifikasi ke sales
      await this.notifySalesTeam('NEW_PROPOSAL');
      
      // Update analytics
      await this.updateProposalAnalytics('CREATE');
      
      console.log(`[EntitasProposal] Proposal ${this.idProposal} berhasil dibuat`);
      return this.toJSON();
      
    } catch (error) {
      console.error('[EntitasProposal] Error membuat proposal:', error);
      await this.handleProposalError(error as Error);
      throw error;
    }
  }

  /**
   * Mengirim proposal ke customer melalui email atau sistem lain
   * @param method - Metode pengiriman (email, whatsapp, etc)
   * @returns Promise<boolean> - Status pengiriman
   */
  public async kirimProposal(method: string = 'email'): Promise<boolean> {
    try {
      console.log(`[EntitasProposal] Mengirim proposal ${this.idProposal} via ${method}...`);
      
      await this.simulateDelay(500);
      
      // Validasi proposal siap dikirim
      await this.validateProposalForSending();
      
      // Generate dokumen proposal
      const proposalDocument = await this.generateProposalDocument();
      
      // Kirim berdasarkan metode
      let sendResult = false;
      switch (method.toLowerCase()) {
        case 'email':
          sendResult = await this.sendViaEmail(proposalDocument);
          break;
        case 'whatsapp':
          sendResult = await this.sendViaWhatsApp(proposalDocument);
          break;
        case 'sms':
          sendResult = await this.sendViaSMS();
          break;
        default:
          throw new Error(`Metode pengiriman ${method} tidak didukung`);
      }
      
      if (sendResult) {
        // Update status proposal
        this.statusProposal = 'SENT';
        this.updatedAt = new Date();
        
        // Simpan perubahan
        await this.saveProposalToDatabase();
        
        // Log aktivitas
        await this.logProposalActivity('SEND', `Proposal dikirim via ${method}`);
        
        // Set reminder untuk follow up
        await this.setFollowUpReminder();
        
        // Update analytics
        await this.updateProposalAnalytics('SEND');
        
        console.log(`[EntitasProposal] Proposal berhasil dikirim via ${method}`);
      }
      
      return sendResult;
      
    } catch (error) {
      console.error('[EntitasProposal] Error mengirim proposal:', error);
      await this.handleProposalError(error as Error);
      throw error;
    }
  }

  /**
   * Melacak status proposal dan update berdasarkan respons customer
   * @returns Promise<string> - Status terkini proposal
   */
  public async lacakStatusProposal(): Promise<string> {
    try {
      console.log(`[EntitasProposal] Melacak status proposal ${this.idProposal}...`);
      
      await this.simulateDelay(200);
      
      // Cek status dari berbagai sumber
      const emailStatus = await this.checkEmailStatus();
      const customerResponse = await this.checkCustomerResponse();
      const salesUpdate = await this.checkSalesUpdate();
      
      // Analisis status berdasarkan data yang dikumpulkan
      const currentStatus = await this.analyzeProposalStatus(emailStatus, customerResponse, salesUpdate);
      
      // Update status jika ada perubahan
      if (currentStatus !== this.statusProposal) {
        const oldStatus = this.statusProposal;
        this.statusProposal = currentStatus;
        this.updatedAt = new Date();
        
        // Simpan perubahan
        await this.saveProposalToDatabase();
        
        // Log perubahan status
        await this.logProposalActivity('STATUS_CHANGE', `Status berubah dari ${oldStatus} ke ${currentStatus}`);
        
        // Kirim notifikasi jika perlu
        await this.notifyStatusChange(oldStatus, currentStatus);
        
        // Update analytics
        await this.updateProposalAnalytics('STATUS_UPDATE');
      }
      
      // Cek apakah proposal expired
      await this.checkProposalExpiry();
      
      // Generate insights
      await this.generateStatusInsights();
      
      console.log(`[EntitasProposal] Status proposal: ${this.statusProposal}`);
      return this.statusProposal;
      
    } catch (error) {
      console.error('[EntitasProposal] Error melacak status:', error);
      await this.handleProposalError(error as Error);
      throw error;
    }
  }

  /**
   * Memperbarui proposal dengan data baru
   * @param updateData - Data yang akan diupdate
   * @returns Promise<IEntitasProposal> - Data proposal yang sudah diupdate
   */
  public async updateProposal(updateData: Partial<IEntitasProposal>): Promise<IEntitasProposal> {
    try {
      console.log(`[EntitasProposal] Memperbarui proposal ${this.idProposal}...`);
      
      await this.simulateDelay(300);
      
      // Validasi data update
      await this.validateUpdateData(updateData);
      
      // Simpan data lama untuk history
      const oldData = { ...this.toJSON() };
      
      // Update data
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof IEntitasProposal] !== undefined) {
          (this as any)[key] = updateData[key as keyof IEntitasProposal];
        }
      });
      
      this.updatedAt = new Date();
      
      // Recalculate jika ada perubahan harga
      if (updateData.hargaProposal !== undefined) {
        await this.recalculateProposalMetrics();
      }
      
      // Simpan perubahan
      await this.saveProposalToDatabase();
      
      // Simpan history
      await this.saveProposalHistory('UPDATE', oldData, this.toJSON());
      
      // Log aktivitas
      await this.logProposalActivity('UPDATE', 'Proposal diperbarui');
      
      // Kirim notifikasi jika proposal sudah dikirim
      if (this.statusProposal === 'SENT') {
        await this.notifyProposalUpdate();
      }
      
      // Update analytics
      await this.updateProposalAnalytics('UPDATE');
      
      console.log(`[EntitasProposal] Proposal berhasil diperbarui`);
      return this.toJSON();
      
    } catch (error) {
      console.error('[EntitasProposal] Error update proposal:', error);
      await this.handleProposalError(error as Error);
      throw error;
    }
  }

  /**
   * Menghapus proposal dari sistem
   * @param reason - Alasan penghapusan
   * @returns Promise<boolean> - Status penghapusan
   */
  public async hapusProposal(reason: string = ''): Promise<boolean> {
    try {
      console.log(`[EntitasProposal] Menghapus proposal ${this.idProposal}...`);
      
      await this.simulateDelay(200);
      
      // Validasi apakah proposal bisa dihapus
      await this.validateProposalDeletion();
      
      // Backup data sebelum dihapus
      await this.backupProposalData(reason);
      
      // Update status ke DELETED
      this.statusProposal = 'DELETED';
      this.updatedAt = new Date();
      
      // Soft delete - mark as deleted
      await this.softDeleteProposal();
      
      // Log aktivitas
      await this.logProposalActivity('DELETE', `Proposal dihapus. Alasan: ${reason}`);
      
      // Kirim notifikasi ke tim terkait
      await this.notifyProposalDeletion(reason);
      
      // Update analytics
      await this.updateProposalAnalytics('DELETE');
      
      // Cleanup related data
      await this.cleanupRelatedData();
      
      console.log(`[EntitasProposal] Proposal berhasil dihapus`);
      return true;
      
    } catch (error) {
      console.error('[EntitasProposal] Error menghapus proposal:', error);
      await this.handleProposalError(error as Error);
      return false;
    }
  }

  // Helper Methods
  private generateId(): string {
    return `PROP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async validateProposalData(): Promise<void> {
    try {
      const errors: string[] = [];
      
      if (!this.idCustomer) errors.push('ID Customer harus diisi');
      if (!this.idMobil) errors.push('ID Mobil harus diisi');
      if (!this.idSales) errors.push('ID Sales harus diisi');
      if (!this.judulProposal) errors.push('Judul proposal harus diisi');
      if (this.hargaProposal <= 0) errors.push('Harga proposal harus lebih dari 0');
      
      if (errors.length > 0) {
        throw new Error(`Validasi gagal: ${errors.join(', ')}`);
      }
      
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasProposal] Validation error:', error);
      throw error;
    }
  }

  private async loadProposalTemplate(templateId: string): Promise<IProposalTemplate | null> {
    try {
      console.log(`[EntitasProposal] Loading template ${templateId}...`);
      
      // Simulasi load template dari database
      const templates: IProposalTemplate[] = [
        {
          idTemplate: 'TEMP-001',
          namaTemplate: 'Standard Car Proposal',
          kategori: 'STANDARD',
          content: 'Template standar untuk proposal mobil',
          variables: ['customerName', 'carModel', 'price', 'discount']
        },
        {
          idTemplate: 'TEMP-002',
          namaTemplate: 'Premium Car Proposal',
          kategori: 'PREMIUM',
          content: 'Template premium untuk proposal mobil mewah',
          variables: ['customerName', 'carModel', 'price', 'features', 'warranty']
        }
      ];
      
      const template = templates.find(t => t.idTemplate === templateId);
      
      await this.simulateDelay(150);
      return template || null;
    } catch (error) {
      console.error('[EntitasProposal] Error loading template:', error);
      return null;
    }
  }

  private async generateProposalContent(template: IProposalTemplate | null, customData: any): Promise<void> {
    try {
      if (template) {
        // Generate content berdasarkan template
        let content = template.content;
        
        // Replace variables dengan data aktual
        template.variables.forEach(variable => {
          const value = customData?.[variable] || `[${variable}]`;
          content = content.replace(new RegExp(`{{${variable}}}`, 'g'), value);
        });
        
        this.deskripsiProposal = content;
      } else {
        // Generate default content
        this.deskripsiProposal = `Proposal untuk ${this.judulProposal}`;
      }
      
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasProposal] Error generating content:', error);
    }
  }

  private async calculateProposalPrice(): Promise<void> {
    try {
      // Simulasi kalkulasi harga berdasarkan berbagai faktor
      let basePrice = this.hargaProposal || 0;
      
      // Apply discount berdasarkan customer tier
      const customerDiscount = await this.getCustomerDiscount();
      
      // Apply seasonal discount
      const seasonalDiscount = await this.getSeasonalDiscount();
      
      // Calculate final price
      const totalDiscount = customerDiscount + seasonalDiscount;
      this.hargaProposal = basePrice * (1 - totalDiscount / 100);
      
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasProposal] Error calculating price:', error);
    }
  }

  private async getCustomerDiscount(): Promise<number> {
    // Simulasi discount berdasarkan customer tier
    const customerTiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
    const discounts = [0, 2, 5, 8]; // percentage
    
    const randomTier = Math.floor(Math.random() * customerTiers.length);
    return discounts[randomTier];
  }

  private async getSeasonalDiscount(): Promise<number> {
    // Simulasi seasonal discount
    const currentMonth = new Date().getMonth();
    const seasonalDiscounts = [3, 3, 2, 2, 1, 1, 0, 0, 1, 2, 5, 8]; // per month
    
    return seasonalDiscounts[currentMonth];
  }

  private async saveProposalToDatabase(): Promise<void> {
    try {
      console.log(`[EntitasProposal] Saving proposal ${this.idProposal} to database...`);
      
      // Simulasi save ke database
      const proposalData = this.toJSON();
      
      await this.simulateDelay(200);
      console.log('[EntitasProposal] Proposal saved successfully');
    } catch (error) {
      console.error('[EntitasProposal] Error saving to database:', error);
      throw error;
    }
  }

  private async validateProposalForSending(): Promise<void> {
    try {
      const errors: string[] = [];
      
      if (this.statusProposal === 'DELETED') errors.push('Proposal sudah dihapus');
      if (this.statusProposal === 'EXPIRED') errors.push('Proposal sudah expired');
      if (!this.judulProposal) errors.push('Judul proposal kosong');
      if (!this.deskripsiProposal) errors.push('Deskripsi proposal kosong');
      if (this.hargaProposal <= 0) errors.push('Harga proposal tidak valid');
      
      if (errors.length > 0) {
        throw new Error(`Proposal tidak dapat dikirim: ${errors.join(', ')}`);
      }
      
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasProposal] Validation for sending failed:', error);
      throw error;
    }
  }

  private async generateProposalDocument(): Promise<any> {
    try {
      console.log('[EntitasProposal] Generating proposal document...');
      
      const document = {
        idProposal: this.idProposal,
        title: this.judulProposal,
        content: this.deskripsiProposal,
        price: this.hargaProposal,
        createdAt: this.tanggalDibuat,
        expiresAt: this.tanggalExpired,
        format: 'PDF'
      };
      
      await this.simulateDelay(300);
      return document;
    } catch (error) {
      console.error('[EntitasProposal] Error generating document:', error);
      throw error;
    }
  }

  private async sendViaEmail(document: any): Promise<boolean> {
    try {
      console.log('[EntitasProposal] Sending proposal via email...');
      
      const emailData = {
        to: `customer-${this.idCustomer}@example.com`,
        subject: `Proposal: ${this.judulProposal}`,
        body: `Berikut proposal yang kami ajukan untuk Anda.`,
        attachment: document
      };
      
      // Simulasi pengiriman email
      await this.simulateDelay(500);
      
      // Simulasi success rate 95%
      const success = Math.random() > 0.05;
      
      if (success) {
        console.log('[EntitasProposal] Email sent successfully');
      } else {
        console.log('[EntitasProposal] Email sending failed');
      }
      
      return success;
    } catch (error) {
      console.error('[EntitasProposal] Error sending email:', error);
      return false;
    }
  }

  private async sendViaWhatsApp(document: any): Promise<boolean> {
    try {
      console.log('[EntitasProposal] Sending proposal via WhatsApp...');
      
      const whatsappData = {
        to: `+62812345${this.idCustomer.slice(-5)}`,
        message: `Halo! Berikut proposal ${this.judulProposal} untuk Anda.`,
        document: document
      };
      
      await this.simulateDelay(300);
      
      // Simulasi success rate 90%
      const success = Math.random() > 0.1;
      
      if (success) {
        console.log('[EntitasProposal] WhatsApp sent successfully');
      } else {
        console.log('[EntitasProposal] WhatsApp sending failed');
      }
      
      return success;
    } catch (error) {
      console.error('[EntitasProposal] Error sending WhatsApp:', error);
      return false;
    }
  }

  private async sendViaSMS(): Promise<boolean> {
    try {
      console.log('[EntitasProposal] Sending proposal notification via SMS...');
      
      const smsData = {
        to: `+62812345${this.idCustomer.slice(-5)}`,
        message: `Proposal ${this.judulProposal} telah dikirim. Silakan cek email Anda.`
      };
      
      await this.simulateDelay(200);
      
      // Simulasi success rate 98%
      const success = Math.random() > 0.02;
      
      if (success) {
        console.log('[EntitasProposal] SMS sent successfully');
      } else {
        console.log('[EntitasProposal] SMS sending failed');
      }
      
      return success;
    } catch (error) {
      console.error('[EntitasProposal] Error sending SMS:', error);
      return false;
    }
  }

  private async setFollowUpReminder(): Promise<void> {
    try {
      const reminderDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // +2 days
      
      const reminder = {
        idProposal: this.idProposal,
        idSales: this.idSales,
        reminderDate,
        message: `Follow up proposal ${this.judulProposal}`,
        type: 'PROPOSAL_FOLLOWUP'
      };
      
      console.log('[EntitasProposal] Follow up reminder set:', reminder);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasProposal] Error setting reminder:', error);
    }
  }

  private async checkEmailStatus(): Promise<string> {
    try {
      // Simulasi cek status email (opened, clicked, etc)
      const statuses = ['DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      await this.simulateDelay(100);
      return randomStatus;
    } catch (error) {
      console.error('[EntitasProposal] Error checking email status:', error);
      return 'UNKNOWN';
    }
  }

  private async checkCustomerResponse(): Promise<string> {
    try {
      // Simulasi cek respons customer
      const responses = ['NO_RESPONSE', 'INTERESTED', 'NEED_MORE_INFO', 'REJECTED', 'ACCEPTED'];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      await this.simulateDelay(100);
      return randomResponse;
    } catch (error) {
      console.error('[EntitasProposal] Error checking customer response:', error);
      return 'NO_RESPONSE';
    }
  }

  private async checkSalesUpdate(): Promise<string> {
    try {
      // Simulasi cek update dari sales
      const updates = ['NO_UPDATE', 'FOLLOW_UP_DONE', 'MEETING_SCHEDULED', 'NEGOTIATION', 'CLOSED'];
      const randomUpdate = updates[Math.floor(Math.random() * updates.length)];
      
      await this.simulateDelay(100);
      return randomUpdate;
    } catch (error) {
      console.error('[EntitasProposal] Error checking sales update:', error);
      return 'NO_UPDATE';
    }
  }

  private async analyzeProposalStatus(emailStatus: string, customerResponse: string, salesUpdate: string): Promise<string> {
    try {
      // Logic untuk menentukan status berdasarkan berbagai input
      if (customerResponse === 'ACCEPTED') return 'ACCEPTED';
      if (customerResponse === 'REJECTED') return 'REJECTED';
      if (salesUpdate === 'CLOSED') return 'CLOSED';
      if (salesUpdate === 'NEGOTIATION') return 'NEGOTIATION';
      if (customerResponse === 'INTERESTED' || emailStatus === 'CLICKED') return 'UNDER_REVIEW';
      if (emailStatus === 'OPENED') return 'VIEWED';
      if (this.isExpired()) return 'EXPIRED';
      
      return this.statusProposal; // Keep current status
    } catch (error) {
      console.error('[EntitasProposal] Error analyzing status:', error);
      return this.statusProposal;
    }
  }

  private async checkProposalExpiry(): Promise<void> {
    try {
      if (this.isExpired() && this.statusProposal !== 'EXPIRED') {
        this.statusProposal = 'EXPIRED';
        this.updatedAt = new Date();
        
        await this.saveProposalToDatabase();
        await this.logProposalActivity('EXPIRE', 'Proposal expired');
        await this.notifyProposalExpiry();
      }
    } catch (error) {
      console.error('[EntitasProposal] Error checking expiry:', error);
    }
  }

  private async generateStatusInsights(): Promise<void> {
    try {
      const insights = {
        proposalAge: this.getProposalAge(),
        daysUntilExpiry: this.getDaysUntilExpiry(),
        responseTime: this.getResponseTime(),
        conversionProbability: this.calculateConversionProbability()
      };
      
      console.log('[EntitasProposal] Status insights:', insights);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasProposal] Error generating insights:', error);
    }
  }

  private async validateUpdateData(updateData: Partial<IEntitasProposal>): Promise<void> {
    try {
      const errors: string[] = [];
      
      if (updateData.hargaProposal !== undefined && updateData.hargaProposal <= 0) {
        errors.push('Harga proposal harus lebih dari 0');
      }
      
      if (updateData.statusProposal && !this.isValidStatus(updateData.statusProposal)) {
        errors.push('Status proposal tidak valid');
      }
      
      if (errors.length > 0) {
        throw new Error(`Validasi update gagal: ${errors.join(', ')}`);
      }
      
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasProposal] Update validation error:', error);
      throw error;
    }
  }

  private isValidStatus(status: string): boolean {
    const validStatuses = ['DRAFT', 'SENT', 'VIEWED', 'UNDER_REVIEW', 'NEGOTIATION', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CLOSED', 'DELETED'];
    return validStatuses.includes(status);
  }

  private async recalculateProposalMetrics(): Promise<void> {
    try {
      // Recalculate metrics yang terkait dengan harga
      await this.calculateProposalPrice();
      
      // Update related calculations
      const profitMargin = await this.calculateProfitMargin();
      const competitiveAnalysis = await this.performCompetitiveAnalysis();
      
      console.log('[EntitasProposal] Metrics recalculated');
      await this.simulateDelay(150);
    } catch (error) {
      console.error('[EntitasProposal] Error recalculating metrics:', error);
    }
  }

  private async calculateProfitMargin(): Promise<number> {
    try {
      // Simulasi kalkulasi profit margin
      const baseCost = this.hargaProposal * 0.8; // 80% dari harga jual
      const profitMargin = ((this.hargaProposal - baseCost) / this.hargaProposal) * 100;
      
      return profitMargin;
    } catch (error) {
      console.error('[EntitasProposal] Error calculating profit margin:', error);
      return 0;
    }
  }

  private async performCompetitiveAnalysis(): Promise<any> {
    try {
      // Simulasi analisis kompetitif
      const competitorPrices = [
        this.hargaProposal * 0.95,
        this.hargaProposal * 1.05,
        this.hargaProposal * 0.98,
        this.hargaProposal * 1.02
      ];
      
      const averageCompetitorPrice = competitorPrices.reduce((sum, price) => sum + price, 0) / competitorPrices.length;
      const pricePosition = this.hargaProposal < averageCompetitorPrice ? 'COMPETITIVE' : 'PREMIUM';
      
      return {
        averageCompetitorPrice,
        pricePosition,
        priceDifference: this.hargaProposal - averageCompetitorPrice
      };
    } catch (error) {
      console.error('[EntitasProposal] Error in competitive analysis:', error);
      return {};
    }
  }

  private async saveProposalHistory(action: string, oldData: any, newData: any): Promise<void> {
    try {
      const historyEntry: IProposalHistory = {
        idHistory: `HIST-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        idProposal: this.idProposal,
        action,
        oldValue: oldData,
        newValue: newData,
        timestamp: new Date(),
        userId: this.idSales
      };
      
      console.log('[EntitasProposal] Saving history:', historyEntry);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasProposal] Error saving history:', error);
    }
  }

  private async notifyProposalUpdate(): Promise<void> {
    try {
      const notification = {
        type: 'PROPOSAL_UPDATED',
        idProposal: this.idProposal,
        idCustomer: this.idCustomer,
        message: `Proposal ${this.judulProposal} telah diperbarui`,
        timestamp: new Date()
      };
      
      console.log('[EntitasProposal] Sending update notification:', notification);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasProposal] Error sending notification:', error);
    }
  }

  private async validateProposalDeletion(): Promise<void> {
    try {
      const errors: string[] = [];
      
      if (this.statusProposal === 'ACCEPTED') {
        errors.push('Proposal yang sudah diterima tidak dapat dihapus');
      }
      
      if (this.statusProposal === 'CLOSED') {
        errors.push('Proposal yang sudah closed tidak dapat dihapus');
      }
      
      if (errors.length > 0) {
        throw new Error(`Proposal tidak dapat dihapus: ${errors.join(', ')}`);
      }
      
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasProposal] Deletion validation error:', error);
      throw error;
    }
  }

  private async backupProposalData(reason: string): Promise<void> {
    try {
      const backup = {
        ...this.toJSON(),
        deletedAt: new Date(),
        deleteReason: reason,
        backupId: `BACKUP-${Date.now()}`
      };
      
      console.log('[EntitasProposal] Creating backup:', backup);
      await this.simulateDelay(150);
    } catch (error) {
      console.error('[EntitasProposal] Error creating backup:', error);
    }
  }

  private async softDeleteProposal(): Promise<void> {
    try {
      // Soft delete - mark as deleted but keep data
      await this.saveProposalToDatabase();
      
      console.log('[EntitasProposal] Proposal soft deleted');
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasProposal] Error in soft delete:', error);
      throw error;
    }
  }

  private async notifyProposalDeletion(reason: string): Promise<void> {
    try {
      const notification = {
        type: 'PROPOSAL_DELETED',
        idProposal: this.idProposal,
        reason,
        deletedBy: this.idSales,
        timestamp: new Date()
      };
      
      console.log('[EntitasProposal] Sending deletion notification:', notification);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasProposal] Error sending deletion notification:', error);
    }
  }

  private async cleanupRelatedData(): Promise<void> {
    try {
      // Cleanup data terkait proposal
      console.log('[EntitasProposal] Cleaning up related data...');
      
      // Cancel reminders
      await this.cancelRelatedReminders();
      
      // Update analytics
      await this.updateAnalyticsForDeletion();
      
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasProposal] Error cleaning up data:', error);
    }
  }

  private async cancelRelatedReminders(): Promise<void> {
    try {
      console.log('[EntitasProposal] Cancelling related reminders...');
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasProposal] Error cancelling reminders:', error);
    }
  }

  private async updateAnalyticsForDeletion(): Promise<void> {
    try {
      console.log('[EntitasProposal] Updating analytics for deletion...');
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasProposal] Error updating analytics:', error);
    }
  }

  private async logProposalActivity(action: string, description: string): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date(),
        action,
        description,
        idProposal: this.idProposal,
        component: 'EntitasProposal'
      };

      console.log('[EntitasProposal] Logging activity:', logEntry);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasProposal] Error logging activity:', error);
    }
  }

  private async notifySalesTeam(type: string): Promise<void> {
    try {
      const notification = {
        type,
        idProposal: this.idProposal,
        idSales: this.idSales,
        message: `Proposal ${this.judulProposal} memerlukan perhatian`,
        timestamp: new Date()
      };

      console.log('[EntitasProposal] Notifying sales team:', notification);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasProposal] Error notifying sales team:', error);
    }
  }

  private async notifyStatusChange(oldStatus: string, newStatus: string): Promise<void> {
    try {
      const notification = {
        type: 'STATUS_CHANGE',
        idProposal: this.idProposal,
        oldStatus,
        newStatus,
        timestamp: new Date()
      };

      console.log('[EntitasProposal] Notifying status change:', notification);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasProposal] Error notifying status change:', error);
    }
  }

  private async notifyProposalExpiry(): Promise<void> {
    try {
      const notification = {
        type: 'PROPOSAL_EXPIRED',
        idProposal: this.idProposal,
        idSales: this.idSales,
        message: `Proposal ${this.judulProposal} telah expired`,
        timestamp: new Date()
      };

      console.log('[EntitasProposal] Notifying proposal expiry:', notification);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasProposal] Error notifying expiry:', error);
    }
  }

  private async updateProposalAnalytics(action: string): Promise<void> {
    try {
      const analyticsData = {
        action,
        idProposal: this.idProposal,
        timestamp: new Date(),
        proposalValue: this.hargaProposal,
        status: this.statusProposal
      };

      console.log('[EntitasProposal] Updating analytics:', analyticsData);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasProposal] Error updating analytics:', error);
    }
  }

  private async handleProposalError(error: Error): Promise<void> {
    try {
      const errorLog = {
        timestamp: new Date(),
        error: error.message,
        idProposal: this.idProposal,
        action: 'PROPOSAL_ERROR'
      };

      console.error('[EntitasProposal] Handling proposal error:', errorLog);
      await this.simulateDelay(100);
    } catch (handlingError) {
      console.error('[EntitasProposal] Error in error handling:', handlingError);
    }
  }

  // Utility Methods
  public isExpired(): boolean {
    return new Date() > this.tanggalExpired;
  }

  public getDaysUntilExpiry(): number {
    const now = new Date();
    const timeDiff = this.tanggalExpired.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }

  public getProposalAge(): number {
    const now = new Date();
    const ageDiff = now.getTime() - this.tanggalDibuat.getTime();
    return Math.floor(ageDiff / (1000 * 60 * 60 * 24)); // dalam hari
  }

  public getResponseTime(): number {
    // Simulasi response time dalam jam
    return Math.floor(Math.random() * 48) + 1;
  }

  public calculateConversionProbability(): number {
    // Simulasi probabilitas konversi berdasarkan berbagai faktor
    let probability = 50; // base 50%
    
    // Faktor usia proposal
    const age = this.getProposalAge();
    if (age > 7) probability -= 10;
    if (age > 14) probability -= 20;
    
    // Faktor status
    if (this.statusProposal === 'VIEWED') probability += 10;
    if (this.statusProposal === 'UNDER_REVIEW') probability += 20;
    if (this.statusProposal === 'NEGOTIATION') probability += 30;
    
    return Math.max(0, Math.min(100, probability));
  }

  public getProposalSummary(): any {
    return {
      id: this.idProposal,
      title: this.judulProposal,
      price: this.hargaProposal,
      status: this.statusProposal,
      age: this.getProposalAge(),
      daysUntilExpiry: this.getDaysUntilExpiry(),
      conversionProbability: this.calculateConversionProbability(),
      isExpired: this.isExpired()
    };
  }

  public toJSON(): IEntitasProposal {
    return {
      idProposal: this.idProposal,
      idCustomer: this.idCustomer,
      idMobil: this.idMobil,
      idSales: this.idSales,
      judulProposal: this.judulProposal,
      deskripsiProposal: this.deskripsiProposal,
      hargaProposal: this.hargaProposal,
      statusProposal: this.statusProposal,
      tanggalDibuat: this.tanggalDibuat,
      tanggalExpired: this.tanggalExpired,
      updatedAt: this.updatedAt
    };
  }
}

export default EntitasProposal;