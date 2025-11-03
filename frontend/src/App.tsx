import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { NextUIProvider } from '@nextui-org/react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// NAVIGATION COMPONENTS
import Navigation from './components/Navigation';
import GuestNavigation from './components/GuestNavigation';
import AdminNavigation from './components/AdminNavigation';
import ExecutiveNavigation from './components/ExecutiveNavigation';
import HalamanPersetujuan from './components/HalamanPersetujuan';

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
import HalamanKelolaIklan from './pages/HalamanKelolaIklan';
import HalamanKemitraan from './pages/HalamanKemitraan';
import HalamanKonten from './pages/HalamanKonten';
import HalamanLaporan from './pages/HalamanLaporan';
import HalamanPembelian from './pages/HalamanPembelian';
import HalamanPerbandinganMobil from './pages/HalamanPerbandinganMobil';
import HalamanRiwayat from './pages/HalamanRiwayat';
import HalamanRiwayatTestDrive from './pages/HalamanRiwayatTestDrive';
import HalamanSimulasiKredit from './pages/HalamanSimulasiKredit';
import HalamanTestDrive from './pages/HalamanTestDrive';
import HalamanTradeIn from './pages/HalamanTradeIn';
import HalamanTransaksi from './pages/HalamanTransaksi';
import HalamanWishlist from './pages/HalamanWishlist';
import HalamanPembayaran from './pages/HalamanPembayaran';

// ADMIN PAGES
import HalamanAdmin from './pages/HalamanAdmin';
import HalamanKelolaUser from './pages/HalamanKelolaUser';
import HalamanKelolaMobil from './pages/HalamanKelolaMobil';
import HalamanKelolaArtikel from './pages/HalamanKelolaArtikel';
import HalamanJadwalTestDrive from './pages/HalamanJadwalTestDrive';
import HalamanModerasiIklan from './pages/HalamanModerasiIklan';
import HalamanModerasiUlasan from './pages/HalamanModerasiUlasan';
import HalamanExecutive from './pages/HalamanExecutive';
import HalamanChatAdmin from './pages/HalamanChatAdmin';
import AdminKnowledgeChatbot from './pages/AdminKnowledgeChatbot';
import HalamanParameterKredit from './pages/HalamanParameterKredit';
import HalamanKelolaTradeIn from './pages/HalamanKelolaTradeIn';

// OTHER COMPONENTS
import LoginForm from './components/LoginForm';
import NotFound from './pages/NotFound';
import './App.css';
import HalamanKelolaTransaksi from './pages/HalamanKelolaTransaksi';
import HalamanKelolaTransaksiUser from './pages/HalamanKelolaTransaksiUser';

// Komponen: AppContent
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
  const isGuestPage =
    guestPages.includes(location.pathname) ||
    location.pathname.startsWith('/artikel/') ||
    location.pathname.startsWith('/mobil/');
  
  const isAuthenticatedPage = !isAuthPage && !isGuestPage;
  const isAdminPage = location.pathname.startsWith('/admin');
  const isExecutivePage = location.pathname.startsWith('/executive');

  return (
    <div className="App">
      {/* navigation bars */}
      {!isAdminPage && !isExecutivePage && <GuestNavigation />}
      {isAdminPage && <AdminNavigation />}
      {isExecutivePage && <ExecutiveNavigation />}
      <div className={isAdminPage || isExecutivePage ? 'ml-64' : ''}>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<HalamanBeranda />} />
          <Route path="/katalog" element={<HalamanKatalog />} />
          
          {/* ARTIKEL ROUTES */}
          <Route path="/artikel" element={<HalamanArtikel />} />
          <Route path="/artikel/:slug" element={<HalamanArtikel />} />
          
          <Route path="/kemitraan" element={<HalamanKemitraan />} />
          <Route path="/simulasi" element={<HalamanSimulasiKredit />} />
          <Route path="/perbandingan" element={<HalamanPerbandinganMobil />} />
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
            path="/riwayat-test-drive"
            element={
              <ProtectedRoute>
                <HalamanRiwayatTestDrive />
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
          <Route
            path="/transaksi/:id"
            element={
              <ProtectedRoute>
                <HalamanTransaksi />
              </ProtectedRoute>
            }
          />

          {/* Halaman Pembayaran */}
          <Route
            path="/pembayaran"
            element={
              <ProtectedRoute>
                {/* Wrapper agar bisa membaca amount dari state */}
                <HalamanPembayaranRoute />
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
            path="/riwayat-test-drive"
            element={
              <ProtectedRoute>
                <HalamanRiwayatTestDrive />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pembelian"
            element={
              <ProtectedRoute requiredRole="admin">
                <HalamanKelolaTransaksi />
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
          <Route
            path="/transaksi/:id"
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
                <HalamanKelolaIklan />
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
          {/* Seller transactions */}
          <Route
            path="/seller/transaksi"
            element={
              <ProtectedRoute requiredPermission="create_listings">
                <HalamanKelolaTransaksiUser />
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
            path="/admin/chat"
            element={
              <ProtectedRoute requiredRole="admin">
                <HalamanChatAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <HalamanKelolaUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/mobil-showroom"
            element={
              <ProtectedRoute requiredRole="admin">
                <HalamanKelolaMobil />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/test-drive"
            element={
              <ProtectedRoute requiredRole="admin">
                <HalamanJadwalTestDrive />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/trade-in"
            element={
              <ProtectedRoute requiredRole="admin">
                <HalamanKelolaTradeIn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/artikel"
            element={
              <ProtectedRoute requiredRole="admin">
                <HalamanKelolaArtikel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/kelola-iklan"
            element={
              <ProtectedRoute requiredRole="admin">
                <HalamanModerasiIklan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/moderasi-ulasan"
            element={
              <ProtectedRoute requiredRole="admin">
                <HalamanModerasiUlasan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pembelian"
            element={
              <ProtectedRoute requiredRole="admin">
                <HalamanKelolaTransaksi />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/knowledge-chatbot"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminKnowledgeChatbot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/parameter-kredit"
            element={
              <ProtectedRoute requiredRole="admin">
                <HalamanParameterKredit />
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
          {/* Alias admin untuk konsistensi sidebar */}
          <Route
            path="/admin/laporan"
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
          <Route
            path="/executive/persetujuan"
            element={
              <ProtectedRoute requiredRole="owner">
                <HalamanPersetujuan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/executive/kemitraan"
            element={
              <ProtectedRoute requiredRole="owner">
                <HalamanKemitraan />
              </ProtectedRoute>
            }
          />
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
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

// Wrapper component untuk halaman pembayaran
const HalamanPembayaranRoute = () => {
    const paymentLocation = useLocation();
    const navigate = useNavigate();
    const state = (paymentLocation.state as any) || {};
  const amount = state?.amount ?? state?.bookingFee ?? 0;
  const referenceId = state?.referenceId;
  
  // Generate transactionId jika tidak ada, atau gunakan referenceId, atau buat ID baru
  const transactionId = state?.transactionId || referenceId || `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Tentukan payment type berdasarkan context
  const paymentType = state?.paymentType || (state?.bookingFee ? 'down_payment' : 'full_payment');

  return (
    <HalamanPembayaran
      amount={amount}
      currency="IDR"
      referenceId={referenceId}
      transactionId={transactionId}
      paymentType={paymentType}
      onPaymentSuccess={() => navigate('/riwayat')}
      onPaymentError={(err) => window.alert(err?.message || 'Pembayaran gagal')}
    />
  );
};