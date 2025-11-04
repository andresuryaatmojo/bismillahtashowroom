import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { listingService, type ListingPayment } from '../services/listingService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  Briefcase, Package, DollarSign, CheckCircle, Clock, XCircle,
  AlertCircle, Search, Filter, Eye, ArrowLeft, CreditCard,
  Calendar, User, Car, RefreshCw, Settings, FileText
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import PaymentProofViewer from '../components/PaymentProofViewer';

interface EnhancedPayment {
  id: string;
  car_id: string;
  seller_id: string;
  package_id: number;
  amount: number;
  payment_method: string;
  payment_status: 'pending' | 'processing' | 'success' | 'failed' | 'expired' | 'refunded';
  reference_code: string;
  proof_of_payment?: string;
  verified_by?: string;
  verified_at?: string;
  activated_at?: string;
  expires_at?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  car?: {
    title?: string;
    brand_id?: number;
    model_id?: number;
  } | null;
  package?: {
    id: number;
    name: string;
    duration_days: number;
    price?: number;
  } | null;
  seller?: {
    name?: string;
    email?: string;
    username?: string;
    full_name?: string;
  } | null;
}

const HalamanPembayaranIklan: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [submitting, setSubmitting] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<EnhancedPayment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  // Redirect jika bukan admin
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/admin');
    }
  }, [authLoading, isAdmin, navigate]);

  // Fetch payments
  const fetchPayments = async () => {
    try {
      setLoading(true);

      // Use a single query with joins to get all related data
      const { data, error } = await supabase
        .from('listing_payments')
        .select(`
          *,
          cars:car_id (
            title,
            brand_id,
            model_id
          ),
          listing_packages:package_id (
            id,
            name,
            duration_days,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payments with joins:', error);
        throw error;
      }

      console.log('Raw payments data:', data);

      // Now get user information separately for each payment
      const enhancedPayments = await Promise.all(
        (data || []).map(async (payment) => {
          try {
            // Get seller information
            let sellerData = null;

            if (payment.seller_id) {
              try {
                const { data: userData, error: userError } = await supabase
                  .from('users')
                  .select('username, full_name, email')
                  .eq('id', payment.seller_id)
                  .single();

                if (!userError && userData) {
                  sellerData = {
                    name: userData.full_name || userData.username || `User (${payment.seller_id.slice(0, 8)}...)`,
                    email: userData.email || 'N/A'
                  };
                } else {
                  console.warn(`User ${payment.seller_id} not found:`, userError);
                  sellerData = {
                    name: `User (${payment.seller_id.slice(0, 8)}...)`,
                    email: 'N/A'
                  };
                }
              } catch (error) {
                console.error('Error fetching user:', error);
                sellerData = {
                  name: `User (${payment.seller_id.slice(0, 8)}...)`,
                  email: 'N/A'
                };
              }
            }

            return {
              ...payment,
              car: payment.cars || { title: 'Unknown Car' },
              package: payment.listing_packages,
              seller: sellerData
            };
          } catch (error) {
            console.error('Error enhancing payment:', error);
            return {
              ...payment,
              car: { title: 'Error Loading Car' },
              package: payment.listing_packages,
              seller: { name: 'Error Loading User', email: 'N/A' }
            };
          }
        })
      );

      console.log('Enhanced payments:', enhancedPayments);
      setPayments(enhancedPayments);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPayments();
    }
  }, [isAdmin]);

  // Update payment status
  const updatePaymentStatus = async (paymentId: string, status: 'success' | 'failed' | 'processing') => {
    try {
      setSubmitting(true);
      const result = await listingService.updatePaymentStatus(paymentId, status, user?.id);

      if (result.success) {
        await fetchPayments();
        setError(null);
      } else {
        setError(result.error || 'Gagal memperbarui status pembayaran');
      }
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle view detail
  const handleViewDetail = (payment: EnhancedPayment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  // Handle view proof
  const handleViewProof = async (payment: EnhancedPayment) => {
    if (payment.proof_of_payment) {
      const proofResult = await listingService.getPaymentProofUrl(payment.proof_of_payment);
      if (proofResult.success && proofResult.url) {
        setSelectedPayment(payment);
        setProofUrl(proofResult.url);
        setShowProofModal(true);
      } else {
        setError('Gagal memuat bukti pembayaran: ' + (proofResult.error || 'Error tidak diketahui'));
      }
    } else {
      setError('Bukti pembayaran tidak tersedia');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  
  // Filter payments based on search and status
  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.reference_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.car?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.seller?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || payment.payment_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Berhasil</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Menunggu</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800"><RefreshCw className="w-3 h-3 mr-1" />Proses</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Gagal</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Kadaluarsa</Badge>;
      case 'refunded':
        return <Badge className="bg-purple-100 text-purple-800"><DollarSign className="w-3 h-3 mr-1" />Dikembalikan</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pembayaran Iklan</h1>
            <p className="text-gray-600">Kelola pembayaran paket iklan dari penjual</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/paket-iklan')}
              className="flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Kelola Paket
            </Button>
            <Button
              variant="outline"
              onClick={fetchPayments}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Pembayaran</p>
                  <p className="text-2xl font-bold">{payments.length}</p>
                </div>
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Menunggu Verifikasi</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {payments.filter(p => p.payment_status === 'pending' || p.payment_status === 'processing').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Berhasil</p>
                  <p className="text-2xl font-bold text-green-600">
                    {payments.filter(p => p.payment_status === 'success').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    Rp {payments
                      .filter(p => p.payment_status === 'success')
                      .reduce((sum, p) => sum + (p.amount || 0), 0)
                      .toLocaleString('id-ID')}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari berdasarkan kode referensi, mobil, atau penjual..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Menunggu</SelectItem>
                  <SelectItem value="processing">Proses</SelectItem>
                  <SelectItem value="success">Berhasil</SelectItem>
                  <SelectItem value="failed">Gagal</SelectItem>
                  <SelectItem value="expired">Kadaluarsa</SelectItem>
                  <SelectItem value="refunded">Dikembalikan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Payments List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Daftar Pembayaran ({filteredPayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span className="ml-2">Memuat data...</span>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || statusFilter !== 'all' ? 'Tidak ada pembayaran yang ditemukan' : 'Belum ada pembayaran'}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Coba ubah filter atau kata kunci pencarian'
                    : 'Pembayaran paket iklan akan muncul di sini'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Kode Referensi</th>
                      <th className="text-left py-3 px-4">Penjual</th>
                      <th className="text-left py-3 px-4">Mobil</th>
                      <th className="text-left py-3 px-4">Paket</th>
                      <th className="text-left py-3 px-4">Jumlah</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Tanggal</th>
                      <th className="text-left py-3 px-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-mono text-sm">{payment.reference_code}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{payment.seller?.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{payment.seller?.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{payment.car?.title || 'Unknown Car'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">{payment.package?.name || 'Unknown Package'}</div>
                          <div className="text-sm text-gray-500">
                            {payment.package?.duration_days} hari
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">
                            {payment.amount === 0 ? 'Gratis' : `Rp ${payment.amount?.toLocaleString('id-ID')}`}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(payment.payment_status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div>{new Date(payment.created_at).toLocaleDateString('id-ID')}</div>
                            <div className="text-gray-500">
                              {new Date(payment.created_at).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetail(payment)}
                              title="Lihat Detail Iklan"
                            >
                              <FileText className="w-3 h-3" />
                            </Button>
                            {payment.proof_of_payment && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewProof(payment)}
                                title="Lihat Bukti Pembayaran"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            )}
                            {(payment.payment_status === 'pending' || payment.payment_status === 'processing') && (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updatePaymentStatus(payment.id, 'success')}
                                  disabled={submitting}
                                  className="text-green-600 hover:text-green-700"
                                  title="Setujui"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updatePaymentStatus(payment.id, 'failed')}
                                  disabled={submitting}
                                  className="text-red-600 hover:text-red-700"
                                  title="Tolak"
                                >
                                  <XCircle className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Pembayaran Iklan</DialogTitle>
            </DialogHeader>

            {selectedPayment && (
              <div className="space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informasi Pembayaran</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kode Referensi:</span>
                        <span className="font-mono text-sm font-medium">{selectedPayment.reference_code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <div>{getStatusBadge(selectedPayment.payment_status)}</div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Jumlah:</span>
                        <span className="font-medium">
                          {selectedPayment.amount === 0 ? 'Gratis' : `Rp ${selectedPayment.amount?.toLocaleString('id-ID')}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Metode Pembayaran:</span>
                        <span className="font-medium capitalize">{selectedPayment.payment_method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tanggal Pembayaran:</span>
                        <span className="font-medium">{formatDate(selectedPayment.created_at)}</span>
                      </div>
                      {selectedPayment.verified_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Terverifikasi:</span>
                          <span className="font-medium">{formatDate(selectedPayment.verified_at)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informasi Paket</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nama Paket:</span>
                        <span className="font-medium">{selectedPayment.package?.name || 'Unknown Package'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Durasi:</span>
                        <span className="font-medium">{selectedPayment.package?.duration_days} hari</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Harga Paket:</span>
                        <span className="font-medium">
                          Rp {selectedPayment.package?.price?.toLocaleString('id-ID') || 0}
                        </span>
                      </div>
                      {selectedPayment.activated_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Aktif Sejak:</span>
                          <span className="font-medium">{formatDate(selectedPayment.activated_at)}</span>
                        </div>
                      )}
                      {selectedPayment.expires_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Kadaluarsa:</span>
                          <span className="font-medium">{formatDate(selectedPayment.expires_at)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Car & Seller Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informasi Mobil</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-gray-600">Judul Iklan:</span>
                        <p className="font-medium mt-1">{selectedPayment.car?.title || 'Unknown Car'}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        ID Mobil: {selectedPayment.car_id}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Informasi Penjual</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-gray-600">Nama:</span>
                        <p className="font-medium mt-1">{selectedPayment.seller?.name || 'Unknown'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium mt-1 text-sm">{selectedPayment.seller?.email}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        ID Penjual: {selectedPayment.seller_id}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Proof of Payment Section */}
                {selectedPayment.proof_of_payment && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Bukti Pembayaran
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-sm text-gray-600">
                          Nama File: {selectedPayment.proof_of_payment}
                        </div>
                        <Button
                          onClick={() => handleViewProof(selectedPayment)}
                          className="w-full md:w-auto"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Lihat Bukti Pembayaran
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notes */}
                {selectedPayment.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Catatan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{selectedPayment.notes}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  {(selectedPayment.payment_status === 'pending' || selectedPayment.payment_status === 'processing') && (
                    <>
                      <Button
                        onClick={() => updatePaymentStatus(selectedPayment.id, 'success')}
                        disabled={submitting}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Setujui
                      </Button>
                      <Button
                        onClick={() => updatePaymentStatus(selectedPayment.id, 'failed')}
                        disabled={submitting}
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Tolak
                      </Button>
                    </>
                  )}
                  <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                    Tutup
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Payment Proof Modal */}
        <PaymentProofViewer
          isOpen={showProofModal}
          onClose={() => {
            setShowProofModal(false);
            setProofUrl(null);
          }}
          proofUrl={proofUrl}
        />
      </div>
    </div>
  );
};

export default HalamanPembayaranIklan;