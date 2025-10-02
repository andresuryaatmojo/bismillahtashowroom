import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Interface untuk data mobil
interface DataMobil {
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
    fuel: string;
    seats: number;
  };
  dealer: {
    id: string;
    name: string;
    location: string;
    contact: string;
  };
}

// Interface untuk parameter kredit
interface ParameterKredit {
  hargaMobil: number;
  uangMuka: number;
  tenor: number; // dalam bulan
  bungaPerTahun: number;
  asuransi: boolean;
  biayaAdmin: number;
  biayaProvisi: number;
}

// Interface untuk hasil simulasi
interface HasilSimulasi {
  id: string;
  tanggalSimulasi: string;
  mobil: DataMobil;
  parameter: ParameterKredit;
  perhitungan: {
    pokokPinjaman: number;
    totalBunga: number;
    totalAsuransi: number;
    totalBiaya: number;
    cicilanPerBulan: number;
    totalPembayaran: number;
  };
  jadwalCicilan: {
    bulan: number;
    pokok: number;
    bunga: number;
    sisaPokok: number;
    totalCicilan: number;
  }[];
}

// Interface untuk rekomendasi mobil
interface RekomendasiMobil {
  mobil: DataMobil;
  score: number;
  alasan: string[];
  simulasi: HasilSimulasi;
}

// Interface untuk kontak dealer
interface KontakDealer {
  dealerId: string;
  nama: string;
  telepon: string;
  email: string;
  alamat: string;
  salesPerson: string;
  jamOperasional: string;
}

// Interface untuk state halaman
interface StateHalaman {
  loading: boolean;
  error: string | null;
  activeStep: 'menu' | 'input-manual' | 'input-parameter' | 'pilih-katalog' | 'hasil' | 'rekomendasi';
  mobilTerpilih: DataMobil | null;
  dataManual: {
    harga: number;
    merk: string;
    model: string;
  };
  parameterKredit: ParameterKredit;
  hasilSimulasi: HasilSimulasi | null;
  daftarMobil: DataMobil[];
  rekomendasiMobil: RekomendasiMobil[];
  budgetMaksimal: number;
  showShareModal: boolean;
  showContactModal: boolean;
  kontakDealer: KontakDealer | null;
  savedSimulations: HasilSimulasi[];
}

const HalamanSimulasi: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mobilId = searchParams.get('mobil');

  // State management
  const [state, setState] = useState<StateHalaman>({
    loading: false,
    error: null,
    activeStep: 'menu',
    mobilTerpilih: null,
    dataManual: {
      harga: 0,
      merk: '',
      model: ''
    },
    parameterKredit: {
      hargaMobil: 0,
      uangMuka: 0,
      tenor: 36,
      bungaPerTahun: 8.5,
      asuransi: true,
      biayaAdmin: 1500000,
      biayaProvisi: 0
    },
    hasilSimulasi: null,
    daftarMobil: [],
    rekomendasiMobil: [],
    budgetMaksimal: 0,
    showShareModal: false,
    showContactModal: false,
    kontakDealer: null,
    savedSimulations: []
  });

  /**
   * Akses menu simulasi kredit
   */
  const aksesMenuSimulasiKredit = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null, activeStep: 'menu' }));

      // Load saved simulations
      const savedSims = localStorage.getItem('savedSimulations');
      const parsedSims = savedSims ? JSON.parse(savedSims) : [];

      // If mobilId is provided, load car data and go to parameter input
      if (mobilId) {
        // Simulate API call to get car data
        const mockCarData: DataMobil = {
          id: mobilId,
          name: 'Toyota Avanza 1.3 G MT',
          brand: 'Toyota',
          model: 'Avanza',
          variant: '1.3 G MT',
          year: 2024,
          price: 235000000,
          image: '/images/cars/avanza-1.jpg',
          specifications: {
            engine: '1.3L DOHC VVT-i',
            transmission: 'Manual 5-Speed',
            fuel: 'Bensin',
            seats: 7
          },
          dealer: {
            id: '1',
            name: 'Toyota Sunter',
            location: 'Jakarta Utara',
            contact: '021-1234567'
          }
        };

        setState(prev => ({
          ...prev,
          loading: false,
          mobilTerpilih: mockCarData,
          parameterKredit: {
            ...prev.parameterKredit,
            hargaMobil: mockCarData.price
          },
          activeStep: 'input-parameter',
          savedSimulations: parsedSims
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          savedSimulations: parsedSims
        }));
      }

    } catch (error) {
      console.error('Error accessing simulation menu:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal memuat menu simulasi. Silakan coba lagi.'
      }));
    }
  }, [mobilId]);

  /**
   * Input data mobil manual
   * @param harga - Harga mobil
   * @param merk - Merk mobil
   * @param model - Model mobil
   */
  const inputDataMobilManual = useCallback(async (harga: number, merk: string, model: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Validate input
      if (!harga || !merk || !model) {
        throw new Error('Mohon lengkapi semua data mobil');
      }

      if (harga < 50000000 || harga > 2000000000) {
        throw new Error('Harga mobil harus antara Rp 50 juta - Rp 2 miliar');
      }

      // Update state with manual car data
      const manualCarData: DataMobil = {
        id: 'manual-' + Date.now(),
        name: `${merk} ${model}`,
        brand: merk,
        model: model,
        variant: 'Manual Input',
        year: new Date().getFullYear(),
        price: harga,
        image: '/images/cars/default.jpg',
        specifications: {
          engine: 'N/A',
          transmission: 'N/A',
          fuel: 'N/A',
          seats: 5
        },
        dealer: {
          id: 'manual',
          name: 'Input Manual',
          location: 'N/A',
          contact: 'N/A'
        }
      };

      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prev => ({
        ...prev,
        loading: false,
        mobilTerpilih: manualCarData,
        dataManual: { harga, merk, model },
        parameterKredit: {
          ...prev.parameterKredit,
          hargaMobil: harga
        },
        activeStep: 'input-parameter'
      }));

    } catch (error) {
      console.error('Error inputting manual car data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Gagal menyimpan data mobil. Silakan coba lagi.'
      }));
    }
  }, []);

  /**
   * Input parameter kredit
   * @param dp - Uang muka
   * @param tenor - Tenor dalam bulan
   * @param bunga - Bunga per tahun
   */
  const inputParameterKredit = useCallback(async (dp: number, tenor: number, bunga: number) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Validate parameters
      if (!state.mobilTerpilih) {
        throw new Error('Pilih mobil terlebih dahulu');
      }

      const hargaMobil = state.mobilTerpilih.price;
      const minDP = hargaMobil * 0.1; // Minimum 10%
      const maxDP = hargaMobil * 0.8; // Maximum 80%

      if (dp < minDP || dp > maxDP) {
        throw new Error(`Uang muka harus antara ${minDP.toLocaleString('id-ID')} - ${maxDP.toLocaleString('id-ID')}`);
      }

      if (tenor < 12 || tenor > 84) {
        throw new Error('Tenor harus antara 12 - 84 bulan');
      }

      if (bunga < 3 || bunga > 25) {
        throw new Error('Bunga harus antara 3% - 25% per tahun');
      }

      // Update parameter kredit
      const updatedParameter: ParameterKredit = {
        hargaMobil,
        uangMuka: dp,
        tenor,
        bungaPerTahun: bunga,
        asuransi: state.parameterKredit.asuransi,
        biayaAdmin: state.parameterKredit.biayaAdmin,
        biayaProvisi: hargaMobil * 0.01 // 1% dari harga mobil
      };

      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prev => ({
        ...prev,
        loading: false,
        parameterKredit: updatedParameter
      }));

      // Automatically calculate simulation
      await hitungSimulasi(updatedParameter);

    } catch (error) {
      console.error('Error inputting credit parameters:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Gagal menyimpan parameter kredit. Silakan coba lagi.'
      }));
    }
  }, [state.mobilTerpilih, state.parameterKredit]);

  /**
   * Pilih mobil dari katalog
   * @param idMobil - ID mobil yang dipilih
   */
  const pilihMobilDariKatalog = useCallback(async (idMobil: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Load car catalog if not loaded
      if (state.daftarMobil.length === 0) {
        const mockCars: DataMobil[] = [
          {
            id: '1',
            name: 'Toyota Avanza 1.3 G MT',
            brand: 'Toyota',
            model: 'Avanza',
            variant: '1.3 G MT',
            year: 2024,
            price: 235000000,
            image: '/images/cars/avanza-1.jpg',
            specifications: {
              engine: '1.3L DOHC VVT-i',
              transmission: 'Manual 5-Speed',
              fuel: 'Bensin',
              seats: 7
            },
            dealer: {
              id: '1',
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
            specifications: {
              engine: '1.2L i-VTEC',
              transmission: 'CVT',
              fuel: 'Bensin',
              seats: 5
            },
            dealer: {
              id: '2',
              name: 'Honda Kelapa Gading',
              location: 'Jakarta Utara',
              contact: '021-9876543'
            }
          },
          {
            id: '3',
            name: 'Daihatsu Xenia 1.3 R MT',
            brand: 'Daihatsu',
            model: 'Xenia',
            variant: '1.3 R MT',
            year: 2024,
            price: 220000000,
            image: '/images/cars/xenia-1.jpg',
            specifications: {
              engine: '1.3L DOHC VVT',
              transmission: 'Manual 5-Speed',
              fuel: 'Bensin',
              seats: 7
            },
            dealer: {
              id: '3',
              name: 'Daihatsu Sunter',
              location: 'Jakarta Utara',
              contact: '021-5555555'
            }
          }
        ];

        setState(prev => ({ ...prev, daftarMobil: mockCars }));
      }

      // Find selected car
      const selectedCar = state.daftarMobil.find(car => car.id === idMobil);
      if (!selectedCar) {
        throw new Error('Mobil tidak ditemukan');
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prev => ({
        ...prev,
        loading: false,
        mobilTerpilih: selectedCar,
        parameterKredit: {
          ...prev.parameterKredit,
          hargaMobil: selectedCar.price
        },
        activeStep: 'input-parameter'
      }));

    } catch (error) {
      console.error('Error selecting car from catalog:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Gagal memilih mobil. Silakan coba lagi.'
      }));
    }
  }, [state.daftarMobil]);

  /**
   * Lanjut ke aksi akhir
   */
  const lanjutKeAksiAkhir = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      if (!state.hasilSimulasi) {
        throw new Error('Belum ada hasil simulasi');
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prev => ({
        ...prev,
        loading: false,
        activeStep: 'hasil'
      }));

    } catch (error) {
      console.error('Error proceeding to final action:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Gagal melanjutkan ke aksi akhir. Silakan coba lagi.'
      }));
    }
  }, [state.hasilSimulasi]);

  /**
   * Request rekomendasi mobil
   * @param budgetMaksimal - Budget maksimal yang dimiliki
   */
  const requestRekomendasiMobil = useCallback(async (budgetMaksimal: number) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      if (budgetMaksimal < 50000000) {
        throw new Error('Budget minimal Rp 50 juta');
      }

      // Load car catalog if not loaded
      let carList = state.daftarMobil;
      if (carList.length === 0) {
        carList = [
          {
            id: '1',
            name: 'Toyota Avanza 1.3 G MT',
            brand: 'Toyota',
            model: 'Avanza',
            variant: '1.3 G MT',
            year: 2024,
            price: 235000000,
            image: '/images/cars/avanza-1.jpg',
            specifications: {
              engine: '1.3L DOHC VVT-i',
              transmission: 'Manual 5-Speed',
              fuel: 'Bensin',
              seats: 7
            },
            dealer: {
              id: '1',
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
            specifications: {
              engine: '1.2L i-VTEC',
              transmission: 'CVT',
              fuel: 'Bensin',
              seats: 5
            },
            dealer: {
              id: '2',
              name: 'Honda Kelapa Gading',
              location: 'Jakarta Utara',
              contact: '021-9876543'
            }
          },
          {
            id: '3',
            name: 'Daihatsu Xenia 1.3 R MT',
            brand: 'Daihatsu',
            model: 'Xenia',
            variant: '1.3 R MT',
            year: 2024,
            price: 220000000,
            image: '/images/cars/xenia-1.jpg',
            specifications: {
              engine: '1.3L DOHC VVT',
              transmission: 'Manual 5-Speed',
              fuel: 'Bensin',
              seats: 7
            },
            dealer: {
              id: '3',
              name: 'Daihatsu Sunter',
              location: 'Jakarta Utara',
              contact: '021-5555555'
            }
          }
        ];
      }

      // Filter cars within budget and calculate recommendations
      const affordableCars = carList.filter(car => {
        const minDP = car.price * 0.2; // Assume 20% down payment
        const monthlyIncome = budgetMaksimal / 3; // Assume 1/3 of budget is monthly income
        const maxMonthlyPayment = monthlyIncome * 0.3; // 30% of income for car payment
        
        const loanAmount = car.price - minDP;
        const monthlyRate = 0.085 / 12; // 8.5% annual rate
        const tenor = 36; // 3 years
        const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenor)) / 
                              (Math.pow(1 + monthlyRate, tenor) - 1);
        
        return monthlyPayment <= maxMonthlyPayment;
      });

      // Generate recommendations with scoring
      const recommendations: RekomendasiMobil[] = affordableCars.map(car => {
        const score = calculateRecommendationScore(car, budgetMaksimal);
        const simulasi = generateSimulationForCar(car);
        
        return {
          mobil: car,
          score,
          alasan: generateRecommendationReasons(car, budgetMaksimal),
          simulasi
        };
      }).sort((a, b) => b.score - a.score).slice(0, 5); // Top 5 recommendations

      await new Promise(resolve => setTimeout(resolve, 1500));

      setState(prev => ({
        ...prev,
        loading: false,
        budgetMaksimal,
        rekomendasiMobil: recommendations,
        activeStep: 'rekomendasi',
        daftarMobil: carList
      }));

    } catch (error) {
      console.error('Error requesting car recommendations:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Gagal mendapatkan rekomendasi mobil. Silakan coba lagi.'
      }));
    }
  }, [state.daftarMobil]);

  /**
   * Simpan atau share hasil simulasi
   * @param hasilSimulasi - Hasil simulasi yang akan disimpan/dibagikan
   */
  const simpanAtauShareHasil = useCallback(async (hasilSimulasi: HasilSimulasi) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Save to localStorage
      const existingSims = localStorage.getItem('savedSimulations');
      const savedSims = existingSims ? JSON.parse(existingSims) : [];
      
      // Check if simulation already exists
      const existingIndex = savedSims.findIndex((sim: HasilSimulasi) => sim.id === hasilSimulasi.id);
      
      if (existingIndex >= 0) {
        savedSims[existingIndex] = hasilSimulasi;
      } else {
        savedSims.unshift(hasilSimulasi);
      }
      
      // Keep only last 10 simulations
      const trimmedSims = savedSims.slice(0, 10);
      localStorage.setItem('savedSimulations', JSON.stringify(trimmedSims));

      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prev => ({
        ...prev,
        loading: false,
        savedSimulations: trimmedSims,
        showShareModal: true
      }));

    } catch (error) {
      console.error('Error saving simulation result:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal menyimpan hasil simulasi. Silakan coba lagi.'
      }));
    }
  }, []);

  /**
   * Hubungi dealer
   * @param kontakDealer - Kontak dealer yang akan dihubungi
   */
  const hubungiDealer = useCallback(async (kontakDealer: KontakDealer) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Simulate API call to get dealer contact details
      const dealerDetails: KontakDealer = {
        ...kontakDealer,
        jamOperasional: 'Senin - Sabtu: 08:00 - 17:00, Minggu: 09:00 - 15:00'
      };

      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prev => ({
        ...prev,
        loading: false,
        kontakDealer: dealerDetails,
        showContactModal: true
      }));

    } catch (error) {
      console.error('Error contacting dealer:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal menghubungi dealer. Silakan coba lagi.'
      }));
    }
  }, []);

  /**
   * Hitung simulasi kredit
   */
  const hitungSimulasi = useCallback(async (parameter: ParameterKredit) => {
    try {
      if (!state.mobilTerpilih) return;

      const pokokPinjaman = parameter.hargaMobil - parameter.uangMuka;
      const monthlyRate = parameter.bungaPerTahun / 100 / 12;
      const totalMonths = parameter.tenor;

      // Calculate monthly payment using PMT formula
      const monthlyPayment = (pokokPinjaman * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                            (Math.pow(1 + monthlyRate, totalMonths) - 1);

      const totalBunga = (monthlyPayment * totalMonths) - pokokPinjaman;
      const totalAsuransi = parameter.asuransi ? (parameter.hargaMobil * 0.02 * (parameter.tenor / 12)) : 0;
      const totalBiaya = parameter.biayaAdmin + parameter.biayaProvisi + totalAsuransi;
      const totalPembayaran = parameter.uangMuka + (monthlyPayment * totalMonths) + totalBiaya;

      // Generate payment schedule
      const jadwalCicilan = [];
      let sisaPokok = pokokPinjaman;

      for (let bulan = 1; bulan <= totalMonths; bulan++) {
        const bungaBulan = sisaPokok * monthlyRate;
        const pokokBulan = monthlyPayment - bungaBulan;
        sisaPokok -= pokokBulan;

        jadwalCicilan.push({
          bulan,
          pokok: pokokBulan,
          bunga: bungaBulan,
          sisaPokok: Math.max(0, sisaPokok),
          totalCicilan: monthlyPayment
        });
      }

      const hasilSimulasi: HasilSimulasi = {
        id: 'sim-' + Date.now(),
        tanggalSimulasi: new Date().toISOString(),
        mobil: state.mobilTerpilih,
        parameter,
        perhitungan: {
          pokokPinjaman,
          totalBunga,
          totalAsuransi,
          totalBiaya,
          cicilanPerBulan: monthlyPayment,
          totalPembayaran
        },
        jadwalCicilan
      };

      setState(prev => ({
        ...prev,
        hasilSimulasi,
        activeStep: 'hasil'
      }));

    } catch (error) {
      console.error('Error calculating simulation:', error);
      setState(prev => ({
        ...prev,
        error: 'Gagal menghitung simulasi. Silakan coba lagi.'
      }));
    }
  }, [state.mobilTerpilih]);

  /**
   * Calculate recommendation score for a car
   */
  const calculateRecommendationScore = (car: DataMobil, budget: number): number => {
    let score = 0;
    
    // Price affordability (40% weight)
    const priceRatio = car.price / budget;
    if (priceRatio <= 0.5) score += 40;
    else if (priceRatio <= 0.7) score += 30;
    else if (priceRatio <= 0.9) score += 20;
    else score += 10;
    
    // Brand reputation (30% weight)
    const brandScores: { [key: string]: number } = {
      'Toyota': 30,
      'Honda': 28,
      'Daihatsu': 25,
      'Suzuki': 23,
      'Mitsubishi': 20
    };
    score += brandScores[car.brand] || 15;
    
    // Fuel efficiency (20% weight)
    if (car.specifications.engine.includes('1.0') || car.specifications.engine.includes('1.2')) {
      score += 20;
    } else if (car.specifications.engine.includes('1.3') || car.specifications.engine.includes('1.5')) {
      score += 15;
    } else {
      score += 10;
    }
    
    // Year (10% weight)
    const currentYear = new Date().getFullYear();
    if (car.year === currentYear) score += 10;
    else if (car.year === currentYear - 1) score += 8;
    else score += 5;
    
    return Math.min(100, score);
  };

  /**
   * Generate recommendation reasons
   */
  const generateRecommendationReasons = (car: DataMobil, budget: number): string[] => {
    const reasons = [];
    
    const priceRatio = car.price / budget;
    if (priceRatio <= 0.5) {
      reasons.push('Harga sangat terjangkau sesuai budget Anda');
    } else if (priceRatio <= 0.7) {
      reasons.push('Harga sesuai dengan budget yang dimiliki');
    }
    
    if (['Toyota', 'Honda'].includes(car.brand)) {
      reasons.push('Brand terpercaya dengan nilai jual kembali tinggi');
    }
    
    if (car.specifications.seats >= 7) {
      reasons.push('Kapasitas penumpang besar, cocok untuk keluarga');
    }
    
    if (car.specifications.transmission.includes('CVT') || car.specifications.transmission.includes('AT')) {
      reasons.push('Transmisi otomatis untuk kenyamanan berkendara');
    }
    
    if (car.year === new Date().getFullYear()) {
      reasons.push('Model terbaru dengan teknologi terkini');
    }
    
    return reasons.slice(0, 3); // Max 3 reasons
  };

  /**
   * Generate simulation for a car
   */
  const generateSimulationForCar = (car: DataMobil): HasilSimulasi => {
    const parameter: ParameterKredit = {
      hargaMobil: car.price,
      uangMuka: car.price * 0.2, // 20% down payment
      tenor: 36,
      bungaPerTahun: 8.5,
      asuransi: true,
      biayaAdmin: 1500000,
      biayaProvisi: car.price * 0.01
    };

    const pokokPinjaman = parameter.hargaMobil - parameter.uangMuka;
    const monthlyRate = parameter.bungaPerTahun / 100 / 12;
    const monthlyPayment = (pokokPinjaman * monthlyRate * Math.pow(1 + monthlyRate, parameter.tenor)) / 
                          (Math.pow(1 + monthlyRate, parameter.tenor) - 1);

    return {
      id: 'rec-' + car.id + '-' + Date.now(),
      tanggalSimulasi: new Date().toISOString(),
      mobil: car,
      parameter,
      perhitungan: {
        pokokPinjaman,
        totalBunga: (monthlyPayment * parameter.tenor) - pokokPinjaman,
        totalAsuransi: parameter.hargaMobil * 0.02 * (parameter.tenor / 12),
        totalBiaya: parameter.biayaAdmin + parameter.biayaProvisi,
        cicilanPerBulan: monthlyPayment,
        totalPembayaran: parameter.uangMuka + (monthlyPayment * parameter.tenor) + parameter.biayaAdmin + parameter.biayaProvisi
      },
      jadwalCicilan: []
    };
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  /**
   * Share simulation result
   */
  const shareSimulation = (platform: string) => {
    if (!state.hasilSimulasi) return;

    const text = `Simulasi Kredit Mobil ${state.hasilSimulasi.mobil.name}
Harga: ${formatCurrency(state.hasilSimulasi.mobil.price)}
Uang Muka: ${formatCurrency(state.hasilSimulasi.parameter.uangMuka)}
Cicilan: ${formatCurrency(state.hasilSimulasi.perhitungan.cicilanPerBulan)}/bulan
Tenor: ${state.hasilSimulasi.parameter.tenor} bulan

Simulasi di Mobilindo Showroom`;

    const url = window.location.href;

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`);
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(text + '\n' + url);
        alert('Link berhasil disalin!');
        break;
    }

    setState(prev => ({ ...prev, showShareModal: false }));
  };

  // Load initial data
  useEffect(() => {
    aksesMenuSimulasiKredit();
  }, [aksesMenuSimulasiKredit]);

  // Render loading state
  if (state.loading && state.activeStep === 'menu' && !state.mobilTerpilih) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat simulasi kredit...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Simulasi Kredit Mobil</h1>
          <p className="text-gray-600 mt-2">
            Hitung cicilan mobil impian Anda dengan mudah dan akurat
          </p>
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700">{state.error}</p>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            {[
              { id: 'menu', label: 'Menu', icon: '🏠' },
              { id: 'input-parameter', label: 'Parameter', icon: '⚙️' },
              { id: 'hasil', label: 'Hasil', icon: '📊' }
            ].map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  state.activeStep === step.id
                    ? 'bg-blue-600 text-white'
                    : index < ['menu', 'input-parameter', 'hasil'].indexOf(state.activeStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <span className="text-lg">{step.icon}</span>
                </div>
                <span className={`ml-2 font-medium ${
                  state.activeStep === step.id ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {step.label}
                </span>
                {index < 2 && (
                  <div className={`w-16 h-1 mx-4 ${
                    index < ['menu', 'input-parameter', 'hasil'].indexOf(state.activeStep)
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Menu Simulasi */}
          {state.activeStep === 'menu' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Pilih Cara Simulasi</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Input Manual */}
                <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer"
                     onClick={() => setState(prev => ({ ...prev, activeStep: 'input-manual' }))}>
                  <div className="text-center">
                    <div className="text-4xl mb-4">✏️</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Input Manual</h3>
                    <p className="text-gray-600">
                      Masukkan data mobil secara manual untuk simulasi kredit
                    </p>
                  </div>
                </div>

                {/* Pilih dari Katalog */}
                <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer"
                     onClick={() => setState(prev => ({ ...prev, activeStep: 'pilih-katalog' }))}>
                  <div className="text-center">
                    <div className="text-4xl mb-4">🚗</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Pilih dari Katalog</h3>
                    <p className="text-gray-600">
                      Pilih mobil dari katalog yang tersedia
                    </p>
                  </div>
                </div>
              </div>

              {/* Rekomendasi Section */}
              <div className="border-t pt-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Atau Dapatkan Rekomendasi</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    placeholder="Budget maksimal (Rp)"
                    value={state.budgetMaksimal || ''}
                    onChange={(e) => setState(prev => ({ ...prev, budgetMaksimal: parseInt(e.target.value) || 0 }))}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => requestRekomendasiMobil(state.budgetMaksimal)}
                    disabled={!state.budgetMaksimal || state.loading}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state.loading ? 'Mencari...' : 'Cari Rekomendasi'}
                  </button>
                </div>
              </div>

              {/* Saved Simulations */}
              {state.savedSimulations.length > 0 && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Simulasi Tersimpan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {state.savedSimulations.slice(0, 6).map((sim) => (
                      <div key={sim.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3 mb-3">
                          <img
                            src={sim.mobil.image}
                            alt={sim.mobil.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 text-sm">{sim.mobil.name}</h4>
                            <p className="text-xs text-gray-600">
                              {new Date(sim.tanggalSimulasi).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cicilan:</span>
                            <span className="font-medium">{formatCurrency(sim.perhitungan.cicilanPerBulan)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tenor:</span>
                            <span className="font-medium">{sim.parameter.tenor} bulan</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setState(prev => ({
                              ...prev,
                              mobilTerpilih: sim.mobil,
                              parameterKredit: sim.parameter,
                              hasilSimulasi: sim,
                              activeStep: 'hasil'
                            }));
                          }}
                          className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Lihat Detail
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input Manual */}
          {state.activeStep === 'input-manual' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Input Data Mobil Manual</h2>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                inputDataMobilManual(state.dataManual.harga, state.dataManual.merk, state.dataManual.model);
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Merk Mobil *
                    </label>
                    <input
                      type="text"
                      required
                      value={state.dataManual.merk}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        dataManual: { ...prev.dataManual, merk: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: Toyota"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model Mobil *
                    </label>
                    <input
                      type="text"
                      required
                      value={state.dataManual.model}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        dataManual: { ...prev.dataManual, model: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: Avanza 1.3 G MT"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Mobil (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    min="50000000"
                    max="2000000000"
                    value={state.dataManual.harga || ''}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      dataManual: { ...prev.dataManual, harga: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: 235000000"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Minimum Rp 50 juta, maksimum Rp 2 miliar
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setState(prev => ({ ...prev, activeStep: 'menu' }))}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={state.loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state.loading ? 'Memproses...' : 'Lanjutkan'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Pilih dari Katalog */}
          {state.activeStep === 'pilih-katalog' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Pilih Mobil dari Katalog</h2>
              
              {state.loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Memuat katalog mobil...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      id: '1',
                      name: 'Toyota Avanza 1.3 G MT',
                      brand: 'Toyota',
                      price: 235000000,
                      image: '/images/cars/avanza-1.jpg'
                    },
                    {
                      id: '2',
                      name: 'Honda Brio RS CVT',
                      brand: 'Honda',
                      price: 185000000,
                      image: '/images/cars/brio-1.jpg'
                    },
                    {
                      id: '3',
                      name: 'Daihatsu Xenia 1.3 R MT',
                      brand: 'Daihatsu',
                      price: 220000000,
                      image: '/images/cars/xenia-1.jpg'
                    }
                  ].map((car) => (
                    <div key={car.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <img
                        src={car.image}
                        alt={car.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-2">{car.name}</h3>
                        <p className="text-gray-600 mb-3">{car.brand}</p>
                        <p className="text-xl font-bold text-blue-600 mb-4">
                          {formatCurrency(car.price)}
                        </p>
                        <button
                          onClick={() => pilihMobilDariKatalog(car.id)}
                          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Pilih Mobil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6">
                <button
                  onClick={() => setState(prev => ({ ...prev, activeStep: 'menu' }))}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Kembali ke Menu
                </button>
              </div>
            </div>
          )}

          {/* Input Parameter Kredit */}
          {state.activeStep === 'input-parameter' && state.mobilTerpilih && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Parameter Kredit</h2>
              
              {/* Selected Car Info */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Mobil Terpilih</h3>
                <div className="flex items-center space-x-4">
                  <img
                    src={state.mobilTerpilih.image}
                    alt={state.mobilTerpilih.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">{state.mobilTerpilih.name}</h4>
                    <p className="text-gray-600">{state.mobilTerpilih.brand} • {state.mobilTerpilih.year}</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(state.mobilTerpilih.price)}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                inputParameterKredit(
                  state.parameterKredit.uangMuka,
                  state.parameterKredit.tenor,
                  state.parameterKredit.bungaPerTahun
                );
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Uang Muka (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      min={state.mobilTerpilih.price * 0.1}
                      max={state.mobilTerpilih.price * 0.8}
                      value={state.parameterKredit.uangMuka || ''}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        parameterKredit: { ...prev.parameterKredit, uangMuka: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Minimum 10% ({formatCurrency(state.mobilTerpilih.price * 0.1)})
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tenor (Bulan) *
                    </label>
                    <select
                      required
                      value={state.parameterKredit.tenor}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        parameterKredit: { ...prev.parameterKredit, tenor: parseInt(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={12}>12 Bulan (1 Tahun)</option>
                      <option value={24}>24 Bulan (2 Tahun)</option>
                      <option value={36}>36 Bulan (3 Tahun)</option>
                      <option value={48}>48 Bulan (4 Tahun)</option>
                      <option value={60}>60 Bulan (5 Tahun)</option>
                      <option value={72}>72 Bulan (6 Tahun)</option>
                      <option value={84}>84 Bulan (7 Tahun)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bunga per Tahun (%) *
                    </label>
                    <input
                      type="number"
                      required
                      min="3"
                      max="25"
                      step="0.1"
                      value={state.parameterKredit.bungaPerTahun}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        parameterKredit: { ...prev.parameterKredit, bungaPerTahun: parseFloat(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Rata-rata bunga kredit mobil 8.5% - 12%
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Biaya Administrasi (Rp)
                    </label>
                    <input
                      type="number"
                      value={state.parameterKredit.biayaAdmin}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        parameterKredit: { ...prev.parameterKredit, biayaAdmin: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={state.parameterKredit.asuransi}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        parameterKredit: { ...prev.parameterKredit, asuransi: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Sertakan asuransi kendaraan (direkomendasikan)
                    </span>
                  </label>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setState(prev => ({ ...prev, activeStep: 'menu' }))}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={state.loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state.loading ? 'Menghitung...' : 'Hitung Simulasi'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Hasil Simulasi */}
          {state.activeStep === 'hasil' && state.hasilSimulasi && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Hasil Simulasi Kredit</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => simpanAtauShareHasil(state.hasilSimulasi!)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Simpan & Bagikan
                  </button>
                  <button
                    onClick={() => hubungiDealer({
                      dealerId: state.hasilSimulasi!.mobil.dealer.id,
                      nama: state.hasilSimulasi!.mobil.dealer.name,
                      telepon: state.hasilSimulasi!.mobil.dealer.contact,
                      email: `info@${state.hasilSimulasi!.mobil.dealer.name.toLowerCase().replace(/\s+/g, '')}.com`,
                      alamat: state.hasilSimulasi!.mobil.dealer.location,
                      salesPerson: 'Sales Representative',
                      jamOperasional: '09:00 - 18:00'
                    })}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Hubungi Dealer
                  </button>
                </div>
              </div>
              
              {/* Car Summary */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={state.hasilSimulasi.mobil.image}
                    alt={state.hasilSimulasi.mobil.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{state.hasilSimulasi.mobil.name}</h3>
                    <p className="text-gray-600">{state.hasilSimulasi.mobil.brand} • {state.hasilSimulasi.mobil.year}</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(state.hasilSimulasi.mobil.price)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Calculation Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Cicilan per Bulan</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(state.hasilSimulasi.perhitungan.cicilanPerBulan)}
                  </p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Total Bunga</h4>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(state.hasilSimulasi.perhitungan.totalBunga)}
                  </p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Total Pembayaran</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(state.hasilSimulasi.perhitungan.totalPembayaran)}
                  </p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Tenor</h4>
                  <p className="text-2xl font-bold text-gray-800">
                    {state.hasilSimulasi.parameter.tenor} Bulan
                  </p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Rincian Perhitungan</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Harga Mobil:</span>
                    <span className="font-medium">{formatCurrency(state.hasilSimulasi.parameter.hargaMobil)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Uang Muka:</span>
                    <span className="font-medium">- {formatCurrency(state.hasilSimulasi.parameter.uangMuka)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Pokok Pinjaman:</span>
                    <span className="font-medium">{formatCurrency(state.hasilSimulasi.perhitungan.pokokPinjaman)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bunga ({state.hasilSimulasi.parameter.bungaPerTahun}% per tahun):</span>
                    <span className="font-medium">{formatCurrency(state.hasilSimulasi.perhitungan.totalBunga)}</span>
                  </div>
                  {state.hasilSimulasi.parameter.asuransi && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Asuransi:</span>
                      <span className="font-medium">{formatCurrency(state.hasilSimulasi.perhitungan.totalAsuransi)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Biaya Admin & Provisi:</span>
                    <span className="font-medium">{formatCurrency(state.hasilSimulasi.perhitungan.totalBiaya)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-lg font-semibold">
                    <span>Total Pembayaran:</span>
                    <span className="text-blue-600">{formatCurrency(state.hasilSimulasi.perhitungan.totalPembayaran)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Schedule Preview */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Jadwal Cicilan (6 Bulan Pertama)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Bulan</th>
                        <th className="text-right py-2">Pokok</th>
                        <th className="text-right py-2">Bunga</th>
                        <th className="text-right py-2">Cicilan</th>
                        <th className="text-right py-2">Sisa Pokok</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.hasilSimulasi.jadwalCicilan.slice(0, 6).map((jadwal) => (
                        <tr key={jadwal.bulan} className="border-b">
                          <td className="py-2">{jadwal.bulan}</td>
                          <td className="text-right py-2">{formatCurrency(jadwal.pokok)}</td>
                          <td className="text-right py-2">{formatCurrency(jadwal.bunga)}</td>
                          <td className="text-right py-2 font-medium">{formatCurrency(jadwal.totalCicilan)}</td>
                          <td className="text-right py-2">{formatCurrency(jadwal.sisaPokok)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  * Menampilkan 6 bulan pertama. Jadwal lengkap dapat diunduh setelah menyimpan simulasi.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setState(prev => ({ ...prev, activeStep: 'input-parameter' }))}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Ubah Parameter
                </button>
                <button
                  onClick={() => setState(prev => ({ ...prev, activeStep: 'menu' }))}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Simulasi Baru
                </button>
                <button
                  onClick={() => navigate('/cars')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Lihat Mobil Lain
                </button>
              </div>
            </div>
          )}

          {/* Rekomendasi Mobil */}
          {state.activeStep === 'rekomendasi' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Rekomendasi Mobil</h2>
                  <p className="text-gray-600">
                    Berdasarkan budget maksimal {formatCurrency(state.budgetMaksimal)}
                  </p>
                </div>
                <button
                  onClick={() => setState(prev => ({ ...prev, activeStep: 'menu' }))}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Kembali ke Menu
                </button>
              </div>

              {state.loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Mencari rekomendasi terbaik...</p>
                </div>
              ) : state.rekomendasiMobil.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">😔</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Tidak Ada Rekomendasi</h3>
                  <p className="text-gray-600">
                    Maaf, tidak ada mobil yang sesuai dengan budget Anda. 
                    Coba tingkatkan budget atau lihat opsi kredit dengan tenor lebih panjang.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {state.rekomendasiMobil.map((rekomendasi, index) => (
                    <div key={rekomendasi.mobil.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start space-x-6">
                        {/* Car Image */}
                        <img
                          src={rekomendasi.mobil.image}
                          alt={rekomendasi.mobil.name}
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                        
                        {/* Car Details */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold text-gray-800">
                              {rekomendasi.mobil.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">Score:</span>
                              <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                                {rekomendasi.score}/100
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{rekomendasi.mobil.brand} • {rekomendasi.mobil.year}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-2xl font-bold text-blue-600 mb-2">
                                {formatCurrency(rekomendasi.mobil.price)}
                              </p>
                              <p className="text-lg font-semibold text-green-600">
                                Cicilan: {formatCurrency(rekomendasi.simulasi.perhitungan.cicilanPerBulan)}/bulan
                              </p>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p>DP: {formatCurrency(rekomendasi.simulasi.parameter.uangMuka)}</p>
                              <p>Tenor: {rekomendasi.simulasi.parameter.tenor} bulan</p>
                              <p>Bunga: {rekomendasi.simulasi.parameter.bungaPerTahun}% per tahun</p>
                            </div>
                          </div>
                          
                          {/* Reasons */}
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Mengapa direkomendasikan:</h4>
                            <ul className="space-y-1">
                              {rekomendasi.alasan.map((alasan, idx) => (
                                <li key={idx} className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  {alasan}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-3">
                            <button
                              onClick={() => {
                                setState(prev => ({
                                  ...prev,
                                  mobilTerpilih: rekomendasi.mobil,
                                  parameterKredit: rekomendasi.simulasi.parameter,
                                  hasilSimulasi: rekomendasi.simulasi,
                                  activeStep: 'hasil'
                                }));
                              }}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Lihat Detail Simulasi
                            </button>
                            <button
                              onClick={() => hubungiDealer({
                                dealerId: rekomendasi.mobil.dealer.id,
                                nama: rekomendasi.mobil.dealer.name,
                                telepon: rekomendasi.mobil.dealer.contact,
                                email: `info@${rekomendasi.mobil.dealer.name.toLowerCase().replace(/\s+/g, '')}.com`,
                                alamat: rekomendasi.mobil.dealer.location,
                                salesPerson: 'Sales Representative',
                                jamOperasional: '09:00 - 18:00'
                              })}
                              className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              Hubungi Dealer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Share Modal */}
        {state.showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Bagikan Hasil Simulasi</h3>
              
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => shareSimulation('whatsapp')}
                  className="w-full flex items-center justify-center space-x-3 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <span>📱</span>
                  <span>WhatsApp</span>
                </button>
                
                <button
                  onClick={() => shareSimulation('telegram')}
                  className="w-full flex items-center justify-center space-x-3 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <span>✈️</span>
                  <span>Telegram</span>
                </button>
                
                <button
                  onClick={() => shareSimulation('facebook')}
                  className="w-full flex items-center justify-center space-x-3 bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  <span>📘</span>
                  <span>Facebook</span>
                </button>
                
                <button
                  onClick={() => shareSimulation('copy')}
                  className="w-full flex items-center justify-center space-x-3 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <span>📋</span>
                  <span>Salin Link</span>
                </button>
              </div>
              
              <button
                onClick={() => setState(prev => ({ ...prev, showShareModal: false }))}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Contact Dealer Modal */}
        {state.showContactModal && state.kontakDealer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Kontak Dealer</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-medium text-gray-800">{state.kontakDealer.nama}</h4>
                  <p className="text-gray-600">{state.kontakDealer.alamat}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-500">📞</span>
                    <a
                      href={`tel:${state.kontakDealer.telepon}`}
                      className="text-blue-600 hover:underline"
                    >
                      {state.kontakDealer.telepon}
                    </a>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-500">✉️</span>
                    <a
                      href={`mailto:${state.kontakDealer.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {state.kontakDealer.email}
                    </a>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-500">🕒</span>
                    <span className="text-gray-600">{state.kontakDealer.jamOperasional}</span>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Sales Person:</strong> {state.kontakDealer.salesPerson}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Sebutkan bahwa Anda tertarik dengan hasil simulasi kredit dari website kami.
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <a
                  href={`https://wa.me/${state.kontakDealer.telepon.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors text-center"
                >
                  WhatsApp
                </a>
                <button
                  onClick={() => setState(prev => ({ ...prev, showContactModal: false }))}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HalamanSimulasi;