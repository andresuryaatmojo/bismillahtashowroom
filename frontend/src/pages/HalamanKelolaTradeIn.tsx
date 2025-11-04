import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { motion } from 'framer-motion';
import {
  Car,
  Clock,
  CheckCircle,
  ArrowLeft,
  X,
  DollarSign,
  Eye,
  Trash2,
  Filter,
  Search,
  CheckSquare,
  XCircle
} from 'lucide-react';

import {
  TradeInRequestWithRelations,
  TradeInUpdateData,
  TradeInService,
  TradeInFilters
} from '../services/LayananTradeIn';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const HalamanKelolaTradeIn: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // States
  const [tradeIns, setTradeIns] = useState<TradeInRequestWithRelations[]>([]);
  const [selectedTradeIn, setSelectedTradeIn] = useState<TradeInRequestWithRelations | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<TradeInFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog states
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Edit form states
  const [editFormData, setEditFormData] = useState<Partial<TradeInUpdateData>>({});
  const [rejectReason, setRejectReason] = useState('');

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage); // Force recompilation

  // Load data
  useEffect(() => {
    console.log('🔍 HalamanKelolaTradeIn mounting, loading trade-ins...');
      console.log('Environment check:', {
        supabaseUrl: process.env.REACT_APP_SUPABASE_URL ? '✅ Set' : '❌ Missing',
        serviceKey: process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'
      });
    loadTradeIns();
  }, [currentPage, filters, searchTerm]);

  const loadTradeIns = async () => {
    setLoading(true);
    try {
      const currentFilters = {
        ...filters,
        search: searchTerm || undefined
      };

      const { data, count, error } = await TradeInService.getAllTradeInRequests(
        currentFilters,
        currentPage,
        itemsPerPage
      );

      if (error) {
        console.error('Error loading trade-ins:', error);
      } else {
        console.log('✅ Trade-ins loaded successfully:', {
          count: data.length,
          totalCount: count,
          sampleData: data.map(item => ({
            id: item.id.substring(0, 8),
            car: `${item.old_car_brand} ${item.old_car_model}`,
            imagesCount: item.images?.length || 0,
            hasImages: item.images && item.images.length > 0,
            firstImageUrl: item.images?.[0]?.image_url || 'none'
          }))
        });
        setTradeIns(data);
        setTotalCount(count);
      }
    } catch (error) {
      console.error('Error loading trade-ins:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu', variant: 'secondary' as const },
      inspecting: { label: 'Inspeksi', variant: 'default' as const },
      appraised: { label: 'Dinilai', variant: 'default' as const },
      approved: { label: 'Disetujui', variant: 'default' as const },
      rejected: { label: 'Ditolak', variant: 'destructive' as const },
      completed: { label: 'Selesai', variant: 'default' as const },
      cancelled: { label: 'Dibatalkan', variant: 'secondary' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleStatusUpdate = async (tradeInId: string, status: string, additionalData?: any) => {
    try {
      const updateData: TradeInUpdateData = {
        status: status as any,
        ...additionalData
      };

      const { error } = await TradeInService.updateTradeInRequest(tradeInId, updateData);

      if (error) {
        console.error('Error updating status:', error);
        alert('Gagal memperbarui status: ' + error.message);
      } else {
        await loadTradeIns();
        setShowEditDialog(false);
        setShowRejectDialog(false);
        alert('Status berhasil diperbarui');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Terjadi kesalahan saat memperbarui status');
    }
  };

  const handleApprove = async (tradeIn: TradeInRequestWithRelations) => {
    setEditFormData({
      appraised_value: tradeIn.appraised_value,
      final_trade_in_value: tradeIn.final_trade_in_value,
      price_difference: tradeIn.price_difference,
      status: 'approved',
      approved_at: new Date().toISOString()
    });
    setSelectedTradeIn(tradeIn);
    setShowEditDialog(true);
  };

  const handleReject = (tradeIn: TradeInRequestWithRelations) => {
    setSelectedTradeIn(tradeIn);
    setRejectReason('');
    setShowRejectDialog(true);
  };

  const handleInspect = async (tradeIn: TradeInRequestWithRelations) => {
    await handleStatusUpdate(tradeIn.id, 'inspecting', {
      inspector_id: user?.id,
      inspected_at: new Date().toISOString()
    });
  };

  const handleAppraise = async (tradeIn: TradeInRequestWithRelations) => {
    setEditFormData({
      appraised_value: tradeIn.estimated_value || 0,
      final_trade_in_value: tradeIn.estimated_value || 0,
      status: 'appraised'
    });
    setSelectedTradeIn(tradeIn);
    setShowEditDialog(true);
  };

  const handleComplete = async (tradeIn: TradeInRequestWithRelations) => {
    await handleStatusUpdate(tradeIn.id, 'completed', {
      completed_at: new Date().toISOString()
    });
  };

  const handleCancel = async (tradeIn: TradeInRequestWithRelations) => {
    await handleStatusUpdate(tradeIn.id, 'cancelled');
  };

  const handleSaveEdit = async () => {
    if (!selectedTradeIn) return;

    try {
      const updateData: TradeInUpdateData = {
        ...editFormData,
        inspector_id: user?.id
      };

      const { error } = await TradeInService.updateTradeInRequest(selectedTradeIn.id, updateData);

      if (error) {
        console.error('Error updating trade-in:', error);
        alert('Gagal memperbarui data: ' + error.message);
      } else {
        await loadTradeIns();
        setShowEditDialog(false);
        alert('Data berhasil diperbarui');
      }
    } catch (error) {
      console.error('Error updating trade-in:', error);
      alert('Terjadi kesalahan saat memperbarui data');
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedTradeIn || !rejectReason.trim()) return;

    await handleStatusUpdate(selectedTradeIn.id, 'rejected', {
      rejection_reason: rejectReason
    });
  };

  const handleDelete = async (tradeIn: TradeInRequestWithRelations) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus trade-in untuk ${tradeIn.old_car_brand} ${tradeIn.old_car_model}?`)) {
      return;
    }

    try {
      const { error } = await TradeInService.deleteTradeInRequest(tradeIn.id);

      if (error) {
        console.error('Error deleting trade-in:', error);
        alert('Gagal menghapus data: ' + error.message);
      } else {
        await loadTradeIns();
        alert('Data berhasil dihapus');
      }
    } catch (error) {
      console.error('Error deleting trade-in:', error);
      alert('Terjadi kesalahan saat menghapus data');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Kelola Trade-In</h1>
              <p className="text-gray-600">Kelola semua permintaan trade-in mobil</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Admin
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold">{totalCount}</p>
                  </div>
                  <Car className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Menunggu</p>
                    <p className="text-2xl font-bold">{tradeIns.filter(t => t.status === 'pending').length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Disetujui</p>
                    <p className="text-2xl font-bold">{tradeIns.filter(t => t.status === 'approved').length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ditolak</p>
                    <p className="text-2xl font-bold">{tradeIns.filter(t => t.status === 'rejected').length}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Cari berdasarkan merek, model, atau plat nomor..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? undefined : value }))}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="inspecting">Inspeksi</SelectItem>
                    <SelectItem value="appraised">Dinilai</SelectItem>
                    <SelectItem value="approved">Disetujui</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({});
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                >
                  Reset Filter
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trade-In List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Daftar Permintaan Trade-In</span>
                <span className="text-sm font-normal text-gray-600">
                  Menampilkan {tradeIns.length} dari {totalCount} data
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : tradeIns.length === 0 ? (
                <div className="text-center py-8">
                  <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Data</h3>
                  <p className="text-gray-600">Belum ada permintaan trade-in saat ini</p>
                </div>
              ) : (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full border-collapse min-w-[800px]">
                    <thead>
                      <tr className="border-b bg-gray-50 sticky top-0 z-10">
                        <th className="text-left p-4 font-semibold text-gray-900 bg-gray-50 border-r">Mobil & Gambar</th>
                        <th className="text-left p-4 font-semibold text-gray-900 bg-gray-50 border-r">Informasi</th>
                        <th className="text-left p-4 font-semibold text-gray-900 bg-gray-50 border-r">Penilaian</th>
                        <th className="text-left p-4 font-semibold text-gray-900 bg-gray-50 border-r">Status</th>
                        <th className="text-center p-4 font-semibold text-gray-900 bg-gray-50">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tradeIns.map((tradeIn, index) => (
                        <tr key={tradeIn.id} className={`border-b hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                          <td className="p-4 border-r border-gray-200">
                            <div className="flex items-center gap-3">
                              {/* Car Image */}
                              <div className="flex-shrink-0">
                                {tradeIn.images && tradeIn.images.length > 0 ? (
                                  <div className="relative">
                                    <img
                                      src={tradeIn.images[0].image_url}
                                      alt={`${tradeIn.old_car_brand} ${tradeIn.old_car_model}`}
                                      className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform border border-gray-200"
                                      onClick={() => {
                                        setSelectedTradeIn(tradeIn);
                                        setShowDetailDialog(true);
                                      }}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"%3E%3Crect width="64" height="64" fill="%23f3f4f6"/%3E%3Ctext x="32" y="32" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="Arial" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E';
                                      }}
                                    />
                                    {tradeIn.images.length > 1 && (
                                      <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
                                        +{tradeIn.images.length - 1}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                    <Car className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>

                              {/* Car Info */}
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {tradeIn.old_car_brand} {tradeIn.old_car_model}
                                </h4>
                                <p className="text-sm text-gray-600">{tradeIn.old_car_year}</p>
                                {tradeIn.old_car_plate_number && (
                                  <p className="text-xs text-gray-500">Plat: {tradeIn.old_car_plate_number}</p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="p-4 border-r border-gray-200">
                            <div className="space-y-1">
                              <p className="text-sm">
                                <span className="text-gray-600">ID:</span> #{tradeIn.id.substring(0, 8)}
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-600">Tanggal:</span> {new Date(tradeIn.created_at).toLocaleDateString('id-ID')}
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-600">Tukar dengan:</span> {tradeIn.new_car?.title || 'Mobil Baru'}
                              </p>
                              <p className="text-sm">
                                <span className="text-gray-600">Pemohon:</span> User {tradeIn.user_id?.substring(0, 8)}
                              </p>
                              {tradeIn.images && tradeIn.images.length > 0 && (
                                <p className="text-sm flex items-center gap-1">
                                  <svg className="h-3 w-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {tradeIn.images.length} foto
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="p-4 border-r border-gray-200">
                            <div className="space-y-1 text-sm">
                              <div>
                                <span className="text-gray-600">Estimasi:</span>
                                <p className="font-medium">
                                  {tradeIn.estimated_value
                                    ? `Rp ${tradeIn.estimated_value.toLocaleString('id-ID')}`
                                    : '-'
                                  }
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">Penilaian:</span>
                                <p className="font-medium">
                                  {tradeIn.appraised_value
                                    ? `Rp ${tradeIn.appraised_value.toLocaleString('id-ID')}`
                                    : '-'
                                  }
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-600">Final:</span>
                                <p className="font-medium">
                                  {tradeIn.final_trade_in_value
                                    ? `Rp ${tradeIn.final_trade_in_value.toLocaleString('id-ID')}`
                                    : '-'
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 border-r border-gray-200">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(tradeIn.status)}
                            </div>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center justify-center">
                              <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-lg border">
                                {/* Detail Button - Always visible */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTradeIn(tradeIn);
                                    setShowDetailDialog(true);
                                  }}
                                  className="h-7 w-7 p-0 hover:bg-blue-100"
                                  title="Lihat Detail"
                                >
                                  <Eye className="h-3 w-3 text-blue-600" />
                                </Button>

                                <div className="w-px h-6 bg-gray-300" />

                                {/* Status-specific actions */}
                                {tradeIn.status === 'pending' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleInspect(tradeIn)}
                                    className="h-7 w-7 p-0 hover:bg-yellow-100"
                                    title="Inspeksi"
                                  >
                                    <CheckSquare className="h-3 w-3 text-yellow-600" />
                                  </Button>
                                )}

                                {tradeIn.status === 'inspecting' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAppraise(tradeIn)}
                                    className="h-7 w-7 p-0 hover:bg-orange-100"
                                    title="Nilai"
                                  >
                                    <DollarSign className="h-3 w-3 text-orange-600" />
                                  </Button>
                                )}

                                {tradeIn.status === 'appraised' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleApprove(tradeIn)}
                                      className="h-7 w-7 p-0 hover:bg-green-100"
                                      title="Setujui"
                                    >
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleReject(tradeIn)}
                                      className="h-7 w-7 p-0 hover:bg-red-100"
                                      title="Tolak"
                                    >
                                      <XCircle className="h-3 w-3 text-red-600" />
                                    </Button>
                                  </>
                                )}

                                {tradeIn.status === 'approved' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleComplete(tradeIn)}
                                    className="h-7 w-7 p-0 hover:bg-green-100"
                                    title="Selesaikan"
                                  >
                                    <CheckSquare className="h-3 w-3 text-green-600" />
                                  </Button>
                                )}

                                {/* Divider */}
                                {(tradeIn.status !== 'completed' && tradeIn.status !== 'cancelled') && (
                                  <div className="w-px h-6 bg-gray-300" />
                                )}

                                {/* Cancel and Delete */}
                                {tradeIn.status !== 'completed' && tradeIn.status !== 'cancelled' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCancel(tradeIn)}
                                    className="h-7 w-7 p-0 hover:bg-gray-200"
                                    title="Batalkan"
                                  >
                                    <X className="h-3 w-3 text-gray-600" />
                                  </Button>
                                )}

                                <div className="w-px h-6 bg-gray-300" />

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(tradeIn)}
                                  className="h-7 w-7 p-0 hover:bg-red-100"
                                  title="Hapus"
                                >
                                  <Trash2 className="h-3 w-3 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Trade-In</DialogTitle>
            </DialogHeader>
            {selectedTradeIn && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Informasi Utama</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">ID:</span>
                      <p className="font-medium">#{selectedTradeIn.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p className="font-medium">{getStatusBadge(selectedTradeIn.status)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Tanggal Pengajuan:</span>
                      <p className="font-medium">
                        {new Date(selectedTradeIn.created_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Pemohon:</span>
                      <p className="font-medium">
                        User {selectedTradeIn.user_id?.substring(0, 8)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Old Car Info */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Mobil Lama</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Merek:</span>
                      <p className="font-medium">{selectedTradeIn.old_car_brand}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Model:</span>
                      <p className="font-medium">{selectedTradeIn.old_car_model}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Tahun:</span>
                      <p className="font-medium">{selectedTradeIn.old_car_year}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Jarak Tempuh:</span>
                      <p className="font-medium">{selectedTradeIn.old_car_mileage || 0} km</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Warna:</span>
                      <p className="font-medium">{selectedTradeIn.old_car_color || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Transmisi:</span>
                      <p className="font-medium">{selectedTradeIn.old_car_transmission || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Bahan Bakar:</span>
                      <p className="font-medium">{selectedTradeIn.old_car_fuel_type || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Kondisi:</span>
                      <p className="font-medium">{selectedTradeIn.old_car_condition || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Plat Nomor:</span>
                      <p className="font-medium">{selectedTradeIn.old_car_plate_number || '-'}</p>
                    </div>
                  </div>
                  {selectedTradeIn.old_car_description && (
                    <div className="mt-3">
                      <span className="text-gray-600">Deskripsi:</span>
                      <p className="text-sm">{selectedTradeIn.old_car_description}</p>
                    </div>
                  )}
                </div>

                {/* New Car Info */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Mobil Baru</h3>
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h4 className="font-medium text-blue-900">{selectedTradeIn.new_car?.title || 'Unknown'}</h4>
                    <p className="text-blue-700">
                      Rp {selectedTradeIn.new_car?.price?.toLocaleString('id-ID') || '0'}
                    </p>
                  </div>
                </div>

                {/* Valuation Info */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Penilaian</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Estimasi Nilai:</span>
                      <p className="font-medium">
                        Rp {(selectedTradeIn.estimated_value || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Nilai Penilaian:</span>
                      <p className="font-medium">
                        Rp {(selectedTradeIn.appraised_value || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Final Trade-In:</span>
                      <p className="font-medium">
                        Rp {(selectedTradeIn.final_trade_in_value || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Selisih Harga:</span>
                      <p className="font-medium">
                        Rp {(selectedTradeIn.price_difference || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Inspection Info */}
                {(selectedTradeIn.inspection_date || selectedTradeIn.inspection_time || selectedTradeIn.inspection_location) && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Jadwal Inspeksi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {selectedTradeIn.inspection_date && (
                        <div>
                          <span className="text-gray-600">Tanggal:</span>
                          <p className="font-medium">{selectedTradeIn.inspection_date}</p>
                        </div>
                      )}
                      {selectedTradeIn.inspection_time && (
                        <div>
                          <span className="text-gray-600">Waktu:</span>
                          <p className="font-medium">{selectedTradeIn.inspection_time}</p>
                        </div>
                      )}
                      {selectedTradeIn.inspection_location && (
                        <div>
                          <span className="text-gray-600">Lokasi:</span>
                          <p className="font-medium">{selectedTradeIn.inspection_location}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedTradeIn.user_notes && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Catatan Pengguna</h3>
                    <p className="text-sm">{selectedTradeIn.user_notes}</p>
                  </div>
                )}

                {selectedTradeIn.inspection_notes && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Catatan Inspeksi</h3>
                    <p className="text-sm">{selectedTradeIn.inspection_notes}</p>
                  </div>
                )}

                {selectedTradeIn.rejection_reason && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Alasan Penolakan</h3>
                    <p className="text-sm text-red-600">{selectedTradeIn.rejection_reason}</p>
                  </div>
                )}

              {/* Images */}
                {selectedTradeIn.images && selectedTradeIn.images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Foto Mobil</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedTradeIn.images.map((image) => (
                        <div key={image.id} className="relative">
                          <img
                            src={image.image_url}
                            alt={image.caption || 'Trade-in image'}
                            className="w-full h-32 object-cover rounded cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(image.image_url, '_blank')}
                          />
                          {image.caption && (
                            <p className="text-xs text-gray-600 mt-1">{image.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit/Appraise Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editFormData.status === 'approved' ? 'Setujui Trade-In' : 'Nilai Trade-In'}
              </DialogTitle>
            </DialogHeader>
            {selectedTradeIn && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="appraisedValue">Nilai Penilaian (Rp)</Label>
                  <Input
                    id="appraisedValue"
                    type="number"
                    value={editFormData.appraised_value || ''}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      appraised_value: parseInt(e.target.value) || 0
                    }))}
                    placeholder="Contoh: 150000000"
                  />
                </div>
                <div>
                  <Label htmlFor="finalTradeInValue">Final Trade-In Value (Rp)</Label>
                  <Input
                    id="finalTradeInValue"
                    type="number"
                    value={editFormData.final_trade_in_value || ''}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      final_trade_in_value: parseInt(e.target.value) || 0
                    }))}
                    placeholder="Contoh: 140000000"
                  />
                </div>
                <div>
                  <Label htmlFor="priceDifference">Selisih Harga (Rp)</Label>
                  <Input
                    id="priceDifference"
                    type="number"
                    value={editFormData.price_difference || ''}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      price_difference: parseInt(e.target.value) || 0
                    }))}
                    placeholder="Contoh: 110000000"
                  />
                </div>
                <div>
                  <Label htmlFor="inspectionNotes">Catatan Inspeksi</Label>
                  <Textarea
                    id="inspectionNotes"
                    value={editFormData.inspection_notes || ''}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      inspection_notes: e.target.value
                    }))}
                    placeholder="Catatan hasil inspeksi mobil..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowEditDialog(false)}
                  >
                    Batal
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    Simpan
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tolak Trade-In</DialogTitle>
            </DialogHeader>
            {selectedTradeIn && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="rejectReason">Alasan Penolakan</Label>
                  <Textarea
                    id="rejectReason"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Jelaskan alasan penolakan trade-in..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectDialog(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleRejectSubmit}
                    disabled={!rejectReason.trim()}
                  >
                    Tolak
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default HalamanKelolaTradeIn;