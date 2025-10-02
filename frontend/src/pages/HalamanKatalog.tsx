import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
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
  Fuel, 
  Settings, 
  Heart,
  Eye,
  Phone,
  CheckCircle,
  Star,
  ArrowUpDown,
  SlidersHorizontal
} from 'lucide-react';

const HalamanKatalog: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    brand: '',
    priceRange: '',
    year: '',
    condition: '',
    transmission: '',
    fuelType: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');

  // Mock data mobil dengan data yang lebih lengkap
  const cars = [
    {
      id: 1,
      brand: 'Toyota',
      model: 'Avanza',
      variant: '1.3 G MT',
      year: 2023,
      price: 250000000,
      originalPrice: 265000000,
      condition: 'Baru',
      mileage: 0,
      transmission: 'Manual',
      fuelType: 'Bensin',
      location: 'Jakarta Selatan',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop',
      isVerified: true,
      dealer: {
        name: 'Toyota Fatmawati',
        rating: 4.8,
        responseTime: '< 1 jam'
      },
      features: ['ABS', 'Airbag', 'Power Steering', 'AC'],
      views: 1250,
      favorites: 89,
      discount: 6
    },
    {
      id: 2,
      brand: 'Honda',
      model: 'Civic',
      variant: 'RS Turbo CVT',
      year: 2022,
      price: 450000000,
      condition: 'Bekas',
      mileage: 15000,
      transmission: 'CVT',
      fuelType: 'Bensin',
      location: 'Bandung',
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      isVerified: true,
      dealer: {
        name: 'Honda Dago',
        rating: 4.6,
        responseTime: '2 jam'
      },
      features: ['Turbo', 'Sunroof', 'Leather Seats', 'Honda Sensing'],
      views: 890,
      favorites: 156
    },
    {
      id: 3,
      brand: 'Mitsubishi',
      model: 'Xpander',
      variant: 'Ultimate AT',
      year: 2021,
      price: 280000000,
      condition: 'Bekas',
      mileage: 25000,
      transmission: 'Automatic',
      fuelType: 'Bensin',
      location: 'Surabaya',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop',
      isVerified: false,
      dealer: {
        name: 'Mitsubishi Surabaya',
        rating: 4.3,
        responseTime: '3 jam'
      },
      features: ['7 Seater', 'Touchscreen', 'Rear Camera', 'Keyless'],
      views: 567,
      favorites: 43
    },
    {
      id: 4,
      brand: 'Suzuki',
      model: 'Ertiga',
      variant: 'GX AT',
      year: 2023,
      price: 220000000,
      condition: 'Baru',
      mileage: 0,
      transmission: 'Automatic',
      fuelType: 'Bensin',
      location: 'Jakarta Timur',
      image: 'https://images.unsplash.com/photo-1494976688153-ca3ce29d8df4?w=400&h=300&fit=crop',
      isVerified: true,
      dealer: {
        name: 'Suzuki Cakung',
        rating: 4.5,
        responseTime: '1 jam'
      },
      features: ['7 Seater', 'Smart Play', 'ESP', 'Hill Hold'],
      views: 723,
      favorites: 67
    }
  ];

  const brandOptions = [
    { value: 'toyota', label: 'Toyota' },
    { value: 'honda', label: 'Honda' },
    { value: 'mitsubishi', label: 'Mitsubishi' },
    { value: 'suzuki', label: 'Suzuki' },
    { value: 'daihatsu', label: 'Daihatsu' }
  ];

  const priceRangeOptions = [
    { value: '0-100', label: 'Di bawah 100 Juta' },
    { value: '100-200', label: '100 - 200 Juta' },
    { value: '200-300', label: '200 - 300 Juta' },
    { value: '300-500', label: '300 - 500 Juta' },
    { value: '500+', label: 'Di atas 500 Juta' }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const CarCard = ({ car }: { car: any }) => (
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
            src={car.image}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                <Eye className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                <Heart className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {car.isVerified && (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            <Badge variant={car.condition === 'Baru' ? 'default' : 'secondary'}>
              {car.condition}
            </Badge>
          </div>

          {/* Discount badge */}
          {car.discount && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-red-500 hover:bg-red-600 text-white">
                -{car.discount}%
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
              {car.brand} {car.model}
            </h3>
            <p className="text-slate-600 text-sm">{car.variant} • {car.year}</p>
          </div>

          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(car.price)}
              </span>
              {car.originalPrice && (
                <span className="text-sm text-slate-500 line-through">
                  {formatPrice(car.originalPrice)}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm text-slate-600">
              <MapPin className="w-4 h-4 mr-2 text-slate-400" />
              {car.location}
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <Settings className="w-4 h-4 mr-2 text-slate-400" />
              {car.transmission} • {car.fuelType}
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
              <p className="text-sm font-medium text-slate-900">{car.dealer.name}</p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-xs text-slate-600">{car.dealer.rating}</span>
                <span className="text-xs text-slate-400">• {car.dealer.responseTime}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {car.views}
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {car.favorites}
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
              {cars.length} dari 1,234 mobil
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
                    <Select value={filters.brand} onValueChange={(value) => setFilters(prev => ({ ...prev, brand: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Merek" />
                      </SelectTrigger>
                      <SelectContent>
                        {brandOptions.map((brand) => (
                          <SelectItem key={brand.value} value={brand.value}>
                            {brand.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filters.priceRange} onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Rentang Harga" />
                      </SelectTrigger>
                      <SelectContent>
                        {priceRangeOptions.map((price) => (
                          <SelectItem key={price.value} value={price.value}>
                            {price.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Tahun"
                      value={filters.year}
                      onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                      className="h-10"
                    />

                    <Select value={filters.condition} onValueChange={(value) => setFilters(prev => ({ ...prev, condition: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kondisi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baru">Baru</SelectItem>
                        <SelectItem value="bekas">Bekas</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filters.transmission} onValueChange={(value) => setFilters(prev => ({ ...prev, transmission: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Transmisi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="automatic">Automatic</SelectItem>
                        <SelectItem value="cvt">CVT</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filters.fuelType} onValueChange={(value) => setFilters(prev => ({ ...prev, fuelType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Bahan Bakar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bensin">Bensin</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="electric">Electric</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Input placeholder="Kilometer maksimal" className="h-10" />
                    <Input placeholder="Harga minimum" className="h-10" />
                    <Input placeholder="Harga maksimum" className="h-10" />
                    <Input placeholder="Lokasi" className="h-10" />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between items-center mt-6">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
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
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Urutkan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Terbaru</SelectItem>
                      <SelectItem value="price-low">Harga Terendah</SelectItem>
                      <SelectItem value="price-high">Harga Tertinggi</SelectItem>
                      <SelectItem value="year-new">Tahun Terbaru</SelectItem>
                      <SelectItem value="popular">Paling Populer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Car Grid */}
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

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center"
        >
          <Button 
            variant="outline" 
            size="lg" 
            className="px-8 py-3 border-2 hover:bg-blue-50 hover:border-blue-200"
          >
            Muat Lebih Banyak
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default HalamanKatalog;