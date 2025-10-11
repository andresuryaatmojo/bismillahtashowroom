// src/pages/HalamanProfil.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Shield, Settings, Key, Bell, Trash2, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface FormErrors {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  province: string;
}

const HalamanProfil: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    currentMode: 'buyer' as 'buyer' | 'seller',
  });

  const [errors, setErrors] = useState<FormErrors>({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    province: '',
  });

  // Load profile data saat component mount atau profile berubah
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        username: profile.username || '',
        email: profile.email || '',
        phoneNumber: profile.phone_number || '',
        address: profile.address || '',
        city: profile.city || '',
        province: profile.province || '',
        postalCode: profile.postal_code || '',
        currentMode: profile.current_mode || 'buyer',
      });
    }
  }, [profile]);

  // Validasi form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      fullName: '',
      username: '',
      email: '',
      phoneNumber: '',
      address: '',
      city: '',
      province: '',
    };

    // Validasi nama lengkap
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nama lengkap wajib diisi';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Nama lengkap minimal 2 karakter';
    } else if (formData.fullName.trim().length > 255) {
      newErrors.fullName = 'Nama lengkap maksimal 255 karakter';
    }

    // Validasi username
    if (!formData.username.trim()) {
      newErrors.username = 'Username wajib diisi';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username minimal 3 karakter';
    } else if (formData.username.trim().length > 50) {
      newErrors.username = 'Username maksimal 50 karakter';
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(formData.username.trim())) {
      newErrors.username = 'Username hanya boleh huruf, angka, underscore, titik, dan dash';
    }

    // Validasi email
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Format email tidak valid';
    }

    // Validasi nomor telepon (optional tapi jika diisi harus valid)
    if (formData.phoneNumber.trim()) {
      const cleanPhone = formData.phoneNumber.replace(/[\s\-\+\(\)]/g, '');
      if (!/^(62|0)[0-9]{8,13}$/.test(cleanPhone)) {
        newErrors.phoneNumber = 'Format nomor telepon tidak valid (contoh: 08123456789)';
      }
    }

    // Validasi alamat (optional)
    if (formData.address.trim() && formData.address.trim().length < 10) {
      newErrors.address = 'Alamat minimal 10 karakter';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error saat user mengetik
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Clear save messages
    setSaveSuccess(false);
    setSaveError('');
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setSaveError('Mohon perbaiki kesalahan pada form');
      return;
    }

    if (!profile?.id) {
      setSaveError('User ID tidak ditemukan');
      return;
    }

    setLoading(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      console.log('🔄 Updating profile for user:', profile.id);

      // Update ke database
      const { data, error } = await supabase
        .from('users')
        .update({
          full_name: formData.fullName.trim(),
          username: formData.username.trim(),
          email: formData.email.trim(),
          phone_number: formData.phoneNumber.trim() || null,
          address: formData.address.trim() || null,
          city: formData.city.trim() || null,
          province: formData.province.trim() || null,
          postal_code: formData.postalCode.trim() || null,
          current_mode: formData.currentMode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Update error:', error);
        
        // Handle specific errors
        if (error.code === '23505') {
          if (error.message.includes('username')) {
            setSaveError('Username sudah digunakan');
          } else if (error.message.includes('email')) {
            setSaveError('Email sudah digunakan');
          } else {
            setSaveError('Data sudah digunakan oleh user lain');
          }
        } else {
          setSaveError(error.message || 'Gagal menyimpan perubahan');
        }
        return;
      }

      console.log('✅ Profile updated:', data);

      // Refresh profile di AuthContext
      await refreshProfile();

      // Success feedback
      setSaveSuccess(true);
      setIsEditing(false);

      // Auto-hide success message
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);

    } catch (err: any) {
      console.error('❌ Save profile error:', err);
      setSaveError(err.message || 'Terjadi kesalahan saat menyimpan');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form ke data profil asli
    if (profile) {
      setFormData({
        fullName: profile.full_name || '',
        username: profile.username || '',
        email: profile.email || '',
        phoneNumber: profile.phone_number || '',
        address: profile.address || '',
        city: profile.city || '',
        province: profile.province || '',
        postalCode: profile.postal_code || '',
        currentMode: profile.current_mode || 'buyer',
      });
    }

    setErrors({
      fullName: '',
      username: '',
      email: '',
      phoneNumber: '',
      address: '',
      city: '',
      province: '',
    });

    setSaveError('');
    setSaveSuccess(false);
    setIsEditing(false);
  };

  // Redirect jika tidak ada profile
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Profil Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-4">
              Silakan login kembali untuk mengakses halaman profil
            </p>
            <Button onClick={() => navigate('/login')}>
              Ke Halaman Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const modeOptions = [
    { value: 'buyer', label: 'Mode Pembeli' },
    { value: 'seller', label: 'Mode Penjual' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
          <p className="text-gray-600 mt-1">Kelola informasi profil dan pengaturan akun Anda</p>
        </motion.div>

        {/* Success Alert */}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">Profil berhasil diperbarui!</p>
            </div>
          </motion.div>
        )}

        {/* Error Alert */}
        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">{saveError}</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="shadow-lg">
              <CardContent className="text-center p-8">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={profile.profile_picture || undefined} alt={profile.full_name} />
                  <AvatarFallback className="bg-orange-100 text-orange-600 text-2xl">
                    {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold mb-2">{profile.full_name}</h3>
                <p className="text-gray-600 mb-2">@{profile.username}</p>
                <div className="flex justify-center items-center gap-2 mb-4">
                  <Badge 
                    variant={profile.current_mode === 'buyer' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {modeOptions.find(m => m.value === profile.current_mode)?.label}
                  </Badge>
                  {profile.is_verified && (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Terverifikasi
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Member sejak {new Date(profile.registered_at).getFullYear()}
                </p>
                
                <Button
                  variant={isEditing ? "outline" : "default"}
                  className="w-full mt-6"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={loading}
                >
                  {isEditing ? 'Batal Edit' : 'Edit Profil'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Profile Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informasi Pribadi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nama Lengkap */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nama Lengkap *
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      readOnly={!isEditing}
                      className={`${!isEditing ? "bg-gray-50" : ""} ${errors.fullName ? "border-red-500" : ""}`}
                      placeholder="Masukkan nama lengkap"
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Username *
                    </Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      readOnly={!isEditing}
                      className={`${!isEditing ? "bg-gray-50" : ""} ${errors.username ? "border-red-500" : ""}`}
                      placeholder="username"
                    />
                    {errors.username && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.username}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email *
                    </Label>
                    <Input
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      type="email"
                      readOnly={!isEditing}
                      className={`${!isEditing ? "bg-gray-50" : ""} ${errors.email ? "border-red-500" : ""}`}
                      placeholder="email@example.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Nomor Telepon */}
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Nomor Telepon
                    </Label>
                    <Input
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      readOnly={!isEditing}
                      className={`${!isEditing ? "bg-gray-50" : ""} ${errors.phoneNumber ? "border-red-500" : ""}`}
                      placeholder="08123456789"
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>

                {/* Alamat */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Alamat Lengkap
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    readOnly={!isEditing}
                    className={`${!isEditing ? "bg-gray-50" : ""} ${errors.address ? "border-red-500" : ""}`}
                    placeholder="Jl. Contoh No. 123"
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Kota */}
                  <div className="space-y-2">
                    <Label htmlFor="city">Kota</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="Jakarta"
                    />
                  </div>

                  {/* Provinsi */}
                  <div className="space-y-2">
                    <Label htmlFor="province">Provinsi</Label>
                    <Input
                      id="province"
                      value={formData.province}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="DKI Jakarta"
                    />
                  </div>

                  {/* Kode Pos */}
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Kode Pos</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      readOnly={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                      placeholder="12345"
                    />
                  </div>
                </div>

                {/* Mode */}
                <div className="space-y-2">
                  <Label htmlFor="currentMode" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Mode Akun
                  </Label>
                  <Select 
                    value={formData.currentMode} 
                    onValueChange={(value) => handleInputChange('currentMode', value as 'buyer' | 'seller')}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                      <SelectValue placeholder="Pilih mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {modeOptions.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Mode pembeli untuk membeli mobil, mode penjual untuk menjual mobil
                  </p>
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={handleSave}
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        'Simpan Perubahan'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="flex-1"
                      disabled={loading}
                    >
                      Batal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8"
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Pengaturan Akun
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Button variant="outline" className="h-16 flex items-center justify-start gap-3 p-4">
                  <Key className="w-5 h-5 text-orange-500" />
                  <div className="text-left">
                    <p className="font-semibold">Ubah Password</p>
                    <p className="text-xs text-gray-500">Perbarui password akun Anda</p>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-16 flex items-center justify-start gap-3 p-4">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <div className="text-left">
                    <p className="font-semibold">Verifikasi Akun</p>
                    <p className="text-xs text-gray-500">
                      {profile.is_verified ? 'Akun sudah terverifikasi' : 'Tingkatkan keamanan akun'}
                    </p>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-16 flex items-center justify-start gap-3 p-4">
                  <Bell className="w-5 h-5 text-purple-500" />
                  <div className="text-left">
                    <p className="font-semibold">Notifikasi</p>
                    <p className="text-xs text-gray-500">Atur preferensi notifikasi</p>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-16 flex items-center justify-start gap-3 p-4 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    if (window.confirm('Apakah Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.')) {
                      console.log('Delete account requested');
                    }
                  }}
                >
                  <Trash2 className="w-5 h-5 text-red-500" />
                  <div className="text-left">
                    <p className="font-semibold text-red-600">Hapus Akun</p>
                    <p className="text-xs text-gray-500">Hapus akun secara permanen</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default HalamanProfil;