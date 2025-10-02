// ==================== ENTITAS PENGGUNA ====================
// Entity class untuk mengelola data dan operasi pengguna

export interface DataPengguna {
  idPengguna: string;
  namaPengguna: string;
  email: string;
  kataSandi: string;
  namaLengkap: string;
  nomorTelepon: string;
  alamat: string;
  fotoProfil: string;
  peran: 'pembeli' | 'admin' | 'pemilik';
  modeSaatIni: 'pembeli' | 'penjual';
  statusAkun: 'aktif' | 'nonaktif' | 'suspend';
  tanggalDaftar: Date;
  tanggalLoginTerakhir: Date;
  jumlahTransaksi: number;
  ratingPengguna: number;
  levelPengguna: string;
  preferencesUser: string;
  isVerified: boolean;
}

export interface KredensialLogin {
  namaPengguna: string;
  kataSandi: string;
}

export interface DataProfilBaru {
  namaLengkap?: string;
  nomorTelepon?: string;
  alamat?: string;
  fotoProfil?: string;
  preferencesUser?: string;
}

export interface KriteriaPencarian {
  kataKunci?: string;
  peran?: string;
  statusAkun?: string;
  levelPengguna?: string;
  tanggalDaftarDari?: Date;
  tanggalDaftarSampai?: Date;
}

export interface ResponValidasi {
  valid: boolean;
  pesan: string;
  data?: any;
}

export interface ResponOperasi {
  sukses: boolean;
  pesan: string;
  data?: any;
  error?: string;
}

export class EntitasPengguna {
  // Private attributes
  private idPengguna: string;
  private namaPengguna: string;
  private email: string;
  private kataSandi: string;
  private namaLengkap: string;
  private nomorTelepon: string;
  private alamat: string;
  private fotoProfil: string;
  private peran: 'pembeli' | 'admin' | 'pemilik';
  private modeSaatIni: 'pembeli' | 'penjual';
  private statusAkun: 'aktif' | 'nonaktif' | 'suspend';
  private tanggalDaftar: Date;
  private tanggalLoginTerakhir: Date;
  private jumlahTransaksi: number;
  private ratingPengguna: number;
  private levelPengguna: string;
  private preferencesUser: string;
  private isVerified: boolean;

  constructor(data?: Partial<DataPengguna>) {
    this.idPengguna = data?.idPengguna || this.generateId();
    this.namaPengguna = data?.namaPengguna || '';
    this.email = data?.email || '';
    this.kataSandi = data?.kataSandi || '';
    this.namaLengkap = data?.namaLengkap || '';
    this.nomorTelepon = data?.nomorTelepon || '';
    this.alamat = data?.alamat || '';
    this.fotoProfil = data?.fotoProfil || '';
    this.peran = data?.peran || 'pembeli';
    this.modeSaatIni = data?.modeSaatIni || 'pembeli';
    this.statusAkun = data?.statusAkun || 'aktif';
    this.tanggalDaftar = data?.tanggalDaftar || new Date();
    this.tanggalLoginTerakhir = data?.tanggalLoginTerakhir || new Date();
    this.jumlahTransaksi = data?.jumlahTransaksi || 0;
    this.ratingPengguna = data?.ratingPengguna || 0;
    this.levelPengguna = data?.levelPengguna || 'Bronze';
    this.preferencesUser = data?.preferencesUser || '{}';
    this.isVerified = data?.isVerified || false;
  }

  // Getters
  public getIdPengguna(): string { return this.idPengguna; }
  public getNamaPengguna(): string { return this.namaPengguna; }
  public getEmail(): string { return this.email; }
  public getNamaLengkap(): string { return this.namaLengkap; }
  public getNomorTelepon(): string { return this.nomorTelepon; }
  public getAlamat(): string { return this.alamat; }
  public getFotoProfil(): string { return this.fotoProfil; }
  public getPeran(): string { return this.peran; }
  public getModeSaatIni(): string { return this.modeSaatIni; }
  public getStatusAkun(): string { return this.statusAkun; }
  public getTanggalDaftar(): Date { return this.tanggalDaftar; }
  public getTanggalLoginTerakhir(): Date { return this.tanggalLoginTerakhir; }
  public getJumlahTransaksi(): number { return this.jumlahTransaksi; }
  public getRatingPengguna(): number { return this.ratingPengguna; }
  public getLevelPengguna(): string { return this.levelPengguna; }
  public getPreferencesUser(): string { return this.preferencesUser; }
  public getIsVerified(): boolean { return this.isVerified; }

  // Setters
  public setNamaPengguna(nama: string): void { this.namaPengguna = nama; }
  public setEmail(email: string): void { this.email = email; }
  public setKataSandi(sandi: string): void { this.kataSandi = sandi; }
  public setNamaLengkap(nama: string): void { this.namaLengkap = nama; }
  public setNomorTelepon(nomor: string): void { this.nomorTelepon = nomor; }
  public setAlamat(alamat: string): void { this.alamat = alamat; }
  public setFotoProfil(foto: string): void { this.fotoProfil = foto; }
  public setPeran(peran: 'pembeli' | 'admin' | 'pemilik'): void { this.peran = peran; }
  public setModeSaatIni(mode: 'pembeli' | 'penjual'): void { this.modeSaatIni = mode; }
  public setStatusAkun(status: 'aktif' | 'nonaktif' | 'suspend'): void { this.statusAkun = status; }
  public setTanggalLoginTerakhir(tanggal: Date): void { this.tanggalLoginTerakhir = tanggal; }
  public setJumlahTransaksi(jumlah: number): void { this.jumlahTransaksi = jumlah; }
  public setRatingPengguna(rating: number): void { this.ratingPengguna = rating; }
  public setLevelPengguna(level: string): void { this.levelPengguna = level; }
  public setPreferencesUser(preferences: string): void { this.preferencesUser = preferences; }
  public setIsVerified(verified: boolean): void { this.isVerified = verified; }

  // Public Methods - Database Operations
  public async cekKredensialDatabase(namaPengguna: string, kataSandi: string): Promise<ResponValidasi> {
    try {
      await this.simulasiDelay(800);
      
      // Simulasi pengecekan kredensial di database
      const pengguna = await this.ambilPenggunaDariDatabase(namaPengguna);
      
      if (!pengguna) {
        return {
          valid: false,
          pesan: 'Nama pengguna tidak ditemukan'
        };
      }

      // Simulasi verifikasi password (dalam implementasi nyata gunakan bcrypt)
      const passwordValid = await this.verifikasiPassword(kataSandi, pengguna.kataSandi);
      
      if (!passwordValid) {
        return {
          valid: false,
          pesan: 'Kata sandi tidak valid'
        };
      }

      // Update tanggal login terakhir
      await this.updateTanggalLoginTerakhir(pengguna.idPengguna);

      return {
        valid: true,
        pesan: 'Kredensial valid',
        data: {
          idPengguna: pengguna.idPengguna,
          namaPengguna: pengguna.namaPengguna,
          email: pengguna.email,
          peran: pengguna.peran,
          statusAkun: pengguna.statusAkun
        }
      };
    } catch (error) {
      return {
        valid: false,
        pesan: `Error validasi kredensial: ${error}`
      };
    }
  }

  public async cekDuplikasiData(email: string, namaPengguna: string): Promise<ResponValidasi> {
    try {
      await this.simulasiDelay(500);
      
      // Simulasi pengecekan duplikasi email
      const emailExists = await this.cekEmailExists(email);
      if (emailExists) {
        return {
          valid: false,
          pesan: 'Email sudah terdaftar'
        };
      }

      // Simulasi pengecekan duplikasi username
      const usernameExists = await this.cekUsernameExists(namaPengguna);
      if (usernameExists) {
        return {
          valid: false,
          pesan: 'Nama pengguna sudah digunakan'
        };
      }

      return {
        valid: true,
        pesan: 'Data tidak duplikat'
      };
    } catch (error) {
      return {
        valid: false,
        pesan: `Error cek duplikasi: ${error}`
      };
    }
  }

  public async simpanPenggunaBaru(dataLengkap: DataPengguna): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(1000);
      
      // Validasi data
      const validasi = await this.validasiDataPengguna(dataLengkap);
      if (!validasi.valid) {
        return {
          sukses: false,
          pesan: validasi.pesan
        };
      }

      // Cek duplikasi
      const duplikasi = await this.cekDuplikasiData(dataLengkap.email, dataLengkap.namaPengguna);
      if (!duplikasi.valid) {
        return {
          sukses: false,
          pesan: duplikasi.pesan
        };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(dataLengkap.kataSandi);
      dataLengkap.kataSandi = hashedPassword;

      // Generate ID jika belum ada
      if (!dataLengkap.idPengguna) {
        dataLengkap.idPengguna = this.generateId();
      }

      // Simpan ke database
      const result = await this.simpanKeDatabase(dataLengkap.idPengguna, dataLengkap);
      
      return {
        sukses: true,
        pesan: 'Pengguna baru berhasil disimpan',
        data: {
          idPengguna: dataLengkap.idPengguna,
          namaPengguna: dataLengkap.namaPengguna,
          email: dataLengkap.email
        }
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Gagal menyimpan pengguna baru',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async ambilDataPengguna(idPengguna: string): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(600);
      
      const pengguna = await this.ambilPenggunaDariDatabase(idPengguna);
      
      if (!pengguna) {
        return {
          sukses: false,
          pesan: 'Pengguna tidak ditemukan'
        };
      }

      // Hapus password dari response
      const { kataSandi, ...dataTanpaPassword } = pengguna;

      return {
        sukses: true,
        pesan: 'Data pengguna berhasil diambil',
        data: dataTanpaPassword
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Gagal mengambil data pengguna',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async perbaruiProfilDiDatabase(dataBaruProfil: DataProfilBaru): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(800);
      
      // Validasi data baru
      const validasi = await this.validasiDataProfil(dataBaruProfil);
      if (!validasi.valid) {
        return {
          sukses: false,
          pesan: validasi.pesan
        };
      }

      // Update data di instance
      if (dataBaruProfil.namaLengkap) this.setNamaLengkap(dataBaruProfil.namaLengkap);
      if (dataBaruProfil.nomorTelepon) this.setNomorTelepon(dataBaruProfil.nomorTelepon);
      if (dataBaruProfil.alamat) this.setAlamat(dataBaruProfil.alamat);
      if (dataBaruProfil.fotoProfil) this.setFotoProfil(dataBaruProfil.fotoProfil);
      if (dataBaruProfil.preferencesUser) this.setPreferencesUser(dataBaruProfil.preferencesUser);

      // Simpan perubahan ke database
      const result = await this.updateProfilDatabase(this.idPengguna, dataBaruProfil);

      return {
        sukses: true,
        pesan: 'Profil berhasil diperbarui',
        data: {
          idPengguna: this.idPengguna,
          ...dataBaruProfil
        }
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Gagal memperbarui profil',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async perbaruiPassword(idPengguna: string, hashPasswordBaru: string): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(700);
      
      // Validasi password baru
      if (!hashPasswordBaru || hashPasswordBaru.length < 6) {
        return {
          sukses: false,
          pesan: 'Password baru tidak valid'
        };
      }

      // Hash password baru
      const hashedPassword = await this.hashPassword(hashPasswordBaru);

      // Update password di database
      const result = await this.updatePasswordDatabase(idPengguna, hashedPassword);

      return {
        sukses: true,
        pesan: 'Password berhasil diperbarui'
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Gagal memperbarui password',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async ambilDaftarUser(): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(1000);
      
      const daftarUser = await this.ambilSemuaPenggunaDariDatabase();
      
      // Hapus password dari semua user
      const daftarUserTanpaPassword = daftarUser.map(user => {
        const { kataSandi, ...userTanpaPassword } = user;
        return userTanpaPassword;
      });

      return {
        sukses: true,
        pesan: 'Daftar user berhasil diambil',
        data: {
          users: daftarUserTanpaPassword,
          total: daftarUserTanpaPassword.length
        }
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Gagal mengambil daftar user',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async simpanKeDatabase(idUser: string, dataUser: DataPengguna): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(800);
      
      // Simulasi penyimpanan ke database
      const result = await this.simulasiPenyimpananDatabase(idUser, dataUser);
      
      return {
        sukses: true,
        pesan: 'Data user berhasil disimpan ke database',
        data: { idUser, timestamp: new Date() }
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Gagal menyimpan data user ke database',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async hapusDariDatabase(idUser: string): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(600);
      
      // Cek apakah user exists
      const user = await this.ambilPenggunaDariDatabase(idUser);
      if (!user) {
        return {
          sukses: false,
          pesan: 'User tidak ditemukan'
        };
      }

      // Simulasi penghapusan dari database
      const result = await this.simulasiPenghapusanDatabase(idUser);
      
      return {
        sukses: true,
        pesan: 'User berhasil dihapus dari database',
        data: { idUser, timestamp: new Date() }
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Gagal menghapus user dari database',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async cariUserBerdasarkanKriteria(kataKunci: string): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(900);
      
      const kriteria: KriteriaPencarian = {
        kataKunci: kataKunci
      };

      const hasilPencarian = await this.pencarianUserDatabase(kriteria);
      
      // Hapus password dari hasil pencarian
      const hasilTanpaPassword = hasilPencarian.map(user => {
        const { kataSandi, ...userTanpaPassword } = user;
        return userTanpaPassword;
      });

      return {
        sukses: true,
        pesan: 'Pencarian user berhasil',
        data: {
          hasil: hasilTanpaPassword,
          total: hasilTanpaPassword.length,
          kataKunci: kataKunci
        }
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Gagal mencari user',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async ambilDetailUser(idUser: string): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(700);
      
      const user = await this.ambilPenggunaDariDatabase(idUser);
      
      if (!user) {
        return {
          sukses: false,
          pesan: 'User tidak ditemukan'
        };
      }

      // Ambil data tambahan untuk detail
      const statistikUser = await this.ambilStatistikUser(idUser);
      const riwayatAktivitas = await this.ambilRiwayatAktivitas(idUser);

      // Hapus password dari response
      const { kataSandi, ...userTanpaPassword } = user;

      return {
        sukses: true,
        pesan: 'Detail user berhasil diambil',
        data: {
          ...userTanpaPassword,
          statistik: statistikUser,
          riwayatAktivitas: riwayatAktivitas
        }
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Gagal mengambil detail user',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Private Helper Methods
  private async simulasiDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private async hashPassword(password: string): Promise<string> {
    // Simulasi hashing password (gunakan bcrypt di implementasi nyata)
    await this.simulasiDelay(200);
    return 'hashed_' + password + '_' + Date.now();
  }

  private async verifikasiPassword(password: string, hashedPassword: string): Promise<boolean> {
    // Simulasi verifikasi password
    await this.simulasiDelay(200);
    return hashedPassword.includes(password);
  }

  private async validasiDataPengguna(data: DataPengguna): Promise<ResponValidasi> {
    if (!data.namaPengguna || data.namaPengguna.length < 3) {
      return { valid: false, pesan: 'Nama pengguna minimal 3 karakter' };
    }

    if (!data.email || !this.validasiEmail(data.email)) {
      return { valid: false, pesan: 'Format email tidak valid' };
    }

    if (!data.kataSandi || data.kataSandi.length < 6) {
      return { valid: false, pesan: 'Password minimal 6 karakter' };
    }

    return { valid: true, pesan: 'Data valid' };
  }

  private async validasiDataProfil(data: DataProfilBaru): Promise<ResponValidasi> {
    if (data.nomorTelepon && !this.validasiNomorTelepon(data.nomorTelepon)) {
      return { valid: false, pesan: 'Format nomor telepon tidak valid' };
    }

    return { valid: true, pesan: 'Data profil valid' };
  }

  private validasiEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validasiNomorTelepon(nomor: string): boolean {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
    return phoneRegex.test(nomor);
  }

  // Database Simulation Methods
  private async ambilPenggunaDariDatabase(identifier: string): Promise<DataPengguna | null> {
    await this.simulasiDelay(300);
    
    // Simulasi data pengguna dari database
    const sampleUsers: DataPengguna[] = [
      {
        idPengguna: 'user_001',
        namaPengguna: 'john_doe',
        email: 'john@example.com',
        kataSandi: 'hashed_password123_1234567890',
        namaLengkap: 'John Doe',
        nomorTelepon: '081234567890',
        alamat: 'Jakarta Selatan',
        fotoProfil: '/images/profile/john.jpg',
        peran: 'pembeli',
        modeSaatIni: 'pembeli',
        statusAkun: 'aktif',
        tanggalDaftar: new Date('2023-01-15'),
        tanggalLoginTerakhir: new Date(),
        jumlahTransaksi: 5,
        ratingPengguna: 4.5,
        levelPengguna: 'Gold',
        preferencesUser: '{"theme": "light", "notifications": true}',
        isVerified: true
      }
    ];

    return sampleUsers.find(user => 
      user.idPengguna === identifier || 
      user.namaPengguna === identifier ||
      user.email === identifier
    ) || null;
  }

  private async cekEmailExists(email: string): Promise<boolean> {
    await this.simulasiDelay(200);
    const existingEmails = ['john@example.com', 'admin@mobilindo.com'];
    return existingEmails.includes(email);
  }

  private async cekUsernameExists(username: string): Promise<boolean> {
    await this.simulasiDelay(200);
    const existingUsernames = ['john_doe', 'admin', 'mobilindo_admin'];
    return existingUsernames.includes(username);
  }

  private async updateTanggalLoginTerakhir(idPengguna: string): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi update tanggal login terakhir
  }

  private async updateProfilDatabase(idPengguna: string, dataBaru: DataProfilBaru): Promise<boolean> {
    await this.simulasiDelay(400);
    // Simulasi update profil di database
    return true;
  }

  private async updatePasswordDatabase(idPengguna: string, hashedPassword: string): Promise<boolean> {
    await this.simulasiDelay(300);
    // Simulasi update password di database
    return true;
  }

  private async ambilSemuaPenggunaDariDatabase(): Promise<DataPengguna[]> {
    await this.simulasiDelay(500);
    
    // Simulasi data multiple users
    return [
      {
        idPengguna: 'user_001',
        namaPengguna: 'john_doe',
        email: 'john@example.com',
        kataSandi: 'hashed_password123',
        namaLengkap: 'John Doe',
        nomorTelepon: '081234567890',
        alamat: 'Jakarta Selatan',
        fotoProfil: '/images/profile/john.jpg',
        peran: 'pembeli',
        modeSaatIni: 'pembeli',
        statusAkun: 'aktif',
        tanggalDaftar: new Date('2023-01-15'),
        tanggalLoginTerakhir: new Date(),
        jumlahTransaksi: 5,
        ratingPengguna: 4.5,
        levelPengguna: 'Gold',
        preferencesUser: '{"theme": "light"}',
        isVerified: true
      },
      {
        idPengguna: 'user_002',
        namaPengguna: 'jane_smith',
        email: 'jane@example.com',
        kataSandi: 'hashed_password456',
        namaLengkap: 'Jane Smith',
        nomorTelepon: '081987654321',
        alamat: 'Bandung',
        fotoProfil: '/images/profile/jane.jpg',
        peran: 'pemilik',
        modeSaatIni: 'penjual',
        statusAkun: 'aktif',
        tanggalDaftar: new Date('2023-02-20'),
        tanggalLoginTerakhir: new Date(),
        jumlahTransaksi: 12,
        ratingPengguna: 4.8,
        levelPengguna: 'Platinum',
        preferencesUser: '{"theme": "dark"}',
        isVerified: true
      }
    ];
  }

  private async simulasiPenyimpananDatabase(idUser: string, dataUser: DataPengguna): Promise<boolean> {
    await this.simulasiDelay(400);
    // Simulasi penyimpanan ke database
    return true;
  }

  private async simulasiPenghapusanDatabase(idUser: string): Promise<boolean> {
    await this.simulasiDelay(300);
    // Simulasi penghapusan dari database
    return true;
  }

  private async pencarianUserDatabase(kriteria: KriteriaPencarian): Promise<DataPengguna[]> {
    await this.simulasiDelay(400);
    
    const semuaUser = await this.ambilSemuaPenggunaDariDatabase();
    
    return semuaUser.filter(user => {
      if (kriteria.kataKunci) {
        const kataKunci = kriteria.kataKunci.toLowerCase();
        return (
          user.namaPengguna.toLowerCase().includes(kataKunci) ||
          user.namaLengkap.toLowerCase().includes(kataKunci) ||
          user.email.toLowerCase().includes(kataKunci)
        );
      }
      return true;
    });
  }

  private async ambilStatistikUser(idUser: string): Promise<any> {
    await this.simulasiDelay(300);
    
    return {
      totalTransaksi: 5,
      totalPembelian: 3,
      totalPenjualan: 2,
      ratingRataRata: 4.5,
      jumlahReview: 8,
      bergabungSejak: '2023-01-15'
    };
  }

  private async ambilRiwayatAktivitas(idUser: string): Promise<any[]> {
    await this.simulasiDelay(300);
    
    return [
      {
        tanggal: new Date(),
        aktivitas: 'Login ke sistem',
        detail: 'Login berhasil dari IP 192.168.1.1'
      },
      {
        tanggal: new Date(Date.now() - 86400000),
        aktivitas: 'Update profil',
        detail: 'Mengubah foto profil'
      }
    ];
  }

  // Public method untuk mendapatkan data lengkap
  public toJSON(): DataPengguna {
    return {
      idPengguna: this.idPengguna,
      namaPengguna: this.namaPengguna,
      email: this.email,
      kataSandi: this.kataSandi,
      namaLengkap: this.namaLengkap,
      nomorTelepon: this.nomorTelepon,
      alamat: this.alamat,
      fotoProfil: this.fotoProfil,
      peran: this.peran,
      modeSaatIni: this.modeSaatIni,
      statusAkun: this.statusAkun,
      tanggalDaftar: this.tanggalDaftar,
      tanggalLoginTerakhir: this.tanggalLoginTerakhir,
      jumlahTransaksi: this.jumlahTransaksi,
      ratingPengguna: this.ratingPengguna,
      levelPengguna: this.levelPengguna,
      preferencesUser: this.preferencesUser,
      isVerified: this.isVerified
    };
  }
}

export default EntitasPengguna;