import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { carService } from '../services/carService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Search, Filter, Eye, CheckCircle, XCircle, Loader2, AlertCircle, 
  ArrowLeft, Clock, User, DollarSign, Package, FileText, Phone, Mail,
  MapPin, Calendar, Car
} from 'lucide-react';

const HalamanModerasiIklan: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCars, setTotalCars] = useState(0);
  const itemsPerPage = 20;

  // Statistics
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // Load cars for moderation
  const loadCars = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch cars dengan seller_type = 'external'
      const filterParams = {
        search: filters.search,
        status: filters.status === 'all' ? '' : filters.status,
        seller_type: 'external' // PENTING: hanya ambil iklan user
      };

      const result = await carService.getAllCarsAdmin(filterParams, currentPage, itemsPerPage);
      
      setCars(result.data);
      setTotalCars(result.total);
      setTotalPages(result.total_pages);

      // Calculate statistics
      const allResult = await carService.getAllCarsAdmin({ seller_type: 'external' }, 1, 10000);
      const allCars = allResult.data;
      
      const stats = {
        total: allCars.length,
        pending: allCars.filter((car: any) => car.status === 'pending').length,
        approved: allCars.filter((car: any) => car.status === 'available').length,
        rejected: allCars.filter((car: any) => car.status === 'rejected').length
      };
      setStatistics(stats);

    } catch (err: any) {
      console.error('Error loading cars:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadCars();
    }
  }, [user, currentPage, filters]);

  // Approve car
  const approveCar = async (carId: string) => {
    if (!window.confirm('Approve iklan ini? Iklan akan ditampilkan di katalog.')) {
      return;
    }

    try {
      setSubmitting(true);
      const result = await carService.updateCar(carId, { 
        status: 'available',
        is_verified: true 
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Gagal approve iklan');
      }

      await loadCars();
      alert('Iklan berhasil diapprove!');
      setShowDetailModal(false);
    } catch (err: any) {
      console.error('Error approving car:', err);
      alert(err.message || 'Gagal approve iklan');
    } finally {
      setSubmitting(false);
    }
  };

  // Reject car
  const rejectCar = async (carId: string) => {
    const reason = window.prompt('Alasan penolakan (opsional):');
    if (reason === null) return; // User cancelled

    try {
      setSubmitting(true);
      const result = await carService.updateCar(carId, { 
        status: 'rejected',
        // Could add rejection_reason field if needed
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Gagal reject iklan');
      }

      await loadCars();
      alert('Iklan berhasil ditolak!');
      setShowDetailModal(false);
    } catch (err: any) {
      console.error('Error rejecting car:', err);
      alert(err.message || 'Gagal reject iklan');
    } finally {
      setSubmitting(false);
    }
  };

  // View detail
  const viewDetail = async (car: any) => {
    try {
      setLoading(true);
      // Fetch full car details with relations
      const carDetail = await carService.getCarById(car.id);
      setSelectedCar(carDetail);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error fetching car detail:', err);
      alert('Gagal memuat detail iklan');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600 mb-4">Anda tidak memiliki akses ke halaman ini.</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FileText className="w-8 h-8 mr-3 text-blue-600" />
                Moderasi Iklan User
              </h1>
              <p className="text-gray-600 mt-1">Review dan approve iklan dari user external</p>
            </div>
            <Button onClick={() => navigate('/admin')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Iklan</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label>Pencarian</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cari judul iklan..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center text-red-800">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs by Status */}
        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="all" onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="all">
                  Semua ({statistics.total})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({statistics.pending})
                </TabsTrigger>
                <TabsTrigger value="available">
                  Approved ({statistics.approved})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({statistics.rejected})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-600">Memuat data...</span>
                  </div>
                ) : cars.length === 0 ? (
                  <div className="text-center py-12">
                    <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-2">Tidak ada iklan ditemukan</p>
                    <p className="text-gray-500 text-sm">Belum ada iklan dari user yang perlu dimoderasi</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {cars.map((car) => (
                        <motion.div
                          key={car.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col md:flex-row gap-4">
                            {/* Car Image */}
                            <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {car.car_images && car.car_images.length > 0 ? (
                                <img
                                  src={car.car_images.find((img: any) => img.is_primary)?.image_url || car.car_images[0]?.image_url}
                                  alt={car.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`flex items-center justify-center w-full h-full ${car.car_images && car.car_images.length > 0 ? 'hidden' : ''}`}>
                                <Car className="w-12 h-12 text-gray-500" />
                              </div>
                            </div>

                            {/* Car Info */}
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{car.title}</h3>
                                  <p className="text-sm text-gray-600">{car.year} • {car.mileage?.toLocaleString('id-ID')} km</p>
                                </div>
                                <Badge className={getStatusBadgeColor(car.status)}>
                                  {car.status === 'available' ? 'Approved' : car.status === 'pending' ? 'Pending' : 'Rejected'}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                <div className="flex items-center text-sm text-gray-600">
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  {formatCurrency(car.price)}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {car.location_city}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {formatDate(car.created_at)}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Package className="w-4 h-4 mr-1" />
                                  Paket: {car.package_id || 'Gratis'}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => viewDetail(car)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Detail
                                </Button>
                                {car.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                      onClick={() => approveCar(car.id)}
                                      disabled={submitting}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                      onClick={() => rejectCar(car.id)}
                                      disabled={submitting}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-between items-center mt-6">
                        <div className="text-sm text-gray-600">
                          Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalCars)} dari {totalCars} iklan
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                          >
                            Sebelumnya
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Selanjutnya
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              {/* Pending Tab */}
              <TabsContent value="pending" className="mt-0">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-600">Memuat data...</span>
                  </div>
                ) : cars.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-2">Tidak ada iklan pending</p>
                    <p className="text-gray-500 text-sm">Semua iklan sudah diproses</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {cars.map((car) => (
                        <motion.div
                          key={car.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col md:flex-row gap-4">
                            {/* Car Image */}
                            <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {car.car_images && car.car_images.length > 0 ? (
                                <img 
                                  src={car.car_images[0].image_url} 
                                  alt={car.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <Car className={`w-12 h-12 text-gray-500 ${car.car_images && car.car_images.length > 0 ? 'hidden' : ''}`} />
                            </div>

                            {/* Car Info */}
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{car.title}</h3>
                                  <p className="text-sm text-gray-600">{car.year} • {car.mileage?.toLocaleString('id-ID')} km</p>
                                </div>
                                <Badge className={getStatusBadgeColor(car.status)}>
                                  {car.status === 'available' ? 'Approved' : car.status === 'pending' ? 'Pending' : 'Rejected'}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                <div className="flex items-center text-sm text-gray-600">
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  {formatCurrency(car.price)}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {car.location_city}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {formatDate(car.created_at)}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Package className="w-4 h-4 mr-1" />
                                  Paket: {car.package_id || 'Gratis'}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => viewDetail(car)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Detail
                                </Button>
                                {car.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                      onClick={() => approveCar(car.id)}
                                      disabled={submitting}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                      onClick={() => rejectCar(car.id)}
                                      disabled={submitting}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-between items-center mt-6">
                        <div className="text-sm text-gray-600">
                          Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalCars)} dari {totalCars} iklan
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                          >
                            Sebelumnya
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Selanjutnya
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              {/* Approved Tab */}
              <TabsContent value="available" className="mt-0">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-600">Memuat data...</span>
                  </div>
                ) : cars.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-2">Tidak ada iklan approved</p>
                    <p className="text-gray-500 text-sm">Belum ada iklan yang disetujui</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {cars.map((car) => (
                        <motion.div
                          key={car.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col md:flex-row gap-4">
                            {/* Car Image */}
                            <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {car.car_images && car.car_images.length > 0 ? (
                                <img 
                                  src={car.car_images[0].image_url} 
                                  alt={car.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <Car className={`w-12 h-12 text-gray-500 ${car.car_images && car.car_images.length > 0 ? 'hidden' : ''}`} />
                            </div>

                            {/* Car Info */}
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{car.title}</h3>
                                  <p className="text-sm text-gray-600">{car.year} • {car.mileage?.toLocaleString('id-ID')} km</p>
                                </div>
                                <Badge className={getStatusBadgeColor(car.status)}>
                                  {car.status === 'available' ? 'Approved' : car.status === 'pending' ? 'Pending' : 'Rejected'}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                <div className="flex items-center text-sm text-gray-600">
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  {formatCurrency(car.price)}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {car.location_city}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {formatDate(car.created_at)}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Package className="w-4 h-4 mr-1" />
                                  Paket: {car.package_id || 'Gratis'}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => viewDetail(car)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Detail
                                </Button>
                                {car.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                      onClick={() => approveCar(car.id)}
                                      disabled={submitting}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                      onClick={() => rejectCar(car.id)}
                                      disabled={submitting}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-between items-center mt-6">
                        <div className="text-sm text-gray-600">
                          Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalCars)} dari {totalCars} iklan
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                          >
                            Sebelumnya
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Selanjutnya
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              {/* Rejected Tab */}
              <TabsContent value="rejected" className="mt-0">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-600">Memuat data...</span>
                  </div>
                ) : cars.length === 0 ? (
                  <div className="text-center py-12">
                    <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-2">Tidak ada iklan rejected</p>
                    <p className="text-gray-500 text-sm">Belum ada iklan yang ditolak</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {cars.map((car) => (
                        <motion.div
                          key={car.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col md:flex-row gap-4">
                            {/* Car Image */}
                            <div className="w-full md:w-48 h-32 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {car.car_images && car.car_images.length > 0 ? (
                                <img 
                                  src={car.car_images[0].image_url} 
                                  alt={car.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <Car className={`w-12 h-12 text-gray-500 ${car.car_images && car.car_images.length > 0 ? 'hidden' : ''}`} />
                            </div>

                            {/* Car Info */}
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{car.title}</h3>
                                  <p className="text-sm text-gray-600">{car.year} • {car.mileage?.toLocaleString('id-ID')} km</p>
                                </div>
                                <Badge className={getStatusBadgeColor(car.status)}>
                                  {car.status === 'available' ? 'Approved' : car.status === 'pending' ? 'Pending' : 'Rejected'}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                <div className="flex items-center text-sm text-gray-600">
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  {formatCurrency(car.price)}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {car.location_city}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {formatDate(car.created_at)}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Package className="w-4 h-4 mr-1" />
                                  Paket: {car.package_id || 'Gratis'}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => viewDetail(car)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Detail
                                </Button>
                                {car.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                      onClick={() => approveCar(car.id)}
                                      disabled={submitting}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                      onClick={() => rejectCar(car.id)}
                                      disabled={submitting}
                                    >
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-between items-center mt-6">
                        <div className="text-sm text-gray-600">
                          Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalCars)} dari {totalCars} iklan
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                          >
                            Sebelumnya
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                          >
                            Selanjutnya
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8">
            <div className="p-6 border-b sticky top-0 bg-white z-10 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Detail Iklan</h2>
                <Button variant="outline" size="sm" onClick={() => setShowDetailModal(false)}>
                  ×
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <Badge className={getStatusBadgeColor(selectedCar.status)} style={{ fontSize: '14px', padding: '8px 16px' }}>
                  {selectedCar.status === 'available' ? 'Approved' : selectedCar.status === 'pending' ? 'Pending Review' : 'Rejected'}
                </Badge>
                {selectedCar.is_verified && (
                  <Badge className="bg-blue-100 text-blue-800">Terverifikasi</Badge>
                )}
              </div>

              {/* Car Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Informasi Mobil</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Judul</p>
                    <p className="font-medium">{selectedCar.title}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Harga</p>
                    <p className="font-medium text-green-600">{formatCurrency(selectedCar.price)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tahun</p>
                    <p className="font-medium">{selectedCar.year}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Kondisi</p>
                    <p className="font-medium capitalize">{selectedCar.condition}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Transmisi</p>
                    <p className="font-medium capitalize">{selectedCar.transmission}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Bahan Bakar</p>
                    <p className="font-medium capitalize">{selectedCar.fuel_type}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Kilometer</p>
                    <p className="font-medium">{selectedCar.mileage?.toLocaleString('id-ID')} km</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Lokasi</p>
                    <p className="font-medium">{selectedCar.location_city}</p>
                  </div>
                </div>
              </div>

              {/* Seller Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Informasi Penjual</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Nama</p>
                    <p className="font-medium">{selectedCar.users?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Username</p>
                    <p className="font-medium">@{selectedCar.users?.username || 'N/A'}</p>
                  </div>
                  {selectedCar.users?.phone_number && (
                    <div>
                      <p className="text-gray-600">Telepon</p>
                      <p className="font-medium">{selectedCar.users.phone_number}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">Rating Penjual</p>
                    <p className="font-medium">⭐ {selectedCar.users?.seller_rating || 0}/5</p>
                  </div>
                </div>
              </div>

              {/* Package Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Informasi Paket</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {selectedCar.package_id ? (
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-600">Paket ID:</span> <span className="font-medium">{selectedCar.package_id}</span></p>
                      {selectedCar.listing_start_date && (
                        <p><span className="text-gray-600">Mulai:</span> <span className="font-medium">{formatDate(selectedCar.listing_start_date)}</span></p>
                      )}
                      {selectedCar.listing_end_date && (
                        <p><span className="text-gray-600">Berakhir:</span> <span className="font-medium">{formatDate(selectedCar.listing_end_date)}</span></p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">Paket Gratis</p>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedCar.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Deskripsi</h3>
                  <p className="text-gray-700 text-sm whitespace-pre-line">{selectedCar.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedCar.status === 'pending' && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => rejectCar(selectedCar.id)}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Tolak Iklan
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => approveCar(selectedCar.id)}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Approve Iklan
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalamanModerasiIklan;