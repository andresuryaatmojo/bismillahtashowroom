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
  const isAdmin = user?.role === 'admin' || user?.role === 'owner';
  
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
  
  // Tambahan state untuk quick-add
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [showAddModel, setShowAddModel] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Image upload
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  
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

  // Tab navigation state
  const [currentTab, setCurrentTab] = useState('basic');
  
  const tabs = [
    { id: 'basic', label: 'Informasi Dasar' },
    { id: 'specs', label: 'Spesifikasi' },
    { id: 'details', label: 'Detail & Fitur' },
    { id: 'images', label: 'Gambar' },
    { id: 'settings', label: 'Pengaturan' }
  ];

  const getCurrentTabIndex = () => tabs.findIndex(tab => tab.id === currentTab);
  const isFirstTab = getCurrentTabIndex() === 0;
  const isLastTab = getCurrentTabIndex() === tabs.length - 1;

  const goToNextTab = () => {
    const currentIndex = getCurrentTabIndex();
    if (currentIndex < tabs.length - 1) {
      setCurrentTab(tabs[currentIndex + 1].id);
    }
  };

  const goToPreviousTab = () => {
    const currentIndex = getCurrentTabIndex();
    if (currentIndex > 0) {
      setCurrentTab(tabs[currentIndex - 1].id);
    }
  };

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
    location_city: 'Bandung', // Lokasi showroom tetap
    location_province: 'Jawa Barat', // Lokasi showroom tetap
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

  // Management states for brands, models, categories
  const [managementMode, setManagementMode] = useState<{
    brand: { show: boolean; editId?: number; newName: string; targetId?: number };
    model: { show: boolean; editId?: number; newName: string; targetId?: number };
    category: { show: boolean; editId?: number; newName: string; targetId?: number };
  }>({
    brand: { show: false, newName: '' },
    model: { show: false, newName: '' },
    category: { show: false, newName: '' }
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
        isAdmin ? carService.getBrands() : carService.getActiveBrands(),
        isAdmin ? carService.getCategories() : carService.getActiveCategories()
      ]);
      setBrands(brandsData);
      setCategories(categoriesData);
    };
    loadMasterData();
  }, [isAdmin]);

  // Load models when brand selected
  useEffect(() => {
    const loadModels = async () => {
      if (formData.brand_id) {
        const modelsData = isAdmin 
          ? await carService.getModelsByBrand(formData.brand_id)
          : await carService.getActiveModelsByBrand(formData.brand_id);
        setModels(modelsData);
      } else {
        setModels([]);
      }
    };
    loadModels();
  }, [formData.brand_id, isAdmin]);

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

  // Remove existing image (mark for deletion)
  const removeExistingImage = (imageId: string) => {
    setImagesToDelete(prev => [...prev, imageId]);
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Handle quick-add functions
  const handleAddBrand = async () => {
    if (!newBrandName.trim()) return;
    const id = await carService.findOrCreateBrand(newBrandName.trim(), isAdmin);
    if (!id) {
      alert('Gagal menyimpan merek. Cek console: kemungkinan RLS Supabase menolak INSERT.');
      return;
    }
    const brandsData = await carService.getBrands();
    setBrands(brandsData);
    setFormData(prev => ({ ...prev, brand_id: id, model_id: undefined }));
    setNewBrandName('');
    setShowAddBrand(false);
  };

  const handleAddModel = async () => {
    if (!formData.brand_id || !newModelName.trim()) return;
    const id = await carService.findOrCreateModel(newModelName.trim(), formData.brand_id, formData.category_id, isAdmin);
    if (!id) {
      alert('Gagal menyimpan model. Cek console untuk detail.');
      return;
    }
    const modelsData = await carService.getModelsByBrand(formData.brand_id);
    setModels(modelsData);
    setFormData(prev => ({ ...prev, model_id: id }));
    setNewModelName('');
    setShowAddModel(false);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const id = await carService.findOrCreateCategory(newCategoryName.trim(), isAdmin);
    if (id) {
      const categoriesData = await carService.getCategories();
      setCategories(categoriesData);
      setFormData(prev => ({ ...prev, category_id: id }));
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  // Management handlers for brands
  const handleUpdateBrand = async (id: number, newName: string) => {
    try {
      const success = await carService.updateBrandName(id, newName);
      if (success) {
        const brandsData = isAdmin ? await carService.getBrands() : await carService.getActiveBrands();
        setBrands(brandsData);
        setManagementMode(prev => ({ ...prev, brand: { show: true, newName: '', editId: undefined } }));
        alert('Nama merek berhasil diubah');
      } else {
        alert('Gagal mengubah nama merek');
      }
    } catch (error) {
      console.error('Error updating brand:', error);
      alert('Gagal mengubah nama merek');
    }
  };

  const handleDeactivateBrand = async (id: number) => {
    if (!window.confirm('Yakin ingin menonaktifkan merek ini? Mobil dengan merek ini akan tetap ada.')) return;
    try {
      const success = await carService.deactivateBrand(id);
      if (success) {
        const brandsData = isAdmin ? await carService.getBrands() : await carService.getActiveBrands();
        setBrands(brandsData);
        alert('Merek berhasil dinonaktifkan');
      } else {
        alert('Gagal menonaktifkan merek');
      }
    } catch (error) {
      console.error('Error deactivating brand:', error);
      alert('Gagal menonaktifkan merek');
    }
  };

  const handleReassignBrand = async (fromId: number, toId: number) => {
    if (!window.confirm('Yakin ingin menggabungkan merek ini? Semua mobil akan dipindah ke merek tujuan.')) return;
    try {
      const success = await carService.reassignCarsBrand(fromId, toId);
      if (success) {
        const brandsData = isAdmin ? await carService.getBrands() : await carService.getActiveBrands();
        setBrands(brandsData);
        alert('Merek berhasil digabungkan');
      } else {
        alert('Gagal menggabungkan merek');
      }
    } catch (error) {
      console.error('Error reassigning brand:', error);
      alert('Gagal menggabungkan merek');
    }
  };

  // Management handlers for models
  const handleUpdateModel = async (id: number, newName: string) => {
    try {
      const success = await carService.updateModelName(id, newName);
      if (success && formData.brand_id) {
        const modelsData = isAdmin 
          ? await carService.getModelsByBrand(formData.brand_id)
          : await carService.getActiveModelsByBrand(formData.brand_id);
        setModels(modelsData);
        setManagementMode(prev => ({ ...prev, model: { show: true, newName: '', editId: undefined } }));
        alert('Nama model berhasil diubah');
      } else {
        alert('Gagal mengubah nama model');
      }
    } catch (error) {
      console.error('Error updating model:', error);
      alert('Gagal mengubah nama model');
    }
  };

  const handleDeactivateModel = async (id: number) => {
    if (!window.confirm('Yakin ingin menonaktifkan model ini? Mobil dengan model ini akan tetap ada.')) return;
    try {
      const success = await carService.deactivateModel(id);
      if (success && formData.brand_id) {
        const modelsData = isAdmin 
          ? await carService.getModelsByBrand(formData.brand_id)
          : await carService.getActiveModelsByBrand(formData.brand_id);
        setModels(modelsData);
        alert('Model berhasil dinonaktifkan');
      } else {
        alert('Gagal menonaktifkan model');
      }
    } catch (error) {
      console.error('Error deactivating model:', error);
      alert('Gagal menonaktifkan model');
    }
  };

  const handleReassignModel = async (fromId: number, toId: number) => {
    if (!window.confirm('Yakin ingin menggabungkan model ini? Semua mobil akan dipindah ke model tujuan.')) return;
    try {
      const success = await carService.reassignCarsModel(fromId, toId);
      if (success && formData.brand_id) {
        const modelsData = isAdmin 
          ? await carService.getModelsByBrand(formData.brand_id)
          : await carService.getActiveModelsByBrand(formData.brand_id);
        setModels(modelsData);
        alert('Model berhasil digabungkan');
      } else {
        alert('Gagal menggabungkan model');
      }
    } catch (error) {
      console.error('Error reassigning model:', error);
      alert('Gagal menggabungkan model');
    }
  };

  // Management handlers for categories
  const handleUpdateCategory = async (id: number, newName: string) => {
    try {
      const success = await carService.updateCategoryName(id, newName);
      if (success) {
        const categoriesData = isAdmin ? await carService.getCategories() : await carService.getActiveCategories();
        setCategories(categoriesData);
        setManagementMode(prev => ({ ...prev, category: { show: true, newName: '', editId: undefined } }));
        alert('Nama kategori berhasil diubah');
      } else {
        alert('Gagal mengubah nama kategori');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Gagal mengubah nama kategori');
    }
  };

  const handleDeactivateCategory = async (id: number) => {
    if (!window.confirm('Yakin ingin menonaktifkan kategori ini? Mobil dengan kategori ini akan tetap ada.')) return;
    try {
      const success = await carService.deactivateCategory(id);
      if (success) {
        const categoriesData = isAdmin ? await carService.getCategories() : await carService.getActiveCategories();
        setCategories(categoriesData);
        alert('Kategori berhasil dinonaktifkan');
      } else {
        alert('Gagal menonaktifkan kategori');
      }
    } catch (error) {
      console.error('Error deactivating category:', error);
      alert('Gagal menonaktifkan kategori');
    }
  };

  const handleReassignCategory = async (fromId: number, toId: number) => {
    if (!window.confirm('Yakin ingin menggabungkan kategori ini? Semua mobil akan dipindah ke kategori tujuan.')) return;
    try {
      const success = await carService.reassignCarsCategory(fromId, toId);
      if (success) {
        const categoriesData = isAdmin ? await carService.getCategories() : await carService.getActiveCategories();
        setCategories(categoriesData);
        alert('Kategori berhasil digabungkan');
      } else {
        alert('Gagal menggabungkan kategori');
      }
    } catch (error) {
      console.error('Error reassigning category:', error);
      alert('Gagal menggabungkan kategori');
    }
  };

  const handleReactivateBrand = async (id: number) => {
    if (!window.confirm('Yakin ingin mengaktifkan kembali merek ini?')) return;
    try {
      const success = await carService.reactivateBrand(id);
      if (success) {
        const brandsData = isAdmin ? await carService.getBrands() : await carService.getActiveBrands();
        setBrands(brandsData);
        alert('Merek berhasil diaktifkan kembali');
      } else {
        alert('Gagal mengaktifkan merek');
      }
    } catch (error) {
      console.error('Error reactivating brand:', error);
      alert('Gagal mengaktifkan merek');
    }
  };

  const handleHardDeleteBrand = async (id: number) => {
    try {
      // First attempt without admin confirmation to check for references
      const result = await carService.hardDeleteBrand(id, false);
      
      if (result.requiresConfirmation && result.references) {
        let confirmMessage = `PERINGATAN: ${result.error}\n\nDetail mobil yang masih menggunakan merek ini:\n`;
        
        // Show all cars with their status
        confirmMessage += result.references.details.map(car => `- ${car.title} (${car.status})`).join('\n');
        
        confirmMessage += `\n\nApakah Anda yakin ingin menghapus merek ini secara permanen?\nTindakan ini TIDAK DAPAT DIBATALKAN!`;
        
        if (window.confirm(confirmMessage)) {
          // Admin confirmed, proceed with hard delete
          const confirmedResult = await carService.hardDeleteBrand(id, true);
          if (confirmedResult.success) {
            const brandsData = isAdmin ? await carService.getBrands() : await carService.getActiveBrands();
            setBrands(brandsData);
            alert('Merek berhasil dihapus secara permanen');
          } else {
            alert(confirmedResult.error || 'Gagal menghapus merek');
          }
        }
      } else if (result.success) {
        const brandsData = isAdmin ? await carService.getBrands() : await carService.getActiveBrands();
        setBrands(brandsData);
        alert('Merek berhasil dihapus secara permanen');
      } else {
        alert(result.error || 'Gagal menghapus merek');
      }
    } catch (error) {
      console.error('Error hard deleting brand:', error);
      alert('Gagal menghapus merek');
    }
  };

  const handleReactivateModel = async (id: number) => {
    if (!window.confirm('Yakin ingin mengaktifkan kembali model ini?')) return;
    try {
      const success = await carService.reactivateModel(id);
      if (success && formData.brand_id) {
        const modelsData = isAdmin 
          ? await carService.getModelsByBrand(formData.brand_id)
          : await carService.getActiveModelsByBrand(formData.brand_id);
        setModels(modelsData);
        alert('Model berhasil diaktifkan kembali');
      } else {
        alert('Gagal mengaktifkan model');
      }
    } catch (error) {
      console.error('Error reactivating model:', error);
      alert('Gagal mengaktifkan model');
    }
  };

  const handleHardDeleteModel = async (id: number) => {
    try {
      // First attempt without admin confirmation to check for references
      const result = await carService.hardDeleteModel(id, false);
      
      if (result.requiresConfirmation && result.references) {
        let confirmMessage = `PERINGATAN: ${result.error}\n\nDetail mobil yang masih menggunakan model ini:\n`;
        
        // Show all cars with their status
        confirmMessage += result.references.details.map(car => `- ${car.title} (${car.status})`).join('\n');
        
        confirmMessage += `\n\nApakah Anda yakin ingin menghapus model ini secara permanen?\nTindakan ini TIDAK DAPAT DIBATALKAN!`;
        
        if (window.confirm(confirmMessage)) {
          // Admin confirmed, proceed with hard delete
          const confirmedResult = await carService.hardDeleteModel(id, true);
          if (confirmedResult.success && formData.brand_id) {
            const modelsData = isAdmin 
              ? await carService.getModelsByBrand(formData.brand_id)
              : await carService.getActiveModelsByBrand(formData.brand_id);
            setModels(modelsData);
            alert('Model berhasil dihapus secara permanen');
          } else {
            alert(confirmedResult.error || 'Gagal menghapus model');
          }
        }
      } else if (result.success && formData.brand_id) {
        const modelsData = isAdmin 
          ? await carService.getModelsByBrand(formData.brand_id)
          : await carService.getActiveModelsByBrand(formData.brand_id);
        setModels(modelsData);
        alert('Model berhasil dihapus secara permanen');
      } else {
        alert(result.error || 'Gagal menghapus model');
      }
    } catch (error) {
      console.error('Error hard deleting model:', error);
      alert('Gagal menghapus model');
    }
  };

  const handleReactivateCategory = async (id: number) => {
    if (!window.confirm('Yakin ingin mengaktifkan kembali kategori ini?')) return;
    try {
      const success = await carService.reactivateCategory(id);
      if (success) {
        const categoriesData = isAdmin ? await carService.getCategories() : await carService.getActiveCategories();
        setCategories(categoriesData);
        alert('Kategori berhasil diaktifkan kembali');
      } else {
        alert('Gagal mengaktifkan kategori');
      }
    } catch (error) {
      console.error('Error reactivating category:', error);
      alert('Gagal mengaktifkan kategori');
    }
  };

  const handleHardDeleteCategory = async (id: number) => {
    try {
      // First attempt without admin confirmation to check for references
      const result = await carService.hardDeleteCategory(id, false);
      
      if (result.requiresConfirmation && result.references) {
        let confirmMessage = `PERINGATAN: ${result.error}\n\nDetail mobil yang masih menggunakan kategori ini:\n`;
        
        // Show all cars with their status
        confirmMessage += result.references.details.map(car => `- ${car.title} (${car.status})`).join('\n');
        
        confirmMessage += `\n\nApakah Anda yakin ingin menghapus kategori ini secara permanen?\nTindakan ini TIDAK DAPAT DIBATALKAN!`;
        
        if (window.confirm(confirmMessage)) {
          // Admin confirmed, proceed with hard delete
          const confirmedResult = await carService.hardDeleteCategory(id, true);
          if (confirmedResult.success) {
            const categoriesData = isAdmin ? await carService.getCategories() : await carService.getActiveCategories();
            setCategories(categoriesData);
            alert('Kategori berhasil dihapus secara permanen');
          } else {
            alert(confirmedResult.error || 'Gagal menghapus kategori');
          }
        }
      } else if (result.success) {
        const categoriesData = isAdmin ? await carService.getCategories() : await carService.getActiveCategories();
        setCategories(categoriesData);
        alert('Kategori berhasil dihapus secara permanen');
      } else {
        alert(result.error || 'Gagal menghapus kategori');
      }
    } catch (error) {
      console.error('Error hard deleting category:', error);
      alert('Gagal menghapus kategori');
    }
  };

  // Upload images
  const uploadImages = async (carId: string) => {
    setUploadingImages(true);
    try {
      // Delete marked images first
      for (const imageId of imagesToDelete) {
        await carService.deleteCarImage(imageId);
      }

      // Upload new images
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
          i === 0 && existingImages.length === 0, // First image is primary only if no existing images
          i + existingImages.length // Adjust order based on existing images
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
      setImagesToDelete([]);
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
      if (selectedImages.length > 0 || imagesToDelete.length > 0) {
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
      location_city: 'Bandung',
      location_province: 'Jawa Barat',
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
    setExistingImages([]);
    setImagesToDelete([]);
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
    
    // Load existing images for edit mode
    console.log('Car data:', car); // Debug log
    console.log('Car images:', car.car_images); // Debug log
    if (car.car_images && car.car_images.length > 0) {
      setExistingImages(car.car_images);
      console.log('Setting existing images:', car.car_images); // Debug log
    } else {
      setExistingImages([]);
      console.log('No existing images found'); // Debug log
    }
    
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
                variant="destructive"
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

            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
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
                      <div className="flex items-start gap-2">
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
                            {brands.filter(b => b.is_active).map(b => (
                              <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isAdmin && (
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => setShowAddBrand(s => !s)} title="Tambah Merek">
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setManagementMode(prev => ({ 
                                ...prev, 
                                brand: { show: !prev.brand.show, newName: '' } 
                              }))}
                              title="Kelola Merek"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {isAdmin && showAddBrand && (
                        <div className="mt-2 flex gap-2">
                          <Input 
                            value={newBrandName} 
                            onChange={(e) => setNewBrandName(e.target.value)} 
                            placeholder="Nama merek baru"
                          />
                          <Button size="sm" onClick={handleAddBrand}>Simpan</Button>
                        </div>
                      )}
                      {isAdmin && managementMode.brand.show && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                            <div className="p-4 border-b sticky top-0 bg-white">
                              <div className="flex justify-between items-center">
                                <h4 className="text-lg font-medium">Kelola Merek</h4>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setManagementMode(prev => ({ ...prev, brand: { show: false, newName: '' } }))}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="space-y-3">
                                {brands.map(brand => (
                                  <div key={brand.id} className={`flex items-center gap-3 p-3 border rounded-lg ${!brand.is_active ? 'bg-gray-50 border-gray-300' : ''}`}>
                                    <div className="flex-1 flex items-center gap-2">
                                      <span className={`font-medium ${!brand.is_active ? 'text-gray-500' : ''}`}>
                                        {brand.name}
                                      </span>
                                      {!brand.is_active && (
                                        <Badge variant="secondary" className="text-xs">
                                          Nonaktif
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      {brand.is_active ? (
                                        <>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => setManagementMode(prev => ({
                                              ...prev,
                                              brand: { 
                                                show: true, 
                                                editId: brand.id, 
                                                newName: brand.name 
                                              }
                                            }))}
                                            title="Ubah Nama"
                                          >
                                            <Edit className="w-4 h-4" />
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => handleDeactivateBrand(brand.id)}
                                            title="Nonaktifkan"
                                            className="text-red-600 hover:text-red-700"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                          <Select 
                                            onValueChange={(value) => handleReassignBrand(brand.id, parseInt(value))}
                                          >
                                            <SelectTrigger className="w-32">
                                              <SelectValue placeholder="Gabung ke..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {brands.filter(b => b.id !== brand.id && b.is_active).map(b => (
                                                <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </>
                                      ) : (
                                        <div className="flex gap-2">
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => handleReactivateBrand(brand.id)}
                                            title="Aktifkan Kembali"
                                            className="text-green-600 hover:text-green-700"
                                          >
                                            <CheckCircle className="w-4 h-4" />
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => handleHardDeleteBrand(brand.id)}
                                            title="Hapus Permanen"
                                            className="text-red-600 hover:text-red-700 border-red-300"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {managementMode.brand.editId && (
                                <div className="mt-4 p-4 border rounded-lg bg-blue-50">
                                  <h5 className="text-sm font-medium mb-2">Edit Nama Merek</h5>
                                  <div className="flex gap-2">
                                    <Input 
                                      value={managementMode.brand.newName}
                                      onChange={(e) => setManagementMode(prev => ({
                                        ...prev,
                                        brand: { ...prev.brand, newName: e.target.value }
                                      }))}
                                      placeholder="Nama baru"
                                      className="flex-1"
                                    />
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleUpdateBrand(managementMode.brand.editId!, managementMode.brand.newName)}
                                    >
                                      Simpan
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => setManagementMode(prev => ({
                                        ...prev,
                                        brand: { show: true, newName: '' }
                                      }))}
                                    >
                                      Batal
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="model_id">Model *</Label>
                      <div className="flex items-start gap-2">
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
                            {models.filter(m => m.is_active).map(m => (
                              <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isAdmin && (
                          <div className="flex gap-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setShowAddModel(s => !s)} 
                              disabled={!formData.brand_id}
                              title="Tambah Model"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setManagementMode(prev => ({ 
                                ...prev, 
                                model: { show: !prev.model.show, newName: '' } 
                              }))}
                              disabled={!formData.brand_id}
                              title="Kelola Model"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {!formData.brand_id && (
                        <p className="text-xs text-gray-500 mt-1">Pilih merek terlebih dahulu</p>
                      )}
                      {isAdmin && showAddModel && (
                        <div className="mt-2 flex gap-2">
                          <Input 
                            value={newModelName} 
                            onChange={(e) => setNewModelName(e.target.value)} 
                            placeholder="Nama model baru"
                          />
                          <Button size="sm" onClick={handleAddModel} disabled={!formData.brand_id}>Simpan</Button>
                        </div>
                      )}
                      {isAdmin && managementMode.model.show && formData.brand_id && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                            <div className="p-4 border-b sticky top-0 bg-white">
                              <div className="flex justify-between items-center">
                                <h4 className="text-lg font-medium">Kelola Model</h4>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setManagementMode(prev => ({ ...prev, model: { show: false, newName: '' } }))}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="space-y-3">
                                {models.map(model => (
                                  <div key={model.id} className={`flex items-center gap-3 p-3 border rounded-lg ${!model.is_active ? 'bg-gray-50 opacity-75' : ''}`}>
                                    <div className="flex-1 flex items-center gap-2">
                                      <span className={`font-medium ${!model.is_active ? 'text-gray-500 line-through' : ''}`}>
                                        {model.name}
                                      </span>
                                      {!model.is_active && (
                                        <Badge variant="secondary" className="text-xs">Nonaktif</Badge>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      {model.is_active ? (
                                        <>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => setManagementMode(prev => ({
                                              ...prev,
                                              model: { 
                                                show: true, 
                                                editId: model.id, 
                                                newName: model.name 
                                              }
                                            }))}
                                            title="Ubah Nama"
                                          >
                                            <Edit className="w-4 h-4" />
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => handleDeactivateModel(model.id)}
                                            title="Nonaktifkan"
                                            className="text-red-600 hover:text-red-700"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                          <Select 
                                            onValueChange={(value) => handleReassignModel(model.id, parseInt(value))}
                                          >
                                            <SelectTrigger className="w-32">
                                              <SelectValue placeholder="Gabung ke..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {models.filter(m => m.id !== model.id && m.is_active).map(m => (
                                                <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </>
                                      ) : (
                                        <div className="flex gap-2">
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => handleReactivateModel(model.id)}
                                            title="Aktifkan Kembali"
                                            className="text-green-600 hover:text-green-700"
                                          >
                                            <CheckCircle className="w-4 h-4" />
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => handleHardDeleteModel(model.id)}
                                            title="Hapus Permanen"
                                            className="text-red-600 hover:text-red-700 border-red-300"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {managementMode.model.editId && (
                                <div className="mt-4 p-4 border rounded-lg bg-blue-50">
                                  <h5 className="text-sm font-medium mb-2">Edit Nama Model</h5>
                                  <div className="flex gap-2">
                                    <Input 
                                      value={managementMode.model.newName}
                                      onChange={(e) => setManagementMode(prev => ({
                                        ...prev,
                                        model: { ...prev.model, newName: e.target.value }
                                      }))}
                                      placeholder="Nama baru"
                                      className="flex-1"
                                    />
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleUpdateModel(managementMode.model.editId!, managementMode.model.newName)}
                                    >
                                      Simpan
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => setManagementMode(prev => ({
                                        ...prev,
                                        model: { show: true, newName: '' }
                                      }))}
                                    >
                                      Batal
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="category_id">Kategori *</Label>
                      <div className="flex items-start gap-2">
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
                            {categories.filter(c => c.is_active).map(c => (
                              <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {isAdmin && (
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => setShowAddCategory(s => !s)} title="Tambah Kategori">
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setManagementMode(prev => ({ 
                                ...prev, 
                                category: { show: !prev.category.show, newName: '' } 
                              }))}
                              title="Kelola Kategori"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      {isAdmin && showAddCategory && (
                        <div className="mt-2 flex gap-2">
                          <Input 
                            value={newCategoryName} 
                            onChange={(e) => setNewCategoryName(e.target.value)} 
                            placeholder="Nama kategori baru"
                          />
                          <Button size="sm" onClick={handleAddCategory}>Simpan</Button>
                        </div>
                      )}
                      {isAdmin && managementMode.category.show && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                            <div className="p-4 border-b sticky top-0 bg-white">
                              <div className="flex justify-between items-center">
                                <h4 className="text-lg font-medium">Kelola Kategori</h4>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => setManagementMode(prev => ({ ...prev, category: { show: false, newName: '' } }))}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="space-y-3">
                                {categories.map(category => (
                                  <div key={category.id} className={`flex items-center gap-3 p-3 border rounded-lg ${!category.is_active ? 'bg-gray-50 opacity-75' : ''}`}>
                                    <div className="flex-1 flex items-center gap-2">
                                      <span className={`font-medium ${!category.is_active ? 'text-gray-500 line-through' : ''}`}>
                                        {category.name}
                                      </span>
                                      {!category.is_active && (
                                        <Badge variant="secondary" className="text-xs">Nonaktif</Badge>
                                      )}
                                    </div>
                                    <div className="flex gap-2">
                                      {category.is_active ? (
                                        <>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => setManagementMode(prev => ({
                                              ...prev,
                                              category: { 
                                                show: true, 
                                                editId: category.id, 
                                                newName: category.name 
                                              }
                                            }))}
                                            title="Ubah Nama"
                                          >
                                            <Edit className="w-4 h-4" />
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => handleDeactivateCategory(category.id)}
                                            title="Nonaktifkan"
                                            className="text-red-600 hover:text-red-700"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                          <Select 
                                            onValueChange={(value) => handleReassignCategory(category.id, parseInt(value))}
                                          >
                                            <SelectTrigger className="w-32">
                                              <SelectValue placeholder="Gabung ke..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {categories.filter(c => c.id !== category.id && c.is_active).map(c => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </>
                                      ) : (
                                        <div className="flex gap-2">
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => handleReactivateCategory(category.id)}
                                            title="Aktifkan Kembali"
                                            className="text-green-600 hover:text-green-700"
                                          >
                                            <CheckCircle className="w-4 h-4" />
                                          </Button>
                                          <Button 
                                            size="sm" 
                                            variant="outline"
                                            onClick={() => handleHardDeleteCategory(category.id)}
                                            title="Hapus Permanen"
                                            className="text-red-600 hover:text-red-700 border-red-300"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {managementMode.category.editId && (
                                <div className="mt-4 p-4 border rounded-lg bg-blue-50">
                                  <h5 className="text-sm font-medium mb-2">Edit Nama Kategori</h5>
                                  <div className="flex gap-2">
                                    <Input 
                                      value={managementMode.category.newName}
                                      onChange={(e) => setManagementMode(prev => ({
                                        ...prev,
                                        category: { ...prev.category, newName: e.target.value }
                                      }))}
                                      placeholder="Nama baru"
                                      className="flex-1"
                                    />
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleUpdateCategory(managementMode.category.editId!, managementMode.category.newName)}
                                    >
                                      Simpan
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => setManagementMode(prev => ({
                                        ...prev,
                                        category: { show: true, newName: '' }
                                      }))}
                                    >
                                      Batal
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
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
                      <Select
                        value={formData.year.toString()}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, year: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tahun" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="price">Harga (Rp) *</Label>
                      <Input
                        id="price"
                        type="text"
                        value={formData.price ? `Rp ${formData.price.toLocaleString('id-ID')}` : ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d]/g, '');
                          setFormData(prev => ({ ...prev, price: parseInt(value) || 0 }));
                        }}
                        placeholder="Rp 150.000.000"
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

                    {/* Lokasi showroom tetap: Bandung, Jawa Barat */}
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <Label className="text-sm font-medium text-gray-700">Lokasi Showroom</Label>
                      <p className="text-sm text-gray-600 mt-1">Bandung, Jawa Barat</p>
                      <p className="text-xs text-gray-500 mt-1">Lokasi showroom tidak dapat diubah</p>
                    </div>

                    <div>
                      <Label htmlFor="market_price">Harga Pasar (Opsional)</Label>
                      <Input
                        id="market_price"
                        type="text"
                        value={formData.market_price ? `Rp ${formData.market_price.toLocaleString('id-ID')}` : ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d]/g, '');
                          setFormData(prev => ({ ...prev, market_price: value ? parseInt(value) : undefined }));
                        }}
                        placeholder="Rp 160.000.000"
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

                  {/* Navigation buttons for basic tab */}
                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={goToNextTab}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Berikutnya
                    </Button>
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
                        type="text"
                        value={formData.mileage ? formData.mileage.toLocaleString('id-ID') : ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d]/g, '');
                          setFormData(prev => ({ ...prev, mileage: parseInt(value) || 0 }));
                        }}
                        placeholder="50000"
                        onFocus={(e) => {
                          if (formData.mileage > 0) {
                            e.target.value = formData.mileage.toString();
                          }
                        }}
                        onBlur={(e) => {
                          if (formData.mileage > 0) {
                            e.target.value = formData.mileage.toLocaleString('id-ID');
                          }
                        }}
                      />
                      <div className="text-xs text-gray-500 mt-1">Satuan: kilometer (km)</div>
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
                        type="text"
                        value={formData.engine_capacity ? formData.engine_capacity.toLocaleString('id-ID') : ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d]/g, '');
                          setFormData(prev => ({ ...prev, engine_capacity: parseInt(value) || 0 }));
                        }}
                        placeholder="1500"
                        onFocus={(e) => {
                          if (formData.engine_capacity > 0) {
                            e.target.value = formData.engine_capacity.toString();
                          }
                        }}
                        onBlur={(e) => {
                          if (formData.engine_capacity > 0) {
                            e.target.value = formData.engine_capacity.toLocaleString('id-ID');
                          }
                        }}
                      />
                      <div className="text-xs text-gray-500 mt-1">Satuan: cubic centimeter (CC)</div>
                    </div>
                  </div>

                  {/* Navigation buttons for specs tab */}
                  <div className="flex justify-between pt-4">
                    <Button 
                      variant="outline"
                      onClick={goToPreviousTab}
                    >
                      Sebelumnya
                    </Button>
                    <Button 
                      onClick={goToNextTab}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Berikutnya
                    </Button>
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

                  {/* Navigation buttons for details tab */}
                  <div className="flex justify-between pt-4">
                    <Button 
                      variant="outline"
                      onClick={goToPreviousTab}
                    >
                      Sebelumnya
                    </Button>
                    <Button 
                      onClick={goToNextTab}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Berikutnya
                    </Button>
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

                  {/* Existing Images (Edit Mode) */}
                  {isEditMode && existingImages.length > 0 && (
                    <div>
                      <Label>Gambar yang Sudah Ada ({existingImages.length})</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                        {existingImages.map((image, index) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.image_url}
                              alt={`Existing ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(image.id)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                            {image.is_primary && (
                              <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                                Gambar Utama
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                            {index === 0 && existingImages.length === 0 && (
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
                          <p>Anda dapat menghapus gambar yang sudah ada dengan mengklik tombol X pada gambar. Gambar baru yang di-upload akan ditambahkan ke gambar yang tersisa.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation buttons for images tab */}
                  <div className="flex justify-between pt-4">
                    <Button 
                      variant="outline"
                      onClick={goToPreviousTab}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Sebelumnya
                    </Button>
                    <Button 
                      onClick={goToNextTab}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Berikutnya
                    </Button>
                  </div>
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

                  {/* Navigation buttons for settings tab */}
                  <div className="flex justify-between pt-4">
                    <Button 
                      variant="outline"
                      onClick={goToPreviousTab}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Sebelumnya
                    </Button>
                    <Button 
                      onClick={saveCar}
                      disabled={submitting || uploadingImages}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {submitting || uploadingImages ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {uploadingImages ? 'Mengupload...' : 'Menyimpan...'}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {isEditMode ? 'Update Mobil' : 'Simpan Mobil'}
                        </>
                      )}
                    </Button>
                  </div>
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