const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Interface untuk data simulasi kredit
export interface DataSimulasiKredit {
  hargaMobil: number;
  uangMuka: number;
  tenorKredit: number; // dalam bulan
  sukuBunga: number; // dalam persen per tahun
  asuransi: boolean;
  biayaAdmin: number;
  biayaProvisi: number;
}

// Interface untuk hasil simulasi
export interface HasilSimulasi {
  cicilanPerBulan: number;
  totalBayar: number;
  totalBunga: number;
  biayaTambahan: number;
  detailCicilan: DetailCicilan[];
}

// Interface untuk detail cicilan per bulan
export interface DetailCicilan {
  bulan: number;
  cicilanPokok: number;
  cicilanBunga: number;
  totalCicilan: number;
  sisaHutang: number;
}

// Interface untuk form simulasi kosong
export interface FormSimulasiKosong {
  hargaMobil: string;
  uangMuka: string;
  tenorKredit: string;
  sukuBunga: string;
  asuransi: boolean;
  biayaAdmin: string;
  biayaProvisi: string;
  errors: {
    hargaMobil?: string;
    uangMuka?: string;
    tenorKredit?: string;
    sukuBunga?: string;
    biayaAdmin?: string;
    biayaProvisi?: string;
  };
}

// Interface untuk parameter kredit default
export interface ParameterKreditDefault {
  sukuBungaMin: number;
  sukuBungaMax: number;
  tenorMin: number;
  tenorMax: number;
  uangMukaMin: number; // dalam persen
  biayaAdminDefault: number;
  biayaProvisiDefault: number;
  asuransiWajib: boolean;
}

export class KontrollerSimulasi {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  /**
   * Memuat form simulasi kosong dengan nilai default
   * @returns FormSimulasiKosong - Form simulasi dengan nilai kosong
   */
  public muatFormSimulasiKosong(): FormSimulasiKosong {
    return {
      hargaMobil: '',
      uangMuka: '',
      tenorKredit: '36', // default 3 tahun
      sukuBunga: '8.5', // default 8.5% per tahun
      asuransi: true, // default asuransi aktif
      biayaAdmin: '500000', // default Rp 500.000
      biayaProvisi: '1.5', // default 1.5% dari harga mobil
      errors: {}
    };
  }

  /**
   * Memuat parameter kredit default dari server
   * @returns Promise<ParameterKreditDefault>
   */
  public async muatParameterKreditDefault(): Promise<ParameterKreditDefault> {
    try {
      const response = await fetch(`${API_BASE_URL}/simulasi/parameter-default`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error loading default credit parameters:', error);
      // Return default values if API fails
      return {
        sukuBungaMin: 6.0,
        sukuBungaMax: 15.0,
        tenorMin: 12,
        tenorMax: 84,
        uangMukaMin: 20,
        biayaAdminDefault: 500000,
        biayaProvisiDefault: 1.5,
        asuransiWajib: true
      };
    }
  }

  /**
   * Validasi data simulasi kredit
   * @param data - Data simulasi yang akan divalidasi
   * @returns Object dengan status validasi dan error messages
   */
  public validasiDataSimulasi(data: Partial<DataSimulasiKredit>): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};

    // Validasi harga mobil
    if (!data.hargaMobil || data.hargaMobil <= 0) {
      errors.hargaMobil = 'Harga mobil harus diisi dan lebih dari 0';
    } else if (data.hargaMobil < 50000000) {
      errors.hargaMobil = 'Harga mobil minimal Rp 50.000.000';
    }

    // Validasi uang muka
    if (!data.uangMuka || data.uangMuka <= 0) {
      errors.uangMuka = 'Uang muka harus diisi dan lebih dari 0';
    } else if (data.hargaMobil && data.uangMuka >= data.hargaMobil) {
      errors.uangMuka = 'Uang muka tidak boleh lebih dari atau sama dengan harga mobil';
    } else if (data.hargaMobil && (data.uangMuka / data.hargaMobil) < 0.2) {
      errors.uangMuka = 'Uang muka minimal 20% dari harga mobil';
    }

    // Validasi tenor kredit
    if (!data.tenorKredit || data.tenorKredit <= 0) {
      errors.tenorKredit = 'Tenor kredit harus diisi dan lebih dari 0';
    } else if (data.tenorKredit < 12) {
      errors.tenorKredit = 'Tenor kredit minimal 12 bulan';
    } else if (data.tenorKredit > 84) {
      errors.tenorKredit = 'Tenor kredit maksimal 84 bulan (7 tahun)';
    }

    // Validasi suku bunga
    if (!data.sukuBunga || data.sukuBunga <= 0) {
      errors.sukuBunga = 'Suku bunga harus diisi dan lebih dari 0';
    } else if (data.sukuBunga < 5) {
      errors.sukuBunga = 'Suku bunga minimal 5% per tahun';
    } else if (data.sukuBunga > 20) {
      errors.sukuBunga = 'Suku bunga maksimal 20% per tahun';
    }

    // Validasi biaya admin
    if (data.biayaAdmin && data.biayaAdmin < 0) {
      errors.biayaAdmin = 'Biaya admin tidak boleh negatif';
    }

    // Validasi biaya provisi
    if (data.biayaProvisi && data.biayaProvisi < 0) {
      errors.biayaProvisi = 'Biaya provisi tidak boleh negatif';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Menghitung simulasi kredit
   * @param data - Data simulasi kredit
   * @returns Promise<HasilSimulasi>
   */
  public async hitungSimulasiKredit(data: DataSimulasiKredit): Promise<HasilSimulasi> {
    try {
      const response = await fetch(`${API_BASE_URL}/simulasi/hitung`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error calculating credit simulation:', error);
      // Fallback calculation if API fails
      return this.hitungSimulasiLokal(data);
    }
  }

  /**
   * Menghitung simulasi kredit secara lokal (fallback)
   * @param data - Data simulasi kredit
   * @returns HasilSimulasi
   */
  private hitungSimulasiLokal(data: DataSimulasiKredit): HasilSimulasi {
    const pokokPinjaman = data.hargaMobil - data.uangMuka;
    const sukuBungaBulanan = data.sukuBunga / 100 / 12;
    const biayaProvisiTotal = (data.biayaProvisi / 100) * data.hargaMobil;
    
    // Rumus anuitas untuk menghitung cicilan bulanan
    const cicilanPerBulan = pokokPinjaman * 
      (sukuBungaBulanan * Math.pow(1 + sukuBungaBulanan, data.tenorKredit)) /
      (Math.pow(1 + sukuBungaBulanan, data.tenorKredit) - 1);

    const totalBayar = cicilanPerBulan * data.tenorKredit;
    const totalBunga = totalBayar - pokokPinjaman;
    const biayaTambahan = data.biayaAdmin + biayaProvisiTotal + (data.asuransi ? 2000000 : 0);

    // Generate detail cicilan per bulan
    const detailCicilan: DetailCicilan[] = [];
    let sisaHutang = pokokPinjaman;

    for (let bulan = 1; bulan <= data.tenorKredit; bulan++) {
      const cicilanBunga = sisaHutang * sukuBungaBulanan;
      const cicilanPokok = cicilanPerBulan - cicilanBunga;
      sisaHutang -= cicilanPokok;

      detailCicilan.push({
        bulan,
        cicilanPokok: Math.round(cicilanPokok),
        cicilanBunga: Math.round(cicilanBunga),
        totalCicilan: Math.round(cicilanPerBulan),
        sisaHutang: Math.round(Math.max(0, sisaHutang))
      });
    }

    return {
      cicilanPerBulan: Math.round(cicilanPerBulan),
      totalBayar: Math.round(totalBayar),
      totalBunga: Math.round(totalBunga),
      biayaTambahan: Math.round(biayaTambahan),
      detailCicilan
    };
  }

  /**
   * Menyimpan hasil simulasi ke riwayat
   * @param data - Data simulasi
   * @param hasil - Hasil simulasi
   * @returns Promise<boolean>
   */
  public async simpanRiwayatSimulasi(data: DataSimulasiKredit, hasil: HasilSimulasi): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/simulasi/riwayat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          dataSimulasi: data,
          hasilSimulasi: hasil,
          tanggalSimulasi: new Date().toISOString()
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error saving simulation history:', error);
      return false;
    }
  }

  /**
   * Memuat riwayat simulasi pengguna
   * @returns Promise<Array>
   */
  public async muatRiwayatSimulasi(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/simulasi/riwayat`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error loading simulation history:', error);
      return [];
    }
  }

  /**
   * Format angka ke format rupiah
   * @param amount - Jumlah dalam angka
   * @returns String format rupiah
   */
  public formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Format persentase
   * @param percentage - Nilai persentase
   * @returns String format persentase
   */
  public formatPersentase(percentage: number): string {
    return `${percentage.toFixed(2)}%`;
  }
}

export default KontrollerSimulasi;