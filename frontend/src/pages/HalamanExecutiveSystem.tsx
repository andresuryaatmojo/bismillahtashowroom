import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const HalamanExecutiveSystem = () => {
  const { user, hasPermission, isLoading: authLoading } = useAuth();

  const [state, setState] = useState({
    isLoading: false,
    error: null as string | null,
    systemHealth: {
      serverStatus: 'online',
      databaseStatus: 'online',
      apiResponseTime: 0,
      uptime: '99.9%'
    }
  });

  useEffect(() => {
    if (user && user.role === 'owner') {
      loadSystemData();
    }

    // Refresh data setiap 30 detik
    const interval = setInterval(() => {
      if (user && user.role === 'owner') {
        loadSystemData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const loadSystemData = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulasi pengecekan sistem
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockSystemHealth = {
        serverStatus: Math.random() > 0.1 ? 'online' : 'offline',
        databaseStatus: Math.random() > 0.05 ? 'online' : 'offline',
        apiResponseTime: Math.floor(Math.random() * 200) + 50,
        uptime: '99.9%'
      };

      setState(prev => ({
        ...prev,
        systemHealth: mockSystemHealth,
        isLoading: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Gagal memuat data sistem',
        isLoading: false
      }));
    }
  };

  const performSystemAction = async (action: string) => {
    try {
      switch (action) {
        case 'clear_cache':
          alert('Cache berhasil dibersihkan');
          break;
        case 'restart_api':
          alert('API Server sedang di-restart...');
          setTimeout(() => {
            alert('API Server berhasil di-restart');
          }, 2000);
          break;
        case 'backup_database':
          alert('Database backup sedang diproses...');
          setTimeout(() => {
            alert('Database backup berhasil dibuat');
          }, 3000);
          break;
        default:
          break;
      }
    } catch (error) {
      alert('Gagal menjalankan aksi sistem');
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sistem</h1>
        <p className="text-gray-600">Monitor dan kelola sistem</p>
      </div>

      {state.error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {state.error}
        </div>
      )}

      <div className="space-y-6">
        {/* System Health */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                state.systemHealth.serverStatus === 'online'
                  ? 'bg-green-100'
                  : 'bg-red-100'
              }`}>
                <span className="text-2xl">
                  {state.systemHealth.serverStatus === 'online' ? '🟢' : '🔴'}
                </span>
              </div>
              <h4 className="mt-2 text-sm font-medium text-gray-900">Server Status</h4>
              <p className={`text-sm ${state.systemHealth.serverStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                {state.systemHealth.serverStatus.toUpperCase()}
              </p>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                state.systemHealth.databaseStatus === 'online'
                  ? 'bg-green-100'
                  : 'bg-red-100'
              }`}>
                <span className="text-2xl">
                  {state.systemHealth.databaseStatus === 'online' ? '🟢' : '🔴'}
                </span>
              </div>
              <h4 className="mt-2 text-sm font-medium text-gray-900">Database Status</h4>
              <p className={`text-sm ${state.systemHealth.databaseStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
                {state.systemHealth.databaseStatus.toUpperCase()}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="mt-2 text-sm font-medium text-gray-900">API Response Time</h4>
              <p className="text-sm text-blue-600">{state.systemHealth.apiResponseTime}ms</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="mt-2 text-sm font-medium text-gray-900">Uptime</h4>
              <p className="text-sm text-purple-600">{state.systemHealth.uptime}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString('id-ID')}
            </p>
            <button
              onClick={loadSystemData}
              disabled={state.isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {state.isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* System Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Actions</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => performSystemAction('clear_cache')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🧹</span>
                </div>
                <h4 className="font-medium text-gray-900">Clear Cache</h4>
                <p className="text-sm text-gray-500 mt-1">Bersihkan cache sistem</p>
              </div>
            </button>

            <button
              onClick={() => performSystemAction('restart_api')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">🔄</span>
                </div>
                <h4 className="font-medium text-gray-900">Restart API</h4>
                <p className="text-sm text-gray-500 mt-1">Restart API server</p>
              </div>
            </button>

            <button
              onClick={() => performSystemAction('backup_database')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">💾</span>
                </div>
                <h4 className="font-medium text-gray-900">Backup Database</h4>
                <p className="text-sm text-gray-500 mt-1">Buat backup database</p>
              </div>
            </button>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Application</h4>
              <dl className="space-y-1">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Version:</dt>
                  <dd className="text-sm text-gray-900">1.0.0</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Environment:</dt>
                  <dd className="text-sm text-gray-900">Production</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Node Version:</dt>
                  <dd className="text-sm text-gray-900">18.x</dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Database</h4>
              <dl className="space-y-1">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Type:</dt>
                  <dd className="text-sm text-gray-900">PostgreSQL</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Version:</dt>
                  <dd className="text-sm text-gray-900">14.x</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Connections:</dt>
                  <dd className="text-sm text-gray-900">5/20</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HalamanExecutiveSystem;