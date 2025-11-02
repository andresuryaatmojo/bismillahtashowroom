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

// Types
interface FinancialPartner {
  id: string;
  name: string;
  code: string;
}

interface CreditParameter {
  id: string;
  financial_partner_id: string;
  financial_partner_name: string;
  name: string;
  min_dp_percentage: number;
  max_dp_percentage: number;
  tenor_months: number;
  interest_rate_yearly: number;
  interest_type: 'flat' | 'efektif' | 'anuitas';
  admin_fee: number;
  provision_fee_percentage: number;
  fidusia_fee: number;
  insurance_tlo_percentage: number;
  insurance_allrisk_percentage: number;
  life_insurance_percentage: number;
  is_active: boolean;
}

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
  const [parameters, setParameters] = useState<CreditParameter[]>([]);
  const [filteredParameters, setFilteredParameters] = useState<CreditParameter[]>([]);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fixed fees
  const FIXED_ADMIN_FEE = 1000000; // 1 Juta
  const FIXED_FIDUSIA_FEE = 500000; // 500 Ribu

  // Fetch data
  useEffect(() => {
    fetchPartners();
    fetchParameters();
  }, []);

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

  const fetchPartners = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/financial-partners?is_active=true');
      // const data = await response.json();
      // setPartners(data);

      const dummyPartners: FinancialPartner[] = [
        { id: '1', name: 'BCA Finance', code: 'BCA001' },
        { id: '2', name: 'Bank Mandiri', code: 'BM001' },
        { id: '3', name: 'Astra Credit', code: 'ACC001' }
      ];
      setPartners(dummyPartners);
    } catch (error) {
      console.error('Error fetching partners:', error);
    }
  };

  const fetchParameters = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/credit-parameters?is_active=true');
      // const data = await response.json();
      // setParameters(data);

      const dummyParameters: CreditParameter[] = [
        {
          id: '1',
          financial_partner_id: '1',
          financial_partner_name: 'BCA Finance',
          name: 'Paket BCA 1 Tahun',
          min_dp_percentage: 10,
          max_dp_percentage: 50,
          tenor_months: 12,
          interest_rate_yearly: 8,
          interest_type: 'flat',
          admin_fee: FIXED_ADMIN_FEE,
          provision_fee_percentage: 1,
          fidusia_fee: FIXED_FIDUSIA_FEE,
          insurance_tlo_percentage: 0.4,
          insurance_allrisk_percentage: 2,
          life_insurance_percentage: 0.5,
          is_active: true
        },
        {
          id: '2',
          financial_partner_id: '1',
          financial_partner_name: 'BCA Finance',
          name: 'Paket BCA 3 Tahun',
          min_dp_percentage: 10,
          max_dp_percentage: 50,
          tenor_months: 36,
          interest_rate_yearly: 9,
          interest_type: 'flat',
          admin_fee: FIXED_ADMIN_FEE,
          provision_fee_percentage: 1,
          fidusia_fee: FIXED_FIDUSIA_FEE,
          insurance_tlo_percentage: 0.4,
          insurance_allrisk_percentage: 2,
          life_insurance_percentage: 0.5,
          is_active: true
        },
        {
          id: '3',
          financial_partner_id: '1',
          financial_partner_name: 'BCA Finance',
          name: 'Paket BCA 5 Tahun',
          min_dp_percentage: 10,
          max_dp_percentage: 50,
          tenor_months: 60,
          interest_rate_yearly: 10,
          interest_type: 'flat',
          admin_fee: FIXED_ADMIN_FEE,
          provision_fee_percentage: 1,
          fidusia_fee: FIXED_FIDUSIA_FEE,
          insurance_tlo_percentage: 0.4,
          insurance_allrisk_percentage: 2,
          life_insurance_percentage: 0.5,
          is_active: true
        }
      ];
      setParameters(dummyParameters);
    } catch (error) {
      console.error('Error fetching parameters:', error);
    }
  };

  const handleCarPriceChange = (value: string) => {
    const numValue = value.replace(/\D/g, '');
    setCarPrice(numValue);
    
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

    // Validate DP - removed alert warning
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
    const totalInitialPayment = dp + FIXED_ADMIN_FEE + provisionFee + FIXED_FIDUSIA_FEE + 
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
      admin_fee: FIXED_ADMIN_FEE,
      provision_fee: provisionFee,
      fidusia_fee: FIXED_FIDUSIA_FEE,
      life_insurance: lifeInsurance,
      vehicle_insurance_type: insuranceType,
      vehicle_insurance_yearly: vehicleInsuranceYearly,
      vehicle_insurance_total: vehicleInsuranceTotal,
      total_initial_payment: totalInitialPayment,
      total_payment: totalPayment
    };

    setSimulationResult(result);
  };

  const handleReset = () => {
    setCarPrice('199000000');
    setDownPayment('19900000');
    setDownPaymentPercentage('10');
    setSelectedPartner('');
    setSelectedParameter('');
    setInsuranceType('TLO');
    setTenor(60);
    setLocation('');
    setSimulationResult(null);
  };

  const handleSaveSimulation = async () => {
    if (!simulationResult) return;

    setIsSaving(true);
    try {
      const payload = {
        // user_id will be set by backend based on auth
        car_id: null, // Optional: link to specific car
        credit_parameter_id: selectedParameter,
        financial_partner_id: selectedPartner,
        ...simulationResult,
        is_saved: true,
        notes: `Simulasi kredit - ${location || 'Tidak ada lokasi'}`
      };

      // TODO: Replace with actual API call
      // const response = await fetch('/api/credit-simulations', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // });

      alert('Simulasi berhasil disimpan!');
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
                {/* Car Price */}
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-3">
                    Harga Mobil (Rp)
                  </label>
                  <input
                    type="text"
                    value={formatNumber(carPrice)}
                    onChange={(e) => handleCarPriceChange(e.target.value)}
                    className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="199.000.000"
                  />
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
                    className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                  >
                    <option value="">Pilih Mitra Pembiayaan</option>
                    {partners.map(partner => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))}
                  </select>
                </div>

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

                {/* Calculate Button */}
                <button
                  onClick={calculateSimulation}
                  disabled={!carPrice || !selectedPartner || !selectedParameter}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Calculator className="w-6 h-6" />
                  Hitung Simulasi
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

              {simulationResult ? (
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