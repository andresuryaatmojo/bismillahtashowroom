import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { 
  Home, 
  Car, 
  Heart, 
  MessageCircle, 
  User, 
  Wrench, 
  Briefcase, 
  Settings, 
  FileText,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, hasRole } = useAuth();

  const mainMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/katalog', label: 'Katalog Mobil', icon: Car },
    { path: '/wishlist', label: 'Wishlist', icon: Heart },
    { path: '/chat', label: 'Chat', icon: MessageCircle },
    { path: '/profil', label: 'Profil', icon: User }
  ];

  const serviceMenuItems = [
    { path: '/test-drive', label: 'Test Drive', icon: Car },
    { path: '/simulasi', label: 'Simulasi Kredit', icon: FileText },
    { path: '/trade-in', label: 'Trade In', icon: Settings },
    { path: '/pembelian', label: 'Pembelian', icon: Briefcase },
    { path: '/perbandingan', label: 'Perbandingan', icon: Settings }
  ];

  // Filter menu bisnis berdasarkan role pengguna
  const allBusinessMenuItems = [
    { path: '/iklan', label: 'Iklan', icon: FileText },
    { path: '/kelola-iklan', label: 'Kelola Iklan', icon: Settings },
    { path: '/kemitraan', label: 'Kemitraan', icon: Briefcase, requiresExecutive: true },
    { path: '/konten', label: 'Konten', icon: FileText }
  ];

  // Filter business menu items berdasarkan role
  const businessMenuItems = allBusinessMenuItems.filter(item => {
    console.log('Filtering item:', item.label, 'requiresExecutive:', item.requiresExecutive, 'user role:', user?.role, 'hasRole executive:', hasRole('executive'));
    if (item.requiresExecutive) {
      return hasRole('executive');
    }
    return true;
  });

  console.log('Filtered businessMenuItems:', businessMenuItems);
  const adminMenuItems = [
    { path: '/admin', label: 'Admin Panel', icon: Settings },
    { path: '/laporan', label: 'Laporan', icon: FileText },
    { path: '/transaksi', label: 'Transaksi', icon: Briefcase },
    { path: '/riwayat', label: 'Riwayat', icon: FileText }
  ];

  const contentMenuItems = [
    { path: '/artikel', label: 'Artikel', icon: FileText }
  ];

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              Mobilindo
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Main Menu */}
            {mainMenuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={location.pathname === item.path ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <IconComponent className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {/* Services Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Layanan
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {serviceMenuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link to={item.path} className="flex items-center gap-2 w-full">
                        <IconComponent className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Business Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Bisnis
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {businessMenuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link to={item.path} className="flex items-center gap-2 w-full">
                        <IconComponent className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Admin Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Admin
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {adminMenuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link to={item.path} className="flex items-center gap-2 w-full">
                        <IconComponent className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Content Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Konten
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {contentMenuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link to={item.path} className="flex items-center gap-2 w-full">
                        <IconComponent className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;