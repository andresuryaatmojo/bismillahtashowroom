const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Interface untuk data riwayat transaksi
export interface DataRiwayatTransaksi {
  id: string;
  nomorTransaksi: string;
  tanggalTransaksi: string;
  jenis: 'pembelian' | 'test_drive' | 'service' | 'trade_in' | 'konsultasi';
  status: 'pending' | 'diproses' | 'selesai' | 'dibatalkan' | 'gagal';
  mobil: {
    id: string;
    nama: string;
    merk: string;
    model: string;
    tahun: number;
    foto: string;
    harga: number;
  };
  dealer: {
    id: string;
    nama: string;
    alamat: string;
    telepon: string;
  };
  totalAmount: number;
  metodePembayaran: string;
  statusPembayaran: 'pending' | 'paid' | 'failed' | 'refunded';
  catatan?: string;
  dokumen: DokumenTransaksi[];
  timeline: TimelineItem[];
  canCancel: boolean;
  canReview: boolean;
  canReorder: boolean;
}

// Interface untuk dokumen transaksi
export interface DokumenTransaksi {
  id: string;
  nama: string;
  tipe: 'kontrak' | 'invoice' | 'receipt' | 'surat_jalan' | 'stnk' | 'bpkb' | 'asuransi';
  url: string;
  ukuran: number;
  tanggalUpload: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Interface untuk timeline item
export interface TimelineItem {
  id: string;
  tanggal: string;
  status: string;
  deskripsi: string;
  oleh: string;
  catatan?: string;
  dokumen?: string[];
}

// Interface untuk detail transaksi
export interface DetailTransaksi {
  transaksi: DataRiwayatTransaksi;
  pembayaran: {
    metode: string;
    jumlahTotal: number;
    uangMuka?: number;
    cicilan?: {
      jumlahBulan: number;
      nominalPerBulan: number;
      sukuBunga: number;
      sisaCicilan: number;
    };
    riwayatPembayaran: RiwayatPembayaran[];
  };
  pengiriman?: {
    alamat: string;
    tanggalKirim: string;
    estimasiTiba: string;
    kurir: string;
    nomorResi: string;
    status: string;
  };
  layananTambahan: LayananTambahan[];
  komunikasi: KomunikasiHistory[];
}

// Interface untuk riwayat pembayaran
export interface RiwayatPembayaran {
  id: string;
  tanggal: string;
  jumlah: number;
  metode: string;
  status: 'success' | 'pending' | 'failed';
  referensi: string;
  catatan?: string;
}

// Interface untuk layanan tambahan
export interface LayananTambahan {
  id: string;
  nama: string;
  deskripsi: string;
  harga: number;
  status: 'active' | 'completed' | 'cancelled';
}

// Interface untuk history komunikasi
export interface KomunikasiHistory {
  id: string;
  tanggal: string;
  tipe: 'call' | 'email' | 'chat' | 'visit';
  dari: string;
  kepada: string;
  subjek: string;
  isi: string;
  status: 'sent' | 'delivered' | 'read' | 'replied';
}

// Interface untuk filter riwayat
export interface FilterRiwayat {
  tanggalMulai?: string;
  tanggalSelesai?: string;
  jenis?: string[];
  status?: string[];
  dealer?: string[];
  metodePembayaran?: string[];
  rentangHarga?: {
    min: number;
    max: number;
  };
}

// Interface untuk statistik riwayat
export interface StatistikRiwayat {
  totalTransaksi: number;
  totalNilai: number;
  transaksiSelesai: number;
  transaksiPending: number;
  transaksiDibatalkan: number;
  mobilTerbeli: number;
  testDriveSelesai: number;
  rataRataNilaiTransaksi: number;
  bulanTerakhir: {
    jumlahTransaksi: number;
    nilaiTransaksi: number;
  };
}

export class KontrollerRiwayat {
  private token: string | null = null;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  /**
   * Memuat data riwayat transaksi pengguna
   * @param page - Halaman (default: 1)
   * @param limit - Jumlah per halaman (default: 10)
   * @param filter - Filter pencarian
   * @param sortBy - Urutan ('terbaru' | 'terlama' | 'nilai_tinggi' | 'nilai_rendah')
   * @returns Promise<{data: DataRiwayatTransaksi[], total: number, statistik: StatistikRiwayat}>
   */
  public async muatDataRiwayat(
    page: number = 1,
    limit: number = 10,
    filter?: FilterRiwayat,
    sortBy: string = 'terbaru'
  ): Promise<{
    data: DataRiwayatTransaksi[];
    total: number;
    statistik: StatistikRiwayat;
  }> {
    try {
      // Check cache first
      const cacheKey = `riwayat_${page}_${limit}_${JSON.stringify(filter)}_${sortBy}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy
      });

      // Add filter parameters
      if (filter) {
        if (filter.tanggalMulai) params.append('tanggalMulai', filter.tanggalMulai);
        if (filter.tanggalSelesai) params.append('tanggalSelesai', filter.tanggalSelesai);
        if (filter.jenis) params.append('jenis', filter.jenis.join(','));
        if (filter.status) params.append('status', filter.status.join(','));
        if (filter.dealer) params.append('dealer', filter.dealer.join(','));
        if (filter.metodePembayaran) params.append('metodePembayaran', filter.metodePembayaran.join(','));
        if (filter.rentangHarga) {
          params.append('hargaMin', filter.rentangHarga.min.toString());
          params.append('hargaMax', filter.rentangHarga.max.toString());
        }
      }

      const response = await fetch(`${API_BASE_URL}/riwayat?${params}`, {
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
      
      // Cache the result
      this.setToCache(cacheKey, result.data);

      return result.data;

    } catch (error) {
      console.error('Error loading transaction history:', error);
      return {
        data: [],
        total: 0,
        statistik: this.getDefaultStatistik()
      };
    }
  }

  /**
   * Memuat detail transaksi berdasarkan ID
   * @param idTransaksi - ID transaksi
   * @returns Promise<DetailTransaksi | null>
   */
  public async muatDetailTransaksi(idTransaksi: string): Promise<DetailTransaksi | null> {
    try {
      // Check cache first
      const cacheKey = `detail_${idTransaksi}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const response = await fetch(`${API_BASE_URL}/riwayat/${idTransaksi}`, {
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
      
      // Cache the result
      this.setToCache(cacheKey, result.data);

      return result.data;

    } catch (error) {
      console.error('Error loading transaction detail:', error);
      return null;
    }
  }

  /**
   * Format detail transaksi untuk tampilan
   * @param dataDetail - Data detail transaksi
   * @returns Object dengan data yang sudah diformat
   */
  public formatDetailTransaksi(dataDetail: DetailTransaksi): {
    ringkasan: any;
    pembayaran: any;
    timeline: any[];
    dokumen: any[];
    aksiTersedia: string[];
  } {
    const ringkasan = {
      nomorTransaksi: dataDetail.transaksi.nomorTransaksi,
      tanggal: this.formatTanggal(dataDetail.transaksi.tanggalTransaksi),
      status: this.formatStatus(dataDetail.transaksi.status),
      jenis: this.formatJenisTransaksi(dataDetail.transaksi.jenis),
      mobil: {
        nama: `${dataDetail.transaksi.mobil.merk} ${dataDetail.transaksi.mobil.model} ${dataDetail.transaksi.mobil.tahun}`,
        harga: this.formatRupiah(dataDetail.transaksi.mobil.harga),
        foto: dataDetail.transaksi.mobil.foto
      },
      dealer: {
        nama: dataDetail.transaksi.dealer.nama,
        alamat: dataDetail.transaksi.dealer.alamat,
        telepon: dataDetail.transaksi.dealer.telepon
      },
      totalAmount: this.formatRupiah(dataDetail.transaksi.totalAmount)
    };

    const pembayaran = {
      metode: dataDetail.pembayaran.metode,
      jumlahTotal: this.formatRupiah(dataDetail.pembayaran.jumlahTotal),
      statusPembayaran: this.formatStatusPembayaran(dataDetail.transaksi.statusPembayaran),
      ...(dataDetail.pembayaran.uangMuka && {
        uangMuka: this.formatRupiah(dataDetail.pembayaran.uangMuka)
      }),
      ...(dataDetail.pembayaran.cicilan && {
        cicilan: {
          jumlahBulan: dataDetail.pembayaran.cicilan.jumlahBulan,
          nominalPerBulan: this.formatRupiah(dataDetail.pembayaran.cicilan.nominalPerBulan),
          sukuBunga: `${dataDetail.pembayaran.cicilan.sukuBunga}%`,
          sisaCicilan: dataDetail.pembayaran.cicilan.sisaCicilan
        }
      }),
      riwayatPembayaran: dataDetail.pembayaran.riwayatPembayaran.map(item => ({
        ...item,
        tanggal: this.formatTanggal(item.tanggal),
        jumlah: this.formatRupiah(item.jumlah),
        status: this.formatStatusPembayaran(item.status)
      }))
    };

    const timeline = dataDetail.transaksi.timeline.map(item => ({
      ...item,
      tanggal: this.formatTanggalWaktu(item.tanggal),
      status: this.formatStatus(item.status)
    }));

    const dokumen = dataDetail.transaksi.dokumen.map(doc => ({
      ...doc,
      tanggalUpload: this.formatTanggal(doc.tanggalUpload),
      ukuran: this.formatUkuranFile(doc.ukuran),
      tipe: this.formatTipeDokumen(doc.tipe),
      status: this.formatStatusDokumen(doc.status)
    }));

    const aksiTersedia = this.getAksiTersedia(dataDetail.transaksi);

    return {
      ringkasan,
      pembayaran,
      timeline,
      dokumen,
      aksiTersedia
    };
  }

  /**
   * Eksekusi aksi pada transaksi
   * @param jenisAksi - Jenis aksi ('cancel', 'reorder', 'download_invoice', 'contact_dealer', 'add_review')
   * @param idTransaksi - ID transaksi
   * @param dataAksi - Data tambahan untuk aksi
   * @returns Promise<{success: boolean, message: string, data?: any}>
   */
  public async eksekusiAksi(
    jenisAksi: string,
    idTransaksi: string,
    dataAksi?: any
  ): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      switch (jenisAksi) {
        case 'cancel':
          return await this.batalkanTransaksi(idTransaksi, dataAksi?.alasan);
        
        case 'reorder':
          return await this.pesanUlang(idTransaksi);
        
        case 'download_invoice':
          return await this.downloadInvoice(idTransaksi);
        
        case 'download_contract':
          return await this.downloadKontrak(idTransaksi);
        
        case 'contact_dealer':
          return await this.hubungiDealer(idTransaksi, dataAksi?.pesan);
        
        case 'add_review':
          return await this.tambahUlasan(idTransaksi);
        
        case 'track_delivery':
          return await this.lacakPengiriman(idTransaksi);
        
        case 'request_refund':
          return await this.ajukanRefund(idTransaksi, dataAksi?.alasan);
        
        case 'extend_warranty':
          return await this.perpanjangGaransi(idTransaksi);
        
        case 'schedule_service':
          return await this.jadwalkanService(idTransaksi, dataAksi?.tanggal);
        
        default:
          return {
            success: false,
            message: 'Aksi tidak dikenali'
          };
      }

    } catch (error) {
      console.error('Error executing action:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengeksekusi aksi'
      };
    }
  }

  /**
   * Batalkan transaksi
   */
  private async batalkanTransaksi(idTransaksi: string, alasan?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/riwayat/${idTransaksi}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      },
      body: JSON.stringify({ alasan })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Gagal membatalkan transaksi');
    }

    // Clear cache
    this.clearCacheByPattern('riwayat_');
    this.clearCacheByPattern(`detail_${idTransaksi}`);

    return {
      success: true,
      message: 'Transaksi berhasil dibatalkan',
      data: result.data
    };
  }

  /**
   * Pesan ulang
   */
  private async pesanUlang(idTransaksi: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/riwayat/${idTransaksi}/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      }
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Gagal melakukan pemesanan ulang');
    }

    return {
      success: true,
      message: 'Pemesanan ulang berhasil dibuat',
      data: result.data
    };
  }

  /**
   * Download invoice
   */
  private async downloadInvoice(idTransaksi: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/riwayat/${idTransaksi}/invoice`, {
      method: 'GET',
      headers: {
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      }
    });

    if (!response.ok) {
      throw new Error('Gagal mengunduh invoice');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice_${idTransaksi}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return {
      success: true,
      message: 'Invoice berhasil diunduh'
    };
  }

  /**
   * Download kontrak
   */
  private async downloadKontrak(idTransaksi: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/riwayat/${idTransaksi}/contract`, {
      method: 'GET',
      headers: {
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      }
    });

    if (!response.ok) {
      throw new Error('Gagal mengunduh kontrak');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kontrak_${idTransaksi}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return {
      success: true,
      message: 'Kontrak berhasil diunduh'
    };
  }

  /**
   * Hubungi dealer
   */
  private async hubungiDealer(idTransaksi: string, pesan?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/riwayat/${idTransaksi}/contact-dealer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      },
      body: JSON.stringify({ pesan })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Gagal menghubungi dealer');
    }

    return {
      success: true,
      message: 'Pesan berhasil dikirim ke dealer',
      data: result.data
    };
  }

  /**
   * Tambah ulasan
   */
  private async tambahUlasan(idTransaksi: string): Promise<any> {
    return {
      success: true,
      message: 'Redirect ke halaman ulasan',
      data: { redirectTo: `/ulasan/buat/${idTransaksi}` }
    };
  }

  /**
   * Lacak pengiriman
   */
  private async lacakPengiriman(idTransaksi: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/riwayat/${idTransaksi}/tracking`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      }
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Gagal melacak pengiriman');
    }

    return {
      success: true,
      message: 'Data pelacakan berhasil dimuat',
      data: result.data
    };
  }

  /**
   * Ajukan refund
   */
  private async ajukanRefund(idTransaksi: string, alasan?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/riwayat/${idTransaksi}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` })
      },
      body: JSON.stringify({ alasan })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Gagal mengajukan refund');
    }

    return {
      success: true,
      message: 'Pengajuan refund berhasil dikirim',
      data: result.data
    };
  }

  /**
   * Perpanjang garansi
   */
  private async perpanjangGaransi(idTransaksi: string): Promise<any> {
    return {
      success: true,
      message: 'Redirect ke halaman perpanjangan garansi',
      data: { redirectTo: `/garansi/perpanjang/${idTransaksi}` }
    };
  }

  /**
   * Jadwalkan service
   */
  private async jadwalkanService(idTransaksi: string, tanggal?: string): Promise<any> {
    return {
      success: true,
      message: 'Redirect ke halaman jadwal service',
      data: { redirectTo: `/service/jadwal/${idTransaksi}`, tanggal }
    };
  }

  /**
   * Get aksi yang tersedia untuk transaksi
   */
  private getAksiTersedia(transaksi: DataRiwayatTransaksi): string[] {
    const aksi: string[] = [];

    if (transaksi.canCancel) aksi.push('cancel');
    if (transaksi.canReorder) aksi.push('reorder');
    if (transaksi.canReview) aksi.push('add_review');
    
    if (transaksi.status === 'selesai') {
      aksi.push('download_invoice');
      aksi.push('download_contract');
    }

    if (transaksi.jenis === 'pembelian') {
      aksi.push('contact_dealer');
      aksi.push('track_delivery');
      aksi.push('extend_warranty');
      aksi.push('schedule_service');
    }

    if (transaksi.statusPembayaran === 'paid' && transaksi.status !== 'selesai') {
      aksi.push('request_refund');
    }

    return aksi;
  }

  /**
   * Utility methods for formatting
   */
  private formatTanggal(tanggal: string): string {
    return new Date(tanggal).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  private formatTanggalWaktu(tanggal: string): string {
    return new Date(tanggal).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  private formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Menunggu',
      'diproses': 'Diproses',
      'selesai': 'Selesai',
      'dibatalkan': 'Dibatalkan',
      'gagal': 'Gagal'
    };
    return statusMap[status] || status;
  }

  private formatStatusPembayaran(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Menunggu Pembayaran',
      'paid': 'Lunas',
      'failed': 'Gagal',
      'refunded': 'Dikembalikan'
    };
    return statusMap[status] || status;
  }

  private formatJenisTransaksi(jenis: string): string {
    const jenisMap: { [key: string]: string } = {
      'pembelian': 'Pembelian Mobil',
      'test_drive': 'Test Drive',
      'service': 'Service',
      'trade_in': 'Trade In',
      'konsultasi': 'Konsultasi'
    };
    return jenisMap[jenis] || jenis;
  }

  private formatUkuranFile(ukuran: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = ukuran;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  private formatTipeDokumen(tipe: string): string {
    const tipeMap: { [key: string]: string } = {
      'kontrak': 'Kontrak',
      'invoice': 'Invoice',
      'receipt': 'Kwitansi',
      'surat_jalan': 'Surat Jalan',
      'stnk': 'STNK',
      'bpkb': 'BPKB',
      'asuransi': 'Asuransi'
    };
    return tipeMap[tipe] || tipe;
  }

  private formatStatusDokumen(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Menunggu Verifikasi',
      'approved': 'Disetujui',
      'rejected': 'Ditolak'
    };
    return statusMap[status] || status;
  }

  private getDefaultStatistik(): StatistikRiwayat {
    return {
      totalTransaksi: 0,
      totalNilai: 0,
      transaksiSelesai: 0,
      transaksiPending: 0,
      transaksiDibatalkan: 0,
      mobilTerbeli: 0,
      testDriveSelesai: 0,
      rataRataNilaiTransaksi: 0,
      bulanTerakhir: {
        jumlahTransaksi: 0,
        nilaiTransaksi: 0
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
   * Clear all cache
   */
  public clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}

export default KontrollerRiwayat;
