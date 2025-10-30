import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

// Interfaces
interface DataMobil {
  id: string;
  merk: string;
  model: string;
  tahun: number;
  warna: string;
  foto: string[];
  harga: number;
}

interface Payment {
  id: string;
  transaction_id: string;
  payment_type: 'down_payment' | 'installment' | 'full_payment' | 'remaining_payment';
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

  // Methods implementation
  const aksesHalamanRiwayat = async () => {
    setStatusHalaman(prev => ({ ...prev, loading: true, view: 'list' }));
    
    try {
      // Mendapatkan user ID dari session saat ini
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      
      if (!currentUserId) {
        throw new Error('User tidak terautentikasi');
      }
      
      // Mengambil data transaksi dari Supabase
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          *,
          cars:car_id (
            id,
            year,
            color,
            price,
            car_brands (name),
            car_models (name),
            car_images (image_url, is_primary, display_order)
          )
        `)
        .eq('buyer_id', currentUserId)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Ambil semua payments untuk transaksi yang dimuat (1 query, pakai in)
      const transactionIds = (transactions || []).map(t => t.id);
      const { data: allPayments } = await supabase
        .from('payments')
        .select('*')
        .in('transaction_id', transactionIds);

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
        .select('*') // Hindari pemilihan kolom yang tidak ada
        .eq('reviewer_id', currentUserId); // Pakai kolom yang sesuai skema
      
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
      const formattedTransactions: DataTransaksi[] = transactions.map(t => {
        // Transformasi data mobil
        const mobil: DataMobil = {
          id: t.car_id,
          merk: t.cars?.car_brands?.name || '',
          model: t.cars?.car_models?.name || '',
          tahun: t.cars?.year || 0,
          warna: t.cars?.color || '',
          foto: Array.isArray(t.cars?.car_images)
            ? t.cars.car_images.map((img: any) => img.image_url)
            : [],
          harga: t.cars?.price || 0
        };
        
        return {
          ...t,
          mobil,
          hasReview: reviewedTransactionIds.includes(t.id),
          payments: paymentsByTxn[t.id] || [] // ← tempelkan payments ke transaksi
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
    setStatusHalaman(prev => ({ ...prev, loading: true }));
    
    try {
      // Mendapatkan user ID dari session saat ini
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id;
      
      if (!currentUserId) {
        throw new Error('User tidak terautentikasi');
      }
      
      // Upload foto ke storage Supabase
      const uploadedImageUrls: string[] = [];
      
      for (const file of statusHalaman.uploadedPhotos) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `reviews/${fileName}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('images')
          .upload(filePath, file);
          
        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          continue;
        }
        
        // Mendapatkan URL publik
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
          
        uploadedImageUrls.push(publicUrl);
      }
      
      // Menyimpan ulasan ke database
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          transaction_id: statusHalaman.reviewData.transaksiId,
          car_id: statusHalaman.reviewData.mobilId,
          user_id: currentUserId,
          rating: statusHalaman.reviewData.rating,
          comment: statusHalaman.reviewData.komentar,
          images: uploadedImageUrls,
          status: 'published'
        });
        
      if (reviewError) {
        throw reviewError;
      }
      
      // Update transaction to mark as reviewed
      setDaftarTransaksi(prev => 
        prev.map(t => 
          t.id === statusHalaman.reviewData.transaksiId 
            ? { ...t, hasReview: true }
            : t
        )
      );
      
      const ulasanBaru: DataUlasan = {
        id: Date.now().toString(),
        transaksiId: statusHalaman.reviewData.transaksiId!,
        mobilId: statusHalaman.reviewData.mobilId!,
        rating: statusHalaman.reviewData.rating!,
        komentar: statusHalaman.reviewData.komentar!,
        foto: uploadedImageUrls,
        tanggalUlasan: new Date().toISOString(),
        helpful: 0,
        status: 'published'
      };
      
      setStatusHalaman(prev => ({
        ...prev,
        view: 'review-success',
        loading: false,
        reviewData: ulasanBaru
      }));
    } catch (error) {
      console.error('Error mengirim ulasan:', error);
      setStatusHalaman(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Gagal mengirim ulasan. Silakan coba lagi.' 
      }));
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

  const pilihTransaksiTertentu = (idTransaksi: string) => {
    const transaksi = daftarTransaksi.find(t => t.id === idTransaksi);
    if (transaksi) {
      setStatusHalaman(prev => ({
        ...prev,
        selectedTransaksi: transaksi,
        view: 'detail'
      }));
    }
  };

  const unduhInvoice = async (idTransaksi: string) => {
    const transaksi = daftarTransaksi.find(t => t.id === idTransaksi);
    if (!transaksi) {
      alert('Transaksi tidak ditemukan');
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

  const isUnpaid = (t: DataTransaksi): boolean => {
    return t.payment_status === 'pending' && !hasPaymentProof(t);
  };

  const isWaitingAdminConfirm = (t: DataTransaksi): boolean => {
    return t.status === 'pending' && hasPaymentProof(t);
  };

  const renderStatusBadge = (t: DataTransaksi) => {
    if (isUnpaid(t)) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
          Belum Bayar
        </span>
      );
    }
    if (isWaitingAdminConfirm(t)) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(t.status)}`}>
        {t.status}
      </span>
    );
  };

  const goToPayment = (t: DataTransaksi) => {
    // Prioritize down_payment if it exists (booking fee)
    const paymentAmount = t.down_payment || t.total_amount;
    
    navigate('/pembayaran', {
      state: {
        amount: paymentAmount,
        transactionId: t.id,
        referenceId: t.invoice_number,
        paymentType: t.down_payment ? 'down_payment' : 
                    (t.remaining_payment && t.remaining_payment > 0 ? 'remaining_payment' : 'full_payment'),
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
    const transaksi = daftarTransaksi.find(t => t.id === idTransaksi);
    if (!transaksi) {
      alert('Transaksi tidak ditemukan');
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
                        {transaksi.hasReview ? '✓ Sudah Diulas' : 'Ulas'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Review Form */}
      {statusHalaman.view === 'review-form' && statusHalaman.selectedTransaksi && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="mb-6">
            <button
              onClick={lihatDaftarRiwayat}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              ← Kembali ke Riwayat
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Tulis Ulasan</h1>
            <p className="text-gray-600">
            Bagikan pengalaman Anda dengan {statusHalaman.selectedTransaksi.mobil?.merk || ''} {statusHalaman.selectedTransaksi.mobil?.model || ''}
          </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            {/* Car Info */}
            <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden">
                <img
                src={`/images/${statusHalaman.selectedTransaksi.mobil?.foto?.[0] || ''}`}
                alt={`${statusHalaman.selectedTransaksi.mobil?.merk || ''} ${statusHalaman.selectedTransaksi.mobil?.model || ''}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                }}
              />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                {statusHalaman.selectedTransaksi.mobil?.merk} {statusHalaman.selectedTransaksi.mobil?.model} {statusHalaman.selectedTransaksi.mobil?.tahun}
              </h3>
              <p className="text-sm text-gray-600">
                Transaksi: {statusHalaman.selectedTransaksi.id} • {formatDate(statusHalaman.selectedTransaksi.transaction_date)}
              </p>
              </div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const rating = Number(formData.get('rating'));
              const komentar = formData.get('komentar') as string;
              
              inputRatingDanUlasan(rating, komentar);
              
              setTimeout(() => {
                kirimUlasan();
              }, 100);
            }} className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rating Keseluruhan *
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <label key={star} className="cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        value={star}
                        required
                        className="sr-only"
                        onChange={(e) => inputRatingDanUlasan(Number(e.target.value), statusHalaman.reviewData.komentar || '')}
                      />
                      <span className={`text-3xl ${
                        (statusHalaman.reviewData.rating || 0) >= star 
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                      } hover:text-yellow-400 transition-colors`}>
                        ⭐
                      </span>
                    </label>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {statusHalaman.reviewData.rating ? `${statusHalaman.reviewData.rating}/5` : 'Pilih rating'}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ulasan Anda *
                </label>
                <textarea
                  name="komentar"
                  required
                  rows={5}
                  placeholder="Ceritakan pengalaman Anda dengan mobil ini..."
                  value={statusHalaman.reviewData.komentar || ''}
                  onChange={(e) => inputRatingDanUlasan(statusHalaman.reviewData.rating || 0, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimal 10 karakter ({(statusHalaman.reviewData.komentar || '').length}/10)
                </p>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tambahkan Foto (Opsional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        putuskanTambahFoto(true);
                        unggahFoto(files);
                      }
                    }}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <span className="text-4xl text-gray-400">📷</span>
                    <p className="mt-2 text-sm text-gray-600">
                      Klik untuk mengunggah foto
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG hingga 5MB (maksimal 5 foto)
                    </p>
                  </label>
                </div>
                
                {/* Uploaded Photos Preview */}
                {statusHalaman.uploadedPhotos.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Foto yang diunggah ({statusHalaman.uploadedPhotos.length})
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                      {statusHalaman.uploadedPhotos.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newPhotos = statusHalaman.uploadedPhotos.filter((_, i) => i !== index);
                              setStatusHalaman(prev => ({ ...prev, uploadedPhotos: newPhotos }));
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-800 mb-2">Panduan Menulis Ulasan:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Berikan ulasan yang jujur dan konstruktif</li>
                  <li>• Ceritakan pengalaman spesifik Anda</li>
                  <li>• Hindari kata-kata kasar atau menyinggung</li>
                  <li>• Foto yang diunggah akan dimoderasi terlebih dahulu</li>
                </ul>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={lihatDaftarRiwayat}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={statusHalaman.loading || !statusHalaman.reviewData.rating || (statusHalaman.reviewData.komentar || '').length < 10}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {statusHalaman.loading ? 'Mengirim...' : 'Kirim Ulasan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Success */}
      {statusHalaman.view === 'review-success' && (
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mb-6">
              <span className="text-6xl">🎉</span>
            </div>
            
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Ulasan Berhasil Dikirim!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Terima kasih atas ulasan Anda. Ulasan akan ditampilkan setelah dimoderasi.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Detail Ulasan</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <span className="flex">
                    {Array.from({ length: statusHalaman.reviewData.rating || 0 }, (_, i) => (
                      <span key={i} className="text-yellow-400">⭐</span>
                    ))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Foto:</span>
                  <span>{statusHalaman.uploadedPhotos.length} foto</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                    Menunggu Moderasi
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-center space-x-4">
                <button
                  onClick={lihatDaftarRiwayat}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Kembali ke Riwayat
                </button>
                <button
                  onClick={() => {/* Navigate to reviews page */}}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Lihat Ulasan Saya
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail */}
      {statusHalaman.view === 'detail' && statusHalaman.selectedTransaksi && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="mb-6">
            <button
              onClick={lihatDaftarRiwayat}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              ← Kembali ke Riwayat
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Detail Transaksi</h1>
            <p className="text-gray-600">ID: {statusHalaman.selectedTransaksi.id}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Car Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Mobil</h3>
                <div className="flex items-start space-x-4">
                  <div className="w-32 h-24 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={`/images/${statusHalaman.selectedTransaksi.mobil?.foto?.[0] || ''}`}
                      alt={`${statusHalaman.selectedTransaksi.mobil?.merk || ''} ${statusHalaman.selectedTransaksi.mobil?.model || ''}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9Ijk2IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNkZGQiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {statusHalaman.selectedTransaksi.mobil?.merk} {statusHalaman.selectedTransaksi.mobil?.model} {statusHalaman.selectedTransaksi.mobil?.tahun}
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Warna: {statusHalaman.selectedTransaksi.mobil?.warna || '-'}</p>
                      {statusHalaman.selectedTransaksi.total_amount && (
                        <p className="font-semibold text-blue-600">
                          Harga: {formatCurrency(statusHalaman.selectedTransaksi.total_amount)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detail Transaksi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID Transaksi:</span>
                      <span className="font-mono">{statusHalaman.selectedTransaksi.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jenis:</span>
                      <span className="capitalize">
                        {statusHalaman.selectedTransaksi.transaction_type === 'purchase' ? 'Pembelian' : 
                         statusHalaman.selectedTransaksi.transaction_type === 'trade_in' ? 'Tukar Tambah' : 'Cicilan'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <div className="flex items-center gap-2">
                        {renderStatusBadge(statusHalaman.selectedTransaksi)}
                        {isWaitingAdminConfirm(statusHalaman.selectedTransaksi) && (
                          <span className="text-xs text-gray-600">
                            Menunggu konfirmasi admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tanggal:</span>
                      <span>{formatDate(statusHalaman.selectedTransaksi.created_at)}</span>
                    </div>
                    {statusHalaman.selectedTransaksi.payment_method && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pembayaran:</span>
                        <span>{statusHalaman.selectedTransaksi.payment_method}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ulasan:</span>
                      <span className={statusHalaman.selectedTransaksi.hasReview ? 'text-green-600' : 'text-gray-400'}>
                        {statusHalaman.selectedTransaksi.hasReview ? '✓ Sudah' : '✗ Belum'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {statusHalaman.selectedTransaksi.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-1">Catatan:</p>
                    <p className="text-sm">{statusHalaman.selectedTransaksi.notes}</p>
                  </div>
                )}

                {/* Rincian Pembayaran (payments) */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Rincian Pembayaran</h4>
                  {Array.isArray(statusHalaman.selectedTransaksi.payments) && statusHalaman.selectedTransaksi.payments.length > 0 ? (
                    <div className="space-y-3">
                      {(() => {
                        // Filter dan urutkan pembayaran untuk menghindari duplikasi
                        const payments = [...statusHalaman.selectedTransaksi.payments];
                        
                        // Kelompokkan pembayaran berdasarkan payment_type
                        const paymentsByType = payments.reduce<Record<string, Payment[]>>((acc, payment) => {
                          const paymentType = payment.payment_type;
                          if (!acc[paymentType]) {
                            acc[paymentType] = [];
                          }
                          acc[paymentType].push(payment);
                          return acc;
                        }, {});
                        
                        // Untuk setiap jenis pembayaran, pilih yang paling relevan
                        const filteredPayments = Object.values(paymentsByType).map((paymentGroup: Payment[]) => {
                          // Cek jika ada pembayaran dengan bukti
                          const paymentWithProof = paymentGroup.find(p => p.proof_of_payment);
                          if (paymentWithProof) return paymentWithProof;
                          
                          // Jika tidak ada bukti, ambil yang status-nya bukan pending
                          const nonPendingPayment = paymentGroup.find(p => p.status !== 'pending');
                          if (nonPendingPayment) return nonPendingPayment;
                          
                          // Jika semua pending, ambil yang terakhir
                          return paymentGroup[paymentGroup.length - 1];
                        });
                        
                        return filteredPayments.map((p) => (
                          <div key={p.id} className="border rounded-md p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-blue-600">💳</span>
                                <span className="font-medium capitalize">
                                  {p.payment_type.replace('_', ' ')}
                                </span>
                                <span className="text-gray-500 text-sm">
                                  {formatDate(p.payment_date)}
                                </span>
                              </div>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(p.status as any)}`}>
                                {p.status}
                              </span>
                            </div>

                            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Jumlah:</span>
                                <span className="font-semibold">{formatCurrency(p.amount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Metode:</span>
                                <span>{p.payment_method}</span>
                              </div>
                              {p.reference_code && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Kode Ref:</span>
                                  <span className="font-mono">{p.reference_code}</span>
                                </div>
                              )}
                              {p.bank_name && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Bank:</span>
                                  <span>{p.bank_name}</span>
                                </div>
                              )}
                              {p.account_holder && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Pemilik Rekening:</span>
                                  <span>{p.account_holder}</span>
                                </div>
                              )}
                              {p.proof_of_payment && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Bukti:</span>
                                  <a href={p.proof_of_payment} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                    Lihat Bukti
                                  </a>
                                </div>
                              )}
                            </div>

                            {p.notes && (
                              <div className="mt-2 text-sm text-gray-600">
                                Catatan: {p.notes}
                              </div>
                            )}
                            {p.rejection_reason && p.status === 'failed' && (
                              <div className="mt-2 text-sm text-red-600">
                                Alasan Ditolak: {p.rejection_reason}
                              </div>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Belum ada data pembayaran untuk transaksi ini.</p>
                  )}
                </div>
              </div>

              {/* Dealer Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dealer</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">🏢</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">ID Dealer: {statusHalaman.selectedTransaksi.seller_id}</h4>
                    <p className="text-sm text-gray-600">Lokasi: N/A</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Aksi</h3>
                  <div className="space-y-3">
                    {isUnpaid(statusHalaman.selectedTransaksi) && (
                      <button
                        onClick={() => goToPayment(statusHalaman.selectedTransaksi!)}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                      >
                        Bayar Sekarang
                      </button>
                    )}

                    {statusHalaman.selectedTransaksi.status === 'completed' && !statusHalaman.selectedTransaksi.hasReview && (
                      <button
                        onClick={() => pilihAksi('review')}
                        className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600"
                      >
                        ⭐ Tulis Ulasan
                      </button>
                    )}
                    
                    <button
                      onClick={() => pilihAksi('repeat-order')}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    >
                      Beri Ulasan
                    </button>
                    
                    <button
                      onClick={() => pilihAksi('contact-dealer')}
                      className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
                    >
                      💬 Hubungi Dealer
                    </button>
                    
                    {statusHalaman.selectedTransaksi.transaction_type === 'purchase' && (
                      <button
                        onClick={() => pilihAksi('download-invoice')}
                        className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
                      >
                        📄 Download Invoice
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {statusHalaman.showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Filter Lanjutan</h3>
              <button
                onClick={() => setStatusHalaman(prev => ({ ...prev, showFilterModal: false }))}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              
                const filter: KriteriaFilter = {
                transaction_type: formData.get('jenisTransaksi') as string,
                status: formData.get('status') as string,
                payment_status: formData.get('payment_status') as string,
                tanggalMulai: formData.get('tanggalMulai') as string,
                tanggalAkhir: formData.get('tanggalAkhir') as string,
                seller: formData.get('seller') as string,
                hasReview: formData.get('hasReview') === 'true' ? true : formData.get('hasReview') === 'false' ? false : null
              };
              
              terapkanFilter(filter);
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  name="tanggalMulai"
                  defaultValue={statusHalaman.filter.tanggalMulai}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  name="tanggalAkhir"
                  defaultValue={statusHalaman.filter.tanggalAkhir}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dealer
                </label>
                <select
                  name="seller"
                  defaultValue={statusHalaman.filter.seller}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Dealer</option>
                  {daftarDealer.map((dealer) => (
                    <option key={dealer} value={dealer}>{dealer}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Ulasan
                </label>
                <select
                  name="hasReview"
                  defaultValue={statusHalaman.filter.hasReview === null ? '' : statusHalaman.filter.hasReview.toString()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua</option>
                  <option value="true">Sudah Diulas</option>
                  <option value="false">Belum Diulas</option>
                </select>
              </div>
              
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStatusHalaman(prev => ({ ...prev, showFilterModal: false }))}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Terapkan Filter
                </button>
              </div>
            </form>
          </div>
        </div>
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
    </div>
  );
};

export default HalamanRiwayat;