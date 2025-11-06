// Top-level imports (file AdminNavigation.tsx)
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
  Settings,
  FileText,
  MessageCircle,
  User,
  Briefcase,
  ChevronDown,
  ArrowLeftRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../components/ui/accordion';

function AdminNavigation() {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();

  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  if (isLoading) {
    return (
      <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r shadow-lg z-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
        <p className="text-gray-600">Memverifikasi akses admin...</p>
      </aside>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    // Tidak menampilkan navigasi admin jika user bukan admin/owner
    return null;
  }

  // Menu utama (tanpa dropdown)
  const mainMenu = [
    { path: '/admin', label: 'Dashboard', icon: Home },
    { path: '/admin/users', label: 'Manajemen User', icon: User },
    { path: '/admin/laporan', label: 'Laporan', icon: FileText },
  ];

  // Manajemen Mobil (Dropdown -> Accordion)
  const manajemenMobil = {
    label: 'Manajemen Mobil',
    items: [
      { path: '/admin/mobil-showroom', label: 'Mobil Showroom', icon: Car },
      { path: '/admin/kelola-iklan', label: 'Moderasi Iklan', icon: Settings }
    ],
  };

  // Operasional (Dropdown -> Accordion)
  const operasional = {
    label: 'Operasional',
    items: [
      { path: '/admin/pembelian', label: 'Kelola Transaksi', icon: Briefcase },
      { path: '/admin/test-drive', label: 'Jadwal Test Drive', icon: Car },
      { path: '/admin/trade-in', label: 'Kelola Trade-In', icon: ArrowLeftRight },
      { path: '/admin/chat', label: 'Pesan / Chat User', icon: MessageCircle },
    ],
  };

  // Manajemen Konten (Dropdown -> Accordion)
  const manajemenKonten = {
    label: 'Manajemen Konten',
    items: [
      { path: '/admin/artikel', label: 'Artikel', icon: FileText },
      { path: '/admin/moderasi-ulasan', label: 'Moderasi Ulasan', icon: Settings },
    ],
  };

  // Pengaturan Sistem (Dropdown -> Accordion)
  const pengaturanSistem = {
    label: 'Pengaturan Sistem',
    items: [
      { path: '/admin/parameter-kredit', label: 'Parameter Kredit', icon: Settings },
      { path: '/admin/pembayaran-iklan', label: 'Kelola Paket Iklan', icon: Briefcase },
      { path: '/admin/knowledge-chatbot', label: 'Knowledge Chatbot', icon: MessageCircle },
    ],
  };

  const dropdownGroups = [manajemenMobil, operasional, manajemenKonten, pengaturanSistem];

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r shadow-lg z-50">
      {/* Brand/Header */}
      <div className="h-16 border-b flex items-center px-4">
        <Link to="/admin" className="text-xl font-bold text-primary">
          Admin Panel
        </Link>
      </div>

      {/* Sidebar Menu */}
      <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100%-4rem)]">
        {/* Main Menu */}
        <div className="space-y-1">
          {mainMenu.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start gap-2"
                >
                  <IconComponent className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Accordion Groups */}
        <Accordion type="single" collapsible className="space-y-1">
          {dropdownGroups.map((group) => (
            <AccordionItem key={group.label} value={group.label}>
              <AccordionTrigger className="px-3 py-2 text-sm">
                {group.label}
              </AccordionTrigger>
              <AccordionContent className="space-y-1">
                {group.items.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 ${
                        isActive ? 'text-primary font-medium' : 'text-gray-700'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </nav>
    </aside>
  );
};

export default AdminNavigation;