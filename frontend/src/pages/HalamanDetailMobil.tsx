import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Car, Phone, MapPin, Star, Calendar, Clock, CheckCircle, 
  Fuel, Gauge, Settings, Zap, Shield, Award, CreditCard, ArrowLeft, Loader2,
  Camera, KeyRound, Power, Bluetooth, Usb, Fan, Wifi, Sun, Monitor, Radar
} from 'lucide-react';
import { carService } from '../services/carService';
import { testDriveService } from '../services/testDriveService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [car, setCar] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    fullName: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    message: '',
    bookingType: 'test-drive'
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCarData();
    loadUser();
  }, [id]);

  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setCurrentUser(data.user);
      // Pre-fill form if user logged in
      const { data: userData } = await supabase
        .from('users')
        .select('full_name, email, phone_number')
        .eq('auth_user_id', data.user.id)
        .single();
      
      if (userData) {
        setBookingForm(prev => ({
          ...prev,
          fullName: userData.full_name || '',
          email: userData.email || '',
          phone: userData.phone_number || ''
        }));
      }
    }
  };

  const loadCarData = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const carData = await carService.getCarById(id);
      
      if (!carData) {
        setError('Mobil tidak ditemukan');
        return;
      }
      
      setCar(carData);
    } catch (err) {
      console.error('Error loading car:', err);
      setError('Gagal memuat data mobil');
    } finally {
      setLoading(false);
    }
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
    
    if (!currentUser) {
      alert('Silakan login terlebih dahulu untuk booking test drive');
      navigate('/login');
      return;
    }

    if (!id) return;

    setSubmitting(true);
    
    try {
      console.log('Submitting test drive request...');
      
      // Create test drive request - pass currentUser.id (auth user ID)
      const result = await testDriveService.createTestDrive(currentUser.id, {
        car_id: id,
        scheduled_date: bookingForm.preferredDate,
        scheduled_time: bookingForm.preferredTime,
        user_notes: bookingForm.message,
        location: 'Showroom'
      });

      console.log('Test drive result:', result);

      if (result.success) {
        setShowSuccessModal(true);
        // Reset form
        setBookingForm(prev => ({
          ...prev,
          preferredDate: '',
          preferredTime: '',
          message: ''
        }));
      } else {
        alert(result.error || 'Gagal membuat permintaan test drive');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Terjadi kesalahan saat memproses permintaan');
    } finally {
      setSubmitting(false);
    }
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Map fuel types
  const getFuelTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      gasoline: 'Bensin',
      diesel: 'Diesel',
      electric: 'Listrik',
      hybrid: 'Hybrid',
      phev: 'PHEV'
    };
    return labels[type] || type;
  };

  // Map transmission types
  const getTransmissionLabel = (type: string) => {
    const labels: Record<string, string> = {
      manual: 'Manual',
      automatic: 'Otomatis',
      cvt: 'CVT',
      dct: 'DCT',
      amt: 'AMT'
    };
    return labels[type] || type;
  };

  // Helper baru untuk tampilan detail
  const formatDateID = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };
  const yesNo = (val?: boolean) => (val ? 'Ya' : 'Tidak');
  const registrationLabel = (type?: string) =>
    type === 'perorangan' ? 'Perorangan' : type === 'perusahaan' ? 'Perusahaan' : (type || '-');
  const seatLabel = (n?: number) => (typeof n === 'number' ? (n >= 7 ? '7 atau lebih' : `${n} Kursi`) : '-');

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat detail mobil...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !car) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Mobil Tidak Ditemukan'}
          </h2>
          <p className="text-gray-600 mb-6">Mobil yang Anda cari tidak tersedia.</p>
          <Button onClick={() => navigate('/katalog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Katalog
          </Button>
        </div>
      </div>
    );
  }

  const primaryImage = car.car_images?.find((img: any) => img.is_primary) || car.car_images?.[0];
  // Gunakan fallback ke `car.specifications` untuk kompatibilitas data lama
  const specs = car.car_specifications || car.specifications || {};
  
  // Check if specifications exist and have any features
  const hasSpecs = specs && (
    specs.has_abs || specs.has_ebd || specs.has_parking_sensor || 
    specs.has_parking_camera || specs.has_ac || specs.has_power_steering ||
    specs.has_power_window || specs.has_central_lock || specs.has_cruise_control ||
    specs.has_keyless_entry || specs.has_push_start || specs.has_sunroof ||
    specs.has_audio_system || specs.has_touchscreen || specs.has_bluetooth ||
    specs.has_usb_port || specs.has_rear_ac || specs.has_wireless_charging ||
    specs.has_led_drl || specs.has_modern_head_unit || specs.doors || 
    specs.seats || specs.airbags
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button - Positioned to the left */}
        <div className="flex justify-start mb-4 space-x-2">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 hover:bg-gray-100"
            onClick={() => navigate('/katalog')}
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Katalog
          </Button>
          
          {/* Admin-only button to return to car management */}
          {user?.role === 'admin' && (
            <Button 
              variant="outline" 
              className="flex items-center gap-2 hover:bg-blue-50 border-blue-200 text-blue-600"
              onClick={() => navigate('/admin/mobil-showroom')}
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Mobil Showroom
            </Button>
          )}
        </div>

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
                {car.title}
              </h1>
              <p className="text-lg text-gray-600 mt-1">{car.car_categories?.name} • {car.location_city}</p>
              <div className="flex items-center mt-2 space-x-4">
                <Badge variant={car.condition === 'new' ? 'default' : 'secondary'}>
                  <Car className="w-3 h-3 mr-1" />
                  {car.condition === 'new' ? 'Baru' : 'Bekas'}
                </Badge>
                <Badge variant={car.status === 'available' ? 'default' : 'destructive'}>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {car.status === 'available' ? 'Tersedia' : 'Tidak Tersedia'}
                </Badge>
                {car.is_verified && (
                  <Badge className="bg-emerald-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Terverifikasi
                  </Badge>
                )}
                <div className="flex items-center text-yellow-500">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  <span className="text-sm font-medium">{car.average_rating?.toFixed(1) || '0.0'}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(car.price)}
              </div>
              {car.market_price && car.market_price > car.price && (
                <div className="text-lg text-gray-500 line-through">
                  {formatCurrency(car.market_price)}
                </div>
              )}
              {car.is_negotiable && (
                <Badge variant="outline" className="mt-2">Harga Nego</Badge>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
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
                      src={car.car_images[selectedImageIndex]?.image_url || 'https://via.placeholder.com/800x600'}
                      alt={car.title}
                      className="w-full h-96 object-cover"
                    />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex space-x-2 overflow-x-auto">
                        {car.car_images.map((image: any, index: number) => (
                          <button
                            key={image.id}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                              selectedImageIndex === index ? 'border-blue-600' : 'border-white'
                            }`}
                          >
                            <img
                              src={image.image_url}
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
                  <p className="text-gray-600 leading-relaxed">
                    {car.description || 'Tidak ada deskripsi tersedia.'}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Gauge className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <div className="font-bold">{car.mileage?.toLocaleString('id-ID') || 0} km</div>
                      <div className="text-sm text-gray-600">Kilometer</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Settings className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <div className="font-bold">{getTransmissionLabel(car.transmission)}</div>
                      <div className="text-sm text-gray-600">Transmisi</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Fuel className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <div className="font-bold">{getFuelTypeLabel(car.fuel_type)}</div>
                      <div className="text-sm text-gray-600">Bahan Bakar</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Zap className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <div className="font-bold">{car.engine_capacity || 0} cc</div>
                      <div className="text-sm text-gray-600">Mesin</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Detail Mobil */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="w-5 h-5 mr-2" />
                    Detail Mobil
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Kolom kiri */}
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Jenis Bahan Bakar</span>
                        <span className="font-medium">{getFuelTypeLabel(car.fuel_type)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Jumlah Tempat Duduk</span>
                        <span className="font-medium">{seatLabel(car.seat_capacity)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Tipe Registrasi</span>
                        <span className="font-medium">{registrationLabel(car.registration_type)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Kunci Cadangan</span>
                        <span className="font-medium">{yesNo(car.has_spare_key)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Garansi Pabrik</span>
                        <span className="font-medium">{yesNo(car.has_warranty)}</span>
                      </div>
                    </div>

                    {/* Kolom kanan */}
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Warna</span>
                        <span className="font-medium">{car.color || '-'}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Tanggal Registrasi</span>
                        <span className="font-medium">{formatDateID(car.registration_date)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Jarak Tempuh Saat Ini</span>
                        <span className="font-medium">{car.mileage?.toLocaleString('id-ID') || 0} km</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Service Record</span>
                        <span className="font-medium">{yesNo(car.has_service_record)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">Masa Berlaku STNK</span>
                        <span className="font-medium">{formatDateID(car.stnk_expiry_date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Baris tambahan: Transmisi & Kapasitas Mesin */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Transmisi</span>
                      <span className="font-medium">{getTransmissionLabel(car.transmission)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Kapasitas Mesin</span>
                      <span className="font-medium">{car.engine_capacity || 0} cc</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Fitur Mobil */}
            {(() => {
              const features = [
                { key: 'has_airbags', label: 'Airbag', icon: <Shield className="w-8 h-8 text-blue-600" /> },
                { key: 'has_abs', label: 'ABS', icon: <CheckCircle className="w-8 h-8 text-blue-600" /> },
                { key: 'has_parking_sensor', label: 'Sensor Parkir', icon: <Radar className="w-8 h-8 text-blue-600" /> },
                { key: 'has_parking_camera', label: 'Kamera Mundur', icon: <Camera className="w-8 h-8 text-blue-600" /> },
                { key: 'has_cruise_control', label: 'Cruise Control', icon: <Gauge className="w-8 h-8 text-blue-600" /> },
                { key: 'has_keyless_entry', label: 'Keyless Entry', icon: <KeyRound className="w-8 h-8 text-blue-600" /> },
                { key: 'has_push_start', label: 'Push Start Button', icon: <Power className="w-8 h-8 text-blue-600" /> },
                { key: 'has_sunroof', label: 'Sunroof', icon: <Sun className="w-8 h-8 text-blue-600" /> },
                { key: 'has_bluetooth', label: 'Bluetooth', icon: <Bluetooth className="w-8 h-8 text-blue-600" /> },
                { key: 'has_usb_port', label: 'USB Port', icon: <Usb className="w-8 h-8 text-blue-600" /> },
                { key: 'has_rear_ac', label: 'AC Belakang', icon: <Fan className="w-8 h-8 text-blue-600" /> },
                { key: 'has_wireless_charging', label: 'Wireless Charging', icon: <Wifi className="w-8 h-8 text-blue-600" /> },
                { key: 'has_led_drl', label: 'LED Daytime Running Lights', icon: <Sun className="w-8 h-8 text-blue-600" /> },
                { key: 'has_modern_head_unit', label: 'Head Unit Modern', icon: <Monitor className="w-8 h-8 text-blue-600" /> },
              ];
              const active = features.filter(f => Boolean((specs as any)?.[f.key]));
              return active.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.38 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Settings className="w-5 h-5 mr-2" />
                        Fitur
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 mb-4">
                        Fitur bervariasi berdasarkan model dan varian mobil. Berikut fitur yang tersedia pada mobil ini.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {active.map((f) => (
                          <div key={f.key} className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-center mb-2">{f.icon}</div>
                            <div className="font-medium">{f.label}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : null;
            })()}

            {/* Specifications */}
            {hasSpecs && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="w-5 h-5 mr-2" />
                      Spesifikasi Detail
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      {specs.doors && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Pintu</span>
                          <span className="font-medium">{specs.doors}</span>
                        </div>
                      )}
                      {specs.seats && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Tempat Duduk</span>
                          <span className="font-medium">{specs.seats}</span>
                        </div>
                      )}
                      {specs.airbags && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Airbags</span>
                          <span className="font-medium">{specs.airbags}</span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Safety Features */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Fitur Keselamatan
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {specs.has_abs && (
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm">ABS</span>
                          </div>
                        )}
                        {specs.has_ebd && (
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm">EBD</span>
                          </div>
                        )}
                        {specs.has_esc && (
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm">ESC</span>
                          </div>
                        )}
                        {specs.has_parking_sensor && (
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm">Parking Sensor</span>
                          </div>
                        )}
                        {specs.has_parking_camera && (
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm">Parking Camera</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Comfort Features */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Fitur Kenyamanan</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {specs.has_ac && (
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm">AC</span>
                          </div>
                        )}
                        {specs.has_power_steering && (
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm">Power Steering</span>
                          </div>
                        )}
                        {specs.has_power_window && (
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm">Power Window</span>
                          </div>
                        )}
                        {specs.has_central_lock && (
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm">Central Lock</span>
                          </div>
                        )}
                        {specs.has_keyless_entry && (
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm">Keyless Entry</span>
                          </div>
                        )}
                        {specs.has_push_start && (
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm">Push Start</span>
                          </div>
                        )}
                        {specs.has_sunroof && (
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-sm">Sunroof</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

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
                    Informasi Penjual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarFallback>{car.users.full_name?.charAt(0) || 'S'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nama</span>
                        <span className="font-medium">{car.users.full_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipe</span>
                        <span className="font-medium">
                          {car.seller_type === 'showroom' ? 'Showroom' : 'Penjual Eksternal'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          Lokasi
                        </span>
                        <span className="font-medium">{car.location_city}</span>
                      </div>
                      {car.users.phone_number && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            Telepon
                          </span>
                          <span className="font-medium">{car.users.phone_number}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                          <span className="font-medium">{car.users.seller_rating?.toFixed(1) || '0.0'}/5.0</span>
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
                    Booking Test Drive
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
                        required
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
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
                      disabled={submitting || car.status !== 'available'}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        'Kirim Permintaan'
                      )}
                    </Button>
                  </form>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Harga</span>
                      <span className="text-2xl font-bold text-blue-600">{formatCurrency(car.price)}</span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Cicilan mulai dari</span>
                        <span className="font-medium">{formatCurrency(Math.floor(car.price / 60))}/bulan</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DP minimal (20%)</span>
                        <span className="font-medium">{formatCurrency(Math.floor(car.price * 0.2))}</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={() => alert('Fitur simulasi kredit segera hadir!')}
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
              Terima kasih! Permintaan test drive Anda telah diterima.
            </DialogDescription>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Detail Permintaan:</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-gray-600">
                <div>Mobil: {car.car_brands.name} {car.car_models.name} {car.year}</div>
                <div>Tanggal: {bookingForm.preferredDate}</div>
                <div>Waktu: {bookingForm.preferredTime}</div>
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