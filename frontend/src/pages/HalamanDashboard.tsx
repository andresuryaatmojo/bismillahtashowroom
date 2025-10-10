import React from 'react';
import { Card, CardBody, CardHeader, Button, Avatar, Chip, Progress } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const HalamanDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  // Stats berdasarkan data user real
  const stats = [
    { 
      title: 'Level User', 
      value: user.user_level.toUpperCase(), 
      color: 'primary',
      change: user.user_level === 'bronze' ? 'Pemula' : 'Aktif'
    },
    { 
      title: 'Total Transaksi', 
      value: user.total_transactions.toString(), 
      color: 'success',
      change: 'Transaksi'
    },
    { 
      title: 'Rating Pembeli', 
      value: user.buyer_rating.toFixed(1), 
      color: 'warning',
      change: '⭐ Bintang'
    },
    { 
      title: 'Status Akun', 
      value: user.account_status === 'active' ? 'Aktif' : 'Nonaktif', 
      color: user.account_status === 'active' ? 'success' : 'danger',
      change: user.is_verified ? 'Terverifikasi' : 'Belum Verifikasi'
    }
  ];

  // Recent activities (dummy data - nanti akan dari database)
  const recentActivities = [
    { 
      action: 'Akun berhasil dibuat', 
      item: 'Selamat bergabung dengan Mobilindo!', 
      time: new Date(user.registered_at).toLocaleDateString('id-ID')
    },
    { 
      action: 'Login terakhir', 
      item: user.last_login ? 'Kembali ke dashboard' : 'Pertama kali login', 
      time: user.last_login ? new Date(user.last_login).toLocaleDateString('id-ID') : 'Hari ini'
    },
    { 
      action: 'Mode saat ini', 
      item: user.current_mode === 'buyer' ? 'Mode Pembeli' : 'Mode Penjual', 
      time: 'Aktif'
    },
  ];

  // Quick actions
  const quickActions = [
    { 
      title: 'Cari Mobil', 
      description: 'Temukan mobil impian Anda', 
      icon: '🔍', 
      color: 'primary',
      onClick: () => navigate('/katalog')
    },
    { 
      title: 'Wishlist', 
      description: 'Lihat mobil favorit', 
      icon: '❤️', 
      color: 'danger',
      onClick: () => navigate('/wishlist')
    },
    { 
      title: 'Test Drive', 
      description: 'Jadwalkan test drive', 
      icon: '🚗', 
      color: 'success',
      onClick: () => navigate('/test-drive')
    },
    { 
      title: 'Pesan', 
      description: 'Chat dengan penjual', 
      icon: '💬', 
      color: 'warning',
      onClick: () => navigate('/chat')
    }
  ];

  // Hitung progress profil
  const calculateProfileCompletion = () => {
    let completed = 0;
    const fields = [
      user.full_name,
      user.email,
      user.username,
      user.phone_number,
      user.address,
      user.city,
      user.province,
      user.profile_picture
    ];
    
    fields.forEach(field => {
      if (field && field.trim() !== '') completed++;
    });
    
    return Math.round((completed / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  // Handle logout
  const handleLogout = async () => {
    const confirmLogout = window.confirm('Apakah Anda yakin ingin keluar?');
    if (confirmLogout) {
      await logout();
      navigate('/login', { replace: true });
    }
  };

  // Handle switch mode
  const handleSwitchMode = () => {
    const newMode = user.current_mode === 'buyer' ? 'seller' : 'buyer';
    alert(`🔄 Fitur switch mode akan segera tersedia!\nMode baru: ${newMode === 'buyer' ? 'Pembeli' : 'Penjual'}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Selamat datang kembali, <span className="font-semibold">{user.full_name}</span>!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right mr-3">
                <p className="text-sm font-semibold text-gray-900">@{user.username}</p>
                <Chip 
                  size="sm" 
                  color={user.current_mode === 'buyer' ? 'primary' : 'success'}
                  variant="flat"
                >
                  {user.current_mode === 'buyer' ? 'Pembeli' : 'Penjual'}
                </Chip>
              </div>
              <Avatar
                src={user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=0D8ABC&color=fff`}
                size="lg"
                className="border-4 border-white shadow-lg"
              />
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-lg">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <Chip color={stat.color as any} variant="flat" size="sm">
                    {stat.change}
                  </Chip>
                </div>
              </CardBody>
            </Card>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-lg">
              <CardHeader>
                <h3 className="text-xl font-semibold">Aksi Cepat</h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="flat"
                      color={action.color as any}
                      size="lg"
                      className="h-20 flex-col justify-center"
                      startContent={<span className="text-2xl">{action.icon}</span>}
                      onClick={action.onClick}
                    >
                      <div className="text-center">
                        <p className="font-semibold">{action.title}</p>
                        <p className="text-xs opacity-70">{action.description}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* User Info Card */}
            <Card className="shadow-lg mt-6">
              <CardHeader>
                <h3 className="text-xl font-semibold">Informasi Akun</h3>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Username</p>
                      <p className="font-semibold">@{user.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nomor Telepon</p>
                      <p className="font-semibold">{user.phone_number || 'Belum diisi'}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Role</p>
                      <Chip color="primary" variant="flat" size="sm">
                        {user.role.toUpperCase()}
                      </Chip>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Bergabung Sejak</p>
                      <p className="font-semibold">
                        {new Date(user.registered_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status Verifikasi</p>
                      <Chip 
                        color={user.is_verified ? 'success' : 'warning'} 
                        variant="flat" 
                        size="sm"
                      >
                        {user.is_verified ? '✓ Terverifikasi' : '⚠ Belum Verifikasi'}
                      </Chip>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Profile Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            <Card className="shadow-lg">
              <CardHeader>
                <h3 className="text-xl font-semibold">Profil Saya</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="text-center">
                  <Avatar
                    src={user.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=0D8ABC&color=fff&size=128`}
                    size="lg"
                    className="mx-auto mb-3 w-24 h-24"
                  />
                  <h4 className="font-semibold text-lg">{user.full_name}</h4>
                  <p className="text-gray-600 text-sm">@{user.username}</p>
                  <p className="text-gray-500 text-xs mt-1">{user.email}</p>
                  <Chip color="primary" variant="flat" size="sm" className="mt-2">
                    {user.current_mode === 'buyer' ? '🛒 Pembeli' : '🏪 Penjual'}
                  </Chip>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Kelengkapan Profil</span>
                      <span>{profileCompletion}%</span>
                    </div>
                    <Progress 
                      value={profileCompletion} 
                      color={profileCompletion >= 80 ? 'success' : profileCompletion >= 50 ? 'warning' : 'danger'} 
                      size="sm" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Rating Pembeli</span>
                      <span>{user.buyer_rating.toFixed(1)} ⭐</span>
                    </div>
                    <Progress 
                      value={(user.buyer_rating / 5) * 100} 
                      color="warning" 
                      size="sm" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    color="primary" 
                    variant="flat" 
                    className="w-full"
                    onClick={() => navigate('/profil')}
                  >
                    Edit Profil
                  </Button>
                  
                  <Button 
                    color="secondary" 
                    variant="bordered" 
                    className="w-full"
                    onClick={handleSwitchMode}
                  >
                    🔄 Switch Mode
                  </Button>
                  
                  <Button 
                    color="danger" 
                    variant="light" 
                    className="w-full"
                    onClick={handleLogout}
                  >
                    🚪 Keluar
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
        >
          <Card className="shadow-lg">
            <CardHeader>
              <h3 className="text-xl font-semibold">Aktivitas Terbaru</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.item}</p>
                    </div>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                ))}
              </div>
              <Button 
                variant="flat" 
                color="primary" 
                className="w-full mt-4"
                onClick={() => navigate('/riwayat')}
              >
                Lihat Semua Aktivitas
              </Button>
            </CardBody>
          </Card>
        </motion.div>

        {/* Debug Info (Remove in production) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8"
        >
          <Card className="shadow-lg bg-gray-50">
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-600">Debug Info (Development Only)</h3>
            </CardHeader>
            <CardBody>
              <pre className="text-xs bg-white p-4 rounded border overflow-x-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default HalamanDashboard;