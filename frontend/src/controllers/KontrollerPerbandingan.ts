import KontrollerKatalog, { 
  Mobil, 
  KatalogFilter, 
  KatalogSort, 
  KatalogPagination, 
  KatalogResponse 
} from './KontrollerKatalog';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Interface untuk data mobil dalam perbandingan
export interface MobilPerbandingan {
  id: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  priceRange: {
    min: number;
    max: number;
  };
  images: string[];
  mainImage: string;
  condition: 'new' | 'used';
  transmission: 'manual' | 'automatic' | 'cvt';
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  engine: {
    capacity: number; // dalam CC
    power: number; // dalam HP
    torque: number; // dalam Nm
    cylinders: number;
    configuration: string; // contoh: "Inline-4", "V6"
  };
  performance: {
    acceleration: number; // 0-100 km/h dalam detik
    topSpeed: number; // dalam km/h
    fuelConsumption: {
      city: number; // km/liter
      highway: number; // km/liter
      combined: number; // km/liter
    };
  };
  dimensions: {
    length: number; // dalam mm
    width: number; // dalam mm
    height: number; // dalam mm
    wheelbase: number; // dalam mm
    groundClearance: number; // dalam mm
    weight: number; // dalam kg
    trunkCapacity: number; // dalam liter
  };
  features: {
    safety: string[];
    comfort: string[];
    technology: string[];
    exterior: string[];
    interior: string[];
  };
  specifications: {
    [category: string]: {
      [key: string]: string | number | boolean;
    };
  };
  ratings: {
    overall: number;
    safety: number;
    comfort: number;
    performance: number;
    fuelEconomy: number;
    reliability: number;
    valueForMoney: number;
  };
  reviews: {
    total: number;
    average: number;
    distribution: {
      [rating: number]: number;
    };
  };
  availability: {
    inStock: boolean;
    estimatedDelivery: string;
    locations: string[];
  };
  financing: {
    available: boolean;
    minDownPayment: number;
    maxTenure: number;
    interestRate: {
      min: number;
      max: number;
    };
  };
  warranty: {
    duration: number; // dalam tahun
    mileage: number; // dalam km
    coverage: string[];
  };
  dealer: {
    id: string;
    name: string;
    location: string;
    rating: number;
    contact: {
      phone: string;
      email: string;
      whatsapp: string;
    };
  };
}

// Interface untuk kategori perbandingan
export interface KategoriPerbandingan {
  id: string;
  nama: string;
  deskripsi: string;
  icon: string;
  fields: string[];
  weight: number; // bobot untuk scoring
}

// Interface untuk kriteria perbandingan
export interface KriteriaPerbandingan {
  id: string;
  nama: string;
  kategori: string;
  tipe: 'numeric' | 'boolean' | 'text' | 'rating' | 'array';
  unit?: string;
  format?: string;
  weight: number;
  higherIsBetter: boolean;
  displayName: string;
  description: string;
}

// Interface untuk hasil perbandingan
export interface HasilPerbandingan {
  mobil: MobilPerbandingan[];
  perbandingan: {
    [kategori: string]: {
      [kriteria: string]: {
        values: (string | number | boolean)[];
        winner?: number; // index mobil yang menang
        scores: number[]; // skor untuk setiap mobil
      };
    };
  };
  summary: {
    overall: {
      winner: number;
      scores: number[];
      reasons: string[];
    };
    byCategory: {
      [kategori: string]: {
        winner: number;
        scores: number[];
        reasons: string[];
      };
    };
  };
  recommendations: {
    bestOverall: number;
    bestValue: number;
    bestPerformance: number;
    bestFuelEconomy: number;
    bestSafety: number;
    bestComfort: number;
  };
}

// Interface untuk filter perbandingan
export interface FilterPerbandingan {
  brands?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  yearRange?: {
    min: number;
    max: number;
  };
  condition?: ('new' | 'used')[];
  transmission?: ('manual' | 'automatic' | 'cvt')[];
  fuelType?: ('gasoline' | 'diesel' | 'hybrid' | 'electric')[];
  bodyType?: string[];
  seatingCapacity?: number[];
  features?: string[];
  location?: string[];
  availability?: boolean;
  financing?: boolean;
}

// Interface untuk preferensi pengguna
export interface PreferensiPerbandingan {
  prioritas: {
    [kategori: string]: number; // 1-5, 5 = sangat penting
  };
  budget: {
    max: number;
    downPayment: number;
    monthlyPayment: number;
  };
  usage: {
    dailyCommute: boolean;
    familyTrips: boolean;
    businessUse: boolean;
    offRoad: boolean;
    cityDriving: boolean;
    highwayDriving: boolean;
  };
  preferences: {
    fuelEconomy: number; // 1-5
    performance: number; // 1-5
    comfort: number; // 1-5
    safety: number; // 1-5
    technology: number; // 1-5
    reliability: number; // 1-5
    brandPrestige: number; // 1-5
  };
}

// Interface untuk halaman perbandingan
export interface HalamanPerbandingan {
  mobilTerpilih: MobilPerbandingan[];
  mobilTersedia: MobilPerbandingan[];
  kategoriPerbandingan: KategoriPerbandingan[];
  kriteriaPerbandingan: KriteriaPerbandingan[];
  filter: FilterPerbandingan;
  preferensi: PreferensiPerbandingan;
  hasilPerbandingan?: HasilPerbandingan;
  rekomendasi: {
    populer: MobilPerbandingan[];
    serupa: MobilPerbandingan[];
    alternatif: MobilPerbandingan[];
  };
  statistik: {
    totalMobil: number;
    totalPerbandingan: number;
    kategoriPopuler: string[];
    brandPopuler: string[];
  };
}

// Interface untuk keputusan perbandingan
export interface KeputusanPerbandingan {
  mobilDipilih: string; // ID mobil yang dipilih
  alasan: string[];
  rating: number; // 1-5
  feedback: string;
  nextAction: 'contact_dealer' | 'schedule_test_drive' | 'request_quote' | 'save_favorite' | 'share_comparison';
  additionalInfo?: {
    financing: boolean;
    tradeIn: boolean;
    insurance: boolean;
    warranty: boolean;
  };
}

// Interface untuk validasi keputusan
export interface ValidasiKeputusan {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  confidence: number; // 0-1
}

export class KontrollerPerbandingan {
  private token: string | null = null;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
  private kontrollerKatalog: KontrollerKatalog;

  constructor() {
    this.token = localStorage.getItem('authToken');
    this.kontrollerKatalog = KontrollerKatalog.getInstance();
  }

  /**
   * Memuat halaman perbandingan dengan data lengkap
   * @param mobilIds - Array ID mobil yang akan dibandingkan (max 4)
   * @param filter - Filter untuk mobil tersedia
   * @param preferensi - Preferensi pengguna
   * @returns Promise<HalamanPerbandingan>
   */
  public async muatHalamanPerbandingan(
    mobilIds: string[] = [],
    filter?: FilterPerbandingan,
    preferensi?: PreferensiPerbandingan
  ): Promise<HalamanPerbandingan> {
    try {
      // Validasi jumlah mobil maksimal
      if (mobilIds.length > 4) {
        throw new Error('Maksimal 4 mobil dapat dibandingkan sekaligus');
      }

      // Check cache first
      const cacheKey = `perbandingan_${mobilIds.join('_')}_${JSON.stringify(filter)}_${JSON.stringify(preferensi)}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Ambil data mobil dari katalog menggunakan KontrollerKatalog
      const katalogFilter = this.convertToKatalogFilter(filter);
      const katalogResponse = await this.kontrollerKatalog.muatKatalogMobil(
        katalogFilter,
        { field: 'createdAt', order: 'desc' },
        { page: 1, limit: 100 }
      );

      let mobilTersedia: MobilPerbandingan[] = [];
      let mobilTerpilih: MobilPerbandingan[] = [];

      if (katalogResponse && katalogResponse.success) {
        // Convert Mobil[] to MobilPerbandingan[]
        mobilTersedia = katalogResponse.data.cars.map((mobil: Mobil) => this.convertMobilToMobilPerbandingan(mobil));
        
        // Jika ada mobilIds yang dipilih, ambil detail mobil tersebut
        if (mobilIds.length > 0) {
          for (const id of mobilIds) {
            const detailResponse = await this.kontrollerKatalog.muatDetailMobil(id);
            if (detailResponse && detailResponse.success) {
              mobilTerpilih.push(this.convertMobilToMobilPerbandingan(detailResponse.data.car));
            }
          }
        }
      }

      const halamanData: HalamanPerbandingan = {
        mobilTerpilih,
        mobilTersedia,
        kategoriPerbandingan: this.getDefaultKategori(),
        kriteriaPerbandingan: this.getDefaultKriteria(),
        filter: filter || {},
        preferensi: preferensi || this.getDefaultPreferensi(),
        hasilPerbandingan: undefined,
        rekomendasi: {
          populer: mobilTersedia.slice(0, 6), // Ambil 6 mobil pertama sebagai populer
          serupa: [],
          alternatif: []
        },
        statistik: {
          totalMobil: katalogResponse?.data.pagination.total || 0,
          totalPerbandingan: 0,
          kategoriPopuler: katalogResponse?.data.filters.availableBrands || [],
          brandPopuler: katalogResponse?.data.filters.availableBrands || []
        }
      };

      // Cache the result
      this.setToCache(cacheKey, halamanData);

      return halamanData;

    } catch (error) {
      console.error('Error loading comparison page:', error);
      return {
        mobilTerpilih: [],
        mobilTersedia: [],
        kategoriPerbandingan: this.getDefaultKategori(),
        kriteriaPerbandingan: this.getDefaultKriteria(),
        filter: filter || {},
        preferensi: preferensi || this.getDefaultPreferensi(),
        rekomendasi: {
          populer: [],
          serupa: [],
          alternatif: []
        },
        statistik: {
          totalMobil: 0,
          totalPerbandingan: 0,
          kategoriPopuler: [],
          brandPopuler: []
        }
      };
    }
  }

  /**
   * Melakukan perbandingan detail antara mobil-mobil yang dipilih
   * @param mobilIds - Array ID mobil yang akan dibandingkan
   * @param preferensi - Preferensi pengguna untuk scoring
   * @returns Promise<HasilPerbandingan>
   */
  public async lakukanPerbandingan(
    mobilIds: string[],
    preferensi?: PreferensiPerbandingan
  ): Promise<HasilPerbandingan> {
    try {
      if (mobilIds.length < 2) {
        throw new Error('Minimal 2 mobil diperlukan untuk perbandingan');
      }

      if (mobilIds.length > 4) {
        throw new Error('Maksimal 4 mobil dapat dibandingkan sekaligus');
      }

      // Check cache first
      const cacheKey = `comparison_result_${mobilIds.join('_')}_${JSON.stringify(preferensi)}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Ambil detail mobil dari katalog
      const mobilData: MobilPerbandingan[] = [];
      for (const id of mobilIds) {
        const detailResponse = await this.kontrollerKatalog.muatDetailMobil(id);
        if (detailResponse && detailResponse.success) {
          mobilData.push(this.convertMobilToMobilPerbandingan(detailResponse.data.car));
        }
      }

      if (mobilData.length < 2) {
        throw new Error('Tidak dapat memuat data mobil untuk perbandingan');
      }

      // Lakukan analisis perbandingan
      const hasilPerbandingan = this.analyzeComparison(mobilData, preferensi);
      
      // Cache the result
      this.setToCache(cacheKey, hasilPerbandingan);

      return hasilPerbandingan;

    } catch (error) {
      console.error('Error performing comparison:', error);
      throw error;
    }
  }

  /**
   * Validasi keputusan perbandingan
   * @param keputusan - Data keputusan yang akan divalidasi
   * @param hasilPerbandingan - Hasil perbandingan untuk konteks
   * @returns Promise<ValidasiKeputusan>
   */
  public async validasiKeputusan(
    keputusan: KeputusanPerbandingan,
    hasilPerbandingan?: HasilPerbandingan
  ): Promise<ValidasiKeputusan> {
    try {
      const validasi: ValidasiKeputusan = {
        valid: true,
        errors: [],
        warnings: [],
        suggestions: [],
        confidence: 1.0
      };

      // Validasi mobil dipilih
      if (!keputusan.mobilDipilih || keputusan.mobilDipilih.trim() === '') {
        validasi.errors.push('Mobil harus dipilih');
        validasi.valid = false;
      }

      // Validasi alasan
      if (!keputusan.alasan || keputusan.alasan.length === 0) {
        validasi.errors.push('Minimal satu alasan harus diberikan');
        validasi.valid = false;
      } else if (keputusan.alasan.some(alasan => alasan.trim() === '')) {
        validasi.errors.push('Alasan tidak boleh kosong');
        validasi.valid = false;
      }

      // Validasi rating
      if (!keputusan.rating || keputusan.rating < 1 || keputusan.rating > 5) {
        validasi.errors.push('Rating harus antara 1-5');
        validasi.valid = false;
      }

      // Validasi feedback
      if (keputusan.feedback && keputusan.feedback.length > 1000) {
        validasi.warnings.push('Feedback terlalu panjang (maksimal 1000 karakter)');
        validasi.confidence -= 0.1;
      }

      // Validasi next action
      const validActions = ['contact_dealer', 'schedule_test_drive', 'request_quote', 'save_favorite', 'share_comparison'];
      if (!validActions.includes(keputusan.nextAction)) {
        validasi.errors.push('Aksi selanjutnya tidak valid');
        validasi.valid = false;
      }

      // Analisis konsistensi dengan hasil perbandingan
      if (hasilPerbandingan && validasi.valid) {
        const mobilDipilihIndex = hasilPerbandingan.mobil.findIndex(m => m.id === keputusan.mobilDipilih);
        
        if (mobilDipilihIndex === -1) {
          validasi.errors.push('Mobil yang dipilih tidak ada dalam perbandingan');
          validasi.valid = false;
        } else {
          // Cek apakah pilihan konsisten dengan rekomendasi
          const isRecommended = Object.values(hasilPerbandingan.recommendations).includes(mobilDipilihIndex);
          
          if (!isRecommended) {
            validasi.warnings.push('Mobil yang dipilih bukan rekomendasi utama sistem');
            validasi.suggestions.push('Pertimbangkan kembali pilihan berdasarkan analisis perbandingan');
            validasi.confidence -= 0.2;
          }

          // Cek konsistensi rating dengan skor sistem
          const sistemScore = hasilPerbandingan.summary.overall.scores[mobilDipilihIndex];
          const userRating = keputusan.rating;
          const expectedRating = Math.round((sistemScore / 100) * 5);
          
          if (Math.abs(userRating - expectedRating) > 2) {
            validasi.warnings.push(`Rating Anda (${userRating}) berbeda signifikan dengan analisis sistem (${expectedRating})`);
            validasi.confidence -= 0.15;
          }
        }
      }

      // Saran berdasarkan next action
      switch (keputusan.nextAction) {
        case 'contact_dealer':
          validasi.suggestions.push('Siapkan pertanyaan spesifik tentang mobil sebelum menghubungi dealer');
          break;
        case 'schedule_test_drive':
          validasi.suggestions.push('Pastikan membawa SIM dan dokumen identitas untuk test drive');
          break;
        case 'request_quote':
          validasi.suggestions.push('Bandingkan penawaran dari beberapa dealer untuk mendapatkan harga terbaik');
          break;
        case 'save_favorite':
          validasi.suggestions.push('Pantau terus harga dan promo untuk mobil favorit Anda');
          break;
        case 'share_comparison':
          validasi.suggestions.push('Bagikan perbandingan dengan keluarga atau teman untuk mendapat masukan');
          break;
      }

      // Saran berdasarkan additional info
      if (keputusan.additionalInfo) {
        if (keputusan.additionalInfo.financing) {
          validasi.suggestions.push('Bandingkan opsi pembiayaan dari berbagai lembaga keuangan');
        }
        if (keputusan.additionalInfo.tradeIn) {
          validasi.suggestions.push('Dapatkan estimasi harga trade-in dari beberapa dealer');
        }
        if (keputusan.additionalInfo.insurance) {
          validasi.suggestions.push('Pertimbangkan asuransi comprehensive untuk perlindungan optimal');
        }
        if (keputusan.additionalInfo.warranty) {
          validasi.suggestions.push('Pahami detail coverage garansi extended sebelum memutuskan');
        }
      }

      // Kirim validasi ke server untuk tracking
      if (validasi.valid) {
        await this.kirimValidasiKeServer(keputusan, validasi);
      }

      return validasi;

    } catch (error) {
      console.error('Error validating decision:', error);
      return {
        valid: false,
        errors: ['Terjadi kesalahan saat validasi keputusan'],
        warnings: [],
        suggestions: [],
        confidence: 0
      };
    }
  }

  /**
   * Simpan keputusan perbandingan
   * @param keputusan - Data keputusan
   * @param hasilPerbandingan - Hasil perbandingan
   * @returns Promise<{success: boolean, message: string, id?: string}>
   */
  public async simpanKeputusan(
    keputusan: KeputusanPerbandingan,
    hasilPerbandingan: HasilPerbandingan
  ): Promise<{
    success: boolean;
    message: string;
    id?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/comparison/decisions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          decision: keputusan,
          comparison: hasilPerbandingan,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menyimpan keputusan');
      }

      // Clear relevant cache
      this.clearCacheByPattern('perbandingan_');
      this.clearCacheByPattern('comparison_');

      return {
        success: true,
        message: 'Keputusan berhasil disimpan',
        id: result.data.id
      };

    } catch (error) {
      console.error('Error saving decision:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan keputusan'
      };
    }
  }

  /**
   * Dapatkan rekomendasi mobil berdasarkan preferensi
   * @param preferensi - Preferensi pengguna
   * @param limit - Jumlah rekomendasi (default: 10)
   * @returns Promise<MobilPerbandingan[]>
   */
  public async dapatkanRekomendasi(
    preferensi: PreferensiPerbandingan,
    limit: number = 10
  ): Promise<MobilPerbandingan[]> {
    try {
      // Check cache first
      const cacheKey = `recommendations_${JSON.stringify(preferensi)}_${limit}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Convert preferences to catalog filter
      const filter: KatalogFilter = {
        priceMin: 0,
        priceMax: preferensi.budget.max,
        brand: [], // Will be populated based on brand preferences
        model: [],
        yearMin: new Date().getFullYear() - 10,
        yearMax: new Date().getFullYear(),
        condition: ['new', 'used'],
        transmission: [],
        fuelType: [],
        location: [],
        sellerType: ['individual', 'dealer']
      };

      // Get cars from catalog
      const katalogResponse = await this.kontrollerKatalog.muatKatalogMobil(
        filter,
        { field: 'price', order: 'asc' },
        { page: 1, limit: limit * 2 } // Get more to allow filtering
      );

      if (!katalogResponse || !katalogResponse.success || !katalogResponse.data) {
        return [];
      }

      // Convert to MobilPerbandingan and score based on preferences
      const mobilRekomendasi = katalogResponse.data.cars
        .map((mobil: Mobil) => this.convertMobilToMobilPerbandingan(mobil))
        .map((mobil: MobilPerbandingan) => ({
          ...mobil,
          score: this.calculateRecommendationScore(mobil, preferensi)
        }))
        .sort((a: any, b: any) => b.score - a.score)
        .slice(0, limit)
        .map(({ score, ...mobil }: any) => mobil);

      // Cache the result
      this.setToCache(cacheKey, mobilRekomendasi);

      return mobilRekomendasi;

    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  /**
   * Export perbandingan ke PDF
   * @param hasilPerbandingan - Hasil perbandingan
   * @param format - Format export ('pdf' | 'excel' | 'csv')
   * @returns Promise<{success: boolean, message: string, downloadUrl?: string}>
   */
  public async exportPerbandingan(
    hasilPerbandingan: HasilPerbandingan,
    format: 'pdf' | 'excel' | 'csv' = 'pdf'
  ): Promise<{
    success: boolean;
    message: string;
    downloadUrl?: string;
  }> {
    try {
      // Generate export data locally instead of calling API
      const exportData = {
        comparison: hasilPerbandingan,
        format,
        timestamp: new Date().toISOString(),
        metadata: {
          totalCars: hasilPerbandingan.mobil.length,
          categories: Object.keys(hasilPerbandingan.perbandingan),
          winner: hasilPerbandingan.mobil[hasilPerbandingan.summary.overall.winner]?.brand + ' ' + 
                  hasilPerbandingan.mobil[hasilPerbandingan.summary.overall.winner]?.model
        }
      };

      // For now, return success with a mock download URL
      // In a real implementation, you would generate the actual file here
      const mockDownloadUrl = `data:application/${format},${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;

      return {
        success: true,
        message: `Perbandingan berhasil diexport ke ${format.toUpperCase()}`,
        downloadUrl: mockDownloadUrl
      };

    } catch (error) {
      console.error('Error exporting comparison:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengexport perbandingan'
      };
    }
  }

  /**
   * Utility methods
   */
  /**
   * Log validation analytics locally instead of sending to server
   */
  private async kirimValidasiKeServer(
    keputusan: KeputusanPerbandingan,
    validasi: ValidasiKeputusan
  ): Promise<void> {
    try {
      // Log analytics data locally for debugging/monitoring
      const analyticsData = {
        decision: keputusan,
        validation: validasi,
        timestamp: new Date().toISOString(),
        sessionId: this.generateSessionId()
      };

      // Store in localStorage for local analytics
      const existingAnalytics = JSON.parse(localStorage.getItem('comparison_analytics') || '[]');
      existingAnalytics.push(analyticsData);
      
      // Keep only last 100 entries to prevent storage overflow
      if (existingAnalytics.length > 100) {
        existingAnalytics.splice(0, existingAnalytics.length - 100);
      }
      
      localStorage.setItem('comparison_analytics', JSON.stringify(existingAnalytics));
      
      console.log('Validation analytics logged locally:', analyticsData);
    } catch (error) {
      console.error('Error logging validation analytics:', error);
    }
  }

  /**
   * Generate a simple session ID for analytics
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Format harga ke Rupiah
   */
  public formatHarga(harga: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(harga);
  }

  /**
   * Format rating bintang
   */
  public formatRating(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + 
           (hasHalfStar ? '☆' : '') + 
           '☆'.repeat(emptyStars) + 
           ` (${rating.toFixed(1)})`;
  }

  /**
   * Get default kategori
   */
  private getDefaultKategori(): KategoriPerbandingan[] {
    return [
      {
        id: 'harga',
        nama: 'Harga & Nilai',
        deskripsi: 'Perbandingan harga dan value for money',
        icon: 'price-tag',
        fields: ['price', 'priceRange', 'financing'],
        weight: 0.25
      },
      {
        id: 'performa',
        nama: 'Performa',
        deskripsi: 'Engine, akselerasi, dan performa berkendara',
        icon: 'speedometer',
        fields: ['engine', 'performance'],
        weight: 0.20
      },
      {
        id: 'fitur',
        nama: 'Fitur & Teknologi',
        deskripsi: 'Fitur keselamatan, kenyamanan, dan teknologi',
        icon: 'settings',
        fields: ['features', 'technology'],
        weight: 0.20
      },
      {
        id: 'efisiensi',
        nama: 'Efisiensi',
        deskripsi: 'Konsumsi bahan bakar dan biaya operasional',
        icon: 'leaf',
        fields: ['fuelConsumption', 'maintenance'],
        weight: 0.15
      },
      {
        id: 'dimensi',
        nama: 'Dimensi & Ruang',
        deskripsi: 'Ukuran, ruang kabin, dan kapasitas bagasi',
        icon: 'resize',
        fields: ['dimensions', 'seating'],
        weight: 0.10
      },
      {
        id: 'keandalan',
        nama: 'Keandalan',
        deskripsi: 'Rating, review, dan track record',
        icon: 'shield-check',
        fields: ['ratings', 'reviews', 'warranty'],
        weight: 0.10
      }
    ];
  }

  /**
   * Get default kriteria
   */
  private getDefaultKriteria(): KriteriaPerbandingan[] {
    return [
      {
        id: 'price',
        nama: 'Harga',
        kategori: 'harga',
        tipe: 'numeric',
        unit: 'IDR',
        format: 'currency',
        weight: 0.3,
        higherIsBetter: false,
        displayName: 'Harga',
        description: 'Harga jual mobil'
      },
      {
        id: 'fuelConsumption',
        nama: 'Konsumsi BBM',
        kategori: 'efisiensi',
        tipe: 'numeric',
        unit: 'km/l',
        format: 'decimal',
        weight: 0.25,
        higherIsBetter: true,
        displayName: 'Konsumsi BBM',
        description: 'Efisiensi bahan bakar gabungan'
      },
      {
        id: 'safetyRating',
        nama: 'Rating Keselamatan',
        kategori: 'keandalan',
        tipe: 'rating',
        unit: 'stars',
        format: 'rating',
        weight: 0.2,
        higherIsBetter: true,
        displayName: 'Rating Keselamatan',
        description: 'Rating keselamatan dari lembaga independen'
      }
    ];
  }

  /**
   * Get default preferensi
   */
  private getDefaultPreferensi(): PreferensiPerbandingan {
    return {
      prioritas: {
        harga: 3,
        performa: 3,
        fitur: 3,
        efisiensi: 3,
        dimensi: 3,
        keandalan: 3
      },
      budget: {
        max: 500000000,
        downPayment: 100000000,
        monthlyPayment: 5000000
      },
      usage: {
        dailyCommute: true,
        familyTrips: false,
        businessUse: false,
        offRoad: false,
        cityDriving: true,
        highwayDriving: false
      },
      preferences: {
        fuelEconomy: 3,
        performance: 3,
        comfort: 3,
        safety: 3,
        technology: 3,
        reliability: 3,
        brandPrestige: 3
      }
    };
  }

  /**
   * Cache management methods
   */
  private getFromCache(key: string): any {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  private setToCache(key: string, data: any): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  private clearCacheByPattern(pattern: string): void {
    const cacheKeys = Array.from(this.cache.keys());
    for (const key of cacheKeys) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
      }
    }
  }

  /**
   * Share comparison result
   */
  public async sharePerbandingan(
    carId1: string,
    carId2: string,
    shareType: 'link' | 'social' | 'email' = 'link'
  ): Promise<{ success: boolean; shareUrl?: string; message?: string }> {
    try {
      // Generate share URL based on car IDs
      const shareUrl = `${window.location.origin}/perbandingan?cars=${carId1},${carId2}`;
      
      if (shareType === 'link') {
        // Copy to clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareUrl);
          return {
            success: true,
            shareUrl,
            message: 'Link perbandingan berhasil disalin ke clipboard'
          };
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = shareUrl;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          
          return {
            success: true,
            shareUrl,
            message: 'Link perbandingan berhasil disalin ke clipboard'
          };
        }
      }

      // For social media or email sharing
      if (shareType === 'social') {
        // Open social media share dialog
        const text = `Bandingkan mobil ini di Mobilindo: ${shareUrl}`;
        const socialUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(socialUrl, '_blank');
      } else if (shareType === 'email') {
        // Open email client
        const subject = 'Perbandingan Mobil - Mobilindo';
        const body = `Lihat perbandingan mobil ini: ${shareUrl}`;
        const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = emailUrl;
      }

      return {
        success: true,
        shareUrl,
        message: 'Perbandingan berhasil dibagikan'
      };
    } catch (error: any) {
      console.error('Share comparison error:', error);
      return {
        success: false,
        message: 'Gagal membagikan perbandingan'
      };
    }
  }

  /**
   * Calculate recommendation score based on user preferences
   */
  private calculateRecommendationScore(
    mobil: MobilPerbandingan,
    preferensi: PreferensiPerbandingan
  ): number {
    let totalScore = 0;
    let totalWeight = 0;

    // Price score (budget consideration)
    if (preferensi.budget.max > 0) {
      const priceScore = mobil.price <= preferensi.budget.max ? 1 : 
                        Math.max(0, 1 - (mobil.price - preferensi.budget.max) / preferensi.budget.max);
      totalScore += priceScore * 0.3;
      totalWeight += 0.3;
    }

    // Fuel economy score
    if (preferensi.preferences.fuelEconomy > 0) {
      const fuelScore = Math.min(1, mobil.performance.fuelConsumption.combined / 20); // Normalize to 20 km/l max
      totalScore += fuelScore * (preferensi.preferences.fuelEconomy / 5) * 0.2;
      totalWeight += 0.2;
    }

    // Performance score
    if (preferensi.preferences.performance > 0) {
      const performanceScore = Math.min(1, mobil.engine.power / 500); // Normalize to 500 HP max
      totalScore += performanceScore * (preferensi.preferences.performance / 5) * 0.2;
      totalWeight += 0.2;
    }

    // Safety score
    if (preferensi.preferences.safety > 0) {
      const safetyScore = mobil.ratings.safety / 5;
      totalScore += safetyScore * (preferensi.preferences.safety / 5) * 0.15;
      totalWeight += 0.15;
    }

    // Comfort score
    if (preferensi.preferences.comfort > 0) {
      const comfortScore = mobil.ratings.comfort / 5;
      totalScore += comfortScore * (preferensi.preferences.comfort / 5) * 0.15;
      totalWeight += 0.15;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Clear all cache
   */
  public clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Convert FilterPerbandingan to KatalogFilter
   */
  private convertToKatalogFilter(filter?: FilterPerbandingan) {
    if (!filter) return undefined;

    return {
      brand: filter.brands,
      model: [],
      yearMin: filter.yearRange?.min,
      yearMax: filter.yearRange?.max,
      priceMin: filter.priceRange?.min,
      priceMax: filter.priceRange?.max,
      condition: filter.condition,
      transmission: filter.transmission,
      fuelType: filter.fuelType,
      location: filter.location,
      sellerType: []
    };
  }

  /**
   * Convert Mobil to MobilPerbandingan
   */
  private convertMobilToMobilPerbandingan(mobil: Mobil): MobilPerbandingan {
    return {
      id: mobil.id,
      brand: mobil.brand,
      model: mobil.model,
      variant: mobil.model, // Assuming variant is same as model for now
      year: mobil.year,
      price: mobil.price,
      priceRange: {
        min: mobil.price * 0.95, // 5% below
        max: mobil.price * 1.05  // 5% above
      },
      images: mobil.images,
      mainImage: mobil.images[0] || '',
      condition: mobil.condition,
      transmission: mobil.transmission,
      fuelType: mobil.fuelType,
      engine: {
        capacity: this.extractEngineCapacity(mobil.specifications.engine),
        power: this.extractPower(mobil.specifications.power),
        torque: this.extractTorque(mobil.specifications.torque),
        cylinders: 4, // Default value
        configuration: mobil.specifications.engine
      },
      performance: {
        acceleration: 10.0, // Default value
        topSpeed: 180, // Default value
        fuelConsumption: {
          city: 12.0, // Default value
          highway: 15.0, // Default value
          combined: 13.5 // Default value
        }
      },
      dimensions: {
        length: mobil.specifications.dimensions.length,
        width: mobil.specifications.dimensions.width,
        height: mobil.specifications.dimensions.height,
        wheelbase: mobil.specifications.dimensions.wheelbase,
        groundClearance: 180, // Default value
        weight: 1200, // Default value
        trunkCapacity: 400 // Default value
      },
      features: {
        safety: mobil.features.filter(f => f.toLowerCase().includes('safety') || f.toLowerCase().includes('airbag') || f.toLowerCase().includes('abs')),
        comfort: mobil.features.filter(f => f.toLowerCase().includes('ac') || f.toLowerCase().includes('comfort') || f.toLowerCase().includes('seat')),
        technology: mobil.features.filter(f => f.toLowerCase().includes('tech') || f.toLowerCase().includes('bluetooth') || f.toLowerCase().includes('gps')),
        exterior: mobil.features.filter(f => f.toLowerCase().includes('exterior') || f.toLowerCase().includes('light') || f.toLowerCase().includes('wheel')),
        interior: mobil.features.filter(f => f.toLowerCase().includes('interior') || f.toLowerCase().includes('dashboard') || f.toLowerCase().includes('upholstery'))
      },
      specifications: {
        engine: {
          capacity: mobil.specifications.engine,
          power: mobil.specifications.power,
          torque: mobil.specifications.torque,
          fuelCapacity: mobil.specifications.fuelCapacity
        },
        dimensions: {
          length: mobil.specifications.dimensions.length,
          width: mobil.specifications.dimensions.width,
          height: mobil.specifications.dimensions.height,
          wheelbase: mobil.specifications.dimensions.wheelbase,
          seatingCapacity: mobil.specifications.seatingCapacity
        }
      },
      ratings: {
        overall: 4.0, // Default rating
        safety: 4.0,
        comfort: 4.0,
        performance: 4.0,
        fuelEconomy: 4.0,
        reliability: 4.0,
        valueForMoney: 4.0
      },
      reviews: {
        total: mobil.views || 0,
        average: 4.0,
        distribution: {
          5: 50,
          4: 30,
          3: 15,
          2: 3,
          1: 2
        }
      },
      availability: {
        inStock: mobil.status === 'available',
        estimatedDelivery: '1-2 weeks',
        locations: [mobil.location.city]
      },
      financing: {
        available: true,
        minDownPayment: mobil.price * 0.2, // 20% DP
        maxTenure: 60, // 5 years
        interestRate: {
          min: 6.5,
          max: 12.0
        }
      },
      warranty: {
        duration: 3, // 3 years
        mileage: 100000, // 100k km
        coverage: ['Engine', 'Transmission', 'Electrical']
      },
      dealer: {
        id: mobil.seller.id,
        name: mobil.seller.name,
        location: mobil.location.city,
        rating: mobil.seller.rating,
        contact: {
          phone: '+62-xxx-xxxx-xxxx',
          email: 'dealer@example.com',
          whatsapp: '+62-xxx-xxxx-xxxx'
        }
      }
    };
  }

  /**
   * Analyze comparison between cars
   */
  private analyzeComparison(mobilData: MobilPerbandingan[], preferensi?: PreferensiPerbandingan): HasilPerbandingan {
    const perbandingan: any = {};
    const categories = this.getDefaultKategori();
    
    // Initialize comparison structure
    categories.forEach(category => {
      perbandingan[category.id] = {};
      category.fields.forEach(field => {
        const values = mobilData.map(mobil => this.getFieldValue(mobil, field));
        perbandingan[category.id][field] = {
          values,
          scores: this.calculateScores(values, field),
          winner: this.determineWinner(values, field)
        };
      });
    });

    // Calculate overall scores
    const overallScores = mobilData.map((_, index) => {
      let totalScore = 0;
      let totalWeight = 0;
      
      categories.forEach(category => {
        category.fields.forEach((field: string) => {
          const fieldScore = perbandingan[category.id][field].scores[index];
          const weight = preferensi?.prioritas[category.id] || category.weight;
          totalScore += fieldScore * weight;
          totalWeight += weight;
        });
      });
      
      return totalWeight > 0 ? totalScore / totalWeight : 0;
    });

    const overallWinner = overallScores.indexOf(Math.max(...overallScores));

    return {
      mobil: mobilData,
      perbandingan,
      summary: {
        overall: {
          winner: overallWinner,
          scores: overallScores,
          reasons: this.generateReasons(mobilData[overallWinner], mobilData)
        },
        byCategory: this.calculateCategoryWinners(perbandingan, categories, mobilData)
      },
      recommendations: {
        bestOverall: overallWinner,
        bestValue: this.findBestValue(mobilData),
        bestPerformance: this.findBestPerformance(mobilData),
        bestFuelEconomy: this.findBestFuelEconomy(mobilData),
        bestSafety: this.findBestSafety(mobilData),
        bestComfort: this.findBestComfort(mobilData)
      }
    };
  }

  // Helper methods for data extraction and analysis
  private extractEngineCapacity(engineSpec: string): number {
    const match = engineSpec.match(/(\d+\.?\d*)[lL]?/);
    return match ? parseFloat(match[1]) * 1000 : 1500; // Convert to CC
  }

  private extractPower(powerSpec: string): number {
    const match = powerSpec.match(/(\d+)\s*HP/i);
    return match ? parseInt(match[1]) : 120;
  }

  private extractTorque(torqueSpec: string): number {
    const match = torqueSpec.match(/(\d+)\s*Nm/i);
    return match ? parseInt(match[1]) : 150;
  }

  private getFieldValue(mobil: MobilPerbandingan, field: string): any {
    switch (field) {
      case 'price': return mobil.price;
      case 'year': return mobil.year;
      case 'engine_capacity': return mobil.engine.capacity;
      case 'power': return mobil.engine.power;
      case 'torque': return mobil.engine.torque;
      case 'fuel_consumption': return mobil.performance.fuelConsumption.combined;
      case 'safety_rating': return mobil.ratings.safety;
      case 'comfort_rating': return mobil.ratings.comfort;
      default: return 0;
    }
  }

  private calculateScores(values: any[], field: string): number[] {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min;
    
    return values.map(value => {
      if (range === 0) return 100;
      
      // For price, lower is better
      if (field === 'price') {
        return ((max - value) / range) * 100;
      }
      
      // For most other fields, higher is better
      return ((value - min) / range) * 100;
    });
  }

  private determineWinner(values: any[], field: string): number {
    if (field === 'price') {
      return values.indexOf(Math.min(...values));
    }
    return values.indexOf(Math.max(...values));
  }

  private calculateCategoryWinners(perbandingan: any, categories: any[], mobilData: MobilPerbandingan[]): any {
    const byCategory: any = {};
    
    categories.forEach(category => {
      const categoryScores = mobilData.map((_, index) => {
        let totalScore = 0;
        let fieldCount = 0;
        
        category.fields.forEach((field: string) => {
          if (perbandingan[category.id][field]) {
            totalScore += perbandingan[category.id][field].scores[index];
            fieldCount++;
          }
        });
        
        return fieldCount > 0 ? totalScore / fieldCount : 0;
      });
      
      const winner = categoryScores.indexOf(Math.max(...categoryScores));
      
      byCategory[category.id] = {
        winner,
        scores: categoryScores,
        reasons: [`Unggul dalam kategori ${category.nama}`]
      };
    });
    
    return byCategory;
  }

  private generateReasons(winnerCar: MobilPerbandingan, allCars: MobilPerbandingan[]): string[] {
    const reasons = [];
    
    // Price comparison
    const prices = allCars.map(car => car.price);
    const minPrice = Math.min(...prices);
    if (winnerCar.price === minPrice) {
      reasons.push('Harga paling kompetitif');
    }
    
    // Performance comparison
    const powers = allCars.map(car => car.engine.power);
    const maxPower = Math.max(...powers);
    if (winnerCar.engine.power === maxPower) {
      reasons.push('Performa mesin terbaik');
    }
    
    // Fuel economy
    const fuelConsumptions = allCars.map(car => car.performance.fuelConsumption.combined);
    const bestFuelConsumption = Math.max(...fuelConsumptions);
    if (winnerCar.performance.fuelConsumption.combined === bestFuelConsumption) {
      reasons.push('Konsumsi bahan bakar paling efisien');
    }
    
    return reasons.length > 0 ? reasons : ['Skor keseluruhan terbaik'];
  }

  private findBestValue(mobilData: MobilPerbandingan[]): number {
    // Best value = lowest price with decent features
    let bestValueIndex = 0;
    let bestValueScore = 0;
    
    mobilData.forEach((mobil, index) => {
      const priceScore = (1 / mobil.price) * 1000000; // Inverse of price
      const featureScore = Object.values(mobil.features).flat().length;
      const valueScore = priceScore + featureScore;
      
      if (valueScore > bestValueScore) {
        bestValueScore = valueScore;
        bestValueIndex = index;
      }
    });
    
    return bestValueIndex;
  }

  private findBestPerformance(mobilData: MobilPerbandingan[]): number {
    const powers = mobilData.map(car => car.engine.power);
    return powers.indexOf(Math.max(...powers));
  }

  private findBestFuelEconomy(mobilData: MobilPerbandingan[]): number {
    const fuelConsumptions = mobilData.map(car => car.performance.fuelConsumption.combined);
    return fuelConsumptions.indexOf(Math.max(...fuelConsumptions));
  }

  private findBestSafety(mobilData: MobilPerbandingan[]): number {
    const safetyRatings = mobilData.map(car => car.ratings.safety);
    return safetyRatings.indexOf(Math.max(...safetyRatings));
  }

  private findBestComfort(mobilData: MobilPerbandingan[]): number {
    const comfortRatings = mobilData.map(car => car.ratings.comfort);
    return comfortRatings.indexOf(Math.max(...comfortRatings));
  }
}

export default KontrollerPerbandingan;
