import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Car, 
  User, 
  Phone, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Eye,
  Filter,
  Search,
  Download,
  RefreshCw,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { testDriveService, TestDriveWithDetails } from '../services/testDriveService';
import { supabase } from '../lib/supabase';

// Interface untuk statistik
interface TestDriveStats {
  totalRequests: number;
  pendingRequests: number;
  confirmedRequests: number;
  completedRequests: number;
  cancelledRequests: number;
  todayRequests: number;
}

// Interface untuk filter
interface TestDriveFilter {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  carBrand: string;
}

const HalamanJadwalTestDrive: React.FC = () => {
  // State management
  const [testDrives, setTestDrives] = useState<TestDriveWithDetails[]>([]);
  const [filteredTestDrives, setFilteredTestDrives] = useState<TestDriveWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TestDriveStats>({
    totalRequests: 0,
    pendingRequests: 0,
    confirmedRequests: 0,
    completedRequests: 0,
    cancelledRequests: 0,
    todayRequests: 0
  });

  // Filter state
  const [filter, setFilter] = useState<TestDriveFilter>({
    search: '',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    carBrand: ''
  });

  // Modal states
  const [selectedTestDrive, setSelectedTestDrive] = useState<TestDriveWithDetails | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Form states
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: '',
    newTime: '',
    reason: ''
  });
  const [rejectReason, setRejectReason] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load data
  useEffect(() => {
    loadTestDrives();
  }, []);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [testDrives, filter]);

  const loadTestDrives = async () => {
    setLoading(true);
    try {
      // Untuk admin, kita perlu mengambil semua test drive requests
      // Menggunakan supabase langsung untuk admin access
      const { data, error } = await supabase
        .from('test_drive_requests')
        .select(`
          *,
          cars (
            id,
            title,
            year,
            price,
            car_brands (name),
            car_models (name)
          ),
          users (
            id,
            full_name,
            email,
            phone_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading test drives:', error);
        console.error('Error details:', error);
        alert(`Gagal memuat data test drive: ${error.message}`);
        return;
      }

      console.log('Loaded test drives:', data);
      setTestDrives(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: TestDriveWithDetails[]) => {
    const today = new Date().toDateString();
    
    const stats: TestDriveStats = {
      totalRequests: data.length,
      pendingRequests: data.filter(td => td.status === 'pending').length,
      confirmedRequests: data.filter(td => td.status === 'confirmed').length,
      completedRequests: data.filter(td => td.status === 'completed').length,
      cancelledRequests: data.filter(td => td.status === 'cancelled').length,
      todayRequests: data.filter(td => new Date(td.scheduled_date).toDateString() === today).length
    };

    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...testDrives];

    // Search filter
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(td => 
        td.users?.full_name?.toLowerCase().includes(searchTerm) ||
        td.users?.email?.toLowerCase().includes(searchTerm) ||
        td.cars?.title?.toLowerCase().includes(searchTerm) ||
        td.cars?.car_brands?.name?.toLowerCase().includes(searchTerm) ||
        td.cars?.car_models?.name?.toLowerCase().includes(searchTerm)
      );
    }

    // Status filter
    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter(td => td.status === filter.status);
    }

    // Date range filter
    if (filter.dateFrom) {
      filtered = filtered.filter(td => 
        new Date(td.scheduled_date) >= new Date(filter.dateFrom)
      );
    }

    if (filter.dateTo) {
      filtered = filtered.filter(td => 
        new Date(td.scheduled_date) <= new Date(filter.dateTo)
      );
    }

    // Car brand filter
    if (filter.carBrand) {
      filtered = filtered.filter(td => 
        td.cars?.car_brands?.name === filter.carBrand
      );
    }

    setFilteredTestDrives(filtered);
    setCurrentPage(1);
  };

  const handleApprove = async (testDriveId: string) => {
    try {
      const { error } = await supabase
        .from('test_drive_requests')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
          confirmed_by: 'admin' // Dalam implementasi nyata, gunakan user ID admin
        })
        .eq('id', testDriveId);

      if (error) {
        console.error('Error approving test drive:', error);
        alert('Gagal menyetujui test drive');
        return;
      }

      alert('Test drive berhasil disetujui');
      loadTestDrives();
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan');
    }
  };

  const handleReject = async () => {
    if (!selectedTestDrive || !rejectReason.trim()) {
      alert('Alasan penolakan harus diisi');
      return;
    }

    try {
      const { error } = await supabase
        .from('test_drive_requests')
        .update({
          status: 'cancelled',
          rejection_reason: rejectReason,
          cancelled_at: new Date().toISOString()
        })
        .eq('id', selectedTestDrive.id);

      if (error) {
        console.error('Error rejecting test drive:', error);
        alert('Gagal menolak test drive');
        return;
      }

      alert('Test drive berhasil ditolak');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedTestDrive(null);
      loadTestDrives();
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan');
    }
  };

  const handleReschedule = async () => {
    if (!selectedTestDrive || !rescheduleForm.newDate || !rescheduleForm.newTime) {
      alert('Tanggal dan waktu baru harus diisi');
      return;
    }

    try {
      const { error } = await supabase
        .from('test_drive_requests')
        .update({
          status: 'rescheduled',
          scheduled_date: rescheduleForm.newDate,
          scheduled_time: rescheduleForm.newTime,
          user_notes: rescheduleForm.reason
        })
        .eq('id', selectedTestDrive.id);

      if (error) {
        console.error('Error rescheduling test drive:', error);
        alert('Gagal mengubah jadwal test drive');
        return;
      }

      alert('Jadwal test drive berhasil diubah');
      setShowRescheduleModal(false);
      setRescheduleForm({ newDate: '', newTime: '', reason: '' });
      setSelectedTestDrive(null);
      loadTestDrives();
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Dikonfirmasi', color: 'bg-green-100 text-green-800' },
      rescheduled: { label: 'Dijadwal Ulang', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Selesai', color: 'bg-gray-100 text-gray-800' },
      cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800' },
      no_show: { label: 'Tidak Hadir', color: 'bg-orange-100 text-orange-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Pagination
  const totalPages = Math.ceil(filteredTestDrives.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTestDrives = filteredTestDrives.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Test Drive</h1>
            <p className="text-gray-600 mt-1">Kelola jadwal dan permohonan test drive mobil</p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={loadTestDrives}
              variant="outline"
              className="flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button className="flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Menunggu</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dikonfirmasi</p>
                  <p className="text-2xl font-bold text-green-600">{stats.confirmedRequests}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Selesai</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.completedRequests}</p>
                </div>
                <Car className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dibatalkan</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelledRequests}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hari Ini</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.todayRequests}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filter & Pencarian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="search">Pencarian</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Cari nama, email, mobil..."
                      value={filter.search}
                      onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={filter.status}
                    onValueChange={(value) => setFilter(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Semua Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      <SelectItem value="pending">Menunggu</SelectItem>
                      <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                      <SelectItem value="rescheduled">Dijadwal Ulang</SelectItem>
                      <SelectItem value="completed">Selesai</SelectItem>
                      <SelectItem value="cancelled">Dibatalkan</SelectItem>
                      <SelectItem value="no_show">Tidak Hadir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dateFrom">Dari Tanggal</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filter.dateFrom}
                    onChange={(e) => setFilter(prev => ({ ...prev, dateFrom: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="dateTo">Sampai Tanggal</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filter.dateTo}
                    onChange={(e) => setFilter(prev => ({ ...prev, dateTo: e.target.value }))}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={() => setFilter({
                      search: '',
                      status: 'all',
                      dateFrom: '',
                      dateTo: '',
                      carBrand: ''
                    })}
                    variant="outline"
                    className="w-full"
                  >
                    Reset Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Test Drive List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Daftar Test Drive</CardTitle>
                <div className="text-sm text-gray-600">
                  Menampilkan {startIndex + 1} - {Math.min(endIndex, filteredTestDrives.length)} dari {filteredTestDrives.length} data
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Memuat data...</span>
                </div>
              ) : currentTestDrives.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Tidak ada data test drive</p>
                  <p className="text-gray-500 text-sm">Belum ada permohonan test drive yang masuk</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Mobil</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Jadwal</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentTestDrives.map((testDrive, index) => (
                          <motion.tr
                            key={testDrive.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {testDrive.users?.full_name || 'N/A'}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {testDrive.users?.email}
                                  </div>
                                  {testDrive.users?.phone_number && (
                                    <div className="text-sm text-gray-600 flex items-center">
                                      <Phone className="w-3 h-3 mr-1" />
                                      {testDrive.users.phone_number}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {testDrive.cars?.car_brands?.name} {testDrive.cars?.car_models?.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {testDrive.cars?.year} • {formatCurrency(testDrive.cars?.price || 0)}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {formatDate(testDrive.scheduled_date)}
                                </div>
                                <div className="text-sm text-gray-600 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {testDrive.scheduled_time}
                                </div>
                                {testDrive.location_address && (
                                  <div className="text-sm text-gray-600 flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {testDrive.location_address}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {getStatusBadge(testDrive.status)}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedTestDrive(testDrive);
                                    setShowDetailModal(true);
                                  }}
                                  title="Lihat Detail"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                
                                {testDrive.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleApprove(testDrive.id)}
                                      className="bg-green-600 hover:bg-green-700"
                                      title="Setujui"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedTestDrive(testDrive);
                                        setShowRescheduleModal(true);
                                      }}
                                      title="Jadwal Ulang"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedTestDrive(testDrive);
                                        setShowRejectModal(true);
                                      }}
                                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                                      title="Tolak"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                      <div className="text-sm text-gray-600">
                        Halaman {currentPage} dari {totalPages}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          Sebelumnya
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          Selanjutnya
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Test Drive</DialogTitle>
          </DialogHeader>
          {selectedTestDrive && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Informasi Customer</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Nama:</span> {selectedTestDrive.users?.full_name}</p>
                    <p><span className="text-gray-600">Email:</span> {selectedTestDrive.users?.email}</p>
                    <p><span className="text-gray-600">Telepon:</span> {selectedTestDrive.users?.phone_number || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Informasi Mobil</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Mobil:</span> {selectedTestDrive.cars?.car_brands?.name} {selectedTestDrive.cars?.car_models?.name}</p>
                    <p><span className="text-gray-600">Tahun:</span> {selectedTestDrive.cars?.year}</p>
                    <p><span className="text-gray-600">Harga:</span> {formatCurrency(selectedTestDrive.cars?.price || 0)}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Detail Jadwal</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p><span className="text-gray-600">Tanggal:</span> {formatDate(selectedTestDrive.scheduled_date)}</p>
                  <p><span className="text-gray-600">Waktu:</span> {selectedTestDrive.scheduled_time}</p>
                  <p><span className="text-gray-600">Durasi:</span> {selectedTestDrive.duration_minutes} menit</p>
                  <p><span className="text-gray-600">Status:</span> {getStatusBadge(selectedTestDrive.status)}</p>
                </div>
              </div>

              {selectedTestDrive.location_address && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Lokasi</h3>
                  <p className="text-sm text-gray-600">{selectedTestDrive.location_address}</p>
                </div>
              )}

              {selectedTestDrive.user_notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Catatan Customer</h3>
                  <p className="text-sm text-gray-600">{selectedTestDrive.user_notes}</p>
                </div>
              )}

              {selectedTestDrive.rejection_reason && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Alasan Penolakan</h3>
                  <p className="text-sm text-red-600">{selectedTestDrive.rejection_reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reschedule Modal */}
      <Dialog open={showRescheduleModal} onOpenChange={setShowRescheduleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Jadwal Ulang Test Drive</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newDate">Tanggal Baru</Label>
              <Input
                id="newDate"
                type="date"
                value={rescheduleForm.newDate}
                onChange={(e) => setRescheduleForm(prev => ({ ...prev, newDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="newTime">Waktu Baru</Label>
              <Input
                id="newTime"
                type="time"
                value={rescheduleForm.newTime}
                onChange={(e) => setRescheduleForm(prev => ({ ...prev, newTime: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="reason">Alasan Perubahan</Label>
              <Textarea
                id="reason"
                placeholder="Masukkan alasan perubahan jadwal..."
                value={rescheduleForm.reason}
                onChange={(e) => setRescheduleForm(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRescheduleModal(false);
                  setRescheduleForm({ newDate: '', newTime: '', reason: '' });
                }}
              >
                Batal
              </Button>
              <Button onClick={handleReschedule}>
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Test Drive</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectReason">Alasan Penolakan</Label>
              <Textarea
                id="rejectReason"
                placeholder="Masukkan alasan penolakan..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
              >
                Batal
              </Button>
              <Button
                onClick={handleReject}
                className="bg-red-600 hover:bg-red-700"
              >
                Tolak Test Drive
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HalamanJadwalTestDrive;