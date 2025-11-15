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
      totalTransactions: 0,
      availableCars: 0,
      pendingCars: 0
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

      // Fetch cars with their images
      const { data, error } = await supabase
        .from('cars')
        .select(`
          *,
          car_images!car_images_car_id_fkey (
            id,
            image_url,
            is_primary,
            display_order
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process data to add primary image
      const processedData = data?.map(car => {
        const primaryImage = car.car_images?.find((img: any) => img.is_primary);
        const firstImage = car.car_images?.[0];
        return {
          ...car,
          image_url: primaryImage?.image_url || firstImage?.image_url || null
        };
      });

      setState(prev => ({
        ...prev,
        daftarMobil: processedData || [],
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

  const loadSystemMonitor = async () => {
    try {
      // Fetch real statistics from database
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: totalTransactions } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });

      const { count: availableCars } = await supabase
        .from('cars')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available');

      const { count: pendingCars } = await supabase
        .from('cars')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setState(prev => ({
        ...prev,
        systemMonitor: {
          cpu: 0, // Not applicable for web app
          memory: 0, // Not applicable for web app
          storage: 0, // Not applicable for web app
          activeUsers: totalUsers || 0,
          totalTransactions: totalTransactions || 0,
          availableCars: availableCars || 0,
          pendingCars: pendingCars || 0
        }
      }));
    } catch (error) {
      console.error('Error loading system monitor:', error);
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Mobil</p>
                <p className="text-2xl font-bold text-gray-900">{state.daftarMobil.length}</p>
                <p className="text-xs text-gray-400 mt-1">Semua mobil di sistem</p>
              </div>
              <div className="text-blue-600 text-3xl">🚗</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Mobil Tersedia</p>
                <p className="text-2xl font-bold text-green-600">{state.systemMonitor.availableCars}</p>
                <p className="text-xs text-gray-400 mt-1">Siap dijual</p>
              </div>
              <div className="text-green-600 text-3xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pengguna Terdaftar</p>
                <p className="text-2xl font-bold text-gray-900">{state.systemMonitor.activeUsers}</p>
                <p className="text-xs text-gray-400 mt-1">Total pengguna</p>
              </div>
              <div className="text-purple-600 text-3xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Transaksi</p>
                <p className="text-2xl font-bold text-gray-900">{state.systemMonitor.totalTransactions}</p>
                <p className="text-xs text-gray-400 mt-1">Semua transaksi</p>
              </div>
              <div className="text-yellow-600 text-3xl">💳</div>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow mb-6 p-4 border border-blue-100">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-6">
              <div className="text-sm">
                <span className="text-gray-600">Tersedia:</span>
                <span className="ml-2 font-bold text-green-700">{state.daftarMobil.filter(m => m.status === 'available').length}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Pending:</span>
                <span className="ml-2 font-bold text-yellow-700">{state.daftarMobil.filter(m => m.status === 'pending').length}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Terjual:</span>
                <span className="ml-2 font-bold text-red-700">{state.daftarMobil.filter(m => m.status === 'sold').length}</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Menampilkan <span className="font-semibold text-gray-900">{filteredMobil.length}</span> dari <span className="font-semibold text-gray-900">{state.daftarMobil.length}</span> mobil
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
                placeholder="Cari berdasarkan merek atau model..."
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
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Daftar Mobil</h2>
            <p className="text-sm text-gray-600 mt-1">Kelola dan pantau semua mobil dalam sistem</p>
          </div>
          {state.isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Memuat data...</p>
            </div>
          ) : filteredMobil.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">🚗</div>
              <p className="text-gray-600 font-medium">Tidak ada mobil ditemukan</p>
              <p className="text-sm text-gray-500 mt-2">Coba ubah filter pencarian Anda</p>
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
                      Spesifikasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMobil.map((mobil) => (
                    <tr key={mobil.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16">
                            <img
                              className="h-16 w-16 rounded-lg object-cover shadow-sm"
                              src={mobil.image_url || '/placeholder-car.jpg'}
                              alt={mobil.model}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=No+Image';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {mobil.brand} {mobil.model}
                            </div>
                            <div className="text-xs text-gray-500">
                              Tahun {mobil.year}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center text-gray-600">
                            <span className="font-medium w-20">Transmisi:</span>
                            <span>{mobil.transmission || '-'}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <span className="font-medium w-20">Bahan Bakar:</span>
                            <span>{mobil.fuel_type || '-'}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <span className="font-medium w-20">Kilometer:</span>
                            <span>{mobil.mileage ? `${mobil.mileage.toLocaleString('id-ID')} km` : '-'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">{formatCurrency(mobil.price)}</div>
                        {mobil.is_negotiable && (
                          <span className="text-xs text-blue-600">Nego</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          mobil.status === 'available' ? 'bg-green-100 text-green-800' :
                          mobil.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          mobil.status === 'sold' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {mobil.status === 'available' ? 'Tersedia' :
                           mobil.status === 'pending' ? 'Pending' :
                           mobil.status === 'sold' ? 'Terjual' :
                           mobil.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="mr-1">👁️</span>
                          <span>{mobil.view_count || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => lihatDetailMobil(mobil)}
                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded transition-colors"
                            title="Lihat Detail"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => pilihDanEditMobil(mobil)}
                            className="text-green-600 hover:text-green-900 hover:bg-green-50 p-2 rounded transition-colors"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => konfirmasiHapusMobil(mobil.id)}
                            className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded transition-colors"
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