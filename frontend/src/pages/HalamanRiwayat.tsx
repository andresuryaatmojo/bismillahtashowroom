import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cancelTransaction, refundBookingFee, BookingStatus } from '../services/transactionService';
import PaymentProofViewer from '../components/PaymentProofViewer';
import { Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../components/ui/dialog';

// Interfaces
interface DataMobil {
  id: string;
  merk: string;
  model: string;
  tahun: number;
  warna: string;
  foto: string[];
  harga: number;
  status?: string; // Menambahkan property status
}

interface Payment {
  id: string;
  transaction_id: string;
  payment_type: 'booking_fee' | 'down_payment' | 'installment' | 'full_payment' | 'remaining_payment';
  amount: number;
  payment_method: string;
  reference_code: string | null;
  bank_name: string | null;
  account_number: string | null;
  account_holder: string | null;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'expired' | 'refunded';
  proof_of_payment: string | null;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  gateway_name: string | null;
  gateway_transaction_id: string | null;
  gateway_response: any | null;
  notes: string | null;
  payment_date: string;
  created_at: string | null;
  updated_at: string | null;
}

interface DataTransaksi {
  id: string;
  car_id: string;
  buyer_id: string;
  seller_id: string;
  invoice_number: string;
  transaction_type: 'purchase' | 'trade_in' | 'installment';
  car_price: number;
  trade_in_value: number;
  discount_amount: number;
  admin_fee: number;
  total_amount: number;
  payment_method: string | null;
  payment_status: 'pending' | 'partial' | 'paid' | 'failed' | 'refunded';
  down_payment: number;
  remaining_payment: number;
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  admin_approval_id: string | null;
  admin_approved_at: string | null;
  proof_of_payment: string | null;
  transaction_details: string | null;
  notes: string | null;
  contract_url: string | null;
  transaction_date: string;
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  
  // Tambahan booking/final-payment untuk badge dan aksi admin/seller
  booking_status?: BookingStatus;
  booking_fee?: number;
  final_payment_completed_at?: string | null;
  proof_of_refund?: string | null;
  
  // Data tambahan yang akan diambil dari relasi
  mobil?: DataMobil;
  hasReview?: boolean;
  payments?: Payment[]; // ← tambahkan relasi payments per transaksi
}

interface DataUlasan {
  id: string;
  transaksiId: string;
  mobilId: string;
  rating: number;
  komentar: string;
  foto: string[];
  tanggalUlasan: string;
  helpful: number;
  status: 'published' | 'pending' | 'rejected';
  rating_car_condition?: number; // 1-5 optional
  rating_seller_service?: number; // 1-5 optional
  rating_transaction_process?: number; // 1-5 optional
  pros?: string; // optional
  cons?: string; // optional
}

interface KriteriaFilter {
  transaction_type: string;
  status: string;
  payment_status: string;
  tanggalMulai: string;
  tanggalAkhir: string;
  seller: string;
  hasReview: boolean | null;
}

interface StatusHalaman {
  view: 'list' | 'review-form' | 'review-success' | 'detail';
  loading: boolean;
  error: string | null;
  selectedTransaksi: DataTransaksi | null;
  reviewData: Partial<DataUlasan>;
  uploadedPhotos: File[];
  filter: KriteriaFilter;
  showFilterModal: boolean;
}

const HalamanRiwayat: React.FC = () => {
  // State management
  // State untuk menampilkan ringkasan ulasan di modal detail
  const [reviewRingkas, setReviewRingkas] = useState<{
    rating_stars: number;
    review_text: string | null;
    images: string[];
  } | null>(null);

  const [statusHalaman, setStatusHalaman] = useState<StatusHalaman>({
    view: 'list',
    loading: true,
    error: null,
    selectedTransaksi: null,
    reviewData: {},
    uploadedPhotos: [],
    filter: {
      transaction_type: '',
      status: '',
      payment_status: '',
      tanggalMulai: '',
      tanggalAkhir: '',
      seller: '',
      hasReview: null
    },
    showFilterModal: false
  });

  const [daftarTransaksi, setDaftarTransaksi] = useState<DataTransaksi[]>([]);
  const [filteredTransaksi, setFilteredTransaksi] = useState<DataTransaksi[]>([]);
  const [daftarDealer, setDaftarDealer] = useState<string[]>([]);
  // Tambahan: peta id→penjual untuk menampilkan nama penjual
  const [petaPenjual, setPetaPenjual] = useState<Record<string, { full_name: string; city?: string }>>({});
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- Badge helpers to mirror HalamanKelolaTransaksi ---
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
  
  const formatPaymentStatusLabelWithContext = (t: DataTransaksi) => {
    const paymentStatus = getDisplayPaymentStatus(t);
    if (paymentStatus === 'paid') {
      if (t.final_payment_completed_at || t.status === 'completed') {
        return 'Full Paid';
      }
      if (hasBookingFeeSuccess(t) || t.booking_status === 'booking_paid') {
        return 'Confirmed';
      }
      return 'Paid';
    }
    return formatPaymentStatusLabel(paymentStatus);
  };

  // Fungsi format tambahan untuk tampilan detail transaksi
  const formatStatus = (status?: string) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'confirmed': return 'Dikonfirmasi';
      case 'processing': return 'Diproses';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      case 'refunded': return 'Dikembalikan';
      default:
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : '-';
    }
  };

  const formatTransactionType = (type?: string) => {
    switch (type) {
      case 'purchase': return 'Pembelian';
      case 'installment': return 'Cicilan';
      case 'trade_in': return 'Tukar Tambah';
      case 'test_drive': return 'Test Drive';
      case 'service': return 'Servis';
      default:
        return type ? type.charAt(0).toUpperCase() + type.slice(1) : '-';
    }
  };

  const formatPaymentStatus = (status?: string) => {
    return formatPaymentStatusLabel(status);
  };

  const formatPaymentType = (type?: string) => {
    switch (type) {
      case 'booking_fee': return 'Booking Fee';
      case 'down_payment': return 'Uang Muka';
      case 'installment': return 'Cicilan';
      case 'full_payment': return 'Pembayaran Penuh';
      case 'remaining_payment': return 'Sisa Pembayaran';
      default:
        return type ? type.charAt(0).toUpperCase() + type.slice(1) : '-';
    }
  };

  const getPaymentStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'ditolak': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBookingStatusBadgeColor = (status?: BookingStatus) => {
    switch (status) {
      case 'booking_pending': return 'bg-yellow-100 text-yellow-800';
      case 'booking_paid': return 'bg-green-100 text-green-800';
      case 'booking_rejected': return 'bg-red-100 text-red-800';
      case 'booking_expired': return 'bg-gray-100 text-gray-800';
      case 'booking_cancelled': return 'bg-red-100 text-red-800';
      case 'booking_refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const hasFailedPayment = (t: DataTransaksi): boolean => {
    const fromPayments = Array.isArray(t.payments) ? t.payments.some(p => p.status === 'failed') : false;
    const fromHeader = t.payment_status === 'failed' || t.status === 'cancelled';
    return fromPayments || fromHeader;
  };

  const hasBookingFeeSuccess = (t: DataTransaksi): boolean => {
    return Array.isArray(t.payments) && t.payments.some(
      p => p.payment_type === 'booking_fee' && p.status === 'success'
    );
  };

  const hasRefund = (t: DataTransaksi): boolean => {
    const paymentRefunded = Array.isArray(t.payments) && t.payments.some(p => p.status === 'refunded');
    const headerRefunded =
      t.status === 'refunded' ||
      t.payment_status === 'refunded' ||
      t.booking_status === 'booking_refunded';
    return paymentRefunded || headerRefunded;
  };
  
  const [showProofModal, setShowProofModal] = useState(false);
  const [currentProofUrl, setCurrentProofUrl] = useState<string | null>(null);

  // Normalisasi path storage → public URL Supabase
  const getPublicUrlFromPath = (proofPath: string): string => {
    if (!proofPath) return '';
    if (proofPath.startsWith('http')) return proofPath;
    let fileName = proofPath;
    if (proofPath.includes('/payment-proofs/')) {
      const parts = proofPath.split('/payment-proofs/');
      fileName = parts[parts.length - 1];
    }
    const { data } = supabase.storage.from('payment-proofs').getPublicUrl(fileName);
    return data?.publicUrl || proofPath;
  };

  const openRefundProof = () => {
    const url = statusHalaman.selectedTransaksi?.proof_of_refund;
    if (url) {
      const publicUrl = getPublicUrlFromPath(url);
      setCurrentProofUrl(publicUrl);
      setShowProofModal(true);
    }
  };

  const hasRefundRequest = (t: DataTransaksi): boolean => {
    return !!t.notes && t.notes.includes('REFUND_REQUEST|');
  };

  const getDisplayTransactionStatus = (t: DataTransaksi): string => {
    if (hasFailedPayment(t)) return 'ditolak';
    return t.status || 'pending';
  };

  const getDisplayPaymentStatus = (t: DataTransaksi): DataTransaksi['payment_status'] => {
    const failed = Array.isArray(t.payments) && t.payments.some(p => p.status === 'failed');
    if (failed) return 'failed';
    if (t.status === 'completed' && t.final_payment_completed_at) return 'paid';
    return (t.payment_status || 'pending') as DataTransaksi['payment_status'];
  };

  const renderBookingStatusBadge = (t: DataTransaksi) => {
    const bookingStatus = t.booking_status;
    if (bookingStatus === 'booking_pending' && (!t.payments || t.payments.length === 0)) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Belum Bayar
        </span>
      );
    }
    // Ubah: jika bukti pembayaran booking ditolak, tampilkan Booking Rejected
    if (bookingStatus === 'booking_pending' && hasFailedPayment(t)) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Booking Rejected
        </span>
      );
    }
    switch (bookingStatus) {
      case 'booking_pending': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Booking Pending</span>;
      case 'booking_paid': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Booking Paid</span>;
      case 'booking_refunded': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Booking Refund</span>;
      case 'booking_rejected': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Booking Rejected</span>;
      case 'booking_cancelled': return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Booking Cancelled</span>;
      default:
        return (
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(getDisplayTransactionStatus(t))}`}>
            {getDisplayTransactionStatus(t)}
          </span>
        );
    }
  };

  // Tampilkan badge booking + payment, dan tambah indikator "Menunggu Konfirmasi Admin" bila ada pengajuan refund
  const renderStatusBadge = (t: DataTransaksi) => {
    const paymentStatus = getDisplayPaymentStatus(t);
    return (
      <div className="flex items-center gap-2">
        {renderBookingStatusBadge(t)}
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusBadgeColor(paymentStatus)}`}>
          {formatPaymentStatusLabelWithContext(t)}
        </span>
        {hasRefundRequest(t) && !hasRefund(t) && (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Menunggu Konfirmasi Admin
          </span>
        )}
      </div>
    );
  };

  const canCancelTransaction = (t: DataTransaksi): boolean => {
    const txStatus = t.status;
    const finalDone = !!t.final_payment_completed_at;
    return txStatus !== 'completed' && txStatus !== 'cancelled' && txStatus !== 'refunded' && !finalDone;
  };

  const canRequestRefund = (t: DataTransaksi): boolean => {
    const txStatus = t.status;
    const bookingStatus = t.booking_status;
    const finalDone = !!t.final_payment_completed_at;
    
    return (
      !finalDone &&
      !hasRefundRequest(t) &&
      hasBookingFeeSuccess(t) &&
      (txStatus === 'pending' || txStatus === 'confirmed') &&
      bookingStatus !== 'booking_refunded'
    );
  };

  // Helper: kondisi visibilitas terkait booking
  const isBuyer = user?.current_mode === 'buyer' || user?.role === 'user';

  // Booking helpers: treat booking_pending as "paid, awaiting admin approval"
  const isBookingPaidOrPending = (t: DataTransaksi) =>
    t.booking_status === 'booking_paid' ||
    t.booking_status === 'booking_pending' ||
    hasBookingFeeSuccess(t);

  const isBookingRejected = (t: DataTransaksi) =>
    t.booking_status === 'booking_rejected';

  // **REVISI: Cek apakah mobil sudah direserve oleh pembeli lain (FIRST PAY FIRST GET)**
  const isReservedByOtherBuyer = (t: DataTransaksi): boolean => {
    if (!user?.id) return false;
    
    // Cek apakah ada transaksi lain untuk mobil yang sama dengan booking_fee success
    // yang bukan transaksi current user dan dibuat lebih dulu
    const otherTransactions = daftarTransaksi.filter(
      tx => tx.car_id === t.car_id && 
      tx.id !== t.id && 
      tx.buyer_id !== user.id &&
      hasBookingFeeSuccess(tx) &&
      new Date(tx.created_at) < new Date(t.created_at) // Pembeli lain membayar lebih dulu
    );
    
    return otherTransactions.length > 0;
  };

  // **REVISI: Belum bayar booking - DENGAN VALIDASI RESERVED**
  const isUnpaidBooking = (t: DataTransaksi) => {
    // Jika mobil sudah direserve oleh pembeli lain, return false
    if (isReservedByOtherBuyer(t)) return false;
    
    return (t.payment_status === 'pending' || t.payment_status === undefined) &&
      !isBookingPaidOrPending(t);
  };

  // Munculkan "Batalkan & Ajukan Refund" untuk booking_paid
  // dan booking_pending yang sudah memiliki pembayaran (agar tidak bentrok dengan "Belum Bayar")
  const canCancelAndRequestRefund = (t: DataTransaksi) =>
    isBuyer &&
    (
      t.booking_status === 'booking_paid' ||
      (t.booking_status === 'booking_pending' && t.payments && t.payments.length > 0)
    ) &&
    !hasRefund(t) &&
    t.status !== 'cancelled';

  // Munculkan "Batalkan Transaksi" saat booking_pending tanpa pembayaran ATAU booking_rejected
  const canCancelOnly = (t: DataTransaksi) =>
    isBuyer &&
    (
      (t.booking_status === 'booking_pending' && (!t.payments || t.payments.length === 0)) ||
      isBookingRejected(t)
    ) &&
    t.status !== 'cancelled';

  const canRefundBooking = (t: DataTransaksi): boolean => {
    const bookingStatus = t.booking_status;
    const txStatus = t.status;
    const refundedAlready = bookingStatus === 'booking_refunded' || txStatus === 'refunded';
    return hasBookingFeeSuccess(t) && !refundedAlready &&
      (txStatus === 'cancelled' || bookingStatus === 'booking_cancelled' || txStatus === 'pending' || txStatus === 'confirmed');
  };

  // Handler gabungan: batalkan + ajukan refund
  const handleCancelAndRequestRefund = async (t: DataTransaksi) => {
    if (!user?.id) {
      alert('Harap login untuk mengajukan pembatalan & refund');
      return;
    }

    const reason = (prompt('Alasan pembatalan & refund:') || '').trim();
    if (!reason) {
      alert('Alasan wajib diisi');
      return;
    }
    const bankName = (prompt('Nama bank untuk refund:') || '').trim();
    const accountNumber = (prompt('Nomor rekening untuk refund:') || '').trim();
    const accountHolder = (prompt('Nama pemilik rekening:') || '').trim();
    if (!bankName || !accountNumber || !accountHolder) {
      alert('Data rekening refund wajib lengkap');
      return;
    }

    try {
      setStatusHalaman(prev => ({ ...prev, loading: true }));
      // 1) Batalkan transaksi
      const cancelRes = await cancelTransaction(t.id, user.id, reason);
      if (!cancelRes.success) {
        alert(cancelRes.error || 'Gagal membatalkan transaksi');
        setStatusHalaman(prev => ({ ...prev, loading: false }));
        return;
      }

      // 2) Catat pengajuan refund di notes (tag: REFUND_REQUEST)
      const marker = `REFUND_REQUEST|bank_name=${bankName};account_number=${accountNumber};account_holder=${accountHolder};reason=${reason};requested_by=${user.id};requested_at=${new Date().toISOString()}`;
      const newNotes = t.notes ? `${t.notes}\n${marker}` : marker;

      const { error: updErr } = await supabase
        .from('transactions')
        .update({ notes: newNotes })
        .eq('id', t.id);
      if (updErr) {
        alert(`Pembatalan berhasil, namun gagal mencatat pengajuan refund: ${updErr.message}`);
      }

      // 3) Update state lokal
      const updated = {
        ...t,
        status: 'cancelled' as const,
        booking_status: 'booking_cancelled' as const,
        notes: newNotes
      };

      setDaftarTransaksi(prev => prev.map(x => x.id === t.id ? updated : x));
      setFilteredTransaksi(prev => prev.map(x => x.id === t.id ? updated : x));

      if (statusHalaman.selectedTransaksi?.id === t.id) {
        setStatusHalaman(prev => ({ ...prev, selectedTransaksi: updated }));
      }

      alert('Pengajuan pembatalan & refund terkirim. Menunggu konfirmasi admin.');
    } catch (e) {
      alert('Terjadi kesalahan saat mengajukan pembatalan & refund');
    } finally {
      setStatusHalaman(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCancelTransaction = async (t: DataTransaksi) => {
    if (!user?.id) {
      alert('Aksi memerlukan autentikasi admin/penjual');
      return;
    }
    const reason = (prompt('Alasan pembatalan:') || '').trim();

    try {
      setStatusHalaman(prev => ({ ...prev, loading: true }));
      const res = await cancelTransaction(t.id, user.id, reason || undefined);
      if (!res.success) {
        alert(res.error || 'Gagal membatalkan transaksi');
      } else {
        setDaftarTransaksi(prev => prev.map(x =>
          x.id === t.id ? { ...x, status: 'cancelled', booking_status: 'booking_cancelled', cancelled_at: new Date().toISOString(), notes: reason || x.notes } : x
        ));
        setFilteredTransaksi(prev => prev.map(x =>
          x.id === t.id ? { ...x, status: 'cancelled', booking_status: 'booking_cancelled', cancelled_at: new Date().toISOString(), notes: reason || x.notes } : x
        ));
        if (statusHalaman.selectedTransaksi?.id === t.id) {
          setStatusHalaman(prev => ({
            ...prev,
            selectedTransaksi: {
              ...prev.selectedTransaksi!,
              status: 'cancelled',
              booking_status: 'booking_cancelled',
              cancelled_at: new Date().toISOString(),
              notes: reason || prev.selectedTransaksi!.notes
            }
          }));
        }
        alert(res.message || 'Transaksi dibatalkan');
      }
    } catch (e) {
      alert('Terjadi kesalahan saat membatalkan transaksi');
    } finally {
      setStatusHalaman(prev => ({ ...prev, loading: false }));
    }
  };

  const handleRefundBooking = async (t: DataTransaksi) => {
    if (!user?.id) {
      alert('Aksi memerlukan autentikasi admin/penjual');
      return;
    }
    const reason = (prompt('Alasan refund booking fee:') || '').trim();
    const bookingFee = Number(t.booking_fee ?? t.down_payment ?? 0);
    if (!Number.isFinite(bookingFee) || bookingFee <= 0) {
      alert('Booking fee tidak valid');
      return;
    }

    try {
      setStatusHalaman(prev => ({ ...prev, loading: true }));
      const res = await refundBookingFee(t.id, user.id, bookingFee, reason || undefined);
      if (!res.success) {
        alert(res.error || 'Gagal melakukan refund booking');
      } else {
        setDaftarTransaksi(prev => prev.map(x =>
          x.id === t.id ? { ...x, status: 'refunded', payment_status: 'refunded', booking_status: 'booking_refunded', notes: reason || x.notes } : x
        ));
        setFilteredTransaksi(prev => prev.map(x =>
          x.id === t.id ? { ...x, status: 'refunded', payment_status: 'refunded', booking_status: 'booking_refunded', notes: reason || x.notes } : x
        ));
        if (statusHalaman.selectedTransaksi?.id === t.id) {
          setStatusHalaman(prev => ({
            ...prev,
            selectedTransaksi: {
              ...prev.selectedTransaksi!,
              status: 'refunded',
              payment_status: 'refunded',
              booking_status: 'booking_refunded',
              notes: reason || prev.selectedTransaksi!.notes
            }
          }));
        }
        alert(res.message || 'Refund booking fee berhasil diproses');
      }
    } catch (e) {
      alert('Terjadi kesalahan saat memproses refund');
    } finally {
      setStatusHalaman(prev => ({ ...prev, loading: false }));
    }
  };

  // **REVISI: Methods implementation dengan ISOLASI DATA**
  const aksesHalamanRiwayat = async () => {
    setStatusHalaman(prev => ({ ...prev, loading: true, view: 'list' }));
    
    try {
      // **CRITICAL: Mendapatkan user ID dari session saat ini**
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      
      if (!currentUserId) {
        throw new Error('User tidak terautentikasi');
      }
      
      // **ISOLASI DATA: HANYA ambil transaksi milik user yang login**
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          *,
          cars:car_id (
        id,
        year,
        color,
        price,
        status,
        car_brands (name),
        car_models (name),
        car_images (image_url, is_primary, display_order)
      )
        `)
        .eq('buyer_id', currentUserId) // **CRITICAL: Filter by current user**
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // **VALIDASI: Pastikan tidak ada data transaksi user lain yang bocor**
      const validatedTransactions = (transactions || []).filter(
        (t: any) => t.buyer_id === currentUserId
      );
      
      // Fallback foto: ambil langsung dari car_images berdasarkan car_id
      const carIds = validatedTransactions.map((t: any) => t.car_id);
      const { data: imageRows } = await supabase
        .from('car_images')
        .select('car_id, image_url, is_primary, display_order')
        .in('car_id', carIds);

      const imagesByCarId: Record<string, string[]> = {};
      (imageRows || []).forEach((row: any) => {
        if (!imagesByCarId[row.car_id]) imagesByCarId[row.car_id] = [];
        imagesByCarId[row.car_id].push(row.image_url);
      });
      
      // Ambil semua payments untuk transaksi yang dimuat (1 query, pakai in)
      const transactionIds = validatedTransactions.map(t => t.id);
      
      // **ISOLASI DATA: HANYA ambil payments untuk transaksi user ini**
      const { data: allPayments } = await supabase
        .from('payments')
        .select('*')
        .in('transaction_id', transactionIds); // Sudah aman karena transaction_ids sudah difilter

      const paymentsByTxn: Record<string, Payment[]> = {};
      (allPayments || []).forEach((p: any) => {
        const asPayment: Payment = {
          id: p.id,
          transaction_id: p.transaction_id,
          payment_type: p.payment_type,
          amount: Number(p.amount),
          payment_method: p.payment_method,
          reference_code: p.reference_code,
          bank_name: p.bank_name,
          account_number: p.account_number,
          account_holder: p.account_holder,
          status: p.status,
          proof_of_payment: p.proof_of_payment,
          verified_by: p.verified_by,
          verified_at: p.verified_at,
          rejection_reason: p.rejection_reason,
          gateway_name: p.gateway_name,
          gateway_transaction_id: p.gateway_transaction_id,
          gateway_response: p.gateway_response,
          notes: p.notes,
          payment_date: p.payment_date,
          created_at: p.created_at,
          updated_at: p.updated_at,
        };
        if (!paymentsByTxn[asPayment.transaction_id]) {
          paymentsByTxn[asPayment.transaction_id] = [];
        }
        paymentsByTxn[asPayment.transaction_id].push(asPayment);
      });
      
      // Mengambil data review untuk menentukan transaksi mana yang sudah direview
      const { data: reviews, error: reviewsErr } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewer_id', currentUserId); // **ISOLASI: Hanya review user ini**
      
      if (reviewsErr) {
        console.warn('Load reviews failed:', reviewsErr.message);
      }
      
      // Set transaksi yang sudah direview (ambil transaction_id bila ada)
      const reviewedTransactionIds = Array.isArray(reviews)
        ? reviews
            .map((r: any) => r.transaction_id)
            .filter((id: any) => !!id)
        : [];
      
      // Transformasi data ke format yang dibutuhkan aplikasi
      const formattedTransactions: DataTransaksi[] = validatedTransactions.map((t: any) => {
        // Ambil snapshot nama mobil dari transaction_details (jika ada)
        const details = (() => {
          try {
            return typeof t.transaction_details === 'string'
              ? JSON.parse(t.transaction_details)
              : t.transaction_details;
          } catch {
            return null;
          }
        })();

        const fallbackName = details?.car_name || '';
        const fallbackPhotos = imagesByCarId[t.car_id] || [];

        // Bangun data mobil dengan fallback
        const mobil: DataMobil = {
          id: t.car_id,
          merk: t.cars?.car_brands?.name || (fallbackName ? fallbackName.split(' ')[0] : ''),
          model: t.cars?.car_models?.name || (fallbackName || ''),
          tahun: t.cars?.year || 0,
          warna: t.cars?.color || '',
          foto: Array.isArray(t.cars?.car_images)
            ? t.cars.car_images.map((img: any) => img.image_url)
            : fallbackPhotos,
          harga: t.cars?.price || t.car_price || 0,
          status: t.cars?.status || 'available' // **PENTING: Ambil status mobil**
        };

        return {
          ...t,
          mobil,
          hasReview: reviewedTransactionIds.includes(t.id),
          payments: paymentsByTxn[t.id] || []
        };
      });
      
      setDaftarTransaksi(formattedTransactions);
      setFilteredTransaksi(formattedTransactions);
      
      // Mengambil data dealer dari transaksi
      const { data: sellers } = await supabase
        .from('users')
        .select('id, username, full_name, address, city')
        .in('id', formattedTransactions.map(t => t.seller_id));
      
      // Extract unique dealers
      const dealers = sellers ? [...new Set(sellers.map(s => s.full_name))] : [];
      setDaftarDealer(dealers);
      
      // Tambahan: simpan peta seller_id → nama penjual
      const sellerMap = Object.fromEntries(
        (sellers || []).map((s: any) => [s.id, { full_name: s.full_name, city: s.city }])
      );
      setPetaPenjual(sellerMap);
      
      // **AUTO-CANCEL: Cek transaksi yang mobil-nya sudah dibooking pembeli lain**
      await autoCancelReservedTransactions(formattedTransactions, currentUserId);
      
      setStatusHalaman(prev => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('Error mengambil data transaksi:', error);
      setStatusHalaman(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Gagal memuat data transaksi. Silakan coba lagi.' 
      }));
    }
  };

  // **REVISI: AUTO-CANCEL transaksi jika mobil sudah dibooking pembeli lain**
  const autoCancelReservedTransactions = async (transactions: DataTransaksi[], userId: string) => {
    try {
      for (const t of transactions) {
        // Skip jika transaksi sudah cancelled/completed
        if (t.status === 'cancelled' || t.status === 'completed' || t.status === 'refunded') {
          continue;
        }
        
        // Skip jika sudah ada pembayaran booking
        if (hasBookingFeeSuccess(t)) {
          continue;
        }
        
        // Cek apakah mobil sudah direserve oleh pembeli lain
        if (isReservedByOtherBuyer(t)) {
          // Auto-cancel transaksi ini
          const cancelReason = 'Mobil sudah direservasi oleh pembeli lain yang membayar lebih dulu';
          
          const { error } = await supabase
            .from('transactions')
            .update({ 
              status: 'cancelled',
              booking_status: 'booking_cancelled',
              cancelled_at: new Date().toISOString(),
              notes: cancelReason
            })
            .eq('id', t.id)
            .eq('buyer_id', userId); // **SECURITY: Pastikan hanya update transaksi user ini**
          
          if (!error) {
            // Update local state
            setDaftarTransaksi(prev => prev.map(x =>
              x.id === t.id ? { 
                ...x, 
                status: 'cancelled' as const, 
                booking_status: 'booking_cancelled' as const,
                cancelled_at: new Date().toISOString(),
                notes: cancelReason 
              } : x
            ));
            setFilteredTransaksi(prev => prev.map(x =>
              x.id === t.id ? { 
                ...x, 
                status: 'cancelled' as const, 
                booking_status: 'booking_cancelled' as const,
                cancelled_at: new Date().toISOString(),
                notes: cancelReason 
              } : x
            ));
          }
        }
      }
    } catch (error) {
      console.error('Error auto-canceling reserved transactions:', error);
    }
  };

  const pilihMobilUntukDiulas = (idMobil: string) => {
    const transaksi = daftarTransaksi.find(t => t.car_id === idMobil && !t.hasReview);
    if (transaksi) {
      setStatusHalaman(prev => ({
        ...prev,
        selectedTransaksi: transaksi,
        view: 'review-form',
        reviewData: {
          transaksiId: transaksi.id,
          mobilId: idMobil,
          rating: 0,
          komentar: '',
          foto: []
        }
      }));
    }
  };

  const inputRatingDanUlasan = (rating: number, komentar: string) => {
    setStatusHalaman(prev => ({
      ...prev,
      reviewData: {
        ...prev.reviewData,
        rating,
        komentar
      }
    }));
  };

  const putuskanTambahFoto = (keputusan: boolean) => {
    if (!keputusan) {
      setStatusHalaman(prev => ({
        ...prev,
        uploadedPhotos: []
      }));
    }
  };

  const unggahFoto = (fileFoto: File[]) => {
    setStatusHalaman(prev => ({
      ...prev,
      uploadedPhotos: [...prev.uploadedPhotos, ...fileFoto]
    }));
  };

  const kirimUlasan = async () => {
    setStatusHalaman(prev => ({ ...prev, loading: true, error: null }));
    try {
      // Mendapatkan user ID dari session saat ini
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      if (!currentUserId) throw new Error('User tidak terautentikasi');

      const selected = statusHalaman.selectedTransaksi;
      if (!selected) throw new Error('Transaksi tidak dipilih');

      const rating = statusHalaman.reviewData.rating || 0;
      if (rating < 1 || rating > 5) {
        throw new Error('Rating bintang wajib antara 1 sampai 5');
      }

      // Cek duplikasi (unik reviewer_id + car_id)
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('reviewer_id', currentUserId)
        .eq('car_id', statusHalaman.reviewData.mobilId)
        .maybeSingle();
      if (existingReview?.id) throw new Error('Anda sudah mengulas mobil ini sebelumnya');

      // Upload foto ke bucket yang sudah ada (sementara gunakan payment-proofs)
      const REVIEW_BUCKET = 'payment-proofs';
      const uploadedImageUrls: string[] = [];
      for (const file of statusHalaman.uploadedPhotos) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `reviews/${fileName}`; // folder reviews di dalam bucket payment-proofs
        const { error: uploadError } = await supabase.storage
          .from(REVIEW_BUCKET)
          .upload(filePath, file);
        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          continue;
        }
        const { data: { publicUrl } } = supabase.storage
          .from(REVIEW_BUCKET)
          .getPublicUrl(filePath);
        uploadedImageUrls.push(publicUrl);
      }

      // Payload sesuai skema tabel reviews - dengan safe insert
      const reviewPayload: any = {
        reviewer_id: currentUserId,
        car_id: statusHalaman.reviewData.mobilId!,
        seller_id: selected.seller_id,
        transaction_id: statusHalaman.reviewData.transaksiId || null,
        // Gunakan kolom yang sesuai dengan skema DB
        rating_stars: rating,
        rating_car_condition: statusHalaman.reviewData.rating_car_condition || null,
        rating_seller_service: statusHalaman.reviewData.rating_seller_service || null,
        rating_transaction_process: statusHalaman.reviewData.rating_transaction_process || null,
        review_text: statusHalaman.reviewData.komentar || null,
        pros: statusHalaman.reviewData.pros || null,
        cons: statusHalaman.reviewData.cons || null,
        is_verified_purchase: !!statusHalaman.reviewData.transaksiId,
        moderation_status: 'approved', // langsung approved agar tampil
        status: 'active'
      };

      // Hapus key yang undefined untuk menghindari error
      Object.keys(reviewPayload).forEach((k) => {
        if (reviewPayload[k] === undefined) delete reviewPayload[k];
      });

      // Tambahkan opsi onConflict untuk menghindari error kolom ambigu
      const { data: insertedReviews, error: reviewError } = await supabase
        .from('reviews')
        .insert(reviewPayload)
        .select();
      if (reviewError) throw reviewError;

      const createdReview = insertedReviews?.[0];
      if (!createdReview?.id) throw new Error('Review gagal dibuat');

      // Simpan meta image ke review_images
      if (uploadedImageUrls.length > 0) {
        const imagesPayload = uploadedImageUrls.map((url, idx) => ({
          review_id: createdReview.id,
          image_url: url,
          caption: null,
          display_order: idx
        }));
        const { error: imagesError } = await supabase
          .from('review_images')
          .insert(imagesPayload);
        if (imagesError) console.warn('Insert review_images gagal:', imagesError.message);
      }

      // Tandai transaksi sudah diulas
      setDaftarTransaksi(prev =>
        prev.map(t =>
          t.id === statusHalaman.reviewData.transaksiId ? { ...t, hasReview: true } : t
        )
      );
      setFilteredTransaksi(prev =>
        prev.map(t =>
          t.id === statusHalaman.reviewData.transaksiId ? { ...t, hasReview: true } : t
        )
      );

      const ulasanBaru: DataUlasan = {
        id: createdReview.id,
        transaksiId: statusHalaman.reviewData.transaksiId!,
        mobilId: statusHalaman.reviewData.mobilId!,
        rating,
        komentar: statusHalaman.reviewData.komentar || '',
        foto: uploadedImageUrls,
        tanggalUlasan: new Date().toISOString(),
        helpful: 0,
        status: 'published', // Ulasan langsung published (auto-approved)
        rating_car_condition: statusHalaman.reviewData.rating_car_condition,
        rating_seller_service: statusHalaman.reviewData.rating_seller_service,
        rating_transaction_process: statusHalaman.reviewData.rating_transaction_process,
        pros: statusHalaman.reviewData.pros,
        cons: statusHalaman.reviewData.cons
      };

      // Tampilkan pesan sukses dan kembali ke list view
      alert('Ulasan berhasil dikirim dan langsung dipublikasikan!');
      
      setStatusHalaman(prev => ({
        ...prev,
        view: 'list',
        loading: false,
        selectedTransaksi: null,
        reviewData: {}
      }));
    } catch (error: any) {
      // Tangani 42501 (RLS) dengan pesan jelas
      const msg = error?.message || '';
      const isRls = msg.includes('row-level security');
      setStatusHalaman(prev => ({
        ...prev,
        loading: false,
        error: isRls
          ? 'Akses ditolak oleh RLS saat membuat review. Pastikan kebijakan RLS sudah mengizinkan insert.'
          : msg || 'Gagal mengirim ulasan. Silakan coba lagi.'
      }));
    } finally {
      // Pastikan UI kembali ke daftar jika terjadi error
      if (statusHalaman.error) {
        setTimeout(() => {
          setStatusHalaman(prev => ({
            ...prev,
            view: 'list',
            selectedTransaksi: null,
            reviewData: {}
          }));
        }, 3000); // Tampilkan error selama 3 detik sebelum kembali ke list
      }
    }
  };

  const terapkanFilter = (kriteriaFilter: KriteriaFilter) => {
    let filtered = [...daftarTransaksi];
    
    if (kriteriaFilter.transaction_type) {
      filtered = filtered.filter(t => t.transaction_type === kriteriaFilter.transaction_type);
    }
    
    if (kriteriaFilter.status) {
      filtered = filtered.filter(t => t.status === kriteriaFilter.status);
    }
    
    if (kriteriaFilter.payment_status) {
      filtered = filtered.filter(t => t.payment_status === kriteriaFilter.payment_status);
    }
    
    if (kriteriaFilter.seller) {
      filtered = filtered.filter(t => t.seller_id === kriteriaFilter.seller);
    }
    
    if (kriteriaFilter.hasReview !== null) {
      filtered = filtered.filter(t => t.hasReview === kriteriaFilter.hasReview);
    }
    
    if (kriteriaFilter.tanggalMulai) {
      filtered = filtered.filter(t => new Date(t.created_at) >= new Date(kriteriaFilter.tanggalMulai));
    }
    
    if (kriteriaFilter.tanggalAkhir) {
      filtered = filtered.filter(t => new Date(t.created_at) <= new Date(kriteriaFilter.tanggalAkhir));
    }
    
    setFilteredTransaksi(filtered);
    setStatusHalaman(prev => ({
      ...prev,
      filter: kriteriaFilter,
      showFilterModal: false
    }));
  };

  const lihatDaftarRiwayat = () => {
    setStatusHalaman(prev => ({ ...prev, view: 'list' }));
  };

  // Muat ulasan milik user untuk transaksi/mobil yang dipilih
  async function muatUlasanUntukTransaksi(selected: any) {
    try {
      if (!selected?.car_id) {
        setReviewRingkas(null);
        return;
      }

      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      if (!userId) {
        setReviewRingkas(null);
        return;
      }

      // Ambil ulasan user untuk mobil ini dengan filter yang mendukung auto-publish
      const { data: review, error: reviewErr } = await supabase
        .from('reviews')
        .select('id, rating_stars, review_text, status, moderation_status')
        .eq('car_id', selected.car_id)
        .eq('reviewer_id', userId)
        .eq('status', 'active')
        .in('moderation_status', ['auto_approved', 'approved', 'pending'])
        .limit(1)
        .maybeSingle();

      if (reviewErr || !review) {
        setReviewRingkas(null);
        return;
      }

      // Ambil daftar image_url terkait ulasan
      const { data: imgRows, error: imgErr } = await supabase
        .from('review_images')
        .select('image_url')
        .eq('review_id', review.id);

      if (imgErr) {
        setReviewRingkas({
          rating_stars: review.rating_stars,
          review_text: review.review_text,
          images: []
        });
        return;
      }

      const finalReview = {
        rating_stars: review.rating_stars,
        review_text: review.review_text,
        images: (imgRows || []).map((r: any) => r.image_url).filter(Boolean)
      };

      setReviewRingkas(finalReview);
    } catch (error) {
      setReviewRingkas(null);
    }
  }

  // Saat detail dibuka atau transaksi terpilih berubah, muat ulasan
  useEffect(() => {
    if (statusHalaman.view === 'detail' && statusHalaman.selectedTransaksi) {
      muatUlasanUntukTransaksi(statusHalaman.selectedTransaksi);
    } else {
      setReviewRingkas(null);
    }
  }, [statusHalaman.view, statusHalaman.selectedTransaksi]);

  const pilihTransaksiTertentu = (idTransaksi: string) => {
    // **ISOLASI DATA: Validasi bahwa transaksi adalah milik user**
    const transaksi = daftarTransaksi.find(t => t.id === idTransaksi && t.buyer_id === user?.id);
    if (transaksi) {
      setStatusHalaman(prev => ({
        ...prev,
        selectedTransaksi: transaksi,
        view: 'detail'
      }));
    } else {
      alert('Transaksi tidak ditemukan atau Anda tidak memiliki akses');
    }
  };

  const unduhInvoice = async (idTransaksi: string) => {
    // **ISOLASI DATA: Validasi ownership**
    const transaksi = daftarTransaksi.find(t => t.id === idTransaksi && t.buyer_id === user?.id);
    if (!transaksi) {
      alert('Transaksi tidak ditemukan atau Anda tidak memiliki akses');
      return;
    }

    setStatusHalaman(prev => ({ ...prev, loading: true }));
    
    try {
      // Mendapatkan data pembeli
      const { data: buyer } = await supabase
        .from('users')
        .select('full_name, address, city, province, postal_code, phone_number')
        .eq('id', transaksi.buyer_id)
        .single();
        
      // Mendapatkan data penjual
      const { data: seller } = await supabase
        .from('users')
        .select('full_name, address, city, province, postal_code, phone_number')
        .eq('id', transaksi.seller_id)
        .single();
      
      // Generate invoice content
      const invoiceContent = `
        INVOICE PEMBELIAN MOBIL
        =======================
        
        No. Invoice: ${transaksi.invoice_number || transaksi.id}
        Tanggal: ${formatDate(transaksi.transaction_date)}
        
        DETAIL PEMBELI:
        --------------
        Nama: ${buyer?.full_name || 'N/A'}
        Alamat: ${buyer?.address || 'N/A'}, ${buyer?.city || ''}, ${buyer?.province || ''}
        Telepon: ${buyer?.phone_number || 'N/A'}
        
        DETAIL MOBIL:
        ------------
        Merk: ${transaksi.mobil?.merk || 'N/A'}
        Model: ${transaksi.mobil?.model || 'N/A'}
        Tahun: ${transaksi.mobil?.tahun || 'N/A'}
        
        DETAIL TRANSAKSI:
        ----------------
        Jenis Transaksi: ${transaksi.transaction_type === 'purchase' ? 'Pembelian' : 
                          transaksi.transaction_type === 'trade_in' ? 'Tukar Tambah' : 'Cicilan'}
        Harga Mobil: ${formatCurrency(transaksi.car_price)}
        ${transaksi.trade_in_value > 0 ? `Nilai Tukar Tambah: ${formatCurrency(transaksi.trade_in_value)}\n` : ''}
        ${transaksi.discount_amount > 0 ? `Diskon: ${formatCurrency(transaksi.discount_amount)}\n` : ''}
        Biaya Admin: ${formatCurrency(transaksi.admin_fee)}
        ${transaksi.down_payment > 0 ? `Uang Muka: ${formatCurrency(transaksi.down_payment)}\n` : ''}
        ${transaksi.remaining_payment > 0 ? `Sisa Pembayaran: ${formatCurrency(transaksi.remaining_payment)}\n` : ''}
        
        TOTAL: ${formatCurrency(transaksi.total_amount)}
        
        Status Pembayaran: ${transaksi.payment_status}
        Metode Pembayaran: ${transaksi.payment_method || 'N/A'}
        
        Status Transaksi: ${transaksi.status}
        ${transaksi.notes ? `\nCatatan: ${transaksi.notes}` : ''}
        
        =======================
        Terima kasih telah bertransaksi di Bismillah Showroom
      `;
      
      // Create and download PDF (simulated)
      const blob = new Blob([invoiceContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${transaksi.id}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setStatusHalaman(prev => ({ ...prev, loading: false }));
      alert('Invoice berhasil diunduh!');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      setStatusHalaman(prev => ({ ...prev, loading: false }));
      alert('Gagal mengunduh invoice');
    }
  };

  const pilihAksi = (jenisAksi: string) => {
    if (!statusHalaman.selectedTransaksi) return;
    
    // **ISOLASI DATA: Validasi ownership sebelum aksi**
    if (statusHalaman.selectedTransaksi.buyer_id !== user?.id) {
      alert('Anda tidak memiliki akses untuk melakukan aksi ini');
      return;
    }
    
    switch (jenisAksi) {
      case 'review':
        pilihMobilUntukDiulas(statusHalaman.selectedTransaksi.car_id);
        break;
      case 'repeat-order':
        // Navigate to purchase page with same car
        window.location.href = `/pembelian?mobil=${statusHalaman.selectedTransaksi.car_id}`;
        break;
      case 'contact-dealer':
        // Navigate to chat with dealer
        window.location.href = `/chat?seller=${statusHalaman.selectedTransaksi.seller_id}`;
        break;
      case 'download-invoice':
        // Download invoice
        unduhInvoice(statusHalaman.selectedTransaksi.id);
        break;
      default:
        break;
    }
  };

  // Helper functions
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-indigo-100 text-indigo-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Tambahan: util untuk status pembayaran dan tombol Bayar
  const hasPaymentProof = (t: DataTransaksi): boolean => {
    if (t.proof_of_payment) return true;
    if (Array.isArray(t.payments)) {
      return t.payments.some(p => !!p.proof_of_payment);
    }
    return false;
  };

  // **REVISI: Cek isUnpaid dengan validasi reserved**
  const isUnpaid = (t: DataTransaksi): boolean => {
    // TIDAK tampilkan tombol bayar jika mobil sudah direserve oleh pembeli lain
    if (isReservedByOtherBuyer(t)) {
      return false;
    }

    // TIDAK tampilkan tombol bayar jika booking ditolak
    if (isBookingRejected(t)) {
      return false;
    }

    // Tampilkan tombol bayar HANYA untuk status "Belum Bayar" (belum ada pembayaran)
    // dan car status adalah "available"
    const isBelumBayarStatus = (
      (t.booking_status === 'booking_pending' && (!t.payments || t.payments.length === 0)) ||
      (t.payment_status === 'pending' || t.payment_status === undefined) && !isBookingPaidOrPending(t)
    );

    return isBelumBayarStatus && t.mobil?.status === 'available';
  };

  const isWaitingAdminConfirm = (t: DataTransaksi): boolean => {
    return t.status === 'pending' && hasPaymentProof(t);
  };

  // Helper function to check if car is sold
  const isCarSold = (t: DataTransaksi): boolean => {
    const carStatus = t.mobil?.status;
    console.log('Car status:', carStatus, 'for transaction:', t.id, 'transaction status:', t.status);

    // Cek multiple conditions untuk status sold
    return carStatus === 'sold' ||
           carStatus === 'Sold' ||
           t.status === 'completed';
  };

  const goToPayment = (t: DataTransaksi) => {
    // **VALIDASI: Cek lagi sebelum redirect ke pembayaran**
    if (isReservedByOtherBuyer(t)) {
      alert('Maaf, mobil ini sudah direservasi oleh pembeli lain yang membayar lebih dulu.');
      return;
    }
    
    // Prioritize down_payment if it exists (booking fee)
    const isBookingFee = isUnpaidBooking(t) || t.booking_status === 'booking_pending';
    const paymentAmount = isBookingFee
      ? (t.booking_fee ?? t.total_amount)
      : (t.remaining_payment && t.remaining_payment > 0 ? t.remaining_payment : t.total_amount);
    
    navigate('/pembayaran', {
      state: {
        amount: paymentAmount,
        transactionId: t.id,
        referenceId: t.invoice_number,
        paymentType: isBookingFee
          ? 'booking_fee'
          : (t.remaining_payment && t.remaining_payment > 0 ? 'remaining_payment' : 'full_payment'),
      },
    });
  };

  // Required Transaction History Methods
  const aksesMenuRiwayat = () => {
    setStatusHalaman(prev => ({ ...prev, view: 'list' }));
    aksesHalamanRiwayat();
  };

  const lihatRiwayatTransaksi = () => {
    setStatusHalaman(prev => ({ ...prev, loading: true }));
    
    // Simulate API call to load all transaction history
    setTimeout(() => {
      setFilteredTransaksi(daftarTransaksi);
      setStatusHalaman(prev => ({ ...prev, loading: false, view: 'list' }));
    }, 500);
  };

  const filterRiwayat = (kriteria: Partial<KriteriaFilter>) => {
    const newFilter = { ...statusHalaman.filter, ...kriteria };
    terapkanFilter(newFilter);
  };

  const exportRiwayat = async (format: 'pdf' | 'excel' | 'csv') => {
    setStatusHalaman(prev => ({ ...prev, loading: true }));
    
    try {
      // Fetch seller details for each transaction
      const sellerPromises = filteredTransaksi.map(async t => {
        if (!t.seller_id) return null;
        
        const { data: seller } = await supabase
          .from('users')
          .select('full_name, city')
          .eq('id', t.seller_id)
          .single();
          
        return {
          transactionId: t.id,
          sellerName: seller?.full_name || 'N/A',
          sellerLocation: seller?.city || 'N/A'
        };
      });
      
      const sellerDetails = await Promise.all(sellerPromises);
      
      // Map transactions to export format
      const data = filteredTransaksi.map(t => {
        const sellerDetail = sellerDetails.find(s => s?.transactionId === t.id);
        
        return {
          'ID Transaksi': t.id,
          'No. Invoice': t.invoice_number || '-',
          'Tanggal': formatDate(t.transaction_date),
          'Jenis Transaksi': t.transaction_type === 'purchase' ? 'Pembelian' : 
                             t.transaction_type === 'trade_in' ? 'Tukar Tambah' : 'Cicilan',
          'Mobil': t.mobil ? `${t.mobil.merk || ''} ${t.mobil.model || ''} ${t.mobil.tahun || ''}` : 'N/A',
          'Status': t.status,
          'Status Pembayaran': t.payment_status,
          'Metode Pembayaran': t.payment_method || '-',
          'Total Harga': formatCurrency(t.total_amount),
          'Dealer': sellerDetail?.sellerName || 'N/A',
          'Lokasi': sellerDetail?.sellerLocation || 'N/A',
          'Sudah Diulas': t.hasReview ? 'Ya' : 'Tidak'
        };
      });

      // Create and download file
      const filename = `riwayat-transaksi-${new Date().toISOString().split('T')[0]}.${format}`;
      
      if (format === 'csv') {
        const csv = [
          Object.keys(data[0]).join(','),
          ...data.map(row => Object.values(row).join(','))
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // For PDF and Excel, simulate download
        alert(`File ${filename} berhasil diunduh!`);
      }
    } catch (error) {
      console.error('Error exporting transactions:', error);
      alert('Gagal mengekspor data transaksi');
    } finally {
      setStatusHalaman(prev => ({ ...prev, loading: false }));
    }
  };

  const detailTransaksi = (idTransaksi: string) => {
    pilihTransaksiTertentu(idTransaksi);
  };

  const batalkanTransaksi = async (idTransaksi: string, alasan: string) => {
    setStatusHalaman(prev => ({ ...prev, loading: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDaftarTransaksi(prev => 
        prev.map(t => 
          t.id === idTransaksi 
            ? { ...t, status: 'cancelled' as const, catatan: `Dibatalkan: ${alasan}` }
            : t
        )
      );
      
      // Update filtered list
      setFilteredTransaksi(prev => 
        prev.map(t => 
          t.id === idTransaksi 
            ? { ...t, status: 'cancelled' as const, catatan: `Dibatalkan: ${alasan}` }
            : t
        )
      );
      
      setStatusHalaman(prev => ({ ...prev, loading: false }));
      alert('Transaksi berhasil dibatalkan');
    } catch (error) {
      setStatusHalaman(prev => ({ ...prev, loading: false }));
      alert('Gagal membatalkan transaksi');
    }
  };

  const ulasanTransaksi = (idTransaksi: string) => {
    const transaksi = daftarTransaksi.find(t => t.id === idTransaksi);
    if (transaksi && !transaksi.hasReview) {
      pilihMobilUntukDiulas(transaksi.car_id);
    } else {
      alert('Transaksi ini sudah diulas atau tidak dapat diulas');
    }
  };

  const cetakInvoice = async (idTransaksi: string) => {
    // **ISOLASI DATA: Validasi ownership**
    const transaksi = daftarTransaksi.find(t => t.id === idTransaksi && t.buyer_id === user?.id);
    if (!transaksi) {
      alert('Transaksi tidak ditemukan atau Anda tidak memiliki akses');
      return;
    }

    setStatusHalaman(prev => ({ ...prev, loading: true }));
    
    try {
      // Mendapatkan data pembeli
      const { data: buyer } = await supabase
        .from('users')
        .select('full_name, address, city, province, postal_code, phone_number')
        .eq('id', transaksi.buyer_id)
        .single();
        
      // Mendapatkan data penjual
      const { data: seller } = await supabase
        .from('users')
        .select('full_name, address, city, province, postal_code, phone_number')
        .eq('id', transaksi.seller_id)
        .single();
      
      // Generate invoice content
      const invoiceContent = `
        INVOICE PEMBELIAN MOBIL
        =======================
        
        No. Invoice: ${transaksi.invoice_number || transaksi.id}
        Tanggal: ${formatDate(transaksi.transaction_date)}
        
        DETAIL PEMBELI:
        --------------
        Nama: ${buyer?.full_name || 'N/A'}
        Alamat: ${buyer?.address || 'N/A'}, ${buyer?.city || ''}, ${buyer?.province || ''}
        Telepon: ${buyer?.phone_number || 'N/A'}
        
        DETAIL MOBIL:
        ------------
        Merk: ${transaksi.mobil?.merk || 'N/A'}
        Model: ${transaksi.mobil?.model || 'N/A'}
        Tahun: ${transaksi.mobil?.tahun || 'N/A'}
        Warna: ${transaksi.mobil?.warna || 'N/A'}
        
        DETAIL TRANSAKSI:
        ---------------
        Harga Mobil: ${formatCurrency(transaksi.car_price)}
        ${transaksi.trade_in_value > 0 ? `Nilai Tukar Tambah: ${formatCurrency(transaksi.trade_in_value)}` : ''}
        ${transaksi.discount_amount > 0 ? `Diskon: ${formatCurrency(transaksi.discount_amount)}` : ''}
        ${transaksi.admin_fee > 0 ? `Biaya Admin: ${formatCurrency(transaksi.admin_fee)}` : ''}
        Metode Pembayaran: ${transaksi.payment_method || 'N/A'}
        Status Pembayaran: ${transaksi.payment_status || transaksi.status}
        ${transaksi.down_payment > 0 ? `Uang Muka: ${formatCurrency(transaksi.down_payment)}` : ''}
        ${transaksi.remaining_payment > 0 ? `Sisa Pembayaran: ${formatCurrency(transaksi.remaining_payment)}` : ''}
        Status Transaksi: ${transaksi.status}
        Catatan: ${transaksi.notes || '-'}
        
        DEALER:
        ------
        Nama: ${seller?.full_name || 'N/A'}
        Lokasi: ${seller?.city || 'N/A'}${seller?.province ? ', ' + seller.province : ''}
        Telepon: ${seller?.phone_number || 'N/A'}
        
        TOTAL: ${formatCurrency(transaksi.total_amount)}
        
        Terima kasih telah melakukan transaksi dengan kami.
      `;

      // Create and download PDF (simulated)
      const blob = new Blob([invoiceContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${transaksi.id}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setStatusHalaman(prev => ({ ...prev, loading: false }));
      alert('Invoice berhasil diunduh!');
    } catch (error) {
      console.error('Gagal mengunduh invoice:', error);
      setStatusHalaman(prev => ({ ...prev, loading: false, error: 'Gagal mengunduh invoice' }));
    }
  };

  const trackingStatus = (idTransaksi: string) => {
    const transaksi = daftarTransaksi.find(t => t.id === idTransaksi);
    if (!transaksi) {
      alert('Transaksi tidak ditemukan');
      return;
    }

    type TrackingItem = { status: string; tanggal: string; selesai: boolean };
    const trackingInfo: Record<DataTransaksi['status'], TrackingItem[]> = {
      completed: [
        { status: 'Pesanan Diterima', tanggal: transaksi.transaction_date, selesai: true },
        { status: 'Verifikasi Dokumen', tanggal: transaksi.transaction_date, selesai: true },
        { status: 'Proses Pembayaran', tanggal: transaksi.transaction_date, selesai: true },
        { status: 'Penyiapan Kendaraan', tanggal: transaksi.transaction_date, selesai: true },
        { status: 'Serah Terima', tanggal: transaksi.transaction_date, selesai: true }
      ],
      pending: [
        { status: 'Pesanan Diterima', tanggal: transaksi.transaction_date, selesai: true },
        { status: 'Verifikasi Dokumen', tanggal: transaksi.transaction_date, selesai: true },
        { status: 'Proses Pembayaran', tanggal: '', selesai: false },
        { status: 'Penyiapan Kendaraan', tanggal: '', selesai: false },
        { status: 'Serah Terima', tanggal: '', selesai: false }
      ],
      cancelled: [
        { status: 'Pesanan Diterima', tanggal: transaksi.transaction_date, selesai: true },
        { status: 'Dibatalkan', tanggal: transaksi.transaction_date, selesai: true }
      ],
      confirmed: [
        { status: 'Pesanan Dikonfirmasi', tanggal: transaksi.transaction_date, selesai: true },
        { status: 'Verifikasi Dokumen', tanggal: '', selesai: false }
      ],
      processing: [
        { status: 'Proses Pembayaran', tanggal: transaksi.transaction_date, selesai: true },
        { status: 'Penyiapan Kendaraan', tanggal: '', selesai: false }
      ],
      refunded: [
        { status: 'Pengembalian Dana', tanggal: transaksi.transaction_date, selesai: true }
      ]
    };

    const info: TrackingItem[] = trackingInfo[transaksi.status] || [];
    const trackingText = info
      .map((item: TrackingItem) => `${item.selesai ? '✓' : '○'} ${item.status} ${item.tanggal ? `(${formatDate(item.tanggal)})` : ''}`)
      .join('\n');

    alert(`Status Tracking Transaksi ${transaksi.id}:\n\n${trackingText}`);
  };

  const riwayatTestDrive = () => {
    // Filter for purchase transactions as test-drive is not in the union type
    const testDriveTransaksi = daftarTransaksi.filter(t => t.transaction_type === 'purchase');
    setFilteredTransaksi(testDriveTransaksi);
    setStatusHalaman(prev => ({
      ...prev,
      filter: { ...prev.filter, transaction_type: 'purchase' }
    }));
  };
  
  const riwayatCicilan = () => {
    const installmentTransaksi = daftarTransaksi.filter(t => t.transaction_type === 'installment');
    setFilteredTransaksi(installmentTransaksi);
    setStatusHalaman(prev => ({
      ...prev,
      filter: { ...prev.filter, transaction_type: 'installment' }
    }));
  };

  const getTransactionIcon = (jenis: string): string => {
    switch (jenis) {
      case 'purchase': return '🛒';
      case 'trade_in': return '🔄';
      case 'installment': return '💳';
      case 'test-drive': return '🚗';
      case 'service': return '🔧';
      case 'konsultasi': return '💬';
      default: return '📄';
    }
  };

  const resetFilter = () => {
    const emptyFilter: KriteriaFilter = {
      transaction_type: '',
      status: '',
      payment_status: '',
      tanggalMulai: '',
      tanggalAkhir: '',
      seller: '',
      hasReview: null
    };
    terapkanFilter(emptyFilter);
  };

  // Load initial data
  useEffect(() => {
    aksesHalamanRiwayat();
  }, []);

  if (statusHalaman.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat riwayat transaksi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TAMPILAN TIDAK DIUBAH - Hanya logic yang direvisi */}
      {/* List View */}
      {statusHalaman.view === 'list' && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-8 text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-left">Riwayat Transaksi</h1>
            <p className="text-gray-600 text-left">Kelola dan ulas transaksi Anda</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Transaksi</p>
                  <p className="text-2xl font-bold text-gray-900">{daftarTransaksi.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Selesai</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {daftarTransaksi.filter(t => t.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <span className="text-2xl">⭐</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Sudah Diulas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {daftarTransaksi.filter(t => t.hasReview).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Pembelian</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(
                      daftarTransaksi
                        .filter(t => t.transaction_type === 'purchase')
                        .reduce((sum, t) => sum + t.total_amount, 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter and Search */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={statusHalaman.filter.transaction_type}
                  onChange={(e) => terapkanFilter({ ...statusHalaman.filter, transaction_type: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Jenis</option>
                  <option value="purchase">Pembelian</option>
                  <option value="trade_in">Tukar Tambah</option>
                  <option value="installment">Cicilan</option>
                </select>
                <select
                  value={statusHalaman.filter.status}
                  onChange={(e) => terapkanFilter({ ...statusHalaman.filter, status: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Dikonfirmasi</option>
                  <option value="processing">Diproses</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                  <option value="refunded">Dikembalikan</option>
                </select>
                <select
                  value={statusHalaman.filter.payment_status}
                  onChange={(e) => terapkanFilter({ ...statusHalaman.filter, payment_status: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Status Pembayaran</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Sebagian</option>
                  <option value="paid">Lunas</option>
                  <option value="failed">Gagal</option>
                  <option value="refunded">Dikembalikan</option>
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setStatusHalaman(prev => ({ ...prev, showFilterModal: true }))}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  🔍 Filter Lanjutan
                </button>
                <button
                  onClick={resetFilter}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Transaction List */}
          <div className="space-y-4">
            {filteredTransaksi.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <span className="text-6xl">📋</span>
                <h3 className="text-xl font-semibold text-gray-900 mt-4">Tidak ada transaksi</h3>
                <p className="text-gray-600 mt-2">Belum ada transaksi yang sesuai dengan filter Anda</p>
              </div>
            ) : (
              filteredTransaksi.map((transaksi) => (
                <div key={transaksi.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Header seperti gambar: ikon, nama penjual (ganti 'Belanja'), tanggal, status, invoice */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 text-xl">🛍️</span>
                        <span className="font-semibold">
                          {petaPenjual[transaksi.seller_id]?.full_name || 'Penjual'}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {formatDate(transaksi.created_at)}
                        </span>
                        {renderStatusBadge(transaksi)}
                      </div>
                      <div className="text-sm text-gray-500 font-mono">
                        {transaksi.invoice_number || transaksi.id}
                      </div>
                    </div>

                    {/* Konten utama: gambar, judul, kuantitas x harga per unit, total belanja di kanan */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start space-x-4 mb-4 md:mb-0">
                        <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={transaksi.mobil?.foto?.[0] || ''}
                            alt={`${transaksi.mobil?.merk || ''} ${transaksi.mobil?.model || ''}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                            }}
                          />
                        </div>
                        <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900 text-left">
                {transaksi.mobil?.merk || 'N/A'} {transaksi.mobil?.model || ''} {transaksi.mobil?.tahun || ''}
              </h3>
              <p className="text-sm text-gray-600 text-left">
                      1 Biaya Pemesanan x {formatCurrency(
                        transaksi.down_payment || transaksi.car_price || transaksi.mobil?.harga || 0
                      )}
                    </p>
            </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Belanja</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(transaksi.total_amount)}</p>
                      </div>
                    </div>

                    {/* **PESAN JIKA MOBIL RESERVED** */}
                    {isReservedByOtherBuyer(transaksi) && transaksi.status !== 'cancelled' && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">
                          ⚠️ Maaf, mobil ini sudah direservasi oleh pembeli lain yang membayar lebih dulu.
                        </p>
                      </div>
                    )}

                    {/* Aksi: Lihat Detail Transaksi dan Ulas (rata kanan) */}
                    <div className="mt-4 flex flex-wrap gap-2 justify-end">
                      <button
                        onClick={() => pilihTransaksiTertentu(transaksi.id)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                      >
                        Lihat Detail Transaksi
                      </button>

                      {isUnpaid(transaksi) && (
                        <button
                          onClick={() => goToPayment(transaksi)}
                          className="px-3 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                        >
                          Bayar
                        </button>
                      )}

                      {isCarSold(transaksi) && (
                        <button
                          onClick={() => !transaksi.hasReview && pilihMobilUntukDiulas(transaksi.car_id)}
                          disabled={!!transaksi.hasReview}
                          className={
                            `px-3 py-2 text-sm rounded ` +
                            (transaksi.hasReview
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-green-600 text-white hover:bg-green-700')
                          }
                        >
                          {transaksi.hasReview ? 'Mobil Sudah Diulas' : 'Ulas'}
                        </button>
                      )}

                      {/* Tambah tombol: Lihat Bukti Refund */}
                      {hasRefund(transaksi) && transaksi.proof_of_refund && (
                        <button
                          onClick={() => {
                            const publicUrl = getPublicUrlFromPath(transaksi.proof_of_refund!);
                            setCurrentProofUrl(publicUrl);
                            setShowProofModal(true);
                          }}
                          className="px-3 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                        >
                          Lihat Bukti Refund
                        </button>
                      )}

                      {/* Aksi pembatalan: saling eksklusif */}
                      {canCancelAndRequestRefund(transaksi) ? (
                        <button
                          className="px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                          onClick={() => handleCancelAndRequestRefund(transaksi)}
                        >
                          Batalkan & Ajukan Refund
                        </button>
                      ) : canCancelOnly(transaksi) ? (
                        <button
                          className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                          onClick={() => handleCancelTransaction(transaksi)}
                        >
                          Batalkan Transaksi
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tampilan Detail Transaksi */}
      {statusHalaman.view === 'detail' && statusHalaman.selectedTransaksi && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detail Transaksi</h2>
                <button 
                  onClick={() => setStatusHalaman(prev => ({ ...prev, view: 'list' }))}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Informasi Transaksi */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Informasi Transaksi</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">ID Transaksi</p>
                      <p className="font-medium">{statusHalaman.selectedTransaksi.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tanggal</p>
                      <p className="font-medium">{formatDate(statusHalaman.selectedTransaksi.transaction_date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="font-medium">{formatStatus(statusHalaman.selectedTransaksi.status)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Jenis Transaksi</p>
                      <p className="font-medium">{formatTransactionType(statusHalaman.selectedTransaksi.transaction_type)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Informasi Mobil */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Informasi Mobil</h3>
                  <div className="flex">
                    <div className="w-1/3">
                      {statusHalaman.selectedTransaksi.mobil?.foto && statusHalaman.selectedTransaksi.mobil.foto.length > 0 ? (
                        <img 
                          src={statusHalaman.selectedTransaksi.mobil.foto[0]} 
                          alt="Mobil" 
                          className="w-full h-auto rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400">Tidak ada foto</span>
                        </div>
                      )}
                    </div>
                    <div className="w-2/3 pl-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Merk & Model</p>
                          <p className="font-medium">{statusHalaman.selectedTransaksi.mobil?.merk} {statusHalaman.selectedTransaksi.mobil?.model}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Tahun</p>
                          <p className="font-medium">{statusHalaman.selectedTransaksi.mobil?.tahun}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Warna</p>
                          <p className="font-medium">{statusHalaman.selectedTransaksi.mobil?.warna || '-'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Harga</p>
                          <p className="font-medium">{formatCurrency(statusHalaman.selectedTransaksi.mobil?.harga || 0)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Informasi Pembayaran */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Informasi Pembayaran</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Pembayaran</p>
                      <p className="font-medium">{formatCurrency(statusHalaman.selectedTransaksi.total_amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Metode Pembayaran</p>
                      <p className="font-medium">{statusHalaman.selectedTransaksi.payment_method || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status Pembayaran</p>
                      <p className="font-medium">{formatPaymentStatus(statusHalaman.selectedTransaksi.payment_status)}</p>
                    </div>
                    {statusHalaman.selectedTransaksi.down_payment > 0 && (
                      <div>
                        <p className="text-sm text-gray-500">Uang Muka</p>
                        <p className="font-medium">{formatCurrency(statusHalaman.selectedTransaksi.down_payment)}</p>
                      </div>
                    )}
                    {statusHalaman.selectedTransaksi.remaining_payment > 0 && (
                      <div>
                        <p className="text-sm text-gray-500">Sisa Pembayaran</p>
                        <p className="font-medium">{formatCurrency(statusHalaman.selectedTransaksi.remaining_payment)}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Riwayat Pembayaran */}
                {statusHalaman.selectedTransaksi.payments && statusHalaman.selectedTransaksi.payments.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Riwayat Pembayaran</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metode</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {statusHalaman.selectedTransaksi.payments.map((payment, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{formatPaymentType(payment.payment_type)}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{formatCurrency(payment.amount)}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{payment.payment_method}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{formatPaymentStatus(payment.status)}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(payment.payment_date)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Bukti Refund */}
                {hasRefund(statusHalaman.selectedTransaksi) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Bukti Refund</h3>
                    {statusHalaman.selectedTransaksi.proof_of_refund ? (
                      <div className="flex items-center justify-center">
                        <button
                          onClick={openRefundProof}
                          className="px-3 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" /> Lihat
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">Bukti refund belum tersedia.</p>
                    )}
                  </div>
                )}
                
                {/* Ulasan Saya */}
                {reviewRingkas && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">Ulasan Saya</h3>
                    
                    {/* Rating stars - center aligned */}
                    <div className="flex items-center justify-center mb-4">
                      {[1,2,3,4,5].map((i) => (
                        <svg
                          key={i}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill={i <= (reviewRingkas.rating_stars || 0) ? '#FBBF24' : '#E5E7EB'}
                          className="w-6 h-6 mx-1"
                        >
                          <path d="M12 .587l3.668 7.431L24 9.75l-6 5.848L19.336 24 12 20.013 4.664 24 6 15.598 0 9.75l8.332-1.732z" />
                        </svg>
                      ))}
                      <span className="ml-3 text-lg font-medium text-gray-700">
                        {reviewRingkas.rating_stars}/5
                      </span>
                    </div>

                    {/* Teks ulasan - center aligned */}
                    <div className="text-center mb-4">
                      <p className="text-gray-800 text-base leading-relaxed max-w-2xl mx-auto">
                        {reviewRingkas.review_text || 'Tidak ada komentar'}
                      </p>
                    </div>

                    {/* Gambar ulasan - center aligned grid */}
                    {reviewRingkas.images.length > 0 && (
                      <div className="flex justify-center">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-md">
                          {reviewRingkas.images.map((url, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={url}
                                alt={`Foto ulasan ${idx + 1}`}
                                className="w-full h-24 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => window.open(url, '_blank')}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Tombol Aksi */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setStatusHalaman(prev => ({ ...prev, view: 'list' }))}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={() => statusHalaman.selectedTransaksi && unduhInvoice(statusHalaman.selectedTransaksi.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Unduh Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Review Form */}
      {statusHalaman.view === 'review-form' && statusHalaman.selectedTransaksi && (
        <Dialog open={true} onOpenChange={(open) => {
          if (!open) setStatusHalaman(prev => ({ ...prev, view: 'list', selectedTransaksi: null }));
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ulas Mobil</DialogTitle>
              <DialogDescription>
                Berikan rating dan ulasan untuk pengalaman kamu dengan mobil dan penjual.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating Bintang (1–5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={statusHalaman.reviewData.rating || 0}
                  onChange={(e) => inputRatingDanUlasan(Number(e.target.value), statusHalaman.reviewData.komentar || '')}
                  className="mt-1 w-full border rounded px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kondisi Mobil (1–5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={statusHalaman.reviewData.rating_car_condition || ''}
                    onChange={(e) => setStatusHalaman(prev => ({
                      ...prev,
                      reviewData: { ...prev.reviewData, rating_car_condition: Number(e.target.value) || undefined }
                    }))}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Layanan Penjual (1–5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={statusHalaman.reviewData.rating_seller_service || ''}
                    onChange={(e) => setStatusHalaman(prev => ({
                      ...prev,
                      reviewData: { ...prev.reviewData, rating_seller_service: Number(e.target.value) || undefined }
                    }))}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Proses Transaksi (1–5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={statusHalaman.reviewData.rating_transaction_process || ''}
                    onChange={(e) => setStatusHalaman(prev => ({
                      ...prev,
                      reviewData: { ...prev.reviewData, rating_transaction_process: Number(e.target.value) || undefined }
                    }))}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ulasan</label>
                <textarea
                  rows={4}
                  value={statusHalaman.reviewData.komentar || ''}
                  onChange={(e) => inputRatingDanUlasan(statusHalaman.reviewData.rating || 0, e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2"
                  placeholder="Ceritakan pengalaman kamu..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kelebihan (opsional)</label>
                  <input
                    type="text"
                    value={statusHalaman.reviewData.pros || ''}
                    onChange={(e) => setStatusHalaman(prev => ({
                      ...prev,
                      reviewData: { ...prev.reviewData, pros: e.target.value || undefined }
                    }))}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kekurangan (opsional)</label>
                  <input
                    type="text"
                    value={statusHalaman.reviewData.cons || ''}
                    onChange={(e) => setStatusHalaman(prev => ({
                      ...prev,
                      reviewData: { ...prev.reviewData, cons: e.target.value || undefined }
                    }))}
                    className="mt-1 w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Foto (opsional)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    unggahFoto(files as File[]);
                  }}
                  className="mt-1"
                />
                {statusHalaman.uploadedPhotos.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {statusHalaman.uploadedPhotos.length} foto akan diunggah
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <button
                className="px-4 py-2 border rounded-md"
                onClick={() => setStatusHalaman(prev => ({ ...prev, view: 'list', selectedTransaksi: null }))}
                disabled={statusHalaman.loading}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={kirimUlasan}
                disabled={statusHalaman.loading}
              >
                {statusHalaman.loading ? 'Mengirim...' : 'Kirim Ulasan'}
              </button>
            </DialogFooter>

            {statusHalaman.error && (
              <div className="mt-3 text-sm text-red-600">{statusHalaman.error}</div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Error Message */}
      {statusHalaman.error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-md p-4 max-w-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-1 text-sm text-red-700">
                <p>{statusHalaman.error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Proof Modal */}
      <PaymentProofViewer 
        isOpen={showProofModal} 
        onClose={() => {
          setShowProofModal(false);
          setCurrentProofUrl(null);
        }} 
        proofUrl={currentProofUrl || ''} 
      />
    </div>
  );
};

export default HalamanRiwayat;