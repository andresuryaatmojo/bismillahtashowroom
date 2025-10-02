// LayananUser.ts - Service untuk mengelola operasi terkait pengguna

// Interfaces
interface DataUser {
  id: string;
  username: string;
  email: string;
  namaLengkap: string;
  nomorTelepon: string;
  alamat: AlamatUser;
  tanggalLahir: string;
  jenisKelamin: 'L' | 'P';
  foto: string;
  role: 'admin' | 'sales' | 'customer' | 'manager' | 'supervisor';
  status: 'aktif' | 'nonaktif' | 'suspended' | 'pending';
  tanggalDaftar: string;
  terakhirLogin: string;
  verifikasi: VerifikasiUser;
  preferensi: PreferensiUser;
  statistik: StatistikUser;
  riwayatAktivitas: RiwayatAktivitas[];
  dokumen: DokumenUser[];
  kontak: KontakDarurat;
  pengaturanPrivasi: PengaturanPrivasi;
  notifikasi: PengaturanNotifikasi;
  keamanan: PengaturanKeamanan;
}

interface AlamatUser {
  jalan: string;
  kota: string;
  provinsi: string;
  kodePos: string;
  negara: string;
  koordinat?: {
    latitude: number;
    longitude: number;
  };
}

interface VerifikasiUser {
  email: boolean;
  nomorTelepon: boolean;
  identitas: boolean;
  dokumenIdentitas?: string;
  tanggalVerifikasi?: string;
}

interface PreferensiUser {
  bahasa: string;
  timezone: string;
  mata_uang: string;
  notifikasi_email: boolean;
  notifikasi_sms: boolean;
  notifikasi_push: boolean;
  tema: 'light' | 'dark' | 'auto';
  layout: 'compact' | 'comfortable' | 'spacious';
}

interface StatistikUser {
  totalLogin: number;
  totalTransaksi: number;
  totalPembelian: number;
  ratingRata: number;
  poinLoyalitas: number;
  levelMember: string;
  waktuOnlineTotal: number;
  fiturTerpakai: string[];
}

interface RiwayatAktivitas {
  id: string;
  tanggal: string;
  waktu: string;
  aktivitas: string;
  deskripsi: string;
  ipAddress: string;
  userAgent: string;
  lokasi?: string;
  status: 'berhasil' | 'gagal' | 'pending';
}

interface DokumenUser {
  id: string;
  jenis: 'ktp' | 'sim' | 'passport' | 'npwp' | 'lainnya';
  nama: string;
  nomor: string;
  file: string;
  tanggalUpload: string;
  status: 'pending' | 'verified' | 'rejected';
  keterangan?: string;
}

interface KontakDarurat {
  nama: string;
  hubungan: string;
  nomorTelepon: string;
  email?: string;
  alamat?: string;
}

interface PengaturanPrivasi {
  profilPublik: boolean;
  tampilkanEmail: boolean;
  tampilkanTelepon: boolean;
  tampilkanAlamat: boolean;
  izinkanPesan: boolean;
  bagikanData: boolean;
}

interface PengaturanNotifikasi {
  email: {
    transaksi: boolean;
    promosi: boolean;
    newsletter: boolean;
    sistem: boolean;
  };
  sms: {
    transaksi: boolean;
    promosi: boolean;
    keamanan: boolean;
  };
  push: {
    transaksi: boolean;
    chat: boolean;
    promosi: boolean;
    sistem: boolean;
  };
}

interface PengaturanKeamanan {
  twoFactorAuth: boolean;
  loginNotifikasi: boolean;
  sessionTimeout: number;
  passwordLastChanged: string;
  recoveryEmail?: string;
  recoveryPhone?: string;
  trustedDevices: TrustedDevice[];
}

interface TrustedDevice {
  id: string;
  nama: string;
  jenis: string;
  terakhirDigunakan: string;
  lokasi: string;
  status: 'aktif' | 'nonaktif';
}

interface KriteriaUser {
  role?: string[];
  status?: string[];
  tanggalDaftarMulai?: string;
  tanggalDaftarSelesai?: string;
  verifikasi?: boolean;
  kota?: string[];
  levelMember?: string[];
  aktifitasTerakhir?: number; // hari
}

interface HasilPencarianUser {
  users: DataUser[];
  total: number;
  halaman: number;
  totalHalaman: number;
  filterTerapan: FilterTerapanUser;
  statistikPencarian: StatistikPencarianUser;
  saranPencarian: string[];
}

interface FilterTerapanUser {
  role: string[];
  status: string[];
  verifikasi: boolean | null;
  rentangTanggal: {
    mulai: string;
    selesai: string;
  } | null;
  lokasi: string[];
  levelMember: string[];
}

interface StatistikPencarianUser {
  totalDitemukan: number;
  distribusiRole: { [key: string]: number };
  distribusiStatus: { [key: string]: number };
  distribusiLokasi: { [key: string]: number };
  rataUsia: number;
  persentaseVerifikasi: number;
}

interface DataPengelolaanPengguna {
  ringkasan: RingkasanPengguna;
  statistik: StatistikPengguna;
  aktivitasTerkini: AktivitasPengguna[];
  pengguna: DataUser[];
  filter: FilterPengelolaan;
  pengaturan: PengaturanPengelolaan;
}

interface RingkasanPengguna {
  totalPengguna: number;
  penggunaAktif: number;
  penggunaBaru: number;
  penggunaSuspended: number;
  tingkatVerifikasi: number;
  tingkatRetensi: number;
}

interface StatistikPengguna {
  distribusiRole: { [key: string]: number };
  distribusiStatus: { [key: string]: number };
  distribusiUmur: { [key: string]: number };
  distribusiLokasi: { [key: string]: number };
  trendPendaftaran: TrendData[];
  aktivitasHarian: TrendData[];
}

interface TrendData {
  tanggal: string;
  nilai: number;
  perubahan?: number;
}

interface AktivitasPengguna {
  id: string;
  userId: string;
  namaUser: string;
  aktivitas: string;
  waktu: string;
  status: string;
  detail?: any;
}

interface FilterPengelolaan {
  role: string[];
  status: string[];
  verifikasi: boolean[];
  rentangTanggal: {
    mulai: string;
    selesai: string;
  };
  lokasi: string[];
}

interface PengaturanPengelolaan {
  autoSuspend: boolean;
  verifikasiOtomatis: boolean;
  notifikasiAdmin: boolean;
  backupData: boolean;
  retentionPeriod: number;
}

interface ResponLayanan<T = any> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// Main Service Class
class LayananUser {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.loadConfiguration();
  }

  // Main Methods
  async ambilSemuaDataUser(
    kriteria?: KriteriaUser,
    halaman: number = 1,
    limit: number = 20,
    urutkan?: string
  ): Promise<ResponLayanan<HasilPencarianUser>> {
    try {
      await this.simulateApiDelay(800);

      const cacheKey = `all_users_${JSON.stringify(kriteria)}_${halaman}_${limit}_${urutkan}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Data pengguna berhasil diambil dari cache',
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Generate mock users
      const allUsers = this.generateMockUsers(100);
      
      // Apply filters
      let filteredUsers = this.applyUserFilters(allUsers, kriteria);
      
      // Apply sorting
      if (urutkan) {
        filteredUsers = this.sortUsers(filteredUsers, urutkan);
      }

      // Pagination
      const startIndex = (halaman - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      const result: HasilPencarianUser = {
        users: paginatedUsers,
        total: filteredUsers.length,
        halaman,
        totalHalaman: Math.ceil(filteredUsers.length / limit),
        filterTerapan: this.buildAppliedFilters(kriteria),
        statistikPencarian: this.generateSearchStatistics(filteredUsers),
        saranPencarian: this.generateSearchSuggestions(kriteria)
      };

      this.setCache(cacheKey, result);
      this.logActivity('Mengambil semua data user', { kriteria, halaman, limit });

      return {
        success: true,
        data: result,
        message: 'Data pengguna berhasil diambil',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error mengambil data user', error);
      return {
        success: false,
        message: 'Gagal mengambil data pengguna',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };
    }
  }

  async updateDataUser(idUser: string, dataUser: Partial<DataUser>): Promise<ResponLayanan<DataUser>> {
    try {
      await this.simulateApiDelay(600);

      // Validate user exists
      const existingUser = this.generateMockUsers(1)[0];
      if (!existingUser) {
        return {
          success: false,
          message: 'Pengguna tidak ditemukan',
          errors: ['User ID tidak valid'],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Validate update data
      const validation = this.validateUserData(dataUser);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Data pengguna tidak valid',
          errors: validation.errors,
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Simulate update
      const updatedUser: DataUser = {
        ...existingUser,
        ...dataUser,
        id: idUser
      };

      // Clear related cache
      this.clearUserCache(idUser);
      this.logActivity('Update data user', { idUser, dataUser });

      return {
        success: true,
        data: updatedUser,
        message: 'Data pengguna berhasil diperbarui',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error update data user', error);
      return {
        success: false,
        message: 'Gagal memperbarui data pengguna',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };
    }
  }

  async hapusDataUser(idUser: string): Promise<ResponLayanan<boolean>> {
    try {
      await this.simulateApiDelay(500);

      // Validate user exists
      const user = this.generateMockUsers(1)[0];
      if (!user) {
        return {
          success: false,
          message: 'Pengguna tidak ditemukan',
          errors: ['User ID tidak valid'],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Validate deletion rules
      const validation = this.validateUserDeletion(user);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Pengguna tidak dapat dihapus',
          errors: validation.errors,
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Clear related cache
      this.clearUserCache(idUser);
      this.logActivity('Hapus data user', { idUser });

      return {
        success: true,
        data: true,
        message: 'Data pengguna berhasil dihapus',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error hapus data user', error);
      return {
        success: false,
        message: 'Gagal menghapus data pengguna',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };
    }
  }

  async cariDanTampilkanDataUser(kataKunci: string): Promise<ResponLayanan<HasilPencarianUser>> {
    try {
      await this.simulateApiDelay(400);

      if (!kataKunci || kataKunci.trim().length < 2) {
        return {
          success: false,
          message: 'Kata kunci pencarian minimal 2 karakter',
          errors: ['Kata kunci terlalu pendek'],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      const cacheKey = `search_users_${kataKunci}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Hasil pencarian berhasil diambil dari cache',
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Generate mock users and search
      const allUsers = this.generateMockUsers(50);
      const searchResults = this.searchUsers(allUsers, kataKunci);

      const result: HasilPencarianUser = {
        users: searchResults,
        total: searchResults.length,
        halaman: 1,
        totalHalaman: 1,
        filterTerapan: {
          role: [],
          status: [],
          verifikasi: null,
          rentangTanggal: null,
          lokasi: [],
          levelMember: []
        },
        statistikPencarian: this.generateSearchStatistics(searchResults),
        saranPencarian: this.generateSearchSuggestions()
      };

      this.setCache(cacheKey, result);
      this.logActivity('Pencarian data user', { kataKunci });

      return {
        success: true,
        data: result,
        message: 'Pencarian pengguna berhasil',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error pencarian data user', error);
      return {
        success: false,
        message: 'Gagal melakukan pencarian pengguna',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };
    }
  }

  async muatPengelolaanPengguna(): Promise<ResponLayanan<DataPengelolaanPengguna>> {
    try {
      await this.simulateApiDelay(1000);

      const cacheKey = 'user_management_data';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Data pengelolaan pengguna berhasil diambil dari cache',
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      const users = this.generateMockUsers(20);
      const result: DataPengelolaanPengguna = {
        ringkasan: this.generateUserSummary(users),
        statistik: this.generateUserStatistics(users),
        aktivitasTerkini: this.generateRecentActivities(),
        pengguna: users,
        filter: this.generateManagementFilters(),
        pengaturan: this.generateManagementSettings()
      };

      this.setCache(cacheKey, result);
      this.logActivity('Memuat pengelolaan pengguna');

      return {
        success: true,
        data: result,
        message: 'Data pengelolaan pengguna berhasil dimuat',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error memuat pengelolaan pengguna', error);
      return {
        success: false,
        message: 'Gagal memuat data pengelolaan pengguna',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };
    }
  }

  // Private Methods
  private generateMockUsers(count: number): DataUser[] {
    const roles = ['admin', 'sales', 'customer', 'manager', 'supervisor'];
    const statuses = ['aktif', 'nonaktif', 'suspended', 'pending'];
    const cities = ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang'];
    const levels = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];

    return Array.from({ length: count }, (_, i) => ({
      id: `user_${i + 1}`,
      username: `user${i + 1}`,
      email: `user${i + 1}@example.com`,
      namaLengkap: `User ${i + 1}`,
      nomorTelepon: `08${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
      alamat: {
        jalan: `Jalan ${i + 1} No. ${Math.floor(Math.random() * 100) + 1}`,
        kota: cities[i % cities.length],
        provinsi: 'DKI Jakarta',
        kodePos: `${Math.floor(Math.random() * 90000) + 10000}`,
        negara: 'Indonesia',
        koordinat: {
          latitude: -6.2 + Math.random() * 0.4,
          longitude: 106.8 + Math.random() * 0.4
        }
      },
      tanggalLahir: new Date(1980 + Math.floor(Math.random() * 30), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      jenisKelamin: Math.random() > 0.5 ? 'L' : 'P',
      foto: `/images/users/user${i + 1}.jpg`,
      role: roles[i % roles.length] as any,
      status: statuses[i % statuses.length] as any,
      tanggalDaftar: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      terakhirLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      verifikasi: {
        email: Math.random() > 0.2,
        nomorTelepon: Math.random() > 0.3,
        identitas: Math.random() > 0.4,
        dokumenIdentitas: Math.random() > 0.4 ? `/documents/ktp_${i + 1}.pdf` : undefined,
        tanggalVerifikasi: Math.random() > 0.4 ? new Date().toISOString() : undefined
      },
      preferensi: {
        bahasa: 'id',
        timezone: 'Asia/Jakarta',
        mata_uang: 'IDR',
        notifikasi_email: Math.random() > 0.3,
        notifikasi_sms: Math.random() > 0.5,
        notifikasi_push: Math.random() > 0.2,
        tema: ['light', 'dark', 'auto'][Math.floor(Math.random() * 3)] as any,
        layout: ['compact', 'comfortable', 'spacious'][Math.floor(Math.random() * 3)] as any
      },
      statistik: {
        totalLogin: Math.floor(Math.random() * 100) + 1,
        totalTransaksi: Math.floor(Math.random() * 20),
        totalPembelian: Math.floor(Math.random() * 10),
        ratingRata: Math.round((Math.random() * 2 + 3) * 10) / 10,
        poinLoyalitas: Math.floor(Math.random() * 10000),
        levelMember: levels[Math.floor(Math.random() * levels.length)],
        waktuOnlineTotal: Math.floor(Math.random() * 1000),
        fiturTerpakai: ['dashboard', 'transaksi', 'profil'].slice(0, Math.floor(Math.random() * 3) + 1)
      },
      riwayatAktivitas: this.generateUserActivities(5),
      dokumen: this.generateUserDocuments(),
      kontak: {
        nama: `Kontak Darurat ${i + 1}`,
        hubungan: ['Keluarga', 'Teman', 'Rekan'][Math.floor(Math.random() * 3)],
        nomorTelepon: `08${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
        email: `kontak${i + 1}@example.com`
      },
      pengaturanPrivasi: {
        profilPublik: Math.random() > 0.5,
        tampilkanEmail: Math.random() > 0.7,
        tampilkanTelepon: Math.random() > 0.8,
        tampilkanAlamat: Math.random() > 0.9,
        izinkanPesan: Math.random() > 0.3,
        bagikanData: Math.random() > 0.6
      },
      notifikasi: {
        email: {
          transaksi: Math.random() > 0.2,
          promosi: Math.random() > 0.5,
          newsletter: Math.random() > 0.6,
          sistem: Math.random() > 0.1
        },
        sms: {
          transaksi: Math.random() > 0.3,
          promosi: Math.random() > 0.7,
          keamanan: Math.random() > 0.1
        },
        push: {
          transaksi: Math.random() > 0.2,
          chat: Math.random() > 0.3,
          promosi: Math.random() > 0.6,
          sistem: Math.random() > 0.2
        }
      },
      keamanan: {
        twoFactorAuth: Math.random() > 0.7,
        loginNotifikasi: Math.random() > 0.3,
        sessionTimeout: [30, 60, 120, 240][Math.floor(Math.random() * 4)],
        passwordLastChanged: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        recoveryEmail: Math.random() > 0.5 ? `recovery${i + 1}@example.com` : undefined,
        recoveryPhone: Math.random() > 0.6 ? `08${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}` : undefined,
        trustedDevices: this.generateTrustedDevices()
      }
    }));
  }

  private generateUserActivities(count: number): RiwayatAktivitas[] {
    const activities = ['Login', 'Logout', 'Update Profile', 'Change Password', 'View Product', 'Make Transaction'];
    
    return Array.from({ length: count }, (_, i) => ({
      id: `activity_${i + 1}`,
      tanggal: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      waktu: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toTimeString().split(' ')[0],
      aktivitas: activities[Math.floor(Math.random() * activities.length)],
      deskripsi: `Deskripsi aktivitas ${activities[Math.floor(Math.random() * activities.length)]}`,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      lokasi: 'Jakarta, Indonesia',
      status: ['berhasil', 'gagal', 'pending'][Math.floor(Math.random() * 3)] as any
    }));
  }

  private generateUserDocuments(): DokumenUser[] {
    const types = ['ktp', 'sim', 'passport', 'npwp'];
    
    return types.slice(0, Math.floor(Math.random() * 3) + 1).map((type, i) => ({
      id: `doc_${i + 1}`,
      jenis: type as any,
      nama: `${type.toUpperCase()} Document`,
      nomor: `${Math.floor(Math.random() * 9000000000000000) + 1000000000000000}`,
      file: `/documents/${type}_${i + 1}.pdf`,
      tanggalUpload: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: ['pending', 'verified', 'rejected'][Math.floor(Math.random() * 3)] as any,
      keterangan: Math.random() > 0.7 ? 'Dokumen memerlukan verifikasi tambahan' : undefined
    }));
  }

  private generateTrustedDevices(): TrustedDevice[] {
    const devices = ['iPhone 12', 'Samsung Galaxy S21', 'MacBook Pro', 'Windows PC'];
    
    return Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => ({
      id: `device_${i + 1}`,
      nama: devices[Math.floor(Math.random() * devices.length)],
      jenis: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
      terakhirDigunakan: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      lokasi: 'Jakarta, Indonesia',
      status: Math.random() > 0.2 ? 'aktif' : 'nonaktif'
    }));
  }

  private applyUserFilters(users: DataUser[], kriteria?: KriteriaUser): DataUser[] {
    if (!kriteria) return users;

    return users.filter(user => {
      if (kriteria.role && kriteria.role.length > 0 && !kriteria.role.includes(user.role)) {
        return false;
      }
      
      if (kriteria.status && kriteria.status.length > 0 && !kriteria.status.includes(user.status)) {
        return false;
      }
      
      if (kriteria.verifikasi !== undefined && user.verifikasi.email !== kriteria.verifikasi) {
        return false;
      }
      
      if (kriteria.kota && kriteria.kota.length > 0 && !kriteria.kota.includes(user.alamat.kota)) {
        return false;
      }
      
      if (kriteria.levelMember && kriteria.levelMember.length > 0 && !kriteria.levelMember.includes(user.statistik.levelMember)) {
        return false;
      }
      
      if (kriteria.tanggalDaftarMulai && new Date(user.tanggalDaftar) < new Date(kriteria.tanggalDaftarMulai)) {
        return false;
      }
      
      if (kriteria.tanggalDaftarSelesai && new Date(user.tanggalDaftar) > new Date(kriteria.tanggalDaftarSelesai)) {
        return false;
      }
      
      if (kriteria.aktifitasTerakhir) {
        const daysSinceLastLogin = Math.floor((Date.now() - new Date(user.terakhirLogin).getTime()) / (24 * 60 * 60 * 1000));
        if (daysSinceLastLogin > kriteria.aktifitasTerakhir) {
          return false;
        }
      }
      
      return true;
    });
  }

  private sortUsers(users: DataUser[], sortBy: string): DataUser[] {
    const [field, direction] = sortBy.split(':');
    const isAsc = direction === 'asc';

    return users.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (field) {
        case 'nama':
          aVal = a.namaLengkap;
          bVal = b.namaLengkap;
          break;
        case 'email':
          aVal = a.email;
          bVal = b.email;
          break;
        case 'tanggalDaftar':
          aVal = new Date(a.tanggalDaftar);
          bVal = new Date(b.tanggalDaftar);
          break;
        case 'terakhirLogin':
          aVal = new Date(a.terakhirLogin);
          bVal = new Date(b.terakhirLogin);
          break;
        case 'role':
          aVal = a.role;
          bVal = b.role;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          aVal = a.namaLengkap;
          bVal = b.namaLengkap;
      }

      if (aVal < bVal) return isAsc ? -1 : 1;
      if (aVal > bVal) return isAsc ? 1 : -1;
      return 0;
    });
  }

  private searchUsers(users: DataUser[], keyword: string): DataUser[] {
    const searchTerm = keyword.toLowerCase();
    
    return users.filter(user => 
      user.namaLengkap.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.username.toLowerCase().includes(searchTerm) ||
      user.nomorTelepon.includes(searchTerm) ||
      user.alamat.kota.toLowerCase().includes(searchTerm)
    );
  }

  private buildAppliedFilters(kriteria?: KriteriaUser): FilterTerapanUser {
    return {
      role: kriteria?.role || [],
      status: kriteria?.status || [],
      verifikasi: kriteria?.verifikasi ?? null,
      rentangTanggal: kriteria?.tanggalDaftarMulai && kriteria?.tanggalDaftarSelesai ? {
        mulai: kriteria.tanggalDaftarMulai,
        selesai: kriteria.tanggalDaftarSelesai
      } : null,
      lokasi: kriteria?.kota || [],
      levelMember: kriteria?.levelMember || []
    };
  }

  private generateSearchStatistics(users: DataUser[]): StatistikPencarianUser {
    const roleCount: { [key: string]: number } = {};
    const statusCount: { [key: string]: number } = {};
    const locationCount: { [key: string]: number } = {};
    let totalAge = 0;
    let verifiedCount = 0;

    users.forEach(user => {
      // Count roles
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
      
      // Count statuses
      statusCount[user.status] = (statusCount[user.status] || 0) + 1;
      
      // Count locations
      locationCount[user.alamat.kota] = (locationCount[user.alamat.kota] || 0) + 1;
      
      // Calculate age
      const age = new Date().getFullYear() - new Date(user.tanggalLahir).getFullYear();
      totalAge += age;
      
      // Count verified users
      if (user.verifikasi.email && user.verifikasi.nomorTelepon) {
        verifiedCount++;
      }
    });

    return {
      totalDitemukan: users.length,
      distribusiRole: roleCount,
      distribusiStatus: statusCount,
      distribusiLokasi: locationCount,
      rataUsia: users.length > 0 ? Math.round(totalAge / users.length) : 0,
      persentaseVerifikasi: users.length > 0 ? Math.round((verifiedCount / users.length) * 100) : 0
    };
  }

  private generateSearchSuggestions(kriteria?: KriteriaUser): string[] {
    const suggestions = [
      'Coba gunakan kata kunci yang lebih spesifik',
      'Filter berdasarkan role atau status',
      'Gunakan rentang tanggal untuk hasil yang lebih akurat',
      'Cari berdasarkan lokasi atau kota',
      'Filter berdasarkan level member'
    ];

    return suggestions.slice(0, 3);
  }

  private generateUserSummary(users: DataUser[]): RingkasanPengguna {
    const activeUsers = users.filter(u => u.status === 'aktif').length;
    const newUsers = users.filter(u => {
      const daysSinceRegistration = Math.floor((Date.now() - new Date(u.tanggalDaftar).getTime()) / (24 * 60 * 60 * 1000));
      return daysSinceRegistration <= 30;
    }).length;
    const suspendedUsers = users.filter(u => u.status === 'suspended').length;
    const verifiedUsers = users.filter(u => u.verifikasi.email && u.verifikasi.nomorTelepon).length;

    return {
      totalPengguna: users.length,
      penggunaAktif: activeUsers,
      penggunaBaru: newUsers,
      penggunaSuspended: suspendedUsers,
      tingkatVerifikasi: Math.round((verifiedUsers / users.length) * 100),
      tingkatRetensi: Math.round(Math.random() * 20 + 70) // Mock retention rate
    };
  }

  private generateUserStatistics(users: DataUser[]): StatistikPengguna {
    const roleCount: { [key: string]: number } = {};
    const statusCount: { [key: string]: number } = {};
    const ageCount: { [key: string]: number } = {};
    const locationCount: { [key: string]: number } = {};

    users.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
      statusCount[user.status] = (statusCount[user.status] || 0) + 1;
      locationCount[user.alamat.kota] = (locationCount[user.alamat.kota] || 0) + 1;
      
      const age = new Date().getFullYear() - new Date(user.tanggalLahir).getFullYear();
      const ageGroup = age < 25 ? '18-24' : age < 35 ? '25-34' : age < 45 ? '35-44' : age < 55 ? '45-54' : '55+';
      ageCount[ageGroup] = (ageCount[ageGroup] || 0) + 1;
    });

    return {
      distribusiRole: roleCount,
      distribusiStatus: statusCount,
      distribusiUmur: ageCount,
      distribusiLokasi: locationCount,
      trendPendaftaran: this.generateTrendData('registration'),
      aktivitasHarian: this.generateTrendData('activity')
    };
  }

  private generateTrendData(type: string): TrendData[] {
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
      const baseValue = type === 'registration' ? 10 : 50;
      const value = Math.floor(Math.random() * baseValue) + baseValue;
      
      return {
        tanggal: date.toISOString().split('T')[0],
        nilai: value,
        perubahan: Math.floor(Math.random() * 20) - 10
      };
    });
  }

  private generateRecentActivities(): AktivitasPengguna[] {
    const activities = [
      'Login ke sistem',
      'Update profil',
      'Ganti password',
      'Upload dokumen',
      'Verifikasi email',
      'Transaksi pembelian'
    ];

    return Array.from({ length: 10 }, (_, i) => ({
      id: `recent_${i + 1}`,
      userId: `user_${Math.floor(Math.random() * 100) + 1}`,
      namaUser: `User ${Math.floor(Math.random() * 100) + 1}`,
      aktivitas: activities[Math.floor(Math.random() * activities.length)],
      waktu: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      status: ['berhasil', 'gagal', 'pending'][Math.floor(Math.random() * 3)],
      detail: { ip: `192.168.1.${Math.floor(Math.random() * 255)}` }
    }));
  }

  private generateManagementFilters(): FilterPengelolaan {
    return {
      role: ['admin', 'sales', 'customer', 'manager', 'supervisor'],
      status: ['aktif', 'nonaktif', 'suspended', 'pending'],
      verifikasi: [true, false],
      rentangTanggal: {
        mulai: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        selesai: new Date().toISOString().split('T')[0]
      },
      lokasi: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang']
    };
  }

  private generateManagementSettings(): PengaturanPengelolaan {
    return {
      autoSuspend: true,
      verifikasiOtomatis: false,
      notifikasiAdmin: true,
      backupData: true,
      retentionPeriod: 365
    };
  }

  private validateUserData(data: Partial<DataUser>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Format email tidak valid');
    }

    if (data.nomorTelepon && !/^08\d{8,11}$/.test(data.nomorTelepon)) {
      errors.push('Format nomor telepon tidak valid');
    }

    if (data.namaLengkap && data.namaLengkap.length < 2) {
      errors.push('Nama lengkap minimal 2 karakter');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private validateUserDeletion(user: DataUser): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (user.role === 'admin') {
      errors.push('Admin tidak dapat dihapus');
    }

    if (user.statistik.totalTransaksi > 0) {
      errors.push('Pengguna dengan riwayat transaksi tidak dapat dihapus');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private clearUserCache(userId: string): void {
    const keysToDelete = [];
    const cacheKeys = Array.from(this.cache.keys()); for (const key of cacheKeys) {
      if (key.includes(userId) || key.includes('all_users') || key.includes('user_management')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Utility Methods
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
    console.log('Loading LayananUser configuration...');
  }

  private async simulateApiDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logActivity(activity: string, details?: any): void {
    console.log(`[LayananUser] ${activity}`, details);
  }

  // Service Info
  getServiceInfo(): any {
    return {
      name: 'LayananUser',
      version: '1.0.0',
      description: 'Service untuk mengelola operasi terkait pengguna',
      methods: [
        'ambilSemuaDataUser',
        'updateDataUser',
        'hapusDataUser',
        'cariDanTampilkanDataUser',
        'muatPengelolaanPengguna'
      ],
      features: [
        'User management',
        'Advanced search and filtering',
        'User profile management',
        'Activity tracking',
        'Document management',
        'Privacy settings',
        'Security settings',
        'Notification preferences',
        'User statistics',
        'Bulk operations'
      ]
    };
  }
}

// Export default
export default LayananUser;
