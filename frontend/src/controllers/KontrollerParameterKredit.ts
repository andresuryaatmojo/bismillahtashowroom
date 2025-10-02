const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Interface untuk parameter kredit
export interface ParameterKredit {
  id: string;
  name: string;
  code: string;
  type: 'interest_rate' | 'down_payment' | 'loan_term' | 'fee' | 'insurance' | 'tax' | 'admin_fee' | 'provision_fee';
  category: 'vehicle' | 'customer' | 'bank' | 'dealer' | 'insurance' | 'government';
  value: number;
  unit: 'percentage' | 'amount' | 'months' | 'years' | 'multiplier';
  minValue?: number;
  maxValue?: number;
  defaultValue: number;
  isActive: boolean;
  isRequired: boolean;
  isEditable: boolean;
  description: string;
  formula?: string;
  conditions: KondisiParameter[];
  validFrom: string;
  validTo?: string;
  applicableFor: AplikasiParameter;
  metadata: MetadataParameter;
  history: HistoryParameter[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// Interface untuk kondisi parameter
export interface KondisiParameter {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'greater_equal' | 'less_equal' | 'in' | 'not_in' | 'between';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

// Interface untuk aplikasi parameter
export interface AplikasiParameter {
  vehicleTypes: string[]; // ['sedan', 'suv', 'hatchback', 'mpv', 'pickup', 'commercial']
  vehicleBrands: string[];
  vehicleModels: string[];
  priceRange: {
    min: number;
    max: number;
  };
  customerTypes: string[]; // ['individual', 'corporate', 'government']
  loanTypes: string[]; // ['conventional', 'sharia', 'leasing']
  banks: string[];
  regions: string[];
  dealerTypes: string[]; // ['main_dealer', 'sub_dealer', 'authorized_dealer']
}

// Interface untuk metadata parameter
export interface MetadataParameter {
  source: string;
  reference: string;
  lastUpdatedBy: string;
  approvedBy?: string;
  approvalDate?: string;
  version: number;
  tags: string[];
  notes: string;
  customFields: { [key: string]: any };
}

// Interface untuk history parameter
export interface HistoryParameter {
  id: string;
  action: 'created' | 'updated' | 'activated' | 'deactivated' | 'deleted';
  oldValue?: any;
  newValue?: any;
  reason: string;
  timestamp: string;
  userId: string;
  userName: string;
}

// Interface untuk grup parameter
export interface GrupParameter {
  id: string;
  name: string;
  description: string;
  parameters: string[]; // array of parameter IDs
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

// Interface untuk template parameter
export interface TemplateParameter {
  id: string;
  name: string;
  description: string;
  parameters: ParameterKredit[];
  isDefault: boolean;
  applicableFor: AplikasiParameter;
  createdAt: string;
  updatedAt: string;
}

// Interface untuk validasi parameter
export interface ValidasiParameter {
  valid: boolean;
  errors: { [field: string]: string[] };
  warnings: { [field: string]: string[] };
}

// Interface untuk filter parameter
export interface FilterParameter {
  type?: string[];
  category?: string[];
  isActive?: boolean;
  isRequired?: boolean;
  isEditable?: boolean;
  validFrom?: string;
  validTo?: string;
  vehicleTypes?: string[];
  vehicleBrands?: string[];
  customerTypes?: string[];
  loanTypes?: string[];
  banks?: string[];
  regions?: string[];
  search?: string;
}

// Interface untuk statistik parameter
export interface StatistikParameter {
  total: {
    parameters: number;
    active: number;
    inactive: number;
    required: number;
    editable: number;
  };
  byType: {
    [type: string]: {
      count: number;
      percentage: number;
    };
  };
  byCategory: {
    category: string;
    count: number;
    percentage: number;
  }[];
  usage: {
    mostUsed: ParameterKredit[];
    leastUsed: ParameterKredit[];
    recentlyUpdated: ParameterKredit[];
  };
  trends: {
    month: string;
    created: number;
    updated: number;
    activated: number;
    deactivated: number;
  }[];
}

// Interface untuk halaman parameter
export interface HalamanParameter {
  parameters: ParameterKredit[];
  groups: GrupParameter[];
  templates: TemplateParameter[];
  statistics: StatistikParameter;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface untuk form parameter
export interface FormParameter {
  id?: string;
  name: string;
  code: string;
  type: string;
  category: string;
  value: number;
  unit: string;
  minValue?: number;
  maxValue?: number;
  defaultValue: number;
  isActive: boolean;
  isRequired: boolean;
  isEditable: boolean;
  description: string;
  formula?: string;
  conditions: KondisiParameter[];
  validFrom: string;
  validTo?: string;
  applicableFor: AplikasiParameter;
  metadata: MetadataParameter;
}

// Interface untuk bulk action
export interface BulkActionParameter {
  action: 'activate' | 'deactivate' | 'delete' | 'duplicate' | 'export' | 'update_category' | 'update_type';
  parameterIds: string[];
  data?: any;
}

// Interface untuk import/export
export interface ImportExportParameter {
  format: 'json' | 'csv' | 'xlsx';
  includeHistory: boolean;
  includeMetadata: boolean;
  filterBy?: FilterParameter;
}

export class KontrollerParameterKredit {
  private token: string | null = null;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  /**
   * Memuat daftar parameter kredit dengan filter dan pagination
   * @param page - Halaman (default: 1)
   * @param limit - Jumlah per halaman (default: 20)
   * @param filter - Filter parameter
   * @param sortBy - Urutan data
   * @returns Promise<HalamanParameter>
   */
  public async muatDaftarParameter(
    page: number = 1,
    limit: number = 20,
    filter?: FilterParameter,
    sortBy: string = 'updatedAt_desc'
  ): Promise<HalamanParameter> {
    try {
      // Check cache first
      const cacheKey = `parameter_list_${page}_${limit}_${JSON.stringify(filter)}_${sortBy}`;
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
        if (filter.type) params.append('type', filter.type.join(','));
        if (filter.category) params.append('category', filter.category.join(','));
        if (filter.isActive !== undefined) params.append('isActive', filter.isActive.toString());
        if (filter.isRequired !== undefined) params.append('isRequired', filter.isRequired.toString());
        if (filter.isEditable !== undefined) params.append('isEditable', filter.isEditable.toString());
        if (filter.validFrom) params.append('validFrom', filter.validFrom);
        if (filter.validTo) params.append('validTo', filter.validTo);
        if (filter.vehicleTypes) params.append('vehicleTypes', filter.vehicleTypes.join(','));
        if (filter.vehicleBrands) params.append('vehicleBrands', filter.vehicleBrands.join(','));
        if (filter.customerTypes) params.append('customerTypes', filter.customerTypes.join(','));
        if (filter.loanTypes) params.append('loanTypes', filter.loanTypes.join(','));
        if (filter.banks) params.append('banks', filter.banks.join(','));
        if (filter.regions) params.append('regions', filter.regions.join(','));
        if (filter.search) params.append('search', filter.search);
      }

      const response = await fetch(`${API_BASE_URL}/credit-parameters?${params}`, {
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
      
      const halamanData: HalamanParameter = {
        parameters: result.data.parameters || [],
        groups: result.data.groups || [],
        templates: result.data.templates || [],
        statistics: result.data.statistics || this.getDefaultStatistik(),
        total: result.data.total || 0,
        page: result.data.page || 1,
        limit: result.data.limit || 20,
        totalPages: result.data.totalPages || 1
      };

      // Cache the result
      this.setToCache(cacheKey, halamanData);

      return halamanData;

    } catch (error) {
      console.error('Error loading parameter list:', error);
      return {
        parameters: [],
        groups: [],
        templates: [],
        statistics: this.getDefaultStatistik(),
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1
      };
    }
  }

  /**
   * Memuat detail parameter berdasarkan ID
   * @param idParameter - ID parameter yang akan dimuat
   * @returns Promise<ParameterKredit | null>
   */
  public async muatDetailParameter(idParameter: string): Promise<ParameterKredit | null> {
    try {
      // Check cache first
      const cacheKey = `parameter_detail_${idParameter}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const response = await fetch(`${API_BASE_URL}/credit-parameters/${idParameter}`, {
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
      const parameter = result.data;

      // Cache the result
      this.setToCache(cacheKey, parameter);

      return parameter;

    } catch (error) {
      console.error('Error loading parameter detail:', error);
      return null;
    }
  }

  /**
   * Simpan perubahan parameter (create atau update)
   * @param dataParameter - Data parameter yang akan disimpan
   * @returns Promise<{success: boolean, message: string, id?: string}>
   */
  public async simpanPerubahan(dataParameter: FormParameter): Promise<{
    success: boolean;
    message: string;
    id?: string;
  }> {
    try {
      // Validasi data terlebih dahulu
      const validasi = await this.validasiParameter(dataParameter);
      if (!validasi.valid) {
        return {
          success: false,
          message: 'Data tidak valid: ' + Object.values(validasi.errors).flat().join(', ')
        };
      }

      const isUpdate = !!dataParameter.id;
      const url = isUpdate 
        ? `${API_BASE_URL}/credit-parameters/${dataParameter.id}`
        : `${API_BASE_URL}/credit-parameters`;
      
      const method = isUpdate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify(dataParameter)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Gagal ${isUpdate ? 'memperbarui' : 'menambah'} parameter`);
      }

      // Clear cache
      this.clearCacheByPattern('parameter_');

      return {
        success: true,
        message: `Parameter berhasil ${isUpdate ? 'diperbarui' : 'ditambahkan'}`,
        id: result.data.id
      };

    } catch (error) {
      console.error('Error saving parameter:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan parameter'
      };
    }
  }

  /**
   * Proses hapus parameter
   * @param idParameter - ID parameter yang akan dihapus
   * @param permanent - Apakah hapus permanen (default: false)
   * @returns Promise<{success: boolean, message: string}>
   */
  public async prosesHapusParameter(
    idParameter: string,
    permanent: boolean = false
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Check if parameter is being used
      const usageCheck = await this.cekPenggunaanParameter(idParameter);
      if (usageCheck.isUsed && permanent) {
        return {
          success: false,
          message: `Parameter tidak dapat dihapus karena sedang digunakan di ${usageCheck.usageCount} tempat`
        };
      }

      const params = new URLSearchParams();
      if (permanent) {
        params.append('permanent', 'true');
      }

      const response = await fetch(`${API_BASE_URL}/credit-parameters/${idParameter}?${params}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menghapus parameter');
      }

      // Clear cache
      this.clearCacheByPattern('parameter_');

      return {
        success: true,
        message: permanent ? 'Parameter berhasil dihapus permanen' : 'Parameter berhasil dinonaktifkan'
      };

    } catch (error) {
      console.error('Error deleting parameter:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus parameter'
      };
    }
  }

  /**
   * Duplicate parameter
   * @param idParameter - ID parameter yang akan diduplicate
   * @param newName - Nama baru untuk parameter duplicate
   * @returns Promise<{success: boolean, message: string, id?: string}>
   */
  public async duplicateParameter(
    idParameter: string,
    newName?: string
  ): Promise<{
    success: boolean;
    message: string;
    id?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/credit-parameters/${idParameter}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({ newName })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menduplicate parameter');
      }

      // Clear cache
      this.clearCacheByPattern('parameter_');

      return {
        success: true,
        message: 'Parameter berhasil diduplicate',
        id: result.data.id
      };

    } catch (error) {
      console.error('Error duplicating parameter:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat menduplicate parameter'
      };
    }
  }

  /**
   * Bulk action untuk multiple parameter
   * @param bulkAction - Data bulk action
   * @returns Promise<{success: boolean, message: string, results?: any}>
   */
  public async prosesBulkAction(bulkAction: BulkActionParameter): Promise<{
    success: boolean;
    message: string;
    results?: any;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/credit-parameters/bulk-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify(bulkAction)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal memproses bulk action');
      }

      // Clear cache
      this.clearCacheByPattern('parameter_');

      return {
        success: true,
        message: `Bulk action berhasil diproses untuk ${bulkAction.parameterIds.length} parameter`,
        results: result.data
      };

    } catch (error) {
      console.error('Error processing bulk action:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses bulk action'
      };
    }
  }

  /**
   * Import parameter dari file
   * @param file - File yang akan diimport
   * @param options - Opsi import
   * @returns Promise<{success: boolean, message: string, results?: any}>
   */
  public async importParameter(
    file: File,
    options?: {
      overwrite?: boolean;
      validateOnly?: boolean;
    }
  ): Promise<{
    success: boolean;
    message: string;
    results?: any;
  }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (options) {
        formData.append('options', JSON.stringify(options));
      }

      const response = await fetch(`${API_BASE_URL}/credit-parameters/import`, {
        method: 'POST',
        headers: {
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengimport parameter');
      }

      // Clear cache if not validation only
      if (!options?.validateOnly) {
        this.clearCacheByPattern('parameter_');
      }

      return {
        success: true,
        message: options?.validateOnly ? 'Validasi import berhasil' : 'Parameter berhasil diimport',
        results: result.data
      };

    } catch (error) {
      console.error('Error importing parameters:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengimport parameter'
      };
    }
  }

  /**
   * Export parameter ke file
   * @param options - Opsi export
   * @returns Promise<{success: boolean, message: string, downloadUrl?: string}>
   */
  public async exportParameter(options: ImportExportParameter): Promise<{
    success: boolean;
    message: string;
    downloadUrl?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/credit-parameters/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify(options)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengexport parameter');
      }

      return {
        success: true,
        message: 'Parameter berhasil diexport',
        downloadUrl: result.data.downloadUrl
      };

    } catch (error) {
      console.error('Error exporting parameters:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengexport parameter'
      };
    }
  }

  /**
   * Cek penggunaan parameter
   * @param idParameter - ID parameter yang akan dicek
   * @returns Promise<{isUsed: boolean, usageCount: number, usageDetails: any[]}>
   */
  public async cekPenggunaanParameter(idParameter: string): Promise<{
    isUsed: boolean;
    usageCount: number;
    usageDetails: any[];
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/credit-parameters/${idParameter}/usage`, {
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
      return result.data;

    } catch (error) {
      console.error('Error checking parameter usage:', error);
      return {
        isUsed: false,
        usageCount: 0,
        usageDetails: []
      };
    }
  }

  /**
   * Validasi parameter
   * @param data - Data parameter yang akan divalidasi
   * @returns Promise<ValidasiParameter>
   */
  public async validasiParameter(data: FormParameter): Promise<ValidasiParameter> {
    const validasi: ValidasiParameter = {
      valid: true,
      errors: {},
      warnings: {}
    };

    // Validasi name
    if (!data.name || data.name.trim() === '') {
      validasi.errors.name = ['Nama parameter harus diisi'];
      validasi.valid = false;
    } else if (data.name.length > 100) {
      validasi.errors.name = ['Nama parameter maksimal 100 karakter'];
      validasi.valid = false;
    }

    // Validasi code
    if (!data.code || data.code.trim() === '') {
      validasi.errors.code = ['Kode parameter harus diisi'];
      validasi.valid = false;
    } else if (!/^[A-Z0-9_]+$/.test(data.code)) {
      validasi.errors.code = ['Kode parameter hanya boleh mengandung huruf besar, angka, dan underscore'];
      validasi.valid = false;
    }

    // Validasi type
    const validTypes = ['interest_rate', 'down_payment', 'loan_term', 'fee', 'insurance', 'tax', 'admin_fee', 'provision_fee'];
    if (!validTypes.includes(data.type)) {
      validasi.errors.type = ['Tipe parameter tidak valid'];
      validasi.valid = false;
    }

    // Validasi category
    const validCategories = ['vehicle', 'customer', 'bank', 'dealer', 'insurance', 'government'];
    if (!validCategories.includes(data.category)) {
      validasi.errors.category = ['Kategori parameter tidak valid'];
      validasi.valid = false;
    }

    // Validasi value
    if (data.value === undefined || data.value === null) {
      validasi.errors.value = ['Nilai parameter harus diisi'];
      validasi.valid = false;
    } else if (data.value < 0) {
      validasi.errors.value = ['Nilai parameter tidak boleh negatif'];
      validasi.valid = false;
    }

    // Validasi unit
    const validUnits = ['percentage', 'amount', 'months', 'years', 'multiplier'];
    if (!validUnits.includes(data.unit)) {
      validasi.errors.unit = ['Unit parameter tidak valid'];
      validasi.valid = false;
    }

    // Validasi min/max value
    if (data.minValue !== undefined && data.maxValue !== undefined) {
      if (data.minValue > data.maxValue) {
        validasi.errors.minValue = ['Nilai minimum tidak boleh lebih besar dari nilai maksimum'];
        validasi.valid = false;
      }
    }

    if (data.minValue !== undefined && data.value < data.minValue) {
      validasi.warnings.value = ['Nilai parameter di bawah nilai minimum yang direkomendasikan'];
    }

    if (data.maxValue !== undefined && data.value > data.maxValue) {
      validasi.warnings.value = ['Nilai parameter di atas nilai maksimum yang direkomendasikan'];
    }

    // Validasi valid from
    if (!data.validFrom) {
      validasi.errors.validFrom = ['Tanggal berlaku dari harus diisi'];
      validasi.valid = false;
    }

    // Validasi valid to
    if (data.validTo && new Date(data.validTo) <= new Date(data.validFrom)) {
      validasi.errors.validTo = ['Tanggal berlaku sampai harus setelah tanggal berlaku dari'];
      validasi.valid = false;
    }

    // Validasi description
    if (!data.description || data.description.trim() === '') {
      validasi.errors.description = ['Deskripsi parameter harus diisi'];
      validasi.valid = false;
    }

    // Validasi formula jika ada
    if (data.formula && data.formula.trim() !== '') {
      try {
        // Basic formula validation - check for balanced parentheses
        const openParens = (data.formula.match(/\(/g) || []).length;
        const closeParens = (data.formula.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
          validasi.errors.formula = ['Formula tidak valid: tanda kurung tidak seimbang'];
          validasi.valid = false;
        }
      } catch (error) {
        validasi.errors.formula = ['Formula tidak valid'];
        validasi.valid = false;
      }
    }

    return validasi;
  }

  /**
   * Generate kode parameter otomatis
   * @param type - Tipe parameter
   * @param category - Kategori parameter
   * @returns string
   */
  public generateKodeParameter(type: string, category: string): string {
    const typePrefix = type.toUpperCase().replace(/_/g, '');
    const categoryPrefix = category.toUpperCase().substring(0, 3);
    const timestamp = Date.now().toString().slice(-4);
    
    return `${categoryPrefix}_${typePrefix}_${timestamp}`;
  }

  /**
   * Format nilai parameter
   * @param value - Nilai parameter
   * @param unit - Unit parameter
   * @returns string
   */
  public formatNilaiParameter(value: number, unit: string): string {
    switch (unit) {
      case 'percentage':
        return `${value.toFixed(2)}%`;
      case 'amount':
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0
        }).format(value);
      case 'months':
        return `${value} bulan`;
      case 'years':
        return `${value} tahun`;
      case 'multiplier':
        return `${value}x`;
      default:
        return value.toString();
    }
  }

  /**
   * Get type label
   */
  public getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'interest_rate': 'Suku Bunga',
      'down_payment': 'Uang Muka',
      'loan_term': 'Jangka Waktu',
      'fee': 'Biaya',
      'insurance': 'Asuransi',
      'tax': 'Pajak',
      'admin_fee': 'Biaya Admin',
      'provision_fee': 'Biaya Provisi'
    };
    return labels[type] || type;
  }

  /**
   * Get category label
   */
  public getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'vehicle': 'Kendaraan',
      'customer': 'Pelanggan',
      'bank': 'Bank',
      'dealer': 'Dealer',
      'insurance': 'Asuransi',
      'government': 'Pemerintah'
    };
    return labels[category] || category;
  }

  /**
   * Get status color
   */
  public getStatusColor(isActive: boolean): string {
    return isActive ? 'green' : 'red';
  }

  /**
   * Format tanggal
   */
  public formatTanggal(tanggal: string): string {
    return new Date(tanggal).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Get default statistik
   */
  private getDefaultStatistik(): StatistikParameter {
    return {
      total: {
        parameters: 0,
        active: 0,
        inactive: 0,
        required: 0,
        editable: 0
      },
      byType: {},
      byCategory: [],
      usage: {
        mostUsed: [],
        leastUsed: [],
        recentlyUpdated: []
      },
      trends: []
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

export default KontrollerParameterKredit;
