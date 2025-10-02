import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { Separator } from '../components/ui/separator';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, UserPlus, Eye, EyeOff } from 'lucide-react';
import KontrollerAuth from '../controllers/KontrollerAuth';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'buyer'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const navigate = useNavigate();
  const authController = KontrollerAuth.getInstance();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Validasi nama lengkap
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nama lengkap harus diisi';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Nama lengkap minimal 2 karakter';
    } else if (formData.fullName.trim().length > 100) {
      newErrors.fullName = 'Nama lengkap maksimal 100 karakter';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.fullName.trim())) {
      newErrors.fullName = 'Nama lengkap hanya boleh mengandung huruf dan spasi';
    }
    
    // Validasi username
    if (!formData.username.trim()) {
      newErrors.username = 'Username harus diisi';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username minimal 3 karakter';
    } else if (formData.username.length > 20) {
      newErrors.username = 'Username maksimal 20 karakter';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username hanya boleh mengandung huruf, angka, dan underscore';
    }
    
    // Validasi email
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    } else if (formData.email.length > 254) {
      newErrors.email = 'Email terlalu panjang';
    }
    
    // Validasi nomor telepon (format Indonesia)
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Nomor telepon harus diisi';
    } else if (!/^(\+62|62|0)[0-9]{9,13}$/.test(formData.phoneNumber.replace(/[\s\-()]/g, ''))) {
      newErrors.phoneNumber = 'Format nomor telepon tidak valid (gunakan format Indonesia)';
    }
    
    // Validasi password yang lebih ketat
    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password minimal 8 karakter';
    } else if (formData.password.length > 128) {
      newErrors.password = 'Password maksimal 128 karakter';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password harus mengandung huruf besar, huruf kecil, dan angka';
    } else if (/(.)\1{2,}/.test(formData.password)) {
      newErrors.password = 'Password tidak boleh mengandung karakter berulang lebih dari 2 kali';
    } else if (/^(123456|password|qwerty|abc123|admin|user)$/i.test(formData.password)) {
      newErrors.password = 'Password terlalu umum, gunakan password yang lebih kuat';
    }
    
    // Validasi konfirmasi password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password harus diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }
    
    // Validasi persetujuan syarat dan ketentuan
    if (!agreeToTerms) {
      newErrors.terms = 'Anda harus menyetujui syarat dan ketentuan';
    }
    
    // Validasi keamanan tambahan - deteksi pola berbahaya
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i
    ];
    
    Object.values(formData).forEach((value, index) => {
      const fieldNames = ['fullName', 'username', 'email', 'phoneNumber'];
      if (typeof value === 'string') {
        dangerousPatterns.forEach(pattern => {
          if (pattern.test(value)) {
            newErrors[fieldNames[index]] = 'Input mengandung karakter yang tidak diizinkan';
          }
        });
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await authController.register({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        role: formData.role as 'buyer' | 'seller' | 'dealer'
      });
      
      if (response.success) {
        alert('Registrasi berhasil! Silakan login.');
        navigate('/login');
      } else {
        setErrors({ general: response.message || 'Registrasi gagal. Silakan coba lagi.' });
      }
    } catch (error) {
      setErrors({ general: 'Terjadi kesalahan. Silakan coba lagi.' });
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'buyer', label: 'Pembeli' },
    { value: 'seller', label: 'Penjual' },
    { value: 'dealer', label: 'Dealer' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center pb-6">
            <RouterLink to="/" className="mb-4 inline-block">
              <h1 className="text-3xl font-bold text-primary">Mobilindo</h1>
            </RouterLink>
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Buat Akun Baru
            </CardTitle>
            <p className="text-gray-600 text-center mt-2">
              Bergabunglah dengan komunitas jual beli mobil terpercaya
            </p>
          </CardHeader>
          
          <CardContent className="pt-0">
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                {errors.general}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nama Lengkap
                </Label>
                <Input
                  id="fullName"
                  placeholder="Masukkan nama lengkap"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={errors.fullName ? 'border-red-500' : ''}
                  required
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm">{errors.fullName}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username
                </Label>
                <Input
                  id="username"
                  placeholder="Masukkan username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={errors.username ? 'border-red-500' : ''}
                  required
                />
                {errors.username && (
                  <p className="text-red-500 text-sm">{errors.username}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  placeholder="Masukkan email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Nomor Telepon
                </Label>
                <Input
                  id="phoneNumber"
                  placeholder="Masukkan nomor telepon"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className={errors.phoneNumber ? 'border-red-500' : ''}
                  required
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Daftar Sebagai
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih peran Anda" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    placeholder="Masukkan password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={errors.password ? 'border-red-500' : ''}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Konfirmasi Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    placeholder="Konfirmasi password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                />
                <Label htmlFor="terms" className="text-sm text-gray-600">
                  Saya menyetujui{' '}
                  <RouterLink to="/terms" className="text-primary hover:underline">
                    Syarat dan Ketentuan
                  </RouterLink>
                  {' '}serta{' '}
                  <RouterLink to="/privacy" className="text-primary hover:underline">
                    Kebijakan Privasi
                  </RouterLink>
                </Label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-red-500 text-sm">{errors.agreeToTerms}</p>
              )}
              
              <Button
                type="submit"
                className="w-full flex items-center gap-2"
                disabled={!formData.fullName || !formData.username || !formData.email || 
                         !formData.password || !formData.confirmPassword || !agreeToTerms || isLoading}
              >
                <UserPlus className="w-4 h-4" />
                {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
              </Button>
            </form>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Daftar dengan Google
              </Button>
              
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Daftar dengan Facebook
              </Button>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Sudah punya akun?{' '}
                <RouterLink to="/login" className="text-primary hover:underline font-semibold">
                  Masuk di sini
                </RouterLink>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;