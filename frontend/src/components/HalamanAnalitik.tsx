import React, { useState, useEffect } from 'react';
import './HalamanAnalitik.css';

// Interface untuk data analisis sales
interface AnalisisSales {
  id: string;
  period: string;
  totalSales: number;
  totalUnits: number;
  avgPrice: number;
  topModels: TopModel[];
  salesTrend: TrendData[];
  conversionRate: number;
  customerSegments: CustomerSegment[];
}

// Interface untuk model terlaris
interface TopModel {
  name: string;
  brand: string;
  unitsSold: number;
  revenue: number;
  marketShare: number;
}

// Interface untuk data trend
interface TrendData {
  date: string;
  value: number;
  target?: number;
  category?: string;
}

// Interface untuk segmen customer
interface CustomerSegment {
  segment: string;
  percentage: number;
  revenue: number;
  avgTransactionValue: number;
}

// Interface untuk analisis market
interface AnalisisMarket {
  id: string;
  period: string;
  marketSize: number;
  marketGrowth: number;
  marketShare: number;
  competitorAnalysis: CompetitorData[];
  marketTrends: MarketTrend[];
  opportunities: MarketOpportunity[];
}

// Interface untuk data kompetitor
interface CompetitorData {
  name: string;
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
  pricing: 'premium' | 'mid-range' | 'budget';
}

// Interface untuk trend market
interface MarketTrend {
  trend: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
  timeframe: string;
}

// Interface untuk peluang market
interface MarketOpportunity {
  opportunity: string;
  potential: number;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
}

// Interface untuk analisis operational
interface AnalisisOperational {
  id: string;
  period: string;
  efficiency: number;
  productivity: number;
  costAnalysis: CostAnalysis;
  processMetrics: ProcessMetric[];
  resourceUtilization: ResourceUtilization[];
}

// Interface untuk analisis biaya
interface CostAnalysis {
  totalCost: number;
  costPerUnit: number;
  costBreakdown: CostBreakdown[];
  costTrend: TrendData[];
}

// Interface untuk breakdown biaya
interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

// Interface untuk metrik proses
interface ProcessMetric {
  process: string;
  efficiency: number;
  bottlenecks: string[];
  improvements: string[];
}

// Interface untuk utilisasi resource
interface ResourceUtilization {
  resource: string;
  utilization: number;
  capacity: number;
  status: 'optimal' | 'underutilized' | 'overutilized';
}

// Interface untuk comparative analysis
interface ComparativeAnalysis {
  id: string;
  comparisonType: 'period' | 'competitor' | 'target';
  baselineData: any;
  comparisonData: any;
  metrics: ComparisonMetric[];
  insights: string[];
  recommendations: string[];
}

// Interface untuk metrik perbandingan
interface ComparisonMetric {
  metric: string;
  baseline: number;
  comparison: number;
  variance: number;
  varianceType: 'positive' | 'negative' | 'neutral';
  unit: string;
}

// Interface untuk ekspor data
interface EksporData {
  format: 'pdf' | 'excel' | 'csv' | 'powerpoint';
  data: any;
  filename: string;
  generatedAt: string;
}

// Interface untuk status halaman
interface StatusHalaman {
  loading: boolean;
  error: string | null;
  success: string | null;
}

const HalamanAnalitik: React.FC = () => {
  // State management
  const [statusHalaman, setStatusHalaman] = useState<StatusHalaman>({
    loading: false,
    error: null,
    success: null
  });
  
  const [activeAnalysis, setActiveAnalysis] = useState<'sales' | 'market' | 'operational' | 'comparative' | null>(null);
  const [analysisPeriod, setAnalysisPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  // Analysis data states
  const [salesAnalysis, setSalesAnalysis] = useState<AnalisisSales | null>(null);
  const [marketAnalysis, setMarketAnalysis] = useState<AnalisisMarket | null>(null);
  const [operationalAnalysis, setOperationalAnalysis] = useState<AnalisisOperational | null>(null);
  const [comparativeAnalysis, setComparativeAnalysis] = useState<ComparativeAnalysis | null>(null);
  
  // UI states
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv' | 'powerpoint'>('pdf');
  const [customAnalysisType, setCustomAnalysisType] = useState('');
  const [showCustomAnalysis, setShowCustomAnalysis] = useState(false);

  // Method: aksesMenuAnalisisPerformaBisnis
  const aksesMenuAnalisisPerformaBisnis = async () => {
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      // Simulasi delay loading
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Menu analisis performa bisnis berhasil dimuat' 
      });
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal memuat menu analisis performa bisnis', 
        success: null 
      });
    }
  };

  // Method: pilihAnalsisSalesPerformance
  const pilihAnalsisSalesPerformance = async () => {
    setStatusHalaman({ loading: true, error: null, success: null });
    setActiveAnalysis('sales');
    
    try {
      // Simulasi delay loading
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const salesData = generateSalesAnalysis();
      setSalesAnalysis(salesData);
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Analisis sales performance berhasil dimuat' 
      });
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal memuat analisis sales performance', 
        success: null 
      });
    }
  };

  // Method: pilihAnalsisMarketPerformance
  const pilihAnalsisMarketPerformance = async () => {
    setStatusHalaman({ loading: true, error: null, success: null });
    setActiveAnalysis('market');
    
    try {
      // Simulasi delay loading
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const marketData = generateMarketAnalysis();
      setMarketAnalysis(marketData);
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Analisis market performance berhasil dimuat' 
      });
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal memuat analisis market performance', 
        success: null 
      });
    }
  };

  // Method: pilihAnalsisOperationalPerformance
  const pilihAnalsisOperationalPerformance = async () => {
    setStatusHalaman({ loading: true, error: null, success: null });
    setActiveAnalysis('operational');
    
    try {
      // Simulasi delay loading
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const operationalData = generateOperationalAnalysis();
      setOperationalAnalysis(operationalData);
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Analisis operational performance berhasil dimuat' 
      });
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal memuat analisis operational performance', 
        success: null 
      });
    }
  };

  // Method: pilihComparativeAnalysis
  const pilihComparativeAnalysis = async () => {
    setStatusHalaman({ loading: true, error: null, success: null });
    setActiveAnalysis('comparative');
    
    try {
      // Simulasi delay loading
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const comparativeData = generateComparativeAnalysis();
      setComparativeAnalysis(comparativeData);
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Comparative analysis berhasil dimuat' 
      });
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal memuat comparative analysis', 
        success: null 
      });
    }
  };

  // Method: pilihEksporAnalisis
  const pilihEksporAnalisis = () => {
    setShowExportModal(true);
  };

  // Method: pilihAnalisisLain
  const pilihAnalisisLain = (jenisAnalisis: string) => {
    setCustomAnalysisType(jenisAnalisis);
    setShowCustomAnalysis(true);
  };

  // Method: kembaliKeDashboard
  const kembaliKeDashboard = () => {
    if (window.confirm('Apakah Anda yakin ingin kembali ke dashboard? Data analisis yang belum disimpan akan hilang.')) {
      // Clear analysis data
      setActiveAnalysis(null);
      setSalesAnalysis(null);
      setMarketAnalysis(null);
      setOperationalAnalysis(null);
      setComparativeAnalysis(null);
      
      // Navigate back to dashboard
      window.history.back();
    }
  };

  // Helper functions untuk generate mock data
  const generateSalesAnalysis = (): AnalisisSales => {
    const topModels: TopModel[] = [
      {
        name: 'Avanza',
        brand: 'Toyota',
        unitsSold: Math.floor(Math.random() * 500 + 200),
        revenue: Math.random() * 10000000000 + 5000000000,
        marketShare: Math.random() * 20 + 15
      },
      {
        name: 'Xenia',
        brand: 'Daihatsu',
        unitsSold: Math.floor(Math.random() * 400 + 150),
        revenue: Math.random() * 8000000000 + 4000000000,
        marketShare: Math.random() * 15 + 10
      },
      {
        name: 'Brio',
        brand: 'Honda',
        unitsSold: Math.floor(Math.random() * 300 + 100),
        revenue: Math.random() * 6000000000 + 3000000000,
        marketShare: Math.random() * 12 + 8
      }
    ];
    
    const salesTrend: TrendData[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      salesTrend.push({
        date: date.toISOString().split('T')[0],
        value: Math.random() * 1000000000 + 500000000,
        target: Math.random() * 1200000000 + 600000000
      });
    }
    
    const customerSegments: CustomerSegment[] = [
      {
        segment: 'Individual',
        percentage: 65,
        revenue: Math.random() * 15000000000 + 10000000000,
        avgTransactionValue: Math.random() * 300000000 + 200000000
      },
      {
        segment: 'Corporate',
        percentage: 25,
        revenue: Math.random() * 8000000000 + 5000000000,
        avgTransactionValue: Math.random() * 500000000 + 400000000
      },
      {
        segment: 'Government',
        percentage: 10,
        revenue: Math.random() * 3000000000 + 2000000000,
        avgTransactionValue: Math.random() * 600000000 + 500000000
      }
    ];
    
    return {
      id: 'sales-analysis-1',
      period: `${analysisPeriod} - ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`,
      totalSales: topModels.reduce((sum, model) => sum + model.revenue, 0),
      totalUnits: topModels.reduce((sum, model) => sum + model.unitsSold, 0),
      avgPrice: topModels.reduce((sum, model) => sum + model.revenue, 0) / topModels.reduce((sum, model) => sum + model.unitsSold, 0),
      topModels,
      salesTrend,
      conversionRate: Math.random() * 20 + 15,
      customerSegments
    };
  };

  const generateMarketAnalysis = (): AnalisisMarket => {
    const competitorAnalysis: CompetitorData[] = [
      {
        name: 'Toyota',
        marketShare: 35,
        strengths: ['Brand reputation', 'Reliability', 'Resale value'],
        weaknesses: ['Higher price', 'Limited innovation'],
        pricing: 'premium'
      },
      {
        name: 'Honda',
        marketShare: 25,
        strengths: ['Fuel efficiency', 'Technology', 'Design'],
        weaknesses: ['Service network', 'Parts availability'],
        pricing: 'mid-range'
      },
      {
        name: 'Daihatsu',
        marketShare: 20,
        strengths: ['Affordable price', 'Compact design', 'Low maintenance'],
        weaknesses: ['Limited features', 'Brand perception'],
        pricing: 'budget'
      }
    ];
    
    const marketTrends: MarketTrend[] = [
      {
        trend: 'Electric Vehicle Adoption',
        impact: 'high',
        description: 'Increasing consumer interest in electric and hybrid vehicles',
        timeframe: '2024-2026'
      },
      {
        trend: 'Digital Sales Channel',
        impact: 'medium',
        description: 'Growing preference for online car purchasing',
        timeframe: '2024-2025'
      },
      {
        trend: 'Subscription Model',
        impact: 'low',
        description: 'Car subscription services gaining traction',
        timeframe: '2025-2027'
      }
    ];
    
    const opportunities: MarketOpportunity[] = [
      {
        opportunity: 'Electric Vehicle Market Entry',
        potential: 85,
        effort: 'high',
        timeline: '12-18 months'
      },
      {
        opportunity: 'Digital Platform Enhancement',
        potential: 70,
        effort: 'medium',
        timeline: '6-9 months'
      },
      {
        opportunity: 'After-sales Service Expansion',
        potential: 60,
        effort: 'low',
        timeline: '3-6 months'
      }
    ];
    
    return {
      id: 'market-analysis-1',
      period: `${analysisPeriod} - ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`,
      marketSize: Math.random() * 50000000000 + 30000000000,
      marketGrowth: Math.random() * 10 + 5,
      marketShare: Math.random() * 15 + 10,
      competitorAnalysis,
      marketTrends,
      opportunities
    };
  };

  const generateOperationalAnalysis = (): AnalisisOperational => {
    const costBreakdown: CostBreakdown[] = [
      {
        category: 'Personnel',
        amount: Math.random() * 5000000000 + 3000000000,
        percentage: 35,
        trend: 'up'
      },
      {
        category: 'Inventory',
        amount: Math.random() * 8000000000 + 5000000000,
        percentage: 45,
        trend: 'stable'
      },
      {
        category: 'Operations',
        amount: Math.random() * 3000000000 + 2000000000,
        percentage: 20,
        trend: 'down'
      }
    ];
    
    const costTrend: TrendData[] = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      costTrend.push({
        date: date.toISOString().split('T')[0],
        value: Math.random() * 15000000000 + 10000000000
      });
    }
    
    const processMetrics: ProcessMetric[] = [
      {
        process: 'Sales Process',
        efficiency: Math.random() * 20 + 75,
        bottlenecks: ['Lead qualification', 'Financing approval'],
        improvements: ['Automated lead scoring', 'Digital financing']
      },
      {
        process: 'Inventory Management',
        efficiency: Math.random() * 15 + 80,
        bottlenecks: ['Stock forecasting', 'Supplier delays'],
        improvements: ['AI-based forecasting', 'Supplier integration']
      },
      {
        process: 'Customer Service',
        efficiency: Math.random() * 25 + 70,
        bottlenecks: ['Response time', 'Issue resolution'],
        improvements: ['Chatbot implementation', 'Staff training']
      }
    ];
    
    const resourceUtilization: ResourceUtilization[] = [
      {
        resource: 'Sales Staff',
        utilization: Math.random() * 20 + 75,
        capacity: 100,
        status: 'optimal'
      },
      {
        resource: 'Showroom Space',
        utilization: Math.random() * 15 + 60,
        capacity: 100,
        status: 'underutilized'
      },
      {
        resource: 'Service Bay',
        utilization: Math.random() * 30 + 85,
        capacity: 100,
        status: 'overutilized'
      }
    ];
    
    return {
      id: 'operational-analysis-1',
      period: `${analysisPeriod} - ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`,
      efficiency: Math.random() * 15 + 80,
      productivity: Math.random() * 20 + 75,
      costAnalysis: {
        totalCost: costBreakdown.reduce((sum, item) => sum + item.amount, 0),
        costPerUnit: Math.random() * 50000000 + 30000000,
        costBreakdown,
        costTrend
      },
      processMetrics,
      resourceUtilization
    };
  };

  const generateComparativeAnalysis = (): ComparativeAnalysis => {
    const metrics: ComparisonMetric[] = [
      {
        metric: 'Revenue',
        baseline: Math.random() * 20000000000 + 15000000000,
        comparison: Math.random() * 25000000000 + 18000000000,
        variance: 0,
        varianceType: 'positive',
        unit: 'IDR'
      },
      {
        metric: 'Units Sold',
        baseline: Math.random() * 1000 + 800,
        comparison: Math.random() * 1200 + 900,
        variance: 0,
        varianceType: 'positive',
        unit: 'units'
      },
      {
        metric: 'Market Share',
        baseline: Math.random() * 5 + 12,
        comparison: Math.random() * 3 + 14,
        variance: 0,
        varianceType: 'positive',
        unit: '%'
      },
      {
        metric: 'Customer Satisfaction',
        baseline: Math.random() * 10 + 85,
        comparison: Math.random() * 5 + 88,
        variance: 0,
        varianceType: 'positive',
        unit: '%'
      }
    ];
    
    // Calculate variance
    metrics.forEach(metric => {
      metric.variance = ((metric.comparison - metric.baseline) / metric.baseline) * 100;
      metric.varianceType = metric.variance > 0 ? 'positive' : metric.variance < 0 ? 'negative' : 'neutral';
    });
    
    return {
      id: 'comparative-analysis-1',
      comparisonType: 'period',
      baselineData: 'Previous Period',
      comparisonData: 'Current Period',
      metrics,
      insights: [
        'Revenue menunjukkan peningkatan signifikan dibanding periode sebelumnya',
        'Penjualan unit kendaraan mengalami tren positif',
        'Market share berhasil ditingkatkan melalui strategi pemasaran yang efektif',
        'Kepuasan pelanggan meningkat berkat perbaikan layanan'
      ],
      recommendations: [
        'Pertahankan momentum pertumbuhan dengan strategi yang konsisten',
        'Investasi lebih lanjut dalam digital marketing untuk memperluas reach',
        'Tingkatkan kapasitas produksi untuk memenuhi demand yang meningkat',
        'Lanjutkan program pelatihan staff untuk mempertahankan kualitas layanan'
      ]
    };
  };

  // Handler functions
  const handleExportAnalysis = async () => {
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      // Simulasi export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const exportData: EksporData = {
        format: exportFormat,
        data: activeAnalysis === 'sales' ? salesAnalysis :
              activeAnalysis === 'market' ? marketAnalysis :
              activeAnalysis === 'operational' ? operationalAnalysis :
              comparativeAnalysis,
        filename: `${activeAnalysis}-analysis-${Date.now()}.${exportFormat}`,
        generatedAt: new Date().toISOString()
      };
      
      // Simulate file download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportData.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowExportModal(false);
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: `Analisis berhasil diekspor dalam format ${exportFormat.toUpperCase()}` 
      });
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal mengekspor analisis', 
        success: null 
      });
    }
  };

  const handleCustomAnalysis = async () => {
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      // Simulasi custom analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setShowCustomAnalysis(false);
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: `Analisis ${customAnalysisType} berhasil dijalankan` 
      });
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal menjalankan analisis custom', 
        success: null 
      });
    }
  };

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(Math.round(num));
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getVarianceColor = (varianceType: string) => {
    switch (varianceType) {
      case 'positive': return '#28a745';
      case 'negative': return '#dc3545';
      case 'neutral': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getVarianceIcon = (varianceType: string) => {
    switch (varianceType) {
      case 'positive': return 'fas fa-arrow-up';
      case 'negative': return 'fas fa-arrow-down';
      case 'neutral': return 'fas fa-minus';
      default: return 'fas fa-minus';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return '#28a745';
      case 'underutilized': return '#ffc107';
      case 'overutilized': return '#dc3545';
      default: return '#6c757d';
    }
  };

  // Effects
  useEffect(() => {
    aksesMenuAnalisisPerformaBisnis();
  }, []);

  useEffect(() => {
    if (statusHalaman.success || statusHalaman.error) {
      const timer = setTimeout(() => {
        setStatusHalaman(prev => ({ ...prev, success: null, error: null }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusHalaman.success, statusHalaman.error]);

  return (
    <div className="halaman-analitik">
      <div className="header-section">
        <div className="header-content">
          <h1>Analisis Performa Bisnis</h1>
          <p>Analisis mendalam untuk pengambilan keputusan strategis berbasis data</p>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={pilihEksporAnalisis}>
            <i className="fas fa-download"></i>
            Export Analysis
          </button>
          <button className="btn-custom" onClick={() => pilihAnalisisLain('Custom Analysis')}>
            <i className="fas fa-cog"></i>
            Custom Analysis
          </button>
          <button className="btn-back" onClick={kembaliKeDashboard}>
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {statusHalaman.error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          {statusHalaman.error}
        </div>
      )}
      
      {statusHalaman.success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          {statusHalaman.success}
        </div>
      )}

      {/* Loading State */}
      {statusHalaman.loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Memproses analisis data...</p>
        </div>
      )}

      {!statusHalaman.loading && (
        <>
          {/* Analysis Menu */}
          {!activeAnalysis && (
            <div className="analysis-menu">
              <div className="menu-grid">
                <div className="analysis-card" onClick={pilihAnalsisSalesPerformance}>
                  <div className="card-icon">
                    <i className="fas fa-chart-bar"></i>
                  </div>
                  <div className="card-content">
                    <h3>Sales Performance</h3>
                    <p>Analisis performa penjualan, trend, dan segmentasi customer</p>
                    <ul>
                      <li>Revenue & Unit Analysis</li>
                      <li>Top Performing Models</li>
                      <li>Customer Segmentation</li>
                      <li>Sales Trend & Forecasting</li>
                    </ul>
                  </div>
                </div>

                <div className="analysis-card" onClick={pilihAnalsisMarketPerformance}>
                  <div className="card-icon">
                    <i className="fas fa-search-dollar"></i>
                  </div>
                  <div className="card-content">
                    <h3>Market Performance</h3>
                    <p>Analisis posisi pasar, kompetitor, dan peluang bisnis</p>
                    <ul>
                      <li>Market Share Analysis</li>
                      <li>Competitor Benchmarking</li>
                      <li>Market Trends & Opportunities</li>
                      <li>Growth Potential Assessment</li>
                    </ul>
                  </div>
                </div>

                <div className="analysis-card" onClick={pilihAnalsisOperationalPerformance}>
                  <div className="card-icon">
                    <i className="fas fa-cogs"></i>
                  </div>
                  <div className="card-content">
                    <h3>Operational Performance</h3>
                    <p>Analisis efisiensi operasional, biaya, dan produktivitas</p>
                    <ul>
                      <li>Cost Analysis & Breakdown</li>
                      <li>Process Efficiency Metrics</li>
                      <li>Resource Utilization</li>
                      <li>Productivity Assessment</li>
                    </ul>
                  </div>
                </div>

                <div className="analysis-card" onClick={pilihComparativeAnalysis}>
                  <div className="card-icon">
                    <i className="fas fa-balance-scale"></i>
                  </div>
                  <div className="card-content">
                    <h3>Comparative Analysis</h3>
                    <p>Perbandingan performa antar periode, target, dan kompetitor</p>
                    <ul>
                      <li>Period-over-Period Comparison</li>
                      <li>Target vs Actual Analysis</li>
                      <li>Competitor Benchmarking</li>
                      <li>Variance Analysis</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sales Performance Analysis */}
          {activeAnalysis === 'sales' && salesAnalysis && (
            <div className="analysis-content">
              <div className="analysis-header">
                <h2>Sales Performance Analysis</h2>
                <p>Period: {salesAnalysis.period}</p>
                <button className="btn-back-analysis" onClick={() => setActiveAnalysis(null)}>
                  <i className="fas fa-arrow-left"></i>
                  Back to Menu
                </button>
              </div>

              {/* Sales Overview */}
              <div className="sales-overview">
                <div className="overview-stats">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{formatCurrency(salesAnalysis.totalSales)}</h3>
                      <p>Total Sales Revenue</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-car"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{formatNumber(salesAnalysis.totalUnits)}</h3>
                      <p>Units Sold</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-calculator"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{formatCurrency(salesAnalysis.avgPrice)}</h3>
                      <p>Average Price</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-percentage"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{formatPercentage(salesAnalysis.conversionRate)}</h3>
                      <p>Conversion Rate</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Models */}
              <div className="top-models-section">
                <h3>Top Performing Models</h3>
                <div className="models-grid">
                  {salesAnalysis.topModels.map((model, index) => (
                    <div key={index} className="model-card">
                      <div className="model-rank">#{index + 1}</div>
                      <div className="model-info">
                        <h4>{model.name}</h4>
                        <p>{model.brand}</p>
                      </div>
                      <div className="model-metrics">
                        <div className="metric">
                          <span>Units Sold</span>
                          <strong>{formatNumber(model.unitsSold)}</strong>
                        </div>
                        <div className="metric">
                          <span>Revenue</span>
                          <strong>{formatCurrency(model.revenue)}</strong>
                        </div>
                        <div className="metric">
                          <span>Market Share</span>
                          <strong>{formatPercentage(model.marketShare)}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Segments */}
              <div className="customer-segments-section">
                <h3>Customer Segmentation</h3>
                <div className="segments-grid">
                  {salesAnalysis.customerSegments.map((segment, index) => (
                    <div key={index} className="segment-card">
                      <div className="segment-header">
                        <h4>{segment.segment}</h4>
                        <span className="segment-percentage">{formatPercentage(segment.percentage)}</span>
                      </div>
                      <div className="segment-metrics">
                        <div className="metric">
                          <span>Revenue</span>
                          <strong>{formatCurrency(segment.revenue)}</strong>
                        </div>
                        <div className="metric">
                          <span>Avg Transaction</span>
                          <strong>{formatCurrency(segment.avgTransactionValue)}</strong>
                        </div>
                      </div>
                      <div className="segment-progress">
                        <div 
                          className="progress-fill"
                          style={{ width: `${segment.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Market Performance Analysis */}
          {activeAnalysis === 'market' && marketAnalysis && (
            <div className="analysis-content">
              <div className="analysis-header">
                <h2>Market Performance Analysis</h2>
                <p>Period: {marketAnalysis.period}</p>
                <button className="btn-back-analysis" onClick={() => setActiveAnalysis(null)}>
                  <i className="fas fa-arrow-left"></i>
                  Back to Menu
                </button>
              </div>

              {/* Market Overview */}
              <div className="market-overview">
                <div className="overview-stats">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-globe"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{formatCurrency(marketAnalysis.marketSize)}</h3>
                      <p>Total Market Size</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-chart-line"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{formatPercentage(marketAnalysis.marketGrowth)}</h3>
                      <p>Market Growth Rate</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-pie-chart"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{formatPercentage(marketAnalysis.marketShare)}</h3>
                      <p>Our Market Share</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Competitor Analysis */}
              <div className="competitor-section">
                <h3>Competitor Analysis</h3>
                <div className="competitors-grid">
                  {marketAnalysis.competitorAnalysis.map((competitor, index) => (
                    <div key={index} className="competitor-card">
                      <div className="competitor-header">
                        <h4>{competitor.name}</h4>
                        <span className="market-share">{formatPercentage(competitor.marketShare)}</span>
                      </div>
                      <div className="competitor-details">
                        <div className="strengths">
                          <h5>Strengths</h5>
                          <ul>
                            {competitor.strengths.map((strength, idx) => (
                              <li key={idx}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="weaknesses">
                          <h5>Weaknesses</h5>
                          <ul>
                            {competitor.weaknesses.map((weakness, idx) => (
                              <li key={idx}>{weakness}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="pricing">
                          <span className={`pricing-badge ${competitor.pricing}`}>
                            {competitor.pricing}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Trends */}
              <div className="trends-section">
                <h3>Market Trends</h3>
                <div className="trends-list">
                  {marketAnalysis.marketTrends.map((trend, index) => (
                    <div key={index} className="trend-card">
                      <div className="trend-header">
                        <h4>{trend.trend}</h4>
                        <span 
                          className="impact-badge"
                          style={{ backgroundColor: getImpactColor(trend.impact) }}
                        >
                          {trend.impact} impact
                        </span>
                      </div>
                      <p>{trend.description}</p>
                      <div className="trend-timeline">
                        <i className="fas fa-clock"></i>
                        <span>{trend.timeframe}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Opportunities */}
              <div className="opportunities-section">
                <h3>Market Opportunities</h3>
                <div className="opportunities-grid">
                  {marketAnalysis.opportunities.map((opportunity, index) => (
                    <div key={index} className="opportunity-card">
                      <div className="opportunity-header">
                        <h4>{opportunity.opportunity}</h4>
                        <div className="opportunity-metrics">
                          <span className="potential">{opportunity.potential}% potential</span>
                          <span 
                            className="effort-badge"
                            style={{ backgroundColor: getEffortColor(opportunity.effort) }}
                          >
                            {opportunity.effort} effort
                          </span>
                        </div>
                      </div>
                      <div className="opportunity-timeline">
                        <i className="fas fa-calendar"></i>
                        <span>{opportunity.timeline}</span>
                      </div>
                      <div className="potential-bar">
                        <div 
                          className="potential-fill"
                          style={{ width: `${opportunity.potential}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Operational Performance Analysis */}
          {activeAnalysis === 'operational' && operationalAnalysis && (
            <div className="analysis-content">
              <div className="analysis-header">
                <h2>Operational Performance Analysis</h2>
                <p>Period: {operationalAnalysis.period}</p>
                <button className="btn-back-analysis" onClick={() => setActiveAnalysis(null)}>
                  <i className="fas fa-arrow-left"></i>
                  Back to Menu
                </button>
              </div>

              {/* Operational Overview */}
              <div className="operational-overview">
                <div className="overview-stats">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-tachometer-alt"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{formatPercentage(operationalAnalysis.efficiency)}</h3>
                      <p>Overall Efficiency</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-chart-bar"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{formatPercentage(operationalAnalysis.productivity)}</h3>
                      <p>Productivity Index</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-dollar-sign"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{formatCurrency(operationalAnalysis.costAnalysis.totalCost)}</h3>
                      <p>Total Operational Cost</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <i className="fas fa-calculator"></i>
                    </div>
                    <div className="stat-content">
                      <h3>{formatCurrency(operationalAnalysis.costAnalysis.costPerUnit)}</h3>
                      <p>Cost Per Unit</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="cost-breakdown-section">
                <h3>Cost Analysis & Breakdown</h3>
                <div className="cost-grid">
                  {operationalAnalysis.costAnalysis.costBreakdown.map((cost, index) => (
                    <div key={index} className="cost-card">
                      <div className="cost-header">
                        <h4>{cost.category}</h4>
                        <span className="cost-percentage">{formatPercentage(cost.percentage)}</span>
                      </div>
                      <div className="cost-amount">
                        {formatCurrency(cost.amount)}
                      </div>
                      <div className="cost-trend">
                        <i className={`fas fa-arrow-${cost.trend === 'up' ? 'up' : cost.trend === 'down' ? 'down' : 'right'}`}></i>
                        <span>{cost.trend}</span>
                      </div>
                      <div className="cost-progress">
                        <div 
                          className="progress-fill"
                          style={{ width: `${cost.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process Metrics */}
              <div className="process-metrics-section">
                <h3>Process Efficiency Metrics</h3>
                <div className="process-grid">
                  {operationalAnalysis.processMetrics.map((process, index) => (
                    <div key={index} className="process-card">
                      <div className="process-header">
                        <h4>{process.process}</h4>
                        <span className="efficiency-score">{formatPercentage(process.efficiency)}</span>
                      </div>
                      <div className="process-details">
                        <div className="bottlenecks">
                          <h5>Bottlenecks</h5>
                          <ul>
                            {process.bottlenecks.map((bottleneck, idx) => (
                              <li key={idx}>{bottleneck}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="improvements">
                          <h5>Improvements</h5>
                          <ul>
                            {process.improvements.map((improvement, idx) => (
                              <li key={idx}>{improvement}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="efficiency-bar">
                        <div 
                          className="efficiency-fill"
                          style={{ width: `${process.efficiency}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resource Utilization */}
              <div className="resource-utilization-section">
                <h3>Resource Utilization</h3>
                <div className="resource-grid">
                  {operationalAnalysis.resourceUtilization.map((resource, index) => (
                    <div key={index} className="resource-card">
                      <div className="resource-header">
                        <h4>{resource.resource}</h4>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(resource.status) }}
                        >
                          {resource.status}
                        </span>
                      </div>
                      <div className="resource-metrics">
                        <div className="utilization-percentage">
                          {formatPercentage(resource.utilization)}
                        </div>
                        <div className="capacity-info">
                          Capacity: {formatPercentage(resource.capacity)}
                        </div>
                      </div>
                      <div className="utilization-bar">
                        <div 
                          className="utilization-fill"
                          style={{ 
                            width: `${resource.utilization}%`,
                            backgroundColor: getStatusColor(resource.status)
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Comparative Analysis */}
          {activeAnalysis === 'comparative' && comparativeAnalysis && (
            <div className="analysis-content">
              <div className="analysis-header">
                <h2>Comparative Analysis</h2>
                <p>Comparing: {comparativeAnalysis.baselineData} vs {comparativeAnalysis.comparisonData}</p>
                <button className="btn-back-analysis" onClick={() => setActiveAnalysis(null)}>
                  <i className="fas fa-arrow-left"></i>
                  Back to Menu
                </button>
              </div>

              {/* Comparison Metrics */}
              <div className="comparison-metrics-section">
                <h3>Key Metrics Comparison</h3>
                <div className="metrics-grid">
                  {comparativeAnalysis.metrics.map((metric, index) => (
                    <div key={index} className="comparison-card">
                      <div className="metric-header">
                        <h4>{metric.metric}</h4>
                        <span 
                          className="variance-badge"
                          style={{ color: getVarianceColor(metric.varianceType) }}
                        >
                          <i className={getVarianceIcon(metric.varianceType)}></i>
                          {formatPercentage(Math.abs(metric.variance))}
                        </span>
                      </div>
                      <div className="metric-comparison">
                        <div className="baseline-value">
                          <span>Baseline</span>
                          <strong>
                            {metric.unit === 'IDR' ? formatCurrency(metric.baseline) :
                             metric.unit === '%' ? formatPercentage(metric.baseline) :
                             formatNumber(metric.baseline) + ' ' + metric.unit}
                          </strong>
                        </div>
                        <div className="comparison-value">
                          <span>Current</span>
                          <strong>
                            {metric.unit === 'IDR' ? formatCurrency(metric.comparison) :
                             metric.unit === '%' ? formatPercentage(metric.comparison) :
                             formatNumber(metric.comparison) + ' ' + metric.unit}
                          </strong>
                        </div>
                      </div>
                      <div className="variance-bar">
                        <div 
                          className="variance-fill"
                          style={{ 
                            width: `${Math.min(Math.abs(metric.variance), 100)}%`,
                            backgroundColor: getVarianceColor(metric.varianceType)
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insights */}
              <div className="insights-section">
                <h3>Key Insights</h3>
                <div className="insights-list">
                  {comparativeAnalysis.insights.map((insight, index) => (
                    <div key={index} className="insight-card">
                      <div className="insight-icon">
                        <i className="fas fa-lightbulb"></i>
                      </div>
                      <p>{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="recommendations-section">
                <h3>Recommendations</h3>
                <div className="recommendations-list">
                  {comparativeAnalysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="recommendation-card">
                      <div className="recommendation-icon">
                        <i className="fas fa-arrow-right"></i>
                      </div>
                      <p>{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Export Analysis</h2>
              <button 
                className="btn-close"
                onClick={() => setShowExportModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="export-options">
                <h4>Select Export Format</h4>
                <div className="format-options">
                  <label className="format-option">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="pdf"
                      checked={exportFormat === 'pdf'}
                      onChange={(e) => setExportFormat(e.target.value as any)}
                    />
                    <div className="format-card">
                      <i className="fas fa-file-pdf"></i>
                      <span>PDF Report</span>
                    </div>
                  </label>
                  
                  <label className="format-option">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="excel"
                      checked={exportFormat === 'excel'}
                      onChange={(e) => setExportFormat(e.target.value as any)}
                    />
                    <div className="format-card">
                      <i className="fas fa-file-excel"></i>
                      <span>Excel Spreadsheet</span>
                    </div>
                  </label>
                  
                  <label className="format-option">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={(e) => setExportFormat(e.target.value as any)}
                    />
                    <div className="format-card">
                      <i className="fas fa-file-csv"></i>
                      <span>CSV Data</span>
                    </div>
                  </label>
                  
                  <label className="format-option">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="powerpoint"
                      checked={exportFormat === 'powerpoint'}
                      onChange={(e) => setExportFormat(e.target.value as any)}
                    />
                    <div className="format-card">
                      <i className="fas fa-file-powerpoint"></i>
                      <span>PowerPoint</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleExportAnalysis}
                disabled={statusHalaman.loading}
              >
                <i className="fas fa-download"></i>
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Analysis Modal */}
      {showCustomAnalysis && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Custom Analysis</h2>
              <button 
                className="btn-close"
                onClick={() => setShowCustomAnalysis(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="custom-analysis-form">
                <div className="form-group">
                  <label>Analysis Type</label>
                  <input
                    type="text"
                    value={customAnalysisType}
                    onChange={(e) => setCustomAnalysisType(e.target.value)}
                    placeholder="Enter custom analysis type..."
                  />
                </div>
                
                <div className="form-group">
                  <label>Period</label>
                  <select
                    value={analysisPeriod}
                    onChange={(e) => setAnalysisPeriod(e.target.value as any)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Date Range</label>
                  <div className="date-range">
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                    <span>to</span>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowCustomAnalysis(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={handleCustomAnalysis}
                disabled={statusHalaman.loading || !customAnalysisType.trim()}
              >
                <i className="fas fa-play"></i>
                Run Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalamanAnalitik;