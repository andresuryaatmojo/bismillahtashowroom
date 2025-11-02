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
  FileText,
  MessageSquare
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
  BookingStatus,
  getPurchaseTransactionsWithPayments,
  getShowroomTransactionsWithPayments,
  getExternalTransactionsWithPayments,
  markAsPaidFull,
  markAsPaidCredit,
  recordHandover,
  confirmBookingPayment,
  rejectPayment,
  cancelTransaction,
  refundBookingFee
} from '../services/transactionService';
import { Payment } from '../services/paymentService';
import carService from '../services/carService';
import { createChatRoom, sendTextWithCarInfoMessage } from '../services/chatService';
import { useToast } from '../components/ui/use-toast';

// Interface untuk filter transaksi
interface TransactionFilter {
  status: string;
  booking_status: string; // TAMBAHAN
  payment_status: string;
  date_from: string;
  date_to: string;
  search: string;
  payment_method: string;
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

const HalamanKelolaTransaksiUser: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Helper functions for refund request detection and parsing
  const hasRefundRequest = (t: TransactionWithPayments): boolean => {
    return !!t.transaction.notes && t.transaction.notes.includes('REFUND_REQUEST|');
  };

  const parseRefundRequest = (notes?: string): {
    bank_name?: string;
    account_number?: string;
    account_holder?: string;
    reason?: string;
    requested_by?: string;
    requested_at?: string;
  } => {
    if (!notes) return {};
    const line = notes.split('\n').find(l => l.startsWith('REFUND_REQUEST|'));
    if (!line) return {};
    const payload = line.replace('REFUND_REQUEST|', '');
    const obj: Record<string, string> = {};
    payload.split(';').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k) obj[k] = v || '';
    });
    return {
      bank_name: obj.bank_name,
      account_number: obj.account_number,
      account_holder: obj.account_holder,
      reason: obj.reason,
      requested_by: obj.requested_by,
      requested_at: obj.requested_at,
    };
  };

  const rejectRefundRequest = async (transaction: TransactionWithPayments) => {
    if (!user?.id) return;
    const reason = (prompt('Alasan menolak refund:') || '').trim();
    if (!reason) {
      alert('Alasan wajib diisi');
      return;
    }
    const tag = `REFUND_REJECTED|reason=${reason};rejected_by=${user.id};rejected_at=${new Date().toISOString()}`;
    const newNotes = transaction.transaction.notes ? `${transaction.transaction.notes}\n${tag}` : tag;
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ notes: newNotes })
        .eq('id', transaction.transaction.id);
      if (error) {
        alert(error.message);
        return;
      }
      // Refresh selected transaction in state
      const updatedList = await loadTransactions();
      const source = updatedList ?? transactions;
      const updated = source.find(t => t.transaction.id === transaction.transaction.id);
      setPageStatus(prev => ({ ...prev, selectedTransaction: updated || prev.selectedTransaction }));
      alert('Pengajuan refund ditolak.');
    } catch (e) {
      alert('Gagal menolak refund');
    }
  };
  
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
    booking_status: 'all', // TAMBAHAN
    payment_status: 'all',
    date_from: '',
    date_to: '',
    search: '',
    payment_method: 'all'
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
  
  // State untuk konfirmasi 2 langkah untuk aksi pembayaran
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmActionType, setConfirmActionType] = useState<'confirm' | 'reject' | null>(null);
  const [selectedPaymentForAction, setSelectedPaymentForAction] = useState<Payment | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  
  // State untuk modal pembatalan transaksi
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  
  // State untuk modal refund booking fee
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundProofFile, setRefundProofFile] = useState<File | null>(null);
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  
  // State untuk statistik
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    totalAmount: 0,
  });

  // Tambahkan state baru untuk modal pembayaran final dan handover 
  const [showPaymentModal, setShowPaymentModal] = useState(false); 
  const [paymentModalType, setPaymentModalType] = useState<'full' | 'credit' | null>(null); 
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null); 
  const [paymentNotes, setPaymentNotes] = useState(''); 
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false); 
 
  const [showHandoverModal, setShowHandoverModal] = useState(false); 
  const [handoverPhotoFile, setHandoverPhotoFile] = useState<File | null>(null); 
  const [handoverNotes, setHandoverNotes] = useState(''); 
  const [isSubmittingHandover, setIsSubmittingHandover] = useState(false);
  
  // Inisialisasi kontroler transaksi
  // Tidak lagi menggunakan KontrollerTransaksi untuk cancel/refund

  // Fungsi untuk memuat data transaksi dari mobil yang dijual user seller ini
  const loadTransactions = async (): Promise<TransactionWithPayments[] | undefined> => {
    setPageStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    if (!user?.id) {
      setPageStatus(prev => ({ ...prev, error: 'User tidak ditemukan', isLoading: false }));
      return undefined;
    }
    
    try {
      // Ambil semua mobil yang dijual oleh user ini
      const { data: userCars, error: carsError } = await supabase
        .from('cars')
        .select('id')
        .eq('seller_id', user.id);

      if (carsError) {
        setPageStatus(prev => ({ ...prev, error: carsError.message }));
        return undefined;
      }

      if (!userCars || userCars.length === 0) {
        setTransactions([]);
        setFilteredTransactions([]);
        setStats({ total: 0, pending: 0, completed: 0, cancelled: 0, totalAmount: 0 });
        return [];
      }

      const userCarIds = userCars.map(car => car.id);
      
      // Build filter options
      const filterOpts = {
        status: filter.status !== 'all' ? [filter.status as Transaction['status']] : undefined,
        booking_status: filter.booking_status !== 'all' ? [filter.booking_status as BookingStatus] : undefined,
        payment_status: filter.payment_status !== 'all' ? [filter.payment_status as Transaction['payment_status']] : undefined,
        search: filter.search || undefined
      };
      
      // Query transaksi hanya untuk mobil yang dijual user ini
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('transaction_type', 'purchase')
        .in('car_id', userCarIds)
        .order('created_at', { ascending: false })
        .range(0, 99); // Ambil maksimal 100 transaksi

      if (filterOpts.status && filterOpts.status.length) {
        query = query.in('status', filterOpts.status);
      }
      if (filterOpts.booking_status && filterOpts.booking_status.length) {
        query = query.in('booking_status', filterOpts.booking_status);
      }
      if (filterOpts.payment_status && filterOpts.payment_status.length) {
        query = query.in('payment_status', filterOpts.payment_status);
      }
      if (filterOpts.search && filterOpts.search.trim()) {
        query = query.ilike('invoice_number', `%${filterOpts.search.trim()}%`);
      }

      const { data: transactions, error, count } = await query;

      if (error) {
        setPageStatus(prev => ({ ...prev, error: error.message }));
        return undefined;
      }

      // Ambil data buyer untuk setiap transaksi
      const buyerIds = [...new Set((transactions || []).map((tx: any) => tx.buyer_id).filter(Boolean))];
      let buyersMap: Record<string, any> = {};
      if (buyerIds.length > 0) {
        const { data: buyers } = await supabase
          .from('users')
          .select('id, full_name, email, phone_number')
          .in('id', buyerIds);

        if (buyers) {
          buyersMap = buyers.reduce((acc, buyer) => {
            acc[buyer.id] = buyer;
            return acc;
          }, {} as Record<string, any>);
        }
      }

      const txns = (transactions || []).map((tx: any) => {
        const buyer = buyersMap[tx.buyer_id];
        return {
          ...tx,
          buyer_name: buyer?.full_name || null,
          buyer_email: buyer?.email || null,
          buyer_phone: buyer?.phone_number || null,
        };
      }) as Transaction[];

      // Ambil data payments untuk setiap transaksi
      if (txns.length > 0) {
        const ids = txns.map(t => t.id);
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*')
          .in('transaction_id', ids);

        if (paymentsError) {
          setPageStatus(prev => ({ ...prev, error: paymentsError.message }));
          return undefined;
        }

        const paymentsByTxn = new Map<string, Payment[]>();
        (paymentsData || []).forEach(p => {
          const list = paymentsByTxn.get(p.transaction_id) || [];
          list.push(p as Payment);
          paymentsByTxn.set(p.transaction_id, list);
        });

        const combined: TransactionWithPayments[] = txns.map(txn => {
          const list = paymentsByTxn.get(txn.id) || [];
          const totalPaid = list
            .filter(p => p.status === 'success')
            .reduce((sum, p) => sum + (p.amount || 0), 0);
          const latest = list.slice().sort(
            (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
          )[0];

          return {
            transaction: txn,
            payments: list,
            paymentSummary: {
              count: list.length,
              totalPaid,
              latestStatus: latest?.status,
              latestPaidAt: latest?.status === 'success' ? latest.payment_date : null,
            },
          };
        });

        setTransactions(combined);
        setFilteredTransactions(combined);
        
        // Hitung statistik
        const total = combined.length;
        const pending = combined.filter(t => t.transaction.booking_status === 'booking_pending').length;
        const completed = combined.filter(t => t.transaction.status === 'completed').length;
        const cancelled = combined.filter(t => 
          t.transaction.status === 'cancelled' || 
          t.transaction.booking_status === 'booking_cancelled'
        ).length;
        const totalAmount = combined.reduce((sum, t) => sum + Number(t.transaction.total_amount), 0);
        
        setStats({ total, pending, completed, cancelled, totalAmount });
        return combined;
      } else {
        setTransactions([]);
        setFilteredTransactions([]);
        setStats({ total: 0, pending: 0, completed: 0, cancelled: 0, totalAmount: 0 });
        return [];
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
    
    // Filter berdasarkan booking status - TAMBAHAN
    if (filter.booking_status && filter.booking_status !== 'all') {
      filtered = filtered.filter(t => t.transaction.booking_status === filter.booking_status);
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
      booking_status: 'all',
      payment_status: 'all',
      date_from: '',
      date_to: '',
      search: '',
      payment_method: 'all'
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
    
  // Fungsi untuk membuka modal pembayaran final 
  const openPaymentModal = (type: 'full' | 'credit') => { 
    setPaymentModalType(type); 
    setPaymentProofFile(null); 
    setPaymentNotes(''); 
    setShowPaymentModal(true); 
  }; 
 
  // Fungsi untuk submit pembayaran final 
  const handleSubmitFinalPayment = async () => { 
    if (!pageStatus.selectedTransaction || !user?.id || !paymentModalType) return; 
    
    try { 
      setIsSubmittingPayment(true); 
      
      let proofUrl: string | undefined; 
      
      // Upload bukti pembayaran jika ada 
      if (paymentProofFile) { 
        const fileExt = paymentProofFile.name.split('.').pop(); 
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`; 
        
        const { error: uploadError } = await supabase.storage 
          .from('payment-proofs') 
          .upload(fileName, paymentProofFile); 
          
        if (uploadError) throw uploadError; 
        
        const { data } = supabase.storage 
          .from('payment-proofs') 
          .getPublicUrl(fileName); 
          
        proofUrl = data.publicUrl; 
      } 
      
      // Call service function 
      const result = paymentModalType === 'full' 
        ? await markAsPaidFull(pageStatus.selectedTransaction.transaction.id, user.id, { 
            payment_proof: proofUrl, 
            payment_notes: paymentNotes 
          }) 
        : await markAsPaidCredit(pageStatus.selectedTransaction.transaction.id, user.id, { 
            payment_proof: proofUrl, 
            payment_notes: paymentNotes 
          }); 
      
      if (!result.success) { 
        alert(result.error || 'Gagal mencatat pembayaran'); 
        return; 
      } 
      
      // Reload data 
      const updatedList = await loadTransactions(); 
      const source = updatedList ?? transactions; 
      const updated = source.find(t => t.transaction.id === pageStatus.selectedTransaction!.transaction.id); 
      
      setPageStatus(prev => ({ 
        ...prev, 
        selectedTransaction: updated || prev.selectedTransaction, 
      })); 
      
      setShowPaymentModal(false); 
      alert(result.message || 'Pembayaran berhasil dicatat'); 
      
    } catch (e) { 
      console.error('Error submit payment:', e); 
      alert('Terjadi kesalahan saat mencatat pembayaran'); 
    } finally { 
      setIsSubmittingPayment(false); 
    } 
  };

  // Fungsi untuk membuka modal handover 
  const openHandoverModal = () => { 
    setHandoverPhotoFile(null); 
    setHandoverNotes(''); 
    setShowHandoverModal(true); 
  }; 
  
  // Fungsi untuk submit handover 
  const handleSubmitHandover = async () => { 
    if (!pageStatus.selectedTransaction || !user?.id) return; 
    
    try { 
      setIsSubmittingHandover(true); 
      
      let photoUrl: string | undefined; 
      
      // Upload foto handover jika ada 
      if (handoverPhotoFile) { 
        const fileExt = handoverPhotoFile.name.split('.').pop(); 
        const fileName = `handover-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`; 
        
        const { error: uploadError } = await supabase.storage 
          .from('payment-proofs') // atau buat bucket khusus 'handover-photos' 
          .upload(fileName, handoverPhotoFile); 
          
        if (uploadError) throw uploadError; 
        
        const { data } = supabase.storage 
          .from('payment-proofs') 
          .getPublicUrl(fileName); 
          
        photoUrl = data.publicUrl; 
      } 
      
      // Call service function 
      const result = await recordHandover( 
        pageStatus.selectedTransaction.transaction.id, 
        user.id, 
        { 
          handover_photo: photoUrl, 
          handover_notes: handoverNotes 
        } 
      ); 
      
      if (!result.success) { 
        alert(result.error || 'Gagal mencatat serah terima'); 
        return; 
      } 
      
      // Reload data 
      const updatedList = await loadTransactions(); 
      const source = updatedList ?? transactions; 
      const updated = source.find(t => t.transaction.id === pageStatus.selectedTransaction!.transaction.id); 
      
      setPageStatus(prev => ({ 
        ...prev, 
        selectedTransaction: updated || prev.selectedTransaction, 
      })); 
      
      setShowHandoverModal(false); 
      alert(result.message || 'Serah terima berhasil dicatat'); 
      
    } catch (e) { 
      console.error('Error submit handover:', e); 
      alert('Terjadi kesalahan saat mencatat serah terima'); 
    } finally { 
      setIsSubmittingHandover(false); 
    } 
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
      
      navigate('/chat', { state: { activeRoomId: room.id } });
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

  // Fungsi untuk mendapatkan warna badge berdasarkan booking status 
  const getBookingStatusBadgeColor = (status?: BookingStatus) => { 
    switch (status) { 
      case 'booking_pending': 
        return 'bg-yellow-100 text-yellow-800'; 
      case 'booking_paid': 
        return 'bg-green-100 text-green-800'; 
      case 'booking_rejected': 
        return 'bg-red-100 text-red-800'; 
      case 'booking_expired': 
        return 'bg-gray-100 text-gray-800'; 
      case 'booking_cancelled': 
        return 'bg-red-100 text-red-800'; 
      case 'booking_refunded': 
        return 'bg-purple-100 text-purple-800'; 
      default: 
        return 'bg-gray-100 text-gray-800'; 
    } 
  }; 
  
  // Tambahan: cek payment booking_fee yang sudah sukses
  const hasBookingFeeSuccess = (transaction: TransactionWithPayments): boolean => {
    return Array.isArray(transaction.payments) && transaction.payments.some(
      (p) => p.payment_type === 'booking_fee' && p.status === 'success'
    );
  };

  // Tambahan: cek apakah transaksi atau payment sudah refund
  const hasRefund = (transaction: TransactionWithPayments): boolean => {
    const paymentRefunded =
      Array.isArray(transaction.payments) &&
      transaction.payments.some((p) => p.status === 'refunded');
    const headerRefunded =
      transaction.transaction.status === 'refunded' ||
      transaction.transaction.payment_status === 'refunded' ||
      transaction.transaction.booking_status === 'booking_refunded';
    return paymentRefunded || headerRefunded;
  };

  // Update fungsi render status badge 
  const renderDetailedStatusBadge = (transaction: TransactionWithPayments) => { 
    const bookingStatus = transaction.transaction.booking_status; 
    const txStatus = transaction.transaction.status; 

    // Jika ada payment gagal, tampilkan Ditolak
    if (hasFailedPayment(transaction)) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Ditolak
        </span>
      );
    }

    // NEW: jika ada refund, tampilkan Refunded (prioritas di atas Paid)
    if (hasRefund(transaction)) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
          Refunded
        </span>
      );
    }

    // Jika transaksi sudah completed dan final payment sudah dilakukan, tampilkan Completed
    if (transaction.transaction.status === 'completed' && transaction.transaction.final_payment_completed_at) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Completed
        </span>
      );
    }
    
    // Jika booking fee sudah sukses, tampilkan Paid (hijau)
    if (hasBookingFeeSuccess(transaction)) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          Paid
        </span>
      );
    }

    // Jika ada bukti pembayaran booking namun status payment masih pending -> Menunggu Verifikasi
    if (needsBookingVerification(transaction)) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Menunggu Verifikasi
        </span>
      );
    }

    // Jika belum ada pembayaran booking sama sekali -> Belum Bayar
    if (isUnpaid(transaction)) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Belum Bayar
        </span>
      );
    }
    
    // Prioritas: tampilkan booking status jika belum paid (fallback ke booking_status)
    if (bookingStatus && bookingStatus !== 'booking_paid') { 
      return ( 
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getBookingStatusBadgeColor(bookingStatus)}`}> 
          {bookingStatus.replace('booking_', '').replace('_', ' ')} 
        </span> 
      ); 
    } 
    
    // Jika booking sudah paid, tampilkan status transaksi 
    return ( 
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(txStatus)} capitalize`}> 
        {txStatus} 
      </span> 
    ); 
  };
  
  // Helper untuk render badge booking status
  const renderBookingStatusBadge = (transaction: TransactionWithPayments) => {
    const bookingStatus = transaction.transaction.booking_status;

    // Belum bayar saat masih booking_pending dan tidak ada bukti/record pembayaran
    if (bookingStatus === 'booking_pending' && isUnpaid(transaction)) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Belum Bayar
        </span>
      );
    }
    
    // Ubah: jika pembuktian booking ditolak, tampilkan Booking Rejected
    if (bookingStatus === 'booking_pending' && hasFailedPayment(transaction)) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Booking Rejected
        </span>
      );
    }

    // Mapping label eksplisit untuk status booking
    switch (bookingStatus) {
      case 'booking_pending':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Booking Pending
          </span>
        );
      case 'booking_paid':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Booking Paid
          </span>
        );
      case 'booking_refunded':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
            Booking Refund
          </span>
        );
      case 'booking_rejected':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            Booking Rejected
          </span>
        );
      case 'booking_cancelled':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            Booking Cancelled
          </span>
        );
      default:
        // Fallback ke logic lama bila booking_status tidak tersedia/unknown
        return renderDetailedStatusBadge(transaction);
    }
  };

  // NEW: render dua badge di list (status booking + status pembayaran)
  const renderListBadges = (transaction: TransactionWithPayments) => {
    const paymentStatus = getDisplayPaymentStatus(transaction);
    return (
      <div className="flex items-center gap-2">
        {renderBookingStatusBadge(transaction)}
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusBadgeColor(
            paymentStatus
          )}`}
        >
          {formatPaymentStatusLabelWithContext(transaction)}
        </span>
      </div>
    );
  };
  
  // Helper untuk render badge status pembayaran
  const renderPaymentStatusBadge = (transaction: TransactionWithPayments) => {
    const paymentStatus = getDisplayPaymentStatus(transaction);
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusBadgeColor(paymentStatus)}`}>
        {formatPaymentStatusLabelWithContext(transaction)}
      </span>
    );
  }; 
  
  // Helper: cek apakah perlu verifikasi booking 
  const needsBookingVerification = (transaction: TransactionWithPayments): boolean => { 
    return transaction.transaction.booking_status === 'booking_pending' && 
           transaction.payments.some(p => 
             p.payment_type === 'booking_fee' && 
             p.status === 'pending' && 
             !!p.proof_of_payment 
           ); 
  }; 
  
  // Helper: cek apakah booking sudah paid dan menunggu pembayaran final 
  const waitingFinalPayment = (transaction: TransactionWithPayments): boolean => { 
    return transaction.transaction.booking_status === 'booking_paid' && 
           transaction.transaction.status === 'confirmed' && 
           !transaction.transaction.final_payment_completed_at; 
  }; 
  
  // Helper: cek apakah sudah lunas dan menunggu handover 
  const waitingHandover = (transaction: TransactionWithPayments): boolean => { 
    return transaction.transaction.status === 'completed' && 
           !!transaction.transaction.final_payment_completed_at && 
           !transaction.transaction.handover_at; 
  };
  
  // Helper: cek apakah transaksi bisa dibatalkan
  const canCancelTransaction = (transaction: TransactionWithPayments): boolean => {
    const txStatus = transaction.transaction.status;
    const finalDone = !!transaction.transaction.final_payment_completed_at;
    return txStatus !== 'completed' && txStatus !== 'cancelled' && txStatus !== 'refunded' && !finalDone;
  };
  
  // Helper: cek apakah booking fee bisa direfund
  const canRefundBooking = (transaction: TransactionWithPayments): boolean => {
    const bookingStatus = transaction.transaction.booking_status;
    const txStatus = transaction.transaction.status;
    const refundedAlready = bookingStatus === 'booking_refunded' || txStatus === 'refunded';
    return hasBookingFeeSuccess(transaction) && !refundedAlready && (txStatus === 'cancelled' || bookingStatus === 'booking_cancelled' || txStatus === 'pending' || txStatus === 'confirmed');
  };

  // Buka modal pembatalan
  const openCancelModal = () => {
    if (!pageStatus.selectedTransaction) return;
    setCancelReason('');
    setCancelModalOpen(true);
  };

  // Buka modal refund
  const openRefundModal = () => {
    if (!pageStatus.selectedTransaction) return;
    setRefundReason('');
    setRefundProofFile(null);
    setRefundModalOpen(true);
  };

  // Submit pembatalan transaksi
  const performCancelTransaction = async () => {
    if (!pageStatus.selectedTransaction || !user?.id) return;
    if (!cancelReason.trim()) {
      alert('Mohon isi alasan pembatalan');
      return;
    }
    try {
      setIsSubmittingCancel(true);
      setPageStatus(prev => ({ ...prev, isLoading: true }));

      // Langsung panggil API dari service, tidak melalui kontroler
      const result = await cancelTransaction(
        pageStatus.selectedTransaction.transaction.id,
        user.id,
        cancelReason.trim()
      );

      if (!result.success) {
        alert(result.error || 'Gagal membatalkan transaksi');
        return;
      }

      const updatedList = await loadTransactions();
      const source = updatedList ?? transactions;
      const updated = source.find(t => t.transaction.id === pageStatus.selectedTransaction!.transaction.id);

      setPageStatus(prev => ({ ...prev, selectedTransaction: updated || prev.selectedTransaction }));
      setCancelModalOpen(false);
      alert('Transaksi berhasil dibatalkan');
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      alert('Terjadi kesalahan saat membatalkan transaksi');
    } finally {
      setIsSubmittingCancel(false);
      setPageStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Submit refund booking fee
  const performRefundBooking = async () => {
    if (!pageStatus.selectedTransaction || !user?.id) return;

    const bookingFee = Number(pageStatus.selectedTransaction.transaction.booking_fee || 0);

    if (!Number.isFinite(bookingFee) || bookingFee <= 0) {
      alert('Booking fee tidak valid');
      return;
    }
    if (!refundReason.trim()) {
      alert('Mohon isi alasan refund');
      return;
    }

    try {
      setIsSubmittingRefund(true);
      setPageStatus(prev => ({ ...prev, isLoading: true }));

      // Upload bukti refund jika ada
      let proofUrl: string | undefined;
      if (refundProofFile) {
        const fileExt = refundProofFile.name.split('.').pop();
        const fileName = `refund-${pageStatus.selectedTransaction.transaction.id}-${Date.now()}.${fileExt}`;
        const objectKey = `refund/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('payment-proofs') // reuse bucket yang sudah ada
          .upload(objectKey, refundProofFile);

        if (uploadError) {
          alert(uploadError.message || 'Gagal upload bukti refund');
          return;
        }

        const { data } = supabase.storage
          .from('payment-proofs')
          .getPublicUrl(objectKey);

        proofUrl = data.publicUrl;
      }

      // Panggil service refund, kirim proofUrl
      const res = await refundBookingFee(
        pageStatus.selectedTransaction.transaction.id,
        user.id,
        bookingFee, // Selalu refund 100% dari booking fee
        refundReason.trim(),
        proofUrl
      );

      if (!res.success) {
        alert(res.error || 'Gagal melakukan refund booking');
        return;
      }

      const updatedList = await loadTransactions();
      const source = updatedList ?? transactions;
      const updated = source.find(t => t.transaction.id === pageStatus.selectedTransaction!.transaction.id);

      setPageStatus(prev => ({ ...prev, selectedTransaction: updated || prev.selectedTransaction }));
      setRefundModalOpen(false);
      alert(res.message || 'Refund booking fee berhasil diproses');
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('Terjadi kesalahan saat memproses refund');
    } finally {
      setIsSubmittingRefund(false);
      setPageStatus(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Fungsi untuk format label status pembayaran
  const formatPaymentStatusLabel = (status?: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'paid': return 'Paid';
      case 'failed': return 'Failed';
      case 'refunded': return 'Refunded';
      case 'partial': return 'Partial';
      default:
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : '-';
    }
  };
  
  const formatPaymentStatusLabelWithContext = (transaction: TransactionWithPayments) => {
    const paymentStatus = getDisplayPaymentStatus(transaction);
    if (paymentStatus === 'paid') {
      if (transaction.transaction.final_payment_completed_at || transaction.transaction.status === 'completed') {
        return 'Full Paid';
      }
      if (hasBookingFeeSuccess(transaction) || transaction.transaction.booking_status === 'booking_paid') {
        return 'Confirmed';
      }
      return 'Paid';
    }
    return formatPaymentStatusLabel(paymentStatus);
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
    
    // Jika status transaksi 'completed' dan final_payment_completed_at ada, maka status pembayaran adalah 'paid'
    if (t.transaction.status === 'completed' && t.transaction.final_payment_completed_at) {
      return 'paid';
    }
    
    return (t.transaction.payment_status || 'pending') as Transaction['payment_status'];
  };



  // Effect untuk memuat data transaksi saat komponen dimount dan ketika user berubah
  useEffect(() => {
    loadTransactions();
  }, [user?.id]);

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
              <h1 className="text-3xl font-bold text-gray-900">Kelola Transaksi Penjualan</h1>
              <Badge 
                variant="default"
                className="text-sm"
              >
                Mobil Saya
              </Badge>
            </div>
            <p className="text-gray-600 mt-1">
              Kelola dan pantau transaksi pembelian mobil yang Anda jual
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
                  value={filter.booking_status} 
                  onValueChange={(value) => setFilter({ ...filter, booking_status: value })} 
                > 
                  <SelectTrigger className="w-[180px]"> 
                    <SelectValue placeholder="Status Booking" /> 
                  </SelectTrigger> 
                  <SelectContent> 
                    <SelectItem value="all">Semua Status Booking</SelectItem> 
                    <SelectItem value="booking_pending">Pending</SelectItem> 
                    <SelectItem value="booking_paid">Paid</SelectItem> 
                    <SelectItem value="booking_rejected">Rejected</SelectItem> 
                    <SelectItem value="booking_expired">Expired</SelectItem> 
                    <SelectItem value="booking_cancelled">Cancelled</SelectItem> 
                    <SelectItem value="booking_refunded">Refunded</SelectItem> 
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
                    typeof tx.booking_fee === 'number' && tx.booking_fee > 0
                      ? tx.booking_fee
                      : Number(tx.total_amount || 0);
              
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
                          {renderBookingStatusBadge(item)}
                          {renderPaymentStatusBadge(item)}
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
        <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
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

              <Separator /> 
 
              {/* Section Booking Status */} 
              <div> 
                <h3 className="text-lg font-semibold mb-2">Status Booking</h3> 
                <div className="grid grid-cols-2 gap-4"> 
                  <div className="space-y-2"> 
                    <div className="flex justify-between"> 
                      <span className="text-gray-500">Booking Fee:</span> 
                      <span className="font-medium"> 
                        {formatCurrency(Number(pageStatus.selectedTransaction.transaction.booking_fee || 0))} 
                      </span> 
                    </div> 
                    <div className="flex justify-between"> 
                      <span className="text-gray-500">Status Booking:</span> 
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ 
                        getBookingStatusBadgeColor(pageStatus.selectedTransaction.transaction.booking_status) 
                      }`}> 
                        {pageStatus.selectedTransaction.transaction.booking_status?.replace('booking_', '')} 
                      </span> 
                    </div> 
                    {pageStatus.selectedTransaction.transaction.booking_expires_at && ( 
                      <div className="flex justify-between"> 
                        <span className="text-gray-500">Booking Expires:</span> 
                        <span className="text-sm"> 
                          {formatDate(pageStatus.selectedTransaction.transaction.booking_expires_at)} 
                        </span> 
                      </div> 
                    )} 
                  </div> 
                  
                  {pageStatus.selectedTransaction.transaction.booking_rejected_at && ( 
                    <div className="space-y-2"> 
                      <div className="flex justify-between"> 
                        <span className="text-gray-500">Ditolak pada:</span> 
                        <span className="text-sm"> 
                          {formatDate(pageStatus.selectedTransaction.transaction.booking_rejected_at)} 
                        </span> 
                      </div> 
                      {pageStatus.selectedTransaction.transaction.booking_rejection_reason && ( 
                        <div> 
                          <span className="text-gray-500">Alasan:</span> 
                          <p className="text-sm text-red-600 mt-1"> 
                            {pageStatus.selectedTransaction.transaction.booking_rejection_reason} 
                          </p> 
                        </div> 
                      )} 
                    </div> 
                  )} 
                </div> 
              </div> 
              
              <Separator /> 
              
              {/* Section Final Payment */} 
              <div> 
                <h3 className="text-lg font-semibold mb-2">Pembayaran Akhir</h3> 
                <div className="space-y-2"> 
                  <div className="flex justify-between"> 
                    <span className="text-gray-500">Metode:</span> 
                    <span className="font-medium"> 
                      {pageStatus.selectedTransaction.transaction.final_payment_method === 'full' ? 'Pembayaran Penuh' : 
                      pageStatus.selectedTransaction.transaction.final_payment_method === 'credit' ? 'Kredit' : '-'} 
                    </span> 
                  </div> 
                  
                  {pageStatus.selectedTransaction.transaction.final_payment_completed_at && ( 
                    <div className="flex justify-between"> 
                      <span className="text-gray-500">Lunas pada:</span> 
                      <span>{formatDate(pageStatus.selectedTransaction.transaction.final_payment_completed_at)}</span> 
                    </div> 
                  )} 
                  
                  {pageStatus.selectedTransaction.transaction.final_payment_notes && ( 
                    <div> 
                      <span className="text-gray-500">Catatan:</span> 
                      <p className="text-sm mt-1">{pageStatus.selectedTransaction.transaction.final_payment_notes}</p> 
                    </div> 
                  )} 
                  
                  {pageStatus.selectedTransaction.transaction.final_payment_proof && ( 
                    <div> 
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleOpenProof(pageStatus.selectedTransaction!.transaction.final_payment_proof!)} 
                      > 
                        <Eye className="w-4 h-4 mr-2" /> 
                        Lihat Bukti Pembayaran Akhir 
                      </Button> 
                    </div> 
                  )} 
                </div> 
              </div> 
              
              <Separator /> 
              
              {/* Section Handover */} 
              {pageStatus.selectedTransaction.transaction.handover_at && ( 
                <> 
                  <div> 
                    <h3 className="text-lg font-semibold mb-2">Serah Terima Mobil</h3> 
                    <div className="space-y-2"> 
                      <div className="flex justify-between"> 
                        <span className="text-gray-500">Diserahkan pada:</span> 
                        <span>{formatDate(pageStatus.selectedTransaction.transaction.handover_at)}</span> 
                      </div> 
                      
                      {pageStatus.selectedTransaction.transaction.handover_notes && ( 
                        <div> 
                          <span className="text-gray-500">Catatan:</span> 
                          <p className="text-sm mt-1">{pageStatus.selectedTransaction.transaction.handover_notes}</p> 
                        </div> 
                      )} 
                      
                      {pageStatus.selectedTransaction.transaction.handover_photo && ( 
                        <div> 
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenProof(pageStatus.selectedTransaction!.transaction.handover_photo!)} 
                          > 
                            <Eye className="w-4 h-4 mr-2" /> 
                            Lihat Foto Handover 
                          </Button> 
                        </div> 
                      )} 
                    </div> 
                  </div> 
                  <Separator /> 
                </> 
              )}

              {/* Aksi Verifikasi Admin */}
              {(() => {
                const bookingPayment = pageStatus.selectedTransaction.payments.find(
                  p => p.payment_type === 'booking_fee' &&
                       (p.status === 'uploaded' || p.status === 'pending' || p.status === 'processing') &&
                       !!p.proof_of_payment
                );
                return bookingPayment ? (
                  <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="text-sm text-yellow-800">
                      Bukti pembayaran booking fee telah diunggah. Konfirmasi pembayaran booking?
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => openActionConfirm('reject', bookingPayment)}>
                        <XCircle className="w-4 h-4 mr-1" /> Tolak
                      </Button>
                      <Button onClick={() => openActionConfirm('confirm', bookingPayment)}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Konfirmasi Booking
                      </Button>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Panel Pengajuan Refund (bila ada) */}
              {hasRefundRequest(pageStatus.selectedTransaction) && (
                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded p-4">
                  <h3 className="text-lg font-semibold mb-2 text-yellow-800">Pengajuan Refund dari Pembeli</h3>
                  {(() => {
                    const req = parseRefundRequest(pageStatus.selectedTransaction.transaction.notes || '');
                    return (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-600">Alasan:</span><span className="font-medium">{req.reason || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Bank:</span><span className="font-medium">{req.bank_name || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">No. Rekening:</span><span className="font-medium">{req.account_number || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Atas Nama:</span><span className="font-medium">{req.account_holder || '-'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Diajukan:</span><span className="font-medium">{req.requested_at ? formatDate(req.requested_at) : '-'}</span></div>
                      </div>
                    );
                  })()}

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="default"
                      onClick={() => {
                        const req = parseRefundRequest(pageStatus.selectedTransaction!.transaction.notes || '');
                        setRefundReason(req.reason || 'Refund booking fee atas pembatalan');
                        setRefundModalOpen(true);
                      }}
                    >
                      Proses Refund
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => rejectRefundRequest(pageStatus.selectedTransaction!)}
                    >
                      Tolak Refund
                    </Button>
                  </div>
                </div>
              )}

              {/* Action buttons berdasarkan status */} 
              <div className="flex flex-wrap justify-end gap-2 pt-4"> 
                <Button variant="outline" size="sm" onClick={() => pageStatus.selectedTransaction && handleChatBuyer(pageStatus.selectedTransaction.transaction)}> 
                  <MessageSquare className="w-4 h-4 mr-2" /> 
                  Chat Pembeli 
                </Button> 
                
                {/* Tombol untuk batalkan transaksi */}
                {pageStatus.selectedTransaction && canCancelTransaction(pageStatus.selectedTransaction) && (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={openCancelModal}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Batalkan Transaksi
                  </Button>
                )}
                
                {/* Tombol untuk refund booking fee */}
                {pageStatus.selectedTransaction && canRefundBooking(pageStatus.selectedTransaction) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={openRefundModal}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Refund Booking Fee
                  </Button>
                )}
                
                {/* Tombol untuk catat pembayaran final - tampil jika booking paid tapi belum final payment */} 
                {waitingFinalPayment(pageStatus.selectedTransaction) && ( 
                  <> 
                    <Button variant="default" size="sm" onClick={() => openPaymentModal('full')}> 
                      <DollarSign className="w-4 h-4 mr-2" /> 
                      Catat Pembayaran Lunas 
                    </Button> 
                    <Button variant="outline" size="sm" onClick={() => openPaymentModal('credit')}> 
                      <DollarSign className="w-4 h-4 mr-2" /> 
                      Catat Pembayaran Kredit 
                    </Button> 
                  </> 
                )} 
                
                {/* Tombol untuk handover - tampil jika sudah lunas tapi belum handover */} 
                {waitingHandover(pageStatus.selectedTransaction) && ( 
                  <Button variant="default" size="sm" onClick={openHandoverModal}> 
                    <Car className="w-4 h-4 mr-2" /> 
                    Catat Serah Terima 
                  </Button> 
                )} 
                
                <Button variant="outline" size="sm" onClick={closeDetailModal}> 
                  Tutup 
                </Button> 
                <Button size="sm"> 
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

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {paymentModalType === 'full' ? 'Catat Pembayaran Lunas' : 'Catat Pembayaran Kredit'}
            </DialogTitle>
            <DialogDescription>
              Catat pembayaran akhir untuk transaksi ini
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="paymentProof">Bukti Pembayaran</Label>
              <Input
                id="paymentProof"
                type="file"
                accept="image/*"
                onChange={(e) => setPaymentProofFile(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <Label htmlFor="paymentNotes">Catatan (opsional)</Label>
              <Textarea
                id="paymentNotes"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Tambahkan catatan pembayaran..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4 justify-end">
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmitFinalPayment} disabled={isSubmittingPayment}>
              {isSubmittingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Handover Modal */}
      <Dialog open={showHandoverModal} onOpenChange={setShowHandoverModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Catat Serah Terima Mobil</DialogTitle>
            <DialogDescription>
              Catat serah terima mobil kepada pembeli
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="handoverPhoto">Foto Serah Terima</Label>
              <Input
                id="handoverPhoto"
                type="file"
                accept="image/*"
                onChange={(e) => setHandoverPhotoFile(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <Label htmlFor="handoverNotes">Catatan (opsional)</Label>
              <Textarea
                id="handoverNotes"
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                placeholder="Tambahkan catatan serah terima..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4 justify-end">
            <Button variant="outline" onClick={() => setShowHandoverModal(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmitHandover} disabled={isSubmittingHandover}>
              {isSubmittingHandover ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Cancel Transaction Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Batalkan Transaksi</DialogTitle>
            <DialogDescription>
              Isi alasan pembatalan untuk transaksi ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="cancelReason">Alasan Pembatalan</Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Contoh: Pembeli batal karena kurang cocok"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCancelModalOpen(false)} disabled={isSubmittingCancel}>Batal</Button>
            <Button onClick={performCancelTransaction} disabled={isSubmittingCancel || !cancelReason.trim()}>
              {isSubmittingCancel ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Konfirmasi Pembatalan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Refund Booking Fee Modal */}
      <Dialog open={refundModalOpen} onOpenChange={setRefundModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Refund Booking Fee</DialogTitle>
            <DialogDescription>
              Refund 100% booking fee sesuai kebijakan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="refundAmount">Nominal Refund (100%)</Label>
              <Input
                id="refundAmount"
                type="text"
                value={formatCurrency(Number(pageStatus.selectedTransaction?.transaction.booking_fee || 0))}
                readOnly
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Refund selalu 100% dari booking fee sesuai kebijakan.
              </p>
            </div>
            <div>
              <Label htmlFor="refundReason">Alasan Refund</Label>
              <Textarea
                id="refundReason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Contoh: Pembeli batal, refund sesuai kebijakan booking"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="refundProof">Bukti Transfer Refund (opsional)</Label>
              <Input
                id="refundProof"
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setRefundProofFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Unggah resi transfer atau PDF konfirmasi refund.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRefundModalOpen(false)} disabled={isSubmittingRefund}>Batal</Button>
            <Button onClick={performRefundBooking} disabled={isSubmittingRefund || !refundReason.trim()}>
              {isSubmittingRefund ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Proses Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HalamanKelolaTransaksiUser;