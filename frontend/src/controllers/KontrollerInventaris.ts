const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Interface untuk data inventaris mobil
export interface DataInventaris {
  id: string;
  vin: string; // Vehicle Identification Number
  brand: string;
  model: string;
  variant: string;
  year: number;
  color: string;
  colorCode: string;
  transmission: 'manual' | 'automatic' | 'cvt';
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  engine: {
    capacity: number;
    power: number;
    torque: number;
  };
  price: {
    cost: number; // harga beli/cost
    selling: number; // harga jual
    margin: number; // margin keuntungan
    discount: number; // diskon yang bisa diberikan
  };
  status: 'available' | 'reserved' | 'sold' | 'maintenance' | 'damaged' | 'transit';
  condition: 'new' | 'used' | 'demo';
  location: {
    branch: string;
    branchId: string;
    lot: string;
    position: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  acquisition: {
    source: 'manufacturer' | 'trade_in' | 'auction' | 'lease_return' | 'other';
    date: string;
    supplier: string;
    purchaseOrder: string;
    cost: number;
    mileage?: number; // untuk mobil bekas
  };
  documentation: {
    stnk: {
      available: boolean;
      expiryDate?: string;
      owner: string;
    };
    bpkb: {
      available: boolean;
      status: 'original' | 'copy' | 'pending';
      location: string;
    };
    invoice: {
      available: boolean;
      number: string;
      date: string;
    };
    warranty: {
      available: boolean;
      duration: number; // dalam bulan
      coverage: string[];
      provider: string;
    };
    inspection: {
      completed: boolean;
      date?: string;
      inspector: string;
      report: string;
      score: number; // 1-100
    };
  };
  features: string[];
  specifications: {
    [category: string]: {
      [key: string]: string | number | boolean;
    };
  };
  images: {
    exterior: string[];
    interior: string[];
    engine: string[];
    documents: string[];
    main: string;
  };
  history: HistoryInventaris[];
  reservations: ReservasiInventaris[];
  maintenance: MaintenanceRecord[];
  marketing: {
    featured: boolean;
    promoted: boolean;
    tags: string[];
    description: string;
    highlights: string[];
    targetCustomer: string[];
  };
  analytics: {
    views: number;
    inquiries: number;
    testDrives: number;
    daysInInventory: number;
    priceChanges: number;
    lastActivity: string;
  };
  alerts: AlertInventaris[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// Interface untuk history inventaris
export interface HistoryInventaris {
  id: string;
  action: 'created' | 'updated' | 'reserved' | 'sold' | 'maintenance' | 'moved' | 'price_changed' | 'status_changed';
  description: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
  userId: string;
  userName: string;
  notes?: string;
}

// Interface untuk reservasi inventaris
export interface ReservasiInventaris {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  reservationDate: string;
  expiryDate: string;
  deposit: number;
  status: 'active' | 'expired' | 'cancelled' | 'converted';
  notes: string;
  salesPerson: string;
  createdAt: string;
}

// Interface untuk maintenance record
export interface MaintenanceRecord {
  id: string;
  type: 'routine' | 'repair' | 'inspection' | 'cleaning' | 'preparation';
  description: string;
  startDate: string;
  endDate?: string;
  cost: number;
  vendor: string;
  technician: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  parts: {
    name: string;
    quantity: number;
    cost: number;
  }[];
  notes: string;
  images: string[];
}

// Interface untuk alert inventaris
export interface AlertInventaris {
  id: string;
  type: 'low_stock' | 'aging_inventory' | 'document_expiry' | 'maintenance_due' | 'price_alert' | 'reservation_expiry';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionRequired: boolean;
  actionUrl?: string;
  createdAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

// Interface untuk filter inventaris
export interface FilterInventaris {
  brands?: string[];
  models?: string[];
  years?: {
    min: number;
    max: number;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  status?: string[];
  condition?: string[];
  location?: string[];
  transmission?: string[];
  fuelType?: string[];
  colors?: string[];
  features?: string[];
  daysInInventory?: {
    min: number;
    max: number;
  };
  documentStatus?: {
    stnk?: boolean;
    bpkb?: boolean;
    invoice?: boolean;
    warranty?: boolean;
  };
  alerts?: string[];
  search?: string;
}

// Interface untuk statistik inventaris
export interface StatistikInventaris {
  total: {
    units: number;
    value: number;
    cost: number;
    margin: number;
  };
  byStatus: {
    [status: string]: {
      count: number;
      value: number;
      percentage: number;
    };
  };
  byCondition: {
    [condition: string]: {
      count: number;
      value: number;
      percentage: number;
    };
  };
  byBrand: {
    brand: string;
    count: number;
    value: number;
    percentage: number;
  }[];
  byLocation: {
    location: string;
    count: number;
    value: number;
    percentage: number;
  }[];
  aging: {
    '0-30': number;
    '31-60': number;
    '61-90': number;
    '91-180': number;
    '180+': number;
  };
  turnover: {
    monthly: number;
    quarterly: number;
    yearly: number;
    averageDays: number;
  };
  alerts: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  trends: {
    month: string;
    acquired: number;
    sold: number;
    remaining: number;
    value: number;
  }[];
}

// Interface untuk halaman inventaris
export interface HalamanInventaris {
  inventaris: DataInventaris[];
  total: number;
  statistik: StatistikInventaris;
  filter: FilterInventaris;
  sortOptions: SortOption[];
  alerts: AlertInventaris[];
  quickActions: QuickAction[];
  exportOptions: ExportOption[];
}

// Interface untuk sort option
export interface SortOption {
  value: string;
  label: string;
  field: string;
  direction: 'asc' | 'desc';
}

// Interface untuk quick action
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  color: string;
  count?: number;
  enabled: boolean;
}

// Interface untuk export option
export interface ExportOption {
  format: 'excel' | 'csv' | 'pdf';
  label: string;
  description: string;
  fields: string[];
}

// Interface untuk bulk action
export interface BulkAction {
  action: 'update_status' | 'update_location' | 'update_price' | 'add_tags' | 'schedule_maintenance' | 'export' | 'delete';
  items: string[]; // array of inventory IDs
  data?: any; // additional data for the action
}

export class KontrollerInventaris {
  private token: string | null = null;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for inventory data

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  /**
   * Memuat data inventaris dengan filter dan pagination
   * @param page - Halaman (default: 1)
   * @param limit - Jumlah per halaman (default: 20)
   * @param filter - Filter inventaris
   * @param sortBy - Urutan data
   * @returns Promise<HalamanInventaris>
   */
  public async muatDataInventaris(
    page: number = 1,
    limit: number = 20,
    filter?: FilterInventaris,
    sortBy: string = 'updatedAt_desc'
  ): Promise<HalamanInventaris> {
    try {
      // Check cache first (shorter cache for inventory due to frequent updates)
      const cacheKey = `inventaris_${page}_${limit}_${JSON.stringify(filter)}_${sortBy}`;
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
        if (filter.brands) params.append('brands', filter.brands.join(','));
        if (filter.models) params.append('models', filter.models.join(','));
        if (filter.years) {
          params.append('minYear', filter.years.min.toString());
          params.append('maxYear', filter.years.max.toString());
        }
        if (filter.priceRange) {
          params.append('minPrice', filter.priceRange.min.toString());
          params.append('maxPrice', filter.priceRange.max.toString());
        }
        if (filter.status) params.append('status', filter.status.join(','));
        if (filter.condition) params.append('condition', filter.condition.join(','));
        if (filter.location) params.append('location', filter.location.join(','));
        if (filter.transmission) params.append('transmission', filter.transmission.join(','));
        if (filter.fuelType) params.append('fuelType', filter.fuelType.join(','));
        if (filter.colors) params.append('colors', filter.colors.join(','));
        if (filter.features) params.append('features', filter.features.join(','));
        if (filter.daysInInventory) {
          params.append('minDays', filter.daysInInventory.min.toString());
          params.append('maxDays', filter.daysInInventory.max.toString());
        }
        if (filter.documentStatus) {
          params.append('documentStatus', JSON.stringify(filter.documentStatus));
        }
        if (filter.alerts) params.append('alerts', filter.alerts.join(','));
        if (filter.search) params.append('search', filter.search);
      }

      const response = await fetch(`${API_BASE_URL}/inventory?${params}`, {
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
      
      const halamanData: HalamanInventaris = {
        inventaris: result.data.inventory || [],
        total: result.data.total || 0,
        statistik: result.data.statistics || this.getDefaultStatistik(),
        filter: filter || {},
        sortOptions: this.getSortOptions(),
        alerts: result.data.alerts || [],
        quickActions: this.getQuickActions(),
        exportOptions: this.getExportOptions()
      };

      // Cache the result
      this.setToCache(cacheKey, halamanData);

      return halamanData;

    } catch (error) {
      console.error('Error loading inventory data:', error);
      return {
        inventaris: [],
        total: 0,
        statistik: this.getDefaultStatistik(),
        filter: filter || {},
        sortOptions: this.getSortOptions(),
        alerts: [],
        quickActions: this.getQuickActions(),
        exportOptions: this.getExportOptions()
      };
    }
  }

  /**
   * Memuat detail inventaris berdasarkan ID
   * @param id - ID inventaris
   * @returns Promise<DataInventaris | null>
   */
  public async muatDetailInventaris(id: string): Promise<DataInventaris | null> {
    try {
      // Check cache first
      const cacheKey = `inventaris_detail_${id}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
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
      console.error('Error loading inventory detail:', error);
      return null;
    }
  }

  /**
   * Tambah inventaris baru
   * @param data - Data inventaris baru
   * @returns Promise<{success: boolean, message: string, id?: string}>
   */
  public async tambahInventaris(data: Partial<DataInventaris>): Promise<{
    success: boolean;
    message: string;
    id?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menambah inventaris');
      }

      // Clear cache
      this.clearCacheByPattern('inventaris_');

      return {
        success: true,
        message: 'Inventaris berhasil ditambahkan',
        id: result.data.id
      };

    } catch (error) {
      console.error('Error adding inventory:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat menambah inventaris'
      };
    }
  }

  /**
   * Update inventaris
   * @param id - ID inventaris
   * @param data - Data yang akan diupdate
   * @returns Promise<{success: boolean, message: string}>
   */
  public async updateInventaris(
    id: string,
    data: Partial<DataInventaris>
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengupdate inventaris');
      }

      // Clear cache
      this.clearCacheByPattern('inventaris_');

      return {
        success: true,
        message: 'Inventaris berhasil diupdate'
      };

    } catch (error) {
      console.error('Error updating inventory:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengupdate inventaris'
      };
    }
  }

  /**
   * Hapus inventaris
   * @param id - ID inventaris
   * @returns Promise<{success: boolean, message: string}>
   */
  public async hapusInventaris(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menghapus inventaris');
      }

      // Clear cache
      this.clearCacheByPattern('inventaris_');

      return {
        success: true,
        message: 'Inventaris berhasil dihapus'
      };

    } catch (error) {
      console.error('Error deleting inventory:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus inventaris'
      };
    }
  }

  /**
   * Bulk action untuk multiple inventaris
   * @param bulkAction - Data bulk action
   * @returns Promise<{success: boolean, message: string, results?: any}>
   */
  public async prosesBulkAction(bulkAction: BulkAction): Promise<{
    success: boolean;
    message: string;
    results?: any;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/bulk-action`, {
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
      this.clearCacheByPattern('inventaris_');

      return {
        success: true,
        message: `Bulk action berhasil diproses untuk ${bulkAction.items.length} item`,
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
   * Export data inventaris
   * @param format - Format export
   * @param filter - Filter data yang akan diexport
   * @param fields - Field yang akan diexport
   * @returns Promise<{success: boolean, message: string, downloadUrl?: string}>
   */
  public async exportInventaris(
    format: 'excel' | 'csv' | 'pdf',
    filter?: FilterInventaris,
    fields?: string[]
  ): Promise<{
    success: boolean;
    message: string;
    downloadUrl?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          format,
          filter,
          fields,
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal mengexport data inventaris');
      }

      return {
        success: true,
        message: `Data inventaris berhasil diexport ke ${format.toUpperCase()}`,
        downloadUrl: result.data.downloadUrl
      };

    } catch (error) {
      console.error('Error exporting inventory:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengexport data inventaris'
      };
    }
  }

  /**
   * Acknowledge alert
   * @param alertId - ID alert
   * @returns Promise<{success: boolean, message: string}>
   */
  public async acknowledgeAlert(alertId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal acknowledge alert');
      }

      // Clear cache
      this.clearCacheByPattern('inventaris_');

      return {
        success: true,
        message: 'Alert berhasil di-acknowledge'
      };

    } catch (error) {
      console.error('Error acknowledging alert:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat acknowledge alert'
      };
    }
  }

  /**
   * Tambah maintenance record
   * @param inventarisId - ID inventaris
   * @param maintenance - Data maintenance
   * @returns Promise<{success: boolean, message: string, id?: string}>
   */
  public async tambahMaintenance(
    inventarisId: string,
    maintenance: Partial<MaintenanceRecord>
  ): Promise<{
    success: boolean;
    message: string;
    id?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${inventarisId}/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify(maintenance)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Gagal menambah maintenance record');
      }

      // Clear cache
      this.clearCacheByPattern('inventaris_');

      return {
        success: true,
        message: 'Maintenance record berhasil ditambahkan',
        id: result.data.id
      };

    } catch (error) {
      console.error('Error adding maintenance:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat menambah maintenance record'
      };
    }
  }

  /**
   * Utility methods
   */

  /**
   * Format harga ke Rupiah
   */
  public formatHarga(harga: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(harga);
  }

  /**
   * Format tanggal
   */
  public formatTanggal(tanggal: string): string {
    return new Date(tanggal).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  /**
   * Get status color
   */
  public getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'available': 'green',
      'reserved': 'blue',
      'sold': 'gray',
      'maintenance': 'orange',
      'damaged': 'red',
      'transit': 'purple'
    };
    return colors[status] || 'gray';
  }

  /**
   * Get condition badge
   */
  public getConditionBadge(condition: string): string {
    const badges: { [key: string]: string } = {
      'new': 'Baru',
      'used': 'Bekas',
      'demo': 'Demo'
    };
    return badges[condition] || condition;
  }

  /**
   * Calculate days in inventory
   */
  public calculateDaysInInventory(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get default statistik
   */
  private getDefaultStatistik(): StatistikInventaris {
    return {
      total: {
        units: 0,
        value: 0,
        cost: 0,
        margin: 0
      },
      byStatus: {},
      byCondition: {},
      byBrand: [],
      byLocation: [],
      aging: {
        '0-30': 0,
        '31-60': 0,
        '61-90': 0,
        '91-180': 0,
        '180+': 0
      },
      turnover: {
        monthly: 0,
        quarterly: 0,
        yearly: 0,
        averageDays: 0
      },
      alerts: {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      trends: []
    };
  }

  /**
   * Get sort options
   */
  private getSortOptions(): SortOption[] {
    return [
      { value: 'updatedAt_desc', label: 'Terbaru Diupdate', field: 'updatedAt', direction: 'desc' },
      { value: 'createdAt_desc', label: 'Terbaru Ditambah', field: 'createdAt', direction: 'desc' },
      { value: 'price_asc', label: 'Harga Terendah', field: 'price.selling', direction: 'asc' },
      { value: 'price_desc', label: 'Harga Tertinggi', field: 'price.selling', direction: 'desc' },
      { value: 'brand_asc', label: 'Brand A-Z', field: 'brand', direction: 'asc' },
      { value: 'year_desc', label: 'Tahun Terbaru', field: 'year', direction: 'desc' },
      { value: 'days_desc', label: 'Terlama di Inventaris', field: 'daysInInventory', direction: 'desc' },
      { value: 'status_asc', label: 'Status', field: 'status', direction: 'asc' }
    ];
  }

  /**
   * Get quick actions
   */
  private getQuickActions(): QuickAction[] {
    return [
      {
        id: 'add_new',
        label: 'Tambah Inventaris',
        icon: 'plus',
        action: 'add_inventory',
        color: 'blue',
        enabled: true
      },
      {
        id: 'bulk_update',
        label: 'Update Massal',
        icon: 'edit',
        action: 'bulk_update',
        color: 'green',
        enabled: true
      },
      {
        id: 'export_data',
        label: 'Export Data',
        icon: 'download',
        action: 'export',
        color: 'purple',
        enabled: true
      },
      {
        id: 'view_alerts',
        label: 'Lihat Alert',
        icon: 'alert',
        action: 'view_alerts',
        color: 'red',
        enabled: true
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: 'chart',
        action: 'view_analytics',
        color: 'orange',
        enabled: true
      }
    ];
  }

  /**
   * Get export options
   */
  private getExportOptions(): ExportOption[] {
    return [
      {
        format: 'excel',
        label: 'Excel (.xlsx)',
        description: 'Export lengkap dengan formatting',
        fields: ['all']
      },
      {
        format: 'csv',
        label: 'CSV (.csv)',
        description: 'Format sederhana untuk import/export',
        fields: ['basic']
      },
      {
        format: 'pdf',
        label: 'PDF (.pdf)',
        description: 'Laporan inventaris untuk print',
        fields: ['summary']
      }
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
    const cacheKeys = Array.from(this.cache.keys());
    for (const key of cacheKeys) {
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

export default KontrollerInventaris;