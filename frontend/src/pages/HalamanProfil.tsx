// src/pages/HalamanProfil.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Shield, Settings, Key, Bell, Trash2, CheckCircle, Loader2, AlertCircle, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabaseAdmin';
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

interface NotificationPreferences {
  emailNewsletter: boolean;
  emailPromotion: boolean;
  emailTransaction: boolean;
  pushNewCar: boolean;
  pushPriceUpdate: boolean;
  pushMessage: boolean;
}

const HalamanProfil: React.FC = () => {
  const { profile, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Dialog close timeout ref
  const dialogCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Dialog states
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    emailNewsletter: false,
    emailPromotion: false,
    emailTransaction: true,
    pushNewCar: false,
    pushPriceUpdate: false,
    pushMessage: true,
  });
  const [notificationLoading, setNotificationLoading] = useState(false);

  // Delete account states
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
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

  // Load profile data
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
      });

      // Load notification preferences from profile.preferences
      if (profile.preferences?.notifications) {
        setNotificationPrefs(profile.preferences.notifications);
      }
    }
  }, [profile]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dialogCloseTimeoutRef.current) {
        clearTimeout(dialogCloseTimeoutRef.current);
      }
    };
  }, []);



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

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nama lengkap wajib diisi';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Nama lengkap minimal 2 karakter';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username wajib diisi';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username minimal 3 karakter';
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(formData.username.trim())) {
      newErrors.username = 'Username hanya boleh huruf, angka, underscore, titik, dan dash';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Format email tidak valid';
    }

    if (formData.phoneNumber.trim()) {
      const cleanPhone = formData.phoneNumber.replace(/[\s\-\+\(\)]/g, '');
      if (!/^(62|0)[0-9]{8,13}$/.test(cleanPhone)) {
        newErrors.phoneNumber = 'Format nomor telepon tidak valid (contoh: 08123456789)';
      }
    }

    if (formData.address.trim() && formData.address.trim().length < 10) {
      newErrors.address = 'Alamat minimal 10 karakter';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
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
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Update error:', error);
        
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
      await refreshProfile();
      setSaveSuccess(true);
      setIsEditing(false);

      setTimeout(() => setSaveSuccess(false), 3000);

    } catch (err: any) {
      console.error('❌ Save profile error:', err);
      setSaveError(err.message || 'Terjadi kesalahan saat menyimpan');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
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

  // ===== PASSWORD CHANGE HANDLERS =====
  const validatePasswordForm = (): boolean => {
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Password lama wajib diisi';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'Password baru wajib diisi';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password minimal 6 karakter';
    } else if (passwordData.newPassword === passwordData.currentPassword) {
      errors.newPassword = 'Password baru harus berbeda dengan password lama';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (passwordData.confirmPassword !== passwordData.newPassword) {
      errors.confirmPassword = 'Konfirmasi password tidak cocok';
    }

    setPasswordErrors(errors);
    return Object.values(errors).every(err => err === '');
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    setPasswordLoading(true);

    try {
      console.log('🔄 Changing password...');

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (updateError) {
        console.error('❌ Password update error:', updateError);
        
        if (updateError.message.includes('New password should be different')) {
          setPasswordErrors(prev => ({
            ...prev,
            newPassword: 'Password baru harus berbeda dari password lama',
          }));
        } else {
          alert('Gagal mengubah password: ' + updateError.message);
        }
        setPasswordLoading(false);
        return;
      }

      console.log('✅ Password changed successfully');
      
      // CRITICAL: Set loading false BEFORE closing dialog
      setPasswordLoading(false);
      
      // Clear any existing timeout
      if (dialogCloseTimeoutRef.current) {
        clearTimeout(dialogCloseTimeoutRef.current);
      }
      
      // Force close dialog dengan batch state update
      // Gunakan callback untuk memastikan urutan eksekusi
      Promise.resolve().then(() => {
        setShowPasswordDialog(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setPasswordErrors({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      }).then(() => {
        // Alert setelah semua state di-reset
        dialogCloseTimeoutRef.current = setTimeout(() => {
          alert('Password berhasil diubah!');
        }, 200);
      });

    } catch (error: any) {
      console.error('❌ Error changing password:', error);
      setPasswordLoading(false);
      alert('Terjadi kesalahan: ' + error.message);
    }
  };

  // ===== NOTIFICATION HANDLERS =====
  const handleSaveNotifications = async () => {
    if (!profile?.id) return;

    setNotificationLoading(true);

    try {
      console.log('🔄 Saving notification preferences...');

      const updatedPreferences = {
        ...(profile.preferences || {}),
        notifications: notificationPrefs,
      };

      const { error } = await supabase
        .from('users')
        .update({
          preferences: updatedPreferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) {
        console.error('❌ Error saving preferences:', error);
        alert('Gagal menyimpan preferensi: ' + error.message);
        return;
      }

      console.log('✅ Notification preferences saved');
      await refreshProfile();
      alert('Preferensi notifikasi berhasil disimpan!');
      setShowNotificationDialog(false);

    } catch (error: any) {
      console.error('❌ Error:', error);
      alert('Terjadi kesalahan: ' + error.message);
    } finally {
      setNotificationLoading(false);
    }
  };

  // ===== DELETE ACCOUNT HANDLER =====
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'HAPUS') {
      alert('Ketik "HAPUS" untuk konfirmasi');
      return;
    }

    if (!profile?.id || !profile?.auth_user_id) {
      alert('User ID tidak ditemukan');
      return;
    }

    setDeleteLoading(true);

    try {
      console.log('🗑️ [DELETE] Starting delete process...');
      console.log('📋 User ID:', profile.id);
      console.log('📋 Auth User ID:', profile.auth_user_id);

      // Method 1: Hapus dari auth.users dulu (menggunakan admin client)
      console.log('🗑️ [DELETE] Deleting from auth.users...');
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
        profile.auth_user_id
      );

      if (authError) {
        console.error('❌ [ERROR] Auth delete failed:', authError);
        alert('Gagal menghapus akun auth: ' + authError.message);
        setDeleteLoading(false);
        return;
      }

      console.log('✅ [SUCCESS] Deleted from auth.users');

      // Method 2: Hapus dari public.users (menggunakan admin client untuk bypass RLS)
      console.log('🗑️ [DELETE] Deleting from public.users...');
      const { error: publicError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', profile.id);

      if (publicError) {
        console.error('❌ [ERROR] Public delete failed:', publicError);
        // Continue anyway karena auth sudah terhapus
      } else {
        console.log('✅ [SUCCESS] Deleted from public.users');
      }

      // Tutup dialog
      setShowDeleteDialog(false);
      setDeleteLoading(false);

      alert('Akun berhasil dihapus! Anda akan dialihkan ke halaman login.');

      // Logout dan redirect
      console.log('👋 [LOGOUT] Logging out...');
      await logout();
      navigate('/login');

    } catch (error: any) {
      console.error('❌ [EXCEPTION] Error:', error);
      alert('Terjadi kesalahan: ' + error.message);
      setDeleteLoading(false);
    }
  };

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
                {profile.is_verified && (
                  <div className="flex justify-center items-center gap-2 mb-4">
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Terverifikasi
                    </Badge>
                  </div>
                )}
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
                {/* Ubah Password */}
                <Button 
                  variant="outline" 
                  className="h-16 flex items-center justify-start gap-3 p-4"
                  onClick={() => setShowPasswordDialog(true)}
                >
                  <Key className="w-5 h-5 text-orange-500" />
                  <div className="text-left">
                    <p className="font-semibold">Ubah Password</p>
                    <p className="text-xs text-gray-500">Perbarui password akun Anda</p>
                  </div>
                </Button>
                
                {/* Verifikasi Akun - DISABLED */}
                <Button 
                  variant="outline" 
                  className="h-16 flex items-center justify-start gap-3 p-4 opacity-50 cursor-not-allowed"
                  disabled
                >
                  <Shield className="w-5 h-5 text-blue-500" />
                  <div className="text-left">
                    <p className="font-semibold">Verifikasi Akun</p>
                    <p className="text-xs text-gray-500">
                      {profile.is_verified ? 'Akun sudah terverifikasi' : 'Fitur dalam pengembangan'}
                    </p>
                  </div>
                </Button>
                
                {/* Notifikasi */}
                <Button 
                  variant="outline" 
                  className="h-16 flex items-center justify-start gap-3 p-4"
                  onClick={() => setShowNotificationDialog(true)}
                >
                  <Bell className="w-5 h-5 text-purple-500" />
                  <div className="text-left">
                    <p className="font-semibold">Notifikasi</p>
                    <p className="text-xs text-gray-500">Atur preferensi notifikasi</p>
                  </div>
                </Button>
                
                {/* Hapus Akun */}
                <Button 
                  variant="outline" 
                  className="h-16 flex items-center justify-start gap-3 p-4 border-red-200 hover:bg-red-50"
                  onClick={() => setShowDeleteDialog(true)}
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

      {/* ===== DIALOG: CHANGE PASSWORD ===== */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Ubah Password
            </DialogTitle>
            <DialogDescription>
              Masukkan password lama dan password baru Anda
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Password Lama */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Password Lama *</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => {
                    setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }));
                    setPasswordErrors(prev => ({ ...prev, currentPassword: '' }));
                  }}
                  className={passwordErrors.currentPassword ? "border-red-500" : ""}
                  placeholder="Masukkan password lama"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-sm text-red-500">{passwordErrors.currentPassword}</p>
              )}
            </div>

            {/* Password Baru */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Password Baru *</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    setPasswordData(prev => ({ ...prev, newPassword: e.target.value }));
                    setPasswordErrors(prev => ({ ...prev, newPassword: '' }));
                  }}
                  className={passwordErrors.newPassword ? "border-red-500" : ""}
                  placeholder="Minimal 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-sm text-red-500">{passwordErrors.newPassword}</p>
              )}
            </div>

            {/* Konfirmasi Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password Baru *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => {
                    setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }));
                    setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }}
                  className={passwordErrors.confirmPassword ? "border-red-500" : ""}
                  placeholder="Ulangi password baru"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-red-500">{passwordErrors.confirmPassword}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  setPasswordErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                disabled={passwordLoading}
              >
                Batal
              </Button>
              <Button
                className="flex-1"
                onClick={handleChangePassword}
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengubah...
                  </>
                ) : (
                  'Ubah Password'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== DIALOG: NOTIFICATION PREFERENCES ===== */}
      <Dialog open={showNotificationDialog} onOpenChange={setShowNotificationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Pengaturan Notifikasi
            </DialogTitle>
            <DialogDescription>
              Pilih jenis notifikasi yang ingin Anda terima
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Notifikasi Email</h4>
              
              <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm">Newsletter</p>
                    <p className="text-xs text-gray-500">Berita dan artikel terbaru</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.emailNewsletter}
                  onChange={(e) => setNotificationPrefs(prev => ({ 
                    ...prev, 
                    emailNewsletter: e.target.checked 
                  }))}
                  className="w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm">Promosi</p>
                    <p className="text-xs text-gray-500">Penawaran dan diskon spesial</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.emailPromotion}
                  onChange={(e) => setNotificationPrefs(prev => ({ 
                    ...prev, 
                    emailPromotion: e.target.checked 
                  }))}
                  className="w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm">Transaksi</p>
                    <p className="text-xs text-gray-500">Update status transaksi</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.emailTransaction}
                  onChange={(e) => setNotificationPrefs(prev => ({ 
                    ...prev, 
                    emailTransaction: e.target.checked 
                  }))}
                  className="w-4 h-4"
                />
              </label>
            </div>

            {/* Push Notifications */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Notifikasi Push</h4>
              
              <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm">Mobil Baru</p>
                    <p className="text-xs text-gray-500">Notifikasi mobil baru tersedia</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.pushNewCar}
                  onChange={(e) => setNotificationPrefs(prev => ({ 
                    ...prev, 
                    pushNewCar: e.target.checked 
                  }))}
                  className="w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm">Update Harga</p>
                    <p className="text-xs text-gray-500">Perubahan harga mobil favorit</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.pushPriceUpdate}
                  onChange={(e) => setNotificationPrefs(prev => ({ 
                    ...prev, 
                    pushPriceUpdate: e.target.checked 
                  }))}
                  className="w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm">Pesan</p>
                    <p className="text-xs text-gray-500">Pesan baru dari penjual/pembeli</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.pushMessage}
                  onChange={(e) => setNotificationPrefs(prev => ({ 
                    ...prev, 
                    pushMessage: e.target.checked 
                  }))}
                  className="w-4 h-4"
                />
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowNotificationDialog(false);
                  // Reset to original preferences
                  if (profile?.preferences?.notifications) {
                    setNotificationPrefs(profile.preferences.notifications);
                  }
                }}
                disabled={notificationLoading}
              >
                Batal
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveNotifications}
                disabled={notificationLoading}
              >
                {notificationLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Preferensi'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== DIALOG: DELETE ACCOUNT ===== */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Hapus Akun Permanen
            </DialogTitle>
            <DialogDescription className="text-red-600">
              ⚠️ PERINGATAN: Tindakan ini tidak dapat dibatalkan!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
              <p className="font-semibold text-sm text-red-800">Dengan menghapus akun, Anda akan:</p>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>Kehilangan semua data profil</li>
                <li>Kehilangan riwayat transaksi</li>
                <li>Kehilangan daftar favorit</li>
                <li>Tidak dapat login lagi dengan akun ini</li>
                <li>Email tidak dapat digunakan untuk registrasi ulang</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deleteConfirm">
                Ketik <strong>"HAPUS"</strong> untuk konfirmasi
              </Label>
              <Input
                id="deleteConfirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Ketik HAPUS"
                className="uppercase"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirmText('');
                }}
                disabled={deleteLoading}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteAccount}
                disabled={deleteLoading || deleteConfirmText !== 'HAPUS'}
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  'Hapus Akun'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HalamanProfil;