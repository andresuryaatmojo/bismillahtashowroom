// LayananPencarian.ts - Search service for Mobilindo Showroom
export interface SearchResult<T = any> {
  items: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  searchQuery?: string;
  filters?: FilterCriteria;
  executionTime: number;
  suggestions?: string[];
}

export interface SearchOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeInactive?: boolean;
  fuzzySearch?: boolean;
  searchFields?: string[];
}

export interface FilterCriteria {
  kategori?: string[];
  hargaMin?: number;
  hargaMax?: number;
  tahunMin?: number;
  tahunMax?: number;
  merk?: string[];
  model?: string[];
  transmisi?: ('manual' | 'automatic')[];
  bahanBakar?: ('bensin' | 'diesel' | 'hybrid' | 'listrik')[];
  warna?: string[];
  kondisi?: ('baru' | 'bekas')[];
  lokasi?: string[];
  kilometerMax?: number;
  fiturTambahan?: string[];
  status?: string[];
  tanggalMulai?: Date;
  tanggalAkhir?: Date;
  rating?: number;
  verified?: boolean;
}

export interface MobilData {
  id: string;
  merk: string;
  model: string;
  tahun: number;
  harga: number;
  kilometer: number;
  transmisi: 'manual' | 'automatic';
  bahanBakar: 'bensin' | 'diesel' | 'hybrid' | 'listrik';
  warna: string;
  kondisi: 'baru' | 'bekas';
  lokasi: string;
  deskripsi: string;
  kategori: string;
  status: 'aktif' | 'terjual' | 'pending' | 'nonaktif';
  tanggalPosting: Date;
  penjual: {
    id: string;
    nama: string;
    rating: number;
    verified: boolean;
  };
  foto: string[];
  fiturTambahan: string[];
  views: number;
  favorit: number;
}

export interface SearchResponse {
  success: boolean;
  message: string;
  data?: SearchResult<MobilData>;
  errors?: string[];
}

export class LayananPencarian {
  private static instance: LayananPencarian;
  private searchHistory: string[] = [];
  private popularSearches: { [key: string]: number } = {};
  private searchCache: Map<string, { result: SearchResult<MobilData>; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_HISTORY = 50;
  private readonly MAX_SUGGESTIONS = 10;

  // Mock data for demonstration
  private mockMobilData: MobilData[] = [
    {
      id: 'mob_001',
      merk: 'Toyota',
      model: 'Avanza',
      tahun: 2022,
      harga: 220000000,
      kilometer: 15000,
      transmisi: 'manual',
      bahanBakar: 'bensin',
      warna: 'Putih',
      kondisi: 'bekas',
      lokasi: 'Jakarta',
      deskripsi: 'Toyota Avanza 2022 kondisi sangat baik, service record lengkap',
      kategori: 'MPV',
      status: 'aktif',
      tanggalPosting: new Date('2024-01-15'),
      penjual: { id: 'seller_001', nama: 'Ahmad Dealer', rating: 4.8, verified: true },
      foto: ['avanza1.jpg', 'avanza2.jpg'],
      fiturTambahan: ['AC', 'Power Steering', 'Central Lock'],
      views: 150,
      favorit: 12
    },
    {
      id: 'mob_002',
      merk: 'Honda',
      model: 'Civic',
      tahun: 2021,
      harga: 450000000,
      kilometer: 25000,
      transmisi: 'automatic',
      bahanBakar: 'bensin',
      warna: 'Hitam',
      kondisi: 'bekas',
      lokasi: 'Surabaya',
      deskripsi: 'Honda Civic Turbo 2021, kondisi prima, full original',
      kategori: 'Sedan',
      status: 'aktif',
      tanggalPosting: new Date('2024-01-20'),
      penjual: { id: 'seller_002', nama: 'Budi Motors', rating: 4.5, verified: true },
      foto: ['civic1.jpg', 'civic2.jpg', 'civic3.jpg'],
      fiturTambahan: ['Sunroof', 'Leather Seat', 'Turbo Engine'],
      views: 89,
      favorit: 8
    },
    {
      id: 'mob_003',
      merk: 'Mitsubishi',
      model: 'Pajero Sport',
      tahun: 2023,
      harga: 580000000,
      kilometer: 5000,
      transmisi: 'automatic',
      bahanBakar: 'diesel',
      warna: 'Silver',
      kondisi: 'baru',
      lokasi: 'Bandung',
      deskripsi: 'Mitsubishi Pajero Sport baru, garansi resmi',
      kategori: 'SUV',
      status: 'aktif',
      tanggalPosting: new Date('2024-01-25'),
      penjual: { id: 'seller_003', nama: 'Cahaya Motor', rating: 4.9, verified: true },
      foto: ['pajero1.jpg', 'pajero2.jpg'],
      fiturTambahan: ['4WD', 'Cruise Control', 'Parking Sensor'],
      views: 234,
      favorit: 25
    }
  ];

  public static getInstance(): LayananPencarian {
    if (!LayananPencarian.instance) {
      LayananPencarian.instance = new LayananPencarian();
    }
    return LayananPencarian.instance;
  }

  constructor() {
    this.loadSearchHistory();
    this.loadPopularSearches();
  }

  // Method: prosesPencarian
  public async prosesPencarian(kataKunci: string, options: SearchOptions = {}): Promise<SearchResponse> {
    const startTime = Date.now();

    try {
      // Validate input
      if (!kataKunci || kataKunci.trim() === '') {
        return {
          success: false,
          message: 'Kata kunci pencarian wajib diisi',
          errors: ['Kata kunci tidak boleh kosong']
        };
      }

      const cleanKeyword = kataKunci.trim().toLowerCase();
      
      // Check cache first
      const cacheKey = this.generateCacheKey(cleanKeyword, options);
      const cachedResult = this.getFromCache(cacheKey);
      if (cachedResult) {
        return {
          success: true,
          message: 'Hasil pencarian ditemukan (dari cache)',
          data: cachedResult
        };
      }

      // Add to search history
      this.addToSearchHistory(cleanKeyword);
      this.updatePopularSearches(cleanKeyword);

      // Set default options
      const searchOptions: Required<SearchOptions> = {
        page: options.page || 1,
        limit: options.limit || 20,
        sortBy: options.sortBy || 'relevance',
        sortOrder: options.sortOrder || 'desc',
        includeInactive: options.includeInactive || false,
        fuzzySearch: options.fuzzySearch !== false,
        searchFields: options.searchFields || ['merk', 'model', 'deskripsi', 'kategori']
      };

      // Perform search
      let filteredData = this.mockMobilData.filter(mobil => {
        // Skip inactive items unless specifically requested
        if (!searchOptions.includeInactive && mobil.status !== 'aktif') {
          return false;
        }

        // Search in specified fields
        const searchText = searchOptions.searchFields
          .map(field => this.getNestedValue(mobil, field))
          .join(' ')
          .toLowerCase();

        if (searchOptions.fuzzySearch) {
          return this.fuzzyMatch(searchText, cleanKeyword);
        } else {
          return searchText.includes(cleanKeyword);
        }
      });

      // Sort results
      filteredData = this.sortResults(filteredData, searchOptions.sortBy, searchOptions.sortOrder, cleanKeyword);

      // Calculate pagination
      const totalCount = filteredData.length;
      const totalPages = Math.ceil(totalCount / searchOptions.limit);
      const startIndex = (searchOptions.page - 1) * searchOptions.limit;
      const endIndex = startIndex + searchOptions.limit;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      // Generate suggestions
      const suggestions = this.generateSuggestions(cleanKeyword);

      const result: SearchResult<MobilData> = {
        items: paginatedData,
        totalCount,
        currentPage: searchOptions.page,
        totalPages,
        hasNextPage: searchOptions.page < totalPages,
        hasPreviousPage: searchOptions.page > 1,
        searchQuery: kataKunci,
        executionTime: Date.now() - startTime,
        suggestions
      };

      // Cache the result
      this.saveToCache(cacheKey, result);

      return {
        success: true,
        message: `Ditemukan ${totalCount} hasil untuk "${kataKunci}"`,
        data: result
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        message: 'Gagal melakukan pencarian',
        errors: [`Error: ${errorMessage}`]
      };
    }
  }

  // Method: prosesFilterKategori
  public async prosesFilterKategori(kategori: string, options: SearchOptions = {}): Promise<SearchResponse> {
    const startTime = Date.now();

    try {
      // Validate category
      if (!kategori || kategori.trim() === '') {
        return {
          success: false,
          message: 'Kategori wajib dipilih',
          errors: ['Kategori tidak boleh kosong']
        };
      }

      const cleanCategory = kategori.trim();
      
      // Check cache
      const cacheKey = this.generateCacheKey(`category:${cleanCategory}`, options);
      const cachedResult = this.getFromCache(cacheKey);
      if (cachedResult) {
        return {
          success: true,
          message: `Hasil filter kategori "${cleanCategory}" (dari cache)`,
          data: cachedResult
        };
      }

      // Set default options
      const searchOptions: Required<SearchOptions> = {
        page: options.page || 1,
        limit: options.limit || 20,
        sortBy: options.sortBy || 'tanggalPosting',
        sortOrder: options.sortOrder || 'desc',
        includeInactive: options.includeInactive || false,
        fuzzySearch: options.fuzzySearch !== false,
        searchFields: options.searchFields || ['kategori']
      };

      // Filter by category
      let filteredData = this.mockMobilData.filter(mobil => {
        if (!searchOptions.includeInactive && mobil.status !== 'aktif') {
          return false;
        }

        if (searchOptions.fuzzySearch) {
          return this.fuzzyMatch(mobil.kategori.toLowerCase(), cleanCategory.toLowerCase());
        } else {
          return mobil.kategori.toLowerCase() === cleanCategory.toLowerCase();
        }
      });

      // Sort results
      filteredData = this.sortResults(filteredData, searchOptions.sortBy, searchOptions.sortOrder);

      // Calculate pagination
      const totalCount = filteredData.length;
      const totalPages = Math.ceil(totalCount / searchOptions.limit);
      const startIndex = (searchOptions.page - 1) * searchOptions.limit;
      const endIndex = startIndex + searchOptions.limit;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      const result: SearchResult<MobilData> = {
        items: paginatedData,
        totalCount,
        currentPage: searchOptions.page,
        totalPages,
        hasNextPage: searchOptions.page < totalPages,
        hasPreviousPage: searchOptions.page > 1,
        filters: { kategori: [cleanCategory] },
        executionTime: Date.now() - startTime
      };

      // Cache the result
      this.saveToCache(cacheKey, result);

      return {
        success: true,
        message: `Ditemukan ${totalCount} mobil dalam kategori "${cleanCategory}"`,
        data: result
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        message: 'Gagal melakukan filter kategori',
        errors: [`Error: ${errorMessage}`]
      };
    }
  }

  // Method: terapkanFilterLanjutan
  public async terapkanFilterLanjutan(kriteriaFilter: FilterCriteria, options: SearchOptions = {}): Promise<SearchResponse> {
    const startTime = Date.now();

    try {
      // Validate filter criteria
      if (!kriteriaFilter || Object.keys(kriteriaFilter).length === 0) {
        return {
          success: false,
          message: 'Kriteria filter wajib diisi',
          errors: ['Minimal satu kriteria filter harus dipilih']
        };
      }

      // Check cache
      const cacheKey = this.generateCacheKey(`advanced:${JSON.stringify(kriteriaFilter)}`, options);
      const cachedResult = this.getFromCache(cacheKey);
      if (cachedResult) {
        return {
          success: true,
          message: 'Hasil filter lanjutan (dari cache)',
          data: cachedResult
        };
      }

      // Set default options
      const searchOptions: Required<SearchOptions> = {
        page: options.page || 1,
        limit: options.limit || 20,
        sortBy: options.sortBy || 'harga',
        sortOrder: options.sortOrder || 'asc',
        includeInactive: options.includeInactive || false,
        fuzzySearch: options.fuzzySearch !== false,
        searchFields: options.searchFields || []
      };

      // Apply advanced filters
      let filteredData = this.mockMobilData.filter(mobil => {
        if (!searchOptions.includeInactive && mobil.status !== 'aktif') {
          return false;
        }

        return this.matchesFilterCriteria(mobil, kriteriaFilter);
      });

      // Sort results
      filteredData = this.sortResults(filteredData, searchOptions.sortBy, searchOptions.sortOrder);

      // Calculate pagination
      const totalCount = filteredData.length;
      const totalPages = Math.ceil(totalCount / searchOptions.limit);
      const startIndex = (searchOptions.page - 1) * searchOptions.limit;
      const endIndex = startIndex + searchOptions.limit;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      const result: SearchResult<MobilData> = {
        items: paginatedData,
        totalCount,
        currentPage: searchOptions.page,
        totalPages,
        hasNextPage: searchOptions.page < totalPages,
        hasPreviousPage: searchOptions.page > 1,
        filters: kriteriaFilter,
        executionTime: Date.now() - startTime
      };

      // Cache the result
      this.saveToCache(cacheKey, result);

      return {
        success: true,
        message: `Ditemukan ${totalCount} mobil sesuai kriteria filter`,
        data: result
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        success: false,
        message: 'Gagal menerapkan filter lanjutan',
        errors: [`Error: ${errorMessage}`]
      };
    }
  }

  // Additional helper methods

  // Get search suggestions
  public getSearchSuggestions(query: string): string[] {
    const suggestions = this.generateSuggestions(query.toLowerCase());
    return suggestions.slice(0, this.MAX_SUGGESTIONS);
  }

  // Get popular searches
  public getPopularSearches(limit: number = 10): string[] {
    return Object.entries(this.popularSearches)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([search]) => search);
  }

  // Get search history
  public getSearchHistory(): string[] {
    return [...this.searchHistory].reverse();
  }

  // Clear search history
  public clearSearchHistory(): void {
    this.searchHistory = [];
    this.saveSearchHistory();
  }

  // Get available categories
  public getAvailableCategories(): string[] {
    const categories = new Set(this.mockMobilData.map(mobil => mobil.kategori));
    return Array.from(categories).sort();
  }

  // Get available brands
  public getAvailableBrands(): string[] {
    const brands = new Set(this.mockMobilData.map(mobil => mobil.merk));
    return Array.from(brands).sort();
  }

  // Get price range
  public getPriceRange(): { min: number; max: number } {
    const prices = this.mockMobilData.map(mobil => mobil.harga);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }

  // Get year range
  public getYearRange(): { min: number; max: number } {
    const years = this.mockMobilData.map(mobil => mobil.tahun);
    return {
      min: Math.min(...years),
      max: Math.max(...years)
    };
  }

  // Private helper methods

  private matchesFilterCriteria(mobil: MobilData, criteria: FilterCriteria): boolean {
    // Category filter
    if (criteria.kategori && criteria.kategori.length > 0) {
      if (!criteria.kategori.includes(mobil.kategori)) return false;
    }

    // Price range filter
    if (criteria.hargaMin !== undefined && mobil.harga < criteria.hargaMin) return false;
    if (criteria.hargaMax !== undefined && mobil.harga > criteria.hargaMax) return false;

    // Year range filter
    if (criteria.tahunMin !== undefined && mobil.tahun < criteria.tahunMin) return false;
    if (criteria.tahunMax !== undefined && mobil.tahun > criteria.tahunMax) return false;

    // Brand filter
    if (criteria.merk && criteria.merk.length > 0) {
      if (!criteria.merk.includes(mobil.merk)) return false;
    }

    // Model filter
    if (criteria.model && criteria.model.length > 0) {
      if (!criteria.model.includes(mobil.model)) return false;
    }

    // Transmission filter
    if (criteria.transmisi && criteria.transmisi.length > 0) {
      if (!criteria.transmisi.includes(mobil.transmisi)) return false;
    }

    // Fuel type filter
    if (criteria.bahanBakar && criteria.bahanBakar.length > 0) {
      if (!criteria.bahanBakar.includes(mobil.bahanBakar)) return false;
    }

    // Color filter
    if (criteria.warna && criteria.warna.length > 0) {
      if (!criteria.warna.includes(mobil.warna)) return false;
    }

    // Condition filter
    if (criteria.kondisi && criteria.kondisi.length > 0) {
      if (!criteria.kondisi.includes(mobil.kondisi)) return false;
    }

    // Location filter
    if (criteria.lokasi && criteria.lokasi.length > 0) {
      if (!criteria.lokasi.includes(mobil.lokasi)) return false;
    }

    // Mileage filter
    if (criteria.kilometerMax !== undefined && mobil.kilometer > criteria.kilometerMax) return false;

    // Status filter
    if (criteria.status && criteria.status.length > 0) {
      if (!criteria.status.includes(mobil.status)) return false;
    }

    // Date range filter
    if (criteria.tanggalMulai && mobil.tanggalPosting < criteria.tanggalMulai) return false;
    if (criteria.tanggalAkhir && mobil.tanggalPosting > criteria.tanggalAkhir) return false;

    // Rating filter
    if (criteria.rating !== undefined && mobil.penjual.rating < criteria.rating) return false;

    // Verified filter
    if (criteria.verified !== undefined && mobil.penjual.verified !== criteria.verified) return false;

    // Features filter
    if (criteria.fiturTambahan && criteria.fiturTambahan.length > 0) {
      const hasAllFeatures = criteria.fiturTambahan.every(feature => 
        mobil.fiturTambahan.includes(feature)
      );
      if (!hasAllFeatures) return false;
    }

    return true;
  }

  private sortResults(data: MobilData[], sortBy: string, sortOrder: 'asc' | 'desc', searchQuery?: string): MobilData[] {
    return data.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'relevance':
          if (searchQuery) {
            const scoreA = this.calculateRelevanceScore(a, searchQuery);
            const scoreB = this.calculateRelevanceScore(b, searchQuery);
            comparison = scoreB - scoreA; // Higher score first
          }
          break;
        case 'harga':
          comparison = a.harga - b.harga;
          break;
        case 'tahun':
          comparison = a.tahun - b.tahun;
          break;
        case 'kilometer':
          comparison = a.kilometer - b.kilometer;
          break;
        case 'tanggalPosting':
          comparison = a.tanggalPosting.getTime() - b.tanggalPosting.getTime();
          break;
        case 'views':
          comparison = a.views - b.views;
          break;
        case 'favorit':
          comparison = a.favorit - b.favorit;
          break;
        case 'rating':
          comparison = a.penjual.rating - b.penjual.rating;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  private calculateRelevanceScore(mobil: MobilData, searchQuery: string): number {
    let score = 0;
    const query = searchQuery.toLowerCase();

    // Exact matches get higher scores
    if (mobil.merk.toLowerCase() === query) score += 100;
    if (mobil.model.toLowerCase() === query) score += 100;
    if (mobil.kategori.toLowerCase() === query) score += 80;

    // Partial matches
    if (mobil.merk.toLowerCase().includes(query)) score += 50;
    if (mobil.model.toLowerCase().includes(query)) score += 50;
    if (mobil.deskripsi.toLowerCase().includes(query)) score += 30;
    if (mobil.kategori.toLowerCase().includes(query)) score += 40;

    // Boost for verified sellers
    if (mobil.penjual.verified) score += 10;

    // Boost for popular items
    score += mobil.views * 0.1;
    score += mobil.favorit * 2;

    return score;
  }

  private fuzzyMatch(text: string, query: string): boolean {
    // Simple fuzzy matching algorithm
    const textWords = text.split(/\s+/);
    const queryWords = query.split(/\s+/);

    return queryWords.every(queryWord => 
      textWords.some(textWord => 
        this.levenshteinDistance(textWord, queryWord) <= Math.max(1, Math.floor(queryWord.length * 0.2))
      )
    );
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private generateSuggestions(query: string): string[] {
    const suggestions = new Set<string>();

    // Add popular searches that match
    Object.keys(this.popularSearches).forEach(search => {
      if (search.includes(query) || query.includes(search)) {
        suggestions.add(search);
      }
    });

    // Add brand and model suggestions
    this.mockMobilData.forEach(mobil => {
      if (mobil.merk.toLowerCase().includes(query)) {
        suggestions.add(mobil.merk);
        suggestions.add(`${mobil.merk} ${mobil.model}`);
      }
      if (mobil.model.toLowerCase().includes(query)) {
        suggestions.add(mobil.model);
        suggestions.add(`${mobil.merk} ${mobil.model}`);
      }
      if (mobil.kategori.toLowerCase().includes(query)) {
        suggestions.add(mobil.kategori);
      }
    });

    return Array.from(suggestions).slice(0, this.MAX_SUGGESTIONS);
  }

  private getNestedValue(obj: any, path: string): string {
    return path.split('.').reduce((current, key) => current?.[key], obj) || '';
  }

  private generateCacheKey(query: string, options: SearchOptions): string {
    return `search:${query}:${JSON.stringify(options)}`;
  }

  private getFromCache(key: string): SearchResult<MobilData> | null {
    const cached = this.searchCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.result;
    }
    if (cached) {
      this.searchCache.delete(key);
    }
    return null;
  }

  private saveToCache(key: string, result: SearchResult<MobilData>): void {
    this.searchCache.set(key, {
      result,
      timestamp: Date.now()
    });

    // Clean old cache entries
    if (this.searchCache.size > 100) {
      const oldestKey = this.searchCache.keys().next().value;
      this.searchCache.delete(oldestKey);
    }
  }

  private addToSearchHistory(query: string): void {
    // Remove if already exists
    const index = this.searchHistory.indexOf(query);
    if (index > -1) {
      this.searchHistory.splice(index, 1);
    }

    // Add to beginning
    this.searchHistory.unshift(query);

    // Limit history size
    if (this.searchHistory.length > this.MAX_HISTORY) {
      this.searchHistory = this.searchHistory.slice(0, this.MAX_HISTORY);
    }

    this.saveSearchHistory();
  }

  private updatePopularSearches(query: string): void {
    this.popularSearches[query] = (this.popularSearches[query] || 0) + 1;
    this.savePopularSearches();
  }

  private loadSearchHistory(): void {
    try {
      const history = localStorage.getItem('mobilindo_search_history');
      if (history) {
        this.searchHistory = JSON.parse(history);
      }
    } catch (error) {
      this.searchHistory = [];
    }
  }

  private saveSearchHistory(): void {
    try {
      localStorage.setItem('mobilindo_search_history', JSON.stringify(this.searchHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  }

  private loadPopularSearches(): void {
    try {
      const popular = localStorage.getItem('mobilindo_popular_searches');
      if (popular) {
        this.popularSearches = JSON.parse(popular);
      }
    } catch (error) {
      this.popularSearches = {};
    }
  }

  private savePopularSearches(): void {
    try {
      localStorage.setItem('mobilindo_popular_searches', JSON.stringify(this.popularSearches));
    } catch (error) {
      console.error('Failed to save popular searches:', error);
    }
  }
}

// Export singleton instance
export const layananPencarian = LayananPencarian.getInstance();

// Default export for compatibility
export default LayananPencarian;