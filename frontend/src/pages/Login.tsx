import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Separator } from '../components/ui/separator';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Lock, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Custom Google Icon Component
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// Custom Facebook Icon Component
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
  </svg>
);
const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    // Validasi email
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
      isValid = false;
    }

    // Validasi password
    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear errors when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear general error
    if (generalError) {
      setGeneralError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setGeneralError('');
    setIsSubmitting(true);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Show success alert
        alert('🎉 Login berhasil! Selamat datang kembali.');
        navigate('/dashboard');
      } else {
        // Show error alert
        alert('❌ Login gagal! ' + (result.error || 'Username atau password salah. Silakan coba lagi.'));
        setGeneralError(result.error || 'Username atau password salah. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = 'Terjadi kesalahan saat login. Silakan coba lagi.';
      alert('❌ ' + errorMessage);
      setGeneralError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    alert('🚧 Fitur login dengan Google akan segera tersedia!');
  };

  const handleFacebookLogin = () => {
    alert('🚧 Fitur login dengan Facebook akan segera tersedia!');
  };

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
                Masuk ke Akun Anda
              </CardTitle>
              <p className="text-sm text-gray-600">
                Selamat datang kembali! Silakan masuk untuk melanjutkan
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
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username atau Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="harisfalih@gmail.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`h-12 bg-blue-50/50 border-blue-200 focus:border-blue-400 focus:ring-blue-400 ${errors.email ? 'border-red-500' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
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

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                    }
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                    Ingat saya
                  </Label>
                </div>
                <RouterLink 
                  to="/forgot-password" 
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Lupa password?
                </RouterLink>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                disabled={!formData.email || !formData.password || isSubmitting}
              >
                <LogIn className="w-5 h-5" />
                {isSubmitting ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>
            
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
                  onClick={handleGoogleLogin}
                >
                  <GoogleIcon className="w-5 h-5" />
                  <span className="text-gray-700">Masuk dengan Google</span>
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-3"
                  onClick={handleFacebookLogin}
                >
                  <FacebookIcon className="w-5 h-5" />
                  <span className="text-gray-700">Masuk dengan Facebook</span>
                </Button>
              </div>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Belum punya akun?{' '}
                <RouterLink to="/register" className="text-blue-600 hover:text-blue-800 hover:underline font-semibold">
                  Daftar sekarang
                </RouterLink>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;