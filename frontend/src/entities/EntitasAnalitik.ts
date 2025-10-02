/**
 * EntitasAnalitik - Kelas untuk mengelola data analitik dan KPI dalam sistem Mobilindo Showroom
 * Menangani perhitungan, monitoring, dan pelaporan Key Performance Indicators
 */

// Interface untuk data analitik
export interface DataAnalitik {
  idAnalitik: string;
  jenisKPI: string;
  nilaiKPI: number;
  targetKPI: number;
  persentasePencapaian: number;
  periode: string;
  tanggalHitung: Date;
  statusKPI: string;
  kategoriPerforma: string;
  deskripsi: string;
  trendDirection: string;
  alertThreshold: number;
  isAlertActive: boolean;
}

// Enum untuk jenis KPI
export enum JenisKPI {
  PENJUALAN = 'penjualan',
  REVENUE = 'revenue',
  CONVERSION_RATE = 'conversion_rate',
  CUSTOMER_SATISFACTION = 'customer_satisfaction',
  INVENTORY_TURNOVER = 'inventory_turnover',
  LEAD_GENERATION = 'lead_generation',
  COST_PER_ACQUISITION = 'cost_per_acquisition',
  RETENTION_RATE = 'retention_rate',
  AVERAGE_ORDER_VALUE = 'average_order_value',
  MARKET_SHARE = 'market_share'
}

// Enum untuk status KPI
export enum StatusKPI {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  AVERAGE = 'average',
  BELOW_AVERAGE = 'below_average',
  POOR = 'poor',
  CRITICAL = 'critical'
}

// Enum untuk kategori performa
export enum KategoriPerforma {
  SALES = 'sales',
  MARKETING = 'marketing',
  CUSTOMER_SERVICE = 'customer_service',
  OPERATIONS = 'operations',
  FINANCIAL = 'financial',
  QUALITY = 'quality'
}

// Enum untuk trend direction
export enum TrendDirection {
  INCREASING = 'increasing',
  DECREASING = 'decreasing',
  STABLE = 'stable',
  VOLATILE = 'volatile'
}

export class EntitasAnalitik {
  // Attributes sesuai spesifikasi
  private idAnalitik: string;
  private jenisKPI: string;
  private nilaiKPI: number;
  private targetKPI: number;
  private persentasePencapaian: number;
  private periode: string;
  private tanggalHitung: Date;
  private statusKPI: string;
  private kategoriPerforma: string;
  private deskripsi: string;
  private trendDirection: string;
  private alertThreshold: number;
  private isAlertActive: boolean;

  constructor(data: DataAnalitik) {
    this.idAnalitik = data.idAnalitik;
    this.jenisKPI = data.jenisKPI;
    this.nilaiKPI = data.nilaiKPI;
    this.targetKPI = data.targetKPI;
    this.persentasePencapaian = data.persentasePencapaian;
    this.periode = data.periode;
    this.tanggalHitung = data.tanggalHitung;
    this.statusKPI = data.statusKPI;
    this.kategoriPerforma = data.kategoriPerforma;
    this.deskripsi = data.deskripsi;
    this.trendDirection = data.trendDirection;
    this.alertThreshold = data.alertThreshold;
    this.isAlertActive = data.isAlertActive;
  }

  // Methods sesuai spesifikasi

  /**
   * Mengambil semua data analitik dari database
   * @returns Promise<DataAnalitik[]> - Daftar semua data analitik
   */
  public async ambilDataAnalitik(): Promise<DataAnalitik[]> {
    try {
      await this.simulasiDelay(1000);
      
      // Ambil data analitik dari database
      const dataAnalitik = await this.ambilSemuaDataAnalitikDariDatabase();
      
      // Hitung persentase pencapaian untuk setiap KPI
      const dataWithCalculations = await Promise.all(
        dataAnalitik.map(async (data) => {
          const persentase = await this.hitungPersentasePencapaian(data.nilaiKPI, data.targetKPI);
          const status = await this.tentukanStatusKPI(persentase);
          const trend = await this.analisisTrend(data.idAnalitik);
          
          return {
            ...data,
            persentasePencapaian: persentase,
            statusKPI: status,
            trendDirection: trend
          };
        })
      );
      
      // Cek alert threshold
      await this.cekAlertThreshold(dataWithCalculations);
      
      // Log aktivitas
      await this.logAktivitas('AMBIL_DATA', 'Mengambil semua data analitik');
      
      return dataWithCalculations;
    } catch (error) {
      console.error('Error mengambil data analitik:', error);
      throw new Error('Gagal mengambil data analitik');
    }
  }

  /**
   * Query data detail berdasarkan parameter KPI
   * @param parameterKPI - Parameter untuk filter KPI
   * @returns Promise<any> - Data detail KPI
   */
  public async kueriDataDetail(parameterKPI: any): Promise<any> {
    try {
      // Validasi parameter
      if (!this.validasiParameterKPI(parameterKPI)) {
        throw new Error('Parameter KPI tidak valid');
      }

      await this.simulasiDelay(800);

      // Ambil data detail berdasarkan parameter
      const dataDetail = await this.ambilDataDetailDariDatabase(parameterKPI);
      
      // Enrich data dengan analisis tambahan
      const enrichedData = await this.enrichDataDenganAnalisis(dataDetail, parameterKPI);
      
      // Generate insights
      const insights = await this.generateInsights(enrichedData);
      
      // Buat rekomendasi
      const rekomendasi = await this.buatRekomendasi(enrichedData);
      
      const result = {
        data: enrichedData,
        insights: insights,
        rekomendasi: rekomendasi,
        metadata: {
          queryTime: new Date(),
          parameters: parameterKPI,
          recordCount: enrichedData.length
        }
      };
      
      // Log aktivitas
      await this.logAktivitas('KUERI_DETAIL', `Query data detail untuk ${parameterKPI.jenisKPI}`);
      
      return result;
    } catch (error) {
      console.error('Error kueri data detail:', error);
      throw error;
    }
  }

  // Helper methods untuk simulasi database dan operasi pendukung

  /**
   * Simulasi delay untuk operasi database
   */
  private async simulasiDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Simulasi pengambilan semua data analitik dari database
   */
  private async ambilSemuaDataAnalitikDariDatabase(): Promise<DataAnalitik[]> {
    // Simulasi data analitik
    return [
      {
        idAnalitik: 'ANL001',
        jenisKPI: JenisKPI.PENJUALAN,
        nilaiKPI: 125,
        targetKPI: 150,
        persentasePencapaian: 83.33,
        periode: '2024-01',
        tanggalHitung: new Date('2024-01-31'),
        statusKPI: StatusKPI.GOOD,
        kategoriPerforma: KategoriPerforma.SALES,
        deskripsi: 'Jumlah unit mobil terjual dalam bulan Januari',
        trendDirection: TrendDirection.INCREASING,
        alertThreshold: 70,
        isAlertActive: false
      },
      {
        idAnalitik: 'ANL002',
        jenisKPI: JenisKPI.REVENUE,
        nilaiKPI: 7500000000,
        targetKPI: 8000000000,
        persentasePencapaian: 93.75,
        periode: '2024-01',
        tanggalHitung: new Date('2024-01-31'),
        statusKPI: StatusKPI.EXCELLENT,
        kategoriPerforma: KategoriPerforma.FINANCIAL,
        deskripsi: 'Total revenue penjualan dalam bulan Januari',
        trendDirection: TrendDirection.INCREASING,
        alertThreshold: 80,
        isAlertActive: false
      },
      {
        idAnalitik: 'ANL003',
        jenisKPI: JenisKPI.CONVERSION_RATE,
        nilaiKPI: 12.5,
        targetKPI: 15.0,
        persentasePencapaian: 83.33,
        periode: '2024-01',
        tanggalHitung: new Date('2024-01-31'),
        statusKPI: StatusKPI.GOOD,
        kategoriPerforma: KategoriPerforma.MARKETING,
        deskripsi: 'Conversion rate dari lead menjadi penjualan',
        trendDirection: TrendDirection.STABLE,
        alertThreshold: 60,
        isAlertActive: false
      },
      {
        idAnalitik: 'ANL004',
        jenisKPI: JenisKPI.CUSTOMER_SATISFACTION,
        nilaiKPI: 4.2,
        targetKPI: 4.5,
        persentasePencapaian: 93.33,
        periode: '2024-01',
        tanggalHitung: new Date('2024-01-31'),
        statusKPI: StatusKPI.EXCELLENT,
        kategoriPerforma: KategoriPerforma.CUSTOMER_SERVICE,
        deskripsi: 'Rating kepuasan pelanggan (skala 1-5)',
        trendDirection: TrendDirection.INCREASING,
        alertThreshold: 75,
        isAlertActive: false
      }
    ];
  }

  /**
   * Hitung persentase pencapaian KPI
   */
  private async hitungPersentasePencapaian(nilaiKPI: number, targetKPI: number): Promise<number> {
    if (targetKPI === 0) return 0;
    return Math.round((nilaiKPI / targetKPI) * 100 * 100) / 100;
  }

  /**
   * Tentukan status KPI berdasarkan persentase pencapaian
   */
  private async tentukanStatusKPI(persentase: number): Promise<string> {
    if (persentase >= 100) return StatusKPI.EXCELLENT;
    if (persentase >= 90) return StatusKPI.GOOD;
    if (persentase >= 75) return StatusKPI.AVERAGE;
    if (persentase >= 60) return StatusKPI.BELOW_AVERAGE;
    if (persentase >= 40) return StatusKPI.POOR;
    return StatusKPI.CRITICAL;
  }

  /**
   * Analisis trend KPI
   */
  private async analisisTrend(idAnalitik: string): Promise<string> {
    // Simulasi analisis trend berdasarkan data historis
    const trendOptions = [TrendDirection.INCREASING, TrendDirection.DECREASING, TrendDirection.STABLE, TrendDirection.VOLATILE];
    return trendOptions[Math.floor(Math.random() * trendOptions.length)];
  }

  /**
   * Cek alert threshold
   */
  private async cekAlertThreshold(dataAnalitik: DataAnalitik[]): Promise<void> {
    for (const data of dataAnalitik) {
      if (data.persentasePencapaian < data.alertThreshold) {
        await this.triggerAlert(data);
      }
    }
  }

  /**
   * Trigger alert untuk KPI yang di bawah threshold
   */
  private async triggerAlert(data: DataAnalitik): Promise<void> {
    console.log(`ALERT: KPI ${data.jenisKPI} di bawah threshold (${data.persentasePencapaian}% < ${data.alertThreshold}%)`);
    
    // Update status alert
    data.isAlertActive = true;
    
    // Kirim notifikasi
    await this.kirimNotifikasiAlert(data);
    
    // Log alert
    await this.logAlert(data);
  }

  /**
   * Validasi parameter KPI
   */
  private validasiParameterKPI(parameter: any): boolean {
    if (!parameter) return false;
    if (!parameter.jenisKPI && !parameter.kategoriPerforma && !parameter.periode) return false;
    return true;
  }

  /**
   * Ambil data detail dari database berdasarkan parameter
   */
  private async ambilDataDetailDariDatabase(parameter: any): Promise<any[]> {
    // Simulasi data detail berdasarkan parameter
    const mockDetailData = [
      {
        tanggal: '2024-01-01',
        nilai: 120,
        target: 150,
        pencapaian: 80,
        catatan: 'Penjualan normal di awal bulan'
      },
      {
        tanggal: '2024-01-15',
        nilai: 125,
        target: 150,
        pencapaian: 83.33,
        catatan: 'Peningkatan di pertengahan bulan'
      },
      {
        tanggal: '2024-01-31',
        nilai: 125,
        target: 150,
        pencapaian: 83.33,
        catatan: 'Stabil di akhir bulan'
      }
    ];
    
    return mockDetailData;
  }

  /**
   * Enrich data dengan analisis tambahan
   */
  private async enrichDataDenganAnalisis(data: any[], parameter: any): Promise<any[]> {
    return data.map(item => ({
      ...item,
      variance: item.nilai - item.target,
      variancePercentage: ((item.nilai - item.target) / item.target) * 100,
      status: item.pencapaian >= 90 ? 'excellent' : item.pencapaian >= 75 ? 'good' : 'needs_improvement',
      benchmark: this.getBenchmarkValue(parameter.jenisKPI)
    }));
  }

  /**
   * Generate insights dari data
   */
  private async generateInsights(data: any[]): Promise<string[]> {
    const insights = [];
    
    // Analisis trend
    const avgPencapaian = data.reduce((sum, item) => sum + item.pencapaian, 0) / data.length;
    if (avgPencapaian > 90) {
      insights.push('Performa KPI sangat baik dengan rata-rata pencapaian di atas 90%');
    } else if (avgPencapaian > 75) {
      insights.push('Performa KPI baik namun masih ada ruang untuk perbaikan');
    } else {
      insights.push('Performa KPI perlu perhatian khusus dan strategi perbaikan');
    }
    
    // Analisis variance
    const avgVariance = data.reduce((sum, item) => sum + item.variance, 0) / data.length;
    if (avgVariance > 0) {
      insights.push('Secara rata-rata, pencapaian melebihi target');
    } else {
      insights.push('Secara rata-rata, pencapaian masih di bawah target');
    }
    
    return insights;
  }

  /**
   * Buat rekomendasi berdasarkan data
   */
  private async buatRekomendasi(data: any[]): Promise<string[]> {
    const rekomendasi = [];
    
    const avgPencapaian = data.reduce((sum, item) => sum + item.pencapaian, 0) / data.length;
    
    if (avgPencapaian < 75) {
      rekomendasi.push('Lakukan review strategi dan alokasi resource');
      rekomendasi.push('Identifikasi bottleneck dalam proses');
      rekomendasi.push('Pertimbangkan training tambahan untuk tim');
    } else if (avgPencapaian < 90) {
      rekomendasi.push('Optimalisasi proses yang sudah berjalan baik');
      rekomendasi.push('Fokus pada area dengan pencapaian terendah');
    } else {
      rekomendasi.push('Pertahankan performa yang sudah excellent');
      rekomendasi.push('Pertimbangkan untuk menaikkan target');
    }
    
    return rekomendasi;
  }

  /**
   * Get benchmark value untuk jenis KPI tertentu
   */
  private getBenchmarkValue(jenisKPI: string): number {
    const benchmarks: { [key: string]: number } = {
      [JenisKPI.PENJUALAN]: 140,
      [JenisKPI.REVENUE]: 7800000000,
      [JenisKPI.CONVERSION_RATE]: 14.0,
      [JenisKPI.CUSTOMER_SATISFACTION]: 4.3
    };
    
    return benchmarks[jenisKPI] || 0;
  }

  /**
   * Kirim notifikasi alert
   */
  private async kirimNotifikasiAlert(data: DataAnalitik): Promise<void> {
    console.log(`Mengirim notifikasi alert untuk KPI: ${data.jenisKPI}`);
  }

  /**
   * Log alert ke sistem
   */
  private async logAlert(data: DataAnalitik): Promise<void> {
    const alertLog = {
      timestamp: new Date(),
      idAnalitik: data.idAnalitik,
      jenisKPI: data.jenisKPI,
      nilaiKPI: data.nilaiKPI,
      targetKPI: data.targetKPI,
      persentasePencapaian: data.persentasePencapaian,
      alertThreshold: data.alertThreshold,
      severity: data.persentasePencapaian < 40 ? 'critical' : 'warning'
    };
    
    console.log('Log alert:', alertLog);
  }

  /**
   * Log aktivitas sistem
   */
  private async logAktivitas(aksi: string, deskripsi: string): Promise<void> {
    const logEntry = {
      timestamp: new Date(),
      aksi: aksi,
      deskripsi: deskripsi,
      idAnalitik: this.idAnalitik
    };
    console.log('Log aktivitas:', logEntry);
  }

  // Getter methods untuk akses data
  public getIdAnalitik(): string { return this.idAnalitik; }
  public getJenisKPI(): string { return this.jenisKPI; }
  public getNilaiKPI(): number { return this.nilaiKPI; }
  public getTargetKPI(): number { return this.targetKPI; }
  public getPersentasePencapaian(): number { return this.persentasePencapaian; }
  public getPeriode(): string { return this.periode; }
  public getTanggalHitung(): Date { return this.tanggalHitung; }
  public getStatusKPI(): string { return this.statusKPI; }
  public getKategoriPerforma(): string { return this.kategoriPerforma; }
  public getDeskripsi(): string { return this.deskripsi; }
  public getTrendDirection(): string { return this.trendDirection; }
  public getAlertThreshold(): number { return this.alertThreshold; }
  public getIsAlertActive(): boolean { return this.isAlertActive; }

  /**
   * Mendapatkan data lengkap analitik dalam format JSON
   */
  public toJSON(): DataAnalitik {
    return {
      idAnalitik: this.idAnalitik,
      jenisKPI: this.jenisKPI,
      nilaiKPI: this.nilaiKPI,
      targetKPI: this.targetKPI,
      persentasePencapaian: this.persentasePencapaian,
      periode: this.periode,
      tanggalHitung: this.tanggalHitung,
      statusKPI: this.statusKPI,
      kategoriPerforma: this.kategoriPerforma,
      deskripsi: this.deskripsi,
      trendDirection: this.trendDirection,
      alertThreshold: this.alertThreshold,
      isAlertActive: this.isAlertActive
    };
  }
}

export default EntitasAnalitik;