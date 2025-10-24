import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { carService } from '../services/carService';
import listingService, { type ListingPayment } from '../services/listingService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Search, Filter, Eye, CheckCircle, XCircle, Loader2, AlertCircle, 
  ArrowLeft, Clock, User, DollarSign, Package, FileText, Phone, Mail,
  MapPin, Calendar, Car, CreditCard, Download, ExternalLink
} from 'lucide-react';

// Payment Proof Viewer Component
const PaymentProofViewer: React.FC<{ proofPath: string; referenceCode: string }> = ({ proofPath, referenceCode }) => {
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProofUrl = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await listingService.getPaymentProofUrl(proofPath);
        
        if (result.success && result.url) {
          setProofUrl(result.url);
        } else {
          setError(result.error || 'Gagal memuat bukti pembayaran');
        }
      } catch (err: any) {
        console.error('Error loading payment proof:', err);
        setError(err.message || 'Terjadi kesalahan saat memuat bukti pembayaran');
      } finally {
        setLoading(false);
      }
    };

    if (proofPath) {
      loadProofUrl();
    } else {
      setLoading(false);
      setError('Path bukti pembayaran tidak valid');
    }
  }, [proofPath]);

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        <span className="text-sm text-gray-600">Memuat bukti pembayaran...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2">
        <XCircle className="w-5 h-5 text-red-400" />
        <span className="text-sm text-red-600">{error}</span>
      </div>
    );
  }

  if (!proofUrl) {
    return (
      <div className="flex items-center space-x-2">
        <FileText className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-500">Bukti pembayaran tidak tersedia</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <FileText className="w-5 h-5 text-green-600" />
        <span className="text-sm text-gray-700">Bukti transfer telah diupload</span>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(proofUrl, '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          Lihat
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const link = document.createElement('a');
            link.href = proofUrl;
            link.download = `bukti-pembayaran-${referenceCode}`;
            link.click();
          }}
        >
          <Download className="w-4 h-4 mr-1" />
          Download
        </Button>
      </div>
    </div>
  );
};

const HalamanModerasiIklan: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<any | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Payment states
  const [payments, setPayments] = useState<ListingPayment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<ListingPayment | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  
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

  // Payment statistics
  const [paymentStatistics, setPaymentStatistics] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    success: 0,
    failed: 0
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

  // Load payments for admin
  const loadPayments = async () => {
    try {
      setPaymentLoading(true);
      const allPayments = await listingService.getAllPayments();

      const paymentStats = {
        total: allPayments.length,
        pending: allPayments.filter(p => p.payment_status === 'pending').length,
        processing: allPayments.filter(p => p.payment_status === 'processing').length,
        success: allPayments.filter(p => p.payment_status === 'success').length,
        failed: allPayments.filter(p => p.payment_status === 'failed').length
      };

      setPayments(allPayments);
      setPaymentStatistics(paymentStats);
    } catch (err: any) {
      console.error('Error loading payments:', err);
      setError(err.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Verify payment
  const verifyPayment = async (paymentId: string, status: 'success' | 'failed') => {
    if (!window.confirm(`${status === 'success' ? 'Verifikasi' : 'Tolak'} pembayaran ini?`)) {
      return;
    }

    try {
      setSubmitting(true);
      const res = await listingService.updatePaymentStatus(paymentId, status, user?.id);
      if (!res.success) {
        throw new Error(res.error || 'Gagal memproses pembayaran');
      }

      await loadPayments();   // refresh payment list
      await loadCars();       // refresh car data; package_id akan ter-update jika success
      alert(`Pembayaran berhasil ${status === 'success' ? 'diverifikasi' : 'ditolak'}!`);
      setShowPaymentModal(false);
    } catch (err: any) {
      console.error('Error verifying payment:', err);
      alert(err.message || 'Gagal memproses pembayaran');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadCars();
      loadPayments();
    }
  }, [user, currentPage, filters]);

  // Helper function to check if payment verification is required and valid
  const canApproveAd = (car: any): { canApprove: boolean; reason?: string } => {
    console.log('Checking approval for car:', car.id);
    console.log('Car listing_payments:', car.listing_payments);
    
    const packageId = car.listing_payments?.[0]?.package_id;
    const paymentStatus = car.listing_payments?.[0]?.payment_status;
    
    console.log('Package ID:', packageId, 'Payment Status:', paymentStatus);
    console.log('Package ID type:', typeof packageId);
    
    // Convert packageId to string for consistent comparison
    const packageIdStr = String(packageId);
    
    // Free package (package_id = '1' or null) - no payment verification needed
    if (!packageId || packageIdStr === '1') {
      console.log('Free package detected, allowing approval');
      return { canApprove: true };
    }
    
    // Paid packages (Basic='2', Premium='3', Featured='4') - require payment verification
    if (packageIdStr === '2' || packageIdStr === '3' || packageIdStr === '4') {
      console.log('Paid package detected, checking payment status');
      if (paymentStatus === 'success') {
        console.log('Payment verified, allowing approval');
        return { canApprove: true };
      } else {
        const packageName = getPackageName(packageId);
        console.log('Payment not verified, blocking approval');
        return { 
          canApprove: false, 
          reason: `Paket ${packageName} memerlukan verifikasi pembayaran terlebih dahulu. Status: ${paymentStatus || 'Belum dibayar'}` 
        };
      }
    }
    
    console.log('Unknown package, allowing approval by default');
    return { canApprove: true };
  };

  // Approve car
  const approveCar = async (carId: string) => {
    const car = cars.find(c => c.id === carId);
    if (!car) return;
    
    console.log('Attempting to approve car:', carId);
    console.log('Full car data:', car);
    
    const approvalCheck = canApproveAd(car);
    console.log('Approval check result:', approvalCheck);
    
    if (!approvalCheck.canApprove) {
      alert(`Tidak dapat approve iklan: ${approvalCheck.reason}`);
      return;
    }
    
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
    return `Rp ${amount.toLocaleString('id-ID')}`;
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

  const getPackageName = (packageId: string | number | null) => {
    if (!packageId) return 'Free';
    
    const packageMap: { [key: string]: string } = {
      '1': 'Free',
      '2': 'Basic', 
      '3': 'Premium',
      '4': 'Featured'
    };
    
    return packageMap[packageId.toString()] || 'Free';
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
              <TabsList className="grid w-full grid-cols-5 mb-6">
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
                <TabsTrigger value="payments">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pembayaran ({paymentStatistics.total})
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
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
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
                                  Paket: {getPackageName(car.listing_payments?.[0]?.package_id)}
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
                                    {(() => {
                                      const approvalCheck = canApproveAd(car);
                                      return (
                                        <Button
                                          size="sm"
                                          className={approvalCheck.canApprove 
                                            ? "bg-green-600 hover:bg-green-700 text-white" 
                                            : "bg-gray-400 cursor-not-allowed text-white"
                                          }
                                          onClick={() => approveCar(car.id)}
                                          disabled={submitting || !approvalCheck.canApprove}
                                          title={approvalCheck.canApprove ? "Approve iklan" : approvalCheck.reason}
                                        >
                                          <CheckCircle className="w-4 h-4 mr-1" />
                                          {approvalCheck.canApprove ? "Approve" : "Perlu Verifikasi"}
                                        </Button>
                                      );
                                    })()}
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
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
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
                                  Paket: {getPackageName(car.listing_payments?.[0]?.package_id)}
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
                                    {(() => {
                                      const approvalCheck = canApproveAd(car);
                                      return (
                                        <Button
                                          size="sm"
                                          className={approvalCheck.canApprove 
                                            ? "bg-green-600 hover:bg-green-700 text-white" 
                                            : "bg-gray-400 cursor-not-allowed text-white"
                                          }
                                          onClick={() => approveCar(car.id)}
                                          disabled={submitting || !approvalCheck.canApprove}
                                          title={approvalCheck.canApprove ? "Approve iklan" : approvalCheck.reason}
                                        >
                                          <CheckCircle className="w-4 h-4 mr-1" />
                                          {approvalCheck.canApprove ? "Approve" : "Perlu Verifikasi"}
                                        </Button>
                                      );
                                    })()}
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
                                  Paket: {getPackageName(car.listing_payments?.[0]?.package_id)}
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
                                    {(() => {
                                      const approvalCheck = canApproveAd(car);
                                      return (
                                        <Button
                                          size="sm"
                                          className={approvalCheck.canApprove 
                                            ? "bg-green-600 hover:bg-green-700 text-white" 
                                            : "bg-gray-400 cursor-not-allowed text-white"
                                          }
                                          onClick={() => approveCar(car.id)}
                                          disabled={submitting || !approvalCheck.canApprove}
                                          title={approvalCheck.canApprove ? "Approve iklan" : approvalCheck.reason}
                                        >
                                          <CheckCircle className="w-4 h-4 mr-1" />
                                          {approvalCheck.canApprove ? "Approve" : "Perlu Verifikasi"}
                                        </Button>
                                      );
                                    })()}
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
                                  Paket: {getPackageName(car.listing_payments?.[0]?.package_id)}
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
                                    {(() => {
                                      const approvalCheck = canApproveAd(car);
                                      return (
                                        <Button
                                          size="sm"
                                          className={approvalCheck.canApprove 
                                            ? "bg-green-600 hover:bg-green-700 text-white" 
                                            : "bg-gray-400 cursor-not-allowed text-white"
                                          }
                                          onClick={() => approveCar(car.id)}
                                          disabled={submitting || !approvalCheck.canApprove}
                                          title={approvalCheck.canApprove ? "Approve iklan" : approvalCheck.reason}
                                        >
                                          <CheckCircle className="w-4 h-4 mr-1" />
                                          {approvalCheck.canApprove ? "Approve" : "Perlu Verifikasi"}
                                        </Button>
                                      );
                                    })()}
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

              {/* Payments Tab */}
              <TabsContent value="payments" className="mt-0">
                {paymentLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-600">Memuat data pembayaran...</span>
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg mb-2">Tidak ada pembayaran ditemukan</p>
                    <p className="text-gray-500 text-sm">Belum ada pembayaran yang perlu diproses</p>
                  </div>
                ) : (
                  <>
                    {/* Payment Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <Card className="bg-yellow-50 border-yellow-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-yellow-800">Pending</p>
                              <p className="text-xl font-bold text-yellow-900">{paymentStatistics.pending}</p>
                            </div>
                            <Clock className="w-6 h-6 text-yellow-600" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-800">Processing</p>
                              <p className="text-xl font-bold text-blue-900">{paymentStatistics.processing}</p>
                            </div>
                            <Loader2 className="w-6 h-6 text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-green-800">Success</p>
                              <p className="text-xl font-bold text-green-900">{paymentStatistics.success}</p>
                            </div>
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-red-50 border-red-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-red-800">Failed</p>
                              <p className="text-xl font-bold text-red-900">{paymentStatistics.failed}</p>
                            </div>
                            <XCircle className="w-6 h-6 text-red-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Payment List */}
                    <div className="space-y-4">
                      {payments.map((payment) => (
                        <motion.div
                          key={payment.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold text-gray-900">
                                  {payment.reference_code}
                                </h3>
                                <Badge 
                                  variant={
                                    payment.payment_status === 'success' ? 'default' :
                                    payment.payment_status === 'processing' ? 'secondary' :
                                    payment.payment_status === 'failed' ? 'destructive' :
                                    'outline'
                                  }
                                >
                                  {payment.payment_status.toUpperCase()}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                <div>
                                  <p><span className="font-medium">Jumlah:</span> Rp {payment.amount.toLocaleString('id-ID')}</p>
                                  <p><span className="font-medium">Metode:</span> {payment.payment_method}</p>
                                </div>
                                <div>
                                  <p><span className="font-medium">Car ID:</span> {payment.car_id}</p>
                                  <p><span className="font-medium">Package ID:</span> {payment.package_id}</p>
                                </div>
                                <div>
                                  <p><span className="font-medium">Seller ID:</span> {payment.seller_id}</p>
                                  {payment.verified_at && (
                                    <p><span className="font-medium">Verified:</span> {new Date(payment.verified_at).toLocaleDateString('id-ID')}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPayment(payment);
                                  setShowPaymentModal(true);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Detail
                              </Button>
                              
                              {payment.payment_status === 'processing' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => verifyPayment(payment.id, 'success')}
                                    disabled={submitting}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Verifikasi
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => verifyPayment(payment.id, 'failed')}
                                    disabled={submitting}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Tolak
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b bg-white flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Detail Iklan</h2>
                <Button variant="outline" size="sm" onClick={() => setShowDetailModal(false)}>
                  ×
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
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

              {/* Car Images and Basic Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Car Images */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Foto Mobil</h3>
                  {selectedCar.car_images && selectedCar.car_images.length > 0 ? (
                    <div className="space-y-3">
                      {/* Primary Image */}
                      {(() => {
                        const primaryImage = selectedCar.car_images.find((img: { id: string; image_url: string; is_primary: boolean; display_order: number }) => img.is_primary) || selectedCar.car_images[0];
                        return (
                          <div className="relative">
                            <img 
                              src={primaryImage.image_url} 
                              alt="Foto utama mobil"
                              className="w-full h-64 object-cover rounded-lg border"
                              onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement;
                                  target.src = '/placeholder-car.jpg';
                                }}
                            />
                            <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                              Foto Utama
                            </Badge>
                          </div>
                        );
                      })()}
                      
                      {/* Additional Images */}
                      {selectedCar.car_images.length > 1 && (
                        <div className="grid grid-cols-3 gap-2">
                          {selectedCar.car_images
                            .filter((img: { id: string; image_url: string; is_primary: boolean; display_order: number }) => !img.is_primary)
                            .slice(0, 6)
                            .map((image: { id: string; image_url: string; is_primary: boolean; display_order: number }, index: number) => (
                              <img 
                                key={image.id}
                                src={image.image_url} 
                                alt={`Foto mobil ${index + 2}`}
                                className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                onError={(e) => {
                                  const target = e.currentTarget as HTMLImageElement;
                                  target.src = '/placeholder-car.jpg';
                                }}
                              />
                            ))}
                          {selectedCar.car_images.length > 7 && (
                            <div className="w-full h-20 bg-gray-100 rounded border flex items-center justify-center text-gray-500 text-sm">
                              +{selectedCar.car_images.length - 7} foto
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-lg border flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Car className="w-12 h-12 mx-auto mb-2" />
                        <p>Tidak ada foto</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Basic Car Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Informasi Dasar</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Judul:</span>
                      <span className="font-medium text-right">{selectedCar.title}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Harga:</span>
                      <span className="font-bold text-green-600 text-lg">{formatCurrency(selectedCar.price)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Merek:</span>
                      <span className="font-medium">{selectedCar.car_brands?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium">{selectedCar.car_models?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tahun:</span>
                      <span className="font-medium">{selectedCar.year}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Kondisi:</span>
                      <Badge variant="outline" className="capitalize">{selectedCar.condition}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Specifications */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Spesifikasi Detail</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white border rounded-lg p-3 text-center">
                    <div className="text-gray-500 text-xs mb-1">Transmisi</div>
                    <div className="font-medium capitalize">{selectedCar.transmission}</div>
                  </div>
                  <div className="bg-white border rounded-lg p-3 text-center">
                    <div className="text-gray-500 text-xs mb-1">Bahan Bakar</div>
                    <div className="font-medium capitalize">{selectedCar.fuel_type}</div>
                  </div>
                  <div className="bg-white border rounded-lg p-3 text-center">
                    <div className="text-gray-500 text-xs mb-1">Kilometer</div>
                    <div className="font-medium">{selectedCar.mileage?.toLocaleString('id-ID')} km</div>
                  </div>
                  <div className="bg-white border rounded-lg p-3 text-center">
                    <div className="text-gray-500 text-xs mb-1">Lokasi</div>
                    <div className="font-medium">{selectedCar.location_city}</div>
                  </div>
                </div>
              </div>

              {/* Seller Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Informasi Penjual
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Nama:</span>
                      <span className="font-medium">{selectedCar.users?.full_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Username:</span>
                      <span className="font-medium">@{selectedCar.users?.username || 'N/A'}</span>
                    </div>
                    {selectedCar.users?.phone_number && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Telepon:</span>
                        <span className="font-medium">{selectedCar.users.phone_number}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Rating:</span>
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">⭐</span>
                        <span className="font-medium">{selectedCar.users?.seller_rating || 0}/5</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tipe Penjual:</span>
                      <Badge variant="outline" className="capitalize">
                        {selectedCar.users?.seller_type || 'N/A'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Package Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-purple-600" />
                    Informasi Paket
                  </h3>
                  <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Paket:</span>
                      <Badge className="bg-purple-600 text-white">
                        {getPackageName(selectedCar.listing_payments?.[0]?.package_id)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status Pembayaran:</span>
                      <Badge variant={
                        selectedCar.listing_payments?.[0]?.payment_status === 'success' ? 'default' :
                        selectedCar.listing_payments?.[0]?.payment_status === 'processing' ? 'secondary' :
                        selectedCar.listing_payments?.[0]?.payment_status === 'failed' ? 'destructive' : 'outline'
                      }>
                        {selectedCar.listing_payments?.[0]?.payment_status?.toUpperCase() || 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Diaktifkan:</span>
                      <span className="font-medium text-sm">
                        {selectedCar.listing_payments?.[0]?.activated_at 
                          ? new Date(selectedCar.listing_payments[0].activated_at).toLocaleDateString('id-ID')
                          : 'Belum diaktifkan'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Berakhir:</span>
                      <span className="font-medium text-sm">
                        {selectedCar.listing_payments?.[0]?.expires_at 
                          ? new Date(selectedCar.listing_payments[0].expires_at).toLocaleDateString('id-ID')
                          : 'Tidak ada batas waktu'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Info Pembayaran</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {(() => {
                    const relatedPayments = payments.filter(p => p.car_id === selectedCar.id);
                    if (relatedPayments.length === 0) {
                      return <p className="text-gray-600 text-sm">Belum ada pembayaran untuk iklan ini</p>;
                    }
                    const lastPayment = relatedPayments[0];
                    return (
                      <div className="space-y-2 text-sm">
                        <p><span className="text-gray-600">Ref:</span> <span className="font-medium">{lastPayment.reference_code}</span></p>
                        <p><span className="text-gray-600">Jumlah:</span> <span className="font-medium">Rp {lastPayment.amount.toLocaleString('id-ID')}</span></p>
                        <p><span className="text-gray-600">Status:</span> <Badge className="ml-2" variant={lastPayment.payment_status === 'success' ? 'default' : lastPayment.payment_status === 'processing' ? 'secondary' : lastPayment.payment_status === 'failed' ? 'destructive' : 'outline'}>{lastPayment.payment_status.toUpperCase()}</Badge></p>
                        {lastPayment.proof_of_payment ? (
                          <div className="flex items-center space-x-2 mt-2">
                            <Button variant="outline" size="sm" onClick={() => { setSelectedPayment(lastPayment); setShowPaymentModal(true); }}>
                              <Eye className="w-4 h-4 mr-1" /> Lihat Bukti
                            </Button>
                          </div>
                        ) : (
                          <p className="text-gray-500 text-xs mt-1">Bukti pembayaran belum diupload</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Technical Specifications */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Car className="w-5 h-5 mr-2 text-green-600" />
                  Spesifikasi Teknis
                </h3>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <span className="text-gray-600 text-sm">Transmisi:</span>
                      <span className="font-medium">{selectedCar.transmission || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <span className="text-gray-600 text-sm">Bahan Bakar:</span>
                      <span className="font-medium">{selectedCar.fuel_type || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <span className="text-gray-600 text-sm">Kondisi:</span>
                      <span className="font-medium capitalize">{selectedCar.condition || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <span className="text-gray-600 text-sm">Warna:</span>
                      <span className="font-medium">{selectedCar.color || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <span className="text-gray-600 text-sm">Kapasitas Mesin:</span>
                      <span className="font-medium">{selectedCar.engine_capacity || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <span className="text-gray-600 text-sm">Lokasi:</span>
                      <span className="font-medium">{selectedCar.location || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedCar.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-gray-600" />
                    Deskripsi
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">{selectedCar.description}</p>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                  Informasi Waktu
                </h3>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Dibuat:</span>
                      <span className="font-medium">
                        {new Date(selectedCar.created_at).toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Diperbarui:</span>
                      <span className="font-medium">
                        {new Date(selectedCar.updated_at).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

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
        </div>
      )}

      {/* Payment Detail Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full my-8">
            <div className="p-6 border-b sticky top-0 bg-white z-10 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Detail Pembayaran</h2>
                <Button variant="outline" size="sm" onClick={() => setShowPaymentModal(false)}>
                  ×
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
              {/* Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                    Informasi Pembayaran
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Reference Code:</span>
                      <span className="font-medium font-mono text-sm bg-white px-2 py-1 rounded border">
                        {selectedPayment?.reference_code || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Jumlah:</span>
                      <span className="font-bold text-green-600">
                        Rp {selectedPayment?.amount ? selectedPayment.amount.toLocaleString('id-ID') : '0'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Metode Pembayaran:</span>
                      <span className="font-medium capitalize">{selectedPayment?.payment_method || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status:</span>
                      <Badge 
                        variant={
                          selectedPayment?.payment_status === 'success' ? 'default' :
                          selectedPayment?.payment_status === 'processing' ? 'secondary' :
                          selectedPayment?.payment_status === 'failed' ? 'destructive' :
                          'outline'
                        }
                      >
                        {selectedPayment?.payment_status?.toUpperCase() || 'UNKNOWN'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-gray-600" />
                    Detail Transaksi
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Car ID:</span>
                      <span className="font-medium">{selectedPayment?.car_id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Package ID:</span>
                      <span className="font-medium">{selectedPayment?.package_id || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Seller ID:</span>
                      <span className="font-medium">{selectedPayment?.seller_id || 'N/A'}</span>
                    </div>
                    {selectedPayment?.verified_by && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Verified By:</span>
                        <span className="font-medium">{selectedPayment.verified_by}</span>
                      </div>
                    )}
                    {selectedPayment?.verified_at && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Verified At:</span>
                        <span className="font-medium text-sm">
                          {new Date(selectedPayment.verified_at).toLocaleString('id-ID')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Proof */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Download className="w-5 h-5 mr-2 text-green-600" />
                  Bukti Pembayaran
                </h3>
                <div className="border rounded-lg p-4 bg-gray-50">
                  {selectedPayment?.proof_of_payment ? (
                    <PaymentProofViewer 
                      proofPath={selectedPayment.proof_of_payment}
                      referenceCode={selectedPayment.reference_code || 'N/A'}
                    />
                  ) : (
                    <div className="flex items-center justify-center space-x-2 py-8">
                      <FileText className="w-8 h-8 text-gray-400" />
                      <span className="text-gray-500">Bukti pembayaran belum diupload</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedPayment?.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Catatan</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{selectedPayment.notes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedPayment?.payment_status === 'processing' && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => verifyPayment(selectedPayment.id, 'failed')}
                    disabled={submitting}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    Tolak Pembayaran
                  </Button>
                  <Button
                    onClick={() => verifyPayment(selectedPayment.id, 'success')}
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Verifikasi Pembayaran
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