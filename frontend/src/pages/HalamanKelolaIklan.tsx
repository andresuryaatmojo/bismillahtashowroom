import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { carService } from '../services/carService';
import listingService, { type ListingPackage } from '../services/listingService';
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
  ArrowLeft, Image as ImageIcon, XCircle, RefreshCw, Package, 
  TrendingUp, BarChart3, Heart, Phone, Crown, Zap
} from 'lucide-react';

// Form interfaces (sama seperti admin)
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
  seller_type: 'showroom' | 'external';
}

const HalamanKelolaIklan: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSellerMode, setIsSellerMode] = useState(false);
  
  // Package selection
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [packages, setPackages] = useState<ListingPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<ListingPackage | null>(null);
  const [newCarId, setNewCarId] = useState<string | null>(null);
  
  // Payment
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [uploadingPayment, setUploadingPayment] = useState(false);
  
  // Master data
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Image upload
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  // Statistics
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    pending: 0,
    sold: 0,
    total_views: 0,
    total_contacts: 0,
    total_wishlists: 0,
    with_package: 0,
    free_listings: 0
  });

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
    seller_type: 'external'
  });

  // Check seller mode
  useEffect(() => {
    const checkMode = async () => {
      if (user) {
        const sellerMode = await listingService.checkSellerMode(user.id);
        setIsSellerMode(sellerMode);
      }
    };
    checkMode();
  }, [user]);

  // Load master data
  useEffect(() => {
    const loadMasterData = async () => {
      const [brandsData, categoriesData, packagesData] = await Promise.all([
        carService.getBrands(),
        carService.getCategories(),
        listingService.getPackages()
      ]);
      setBrands(brandsData);
      setCategories(categoriesData);
      setPackages(packagesData);
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

  // Load seller's cars (tampilkan SEMUA status)
  const loadCars = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      // Get semua mobil seller (pending, available, sold, dll)
      const { data: carsData, error: carsError } = await supabase
        .from('cars')
        .select(`
          *,
          car_brands (id, name, logo_url),
          car_models (id, name),
          car_categories (id, name, slug),
          car_images (id, image_url, is_primary, display_order),
          listing_packages (
            id, name, slug, price, duration_days, 
            is_featured, allows_refresh, refresh_count, badge_text
          )
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (carsError) throw carsError;

      // Get statistics
      const stats = await listingService.getSellerStatistics(user.id);
      
      setCars(carsData || []);
      setStatistics(stats);

    } catch (err: any) {
      console.error('Error loading cars:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isSellerMode) {
      loadCars();
    }
  }, [user, isSellerMode]);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      
      setSelectedImages(prev => [...prev, ...files]);
      setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  // Remove selected image
  const removeSelectedImage = (index: number) => {
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
        const uploadResult = await carService.uploadCarImage(file, carId);
        
        if (!uploadResult.success || !uploadResult.url) {
          console.error('Failed to upload image:', uploadResult.error);
          continue;
        }

        await carService.saveCarImageToDb(carId, uploadResult.url, i === 0, i);
      }
    } catch (err) {
      console.error('Error uploading images:', err);
      throw err;
    } finally {
      setUploadingImages(false);
      imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setSelectedImages([]);
      setImagePreviewUrls([]);
    }
  };

  // Save car (Step 1: Create car)
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
        seller_id: user.id,
        status: 'pending' as const // Akan dimoderasi admin
      };

      let carId: string;

      if (isEditMode && selectedCar) {
        // Update existing car
        const result = await carService.updateCar(selectedCar.id, carData);
        if (!result.success) {
          throw new Error(result.error || 'Gagal update mobil');
        }
        carId = selectedCar.id;
        
        await loadCars();
        resetForm();
        setShowModal(false);
        alert('Mobil berhasil diupdate! Menunggu approval admin.');
        
      } else {
        // Create new car
        const result = await carService.createCar(carData);
        if (!result.success) {
          throw new Error(result.error || 'Gagal create mobil');
        }
        carId = result.data.id;
        setNewCarId(carId);

        // Upload images first
        if (selectedImages.length > 0) {
          await uploadImages(carId);
        }

        // Then show package selection
        setShowModal(false);
        setShowPackageModal(true);
      }

    } catch (err: any) {
      console.error('Error saving car:', err);
      setError(err.message || 'Terjadi kesalahan saat menyimpan mobil');
    } finally {
      setSubmitting(false);
    }
  };

  // Select package and create payment
  const selectPackage = async (pkg: ListingPackage) => {
    if (!newCarId || !user) return;

    try {
      setSubmitting(true);
      setSelectedPackage(pkg);

      // Create payment record
      const result = await listingService.createListingPayment(
        newCarId,
        pkg.id,
        user.id,
        'bank_transfer'
      );

      if (!result.success) {
        throw new Error(result.error || 'Gagal membuat payment');
      }

      // If free package, done!
      if (pkg.price === 0) {
        setShowPackageModal(false);
        await loadCars();
        alert('Mobil berhasil ditambahkan dengan paket gratis! Menunggu approval admin.');
        resetForm();
      } else {
        // Show payment upload modal
        setPaymentId(result.data.id);
        setShowPackageModal(false);
        setShowPaymentModal(true);
      }

    } catch (err: any) {
      console.error('Error selecting package:', err);
      alert(err.message || 'Gagal memilih paket');
    } finally {
      setSubmitting(false);
    }
  };

  // Upload payment proof
  const uploadPaymentProof = async () => {
    if (!paymentId || !paymentProof || !user) return;

    try {
      setUploadingPayment(true);

      const result = await listingService.uploadPaymentProof(paymentId, paymentProof, user.id);

      if (!result.success) {
        throw new Error(result.error || 'Gagal upload bukti bayar');
      }

      setShowPaymentModal(false);
      await loadCars();
      alert('Bukti pembayaran berhasil diupload! Menunggu verifikasi admin.');
      resetForm();

    } catch (err: any) {
      console.error('Error uploading payment:', err);
      alert(err.message || 'Gagal upload bukti pembayaran');
    } finally {
      setUploadingPayment(false);
    }
  };

  // Refresh listing
  const handleRefreshListing = async (carId: string) => {
    if (!window.confirm('Yakin ingin refresh iklan ini? Quota refresh akan berkurang.')) return;

    try {
      const result = await listingService.refreshListing(carId);
      
      if (!result.success) {
        alert(result.message);
        return;
      }

      alert(result.message);
      await loadCars();

    } catch (err: any) {
      console.error('Error refreshing listing:', err);
      alert('Gagal refresh iklan');
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
      seller_type: 'external'
    });
    setSelectedCar(null);
    setIsEditMode(false);
    setNewCarId(null);
    setSelectedPackage(null);
    setPaymentId(null);
    setPaymentProof(null);
    
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
      seller_type: car.seller_type
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Silakan Login</h2>
          <p className="text-gray-600 mb-4">Anda harus login untuk mengakses halaman ini.</p>
          <Button onClick={() => navigate('/login')} variant="outline">
            Login Sekarang
          </Button>
        </div>
      </div>
    );
  }

  // Check seller mode
  if (!isSellerMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Mode Seller Belum Aktif</h2>
            <p className="text-gray-600 mb-6">
              Untuk dapat mengelola iklan mobil, Anda perlu mengaktifkan mode Seller terlebih dahulu di halaman profil.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/profil')} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Aktifkan Mode Seller
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali ke Beranda
              </Button>
            </div>
          </CardContent>
        </Card>
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
                Kelola Iklan Mobil
              </h1>
              <p className="text-gray-600 mt-1">Posting dan kelola iklan jual mobil Anda</p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={() => navigate('/')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Beranda
              </Button>
              <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Pasang Iklan
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Iklan</p>
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
                  <p className="text-sm font-medium text-gray-600">Aktif</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.active}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
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
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-purple-600">{statistics.total_views}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

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

        {/* Cars List */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Iklan Saya ({cars.length})</CardTitle>
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
                <p className="text-gray-600 text-lg mb-2">Belum ada iklan</p>
                <p className="text-gray-500 text-sm mb-4">Mulai pasang iklan mobil Anda sekarang!</p>
                <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Pasang Iklan Pertama
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {cars.map((car) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        {car.car_images && car.car_images.length > 0 ? (
                          <img
                            src={car.car_images.find((img: any) => img.is_primary)?.image_url || car.car_images[0]?.image_url}
                            alt={car.title}
                            className="w-32 h-24 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Car className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {car.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {car.car_brands?.name} {car.car_models?.name} • {car.year}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusBadgeColor(car.status)}>
                              {car.status}
                            </Badge>
                            {car.listing_packages && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                {car.listing_packages.name}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Price & Location */}
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-500">Harga</p>
                            <p className="text-lg font-bold text-blue-600">
                              {formatCurrency(car.price)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Lokasi</p>
                            <p className="text-sm text-gray-900 flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {car.location_city}
                            </p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {car.view_count || 0} views
                          </div>
                          <div className="flex items-center">
                            <Heart className="w-4 h-4 mr-1" />
                            {car.wishlist_count || 0} wishlist
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {car.contact_count || 0} kontak
                          </div>
                        </div>

                        {/* Package Info & Refresh */}
                        {car.listing_packages && (
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-3">
                            <div className="text-sm">
                              <p className="text-gray-600">
                                Paket: <span className="font-semibold text-gray-900">{car.listing_packages.name}</span>
                              </p>
                              {car.listing_packages.allows_refresh && (
                                <p className="text-gray-500 text-xs mt-1">
                                  Refresh: {car.refresh_count || 0} / {car.total_refreshes_allowed || 0} kali
                                </p>
                              )}
                            </div>
                            {car.listing_packages.allows_refresh && car.status === 'available' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRefreshListing(car.id)}
                                disabled={car.refresh_count >= car.total_refreshes_allowed}
                                className="flex items-center gap-1"
                              >
                                <RefreshCw className="w-4 h-4" />
                                Sundul
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/mobil/${car.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Lihat
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(car)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteCar(car.id)}
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Hapus
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal: Create/Edit Car Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8">
            <div className="p-6 border-b sticky top-0 bg-white z-10 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? 'Edit Iklan' : 'Pasang Iklan Baru'}
                </h2>
                <Button variant="outline" size="sm" onClick={() => setShowModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <Tabs defaultValue="basic">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
                  <TabsTrigger value="specs">Spesifikasi</TabsTrigger>
                  <TabsTrigger value="images">Gambar</TabsTrigger>
                </TabsList>

                {/* Tab: Basic Info */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Merek *</Label>
                      <Select 
                        value={formData.brand_id?.toString()} 
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          brand_id: parseInt(value), 
                          model_id: undefined 
                        }))}
                      >
                        <SelectTrigger>
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
                      <Label>Model *</Label>
                      <Select 
                        value={formData.model_id?.toString()} 
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          model_id: parseInt(value) 
                        }))}
                        disabled={!formData.brand_id}
                      >
                        <SelectTrigger>
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
                      <Label>Kategori *</Label>
                      <Select 
                        value={formData.category_id?.toString()} 
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          category_id: parseInt(value) 
                        }))}
                      >
                        <SelectTrigger>
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
                      <Label>Judul Iklan *</Label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Contoh: Toyota Avanza 1.3 G MT 2023"
                      />
                    </div>

                    <div>
                      <Label>Tahun *</Label>
                      <Input
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                        min="1900"
                        max={new Date().getFullYear() + 1}
                      />
                    </div>

                    <div>
                      <Label>Harga (Rp) *</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                        placeholder="150000000"
                      />
                    </div>

                    <div>
                      <Label>Warna</Label>
                      <Input
                        value={formData.color}
                        onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                        placeholder="Putih"
                      />
                    </div>

                    <div>
                      <Label>Kota *</Label>
                      <Input
                        value={formData.location_city}
                        onChange={(e) => setFormData(prev => ({ ...prev, location_city: e.target.value }))}
                        placeholder="Jakarta"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Deskripsi</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Deskripsi lengkap kondisi mobil, fitur, kelengkapan, dll..."
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_negotiable"
                      checked={formData.is_negotiable}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_negotiable: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <Label htmlFor="is_negotiable" className="cursor-pointer">
                      Harga bisa dinegosiasi
                    </Label>
                  </div>
                </TabsContent>

                {/* Tab: Specifications */}
                <TabsContent value="specs" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Kondisi *</Label>
                      <Select 
                        value={formData.condition} 
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, condition: value }))}
                      >
                        <SelectTrigger>
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
                      <Label>Kilometer</Label>
                      <Input
                        type="number"
                        value={formData.mileage}
                        onChange={(e) => setFormData(prev => ({ ...prev, mileage: parseInt(e.target.value) || 0 }))}
                        placeholder="50000"
                      />
                    </div>

                    <div>
                      <Label>Transmisi *</Label>
                      <Select 
                        value={formData.transmission} 
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, transmission: value }))}
                      >
                        <SelectTrigger>
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
                      <Label>Bahan Bakar *</Label>
                      <Select 
                        value={formData.fuel_type} 
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, fuel_type: value }))}
                      >
                        <SelectTrigger>
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
                      <Label>Kapasitas Mesin (CC)</Label>
                      <Input
                        type="number"
                        value={formData.engine_capacity}
                        onChange={(e) => setFormData(prev => ({ ...prev, engine_capacity: parseInt(e.target.value) || 0 }))}
                        placeholder="1300"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Images */}
                <TabsContent value="images" className="space-y-4">
                  <div>
                    <Label>Upload Gambar Mobil</Label>
                    <div className="mt-2">
                      <label 
                        htmlFor="image_upload" 
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
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

                  {imagePreviewUrls.length > 0 && (
                    <div>
                      <Label>Preview Gambar ({imagePreviewUrls.length})</Label>
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
                                Utama
                              </div>
                            )}
                          </div>
                        ))}
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
                        {isEditMode ? 'Update' : 'Lanjut ke Pilih Paket'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Package Selection */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">Pilih Paket Iklan</h2>
              <p className="text-gray-600 mt-1">Pilih paket yang sesuai dengan kebutuhan Anda</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {packages.map((pkg) => (
                  <Card 
                    key={pkg.id}
                    className={`relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
                      selectedPackage?.id === pkg.id ? 'ring-2 ring-blue-600' : ''
                    }`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    {pkg.is_featured && (
                      <div className="absolute top-0 right-0 bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-3 py-1 text-xs font-bold">
                        POPULAR
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {pkg.price === 0 ? 'GRATIS' : formatCurrency(pkg.price)}
                        </div>
                        {pkg.price > 0 && (
                          <p className="text-xs text-gray-500">untuk {pkg.duration_days} hari</p>
                        )}
                      </div>

                      <Separator className="my-4" />

                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Tayang {pkg.duration_days} hari</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Maksimal {pkg.max_photos} foto</span>
                        </li>
                        {pkg.is_featured && (
                          <li className="flex items-start">
                            <Crown className="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span className="font-semibold">Iklan Premium</span>
                          </li>
                        )}
                        {pkg.allows_refresh && (
                          <li className="flex items-start">
                            <Zap className="w-4 h-4 text-orange-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Sundul {pkg.refresh_count}x</span>
                          </li>
                        )}
                        {pkg.badge_text && (
                          <li className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                            <span>Badge "{pkg.badge_text}"</span>
                          </li>
                        )}
                      </ul>

                      <Button
                        className="w-full mt-6"
                        onClick={() => selectPackage(pkg)}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Memproses...
                          </>
                        ) : (
                          'Pilih Paket'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Payment Proof Upload */}
      {showPaymentModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Upload Bukti Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-semibold mb-2">Detail Pembayaran:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-800">Paket:</span>
                    <span className="font-semibold text-blue-900">{selectedPackage.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-800">Total:</span>
                    <span className="font-bold text-lg text-blue-900">{formatCurrency(selectedPackage.price)}</span>
                  </div>
                  <Separator className="my-2" />
                  <p className="text-xs text-blue-700">
                    Transfer ke:<br />
                    <span className="font-semibold">BCA: 1234567890 a.n. PT Mobilindo</span>
                  </p>
                </div>
              </div>

              <div>
                <Label>Upload Bukti Transfer</Label>
                <div className="mt-2">
                  <label 
                    htmlFor="payment_proof" 
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    {paymentProof ? (
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-900 font-semibold">{paymentProof.name}</p>
                        <p className="text-xs text-gray-500">{(paymentProof.size / 1024).toFixed(2)} KB</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Klik untuk upload bukti transfer</p>
                      </div>
                    )}
                    <input
                      id="payment_proof"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setPaymentProof(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowPaymentModal(false);
                    resetForm();
                  }}
                  disabled={uploadingPayment}
                >
                  Batal
                </Button>
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={uploadPaymentProof}
                  disabled={!paymentProof || uploadingPayment}
                >
                  {uploadingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default HalamanKelolaIklan;