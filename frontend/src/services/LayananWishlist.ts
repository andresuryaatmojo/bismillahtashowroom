// ==================== LAYANAN WISHLIST ====================
// Service untuk mengelola wishlist/daftar keinginan pengguna
// Sistem Mobilindo Showroom

// ==================== INTERFACES ====================

export interface WishlistItem {
  id: string;
  idPengguna: string;
  idMobil: string;
  dataMobil: DataMobilWishlist;
  tanggalDitambahkan: Date;
  catatan?: string;
  prioritas: 'high' | 'medium' | 'low';
  status: 'active' | 'purchased' | 'removed';
  notifikasiHarga: boolean;
  targetHarga?: number;
}

export interface DataMobilWishlist {
  id: string;
  merk: string;
  model: string;
  varian: string;
  tahun: number;
  harga: number;
  hargaPromo?: number;
  warna: string;
  transmisi: string;
  bahanBakar: string;
  gambarUtama: string;
  gambarTambahan: string[];
  spesifikasi: SpesifikasiMobil;
  dealer: DealerInfo;
  status: 'available' | 'sold' | 'reserved' | 'discontinued';
  rating: number;
  jumlahUlasan: number;
  fiturUnggulan: string[];
  promo: PromoInfo[];
}

export interface SpesifikasiMobil {
  mesin: string;
  tenaga: string;
  torsi: string;
  kapasitasTangki: string;
  konsumsiiBBM: string;
  dimensi: {
    panjang: number;
    lebar: number;
    tinggi: number;
    wheelbase: number;
  };
  kapasitasPenumpang: number;
  kapasitasBagasi: number;
  fiturKeselamatan: string[];
  fiturKenyamanan: string[];
  fiturHiburan: string[];
}

export interface DealerInfo {
  id: string;
  nama: string;
  alamat: string;
  kota: string;
  telepon: string;
  email: string;
  rating: number;
  jamOperasional: string;
  koordinat?: {
    latitude: number;
    longitude: number;
  };
}

export interface PromoInfo {
  id: string;
  judul: string;
  deskripsi: string;
  jenisPromo: 'discount' | 'cashback' | 'trade_in' | 'free_service' | 'low_dp';
  nilaiPromo: number;
  tanggalMulai: Date;
  tanggalBerakhir: Date;
  syaratKetentuan: string[];
  status: 'active' | 'expired' | 'coming_soon';
}

export interface WishlistData {
  idPengguna: string;
  totalItem: number;
  items: WishlistItem[];
  kategoriTerbanyak: string;
  merkTerbanyak: string;
  rataRataHarga: number;
  totalNilaiWishlist: number;
  itemTerbaru: WishlistItem | null;
  rekomendasiSerupa: DataMobilWishlist[];
  statistik: WishlistStatistik;
}

export interface WishlistStatistik {
  totalDitambahkan: number;
  totalDihapus: number;
  totalDibeli: number;
  kategoriPopuler: { [kategori: string]: number };
  merkPopuler: { [merk: string]: number };
  rentangHarga: {
    minimum: number;
    maksimum: number;
    rata: number;
  };
  aktivitasBulanan: { [bulan: string]: number };
}

export interface NotifikasiWishlist {
  id: string;
  idPengguna: string;
  idMobil: string;
  jenisNotifikasi: 'price_drop' | 'new_promo' | 'stock_alert' | 'similar_car';
  judul: string;
  pesan: string;
  tanggal: Date;
  dibaca: boolean;
  data: any;
}

export interface FilterWishlist {
  merk?: string[];
  rentangHarga?: {
    min: number;
    max: number;
  };
  tahun?: {
    min: number;
    max: number;
  };
  transmisi?: string[];
  bahanBakar?: string[];
  status?: string[];
  prioritas?: string[];
  urutkan?: 'tanggal_terbaru' | 'tanggal_terlama' | 'harga_terendah' | 'harga_tertinggi' | 'nama_az' | 'nama_za';
}

export interface WishlistServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
  timestamp: Date;
}

// ==================== MAIN SERVICE CLASS ====================

export class LayananWishlist {
  private static instance: LayananWishlist;
  private cache: Map<string, any> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 menit

  private constructor() {}

  public static getInstance(): LayananWishlist {
    if (!LayananWishlist.instance) {
      LayananWishlist.instance = new LayananWishlist();
    }
    return LayananWishlist.instance;
  }

  // ==================== METODE UTAMA ====================

  /**
   * Ambil data wishlist pengguna dengan filter dan statistik
   * @param idPengguna - ID pengguna
   * @param filter - Filter opsional untuk wishlist
   * @returns Promise<WishlistServiceResponse<WishlistData>>
   */
  public async ambilDataWishlistPengguna(idPengguna: string, filter?: FilterWishlist): Promise<WishlistServiceResponse<WishlistData>> {
    try {
      // Validasi input
      if (!idPengguna || idPengguna.trim() === '') {
        return {
          success: false,
          message: 'ID pengguna tidak valid',
          errors: ['ID pengguna harus diisi'],
          timestamp: new Date()
        };
      }

      // Check cache first
      const cacheKey = `wishlist_${idPengguna}_${JSON.stringify(filter || {})}`;
      const cachedData = this.getCache(cacheKey);
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          message: 'Data wishlist berhasil diambil dari cache',
          timestamp: new Date()
        };
      }

      // Ambil data wishlist dari database/storage
      const wishlistItems = await this.getWishlistFromStorage(idPengguna);
      
      // Apply filter jika ada
      let filteredItems = wishlistItems;
      if (filter) {
        filteredItems = this.applyFilter(wishlistItems, filter);
      }

      // Ambil data mobil lengkap untuk setiap item
      const itemsWithCarData = await Promise.all(
        filteredItems.map(async (item) => {
          const dataMobil = await this.getCarData(item.idMobil);
          return {
            ...item,
            dataMobil: dataMobil || this.createMockCarData(item.idMobil)
          };
        })
      );

      // Hitung statistik
      const statistik = this.calculateWishlistStatistics(wishlistItems);
      
      // Generate rekomendasi mobil serupa
      const rekomendasiSerupa = await this.generateSimilarCarRecommendations(itemsWithCarData);

      // Buat data wishlist lengkap
      const wishlistData: WishlistData = {
        idPengguna,
        totalItem: itemsWithCarData.length,
        items: itemsWithCarData,
        kategoriTerbanyak: this.getMostPopularCategory(itemsWithCarData),
        merkTerbanyak: this.getMostPopularBrand(itemsWithCarData),
        rataRataHarga: this.calculateAveragePrice(itemsWithCarData),
        totalNilaiWishlist: this.calculateTotalValue(itemsWithCarData),
        itemTerbaru: itemsWithCarData.length > 0 ? itemsWithCarData[0] : null,
        rekomendasiSerupa,
        statistik
      };

      // Cache the result
      this.setCache(cacheKey, wishlistData);

      // Update user activity
      await this.updateUserActivity(idPengguna, 'view_wishlist');

      return {
        success: true,
        data: wishlistData,
        message: `Berhasil mengambil ${itemsWithCarData.length} item wishlist`,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error retrieving wishlist data:', error);
      return {
        success: false,
        message: 'Gagal mengambil data wishlist',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  /**
   * Tambah mobil ke wishlist pengguna
   * @param idPengguna - ID pengguna
   * @param idMobil - ID mobil yang akan ditambahkan
   * @param catatan - Catatan opsional
   * @param prioritas - Prioritas item (high/medium/low)
   * @returns Promise<WishlistServiceResponse<WishlistItem>>
   */
  public async tambahKeWishlist(
    idPengguna: string, 
    idMobil: string, 
    catatan?: string, 
    prioritas: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<WishlistServiceResponse<WishlistItem>> {
    try {
      // Validasi input
      const validation = this.validateAddToWishlistInput(idPengguna, idMobil);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Data input tidak valid',
          errors: validation.errors,
          timestamp: new Date()
        };
      }

      // Cek apakah mobil sudah ada di wishlist
      const existingItems = await this.getWishlistFromStorage(idPengguna);
      const existingItem = existingItems.find(item => item.idMobil === idMobil && item.status === 'active');
      
      if (existingItem) {
        return {
          success: false,
          message: 'Mobil sudah ada di wishlist Anda',
          errors: ['Duplicate item in wishlist'],
          timestamp: new Date()
        };
      }

      // Ambil data mobil
      const dataMobil = await this.getCarData(idMobil);
      if (!dataMobil) {
        return {
          success: false,
          message: 'Data mobil tidak ditemukan',
          errors: ['Car data not found'],
          timestamp: new Date()
        };
      }

      // Cek ketersediaan mobil
      if (dataMobil.status === 'sold' || dataMobil.status === 'discontinued') {
        return {
          success: false,
          message: 'Mobil tidak tersedia untuk ditambahkan ke wishlist',
          errors: ['Car not available'],
          timestamp: new Date()
        };
      }

      // Buat item wishlist baru
      const newWishlistItem: WishlistItem = {
        id: this.generateId(),
        idPengguna,
        idMobil,
        dataMobil,
        tanggalDitambahkan: new Date(),
        catatan: catatan || '',
        prioritas,
        status: 'active',
        notifikasiHarga: true, // Default enable price notifications
        targetHarga: dataMobil.harga * 0.9 // Default target 10% discount
      };

      // Simpan ke storage
      await this.saveWishlistItem(newWishlistItem);

      // Clear cache untuk user ini
      this.clearUserCache(idPengguna);

      // Send notification
      await this.sendWishlistNotification(idPengguna, 'item_added', {
        carName: `${dataMobil.merk} ${dataMobil.model}`,
        carId: idMobil
      });

      // Update user activity
      await this.updateUserActivity(idPengguna, 'add_to_wishlist', { idMobil });

      // Log analytics
      await this.logWishlistAnalytics(idPengguna, 'add', {
        carBrand: dataMobil.merk,
        carModel: dataMobil.model,
        carPrice: dataMobil.harga,
        priority: prioritas
      });

      return {
        success: true,
        data: newWishlistItem,
        message: `${dataMobil.merk} ${dataMobil.model} berhasil ditambahkan ke wishlist`,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return {
        success: false,
        message: 'Gagal menambahkan mobil ke wishlist',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  /**
   * Hapus mobil dari wishlist pengguna
   * @param idPengguna - ID pengguna
   * @param idMobil - ID mobil yang akan dihapus
   * @returns Promise<WishlistServiceResponse<boolean>>
   */
  public async hapusDariWishlist(idPengguna: string, idMobil: string): Promise<WishlistServiceResponse<boolean>> {
    try {
      // Validasi input
      if (!idPengguna || !idMobil) {
        return {
          success: false,
          message: 'ID pengguna dan ID mobil harus diisi',
          errors: ['Missing required parameters'],
          timestamp: new Date()
        };
      }

      // Ambil data wishlist saat ini
      const existingItems = await this.getWishlistFromStorage(idPengguna);
      const itemToRemove = existingItems.find(item => item.idMobil === idMobil && item.status === 'active');
      
      if (!itemToRemove) {
        return {
          success: false,
          message: 'Mobil tidak ditemukan di wishlist Anda',
          errors: ['Item not found in wishlist'],
          timestamp: new Date()
        };
      }

      // Update status item menjadi 'removed' instead of deleting
      const updatedItem = {
        ...itemToRemove,
        status: 'removed' as const,
        tanggalDihapus: new Date()
      };

      // Simpan perubahan
      await this.updateWishlistItem(updatedItem);

      // Clear cache untuk user ini
      this.clearUserCache(idPengguna);

      // Send notification
      await this.sendWishlistNotification(idPengguna, 'item_removed', {
        carName: `${itemToRemove.dataMobil.merk} ${itemToRemove.dataMobil.model}`,
        carId: idMobil
      });

      // Update user activity
      await this.updateUserActivity(idPengguna, 'remove_from_wishlist', { idMobil });

      // Log analytics
      await this.logWishlistAnalytics(idPengguna, 'remove', {
        carBrand: itemToRemove.dataMobil.merk,
        carModel: itemToRemove.dataMobil.model,
        carPrice: itemToRemove.dataMobil.harga,
        daysInWishlist: Math.floor((new Date().getTime() - itemToRemove.tanggalDitambahkan.getTime()) / (1000 * 60 * 60 * 24))
      });

      return {
        success: true,
        data: true,
        message: `${itemToRemove.dataMobil.merk} ${itemToRemove.dataMobil.model} berhasil dihapus dari wishlist`,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return {
        success: false,
        message: 'Gagal menghapus mobil dari wishlist',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  // ==================== METODE PEMBANTU ====================

  private generateId(): string {
    return 'wishlist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private validateAddToWishlistInput(idPengguna: string, idMobil: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!idPengguna || idPengguna.trim() === '') {
      errors.push('ID pengguna harus diisi');
    }

    if (!idMobil || idMobil.trim() === '') {
      errors.push('ID mobil harus diisi');
    }

    // Validate ID format (basic validation)
    if (idPengguna && !/^[a-zA-Z0-9_-]+$/.test(idPengguna)) {
      errors.push('Format ID pengguna tidak valid');
    }

    if (idMobil && !/^[a-zA-Z0-9_-]+$/.test(idMobil)) {
      errors.push('Format ID mobil tidak valid');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private async getWishlistFromStorage(idPengguna: string): Promise<WishlistItem[]> {
    try {
      // Mock data - in real implementation, this would fetch from database
      const mockWishlistData: WishlistItem[] = [
        {
          id: 'wishlist_1',
          idPengguna,
          idMobil: 'car_001',
          dataMobil: this.createMockCarData('car_001'),
          tanggalDitambahkan: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          catatan: 'Mobil impian untuk keluarga',
          prioritas: 'high',
          status: 'active',
          notifikasiHarga: true,
          targetHarga: 270000000
        },
        {
          id: 'wishlist_2',
          idPengguna,
          idMobil: 'car_002',
          dataMobil: this.createMockCarData('car_002'),
          tanggalDitambahkan: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          catatan: 'Untuk upgrade dari mobil lama',
          prioritas: 'medium',
          status: 'active',
          notifikasiHarga: true,
          targetHarga: 320000000
        }
      ];

      return mockWishlistData.filter(item => item.idPengguna === idPengguna);
    } catch (error) {
      console.error('Error fetching wishlist from storage:', error);
      return [];
    }
  }

  private async getCarData(idMobil: string): Promise<DataMobilWishlist | null> {
    try {
      // Mock implementation - in real app, this would fetch from car service/API
      return this.createMockCarData(idMobil);
    } catch (error) {
      console.error('Error fetching car data:', error);
      return null;
    }
  }

  private createMockCarData(idMobil: string): DataMobilWishlist {
    const mockCars: { [key: string]: Partial<DataMobilWishlist> } = {
      'car_001': {
        merk: 'Toyota',
        model: 'Avanza',
        varian: 'Veloz 1.5 AT',
        tahun: 2023,
        harga: 300000000,
        hargaPromo: 285000000,
        warna: 'Putih',
        transmisi: 'Automatic',
        bahanBakar: 'Bensin'
      },
      'car_002': {
        merk: 'Honda',
        model: 'CR-V',
        varian: 'Turbo Prestige',
        tahun: 2023,
        harga: 650000000,
        warna: 'Hitam',
        transmisi: 'CVT',
        bahanBakar: 'Bensin Turbo'
      },
      'car_003': {
        merk: 'Mitsubishi',
        model: 'Pajero Sport',
        varian: 'Dakar Ultimate 4x4',
        tahun: 2023,
        harga: 750000000,
        warna: 'Silver',
        transmisi: 'Automatic',
        bahanBakar: 'Diesel'
      }
    };

    const carTemplate = mockCars[idMobil] || mockCars['car_001'];

    return {
      id: idMobil,
      merk: carTemplate.merk || 'Toyota',
      model: carTemplate.model || 'Avanza',
      varian: carTemplate.varian || 'G MT',
      tahun: carTemplate.tahun || 2023,
      harga: carTemplate.harga || 250000000,
      hargaPromo: carTemplate.hargaPromo,
      warna: carTemplate.warna || 'Putih',
      transmisi: carTemplate.transmisi || 'Manual',
      bahanBakar: carTemplate.bahanBakar || 'Bensin',
      gambarUtama: `/images/cars/${idMobil}/main.jpg`,
      gambarTambahan: [
        `/images/cars/${idMobil}/side.jpg`,
        `/images/cars/${idMobil}/interior.jpg`,
        `/images/cars/${idMobil}/engine.jpg`
      ],
      spesifikasi: {
        mesin: '1.5L DOHC VVT-i',
        tenaga: '104 HP @ 6000 rpm',
        torsi: '138 Nm @ 4200 rpm',
        kapasitasTangki: '45 Liter',
        konsumsiiBBM: '13.7 km/L',
        dimensi: {
          panjang: 4395,
          lebar: 1730,
          tinggi: 1700,
          wheelbase: 2750
        },
        kapasitasPenumpang: 7,
        kapasitasBagasi: 296,
        fiturKeselamatan: ['ABS', 'EBD', 'Airbag', 'VSC'],
        fiturKenyamanan: ['AC', 'Power Steering', 'Central Lock'],
        fiturHiburan: ['Audio System', 'USB Port', 'Bluetooth']
      },
      dealer: {
        id: 'dealer_001',
        nama: 'Toyota Sunter',
        alamat: 'Jl. Yos Sudarso No. 123',
        kota: 'Jakarta',
        telepon: '021-12345678',
        email: 'info@toyotasunter.com',
        rating: 4.5,
        jamOperasional: '08:00 - 17:00',
        koordinat: {
          latitude: -6.1234,
          longitude: 106.8765
        }
      },
      status: 'available',
      rating: 4.3,
      jumlahUlasan: 127,
      fiturUnggulan: ['Irit BBM', 'Lega 7 Penumpang', 'Mudah Dirawat'],
      promo: [
        {
          id: 'promo_001',
          judul: 'Diskon Akhir Tahun',
          deskripsi: 'Dapatkan diskon hingga 15 juta',
          jenisPromo: 'discount',
          nilaiPromo: 15000000,
          tanggalMulai: new Date('2024-12-01'),
          tanggalBerakhir: new Date('2024-12-31'),
          syaratKetentuan: ['Berlaku untuk pembelian cash', 'Tidak dapat digabung dengan promo lain'],
          status: 'active'
        }
      ]
    };
  }

  private applyFilter(items: WishlistItem[], filter: FilterWishlist): WishlistItem[] {
    let filtered = [...items];

    // Filter by brand
    if (filter.merk && filter.merk.length > 0) {
      filtered = filtered.filter(item => filter.merk!.includes(item.dataMobil.merk));
    }

    // Filter by price range
    if (filter.rentangHarga) {
      filtered = filtered.filter(item => 
        item.dataMobil.harga >= filter.rentangHarga!.min && 
        item.dataMobil.harga <= filter.rentangHarga!.max
      );
    }

    // Filter by year range
    if (filter.tahun) {
      filtered = filtered.filter(item => 
        item.dataMobil.tahun >= filter.tahun!.min && 
        item.dataMobil.tahun <= filter.tahun!.max
      );
    }

    // Filter by transmission
    if (filter.transmisi && filter.transmisi.length > 0) {
      filtered = filtered.filter(item => filter.transmisi!.includes(item.dataMobil.transmisi));
    }

    // Filter by fuel type
    if (filter.bahanBakar && filter.bahanBakar.length > 0) {
      filtered = filtered.filter(item => filter.bahanBakar!.includes(item.dataMobil.bahanBakar));
    }

    // Filter by status
    if (filter.status && filter.status.length > 0) {
      filtered = filtered.filter(item => filter.status!.includes(item.status));
    }

    // Filter by priority
    if (filter.prioritas && filter.prioritas.length > 0) {
      filtered = filtered.filter(item => filter.prioritas!.includes(item.prioritas));
    }

    // Apply sorting
    if (filter.urutkan) {
      filtered = this.sortWishlistItems(filtered, filter.urutkan);
    }

    return filtered;
  }

  private sortWishlistItems(items: WishlistItem[], sortBy: string): WishlistItem[] {
    const sorted = [...items];

    switch (sortBy) {
      case 'tanggal_terbaru':
        return sorted.sort((a, b) => b.tanggalDitambahkan.getTime() - a.tanggalDitambahkan.getTime());
      case 'tanggal_terlama':
        return sorted.sort((a, b) => a.tanggalDitambahkan.getTime() - b.tanggalDitambahkan.getTime());
      case 'harga_terendah':
        return sorted.sort((a, b) => a.dataMobil.harga - b.dataMobil.harga);
      case 'harga_tertinggi':
        return sorted.sort((a, b) => b.dataMobil.harga - a.dataMobil.harga);
      case 'nama_az':
        return sorted.sort((a, b) => `${a.dataMobil.merk} ${a.dataMobil.model}`.localeCompare(`${b.dataMobil.merk} ${b.dataMobil.model}`));
      case 'nama_za':
        return sorted.sort((a, b) => `${b.dataMobil.merk} ${b.dataMobil.model}`.localeCompare(`${a.dataMobil.merk} ${a.dataMobil.model}`));
      default:
        return sorted;
    }
  }

  private calculateWishlistStatistics(items: WishlistItem[]): WishlistStatistik {
    const activeItems = items.filter(item => item.status === 'active');
    const removedItems = items.filter(item => item.status === 'removed');
    const purchasedItems = items.filter(item => item.status === 'purchased');

    // Calculate category popularity
    const kategoriPopuler: { [kategori: string]: number } = {};
    activeItems.forEach(item => {
      const kategori = this.getCategoryFromCar(item.dataMobil);
      kategoriPopuler[kategori] = (kategoriPopuler[kategori] || 0) + 1;
    });

    // Calculate brand popularity
    const merkPopuler: { [merk: string]: number } = {};
    activeItems.forEach(item => {
      merkPopuler[item.dataMobil.merk] = (merkPopuler[item.dataMobil.merk] || 0) + 1;
    });

    // Calculate price range
    const prices = activeItems.map(item => item.dataMobil.harga);
    const rentangHarga = {
      minimum: prices.length > 0 ? Math.min(...prices) : 0,
      maksimum: prices.length > 0 ? Math.max(...prices) : 0,
      rata: prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0
    };

    // Calculate monthly activity (mock data)
    const aktivitasBulanan: { [bulan: string]: number } = {
      'Jan 2024': 5,
      'Feb 2024': 8,
      'Mar 2024': 12,
      'Apr 2024': 7,
      'May 2024': 15,
      'Jun 2024': 10
    };

    return {
      totalDitambahkan: items.length,
      totalDihapus: removedItems.length,
      totalDibeli: purchasedItems.length,
      kategoriPopuler,
      merkPopuler,
      rentangHarga,
      aktivitasBulanan
    };
  }

  private getCategoryFromCar(car: DataMobilWishlist): string {
    // Simple categorization logic
    const model = car.model.toLowerCase();
    if (model.includes('avanza') || model.includes('xenia') || model.includes('ertiga')) {
      return 'MPV';
    } else if (model.includes('cr-v') || model.includes('pajero') || model.includes('fortuner')) {
      return 'SUV';
    } else if (model.includes('civic') || model.includes('camry') || model.includes('accord')) {
      return 'Sedan';
    } else if (model.includes('agya') || model.includes('ayla') || model.includes('brio')) {
      return 'Hatchback';
    }
    return 'Lainnya';
  }

  private getMostPopularCategory(items: WishlistItem[]): string {
    const categories: { [key: string]: number } = {};
    items.forEach(item => {
      const category = this.getCategoryFromCar(item.dataMobil);
      categories[category] = (categories[category] || 0) + 1;
    });

    return Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b, 'Tidak ada');
  }

  private getMostPopularBrand(items: WishlistItem[]): string {
    const brands: { [key: string]: number } = {};
    items.forEach(item => {
      brands[item.dataMobil.merk] = (brands[item.dataMobil.merk] || 0) + 1;
    });

    return Object.keys(brands).reduce((a, b) => brands[a] > brands[b] ? a : b, 'Tidak ada');
  }

  private calculateAveragePrice(items: WishlistItem[]): number {
    if (items.length === 0) return 0;
    const total = items.reduce((sum, item) => sum + item.dataMobil.harga, 0);
    return Math.round(total / items.length);
  }

  private calculateTotalValue(items: WishlistItem[]): number {
    return items.reduce((sum, item) => sum + item.dataMobil.harga, 0);
  }

  private async generateSimilarCarRecommendations(items: WishlistItem[]): Promise<DataMobilWishlist[]> {
    // Mock recommendations based on user's wishlist
    const recommendations: DataMobilWishlist[] = [
      this.createMockCarData('rec_001'),
      this.createMockCarData('rec_002'),
      this.createMockCarData('rec_003')
    ];

    return recommendations.slice(0, 5); // Return max 5 recommendations
  }

  private async saveWishlistItem(item: WishlistItem): Promise<void> {
    // Mock implementation - in real app, this would save to database
    console.log('Saving wishlist item:', item.id);
  }

  private async updateWishlistItem(item: WishlistItem): Promise<void> {
    // Mock implementation - in real app, this would update database
    console.log('Updating wishlist item:', item.id);
  }

  private async sendWishlistNotification(idPengguna: string, type: string, data: any): Promise<void> {
    // Mock implementation - in real app, this would send actual notifications
    console.log(`Sending ${type} notification to user ${idPengguna}:`, data);
  }

  private async updateUserActivity(idPengguna: string, activity: string, data?: any): Promise<void> {
    // Mock implementation - in real app, this would log user activity
    console.log(`User ${idPengguna} activity: ${activity}`, data);
  }

  private async logWishlistAnalytics(idPengguna: string, action: string, data: any): Promise<void> {
    // Mock implementation - in real app, this would send to analytics service
    console.log(`Analytics: User ${idPengguna} ${action}`, data);
  }

  private clearUserCache(idPengguna: string): void {
    // Clear all cache entries for this user
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.includes(`wishlist_${idPengguna}`)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private getCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  // ==================== METODE UTILITAS TAMBAHAN ====================

  /**
   * Update prioritas item wishlist
   */
  public async updatePrioritas(idPengguna: string, idMobil: string, prioritas: 'high' | 'medium' | 'low'): Promise<WishlistServiceResponse<boolean>> {
    try {
      const items = await this.getWishlistFromStorage(idPengguna);
      const item = items.find(i => i.idMobil === idMobil && i.status === 'active');
      
      if (!item) {
        return {
          success: false,
          message: 'Item tidak ditemukan di wishlist',
          timestamp: new Date()
        };
      }

      const updatedItem = { ...item, prioritas };
      await this.updateWishlistItem(updatedItem);
      this.clearUserCache(idPengguna);

      return {
        success: true,
        data: true,
        message: 'Prioritas berhasil diupdate',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Gagal mengupdate prioritas',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  /**
   * Set target harga untuk notifikasi
   */
  public async setTargetHarga(idPengguna: string, idMobil: string, targetHarga: number): Promise<WishlistServiceResponse<boolean>> {
    try {
      const items = await this.getWishlistFromStorage(idPengguna);
      const item = items.find(i => i.idMobil === idMobil && i.status === 'active');
      
      if (!item) {
        return {
          success: false,
          message: 'Item tidak ditemukan di wishlist',
          timestamp: new Date()
        };
      }

      const updatedItem = { ...item, targetHarga, notifikasiHarga: true };
      await this.updateWishlistItem(updatedItem);
      this.clearUserCache(idPengguna);

      return {
        success: true,
        data: true,
        message: 'Target harga berhasil diset',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Gagal mengset target harga',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }

  /**
   * Get wishlist notifications
   */
  public async getNotifikasiWishlist(idPengguna: string): Promise<WishlistServiceResponse<NotifikasiWishlist[]>> {
    try {
      // Mock notifications
      const notifications: NotifikasiWishlist[] = [
        {
          id: 'notif_001',
          idPengguna,
          idMobil: 'car_001',
          jenisNotifikasi: 'price_drop',
          judul: 'Harga Turun!',
          pesan: 'Toyota Avanza turun harga 10 juta!',
          tanggal: new Date(),
          dibaca: false,
          data: { oldPrice: 300000000, newPrice: 290000000 }
        }
      ];

      return {
        success: true,
        data: notifications,
        message: 'Notifikasi berhasil diambil',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Gagal mengambil notifikasi',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        timestamp: new Date()
      };
    }
  }
}

// ==================== EXPORT SINGLETON ====================
export const layananWishlist = LayananWishlist.getInstance();

// Default export for compatibility
export default LayananWishlist;