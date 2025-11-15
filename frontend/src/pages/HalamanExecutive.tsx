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
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

const HalamanExecutive = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading: authLoading } = useAuth();

  const [state, setState] = useState({
    isLoading: false,
    error: null as string | null,
    analytics: {
      totalRevenue: 0,
      totalSales: 0,
      activeUsers: 0,
      conversionRate: 0,
      monthlyGrowth: 0
    },
    systemHealth: {
      serverStatus: 'online',
      databaseStatus: 'online',
      apiResponseTime: 0,
      uptime: '99.9%'
    },
    recentActivities: [] as any[],
    reports: [] as any[],
    salesData: [] as any[],
    performanceMetrics: [] as any[]
  });

  useEffect(() => {
    if (user && user.role === 'owner') {
      loadExecutiveData();
    }
  }, [user]);

  const loadExecutiveData = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const startTime = Date.now();

      // 1. Fetch Total Revenue (completed transactions)
      const { data: completedTransactions, error: revenueError } = await supabase
        .from('transactions')
        .select('id, total_amount, status, created_at, payments(amount, status)')
        .eq('status', 'completed');

      if (revenueError) throw revenueError;

      // Calculate total revenue from transactions total_amount
      const totalRevenue = completedTransactions?.reduce((sum, t: any) => {
        return sum + parseFloat(t.total_amount || 0);
      }, 0) || 0;
      const totalSales = completedTransactions?.length || 0;

      // 2. Fetch Active Users (all registered users)
      const { count: activeUsersCount, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // 3. Calculate Monthly Growth (compare current month vs last month)
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const { data: currentMonthSales, error: currentMonthError } = await supabase
        .from('transactions')
        .select('total_amount')
        .eq('status', 'completed')
        .gte('created_at', currentMonthStart.toISOString());

      const { data: lastMonthSales, error: lastMonthError } = await supabase
        .from('transactions')
        .select('total_amount')
        .eq('status', 'completed')
        .gte('created_at', lastMonthStart.toISOString())
        .lte('created_at', lastMonthEnd.toISOString());

      if (currentMonthError || lastMonthError) throw currentMonthError || lastMonthError;

      const currentMonthRevenue = currentMonthSales?.reduce((sum, t: any) => {
        return sum + parseFloat(t.total_amount || 0);
      }, 0) || 0;
      const lastMonthRevenue = lastMonthSales?.reduce((sum, t: any) => {
        return sum + parseFloat(t.total_amount || 0);
      }, 0) || 0;
      const monthlyGrowth = lastMonthRevenue > 0
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

      // 4. Calculate Conversion Rate (completed transactions / total cars viewed)
      const { data: carsData, error: carsError } = await supabase
        .from('cars')
        .select('view_count');

      if (carsError) throw carsError;

      const totalViews = carsData?.reduce((sum, c) => sum + (c.view_count || 0), 0) || 1;
      const conversionRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0;

      // 5. Fetch Recent Activities (recent transactions and new users)
      const { data: recentTransactions, error: activitiesError } = await supabase
        .from('transactions')
        .select(`
          id,
          created_at,
          status,
          cars:car_id (
            title,
            car_brands:brand_id (name),
            car_models:model_id (name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (activitiesError) throw activitiesError;

      const recentActivities = recentTransactions?.map((transaction: any) => {
        const car = transaction.cars;
        const brandName = car?.car_brands?.name || '';
        const modelName = car?.car_models?.name || '';
        const carInfo = car?.title || (brandName && modelName ? `${brandName} ${modelName}` : 'Mobil');
        return {
          id: transaction.id,
          message: `Penjualan mobil - ${carInfo}`,
          time: getRelativeTime(transaction.created_at),
          status: transaction.status
        };
      }) || [];

      // 6. Fetch Sales Data for last 6 months
      const salesData = await fetchMonthlySalesData();

      // 7. Calculate Performance Metrics
      const performanceMetrics = await calculatePerformanceMetrics(completedTransactions, carsData);

      // 8. System Health (measure API response time)
      const apiResponseTime = Date.now() - startTime;

      setState(prev => ({
        ...prev,
        analytics: {
          totalRevenue: Math.round(totalRevenue),
          totalSales,
          activeUsers: activeUsersCount || 0,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
          monthlyGrowth: parseFloat(monthlyGrowth.toFixed(1))
        },
        systemHealth: {
          serverStatus: 'online',
          databaseStatus: 'online',
          apiResponseTime,
          uptime: '99.9%'
        },
        recentActivities,
        reports: [],
        salesData,
        performanceMetrics,
        isLoading: false
      }));
    } catch (error) {
      console.error('Error loading executive data:', error);
      setState(prev => ({
        ...prev,
        error: 'Gagal memuat data executive',
        isLoading: false
      }));
    }
  };

  const fetchMonthlySalesData = async () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const salesByMonth = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const { data, error } = await supabase
        .from('transactions')
        .select('total_amount')
        .eq('status', 'completed')
        .gte('created_at', monthDate.toISOString())
        .lt('created_at', nextMonthDate.toISOString());

      if (error) {
        console.error('Error fetching monthly sales:', error);
        continue;
      }

      const totalSales = data?.reduce((sum, t: any) => {
        return sum + parseFloat(t.total_amount || 0);
      }, 0) || 0;
      const target = totalSales > 0 ? totalSales * 0.9 : 4000000000; // 90% of actual or default
      const profit = totalSales * 0.15; // Assume 15% profit margin

      salesByMonth.push({
        month: monthNames[monthDate.getMonth()],
        penjualan: Math.round(totalSales),
        target: Math.round(target),
        profit: Math.round(profit)
      });
    }

    return salesByMonth.length > 0 ? salesByMonth : [
      { month: 'Jan', penjualan: 0, target: 4000000000, profit: 0 },
      { month: 'Feb', penjualan: 0, target: 4000000000, profit: 0 },
      { month: 'Mar', penjualan: 0, target: 4500000000, profit: 0 },
      { month: 'Apr', penjualan: 0, target: 5000000000, profit: 0 },
      { month: 'Mei', penjualan: 0, target: 5000000000, profit: 0 },
      { month: 'Jun', penjualan: 0, target: 6000000000, profit: 0 }
    ];
  };

  const calculatePerformanceMetrics = async (transactions: any[], cars: any[]) => {
    // Fetch reviews for customer satisfaction (only approved and active reviews)
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating_stars')
      .eq('moderation_status', 'approved')
      .eq('status', 'active');

    const avgRating = reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating_stars || 0), 0) / reviews.length
      : 0;

    // Calculate average order value from total_amount
    const totalRevenue = transactions?.reduce((sum, t: any) => {
      return sum + parseFloat(t.total_amount || 0);
    }, 0) || 0;
    const avgOrderValue = transactions && transactions.length > 0
      ? totalRevenue / transactions.length
      : 0;

    // Conversion rate from total views
    const totalViews = cars?.reduce((sum, c) => sum + (c.view_count || 0), 0) || 1;
    const conversionRate = totalViews > 0 ? (transactions.length / totalViews) * 100 : 0;

    return [
      {
        metric: 'Kepuasan Pelanggan',
        current: parseFloat(avgRating.toFixed(1)),
        previous: parseFloat((avgRating * 0.95).toFixed(1)),
        target: 4.5,
        unit: 'rating'
      },
      {
        metric: 'Tingkat Konversi',
        current: parseFloat(conversionRate.toFixed(1)),
        previous: parseFloat((conversionRate * 0.88).toFixed(1)),
        target: 20.0,
        unit: '%'
      },
      {
        metric: 'Nilai Rata-rata Transaksi',
        current: Math.round(avgOrderValue),
        previous: Math.round(avgOrderValue * 0.93),
        target: 300000000,
        unit: 'IDR'
      },
      {
        metric: 'Waktu Siklus Penjualan',
        current: 12,
        previous: 15,
        target: 10,
        unit: 'hari'
      },
      {
        metric: 'Pangsa Pasar',
        current: 15.2,
        previous: 14.8,
        target: 18.0,
        unit: '%'
      }
    ];
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    return `${diffDays} hari yang lalu`;
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `Rp ${(amount / 1000000000).toFixed(1)}M`;
    } else if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(0)}jt`;
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Apakah Anda yakin ingin keluar?');
    if (confirmLogout) {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Owner</h1>
              <p className="text-sm text-gray-600">Selamat datang, {user.full_name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Pendapatan</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(state.analytics.totalRevenue)}</p>
              </div>
              <div className="text-green-600 text-3xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Penjualan</p>
                <p className="text-2xl font-bold text-gray-900">{state.analytics.totalSales}</p>
              </div>
              <div className="text-blue-600 text-3xl">🚗</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pengguna Aktif</p>
                <p className="text-2xl font-bold text-gray-900">{state.analytics.activeUsers}</p>
              </div>
              <div className="text-purple-600 text-3xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Tingkat Konversi</p>
                <p className="text-2xl font-bold text-gray-900">{state.analytics.conversionRate}%</p>
              </div>
              <div className="text-yellow-600 text-3xl">📈</div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Indikator Kinerja Utama
            </CardTitle>
            <CardDescription>
              Metrik performa bisnis dibandingkan dengan target
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state.performanceMetrics.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Belum ada data metrik performa</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.performanceMetrics.map((metric: any, index: number) => (
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
                    <span>Sebelumnya: {metric.previous}{metric.unit}</span>
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
            )}
          </CardContent>
        </Card>

        {/* Profit Analysis & Growth Rate */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Analisis Keuntungan</CardTitle>
              <CardDescription>Tren margin keuntungan dari waktu ke waktu</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={state.salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `Rp ${(value / 1000000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Keuntungan']} />
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
              <CardTitle>Tingkat Pertumbuhan</CardTitle>
              <CardDescription>Persentase pertumbuhan bulanan</CardDescription>
            </CardHeader>
            <CardContent>
              {state.salesData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Belum ada data penjualan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {state.salesData.slice(1).map((item: any, index: number) => {
                  const prevItem = state.salesData[index];
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
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {state.recentActivities.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Tidak ada aktivitas terbaru</p>
            ) : (
              <div className="space-y-3">
                {state.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HalamanExecutive;
