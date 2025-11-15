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
    reports: [] as any[]
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

  const mockPerformanceMetrics = [
    { metric: 'Customer Satisfaction', current: 4.2, previous: 4.0, target: 4.5, unit: 'rating' },
    { metric: 'Conversion Rate', current: 18.5, previous: 16.2, target: 20.0, unit: '%' },
    { metric: 'Average Order Value', current: 285000000, previous: 265000000, target: 300000000, unit: 'IDR' },
    { metric: 'Sales Cycle Time', current: 12, previous: 15, target: 10, unit: 'days' },
    { metric: 'Market Share', current: 15.2, previous: 14.8, target: 18.0, unit: '%' }
  ];

  useEffect(() => {
    if (user && user.role === 'owner') {
      loadExecutiveData();
    }
  }, [user]);

  const loadExecutiveData = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulasi data executive dashboard
      const mockData = {
        analytics: {
          totalRevenue: 4500000000,
          totalSales: 156,
          activeUsers: 1240,
          conversionRate: 3.2,
          monthlyGrowth: 12.5
        },
        systemHealth: {
          serverStatus: 'online',
          databaseStatus: 'online',
          apiResponseTime: 120,
          uptime: '99.9%'
        },
        recentActivities: [
          {
            id: 1,
            message: 'Penjualan mobil baru - Toyota Avanza',
            time: '2 jam yang lalu',
            status: 'completed'
          },
          {
            id: 2,
            message: 'User baru terdaftar',
            time: '5 jam yang lalu',
            status: 'completed'
          },
          {
            id: 3,
            message: 'Backup database otomatis',
            time: '1 hari yang lalu',
            status: 'completed'
          }
        ],
        reports: [
          {
            id: 1,
            name: 'Laporan Bulanan - Oktober 2024',
            date: '2024-11-01',
            status: 'ready'
          }
        ]
      };

      setState(prev => ({
        ...prev,
        ...mockData,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Gagal memuat data executive',
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
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(state.analytics.totalRevenue)}</p>
              </div>
              <div className="text-green-600 text-3xl">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{state.analytics.totalSales}</p>
              </div>
              <div className="text-blue-600 text-3xl">🚗</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{state.analytics.activeUsers}</p>
              </div>
              <div className="text-purple-600 text-3xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Conversion Rate</p>
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

        {/* Profit Analysis & Growth Rate */}
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
