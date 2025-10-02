// ==================== ENTITAS ARTIKEL ====================
// Kelas untuk mengelola data dan operasi artikel/konten
// Mengatur publikasi, kategori, dan manajemen konten

// Interface untuk data artikel
export interface DataArtikel {
  idArtikel: string;
  judulArtikel: string;
  kontenArtikel: string;
  kategoriArtikel: string;
  penulisArtikel: string;
  tanggalPublikasi: Date;
  tanggalUpdate: Date;
  gambarUtama: string;
  viewCount: number;
  shareCount: number;
  likeCount: number;
  tags: string[];
  statusArtikel: string;
  metaDescription: string;
  seoKeywords: string;
}

// Interface untuk data konten baru
export interface DataKontenBaru {
  judulArtikel: string;
  kontenArtikel: string;
  kategoriArtikel: string;
  penulisArtikel: string;
  gambarUtama?: string;
  tags?: string[];
  metaDescription?: string;
  seoKeywords?: string;
  statusArtikel?: string;
}

// Interface untuk kategori artikel
export interface KategoriArtikel {
  idKategori: string;
  namaKategori: string;
  deskripsiKategori: string;
  jumlahArtikel: number;
  statusAktif: boolean;
  iconKategori: string;
}

// Interface untuk response validasi
export interface ResponValidasi {
  valid: boolean;
  pesan: string;
}

// Interface untuk statistik artikel
export interface StatistikArtikel {
  totalViews: number;
  totalShares: number;
  totalLikes: number;
  rataRataEngagement: number;
  kategoriTerpopuler: string;
  trendViews: 'naik' | 'turun' | 'stabil';
}

// Interface untuk artikel dengan detail
export interface ArtikelDenganDetail {
  artikel: DataArtikel;
  statistik: StatistikArtikel;
  artikelTerkait: DataArtikel[];
  komentar: number;
  rating: number;
}

class EntitasArtikel {
  // Attributes
  private idArtikel: string;
  private judulArtikel: string;
  private kontenArtikel: string;
  private kategoriArtikel: string;
  private penulisArtikel: string;
  private tanggalPublikasi: Date;
  private tanggalUpdate: Date;
  private gambarUtama: string;
  private viewCount: number;
  private shareCount: number;
  private likeCount: number;
  private tags: string[];
  private statusArtikel: string;
  private metaDescription: string;
  private seoKeywords: string;

  constructor(data?: Partial<DataArtikel>) {
    this.idArtikel = data?.idArtikel || this.generateId();
    this.judulArtikel = data?.judulArtikel || '';
    this.kontenArtikel = data?.kontenArtikel || '';
    this.kategoriArtikel = data?.kategoriArtikel || '';
    this.penulisArtikel = data?.penulisArtikel || '';
    this.tanggalPublikasi = data?.tanggalPublikasi || new Date();
    this.tanggalUpdate = data?.tanggalUpdate || new Date();
    this.gambarUtama = data?.gambarUtama || '';
    this.viewCount = data?.viewCount || 0;
    this.shareCount = data?.shareCount || 0;
    this.likeCount = data?.likeCount || 0;
    this.tags = data?.tags || [];
    this.statusArtikel = data?.statusArtikel || 'draft';
    this.metaDescription = data?.metaDescription || '';
    this.seoKeywords = data?.seoKeywords || '';
  }

  // Methods

  /**
   * Mengambil semua kategori artikel yang tersedia
   * @returns Promise<KategoriArtikel[]> - Daftar kategori artikel
   */
  public async ambilKategoriArtikel(): Promise<KategoriArtikel[]> {
    try {
      // Simulasi pengambilan data dari database
      await this.simulasiDelay(200);

      // Ambil data kategori dari database
      const kategoriList = await this.ambilKategoriDariDatabase();

      // Update jumlah artikel per kategori
      for (const kategori of kategoriList) {
        kategori.jumlahArtikel = await this.hitungArtikelPerKategori(kategori.idKategori);
      }

      // Urutkan berdasarkan jumlah artikel (terpopuler dulu)
      kategoriList.sort((a, b) => b.jumlahArtikel - a.jumlahArtikel);

      return kategoriList;

    } catch (error) {
      throw new Error(`Gagal mengambil kategori artikel: ${error}`);
    }
  }

  /**
   * Mengambil artikel berdasarkan kategori tertentu
   * @param kategori - Nama kategori artikel
   * @returns Promise<DataArtikel[]> - Daftar artikel dalam kategori
   */
  public async ambilArtikelBerdasarkanKategori(kategori: string): Promise<DataArtikel[]> {
    try {
      // Validasi kategori
      if (!kategori || kategori.trim() === '') {
        throw new Error('Kategori tidak valid');
      }

      // Simulasi pengambilan data dari database
      await this.simulasiDelay(300);

      // Ambil artikel berdasarkan kategori
      const artikelList = await this.ambilArtikelDariDatabase({ kategori });

      // Filter hanya artikel yang published
      const artikelPublished = artikelList.filter(artikel => artikel.statusArtikel === 'published');

      // Urutkan berdasarkan tanggal publikasi (terbaru dulu)
      artikelPublished.sort((a, b) => b.tanggalPublikasi.getTime() - a.tanggalPublikasi.getTime());

      // Update view count untuk tracking popularitas
      await this.updatePopularitasKategori(kategori);

      return artikelPublished;

    } catch (error) {
      throw new Error(`Gagal mengambil artikel berdasarkan kategori: ${error}`);
    }
  }

  /**
   * Mengambil detail artikel berdasarkan ID
   * @param idArtikel - ID artikel
   * @returns Promise<ArtikelDenganDetail> - Detail lengkap artikel
   */
  public async ambilDetailArtikel(idArtikel: string): Promise<ArtikelDenganDetail> {
    try {
      // Validasi ID artikel
      if (!idArtikel || idArtikel.trim() === '') {
        throw new Error('ID artikel tidak valid');
      }

      // Simulasi pengambilan data dari database
      await this.simulasiDelay(300);

      // Ambil data artikel
      const artikel = await this.ambilArtikelById(idArtikel);
      if (!artikel) {
        throw new Error('Artikel tidak ditemukan');
      }

      // Cek status artikel (hanya published yang bisa diakses publik)
      if (artikel.statusArtikel !== 'published') {
        throw new Error('Artikel tidak tersedia untuk publik');
      }

      // Update view count
      await this.incrementViewCount(idArtikel);
      artikel.viewCount += 1;

      // Ambil statistik artikel
      const statistik = await this.hitungStatistikArtikel(artikel);

      // Ambil artikel terkait
      const artikelTerkait = await this.ambilArtikelTerkait(artikel);

      // Ambil jumlah komentar
      const jumlahKomentar = await this.hitungJumlahKomentar(idArtikel);

      // Ambil rating artikel
      const ratingArtikel = await this.hitungRatingArtikel(idArtikel);

      // Log aktivitas pembacaan
      await this.logAktivitasPembacaan(idArtikel);

      return {
        artikel,
        statistik,
        artikelTerkait,
        komentar: jumlahKomentar,
        rating: ratingArtikel
      };

    } catch (error) {
      throw new Error(`Gagal mengambil detail artikel: ${error}`);
    }
  }

  /**
   * Mengambil semua konten artikel
   * @returns Promise<DataArtikel[]> - Daftar semua artikel
   */
  public async ambilSemuaKonten(): Promise<DataArtikel[]> {
    try {
      // Simulasi pengambilan data dari database
      await this.simulasiDelay(400);

      // Ambil semua artikel dari database
      const semuaArtikel = await this.ambilArtikelDariDatabase({});

      // Filter berdasarkan status (hanya published untuk publik)
      const artikelPublished = semuaArtikel.filter(artikel => artikel.statusArtikel === 'published');

      // Urutkan berdasarkan tanggal publikasi (terbaru dulu)
      artikelPublished.sort((a, b) => b.tanggalPublikasi.getTime() - a.tanggalPublikasi.getTime());

      // Update statistik global
      await this.updateStatistikGlobal(artikelPublished.length);

      return artikelPublished;

    } catch (error) {
      throw new Error(`Gagal mengambil semua konten: ${error}`);
    }
  }

  /**
   * Membuat konten artikel baru
   * @param dataKonten - Data konten artikel baru
   * @returns Promise<string> - ID artikel yang dibuat
   */
  public async buatKonten(dataKonten: DataKontenBaru): Promise<string> {
    try {
      // Validasi data konten
      const validasi = await this.validasiDataKonten(dataKonten);
      if (!validasi.valid) {
        throw new Error(validasi.pesan);
      }

      // Cek duplikasi judul
      const judulSudahAda = await this.cekDuplikasiJudul(dataKonten.judulArtikel);
      if (judulSudahAda) {
        throw new Error('Judul artikel sudah ada, gunakan judul yang berbeda');
      }

      // Generate ID baru
      const idArtikelBaru = this.generateId();

      // Set data artikel
      this.idArtikel = idArtikelBaru;
      this.judulArtikel = dataKonten.judulArtikel;
      this.kontenArtikel = dataKonten.kontenArtikel;
      this.kategoriArtikel = dataKonten.kategoriArtikel;
      this.penulisArtikel = dataKonten.penulisArtikel;
      this.tanggalPublikasi = new Date();
      this.tanggalUpdate = new Date();
      this.gambarUtama = dataKonten.gambarUtama || '';
      this.viewCount = 0;
      this.shareCount = 0;
      this.likeCount = 0;
      this.tags = dataKonten.tags || [];
      this.statusArtikel = dataKonten.statusArtikel || 'draft';
      this.metaDescription = dataKonten.metaDescription || this.generateMetaDescription(dataKonten.kontenArtikel);
      this.seoKeywords = dataKonten.seoKeywords || this.generateSEOKeywords(dataKonten.judulArtikel, dataKonten.tags);

      // Simpan ke database
      await this.simpanArtikelDatabase();

      // Setup SEO dan indexing jika published
      if (this.statusArtikel === 'published') {
        await this.setupSEOIndexing(idArtikelBaru);
      }

      // Log aktivitas pembuatan
      await this.logAktivitas(idArtikelBaru, 'artikel_dibuat', 'Artikel baru dibuat');

      // Update statistik penulis
      await this.updateStatistikPenulis(dataKonten.penulisArtikel, 'artikel_baru');

      return idArtikelBaru;

    } catch (error) {
      throw new Error(`Gagal membuat konten: ${error}`);
    }
  }

  /**
   * Mengambil data konten berdasarkan ID
   * @param idKonten - ID konten/artikel
   * @returns Promise<DataArtikel | null> - Data artikel atau null jika tidak ditemukan
   */
  public async ambilDataKonten(idKonten: string): Promise<DataArtikel | null> {
    try {
      // Validasi ID konten
      if (!idKonten || idKonten.trim() === '') {
        throw new Error('ID konten tidak valid');
      }

      // Simulasi pengambilan data dari database
      await this.simulasiDelay(200);

      // Ambil data artikel
      const artikel = await this.ambilArtikelById(idKonten);

      // Log aktivitas akses data
      if (artikel) {
        await this.logAktivitas(idKonten, 'data_diakses', 'Data konten diakses');
      }

      return artikel;

    } catch (error) {
      throw new Error(`Gagal mengambil data konten: ${error}`);
    }
  }

  /**
   * Menghapus konten dari database
   * @param idKonten - ID konten yang akan dihapus
   * @returns Promise<boolean> - Status keberhasilan penghapusan
   */
  public async hapusDariDatabase(idKonten: string): Promise<boolean> {
    try {
      // Validasi ID konten
      if (!idKonten || idKonten.trim() === '') {
        throw new Error('ID konten tidak valid');
      }

      // Ambil data artikel sebelum dihapus
      const artikel = await this.ambilArtikelById(idKonten);
      if (!artikel) {
        throw new Error('Artikel tidak ditemukan');
      }

      // Validasi izin penghapusan
      const validasiHapus = await this.validasiIzinHapus(artikel);
      if (!validasiHapus.valid) {
        throw new Error(validasiHapus.pesan);
      }

      // Backup data sebelum dihapus
      await this.backupDataArtikel(artikel);

      // Hapus file gambar terkait
      if (artikel.gambarUtama) {
        await this.hapusFileGambar(artikel.gambarUtama);
      }

      // Hapus dari database
      await this.hapusArtikelDatabase(idKonten);

      // Hapus dari index SEO
      await this.hapusDariSEOIndex(idKonten);

      // Log aktivitas penghapusan
      await this.logAktivitas(idKonten, 'artikel_dihapus', 'Artikel dihapus dari sistem');

      // Update statistik penulis
      await this.updateStatistikPenulis(artikel.penulisArtikel, 'artikel_dihapus');

      // Kirim notifikasi penghapusan
      await this.kirimNotifikasiPenghapusan(artikel.penulisArtikel, idKonten);

      return true;

    } catch (error) {
      throw new Error(`Gagal menghapus konten: ${error}`);
    }
  }

  // Private helper methods

  private generateId(): string {
    return 'ART' + Date.now().toString() + Math.random().toString(36).substr(2, 5);
  }

  private async simulasiDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async ambilKategoriDariDatabase(): Promise<KategoriArtikel[]> {
    await this.simulasiDelay(200);

    // Simulasi data kategori
    return [
      {
        idKategori: 'KAT001',
        namaKategori: 'Tips & Trik',
        deskripsiKategori: 'Tips dan trik seputar otomotif',
        jumlahArtikel: 0,
        statusAktif: true,
        iconKategori: 'tips-icon.svg'
      },
      {
        idKategori: 'KAT002',
        namaKategori: 'Review Mobil',
        deskripsiKategori: 'Review dan ulasan mobil terbaru',
        jumlahArtikel: 0,
        statusAktif: true,
        iconKategori: 'review-icon.svg'
      },
      {
        idKategori: 'KAT003',
        namaKategori: 'Berita Otomotif',
        deskripsiKategori: 'Berita terkini dunia otomotif',
        jumlahArtikel: 0,
        statusAktif: true,
        iconKategori: 'news-icon.svg'
      }
    ];
  }

  private async hitungArtikelPerKategori(idKategori: string): Promise<number> {
    await this.simulasiDelay(100);
    
    // Simulasi penghitungan artikel per kategori
    return Math.floor(Math.random() * 20) + 1; // 1-20 artikel
  }

  private async ambilArtikelDariDatabase(filter: any): Promise<DataArtikel[]> {
    await this.simulasiDelay(300);

    // Simulasi data artikel
    const artikelSample: DataArtikel[] = [
      {
        idArtikel: 'ART001',
        judulArtikel: 'Tips Memilih Mobil Keluarga yang Tepat',
        kontenArtikel: 'Konten artikel lengkap tentang tips memilih mobil keluarga...',
        kategoriArtikel: 'Tips & Trik',
        penulisArtikel: 'Admin Mobilindo',
        tanggalPublikasi: new Date('2024-01-15'),
        tanggalUpdate: new Date('2024-01-15'),
        gambarUtama: '/images/tips-mobil-keluarga.jpg',
        viewCount: 1250,
        shareCount: 45,
        likeCount: 89,
        tags: ['mobil keluarga', 'tips', 'otomotif'],
        statusArtikel: 'published',
        metaDescription: 'Panduan lengkap memilih mobil keluarga yang sesuai kebutuhan dan budget',
        seoKeywords: 'mobil keluarga, tips mobil, panduan otomotif'
      },
      {
        idArtikel: 'ART002',
        judulArtikel: 'Review Toyota Avanza 2024: Kelebihan dan Kekurangan',
        kontenArtikel: 'Review mendalam Toyota Avanza 2024 dengan segala kelebihan dan kekurangannya...',
        kategoriArtikel: 'Review Mobil',
        penulisArtikel: 'Reviewer Pro',
        tanggalPublikasi: new Date('2024-01-10'),
        tanggalUpdate: new Date('2024-01-12'),
        gambarUtama: '/images/toyota-avanza-2024.jpg',
        viewCount: 2100,
        shareCount: 78,
        likeCount: 156,
        tags: ['toyota', 'avanza', 'review', '2024'],
        statusArtikel: 'published',
        metaDescription: 'Review lengkap Toyota Avanza 2024 dengan analisis kelebihan dan kekurangan',
        seoKeywords: 'toyota avanza 2024, review mobil, kelebihan avanza'
      }
    ];

    // Filter berdasarkan kategori jika ada
    if (filter.kategori) {
      return artikelSample.filter(artikel => artikel.kategoriArtikel === filter.kategori);
    }

    return artikelSample;
  }

  private async updatePopularitasKategori(kategori: string): Promise<void> {
    await this.simulasiDelay(100);
    // Simulasi update popularitas kategori
  }

  private async ambilArtikelById(idArtikel: string): Promise<DataArtikel | null> {
    await this.simulasiDelay(200);

    // Simulasi data artikel
    return {
      idArtikel: idArtikel,
      judulArtikel: 'Tips Memilih Mobil Keluarga yang Tepat',
      kontenArtikel: 'Konten artikel lengkap tentang tips memilih mobil keluarga...',
      kategoriArtikel: 'Tips & Trik',
      penulisArtikel: 'Admin Mobilindo',
      tanggalPublikasi: new Date('2024-01-15'),
      tanggalUpdate: new Date('2024-01-15'),
      gambarUtama: '/images/tips-mobil-keluarga.jpg',
      viewCount: 1250,
      shareCount: 45,
      likeCount: 89,
      tags: ['mobil keluarga', 'tips', 'otomotif'],
      statusArtikel: 'published',
      metaDescription: 'Panduan lengkap memilih mobil keluarga yang sesuai kebutuhan dan budget',
      seoKeywords: 'mobil keluarga, tips mobil, panduan otomotif'
    };
  }

  private async incrementViewCount(idArtikel: string): Promise<void> {
    await this.simulasiDelay(100);
    // Simulasi increment view count
  }

  private async hitungStatistikArtikel(artikel: DataArtikel): Promise<StatistikArtikel> {
    await this.simulasiDelay(200);

    const totalInteraksi = artikel.viewCount + artikel.shareCount + artikel.likeCount;
    const rataRataEngagement = totalInteraksi > 0 ? (artikel.likeCount + artikel.shareCount) / artikel.viewCount * 100 : 0;

    return {
      totalViews: artikel.viewCount,
      totalShares: artikel.shareCount,
      totalLikes: artikel.likeCount,
      rataRataEngagement: Math.round(rataRataEngagement * 100) / 100,
      kategoriTerpopuler: artikel.kategoriArtikel,
      trendViews: 'naik'
    };
  }

  private async ambilArtikelTerkait(artikel: DataArtikel): Promise<DataArtikel[]> {
    await this.simulasiDelay(200);

    // Simulasi artikel terkait berdasarkan kategori dan tags
    const artikelTerkait = await this.ambilArtikelDariDatabase({ kategori: artikel.kategoriArtikel });
    
    // Filter artikel yang sama dan ambil maksimal 3
    return artikelTerkait
      .filter(art => art.idArtikel !== artikel.idArtikel)
      .slice(0, 3);
  }

  private async hitungJumlahKomentar(idArtikel: string): Promise<number> {
    await this.simulasiDelay(100);
    
    // Simulasi jumlah komentar
    return Math.floor(Math.random() * 50); // 0-49 komentar
  }

  private async hitungRatingArtikel(idArtikel: string): Promise<number> {
    await this.simulasiDelay(100);
    
    // Simulasi rating artikel (1-5)
    return Math.round((Math.random() * 4 + 1) * 10) / 10; // 1.0-5.0
  }

  private async logAktivitasPembacaan(idArtikel: string): Promise<void> {
    await this.simulasiDelay(100);
    // Simulasi logging aktivitas pembacaan
  }

  private async updateStatistikGlobal(jumlahArtikel: number): Promise<void> {
    await this.simulasiDelay(100);
    // Simulasi update statistik global
  }

  private async validasiDataKonten(data: DataKontenBaru): Promise<ResponValidasi> {
    await this.simulasiDelay(200);

    // Validasi judul
    if (!data.judulArtikel || data.judulArtikel.trim() === '') {
      return { valid: false, pesan: 'Judul artikel harus diisi' };
    }

    if (data.judulArtikel.length > 200) {
      return { valid: false, pesan: 'Judul artikel tidak boleh lebih dari 200 karakter' };
    }

    // Validasi konten
    if (!data.kontenArtikel || data.kontenArtikel.trim() === '') {
      return { valid: false, pesan: 'Konten artikel harus diisi' };
    }

    if (data.kontenArtikel.length < 100) {
      return { valid: false, pesan: 'Konten artikel minimal 100 karakter' };
    }

    // Validasi kategori
    if (!data.kategoriArtikel || data.kategoriArtikel.trim() === '') {
      return { valid: false, pesan: 'Kategori artikel harus dipilih' };
    }

    // Validasi penulis
    if (!data.penulisArtikel || data.penulisArtikel.trim() === '') {
      return { valid: false, pesan: 'Penulis artikel harus diisi' };
    }

    return { valid: true, pesan: 'Data konten valid' };
  }

  private async cekDuplikasiJudul(judul: string): Promise<boolean> {
    await this.simulasiDelay(200);
    
    // Simulasi pengecekan duplikasi judul
    return Math.random() < 0.05; // 5% kemungkinan duplikasi
  }

  private generateMetaDescription(konten: string): string {
    // Generate meta description dari 150 karakter pertama konten
    return konten.substring(0, 150).trim() + '...';
  }

  private generateSEOKeywords(judul: string, tags?: string[]): string {
    // Generate SEO keywords dari judul dan tags
    const judulWords = judul.toLowerCase().split(' ').filter(word => word.length > 3);
    const allKeywords = [...judulWords, ...(tags || [])];
    return allKeywords.slice(0, 10).join(', ');
  }

  private async simpanArtikelDatabase(): Promise<void> {
    await this.simulasiDelay(400);
    // Simulasi penyimpanan ke database
  }

  private async setupSEOIndexing(idArtikel: string): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi setup SEO indexing
  }

  private async logAktivitas(idArtikel: string, tipeAktivitas: string, deskripsi: string): Promise<void> {
    await this.simulasiDelay(100);
    // Simulasi logging aktivitas
  }

  private async updateStatistikPenulis(penulis: string, tipeAktivitas: string): Promise<void> {
    await this.simulasiDelay(100);
    // Simulasi update statistik penulis
  }

  private async validasiIzinHapus(artikel: DataArtikel): Promise<ResponValidasi> {
    await this.simulasiDelay(100);

    // Tidak boleh hapus artikel yang masih banyak dibaca
    if (artikel.viewCount > 1000) {
      return {
        valid: false,
        pesan: 'Artikel dengan view tinggi tidak dapat dihapus'
      };
    }

    return { valid: true, pesan: 'Artikel dapat dihapus' };
  }

  private async backupDataArtikel(artikel: DataArtikel): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi backup data artikel
  }

  private async hapusFileGambar(gambarPath: string): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi penghapusan file gambar
  }

  private async hapusArtikelDatabase(idArtikel: string): Promise<void> {
    await this.simulasiDelay(300);
    // Simulasi penghapusan dari database
  }

  private async hapusDariSEOIndex(idArtikel: string): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi penghapusan dari SEO index
  }

  private async kirimNotifikasiPenghapusan(penulis: string, idArtikel: string): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi pengiriman notifikasi penghapusan
  }

  // Public method untuk mendapatkan data lengkap
  public toJSON(): DataArtikel {
    return {
      idArtikel: this.idArtikel,
      judulArtikel: this.judulArtikel,
      kontenArtikel: this.kontenArtikel,
      kategoriArtikel: this.kategoriArtikel,
      penulisArtikel: this.penulisArtikel,
      tanggalPublikasi: this.tanggalPublikasi,
      tanggalUpdate: this.tanggalUpdate,
      gambarUtama: this.gambarUtama,
      viewCount: this.viewCount,
      shareCount: this.shareCount,
      likeCount: this.likeCount,
      tags: this.tags,
      statusArtikel: this.statusArtikel,
      metaDescription: this.metaDescription,
      seoKeywords: this.seoKeywords
    };
  }
}

export type StatusArtikel = 'draft' | 'published' | 'archived' | 'pending';

export default EntitasArtikel;