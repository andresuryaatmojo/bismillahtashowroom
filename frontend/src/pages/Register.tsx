import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Separator } from '../components/ui/separator';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [generalError, setGeneralError] = useState('');

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nama lengkap harus diisi';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Nama lengkap minimal 2 karakter';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username harus diisi';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username minimal 3 karakter';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username hanya boleh mengandung huruf, angka, dan underscore';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Nomor telepon harus diisi';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Format nomor telepon tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password harus diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    if (!agreeToTerms) {
      newErrors.agreeToTerms = 'Anda harus menyetujui syarat dan ketentuan';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    if (generalError) {
      setGeneralError('');
    }
  };

  // ===== FIXED: handleSubmit dengan Proper Loading & Redirect =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi form
    if (!validateForm()) {
      console.log('⚠️ Form validation failed');
      return;
    }
    
    console.log('=== REGISTRATION START ===');
    
    // Reset error state
    setGeneralError('');
    
    // Start loading
    setIsSubmitting(true);
    console.log('🚀 Starting registration process...');
    
    try {
      // Call register function dari AuthContext
      console.log('📤 Calling register function...');
      const result = await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        username: formData.username,
        phoneNumber: formData.phoneNumber
      });
      
      console.log('📥 Registration result:', result);
      
      // Check result
      if (result.success) {
        console.log('✅ Registration successful!');
        
        // Reset form
        setFormData({
          fullName: '',
          username: '',
          email: '',
          phoneNumber: '',
          password: '',
          confirmPassword: ''
        });
        setAgreeToTerms(false);
        setErrors({});
        
        // Tampilkan notifikasi sukses
        alert('🎉 Pendaftaran Berhasil!\n\nAkun Anda telah dibuat.\nSilakan login untuk melanjutkan.');
        
        // Redirect ke halaman login setelah 500ms
        console.log('🔀 Redirecting to login page...');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 500);
        
      } else {
        // Handle error dari backend
        console.error('❌ Registration failed:', result.error);
        const errorMessage = result.error || 'Registrasi gagal. Silakan coba lagi.';
        setGeneralError(errorMessage);
        
        // Scroll ke atas untuk melihat error
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
    } catch (error: any) {
      // Handle unexpected error
      console.error('❌ Unexpected registration error:', error);
      
      const errorMessage = error?.message || 'Terjadi kesalahan. Silakan coba lagi.';
      setGeneralError(errorMessage);
      
      // Scroll ke atas untuk melihat error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
    } finally {
      // PENTING: Selalu set isSubmitting ke false untuk stop loading
      console.log('✋ Stopping loading state...');
      setIsSubmitting(false);
      console.log('=== REGISTRATION END ===');
    }
  };

  const handleGoogleRegister = () => {
    alert('🚧 Fitur registrasi dengan Google akan segera tersedia!');
  };

  const handleFacebookRegister = () => {
    alert('🚧 Fitur registrasi dengan Facebook akan segera tersedia!');
  };

  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );

  const FacebookIcon = () => (
    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6 pt-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-blue-600 mb-2">Mobilindo</h1>
              <CardTitle className="text-xl font-semibold text-gray-800 mb-2">
                Buat Akun Baru
              </CardTitle>
              <p className="text-sm text-gray-600">
                Bergabunglah dengan komunitas jual beli mobil terpercaya
              </p>
            </motion.div>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            {generalError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{generalError}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nama Lengkap */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nama Lengkap
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Masukkan nama lengkap Anda"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`h-12 bg-blue-50/50 border-blue-200 focus:border-blue-400 focus:ring-blue-400 ${errors.fullName ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Pilih username unik"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`h-12 bg-blue-50/50 border-blue-200 focus:border-blue-400 focus:ring-blue-400 ${errors.username ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`h-12 bg-blue-50/50 border-blue-200 focus:border-blue-400 focus:ring-blue-400 ${errors.email ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Nomor Telepon */}
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Nomor Telepon
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className={`h-12 bg-blue-50/50 border-blue-200 focus:border-blue-400 focus:ring-blue-400 ${errors.phoneNumber ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`h-12 pr-12 bg-blue-50/50 border-blue-200 focus:border-blue-400 focus:ring-blue-400 ${errors.password ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Konfirmasi Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Konfirmasi Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Ulangi password Anda"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`h-12 pr-12 bg-blue-50/50 border-blue-200 focus:border-blue-400 focus:ring-blue-400 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="agreeToTerms" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                  Saya menyetujui{' '}
                  <RouterLink to="/terms" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Syarat dan Ketentuan
                  </RouterLink>{' '}
                  serta{' '}
                  <RouterLink to="/privacy" className="text-blue-600 hover:text-blue-800 hover:underline">
                    Kebijakan Privasi
                  </RouterLink>
                </Label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-red-500 text-xs mt-1">{errors.agreeToTerms}</p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!formData.fullName || !formData.username || !formData.email || 
                         !formData.phoneNumber || !formData.password || !formData.confirmPassword || 
                         !agreeToTerms || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Daftar Sekarang
                  </>
                )}
              </Button>
            </form>
            
            {/* Social Login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">atau</span>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-3"
                  onClick={handleGoogleRegister}
                  disabled={isSubmitting}
                >
                  <GoogleIcon />
                  <span className="text-gray-700">Daftar dengan Google</span>
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-3"
                  onClick={handleFacebookRegister}
                  disabled={isSubmitting}
                >
                  <FacebookIcon />
                  <span className="text-gray-700">Daftar dengan Facebook</span>
                </Button>
              </div>
            </div>
            
            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Sudah punya akun?{' '}
                <RouterLink to="/login" className="text-blue-600 hover:text-blue-800 hover:underline font-semibold">
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