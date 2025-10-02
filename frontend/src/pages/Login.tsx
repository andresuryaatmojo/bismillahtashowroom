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

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({
    username: '',
    password: ''
  });
  
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = { username: '', password: '' };
    let isValid = true;

    if (!formData.username.trim()) {
      newErrors.username = 'Username atau email harus diisi';
      isValid = false;
    }

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
    
    console.log('Login attempt:', { username: formData.username, password: formData.password });
    
    if (!validateForm()) {
      return;
    }
    
    setGeneralError('');
    
    try {
      const success = await login(formData.username, formData.password);
      console.log('Login result:', success);
      
      if (success) {
        // Redirect to dashboard after successful login
        navigate('/dashboard');
      } else {
        setGeneralError('Username atau password salah. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setGeneralError('Terjadi kesalahan saat login. Silakan coba lagi.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center pb-6">
            <RouterLink to="/" className="mb-4 inline-block">
              <h1 className="text-3xl font-bold text-primary">Mobilindo</h1>
            </RouterLink>
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Masuk ke Akun Anda
            </CardTitle>
            <p className="text-gray-600 text-center mt-2">
              Selamat datang kembali! Silakan masuk untuk melanjutkan
            </p>
          </CardHeader>
          
          <CardContent className="pt-0">
            {generalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{generalError}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username atau Email
                </Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Masukkan username atau email"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={errors.username ? 'border-red-500' : ''}
                  required
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    placeholder="Masukkan password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
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
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rememberMe: checked === true }))}
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Ingat saya
                  </Label>
                </div>
                <RouterLink to="/forgot-password" className="text-sm text-primary hover:underline">
                  Lupa password?
                </RouterLink>
              </div>
              
              <Button
                type="submit"
                className="w-full flex items-center gap-2"
                disabled={!formData.username || !formData.password || isLoading}
              >
                <LogIn className="w-4 h-4" />
                {isLoading ? 'Memproses...' : 'Masuk'}
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
                Masuk dengan Google
              </Button>
              
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Masuk dengan Facebook
              </Button>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Belum punya akun?{' '}
                <RouterLink to="/register" className="text-primary hover:underline font-semibold">
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