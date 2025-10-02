import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './HalamanDetailUser.css';

// Interface untuk data user detail
interface DataUserDetail {
  id: string;
  nama: string;
  email: string;
  telepon: string;
  alamat: string;
  tanggalDaftar: Date;
  tanggalTerakhirLogin: Date;
  status: 'aktif' | 'nonaktif' | 'suspended';
  role: 'customer' | 'dealer' | 'admin';
  totalTransaksi: number;
  nilaiTransaksi: number;
  ratingRataRata: number;
  jumlahUlasan: number;
  fotoProfile?: string;
  ktp?: string;
  sim?: string;
  npwp?: string;
  bankAccount?: {
    namaBank: string;
    nomorRekening: string;
    namaRekening: string;
  };
  preferences?: {
    newsletter: boolean;
    smsNotification: boolean;
    emailNotification: boolean;
  };
  verifikasi?: {
    email: boolean;
    telepon: boolean;
    identitas: boolean;
  };
}

// Interface untuk riwayat transaksi
interface RiwayatTransaksi {
  id: string;
  tanggal: Date;
  jenisMobil: string;
  harga: number;
  status: 'pending' | 'completed' | 'cancelled';
  dealer: string;
  metodePembayaran: string;
}

// Interface untuk riwayat aktivitas
interface RiwayatAktivitas {
  id: string;
  tanggal: Date;
  aktivitas: string;
  detail: string;
  ipAddress?: string;
  userAgent?: string;
}

// Interface untuk status halaman
interface StatusHalaman {
  loading: boolean;
  error: string | null;
  success: string | null;
}

const HalamanDetailUser: React.FC = () => {
  const { idUser } = useParams<{ idUser: string }>();
  const navigate = useNavigate();

  // State management
  const [statusHalaman, setStatusHalaman] = useState<StatusHalaman>({
    loading: false,
    error: null,
    success: null
  });

  const [dataUser, setDataUser] = useState<DataUserDetail | null>(null);
  const [riwayatTransaksi, setRiwayatTransaksi] = useState<RiwayatTransaksi[]>([]);
  const [riwayatAktivitas, setRiwayatAktivitas] = useState<RiwayatAktivitas[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'transaksi' | 'aktivitas' | 'dokumen'>('info');

  // Data tiruan untuk testing
  const dataTiruanUserDetail: DataUserDetail = {
    id: 'USR001',
    nama: 'Ahmad Wijaya',
    email: 'ahmad.wijaya@email.com',
    telepon: '081234567890',
    alamat: 'Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta 10110',
    tanggalDaftar: new Date('2023-01-15'),
    tanggalTerakhirLogin: new Date('2024-01-20'),
    status: 'aktif',
    role: 'customer',
    totalTransaksi: 3,
    nilaiTransaksi: 450000000,
    ratingRataRata: 4.5,
    jumlahUlasan: 2,
    fotoProfile: '/images/profile1.jpg',
    ktp: '3171234567890123',
    sim: 'SIM123456789',
    npwp: '12.345.678.9-012.000',
    bankAccount: {
      namaBank: 'Bank BCA',
      nomorRekening: '1234567890',
      namaRekening: 'Ahmad Wijaya'
    },
    preferences: {
      newsletter: true,
      smsNotification: true,
      emailNotification: true
    },
    verifikasi: {
      email: true,
      telepon: true,
      identitas: true
    }
  };

  const dataTiruanTransaksi: RiwayatTransaksi[] = [
    {
      id: 'TXN001',
      tanggal: new Date('2024-01-15'),
      jenisMobil: 'Toyota Avanza 1.3 G MT',
      harga: 220000000,
      status: 'completed',
      dealer: 'Toyota Sunter',
      metodePembayaran: 'Kredit'
    },
    {
      id: 'TXN002',
      tanggal: new Date('2023-08-20'),
      jenisMobil: 'Honda Brio 1.2 E CVT',
      harga: 180000000,
      status: 'completed',
      dealer: 'Honda Kelapa Gading',
      metodePembayaran: 'Cash'
    },
    {
      id: 'TXN003',
      tanggal: new Date('2023-03-10'),
      jenisMobil: 'Daihatsu Xenia 1.3 R MT',
      harga: 50000000,
      status: 'cancelled',
      dealer: 'Daihatsu Cempaka Putih',
      metodePembayaran: 'Kredit'
    }
  ];

  const dataTiruanAktivitas: RiwayatAktivitas[] = [
    {
      id: 'ACT001',
      tanggal: new Date('2024-01-20'),
      aktivitas: 'Login',
      detail: 'User berhasil login ke sistem',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
      id: 'ACT002',
      tanggal: new Date('2024-01-19'),
      aktivitas: 'Update Profile',
      detail: 'User mengubah nomor telepon',
      ipAddress: '192.168.1.100'
    },
    {
      id: 'ACT003',
      tanggal: new Date('2024-01-18'),
      aktivitas: 'View Car',
      detail: 'User melihat detail Toyota Avanza',
      ipAddress: '192.168.1.100'
    },
    {
      id: 'ACT004',
      tanggal: new Date('2024-01-17'),
      aktivitas: 'Search',
      detail: 'User mencari mobil dengan kata kunci "Toyota"',
      ipAddress: '192.168.1.100'
    },
    {
      id: 'ACT005',
      tanggal: new Date('2024-01-16'),
      aktivitas: 'Login',
      detail: 'User berhasil login ke sistem',
      ipAddress: '192.168.1.101'
    }
  ];

  // Method: muatHalamanDetailUser
  const muatHalamanDetailUser = async (userId: string): Promise<void> => {
    try {
      setStatusHalaman({ loading: true, error: null, success: null });
      
      // Simulasi API call untuk memuat detail user
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulasi pengecekan apakah user ditemukan
      if (userId === 'USR001' || !userId) {
        // Load data user detail
        setDataUser(dataTiruanUserDetail);
        setRiwayatTransaksi(dataTiruanTransaksi);
        setRiwayatAktivitas(dataTiruanAktivitas);
        
        setStatusHalaman({ 
          loading: false, 
          error: null, 
          success: 'Detail user berhasil dimuat' 
        });
        
        console.log(`Detail user ${userId} berhasil dimuat`);
      } else {
        // User tidak ditemukan
        setStatusHalaman({ 
          loading: false, 
          error: 'User tidak ditemukan', 
          success: null 
        });
        console.error(`User dengan ID ${userId} tidak ditemukan`);
      }
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal memuat detail user', 
        success: null 
      });
      console.error('Error loading user detail:', error);
    }
  };

  // Method untuk mengubah status user
  const ubahStatusUser = async (statusBaru: 'aktif' | 'nonaktif' | 'suspended'): Promise<void> => {
    try {
      setStatusHalaman({ loading: true, error: null, success: null });
      
      // Simulasi API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (dataUser) {
        const updatedUser = { ...dataUser, status: statusBaru };
        setDataUser(updatedUser);
        
        setStatusHalaman({ 
          loading: false, 
          error: null, 
          success: `Status user berhasil diubah menjadi ${statusBaru}` 
        });
        
        console.log(`Status user ${dataUser.nama} diubah menjadi ${statusBaru}`);
      }
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal mengubah status user', 
        success: null 
      });
      console.error('Error changing user status:', error);
    }
  };

  // Method untuk reset password user
  const resetPasswordUser = async (): Promise<void> => {
    try {
      setStatusHalaman({ loading: true, error: null, success: null });
      
      // Simulasi API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Password user berhasil direset. Email reset password telah dikirim.' 
      });
      
      console.log(`Password user ${dataUser?.nama} berhasil direset`);
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal mereset password user', 
        success: null 
      });
      console.error('Error resetting user password:', error);
    }
  };

  // Helper functions
  const formatTanggal = (tanggal: Date): string => {
    return tanggal.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTanggalSingkat = (tanggal: Date): string => {
    return tanggal.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatRupiah = (nilai: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(nilai);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'aktif': return 'text-green-600 bg-green-100';
      case 'nonaktif': return 'text-gray-600 bg-gray-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case 'admin': return 'text-purple-600 bg-purple-100';
      case 'dealer': return 'text-blue-600 bg-blue-100';
      case 'customer': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // useEffect untuk load data saat komponen dimount
  useEffect(() => {
    if (idUser) {
      muatHalamanDetailUser(idUser);
    } else {
      // Jika tidak ada ID user, gunakan default untuk testing
      muatHalamanDetailUser('USR001');
    }
  }, [idUser]);

  if (statusHalaman.loading) {
    return (
      <div className="halaman-detail-user">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-64 bg-gray-300 rounded"></div>
                <div className="md:col-span-2">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (statusHalaman.error && !dataUser) {
    return (
      <div className="halaman-detail-user">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-4">{statusHalaman.error}</div>
              <button
                onClick={() => navigate('/admin/users')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Kembali ke Daftar User
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="halaman-detail-user">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Detail User</h1>
              <p className="text-gray-600">Informasi lengkap pengguna sistem</p>
            </div>
            <button
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              ← Kembali
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {statusHalaman.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {statusHalaman.error}
          </div>
        )}

        {statusHalaman.success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {statusHalaman.success}
          </div>
        )}

        {dataUser && (
          <>
            {/* User Profile Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Picture & Basic Info */}
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gray-300 flex items-center justify-center mb-4">
                    <span className="text-4xl font-bold text-gray-700">
                      {dataUser.nama.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{dataUser.nama}</h2>
                  <div className="flex justify-center space-x-2 mb-4">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(dataUser.status)}`}>
                      {dataUser.status}
                    </span>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getRoleColor(dataUser.role)}`}>
                      {dataUser.role}
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <select
                      onChange={(e) => ubahStatusUser(e.target.value as 'aktif' | 'nonaktif' | 'suspended')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue=""
                    >
                      <option value="" disabled>Ubah Status</option>
                      <option value="aktif">Aktifkan</option>
                      <option value="nonaktif">Non-aktifkan</option>
                      <option value="suspended">Suspend</option>
                    </select>
                    
                    <button
                      onClick={resetPasswordUser}
                      disabled={statusHalaman.loading}
                      className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                    >
                      {statusHalaman.loading ? 'Processing...' : 'Reset Password'}
                    </button>
                  </div>
                </div>

                {/* User Details */}
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID User</label>
                      <p className="text-gray-900">{dataUser.id}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900">{dataUser.email}</p>
                      {dataUser.verifikasi?.email && (
                        <span className="text-green-600 text-sm">✓ Terverifikasi</span>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                      <p className="text-gray-900">{dataUser.telepon}</p>
                      {dataUser.verifikasi?.telepon && (
                        <span className="text-green-600 text-sm">✓ Terverifikasi</span>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Daftar</label>
                      <p className="text-gray-900">{formatTanggalSingkat(dataUser.tanggalDaftar)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Login Terakhir</label>
                      <p className="text-gray-900">{formatTanggal(dataUser.tanggalTerakhirLogin)}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Transaksi</label>
                      <p className="text-gray-900">{dataUser.totalTransaksi} transaksi</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                    <p className="text-gray-900">{dataUser.alamat}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{dataUser.totalTransaksi}</div>
                  <div className="text-sm text-gray-600">Total Transaksi</div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{formatRupiah(dataUser.nilaiTransaksi)}</div>
                  <div className="text-sm text-gray-600">Nilai Transaksi</div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{dataUser.ratingRataRata}/5</div>
                  <div className="text-sm text-gray-600">Rating Rata-rata</div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{dataUser.jumlahUlasan}</div>
                  <div className="text-sm text-gray-600">Jumlah Ulasan</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6">
                  {[
                    { id: 'info', label: 'Informasi Lengkap' },
                    { id: 'transaksi', label: 'Riwayat Transaksi' },
                    { id: 'aktivitas', label: 'Riwayat Aktivitas' },
                    { id: 'dokumen', label: 'Dokumen' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Tab: Informasi Lengkap */}
                {activeTab === 'info' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informasi Identitas */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Informasi Identitas</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">KTP</label>
                          <p className="text-gray-900">{dataUser.ktp || 'Belum diisi'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">SIM</label>
                          <p className="text-gray-900">{dataUser.sim || 'Belum diisi'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">NPWP</label>
                          <p className="text-gray-900">{dataUser.npwp || 'Belum diisi'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Informasi Bank */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Informasi Bank</h3>
                      {dataUser.bankAccount ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Bank</label>
                            <p className="text-gray-900">{dataUser.bankAccount.namaBank}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Nomor Rekening</label>
                            <p className="text-gray-900">{dataUser.bankAccount.nomorRekening}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Nama Rekening</label>
                            <p className="text-gray-900">{dataUser.bankAccount.namaRekening}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">Informasi bank belum diisi</p>
                      )}
                    </div>

                    {/* Preferensi Notifikasi */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Preferensi Notifikasi</h3>
                      {dataUser.preferences && (
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-2 ${dataUser.preferences.newsletter ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span>Newsletter</span>
                          </div>
                          <div className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-2 ${dataUser.preferences.smsNotification ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span>SMS Notification</span>
                          </div>
                          <div className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-2 ${dataUser.preferences.emailNotification ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span>Email Notification</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status Verifikasi */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Status Verifikasi</h3>
                      {dataUser.verifikasi && (
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-2 ${dataUser.verifikasi.email ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span>Email {dataUser.verifikasi.email ? 'Terverifikasi' : 'Belum Terverifikasi'}</span>
                          </div>
                          <div className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-2 ${dataUser.verifikasi.telepon ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span>Telepon {dataUser.verifikasi.telepon ? 'Terverifikasi' : 'Belum Terverifikasi'}</span>
                          </div>
                          <div className="flex items-center">
                            <span className={`w-3 h-3 rounded-full mr-2 ${dataUser.verifikasi.identitas ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span>Identitas {dataUser.verifikasi.identitas ? 'Terverifikasi' : 'Belum Terverifikasi'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab: Riwayat Transaksi */}
                {activeTab === 'transaksi' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Riwayat Transaksi</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ID Transaksi
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tanggal
                            </th>
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
                              Dealer
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {riwayatTransaksi.map((transaksi) => (
                            <tr key={transaksi.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {transaksi.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatTanggalSingkat(transaksi.tanggal)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {transaksi.jenisMobil}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatRupiah(transaksi.harga)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaksi.status)}`}>
                                  {transaksi.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {transaksi.dealer}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab: Riwayat Aktivitas */}
                {activeTab === 'aktivitas' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Riwayat Aktivitas</h3>
                    <div className="space-y-4">
                      {riwayatAktivitas.map((aktivitas) => (
                        <div key={aktivitas.id} className="border-l-4 border-blue-500 pl-4 py-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">{aktivitas.aktivitas}</h4>
                              <p className="text-sm text-gray-600">{aktivitas.detail}</p>
                              {aktivitas.ipAddress && (
                                <p className="text-xs text-gray-500">IP: {aktivitas.ipAddress}</p>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatTanggal(aktivitas.tanggal)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab: Dokumen */}
                {activeTab === 'dokumen' && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Dokumen User</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border border-gray-300 rounded-lg p-4 text-center">
                        <div className="text-gray-400 mb-2">
                          <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h4 className="font-medium">KTP</h4>
                        <p className="text-sm text-gray-600">
                          {dataUser.ktp ? 'Tersedia' : 'Belum diupload'}
                        </p>
                      </div>
                      
                      <div className="border border-gray-300 rounded-lg p-4 text-center">
                        <div className="text-gray-400 mb-2">
                          <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h4 className="font-medium">SIM</h4>
                        <p className="text-sm text-gray-600">
                          {dataUser.sim ? 'Tersedia' : 'Belum diupload'}
                        </p>
                      </div>
                      
                      <div className="border border-gray-300 rounded-lg p-4 text-center">
                        <div className="text-gray-400 mb-2">
                          <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h4 className="font-medium">NPWP</h4>
                        <p className="text-sm text-gray-600">
                          {dataUser.npwp ? 'Tersedia' : 'Belum diupload'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HalamanDetailUser;