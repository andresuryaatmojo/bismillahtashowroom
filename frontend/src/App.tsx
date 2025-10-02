import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { NextUIProvider } from '@nextui-org/react';
import Navigation from './components/Navigation';
import GuestNavigation from './components/GuestNavigation';
import HalamanBeranda from './pages/HalamanBeranda';
import Login from './pages/Login';
import Register from './pages/Register';
import HalamanDashboard from './pages/HalamanDashboard';
import HalamanProfil from './pages/HalamanProfil';
import HalamanKatalog from './pages/HalamanKatalog';
import HalamanAdmin from './pages/HalamanAdmin';
import HalamanExecutive from './pages/HalamanExecutive';
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
import LoginForm from './components/LoginForm';
import NotFound from './pages/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const AppContent: React.FC = () => {
  const location = useLocation();
  const authPages = ['/login', '/register'];
  const guestPages = ['/', '/katalog', '/artikel', '/kemitraan', '/simulasi', '/perbandingan', '/test-drive', '/trade-in'];
  const isAuthPage = authPages.includes(location.pathname);
  const isGuestPage = guestPages.includes(location.pathname);
  const isAuthenticatedPage = !isAuthPage && !isGuestPage;

  return (
    <div className="App">
      {isGuestPage && <GuestNavigation />}
      {isAuthenticatedPage && <Navigation />}
      <Routes>
        <Route path="/" element={<HalamanBeranda />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<HalamanDashboard />} />
        <Route path="/profil" element={<HalamanProfil />} />
        <Route path="/katalog" element={<HalamanKatalog />} />
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <HalamanAdmin />
          </ProtectedRoute>
        } />
        <Route path="/admin/login" element={<LoginForm />} />
        <Route path="/executive" element={
          <ProtectedRoute requiredRole="executive">
            <HalamanExecutive />
          </ProtectedRoute>
        } />
        <Route path="/artikel" element={<HalamanArtikel />} />
        <Route path="/chat" element={<HalamanChat />} />
        <Route path="/mobil/:id" element={<HalamanDetailMobil />} />
        <Route path="/iklan" element={<HalamanIklan />} />
        <Route path="/kelola-iklan" element={<HalamanKelolaIklan />} />
        <Route path="/kemitraan" element={<HalamanKemitraan />} />
        <Route path="/konten" element={<HalamanKonten />} />
        <Route path="/laporan" element={<HalamanLaporan />} />
        <Route path="/pembelian" element={<HalamanPembelian />} />
        <Route path="/perbandingan" element={<HalamanPerbandingan />} />
        <Route path="/riwayat" element={<HalamanRiwayat />} />
        <Route path="/simulasi" element={<HalamanSimulasi />} />
        <Route path="/test-drive" element={<HalamanTestDrive />} />
        <Route path="/trade-in" element={<HalamanTradeIn />} />
        <Route path="/transaksi" element={<HalamanTransaksi />} />
        <Route path="/wishlist" element={<HalamanWishlist />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

function App() {
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