// ==================== LAYANAN KREDIT ====================
// Service untuk mengelola simulasi kredit dan parameter kredit
// Sistem Mobilindo Showroom

// ==================== INTERFACES ====================

export interface ParameterKredit {
  id: string;
  hargaMobil: number;
  downPayment: number;
  tenor: number; // dalam bulan
  sukuBunga: number; // dalam persen per tahun
  asuransi: boolean;
  biayaAdmin: number;
  biayaProvisi: number;
  jenisKredit: 'konvensional' | 'syariah';
  bank: string;
  program: string;
  tanggalSimulasi: Date;
  userId?: string;
}

export interface HasilSimulasi {
  id: string;
  parameterId: string;
  cicilanPerBulan: number;
  totalBayar: number;
  totalBunga: number;
  biayaTambahan: BiayaTambahan;
  jadwalPembayaran: JadwalPembayaran[];
  ringkasan: RingkasanKredit;
  perbandingan: PerbandinganKredit[];
  rekomendasi: RekomendasiKredit[];
  tanggalDibuat: Date;
  linkSharing?: string;
}

export interface BiayaTambahan {
  asuransi: number;
  administrasi: number;
  provisi: number;
  materai: number;
  fidusia: number;
  notaris: number;
  total: number;
}

export interface JadwalPembayaran {
  bulan: number;
  tanggalJatuhTempo: Date;
  cicilanPokok: number;
  cicilanBunga: number;
  totalCicilan: number;
  sisaPokok: number;
  keterangan?: string;
}

export interface RingkasanKredit {
  hargaMobil: number;
  downPayment: number;
  jumlahPinjaman: number;
  tenor: number;
  sukuBunga: number;
  cicilanPerBulan: number;
  totalBayar: number;
  totalBunga: number;
  persentaseBunga: number;
  efektifitasKredit: number; // 1-100
}

export interface PerbandinganKredit {
  bank: string;
  program: string;
  sukuBunga: number;
  cicilanPerBulan: number;
  totalBayar: number;
  keunggulan: string[];
  syarat: string[];
  rating: number;
}

export interface RekomendasiKredit {
  tipe: 'tenor' | 'dp' | 'bank' | 'program';
  judul: string;
  deskripsi: string;
  dampak: string;
  penghematan?: number;
  action: string;
}

export interface ValidasiParameter {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

export interface KreditServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
  timestamp: Date;
}

// ==================== MAIN SERVICE CLASS ====================

export class LayananKredit {
  private static instance: LayananKredit;
  private cache: Map<string, any> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 menit

  private constructor() {}

  public static getInstance(): LayananKredit {
    if (!LayananKredit.instance) {
      LayananKredit.instance = new LayananKredit();
    }
    return LayananKredit.instance;
  }

  // ==================== METODE UTAMA ====================

  /**
   * Inisialisasi parameter kredit dengan nilai default
   * @returns Promise<KreditServiceResponse<ParameterKredit>>
   */
  public async inisialisasiParameterKredit(): Promise<KreditServiceResponse<ParameterKredit>> {
    try {
      const defaultParameter: ParameterKredit = {
        id: this.generateId(),
        hargaMobil: 0,
        downPayment: 0,
        tenor: 12,
        sukuBunga: 8.5,
        asuransi: true,
        biayaAdmin: 500000,
        biayaProvisi: 0,
        jenisKredit: 'konvensional',
        bank: '',
        program: '',
        tanggalSimulasi: new Date()
      };

      // Ambil data bank dan program yang tersedia
      const bankData = await this.getBankData();
      const programData = await this.getProgramKredit();

      return {
        success: true,
        data: {
          ...defaultParameter,
          bank: bankData[0]?.nama || '',
          program: programData[0]?.nama || ''
        },
        message: 'Parameter kredit berhasil diinisialisasi',
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error initializing credit parameters:', error);
      return {
        success: false,
        message: 'Gagal menginisialisasi parameter kredit',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  /**
   * Validasi input parameter kredit
   * @param parameterKredit - Parameter kredit yang akan divalidasi
   * @returns Promise<KreditServiceResponse<ValidasiParameter>>
   */
  public async validasiInputParameter(parameterKredit: ParameterKredit): Promise<KreditServiceResponse<ValidasiParameter>> {
    try {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];
      const suggestions: string[] = [];

      // Validasi harga mobil
      if (!parameterKredit.hargaMobil || parameterKredit.hargaMobil <= 0) {
        errors.push({
          field: 'hargaMobil',
          message: 'Harga mobil harus diisi dan lebih dari 0',
          code: 'INVALID_PRICE',
          severity: 'error'
        });
      } else if (parameterKredit.hargaMobil < 50000000) {
        warnings.push({
          field: 'hargaMobil',
          message: 'Harga mobil terlalu rendah',
          suggestion: 'Pastikan harga mobil sudah benar'
        });
      }

      // Validasi down payment
      if (parameterKredit.downPayment < 0) {
        errors.push({
          field: 'downPayment',
          message: 'Down payment tidak boleh negatif',
          code: 'INVALID_DP',
          severity: 'error'
        });
      } else if (parameterKredit.downPayment > parameterKredit.hargaMobil) {
        errors.push({
          field: 'downPayment',
          message: 'Down payment tidak boleh lebih dari harga mobil',
          code: 'DP_TOO_HIGH',
          severity: 'error'
        });
      } else {
        const dpPercentage = (parameterKredit.downPayment / parameterKredit.hargaMobil) * 100;
        if (dpPercentage < 20) {
          warnings.push({
            field: 'downPayment',
            message: 'Down payment kurang dari 20%',
            suggestion: 'Disarankan DP minimal 20% untuk mendapat bunga yang lebih baik'
          });
        }
      }

      // Validasi tenor
      if (!parameterKredit.tenor || parameterKredit.tenor <= 0) {
        errors.push({
          field: 'tenor',
          message: 'Tenor harus diisi dan lebih dari 0',
          code: 'INVALID_TENOR',
          severity: 'error'
        });
      } else if (parameterKredit.tenor > 84) {
        warnings.push({
          field: 'tenor',
          message: 'Tenor lebih dari 7 tahun',
          suggestion: 'Tenor yang panjang akan meningkatkan total bunga'
        });
      }

      // Validasi suku bunga
      if (!parameterKredit.sukuBunga || parameterKredit.sukuBunga <= 0) {
        errors.push({
          field: 'sukuBunga',
          message: 'Suku bunga harus diisi dan lebih dari 0',
          code: 'INVALID_INTEREST',
          severity: 'error'
        });
      } else if (parameterKredit.sukuBunga > 20) {
        warnings.push({
          field: 'sukuBunga',
          message: 'Suku bunga terlalu tinggi',
          suggestion: 'Coba bandingkan dengan bank lain'
        });
      }

      // Validasi bank dan program
      if (!parameterKredit.bank) {
        errors.push({
          field: 'bank',
          message: 'Bank harus dipilih',
          code: 'BANK_REQUIRED',
          severity: 'error'
        });
      }

      // Generate suggestions
      if (errors.length === 0) {
        suggestions.push('Parameter kredit valid dan siap untuk simulasi');
        
        const dpPercentage = (parameterKredit.downPayment / parameterKredit.hargaMobil) * 100;
        if (dpPercentage >= 30) {
          suggestions.push('DP Anda cukup besar, Anda mungkin bisa mendapat suku bunga yang lebih baik');
        }
        
        if (parameterKredit.tenor <= 36) {
          suggestions.push('Tenor yang dipilih cukup singkat, total bunga akan lebih rendah');
        }
      }

      const validationResult: ValidasiParameter = {
        valid: errors.length === 0,
        errors,
        warnings,
        suggestions
      };

      return {
        success: true,
        data: validationResult,
        message: errors.length === 0 ? 'Validasi berhasil' : 'Ditemukan error dalam parameter',
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error validating parameters:', error);
      return {
        success: false,
        message: 'Gagal memvalidasi parameter kredit',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  /**
   * Hitung cicilan dan total bayar berdasarkan parameter kredit
   * @param parameterKredit - Parameter kredit
   * @returns Promise<KreditServiceResponse<HasilSimulasi>>
   */
  public async hitungCicilanDanTotalBayar(parameterKredit: ParameterKredit): Promise<KreditServiceResponse<HasilSimulasi>> {
    try {
      // Validasi parameter terlebih dahulu
      const validationResult = await this.validasiInputParameter(parameterKredit);
      if (!validationResult.success || !validationResult.data?.valid) {
        return {
          success: false,
          message: 'Parameter tidak valid',
          errors: validationResult.data?.errors.map(e => e.message) || ['Parameter tidak valid'],
          timestamp: new Date()
        };
      }

      const jumlahPinjaman = parameterKredit.hargaMobil - parameterKredit.downPayment;
      
      // Hitung EMI (Equated Monthly Installment)
      const emiResult = await this.hitungEMI(
        parameterKredit.hargaMobil,
        parameterKredit.downPayment,
        parameterKredit.tenor,
        parameterKredit.sukuBunga
      );

      if (!emiResult.success || !emiResult.data) {
        return {
          success: false,
          message: 'Gagal menghitung EMI',
          errors: emiResult.errors,
          timestamp: new Date()
        };
      }

      // Hitung biaya tambahan
      const biayaTambahan = this.hitungBiayaTambahan(parameterKredit, jumlahPinjaman);
      
      // Generate jadwal pembayaran
      const jadwalPembayaran = this.generateJadwalPembayaran(
        jumlahPinjaman,
        parameterKredit.tenor,
        parameterKredit.sukuBunga,
        emiResult.data.cicilanPerBulan
      );

      const totalBayar = (emiResult.data.cicilanPerBulan * parameterKredit.tenor) + biayaTambahan.total;
      const totalBunga = totalBayar - jumlahPinjaman - biayaTambahan.total;

      // Generate ringkasan
      const ringkasan: RingkasanKredit = {
        hargaMobil: parameterKredit.hargaMobil,
        downPayment: parameterKredit.downPayment,
        jumlahPinjaman,
        tenor: parameterKredit.tenor,
        sukuBunga: parameterKredit.sukuBunga,
        cicilanPerBulan: emiResult.data.cicilanPerBulan,
        totalBayar,
        totalBunga,
        persentaseBunga: (totalBunga / jumlahPinjaman) * 100,
        efektifitasKredit: this.hitungEfektifitasKredit(parameterKredit, totalBunga, jumlahPinjaman)
      };

      // Generate perbandingan dan rekomendasi
      const perbandingan = await this.generatePerbandinganKredit(parameterKredit);
      const rekomendasi = this.generateRekomendasiKredit(parameterKredit, ringkasan);

      const hasilSimulasi: HasilSimulasi = {
        id: this.generateId(),
        parameterId: parameterKredit.id,
        cicilanPerBulan: emiResult.data.cicilanPerBulan,
        totalBayar,
        totalBunga,
        biayaTambahan,
        jadwalPembayaran,
        ringkasan,
        perbandingan,
        rekomendasi,
        tanggalDibuat: new Date()
      };

      return {
        success: true,
        data: hasilSimulasi,
        message: 'Simulasi kredit berhasil dihitung',
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error calculating credit simulation:', error);
      return {
        success: false,
        message: 'Gagal menghitung simulasi kredit',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  /**
   * Hitung EMI (Equated Monthly Installment)
   * @param harga - Harga mobil
   * @param dp - Down payment
   * @param tenor - Tenor dalam bulan
   * @param bunga - Suku bunga per tahun
   * @returns Promise<KreditServiceResponse<{cicilanPerBulan: number}>>
   */
  public async hitungEMI(harga: number, dp: number, tenor: number, bunga: number): Promise<KreditServiceResponse<{cicilanPerBulan: number}>> {
    try {
      if (harga <= 0 || dp < 0 || tenor <= 0 || bunga <= 0) {
        return {
          success: false,
          message: 'Parameter EMI tidak valid',
          errors: ['Semua parameter harus bernilai positif'],
          timestamp: new Date()
        };
      }

      const principal = harga - dp; // Jumlah pinjaman
      const monthlyRate = bunga / 100 / 12; // Suku bunga bulanan
      
      // Rumus EMI: P * r * (1 + r)^n / ((1 + r)^n - 1)
      // P = Principal, r = monthly rate, n = number of months
      
      let emi: number;
      
      if (monthlyRate === 0) {
        // Jika bunga 0%, cicilan = principal / tenor
        emi = principal / tenor;
      } else {
        const factor = Math.pow(1 + monthlyRate, tenor);
        emi = principal * monthlyRate * factor / (factor - 1);
      }

      // Pembulatan ke atas ke ribuan terdekat
      const cicilanPerBulan = Math.ceil(emi / 1000) * 1000;

      return {
        success: true,
        data: { cicilanPerBulan },
        message: 'EMI berhasil dihitung',
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error calculating EMI:', error);
      return {
        success: false,
        message: 'Gagal menghitung EMI',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  /**
   * Proses simpan dan share hasil simulasi
   * @param hasilSimulasi - Hasil simulasi yang akan disimpan
   * @returns Promise<KreditServiceResponse<{linkSharing: string; summary: any; expiresAt: Date}>>
   */
  public async prosesSimpanShare(hasilSimulasi: HasilSimulasi): Promise<KreditServiceResponse<{linkSharing: string; summary: any; expiresAt: Date}>> {
    try {
      // Generate link sharing
      const linkSharing = this.generateSharingLink(hasilSimulasi.id);
      
      // Simpan ke cache/storage
      const simulasiData = {
        ...hasilSimulasi,
        linkSharing,
        tanggalShare: new Date()
      };

      // Simulasi penyimpanan ke database
      await this.saveSimulationToDatabase(simulasiData);
      
      // Simpan ke cache untuk akses cepat
      this.setCache(`simulation_${hasilSimulasi.id}`, simulasiData);
      this.setCache(`sharing_${linkSharing}`, simulasiData);

      // Generate summary untuk sharing
      const sharingSummary = this.generateSharingSummary(hasilSimulasi);
      
      return {
        success: true,
        data: { 
          linkSharing,
          summary: sharingSummary,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 hari
        },
        message: 'Hasil simulasi berhasil disimpan dan link sharing dibuat',
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error saving and sharing simulation:', error);
      return {
        success: false,
        message: 'Gagal menyimpan dan membuat link sharing',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  // ==================== METODE PEMBANTU ====================

  private generateId(): string {
    return 'kredit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private async getBankData() {
    // Mock data bank
    return [
      { nama: 'BCA Finance', sukuBunga: 8.5, minTenor: 12, maxTenor: 84 },
      { nama: 'Mandiri Tunas Finance', sukuBunga: 8.8, minTenor: 12, maxTenor: 72 },
      { nama: 'BNI Finance', sukuBunga: 9.0, minTenor: 12, maxTenor: 60 },
      { nama: 'CIMB Niaga Auto Finance', sukuBunga: 8.7, minTenor: 12, maxTenor: 84 }
    ];
  }

  private async getProgramKredit() {
    // Mock data program kredit
    return [
      { nama: 'Regular', deskripsi: 'Program kredit reguler' },
      { nama: 'Promo Spesial', deskripsi: 'Program dengan bunga khusus' },
      { nama: 'Cashback', deskripsi: 'Program dengan cashback' }
    ];
  }

  private hitungBiayaTambahan(parameter: ParameterKredit, jumlahPinjaman: number): BiayaTambahan {
    const asuransi = parameter.asuransi ? jumlahPinjaman * 0.02 : 0; // 2% dari pinjaman
    const administrasi = parameter.biayaAdmin;
    const provisi = parameter.biayaProvisi || jumlahPinjaman * 0.005; // 0.5% dari pinjaman
    const materai = 10000;
    const fidusia = jumlahPinjaman > 100000000 ? 500000 : 300000;
    const notaris = 1000000;

    return {
      asuransi,
      administrasi,
      provisi,
      materai,
      fidusia,
      notaris,
      total: asuransi + administrasi + provisi + materai + fidusia + notaris
    };
  }

  private generateJadwalPembayaran(
    principal: number,
    tenor: number,
    annualRate: number,
    emi: number
  ): JadwalPembayaran[] {
    const jadwal: JadwalPembayaran[] = [];
    const monthlyRate = annualRate / 100 / 12;
    let sisaPokok = principal;
    const today = new Date();

    for (let bulan = 1; bulan <= tenor; bulan++) {
      const bungaBulanIni = sisaPokok * monthlyRate;
      const pokokBulanIni = emi - bungaBulanIni;
      sisaPokok -= pokokBulanIni;

      const tanggalJatuhTempo = new Date(today);
      tanggalJatuhTempo.setMonth(today.getMonth() + bulan);

      jadwal.push({
        bulan,
        tanggalJatuhTempo,
        cicilanPokok: Math.round(pokokBulanIni),
        cicilanBunga: Math.round(bungaBulanIni),
        totalCicilan: emi,
        sisaPokok: Math.max(0, Math.round(sisaPokok))
      });
    }

    return jadwal;
  }

  private hitungEfektifitasKredit(parameter: ParameterKredit, totalBunga: number, jumlahPinjaman: number): number {
    // Hitung efektifitas berdasarkan beberapa faktor
    const bungaPersentase = (totalBunga / jumlahPinjaman) * 100;
    const dpPersentase = (parameter.downPayment / parameter.hargaMobil) * 100;
    
    let score = 100;
    
    // Penalti untuk bunga tinggi
    if (bungaPersentase > 50) score -= 30;
    else if (bungaPersentase > 30) score -= 20;
    else if (bungaPersentase > 20) score -= 10;
    
    // Bonus untuk DP tinggi
    if (dpPersentase >= 30) score += 10;
    else if (dpPersentase >= 20) score += 5;
    
    // Penalti untuk tenor panjang
    if (parameter.tenor > 60) score -= 15;
    else if (parameter.tenor > 36) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  private async generatePerbandinganKredit(parameter: ParameterKredit): Promise<PerbandinganKredit[]> {
    const bankData = await this.getBankData();
    const perbandingan: PerbandinganKredit[] = [];

    for (const bank of bankData) {
      const emiResult = await this.hitungEMI(
        parameter.hargaMobil,
        parameter.downPayment,
        parameter.tenor,
        bank.sukuBunga
      );

      if (emiResult.success && emiResult.data) {
        perbandingan.push({
          bank: bank.nama,
          program: 'Regular',
          sukuBunga: bank.sukuBunga,
          cicilanPerBulan: emiResult.data.cicilanPerBulan,
          totalBayar: emiResult.data.cicilanPerBulan * parameter.tenor,
          keunggulan: this.getBankAdvantages(bank.nama),
          syarat: this.getBankRequirements(bank.nama),
          rating: this.getBankRating(bank.nama)
        });
      }
    }

    return perbandingan.sort((a, b) => a.cicilanPerBulan - b.cicilanPerBulan);
  }

  private generateRekomendasiKredit(parameter: ParameterKredit, ringkasan: RingkasanKredit): RekomendasiKredit[] {
    const rekomendasi: RekomendasiKredit[] = [];

    // Rekomendasi tenor
    if (parameter.tenor > 48) {
      const tenorBaru = 36;
      const emiBaruResult = this.hitungEMI(parameter.hargaMobil, parameter.downPayment, tenorBaru, parameter.sukuBunga);
      
      rekomendasi.push({
        tipe: 'tenor',
        judul: 'Pertimbangkan Tenor Lebih Pendek',
        deskripsi: `Dengan tenor ${tenorBaru} bulan, total bunga akan lebih rendah`,
        dampak: 'Menghemat total bunga yang dibayar',
        penghematan: ringkasan.totalBunga * 0.3,
        action: 'Ubah tenor menjadi 36 bulan'
      });
    }

    // Rekomendasi DP
    const dpPersentase = (parameter.downPayment / parameter.hargaMobil) * 100;
    if (dpPersentase < 30) {
      rekomendasi.push({
        tipe: 'dp',
        judul: 'Tingkatkan Down Payment',
        deskripsi: 'DP yang lebih besar akan mengurangi cicilan bulanan',
        dampak: 'Cicilan bulanan lebih ringan dan total bunga lebih kecil',
        penghematan: ringkasan.cicilanPerBulan * 0.2,
        action: 'Tingkatkan DP menjadi 30%'
      });
    }

    return rekomendasi;
  }

  private getBankAdvantages(bankName: string): string[] {
    const advantages: { [key: string]: string[] } = {
      'BCA Finance': ['Proses cepat', 'Jaringan luas', 'Layanan digital'],
      'Mandiri Tunas Finance': ['Bunga kompetitif', 'Tenor fleksibel', 'Promo menarik'],
      'BNI Finance': ['Syarat mudah', 'Approval cepat', 'Layanan prima'],
      'CIMB Niaga Auto Finance': ['Bunga rendah', 'Proses online', 'Cashback']
    };
    return advantages[bankName] || ['Layanan terpercaya'];
  }

  private getBankRequirements(bankName: string): string[] {
    return [
      'KTP dan KK',
      'Slip gaji 3 bulan terakhir',
      'Rekening koran 3 bulan',
      'NPWP',
      'Surat keterangan kerja'
    ];
  }

  private getBankRating(bankName: string): number {
    const ratings: { [key: string]: number } = {
      'BCA Finance': 4.5,
      'Mandiri Tunas Finance': 4.3,
      'BNI Finance': 4.2,
      'CIMB Niaga Auto Finance': 4.4
    };
    return ratings[bankName] || 4.0;
  }

  private generateSharingLink(simulationId: string): string {
    const baseUrl = window.location.origin;
    const shareId = btoa(simulationId + '_' + Date.now()).replace(/[+/=]/g, '');
    return `${baseUrl}/simulasi/share/${shareId}`;
  }

  private generateSharingSummary(hasil: HasilSimulasi) {
    return {
      hargaMobil: hasil.ringkasan.hargaMobil,
      downPayment: hasil.ringkasan.downPayment,
      tenor: hasil.ringkasan.tenor,
      cicilanPerBulan: hasil.cicilanPerBulan,
      totalBayar: hasil.totalBayar,
      bank: 'Simulasi Kredit Mobilindo'
    };
  }

  private async saveSimulationToDatabase(data: any): Promise<void> {
    // Simulasi penyimpanan ke database
    console.log('Saving simulation to database:', data.id);
    // Implementasi actual database save akan dilakukan di sini
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
export const layananKredit = LayananKredit.getInstance();

// Default export for compatibility
export default LayananKredit;