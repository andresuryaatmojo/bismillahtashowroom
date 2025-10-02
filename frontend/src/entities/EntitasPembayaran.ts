/**
 * EntitasPembayaran - Kelas untuk mengelola data dan operasi pembayaran
 * Menangani proses pembayaran, validasi, dan integrasi dengan gateway pembayaran
 */

export interface IEntitasPembayaran {
  idPembayaran: string;
  idTransaksi: string;
  metodePembayaran: string;
  jumlahPembayaran: number;
  statusPembayaran: string;
  tanggalPembayaran: Date;
  nomorReferensi: string;
  biayaAdmin: number;
  keterangan: string;
}

export interface IPembayaranFilter {
  idTransaksi?: string;
  metodePembayaran?: string;
  statusPembayaran?: string;
  tanggalMulai?: Date;
  tanggalAkhir?: Date;
  jumlahMinimal?: number;
  jumlahMaksimal?: number;
}

export interface IPembayaranGateway {
  gatewayId: string;
  gatewayName: string;
  isActive: boolean;
  supportedMethods: string[];
  feePercentage: number;
  fixedFee: number;
  minAmount: number;
  maxAmount: number;
}

export interface IPembayaranValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface IPembayaranStatistik {
  totalPembayaran: number;
  totalBerhasil: number;
  totalGagal: number;
  totalPending: number;
  nilaiTotalBerhasil: number;
  nilaiTotalGagal: number;
  metodeTerpopuler: string;
  rataRataWaktuProses: number;
}

export interface IPembayaranNotifikasi {
  idNotifikasi: string;
  idPembayaran: string;
  tipeNotifikasi: string;
  judulNotifikasi: string;
  isiNotifikasi: string;
  tanggalNotifikasi: Date;
  statusKirim: boolean;
  channel: string;
}

export class EntitasPembayaran implements IEntitasPembayaran {
  // Attributes
  public idPembayaran: string;
  public idTransaksi: string;
  public metodePembayaran: string;
  public jumlahPembayaran: number;
  public statusPembayaran: string;
  public tanggalPembayaran: Date;
  public nomorReferensi: string;
  public biayaAdmin: number;
  public keterangan: string;

  constructor(data: Partial<IEntitasPembayaran> = {}) {
    this.idPembayaran = data.idPembayaran || this.generateId();
    this.idTransaksi = data.idTransaksi || '';
    this.metodePembayaran = data.metodePembayaran || '';
    this.jumlahPembayaran = data.jumlahPembayaran || 0;
    this.statusPembayaran = data.statusPembayaran || 'PENDING';
    this.tanggalPembayaran = data.tanggalPembayaran || new Date();
    this.nomorReferensi = data.nomorReferensi || this.generateReferenceNumber();
    this.biayaAdmin = data.biayaAdmin || 0;
    this.keterangan = data.keterangan || '';
  }

  // Main Methods

  /**
   * Memproses pembayaran melalui gateway yang dipilih
   * @param metodePembayaran - Metode pembayaran yang dipilih
   * @param jumlah - Jumlah yang akan dibayar
   * @param dataCustomer - Data customer untuk pembayaran
   * @returns Promise<IEntitasPembayaran> - Data pembayaran yang telah diproses
   */
  public async prosesPembayaran(metodePembayaran: string, jumlah: number, dataCustomer: any): Promise<IEntitasPembayaran> {
    try {
      console.log(`[EntitasPembayaran] Memproses pembayaran ${metodePembayaran} sebesar ${jumlah}...`);
      
      await this.simulateDelay(300);
      
      // Validasi input pembayaran
      await this.validatePembayaranInput(metodePembayaran, jumlah, dataCustomer);
      
      // Pilih gateway pembayaran
      const gateway = await this.selectPaymentGateway(metodePembayaran, jumlah);
      
      // Hitung biaya admin
      const biayaAdmin = await this.calculateAdminFee(gateway, jumlah);
      const totalAmount = jumlah + biayaAdmin;
      
      // Buat record pembayaran
      const pembayaran = new EntitasPembayaran({
        idTransaksi: dataCustomer.idTransaksi,
        metodePembayaran,
        jumlahPembayaran: totalAmount,
        statusPembayaran: 'PROCESSING',
        biayaAdmin,
        keterangan: `Pembayaran via ${metodePembayaran}`
      });
      
      // Validasi dengan gateway
      const gatewayValidation = await this.validateWithGateway(gateway, pembayaran, dataCustomer);
      
      if (!gatewayValidation.isValid) {
        pembayaran.statusPembayaran = 'FAILED';
        pembayaran.keterangan = `Gagal: ${gatewayValidation.errors.join(', ')}`;
        
        await this.savePembayaran(pembayaran);
        await this.sendFailureNotification(pembayaran, gatewayValidation.errors);
        
        throw new Error(`Pembayaran gagal: ${gatewayValidation.errors.join(', ')}`);
      }
      
      // Proses dengan gateway
      const gatewayResponse = await this.processWithGateway(gateway, pembayaran, dataCustomer);
      
      // Update status berdasarkan response gateway
      pembayaran.statusPembayaran = gatewayResponse.status;
      pembayaran.nomorReferensi = gatewayResponse.referenceNumber;
      pembayaran.keterangan = gatewayResponse.message;
      
      // Simpan ke database
      await this.savePembayaran(pembayaran);
      
      // Update statistik
      await this.updatePembayaranStatistics(pembayaran);
      
      // Kirim notifikasi
      await this.sendPembayaranNotification(pembayaran, dataCustomer);
      
      // Log aktivitas
      await this.logPembayaranActivity('PROCESS', pembayaran.idPembayaran, {
        gateway: gateway.gatewayName,
        amount: totalAmount,
        status: pembayaran.statusPembayaran
      });
      
      // Generate insights
      await this.generatePembayaranInsights(pembayaran, gateway, gatewayResponse);
      
      console.log('[EntitasPembayaran] Pembayaran berhasil diproses:', pembayaran);
      return pembayaran;
      
    } catch (error) {
      console.error('[EntitasPembayaran] Error memproses pembayaran:', error);
      await this.handlePembayaranError(error as Error);
      throw error;
    }
  }

  /**
   * Memvalidasi data pembayaran sebelum diproses
   * @param idPembayaran - ID pembayaran yang akan divalidasi
   * @param dataValidasi - Data tambahan untuk validasi
   * @returns Promise<IPembayaranValidation> - Hasil validasi pembayaran
   */
  public async validasiPembayaran(idPembayaran: string, dataValidasi?: any): Promise<IPembayaranValidation> {
    try {
      console.log(`[EntitasPembayaran] Memvalidasi pembayaran ${idPembayaran}...`);
      
      await this.simulateDelay(200);
      
      const validation: IPembayaranValidation = {
        isValid: true,
        errors: [],
        warnings: [],
        recommendations: []
      };
      
      // Ambil data pembayaran
      const pembayaran = await this.getPembayaranById(idPembayaran);
      if (!pembayaran) {
        validation.isValid = false;
        validation.errors.push('Pembayaran tidak ditemukan');
        return validation;
      }
      
      // Validasi status pembayaran
      await this.validatePembayaranStatus(pembayaran, validation);
      
      // Validasi jumlah pembayaran
      await this.validatePembayaranAmount(pembayaran, validation);
      
      // Validasi metode pembayaran
      await this.validatePaymentMethod(pembayaran, validation);
      
      // Validasi dengan gateway
      await this.validateGatewayCompatibility(pembayaran, validation);
      
      // Validasi transaksi terkait
      await this.validateRelatedTransaction(pembayaran, validation, dataValidasi);
      
      // Validasi keamanan
      await this.validateSecurity(pembayaran, validation, dataValidasi);
      
      // Validasi compliance
      await this.validateCompliance(pembayaran, validation);
      
      // Generate recommendations
      await this.generateValidationRecommendations(pembayaran, validation);
      
      // Update validation cache
      await this.updateValidationCache(idPembayaran, validation);
      
      // Log validation activity
      await this.logPembayaranActivity('VALIDATE', idPembayaran, {
        isValid: validation.isValid,
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length
      });
      
      console.log('[EntitasPembayaran] Validasi selesai:', validation);
      return validation;
      
    } catch (error) {
      console.error('[EntitasPembayaran] Error validasi pembayaran:', error);
      await this.handlePembayaranError(error as Error);
      
      return {
        isValid: false,
        errors: [`Error validasi: ${(error as Error).message}`],
        warnings: [],
        recommendations: []
      };
    }
  }

  /**
   * Mengambil status pembayaran terkini dari gateway
   * @param idPembayaran - ID pembayaran yang akan dicek
   * @param forceRefresh - Paksa refresh dari gateway (tidak dari cache)
   * @returns Promise<string> - Status pembayaran terkini
   */
  public async cekStatusPembayaran(idPembayaran: string, forceRefresh: boolean = false): Promise<string> {
    try {
      console.log(`[EntitasPembayaran] Mengecek status pembayaran ${idPembayaran}...`);
      
      await this.simulateDelay(150);
      
      // Ambil data pembayaran
      const pembayaran = await this.getPembayaranById(idPembayaran);
      if (!pembayaran) {
        throw new Error('Pembayaran tidak ditemukan');
      }
      
      // Cek cache jika tidak force refresh
      if (!forceRefresh) {
        const cachedStatus = await this.getCachedStatus(idPembayaran);
        if (cachedStatus && this.isCacheValid(cachedStatus.timestamp)) {
          console.log('[EntitasPembayaran] Status dari cache:', cachedStatus.status);
          return cachedStatus.status;
        }
      }
      
      // Ambil gateway yang digunakan
      const gateway = await this.getGatewayByMethod(pembayaran.metodePembayaran);
      if (!gateway) {
        throw new Error(`Gateway untuk ${pembayaran.metodePembayaran} tidak ditemukan`);
      }
      
      // Query status dari gateway
      const gatewayStatus = await this.queryGatewayStatus(gateway, pembayaran);
      
      // Update status jika berbeda
      if (gatewayStatus !== pembayaran.statusPembayaran) {
        await this.updatePembayaranStatus(idPembayaran, gatewayStatus);
        
        // Kirim notifikasi jika status berubah
        await this.sendStatusChangeNotification(pembayaran, gatewayStatus);
        
        // Update statistik
        await this.updateStatusChangeStatistics(pembayaran.statusPembayaran, gatewayStatus);
      }
      
      // Update cache
      await this.updateStatusCache(idPembayaran, gatewayStatus);
      
      // Generate status insights
      await this.generateStatusInsights(pembayaran, gatewayStatus, gateway);
      
      // Log status check activity
      await this.logPembayaranActivity('CHECK_STATUS', idPembayaran, {
        oldStatus: pembayaran.statusPembayaran,
        newStatus: gatewayStatus,
        gateway: gateway.gatewayName,
        forceRefresh
      });
      
      console.log(`[EntitasPembayaran] Status pembayaran: ${gatewayStatus}`);
      return gatewayStatus;
      
    } catch (error) {
      console.error('[EntitasPembayaran] Error cek status pembayaran:', error);
      await this.handlePembayaranError(error as Error);
      throw error;
    }
  }

  /**
   * Membatalkan pembayaran yang masih dalam status pending
   * @param idPembayaran - ID pembayaran yang akan dibatalkan
   * @param alasanPembatalan - Alasan pembatalan
   * @returns Promise<boolean> - Status berhasil/gagal pembatalan
   */
  public async batalkanPembayaran(idPembayaran: string, alasanPembatalan: string): Promise<boolean> {
    try {
      console.log(`[EntitasPembayaran] Membatalkan pembayaran ${idPembayaran}...`);
      
      await this.simulateDelay(250);
      
      // Ambil data pembayaran
      const pembayaran = await this.getPembayaranById(idPembayaran);
      if (!pembayaran) {
        throw new Error('Pembayaran tidak ditemukan');
      }
      
      // Validasi apakah pembayaran bisa dibatalkan
      await this.validateCancellation(pembayaran);
      
      // Ambil gateway yang digunakan
      const gateway = await this.getGatewayByMethod(pembayaran.metodePembayaran);
      if (!gateway) {
        throw new Error(`Gateway untuk ${pembayaran.metodePembayaran} tidak ditemukan`);
      }
      
      // Proses pembatalan di gateway
      const cancellationResult = await this.processCancellationWithGateway(gateway, pembayaran, alasanPembatalan);
      
      if (cancellationResult.success) {
        // Update status pembayaran
        await this.updatePembayaranStatus(idPembayaran, 'CANCELLED');
        
        // Update keterangan
        await this.updatePembayaranKeterangan(idPembayaran, `Dibatalkan: ${alasanPembatalan}`);
        
        // Proses refund jika diperlukan
        if (pembayaran.statusPembayaran === 'SUCCESS') {
          await this.processRefund(pembayaran, alasanPembatalan);
        }
        
        // Update statistik
        await this.updateCancellationStatistics(pembayaran);
        
        // Kirim notifikasi pembatalan
        await this.sendCancellationNotification(pembayaran, alasanPembatalan);
        
        // Generate cancellation insights
        await this.generateCancellationInsights(pembayaran, alasanPembatalan, cancellationResult);
        
        // Log cancellation activity
        await this.logPembayaranActivity('CANCEL', idPembayaran, {
          reason: alasanPembatalan,
          gateway: gateway.gatewayName,
          originalStatus: pembayaran.statusPembayaran
        });
        
        console.log('[EntitasPembayaran] Pembayaran berhasil dibatalkan');
        return true;
      } else {
        console.log('[EntitasPembayaran] Pembatalan gagal:', cancellationResult.message);
        
        // Log failed cancellation
        await this.logPembayaranActivity('CANCEL_FAILED', idPembayaran, {
          reason: alasanPembatalan,
          error: cancellationResult.message
        });
        
        return false;
      }
      
    } catch (error) {
      console.error('[EntitasPembayaran] Error membatalkan pembayaran:', error);
      await this.handlePembayaranError(error as Error);
      return false;
    }
  }

  /**
   * Memproses refund untuk pembayaran yang sudah berhasil
   * @param idPembayaran - ID pembayaran yang akan direfund
   * @param jumlahRefund - Jumlah yang akan direfund (opsional, default full refund)
   * @param alasanRefund - Alasan refund
   * @returns Promise<boolean> - Status berhasil/gagal refund
   */
  public async prosesRefund(idPembayaran: string, jumlahRefund?: number, alasanRefund?: string): Promise<boolean> {
    try {
      console.log(`[EntitasPembayaran] Memproses refund untuk pembayaran ${idPembayaran}...`);
      
      await this.simulateDelay(400);
      
      // Ambil data pembayaran
      const pembayaran = await this.getPembayaranById(idPembayaran);
      if (!pembayaran) {
        throw new Error('Pembayaran tidak ditemukan');
      }
      
      // Validasi apakah pembayaran bisa direfund
      await this.validateRefund(pembayaran, jumlahRefund);
      
      // Set jumlah refund (default full refund)
      const refundAmount = jumlahRefund || pembayaran.jumlahPembayaran;
      
      // Ambil gateway yang digunakan
      const gateway = await this.getGatewayByMethod(pembayaran.metodePembayaran);
      if (!gateway) {
        throw new Error(`Gateway untuk ${pembayaran.metodePembayaran} tidak ditemukan`);
      }
      
      // Cek apakah gateway support refund
      if (!gateway.supportedMethods.includes('REFUND')) {
        throw new Error(`Gateway ${gateway.gatewayName} tidak mendukung refund`);
      }
      
      // Proses refund di gateway
      const refundResult = await this.processRefundWithGateway(gateway, pembayaran, refundAmount, alasanRefund);
      
      if (refundResult.success) {
        // Buat record refund
        const refundRecord = await this.createRefundRecord(pembayaran, refundAmount, alasanRefund, refundResult);
        
        // Update status pembayaran
        const newStatus = refundAmount === pembayaran.jumlahPembayaran ? 'REFUNDED' : 'PARTIAL_REFUNDED';
        await this.updatePembayaranStatus(idPembayaran, newStatus);
        
        // Update keterangan
        const keterangan = `Refund ${refundAmount === pembayaran.jumlahPembayaran ? 'penuh' : 'sebagian'}: ${alasanRefund || 'Tidak ada alasan'}`;
        await this.updatePembayaranKeterangan(idPembayaran, keterangan);
        
        // Update statistik
        await this.updateRefundStatistics(pembayaran, refundAmount);
        
        // Kirim notifikasi refund
        await this.sendRefundNotification(pembayaran, refundAmount, alasanRefund);
        
        // Generate refund insights
        await this.generateRefundInsights(pembayaran, refundAmount, alasanRefund, refundResult);
        
        // Log refund activity
        await this.logPembayaranActivity('REFUND', idPembayaran, {
          amount: refundAmount,
          reason: alasanRefund,
          gateway: gateway.gatewayName,
          refundId: refundResult.refundId
        });
        
        console.log('[EntitasPembayaran] Refund berhasil diproses');
        return true;
      } else {
        console.log('[EntitasPembayaran] Refund gagal:', refundResult.message);
        
        // Log failed refund
        await this.logPembayaranActivity('REFUND_FAILED', idPembayaran, {
          amount: refundAmount,
          reason: alasanRefund,
          error: refundResult.message
        });
        
        return false;
      }
      
    } catch (error) {
      console.error('[EntitasPembayaran] Error memproses refund:', error);
      await this.handlePembayaranError(error as Error);
      return false;
    }
  }

  /**
   * Mengambil riwayat pembayaran berdasarkan filter tertentu
   * @param filter - Filter untuk pencarian riwayat
   * @param sortBy - Kriteria pengurutan
   * @param limit - Jumlah maksimal hasil
   * @returns Promise<IEntitasPembayaran[]> - Array riwayat pembayaran
   */
  public async ambilRiwayatPembayaran(filter: IPembayaranFilter = {}, sortBy: string = 'tanggal', limit: number = 100): Promise<IEntitasPembayaran[]> {
    try {
      console.log('[EntitasPembayaran] Mengambil riwayat pembayaran dengan filter:', filter);
      
      await this.simulateDelay(200);
      
      // Validasi filter
      await this.validateHistoryFilter(filter);
      
      // Fetch all pembayaran from database
      const allPembayaran = await this.fetchAllPembayaran();
      
      // Apply filters
      let filteredPembayaran = await this.applyHistoryFilters(allPembayaran, filter);
      
      // Sort results
      filteredPembayaran = await this.sortPembayaran(filteredPembayaran, sortBy);
      
      // Limit results
      filteredPembayaran = filteredPembayaran.slice(0, limit);
      
      // Enrich with additional data
      filteredPembayaran = await this.enrichPembayaranData(filteredPembayaran);
      
      // Update search analytics
      await this.updateHistorySearchAnalytics(filter, filteredPembayaran.length);
      
      // Generate search insights
      await this.generateHistorySearchInsights(filter, filteredPembayaran);
      
      // Log history search activity
      await this.logPembayaranActivity('SEARCH_HISTORY', '', {
        filter,
        resultCount: filteredPembayaran.length,
        sortBy
      });
      
      console.log(`[EntitasPembayaran] Ditemukan ${filteredPembayaran.length} riwayat pembayaran`);
      return filteredPembayaran;
      
    } catch (error) {
      console.error('[EntitasPembayaran] Error mengambil riwayat pembayaran:', error);
      await this.handlePembayaranError(error as Error);
      throw error;
    }
  }

  // Helper Methods
  private generateId(): string {
    return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReferenceNumber(): string {
    return `REF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async validatePembayaranInput(metodePembayaran: string, jumlah: number, dataCustomer: any): Promise<void> {
    try {
      const errors: string[] = [];
      
      if (!metodePembayaran || metodePembayaran.trim().length === 0) {
        errors.push('Metode pembayaran harus diisi');
      }
      
      if (!jumlah || jumlah <= 0) {
        errors.push('Jumlah pembayaran harus lebih besar dari 0');
      }
      
      if (jumlah > 10000000000) { // 10 miliar
        errors.push('Jumlah pembayaran terlalu besar');
      }
      
      if (!dataCustomer || !dataCustomer.idTransaksi) {
        errors.push('Data customer dan ID transaksi harus diisi');
      }
      
      // Validasi metode pembayaran yang didukung
      const supportedMethods = ['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'E_WALLET', 'VIRTUAL_ACCOUNT', 'CASH'];
      if (!supportedMethods.includes(metodePembayaran)) {
        errors.push(`Metode pembayaran ${metodePembayaran} tidak didukung`);
      }
      
      if (errors.length > 0) {
        throw new Error(`Validation errors: ${errors.join(', ')}`);
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] Input validation error:', error);
      throw error;
    }
  }

  private async selectPaymentGateway(metodePembayaran: string, jumlah: number): Promise<IPembayaranGateway> {
    try {
      // Simulasi pemilihan gateway berdasarkan metode dan jumlah
      const gateways: IPembayaranGateway[] = [
        {
          gatewayId: 'MIDTRANS',
          gatewayName: 'Midtrans',
          isActive: true,
          supportedMethods: ['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'E_WALLET'],
          feePercentage: 2.9,
          fixedFee: 2000,
          minAmount: 10000,
          maxAmount: 500000000
        },
        {
          gatewayId: 'XENDIT',
          gatewayName: 'Xendit',
          isActive: true,
          supportedMethods: ['VIRTUAL_ACCOUNT', 'E_WALLET', 'BANK_TRANSFER'],
          feePercentage: 2.5,
          fixedFee: 3000,
          minAmount: 10000,
          maxAmount: 1000000000
        },
        {
          gatewayId: 'DOKU',
          gatewayName: 'DOKU',
          isActive: true,
          supportedMethods: ['CREDIT_CARD', 'VIRTUAL_ACCOUNT', 'BANK_TRANSFER'],
          feePercentage: 3.0,
          fixedFee: 2500,
          minAmount: 5000,
          maxAmount: 300000000
        }
      ];
      
      // Filter gateway yang mendukung metode pembayaran
      const compatibleGateways = gateways.filter(gateway => 
        gateway.isActive && 
        gateway.supportedMethods.includes(metodePembayaran) &&
        jumlah >= gateway.minAmount &&
        jumlah <= gateway.maxAmount
      );
      
      if (compatibleGateways.length === 0) {
        throw new Error(`Tidak ada gateway yang mendukung ${metodePembayaran} untuk jumlah ${jumlah}`);
      }
      
      // Pilih gateway dengan fee terendah
      const selectedGateway = compatibleGateways.reduce((prev, current) => {
        const prevFee = (jumlah * prev.feePercentage / 100) + prev.fixedFee;
        const currentFee = (jumlah * current.feePercentage / 100) + current.fixedFee;
        return currentFee < prevFee ? current : prev;
      });
      
      console.log('[EntitasPembayaran] Gateway terpilih:', selectedGateway.gatewayName);
      await this.simulateDelay(100);
      
      return selectedGateway;
    } catch (error) {
      console.error('[EntitasPembayaran] Error selecting gateway:', error);
      throw error;
    }
  }

  private async calculateAdminFee(gateway: IPembayaranGateway, jumlah: number): Promise<number> {
    try {
      const percentageFee = (jumlah * gateway.feePercentage) / 100;
      const totalFee = percentageFee + gateway.fixedFee;
      
      console.log(`[EntitasPembayaran] Biaya admin: ${totalFee} (${gateway.feePercentage}% + ${gateway.fixedFee})`);
      await this.simulateDelay(50);
      
      return Math.round(totalFee);
    } catch (error) {
      console.error('[EntitasPembayaran] Error calculating admin fee:', error);
      return 0;
    }
  }

  private async validateWithGateway(gateway: IPembayaranGateway, pembayaran: IEntitasPembayaran, dataCustomer: any): Promise<IPembayaranValidation> {
    try {
      console.log(`[EntitasPembayaran] Validating with gateway ${gateway.gatewayName}...`);
      
      const validation: IPembayaranValidation = {
        isValid: true,
        errors: [],
        warnings: [],
        recommendations: []
      };
      
      // Simulasi validasi gateway
      const validationSuccess = Math.random() < 0.95; // 95% success rate
      
      if (!validationSuccess) {
        validation.isValid = false;
        validation.errors.push('Gateway validation failed');
      }
      
      // Validasi jumlah minimum dan maksimum
      if (pembayaran.jumlahPembayaran < gateway.minAmount) {
        validation.isValid = false;
        validation.errors.push(`Jumlah minimum ${gateway.minAmount}`);
      }
      
      if (pembayaran.jumlahPembayaran > gateway.maxAmount) {
        validation.isValid = false;
        validation.errors.push(`Jumlah maksimum ${gateway.maxAmount}`);
      }
      
      // Validasi data customer
      if (!dataCustomer.email || !dataCustomer.phone) {
        validation.warnings.push('Data customer tidak lengkap');
      }
      
      await this.simulateDelay(200);
      return validation;
    } catch (error) {
      console.error('[EntitasPembayaran] Error validating with gateway:', error);
      return {
        isValid: false,
        errors: [`Gateway validation error: ${(error as Error).message}`],
        warnings: [],
        recommendations: []
      };
    }
  }

  private async processWithGateway(gateway: IPembayaranGateway, pembayaran: IEntitasPembayaran, dataCustomer: any): Promise<any> {
    try {
      console.log(`[EntitasPembayaran] Processing with gateway ${gateway.gatewayName}...`);
      
      // Simulasi proses dengan gateway
      await this.simulateDelay(500);
      
      const success = Math.random() < 0.90; // 90% success rate
      
      if (success) {
        return {
          status: 'SUCCESS',
          referenceNumber: this.generateReferenceNumber(),
          message: 'Pembayaran berhasil diproses',
          transactionId: `TXN-${Date.now()}`,
          gatewayResponse: {
            code: '00',
            message: 'Success'
          }
        };
      } else {
        return {
          status: 'FAILED',
          referenceNumber: pembayaran.nomorReferensi,
          message: 'Pembayaran gagal diproses',
          transactionId: null,
          gatewayResponse: {
            code: '05',
            message: 'Transaction declined'
          }
        };
      }
    } catch (error) {
      console.error('[EntitasPembayaran] Error processing with gateway:', error);
      return {
        status: 'ERROR',
        referenceNumber: pembayaran.nomorReferensi,
        message: `Gateway error: ${(error as Error).message}`,
        transactionId: null,
        gatewayResponse: null
      };
    }
  }

  private async savePembayaran(pembayaran: IEntitasPembayaran): Promise<void> {
    try {
      console.log('[EntitasPembayaran] Saving pembayaran to database:', pembayaran);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasPembayaran] Error saving pembayaran:', error);
      throw error;
    }
  }

  private async getPembayaranById(idPembayaran: string): Promise<IEntitasPembayaran | null> {
    try {
      // Simulasi fetch dari database
      const allPembayaran = await this.fetchAllPembayaran();
      return allPembayaran.find(p => p.idPembayaran === idPembayaran) || null;
    } catch (error) {
      console.error('[EntitasPembayaran] Error getting pembayaran by ID:', error);
      return null;
    }
  }

  private async fetchAllPembayaran(): Promise<IEntitasPembayaran[]> {
    try {
      console.log('[EntitasPembayaran] Fetching all pembayaran...');
      
      // Simulasi data pembayaran
      const pembayaranList: IEntitasPembayaran[] = [];
      const methods = ['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'E_WALLET', 'VIRTUAL_ACCOUNT'];
      const statuses = ['SUCCESS', 'FAILED', 'PENDING', 'CANCELLED', 'REFUNDED'];
      
      // Generate 100-200 sample pembayaran
      const pembayaranCount = Math.floor(Math.random() * 100) + 100;
      
      for (let i = 0; i < pembayaranCount; i++) {
        const method = methods[Math.floor(Math.random() * methods.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const amount = Math.floor(Math.random() * 500000000) + 50000; // 50K - 500M
        const adminFee = Math.floor(amount * 0.029) + 2000; // ~2.9% + 2000
        const date = new Date(Date.now() - Math.random() * 31536000000); // 0-1 tahun lalu
        
        const pembayaran: IEntitasPembayaran = {
          idPembayaran: this.generateId(),
          idTransaksi: `TXN-${i + 1}`,
          metodePembayaran: method,
          jumlahPembayaran: amount + adminFee,
          statusPembayaran: status,
          tanggalPembayaran: date,
          nomorReferensi: this.generateReferenceNumber(),
          biayaAdmin: adminFee,
          keterangan: `Pembayaran via ${method}`
        };
        
        pembayaranList.push(pembayaran);
      }
      
      await this.simulateDelay(300);
      return pembayaranList;
      
    } catch (error) {
      console.error('[EntitasPembayaran] Error fetching pembayaran:', error);
      return [];
    }
  }

  // Additional validation methods
  private async validatePembayaranStatus(pembayaran: IEntitasPembayaran, validation: IPembayaranValidation): Promise<void> {
    try {
      const validStatuses = ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED', 'PARTIAL_REFUNDED'];
      
      if (!validStatuses.includes(pembayaran.statusPembayaran)) {
        validation.isValid = false;
        validation.errors.push(`Status pembayaran tidak valid: ${pembayaran.statusPembayaran}`);
      }
      
      // Validasi transisi status
      if (pembayaran.statusPembayaran === 'SUCCESS' && pembayaran.tanggalPembayaran > new Date()) {
        validation.warnings.push('Tanggal pembayaran di masa depan untuk status SUCCESS');
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] Error validating status:', error);
      validation.errors.push('Error validasi status');
    }
  }

  private async validatePembayaranAmount(pembayaran: IEntitasPembayaran, validation: IPembayaranValidation): Promise<void> {
    try {
      if (pembayaran.jumlahPembayaran <= 0) {
        validation.isValid = false;
        validation.errors.push('Jumlah pembayaran harus lebih besar dari 0');
      }
      
      if (pembayaran.biayaAdmin < 0) {
        validation.isValid = false;
        validation.errors.push('Biaya admin tidak boleh negatif');
      }
      
      if (pembayaran.biayaAdmin > pembayaran.jumlahPembayaran * 0.1) {
        validation.warnings.push('Biaya admin terlalu tinggi (>10% dari total)');
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] Error validating amount:', error);
      validation.errors.push('Error validasi jumlah');
    }
  }

  private async validatePaymentMethod(pembayaran: IEntitasPembayaran, validation: IPembayaranValidation): Promise<void> {
    try {
      const supportedMethods = ['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'E_WALLET', 'VIRTUAL_ACCOUNT', 'CASH'];
      
      if (!supportedMethods.includes(pembayaran.metodePembayaran)) {
        validation.isValid = false;
        validation.errors.push(`Metode pembayaran tidak didukung: ${pembayaran.metodePembayaran}`);
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] Error validating payment method:', error);
      validation.errors.push('Error validasi metode pembayaran');
    }
  }

  private async validateGatewayCompatibility(pembayaran: IEntitasPembayaran, validation: IPembayaranValidation): Promise<void> {
    try {
      const gateway = await this.getGatewayByMethod(pembayaran.metodePembayaran);
      
      if (!gateway) {
        validation.isValid = false;
        validation.errors.push(`Gateway tidak ditemukan untuk metode ${pembayaran.metodePembayaran}`);
        return;
      }
      
      if (!gateway.isActive) {
        validation.isValid = false;
        validation.errors.push(`Gateway ${gateway.gatewayName} sedang tidak aktif`);
      }
      
      if (pembayaran.jumlahPembayaran < gateway.minAmount || pembayaran.jumlahPembayaran > gateway.maxAmount) {
        validation.isValid = false;
        validation.errors.push(`Jumlah pembayaran di luar batas gateway (${gateway.minAmount} - ${gateway.maxAmount})`);
      }
      
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasPembayaran] Error validating gateway compatibility:', error);
      validation.errors.push('Error validasi kompatibilitas gateway');
    }
  }

  private async validateRelatedTransaction(pembayaran: IEntitasPembayaran, validation: IPembayaranValidation, dataValidasi?: any): Promise<void> {
    try {
      if (!pembayaran.idTransaksi) {
        validation.isValid = false;
        validation.errors.push('ID transaksi harus diisi');
        return;
      }
      
      // Simulasi validasi transaksi terkait
      const transactionExists = Math.random() < 0.95; // 95% chance transaction exists
      
      if (!transactionExists) {
        validation.isValid = false;
        validation.errors.push(`Transaksi ${pembayaran.idTransaksi} tidak ditemukan`);
      }
      
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasPembayaran] Error validating related transaction:', error);
      validation.errors.push('Error validasi transaksi terkait');
    }
  }

  private async validateSecurity(pembayaran: IEntitasPembayaran, validation: IPembayaranValidation, dataValidasi?: any): Promise<void> {
    try {
      // Validasi keamanan dasar
      if (!pembayaran.nomorReferensi || pembayaran.nomorReferensi.length < 10) {
        validation.warnings.push('Nomor referensi terlalu pendek');
      }
      
      // Simulasi deteksi fraud
      const suspiciousActivity = Math.random() < 0.05; // 5% chance of suspicious activity
      
      if (suspiciousActivity) {
        validation.warnings.push('Aktivitas mencurigakan terdeteksi');
        validation.recommendations.push('Lakukan verifikasi tambahan');
      }
      
      await this.simulateDelay(150);
    } catch (error) {
      console.error('[EntitasPembayaran] Error validating security:', error);
      validation.warnings.push('Error validasi keamanan');
    }
  }

  private async validateCompliance(pembayaran: IEntitasPembayaran, validation: IPembayaranValidation): Promise<void> {
    try {
      // Validasi compliance dasar
      if (pembayaran.jumlahPembayaran > 100000000) { // > 100 juta
        validation.recommendations.push('Pembayaran besar, pertimbangkan verifikasi tambahan');
      }
      
      // Simulasi compliance check
      const complianceIssue = Math.random() < 0.02; // 2% chance of compliance issue
      
      if (complianceIssue) {
        validation.warnings.push('Potensi masalah compliance terdeteksi');
      }
      
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasPembayaran] Error validating compliance:', error);
      validation.warnings.push('Error validasi compliance');
    }
  }

  private async generateValidationRecommendations(pembayaran: IEntitasPembayaran, validation: IPembayaranValidation): Promise<void> {
    try {
      if (validation.errors.length > 0) {
        validation.recommendations.push('Perbaiki error sebelum melanjutkan');
      }
      
      if (validation.warnings.length > 0) {
        validation.recommendations.push('Tinjau warning yang ada');
      }
      
      if (pembayaran.statusPembayaran === 'PENDING') {
        validation.recommendations.push('Monitor status pembayaran secara berkala');
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] Error generating recommendations:', error);
    }
  }

  private async getGatewayByMethod(metodePembayaran: string): Promise<IPembayaranGateway | null> {
    try {
      // Simulasi mapping metode ke gateway
      const gatewayMapping: Record<string, IPembayaranGateway> = {
        'CREDIT_CARD': {
          gatewayId: 'MIDTRANS',
          gatewayName: 'Midtrans',
          isActive: true,
          supportedMethods: ['CREDIT_CARD', 'DEBIT_CARD'],
          feePercentage: 2.9,
          fixedFee: 2000,
          minAmount: 10000,
          maxAmount: 500000000
        },
        'E_WALLET': {
          gatewayId: 'XENDIT',
          gatewayName: 'Xendit',
          isActive: true,
          supportedMethods: ['E_WALLET', 'VIRTUAL_ACCOUNT'],
          feePercentage: 2.5,
          fixedFee: 3000,
          minAmount: 10000,
          maxAmount: 1000000000
        }
      };
      
      return gatewayMapping[metodePembayaran] || null;
    } catch (error) {
      console.error('[EntitasPembayaran] Error getting gateway by method:', error);
      return null;
    }
  }

  // Status management methods
  private async getCachedStatus(idPembayaran: string): Promise<any> {
    try {
      // Simulasi cache status
      const cached = {
        status: 'SUCCESS',
        timestamp: new Date(Date.now() - Math.random() * 300000) // 0-5 menit lalu
      };
      
      return cached;
    } catch (error) {
      console.error('[EntitasPembayaran] Error getting cached status:', error);
      return null;
    }
  }

  private isCacheValid(timestamp: Date): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return timestamp > fiveMinutesAgo;
  }

  private async queryGatewayStatus(gateway: IPembayaranGateway, pembayaran: IEntitasPembayaran): Promise<string> {
    try {
      console.log(`[EntitasPembayaran] Querying status from ${gateway.gatewayName}...`);
      
      // Simulasi query ke gateway
      await this.simulateDelay(300);
      
      const statuses = ['SUCCESS', 'FAILED', 'PENDING', 'PROCESSING'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      return randomStatus;
    } catch (error) {
      console.error('[EntitasPembayaran] Error querying gateway status:', error);
      return 'ERROR';
    }
  }

  private async updatePembayaranStatus(idPembayaran: string, newStatus: string): Promise<void> {
    try {
      console.log(`[EntitasPembayaran] Updating status ${idPembayaran} to ${newStatus}`);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasPembayaran] Error updating status:', error);
      throw error;
    }
  }

  private async updatePembayaranKeterangan(idPembayaran: string, keterangan: string): Promise<void> {
    try {
      console.log(`[EntitasPembayaran] Updating keterangan ${idPembayaran}: ${keterangan}`);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] Error updating keterangan:', error);
      throw error;
    }
  }

  private async updateStatusCache(idPembayaran: string, status: string): Promise<void> {
    try {
      const cacheEntry = {
        idPembayaran,
        status,
        timestamp: new Date()
      };
      
      console.log('[EntitasPembayaran] Status cache updated:', cacheEntry);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] Error updating status cache:', error);
    }
  }

  // Cancellation methods
  private async validateCancellation(pembayaran: IEntitasPembayaran): Promise<void> {
    try {
      const cancellableStatuses = ['PENDING', 'PROCESSING'];
      
      if (!cancellableStatuses.includes(pembayaran.statusPembayaran)) {
        throw new Error(`Pembayaran dengan status ${pembayaran.statusPembayaran} tidak dapat dibatalkan`);
      }
      
      // Cek apakah sudah lewat batas waktu pembatalan
      const timeDiff = Date.now() - pembayaran.tanggalPembayaran.getTime();
      const maxCancellationTime = 24 * 60 * 60 * 1000; // 24 jam
      
      if (timeDiff > maxCancellationTime) {
        throw new Error('Batas waktu pembatalan telah terlewati');
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] Cancellation validation error:', error);
      throw error;
    }
  }

  private async processCancellationWithGateway(gateway: IPembayaranGateway, pembayaran: IEntitasPembayaran, reason: string): Promise<any> {
    try {
      console.log(`[EntitasPembayaran] Processing cancellation with ${gateway.gatewayName}...`);
      
      // Simulasi proses pembatalan di gateway
      await this.simulateDelay(400);
      
      const success = Math.random() < 0.95; // 95% success rate
      
      if (success) {
        return {
          success: true,
          message: 'Pembayaran berhasil dibatalkan',
          cancellationId: `CANCEL-${Date.now()}`,
          refundAmount: pembayaran.statusPembayaran === 'SUCCESS' ? pembayaran.jumlahPembayaran : 0
        };
      } else {
        return {
          success: false,
          message: 'Gagal membatalkan pembayaran di gateway',
          cancellationId: null,
          refundAmount: 0
        };
      }
    } catch (error) {
      console.error('[EntitasPembayaran] Error processing cancellation with gateway:', error);
      return {
        success: false,
        message: `Gateway error: ${(error as Error).message}`,
        cancellationId: null,
        refundAmount: 0
      };
    }
  }

  // Refund methods
  private async validateRefund(pembayaran: IEntitasPembayaran, jumlahRefund?: number): Promise<void> {
    try {
      if (pembayaran.statusPembayaran !== 'SUCCESS') {
        throw new Error('Hanya pembayaran yang berhasil yang dapat direfund');
      }
      
      if (jumlahRefund && jumlahRefund > pembayaran.jumlahPembayaran) {
        throw new Error('Jumlah refund tidak boleh lebih besar dari jumlah pembayaran');
      }
      
      if (jumlahRefund && jumlahRefund <= 0) {
        throw new Error('Jumlah refund harus lebih besar dari 0');
      }
      
      // Cek apakah sudah pernah direfund
      const status = pembayaran.statusPembayaran as string;
      if (status === 'REFUNDED') {
        throw new Error('Pembayaran sudah pernah direfund');
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] Refund validation error:', error);
      throw error;
    }
  }

  private async processRefundWithGateway(gateway: IPembayaranGateway, pembayaran: IEntitasPembayaran, amount: number, reason?: string): Promise<any> {
    try {
      console.log(`[EntitasPembayaran] Processing refund with ${gateway.gatewayName}...`);
      
      // Simulasi proses refund di gateway
      await this.simulateDelay(500);
      
      const success = Math.random() < 0.92; // 92% success rate
      
      if (success) {
        return {
          success: true,
          message: 'Refund berhasil diproses',
          refundId: `REFUND-${Date.now()}`,
          amount: amount,
          estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 hari
        };
      } else {
        return {
          success: false,
          message: 'Gagal memproses refund di gateway',
          refundId: null,
          amount: 0,
          estimatedArrival: null
        };
      }
    } catch (error) {
      console.error('[EntitasPembayaran] Error processing refund with gateway:', error);
      return {
        success: false,
        message: `Gateway error: ${(error as Error).message}`,
        refundId: null,
        amount: 0,
        estimatedArrival: null
      };
    }
  }

  private async createRefundRecord(pembayaran: IEntitasPembayaran, amount: number, reason?: string, refundResult?: any): Promise<any> {
    try {
      const refundRecord = {
        idRefund: refundResult?.refundId || `REFUND-${Date.now()}`,
        idPembayaran: pembayaran.idPembayaran,
        jumlahRefund: amount,
        alasanRefund: reason || 'Tidak ada alasan',
        statusRefund: 'PROCESSING',
        tanggalRefund: new Date(),
        estimasiTiba: refundResult?.estimatedArrival || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      };
      
      console.log('[EntitasPembayaran] Refund record created:', refundRecord);
      await this.simulateDelay(100);
      
      return refundRecord;
    } catch (error) {
      console.error('[EntitasPembayaran] Error creating refund record:', error);
      throw error;
    }
  }

  // History and filtering methods
  private async validateHistoryFilter(filter: IPembayaranFilter): Promise<void> {
    try {
      if (filter.tanggalMulai && filter.tanggalAkhir && filter.tanggalMulai > filter.tanggalAkhir) {
        throw new Error('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
      }
      
      if (filter.jumlahMinimal && filter.jumlahMaksimal && filter.jumlahMinimal > filter.jumlahMaksimal) {
        throw new Error('Jumlah minimal tidak boleh lebih besar dari jumlah maksimal');
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] History filter validation error:', error);
      throw error;
    }
  }

  private async applyHistoryFilters(pembayaranList: IEntitasPembayaran[], filter: IPembayaranFilter): Promise<IEntitasPembayaran[]> {
    try {
      let filtered = [...pembayaranList];
      
      if (filter.idTransaksi) {
        filtered = filtered.filter(p => p.idTransaksi.includes(filter.idTransaksi!));
      }
      
      if (filter.metodePembayaran) {
        filtered = filtered.filter(p => p.metodePembayaran === filter.metodePembayaran);
      }
      
      if (filter.statusPembayaran) {
        filtered = filtered.filter(p => p.statusPembayaran === filter.statusPembayaran);
      }
      
      if (filter.tanggalMulai) {
        filtered = filtered.filter(p => p.tanggalPembayaran >= filter.tanggalMulai!);
      }
      
      if (filter.tanggalAkhir) {
        filtered = filtered.filter(p => p.tanggalPembayaran <= filter.tanggalAkhir!);
      }
      
      if (filter.jumlahMinimal) {
        filtered = filtered.filter(p => p.jumlahPembayaran >= filter.jumlahMinimal!);
      }
      
      if (filter.jumlahMaksimal) {
        filtered = filtered.filter(p => p.jumlahPembayaran <= filter.jumlahMaksimal!);
      }
      
      return filtered;
    } catch (error) {
      console.error('[EntitasPembayaran] Error applying history filters:', error);
      return pembayaranList;
    }
  }

  private async sortPembayaran(pembayaranList: IEntitasPembayaran[], sortBy: string): Promise<IEntitasPembayaran[]> {
    try {
      const sorted = [...pembayaranList];
      
      sorted.sort((a, b) => {
        switch (sortBy) {
          case 'tanggal':
            return b.tanggalPembayaran.getTime() - a.tanggalPembayaran.getTime();
          case 'jumlah':
            return b.jumlahPembayaran - a.jumlahPembayaran;
          case 'status':
            return a.statusPembayaran.localeCompare(b.statusPembayaran);
          case 'metode':
            return a.metodePembayaran.localeCompare(b.metodePembayaran);
          default:
            return b.tanggalPembayaran.getTime() - a.tanggalPembayaran.getTime();
        }
      });
      
      return sorted;
    } catch (error) {
      console.error('[EntitasPembayaran] Error sorting pembayaran:', error);
      return pembayaranList;
    }
  }

  private async enrichPembayaranData(pembayaranList: IEntitasPembayaran[]): Promise<IEntitasPembayaran[]> {
    try {
      // Simulasi enrichment dengan data tambahan
      return pembayaranList.map(pembayaran => ({
        ...pembayaran,
        // Tambahan data yang mungkin diperlukan
      }));
    } catch (error) {
      console.error('[EntitasPembayaran] Error enriching pembayaran data:', error);
      return pembayaranList;
    }
  }

  // Statistics and analytics methods
  private async updatePembayaranStatistics(pembayaran: IEntitasPembayaran): Promise<void> {
    try {
      const stats = {
        pembayaran,
        timestamp: new Date()
      };
      
      console.log('[EntitasPembayaran] Statistics updated:', stats);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] Error updating statistics:', error);
    }
  }

  private async updateStatusChangeStatistics(oldStatus: string, newStatus: string): Promise<void> {
    try {
      const stats = {
        oldStatus,
        newStatus,
        timestamp: new Date()
      };
      
      console.log('[EntitasPembayaran] Status change statistics updated:', stats);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] Error updating status change statistics:', error);
    }
  }

  private async updateCancellationStatistics(pembayaran: IEntitasPembayaran): Promise<void> {
    try {
      const stats = {
        pembayaran,
        type: 'CANCELLATION',
        timestamp: new Date()
      };
      
      console.log('[EntitasPembayaran] Cancellation statistics updated:', stats);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] Error updating cancellation statistics:', error);
    }
  }

  private async updateRefundStatistics(pembayaran: IEntitasPembayaran, refundAmount: number): Promise<void> {
    try {
      const stats = {
        pembayaran,
        refundAmount,
        type: 'REFUND',
        timestamp: new Date()
      };
      
      console.log('[EntitasPembayaran] Refund statistics updated:', stats);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] Error updating refund statistics:', error);
    }
  }

  private async updateHistorySearchAnalytics(filter: IPembayaranFilter, resultCount: number): Promise<void> {
    try {
      const analytics = {
        filter,
        resultCount,
        timestamp: new Date()
      };
      
      console.log('[EntitasPembayaran] History search analytics updated:', analytics);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] Error updating history search analytics:', error);
    }
  }

  // Notification methods
  private async sendPembayaranNotification(pembayaran: IEntitasPembayaran, dataCustomer: any): Promise<void> {
    try {
      const notification: IPembayaranNotifikasi = {
        idNotifikasi: `NOTIF-${Date.now()}`,
        idPembayaran: pembayaran.idPembayaran,
        tipeNotifikasi: 'PAYMENT_STATUS',
        judulNotifikasi: `Pembayaran ${pembayaran.statusPembayaran}`,
        isiNotifikasi: `Pembayaran Anda sebesar ${pembayaran.jumlahPembayaran} telah ${pembayaran.statusPembayaran.toLowerCase()}`,
        tanggalNotifikasi: new Date(),
        statusKirim: true,
        channel: 'EMAIL'
      };
      
      console.log('[EntitasPembayaran] Payment notification sent:', notification);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasPembayaran] Error sending payment notification:', error);
    }
  }

  private async sendFailureNotification(pembayaran: IEntitasPembayaran, errors: string[]): Promise<void> {
    try {
      const notification: IPembayaranNotifikasi = {
        idNotifikasi: `NOTIF-${Date.now()}`,
        idPembayaran: pembayaran.idPembayaran,
        tipeNotifikasi: 'PAYMENT_FAILED',
        judulNotifikasi: 'Pembayaran Gagal',
        isiNotifikasi: `Pembayaran gagal: ${errors.join(', ')}`,
        tanggalNotifikasi: new Date(),
        statusKirim: true,
        channel: 'EMAIL'
      };
      
      console.log('[EntitasPembayaran] Failure notification sent:', notification);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasPembayaran] Error sending failure notification:', error);
    }
  }

  private async sendStatusChangeNotification(pembayaran: IEntitasPembayaran, newStatus: string): Promise<void> {
    try {
      const notification: IPembayaranNotifikasi = {
        idNotifikasi: `NOTIF-${Date.now()}`,
        idPembayaran: pembayaran.idPembayaran,
        tipeNotifikasi: 'STATUS_CHANGE',
        judulNotifikasi: 'Status Pembayaran Berubah',
        isiNotifikasi: `Status pembayaran berubah dari ${pembayaran.statusPembayaran} menjadi ${newStatus}`,
        tanggalNotifikasi: new Date(),
        statusKirim: true,
        channel: 'EMAIL'
      };
      
      console.log('[EntitasPembayaran] Status change notification sent:', notification);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasPembayaran] Error sending status change notification:', error);
    }
  }

  private async sendCancellationNotification(pembayaran: IEntitasPembayaran, reason: string): Promise<void> {
    try {
      const notification: IPembayaranNotifikasi = {
        idNotifikasi: `NOTIF-${Date.now()}`,
        idPembayaran: pembayaran.idPembayaran,
        tipeNotifikasi: 'PAYMENT_CANCELLED',
        judulNotifikasi: 'Pembayaran Dibatalkan',
        isiNotifikasi: `Pembayaran Anda telah dibatalkan. Alasan: ${reason}`,
        tanggalNotifikasi: new Date(),
        statusKirim: true,
        channel: 'EMAIL'
      };
      
      console.log('[EntitasPembayaran] Cancellation notification sent:', notification);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasPembayaran] Error sending cancellation notification:', error);
    }
  }

  private async sendRefundNotification(pembayaran: IEntitasPembayaran, refundAmount: number, reason?: string): Promise<void> {
    try {
      const notification: IPembayaranNotifikasi = {
        idNotifikasi: `NOTIF-${Date.now()}`,
        idPembayaran: pembayaran.idPembayaran,
        tipeNotifikasi: 'REFUND_PROCESSED',
        judulNotifikasi: 'Refund Diproses',
        isiNotifikasi: `Refund sebesar ${refundAmount} telah diproses. ${reason ? `Alasan: ${reason}` : ''}`,
        tanggalNotifikasi: new Date(),
        statusKirim: true,
        channel: 'EMAIL'
      };
      
      console.log('[EntitasPembayaran] Refund notification sent:', notification);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasPembayaran] Error sending refund notification:', error);
    }
  }

  // Insights generation methods
  private async generatePembayaranInsights(pembayaran: IEntitasPembayaran, gateway: IPembayaranGateway, gatewayResponse: any): Promise<void> {
    try {
      const insights = {
        pembayaran,
        gateway,
        gatewayResponse,
        insights: [
          `Pembayaran menggunakan ${gateway.gatewayName}`,
          `Biaya admin: ${pembayaran.biayaAdmin}`,
          `Status: ${pembayaran.statusPembayaran}`
        ],
        timestamp: new Date()
      };
      
      console.log('[EntitasPembayaran] Payment insights generated:', insights);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] Error generating payment insights:', error);
    }
  }

  private async generateStatusInsights(pembayaran: IEntitasPembayaran, status: string, gateway: IPembayaranGateway): Promise<void> {
    try {
      const insights = {
        pembayaran,
        status,
        gateway,
        insights: [
          `Status terkini: ${status}`,
          `Gateway: ${gateway.gatewayName}`,
          `Waktu cek: ${new Date().toISOString()}`
        ],
        timestamp: new Date()
      };
      
      console.log('[EntitasPembayaran] Status insights generated:', insights);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] Error generating status insights:', error);
    }
  }

  private async generateCancellationInsights(pembayaran: IEntitasPembayaran, reason: string, result: any): Promise<void> {
    try {
      const insights = {
        pembayaran,
        reason,
        result,
        insights: [
          `Pembatalan berhasil: ${result.success}`,
          `Alasan: ${reason}`,
          `Refund amount: ${result.refundAmount || 0}`
        ],
        timestamp: new Date()
      };
      
      console.log('[EntitasPembayaran] Cancellation insights generated:', insights);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] Error generating cancellation insights:', error);
    }
  }

  private async generateRefundInsights(pembayaran: IEntitasPembayaran, amount: number, reason?: string, result?: any): Promise<void> {
    try {
      const insights = {
        pembayaran,
        amount,
        reason,
        result,
        insights: [
          `Refund berhasil: ${result?.success}`,
          `Jumlah refund: ${amount}`,
          `Estimasi tiba: ${result?.estimatedArrival}`
        ],
        timestamp: new Date()
      };
      
      console.log('[EntitasPembayaran] Refund insights generated:', insights);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] Error generating refund insights:', error);
    }
  }

  private async generateHistorySearchInsights(filter: IPembayaranFilter, results: IEntitasPembayaran[]): Promise<void> {
    try {
      const insights = {
        filter,
        resultCount: results.length,
        insights: [
          `Ditemukan ${results.length} pembayaran`,
          `Filter: ${JSON.stringify(filter)}`,
          `Waktu pencarian: ${new Date().toISOString()}`
        ],
        timestamp: new Date()
      };
      
      console.log('[EntitasPembayaran] History search insights generated:', insights);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] Error generating history search insights:', error);
    }
  }

  // Activity logging methods
  private async logPembayaranActivity(action: string, idPembayaran: string, details: any): Promise<void> {
    try {
      const activity = {
        action,
        idPembayaran,
        details,
        timestamp: new Date(),
        userId: 'system'
      };
      
      console.log('[EntitasPembayaran] Activity logged:', activity);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] Error logging activity:', error);
    }
  }

  // Error handling methods
  private async handlePembayaranError(error: Error): Promise<void> {
    try {
      const errorLog = {
        error: error.message,
        stack: error.stack,
        timestamp: new Date(),
        context: 'EntitasPembayaran'
      };
      
      console.error('[EntitasPembayaran] Error handled:', errorLog);
      
      // Send error notification to admin
      await this.sendErrorNotification(error);
      
      await this.simulateDelay(50);
    } catch (logError) {
      console.error('[EntitasPembayaran] Error handling error:', logError);
    }
  }

  private async sendErrorNotification(error: Error): Promise<void> {
    try {
      const notification = {
        type: 'ERROR',
        message: error.message,
        timestamp: new Date(),
        context: 'EntitasPembayaran'
      };
      
      console.log('[EntitasPembayaran] Error notification sent:', notification);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] Error sending error notification:', error);
    }
  }

  // Cache management methods
  private async updateValidationCache(idPembayaran: string, validation: IPembayaranValidation): Promise<void> {
    try {
      const cacheEntry = {
        idPembayaran,
        validation,
        timestamp: new Date()
      };
      
      console.log('[EntitasPembayaran] Validation cache updated:', cacheEntry);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasPembayaran] Error updating validation cache:', error);
    }
  }

  // Additional helper methods for refund processing
  private async processRefund(pembayaran: IEntitasPembayaran, reason: string): Promise<void> {
    try {
      console.log(`[EntitasPembayaran] Processing refund for payment ${pembayaran.idPembayaran}...`);
      
      const refundAmount = pembayaran.jumlahPembayaran;
      const gateway = await this.getGatewayByMethod(pembayaran.metodePembayaran);
      
      if (!gateway) {
        throw new Error(`Gateway not found for method ${pembayaran.metodePembayaran}`);
      }
      
      const refundResult = await this.processRefundWithGateway(gateway, pembayaran, refundAmount, reason);
      
      if (refundResult.success) {
        await this.createRefundRecord(pembayaran, refundAmount, reason, refundResult);
        await this.sendRefundNotification(pembayaran, refundAmount, reason);
        console.log('[EntitasPembayaran] Refund processed successfully');
      } else {
        console.log('[EntitasPembayaran] Refund processing failed:', refundResult.message);
      }
      
    } catch (error) {
      console.error('[EntitasPembayaran] Error processing refund:', error);
      throw error;
    }
  }

  // Utility Methods
  public toJSON(): any {
    return {
      idPembayaran: this.idPembayaran,
      idTransaksi: this.idTransaksi,
      metodePembayaran: this.metodePembayaran,
      jumlahPembayaran: this.jumlahPembayaran,
      statusPembayaran: this.statusPembayaran,
      tanggalPembayaran: this.tanggalPembayaran.toISOString(),
      nomorReferensi: this.nomorReferensi,
      biayaAdmin: this.biayaAdmin,
      keterangan: this.keterangan
    };
  }

  public toString(): string {
    return `EntitasPembayaran(${this.idPembayaran}, ${this.metodePembayaran}, ${this.jumlahPembayaran}, ${this.statusPembayaran})`;
  }

  public static fromJSON(data: any): EntitasPembayaran {
    return new EntitasPembayaran({
      idPembayaran: data.idPembayaran,
      idTransaksi: data.idTransaksi,
      metodePembayaran: data.metodePembayaran,
      jumlahPembayaran: data.jumlahPembayaran,
      statusPembayaran: data.statusPembayaran,
      tanggalPembayaran: new Date(data.tanggalPembayaran),
      nomorReferensi: data.nomorReferensi,
      biayaAdmin: data.biayaAdmin,
      keterangan: data.keterangan
    });
  }

  public static createEmpty(): EntitasPembayaran {
    return new EntitasPembayaran();
  }

  // Validation Methods
  public isValid(): boolean {
    return this.idPembayaran.length > 0 &&
           this.idTransaksi.length > 0 &&
           this.metodePembayaran.length > 0 &&
           this.jumlahPembayaran > 0 &&
           this.statusPembayaran.length > 0 &&
           this.nomorReferensi.length > 0;
  }

  public getValidationErrors(): string[] {
    const errors: string[] = [];
    
    if (!this.idPembayaran || this.idPembayaran.length === 0) {
      errors.push('ID pembayaran harus diisi');
    }
    
    if (!this.idTransaksi || this.idTransaksi.length === 0) {
      errors.push('ID transaksi harus diisi');
    }
    
    if (!this.metodePembayaran || this.metodePembayaran.length === 0) {
      errors.push('Metode pembayaran harus diisi');
    }
    
    if (this.jumlahPembayaran <= 0) {
      errors.push('Jumlah pembayaran harus lebih besar dari 0');
    }
    
    if (!this.statusPembayaran || this.statusPembayaran.length === 0) {
      errors.push('Status pembayaran harus diisi');
    }
    
    if (!this.nomorReferensi || this.nomorReferensi.length === 0) {
      errors.push('Nomor referensi harus diisi');
    }
    
    return errors;
  }

  // Status Check Methods
  public isPending(): boolean {
    return this.statusPembayaran === 'PENDING';
  }

  public isProcessing(): boolean {
    return this.statusPembayaran === 'PROCESSING';
  }

  public isSuccess(): boolean {
    return this.statusPembayaran === 'SUCCESS';
  }

  public isFailed(): boolean {
    return this.statusPembayaran === 'FAILED';
  }

  public isCancelled(): boolean {
    return this.statusPembayaran === 'CANCELLED';
  }

  public isRefunded(): boolean {
    return this.statusPembayaran === 'REFUNDED' || this.statusPembayaran === 'PARTIAL_REFUNDED';
  }

  public canBeCancelled(): boolean {
    return this.isPending() || this.isProcessing();
  }

  public canBeRefunded(): boolean {
    return this.isSuccess();
  }

  // Amount Methods
  public getNetAmount(): number {
    return this.jumlahPembayaran - this.biayaAdmin;
  }

  public getAdminFeePercentage(): number {
    return this.jumlahPembayaran > 0 ? (this.biayaAdmin / this.jumlahPembayaran) * 100 : 0;
  }

  public isHighValue(): boolean {
    return this.jumlahPembayaran > 10000000; // > 10 juta
  }

  public isMediumValue(): boolean {
    return this.jumlahPembayaran >= 1000000 && this.jumlahPembayaran <= 10000000; // 1-10 juta
  }

  public isLowValue(): boolean {
    return this.jumlahPembayaran < 1000000; // < 1 juta
  }

  // Time-based Methods
  public getAgeInHours(): number {
    const now = new Date();
    const diffMs = now.getTime() - this.tanggalPembayaran.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60));
  }

  public getAgeInDays(): number {
    return Math.floor(this.getAgeInHours() / 24);
  }

  public isRecent(): boolean {
    return this.getAgeInHours() < 24; // < 24 jam
  }

  public isOld(): boolean {
    return this.getAgeInDays() > 30; // > 30 hari
  }

  // Payment Method Methods
  public isCreditCard(): boolean {
    return this.metodePembayaran === 'CREDIT_CARD';
  }

  public isDebitCard(): boolean {
    return this.metodePembayaran === 'DEBIT_CARD';
  }

  public isBankTransfer(): boolean {
    return this.metodePembayaran === 'BANK_TRANSFER';
  }

  public isEWallet(): boolean {
    return this.metodePembayaran === 'E_WALLET';
  }

  public isVirtualAccount(): boolean {
    return this.metodePembayaran === 'VIRTUAL_ACCOUNT';
  }

  public isCash(): boolean {
    return this.metodePembayaran === 'CASH';
  }
}