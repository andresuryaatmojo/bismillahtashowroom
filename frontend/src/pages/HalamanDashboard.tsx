import React, { useState } from 'react';
import { Card, CardBody, CardHeader, Button, Avatar, Chip, Progress } from '@nextui-org/react';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const [user] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'buyer',
    avatar: 'https://i.pravatar.cc/150?u=john'
  });

  const stats = [
    { title: 'Mobil Favorit', value: '12', color: 'primary' },
    { title: 'Transaksi', value: '3', color: 'success' },
    { title: 'Test Drive', value: '5', color: 'warning' },
    { title: 'Ulasan', value: '8', color: 'secondary' }
  ];

  const recentActivities = [
    { action: 'Menambahkan ke wishlist', item: 'Toyota Avanza 2023', time: '2 jam lalu' },
    { action: 'Booking test drive', item: 'Honda Civic 2022', time: '1 hari lalu' },
    { action: 'Memberikan ulasan', item: 'Mitsubishi Xpander', time: '3 hari lalu' },
    { action: 'Mengirim pesan', item: 'Dealer Toyota Jakarta', time: '1 minggu lalu' }
  ];

  const quickActions = [
    { title: 'Cari Mobil', description: 'Temukan mobil impian Anda', icon: '🔍', color: 'primary' },
    { title: 'Wishlist', description: 'Lihat mobil favorit', icon: '❤️', color: 'danger' },
    { title: 'Test Drive', description: 'Jadwalkan test drive', icon: '🚗', color: 'success' },
    { title: 'Pesan', description: 'Chat dengan penjual', icon: '💬', color: 'warning' }
  ];

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
              <p className="text-gray-600 mt-1">Selamat datang kembali, {user.name}!</p>
            </div>
            <Avatar
              src={user.avatar}
              size="lg"
              className="border-4 border-white shadow-lg"
            />
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
                  <Chip color={stat.color as any} variant="flat" size="lg">
                    +12%
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
          </motion.div>

          {/* Profile Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <h3 className="text-xl font-semibold">Profil Saya</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="text-center">
                  <Avatar
                    src={user.avatar}
                    size="lg"
                    className="mx-auto mb-3"
                  />
                  <h4 className="font-semibold text-lg">{user.name}</h4>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                  <Chip color="primary" variant="flat" size="sm" className="mt-2">
                    {user.role === 'buyer' ? 'Pembeli' : 'Penjual'}
                  </Chip>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Kelengkapan Profil</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} color="primary" size="sm" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tingkat Kepercayaan</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} color="success" size="sm" />
                  </div>
                </div>
                
                <Button color="primary" variant="flat" className="w-full">
                  Edit Profil
                </Button>
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
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.item}</p>
                    </div>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                ))}
              </div>
              <Button variant="flat" color="primary" className="w-full mt-4">
                Lihat Semua Aktivitas
              </Button>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;