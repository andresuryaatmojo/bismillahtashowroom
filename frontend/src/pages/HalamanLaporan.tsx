import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  DollarSign,
  Users,
  Car,
  Target,
  Settings,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

// Interfaces
interface LaporanData {
  id: string;
  nama: string;
  jenis: 'Penjualan' | 'Keuangan' | 'Inventaris' | 'Performa' | 'Eksekutif';
  periode: string;
  tanggalGenerate: string;
  status: 'Generated' | 'Processing' | 'Failed';
  ukuranFile: string;
  format: 'PDF' | 'Excel' | 'CSV';
}

interface ParameterLaporan {
  periode: {
    dari: string;
    sampai: string;
    preset: 'hari-ini' | 'minggu-ini' | 'bulan-ini' | 'tahun-ini' | 'custom';
  };
  filter: {
    cabang?: string[];
    kategori?: string[];
    status?: string[];
    salesPerson?: string[];
  };
  format: 'PDF' | 'Excel' | 'CSV';
  detail: boolean;
}

interface ParameterFinansial {
  includeRevenue: boolean;
  includeExpenses: boolean;
  includeProfitLoss: boolean;
  includeCashFlow: boolean;
  breakdown: 'harian' | 'mingguan' | 'bulanan';
}

interface ParameterPerforma {
  includeConversionRate: boolean;
  includeLeadSource: boolean;
  includeSalesTarget: boolean;
  includeCustomerSatisfaction: boolean;
  compareWithPrevious: boolean;
}

interface ParameterStrategis {
  includeMarketShare: boolean;
  includeCompetitorAnalysis: boolean;
  includeGrowthTrend: boolean;
  includeForecast: boolean;
  timeHorizon: '3-bulan' | '6-bulan' | '1-tahun';
}

interface ParameterOperasional {
  includeInventoryTurnover: boolean;
  includeServiceMetrics: boolean;
  includeStaffPerformance: boolean;
  includeProcessEfficiency: boolean;
  departmentFocus: string[];
}

interface StatistikLaporan {
  totalGenerated: number;
  successRate: number;
  avgGenerationTime: number;
  popularType: string;
  lastGenerated: string;
}

interface PageState {
  currentView: 'menu' | 'generate' | 'history' | 'eksekutif';
  selectedJenis: string;
  parameter: ParameterLaporan;
  parameterFinansial: ParameterFinansial;
  parameterPerforma: ParameterPerforma;
  parameterStrategis: ParameterStrategis;
  parameterOperasional: ParameterOperasional;
  isGenerating: boolean;
  generationProgress: number;
  daftarLaporan: LaporanData[];
  statistik: StatistikLaporan;
  showPreview: boolean;
  previewData: any;
  error: string | null;
}

const HalamanLaporan: React.FC = () => {
  const [state, setState] = useState<PageState>({
    currentView: 'menu',
    selectedJenis: '',
    parameter: {
      periode: {
        dari: '',
        sampai: '',
        preset: 'bulan-ini'
      },
      filter: {},
      format: 'PDF',
      detail: true
    },
    parameterFinansial: {
      includeRevenue: true,
      includeExpenses: true,
      includeProfitLoss: true,
      includeCashFlow: false,
      breakdown: 'bulanan'
    },
    parameterPerforma: {
      includeConversionRate: true,
      includeLeadSource: true,
      includeSalesTarget: true,
      includeCustomerSatisfaction: false,
      compareWithPrevious: true
    },
    parameterStrategis: {
      includeMarketShare: true,
      includeCompetitorAnalysis: false,
      includeGrowthTrend: true,
      includeForecast: true,
      timeHorizon: '6-bulan'
    },
    parameterOperasional: {
      includeInventoryTurnover: true,
      includeServiceMetrics: true,
      includeStaffPerformance: false,
      includeProcessEfficiency: true,
      departmentFocus: ['sales', 'service']
    },
    isGenerating: false,
    generationProgress: 0,
    daftarLaporan: [
      {
        id: '1',
        nama: 'Laporan Penjualan November 2024',
        jenis: 'Penjualan',
        periode: 'November 2024',
        tanggalGenerate: '2024-12-01T10:30:00Z',
        status: 'Generated',
        ukuranFile: '2.5 MB',
        format: 'PDF'
      },
      {
        id: '2',
        nama: 'Laporan Keuangan Q4 2024',
        jenis: 'Keuangan',
        periode: 'Q4 2024',
        tanggalGenerate: '2024-11-28T14:15:00Z',
        status: 'Generated',
        ukuranFile: '4.1 MB',
        format: 'Excel'
      },
      {
        id: '3',
        nama: 'Laporan Eksekutif Desember 2024',
        jenis: 'Eksekutif',
        periode: 'Desember 2024',
        tanggalGenerate: '2024-12-01T09:00:00Z',
        status: 'Processing',
        ukuranFile: '-',
        format: 'PDF'
      }
    ],
    statistik: {
      totalGenerated: 156,
      successRate: 98.5,
      avgGenerationTime: 45,
      popularType: 'Penjualan',
      lastGenerated: '2024-12-01T10:30:00Z'
    },
    showPreview: false,
    previewData: null,
    error: null
  });

  // Method implementations
  const aksesMenuLaporan = () => {
    setState(prev => ({ ...prev, currentView: 'menu', error: null }));
  };

  const pilihJenisLaporan = (jenisLaporan: string) => {
    setState(prev => ({ 
      ...prev, 
      selectedJenis: jenisLaporan,
      currentView: 'generate',
      error: null 
    }));
  };

  const isiParameter = (periode: any, filter: any) => {
    setState(prev => ({
      ...prev,
      parameter: {
        ...prev.parameter,
        periode: { ...prev.parameter.periode, ...periode },
        filter: { ...prev.parameter.filter, ...filter }
      }
    }));
  };

  const klikGenerate = async () => {
    if (!state.selectedJenis) {
      setState(prev => ({ ...prev, error: 'Pilih jenis laporan terlebih dahulu' }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      generationProgress: 0,
      error: null 
    }));

    // Simulate generation process
    const interval = setInterval(() => {
      setState(prev => {
        const newProgress = prev.generationProgress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          return {
            ...prev,
            isGenerating: false,
            generationProgress: 100,
            currentView: 'history'
          };
        }
        return { ...prev, generationProgress: newProgress };
      });
    }, 500);
  };

  const pilihFormatExport = (formatFile: 'PDF' | 'Excel' | 'CSV') => {
    setState(prev => ({
      ...prev,
      parameter: { ...prev.parameter, format: formatFile }
    }));
  };

  const aksesFiturGenerateLaporanEksekutif = () => {
    setState(prev => ({ 
      ...prev, 
      currentView: 'eksekutif',
      selectedJenis: 'Eksekutif'
    }));
  };

  const setParameterFinansial = (parameterFinansial: Partial<ParameterFinansial>) => {
    setState(prev => ({
      ...prev,
      parameterFinansial: { ...prev.parameterFinansial, ...parameterFinansial }
    }));
  };

  const setParameterPerforma = (parameterPerforma: Partial<ParameterPerforma>) => {
    setState(prev => ({
      ...prev,
      parameterPerforma: { ...prev.parameterPerforma, ...parameterPerforma }
    }));
  };

  const setParameterStrategis = (parameterStrategis: Partial<ParameterStrategis>) => {
    setState(prev => ({
      ...prev,
      parameterStrategis: { ...prev.parameterStrategis, ...parameterStrategis }
    }));
  };

  const setParameterOperasional = (parameterOperasional: Partial<ParameterOperasional>) => {
    setState(prev => ({
      ...prev,
      parameterOperasional: { ...prev.parameterOperasional, ...parameterOperasional }
    }));
  };

  const generateLaporan = async (jenisLaporan: string, dataParameter: any) => {
    setState(prev => ({ 
      ...prev, 
      isGenerating: true,
      selectedJenis: jenisLaporan,
      error: null
    }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newLaporan: LaporanData = {
        id: Date.now().toString(),
        nama: `Laporan ${jenisLaporan} ${new Date().toLocaleDateString('id-ID')}`,
        jenis: jenisLaporan as any,
        periode: `${dataParameter.periode?.dari} - ${dataParameter.periode?.sampai}`,
        tanggalGenerate: new Date().toISOString(),
        status: 'Generated',
        ukuranFile: '3.2 MB',
        format: dataParameter.format || 'PDF'
      };

      setState(prev => ({
        ...prev,
        daftarLaporan: [newLaporan, ...prev.daftarLaporan],
        isGenerating: false,
        currentView: 'history'
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: 'Gagal generate laporan. Silakan coba lagi.'
      }));
    }
  };

  const cekGenerateLaporanLain = () => {
    setState(prev => ({ ...prev, currentView: 'menu' }));
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Generated':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Generated':
        return <CheckCircle className="w-4 h-4" />;
      case 'Processing':
        return <Clock className="w-4 h-4" />;
      case 'Failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sistem Laporan</h1>
          <p className="text-gray-600 mt-2">
            Generate dan kelola laporan bisnis dengan mudah
          </p>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={aksesMenuLaporan}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  state.currentView === 'menu'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Menu Laporan</span>
                </div>
              </button>
              
              <button
                onClick={() => setState(prev => ({ ...prev, currentView: 'history' }))}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  state.currentView === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Riwayat Laporan</span>
                </div>
              </button>

              <button
                onClick={aksesFiturGenerateLaporanEksekutif}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  state.currentView === 'eksekutif'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Laporan Eksekutif</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <p className="text-red-800">{state.error}</p>
            </div>
          </div>
        )}

        {/* Menu Laporan */}
        {state.currentView === 'menu' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Laporan</p>
                    <p className="text-2xl font-bold text-gray-900">{state.statistik.totalGenerated}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{state.statistik.successRate}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                    <p className="text-2xl font-bold text-gray-900">{state.statistik.avgGenerationTime}s</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Terpopuler</p>
                    <p className="text-2xl font-bold text-gray-900">{state.statistik.popularType}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <RefreshCw className="w-8 h-8 text-indigo-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Terakhir</p>
                    <p className="text-sm font-bold text-gray-900">
                      {formatDate(state.statistik.lastGenerated).split(' ')[0]}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Report Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Laporan Penjualan */}
              <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                   onClick={() => pilihJenisLaporan('Penjualan')}>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <BarChart3 className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Laporan Penjualan</h3>
                      <p className="text-sm text-gray-600">Analisis performa penjualan</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Data penjualan per periode</p>
                    <p>• Analisis trend dan target</p>
                    <p>• Breakdown per sales person</p>
                    <p>• Komparasi dengan periode sebelumnya</p>
                  </div>
                </div>
              </div>

              {/* Laporan Keuangan */}
              <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                   onClick={() => pilihJenisLaporan('Keuangan')}>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-3 rounded-lg">
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Laporan Keuangan</h3>
                      <p className="text-sm text-gray-600">Ringkasan kondisi keuangan</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Laporan laba rugi</p>
                    <p>• Cash flow statement</p>
                    <p>• Revenue dan expense breakdown</p>
                    <p>• Financial ratios</p>
                  </div>
                </div>
              </div>

              {/* Laporan Inventaris */}
              <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                   onClick={() => pilihJenisLaporan('Inventaris')}>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <Car className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Laporan Inventaris</h3>
                      <p className="text-sm text-gray-600">Status stok dan inventory</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Stock level per model</p>
                    <p>• Inventory turnover</p>
                    <p>• Aging analysis</p>
                    <p>• Reorder recommendations</p>
                  </div>
                </div>
              </div>

              {/* Laporan Performa */}
              <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                   onClick={() => pilihJenisLaporan('Performa')}>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Laporan Performa</h3>
                      <p className="text-sm text-gray-600">KPI dan metrics bisnis</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Conversion rates</p>
                    <p>• Lead source analysis</p>
                    <p>• Customer satisfaction</p>
                    <p>• Sales target achievement</p>
                  </div>
                </div>
              </div>

              {/* Laporan Customer */}
              <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                   onClick={() => pilihJenisLaporan('Customer')}>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-indigo-100 p-3 rounded-lg">
                      <Users className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Laporan Customer</h3>
                      <p className="text-sm text-gray-600">Analisis data pelanggan</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Customer demographics</p>
                    <p>• Purchase behavior</p>
                    <p>• Retention analysis</p>
                    <p>• Lifetime value</p>
                  </div>
                </div>
              </div>

              {/* Laporan Eksekutif */}
              <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                   onClick={aksesFiturGenerateLaporanEksekutif}>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-red-100 p-3 rounded-lg">
                      <Target className="w-8 h-8 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">Laporan Eksekutif</h3>
                      <p className="text-sm text-gray-600">Dashboard untuk manajemen</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Executive summary</p>
                    <p>• Key business metrics</p>
                    <p>• Strategic insights</p>
                    <p>• Action recommendations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generate Report Form */}
        {state.currentView === 'generate' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Generate Laporan {state.selectedJenis}
              </h2>
              <p className="text-gray-600 mt-1">
                Atur parameter dan format laporan yang diinginkan
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Period Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Periode Laporan
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Preset Periode</label>
                    <select 
                      value={state.parameter.periode.preset}
                      onChange={(e) => isiParameter({ preset: e.target.value }, {})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="hari-ini">Hari Ini</option>
                      <option value="minggu-ini">Minggu Ini</option>
                      <option value="bulan-ini">Bulan Ini</option>
                      <option value="tahun-ini">Tahun Ini</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={state.parameter.periode.dari}
                      onChange={(e) => isiParameter({ dari: e.target.value }, {})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Tanggal Selesai</label>
                    <input
                      type="date"
                      value={state.parameter.periode.sampai}
                      onChange={(e) => isiParameter({ sampai: e.target.value }, {})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Filter Data
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Cabang</label>
                    <select 
                      multiple
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="jakarta">Jakarta</option>
                      <option value="surabaya">Surabaya</option>
                      <option value="bandung">Bandung</option>
                      <option value="medan">Medan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Kategori</label>
                    <select 
                      multiple
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="hatchback">Hatchback</option>
                      <option value="mpv">MPV</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Specific Parameters based on Report Type */}
              {state.selectedJenis === 'Keuangan' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Parameter Finansial
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={state.parameterFinansial.includeRevenue}
                        onChange={(e) => setParameterFinansial({ includeRevenue: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Include Revenue Analysis</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={state.parameterFinansial.includeExpenses}
                        onChange={(e) => setParameterFinansial({ includeExpenses: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Include Expense Breakdown</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={state.parameterFinansial.includeProfitLoss}
                        onChange={(e) => setParameterFinansial({ includeProfitLoss: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Include Profit & Loss</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={state.parameterFinansial.includeCashFlow}
                        onChange={(e) => setParameterFinansial({ includeCashFlow: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Include Cash Flow</span>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Breakdown Period</label>
                      <select 
                        value={state.parameterFinansial.breakdown}
                        onChange={(e) => setParameterFinansial({ breakdown: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="harian">Harian</option>
                        <option value="mingguan">Mingguan</option>
                        <option value="bulanan">Bulanan</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {state.selectedJenis === 'Performa' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Parameter Performa
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={state.parameterPerforma.includeConversionRate}
                        onChange={(e) => setParameterPerforma({ includeConversionRate: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Include Conversion Rate</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={state.parameterPerforma.includeLeadSource}
                        onChange={(e) => setParameterPerforma({ includeLeadSource: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Include Lead Source Analysis</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={state.parameterPerforma.includeSalesTarget}
                        onChange={(e) => setParameterPerforma({ includeSalesTarget: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Include Sales Target vs Achievement</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={state.parameterPerforma.compareWithPrevious}
                        onChange={(e) => setParameterPerforma({ compareWithPrevious: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Compare with Previous Period</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Format Export
                </label>
                <div className="flex space-x-4">
                  {(['PDF', 'Excel', 'CSV'] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => pilihFormatExport(format)}
                      className={`px-4 py-2 rounded-lg border ${
                        state.parameter.format === format
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detail Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Level Detail
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={state.parameter.detail}
                    onChange={(e) => isiParameter({}, { detail: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Include detailed breakdown and analysis</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={() => setState(prev => ({ ...prev, currentView: 'menu' }))}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Kembali
                </button>
                <button
                  onClick={klikGenerate}
                  disabled={state.isGenerating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {state.isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Generate Laporan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Executive Report */}
        {state.currentView === 'eksekutif' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Generate Laporan Eksekutif
                </h2>
                <p className="text-gray-600 mt-1">
                  Laporan komprehensif untuk tingkat manajemen
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Strategic Parameters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Parameter Strategis
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={state.parameterStrategis.includeMarketShare}
                        onChange={(e) => setParameterStrategis({ includeMarketShare: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Market Share Analysis</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={state.parameterStrategis.includeCompetitorAnalysis}
                        onChange={(e) => setParameterStrategis({ includeCompetitorAnalysis: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Competitor Analysis</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={state.parameterStrategis.includeGrowthTrend}
                        onChange={(e) => setParameterStrategis({ includeGrowthTrend: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Growth Trend Analysis</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={state.parameterStrategis.includeForecast}
                        onChange={(e) => setParameterStrategis({ includeForecast: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Business Forecast</span>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Time Horizon</label>
                      <select 
                        value={state.parameterStrategis.timeHorizon}
                        onChange={(e) => setParameterStrategis({ timeHorizon: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="3-bulan">3 Bulan</option>
                        <option value="6-bulan">6 Bulan</option>
                        <option value="1-tahun">1 Tahun</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Operational Parameters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Parameter Operasional
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={state.parameterOperasional.includeInventoryTurnover}
                        onChange={(e) => setParameterOperasional({ includeInventoryTurnover: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Inventory Turnover</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={state.parameterOperasional.includeServiceMetrics}
                        onChange={(e) => setParameterOperasional({ includeServiceMetrics: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Service Metrics</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={state.parameterOperasional.includeStaffPerformance}
                        onChange={(e) => setParameterOperasional({ includeStaffPerformance: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Staff Performance</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={state.parameterOperasional.includeProcessEfficiency}
                        onChange={(e) => setParameterOperasional({ includeProcessEfficiency: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Process Efficiency</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setState(prev => ({ ...prev, currentView: 'menu' }))}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={() => generateLaporan('Eksekutif', {
                      strategis: state.parameterStrategis,
                      operasional: state.parameterOperasional,
                      format: state.parameter.format
                    })}
                    disabled={state.isGenerating}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {state.isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4" />
                        <span>Generate Laporan Eksekutif</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report History */}
        {state.currentView === 'history' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Riwayat Laporan</h2>
                    <p className="text-gray-600 mt-1">
                      Daftar laporan yang telah di-generate
                    </p>
                  </div>
                  <button
                    onClick={cekGenerateLaporanLain}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Generate Baru</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama Laporan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jenis
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Periode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal Generate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ukuran
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {state.daftarLaporan.map((laporan) => (
                      <tr key={laporan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {laporan.nama}
                              </div>
                              <div className="text-sm text-gray-500">
                                {laporan.format}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {laporan.jenis}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {laporan.periode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(laporan.tanggalGenerate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(laporan.status)}`}>
                            {getStatusIcon(laporan.status)}
                            <span className="ml-1">{laporan.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {laporan.ukuranFile}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {laporan.status === 'Generated' && (
                              <>
                                <button className="text-blue-600 hover:text-blue-900 flex items-center space-x-1">
                                  <Download className="w-4 h-4" />
                                  <span>Download</span>
                                </button>
                                <button className="text-gray-600 hover:text-gray-900 flex items-center space-x-1">
                                  <Eye className="w-4 h-4" />
                                  <span>Preview</span>
                                </button>
                              </>
                            )}
                            {laporan.status === 'Processing' && (
                              <span className="text-yellow-600 flex items-center space-x-1">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span>Processing...</span>
                              </span>
                            )}
                            {laporan.status === 'Failed' && (
                              <button className="text-red-600 hover:text-red-900 flex items-center space-x-1">
                                <RefreshCw className="w-4 h-4" />
                                <span>Retry</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Generation Progress */}
        {state.isGenerating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Generating Laporan...
                </h3>
                <p className="text-gray-600 mb-4">
                  Mohon tunggu, laporan sedang diproses
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${state.generationProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">
                  {state.generationProgress}% selesai
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HalamanLaporan;