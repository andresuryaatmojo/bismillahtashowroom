import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Separator } from '../components/ui/separator';
import { motion } from 'framer-motion';
import { 
  Car, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  CreditCard, 
  CheckCircle, 
  Star,
  ArrowLeft,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

// Interfaces
interface DataMobil {
  id: string;
  merk: string;
  model: string;
  tahun: number;
  warna: string;
  foto: string[];
  harga: number;
  dealer: {
    id: string;
    nama: string;
    alamat: string;
    telepon: string;
    jamOperasional: string;
  };
  tersedia: boolean;
}

interface DataTestDrive {
  id: string;
  mobilId: string;
  mobil: DataMobil;
  tanggal: string;
  waktu: string;
  durasi: number; // dalam menit
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  catatan?: string;
  reminderSent: boolean;
  feedback?: {
    rating: number;
    komentar: string;
    tanggalFeedback: string;
  };
  customer: {
    nama: string;
    email: string;
    telepon: string;
    sim: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface SlotWaktu {
  waktu: string;
  tersedia: boolean;
  durasi: number;
}

interface StatusHalaman {
  view: 'form' | 'calendar' | 'booking-status' | 'feedback' | 'reschedule';
  loading: boolean;
  error: string | null;
  selectedMobil: DataMobil | null;
  selectedDate: string;
  selectedTime: string;
  bookingData: Partial<DataTestDrive>;
  availableSlots: SlotWaktu[];
  currentBooking: DataTestDrive | null;
  feedbackData: {
    rating: number;
    komentar: string;
  };
  rescheduleData: {
    tanggalBaru: string;
    waktuBaru: string;
  };
}

const HalamanTestDrive: React.FC = () => {
  // State management
  const [statusHalaman, setStatusHalaman] = useState<StatusHalaman>({
    view: 'form',
    loading: false,
    error: null,
    selectedMobil: null,
    selectedDate: '',
    selectedTime: '',
    bookingData: {},
    availableSlots: [],
    currentBooking: null,
    feedbackData: {
      rating: 0,
      komentar: ''
    },
    rescheduleData: {
      tanggalBaru: '',
      waktuBaru: ''
    }
  });

  const [daftarMobil, setDaftarMobil] = useState<DataMobil[]>([]);
  const [daftarBooking, setDaftarBooking] = useState<DataTestDrive[]>([]);

  // Methods implementation
  const tampilkanFormTestDrive = () => {
    setStatusHalaman(prev => ({ 
      ...prev, 
      view: 'form',
      error: null,
      selectedMobil: null,
      bookingData: {}
    }));
    
    // Load available cars
    loadAvailableCars();
  };

  const tampilkanKalenderJadwal = () => {
    if (!statusHalaman.selectedMobil) {
      setStatusHalaman(prev => ({ 
        ...prev, 
        error: 'Pilih mobil terlebih dahulu' 
      }));
      return;
    }

    setStatusHalaman(prev => ({ 
      ...prev, 
      view: 'calendar',
      error: null
    }));
    
    // Load available time slots for selected date
    if (statusHalaman.selectedDate) {
      loadAvailableTimeSlots(statusHalaman.selectedDate);
    }
  };

  const konfirmasiBooking = () => {
    if (!statusHalaman.selectedMobil || !statusHalaman.selectedDate || !statusHalaman.selectedTime) {
      setStatusHalaman(prev => ({ 
        ...prev, 
        error: 'Lengkapi semua data booking terlebih dahulu' 
      }));
      return;
    }

    setStatusHalaman(prev => ({ ...prev, loading: true }));
    
    // Simulate API call to confirm booking
    setTimeout(() => {
      const newBooking: DataTestDrive = {
        id: `TD${Date.now()}`,
        mobilId: statusHalaman.selectedMobil!.id,
        mobil: statusHalaman.selectedMobil!,
        tanggal: statusHalaman.selectedDate,
        waktu: statusHalaman.selectedTime,
        durasi: 30, // default 30 minutes
        status: 'confirmed',
        catatan: statusHalaman.bookingData.catatan,
        reminderSent: false,
        customer: {
          nama: statusHalaman.bookingData.customer?.nama || '',
          email: statusHalaman.bookingData.customer?.email || '',
          telepon: statusHalaman.bookingData.customer?.telepon || '',
          sim: statusHalaman.bookingData.customer?.sim || ''
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setDaftarBooking(prev => [...prev, newBooking]);
      setStatusHalaman(prev => ({
        ...prev,
        currentBooking: newBooking,
        view: 'booking-status',
        loading: false
      }));
      
      // Schedule reminder
      scheduleReminder(newBooking);
    }, 2000);
  };

  const tampilkanStatusBooking = () => {
    setStatusHalaman(prev => ({ 
      ...prev, 
      view: 'booking-status',
      error: null
    }));
    
    // Load user's bookings
    loadUserBookings();
  };

  const kirimReminderTestDrive = (bookingId?: string) => {
    const booking = bookingId 
      ? daftarBooking.find(b => b.id === bookingId)
      : statusHalaman.currentBooking;
    
    if (!booking) return;
    
    setStatusHalaman(prev => ({ ...prev, loading: true }));
    
    // Simulate sending reminder
    setTimeout(() => {
      // Update booking reminder status
      setDaftarBooking(prev => 
        prev.map(b => 
          b.id === booking.id 
            ? { ...b, reminderSent: true, updatedAt: new Date().toISOString() }
            : b
        )
      );
      
      setStatusHalaman(prev => ({ 
        ...prev, 
        loading: false,
        currentBooking: prev.currentBooking 
          ? { ...prev.currentBooking, reminderSent: true }
          : null
      }));
      
      alert('Reminder berhasil dikirim!');
    }, 1000);
  };

  const feedbackTestDrive = () => {
    if (!statusHalaman.currentBooking) {
      setStatusHalaman(prev => ({ 
        ...prev, 
        error: 'Tidak ada booking yang dipilih' 
      }));
      return;
    }

    setStatusHalaman(prev => ({ 
      ...prev, 
      view: 'feedback',
      error: null
    }));
  };

  const rescheduleTestDrive = () => {
    if (!statusHalaman.currentBooking) {
      setStatusHalaman(prev => ({ 
        ...prev, 
        error: 'Tidak ada booking yang dipilih' 
      }));
      return;
    }

    setStatusHalaman(prev => ({ 
      ...prev, 
      view: 'reschedule',
      error: null,
      rescheduleData: {
        tanggalBaru: '',
        waktuBaru: ''
      }
    }));
  };

  // Helper functions
  const loadAvailableCars = () => {
    setStatusHalaman(prev => ({ ...prev, loading: true }));
    
    // Simulate API call
    setTimeout(() => {
      const mockCars: DataMobil[] = [
        {
          id: 'CAR001',
          merk: 'Toyota',
          model: 'Camry',
          tahun: 2023,
          warna: 'Putih Mutiara',
          foto: ['camry1.jpg', 'camry2.jpg'],
          harga: 650000000,
          dealer: {
            id: 'DEALER001',
            nama: 'Toyota Fatmawati',
            alamat: 'Jl. RS Fatmawati No. 15, Jakarta Selatan',
            telepon: '021-7501234',
            jamOperasional: '08:00 - 17:00'
          },
          tersedia: true
        },
        {
          id: 'CAR002',
          merk: 'Honda',
          model: 'Civic',
          tahun: 2022,
          warna: 'Hitam',
          foto: ['civic1.jpg'],
          harga: 450000000,
          dealer: {
            id: 'DEALER002',
            nama: 'Honda Kemang',
            alamat: 'Jl. Kemang Raya No. 25, Jakarta Selatan',
            telepon: '021-7192345',
            jamOperasional: '08:00 - 17:00'
          },
          tersedia: true
        },
        {
          id: 'CAR003',
          merk: 'Mazda',
          model: 'CX-5',
          tahun: 2023,
          warna: 'Merah',
          foto: ['cx5.jpg'],
          harga: 580000000,
          dealer: {
            id: 'DEALER003',
            nama: 'Mazda Pondok Indah',
            alamat: 'Jl. Metro Pondok Indah No. 8, Jakarta Selatan',
            telepon: '021-7503456',
            jamOperasional: '08:00 - 17:00'
          },
          tersedia: false
        }
      ];
      
      setDaftarMobil(mockCars);
      setStatusHalaman(prev => ({ ...prev, loading: false }));
    }, 1000);
  };

  const loadAvailableTimeSlots = (date: string) => {
    setStatusHalaman(prev => ({ ...prev, loading: true }));
    
    // Simulate API call to get available time slots
    setTimeout(() => {
      const timeSlots: SlotWaktu[] = [
        { waktu: '09:00', tersedia: true, durasi: 30 },
        { waktu: '09:30', tersedia: false, durasi: 30 },
        { waktu: '10:00', tersedia: true, durasi: 30 },
        { waktu: '10:30', tersedia: true, durasi: 30 },
        { waktu: '11:00', tersedia: false, durasi: 30 },
        { waktu: '11:30', tersedia: true, durasi: 30 },
        { waktu: '13:00', tersedia: true, durasi: 30 },
        { waktu: '13:30', tersedia: true, durasi: 30 },
        { waktu: '14:00', tersedia: false, durasi: 30 },
        { waktu: '14:30', tersedia: true, durasi: 30 },
        { waktu: '15:00', tersedia: true, durasi: 30 },
        { waktu: '15:30', tersedia: true, durasi: 30 },
        { waktu: '16:00', tersedia: false, durasi: 30 },
        { waktu: '16:30', tersedia: true, durasi: 30 }
      ];
      
      setStatusHalaman(prev => ({ 
        ...prev, 
        availableSlots: timeSlots,
        loading: false 
      }));
    }, 800);
  };

  const loadUserBookings = () => {
    setStatusHalaman(prev => ({ ...prev, loading: true }));
    
    // Simulate API call
    setTimeout(() => {
      setStatusHalaman(prev => ({ ...prev, loading: false }));
    }, 1000);
  };

  const scheduleReminder = (booking: DataTestDrive) => {
    // In real app, this would schedule a reminder notification
    console.log(`Reminder scheduled for booking ${booking.id} on ${booking.tanggal} at ${booking.waktu}`);
  };

  const submitFeedback = () => {
    if (!statusHalaman.currentBooking) return;
    
    setStatusHalaman(prev => ({ ...prev, loading: true }));
    
    // Simulate API call
    setTimeout(() => {
      const updatedBooking = {
        ...statusHalaman.currentBooking!,
        feedback: {
          rating: statusHalaman.feedbackData.rating,
          komentar: statusHalaman.feedbackData.komentar,
          tanggalFeedback: new Date().toISOString()
        },
        status: 'completed' as const,
        updatedAt: new Date().toISOString()
      };
      
      setDaftarBooking(prev => 
        prev.map(b => b.id === updatedBooking.id ? updatedBooking : b)
      );
      
      setStatusHalaman(prev => ({
        ...prev,
        currentBooking: updatedBooking,
        view: 'booking-status',
        loading: false
      }));
      
      alert('Feedback berhasil dikirim! Terima kasih atas ulasan Anda.');
    }, 1500);
  };

  const submitReschedule = () => {
    if (!statusHalaman.currentBooking || !statusHalaman.rescheduleData.tanggalBaru || !statusHalaman.rescheduleData.waktuBaru) {
      setStatusHalaman(prev => ({ 
        ...prev, 
        error: 'Pilih tanggal dan waktu baru' 
      }));
      return;
    }
    
    setStatusHalaman(prev => ({ ...prev, loading: true }));
    
    // Simulate API call
    setTimeout(() => {
      const updatedBooking = {
        ...statusHalaman.currentBooking!,
        tanggal: statusHalaman.rescheduleData.tanggalBaru,
        waktu: statusHalaman.rescheduleData.waktuBaru,
        status: 'rescheduled' as const,
        updatedAt: new Date().toISOString()
      };
      
      setDaftarBooking(prev => 
        prev.map(b => b.id === updatedBooking.id ? updatedBooking : b)
      );
      
      setStatusHalaman(prev => ({
        ...prev,
        currentBooking: updatedBooking,
        view: 'booking-status',
        loading: false
      }));
      
      alert('Jadwal test drive berhasil diubah!');
    }, 1500);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMinDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = (): string => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 days from now
    return maxDate.toISOString().split('T')[0];
  };

  // Load initial data
  useEffect(() => {
    tampilkanFormTestDrive();
  }, []);

  // Load time slots when date changes
  useEffect(() => {
    if (statusHalaman.selectedDate && statusHalaman.selectedMobil) {
      loadAvailableTimeSlots(statusHalaman.selectedDate);
    }
  }, [statusHalaman.selectedDate]);

  if (statusHalaman.loading && statusHalaman.view === 'form' && daftarMobil.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data mobil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Form Test Drive */}
      {statusHalaman.view === 'form' && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Drive</h1>
            <p className="text-gray-600">Rasakan pengalaman berkendara mobil impian Anda</p>
          </div>

          {/* Car Selection */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Mobil</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {daftarMobil.map((mobil) => (
                <div
                  key={mobil.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    statusHalaman.selectedMobil?.id === mobil.id
                      ? 'border-blue-500 bg-blue-50'
                      : mobil.tersedia
                      ? 'border-gray-300 hover:border-gray-400'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                  }`}
                  onClick={() => {
                    if (mobil.tersedia) {
                      setStatusHalaman(prev => ({ 
                        ...prev, 
                        selectedMobil: mobil,
                        error: null
                      }));
                    }
                  }}
                >
                  <div className="aspect-video bg-gray-200 rounded-lg mb-3 overflow-hidden">
                    <img
                      src={`/images/${mobil.foto[0]}`}
                      alt={`${mobil.merk} ${mobil.model}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {mobil.merk} {mobil.model} {mobil.tahun}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">Warna: {mobil.warna}</p>
                  <p className="text-sm font-semibold text-blue-600 mb-2">
                    {formatCurrency(mobil.harga)}
                  </p>
                  
                  <div className="text-xs text-gray-500">
                    <p>{mobil.dealer.nama}</p>
                    <p>{mobil.dealer.jamOperasional}</p>
                  </div>
                  
                  {!mobil.tersedia && (
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                        Tidak Tersedia
                      </span>
                    </div>
                  )}
                  
                  {statusHalaman.selectedMobil?.id === mobil.id && (
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        ✓ Dipilih
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Customer Information */}
          {statusHalaman.selectedMobil && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Data Diri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  
                  const customerData = {
                    nama: formData.get('nama') as string,
                    email: formData.get('email') as string,
                    telepon: formData.get('telepon') as string,
                    sim: formData.get('sim') as string
                  };
                  
                  setStatusHalaman(prev => ({
                    ...prev,
                    bookingData: {
                      ...prev.bookingData,
                      customer: customerData,
                      catatan: formData.get('catatan') as string
                    }
                  }));
                  
                  tampilkanKalenderJadwal();
                }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nama">Nama Lengkap *</Label>
                    <Input
                      id="nama"
                      name="nama"
                      type="text"
                      required
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="nama@email.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="telepon">Nomor Telepon *</Label>
                    <Input
                      id="telepon"
                      name="telepon"
                      type="tel"
                      required
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="sim">Nomor SIM *</Label>
                    <Input
                      id="sim"
                      name="sim"
                      type="text"
                      required
                      placeholder="Nomor SIM yang masih berlaku"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="catatan">Catatan (Opsional)</Label>
                    <Textarea
                      id="catatan"
                      name="catatan"
                      rows={3}
                      placeholder="Catatan khusus atau pertanyaan..."
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Button type="submit" className="w-full" size="lg">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Lanjut ke Pilih Jadwal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Calendar View */}
      {statusHalaman.view === 'calendar' && statusHalaman.selectedMobil && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="mb-6">
            <button
              onClick={tampilkanFormTestDrive}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              ← Kembali ke Form
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pilih Jadwal Test Drive</h1>
            <p className="text-gray-600">
              {statusHalaman.selectedMobil.merk} {statusHalaman.selectedMobil.model} - {statusHalaman.selectedMobil.dealer.nama}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Date Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Tanggal</h3>
              <input
                type="date"
                min={getMinDate()}
                max={getMaxDate()}
                value={statusHalaman.selectedDate}
                onChange={(e) => {
                  setStatusHalaman(prev => ({
                    ...prev,
                    selectedDate: e.target.value,
                    selectedTime: '',
                    availableSlots: []
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {statusHalaman.selectedDate && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    📅 {formatDate(statusHalaman.selectedDate)}
                  </p>
                </div>
              )}
            </div>

            {/* Time Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Waktu</h3>
              
              {!statusHalaman.selectedDate ? (
                <p className="text-gray-500 text-center py-8">
                  Pilih tanggal terlebih dahulu
                </p>
              ) : statusHalaman.loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Memuat slot waktu...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {statusHalaman.availableSlots.map((slot) => (
                    <button
                      key={slot.waktu}
                      disabled={!slot.tersedia}
                      onClick={() => {
                        setStatusHalaman(prev => ({
                          ...prev,
                          selectedTime: slot.waktu,
                          error: null
                        }));
                      }}
                      className={`p-3 text-sm rounded-md border transition-all ${
                        statusHalaman.selectedTime === slot.waktu
                          ? 'bg-blue-600 text-white border-blue-600'
                          : slot.tersedia
                          ? 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                          : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      }`}
                    >
                      {slot.waktu}
                      <br />
                      <span className="text-xs">
                        {slot.tersedia ? `${slot.durasi} menit` : 'Tidak tersedia'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              
              {statusHalaman.selectedTime && (
                <div className="mt-4 p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-green-800">
                    ⏰ {statusHalaman.selectedTime} (30 menit)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Summary */}
          {statusHalaman.selectedDate && statusHalaman.selectedTime && (
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Booking</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Detail Mobil</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Mobil:</span> {statusHalaman.selectedMobil.merk} {statusHalaman.selectedMobil.model} {statusHalaman.selectedMobil.tahun}</p>
                    <p><span className="text-gray-600">Warna:</span> {statusHalaman.selectedMobil.warna}</p>
                    <p><span className="text-gray-600">Dealer:</span> {statusHalaman.selectedMobil.dealer.nama}</p>
                    <p><span className="text-gray-600">Alamat:</span> {statusHalaman.selectedMobil.dealer.alamat}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Detail Jadwal</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Tanggal:</span> {formatDate(statusHalaman.selectedDate)}</p>
                    <p><span className="text-gray-600">Waktu:</span> {statusHalaman.selectedTime}</p>
                    <p><span className="text-gray-600">Durasi:</span> 30 menit</p>
                    <p><span className="text-gray-600">Customer:</span> {statusHalaman.bookingData.customer?.nama}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p>📋 Pastikan membawa SIM yang masih berlaku</p>
                    <p>⏰ Harap datang 15 menit sebelum jadwal</p>
                  </div>
                  <button
                    onClick={konfirmasiBooking}
                    disabled={statusHalaman.loading}
                    className="bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 font-semibold disabled:opacity-50"
                  >
                    {statusHalaman.loading ? 'Memproses...' : 'Konfirmasi Booking'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Booking Status */}
      {statusHalaman.view === 'booking-status' && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Status Test Drive</h1>
            <p className="text-gray-600">Kelola jadwal test drive Anda</p>
          </div>

          {/* Current Booking */}
          {statusHalaman.currentBooking && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Booking Terbaru</h3>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(statusHalaman.currentBooking.status)}`}>
                  {statusHalaman.currentBooking.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Detail Booking</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">ID:</span> {statusHalaman.currentBooking.id}</p>
                    <p><span className="text-gray-600">Mobil:</span> {statusHalaman.currentBooking.mobil.merk} {statusHalaman.currentBooking.mobil.model}</p>
                    <p><span className="text-gray-600">Tanggal:</span> {formatDate(statusHalaman.currentBooking.tanggal)}</p>
                    <p><span className="text-gray-600">Waktu:</span> {statusHalaman.currentBooking.waktu}</p>
                    <p><span className="text-gray-600">Durasi:</span> {statusHalaman.currentBooking.durasi} menit</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Dealer</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Nama:</span> {statusHalaman.currentBooking.mobil.dealer.nama}</p>
                    <p><span className="text-gray-600">Alamat:</span> {statusHalaman.currentBooking.mobil.dealer.alamat}</p>
                    <p><span className="text-gray-600">Telepon:</span> {statusHalaman.currentBooking.mobil.dealer.telepon}</p>
                    <p><span className="text-gray-600">Jam Operasional:</span> {statusHalaman.currentBooking.mobil.dealer.jamOperasional}</p>
                  </div>
                </div>
              </div>
              
              {statusHalaman.currentBooking.catatan && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-1">Catatan:</p>
                  <p className="text-sm">{statusHalaman.currentBooking.catatan}</p>
                </div>
              )}
              
              {/* Actions */}
              <div className="mt-6 pt-4 border-t">
                <div className="flex flex-wrap gap-3">
                  {statusHalaman.currentBooking.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => kirimReminderTestDrive()}
                        disabled={statusHalaman.currentBooking.reminderSent || statusHalaman.loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
                      >
                        {statusHalaman.currentBooking.reminderSent ? '✓ Reminder Terkirim' : '📧 Kirim Reminder'}
                      </button>
                      
                      <button
                        onClick={rescheduleTestDrive}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                      >
                        📅 Reschedule
                      </button>
                    </>
                  )}
                  
                  {statusHalaman.currentBooking.status === 'completed' && !statusHalaman.currentBooking.feedback && (
                    <button
                      onClick={feedbackTestDrive}
                      className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm"
                    >
                      ⭐ Beri Feedback
                    </button>
                  )}
                  
                  {statusHalaman.currentBooking.feedback && (
                    <div className="text-sm text-green-600">
                      ✓ Feedback sudah diberikan ({statusHalaman.currentBooking.feedback.rating}/5 ⭐)
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* All Bookings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Test Drive</h3>
            
            {daftarBooking.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-6xl">🚗</span>
                <h4 className="text-xl font-semibold text-gray-900 mt-4">Belum ada test drive</h4>
                <p className="text-gray-600 mt-2">Mulai dengan booking test drive pertama Anda</p>
                <button
                  onClick={tampilkanFormTestDrive}
                  className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Booking Test Drive
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {daftarBooking.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {booking.mobil.merk} {booking.mobil.model} {booking.mobil.tahun}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {formatDate(booking.tanggal)} • {booking.waktu} • {booking.durasi} menit
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>ID: {booking.id}</p>
                      <p>Dealer: {booking.mobil.dealer.nama}</p>
                    </div>
                    
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => setStatusHalaman(prev => ({ ...prev, currentBooking: booking }))}
                        className="px-3 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                      >
                        Detail
                      </button>
                      
                      {booking.status === 'completed' && !booking.feedback && (
                        <button
                          onClick={() => {
                            setStatusHalaman(prev => ({ ...prev, currentBooking: booking }));
                            feedbackTestDrive();
                          }}
                          className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                        >
                          Feedback
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Form */}
      {statusHalaman.view === 'feedback' && statusHalaman.currentBooking && (
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="mb-6">
            <button
              onClick={tampilkanStatusBooking}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              ← Kembali ke Status
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Feedback Test Drive</h1>
            <p className="text-gray-600">
              Bagaimana pengalaman test drive {statusHalaman.currentBooking.mobil.merk} {statusHalaman.currentBooking.mobil.model}?
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={(e) => {
              e.preventDefault();
              submitFeedback();
            }} className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rating Pengalaman *
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStatusHalaman(prev => ({
                        ...prev,
                        feedbackData: { ...prev.feedbackData, rating: star }
                      }))}
                      className={`text-3xl ${
                        statusHalaman.feedbackData.rating >= star 
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                      } hover:text-yellow-400 transition-colors`}
                    >
                      ⭐
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {statusHalaman.feedbackData.rating ? `${statusHalaman.feedbackData.rating}/5` : 'Pilih rating'}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Komentar *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Ceritakan pengalaman test drive Anda..."
                  value={statusHalaman.feedbackData.komentar}
                  onChange={(e) => setStatusHalaman(prev => ({
                    ...prev,
                    feedbackData: { ...prev.feedbackData, komentar: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={tampilkanStatusBooking}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={statusHalaman.loading || !statusHalaman.feedbackData.rating || !statusHalaman.feedbackData.komentar.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {statusHalaman.loading ? 'Mengirim...' : 'Kirim Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Form */}
      {statusHalaman.view === 'reschedule' && statusHalaman.currentBooking && (
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="mb-6">
            <button
              onClick={tampilkanStatusBooking}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              ← Kembali ke Status
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reschedule Test Drive</h1>
            <p className="text-gray-600">
              Ubah jadwal test drive {statusHalaman.currentBooking.mobil.merk} {statusHalaman.currentBooking.mobil.model}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            {/* Current Schedule */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Jadwal Saat Ini</h3>
              <p className="text-sm text-gray-600">
                {formatDate(statusHalaman.currentBooking.tanggal)} • {statusHalaman.currentBooking.waktu}
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              submitReschedule();
            }} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Baru *
                </label>
                <input
                  type="date"
                  required
                  min={getMinDate()}
                  max={getMaxDate()}
                  value={statusHalaman.rescheduleData.tanggalBaru}
                  onChange={(e) => setStatusHalaman(prev => ({
                    ...prev,
                    rescheduleData: { ...prev.rescheduleData, tanggalBaru: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waktu Baru *
                </label>
                <select
                  required
                  value={statusHalaman.rescheduleData.waktuBaru}
                  onChange={(e) => setStatusHalaman(prev => ({
                    ...prev,
                    rescheduleData: { ...prev.rescheduleData, waktuBaru: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih waktu</option>
                  <option value="09:00">09:00</option>
                  <option value="09:30">09:30</option>
                  <option value="10:00">10:00</option>
                  <option value="10:30">10:30</option>
                  <option value="11:00">11:00</option>
                  <option value="11:30">11:30</option>
                  <option value="13:00">13:00</option>
                  <option value="13:30">13:30</option>
                  <option value="14:00">14:00</option>
                  <option value="14:30">14:30</option>
                  <option value="15:00">15:00</option>
                  <option value="15:30">15:30</option>
                  <option value="16:00">16:00</option>
                  <option value="16:30">16:30</option>
                </select>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Perhatian:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Reschedule hanya dapat dilakukan maksimal 24 jam sebelum jadwal</li>
                  <li>• Konfirmasi reschedule akan dikirim via email dan SMS</li>
                  <li>• Pastikan jadwal baru sesuai dengan ketersediaan dealer</li>
                </ul>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={tampilkanStatusBooking}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={statusHalaman.loading || !statusHalaman.rescheduleData.tanggalBaru || !statusHalaman.rescheduleData.waktuBaru}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {statusHalaman.loading ? 'Memproses...' : 'Konfirmasi Reschedule'}
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
              <div className="mt-2">
                <button
                  onClick={() => setStatusHalaman(prev => ({ ...prev, error: null }))}
                  className="text-xs text-red-600 hover:text-red-500"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {statusHalaman.loading && statusHalaman.view !== 'form' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memproses...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalamanTestDrive;