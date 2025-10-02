import React, { useState, useEffect } from 'react';
import './HalamanKelolaUser.css';

// Interface untuk data user
interface DataUser {
  id: string;
  nama: string;
  email: string;
  telepon: string;
  alamat: string;
  tanggalDaftar: Date;
  status: 'aktif' | 'nonaktif' | 'suspended';
  role: 'customer' | 'dealer' | 'admin';
  totalTransaksi: number;
  nilaiTransaksi: number;
  ratingRataRata: number;
  jumlahUlasan: number;
  fotoProfile?: string;
}

// Interface untuk status halaman
interface StatusHalaman {
  loading: boolean;
  error: string | null;
  success: string | null;
}

// Interface untuk filter pencarian
interface FilterPencarian {
  kataKunci: string;
  status: string;
  role: string;
  tanggalDari: string;
  tanggalSampai: string;
}

const HalamanKelolaUser: React.FC = () => {
  // State management
  const [statusHalaman, setStatusHalaman] = useState<StatusHalaman>({
    loading: false,
    error: null,
    success: null
  });

  const [daftarUser, setDaftarUser] = useState<DataUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DataUser[]>([]);
  const [userTerpilih, setUserTerpilih] = useState<DataUser | null>(null);
  const [showModalHapus, setShowModalHapus] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [filterPencarian, setFilterPencarian] = useState<FilterPencarian>({
    kataKunci: '',
    status: '',
    role: '',
    tanggalDari: '',
    tanggalSampai: ''
  });

  // Data tiruan untuk testing
  const dataTiruanUser: DataUser[] = [
    {
      id: 'USR001',
      nama: 'Ahmad Wijaya',
      email: 'ahmad.wijaya@email.com',
      telepon: '081234567890',
      alamat: 'Jl. Sudirman No. 123, Jakarta',
      tanggalDaftar: new Date('2023-01-15'),
      status: 'aktif',
      role: 'customer',
      totalTransaksi: 3,
      nilaiTransaksi: 450000000,
      ratingRataRata: 4.5,
      jumlahUlasan: 2,
      fotoProfile: '/images/profile1.jpg'
    },
    {
      id: 'USR002',
      nama: 'Sari Indah',
      email: 'sari.indah@email.com',
      telepon: '081234567891',
      alamat: 'Jl. Thamrin No. 456, Jakarta',
      tanggalDaftar: new Date('2023-02-20'),
      status: 'aktif',
      role: 'dealer',
      totalTransaksi: 15,
      nilaiTransaksi: 2500000000,
      ratingRataRata: 4.8,
      jumlahUlasan: 12,
      fotoProfile: '/images/profile2.jpg'
    },
    {
      id: 'USR003',
      nama: 'Budi Santoso',
      email: 'budi.santoso@email.com',
      telepon: '081234567892',
      alamat: 'Jl. Gatot Subroto No. 789, Jakarta',
      tanggalDaftar: new Date('2023-03-10'),
      status: 'suspended',
      role: 'customer',
      totalTransaksi: 1,
      nilaiTransaksi: 150000000,
      ratingRataRata: 2.0,
      jumlahUlasan: 1,
      fotoProfile: '/images/profile3.jpg'
    },
    {
      id: 'USR004',
      nama: 'Lisa Permata',
      email: 'lisa.permata@email.com',
      telepon: '081234567893',
      alamat: 'Jl. Kuningan No. 321, Jakarta',
      tanggalDaftar: new Date('2023-04-05'),
      status: 'nonaktif',
      role: 'customer',
      totalTransaksi: 0,
      nilaiTransaksi: 0,
      ratingRataRata: 0,
      jumlahUlasan: 0
    },
    {
      id: 'USR005',
      nama: 'Admin System',
      email: 'admin@mobilindo.com',
      telepon: '081234567894',
      alamat: 'Kantor Pusat Mobilindo',
      tanggalDaftar: new Date('2022-01-01'),
      status: 'aktif',
      role: 'admin',
      totalTransaksi: 0,
      nilaiTransaksi: 0,
      ratingRataRata: 0,
      jumlahUlasan: 0
    }
  ];

  // Method: aksesMenuKelolaUser
  const aksesMenuKelolaUser = async (): Promise<void> => {
    try {
      setStatusHalaman({ loading: true, error: null, success: null });
      
      // Simulasi API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load data user
      setDaftarUser(dataTiruanUser);
      setFilteredUsers(dataTiruanUser);
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Data user berhasil dimuat' 
      });
      
      console.log('Menu Kelola User diakses, data user dimuat');
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal memuat data user', 
        success: null 
      });
      console.error('Error accessing user management menu:', error);
    }
  };

  // Method: pilihAksiEdit
  const pilihAksiEdit = (idUser: string): void => {
    try {
      const user = daftarUser.find(u => u.id === idUser);
      if (user) {
        setUserTerpilih(user);
        setShowModalEdit(true);
        console.log(`Aksi edit dipilih untuk user: ${user.nama}`);
      } else {
        setStatusHalaman({ 
          loading: false, 
          error: 'User tidak ditemukan', 
          success: null 
        });
      }
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal memilih aksi edit', 
        success: null 
      });
      console.error('Error selecting edit action:', error);
    }
  };

  // Method: konfirmasiHapusData
  const konfirmasiHapusData = (idUser: string): void => {
    try {
      const user = daftarUser.find(u => u.id === idUser);
      if (user) {
        setUserTerpilih(user);
        setShowModalHapus(true);
        console.log(`Konfirmasi hapus data untuk user: ${user.nama}`);
      } else {
        setStatusHalaman({ 
          loading: false, 
          error: 'User tidak ditemukan', 
          success: null 
        });
      }
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal menampilkan konfirmasi hapus', 
        success: null 
      });
      console.error('Error showing delete confirmation:', error);
    }
  };

  // Method: masukkanKataKunci
  const masukkanKataKunci = (kataKunci: string): void => {
    try {
      setFilterPencarian(prev => ({ ...prev, kataKunci }));
      
      // Filter data berdasarkan kata kunci
      const filtered = daftarUser.filter(user => 
        user.nama.toLowerCase().includes(kataKunci.toLowerCase()) ||
        user.email.toLowerCase().includes(kataKunci.toLowerCase()) ||
        user.telepon.includes(kataKunci) ||
        user.id.toLowerCase().includes(kataKunci.toLowerCase())
      );
      
      setFilteredUsers(filtered);
      console.log(`Pencarian dengan kata kunci: "${kataKunci}", ditemukan ${filtered.length} user`);
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal melakukan pencarian', 
        success: null 
      });
      console.error('Error searching users:', error);
    }
  };

  // Method: pilihLihatDetail
  const pilihLihatDetail = (idUser: string): void => {
    try {
      const user = daftarUser.find(u => u.id === idUser);
      if (user) {
        // Redirect ke halaman detail user
        console.log(`Navigasi ke detail user: ${user.nama}`);
        // Dalam implementasi nyata, gunakan router untuk navigasi
        // navigate(`/admin/users/${idUser}/detail`);
        
        setStatusHalaman({ 
          loading: false, 
          error: null, 
          success: `Membuka detail user ${user.nama}` 
        });
      } else {
        setStatusHalaman({ 
          loading: false, 
          error: 'User tidak ditemukan', 
          success: null 
        });
      }
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal membuka detail user', 
        success: null 
      });
      console.error('Error viewing user detail:', error);
    }
  };

  // Method untuk menangani edit user
  const handleEditUser = async (userData: Partial<DataUser>): Promise<void> => {
    try {
      setStatusHalaman({ loading: true, error: null, success: null });
      
      // Simulasi API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update data user
      const updatedUsers = daftarUser.map(user => 
        user.id === userTerpilih?.id ? { ...user, ...userData } : user
      );
      
      setDaftarUser(updatedUsers);
      setFilteredUsers(updatedUsers);
      setShowModalEdit(false);
      setUserTerpilih(null);
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'Data user berhasil diperbarui' 
      });
      
      console.log('Data user berhasil diperbarui:', userData);
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal memperbarui data user', 
        success: null 
      });
      console.error('Error updating user:', error);
    }
  };

  // Method untuk menangani hapus user
  const handleHapusUser = async (): Promise<void> => {
    try {
      if (!userTerpilih) return;
      
      setStatusHalaman({ loading: true, error: null, success: null });
      
      // Simulasi API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Hapus user dari daftar
      const updatedUsers = daftarUser.filter(user => user.id !== userTerpilih.id);
      
      setDaftarUser(updatedUsers);
      setFilteredUsers(updatedUsers);
      setShowModalHapus(false);
      setUserTerpilih(null);
      
      setStatusHalaman({ 
        loading: false, 
        error: null, 
        success: 'User berhasil dihapus' 
      });
      
      console.log('User berhasil dihapus:', userTerpilih.nama);
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal menghapus user', 
        success: null 
      });
      console.error('Error deleting user:', error);
    }
  };

  // Method untuk filter lanjutan
  const applyAdvancedFilter = (): void => {
    try {
      let filtered = daftarUser;
      
      // Filter berdasarkan kata kunci
      if (filterPencarian.kataKunci) {
        filtered = filtered.filter(user => 
          user.nama.toLowerCase().includes(filterPencarian.kataKunci.toLowerCase()) ||
          user.email.toLowerCase().includes(filterPencarian.kataKunci.toLowerCase()) ||
          user.telepon.includes(filterPencarian.kataKunci) ||
          user.id.toLowerCase().includes(filterPencarian.kataKunci.toLowerCase())
        );
      }
      
      // Filter berdasarkan status
      if (filterPencarian.status) {
        filtered = filtered.filter(user => user.status === filterPencarian.status);
      }
      
      // Filter berdasarkan role
      if (filterPencarian.role) {
        filtered = filtered.filter(user => user.role === filterPencarian.role);
      }
      
      // Filter berdasarkan tanggal
      if (filterPencarian.tanggalDari) {
        const tanggalDari = new Date(filterPencarian.tanggalDari);
        filtered = filtered.filter(user => user.tanggalDaftar >= tanggalDari);
      }
      
      if (filterPencarian.tanggalSampai) {
        const tanggalSampai = new Date(filterPencarian.tanggalSampai);
        filtered = filtered.filter(user => user.tanggalDaftar <= tanggalSampai);
      }
      
      setFilteredUsers(filtered);
      console.log(`Filter diterapkan, ditemukan ${filtered.length} user`);
    } catch (error) {
      setStatusHalaman({ 
        loading: false, 
        error: 'Gagal menerapkan filter', 
        success: null 
      });
      console.error('Error applying filter:', error);
    }
  };

  // Helper functions
  const formatTanggal = (tanggal: Date): string => {
    return tanggal.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
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
    aksesMenuKelolaUser();
  }, []);

  // useEffect untuk apply filter saat filter berubah
  useEffect(() => {
    applyAdvancedFilter();
  }, [filterPencarian.status, filterPencarian.role, filterPencarian.tanggalDari, filterPencarian.tanggalSampai]);

  return (
    <div className="halaman-kelola-user">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Kelola User</h1>
          <p className="text-gray-600">Kelola data pengguna sistem Mobilindo Showroom</p>
        </div>

        {/* Status Messages */}
        {statusHalaman.loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
              Memproses...
            </div>
          </div>
        )}

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

        {/* Filter dan Pencarian */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Filter & Pencarian</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Pencarian Kata Kunci */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kata Kunci
              </label>
              <input
                type="text"
                value={filterPencarian.kataKunci}
                onChange={(e) => masukkanKataKunci(e.target.value)}
                placeholder="Nama, email, telepon, ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterPencarian.status}
                onChange={(e) => setFilterPencarian(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Non-aktif</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {/* Filter Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={filterPencarian.role}
                onChange={(e) => setFilterPencarian(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Role</option>
                <option value="customer">Customer</option>
                <option value="dealer">Dealer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Filter Tanggal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Daftar
              </label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={filterPencarian.tanggalDari}
                  onChange={(e) => setFilterPencarian(prev => ({ ...prev, tanggalDari: e.target.value }))}
                  className="flex-1 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="date"
                  value={filterPencarian.tanggalSampai}
                  onChange={(e) => setFilterPencarian(prev => ({ ...prev, tanggalSampai: e.target.value }))}
                  className="flex-1 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Statistik */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredUsers.length}</div>
              <div className="text-sm text-gray-600">Total User</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredUsers.filter(u => u.status === 'aktif').length}
              </div>
              <div className="text-sm text-gray-600">User Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredUsers.filter(u => u.role === 'dealer').length}
              </div>
              <div className="text-sm text-gray-600">Dealer</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {filteredUsers.filter(u => u.role === 'customer').length}
              </div>
              <div className="text-sm text-gray-600">Customer</div>
            </div>
          </div>
        </div>

        {/* Tabel User */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kontak
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktivitas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Daftar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.nama.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.nama}</div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.telepon}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>Transaksi: {user.totalTransaksi}</div>
                      <div>Nilai: {formatRupiah(user.nilaiTransaksi)}</div>
                      {user.jumlahUlasan > 0 && (
                        <div>Rating: {user.ratingRataRata}/5 ({user.jumlahUlasan} ulasan)</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTanggal(user.tanggalDaftar)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => pilihLihatDetail(user.id)}
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded border border-blue-600 hover:bg-blue-50"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => pilihAksiEdit(user.id)}
                          className="text-green-600 hover:text-green-900 px-2 py-1 rounded border border-green-600 hover:bg-green-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => konfirmasiHapusData(user.id)}
                          className="text-red-600 hover:text-red-900 px-2 py-1 rounded border border-red-600 hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500">Tidak ada user yang ditemukan</div>
            </div>
          )}
        </div>

        {/* Modal Edit User */}
        {showModalEdit && userTerpilih && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Edit User: {userTerpilih.nama}
                </h3>
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const userData = {
                    nama: formData.get('nama') as string,
                    email: formData.get('email') as string,
                    telepon: formData.get('telepon') as string,
                    alamat: formData.get('alamat') as string,
                    status: formData.get('status') as 'aktif' | 'nonaktif' | 'suspended',
                    role: formData.get('role') as 'customer' | 'dealer' | 'admin'
                  };
                  handleEditUser(userData);
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama
                      </label>
                      <input
                        type="text"
                        name="nama"
                        defaultValue={userTerpilih.nama}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        defaultValue={userTerpilih.email}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telepon
                      </label>
                      <input
                        type="tel"
                        name="telepon"
                        defaultValue={userTerpilih.telepon}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        defaultValue={userTerpilih.status}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Non-aktif</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <select
                        name="role"
                        defaultValue={userTerpilih.role}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="customer">Customer</option>
                        <option value="dealer">Dealer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat
                    </label>
                    <textarea
                      name="alamat"
                      defaultValue={userTerpilih.alamat}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModalEdit(false);
                        setUserTerpilih(null);
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={statusHalaman.loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {statusHalaman.loading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Konfirmasi Hapus */}
        {showModalHapus && userTerpilih && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mt-2">Konfirmasi Hapus</h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Apakah Anda yakin ingin menghapus user <strong>{userTerpilih.nama}</strong>?
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
                <div className="flex justify-center space-x-3 mt-4">
                  <button
                    onClick={() => {
                      setShowModalHapus(false);
                      setUserTerpilih(null);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleHapusUser}
                    disabled={statusHalaman.loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {statusHalaman.loading ? 'Menghapus...' : 'Hapus'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HalamanKelolaUser;