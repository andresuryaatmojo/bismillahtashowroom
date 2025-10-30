import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import listingService from '../services/listingService';
import PaymentProofViewer from '../components/PaymentProofViewer';
import { 
  Briefcase, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  Loader2,
  Calendar,
  DollarSign,
  User,
  Car,
  Clock,
  FileText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Textarea } from '../components/ui/textarea';
import { 
  Transaction, 
  TransactionWithPayments, 
  getPurchaseTransactionsWithPayments,
  getShowroomTransactionsWithPayments,
  getExternalTransactionsWithPayments
} from '../services/transactionService';
import { Payment } from '../services/paymentService';
import carService from '../services/carService';
import { confirmBookingPayment, rejectPayment } from '../services/transactionService';

import { MessageSquare } from 'lucide-react';
import { createChatRoom, sendTextWithCarInfoMessage } from '../services/chatService';

// Interface untuk filter transaksi
interface TransactionFilter {
  status: string;
  payment_status: string;
  date_from: string;
  date_to: string;
  search: string;
  payment_method: string;
  seller_type: string; // 'all', 'showroom', 'external'
}

// Interface untuk status halaman
interface PageStatus {
  isLoading: boolean;
  error: string | null;
  selectedTransaction: TransactionWithPayments | null;
  showDetailModal: boolean;
  currentTab: string;
  showProofModal: boolean;
  currentProofUrl: string | null;
}

function HalamanKelolaTransaksi() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State untuk data transaksi
  const [transactions, setTransactions] = useState<TransactionWithPayments[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithPayments[]>([]);
  
  // State untuk menyimpan detail mobil berdasarkan car_id
  const [carDetails, setCarDetails] = useState<Record<string, any>>({});
  
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // State untuk filter
  const [filter, setFilter] = useState<TransactionFilter>({
    status: 'all',
    payment_status: 'all',
    date_from: '',
    date_to: '',
    search: '',
    payment_method: 'all',
    seller_type: 'all' // Default tampilkan semua transaksi untuk admin
  });
  
  // State untuk status halaman
  const [pageStatus, setPageStatus] = useState<PageStatus>({
    isLoading: true,
    error: null,
    selectedTransaction: null,
    showDetailModal: false,
    currentTab: 'all',
    showProofModal: false,
    currentProofUrl: null,
  });
  
  // State: konfirmasi 2 langkah untuk aksi pembayaran
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmActionType, setConfirmActionType] = useState<'confirm' | 'reject' | null>(null);
  const [selectedPaymentForAction, setSelectedPaymentForAction] = useState<Payment | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  
  // State untuk statistik
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    totalAmount: 0,
  });

  // Fungsi untuk memuat data transaksi berdasarkan jenis penjual
  const loadTransactions = async (): Promise<TransactionWithPayments[] | undefined> => {
    setPageStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      let result: { success: boolean; data?: TransactionWithPayments[]; total?: number; error?: string };
      console.log('Loading transactions dengan filter:', filter.seller_type);
      
      if (filter.seller_type === 'showroom') {
        result = await getShowroomTransactionsWithPayments(1, 100);
      } else if (filter.seller_type === 'external') {
        result = await getExternalTransactionsWithPayments(1, 100);
      } else {
        // 'all' -> ambil semua transaksi pembelian
        result = await getPurchaseTransactionsWithPayments(1, 100);
      }
      
      if (result.success && result.data) {
        setTransactions(result.data);
        setFilteredTransactions(result.data);
        
        // Hitung statistik
        const total = result.data.length;
        const pending = result.data.filter((t: TransactionWithPayments) => t.transaction.status === 'pending').length;
        const completed = result.data.filter((t: TransactionWithPayments) => t.transaction.status === 'completed').length;
        const cancelled = result.data.filter((t: TransactionWithPayments) => t.transaction.status === 'cancelled').length;
        const totalAmount = result.data.reduce((sum: number, t: TransactionWithPayments) => sum + Number(t.transaction.total_amount), 0);
        
        setStats({
          total,
          pending,
          completed,
          cancelled,
          totalAmount,
        });
        return result.data; // kembalikan data terbaru
      } else {
        setPageStatus(prev => ({ ...prev, error: result.error || 'Gagal memuat data transaksi' }));
        return undefined;
      }
    } catch (error) {
      setPageStatus(prev => ({ ...prev, error: 'Terjadi kesalahan saat memuat data' }));
      return undefined;
    } finally {
      setPageStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Fungsi untuk filter transaksi
  const applyFilter = () => {
    let filtered = [...transactions];
    
    // Filter berdasarkan status
    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter(t => t.transaction.status === filter.status);
    }
    
    // Filter berdasarkan status pembayaran
    if (filter.payment_status && filter.payment_status !== 'all') {
      filtered = filtered.filter(t => t.transaction.payment_status === filter.payment_status);
    }
    
    // Filter berdasarkan metode pembayaran
    if (filter.payment_method && filter.payment_method !== 'all') {
      filtered = filtered.filter(t => t.transaction.payment_method === filter.payment_method);
    }
    
    // Filter berdasarkan tanggal
    if (filter.date_from) {
      const fromDate = new Date(filter.date_from);
      filtered = filtered.filter(t => new Date(t.transaction.created_at || '') >= fromDate);
    }
    
    if (filter.date_to) {
      const toDate = new Date(filter.date_to);
      toDate.setHours(23, 59, 59, 999); // Set to end of day
      filtered = filtered.filter(t => new Date(t.transaction.created_at || '') <= toDate);
    }
    
    // Filter berdasarkan pencarian (invoice number atau id)
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(t => 
        (t.transaction.invoice_number?.toLowerCase().includes(searchLower)) || 
        t.transaction.id.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredTransactions(filtered);
    setCurrentPage(1); // Reset ke halaman pertama setelah filter
  };

  // Fungsi untuk reset filter
  const resetFilter = () => {
    setFilter({
      status: 'all',
      payment_status: 'all',
      date_from: '',
      date_to: '',
      search: '',
      payment_method: 'all',
      seller_type: 'all', // Default ke semua
    });
    setFilteredTransactions(transactions);
    setCurrentPage(1);
  };

  // Fungsi untuk menampilkan detail transaksi
  const showTransactionDetail = (transaction: TransactionWithPayments) => {
    setPageStatus(prev => ({
      ...prev,
      selectedTransaction: transaction,
      showDetailModal: true,
    }));
  };

  // Fungsi untuk menutup modal detail
  const closeDetailModal = () => {
    setPageStatus(prev => ({
      ...prev,
      showDetailModal: false,
    }));
  };

  // Fungsi helper untuk mendapatkan URL publik dari path storage
  const getPublicUrlFromPath = (proofPath: string): string => {
    // Jika sudah berupa URL lengkap, return apa adanya
    if (proofPath.startsWith('http')) {
      return proofPath;
    }
    
    // Ekstrak filename dari path
    let fileName = proofPath;
    if (proofPath.includes('/payment-proofs/')) {
      const parts = proofPath.split('/payment-proofs/');
      fileName = parts[parts.length - 1];
    }
    
    // Generate URL publik
    const { data } = supabase.storage
      .from('payment-proofs')
      .getPublicUrl(fileName);
    
    return data?.publicUrl || proofPath;
  };

  // Fungsi untuk membuka modal preview gambar
  const openProofModal = (proofUrl: string) => {
    const publicUrl = getPublicUrlFromPath(proofUrl);
    setPageStatus(prev => ({
      ...prev,
      showProofModal: true,
      currentProofUrl: publicUrl,
    }));
  };

  // Fungsi untuk menutup modal preview gambar
  const closeProofModal = () => {
    setPageStatus(prev => ({
      ...prev,
      showProofModal: false,
      currentProofUrl: null,
    }));
  };

  // Fungsi untuk melihat bukti pembayaran
  const handleOpenProof = async (proof?: string) => {
    if (!proof) return;

    try {
      console.log('Membuka bukti pembayaran:', proof);

      // Normalisasi path menjadi public URL Supabase sebelum membuka
      const normalizedUrl = getPublicUrlFromPath(proof);
      openProofModal(normalizedUrl);
      
    } catch (err) {
      console.error('Error membuka bukti pembayaran:', err);
      alert('Terjadi kesalahan saat membuka bukti pembayaran');
    }
  };

  // Fungsi untuk konfirmasi pembayaran booking
  const handleConfirmBooking = async (payment: Payment) => {
    if (!pageStatus.selectedTransaction || !user?.id) return;
    try {
      setPageStatus(prev => ({ ...prev, isLoading: true }));
      const res = await confirmBookingPayment(
        pageStatus.selectedTransaction.transaction.id,
        payment.id,
        user.id
      );
      if (!res.success) {
        alert(res.error || 'Gagal konfirmasi pembayaran');
      } else {
        const updatedList = await loadTransactions();
        const source = updatedList ?? transactions;
        const updated = source.find(t => t.transaction.id === pageStatus.selectedTransaction!.transaction.id);
        setPageStatus(prev => ({
          ...prev,
          selectedTransaction: updated || prev.selectedTransaction,
          isLoading: false
        }));
        alert('Pembayaran booking fee dikonfirmasi');
      }
    } catch (e) {
      alert('Terjadi kesalahan saat konfirmasi');
    } finally {
      setPageStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Fungsi untuk menolak pembayaran (ditambah parameter alasan)
  const handleRejectPayment = async (payment: Payment, reason?: string) => {
    if (!user?.id) return;
    try {
      setPageStatus(prev => ({ ...prev, isLoading: true }));
      const res = await rejectPayment(payment.id, user.id, reason);
      if (!res.success) {
        alert(res.error || 'Gagal menolak pembayaran');
      } else {
        const updatedList = await loadTransactions();
        const source = updatedList ?? transactions;
        if (pageStatus.selectedTransaction) {
          const updated = source.find(t => t.transaction.id === pageStatus.selectedTransaction!.transaction.id);
          setPageStatus(prev => ({
            ...prev,
            selectedTransaction: updated || prev.selectedTransaction,
            isLoading: false
          }));
        }
        alert('Pembayaran ditolak');
      }
    } catch {
      alert('Terjadi kesalahan saat menolak pembayaran');
    } finally {
      setPageStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Pembuka modal konfirmasi aksi
  const openActionConfirm = (type: 'confirm' | 'reject', payment: Payment) => {
    setConfirmActionType(type);
    setSelectedPaymentForAction(payment);
    setRejectNote('');
    setConfirmModalOpen(true);
  };

  // Eksekusi aksi setelah konfirmasi dari modal
  const performConfirmAction = async () => {
    if (!selectedPaymentForAction || !confirmActionType) return;
    if (confirmActionType === 'confirm') {
      await handleConfirmBooking(selectedPaymentForAction);
    } else {
      await handleRejectPayment(selectedPaymentForAction, rejectNote || undefined);
    }
    setConfirmModalOpen(false);
  };

  // Fungsi untuk chat dengan pembeli
  const handleChatBuyer = async (tx: TransactionWithPayments['transaction']) => {
    try {
      if (!user?.id || !tx.buyer_id) {
        alert('User belum login atau pembeli tidak valid');
        return;
      }
      
      // Buat atau ambil room chat
      const room = await createChatRoom(tx.buyer_id, user.id, tx.car_id);
      
      // Jika ada car_id, kirim lampiran mobil secara otomatis
      if (tx.car_id) {
        try {
          await sendTextWithCarInfoMessage(
            room.id,
            user.id,
            tx.buyer_id,
            'Halo! Saya ingin membahas transaksi mobil ini dengan Anda.',
            tx.car_id
          );
        } catch (carError) {
          console.error('Gagal mengirim lampiran mobil:', carError);
          // Tetap lanjut ke chat meskipun gagal kirim lampiran
        }
      }
      
      navigate('/admin/chat', { state: { activeRoomId: room.id } });
    } catch (e) {
      alert('Gagal membuka chat');
    }
  };

  // Fungsi untuk mengubah tab
  const changeTab = (tab: string) => {
    setPageStatus(prev => ({ ...prev, currentTab: tab }));
    
    if (tab === 'all') {
      setFilteredTransactions(transactions);
    } else if (tab === 'pending') {
      setFilteredTransactions(transactions.filter(t => t.transaction.status === 'pending'));
    } else if (tab === 'completed') {
      setFilteredTransactions(transactions.filter(t => t.transaction.status === 'completed'));
    } else if (tab === 'cancelled') {
      setFilteredTransactions(transactions.filter(t => t.transaction.status === 'cancelled'));
    }
    
    setCurrentPage(1);
  };

  // Fungsi untuk format tanggal
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Fungsi untuk format mata uang
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Fungsi untuk mendapatkan warna badge berdasarkan status
  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'ditolak': // label tampilan override saat payment failed
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fungsi untuk mendapatkan warna badge berdasarkan status pembayaran
  const getPaymentStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'partial':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fungsi untuk mengecek apakah transaksi memiliki bukti pembayaran
  const hasPaymentProof = (transaction: TransactionWithPayments): boolean => {
    if (Array.isArray(transaction.payments)) {
      return transaction.payments.some(p => !!p.proof_of_payment);
    }
    return false;
  };

  // Tambahan: cek apakah ada pembayaran yang ditolak/failed
  const hasFailedPayment = (transaction: TransactionWithPayments): boolean => {
    const fromPayments = Array.isArray(transaction.payments)
      ? transaction.payments.some(p => p.status === 'failed')
      : false;
    const fromHeader = transaction.transaction.payment_status === 'failed';
    return fromPayments || fromHeader;
  };

  // Fungsi untuk mengecek apakah transaksi belum dibayar
  const isUnpaid = (transaction: TransactionWithPayments): boolean => {
    return transaction.transaction.payment_status === 'pending' && !hasPaymentProof(transaction);
  };

  // Ubah: pending konfirmasi hanya jika tidak ada failed
  const isWaitingAdminConfirm = (transaction: TransactionWithPayments): boolean => {
    return transaction.transaction.status === 'pending' && hasPaymentProof(transaction) && !hasFailedPayment(transaction);
  };

  // Util: status transaksi yang ditampilkan (override ke 'ditolak' bila failed)
  const getDisplayTransactionStatus = (transaction: TransactionWithPayments): string => {
    if (hasFailedPayment(transaction)) return 'ditolak';
    return transaction.transaction.status || 'pending';
  };

  // Util: status pembayaran yang ditampilkan (override ke 'failed' bila ada payment gagal)
  const getDisplayPaymentStatus = (t: TransactionWithPayments): Transaction['payment_status'] => {
    const failed = Array.isArray(t.payments) && t.payments.some(p => p.status === 'failed');
    if (failed) return 'failed';
    return (t.transaction.payment_status || 'pending') as Transaction['payment_status'];
  };

  // Fungsi untuk render status badge yang lebih detail
  const renderDetailedStatusBadge = (transaction: TransactionWithPayments) => {
    if (hasFailedPayment(transaction)) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Ditolak
        </span>
      );
    }
    if (isUnpaid(transaction)) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Belum Bayar
        </span>
      );
    }
    if (isWaitingAdminConfirm(transaction)) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Pending Konfirmasi
        </span>
      );
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(transaction.transaction.status)} capitalize`}>
        {transaction.transaction.status}
      </span>
    );
  };

  // Effect untuk memuat data transaksi saat komponen dimount dan ketika filter seller_type berubah
  useEffect(() => {
    loadTransactions();
  }, [filter.seller_type]);

  // Effect untuk menerapkan filter saat filter berubah
  useEffect(() => {
    applyFilter();
  }, [filter]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Efek: ketika transaksi halaman saat ini berubah, muat detail mobilnya
  useEffect(() => {
    const loadCars = async () => {
      const ids = Array.from(new Set(currentTransactions.map(t => t.transaction.car_id)));
      const missing = ids.filter(id => !carDetails[id]);
      if (missing.length === 0) return;

      const results = await Promise.all(missing.map(id => carService.getCarById(id)));
      const updates: Record<string, any> = {};
      missing.forEach((id, idx) => { updates[id] = results[idx]; });
      setCarDetails(prev => ({ ...prev, ...updates }));
    };
    loadCars();
  }, [currentTransactions, carDetails]);

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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">Kelola Transaksi Pembelian</h1>
              <Badge 
                variant={filter.seller_type === 'showroom' ? 'default' : 'secondary'}
                className="text-sm"
              >
                {filter.seller_type === 'showroom' ? 'Transaksi Showroom' : 
                 filter.seller_type === 'external' ? 'Transaksi Eksternal' : 'Semua Transaksi'}
              </Badge>
            </div>
            <p className="text-gray-600 mt-1">
              {filter.seller_type === 'showroom'
                ? 'Kelola dan pantau transaksi pembelian mobil dari showroom (admin)'
                : filter.seller_type === 'external'
                ? 'Kelola dan pantau transaksi pembelian mobil dari penjual eksternal'
                : 'Kelola dan pantau semua transaksi pembelian mobil dari semua penjual'}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={loadTransactions}
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Transaksi</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Selesai</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Dibatalkan</p>
                  <p className="text-2xl font-bold">{stats.cancelled}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Nilai</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filter and Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow overflow-hidden"
        >
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Cari berdasarkan invoice atau ID transaksi..."
                    className="pl-10"
                    value={filter.search}
                    onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select
                  value={filter.status}
                  onValueChange={(value) => setFilter({ ...filter, status: value })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status Transaksi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                    <SelectItem value="processing">Diproses</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                    <SelectItem value="refunded">Dikembalikan</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={filter.payment_status}
                  onValueChange={(value) => setFilter({ ...filter, payment_status: value })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status Pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Sebagian</SelectItem>
                    <SelectItem value="paid">Lunas</SelectItem>
                    <SelectItem value="failed">Gagal</SelectItem>
                    <SelectItem value="refunded">Dikembalikan</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={filter.seller_type}
                  onValueChange={(value) => setFilter({ ...filter, seller_type: value })}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Jenis Penjual" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="showroom">Showroom</SelectItem>
                    <SelectItem value="external">Eksternal</SelectItem>
                    <SelectItem value="all">Semua</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={resetFilter} className="flex items-center">
                  <RefreshCw size={16} className="mr-2" />
                  Reset
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="date_from" className="whitespace-nowrap">Dari Tanggal:</Label>
                <Input
                  id="date_from"
                  type="date"
                  value={filter.date_from}
                  onChange={(e) => setFilter({ ...filter, date_from: e.target.value })}
                  className="w-auto"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="date_to" className="whitespace-nowrap">Sampai Tanggal:</Label>
                <Input
                  id="date_to"
                  type="date"
                  value={filter.date_to}
                  onChange={(e) => setFilter({ ...filter, date_to: e.target.value })}
                  className="w-auto"
                />
              </div>
              
              <div className="flex-1">
                <Select
                  value={filter.payment_method}
                  onValueChange={(value) => setFilter({ ...filter, payment_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Metode Pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Metode</SelectItem>
                    <SelectItem value="cash">Tunai</SelectItem>
                    <SelectItem value="transfer">Transfer Bank</SelectItem>
                    <SelectItem value="credit_card">Kartu Kredit</SelectItem>
                    <SelectItem value="debit_card">Kartu Debit</SelectItem>
                    <SelectItem value="e-wallet">E-Wallet</SelectItem>
                    <SelectItem value="financing">Pembiayaan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Tabs defaultValue="all" value={pageStatus.currentTab} onValueChange={changeTab}>
              <TabsList className="grid grid-cols-4 md:w-[400px]">
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Selesai</TabsTrigger>
                <TabsTrigger value="cancelled">Dibatalkan</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            {pageStatus.isLoading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Memuat data transaksi...</span>
              </div>
            ) : pageStatus.error ? (
              <div className="flex justify-center items-center p-8 text-red-600">
                <AlertCircle className="w-6 h-6 mr-2" />
                <span>{pageStatus.error}</span>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="flex flex-col justify-center items-center p-8 text-gray-500">
                <FileText className="w-12 h-12 mb-2" />
                <span>Tidak ada transaksi yang ditemukan</span>
              </div>
            ) : (
              // Ganti tabel lama dengan daftar kartu transaksi
              <div className="p-4 space-y-4">
                {currentTransactions.map((item) => {
                  const tx = item.transaction;
                  const car = carDetails[tx.car_id];
                  
                  // Deklarasikan sebelum dipakai di JSX untuk menghindari TS2448
                  const title =
                    car?.title ||
                    `${car?.car_brands?.name || ''} ${car?.car_models?.name || ''}`.trim() ||
                    `Mobil ${tx.car_id.substring(0, 8)}...`;
                  
                  // Ganti fallback ke data URI SVG agar tidak request ke via.placeholder.com
                  const imageUrl =
                    car?.car_images?.[0]?.image_url ||
                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="100%" height="100%" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-size="16" font-family="sans-serif">Mobil</text></svg>';
                  
                  const bookingFee =
                    typeof tx.down_payment === 'number' && tx.down_payment > 0
                      ? tx.down_payment
                      : Math.min(Number(tx.total_amount) || 0, Number(tx.total_amount) || 0);
              
                  return (
                    <div
                      key={tx.id}
                      className="bg-white rounded-lg shadow hover:shadow-md transition p-4"
                    >
                      {/* Header kiri: pembeli + tanggal + badge status; kanan: invoice */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <User className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold">
                            {tx.buyer_name || 'Pembeli Tidak Diketahui'}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {formatDate(tx.created_at)}
                          </span>
                          {renderDetailedStatusBadge(item)}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          {tx.invoice_number || tx.id}
                        </div>
                      </div>
              
                      {/* Konten utama: gambar, judul, qty x harga unit; kanan total */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4 mb-4 md:mb-0">
                          <div className="w-20 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={imageUrl}
                              alt={title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="100%" height="100%" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-size="16" font-family="sans-serif">Mobil</text></svg>';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-semibold">{title}</p>
                            <p className="text-sm text-gray-600">
                              1 Biaya Pemesanan x {formatCurrency(Number(bookingFee))}
                            </p>
                          </div>
                        </div>
              
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total Belanja</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(Number(tx.total_amount))}
                          </p>
                        </div>
                      </div>
              
                      {/* Aksi kanan: Lihat detail */}
                      <div className="mt-4 flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => showTransactionDetail(item)}>
                          Lihat Detail Transaksi
                        </Button>
                        <Button variant="outline" onClick={() => handleChatBuyer(tx)}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Chat Pembeli
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {!pageStatus.isLoading && !pageStatus.error && filteredTransactions.length > 0 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Menampilkan <span className="font-medium">{startIndex + 1}</span> sampai{' '}
                    <span className="font-medium">{Math.min(endIndex, filteredTransactions.length)}</span> dari{' '}
                    <span className="font-medium">{filteredTransactions.length}</span> transaksi
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button
                      variant="outline"
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      &laquo; Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next &raquo;
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Detail Modal */}
      <Dialog open={pageStatus.showDetailModal} onOpenChange={closeDetailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
          </DialogHeader>
          
          {pageStatus.selectedTransaction && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Informasi Pembeli</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nama:</span>
                      <span className="font-medium">{pageStatus.selectedTransaction.transaction.buyer_name || 'Tidak Diketahui'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="text-sm">{pageStatus.selectedTransaction.transaction.buyer_email || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Telepon:</span>
                      <span className="text-sm">{pageStatus.selectedTransaction.transaction.buyer_phone || '-'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Informasi Transaksi</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Invoice:</span>
                      <span className="font-medium">{pageStatus.selectedTransaction.transaction.invoice_number || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tanggal:</span>
                      <span>{formatDate(pageStatus.selectedTransaction.transaction.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(getDisplayTransactionStatus(pageStatus.selectedTransaction))}`}>
                        {getDisplayTransactionStatus(pageStatus.selectedTransaction)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Metode Pembayaran:</span>
                      <span>{pageStatus.selectedTransaction.transaction.payment_method || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status Pembayaran:</span>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadgeColor(getDisplayPaymentStatus(pageStatus.selectedTransaction))}`}>
                        {getDisplayPaymentStatus(pageStatus.selectedTransaction)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Informasi Keuangan</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Harga Mobil:</span>
                      <span>{formatCurrency(Number(pageStatus.selectedTransaction.transaction.car_price))}</span>
                    </div>
                    {(pageStatus.selectedTransaction.transaction.trade_in_value ?? 0) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Nilai Trade-In:</span>
                        <span>-{formatCurrency(Number(pageStatus.selectedTransaction.transaction.trade_in_value ?? 0))}</span>
                      </div>
                    )}
                    {(pageStatus.selectedTransaction.transaction.discount_amount ?? 0) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Diskon:</span>
                        <span>-{formatCurrency(Number(pageStatus.selectedTransaction.transaction.discount_amount ?? 0))}</span>
                      </div>
                    )}
                    {(pageStatus.selectedTransaction.transaction.admin_fee ?? 0) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Biaya Admin:</span>
                        <span>{formatCurrency(Number(pageStatus.selectedTransaction.transaction.admin_fee ?? 0))}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(Number(pageStatus.selectedTransaction.transaction.total_amount))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dibayar:</span>
                      <span>{formatCurrency(pageStatus.selectedTransaction.paymentSummary.totalPaid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sisa:</span>
                      <span>{formatCurrency(Number(pageStatus.selectedTransaction.transaction.total_amount) - pageStatus.selectedTransaction.paymentSummary.totalPaid)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Riwayat Pembayaran</h3>
                {pageStatus.selectedTransaction.payments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Belum ada riwayat pembayaran</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tanggal
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipe
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Metode
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Jumlah
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bukti
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pageStatus.selectedTransaction.payments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(payment.payment_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.payment_type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.payment_method}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatCurrency(Number(payment.amount))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                payment.status === 'success' ? 'bg-green-100 text-green-800' :
                                payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                payment.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                                payment.status === 'refunded' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {payment.proof_of_payment ? (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleOpenProof(payment.proof_of_payment)}
                                  className="flex items-center gap-1"
                                >
                                  <Eye className="w-4 h-4" /> 
                                  Lihat
                                </Button>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Aksi Verifikasi Admin */}
              {(() => {
                const dp = pageStatus.selectedTransaction.payments.find(
                  p => p.payment_type === 'down_payment' &&
                       (p.status === 'pending' || p.status === 'processing') &&
                       !!p.proof_of_payment
                );
                return dp ? (
                  <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="text-sm text-yellow-800">
                      Bukti transfer DP telah diunggah. Konfirmasi pembayaran booking?
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => openActionConfirm('reject', dp)}>
                        <XCircle className="w-4 h-4 mr-1" /> Tolak
                      </Button>
                      <Button onClick={() => openActionConfirm('confirm', dp)}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Konfirmasi Booking
                      </Button>
                    </div>
                  </div>
                ) : null;
              })()}

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="outline" onClick={() => pageStatus.selectedTransaction && handleChatBuyer(pageStatus.selectedTransaction.transaction)}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat Pembeli
                </Button>
                <Button variant="outline" onClick={closeDetailModal}>
                  Tutup
                </Button>
                <Button>
                  Cetak Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Preview Gambar Bukti Pembayaran */}
      <PaymentProofViewer
        isOpen={pageStatus.showProofModal}
        onClose={closeProofModal}
        proofUrl={pageStatus.currentProofUrl}
      />

      {/* Modal Konfirmasi Aksi Pembayaran */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={confirmActionType === 'reject' ? 'text-red-600' : ''}>
              {confirmActionType === 'reject' ? 'Tolak Pembayaran' : 'Konfirmasi Pembayaran'}
            </DialogTitle>
            <DialogDescription>
              {confirmActionType === 'reject'
                ? 'Anda akan menolak bukti pembayaran ini.'
                : 'Anda akan mengkonfirmasi bukti pembayaran ini.'}
            </DialogDescription>
          </DialogHeader>

          {confirmActionType === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="rejectNote">Alasan penolakan (opsional)</Label>
              <textarea
                id="rejectNote"
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                className="w-full border rounded-md p-2 text-sm"
                rows={3}
                placeholder="Tulis alasan penolakan (opsional)"
              />
            </div>
          )}

          <div className="flex gap-2 pt-4 justify-end">
            <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>Batal</Button>
            <Button onClick={performConfirmAction}>
              {confirmActionType === 'reject' ? 'Tolak Pembayaran' : 'Konfirmasi'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HalamanKelolaTransaksi;