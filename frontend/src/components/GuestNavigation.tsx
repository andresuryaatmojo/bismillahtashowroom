// GuestNavigation component
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useAuth } from '../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import LayananChat from '../services/LayananChat';
import {
  ChevronDown,
  LogIn,
  Heart,
  Settings,
  LogOut,
  Edit,
  Receipt,
  FileText,
  Mail
} from 'lucide-react';
const GuestNavigation: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);

  const navigationItems = [
    { path: '/', label: 'Beranda' },
    { path: '/katalog', label: 'Katalog' },
    { path: '/artikel', label: 'Artikel' },
    { path: '/tentang', label: 'Tentang' }
  ];

  const servicePages = [
    { path: '/simulasi', label: 'Simulasi Kredit' },
    { path: '/perbandingan', label: 'Perbandingan Mobil' },
    { path: '/trade-in', label: 'Trade In' }
  ];

  // Load unread messages count
  useEffect(() => {
    // Hanya load jika user sudah login
    if (isAuthenticated) {
      loadUnreadMessages();
      // Polling setiap 30 detik untuk update count pesan
      const interval = setInterval(loadUnreadMessages, 30000);
      return () => clearInterval(interval);
    } else {
      // Reset count jika user logout
      setUnreadMessages(0);
    }
  }, [isAuthenticated]);

  const loadUnreadMessages = async () => {
    try {
      // Gunakan getMockUnreadCount untuk sementara
      // Ganti dengan getUnreadCount() jika API backend sudah siap
      const count = await LayananChat.getMockUnreadCount();
      setUnreadMessages(count);
    } catch (error) {
      console.error('Error loading unread messages:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary">
              Mobilindo
            </Link>
          </div>
          
          {/* Right side - Navigation Items and Auth */}
          <div className="flex items-center space-x-6">
            {/* Navigation Items */}
            {navigationItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={location.pathname === item.path ? "default" : "ghost"}
                  size="sm"
                >
                  {item.label}
                </Button>
              </Link>
            ))}

            {/* Services Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  Layanan
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {servicePages.map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link to={item.path} className="w-full">
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Ikon Notifikasi & Pesan */}
            <div className="flex items-center gap-3 pl-3 border-l">
              <NotificationDropdown />
              <Link
                to="/chat"
                className="relative p-2 rounded hover:bg-gray-100"
                aria-label="Pesan"
              >
                <Mail className="w-5 h-5 text-gray-700" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                    {unreadMessages}
                  </span>
                )}
              </Link>
            </div>

            {/* Authentication Section */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage 
                        src={user.profile_picture} 
                        alt={user.full_name}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getUserInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.full_name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profil" className="flex items-center gap-2 w-full">
                      <Edit className="w-4 h-4" />
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="flex items-center gap-2 w-full">
                      <Heart className="w-4 h-4" />
                      Wishlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/riwayat" className="flex items-center gap-2 w-full">
                      <Receipt className="w-4 h-4" />
                      Transaksi
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/iklan" className="flex items-center gap-2 w-full">
                      <FileText className="w-4 h-4" />
                      Iklan Saya
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/riwayat-test-drive" className="flex items-center gap-2 w-full">
                      <FileText className="w-4 h-4" />
                      Riwayat Test Drive
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2 w-full">
                      <Settings className="w-4 h-4" />
                      Pengaturan
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GuestNavigation;