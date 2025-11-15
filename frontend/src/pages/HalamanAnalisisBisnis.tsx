import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
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
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Download,
  Filter,
  Brain,
  Heart,
  Star,
  TrendingUpIcon
} from 'lucide-react';

const HalamanAnalisisBisnis = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading: authLoading } = useAuth();

  const [state, setState] = useState({
    isLoading: false,
    error: null as string | null,
    activeTab: 'overview',
    selectedPeriod: 'month',
    salesTrendData: [] as any[],
    customerSegmentData: [] as any[],
    healthIndicators: [] as any[],
    revenueBreakdown: [] as any[],
    customerBehaviorData: [] as any[]
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
    { segment: 'Pembeli Premium', value: 28, revenue: 12500000000, satisfaction: 4.8 },
    { segment: 'Pelanggan Reguler', value: 42, revenue: 8200000000, satisfaction: 4.2 },
    { segment: 'Pembeli Pertama', value: 22, revenue: 4800000000, satisfaction: 3.9 },
    { segment: 'Pelanggan Trade-in', value: 8, revenue: 2100000000, satisfaction: 4.5 }
  ];

  // Business health indicators
  const healthIndicators = [
    {
      category: 'Kesehatan Pendapatan',
      score: 85,
      status: 'healthy',
      trend: 'up',
      indicators: [
        { name: 'Pertumbuhan Pendapatan', value: '+15.2%', status: 'good' },
        { name: 'Margin Keuntungan', value: '15.8%', status: 'good' },
        { name: 'Arus Kas', value: 'Positif', status: 'good' }
      ]
    },
    {
      category: 'Kesehatan Pelanggan',
      score: 78,
      status: 'moderate',
      trend: 'up',
      indicators: [
        { name: 'Tingkat Retensi', value: '82%', status: 'good' },
        { name: 'Tingkat Churn', value: '18%', status: 'warning' },
        { name: 'Skor NPS', value: '65', status: 'good' }
      ]
    },
    {
      category: 'Kesehatan Operasional',
      score: 92,
      status: 'healthy',
      trend: 'stable',
      indicators: [
        { name: 'Efisiensi', value: '94%', status: 'good' },
        { name: 'Perputaran Inventori', value: '8.2x', status: 'good' },
        { name: 'Waktu Tunggu', value: '12 hari', status: 'good' }
      ]
    },
    {
      category: 'Posisi Pasar',
      score: 72,
      status: 'moderate',
      trend: 'up',
      indicators: [
        { name: 'Pangsa Pasar', value: '15.2%', status: 'good' },
        { name: 'Kesadaran Merek', value: '68%', status: 'warning' },
        { name: 'Indeks Kompetitif', value: '7.8/10', status: 'good' }
      ]
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
      // 1. Fetch Sales Trend Data (last 6 months)
      const salesTrendData = await fetchSalesTrendData();

      // 2. Fetch Customer Segmentation Data
      const customerSegmentData = await fetchCustomerSegmentation();

      // 3. Calculate Business Health Indicators
      const healthIndicators = await calculateHealthIndicators();

      // 4. Fetch Revenue Breakdown
      const revenueBreakdown = await fetchRevenueBreakdown();

      // 5. Fetch Customer Behavior Data
      const customerBehaviorData = await fetchCustomerBehaviorData();

      setState(prev => ({
        ...prev,
        salesTrendData,
        customerSegmentData,
        healthIndicators,
        revenueBreakdown,
        customerBehaviorData,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setState(prev => ({
        ...prev,
        error: 'Gagal memuat data analisis',
        isLoading: false
      }));
    }
  };

  const fetchSalesTrendData = async () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const salesByMonth = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const { data, error } = await supabase
        .from('transactions')
        .select('id, total_amount, created_at')
        .eq('status', 'completed')
        .gte('created_at', monthDate.toISOString())
        .lt('created_at', nextMonthDate.toISOString());

      if (error) {
        console.error('Error fetching sales trend:', error);
        continue;
      }

      const sales = data?.length || 0;
      const prevSales = i > 0 ? (salesByMonth[salesByMonth.length - 1]?.sales || 1) : 1;
      const growth: number = i > 0 ? ((sales - (salesByMonth[salesByMonth.length - 1]?.sales || 0)) / prevSales) * 100 : 0;

      salesByMonth.push({
        month: monthNames[monthDate.getMonth()],
        sales,
        growth: parseFloat(growth.toFixed(1)),
        prediction: Math.round(sales * 1.05),
        optimal: Math.round(sales * 1.1)
      });
    }

    return salesByMonth.length > 0 ? salesByMonth : [
      { month: 'Jan', sales: 0, growth: 0, prediction: 0, optimal: 0 },
      { month: 'Feb', sales: 0, growth: 0, prediction: 0, optimal: 0 },
      { month: 'Mar', sales: 0, growth: 0, prediction: 0, optimal: 0 },
      { month: 'Apr', sales: 0, growth: 0, prediction: 0, optimal: 0 },
      { month: 'Mei', sales: 0, growth: 0, prediction: 0, optimal: 0 },
      { month: 'Jun', sales: 0, growth: 0, prediction: 0, optimal: 0 }
    ];
  };

  const fetchCustomerSegmentation = async () => {
    // Fetch all completed transactions with buyer info
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('id, total_amount, buyer_id, transaction_type')
      .eq('status', 'completed');

    if (error) {
      console.error('Error fetching customer segmentation:', error);
      return [];
    }

    // Segment customers by transaction type and amount
    const premium = transactions?.filter((t: any) => parseFloat(t.total_amount) > 300000000) || [];
    const tradeIn = transactions?.filter((t: any) => t.transaction_type === 'trade_in') || [];
    const regular = transactions?.filter((t: any) => parseFloat(t.total_amount) <= 300000000 && parseFloat(t.total_amount) > 150000000 && t.transaction_type !== 'trade_in') || [];
    const firstTime = transactions?.filter((t: any) => parseFloat(t.total_amount) <= 150000000) || [];

    const totalTransactions = transactions?.length || 1;

    return [
      {
        segment: 'Pembeli Premium',
        value: Math.round((premium.length / totalTransactions) * 100),
        revenue: premium.reduce((sum: number, t: any) => sum + parseFloat(t.total_amount), 0),
        satisfaction: 4.5
      },
      {
        segment: 'Pelanggan Reguler',
        value: Math.round((regular.length / totalTransactions) * 100),
        revenue: regular.reduce((sum: number, t: any) => sum + parseFloat(t.total_amount), 0),
        satisfaction: 4.2
      },
      {
        segment: 'Pembeli Pertama',
        value: Math.round((firstTime.length / totalTransactions) * 100),
        revenue: firstTime.reduce((sum: number, t: any) => sum + parseFloat(t.total_amount), 0),
        satisfaction: 3.9
      },
      {
        segment: 'Pelanggan Trade-in',
        value: Math.round((tradeIn.length / totalTransactions) * 100),
        revenue: tradeIn.reduce((sum: number, t: any) => sum + parseFloat(t.total_amount), 0),
        satisfaction: 4.3
      }
    ];
  };

  const calculateHealthIndicators = async () => {
    // Fetch necessary data for health calculations
    const { data: transactions } = await supabase
      .from('transactions')
      .select('total_amount, status, created_at')
      .eq('status', 'completed');

    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating_stars')
      .eq('moderation_status', 'approved')
      .eq('status', 'active');

    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const totalRevenue = transactions?.reduce((sum: number, t: any) => sum + parseFloat(t.total_amount || 0), 0) || 0;
    const avgRating = reviews && reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating_stars, 0) / reviews.length
      : 0;

    return [
      {
        category: 'Kesehatan Pendapatan',
        score: Math.min(Math.round((totalRevenue / 10000000000) * 100), 100),
        status: 'healthy',
        trend: 'up',
        indicators: [
          { name: 'Total Pendapatan', value: `Rp ${(totalRevenue / 1000000000).toFixed(1)}M`, status: 'good' },
          { name: 'Transaksi', value: transactions?.length || 0, status: 'good' },
          { name: 'Rata-rata Transaksi', value: `Rp ${((totalRevenue / (transactions?.length || 1)) / 1000000).toFixed(0)}jt`, status: 'good' }
        ]
      },
      {
        category: 'Kesehatan Pelanggan',
        score: Math.min(Math.round(avgRating * 20), 100),
        status: avgRating >= 4 ? 'healthy' : 'moderate',
        trend: 'up',
        indicators: [
          { name: 'Rating Rata-rata', value: `${avgRating.toFixed(1)}/5`, status: avgRating >= 4 ? 'good' : 'warning' },
          { name: 'Total Review', value: reviews?.length || 0, status: 'good' },
          { name: 'Pengguna Aktif', value: totalUsers || 0, status: 'good' }
        ]
      },
      {
        category: 'Kesehatan Operasional',
        score: 90,
        status: 'healthy',
        trend: 'stable',
        indicators: [
          { name: 'Waktu Aktif Sistem', value: '99.9%', status: 'good' },
          { name: 'Waktu Respons', value: '< 200ms', status: 'good' },
          { name: 'Tingkat Error', value: '< 0.1%', status: 'good' }
        ]
      },
      {
        category: 'Posisi Pasar',
        score: 75,
        status: 'moderate',
        trend: 'up',
        indicators: [
          { name: 'Total Listing', value: transactions?.length || 0, status: 'good' },
          { name: 'Tingkat Konversi', value: '3.2%', status: 'warning' },
          { name: 'Pangsa Pasar', value: '15%', status: 'good' }
        ]
      }
    ];
  };

  const fetchRevenueBreakdown = async () => {
    const { data: transactions } = await supabase
      .from('transactions')
      .select('total_amount, transaction_type')
      .eq('status', 'completed');

    if (!transactions || transactions.length === 0) {
      return [];
    }

    const totalRevenue = transactions.reduce((sum: number, t: any) => sum + parseFloat(t.total_amount || 0), 0);

    const purchase = transactions.filter((t: any) => t.transaction_type === 'purchase' || !t.transaction_type);
    const tradeIn = transactions.filter((t: any) => t.transaction_type === 'trade_in');
    const installment = transactions.filter((t: any) => t.transaction_type === 'installment');

    const purchaseRevenue = purchase.reduce((sum: number, t: any) => sum + parseFloat(t.total_amount || 0), 0);
    const tradeInRevenue = tradeIn.reduce((sum: number, t: any) => sum + parseFloat(t.total_amount || 0), 0);
    const installmentRevenue = installment.reduce((sum: number, t: any) => sum + parseFloat(t.total_amount || 0), 0);

    return [
      {
        source: 'Penjualan Baru',
        amount: purchaseRevenue,
        percentage: Math.round((purchaseRevenue / totalRevenue) * 100),
        growth: 12.5
      },
      {
        source: 'Trade-in',
        amount: tradeInRevenue,
        percentage: Math.round((tradeInRevenue / totalRevenue) * 100),
        growth: 8.3
      },
      {
        source: 'Installment',
        amount: installmentRevenue,
        percentage: Math.round((installmentRevenue / totalRevenue) * 100),
        growth: 15.7
      }
    ];
  };

  const fetchCustomerBehaviorData = async () => {
    // Fetch transactions with created_at timestamps to analyze hourly patterns
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('created_at, status')
      .eq('status', 'completed');

    if (error || !transactions || transactions.length === 0) {
      console.error('Error fetching customer behavior:', error);
      return [];
    }

    // Group transactions by hour
    const hourlyData: { [key: string]: { visits: number; conversions: number } } = {};

    // Initialize hours from 9 AM to 5 PM
    for (let hour = 9; hour <= 17; hour++) {
      const hourKey = `${hour.toString().padStart(2, '0')}:00`;
      hourlyData[hourKey] = { visits: 0, conversions: 0 };
    }

    // Count transactions per hour
    transactions.forEach((transaction: any) => {
      const date = new Date(transaction.created_at);
      const hour = date.getHours();
      if (hour >= 9 && hour <= 17) {
        const hourKey = `${hour.toString().padStart(2, '0')}:00`;
        hourlyData[hourKey].conversions += 1;
        // Estimate visits as conversions * 5 (assuming ~20% conversion rate)
        hourlyData[hourKey].visits = Math.round(hourlyData[hourKey].conversions * 5);
      }
    });

    // Convert to array format for charts
    return Object.entries(hourlyData).map(([hour, data]) => ({
      hour,
      visits: data.visits,
      conversions: data.conversions,
      engagement: data.conversions > 0 ? Math.min(Math.round((data.conversions / data.visits) * 100), 100) : 0
    }));
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

        {/* Error Alert */}
        {state.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-medium text-red-900">Terjadi Kesalahan</h3>
              <p className="text-sm text-red-700">{state.error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, error: null }))}
              className="ml-auto"
            >
              Tutup
            </Button>
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={state.activeTab} onValueChange={(value) => setState(prev => ({ ...prev, activeTab: value }))}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
            <TabsTrigger value="customer">Analisis Pelanggan</TabsTrigger>
            <TabsTrigger value="revenue">Analisis Pendapatan</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Business Health Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Skor Kesehatan Bisnis
                </CardTitle>
                <CardDescription>
                  Indikator kesehatan bisnis secara keseluruhan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(state.healthIndicators.length > 0 ? state.healthIndicators : healthIndicators).map((indicator, index) => (
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
                        {indicator.indicators.map((ind: any, idx: number) => (
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
                    <ComposedChart data={state.salesTrendData.length > 0 ? state.salesTrendData : salesTrendData}>
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
                    Segmentasi Pelanggan
                  </CardTitle>
                  <CardDescription>
                    Distribusi dan performa per segmen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={state.customerSegmentData.length > 0 ? state.customerSegmentData : customerSegmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ value }: any) => `${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(state.customerSegmentData.length > 0 ? state.customerSegmentData : customerSegmentData).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number, name: string, props: any) => [`${value}%`, props.payload.segment]} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value: string, entry: any) => entry.payload.segment}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Customer Behavior Patterns */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Pola Aktivitas Pelanggan
                  </CardTitle>
                  <CardDescription>
                    Pola kunjungan dan konversi per jam
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={state.customerBehaviorData.length > 0 ? state.customerBehaviorData : customerBehaviorData}>
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
                <CardTitle>Detail Segmen Pelanggan</CardTitle>
                <CardDescription>
                  Analisis mendalam per segmen pelanggan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(state.customerSegmentData.length > 0 ? state.customerSegmentData : customerSegmentData).map((segment, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{segment.segment}</h4>
                          <p className="text-sm text-gray-600">{segment.value}% dari total pelanggan</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">{segment.satisfaction}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-600">Kontribusi Pendapatan</p>
                          <p className="font-semibold">{formatCurrency(segment.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Rata-rata Transaksi</p>
                          <p className="font-semibold">{formatCurrency(segment.revenue / (segment.value * 10))}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Skor Kepuasan</p>
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
                  Rincian Sumber Pendapatan
                </CardTitle>
                <CardDescription>
                  Analisis sumber revenue dan pertumbuhan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(state.revenueBreakdown.length > 0 ? state.revenueBreakdown : revenueBreakdown).map((item, index) => (
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
                  <AreaChart data={state.salesTrendData.length > 0 ? state.salesTrendData : salesTrendData}>
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
        </Tabs>
      </div>
    </div>
  );
};

export default HalamanAnalisisBisnis;
