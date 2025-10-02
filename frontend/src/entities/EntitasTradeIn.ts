// ==================== ENTITAS TRADE IN ====================
// Kelas untuk mengelola proses trade-in mobil lama dengan mobil baru
// Mengatur estimasi harga, inspeksi, dan finalisasi trade-in

// Interface untuk data trade-in
export interface DataTradeIn {
  idTradeIn: string;
  idPengguna: string;
  idMobilBaru: string;
  dataMobilLama: string;
  estimasiHarga: number;
  statusTradeIn: string;
  tanggalPengajuan: Date;
  tanggalInspeksi: Date;
  hasilInspeksi: string;
  fotoMobilLama: string[];
  kontrakTradeIn: string;
  nilaiTradeIn: number;
  selisihPembayaran: number;
}

// Interface untuk data mobil lama
export interface DataMobilLama {
  merk: string;
  model: string;
  tahun: number;
  transmisi: string;
  bahanBakar: string;
  warna: string;
  kilometer: number;
  kondisiMesin: string;
  kondisiBodi: string;
  kondisiInterior: string;
  kelengkapanSurat: string[];
  riwayatService: boolean;
  riwayatKecelakaan: boolean;
  modifikasi: string[];
  aksesorisTambahan: string[];
}

// Interface untuk spesifikasi mobil untuk estimasi
export interface SpesifikasiMobil {
  merk: string;
  model: string;
  tahun: number;
  transmisi: string;
  bahanBakar: string;
  kilometer: number;
  kondisiUmum: string;
}

// Interface untuk hasil estimasi harga
export interface HasilEstimasi {
  hargaEstimasi: number;
  hargaMinimal: number;
  hargaMaksimal: number;
  faktorPenentu: FaktorPenentu[];
  rekomendasiPerbaikan: string[];
  validitasEstimasi: number; // dalam hari
  metodePenilaian: string;
}

// Interface untuk faktor penentu harga
export interface FaktorPenentu {
  faktor: string;
  pengaruh: 'positif' | 'negatif' | 'netral';
  persentase: number;
  deskripsi: string;
}

// Interface untuk data pengajuan trade-in
export interface DataPengajuanTradeIn {
  idPengguna: string;
  idMobilBaru: string;
  dataMobilLama: DataMobilLama;
  fotoMobilLama: string[];
  catatanTambahan?: string;
  preferensiInspeksi?: PreferensiInspeksi;
}

// Interface untuk preferensi inspeksi
export interface PreferensiInspeksi {
  tanggalPreferensi: Date[];
  lokasiInspeksi: string;
  waktuInspeksi: string;
  kontakPerson: string;
  nomorTelepon: string;
}

// Interface untuk hasil inspeksi
export interface HasilInspeksiDetail {
  idInspeksi: string;
  tanggalInspeksi: Date;
  inspektur: string;
  lokasiInspeksi: string;
  kondisiMesin: PenilaianKondisi;
  kondisiBodi: PenilaianKondisi;
  kondisiInterior: PenilaianKondisi;
  kondisiElektrikal: PenilaianKondisi;
  kondisiSuspensi: PenilaianKondisi;
  kondisiRem: PenilaianKondisi;
  kelengkapanSurat: boolean;
  fotoInspeksi: string[];
  catatanInspektur: string;
  nilaiAkhir: number;
  rekomendasiPerbaikan: string[];
  estimasiHargaFinal: number;
}

// Interface untuk penilaian kondisi
export interface PenilaianKondisi {
  skor: number; // 1-10
  kondisi: 'sangat baik' | 'baik' | 'cukup' | 'kurang' | 'buruk';
  catatan: string;
  fotoEvidence: string[];
}

// Interface untuk kontrak trade-in
export interface KontrakTradeIn {
  idKontrak: string;
  idTradeIn: string;
  nilaiTradeIn: number;
  selisihPembayaran: number;
  syaratKetentuan: string[];
  tanggalBerlaku: Date;
  tanggalExpired: Date;
  statusKontrak: string;
  tandaTanganDigital: boolean;
}

// Interface untuk response validasi
export interface ResponValidasi {
  valid: boolean;
  pesan: string;
}

// Interface untuk tracking status
export interface StatusTracking {
  idTradeIn: string;
  statusSaatIni: string;
  riwayatStatus: RiwayatStatus[];
  estimasiSelesai: Date;
  langkahSelanjutnya: string;
  kontakPIC: string;
}

// Interface untuk riwayat status
export interface RiwayatStatus {
  status: string;
  tanggal: Date;
  keterangan: string;
  petugas: string;
}

class EntitasTradeIn {
  // Attributes
  private idTradeIn: string;
  private idPengguna: string;
  private idMobilBaru: string;
  private dataMobilLama: string;
  private estimasiHarga: number;
  private statusTradeIn: string;
  private tanggalPengajuan: Date;
  private tanggalInspeksi: Date;
  private hasilInspeksi: string;
  private fotoMobilLama: string[];
  private kontrakTradeIn: string;
  private nilaiTradeIn: number;
  private selisihPembayaran: number;

  constructor(data?: Partial<DataTradeIn>) {
    this.idTradeIn = data?.idTradeIn || this.generateId();
    this.idPengguna = data?.idPengguna || '';
    this.idMobilBaru = data?.idMobilBaru || '';
    this.dataMobilLama = data?.dataMobilLama || '';
    this.estimasiHarga = data?.estimasiHarga || 0;
    this.statusTradeIn = data?.statusTradeIn || 'draft';
    this.tanggalPengajuan = data?.tanggalPengajuan || new Date();
    this.tanggalInspeksi = data?.tanggalInspeksi || new Date();
    this.hasilInspeksi = data?.hasilInspeksi || '';
    this.fotoMobilLama = data?.fotoMobilLama || [];
    this.kontrakTradeIn = data?.kontrakTradeIn || '';
    this.nilaiTradeIn = data?.nilaiTradeIn || 0;
    this.selisihPembayaran = data?.selisihPembayaran || 0;
  }

  // Methods

  /**
   * Membuat pengajuan trade-in baru
   * @param data - Data pengajuan trade-in
   * @returns Promise<string> - ID trade-in yang dibuat
   */
  public async buatPengajuanTradeIn(data: DataPengajuanTradeIn): Promise<string> {
    try {
      // Validasi data pengajuan
      const validasi = await this.validasiDataPengajuan(data);
      if (!validasi.valid) {
        throw new Error(validasi.pesan);
      }

      // Cek ketersediaan mobil baru
      const mobilBaruTersedia = await this.cekKetersediaanMobilBaru(data.idMobilBaru);
      if (!mobilBaruTersedia) {
        throw new Error('Mobil baru yang dipilih tidak tersedia');
      }

      // Generate ID trade-in baru
      const idTradeInBaru = this.generateId();

      // Set data trade-in
      this.idTradeIn = idTradeInBaru;
      this.idPengguna = data.idPengguna;
      this.idMobilBaru = data.idMobilBaru;
      this.dataMobilLama = JSON.stringify(data.dataMobilLama);
      this.fotoMobilLama = data.fotoMobilLama;
      this.tanggalPengajuan = new Date();
      this.statusTradeIn = 'pengajuan_diterima';

      // Lakukan estimasi harga awal
      const spesifikasiMobil: SpesifikasiMobil = {
        merk: data.dataMobilLama.merk,
        model: data.dataMobilLama.model,
        tahun: data.dataMobilLama.tahun,
        transmisi: data.dataMobilLama.transmisi,
        bahanBakar: data.dataMobilLama.bahanBakar,
        kilometer: data.dataMobilLama.kilometer,
        kondisiUmum: this.evaluasiKondisiUmum(data.dataMobilLama)
      };

      const hasilEstimasi = await this.estimasiHargaMobil(spesifikasiMobil);
      this.estimasiHarga = hasilEstimasi.hargaEstimasi;

      // Simpan ke database
      await this.simpanPengajuanDatabase();

      // Upload dan validasi foto
      await this.validasiFotoMobil(data.fotoMobilLama);

      // Setup jadwal inspeksi jika ada preferensi
      if (data.preferensiInspeksi) {
        await this.setupJadwalInspeksi(data.preferensiInspeksi);
      }

      // Kirim notifikasi pengajuan diterima
      await this.kirimNotifikasiPengajuan(data.idPengguna, idTradeInBaru);

      // Log aktivitas pengajuan
      await this.logAktivitasTradeIn(idTradeInBaru, 'pengajuan_dibuat', 'Pengajuan trade-in dibuat');

      // Update statistik pengguna
      await this.updateStatistikPengguna(data.idPengguna, 'trade_in_pengajuan');

      return idTradeInBaru;

    } catch (error) {
      throw new Error(`Gagal membuat pengajuan trade-in: ${error}`);
    }
  }

  /**
   * Melakukan estimasi harga mobil berdasarkan spesifikasi
   * @param spesifikasi - Spesifikasi mobil untuk estimasi
   * @returns Promise<HasilEstimasi> - Hasil estimasi harga
   */
  public async estimasiHargaMobil(spesifikasi: SpesifikasiMobil): Promise<HasilEstimasi> {
    try {
      // Validasi spesifikasi
      const validasi = await this.validasiSpesifikasi(spesifikasi);
      if (!validasi.valid) {
        throw new Error(validasi.pesan);
      }

      // Ambil harga pasar dasar
      const hargaPasarDasar = await this.ambilHargaPasarDasar(spesifikasi.merk, spesifikasi.model, spesifikasi.tahun);

      // Hitung faktor depresiasi berdasarkan umur
      const umurMobil = new Date().getFullYear() - spesifikasi.tahun;
      const faktorDepresiasi = await this.hitungFaktorDepresiasi(umurMobil);

      // Hitung faktor kilometer
      const faktorKilometer = await this.hitungFaktorKilometer(spesifikasi.kilometer, umurMobil);

      // Hitung faktor kondisi
      const faktorKondisi = await this.hitungFaktorKondisi(spesifikasi.kondisiUmum);

      // Hitung faktor transmisi dan bahan bakar
      const faktorTransmisi = await this.hitungFaktorTransmisi(spesifikasi.transmisi);
      const faktorBahanBakar = await this.hitungFaktorBahanBakar(spesifikasi.bahanBakar);

      // Hitung harga estimasi
      let hargaEstimasi = hargaPasarDasar;
      hargaEstimasi *= faktorDepresiasi;
      hargaEstimasi *= faktorKilometer;
      hargaEstimasi *= faktorKondisi;
      hargaEstimasi *= faktorTransmisi;
      hargaEstimasi *= faktorBahanBakar;

      // Hitung range harga (±10%)
      const hargaMinimal = hargaEstimasi * 0.9;
      const hargaMaksimal = hargaEstimasi * 1.1;

      // Generate faktor penentu
      const faktorPenentu = await this.generateFaktorPenentu(spesifikasi, {
        depresiasi: faktorDepresiasi,
        kilometer: faktorKilometer,
        kondisi: faktorKondisi,
        transmisi: faktorTransmisi,
        bahanBakar: faktorBahanBakar
      });

      // Generate rekomendasi perbaikan
      const rekomendasiPerbaikan = await this.generateRekomendasiPerbaikan(spesifikasi);

      // Set validitas estimasi (7 hari)
      const validitasEstimasi = 7;

      const hasilEstimasi: HasilEstimasi = {
        hargaEstimasi: Math.round(hargaEstimasi),
        hargaMinimal: Math.round(hargaMinimal),
        hargaMaksimal: Math.round(hargaMaksimal),
        faktorPenentu,
        rekomendasiPerbaikan,
        validitasEstimasi,
        metodePenilaian: 'Algoritma AI + Data Pasar'
      };

      // Log aktivitas estimasi
      await this.logAktivitasTradeIn(this.idTradeIn, 'estimasi_dilakukan', 'Estimasi harga mobil dilakukan');

      return hasilEstimasi;

    } catch (error) {
      throw new Error(`Gagal melakukan estimasi harga: ${error}`);
    }
  }

  /**
   * Menjadwalkan inspeksi mobil
   * @param tanggal - Tanggal inspeksi yang diinginkan
   * @returns Promise<boolean> - Status keberhasilan penjadwalan
   */
  public async jadwalkanInspeksiMobil(tanggal: Date): Promise<boolean> {
    try {
      // Validasi tanggal inspeksi
      const validasi = await this.validasiTanggalInspeksi(tanggal);
      if (!validasi.valid) {
        throw new Error(validasi.pesan);
      }

      // Cek ketersediaan jadwal
      const jadwalTersedia = await this.cekKetersediaanJadwalInspeksi(tanggal);
      if (!jadwalTersedia) {
        throw new Error('Jadwal inspeksi tidak tersedia pada tanggal tersebut');
      }

      // Cek status trade-in
      if (this.statusTradeIn !== 'pengajuan_diterima' && this.statusTradeIn !== 'menunggu_inspeksi') {
        throw new Error('Status trade-in tidak memungkinkan untuk dijadwalkan inspeksi');
      }

      // Set tanggal inspeksi
      this.tanggalInspeksi = tanggal;
      this.statusTradeIn = 'inspeksi_dijadwalkan';

      // Update database
      await this.updateStatusDatabase();

      // Assign inspektur
      const inspektur = await this.assignInspektur(tanggal);

      // Kirim notifikasi jadwal inspeksi
      await this.kirimNotifikasiJadwalInspeksi(this.idPengguna, tanggal, inspektur);

      // Setup reminder inspeksi
      await this.setupReminderInspeksi(tanggal);

      // Log aktivitas penjadwalan
      await this.logAktivitasTradeIn(this.idTradeIn, 'inspeksi_dijadwalkan', `Inspeksi dijadwalkan pada ${tanggal.toDateString()}`);

      // Update statistik inspeksi
      await this.updateStatistikInspeksi('jadwal_dibuat');

      return true;

    } catch (error) {
      throw new Error(`Gagal menjadwalkan inspeksi: ${error}`);
    }
  }

  /**
   * Generate kontrak trade-in
   * @param data - Data untuk kontrak trade-in
   * @returns Promise<string> - ID kontrak yang dibuat
   */
  public async generateKontrakTradeIn(data: any): Promise<string> {
    try {
      // Validasi data kontrak
      const validasi = await this.validasiDataKontrak(data);
      if (!validasi.valid) {
        throw new Error(validasi.pesan);
      }

      // Cek status trade-in
      if (this.statusTradeIn !== 'inspeksi_selesai') {
        throw new Error('Kontrak hanya dapat dibuat setelah inspeksi selesai');
      }

      // Ambil hasil inspeksi
      const hasilInspeksiDetail = await this.ambilHasilInspeksiDetail(this.idTradeIn);
      if (!hasilInspeksiDetail) {
        throw new Error('Hasil inspeksi tidak ditemukan');
      }

      // Hitung nilai trade-in final
      this.nilaiTradeIn = hasilInspeksiDetail.estimasiHargaFinal;

      // Ambil harga mobil baru
      const hargaMobilBaru = await this.ambilHargaMobilBaru(this.idMobilBaru);

      // Hitung selisih pembayaran
      this.selisihPembayaran = hargaMobilBaru - this.nilaiTradeIn;

      // Generate ID kontrak
      const idKontrak = this.generateKontrakId();

      // Generate syarat dan ketentuan
      const syaratKetentuan = await this.generateSyaratKetentuan();

      // Set tanggal berlaku dan expired
      const tanggalBerlaku = new Date();
      const tanggalExpired = new Date();
      tanggalExpired.setDate(tanggalExpired.getDate() + 30); // Berlaku 30 hari

      // Buat kontrak
      const kontrak: KontrakTradeIn = {
        idKontrak,
        idTradeIn: this.idTradeIn,
        nilaiTradeIn: this.nilaiTradeIn,
        selisihPembayaran: this.selisihPembayaran,
        syaratKetentuan,
        tanggalBerlaku,
        tanggalExpired,
        statusKontrak: 'draft',
        tandaTanganDigital: false
      };

      // Simpan kontrak ke database
      await this.simpanKontrakDatabase(kontrak);

      // Set kontrak ID ke instance
      this.kontrakTradeIn = idKontrak;

      // Update status trade-in
      this.statusTradeIn = 'kontrak_dibuat';
      await this.updateStatusDatabase();

      // Generate dokumen kontrak PDF
      await this.generateDokumenKontrakPDF(kontrak);

      // Kirim notifikasi kontrak siap
      await this.kirimNotifikasiKontrakSiap(this.idPengguna, idKontrak);

      // Log aktivitas pembuatan kontrak
      await this.logAktivitasTradeIn(this.idTradeIn, 'kontrak_dibuat', 'Kontrak trade-in dibuat');

      return idKontrak;

    } catch (error) {
      throw new Error(`Gagal generate kontrak trade-in: ${error}`);
    }
  }

  /**
   * Finalisasi proses trade-in
   * @param kontrak - Data kontrak yang sudah ditandatangani
   * @returns Promise<boolean> - Status keberhasilan finalisasi
   */
  public async finalisasiTradeIn(kontrak: string): Promise<boolean> {
    try {
      // Validasi kontrak
      const validasi = await this.validasiKontrakFinalisasi(kontrak);
      if (!validasi.valid) {
        throw new Error(validasi.pesan);
      }

      // Cek status trade-in
      if (this.statusTradeIn !== 'kontrak_ditandatangani') {
        throw new Error('Trade-in hanya dapat difinalisasi setelah kontrak ditandatangani');
      }

      // Ambil data kontrak
      const dataKontrak = await this.ambilDataKontrak(kontrak);
      if (!dataKontrak) {
        throw new Error('Data kontrak tidak ditemukan');
      }

      // Cek masa berlaku kontrak
      if (new Date() > dataKontrak.tanggalExpired) {
        throw new Error('Kontrak sudah expired');
      }

      // Proses transfer kepemilikan mobil lama
      await this.prosesTransferMobilLama();

      // Proses penyerahan mobil baru
      await this.prosesPenyerahanMobilBaru();

      // Proses pembayaran selisih
      if (this.selisihPembayaran > 0) {
        await this.prosesPembayaranSelisih(this.selisihPembayaran);
      } else if (this.selisihPembayaran < 0) {
        await this.prosesRefundSelisih(Math.abs(this.selisihPembayaran));
      }

      // Update status trade-in
      this.statusTradeIn = 'selesai';
      await this.updateStatusDatabase();

      // Update status kontrak
      await this.updateStatusKontrak(kontrak, 'selesai');

      // Generate dokumen serah terima
      await this.generateDokumenSerahTerima();

      // Update inventory mobil
      await this.updateInventoryMobil();

      // Kirim notifikasi finalisasi
      await this.kirimNotifikasiFinalisasi(this.idPengguna);

      // Log aktivitas finalisasi
      await this.logAktivitasTradeIn(this.idTradeIn, 'trade_in_selesai', 'Proses trade-in selesai');

      // Update statistik trade-in
      await this.updateStatistikTradeIn('selesai');

      // Setup follow-up customer satisfaction
      await this.setupFollowUpSatisfaction();

      return true;

    } catch (error) {
      throw new Error(`Gagal finalisasi trade-in: ${error}`);
    }
  }

  /**
   * Tracking status trade-in
   * @param idTradeIn - ID trade-in yang akan di-track
   * @returns Promise<StatusTracking> - Status tracking trade-in
   */
  public async trackingStatusTradeIn(idTradeIn: string): Promise<StatusTracking> {
    try {
      // Validasi ID trade-in
      if (!idTradeIn || idTradeIn.trim() === '') {
        throw new Error('ID trade-in tidak valid');
      }

      // Ambil data trade-in
      const dataTradeIn = await this.ambilDataTradeInById(idTradeIn);
      if (!dataTradeIn) {
        throw new Error('Data trade-in tidak ditemukan');
      }

      // Ambil riwayat status
      const riwayatStatus = await this.ambilRiwayatStatus(idTradeIn);

      // Hitung estimasi selesai
      const estimasiSelesai = await this.hitungEstimasiSelesai(dataTradeIn.statusTradeIn);

      // Tentukan langkah selanjutnya
      const langkahSelanjutnya = await this.tentukanLangkahSelanjutnya(dataTradeIn.statusTradeIn);

      // Ambil kontak PIC
      const kontakPIC = await this.ambilKontakPIC(dataTradeIn.statusTradeIn);

      const statusTracking: StatusTracking = {
        idTradeIn,
        statusSaatIni: dataTradeIn.statusTradeIn,
        riwayatStatus,
        estimasiSelesai,
        langkahSelanjutnya,
        kontakPIC
      };

      // Log aktivitas tracking
      await this.logAktivitasTradeIn(idTradeIn, 'status_ditrack', 'Status trade-in di-track');

      return statusTracking;

    } catch (error) {
      throw new Error(`Gagal tracking status trade-in: ${error}`);
    }
  }

  // Private helper methods

  private generateId(): string {
    return 'TI' + Date.now().toString() + Math.random().toString(36).substr(2, 5);
  }

  private generateKontrakId(): string {
    return 'KTI' + Date.now().toString() + Math.random().toString(36).substr(2, 5);
  }

  private async simulasiDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async validasiDataPengajuan(data: DataPengajuanTradeIn): Promise<ResponValidasi> {
    await this.simulasiDelay(200);

    // Validasi ID pengguna
    if (!data.idPengguna || data.idPengguna.trim() === '') {
      return { valid: false, pesan: 'ID pengguna harus diisi' };
    }

    // Validasi ID mobil baru
    if (!data.idMobilBaru || data.idMobilBaru.trim() === '') {
      return { valid: false, pesan: 'ID mobil baru harus diisi' };
    }

    // Validasi data mobil lama
    if (!data.dataMobilLama.merk || !data.dataMobilLama.model) {
      return { valid: false, pesan: 'Merk dan model mobil lama harus diisi' };
    }

    if (data.dataMobilLama.tahun < 1990 || data.dataMobilLama.tahun > new Date().getFullYear()) {
      return { valid: false, pesan: 'Tahun mobil tidak valid' };
    }

    // Validasi foto
    if (!data.fotoMobilLama || data.fotoMobilLama.length < 3) {
      return { valid: false, pesan: 'Minimal 3 foto mobil lama diperlukan' };
    }

    return { valid: true, pesan: 'Data pengajuan valid' };
  }

  private evaluasiKondisiUmum(dataMobil: DataMobilLama): string {
    // Evaluasi kondisi umum berdasarkan data mobil
    let skor = 10;

    // Faktor kilometer
    if (dataMobil.kilometer > 200000) skor -= 3;
    else if (dataMobil.kilometer > 100000) skor -= 2;
    else if (dataMobil.kilometer > 50000) skor -= 1;

    // Faktor riwayat kecelakaan
    if (dataMobil.riwayatKecelakaan) skor -= 2;

    // Faktor kondisi komponen
    if (dataMobil.kondisiMesin === 'kurang' || dataMobil.kondisiMesin === 'buruk') skor -= 2;
    if (dataMobil.kondisiBodi === 'kurang' || dataMobil.kondisiBodi === 'buruk') skor -= 1;
    if (dataMobil.kondisiInterior === 'kurang' || dataMobil.kondisiInterior === 'buruk') skor -= 1;

    // Konversi skor ke kondisi
    if (skor >= 9) return 'sangat baik';
    if (skor >= 7) return 'baik';
    if (skor >= 5) return 'cukup';
    if (skor >= 3) return 'kurang';
    return 'buruk';
  }

  private async cekKetersediaanMobilBaru(idMobil: string): Promise<boolean> {
    await this.simulasiDelay(200);
    // Simulasi pengecekan ketersediaan mobil baru
    return Math.random() > 0.1; // 90% kemungkinan tersedia
  }

  private async simpanPengajuanDatabase(): Promise<void> {
    await this.simulasiDelay(400);
    // Simulasi penyimpanan ke database
  }

  private async validasiFotoMobil(foto: string[]): Promise<void> {
    await this.simulasiDelay(300);
    // Simulasi validasi foto mobil
  }

  private async setupJadwalInspeksi(preferensi: PreferensiInspeksi): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi setup jadwal inspeksi
  }

  private async kirimNotifikasiPengajuan(idPengguna: string, idTradeIn: string): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi pengiriman notifikasi
  }

  private async logAktivitasTradeIn(idTradeIn: string, tipeAktivitas: string, deskripsi: string): Promise<void> {
    await this.simulasiDelay(100);
    // Simulasi logging aktivitas
  }

  private async updateStatistikPengguna(idPengguna: string, tipeAktivitas: string): Promise<void> {
    await this.simulasiDelay(100);
    // Simulasi update statistik pengguna
  }

  private async validasiSpesifikasi(spesifikasi: SpesifikasiMobil): Promise<ResponValidasi> {
    await this.simulasiDelay(100);

    if (!spesifikasi.merk || !spesifikasi.model) {
      return { valid: false, pesan: 'Merk dan model harus diisi' };
    }

    if (spesifikasi.tahun < 1990 || spesifikasi.tahun > new Date().getFullYear()) {
      return { valid: false, pesan: 'Tahun tidak valid' };
    }

    if (spesifikasi.kilometer < 0) {
      return { valid: false, pesan: 'Kilometer tidak boleh negatif' };
    }

    return { valid: true, pesan: 'Spesifikasi valid' };
  }

  private async ambilHargaPasarDasar(merk: string, model: string, tahun: number): Promise<number> {
    await this.simulasiDelay(300);

    // Simulasi harga pasar dasar berdasarkan merk, model, dan tahun
    const hargaBase: { [key: string]: { [key: string]: number } } = {
      'Toyota': { 'Avanza': 150000000, 'Innova': 250000000, 'Fortuner': 450000000 },
      'Honda': { 'Brio': 120000000, 'Jazz': 180000000, 'CR-V': 350000000 },
      'Daihatsu': { 'Ayla': 100000000, 'Xenia': 140000000, 'Terios': 200000000 }
    };

    const hargaMerk = hargaBase[merk] || hargaBase['Toyota'];
    const hargaModel = hargaMerk[model] || hargaMerk['Avanza'];

    // Adjust berdasarkan tahun (harga baru)
    const tahunSekarang = new Date().getFullYear();
    const selisihTahun = tahunSekarang - tahun;
    
    return hargaModel * (1 + (selisihTahun * 0.05)); // Asumsi kenaikan 5% per tahun untuk harga baru
  }

  private async hitungFaktorDepresiasi(umurMobil: number): Promise<number> {
    await this.simulasiDelay(100);

    // Depresiasi berdasarkan umur mobil
    if (umurMobil <= 1) return 0.85; // 15% depresiasi tahun pertama
    if (umurMobil <= 3) return 0.75; // 25% depresiasi 3 tahun pertama
    if (umurMobil <= 5) return 0.65; // 35% depresiasi 5 tahun pertama
    if (umurMobil <= 10) return 0.50; // 50% depresiasi 10 tahun pertama
    return 0.35; // 65% depresiasi setelah 10 tahun
  }

  private async hitungFaktorKilometer(kilometer: number, umurMobil: number): Promise<number> {
    await this.simulasiDelay(100);

    // Rata-rata kilometer per tahun yang wajar: 15,000 km
    const kilometerWajar = umurMobil * 15000;
    
    if (kilometer <= kilometerWajar * 0.7) return 1.05; // Kilometer rendah, bonus
    if (kilometer <= kilometerWajar) return 1.0; // Kilometer normal
    if (kilometer <= kilometerWajar * 1.5) return 0.95; // Kilometer agak tinggi
    if (kilometer <= kilometerWajar * 2) return 0.85; // Kilometer tinggi
    return 0.75; // Kilometer sangat tinggi
  }

  private async hitungFaktorKondisi(kondisi: string): Promise<number> {
    await this.simulasiDelay(100);

    const faktorKondisi = {
      'sangat baik': 1.1,
      'baik': 1.0,
      'cukup': 0.9,
      'kurang': 0.8,
      'buruk': 0.6
    };

    return faktorKondisi[kondisi as keyof typeof faktorKondisi] || 0.9;
  }

  private async hitungFaktorTransmisi(transmisi: string): Promise<number> {
    await this.simulasiDelay(100);

    // Transmisi otomatis biasanya lebih diminati
    return transmisi.toLowerCase().includes('otomatis') || transmisi.toLowerCase().includes('automatic') ? 1.05 : 1.0;
  }

  private async hitungFaktorBahanBakar(bahanBakar: string): Promise<number> {
    await this.simulasiDelay(100);

    const faktorBahanBakar = {
      'bensin': 1.0,
      'solar': 0.95,
      'diesel': 0.95,
      'hybrid': 1.1,
      'listrik': 1.15
    };

    return faktorBahanBakar[bahanBakar.toLowerCase() as keyof typeof faktorBahanBakar] || 1.0;
  }

  private async generateFaktorPenentu(spesifikasi: SpesifikasiMobil, faktor: any): Promise<FaktorPenentu[]> {
    await this.simulasiDelay(200);

    const faktorPenentu: FaktorPenentu[] = [];

    // Faktor umur
    const umurMobil = new Date().getFullYear() - spesifikasi.tahun;
    faktorPenentu.push({
      faktor: 'Umur Kendaraan',
      pengaruh: umurMobil <= 3 ? 'positif' : 'negatif',
      persentase: Math.abs((faktor.depresiasi - 1) * 100),
      deskripsi: `Mobil berumur ${umurMobil} tahun`
    });

    // Faktor kilometer
    faktorPenentu.push({
      faktor: 'Kilometer Tempuh',
      pengaruh: faktor.kilometer >= 1 ? 'positif' : 'negatif',
      persentase: Math.abs((faktor.kilometer - 1) * 100),
      deskripsi: `${spesifikasi.kilometer.toLocaleString()} km`
    });

    // Faktor kondisi
    faktorPenentu.push({
      faktor: 'Kondisi Umum',
      pengaruh: faktor.kondisi >= 1 ? 'positif' : 'negatif',
      persentase: Math.abs((faktor.kondisi - 1) * 100),
      deskripsi: `Kondisi ${spesifikasi.kondisiUmum}`
    });

    return faktorPenentu;
  }

  private async generateRekomendasiPerbaikan(spesifikasi: SpesifikasiMobil): Promise<string[]> {
    await this.simulasiDelay(200);

    const rekomendasi: string[] = [];

    if (spesifikasi.kilometer > 100000) {
      rekomendasi.push('Service berkala dan ganti oli mesin');
    }

    if (spesifikasi.kondisiUmum === 'cukup' || spesifikasi.kondisiUmum === 'kurang') {
      rekomendasi.push('Perbaikan minor untuk meningkatkan kondisi');
      rekomendasi.push('Pembersihan interior dan eksterior');
    }

    if (spesifikasi.kondisiUmum === 'buruk') {
      rekomendasi.push('Perbaikan mayor diperlukan');
      rekomendasi.push('Konsultasi dengan mekanik profesional');
    }

    return rekomendasi;
  }

  private async validasiTanggalInspeksi(tanggal: Date): Promise<ResponValidasi> {
    await this.simulasiDelay(100);

    const sekarang = new Date();
    const besok = new Date(sekarang);
    besok.setDate(besok.getDate() + 1);

    if (tanggal < besok) {
      return { valid: false, pesan: 'Tanggal inspeksi minimal H+1' };
    }

    const maxTanggal = new Date(sekarang);
    maxTanggal.setDate(maxTanggal.getDate() + 30);

    if (tanggal > maxTanggal) {
      return { valid: false, pesan: 'Tanggal inspeksi maksimal 30 hari ke depan' };
    }

    return { valid: true, pesan: 'Tanggal inspeksi valid' };
  }

  private async cekKetersediaanJadwalInspeksi(tanggal: Date): Promise<boolean> {
    await this.simulasiDelay(200);
    // Simulasi pengecekan ketersediaan jadwal
    return Math.random() > 0.2; // 80% kemungkinan tersedia
  }

  private async updateStatusDatabase(): Promise<void> {
    await this.simulasiDelay(300);
    // Simulasi update status ke database
  }

  private async assignInspektur(tanggal: Date): Promise<string> {
    await this.simulasiDelay(200);
    // Simulasi assign inspektur
    const inspekturList = ['Budi Santoso', 'Andi Wijaya', 'Sari Indah'];
    return inspekturList[Math.floor(Math.random() * inspekturList.length)];
  }

  private async kirimNotifikasiJadwalInspeksi(idPengguna: string, tanggal: Date, inspektur: string): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi pengiriman notifikasi jadwal inspeksi
  }

  private async setupReminderInspeksi(tanggal: Date): Promise<void> {
    await this.simulasiDelay(100);
    // Simulasi setup reminder inspeksi
  }

  private async updateStatistikInspeksi(tipeAktivitas: string): Promise<void> {
    await this.simulasiDelay(100);
    // Simulasi update statistik inspeksi
  }

  private async validasiDataKontrak(data: any): Promise<ResponValidasi> {
    await this.simulasiDelay(100);

    if (!data) {
      return { valid: false, pesan: 'Data kontrak tidak boleh kosong' };
    }

    return { valid: true, pesan: 'Data kontrak valid' };
  }

  private async ambilHasilInspeksiDetail(idTradeIn: string): Promise<HasilInspeksiDetail | null> {
    await this.simulasiDelay(300);

    // Simulasi hasil inspeksi detail
    return {
      idInspeksi: 'INS' + Date.now(),
      tanggalInspeksi: new Date(),
      inspektur: 'Budi Santoso',
      lokasiInspeksi: 'Showroom Mobilindo',
      kondisiMesin: { skor: 8, kondisi: 'baik', catatan: 'Mesin dalam kondisi baik', fotoEvidence: [] },
      kondisiBodi: { skor: 7, kondisi: 'baik', catatan: 'Bodi sedikit lecet', fotoEvidence: [] },
      kondisiInterior: { skor: 8, kondisi: 'baik', catatan: 'Interior terawat', fotoEvidence: [] },
      kondisiElektrikal: { skor: 9, kondisi: 'sangat baik', catatan: 'Sistem elektrik normal', fotoEvidence: [] },
      kondisiSuspensi: { skor: 7, kondisi: 'baik', catatan: 'Suspensi masih bagus', fotoEvidence: [] },
      kondisiRem: { skor: 8, kondisi: 'baik', catatan: 'Rem berfungsi normal', fotoEvidence: [] },
      kelengkapanSurat: true,
      fotoInspeksi: [],
      catatanInspektur: 'Mobil dalam kondisi baik secara keseluruhan',
      nilaiAkhir: 8,
      rekomendasiPerbaikan: ['Service berkala'],
      estimasiHargaFinal: this.estimasiHarga * 0.95 // Sedikit penyesuaian dari estimasi awal
    };
  }

  private async ambilHargaMobilBaru(idMobil: string): Promise<number> {
    await this.simulasiDelay(200);
    // Simulasi harga mobil baru
    return 300000000; // 300 juta
  }

  private async generateSyaratKetentuan(): Promise<string[]> {
    await this.simulasiDelay(200);

    return [
      'Mobil lama harus dalam kondisi sesuai hasil inspeksi',
      'Surat-surat kendaraan harus lengkap dan asli',
      'Tidak ada tunggakan pajak atau tilang',
      'Kontrak berlaku selama 30 hari',
      'Pembayaran selisih dapat dilakukan tunai atau kredit',
      'Penyerahan kendaraan maksimal 7 hari setelah kontrak ditandatangani'
    ];
  }

  private async simpanKontrakDatabase(kontrak: KontrakTradeIn): Promise<void> {
    await this.simulasiDelay(400);
    // Simulasi penyimpanan kontrak ke database
  }

  private async generateDokumenKontrakPDF(kontrak: KontrakTradeIn): Promise<void> {
    await this.simulasiDelay(500);
    // Simulasi generate dokumen PDF
  }

  private async kirimNotifikasiKontrakSiap(idPengguna: string, idKontrak: string): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi pengiriman notifikasi kontrak siap
  }

  private async validasiKontrakFinalisasi(kontrak: string): Promise<ResponValidasi> {
    await this.simulasiDelay(100);

    if (!kontrak || kontrak.trim() === '') {
      return { valid: false, pesan: 'ID kontrak tidak valid' };
    }

    return { valid: true, pesan: 'Kontrak valid untuk finalisasi' };
  }

  private async ambilDataKontrak(idKontrak: string): Promise<KontrakTradeIn | null> {
    await this.simulasiDelay(200);

    // Simulasi data kontrak
    return {
      idKontrak,
      idTradeIn: this.idTradeIn,
      nilaiTradeIn: this.nilaiTradeIn,
      selisihPembayaran: this.selisihPembayaran,
      syaratKetentuan: [],
      tanggalBerlaku: new Date(),
      tanggalExpired: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      statusKontrak: 'ditandatangani',
      tandaTanganDigital: true
    };
  }

  private async prosesTransferMobilLama(): Promise<void> {
    await this.simulasiDelay(500);
    // Simulasi proses transfer kepemilikan mobil lama
  }

  private async prosesPenyerahanMobilBaru(): Promise<void> {
    await this.simulasiDelay(500);
    // Simulasi proses penyerahan mobil baru
  }

  private async prosesPembayaranSelisih(jumlah: number): Promise<void> {
    await this.simulasiDelay(400);
    // Simulasi proses pembayaran selisih
  }

  private async prosesRefundSelisih(jumlah: number): Promise<void> {
    await this.simulasiDelay(400);
    // Simulasi proses refund selisih
  }

  private async updateStatusKontrak(idKontrak: string, status: string): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi update status kontrak
  }

  private async generateDokumenSerahTerima(): Promise<void> {
    await this.simulasiDelay(400);
    // Simulasi generate dokumen serah terima
  }

  private async updateInventoryMobil(): Promise<void> {
    await this.simulasiDelay(300);
    // Simulasi update inventory mobil
  }

  private async kirimNotifikasiFinalisasi(idPengguna: string): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi pengiriman notifikasi finalisasi
  }

  private async updateStatistikTradeIn(status: string): Promise<void> {
    await this.simulasiDelay(100);
    // Simulasi update statistik trade-in
  }

  private async setupFollowUpSatisfaction(): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi setup follow-up customer satisfaction
  }

  private async ambilDataTradeInById(idTradeIn: string): Promise<DataTradeIn | null> {
    await this.simulasiDelay(200);

    // Simulasi data trade-in
    return {
      idTradeIn,
      idPengguna: this.idPengguna,
      idMobilBaru: this.idMobilBaru,
      dataMobilLama: this.dataMobilLama,
      estimasiHarga: this.estimasiHarga,
      statusTradeIn: this.statusTradeIn,
      tanggalPengajuan: this.tanggalPengajuan,
      tanggalInspeksi: this.tanggalInspeksi,
      hasilInspeksi: this.hasilInspeksi,
      fotoMobilLama: this.fotoMobilLama,
      kontrakTradeIn: this.kontrakTradeIn,
      nilaiTradeIn: this.nilaiTradeIn,
      selisihPembayaran: this.selisihPembayaran
    };
  }

  private async ambilRiwayatStatus(idTradeIn: string): Promise<RiwayatStatus[]> {
    await this.simulasiDelay(200);

    // Simulasi riwayat status
    return [
      {
        status: 'pengajuan_diterima',
        tanggal: new Date('2024-01-15'),
        keterangan: 'Pengajuan trade-in diterima',
        petugas: 'System'
      },
      {
        status: 'inspeksi_dijadwalkan',
        tanggal: new Date('2024-01-16'),
        keterangan: 'Inspeksi dijadwalkan',
        petugas: 'Admin Trade-In'
      }
    ];
  }

  private async hitungEstimasiSelesai(status: string): Promise<Date> {
    await this.simulasiDelay(100);

    const sekarang = new Date();
    const estimasi = new Date(sekarang);

    switch (status) {
      case 'pengajuan_diterima':
        estimasi.setDate(estimasi.getDate() + 14); // 14 hari
        break;
      case 'inspeksi_dijadwalkan':
        estimasi.setDate(estimasi.getDate() + 10); // 10 hari
        break;
      case 'inspeksi_selesai':
        estimasi.setDate(estimasi.getDate() + 7); // 7 hari
        break;
      case 'kontrak_dibuat':
        estimasi.setDate(estimasi.getDate() + 5); // 5 hari
        break;
      default:
        estimasi.setDate(estimasi.getDate() + 3); // 3 hari
    }

    return estimasi;
  }

  private async tentukanLangkahSelanjutnya(status: string): Promise<string> {
    await this.simulasiDelay(100);

    const langkah = {
      'pengajuan_diterima': 'Menunggu penjadwalan inspeksi',
      'inspeksi_dijadwalkan': 'Menunggu pelaksanaan inspeksi',
      'inspeksi_selesai': 'Menunggu pembuatan kontrak',
      'kontrak_dibuat': 'Menunggu penandatanganan kontrak',
      'kontrak_ditandatangani': 'Menunggu finalisasi trade-in',
      'selesai': 'Proses trade-in selesai'
    };

    return langkah[status as keyof typeof langkah] || 'Status tidak dikenali';
  }

  private async ambilKontakPIC(status: string): Promise<string> {
    await this.simulasiDelay(100);

    const kontak = {
      'pengajuan_diterima': 'Admin Trade-In: 0812-3456-7890',
      'inspeksi_dijadwalkan': 'Inspektur: 0813-4567-8901',
      'inspeksi_selesai': 'Manager Trade-In: 0814-5678-9012',
      'kontrak_dibuat': 'Legal Officer: 0815-6789-0123',
      'kontrak_ditandatangani': 'Finance Officer: 0816-7890-1234',
      'selesai': 'Customer Service: 0817-8901-2345'
    };

    return kontak[status as keyof typeof kontak] || 'Customer Service: 0817-8901-2345';
  }

  // Public method untuk mendapatkan data lengkap
  public toJSON(): DataTradeIn {
    return {
      idTradeIn: this.idTradeIn,
      idPengguna: this.idPengguna,
      idMobilBaru: this.idMobilBaru,
      dataMobilLama: this.dataMobilLama,
      estimasiHarga: this.estimasiHarga,
      statusTradeIn: this.statusTradeIn,
      tanggalPengajuan: this.tanggalPengajuan,
      tanggalInspeksi: this.tanggalInspeksi,
      hasilInspeksi: this.hasilInspeksi,
      fotoMobilLama: this.fotoMobilLama,
      kontrakTradeIn: this.kontrakTradeIn,
      nilaiTradeIn: this.nilaiTradeIn,
      selisihPembayaran: this.selisihPembayaran
    };
  }
}

export type StatusTradeIn = 'draft' | 'pengajuan_diterima' | 'menunggu_inspeksi' | 'inspeksi_dijadwalkan' | 'inspeksi_selesai' | 'kontrak_dibuat' | 'kontrak_ditandatangani' | 'selesai';

export default EntitasTradeIn;