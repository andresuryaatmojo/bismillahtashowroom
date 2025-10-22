import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { carService } from '../services/carService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, Save, X, Upload, Car,
  Calendar, MapPin, DollarSign, CheckCircle, Loader2, AlertCircle, 
  ArrowLeft, Image as ImageIcon, XCircle
} from 'lucide-react';

interface CarFormData {
  title: string;
  brand_id?: number;
  model_id?: number;
  category_id?: number;
  year: number;
  price: number;
  is_negotiable: boolean;
  market_price?: number;
  condition: 'new' | 'used' | 'excellent' | 'good' | 'fair';
  color: string;
  mileage: number;
  transmission: 'manual' | 'automatic' | 'cvt' | 'dct' | 'amt';
  fuel_type: 'gasoline' | 'diesel' | 'electric' | 'hybrid' | 'phev';
  engine_capacity: number;
  description?: string;
  location_city: string;
  location_province?: string;
  status: 'pending' | 'available' | 'sold' | 'reserved' | 'rejected';
  seller_type: 'showroom' | 'external';
  is_verified: boolean;
  is_featured: boolean;
  // TAMBAHAN BARU
  vin_number?: string;
  seat_capacity?: number;
  registration_type?: 'perorangan' | 'perusahaan';
  registration_date?: string;
  has_spare_key: boolean;
  has_warranty: boolean;
  has_service_record: boolean;
  stnk_expiry_date?: string;
  // SPESIFIKASI
  specifications?: {
    has_airbags: boolean;
    has_abs: boolean;
    has_parking_sensor: boolean;
    has_parking_camera: boolean;
    has_cruise_control: boolean;
    has_keyless_entry: boolean;
    has_push_start: boolean;
    has_sunroof: boolean;
    has_bluetooth: boolean;
    has_usb_port: boolean;
    has_rear_ac: boolean;
    has_wireless_charging: boolean;
    has_led_drl: boolean;
    has_modern_head_unit: boolean;
  };
}

const HalamanKelolaMobil: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Master data
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Image upload
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    condition: '',
    year_min: '',
    year_max: '',
    price_min: '',
    price_max: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCars, setTotalCars] = useState(0);
  const itemsPerPage = 20;

  // Form state
  const [formData, setFormData] = useState<CarFormData>({
    title: '',
    year: new Date().getFullYear(),
    price: 0,
    is_negotiable: true,
    condition: 'used',
    color: '',
    mileage: 0,
    transmission: 'manual',
    fuel_type: 'gasoline',
    engine_capacity: 0,
    description: '',
    location_city: '',
    location_province: '',
    status: 'available',
    seller_type: 'showroom',
    is_verified: false,
    is_featured: false,
    // TAMBAHAN BARU
    vin_number: '',
    seat_capacity: 5,
    registration_type: 'perorangan',
    registration_date: '',
    has_spare_key: false,
    has_warranty: false,
    has_service_record: false,
    stnk_expiry_date: '',
    specifications: {
      has_airbags: false,
      has_abs: false,
      has_parking_sensor: false,
      has_parking_camera: false,
      has_cruise_control: false,
      has_keyless_entry: false,
      has_push_start: false,
      has_sunroof: false,
      has_bluetooth: false,
      has_usb_port: false,
      has_rear_ac: false,
      has_wireless_charging: false,
      has_led_drl: false,
      has_modern_head_unit: false,
    }
  });

  // Statistics
  const [statistics, setStatistics] = useState({
    total: 0,
    available: 0,
    sold: 0,
    pending: 0,
    featured: 0
  });

  // Load master data
  useEffect(() => {
    const loadMasterData = async () => {
      const [brandsData, categoriesData] = await Promise.all([
        carService.getBrands(),
        carService.getCategories()
      ]);
      setBrands(brandsData);
      setCategories(categoriesData);
    };
    loadMasterData();
  }, []);

  // Load models when brand selected
  useEffect(() => {
    const loadModels = async () => {
      if (formData.brand_id) {
        const modelsData = await carService.getModelsByBrand(formData.brand_id);
        setModels(modelsData);
      } else {
        setModels([]);
      }
    };
    loadModels();
  }, [formData.brand_id]);

  // Load cars
  const loadCars = async () => {
    try {
      setLoading(true);
      setError(null);

      // TAMBAHKAN ini: force seller_type = 'showroom'
      const filterParams = {
        ...filters,
        seller_type: 'showroom'  // ← TAMBAHAN INI
      };

      const result = await carService.getAllCarsAdmin(filterParams, currentPage, itemsPerPage);
      
      setCars(result.data);
      setTotalCars(result.total);
      setTotalPages(result.total_pages);

      // Calculate statistics from all data
      const statsResult = await carService.getAllCarsAdmin({ seller_type: 'showroom' }, 1, 10000); // ← TAMBAHAN seller_type
      const allCars = statsResult.data;
      
      const stats = {
        total: allCars.length,
        available: allCars.filter((car: any) => car.status === 'available').length,
        sold: allCars.filter((car: any) => car.status === 'sold').length,
        pending: allCars.filter((car: any) => car.status === 'pending').length,
        featured: allCars.filter((car: any) => car.is_featured).length
      };
      setStatistics(stats);

    } catch (err: any) {
      console.error('Error loading cars:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadCars();
    }
  }, [user, currentPage, filters]);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Create preview URLs
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      
      setSelectedImages(prev => [...prev, ...files]);
      setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  // Remove selected image
  const removeSelectedImage = (index: number) => {
    // Revoke object URL to prevent memory leak
    URL.revokeObjectURL(imagePreviewUrls[index]);
    
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Upload images
  const uploadImages = async (carId: string) => {
    setUploadingImages(true);
    try {
      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i];
        
        // Upload to storage
        const uploadResult = await carService.uploadCarImage(file, carId);
        if (!uploadResult.success || !uploadResult.url) {
          console.error('Failed to upload image:', uploadResult.error);
          continue;
        }

        // Save to database
        await carService.saveCarImageToDb(
          carId, 
          uploadResult.url, 
          i === 0, // First image is primary
          i
        );
      }
    } catch (err) {
      console.error('Error uploading images:', err);
      throw err;
    } finally {
      setUploadingImages(false);
      
      // Clean up preview URLs
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setSelectedImages([]);
      setImagePreviewUrls([]);
    }
  };

  // Save car
  const saveCar = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      if (!user) throw new Error('User not authenticated');

      // Validate required fields
      if (!formData.title || !formData.brand_id || !formData.model_id || !formData.category_id) {
        setError('Mohon lengkapi semua field yang wajib diisi (Merek, Model, Kategori, Judul)');
        return;
      }

      if (!formData.location_city) {
        setError('Lokasi kota wajib diisi');
        return;
      }

      const carData = {
        ...formData,
        seller_id: user.id
      };

      let carId = selectedCar?.id;

      if (isEditMode && selectedCar) {
        // Update existing car
        const result = await carService.updateCar(selectedCar.id, carData);
        if (!result.success) {
          throw new Error(result.error || 'Gagal update mobil');
        }
        // Simpan/Update spesifikasi ke tabel car_specifications
        if (formData.specifications && carId) {
          await carService.updateCarSpecifications(carId, formData.specifications);
        }
      } else {
        // Create new car
        const result = await carService.createCar(carData);
        if (!result.success) {
          throw new Error(result.error || 'Gagal create mobil');
        }
        carId = result.data.id;

        // Buat record spesifikasi
        if (formData.specifications && carId) {
          await carService.createCarSpecifications(carId, formData.specifications);
        }
      }

      // Upload images if any
      if (selectedImages.length > 0 && carId) {
        await uploadImages(carId);
      }

      await loadCars();
      resetForm();
      setShowModal(false);
      
      // Success message
      const message = isEditMode ? 'Mobil berhasil diupdate!' : 'Mobil berhasil ditambahkan!';
      alert(message);

    } catch (err: any) {
      console.error('Error saving car:', err);
      setError(err.message || 'Terjadi kesalahan saat menyimpan mobil');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete car
  const deleteCar = async (carId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus mobil ini? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      setLoading(true);
      const result = await carService.deleteCar(carId);
      
      if (!result.success) {
        throw new Error(result.error || 'Gagal menghapus mobil');
      }

      await loadCars();
      alert('Mobil berhasil dihapus!');
    } catch (err: any) {
      console.error('Error deleting car:', err);
      alert(err.message || 'Gagal menghapus mobil');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      year: new Date().getFullYear(),
      price: 0,
      is_negotiable: true,
      condition: 'used',
      color: '',
      mileage: 0,
      transmission: 'manual',
      fuel_type: 'gasoline',
      engine_capacity: 0,
      description: '',
      location_city: '',
      location_province: '',
      status: 'available',
      seller_type: 'showroom',
      is_verified: false,
      is_featured: false,
      // TAMBAHAN BARU
      vin_number: '',
      seat_capacity: 5,
      registration_type: 'perorangan',
      registration_date: '',
      has_spare_key: false,
      has_warranty: false,
      has_service_record: false,
      stnk_expiry_date: '',
      specifications: {
        has_airbags: false,
        has_abs: false,
        has_parking_sensor: false,
        has_parking_camera: false,
        has_cruise_control: false,
        has_keyless_entry: false,
        has_push_start: false,
        has_sunroof: false,
        has_bluetooth: false,
        has_usb_port: false,
        has_rear_ac: false,
        has_wireless_charging: false,
        has_led_drl: false,
        has_modern_head_unit: false,
      }
    });
    setSelectedCar(null);
    setIsEditMode(false);
    
    // Clean up image previews
    imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setSelectedImages([]);
    setImagePreviewUrls([]);
    setError(null);
  };

  // Handle edit
  const handleEdit = (car: any) => {
    setSelectedCar(car);
    setFormData({
      title: car.title,
      brand_id: car.brand_id,
      model_id: car.model_id,
      category_id: car.category_id,
      year: car.year,
      price: car.price,
      is_negotiable: car.is_negotiable,
      market_price: car.market_price,
      condition: car.condition,
      color: car.color,
      mileage: car.mileage,
      transmission: car.transmission,
      fuel_type: car.fuel_type,
      engine_capacity: car.engine_capacity,
      description: car.description || '',
      location_city: car.location_city,
      location_province: car.location_province || '',
      status: car.status,
      seller_type: car.seller_type,
      is_verified: car.is_verified,
      is_featured: car.is_featured,
      // TAMBAHAN BARU
      vin_number: car.vin_number || '',
      seat_capacity: car.seat_capacity || 5,
      registration_type: car.registration_type || 'perorangan',
      registration_date: car.registration_date || '',
      has_spare_key: car.has_spare_key ?? false,
      has_warranty: car.has_warranty ?? false,
      has_service_record: car.has_service_record ?? false,
      stnk_expiry_date: car.stnk_expiry_date || '',
      specifications: car.specifications || {
        has_airbags: false,
        has_abs: false,
        has_parking_sensor: false,
        has_parking_camera: false,
        has_cruise_control: false,
        has_keyless_entry: false,
        has_push_start: false,
        has_sunroof: false,
        has_bluetooth: false,
        has_usb_port: false,
        has_rear_ac: false,
        has_wireless_charging: false,
        has_led_drl: false,
        has_modern_head_unit: false,
      }
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  // Handle add new
  const handleAddNew = () => {
    resetForm();
    setIsEditMode(false);
    setShowModal(true);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'sold': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reserved': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600 mb-4">Anda tidak memiliki akses ke halaman ini.</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Car className="w-8 h-8 mr-3 text-blue-600" />
                Kelola Mobil
              </h1>
              <p className="text-gray-600 mt-1">Manajemen inventori mobil showroom</p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={() => navigate('/admin')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Mobil
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
                </div>
                <Car className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tersedia</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.available}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Terjual</p>
                  <p className="text-2xl font-bold text-red-600">{statistics.sold}</p>
                </div>
                <DollarSign className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
                </div>
                <Calendar className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Featured</p>
                  <p className="text-2xl font-bold text-purple-600">{statistics.featured}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filter & Pencarian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Pencarian</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Cari mobil..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={filters.status || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="available">Tersedia</SelectItem>
                    <SelectItem value="sold">Terjual</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Kondisi</Label>
                <Select value={filters.condition || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, condition: value === 'all' ? '' : value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="new">Baru</SelectItem>
                    <SelectItem value="excellent">Sangat Baik</SelectItem>
                    <SelectItem value="good">Baik</SelectItem>
                    <SelectItem value="fair">Cukup</SelectItem>
                    <SelectItem value="used">Bekas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                variant="outline"
                onClick={() => setFilters({
                  search: '', status: '', condition: '', year_min: '', year_max: '', price_min: '', price_max: ''
                })}
              >
                Reset Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center text-red-800">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cars Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Daftar Mobil ({totalCars})</CardTitle>
              <div className="text-sm text-gray-600">
                Halaman {currentPage} dari {totalPages}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-2" />
                <span className="text-gray-600">Memuat data...</span>
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-12">
                <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">Tidak ada mobil ditemukan</p>
                <p className="text-gray-500 text-sm">Coba ubah filter atau tambah mobil baru</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Mobil</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Harga</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Kondisi</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Lokasi</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cars.map((car) => (
                        <motion.tr
                          key={car.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                {car.car_images && car.car_images.length > 0 ? (
                                  <img
                                    src={car.car_images.find((img: any) => img.is_primary)?.image_url || car.car_images[0]?.image_url}
                                    alt={car.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <div className={`flex items-center justify-center w-full h-full ${car.car_images && car.car_images.length > 0 ? 'hidden' : ''}`}>
                                  <Car className="w-6 h-6 text-gray-500" />
                                </div>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{car.title}</p>
                                <p className="text-sm text-gray-600">{car.year}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  {car.is_featured && (
                                    <Badge variant="secondary" className="text-xs">Featured</Badge>
                                  )}
                                  {car.is_verified && (
                                    <Badge variant="outline" className="text-xs">Verified</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-medium text-gray-900">{formatCurrency(car.price)}</p>
                            {car.is_negotiable && (
                              <p className="text-xs text-gray-500">Nego</p>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getStatusBadgeColor(car.status)}>
                              {car.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600 capitalize">{car.condition}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-1" />
                              {car.location_city}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex justify-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/mobil/${car.id}`)}
                                title="Lihat Detail"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(car)}
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteCar(car.id)}
                                title="Hapus"
                                className="text-red-600 hover:text-red-700 hover:border-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6">
                    <div className="text-sm text-gray-600">
                      Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalCars)} dari {totalCars} mobil
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Sebelumnya
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8">
            <div className="p-6 border-b sticky top-0 bg-white z-10 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? 'Edit Mobil' : 'Tambah Mobil Baru'}
                </h2>
                <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-6">
              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-5 mb-6">
                  <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
                  <TabsTrigger value="specs">Spesifikasi</TabsTrigger>
                  <TabsTrigger value="details">Detail & Fitur</TabsTrigger>
                  <TabsTrigger value="images">Gambar</TabsTrigger>
                  <TabsTrigger value="settings">Pengaturan</TabsTrigger>
                </TabsList>

                {/* Tab: Basic Information */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="brand_id">Merek *</Label>
                      <Select 
                        value={formData.brand_id?.toString()} 
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          brand_id: parseInt(value), 
                          model_id: undefined 
                        }))}
                      >
                        <SelectTrigger id="brand_id">
                          <SelectValue placeholder="Pilih merek" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map(b => (
                            <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="model_id">Model *</Label>
                      <Select 
                        value={formData.model_id?.toString()} 
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          model_id: parseInt(value) 
                        }))}
                        disabled={!formData.brand_id}
                      >
                        <SelectTrigger id="model_id">
                          <SelectValue placeholder="Pilih model" />
                        </SelectTrigger>
                        <SelectContent>
                          {models.map(m => (
                            <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!formData.brand_id && (
                        <p className="text-xs text-gray-500 mt-1">Pilih merek terlebih dahulu</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="category_id">Kategori *</Label>
                      <Select 
                        value={formData.category_id?.toString()} 
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          category_id: parseInt(value) 
                        }))}
                      >
                        <SelectTrigger id="category_id">
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="title">Judul Iklan *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Contoh: Toyota Avanza 1.3 G MT 2023"
                      />
                    </div>

                    <div>
                      <Label htmlFor="year">Tahun *</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                      />
                    </div>

                    <div>
                      <Label htmlFor="price">Harga (Rp) *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        placeholder="150000000"
                      />
                    </div>

                    <div>
                      <Label htmlFor="color">Warna *</Label>
                      <Input
                        id="color"
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        placeholder="Putih"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location_city">Kota *</Label>
                      <Input
                        id="location_city"
                        value={formData.location_city}
                        onChange={(e) => setFormData(prev => ({ ...prev, location_city: e.target.value }))}
                        placeholder="Jakarta"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location_province">Provinsi</Label>
                      <Input
                        id="location_province"
                        value={formData.location_province}
                        onChange={(e) => setFormData(prev => ({ ...prev, location_province: e.target.value }))}
                        placeholder="DKI Jakarta"
                      />
                    </div>

                    <div>
                      <Label htmlFor="market_price">Harga Pasar (Opsional)</Label>
                      <Input
                        id="market_price"
                        type="number"
                        value={formData.market_price || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, market_price: parseFloat(e.target.value) || undefined }))}
                        placeholder="160000000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Deskripsi lengkap kondisi mobil, fitur, kelengkapan, dll..."
                      rows={4}
                    />
                  </div>
                </TabsContent>

                {/* Tab: Specifications */}
                <TabsContent value="specs" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="condition">Kondisi *</Label>
                      <Select 
                        value={formData.condition} 
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, condition: value }))}
                      >
                        <SelectTrigger id="condition">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Baru</SelectItem>
                          <SelectItem value="excellent">Sangat Baik</SelectItem>
                          <SelectItem value="good">Baik</SelectItem>
                          <SelectItem value="fair">Cukup</SelectItem>
                          <SelectItem value="used">Bekas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="mileage">Kilometer</Label>
                      <Input
                        id="mileage"
                        type="number"
                        value={formData.mileage}
                        onChange={(e) => setFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) || 0 }))}
                        placeholder="50000"
                      />
                    </div>

                    <div>
                      <Label htmlFor="transmission">Transmisi *</Label>
                      <Select 
                        value={formData.transmission} 
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, transmission: value }))}
                      >
                        <SelectTrigger id="transmission">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="automatic">Automatic</SelectItem>
                          <SelectItem value="cvt">CVT</SelectItem>
                          <SelectItem value="dct">DCT</SelectItem>
                          <SelectItem value="amt">AMT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="fuel_type">Bahan Bakar *</Label>
                      <Select 
                        value={formData.fuel_type} 
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, fuel_type: value }))}
                      >
                        <SelectTrigger id="fuel_type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gasoline">Bensin</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="electric">Listrik</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                          <SelectItem value="phev">PHEV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="engine_capacity">Kapasitas Mesin (CC)</Label>
                      <Input
                        id="engine_capacity"
                        type="number"
                        value={formData.engine_capacity}
                        onChange={(e) => setFormData(prev => ({ ...prev, engine_capacity: parseInt(e.target.value) || 0 }))}
                        placeholder="1300"
                      />
                    </div>
                  </div>
                </TabsContent>



                {/* Tab: Details & Fitur */}
                <TabsContent value="details" className="space-y-6">
                  {/* Detail Mobil */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Detail Mobil</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="vin_number">Nomor Rangka/VIN</Label>
                        <Input
                          id="vin_number"
                          value={formData.vin_number || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, vin_number: e.target.value }))}
                          placeholder="Contoh: MHKA1BA1J0K123456"
                          maxLength={17}
                        />
                      </div>

                      <div>
                        <Label htmlFor="seat_capacity">Jumlah Tempat Duduk *</Label>
                        <Select
                          value={formData.seat_capacity?.toString() || '5'}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, seat_capacity: parseInt(value) }))}
                        >
                          <SelectTrigger id="seat_capacity">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 Kursi</SelectItem>
                            <SelectItem value="4">4 Kursi</SelectItem>
                            <SelectItem value="5">5 Kursi</SelectItem>
                            <SelectItem value="6">6 Kursi</SelectItem>
                            <SelectItem value="7">7 Kursi</SelectItem>
                            <SelectItem value="8">8 Kursi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="registration_type">Tipe Registrasi *</Label>
                        <Select
                          value={formData.registration_type || 'perorangan'}
                          onValueChange={(value: any) => setFormData(prev => ({ ...prev, registration_type: value }))}
                        >
                          <SelectTrigger id="registration_type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="perorangan">Perorangan</SelectItem>
                            <SelectItem value="perusahaan">Perusahaan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="registration_date">Tanggal Registrasi</Label>
                        <Input
                          id="registration_date"
                          type="date"
                          value={formData.registration_date || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, registration_date: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="stnk_expiry_date">Masa Berlaku STNK</Label>
                        <Input
                          id="stnk_expiry_date"
                          type="date"
                          value={formData.stnk_expiry_date || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, stnk_expiry_date: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="has_spare_key"
                          checked={formData.has_spare_key}
                          onChange={(e) => setFormData(prev => ({ ...prev, has_spare_key: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <Label htmlFor="has_spare_key" className="cursor-pointer">
                          Ada Kunci Cadangan
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="has_warranty"
                          checked={formData.has_warranty}
                          onChange={(e) => setFormData(prev => ({ ...prev, has_warranty: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <Label htmlFor="has_warranty" className="cursor-pointer">
                          Ada Garansi Pabrik
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="has_service_record"
                          checked={formData.has_service_record}
                          onChange={(e) => setFormData(prev => ({ ...prev, has_service_record: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <Label htmlFor="has_service_record" className="cursor-pointer">
                          Ada Service Record
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Fitur Mobil */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Fitur Mobil</h3>

                    {/* Safety Features */}
                    <div className="mb-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Keselamatan</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="has_airbags"
                            checked={formData.specifications?.has_airbags || false}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              specifications: { ...prev.specifications!, has_airbags: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <Label htmlFor="has_airbags" className="cursor-pointer">Airbag</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="has_abs"
                            checked={formData.specifications?.has_abs || false}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              specifications: { ...prev.specifications!, has_abs: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <Label htmlFor="has_abs" className="cursor-pointer">ABS</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="has_parking_sensor"
                            checked={formData.specifications?.has_parking_sensor || false}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              specifications: { ...prev.specifications!, has_parking_sensor: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <Label htmlFor="has_parking_sensor" className="cursor-pointer">Sensor Parkir</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="has_parking_camera"
                            checked={formData.specifications?.has_parking_camera || false}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              specifications: { ...prev.specifications!, has_parking_camera: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <Label htmlFor="has_parking_camera" className="cursor-pointer">Kamera Mundur</Label>
                        </div>
                      </div>
                    </div>

                    {/* Comfort Features */}
                    <div className="mb-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">Kenyamanan</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="has_cruise_control"
                            checked={formData.specifications?.has_cruise_control || false}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              specifications: { ...prev.specifications!, has_cruise_control: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <Label htmlFor="has_cruise_control" className="cursor-pointer">Cruise Control</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="has_keyless_entry"
                            checked={formData.specifications?.has_keyless_entry || false}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              specifications: { ...prev.specifications!, has_keyless_entry: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <Label htmlFor="has_keyless_entry" className="cursor-pointer">Keyless Entry</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="has_push_start"
                            checked={formData.specifications?.has_push_start || false}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              specifications: { ...prev.specifications!, has_push_start: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <Label htmlFor="has_push_start" className="cursor-pointer">Push Start Button</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="has_sunroof"
                            checked={formData.specifications?.has_sunroof || false}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              specifications: { ...prev.specifications!, has_sunroof: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <Label htmlFor="has_sunroof" className="cursor-pointer">Sunroof</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="has_rear_ac"
                            checked={formData.specifications?.has_rear_ac || false}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              specifications: { ...prev.specifications!, has_rear_ac: e.target.checked }
                            }))}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <Label htmlFor="has_rear_ac" className="cursor-pointer">AC Belakang</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Images */}
                <TabsContent value="images" className="space-y-4">
                  <div>
                    <Label htmlFor="image_upload">Upload Gambar Mobil</Label>
                    <div className="mt-2">
                      <label 
                        htmlFor="image_upload" 
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, WEBP hingga 5MB</p>
                        </div>
                        <input
                          id="image_upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleImageSelect}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Image Previews */}
                  {imagePreviewUrls.length > 0 && (
                    <div>
                      <Label>Preview Gambar yang Dipilih ({imagePreviewUrls.length})</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                        {imagePreviewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeSelectedImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                            {index === 0 && (
                              <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                Gambar Utama
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isEditMode && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Mode Edit</p>
                          <p>Gambar yang di-upload akan ditambahkan ke gambar yang sudah ada. Untuk mengganti gambar lama, hapus terlebih dahulu di halaman detail mobil.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Tab: Settings */}
                <TabsContent value="settings" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status * (Admin Only)</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending (Menunggu Review)</SelectItem>
                          <SelectItem value="available">Available (Approved)</SelectItem>
                          <SelectItem value="sold">Terjual</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="rejected">Ditolak</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        Ubah ke "Available" untuk menyetujui iklan
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="seller_type">Tipe Penjual</Label>
                      <Select 
                        value={formData.seller_type} 
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, seller_type: value }))}
                      >
                        <SelectTrigger id="seller_type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="showroom">Showroom</SelectItem>
                          <SelectItem value="external">External</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_negotiable"
                        checked={formData.is_negotiable}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_negotiable: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <Label htmlFor="is_negotiable" className="cursor-pointer">
                        Harga bisa dinegosiasi
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_verified"
                        checked={formData.is_verified}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_verified: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <Label htmlFor="is_verified" className="cursor-pointer">
                        Mobil terverifikasi (sudah dicek tim)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_featured"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <Label htmlFor="is_featured" className="cursor-pointer">
                        Tampilkan sebagai mobil unggulan (featured)
                      </Label>
                    </div>
                  </div>

                  {isEditMode && selectedCar?.status === 'pending' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium mb-1">Iklan Menunggu Approval</p>
                          <p>Ubah status menjadi "Available" untuk menyetujui dan menampilkan iklan ini di katalog.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <Separator className="my-6" />

              {/* Form Actions */}
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="text-red-500">*</span> Wajib diisi
                </div>
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowModal(false)}
                    disabled={submitting || uploadingImages}
                  >
                    Batal
                  </Button>
                  <Button 
                    onClick={saveCar} 
                    disabled={submitting || uploadingImages}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {(submitting || uploadingImages) ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {uploadingImages ? 'Mengupload gambar...' : 'Menyimpan...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {isEditMode ? 'Update Mobil' : 'Simpan Mobil'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HalamanKelolaMobil;