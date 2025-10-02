// ==================== LAYANAN PERBANDINGAN ====================
// Service untuk mengelola perbandingan mobil
// Sistem Mobilindo Showroom

// ==================== INTERFACES ====================

export interface DataMobilPerbandingan {
  id: string;
  nama: string;
  merk: string;
  model: string;
  varian: string;
  tahun: number;
  harga: HargaMobil;
  spesifikasi: SpesifikasiLengkap;
  fitur: FiturMobil;
  performa: PerformaMobil;
  dimensi: DimensiMobil;
  mesin: MesinMobil;
  transmisi: TransmisiMobil;
  suspensi: SuspensiMobil;
  rem: RemMobil;
  roda: RodaMobil;
  interior: InteriorMobil;
  eksterior: EksteriorMobil;
  keamanan: KeamananMobil;
  kenyamanan: KenyamananMobil;
  hiburan: HiburanMobil;
  konsumsibbm: KonsumsibbmMobil;
  garansi: GaransiMobil;
  dealer: DealerInfo;
  gambar: GambarMobil[];
  video?: VideoMobil[];
  review: ReviewSingkat;
  rating: RatingMobil;
  popularitas: PopularitasMobil;
  promo?: PromoMobil[];
  availability: AvailabilityMobil;
  lastUpdated: Date;
}

export interface HargaMobil {
  hargaOtr: number;
  hargaOff: number;
  dp: DpOption[];
  cicilan: CicilanOption[];
  diskon?: DiskonInfo;
  cashback?: number;
  tradeIn?: TradeInInfo;
}

export interface DpOption {
  persentase: number;
  nominal: number;
  cicilanPerBulan: number;
  tenor: number;
}

export interface CicilanOption {
  tenor: number; // dalam bulan
  cicilanPerBulan: number;
  totalBayar: number;
  bunga: number;
  asuransi: number;
}

export interface DiskonInfo {
  nominal: number;
  persentase: number;
  berlakuHingga: Date;
  syarat: string[];
}

export interface TradeInInfo {
  tersedia: boolean;
  estimasiHarga?: number;
  bonus?: number;
}

export interface SpesifikasiLengkap {
  kategori: string;
  segmen: string;
  jenisBody: string;
  jumlahPintu: number;
  kapasitasPenumpang: number;
  jenisTransmisi: string;
  jenisRem: string;
  jenisKemudi: string;
  jenisAc: string;
  kapasitasTangki: number;
  ground_clearance: number;
  radius_putar: number;
}

export interface FiturMobil {
  fiturKeselamatan: string[];
  fiturKenyamanan: string[];
  fiturHiburan: string[];
  fiturEksterior: string[];
  fiturInterior: string[];
  fiturMesin: string[];
  fiturTambahan: string[];
}

export interface PerformaMobil {
  topSpeed: number;
  akselerasi0_100: number;
  konsumsibbmKota: number;
  konsumsibbmLuarKota: number;
  konsumsibbmGabungan: number;
  emisiCo2: number;
  torsiMaksimum: number;
  dayaMaksimum: number;
}

export interface DimensiMobil {
  panjang: number;
  lebar: number;
  tinggi: number;
  wheelbase: number;
  ground_clearance: number;
  beratKosong: number;
  beratKotor: number;
  kapasitasBagasi: number;
}

export interface MesinMobil {
  tipe: string;
  kapasitas: number;
  jumlahSilinder: number;
  jumlahKatup: number;
  sistemBahanBakar: string;
  dayaMaksimum: string;
  torsiMaksimum: string;
  kompresi: string;
  bahan_bakar: string;
}

export interface TransmisiMobil {
  tipe: string;
  jumlahGigi: number;
  sistem: string;
}

export interface SuspensiMobil {
  depan: string;
  belakang: string;
}

export interface RemMobil {
  depan: string;
  belakang: string;
  parkir: string;
  abs: boolean;
  ebd: boolean;
  ba: boolean;
}

export interface RodaMobil {
  ukuranBan: string;
  ukuranVelg: string;
  materialVelg: string;
  banSerep: string;
}

export interface InteriorMobil {
  materialJok: string;
  warnaInterior: string[];
  fiturJok: string[];
  dashboard: string;
  setir: string;
  ac: AcMobil;
  audio: AudioMobil;
  storage: string[];
}

export interface AcMobil {
  tipe: string;
  jumlahBlower: number;
  digitalClimate: boolean;
  filterUdara: boolean;
}

export interface AudioMobil {
  sistem: string;
  jumlahSpeaker: number;
  fitur: string[];
  konektivitas: string[];
}

export interface EksteriorMobil {
  warnaTersedia: WarnaEksterior[];
  lampu: LampuMobil;
  kaca: KacaMobil;
  bumper: string;
  grill: string;
  spoiler: boolean;
  sunroof: boolean;
}

export interface WarnaEksterior {
  nama: string;
  kode: string;
  hex: string;
  metalik: boolean;
  tambahan_biaya: number;
}

export interface LampuMobil {
  headlamp: string;
  taillight: string;
  foglamp: boolean;
  drl: boolean;
  led: boolean;
}

export interface KacaMobil {
  depan: string;
  samping: string;
  belakang: string;
  sunroof: boolean;
}

export interface KeamananMobil {
  airbag: AirbagMobil;
  seatbelt: SeatbeltMobil;
  alarm: boolean;
  immobilizer: boolean;
  centralLock: boolean;
  childLock: boolean;
  isofix: boolean;
  parkingSensor: ParkingSensorMobil;
  camera: CameraMobil;
  adas: AdasMobil;
}

export interface AirbagMobil {
  driver: boolean;
  passenger: boolean;
  side: boolean;
  curtain: boolean;
  knee: boolean;
  jumlah: number;
}

export interface SeatbeltMobil {
  pretensioner: boolean;
  forceLimit: boolean;
  reminder: boolean;
}

export interface ParkingSensorMobil {
  depan: boolean;
  belakang: boolean;
  jumlah: number;
}

export interface CameraMobil {
  belakang: boolean;
  depan: boolean;
  samping: boolean;
  surround: boolean;
  resolusi: string;
}

export interface AdasMobil {
  tersedia: boolean;
  fitur: string[];
}

export interface KenyamananMobil {
  ac: boolean;
  powerSteering: boolean;
  powerWindow: boolean;
  centralLock: boolean;
  keyless: KeylessMobil;
  cruise_control: boolean;
  tilt_steering: boolean;
  telescopic_steering: boolean;
  adjustable_seat: AdjustableSeatMobil;
  memory_seat: boolean;
  heated_seat: boolean;
  ventilated_seat: boolean;
}

export interface KeylessMobil {
  entry: boolean;
  start: boolean;
  smartKey: boolean;
}

export interface AdjustableSeatMobil {
  driver: boolean;
  passenger: boolean;
  electric: boolean;
  manual: boolean;
}

export interface HiburanMobil {
  headUnit: HeadUnitMobil;
  speaker: SpeakerMobil;
  konektivitas: KonektivitasMobil;
  layar: LayarMobil;
}

export interface HeadUnitMobil {
  ukuran: string;
  touchscreen: boolean;
  sistem: string;
  fitur: string[];
}

export interface SpeakerMobil {
  jumlah: number;
  merk: string;
  sistem: string;
  subwoofer: boolean;
}

export interface KonektivitasMobil {
  bluetooth: boolean;
  usb: boolean;
  aux: boolean;
  wireless: boolean;
  androidAuto: boolean;
  appleCarplay: boolean;
  wifi: boolean;
}

export interface LayarMobil {
  cluster: LayarCluster;
  infotainment: LayarInfotainment;
  hud: boolean;
}

export interface LayarCluster {
  tipe: string;
  ukuran: string;
  digital: boolean;
}

export interface LayarInfotainment {
  ukuran: string;
  resolusi: string;
  touchscreen: boolean;
}

export interface KonsumsibbmMobil {
  kota: number;
  luarKota: number;
  gabungan: number;
  kapasitasTangki: number;
  jarak_tempuh: number;
  emisi: EmisiMobil;
}

export interface EmisiMobil {
  co2: number;
  euro: string;
  ramahLingkungan: boolean;
}

export interface GaransiMobil {
  mesin: GaransiDetail;
  body: GaransiDetail;
  cat: GaransiDetail;
  sparepart: GaransiDetail;
  service: ServiceGaransi;
}

export interface GaransiDetail {
  durasi: number; // dalam tahun
  kilometer: number;
  syarat: string[];
}

export interface ServiceGaransi {
  gratis: boolean;
  durasi: number;
  jumlahService: number;
  syarat: string[];
}

export interface DealerInfo {
  id: string;
  nama: string;
  alamat: string;
  kota: string;
  provinsi: string;
  telepon: string;
  email: string;
  website: string;
  rating: number;
  jamOperasional: JamOperasional[];
  layanan: string[];
  sertifikasi: string[];
}

export interface JamOperasional {
  hari: string;
  buka: string;
  tutup: string;
  istirahat?: {
    mulai: string;
    selesai: string;
  };
}

export interface GambarMobil {
  id: string;
  url: string;
  alt: string;
  kategori: 'eksterior' | 'interior' | 'mesin' | 'fitur' | 'detail';
  sudut?: string;
  warna?: string;
  resolusi: string;
  ukuran: number;
  utama: boolean;
}

export interface VideoMobil {
  id: string;
  url: string;
  thumbnail: string;
  judul: string;
  deskripsi: string;
  durasi: number;
  kategori: 'review' | 'test_drive' | 'fitur' | 'interior' | 'eksterior';
  kualitas: string[];
}

export interface ReviewSingkat {
  ratingKeseluruhan: number;
  jumlahReview: number;
  aspekRating: AspekRating;
  reviewTerbaru: ReviewTerbaru[];
  pros: string[];
  cons: string[];
}

export interface AspekRating {
  performa: number;
  kenyamanan: number;
  fitur: number;
  desain: number;
  konsumsibbm: number;
  harga: number;
  keamanan: number;
  perawatan: number;
}

export interface ReviewTerbaru {
  id: string;
  userName: string;
  rating: number;
  komentar: string;
  tanggal: Date;
  verified: boolean;
}

export interface RatingMobil {
  keseluruhan: number;
  jumlahVoting: number;
  distribusi: DistribusiRating;
  trending: boolean;
  recommended: boolean;
}

export interface DistribusiRating {
  bintang5: number;
  bintang4: number;
  bintang3: number;
  bintang2: number;
  bintang1: number;
}

export interface PopularitasMobil {
  views: number;
  likes: number;
  shares: number;
  inquiries: number;
  testDrives: number;
  bookmarks: number;
  rank: number;
  trending: boolean;
}

export interface PromoMobil {
  id: string;
  judul: string;
  deskripsi: string;
  tipe: 'diskon' | 'cashback' | 'bonus' | 'trade_in' | 'cicilan_0';
  nilai: number;
  berlakuMulai: Date;
  berlakuHingga: Date;
  syarat: string[];
  dealer: string[];
  terbatas: boolean;
  kuota?: number;
  sisaKuota?: number;
}

export interface AvailabilityMobil {
  ready: boolean;
  stok: number;
  estimasiPengiriman: number; // dalam hari
  lokasi: string[];
  indent: boolean;
  estimasiIndent?: number; // dalam hari
}

export interface TabelPerbandingan {
  id: string;
  nama: string;
  mobilPertama?: DataMobilPerbandingan;
  mobilKedua?: DataMobilPerbandingan;
  mobilKetiga?: DataMobilPerbandingan;
  mobilKeempat?: DataMobilPerbandingan;
  kategoriPerbandingan: KategoriPerbandingan[];
  pengaturan: PengaturanPerbandingan;
  statistik: StatistikPerbandingan;
  shareLink?: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
  public: boolean;
}

export interface KategoriPerbandingan {
  id: string;
  nama: string;
  fields: FieldPerbandingan[];
  visible: boolean;
  urutan: number;
}

export interface FieldPerbandingan {
  key: string;
  label: string;
  tipe: 'text' | 'number' | 'currency' | 'boolean' | 'array' | 'object';
  unit?: string;
  format?: string;
  highlight?: boolean;
  important?: boolean;
}

export interface PengaturanPerbandingan {
  tampilkanHarga: boolean;
  tampilkanSpesifikasi: boolean;
  tampilkanFitur: boolean;
  tampilkanPerforma: boolean;
  tampilkanDimensi: boolean;
  tampilkanKeamanan: boolean;
  tampilkanKenyamanan: boolean;
  tampilkanHiburan: boolean;
  tampilkanGaransi: boolean;
  highlightPerbedaan: boolean;
  showOnlyDifferences: boolean;
  compactView: boolean;
}

export interface StatistikPerbandingan {
  totalViews: number;
  totalShares: number;
  totalDownloads: number;
  lastViewed: Date;
  popularFields: string[];
  userInteractions: UserInteraction[];
}

export interface UserInteraction {
  action: 'view' | 'share' | 'download' | 'bookmark' | 'inquiry';
  timestamp: Date;
  userId?: string;
  metadata?: any;
}

export interface LinkSharing {
  id: string;
  url: string;
  shortUrl: string;
  qrCode: string;
  title: string;
  description: string;
  thumbnail: string;
  expiresAt?: Date;
  password?: string;
  analytics: SharingAnalytics;
  createdAt: Date;
}

export interface SharingAnalytics {
  totalClicks: number;
  uniqueClicks: number;
  clicksByDate: ClicksByDate[];
  referrers: Referrer[];
  devices: DeviceStats[];
  locations: LocationStats[];
}

export interface ClicksByDate {
  date: Date;
  clicks: number;
  uniqueClicks: number;
}

export interface Referrer {
  source: string;
  clicks: number;
  percentage: number;
}

export interface DeviceStats {
  device: string;
  clicks: number;
  percentage: number;
}

export interface LocationStats {
  country: string;
  city: string;
  clicks: number;
  percentage: number;
}

export interface PerbandinganServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
  warnings?: string[];
  timestamp: Date;
}

// ==================== MAIN SERVICE CLASS ====================

export class LayananPerbandingan {
  private static instance: LayananPerbandingan;
  private cache: Map<string, any> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 menit
  private tabelPerbandingan: Map<string, TabelPerbandingan> = new Map();

  private constructor() {
    this.initializeDefaultTable();
  }

  public static getInstance(): LayananPerbandingan {
    if (!LayananPerbandingan.instance) {
      LayananPerbandingan.instance = new LayananPerbandingan();
    }
    return LayananPerbandingan.instance;
  }

  // ==================== METODE UTAMA ====================

  /**
   * Muat data mobil pertama untuk perbandingan
   */
  public async muatDataMobilPertama(mobilId: string, tabelId?: string): Promise<PerbandinganServiceResponse<DataMobilPerbandingan>> {
    try {
      if (!mobilId || mobilId.trim() === '') {
        return {
          success: false,
          message: 'ID mobil tidak valid',
          errors: ['Mobile ID is required'],
          timestamp: new Date()
        };
      }

      const dataMobil = await this.getCarDataById(mobilId);
      if (!dataMobil) {
        return {
          success: false,
          message: 'Data mobil tidak ditemukan',
          errors: ['Car data not found'],
          timestamp: new Date()
        };
      }

      return {
        success: true,
        data: dataMobil,
        message: 'Data mobil pertama berhasil dimuat',
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error loading first car data:', error);
      return {
        success: false,
        message: 'Gagal memuat data mobil pertama',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  /**
   * Muat data mobil kedua untuk perbandingan
   */
  public async muatDataMobilKedua(mobilId: string, tabelId?: string): Promise<PerbandinganServiceResponse<DataMobilPerbandingan>> {
    try {
      if (!mobilId || mobilId.trim() === '') {
        return {
          success: false,
          message: 'ID mobil tidak valid',
          errors: ['Mobile ID is required'],
          timestamp: new Date()
        };
      }

      const dataMobil = await this.getCarDataById(mobilId);
      if (!dataMobil) {
        return {
          success: false,
          message: 'Data mobil tidak ditemukan',
          errors: ['Car data not found'],
          timestamp: new Date()
        };
      }

      return {
        success: true,
        data: dataMobil,
        message: 'Data mobil kedua berhasil dimuat dan siap untuk perbandingan',
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error loading second car data:', error);
      return {
        success: false,
        message: 'Gagal memuat data mobil kedua',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  // ==================== PRIVATE METHODS ====================

  private initializeDefaultTable(): void {
    const defaultTable: TabelPerbandingan = {
      id: 'default',
      nama: 'Perbandingan Default',
      kategoriPerbandingan: [],
      pengaturan: {
        tampilkanHarga: true,
        tampilkanSpesifikasi: true,
        tampilkanFitur: true,
        tampilkanPerforma: true,
        tampilkanDimensi: true,
        tampilkanKeamanan: true,
        tampilkanKenyamanan: true,
        tampilkanHiburan: true,
        tampilkanGaransi: true,
        highlightPerbedaan: true,
        showOnlyDifferences: false,
        compactView: false
      },
      statistik: {
        totalViews: 0,
        totalShares: 0,
        totalDownloads: 0,
        lastViewed: new Date(),
        popularFields: [],
        userInteractions: []
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      public: false
    };

    this.tabelPerbandingan.set('default', defaultTable);
  }

  private createNewComparisonTable(id: string): TabelPerbandingan {
    return {
      id,
      nama: `Perbandingan ${id}`,
      kategoriPerbandingan: [],
      pengaturan: {
        tampilkanHarga: true,
        tampilkanSpesifikasi: true,
        tampilkanFitur: true,
        tampilkanPerforma: true,
        tampilkanDimensi: true,
        tampilkanKeamanan: true,
        tampilkanKenyamanan: true,
        tampilkanHiburan: true,
        tampilkanGaransi: true,
        highlightPerbedaan: true,
        showOnlyDifferences: false,
        compactView: false
      },
      statistik: {
        totalViews: 0,
        totalShares: 0,
        totalDownloads: 0,
        lastViewed: new Date(),
        popularFields: [],
        userInteractions: []
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      public: false
    };
  }

  private async getCarDataById(id: string): Promise<DataMobilPerbandingan | null> {
    // Mock data untuk testing
    const mockData: DataMobilPerbandingan = {
      id: id,
      nama: 'Honda Brio RS CVT',
      merk: 'Honda',
      model: 'Brio',
      varian: 'RS CVT',
      tahun: 2024,
      harga: {
        hargaOtr: 195000000,
        hargaOff: 192000000,
        dp: [
          { persentase: 20, nominal: 39000000, cicilanPerBulan: 3500000, tenor: 60 },
          { persentase: 30, nominal: 58500000, cicilanPerBulan: 3200000, tenor: 60 }
        ],
        cicilan: [
          { tenor: 36, cicilanPerBulan: 4300000, totalBayar: 154800000, bunga: 8.0, asuransi: 2.5 },
          { tenor: 48, cicilanPerBulan: 3700000, totalBayar: 177600000, bunga: 8.0, asuransi: 2.5 },
          { tenor: 60, cicilanPerBulan: 3500000, totalBayar: 210000000, bunga: 8.0, asuransi: 2.5 }
        ],
        tradeIn: {
          tersedia: true,
          estimasiHarga: 120000000,
          bonus: 1500000
        }
      },
      spesifikasi: {
        kategori: 'Hatchback',
        segmen: 'City Car',
        jenisBody: 'Hatchback',
        jumlahPintu: 5,
        kapasitasPenumpang: 5,
        jenisTransmisi: 'CVT',
        jenisRem: 'Disc/Drum',
        jenisKemudi: 'Electric Power Steering',
        jenisAc: 'Manual',
        kapasitasTangki: 35,
        ground_clearance: 180,
        radius_putar: 4.6
      },
      fitur: {
        fiturKeselamatan: ['Dual SRS Airbag', 'ABS+EBD+BA', 'VSA', 'HSA', 'ISOFIX'],
        fiturKenyamanan: ['Electric Power Steering', 'Central Lock', 'Power Window', 'AC Manual'],
        fiturHiburan: ['Touchscreen Audio', 'USB Port', 'Bluetooth', 'Steering Audio Control'],
        fiturEksterior: ['LED Headlight', 'LED DRL', 'Fog Lamp', 'Shark Fin Antenna'],
        fiturInterior: ['Fabric Seat', 'Tilt Steering', 'Digital Cluster'],
        fiturMesin: ['i-VTEC Engine', 'Electronic Fuel Injection'],
        fiturTambahan: ['Immobilizer', 'Smart Key System']
      },
      // Mock data untuk properti lainnya
      performa: {} as PerformaMobil,
      dimensi: {} as DimensiMobil,
      mesin: {} as MesinMobil,
      transmisi: {} as TransmisiMobil,
      suspensi: {} as SuspensiMobil,
      rem: {} as RemMobil,
      roda: {} as RodaMobil,
      interior: {} as InteriorMobil,
      eksterior: {} as EksteriorMobil,
      keamanan: {} as KeamananMobil,
      kenyamanan: {} as KenyamananMobil,
      hiburan: {} as HiburanMobil,
      konsumsibbm: {} as KonsumsibbmMobil,
      garansi: {} as GaransiMobil,
      dealer: {} as DealerInfo,
      gambar: [],
      review: {} as ReviewSingkat,
      rating: {} as RatingMobil,
      popularitas: {} as PopularitasMobil,
      availability: {} as AvailabilityMobil,
      lastUpdated: new Date()
    };

    return mockData;
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async generateQRCode(url: string): Promise<string> {
    // Mock QR code generation
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
  }

  private async logComparisonActivity(action: string, tableId: string, carId?: string): Promise<void> {
    // Mock logging implementation
    console.log(`Comparison activity: ${action} for table ${tableId}${carId ? ` with car ${carId}` : ''}`);
  }

  private async generateSecondCarRecommendations(firstCar: DataMobilPerbandingan): Promise<string[]> {
    // Mock recommendations based on first car
    return [
      `Mobil dengan harga serupa (${firstCar.harga.hargaOtr})`,
      `Mobil dengan kategori yang sama (${firstCar.spesifikasi.kategori})`,
      `Mobil dengan merk berbeda`
    ];
  }

  private async generateComparisonAnalysis(firstCar: DataMobilPerbandingan, secondCar: DataMobilPerbandingan): Promise<{warnings: string[]}> {
    const warnings: string[] = [];
    
    // Analisis perbedaan harga
    const priceDiff = Math.abs(firstCar.harga.hargaOtr - secondCar.harga.hargaOtr);
    if (priceDiff > 50000000) {
      warnings.push('Perbedaan harga cukup signifikan antara kedua mobil');
    }
    
    // Analisis kategori
    if (firstCar.spesifikasi.kategori !== secondCar.spesifikasi.kategori) {
      warnings.push('Kedua mobil memiliki kategori yang berbeda');
    }
    
    return { warnings };
  }
}

// ==================== EXPORT SINGLETON ====================
export const layananPerbandingan = LayananPerbandingan.getInstance();

// Default export for compatibility
export default LayananPerbandingan;