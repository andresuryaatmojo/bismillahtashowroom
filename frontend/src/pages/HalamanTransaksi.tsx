import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { carService } from '../services/carService';
import { useAuth } from '../contexts/AuthContext';
import { createTransaction } from '../services/transactionService';
import { supabase } from '../lib/supabase';

interface CarDetails {
  name: string;
  year: number;
  image: string;
}

interface CarImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
  caption?: string;
}

const HalamanTransaksi: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  
  // Get car ID from URL params or navigation state
  const carId = id || (location.state as any)?.mobilId;
  
  // State untuk data dari Supabase
  const [car, setCar] = useState<any | null>(null);
  const [images, setImages] = useState<CarImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk proses pembayaran
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchCar = async () => {
      if (!carId) {
        setError('ID mobil tidak ditemukan di URL');
        return;
      }
      try {
        setLoading(true);
        setError(null);

        console.log('🔍 Fetching car data for ID:', carId);

        // Gunakan carService yang sudah ada untuk mengambil data mobil
        const data = await carService.getCarById(carId);

        if (!data) {
          throw new Error('Mobil tidak ditemukan');
        }

        console.log('✅ Car data loaded:', data);
        setCar(data);
        
        // Process images from car data
        if (data.car_images && Array.isArray(data.car_images)) {
          // Sort images: primary first, then by display_order
          const sortedImages = [...data.car_images].sort((a, b) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return (a.display_order || 0) - (b.display_order || 0);
          });
          setImages(sortedImages);
        }
      } catch (err: any) {
        console.error('❌ Error fetching car data:', err);
        setError(err?.message || 'Gagal memuat data mobil');
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [carId]);

  // Pilih gambar utama
  const primaryImage = images.find(img => img.is_primary)?.image_url || images[0]?.image_url || '';

  const carDetails: CarDetails = {
    name: car?.title || 'Memuat data mobil...',
    year: car?.year || new Date().getFullYear(),
    image: primaryImage
  };

  // Tambahkan informasi brand dan model jika tersedia
  const carDisplayName = car ? 
    `${car.car_brands?.name || ''} ${car.car_models?.name || ''} ${car.title || ''}`.trim() :
    'Memuat data mobil...';
  
  // Harga mobil
  const carPrice = typeof car?.price === 'number' ? car.price : 0;
  const marketPrice = typeof car?.market_price === 'number' ? car.market_price : carPrice;
  
  // Booking fee: bisa dihitung sebagai persentase atau fixed amount
  // Misal: 1% dari harga mobil atau minimum 2.5 juta
  const bookingFee = Math.max(carPrice * 0.01, 2500000);
  
  // Total amount untuk transaksi adalah harga mobil penuh
  const totalAmount = carPrice;
  
  // Sisa pembayaran setelah booking fee
  const remainingPayment = Math.max(totalAmount - bookingFee, 0);

  const prices = {
    carPrice,
    marketPrice,
    bookingFee,
    totalAmount,
    remainingPayment
  };

  const formatPrice = (price: number): string => {
    return `Rp ${price.toLocaleString('id-ID')}`;
  };

  const handleBackToDetail = () => {
    if (carId) {
      navigate(`/mobil/${carId}`);
    } else {
      navigate('/katalog');
    }
  };

  // Handler klik "Bayar Sekarang"
  const handlePayNow = async () => {
    if (!carId) {
      window.alert('ID mobil tidak ditemukan');
      return;
    }
    
    if (!isTermsAccepted) {
      window.alert('Harap setujui syarat dan ketentuan terlebih dahulu');
      return;
    }
    
    if (!user?.id) {
      window.alert('Silakan login terlebih dahulu untuk melanjutkan.');
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    const handleCreateTransaction = async () => {
      if (!car?.seller_id) {
        window.alert('Informasi penjual tidak ditemukan');
        return;
      }
    
      // Cegah beli mobil sendiri
      if (user?.id && car.seller_id && user.id === car.seller_id) {
        window.alert('Anda tidak dapat membeli mobil yang Anda jual sendiri.');
        return;
      }
    
      try {
        setIsProcessing(true);

        // Debugging: Periksa status autentikasi
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔐 Auth Session:', session ? 'Valid' : 'Invalid');
        if (session) {
          console.log('👤 User ID:', session.user.id);

          const expiresLabel =
            typeof session.expires_at === 'number'
              ? new Date(session.expires_at * 1000).toLocaleString()
              : 'Unknown';
          console.log('🔄 Token expires at:', expiresLabel);

          // Verifikasi konsistensi user vs session
          if (user.id !== session.user.id && user.auth_user_id !== session.user.id) {
            console.error('⚠️ User ID mismatch! user.id:', user.id, 'auth_user_id:', user.auth_user_id, 'session.user.id:', session.user.id);
          }
        } else {
          console.error('❌ No active session found!');
        }

        console.log('📝 Creating transaction with booking fee...');

        // Pastikan buyer_id = auth.uid()
        const result = await createTransaction({
          buyer_id: (user.auth_user_id || session?.user.id) as string,
          seller_id: car.seller_id,
          car_id: carId,
          car_price: prices.carPrice,
          booking_fee: prices.bookingFee,
          total_amount: prices.totalAmount,
          trade_in_value: 0,
          discount_amount: 0,
          admin_fee: 0,
          notes: `Booking untuk ${carDisplayName}`,
          transaction_details: JSON.stringify({
            car_name: carDisplayName,
            booking_fee: prices.bookingFee,
            remaining_payment: prices.remainingPayment
          })
        });

        if (!result.success) {
          console.error('❌ Error creating transaction:', result.error);
          window.alert('Gagal membuat transaksi: ' + (result.error || 'Unknown error'));
          return;
        }

        console.log('✅ Transaction created:', result.data);

        // Generate reference ID
        const referenceId = `BOOK-${carId.substring(0, 8)}-${Date.now()}`;
        const transactionId = result.data?.id;

        if (!transactionId) {
          window.alert('Transaction ID tidak ditemukan');
          return;
        }

        // Navigate ke halaman pembayaran dengan data booking fee
        console.log('🔄 Navigating to payment page...');
        navigate('/pembayaran', {
          state: {
            amount: prices.bookingFee, // Hanya bayar booking fee dulu
            referenceId,
            transactionId,
            mobilId: carId,
            paymentType: 'booking_fee', // UPDATE: gunakan booking_fee
            carName: carDisplayName,
            totalCarPrice: prices.totalAmount
          },
        });
      } catch (err: any) {
        console.error('💥 Error creating transaction:', err);
        window.alert('Terjadi kesalahan saat membuat transaksi: ' + (err?.message || 'Unknown error'));
      } finally {
        setIsProcessing(false);
      }
    };

    // PANGGIL fungsi yang sudah didefinisikan
    await handleCreateTransaction();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
          <button 
            onClick={handleBackToDetail}
            className="mr-4 p-2 hover:bg-gray-100 rounded transition-colors"
            title="Kembali ke detail mobil"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold">Pesan Mobil</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Memuat data mobil...</span>
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-red-800 font-medium">Gagal memuat data mobil</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="text-red-600 underline text-sm mt-2 hover:text-red-800"
                >
                  Coba lagi
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Only show when not loading and no error */}
        {!loading && !error && car && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Section 1: Info Booking Fee */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-2 text-left">1. Bayar Biaya Booking Saja</h2>
                <p className="text-gray-600 text-sm mb-4 text-left">
                  Bayar booking fee terlebih dahulu untuk memesan mobil ini. Sisa pembayaran dapat diselesaikan 
                  kemudian dengan metode cash atau kredit sesuai pilihan Anda.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
                    <div className="text-sm text-gray-600 mb-1">Booking Fee</div>
                    <div className="text-2xl font-bold text-blue-600">{formatPrice(prices.bookingFee)}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {((prices.bookingFee / prices.carPrice) * 100).toFixed(1)}% dari harga mobil
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-600 mb-1">Harga Mobil</div>
                    <div className="text-2xl font-bold">{formatPrice(prices.carPrice)}</div>
                    <div className="text-xs text-gray-500 mt-1">Total harga</div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-yellow-800">
                      <strong>Penting:</strong> Booking fee ini akan dikurangkan dari total harga mobil. 
                      Anda hanya perlu membayar sisa {formatPrice(prices.remainingPayment)} saat mengambil mobil.
                    </div>
                  </div>
                </div>
              </div>
            
              {/* Section 2: Price Details */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 text-left">2. Rincian Harga</h2>
                
                <div className="space-y-3 border-b pb-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div className="text-gray-600">Harga Mobil</div>
                    <div className="font-semibold">{formatPrice(prices.carPrice)}</div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div className="text-gray-500">Booking Fee (dibayar sekarang)</div>
                    <div className="text-blue-600 font-medium">- {formatPrice(prices.bookingFee)}</div>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div className="text-gray-500">Sisa Pembayaran (nanti)</div>
                    <div className="text-gray-700 font-medium">{formatPrice(prices.remainingPayment)}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total Harga Mobil</span>
                  <div className="text-right">
                    <div className="font-bold text-2xl">{formatPrice(prices.totalAmount)}</div>
                    {prices.marketPrice > prices.carPrice && (
                      <div className="text-sm text-gray-500 line-through">
                        {formatPrice(prices.marketPrice)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Info Penjual & Lokasi Mobil */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 text-left">3. Info Penjual & Lokasi Mobil</h2>
                
                {/* Seller Information */}
                <div className="mb-6">
                  <h3 className="text-md font-medium mb-3 text-gray-800">Informasi Penjual</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-3 text-sm text-left">
                      <div className="flex justify-between">
                        <div className="text-gray-600">Nama Penjual</div>
                        <div className="font-medium">{car?.users?.full_name || '-'}</div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-gray-600">Nomor Telepon</div>
                        <div className="text-gray-700">
                          {car?.users?.phone_number || 'Tidak tersedia'}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-gray-600">Tipe Penjual</div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          car?.users?.seller_type === 'showroom' 
                            ? 'bg-blue-100 text-blue-800' 
                            : car?.users?.seller_type === 'external'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {car?.users?.seller_type === 'showroom' ? 'Showroom' : 
                           car?.users?.seller_type === 'external' ? 'Eksternal' : 'Individual'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-gray-600">Status Verifikasi</div>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          car?.users?.seller_verification_status === 'verified' 
                            ? 'bg-green-100 text-green-800' 
                            : car?.users?.seller_verification_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : car?.users?.seller_verification_status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {car?.users?.seller_verification_status === 'verified' ? 'Terverifikasi' : 
                           car?.users?.seller_verification_status === 'pending' ? 'Menunggu' :
                           car?.users?.seller_verification_status === 'rejected' ? 'Ditolak' : 'Belum Diverifikasi'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <h3 className="text-md font-medium mb-3 text-gray-800">Lokasi Mobil</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-3 text-sm text-left">
                      <div className="flex justify-between">
                        <div className="text-gray-600 w-24">Alamat</div>
                        <div className="text-gray-700 flex-1 text-right">
                          {car?.users?.address || car?.location_address || 'Alamat tidak tersedia'}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-gray-600">Kota</div>
                        <div className="text-gray-700">
                          {car?.users?.city || car?.location_city || 'Kota tidak tersedia'}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-gray-600">Provinsi</div>
                        <div className="text-gray-700">
                          {car?.location_province || car?.users?.province || 'Provinsi tidak tersedia'}
                        </div>
                      </div>
                      {car?.users?.postal_code && (
                        <div className="flex justify-between">
                          <div className="text-gray-600">Kode Pos</div>
                          <div className="text-gray-700">
                            {car?.users?.postal_code}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Car Info & Payment Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <div className="mb-4">
                  <img 
                    src={carDetails.image || '/placeholder-car.jpg'} 
                    alt={carDetails.name}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-car.jpg';
                    }}
                  />
                  <h3 className="font-semibold text-lg">{carDisplayName}</h3>
                  <p className="text-sm text-gray-500">Tahun {car?.year}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <div>
                      Mobil dipesan khusus untuk Anda. Selesaikan pembayaran booking dalam waktu <strong>24 jam</strong> untuk 
                      mencegah pembatalan otomatis.
                    </div>
                  </div>
                </div>

                {/* Payment Timeline */}
                <div className="mb-6">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">1</span>
                      </div>
                      <div className="w-0.5 h-20 bg-gray-300 my-1"></div>
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">2</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-8">
                        <div className="font-semibold mb-1">Booking Fee</div>
                        <div className="text-xl font-bold mb-1">{formatPrice(prices.bookingFee)}</div>
                        <div className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                          Bayar Sekarang
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold mb-1">Sisa Pembayaran</div>
                        <div className="text-xl font-bold mb-1">{formatPrice(prices.remainingPayment)}</div>
                        <div className="text-sm text-gray-500">Bayar saat pengambilan mobil</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Yang Harus Dibayar Sekarang</span>
                    <span className="font-bold text-2xl text-blue-600">{formatPrice(prices.bookingFee)}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Sisa {formatPrice(prices.remainingPayment)} dibayar nanti
                  </p>
                </div>

                <div className="mb-4">
                  <button
                    disabled={!isTermsAccepted || isProcessing}
                    onClick={handlePayNow}
                    className={
                      `w-full py-3 rounded-lg font-semibold transition-colors ` +
                      `${!isTermsAccepted || isProcessing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'}`
                    }
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        <span>Memproses...</span>
                      </div>
                    ) : (
                      `Bayar Booking Fee ${formatPrice(prices.bookingFee)}`
                    )}
                  </button>
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={isTermsAccepted}
                    onChange={(e) => setIsTermsAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-gray-600 cursor-pointer">
                    Dengan memilih kotak ini, saya mengonfirmasikan bahwa saya telah membaca, memahami, 
                    dan setuju untuk menerima{' '}
                    <a href="/syarat-ketentuan-pemesanan" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      syarat dan ketentuan pemesanan
                    </a>.
                  </label>
                </div>

                {/* Info Keamanan */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <span>Pembayaran aman dan terenkripsi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HalamanTransaksi;