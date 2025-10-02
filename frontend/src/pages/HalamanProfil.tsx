import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Shield, Settings, Key, Bell, Trash2, CheckCircle } from 'lucide-react';

const HalamanProfil: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    fullName: 'John Doe',
    username: 'johndoe',
    email: 'john.doe@example.com',
    phoneNumber: '+62 812-3456-7890',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    role: 'buyer',
    profilePicture: 'https://i.pravatar.cc/150?u=john',
    isVerified: true,
    memberSince: '2023'
  });

  // State untuk error validasi
  const [errors, setErrors] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    address: '',
    role: ''
  });

  // Fungsi validasi profil
  const validateProfile = () => {
    const newErrors = {
      fullName: '',
      username: '',
      email: '',
      phoneNumber: '',
      address: '',
      role: ''
    };

    // Validasi nama lengkap
    if (!userData.fullName.trim()) {
      newErrors.fullName = 'Nama lengkap wajib diisi';
    } else if (userData.fullName.trim().length < 2) {
      newErrors.fullName = 'Nama lengkap minimal 2 karakter';
    } else if (userData.fullName.trim().length > 100) {
      newErrors.fullName = 'Nama lengkap maksimal 100 karakter';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(userData.fullName.trim())) {
      newErrors.fullName = 'Nama lengkap hanya boleh mengandung huruf, spasi, titik, apostrof, dan tanda hubung';
    }

    // Validasi username
    if (!userData.username.trim()) {
      newErrors.username = 'Username wajib diisi';
    } else if (userData.username.trim().length < 3) {
      newErrors.username = 'Username minimal 3 karakter';
    } else if (userData.username.trim().length > 30) {
      newErrors.username = 'Username maksimal 30 karakter';
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(userData.username.trim())) {
      newErrors.username = 'Username hanya boleh mengandung huruf, angka, underscore, titik, dan tanda hubung';
    } else if (/^[0-9]/.test(userData.username.trim())) {
      newErrors.username = 'Username tidak boleh dimulai dengan angka';
    }

    // Validasi email
    if (!userData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (userData.email.trim().length > 254) {
      newErrors.email = 'Email maksimal 254 karakter';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email.trim())) {
      newErrors.email = 'Format email tidak valid';
    } else if (userData.email.includes('..')) {
      newErrors.email = 'Email tidak boleh mengandung titik berturut-turut';
    }

    // Validasi nomor telepon
    if (!userData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Nomor telepon wajib diisi';
    } else {
      const cleanPhone = userData.phoneNumber.replace(/[\s\-\+\(\)]/g, '');
      if (!/^(62|0)[0-9]{8,13}$/.test(cleanPhone)) {
        newErrors.phoneNumber = 'Format nomor telepon Indonesia tidak valid (contoh: +62812345678 atau 08123456789)';
      }
    }

    // Validasi alamat
    if (!userData.address.trim()) {
      newErrors.address = 'Alamat wajib diisi';
    } else if (userData.address.trim().length < 10) {
      newErrors.address = 'Alamat minimal 10 karakter';
    } else if (userData.address.trim().length > 500) {
      newErrors.address = 'Alamat maksimal 500 karakter';
    }

    // Validasi role
    if (!userData.role) {
      newErrors.role = 'Peran wajib dipilih';
    } else if (!['buyer', 'seller', 'dealer'].includes(userData.role)) {
      newErrors.role = 'Peran tidak valid';
    }

    // Deteksi pola berbahaya
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /(union|select|insert|update|delete|drop|create|alter|exec|execute)\s+/gi
    ];

    const allFields = [userData.fullName, userData.username, userData.email, userData.phoneNumber, userData.address];
    
    for (const field of allFields) {
      for (const pattern of dangerousPatterns) {
        if (pattern.test(field)) {
          const fieldName = field === userData.fullName ? 'fullName' : 
                           field === userData.username ? 'username' :
                           field === userData.email ? 'email' :
                           field === userData.phoneNumber ? 'phoneNumber' : 'address';
          newErrors[fieldName] = 'Input mengandung karakter yang tidak diizinkan';
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleInputChange = (field: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error saat user mengetik
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSave = () => {
    if (validateProfile()) {
      // Implementasi save profile
      setIsEditing(false);
      // API call untuk update profile
      console.log('Profile saved successfully');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data dan errors
    setErrors({
      fullName: '',
      username: '',
      email: '',
      phoneNumber: '',
      address: '',
      role: ''
    });
  };

  const roleOptions = [
    { value: 'buyer', label: 'Pembeli' },
    { value: 'seller', label: 'Penjual' },
    { value: 'dealer', label: 'Dealer' }
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
                  <AvatarImage src={userData.profilePicture} alt={userData.fullName} />
                  <AvatarFallback>
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold mb-2">{userData.fullName}</h3>
                <p className="text-gray-600 mb-2">@{userData.username}</p>
                <div className="flex justify-center items-center gap-2 mb-4">
                  <Badge 
                    variant={userData.role === 'buyer' ? 'default' : userData.role === 'seller' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {roleOptions.find(r => r.value === userData.role)?.label}
                  </Badge>
                  {userData.isVerified && (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Terverifikasi
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">Member sejak {userData.memberSince}</p>
                
                <Button
                  variant={isEditing ? "outline" : "default"}
                  className="w-full mt-6"
                  onClick={() => setIsEditing(!isEditing)}
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
                  <div className="space-y-2">
                     <Label htmlFor="fullName" className="flex items-center gap-2">
                       <User className="w-4 h-4" />
                       Nama Lengkap
                     </Label>
                     <Input
                       id="fullName"
                       value={userData.fullName}
                       onChange={(e) => handleInputChange('fullName', e.target.value)}
                       readOnly={!isEditing}
                       className={`${!isEditing ? "bg-gray-50" : ""} ${errors.fullName ? "border-red-500" : ""}`}
                     />
                     {errors.fullName && (
                       <p className="text-sm text-red-500">{errors.fullName}</p>
                     )}
                   </div>
                   
                   <div className="space-y-2">
                     <Label htmlFor="username" className="flex items-center gap-2">
                       <User className="w-4 h-4" />
                       Username
                     </Label>
                     <Input
                       id="username"
                       value={userData.username}
                       onChange={(e) => handleInputChange('username', e.target.value)}
                       readOnly={!isEditing}
                       className={`${!isEditing ? "bg-gray-50" : ""} ${errors.username ? "border-red-500" : ""}`}
                     />
                     {errors.username && (
                       <p className="text-sm text-red-500">{errors.username}</p>
                     )}
                   </div>
                   
                   <div className="space-y-2">
                     <Label htmlFor="email" className="flex items-center gap-2">
                       <Mail className="w-4 h-4" />
                       Email
                     </Label>
                     <Input
                       id="email"
                       value={userData.email}
                       onChange={(e) => handleInputChange('email', e.target.value)}
                       type="email"
                       readOnly={!isEditing}
                       className={`${!isEditing ? "bg-gray-50" : ""} ${errors.email ? "border-red-500" : ""}`}
                     />
                     {errors.email && (
                       <p className="text-sm text-red-500">{errors.email}</p>
                     )}
                   </div>
                   
                   <div className="space-y-2">
                     <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                       <Phone className="w-4 h-4" />
                       Nomor Telepon
                     </Label>
                     <Input
                       id="phoneNumber"
                       value={userData.phoneNumber}
                       onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                       readOnly={!isEditing}
                       className={`${!isEditing ? "bg-gray-50" : ""} ${errors.phoneNumber ? "border-red-500" : ""}`}
                     />
                     {errors.phoneNumber && (
                       <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                     )}
                   </div>
                 </div>
                 
                 <div className="space-y-2">
                   <Label htmlFor="address" className="flex items-center gap-2">
                     <MapPin className="w-4 h-4" />
                     Alamat
                   </Label>
                   <Input
                     id="address"
                     value={userData.address}
                     onChange={(e) => handleInputChange('address', e.target.value)}
                     readOnly={!isEditing}
                     className={`${!isEditing ? "bg-gray-50" : ""} ${errors.address ? "border-red-500" : ""}`}
                   />
                   {errors.address && (
                     <p className="text-sm text-red-500">{errors.address}</p>
                   )}
                 </div>
                 
                 <div className="space-y-2">
                   <Label htmlFor="role" className="flex items-center gap-2">
                     <Shield className="w-4 h-4" />
                     Peran
                   </Label>
                   <Select 
                     value={userData.role} 
                     onValueChange={(value) => handleInputChange('role', value)}
                     disabled={!isEditing}
                   >
                     <SelectTrigger className={`${!isEditing ? "bg-gray-50" : ""} ${errors.role ? "border-red-500" : ""}`}>
                       <SelectValue placeholder="Pilih peran" />
                     </SelectTrigger>
                     <SelectContent>
                       {roleOptions.map((role) => (
                         <SelectItem key={role.value} value={role.value}>
                           {role.label}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   {errors.role && (
                     <p className="text-sm text-red-500">{errors.role}</p>
                   )}
                 </div>

                {isEditing && (
                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={handleSave}
                      className="flex-1"
                    >
                      Simpan Perubahan
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="flex-1"
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
                    <p className="text-xs text-gray-500">Tingkatkan keamanan akun</p>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-16 flex items-center justify-start gap-3 p-4">
                  <Bell className="w-5 h-5 text-purple-500" />
                  <div className="text-left">
                    <p className="font-semibold">Notifikasi</p>
                    <p className="text-xs text-gray-500">Atur preferensi notifikasi</p>
                  </div>
                </Button>
                
                <Button variant="outline" className="h-16 flex items-center justify-start gap-3 p-4 border-red-200 hover:bg-red-50">
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