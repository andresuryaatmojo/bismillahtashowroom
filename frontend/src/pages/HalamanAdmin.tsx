import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaCamera, FaMapMarkerAlt, FaCar, FaEye } from 'react-icons/fa';
import { FiSearch } from 'react-icons/fi';
import { MdMonitor, MdStorage, MdPeople } from 'react-icons/md';

const HalamanAdmin = () => {
  const navigate = useNavigate();
  
  // State internal untuk admin
  const [state, setState] = useState({
    isLoggedIn: false,
    isLoading: false,
    error: null as string | null,
    currentView: 'login',
    searchQuery: '',
    filterStatus: '',
    loginForm: {
      username: '',
      password: ''
    },
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
  
  // State untuk validasi
  const [loginErrors, setLoginErrors] = useState<any>({});
  const [mobilErrors, setMobilErrors] = useState<any>({});
  
  const [mobilForm, setMobilForm] = useState({
    merk: '',
    model: '',
    tahun: '',
    harga: '',
    kilometer: '',
    transmisi: '',
    bahanBakar: '',
    warna: '',
    deskripsi: '',
    lokasi: '',
    status: 'Tersedia'
  });
  
  const [fileInputRef, setFileInputRef] = useState({});

  // Fungsi helper untuk format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Fungsi validasi login admin
  const validateLoginForm = (formData: any) => {
    const errors: any = {};
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /(union|select|insert|update|delete|drop|create|alter|exec|execute)\s+/gi
    ];

    // Validasi username
    if (!formData.username) {
      errors.username = 'Username wajib diisi';
    } else if (formData.username.length < 3) {
      errors.username = 'Username minimal 3 karakter';
    } else if (formData.username.length > 50) {
      errors.username = 'Username maksimal 50 karakter';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username hanya boleh mengandung huruf, angka, dan underscore';
    }

    // Validasi password
    if (!formData.password) {
      errors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      errors.password = 'Password minimal 6 karakter';
    } else if (formData.password.length > 128) {
      errors.password = 'Password maksimal 128 karakter';
    }

    // Deteksi pola berbahaya
    const allValues = Object.values(formData).join(' ');
    for (const pattern of dangerousPatterns) {
      if (pattern.test(allValues)) {
        errors.security = 'Input mengandung karakter yang tidak diizinkan';
        break;
      }
    }

    return errors;
  };

  // Fungsi validasi form mobil
  const validateMobilForm = (formData: any) => {
    const errors: any = {};
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /(union|select|insert|update|delete|drop|create|alter|exec|execute)\s+/gi
    ];

    // Validasi merk
    if (!formData.merk) {
      errors.merk = 'Merk wajib diisi';
    } else if (formData.merk.length < 2) {
      errors.merk = 'Merk minimal 2 karakter';
    } else if (formData.merk.length > 50) {
      errors.merk = 'Merk maksimal 50 karakter';
    } else if (!/^[a-zA-Z\s-]+$/.test(formData.merk)) {
      errors.merk = 'Merk hanya boleh mengandung huruf, spasi, dan tanda hubung';
    }

    // Validasi model
    if (!formData.model) {
      errors.model = 'Model wajib diisi';
    } else if (formData.model.length < 2) {
      errors.model = 'Model minimal 2 karakter';
    } else if (formData.model.length > 100) {
      errors.model = 'Model maksimal 100 karakter';
    }

    // Validasi tahun
    if (!formData.tahun) {
      errors.tahun = 'Tahun wajib diisi';
    } else {
      const tahun = parseInt(formData.tahun);
      const currentYear = new Date().getFullYear();
      if (isNaN(tahun) || tahun < 1900 || tahun > currentYear + 1) {
        errors.tahun = `Tahun harus antara 1900 dan ${currentYear + 1}`;
      }
    }

    // Validasi harga
    if (!formData.harga) {
      errors.harga = 'Harga wajib diisi';
    } else {
      const harga = parseFloat(formData.harga.replace(/[^\d]/g, ''));
      if (isNaN(harga) || harga <= 0) {
        errors.harga = 'Harga harus berupa angka positif';
      } else if (harga > 10000000000) {
        errors.harga = 'Harga maksimal 10 miliar';
      }
    }

    // Validasi kilometer
    if (!formData.kilometer) {
      errors.kilometer = 'Kilometer wajib diisi';
    } else {
      const km = parseInt(formData.kilometer.replace(/[^\d]/g, ''));
      if (isNaN(km) || km < 0) {
        errors.kilometer = 'Kilometer harus berupa angka non-negatif';
      } else if (km > 1000000) {
        errors.kilometer = 'Kilometer maksimal 1 juta km';
      }
    }

    // Validasi transmisi
    if (!formData.transmisi) {
      errors.transmisi = 'Transmisi wajib dipilih';
    } else if (!['Manual', 'Automatic', 'CVT', 'Semi-Automatic'].includes(formData.transmisi)) {
      errors.transmisi = 'Transmisi tidak valid';
    }

    // Validasi bahan bakar
    if (!formData.bahanBakar) {
      errors.bahanBakar = 'Bahan bakar wajib dipilih';
    } else if (!['Bensin', 'Diesel', 'Hybrid', 'Listrik', 'Gas'].includes(formData.bahanBakar)) {
      errors.bahanBakar = 'Bahan bakar tidak valid';
    }

    // Validasi warna
    if (!formData.warna) {
      errors.warna = 'Warna wajib diisi';
    } else if (formData.warna.length < 3) {
      errors.warna = 'Warna minimal 3 karakter';
    } else if (formData.warna.length > 30) {
      errors.warna = 'Warna maksimal 30 karakter';
    } else if (!/^[a-zA-Z\s-]+$/.test(formData.warna)) {
      errors.warna = 'Warna hanya boleh mengandung huruf, spasi, dan tanda hubung';
    }

    // Validasi deskripsi
    if (formData.deskripsi && formData.deskripsi.length > 1000) {
      errors.deskripsi = 'Deskripsi maksimal 1000 karakter';
    }

    // Validasi lokasi
    if (!formData.lokasi) {
      errors.lokasi = 'Lokasi wajib diisi';
    } else if (formData.lokasi.length < 3) {
      errors.lokasi = 'Lokasi minimal 3 karakter';
    } else if (formData.lokasi.length > 100) {
      errors.lokasi = 'Lokasi maksimal 100 karakter';
    }

    // Deteksi pola berbahaya
    const allValues = Object.values(formData).join(' ');
    for (const pattern of dangerousPatterns) {
      if (pattern.test(allValues)) {
        errors.security = 'Input mengandung karakter yang tidak diizinkan';
        break;
      }
    }

    return errors;
  };

  // Handler untuk perubahan input login
  const handleLoginInputChange = (field: string, value: string) => {
    setState(prev => ({
      ...prev,
      loginForm: { ...prev.loginForm, [field]: value }
    }));
    
    // Clear error saat user mengetik
    if (loginErrors[field]) {
      setLoginErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  // Handler untuk perubahan input mobil
  const handleMobilInputChange = (field: string, value: string) => {
    setMobilForm((prev: any) => ({ ...prev, [field]: value }));

    // Clear error saat user mengetik
    if (mobilErrors[field]) {
      setMobilErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  // Fungsi login dengan validasi
  const loginKeAdmin = async () => {
    const errors = validateLoginForm(state.loginForm);
    setLoginErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulasi API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (state.loginForm.username === 'admin' && state.loginForm.password === 'admin123') {
        setState(prev => ({
          ...prev,
          isLoggedIn: true,
          isLoading: false,
          currentView: 'dashboard'
        }));
        loadDaftarMobil();
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Username atau password salah'
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Terjadi kesalahan saat login'
      }));
    }
  };

  // Fungsi simpan perubahan mobil
  const simpanPerubahanMobil = async (mobilData: any) => {
    try {
      setState((prev: any) => ({ ...prev, isLoading: true }));
      
      // Simulasi API call
      console.log('Menyimpan data mobil:', mobilData);
      
      // Simulasi delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState((prev: any) => ({ 
        ...prev, 
        isLoading: false,
        currentView: 'dashboard'
      }));
      
      // Reload data mobil
      loadDaftarMobil();
      
    } catch (error) {
      setState((prev: any) => ({ 
        ...prev, 
        isLoading: false,
        error: 'Gagal menyimpan data mobil'
      }));
    }
  };

  // Fungsi simpan perubahan mobil dengan validasi
  const simpanPerubahanMobilWithValidation = async () => {
    const errors = validateMobilForm(mobilForm);
    setMobilErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    // Lanjutkan dengan penyimpanan jika validasi berhasil
    await simpanPerubahanMobil(mobilForm);
  };

  // Fungsi untuk memuat daftar mobil
  const loadDaftarMobil = () => {
    // Simulasi data mobil
    const dummyMobil = [
      {
        id: 1,
        merk: 'Toyota',
        model: 'Avanza',
        tahun: 2023,
        harga: 250000000,
        status: 'Tersedia',
        foto: '/images/avanza.jpg'
      },
      {
        id: 2,
        merk: 'Honda',
        model: 'Brio',
        tahun: 2023,
        harga: 180000000,
        status: 'Tersedia',
        foto: '/images/brio.jpg'
      }
    ];
    
    setState(prev => ({
      ...prev,
      daftarMobil: dummyMobil
    }));
  };

  // Implementasi fungsi yang hilang
  const lihatDetailMobil = (mobil: any) => {
    setState((prev: any) => ({
      ...prev,
      mobilTerpilih: mobil,
      currentView: 'detail'
    }));
  };

  const pilihDanEditMobil = (mobil: any) => {
    setMobilForm({
      merk: mobil.merk,
      model: mobil.model,
      tahun: mobil.tahun.toString(),
      harga: mobil.harga.toString(),
      kilometer: mobil.kilometer || '',
      transmisi: mobil.transmisi || '',
      bahanBakar: mobil.bahanBakar || '',
      warna: mobil.warna || '',
      deskripsi: mobil.deskripsi || '',
      lokasi: mobil.lokasi || '',
      status: mobil.status
    });
    
    setState((prev: any) => ({
      ...prev,
      mobilTerpilih: mobil,
      isEditMode: true,
      currentView: 'edit'
    }));
  };

  const konfirmasiHapusMobil = (mobilId: any) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus mobil ini?')) {
      setState((prev: any) => ({
        ...prev,
        daftarMobil: prev.daftarMobil.filter((mobil: any) => mobil.id !== mobilId)
      }));
    }
  };

  const unggahFotoMobil = (file: any) => {
    // Implementasi upload foto
    console.log('Uploading file:', file);
  };

  const loadSystemMonitor = () => {
    // Simulasi data monitoring sistem
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

  return (
    <div className="min-h-screen bg-gray-50">
      {!state.isLoggedIn ? (
        // Form Login Admin
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-6">Login Admin</h2>
            
            {state.error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {state.error}
              </div>
            )}

            {loginErrors.security && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {loginErrors.security}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Username
              </label>
              <input
                type="text"
                value={state.loginForm?.username || ''}
                onChange={(e) => handleLoginInputChange('username', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  loginErrors.username ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan username"
              />
              {loginErrors.username && (
                <p className="text-red-500 text-xs mt-1">{loginErrors.username}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                value={state.loginForm?.password || ''}
                onChange={(e) => handleLoginInputChange('password', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  loginErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan password"
              />
              {loginErrors.password && (
                <p className="text-red-500 text-xs mt-1">{loginErrors.password}</p>
              )}
            </div>

            <button
              onClick={loginKeAdmin}
              disabled={state.isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {state.isLoading ? 'Loading...' : 'Login'}
            </button>
          </div>
        </div>
      ) : (
        // Dashboard Admin
        <div className="flex flex-col md:flex-row gap-4 p-4">
          <div className="flex-1">
            <div className="relative mb-4">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4">
                🔍
              </div>
              <input
                type="text"
                value={state.searchQuery || ''}
                onChange={(e) => setState((prev: any) => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="Cari mobil..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-4 mb-4">
              <select
                value={state.filterStatus || ''}
                onChange={(e) => setState(prev => ({ ...prev, filterStatus: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Status</option>
                <option value="Tersedia">Tersedia</option>
                <option value="Pending">Pending</option>
                <option value="Terjual">Terjual</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            {(() => {
              // Filter mobil berdasarkan search dan status
              const filteredMobil = state.daftarMobil.filter((mobil: any) => {
                const matchSearch = !state.searchQuery || 
                  mobil.nama?.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                  mobil.merek?.toLowerCase().includes(state.searchQuery.toLowerCase());
                
                const matchStatus = !state.filterStatus || mobil.status === state.filterStatus;
                
                return matchSearch && matchStatus;
              });

              return state.isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Memuat data...</p>
              </div>
            ) : filteredMobil?.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 text-gray-400 mx-auto mb-4 flex items-center justify-center">
                  🚗
                </div>
                <p className="text-gray-600">Tidak ada mobil ditemukan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg shadow">
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
                    {filteredMobil?.map((mobil) => (
                      <tr key={mobil.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-full object-cover" src={mobil.foto} alt="" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {mobil.merk} {mobil.model}
                              </div>
                              <div className="text-sm text-gray-500">
                                {mobil.tahun} • {mobil.transmisi}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(mobil.harga)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            mobil.status === 'Tersedia' ? 'bg-green-100 text-green-800' :
                            mobil.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {mobil.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => lihatDetailMobil(mobil)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              👁️
                            </button>
                            <button
                              onClick={() => pilihDanEditMobil(mobil)}
                              className="text-green-600 hover:text-green-900"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => konfirmasiHapusMobil(mobil.id)}
                              className="text-red-600 hover:text-red-900"
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
            );
            })()}
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Daftar Notifikasi ({(state as any).daftarNotifikasi?.length || 0})
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalamanAdmin;