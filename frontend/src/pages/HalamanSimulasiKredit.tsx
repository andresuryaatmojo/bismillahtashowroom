import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Info,
  RotateCcw,
  Save,
  Building2,
  Calendar,
  Percent,
  DollarSign,
  Shield,
  FileText,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import {
  fetchCreditParameters,
  fetchFinancialPartners
} from '../services/creditParameters';
import {
  createCreditSimulationWithAuth
} from '../services/creditSimulations';
import {
  fetchAvailableCars,
  searchCarsForSimulation
} from '../services/cars';
import {
  CreditParameterWithPartner,
  FinancialPartner
} from '../types/credit-parameters';
import {
  CarOption
} from '../types/cars';

interface SimulationResult {
  otr_price: number;
  down_payment: number;
  down_payment_percentage: number;
  loan_amount: number;
  tenor_months: number;
  interest_rate_yearly: number;
  interest_type: string;
  monthly_installment: number;
  total_interest: number;
  admin_fee: number;
  provision_fee: number;
  fidusia_fee: number;
  life_insurance: number;
  vehicle_insurance_type: string;
  vehicle_insurance_yearly: number;
  vehicle_insurance_total: number;
  total_initial_payment: number;
  total_payment: number;
}

const HalamanSimulasiKredit: React.FC = () => {
  // Form States
  const [selectedCar, setSelectedCar] = useState<string>('');
  const [carPrice, setCarPrice] = useState<string>('199000000');
  const [downPayment, setDownPayment] = useState<string>('19900000');
  const [downPaymentPercentage, setDownPaymentPercentage] = useState<string>('10');
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [selectedParameter, setSelectedParameter] = useState<string>('');
  const [insuranceType, setInsuranceType] = useState<'TLO' | 'Allrisk'>('TLO');
  const [tenor, setTenor] = useState<number>(60);
  const [location, setLocation] = useState<string>('');

  // Data States
  const [partners, setPartners] = useState<FinancialPartner[]>([]);
  const [parameters, setParameters] = useState<CreditParameterWithPartner[]>([]);
  const [filteredParameters, setFilteredParameters] = useState<CreditParameterWithPartner[]>([]);
  const [cars, setCars] = useState<CarOption[]>([]);
  const [carSearch, setCarSearch] = useState<string>('');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [simulationSaved, setSimulationSaved] = useState(false);

  // Fixed fees (fallback values if not set in parameters)
  const DEFAULT_ADMIN_FEE = 1000000; // 1 Juta
  const DEFAULT_FIDUSIA_FEE = 500000; // 500 Ribu

  // Fetch data
  useEffect(() => {
    fetchPartners();
    fetchParameters();
    fetchCars();
  }, []);

  // Search cars when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (carSearch) {
        searchCars(carSearch);
      } else {
        fetchCars();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [carSearch]);

  // Filter parameters by partner
  useEffect(() => {
    if (selectedPartner) {
      const filtered = parameters.filter(
        p => p.financial_partner_id === selectedPartner && p.is_active
      );
      setFilteredParameters(filtered);
      
      // Auto-select first parameter if available
      if (filtered.length > 0) {
        setSelectedParameter(filtered[0].id);
      } else {
        setSelectedParameter('');
      }
    } else {
      setFilteredParameters([]);
      setSelectedParameter('');
    }
  }, [selectedPartner, parameters]);

  // Auto calculate when inputs change
  useEffect(() => {
    if (carPrice && selectedParameter) {
      calculateSimulation();
    }
  }, [carPrice, downPayment, selectedParameter, insuranceType, tenor]);

  // Update tenor when parameter changes
  useEffect(() => {
    if (selectedParameter) {
      const parameter = parameters.find(p => p.id === selectedParameter);
      if (parameter) {
        setTenor(parameter.tenor_months);
      }
    }
  }, [selectedParameter, parameters]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const data = await fetchFinancialPartners();
      setPartners(data);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParameters = async () => {
    try {
      setLoading(true);
      const data = await fetchCreditParameters();
      setParameters(data);
    } catch (error) {
      console.error('Error fetching parameters:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCars = async () => {
    try {
      setLoading(true);
      const data = await fetchAvailableCars(50);
      console.log('Fetched cars:', data); // Debug log
      setCars(data);
    } catch (error) {
      console.error('Error fetching cars:', error);
      // Set empty array to prevent undefined issues
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  const searchCars = async (searchTerm: string) => {
    try {
      setLoading(true);
      const data = await searchCarsForSimulation(searchTerm, 50);
      setCars(data);
    } catch (error) {
      console.error('Error searching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCarSelection = (carId: string) => {
    setSelectedCar(carId);
    const selectedCarData = cars.find(car => car.id === carId);
    if (selectedCarData) {
      setCarPrice(selectedCarData.price.toString());
      // Auto-calculate DP based on percentage
      if (downPaymentPercentage) {
        const dpAmount = (selectedCarData.price * parseFloat(downPaymentPercentage)) / 100;
        setDownPayment(dpAmount.toString());
      }
    }
  };

  const handleCarPriceChange = (value: string) => {
    const numValue = value.replace(/\D/g, '');
    setCarPrice(numValue);
    setSelectedCar(''); // Clear selected car when manual price is entered

    // Auto-calculate DP based on percentage
    if (downPaymentPercentage) {
      const dpAmount = (parseFloat(numValue) * parseFloat(downPaymentPercentage)) / 100;
      setDownPayment(dpAmount.toString());
    }
  };

  const handleDownPaymentChange = (value: string) => {
    const numValue = value.replace(/\D/g, '');
    setDownPayment(numValue);
    
    // Auto-calculate percentage
    if (carPrice && parseFloat(carPrice) > 0) {
      const percentage = (parseFloat(numValue) / parseFloat(carPrice)) * 100;
      setDownPaymentPercentage(percentage.toFixed(2));
    }
  };

  const handleDownPaymentPercentageChange = (value: string) => {
    setDownPaymentPercentage(value);
    
    // Auto-calculate DP amount
    if (carPrice) {
      const dpAmount = (parseFloat(carPrice) * parseFloat(value)) / 100;
      setDownPayment(dpAmount.toString());
    }
  };

  const calculateSimulation = () => {
    const parameter = parameters.find(p => p.id === selectedParameter);
    if (!parameter || !carPrice) return;

    const otrPrice = parseFloat(carPrice);
    const dp = parseFloat(downPayment) || 0;
    const dpPercentage = parseFloat(downPaymentPercentage) || 0;

    // Validate OTR range
    if (parameter.min_otr && otrPrice < parameter.min_otr) {
      return;
    }
    if (parameter.max_otr && otrPrice > parameter.max_otr) {
      return;
    }

    // Validate DP range
    if (dpPercentage < parameter.min_dp_percentage || dpPercentage > parameter.max_dp_percentage) {
      return;
    }

    // Calculate loan amount
    const loanAmount = otrPrice - dp;

    // Calculate interest (flat rate)
    let monthlyInstallment = 0;
    let totalInterest = 0;

    if (parameter.interest_type === 'flat') {
      const interestPerMonth = (loanAmount * parameter.interest_rate_yearly / 100) / 12;
      totalInterest = interestPerMonth * tenor;
      monthlyInstallment = (loanAmount + totalInterest) / tenor;
    } else if (parameter.interest_type === 'efektif' || parameter.interest_type === 'anuitas') {
      // Effective rate calculation (simplified)
      const monthlyRate = parameter.interest_rate_yearly / 100 / 12;
      monthlyInstallment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, tenor)) /
                          (Math.pow(1 + monthlyRate, tenor) - 1);
      totalInterest = (monthlyInstallment * tenor) - loanAmount;
    }

    // Get fees from parameter or use defaults
    const adminFee = parameter.admin_fee || DEFAULT_ADMIN_FEE;
    const fidusiaFee = parameter.fidusia_fee || DEFAULT_FIDUSIA_FEE;

    // Calculate fees
    const provisionFee = loanAmount * (parameter.provision_fee_percentage / 100);
    const lifeInsurance = loanAmount * (parameter.life_insurance_percentage / 100);

    // Calculate vehicle insurance
    const insuranceRate = insuranceType === 'TLO'
      ? parameter.insurance_tlo_percentage
      : parameter.insurance_allrisk_percentage;
    const vehicleInsuranceYearly = otrPrice * (insuranceRate / 100);
    const insuranceYears = Math.ceil(tenor / 12);
    const vehicleInsuranceTotal = vehicleInsuranceYearly * insuranceYears;

    // Calculate totals
    const totalInitialPayment = dp + adminFee + provisionFee + fidusiaFee +
                                lifeInsurance + vehicleInsuranceYearly;
    const totalPayment = totalInitialPayment + (monthlyInstallment * tenor);

    const result: SimulationResult = {
      otr_price: otrPrice,
      down_payment: dp,
      down_payment_percentage: dpPercentage,
      loan_amount: loanAmount,
      tenor_months: tenor,
      interest_rate_yearly: parameter.interest_rate_yearly,
      interest_type: parameter.interest_type,
      monthly_installment: monthlyInstallment,
      total_interest: totalInterest,
      admin_fee: adminFee,
      provision_fee: provisionFee,
      fidusia_fee: fidusiaFee,
      life_insurance: lifeInsurance,
      vehicle_insurance_type: insuranceType,
      vehicle_insurance_yearly: vehicleInsuranceYearly,
      vehicle_insurance_total: vehicleInsuranceTotal,
      total_initial_payment: totalInitialPayment,
      total_payment: totalPayment
    };

    setSimulationResult(result);
  };

  const saveSimulationToDatabase = async (result: SimulationResult) => {
    try {
      const parameter = parameters.find(p => p.id === selectedParameter);
      if (!parameter) return;

      const payload = {
        car_id: selectedCar || null,
        credit_parameter_id: selectedParameter,
        financial_partner_id: selectedPartner,
        otr_price: result.otr_price,
        down_payment: result.down_payment,
        down_payment_percentage: result.down_payment_percentage,
        loan_amount: result.loan_amount,
        tenor_months: result.tenor_months,
        interest_rate_yearly: result.interest_rate_yearly,
        interest_type: result.interest_type,
        monthly_installment: result.monthly_installment,
        total_interest: result.total_interest,
        admin_fee: result.admin_fee,
        provision_fee: result.provision_fee,
        fidusia_fee: result.fidusia_fee,
        life_insurance: result.life_insurance,
        vehicle_insurance_type: result.vehicle_insurance_type,
        vehicle_insurance_yearly: result.vehicle_insurance_yearly,
        vehicle_insurance_total: result.vehicle_insurance_total,
        total_initial_payment: result.total_initial_payment,
        total_payment: result.total_payment,
        simulation_data: {
          carPrice: carPrice,
          selectedCar: selectedCar,
          carTitle: selectedCar ? cars.find(car => car.id === selectedCar)?.title : null,
          insuranceType: insuranceType,
          location: location,
          parameter_name: parameter.name,
          financial_partner_name: parameter.financial_partner_name
        },
        is_saved: false,
        notes: `Simulasi kredit - ${location || 'Tidak ada lokasi'}${selectedCar ? ` - ${cars.find(car => car.id === selectedCar)?.title}` : ''}`
      };

      const savedSimulation = await createCreditSimulationWithAuth(payload);
      if (savedSimulation) {
        setSimulationSaved(true);
        console.log('Simulation saved successfully:', savedSimulation.id);
      } else {
        console.log('User not logged in, simulation not saved');
      }
    } catch (error) {
      console.error('Error auto-saving simulation:', error);
      // Don't show error to user, just log it
    }
  };

  const handleReset = () => {
    setSelectedCar('');
    setCarPrice('199000000');
    setDownPayment('19900000');
    setDownPaymentPercentage('10');
    setSelectedPartner('');
    setSelectedParameter('');
    setInsuranceType('TLO');
    setTenor(60);
    setLocation('');
    setSimulationResult(null);
    setSimulationSaved(false);
  };

  const handleSaveSimulation = async () => {
    if (!simulationResult) return;

    setIsSaving(true);
    try {
      const parameter = parameters.find(p => p.id === selectedParameter);
      if (!parameter) return;

      const payload = {
        car_id: selectedCar || null,
        credit_parameter_id: selectedParameter,
        financial_partner_id: selectedPartner,
        otr_price: simulationResult.otr_price,
        down_payment: simulationResult.down_payment,
        down_payment_percentage: simulationResult.down_payment_percentage,
        loan_amount: simulationResult.loan_amount,
        tenor_months: simulationResult.tenor_months,
        interest_rate_yearly: simulationResult.interest_rate_yearly,
        interest_type: simulationResult.interest_type,
        monthly_installment: simulationResult.monthly_installment,
        total_interest: simulationResult.total_interest,
        admin_fee: simulationResult.admin_fee,
        provision_fee: simulationResult.provision_fee,
        fidusia_fee: simulationResult.fidusia_fee,
        life_insurance: simulationResult.life_insurance,
        vehicle_insurance_type: simulationResult.vehicle_insurance_type,
        vehicle_insurance_yearly: simulationResult.vehicle_insurance_yearly,
        vehicle_insurance_total: simulationResult.vehicle_insurance_total,
        total_initial_payment: simulationResult.total_initial_payment,
        total_payment: simulationResult.total_payment,
        simulation_data: {
          carPrice: carPrice,
          selectedCar: selectedCar,
          carTitle: selectedCar ? cars.find(car => car.id === selectedCar)?.title : null,
          insuranceType: insuranceType,
          location: location,
          parameter_name: parameter.name,
          financial_partner_name: parameter.financial_partner_name
        },
        is_saved: true,
        notes: `Simulasi kredit - ${location || 'Tidak ada lokasi'}${selectedCar ? ` - ${cars.find(car => car.id === selectedCar)?.title}` : ''}`
      };

      const savedSimulation = await createCreditSimulationWithAuth(payload);
      if (savedSimulation) {
        setSimulationSaved(true);
        alert('Simulasi berhasil disimpan!');
      } else {
        alert('Anda harus login untuk menyimpan simulasi');
      }
    } catch (error) {
      console.error('Error saving simulation:', error);
      alert('Gagal menyimpan simulasi');
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: string) => {
    const num = value.replace(/\D/g, '');
    return new Intl.NumberFormat('id-ID').format(parseFloat(num) || 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Form */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                  Berapa anggaran pinjaman bulanan saya?
                </h1>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>

              <div className="space-y-6">
                {/* Car Selection */}
                <div>
                  <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                    Pilih Mobil
                    <div className="relative group">
                      <Info className="w-4 h-4 text-blue-600 cursor-help" />
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg z-10">
                        Pilih mobil dari daftar atau masukkan harga manual
                      </div>
                    </div>
                  </label>

                  {/* Car Search */}
                  <div className="mb-3">
                    <input
                      type="text"
                      value={carSearch}
                      onChange={(e) => setCarSearch(e.target.value)}
                      placeholder="Cari mobil berdasarkan merek, model, atau judul..."
                      className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Car Dropdown */}
                  <select
                    value={selectedCar}
                    onChange={(e) => handleCarSelection(e.target.value)}
                    disabled={loading}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white disabled:opacity-50 mb-3"
                  >
                    <option value="">
                      {loading ? 'Memuat mobil...' : 'Pilih Mobil (Opsional)'}
                    </option>
                    {!loading && cars.length === 0 && (
                      <option value="" disabled>
                        Tidak ada mobil tersedia
                      </option>
                    )}
                    {!loading && cars.map(car => (
                      <option key={car.id} value={car.id}>
                        {car.display_name} - {formatCurrency(car.price)} ({car.location_city})
                      </option>
                    ))}
                  </select>

  
                  {/* Selected Car Info */}
                  {selectedCar && (() => {
                    const selectedCarData = cars.find(car => car.id === selectedCar);
                    if (!selectedCarData) return null;
                    return (
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 mb-3">
                        <div className="flex items-center gap-2 text-green-800 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            Mobil dipilih: {selectedCarData.title} ({selectedCarData.year}) - {formatCurrency(selectedCarData.price)}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Car Price */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Harga Mobil (Rp)
                    {selectedCar && <span className="text-sm font-normal text-gray-600 ml-2">(Auto dari mobil yang dipilih)</span>}
                  </label>
                  <input
                    type="text"
                    value={formatNumber(carPrice)}
                    onChange={(e) => handleCarPriceChange(e.target.value)}
                    disabled={!!selectedCar}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="199.000.000"
                  />
                  {selectedCar && (
                    <p className="text-sm text-gray-500 mt-1">
                      Untuk mengubah harga, pilih mobil lain atau kosongkan pilihan mobil
                    </p>
                  )}
                </div>

                {/* Down Payment */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                      Uang Muka
                      <div className="relative group">
                        <Info className="w-4 h-4 text-blue-600 cursor-help" />
                        <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg">
                          Minimal DP sesuai ketentuan partner
                        </div>
                      </div>
                    </label>
                    <input
                      type="text"
                      value={formatNumber(downPayment)}
                      onChange={(e) => handleDownPaymentChange(e.target.value)}
                      className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="19.900.000"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                      &nbsp;
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={downPaymentPercentage}
                        onChange={(e) => handleDownPaymentPercentageChange(e.target.value)}
                        className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                        placeholder="10"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-lg font-semibold text-gray-600">
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* Financial Partner */}
                <div>
                  <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                    Mitra Pembiayaan
                    <div className="relative group">
                      <Info className="w-4 h-4 text-blue-600 cursor-help" />
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg">
                        Pilih lembaga pembiayaan
                      </div>
                    </div>
                  </label>
                  <select
                    value={selectedPartner}
                    onChange={(e) => setSelectedPartner(e.target.value)}
                    disabled={loading}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white disabled:opacity-50"
                  >
                    <option value="">
                      {loading ? 'Memuat...' : 'Pilih Mitra Pembiayaan'}
                    </option>
                    {!loading && partners.map(partner => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Credit Parameter */}
                {selectedPartner && filteredParameters.length > 0 && (
                  <div>
                    <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                      Paket Kredit
                      <div className="relative group">
                        <Info className="w-4 h-4 text-blue-600 cursor-help" />
                        <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg">
                          Pilih paket kredit yang tersedia
                        </div>
                      </div>
                    </label>
                    <select
                      value={selectedParameter}
                      onChange={(e) => setSelectedParameter(e.target.value)}
                      className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">Pilih Paket Kredit</option>
                      {filteredParameters.map(parameter => (
                        <option key={parameter.id} value={parameter.id}>
                          {parameter.name} - {parameter.tenor_months} bulan ({parameter.interest_rate_yearly}%/tahun)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Selected Parameter Info */}
                {selectedParameter && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Detail Paket Kredit:</h4>
                    {(() => {
                      const param = parameters.find(p => p.id === selectedParameter);
                      if (!param) return null;
                      return (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-blue-700">
                            <span className="font-medium">Suku Bunga:</span> {param.interest_rate_yearly}%/tahun ({param.interest_type})
                          </div>
                          <div className="text-blue-700">
                            <span className="font-medium">Tenor:</span> {param.tenor_months} bulan
                          </div>
                          <div className="text-blue-700">
                            <span className="font-medium">DP Minimal:</span> {param.min_dp_percentage}%
                          </div>
                          <div className="text-blue-700">
                            <span className="font-medium">DP Maksimal:</span> {param.max_dp_percentage}%
                          </div>
                          {(param.min_otr || param.max_otr) && (
                            <div className="text-blue-700 col-span-2">
                              <span className="font-medium">Range OTR:</span> {param.min_otr ? formatCurrency(param.min_otr) : 'Rp 0'} - {param.max_otr ? formatCurrency(param.max_otr) : 'Tidak ada batas'}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Insurance Type */}
                <div>
                  <label className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-3">
                    Jenis Asuransi Mobil
                    <div className="relative group">
                      <Info className="w-4 h-4 text-blue-600 cursor-help" />
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg">
                        TLO: Total Loss Only - Allrisk: Comprehensive
                      </div>
                    </div>
                  </label>
                  <select
                    value={insuranceType}
                    onChange={(e) => setInsuranceType(e.target.value as 'TLO' | 'Allrisk')}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="TLO">Total Lost Only (TLO)</option>
                    <option value="Allrisk">Allrisk</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Cakupan Wilayah
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">Pilih Wilayah</option>
                    <option value="DKI Jakarta, Jawa barat, dan Banten">DKI Jakarta, Jawa Barat, dan Banten</option>
                    <option value="Jawa Tengah">Jawa Tengah</option>
                    <option value="Jawa Timur">Jawa Timur</option>
                    <option value="Sumatera">Sumatera</option>
                    <option value="Kalimantan">Kalimantan</option>
                    <option value="Sulawesi">Sulawesi</option>
                    <option value="Bali dan Nusa Tenggara">Bali dan Nusa Tenggara</option>
                  </select>
                </div>

                {/* Tenor Slider */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Tenor Pinjaman
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="12"
                      max="84"
                      step="12"
                      value={tenor}
                      onChange={(e) => setTenor(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((tenor - 12) / (84 - 12)) * 100}%, #dbeafe ${((tenor - 12) / (84 - 12)) * 100}%, #dbeafe 100%)`
                      }}
                    />
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <input
                        type="number"
                        value={tenor / 12}
                        onChange={(e) => setTenor(parseInt(e.target.value) * 12)}
                        min="1"
                        max="7"
                        className="w-16 px-3 py-2 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-lg font-semibold text-gray-700">Tahun</span>
                    </div>
                  </div>
                </div>

                {/* Validation Messages */}
                {selectedParameter && (() => {
                  const param = parameters.find(p => p.id === selectedParameter);
                  const dpPercent = parseFloat(downPaymentPercentage) || 0;
                  const carPriceNum = parseFloat(carPrice) || 0;

                  if (!param) return null;

                  const issues = [];
                  if (dpPercent < param.min_dp_percentage || dpPercent > param.max_dp_percentage) {
                    issues.push(`DP harus antara ${param.min_dp_percentage}% - ${param.max_dp_percentage}%`);
                  }
                  if (param.min_otr && carPriceNum < param.min_otr) {
                    issues.push(`Harga mobil minimal ${formatCurrency(param.min_otr)}`);
                  }
                  if (param.max_otr && carPriceNum > param.max_otr) {
                    issues.push(`Harga mobil maksimal ${formatCurrency(param.max_otr)}`);
                  }

                  if (issues.length > 0) {
                    return (
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <Info className="w-4 h-4" />
                          <p className="text-sm font-medium">
                            {issues.join(', ')}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Calculate Button */}
                <button
                  onClick={calculateSimulation}
                  disabled={!carPrice || !selectedPartner || !selectedParameter || loading}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Calculator className="w-6 h-6" />
                  {loading ? 'Memuat...' : 'Hitung Simulasi'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Result */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-2xl shadow-2xl p-8 text-white sticky top-6">
              <h2 className="text-2xl font-bold mb-6">
                Estimasi Pembayaran Bulanan Anda:
              </h2>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-300 border-t-blue-600 mx-auto mb-4"></div>
                  <p className="text-blue-200 text-lg">
                    Memuat data simulasi...
                  </p>
                </div>
              ) : simulationResult ? (
                <div className="space-y-6">
                  {/* Monthly Payment */}
                  <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                    <div className="text-yellow-300 text-5xl font-bold mb-2">
                      {formatCurrency(simulationResult.monthly_installment)}
                    </div>
                    <p className="text-blue-200 text-sm">Per bulan selama {tenor / 12} tahun</p>
                  </div>

                  {/* Total DP */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold border-b border-white/30 pb-2">
                      Estimasi Total DP
                    </h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-200">Uang Muka</span>
                        <span className="font-semibold">
                          {formatCurrency(simulationResult.down_payment)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-t border-white/20">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-200">Pembayaran Pertama</span>
                          <div className="relative group">
                            <Info className="w-3 h-3 text-blue-300 cursor-help" />
                            <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg z-10">
                              Termasuk admin, provisi, fidusia, asuransi
                            </div>
                          </div>
                        </div>
                        <span className="font-semibold">
                          {formatCurrency(simulationResult.total_initial_payment - simulationResult.down_payment)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-white/20">
                        <span className="text-blue-200">Premi Asuransi</span>
                        <span className="font-semibold">
                          {formatCurrency(simulationResult.vehicle_insurance_yearly)}
                        </span>
                      </div>
                    </div>

                    {/* Total DP */}
                    <div className="bg-white/10 rounded-lg p-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold">Total DP</span>
                        <span className="text-2xl font-bold text-yellow-300">
                          {formatCurrency(simulationResult.total_initial_payment)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown Details */}
                  <div className="space-y-2 text-xs border-t border-white/30 pt-4">
                    <p className="text-blue-200 mb-2 font-semibold">Rincian Biaya:</p>
                    <div className="flex justify-between">
                      <span className="text-blue-200">Biaya Admin</span>
                      <span>{formatCurrency(simulationResult.admin_fee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200">Biaya Provisi ({parameters.find(p => p.id === selectedParameter)?.provision_fee_percentage}%)</span>
                      <span>{formatCurrency(simulationResult.provision_fee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200">Biaya Fidusia</span>
                      <span>{formatCurrency(simulationResult.fidusia_fee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200">Asuransi Jiwa</span>
                      <span>{formatCurrency(simulationResult.life_insurance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200">Total Bunga ({simulationResult.interest_rate_yearly}%)</span>
                      <span>{formatCurrency(simulationResult.total_interest)}</span>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-xs">
                    <p className="text-yellow-200">
                      Perhitungan hanya sebatas simulasi yang sudah mencakup biaya layanan dan asuransi. 
                      Untuk lebih detail silahkan hubungi kami atau kunjungi Experience Center kami.
                    </p>
                  </div>

                  {/* Auto-save Status */}
                  {simulationSaved && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-xs">
                      <div className="flex items-center gap-2 text-green-200">
                        <CheckCircle className="w-4 h-4" />
                        <p>
                          Simulasi telah disimpan otomatis. Anda dapat melihatnya di riwayat simulasi.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  <button
                    onClick={handleSaveSimulation}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5" />
                    {isSaving ? 'Menyimpan...' : 'Simpan Simulasi'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calculator className="w-16 h-16 text-blue-300 mx-auto mb-4 opacity-50" />
                  <p className="text-blue-200 text-lg">
                    Isi form di samping untuk melihat estimasi pembayaran
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HalamanSimulasiKredit;