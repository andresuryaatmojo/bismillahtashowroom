/**
 * EntitasMarket - Kelas untuk mengelola data pasar mobil
 * Menangani analisis harga pasar, tren, dan statistik penjualan mobil
 */

export interface IEntitasMarket {
  idMarketData: string;
  idModelMobil: string;
  tahunProduksi: number;
  lokasi: string;
  periodeData: Date;
  hargaPasaranRataRata: number;
  hargaTertinggi: number;
  hargaTerendah: number;
  jumlahListing: number;
  jumlahTerjual: number;
  trenHarga: string;
  tanggalDiperbarui: Date;
}

export interface IMarketAnalysis {
  volatilitas: number;
  indeksHarga: number;
  prediksiTren: string;
  faktorPengaruh: string[];
  rekomendasi: string;
}

export interface IMarketComparison {
  modelMobil: string;
  hargaRataRata: number;
  perbandinganDenganKompetitor: number;
  posisiPasar: string;
}

export class EntitasMarket implements IEntitasMarket {
  // Attributes
  public idMarketData: string;
  public idModelMobil: string;
  public tahunProduksi: number;
  public lokasi: string;
  public periodeData: Date;
  public hargaPasaranRataRata: number;
  public hargaTertinggi: number;
  public hargaTerendah: number;
  public jumlahListing: number;
  public jumlahTerjual: number;
  public trenHarga: string;
  public tanggalDiperbarui: Date;

  constructor(data: Partial<IEntitasMarket> = {}) {
    this.idMarketData = data.idMarketData || this.generateId();
    this.idModelMobil = data.idModelMobil || '';
    this.tahunProduksi = data.tahunProduksi || new Date().getFullYear();
    this.lokasi = data.lokasi || '';
    this.periodeData = data.periodeData || new Date();
    this.hargaPasaranRataRata = data.hargaPasaranRataRata || 0;
    this.hargaTertinggi = data.hargaTertinggi || 0;
    this.hargaTerendah = data.hargaTerendah || 0;
    this.jumlahListing = data.jumlahListing || 0;
    this.jumlahTerjual = data.jumlahTerjual || 0;
    this.trenHarga = data.trenHarga || 'STABLE';
    this.tanggalDiperbarui = data.tanggalDiperbarui || new Date();
  }

  // Main Method
  /**
   * Mengambil data pasar untuk model mobil tertentu
   * @returns Promise<IEntitasMarket> - Data pasar yang diperbarui
   */
  public async ambilDataMarket(): Promise<IEntitasMarket> {
    try {
      console.log(`[EntitasMarket] Mengambil data pasar untuk model ${this.idModelMobil}...`);
      
      // Validasi input
      if (!this.validateMarketDataRequest()) {
        throw new Error('Data request tidak valid');
      }

      await this.simulateDelay(600);
      
      // Simulasi pengambilan data dari berbagai sumber
      await this.fetchDataFromMultipleSources();
      
      // Kalkulasi statistik pasar
      await this.calculateMarketStatistics();
      
      // Analisis tren harga
      await this.analyzePriceTrends();
      
      // Update data dengan informasi terbaru
      await this.updateMarketData();
      
      // Validasi konsistensi data
      await this.validateDataConsistency();
      
      // Generate insights pasar
      await this.generateMarketInsights();
      
      // Log aktivitas
      await this.logMarketDataActivity();
      
      // Cache data untuk performa
      await this.cacheMarketData();
      
      console.log(`[EntitasMarket] Data pasar berhasil diambil untuk ${this.idModelMobil}`);
      return this.toJSON();
      
    } catch (error) {
      console.error('[EntitasMarket] Error mengambil data pasar:', error);
      await this.handleMarketDataError(error as Error);
      throw error;
    }
  }

  // Helper Methods
  private generateId(): string {
    return `MKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private validateMarketDataRequest(): boolean {
    // Validasi ID model mobil
    if (!this.idModelMobil || this.idModelMobil.trim() === '') {
      console.error('[EntitasMarket] ID model mobil tidak boleh kosong');
      return false;
    }

    // Validasi tahun produksi
    const currentYear = new Date().getFullYear();
    if (this.tahunProduksi < 1900 || this.tahunProduksi > currentYear + 1) {
      console.error('[EntitasMarket] Tahun produksi tidak valid');
      return false;
    }

    // Validasi lokasi
    if (!this.lokasi || this.lokasi.trim() === '') {
      console.error('[EntitasMarket] Lokasi tidak boleh kosong');
      return false;
    }

    return true;
  }

  private async fetchDataFromMultipleSources(): Promise<void> {
    try {
      console.log('[EntitasMarket] Mengambil data dari multiple sources...');
      
      // Simulasi pengambilan dari sumber data 1 (OLX, Carmudi, dll)
      await this.fetchFromOnlineMarketplaces();
      
      // Simulasi pengambilan dari sumber data 2 (Dealer resmi)
      await this.fetchFromOfficialDealers();
      
      // Simulasi pengambilan dari sumber data 3 (Auction data)
      await this.fetchFromAuctionData();
      
      // Simulasi pengambilan dari sumber data 4 (Insurance valuations)
      await this.fetchFromInsuranceData();
      
      await this.simulateDelay(300);
    } catch (error) {
      console.error('[EntitasMarket] Error fetching from multiple sources:', error);
    }
  }

  private async fetchFromOnlineMarketplaces(): Promise<void> {
    try {
      // Simulasi data dari marketplace online
      const marketplaceData = {
        averagePrice: Math.floor(Math.random() * 500000000) + 100000000, // 100M - 600M
        listings: Math.floor(Math.random() * 100) + 10,
        priceRange: {
          min: Math.floor(Math.random() * 200000000) + 50000000,
          max: Math.floor(Math.random() * 300000000) + 400000000
        }
      };

      this.jumlahListing += marketplaceData.listings;
      console.log('[EntitasMarket] Data dari online marketplaces:', marketplaceData);
      await this.simulateDelay(150);
    } catch (error) {
      console.error('[EntitasMarket] Error fetching marketplace data:', error);
    }
  }

  private async fetchFromOfficialDealers(): Promise<void> {
    try {
      // Simulasi data dari dealer resmi
      const dealerData = {
        officialPrice: Math.floor(Math.random() * 400000000) + 200000000,
        soldUnits: Math.floor(Math.random() * 50) + 5,
        incentives: Math.floor(Math.random() * 20000000) + 5000000
      };

      this.jumlahTerjual += dealerData.soldUnits;
      console.log('[EntitasMarket] Data dari official dealers:', dealerData);
      await this.simulateDelay(150);
    } catch (error) {
      console.error('[EntitasMarket] Error fetching dealer data:', error);
    }
  }

  private async fetchFromAuctionData(): Promise<void> {
    try {
      // Simulasi data dari lelang
      const auctionData = {
        averageAuctionPrice: Math.floor(Math.random() * 300000000) + 150000000,
        auctionVolume: Math.floor(Math.random() * 20) + 2,
        successRate: Math.floor(Math.random() * 40) + 60 // 60-100%
      };

      console.log('[EntitasMarket] Data dari auction:', auctionData);
      await this.simulateDelay(150);
    } catch (error) {
      console.error('[EntitasMarket] Error fetching auction data:', error);
    }
  }

  private async fetchFromInsuranceData(): Promise<void> {
    try {
      // Simulasi data dari asuransi
      const insuranceData = {
        insuranceValue: Math.floor(Math.random() * 350000000) + 180000000,
        depreciationRate: Math.floor(Math.random() * 15) + 10, // 10-25%
        riskFactor: Math.floor(Math.random() * 5) + 1 // 1-5
      };

      console.log('[EntitasMarket] Data dari insurance:', insuranceData);
      await this.simulateDelay(150);
    } catch (error) {
      console.error('[EntitasMarket] Error fetching insurance data:', error);
    }
  }

  private async calculateMarketStatistics(): Promise<void> {
    try {
      console.log('[EntitasMarket] Menghitung statistik pasar...');
      
      // Simulasi kalkulasi harga rata-rata
      this.hargaPasaranRataRata = Math.floor(Math.random() * 400000000) + 150000000;
      
      // Kalkulasi harga tertinggi dan terendah
      const variance = this.hargaPasaranRataRata * 0.3; // 30% variance
      this.hargaTertinggi = Math.floor(this.hargaPasaranRataRata + variance);
      this.hargaTerendah = Math.floor(this.hargaPasaranRataRata - variance);
      
      // Pastikan harga terendah tidak negatif
      if (this.hargaTerendah < 0) {
        this.hargaTerendah = Math.floor(this.hargaPasaranRataRata * 0.5);
      }
      
      // Kalkulasi jumlah listing dan terjual jika belum ada
      if (this.jumlahListing === 0) {
        this.jumlahListing = Math.floor(Math.random() * 150) + 20;
      }
      
      if (this.jumlahTerjual === 0) {
        this.jumlahTerjual = Math.floor(this.jumlahListing * 0.3); // 30% conversion rate
      }
      
      await this.simulateDelay(200);
    } catch (error) {
      console.error('[EntitasMarket] Error calculating statistics:', error);
    }
  }

  private async analyzePriceTrends(): Promise<void> {
    try {
      console.log('[EntitasMarket] Menganalisis tren harga...');
      
      // Simulasi analisis tren berdasarkan data historis
      const trendFactors = {
        seasonality: Math.random() > 0.5,
        economicCondition: Math.random() > 0.3,
        supplyDemand: Math.random() > 0.4,
        newModelRelease: Math.random() > 0.8
      };
      
      // Tentukan tren berdasarkan faktor-faktor
      if (trendFactors.newModelRelease) {
        this.trenHarga = 'DECLINING';
      } else if (trendFactors.supplyDemand && trendFactors.economicCondition) {
        this.trenHarga = 'RISING';
      } else if (trendFactors.seasonality) {
        this.trenHarga = 'SEASONAL';
      } else {
        this.trenHarga = 'STABLE';
      }
      
      console.log(`[EntitasMarket] Tren harga: ${this.trenHarga}`);
      await this.simulateDelay(200);
    } catch (error) {
      console.error('[EntitasMarket] Error analyzing trends:', error);
    }
  }

  private async updateMarketData(): Promise<void> {
    try {
      // Update timestamp
      this.tanggalDiperbarui = new Date();
      this.periodeData = new Date();
      
      // Validasi konsistensi harga
      if (this.hargaTerendah > this.hargaPasaranRataRata) {
        this.hargaTerendah = Math.floor(this.hargaPasaranRataRata * 0.8);
      }
      
      if (this.hargaTertinggi < this.hargaPasaranRataRata) {
        this.hargaTertinggi = Math.floor(this.hargaPasaranRataRata * 1.2);
      }
      
      console.log('[EntitasMarket] Market data updated successfully');
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasMarket] Error updating market data:', error);
    }
  }

  private async validateDataConsistency(): Promise<void> {
    try {
      const errors: string[] = [];
      
      // Validasi harga
      if (this.hargaTerendah >= this.hargaTertinggi) {
        errors.push('Harga terendah tidak boleh >= harga tertinggi');
      }
      
      if (this.hargaPasaranRataRata < this.hargaTerendah || this.hargaPasaranRataRata > this.hargaTertinggi) {
        errors.push('Harga rata-rata harus berada di antara harga terendah dan tertinggi');
      }
      
      // Validasi jumlah
      if (this.jumlahTerjual > this.jumlahListing) {
        errors.push('Jumlah terjual tidak boleh > jumlah listing');
      }
      
      if (errors.length > 0) {
        console.warn('[EntitasMarket] Data consistency issues:', errors);
        await this.fixDataConsistency();
      }
      
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasMarket] Error validating consistency:', error);
    }
  }

  private async fixDataConsistency(): Promise<void> {
    try {
      // Fix harga jika tidak konsisten
      if (this.hargaTerendah >= this.hargaTertinggi) {
        this.hargaTerendah = Math.floor(this.hargaPasaranRataRata * 0.8);
        this.hargaTertinggi = Math.floor(this.hargaPasaranRataRata * 1.2);
      }
      
      // Fix jumlah jika tidak konsisten
      if (this.jumlahTerjual > this.jumlahListing) {
        this.jumlahTerjual = Math.floor(this.jumlahListing * 0.7);
      }
      
      console.log('[EntitasMarket] Data consistency fixed');
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasMarket] Error fixing consistency:', error);
    }
  }

  private async generateMarketInsights(): Promise<IMarketAnalysis> {
    try {
      const volatilitas = this.calculateVolatility();
      const indeksHarga = this.calculatePriceIndex();
      
      const insights: IMarketAnalysis = {
        volatilitas,
        indeksHarga,
        prediksiTren: this.predictFutureTrend(),
        faktorPengaruh: this.identifyInfluencingFactors(),
        rekomendasi: this.generateRecommendation()
      };
      
      console.log('[EntitasMarket] Market insights generated:', insights);
      await this.simulateDelay(150);
      return insights;
    } catch (error) {
      console.error('[EntitasMarket] Error generating insights:', error);
      throw error;
    }
  }

  private calculateVolatility(): number {
    const priceRange = this.hargaTertinggi - this.hargaTerendah;
    return (priceRange / this.hargaPasaranRataRata) * 100;
  }

  private calculatePriceIndex(): number {
    // Simulasi indeks harga relatif terhadap baseline
    const baselinePrice = 300000000; // 300M sebagai baseline
    return (this.hargaPasaranRataRata / baselinePrice) * 100;
  }

  private predictFutureTrend(): string {
    const trends = ['BULLISH', 'BEARISH', 'SIDEWAYS', 'VOLATILE'];
    return trends[Math.floor(Math.random() * trends.length)];
  }

  private identifyInfluencingFactors(): string[] {
    const allFactors = [
      'Kondisi Ekonomi',
      'Peluncuran Model Baru',
      'Kebijakan Pemerintah',
      'Tren Konsumen',
      'Ketersediaan Spare Part',
      'Biaya Perawatan',
      'Efisiensi Bahan Bakar',
      'Teknologi Terbaru'
    ];
    
    // Pilih 3-5 faktor secara random
    const selectedFactors: string[] = [];
    const numFactors = Math.floor(Math.random() * 3) + 3; // 3-5 faktor
    
    while (selectedFactors.length < numFactors) {
      const factor = allFactors[Math.floor(Math.random() * allFactors.length)];
      if (!selectedFactors.includes(factor)) {
        selectedFactors.push(factor);
      }
    }
    
    return selectedFactors;
  }

  private generateRecommendation(): string {
    const conversionRate = (this.jumlahTerjual / this.jumlahListing) * 100;
    
    if (conversionRate > 50) {
      return 'Pasar sangat aktif, pertimbangkan untuk menaikkan harga';
    } else if (conversionRate > 30) {
      return 'Pasar cukup aktif, harga sudah sesuai dengan kondisi pasar';
    } else if (conversionRate > 15) {
      return 'Pasar kurang aktif, pertimbangkan untuk menurunkan harga';
    } else {
      return 'Pasar sangat lambat, perlu strategi marketing yang lebih agresif';
    }
  }

  private async logMarketDataActivity(): Promise<void> {
    try {
      const logData = {
        timestamp: new Date(),
        action: 'MARKET_DATA_FETCH',
        idMarketData: this.idMarketData,
        idModelMobil: this.idModelMobil,
        lokasi: this.lokasi,
        hargaRataRata: this.hargaPasaranRataRata,
        trenHarga: this.trenHarga,
        jumlahListing: this.jumlahListing,
        jumlahTerjual: this.jumlahTerjual
      };

      console.log('[EntitasMarket] Logging market data activity:', logData);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasMarket] Error logging activity:', error);
    }
  }

  private async cacheMarketData(): Promise<void> {
    try {
      const cacheKey = `market_${this.idModelMobil}_${this.lokasi}_${this.tahunProduksi}`;
      const cacheData = {
        ...this.toJSON(),
        cachedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000) // 1 hour cache
      };

      console.log(`[EntitasMarket] Caching market data with key: ${cacheKey}`);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasMarket] Error caching data:', error);
    }
  }

  private async handleMarketDataError(error: Error): Promise<void> {
    try {
      const errorLog = {
        timestamp: new Date(),
        error: error.message,
        idMarketData: this.idMarketData,
        idModelMobil: this.idModelMobil,
        action: 'MARKET_DATA_ERROR'
      };

      console.error('[EntitasMarket] Handling market data error:', errorLog);
      
      // Kirim alert ke admin
      await this.sendErrorAlert(error);
      
      await this.simulateDelay(100);
    } catch (handlingError) {
      console.error('[EntitasMarket] Error in error handling:', handlingError);
    }
  }

  private async sendErrorAlert(error: Error): Promise<void> {
    try {
      const alertData = {
        type: 'MARKET_DATA_ERROR',
        message: error.message,
        idMarketData: this.idMarketData,
        idModelMobil: this.idModelMobil,
        timestamp: new Date(),
        severity: 'HIGH'
      };

      console.log('[EntitasMarket] Sending error alert:', alertData);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasMarket] Error sending alert:', error);
    }
  }

  // Utility Methods
  public getMarketPerformance(): string {
    const conversionRate = (this.jumlahTerjual / this.jumlahListing) * 100;
    
    if (conversionRate > 50) return 'EXCELLENT';
    if (conversionRate > 30) return 'GOOD';
    if (conversionRate > 15) return 'AVERAGE';
    return 'POOR';
  }

  public getPriceVolatility(): string {
    const volatility = this.calculateVolatility();
    
    if (volatility > 30) return 'HIGH';
    if (volatility > 15) return 'MEDIUM';
    return 'LOW';
  }

  public isDataFresh(): boolean {
    const now = new Date();
    const dataAge = now.getTime() - this.tanggalDiperbarui.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return dataAge < maxAge;
  }

  public formatHarga(harga: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(harga);
  }

  public toJSON(): IEntitasMarket {
    return {
      idMarketData: this.idMarketData,
      idModelMobil: this.idModelMobil,
      tahunProduksi: this.tahunProduksi,
      lokasi: this.lokasi,
      periodeData: this.periodeData,
      hargaPasaranRataRata: this.hargaPasaranRataRata,
      hargaTertinggi: this.hargaTertinggi,
      hargaTerendah: this.hargaTerendah,
      jumlahListing: this.jumlahListing,
      jumlahTerjual: this.jumlahTerjual,
      trenHarga: this.trenHarga,
      tanggalDiperbarui: this.tanggalDiperbarui
    };
  }
}

export default EntitasMarket;