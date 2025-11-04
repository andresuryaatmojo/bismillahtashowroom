import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const HalamanExecutiveAnalytics = () => {
  const { user, hasPermission, isLoading: authLoading } = useAuth();

  const [state, setState] = useState({
    isLoading: false,
    error: null as string | null,
    analytics: {
      totalRevenue: 0,
      totalSales: 0,
      activeUsers: 0,
      conversionRate: 0,
      monthlyGrowth: 0
    }
  });

  useEffect(() => {
    if (user && user.role === 'owner') {
      loadAnalyticsData();
    }
  }, [user]);

  const loadAnalyticsData = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulasi data analytics
      const mockData = {
        totalRevenue: 4500000000,
        totalSales: 156,
        activeUsers: 1240,
        conversionRate: 3.2,
        monthlyGrowth: 12.5
      };

      setState(prev => ({
        ...prev,
        analytics: mockData,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Gagal memuat data analytics',
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

  const exportData = (type: string) => {
    const data = {
      analytics: state.analytics,
      exportDate: new Date().toISOString(),
      exportedBy: user?.full_name || user?.email || 'Executive User'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analisis Bisnis</h1>
        <p className="text-gray-600">Analisis mendalam tentang performa bisnis</p>
      </div>

      {state.error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {state.error}
        </div>
      )}

      {state.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
          <p className="text-gray-600">Memuat data analytics...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      💰
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {formatCurrency(state.analytics.totalRevenue)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      🚗
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Sales</dt>
                      <dd className="text-lg font-medium text-gray-900">{state.analytics.totalSales}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      👥
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                      <dd className="text-lg font-medium text-gray-900">{state.analytics.activeUsers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      📈
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
                      <dd className="text-lg font-medium text-gray-900">{state.analytics.conversionRate}%</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Analytics</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Conversion Rate</h4>
                <div className="text-2xl font-bold text-green-600">{state.analytics.conversionRate}%</div>
                <p className="text-sm text-gray-500">Dari total users aktif</p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Average Transaction</h4>
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(state.analytics.totalSales > 0 ? state.analytics.totalRevenue / state.analytics.totalSales : 0)}
                </div>
                <p className="text-sm text-gray-500">Per transaksi</p>
              </div>
            </div>

            <button
              onClick={() => exportData('analytics')}
              className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Export Analytics Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalamanExecutiveAnalytics;