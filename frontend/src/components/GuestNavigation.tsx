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
  Car, 
  FileText, 
  Briefcase, 
  Calculator, 
  Settings, 
  Wrench,
  ChevronDown,
  LogIn,
  UserPlus
} from 'lucide-react';

const GuestNavigation: React.FC = () => {
  const location = useLocation();

  const publicPages = [
    { path: '/katalog', label: 'Katalog Mobil', icon: Car },
    { path: '/artikel', label: 'Artikel', icon: FileText },
    { path: '/simulasi', label: 'Simulasi Kredit', icon: Calculator }
  ];

  const servicePages = [
    { path: '/perbandingan', label: 'Perbandingan Mobil', icon: Settings },
    { path: '/test-drive', label: 'Test Drive', icon: Car },
    { path: '/trade-in', label: 'Trade In', icon: Settings }
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
            {/* Public Pages */}
            {publicPages.map((item) => {
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
                {servicePages.map((item) => {
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

            {/* Auth Buttons */}
            <div className="flex items-center space-x-2 ml-4 border-l pl-4">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Masuk
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Daftar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GuestNavigation;