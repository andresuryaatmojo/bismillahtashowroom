import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Calculator,
  Building2,
  Calendar,
  Percent,
  DollarSign,
  CheckCircle,
  XCircle,
  Filter,
  TrendingUp
} from 'lucide-react';

// Import types and services
import {
  CreditParameter,
  CreditParameterWithPartner,
  CreditParameterFormData,
  CreditParameterPayload,
  FinancialPartner
} from '../types/credit-parameters';
import {
  fetchCreditParameters,
  fetchFinancialPartners,
  createCreditParameter,
  updateCreditParameter,
  deleteCreditParameter
} from '../services/creditParameters';

const HalamanParameterKredit: React.FC = () => {
  const [parameters, setParameters] = useState<CreditParameterWithPartner[]>([]);
  const [filteredParameters, setFilteredParameters] = useState<CreditParameterWithPartner[]>([]);
  const [partners, setPartners] = useState<FinancialPartner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingParameter, setEditingParameter] = useState<CreditParameterWithPartner | null>(null);
  const [deletingParameter, setDeletingParameter] = useState<CreditParameterWithPartner | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPartner, setFilterPartner] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreditParameterFormData>({
    financial_partner_id: '',
    name: '',
    min_dp_percentage: '20',
    max_dp_percentage: '50',
    tenor_months: '12',
    interest_rate_yearly: '8',
    interest_type: 'flat',
    admin_fee: '0',
    provision_fee_percentage: '1',
    fidusia_fee: '500000',
    insurance_tlo_percentage: '0.4',
    insurance_allrisk_percentage: '2',
    life_insurance_percentage: '0.5',
    min_otr: '',
    max_otr: '',
    is_active: true,
    effective_date: new Date().toISOString().split('T')[0],
    expired_date: '',
    notes: ''
  });

  // Fetch data
  useEffect(() => {
    fetchPartners();
    fetchParameters();
  }, []);

  // Filter parameters
  useEffect(() => {
    let filtered = parameters;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(param =>
        param.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        param.financial_partner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        param.tenor_months.toString().includes(searchTerm)
      );
    }

    // Partner filter
    if (filterPartner) {
      filtered = filtered.filter(param => param.financial_partner_id === filterPartner);
    }

    // Active filter
    if (filterActive !== 'all') {
      filtered = filtered.filter(param => 
        filterActive === 'active' ? param.is_active : !param.is_active
      );
    }

    setFilteredParameters(filtered);
  }, [searchTerm, filterPartner, filterActive, parameters]);

  const fetchPartners = async () => {
    try {
      const data = await fetchFinancialPartners();
      setPartners(data);
    } catch (error) {
      console.error('Error fetching partners:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: CreditParameterPayload = {
        financial_partner_id: formData.financial_partner_id,
        name: formData.name,
        min_dp_percentage: parseFloat(formData.min_dp_percentage),
        max_dp_percentage: parseFloat(formData.max_dp_percentage),
        tenor_months: parseInt(formData.tenor_months),
        interest_rate_yearly: parseFloat(formData.interest_rate_yearly),
        interest_type: formData.interest_type,
        admin_fee: parseFloat(formData.admin_fee) || 0,
        provision_fee_percentage: parseFloat(formData.provision_fee_percentage),
        fidusia_fee: parseFloat(formData.fidusia_fee),
        insurance_tlo_percentage: parseFloat(formData.insurance_tlo_percentage),
        insurance_allrisk_percentage: parseFloat(formData.insurance_allrisk_percentage),
        life_insurance_percentage: parseFloat(formData.life_insurance_percentage),
        min_otr: formData.min_otr ? parseFloat(formData.min_otr) : null,
        max_otr: formData.max_otr ? parseFloat(formData.max_otr) : null,
        is_active: formData.is_active,
        effective_date: formData.effective_date,
        expired_date: formData.expired_date || null,
        notes: formData.notes || null
      };

      if (editingParameter) {
        const updatedParameter = await updateCreditParameter(editingParameter.id, payload);
        const updatedWithPartnerName: CreditParameterWithPartner = {
          ...updatedParameter,
          financial_partner_name: partners.find(pt => pt.id === payload.financial_partner_id)?.name || 'Unknown'
        };
        setParameters(parameters.map(p => p.id === editingParameter.id ? updatedWithPartnerName : p));
      } else {
        const newParameter = await createCreditParameter(payload);
        const newWithPartnerName: CreditParameterWithPartner = {
          ...newParameter,
          financial_partner_name: partners.find(p => p.id === payload.financial_partner_id)?.name || 'Unknown'
        };
        setParameters([...parameters, newWithPartnerName]);
      }

      handleCloseModal();
      alert(editingParameter ? 'Parameter berhasil diupdate!' : 'Parameter berhasil ditambahkan!');
    } catch (error) {
      console.error('Error saving parameter:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingParameter) return;

    setLoading(true);
    try {
      await deleteCreditParameter(deletingParameter.id);
      setParameters(parameters.filter(p => p.id !== deletingParameter.id));
      setIsDeleteModalOpen(false);
      setDeletingParameter(null);
      alert('Parameter berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting parameter:', error);
      alert('Terjadi kesalahan saat menghapus data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (parameter: CreditParameterWithPartner) => {
    setEditingParameter(parameter);
    setFormData({
      financial_partner_id: parameter.financial_partner_id || '',
      name: parameter.name,
      min_dp_percentage: parameter.min_dp_percentage.toString(),
      max_dp_percentage: parameter.max_dp_percentage.toString(),
      tenor_months: parameter.tenor_months.toString(),
      interest_rate_yearly: parameter.interest_rate_yearly.toString(),
      interest_type: parameter.interest_type,
      admin_fee: parameter.admin_fee.toString(),
      provision_fee_percentage: parameter.provision_fee_percentage.toString(),
      fidusia_fee: parameter.fidusia_fee.toString(),
      insurance_tlo_percentage: parameter.insurance_tlo_percentage.toString(),
      insurance_allrisk_percentage: parameter.insurance_allrisk_percentage.toString(),
      life_insurance_percentage: parameter.life_insurance_percentage.toString(),
      min_otr: parameter.min_otr?.toString() || '',
      max_otr: parameter.max_otr?.toString() || '',
      is_active: parameter.is_active,
      effective_date: parameter.effective_date,
      expired_date: parameter.expired_date || '',
      notes: parameter.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingParameter(null);
    setFormData({
      financial_partner_id: '',
      name: '',
      min_dp_percentage: '20',
      max_dp_percentage: '50',
      tenor_months: '12',
      interest_rate_yearly: '8',
      interest_type: 'flat',
      admin_fee: '0',
      provision_fee_percentage: '1',
      fidusia_fee: '500000',
      insurance_tlo_percentage: '0.4',
      insurance_allrisk_percentage: '2',
      life_insurance_percentage: '0.5',
      min_otr: '',
      max_otr: '',
      is_active: true,
      effective_date: new Date().toISOString().split('T')[0],
      expired_date: '',
      notes: ''
    });
  };

  const openDeleteModal = (parameter: CreditParameter) => {
    setDeletingParameter(parameter);
    setIsDeleteModalOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Parameter Kredit</h1>
          <p className="text-gray-600">Kelola parameter dan skema kredit untuk setiap partner keuangan</p>
        </div>

        {/* Actions & Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search and Add Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari parameter (nama, partner, tenor)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors w-full sm:w-auto justify-center"
              >
                <Plus className="w-5 h-5" />
                Tambah Parameter
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Filter:</span>
              </div>
              <select
                value={filterPartner}
                onChange={(e) => setFilterPartner(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Partner</option>
                {partners.map(partner => (
                  <option key={partner.id} value={partner.id}>{partner.name}</option>
                ))}
              </select>
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Parameters List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredParameters.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm || filterPartner || filterActive !== 'all' 
                ? 'Tidak ada parameter yang ditemukan' 
                : 'Belum ada parameter kredit'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredParameters.map((parameter) => (
              <div key={parameter.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{parameter.name}</h3>
                        {parameter.is_active ? (
                          <span className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Aktif
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                            <XCircle className="w-3 h-3" />
                            Tidak Aktif
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="w-4 h-4" />
                        <span className="font-medium">{parameter.financial_partner_name}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(parameter)}
                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(parameter)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Main Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {/* Tenor */}
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-blue-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-medium">Tenor</span>
                      </div>
                      <p className="text-lg font-bold text-blue-900">{parameter.tenor_months} Bulan</p>
                    </div>

                    {/* Interest Rate */}
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-600 mb-1">
                        <Percent className="w-4 h-4" />
                        <span className="text-xs font-medium">Bunga</span>
                      </div>
                      <p className="text-lg font-bold text-green-900">{parameter.interest_rate_yearly}%</p>
                      <p className="text-xs text-green-700 capitalize">{parameter.interest_type}</p>
                    </div>

                    {/* DP Range */}
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-purple-600 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xs font-medium">DP</span>
                      </div>
                      <p className="text-sm font-bold text-purple-900">
                        {parameter.min_dp_percentage}% - {parameter.max_dp_percentage}%
                      </p>
                    </div>

                    {/* Admin Fee */}
                    <div className="bg-orange-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-orange-600 mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs font-medium">Biaya Admin</span>
                      </div>
                      <p className="text-sm font-bold text-orange-900">
                        {formatCurrency(parameter.admin_fee)}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Info */}
                  <div className="border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">Biaya Provisi</p>
                        <p className="font-semibold">{parameter.provision_fee_percentage}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Biaya Fidusia</p>
                        <p className="font-semibold">{formatCurrency(parameter.fidusia_fee)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Asuransi Jiwa</p>
                        <p className="font-semibold">{parameter.life_insurance_percentage}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Asuransi TLO</p>
                        <p className="font-semibold">{parameter.insurance_tlo_percentage}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Asuransi Allrisk</p>
                        <p className="font-semibold">{parameter.insurance_allrisk_percentage}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Periode Efektif</p>
                        <p className="font-semibold">
                          {new Date(parameter.effective_date).toLocaleDateString('id-ID')}
                          {parameter.expired_date && ` - ${new Date(parameter.expired_date).toLocaleDateString('id-ID')}`}
                        </p>
                      </div>
                    </div>

                    {/* OTR Range */}
                    {(parameter.min_otr || parameter.max_otr) && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Range OTR</p>
                        <p className="text-sm font-semibold">
                          {parameter.min_otr && formatCurrency(parameter.min_otr)}
                          {parameter.min_otr && parameter.max_otr && ' - '}
                          {parameter.max_otr && formatCurrency(parameter.max_otr)}
                        </p>
                      </div>
                    )}

                    {/* Notes */}
                    {parameter.notes && (
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-xs text-yellow-800 font-medium mb-1">Catatan:</p>
                        <p className="text-sm text-yellow-900">{parameter.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full my-8 max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
              <div className="p-6 border-b bg-white rounded-t-lg flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingParameter ? 'Edit Parameter Kredit' : 'Tambah Parameter Kredit Baru'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 pb-20">
                <div className="space-y-6">
                  {/* Basic Info Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Financial Partner */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Partner Keuangan <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={formData.financial_partner_id}
                          onChange={(e) => setFormData({ ...formData, financial_partner_id: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Pilih Partner</option>
                          {partners.map(partner => (
                            <option key={partner.id} value={partner.id}>
                              {partner.name} ({partner.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Name */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama Paket <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="contoh: Paket Mandiri 1 Tahun"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Credit Terms Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ketentuan Kredit</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Tenor */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tenor (Bulan) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={formData.tenor_months}
                          onChange={(e) => setFormData({ ...formData, tenor_months: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="12"
                        />
                      </div>

                      {/* Interest Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipe Bunga <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={formData.interest_type}
                          onChange={(e) => setFormData({ ...formData, interest_type: e.target.value as any })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="flat">Flat</option>
                          <option value="efektif">Efektif</option>
                          <option value="anuitas">Anuitas</option>
                        </select>
                      </div>

                      {/* Interest Rate */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bunga Tahunan (%) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0"
                          value={formData.interest_rate_yearly}
                          onChange={(e) => setFormData({ ...formData, interest_rate_yearly: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="8.00"
                        />
                      </div>

                      {/* Min DP */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          DP Minimum (%) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0"
                          max="100"
                          value={formData.min_dp_percentage}
                          onChange={(e) => setFormData({ ...formData, min_dp_percentage: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="20"
                        />
                      </div>

                      {/* Max DP */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          DP Maksimum (%) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0"
                          max="100"
                          value={formData.max_dp_percentage}
                          onChange={(e) => setFormData({ ...formData, max_dp_percentage: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fees Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Biaya-Biaya</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Admin Fee */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Biaya Admin (Rp)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.admin_fee}
                          onChange={(e) => setFormData({ ...formData, admin_fee: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                      </div>

                      {/* Provision Fee */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Biaya Provisi (%) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0"
                          value={formData.provision_fee_percentage}
                          onChange={(e) => setFormData({ ...formData, provision_fee_percentage: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="1"
                        />
                      </div>

                      {/* Fidusia Fee */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Biaya Fidusia (Rp) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={formData.fidusia_fee}
                          onChange={(e) => setFormData({ ...formData, fidusia_fee: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="500000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Insurance Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Asuransi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Life Insurance */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Asuransi Jiwa (%) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0"
                          value={formData.life_insurance_percentage}
                          onChange={(e) => setFormData({ ...formData, life_insurance_percentage: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.5"
                        />
                      </div>

                      {/* TLO Insurance */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Asuransi TLO (%) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0"
                          value={formData.insurance_tlo_percentage}
                          onChange={(e) => setFormData({ ...formData, insurance_tlo_percentage: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0.4"
                        />
                      </div>

                      {/* Allrisk Insurance */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Asuransi Allrisk (%) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0"
                          value={formData.insurance_allrisk_percentage}
                          onChange={(e) => setFormData({ ...formData, insurance_allrisk_percentage: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* OTR Range Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Batasan OTR (Opsional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Min OTR */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          OTR Minimum (Rp)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.min_otr}
                          onChange={(e) => setFormData({ ...formData, min_otr: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="50000000"
                        />
                      </div>

                      {/* Max OTR */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          OTR Maksimum (Rp)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.max_otr}
                          onChange={(e) => setFormData({ ...formData, max_otr: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="500000000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Validity Period Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Periode Berlaku</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Effective Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tanggal Efektif <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.effective_date}
                          onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Expired Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tanggal Berakhir (Opsional)
                        </label>
                        <input
                          type="date"
                          value={formData.expired_date}
                          onChange={(e) => setFormData({ ...formData, expired_date: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catatan
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Catatan tambahan tentang parameter ini"
                    />
                  </div>

                  {/* Active Status */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Parameter Aktif</span>
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 mt-6 pt-6 border-t bg-white sticky bottom-0 pb-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Menyimpan...' : editingParameter ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && deletingParameter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Parameter?</h3>
                <p className="text-gray-600 mb-6">
                  Apakah Anda yakin ingin menghapus parameter <strong>{deletingParameter.name}</strong>?
                  Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setDeletingParameter(null);
                    }}
                    className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Menghapus...' : 'Hapus'}
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

export default HalamanParameterKredit;