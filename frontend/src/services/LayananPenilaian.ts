// ==================== LAYANAN PENILAIAN ====================
// Service untuk mengelola penilaian dan estimasi harga kendaraan
// Sistem Mobilindo Showroom

// ==================== INTERFACES ====================

export interface DataLengkapKendaraan {
  id: string;
  informasiDasar: InformasiDasarKendaraan;
  kondisiFisik: KondisiFisikKendaraan;
  riwayatKendaraan: RiwayatKendaraan;
  dokumenKendaraan: DokumenKendaraan;
  fiturTambahan: FiturTambahan;
  lokasiPenilaian: LokasiPenilaian;
  fotoKendaraan: FotoKendaraan[];
  tanggalPenilaian: Date;
  penilai?: string;
}

export interface InformasiDasarKendaraan {
  merk: string;
  model: string;
  varian: string;
  tahunProduksi: number;
  warna: string;
  jenisTransmisi: 'manual' | 'automatic' | 'cvt';
  jenisBahanBakar: 'bensin' | 'diesel' | 'hybrid' | 'electric';
  kapasitasMesin: number; // dalam cc
  kilometerTempuh: number;
  nomorPolisi: string;
  nomorRangka: string;
  nomorMesin: string;
}

export interface KondisiFisikKendaraan {
  kondisiEksterior: KondisiEksterior;
  kondisiInterior: KondisiInterior;
  kondisiMesin: KondisiMesin;
  kondisiKaki: KondisiKaki;
  kondisiElektrikal: KondisiElektrikal;
  skorKeseluruhan: number; // 1-100
  catatanKhusus: string[];
}

export interface KondisiEksterior {
  cat: 'excellent' | 'good' | 'fair' | 'poor';
  bodywork: 'excellent' | 'good' | 'fair' | 'poor';
  kaca: 'excellent' | 'good' | 'fair' | 'poor';
  lampu: 'excellent' | 'good' | 'fair' | 'poor';
  bemper: 'excellent' | 'good' | 'fair' | 'poor';
  velg: 'excellent' | 'good' | 'fair' | 'poor';
  ban: BanCondition[];
  kerusakan: KerusakanDetail[];
}

export interface KondisiInterior {
  jok: 'excellent' | 'good' | 'fair' | 'poor';
  dashboard: 'excellent' | 'good' | 'fair' | 'poor';
  ac: 'excellent' | 'good' | 'fair' | 'poor';
  audio: 'excellent' | 'good' | 'fair' | 'poor';
  elektronik: 'excellent' | 'good' | 'fair' | 'poor';
  kebersihan: 'excellent' | 'good' | 'fair' | 'poor';
  bau: 'none' | 'mild' | 'strong';
  kerusakan: KerusakanDetail[];
}

export interface KondisiMesin {
  performa: 'excellent' | 'good' | 'fair' | 'poor';
  suara: 'normal' | 'slight_noise' | 'noisy';
  oli: 'clean' | 'dirty' | 'very_dirty';
  radiator: 'excellent' | 'good' | 'fair' | 'poor';
  aki: 'excellent' | 'good' | 'fair' | 'poor';
  serviceRecord: boolean;
  lastService: Date;
  masalah: string[];
}

export interface KondisiKaki {
  suspensi: 'excellent' | 'good' | 'fair' | 'poor';
  rem: 'excellent' | 'good' | 'fair' | 'poor';
  kopling: 'excellent' | 'good' | 'fair' | 'poor';
  transmisi: 'excellent' | 'good' | 'fair' | 'poor';
  kemudi: 'excellent' | 'good' | 'fair' | 'poor';
  masalah: string[];
}

export interface KondisiElektrikal {
  sistemPenerangan: 'excellent' | 'good' | 'fair' | 'poor';
  sistemAudio: 'excellent' | 'good' | 'fair' | 'poor';
  sistemAC: 'excellent' | 'good' | 'fair' | 'poor';
  sistemKeamanan: 'excellent' | 'good' | 'fair' | 'poor';
  masalah: string[];
}

export interface BanCondition {
  posisi: 'front_left' | 'front_right' | 'rear_left' | 'rear_right' | 'spare';
  merk: string;
  kondisi: 'excellent' | 'good' | 'fair' | 'poor';
  tebalTapak: number; // dalam mm
  tahunProduksi: number;
}

export interface KerusakanDetail {
  area: string;
  jenis: 'scratch' | 'dent' | 'crack' | 'rust' | 'missing' | 'broken';
  tingkatKerusakan: 'minor' | 'moderate' | 'major';
  estimasiBiayaPerbaikan: number;
  deskripsi: string;
  foto?: string[];
}

export interface RiwayatKendaraan {
  jumlahPemilik: number;
  riwayatKecelakaan: RiwayatKecelakaan[];
  riwayatBanjir: boolean;
  riwayatTaxi: boolean;
  riwayatRental: boolean;
  riwayatService: RiwayatService[];
  modifikasi: ModifikasiKendaraan[];
  penggantianParts: PenggantianParts[];
}

export interface RiwayatKecelakaan {
  tanggal: Date;
  tingkatKerusakan: 'minor' | 'moderate' | 'major' | 'total_loss';
  areaTerdampak: string[];
  biayaPerbaikan: number;
  asuransi: boolean;
  deskripsi: string;
}

export interface RiwayatService {
  tanggal: Date;
  kilometer: number;
  jenisService: 'rutin' | 'perbaikan' | 'overhaul';
  bengkel: string;
  biaya: number;
  itemService: string[];
  bukti: string[];
}

export interface ModifikasiKendaraan {
  kategori: 'performance' | 'appearance' | 'comfort' | 'safety';
  item: string;
  merk: string;
  biaya: number;
  tanggalPasang: Date;
  dampakHarga: 'positive' | 'negative' | 'neutral';
  nilaiTambah: number;
}

export interface PenggantianParts {
  tanggal: Date;
  namaPart: string;
  jenispart: 'original' | 'aftermarket' | 'rebuilt';
  biaya: number;
  alasan: string;
}

export interface DokumenKendaraan {
  stnk: DokumenDetail;
  bpkb: DokumenDetail;
  fakturPembelian: DokumenDetail;
  sertifikatUjiKir?: DokumenDetail;
  asuransi?: DokumenDetail;
  buktiPajak: DokumenDetail[];
  kelengkapan: number; // persentase kelengkapan dokumen
}

export interface DokumenDetail {
  ada: boolean;
  kondisi: 'excellent' | 'good' | 'fair' | 'poor';
  tanggalBerlaku?: Date;
  catatan?: string;
}

export interface FiturTambahan {
  fiturStandar: string[];
  fiturTambahan: string[];
  aksesori: AksesoriDetail[];
  nilaiTambahFitur: number;
}

export interface AksesoriDetail {
  nama: string;
  kondisi: 'excellent' | 'good' | 'fair' | 'poor';
  nilaiEstimasi: number;
  original: boolean;
}

export interface LokasiPenilaian {
  kota: string;
  provinsi: string;
  alamatLengkap: string;
  koordinat?: {
    latitude: number;
    longitude: number;
  };
}

export interface FotoKendaraan {
  id: string;
  kategori: 'exterior' | 'interior' | 'engine' | 'damage' | 'document';
  url: string;
  deskripsi: string;
  timestamp: Date;
}

export interface HasilEstimasiHarga {
  id: string;
  kendaraanId: string;
  hargaEstimasi: HargaEstimasi;
  analisisHarga: AnalisisHarga;
  faktorPenilaian: FaktorPenilaian;
  rekomendasi: RekomendasiHarga;
  validitas: ValiditasEstimasi;
  tanggalEstimasi: Date;
  penilai: string;
  metodePenilaian: string;
}

export interface HargaEstimasi {
  hargaMinimal: number;
  hargaMaksimal: number;
  hargaRekomendasi: number;
  hargaPasar: number;
  tingkatKepercayaan: number; // 1-100
  margin: {
    bawah: number;
    atas: number;
  };
}

export interface AnalisisHarga {
  hargaBaruSaatIni: number;
  depresiasi: {
    persentase: number;
    nilai: number;
    faktor: string[];
  };
  kondisiPenyesuaian: {
    bonus: PenyesuaianHarga[];
    penalti: PenyesuaianHarga[];
    netAdjustment: number;
  };
  perbandinganPasar: PerbandinganPasar[];
  trendHarga: TrendHarga;
}

export interface PenyesuaianHarga {
  faktor: string;
  nilai: number;
  persentase: number;
  alasan: string;
}

export interface PerbandinganPasar {
  sumber: string;
  harga: number;
  kondisi: string;
  lokasi: string;
  tanggal: Date;
  relevansi: number; // 1-100
}

export interface TrendHarga {
  trend6Bulan: 'naik' | 'turun' | 'stabil';
  perubahanPersentase: number;
  proyeksi3Bulan: number;
  faktorTrend: string[];
}

export interface FaktorPenilaian {
  usia: { skor: number; bobot: number };
  kilometer: { skor: number; bobot: number };
  kondisi: { skor: number; bobot: number };
  riwayat: { skor: number; bobot: number };
  dokumen: { skor: number; bobot: number };
  pasar: { skor: number; bobot: number };
  lokasi: { skor: number; bobot: number };
  skorTotal: number;
}

export interface RekomendasiHarga {
  hargaJual: {
    cepat: number;
    normal: number;
    premium: number;
  };
  strategiPenjualan: string[];
  perbaikanDisarankan: PerbaikanSaran[];
  waktuTerbaikJual: string;
  targetPembeli: string[];
}

export interface PerbaikanSaran {
  item: string;
  biaya: number;
  dampakHarga: number;
  prioritas: 'high' | 'medium' | 'low';
  roi: number; // return on investment
}

export interface ValiditasEstimasi {
  akurasi: number; // 1-100
  faktorKetidakpastian: string[];
  rekomendasiVerifikasi: string[];
  masaBerlaku: Date;
}

export interface PenilaianServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
  timestamp: Date;
}

// ==================== MAIN SERVICE CLASS ====================

export class LayananPenilaian {
  private static instance: LayananPenilaian;
  private cache: Map<string, any> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 menit

  private constructor() {}

  public static getInstance(): LayananPenilaian {
    if (!LayananPenilaian.instance) {
      LayananPenilaian.instance = new LayananPenilaian();
    }
    return LayananPenilaian.instance;
  }

  // ==================== METODE UTAMA ====================

  /**
   * Proses estimasi harga otomatis berdasarkan data lengkap kendaraan
   * @param dataLengkap - Data lengkap kendaraan yang akan dinilai
   * @returns Promise<PenilaianServiceResponse<HasilEstimasiHarga>>
   */
  public async prosesEstimasiHargaOtomatis(dataLengkap: DataLengkapKendaraan): Promise<PenilaianServiceResponse<HasilEstimasiHarga>> {
    try {
      // Validasi data input
      const validationResult = this.validateInputData(dataLengkap);
      if (!validationResult.valid) {
        return {
          success: false,
          message: 'Data kendaraan tidak lengkap atau tidak valid',
          errors: validationResult.errors,
          timestamp: new Date()
        };
      }

      // Check cache first
      const cacheKey = `estimation_${dataLengkap.id}_${dataLengkap.tanggalPenilaian.getTime()}`;
      const cachedResult = this.getCache(cacheKey);
      if (cachedResult) {
        return {
          success: true,
          data: cachedResult,
          message: 'Estimasi harga berhasil diambil dari cache',
          timestamp: new Date()
        };
      }

      // Proses estimasi harga
      const hasilEstimasi = await this.hitungHargaEstimasi(dataLengkap);
      
      if (!hasilEstimasi.success || !hasilEstimasi.data) {
        return {
          success: false,
          message: 'Gagal menghitung estimasi harga',
          errors: hasilEstimasi.errors,
          timestamp: new Date()
        };
      }

      // Generate analisis tambahan
      const analisisLengkap = await this.generateAnalisisLengkap(dataLengkap, hasilEstimasi.data);
      
      // Generate rekomendasi
      const rekomendasi = this.generateRekomendasi(dataLengkap, hasilEstimasi.data);
      
      // Validasi hasil estimasi
      const validitasEstimasi = this.validateEstimationResult(dataLengkap, hasilEstimasi.data);

      const hasilFinal: HasilEstimasiHarga = {
        id: this.generateId(),
        kendaraanId: dataLengkap.id,
        hargaEstimasi: hasilEstimasi.data,
        analisisHarga: analisisLengkap,
        faktorPenilaian: this.calculateFaktorPenilaian(dataLengkap),
        rekomendasi,
        validitas: validitasEstimasi,
        tanggalEstimasi: new Date(),
        penilai: 'Sistem Otomatis',
        metodePenilaian: 'AI-Powered Valuation'
      };

      // Cache the result
      this.setCache(cacheKey, hasilFinal);

      // Log untuk audit
      await this.logEstimationProcess(dataLengkap, hasilFinal);

      return {
        success: true,
        data: hasilFinal,
        message: 'Estimasi harga otomatis berhasil diproses',
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error in automatic price estimation:', error);
      return {
        success: false,
        message: 'Gagal memproses estimasi harga otomatis',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  /**
   * Hitung harga estimasi berdasarkan data lengkap kendaraan
   * @param dataLengkap - Data lengkap kendaraan
   * @returns Promise<PenilaianServiceResponse<HargaEstimasi>>
   */
  public async hitungHargaEstimasi(dataLengkap: DataLengkapKendaraan): Promise<PenilaianServiceResponse<HargaEstimasi>> {
    try {
      // Ambil harga baru kendaraan saat ini
      const hargaBaru = await this.getHargaBaruKendaraan(dataLengkap.informasiDasar);
      
      if (!hargaBaru) {
        return {
          success: false,
          message: 'Tidak dapat menemukan harga referensi kendaraan',
          errors: ['Harga referensi tidak tersedia'],
          timestamp: new Date()
        };
      }

      // Hitung depresiasi berdasarkan usia
      const depresiasiUsia = this.hitungDepresiasiUsia(dataLengkap.informasiDasar.tahunProduksi);
      
      // Hitung depresiasi berdasarkan kilometer
      const depresiasiKilometer = this.hitungDepresiasiKilometer(dataLengkap.informasiDasar.kilometerTempuh);
      
      // Hitung penyesuaian kondisi
      const penyesuaianKondisi = this.hitungPenyesuaianKondisi(dataLengkap.kondisiFisik);
      
      // Hitung penyesuaian riwayat
      const penyesuaianRiwayat = this.hitungPenyesuaianRiwayat(dataLengkap.riwayatKendaraan);
      
      // Hitung penyesuaian dokumen
      const penyesuaianDokumen = this.hitungPenyesuaianDokumen(dataLengkap.dokumenKendaraan);
      
      // Hitung nilai tambah fitur
      const nilaiTambahFitur = this.hitungNilaiTambahFitur(dataLengkap.fiturTambahan);
      
      // Hitung penyesuaian lokasi
      const penyesuaianLokasi = await this.hitungPenyesuaianLokasi(dataLengkap.lokasiPenilaian);

      // Kalkulasi harga dasar setelah depresiasi
      let hargaDasar = hargaBaru * (1 - depresiasiUsia) * (1 - depresiasiKilometer);
      
      // Aplikasikan semua penyesuaian
      const totalPenyesuaian = penyesuaianKondisi + penyesuaianRiwayat + 
                              penyesuaianDokumen + nilaiTambahFitur + penyesuaianLokasi;
      
      const hargaSetelahPenyesuaian = hargaDasar * (1 + totalPenyesuaian);
      
      // Ambil data pasar untuk perbandingan
      const dataPasar = await this.getDataPasarKendaraan(dataLengkap.informasiDasar);
      
      // Hitung margin kepercayaan
      const tingkatKepercayaan = this.hitungTingkatKepercayaan(dataLengkap);
      
      // Tentukan range harga
      const marginError = 0.15; // 15% margin error
      const hargaMinimal = Math.round(hargaSetelahPenyesuaian * (1 - marginError));
      const hargaMaksimal = Math.round(hargaSetelahPenyesuaian * (1 + marginError));
      const hargaRekomendasi = Math.round(hargaSetelahPenyesuaian);
      
      // Harga pasar rata-rata
      const hargaPasar = dataPasar.length > 0 
        ? Math.round(dataPasar.reduce((sum, item) => sum + item.harga, 0) / dataPasar.length)
        : hargaRekomendasi;

      const hargaEstimasi: HargaEstimasi = {
        hargaMinimal,
        hargaMaksimal,
        hargaRekomendasi,
        hargaPasar,
        tingkatKepercayaan,
        margin: {
          bawah: hargaRekomendasi - hargaMinimal,
          atas: hargaMaksimal - hargaRekomendasi
        }
      };

      return {
        success: true,
        data: hargaEstimasi,
        message: 'Harga estimasi berhasil dihitung',
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error calculating price estimation:', error);
      return {
        success: false,
        message: 'Gagal menghitung estimasi harga',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  // ==================== METODE PEMBANTU ====================

  private generateId(): string {
    return 'penilaian_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private validateInputData(data: DataLengkapKendaraan): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validasi informasi dasar
    if (!data.informasiDasar.merk) errors.push('Merk kendaraan harus diisi');
    if (!data.informasiDasar.model) errors.push('Model kendaraan harus diisi');
    if (!data.informasiDasar.tahunProduksi || data.informasiDasar.tahunProduksi < 1990) {
      errors.push('Tahun produksi tidak valid');
    }
    if (!data.informasiDasar.kilometerTempuh || data.informasiDasar.kilometerTempuh < 0) {
      errors.push('Kilometer tempuh tidak valid');
    }

    // Validasi kondisi fisik
    if (!data.kondisiFisik.skorKeseluruhan || data.kondisiFisik.skorKeseluruhan < 1 || data.kondisiFisik.skorKeseluruhan > 100) {
      errors.push('Skor kondisi keseluruhan harus antara 1-100');
    }

    // Validasi foto minimal
    if (!data.fotoKendaraan || data.fotoKendaraan.length < 5) {
      errors.push('Minimal 5 foto kendaraan diperlukan untuk penilaian akurat');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private async getHargaBaruKendaraan(info: InformasiDasarKendaraan): Promise<number | null> {
    try {
      // Mock data harga baru berdasarkan merk dan model
      const hargaDatabase: { [key: string]: number } = {
        'Toyota Avanza': 230000000,
        'Toyota Innova': 350000000,
        'Honda Civic': 550000000,
        'Honda CR-V': 650000000,
        'Mitsubishi Pajero': 750000000,
        'Suzuki Ertiga': 250000000,
        'Daihatsu Xenia': 220000000
      };

      const key = `${info.merk} ${info.model}`;
      const hargaDasar = hargaDatabase[key] || 300000000; // Default price

      // Penyesuaian berdasarkan varian dan tahun
      let multiplier = 1;
      if (info.varian.toLowerCase().includes('premium')) multiplier = 1.2;
      else if (info.varian.toLowerCase().includes('deluxe')) multiplier = 1.1;
      
      // Penyesuaian berdasarkan transmisi
      if (info.jenisTransmisi === 'automatic') multiplier *= 1.1;
      
      return Math.round(hargaDasar * multiplier);
    } catch (error) {
      console.error('Error getting new car price:', error);
      return null;
    }
  }

  private hitungDepresiasiUsia(tahunProduksi: number): number {
    const tahunSekarang = new Date().getFullYear();
    const usia = tahunSekarang - tahunProduksi;
    
    // Depresiasi progresif: tahun pertama 20%, kemudian 10% per tahun
    if (usia <= 0) return 0;
    if (usia === 1) return 0.20;
    
    return Math.min(0.20 + (usia - 1) * 0.10, 0.80); // Maksimal 80% depresiasi
  }

  private hitungDepresiasiKilometer(kilometer: number): number {
    // Depresiasi berdasarkan kilometer: 0.5% per 10,000 km
    const depresiasiPerKm = 0.005 / 10000;
    return Math.min(kilometer * depresiasiPerKm, 0.30); // Maksimal 30% depresiasi
  }

  private hitungPenyesuaianKondisi(kondisi: KondisiFisikKendaraan): number {
    const skorKondisi = kondisi.skorKeseluruhan;
    
    // Konversi skor kondisi ke penyesuaian harga
    if (skorKondisi >= 90) return 0.10;  // Bonus 10% untuk kondisi excellent
    if (skorKondisi >= 80) return 0.05;  // Bonus 5% untuk kondisi very good
    if (skorKondisi >= 70) return 0;     // Tidak ada penyesuaian untuk kondisi good
    if (skorKondisi >= 60) return -0.10; // Penalti 10% untuk kondisi fair
    return -0.25; // Penalti 25% untuk kondisi poor
  }

  private hitungPenyesuaianRiwayat(riwayat: RiwayatKendaraan): number {
    let penyesuaian = 0;
    
    // Penalti untuk jumlah pemilik
    if (riwayat.jumlahPemilik > 3) penyesuaian -= 0.10;
    else if (riwayat.jumlahPemilik > 1) penyesuaian -= 0.05;
    
    // Penalti untuk riwayat kecelakaan
    riwayat.riwayatKecelakaan.forEach(kecelakaan => {
      switch (kecelakaan.tingkatKerusakan) {
        case 'major': penyesuaian -= 0.20; break;
        case 'moderate': penyesuaian -= 0.10; break;
        case 'minor': penyesuaian -= 0.05; break;
      }
    });
    
    // Penalti untuk riwayat banjir, taxi, rental
    if (riwayat.riwayatBanjir) penyesuaian -= 0.30;
    if (riwayat.riwayatTaxi) penyesuaian -= 0.25;
    if (riwayat.riwayatRental) penyesuaian -= 0.15;
    
    // Bonus untuk riwayat service yang baik
    if (riwayat.riwayatService.length > 5) penyesuaian += 0.05;
    
    return Math.max(penyesuaian, -0.50); // Maksimal penalti 50%
  }

  private hitungPenyesuaianDokumen(dokumen: DokumenKendaraan): number {
    const kelengkapan = dokumen.kelengkapan / 100;
    
    // Penyesuaian berdasarkan kelengkapan dokumen
    if (kelengkapan >= 0.95) return 0.05;  // Bonus 5% untuk dokumen lengkap
    if (kelengkapan >= 0.80) return 0;     // Tidak ada penyesuaian
    if (kelengkapan >= 0.60) return -0.10; // Penalti 10%
    return -0.20; // Penalti 20% untuk dokumen tidak lengkap
  }

  private hitungNilaiTambahFitur(fitur: FiturTambahan): number {
    return fitur.nilaiTambahFitur / 1000000; // Konversi ke persentase
  }

  private async hitungPenyesuaianLokasi(lokasi: LokasiPenilaian): Promise<number> {
    // Mock data penyesuaian berdasarkan lokasi
    const penyesuaianLokasi: { [key: string]: number } = {
      'Jakarta': 0.10,
      'Surabaya': 0.05,
      'Bandung': 0.03,
      'Medan': 0.02,
      'Makassar': 0.01
    };
    
    return penyesuaianLokasi[lokasi.kota] || 0;
  }

  private async getDataPasarKendaraan(info: InformasiDasarKendaraan): Promise<PerbandinganPasar[]> {
    // Mock data pasar
    return [
      {
        sumber: 'OLX',
        harga: 180000000,
        kondisi: 'Good',
        lokasi: 'Jakarta',
        tanggal: new Date(),
        relevansi: 85
      },
      {
        sumber: 'Carmudi',
        harga: 175000000,
        kondisi: 'Fair',
        lokasi: 'Bandung',
        tanggal: new Date(),
        relevansi: 80
      }
    ];
  }

  private hitungTingkatKepercayaan(data: DataLengkapKendaraan): number {
    let kepercayaan = 100;
    
    // Kurangi kepercayaan berdasarkan faktor ketidakpastian
    if (data.fotoKendaraan.length < 10) kepercayaan -= 10;
    if (data.dokumenKendaraan.kelengkapan < 80) kepercayaan -= 15;
    if (data.riwayatKendaraan.riwayatService.length < 3) kepercayaan -= 10;
    if (data.kondisiFisik.skorKeseluruhan < 70) kepercayaan -= 20;
    
    return Math.max(kepercayaan, 50); // Minimal 50% kepercayaan
  }

  private async generateAnalisisLengkap(data: DataLengkapKendaraan, harga: HargaEstimasi): Promise<AnalisisHarga> {
    const hargaBaru = await this.getHargaBaruKendaraan(data.informasiDasar) || 300000000;
    const depresiasiTotal = (hargaBaru - harga.hargaRekomendasi) / hargaBaru;
    
    return {
      hargaBaruSaatIni: hargaBaru,
      depresiasi: {
        persentase: depresiasiTotal * 100,
        nilai: hargaBaru - harga.hargaRekomendasi,
        faktor: ['Usia kendaraan', 'Kilometer tempuh', 'Kondisi fisik']
      },
      kondisiPenyesuaian: {
        bonus: [],
        penalti: [],
        netAdjustment: 0
      },
      perbandinganPasar: await this.getDataPasarKendaraan(data.informasiDasar),
      trendHarga: {
        trend6Bulan: 'stabil',
        perubahanPersentase: 2.5,
        proyeksi3Bulan: harga.hargaRekomendasi * 1.025,
        faktorTrend: ['Stabilitas ekonomi', 'Permintaan pasar']
      }
    };
  }

  private calculateFaktorPenilaian(data: DataLengkapKendaraan): FaktorPenilaian {
    const tahunSekarang = new Date().getFullYear();
    const usia = tahunSekarang - data.informasiDasar.tahunProduksi;
    
    return {
      usia: { skor: Math.max(100 - usia * 10, 0), bobot: 0.25 },
      kilometer: { skor: Math.max(100 - data.informasiDasar.kilometerTempuh / 2000, 0), bobot: 0.20 },
      kondisi: { skor: data.kondisiFisik.skorKeseluruhan, bobot: 0.25 },
      riwayat: { skor: this.calculateRiwayatScore(data.riwayatKendaraan), bobot: 0.15 },
      dokumen: { skor: data.dokumenKendaraan.kelengkapan, bobot: 0.10 },
      pasar: { skor: 75, bobot: 0.03 },
      lokasi: { skor: 80, bobot: 0.02 },
      skorTotal: 0 // Will be calculated
    };
  }

  private calculateRiwayatScore(riwayat: RiwayatKendaraan): number {
    let score = 100;
    
    // Penalti untuk riwayat negatif
    score -= riwayat.jumlahPemilik * 10;
    score -= riwayat.riwayatKecelakaan.length * 20;
    if (riwayat.riwayatBanjir) score -= 40;
    if (riwayat.riwayatTaxi) score -= 30;
    if (riwayat.riwayatRental) score -= 20;
    
    // Bonus untuk riwayat service
    score += Math.min(riwayat.riwayatService.length * 5, 25);
    
    return Math.max(score, 0);
  }

  private generateRekomendasi(data: DataLengkapKendaraan, harga: HargaEstimasi): RekomendasiHarga {
    return {
      hargaJual: {
        cepat: Math.round(harga.hargaMinimal * 0.95),
        normal: harga.hargaRekomendasi,
        premium: Math.round(harga.hargaMaksimal * 1.05)
      },
      strategiPenjualan: [
        'Tampilkan foto berkualitas tinggi',
        'Sertakan riwayat service lengkap',
        'Tawarkan test drive',
        'Berikan garansi singkat'
      ],
      perbaikanDisarankan: this.generatePerbaikanSaran(data),
      waktuTerbaikJual: 'Akhir tahun atau awal tahun',
      targetPembeli: ['Keluarga muda', 'Profesional', 'Pengguna harian']
    };
  }

  private generatePerbaikanSaran(data: DataLengkapKendaraan): PerbaikanSaran[] {
    const saran: PerbaikanSaran[] = [];
    
    // Analisis kondisi dan berikan saran perbaikan
    if (data.kondisiFisik.kondisiEksterior.cat !== 'excellent') {
      saran.push({
        item: 'Poles dan wax body',
        biaya: 500000,
        dampakHarga: 2000000,
        prioritas: 'high',
        roi: 4.0
      });
    }
    
    if (data.kondisiFisik.kondisiInterior.jok !== 'excellent') {
      saran.push({
        item: 'Cuci dan treatment jok',
        biaya: 300000,
        dampakHarga: 1500000,
        prioritas: 'medium',
        roi: 5.0
      });
    }
    
    return saran;
  }

  private validateEstimationResult(data: DataLengkapKendaraan, harga: HargaEstimasi): ValiditasEstimasi {
    const faktorKetidakpastian: string[] = [];
    
    if (data.fotoKendaraan.length < 8) {
      faktorKetidakpastian.push('Foto kendaraan kurang lengkap');
    }
    
    if (data.dokumenKendaraan.kelengkapan < 90) {
      faktorKetidakpastian.push('Dokumen tidak lengkap');
    }
    
    const akurasi = Math.max(100 - faktorKetidakpastian.length * 10, 70);
    
    return {
      akurasi,
      faktorKetidakpastian,
      rekomendasiVerifikasi: [
        'Verifikasi fisik langsung',
        'Cek dokumen asli',
        'Test drive menyeluruh'
      ],
      masaBerlaku: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 hari
    };
  }

  private async logEstimationProcess(data: DataLengkapKendaraan, hasil: HasilEstimasiHarga): Promise<void> {
    // Log untuk audit dan improvement
    console.log('Estimation completed:', {
      kendaraanId: data.id,
      estimasiId: hasil.id,
      hargaRekomendasi: hasil.hargaEstimasi.hargaRekomendasi,
      tingkatKepercayaan: hasil.hargaEstimasi.tingkatKepercayaan,
      timestamp: new Date()
    });
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private getCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }
}

// ==================== EXPORT SINGLETON ====================
export const layananPenilaian = LayananPenilaian.getInstance();

// Default export for compatibility
export default LayananPenilaian;