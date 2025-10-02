import React, { useState, useEffect } from 'react';
import './DashboardEksekutif.css';

// Interface untuk data KPI
interface DataKPI {
  id: string;
  name: string;
  category: 'sales' | 'operational' | 'financial' | 'customer' | 'strategic';
  currentValue: number;
  targetValue: number;
  previousValue: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  lastUpdated: string;
  description: string;
  chartData: ChartDataPoint[];
}

// Interface untuk data chart
interface ChartDataPoint {
  date: string;
  value: number;
  target?: number;
}

// Interface untuk laporan cepat
interface QuickReport {
  id: string;
  title: string;
  type: 'sales' | 'financial' | 'operational' | 'strategic';
  summary: string;
  keyMetrics: KeyMetric[];
  insights: string[];
  recommendations: string[];
  generatedAt: string;
  period: string;
}

// Interface untuk metrik kunci
interface KeyMetric {
  name: string;
  value: string;
  change: number;
  status: 'positive' | 'negative' | 'neutral';
}

// Interface untuk menu strategis
interface MenuStrategis {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  category: 'planning' | 'analysis' | 'monitoring' | 'reporting';
  priority: 'high' | 'medium' | 'low';
  lastAccessed?: string;
}

// Interface untuk status halaman
interface StatusHalaman {
  loading: boolean;
  error: string | null;
  success: string | null;
}

const DashboardEksekutif: React.FC = () => {
  // State management
  const [dataKPI, setDataKPI] = useState<DataKPI[]>([]);
  const [quickReports, setQuickReports] = useState<QuickReport[]>([]);
  const [menuStrategis, setMenuStrategis] = useState<MenuStrategis[]>([]);
  const [statusHalaman, setStatusHalaman] = useState<StatusHalaman>({
    loading: false,
    error: null,
    success: null
  });
  
  const [selectedKPI, setSelectedKPI] = useState<DataKPI | null>(null);
  const [showKPIDetail, setShowKPIDetail] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showStrategisModal, setShowStrategisModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<QuickReport | null>(null);
  const [reportType, setReportType] = useState<'sales' | 'financial' | 'operational' | 'strategic'>('sales');
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('monthly');
  
  const [activeTab, setActiveTab] = useState<'overview' | 'kpi' | 'reports' | 'strategic'>('overview');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Method: aksesDashboardEksekutif
  const aksesDashboardEksekutif = async () => {
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      // Simulasi delay loading
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock data
      const mockKPI = generateMockKPI();
      const mockReports = generateMockReports();
      const mockMenuStrategis = generateMockMenuStrategis();
      
      setDataKPI(mockKPI);
      setQuickReports(mockReports);
      setMenuStrategis(mockMenuStrategis);
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Dashboard eksekutif berhasil dimuat' 
      });
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal memuat dashboard eksekutif', 
        success: null 
      });
    }
  };

  // Method: pilihMonitorKPIDetail
  const pilihMonitorKPIDetail = (kpiId?: string) => {
    if (kpiId) {
      const kpi = dataKPI.find(item => item.id === kpiId);
      if (kpi) {
        setSelectedKPI(kpi);
        setShowKPIDetail(true);
      }
    } else {
      // Show all KPI monitoring
      setActiveTab('kpi');
    }
  };

  // Method: aksesMenuStrategis
  const aksesMenuStrategis = () => {
    setShowStrategisModal(true);
  };

  // Method: generateQuickReport
  const generateQuickReport = async () => {
    setStatusHalaman({ loading: true, error: null, success: null });
    
    try {
      // Simulasi delay generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newReport = generateSingleReport(reportType, reportPeriod);
      setQuickReports(prev => [newReport, ...prev]);
      setSelectedReport(newReport);
      setShowReportModal(true);
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Laporan cepat berhasil dibuat' 
      });
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal membuat laporan cepat', 
        success: null 
      });
    }
  };

  // Method: logout
  const logout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari dashboard eksekutif?')) {
      // Clear session data
      localStorage.removeItem('executiveSession');
      sessionStorage.clear();
      
      // Redirect to login
      window.location.href = '/login';
    }
  };

  // Helper functions
  const generateMockKPI = (): DataKPI[] => {
    const kpiTemplates = [
      {
        name: 'Total Revenue',
        category: 'financial' as const,
        unit: 'IDR',
        description: 'Total pendapatan dari penjualan kendaraan'
      },
      {
        name: 'Sales Volume',
        category: 'sales' as const,
        unit: 'units',
        description: 'Jumlah unit kendaraan yang terjual'
      },
      {
        name: 'Customer Satisfaction',
        category: 'customer' as const,
        unit: '%',
        description: 'Tingkat kepuasan pelanggan berdasarkan survey'
      },
      {
        name: 'Market Share',
        category: 'strategic' as const,
        unit: '%',
        description: 'Pangsa pasar dalam industri otomotif'
      },
      {
        name: 'Operational Efficiency',
        category: 'operational' as const,
        unit: '%',
        description: 'Efisiensi operasional showroom'
      },
      {
        name: 'Lead Conversion Rate',
        category: 'sales' as const,
        unit: '%',
        description: 'Tingkat konversi lead menjadi penjualan'
      },
      {
        name: 'Profit Margin',
        category: 'financial' as const,
        unit: '%',
        description: 'Margin keuntungan dari penjualan'
      },
      {
        name: 'Service Quality Score',
        category: 'operational' as const,
        unit: 'score',
        description: 'Skor kualitas layanan purna jual'
      }
    ];
    
    return kpiTemplates.map((template, index) => {
      const currentValue = Math.random() * 1000000 + 100000;
      const targetValue = currentValue * (1 + Math.random() * 0.3);
      const previousValue = currentValue * (0.8 + Math.random() * 0.4);
      const trendPercentage = ((currentValue - previousValue) / previousValue) * 100;
      
      // Generate chart data
      const chartData: ChartDataPoint[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const baseValue = currentValue * (0.8 + Math.random() * 0.4);
        chartData.push({
          date: date.toISOString().split('T')[0],
          value: baseValue,
          target: targetValue
        });
      }
      
      return {
        id: `kpi-${index + 1}`,
        name: template.name,
        category: template.category,
        currentValue,
        targetValue,
        previousValue,
        unit: template.unit,
        trend: trendPercentage > 5 ? 'up' : trendPercentage < -5 ? 'down' : 'stable',
        trendPercentage: Math.abs(trendPercentage),
        status: currentValue >= targetValue * 0.9 ? 'excellent' : 
                currentValue >= targetValue * 0.8 ? 'good' :
                currentValue >= targetValue * 0.7 ? 'warning' : 'critical',
        lastUpdated: new Date().toISOString(),
        description: template.description,
        chartData
      };
    });
  };

  const generateMockReports = (): QuickReport[] => {
    const reportTemplates = [
      {
        title: 'Monthly Sales Performance',
        type: 'sales' as const,
        summary: 'Analisis performa penjualan bulan ini menunjukkan tren positif dengan peningkatan 15% dibanding bulan sebelumnya.',
        period: 'November 2024'
      },
      {
        title: 'Financial Health Check',
        type: 'financial' as const,
        summary: 'Kondisi keuangan perusahaan dalam keadaan sehat dengan cash flow positif dan margin keuntungan yang stabil.',
        period: 'Q4 2024'
      },
      {
        title: 'Operational Efficiency Report',
        type: 'operational' as const,
        summary: 'Efisiensi operasional meningkat 8% dengan optimalisasi proses dan penggunaan teknologi baru.',
        period: 'November 2024'
      }
    ];
    
    return reportTemplates.map((template, index) => ({
      id: `report-${index + 1}`,
      title: template.title,
      type: template.type,
      summary: template.summary,
      keyMetrics: [
        {
          name: 'Revenue Growth',
          value: `${(Math.random() * 20 + 5).toFixed(1)}%`,
          change: Math.random() * 10 + 2,
          status: 'positive' as const
        },
        {
          name: 'Cost Efficiency',
          value: `${(Math.random() * 15 + 85).toFixed(1)}%`,
          change: Math.random() * 5 + 1,
          status: 'positive' as const
        },
        {
          name: 'Customer Retention',
          value: `${(Math.random() * 10 + 88).toFixed(1)}%`,
          change: Math.random() * 3 + 0.5,
          status: 'positive' as const
        }
      ],
      insights: [
        'Penjualan kendaraan SUV mengalami peningkatan signifikan',
        'Program promosi akhir tahun memberikan dampak positif',
        'Kepuasan pelanggan meningkat berkat layanan after-sales yang lebih baik'
      ],
      recommendations: [
        'Tingkatkan stok kendaraan SUV untuk memenuhi demand',
        'Lanjutkan program promosi dengan target yang lebih spesifik',
        'Investasi lebih lanjut dalam pelatihan tim customer service'
      ],
      generatedAt: new Date().toISOString(),
      period: template.period
    }));
  };

  const generateMockMenuStrategis = (): MenuStrategis[] => {
    return [
      {
        id: 'strategic-1',
        title: 'Business Planning',
        description: 'Perencanaan strategis bisnis jangka pendek dan panjang',
        icon: 'fas fa-chart-line',
        url: '/strategic/planning',
        category: 'planning',
        priority: 'high',
        lastAccessed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'strategic-2',
        title: 'Market Analysis',
        description: 'Analisis pasar dan kompetitor dalam industri otomotif',
        icon: 'fas fa-search-dollar',
        url: '/strategic/market-analysis',
        category: 'analysis',
        priority: 'high'
      },
      {
        id: 'strategic-3',
        title: 'Performance Monitoring',
        description: 'Monitoring performa bisnis secara real-time',
        icon: 'fas fa-tachometer-alt',
        url: '/strategic/monitoring',
        category: 'monitoring',
        priority: 'medium'
      },
      {
        id: 'strategic-4',
        title: 'Strategic Reporting',
        description: 'Laporan strategis untuk stakeholder dan investor',
        icon: 'fas fa-file-alt',
        url: '/strategic/reporting',
        category: 'reporting',
        priority: 'medium'
      },
      {
        id: 'strategic-5',
        title: 'Risk Management',
        description: 'Manajemen risiko bisnis dan mitigasi',
        icon: 'fas fa-shield-alt',
        url: '/strategic/risk-management',
        category: 'analysis',
        priority: 'high'
      },
      {
        id: 'strategic-6',
        title: 'Investment Planning',
        description: 'Perencanaan investasi dan alokasi sumber daya',
        icon: 'fas fa-coins',
        url: '/strategic/investment',
        category: 'planning',
        priority: 'medium'
      }
    ];
  };

  const generateSingleReport = (type: string, period: string): QuickReport => {
    const reportTitles = {
      sales: 'Sales Performance Analysis',
      financial: 'Financial Performance Review',
      operational: 'Operational Efficiency Report',
      strategic: 'Strategic Business Review'
    };
    
    const reportSummaries = {
      sales: 'Analisis mendalam terhadap performa penjualan menunjukkan tren yang menggembirakan dengan berbagai peluang peningkatan.',
      financial: 'Review komprehensif kondisi keuangan perusahaan dengan fokus pada profitabilitas dan cash flow management.',
      operational: 'Evaluasi efisiensi operasional dengan identifikasi area improvement dan best practices.',
      strategic: 'Tinjauan strategis terhadap posisi bisnis dan roadmap pengembangan ke depan.'
    };
    
    return {
      id: `report-${Date.now()}`,
      title: reportTitles[type as keyof typeof reportTitles],
      type: type as 'sales' | 'financial' | 'operational' | 'strategic',
      summary: reportSummaries[type as keyof typeof reportSummaries],
      keyMetrics: [
        {
          name: 'Primary KPI',
          value: `${(Math.random() * 100 + 50).toFixed(1)}%`,
          change: Math.random() * 20 - 10,
          status: Math.random() > 0.3 ? 'positive' : 'negative'
        },
        {
          name: 'Secondary KPI',
          value: `${(Math.random() * 1000 + 500).toFixed(0)}M`,
          change: Math.random() * 15 - 5,
          status: Math.random() > 0.4 ? 'positive' : 'neutral'
        },
        {
          name: 'Tertiary KPI',
          value: `${(Math.random() * 50 + 75).toFixed(1)}%`,
          change: Math.random() * 10 - 3,
          status: Math.random() > 0.5 ? 'positive' : 'negative'
        }
      ],
      insights: [
        'Tren pasar menunjukkan peningkatan demand untuk kendaraan ramah lingkungan',
        'Digitalisasi proses penjualan memberikan efisiensi yang signifikan',
        'Program loyalitas pelanggan menunjukkan hasil yang positif'
      ],
      recommendations: [
        'Perluas portfolio kendaraan hybrid dan elektrik',
        'Investasi dalam teknologi CRM yang lebih advanced',
        'Tingkatkan program pelatihan untuk sales team'
      ],
      generatedAt: new Date().toISOString(),
      period: `${period.charAt(0).toUpperCase() + period.slice(1)} - ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`
    };
  };

  // Handler functions
  const handleKPIClick = (kpi: DataKPI) => {
    setSelectedKPI(kpi);
    setShowKPIDetail(true);
  };

  const handleReportClick = (report: QuickReport) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleStrategicMenuClick = (menu: MenuStrategis) => {
    // Update last accessed
    setMenuStrategis(prev => 
      prev.map(item => 
        item.id === menu.id 
          ? { ...item, lastAccessed: new Date().toISOString() }
          : item
      )
    );
    
    // Navigate to strategic menu
    window.open(menu.url, '_blank');
  };

  // Helper functions
  const formatValue = (value: number, unit: string) => {
    if (unit === 'IDR') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    } else if (unit === '%') {
      return `${value.toFixed(1)}%`;
    } else if (unit === 'units') {
      return new Intl.NumberFormat('id-ID').format(Math.round(value));
    } else {
      return `${value.toFixed(1)} ${unit}`;
    }
  };

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
      case 'excellent': return '#28a745';
      case 'good': return '#20c997';
      case 'warning': return '#ffc107';
      case 'critical': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return 'fas fa-arrow-up';
      case 'down': return 'fas fa-arrow-down';
      case 'stable': return 'fas fa-minus';
      default: return 'fas fa-minus';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#28a745';
      case 'down': return '#dc3545';
      case 'stable': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'sales': return 'fas fa-chart-bar';
      case 'financial': return 'fas fa-dollar-sign';
      case 'operational': return 'fas fa-cogs';
      case 'customer': return 'fas fa-users';
      case 'strategic': return 'fas fa-chess';
      default: return 'fas fa-chart-line';
    }
  };

  const getMetricStatusColor = (status: string) => {
    switch (status) {
      case 'positive': return '#28a745';
      case 'negative': return '#dc3545';
      case 'neutral': return '#6c757d';
      default: return '#6c757d';
    }
  };

  // Filter data
  const filteredKPI = dataKPI.filter(kpi => {
    const matchCategory = !filterCategory || kpi.category === filterCategory;
    const matchStatus = !filterStatus || kpi.status === filterStatus;
    return matchCategory && matchStatus;
  });

  // Calculate overview statistics
  const overviewStats = {
    totalKPI: dataKPI.length,
    excellentKPI: dataKPI.filter(kpi => kpi.status === 'excellent').length,
    criticalKPI: dataKPI.filter(kpi => kpi.status === 'critical').length,
    avgPerformance: dataKPI.length > 0 ? 
      (dataKPI.reduce((sum, kpi) => sum + (kpi.currentValue / kpi.targetValue), 0) / dataKPI.length * 100) : 0
  };

  // Effects
  useEffect(() => {
    aksesDashboardEksekutif();
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
    <div className="dashboard-eksekutif">
      <div className="header-section">
        <div className="header-content">
          <h1>Dashboard Eksekutif</h1>
          <p>Monitoring KPI dan analisis strategis untuk pengambilan keputusan bisnis</p>
        </div>
        <div className="header-actions">
          <button className="btn-strategic" onClick={aksesMenuStrategis}>
            <i className="fas fa-chess"></i>
            Menu Strategis
          </button>
          <button className="btn-report" onClick={() => setActiveTab('reports')}>
            <i className="fas fa-file-alt"></i>
            Quick Report
          </button>
          <button className="btn-logout" onClick={logout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
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
          <p>Memuat dashboard eksekutif...</p>
        </div>
      )}

      {!statusHalaman.loading && (
        <>
          {/* Navigation Tabs */}
          <div className="nav-tabs">
            <button 
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="fas fa-tachometer-alt"></i>
              Overview
            </button>
            <button 
              className={`tab-button ${activeTab === 'kpi' ? 'active' : ''}`}
              onClick={() => setActiveTab('kpi')}
            >
              <i className="fas fa-chart-line"></i>
              KPI Monitoring
            </button>
            <button 
              className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <i className="fas fa-file-alt"></i>
              Quick Reports
            </button>
            <button 
              className={`tab-button ${activeTab === 'strategic' ? 'active' : ''}`}
              onClick={() => setActiveTab('strategic')}
            >
              <i className="fas fa-chess"></i>
              Strategic Menu
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              {/* Overview Statistics */}
              <div className="overview-stats">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{overviewStats.totalKPI}</h3>
                    <p>Total KPI</p>
                  </div>
                </div>
                <div className="stat-card excellent">
                  <div className="stat-icon">
                    <i className="fas fa-trophy"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{overviewStats.excellentKPI}</h3>
                    <p>Excellent Performance</p>
                  </div>
                </div>
                <div className="stat-card critical">
                  <div className="stat-icon">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{overviewStats.criticalKPI}</h3>
                    <p>Critical KPI</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-percentage"></i>
                  </div>
                  <div className="stat-content">
                    <h3>{overviewStats.avgPerformance.toFixed(1)}%</h3>
                    <p>Avg Performance</p>
                  </div>
                </div>
              </div>

              {/* Key KPI Cards */}
              <div className="key-kpi-section">
                <h2>Key Performance Indicators</h2>
                <div className="kpi-grid">
                  {dataKPI.slice(0, 6).map(kpi => (
                    <div 
                      key={kpi.id} 
                      className="kpi-card"
                      onClick={() => handleKPIClick(kpi)}
                    >
                      <div className="kpi-header">
                        <div className="kpi-icon">
                          <i className={getCategoryIcon(kpi.category)}></i>
                        </div>
                        <div className="kpi-status">
                          <span 
                            className="status-indicator"
                            style={{ backgroundColor: getStatusColor(kpi.status) }}
                          ></span>
                        </div>
                      </div>
                      <div className="kpi-content">
                        <h4>{kpi.name}</h4>
                        <div className="kpi-value">
                          {formatValue(kpi.currentValue, kpi.unit)}
                        </div>
                        <div className="kpi-target">
                          Target: {formatValue(kpi.targetValue, kpi.unit)}
                        </div>
                        <div className="kpi-trend">
                          <i 
                            className={getTrendIcon(kpi.trend)}
                            style={{ color: getTrendColor(kpi.trend) }}
                          ></i>
                          <span style={{ color: getTrendColor(kpi.trend) }}>
                            {kpi.trendPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Reports */}
              <div className="recent-reports-section">
                <h2>Recent Reports</h2>
                <div className="reports-list">
                  {quickReports.slice(0, 3).map(report => (
                    <div 
                      key={report.id} 
                      className="report-card"
                      onClick={() => handleReportClick(report)}
                    >
                      <div className="report-header">
                        <h4>{report.title}</h4>
                        <span className="report-type">{report.type}</span>
                      </div>
                      <p>{report.summary}</p>
                      <div className="report-meta">
                        <span>{report.period}</span>
                        <span>{formatDate(report.generatedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* KPI Monitoring Tab */}
          {activeTab === 'kpi' && (
            <div className="tab-content">
              <div className="kpi-controls">
                <div className="filter-section">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="">Semua Kategori</option>
                    <option value="sales">Sales</option>
                    <option value="financial">Financial</option>
                    <option value="operational">Operational</option>
                    <option value="customer">Customer</option>
                    <option value="strategic">Strategic</option>
                  </select>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">Semua Status</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                
                <button 
                  className="btn-primary"
                  onClick={() => pilihMonitorKPIDetail()}
                >
                  <i className="fas fa-eye"></i>
                  Monitor All KPI
                </button>
              </div>

              <div className="kpi-detailed-grid">
                {filteredKPI.map(kpi => (
                  <div 
                    key={kpi.id} 
                    className="kpi-detailed-card"
                    onClick={() => handleKPIClick(kpi)}
                  >
                    <div className="kpi-card-header">
                      <div className="kpi-info">
                        <h4>{kpi.name}</h4>
                        <p>{kpi.description}</p>
                      </div>
                      <div className="kpi-status-badge">
                        <span 
                          className={`status-badge ${kpi.status}`}
                          style={{ backgroundColor: getStatusColor(kpi.status) }}
                        >
                          {kpi.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="kpi-metrics">
                      <div className="metric-item">
                        <span>Current</span>
                        <strong>{formatValue(kpi.currentValue, kpi.unit)}</strong>
                      </div>
                      <div className="metric-item">
                        <span>Target</span>
                        <strong>{formatValue(kpi.targetValue, kpi.unit)}</strong>
                      </div>
                      <div className="metric-item">
                        <span>Previous</span>
                        <strong>{formatValue(kpi.previousValue, kpi.unit)}</strong>
                      </div>
                    </div>
                    
                    <div className="kpi-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${Math.min((kpi.currentValue / kpi.targetValue) * 100, 100)}%`,
                            backgroundColor: getStatusColor(kpi.status)
                          }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {((kpi.currentValue / kpi.targetValue) * 100).toFixed(1)}% of target
                      </span>
                    </div>
                    
                    <div className="kpi-trend-info">
                      <i 
                        className={getTrendIcon(kpi.trend)}
                        style={{ color: getTrendColor(kpi.trend) }}
                      ></i>
                      <span style={{ color: getTrendColor(kpi.trend) }}>
                        {kpi.trendPercentage.toFixed(1)}% vs previous period
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Reports Tab */}
          {activeTab === 'reports' && (
            <div className="tab-content">
              <div className="reports-controls">
                <div className="report-generator">
                  <h3>Generate Quick Report</h3>
                  <div className="generator-form">
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value as any)}
                    >
                      <option value="sales">Sales Performance</option>
                      <option value="financial">Financial Performance</option>
                      <option value="operational">Operational Efficiency</option>
                      <option value="strategic">Strategic Review</option>
                    </select>
                    
                    <select
                      value={reportPeriod}
                      onChange={(e) => setReportPeriod(e.target.value as any)}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                    
                    <button 
                      className="btn-primary"
                      onClick={generateQuickReport}
                      disabled={statusHalaman.loading}
                    >
                      <i className="fas fa-magic"></i>
                      Generate Report
                    </button>
                  </div>
                </div>
              </div>

              <div className="reports-grid">
                {quickReports.map(report => (
                  <div 
                    key={report.id} 
                    className="report-detailed-card"
                    onClick={() => handleReportClick(report)}
                  >
                    <div className="report-card-header">
                      <h4>{report.title}</h4>
                      <span className={`report-type-badge ${report.type}`}>
                        {report.type}
                      </span>
                    </div>
                    
                    <div className="report-summary">
                      <p>{report.summary}</p>
                    </div>
                    
                    <div className="report-metrics">
                      {report.keyMetrics.slice(0, 2).map((metric, index) => (
                        <div key={index} className="report-metric">
                          <span className="metric-name">{metric.name}</span>
                          <div className="metric-value">
                            <strong>{metric.value}</strong>
                            <span 
                              className="metric-change"
                              style={{ color: getMetricStatusColor(metric.status) }}
                            >
                              {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="report-meta">
                      <span>{report.period}</span>
                      <span>{formatDate(report.generatedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strategic Menu Tab */}
          {activeTab === 'strategic' && (
            <div className="tab-content">
              <div className="strategic-menu-grid">
                {menuStrategis.map(menu => (
                  <div 
                    key={menu.id} 
                    className="strategic-menu-card"
                    onClick={() => handleStrategicMenuClick(menu)}
                  >
                    <div className="menu-icon">
                      <i className={menu.icon}></i>
                    </div>
                    <div className="menu-content">
                      <h4>{menu.title}</h4>
                      <p>{menu.description}</p>
                      <div className="menu-meta">
                        <span className={`priority-badge ${menu.priority}`}>
                          {menu.priority} priority
                        </span>
                        {menu.lastAccessed && (
                          <span className="last-accessed">
                            Last: {formatDate(menu.lastAccessed)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* KPI Detail Modal */}
      {showKPIDetail && selectedKPI && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>KPI Detail: {selectedKPI.name}</h2>
              <button 
                className="btn-close"
                onClick={() => setShowKPIDetail(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="kpi-detail-content">
                <div className="kpi-overview">
                  <div className="kpi-main-metrics">
                    <div className="main-metric">
                      <span>Current Value</span>
                      <h3>{formatValue(selectedKPI.currentValue, selectedKPI.unit)}</h3>
                    </div>
                    <div className="main-metric">
                      <span>Target Value</span>
                      <h3>{formatValue(selectedKPI.targetValue, selectedKPI.unit)}</h3>
                    </div>
                    <div className="main-metric">
                      <span>Achievement</span>
                      <h3>{((selectedKPI.currentValue / selectedKPI.targetValue) * 100).toFixed(1)}%</h3>
                    </div>
                  </div>
                  
                  <div className="kpi-status-info">
                    <div className="status-item">
                      <span>Status:</span>
                      <span 
                        className={`status-badge ${selectedKPI.status}`}
                        style={{ backgroundColor: getStatusColor(selectedKPI.status) }}
                      >
                        {selectedKPI.status}
                      </span>
                    </div>
                    <div className="status-item">
                      <span>Trend:</span>
                      <span style={{ color: getTrendColor(selectedKPI.trend) }}>
                        <i className={getTrendIcon(selectedKPI.trend)}></i>
                        {selectedKPI.trendPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="status-item">
                      <span>Category:</span>
                      <span>{selectedKPI.category}</span>
                    </div>
                    <div className="status-item">
                      <span>Last Updated:</span>
                      <span>{formatDate(selectedKPI.lastUpdated)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="kpi-description">
                  <h4>Description</h4>
                  <p>{selectedKPI.description}</p>
                </div>
                
                <div className="kpi-chart-section">
                  <h4>Performance Trend (Last 30 Days)</h4>
                  <div className="chart-placeholder">
                    <p>Chart visualization would be displayed here</p>
                    <div className="chart-data-preview">
                      {selectedKPI.chartData.slice(-7).map((point, index) => (
                        <div key={index} className="data-point">
                          <span>{new Date(point.date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}</span>
                          <span>{formatValue(point.value, selectedKPI.unit)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowKPIDetail(false)}
              >
                Close
              </button>
              <button className="btn-primary">
                <i className="fas fa-download"></i>
                Export Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      {showReportModal && selectedReport && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>{selectedReport.title}</h2>
              <button 
                className="btn-close"
                onClick={() => setShowReportModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="report-detail-content">
                <div className="report-summary-section">
                  <h4>Executive Summary</h4>
                  <p>{selectedReport.summary}</p>
                </div>
                
                <div className="report-metrics-section">
                  <h4>Key Metrics</h4>
                  <div className="metrics-grid">
                    {selectedReport.keyMetrics.map((metric, index) => (
                      <div key={index} className="metric-card">
                        <h5>{metric.name}</h5>
                        <div className="metric-value-large">
                          {metric.value}
                        </div>
                        <div 
                          className="metric-change-large"
                          style={{ color: getMetricStatusColor(metric.status) }}
                        >
                          {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="report-insights-section">
                  <h4>Key Insights</h4>
                  <ul>
                    {selectedReport.insights.map((insight, index) => (
                      <li key={index}>{insight}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="report-recommendations-section">
                  <h4>Recommendations</h4>
                  <ul>
                    {selectedReport.recommendations.map((recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="report-meta-section">
                  <div className="meta-grid">
                    <div className="meta-item">
                      <span>Report Type:</span>
                      <strong>{selectedReport.type}</strong>
                    </div>
                    <div className="meta-item">
                      <span>Period:</span>
                      <strong>{selectedReport.period}</strong>
                    </div>
                    <div className="meta-item">
                      <span>Generated:</span>
                      <strong>{formatDate(selectedReport.generatedAt)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowReportModal(false)}
              >
                Close
              </button>
              <button className="btn-primary">
                <i className="fas fa-download"></i>
                Download PDF
              </button>
              <button className="btn-primary">
                <i className="fas fa-share"></i>
                Share Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strategic Menu Modal */}
      {showStrategisModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Menu Strategis</h2>
              <button 
                className="btn-close"
                onClick={() => setShowStrategisModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="strategic-modal-grid">
                {menuStrategis.map(menu => (
                  <div 
                    key={menu.id} 
                    className="strategic-modal-card"
                    onClick={() => {
                      handleStrategicMenuClick(menu);
                      setShowStrategisModal(false);
                    }}
                  >
                    <div className="modal-menu-icon">
                      <i className={menu.icon}></i>
                    </div>
                    <div className="modal-menu-content">
                      <h5>{menu.title}</h5>
                      <p>{menu.description}</p>
                      <span className={`priority-badge ${menu.priority}`}>
                        {menu.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setShowStrategisModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardEksekutif;