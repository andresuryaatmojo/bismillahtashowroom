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
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
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
  FileChartLine,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Briefcase,
  Award,
  MapPin,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

import LayananLaporan, {
  Report,
  ReportFilter,
  ReportGenerationRequest,
  EXECUTIVE_REPORT_TYPES,
  REPORT_STATUS,
  REPORT_FORMATS,
  PERIOD_TYPES,
  DISTRIBUTION_METHODS
} from '../services/LayananLaporan';

const HalamanLaporanEksekutif = () => {
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
    success: null as string | null,
    activeTab: 'dashboard'
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

  // Mock data for charts
  const mockSalesData = [
    { month: 'Jan', penjualan: 4500000000, target: 4000000000, profit: 675000000 },
    { month: 'Feb', penjualan: 5200000000, target: 4000000000, profit: 780000000 },
    { month: 'Mar', penjualan: 4800000000, target: 4500000000, profit: 720000000 },
    { month: 'Apr', penjualan: 6100000000, target: 5000000000, profit: 915000000 },
    { month: 'Mei', penjualan: 5500000000, target: 5000000000, profit: 825000000 },
    { month: 'Jun', penjualan: 7200000000, target: 6000000000, profit: 1080000000 }
  ];

  const mockCategoryData = [
    { name: 'Sedan', value: 35, color: '#3b82f6' },
    { name: 'SUV', value: 28, color: '#10b981' },
    { name: 'MPV', value: 20, color: '#f59e0b' },
    { name: 'Hatchback', value: 12, color: '#ef4444' },
    { name: 'Pickup', value: 5, color: '#8b5cf6' }
  ];

  const mockRegionalData = [
    { region: 'Jakarta', penjualan: 8500000000, growth: 12.5, target: 7500000000, market: 32 },
    { region: 'Surabaya', penjualan: 6200000000, growth: 8.3, target: 6000000000, market: 24 },
    { region: 'Bandung', penjualan: 4100000000, growth: -2.1, target: 4500000000, market: 16 },
    { region: 'Medan', penjualan: 3800000000, growth: 15.7, target: 3500000000, market: 14 },
    { region: 'Semarang', penjualan: 2900000000, growth: 6.2, target: 2800000000, market: 11 },
    { region: 'Makassar', penjualan: 1800000000, growth: 3.8, target: 2000000000, market: 7 }
  ];

  const mockPerformanceMetrics = [
    { metric: 'Customer Satisfaction', current: 4.2, previous: 4.0, target: 4.5, unit: 'rating' },
    { metric: 'Conversion Rate', current: 18.5, previous: 16.2, target: 20.0, unit: '%' },
    { metric: 'Average Order Value', current: 285000000, previous: 265000000, target: 300000000, unit: 'IDR' },
    { metric: 'Sales Cycle Time', current: 12, previous: 15, target: 10, unit: 'days' },
    { metric: 'Market Share', current: 15.2, previous: 14.8, target: 18.0, unit: '%' }
  ];

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

      const result = await laporanService.getReports(filter, user?.id, 'executive');

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
      const result = await laporanService.getReportStatistics(user?.id, 'executive');

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
    if (type.includes('sales') || type.includes('financial')) return <DollarSign className="h-4 w-4" />;
    if (type.includes('market') || type.includes('regional')) return <MapPin className="h-4 w-4" />;
    if (type.includes('kpi') || type.includes('strategic')) return <Target className="h-4 w-4" />;
    if (type.includes('customer') || type.includes('insight')) return <Users className="h-4 w-4" />;
    return <FileChartLine className="h-4 w-4" />;
  };

  const getTrendIcon = (value: number, target: number) => {
    if (value >= target) {
      return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    } else if (value < target * 0.9) {
      return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    } else {
      return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `Rp ${(amount / 1000000000).toFixed(1)}M`;
    } else if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(0)}jt`;
    }
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Laporan Eksekutif</h1>
            <p className="text-gray-600 mt-1">Dashboard strategis dan insight kinerja showroom</p>
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
                  <DialogTitle>Buat Laporan Strategis</DialogTitle>
                  <DialogDescription>
                    Generate laporan eksekutif untuk analisis dan insight bisnis
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
                        {EXECUTIVE_REPORT_TYPES.map((type) => (
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

        {/* Main Content */}
        <Tabs value={state.activeTab} onValueChange={(value) => setState(prev => ({ ...prev, activeTab: value }))}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Laporan</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rp 33.3M</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+15.2%</span> dari bulan lalu
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">15.8%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+2.1%</span> dari target
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Market Share</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">15.2%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+0.4%</span> dari quarter lalu
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.2/5.0</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+0.2</span> dari bulan lalu
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Trend Penjualan vs Target
                  </CardTitle>
                  <CardDescription>
                    Perbandingan penjualan aktual dengan target bulanan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={mockSalesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `Rp ${(value / 1000000000).toFixed(1)}M`} />
                      <Tooltip
                        formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, '']}
                        labelFormatter={(label) => `Bulan ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="penjualan"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Penjualan"
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="#ef4444"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Target"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Distribusi Kategori
                  </CardTitle>
                  <CardDescription>
                    Persentase penjualan berdasarkan kategori mobil
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={mockCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {mockCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Regional Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Performa Regional
                </CardTitle>
                <CardDescription>
                  Perbandingan kinerja penjualan per regional
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Regional</TableHead>
                        <TableHead>Penjualan</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Growth</TableHead>
                        <TableHead>Market Share</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockRegionalData.map((region, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{region.region}</TableCell>
                          <TableCell>{formatCurrency(region.penjualan)}</TableCell>
                          <TableCell>{formatCurrency(region.target)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {region.growth > 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                              <span className={region.growth > 0 ? 'text-green-600' : 'text-red-600'}>
                                {region.growth > 0 ? '+' : ''}{region.growth}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{region.market}%</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(region.penjualan, region.target)}
                              <Badge variant={region.penjualan >= region.target ? 'default' : 'secondary'}>
                                {region.penjualan >= region.target ? 'On Target' : 'Below Target'}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Key Performance Indicators
                </CardTitle>
                <CardDescription>
                  Metrik performa bisnis dibandingkan dengan target
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockPerformanceMetrics.map((metric, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{metric.metric}</h4>
                        {getTrendIcon(metric.current, metric.target)}
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {metric.unit === 'IDR'
                          ? formatCurrency(metric.current)
                          : metric.unit === 'rating'
                          ? `${metric.current}/5`
                          : `${metric.current}${metric.unit}`
                        }
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        Target: {metric.unit === 'IDR'
                          ? formatCurrency(metric.target)
                          : `${metric.target}${metric.unit}`
                        }
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            metric.current >= metric.target
                              ? 'bg-green-600'
                              : metric.current >= metric.target * 0.9
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                          }`}
                          style={{
                            width: `${Math.min((metric.current / metric.target) * 100, 100)}%`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Previous: {metric.previous}{metric.unit}</span>
                        <span>
                          {metric.current > metric.previous ? (
                            <span className="text-green-600">+{((metric.current - metric.previous) / metric.previous * 100).toFixed(1)}%</span>
                          ) : (
                            <span className="text-red-600">{((metric.current - metric.previous) / metric.previous * 100).toFixed(1)}%</span>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Profit Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profit Analysis</CardTitle>
                  <CardDescription>Tren profit margin overtime</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={mockSalesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `Rp ${(value / 1000000000).toFixed(1)}M`} />
                      <Tooltip formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Profit']} />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Growth Rate</CardTitle>
                  <CardDescription>Monthly growth percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockSalesData.slice(1).map((item, index) => {
                      const prevItem = mockSalesData[index];
                      const growth = ((item.penjualan - prevItem.penjualan) / prevItem.penjualan * 100);
                      return (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{item.month}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {growth > 0 ? '+' : ''}{growth.toFixed(1)}%
                            </span>
                            {growth > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Statistics Cards */}
            {state.statistics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <Card>
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
                        {EXECUTIVE_REPORT_TYPES.filter(type => type.value).map((type) => (
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
                <CardTitle>Daftar Laporan Eksekutif</CardTitle>
                <CardDescription>
                  Total {state.reports.length} laporan strategis ditemukan
                </CardDescription>
              </CardHeader>
              <CardContent>
                {state.reports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileChartLine className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada laporan strategis yang tersedia</p>
                    <p className="text-sm">Buat laporan baru untuk memulai analisis bisnis</p>
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
                                      <DialogTitle>Detail Laporan Strategis</DialogTitle>
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
          </TabsContent>
        </Tabs>

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

export default HalamanLaporanEksekutif;