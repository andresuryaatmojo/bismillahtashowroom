import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const HalamanAdmin = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  
  const [state, setState] = useState({
    isLoading: false,
    error: null as string | null,
    searchQuery: '',
    filterStatus: '',
    daftarMobil: [] as any[],
    mobilTerpilih: null as any,
    isEditMode: false,
    systemMonitor: {
      cpu: 0,
      memory: 0,
      storage: 0,
      activeUsers: 0,
      totalTransactions: 0
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const loadDaftarMobil = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase
        .from('cars')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        daftarMobil: data || [],
        isLoading: false
      }));
    } catch (error: any) {
      console.error('Error loading cars:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false
      }));
    }
  };

  const loadSystemMonitor = () => {
    setState(prev => ({
      ...prev,
      systemMonitor: {
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        storage: Math.floor(Math.random() * 100),
        activeUsers: Math.floor(Math.random() * 1000),
        totalTransactions: Math.floor(Math.random() * 10000)
      }
    }));
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadDaftarMobil();
      loadSystemMonitor();
    }
  }, [user]);

  const lihatDetailMobil = (mobil: any) => {
    setState(prev => ({
      ...prev,
      mobilTerpilih: mobil
    }));
  };

  const pilihDanEditMobil = (mobil: any) => {
    setState(prev => ({
      ...prev,
      mobilTerpilih: mobil,
      isEditMode: true
    }));
  };

  const konfirmasiHapusMobil = async (mobilId: any) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus mobil ini?')) return;
    
    try {
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', mobilId);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        daftarMobil: prev.daftarMobil.filter((mobil: any) => mobil.id !== mobilId)
      }));

      alert('Mobil berhasil dihapus');
    } catch (error: any) {
      console.error('Error deleting car:', error);
      alert('Gagal menghapus mobil: ' + error.message);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      await logout();
      navigate('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600">Anda tidak memiliki akses ke halaman ini.</p>
        </div>
      </div>
    );
  }

  const filteredMobil = state.daftarMobil.filter((mobil: any) => {
    const matchSearch = !state.searchQuery || 
      mobil.brand?.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      mobil.model?.toLowerCase().includes(state.searchQuery.toLowerCase());
    
    const matchStatus = !state.filterStatus || mobil.status === state.filterStatus;
    
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
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
                <p className="text-gray-500 text-sm">Total Mobil</p>
                <p className="text-2xl font-bold text-gray-900">{state.daftarMobil.length}</p>
              </div>
              <div className="text-blue-600 text-3xl">🚗</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">CPU Usage</p>
                <p className="text-2xl font-bold text-gray-900">{state.systemMonitor.cpu}%</p>
              </div>
              <div className="text-green-600 text-3xl">📊</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{state.systemMonitor.activeUsers}</p>
              </div>
              <div className="text-purple-600 text-3xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{state.systemMonitor.totalTransactions}</p>
              </div>
              <div className="text-yellow-600 text-3xl">💳</div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
              <input
                type="text"
                value={state.searchQuery}
                onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="Cari mobil..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={state.filterStatus}
              onChange={(e) => setState(prev => ({ ...prev, filterStatus: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Status</option>
              <option value="available">Tersedia</option>
              <option value="pending">Pending</option>
              <option value="sold">Terjual</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Cars Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {state.isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Memuat data...</p>
            </div>
          ) : filteredMobil.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">🚗</div>
              <p className="text-gray-600">Tidak ada mobil ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mobil
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMobil.map((mobil) => (
                    <tr key={mobil.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={mobil.image_url || '/placeholder-car.jpg'} 
                              alt={mobil.model}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {mobil.brand} {mobil.model}
                            </div>
                            <div className="text-sm text-gray-500">
                              {mobil.year} • {mobil.transmission}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(mobil.price)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          mobil.status === 'available' ? 'bg-green-100 text-green-800' :
                          mobil.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          mobil.status === 'sold' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {mobil.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => lihatDetailMobil(mobil)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Lihat Detail"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => pilihDanEditMobil(mobil)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => konfirmasiHapusMobil(mobil.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Hapus"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HalamanAdmin;