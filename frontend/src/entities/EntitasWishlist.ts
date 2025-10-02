// ==================== ENTITAS WISHLIST ====================
// Kelas untuk mengelola data dan operasi wishlist pengguna
// Mengatur daftar mobil favorit dan notifikasi harga

// Interface untuk data wishlist
export interface DataWishlist {
  idWishlist: string;
  idPengguna: string;
  idMobil: string;
  tanggalDitambahkan: Date;
  catatan: string;
  prioritas: number;
  statusAktif: boolean;
  isNotificationEnabled: boolean;
  lastPriceCheck: Date;
  currentPrice: number;
}

// Interface untuk data wishlist baru
export interface DataWishlistBaru {
  idPengguna: string;
  idMobil: string;
  catatan?: string;
  prioritas?: number;
  isNotificationEnabled?: boolean;
}

// Interface untuk response validasi
export interface ResponValidasi {
  valid: boolean;
  pesan: string;
}

// Interface untuk data mobil dalam wishlist
export interface DataMobilWishlist {
  idMobil: string;
  merk: string;
  model: string;
  tahun: number;
  harga: number;
  gambar: string;
  statusKetersediaan: string;
  perubahanHarga: {
    hargaSebelumnya: number;
    persentasePerubahan: number;
    trendHarga: 'naik' | 'turun' | 'stabil';
  };
}

// Interface untuk wishlist dengan detail mobil
export interface WishlistDenganDetail {
  wishlist: DataWishlist;
  mobilDetail: DataMobilWishlist;
  rekomendasi: string[];
  alertHarga: boolean;
}

class EntitasWishlist {
  // Attributes
  private idWishlist: string;
  private idPengguna: string;
  private idMobil: string;
  private tanggalDitambahkan: Date;
  private catatan: string;
  private prioritas: number;
  private statusAktif: boolean;
  private isNotificationEnabled: boolean;
  private lastPriceCheck: Date;
  private currentPrice: number;

  constructor(data?: Partial<DataWishlist>) {
    this.idWishlist = data?.idWishlist || this.generateId();
    this.idPengguna = data?.idPengguna || '';
    this.idMobil = data?.idMobil || '';
    this.tanggalDitambahkan = data?.tanggalDitambahkan || new Date();
    this.catatan = data?.catatan || '';
    this.prioritas = data?.prioritas || 1;
    this.statusAktif = data?.statusAktif !== undefined ? data.statusAktif : true;
    this.isNotificationEnabled = data?.isNotificationEnabled !== undefined ? data.isNotificationEnabled : true;
    this.lastPriceCheck = data?.lastPriceCheck || new Date();
    this.currentPrice = data?.currentPrice || 0;
  }

  // Methods

  /**
   * Mencari wishlist berdasarkan ID pengguna
   * @param idPengguna - ID pengguna
   * @returns Promise<WishlistDenganDetail[]> - Daftar wishlist dengan detail mobil
   */
  public async cariWishlistBerdasarkanPengguna(idPengguna: string): Promise<WishlistDenganDetail[]> {
    try {
      // Validasi ID pengguna
      if (!idPengguna || idPengguna.trim() === '') {
        throw new Error('ID pengguna tidak valid');
      }

      // Simulasi pengambilan data dari database
      await this.simulasiDelay(300);

      // Ambil data wishlist pengguna
      const dataWishlist = await this.ambilWishlistDariDatabase(idPengguna);

      // Ambil detail mobil untuk setiap wishlist
      const wishlistDenganDetail: WishlistDenganDetail[] = [];

      for (const wishlist of dataWishlist) {
        // Ambil detail mobil
        const mobilDetail = await this.ambilDetailMobil(wishlist.idMobil);

        // Update harga terkini
        const hargaTerkini = await this.cekHargaTerkini(wishlist.idMobil);
        wishlist.currentPrice = hargaTerkini;
        wishlist.lastPriceCheck = new Date();

        // Generate rekomendasi
        const rekomendasi = await this.generateRekomendasi(wishlist, mobilDetail);

        // Cek alert harga
        const alertHarga = await this.cekAlertHarga(wishlist, mobilDetail);

        wishlistDenganDetail.push({
          wishlist,
          mobilDetail,
          rekomendasi,
          alertHarga
        });
      }

      // Urutkan berdasarkan prioritas dan tanggal
      wishlistDenganDetail.sort((a, b) => {
        if (a.wishlist.prioritas !== b.wishlist.prioritas) {
          return b.wishlist.prioritas - a.wishlist.prioritas; // Prioritas tinggi dulu
        }
        return b.wishlist.tanggalDitambahkan.getTime() - a.wishlist.tanggalDitambahkan.getTime(); // Terbaru dulu
      });

      // Update statistik pengguna
      await this.updateStatistikWishlist(idPengguna, wishlistDenganDetail.length);

      return wishlistDenganDetail;

    } catch (error) {
      throw new Error(`Gagal mencari wishlist: ${error}`);
    }
  }

  /**
   * Menyimpan data wishlist baru ke database
   * @param dataWishlistBaru - Data wishlist baru
   * @returns Promise<string> - ID wishlist yang dibuat
   */
  public async simpanKeDatabase(dataWishlistBaru: DataWishlistBaru): Promise<string> {
    try {
      // Validasi data wishlist baru
      const validasi = await this.validasiDataWishlist(dataWishlistBaru);
      if (!validasi.valid) {
        throw new Error(validasi.pesan);
      }

      // Cek apakah mobil sudah ada di wishlist pengguna
      const sudahAda = await this.cekMobilSudahDiWishlist(dataWishlistBaru.idPengguna, dataWishlistBaru.idMobil);
      if (sudahAda) {
        throw new Error('Mobil sudah ada dalam wishlist Anda');
      }

      // Cek batas maksimal wishlist
      const jumlahWishlist = await this.hitungJumlahWishlist(dataWishlistBaru.idPengguna);
      if (jumlahWishlist >= 50) { // Batas maksimal 50 item
        throw new Error('Wishlist Anda sudah mencapai batas maksimal (50 item)');
      }

      // Generate ID baru
      const idWishlistBaru = this.generateId();

      // Ambil harga mobil saat ini
      const hargaMobil = await this.cekHargaTerkini(dataWishlistBaru.idMobil);

      // Set data wishlist
      this.idWishlist = idWishlistBaru;
      this.idPengguna = dataWishlistBaru.idPengguna;
      this.idMobil = dataWishlistBaru.idMobil;
      this.tanggalDitambahkan = new Date();
      this.catatan = dataWishlistBaru.catatan || '';
      this.prioritas = dataWishlistBaru.prioritas || 1;
      this.statusAktif = true;
      this.isNotificationEnabled = dataWishlistBaru.isNotificationEnabled !== undefined ? dataWishlistBaru.isNotificationEnabled : true;
      this.lastPriceCheck = new Date();
      this.currentPrice = hargaMobil;

      // Simulasi penyimpanan ke database
      await this.simpanWishlistDatabase();

      // Setup notifikasi harga jika diaktifkan
      if (this.isNotificationEnabled) {
        await this.setupNotifikasiHarga(idWishlistBaru);
      }

      // Log aktivitas
      await this.logAktivitas(idWishlistBaru, 'wishlist_ditambahkan', 'Item baru ditambahkan ke wishlist');

      // Update statistik pengguna
      await this.updateStatistikPengguna(dataWishlistBaru.idPengguna, 'tambah_wishlist');

      return idWishlistBaru;

    } catch (error) {
      throw new Error(`Gagal menyimpan wishlist: ${error}`);
    }
  }

  /**
   * Menghapus item dari database wishlist
   * @param idWishlist - ID wishlist yang akan dihapus
   * @returns Promise<boolean> - Status keberhasilan penghapusan
   */
  public async hapusDariDatabase(idWishlist: string): Promise<boolean> {
    try {
      // Validasi ID wishlist
      if (!idWishlist || idWishlist.trim() === '') {
        throw new Error('ID wishlist tidak valid');
      }

      // Ambil data wishlist sebelum dihapus
      const dataWishlist = await this.ambilDataWishlistById(idWishlist);
      if (!dataWishlist) {
        throw new Error('Data wishlist tidak ditemukan');
      }

      // Validasi kepemilikan (opsional, tergantung implementasi keamanan)
      const validasiKepemilikan = await this.validasiKepemilikanWishlist(idWishlist, dataWishlist.idPengguna);
      if (!validasiKepemilikan.valid) {
        throw new Error(validasiKepemilikan.pesan);
      }

      // Backup data sebelum dihapus
      await this.backupDataWishlist(dataWishlist);

      // Hapus dari database
      await this.hapusWishlistDatabase(idWishlist);

      // Hapus notifikasi terkait
      if (dataWishlist.isNotificationEnabled) {
        await this.hapusNotifikasiHarga(idWishlist);
      }

      // Log aktivitas penghapusan
      await this.logAktivitas(idWishlist, 'wishlist_dihapus', 'Item dihapus dari wishlist');

      // Update statistik pengguna
      await this.updateStatistikPengguna(dataWishlist.idPengguna, 'hapus_wishlist');

      // Kirim konfirmasi ke pengguna
      await this.kirimKonfirmasiPenghapusan(dataWishlist.idPengguna, idWishlist);

      return true;

    } catch (error) {
      throw new Error(`Gagal menghapus wishlist: ${error}`);
    }
  }

  // Private helper methods

  private generateId(): string {
    return 'WL' + Date.now().toString() + Math.random().toString(36).substr(2, 5);
  }

  private async simulasiDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async validasiDataWishlist(data: DataWishlistBaru): Promise<ResponValidasi> {
    await this.simulasiDelay(200);

    // Validasi ID pengguna
    if (!data.idPengguna || data.idPengguna.trim() === '') {
      return { valid: false, pesan: 'ID pengguna harus diisi' };
    }

    // Validasi ID mobil
    if (!data.idMobil || data.idMobil.trim() === '') {
      return { valid: false, pesan: 'ID mobil harus diisi' };
    }

    // Validasi prioritas
    if (data.prioritas !== undefined && (data.prioritas < 1 || data.prioritas > 5)) {
      return { valid: false, pesan: 'Prioritas harus antara 1-5' };
    }

    // Validasi catatan (opsional)
    if (data.catatan && data.catatan.length > 500) {
      return { valid: false, pesan: 'Catatan tidak boleh lebih dari 500 karakter' };
    }

    return { valid: true, pesan: 'Data wishlist valid' };
  }

  private async ambilWishlistDariDatabase(idPengguna: string): Promise<DataWishlist[]> {
    await this.simulasiDelay(300);

    // Simulasi data wishlist
    return [
      {
        idWishlist: 'WL001',
        idPengguna: idPengguna,
        idMobil: 'CAR001',
        tanggalDitambahkan: new Date('2024-01-15'),
        catatan: 'Mobil impian untuk keluarga',
        prioritas: 5,
        statusAktif: true,
        isNotificationEnabled: true,
        lastPriceCheck: new Date(),
        currentPrice: 250000000
      },
      {
        idWishlist: 'WL002',
        idPengguna: idPengguna,
        idMobil: 'CAR002',
        tanggalDitambahkan: new Date('2024-01-10'),
        catatan: 'Untuk upgrade mobil lama',
        prioritas: 3,
        statusAktif: true,
        isNotificationEnabled: false,
        lastPriceCheck: new Date(),
        currentPrice: 180000000
      }
    ];
  }

  private async ambilDetailMobil(idMobil: string): Promise<DataMobilWishlist> {
    await this.simulasiDelay(200);

    // Simulasi detail mobil
    return {
      idMobil: idMobil,
      merk: 'Toyota',
      model: 'Avanza',
      tahun: 2023,
      harga: 250000000,
      gambar: '/images/toyota-avanza.jpg',
      statusKetersediaan: 'tersedia',
      perubahanHarga: {
        hargaSebelumnya: 245000000,
        persentasePerubahan: 2.04,
        trendHarga: 'naik'
      }
    };
  }

  private async cekHargaTerkini(idMobil: string): Promise<number> {
    await this.simulasiDelay(200);
    
    // Simulasi pengecekan harga terkini
    const hargaBase = 250000000;
    const fluktuasi = (Math.random() - 0.5) * 0.1; // Fluktuasi ±5%
    return Math.round(hargaBase * (1 + fluktuasi));
  }

  private async generateRekomendasi(wishlist: DataWishlist, mobilDetail: DataMobilWishlist): Promise<string[]> {
    await this.simulasiDelay(200);

    const rekomendasi: string[] = [];

    // Rekomendasi berdasarkan trend harga
    if (mobilDetail.perubahanHarga.trendHarga === 'turun') {
      rekomendasi.push('Harga sedang turun, waktu yang tepat untuk membeli!');
    } else if (mobilDetail.perubahanHarga.trendHarga === 'naik') {
      rekomendasi.push('Harga sedang naik, pertimbangkan untuk segera membeli');
    }

    // Rekomendasi berdasarkan ketersediaan
    if (mobilDetail.statusKetersediaan === 'terbatas') {
      rekomendasi.push('Stok terbatas, segera hubungi dealer');
    }

    // Rekomendasi berdasarkan prioritas
    if (wishlist.prioritas >= 4) {
      rekomendasi.push('Item prioritas tinggi, jadwalkan test drive');
    }

    return rekomendasi;
  }

  private async cekAlertHarga(wishlist: DataWishlist, mobilDetail: DataMobilWishlist): Promise<boolean> {
    await this.simulasiDelay(100);

    // Alert jika harga turun lebih dari 3%
    return mobilDetail.perubahanHarga.trendHarga === 'turun' && 
           Math.abs(mobilDetail.perubahanHarga.persentasePerubahan) > 3;
  }

  private async cekMobilSudahDiWishlist(idPengguna: string, idMobil: string): Promise<boolean> {
    await this.simulasiDelay(200);
    
    // Simulasi pengecekan duplikasi
    return Math.random() < 0.1; // 10% kemungkinan sudah ada
  }

  private async hitungJumlahWishlist(idPengguna: string): Promise<number> {
    await this.simulasiDelay(100);
    
    // Simulasi penghitungan jumlah wishlist
    return Math.floor(Math.random() * 10); // 0-9 item
  }

  private async simpanWishlistDatabase(): Promise<void> {
    await this.simulasiDelay(300);
    // Simulasi penyimpanan ke database
  }

  private async setupNotifikasiHarga(idWishlist: string): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi setup notifikasi harga
  }

  private async logAktivitas(idWishlist: string, tipeAktivitas: string, deskripsi: string): Promise<void> {
    await this.simulasiDelay(100);
    // Simulasi logging aktivitas
  }

  private async updateStatistikPengguna(idPengguna: string, tipeAktivitas: string): Promise<void> {
    await this.simulasiDelay(100);
    // Simulasi update statistik pengguna
  }

  private async updateStatistikWishlist(idPengguna: string, jumlahItem: number): Promise<void> {
    await this.simulasiDelay(100);
    // Simulasi update statistik wishlist
  }

  private async ambilDataWishlistById(idWishlist: string): Promise<DataWishlist | null> {
    await this.simulasiDelay(200);

    // Simulasi data wishlist
    return {
      idWishlist: idWishlist,
      idPengguna: 'USR001',
      idMobil: 'CAR001',
      tanggalDitambahkan: new Date(),
      catatan: 'Mobil impian',
      prioritas: 5,
      statusAktif: true,
      isNotificationEnabled: true,
      lastPriceCheck: new Date(),
      currentPrice: 250000000
    };
  }

  private async validasiKepemilikanWishlist(idWishlist: string, idPengguna: string): Promise<ResponValidasi> {
    await this.simulasiDelay(100);

    // Simulasi validasi kepemilikan
    return { valid: true, pesan: 'Validasi kepemilikan berhasil' };
  }

  private async backupDataWishlist(dataWishlist: DataWishlist): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi backup data
  }

  private async hapusWishlistDatabase(idWishlist: string): Promise<void> {
    await this.simulasiDelay(300);
    // Simulasi penghapusan dari database
  }

  private async hapusNotifikasiHarga(idWishlist: string): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi penghapusan notifikasi
  }

  private async kirimKonfirmasiPenghapusan(idPengguna: string, idWishlist: string): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi pengiriman konfirmasi
  }

  // Public method untuk mendapatkan data lengkap
  public toJSON(): DataWishlist {
    return {
      idWishlist: this.idWishlist,
      idPengguna: this.idPengguna,
      idMobil: this.idMobil,
      tanggalDitambahkan: this.tanggalDitambahkan,
      catatan: this.catatan,
      prioritas: this.prioritas,
      statusAktif: this.statusAktif,
      isNotificationEnabled: this.isNotificationEnabled,
      lastPriceCheck: this.lastPriceCheck,
      currentPrice: this.currentPrice
    };
  }
}

export default EntitasWishlist;