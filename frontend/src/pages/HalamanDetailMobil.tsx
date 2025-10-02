import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { 
  Car, 
  Phone, 
  MapPin, 
  Star, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Fuel, 
  Gauge, 
  Settings, 
  Zap,
  Shield,
  Award,
  CreditCard
} from 'lucide-react';

interface CarData {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  specifications: {
    engine: string;
    power: string;
    torque: string;
    transmission: string;
    fuelType: string;
    fuelCapacity: string;
    seating: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    features: string[];
  };
  dealer: {
    name: string;
    location: string;
    phone: string;
    rating: number;
  };
  condition: 'new' | 'used';
  mileage?: number;
  status: 'available' | 'sold' | 'reserved';
}

interface BookingForm {
  fullName: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  bookingType: 'test-drive' | 'purchase-inquiry';
}

const HalamanDetailMobil: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<CarData | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    fullName: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
    bookingType: 'test-drive'
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadCarData();
  }, [id]);

  const loadCarData = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      const mockCar: CarData = {
        id: id || '1',
        brand: 'Toyota',
        model: 'Camry Hybrid',
        year: 2024,
        price: 750000000,
        originalPrice: 800000000,
        images: [
          'https://via.placeholder.com/800x600/0066CC/FFFFFF?text=Toyota+Camry+1',
          'https://via.placeholder.com/800x600/0066CC/FFFFFF?text=Toyota+Camry+2',
          'https://via.placeholder.com/800x600/0066CC/FFFFFF?text=Toyota+Camry+3',
          'https://via.placeholder.com/800x600/0066CC/FFFFFF?text=Toyota+Camry+4'
        ],
        description: 'Sedan premium dengan teknologi hybrid terdepan, memberikan efisiensi bahan bakar optimal tanpa mengorbankan performa. Dilengkapi dengan fitur keselamatan Toyota Safety Sense 2.5+ dan interior mewah dengan teknologi terkini.',
        specifications: {
          engine: '2.5L 4-Cylinder Hybrid',
          power: '215 HP Combined',
          torque: '221 Nm @ 3,600-5,200 rpm',
          transmission: 'CVT Automatic',
          fuelType: 'Hybrid (Bensin + Listrik)',
          fuelCapacity: '50 Liter',
          seating: 5,
          dimensions: {
            length: 4885,
            width: 1840,
            height: 1455
          },
          features: [
            'Toyota Safety Sense 2.5+',
            'Adaptive Cruise Control',
            'Lane Departure Alert',
            'Pre-Collision System',
            'Automatic High Beam',
            'Wireless Charging Pad',
            'Premium JBL Audio System',
            'Dual Zone Climate Control',
            'Smart Entry & Push Start',
            'LED Headlights & Taillights',
            '9-inch Touchscreen Display',
            'Apple CarPlay & Android Auto'
          ]
        },
        dealer: {
          name: 'Toyota Fatmawati',
          location: 'Jakarta Selatan',
          phone: '021-7501234',
          rating: 4.8
        },
        condition: 'new',
        status: 'available'
      };
      setCar(mockCar);
      setLoading(false);
    }, 1000);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      setShowSuccessModal(true); // Show success modal
      // Reset form
      setBookingForm({
        fullName: '',
        email: '',
        phone: '',
        preferredDate: '',
        preferredTime: '',
        message: '',
        bookingType: 'test-drive'
      });
    }, 2000);
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail mobil...</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Mobil Tidak Ditemukan</h2>
          <p className="text-gray-600">Mobil yang Anda cari tidak tersedia.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                {car.brand} {car.model} {car.year}
              </h1>
              <div className="flex items-center mt-2 space-x-4">
                <Badge variant={car.condition === 'new' ? 'default' : 'secondary'}>
                  <Car className="w-3 h-3 mr-1" />
                  {car.condition === 'new' ? 'Baru' : 'Bekas'}
                </Badge>
                <Badge variant={car.status === 'available' ? 'default' : 'destructive'}>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {car.status === 'available' ? 'Tersedia' : 'Tidak Tersedia'}
                </Badge>
                <div className="flex items-center text-yellow-500">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  <span className="text-sm font-medium">{car.dealer.rating}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(car.price)}
              </div>
              {car.originalPrice && car.originalPrice > car.price && (
                <div className="text-lg text-gray-500 line-through">
                  {formatCurrency(car.originalPrice)}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={car.images[selectedImageIndex]}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-96 object-cover"
                    />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex space-x-2 overflow-x-auto">
                        {car.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                              selectedImageIndex === index ? 'border-primary' : 'border-white'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="w-5 h-5 mr-2" />
                    Deskripsi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{car.description}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Specifications */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Spesifikasi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Engine & Performance */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Zap className="w-4 h-4 mr-2" />
                      Mesin & Performa
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600 flex items-center">
                          <Gauge className="w-4 h-4 mr-1" />
                          Mesin
                        </span>
                        <span className="font-medium">{car.specifications.engine}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Tenaga</span>
                        <span className="font-medium">{car.specifications.power}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Torsi</span>
                        <span className="font-medium">{car.specifications.torque}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Transmisi</span>
                        <span className="font-medium">{car.specifications.transmission}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600 flex items-center">
                          <Fuel className="w-4 h-4 mr-1" />
                          Bahan Bakar
                        </span>
                        <span className="font-medium">{car.specifications.fuelType}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Kapasitas Tangki</span>
                        <span className="font-medium">{car.specifications.fuelCapacity}</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Dimensions */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Dimensi</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Panjang</span>
                        <span className="font-medium">{car.specifications.dimensions.length} mm</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Lebar</span>
                        <span className="font-medium">{car.specifications.dimensions.width} mm</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Tinggi</span>
                        <span className="font-medium">{car.specifications.dimensions.height} mm</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Features */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Fitur
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {car.specifications.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Dealer Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    Informasi Dealer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src="/api/placeholder/64/64" alt={car.dealer.name} />
                      <AvatarFallback>{car.dealer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nama Dealer</span>
                        <span className="font-medium">{car.dealer.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          Lokasi
                        </span>
                        <span className="font-medium">{car.dealer.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          Telepon
                        </span>
                        <span className="font-medium">{car.dealer.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                          <span className="font-medium">{car.dealer.rating}/5.0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <motion.div
              className="sticky top-8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Test / Test Drive
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nama Lengkap</Label>
                      <Input
                        id="fullName"
                        placeholder="Masukkan nama lengkap"
                        value={bookingForm.fullName}
                        onChange={(e) => setBookingForm({...bookingForm, fullName: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Masukkan email"
                        value={bookingForm.email}
                        onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input
                        id="phone"
                        placeholder="Masukkan nomor telepon"
                        value={bookingForm.phone}
                        onChange={(e) => setBookingForm({...bookingForm, phone: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredDate">Tanggal Preferensi</Label>
                      <Input
                        id="preferredDate"
                        type="date"
                        value={bookingForm.preferredDate}
                        onChange={(e) => setBookingForm({...bookingForm, preferredDate: e.target.value})}
                        required
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredTime">Waktu Preferensi</Label>
                      <Select 
                        value={bookingForm.preferredTime} 
                        onValueChange={(value) => setBookingForm({...bookingForm, preferredTime: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih waktu" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2" />
                                {time}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bookingType">Jenis Booking</Label>
                      <Select 
                        value={bookingForm.bookingType} 
                        onValueChange={(value) => setBookingForm({...bookingForm, bookingType: value as 'test-drive' | 'purchase-inquiry'})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="test-drive">
                            <div className="flex items-center">
                              <Car className="w-4 h-4 mr-2" />
                              Test Drive
                            </div>
                          </SelectItem>
                          <SelectItem value="purchase-inquiry">
                            <div className="flex items-center">
                              <CreditCard className="w-4 h-4 mr-2" />
                              Konsultasi Pembelian
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Pesan (Opsional)</Label>
                      <Textarea
                        id="message"
                        placeholder="Tambahkan pesan atau pertanyaan..."
                        value={bookingForm.message}
                        onChange={(e) => setBookingForm({...bookingForm, message: e.target.value})}
                        rows={3}
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={submitting}
                    >
                      {submitting ? 'Memproses...' : 'Kirim Permintaan'}
                    </Button>
                  </form>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Harga</span>
                      <span className="text-2xl font-bold text-primary">{formatCurrency(car.price)}</span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Cicilan mulai dari</span>
                        <span className="font-medium">{formatCurrency(Math.floor(car.price / 60))}/bulan</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DP minimal</span>
                        <span className="font-medium">{formatCurrency(Math.floor(car.price * 0.2))}</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Simulasi Kredit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <DialogTitle className="text-2xl font-bold text-green-600">
                Permintaan Berhasil Dikirim!
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="text-center space-y-4">
            <DialogDescription>
              Terima kasih! Permintaan {bookingForm.bookingType === 'test-drive' ? 'test drive' : 'konsultasi'} Anda telah diterima.
            </DialogDescription>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detail Permintaan:</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-gray-600">
                <div>Mobil: {car.brand} {car.model} {car.year}</div>
                <div>Tanggal: {bookingForm.preferredDate}</div>
                <div>Waktu: {bookingForm.preferredTime}</div>
                <div>Jenis: {bookingForm.bookingType === 'test-drive' ? 'Test Drive' : 'Konsultasi Pembelian'}</div>
              </CardContent>
            </Card>
            <p className="text-sm text-gray-500">
              Tim kami akan menghubungi Anda dalam 1x24 jam untuk konfirmasi jadwal.
            </p>
            <Button onClick={() => setShowSuccessModal(false)} className="w-full">
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HalamanDetailMobil;