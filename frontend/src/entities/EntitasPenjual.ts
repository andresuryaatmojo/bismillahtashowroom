/**
 * EntitasPenjual - Kelas untuk mengelola data dan operasi penjual/dealer
 * Menangani profil penjual, performa penjualan, dan manajemen dealer
 */

export interface IEntitasPenjual {
  idPenjual: string;
  namaPenjual: string;
  emailPenjual: string;
  teleponPenjual: string;
  alamatPenjual: string;
  ratingPenjual: number;
  jumlahMobilTerjual: number;
  statusPenjual: string;
  tanggalBergabung: Date;
}

export interface IPenjualFilter {
  namaPenjual?: string;
  statusPenjual?: string;
  ratingMinimal?: number;
  wilayah?: string;
  tanggalBergabungMulai?: Date;
  tanggalBergabungAkhir?: Date;
}

export interface IPenjualPerforma {
  idPenjual: string;
  periode: string;
  totalPenjualan: number;
  targetPenjualan: number;
  pencapaianTarget: number;
  ratingRataRata: number;
  jumlahUlasan: number;
  jumlahCustomer: number;
  pendapatanTotal: number;
  mobilTerlaris: string[];
}

export interface IPenjualStatistik {
  totalPenjual: number;
  penjualAktif: number;
  penjualNonAktif: number;
  ratingRataRata: number;
  totalPenjualanSemua: number;
  topPerformers: IPenjualPerforma[];
}

export interface IPenjualNotifikasi {
  idNotifikasi: string;
  idPenjual: string;
  tipeNotifikasi: string;
  judulNotifikasi: string;
  isiNotifikasi: string;
  tanggalNotifikasi: Date;
  statusBaca: boolean;
  prioritas: string;
}

export class EntitasPenjual implements IEntitasPenjual {
  // Attributes
  public idPenjual: string;
  public namaPenjual: string;
  public emailPenjual: string;
  public teleponPenjual: string;
  public alamatPenjual: string;
  public ratingPenjual: number;
  public jumlahMobilTerjual: number;
  public statusPenjual: string;
  public tanggalBergabung: Date;

  constructor(data: Partial<IEntitasPenjual> = {}) {
    this.idPenjual = data.idPenjual || this.generateId();
    this.namaPenjual = data.namaPenjual || '';
    this.emailPenjual = data.emailPenjual || '';
    this.teleponPenjual = data.teleponPenjual || '';
    this.alamatPenjual = data.alamatPenjual || '';
    this.ratingPenjual = data.ratingPenjual || 0;
    this.jumlahMobilTerjual = data.jumlahMobilTerjual || 0;
    this.statusPenjual = data.statusPenjual || 'AKTIF';
    this.tanggalBergabung = data.tanggalBergabung || new Date();
  }

  // Main Methods

  /**
   * Mengambil data penjual berdasarkan filter dan kriteria tertentu
   * @param filter - Filter untuk pencarian penjual
   * @param sortBy - Kriteria pengurutan
   * @param limit - Jumlah maksimal hasil
   * @returns Promise<IEntitasPenjual[]> - Array penjual yang sesuai filter
   */
  public async ambilDataPenjual(filter: IPenjualFilter = {}, sortBy: string = 'rating', limit: number = 50): Promise<IEntitasPenjual[]> {
    try {
      console.log('[EntitasPenjual] Mengambil data penjual dengan filter:', filter);
      
      await this.simulateDelay(200);
      
      // Validasi filter
      await this.validateFilter(filter);
      
      // Fetch all penjual from database
      const allPenjual = await this.fetchAllPenjual();
      
      // Apply filters
      let filteredPenjual = await this.applyFilters(allPenjual, filter);
      
      // Sort results
      filteredPenjual = await this.sortPenjual(filteredPenjual, sortBy);
      
      // Limit results
      filteredPenjual = filteredPenjual.slice(0, limit);
      
      // Enrich with additional data
      filteredPenjual = await this.enrichPenjualData(filteredPenjual);
      
      // Update search analytics
      await this.updateSearchAnalytics(filter, filteredPenjual.length);
      
      // Log search activity
      await this.logPenjualActivity('SEARCH', '', { filter, resultCount: filteredPenjual.length });
      
      console.log(`[EntitasPenjual] Ditemukan ${filteredPenjual.length} penjual`);
      return filteredPenjual;
      
    } catch (error) {
      console.error('[EntitasPenjual] Error mengambil data penjual:', error);
      await this.handlePenjualError(error as Error);
      throw error;
    }
  }

  /**
   * Menganalisis performa penjual dalam periode tertentu
   * @param idPenjual - ID penjual yang akan dianalisis
   * @param periode - Periode analisis ('HARIAN', 'MINGGUAN', 'BULANAN', 'TAHUNAN')
   * @param tanggalMulai - Tanggal mulai periode
   * @param tanggalAkhir - Tanggal akhir periode
   * @returns Promise<IPenjualPerforma> - Data performa penjual
   */
  public async analisisPerforma(idPenjual: string, periode: string = 'BULANAN', tanggalMulai?: Date, tanggalAkhir?: Date): Promise<IPenjualPerforma> {
    try {
      console.log(`[EntitasPenjual] Menganalisis performa penjual ${idPenjual} periode ${periode}...`);
      
      await this.simulateDelay(400);
      
      // Validasi input
      await this.validatePerformaInput(idPenjual, periode, tanggalMulai, tanggalAkhir);
      
      // Set default date range if not provided
      const dateRange = await this.getDateRange(periode, tanggalMulai, tanggalAkhir);
      
      // Get penjual data
      const penjualData = await this.getPenjualById(idPenjual);
      if (!penjualData) {
        throw new Error(`Penjual ${idPenjual} tidak ditemukan`);
      }
      
      // Fetch sales data
      const salesData = await this.fetchSalesData(idPenjual, dateRange.start, dateRange.end);
      
      // Fetch customer reviews
      const reviewData = await this.fetchReviewData(idPenjual, dateRange.start, dateRange.end);
      
      // Fetch customer data
      const customerData = await this.fetchCustomerData(idPenjual, dateRange.start, dateRange.end);
      
      // Calculate performance metrics
      const totalPenjualan = salesData.reduce((sum, sale) => sum + sale.jumlah, 0);
      const targetPenjualan = await this.getTargetPenjualan(idPenjual, periode);
      const pencapaianTarget = targetPenjualan > 0 ? (totalPenjualan / targetPenjualan) * 100 : 0;
      
      // Calculate rating metrics
      const ratingRataRata = reviewData.length > 0 
        ? reviewData.reduce((sum, review) => sum + review.rating, 0) / reviewData.length 
        : 0;
      
      // Calculate revenue
      const pendapatanTotal = salesData.reduce((sum, sale) => sum + sale.totalHarga, 0);
      
      // Get top selling cars
      const mobilTerlaris = await this.getTopSellingCars(salesData);
      
      // Analyze trends
      const trendAnalysis = await this.analyzeTrends(salesData, reviewData, periode);
      
      // Generate insights
      const insights = await this.generatePerformaInsights(totalPenjualan, targetPenjualan, ratingRataRata, trendAnalysis);
      
      const performa: IPenjualPerforma = {
        idPenjual,
        periode: `${periode} (${dateRange.start.toISOString().split('T')[0]} - ${dateRange.end.toISOString().split('T')[0]})`,
        totalPenjualan,
        targetPenjualan,
        pencapaianTarget,
        ratingRataRata,
        jumlahUlasan: reviewData.length,
        jumlahCustomer: customerData.length,
        pendapatanTotal,
        mobilTerlaris
      };
      
      // Update performance cache
      await this.updatePerformaCache(performa);
      
      // Generate performance report
      await this.generatePerformaReport(performa, insights, trendAnalysis);
      
      // Send performance notifications
      await this.sendPerformaNotifications(performa);
      
      // Log performance analysis
      await this.logPenjualActivity('ANALYZE_PERFORMA', idPenjual, { periode, performa });
      
      console.log('[EntitasPenjual] Analisis performa selesai:', performa);
      return performa;
      
    } catch (error) {
      console.error('[EntitasPenjual] Error analisis performa:', error);
      await this.handlePenjualError(error as Error);
      throw error;
    }
  }

  /**
   * Mengelola status dan data penjual (aktivasi, deaktivasi, update profil)
   * @param idPenjual - ID penjual yang akan dikelola
   * @param action - Aksi yang akan dilakukan ('ACTIVATE', 'DEACTIVATE', 'UPDATE', 'DELETE')
   * @param data - Data tambahan untuk aksi tertentu
   * @returns Promise<boolean> - Status berhasil/gagal
   */
  public async kelolaPenjual(idPenjual: string, action: string, data?: Partial<IEntitasPenjual>): Promise<boolean> {
    try {
      console.log(`[EntitasPenjual] Mengelola penjual ${idPenjual} dengan aksi ${action}...`);
      
      await this.simulateDelay(300);
      
      // Validasi action
      const validActions = ['ACTIVATE', 'DEACTIVATE', 'UPDATE', 'DELETE', 'SUSPEND', 'VERIFY'];
      if (!validActions.includes(action)) {
        throw new Error(`Action tidak valid: ${action}`);
      }
      
      // Get current penjual data
      const currentPenjual = await this.getPenjualById(idPenjual);
      if (!currentPenjual) {
        throw new Error(`Penjual ${idPenjual} tidak ditemukan`);
      }
      
      // Validate authority for action
      await this.validateActionAuthority(action, currentPenjual);
      
      // Backup current data
      await this.backupPenjualData(currentPenjual);
      
      let success = false;
      let oldStatus = currentPenjual.statusPenjual;
      let newStatus = oldStatus;
      
      switch (action) {
        case 'ACTIVATE':
          success = await this.activatePenjual(idPenjual);
          newStatus = 'AKTIF';
          break;
          
        case 'DEACTIVATE':
          success = await this.deactivatePenjual(idPenjual);
          newStatus = 'NONAKTIF';
          break;
          
        case 'SUSPEND':
          success = await this.suspendPenjual(idPenjual, data?.statusPenjual || 'SUSPENDED');
          newStatus = 'SUSPENDED';
          break;
          
        case 'UPDATE':
          if (!data) {
            throw new Error('Data update harus disediakan');
          }
          success = await this.updatePenjualData(idPenjual, data);
          break;
          
        case 'DELETE':
          success = await this.deletePenjual(idPenjual);
          newStatus = 'DELETED';
          break;
          
        case 'VERIFY':
          success = await this.verifyPenjual(idPenjual);
          newStatus = 'VERIFIED';
          break;
      }
      
      if (success) {
        // Update related data
        await this.updateRelatedData(idPenjual, action, oldStatus, newStatus);
        
        // Send notifications
        await this.sendManagementNotifications(currentPenjual, action, newStatus);
        
        // Update statistics
        await this.updatePenjualStatistics(action, oldStatus, newStatus);
        
        // Generate audit log
        await this.generateAuditLog(idPenjual, action, oldStatus, newStatus, data);
        
        // Update cache
        await this.updatePenjualCache(idPenjual, action);
        
        // Generate insights
        await this.generateManagementInsights(action, currentPenjual, newStatus);
      }
      
      // Log management activity
      await this.logPenjualActivity('MANAGE', idPenjual, { action, success, oldStatus, newStatus });
      
      console.log(`[EntitasPenjual] Pengelolaan penjual ${action} ${success ? 'berhasil' : 'gagal'}`);
      return success;
      
    } catch (error) {
      console.error('[EntitasPenjual] Error mengelola penjual:', error);
      await this.handlePenjualError(error as Error);
      return false;
    }
  }

  // Helper Methods
  private generateId(): string {
    return `PJL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async validateFilter(filter: IPenjualFilter): Promise<void> {
    try {
      if (filter.ratingMinimal && (filter.ratingMinimal < 0 || filter.ratingMinimal > 5)) {
        throw new Error('Rating minimal harus antara 0-5');
      }
      
      if (filter.tanggalBergabungMulai && filter.tanggalBergabungAkhir && 
          filter.tanggalBergabungMulai > filter.tanggalBergabungAkhir) {
        throw new Error('Tanggal bergabung mulai tidak boleh lebih besar dari tanggal akhir');
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPenjual] Filter validation error:', error);
      throw error;
    }
  }

  private async fetchAllPenjual(): Promise<IEntitasPenjual[]> {
    try {
      console.log('[EntitasPenjual] Fetching all penjual...');
      
      // Simulasi data penjual
      const penjualList: IEntitasPenjual[] = [];
      const statuses = ['AKTIF', 'NONAKTIF', 'SUSPENDED', 'VERIFIED'];
      const namaDepan = ['Ahmad', 'Budi', 'Citra', 'Dedi', 'Eka', 'Farid', 'Gita', 'Hadi', 'Indra', 'Joko'];
      const namaBelakang = ['Santoso', 'Wijaya', 'Pratama', 'Sari', 'Putra', 'Dewi', 'Kusuma', 'Handoko', 'Lestari', 'Nugroho'];
      
      // Generate 50-100 sample penjual
      const penjualCount = Math.floor(Math.random() * 50) + 50;
      
      for (let i = 0; i < penjualCount; i++) {
        const namaDepanRandom = namaDepan[Math.floor(Math.random() * namaDepan.length)];
        const namaBelakangRandom = namaBelakang[Math.floor(Math.random() * namaBelakang.length)];
        const nama = `${namaDepanRandom} ${namaBelakangRandom}`;
        const email = `${namaDepanRandom.toLowerCase()}.${namaBelakangRandom.toLowerCase()}@dealer.com`;
        const telepon = `08${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`;
        const rating = Math.round((Math.random() * 4 + 1) * 10) / 10; // 1.0 - 5.0
        const mobilTerjual = Math.floor(Math.random() * 200);
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const bergabung = new Date(Date.now() - Math.random() * 31536000000 * 3); // 0-3 tahun lalu
        
        const penjual: IEntitasPenjual = {
          idPenjual: this.generateId(),
          namaPenjual: nama,
          emailPenjual: email,
          teleponPenjual: telepon,
          alamatPenjual: `Jl. Dealer ${i + 1}, Jakarta`,
          ratingPenjual: rating,
          jumlahMobilTerjual: mobilTerjual,
          statusPenjual: status,
          tanggalBergabung: bergabung
        };
        
        penjualList.push(penjual);
      }
      
      await this.simulateDelay(300);
      return penjualList;
      
    } catch (error) {
      console.error('[EntitasPenjual] Error fetching penjual:', error);
      return [];
    }
  }

  private async applyFilters(penjualList: IEntitasPenjual[], filter: IPenjualFilter): Promise<IEntitasPenjual[]> {
    try {
      let filtered = [...penjualList];
      
      if (filter.namaPenjual) {
        const searchTerm = filter.namaPenjual.toLowerCase();
        filtered = filtered.filter(penjual => 
          penjual.namaPenjual.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filter.statusPenjual) {
        filtered = filtered.filter(penjual => penjual.statusPenjual === filter.statusPenjual);
      }
      
      if (filter.ratingMinimal) {
        filtered = filtered.filter(penjual => penjual.ratingPenjual >= filter.ratingMinimal!);
      }
      
      if (filter.wilayah) {
        filtered = filtered.filter(penjual => 
          penjual.alamatPenjual.toLowerCase().includes(filter.wilayah!.toLowerCase())
        );
      }
      
      if (filter.tanggalBergabungMulai) {
        filtered = filtered.filter(penjual => penjual.tanggalBergabung >= filter.tanggalBergabungMulai!);
      }
      
      if (filter.tanggalBergabungAkhir) {
        filtered = filtered.filter(penjual => penjual.tanggalBergabung <= filter.tanggalBergabungAkhir!);
      }
      
      return filtered;
    } catch (error) {
      console.error('[EntitasPenjual] Error applying filters:', error);
      return penjualList;
    }
  }

  private async sortPenjual(penjualList: IEntitasPenjual[], sortBy: string): Promise<IEntitasPenjual[]> {
    try {
      const sorted = [...penjualList];
      
      sorted.sort((a, b) => {
        switch (sortBy) {
          case 'rating':
            return b.ratingPenjual - a.ratingPenjual;
          case 'penjualan':
            return b.jumlahMobilTerjual - a.jumlahMobilTerjual;
          case 'nama':
            return a.namaPenjual.localeCompare(b.namaPenjual);
          case 'bergabung':
            return b.tanggalBergabung.getTime() - a.tanggalBergabung.getTime();
          default:
            return b.ratingPenjual - a.ratingPenjual;
        }
      });
      
      return sorted;
    } catch (error) {
      console.error('[EntitasPenjual] Error sorting penjual:', error);
      return penjualList;
    }
  }

  private async enrichPenjualData(penjualList: IEntitasPenjual[]): Promise<IEntitasPenjual[]> {
    try {
      // Simulasi enrichment dengan data tambahan
      return penjualList.map(penjual => ({
        ...penjual,
        // Tambahan data yang mungkin diperlukan
      }));
    } catch (error) {
      console.error('[EntitasPenjual] Error enriching penjual data:', error);
      return penjualList;
    }
  }

  private async validatePerformaInput(idPenjual: string, periode: string, tanggalMulai?: Date, tanggalAkhir?: Date): Promise<void> {
    try {
      const validPeriodes = ['HARIAN', 'MINGGUAN', 'BULANAN', 'TAHUNAN'];
      if (!validPeriodes.includes(periode)) {
        throw new Error(`Periode tidak valid: ${periode}`);
      }
      
      if (tanggalMulai && tanggalAkhir && tanggalMulai > tanggalAkhir) {
        throw new Error('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
      }
      
      if (!idPenjual) {
        throw new Error('ID Penjual harus diisi');
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPenjual] Performa input validation error:', error);
      throw error;
    }
  }

  private async getDateRange(periode: string, tanggalMulai?: Date, tanggalAkhir?: Date): Promise<{ start: Date; end: Date }> {
    try {
      if (tanggalMulai && tanggalAkhir) {
        return { start: tanggalMulai, end: tanggalAkhir };
      }
      
      const now = new Date();
      let start: Date;
      
      switch (periode) {
        case 'HARIAN':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'MINGGUAN':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'BULANAN':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'TAHUNAN':
          start = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      
      return { start, end: now };
    } catch (error) {
      console.error('[EntitasPenjual] Error getting date range:', error);
      const now = new Date();
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
    }
  }

  private async getPenjualById(idPenjual: string): Promise<IEntitasPenjual | null> {
    try {
      const allPenjual = await this.fetchAllPenjual();
      return allPenjual.find(penjual => penjual.idPenjual === idPenjual) || null;
    } catch (error) {
      console.error('[EntitasPenjual] Error getting penjual by ID:', error);
      return null;
    }
  }

  private async fetchSalesData(idPenjual: string, startDate: Date, endDate: Date): Promise<any[]> {
    try {
      // Simulasi data penjualan
      const salesData = [];
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const salesCount = Math.floor(Math.random() * daysDiff * 2); // 0-2 sales per day
      
      for (let i = 0; i < salesCount; i++) {
        const saleDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        const harga = Math.floor(Math.random() * 500000000) + 100000000; // 100M - 600M
        
        salesData.push({
          idPenjualan: `SALE-${i + 1}`,
          tanggal: saleDate,
          jumlah: 1,
          totalHarga: harga,
          idMobil: `MOB-${Math.floor(Math.random() * 20) + 1}`
        });
      }
      
      await this.simulateDelay(150);
      return salesData;
    } catch (error) {
      console.error('[EntitasPenjual] Error fetching sales data:', error);
      return [];
    }
  }

  private async fetchReviewData(idPenjual: string, startDate: Date, endDate: Date): Promise<any[]> {
    try {
      // Simulasi data review
      const reviewData = [];
      const reviewCount = Math.floor(Math.random() * 50) + 10; // 10-60 reviews
      
      for (let i = 0; i < reviewCount; i++) {
        const reviewDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        const rating = Math.floor(Math.random() * 5) + 1;
        
        reviewData.push({
          idReview: `REV-${i + 1}`,
          tanggal: reviewDate,
          rating,
          komentar: `Review ${i + 1} untuk penjual`
        });
      }
      
      await this.simulateDelay(100);
      return reviewData;
    } catch (error) {
      console.error('[EntitasPenjual] Error fetching review data:', error);
      return [];
    }
  }

  private async fetchCustomerData(idPenjual: string, startDate: Date, endDate: Date): Promise<any[]> {
    try {
      // Simulasi data customer
      const customerData = [];
      const customerCount = Math.floor(Math.random() * 100) + 20; // 20-120 customers
      
      for (let i = 0; i < customerCount; i++) {
        customerData.push({
          idCustomer: `CUST-${i + 1}`,
          nama: `Customer ${i + 1}`,
          tanggalInteraksi: new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))
        });
      }
      
      await this.simulateDelay(100);
      return customerData;
    } catch (error) {
      console.error('[EntitasPenjual] Error fetching customer data:', error);
      return [];
    }
  }

  private async getTargetPenjualan(idPenjual: string, periode: string): Promise<number> {
    try {
      // Simulasi target penjualan berdasarkan periode
      const baseTarget = {
        'HARIAN': 1,
        'MINGGUAN': 5,
        'BULANAN': 20,
        'TAHUNAN': 240
      };
      
      const target = baseTarget[periode as keyof typeof baseTarget] || 20;
      const variation = Math.random() * 0.4 + 0.8; // 80% - 120% variation
      
      await this.simulateDelay(50);
      return Math.floor(target * variation);
    } catch (error) {
      console.error('[EntitasPenjual] Error getting target penjualan:', error);
      return 0;
    }
  }

  private async getTopSellingCars(salesData: any[]): Promise<string[]> {
    try {
      const carCounts: Record<string, number> = {};
      
      salesData.forEach(sale => {
        carCounts[sale.idMobil] = (carCounts[sale.idMobil] || 0) + sale.jumlah;
      });
      
      return Object.entries(carCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);
    } catch (error) {
      console.error('[EntitasPenjual] Error getting top selling cars:', error);
      return [];
    }
  }

  private async analyzeTrends(salesData: any[], reviewData: any[], periode: string): Promise<any> {
    try {
      // Analisis tren penjualan dan rating
      const salesTrend = this.calculateSalesTrend(salesData);
      const ratingTrend = this.calculateRatingTrend(reviewData);
      
      return {
        salesTrend,
        ratingTrend,
        overallTrend: this.determineOverallTrend(salesTrend, ratingTrend)
      };
    } catch (error) {
      console.error('[EntitasPenjual] Error analyzing trends:', error);
      return { salesTrend: 'stable', ratingTrend: 'stable', overallTrend: 'stable' };
    }
  }

  private calculateSalesTrend(salesData: any[]): string {
    if (salesData.length < 2) return 'stable';
    
    // Sort by date
    const sortedSales = salesData.sort((a, b) => a.tanggal.getTime() - b.tanggal.getTime());
    
    // Compare first half vs second half
    const midPoint = Math.floor(sortedSales.length / 2);
    const firstHalf = sortedSales.slice(0, midPoint);
    const secondHalf = sortedSales.slice(midPoint);
    
    const firstHalfAvg = firstHalf.length > 0 ? firstHalf.reduce((sum, sale) => sum + sale.jumlah, 0) / firstHalf.length : 0;
    const secondHalfAvg = secondHalf.length > 0 ? secondHalf.reduce((sum, sale) => sum + sale.jumlah, 0) / secondHalf.length : 0;
    
    const diff = secondHalfAvg - firstHalfAvg;
    
    if (diff > 0.2) return 'increasing';
    if (diff < -0.2) return 'decreasing';
    return 'stable';
  }

  private calculateRatingTrend(reviewData: any[]): string {
    if (reviewData.length < 2) return 'stable';
    
    // Sort by date
    const sortedReviews = reviewData.sort((a, b) => a.tanggal.getTime() - b.tanggal.getTime());
    
    // Compare first half vs second half
    const midPoint = Math.floor(sortedReviews.length / 2);
    const firstHalf = sortedReviews.slice(0, midPoint);
    const secondHalf = sortedReviews.slice(midPoint);
    
    const firstHalfAvg = firstHalf.length > 0 ? firstHalf.reduce((sum, review) => sum + review.rating, 0) / firstHalf.length : 0;
    const secondHalfAvg = secondHalf.length > 0 ? secondHalf.reduce((sum, review) => sum + review.rating, 0) / secondHalf.length : 0;
    
    const diff = secondHalfAvg - firstHalfAvg;
    
    if (diff > 0.3) return 'improving';
    if (diff < -0.3) return 'declining';
    return 'stable';
  }

  private determineOverallTrend(salesTrend: string, ratingTrend: string): string {
    if (salesTrend === 'increasing' && ratingTrend === 'improving') return 'excellent';
    if (salesTrend === 'decreasing' && ratingTrend === 'declining') return 'concerning';
    if (salesTrend === 'increasing' || ratingTrend === 'improving') return 'positive';
    if (salesTrend === 'decreasing' || ratingTrend === 'declining') return 'negative';
    return 'stable';
  }

  private async generatePerformaInsights(totalPenjualan: number, targetPenjualan: number, ratingRataRata: number, trendAnalysis: any): Promise<any> {
    try {
      const insights = {
        performanceLevel: this.determinePerformanceLevel(totalPenjualan, targetPenjualan, ratingRataRata),
        recommendations: this.generateRecommendations(totalPenjualan, targetPenjualan, ratingRataRata, trendAnalysis),
        strengths: this.identifyStrengths(totalPenjualan, targetPenjualan, ratingRataRata, trendAnalysis),
        improvements: this.identifyImprovements(totalPenjualan, targetPenjualan, ratingRataRata, trendAnalysis)
      };
      
      return insights;
    } catch (error) {
      console.error('[EntitasPenjual] Error generating performa insights:', error);
      return {};
    }
  }

  private determinePerformanceLevel(totalPenjualan: number, targetPenjualan: number, ratingRataRata: number): string {
    const targetAchievement = targetPenjualan > 0 ? (totalPenjualan / targetPenjualan) * 100 : 0;
    
    if (targetAchievement >= 100 && ratingRataRata >= 4.5) return 'EXCELLENT';
    if (targetAchievement >= 80 && ratingRataRata >= 4.0) return 'GOOD';
    if (targetAchievement >= 60 && ratingRataRata >= 3.5) return 'AVERAGE';
    if (targetAchievement >= 40 && ratingRataRata >= 3.0) return 'BELOW_AVERAGE';
    return 'POOR';
  }

  private generateRecommendations(totalPenjualan: number, targetPenjualan: number, ratingRataRata: number, trendAnalysis: any): string[] {
    const recommendations: string[] = [];
    
    const targetAchievement = targetPenjualan > 0 ? (totalPenjualan / targetPenjualan) * 100 : 0;
    
    if (targetAchievement < 80) {
      recommendations.push('Tingkatkan aktivitas prospecting dan follow-up customer');
      recommendations.push('Review strategi penjualan dan identifikasi hambatan');
    }
    
    if (ratingRataRata < 4.0) {
      recommendations.push('Fokus pada peningkatan kualitas layanan customer');
      recommendations.push('Ikuti training customer service dan product knowledge');
    }
    
    if (trendAnalysis.salesTrend === 'decreasing') {
      recommendations.push('Analisis penyebab penurunan penjualan dan buat action plan');
    }
    
    if (trendAnalysis.ratingTrend === 'declining') {
      recommendations.push('Evaluasi feedback customer dan perbaiki area yang bermasalah');
    }
    
    return recommendations;
  }

  private identifyStrengths(totalPenjualan: number, targetPenjualan: number, ratingRataRata: number, trendAnalysis: any): string[] {
    const strengths: string[] = [];
    
    const targetAchievement = targetPenjualan > 0 ? (totalPenjualan / targetPenjualan) * 100 : 0;
    
    if (targetAchievement >= 100) {
      strengths.push('Mencapai atau melampaui target penjualan');
    }
    
    if (ratingRataRata >= 4.5) {
      strengths.push('Rating customer sangat tinggi');
    }
    
    if (trendAnalysis.salesTrend === 'increasing') {
      strengths.push('Tren penjualan meningkat');
    }
    
    if (trendAnalysis.ratingTrend === 'improving') {
      strengths.push('Kepuasan customer terus membaik');
    }
    
    return strengths;
  }

  private identifyImprovements(totalPenjualan: number, targetPenjualan: number, ratingRataRata: number, trendAnalysis: any): string[] {
    const improvements: string[] = [];
    
    const targetAchievement = targetPenjualan > 0 ? (totalPenjualan / targetPenjualan) * 100 : 0;
    
    if (targetAchievement < 80) {
      improvements.push('Peningkatan pencapaian target penjualan');
    }
    
    if (ratingRataRata < 4.0) {
      improvements.push('Peningkatan rating dan kepuasan customer');
    }
    
    if (trendAnalysis.salesTrend === 'decreasing') {
      improvements.push('Stabilisasi dan peningkatan tren penjualan');
    }
    
    if (trendAnalysis.overallTrend === 'concerning') {
      improvements.push('Perbaikan performa secara keseluruhan');
    }
    
    return improvements;
  }

  private async validateActionAuthority(action: string, penjual: IEntitasPenjual): Promise<void> {
    try {
      // Simulasi validasi authority
      const restrictedActions = ['DELETE'];
      const hasAuthority = Math.random() < 0.95; // 95% success rate
      
      if (restrictedActions.includes(action) && !hasAuthority) {
        throw new Error(`Tidak memiliki authority untuk ${action}`);
      }
      
      if (penjual.statusPenjual === 'DELETED') {
        throw new Error('Tidak dapat mengelola penjual yang sudah dihapus');
      }
      
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasPenjual] Action authority validation error:', error);
      throw error;
    }
  }

  private async backupPenjualData(penjual: IEntitasPenjual): Promise<void> {
    try {
      const backup = {
        ...penjual,
        backupTimestamp: new Date()
      };
      
      console.log('[EntitasPenjual] Data penjual dibackup:', backup);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPenjual] Error backing up penjual data:', error);
    }
  }

  private async activatePenjual(idPenjual: string): Promise<boolean> {
    try {
      console.log(`[EntitasPenjual] Mengaktifkan penjual ${idPenjual}`);
      
      // Simulasi aktivasi
      const success = Math.random() < 0.95; // 95% success rate
      
      if (success) {
        // Update status in database
        await this.updatePenjualStatus(idPenjual, 'AKTIF');
        
        // Send welcome back notification
        await this.sendWelcomeBackNotification(idPenjual);
        
        // Restore access permissions
        await this.restoreAccessPermissions(idPenjual);
      }
      
      await this.simulateDelay(200);
      return success;
    } catch (error) {
      console.error('[EntitasPenjual] Error activating penjual:', error);
      return false;
    }
  }

  private async deactivatePenjual(idPenjual: string): Promise<boolean> {
    try {
      console.log(`[EntitasPenjual] Menonaktifkan penjual ${idPenjual}`);
      
      // Simulasi deaktivasi
      const success = Math.random() < 0.95; // 95% success rate
      
      if (success) {
        // Update status in database
        await this.updatePenjualStatus(idPenjual, 'NONAKTIF');
        
        // Send deactivation notification
        await this.sendDeactivationNotification(idPenjual);
        
        // Revoke access permissions
        await this.revokeAccessPermissions(idPenjual);
        
        // Handle pending transactions
        await this.handlePendingTransactions(idPenjual);
      }
      
      await this.simulateDelay(200);
      return success;
    } catch (error) {
      console.error('[EntitasPenjual] Error deactivating penjual:', error);
      return false;
    }
  }

  private async suspendPenjual(idPenjual: string, reason: string): Promise<boolean> {
    try {
      console.log(`[EntitasPenjual] Mensuspend penjual ${idPenjual} dengan alasan: ${reason}`);
      
      // Simulasi suspend
      const success = Math.random() < 0.95; // 95% success rate
      
      if (success) {
        // Update status in database
        await this.updatePenjualStatus(idPenjual, 'SUSPENDED');
        
        // Send suspension notification
        await this.sendSuspensionNotification(idPenjual, reason);
        
        // Temporarily revoke access
        await this.temporaryRevokeAccess(idPenjual);
        
        // Schedule review
        await this.scheduleReview(idPenjual, reason);
      }
      
      await this.simulateDelay(200);
      return success;
    } catch (error) {
      console.error('[EntitasPenjual] Error suspending penjual:', error);
      return false;
    }
  }

  private async updatePenjualData(idPenjual: string, data: Partial<IEntitasPenjual>): Promise<boolean> {
    try {
      console.log(`[EntitasPenjual] Updating data penjual ${idPenjual}:`, data);
      
      // Validate update data
      await this.validateUpdateData(data);
      
      // Simulasi update
      const success = Math.random() < 0.98; // 98% success rate
      
      if (success) {
        // Update in database
        await this.updatePenjualInDatabase(idPenjual, data);
        
        // Send update notification
        await this.sendUpdateNotification(idPenjual, data);
        
        // Update cache
        await this.updatePenjualCache(idPenjual, 'UPDATE');
      }
      
      await this.simulateDelay(150);
      return success;
    } catch (error) {
      console.error('[EntitasPenjual] Error updating penjual data:', error);
      return false;
    }
  }

  private async deletePenjual(idPenjual: string): Promise<boolean> {
    try {
      console.log(`[EntitasPenjual] Menghapus penjual ${idPenjual}`);
      
      // Simulasi delete (soft delete)
      const success = Math.random() < 0.90; // 90% success rate
      
      if (success) {
        // Soft delete - update status to DELETED
        await this.updatePenjualStatus(idPenjual, 'DELETED');
        
        // Archive related data
        await this.archiveRelatedData(idPenjual);
        
        // Send deletion notification
        await this.sendDeletionNotification(idPenjual);
        
        // Remove from active caches
        await this.removeFromActiveCache(idPenjual);
      }
      
      await this.simulateDelay(200);
      return success;
    } catch (error) {
      console.error('[EntitasPenjual] Error deleting penjual:', error);
      return false;
    }
  }

  private async verifyPenjual(idPenjual: string): Promise<boolean> {
    try {
      console.log(`[EntitasPenjual] Memverifikasi penjual ${idPenjual}`);
      
      // Simulasi verifikasi
      const success = Math.random() < 0.95; // 95% success rate
      
      if (success) {
        // Update status to VERIFIED
        await this.updatePenjualStatus(idPenjual, 'VERIFIED');
        
        // Grant verified privileges
        await this.grantVerifiedPrivileges(idPenjual);
        
        // Send verification notification
        await this.sendVerificationNotification(idPenjual);
        
        // Update verification badge
        await this.updateVerificationBadge(idPenjual);
      }
      
      await this.simulateDelay(150);
      return success;
    } catch (error) {
      console.error('[EntitasPenjual] Error verifying penjual:', error);
      return false;
    }
  }

  // Additional Helper Methods
  private async updatePenjualStatus(idPenjual: string, newStatus: string): Promise<void> {
    try {
      console.log(`[EntitasPenjual] Updating status penjual ${idPenjual} to ${newStatus}`);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasPenjual] Error updating penjual status:', error);
      throw error;
    }
  }

  private async updateSearchAnalytics(filter: IPenjualFilter, resultCount: number): Promise<void> {
    try {
      const analytics = {
        filter,
        resultCount,
        timestamp: new Date()
      };
      
      console.log('[EntitasPenjual] Search analytics updated:', analytics);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPenjual] Error updating search analytics:', error);
    }
  }

  private async updatePerformaCache(performa: IPenjualPerforma): Promise<void> {
    try {
      console.log('[EntitasPenjual] Performance cache updated:', performa);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPenjual] Error updating performa cache:', error);
    }
  }

  private async generatePerformaReport(performa: IPenjualPerforma, insights: any, trends: any): Promise<void> {
    try {
      const report = {
        performa,
        insights,
        trends,
        generatedAt: new Date()
      };
      
      console.log('[EntitasPenjual] Performance report generated:', report);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasPenjual] Error generating performa report:', error);
    }
  }

  private async sendPerformaNotifications(performa: IPenjualPerforma): Promise<void> {
    try {
      const notifications = [];
      
      if (performa.pencapaianTarget >= 100) {
        notifications.push({
          type: 'ACHIEVEMENT',
          message: 'Selamat! Target penjualan tercapai'
        });
      } else if (performa.pencapaianTarget < 50) {
        notifications.push({
          type: 'WARNING',
          message: 'Pencapaian target masih rendah, perlu peningkatan'
        });
      }
      
      console.log('[EntitasPenjual] Performance notifications sent:', notifications);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasPenjual] Error sending performa notifications:', error);
    }
  }

  private async updateRelatedData(idPenjual: string, action: string, oldStatus: string, newStatus: string): Promise<void> {
    try {
      console.log(`[EntitasPenjual] Updating related data for ${idPenjual}: ${action} (${oldStatus} -> ${newStatus})`);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasPenjual] Error updating related data:', error);
    }
  }

  private async sendManagementNotifications(penjual: IEntitasPenjual, action: string, newStatus: string): Promise<void> {
    try {
      const notifications = [
        {
          type: 'PENJUAL',
          idPenjual: penjual.idPenjual,
          message: `Status Anda telah diupdate: ${newStatus}`
        },
        {
          type: 'ADMIN',
          message: `Penjual ${penjual.namaPenjual} telah di-${action.toLowerCase()}`
        }
      ];
      
      console.log('[EntitasPenjual] Management notifications sent:', notifications);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasPenjual] Error sending management notifications:', error);
    }
  }

  private async updatePenjualStatistics(action: string, oldStatus: string, newStatus: string): Promise<void> {
    try {
      const stats = {
        action,
        oldStatus,
        newStatus,
        timestamp: new Date()
      };
      
      console.log('[EntitasPenjual] Statistics updated:', stats);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPenjual] Error updating statistics:', error);
    }
  }

  private async generateAuditLog(idPenjual: string, action: string, oldStatus: string, newStatus: string, data?: any): Promise<void> {
    try {
      const auditLog = {
        idPenjual,
        action,
        oldStatus,
        newStatus,
        data,
        timestamp: new Date(),
        userId: 'system' // In real implementation, get from context
      };
      
      console.log('[EntitasPenjual] Audit log generated:', auditLog);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPenjual] Error generating audit log:', error);
    }
  }

  private async updatePenjualCache(idPenjual: string, action: string): Promise<void> {
    try {
      console.log(`[EntitasPenjual] Cache updated for ${idPenjual}: ${action}`);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPenjual] Error updating cache:', error);
    }
  }

  private async generateManagementInsights(action: string, penjual: IEntitasPenjual, newStatus: string): Promise<void> {
    try {
      const insights = {
        action,
        penjualProfile: {
          rating: penjual.ratingPenjual,
          penjualan: penjual.jumlahMobilTerjual,
          lamaKerja: this.calculateWorkDuration(penjual.tanggalBergabung)
        },
        impact: this.assessActionImpact(action, penjual),
        recommendations: this.generateActionRecommendations(action, penjual, newStatus)
      };
      
      console.log('[EntitasPenjual] Management insights generated:', insights);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPenjual] Error generating management insights:', error);
    }
  }

  private calculateWorkDuration(tanggalBergabung: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - tanggalBergabung.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30)); // in months
  }

  private assessActionImpact(action: string, penjual: IEntitasPenjual): string {
    if (action === 'DEACTIVATE' && penjual.ratingPenjual >= 4.5) {
      return 'HIGH_NEGATIVE'; // Deactivating high-rated seller
    } else if (action === 'ACTIVATE' && penjual.jumlahMobilTerjual > 100) {
      return 'POSITIVE'; // Activating experienced seller
    } else if (action === 'DELETE') {
      return 'HIGH_NEGATIVE'; // Deleting seller always has negative impact
    }
    return 'NEUTRAL';
  }

  private generateActionRecommendations(action: string, penjual: IEntitasPenjual, newStatus: string): string[] {
    const recommendations: string[] = [];
    
    if (action === 'DEACTIVATE') {
      recommendations.push('Monitor customer impact and reassign pending transactions');
      recommendations.push('Consider reactivation timeline if performance improves');
    } else if (action === 'ACTIVATE') {
      recommendations.push('Provide onboarding support and training');
      recommendations.push('Set clear performance expectations and targets');
    } else if (action === 'SUSPEND') {
      recommendations.push('Schedule regular review meetings');
      recommendations.push('Provide improvement plan and support');
    }
    
    return recommendations;
  }

  // Notification Helper Methods
  private async sendWelcomeBackNotification(idPenjual: string): Promise<void> {
    try {
      const notification = {
        type: 'WELCOME_BACK',
        message: 'Selamat datang kembali! Akun Anda telah diaktifkan.',
        timestamp: new Date()
      };
      
      console.log(`[EntitasPenjual] Welcome back notification sent to ${idPenjual}:`, notification);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPenjual] Error sending welcome back notification:', error);
    }
  }

  private async sendDeactivationNotification(idPenjual: string): Promise<void> {
    try {
      const notification = {
        type: 'DEACTIVATION',
        message: 'Akun Anda telah dinonaktifkan. Hubungi admin untuk informasi lebih lanjut.',
        timestamp: new Date()
      };
      
      console.log(`[EntitasPenjual] Deactivation notification sent to ${idPenjual}:`, notification);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPenjual] Error sending deactivation notification:', error);
    }
  }

  private async sendSuspensionNotification(idPenjual: string, reason: string): Promise<void> {
    try {
      const notification = {
        type: 'SUSPENSION',
        message: `Akun Anda telah disuspend. Alasan: ${reason}`,
        timestamp: new Date()
      };
      
      console.log(`[EntitasPenjual] Suspension notification sent to ${idPenjual}:`, notification);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPenjual] Error sending suspension notification:', error);
    }
  }

  private async sendUpdateNotification(idPenjual: string, data: Partial<IEntitasPenjual>): Promise<void> {
    try {
      const notification = {
        type: 'UPDATE',
        message: 'Data profil Anda telah diperbarui.',
        updatedFields: Object.keys(data),
        timestamp: new Date()
      };
      
      console.log(`[EntitasPenjual] Update notification sent to ${idPenjual}:`, notification);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPenjual] Error sending update notification:', error);
    }
  }

  private async sendDeletionNotification(idPenjual: string): Promise<void> {
    try {
      const notification = {
        type: 'DELETION',
        message: 'Akun Anda telah dihapus dari sistem.',
        timestamp: new Date()
      };
      
      console.log(`[EntitasPenjual] Deletion notification sent to ${idPenjual}:`, notification);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPenjual] Error sending deletion notification:', error);
    }
  }

  private async sendVerificationNotification(idPenjual: string): Promise<void> {
    try {
      const notification = {
        type: 'VERIFICATION',
        message: 'Selamat! Akun Anda telah terverifikasi.',
        timestamp: new Date()
      };
      
      console.log(`[EntitasPenjual] Verification notification sent to ${idPenjual}:`, notification);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPenjual] Error sending verification notification:', error);
    }
  }

  // Access Management Helper Methods
  private async restoreAccessPermissions(idPenjual: string): Promise<void> {
    try {
      console.log(`[EntitasPenjual] Restoring access permissions for ${idPenjual}`);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasPenjual] Error restoring access permissions:', error);
    }
  }

  private async revokeAccessPermissions(idPenjual: string): Promise<void> {
    try {
      console.log(`[EntitasPenjual] Revoking access permissions for ${idPenjual}`);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasPenjual] Error revoking access permissions:', error);
    }
  }

  private async temporaryRevokeAccess(idPenjual: string): Promise<void> {
    try {
      console.log(`[EntitasPenjual] Temporarily revoking access for ${idPenjual}`);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasPenjual] Error temporarily revoking access:', error);
    }
  }

  private async grantVerifiedPrivileges(idPenjual: string): Promise<void> {
    try {
      console.log(`[EntitasPenjual] Granting verified privileges to ${idPenjual}`);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasPenjual] Error granting verified privileges:', error);
    }
  }

  // Data Management Helper Methods
  private async handlePendingTransactions(idPenjual: string): Promise<void> {
    try {
      console.log(`[EntitasPenjual] Handling pending transactions for ${idPenjual}`);
      await this.simulateDelay(150);
    } catch (error) {
      console.error('[EntitasPenjual] Error handling pending transactions:', error);
    }
  }

  private async scheduleReview(idPenjual: string, reason: string): Promise<void> {
    try {
      const review = {
        idPenjual,
        reason,
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'SCHEDULED'
      };
      
      console.log('[EntitasPenjual] Review scheduled:', review);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPenjual] Error scheduling review:', error);
    }
  }

  private async validateUpdateData(data: Partial<IEntitasPenjual>): Promise<void> {
    try {
      const errors: string[] = [];
      
      if (data.emailPenjual && !this.isValidEmail(data.emailPenjual)) {
        errors.push('Format email tidak valid');
      }
      
      if (data.teleponPenjual && !this.isValidPhone(data.teleponPenjual)) {
        errors.push('Format telepon tidak valid');
      }
      
      if (data.ratingPenjual && (data.ratingPenjual < 0 || data.ratingPenjual > 5)) {
        errors.push('Rating harus antara 0-5');
      }
      
      if (errors.length > 0) {
        throw new Error(`Validation errors: ${errors.join(', ')}`);
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPenjual] Update data validation error:', error);
      throw error;
    }
  }

  private async updatePenjualInDatabase(idPenjual: string, data: Partial<IEntitasPenjual>): Promise<void> {
    try {
      console.log(`[EntitasPenjual] Updating penjual ${idPenjual} in database:`, data);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasPenjual] Error updating penjual in database:', error);
      throw error;
    }
  }

  private async archiveRelatedData(idPenjual: string): Promise<void> {
    try {
      console.log(`[EntitasPenjual] Archiving related data for ${idPenjual}`);
      await this.simulateDelay(150);
    } catch (error) {
      console.error('[EntitasPenjual] Error archiving related data:', error);
    }
  }

  private async removeFromActiveCache(idPenjual: string): Promise<void> {
    try {
      console.log(`[EntitasPenjual] Removing ${idPenjual} from active cache`);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPenjual] Error removing from active cache:', error);
    }
  }

  private async updateVerificationBadge(idPenjual: string): Promise<void> {
    try {
      console.log(`[EntitasPenjual] Updating verification badge for ${idPenjual}`);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPenjual] Error updating verification badge:', error);
    }
  }

  // Validation Helper Methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    return phoneRegex.test(phone);
  }

  // Activity Logging
  private async logPenjualActivity(action: string, idPenjual: string, details: any): Promise<void> {
    try {
      const logEntry = {
        action,
        idPenjual,
        details,
        timestamp: new Date(),
        userId: 'system' // In real implementation, get from context
      };
      
      console.log('[EntitasPenjual] Activity logged:', logEntry);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPenjual] Error logging activity:', error);
    }
  }

  // Error Handling
  private async handlePenjualError(error: Error): Promise<void> {
    try {
      const errorLog = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date(),
        context: 'EntitasPenjual'
      };
      
      console.error('[EntitasPenjual] Error handled:', errorLog);
      
      // Send error notification to admin
      await this.sendErrorNotification(errorLog);
      
      await this.simulateDelay(50);
    } catch (logError) {
      console.error('[EntitasPenjual] Error in error handler:', logError);
    }
  }

  private async sendErrorNotification(errorLog: any): Promise<void> {
    try {
      const notification = {
        type: 'ERROR',
        message: `Error in EntitasPenjual: ${errorLog.message}`,
        timestamp: new Date(),
        severity: 'HIGH'
      };
      
      console.log('[EntitasPenjual] Error notification sent:', notification);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPenjual] Error sending error notification:', error);
    }
  }

  // Utility Methods
  public toJSON(): any {
    return {
      idPenjual: this.idPenjual,
      namaPenjual: this.namaPenjual,
      emailPenjual: this.emailPenjual,
      teleponPenjual: this.teleponPenjual,
      alamatPenjual: this.alamatPenjual,
      ratingPenjual: this.ratingPenjual,
      jumlahMobilTerjual: this.jumlahMobilTerjual,
      statusPenjual: this.statusPenjual,
      tanggalBergabung: this.tanggalBergabung
    };
  }

  public toString(): string {
    return `EntitasPenjual(${this.idPenjual}: ${this.namaPenjual} - ${this.statusPenjual})`;
  }

  public static fromJSON(json: any): EntitasPenjual {
    return new EntitasPenjual({
      idPenjual: json.idPenjual,
      namaPenjual: json.namaPenjual,
      emailPenjual: json.emailPenjual,
      teleponPenjual: json.teleponPenjual,
      alamatPenjual: json.alamatPenjual,
      ratingPenjual: json.ratingPenjual,
      jumlahMobilTerjual: json.jumlahMobilTerjual,
      statusPenjual: json.statusPenjual,
      tanggalBergabung: new Date(json.tanggalBergabung)
    });
  }

  public static createEmpty(): EntitasPenjual {
    return new EntitasPenjual();
  }

  // Validation Methods
  public isValid(): boolean {
    return this.getValidationErrors().length === 0;
  }

  public getValidationErrors(): string[] {
    const errors: string[] = [];
    
    if (!this.namaPenjual || this.namaPenjual.trim().length === 0) {
      errors.push('Nama penjual harus diisi');
    }
    
    if (!this.emailPenjual || !this.isValidEmail(this.emailPenjual)) {
      errors.push('Email penjual tidak valid');
    }
    
    if (!this.teleponPenjual || !this.isValidPhone(this.teleponPenjual)) {
      errors.push('Telepon penjual tidak valid');
    }
    
    if (this.ratingPenjual < 0 || this.ratingPenjual > 5) {
      errors.push('Rating harus antara 0-5');
    }
    
    if (this.jumlahMobilTerjual < 0) {
      errors.push('Jumlah mobil terjual tidak boleh negatif');
    }
    
    return errors;
  }

  // Status Check Methods
  public isActive(): boolean {
    return this.statusPenjual === 'AKTIF';
  }

  public isInactive(): boolean {
    return this.statusPenjual === 'NONAKTIF';
  }

  public isSuspended(): boolean {
    return this.statusPenjual === 'SUSPENDED';
  }

  public isVerified(): boolean {
    return this.statusPenjual === 'VERIFIED';
  }

  public isDeleted(): boolean {
    return this.statusPenjual === 'DELETED';
  }

  public canSell(): boolean {
    return this.isActive() || this.isVerified();
  }

  public canReceiveOrders(): boolean {
    return this.canSell() && this.ratingPenjual >= 2.0;
  }

  // Performance Methods
  public isTopPerformer(): boolean {
    return this.ratingPenjual >= 4.5 && this.jumlahMobilTerjual >= 50;
  }

  public isNewSeller(): boolean {
    const monthsWorking = this.calculateWorkDuration(this.tanggalBergabung);
    return monthsWorking <= 3;
  }

  public isExperiencedSeller(): boolean {
    const monthsWorking = this.calculateWorkDuration(this.tanggalBergabung);
    return monthsWorking >= 12 && this.jumlahMobilTerjual >= 20;
  }

  public getPerformanceLevel(): string {
    if (this.isTopPerformer()) return 'TOP_PERFORMER';
    if (this.ratingPenjual >= 4.0 && this.jumlahMobilTerjual >= 20) return 'HIGH_PERFORMER';
    if (this.ratingPenjual >= 3.5 && this.jumlahMobilTerjual >= 10) return 'AVERAGE_PERFORMER';
    if (this.ratingPenjual >= 3.0 && this.jumlahMobilTerjual >= 5) return 'BELOW_AVERAGE';
    return 'LOW_PERFORMER';
  }

  // Rating Methods
  public hasExcellentRating(): boolean {
    return this.ratingPenjual >= 4.5;
  }

  public hasGoodRating(): boolean {
    return this.ratingPenjual >= 4.0;
  }

  public hasAverageRating(): boolean {
    return this.ratingPenjual >= 3.0;
  }

  public hasPoorRating(): boolean {
    return this.ratingPenjual < 3.0;
  }

  // Sales Methods
  public isHighVolumeSeller(): boolean {
    return this.jumlahMobilTerjual >= 100;
  }

  public isMediumVolumeSeller(): boolean {
    return this.jumlahMobilTerjual >= 20 && this.jumlahMobilTerjual < 100;
  }

  public isLowVolumeSeller(): boolean {
    return this.jumlahMobilTerjual < 20;
  }

  public getSalesCategory(): string {
    if (this.isHighVolumeSeller()) return 'HIGH_VOLUME';
    if (this.isMediumVolumeSeller()) return 'MEDIUM_VOLUME';
    return 'LOW_VOLUME';
  }

  // Time-based Methods
  public getWorkingDurationInMonths(): number {
    return this.calculateWorkDuration(this.tanggalBergabung);
  }

  public getWorkingDurationInYears(): number {
    return Math.floor(this.getWorkingDurationInMonths() / 12);
  }

  public isRecentJoiner(): boolean {
    return this.getWorkingDurationInMonths() <= 1;
  }

  public isLongTermSeller(): boolean {
    return this.getWorkingDurationInYears() >= 2;
  }
}