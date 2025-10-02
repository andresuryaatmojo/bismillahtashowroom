// LayananMobil.ts
// Service untuk mengelola operasi terkait mobil di showroom

// Interfaces
interface DataMobil {
  id: string;
  nama: string;
  merk: string;
  model: string;
  tahun: number;
  warna: string;
  harga: number;
  hargaPromo?: number;
  status: 'tersedia' | 'terjual' | 'reserved' | 'maintenance' | 'discontinued';
  kategori: 'sedan' | 'suv' | 'hatchback' | 'mpv' | 'pickup' | 'coupe' | 'convertible';
  transmisi: 'manual' | 'automatic' | 'cvt' | 'dct';
  bahanBakar: 'bensin' | 'diesel' | 'hybrid' | 'electric';
  kapasitasMesin: number;
  tenagaMaksimal: number;
  torsiMaksimal: number;
  konsumsibbm: number;
  kapasitasTangki: number;
  jumlahPintu: number;
  kapasitasPenumpang: number;
  dimensi: {
    panjang: number;
    lebar: number;
    tinggi: number;
    wheelbase: number;
    groundClearance: number;
  };
  berat: {
    kosong: number;
    kotor: number;
  };
  fiturKeselamatan: string[];
  fiturKenyamanan: string[];
  fiturHiburan: string[];
  eksterior: string[];
  interior: string[];
  garansi: {
    kendaraan: string;
    mesin: string;
    servis: string;
  };
  foto: FotoMobil[];
  video?: VideoMobil[];
  brosur?: string;
  spesifikasiLengkap?: SpesifikasiDetail;
  riwayatHarga: RiwayatHarga[];
  popularitas: number;
  rating: number;
  jumlahUlasan: number;
  stok: number;
  lokasi: string;
  showroom: InfoShowroom;
  salesPerson?: InfoSales;
  tanggalMasuk: string;
  tanggalUpdate: string;
  metadata: MetadataMobil;
}

interface FotoMobil {
  id: string;
  url: string;
  judul: string;
  deskripsi?: string;
  jenis: 'eksterior' | 'interior' | 'mesin' | 'fitur' | 'detail';
  sudutPandang: string;
  isPrimary: boolean;
  urutan: number;
  resolusi: string;
  ukuranFile: number;
  tanggalUpload: string;
}

interface VideoMobil {
  id: string;
  url: string;
  judul: string;
  deskripsi?: string;
  jenis: 'review' | 'test_drive' | 'fitur' | 'interior_tour' | 'exterior_tour';
  durasi: number;
  thumbnail: string;
  resolusi: string;
  ukuranFile: number;
  tanggalUpload: string;
}

interface SpesifikasiDetail {
  mesin: {
    jenis: string;
    konfigurasi: string;
    kapasitas: number;
    tenagaMaksimal: string;
    torsiMaksimal: string;
    sistemBahanBakar: string;
    kompresi: string;
    katup: string;
  };
  transmisi: {
    jenis: string;
    jumlahGigi: number;
    sistemPenggerak: string;
  };
  suspensi: {
    depan: string;
    belakang: string;
  };
  rem: {
    depan: string;
    belakang: string;
    abs: boolean;
    ebd: boolean;
    ba: boolean;
  };
  kemudi: {
    jenis: string;
    powerSteering: boolean;
    tiltSteering: boolean;
    telescopicSteering: boolean;
  };
  roda: {
    ukuranVelg: string;
    ukuranBan: string;
    jenisVelg: string;
    banSerep: string;
  };
}

interface RiwayatHarga {
  tanggal: string;
  harga: number;
  jenisPerubahan: 'kenaikan' | 'penurunan' | 'promo' | 'normal';
  alasan?: string;
  validSampai?: string;
}

interface InfoShowroom {
  id: string;
  nama: string;
  alamat: string;
  kota: string;
  telepon: string;
  email: string;
  jamOperasional: string;
  koordinat: {
    latitude: number;
    longitude: number;
  };
}

interface InfoSales {
  id: string;
  nama: string;
  telepon: string;
  email: string;
  foto?: string;
  rating: number;
  pengalaman: number;
  spesialisasi: string[];
}

interface MetadataMobil {
  views: number;
  favorites: number;
  inquiries: number;
  testDrives: number;
  lastViewed: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  tags: string[];
}

interface KriteriaPencarian {
  merk?: string[];
  model?: string[];
  tahunMin?: number;
  tahunMax?: number;
  hargaMin?: number;
  hargaMax?: number;
  kategori?: string[];
  transmisi?: string[];
  bahanBakar?: string[];
  warna?: string[];
  status?: string[];
  lokasi?: string[];
  fitur?: string[];
  urutkan?: 'harga_asc' | 'harga_desc' | 'tahun_asc' | 'tahun_desc' | 'popularitas' | 'rating' | 'terbaru';
  halaman?: number;
  limit?: number;
}

interface HasilPencarian {
  mobil: DataMobil[];
  total: number;
  halaman: number;
  totalHalaman: number;
  filter: FilterTerapan;
  rekomendasi: DataMobil[];
  statistik: StatistikPencarian;
}

interface FilterTerapan {
  merk: { nama: string; jumlah: number }[];
  kategori: { nama: string; jumlah: number }[];
  rentangHarga: { min: number; max: number };
  tahun: { min: number; max: number };
  transmisi: { nama: string; jumlah: number }[];
  bahanBakar: { nama: string; jumlah: number }[];
  lokasi: { nama: string; jumlah: number }[];
}

interface StatistikPencarian {
  totalMobil: number;
  mobilTersedia: number;
  mobilTerjual: number;
  rataHarga: number;
  merkTerpopuler: string;
  kategoriTerpopuler: string;
  distribusiHarga: { rentang: string; jumlah: number }[];
  trendPencarian: { kata: string; frekuensi: number }[];
}

interface DetailLengkapMobil extends DataMobil {
  perbandingan: MobilSerupa[];
  aksesori: AksesoriTersedia[];
  paketKredit: PaketKredit[];
  asuransi: PaketAsuransi[];
  riwayatService: RiwayatService[];
  sertifikat: SertifikatMobil[];
  ulasan: UlasanMobil[];
  faq: FAQMobil[];
  simulasiKredit: SimulasiKredit;
  penawaran: PenawaranKhusus[];
  jadwalTestDrive: JadwalTestDrive[];
}

interface MobilSerupa {
  id: string;
  nama: string;
  merk: string;
  harga: number;
  foto: string;
  rating: number;
  perbedaan: string[];
  keunggulan: string[];
}

interface AksesoriTersedia {
  id: string;
  nama: string;
  kategori: string;
  harga: number;
  deskripsi: string;
  foto: string;
  stok: number;
  kompatibel: boolean;
}

interface PaketKredit {
  id: string;
  bank: string;
  jenisKredit: string;
  dp: number;
  tenor: number;
  bunga: number;
  angsuran: number;
  totalBayar: number;
  syarat: string[];
  keunggulan: string[];
}

interface PaketAsuransi {
  id: string;
  perusahaan: string;
  jenis: string;
  premi: number;
  coverage: string[];
  manfaat: string[];
  syarat: string[];
}

interface RiwayatService {
  tanggal: string;
  jenis: string;
  deskripsi: string;
  biaya: number;
  teknisi: string;
  status: string;
}

interface SertifikatMobil {
  jenis: string;
  nomor: string;
  tanggalTerbit: string;
  berlakuSampai: string;
  penerbit: string;
  dokumen: string;
}

interface UlasanMobil {
  id: string;
  pengguna: string;
  rating: number;
  judul: string;
  isi: string;
  tanggal: string;
  verified: boolean;
  helpful: number;
  aspekRating: {
    performa: number;
    kenyamanan: number;
    desain: number;
    fitur: number;
    valueForMoney: number;
  };
}

interface FAQMobil {
  pertanyaan: string;
  jawaban: string;
  kategori: string;
  helpful: number;
}

interface SimulasiKredit {
  hargaMobil: number;
  dpOptions: number[];
  tenorOptions: number[];
  bungaOptions: number[];
  simulasi: {
    dp: number;
    tenor: number;
    bunga: number;
    angsuran: number;
    totalBayar: number;
    totalBunga: number;
  }[];
}

interface PenawaranKhusus {
  id: string;
  judul: string;
  deskripsi: string;
  jenis: 'diskon' | 'cashback' | 'trade_in' | 'free_service' | 'free_accessories';
  nilai: number;
  syarat: string[];
  berlakuSampai: string;
  status: 'aktif' | 'expired' | 'coming_soon';
}

interface JadwalTestDrive {
  tanggal: string;
  waktu: string[];
  tersedia: boolean;
  lokasi: string;
  instruktur: string;
  durasi: number;
}

interface ResponLayanan<T = any> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
  metadata?: {
    timestamp: string;
    requestId: string;
    processingTime: number;
    cacheHit: boolean;
  };
}

// Main Service Class
class LayananMobil {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.loadConfiguration();
  }

  // Main Methods
  async ambilSemuaMobilShowroom(kriteria?: KriteriaPencarian): Promise<ResponLayanan<HasilPencarian>> {
    try {
      await this.simulateApiDelay(800);

      const cacheKey = `mobil_all_${JSON.stringify(kriteria || {})}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Data mobil berhasil dimuat dari cache',
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            processingTime: 50,
            cacheHit: true
          }
        };
      }

      // Generate mock data
      const semuaMobil = this.generateDaftarMobil();
      const mobilTerfilter = this.applyFilters(semuaMobil, kriteria);
      const mobilTerurut = this.applySorting(mobilTerfilter, kriteria?.urutkan);
      
      const halaman = kriteria?.halaman || 1;
      const limit = kriteria?.limit || 20;
      const startIndex = (halaman - 1) * limit;
      const endIndex = startIndex + limit;
      
      const mobilPaginated = mobilTerurut.slice(startIndex, endIndex);
      const totalHalaman = Math.ceil(mobilTerurut.length / limit);

      const hasil: HasilPencarian = {
        mobil: mobilPaginated,
        total: mobilTerurut.length,
        halaman,
        totalHalaman,
        filter: this.generateFilterTerapan(semuaMobil),
        rekomendasi: this.generateRekomendasiMobil(mobilPaginated),
        statistik: this.generateStatistikPencarian(semuaMobil)
      };

      this.setCache(cacheKey, hasil);

      return {
        success: true,
        data: hasil,
        message: `Berhasil memuat ${mobilPaginated.length} mobil dari total ${mobilTerurut.length} mobil`,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          processingTime: 800,
          cacheHit: false
        }
      };

    } catch (error) {
      return {
        success: false,
        message: 'Gagal memuat data mobil showroom',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          processingTime: 0,
          cacheHit: false
        }
      };
    }
  }

  async ambilDetailMobilUntukEdit(idMobil: string): Promise<ResponLayanan<DataMobil>> {
    try {
      await this.simulateApiDelay(600);

      const cacheKey = `mobil_edit_${idMobil}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Detail mobil untuk edit berhasil dimuat dari cache',
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            processingTime: 50,
            cacheHit: true
          }
        };
      }

      // Validate ID
      if (!idMobil || idMobil.trim() === '') {
        return {
          success: false,
          message: 'ID mobil tidak valid',
          errors: ['ID mobil harus diisi'],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            processingTime: 0,
            cacheHit: false
          }
        };
      }

      // Generate mock data for editing
      const mobilDetail = this.generateDetailMobilEdit(idMobil);

      if (!mobilDetail) {
        return {
          success: false,
          message: 'Mobil tidak ditemukan',
          errors: ['Mobil dengan ID tersebut tidak ditemukan dalam database'],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            processingTime: 600,
            cacheHit: false
          }
        };
      }

      this.setCache(cacheKey, mobilDetail);

      return {
        success: true,
        data: mobilDetail,
        message: 'Detail mobil untuk edit berhasil dimuat',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          processingTime: 600,
          cacheHit: false
        }
      };

    } catch (error) {
      return {
        success: false,
        message: 'Gagal memuat detail mobil untuk edit',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          processingTime: 0,
          cacheHit: false
        }
      };
    }
  }

  async hapusDataMobil(idMobil: string): Promise<ResponLayanan<{ deleted: boolean; backup?: DataMobil }>> {
    try {
      await this.simulateApiDelay(400);

      // Validate ID
      if (!idMobil || idMobil.trim() === '') {
        return {
          success: false,
          message: 'ID mobil tidak valid',
          errors: ['ID mobil harus diisi'],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            processingTime: 0,
            cacheHit: false
          }
        };
      }

      // Check if car exists and get backup data
      const mobilDetail = this.generateDetailMobilEdit(idMobil);
      
      if (!mobilDetail) {
        return {
          success: false,
          message: 'Mobil tidak ditemukan',
          errors: ['Mobil dengan ID tersebut tidak ditemukan dalam database'],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            processingTime: 400,
            cacheHit: false
          }
        };
      }

      // Check if car can be deleted (business rules)
      const canDelete = this.validateDeletion(mobilDetail);
      if (!canDelete.valid) {
        return {
          success: false,
          message: 'Mobil tidak dapat dihapus',
          errors: canDelete.errors,
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            processingTime: 400,
            cacheHit: false
          }
        };
      }

      // Simulate deletion process
      const deletionResult = {
        deleted: true,
        backup: mobilDetail
      };

      // Clear related cache
      this.clearRelatedCache(idMobil);

      // Log deletion activity
      this.logActivity('MOBIL_DELETED', {
        mobilId: idMobil,
        mobilNama: mobilDetail.nama,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        data: deletionResult,
        message: `Mobil ${mobilDetail.nama} berhasil dihapus`,
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          processingTime: 400,
          cacheHit: false
        }
      };

    } catch (error) {
      return {
        success: false,
        message: 'Gagal menghapus data mobil',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          processingTime: 0,
          cacheHit: false
        }
      };
    }
  }

  async ambilDetailLengkapMobil(idMobil: string): Promise<ResponLayanan<DetailLengkapMobil>> {
    try {
      await this.simulateApiDelay(1000);

      const cacheKey = `mobil_detail_${idMobil}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Detail lengkap mobil berhasil dimuat dari cache',
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            processingTime: 50,
            cacheHit: true
          }
        };
      }

      // Validate ID
      if (!idMobil || idMobil.trim() === '') {
        return {
          success: false,
          message: 'ID mobil tidak valid',
          errors: ['ID mobil harus diisi'],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            processingTime: 0,
            cacheHit: false
          }
        };
      }

      // Generate comprehensive car details
      const detailLengkap = this.generateDetailLengkapMobil(idMobil);

      if (!detailLengkap) {
        return {
          success: false,
          message: 'Mobil tidak ditemukan',
          errors: ['Mobil dengan ID tersebut tidak ditemukan dalam database'],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            processingTime: 1000,
            cacheHit: false
          }
        };
      }

      // Update view count
      detailLengkap.metadata.views += 1;
      detailLengkap.metadata.lastViewed = new Date().toISOString();

      this.setCache(cacheKey, detailLengkap);

      // Log view activity
      this.logActivity('MOBIL_VIEWED', {
        mobilId: idMobil,
        mobilNama: detailLengkap.nama,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        data: detailLengkap,
        message: 'Detail lengkap mobil berhasil dimuat',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          processingTime: 1000,
          cacheHit: false
        }
      };

    } catch (error) {
      return {
        success: false,
        message: 'Gagal memuat detail lengkap mobil',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          processingTime: 0,
          cacheHit: false
        }
      };
    }
  }

  // Private Methods
  private generateDaftarMobil(): DataMobil[] {
    const merkList = ['Toyota', 'Honda', 'Suzuki', 'Daihatsu', 'Mitsubishi', 'Nissan', 'Mazda', 'Hyundai'];
    const kategoriList: ('sedan' | 'suv' | 'hatchback' | 'mpv' | 'pickup' | 'coupe' | 'convertible')[] = 
      ['sedan', 'suv', 'hatchback', 'mpv', 'pickup', 'coupe', 'convertible'];
    const warnaList = ['Putih', 'Hitam', 'Silver', 'Merah', 'Biru', 'Abu-abu', 'Coklat', 'Kuning'];
    const statusList: ('tersedia' | 'terjual' | 'reserved' | 'maintenance' | 'discontinued')[] = 
      ['tersedia', 'terjual', 'reserved', 'maintenance', 'discontinued'];

    return Array.from({ length: 150 }, (_, i) => {
      const merk = merkList[Math.floor(Math.random() * merkList.length)];
      const kategori = kategoriList[Math.floor(Math.random() * kategoriList.length)];
      const tahun = 2018 + Math.floor(Math.random() * 6);
      const harga = Math.floor(Math.random() * 800000000) + 200000000;

      return {
        id: `mobil_${i + 1}`,
        nama: `${merk} ${this.getModelName(merk, kategori)} ${tahun}`,
        merk,
        model: this.getModelName(merk, kategori),
        tahun,
        warna: warnaList[Math.floor(Math.random() * warnaList.length)],
        harga,
        hargaPromo: Math.random() > 0.7 ? harga - Math.floor(Math.random() * 50000000) : undefined,
        status: statusList[Math.floor(Math.random() * statusList.length)],
        kategori,
        transmisi: Math.random() > 0.3 ? 'automatic' : 'manual',
        bahanBakar: Math.random() > 0.8 ? 'hybrid' : 'bensin',
        kapasitasMesin: Math.floor(Math.random() * 2000) + 1000,
        tenagaMaksimal: Math.floor(Math.random() * 200) + 100,
        torsiMaksimal: Math.floor(Math.random() * 300) + 150,
        konsumsibbm: Math.round((Math.random() * 10 + 8) * 10) / 10,
        kapasitasTangki: Math.floor(Math.random() * 30) + 40,
        jumlahPintu: kategori === 'coupe' ? 2 : (Math.random() > 0.5 ? 4 : 5),
        kapasitasPenumpang: Math.floor(Math.random() * 3) + 5,
        dimensi: {
          panjang: Math.floor(Math.random() * 1000) + 4000,
          lebar: Math.floor(Math.random() * 300) + 1700,
          tinggi: Math.floor(Math.random() * 400) + 1500,
          wheelbase: Math.floor(Math.random() * 500) + 2500,
          groundClearance: Math.floor(Math.random() * 100) + 150
        },
        berat: {
          kosong: Math.floor(Math.random() * 800) + 1200,
          kotor: Math.floor(Math.random() * 1000) + 1800
        },
        fiturKeselamatan: this.generateFiturKeselamatan(),
        fiturKenyamanan: this.generateFiturKenyamanan(),
        fiturHiburan: this.generateFiturHiburan(),
        eksterior: this.generateFiturEksterior(),
        interior: this.generateFiturInterior(),
        garansi: {
          kendaraan: '3 tahun / 100.000 km',
          mesin: '5 tahun / 150.000 km',
          servis: '4 kali gratis'
        },
        foto: this.generateFotoMobil(i + 1),
        video: Math.random() > 0.6 ? this.generateVideoMobil(i + 1) : undefined,
        brosur: `https://example.com/brosur/mobil_${i + 1}.pdf`,
        spesifikasiLengkap: this.generateSpesifikasiDetail(),
        riwayatHarga: this.generateRiwayatHarga(harga),
        popularitas: Math.floor(Math.random() * 100),
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        jumlahUlasan: Math.floor(Math.random() * 200),
        stok: Math.floor(Math.random() * 10) + 1,
        lokasi: 'Jakarta Selatan',
        showroom: this.generateInfoShowroom(),
        salesPerson: Math.random() > 0.3 ? this.generateInfoSales() : undefined,
        tanggalMasuk: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        tanggalUpdate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {
          views: Math.floor(Math.random() * 1000),
          favorites: Math.floor(Math.random() * 100),
          inquiries: Math.floor(Math.random() * 50),
          testDrives: Math.floor(Math.random() * 20),
          lastViewed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          seoTitle: `${merk} ${this.getModelName(merk, kategori)} ${tahun} - Harga Terbaik`,
          seoDescription: `Dapatkan ${merk} ${this.getModelName(merk, kategori)} ${tahun} dengan harga terbaik dan pelayanan terpercaya.`,
          seoKeywords: [merk.toLowerCase(), kategori, tahun.toString(), 'mobil', 'showroom'],
          tags: [merk.toLowerCase(), kategori, 'terbaru', 'berkualitas']
        }
      };
    });
  }

  private getModelName(merk: string, kategori: string): string {
    const modelMap: { [key: string]: { [key: string]: string[] } } = {
      'Toyota': {
        'sedan': ['Camry', 'Corolla', 'Vios'],
        'suv': ['Fortuner', 'Rush', 'Raize'],
        'hatchback': ['Yaris', 'Agya'],
        'mpv': ['Avanza', 'Innova', 'Alphard'],
        'pickup': ['Hilux']
      },
      'Honda': {
        'sedan': ['Civic', 'Accord', 'City'],
        'suv': ['CR-V', 'HR-V', 'BR-V'],
        'hatchback': ['Jazz', 'Brio'],
        'mpv': ['Odyssey', 'Freed']
      },
      'Suzuki': {
        'hatchback': ['Swift', 'Baleno'],
        'suv': ['Vitara', 'SX4'],
        'mpv': ['Ertiga', 'XL7'],
        'pickup': ['Carry']
      }
    };

    const merkModels = modelMap[merk];
    if (merkModels && merkModels[kategori]) {
      const models = merkModels[kategori];
      return models[Math.floor(Math.random() * models.length)];
    }
    
    return `Model ${kategori.toUpperCase()}`;
  }

  private generateFiturKeselamatan(): string[] {
    const fitur = [
      'ABS (Anti-lock Braking System)',
      'EBD (Electronic Brake Distribution)',
      'Airbag Driver & Passenger',
      'Side Impact Airbag',
      'Curtain Airbag',
      'Vehicle Stability Control',
      'Traction Control System',
      'Hill Start Assist',
      'Emergency Brake Assist',
      'Blind Spot Monitor',
      'Lane Departure Warning',
      'Forward Collision Warning',
      'Automatic Emergency Braking',
      'Rear Cross Traffic Alert',
      'Parking Sensors',
      'Reverse Camera',
      '360° Camera',
      'ISOFIX Child Seat Anchor'
    ];
    
    const jumlahFitur = Math.floor(Math.random() * 8) + 5;
    return this.shuffleArray(fitur).slice(0, jumlahFitur);
  }

  private generateFiturKenyamanan(): string[] {
    const fitur = [
      'AC Digital Automatic',
      'Dual Zone Climate Control',
      'Power Steering',
      'Tilt & Telescopic Steering',
      'Cruise Control',
      'Keyless Entry',
      'Push Start Button',
      'Power Window',
      'Central Locking',
      'Electric Folding Mirror',
      'Auto Folding Mirror',
      'Heated Seats',
      'Ventilated Seats',
      'Memory Seats',
      'Lumbar Support',
      'Armrest',
      'Cup Holder',
      'Wireless Charging',
      'USB Port',
      '12V Power Outlet'
    ];
    
    const jumlahFitur = Math.floor(Math.random() * 10) + 6;
    return this.shuffleArray(fitur).slice(0, jumlahFitur);
  }

  private generateFiturHiburan(): string[] {
    const fitur = [
      'Touchscreen Display',
      'Android Auto',
      'Apple CarPlay',
      'Bluetooth Connectivity',
      'USB Audio',
      'AUX Input',
      'CD Player',
      'Radio AM/FM',
      'Premium Sound System',
      'Subwoofer',
      'Steering Audio Control',
      'Voice Command',
      'Navigation System',
      'Rear Entertainment System',
      'WiFi Hotspot'
    ];
    
    const jumlahFitur = Math.floor(Math.random() * 8) + 4;
    return this.shuffleArray(fitur).slice(0, jumlahFitur);
  }

  private generateFiturEksterior(): string[] {
    const fitur = [
      'LED Headlights',
      'LED DRL',
      'LED Tail Lights',
      'Fog Lights',
      'Sunroof',
      'Panoramic Sunroof',
      'Roof Rail',
      'Side Steps',
      'Chrome Grille',
      'Body Kit',
      'Alloy Wheels',
      'Spare Tire',
      'Rear Spoiler',
      'Shark Fin Antenna',
      'Rain Sensing Wipers',
      'Auto Headlights'
    ];
    
    const jumlahFitur = Math.floor(Math.random() * 8) + 5;
    return this.shuffleArray(fitur).slice(0, jumlahFitur);
  }

  private generateFiturInterior(): string[] {
    const fitur = [
      'Leather Seats',
      'Fabric Seats',
      'Semi Leather Seats',
      'Dashboard Soft Touch',
      'Wooden Panel',
      'Carbon Fiber Trim',
      'Ambient Lighting',
      'Reading Lights',
      'Vanity Mirror',
      'Glove Box',
      'Storage Compartment',
      'Bottle Holder',
      'Coat Hook',
      'Floor Mats',
      'Cargo Net',
      'Luggage Hook'
    ];
    
    const jumlahFitur = Math.floor(Math.random() * 8) + 4;
    return this.shuffleArray(fitur).slice(0, jumlahFitur);
  }

  private generateFotoMobil(index: number): FotoMobil[] {
    const jenisFoto: ('eksterior' | 'interior' | 'mesin' | 'fitur' | 'detail')[] = 
      ['eksterior', 'interior', 'mesin', 'fitur', 'detail'];
    
    return Array.from({ length: 12 }, (_, i) => ({
      id: `foto_${index}_${i + 1}`,
      url: `https://picsum.photos/800/600?random=${index * 100 + i}`,
      judul: `Foto ${jenisFoto[i % jenisFoto.length]} ${i + 1}`,
      deskripsi: `Deskripsi foto ${jenisFoto[i % jenisFoto.length]}`,
      jenis: jenisFoto[i % jenisFoto.length],
      sudutPandang: this.getSudutPandang(jenisFoto[i % jenisFoto.length]),
      isPrimary: i === 0,
      urutan: i + 1,
      resolusi: '800x600',
      ukuranFile: Math.floor(Math.random() * 500000) + 100000,
      tanggalUpload: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));
  }

  private getSudutPandang(jenis: string): string {
    const sudutMap: { [key: string]: string[] } = {
      'eksterior': ['Depan', 'Belakang', 'Samping Kiri', 'Samping Kanan', '3/4 Depan', '3/4 Belakang'],
      'interior': ['Dashboard', 'Jok Depan', 'Jok Belakang', 'Bagasi', 'Konsol Tengah', 'Kemudi'],
      'mesin': ['Ruang Mesin', 'Mesin Detail', 'Engine Bay'],
      'fitur': ['Fitur Khusus', 'Detail Fitur', 'Teknologi'],
      'detail': ['Detail Eksterior', 'Detail Interior', 'Aksesoris']
    };
    
    const sudutList = sudutMap[jenis] || ['Umum'];
    return sudutList[Math.floor(Math.random() * sudutList.length)];
  }

  private generateVideoMobil(index: number): VideoMobil[] {
    const jenisVideo: ('review' | 'test_drive' | 'fitur' | 'interior_tour' | 'exterior_tour')[] = 
      ['review', 'test_drive', 'fitur', 'interior_tour', 'exterior_tour'];
    
    return Array.from({ length: 3 }, (_, i) => ({
      id: `video_${index}_${i + 1}`,
      url: `https://example.com/video/mobil_${index}_${i + 1}.mp4`,
      judul: `Video ${jenisVideo[i % jenisVideo.length]} Mobil ${index}`,
      deskripsi: `Deskripsi video ${jenisVideo[i % jenisVideo.length]}`,
      jenis: jenisVideo[i % jenisVideo.length],
      durasi: Math.floor(Math.random() * 600) + 120, // 2-12 minutes
      thumbnail: `https://picsum.photos/400/300?random=${index * 10 + i}`,
      resolusi: '1920x1080',
      ukuranFile: Math.floor(Math.random() * 100000000) + 50000000,
      tanggalUpload: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));
  }

  private generateSpesifikasiDetail(): SpesifikasiDetail {
    return {
      mesin: {
        jenis: 'DOHC 16 Valve',
        konfigurasi: 'Inline 4 Cylinder',
        kapasitas: Math.floor(Math.random() * 2000) + 1000,
        tenagaMaksimal: `${Math.floor(Math.random() * 100) + 100} HP @ ${Math.floor(Math.random() * 2000) + 4000} rpm`,
        torsiMaksimal: `${Math.floor(Math.random() * 200) + 150} Nm @ ${Math.floor(Math.random() * 2000) + 2000} rpm`,
        sistemBahanBakar: 'Electronic Fuel Injection',
        kompresi: `${Math.floor(Math.random() * 5) + 9}:1`,
        katup: '16 Valve DOHC'
      },
      transmisi: {
        jenis: Math.random() > 0.5 ? 'CVT' : '6-Speed Automatic',
        jumlahGigi: Math.random() > 0.5 ? 6 : 7,
        sistemPenggerak: Math.random() > 0.8 ? 'AWD' : 'FWD'
      },
      suspensi: {
        depan: 'MacPherson Strut',
        belakang: Math.random() > 0.5 ? 'Torsion Beam' : 'Multi-Link'
      },
      rem: {
        depan: 'Ventilated Disc',
        belakang: Math.random() > 0.5 ? 'Disc' : 'Drum',
        abs: true,
        ebd: true,
        ba: Math.random() > 0.5
      },
      kemudi: {
        jenis: 'Rack & Pinion',
        powerSteering: true,
        tiltSteering: Math.random() > 0.3,
        telescopicSteering: Math.random() > 0.6
      },
      roda: {
        ukuranVelg: `${Math.floor(Math.random() * 4) + 15}"`,
        ukuranBan: `${Math.floor(Math.random() * 50) + 185}/${Math.floor(Math.random() * 30) + 60}R${Math.floor(Math.random() * 4) + 15}`,
        jenisVelg: Math.random() > 0.5 ? 'Alloy' : 'Steel',
        banSerep: 'Full Size'
      }
    };
  }

  private generateRiwayatHarga(hargaSekarang: number): RiwayatHarga[] {
    const riwayat: RiwayatHarga[] = [];
    let harga = hargaSekarang;
    
    for (let i = 0; i < 6; i++) {
      const tanggal = new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000);
      const perubahan = Math.random() * 0.1 - 0.05; // -5% to +5%
      const hargaBaru = Math.floor(harga * (1 + perubahan));
      
      riwayat.push({
        tanggal: tanggal.toISOString(),
        harga: hargaBaru,
        jenisPerubahan: hargaBaru > harga ? 'kenaikan' : hargaBaru < harga ? 'penurunan' : 'normal',
        alasan: this.getAlasanPerubahanHarga(hargaBaru > harga ? 'kenaikan' : 'penurunan'),
        validSampai: new Date(tanggal.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      harga = hargaBaru;
    }
    
    return riwayat;
  }

  private getAlasanPerubahanHarga(jenis: string): string {
    const alasanKenaikan = [
      'Kenaikan harga bahan baku',
      'Inflasi ekonomi',
      'Peningkatan permintaan',
      'Kebijakan pemerintah',
      'Kenaikan biaya produksi'
    ];
    
    const alasanPenurunan = [
      'Promo khusus',
      'Clearance stock',
      'Kompetisi pasar',
      'Program diskon',
      'Strategi penjualan'
    ];
    
    const daftar = jenis === 'kenaikan' ? alasanKenaikan : alasanPenurunan;
    return daftar[Math.floor(Math.random() * daftar.length)];
  }

  private generateInfoShowroom(): InfoShowroom {
    const showrooms = [
      {
        nama: 'Mobilindo Showroom Jakarta Selatan',
        alamat: 'Jl. Sudirman No. 123',
        kota: 'Jakarta Selatan'
      },
      {
        nama: 'Mobilindo Showroom Bekasi',
        alamat: 'Jl. Ahmad Yani No. 456',
        kota: 'Bekasi'
      },
      {
        nama: 'Mobilindo Showroom Tangerang',
        alamat: 'Jl. Gatot Subroto No. 789',
        kota: 'Tangerang'
      }
    ];
    
    const showroom = showrooms[Math.floor(Math.random() * showrooms.length)];
    
    return {
      id: `showroom_${Math.floor(Math.random() * 100)}`,
      nama: showroom.nama,
      alamat: showroom.alamat,
      kota: showroom.kota,
      telepon: `021-${Math.floor(Math.random() * 90000000) + 10000000}`,
      email: `info@${showroom.nama.toLowerCase().replace(/\s+/g, '')}.com`,
      jamOperasional: '08:00 - 17:00 (Senin - Sabtu)',
      koordinat: {
        latitude: -6.2 + Math.random() * 0.2,
        longitude: 106.8 + Math.random() * 0.2
      }
    };
  }

  private generateInfoSales(): InfoSales {
    const namaDepan = ['Ahmad', 'Budi', 'Citra', 'Dian', 'Eko', 'Fitri', 'Gunawan', 'Hani'];
    const namaBelakang = ['Santoso', 'Wijaya', 'Sari', 'Pratama', 'Kusuma', 'Dewi', 'Putra', 'Lestari'];
    
    const nama = `${namaDepan[Math.floor(Math.random() * namaDepan.length)]} ${namaBelakang[Math.floor(Math.random() * namaBelakang.length)]}`;
    
    return {
      id: `sales_${Math.floor(Math.random() * 1000)}`,
      nama,
      telepon: `081${Math.floor(Math.random() * 900000000) + 100000000}`,
      email: `${nama.toLowerCase().replace(/\s+/g, '.')}@mobilindo.com`,
      foto: `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`,
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      pengalaman: Math.floor(Math.random() * 10) + 1,
      spesialisasi: this.generateSpesialisasiSales()
    };
  }

  private generateSpesialisasiSales(): string[] {
    const spesialisasi = [
      'Mobil Keluarga',
      'Mobil Mewah',
      'SUV',
      'Sedan',
      'Hatchback',
      'MPV',
      'Mobil Hybrid',
      'Mobil Listrik',
      'Kredit Mobil',
      'Trade In',
      'Asuransi Kendaraan',
      'After Sales Service'
    ];
    
    const jumlah = Math.floor(Math.random() * 4) + 2;
    return this.shuffleArray(spesialisasi).slice(0, jumlah);
  }

  private applyFilters(mobil: DataMobil[], kriteria?: KriteriaPencarian): DataMobil[] {
    if (!kriteria) return mobil;

    let filtered = [...mobil];

    if (kriteria.merk?.length) {
      filtered = filtered.filter(m => kriteria.merk!.includes(m.merk));
    }

    if (kriteria.model?.length) {
      filtered = filtered.filter(m => kriteria.model!.includes(m.model));
    }

    if (kriteria.tahunMin) {
      filtered = filtered.filter(m => m.tahun >= kriteria.tahunMin!);
    }

    if (kriteria.tahunMax) {
      filtered = filtered.filter(m => m.tahun <= kriteria.tahunMax!);
    }

    if (kriteria.hargaMin) {
      filtered = filtered.filter(m => m.harga >= kriteria.hargaMin!);
    }

    if (kriteria.hargaMax) {
      filtered = filtered.filter(m => m.harga <= kriteria.hargaMax!);
    }

    if (kriteria.kategori?.length) {
      filtered = filtered.filter(m => kriteria.kategori!.includes(m.kategori));
    }

    if (kriteria.transmisi?.length) {
      filtered = filtered.filter(m => kriteria.transmisi!.includes(m.transmisi));
    }

    if (kriteria.bahanBakar?.length) {
      filtered = filtered.filter(m => kriteria.bahanBakar!.includes(m.bahanBakar));
    }

    if (kriteria.warna?.length) {
      filtered = filtered.filter(m => kriteria.warna!.includes(m.warna));
    }

    if (kriteria.status?.length) {
      filtered = filtered.filter(m => kriteria.status!.includes(m.status));
    }

    if (kriteria.lokasi?.length) {
      filtered = filtered.filter(m => kriteria.lokasi!.includes(m.lokasi));
    }

    return filtered;
  }

  private applySorting(mobil: DataMobil[], urutkan?: string): DataMobil[] {
    const sorted = [...mobil];

    switch (urutkan) {
      case 'harga_asc':
        return sorted.sort((a, b) => a.harga - b.harga);
      case 'harga_desc':
        return sorted.sort((a, b) => b.harga - a.harga);
      case 'tahun_asc':
        return sorted.sort((a, b) => a.tahun - b.tahun);
      case 'tahun_desc':
        return sorted.sort((a, b) => b.tahun - a.tahun);
      case 'popularitas':
        return sorted.sort((a, b) => b.popularitas - a.popularitas);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'terbaru':
        return sorted.sort((a, b) => new Date(b.tanggalMasuk).getTime() - new Date(a.tanggalMasuk).getTime());
      default:
        return sorted;
    }
  }

  private generateFilterTerapan(mobil: DataMobil[]): FilterTerapan {
    const merkCount = this.countByField(mobil, 'merk');
    const kategoriCount = this.countByField(mobil, 'kategori');
    const transmisiCount = this.countByField(mobil, 'transmisi');
    const bahanBakarCount = this.countByField(mobil, 'bahanBakar');
    const lokasiCount = this.countByField(mobil, 'lokasi');

    const hargaList = mobil.map(m => m.harga);
    const tahunList = mobil.map(m => m.tahun);

    return {
      merk: Object.entries(merkCount).map(([nama, jumlah]) => ({ nama, jumlah })),
      kategori: Object.entries(kategoriCount).map(([nama, jumlah]) => ({ nama, jumlah })),
      rentangHarga: {
        min: Math.min(...hargaList),
        max: Math.max(...hargaList)
      },
      tahun: {
        min: Math.min(...tahunList),
        max: Math.max(...tahunList)
      },
      transmisi: Object.entries(transmisiCount).map(([nama, jumlah]) => ({ nama, jumlah })),
      bahanBakar: Object.entries(bahanBakarCount).map(([nama, jumlah]) => ({ nama, jumlah })),
      lokasi: Object.entries(lokasiCount).map(([nama, jumlah]) => ({ nama, jumlah }))
    };
  }

  private countByField(mobil: DataMobil[], field: keyof DataMobil): { [key: string]: number } {
    return mobil.reduce((acc, m) => {
      const value = m[field] as string;
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  private generateRekomendasiMobil(mobilSaatIni: DataMobil[]): DataMobil[] {
    // Simple recommendation based on similar category and price range
    if (mobilSaatIni.length === 0) return [];

    const avgPrice = mobilSaatIni.reduce((sum, m) => sum + m.harga, 0) / mobilSaatIni.length;
    const categories = Array.from(new Set(mobilSaatIni.map(m => m.kategori)));

    const allMobil = this.generateDaftarMobil();
    const rekomendasi = allMobil
      .filter(m => 
        categories.includes(m.kategori) &&
        Math.abs(m.harga - avgPrice) < avgPrice * 0.3 &&
        !mobilSaatIni.some(current => current.id === m.id)
      )
      .sort((a, b) => b.popularitas - a.popularitas)
      .slice(0, 6);

    return rekomendasi;
  }

  private generateStatistikPencarian(mobil: DataMobil[]): StatistikPencarian {
    const totalMobil = mobil.length;
    const mobilTersedia = mobil.filter(m => m.status === 'tersedia').length;
    const mobilTerjual = mobil.filter(m => m.status === 'terjual').length;
    const rataHarga = mobil.reduce((sum, m) => sum + m.harga, 0) / totalMobil;

    const merkCount = this.countByField(mobil, 'merk');
    const merkTerpopuler = Object.entries(merkCount).sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    const kategoriCount = this.countByField(mobil, 'kategori');
    const kategoriTerpopuler = Object.entries(kategoriCount).sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    return {
      totalMobil,
      mobilTersedia,
      mobilTerjual,
      rataHarga,
      merkTerpopuler,
      kategoriTerpopuler,
      distribusiHarga: this.generateDistribusiHarga(mobil),
      trendPencarian: this.generateTrendPencarian()
    };
  }

  private generateDistribusiHarga(mobil: DataMobil[]): { rentang: string; jumlah: number }[] {
    const ranges = [
      { min: 0, max: 200000000, label: '< 200 Juta' },
      { min: 200000000, max: 400000000, label: '200-400 Juta' },
      { min: 400000000, max: 600000000, label: '400-600 Juta' },
      { min: 600000000, max: 800000000, label: '600-800 Juta' },
      { min: 800000000, max: Infinity, label: '> 800 Juta' }
    ];

    return ranges.map(range => ({
      rentang: range.label,
      jumlah: mobil.filter(m => m.harga >= range.min && m.harga < range.max).length
    }));
  }

  private generateTrendPencarian(): { kata: string; frekuensi: number }[] {
    return [
      { kata: 'SUV', frekuensi: 245 },
      { kata: 'Automatic', frekuensi: 198 },
      { kata: 'Toyota', frekuensi: 187 },
      { kata: 'Honda', frekuensi: 156 },
      { kata: 'MPV', frekuensi: 134 },
      { kata: 'Sedan', frekuensi: 123 },
      { kata: 'Hybrid', frekuensi: 98 },
      { kata: 'Hatchback', frekuensi: 87 }
    ];
  }

  private generateDetailMobilEdit(idMobil: string): DataMobil | null {
    // Generate a specific car for editing based on ID
    const allMobil = this.generateDaftarMobil();
    const mobil = allMobil.find(m => m.id === idMobil);
    
    if (!mobil) return null;

    // Add additional edit-specific data
    return {
      ...mobil,
      // Add any edit-specific fields here
    };
  }

  private generateDetailLengkapMobil(idMobil: string): DetailLengkapMobil | null {
    const mobilBase = this.generateDetailMobilEdit(idMobil);
    if (!mobilBase) return null;

    return {
      ...mobilBase,
      perbandingan: this.generateMobilSerupa(),
      aksesori: this.generateAksesoriTersedia(),
      paketKredit: this.generatePaketKredit(mobilBase.harga),
      asuransi: this.generatePaketAsuransi(),
      riwayatService: this.generateRiwayatService(),
      sertifikat: this.generateSertifikatMobil(),
      ulasan: this.generateUlasanMobil(),
      faq: this.generateFAQMobil(),
      simulasiKredit: this.generateSimulasiKredit(mobilBase.harga),
      penawaran: this.generatePenawaranKhusus(),
      jadwalTestDrive: this.generateJadwalTestDrive()
    };
  }

  private generateMobilSerupa(): MobilSerupa[] {
    return Array.from({ length: 4 }, (_, i) => ({
      id: `serupa_${i + 1}`,
      nama: `Mobil Serupa ${i + 1}`,
      merk: ['Toyota', 'Honda', 'Suzuki'][i % 3],
      harga: Math.floor(Math.random() * 500000000) + 200000000,
      foto: `https://picsum.photos/300/200?random=${i + 100}`,
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      perbedaan: [
        'Kapasitas mesin berbeda',
        'Fitur keselamatan lebih lengkap',
        'Desain interior berbeda'
      ],
      keunggulan: [
        'Konsumsi BBM lebih irit',
        'Harga lebih kompetitif',
        'Garansi lebih panjang'
      ]
    }));
  }

  private generateAksesoriTersedia(): AksesoriTersedia[] {
    const aksesori = [
      'Karpet Dasar', 'Sarung Jok', 'Talang Air', 'Spoiler', 'Fog Lamp',
      'Roof Rack', 'Mud Guard', 'Door Visor', 'Parking Sensor', 'Dashcam'
    ];

    return aksesori.map((nama, i) => ({
      id: `aksesori_${i + 1}`,
      nama,
      kategori: i < 5 ? 'Interior' : 'Eksterior',
      harga: Math.floor(Math.random() * 2000000) + 500000,
      deskripsi: `Deskripsi untuk ${nama}`,
      foto: `https://picsum.photos/200/200?random=${i + 200}`,
      stok: Math.floor(Math.random() * 20) + 5,
      kompatibel: Math.random() > 0.2
    }));
  }

  private generatePaketKredit(hargaMobil: number): PaketKredit[] {
    const banks = ['BCA', 'Mandiri', 'BRI', 'BNI', 'CIMB Niaga'];
    const tenors = [12, 24, 36, 48, 60];
    
    return banks.map((bank, i) => {
      const tenor = tenors[i % tenors.length];
      const dp = Math.floor(hargaMobil * (0.2 + Math.random() * 0.1)); // 20-30% DP
      const bunga = Math.round((Math.random() * 5 + 5) * 100) / 100; // 5-10% bunga
      const pokokPinjaman = hargaMobil - dp;
      const angsuran = Math.floor((pokokPinjaman * (bunga / 100 / 12)) / (1 - Math.pow(1 + (bunga / 100 / 12), -tenor)));
      const totalBayar = dp + (angsuran * tenor);

      return {
        id: `kredit_${i + 1}`,
        bank,
        jenisKredit: 'Kredit Kendaraan Bermotor',
        dp,
        tenor,
        bunga,
        angsuran,
        totalBayar,
        syarat: [
          'KTP dan KK',
          'Slip gaji 3 bulan terakhir',
          'Rekening koran 3 bulan',
          'NPWP',
          'Surat keterangan kerja'
        ],
        keunggulan: [
          'Proses cepat 1-3 hari',
          'Bunga kompetitif',
          'Tenor fleksibel',
          'Tanpa biaya admin'
        ]
      };
    });
  }

  private generatePaketAsuransi(): PaketAsuransi[] {
    const perusahaan = ['Allianz', 'ACA', 'Sinarmas', 'Zurich', 'Garda Oto'];
    
    return perusahaan.map((nama, i) => ({
      id: `asuransi_${i + 1}`,
      perusahaan: nama,
      jenis: i % 2 === 0 ? 'All Risk' : 'Total Loss Only',
      premi: Math.floor(Math.random() * 10000000) + 5000000,
      coverage: i % 2 === 0 ? [
        'Kerusakan akibat kecelakaan',
        'Pencurian',
        'Kebakaran',
        'Bencana alam',
        'Kerusuhan',
        'Terorisme'
      ] : [
        'Kehilangan total',
        'Pencurian',
        'Kebakaran total'
      ],
      manfaat: [
        'Bengkel rekanan luas',
        'Layanan 24 jam',
        'Derek gratis',
        'Mobil pengganti'
      ],
      syarat: [
        'Mobil maksimal 8 tahun',
        'Kondisi mobil baik',
        'Dokumen lengkap',
        'Survey kendaraan'
      ]
    }));
  }

  private generateRiwayatService(): RiwayatService[] {
    return Array.from({ length: 5 }, (_, i) => ({
      tanggal: new Date(Date.now() - (i + 1) * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      jenis: ['Service Berkala', 'Ganti Oli', 'Tune Up', 'Perbaikan AC', 'Ganti Ban'][i],
      deskripsi: `Deskripsi service ${['Service Berkala', 'Ganti Oli', 'Tune Up', 'Perbaikan AC', 'Ganti Ban'][i]}`,
      biaya: Math.floor(Math.random() * 2000000) + 500000,
      teknisi: `Teknisi ${i + 1}`,
      status: 'Selesai'
    }));
  }

  private generateSertifikatMobil(): SertifikatMobil[] {
    return [
      {
        jenis: 'STNK',
        nomor: `B ${Math.floor(Math.random() * 9000) + 1000} ABC`,
        tanggalTerbit: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        berlakuSampai: new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        penerbit: 'Polda Metro Jaya',
        dokumen: '/documents/stnk.pdf'
      },
      {
        jenis: 'BPKB',
        nomor: `${Math.floor(Math.random() * 900000) + 100000}`,
        tanggalTerbit: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        berlakuSampai: 'Seumur hidup',
        penerbit: 'Polda Metro Jaya',
        dokumen: '/documents/bpkb.pdf'
      }
    ];
  }

  private generateUlasanMobil(): UlasanMobil[] {
    const pengguna = ['Ahmad S.', 'Budi W.', 'Citra D.', 'Dian P.', 'Eko K.'];
    const judul = [
      'Mobil yang sangat memuaskan',
      'Performa luar biasa',
      'Nyaman untuk keluarga',
      'Irit dan handal',
      'Desain yang menarik'
    ];

    return pengguna.map((nama, i) => ({
      id: `ulasan_${i + 1}`,
      pengguna: nama,
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
      judul: judul[i],
      isi: `Ulasan lengkap untuk ${judul[i]}. Saya sangat puas dengan performa dan kualitas mobil ini.`,
      tanggal: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      verified: Math.random() > 0.3,
      helpful: Math.floor(Math.random() * 20) + 5,
      aspekRating: {
        performa: Math.floor(Math.random() * 2) + 4,
        kenyamanan: Math.floor(Math.random() * 2) + 4,
        desain: Math.floor(Math.random() * 2) + 4,
        fitur: Math.floor(Math.random() * 2) + 4,
        valueForMoney: Math.floor(Math.random() * 2) + 4
      }
    }));
  }

  private generateFAQMobil(): FAQMobil[] {
    return [
      {
        pertanyaan: 'Berapa konsumsi BBM mobil ini?',
        jawaban: 'Konsumsi BBM rata-rata 12-15 km/liter tergantung kondisi jalan dan gaya berkendara.',
        kategori: 'Performa',
        helpful: 25
      },
      {
        pertanyaan: 'Apakah tersedia paket kredit?',
        jawaban: 'Ya, tersedia berbagai paket kredit dengan DP mulai dari 20% dan tenor hingga 5 tahun.',
        kategori: 'Pembiayaan',
        helpful: 18
      },
      {
        pertanyaan: 'Bagaimana dengan garansi?',
        jawaban: 'Garansi kendaraan 3 tahun/100.000 km dan garansi mesin 5 tahun/150.000 km.',
        kategori: 'Garansi',
        helpful: 22
      },
      {
        pertanyaan: 'Apakah bisa test drive?',
        jawaban: 'Ya, test drive tersedia setiap hari dengan perjanjian terlebih dahulu.',
        kategori: 'Test Drive',
        helpful: 15
      }
    ];
  }

  private generateSimulasiKredit(hargaMobil: number): SimulasiKredit {
    const dpOptions = [20, 25, 30, 35].map(persen => Math.floor(hargaMobil * persen / 100));
    const tenorOptions = [12, 24, 36, 48, 60];
    const bungaOptions = [5.5, 6.0, 6.5, 7.0, 7.5];

    const simulasi = [];
    for (const dp of dpOptions.slice(0, 2)) {
      for (const tenor of tenorOptions.slice(0, 3)) {
        for (const bunga of bungaOptions.slice(0, 2)) {
          const pokokPinjaman = hargaMobil - dp;
          const bungaBulanan = bunga / 100 / 12;
          const angsuran = Math.floor((pokokPinjaman * bungaBulanan) / (1 - Math.pow(1 + bungaBulanan, -tenor)));
          const totalBayar = dp + (angsuran * tenor);
          const totalBunga = totalBayar - hargaMobil;

          simulasi.push({
            dp,
            tenor,
            bunga,
            angsuran,
            totalBayar,
            totalBunga
          });
        }
      }
    }

    return {
      hargaMobil,
      dpOptions,
      tenorOptions,
      bungaOptions,
      simulasi: simulasi.slice(0, 12) // Limit to 12 combinations
    };
  }

  private generatePenawaranKhusus(): PenawaranKhusus[] {
    return [
      {
        id: 'penawaran_1',
        judul: 'Diskon Akhir Tahun',
        deskripsi: 'Dapatkan diskon hingga 50 juta untuk pembelian bulan ini',
        jenis: 'diskon',
        nilai: 50000000,
        syarat: ['Pembelian cash', 'Stock terbatas'],
        berlakuSampai: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'aktif'
      },
      {
        id: 'penawaran_2',
        judul: 'Trade In Bonus',
        deskripsi: 'Tukar tambah mobil lama dengan harga terbaik',
        jenis: 'trade_in',
        nilai: 25000000,
        syarat: ['Mobil lama maksimal 10 tahun', 'Kondisi baik'],
        berlakuSampai: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'aktif'
      }
    ];
  }

  private generateJadwalTestDrive(): JadwalTestDrive[] {
    const jadwal = [];
    for (let i = 0; i < 7; i++) {
      const tanggal = new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      jadwal.push({
        tanggal,
        waktu: ['09:00', '11:00', '13:00', '15:00'],
        tersedia: Math.random() > 0.3,
        lokasi: 'Showroom Jakarta Selatan',
        instruktur: 'Instruktur Professional',
        durasi: 30
      });
    }
    return jadwal;
  }

  private validateDeletion(mobil: DataMobil): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Business rules for deletion
    if (mobil.status === 'reserved') {
      errors.push('Mobil sedang dalam status reserved, tidak dapat dihapus');
    }

    if (mobil.stok > 0 && mobil.status === 'tersedia') {
      errors.push('Mobil masih tersedia dan memiliki stok, pertimbangkan untuk mengubah status');
    }

    // Add more business rules as needed

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private clearRelatedCache(idMobil: string): void {
    const keysToDelete = [];
    const cacheKeys = Array.from(this.cache.keys()); for (const key of cacheKeys) {
      if (key.includes(idMobil)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Utility Methods
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private clearCache(): void {
    this.cache.clear();
  }

  private loadConfiguration(): void {
    console.log('Loading LayananMobil configuration...');
  }

  private async simulateApiDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  private formatDate(date: string): string {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private logActivity(activity: string, details?: any): void {
    console.log(`[LayananMobil] ${activity}`, details);
  }

  // Service Info
  getServiceInfo(): any {
    return {
      name: 'LayananMobil',
      version: '1.0.0',
      description: 'Service untuk mengelola operasi terkait mobil di showroom',
      methods: [
        'ambilSemuaMobilShowroom',
        'ambilDetailMobilUntukEdit',
        'hapusDataMobil',
        'ambilDetailLengkapMobil'
      ],
      features: [
        'Car inventory management',
        'Advanced search and filtering',
        'Detailed car specifications',
        'Photo and video management',
        'Price history tracking',
        'Credit simulation',
        'Insurance packages',
        'Test drive scheduling',
        'Car comparison',
        'Customer reviews',
        'FAQ management'
      ]
    };
  }
}

// Export default
export default LayananMobil;
