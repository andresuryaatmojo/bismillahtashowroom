// ==================== ENTITAS TRANSAKSI ====================
// Entity class untuk mengelola data dan operasi transaksi

export interface DataTransaksi {
  idTransaksi: string;
  idPengguna: string;
  idMobil: string;
  jenisTransaksi: 'pembelian' | 'penjualan' | 'tukar_tambah' | 'kredit' | 'cash';
  statusTransaksi: 'pending' | 'diproses' | 'selesai' | 'dibatalkan' | 'gagal';
  tanggalTransaksi: Date;
  nilaiTransaksi: number;
  metodePembayaran: 'cash' | 'transfer' | 'kredit' | 'leasing' | 'cicilan';
  statusPembayaran: 'pending' | 'lunas' | 'cicilan' | 'gagal' | 'refund';
  detailTransaksi: string;
  buktiTransaksi: string;
  invoiceNumber: string;
  adminApprovalId: string;
  notes: string;
}

export interface DataPesanan {
  idPengguna: string;
  idMobil: string;
  jenisTransaksi: string;
  metodePembayaran: string;
  nilaiTransaksi: number;
  detailTransaksi?: string;
  notes?: string;
}

export interface KriteriaFilter {
  idPengguna?: string;
  jenisTransaksi?: string;
  statusTransaksi?: string;
  statusPembayaran?: string;
  metodePembayaran?: string;
  tanggalMulai?: Date;
  tanggalAkhir?: Date;
  nilaiMin?: number;
  nilaiMax?: number;
  adminApprovalId?: string;
}

export interface RiwayatPembelian {
  transaksi: DataTransaksi[];
  totalTransaksi: number;
  totalNilai: number;
  periode: {
    mulai: Date;
    akhir: Date;
  };
}

export interface DataPenjualan {
  transaksi: DataTransaksi[];
  totalPenjualan: number;
  totalNilai: number;
  periode: {
    mulai: Date;
    akhir: Date;
  };
  statistik: {
    harian: any[];
    bulanan: any[];
    tahunan: any[];
  };
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

export interface DetailTransaksi {
  transaksi: DataTransaksi;
  pengguna: any;
  mobil: any;
  riwayatStatus: any[];
  dokumen: any[];
  pembayaran: any[];
}

export interface StatistikTransaksi {
  totalTransaksi: number;
  totalNilai: number;
  transaksiHariIni: number;
  transaksiMingguIni: number;
  transaksiBulanIni: number;
  trendPenjualan: any[];
  metodePembayaranPopuler: any[];
  jenisTransaksiTerbanyak: any[];
}

export class EntitasTransaksi {
  // Private attributes
  private idTransaksi: string;
  private idPengguna: string;
  private idMobil: string;
  private jenisTransaksi: 'pembelian' | 'penjualan' | 'tukar_tambah' | 'kredit' | 'cash';
  private statusTransaksi: 'pending' | 'diproses' | 'selesai' | 'dibatalkan' | 'gagal';
  private tanggalTransaksi: Date;
  private nilaiTransaksi: number;
  private metodePembayaran: 'cash' | 'transfer' | 'kredit' | 'leasing' | 'cicilan';
  private statusPembayaran: 'pending' | 'lunas' | 'cicilan' | 'gagal' | 'refund';
  private detailTransaksi: string;
  private buktiTransaksi: string;
  private invoiceNumber: string;
  private adminApprovalId: string;
  private notes: string;

  constructor(data?: Partial<DataTransaksi>) {
    this.idTransaksi = data?.idTransaksi || this.generateId();
    this.idPengguna = data?.idPengguna || '';
    this.idMobil = data?.idMobil || '';
    this.jenisTransaksi = data?.jenisTransaksi || 'pembelian';
    this.statusTransaksi = data?.statusTransaksi || 'pending';
    this.tanggalTransaksi = data?.tanggalTransaksi || new Date();
    this.nilaiTransaksi = data?.nilaiTransaksi || 0;
    this.metodePembayaran = data?.metodePembayaran || 'cash';
    this.statusPembayaran = data?.statusPembayaran || 'pending';
    this.detailTransaksi = data?.detailTransaksi || '';
    this.buktiTransaksi = data?.buktiTransaksi || '';
    this.invoiceNumber = data?.invoiceNumber || this.generateInvoiceNumber();
    this.adminApprovalId = data?.adminApprovalId || '';
    this.notes = data?.notes || '';
  }

  // Getters
  public getIdTransaksi(): string { return this.idTransaksi; }
  public getIdPengguna(): string { return this.idPengguna; }
  public getIdMobil(): string { return this.idMobil; }
  public getJenisTransaksi(): string { return this.jenisTransaksi; }
  public getStatusTransaksi(): string { return this.statusTransaksi; }
  public getTanggalTransaksi(): Date { return this.tanggalTransaksi; }
  public getNilaiTransaksi(): number { return this.nilaiTransaksi; }
  public getMetodePembayaran(): string { return this.metodePembayaran; }
  public getStatusPembayaran(): string { return this.statusPembayaran; }
  public getDetailTransaksi(): string { return this.detailTransaksi; }
  public getBuktiTransaksi(): string { return this.buktiTransaksi; }
  public getInvoiceNumber(): string { return this.invoiceNumber; }
  public getAdminApprovalId(): string { return this.adminApprovalId; }
  public getNotes(): string { return this.notes; }

  // Setters
  public setIdPengguna(id: string): void { this.idPengguna = id; }
  public setIdMobil(id: string): void { this.idMobil = id; }
  public setJenisTransaksi(jenis: 'pembelian' | 'penjualan' | 'tukar_tambah' | 'kredit' | 'cash'): void { this.jenisTransaksi = jenis; }
  public setStatusTransaksi(status: 'pending' | 'diproses' | 'selesai' | 'dibatalkan' | 'gagal'): void { this.statusTransaksi = status; }
  public setTanggalTransaksi(tanggal: Date): void { this.tanggalTransaksi = tanggal; }
  public setNilaiTransaksi(nilai: number): void { this.nilaiTransaksi = nilai; }
  public setMetodePembayaran(metode: 'cash' | 'transfer' | 'kredit' | 'leasing' | 'cicilan'): void { this.metodePembayaran = metode; }
  public setStatusPembayaran(status: 'pending' | 'lunas' | 'cicilan' | 'gagal' | 'refund'): void { this.statusPembayaran = status; }
  public setDetailTransaksi(detail: string): void { this.detailTransaksi = detail; }
  public setBuktiTransaksi(bukti: string): void { this.buktiTransaksi = bukti; }
  public setAdminApprovalId(id: string): void { this.adminApprovalId = id; }
  public setNotes(notes: string): void { this.notes = notes; }

  // Public Methods - Database Operations
  public async cariTransaksiByPengguna(idPengguna: string): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(700);
      
      if (!idPengguna || idPengguna.trim() === '') {
        return {
          sukses: false,
          pesan: 'ID Pengguna harus diisi'
        };
      }

      const transaksiPengguna = await this.ambilTransaksiByPenggunaDatabase(idPengguna);
      
      return {
        sukses: true,
        pesan: 'Transaksi pengguna berhasil ditemukan',
        data: {
          transaksi: transaksiPengguna,
          total: transaksiPengguna.length,
          idPengguna: idPengguna,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Gagal mencari transaksi pengguna',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async filterTransaksi(kriteriaFilter: KriteriaFilter): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(800);
      
      const transaksiFiltered = await this.filterTransaksiDatabase(kriteriaFilter);
      
      return {
        sukses: true,
        pesan: 'Filter transaksi berhasil diterapkan',
        data: {
          transaksi: transaksiFiltered,
          total: transaksiFiltered.length,
          kriteria: kriteriaFilter,
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Gagal memfilter transaksi',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async ambilDetailTransaksi(idTransaksi: string): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(600);
      
      if (!idTransaksi || idTransaksi.trim() === '') {
        return {
          sukses: false,
          pesan: 'ID Transaksi harus diisi'
        };
      }

      const transaksi = await this.ambilTransaksiDariDatabase(idTransaksi);
      
      if (!transaksi) {
        return {
          sukses: false,
          pesan: 'Transaksi tidak ditemukan'
        };
      }

      // Ambil detail tambahan
      const pengguna = await this.ambilDataPengguna(transaksi.idPengguna);
      const mobil = await this.ambilDataMobil(transaksi.idMobil);
      const riwayatStatus = await this.ambilRiwayatStatusTransaksi(idTransaksi);
      const dokumen = await this.ambilDokumenTransaksi(idTransaksi);
      const pembayaran = await this.ambilRiwayatPembayaran(idTransaksi);

      const detailLengkap: DetailTransaksi = {
        transaksi,
        pengguna,
        mobil,
        riwayatStatus,
        dokumen,
        pembayaran
      };

      return {
        sukses: true,
        pesan: 'Detail transaksi berhasil diambil',
        data: detailLengkap
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Gagal mengambil detail transaksi',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async buatPesanan(dataPesanan: DataPesanan): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(900);
      
      // Validasi data pesanan
      const validasi = await this.validasiDataPesanan(dataPesanan);
      
      if (!validasi.valid) {
        return {
          sukses: false,
          pesan: validasi.pesan
        };
      }

      // Cek ketersediaan mobil
      const mobilTersedia = await this.cekKetersediaanMobil(dataPesanan.idMobil);
      
      if (!mobilTersedia) {
        return {
          sukses: false,
          pesan: 'Mobil tidak tersedia atau sudah terjual'
        };
      }

      // Buat transaksi baru
      const dataTransaksi: DataTransaksi = {
        idTransaksi: this.generateId(),
        idPengguna: dataPesanan.idPengguna,
        idMobil: dataPesanan.idMobil,
        jenisTransaksi: dataPesanan.jenisTransaksi as any,
        statusTransaksi: 'pending',
        tanggalTransaksi: new Date(),
        nilaiTransaksi: dataPesanan.nilaiTransaksi,
        metodePembayaran: dataPesanan.metodePembayaran as any,
        statusPembayaran: 'pending',
        detailTransaksi: dataPesanan.detailTransaksi || '',
        buktiTransaksi: '',
        invoiceNumber: this.generateInvoiceNumber(),
        adminApprovalId: '',
        notes: dataPesanan.notes || ''
      };

      // Simpan transaksi ke database
      const result = await this.simpanTransaksiDatabase(dataTransaksi);
      
      if (result) {
        // Update status mobil menjadi pending
        await this.updateStatusMobil(dataPesanan.idMobil, 'pending');
        
        // Kirim notifikasi
        await this.kirimNotifikasiPesananBaru(dataTransaksi);

        return {
          sukses: true,
          pesan: 'Pesanan berhasil dibuat',
          data: {
            idTransaksi: dataTransaksi.idTransaksi,
            invoiceNumber: dataTransaksi.invoiceNumber,
            statusTransaksi: dataTransaksi.statusTransaksi,
            nilaiTransaksi: dataTransaksi.nilaiTransaksi,
            timestamp: new Date()
          }
        };
      }

      return {
        sukses: false,
        pesan: 'Gagal membuat pesanan'
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Error membuat pesanan',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async updateStatusTransaksi(idPesanan: string, status: 'pending' | 'diproses' | 'selesai' | 'dibatalkan' | 'gagal'): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(600);
      
      if (!idPesanan || idPesanan.trim() === '') {
        return {
          sukses: false,
          pesan: 'ID Pesanan harus diisi'
        };
      }

      const transaksi = await this.ambilTransaksiDariDatabase(idPesanan);
      
      if (!transaksi) {
        return {
          sukses: false,
          pesan: 'Transaksi tidak ditemukan'
        };
      }

      // Validasi perubahan status
      const validasiStatus = await this.validasiPerubahanStatus(transaksi.statusTransaksi, status);
      
      if (!validasiStatus.valid) {
        return {
          sukses: false,
          pesan: validasiStatus.pesan
        };
      }

      // Update status di database
      const result = await this.updateStatusTransaksiDatabase(idPesanan, status);
      
      if (result) {
        // Catat riwayat perubahan status
        await this.catatRiwayatStatus(idPesanan, transaksi.statusTransaksi, status);
        
        // Jika status selesai, update status mobil dan pembayaran
        if (status === 'selesai') {
          await this.updateStatusMobil(transaksi.idMobil, 'terjual');
          await this.updateStatusPembayaran(idPesanan, 'lunas');
        }
        
        // Jika status dibatalkan, kembalikan status mobil
        if (status === 'dibatalkan') {
          await this.updateStatusMobil(transaksi.idMobil, 'tersedia');
        }

        // Kirim notifikasi perubahan status
        await this.kirimNotifikasiPerubahanStatus(idPesanan, status);

        return {
          sukses: true,
          pesan: `Status transaksi berhasil diubah menjadi ${status}`,
          data: {
            idTransaksi: idPesanan,
            statusLama: transaksi.statusTransaksi,
            statusBaru: status,
            timestamp: new Date()
          }
        };
      }

      return {
        sukses: false,
        pesan: 'Gagal mengubah status transaksi'
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Error mengubah status transaksi',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async ambilRiwayatPembelian(idPengguna: string): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(800);
      
      if (!idPengguna || idPengguna.trim() === '') {
        return {
          sukses: false,
          pesan: 'ID Pengguna harus diisi'
        };
      }

      const transaksiPembelian = await this.ambilTransaksiPembelianDatabase(idPengguna);
      
      // Hitung statistik
      const totalNilai = transaksiPembelian.reduce((sum, t) => sum + t.nilaiTransaksi, 0);
      const transaksiSelesai = transaksiPembelian.filter(t => t.statusTransaksi === 'selesai');
      
      const riwayat: RiwayatPembelian = {
        transaksi: transaksiPembelian,
        totalTransaksi: transaksiPembelian.length,
        totalNilai: totalNilai,
        periode: {
          mulai: new Date(Math.min(...transaksiPembelian.map(t => t.tanggalTransaksi.getTime()))),
          akhir: new Date(Math.max(...transaksiPembelian.map(t => t.tanggalTransaksi.getTime())))
        }
      };

      return {
        sukses: true,
        pesan: 'Riwayat pembelian berhasil diambil',
        data: {
          riwayat: riwayat,
          statistik: {
            totalPembelian: transaksiPembelian.length,
            pembelianSelesai: transaksiSelesai.length,
            totalNilai: totalNilai,
            rataRataNilai: totalNilai / transaksiPembelian.length || 0
          },
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Gagal mengambil riwayat pembelian',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  public async ambilDataPenjualan(): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(1000);
      
      const semuaTransaksiPenjualan = await this.ambilSemuaTransaksiPenjualanDatabase();
      
      // Hitung statistik
      const totalNilai = semuaTransaksiPenjualan.reduce((sum, t) => sum + t.nilaiTransaksi, 0);
      const transaksiSelesai = semuaTransaksiPenjualan.filter(t => t.statusTransaksi === 'selesai');
      
      // Generate statistik harian, bulanan, tahunan
      const statistikHarian = await this.generateStatistikHarian(semuaTransaksiPenjualan);
      const statistikBulanan = await this.generateStatistikBulanan(semuaTransaksiPenjualan);
      const statistikTahunan = await this.generateStatistikTahunan(semuaTransaksiPenjualan);

      const dataPenjualan: DataPenjualan = {
        transaksi: semuaTransaksiPenjualan,
        totalPenjualan: semuaTransaksiPenjualan.length,
        totalNilai: totalNilai,
        periode: {
          mulai: new Date(Math.min(...semuaTransaksiPenjualan.map(t => t.tanggalTransaksi.getTime()))),
          akhir: new Date(Math.max(...semuaTransaksiPenjualan.map(t => t.tanggalTransaksi.getTime())))
        },
        statistik: {
          harian: statistikHarian,
          bulanan: statistikBulanan,
          tahunan: statistikTahunan
        }
      };

      return {
        sukses: true,
        pesan: 'Data penjualan berhasil diambil',
        data: {
          penjualan: dataPenjualan,
          ringkasan: {
            totalTransaksi: semuaTransaksiPenjualan.length,
            transaksiSelesai: transaksiSelesai.length,
            totalNilai: totalNilai,
            rataRataNilai: totalNilai / semuaTransaksiPenjualan.length || 0,
            tingkatKeberhasilan: (transaksiSelesai.length / semuaTransaksiPenjualan.length) * 100 || 0
          },
          timestamp: new Date()
        }
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Gagal mengambil data penjualan',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Additional Methods
  public async ambilStatistikTransaksi(): Promise<ResponOperasi> {
    try {
      await this.simulasiDelay(900);
      
      const semuaTransaksi = await this.ambilSemuaTransaksiDatabase();
      const today = new Date();
      const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const transaksiHariIni = semuaTransaksi.filter(t => 
        t.tanggalTransaksi.toDateString() === new Date().toDateString()
      ).length;

      const transaksiMingguIni = semuaTransaksi.filter(t => 
        t.tanggalTransaksi >= startOfWeek
      ).length;

      const transaksiBulanIni = semuaTransaksi.filter(t => 
        t.tanggalTransaksi >= startOfMonth
      ).length;

      const totalNilai = semuaTransaksi.reduce((sum, t) => sum + t.nilaiTransaksi, 0);

      const trendPenjualan = await this.generateTrendPenjualan(semuaTransaksi);
      const metodePembayaranPopuler = await this.generateStatistikMetodePembayaran(semuaTransaksi);
      const jenisTransaksiTerbanyak = await this.generateStatistikJenisTransaksi(semuaTransaksi);

      const statistik: StatistikTransaksi = {
        totalTransaksi: semuaTransaksi.length,
        totalNilai: totalNilai,
        transaksiHariIni: transaksiHariIni,
        transaksiMingguIni: transaksiMingguIni,
        transaksiBulanIni: transaksiBulanIni,
        trendPenjualan: trendPenjualan,
        metodePembayaranPopuler: metodePembayaranPopuler,
        jenisTransaksiTerbanyak: jenisTransaksiTerbanyak
      };

      return {
        sukses: true,
        pesan: 'Statistik transaksi berhasil diambil',
        data: statistik
      };
    } catch (error) {
      return {
        sukses: false,
        pesan: 'Gagal mengambil statistik transaksi',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // Private Helper Methods
  private async simulasiDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateId(): string {
    return 'trx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    
    return `INV${year}${month}${day}${random}`;
  }

  private async validasiDataPesanan(data: DataPesanan): Promise<ResponValidasi> {
    if (!data.idPengguna || data.idPengguna.trim() === '') {
      return { valid: false, pesan: 'ID Pengguna harus diisi' };
    }

    if (!data.idMobil || data.idMobil.trim() === '') {
      return { valid: false, pesan: 'ID Mobil harus diisi' };
    }

    if (!data.jenisTransaksi || data.jenisTransaksi.trim() === '') {
      return { valid: false, pesan: 'Jenis transaksi harus diisi' };
    }

    if (!data.metodePembayaran || data.metodePembayaran.trim() === '') {
      return { valid: false, pesan: 'Metode pembayaran harus diisi' };
    }

    if (!data.nilaiTransaksi || data.nilaiTransaksi <= 0) {
      return { valid: false, pesan: 'Nilai transaksi harus lebih dari 0' };
    }

    return { valid: true, pesan: 'Data pesanan valid' };
  }

  private async validasiPerubahanStatus(statusLama: string, statusBaru: string): Promise<ResponValidasi> {
    const validTransitions: { [key: string]: string[] } = {
      'pending': ['diproses', 'dibatalkan'],
      'diproses': ['selesai', 'dibatalkan', 'gagal'],
      'selesai': [],
      'dibatalkan': [],
      'gagal': ['pending']
    };

    if (!validTransitions[statusLama]?.includes(statusBaru)) {
      return {
        valid: false,
        pesan: `Tidak dapat mengubah status dari ${statusLama} ke ${statusBaru}`
      };
    }

    return { valid: true, pesan: 'Perubahan status valid' };
  }

  // Database Simulation Methods
  private async ambilTransaksiDariDatabase(idTransaksi: string): Promise<DataTransaksi | null> {
    await this.simulasiDelay(300);
    
    const sampleTransaksi: DataTransaksi[] = [
      {
        idTransaksi: 'trx_001',
        idPengguna: 'user_001',
        idMobil: 'mobil_001',
        jenisTransaksi: 'pembelian',
        statusTransaksi: 'selesai',
        tanggalTransaksi: new Date('2024-01-15'),
        nilaiTransaksi: 180000000,
        metodePembayaran: 'transfer',
        statusPembayaran: 'lunas',
        detailTransaksi: 'Pembelian Toyota Avanza 2020',
        buktiTransaksi: '/documents/bukti_trx_001.pdf',
        invoiceNumber: 'INV240115A1B2',
        adminApprovalId: 'admin_001',
        notes: 'Transaksi berjalan lancar'
      },
      {
        idTransaksi: 'trx_002',
        idPengguna: 'user_002',
        idMobil: 'mobil_002',
        jenisTransaksi: 'kredit',
        statusTransaksi: 'diproses',
        tanggalTransaksi: new Date('2024-01-20'),
        nilaiTransaksi: 320000000,
        metodePembayaran: 'cicilan',
        statusPembayaran: 'cicilan',
        detailTransaksi: 'Pembelian Honda Civic 2019 dengan kredit',
        buktiTransaksi: '/documents/bukti_trx_002.pdf',
        invoiceNumber: 'INV240120C3D4',
        adminApprovalId: 'admin_002',
        notes: 'Menunggu persetujuan kredit'
      }
    ];

    return sampleTransaksi.find(t => t.idTransaksi === idTransaksi) || null;
  }

  private async ambilTransaksiByPenggunaDatabase(idPengguna: string): Promise<DataTransaksi[]> {
    await this.simulasiDelay(400);
    
    const semuaTransaksi = await this.ambilSemuaTransaksiDatabase();
    return semuaTransaksi.filter(t => t.idPengguna === idPengguna);
  }

  private async filterTransaksiDatabase(kriteria: KriteriaFilter): Promise<DataTransaksi[]> {
    await this.simulasiDelay(500);
    
    const semuaTransaksi = await this.ambilSemuaTransaksiDatabase();
    
    return semuaTransaksi.filter(transaksi => {
      if (kriteria.idPengguna && transaksi.idPengguna !== kriteria.idPengguna) return false;
      if (kriteria.jenisTransaksi && transaksi.jenisTransaksi !== kriteria.jenisTransaksi) return false;
      if (kriteria.statusTransaksi && transaksi.statusTransaksi !== kriteria.statusTransaksi) return false;
      if (kriteria.statusPembayaran && transaksi.statusPembayaran !== kriteria.statusPembayaran) return false;
      if (kriteria.metodePembayaran && transaksi.metodePembayaran !== kriteria.metodePembayaran) return false;
      
      if (kriteria.tanggalMulai && transaksi.tanggalTransaksi < kriteria.tanggalMulai) return false;
      if (kriteria.tanggalAkhir && transaksi.tanggalTransaksi > kriteria.tanggalAkhir) return false;
      
      if (kriteria.nilaiMin && transaksi.nilaiTransaksi < kriteria.nilaiMin) return false;
      if (kriteria.nilaiMax && transaksi.nilaiTransaksi > kriteria.nilaiMax) return false;
      
      return true;
    });
  }

  private async ambilSemuaTransaksiDatabase(): Promise<DataTransaksi[]> {
    await this.simulasiDelay(600);
    
    return [
      {
        idTransaksi: 'trx_001',
        idPengguna: 'user_001',
        idMobil: 'mobil_001',
        jenisTransaksi: 'pembelian',
        statusTransaksi: 'selesai',
        tanggalTransaksi: new Date('2024-01-15'),
        nilaiTransaksi: 180000000,
        metodePembayaran: 'transfer',
        statusPembayaran: 'lunas',
        detailTransaksi: 'Pembelian Toyota Avanza 2020',
        buktiTransaksi: '/documents/bukti_trx_001.pdf',
        invoiceNumber: 'INV240115A1B2',
        adminApprovalId: 'admin_001',
        notes: 'Transaksi berjalan lancar'
      },
      {
        idTransaksi: 'trx_002',
        idPengguna: 'user_002',
        idMobil: 'mobil_002',
        jenisTransaksi: 'kredit',
        statusTransaksi: 'diproses',
        tanggalTransaksi: new Date('2024-01-20'),
        nilaiTransaksi: 320000000,
        metodePembayaran: 'cicilan',
        statusPembayaran: 'cicilan',
        detailTransaksi: 'Pembelian Honda Civic 2019 dengan kredit',
        buktiTransaksi: '/documents/bukti_trx_002.pdf',
        invoiceNumber: 'INV240120C3D4',
        adminApprovalId: 'admin_002',
        notes: 'Menunggu persetujuan kredit'
      },
      {
        idTransaksi: 'trx_003',
        idPengguna: 'user_001',
        idMobil: 'mobil_003',
        jenisTransaksi: 'cash',
        statusTransaksi: 'pending',
        tanggalTransaksi: new Date('2024-01-25'),
        nilaiTransaksi: 220000000,
        metodePembayaran: 'cash',
        statusPembayaran: 'pending',
        detailTransaksi: 'Pembelian Mitsubishi Xpander 2021',
        buktiTransaksi: '',
        invoiceNumber: 'INV240125E5F6',
        adminApprovalId: '',
        notes: 'Menunggu konfirmasi pembayaran'
      }
    ];
  }

  private async ambilTransaksiPembelianDatabase(idPengguna: string): Promise<DataTransaksi[]> {
    await this.simulasiDelay(400);
    
    const semuaTransaksi = await this.ambilSemuaTransaksiDatabase();
    return semuaTransaksi.filter(t => 
      t.idPengguna === idPengguna && 
      (t.jenisTransaksi === 'pembelian' || t.jenisTransaksi === 'kredit' || t.jenisTransaksi === 'cash')
    );
  }

  private async ambilSemuaTransaksiPenjualanDatabase(): Promise<DataTransaksi[]> {
    await this.simulasiDelay(500);
    
    const semuaTransaksi = await this.ambilSemuaTransaksiDatabase();
    return semuaTransaksi.filter(t => t.jenisTransaksi === 'penjualan');
  }

  private async cekKetersediaanMobil(idMobil: string): Promise<boolean> {
    await this.simulasiDelay(300);
    // Simulasi cek ketersediaan mobil
    return true;
  }

  private async simpanTransaksiDatabase(data: DataTransaksi): Promise<boolean> {
    await this.simulasiDelay(500);
    // Simulasi simpan transaksi ke database
    return true;
  }

  private async updateStatusTransaksiDatabase(idTransaksi: string, status: string): Promise<boolean> {
    await this.simulasiDelay(300);
    // Simulasi update status transaksi
    return true;
  }

  private async updateStatusMobil(idMobil: string, status: string): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi update status mobil
  }

  private async updateStatusPembayaran(idTransaksi: string, status: string): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi update status pembayaran
  }

  private async catatRiwayatStatus(idTransaksi: string, statusLama: string, statusBaru: string): Promise<void> {
    await this.simulasiDelay(200);
    // Simulasi catat riwayat perubahan status
  }

  private async kirimNotifikasiPesananBaru(transaksi: DataTransaksi): Promise<void> {
    await this.simulasiDelay(300);
    // Simulasi kirim notifikasi pesanan baru
  }

  private async kirimNotifikasiPerubahanStatus(idTransaksi: string, status: string): Promise<void> {
    await this.simulasiDelay(300);
    // Simulasi kirim notifikasi perubahan status
  }

  private async ambilDataPengguna(idPengguna: string): Promise<any> {
    await this.simulasiDelay(200);
    return {
      idPengguna: idPengguna,
      namaLengkap: 'John Doe',
      email: 'john@example.com',
      nomorTelepon: '081234567890'
    };
  }

  private async ambilDataMobil(idMobil: string): Promise<any> {
    await this.simulasiDelay(200);
    return {
      idMobil: idMobil,
      merkMobil: 'Toyota',
      modelMobil: 'Avanza',
      tahunMobil: 2020,
      hargaMobil: 180000000
    };
  }

  private async ambilRiwayatStatusTransaksi(idTransaksi: string): Promise<any[]> {
    await this.simulasiDelay(200);
    return [
      {
        status: 'pending',
        tanggal: new Date('2024-01-15T10:00:00'),
        keterangan: 'Transaksi dibuat'
      },
      {
        status: 'diproses',
        tanggal: new Date('2024-01-15T14:00:00'),
        keterangan: 'Transaksi sedang diproses'
      }
    ];
  }

  private async ambilDokumenTransaksi(idTransaksi: string): Promise<any[]> {
    await this.simulasiDelay(200);
    return [
      {
        jenis: 'invoice',
        nama: 'Invoice Pembelian',
        url: '/documents/invoice_trx_001.pdf'
      },
      {
        jenis: 'bukti_transfer',
        nama: 'Bukti Transfer',
        url: '/documents/bukti_transfer_001.jpg'
      }
    ];
  }

  private async ambilRiwayatPembayaran(idTransaksi: string): Promise<any[]> {
    await this.simulasiDelay(200);
    return [
      {
        tanggal: new Date('2024-01-15'),
        jumlah: 180000000,
        metode: 'transfer',
        status: 'lunas',
        keterangan: 'Pembayaran penuh'
      }
    ];
  }

  private async generateStatistikHarian(transaksi: DataTransaksi[]): Promise<any[]> {
    await this.simulasiDelay(300);
    // Simulasi generate statistik harian
    return [
      { tanggal: '2024-01-15', jumlah: 2, nilai: 500000000 },
      { tanggal: '2024-01-16', jumlah: 1, nilai: 180000000 }
    ];
  }

  private async generateStatistikBulanan(transaksi: DataTransaksi[]): Promise<any[]> {
    await this.simulasiDelay(300);
    // Simulasi generate statistik bulanan
    return [
      { bulan: '2024-01', jumlah: 15, nilai: 2500000000 },
      { bulan: '2024-02', jumlah: 12, nilai: 2100000000 }
    ];
  }

  private async generateStatistikTahunan(transaksi: DataTransaksi[]): Promise<any[]> {
    await this.simulasiDelay(300);
    // Simulasi generate statistik tahunan
    return [
      { tahun: '2023', jumlah: 120, nilai: 25000000000 },
      { tahun: '2024', jumlah: 45, nilai: 8500000000 }
    ];
  }

  private async generateTrendPenjualan(transaksi: DataTransaksi[]): Promise<any[]> {
    await this.simulasiDelay(300);
    return [
      { periode: 'Minggu 1', nilai: 500000000 },
      { periode: 'Minggu 2', nilai: 750000000 },
      { periode: 'Minggu 3', nilai: 600000000 },
      { periode: 'Minggu 4', nilai: 850000000 }
    ];
  }

  private async generateStatistikMetodePembayaran(transaksi: DataTransaksi[]): Promise<any[]> {
    await this.simulasiDelay(200);
    return [
      { metode: 'transfer', jumlah: 15, persentase: 45 },
      { metode: 'cash', jumlah: 10, persentase: 30 },
      { metode: 'cicilan', jumlah: 8, persentase: 25 }
    ];
  }

  private async generateStatistikJenisTransaksi(transaksi: DataTransaksi[]): Promise<any[]> {
    await this.simulasiDelay(200);
    return [
      { jenis: 'pembelian', jumlah: 20, persentase: 60 },
      { jenis: 'kredit', jumlah: 10, persentase: 30 },
      { jenis: 'tukar_tambah', jumlah: 3, persentase: 10 }
    ];
  }

  // Public method untuk mendapatkan data lengkap
  public toJSON(): DataTransaksi {
    return {
      idTransaksi: this.idTransaksi,
      idPengguna: this.idPengguna,
      idMobil: this.idMobil,
      jenisTransaksi: this.jenisTransaksi,
      statusTransaksi: this.statusTransaksi,
      tanggalTransaksi: this.tanggalTransaksi,
      nilaiTransaksi: this.nilaiTransaksi,
      metodePembayaran: this.metodePembayaran,
      statusPembayaran: this.statusPembayaran,
      detailTransaksi: this.detailTransaksi,
      buktiTransaksi: this.buktiTransaksi,
      invoiceNumber: this.invoiceNumber,
      adminApprovalId: this.adminApprovalId,
      notes: this.notes
    };
  }
}

export type StatusTransaksi = 'pending' | 'diproses' | 'selesai' | 'dibatalkan' | 'gagal';
export type StatusChat = 'aktif' | 'nonaktif' | 'diblokir';
export type StatusIklan = 'aktif' | 'nonaktif' | 'pending' | 'ditolak';
export type TipeTransaksi = 'pembelian' | 'penjualan' | 'tukar_tambah' | 'kredit' | 'cash';
export type TipeChat = 'pribadi' | 'grup' | 'broadcast';
export type TipeIklan = 'premium' | 'standar' | 'gratis';

export default EntitasTransaksi;