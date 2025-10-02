import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  Search, 
  Shield, 
  Zap, 
  MessageCircle, 
  Star, 
  Car, 
  Users, 
  Award,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Clock
} from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: "100% Terpercaya",
      description: "Semua mobil telah melalui verifikasi ketat untuk memastikan kualitas dan keaslian dokumen",
      color: "text-emerald-600"
    },
    {
      icon: Zap,
      title: "Proses Kilat",
      description: "Pencarian, perbandingan, dan pembelian mobil yang mudah dengan teknologi AI terdepan",
      color: "text-blue-600"
    },
    {
      icon: MessageCircle,
      title: "Support 24/7",
      description: "Tim customer service profesional siap membantu Anda kapan saja dalam proses jual beli",
      color: "text-purple-600"
    }
  ];

  const stats = [
    { icon: Car, number: "50K+", label: "Mobil Tersedia" },
    { icon: Users, number: "100K+", label: "Pengguna Aktif" },
    { icon: Award, number: "4.9", label: "Rating Kepuasan" },
    { icon: TrendingUp, number: "98%", label: "Tingkat Kepuasan" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <motion.section 
        className="relative py-24 px-4 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        
        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              Platform #1 Jual Beli Mobil Indonesia
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-8 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Temukan Mobil
            <br />
            <span className="text-blue-600">Impian Anda</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Marketplace mobil terpercaya dengan teknologi AI untuk pengalaman jual beli yang lebih cerdas dan aman
          </motion.p>
          
          {/* Enhanced Search Bar */}
          <motion.div 
            className="max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Card className="p-2 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input
                    placeholder="Cari mobil berdasarkan merk, model, tahun, atau budget..."
                    className="pl-12 h-14 text-lg border-0 focus-visible:ring-0 bg-transparent"
                  />
                </div>
                <Button size="lg" className="h-14 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Search className="w-5 h-5 mr-2" />
                  Cari Sekarang
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 text-center border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                <div className="text-2xl font-bold text-slate-900 mb-1">{stat.number}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </Card>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-4">Keunggulan Kami</Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Mengapa Memilih <span className="text-blue-600">Mobilindo?</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Pengalaman jual beli mobil yang revolusioner dengan teknologi terdepan dan layanan terpercaya
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
              >
                <Card className="h-full p-8 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2">
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`w-8 h-8 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-2xl font-bold text-slate-900 mb-3">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 text-lg leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
              <Clock className="w-4 h-4 mr-2" />
              Bergabung Sekarang
            </Badge>
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
              Siap Menemukan Mobil
              <br />
              <span className="text-yellow-300">Impian Anda?</span>
            </h3>
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
              Bergabunglah dengan lebih dari 100,000 pengguna yang telah mempercayai Mobilindo untuk kebutuhan otomotif mereka
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-4 text-lg font-semibold shadow-xl">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Mulai Sekarang Gratis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/katalog">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold bg-transparent"
                >
                  Jelajahi Katalog
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <h5 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Mobilindo
              </h5>
              <p className="text-slate-400 text-lg mb-6 max-w-md">
                Platform jual beli mobil terpercaya di Indonesia dengan teknologi AI untuk pengalaman yang lebih cerdas
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-slate-700 hover:bg-blue-600 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <div className="w-5 h-5 bg-current rounded"></div>
                </div>
                <div className="w-10 h-10 bg-slate-700 hover:bg-blue-600 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <div className="w-5 h-5 bg-current rounded"></div>
                </div>
                <div className="w-10 h-10 bg-slate-700 hover:bg-blue-600 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                  <div className="w-5 h-5 bg-current rounded"></div>
                </div>
              </div>
            </div>
            <div>
              <h6 className="font-semibold mb-6 text-lg">Layanan</h6>
              <ul className="space-y-3 text-slate-400">
                <li className="hover:text-white cursor-pointer transition-colors">Jual Mobil</li>
                <li className="hover:text-white cursor-pointer transition-colors">Beli Mobil</li>
                <li className="hover:text-white cursor-pointer transition-colors">Test Drive</li>
                <li className="hover:text-white cursor-pointer transition-colors">Simulasi Kredit</li>
                <li className="hover:text-white cursor-pointer transition-colors">Trade In</li>
              </ul>
            </div>
            <div>
              <h6 className="font-semibold mb-6 text-lg">Bantuan</h6>
              <ul className="space-y-3 text-slate-400">
                <li className="hover:text-white cursor-pointer transition-colors">FAQ</li>
                <li className="hover:text-white cursor-pointer transition-colors">Kontak</li>
                <li className="hover:text-white cursor-pointer transition-colors">Panduan</li>
                <li className="hover:text-white cursor-pointer transition-colors">Syarat & Ketentuan</li>
                <li className="hover:text-white cursor-pointer transition-colors">Kebijakan Privasi</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 mb-4 md:mb-0">
              &copy; 2024 Mobilindo. Semua hak dilindungi undang-undang.
            </p>
            <div className="flex space-x-6 text-slate-400">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-white cursor-pointer transition-colors">Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;