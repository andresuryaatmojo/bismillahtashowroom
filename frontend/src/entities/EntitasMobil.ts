// ==================== ENTITAS MOBIL ====================
// Entity class untuk mengelola data dan operasi mobil

export interface DataMobil {
  idMobil: string;
  merkMobil: string;
  modelMobil: string;
  tahunMobil: number;
  kategori: 'MPV' | 'SUV' | 'Sedan' | 'Listrik' | 'Hatchback' | 'Coupe' | 'Convertible' | 'Pickup' | 'Minivan';
  hargaMobil: number;
  kondisiMobil: string;
  warnaMobil: string;
  kilometerMobil: number;
  transmisiMobil: string;
  bahanBakarMobil: string;
  lokasi: string;
  statusMobil: 'tersedia' | 'terjual' | 'pending';
  deskripsi: string;
  spesifikasi: string;
  galeriFoto: string[];
  penjual: 'showroom' | 'eksternal';
  tanggalPosting: Date;
  viewCount: number;
  rating: number;
  hargaPasar: number;
}

export interface KriteriaPencarianMobil {
  kataKunci?: string;
  merkMobil?: string;
  modelMobil?: string;
  kategori?: string;
  tahunMin?: number;
  tahunMax?: number;
  hargaMin?: number;
  hargaMax?: number;
  transmisi?: string;
  bahanBakar?: string;
  lokasi?: string;
  statusMobil?: string;
  penjual?: string;
}

export interface FilterMobil {
  kategori?: string;
  merkMobil?: string;
  rentangHarga?: {
    min: number;
    max: number;
  };
  rentangTahun?: {
    min: number;
    max: number;
  };
  transmisi?: string;
  bahanBakar?: string;
  kondisi?: string;
  lokasi?: string;
}

export interface DataPerubahan {
  idMobil: string;
  perubahan: Partial<DataMobil>;
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

export interface HasilPencarian {
  mobil: DataMobil[];
  total: number;
  halaman: number;
  totalHalaman: number;
  kriteria: KriteriaPencarianMobil;
}

export interface PerbandinganMobil {
  mobil1: DataMobil;
  mobil2: DataMobil;
  perbandingan: {
    harga: string;
    tahun: string;
    kilometer: string;
    spesifikasi: any;
  };
}

export class EntitasMobil {
  // Private attributes
  private idMobil: string;
  private merkMobil: string;
  private modelMobil: string;
  private tahunMobil: number;
  private kategori: 'MPV' | 'SUV' | 'Sedan' | 'Listrik' | 'Hatchback' | 'Coupe' | 'Convertible' | 'Pickup' | 'Minivan';
  private hargaMobil: number;
  private kondisiMobil: string;
  private warnaMobil: string;
  private kilometerMobil: number;
  private transmisiMobil: string;
  private bahanBakarMobil: string;
  private lokasi: string;
  private statusMobil: 'tersedia' | 'terjual' | 'pending';
  private deskripsi: string;
  private spesifikasi: string;
  private galeriFoto: string[];
  private penjual: 'showroom' | 'eksternal';
  private tanggalPosting: Date;
  private viewCount: number;
  private rating: number;
  private hargaPasar: number;

  constructor(data?: Partial<DataMobil>) {
    this.idMobil = data?.idMobil || this.generateId();
    this.merkMobil = data?.merkMobil || '';
    this.modelMobil = data?.modelMobil || '';
    this.tahunMobil = data?.tahunMobil || new Date().getFullYear();
    this.kategori = data?.kategori || 'Sedan';
    this.hargaMobil = data?.hargaMobil || 0;
    this.kondisiMobil = data?.kondisiMobil || 'Bekas';
    this.warnaMobil = data?.warnaMobil || '';
    this.kilometerMobil = data?.kilometerMobil || 0;
    this.transmisiMobil = data?.transmisiMobil || 'Manual';
    this.bahanBakarMobil = data?.bahanBakarMobil || 'Bensin';
    this.lokasi = data?.lokasi || '';
    this.statusMobil = data?.statusMobil || 'tersedia';
    this.deskripsi = data?.deskripsi || '';
    this.spesifikasi = data?.spesifikasi || '{}';
    this.galeriFoto = data?.galeriFoto || [];
    this.penjual = data?.penjual || 'showroom';
    this.tanggalPosting = data?.tanggalPosting || new Date();
    this.viewCount = data?.viewCount || 0;
    this.rating = data?.rating || 0;
    this.hargaPasar = data?.hargaPasar || 0;
  }

  // Getters
  public getIdMobil(): string { return this.idMobil; }
  public getMerkMobil(): string { return this.merkMobil; }
  public getModelMobil(): string { return this.modelMobil; }
  public getTahunMobil(): number { return this.tahunMobil; }
  public getKategori(): string { return this.kategori; }
  public getHargaMobil(): number { return this.hargaMobil; }
  public getKondisiMobil(): string { return this.kondisiMobil; }
  public getWarnaMobil(): string { return this.warnaMobil; }
  public getKilometerMobil(): number { return this.kilometerMobil; }
  public getTransmisiMobil(): string { return this.transmisiMobil; }
  public getBahanBakarMobil(): string { return this.bahanBakarMobil; }
  public getLokasi(): string { return this.lokasi; }
  public getStatusMobil(): string { return this.statusMobil; }
  public getDeskripsi(): string { return this.deskripsi; }
  public getSpesifikasi(): string { return this.spesifikasi; }
  public getGaleriFoto(): string[] { return this.galeriFoto; }
  public getPenjual(): string { return this.penjual; }
  public getTanggalPosting(): Date { return this.tanggalPosting; }
  public getViewCount(): number { return this.viewCount; }
  public getRating(): number { return this.rating; }
  public getHargaPasar(): number { return this.hargaPasar; }

  // Setters
  public setMerkMobil(merk: string): void { this.merkMobil = merk; }
  public setModelMobil(model: string): void { this.modelMobil = model; }
  public setTahunMobil(tahun: number): void { this.tahunMobil = tahun; }
  public setKategori(kategori: 'MPV' | 'SUV' | 'Sedan' | 'Listrik' | 'Hatchback' | 'Coupe' | 'Convertible' | 'Pickup' | 'Minivan'): void { this.kategori = kategori; }
  public setHargaMobil(harga: number): void { this.hargaMobil = harga; }
  public setKondisiMobil(kondisi: string): void { this.kondisiMobil = kondisi; }
  public setWarnaMobil(warna: string): void { this.warnaMobil = warna; }
  public setKilometerMobil(kilometer: number): void { this.kilometerMobil = kilometer; }
  public setTransmisiMobil(transmisi: string): void { this.transmisiMobil = transmisi; }
  public setBahanBakarMobil(bahanBakar: string): void { this.bahanBakarMobil = bahanBakar; }
  public setLokasi(lokasi: string): void { this.lokasi = lokasi; }
  public setStatusMobil(status: 'tersedia' | 'terjual' | 'pending'): void { this.statusMobil = status; }
  public setDeskripsi(deskripsi: string): void { this.deskripsi = deskripsi; }
  public setSpesifikasi(spesifikasi: string): void { this.spesifikasi = spesifikasi; }
  public setGaleriFoto(foto: string[]): void { this.galeriFoto = foto; }
  public setPenjual(penjual: 'showroom' | 'eksternal'): void { this.penjual = penjual; }
  public setViewCount(count: number): void { this.viewCount = count; }
  public setRating(rating: number): void { this.rating = rating; }
  public setHargaPasar(harga: number): void { this.hargaPasar = harga; }

  // Public Methods - Database Operations
  public async validasiKetersediaanMobil(idMobil: string): Promise<ResponValidasi> {
    try {
      await this.simulasiDelay(500);
      
      const mobil = await this.ambilMobilDariDatabase(idMobil);
      
      if (!mobil) {
        return {
          valid: false,
          pesan: 'Mobil tidak ditemukan'
        };
      }

      if (mobil.statusMobil !== 'tersedia') {
        return {
          valid: false,
          pesan: `Mobil tidak tersedia. Status: ${mobil.statusMobil}`
        };
      }

      return {
        valid: true,
        pesan: 'Mobil tersedia',
        data: mobil
      };
    } catch (error) {
      return {
        valid: false,
        pesan: `Error validasi ketersediaan: ${error}`
      };
    }
  }

  public async updateStatusMobil(idMobil: string, status: 'tersedia' | 'terjual' | 'pending'): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(600);
      
      const mobil = await this.ambilMobilDariDatabase(idMobil);
      
      if (!mobil) {
        return {
          sukses: false,
          pesan: 'Mobil tidak ditemukan'
        };
      }

      // Update status di database
      const result = await this.updateStatusMobilDatabase(idMobil, status);
      
      if (result) {
        return {
          sukses: true,
          pesan: `Status mobil berhasil diubah menjadi ${status}`,
          data: {
            idMobil,
            statusLama: mobil.statusMobil,
            statusBaru: status,
            timestamp: new Date()
          }
        };
      }

      return {
        sukses: false,
        pesan: 'Gagal mengubah status mobil'
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Error mengubah status mobil',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async ambilSemuaMobil(): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(1000);
      
      const semuaMobil = await this.ambilSemuaMobilDariDatabase();
      
      return {
        sukses: true,
        pesan: 'Data semua mobil berhasil diambil',
        data: {
          mobil: semuaMobil,
          total: semuaMobil.length,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Gagal mengambil data mobil',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async cariMobilBerdasarkanKataKunci(kataKunci: string): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(800);
      
      const kriteria: KriteriaPencarianMobil = {
        kataKunci: kataKunci
      };

      const hasilPencarian = await this.pencarianMobilDatabase(kriteria);
      
      return {
        sukses: true,
        pesan: 'Pencarian mobil berhasil',
        data: {
          hasil: hasilPencarian,
          total: hasilPencarian.length,
          kataKunci: kataKunci,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Gagal mencari mobil',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async filterMobilBerdasarkanKategori(kategori: string): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(700);
      
      const filter: FilterMobil = {
        kategori: kategori
      };

      const hasilFilter = await this.filterMobilDatabase(filter);
      
      return {
        sukses: true,
        pesan: 'Filter mobil berdasarkan kategori berhasil',
        data: {
          hasil: hasilFilter,
          total: hasilFilter.length,
          kategori: kategori,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Gagal memfilter mobil berdasarkan kategori',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async ambilDetailMobil(idMobil: string): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(600);
      
      const mobil = await this.ambilMobilDariDatabase(idMobil);
      
      if (!mobil) {
        return {
          sukses: false,
          pesan: 'Mobil tidak ditemukan'
        };
      }

      // Increment view count
      await this.incrementViewCount(idMobil);

      // Ambil data tambahan untuk detail
      const mobilSerupa = await this.ambilMobilSerupa(mobil);
      const riwayatHarga = await this.ambilRiwayatHarga(idMobil);
      const reviewMobil = await this.ambilReviewMobil(idMobil);

      return {
        sukses: true,
        pesan: 'Detail mobil berhasil diambil',
        data: {
          ...mobil,
          mobilSerupa: mobilSerupa,
          riwayatHarga: riwayatHarga,
          review: reviewMobil,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Gagal mengambil detail mobil',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async ambilDataMobil(idMobil: string): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(500);
      
      const mobil = await this.ambilMobilDariDatabase(idMobil);
      
      if (!mobil) {
        return {
          sukses: false,
          pesan: 'Mobil tidak ditemukan'
        };
      }

      return {
        sukses: true,
        pesan: 'Data mobil berhasil diambil',
        data: mobil
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Gagal mengambil data mobil',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async ambilDaftarMobilSesuaiBudget(budgetMaksimal: number): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(800);
      
      const filter: FilterMobil = {
        rentangHarga: {
          min: 0,
          max: budgetMaksimal
        }
      };

      const mobilSesuaiBudget = await this.filterMobilDatabase(filter);
      
      // Urutkan berdasarkan harga
      mobilSesuaiBudget.sort((a, b) => a.hargaMobil - b.hargaMobil);

      return {
        sukses: true,
        pesan: 'Daftar mobil sesuai budget berhasil diambil',
        data: {
          mobil: mobilSesuaiBudget,
          total: mobilSesuaiBudget.length,
          budgetMaksimal: budgetMaksimal,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Gagal mengambil mobil sesuai budget',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async cekMobilDiDatabase(dataMobil: DataMobil): Promise<ResponValidasi> {
    try {
      await this.simulasiDelay(600);
      
      // Cek duplikasi berdasarkan merk, model, tahun, dan nomor rangka
      const mobilExisting = await this.cekDuplikasiMobil(dataMobil);
      
      if (mobilExisting) {
        return {
          valid: false,
          pesan: 'Mobil dengan spesifikasi serupa sudah ada',
          data: mobilExisting
        };
      }

      // Validasi data mobil
      const validasi = await this.validasiDataMobil(dataMobil);
      
      return validasi;
    } catch (error) {
      return {
        valid: false,
        pesan: `Error cek mobil di database: ${error}`
      };
    }
  }

  public async updateMobil(dataPerubahan: DataPerubahan): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(700);
      
      const { idMobil, perubahan } = dataPerubahan;
      
      // Cek apakah mobil exists
      const mobilExisting = await this.ambilMobilDariDatabase(idMobil);
      
      if (!mobilExisting) {
        return {
          sukses: false,
          pesan: 'Mobil tidak ditemukan'
        };
      }

      // Validasi perubahan
      const validasi = await this.validasiPerubahanMobil(perubahan);
      
      if (!validasi.valid) {
        return {
          sukses: false,
          pesan: validasi.pesan
        };
      }

      // Update mobil di database
      const result = await this.updateMobilDatabase(idMobil, perubahan);
      
      if (result) {
        return {
          sukses: true,
          pesan: 'Data mobil berhasil diperbarui',
          data: {
            idMobil,
            perubahan,
            timestamp: new Date()
          }
        };
      }

      return {
        sukses: false,
        pesan: 'Gagal memperbarui data mobil'
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Error memperbarui mobil',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async hapusMobilDariDatabase(idMobil: string): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(600);
      
      // Cek apakah mobil exists
      const mobil = await this.ambilMobilDariDatabase(idMobil);
      
      if (!mobil) {
        return {
          sukses: false,
          pesan: 'Mobil tidak ditemukan'
        };
      }

      // Cek apakah mobil bisa dihapus (tidak ada transaksi pending)
      const bisaDihapus = await this.cekBisaHapusMobil(idMobil);
      
      if (!bisaDihapus) {
        return {
          sukses: false,
          pesan: 'Mobil tidak bisa dihapus karena ada transaksi yang sedang berjalan'
        };
      }

      // Hapus mobil dari database
      const result = await this.hapusMobilDatabase(idMobil);
      
      if (result) {
        return {
          sukses: true,
          pesan: 'Mobil berhasil dihapus dari database',
          data: {
            idMobil,
            mobilDihapus: mobil,
            timestamp: new Date()
          }
        };
      }

      return {
        sukses: false,
        pesan: 'Gagal menghapus mobil dari database'
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Error menghapus mobil',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async simpanMobilBaru(dataMobil: DataMobil): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(900);
      
      // Validasi data mobil
      const validasi = await this.validasiDataMobil(dataMobil);
      
      if (!validasi.valid) {
        return {
          sukses: false,
          pesan: validasi.pesan
        };
      }

      // Cek duplikasi
      const duplikasi = await this.cekDuplikasiMobil(dataMobil);
      
      if (duplikasi) {
        return {
          sukses: false,
          pesan: 'Mobil dengan spesifikasi serupa sudah ada'
        };
      }

      // Generate ID jika belum ada
      if (!dataMobil.idMobil) {
        dataMobil.idMobil = this.generateId();
      }

      // Set tanggal posting
      dataMobil.tanggalPosting = new Date();

      // Simpan ke database
      const result = await this.simpanMobilDatabase(dataMobil);
      
      if (result) {
        return {
          sukses: true,
          pesan: 'Mobil baru berhasil disimpan',
          data: {
            idMobil: dataMobil.idMobil,
            merkModel: `${dataMobil.merkMobil} ${dataMobil.modelMobil}`,
            tahun: dataMobil.tahunMobil,
            harga: dataMobil.hargaMobil,
            timestamp: new Date()
          }
        };
      }

      return {
        sukses: false,
        pesan: 'Gagal menyimpan mobil baru'
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Error menyimpan mobil baru',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Additional Methods for Car Comparison
  public async bandingkanMobil(idMobil1: string, idMobil2: string): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(800);
      
      const mobil1 = await this.ambilMobilDariDatabase(idMobil1);
      const mobil2 = await this.ambilMobilDariDatabase(idMobil2);
      
      if (!mobil1 || !mobil2) {
        return {
          sukses: false,
          pesan: 'Salah satu atau kedua mobil tidak ditemukan'
        };
      }

      const perbandingan = await this.generatePerbandinganMobil(mobil1, mobil2);
      
      return {
        sukses: true,
        pesan: 'Perbandingan mobil berhasil dibuat',
        data: perbandingan
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Gagal membandingkan mobil',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Private Helper Methods
  private async simulasiDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return 'mobil_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private async validasiDataMobil(data: DataMobil): Promise<ResponValidasi> {
    if (!data.merkMobil || data.merkMobil.length < 2) {
      return { valid: false, pesan: 'Merk mobil harus diisi minimal 2 karakter' };
    }

    if (!data.modelMobil || data.modelMobil.length < 2) {
      return { valid: false, pesan: 'Model mobil harus diisi minimal 2 karakter' };
    }

    if (!data.tahunMobil || data.tahunMobil < 1900 || data.tahunMobil > new Date().getFullYear() + 1) {
      return { valid: false, pesan: 'Tahun mobil tidak valid' };
    }

    if (!data.hargaMobil || data.hargaMobil <= 0) {
      return { valid: false, pesan: 'Harga mobil harus lebih dari 0' };
    }

    if (data.kilometerMobil < 0) {
      return { valid: false, pesan: 'Kilometer tidak boleh negatif' };
    }

    return { valid: true, pesan: 'Data mobil valid' };
  }

  private async validasiPerubahanMobil(perubahan: Partial<DataMobil>): Promise<ResponValidasi> {
    if (perubahan.hargaMobil && perubahan.hargaMobil <= 0) {
      return { valid: false, pesan: 'Harga mobil harus lebih dari 0' };
    }

    if (perubahan.kilometerMobil && perubahan.kilometerMobil < 0) {
      return { valid: false, pesan: 'Kilometer tidak boleh negatif' };
    }

    if (perubahan.tahunMobil && (perubahan.tahunMobil < 1900 || perubahan.tahunMobil > new Date().getFullYear() + 1)) {
      return { valid: false, pesan: 'Tahun mobil tidak valid' };
    }

    return { valid: true, pesan: 'Perubahan data valid' };
  }

  // Database Simulation Methods
  private async ambilMobilDariDatabase(idMobil: string): Promise<DataMobil | null> {
    await this.simulasiDelay(300);
    
    // Simulasi data mobil dari database
    const sampleMobil: DataMobil[] = [
      {
        idMobil: 'mobil_001',
        merkMobil: 'Toyota',
        modelMobil: 'Avanza',
        tahunMobil: 2020,
        kategori: 'MPV',
        hargaMobil: 180000000,
        kondisiMobil: 'Bekas',
        warnaMobil: 'Putih',
        kilometerMobil: 45000,
        transmisiMobil: 'Manual',
        bahanBakarMobil: 'Bensin',
        lokasi: 'Jakarta',
        statusMobil: 'tersedia',
        deskripsi: 'Toyota Avanza 2020 kondisi sangat terawat',
        spesifikasi: '{"mesin": "1.3L", "tenaga": "96 HP", "torsi": "121 Nm"}',
        galeriFoto: ['/images/cars/avanza1.jpg', '/images/cars/avanza2.jpg'],
        penjual: 'showroom',
        tanggalPosting: new Date('2024-01-15'),
        viewCount: 150,
        rating: 4.5,
        hargaPasar: 185000000
      },
      {
        idMobil: 'mobil_002',
        merkMobil: 'Honda',
        modelMobil: 'Civic',
        tahunMobil: 2019,
        kategori: 'Sedan',
        hargaMobil: 320000000,
        kondisiMobil: 'Bekas',
        warnaMobil: 'Hitam',
        kilometerMobil: 35000,
        transmisiMobil: 'CVT',
        bahanBakarMobil: 'Bensin',
        lokasi: 'Bandung',
        statusMobil: 'tersedia',
        deskripsi: 'Honda Civic Turbo 2019 full original',
        spesifikasi: '{"mesin": "1.5L Turbo", "tenaga": "173 HP", "torsi": "220 Nm"}',
        galeriFoto: ['/images/cars/civic1.jpg', '/images/cars/civic2.jpg'],
        penjual: 'eksternal',
        tanggalPosting: new Date('2024-01-20'),
        viewCount: 89,
        rating: 4.8,
        hargaPasar: 325000000
      }
    ];

    return sampleMobil.find(mobil => mobil.idMobil === idMobil) || null;
  }

  private async ambilSemuaMobilDariDatabase(): Promise<DataMobil[]> {
    await this.simulasiDelay(500);
    
    // Simulasi data multiple mobil
    return [
      {
        idMobil: 'mobil_001',
        merkMobil: 'Toyota',
        modelMobil: 'Avanza',
        tahunMobil: 2020,
        kategori: 'MPV',
        hargaMobil: 180000000,
        kondisiMobil: 'Bekas',
        warnaMobil: 'Putih',
        kilometerMobil: 45000,
        transmisiMobil: 'Manual',
        bahanBakarMobil: 'Bensin',
        lokasi: 'Jakarta',
        statusMobil: 'tersedia',
        deskripsi: 'Toyota Avanza 2020 kondisi sangat terawat',
        spesifikasi: '{"mesin": "1.3L", "tenaga": "96 HP"}',
        galeriFoto: ['/images/cars/avanza1.jpg'],
        penjual: 'showroom',
        tanggalPosting: new Date('2024-01-15'),
        viewCount: 150,
        rating: 4.5,
        hargaPasar: 185000000
      },
      {
        idMobil: 'mobil_002',
        merkMobil: 'Honda',
        modelMobil: 'Civic',
        tahunMobil: 2019,
        kategori: 'Sedan',
        hargaMobil: 320000000,
        kondisiMobil: 'Bekas',
        warnaMobil: 'Hitam',
        kilometerMobil: 35000,
        transmisiMobil: 'CVT',
        bahanBakarMobil: 'Bensin',
        lokasi: 'Bandung',
        statusMobil: 'tersedia',
        deskripsi: 'Honda Civic Turbo 2019 full original',
        spesifikasi: '{"mesin": "1.5L Turbo", "tenaga": "173 HP"}',
        galeriFoto: ['/images/cars/civic1.jpg'],
        penjual: 'eksternal',
        tanggalPosting: new Date('2024-01-20'),
        viewCount: 89,
        rating: 4.8,
        hargaPasar: 325000000
      },
      {
        idMobil: 'mobil_003',
        merkMobil: 'Mitsubishi',
        modelMobil: 'Xpander',
        tahunMobil: 2021,
        kategori: 'MPV',
        hargaMobil: 220000000,
        kondisiMobil: 'Bekas',
        warnaMobil: 'Silver',
        kilometerMobil: 25000,
        transmisiMobil: 'CVT',
        bahanBakarMobil: 'Bensin',
        lokasi: 'Surabaya',
        statusMobil: 'tersedia',
        deskripsi: 'Mitsubishi Xpander 2021 seperti baru',
        spesifikasi: '{"mesin": "1.5L", "tenaga": "105 HP"}',
        galeriFoto: ['/images/cars/xpander1.jpg'],
        penjual: 'showroom',
        tanggalPosting: new Date('2024-01-25'),
        viewCount: 67,
        rating: 4.6,
        hargaPasar: 225000000
      }
    ];
  }

  private async pencarianMobilDatabase(kriteria: KriteriaPencarianMobil): Promise<DataMobil[]> {
    await this.simulasiDelay(400);
    
    const semuaMobil = await this.ambilSemuaMobilDariDatabase();
    
    return semuaMobil.filter(mobil => {
      if (kriteria.kataKunci) {
        const kataKunci = kriteria.kataKunci.toLowerCase();
        return (
          mobil.merkMobil.toLowerCase().includes(kataKunci) ||
          mobil.modelMobil.toLowerCase().includes(kataKunci) ||
          mobil.deskripsi.toLowerCase().includes(kataKunci)
        );
      }
      
      if (kriteria.merkMobil && mobil.merkMobil !== kriteria.merkMobil) return false;
      if (kriteria.kategori && mobil.kategori !== kriteria.kategori) return false;
      if (kriteria.tahunMin && mobil.tahunMobil < kriteria.tahunMin) return false;
      if (kriteria.tahunMax && mobil.tahunMobil > kriteria.tahunMax) return false;
      if (kriteria.hargaMin && mobil.hargaMobil < kriteria.hargaMin) return false;
      if (kriteria.hargaMax && mobil.hargaMobil > kriteria.hargaMax) return false;
      
      return true;
    });
  }

  private async filterMobilDatabase(filter: FilterMobil): Promise<DataMobil[]> {
    await this.simulasiDelay(400);
    
    const semuaMobil = await this.ambilSemuaMobilDariDatabase();
    
    return semuaMobil.filter(mobil => {
      if (filter.kategori && mobil.kategori !== filter.kategori) return false;
      if (filter.merkMobil && mobil.merkMobil !== filter.merkMobil) return false;
      if (filter.transmisi && mobil.transmisiMobil !== filter.transmisi) return false;
      if (filter.bahanBakar && mobil.bahanBakarMobil !== filter.bahanBakar) return false;
      if (filter.lokasi && mobil.lokasi !== filter.lokasi) return false;
      
      if (filter.rentangHarga) {
        if (mobil.hargaMobil < filter.rentangHarga.min || mobil.hargaMobil > filter.rentangHarga.max) {
          return false;
        }
      }
      
      if (filter.rentangTahun) {
        if (mobil.tahunMobil < filter.rentangTahun.min || mobil.tahunMobil > filter.rentangTahun.max) {
          return false;
        }
      }
      
      return true;
    });
  }

  private async updateStatusMobilDatabase(idMobil: string, status: string): Promise<boolean> {
    await this.simulasiDelay(300);
    // Simulasi update status di database
    return true;
  }

  private async incrementViewCount(idMobil: string): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi increment view count
  }

  private async ambilMobilSerupa(mobil: DataMobil): Promise<DataMobil[]> {
    await this.simulasiDelay(400);
    
    const semuaMobil = await this.ambilSemuaMobilDariDatabase();
    
    return semuaMobil.filter(m => 
      m.idMobil !== mobil.idMobil &&
      (m.merkMobil === mobil.merkMobil || m.kategori === mobil.kategori)
    ).slice(0, 3);
  }

  private async ambilRiwayatHarga(idMobil: string): Promise<any[]> {
    await this.simulasiDelay(300);
    
    return [
      { tanggal: new Date('2024-01-01'), harga: 185000000 },
      { tanggal: new Date('2024-01-15'), harga: 180000000 }
    ];
  }

  private async ambilReviewMobil(idMobil: string): Promise<any[]> {
    await this.simulasiDelay(300);
    
    return [
      {
        pengguna: 'John Doe',
        rating: 5,
        komentar: 'Mobil sangat bagus dan terawat',
        tanggal: new Date('2024-01-20')
      }
    ];
  }

  private async cekDuplikasiMobil(dataMobil: DataMobil): Promise<DataMobil | null> {
    await this.simulasiDelay(300);
    
    const semuaMobil = await this.ambilSemuaMobilDariDatabase();
    
    return semuaMobil.find(mobil =>
      mobil.merkMobil === dataMobil.merkMobil &&
      mobil.modelMobil === dataMobil.modelMobil &&
      mobil.tahunMobil === dataMobil.tahunMobil &&
      mobil.warnaMobil === dataMobil.warnaMobil
    ) || null;
  }

  private async updateMobilDatabase(idMobil: string, perubahan: Partial<DataMobil>): Promise<boolean> {
    await this.simulasiDelay(400);
    // Simulasi update mobil di database
    return true;
  }

  private async cekBisaHapusMobil(idMobil: string): Promise<boolean> {
    await this.simulasiDelay(300);
    // Simulasi cek apakah mobil bisa dihapus
    return true;
  }

  private async hapusMobilDatabase(idMobil: string): Promise<boolean> {
    await this.simulasiDelay(400);
    // Simulasi hapus mobil dari database
    return true;
  }

  private async simpanMobilDatabase(dataMobil: DataMobil): Promise<boolean> {
    await this.simulasiDelay(500);
    // Simulasi simpan mobil ke database
    return true;
  }

  private async generatePerbandinganMobil(mobil1: DataMobil, mobil2: DataMobil): Promise<PerbandinganMobil> {
    await this.simulasiDelay(300);
    
    return {
      mobil1,
      mobil2,
      perbandingan: {
        harga: mobil1.hargaMobil > mobil2.hargaMobil ? 'Mobil 1 lebih mahal' : 'Mobil 2 lebih mahal',
        tahun: mobil1.tahunMobil > mobil2.tahunMobil ? 'Mobil 1 lebih baru' : 'Mobil 2 lebih baru',
        kilometer: mobil1.kilometerMobil < mobil2.kilometerMobil ? 'Mobil 1 lebih sedikit KM' : 'Mobil 2 lebih sedikit KM',
        spesifikasi: {
          transmisi: { mobil1: mobil1.transmisiMobil, mobil2: mobil2.transmisiMobil },
          bahanBakar: { mobil1: mobil1.bahanBakarMobil, mobil2: mobil2.bahanBakarMobil }
        }
      }
    };
  }

  // Public method untuk mendapatkan data lengkap
  public toJSON(): DataMobil {
    return {
      idMobil: this.idMobil,
      merkMobil: this.merkMobil,
      modelMobil: this.modelMobil,
      tahunMobil: this.tahunMobil,
      kategori: this.kategori,
      hargaMobil: this.hargaMobil,
      kondisiMobil: this.kondisiMobil,
      warnaMobil: this.warnaMobil,
      kilometerMobil: this.kilometerMobil,
      transmisiMobil: this.transmisiMobil,
      bahanBakarMobil: this.bahanBakarMobil,
      lokasi: this.lokasi,
      statusMobil: this.statusMobil,
      deskripsi: this.deskripsi,
      spesifikasi: this.spesifikasi,
      galeriFoto: this.galeriFoto,
      penjual: this.penjual,
      tanggalPosting: this.tanggalPosting,
      viewCount: this.viewCount,
      rating: this.rating,
      hargaPasar: this.hargaPasar
    };
  }
}

export default EntitasMobil;