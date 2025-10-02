const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Interface untuk data user
export interface DataUser {
  id: string;
  username: string;
  email: string;
  namaLengkap: string;
  nomorTelepon: string;
  alamat: AlamatUser;
  tanggalLahir: string;
  jenisKelamin: 'L' | 'P';
  foto: string;
  role: 'admin' | 'dealer' | 'customer' | 'sales' | 'manager';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  tanggalDaftar: string;
  terakhirLogin: string;
  verifikasi: VerifikasiUser;
  preferensi: PreferensiUser;
  statistik: StatistikUser;
  riwayatAktivitas: AktivitasUser[];
  dokumen: DokumenUser[];
  kontak: KontakUser[];
  pengaturanPrivasi: PrivasiUser;
  notifikasi: NotifikasiUser;
  keamanan: KeamananUser;
}

// Interface untuk alamat user
export interface AlamatUser {
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

// Interface untuk verifikasi user
export interface VerifikasiUser {
  email: boolean;
  telepon: boolean;
  identitas: boolean;
  dokumenIdentitas?: {
    jenis: 'ktp' | 'sim' | 'passport';
    nomor: string;
    tanggalBerlaku: string;
    foto: string;
    status: 'pending' | 'approved' | 'rejected';
  };
}

// Interface untuk preferensi user
export interface PreferensiUser {
  bahasa: string;
  timezone: string;
  tema: 'light' | 'dark' | 'auto';
  notifikasiEmail: boolean;
  notifikasiPush: boolean;
  notifikasiSMS: boolean;
  kategoriMinat: string[];
  rentangHarga: {
    min: number;
    max: number;
  };
}

// Interface untuk statistik user
export interface StatistikUser {
  totalTransaksi: number;
  totalPembelian: number;
  totalTestDrive: number;
  totalUlasan: number;
  ratingRataRata: number;
  poinLoyalitas: number;
  levelMember: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalPengeluaran: number;
}

// Interface untuk aktivitas user
export interface AktivitasUser {
  id: string;
  tanggal: string;
  jenis: 'login' | 'logout' | 'view_car' | 'test_drive' | 'purchase' | 'review' | 'inquiry';
  deskripsi: string;
  metadata?: any;
  ipAddress: string;
  userAgent: string;
}

// Interface untuk dokumen user
export interface DokumenUser {
  id: string;
  nama: string;
  jenis: 'ktp' | 'sim' | 'passport' | 'npwp' | 'slip_gaji' | 'rekening_koran';
  url: string;
  ukuran: number;
  tanggalUpload: string;
  status: 'pending' | 'approved' | 'rejected';
  catatan?: string;
}

// Interface untuk kontak user
export interface KontakUser {
  id: string;
  jenis: 'telepon' | 'email' | 'whatsapp' | 'telegram';
  nilai: string;
  isPrimary: boolean;
  isVerified: boolean;
}

// Interface untuk privasi user
export interface PrivasiUser {
  profilPublik: boolean;
  tampilkanEmail: boolean;
  tampilkanTelepon: boolean;
  tampilkanAlamat: boolean;
  izinkanKontak: boolean;
  bagikanDataAnalitik: boolean;
}

// Interface untuk notifikasi user
export interface NotifikasiUser {
  email: {
    transaksi: boolean;
    promosi: boolean;
    newsletter: boolean;
    reminder: boolean;
  };
  push: {
    transaksi: boolean;
    chat: boolean;
    promosi: boolean;
    reminder: boolean;
  };
  sms: {
    transaksi: boolean;
    otp: boolean;
    reminder: boolean;
  };
}

// Interface untuk keamanan user
export interface KeamananUser {
  twoFactorAuth: boolean;
  loginAlerts: boolean;
  sessionTimeout: number;
  allowedDevices: string[];
  lastPasswordChange: string;
  failedLoginAttempts: number;
  accountLocked: boolean;
  lockoutUntil?: string;
}

// Interface untuk filter pencarian user
export interface FilterUser {
  role?: string[];
  status?: string[];
  tanggalDaftarMulai?: string;
  tanggalDaftarSelesai?: string;
  verifikasiEmail?: boolean;
  verifikasiTelepon?: boolean;
  verifikasiIdentitas?: boolean;
  levelMember?: string[];
  kota?: string[];
  provinsi?: string[];
  rentangUsia?: {
    min: number;
    max: number;
  };
  rentangTransaksi?: {
    min: number;
    max: number;
  };
}

// Interface untuk data halaman kelola user
export interface HalamanKelolaUser {
  users: DataUser[];
  total: number;
  statistik: StatistikKelolaUser;
  filter: FilterUser;
  sortOptions: SortOption[];
  bulkActions: BulkAction[];
}

// Interface untuk statistik kelola user
export interface StatistikKelolaUser {
  totalUser: number;
  userAktif: number;
  userTidakAktif: number;
  userSuspended: number;
  userPending: number;
  userBaru: {
    hariIni: number;
    mingguIni: number;
    bulanIni: number;
  };
  verifikasi: {
    emailTerverifikasi: number;
    teleponTerverifikasi: number;
    identitasTerverifikasi: number;
  };
  distribusiRole: {
    [key: string]: number;
  };
  distribusiLevel: {
    [key: string]: number;
  };
}

// Interface untuk opsi sort
export interface SortOption {
  value: string;
  label: string;
  field: string;
  direction: 'asc' | 'desc';
}

// Interface untuk bulk action
export interface BulkAction {
  value: string;
  label: string;
  icon: string;
  color: string;
  requiresConfirmation: boolean;
}

// Interface untuk form edit user
export interface FormEditUser {
  namaLengkap: string;
  email: string;
  nomorTelepon: string;
  alamat: AlamatUser;
  tanggalLahir: string;
  jenisKelamin: 'L' | 'P';
  role: string;
  status: string;
  preferensi: PreferensiUser;
  pengaturanPrivasi: PrivasiUser;
  notifikasi: NotifikasiUser;
}

// Interface untuk validasi form
export interface ValidasiForm {
  isValid: boolean;
  errors: {
    [key: string]: string[];
  };
}

export class KontrollerUser {
  private token: string | null = null;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  /**
   * Memuat halaman kelola user dengan data lengkap
   * @param page - Halaman (default: 1)
   * @param limit - Jumlah per halaman (default: 20)
   * @param filter - Filter pencarian
   * @param sortBy - Urutan ('terbaru' | 'terlama' | 'nama_az' | 'nama_za' | 'email_az' | 'email_za')
   * @param search - Kata kunci pencarian
   * @returns Promise<HalamanKelolaUser>
   */
  public async muatHalamanKelolaUser(
    page: number = 1,
    limit: number = 20,
    filter?: FilterUser,
    sortBy: string = 'terbaru',
    search?: string
  ): Promise<HalamanKelolaUser> {
    try {
      // Check cache first
      const cacheKey = `kelola_user_${page}_${limit}_${JSON.stringify(filter)}_${sortBy}_${search || ''}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy
      });

      if (search) {
        params.append('search', search);
      }

      // Add filter parameters
      if (filter) {
        if (filter.role) params.append('role', filter.role.join(','));
        if (filter.status) params.append('status', filter.status.join(','));
        if (filter.tanggalDaftarMulai) params.append('tanggalDaftarMulai', filter.tanggalDaftarMulai);
        if (filter.tanggalDaftarSelesai) params.append('tanggalDaftarSelesai', filter.tanggalDaftarSelesai);
        if (filter.verifikasiEmail !== undefined) params.append('verifikasiEmail', filter.verifikasiEmail.toString());
        if (filter.verifikasiTelepon !== undefined) params.append('verifikasiTelepon', filter.verifikasiTelepon.toString());
        if (filter.verifikasiIdentitas !== undefined) params.append('verifikasiIdentitas', filter.verifikasiIdentitas.toString());
        if (filter.levelMember) params.append('levelMember', filter.levelMember.join(','));
        if (filter.kota) params.append('kota', filter.kota.join(','));
        if (filter.provinsi) params.append('provinsi', filter.provinsi.join(','));
        if (filter.rentangUsia) {
          params.append('usiaMin', filter.rentangUsia.min.toString());
          params.append('usiaMax', filter.rentangUsia.max.toString());
        }
        if (filter.rentangTransaksi) {
          params.append('transaksiMin', filter.rentangTransaksi.min.toString());
          params.append('transaksiMax', filter.rentangTransaksi.max.toString());
        }
      }

      const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      const halamanData: HalamanKelolaUser = {
        users: result.data.users || [],
        total: result.data.total || 0,
        statistik: result.data.statistik || this.getDefaultStatistik(),
        filter: filter || {},
        sortOptions: this.getSortOptions(),
        bulkActions: this.getBulkActions()
      };

      // Cache the result
      this.setToCache(cacheKey, halamanData);

      return halamanData;

    } catch (error) {
      console.error('Error loading user management page:', error);
      return {
        users: [],
        total: 0,
        statistik: this.getDefaultStatistik(),
        filter: filter || {},
        sortOptions: this.getSortOptions(),
        bulkActions: this.getBulkActions()
      };
    }
  }

  /**
   * Edit data user
   * @param idUser - ID user yang akan diedit
   * @param dataUser - Data user yang baru
   * @returns Promise<{success: boolean, message: string, data?: DataUser}>
   */
  public async editDataUser(
    idUser: string,
    dataUser: FormEditUser
  ): Promise<{
    success: boolean;
    message: string;
    data?: DataUser;
  }> {
    try {
      // Validasi data terlebih dahulu
      const validasi = this.validasiFormEditUser(dataUser);
      if (!validasi.isValid) {
        return {
          success: false,
          message: 'Data tidak valid: ' + Object.values(validasi.errors).flat().join(', ')
        };
      }

      const response = await fetch(`${API_BASE_URL}/admin/users/${idUser}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify(dataUser)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengupdate data user');
      }

      // Clear cache
      this.clearCacheByPattern('kelola_user_');
      this.clearCacheByPattern(`user_detail_${idUser}`);

      return {
        success: true,
        message: 'Data user berhasil diupdate',
        data: result.data
      };

    } catch (error) {
      console.error('Error editing user data:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengupdate data user'
      };
    }
  }

  /**
   * Proses hapus data user
   * @param idUser - ID user yang akan dihapus
   * @param alasan - Alasan penghapusan (opsional)
   * @param hapusPermanent - Apakah hapus permanent atau soft delete
   * @returns Promise<{success: boolean, message: string}>
   */
  public async prosesHapusData(
    idUser: string,
    alasan?: string,
    hapusPermanent: boolean = false
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Konfirmasi penghapusan
      const konfirmasi = await this.konfirmasiHapusUser(idUser, hapusPermanent);
      if (!konfirmasi) {
        return {
          success: false,
          message: 'Penghapusan dibatalkan oleh user'
        };
      }

      const endpoint = hapusPermanent ? 
        `${API_BASE_URL}/admin/users/${idUser}/permanent` : 
        `${API_BASE_URL}/admin/users/${idUser}`;

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({ alasan })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menghapus data user');
      }

      // Clear cache
      this.clearCacheByPattern('kelola_user_');
      this.clearCacheByPattern(`user_detail_${idUser}`);

      return {
        success: true,
        message: hapusPermanent ? 
          'Data user berhasil dihapus permanent' : 
          'Data user berhasil dihapus (soft delete)'
      };

    } catch (error) {
      console.error('Error deleting user data:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus data user'
      };
    }
  }

  /**
   * Proses pencarian user
   * @param kataKunci - Kata kunci pencarian
   * @param filter - Filter tambahan
   * @param limit - Jumlah hasil maksimal (default: 10)
   * @returns Promise<{results: DataUser[], suggestions: string[], total: number}>
   */
  public async prosesPencarianUser(
    kataKunci: string,
    filter?: FilterUser,
    limit: number = 10
  ): Promise<{
    results: DataUser[];
    suggestions: string[];
    total: number;
  }> {
    try {
      if (!kataKunci || kataKunci.trim().length < 2) {
        return {
          results: [],
          suggestions: [],
          total: 0
        };
      }

      // Check cache first
      const cacheKey = `search_user_${kataKunci}_${JSON.stringify(filter)}_${limit}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const params = new URLSearchParams({
        q: kataKunci.trim(),
        limit: limit.toString()
      });

      // Add filter parameters
      if (filter) {
        if (filter.role) params.append('role', filter.role.join(','));
        if (filter.status) params.append('status', filter.status.join(','));
        if (filter.verifikasiEmail !== undefined) params.append('verifikasiEmail', filter.verifikasiEmail.toString());
        if (filter.verifikasiTelepon !== undefined) params.append('verifikasiTelepon', filter.verifikasiTelepon.toString());
        if (filter.levelMember) params.append('levelMember', filter.levelMember.join(','));
      }

      const response = await fetch(`${API_BASE_URL}/admin/users/search?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      const searchResult = {
        results: result.data.results || [],
        suggestions: result.data.suggestions || [],
        total: result.data.total || 0
      };

      // Cache the result
      this.setToCache(cacheKey, searchResult);

      return searchResult;

    } catch (error) {
      console.error('Error searching users:', error);
      return {
        results: [],
        suggestions: [],
        total: 0
      };
    }
  }

  /**
   * Cek lanjut kelola data - validasi sebelum melakukan operasi bulk
   * @param action - Aksi yang akan dilakukan ('activate', 'deactivate', 'suspend', 'delete', 'export')
   * @param userIds - Array ID user yang akan diproses
   * @returns Promise<{canProceed: boolean, warnings: string[], blockers: string[]}>
   */
  public async cekLanjutKelolaData(
    action: string,
    userIds: string[]
  ): Promise<{
    canProceed: boolean;
    warnings: string[];
    blockers: string[];
  }> {
    try {
      if (!userIds || userIds.length === 0) {
        return {
          canProceed: false,
          warnings: [],
          blockers: ['Tidak ada user yang dipilih']
        };
      }

      const response = await fetch(`${API_BASE_URL}/admin/users/bulk-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          action,
          userIds
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        canProceed: result.data.canProceed || false,
        warnings: result.data.warnings || [],
        blockers: result.data.blockers || []
      };

    } catch (error) {
      console.error('Error checking bulk operation:', error);
      return {
        canProceed: false,
        warnings: [],
        blockers: ['Terjadi kesalahan saat memvalidasi operasi']
      };
    }
  }

  /**
   * Eksekusi bulk action pada multiple users
   * @param action - Aksi yang akan dilakukan
   * @param userIds - Array ID user
   * @param options - Opsi tambahan
   * @returns Promise<{success: boolean, message: string, results: any[]}>
   */
  public async eksekusiBulkAction(
    action: string,
    userIds: string[],
    options?: any
  ): Promise<{
    success: boolean;
    message: string;
    results: any[];
  }> {
    try {
      // Cek validasi terlebih dahulu
      const validasi = await this.cekLanjutKelolaData(action, userIds);
      if (!validasi.canProceed) {
        return {
          success: false,
          message: 'Operasi tidak dapat dilanjutkan: ' + validasi.blockers.join(', '),
          results: []
        };
      }

      const response = await fetch(`${API_BASE_URL}/admin/users/bulk-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          action,
          userIds,
          options
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengeksekusi bulk action');
      }

      // Clear cache
      this.clearCacheByPattern('kelola_user_');

      return {
        success: true,
        message: result.message || 'Bulk action berhasil dieksekusi',
        results: result.data.results || []
      };

    } catch (error) {
      console.error('Error executing bulk action:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengeksekusi bulk action',
        results: []
      };
    }
  }

  /**
   * Export data user
   * @param filter - Filter untuk export
   * @param format - Format export ('csv', 'excel', 'pdf')
   * @param fields - Field yang akan diexport
   * @returns Promise<{success: boolean, message: string, downloadUrl?: string}>
   */
  public async exportDataUser(
    filter?: FilterUser,
    format: 'csv' | 'excel' | 'pdf' = 'excel',
    fields?: string[]
  ): Promise<{
    success: boolean;
    message: string;
    downloadUrl?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          filter,
          format,
          fields
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      return {
        success: true,
        message: 'Export berhasil dibuat',
        downloadUrl: result.data.downloadUrl
      };

    } catch (error) {
      console.error('Error exporting user data:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat export data'
      };
    }
  }

  /**
   * Validasi form edit user
   */
  private validasiFormEditUser(data: FormEditUser): ValidasiForm {
    const errors: { [key: string]: string[] } = {};

    // Validasi nama lengkap
    if (!data.namaLengkap || data.namaLengkap.trim().length < 2) {
      errors.namaLengkap = ['Nama lengkap minimal 2 karakter'];
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      errors.email = ['Format email tidak valid'];
    }

    // Validasi nomor telepon
    const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
    if (!data.nomorTelepon || !phoneRegex.test(data.nomorTelepon)) {
      errors.nomorTelepon = ['Format nomor telepon tidak valid'];
    }

    // Validasi alamat
    if (!data.alamat.jalan || data.alamat.jalan.trim().length < 5) {
      errors.alamat = errors.alamat || [];
      errors.alamat.push('Alamat jalan minimal 5 karakter');
    }
    if (!data.alamat.kota || data.alamat.kota.trim().length < 2) {
      errors.alamat = errors.alamat || [];
      errors.alamat.push('Nama kota minimal 2 karakter');
    }

    // Validasi tanggal lahir
    const birthDate = new Date(data.tanggalLahir);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 17 || age > 100) {
      errors.tanggalLahir = ['Usia harus antara 17-100 tahun'];
    }

    // Validasi role
    const validRoles = ['admin', 'dealer', 'customer', 'sales', 'manager'];
    if (!validRoles.includes(data.role)) {
      errors.role = ['Role tidak valid'];
    }

    // Validasi status
    const validStatuses = ['active', 'inactive', 'suspended', 'pending'];
    if (!validStatuses.includes(data.status)) {
      errors.status = ['Status tidak valid'];
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Konfirmasi penghapusan user
   */
  private async konfirmasiHapusUser(idUser: string, permanent: boolean): Promise<boolean> {
    const message = permanent ? 
      'Apakah Anda yakin ingin menghapus user ini secara PERMANENT? Data tidak dapat dikembalikan!' :
      'Apakah Anda yakin ingin menghapus user ini? Data masih dapat dikembalikan.';
    
    return window.confirm(message);
  }

  /**
   * Get default statistik
   */
  private getDefaultStatistik(): StatistikKelolaUser {
    return {
      totalUser: 0,
      userAktif: 0,
      userTidakAktif: 0,
      userSuspended: 0,
      userPending: 0,
      userBaru: {
        hariIni: 0,
        mingguIni: 0,
        bulanIni: 0
      },
      verifikasi: {
        emailTerverifikasi: 0,
        teleponTerverifikasi: 0,
        identitasTerverifikasi: 0
      },
      distribusiRole: {},
      distribusiLevel: {}
    };
  }

  /**
   * Get sort options
   */
  private getSortOptions(): SortOption[] {
    return [
      { value: 'terbaru', label: 'Terbaru', field: 'tanggalDaftar', direction: 'desc' },
      { value: 'terlama', label: 'Terlama', field: 'tanggalDaftar', direction: 'asc' },
      { value: 'nama_az', label: 'Nama A-Z', field: 'namaLengkap', direction: 'asc' },
      { value: 'nama_za', label: 'Nama Z-A', field: 'namaLengkap', direction: 'desc' },
      { value: 'email_az', label: 'Email A-Z', field: 'email', direction: 'asc' },
      { value: 'email_za', label: 'Email Z-A', field: 'email', direction: 'desc' },
      { value: 'login_terbaru', label: 'Login Terbaru', field: 'terakhirLogin', direction: 'desc' },
      { value: 'transaksi_terbanyak', label: 'Transaksi Terbanyak', field: 'statistik.totalTransaksi', direction: 'desc' }
    ];
  }

  /**
   * Get bulk actions
   */
  private getBulkActions(): BulkAction[] {
    return [
      { value: 'activate', label: 'Aktifkan', icon: 'check', color: 'green', requiresConfirmation: false },
      { value: 'deactivate', label: 'Nonaktifkan', icon: 'x', color: 'orange', requiresConfirmation: true },
      { value: 'suspend', label: 'Suspend', icon: 'ban', color: 'red', requiresConfirmation: true },
      { value: 'verify_email', label: 'Verifikasi Email', icon: 'mail', color: 'blue', requiresConfirmation: false },
      { value: 'verify_phone', label: 'Verifikasi Telepon', icon: 'phone', color: 'blue', requiresConfirmation: false },
      { value: 'reset_password', label: 'Reset Password', icon: 'key', color: 'yellow', requiresConfirmation: true },
      { value: 'export', label: 'Export Data', icon: 'download', color: 'gray', requiresConfirmation: false },
      { value: 'delete', label: 'Hapus', icon: 'trash', color: 'red', requiresConfirmation: true }
    ];
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
   * Clear all cache
   */
  public clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

export default KontrollerUser;
