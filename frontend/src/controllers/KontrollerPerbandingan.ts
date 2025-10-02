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

  constructor() {
    this.token = localStorage.getItem('authToken');
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

      const params = new URLSearchParams();
      
      if (mobilIds.length > 0) {
        params.append('cars', mobilIds.join(','));
      }

      // Add filter parameters
      if (filter) {
        if (filter.brands) params.append('brands', filter.brands.join(','));
        if (filter.priceRange) {
          params.append('minPrice', filter.priceRange.min.toString());
          params.append('maxPrice', filter.priceRange.max.toString());
        }
        if (filter.yearRange) {
          params.append('minYear', filter.yearRange.min.toString());
          params.append('maxYear', filter.yearRange.max.toString());
        }
        if (filter.condition) params.append('condition', filter.condition.join(','));
        if (filter.transmission) params.append('transmission', filter.transmission.join(','));
        if (filter.fuelType) params.append('fuelType', filter.fuelType.join(','));
        if (filter.bodyType) params.append('bodyType', filter.bodyType.join(','));
        if (filter.seatingCapacity) params.append('seatingCapacity', filter.seatingCapacity.join(','));
        if (filter.features) params.append('features', filter.features.join(','));
        if (filter.location) params.append('location', filter.location.join(','));
        if (filter.availability !== undefined) params.append('availability', filter.availability.toString());
        if (filter.financing !== undefined) params.append('financing', filter.financing.toString());
      }

      const requestBody: any = {};
      if (preferensi) {
        requestBody.preferences = preferensi;
      }

      const response = await fetch(`${API_BASE_URL}/comparison?${params}`, {
        method: preferensi ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        ...(preferensi && { body: JSON.stringify(requestBody) })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      const halamanData: HalamanPerbandingan = {
        mobilTerpilih: result.data.selectedCars || [],
        mobilTersedia: result.data.availableCars || [],
        kategoriPerbandingan: result.data.categories || this.getDefaultKategori(),
        kriteriaPerbandingan: result.data.criteria || this.getDefaultKriteria(),
        filter: filter || {},
        preferensi: preferensi || this.getDefaultPreferensi(),
        hasilPerbandingan: result.data.comparison || undefined,
        rekomendasi: {
          populer: result.data.recommendations?.popular || [],
          serupa: result.data.recommendations?.similar || [],
          alternatif: result.data.recommendations?.alternative || []
        },
        statistik: {
          totalMobil: result.data.statistics?.totalCars || 0,
          totalPerbandingan: result.data.statistics?.totalComparisons || 0,
          kategoriPopuler: result.data.statistics?.popularCategories || [],
          brandPopuler: result.data.statistics?.popularBrands || []
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

      const response = await fetch(`${API_BASE_URL}/comparison/compare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          carIds: mobilIds,
          preferences: preferensi
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache the result
      this.setToCache(cacheKey, result.data);

      return result.data;

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

      const response = await fetch(`${API_BASE_URL}/comparison/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          preferences: preferensi,
          limit
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Cache the result
      this.setToCache(cacheKey, result.data);

      return result.data;

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
      const response = await fetch(`${API_BASE_URL}/comparison/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          comparison: hasilPerbandingan,
          format,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengexport perbandingan');
      }

      return {
        success: true,
        message: `Perbandingan berhasil diexport ke ${format.toUpperCase()}`,
        downloadUrl: result.data.downloadUrl
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
  private async kirimValidasiKeServer(
    keputusan: KeputusanPerbandingan,
    validasi: ValidasiKeputusan
  ): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/comparison/validation-analytics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          decision: keputusan,
          validation: validasi,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error sending validation to server:', error);
    }
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
    const cacheKeys = Array.from(this.cache.keys()); for (const key of cacheKeys) {
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
      // Simulate API call for sharing comparison
      await new Promise(resolve => setTimeout(resolve, 1000));

      const shareUrl = `https://mobilindo.com/perbandingan/${carId1}-vs-${carId2}`;
      
      if (shareType === 'link') {
        // Copy to clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareUrl);
        }
        
        return {
          success: true,
          shareUrl,
          message: 'Link perbandingan berhasil disalin ke clipboard'
        };
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
   * Clear all cache
   */
  public clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

export default KontrollerPerbandingan;
