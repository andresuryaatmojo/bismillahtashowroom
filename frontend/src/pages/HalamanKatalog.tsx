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
  Loader2,
  Clock
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

  // Countdown Timer Hook
  const useCountdown = (targetDate: string | null) => {
    const [timeLeft, setTimeLeft] = useState<{
      days: number;
      hours: number;
      minutes: number;
      seconds: number;
      expired: boolean;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });

    useEffect(() => {
      if (!targetDate) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      const calculateTimeLeft = () => {
        const difference = new Date(targetDate).getTime() - new Date().getTime();

        if (difference <= 0) {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
          return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds, expired: false });
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);

      return () => clearInterval(timer);
    }, [targetDate]);

    return timeLeft;
  };

  const CarCard = ({ car }: { car: CarWithRelations }) => {
    const isInWishlist = wishlistItems.has(car.id);
    const primaryImage = car.car_images?.find(img => img.is_primary) || car.car_images?.[0];
    const totalImages = car.car_images?.length || 0;

    // Check if car is currently booked
    const isBooked = car.active_transaction?.booking_expires_at &&
                     car.active_transaction?.booking_status !== 'booking_cancelled';
    const bookingExpiresAt = isBooked ? car.active_transaction?.booking_expires_at : null;
    const countdown = useCountdown(bookingExpiresAt || null);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -8 }}
        className="group relative"
      >
        <Card className={`h-full border shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white rounded-xl ${
          isBooked && !countdown.expired ? 'ring-2 ring-orange-400' : ''
        }`}>
          <div className="relative overflow-hidden aspect-[4/3] bg-gray-100">
            <img
              src={primaryImage?.image_url || 'https://via.placeholder.com/400x300'}
              alt={car.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Subtle booking indicator overlay */}
            {isBooked && !countdown.expired && (
              <div className="absolute inset-0 bg-gradient-to-t from-orange-900/40 via-transparent to-transparent pointer-events-none" />
            )}

            {/* Heart button - top right */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleWishlist(car.id);
              }}
              className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                isInWishlist
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-white/90 hover:bg-white text-gray-700 shadow-md'
              }`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>

            {/* Image counter - bottom right */}
            {totalImages > 0 && (
              <div className="absolute bottom-3 right-3 bg-gray-900/80 text-white text-xs font-medium px-2 py-1 rounded">
                1/{totalImages}
              </div>
            )}

            {/* Badges - top left */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {/* Package Badge - Berdasarkan priority_level untuk konsistensi */}
              {car.active_package?.listing_packages && (
                <>
                  {/* FEATURED: priority >= 100 */}
                  {car.active_package.listing_packages.priority_level >= 100 && (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-bold shadow-lg">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      FEATURED
                    </Badge>
                  )}
                  {/* PREMIUM: priority 50-99 */}
                  {car.active_package.listing_packages.priority_level >= 50 && car.active_package.listing_packages.priority_level < 100 && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg">
                      <Star className="w-3 h-3 mr-1" />
                      PREMIUM
                    </Badge>
                  )}
                  {/* PAKET UMUM: priority 20-49 */}
                  {car.active_package.listing_packages.priority_level >= 20 && car.active_package.listing_packages.priority_level < 50 && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      PAKET UMUM
                    </Badge>
                  )}
                  {/* Additional badges */}
                  {car.active_package.listing_packages.is_highlighted && (
                    <Badge className="bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white">
                      Highlighted
                    </Badge>
                  )}
                  {car.active_package.listing_packages.badge_text && (
                    <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white">
                      {car.active_package.listing_packages.badge_text}
                    </Badge>
                  )}
                </>
              )}

              {car.is_verified && (
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>
          </div>

          <CardContent className="p-5 cursor-pointer" onClick={() => navigate(`/mobil/${car.id}`)}>
            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
              {car.year} {car.car_brands?.name} {car.title}
            </h3>

            {/* Car details - compact */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3 flex-wrap">
              {car.mileage > 0 && (
                <span className="flex items-center">
                  {car.mileage.toLocaleString()} km
                </span>
              )}
              <span>•</span>
              <span>{car.transmission === 'automatic' ? 'Automatic' : car.transmission === 'manual' ? 'Manual' : 'CVT'}</span>
              <span>•</span>
              <span className="flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {car.location_city}
              </span>
            </div>

            {/* Price - prominent */}
            <div className="mb-3">
              <div className="text-2xl font-bold text-red-600 mb-1">
                Rp{(car.price / 1000000).toFixed(3).replace('.', ',')}.000
              </div>
              {car.market_price && car.market_price > car.price && (
                <div className="text-sm text-gray-600">
                  Rp {((car.market_price - car.price) / 1000000).toFixed(0)}.000.000 (Cash)
                </div>
              )}
            </div>

            {/* Booking Status with Countdown */}
            {isBooked && !countdown.expired && (
              <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-3 mt-3">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-semibold text-orange-800">Sedang Dalam Proses Booking</span>
                </div>
                <div className="text-center">
                  <p className="text-xs text-orange-700 mb-2">Tersedia kembali dalam:</p>
                  <div className="flex justify-center gap-1 text-xs font-mono">
                    {countdown.days > 0 && (
                      <div className="bg-orange-600 text-white rounded px-2 py-1 min-w-[45px]">
                        <div className="font-bold text-base">{countdown.days}</div>
                        <div className="text-[10px]">hari</div>
                      </div>
                    )}
                    <div className="bg-orange-600 text-white rounded px-2 py-1 min-w-[45px]">
                      <div className="font-bold text-base">{countdown.hours.toString().padStart(2, '0')}</div>
                      <div className="text-[10px]">jam</div>
                    </div>
                    <div className="bg-orange-600 text-white rounded px-2 py-1 min-w-[45px]">
                      <div className="font-bold text-base">{countdown.minutes.toString().padStart(2, '0')}</div>
                      <div className="text-[10px]">mnt</div>
                    </div>
                    <div className="bg-orange-600 text-white rounded px-2 py-1 min-w-[45px]">
                      <div className="font-bold text-base">{countdown.seconds.toString().padStart(2, '0')}</div>
                      <div className="text-[10px]">dtk</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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


