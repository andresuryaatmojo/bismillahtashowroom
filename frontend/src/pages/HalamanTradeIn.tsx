import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
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
  AlertCircle,
  Camera,
  X,
  Upload,
  FileText,
  DollarSign,
  Settings,
  Wrench,
  Gauge,
  Palette,
  Send
} from 'lucide-react';

import {
  TradeInRequestWithRelations,
  TradeInFormData,
  TradeInService,
  validateTradeInForm
} from '../services/LayananTradeIn';
import { fetchAvailableCars } from '../services/cars';
import { CarOption } from '../types/cars';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const HalamanTradeIn: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // States
  const [cars, setCars] = useState<CarOption[]>([]);
  const [userTradeIns, setUserTradeIns] = useState<TradeInRequestWithRelations[]>([]);
  const [selectedCar, setSelectedCar] = useState<CarOption | null>(null);
  const [carSearch, setCarSearch] = useState('');
  const [filteredCars, setFilteredCars] = useState<CarOption[]>([]);
  const [formData, setFormData] = useState<Partial<TradeInFormData>>({
    old_car_brand: '',
    old_car_model: '',
    old_car_year: new Date().getFullYear(),
    old_car_mileage: undefined,
    old_car_color: '',
    old_car_transmission: '',
    old_car_fuel_type: '',
    old_car_condition: '',
    old_car_plate_number: '',
    old_car_description: '',
    estimated_value: undefined,
    inspection_date: '',
    inspection_time: '',
    inspection_location: '',
    user_notes: '',
    images: []
  });

  // Refs to prevent race conditions
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSubmittingRef = useRef(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loadingCars, setLoadingCars] = useState(false);
  const [loadingTradeIns, setLoadingTradeIns] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submittedTradeIn, setSubmittedTradeIn] = useState<TradeInRequestWithRelations | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');

  // Load data
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        loadCars();
        if (user) {
          loadUserTradeIns();
        }
      }
    };

    loadData();

    // Cleanup function
    return () => {
      isMounted = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [user]);

  // Debounced search for cars
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(() => {
      if (carSearch) {
        const filtered = cars.filter(car =>
          car.title.toLowerCase().includes(carSearch.toLowerCase()) ||
          car.display_name?.toLowerCase().includes(carSearch.toLowerCase()) ||
          car.location_city?.toLowerCase().includes(carSearch.toLowerCase())
        );
        setFilteredCars(filtered);
      } else {
        setFilteredCars(cars);
      }
    }, 300); // 300ms debounce

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [carSearch, cars]);

  const loadCars = async () => {
    try {
      setLoadingCars(true);
      console.log('Fetching showroom cars for trade-in from Supabase...');

      const data = await fetchAvailableCars(50);
      console.log('Fetched showroom cars from database:', data);

      data.forEach((car, index) => {
        console.log(`Showroom Car ${index + 1}:`, car.title, 'ID:', car.id, 'Price:', car.price);
      });

      setCars(data);
    } catch (error) {
      console.error('Error loading showroom cars:', error);
      setCars([]); // Set empty array to prevent UI issues
    } finally {
      setLoadingCars(false);
    }
  };

  const loadUserTradeIns = async () => {
    if (!user) return;

    setLoadingTradeIns(true);
    try {
      const { data, error } = await TradeInService.getUserTradeInRequests(user.id);
      if (error) {
        console.error('Error loading user trade-ins:', error);
      } else {
        setUserTradeIns(data);
      }
    } catch (error) {
      console.error('Error loading user trade-ins:', error);
    } finally {
      setLoadingTradeIns(false);
    }
  };

  const handleInputChange = (field: keyof TradeInFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setFormErrors([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));

    if (validFiles.length !== files.length) {
      setFormErrors(['Hanya file gambar yang diperbolehkan']);
      return;
    }

    const newImages = [...uploadedImages, ...validFiles];
    const newPreviews = [...imagePreviews];

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });

    setUploadedImages(newImages);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    setUploadedImages(newImages);
    setImagePreviews(newPreviews);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmittingRef.current || submitting) {
      console.log('Submission already in progress, preventing duplicate');
      return;
    }

    if (!user) {
      setFormErrors(['Anda harus login terlebih dahulu']);
      return;
    }

    if (!selectedCar) {
      setFormErrors(['Pilih mobil baru yang diinginkan']);
      return;
    }

    // Debug car selection
    console.log('Selected Car:', selectedCar);
    console.log('Selected Car ID:', selectedCar?.id);
    console.log('Selected Car ID type:', typeof selectedCar?.id);

    // Ensure we have a valid UUID
    const carId = selectedCar?.id;
    if (!carId || typeof carId !== 'string' || carId.length < 10) {
      console.error('Invalid car ID detected:', carId);
      setFormErrors(['Mobil yang dipilih tidak valid. Silakan pilih mobil kembali.']);
      return;
    }

    const completeFormData: TradeInFormData = {
      ...formData,
      new_car_id: carId,
      images: uploadedImages
    } as TradeInFormData;

    console.log('Form Data for submission:', completeFormData);
    console.log('Final Car ID to submit:', carId);

    const validation = validateTradeInForm(completeFormData);
    if (!validation.isValid) {
      console.log('Validation errors:', validation.errors);
      setFormErrors(validation.errors);
      return;
    }

    // Set submission flag
    isSubmittingRef.current = true;
    setSubmitting(true);

    try {
      const { data, error } = await TradeInService.createTradeInRequest(completeFormData, user.id);

      if (error) {
        console.error('Trade-in submission error:', error);
        const errorMessage = error.message || 'Terjadi kesalahan saat mengirim permintaan';
        setFormErrors([errorMessage]);
      } else if (data) {
        setSubmittedTradeIn(data as any);
        setShowSuccessDialog(true);

        // Reset form
        setFormData({
          old_car_brand: '',
          old_car_model: '',
          old_car_year: new Date().getFullYear(),
          old_car_mileage: undefined,
          old_car_color: '',
          old_car_transmission: '',
          old_car_fuel_type: '',
          old_car_condition: '',
          old_car_plate_number: '',
          old_car_description: '',
          estimated_value: undefined,
          inspection_date: '',
          inspection_time: '',
          inspection_location: '',
          user_notes: '',
          images: []
        });
        setUploadedImages([]);
        setImagePreviews([]);
        setSelectedCar(null);
        setCarSearch('');

        // Reload trade-in history
        await loadUserTradeIns();
      }
    } catch (error) {
      console.error('Unexpected error during submission:', error);
      setFormErrors(['Terjadi kesalahan saat mengirim permintaan']);
    } finally {
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Menunggu', variant: 'secondary' as const },
      inspecting: { label: 'Inspeksi', variant: 'default' as const },
      appraised: { label: 'Dinilai', variant: 'default' as const },
      approved: { label: 'Disetujui', variant: 'default' as const },
      rejected: { label: 'Ditolak', variant: 'destructive' as const },
      completed: { label: 'Selesai', variant: 'default' as const },
      cancelled: { label: 'Dibatalkan', variant: 'secondary' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Program Trade-In</h1>
              <p className="text-gray-600">Tukar mobil lama Anda dengan mobil baru yang lebih baik</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('form')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'form'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Form Trade-In
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Riwayat Trade-In ({userTradeIns.length})
              </button>
            </nav>
          </div>
        </motion.div>

        {activeTab === 'form' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Form Pengajuan Trade-In
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {formErrors.length > 0 && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <ul className="list-disc list-inside">
                          {formErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Mobil Baru Pilihan */}
                    <div>
                      <Label className="text-base font-medium mb-2 block">Mobil Baru Pilihan (Showroom Only)</Label>
                      <p className="text-sm text-gray-600 mb-4">Hanya mobil dari showroom yang tersedia untuk program trade-in</p>
                      {selectedCar ? (
                        <div className="border rounded-lg p-4 bg-blue-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-blue-900">{selectedCar.display_name || selectedCar.title}</h4>
                              <p className="text-blue-700">Rp {selectedCar.price.toLocaleString('id-ID')}</p>
                              <p className="text-blue-600 text-sm">{selectedCar.location_city}</p>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCar(null)}
                            >
                              Ubah
                            </Button>
                          </div>
                        </div>
                      ) : loadingCars ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <p className="ml-3 text-gray-600">Memuat mobil showroom...</p>
                        </div>
                      ) : cars.length === 0 ? (
                        <div className="text-center py-8">
                          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak Ada Mobil Showroom Tersedia</h3>
                          <p className="text-gray-600">Belum ada mobil dari showroom yang tersedia untuk trade-in saat ini. Mobil eksternal tidak dapat digunakan untuk program trade-in.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Search Input */}
                          <div className="relative">
                            <Input
                              type="text"
                              placeholder="Cari mobil showroom berdasarkan nama atau lokasi..."
                              value={carSearch}
                              onChange={(e) => setCarSearch(e.target.value)}
                              className="w-full"
                            />
                            {carSearch && (
                              <button
                                type="button"
                                onClick={() => setCarSearch('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          {/* Dropdown */}
                          <Select onValueChange={(carId) => {
                            const car = filteredCars.find(c => c.id === carId);
                            if (car) {
                              console.log('Car selected:', car);
                              console.log('Car ID:', car.id);
                              setSelectedCar(car);
                              setCarSearch(''); // Clear search after selection
                            }
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih mobil showroom..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 overflow-y-auto">
                              {filteredCars.length === 0 ? (
                                <div className="p-2 text-center text-gray-500">
                                  Tidak ada mobil yang cocok dengan pencarian
                                </div>
                              ) : (
                                filteredCars.map((car) => (
                                  <SelectItem key={car.id} value={car.id}>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{car.display_name || car.title}</span>
                                      <span className="text-sm text-gray-500">
                                        Rp {car.price.toLocaleString('id-ID')} - {car.location_city}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>

                          {/* Results count */}
                          {carSearch && (
                            <p className="text-sm text-gray-500">
                              Menampilkan {filteredCars.length} mobil showroom dari {cars.length} total
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Data Mobil Lama */}
                    <div>
                      <Label className="text-base font-medium mb-4 block">Data Mobil Lama</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="brand">Merek Mobil</Label>
                          <Input
                            id="brand"
                            value={formData.old_car_brand || ''}
                            onChange={(e) => handleInputChange('old_car_brand', e.target.value)}
                            placeholder="Contoh: Toyota"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="model">Model Mobil</Label>
                          <Input
                            id="model"
                            value={formData.old_car_model || ''}
                            onChange={(e) => handleInputChange('old_car_model', e.target.value)}
                            placeholder="Contoh: Avanza"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="year">Tahun</Label>
                          <Input
                            id="year"
                            type="number"
                            value={formData.old_car_year || ''}
                            onChange={(e) => handleInputChange('old_car_year', parseInt(e.target.value))}
                            min="1900"
                            max={new Date().getFullYear() + 1}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="mileage">Jarak Tempuh (km)</Label>
                          <Input
                            id="mileage"
                            type="number"
                            value={formData.old_car_mileage || ''}
                            onChange={(e) => handleInputChange('old_car_mileage', parseInt(e.target.value))}
                            placeholder="Contoh: 50000"
                            min="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="color">Warna</Label>
                          <Input
                            id="color"
                            value={formData.old_car_color || ''}
                            onChange={(e) => handleInputChange('old_car_color', e.target.value)}
                            placeholder="Contoh: Hitam"
                          />
                        </div>
                        <div>
                          <Label htmlFor="plate">Nomor Polisi</Label>
                          <Input
                            id="plate"
                            value={formData.old_car_plate_number || ''}
                            onChange={(e) => handleInputChange('old_car_plate_number', e.target.value)}
                            placeholder="Contoh: B 1234 ABC"
                          />
                        </div>
                        <div>
                          <Label htmlFor="transmission">Transmisi</Label>
                          <Select
                            value={formData.old_car_transmission || ''}
                            onValueChange={(value) => handleInputChange('old_car_transmission', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih transmisi" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manual">Manual</SelectItem>
                              <SelectItem value="automatic">Automatic</SelectItem>
                              <SelectItem value="cvt">CVT</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="fuel">Bahan Bakar</Label>
                          <Select
                            value={formData.old_car_fuel_type || ''}
                            onValueChange={(value) => handleInputChange('old_car_fuel_type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih bahan bakar" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gasoline">Bensin</SelectItem>
                              <SelectItem value="diesel">Diesel</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                              <SelectItem value="electric">Listrik</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="condition">Kondisi</Label>
                          <Select
                            value={formData.old_car_condition || ''}
                            onValueChange={(value) => handleInputChange('old_car_condition', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih kondisi" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="excellent">Sangat Baik</SelectItem>
                              <SelectItem value="good">Baik</SelectItem>
                              <SelectItem value="fair">Cukup</SelectItem>
                              <SelectItem value="poor">Kurang</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="estimatedValue">Estimasi Harga (Rp)</Label>
                          <Input
                            id="estimatedValue"
                            type="number"
                            value={formData.estimated_value || ''}
                            onChange={(e) => handleInputChange('estimated_value', parseInt(e.target.value))}
                            placeholder="Contoh: 150000000"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Deskripsi */}
                    <div>
                      <Label htmlFor="description">Deskripsi Mobil</Label>
                      <Textarea
                        id="description"
                        value={formData.old_car_description || ''}
                        onChange={(e) => handleInputChange('old_car_description', e.target.value)}
                        placeholder="Jelaskan kondisi mobil, fitur, dll."
                        rows={4}
                      />
                    </div>

                    {/* Jadwal Inspeksi */}
                    <div>
                      <Label className="text-base font-medium mb-4 block">Jadwal Inspeksi</Label>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <h4 className="font-medium text-blue-900">Inspeksi di Showroom</h4>
                            <p className="text-sm text-blue-700">
                              Proses inspeksi mobil lama akan dilakukan di lokasi showroom kami untuk memastikan penilaian yang akurat dan profesional.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="inspectionDate">Tanggal Inspeksi*</Label>
                          <Input
                            id="inspectionDate"
                            type="date"
                            value={formData.inspection_date || ''}
                            onChange={(e) => handleInputChange('inspection_date', e.target.value)}
                            required
                            min={new Date().toISOString().split('T')[0]}
                            max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <Label htmlFor="inspectionTime">Waktu Inspeksi*</Label>
                          <Input
                            id="inspectionTime"
                            type="time"
                            value={formData.inspection_time || ''}
                            onChange={(e) => handleInputChange('inspection_time', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="mt-3">
                        <Label className="text-sm text-gray-600 mb-2 block">Lokasi Showroom:</Label>
                        <div className="border rounded-lg p-3 bg-gray-50">
                          <p className="font-medium text-gray-900">
                            Showroom Mobilindo
                          </p>
                          <p className="text-sm text-gray-600">
                           Jl. Leuwi Panjang 113-123, Situsaeur, Kec. Bojongloa Kidul, Kota Bandung<br />
                            (Senin - Sabtu, 09:00 - 18:00)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Catatan Tambahan */}
                    <div>
                      <Label htmlFor="notes">Catatan Tambahan</Label>
                      <Textarea
                        id="notes"
                        value={formData.user_notes || ''}
                        onChange={(e) => handleInputChange('user_notes', e.target.value)}
                        placeholder="Ada hal lain yang ingin Anda sampaikan?"
                        rows={3}
                      />
                    </div>

                    {/* Upload Gambar */}
                    <div>
                      <Label className="text-base font-medium mb-4 block">Upload Foto Mobil</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <div className="text-center">
                          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="image-upload"
                              className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500"
                            >
                              <span>Upload files</span>
                              <input
                                id="image-upload"
                                type="file"
                                className="sr-only"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                              />
                            </label>
                            <p className="pl-1">atau drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>

                        {imagePreviews.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={preview}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/')}
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Mengirim...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Ajukan Trade-In
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Panduan Trade-In
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Syarat Mudah</h4>
                      <p className="text-sm text-gray-600">Mobil lama Anda akan dinilai oleh tim profesional kami di showroom</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Proses Cepat</h4>
                      <p className="text-sm text-gray-600">Estimasi nilai dalam 1-2 hari kerja setelah inspeksi</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Harga Terbaik</h4>
                      <p className="text-sm text-gray-600">Dapatkan penawaran terbaik untuk mobil lama Anda</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Process Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>Proses Trade-In</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</div>
                      <div>
                        <h4 className="font-medium">Ajukan Permintaan</h4>
                        <p className="text-sm text-gray-600">Isi form dan upload foto mobil</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                      <div>
                        <h4 className="font-medium">Inspeksi di Showroom</h4>
                        <p className="text-sm text-gray-600">Bawa mobil lama ke showroom untuk inspeksi profesional</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">3</div>
                      <div>
                        <h4 className="font-medium">Negosiasi & Persetujuan</h4>
                        <p className="text-sm text-gray-600">Diskusikan harga yang sesuai</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">4</div>
                      <div>
                        <h4 className="font-medium">Tukar Mobil</h4>
                        <p className="text-sm text-gray-600">Serahkan mobil lama, bawa mobil baru</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Trade-In Anda</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingTradeIns ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : userTradeIns.length === 0 ? (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Riwayat Trade-In</h3>
                    <p className="text-gray-600 mb-4">Anda belum pernah mengajukan trade-in sebelumnya</p>
                    <Button onClick={() => setActiveTab('form')}>
                      Ajukan Trade-In Pertama
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userTradeIns.map((tradeIn) => (
                      <div key={tradeIn.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{tradeIn.old_car_brand} {tradeIn.old_car_model} ({tradeIn.old_car_year})</h4>
                            <p className="text-sm text-gray-600">
                              Tukar dengan: {tradeIn.new_car?.title || 'Mobil Baru'}
                            </p>
                          </div>
                          {getStatusBadge(tradeIn.status)}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Estimasi Nilai:</span>
                            <p className="font-medium">
                              {tradeIn.estimated_value
                                ? `Rp ${tradeIn.estimated_value.toLocaleString('id-ID')}`
                                : 'Dinilai'
                              }
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <p className="font-medium">{getStatusBadge(tradeIn.status)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Tanggal:</span>
                            <p className="font-medium">
                              {new Date(tradeIn.created_at).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">ID:</span>
                            <p className="font-medium text-xs">#{tradeIn.id.substring(0, 8)}</p>
                          </div>
                        </div>

                        {tradeIn.images && tradeIn.images.length > 0 && (
                          <div className="mt-4">
                            <div className="flex gap-2">
                              {tradeIn.images.slice(0, 3).map((image) => (
                                <img
                                  key={image.id}
                                  src={image.image_url}
                                  alt="Trade-in image"
                                  className="w-16 h-16 object-cover rounded"
                                />
                              ))}
                              {tradeIn.images.length > 3 && (
                                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-600">
                                  +{tradeIn.images.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Pengajuan Berhasil!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Permintaan trade-in Anda telah berhasil dikirim. Silakan datang ke showroom sesuai jadwal yang Anda pilih untuk proses inspeksi mobil lama Anda.
              </p>
              {submittedTradeIn && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>ID Pengajuan:</strong> #{submittedTradeIn.id.substring(0, 8)}
                  </p>
                  <p className="text-sm text-blue-900">
                    <strong>Status:</strong> Menunggu Verifikasi
                  </p>
                </div>
              )}
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSuccessDialog(false)}
                >
                  Tutup
                </Button>
                <Button onClick={() => setActiveTab('history')}>
                  Lihat Riwayat
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default HalamanTradeIn;