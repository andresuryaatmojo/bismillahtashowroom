import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Interface untuk mobil dalam wishlist
interface MobilWishlist {
  id: string;
  name: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images: string[];
  specifications: {
    engine: string;
    transmission: string;
    fuelType: string;
    fuelConsumption: string;
    seatingCapacity: number;
  };
  features: string[];
  rating: number;
  reviewCount: number;
  availability: {
    inStock: boolean;
    estimatedDelivery: string;
    dealerCount: number;
  };
  addedAt: string;
  tags: string[];
  isPromoted: boolean;
  dealerInfo: {
    name: string;
    location: string;
    contact: string;
  };
}

// Interface untuk aksi lain yang tersedia
interface AksiLain {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  color: string;
}

// Interface untuk state halaman
interface StateHalaman {
  loading: boolean;
  error: string | null;
  wishlistItems: MobilWishlist[];
  selectedItems: string[];
  showDeleteConfirmation: boolean;
  itemToDelete: string | null;
  sortBy: 'name' | 'price' | 'addedAt' | 'brand';
  sortOrder: 'asc' | 'desc';
  filterBrand: string;
  filterPriceRange: [number, number];
  showFilters: boolean;
  viewMode: 'grid' | 'list';
  showBulkActions: boolean;
}

const HalamanWishlist: React.FC = () => {
  const navigate = useNavigate();

  // State management
  const [state, setState] = useState<StateHalaman>({
    loading: true,
    error: null,
    wishlistItems: [],
    selectedItems: [],
    showDeleteConfirmation: false,
    itemToDelete: null,
    sortBy: 'addedAt',
    sortOrder: 'desc',
    filterBrand: '',
    filterPriceRange: [0, 2000000000],
    showFilters: false,
    viewMode: 'grid',
    showBulkActions: false
  });

  /**
   * Akses halaman wishlist - memuat daftar mobil dalam wishlist
   */
  const aksesHalamanWishlist = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Simulate API call to load wishlist
      // In real implementation, this would call a wishlist controller
      const mockWishlistData: MobilWishlist[] = [
        {
          id: '1',
          name: 'Toyota Avanza 1.3 G MT',
          brand: 'Toyota',
          model: 'Avanza',
          variant: '1.3 G MT',
          year: 2024,
          price: 235000000,
          originalPrice: 245000000,
          discount: 10000000,
          image: '/images/cars/avanza-1.jpg',
          images: ['/images/cars/avanza-1.jpg', '/images/cars/avanza-2.jpg'],
          specifications: {
            engine: '1.3L DOHC VVT-i',
            transmission: 'Manual 5-Speed',
            fuelType: 'Bensin',
            fuelConsumption: '13.4 km/l',
            seatingCapacity: 7
          },
          features: ['ABS', 'Airbag', 'Power Steering', 'AC'],
          rating: 4.2,
          reviewCount: 156,
          availability: {
            inStock: true,
            estimatedDelivery: '2-3 minggu',
            dealerCount: 15
          },
          addedAt: '2024-01-15T10:30:00Z',
          tags: ['MPV', 'Keluarga', 'Ekonomis'],
          isPromoted: false,
          dealerInfo: {
            name: 'Toyota Sunter',
            location: 'Jakarta Utara',
            contact: '021-1234567'
          }
        },
        {
          id: '2',
          name: 'Honda Brio RS CVT',
          brand: 'Honda',
          model: 'Brio',
          variant: 'RS CVT',
          year: 2024,
          price: 185000000,
          image: '/images/cars/brio-1.jpg',
          images: ['/images/cars/brio-1.jpg', '/images/cars/brio-2.jpg'],
          specifications: {
            engine: '1.2L i-VTEC',
            transmission: 'CVT',
            fuelType: 'Bensin',
            fuelConsumption: '17.8 km/l',
            seatingCapacity: 5
          },
          features: ['Honda SENSING', 'Touchscreen', 'Keyless Entry'],
          rating: 4.5,
          reviewCount: 89,
          availability: {
            inStock: false,
            estimatedDelivery: '4-6 minggu',
            dealerCount: 8
          },
          addedAt: '2024-01-10T14:20:00Z',
          tags: ['Hatchback', 'Irit', 'Compact'],
          isPromoted: true,
          dealerInfo: {
            name: 'Honda Kelapa Gading',
            location: 'Jakarta Utara',
            contact: '021-9876543'
          }
        }
      ];

      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setState(prev => ({
        ...prev,
        loading: false,
        wishlistItems: mockWishlistData
      }));

    } catch (error) {
      console.error('Error accessing wishlist:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal memuat wishlist. Silakan coba lagi.'
      }));
    }
  }, []);

  /**
   * Pilih dan simpan mobil ke wishlist
   * @param idMobil - ID mobil yang akan disimpan
   */
  const pilihDanSimpanMobil = useCallback(async (idMobil: string) => {
    try {
      // Check if car is already in wishlist
      const isAlreadyInWishlist = state.wishlistItems.some(item => item.id === idMobil);
      
      if (isAlreadyInWishlist) {
        alert('Mobil sudah ada dalam wishlist');
        return;
      }

      // Simulate API call to add car to wishlist
      // In real implementation, this would call a wishlist controller
      const mockCarData: MobilWishlist = {
        id: idMobil,
        name: 'New Car Added',
        brand: 'Brand',
        model: 'Model',
        variant: 'Variant',
        year: 2024,
        price: 200000000,
        image: '/images/cars/default.jpg',
        images: ['/images/cars/default.jpg'],
        specifications: {
          engine: '1.5L',
          transmission: 'Manual',
          fuelType: 'Bensin',
          fuelConsumption: '15 km/l',
          seatingCapacity: 5
        },
        features: ['Basic Features'],
        rating: 4.0,
        reviewCount: 0,
        availability: {
          inStock: true,
          estimatedDelivery: '2-3 minggu',
          dealerCount: 5
        },
        addedAt: new Date().toISOString(),
        tags: ['New'],
        isPromoted: false,
        dealerInfo: {
          name: 'Dealer Name',
          location: 'Location',
          contact: '021-0000000'
        }
      };

      setState(prev => ({
        ...prev,
        wishlistItems: [mockCarData, ...prev.wishlistItems]
      }));

      alert('Mobil berhasil ditambahkan ke wishlist');

    } catch (error) {
      console.error('Error adding car to wishlist:', error);
      alert('Gagal menambahkan mobil ke wishlist. Silakan coba lagi.');
    }
  }, [state.wishlistItems]);

  /**
   * Pilih mobil untuk dihapus dari wishlist
   * @param idMobil - ID mobil yang akan dihapus
   */
  const pilihMobilUntukDihapus = useCallback((idMobil: string) => {
    setState(prev => ({
      ...prev,
      showDeleteConfirmation: true,
      itemToDelete: idMobil
    }));
  }, []);

  /**
   * Konfirmasi penghapusan mobil dari wishlist
   * @param idMobil - ID mobil yang dikonfirmasi untuk dihapus
   */
  const konfirmasiPenghapusan = useCallback(async (idMobil: string) => {
    try {
      // Simulate API call to remove car from wishlist
      setState(prev => ({
        ...prev,
        wishlistItems: prev.wishlistItems.filter(item => item.id !== idMobil),
        showDeleteConfirmation: false,
        itemToDelete: null,
        selectedItems: prev.selectedItems.filter(id => id !== idMobil)
      }));

      alert('Mobil berhasil dihapus dari wishlist');

    } catch (error) {
      console.error('Error removing car from wishlist:', error);
      alert('Gagal menghapus mobil dari wishlist. Silakan coba lagi.');
    }
  }, []);

  /**
   * Pilih mobil untuk melihat detail
   * @param idMobil - ID mobil yang akan dilihat detailnya
   */
  const pilihMobilUntukDetail = useCallback((idMobil: string) => {
    navigate(`/mobil/${idMobil}`);
  }, [navigate]);

  /**
   * Cek aksi lain yang tersedia
   */
  const cekAksiLain = useCallback((): AksiLain[] => {
    return [
      {
        id: 'compare',
        title: 'Bandingkan Mobil',
        description: 'Bandingkan mobil dalam wishlist',
        icon: '⚖️',
        action: () => {
          if (state.selectedItems.length >= 2) {
            navigate(`/perbandingan?car1=${state.selectedItems[0]}&car2=${state.selectedItems[1]}`);
          } else {
            alert('Pilih minimal 2 mobil untuk dibandingkan');
          }
        },
        color: 'blue'
      },
      {
        id: 'share',
        title: 'Bagikan Wishlist',
        description: 'Bagikan wishlist ke teman',
        icon: '📤',
        action: () => {
          const shareUrl = `${window.location.origin}/wishlist/shared`;
          navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Link wishlist berhasil disalin!');
          });
        },
        color: 'green'
      },
      {
        id: 'export',
        title: 'Ekspor ke PDF',
        description: 'Unduh wishlist sebagai PDF',
        icon: '📄',
        action: () => {
          // Simulate PDF export
          alert('Fitur ekspor PDF akan segera tersedia');
        },
        color: 'purple'
      },
      {
        id: 'notification',
        title: 'Notifikasi Harga',
        description: 'Dapatkan notifikasi perubahan harga',
        icon: '🔔',
        action: () => {
          alert('Notifikasi harga telah diaktifkan untuk semua mobil dalam wishlist');
        },
        color: 'orange'
      },
      {
        id: 'financing',
        title: 'Simulasi Kredit',
        description: 'Hitung simulasi kredit mobil',
        icon: '💰',
        action: () => {
          if (state.selectedItems.length === 1) {
            navigate(`/simulasi?mobil=${state.selectedItems[0]}`);
          } else {
            alert('Pilih satu mobil untuk simulasi kredit');
          }
        },
        color: 'indigo'
      },
      {
        id: 'dealer',
        title: 'Cari Dealer Terdekat',
        description: 'Temukan dealer terdekat',
        icon: '📍',
        action: () => {
          navigate('/dealer');
        },
        color: 'red'
      }
    ];
  }, [state.selectedItems, navigate]);

  /**
   * Handle bulk actions
   */
  const handleBulkAction = useCallback((action: string) => {
    switch (action) {
      case 'delete':
        if (state.selectedItems.length === 0) {
          alert('Pilih mobil yang akan dihapus');
          return;
        }
        const confirmDelete = window.confirm(
          `Hapus ${state.selectedItems.length} mobil dari wishlist?`
        );
        if (confirmDelete) {
          setState(prev => ({
            ...prev,
            wishlistItems: prev.wishlistItems.filter(item => !prev.selectedItems.includes(item.id)),
            selectedItems: []
          }));
          alert('Mobil terpilih berhasil dihapus dari wishlist');
        }
        break;
      case 'compare':
        if (state.selectedItems.length !== 2) {
          alert('Pilih tepat 2 mobil untuk dibandingkan');
          return;
        }
        navigate(`/perbandingan?car1=${state.selectedItems[0]}&car2=${state.selectedItems[1]}`);
        break;
      default:
        break;
    }
  }, [state.selectedItems, navigate]);

  /**
   * Handle item selection
   */
  const handleItemSelection = useCallback((itemId: string, selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedItems: selected
        ? [...prev.selectedItems, itemId]
        : prev.selectedItems.filter(id => id !== itemId)
    }));
  }, []);

  /**
   * Handle select all
   */
  const handleSelectAll = useCallback((selectAll: boolean) => {
    setState(prev => ({
      ...prev,
      selectedItems: selectAll ? prev.wishlistItems.map(item => item.id) : []
    }));
  }, []);

  /**
   * Filter and sort wishlist items
   */
  const filteredAndSortedItems = state.wishlistItems
    .filter(item => {
      const matchesBrand = !state.filterBrand || item.brand === state.filterBrand;
      const matchesPrice = item.price >= state.filterPriceRange[0] && item.price <= state.filterPriceRange[1];
      return matchesBrand && matchesPrice;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (state.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'addedAt':
          comparison = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
          break;
        case 'brand':
          comparison = a.brand.localeCompare(b.brand);
          break;
        default:
          comparison = 0;
      }
      return state.sortOrder === 'asc' ? comparison : -comparison;
    });

  // Load wishlist on component mount
  useEffect(() => {
    aksesHalamanWishlist();
  }, [aksesHalamanWishlist]);

  // Render loading state
  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat wishlist...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-4">{state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  // Render empty wishlist
  if (state.wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Wishlist Saya</h1>
          
          <div className="text-center py-16">
            <div className="text-gray-400 text-8xl mb-6">💝</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Wishlist Kosong</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Belum ada mobil dalam wishlist Anda. Mulai jelajahi koleksi mobil kami dan simpan favorit Anda.
            </p>
            <button
              onClick={() => navigate('/mobil')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg"
            >
              Jelajahi Mobil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Wishlist Saya</h1>
            <p className="text-gray-600 mt-2">
              {state.wishlistItems.length} mobil dalam wishlist
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => setState(prev => ({ ...prev, showFilters: !prev.showFilters }))}
              className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
              </svg>
              <span>Filter</span>
            </button>
            
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
                className={`px-3 py-2 ${state.viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/>
                </svg>
              </button>
              <button
                onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
                className={`px-3 py-2 ${state.viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {state.showFilters && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Urutkan</label>
                <select
                  value={`${state.sortBy}-${state.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    setState(prev => ({
                      ...prev,
                      sortBy: sortBy as any,
                      sortOrder: sortOrder as any
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="addedAt-desc">Terbaru Ditambahkan</option>
                  <option value="addedAt-asc">Terlama Ditambahkan</option>
                  <option value="name-asc">Nama A-Z</option>
                  <option value="name-desc">Nama Z-A</option>
                  <option value="price-asc">Harga Terendah</option>
                  <option value="price-desc">Harga Tertinggi</option>
                  <option value="brand-asc">Merek A-Z</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Merek</label>
                <select
                  value={state.filterBrand}
                  onChange={(e) => setState(prev => ({ ...prev, filterBrand: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Merek</option>
                  {Array.from(new Set(state.wishlistItems.map(item => item.brand))).map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rentang Harga</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={state.filterPriceRange[0]}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      filterPriceRange: [parseInt(e.target.value) || 0, prev.filterPriceRange[1]]
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={state.filterPriceRange[1]}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      filterPriceRange: [prev.filterPriceRange[0], parseInt(e.target.value) || 2000000000]
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {state.selectedItems.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-blue-800 font-medium">
                  {state.selectedItems.length} mobil dipilih
                </span>
                <button
                  onClick={() => handleSelectAll(false)}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Batal Pilih Semua
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('compare')}
                  disabled={state.selectedItems.length !== 2}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Bandingkan
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Select All */}
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="selectAll"
            checked={state.selectedItems.length === filteredAndSortedItems.length && filteredAndSortedItems.length > 0}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="selectAll" className="ml-2 text-sm text-gray-700">
            Pilih Semua ({filteredAndSortedItems.length} mobil)
          </label>
        </div>

        {/* Wishlist Items */}
        <div className={`grid gap-6 mb-8 ${
          state.viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredAndSortedItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
                state.viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Selection checkbox */}
              <div className="absolute top-4 left-4 z-10">
                <input
                  type="checkbox"
                  checked={state.selectedItems.includes(item.id)}
                  onChange={(e) => handleItemSelection(item.id, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              {/* Promoted badge */}
              {item.isPromoted && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Promo
                  </span>
                </div>
              )}

              {/* Car image */}
              <div className={`relative ${state.viewMode === 'list' ? 'w-64 flex-shrink-0' : ''}`}>
                <img
                  src={item.image}
                  alt={item.name}
                  className={`object-cover cursor-pointer ${
                    state.viewMode === 'list' ? 'w-full h-48' : 'w-full h-48'
                  }`}
                  onClick={() => pilihMobilUntukDetail(item.id)}
                />
                
                {/* Availability indicator */}
                <div className="absolute bottom-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.availability.inStock
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.availability.inStock ? 'Tersedia' : 'Pre-Order'}
                  </span>
                </div>
              </div>

              {/* Car details */}
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 
                      className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => pilihMobilUntukDetail(item.id)}
                    >
                      {item.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{item.brand} • {item.year}</p>
                  </div>
                  
                  <button
                    onClick={() => pilihMobilUntukDihapus(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Price */}
                <div className="mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-blue-600">
                      Rp {item.price.toLocaleString('id-ID')}
                    </span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-sm text-gray-500 line-through">
                        Rp {item.originalPrice.toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                  {item.discount && (
                    <span className="text-sm text-green-600 font-medium">
                      Hemat Rp {item.discount.toLocaleString('id-ID')}
                    </span>
                  )}
                </div>

                {/* Specifications */}
                <div className="mb-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mesin:</span>
                    <span className="text-gray-800">{item.specifications.engine}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Transmisi:</span>
                    <span className="text-gray-800">{item.specifications.transmission}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Konsumsi BBM:</span>
                    <span className="text-gray-800">{item.specifications.fuelConsumption}</span>
                  </div>
                </div>

                {/* Rating and reviews */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {item.rating} ({item.reviewCount} ulasan)
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Added date */}
                <p className="text-xs text-gray-500 mb-4">
                  Ditambahkan {new Date(item.addedAt).toLocaleDateString('id-ID')}
                </p>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => pilihMobilUntukDetail(item.id)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Lihat Detail
                  </button>
                  <button
                    onClick={() => navigate(`/simulasi?mobil=${item.id}`)}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Simulasi Kredit
                  </button>
                </div>

                {/* Dealer info */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-800">{item.dealerInfo.name}</p>
                      <p className="text-gray-600">{item.dealerInfo.location}</p>
                    </div>
                    <button
                      onClick={() => window.open(`tel:${item.dealerInfo.contact}`)}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Other Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Aksi Lainnya</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cekAksiLain().map((aksi) => (
              <button
                key={aksi.id}
                onClick={aksi.action}
                className={`p-4 rounded-lg border-2 border-dashed border-${aksi.color}-300 hover:border-${aksi.color}-500 hover:bg-${aksi.color}-50 transition-colors text-left`}
              >
                <div className="text-2xl mb-2">{aksi.icon}</div>
                <h4 className={`font-semibold text-${aksi.color}-800 mb-1`}>{aksi.title}</h4>
                <p className={`text-sm text-${aksi.color}-600`}>{aksi.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {state.showDeleteConfirmation && state.itemToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="text-red-500 text-2xl mr-3">⚠️</div>
                  <h3 className="text-xl font-bold text-gray-800">Konfirmasi Penghapusan</h3>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Apakah Anda yakin ingin menghapus mobil ini dari wishlist? Tindakan ini tidak dapat dibatalkan.
                </p>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setState(prev => ({ 
                      ...prev, 
                      showDeleteConfirmation: false, 
                      itemToDelete: null 
                    }))}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => konfirmasiPenghapusan(state.itemToDelete!)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HalamanWishlist;