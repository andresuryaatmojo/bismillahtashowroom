import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HalamanExecutive = () => {
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
  
  const [state, setState] = useState({
    currentView: 'dashboard',
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

  // Load data saat komponen dimount
  useEffect(() => {
    loadExecutiveData();
  }, []);

  const loadExecutiveData = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simulasi API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({
        ...prev,
        analytics: {
          totalRevenue: 2500000000,
          totalSales: 156,
          activeUsers: 1247,
          conversionRate: 12.5,
          monthlyGrowth: 8.3
        },
        systemHealth: {
          serverStatus: 'online',
          databaseStatus: 'online',
          apiResponseTime: 245,
          uptime: '99.9%'
        },
        recentActivities: [
          { id: 1, type: 'sale', message: 'Penjualan Honda Civic berhasil', time: '2 menit lalu' },
          { id: 2, type: 'user', message: 'User baru mendaftar', time: '5 menit lalu' },
          { id: 3, type: 'system', message: 'Backup database selesai', time: '1 jam lalu' }
        ],
        reports: [
          { id: 1, name: 'Laporan Penjualan Bulanan', date: '2024-01-15', status: 'ready' },
          { id: 2, name: 'Analisis Performa Marketing', date: '2024-01-14', status: 'processing' },
          { id: 3, name: 'Laporan Keuangan Q4', date: '2024-01-10', status: 'ready' }
        ],
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
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const exportData = (type: string) => {
    // Simulasi export data
    alert(`Mengekspor data ${type}...`);
  };

  const generateReport = (reportType: string) => {
    // Simulasi generate report
    alert(`Membuat laporan ${reportType}...`);
  };

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard executive...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
              <p className="text-sm text-gray-600">Selamat datang, {user?.username}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                Executive
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['dashboard', 'analytics', 'reports', 'system'].map((view) => (
              <button
                key={view}
                onClick={() => setState(prev => ({ ...prev, currentView: view }))}
                className={`py-4 px-2 border-b-2 font-medium text-sm capitalize ${
                  state.currentView === view
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {state.error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {state.error}
          </div>
        )}

        {/* Dashboard View */}
        {state.currentView === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
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
                        <dt className="text-sm font-medium text-gray-500 truncate">Growth Rate</dt>
                        <dd className="text-lg font-medium text-gray-900">{state.analytics.monthlyGrowth}%</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Aktivitas Terbaru
                </h3>
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
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics View */}
        {state.currentView === 'analytics' && hasPermission('view_analytics') && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Analytics</h3>
              <p className="text-gray-600 mb-4">Analisis mendalam tentang performa bisnis</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Conversion Rate</h4>
                  <div className="text-2xl font-bold text-green-600">{state.analytics.conversionRate}%</div>
                  <p className="text-sm text-gray-500">+2.1% dari bulan lalu</p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Customer Acquisition Cost</h4>
                  <div className="text-2xl font-bold text-blue-600">Rp 450,000</div>
                  <p className="text-sm text-gray-500">-5.2% dari bulan lalu</p>
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

        {/* Reports View */}
        {state.currentView === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Laporan Executive</h3>
                  <button
                    onClick={() => generateReport('executive')}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Generate New Report
                  </button>
                </div>
                
                <div className="space-y-3">
                  {state.reports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{report.name}</h4>
                        <p className="text-sm text-gray-500">{report.date}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          report.status === 'ready' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.status}
                        </span>
                        {report.status === 'ready' && (
                          <button
                            onClick={() => exportData(report.name)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System View */}
        {state.currentView === 'system' && hasPermission('manage_system') && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Server Status</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      {state.systemHealth.serverStatus}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Database Status</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      {state.systemHealth.databaseStatus}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">API Response Time</span>
                    <span className="text-gray-900">{state.systemHealth.apiResponseTime}ms</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Uptime</span>
                    <span className="text-gray-900">{state.systemHealth.uptime}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={() => alert('Memulai backup sistem...')}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Backup System
                  </button>
                  
                  <button
                    onClick={() => alert('Membersihkan cache...')}
                    className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Clear Cache
                  </button>
                  
                  <button
                    onClick={() => alert('Mengoptimalkan database...')}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Optimize Database
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HalamanExecutive;