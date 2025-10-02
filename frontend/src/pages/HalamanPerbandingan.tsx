import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import KontrollerPerbandingan from '../controllers/KontrollerPerbandingan';

// Helper function to map controller car format to page car format
const mapControllerCarToPageCar = (controllerCar: any): MobilPerbandingan => {
  return {
    id: controllerCar.id,
    name: controllerCar.nama || controllerCar.name || '',
    brand: controllerCar.brand || '',
    model: controllerCar.model || '',
    variant: controllerCar.variant || '',
    year: controllerCar.year || new Date().getFullYear(),
    price: controllerCar.price || controllerCar.harga || 0,
    image: controllerCar.image || controllerCar.gambar || '',
    specifications: controllerCar.specifications || controllerCar.spesifikasi || {
      engine: '',
      transmission: '',
      fuelType: '',
      fuelConsumption: '',
      power: '',
      torque: '',
      acceleration: '',
      topSpeed: '',
      seatingCapacity: 5,
      dimensions: {
        length: 0,
        width: 0,
        height: 0,
        wheelbase: 0
      },
      weight: 0,
      groundClearance: 0,
      fuelTankCapacity: 0
    },
    features: controllerCar.features || controllerCar.fitur || {
      safety: [],
      comfort: [],
      technology: [],
      exterior: [],
      interior: []
    },
    rating: controllerCar.rating || {
      overall: 0,
      safety: 0,
      comfort: 0,
      performance: 0,
      fuelEconomy: 0,
      valueForMoney: 0
    },
    pros: controllerCar.pros || controllerCar.kelebihan || [],
    cons: controllerCar.cons || controllerCar.kekurangan || [],
    availability: controllerCar.availability || controllerCar.ketersediaan || {
      inStock: true,
      estimatedDelivery: '1-2 weeks',
      dealerCount: 1
    }
  };
};

// Interface untuk mobil yang dibandingkan (format halaman)
interface MobilPerbandingan {
  id: string;
  name: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  image: string;
  specifications: {
    engine: string;
    transmission: string;
    fuelType: string;
    fuelConsumption: string;
    power: string;
    torque: string;
    acceleration: string;
    topSpeed: string;
    seatingCapacity: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
      wheelbase: number;
    };
    weight: number;
    groundClearance: number;
    fuelTankCapacity: number;
  };
  features: {
    safety: string[];
    comfort: string[];
    technology: string[];
    exterior: string[];
    interior: string[];
  };
  rating: {
    overall: number;
    safety: number;
    comfort: number;
    performance: number;
    fuelEconomy: number;
    valueForMoney: number;
  };
  pros: string[];
  cons: string[];
  availability: {
    inStock: boolean;
    estimatedDelivery: string;
    dealerCount: number;
  };
}

// Interface untuk hasil perbandingan
interface HasilPerbandingan {
  cars: MobilPerbandingan[];
  winner: {
    overall: string;
    categories: {
      price: string;
      performance: string;
      fuelEconomy: string;
      safety: string;
      comfort: string;
      features: string;
    };
  };
  comparison: {
    [key: string]: {
      car1: any;
      car2: any;
      advantage: 'car1' | 'car2' | 'equal';
    };
  };
  recommendation: string;
  score: {
    car1: number;
    car2: number;
  };
}

// Interface untuk state halaman
interface StateHalaman {
  loading: boolean;
  error: string | null;
  availableCars: MobilPerbandingan[];
  selectedCars: (MobilPerbandingan | null)[];
  comparisonResult: HasilPerbandingan | null;
  showCarSelector: boolean;
  selectorPosition: number; // 0 for first car, 1 for second car
  searchQuery: string;
  filterBrand: string;
  filterPriceRange: [number, number];
  showShareModal: boolean;
  shareUrl: string;
}

const HalamanPerbandingan: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const kontrollerPerbandingan = new KontrollerPerbandingan();

  // State management
  const [state, setState] = useState<StateHalaman>({
    loading: true,
    error: null,
    availableCars: [],
    selectedCars: [null, null],
    comparisonResult: null,
    showCarSelector: false,
    selectorPosition: 0,
    searchQuery: '',
    filterBrand: '',
    filterPriceRange: [0, 2000000000], // 0 to 2 billion
    showShareModal: false,
    shareUrl: ''
  });

  /**
   * Akses halaman perbandingan - memuat data mobil yang tersedia
   */
  const aksesHalamanPerbandingan = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await kontrollerPerbandingan.muatHalamanPerbandingan([], {
        availability: true
      });

      // Map controller MobilPerbandingan to page MobilPerbandingan format
      const mappedCars = result.mobilTersedia.map(car => ({
        id: car.id,
        name: `${car.brand} ${car.model} ${car.variant}`,
        brand: car.brand,
        model: car.model,
        variant: car.variant,
        year: car.year,
        price: car.price,
        image: car.mainImage,
        specifications: {
          engine: `${car.engine.capacity}cc ${car.engine.configuration}`,
          transmission: car.transmission,
          fuelType: car.fuelType,
          fuelConsumption: `${car.performance.fuelConsumption.combined} km/l`,
          power: `${car.engine.power} HP`,
          torque: `${car.engine.torque} Nm`,
          acceleration: `${car.performance.acceleration}s (0-100 km/h)`,
          topSpeed: `${car.performance.topSpeed} km/h`,
          seatingCapacity: typeof car.specifications.seating?.capacity === 'number' ? car.specifications.seating.capacity : 5,
          dimensions: {
            length: car.dimensions.length,
            width: car.dimensions.width,
            height: car.dimensions.height,
            wheelbase: car.dimensions.wheelbase,
          },
          weight: car.dimensions.weight,
          groundClearance: car.dimensions.groundClearance,
          fuelTankCapacity: typeof car.specifications.fuel?.tankCapacity === 'number' ? car.specifications.fuel.tankCapacity : 0,
        },
        features: car.features,
        rating: {
          overall: car.ratings.overall,
          safety: car.ratings.safety,
          comfort: car.ratings.comfort,
          performance: car.ratings.performance,
          fuelEconomy: car.ratings.fuelEconomy,
          valueForMoney: car.ratings.valueForMoney,
        },
        pros: Array.isArray(car.specifications.highlights?.pros) ? car.specifications.highlights.pros : [],
        cons: Array.isArray(car.specifications.highlights?.cons) ? car.specifications.highlights.cons : [],
        availability: {
          inStock: car.availability.inStock,
          estimatedDelivery: car.availability.estimatedDelivery,
          dealerCount: car.availability.locations.length,
        },
      }));

      setState(prev => ({
        ...prev,
        loading: false,
        availableCars: mappedCars
      }));

      // Load cars from URL params if available
      const car1Id = searchParams.get('car1');
      const car2Id = searchParams.get('car2');
      
      if (car1Id || car2Id) {
        const selectedCars: (MobilPerbandingan | null)[] = [null, null];
        
        if (car1Id) {
          const car1 = mappedCars.find(car => car.id === car1Id);
          if (car1) selectedCars[0] = car1;
        }
        
        if (car2Id) {
          const car2 = mappedCars.find(car => car.id === car2Id);
          if (car2) selectedCars[1] = car2;
        }
        
        setState(prev => ({ ...prev, selectedCars }));
        
        // Auto compare if both cars are selected
        if (selectedCars[0] && selectedCars[1]) {
          await performComparison(selectedCars[0], selectedCars[1]);
        }
      }

    } catch (error) {
      console.error('Error accessing comparison page:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal memuat halaman perbandingan. Silakan coba lagi.'
      }));
    }
  }, [searchParams]);

  /**
   * Pilih mobil pertama untuk perbandingan
   * @param idMobil1 - ID mobil pertama yang dipilih
   */
  const pilihMobilPertama = useCallback(async (idMobil1: string) => {
    try {
      const mobil = state.availableCars.find(car => car.id === idMobil1);
      if (!mobil) {
        throw new Error('Mobil tidak ditemukan');
      }

      setState(prev => ({
        ...prev,
        selectedCars: [mobil, prev.selectedCars[1]],
        showCarSelector: false
      }));

      // Update URL params
      const newParams = new URLSearchParams(searchParams);
      newParams.set('car1', idMobil1);
      setSearchParams(newParams);

      // Auto compare if second car is already selected
      if (state.selectedCars[1]) {
        await performComparison(mobil, state.selectedCars[1]);
      }

    } catch (error) {
      console.error('Error selecting first car:', error);
      setState(prev => ({
        ...prev,
        error: 'Gagal memilih mobil pertama. Silakan coba lagi.'
      }));
    }
  }, [state.availableCars, state.selectedCars, searchParams, setSearchParams]);

  /**
   * Pilih mobil kedua untuk perbandingan
   * @param idMobil2 - ID mobil kedua yang dipilih
   */
  const pilihMobilKedua = useCallback(async (idMobil2: string) => {
    try {
      const mobil = state.availableCars.find(car => car.id === idMobil2);
      if (!mobil) {
        throw new Error('Mobil tidak ditemukan');
      }

      setState(prev => ({
        ...prev,
        selectedCars: [prev.selectedCars[0], mobil],
        showCarSelector: false
      }));

      // Update URL params
      const newParams = new URLSearchParams(searchParams);
      newParams.set('car2', idMobil2);
      setSearchParams(newParams);

      // Auto compare if first car is already selected
      if (state.selectedCars[0]) {
        await performComparison(state.selectedCars[0], mobil);
      }

    } catch (error) {
      console.error('Error selecting second car:', error);
      setState(prev => ({
        ...prev,
        error: 'Gagal memilih mobil kedua. Silakan coba lagi.'
      }));
    }
  }, [state.availableCars, state.selectedCars, searchParams, setSearchParams]);

  /**
   * Lihat detail mobil
   * @param idMobil - ID mobil yang akan dilihat detailnya
   */
  const lihatDetailMobil = useCallback((idMobil: string) => {
    // Navigate to car detail page in new tab
    window.open(`/mobil/${idMobil}`, '_blank');
  }, []);

  /**
   * Share perbandingan ke media sosial atau copy link
   */
  const sharePerbandingan = useCallback(async () => {
    try {
      if (!state.selectedCars[0] || !state.selectedCars[1]) {
        alert('Pilih kedua mobil terlebih dahulu untuk membagikan perbandingan');
        return;
      }

      const result = await kontrollerPerbandingan.sharePerbandingan(
        state.selectedCars[0].id,
        state.selectedCars[1].id,
        'link'
      );

      if (result.success && result.shareUrl) {
        setState(prev => ({
          ...prev,
          showShareModal: true,
          shareUrl: result.shareUrl!
        }));
      }

    } catch (error) {
      console.error('Error sharing comparison:', error);
      alert('Gagal membagikan perbandingan. Silakan coba lagi.');
    }
  }, [state.selectedCars]);

  /**
   * Hapus mobil dari perbandingan
   * @param position - Posisi mobil yang akan dihapus (0 atau 1)
   */
  const hapusMobil = useCallback((position?: number) => {
    const positionToRemove = position !== undefined ? position : 
      (state.selectedCars[0] && state.selectedCars[1] ? 
        (Math.random() > 0.5 ? 0 : 1) : 
        (state.selectedCars[0] ? 0 : 1));

    setState(prev => {
      const newSelectedCars = [...prev.selectedCars];
      newSelectedCars[positionToRemove] = null;
      
      return {
        ...prev,
        selectedCars: newSelectedCars as [MobilPerbandingan | null, MobilPerbandingan | null],
        comparisonResult: null
      };
    });

    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (positionToRemove === 0) {
      newParams.delete('car1');
    } else {
      newParams.delete('car2');
    }
    setSearchParams(newParams);
  }, [state.selectedCars, searchParams, setSearchParams]);

  /**
   * Reset perbandingan - hapus semua mobil yang dipilih
   */
  const resetPerbandingan = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedCars: [null, null],
      comparisonResult: null,
      error: null
    }));

    // Clear URL params
    const newParams = new URLSearchParams();
    setSearchParams(newParams);
  }, [setSearchParams]);

  /**
   * Bandingkan lagi dengan keputusan baru
   * @param keputusan - Keputusan atau kriteria perbandingan baru
   */
  const bandingkanLagi = useCallback(async (keputusan: string) => {
    try {
      if (!state.selectedCars[0] || !state.selectedCars[1]) {
        alert('Pilih kedua mobil terlebih dahulu');
        return;
      }

      setState(prev => ({ ...prev, loading: true }));

      // Perform comparison with new criteria
      await performComparison(state.selectedCars[0]!, state.selectedCars[1]!, keputusan);

    } catch (error) {
      console.error('Error comparing again:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal melakukan perbandingan ulang. Silakan coba lagi.'
      }));
    }
  }, [state.selectedCars]);

  /**
   * Perform actual comparison between two cars
   */
  const performComparison = useCallback(async (
    car1: MobilPerbandingan, 
    car2: MobilPerbandingan, 
    criteria?: string
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const controllerResult = await kontrollerPerbandingan.lakukanPerbandingan(
        [car1.id, car2.id],
        {
          prioritas: {
            price: 5,
            performance: 4,
            fuelEconomy: 4,
            safety: 5,
            comfort: 3
          },
          budget: {
            max: 1000000000,
            downPayment: 200000000,
            monthlyPayment: 10000000
          },
          usage: {
            dailyCommute: true,
            familyTrips: true,
            businessUse: false,
            offRoad: false,
            cityDriving: true,
            highwayDriving: false
          },
          preferences: {
            fuelEconomy: 4,
            performance: 4,
            comfort: 3,
            safety: 5,
            technology: 3,
            reliability: 4,
            brandPrestige: 2
          }
        }
      );

      // Convert controller result to page format
      const result: HasilPerbandingan = {
        cars: controllerResult.mobil.map(car => mapControllerCarToPageCar(car)),
        winner: {
          overall: controllerResult.mobil[controllerResult.summary.overall.winner]?.id || '',
          categories: {
            price: controllerResult.mobil[controllerResult.recommendations.bestValue]?.id || '',
            performance: controllerResult.mobil[controllerResult.recommendations.bestPerformance]?.id || '',
            fuelEconomy: controllerResult.mobil[controllerResult.recommendations.bestFuelEconomy]?.id || '',
            safety: controllerResult.mobil[controllerResult.recommendations.bestSafety]?.id || '',
            comfort: controllerResult.mobil[controllerResult.recommendations.bestComfort]?.id || '',
            features: controllerResult.mobil[controllerResult.recommendations.bestOverall]?.id || ''
          }
        },
        comparison: Object.keys(controllerResult.perbandingan).reduce((acc, kategori) => {
          Object.keys(controllerResult.perbandingan[kategori]).forEach(kriteria => {
            const data = controllerResult.perbandingan[kategori][kriteria];
            acc[`${kategori}_${kriteria}`] = {
              car1: data.values[0],
              car2: data.values[1],
              advantage: data.winner === 0 ? 'car1' : data.winner === 1 ? 'car2' : 'equal'
            };
          });
          return acc;
        }, {} as any),
        recommendation: controllerResult.summary.overall.reasons.join('. '),
        score: {
          car1: controllerResult.summary.overall.scores[0] || 0,
          car2: controllerResult.summary.overall.scores[1] || 0
        }
      };

      setState(prev => ({
        ...prev,
        loading: false,
        comparisonResult: result
      }));

    } catch (error) {
      console.error('Error performing comparison:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal melakukan perbandingan. Silakan coba lagi.'
      }));
    }
  }, []);

  /**
   * Handle car selection modal
   */
  const handleCarSelection = useCallback((position: number) => {
    setState(prev => ({
      ...prev,
      showCarSelector: true,
      selectorPosition: position
    }));
  }, []);

  /**
   * Handle car selection from modal
   */
  const handleSelectCar = useCallback((carId: string) => {
    if (state.selectorPosition === 0) {
      pilihMobilPertama(carId);
    } else {
      pilihMobilKedua(carId);
    }
  }, [state.selectorPosition, pilihMobilPertama, pilihMobilKedua]);

  /**
   * Filter available cars based on search and filters
   */
  const filteredCars = state.availableCars.filter(car => {
    const matchesSearch = car.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                         car.brand.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchesBrand = !state.filterBrand || car.brand === state.filterBrand;
    const matchesPrice = car.price >= state.filterPriceRange[0] && car.price <= state.filterPriceRange[1];
    
    return matchesSearch && matchesBrand && matchesPrice;
  });

  /**
   * Copy share URL to clipboard
   */
  const copyShareUrl = useCallback(() => {
    navigator.clipboard.writeText(state.shareUrl).then(() => {
      alert('Link perbandingan berhasil disalin!');
      setState(prev => ({ ...prev, showShareModal: false }));
    });
  }, [state.shareUrl]);

  // Load data on component mount
  useEffect(() => {
    aksesHalamanPerbandingan();
  }, [aksesHalamanPerbandingan]);

  // Render loading state
  if (state.loading && !state.comparisonResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat halaman perbandingan...</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Perbandingan Mobil</h1>
          <p className="text-gray-600">
            Bandingkan spesifikasi, fitur, dan harga mobil untuk membantu keputusan pembelian Anda
          </p>
        </div>

        {/* Car Selection Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Car 1 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Mobil Pertama</h3>
            {state.selectedCars[0] ? (
              <div className="space-y-4">
                <img
                  src={state.selectedCars[0].image}
                  alt={state.selectedCars[0].name}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{state.selectedCars[0].name}</h4>
                  <p className="text-gray-600">{state.selectedCars[0].brand} {state.selectedCars[0].model}</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    Rp {state.selectedCars[0].price.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => lihatDetailMobil(state.selectedCars[0]!.id)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Lihat Detail
                  </button>
                  <button
                    onClick={() => hapusMobil(0)}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🚗</div>
                <p className="text-gray-500 mb-4">Pilih mobil pertama untuk dibandingkan</p>
                <button
                  onClick={() => handleCarSelection(0)}
                  className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Pilih Mobil
                </button>
              </div>
            )}
          </div>

          {/* Car 2 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Mobil Kedua</h3>
            {state.selectedCars[1] ? (
              <div className="space-y-4">
                <img
                  src={state.selectedCars[1].image}
                  alt={state.selectedCars[1].name}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{state.selectedCars[1].name}</h4>
                  <p className="text-gray-600">{state.selectedCars[1].brand} {state.selectedCars[1].model}</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    Rp {state.selectedCars[1].price.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => lihatDetailMobil(state.selectedCars[1]!.id)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Lihat Detail
                  </button>
                  <button
                    onClick={() => hapusMobil(1)}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🚗</div>
                <p className="text-gray-500 mb-4">Pilih mobil kedua untuk dibandingkan</p>
                <button
                  onClick={() => handleCarSelection(1)}
                  className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Pilih Mobil
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {(state.selectedCars[0] || state.selectedCars[1]) && (
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            {state.selectedCars[0] && state.selectedCars[1] && (
              <>
                <button
                  onClick={sharePerbandingan}
                  className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span>Bagikan Perbandingan</span>
                </button>
                <button
                  onClick={() => bandingkanLagi('detailed')}
                  className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Bandingkan Lagi
                </button>
              </>
            )}
            <button
              onClick={resetPerbandingan}
              className="bg-gray-600 text-white py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reset Perbandingan
            </button>
          </div>
        )}

        {/* Comparison Result */}
        {state.comparisonResult && (
          <div className="space-y-6">
            {/* Winner Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Hasil Perbandingan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {state.comparisonResult.score.car1}%
                  </div>
                  <p className="text-gray-600">{state.selectedCars[0]?.name}</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {state.comparisonResult.score.car2}%
                  </div>
                  <p className="text-gray-600">{state.selectedCars[1]?.name}</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Rekomendasi:</h4>
                <p className="text-green-700">{state.comparisonResult.recommendation}</p>
              </div>
            </div>

            {/* Detailed Comparison */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Perbandingan Detail</h3>
              
              {/* Specifications Comparison */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Spesifikasi</th>
                      <th className="text-center py-3 px-4">{state.selectedCars[0]?.name}</th>
                      <th className="text-center py-3 px-4">{state.selectedCars[1]?.name}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Harga</td>
                      <td className="py-3 px-4 text-center">
                        Rp {state.selectedCars[0]?.price.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        Rp {state.selectedCars[1]?.price.toLocaleString('id-ID')}
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Mesin</td>
                      <td className="py-3 px-4 text-center">{state.selectedCars[0]?.specifications.engine}</td>
                      <td className="py-3 px-4 text-center">{state.selectedCars[1]?.specifications.engine}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Transmisi</td>
                      <td className="py-3 px-4 text-center">{state.selectedCars[0]?.specifications.transmission}</td>
                      <td className="py-3 px-4 text-center">{state.selectedCars[1]?.specifications.transmission}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Konsumsi BBM</td>
                      <td className="py-3 px-4 text-center">{state.selectedCars[0]?.specifications.fuelConsumption}</td>
                      <td className="py-3 px-4 text-center">{state.selectedCars[1]?.specifications.fuelConsumption}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Tenaga</td>
                      <td className="py-3 px-4 text-center">{state.selectedCars[0]?.specifications.power}</td>
                      <td className="py-3 px-4 text-center">{state.selectedCars[1]?.specifications.power}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4 font-medium">Kapasitas Tempat Duduk</td>
                      <td className="py-3 px-4 text-center">{state.selectedCars[0]?.specifications.seatingCapacity} orang</td>
                      <td className="py-3 px-4 text-center">{state.selectedCars[1]?.specifications.seatingCapacity} orang</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Ratings Comparison */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4">Rating Perbandingan</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['safety', 'comfort', 'performance', 'fuelEconomy', 'valueForMoney'].map((category) => {
                    const categoryKey = category as keyof MobilPerbandingan['rating'];
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="capitalize">{category.replace(/([A-Z])/g, ' $1')}</span>
                        </div>
                        <div className="flex space-x-4">
                          <div className="flex-1">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ 
                                  width: `${(state.selectedCars[0]?.rating[categoryKey] || 0) * 20}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {(state.selectedCars[0]?.rating[categoryKey] || 0)}/5
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ 
                                  width: `${(state.selectedCars[1]?.rating[categoryKey] || 0) * 20}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">
                              {(state.selectedCars[1]?.rating[categoryKey] || 0)}/5
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Car Selector Modal */}
        {state.showCarSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">
                    Pilih Mobil {state.selectorPosition === 0 ? 'Pertama' : 'Kedua'}
                  </h3>
                  <button
                    onClick={() => setState(prev => ({ ...prev, showCarSelector: false }))}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Search and Filter */}
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="Cari mobil..."
                    value={state.searchQuery}
                    onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={state.filterBrand}
                    onChange={(e) => setState(prev => ({ ...prev, filterBrand: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Semua Merek</option>
                    {Array.from(new Set(state.availableCars.map(car => car.brand))).map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCars.map((car) => (
                    <div
                      key={car.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
                      onClick={() => handleSelectCar(car.id)}
                    >
                      <img
                        src={car.image}
                        alt={car.name}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <h4 className="font-semibold text-gray-800">{car.name}</h4>
                      <p className="text-sm text-gray-600">{car.brand} {car.model}</p>
                      <p className="text-lg font-bold text-blue-600 mt-2">
                        Rp {car.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {state.showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Bagikan Perbandingan</h3>
                  <button
                    onClick={() => setState(prev => ({ ...prev, showShareModal: false }))}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Link Perbandingan
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        value={state.shareUrl}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50"
                      />
                      <button
                        onClick={copyShareUrl}
                        className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors"
                      >
                        Salin
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(state.shareUrl)}`, '_blank')}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Facebook
                    </button>
                    <button
                      onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(state.shareUrl)}`, '_blank')}
                      className="flex-1 bg-sky-500 text-white py-2 px-4 rounded-lg hover:bg-sky-600 transition-colors"
                    >
                      Twitter
                    </button>
                    <button
                      onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(state.shareUrl)}`, '_blank')}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HalamanPerbandingan;