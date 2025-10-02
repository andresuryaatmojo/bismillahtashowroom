// LayananRekomendasi.ts - Service untuk mengelola sistem rekomendasi mobil
// Dibuat untuk Mobilindo Showroom - Sistem Manajemen Showroom Mobil

// ==================== INTERFACES ====================

// Interface untuk data preferensi pengguna
export interface PreferensiPengguna {
  id: string;
  userId: string;
  jenisKendaraan: string[];
  rentangHarga: {
    min: number;
    max: number;
  };
  merkPreferensi: string[];
  tahunPreferensi: {
    min: number;
    max: number;
  };
  jenisTransmisi: string[];
  jenisBahanBakar: string[];
  kapasitasMesin: {
    min: number;
    max: number;
  };
  jumlahPenumpang: number;
  fiturWajib: string[];
  fiturTambahan: string[];
  lokasiPreferensi: string[];
  tujuanPenggunaan: string[];
  prioritasUtama: string;
  budgetTambahan: {
    asuransi: number;
    perawatan: number;
    aksesoris: number;
  };
  riwayatPencarian: string[];
  riwayatPembelian: string[];
  rating: number;
  feedback: string;
  tanggalDibuat: Date;
  tanggalDiperbarui: Date;
  status: 'aktif' | 'nonaktif' | 'draft';
  metadata: {
    sumber: string;
    versi: string;
    confidence: number;
    tags: string[];
  };
}

// Interface untuk data mobil dalam sistem rekomendasi
export interface MobilRekomendasi {
  id: string;
  nama: string;
  merk: string;
  model: string;
  tahun: number;
  harga: number;
  jenisKendaraan: string;
  transmisi: string;
  bahanBakar: string;
  kapasitasMesin: number;
  jumlahPenumpang: number;
  fiturUtama: string[];
  fiturKeamanan: string[];
  fiturKenyamanan: string[];
  spesifikasi: {
    mesin: {
      tipe: string;
      kapasitas: number;
      tenaga: number;
      torsi: number;
    };
    dimensi: {
      panjang: number;
      lebar: number;
      tinggi: number;
      wheelbase: number;
    };
    performa: {
      topSpeed: number;
      akselerasi: number;
      konsumsiGsm: number;
    };
  };
  gambar: string[];
  video: string[];
  dokumen: string[];
  dealer: {
    id: string;
    nama: string;
    lokasi: string;
    kontak: string;
  };
  stok: number;
  diskon: number;
  promo: string[];
  rating: number;
  jumlahUlasan: number;
  popularitas: number;
  trendScore: number;
  compatibilityScore: number;
  tags: string[];
  metadata: {
    sumber: string;
    lastUpdate: Date;
    verified: boolean;
  };
}

// Interface untuk hasil rekomendasi
export interface HasilRekomendasi {
  id: string;
  userId: string;
  preferensiId: string;
  mobilRekomendasi: MobilRekomendasi[];
  skorRekomendasi: {
    mobilId: string;
    skorTotal: number;
    skorDetail: {
      harga: number;
      fitur: number;
      spesifikasi: number;
      popularitas: number;
      rating: number;
      lokasi: number;
      ketersediaan: number;
    };
    alasanRekomendasi: string[];
    kelebihan: string[];
    kekurangan: string[];
    tingkatKesesuaian: 'sangat_tinggi' | 'tinggi' | 'sedang' | 'rendah';
  }[];
  alternatifRekomendasi: MobilRekomendasi[];
  perbandinganMobil: {
    mobilIds: string[];
    kriteriaPembanding: string[];
    hasilPerbandingan: any[];
  };
  insightRekomendasi: {
    trendPasar: string[];
    rekomendasiFinansial: string[];
    tipsMemilih: string[];
    peringatanPenting: string[];
  };
  tanggalDibuat: Date;
  validHingga: Date;
  status: 'aktif' | 'kadaluarsa' | 'diperbarui';
  metadata: {
    algoritma: string;
    versi: string;
    confidence: number;
    processingTime: number;
  };
}

// Interface untuk algoritma rekomendasi
export interface AlgoritmaRekomendasi {
  id: string;
  nama: string;
  deskripsi: string;
  tipe: 'collaborative' | 'content_based' | 'hybrid' | 'knowledge_based';
  parameter: {
    bobot: {
      harga: number;
      fitur: number;
      spesifikasi: number;
      popularitas: number;
      rating: number;
      lokasi: number;
    };
    threshold: {
      minimum_score: number;
      maximum_results: number;
      similarity_threshold: number;
    };
    filter: {
      exclude_out_of_stock: boolean;
      exclude_discontinued: boolean;
      price_tolerance: number;
    };
  };
  konfigurasi: {
    learning_rate: number;
    iterations: number;
    regularization: number;
    cross_validation: boolean;
  };
  performa: {
    akurasi: number;
    precision: number;
    recall: number;
    f1_score: number;
    processing_time: number;
  };
  status: 'aktif' | 'nonaktif' | 'testing';
  tanggalDibuat: Date;
  tanggalDiperbarui: Date;
}

// Interface untuk feedback rekomendasi
export interface FeedbackRekomendasi {
  id: string;
  userId: string;
  rekomendasiId: string;
  mobilId: string;
  rating: number;
  komentar: string;
  aspekPenilaian: {
    relevansi: number;
    akurasi: number;
    kelengkapan: number;
    kepuasan: number;
  };
  tindakLanjut: 'tertarik' | 'tidak_tertarik' | 'sudah_beli' | 'masih_pertimbang';
  alasanFeedback: string[];
  saranPerbaikan: string[];
  tanggalDibuat: Date;
  metadata: {
    platform: string;
    device: string;
    session_id: string;
  };
}

// Interface untuk statistik rekomendasi
export interface StatistikRekomendasi {
  totalRekomendasi: number;
  rekomendasiAktif: number;
  tingkatAkurasi: number;
  tingkatKepuasan: number;
  mobilTerpopuler: {
    mobilId: string;
    nama: string;
    jumlahRekomendasi: number;
    tingkatKonversi: number;
  }[];
  trendPreferensi: {
    kategori: string;
    persentase: number;
    perubahan: number;
  }[];
  performaAlgoritma: {
    algoritmaId: string;
    nama: string;
    akurasi: number;
    kecepatan: number;
    penggunaan: number;
  }[];
  feedbackSummary: {
    totalFeedback: number;
    ratingRataRata: number;
    distribusiRating: number[];
    aspekTerbaik: string[];
    aspekTerburuk: string[];
  };
  konversiPenjualan: {
    totalKonversi: number;
    tingkatKonversi: number;
    nilaiKonversi: number;
    waktuRataRataKonversi: number;
  };
  periode: {
    mulai: Date;
    selesai: Date;
  };
}

// Interface untuk respons layanan
export interface ResponLayanan<T = any> {
  sukses: boolean;
  data?: T;
  pesan: string;
  kode: string;
  timestamp: Date;
  metadata?: {
    total?: number;
    halaman?: number;
    ukuranHalaman?: number;
    waktuProses?: number;
  };
}

// ==================== IMPLEMENTASI LAYANAN ====================

export class LayananRekomendasi {
  private static instance: LayananRekomendasi;
  private cache: Map<string, any> = new Map();
  private config = {
    cacheTimeout: 300000, // 5 menit
    maxCacheSize: 1000,
    apiTimeout: 30000,
    retryAttempts: 3,
    batchSize: 50
  };

  private constructor() {}

  public static getInstance(): LayananRekomendasi {
    if (!LayananRekomendasi.instance) {
      LayananRekomendasi.instance = new LayananRekomendasi();
    }
    return LayananRekomendasi.instance;
  }

  // ==================== METODE UTAMA ====================

  /**
   * Mengambil rekomendasi mobil berdasarkan preferensi pengguna
   */
  public async ambilRekomendasiMobil(
    userId: string,
    preferensiId?: string,
    algoritmaId?: string
  ): Promise<ResponLayanan<HasilRekomendasi>> {
    try {
      await this.simulasiDelay();

      const preferensi = await this.ambilPreferensiPengguna(userId, preferensiId);
      const algoritma = await this.ambilAlgoritmaRekomendasi(algoritmaId);
      const mobilTersedia = await this.ambilMobilTersedia();

      const hasilRekomendasi = await this.prosesRekomendasi(
        preferensi,
        mobilTersedia,
        algoritma
      );

      await this.simpanHasilRekomendasi(hasilRekomendasi);
      await this.updateStatistikRekomendasi(hasilRekomendasi);

      return {
        sukses: true,
        data: hasilRekomendasi,
        pesan: 'Rekomendasi mobil berhasil diambil',
        kode: 'REKOMENDASI_SUCCESS',
        timestamp: new Date(),
        metadata: {
          total: hasilRekomendasi.mobilRekomendasi.length,
          waktuProses: Date.now() - Date.now()
        }
      };
    } catch (error) {
      return this.handleError('Gagal mengambil rekomendasi mobil', error);
    }
  }

  /**
   * Menyimpan atau memperbarui preferensi pengguna
   */
  public async simpanPreferensiPengguna(
    preferensi: Partial<PreferensiPengguna>
  ): Promise<ResponLayanan<PreferensiPengguna>> {
    try {
      await this.simulasiDelay();

      const preferensiValid = await this.validasiPreferensi(preferensi);
      const preferensiLengkap = await this.lengkapiPreferensi(preferensiValid);
      const preferensiTersimpan = await this.simpanKeDatabase(preferensiLengkap);

      await this.updateProfilPengguna(preferensiTersimpan);
      await this.triggerRekomendasiUlang(preferensiTersimpan.userId);

      return {
        sukses: true,
        data: preferensiTersimpan,
        pesan: 'Preferensi pengguna berhasil disimpan',
        kode: 'PREFERENSI_SAVED',
        timestamp: new Date()
      };
    } catch (error) {
      return this.handleError('Gagal menyimpan preferensi pengguna', error);
    }
  }

  /**
   * Memberikan feedback untuk rekomendasi
   */
  public async berikanFeedback(
    feedback: Partial<FeedbackRekomendasi>
  ): Promise<ResponLayanan<FeedbackRekomendasi>> {
    try {
      await this.simulasiDelay();

      const feedbackValid = await this.validasiFeedback(feedback);
      const feedbackLengkap = await this.lengkapiFeedback(feedbackValid);
      const feedbackTersimpan = await this.simpanFeedback(feedbackLengkap);

      await this.updateAlgoritmaRekomendasi(feedbackTersimpan);
      await this.updateStatistikFeedback(feedbackTersimpan);

      return {
        sukses: true,
        data: feedbackTersimpan,
        pesan: 'Feedback berhasil disimpan',
        kode: 'FEEDBACK_SAVED',
        timestamp: new Date()
      };
    } catch (error) {
      return this.handleError('Gagal menyimpan feedback', error);
    }
  }

  /**
   * Mengambil statistik rekomendasi
   */
  public async ambilStatistikRekomendasi(
    periode?: { mulai: Date; selesai: Date }
  ): Promise<ResponLayanan<StatistikRekomendasi>> {
    try {
      await this.simulasiDelay();

      const statistik = await this.hitungStatistikRekomendasi(periode);
      await this.cacheStatistik(statistik);

      return {
        sukses: true,
        data: statistik,
        pesan: 'Statistik rekomendasi berhasil diambil',
        kode: 'STATISTIK_SUCCESS',
        timestamp: new Date()
      };
    } catch (error) {
      return this.handleError('Gagal mengambil statistik rekomendasi', error);
    }
  }

  /**
   * Mengelola algoritma rekomendasi
   */
  public async kelolaAlgoritmaRekomendasi(
    aksi: 'tambah' | 'perbarui' | 'hapus' | 'aktifkan' | 'nonaktifkan',
    algoritma: Partial<AlgoritmaRekomendasi>
  ): Promise<ResponLayanan<AlgoritmaRekomendasi>> {
    try {
      await this.simulasiDelay();

      let hasil: AlgoritmaRekomendasi;

      switch (aksi) {
        case 'tambah':
          hasil = await this.tambahAlgoritma(algoritma);
          break;
        case 'perbarui':
          hasil = await this.perbaruiAlgoritma(algoritma);
          break;
        case 'hapus':
          hasil = await this.hapusAlgoritma(algoritma.id!);
          break;
        case 'aktifkan':
          hasil = await this.aktifkanAlgoritma(algoritma.id!);
          break;
        case 'nonaktifkan':
          hasil = await this.nonaktifkanAlgoritma(algoritma.id!);
          break;
        default:
          throw new Error('Aksi tidak valid');
      }

      return {
        sukses: true,
        data: hasil,
        pesan: `Algoritma berhasil ${aksi}`,
        kode: 'ALGORITMA_SUCCESS',
        timestamp: new Date()
      };
    } catch (error) {
      return this.handleError(`Gagal ${aksi} algoritma`, error);
    }
  }

  // ==================== METODE PRIVAT ====================

  private async ambilPreferensiPengguna(
    userId: string,
    preferensiId?: string
  ): Promise<PreferensiPengguna> {
    // Simulasi pengambilan preferensi dari database
    return {
      id: preferensiId || `pref_${userId}_${Date.now()}`,
      userId,
      jenisKendaraan: ['SUV', 'Sedan'],
      rentangHarga: { min: 200000000, max: 500000000 },
      merkPreferensi: ['Toyota', 'Honda', 'Mitsubishi'],
      tahunPreferensi: { min: 2020, max: 2024 },
      jenisTransmisi: ['Automatic', 'CVT'],
      jenisBahanBakar: ['Bensin', 'Hybrid'],
      kapasitasMesin: { min: 1500, max: 2500 },
      jumlahPenumpang: 7,
      fiturWajib: ['ABS', 'Airbag', 'Power Steering'],
      fiturTambahan: ['Sunroof', 'Leather Seat', 'Navigation'],
      lokasiPreferensi: ['Jakarta', 'Bogor', 'Depok'],
      tujuanPenggunaan: ['Keluarga', 'Bisnis'],
      prioritasUtama: 'Keamanan',
      budgetTambahan: {
        asuransi: 10000000,
        perawatan: 5000000,
        aksesoris: 15000000
      },
      riwayatPencarian: ['Toyota Innova', 'Honda CR-V'],
      riwayatPembelian: [],
      rating: 4.5,
      feedback: 'Preferensi yang baik',
      tanggalDibuat: new Date(),
      tanggalDiperbarui: new Date(),
      status: 'aktif',
      metadata: {
        sumber: 'user_input',
        versi: '1.0',
        confidence: 0.85,
        tags: ['family', 'safety']
      }
    };
  }

  private async ambilAlgoritmaRekomendasi(
    algoritmaId?: string
  ): Promise<AlgoritmaRekomendasi> {
    // Simulasi pengambilan algoritma dari database
    return {
      id: algoritmaId || 'algo_hybrid_v1',
      nama: 'Hybrid Recommendation Algorithm',
      deskripsi: 'Kombinasi collaborative dan content-based filtering',
      tipe: 'hybrid',
      parameter: {
        bobot: {
          harga: 0.25,
          fitur: 0.20,
          spesifikasi: 0.15,
          popularitas: 0.15,
          rating: 0.15,
          lokasi: 0.10
        },
        threshold: {
          minimum_score: 0.6,
          maximum_results: 10,
          similarity_threshold: 0.7
        },
        filter: {
          exclude_out_of_stock: true,
          exclude_discontinued: true,
          price_tolerance: 0.15
        }
      },
      konfigurasi: {
        learning_rate: 0.01,
        iterations: 100,
        regularization: 0.001,
        cross_validation: true
      },
      performa: {
        akurasi: 0.87,
        precision: 0.82,
        recall: 0.79,
        f1_score: 0.80,
        processing_time: 1500
      },
      status: 'aktif',
      tanggalDibuat: new Date(),
      tanggalDiperbarui: new Date()
    };
  }

  private async ambilMobilTersedia(): Promise<MobilRekomendasi[]> {
    // Simulasi pengambilan data mobil dari database
    return [
      {
        id: 'mobil_001',
        nama: 'Toyota Innova Reborn',
        merk: 'Toyota',
        model: 'Innova',
        tahun: 2023,
        harga: 350000000,
        jenisKendaraan: 'MPV',
        transmisi: 'Automatic',
        bahanBakar: 'Bensin',
        kapasitasMesin: 2000,
        jumlahPenumpang: 8,
        fiturUtama: ['ABS', 'Airbag', 'Power Steering', 'AC'],
        fiturKeamanan: ['ABS', 'EBD', 'BA', 'VSC', 'Hill Start Assist'],
        fiturKenyamanan: ['Power Window', 'Central Lock', 'Audio System'],
        spesifikasi: {
          mesin: {
            tipe: '2TR-FE',
            kapasitas: 2000,
            tenaga: 139,
            torsi: 183
          },
          dimensi: {
            panjang: 4735,
            lebar: 1830,
            tinggi: 1795,
            wheelbase: 2750
          },
          performa: {
            topSpeed: 180,
            akselerasi: 12.5,
            konsumsiGsm: 11.8
          }
        },
        gambar: ['innova1.jpg', 'innova2.jpg'],
        video: ['innova_review.mp4'],
        dokumen: ['innova_spec.pdf'],
        dealer: {
          id: 'dealer_001',
          nama: 'Toyota Sunter',
          lokasi: 'Jakarta Utara',
          kontak: '021-12345678'
        },
        stok: 5,
        diskon: 5000000,
        promo: ['Cashback 10jt', 'Free Service 3x'],
        rating: 4.5,
        jumlahUlasan: 125,
        popularitas: 0.85,
        trendScore: 0.78,
        compatibilityScore: 0.92,
        tags: ['family', 'reliable', 'spacious'],
        metadata: {
          sumber: 'dealer_api',
          lastUpdate: new Date(),
          verified: true
        }
      }
      // Data mobil lainnya...
    ];
  }

  private async prosesRekomendasi(
    preferensi: PreferensiPengguna,
    mobilTersedia: MobilRekomendasi[],
    algoritma: AlgoritmaRekomendasi
  ): Promise<HasilRekomendasi> {
    // Simulasi proses rekomendasi
    const mobilTerfilter = await this.filterMobilBerdasarkanPreferensi(
      mobilTersedia,
      preferensi
    );

    const skorRekomendasi = await this.hitungSkorRekomendasi(
      mobilTerfilter,
      preferensi,
      algoritma
    );

    const mobilRekomendasi = skorRekomendasi
      .sort((a, b) => b.skorTotal - a.skorTotal)
      .slice(0, algoritma.parameter.threshold.maximum_results)
      .map(skor => mobilTersedia.find(m => m.id === skor.mobilId)!)
      .filter(Boolean);

    return {
      id: `rec_${preferensi.userId}_${Date.now()}`,
      userId: preferensi.userId,
      preferensiId: preferensi.id,
      mobilRekomendasi,
      skorRekomendasi,
      alternatifRekomendasi: mobilTersedia.slice(0, 5),
      perbandinganMobil: {
        mobilIds: mobilRekomendasi.slice(0, 3).map(m => m.id),
        kriteriaPembanding: ['harga', 'fitur', 'spesifikasi'],
        hasilPerbandingan: []
      },
      insightRekomendasi: {
        trendPasar: ['SUV sedang populer', 'Hybrid semakin diminati'],
        rekomendasiFinansial: ['Pertimbangkan cicilan 0%', 'Manfaatkan promo akhir tahun'],
        tipsMemilih: ['Test drive dulu', 'Bandingkan after sales service'],
        peringatanPenting: ['Cek ketersediaan spare part', 'Pastikan garansi resmi']
      },
      tanggalDibuat: new Date(),
      validHingga: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 hari
      status: 'aktif',
      metadata: {
        algoritma: algoritma.id,
        versi: '1.0',
        confidence: 0.87,
        processingTime: 1200
      }
    };
  }

  private async filterMobilBerdasarkanPreferensi(
    mobilTersedia: MobilRekomendasi[],
    preferensi: PreferensiPengguna
  ): Promise<MobilRekomendasi[]> {
    return mobilTersedia.filter(mobil => {
      // Filter berdasarkan harga
      if (mobil.harga < preferensi.rentangHarga.min || 
          mobil.harga > preferensi.rentangHarga.max) {
        return false;
      }

      // Filter berdasarkan merk
      if (preferensi.merkPreferensi.length > 0 && 
          !preferensi.merkPreferensi.includes(mobil.merk)) {
        return false;
      }

      // Filter berdasarkan tahun
      if (mobil.tahun < preferensi.tahunPreferensi.min || 
          mobil.tahun > preferensi.tahunPreferensi.max) {
        return false;
      }

      // Filter berdasarkan transmisi
      if (preferensi.jenisTransmisi.length > 0 && 
          !preferensi.jenisTransmisi.includes(mobil.transmisi)) {
        return false;
      }

      // Filter berdasarkan bahan bakar
      if (preferensi.jenisBahanBakar.length > 0 && 
          !preferensi.jenisBahanBakar.includes(mobil.bahanBakar)) {
        return false;
      }

      return true;
    });
  }

  private async hitungSkorRekomendasi(
    mobilTerfilter: MobilRekomendasi[],
    preferensi: PreferensiPengguna,
    algoritma: AlgoritmaRekomendasi
  ): Promise<HasilRekomendasi['skorRekomendasi']> {
    return mobilTerfilter.map(mobil => {
      const skorHarga = this.hitungSkorHarga(mobil, preferensi);
      const skorFitur = this.hitungSkorFitur(mobil, preferensi);
      const skorSpesifikasi = this.hitungSkorSpesifikasi(mobil, preferensi);
      const skorPopularitas = mobil.popularitas;
      const skorRating = mobil.rating / 5;
      const skorLokasi = this.hitungSkorLokasi(mobil, preferensi);

      const skorTotal = 
        skorHarga * algoritma.parameter.bobot.harga +
        skorFitur * algoritma.parameter.bobot.fitur +
        skorSpesifikasi * algoritma.parameter.bobot.spesifikasi +
        skorPopularitas * algoritma.parameter.bobot.popularitas +
        skorRating * algoritma.parameter.bobot.rating +
        skorLokasi * algoritma.parameter.bobot.lokasi;

      return {
        mobilId: mobil.id,
        skorTotal,
        skorDetail: {
          harga: skorHarga,
          fitur: skorFitur,
          spesifikasi: skorSpesifikasi,
          popularitas: skorPopularitas,
          rating: skorRating,
          lokasi: skorLokasi,
          ketersediaan: mobil.stok > 0 ? 1 : 0
        },
        alasanRekomendasi: this.generateAlasanRekomendasi(mobil, preferensi),
        kelebihan: this.generateKelebihan(mobil),
        kekurangan: this.generateKekurangan(mobil),
        tingkatKesesuaian: this.tentukanTingkatKesesuaian(skorTotal)
      };
    });
  }

  private hitungSkorHarga(mobil: MobilRekomendasi, preferensi: PreferensiPengguna): number {
    const rentangHarga = preferensi.rentangHarga.max - preferensi.rentangHarga.min;
    const posisiHarga = mobil.harga - preferensi.rentangHarga.min;
    return Math.max(0, 1 - (posisiHarga / rentangHarga));
  }

  private hitungSkorFitur(mobil: MobilRekomendasi, preferensi: PreferensiPengguna): number {
    const fiturWajibTerpenuhi = preferensi.fiturWajib.filter(fitur => 
      mobil.fiturUtama.includes(fitur) || 
      mobil.fiturKeamanan.includes(fitur) || 
      mobil.fiturKenyamanan.includes(fitur)
    ).length;

    const fiturTambahanTerpenuhi = preferensi.fiturTambahan.filter(fitur => 
      mobil.fiturUtama.includes(fitur) || 
      mobil.fiturKeamanan.includes(fitur) || 
      mobil.fiturKenyamanan.includes(fitur)
    ).length;

    const skorWajib = fiturWajibTerpenuhi / Math.max(1, preferensi.fiturWajib.length);
    const skorTambahan = fiturTambahanTerpenuhi / Math.max(1, preferensi.fiturTambahan.length);

    return (skorWajib * 0.7) + (skorTambahan * 0.3);
  }

  private hitungSkorSpesifikasi(mobil: MobilRekomendasi, preferensi: PreferensiPengguna): number {
    let skor = 0;
    let kriteria = 0;

    // Kapasitas mesin
    if (mobil.kapasitasMesin >= preferensi.kapasitasMesin.min && 
        mobil.kapasitasMesin <= preferensi.kapasitasMesin.max) {
      skor += 1;
    }
    kriteria++;

    // Jumlah penumpang
    if (mobil.jumlahPenumpang >= preferensi.jumlahPenumpang) {
      skor += 1;
    }
    kriteria++;

    return skor / kriteria;
  }

  private hitungSkorLokasi(mobil: MobilRekomendasi, preferensi: PreferensiPengguna): number {
    if (preferensi.lokasiPreferensi.length === 0) return 1;
    
    return preferensi.lokasiPreferensi.includes(mobil.dealer.lokasi) ? 1 : 0.5;
  }

  private generateAlasanRekomendasi(mobil: MobilRekomendasi, preferensi: PreferensiPengguna): string[] {
    const alasan: string[] = [];

    if (preferensi.merkPreferensi.includes(mobil.merk)) {
      alasan.push(`Sesuai dengan preferensi merk ${mobil.merk}`);
    }

    if (mobil.harga <= preferensi.rentangHarga.max) {
      alasan.push('Harga sesuai dengan budget Anda');
    }

    if (mobil.rating >= 4.0) {
      alasan.push('Rating tinggi dari pengguna lain');
    }

    if (mobil.stok > 0) {
      alasan.push('Tersedia stok');
    }

    return alasan;
  }

  private generateKelebihan(mobil: MobilRekomendasi): string[] {
    const kelebihan: string[] = [];

    if (mobil.rating >= 4.5) {
      kelebihan.push('Rating sangat tinggi');
    }

    if (mobil.popularitas >= 0.8) {
      kelebihan.push('Sangat populer');
    }

    if (mobil.diskon > 0) {
      kelebihan.push(`Diskon ${mobil.diskon.toLocaleString('id-ID')}`);
    }

    if (mobil.promo.length > 0) {
      kelebihan.push('Ada promo menarik');
    }

    return kelebihan;
  }

  private generateKekurangan(mobil: MobilRekomendasi): string[] {
    const kekurangan: string[] = [];

    if (mobil.stok <= 2) {
      kekurangan.push('Stok terbatas');
    }

    if (mobil.jumlahUlasan < 50) {
      kekurangan.push('Ulasan masih sedikit');
    }

    return kekurangan;
  }

  private tentukanTingkatKesesuaian(skor: number): 'sangat_tinggi' | 'tinggi' | 'sedang' | 'rendah' {
    if (skor >= 0.9) return 'sangat_tinggi';
    if (skor >= 0.7) return 'tinggi';
    if (skor >= 0.5) return 'sedang';
    return 'rendah';
  }

  private async validasiPreferensi(preferensi: Partial<PreferensiPengguna>): Promise<PreferensiPengguna> {
    // Validasi dan pembersihan data preferensi
    if (!preferensi.userId) {
      throw new Error('User ID diperlukan');
    }

    return preferensi as PreferensiPengguna;
  }

  private async lengkapiPreferensi(preferensi: PreferensiPengguna): Promise<PreferensiPengguna> {
    // Melengkapi data preferensi dengan default values
    return {
      ...preferensi,
      id: preferensi.id || `pref_${preferensi.userId}_${Date.now()}`,
      tanggalDibuat: preferensi.tanggalDibuat || new Date(),
      tanggalDiperbarui: new Date(),
      status: preferensi.status || 'aktif'
    };
  }

  private async simpanKeDatabase(preferensi: PreferensiPengguna): Promise<PreferensiPengguna> {
    // Simulasi penyimpanan ke database
    await this.simulasiDelay(500);
    return preferensi;
  }

  private async simpanHasilRekomendasi(hasil: HasilRekomendasi): Promise<void> {
    // Simulasi penyimpanan hasil rekomendasi
    await this.simulasiDelay(300);
  }

  private async updateStatistikRekomendasi(hasil: HasilRekomendasi): Promise<void> {
    // Simulasi update statistik
    await this.simulasiDelay(200);
  }

  private async updateProfilPengguna(preferensi: PreferensiPengguna): Promise<void> {
    // Simulasi update profil pengguna
    await this.simulasiDelay(200);
  }

  private async triggerRekomendasiUlang(userId: string): Promise<void> {
    // Simulasi trigger rekomendasi ulang
    await this.simulasiDelay(100);
  }

  private async validasiFeedback(feedback: Partial<FeedbackRekomendasi>): Promise<FeedbackRekomendasi> {
    if (!feedback.userId || !feedback.rekomendasiId) {
      throw new Error('User ID dan Rekomendasi ID diperlukan');
    }

    return feedback as FeedbackRekomendasi;
  }

  private async lengkapiFeedback(feedback: FeedbackRekomendasi): Promise<FeedbackRekomendasi> {
    return {
      ...feedback,
      id: feedback.id || `feedback_${Date.now()}`,
      tanggalDibuat: new Date()
    };
  }

  private async simpanFeedback(feedback: FeedbackRekomendasi): Promise<FeedbackRekomendasi> {
    await this.simulasiDelay(300);
    return feedback;
  }

  private async updateAlgoritmaRekomendasi(feedback: FeedbackRekomendasi): Promise<void> {
    // Simulasi update algoritma berdasarkan feedback
    await this.simulasiDelay(500);
  }

  private async updateStatistikFeedback(feedback: FeedbackRekomendasi): Promise<void> {
    await this.simulasiDelay(200);
  }

  private async hitungStatistikRekomendasi(
    periode?: { mulai: Date; selesai: Date }
  ): Promise<StatistikRekomendasi> {
    await this.simulasiDelay(800);

    return {
      totalRekomendasi: 1250,
      rekomendasiAktif: 890,
      tingkatAkurasi: 0.87,
      tingkatKepuasan: 4.2,
      mobilTerpopuler: [
        {
          mobilId: 'mobil_001',
          nama: 'Toyota Innova',
          jumlahRekomendasi: 145,
          tingkatKonversi: 0.23
        }
      ],
      trendPreferensi: [
        {
          kategori: 'SUV',
          persentase: 35.5,
          perubahan: 5.2
        }
      ],
      performaAlgoritma: [
        {
          algoritmaId: 'algo_hybrid_v1',
          nama: 'Hybrid Algorithm',
          akurasi: 0.87,
          kecepatan: 1200,
          penggunaan: 78.5
        }
      ],
      feedbackSummary: {
        totalFeedback: 456,
        ratingRataRata: 4.2,
        distribusiRating: [5, 12, 45, 189, 205],
        aspekTerbaik: ['Relevansi', 'Kelengkapan'],
        aspekTerburuk: ['Kecepatan', 'Variasi']
      },
      konversiPenjualan: {
        totalKonversi: 89,
        tingkatKonversi: 0.18,
        nilaiKonversi: 2450000000,
        waktuRataRataKonversi: 5.2
      },
      periode: periode || {
        mulai: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        selesai: new Date()
      }
    };
  }

  private async cacheStatistik(statistik: StatistikRekomendasi): Promise<void> {
    const key = `statistik_${Date.now()}`;
    this.cache.set(key, statistik);
  }

  private async tambahAlgoritma(algoritma: Partial<AlgoritmaRekomendasi>): Promise<AlgoritmaRekomendasi> {
    await this.simulasiDelay(600);
    
    return {
      ...algoritma,
      id: `algo_${Date.now()}`,
      tanggalDibuat: new Date(),
      tanggalDiperbarui: new Date(),
      status: 'aktif'
    } as AlgoritmaRekomendasi;
  }

  private async perbaruiAlgoritma(algoritma: Partial<AlgoritmaRekomendasi>): Promise<AlgoritmaRekomendasi> {
    await this.simulasiDelay(500);
    
    return {
      ...algoritma,
      tanggalDiperbarui: new Date()
    } as AlgoritmaRekomendasi;
  }

  private async hapusAlgoritma(id: string): Promise<AlgoritmaRekomendasi> {
    await this.simulasiDelay(400);
    
    return {
      id,
      status: 'nonaktif'
    } as AlgoritmaRekomendasi;
  }

  private async aktifkanAlgoritma(id: string): Promise<AlgoritmaRekomendasi> {
    await this.simulasiDelay(300);
    
    return {
      id,
      status: 'aktif',
      tanggalDiperbarui: new Date()
    } as AlgoritmaRekomendasi;
  }

  private async nonaktifkanAlgoritma(id: string): Promise<AlgoritmaRekomendasi> {
    await this.simulasiDelay(300);
    
    return {
      id,
      status: 'nonaktif',
      tanggalDiperbarui: new Date()
    } as AlgoritmaRekomendasi;
  }

  // ==================== METODE UTILITAS ====================

  private async simulasiDelay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleError(pesan: string, error: any): ResponLayanan<never> {
    console.error(`${pesan}:`, error);
    return {
      sukses: false,
      pesan,
      kode: 'ERROR',
      timestamp: new Date()
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logActivity(activity: string, data?: any): void {
    console.log(`[LayananRekomendasi] ${activity}`, data || '');
  }

  // ==================== INFORMASI LAYANAN ====================
  public static getServiceInfo() {
    return {
      nama: 'Layanan Rekomendasi',
      versi: '1.0.0',
      deskripsi: 'Layanan untuk mengelola sistem rekomendasi mobil',
      fiturUtama: [
        'Rekomendasi mobil berdasarkan preferensi',
        'Manajemen preferensi pengguna',
        'Sistem feedback dan rating',
        'Statistik dan analitik rekomendasi',
        'Manajemen algoritma rekomendasi'
      ],
      endpoints: [
        'ambilRekomendasiMobil',
        'simpanPreferensiPengguna',
        'berikanFeedback',
        'ambilStatistikRekomendasi',
        'kelolaAlgoritmaRekomendasi'
      ]
    };
  }
}

// Export default instance
export default LayananRekomendasi.getInstance();