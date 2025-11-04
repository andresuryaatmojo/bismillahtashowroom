// LayananLaporan.ts - Service untuk mengelola operasi laporan admin dan eksekutif

import { supabase } from '../lib/supabase';

// Type definitions
export interface Report {
  id: string;
  report_type: string;
  title: string;
  description?: string;
  period_type: string;
  period_start: string | Date;
  period_end: string | Date;
  report_data?: any;
  summary_data?: any;
  file_path?: string;
  file_url?: string;
  file_format: string;
  file_size?: number;
  status: string;
  is_scheduled: boolean;
  schedule_cron?: string;
  next_generation_at?: string | Date;
  visibility: string;
  created_by: string;
  generation_time_seconds?: number;
  row_count?: number;
  error_message?: string;
  notes?: string;
  generated_at?: string | Date;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface ReportDistribution {
  id: string;
  report_id: string;
  recipient_user_id?: string;
  recipient_email?: string;
  recipient_name?: string;
  distribution_method: string;
  status: string;
  sent_at?: string | Date;
  delivered_at?: string | Date;
  created_at: string | Date;
}

export interface ReportGenerationRequest {
  report_type: string;
  title: string;
  description?: string;
  period_type: string;
  period_start: Date;
  period_end: Date;
  file_format?: string;
  visibility?: string;
  is_scheduled?: boolean;
  schedule_cron?: string;
  notes?: string;
}

export interface ReportFilter {
  report_type?: string;
  status?: string;
  period_type?: string;
  visibility?: string;
  created_by?: string;
  date_from?: Date;
  date_to?: Date;
  search?: string;
}

// Admin Report Types - Operasional Detail
// Sesuai dengan constraint database yang ada: sales, financial, inventory, user_activity, performance, analytics, custom
export const ADMIN_REPORT_TYPES = [
  { value: 'sales', label: 'Detail Penjualan', description: 'Data penjualan per transaksi lengkap' },
  { value: 'inventory', label: 'Inventory Real-time', description: 'Status inventory saat ini' },
  { value: 'user_activity', label: 'Layanan Pelanggan', description: 'Record layanan pelanggan' },
  { value: 'performance', label: 'Performa Staff', description: 'Kinerja staff administrasi' },
  { value: 'analytics', label: 'Detail Transaksi', description: 'Data transaksi harian lengkap' },
  { value: 'custom', label: 'Custom Report', description: 'Laporan kustom sesuai kebutuhan' }
] as const;

// Executive Report Types - Strategis Summary
// Menggunakan nilai yang valid dalam constraint
export const EXECUTIVE_REPORT_TYPES = [
  { value: 'sales', label: 'Summary Penjualan', description: 'Ringkasan kinerja penjualan' },
  { value: 'financial', label: 'Overview Keuangan', description: 'Analisis finansial lengkap' },
  { value: 'inventory', label: 'Analisis Inventory', description: 'Trend dan analisis inventory' },
  { value: 'performance', label: 'KPI Strategis', description: 'Key Performance Indicators' },
  { value: 'analytics', label: 'Analytics Dashboard', description: 'Dashboard analisis bisnis' },
  { value: 'user_activity', label: 'Customer Insights', description: 'Analisis perilaku pelanggan' },
  { value: 'custom', label: 'Custom Executive Report', description: 'Laporan eksekutif kustom' }
] as const;

// Report Status Options
export const REPORT_STATUS = [
  { value: 'generating', label: 'Generating', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'failed', label: 'Failed', color: 'red' },
  { value: 'archived', label: 'Archived', color: 'gray' }
] as const;

// Report Formats
export const REPORT_FORMATS = [
  { value: 'pdf', label: 'PDF', icon: '📄' },
  { value: 'excel', label: 'Excel', icon: '📊' },
  { value: 'csv', label: 'CSV', icon: '📋' },
  { value: 'json', label: 'JSON', icon: '🗂️' }
] as const;

// Period Types
export const PERIOD_TYPES = [
  { value: 'daily', label: 'Harian' },
  { value: 'weekly', label: 'Mingguan' },
  { value: 'monthly', label: 'Bulanan' },
  { value: 'quarterly', label: 'Triwulan' },
  { value: 'yearly', label: 'Tahunan' },
  { value: 'custom', label: 'Kustom' }
] as const;

// Distribution Methods
export const DISTRIBUTION_METHODS = [
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'download', label: 'Download', icon: '⬇️' },
  { value: 'notification', label: 'Notifikasi', icon: '🔔' },
  { value: 'auto', label: 'Otomatis', icon: '🤖' }
] as const;

class LayananLaporan {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    console.log('[LayananLaporan] Service initialized');
  }

  // Report Generation Methods
  async generateReport(request: ReportGenerationRequest, userId: string): Promise<{ success: boolean; reportId?: string; error?: string }> {
    try {
      console.log('[LayananLaporan] Generating report:', request);

      // Validate request
      const validation = this.validateReportRequest(request);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Create report record with generating status
      const { data: report, error: createError } = await supabase
        .from('reports')
        .insert({
          report_type: request.report_type,
          title: request.title,
          description: request.description,
          period_type: request.period_type,
          period_start: request.period_start.toISOString().split('T')[0],
          period_end: request.period_end.toISOString().split('T')[0],
          file_format: request.file_format || 'pdf',
          visibility: request.visibility || 'private',
          is_scheduled: request.is_scheduled || false,
          schedule_cron: request.schedule_cron,
          created_by: userId,
          status: 'generating',
          generated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('[LayananLaporan] Error creating report:', createError);
        return { success: false, error: 'Gagal membuat laporan' };
      }

      // Trigger report generation (in real app, this would be a background job)
      this.processReportGeneration(report.id);

      return { success: true, reportId: report.id };

    } catch (error) {
      console.error('[LayananLaporan] Error generating report:', error);
      return { success: false, error: 'Terjadi kesalahan saat generate laporan' };
    }
  }

  // Report Retrieval Methods
  async getReports(filter?: ReportFilter, userId?: string, userRole?: 'admin' | 'executive'): Promise<{ success: boolean; reports?: Report[]; error?: string }> {
    try {
      console.log('[LayananLaporan] Getting reports with filter:', filter);

      let query = supabase
        .from('reports')
        .select(`
          *,
          report_distributions(*)
        `);

      // Apply filters
      if (filter) {
        if (filter.report_type) {
          query = query.eq('report_type', filter.report_type);
        }
        if (filter.status) {
          query = query.eq('status', filter.status);
        }
        if (filter.period_type) {
          query = query.eq('period_type', filter.period_type);
        }
        if (filter.visibility) {
          query = query.eq('visibility', filter.visibility);
        }
        if (filter.created_by) {
          query = query.eq('created_by', filter.created_by);
        }
        if (filter.date_from) {
          query = query.gte('period_start', filter.date_from.toISOString().split('T')[0]);
        }
        if (filter.date_to) {
          query = query.lte('period_end', filter.date_to.toISOString().split('T')[0]);
        }
        if (filter.search) {
          query = query.or(`title.ilike.%${filter.search}%,description.ilike.%${filter.search}%`);
        }
      }

      // Apply role-based filtering
      if (userRole && userId) {
        if (userRole === 'admin') {
          // Admin can see admin reports and their own reports
          const adminTypes = ADMIN_REPORT_TYPES.map(t => t.value);
          query = query.or(`report_type.in.(${adminTypes.join(',')}),created_by.eq.${userId}`);
        } else if (userRole === 'executive') {
          // Executive can see executive reports and public reports
          const executiveTypes = EXECUTIVE_REPORT_TYPES.map(t => t.value);
          query = query.or(`report_type.in.(${executiveTypes.join(',')}),visibility.eq.public`);
        }
      }

      // Order by creation date
      query = query.order('created_at', { ascending: false });

      const { data: reports, error } = await query;

      if (error) {
        console.error('[LayananLaporan] Error getting reports:', error);
        return { success: false, error: 'Gagal mengambil laporan' };
      }

      return { success: true, reports: reports || [] };

    } catch (error) {
      console.error('[LayananLaporan] Error getting reports:', error);
      return { success: false, error: 'Terjadi kesalahan saat mengambil laporan' };
    }
  }

  async getReportById(reportId: string): Promise<{ success: boolean; report?: Report; error?: string }> {
    try {
      console.log('[LayananLaporan] Getting report:', reportId);

      const { data: report, error } = await supabase
        .from('reports')
        .select(`
          *,
          report_distributions(*)
        `)
        .eq('id', reportId)
        .single();

      if (error) {
        console.error('[LayananLaporan] Error getting report:', error);
        return { success: false, error: 'Laporan tidak ditemukan' };
      }

      return { success: true, report };

    } catch (error) {
      console.error('[LayananLaporan] Error getting report:', error);
      return { success: false, error: 'Terjadi kesalahan saat mengambil laporan' };
    }
  }

  // Report Distribution Methods
  async distributeReport(reportId: string, recipients: { email?: string; userId?: string; name?: string }[], method: string = 'email'): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[LayananLaporan] Distributing report:', reportId, 'to:', recipients);

      // Validate report exists
      const { data: report, error: reportError } = await supabase
        .from('reports')
        .select('id, title, status')
        .eq('id', reportId)
        .single();

      if (reportError || !report) {
        return { success: false, error: 'Laporan tidak ditemukan' };
      }

      if (report.status !== 'completed') {
        return { success: false, error: 'Laporan belum selesai dibuat' };
      }

      // Create distribution records
      const distributions = recipients.map(recipient => ({
        report_id: reportId,
        recipient_user_id: recipient.userId,
        recipient_email: recipient.email,
        recipient_name: recipient.name,
        distribution_method: method,
        status: 'pending'
      }));

      const { error: distributionError } = await supabase
        .from('report_distributions')
        .insert(distributions);

      if (distributionError) {
        console.error('[LayananLaporan] Error creating distributions:', distributionError);
        return { success: false, error: 'Gagal membuat distribusi' };
      }

      // Trigger distribution process (in real app, this would be a background job)
      this.processReportDistribution(reportId, method, recipients);

      return { success: true };

    } catch (error) {
      console.error('[LayananLaporan] Error distributing report:', error);
      return { success: false, error: 'Terjadi kesalahan saat mendistribusikan laporan' };
    }
  }

  // Report Management Methods
  async deleteReport(reportId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[LayananLaporan] Deleting report:', reportId);

      // Delete distributions first (due to foreign key constraint)
      const { error: distributionError } = await supabase
        .from('report_distributions')
        .delete()
        .eq('report_id', reportId);

      if (distributionError) {
        console.error('[LayananLaporan] Error deleting distributions:', distributionError);
      }

      // Delete the report
      const { error: reportError } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (reportError) {
        console.error('[LayananLaporan] Error deleting report:', reportError);
        return { success: false, error: 'Gagal menghapus laporan' };
      }

      return { success: true };

    } catch (error) {
      console.error('[LayananLaporan] Error deleting report:', error);
      return { success: false, error: 'Terjadi kesalahan saat menghapus laporan' };
    }
  }

  async archiveReport(reportId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('[LayananLaporan] Archiving report:', reportId);

      const { error } = await supabase
        .from('reports')
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', reportId);

      if (error) {
        console.error('[LayananLaporan] Error archiving report:', error);
        return { success: false, error: 'Gagal mengarsipkan laporan' };
      }

      return { success: true };

    } catch (error) {
      console.error('[LayananLaporan] Error archiving report:', error);
      return { success: false, error: 'Terjadi kesalahan saat mengarsipkan laporan' };
    }
  }

  // Statistics and Analytics Methods
  async getReportStatistics(userId?: string, userRole?: 'admin' | 'executive'): Promise<{
    success: boolean;
    statistics?: {
      totalReports: number;
      completedReports: number;
      failedReports: number;
      generatingReports: number;
      reportsByType: { [key: string]: number };
      reportsByStatus: { [key: string]: number };
      recentActivity: Report[];
    };
    error?: string
  }> {
    try {
      console.log('[LayananLaporan] Getting report statistics');

      let query = supabase
        .from('reports')
        .select('*');

      // Apply role-based filtering
      if (userRole && userId) {
        if (userRole === 'admin') {
          const adminTypes = ADMIN_REPORT_TYPES.map(t => t.value);
          query = query.or(`report_type.in.(${adminTypes.join(',')}),created_by.eq.${userId}`);
        } else if (userRole === 'executive') {
          const executiveTypes = EXECUTIVE_REPORT_TYPES.map(t => t.value);
          query = query.or(`report_type.in.(${executiveTypes.join(',')}),visibility.eq.public`);
        }
      }

      const { data: reports, error } = await query;

      if (error) {
        console.error('[LayananLaporan] Error getting statistics:', error);
        return { success: false, error: 'Gagal mengambil statistik' };
      }

      const reportsData = reports || [];
      const totalReports = reportsData.length;
      const completedReports = reportsData.filter((r: Report) => r.status === 'completed').length;
      const failedReports = reportsData.filter((r: Report) => r.status === 'failed').length;
      const generatingReports = reportsData.filter((r: Report) => r.status === 'generating').length;

      // Reports by type
      const reportsByType: { [key: string]: number } = {};
      reportsData.forEach((report: Report) => {
        reportsByType[report.report_type] = (reportsByType[report.report_type] || 0) + 1;
      });

      // Reports by status
      const reportsByStatus: { [key: string]: number } = {};
      reportsData.forEach((report: Report) => {
        reportsByStatus[report.status] = (reportsByStatus[report.status] || 0) + 1;
      });

      // Recent activity (last 5 reports)
      const recentActivity = reportsData
        .sort((a: Report, b: Report) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      return {
        success: true,
        statistics: {
          totalReports,
          completedReports,
          failedReports,
          generatingReports,
          reportsByType,
          reportsByStatus,
          recentActivity
        }
      };

    } catch (error) {
      console.error('[LayananLaporan] Error getting statistics:', error);
      return { success: false, error: 'Terjadi kesalahan saat mengambil statistik' };
    }
  }

  // Private Helper Methods
  private validateReportRequest(request: ReportGenerationRequest): { valid: boolean; error?: string } {
    if (!request.title || request.title.trim() === '') {
      return { valid: false, error: 'Judul laporan harus diisi' };
    }

    if (!request.report_type) {
      return { valid: false, error: 'Jenis laporan harus dipilih' };
    }

    // Validasi report_type sesuai constraint database
    const validReportTypes = ['sales', 'financial', 'inventory', 'user_activity', 'performance', 'analytics', 'custom'];
    if (!validReportTypes.includes(request.report_type)) {
      return { valid: false, error: 'Jenis laporan tidak valid. Pilih jenis laporan yang tersedia.' };
    }

    if (!request.period_type) {
      return { valid: false, error: 'Periode laporan harus dipilih' };
    }

    // Validasi period_type sesuai constraint database
    const validPeriodTypes = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'];
    if (!validPeriodTypes.includes(request.period_type)) {
      return { valid: false, error: 'Tipe periode tidak valid. Pilih tipe periode yang tersedia.' };
    }

    if (!request.period_start || !request.period_end) {
      return { valid: false, error: 'Periode tanggal harus diisi' };
    }

    if (new Date(request.period_start) > new Date(request.period_end)) {
      return { valid: false, error: 'Tanggal mulai tidak boleh lebih besar dari tanggal selesai' };
    }

    // Validasi file_format sesuai constraint database
    if (request.file_format) {
      const validFormats = ['pdf', 'excel', 'csv', 'json'];
      if (!validFormats.includes(request.file_format)) {
        return { valid: false, error: 'Format laporan tidak valid. Pilih format yang tersedia.' };
      }
    }

    return { valid: true };
  }

  private async processReportGeneration(reportId: string): Promise<void> {
    try {
      console.log('[LayananLaporan] Processing report generation:', reportId);

      // Get report details first
      const { data: report, error: reportError } = await supabase
        .from('reports')
        .select('report_type, period_start, period_end, title, file_format')
        .eq('id', reportId)
        .single();

      if (reportError || !report) {
        throw new Error('Report not found');
      }

      let reportData: any = {};
      let summaryData: any = {};

      // Add small delay for realistic generation time (1-2 seconds)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      // Generate data based on report type
      switch (report.report_type) {
        case 'sales':
          reportData = await this.generateSalesReport(report.period_start, report.period_end);
          break;
        case 'financial':
          reportData = await this.generateFinancialReport(report.period_start, report.period_end);
          break;
        case 'inventory':
          reportData = await this.generateInventoryReport();
          break;
        case 'user_activity':
          reportData = await this.generateUserActivityReport(report.period_start, report.period_end);
          break;
        case 'performance':
          reportData = await this.generatePerformanceReport(report.period_start, report.period_end);
          break;
        case 'analytics':
          reportData = await this.generateAnalyticsReport(report.period_start, report.period_end);
          break;
        default:
          reportData = await this.generateCustomReport(report.period_start, report.period_end);
      }

      // Create summary data
      summaryData = this.createSummaryData(report.report_type, reportData);

      // Generate mock file data for download - create a simple text/CSV file for now
      let mockFileContent = '';
      const fileName = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${report.file_format}`;

      if (report.file_format === 'json') {
        mockFileContent = JSON.stringify(reportData, null, 2);
      } else if (report.file_format === 'csv') {
        mockFileContent = this.generateCSVReport(reportData, report.report_type);
      } else {
        // For PDF and Excel, create a simple text content
        mockFileContent = this.generateTextReport(reportData, report.report_type);
      }

      // Store the file content in the database for download
      const fileUrl = `data:${report.file_format === 'json' ? 'application/json' : 'text/plain'};charset=utf-8,${encodeURIComponent(mockFileContent)}`;
      const fileSize = this.calculateFileSize(reportData);

      // Update report as completed
      const { error: updateError } = await supabase
        .from('reports')
        .update({
          status: 'completed',
          report_data: reportData,
          summary_data: summaryData,
          file_url: fileUrl,
          file_size: fileSize,
          generated_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (updateError) {
        throw new Error(`Failed to update report: ${updateError.message}`);
      }

      console.log('[LayananLaporan] Report generation completed:', reportId);
    } catch (error) {
      console.error('[LayananLaporan] Error in report generation process:', error);

      // Mark as failed
      await supabase
        .from('reports')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);
    }
  }

  private async processReportDistribution(reportId: string, method: string, recipients: any[]): Promise<void> {
    // Simulate report distribution process
    console.log('[LayananLaporan] Processing report distribution:', reportId, 'method:', method);

    setTimeout(async () => {
      try {
        // In a real app, this would actually send emails/notifications
        const { data: distributions } = await supabase
          .from('report_distributions')
          .select('id')
          .eq('report_id', reportId)
          .eq('status', 'pending');

        if (distributions && distributions.length > 0) {
          // Update distributions as sent
          const { error } = await supabase
            .from('report_distributions')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              delivered_at: new Date().toISOString()
            })
            .eq('report_id', reportId)
            .eq('status', 'pending');

          if (error) {
            console.error('[LayananLaporan] Error updating distributions:', error);
          } else {
            console.log('[LayananLaporan] Report distribution completed:', reportId);
          }
        }
      } catch (error) {
        console.error('[LayananLaporan] Error in report distribution process:', error);
      }
    }, Math.random() * 2000 + 1000); // 1-3 seconds
  }

  // Cache Methods
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Utility Methods
  getReportTypeLabel(type: string): string {
    const allTypes = [...ADMIN_REPORT_TYPES, ...EXECUTIVE_REPORT_TYPES];
    const found = allTypes.find(t => t.value === type);
    return found?.label || type;
  }

  getStatusLabel(status: string): string {
    const found = REPORT_STATUS.find(s => s.value === status);
    return found?.label || status;
  }

  getFormatLabel(format: string): string {
    const found = REPORT_FORMATS.find(f => f.value === format);
    return found?.label || format;
  }

  isReportTypeForAdmin(type: string): boolean {
    return ADMIN_REPORT_TYPES.some(t => t.value === type);
  }

  async downloadReport(reportId: string): Promise<{ success: boolean; error?: string; downloadUrl?: string }> {
    try {
      console.log('[LayananLaporan] Downloading report:', reportId);

      const { data: report, error } = await supabase
        .from('reports')
        .select('file_url, file_path, title, file_format')
        .eq('id', reportId)
        .single();

      if (error) {
        console.error('[LayananLaporan] Error fetching report for download:', error);
        return { success: false, error: 'Gagal mengambil data laporan' };
      }

      if (!report) {
        return { success: false, error: 'Laporan tidak ditemukan' };
      }

      if (!report.file_url) {
        return { success: false, error: 'File laporan tidak tersedia' };
      }

      return {
        success: true,
        downloadUrl: report.file_url
      };
    } catch (error) {
      console.error('[LayananLaporan] Error downloading report:', error);
      return { success: false, error: 'Terjadi kesalahan saat mengunduh laporan' };
    }
  }

  isReportTypeForExecutive(type: string): boolean {
    return EXECUTIVE_REPORT_TYPES.some(t => t.value === type);
  }

  // Report Generation Methods
  private async generateSalesReport(periodStart: string, periodEnd: string): Promise<any> {
    try {
      // Fetch transactions data
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          *,
          listings:cars (
            id,
            title,
            brand,
            model,
            year,
            price,
            category
          ),
          users:profiles (
            id,
            full_name,
            email
          )
        `)
        .gte('created_at', periodStart)
        .lte('created_at', periodEnd)
        .eq('status', 'completed');

      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }

      const completedTransactions = transactions || [];

      // Calculate metrics
      const totalRevenue = completedTransactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);
      const totalTransactions = completedTransactions.length;
      const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      // Group by car category
      const salesByCategory: { [key: string]: number } = {};
      completedTransactions.forEach(t => {
        const category = t.listings?.category || 'Unknown';
        salesByCategory[category] = (salesByCategory[category] || 0) + 1;
      });

      // Group by month
      const salesByMonth: { [key: string]: number } = {};
      completedTransactions.forEach(t => {
        const month = new Date(t.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' });
        salesByMonth[month] = (salesByMonth[month] || 0) + (t.total_amount || 0);
      });

      return {
        period: { start: periodStart, end: periodEnd },
        summary: {
          totalRevenue,
          totalTransactions,
          averageTransactionValue,
          uniqueCustomers: new Set(completedTransactions.map(t => t.user_id)).size
        },
        salesByCategory,
        salesByMonth,
        transactions: completedTransactions.slice(0, 100), // Limit to 100 for performance
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating sales report:', error);
      throw error;
    }
  }

  private async generateFinancialReport(periodStart: string, periodEnd: string): Promise<any> {
    try {
      // Get transaction data for financial calculations
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('total_amount, payment_method, status, created_at')
        .gte('created_at', periodStart)
        .lte('created_at', periodEnd)
        .eq('status', 'completed');

      if (error) throw error;

      const completedTransactions = transactions || [];
      const totalRevenue = completedTransactions.reduce((sum, t) => sum + (t.total_amount || 0), 0);

      // Group by payment method
      const revenueByPaymentMethod: { [key: string]: number } = {};
      completedTransactions.forEach(t => {
        const method = t.payment_method || 'Unknown';
        revenueByPaymentMethod[method] = (revenueByPaymentMethod[method] || 0) + (t.total_amount || 0);
      });

      // Calculate monthly revenue
      const monthlyRevenue: { [key: string]: number } = {};
      completedTransactions.forEach(t => {
        const month = new Date(t.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short' });
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (t.total_amount || 0);
      });

      return {
        period: { start: periodStart, end: periodEnd },
        summary: {
          totalRevenue,
          totalTransactions: completedTransactions.length,
          averageTransactionValue: completedTransactions.length > 0 ? totalRevenue / completedTransactions.length : 0
        },
        revenueByPaymentMethod,
        monthlyRevenue,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating financial report:', error);
      throw error;
    }
  }

  private async generateInventoryReport(): Promise<any> {
    try {
      // Get cars/vehicles data
      const { data: cars, error } = await supabase
        .from('cars')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      const activeCars = cars || [];

      // Group by category
      const inventoryByCategory: { [key: string]: number } = {};
      activeCars.forEach(car => {
        const category = car.category || 'Unknown';
        inventoryByCategory[category] = (inventoryByCategory[category] || 0) + 1;
      });

      // Group by brand
      const inventoryByBrand: { [key: string]: number } = {};
      activeCars.forEach(car => {
        const brand = car.brand || 'Unknown';
        inventoryByBrand[brand] = (inventoryByBrand[brand] || 0) + 1;
      });

      // Calculate total inventory value
      const totalInventoryValue = activeCars.reduce((sum, car) => sum + (car.price || 0), 0);

      return {
        summary: {
          totalVehicles: activeCars.length,
          totalInventoryValue,
          averageVehiclePrice: activeCars.length > 0 ? totalInventoryValue / activeCars.length : 0
        },
        inventoryByCategory,
        inventoryByBrand,
        vehicles: activeCars.slice(0, 50), // Limit for performance
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating inventory report:', error);
      throw error;
    }
  }

  private async generateUserActivityReport(periodStart: string, periodEnd: string): Promise<any> {
    try {
      // Get user-related data
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      const allUsers = users || [];

      // Get test drives
      const { data: testDrives } = await supabase
        .from('test_drives')
        .select('*')
        .gte('created_at', periodStart)
        .lte('created_at', periodEnd);

      // Get transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', periodStart)
        .lte('created_at', periodEnd);

      return {
        period: { start: periodStart, end: periodEnd },
        summary: {
          totalUsers: allUsers.length,
          activeUsers: allUsers.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
          totalTestDrives: (testDrives || []).length,
          totalTransactions: (transactions || []).length
        },
        userStats: {
          newUsersThisPeriod: allUsers.filter(u => new Date(u.created_at) >= new Date(periodStart) && new Date(u.created_at) <= new Date(periodEnd)).length,
          usersWithTransactions: new Set((transactions || []).map(t => t.user_id)).size
        },
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating user activity report:', error);
      throw error;
    }
  }

  private async generatePerformanceReport(periodStart: string, periodEnd: string): Promise<any> {
    try {
      // Combined performance metrics
      const [salesData, financialData, inventoryData] = await Promise.all([
        this.generateSalesReport(periodStart, periodEnd),
        this.generateFinancialReport(periodStart, periodEnd),
        this.generateInventoryReport()
      ]);

      return {
        period: { start: periodStart, end: periodEnd },
        kpis: {
          totalRevenue: salesData.summary.totalRevenue,
          totalTransactions: salesData.summary.totalTransactions,
          conversionRate: salesData.summary.totalTransactions > 0 ? (salesData.summary.totalTransactions / inventoryData.summary.totalVehicles * 100) : 0,
          averageTransactionValue: salesData.summary.averageTransactionValue
        },
        salesPerformance: salesData,
        financialPerformance: financialData,
        inventoryPerformance: inventoryData,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating performance report:', error);
      throw error;
    }
  }

  private async generateAnalyticsReport(periodStart: string, periodEnd: string): Promise<any> {
    try {
      // Comprehensive analytics combining multiple data sources
      const { data: listings } = await supabase
        .from('cars')
        .select('category, brand, price, views, created_at')
        .eq('status', 'active');

      const { data: transactions } = await supabase
        .from('transactions')
        .select('total_amount, created_at, listings:cars(category, brand)')
        .gte('created_at', periodStart)
        .lte('created_at', periodEnd)
        .eq('status', 'completed');

      return {
        period: { start: periodStart, end: periodEnd },
        analytics: {
          marketTrends: {
            topCategories: this.getTopCategories(listings || []),
            topBrands: this.getTopBrands(listings || []),
            averagePriceByCategory: this.getAveragePriceByCategory(listings || [])
          },
          demandAnalytics: this.calculateDemandMetrics(transactions || []),
          inventoryAnalytics: this.calculateInventoryMetrics(listings || [])
        },
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating analytics report:', error);
      throw error;
    }
  }

  private async generateCustomReport(periodStart: string, periodEnd: string): Promise<any> {
    // Basic custom report combining key metrics
    return {
      period: { start: periodStart, end: periodEnd },
      customMetrics: {
        overview: await this.generateSalesReport(periodStart, periodEnd),
        financial: await this.generateFinancialReport(periodStart, periodEnd),
        inventory: await this.generateInventoryReport()
      },
      generatedAt: new Date().toISOString()
    };
  }

  // Helper Methods
  private createSummaryData(reportType: string, reportData: any): any {
    const baseSummary = {
      reportType,
      generatedAt: new Date().toISOString(),
      dataPoints: this.countDataPoints(reportData)
    };

    switch (reportType) {
      case 'sales':
        return {
          ...baseSummary,
          executiveSummary: `Laporan penjualan menunjukkan ${reportData.summary?.totalTransactions || 0} transaksi dengan total pendapatan Rp ${(reportData.summary?.totalRevenue || 0).toLocaleString('id-ID')}`,
          keyMetrics: reportData.summary || {}
        };
      case 'financial':
        return {
          ...baseSummary,
          executiveSummary: `Laporan finansial dengan total pendapatan Rp ${(reportData.summary?.totalRevenue || 0).toLocaleString('id-ID')} dari ${reportData.summary?.totalTransactions || 0} transaksi`,
          keyMetrics: reportData.summary || {}
        };
      case 'inventory':
        return {
          ...baseSummary,
          executiveSummary: `Laporan inventory mencatat ${reportData.summary?.totalVehicles || 0} kendaraan dengan nilai total Rp ${(reportData.summary?.totalInventoryValue || 0).toLocaleString('id-ID')}`,
          keyMetrics: reportData.summary || {}
        };
      default:
        return {
          ...baseSummary,
          executiveSummary: `Laporan ${reportType} berhasil dibuat`,
          keyMetrics: reportData.summary || {}
        };
    }
  }

  private countDataPoints(data: any): number {
    if (!data) return 0;
    if (Array.isArray(data)) return data.length;
    if (typeof data === 'object') {
      return Object.values(data).reduce((count: number, value: any) => count + this.countDataPoints(value), 0);
    }
    return 1;
  }

  private calculateFileSize(data: any): number {
    // Estimate file size based on data complexity
    const jsonString = JSON.stringify(data);
    return Math.max(jsonString.length * 10, 50000); // Minimum 50KB
  }

  private getTopCategories(listings: any[]): Array<{category: string, count: number}> {
    const categoryCount: { [key: string]: number } = {};
    listings.forEach(car => {
      const category = car.category || 'Unknown';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getTopBrands(listings: any[]): Array<{brand: string, count: number}> {
    const brandCount: { [key: string]: number } = {};
    listings.forEach(car => {
      const brand = car.brand || 'Unknown';
      brandCount[brand] = (brandCount[brand] || 0) + 1;
    });
    return Object.entries(brandCount)
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private getAveragePriceByCategory(listings: any[]): { [key: string]: number } {
    const categoryPrices: { [key: string]: { total: number, count: number } } = {};
    listings.forEach(car => {
      const category = car.category || 'Unknown';
      if (!categoryPrices[category]) {
        categoryPrices[category] = { total: 0, count: 0 };
      }
      categoryPrices[category].total += car.price || 0;
      categoryPrices[category].count += 1;
    });

    const averages: { [key: string]: number } = {};
    Object.entries(categoryPrices).forEach(([category, data]) => {
      averages[category] = data.count > 0 ? data.total / data.count : 0;
    });
    return averages;
  }

  private calculateDemandMetrics(transactions: any[]): any {
    return {
      totalDemand: transactions.length,
      averageTransactionValue: transactions.length > 0 ? transactions.reduce((sum, t) => sum + (t.total_amount || 0), 0) / transactions.length : 0,
      demandByCategory: this.calculateDemandByCategory(transactions)
    };
  }

  private calculateDemandByCategory(transactions: any[]): { [key: string]: number } {
    const categoryDemand: { [key: string]: number } = {};
    transactions.forEach(t => {
      const category = t.listings?.category || 'Unknown';
      categoryDemand[category] = (categoryDemand[category] || 0) + 1;
    });
    return categoryDemand;
  }

  private calculateInventoryMetrics(listings: any[]): any {
    return {
      totalInventory: listings.length,
      averagePrice: listings.length > 0 ? listings.reduce((sum, car) => sum + (car.price || 0), 0) / listings.length : 0,
      inventoryByCategory: this.getTopCategories(listings),
      inventoryByBrand: this.getTopBrands(listings)
    };
  }

  private generateCSVReport(reportData: any, reportType: string): string {
    let csv = '';

    switch (reportType) {
      case 'sales':
        csv = 'Date,Transaction ID,Amount,Customer,Category\n';
        if (reportData.transactions) {
          reportData.transactions.forEach((t: any) => {
            csv += `${t.created_at},${t.id},${t.total_amount},${t.users?.full_name || 'Unknown'},${t.listings?.category || 'Unknown'}\n`;
          });
        }
        csv += `\n\nSummary\nTotal Revenue,${reportData.summary?.totalRevenue || 0}\n`;
        csv += `Total Transactions,${reportData.summary?.totalTransactions || 0}\n`;
        csv += `Average Transaction,${reportData.summary?.averageTransactionValue || 0}\n`;
        break;

      case 'financial':
        csv = 'Metric,Value\n';
        csv += `Total Revenue,${reportData.summary?.totalRevenue || 0}\n`;
        csv += `Total Transactions,${reportData.summary?.totalTransactions || 0}\n`;
        csv += `Average Transaction,${reportData.summary?.averageTransactionValue || 0}\n`;

        if (reportData.revenueByPaymentMethod) {
          csv += '\n\nRevenue by Payment Method\n';
          Object.entries(reportData.revenueByPaymentMethod).forEach(([method, amount]) => {
            csv += `${method},${amount}\n`;
          });
        }
        break;

      case 'inventory':
        csv = 'Inventory Report\n';
        csv += `Total Vehicles,${reportData.summary?.totalVehicles || 0}\n`;
        csv += `Total Inventory Value,${reportData.summary?.totalInventoryValue || 0}\n`;
        csv += `Average Vehicle Price,${reportData.summary?.averageVehiclePrice || 0}\n`;

        if (reportData.inventoryByCategory) {
          csv += '\n\nVehicles by Category\n';
          Object.entries(reportData.inventoryByCategory).forEach(([category, count]) => {
            csv += `${category},${count}\n`;
          });
        }
        break;

      default:
        csv = 'Report Data\n';
        csv += JSON.stringify(reportData, null, 2);
    }

    return csv;
  }

  private generateTextReport(reportData: any, reportType: string): string {
    let text = `LAPORAN ${reportType.toUpperCase()}\n`;
    text += `Generated: ${new Date().toLocaleString('id-ID')}\n`;
    text += `${'='.repeat(50)}\n\n`;

    switch (reportType) {
      case 'sales':
        text += `SALES REPORT SUMMARY\n`;
        text += `Total Revenue: Rp ${(reportData.summary?.totalRevenue || 0).toLocaleString('id-ID')}\n`;
        text += `Total Transactions: ${reportData.summary?.totalTransactions || 0}\n`;
        text += `Average Transaction: Rp ${(reportData.summary?.averageTransactionValue || 0).toLocaleString('id-ID')}\n`;
        text += `Unique Customers: ${reportData.summary?.uniqueCustomers || 0}\n\n`;

        if (reportData.salesByCategory) {
          text += `SALES BY CATEGORY:\n`;
          Object.entries(reportData.salesByCategory).forEach(([category, count]) => {
            text += `- ${category}: ${count} transactions\n`;
          });
        }
        break;

      case 'financial':
        text += `FINANCIAL REPORT SUMMARY\n`;
        text += `Total Revenue: Rp ${(reportData.summary?.totalRevenue || 0).toLocaleString('id-ID')}\n`;
        text += `Total Transactions: ${reportData.summary?.totalTransactions || 0}\n`;
        text += `Average Transaction: Rp ${(reportData.summary?.averageTransactionValue || 0).toLocaleString('id-ID')}\n\n`;

        if (reportData.revenueByPaymentMethod) {
          text += `REVENUE BY PAYMENT METHOD:\n`;
          Object.entries(reportData.revenueByPaymentMethod).forEach(([method, amount]: [string, any]) => {
            text += `- ${method}: Rp ${(amount || 0).toLocaleString('id-ID')}\n`;
          });
        }
        break;

      case 'inventory':
        text += `INVENTORY REPORT SUMMARY\n`;
        text += `Total Vehicles: ${reportData.summary?.totalVehicles || 0}\n`;
        text += `Total Inventory Value: Rp ${(reportData.summary?.totalInventoryValue || 0).toLocaleString('id-ID')}\n`;
        text += `Average Vehicle Price: Rp ${(reportData.summary?.averageVehiclePrice || 0).toLocaleString('id-ID')}\n\n`;

        if (reportData.inventoryByCategory) {
          text += `VEHICLES BY CATEGORY:\n`;
          Object.entries(reportData.inventoryByCategory).forEach(([category, count]) => {
            text += `- ${category}: ${count} vehicles\n`;
          });
        }
        break;

      default:
        text += `REPORT DATA:\n`;
        text += JSON.stringify(reportData, null, 2);
    }

    text += `\n\n${'='.repeat(50)}\n`;
    text += `End of Report\n`;

    return text;
  }
}

export default LayananLaporan;