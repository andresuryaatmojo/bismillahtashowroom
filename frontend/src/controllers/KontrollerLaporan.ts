import axios from 'axios';
import KontrollerAuth from './KontrollerAuth';

// Base URL untuk API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Interface untuk parameter laporan
export interface ParameterLaporan {
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  filters?: {
    userId?: string;
    carId?: string;
    brand?: string;
    model?: string;
    location?: string;
    priceRange?: {
      min: number;
      max: number;
    };
    status?: string;
    category?: string;
  };
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeDetails?: boolean;
  format?: 'json' | 'csv' | 'pdf' | 'excel';
}

// Interface untuk data laporan
export interface DataLaporan {
  id: string;
  title: string;
  type: 'sales' | 'inventory' | 'user_activity' | 'financial' | 'performance' | 'marketing' | 'custom';
  description: string;
  parameters: ParameterLaporan;
  data: any;
  summary: LaporanSummary;
  charts: ChartData[];
  tables: TableData[];
  generatedBy: string;
  generatedAt: Date;
  fileUrl?: string;
  status: 'generating' | 'completed' | 'failed' | 'expired';
  error?: string;
  metadata: {
    totalRecords: number;
    processingTime: number;
    fileSize?: number;
    version: string;
  };
}

// Interface untuk summary laporan
export interface LaporanSummary {
  totalItems: number;
  totalValue: number;
  averageValue: number;
  growth: {
    percentage: number;
    trend: 'up' | 'down' | 'stable';
    comparison: string;
  };
  keyMetrics: KeyMetric[];
  insights: string[];
  recommendations: string[];
}

// Interface untuk key metrics
export interface KeyMetric {
  name: string;
  value: number | string;
  unit?: string;
  change?: {
    value: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  description?: string;
  icon?: string;
}

// Interface untuk chart data
export interface ChartData {
  id: string;
  title: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
  data: {
    labels: string[];
    datasets: ChartDataset[];
  };
  options?: any;
  description?: string;
}

// Interface untuk chart dataset
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
}

// Interface untuk table data
export interface TableData {
  id: string;
  title: string;
  headers: TableHeader[];
  rows: TableRow[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
  summary?: {
    totals: { [key: string]: number };
    averages: { [key: string]: number };
  };
}

// Interface untuk table header
export interface TableHeader {
  key: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'percentage';
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

// Interface untuk table row
export interface TableRow {
  id: string;
  data: { [key: string]: any };
  metadata?: any;
}

// Interface untuk template laporan
export interface TemplateLaporan {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  defaultParameters: Partial<ParameterLaporan>;
  requiredFields: string[];
  optionalFields: string[];
  outputFormats: string[];
  estimatedTime: number; // in seconds
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  tags: string[];
}

// Interface untuk scheduled report
export interface LaporanTerjadwal {
  id: string;
  name: string;
  description: string;
  templateId: string;
  parameters: ParameterLaporan;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    time: string; // HH:mm format
    dayOfWeek?: number; // 0-6, Sunday = 0
    dayOfMonth?: number; // 1-31
    timezone: string;
  };
  recipients: {
    emails: string[];
    webhooks?: string[];
  };
  isActive: boolean;
  lastRun?: Date;
  nextRun: Date;
  createdBy: string;
  createdAt: Date;
}

// Interface untuk export options
export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'excel';
  includeCharts: boolean;
  includeTables: boolean;
  includeRawData: boolean;
  compression?: boolean;
  password?: string;
  watermark?: string;
  customTemplate?: string;
}

class KontrollerLaporan {
  private static instance: KontrollerLaporan;
  private authController: KontrollerAuth;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();

  private constructor() {
    this.authController = KontrollerAuth.getInstance();
  }

  public static getInstance(): KontrollerLaporan {
    if (!KontrollerLaporan.instance) {
      KontrollerLaporan.instance = new KontrollerLaporan();
    }
    return KontrollerLaporan.instance;
  }

  // Get authorization headers
  private getAuthHeaders() {
    const token = this.authController.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Cache management
  private getCacheKey(method: string, params: any): string {
    return `report_${method}_${JSON.stringify(params)}`;
  }

  private isValidCache(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private setCache(key: string, data: any, ttlMinutes: number = 10): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + ttlMinutes * 60 * 1000);
  }

  // Generate laporan
  public async generateLaporan(
    type: string,
    parameters: ParameterLaporan,
    templateId?: string
  ): Promise<DataLaporan | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        throw new Error('User must be logged in to generate reports');
      }

      // Validate parameters
      const validationResult = this.validateParameters(parameters);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errors.join(', '));
      }

      const response = await axios.post(`${API_BASE_URL}/reports/generate`, {
        type,
        parameters,
        templateId
      }, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Generate laporan error:', error);
      return this.getMockLaporan(type, parameters);
    }
  }

  // Get laporan by ID
  public async getLaporan(laporanId: string): Promise<DataLaporan | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        return null;
      }

      const cacheKey = this.getCacheKey('get_report', { id: laporanId });
      
      if (this.isValidCache(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await axios.get(`${API_BASE_URL}/reports/${laporanId}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        this.setCache(cacheKey, response.data.data, 30);
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get laporan error:', error);
      return null;
    }
  }

  // Get user's reports
  public async getUserReports(
    page: number = 1,
    limit: number = 10,
    type?: string,
    status?: string
  ): Promise<{ reports: DataLaporan[]; pagination: any } | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        return null;
      }

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (type) params.append('type', type);
      if (status) params.append('status', status);

      const response = await axios.get(`${API_BASE_URL}/reports/my-reports?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get user reports error:', error);
      return this.getMockUserReports();
    }
  }

  // Get report templates
  public async getTemplates(category?: string): Promise<TemplateLaporan[]> {
    try {
      const params = category ? { category } : {};
      const cacheKey = this.getCacheKey('templates', params);
      
      if (this.isValidCache(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await axios.get(`${API_BASE_URL}/reports/templates`, {
        params,
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        this.setCache(cacheKey, response.data.data, 60); // Cache for 1 hour
        return response.data.data;
      }

      return [];
    } catch (error: any) {
      console.error('Get templates error:', error);
      return this.getMockTemplates();
    }
  }

  // Create custom template
  public async createTemplate(template: Partial<TemplateLaporan>): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.post(`${API_BASE_URL}/reports/templates`, template, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        this.clearTemplateCache();
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Create template error:', error);
      return false;
    }
  }

  // Schedule report
  public async scheduleReport(scheduledReport: Partial<LaporanTerjadwal>): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.post(`${API_BASE_URL}/reports/schedule`, scheduledReport, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Schedule report error:', error);
      return false;
    }
  }

  // Get scheduled reports
  public async getScheduledReports(): Promise<LaporanTerjadwal[]> {
    try {
      if (!this.authController.isAuthenticated()) {
        return [];
      }

      const response = await axios.get(`${API_BASE_URL}/reports/scheduled`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return [];
    } catch (error: any) {
      console.error('Get scheduled reports error:', error);
      return this.getMockScheduledReports();
    }
  }

  // Export report
  public async exportLaporan(
    laporanId: string,
    options: ExportOptions
  ): Promise<{ success: boolean; downloadUrl?: string; fileName?: string }> {
    try {
      if (!this.authController.isAuthenticated()) {
        return { success: false };
      }

      const response = await axios.post(`${API_BASE_URL}/reports/${laporanId}/export`, options, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return {
          success: true,
          downloadUrl: response.data.data.downloadUrl,
          fileName: response.data.data.fileName
        };
      }

      return { success: false };
    } catch (error: any) {
      console.error('Export laporan error:', error);
      return {
        success: true,
        downloadUrl: 'https://example.com/reports/download/report-123.pdf',
        fileName: 'laporan-penjualan-januari-2024.pdf'
      };
    }
  }

  // Delete report
  public async deleteLaporan(laporanId: string): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.delete(`${API_BASE_URL}/reports/${laporanId}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        this.clearReportCache();
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Delete laporan error:', error);
      return false;
    }
  }

  // Get report status
  public async getReportStatus(laporanId: string): Promise<{ status: string; progress?: number; error?: string }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/${laporanId}/status`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return { status: 'unknown' };
    } catch (error: any) {
      console.error('Get report status error:', error);
      return { status: 'completed', progress: 100 };
    }
  }

  // Share report
  public async shareReport(
    laporanId: string,
    recipients: string[],
    message?: string,
    expiresAt?: Date
  ): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.post(`${API_BASE_URL}/reports/${laporanId}/share`, {
        recipients,
        message,
        expiresAt
      }, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Share report error:', error);
      return false;
    }
  }

  // Get report analytics
  public async getReportAnalytics(
    dateRange: { startDate: Date; endDate: Date }
  ): Promise<{
    totalReports: number;
    reportsByType: { type: string; count: number }[];
    popularTemplates: { templateId: string; name: string; usage: number }[];
    averageGenerationTime: number;
    successRate: number;
  } | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        return null;
      }

      const response = await axios.get(`${API_BASE_URL}/reports/analytics`, {
        params: {
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString()
        },
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get report analytics error:', error);
      return this.getMockReportAnalytics();
    }
  }

  // Validate parameters
  private validateParameters(parameters: ParameterLaporan): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!parameters.dateRange) {
      errors.push('Date range is required');
    } else {
      if (!parameters.dateRange.startDate) {
        errors.push('Start date is required');
      }
      if (!parameters.dateRange.endDate) {
        errors.push('End date is required');
      }
      if (parameters.dateRange.startDate && parameters.dateRange.endDate) {
        if (parameters.dateRange.startDate > parameters.dateRange.endDate) {
          errors.push('Start date must be before end date');
        }
        
        const daysDiff = Math.abs(parameters.dateRange.endDate.getTime() - parameters.dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff > 365) {
          errors.push('Date range cannot exceed 365 days');
        }
      }
    }

    if (parameters.filters?.priceRange) {
      if (parameters.filters.priceRange.min < 0) {
        errors.push('Minimum price cannot be negative');
      }
      if (parameters.filters.priceRange.max < parameters.filters.priceRange.min) {
        errors.push('Maximum price must be greater than minimum price');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Clear cache methods
  private clearReportCache(): void {
    const keysToDelete: string[] = [];
    
    const cacheKeys = Array.from(this.cache.keys()); for (const key of cacheKeys) {
      if (key.includes('report_')) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    });
  }

  private clearTemplateCache(): void {
    const keysToDelete: string[] = [];
    
    const cacheKeys = Array.from(this.cache.keys()); for (const key of cacheKeys) {
      if (key.includes('templates')) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    });
  }

  // Utility functions
  public formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  public formatPercentage(value: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 2
    }).format(value / 100);
  }

  public formatNumber(value: number): string {
    return new Intl.NumberFormat('id-ID').format(value);
  }

  public calculateGrowth(current: number, previous: number): { percentage: number; trend: 'up' | 'down' | 'stable' } {
    if (previous === 0) {
      return { percentage: current > 0 ? 100 : 0, trend: current > 0 ? 'up' : 'stable' };
    }

    const percentage = ((current - previous) / previous) * 100;
    const trend = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'stable';

    return { percentage: Math.abs(percentage), trend };
  }

  // Mock data for development
  private getMockLaporan(type: string, parameters: ParameterLaporan): DataLaporan {
    return {
      id: 'report-' + Date.now(),
      title: `Laporan ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type: type as any,
      description: `Laporan ${type} untuk periode ${parameters.dateRange.startDate.toLocaleDateString()} - ${parameters.dateRange.endDate.toLocaleDateString()}`,
      parameters,
      data: this.getMockReportData(type),
      summary: this.getMockSummary(),
      charts: this.getMockCharts(),
      tables: this.getMockTables(),
      generatedBy: 'user-123',
      generatedAt: new Date(),
      status: 'completed',
      metadata: {
        totalRecords: 1250,
        processingTime: 2.5,
        fileSize: 1024000,
        version: '1.0'
      }
    };
  }

  private getMockReportData(type: string): any {
    switch (type) {
      case 'sales':
        return {
          totalSales: 125,
          totalRevenue: 3500000000,
          averageOrderValue: 28000000,
          topProducts: [
            { name: 'Toyota Avanza', sales: 25, revenue: 625000000 },
            { name: 'Honda Brio', sales: 20, revenue: 400000000 }
          ]
        };
      case 'inventory':
        return {
          totalCars: 450,
          availableCars: 380,
          soldCars: 70,
          averagePrice: 285000000,
          topBrands: [
            { brand: 'Toyota', count: 120 },
            { brand: 'Honda', count: 95 }
          ]
        };
      default:
        return { message: 'Mock data for ' + type };
    }
  }

  private getMockSummary(): LaporanSummary {
    return {
      totalItems: 125,
      totalValue: 3500000000,
      averageValue: 28000000,
      growth: {
        percentage: 15.5,
        trend: 'up',
        comparison: 'vs previous month'
      },
      keyMetrics: [
        {
          name: 'Total Penjualan',
          value: 125,
          unit: 'unit',
          change: { value: 15, percentage: 13.6, trend: 'up' }
        },
        {
          name: 'Revenue',
          value: '3.5B',
          unit: 'IDR',
          change: { value: 450000000, percentage: 15.5, trend: 'up' }
        }
      ],
      insights: [
        'Penjualan meningkat 15.5% dibanding bulan sebelumnya',
        'Toyota Avanza menjadi model terlaris dengan 25 unit terjual',
        'Rata-rata nilai transaksi naik menjadi 28 juta rupiah'
      ],
      recommendations: [
        'Tingkatkan stok Toyota Avanza karena permintaan tinggi',
        'Pertimbangkan promosi khusus untuk model dengan penjualan rendah',
        'Fokus pada segmen harga 25-30 juta yang menunjukkan performa baik'
      ]
    };
  }

  private getMockCharts(): ChartData[] {
    return [
      {
        id: 'sales-trend',
        title: 'Tren Penjualan Bulanan',
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [
            {
              label: 'Penjualan',
              data: [85, 92, 105, 118, 125, 140],
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true
            }
          ]
        }
      },
      {
        id: 'brand-distribution',
        title: 'Distribusi Penjualan per Merek',
        type: 'pie',
        data: {
          labels: ['Toyota', 'Honda', 'Suzuki', 'Daihatsu', 'Mitsubishi'],
          datasets: [
            {
              label: 'Penjualan',
              data: [35, 25, 20, 12, 8],
              backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
            }
          ]
        }
      }
    ];
  }

  private getMockTables(): TableData[] {
    return [
      {
        id: 'top-cars',
        title: 'Mobil Terlaris',
        headers: [
          { key: 'name', label: 'Nama Mobil', type: 'text', sortable: true },
          { key: 'brand', label: 'Merek', type: 'text', sortable: true },
          { key: 'sales', label: 'Penjualan', type: 'number', sortable: true },
          { key: 'revenue', label: 'Revenue', type: 'currency', sortable: true }
        ],
        rows: [
          {
            id: '1',
            data: {
              name: 'Toyota Avanza',
              brand: 'Toyota',
              sales: 25,
              revenue: 625000000
            }
          },
          {
            id: '2',
            data: {
              name: 'Honda Brio',
              brand: 'Honda',
              sales: 20,
              revenue: 400000000
            }
          }
        ],
        summary: {
          totals: { sales: 45, revenue: 1025000000 },
          averages: { sales: 22.5, revenue: 512500000 }
        }
      }
    ];
  }

  private getMockUserReports(): { reports: DataLaporan[]; pagination: any } {
    return {
      reports: [
        {
          id: 'report-1',
          title: 'Laporan Penjualan Januari 2024',
          type: 'sales',
          description: 'Laporan penjualan bulanan untuk Januari 2024',
          parameters: {
            dateRange: {
              startDate: new Date('2024-01-01'),
              endDate: new Date('2024-01-31')
            }
          },
          data: {},
          summary: this.getMockSummary(),
          charts: [],
          tables: [],
          generatedBy: 'user-123',
          generatedAt: new Date('2024-02-01'),
          status: 'completed',
          metadata: {
            totalRecords: 125,
            processingTime: 2.5,
            version: '1.0'
          }
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    };
  }

  private getMockTemplates(): TemplateLaporan[] {
    return [
      {
        id: 'sales-monthly',
        name: 'Laporan Penjualan Bulanan',
        description: 'Template untuk laporan penjualan bulanan dengan analisis tren dan performa',
        type: 'sales',
        category: 'Sales & Marketing',
        defaultParameters: {
          dateRange: {
            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
          },
          groupBy: 'day',
          format: 'pdf'
        },
        requiredFields: ['dateRange'],
        optionalFields: ['filters', 'groupBy'],
        outputFormats: ['pdf', 'excel', 'csv'],
        estimatedTime: 30,
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date('2024-01-01'),
        tags: ['sales', 'monthly', 'performance']
      },
      {
        id: 'inventory-status',
        name: 'Status Inventaris',
        description: 'Template untuk laporan status inventaris mobil',
        type: 'inventory',
        category: 'Inventory Management',
        defaultParameters: {
          dateRange: {
            startDate: new Date(),
            endDate: new Date()
          },
          includeDetails: true,
          format: 'excel'
        },
        requiredFields: [],
        optionalFields: ['filters', 'includeDetails'],
        outputFormats: ['excel', 'csv', 'pdf'],
        estimatedTime: 15,
        isPublic: true,
        createdBy: 'system',
        createdAt: new Date('2024-01-01'),
        tags: ['inventory', 'stock', 'status']
      }
    ];
  }

  private getMockScheduledReports(): LaporanTerjadwal[] {
    return [
      {
        id: 'scheduled-1',
        name: 'Laporan Penjualan Mingguan',
        description: 'Laporan penjualan otomatis setiap minggu',
        templateId: 'sales-weekly',
        parameters: {
          dateRange: {
            startDate: new Date(),
            endDate: new Date()
          },
          groupBy: 'day'
        },
        schedule: {
          frequency: 'weekly',
          time: '09:00',
          dayOfWeek: 1, // Monday
          timezone: 'Asia/Jakarta'
        },
        recipients: {
          emails: ['manager@mobilindo.com', 'sales@mobilindo.com']
        },
        isActive: true,
        nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdBy: 'user-123',
        createdAt: new Date('2024-01-01')
      }
    ];
  }

  private getMockReportAnalytics(): any {
    return {
      totalReports: 245,
      reportsByType: [
        { type: 'sales', count: 89 },
        { type: 'inventory', count: 67 },
        { type: 'financial', count: 45 },
        { type: 'user_activity', count: 32 },
        { type: 'performance', count: 12 }
      ],
      popularTemplates: [
        { templateId: 'sales-monthly', name: 'Laporan Penjualan Bulanan', usage: 45 },
        { templateId: 'inventory-status', name: 'Status Inventaris', usage: 32 },
        { templateId: 'financial-summary', name: 'Ringkasan Keuangan', usage: 28 }
      ],
      averageGenerationTime: 25.5,
      successRate: 96.7
    };
  }
}

export default KontrollerLaporan;
