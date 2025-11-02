import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Types
interface FinancialPartner {
  id: string;
  name: string;
  code: string;
  type: string;
  logo_url?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  is_active: boolean;
  commission_rate?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface FormData {
  name: string;
  code: string;
  type: string;
  logo_url: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  is_active: boolean;
  commission_rate: string;
  notes: string;
}

const HalamanKemitraan: React.FC = () => {
  const [partners, setPartners] = useState<FinancialPartner[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<FinancialPartner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<FinancialPartner | null>(null);
  const [deletingPartner, setDeletingPartner] = useState<FinancialPartner | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    type: 'Bank',
    logo_url: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    is_active: true,
    commission_rate: '',
    notes: ''
  });

  // Fetch partners
  useEffect(() => {
    fetchPartners();
  }, []);

  // Filter partners
  useEffect(() => {
    const filtered = partners.filter(partner => 
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPartners(filtered);
  }, [searchTerm, partners]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await fetch('/api/financial-partners');
      // const data = await response.json();
      // setPartners(data);
      
      // Dummy data for demo
      const dummyData: FinancialPartner[] = [
        {
          id: '1',
          name: 'Bank Mandiri',
          code: 'BM001',
          type: 'Bank',
          logo_url: '',
          contact_person: 'John Doe',
          contact_email: 'john@mandiri.com',
          contact_phone: '081234567890',
          address: 'Jakarta',
          is_active: true,
          commission_rate: 2.5,
          notes: 'Partner utama',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setPartners(dummyData);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        commission_rate: formData.commission_rate ? parseFloat(formData.commission_rate) : null
      };

      if (editingPartner) {
        // TODO: Replace with actual API call
        // await fetch(`/api/financial-partners/${editingPartner.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(payload)
        // });
        
        setPartners(partners.map(p =>
          p.id === editingPartner.id
            ? {
                ...p,
                ...payload,
                commission_rate: payload.commission_rate || undefined,
                updated_at: new Date().toISOString()
              }
            : p
        ));
      } else {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/financial-partners', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(payload)
        // });
        
        const newPartner: FinancialPartner = {
          id: Date.now().toString(),
          ...payload,
          commission_rate: payload.commission_rate || undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setPartners([...partners, newPartner]);
      }

      handleCloseModal();
      alert(editingPartner ? 'Partner berhasil diupdate!' : 'Partner berhasil ditambahkan!');
    } catch (error) {
      console.error('Error saving partner:', error);
      alert('Terjadi kesalahan saat menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPartner) return;

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/financial-partners/${deletingPartner.id}`, {
      //   method: 'DELETE'
      // });
      
      setPartners(partners.filter(p => p.id !== deletingPartner.id));
      setIsDeleteModalOpen(false);
      setDeletingPartner(null);
      alert('Partner berhasil dihapus!');
    } catch (error) {
      console.error('Error deleting partner:', error);
      alert('Terjadi kesalahan saat menghapus data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (partner: FinancialPartner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      code: partner.code,
      type: partner.type,
      logo_url: partner.logo_url || '',
      contact_person: partner.contact_person || '',
      contact_email: partner.contact_email || '',
      contact_phone: partner.contact_phone || '',
      address: partner.address || '',
      is_active: partner.is_active,
      commission_rate: partner.commission_rate?.toString() || '',
      notes: partner.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPartner(null);
    setFormData({
      name: '',
      code: '',
      type: 'Bank',
      logo_url: '',
      contact_person: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      is_active: true,
      commission_rate: '',
      notes: ''
    });
  };

  const openDeleteModal = (partner: FinancialPartner) => {
    setDeletingPartner(partner);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Kemitraan Keuangan</h1>
          <p className="text-gray-600">Kelola partner keuangan untuk layanan kredit</p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari partner (nama, kode, tipe)..."
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
              Tambah Partner
            </button>
          </div>
        </div>

        {/* Partners Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'Tidak ada partner yang ditemukan' : 'Belum ada partner keuangan'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.map((partner) => (
              <div key={partner.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                        <p className="text-sm text-gray-500">{partner.code}</p>
                      </div>
                    </div>
                    {partner.is_active ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 className="w-4 h-4" />
                      <span>{partner.type}</span>
                    </div>
                    {partner.contact_person && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-medium">{partner.contact_person}</span>
                      </div>
                    )}
                    {partner.contact_email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{partner.contact_email}</span>
                      </div>
                    )}
                    {partner.contact_phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{partner.contact_phone}</span>
                      </div>
                    )}
                    {partner.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{partner.address}</span>
                      </div>
                    )}
                    {partner.commission_rate && (
                      <div className="mt-2 inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                        Komisi: {partner.commission_rate}%
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => handleEdit(partner)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(partner)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPartner ? 'Edit Partner' : 'Tambah Partner Baru'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Partner <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contoh: Bank Mandiri"
                    />
                  </div>

                  {/* Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kode Partner <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contoh: BM001"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipe Partner <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Bank">Bank</option>
                      <option value="Leasing">Leasing</option>
                      <option value="Multifinance">Multifinance</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  {/* Contact Person */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.contact_person}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contoh: John Doe"
                    />
                  </div>

                  {/* Contact Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Kontak
                    </label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contoh: contact@bank.com"
                    />
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contoh: 081234567890"
                    />
                  </div>

                  {/* Commission Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Komisi (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.commission_rate}
                      onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contoh: 2.5"
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Alamat lengkap partner"
                    />
                  </div>

                  {/* Logo URL */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Logo
                    </label>
                    <input
                      type="url"
                      value={formData.logo_url}
                      onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catatan
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Catatan tambahan tentang partner"
                    />
                  </div>

                  {/* Active Status */}
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Partner Aktif</span>
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Menyimpan...' : editingPartner ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && deletingPartner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Partner?</h3>
                <p className="text-gray-600 mb-6">
                  Apakah Anda yakin ingin menghapus partner <strong>{deletingPartner.name}</strong>?
                  Tindakan ini tidak dapat dibatalkan.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsDeleteModalOpen(false);
                      setDeletingPartner(null);
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

export default HalamanKemitraan;