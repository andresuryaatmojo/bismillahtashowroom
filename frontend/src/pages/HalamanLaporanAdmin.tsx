import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table';
import {
  FileText,
  Download,
  Send,
  Calendar,
  Filter,
  Search,
  Plus,
  RefreshCw,
  Trash2,
  Archive,
  Mail,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  FileChartLine,
  Users,
  ShoppingCart,
  Package,
  Activity,
  Info
} from 'lucide-react';

import LayananLaporan, {
  Report,
  ReportFilter,
  ReportGenerationRequest,
  ADMIN_REPORT_TYPES,
  REPORT_STATUS,
  REPORT_FORMATS,
  PERIOD_TYPES,
  DISTRIBUTION_METHODS
} from '../services/LayananLaporan';

const HalamanLaporanAdmin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const laporanService = new LayananLaporan();

  const [state, setState] = useState({
    isLoading: false,
    reports: [] as Report[],
    statistics: null as any,
    searchQuery: '',
    filterStatus: '',
    filterType: '',
    filterPeriod: '',
    selectedReport: null as Report | null,
    showCreateDialog: false,
    showDistributionDialog: false,
    showViewDialog: false,
    showDeleteDialog: false,
    reportToDelete: null as string | null,
    error: null as string | null,
    success: null as string | null
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    report_type: '',
    period_type: '',
    period_start: '',
    period_end: '',
    file_format: 'pdf',
    notes: '',
    is_scheduled: false,
    schedule_cron: ''
  });

  const [distributionData, setDistributionData] = useState({
    method: 'email',
    recipients: [{ email: '', name: '' }]
  });

  useEffect(() => {
    loadReports();
    loadStatistics();

    // Set up polling interval for updating report status
    const interval = setInterval(() => {
      loadReports();
      loadStatistics();
    }, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const loadReports = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const filter: ReportFilter = {
        search: state.searchQuery || undefined,
        status: state.filterStatus && state.filterStatus !== 'all' ? state.filterStatus : undefined,
        report_type: state.filterType && state.filterType !== 'all' ? state.filterType : undefined,
        period_type: state.filterPeriod && state.filterPeriod !== 'all' ? state.filterPeriod : undefined
      };

      const result = await laporanService.getReports(filter, user?.id, 'admin');

      if (result.success && result.reports) {
        setState(prev => ({
          ...prev,
          reports: result.reports!,
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Gagal memuat laporan',
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      setState(prev => ({
        ...prev,
        error: 'Terjadi kesalahan saat memuat laporan',
        isLoading: false
      }));
    }
  };

  const loadStatistics = async () => {
    try {
      const result = await laporanService.getReportStatistics(user?.id, 'admin');

      if (result.success && result.statistics) {
        setState(prev => ({
          ...prev,
          statistics: result.statistics
        }));
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleCreateReport = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const request: ReportGenerationRequest = {
        title: formData.title,
        description: formData.description,
        report_type: formData.report_type,
        period_type: formData.period_type,
        period_start: new Date(formData.period_start),
        period_end: new Date(formData.period_end),
        file_format: formData.file_format,
        notes: formData.notes,
        is_scheduled: formData.is_scheduled,
        schedule_cron: formData.schedule_cron || undefined
      };

      const result = await laporanService.generateReport(request, user?.id || '');

      if (result.success) {
        setState(prev => ({
          ...prev,
          success: 'Laporan berhasil dibuat dan sedang diproses',
          showCreateDialog: false,
          isLoading: false
        }));

        // Reset form
        setFormData({
          title: '',
          description: '',
          report_type: '',
          period_type: '',
          period_start: '',
          period_end: '',
          file_format: 'pdf',
          notes: '',
          is_scheduled: false,
          schedule_cron: ''
        });

        // Reload reports
        loadReports();
        loadStatistics();

        // Clear success message after 3 seconds
        setTimeout(() => {
          setState(prev => ({ ...prev, success: null }));
        }, 3000);
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Gagal membuat laporan',
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Error creating report:', error);
      setState(prev => ({
        ...prev,
        error: 'Terjadi kesalahan saat membuat laporan',
        isLoading: false
      }));
    }
  };

  const handleDistributeReport = async () => {
    if (!state.selectedReport) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const recipients = distributionData.recipients
        .filter(r => r.email.trim() !== '')
        .map(r => ({
          email: r.email,
          name: r.name
        }));

      if (recipients.length === 0) {
        setState(prev => ({
          ...prev,
          error: 'Minimal satu penerima harus diisi',
          isLoading: false
        }));
        return;
      }

      const result = await laporanService.distributeReport(
        state.selectedReport.id,
        recipients,
        distributionData.method
      );

      if (result.success) {
        setState(prev => ({
          ...prev,
          success: 'Laporan berhasil didistribusikan',
          showDistributionDialog: false,
          isLoading: false
        }));

        // Reset distribution data
        setDistributionData({
          method: 'email',
          recipients: [{ email: '', name: '' }]
        });

        // Clear success message after 3 seconds
        setTimeout(() => {
          setState(prev => ({ ...prev, success: null }));
        }, 3000);
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Gagal mendistribusikan laporan',
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Error distributing report:', error);
      setState(prev => ({
        ...prev,
        error: 'Terjadi kesalahan saat mendistribusikan laporan',
        isLoading: false
      }));
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    setState(prev => ({ ...prev, showDeleteDialog: true, reportToDelete: reportId }));
  };

  const confirmDeleteReport = async () => {
    if (!state.reportToDelete) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null, showDeleteDialog: false }));

      const result = await laporanService.deleteReport(state.reportToDelete);

      if (result.success) {
        setState(prev => ({
          ...prev,
          success: 'Laporan berhasil dihapus',
          isLoading: false,
          reportToDelete: null
        }));

        // Reload reports
        loadReports();
        loadStatistics();

        // Clear success message after 3 seconds
        setTimeout(() => {
          setState(prev => ({ ...prev, success: null }));
        }, 3000);
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Gagal menghapus laporan',
          isLoading: false,
          reportToDelete: null
        }));
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      setState(prev => ({
        ...prev,
        error: 'Terjadi kesalahan saat menghapus laporan',
        isLoading: false,
        reportToDelete: null
      }));
    }
  };

  const handleArchiveReport = async (reportId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await laporanService.archiveReport(reportId);

      if (result.success) {
        setState(prev => ({
          ...prev,
          success: 'Laporan berhasil diarsipkan',
          isLoading: false
        }));

        // Reload reports
        loadReports();
        loadStatistics();

        // Clear success message after 3 seconds
        setTimeout(() => {
          setState(prev => ({ ...prev, success: null }));
        }, 3000);
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Gagal mengarsipkan laporan',
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Error archiving report:', error);
      setState(prev => ({
        ...prev,
        error: 'Terjadi kesalahan saat mengarsipkan laporan',
        isLoading: false
      }));
    }
  };

  const handleDownloadReport = async (reportId: string, reportTitle: string) => {
    try {
      const result = await laporanService.downloadReport(reportId);

      if (result.success && result.downloadUrl) {
        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.target = '_blank';
        link.download = `${reportTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setState(prev => ({
          ...prev,
          success: 'Laporan berhasil diunduh'
        }));

        // Clear success message after 3 seconds
        setTimeout(() => {
          setState(prev => ({ ...prev, success: null }));
        }, 3000);
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Gagal mengunduh laporan'
        }));
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      setState(prev => ({
        ...prev,
        error: 'Terjadi kesalahan saat mengunduh laporan'
      }));
    }
  };

  const addRecipient = () => {
    setDistributionData(prev => ({
      ...prev,
      recipients: [...prev.recipients, { email: '', name: '' }]
    }));
  };

  const removeRecipient = (index: number) => {
    setDistributionData(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  const updateRecipient = (index: number, field: string, value: string) => {
    setDistributionData(prev => ({
      ...prev,
      recipients: prev.recipients.map((r, i) =>
        i === index ? { ...r, [field]: value } : r
      )
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'generating':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getReportIcon = (type: string) => {
    if (type.includes('sales')) return <ShoppingCart className="h-4 w-4" />;
    if (type.includes('inventory')) return <Package className="h-4 w-4" />;
    if (type.includes('customer') || type.includes('staff')) return <Users className="h-4 w-4" />;
    if (type.includes('transaction')) return <FileSpreadsheet className="h-4 w-4" />;
    return <FileChartLine className="h-4 w-4" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Komponen tombol aksi dengan keterangan yang jelas
  const ActionButton = ({ icon, title, onClick, disabled, variant = "outline", className = "" }: {
    icon: React.ReactNode;
    title: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: "outline" | "destructive";
    className?: string;
  }) => (
    <div className="group relative inline-block">
      <Button
        size="sm"
        variant={variant}
        onClick={onClick}
        disabled={disabled}
        className={`${className}`}
      >
        {icon}
      </Button>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
        {title}
      </div>
    </div>
  );

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Laporan Admin</h1>
            <p className="text-gray-600 mt-1">Kelola laporan operasional dan detail transaksi showroom</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => { loadReports(); loadStatistics(); }}
              disabled={state.isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${state.isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={state.showCreateDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showCreateDialog: open }))}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Laporan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Buat Laporan Baru</DialogTitle>
                  <DialogDescription>
                    Generate laporan operasional untuk periode tertentu
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Judul Laporan</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Masukkan judul laporan"
                    />
                  </div>

                  <div>
                    <Label htmlFor="report_type">Jenis Laporan</Label>
                    <Select value={formData.report_type} onValueChange={(value) => setFormData(prev => ({ ...prev, report_type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis laporan" />
                      </SelectTrigger>
                      <SelectContent>
                        {ADMIN_REPORT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {getReportIcon(type.value)}
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-sm text-gray-500">{type.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Deskripsi laporan (opsional)"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="period_type">Tipe Periode</Label>
                      <Select value={formData.period_type} onValueChange={(value) => setFormData(prev => ({ ...prev, period_type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe periode" />
                        </SelectTrigger>
                        <SelectContent>
                          {PERIOD_TYPES.map((period) => (
                            <SelectItem key={period.value} value={period.value}>
                              {period.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="file_format">Format Laporan</Label>
                      <Select value={formData.file_format} onValueChange={(value) => setFormData(prev => ({ ...prev, file_format: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih format" />
                        </SelectTrigger>
                        <SelectContent>
                          {REPORT_FORMATS.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              <div className="flex items-center gap-2">
                                <span>{format.icon}</span>
                                {format.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="period_start">Tanggal Mulai</Label>
                      <Input
                        id="period_start"
                        type="date"
                        value={formData.period_start}
                        onChange={(e) => setFormData(prev => ({ ...prev, period_start: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="period_end">Tanggal Selesai</Label>
                      <Input
                        id="period_end"
                        type="date"
                        value={formData.period_end}
                        onChange={(e) => setFormData(prev => ({ ...prev, period_end: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Catatan</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Catatan tambahan (opsional)"
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setState(prev => ({ ...prev, showCreateDialog: false }))}
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleCreateReport}
                      disabled={state.isLoading || !formData.title || !formData.report_type || !formData.period_start || !formData.period_end}
                    >
                      {state.isLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4 mr-2" />
                      )}
                      Generate Laporan
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Alert Messages */}
        {state.error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{state.error}</AlertDescription>
          </Alert>
        )}

        {state.success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{state.success}</AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        {state.statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Laporan</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{state.statistics.totalReports}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Selesai</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{state.statistics.completedReports}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Diproses</CardTitle>
                <RefreshCw className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{state.statistics.generatingReports}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gagal</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{state.statistics.failedReports}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter Laporan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="search">Pencarian</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="search"
                    placeholder="Cari laporan..."
                    value={state.searchQuery}
                    onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="filterType">Jenis Laporan</Label>
                <Select value={state.filterType} onValueChange={(value) => setState(prev => ({ ...prev, filterType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua jenis</SelectItem>
                    {ADMIN_REPORT_TYPES.filter(type => type.value).map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filterStatus">Status</Label>
                <Select value={state.filterStatus} onValueChange={(value) => setState(prev => ({ ...prev, filterStatus: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua status</SelectItem>
                    {REPORT_STATUS.filter(status => status.value).map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filterPeriod">Tipe Periode</Label>
                <Select value={state.filterPeriod} onValueChange={(value) => setState(prev => ({ ...prev, filterPeriod: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua periode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua periode</SelectItem>
                    {PERIOD_TYPES.filter(period => period.value).map((period) => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={loadReports} disabled={state.isLoading}>
                  <Search className="h-4 w-4 mr-2" />
                  Cari
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Laporan</CardTitle>
            <CardDescription>
              Total {state.reports.length} laporan ditemukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state.reports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Belum ada laporan yang tersedia</p>
                <p className="text-sm">Buat laporan baru untuk memulai</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Jenis Laporan</TableHead>
                      <TableHead>Judul</TableHead>
                      <TableHead>Periode</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead>Ukuran File</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getReportIcon(report.report_type)}
                            <span className="text-sm">
                              {laporanService.getReportTypeLabel(report.report_type)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{report.title}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(report.period_start)} - {formatDate(report.period_end)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {PERIOD_TYPES.find(p => p.value === report.period_type)?.label}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {REPORT_FORMATS.find(f => f.value === report.file_format)?.icon} {report.file_format.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(report.status)}
                            <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                              {laporanService.getStatusLabel(report.status)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(report.created_at)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {report.file_size ? formatFileSize(report.file_size) : '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            {report.status === 'completed' && (
                              <>
                                <ActionButton
                                  icon={<Eye className="h-4 w-4" />}
                                  title="Lihat Laporan"
                                  onClick={() => {
                                    setState(prev => ({ ...prev, selectedReport: report }));
                                    if (report.file_url) {
                                      window.open(report.file_url, '_blank');
                                    }
                                  }}
                                />

                                <ActionButton
                                  icon={<Download className="h-4 w-4" />}
                                  title="Unduh Laporan"
                                  onClick={() => handleDownloadReport(report.id, report.title)}
                                />

                                <ActionButton
                                  icon={<Send className="h-4 w-4" />}
                                  title="Kirim Laporan"
                                  onClick={() => {
                                    setState(prev => ({ ...prev, selectedReport: report, showDistributionDialog: true }));
                                  }}
                                />
                              </>
                            )}

                            <Dialog open={state.showViewDialog && state.selectedReport?.id === report.id} onOpenChange={(open) => setState(prev => ({ ...prev, showViewDialog: open }))}>
                              <DialogTrigger asChild>
                                <ActionButton
                                  icon={<Activity className="h-4 w-4" />}
                                  title="Detail Laporan"
                                  onClick={() => setState(prev => ({ ...prev, selectedReport: report, showViewDialog: true }))}
                                />
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Detail Laporan</DialogTitle>
                                </DialogHeader>
                                {state.selectedReport && (
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Judul</Label>
                                      <p className="font-medium">{state.selectedReport.title}</p>
                                    </div>
                                    <div>
                                      <Label>Deskripsi</Label>
                                      <p className="text-sm">{state.selectedReport.description || '-'}</p>
                                    </div>
                                    <div>
                                      <Label>Status</Label>
                                      <div className="flex items-center gap-2">
                                        {getStatusIcon(state.selectedReport.status)}
                                        <Badge>{laporanService.getStatusLabel(state.selectedReport.status)}</Badge>
                                      </div>
                                    </div>
                                    {state.selectedReport.summary_data && (
                                      <div>
                                        <Label>Ringkasan Data</Label>
                                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                                          {JSON.stringify(state.selectedReport.summary_data, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <ActionButton
                              icon={<Archive className="h-4 w-4" />}
                              title={report.status === 'archived' ? 'Laporan Sudah Diarsipkan' : 'Arsipkan Laporan'}
                              onClick={() => handleArchiveReport(report.id)}
                              disabled={report.status === 'archived'}
                            />

                            <ActionButton
                              icon={<Trash2 className="h-4 w-4" />}
                              title="Hapus Laporan"
                              onClick={() => handleDeleteReport(report.id)}
                              variant="destructive"
                              className="text-red-600 hover:text-red-700"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Distribution Dialog */}
        <Dialog open={state.showDistributionDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showDistributionDialog: open }))}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Distribusikan Laporan</DialogTitle>
              <DialogDescription>
                Kirim laporan "{state.selectedReport?.title}" ke penerima
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Metode Distribusi</Label>
                <Select
                  value={distributionData.method}
                  onValueChange={(value) => setDistributionData(prev => ({ ...prev, method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISTRIBUTION_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        <div className="flex items-center gap-2">
                          <span>{method.icon}</span>
                          {method.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Penerima</Label>
                <div className="space-y-2">
                  {distributionData.recipients.map((recipient, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Nama"
                        value={recipient.name}
                        onChange={(e) => updateRecipient(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={recipient.email}
                        onChange={(e) => updateRecipient(index, 'email', e.target.value)}
                        className="flex-1"
                      />
                      {distributionData.recipients.length > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeRecipient(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addRecipient}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Penerima
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setState(prev => ({ ...prev, showDistributionDialog: false }))}
                >
                  Batal
                </Button>
                <Button
                  onClick={handleDistributeReport}
                  disabled={state.isLoading}
                >
                  {state.isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Kirim
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={state.showDeleteDialog} onOpenChange={(open) => setState(prev => ({ ...prev, showDeleteDialog: open }))}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus Laporan</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setState(prev => ({ ...prev, showDeleteDialog: false, reportToDelete: null }))}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteReport}
                disabled={state.isLoading}
              >
                {state.isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Hapus
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default HalamanLaporanAdmin;