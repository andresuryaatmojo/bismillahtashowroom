import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Aktivitas Terbaru
            </h3>
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
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HalamanExecutive;