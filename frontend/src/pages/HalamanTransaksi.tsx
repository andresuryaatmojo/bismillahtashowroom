import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  FileText, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Download,
  Upload,
  Eye,
  ArrowRight,
  ArrowLeft,
  Banknote,
  Calculator,
  Shield,
  MessageSquare,
  Loader2
} from 'lucide-react';

// Interface untuk data transaksi
interface DataTransaksi {
  id: string;
  nomorTransaksi: string;
  tanggalTransaksi: string;
  status: 'pending' | 'processing' | 'paid' | 'confirmed' | 'completed' | 'cancelled' | 'failed';
  mobil: {
    id: string;
    nama: string;
    merek: string;
    model: string;
    varian: string;
    tahun: number;
    harga: number;
    gambar: string;
  };
  pelanggan: {
    id: string;
    nama: string;
    email: string;
    telepon: string;
    alamat: string;
    ktp: string;
  };
  pembayaran: {
    metode: 'cash' | 'kredit' | 'leasing';
    totalHarga: number;
    uangMuka?: number;
    sisaPembayaran?: number;
    tenor?: number;
    bungaPerTahun?: number;
    cicilanPerBulan?: number;
    asuransi?: number;
    biayaAdmin: number;
    pajak: number;
    totalBayar: number;
  };
  dealer: {
    id: string;
    nama: string;
    alamat: string;
    telepon: string;
    salesPerson: string;
  };
  dokumen: {
    invoice?: string;
    buktiPembayaran?: string;
    kontrak?: string;
    suratJalan?: string;
  };
  timeline: TimelineItem[];
  catatan?: string;
}

// Interface untuk timeline transaksi
interface TimelineItem {
  id: string;
  tanggal: string;
  status: string;
  deskripsi: string;
  oleh: string;
  dokumen?: string;
}

// Interface untuk form pembelian
interface FormPembelian {
  mobilId: string;
  pelanggan: {
    nama: string;
    email: string;
    telepon: string;
    alamat: string;
    ktp: string;
  };
  metodePembayaran: 'cash' | 'kredit' | 'leasing';
  uangMuka?: number;
  tenor?: number;
  asuransi: boolean;
  dealerId: string;
  catatan?: string;
}

// Interface untuk invoice
interface InvoiceData {
  nomorInvoice: string;
  tanggalInvoice: string;
  jatuhTempo: string;
  transaksi: DataTransaksi;
  items: {
    deskripsi: string;
    jumlah: number;
    hargaSatuan: number;
    total: number;
  }[];
  subtotal: number;
  pajak: number;
  total: number;
  metodePembayaran: string;
  rekeningTujuan?: {
    bank: string;
    nomorRekening: string;
    atasNama: string;
  };
}

// Interface untuk state halaman
interface StateHalaman {
  loading: boolean;
  error: string | null;
  activeTab: 'form' | 'status' | 'invoice' | 'bukti' | 'riwayat';
  transaksi: DataTransaksi | null;
  formData: FormPembelian;
  riwayatTransaksi: DataTransaksi[];
  invoiceData: InvoiceData | null;
  showConfirmation: boolean;
  paymentInProgress: boolean;
  uploadingDocument: boolean;
}

const HalamanTransaksi: React.FC = () => {
  const navigate = useNavigate();
  const { transaksiId } = useParams();
  const [searchParams] = useSearchParams();
  const mobilId = searchParams.get('mobil');

  // State management
  const [state, setState] = useState<StateHalaman>({
    loading: false,
    error: null,
    activeTab: transaksiId ? 'status' : 'form',
    transaksi: null,
    formData: {
      mobilId: mobilId || '',
      pelanggan: {
        nama: '',
        email: '',
        telepon: '',
        alamat: '',
        ktp: ''
      },
      metodePembayaran: 'cash',
      dealerId: '',
      asuransi: false
    },
    riwayatTransaksi: [],
    invoiceData: null,
    showConfirmation: false,
    paymentInProgress: false,
    uploadingDocument: false
  });

  /**
   * Tampilkan form pembelian
   */
  const tampilkanFormPembelian = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, activeTab: 'form' }));

      // Load car data if mobilId is provided
      if (state.formData.mobilId) {
        // Simulate API call to get car details
        // In real implementation, this would call a car controller
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setState(prev => ({ ...prev, loading: false }));

    } catch (error) {
      console.error('Error loading purchase form:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal memuat form pembelian. Silakan coba lagi.'
      }));
    }
  }, [state.formData.mobilId]);

  /**
   * Tampilkan status transaksi
   */
  const tampilkanStatusTransaksi = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, activeTab: 'status' }));

      if (!transaksiId) {
        throw new Error('ID transaksi tidak ditemukan');
      }

      // Simulate API call to get transaction status
      const mockTransaksiData: DataTransaksi = {
        id: transaksiId,
        nomorTransaksi: 'TRX-2024-001',
        tanggalTransaksi: '2024-01-15T10:30:00Z',
        status: 'processing',
        mobil: {
          id: '1',
          nama: 'Toyota Avanza 1.3 G MT',
          merek: 'Toyota',
          model: 'Avanza',
          varian: '1.3 G MT',
          tahun: 2024,
          harga: 235000000,
          gambar: '/images/cars/avanza-1.jpg'
        },
        pelanggan: {
          id: '1',
          nama: 'John Doe',
          email: 'john@example.com',
          telepon: '081234567890',
          alamat: 'Jl. Sudirman No. 123, Jakarta',
          ktp: '3171234567890123'
        },
        pembayaran: {
          metode: 'kredit',
          totalHarga: 235000000,
          uangMuka: 47000000,
          sisaPembayaran: 188000000,
          tenor: 36,
          bungaPerTahun: 8.5,
          cicilanPerBulan: 5800000,
          asuransi: 2500000,
          biayaAdmin: 1500000,
          pajak: 23500000,
          totalBayar: 262500000
        },
        dealer: {
          id: '1',
          nama: 'Toyota Sunter',
          alamat: 'Jl. Yos Sudarso, Jakarta Utara',
          telepon: '021-1234567',
          salesPerson: 'Ahmad Wijaya'
        },
        dokumen: {
          invoice: '/documents/invoice-TRX-2024-001.pdf',
          buktiPembayaran: '/documents/payment-TRX-2024-001.pdf'
        },
        timeline: [
          {
            id: '1',
            tanggal: '2024-01-15T10:30:00Z',
            status: 'Transaksi Dibuat',
            deskripsi: 'Transaksi pembelian mobil telah dibuat',
            oleh: 'System'
          },
          {
            id: '2',
            tanggal: '2024-01-15T11:00:00Z',
            status: 'Menunggu Pembayaran',
            deskripsi: 'Menunggu pembayaran uang muka',
            oleh: 'System'
          },
          {
            id: '3',
            tanggal: '2024-01-15T14:30:00Z',
            status: 'Pembayaran Diterima',
            deskripsi: 'Uang muka telah diterima dan diverifikasi',
            oleh: 'Ahmad Wijaya'
          }
        ],
        catatan: 'Pengiriman dijadwalkan minggu depan'
      };

      await new Promise(resolve => setTimeout(resolve, 1000));

      setState(prev => ({
        ...prev,
        loading: false,
        transaksi: mockTransaksiData
      }));

    } catch (error) {
      console.error('Error loading transaction status:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal memuat status transaksi. Silakan coba lagi.'
      }));
    }
  }, [transaksiId]);

  /**
   * Tampilkan invoice
   * @param data - Data untuk generate invoice
   */
  const tampilkanInvoice = useCallback(async (data?: any) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, activeTab: 'invoice' }));

      if (!state.transaksi && !data) {
        throw new Error('Data transaksi tidak ditemukan');
      }

      // Generate invoice data
      const transaksiData = data || state.transaksi!;
      const invoiceData: InvoiceData = {
        nomorInvoice: `INV-${transaksiData.nomorTransaksi}`,
        tanggalInvoice: transaksiData.tanggalTransaksi,
        jatuhTempo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        transaksi: transaksiData,
        items: [
          {
            deskripsi: `${transaksiData.mobil.nama} (${transaksiData.mobil.tahun})`,
            jumlah: 1,
            hargaSatuan: transaksiData.mobil.harga,
            total: transaksiData.mobil.harga
          },
          ...(transaksiData.pembayaran.asuransi ? [{
            deskripsi: 'Asuransi Kendaraan',
            jumlah: 1,
            hargaSatuan: transaksiData.pembayaran.asuransi,
            total: transaksiData.pembayaran.asuransi
          }] : []),
          {
            deskripsi: 'Biaya Administrasi',
            jumlah: 1,
            hargaSatuan: transaksiData.pembayaran.biayaAdmin,
            total: transaksiData.pembayaran.biayaAdmin
          }
        ],
        subtotal: transaksiData.pembayaran.totalHarga + (transaksiData.pembayaran.asuransi || 0) + transaksiData.pembayaran.biayaAdmin,
        pajak: transaksiData.pembayaran.pajak,
        total: transaksiData.pembayaran.totalBayar,
        metodePembayaran: transaksiData.pembayaran.metode,
        rekeningTujuan: {
          bank: 'Bank BCA',
          nomorRekening: '1234567890',
          atasNama: 'PT. Mobilindo Showroom'
        }
      };

      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prev => ({
        ...prev,
        loading: false,
        invoiceData
      }));

    } catch (error) {
      console.error('Error generating invoice:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal membuat invoice. Silakan coba lagi.'
      }));
    }
  }, [state.transaksi]);

  /**
   * Tampilkan bukti pembelian
   */
  const tampilkanBuktiPembelian = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, activeTab: 'bukti' }));

      if (!state.transaksi) {
        await tampilkanStatusTransaksi();
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prev => ({ ...prev, loading: false }));

    } catch (error) {
      console.error('Error loading purchase receipt:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal memuat bukti pembelian. Silakan coba lagi.'
      }));
    }
  }, [state.transaksi, tampilkanStatusTransaksi]);

  /**
   * Tampilkan riwayat transaksi
   */
  const tampilkanRiwayatTransaksi = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, activeTab: 'riwayat' }));

      // Simulate API call to get transaction history
      const mockRiwayatData: DataTransaksi[] = [
        {
          id: '1',
          nomorTransaksi: 'TRX-2024-001',
          tanggalTransaksi: '2024-01-15T10:30:00Z',
          status: 'processing',
          mobil: {
            id: '1',
            nama: 'Toyota Avanza 1.3 G MT',
            merek: 'Toyota',
            model: 'Avanza',
            varian: '1.3 G MT',
            tahun: 2024,
            harga: 235000000,
            gambar: '/images/cars/avanza-1.jpg'
          },
          pelanggan: {
            id: '1',
            nama: 'John Doe',
            email: 'john@example.com',
            telepon: '081234567890',
            alamat: 'Jl. Sudirman No. 123, Jakarta',
            ktp: '3171234567890123'
          },
          pembayaran: {
            metode: 'kredit',
            totalHarga: 235000000,
            biayaAdmin: 1500000,
            pajak: 23500000,
            totalBayar: 260000000
          },
          dealer: {
            id: '1',
            nama: 'Toyota Sunter',
            alamat: 'Jl. Yos Sudarso, Jakarta Utara',
            telepon: '021-1234567',
            salesPerson: 'Ahmad Wijaya'
          },
          dokumen: {},
          timeline: []
        },
        {
          id: '2',
          nomorTransaksi: 'TRX-2023-045',
          tanggalTransaksi: '2023-12-20T14:15:00Z',
          status: 'completed',
          mobil: {
            id: '2',
            nama: 'Honda Brio RS CVT',
            merek: 'Honda',
            model: 'Brio',
            varian: 'RS CVT',
            tahun: 2023,
            harga: 185000000,
            gambar: '/images/cars/brio-1.jpg'
          },
          pelanggan: {
            id: '1',
            nama: 'John Doe',
            email: 'john@example.com',
            telepon: '081234567890',
            alamat: 'Jl. Sudirman No. 123, Jakarta',
            ktp: '3171234567890123'
          },
          pembayaran: {
            metode: 'cash',
            totalHarga: 185000000,
            biayaAdmin: 1000000,
            pajak: 18500000,
            totalBayar: 204500000
          },
          dealer: {
            id: '2',
            nama: 'Honda Kelapa Gading',
            alamat: 'Jl. Boulevard Raya, Jakarta Utara',
            telepon: '021-9876543',
            salesPerson: 'Siti Nurhaliza'
          },
          dokumen: {
            invoice: '/documents/invoice-TRX-2023-045.pdf',
            buktiPembayaran: '/documents/payment-TRX-2023-045.pdf',
            suratJalan: '/documents/delivery-TRX-2023-045.pdf'
          },
          timeline: []
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 1000));

      setState(prev => ({
        ...prev,
        loading: false,
        riwayatTransaksi: mockRiwayatData
      }));

    } catch (error) {
      console.error('Error loading transaction history:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal memuat riwayat transaksi. Silakan coba lagi.'
      }));
    }
  }, []);

  /**
   * Proses pembayaran
   */
  const prosesPembayaran = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, paymentInProgress: true, error: null }));

      if (!state.transaksi) {
        throw new Error('Data transaksi tidak ditemukan');
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Update transaction status
      const updatedTransaksi = {
        ...state.transaksi,
        status: 'paid' as const,
        timeline: [
          ...state.transaksi.timeline,
          {
            id: Date.now().toString(),
            tanggal: new Date().toISOString(),
            status: 'Pembayaran Berhasil',
            deskripsi: 'Pembayaran telah berhasil diproses',
            oleh: 'Payment Gateway'
          }
        ]
      };

      setState(prev => ({
        ...prev,
        paymentInProgress: false,
        transaksi: updatedTransaksi
      }));

      alert('Pembayaran berhasil diproses!');

    } catch (error) {
      console.error('Error processing payment:', error);
      setState(prev => ({
        ...prev,
        paymentInProgress: false,
        error: 'Gagal memproses pembayaran. Silakan coba lagi.'
      }));
    }
  }, [state.transaksi]);

  /**
   * Konfirmasi transaksi
   */
  const konfirmasiTransaksi = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      if (!state.transaksi) {
        throw new Error('Data transaksi tidak ditemukan');
      }

      // Simulate transaction confirmation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update transaction status
      const updatedTransaksi = {
        ...state.transaksi,
        status: 'confirmed' as const,
        timeline: [
          ...state.transaksi.timeline,
          {
            id: Date.now().toString(),
            tanggal: new Date().toISOString(),
            status: 'Transaksi Dikonfirmasi',
            deskripsi: 'Transaksi telah dikonfirmasi dan akan diproses lebih lanjut',
            oleh: 'Sales Person'
          }
        ]
      };

      setState(prev => ({
        ...prev,
        loading: false,
        transaksi: updatedTransaksi,
        showConfirmation: false
      }));

      alert('Transaksi berhasil dikonfirmasi!');

    } catch (error) {
      console.error('Error confirming transaction:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal mengkonfirmasi transaksi. Silakan coba lagi.'
      }));
    }
  }, [state.transaksi]);

  /**
   * Handle form submission
   */
  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Validate form data
      if (!state.formData.mobilId || !state.formData.pelanggan.nama || !state.formData.pelanggan.email) {
        throw new Error('Mohon lengkapi semua field yang wajib diisi');
      }

      // Simulate API call to create transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newTransaksiId = 'TRX-' + Date.now();
      
      alert('Transaksi berhasil dibuat!');
      navigate(`/transaksi/${newTransaksiId}`);

    } catch (error) {
      console.error('Error creating transaction:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Gagal membuat transaksi. Silakan coba lagi.'
      }));
    }
  }, [state.formData, navigate]);

  /**
   * Get status color
   */
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-indigo-100 text-indigo-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get status label
   */
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'processing': return 'Diproses';
      case 'paid': return 'Dibayar';
      case 'confirmed': return 'Dikonfirmasi';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      case 'failed': return 'Gagal';
      default: return status;
    }
  };

  // Load initial data based on URL parameters
  useEffect(() => {
    if (transaksiId) {
      tampilkanStatusTransaksi();
    } else {
      tampilkanFormPembelian();
    }
  }, [transaksiId, tampilkanStatusTransaksi, tampilkanFormPembelian]);

  // Render loading state
  if (state.loading && !state.transaksi && state.riwayatTransaksi.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data transaksi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {transaksiId ? 'Detail Transaksi' : 'Transaksi Baru'}
          </h1>
          {state.transaksi && (
            <div className="flex items-center space-x-4 mt-2">
              <p className="text-gray-600">
                {state.transaksi.nomorTransaksi}
              </p>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(state.transaksi.status)}`}>
                {getStatusLabel(state.transaksi.status)}
              </span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700">{state.error}</p>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'form', label: 'Form Pembelian', icon: '📝' },
                { id: 'status', label: 'Status Transaksi', icon: '📊' },
                { id: 'invoice', label: 'Invoice', icon: '🧾' },
                { id: 'bukti', label: 'Bukti Pembelian', icon: '📄' },
                { id: 'riwayat', label: 'Riwayat Transaksi', icon: '📚' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setState(prev => ({ ...prev, activeTab: tab.id as any }));
                    switch (tab.id) {
                      case 'form': tampilkanFormPembelian(); break;
                      case 'status': tampilkanStatusTransaksi(); break;
                      case 'invoice': tampilkanInvoice(); break;
                      case 'bukti': tampilkanBuktiPembelian(); break;
                      case 'riwayat': tampilkanRiwayatTransaksi(); break;
                    }
                  }}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    state.activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Form Pembelian */}
          {state.activeTab === 'form' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Form Pembelian Mobil</h2>
              
              <form onSubmit={handleFormSubmit} className="space-y-6">
                 {/* Customer Information */}
                 <Card>
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <User className="h-5 w-5" />
                       Informasi Pelanggan
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                         <Label htmlFor="nama" className="flex items-center gap-2">
                           <User className="h-4 w-4" />
                           Nama Lengkap *
                         </Label>
                         <Input
                           id="nama"
                           type="text"
                           required
                           value={state.formData.pelanggan.nama}
                           onChange={(e) => setState(prev => ({
                             ...prev,
                             formData: {
                               ...prev.formData,
                               pelanggan: { ...prev.formData.pelanggan, nama: e.target.value }
                             }
                           }))}
                           placeholder="Masukkan nama lengkap"
                         />
                       </div>
                       
                       <div className="space-y-2">
                         <Label htmlFor="email" className="flex items-center gap-2">
                           <Mail className="h-4 w-4" />
                           Email *
                         </Label>
                         <Input
                           id="email"
                           type="email"
                           required
                           value={state.formData.pelanggan.email}
                           onChange={(e) => setState(prev => ({
                             ...prev,
                             formData: {
                               ...prev.formData,
                               pelanggan: { ...prev.formData.pelanggan, email: e.target.value }
                             }
                           }))}
                           placeholder="Masukkan email"
                         />
                       </div>
                       
                       <div className="space-y-2">
                         <Label htmlFor="telepon" className="flex items-center gap-2">
                           <Phone className="h-4 w-4" />
                           Nomor Telepon *
                         </Label>
                         <Input
                           id="telepon"
                           type="tel"
                           required
                           value={state.formData.pelanggan.telepon}
                           onChange={(e) => setState(prev => ({
                             ...prev,
                             formData: {
                               ...prev.formData,
                               pelanggan: { ...prev.formData.pelanggan, telepon: e.target.value }
                             }
                           }))}
                           placeholder="Masukkan nomor telepon"
                         />
                       </div>
                       
                       <div className="space-y-2">
                         <Label htmlFor="ktp" className="flex items-center gap-2">
                           <CreditCard className="h-4 w-4" />
                           Nomor KTP *
                         </Label>
                         <Input
                           id="ktp"
                           type="text"
                           required
                           value={state.formData.pelanggan.ktp}
                           onChange={(e) => setState(prev => ({
                             ...prev,
                             formData: {
                               ...prev.formData,
                               pelanggan: { ...prev.formData.pelanggan, ktp: e.target.value }
                             }
                           }))}
                           placeholder="Masukkan nomor KTP"
                         />
                       </div>
                     </div>
                     
                     <div className="space-y-2 mt-6">
                       <Label htmlFor="alamat" className="flex items-center gap-2">
                         <FileText className="h-4 w-4" />
                         Alamat Lengkap *
                       </Label>
                       <Textarea
                         id="alamat"
                         required
                         rows={3}
                         value={state.formData.pelanggan.alamat}
                         onChange={(e) => setState(prev => ({
                           ...prev,
                           formData: {
                             ...prev.formData,
                             pelanggan: { ...prev.formData.pelanggan, alamat: e.target.value }
                           }
                         }))}
                         placeholder="Masukkan alamat lengkap"
                       />
                     </div>
                   </CardContent>
                 </Card>

                 {/* Payment Method */}
                 <Card>
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <CreditCard className="h-5 w-5" />
                       Metode Pembayaran
                     </CardTitle>
                   </CardHeader>
                   <CardContent>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {[
                         { value: 'cash', label: 'Tunai', desc: 'Pembayaran langsung penuh', icon: Banknote },
                         { value: 'kredit', label: 'Kredit', desc: 'Cicilan melalui bank', icon: CreditCard },
                         { value: 'leasing', label: 'Leasing', desc: 'Cicilan melalui leasing', icon: FileText }
                       ].map((method) => {
                         const IconComponent = method.icon;
                         return (
                           <label
                             key={method.value}
                             className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                               state.formData.metodePembayaran === method.value
                                 ? 'border-blue-500 bg-blue-50'
                                 : 'border-gray-200 hover:border-gray-300'
                             }`}
                           >
                             <input
                               type="radio"
                               name="metodePembayaran"
                               value={method.value}
                               checked={state.formData.metodePembayaran === method.value}
                               onChange={(e) => setState(prev => ({
                                 ...prev,
                                 formData: { ...prev.formData, metodePembayaran: e.target.value as any }
                               }))}
                               className="sr-only"
                             />
                             <div className="flex items-center gap-2 mb-2">
                               <IconComponent className="h-5 w-5 text-blue-600" />
                               <div className="font-medium text-gray-800">{method.label}</div>
                             </div>
                             <div className="text-sm text-gray-600">{method.desc}</div>
                           </label>
                         );
                       })}
                     </div>
                   </CardContent>
                 </Card>

                 {/* Credit/Leasing Options */}
                 {(state.formData.metodePembayaran === 'kredit' || state.formData.metodePembayaran === 'leasing') && (
                   <Card>
                     <CardHeader>
                       <CardTitle className="flex items-center gap-2">
                         <Calculator className="h-5 w-5" />
                         Opsi Pembiayaan
                       </CardTitle>
                     </CardHeader>
                     <CardContent>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                           <Label htmlFor="uangMuka" className="flex items-center gap-2">
                             <Banknote className="h-4 w-4" />
                             Uang Muka (Rp)
                           </Label>
                           <Input
                             id="uangMuka"
                             type="number"
                             value={state.formData.uangMuka || ''}
                             onChange={(e) => setState(prev => ({
                               ...prev,
                               formData: { ...prev.formData, uangMuka: parseInt(e.target.value) || 0 }
                             }))}
                             placeholder="Masukkan jumlah uang muka"
                           />
                         </div>
                         
                         <div className="space-y-2">
                           <Label htmlFor="tenor" className="flex items-center gap-2">
                             <Calendar className="h-4 w-4" />
                             Tenor (Bulan)
                           </Label>
                           <Select
                             value={state.formData.tenor?.toString() || ''}
                             onValueChange={(value) => setState(prev => ({
                               ...prev,
                               formData: { ...prev.formData, tenor: parseInt(value) || 0 }
                             }))}
                           >
                             <SelectTrigger>
                               <SelectValue placeholder="Pilih tenor" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="12">12 Bulan</SelectItem>
                               <SelectItem value="24">24 Bulan</SelectItem>
                               <SelectItem value="36">36 Bulan</SelectItem>
                               <SelectItem value="48">48 Bulan</SelectItem>
                               <SelectItem value="60">60 Bulan</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                       </div>
                     </CardContent>
                   </Card>
                 )}

                 {/* Insurance and Notes */}
                 <Card>
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                       <Shield className="h-5 w-5" />
                       Opsi Tambahan
                     </CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-6">
                     {/* Insurance */}
                     <div className="flex items-center space-x-2">
                       <Checkbox
                         id="asuransi"
                         checked={state.formData.asuransi}
                         onCheckedChange={(checked) => setState(prev => ({
                           ...prev,
                           formData: { ...prev.formData, asuransi: checked as boolean }
                         }))}
                       />
                       <Label htmlFor="asuransi" className="flex items-center gap-2">
                         <Shield className="h-4 w-4" />
                         Sertakan asuransi kendaraan (direkomendasikan)
                       </Label>
                     </div>

                     {/* Notes */}
                     <div className="space-y-2">
                       <Label htmlFor="catatan" className="flex items-center gap-2">
                         <MessageSquare className="h-4 w-4" />
                         Catatan Tambahan
                       </Label>
                       <Textarea
                         id="catatan"
                         rows={3}
                         value={state.formData.catatan || ''}
                         onChange={(e) => setState(prev => ({
                           ...prev,
                           formData: { ...prev.formData, catatan: e.target.value }
                         }))}
                         placeholder="Masukkan catatan atau permintaan khusus"
                       />
                     </div>
                   </CardContent>
                 </Card>

                 {/* Submit Button */}
                 <div className="flex justify-end space-x-4">
                   <Button
                     type="button"
                     variant="outline"
                     onClick={() => navigate(-1)}
                   >
                     <ArrowLeft className="h-4 w-4 mr-2" />
                     Batal
                   </Button>
                   <Button
                     type="submit"
                     disabled={state.loading}
                   >
                     {state.loading ? (
                       <>
                         <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                         Memproses...
                       </>
                     ) : (
                       <>
                         <CheckCircle className="h-4 w-4 mr-2" />
                         Buat Transaksi
                       </>
                     )}
                   </Button>
                 </div>
              </form>
            </div>
          )}

          {/* Status Transaksi */}
          {state.activeTab === 'status' && state.transaksi && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Status Transaksi</h2>
              
              {/* Transaction Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Car Info */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Informasi Mobil</h3>
                  <div className="flex items-center space-x-4">
                    <img
                      src={state.transaksi.mobil.gambar}
                      alt={state.transaksi.mobil.nama}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-800">{state.transaksi.mobil.nama}</h4>
                      <p className="text-gray-600">{state.transaksi.mobil.merek} • {state.transaksi.mobil.tahun}</p>
                      <p className="text-lg font-bold text-blue-600">
                        Rp {state.transaksi.mobil.harga.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Informasi Pembayaran</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Metode:</span>
                      <span className="font-medium capitalize">{state.transaksi.pembayaran.metode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Harga:</span>
                      <span className="font-medium">Rp {state.transaksi.pembayaran.totalHarga.toLocaleString('id-ID')}</span>
                    </div>
                    {state.transaksi.pembayaran.uangMuka && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Uang Muka:</span>
                        <span className="font-medium">Rp {state.transaksi.pembayaran.uangMuka.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Total Bayar:</span>
                      <span className="font-bold text-lg">Rp {state.transaksi.pembayaran.totalBayar.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Timeline Transaksi</h3>
                {state.transaksi.timeline && state.transaksi.timeline.length > 0 ? (
                  <div className="space-y-4">
                    {state.transaksi.timeline.map((item, index) => (
                      <div key={item.id} className="flex items-start space-x-4">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                        }`}></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-800">{item.status}</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(item.tanggal).toLocaleString('id-ID')}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">{item.deskripsi}</p>
                          <p className="text-gray-500 text-xs">oleh {item.oleh}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-gray-400 text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Riwayat Transaksi</h3>
                    <p className="text-gray-600 mb-6">
                      Anda belum memiliki riwayat transaksi
                    </p>
                    <button
                      onClick={() => navigate('/cars')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mulai Berbelanja
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {state.showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Konfirmasi Transaksi</h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin mengkonfirmasi transaksi ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setState(prev => ({ ...prev, showConfirmation: false }))}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={konfirmasiTransaksi}
                  disabled={state.loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.loading ? 'Memproses...' : 'Konfirmasi'}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default HalamanTransaksi;