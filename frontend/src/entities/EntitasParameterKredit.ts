/**
 * EntitasParameterKredit - Kelas untuk mengelola parameter dan konfigurasi kredit
 * Menangani pengaturan kredit, validasi parameter, dan kalkulasi suku bunga
 */

export interface IEntitasParameterKredit {
  idParameter: string;
  namaParameter: string;
  jenisKredit: string;
  sukuBungaMinimal: number;
  sukuBungaMaksimal: number;
  tenorMinimal: number;
  tenorMaksimal: number;
  jumlahKreditMinimal: number;
  jumlahKreditMaksimal: number;
  dpMinimal: number;
  dpMaksimal: number;
  biayaAdmin: number;
  biayaProvisi: number;
  biayaAsuransi: number;
  statusAktif: boolean;
  tanggalBerlaku: Date;
}

export interface IParameterKreditFilter {
  jenisKredit?: string;
  statusAktif?: boolean;
  sukuBungaMin?: number;
  sukuBungaMax?: number;
  tenorMin?: number;
  tenorMax?: number;
  jumlahKreditMin?: number;
  jumlahKreditMax?: number;
}

export interface IParameterKreditValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface IParameterKreditKalkulasi {
  jumlahKredit: number;
  sukuBunga: number;
  tenor: number;
  dp: number;
  angsuranPokok: number;
  angsuranBunga: number;
  totalAngsuran: number;
  totalBiaya: number;
  totalPembayaran: number;
}

export interface IParameterKreditStatistik {
  totalParameter: number;
  parameterAktif: number;
  parameterNonAktif: number;
  jenisKreditTerpopuler: string;
  rataRataSukuBunga: number;
  rataRataTenor: number;
  rataRataJumlahKredit: number;
}

export interface IParameterKreditNotifikasi {
  idNotifikasi: string;
  idParameter: string;
  tipeNotifikasi: string;
  judulNotifikasi: string;
  isiNotifikasi: string;
  tanggalNotifikasi: Date;
  statusKirim: boolean;
  channel: string;
}

export class EntitasParameterKredit implements IEntitasParameterKredit {
  // Attributes
  public idParameter: string;
  public namaParameter: string;
  public jenisKredit: string;
  public sukuBungaMinimal: number;
  public sukuBungaMaksimal: number;
  public tenorMinimal: number;
  public tenorMaksimal: number;
  public jumlahKreditMinimal: number;
  public jumlahKreditMaksimal: number;
  public dpMinimal: number;
  public dpMaksimal: number;
  public biayaAdmin: number;
  public biayaProvisi: number;
  public biayaAsuransi: number;
  public statusAktif: boolean;
  public tanggalBerlaku: Date;

  constructor(data: Partial<IEntitasParameterKredit> = {}) {
    this.idParameter = data.idParameter || this.generateId();
    this.namaParameter = data.namaParameter || '';
    this.jenisKredit = data.jenisKredit || '';
    this.sukuBungaMinimal = data.sukuBungaMinimal || 0;
    this.sukuBungaMaksimal = data.sukuBungaMaksimal || 0;
    this.tenorMinimal = data.tenorMinimal || 0;
    this.tenorMaksimal = data.tenorMaksimal || 0;
    this.jumlahKreditMinimal = data.jumlahKreditMinimal || 0;
    this.jumlahKreditMaksimal = data.jumlahKreditMaksimal || 0;
    this.dpMinimal = data.dpMinimal || 0;
    this.dpMaksimal = data.dpMaksimal || 0;
    this.biayaAdmin = data.biayaAdmin || 0;
    this.biayaProvisi = data.biayaProvisi || 0;
    this.biayaAsuransi = data.biayaAsuransi || 0;
    this.statusAktif = data.statusAktif !== undefined ? data.statusAktif : true;
    this.tanggalBerlaku = data.tanggalBerlaku || new Date();
  }

  // Main Methods

  /**
   * Mengambil parameter kredit berdasarkan filter tertentu
   * @param filter - Filter untuk pencarian parameter
   * @param sortBy - Kriteria pengurutan
   * @param limit - Jumlah maksimal hasil
   * @returns Promise<IEntitasParameterKredit[]> - Array parameter kredit
   */
  public async ambilParameterKredit(filter: IParameterKreditFilter = {}, sortBy: string = 'namaParameter', limit: number = 100): Promise<IEntitasParameterKredit[]> {
    try {
      console.log('[EntitasParameterKredit] Mengambil parameter kredit dengan filter:', filter);
      
      await this.simulateDelay(200);
      
      // Validasi filter
      await this.validateParameterFilter(filter);
      
      // Fetch all parameter from database
      const allParameter = await this.fetchAllParameterKredit();
      
      // Apply filters
      let filteredParameter = await this.applyParameterFilters(allParameter, filter);
      
      // Sort results
      filteredParameter = await this.sortParameterKredit(filteredParameter, sortBy);
      
      // Limit results
      filteredParameter = filteredParameter.slice(0, limit);
      
      // Enrich with additional data
      filteredParameter = await this.enrichParameterData(filteredParameter);
      
      // Update search analytics
      await this.updateParameterSearchAnalytics(filter, filteredParameter.length);
      
      // Generate search insights
      await this.generateParameterSearchInsights(filter, filteredParameter);
      
      // Log parameter search activity
      await this.logParameterActivity('SEARCH_PARAMETER', '', {
        filter,
        resultCount: filteredParameter.length,
        sortBy
      });
      
      console.log(`[EntitasParameterKredit] Ditemukan ${filteredParameter.length} parameter kredit`);
      return filteredParameter;
      
    } catch (error) {
      console.error('[EntitasParameterKredit] Error mengambil parameter kredit:', error);
      await this.handleParameterError(error as Error);
      throw error;
    }
  }

  /**
   * Memvalidasi parameter kredit sebelum disimpan atau digunakan
   * @param idParameter - ID parameter yang akan divalidasi
   * @param dataValidasi - Data tambahan untuk validasi
   * @returns Promise<IParameterKreditValidation> - Hasil validasi parameter
   */
  public async validasiParameter(idParameter: string, dataValidasi?: any): Promise<IParameterKreditValidation> {
    try {
      console.log(`[EntitasParameterKredit] Memvalidasi parameter ${idParameter}...`);
      
      await this.simulateDelay(150);
      
      const validation: IParameterKreditValidation = {
        isValid: true,
        errors: [],
        warnings: [],
        recommendations: []
      };
      
      // Ambil data parameter
      const parameter = await this.getParameterById(idParameter);
      if (!parameter) {
        validation.isValid = false;
        validation.errors.push('Parameter tidak ditemukan');
        return validation;
      }
      
      // Validasi range suku bunga
      await this.validateSukuBungaRange(parameter, validation);
      
      // Validasi range tenor
      await this.validateTenorRange(parameter, validation);
      
      // Validasi range jumlah kredit
      await this.validateJumlahKreditRange(parameter, validation);
      
      // Validasi range DP
      await this.validateDpRange(parameter, validation);
      
      // Validasi biaya-biaya
      await this.validateBiayaParameter(parameter, validation);
      
      // Validasi status dan tanggal berlaku
      await this.validateStatusAndDate(parameter, validation);
      
      // Validasi konsistensi dengan parameter lain
      await this.validateConsistency(parameter, validation, dataValidasi);
      
      // Validasi business rules
      await this.validateBusinessRules(parameter, validation);
      
      // Generate recommendations
      await this.generateParameterRecommendations(parameter, validation);
      
      // Update validation cache
      await this.updateParameterValidationCache(idParameter, validation);
      
      // Log validation activity
      await this.logParameterActivity('VALIDATE', idParameter, {
        isValid: validation.isValid,
        errorCount: validation.errors.length,
        warningCount: validation.warnings.length
      });
      
      console.log('[EntitasParameterKredit] Validasi selesai:', validation);
      return validation;
      
    } catch (error) {
      console.error('[EntitasParameterKredit] Error validasi parameter:', error);
      await this.handleParameterError(error as Error);
      
      return {
        isValid: false,
        errors: [`Error validasi: ${(error as Error).message}`],
        warnings: [],
        recommendations: []
      };
    }
  }

  /**
   * Menghitung simulasi kredit berdasarkan parameter yang diberikan
   * @param jumlahKredit - Jumlah kredit yang diajukan
   * @param tenor - Tenor dalam bulan
   * @param dp - Jumlah down payment
   * @param sukuBunga - Suku bunga (opsional, akan menggunakan parameter jika tidak diisi)
   * @returns Promise<IParameterKreditKalkulasi> - Hasil kalkulasi kredit
   */
  public async hitungSimulasiKredit(jumlahKredit: number, tenor: number, dp: number, sukuBunga?: number): Promise<IParameterKreditKalkulasi> {
    try {
      console.log(`[EntitasParameterKredit] Menghitung simulasi kredit: ${jumlahKredit}, tenor: ${tenor}, DP: ${dp}...`);
      
      await this.simulateDelay(300);
      
      // Validasi input kalkulasi
      await this.validateKalkulasiInput(jumlahKredit, tenor, dp, sukuBunga);
      
      // Tentukan suku bunga yang akan digunakan
      const finalSukuBunga = sukuBunga || await this.determineSukuBunga(jumlahKredit, tenor);
      
      // Validasi apakah parameter sesuai dengan range yang ditetapkan
      await this.validateParameterRange(jumlahKredit, tenor, dp, finalSukuBunga);
      
      // Hitung pokok pinjaman setelah DP
      const pokokPinjaman = jumlahKredit - dp;
      
      // Hitung angsuran pokok per bulan
      const angsuranPokok = pokokPinjaman / tenor;
      
      // Hitung bunga per bulan
      const bungaPerBulan = (finalSukuBunga / 100) / 12;
      
      // Hitung angsuran bunga (menggunakan metode anuitas)
      const angsuranBunga = this.calculateAnuitasInterest(pokokPinjaman, bungaPerBulan, tenor);
      
      // Hitung total angsuran per bulan
      const totalAngsuran = angsuranPokok + angsuranBunga;
      
      // Hitung total biaya tambahan
      const totalBiaya = this.biayaAdmin + this.biayaProvisi + this.biayaAsuransi;
      
      // Hitung total pembayaran keseluruhan
      const totalPembayaran = (totalAngsuran * tenor) + totalBiaya + dp;
      
      const kalkulasi: IParameterKreditKalkulasi = {
        jumlahKredit,
        sukuBunga: finalSukuBunga,
        tenor,
        dp,
        angsuranPokok,
        angsuranBunga,
        totalAngsuran,
        totalBiaya,
        totalPembayaran
      };
      
      // Generate kalkulasi insights
      await this.generateKalkulasiInsights(kalkulasi);
      
      // Update kalkulasi statistics
      await this.updateKalkulasiStatistics(kalkulasi);
      
      // Log kalkulasi activity
      await this.logParameterActivity('CALCULATE', this.idParameter, {
        jumlahKredit,
        tenor,
        dp,
        sukuBunga: finalSukuBunga,
        totalAngsuran
      });
      
      console.log('[EntitasParameterKredit] Simulasi kredit selesai:', kalkulasi);
      return kalkulasi;
      
    } catch (error) {
      console.error('[EntitasParameterKredit] Error menghitung simulasi kredit:', error);
      await this.handleParameterError(error as Error);
      throw error;
    }
  }

  /**
   * Memperbarui parameter kredit dengan data baru
   * @param idParameter - ID parameter yang akan diperbarui
   * @param dataUpdate - Data yang akan diperbarui
   * @returns Promise<boolean> - Status berhasil/gagal update
   */
  public async perbaruiParameter(idParameter: string, dataUpdate: Partial<IEntitasParameterKredit>): Promise<boolean> {
    try {
      console.log(`[EntitasParameterKredit] Memperbarui parameter ${idParameter}...`);
      
      await this.simulateDelay(250);
      
      // Ambil data parameter yang ada
      const existingParameter = await this.getParameterById(idParameter);
      if (!existingParameter) {
        throw new Error('Parameter tidak ditemukan');
      }
      
      // Validasi data update
      await this.validateUpdateData(dataUpdate, existingParameter);
      
      // Backup data lama
      await this.backupParameterData(existingParameter);
      
      // Merge data update dengan data yang ada
      const updatedParameter = { ...existingParameter, ...dataUpdate };
      
      // Validasi parameter yang sudah diupdate
      const validation = await this.validasiParameter(idParameter, updatedParameter);
      
      if (!validation.isValid) {
        throw new Error(`Validasi gagal: ${validation.errors.join(', ')}`);
      }
      
      // Simpan parameter yang sudah diupdate
      await this.saveParameterToDatabase(updatedParameter);
      
      // Update cache
      await this.updateParameterCache(idParameter, updatedParameter);
      
      // Generate update insights
      await this.generateUpdateInsights(existingParameter, updatedParameter);
      
      // Send notification jika ada perubahan penting
      await this.sendParameterUpdateNotification(existingParameter, updatedParameter);
      
      // Update statistics
      await this.updateParameterStatistics(updatedParameter);
      
      // Log update activity
      await this.logParameterActivity('UPDATE', idParameter, {
        oldData: existingParameter,
        newData: updatedParameter,
        changes: this.getChanges(existingParameter, updatedParameter)
      });
      
      console.log('[EntitasParameterKredit] Parameter berhasil diperbarui');
      return true;
      
    } catch (error) {
      console.error('[EntitasParameterKredit] Error memperbarui parameter:', error);
      await this.handleParameterError(error as Error);
      return false;
    }
  }

  // Helper Methods
  private generateId(): string {
    return `PARAM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async validateParameterFilter(filter: IParameterKreditFilter): Promise<void> {
    try {
      if (filter.sukuBungaMin && filter.sukuBungaMax && filter.sukuBungaMin > filter.sukuBungaMax) {
        throw new Error('Suku bunga minimum tidak boleh lebih besar dari maksimum');
      }
      
      if (filter.tenorMin && filter.tenorMax && filter.tenorMin > filter.tenorMax) {
        throw new Error('Tenor minimum tidak boleh lebih besar dari maksimum');
      }
      
      if (filter.jumlahKreditMin && filter.jumlahKreditMax && filter.jumlahKreditMin > filter.jumlahKreditMax) {
        throw new Error('Jumlah kredit minimum tidak boleh lebih besar dari maksimum');
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Parameter filter validation error:', error);
      throw error;
    }
  }

  private async fetchAllParameterKredit(): Promise<IEntitasParameterKredit[]> {
    try {
      console.log('[EntitasParameterKredit] Fetching all parameter kredit...');
      
      // Simulasi data parameter kredit
      const parameterList: IEntitasParameterKredit[] = [];
      const jenisKredit = ['MOBIL_BARU', 'MOBIL_BEKAS', 'MOTOR_BARU', 'MOTOR_BEKAS', 'MULTIGUNA'];
      
      // Generate 50-100 sample parameter
      const parameterCount = Math.floor(Math.random() * 50) + 50;
      
      for (let i = 0; i < parameterCount; i++) {
        const jenis = jenisKredit[Math.floor(Math.random() * jenisKredit.length)];
        const sukuBungaMin = Math.random() * 5 + 3; // 3-8%
        const sukuBungaMax = sukuBungaMin + Math.random() * 3; // +0-3%
        const tenorMin = Math.floor(Math.random() * 12) + 6; // 6-18 bulan
        const tenorMax = tenorMin + Math.floor(Math.random() * 48) + 12; // +12-60 bulan
        const jumlahMin = Math.floor(Math.random() * 50000000) + 10000000; // 10M-60M
        const jumlahMax = jumlahMin + Math.floor(Math.random() * 500000000); // +0-500M
        const dpMin = Math.random() * 20 + 10; // 10-30%
        const dpMax = dpMin + Math.random() * 20; // +0-20%
        
        const parameter: IEntitasParameterKredit = {
          idParameter: this.generateId(),
          namaParameter: `Parameter ${jenis} ${i + 1}`,
          jenisKredit: jenis,
          sukuBungaMinimal: Math.round(sukuBungaMin * 100) / 100,
          sukuBungaMaksimal: Math.round(sukuBungaMax * 100) / 100,
          tenorMinimal: tenorMin,
          tenorMaksimal: tenorMax,
          jumlahKreditMinimal: jumlahMin,
          jumlahKreditMaksimal: jumlahMax,
          dpMinimal: Math.round(dpMin * 100) / 100,
          dpMaksimal: Math.round(dpMax * 100) / 100,
          biayaAdmin: Math.floor(Math.random() * 500000) + 100000, // 100K-600K
          biayaProvisi: Math.floor(Math.random() * 1000000) + 200000, // 200K-1.2M
          biayaAsuransi: Math.floor(Math.random() * 2000000) + 500000, // 500K-2.5M
          statusAktif: Math.random() < 0.8, // 80% aktif
          tanggalBerlaku: new Date(Date.now() - Math.random() * 31536000000) // 0-1 tahun lalu
        };
        
        parameterList.push(parameter);
      }
      
      await this.simulateDelay(300);
      return parameterList;
      
    } catch (error) {
      console.error('[EntitasParameterKredit] Error fetching parameter:', error);
      return [];
    }
  }

  private async applyParameterFilters(parameterList: IEntitasParameterKredit[], filter: IParameterKreditFilter): Promise<IEntitasParameterKredit[]> {
    try {
      let filtered = [...parameterList];
      
      if (filter.jenisKredit) {
        filtered = filtered.filter(p => p.jenisKredit === filter.jenisKredit);
      }
      
      if (filter.statusAktif !== undefined) {
        filtered = filtered.filter(p => p.statusAktif === filter.statusAktif);
      }
      
      if (filter.sukuBungaMin !== undefined) {
        filtered = filtered.filter(p => p.sukuBungaMaksimal >= filter.sukuBungaMin!);
      }
      
      if (filter.sukuBungaMax !== undefined) {
        filtered = filtered.filter(p => p.sukuBungaMinimal <= filter.sukuBungaMax!);
      }
      
      if (filter.tenorMin !== undefined) {
        filtered = filtered.filter(p => p.tenorMaksimal >= filter.tenorMin!);
      }
      
      if (filter.tenorMax !== undefined) {
        filtered = filtered.filter(p => p.tenorMinimal <= filter.tenorMax!);
      }
      
      if (filter.jumlahKreditMin !== undefined) {
        filtered = filtered.filter(p => p.jumlahKreditMaksimal >= filter.jumlahKreditMin!);
      }
      
      if (filter.jumlahKreditMax !== undefined) {
        filtered = filtered.filter(p => p.jumlahKreditMinimal <= filter.jumlahKreditMax!);
      }
      
      return filtered;
    } catch (error) {
      console.error('[EntitasParameterKredit] Error applying filters:', error);
      return parameterList;
    }
  }

  private async sortParameterKredit(parameterList: IEntitasParameterKredit[], sortBy: string): Promise<IEntitasParameterKredit[]> {
    try {
      const sorted = [...parameterList];
      
      sorted.sort((a, b) => {
        switch (sortBy) {
          case 'namaParameter':
            return a.namaParameter.localeCompare(b.namaParameter);
          case 'jenisKredit':
            return a.jenisKredit.localeCompare(b.jenisKredit);
          case 'sukuBunga':
            return a.sukuBungaMinimal - b.sukuBungaMinimal;
          case 'tenor':
            return a.tenorMinimal - b.tenorMinimal;
          case 'jumlahKredit':
            return a.jumlahKreditMinimal - b.jumlahKreditMinimal;
          case 'tanggalBerlaku':
            return b.tanggalBerlaku.getTime() - a.tanggalBerlaku.getTime();
          default:
            return a.namaParameter.localeCompare(b.namaParameter);
        }
      });
      
      return sorted;
    } catch (error) {
      console.error('[EntitasParameterKredit] Error sorting parameter:', error);
      return parameterList;
    }
  }

  private async enrichParameterData(parameterList: IEntitasParameterKredit[]): Promise<IEntitasParameterKredit[]> {
    try {
      // Simulasi enrichment dengan data tambahan
      return parameterList.map(parameter => ({
        ...parameter,
        // Tambahan data yang mungkin diperlukan
      }));
    } catch (error) {
      console.error('[EntitasParameterKredit] Error enriching parameter data:', error);
      return parameterList;
    }
  }

  private async getParameterById(idParameter: string): Promise<IEntitasParameterKredit | null> {
    try {
      // Simulasi fetch dari database
      const allParameter = await this.fetchAllParameterKredit();
      return allParameter.find(p => p.idParameter === idParameter) || null;
    } catch (error) {
      console.error('[EntitasParameterKredit] Error getting parameter by ID:', error);
      return null;
    }
  }

  // Validation methods
  private async validateSukuBungaRange(parameter: IEntitasParameterKredit, validation: IParameterKreditValidation): Promise<void> {
    try {
      if (parameter.sukuBungaMinimal < 0) {
        validation.isValid = false;
        validation.errors.push('Suku bunga minimal tidak boleh negatif');
      }
      
      if (parameter.sukuBungaMaksimal < 0) {
        validation.isValid = false;
        validation.errors.push('Suku bunga maksimal tidak boleh negatif');
      }
      
      if (parameter.sukuBungaMinimal > parameter.sukuBungaMaksimal) {
        validation.isValid = false;
        validation.errors.push('Suku bunga minimal tidak boleh lebih besar dari maksimal');
      }
      
      if (parameter.sukuBungaMaksimal > 50) {
        validation.warnings.push('Suku bunga maksimal sangat tinggi (>50%)');
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error validating suku bunga range:', error);
      validation.errors.push('Error validasi suku bunga');
    }
  }

  private async validateTenorRange(parameter: IEntitasParameterKredit, validation: IParameterKreditValidation): Promise<void> {
    try {
      if (parameter.tenorMinimal <= 0) {
        validation.isValid = false;
        validation.errors.push('Tenor minimal harus lebih besar dari 0');
      }
      
      if (parameter.tenorMaksimal <= 0) {
        validation.isValid = false;
        validation.errors.push('Tenor maksimal harus lebih besar dari 0');
      }
      
      if (parameter.tenorMinimal > parameter.tenorMaksimal) {
        validation.isValid = false;
        validation.errors.push('Tenor minimal tidak boleh lebih besar dari maksimal');
      }
      
      if (parameter.tenorMaksimal > 120) {
        validation.warnings.push('Tenor maksimal sangat panjang (>10 tahun)');
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error validating tenor range:', error);
      validation.errors.push('Error validasi tenor');
    }
  }

  private async validateJumlahKreditRange(parameter: IEntitasParameterKredit, validation: IParameterKreditValidation): Promise<void> {
    try {
      if (parameter.jumlahKreditMinimal <= 0) {
        validation.isValid = false;
        validation.errors.push('Jumlah kredit minimal harus lebih besar dari 0');
      }
      
      if (parameter.jumlahKreditMaksimal <= 0) {
        validation.isValid = false;
        validation.errors.push('Jumlah kredit maksimal harus lebih besar dari 0');
      }
      
      if (parameter.jumlahKreditMinimal > parameter.jumlahKreditMaksimal) {
        validation.isValid = false;
        validation.errors.push('Jumlah kredit minimal tidak boleh lebih besar dari maksimal');
      }
      
      if (parameter.jumlahKreditMaksimal > 10000000000) { // 10 miliar
        validation.warnings.push('Jumlah kredit maksimal sangat besar (>10 miliar)');
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error validating jumlah kredit range:', error);
      validation.errors.push('Error validasi jumlah kredit');
    }
  }

  private async validateDpRange(parameter: IEntitasParameterKredit, validation: IParameterKreditValidation): Promise<void> {
    try {
      if (parameter.dpMinimal < 0) {
        validation.isValid = false;
        validation.errors.push('DP minimal tidak boleh negatif');
      }
      
      if (parameter.dpMaksimal < 0) {
        validation.isValid = false;
        validation.errors.push('DP maksimal tidak boleh negatif');
      }
      
      if (parameter.dpMinimal > parameter.dpMaksimal) {
        validation.isValid = false;
        validation.errors.push('DP minimal tidak boleh lebih besar dari maksimal');
      }
      
      if (parameter.dpMaksimal > 100) {
        validation.isValid = false;
        validation.errors.push('DP maksimal tidak boleh lebih dari 100%');
      }
      
      if (parameter.dpMinimal < 10) {
        validation.warnings.push('DP minimal sangat rendah (<10%)');
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error validating DP range:', error);
      validation.errors.push('Error validasi DP');
    }
  }

  private async validateBiayaParameter(parameter: IEntitasParameterKredit, validation: IParameterKreditValidation): Promise<void> {
    try {
      if (parameter.biayaAdmin < 0) {
        validation.isValid = false;
        validation.errors.push('Biaya admin tidak boleh negatif');
      }
      
      if (parameter.biayaProvisi < 0) {
        validation.isValid = false;
        validation.errors.push('Biaya provisi tidak boleh negatif');
      }
      
      if (parameter.biayaAsuransi < 0) {
        validation.isValid = false;
        validation.errors.push('Biaya asuransi tidak boleh negatif');
      }
      
      const totalBiaya = parameter.biayaAdmin + parameter.biayaProvisi + parameter.biayaAsuransi;
      if (totalBiaya > parameter.jumlahKreditMinimal * 0.1) {
        validation.warnings.push('Total biaya sangat tinggi (>10% dari jumlah kredit minimal)');
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error validating biaya parameter:', error);
      validation.errors.push('Error validasi biaya');
    }
  }

  private async validateStatusAndDate(parameter: IEntitasParameterKredit, validation: IParameterKreditValidation): Promise<void> {
    try {
      if (!parameter.tanggalBerlaku) {
        validation.isValid = false;
        validation.errors.push('Tanggal berlaku harus diisi');
      }
      
      if (parameter.tanggalBerlaku > new Date()) {
        validation.warnings.push('Tanggal berlaku di masa depan');
      }
      
      const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      if (parameter.tanggalBerlaku < oneYearAgo) {
        validation.warnings.push('Parameter sudah sangat lama (>1 tahun)');
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error validating status and date:', error);
      validation.errors.push('Error validasi status dan tanggal');
    }
  }

  private async validateConsistency(parameter: IEntitasParameterKredit, validation: IParameterKreditValidation, dataValidasi?: any): Promise<void> {
    try {
      // Simulasi validasi konsistensi dengan parameter lain
      const otherParameters = await this.fetchAllParameterKredit();
      const sameTypeParameters = otherParameters.filter(p => 
        p.jenisKredit === parameter.jenisKredit && 
        p.idParameter !== parameter.idParameter &&
        p.statusAktif
      );
      
      if (sameTypeParameters.length > 0) {
        const avgSukuBunga = sameTypeParameters.reduce((sum, p) => sum + p.sukuBungaMinimal, 0) / sameTypeParameters.length;
        
        if (Math.abs(parameter.sukuBungaMinimal - avgSukuBunga) > 5) {
          validation.warnings.push('Suku bunga berbeda signifikan dari parameter sejenis lainnya');
        }
      }
      
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error validating consistency:', error);
      validation.warnings.push('Error validasi konsistensi');
    }
  }

  private async validateBusinessRules(parameter: IEntitasParameterKredit, validation: IParameterKreditValidation): Promise<void> {
    try {
      // Business rule: Kredit mobil baru biasanya memiliki suku bunga lebih rendah
      if (parameter.jenisKredit === 'MOBIL_BARU' && parameter.sukuBungaMinimal > 15) {
        validation.warnings.push('Suku bunga untuk mobil baru biasanya lebih rendah');
      }
      
      // Business rule: Kredit bekas biasanya memiliki DP lebih tinggi
      if ((parameter.jenisKredit === 'MOBIL_BEKAS' || parameter.jenisKredit === 'MOTOR_BEKAS') && parameter.dpMinimal < 20) {
        validation.warnings.push('DP untuk kendaraan bekas biasanya minimal 20%');
      }
      
      // Business rule: Tenor panjang biasanya untuk jumlah kredit besar
      if (parameter.tenorMaksimal > 60 && parameter.jumlahKreditMinimal < 100000000) {
        validation.recommendations.push('Tenor panjang sebaiknya untuk jumlah kredit yang besar');
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error validating business rules:', error);
      validation.warnings.push('Error validasi business rules');
    }
  }

  private async generateParameterRecommendations(parameter: IEntitasParameterKredit, validation: IParameterKreditValidation): Promise<void> {
    try {
      if (validation.errors.length > 0) {
        validation.recommendations.push('Perbaiki error sebelum mengaktifkan parameter');
      }
      
      if (validation.warnings.length > 0) {
        validation.recommendations.push('Tinjau warning yang ada untuk optimasi parameter');
      }
      
      if (!parameter.statusAktif) {
        validation.recommendations.push('Aktifkan parameter jika sudah siap digunakan');
      }
      
      if (parameter.sukuBungaMaksimal - parameter.sukuBungaMinimal > 10) {
        validation.recommendations.push('Pertimbangkan mempersempit range suku bunga');
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error generating recommendations:', error);
    }
  }

  // Calculation methods
  private async validateKalkulasiInput(jumlahKredit: number, tenor: number, dp: number, sukuBunga?: number): Promise<void> {
    try {
      const errors: string[] = [];
      
      if (jumlahKredit <= 0) {
        errors.push('Jumlah kredit harus lebih besar dari 0');
      }
      
      if (tenor <= 0) {
        errors.push('Tenor harus lebih besar dari 0');
      }
      
      if (dp < 0) {
        errors.push('DP tidak boleh negatif');
      }
      
      if (dp >= jumlahKredit) {
        errors.push('DP tidak boleh lebih besar atau sama dengan jumlah kredit');
      }
      
      if (sukuBunga !== undefined && sukuBunga < 0) {
        errors.push('Suku bunga tidak boleh negatif');
      }
      
      if (errors.length > 0) {
        throw new Error(`Validation errors: ${errors.join(', ')}`);
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Kalkulasi input validation error:', error);
      throw error;
    }
  }

  private async determineSukuBunga(jumlahKredit: number, tenor: number): Promise<number> {
    try {
      // Logika penentuan suku bunga berdasarkan jumlah kredit dan tenor
      let sukuBunga = this.sukuBungaMinimal;
      
      // Suku bunga naik untuk jumlah kredit kecil
      if (jumlahKredit < this.jumlahKreditMinimal * 1.5) {
        sukuBunga += 1;
      }
      
      // Suku bunga naik untuk tenor panjang
      if (tenor > this.tenorMaksimal * 0.8) {
        sukuBunga += 0.5;
      }
      
      // Pastikan tidak melebihi maksimal
      sukuBunga = Math.min(sukuBunga, this.sukuBungaMaksimal);
      
      return Math.round(sukuBunga * 100) / 100;
    } catch (error) {
      console.error('[EntitasParameterKredit] Error determining suku bunga:', error);
      return this.sukuBungaMinimal;
    }
  }

  private async validateParameterRange(jumlahKredit: number, tenor: number, dp: number, sukuBunga: number): Promise<void> {
    try {
      const errors: string[] = [];
      
      if (jumlahKredit < this.jumlahKreditMinimal || jumlahKredit > this.jumlahKreditMaksimal) {
        errors.push(`Jumlah kredit harus antara ${this.jumlahKreditMinimal} - ${this.jumlahKreditMaksimal}`);
      }
      
      if (tenor < this.tenorMinimal || tenor > this.tenorMaksimal) {
        errors.push(`Tenor harus antara ${this.tenorMinimal} - ${this.tenorMaksimal} bulan`);
      }
      
      const dpPercentage = (dp / jumlahKredit) * 100;
      if (dpPercentage < this.dpMinimal || dpPercentage > this.dpMaksimal) {
        errors.push(`DP harus antara ${this.dpMinimal}% - ${this.dpMaksimal}%`);
      }
      
      if (sukuBunga < this.sukuBungaMinimal || sukuBunga > this.sukuBungaMaksimal) {
        errors.push(`Suku bunga harus antara ${this.sukuBungaMinimal}% - ${this.sukuBungaMaksimal}%`);
      }
      
      if (errors.length > 0) {
        throw new Error(`Parameter range errors: ${errors.join(', ')}`);
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Parameter range validation error:', error);
      throw error;
    }
  }

  private calculateAnuitasInterest(pokokPinjaman: number, bungaPerBulan: number, tenor: number): number {
    try {
      if (bungaPerBulan === 0) {
        return 0;
      }
      
      // Rumus anuitas: PMT = PV * (r * (1 + r)^n) / ((1 + r)^n - 1)
      const factor = Math.pow(1 + bungaPerBulan, tenor);
      const angsuranTotal = pokokPinjaman * (bungaPerBulan * factor) / (factor - 1);
      const angsuranPokok = pokokPinjaman / tenor;
      const angsuranBunga = angsuranTotal - angsuranPokok;
      
      return Math.round(angsuranBunga);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error calculating anuitas interest:', error);
      return 0;
    }
  }

  // Update methods
  private async validateUpdateData(dataUpdate: Partial<IEntitasParameterKredit>, existingParameter: IEntitasParameterKredit): Promise<void> {
    try {
      // Validasi data update tidak mengandung nilai yang tidak valid
      if (dataUpdate.sukuBungaMinimal !== undefined && dataUpdate.sukuBungaMinimal < 0) {
        throw new Error('Suku bunga minimal tidak boleh negatif');
      }
      
      if (dataUpdate.sukuBungaMaksimal !== undefined && dataUpdate.sukuBungaMaksimal < 0) {
        throw new Error('Suku bunga maksimal tidak boleh negatif');
      }
      
      if (dataUpdate.tenorMinimal !== undefined && dataUpdate.tenorMinimal <= 0) {
        throw new Error('Tenor minimal harus lebih besar dari 0');
      }
      
      if (dataUpdate.tenorMaksimal !== undefined && dataUpdate.tenorMaksimal <= 0) {
        throw new Error('Tenor maksimal harus lebih besar dari 0');
      }
      
      // Validasi konsistensi range
      const newSukuBungaMin = dataUpdate.sukuBungaMinimal ?? existingParameter.sukuBungaMinimal;
      const newSukuBungaMax = dataUpdate.sukuBungaMaksimal ?? existingParameter.sukuBungaMaksimal;
      
      if (newSukuBungaMin > newSukuBungaMax) {
        throw new Error('Suku bunga minimal tidak boleh lebih besar dari maksimal');
      }
      
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Update data validation error:', error);
      throw error;
    }
  }

  private async backupParameterData(parameter: IEntitasParameterKredit): Promise<void> {
    try {
      const backup = {
        ...parameter,
        backupTimestamp: new Date(),
        backupReason: 'Before update'
      };
      
      console.log('[EntitasParameterKredit] Parameter data backed up:', backup);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error backing up parameter data:', error);
    }
  }

  private async saveParameterToDatabase(parameter: IEntitasParameterKredit): Promise<void> {
    try {
      console.log('[EntitasParameterKredit] Saving parameter to database:', parameter);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error saving parameter:', error);
      throw error;
    }
  }

  private getChanges(oldData: IEntitasParameterKredit, newData: IEntitasParameterKredit): any {
    try {
      const changes: any = {};
      
      Object.keys(newData).forEach(key => {
        const oldValue = (oldData as any)[key];
        const newValue = (newData as any)[key];
        
        if (oldValue !== newValue) {
          changes[key] = {
            old: oldValue,
            new: newValue
          };
        }
      });
      
      return changes;
    } catch (error) {
      console.error('[EntitasParameterKredit] Error getting changes:', error);
      return {};
    }
  }

  // Statistics and analytics methods
  private async updateParameterSearchAnalytics(filter: IParameterKreditFilter, resultCount: number): Promise<void> {
    try {
      const analytics = {
        filter,
        resultCount,
        timestamp: new Date()
      };
      
      console.log('[EntitasParameterKredit] Parameter search analytics updated:', analytics);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error updating parameter search analytics:', error);
    }
  }

  private async updateKalkulasiStatistics(kalkulasi: IParameterKreditKalkulasi): Promise<void> {
    try {
      const stats = {
        kalkulasi,
        timestamp: new Date()
      };
      
      console.log('[EntitasParameterKredit] Kalkulasi statistics updated:', stats);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error updating kalkulasi statistics:', error);
    }
  }

  private async updateParameterStatistics(parameter: IEntitasParameterKredit): Promise<void> {
    try {
      const stats = {
        parameter,
        timestamp: new Date()
      };
      
      console.log('[EntitasParameterKredit] Parameter statistics updated:', stats);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error updating parameter statistics:', error);
    }
  }

  // Insights generation methods
  private async generateParameterSearchInsights(filter: IParameterKreditFilter, results: IEntitasParameterKredit[]): Promise<void> {
    try {
      const insights = {
        filter,
        resultCount: results.length,
        insights: [
          `Ditemukan ${results.length} parameter kredit`,
          `Filter: ${JSON.stringify(filter)}`,
          `Waktu pencarian: ${new Date().toISOString()}`
        ],
        timestamp: new Date()
      };
      
      console.log('[EntitasParameterKredit] Parameter search insights generated:', insights);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error generating parameter search insights:', error);
    }
  }

  private async generateKalkulasiInsights(kalkulasi: IParameterKreditKalkulasi): Promise<void> {
    try {
      const insights = {
        kalkulasi,
        insights: [
          `Total angsuran per bulan: ${kalkulasi.totalAngsuran}`,
          `Total pembayaran: ${kalkulasi.totalPembayaran}`,
          `Suku bunga: ${kalkulasi.sukuBunga}%`,
          `Tenor: ${kalkulasi.tenor} bulan`
        ],
        timestamp: new Date()
      };
      
      console.log('[EntitasParameterKredit] Kalkulasi insights generated:', insights);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error generating kalkulasi insights:', error);
    }
  }

  private async generateUpdateInsights(oldParameter: IEntitasParameterKredit, newParameter: IEntitasParameterKredit): Promise<void> {
    try {
      const changes = this.getChanges(oldParameter, newParameter);
      const insights = {
        oldParameter,
        newParameter,
        changes,
        insights: [
          `Parameter ${newParameter.namaParameter} telah diperbarui`,
          `Jumlah perubahan: ${Object.keys(changes).length}`,
          `Status: ${newParameter.statusAktif ? 'Aktif' : 'Tidak Aktif'}`
        ],
        timestamp: new Date()
      };
      
      console.log('[EntitasParameterKredit] Update insights generated:', insights);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error generating update insights:', error);
    }
  }

  // Notification methods
  private async sendParameterUpdateNotification(oldParameter: IEntitasParameterKredit, newParameter: IEntitasParameterKredit): Promise<void> {
    try {
      const changes = this.getChanges(oldParameter, newParameter);
      const hasImportantChanges = Object.keys(changes).some(key => 
        ['sukuBungaMinimal', 'sukuBungaMaksimal', 'statusAktif'].includes(key)
      );
      
      if (hasImportantChanges) {
        const notification: IParameterKreditNotifikasi = {
          idNotifikasi: `NOTIF-${Date.now()}`,
          idParameter: newParameter.idParameter,
          tipeNotifikasi: 'PARAMETER_UPDATE',
          judulNotifikasi: 'Parameter Kredit Diperbarui',
          isiNotifikasi: `Parameter ${newParameter.namaParameter} telah diperbarui dengan perubahan penting`,
          tanggalNotifikasi: new Date(),
          statusKirim: true,
          channel: 'EMAIL'
        };
        
        console.log('[EntitasParameterKredit] Parameter update notification sent:', notification);
      }
      
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error sending parameter update notification:', error);
    }
  }

  // Cache management methods
  private async updateParameterValidationCache(idParameter: string, validation: IParameterKreditValidation): Promise<void> {
    try {
      const cacheEntry = {
        idParameter,
        validation,
        timestamp: new Date()
      };
      
      console.log('[EntitasParameterKredit] Parameter validation cache updated:', cacheEntry);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error updating parameter validation cache:', error);
    }
  }

  private async updateParameterCache(idParameter: string, parameter: IEntitasParameterKredit): Promise<void> {
    try {
      const cacheEntry = {
        idParameter,
        parameter,
        timestamp: new Date()
      };
      
      console.log('[EntitasParameterKredit] Parameter cache updated:', cacheEntry);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error updating parameter cache:', error);
    }
  }

  // Activity logging methods
  private async logParameterActivity(action: string, idParameter: string, details: any): Promise<void> {
    try {
      const activity = {
        action,
        idParameter,
        details,
        timestamp: new Date(),
        userId: 'system'
      };
      
      console.log('[EntitasParameterKredit] Activity logged:', activity);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error logging activity:', error);
    }
  }

  // Error handling methods
  private async handleParameterError(error: Error): Promise<void> {
    try {
      const errorLog = {
        error: error.message,
        stack: error.stack,
        timestamp: new Date(),
        context: 'EntitasParameterKredit'
      };
      
      console.error('[EntitasParameterKredit] Error handled:', errorLog);
      
      // Send error notification to admin
      await this.sendErrorNotification(error);
      
      await this.simulateDelay(50);
    } catch (logError) {
      console.error('[EntitasParameterKredit] Error handling error:', logError);
    }
  }

  private async sendErrorNotification(error: Error): Promise<void> {
    try {
      const notification = {
        type: 'ERROR',
        message: error.message,
        timestamp: new Date(),
        context: 'EntitasParameterKredit'
      };
      
      console.log('[EntitasParameterKredit] Error notification sent:', notification);
      await this.simulateDelay(50);
    } catch (error) {
      console.error('[EntitasParameterKredit] Error sending error notification:', error);
    }
  }

  // Utility Methods
  public toJSON(): any {
    return {
      idParameter: this.idParameter,
      namaParameter: this.namaParameter,
      jenisKredit: this.jenisKredit,
      sukuBungaMinimal: this.sukuBungaMinimal,
      sukuBungaMaksimal: this.sukuBungaMaksimal,
      tenorMinimal: this.tenorMinimal,
      tenorMaksimal: this.tenorMaksimal,
      jumlahKreditMinimal: this.jumlahKreditMinimal,
      jumlahKreditMaksimal: this.jumlahKreditMaksimal,
      dpMinimal: this.dpMinimal,
      dpMaksimal: this.dpMaksimal,
      biayaAdmin: this.biayaAdmin,
      biayaProvisi: this.biayaProvisi,
      biayaAsuransi: this.biayaAsuransi,
      statusAktif: this.statusAktif,
      tanggalBerlaku: this.tanggalBerlaku.toISOString()
    };
  }

  public toString(): string {
    return `EntitasParameterKredit(${this.idParameter}, ${this.namaParameter}, ${this.jenisKredit}, ${this.statusAktif ? 'Aktif' : 'Tidak Aktif'})`;
  }

  public static fromJSON(data: any): EntitasParameterKredit {
    return new EntitasParameterKredit({
      idParameter: data.idParameter,
      namaParameter: data.namaParameter,
      jenisKredit: data.jenisKredit,
      sukuBungaMinimal: data.sukuBungaMinimal,
      sukuBungaMaksimal: data.sukuBungaMaksimal,
      tenorMinimal: data.tenorMinimal,
      tenorMaksimal: data.tenorMaksimal,
      jumlahKreditMinimal: data.jumlahKreditMinimal,
      jumlahKreditMaksimal: data.jumlahKreditMaksimal,
      dpMinimal: data.dpMinimal,
      dpMaksimal: data.dpMaksimal,
      biayaAdmin: data.biayaAdmin,
      biayaProvisi: data.biayaProvisi,
      biayaAsuransi: data.biayaAsuransi,
      statusAktif: data.statusAktif,
      tanggalBerlaku: new Date(data.tanggalBerlaku)
    });
  }

  public static createEmpty(): EntitasParameterKredit {
    return new EntitasParameterKredit();
  }

  // Validation Methods
  public isValid(): boolean {
    return this.idParameter.length > 0 &&
           this.namaParameter.length > 0 &&
           this.jenisKredit.length > 0 &&
           this.sukuBungaMinimal >= 0 &&
           this.sukuBungaMaksimal >= 0 &&
           this.sukuBungaMinimal <= this.sukuBungaMaksimal &&
           this.tenorMinimal > 0 &&
           this.tenorMaksimal > 0 &&
           this.tenorMinimal <= this.tenorMaksimal &&
           this.jumlahKreditMinimal > 0 &&
           this.jumlahKreditMaksimal > 0 &&
           this.jumlahKreditMinimal <= this.jumlahKreditMaksimal &&
           this.dpMinimal >= 0 &&
           this.dpMaksimal >= 0 &&
           this.dpMinimal <= this.dpMaksimal &&
           this.biayaAdmin >= 0 &&
           this.biayaProvisi >= 0 &&
           this.biayaAsuransi >= 0;
  }

  public getValidationErrors(): string[] {
    const errors: string[] = [];
    
    if (!this.idParameter || this.idParameter.length === 0) {
      errors.push('ID parameter harus diisi');
    }
    
    if (!this.namaParameter || this.namaParameter.length === 0) {
      errors.push('Nama parameter harus diisi');
    }
    
    if (!this.jenisKredit || this.jenisKredit.length === 0) {
      errors.push('Jenis kredit harus diisi');
    }
    
    if (this.sukuBungaMinimal < 0) {
      errors.push('Suku bunga minimal tidak boleh negatif');
    }
    
    if (this.sukuBungaMaksimal < 0) {
      errors.push('Suku bunga maksimal tidak boleh negatif');
    }
    
    if (this.sukuBungaMinimal > this.sukuBungaMaksimal) {
      errors.push('Suku bunga minimal tidak boleh lebih besar dari maksimal');
    }
    
    if (this.tenorMinimal <= 0) {
      errors.push('Tenor minimal harus lebih besar dari 0');
    }
    
    if (this.tenorMaksimal <= 0) {
      errors.push('Tenor maksimal harus lebih besar dari 0');
    }
    
    if (this.tenorMinimal > this.tenorMaksimal) {
      errors.push('Tenor minimal tidak boleh lebih besar dari maksimal');
    }
    
    if (this.jumlahKreditMinimal <= 0) {
      errors.push('Jumlah kredit minimal harus lebih besar dari 0');
    }
    
    if (this.jumlahKreditMaksimal <= 0) {
      errors.push('Jumlah kredit maksimal harus lebih besar dari 0');
    }
    
    if (this.jumlahKreditMinimal > this.jumlahKreditMaksimal) {
      errors.push('Jumlah kredit minimal tidak boleh lebih besar dari maksimal');
    }
    
    if (this.dpMinimal < 0) {
      errors.push('DP minimal tidak boleh negatif');
    }
    
    if (this.dpMaksimal < 0) {
      errors.push('DP maksimal tidak boleh negatif');
    }
    
    if (this.dpMinimal > this.dpMaksimal) {
      errors.push('DP minimal tidak boleh lebih besar dari maksimal');
    }
    
    if (this.biayaAdmin < 0) {
      errors.push('Biaya admin tidak boleh negatif');
    }
    
    if (this.biayaProvisi < 0) {
      errors.push('Biaya provisi tidak boleh negatif');
    }
    
    if (this.biayaAsuransi < 0) {
      errors.push('Biaya asuransi tidak boleh negatif');
    }
    
    return errors;
  }

  // Status Check Methods
  public isActive(): boolean {
    return this.statusAktif;
  }

  public isInactive(): boolean {
    return !this.statusAktif;
  }

  public isExpired(): boolean {
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    return this.tanggalBerlaku < oneYearAgo;
  }

  public isRecent(): boolean {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return this.tanggalBerlaku > oneMonthAgo;
  }

  public canBeUsed(): boolean {
    return this.statusAktif && !this.isExpired();
  }

  // Interest Rate Methods
  public hasLowInterestRate(): boolean {
    return this.sukuBungaMaksimal <= 10;
  }

  public hasHighInterestRate(): boolean {
    return this.sukuBungaMinimal >= 20;
  }

  public getInterestRateRange(): string {
    return `${this.sukuBungaMinimal}% - ${this.sukuBungaMaksimal}%`;
  }

  // Tenor Methods
  public hasShortTenor(): boolean {
    return this.tenorMaksimal <= 12;
  }

  public hasLongTenor(): boolean {
    return this.tenorMinimal >= 60;
  }

  public getTenorRangeInYears(): string {
    const minYears = Math.floor(this.tenorMinimal / 12);
    const maxYears = Math.floor(this.tenorMaksimal / 12);
    return `${minYears} - ${maxYears} tahun`;
  }

  // Credit Amount Methods
  public isSmallCredit(): boolean {
    return this.jumlahKreditMaksimal <= 50000000; // 50 juta
  }

  public isMediumCredit(): boolean {
    return this.jumlahKreditMinimal <= 500000000 && this.jumlahKreditMaksimal > 50000000; // 50 juta - 500 juta
  }

  public isLargeCredit(): boolean {
    return this.jumlahKreditMinimal > 500000000; // > 500 juta
  }

  public getCreditAmountRange(): string {
    return `Rp ${this.jumlahKreditMinimal.toLocaleString()} - Rp ${this.jumlahKreditMaksimal.toLocaleString()}`;
  }

  // Down Payment Methods
  public hasLowDP(): boolean {
    return this.dpMaksimal <= 20;
  }

  public hasHighDP(): boolean {
    return this.dpMinimal >= 50;
  }

  public getDPRange(): string {
    return `${this.dpMinimal}% - ${this.dpMaksimal}%`;
  }

  // Fee Methods
  public getTotalFees(): number {
    return this.biayaAdmin + this.biayaProvisi + this.biayaAsuransi;
  }

  public hasHighFees(): boolean {
    return this.getTotalFees() > 2000000; // > 2 juta
  }

  public getFeeBreakdown(): any {
    return {
      admin: this.biayaAdmin,
      provisi: this.biayaProvisi,
      asuransi: this.biayaAsuransi,
      total: this.getTotalFees()
    };
  }

  // Credit Type Methods
  public isVehicleCredit(): boolean {
    return ['MOBIL_BARU', 'MOBIL_BEKAS', 'MOTOR_BARU', 'MOTOR_BEKAS'].includes(this.jenisKredit);
  }

  public isNewVehicleCredit(): boolean {
    return ['MOBIL_BARU', 'MOTOR_BARU'].includes(this.jenisKredit);
  }

  public isUsedVehicleCredit(): boolean {
    return ['MOBIL_BEKAS', 'MOTOR_BEKAS'].includes(this.jenisKredit);
  }

  public isMultipurposeCredit(): boolean {
    return this.jenisKredit === 'MULTIGUNA';
  }

  // Time-based Methods
  public getAgeInDays(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.tanggalBerlaku.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public getAgeInMonths(): number {
    return Math.floor(this.getAgeInDays() / 30);
  }

  public getAgeInYears(): number {
    return Math.floor(this.getAgeInDays() / 365);
  }
}