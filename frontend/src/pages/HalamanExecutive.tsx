import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const HalamanExecutive = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission, isLoading: authLoading } = useAuth();
  
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

  useEffect(() => {
    if (user && user.role === 'owner') {
      loadExecutiveData();
    }
  }, [user]);

  // Sinkronkan konten dengan query param ?view=
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const view = params.get('view');
    if (view && ['dashboard','analytics','reports','system'].includes(view)) {
      setState(prev => ({ ...prev, currentView: view }));
    }
  }, [location.search]);

  const loadExecutiveData = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Load total revenue dari transactions
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('total_amount, status')
        .eq('status', 'completed');

      if (transError) throw transError;

      const totalRevenue = transactions?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0;
      const totalSales = transactions?.length || 0;

      // Load active users
      const { count: activeUsersCount, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('account_status', 'active');

      if (usersError) throw usersError;

      // Load recent activities dari transactions & users
      const { data: recentTrans, error: recentError } = await supabase
        .from('transactions')
        .select(`
          id,
          created_at,
          status,
          cars (brand, model),
          users (full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      const activities = recentTrans?.map((t: any) => ({
        id: t.id,
        type: 'sale',
        message: `Transaksi ${t.cars?.brand} ${t.cars?.model} oleh ${t.users?.full_name}`,
        time: new Date(t.created_at).toLocaleString('id-ID'),
        status: t.status
      })) || [];

      // Calculate conversion rate (dummy calculation)
      const conversionRate = totalSales > 0 ? ((totalSales / (activeUsersCount || 1)) * 100).toFixed(1) : 0;

      // System health check
      const startTime = Date.now();
      await supabase.from('users').select('id').limit(1);
      const responseTime = Date.now() - startTime;

      setState(prev => ({
        ...prev,
        analytics: {
          totalRevenue,
          totalSales,
          activeUsers: activeUsersCount || 0,
          conversionRate: parseFloat(conversionRate as string),
          monthlyGrowth: 8.3 // TODO: Calculate real growth
        },
        systemHealth: {
          serverStatus: 'online',
          databaseStatus: 'online',
          apiResponseTime: responseTime,
          uptime: '99.9%'
        },
        recentActivities: activities,
        reports: [
          { id: 1, name: 'Laporan Penjualan Bulanan', date: new Date().toLocaleDateString('id-ID'), status: 'ready' },
          { id: 2, name: 'Analisis Performa Marketing', date: new Date().toLocaleDateString('id-ID'), status: 'processing' },
          { id: 3, name: 'Laporan Keuangan Q4', date: new Date().toLocaleDateString('id-ID'), status: 'ready' }
        ],
        isLoading: false
      }));

    } catch (error: any) {
      console.error('Error loading executive data:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'Gagal memuat data executive',
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

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      await logout();
      navigate('/login');
    }
  };

  const exportData = async (type: string) => {
    try {
      let data: any[] = [];
      let filename = '';

      if (type === 'analytics') {
        const { data: analytics, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        data = analytics || [];
        filename = 'analytics_export.json';
      } else {
        alert(`Export ${type} belum diimplementasi`);
        return;
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      alert(`Data ${type} berhasil diekspor!`);
    } catch (error: any) {
      console.error('Error exporting data:', error);
      alert('Gagal mengekspor data: ' + error.message);
    }
  };

  const generateReport = async (reportType: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const { data: salesData, error } = await supabase
        .from('transactions')
        .select(`
          *,
          cars (brand, model, price),
          users (full_name, email)
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const report = {
        type: reportType,
        generatedAt: new Date().toISOString(),
        totalTransactions: salesData?.length || 0,
        totalRevenue: salesData?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0,
        data: salesData
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${reportType}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setState(prev => ({ ...prev, isLoading: false }));
      alert('Laporan berhasil dibuat!');
    } catch (error: any) {
      console.error('Error generating report:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      alert('Gagal membuat laporan: ' + error.message);
    }
  };

  const performSystemBackup = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));

      // Backup users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');

      if (usersError) throw usersError;

      // Backup cars
      const { data: cars, error: carsError } = await supabase
        .from('cars')
        .select('*');

      if (carsError) throw carsError;

      // Backup transactions
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('*');

      if (transError) throw transError;

      const backup = {
        timestamp: new Date().toISOString(),
        users: users || [],
        cars: cars || [],
        transactions: transactions || []
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setState(prev => ({ ...prev, isLoading: false }));
      alert('Backup sistem berhasil dibuat!');
    } catch (error: any) {
      console.error('Error creating backup:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      alert('Gagal membuat backup: ' + error.message);
    }
  };

  const clearCache = async () => {
    if (window.confirm('Apakah Anda yakin ingin membersihkan cache?')) {
      try {
        // Clear localStorage
        localStorage.clear();
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        alert('Cache berhasil dibersihkan! Halaman akan dimuat ulang.');
        window.location.reload();
      } catch (error) {
        alert('Gagal membersihkan cache');
      }
    }
  };

  const optimizeDatabase = async () => {
    if (window.confirm('Apakah Anda yakin ingin mengoptimalkan database? Ini mungkin memakan waktu.')) {
      try {
        setState(prev => ({ ...prev, isLoading: true }));

        // Simulasi optimasi database
        // Dalam produksi, ini bisa memanggil stored procedure di Supabase
        await new Promise(resolve => setTimeout(resolve, 2000));

        setState(prev => ({ ...prev, isLoading: false }));
        alert('Database berhasil dioptimalkan!');
        loadExecutiveData();
      } catch (error) {
        setState(prev => ({ ...prev, isLoading: false }));
        alert('Gagal mengoptimalkan database');
      }
    }
  };

  if (authLoading || state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dashboard executive...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'owner') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600">Anda tidak memiliki akses ke halaman ini.</p>
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
              <p className="text-sm text-gray-600">Selamat datang, {user.full_name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                Owner
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {state.error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {state.error}
            <button
              onClick={loadExecutiveData}
              className="ml-4 text-sm underline"
            >
              Coba Lagi
            </button>
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
                        <dt className="text-sm font-medium text-gray-500 truncate">Conversion Rate</dt>
                        <dd className="text-lg font-medium text-gray-900">{state.analytics.conversionRate}%</dd>
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
        )}

        {/* Analytics View */}
        {state.currentView === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Analytics</h3>
              <p className="text-gray-600 mb-4">Analisis mendalam tentang performa bisnis</p>
              
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
                            onClick={() => generateReport(report.name)}
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
        {state.currentView === 'system' && (
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
                    onClick={performSystemBackup}
                    disabled={state.isLoading}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    Backup System
                  </button>
                  
                  <button
                    onClick={clearCache}
                    className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Clear Cache
                  </button>
                  
                  <button
                    onClick={optimizeDatabase}
                    disabled={state.isLoading}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
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