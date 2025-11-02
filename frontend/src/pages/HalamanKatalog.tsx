// Tambahkan import computeCatalogDisplay dan gunakan computed availability untuk list
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  MapPin, 
  Calendar, 
  Settings, 
  Heart,
  Eye,
  Phone,
  CheckCircle,
  Star,
  ArrowUpDown,
  SlidersHorizontal,
  Loader2
} from 'lucide-react';
import { carService, type CarWithRelations, type CarFilters, type CarQueryOptions } from '../services/carService';
import { wishlistService } from '../services/wishlistService';
import { supabase } from '../lib/supabase';

const HalamanKatalog: React.FC = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState<CarWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCars, setTotalCars] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [wishlistItems, setWishlistItems] = useState<Set<string>>(new Set());

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<CarFilters>({});
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<CarQueryOptions['sort_by']>('newest');

  // Dropdown options
  const [brands, setBrands] = useState<Array<{ id: number; name: string }>>([]);
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string }>>([]);

  // Fetch user session
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
      
      // Load wishlist if user logged in
      if (data.user) {
        loadWishlist(data.user.id);
      }
    };
    fetchUser();
  }, []);

  // Load wishlist items
  const loadWishlist = async (userId: string) => {
    try {
      const items = await wishlistService.getUserWishlist(userId);
      const carIds = new Set(items.map(item => item.car_id));
      setWishlistItems(carIds);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  // Fetch brands and categories for filters
  useEffect(() => {
    const fetchFilterOptions = async () => {
      const [brandsData, categoriesData] = await Promise.all([
        carService.getBrands(),
        carService.getCategories()
      ]);
      setBrands(brandsData);
      setCategories(categoriesData);
    };
    fetchFilterOptions();
  }, []);

  // Fetch cars
  useEffect(() => {
    fetchCars();
  }, [filters, page, sortBy]);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const response = await carService.getCars(filters, {
        page,
        limit,
        sort_by: sortBy
      });
      
      // REVISI: gunakan computed availability; jangan filter hanya status 'available'
      const visibleCars = response.data || [];
      setCars(visibleCars);
      setTotalCars(response.total ?? visibleCars.length);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchQuery }));
    setPage(1);
  };

  const handleToggleWishlist = async (carId: string) => {
    if (!currentUser) {
      alert('Silakan login terlebih dahulu untuk menambahkan ke wishlist');
      navigate('/login');
      return;
    }

    try {
      const isInWishlist = wishlistItems.has(carId);
      
      if (isInWishlist) {
        // Remove from wishlist
        const success = await wishlistService.removeFromWishlist(currentUser.id, carId);
        if (success) {
          setWishlistItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(carId);
            return newSet;
          });
          // Optional: Show success message
          console.log('Removed from wishlist');
        } else {
          alert('Gagal menghapus dari wishlist');
        }
      } else {
        // Add to wishlist
        const success = await wishlistService.addToWishlist(currentUser.id, carId);
        if (success) {
          setWishlistItems(prev => new Set(prev).add(carId));
          // Optional: Show success message
          console.log('Added to wishlist');
        } else {
          alert('Mobil sudah ada dalam wishlist atau gagal menambahkan');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('Terjadi kesalahan saat memproses wishlist');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const CarCard = ({ car }: { car: CarWithRelations }) => {
    const isInWishlist = wishlistItems.has(car.id);
    const primaryImage = car.car_images?.find(img => img.is_primary) || car.car_images?.[0];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -8 }}
        className="group"
      >
        <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white">
          <div className="relative overflow-hidden">
            <img
              src={primaryImage?.image_url || 'https://via.placeholder.com/400x300'}
              alt={car.title}
              className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
            />
            
            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="bg-white/90 hover:bg-white"
                  onClick={() => navigate(`/mobil/${car.id}`)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className={`bg-white/90 hover:bg-white ${isInWishlist ? 'text-red-500' : ''}`}
                  onClick={() => handleToggleWishlist(car.id)}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {car.is_verified && (
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
              <Badge variant={car.condition === 'new' ? 'default' : 'secondary'}>
                {car.condition === 'new' ? 'Baru' : 'Bekas'}
              </Badge>
              {car.is_featured && (
                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                  Featured
                </Badge>
              )}
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                {car.title}
              </h3>
              <p className="text-slate-600 text-sm">{car.car_categories?.name} • {car.condition === 'new' ? 'Baru' : 'Bekas'}</p>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(car.price)}
                </span>
                {car.market_price && car.market_price > car.price && (
                  <span className="text-sm text-slate-500 line-through">
                    {formatPrice(car.market_price)}
                  </span>
                )}
              </div>
              {car.is_negotiable && (
                <Badge variant="outline" className="text-xs">Nego</Badge>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-slate-600">
                <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                {car.location_city}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Settings className="w-4 h-4 mr-2 text-slate-400" />
                {car.transmission.toUpperCase()} • {car.fuel_type === 'gasoline' ? 'Bensin' : car.fuel_type}
              </div>
              {car.mileage > 0 && (
                <div className="flex items-center text-sm text-slate-600">
                  <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                  {car.mileage.toLocaleString()} km
                </div>
              )}
            </div>

            {/* Dealer info */}
            <div className="flex items-center justify-between mb-4 p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-900">{car.users.full_name}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-xs text-slate-600">{car.users.seller_rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-xs text-slate-400">
                    • {car.seller_type === 'showroom' ? 'Showroom' : 'Penjual'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {car.view_count}
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {car.wishlist_count}
              </div>
            </div>

            <Separator className="mb-4" />
            
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={() => navigate(`/mobil/${car.id}`)}
              >
                Lihat Detail
              </Button>
              <Button variant="outline" size="sm" className="px-3">
                <Phone className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent mb-2">
                Katalog Mobil
              </h1>
              <p className="text-slate-600 text-lg">Temukan mobil impian Anda dari ribuan pilihan terpercaya</p>
            </div>
            <Badge variant="secondary" className="px-4 py-2">
              {totalCars.toLocaleString()} mobil
            </Badge>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Cari mobil berdasarkan merek, model, atau lokasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 h-12 text-lg border-0 focus-visible:ring-2 focus-visible:ring-blue-500 bg-slate-50"
                />
              </div>

              <Tabs defaultValue="filters" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="filters" className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    Filter Pencarian
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filter Lanjutan
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="filters" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Select 
                      value={filters.brand_ids?.[0]?.toString() || ''} 
                      onValueChange={(value) => {
                        setFilters(prev => ({ ...prev, brand_ids: value ? [parseInt(value)] : undefined }));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Merek" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id.toString()}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select 
                      value={filters.category_ids?.[0]?.toString() || ''}
                      onValueChange={(value) => {
                        setFilters(prev => ({ ...prev, category_ids: value ? [parseInt(value)] : undefined }));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Tahun Min"
                      type="number"
                      value={filters.min_year || ''}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, min_year: e.target.value ? parseInt(e.target.value) : undefined }));
                        setPage(1);
                      }}
                      className="h-10"
                    />

                    <Input
                      placeholder="Tahun Max"
                      type="number"
                      value={filters.max_year || ''}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, max_year: e.target.value ? parseInt(e.target.value) : undefined }));
                        setPage(1);
                      }}
                      className="h-10"
                    />

                    <Select 
                      value={filters.transmission?.[0] || ''}
                      onValueChange={(value) => {
                        setFilters(prev => ({ ...prev, transmission: value ? [value] : undefined }));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Transmisi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="cvt">CVT</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select 
                      value={filters.fuel_type?.[0] || ''}
                      onValueChange={(value) => {
                        setFilters(prev => ({ ...prev, fuel_type: value ? [value] : undefined }));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Bahan Bakar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gasoline">Bensin</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="electric">Electric</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Input 
                      placeholder="Harga minimum" 
                      type="number"
                      value={filters.min_price || ''}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, min_price: e.target.value ? parseInt(e.target.value) : undefined }));
                        setPage(1);
                      }}
                      className="h-10" 
                    />
                    <Input 
                      placeholder="Harga maksimum" 
                      type="number"
                      value={filters.max_price || ''}
                      onChange={(e) => {
                        setFilters(prev => ({ ...prev, max_price: e.target.value ? parseInt(e.target.value) : undefined }));
                        setPage(1);
                      }}
                      className="h-10" 
                    />
                    <Select 
                      value={filters.seller_type || ''}
                      onValueChange={(value) => {
                        setFilters(prev => ({ ...prev, seller_type: value as 'showroom' | 'external' | undefined }));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipe Penjual" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="showroom">Showroom</SelectItem>
                        <SelectItem value="external">Penjual Eksternal</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select 
                      value={filters.condition?.[0] || ''}
                      onValueChange={(value) => {
                        setFilters(prev => ({ ...prev, condition: value ? [value] : undefined }));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kondisi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Baru</SelectItem>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between items-center mt-6">
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  onClick={handleSearch}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Terapkan Filter
                </Button>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">Tampilan:</span>
                    <div className="flex border rounded-lg p-1 bg-slate-100">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="h-8 px-3"
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="h-8 px-3"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-48">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Urutkan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Terbaru</SelectItem>
                      <SelectItem value="price_asc">Harga Terendah</SelectItem>
                      <SelectItem value="price_desc">Harga Tertinggi</SelectItem>
                      <SelectItem value="year_desc">Tahun Terbaru</SelectItem>
                      <SelectItem value="popular">Paling Populer</SelectItem>
                      <SelectItem value="rating">Rating Tertinggi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        )}

        {/* Empty State */}
        {!loading && cars.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-xl text-slate-600">Tidak ada mobil yang ditemukan</p>
            <p className="text-slate-500 mt-2">Coba ubah filter pencarian Anda</p>
          </motion.div>
        )}

        {/* Car Grid */}
        {!loading && cars.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={`grid gap-6 mb-8 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1 lg:grid-cols-2'
              }`}
            >
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </motion.div>

            {/* Pagination */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex justify-center gap-4"
            >
              <Button 
                variant="outline" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4 text-slate-600">
                Page {page} of {Math.ceil(totalCars / limit)}
              </span>
              <Button 
                variant="outline"
                disabled={page >= Math.ceil(totalCars / limit)}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default HalamanKatalog;


