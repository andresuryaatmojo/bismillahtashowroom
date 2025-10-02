// ==================== ENTITAS KREDIT ====================
// Kelas untuk mengelola simulasi kredit dan pembiayaan mobil
// Mengatur kalkulasi cicilan, tenor, dan lembaga pembiayaan

// Interface untuk data simulasi kredit
export interface DataSimulasiKredit {
  idSimulasi: string;
  idPengguna: string;
  idMobil: string;
  hargaMobil: number;
  downPayment: number;
  tenor: number;
  sukuBunga: number;
  cicilanBulanan: number;
  totalPembayaran: number;
  tanggalSimulasi: Date;
  statusSimulasi: string;
  jenisKredit: string;
  lembagaPembiayaan: string;
  biayaAdmin: number;
  asuransi: number;
}

// Interface untuk hasil kalkulasi kredit
export interface HasilKalkulasiKredit {
  cicilanBulanan: number;
  totalPembayaran: number;
  totalBunga: number;
  biayaAdmin: number;
  biayaAsuransi: number;
  totalBiayaTambahan: number;
  persentaseBunga: number;
  jadwalPembayaran: JadwalPembayaran[];
  ringkasanBiaya: RingkasanBiaya;
}

// Interface untuk jadwal pembayaran
export interface JadwalPembayaran {
  bulanKe: number;
  tanggalJatuhTempo: Date;
  cicilanPokok: number;
  cicilanBunga: number;
  totalCicilan: number;
  sisaPokok: number;
}

// Interface untuk ringkasan biaya
export interface RingkasanBiaya {
  hargaMobil: number;
  downPayment: number;
  jumlahPinjaman: number;
  totalBunga: number;
  biayaAdmin: number;
  biayaAsuransi: number;
  totalPembayaran: number;
  penghematanDP: number;
}

// Interface untuk parameter simulasi
export interface ParameterSimulasi {
  hargaMobil: number;
  downPayment: number;
  tenor: number;
  jenisKredit: string;
  lembagaPembiayaan?: string;
}

// Interface untuk lembaga pembiayaan
export interface LembagaPembiayaan {
  idLembaga: string;
  namaLembaga: string;
  sukuBunga: number;
  biayaAdmin: number;
  biayaAsuransi: number;
  tenorTersedia: number[];
  dpMinimal: number;
  syaratKhusus: string[];
  statusAktif: boolean;
}

// Interface untuk response validasi
export interface ResponValidasi {
  valid: boolean;
  pesan: string;
}

// Interface untuk perbandingan kredit
export interface PerbandinganKredit {
  lembaga: string;
  sukuBunga: number;
  cicilanBulanan: number;
  totalPembayaran: number;
  biayaTambahan: number;
  rating: number;
  keunggulan: string[];
}

class EntitasKredit {
  // Attributes
  private idSimulasi: string;
  private idPengguna: string;
  private idMobil: string;
  private hargaMobil: number;
  private downPayment: number;
  private tenor: number;
  private sukuBunga: number;
  private cicilanBulanan: number;
  private totalPembayaran: number;
  private tanggalSimulasi: Date;
  private statusSimulasi: string;
  private jenisKredit: string;
  private lembagaPembiayaan: string;
  private biayaAdmin: number;
  private asuransi: number;

  constructor(data?: Partial<DataSimulasiKredit>) {
    this.idSimulasi = data?.idSimulasi || this.generateId();
    this.idPengguna = data?.idPengguna || '';
    this.idMobil = data?.idMobil || '';
    this.hargaMobil = data?.hargaMobil || 0;
    this.downPayment = data?.downPayment || 0;
    this.tenor = data?.tenor || 12;
    this.sukuBunga = data?.sukuBunga || 0;
    this.cicilanBulanan = data?.cicilanBulanan || 0;
    this.totalPembayaran = data?.totalPembayaran || 0;
    this.tanggalSimulasi = data?.tanggalSimulasi || new Date();
    this.statusSimulasi = data?.statusSimulasi || 'draft';
    this.jenisKredit = data?.jenisKredit || 'konvensional';
    this.lembagaPembiayaan = data?.lembagaPembiayaan || '';
    this.biayaAdmin = data?.biayaAdmin || 0;
    this.asuransi = data?.asuransi || 0;
  }

  // Methods

  /**
   * Menyimpan hasil kalkulasi kredit ke database
   * @param hasilSimulasi - Hasil kalkulasi simulasi kredit
   * @returns Promise<string> - ID simulasi yang disimpan
   */
  public async simpanHasilKalkulasi(hasilSimulasi: HasilKalkulasiKredit): Promise<string> {
    try {
      // Validasi hasil simulasi
      const validasi = await this.validasiHasilSimulasi(hasilSimulasi);
      if (!validasi.valid) {
        throw new Error(validasi.pesan);
      }

      // Set data dari hasil kalkulasi
      this.cicilanBulanan = hasilSimulasi.cicilanBulanan;
      this.totalPembayaran = hasilSimulasi.totalPembayaran;
      this.biayaAdmin = hasilSimulasi.biayaAdmin;
      this.asuransi = hasilSimulasi.biayaAsuransi;
      this.statusSimulasi = 'completed';
      this.tanggalSimulasi = new Date();

      // Simpan ke database
      await this.simpanSimulasiDatabase();

      // Simpan jadwal pembayaran
      await this.simpanJadwalPembayaran(hasilSimulasi.jadwalPembayaran);

      // Simpan ringkasan biaya
      await this.simpanRingkasanBiaya(hasilSimulasi.ringkasanBiaya);

      // Log aktivitas simulasi
      await this.logAktivitasSimulasi(this.idSimulasi, 'simulasi_disimpan', 'Hasil simulasi kredit disimpan');

      // Update statistik pengguna
      await this.updateStatistikPengguna(this.idPengguna, 'simulasi_kredit');

      // Kirim notifikasi hasil simulasi
      await this.kirimNotifikasiHasilSimulasi(this.idPengguna, this.idSimulasi);

      // Generate rekomendasi lembaga pembiayaan
      await this.generateRekomendasiLembaga(this.hargaMobil, this.downPayment, this.tenor);

      return this.idSimulasi;

    } catch (error) {
      throw new Error(`Gagal menyimpan hasil kalkulasi: ${error}`);
    }
  }

  /**
   * Melakukan kalkulasi simulasi kredit
   * @param parameter - Parameter simulasi kredit
   * @returns Promise<HasilKalkulasiKredit> - Hasil kalkulasi kredit
   */
  public async kalkulasiSimulasiKredit(parameter: ParameterSimulasi): Promise<HasilKalkulasiKredit> {
    try {
      // Validasi parameter
      const validasi = await this.validasiParameterSimulasi(parameter);
      if (!validasi.valid) {
        throw new Error(validasi.pesan);
      }

      // Set parameter ke instance
      this.hargaMobil = parameter.hargaMobil;
      this.downPayment = parameter.downPayment;
      this.tenor = parameter.tenor;
      this.jenisKredit = parameter.jenisKredit;
      this.lembagaPembiayaan = parameter.lembagaPembiayaan || '';

      // Ambil data lembaga pembiayaan
      const lembaga = await this.ambilDataLembagaPembiayaan(this.lembagaPembiayaan);
      if (!lembaga) {
        throw new Error('Lembaga pembiayaan tidak ditemukan');
      }

      // Set suku bunga dan biaya
      this.sukuBunga = lembaga.sukuBunga;
      this.biayaAdmin = lembaga.biayaAdmin;
      this.asuransi = lembaga.biayaAsuransi;

      // Hitung jumlah pinjaman
      const jumlahPinjaman = this.hargaMobil - this.downPayment;

      // Hitung cicilan bulanan
      const cicilanBulanan = await this.hitungCicilanBulanan(jumlahPinjaman, this.sukuBunga, this.tenor);

      // Hitung total pembayaran
      const totalPembayaran = (cicilanBulanan * this.tenor) + this.downPayment + this.biayaAdmin + this.asuransi;

      // Hitung total bunga
      const totalBunga = (cicilanBulanan * this.tenor) - jumlahPinjaman;

      // Generate jadwal pembayaran
      const jadwalPembayaran = await this.generateJadwalPembayaran(jumlahPinjaman, cicilanBulanan, this.sukuBunga, this.tenor);

      // Generate ringkasan biaya
      const ringkasanBiaya = await this.generateRingkasanBiaya(parameter, totalBunga);

      // Hitung persentase bunga
      const persentaseBunga = (totalBunga / jumlahPinjaman) * 100;

      // Set hasil ke instance
      this.cicilanBulanan = cicilanBulanan;
      this.totalPembayaran = totalPembayaran;

      const hasilKalkulasi: HasilKalkulasiKredit = {
        cicilanBulanan,
        totalPembayaran,
        totalBunga,
        biayaAdmin: this.biayaAdmin,
        biayaAsuransi: this.asuransi,
        totalBiayaTambahan: this.biayaAdmin + this.asuransi,
        persentaseBunga: Math.round(persentaseBunga * 100) / 100,
        jadwalPembayaran,
        ringkasanBiaya
      };

      // Log aktivitas kalkulasi
      await this.logAktivitasSimulasi(this.idSimulasi, 'kalkulasi_dilakukan', 'Kalkulasi simulasi kredit dilakukan');

      return hasilKalkulasi;

    } catch (error) {
      throw new Error(`Gagal melakukan kalkulasi simulasi: ${error}`);
    }
  }

  /**
   * Mengambil daftar lembaga pembiayaan yang tersedia
   * @returns Promise<LembagaPembiayaan[]> - Daftar lembaga pembiayaan
   */
  public async ambilDaftarLembagaPembiayaan(): Promise<LembagaPembiayaan[]> {
    try {
      // Simulasi pengambilan data dari database
      await this.simulasiDelay(300);

      // Ambil data lembaga pembiayaan
      const daftarLembaga = await this.ambilLembagaPembiayaanDatabase();

      // Filter hanya yang aktif
      const lembagaAktif = daftarLembaga.filter(lembaga => lembaga.statusAktif);

      // Urutkan berdasarkan suku bunga (terendah dulu)
      lembagaAktif.sort((a, b) => a.sukuBunga - b.sukuBunga);

      return lembagaAktif;

    } catch (error) {
      throw new Error(`Gagal mengambil daftar lembaga pembiayaan: ${error}`);
    }
  }

  /**
   * Membandingkan kredit dari berbagai lembaga pembiayaan
   * @param parameter - Parameter simulasi untuk perbandingan
   * @returns Promise<PerbandinganKredit[]> - Hasil perbandingan kredit
   */
  public async bandingkanKredit(parameter: ParameterSimulasi): Promise<PerbandinganKredit[]> {
    try {
      // Ambil daftar lembaga pembiayaan
      const daftarLembaga = await this.ambilDaftarLembagaPembiayaan();

      const hasilPerbandingan: PerbandinganKredit[] = [];

      // Kalkulasi untuk setiap lembaga
      for (const lembaga of daftarLembaga) {
        // Cek apakah tenor tersedia
        if (!lembaga.tenorTersedia.includes(parameter.tenor)) {
          continue;
        }

        // Cek DP minimal
        const persentaseDP = (parameter.downPayment / parameter.hargaMobil) * 100;
        if (persentaseDP < lembaga.dpMinimal) {
          continue;
        }

        // Kalkulasi untuk lembaga ini
        const parameterLembaga = {
          ...parameter,
          lembagaPembiayaan: lembaga.idLembaga
        };

        const hasilKalkulasi = await this.kalkulasiSimulasiKredit(parameterLembaga);

        // Hitung rating berdasarkan berbagai faktor
        const rating = await this.hitungRatingLembaga(lembaga, hasilKalkulasi);

        // Generate keunggulan
        const keunggulan = await this.generateKeunggulanLembaga(lembaga, hasilKalkulasi);

        hasilPerbandingan.push({
          lembaga: lembaga.namaLembaga,
          sukuBunga: lembaga.sukuBunga,
          cicilanBulanan: hasilKalkulasi.cicilanBulanan,
          totalPembayaran: hasilKalkulasi.totalPembayaran,
          biayaTambahan: hasilKalkulasi.totalBiayaTambahan,
          rating,
          keunggulan
        });
      }

      // Urutkan berdasarkan rating (tertinggi dulu)
      hasilPerbandingan.sort((a, b) => b.rating - a.rating);

      return hasilPerbandingan;

    } catch (error) {
      throw new Error(`Gagal membandingkan kredit: ${error}`);
    }
  }

  /**
   * Mengambil riwayat simulasi pengguna
   * @param idPengguna - ID pengguna
   * @returns Promise<DataSimulasiKredit[]> - Riwayat simulasi
   */
  public async ambilRiwayatSimulasi(idPengguna: string): Promise<DataSimulasiKredit[]> {
    try {
      // Validasi ID pengguna
      if (!idPengguna || idPengguna.trim() === '') {
        throw new Error('ID pengguna tidak valid');
      }

      // Simulasi pengambilan data dari database
      await this.simulasiDelay(300);

      // Ambil riwayat simulasi
      const riwayatSimulasi = await this.ambilRiwayatSimulasiDatabase(idPengguna);

      // Urutkan berdasarkan tanggal (terbaru dulu)
      riwayatSimulasi.sort((a, b) => b.tanggalSimulasi.getTime() - a.tanggalSimulasi.getTime());

      return riwayatSimulasi;

    } catch (error) {
      throw new Error(`Gagal mengambil riwayat simulasi: ${error}`);
    }
  }

  // Private helper methods

  private generateId(): string {
    return 'SIM' + Date.now().toString() + Math.random().toString(36).substr(2, 5);
  }

  private async simulasiDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async validasiHasilSimulasi(hasil: HasilKalkulasiKredit): Promise<ResponValidasi> {
    await this.simulasiDelay(100);

    // Validasi cicilan bulanan
    if (hasil.cicilanBulanan <= 0) {
      return { valid: false, pesan: 'Cicilan bulanan harus lebih dari 0' };
    }

    // Validasi total pembayaran
    if (hasil.totalPembayaran <= 0) {
      return { valid: false, pesan: 'Total pembayaran harus lebih dari 0' };
    }

    // Validasi jadwal pembayaran
    if (!hasil.jadwalPembayaran || hasil.jadwalPembayaran.length === 0) {
      return { valid: false, pesan: 'Jadwal pembayaran harus ada' };
    }

    return { valid: true, pesan: 'Hasil simulasi valid' };
  }

  private async validasiParameterSimulasi(parameter: ParameterSimulasi): Promise<ResponValidasi> {
    await this.simulasiDelay(100);

    // Validasi harga mobil
    if (parameter.hargaMobil <= 0) {
      return { valid: false, pesan: 'Harga mobil harus lebih dari 0' };
    }

    // Validasi down payment
    if (parameter.downPayment < 0) {
      return { valid: false, pesan: 'Down payment tidak boleh negatif' };
    }

    if (parameter.downPayment >= parameter.hargaMobil) {
      return { valid: false, pesan: 'Down payment tidak boleh lebih dari atau sama dengan harga mobil' };
    }

    // Validasi tenor
    if (parameter.tenor <= 0 || parameter.tenor > 84) {
      return { valid: false, pesan: 'Tenor harus antara 1-84 bulan' };
    }

    // Validasi jenis kredit
    const jenisKreditValid = ['konvensional', 'syariah', 'multiguna'];
    if (!jenisKreditValid.includes(parameter.jenisKredit)) {
      return { valid: false, pesan: 'Jenis kredit tidak valid' };
    }

    return { valid: true, pesan: 'Parameter simulasi valid' };
  }

  private async simpanSimulasiDatabase(): Promise<void> {
    await this.simulasiDelay(400);
    // Simulasi penyimpanan ke database
  }

  private async simpanJadwalPembayaran(jadwal: JadwalPembayaran[]): Promise<void> {
    await this.simulasiDelay(300);
    // Simulasi penyimpanan jadwal pembayaran
  }

  private async simpanRingkasanBiaya(ringkasan: RingkasanBiaya): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi penyimpanan ringkasan biaya
  }

  private async logAktivitasSimulasi(idSimulasi: string, tipeAktivitas: string, deskripsi: string): Promise<void> {
    await this.simulasiDelay(100);
    // Simulasi logging aktivitas
  }

  private async updateStatistikPengguna(idPengguna: string, tipeAktivitas: string): Promise<void> {
    await this.simulasiDelay(100);
    // Simulasi update statistik pengguna
  }

  private async kirimNotifikasiHasilSimulasi(idPengguna: string, idSimulasi: string): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi pengiriman notifikasi
  }

  private async generateRekomendasiLembaga(hargaMobil: number, downPayment: number, tenor: number): Promise<void> {
    await this.simulasiDelay(300);
    // Simulasi generate rekomendasi lembaga
  }

  private async ambilDataLembagaPembiayaan(idLembaga: string): Promise<LembagaPembiayaan | null> {
    await this.simulasiDelay(200);

    // Simulasi data lembaga pembiayaan
    const daftarLembaga = await this.ambilLembagaPembiayaanDatabase();
    return daftarLembaga.find(lembaga => lembaga.idLembaga === idLembaga) || daftarLembaga[0];
  }

  private async ambilLembagaPembiayaanDatabase(): Promise<LembagaPembiayaan[]> {
    await this.simulasiDelay(300);

    // Simulasi data lembaga pembiayaan
    return [
      {
        idLembaga: 'LMB001',
        namaLembaga: 'BCA Finance',
        sukuBunga: 8.5,
        biayaAdmin: 500000,
        biayaAsuransi: 2000000,
        tenorTersedia: [12, 24, 36, 48, 60],
        dpMinimal: 20,
        syaratKhusus: ['KTP', 'NPWP', 'Slip Gaji'],
        statusAktif: true
      },
      {
        idLembaga: 'LMB002',
        namaLembaga: 'Mandiri Tunas Finance',
        sukuBunga: 9.0,
        biayaAdmin: 750000,
        biayaAsuransi: 1800000,
        tenorTersedia: [12, 24, 36, 48, 60, 72],
        dpMinimal: 25,
        syaratKhusus: ['KTP', 'Kartu Keluarga', 'Slip Gaji'],
        statusAktif: true
      },
      {
        idLembaga: 'LMB003',
        namaLembaga: 'Adira Finance',
        sukuBunga: 8.8,
        biayaAdmin: 600000,
        biayaAsuransi: 1900000,
        tenorTersedia: [12, 24, 36, 48, 60, 72, 84],
        dpMinimal: 15,
        syaratKhusus: ['KTP', 'Slip Gaji'],
        statusAktif: true
      }
    ];
  }

  private async hitungCicilanBulanan(pinjaman: number, sukuBunga: number, tenor: number): Promise<number> {
    await this.simulasiDelay(200);

    // Rumus cicilan bulanan: PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
    const r = (sukuBunga / 100) / 12; // Suku bunga bulanan
    const n = tenor; // Jumlah bulan

    if (r === 0) {
      return pinjaman / n; // Jika bunga 0%
    }

    const cicilan = pinjaman * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(cicilan);
  }

  private async generateJadwalPembayaran(pinjaman: number, cicilan: number, sukuBunga: number, tenor: number): Promise<JadwalPembayaran[]> {
    await this.simulasiDelay(300);

    const jadwal: JadwalPembayaran[] = [];
    let sisaPokok = pinjaman;
    const sukuBungaBulanan = (sukuBunga / 100) / 12;

    for (let bulan = 1; bulan <= tenor; bulan++) {
      const cicilanBunga = sisaPokok * sukuBungaBulanan;
      const cicilanPokok = cicilan - cicilanBunga;
      sisaPokok -= cicilanPokok;

      const tanggalJatuhTempo = new Date();
      tanggalJatuhTempo.setMonth(tanggalJatuhTempo.getMonth() + bulan);

      jadwal.push({
        bulanKe: bulan,
        tanggalJatuhTempo,
        cicilanPokok: Math.round(cicilanPokok),
        cicilanBunga: Math.round(cicilanBunga),
        totalCicilan: cicilan,
        sisaPokok: Math.round(Math.max(0, sisaPokok))
      });
    }

    return jadwal;
  }

  private async generateRingkasanBiaya(parameter: ParameterSimulasi, totalBunga: number): Promise<RingkasanBiaya> {
    await this.simulasiDelay(200);

    const jumlahPinjaman = parameter.hargaMobil - parameter.downPayment;
    const totalPembayaran = jumlahPinjaman + totalBunga + this.biayaAdmin + this.asuransi;
    const penghematanDP = parameter.hargaMobil * 0.3 - parameter.downPayment; // Asumsi DP normal 30%

    return {
      hargaMobil: parameter.hargaMobil,
      downPayment: parameter.downPayment,
      jumlahPinjaman,
      totalBunga,
      biayaAdmin: this.biayaAdmin,
      biayaAsuransi: this.asuransi,
      totalPembayaran,
      penghematanDP: Math.max(0, penghematanDP)
    };
  }

  private async hitungRatingLembaga(lembaga: LembagaPembiayaan, hasil: HasilKalkulasiKredit): Promise<number> {
    await this.simulasiDelay(100);

    let rating = 5.0;

    // Faktor suku bunga (semakin rendah semakin baik)
    if (lembaga.sukuBunga > 10) rating -= 1.0;
    else if (lembaga.sukuBunga > 8.5) rating -= 0.5;

    // Faktor biaya admin (semakin rendah semakin baik)
    if (lembaga.biayaAdmin > 1000000) rating -= 0.5;
    else if (lembaga.biayaAdmin < 500000) rating += 0.3;

    // Faktor fleksibilitas tenor
    if (lembaga.tenorTersedia.length > 5) rating += 0.2;

    // Faktor DP minimal (semakin rendah semakin baik)
    if (lembaga.dpMinimal < 20) rating += 0.3;
    else if (lembaga.dpMinimal > 30) rating -= 0.3;

    return Math.min(5.0, Math.max(1.0, Math.round(rating * 10) / 10));
  }

  private async generateKeunggulanLembaga(lembaga: LembagaPembiayaan, hasil: HasilKalkulasiKredit): Promise<string[]> {
    await this.simulasiDelay(100);

    const keunggulan: string[] = [];

    if (lembaga.sukuBunga < 8.5) {
      keunggulan.push('Suku bunga kompetitif');
    }

    if (lembaga.biayaAdmin < 600000) {
      keunggulan.push('Biaya admin rendah');
    }

    if (lembaga.dpMinimal < 20) {
      keunggulan.push('DP minimal rendah');
    }

    if (lembaga.tenorTersedia.length > 5) {
      keunggulan.push('Pilihan tenor fleksibel');
    }

    if (lembaga.syaratKhusus.length <= 2) {
      keunggulan.push('Syarat mudah');
    }

    return keunggulan;
  }

  private async ambilRiwayatSimulasiDatabase(idPengguna: string): Promise<DataSimulasiKredit[]> {
    await this.simulasiDelay(300);

    // Simulasi data riwayat simulasi
    return [
      {
        idSimulasi: 'SIM001',
        idPengguna: idPengguna,
        idMobil: 'MOB001',
        hargaMobil: 250000000,
        downPayment: 50000000,
        tenor: 36,
        sukuBunga: 8.5,
        cicilanBulanan: 6500000,
        totalPembayaran: 284000000,
        tanggalSimulasi: new Date('2024-01-15'),
        statusSimulasi: 'completed',
        jenisKredit: 'konvensional',
        lembagaPembiayaan: 'BCA Finance',
        biayaAdmin: 500000,
        asuransi: 2000000
      },
      {
        idSimulasi: 'SIM002',
        idPengguna: idPengguna,
        idMobil: 'MOB002',
        hargaMobil: 180000000,
        downPayment: 36000000,
        tenor: 48,
        sukuBunga: 9.0,
        cicilanBulanan: 3800000,
        totalPembayaran: 218400000,
        tanggalSimulasi: new Date('2024-01-10'),
        statusSimulasi: 'completed',
        jenisKredit: 'konvensional',
        lembagaPembiayaan: 'Mandiri Tunas Finance',
        biayaAdmin: 750000,
        asuransi: 1800000
      }
    ];
  }

  // Public method untuk mendapatkan data lengkap
  public toJSON(): DataSimulasiKredit {
    return {
      idSimulasi: this.idSimulasi,
      idPengguna: this.idPengguna,
      idMobil: this.idMobil,
      hargaMobil: this.hargaMobil,
      downPayment: this.downPayment,
      tenor: this.tenor,
      sukuBunga: this.sukuBunga,
      cicilanBulanan: this.cicilanBulanan,
      totalPembayaran: this.totalPembayaran,
      tanggalSimulasi: this.tanggalSimulasi,
      statusSimulasi: this.statusSimulasi,
      jenisKredit: this.jenisKredit,
      lembagaPembiayaan: this.lembagaPembiayaan,
      biayaAdmin: this.biayaAdmin,
      asuransi: this.asuransi
    };
  }
}

export type StatusSimulasi = 'draft' | 'completed' | 'approved' | 'rejected';
export type JenisKredit = 'konvensional' | 'syariah' | 'multiguna';

export default EntitasKredit;