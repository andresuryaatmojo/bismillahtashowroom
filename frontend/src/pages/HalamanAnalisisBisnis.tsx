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
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Users,
  ShoppingCart,
  DollarSign,
  Target,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Award,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Download,
  Filter,
  Brain,
  Globe,
  Zap,
  Heart,
  Star,
  ThumbsUp,
  TrendingUpIcon
} from 'lucide-react';

const HalamanAnalisisBisnis = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading: authLoading } = useAuth();

  const [state, setState] = useState({
    isLoading: false,
    error: null as string | null,
    activeTab: 'overview',
    selectedPeriod: 'month'
  });

  // Mock data untuk analisis trend
  const salesTrendData = [
    { month: 'Jan', sales: 45, growth: 8.2, prediction: 48, optimal: 50 },
    { month: 'Feb', sales: 52, growth: 15.6, prediction: 55, optimal: 55 },
    { month: 'Mar', sales: 48, growth: -7.7, prediction: 52, optimal: 52 },
    { month: 'Apr', sales: 61, growth: 27.1, prediction: 62, optimal: 60 },
    { month: 'Mei', sales: 55, growth: -9.8, prediction: 58, optimal: 58 },
    { month: 'Jun', sales: 72, growth: 30.9, prediction: 75, optimal: 70 }
  ];

  // Customer segmentation data
  const customerSegmentData = [
    { segment: 'Premium Buyers', value: 28, revenue: 12500000000, satisfaction: 4.8 },
    { segment: 'Regular Customers', value: 42, revenue: 8200000000, satisfaction: 4.2 },
    { segment: 'First-time Buyers', value: 22, revenue: 4800000000, satisfaction: 3.9 },
    { segment: 'Trade-in Customers', value: 8, revenue: 2100000000, satisfaction: 4.5 }
  ];

  // Competitive analysis
  const competitiveData = [
    { metric: 'Harga', us: 85, competitor: 75 },
    { metric: 'Kualitas', us: 90, competitor: 85 },
    { metric: 'Layanan', us: 95, competitor: 80 },
    { metric: 'Inovasi', us: 88, competitor: 92 },
    { metric: 'Brand', us: 82, competitor: 88 },
    { metric: 'Pengalaman', us: 93, competitor: 78 }
  ];

  // Business health indicators
  const healthIndicators = [
    {
      category: 'Revenue Health',
      score: 85,
      status: 'healthy',
      trend: 'up',
      indicators: [
        { name: 'Revenue Growth', value: '+15.2%', status: 'good' },
        { name: 'Profit Margin', value: '15.8%', status: 'good' },
        { name: 'Cash Flow', value: 'Positif', status: 'good' }
      ]
    },
    {
      category: 'Customer Health',
      score: 78,
      status: 'moderate',
      trend: 'up',
      indicators: [
        { name: 'Retention Rate', value: '82%', status: 'good' },
        { name: 'Churn Rate', value: '18%', status: 'warning' },
        { name: 'NPS Score', value: '65', status: 'good' }
      ]
    },
    {
      category: 'Operational Health',
      score: 92,
      status: 'healthy',
      trend: 'stable',
      indicators: [
        { name: 'Efficiency', value: '94%', status: 'good' },
        { name: 'Inventory Turnover', value: '8.2x', status: 'good' },
        { name: 'Lead Time', value: '12 hari', status: 'good' }
      ]
    },
    {
      category: 'Market Position',
      score: 72,
      status: 'moderate',
      trend: 'up',
      indicators: [
        { name: 'Market Share', value: '15.2%', status: 'good' },
        { name: 'Brand Awareness', value: '68%', status: 'warning' },
        { name: 'Competitive Index', value: '7.8/10', status: 'good' }
      ]
    }
  ];

  // Strategic insights
  const insights = [
    {
      type: 'opportunity',
      priority: 'high',
      title: 'Potensi Pertumbuhan Segmen Premium',
      description: 'Segmen premium menunjukkan pertumbuhan 32% dengan margin tertinggi. Rekomendasikan peningkatan inventori kendaraan premium.',
      impact: '+Rp 2.1M revenue potensial',
      icon: TrendingUp,
      color: 'green'
    },
    {
      type: 'warning',
      priority: 'medium',
      title: 'Penurunan Conversion Rate Regional Bandung',
      description: 'Conversion rate di Bandung turun 8.2% bulan ini. Perlu evaluasi strategi marketing dan kualitas leads.',
      impact: '-Rp 850jt revenue loss',
      icon: AlertTriangle,
      color: 'yellow'
    },
    {
      type: 'insight',
      priority: 'medium',
      title: 'Pola Pembelian Berubah ke SUV',
      description: 'Tren pembelian SUV naik 42% YoY. Pertimbangkan realokasi inventori dan campaign targeting.',
      impact: 'Strategic shift recommended',
      icon: Lightbulb,
      color: 'blue'
    },
    {
      type: 'success',
      priority: 'low',
      title: 'Customer Satisfaction Meningkat',
      description: 'NPS score naik dari 58 ke 65 dalam 3 bulan terakhir. Inisiatif customer service berjalan efektif.',
      impact: '+12% retention improvement',
      icon: ThumbsUp,
      color: 'green'
    }
  ];

  // Customer behavior patterns
  const customerBehaviorData = [
    { hour: '09:00', visits: 12, conversions: 2, engagement: 65 },
    { hour: '10:00', visits: 28, conversions: 5, engagement: 72 },
    { hour: '11:00', visits: 45, conversions: 9, engagement: 78 },
    { hour: '12:00', visits: 38, conversions: 6, engagement: 68 },
    { hour: '13:00', visits: 22, conversions: 3, engagement: 62 },
    { hour: '14:00', visits: 35, conversions: 8, engagement: 75 },
    { hour: '15:00', visits: 52, conversions: 12, engagement: 82 },
    { hour: '16:00', visits: 48, conversions: 11, engagement: 80 },
    { hour: '17:00', visits: 42, conversions: 8, engagement: 74 }
  ];

  // Revenue breakdown analysis
  const revenueBreakdown = [
    { source: 'Penjualan Baru', amount: 18500000000, percentage: 62, growth: 12.5 },
    { source: 'Trade-in', amount: 4200000000, percentage: 14, growth: 8.3 },
    { source: 'After Sales', amount: 3800000000, percentage: 13, growth: 15.7 },
    { source: 'Accessories', amount: 2100000000, percentage: 7, growth: 22.1 },
    { source: 'Lainnya', amount: 1200000000, percentage: 4, growth: 5.2 }
  ];

  useEffect(() => {
    if (user && user.role === 'owner') {
      loadAnalyticsData();
    }
  }, [user]);

  const loadAnalyticsData = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulasi loading data analisis
      await new Promise(resolve => setTimeout(resolve, 800));

      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Gagal memuat data analisis',
        isLoading: false
      }));
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

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsightIcon = (insight: any) => {
    const Icon = insight.icon;
    return <Icon className={`h-5 w-5 text-${insight.color}-600`} />;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
        <p className="text-gray-600">Memverifikasi akses...</p>
      </div>
    );
  }

  if (!user || user.role !== 'owner') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
          <p className="text-gray-600">Anda tidak memiliki akses ke halaman ini</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Brain className="h-8 w-8 text-blue-600" />
              Analisis Bisnis
            </h1>
            <p className="text-gray-600 mt-1">Overview performa bisnis dan insight strategis</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={loadAnalyticsData}
              disabled={state.isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${state.isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={state.activeTab} onValueChange={(value) => setState(prev => ({ ...prev, activeTab: value }))}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="customer">Customer Analytics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
            <TabsTrigger value="competitive">Competitive</TabsTrigger>
            <TabsTrigger value="insights">Strategic Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Business Health Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Business Health Score
                </CardTitle>
                <CardDescription>
                  Indikator kesehatan bisnis secara keseluruhan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {healthIndicators.map((indicator, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getHealthBgColor(indicator.score)}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-sm">{indicator.category}</h4>
                        <Badge variant={indicator.status === 'healthy' ? 'default' : 'secondary'}>
                          {indicator.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                        </Badge>
                      </div>
                      <div className={`text-3xl font-bold mb-2 ${getHealthColor(indicator.score)}`}>
                        {indicator.score}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div
                          className={`h-2 rounded-full ${
                            indicator.score >= 80 ? 'bg-green-600' :
                            indicator.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${indicator.score}%` }}
                        />
                      </div>
                      <div className="space-y-1">
                        {indicator.indicators.map((ind, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-gray-600">{ind.name}</span>
                            <span className="font-medium">{ind.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sales Trend with Prediction */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Trend Penjualan & Prediksi
                  </CardTitle>
                  <CardDescription>
                    Analisis trend dengan prediksi AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={salesTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="optimal"
                        fill="#e0e7ff"
                        stroke="#6366f1"
                        fillOpacity={0.3}
                        name="Optimal Range"
                      />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Actual Sales"
                      />
                      <Line
                        type="monotone"
                        dataKey="prediction"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Prediction"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Competitive Position */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Posisi Kompetitif
                  </CardTitle>
                  <CardDescription>
                    Perbandingan dengan kompetitor utama
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={competitiveData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="Kami"
                        dataKey="us"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                      />
                      <Radar
                        name="Kompetitor"
                        dataKey="competitor"
                        stroke="#ef4444"
                        fill="#ef4444"
                        fillOpacity={0.3}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Customer Analytics Tab */}
          <TabsContent value="customer" className="space-y-6">
            {/* Customer Segmentation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Segmentasi Customer
                  </CardTitle>
                  <CardDescription>
                    Distribusi dan performa per segmen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={customerSegmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ segment, value }: any) => `${segment}: ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {customerSegmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Customer Behavior Patterns */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Pola Aktivitas Customer
                  </CardTitle>
                  <CardDescription>
                    Pola kunjungan dan konversi per jam
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={customerBehaviorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="visits" fill="#3b82f6" name="Kunjungan" />
                      <Line
                        type="monotone"
                        dataKey="conversions"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Konversi"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Customer Segment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detail Segmen Customer</CardTitle>
                <CardDescription>
                  Analisis mendalam per segmen customer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerSegmentData.map((segment, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{segment.segment}</h4>
                          <p className="text-sm text-gray-600">{segment.value}% dari total customer</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{segment.satisfaction}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-600">Revenue Contribution</p>
                          <p className="font-semibold">{formatCurrency(segment.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Avg. Transaction Value</p>
                          <p className="font-semibold">{formatCurrency(segment.revenue / (segment.value * 10))}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Satisfaction Score</p>
                          <p className="font-semibold">{segment.satisfaction}/5.0</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Analysis Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Breakdown Revenue Stream
                </CardTitle>
                <CardDescription>
                  Analisis sumber revenue dan pertumbuhan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueBreakdown.map((item, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{item.source}</h4>
                        <Badge variant={item.growth > 10 ? 'default' : 'secondary'}>
                          {item.growth > 0 ? '+' : ''}{item.growth}%
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl font-bold">{formatCurrency(item.amount)}</span>
                        <span className="text-gray-600">{item.percentage}% dari total</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Trend Revenue Bulanan</CardTitle>
                <CardDescription>Analisis pertumbuhan revenue per bulan</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={salesTrendData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorSales)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competitive Tab */}
          <TabsContent value="competitive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Analisis Kompetitif
                </CardTitle>
                <CardDescription>
                  Posisi kami vs kompetitor utama di berbagai metrik
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {competitiveData.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{item.metric}</span>
                        <div className="flex gap-4 text-sm">
                          <span className="text-blue-600">Kami: {item.us}%</span>
                          <span className="text-red-600">Kompetitor: {item.competitor}%</span>
                        </div>
                      </div>
                      <div className="relative w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-blue-500 opacity-60"
                          style={{ width: `${item.us}%` }}
                        />
                        <div
                          className="absolute top-0 left-0 h-full bg-red-500 opacity-30"
                          style={{ width: `${item.competitor}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Market Position Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Posisi Pasar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium">Strengths</h4>
                    </div>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Layanan pelanggan terbaik</li>
                      <li>• Pengalaman showroom superior</li>
                      <li>• Kualitas produk tinggi</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <h4 className="font-medium">Opportunities</h4>
                    </div>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Ekspansi ke kendaraan elektrik</li>
                      <li>• Digital marketing enhancement</li>
                      <li>• Partnership strategis</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <h4 className="font-medium">Threats</h4>
                    </div>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Kompetitor dengan harga lebih rendah</li>
                      <li>• Brand awareness perlu ditingkatkan</li>
                      <li>• Disrupsi teknologi</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Strategic Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Strategic Insights & Recommendations
                </CardTitle>
                <CardDescription>
                  Insight berbasis AI dan rekomendasi strategis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${
                          insight.color === 'green' ? 'bg-green-100' :
                          insight.color === 'yellow' ? 'bg-yellow-100' :
                          insight.color === 'red' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          {getInsightIcon(insight)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg">{insight.title}</h4>
                            <Badge className={getPriorityColor(insight.priority)}>
                              {insight.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-gray-700 mb-2">{insight.description}</p>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600">
                              Impact: {insight.impact}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Recommended Actions
                </CardTitle>
                <CardDescription>
                  Langkah strategis yang disarankan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    'Tingkatkan inventori kendaraan premium (+32% demand)',
                    'Review dan optimasi strategi marketing di regional Bandung',
                    'Realokasi budget marketing ke kategori SUV',
                    'Implementasi customer retention program untuk segment churn tinggi',
                    'Ekspansi layanan after-sales untuk meningkatkan revenue stream',
                    'Evaluasi pricing strategy untuk kompetitif dengan market'
                  ].map((action, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-gray-800">{action}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HalamanAnalisisBisnis;
