import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { carService } from '../services/carService';
import { useAuth } from '../contexts/AuthContext';
import { createTransaction } from '../services/transactionService';

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
  const [selectedPayment, setSelectedPayment] = useState<'credit' | 'cash'>('credit');
  // Hapus state selectedPayment; hanya gunakan cash
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
  }, [id]);

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
  const totalPrice = typeof car?.price === 'number' ? car.price : 205000000;
  const marketPrice = typeof car?.market_price === 'number' ? car.market_price : totalPrice + 15000000;
  const bookingFee = 2500000;

  const prices = {
    credit: totalPrice,
    cash: marketPrice,
    bookingFee,
    remainingPayment: Math.max(totalPrice - bookingFee, 0)
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
  // Di dalam komponen HalamanTransaksi
  const handlePayNow = async () => {
    if (!carId) return;
    if (!isTermsAccepted) return;
    if (!user?.id) {
      window.alert('Silakan login terlebih dahulu untuk melanjutkan.');
      return;
    }
  
    try {
      setIsProcessing(true);
  
      // Sesuaikan nilai amount dengan skema (gunakan booking fee atau harga mobil)
      const buyerId = user.id;
      const sellerId = car?.seller_id || car?.sellerId; // sesuaikan dengan data mobil Anda
      const amount = prices.bookingFee;
  
      const result = await createTransaction({
        buyer_id: buyerId,
        seller_id: sellerId,
        car_id: carId,
        car_price: amount,
        total_amount: amount,
        payment_method: 'bank_transfer',
        payment_status: 'pending',
        down_payment: amount,
        remaining_payment: 0,
        status: 'pending',
        notes: 'Booking fee transaksi'
      });
  
      if (!result.success) {
        console.error('Error saat membuat transaksi:', result.error);
        window.alert('Gagal membuat transaksi: ' + (result.error || 'Unknown error'));
        setIsProcessing(false);
        return;
      }
  
      // Lanjut ke halaman pembayaran setelah transaksi berhasil dibuat
      const referenceId = `BOOK-${carId}-${Date.now()}`;
      const transactionId = result.data?.id || `TXN-${carId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
      navigate('/pembayaran', {
        state: {
          amount: prices.bookingFee,
          referenceId,
          transactionId,
          mobilId: carId,
          paymentType: 'down_payment',
        },
      });
    } catch (err: any) {
      console.error('Error saat membuat transaksi:', err);
      window.alert('Terjadi kesalahan saat membuat transaksi');
    } finally {
      setIsProcessing(false);
    }
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
        {loading && <div className="mb-4 text-sm text-gray-600">Memuat data mobil dari Supabase...</div>}
        
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
                <p className="text-red-500 text-xs mt-1">Car ID: {id}</p>
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
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Section 1: Payment Method */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-2 text-left">1. Bayar Biaya Pemesanan Saja</h2>
                <p className="text-gray-600 text-sm mb-4 text-left">
                  Biaya pemesanan tetap sama untuk pembayaran tunai atau kredit. Metode pembayaran pilihan Anda dapat diubah setelah melakukan pemesanan.
                </p>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
                    <div className="text-sm text-gray-600 mb-1">Harga Cash</div>
                    <div className="text-xl font-bold">{formatPrice(prices.credit)}</div>
                  </div>
                </div>
              </div>
            
            {/* Section 2: Price Details & Voucher */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-2 text-left">2. Rincian Harga & Voucher</h2>
              
              <div className="space-y-3 border-b pb-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">Harga Mobil</div>
                    <div className="text-sm text-gray-500">(Harga Cash)</div>
                  </div>
                  <div className="font-semibold">{formatPrice(prices.credit)}</div>
                </div>

                <button className="w-full flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 = 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
                    </svg>
                    <span className="font-medium text-gray-700">Gunakan Voucher</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500 text-sm">Pilih Voucher</span>
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Harga Total</span>
                  <button className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                    i
                  </button>
                </div>
                <div className="font-bold text-xl">{formatPrice(prices.credit)}</div>
              </div>
            </div>

            {/* Section 3: Info Penjual & Lokasi Mobil */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-left">3. Info Penjual & Lokasi Mobil</h2>
              
              {/* Seller Information */}
              <div className="mb-4">
                <h3 className="text-md font-medium mb-3 text-gray-800">Informasi Penjual</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3 text-sm text-left">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-gray-600">Nama Penjual</div>
                      <div className="col-span-2 font-medium">{car?.users?.full_name || '-'}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-gray-600">Nomor Telepon</div>
                      <div className="col-span-2 text-gray-700">
                        {car?.users?.phone_number || 'Tidak tersedia'}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-gray-600">Tipe Penjual</div>
                      <div className="col-span-2">
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
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-gray-600">Status Verifikasi</div>
                      <div className="col-span-2">
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
                           car?.users?.seller_verification_status === 'pending' ? 'Menunggu Verifikasi' :
                           car?.users?.seller_verification_status === 'rejected' ? 'Ditolak' : 'Belum Diverifikasi'}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h3 className="text-md font-medium mb-3 text-gray-800">Lokasi Mobil</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-3 text-sm text-left">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-gray-600">Alamat</div>
                      <div className="col-span-2 text-gray-700">
                        {car?.users?.address || car?.location_address || 'Alamat tidak tersedia'}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-gray-600">Kota</div>
                      <div className="col-span-2 text-gray-700">
                        {car?.users?.city || car?.location_city || 'Kota tidak tersedia'}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-gray-600">Provinsi</div>
                      <div className="col-span-2 text-gray-700">
                        {car?.location_province || car?.users?.province || 'Provinsi tidak tersedia'}
                      </div>
                    </div>
                    {car?.users?.postal_code && (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-gray-600">Kode Pos</div>
                        <div className="col-span-2 text-gray-700">
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
                <h3 className="font-semibold text-lg">{car?.title || 'Memuat data mobil...'}</h3>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-gray-700">
                Mobil dipesan hanya untuk Anda. Selesaikan pembayaran dalam waktu <strong>3 hari</strong> untuk 
                mencegah pembatalan pemesanan.
              </div>

              {/* Payment Timeline */}
              <div className="mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    </div>
                    <div className="w-0.5 h-16 bg-gray-300 my-1"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-300"></div>
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
                      <div className="text-sm text-gray-500">Dibayar Nanti</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Pembayaran Biaya Pemesanan</span>
                  <span className="font-bold text-xl">{formatPrice(prices.bookingFee)}</span>
                </div>
              </div>

              <div className="mb-4">
                <button
                  disabled={!isTermsAccepted || isProcessing}
                  onClick={!isTermsAccepted || isProcessing ? undefined : handlePayNow}
                  className={
                    `w-full py-3 rounded-lg font-semibold ` +
                    `${!isTermsAccepted || isProcessing
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'}`
                  }
                >
                  {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
                </button>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  id="terms"
                  checked={isTermsAccepted}
                  onChange={(e) => setIsTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-gray-600">
                  Dengan memilih kotak ini, saya mengonfirmasikan bahwa saya telah membaca, memahami, 
                  dan setuju untuk menerima{' '}
                  <a href="/syarat-ketentuan-pemesanan" className="text-blue-600 hover:underline" target="_blank">
                    syarat dan ketentuan
                  </a>
                  .
                </label>
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