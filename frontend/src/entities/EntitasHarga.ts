/**
 * EntitasHarga - Kelas untuk mengelola data harga iklan mobil
 * Menangani penetapan, perubahan, dan tracking harga iklan
 */

export interface IEntitasHarga {
  idHarga: string;
  idIklan: string;
  nilaiHarga: number;
  mataUang: string;
  tanggalDitetapkan: Date;
  idUserPengubah: string;
  alasanPerubahan: string;
}

export class EntitasHarga implements IEntitasHarga {
  // Attributes
  public idHarga: string;
  public idIklan: string;
  public nilaiHarga: number;
  public mataUang: string;
  public tanggalDitetapkan: Date;
  public idUserPengubah: string;
  public alasanPerubahan: string;

  constructor(data: Partial<IEntitasHarga> = {}) {
    this.idHarga = data.idHarga || this.generateId();
    this.idIklan = data.idIklan || '';
    this.nilaiHarga = data.nilaiHarga || 0;
    this.mataUang = data.mataUang || 'IDR';
    this.tanggalDitetapkan = data.tanggalDitetapkan || new Date();
    this.idUserPengubah = data.idUserPengubah || '';
    this.alasanPerubahan = data.alasanPerubahan || '';
  }

  // Main Methods
  /**
   * Menyimpan data harga final ke database
   * @param dataFinal - Data harga yang sudah final
   * @returns Promise<boolean> - Status keberhasilan penyimpanan
   */
  public async simpanKeDatabase(dataFinal: Partial<IEntitasHarga>): Promise<boolean> {
    try {
      console.log(`[EntitasHarga] Menyimpan data harga untuk iklan ${this.idIklan}...`);
      
      // Validasi data final
      if (!this.validateDataFinal(dataFinal)) {
        throw new Error('Data harga tidak valid');
      }

      // Update attributes dengan data final
      Object.assign(this, dataFinal);
      
      // Simulasi penyimpanan ke database
      await this.simulateDelay(800);
      
      // Log aktivitas perubahan harga
      await this.logPerubahanHarga();
      
      // Notifikasi perubahan harga
      await this.kirimNotifikasiPerubahanHarga();
      
      // Update cache harga
      await this.updateCacheHarga();
      
      // Backup data harga
      await this.backupDataHarga();
      
      // Validasi konsistensi data
      await this.validasiKonsistensiData();
      
      console.log(`[EntitasHarga] Data harga berhasil disimpan dengan ID: ${this.idHarga}`);
      return true;
      
    } catch (error) {
      console.error(`[EntitasHarga] Error menyimpan data harga:`, error);
      await this.handleErrorPenyimpanan(error as Error);
      return false;
    }
  }

  // Helper Methods
  private generateId(): string {
    return `HRG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private validateDataFinal(data: Partial<IEntitasHarga>): boolean {
    // Validasi ID iklan
    if (!data.idIklan || data.idIklan.trim() === '') {
      console.error('[EntitasHarga] ID iklan tidak boleh kosong');
      return false;
    }

    // Validasi nilai harga
    if (!data.nilaiHarga || data.nilaiHarga <= 0) {
      console.error('[EntitasHarga] Nilai harga harus lebih dari 0');
      return false;
    }

    // Validasi mata uang
    const validCurrencies = ['IDR', 'USD', 'EUR', 'JPY', 'SGD'];
    if (data.mataUang && !validCurrencies.includes(data.mataUang)) {
      console.error('[EntitasHarga] Mata uang tidak valid');
      return false;
    }

    // Validasi user pengubah
    if (!data.idUserPengubah || data.idUserPengubah.trim() === '') {
      console.error('[EntitasHarga] ID user pengubah tidak boleh kosong');
      return false;
    }

    return true;
  }

  private async logPerubahanHarga(): Promise<void> {
    try {
      const logData = {
        timestamp: new Date(),
        action: 'UPDATE_HARGA',
        idHarga: this.idHarga,
        idIklan: this.idIklan,
        nilaiHargaBaru: this.nilaiHarga,
        mataUang: this.mataUang,
        idUserPengubah: this.idUserPengubah,
        alasanPerubahan: this.alasanPerubahan
      };

      console.log('[EntitasHarga] Logging perubahan harga:', logData);
      await this.simulateDelay(200);
    } catch (error) {
      console.error('[EntitasHarga] Error logging perubahan harga:', error);
    }
  }

  private async kirimNotifikasiPerubahanHarga(): Promise<void> {
    try {
      const notificationData = {
        type: 'PRICE_CHANGE',
        idIklan: this.idIklan,
        nilaiHargaBaru: this.nilaiHarga,
        mataUang: this.mataUang,
        tanggalPerubahan: this.tanggalDitetapkan,
        alasan: this.alasanPerubahan
      };

      console.log('[EntitasHarga] Mengirim notifikasi perubahan harga:', notificationData);
      await this.simulateDelay(300);
    } catch (error) {
      console.error('[EntitasHarga] Error mengirim notifikasi:', error);
    }
  }

  private async updateCacheHarga(): Promise<void> {
    try {
      const cacheKey = `harga_${this.idIklan}`;
      const cacheData = {
        idHarga: this.idHarga,
        nilaiHarga: this.nilaiHarga,
        mataUang: this.mataUang,
        lastUpdated: new Date()
      };

      console.log(`[EntitasHarga] Updating cache dengan key: ${cacheKey}`);
      await this.simulateDelay(150);
    } catch (error) {
      console.error('[EntitasHarga] Error updating cache:', error);
    }
  }

  private async backupDataHarga(): Promise<void> {
    try {
      const backupData = {
        ...this,
        backupTimestamp: new Date(),
        backupReason: 'PRICE_UPDATE'
      };

      console.log('[EntitasHarga] Melakukan backup data harga');
      await this.simulateDelay(250);
    } catch (error) {
      console.error('[EntitasHarga] Error backup data:', error);
    }
  }

  private async validasiKonsistensiData(): Promise<void> {
    try {
      // Validasi konsistensi dengan data iklan
      if (!this.idIklan) {
        throw new Error('ID iklan tidak valid');
      }

      // Validasi format harga
      if (this.nilaiHarga <= 0) {
        throw new Error('Nilai harga tidak valid');
      }

      // Validasi mata uang
      if (!this.mataUang || this.mataUang.length !== 3) {
        throw new Error('Format mata uang tidak valid');
      }

      console.log('[EntitasHarga] Validasi konsistensi data berhasil');
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasHarga] Error validasi konsistensi:', error);
      throw error;
    }
  }

  private async handleErrorPenyimpanan(error: Error): Promise<void> {
    try {
      const errorLog = {
        timestamp: new Date(),
        error: error.message,
        idHarga: this.idHarga,
        idIklan: this.idIklan,
        action: 'SAVE_PRICE_ERROR'
      };

      console.error('[EntitasHarga] Handling error penyimpanan:', errorLog);
      
      // Kirim alert ke admin
      await this.kirimAlertError(error);
      
      await this.simulateDelay(200);
    } catch (handlingError) {
      console.error('[EntitasHarga] Error dalam handling error:', handlingError);
    }
  }

  private async kirimAlertError(error: Error): Promise<void> {
    try {
      const alertData = {
        type: 'PRICE_SAVE_ERROR',
        message: error.message,
        idHarga: this.idHarga,
        idIklan: this.idIklan,
        timestamp: new Date(),
        severity: 'HIGH'
      };

      console.log('[EntitasHarga] Mengirim alert error:', alertData);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasHarga] Error mengirim alert:', error);
    }
  }

  // Utility Methods
  public formatHarga(): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: this.mataUang,
      minimumFractionDigits: 0
    }).format(this.nilaiHarga);
  }

  public getPersentasePerubahan(hargaSebelumnya: number): number {
    if (hargaSebelumnya === 0) return 0;
    return ((this.nilaiHarga - hargaSebelumnya) / hargaSebelumnya) * 100;
  }

  public isHargaValid(): boolean {
    return this.nilaiHarga > 0 && this.mataUang.length === 3;
  }

  public toJSON(): IEntitasHarga {
    return {
      idHarga: this.idHarga,
      idIklan: this.idIklan,
      nilaiHarga: this.nilaiHarga,
      mataUang: this.mataUang,
      tanggalDitetapkan: this.tanggalDitetapkan,
      idUserPengubah: this.idUserPengubah,
      alasanPerubahan: this.alasanPerubahan
    };
  }
}

export default EntitasHarga;