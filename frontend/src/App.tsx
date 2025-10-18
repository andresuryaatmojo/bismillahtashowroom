import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { NextUIProvider } from '@nextui-org/react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// NAVIGATION COMPONENTS
import Navigation from './components/Navigation';
import GuestNavigation from './components/GuestNavigation';

// AUTH PAGES
import Login from './pages/Login';
import Register from './pages/Register';

// USER PAGES
import HalamanBeranda from './pages/HalamanBeranda';
import HalamanDashboard from './pages/HalamanDashboard';
import HalamanProfil from './pages/HalamanProfil';
import HalamanKatalog from './pages/HalamanKatalog';
import HalamanArtikel from './pages/HalamanArtikel';
import HalamanChat from './pages/HalamanChat';
import HalamanDetailMobil from './pages/HalamanDetailMobil';
import HalamanIklan from './pages/HalamanIklan';
import HalamanKelolaIklan from './pages/HalamanKelolaIklan';
import HalamanKemitraan from './pages/HalamanKemitraan';
import HalamanKonten from './pages/HalamanKonten';
import HalamanLaporan from './pages/HalamanLaporan';
import HalamanPembelian from './pages/HalamanPembelian';
import HalamanPerbandingan from './pages/HalamanPerbandingan';
import HalamanRiwayat from './pages/HalamanRiwayat';
import HalamanSimulasi from './pages/HalamanSimulasi';
import HalamanTestDrive from './pages/HalamanTestDrive';
import HalamanTradeIn from './pages/HalamanTradeIn';
import HalamanTransaksi from './pages/HalamanTransaksi';
import HalamanWishlist from './pages/HalamanWishlist';

// ADMIN PAGES
import HalamanAdmin from './pages/HalamanAdmin';
import HalamanExecutive from './pages/HalamanExecutive';

// OTHER COMPONENTS
import LoginForm from './components/LoginForm';
import NotFound from './pages/NotFound';

import './App.css';

const AppContent: React.FC = () => {
  const location = useLocation();
  
  const authPages = ['/login', '/register'];
  const guestPages = [
    '/', 
    '/katalog', 
    '/artikel', 
    '/tentang',
    '/kemitraan', 
    '/simulasi', 
    '/perbandingan', 
    '/test-drive', 
    '/trade-in',
    '/wishlist',
    '/chat',
    '/riwayat',
    '/profil',
    '/dashboard',
    '/iklan',
    '/kelola-iklan',
    '/pembelian',
    '/transaksi'
  ];
  
  const isAuthPage = authPages.includes(location.pathname);
  
  // Check if current path is guest page or artikel detail page
  const isGuestPage = guestPages.includes(location.pathname) || 
                      location.pathname.startsWith('/artikel/') ||
                      location.pathname.startsWith('/mobil/');
  
  const isAuthenticatedPage = !isAuthPage && !isGuestPage;

  return (
    <div className="App">
      {isGuestPage && <GuestNavigation />}
      {isAuthenticatedPage && <Navigation />}
      
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<HalamanBeranda />} />
        <Route path="/katalog" element={<HalamanKatalog />} />
        
        {/* ARTIKEL ROUTES */}
        <Route path="/artikel" element={<HalamanArtikel />} />
        <Route path="/artikel/:slug" element={<HalamanArtikel />} />
        
        <Route path="/kemitraan" element={<HalamanKemitraan />} />
        <Route path="/simulasi" element={<HalamanSimulasi />} />
        <Route path="/perbandingan" element={<HalamanPerbandingan />} />
        <Route path="/test-drive" element={<HalamanTestDrive />} />
        <Route path="/trade-in" element={<HalamanTradeIn />} />
        <Route path="/mobil/:id" element={<HalamanDetailMobil />} />
        
        {/* AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<LoginForm />} />
        
        {/* PROTECTED USER ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <HalamanDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <HalamanProfil />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <HalamanChat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <HalamanWishlist />
            </ProtectedRoute>
          }
        />
        <Route
          path="/riwayat"
          element={
            <ProtectedRoute>
              <HalamanRiwayat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pembelian"
          element={
            <ProtectedRoute>
              <HalamanPembelian />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transaksi"
          element={
            <ProtectedRoute>
              <HalamanTransaksi />
            </ProtectedRoute>
          }
        />
        
        {/* PROTECTED SELLER ROUTES */}
        <Route
          path="/iklan"
          element={
            <ProtectedRoute requiredPermission="create_listings">
              <HalamanIklan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kelola-iklan"
          element={
            <ProtectedRoute requiredPermission="create_listings">
              <HalamanKelolaIklan />
            </ProtectedRoute>
          }
        />
        
        {/* PROTECTED ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <HalamanAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/konten"
          element={
            <ProtectedRoute requiredPermission="manage_content">
              <HalamanKonten />
            </ProtectedRoute>
          }
        />
        <Route
          path="/laporan"
          element={
            <ProtectedRoute requiredPermission="view_reports">
              <HalamanLaporan />
            </ProtectedRoute>
          }
        />
        
        {/* PROTECTED OWNER ROUTES */}
        <Route
          path="/executive"
          element={
            <ProtectedRoute requiredRole="owner">
              <HalamanExecutive />
            </ProtectedRoute>
          }
        />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

function App() {
  console.log('🚀 Mobilindo App initialized');
  
  return (
    <NextUIProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </NextUIProvider>
  );
}

export default App;