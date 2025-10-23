import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { wishlistService, type WishlistItemWithCar } from '../services/wishlistService';
import { supabase } from '../lib/supabase';
import { Loader2, Heart, Trash2, Eye, CreditCard, Scale } from 'lucide-react';

interface StateHalaman {
  loading: boolean;
  error: string | null;
  wishlistItems: WishlistItemWithCar[];
  selectedItems: string[];
  showDeleteConfirmation: boolean;
  itemToDelete: string | null;
  sortBy: 'name' | 'price' | 'addedAt' | 'brand';
  sortOrder: 'asc' | 'desc';
  filterBrand: string;
  viewMode: 'grid' | 'list';
}

const HalamanWishlist: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);

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
    viewMode: 'grid'
  });

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setCurrentUser(data.user);
      } else {
        navigate('/login');
      }
    };
    loadUser();
  }, [navigate]);

  // Load wishlist
  const aksesHalamanWishlist = useCallback(async () => {
    if (!currentUser) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

     console.log('Loading wishlist for user:', currentUser.id);
     const wishlistData = await wishlistService.getUserWishlist(currentUser.id);
     console.log('Wishlist data received:', wishlistData);

     setState(prev => ({
       ...prev,
       loading: false,
       wishlistItems: wishlistData
     }));
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal memuat wishlist. Silakan coba lagi.'
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      aksesHalamanWishlist();
    }
  }, [currentUser, aksesHalamanWishlist]);

  // Remove from wishlist
  const pilihMobilUntukDihapus = useCallback((idMobil: string) => {
    setState(prev => ({
      ...prev,
      showDeleteConfirmation: true,
      itemToDelete: idMobil
    }));
  }, []);

  const konfirmasiPenghapusan = useCallback(async (idMobil: string) => {
    if (!currentUser) return;

    try {
      const success = await wishlistService.removeFromWishlist(currentUser.id, idMobil);
      
      if (success) {
        setState(prev => ({
          ...prev,
          wishlistItems: prev.wishlistItems.filter(item => item.car_id !== idMobil),
          showDeleteConfirmation: false,
          itemToDelete: null,
          selectedItems: prev.selectedItems.filter(id => id !== idMobil)
        }));
        alert('Mobil berhasil dihapus dari wishlist');
      } else {
        alert('Gagal menghapus mobil dari wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Terjadi kesalahan saat menghapus dari wishlist');
    }
  }, [currentUser]);

  // Navigate to detail
  const pilihMobilUntukDetail = useCallback((idMobil: string) => {
    navigate(`/mobil/${idMobil}`);
  }, [navigate]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Filter and sort
  const filteredAndSortedItems = state.wishlistItems
    .filter(item => {
      if (!item.cars) return false;
      const matchesBrand = !state.filterBrand || item.cars.car_brands?.name === state.filterBrand;
      return matchesBrand;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (!a.cars || !b.cars) return 0;

      switch (state.sortBy) {
        case 'name':
          comparison = a.cars.title.localeCompare(b.cars.title);
          break;
        case 'price':
          comparison = a.cars.price - b.cars.price;
          break;
        case 'addedAt':
          comparison = new Date(a.added_at).getTime() - new Date(b.added_at).getTime();
          break;
        case 'brand':
          comparison = (a.cars.car_brands?.name || '').localeCompare(b.cars.car_brands?.name || '');
          break;
        default:
          comparison = 0;
      }
      return state.sortOrder === 'asc' ? comparison : -comparison;
    });

  // Handle selection
  const handleItemSelection = useCallback((itemId: string, selected: boolean) => {
    setState(prev => ({
      ...prev,
      selectedItems: selected
        ? [...prev.selectedItems, itemId]
        : prev.selectedItems.filter(id => id !== itemId)
    }));
  }, []);

  const handleSelectAll = useCallback((selectAll: boolean) => {
    setState(prev => ({
      ...prev,
      selectedItems: selectAll ? prev.wishlistItems.map(item => item.car_id) : []
    }));
  }, []);

  // Bulk delete
  const handleBulkDelete = useCallback(async () => {
    if (!currentUser || state.selectedItems.length === 0) return;

    const confirmDelete = window.confirm(
      `Hapus ${state.selectedItems.length} mobil dari wishlist?`
    );
    
    if (confirmDelete) {
      try {
        // Delete all selected items
        await Promise.all(
          state.selectedItems.map(carId => 
            wishlistService.removeFromWishlist(currentUser.id, carId)
          )
        );

        setState(prev => ({
          ...prev,
          wishlistItems: prev.wishlistItems.filter(item => !prev.selectedItems.includes(item.car_id)),
          selectedItems: []
        }));

        alert('Mobil terpilih berhasil dihapus dari wishlist');
      } catch (error) {
        console.error('Error bulk delete:', error);
        alert('Gagal menghapus beberapa mobil');
      }
    }
  }, [currentUser, state.selectedItems]);

  // Loading state
  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat wishlist...</p>
        </div>
      </div>
    );
  }

  // Error state
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

  // Empty wishlist
  if (state.wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Wishlist Saya</h1>
          
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <Heart className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Wishlist Kosong</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Belum ada mobil dalam wishlist Anda. Mulai jelajahi koleksi mobil kami dan simpan favorit Anda.
            </p>
            <button
              onClick={() => navigate('/katalog')}
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="addedAt-desc">Terbaru Ditambahkan</option>
              <option value="addedAt-asc">Terlama Ditambahkan</option>
              <option value="price-asc">Harga Terendah</option>
              <option value="price-desc">Harga Tertinggi</option>
              <option value="brand-asc">Merek A-Z</option>
            </select>

            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
                className={`px-3 py-2 ${state.viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
                className={`px-3 py-2 ${state.viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {state.selectedItems.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {state.selectedItems.length} mobil dipilih
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
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
          {filteredAndSortedItems.map((item) => {
            if (!item.cars) return null;
            const car = item.cars;
            const primaryImage = car.car_images?.find(img => img.is_primary) || car.car_images?.[0];

            return (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow relative"
              >
                {/* Selection checkbox */}
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={state.selectedItems.includes(item.car_id)}
                    onChange={(e) => handleItemSelection(item.car_id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                {/* Car image */}
                <div className="relative">
                  <img
                    src={primaryImage?.image_url || 'https://via.placeholder.com/400x300'}
                    alt={car.title}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => pilihMobilUntukDetail(item.car_id)}
                  />
                  
                  {car.is_featured && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Featured
                      </span>
                    </div>
                  )}
                </div>

                {/* Car details */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 
                        className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => pilihMobilUntukDetail(item.car_id)}
                      >
                        {car.title}
                      </h3>
                      <p className="text-gray-600 text-sm">{car.car_categories?.name} • {car.condition === 'new' ? 'Baru' : 'Bekas'}</p>
                    </div>
                    
                    <button
                      onClick={() => pilihMobilUntukDihapus(item.car_id)}
                      className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(car.price)}
                    </div>
                    {item.saved_price && item.saved_price !== car.price && (
                      <div className="text-sm mt-1">
                        <span className="text-gray-500">Harga saat ditambahkan: </span>
                        <span className="text-gray-600">{formatCurrency(item.saved_price)}</span>
                      </div>
                    )}
                  </div>

                  {/* Basic specs */}
                  <div className="flex flex-wrap gap-2 mb-4 text-sm text-gray-600">
                    <span className="px-2 py-1 bg-gray-100 rounded">{car.transmission?.toUpperCase()}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">{car.fuel_type}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">{car.mileage?.toLocaleString()} km</span>
                  </div>

                  {/* Added date */}
                  <p className="text-xs text-gray-500 mb-4">
                    Ditambahkan {new Date(item.added_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>

                  {/* Notes */}
                  {item.notes && (
                    <div className="mb-4 p-2 bg-yellow-50 rounded text-sm text-gray-700">
                      📝 {item.notes}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => pilihMobilUntukDetail(item.car_id)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Detail
                    </button>
                    <button
                      onClick={() => navigate(`/simulasi?mobil=${item.car_id}`)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center"
                    >
                      <CreditCard className="w-4 h-4 mr-1" />
                      Kredit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {state.showDeleteConfirmation && state.itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <div className="flex items-center mb-4">
              <div className="text-red-500 text-2xl mr-3">⚠️</div>
              <h3 className="text-xl font-bold text-gray-800">Konfirmasi Penghapusan</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus mobil ini dari wishlist?
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
      )}
    </div>
  );
};

export default HalamanWishlist;