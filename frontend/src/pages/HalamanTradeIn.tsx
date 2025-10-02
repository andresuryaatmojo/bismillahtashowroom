import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Interface untuk data mobil lama
interface DataMobilLama {
  id?: string;
  merk: string;
  model: string;
  tahun: number;
  transmisi: 'Manual' | 'Automatic' | 'CVT';
  bahanBakar: 'Bensin' | 'Diesel' | 'Hybrid' | 'Electric';
  kilometer: number;
  warna: string;
  nomorPolisi: string;
  nomorRangka: string;
  nomorMesin: string;
  kondisiUmum: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Perbaikan';
  kelengkapanDokumen: {
    stnk: boolean;
    bpkb: boolean;
    faktur: boolean;
    ktp: boolean;
    buktiPajak: boolean;
  };
  riwayatServis: boolean;
  riwayatKecelakaan: boolean;
  modifikasi: boolean;
  deskripsiTambahan: string;
}

// Interface untuk foto mobil
interface FotoMobil {
  id: string;
  file: File;
  url: string;
  kategori: 'depan' | 'belakang' | 'samping-kiri' | 'samping-kanan' | 'interior' | 'dashboard' | 'mesin' | 'dokumen';
  deskripsi: string;
  uploaded: boolean;
}

// Interface untuk permintaan trade-in
interface PermintaanTradeIn {
  id: string;
  tanggalPermintaan: string;
  dataMobil: DataMobilLama;
  fotoMobil: FotoMobil[];
  status: 'pending' | 'review' | 'survey-scheduled' | 'survey-completed' | 'negotiation' | 'completed' | 'rejected';
  estimasiHarga: {
    minimum: number;
    maksimum: number;
    rata: number;
  };
  hargaFinal?: number;
  alasanPenolakan?: string;
  jadwalSurvey?: JadwalSurvey;
  riwayatNegosiasi: NegosiasiBid[];
  catatan: string;
}

// Interface untuk jadwal survey
interface JadwalSurvey {
  id: string;
  tanggal: string;
  waktu: string;
  lokasi: 'showroom' | 'rumah' | 'kantor';
  alamat: string;
  surveyor: {
    nama: string;
    telepon: string;
    foto: string;
  };
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  catatan: string;
}

// Interface untuk negosiasi harga
interface NegosiasiBid {
  id: string;
  tanggal: string;
  pengirim: 'user' | 'dealer';
  hargaTawaran: number;
  alasan: string;
  status: 'pending' | 'accepted' | 'rejected' | 'counter';
  balasan?: string;
}

// Interface untuk state halaman
interface StateHalaman {
  loading: boolean;
  error: string | null;
  activeStep: 'akses' | 'input-data' | 'upload-foto' | 'review' | 'submitted' | 'survey' | 'negosiasi' | 'final';
  dataMobil: DataMobilLama;
  fotoMobil: FotoMobil[];
  permintaanTradeIn: PermintaanTradeIn | null;
  jadwalSurvey: JadwalSurvey | null;
  riwayatPermintaan: PermintaanTradeIn[];
  showConfirmModal: boolean;
  showSurveyModal: boolean;
  showNegosiasiModal: boolean;
  showFinalModal: boolean;
  uploadProgress: { [key: string]: number };
  estimasiHarga: {
    minimum: number;
    maksimum: number;
    rata: number;
  } | null;
  negosiasiBaru: {
    harga: number;
    alasan: string;
  };
}

const HalamanTradeIn: React.FC = () => {
  const navigate = useNavigate();

  // State management
  const [state, setState] = useState<StateHalaman>({
    loading: false,
    error: null,
    activeStep: 'akses',
    dataMobil: {
      merk: '',
      model: '',
      tahun: new Date().getFullYear(),
      transmisi: 'Manual',
      bahanBakar: 'Bensin',
      kilometer: 0,
      warna: '',
      nomorPolisi: '',
      nomorRangka: '',
      nomorMesin: '',
      kondisiUmum: 'Baik',
      kelengkapanDokumen: {
        stnk: false,
        bpkb: false,
        faktur: false,
        ktp: false,
        buktiPajak: false
      },
      riwayatServis: false,
      riwayatKecelakaan: false,
      modifikasi: false,
      deskripsiTambahan: ''
    },
    fotoMobil: [],
    permintaanTradeIn: null,
    jadwalSurvey: null,
    riwayatPermintaan: [],
    showConfirmModal: false,
    showSurveyModal: false,
    showNegosiasiModal: false,
    showFinalModal: false,
    uploadProgress: {},
    estimasiHarga: null,
    negosiasiBaru: {
      harga: 0,
      alasan: ''
    }
  });

  /**
   * Akses fitur trade-in
   */
  const aksesFiturTradeIn = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Load existing trade-in requests
      const savedRequests = localStorage.getItem('tradeInRequests');
      const parsedRequests = savedRequests ? JSON.parse(savedRequests) : [];

      await new Promise(resolve => setTimeout(resolve, 500));

      setState(prev => ({
        ...prev,
        loading: false,
        riwayatPermintaan: parsedRequests,
        activeStep: 'akses'
      }));

    } catch (error) {
      console.error('Error accessing trade-in feature:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal memuat fitur trade-in. Silakan coba lagi.'
      }));
    }
  }, []);

  /**
   * Input data mobil lama
   * @param dataMobil - Data mobil lama yang akan di-trade-in
   */
  const inputDataMobilLama = useCallback(async (dataMobil: DataMobilLama) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Validate required fields
      if (!dataMobil.merk || !dataMobil.model || !dataMobil.tahun) {
        throw new Error('Mohon lengkapi data merk, model, dan tahun mobil');
      }

      if (dataMobil.tahun < 1990 || dataMobil.tahun > new Date().getFullYear()) {
        throw new Error('Tahun mobil tidak valid');
      }

      if (dataMobil.kilometer < 0 || dataMobil.kilometer > 1000000) {
        throw new Error('Kilometer tidak valid');
      }

      if (!dataMobil.nomorPolisi || !dataMobil.nomorRangka || !dataMobil.nomorMesin) {
        throw new Error('Mohon lengkapi nomor polisi, rangka, dan mesin');
      }

      // Check document completeness
      const requiredDocs = ['stnk', 'bpkb', 'ktp'];
      const missingDocs = requiredDocs.filter(doc => !dataMobil.kelengkapanDokumen[doc as keyof typeof dataMobil.kelengkapanDokumen]);
      
      if (missingDocs.length > 0) {
        throw new Error(`Dokumen wajib belum lengkap: ${missingDocs.join(', ').toUpperCase()}`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));

      // Generate price estimation based on car data
      const estimasi = generatePriceEstimation(dataMobil);

      setState(prev => ({
        ...prev,
        loading: false,
        dataMobil: { ...dataMobil, id: 'car-' + Date.now() },
        estimasiHarga: estimasi,
        activeStep: 'upload-foto'
      }));

    } catch (error) {
      console.error('Error inputting car data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Gagal menyimpan data mobil. Silakan coba lagi.'
      }));
    }
  }, []);

  /**
   * Upload foto mobil
   * @param fotoMobil - Array foto mobil yang akan diupload
   */
  const uploadFotoMobil = useCallback(async (fotoMobil: File[]) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      if (fotoMobil.length === 0) {
        throw new Error('Minimal upload 4 foto mobil (depan, belakang, samping kiri, samping kanan)');
      }

      const requiredCategories = ['depan', 'belakang', 'samping-kiri', 'samping-kanan'];
      const uploadedPhotos: FotoMobil[] = [];

      // Process each photo
      for (let i = 0; i < fotoMobil.length; i++) {
        const file = fotoMobil[i];
        
        // Validate file
        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${file.name} bukan format gambar yang valid`);
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error(`File ${file.name} terlalu besar. Maksimal 5MB per foto`);
        }

        // Create photo object
        const photoId = 'photo-' + Date.now() + '-' + i;
        const photoUrl = URL.createObjectURL(file);
        
        const kategori = i < requiredCategories.length 
          ? requiredCategories[i] as FotoMobil['kategori']
          : 'interior';

        const photo: FotoMobil = {
          id: photoId,
          file,
          url: photoUrl,
          kategori,
          deskripsi: `Foto ${kategori.replace('-', ' ')}`,
          uploaded: false
        };

        uploadedPhotos.push(photo);

        // Simulate upload progress
        setState(prev => ({
          ...prev,
          uploadProgress: { ...prev.uploadProgress, [photoId]: 0 }
        }));

        // Simulate upload with progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setState(prev => ({
            ...prev,
            uploadProgress: { ...prev.uploadProgress, [photoId]: progress }
          }));
        }

        // Mark as uploaded
        photo.uploaded = true;
      }

      // Check if required photos are present
      const uploadedCategories = uploadedPhotos.map(p => p.kategori);
      const missingRequired = requiredCategories.filter(cat => !uploadedCategories.includes(cat as FotoMobil['kategori']));

      if (missingRequired.length > 0) {
        throw new Error(`Foto wajib belum lengkap: ${missingRequired.join(', ')}`);
      }

      setState(prev => ({
        ...prev,
        loading: false,
        fotoMobil: uploadedPhotos,
        activeStep: 'review'
      }));

    } catch (error) {
      console.error('Error uploading photos:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Gagal mengupload foto. Silakan coba lagi.'
      }));
    }
  }, []);

  /**
   * Submit permintaan trade-in
   * @param dataLengkap - Data lengkap permintaan trade-in
   */
  const submitPermintaanTradeIn = useCallback(async (dataLengkap: { dataMobil: DataMobilLama; fotoMobil: FotoMobil[]; catatan: string }) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Validate complete data
      if (!dataLengkap.dataMobil.id) {
        throw new Error('Data mobil belum lengkap');
      }

      if (dataLengkap.fotoMobil.length < 4) {
        throw new Error('Minimal 4 foto mobil diperlukan');
      }

      const requiredPhotos = dataLengkap.fotoMobil.filter(foto => 
        ['depan', 'belakang', 'samping-kiri', 'samping-kanan'].includes(foto.kategori)
      );

      if (requiredPhotos.length < 4) {
        throw new Error('Foto wajib (depan, belakang, samping kiri, samping kanan) belum lengkap');
      }

      // Create trade-in request
      const permintaan: PermintaanTradeIn = {
        id: 'tradein-' + Date.now(),
        tanggalPermintaan: new Date().toISOString(),
        dataMobil: dataLengkap.dataMobil,
        fotoMobil: dataLengkap.fotoMobil,
        status: 'pending',
        estimasiHarga: state.estimasiHarga || {
          minimum: 0,
          maksimum: 0,
          rata: 0
        },
        riwayatNegosiasi: [],
        catatan: dataLengkap.catatan
      };

      // Simulate API submission
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Save to localStorage
      const existingRequests = localStorage.getItem('tradeInRequests');
      const requests = existingRequests ? JSON.parse(existingRequests) : [];
      requests.unshift(permintaan);
      localStorage.setItem('tradeInRequests', JSON.stringify(requests));

      // Update status to review after submission
      setTimeout(() => {
        permintaan.status = 'review';
        const updatedRequests = requests.map((req: PermintaanTradeIn) => 
          req.id === permintaan.id ? permintaan : req
        );
        localStorage.setItem('tradeInRequests', JSON.stringify(updatedRequests));
        
        setState(prev => ({
          ...prev,
          permintaanTradeIn: permintaan,
          riwayatPermintaan: updatedRequests
        }));
      }, 5000);

      setState(prev => ({
        ...prev,
        loading: false,
        permintaanTradeIn: permintaan,
        riwayatPermintaan: [permintaan, ...prev.riwayatPermintaan],
        activeStep: 'submitted'
      }));

    } catch (error) {
      console.error('Error submitting trade-in request:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Gagal mengirim permintaan trade-in. Silakan coba lagi.'
      }));
    }
  }, [state.estimasiHarga]);

  /**
   * Jadwalkan survey fisik
   * @param jadwalSurvey - Data jadwal survey fisik
   */
  const jadwalkanSurveyFisik = useCallback(async (jadwalSurvey: Omit<JadwalSurvey, 'id' | 'status'>) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      if (!state.permintaanTradeIn) {
        throw new Error('Tidak ada permintaan trade-in aktif');
      }

      // Validate survey date
      const surveyDate = new Date(jadwalSurvey.tanggal + ' ' + jadwalSurvey.waktu);
      const now = new Date();
      const minDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Minimum tomorrow

      if (surveyDate < minDate) {
        throw new Error('Jadwal survey minimal H+1 dari sekarang');
      }

      if (!jadwalSurvey.alamat.trim()) {
        throw new Error('Alamat survey harus diisi');
      }

      // Create survey schedule
      const jadwal: JadwalSurvey = {
        id: 'survey-' + Date.now(),
        ...jadwalSurvey,
        status: 'scheduled',
        surveyor: {
          nama: 'Ahmad Surveyor',
          telepon: '0812-3456-7890',
          foto: '/images/surveyor-1.jpg'
        }
      };

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update trade-in request
      const updatedRequest = {
        ...state.permintaanTradeIn,
        status: 'survey-scheduled' as const,
        jadwalSurvey: jadwal
      };

      // Update localStorage
      const requests = state.riwayatPermintaan.map(req => 
        req.id === updatedRequest.id ? updatedRequest : req
      );
      localStorage.setItem('tradeInRequests', JSON.stringify(requests));

      setState(prev => ({
        ...prev,
        loading: false,
        permintaanTradeIn: updatedRequest,
        jadwalSurvey: jadwal,
        riwayatPermintaan: requests,
        activeStep: 'survey'
      }));

    } catch (error) {
      console.error('Error scheduling survey:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Gagal menjadwalkan survey. Silakan coba lagi.'
      }));
    }
  }, [state.permintaanTradeIn, state.riwayatPermintaan]);

  /**
   * Ajukan negosiasi harga
   * @param usulanHarga - Usulan harga dari user
   */
  const ajukanNegoisasiHarga = useCallback(async (usulanHarga: { harga: number; alasan: string }) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      if (!state.permintaanTradeIn) {
        throw new Error('Tidak ada permintaan trade-in aktif');
      }

      if (usulanHarga.harga <= 0) {
        throw new Error('Harga harus lebih dari 0');
      }

      if (!usulanHarga.alasan.trim()) {
        throw new Error('Alasan negosiasi harus diisi');
      }

      const estimasi = state.permintaanTradeIn.estimasiHarga;
      if (usulanHarga.harga > estimasi.maksimum * 1.2) {
        throw new Error(`Harga terlalu tinggi. Maksimal ${formatCurrency(estimasi.maksimum * 1.2)}`);
      }

      // Create negotiation bid
      const negosiasi: NegosiasiBid = {
        id: 'nego-' + Date.now(),
        tanggal: new Date().toISOString(),
        pengirim: 'user',
        hargaTawaran: usulanHarga.harga,
        alasan: usulanHarga.alasan,
        status: 'pending'
      };

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update trade-in request
      const updatedRequest = {
        ...state.permintaanTradeIn,
        status: 'negotiation' as const,
        riwayatNegosiasi: [...state.permintaanTradeIn.riwayatNegosiasi, negosiasi]
      };

      // Simulate dealer response after 3 seconds
      setTimeout(() => {
        const dealerResponse: NegosiasiBid = {
          id: 'nego-dealer-' + Date.now(),
          tanggal: new Date().toISOString(),
          pengirim: 'dealer',
          hargaTawaran: Math.min(usulanHarga.harga * 0.9, estimasi.maksimum),
          alasan: 'Berdasarkan kondisi mobil dan harga pasar saat ini',
          status: 'counter',
          balasan: 'Kami dapat menawarkan harga ini sebagai harga terbaik'
        };

        const finalRequest = {
          ...updatedRequest,
          riwayatNegosiasi: [...updatedRequest.riwayatNegosiasi, dealerResponse]
        };

        const requests = state.riwayatPermintaan.map(req => 
          req.id === finalRequest.id ? finalRequest : req
        );
        localStorage.setItem('tradeInRequests', JSON.stringify(requests));

        setState(prev => ({
          ...prev,
          permintaanTradeIn: finalRequest,
          riwayatPermintaan: requests
        }));
      }, 3000);

      // Update localStorage
      const requests = state.riwayatPermintaan.map(req => 
        req.id === updatedRequest.id ? updatedRequest : req
      );
      localStorage.setItem('tradeInRequests', JSON.stringify(requests));

      setState(prev => ({
        ...prev,
        loading: false,
        permintaanTradeIn: updatedRequest,
        riwayatPermintaan: requests,
        activeStep: 'negosiasi',
        negosiasiBaru: { harga: 0, alasan: '' }
      }));

    } catch (error) {
      console.error('Error submitting negotiation:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Gagal mengajukan negosiasi. Silakan coba lagi.'
      }));
    }
  }, [state.permintaanTradeIn, state.riwayatPermintaan]);

  /**
   * Terima hasil final
   * @param keputusan - Keputusan user (terima/tolak)
   */
  const terimaHasilFinal = useCallback(async (keputusan: 'terima' | 'tolak') => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      if (!state.permintaanTradeIn) {
        throw new Error('Tidak ada permintaan trade-in aktif');
      }

      const latestNegotiation = state.permintaanTradeIn.riwayatNegosiasi
        .filter(nego => nego.pengirim === 'dealer')
        .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())[0];

      if (!latestNegotiation) {
        throw new Error('Tidak ada penawaran dari dealer');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update trade-in request
      const updatedRequest = {
        ...state.permintaanTradeIn,
        status: keputusan === 'terima' ? 'completed' as const : 'rejected' as const,
        hargaFinal: keputusan === 'terima' ? latestNegotiation.hargaTawaran : undefined,
        alasanPenolakan: keputusan === 'tolak' ? 'Ditolak oleh user' : undefined
      };

      // Update localStorage
      const requests = state.riwayatPermintaan.map(req => 
        req.id === updatedRequest.id ? updatedRequest : req
      );
      localStorage.setItem('tradeInRequests', JSON.stringify(requests));

      setState(prev => ({
        ...prev,
        loading: false,
        permintaanTradeIn: updatedRequest,
        riwayatPermintaan: requests,
        activeStep: 'final'
      }));

    } catch (error) {
      console.error('Error accepting final result:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Gagal memproses keputusan. Silakan coba lagi.'
      }));
    }
  }, [state.permintaanTradeIn, state.riwayatPermintaan]);

  /**
   * Generate price estimation based on car data
   */
  const generatePriceEstimation = (dataMobil: DataMobilLama) => {
    // Base price estimation logic (simplified)
    const currentYear = new Date().getFullYear();
    const carAge = currentYear - dataMobil.tahun;
    
    // Base prices by brand (in millions)
    const basePrices: { [key: string]: number } = {
      'Toyota': 200,
      'Honda': 180,
      'Daihatsu': 150,
      'Suzuki': 130,
      'Mitsubishi': 140,
      'Nissan': 160
    };

    const basePrice = basePrices[dataMobil.merk] || 120;
    
    // Depreciation calculation
    let estimatedPrice = basePrice * Math.pow(0.85, carAge); // 15% depreciation per year
    
    // Adjust for mileage
    const mileageFactor = Math.max(0.5, 1 - (dataMobil.kilometer / 200000) * 0.3);
    estimatedPrice *= mileageFactor;
    
    // Adjust for condition
    const conditionMultipliers = {
      'Sangat Baik': 1.1,
      'Baik': 1.0,
      'Cukup': 0.85,
      'Perlu Perbaikan': 0.7
    };
    estimatedPrice *= conditionMultipliers[dataMobil.kondisiUmum];
    
    // Adjust for accidents and modifications
    if (dataMobil.riwayatKecelakaan) estimatedPrice *= 0.8;
    if (dataMobil.modifikasi) estimatedPrice *= 0.9;
    if (!dataMobil.riwayatServis) estimatedPrice *= 0.9;
    
    // Convert to rupiah (millions to actual price)
    const finalPrice = estimatedPrice * 1000000;
    
    return {
      minimum: Math.round(finalPrice * 0.8),
      maksimum: Math.round(finalPrice * 1.2),
      rata: Math.round(finalPrice)
    };
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: PermintaanTradeIn['status']): string => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'review': 'bg-blue-100 text-blue-800',
      'survey-scheduled': 'bg-purple-100 text-purple-800',
      'survey-completed': 'bg-indigo-100 text-indigo-800',
      'negotiation': 'bg-orange-100 text-orange-800',
      'completed': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  /**
   * Get status label
   */
  const getStatusLabel = (status: PermintaanTradeIn['status']): string => {
    const labels = {
      'pending': 'Menunggu Review',
      'review': 'Sedang Direview',
      'survey-scheduled': 'Survey Dijadwalkan',
      'survey-completed': 'Survey Selesai',
      'negotiation': 'Negosiasi',
      'completed': 'Selesai',
      'rejected': 'Ditolak'
    };
    return labels[status] || status;
  };

  // Load initial data
  useEffect(() => {
    aksesFiturTradeIn();
  }, [aksesFiturTradeIn]);

  // Render loading state
  if (state.loading && state.activeStep === 'akses' && state.riwayatPermintaan.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat fitur trade-in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Trade-In Mobil</h1>
          <p className="text-gray-600 mt-2">
            Tukar tambah mobil lama Anda dengan mudah dan dapatkan harga terbaik
          </p>
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700">{state.error}</p>
            </div>
          </div>
        )}

        {/* Step Indicator */}
        {state.activeStep !== 'akses' && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              {[
                { id: 'input-data', label: 'Data Mobil', icon: '📝' },
                { id: 'upload-foto', label: 'Upload Foto', icon: '📷' },
                { id: 'review', label: 'Review', icon: '👀' },
                { id: 'submitted', label: 'Terkirim', icon: '✅' }
              ].map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    state.activeStep === step.id
                      ? 'bg-blue-600 text-white'
                      : ['input-data', 'upload-foto', 'review', 'submitted'].indexOf(state.activeStep) > index
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    <span className="text-lg">{step.icon}</span>
                  </div>
                  <span className={`ml-2 font-medium ${
                    state.activeStep === step.id ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {step.label}
                  </span>
                  {index < 3 && (
                    <div className={`w-16 h-1 mx-4 ${
                      ['input-data', 'upload-foto', 'review', 'submitted'].indexOf(state.activeStep) > index
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Akses Fitur Trade-In */}
          {state.activeStep === 'akses' && (
            <div>
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🚗💱</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Tukar Tambah Mobil Anda</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Dapatkan harga terbaik untuk mobil lama Anda. Proses mudah, cepat, dan terpercaya.
                  Tim ahli kami akan menilai mobil Anda secara profesional.
                </p>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 border border-gray-200 rounded-lg">
                  <div className="text-3xl mb-3">💰</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Harga Terbaik</h3>
                  <p className="text-gray-600 text-sm">
                    Dapatkan penawaran harga terbaik berdasarkan kondisi dan harga pasar terkini
                  </p>
                </div>
                
                <div className="text-center p-6 border border-gray-200 rounded-lg">
                  <div className="text-3xl mb-3">⚡</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Proses Cepat</h3>
                  <p className="text-gray-600 text-sm">
                    Proses evaluasi dan penawaran harga dalam waktu 24 jam
                  </p>
                </div>
                
                <div className="text-center p-6 border border-gray-200 rounded-lg">
                  <div className="text-3xl mb-3">🛡️</div>
                  <h3 className="font-semibold text-gray-800 mb-2">Aman & Terpercaya</h3>
                  <p className="text-gray-600 text-sm">
                    Transaksi aman dengan jaminan legalitas dokumen dan pembayaran
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mb-8">
                <button
                  onClick={() => setState(prev => ({ ...prev, activeStep: 'input-data' }))}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Mulai Trade-In
                </button>
                <button
                  onClick={() => navigate('/cars')}
                  className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  Lihat Mobil Baru
                </button>
              </div>

              {/* Existing Requests */}
              {state.riwayatPermintaan.length > 0 && (
                <div className="border-t pt-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Riwayat Permintaan Trade-In</h3>
                  <div className="space-y-4">
                    {state.riwayatPermintaan.slice(0, 5).map((request) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-gray-800">
                                {request.dataMobil.merk} {request.dataMobil.model} {request.dataMobil.tahun}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                {getStatusLabel(request.status)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>📅 {new Date(request.tanggalPermintaan).toLocaleDateString('id-ID')}</span>
                              <span>🏷️ {formatCurrency(request.estimasiHarga.rata)}</span>
                              {request.hargaFinal && (
                                <span className="text-green-600 font-medium">
                                  ✅ Final: {formatCurrency(request.hargaFinal)}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setState(prev => ({
                                ...prev,
                                permintaanTradeIn: request,
                                dataMobil: request.dataMobil,
                                fotoMobil: request.fotoMobil,
                                estimasiHarga: request.estimasiHarga,
                                activeStep: request.status === 'completed' || request.status === 'rejected' 
                                  ? 'final' 
                                  : request.status === 'negotiation' 
                                  ? 'negosiasi'
                                  : request.status.includes('survey')
                                  ? 'survey'
                                  : 'submitted'
                              }));
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input Data Mobil */}
          {state.activeStep === 'input-data' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Data Mobil Lama</h2>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                inputDataMobilLama(state.dataMobil);
              }} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Merk Mobil *
                    </label>
                    <select
                      required
                      value={state.dataMobil.merk}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        dataMobil: { ...prev.dataMobil, merk: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Pilih Merk</option>
                      <option value="Toyota">Toyota</option>
                      <option value="Honda">Honda</option>
                      <option value="Daihatsu">Daihatsu</option>
                      <option value="Suzuki">Suzuki</option>
                      <option value="Mitsubishi">Mitsubishi</option>
                      <option value="Nissan">Nissan</option>
                      <option value="Mazda">Mazda</option>
                      <option value="Hyundai">Hyundai</option>
                      <option value="KIA">KIA</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model Mobil *
                    </label>
                    <input
                      type="text"
                      required
                      value={state.dataMobil.model}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        dataMobil: { ...prev.dataMobil, model: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: Avanza 1.3 G"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tahun *
                    </label>
                    <select
                      required
                      value={state.dataMobil.tahun}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        dataMobil: { ...prev.dataMobil, tahun: parseInt(e.target.value) }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Array.from({ length: 35 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Technical Specs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transmisi *
                    </label>
                    <select
                      required
                      value={state.dataMobil.transmisi}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        dataMobil: { ...prev.dataMobil, transmisi: e.target.value as DataMobilLama['transmisi'] }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                      <option value="CVT">CVT</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bahan Bakar *
                    </label>
                    <select
                      required
                      value={state.dataMobil.bahanBakar}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        dataMobil: { ...prev.dataMobil, bahanBakar: e.target.value as DataMobilLama['bahanBakar'] }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Bensin">Bensin</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>
                </div>

                {/* Condition & Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kilometer *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="1000000"
                      value={state.dataMobil.kilometer || ''}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        dataMobil: { ...prev.dataMobil, kilometer: parseInt(e.target.value) || 0 }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: 50000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kondisi Umum *
                    </label>
                    <select
                      required
                      value={state.dataMobil.kondisiUmum}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        dataMobil: { ...prev.dataMobil, kondisiUmum: e.target.value as DataMobilLama['kondisiUmum'] }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Sangat Baik">Sangat Baik</option>
                      <option value="Baik">Baik</option>
                      <option value="Cukup">Cukup</option>
                      <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                    </select>
                  </div>
                </div>

                {/* Vehicle Numbers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Polisi *
                    </label>
                    <input
                      type="text"
                      required
                      value={state.dataMobil.nomorPolisi}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        dataMobil: { ...prev.dataMobil, nomorPolisi: e.target.value.toUpperCase() }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: B 1234 ABC"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Rangka *
                    </label>
                    <input
                      type="text"
                      required
                      value={state.dataMobil.nomorRangka}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        dataMobil: { ...prev.dataMobil, nomorRangka: e.target.value.toUpperCase() }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="17 digit nomor rangka"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nomor Mesin *
                    </label>
                    <input
                      type="text"
                      required
                      value={state.dataMobil.nomorMesin}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        dataMobil: { ...prev.dataMobil, nomorMesin: e.target.value.toUpperCase() }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nomor mesin kendaraan"
                    />
                  </div>
                </div>

                {/* Document Completeness */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Kelengkapan Dokumen *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries({
                      stnk: 'STNK',
                      bpkb: 'BPKB',
                      faktur: 'Faktur',
                      ktp: 'KTP Pemilik',
                      buktiPajak: 'Bukti Pajak'
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={state.dataMobil.kelengkapanDokumen[key as keyof typeof state.dataMobil.kelengkapanDokumen]}
                          onChange={(e) => setState(prev => ({
                            ...prev,
                            dataMobil: {
                              ...prev.dataMobil,
                              kelengkapanDokumen: {
                                ...prev.dataMobil.kelengkapanDokumen,
                                [key]: e.target.checked
                              }
                            }
                          }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    * STNK, BPKB, dan KTP Pemilik wajib ada
                  </p>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={state.dataMobil.riwayatServis}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        dataMobil: { ...prev.dataMobil, riwayatServis: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                    />
                    <span className="text-sm text-gray-700">Ada riwayat servis rutin</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={state.dataMobil.riwayatKecelakaan}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        dataMobil: { ...prev.dataMobil, riwayatKecelakaan: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                    />
                    <span className="text-sm text-gray-700">Pernah mengalami kecelakaan</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={state.dataMobil.modifikasi}
                      onChange={(e) => setState(prev => ({
                        ...prev,
                        dataMobil: { ...prev.dataMobil, modifikasi: e.target.checked }
                      }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                    />
                    <span className="text-sm text-gray-700">Ada modifikasi</span>
                  </label>
                </div>

                {/* Additional Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Tambahan
                  </label>
                  <textarea
                    value={state.dataMobil.deskripsiTambahan}
                    onChange={(e) => setState(prev => ({
                      ...prev,
                      dataMobil: { ...prev.dataMobil, deskripsiTambahan: e.target.value }
                    }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ceritakan kondisi khusus, kerusakan, atau hal penting lainnya tentang mobil Anda..."
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setState(prev => ({ ...prev, activeStep: 'akses' }))}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={state.loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {state.loading ? 'Memproses...' : 'Lanjutkan'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Negosiasi Baru */}
          {state.activeStep === 'negosiasi' && state.permintaanTradeIn && (
            <div className="text-center">
              <div className="text-6xl mb-6">
                {state.permintaanTradeIn.status === 'pending' ? '🎉' : '😔'}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {state.permintaanTradeIn.status === 'pending' 
                  ? 'Trade-In Berhasil Diselesaikan!' 
                  : 'Trade-In Dibatalkan'
                }
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                {state.permintaanTradeIn.status === 'pending'
                  ? 'Selamat! Proses trade-in mobil Anda telah selesai. Terima kasih telah mempercayai layanan kami.'
                  : 'Proses trade-in telah dibatalkan. Anda dapat mengajukan permintaan baru kapan saja.'
                }
              </p>

              {/* Final Details */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left max-w-2xl mx-auto">
                <h3 className="font-semibold text-gray-800 mb-4">Ringkasan Trade-In</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mobil:</span>
                    <span className="font-medium">
                      {state.permintaanTradeIn.dataMobil.merk} {state.permintaanTradeIn.dataMobil.model} {state.permintaanTradeIn.dataMobil.tahun}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimasi Awal:</span>
                    <span className="font-medium">{formatCurrency(state.permintaanTradeIn.estimasiHarga.rata)}</span>
                  </div>
                  {state.permintaanTradeIn.hargaFinal && (
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Harga Final:</span>
                      <span className="font-bold text-green-600 text-lg">
                        {formatCurrency(state.permintaanTradeIn.hargaFinal)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(state.permintaanTradeIn.status)}`}>
                      {getStatusLabel(state.permintaanTradeIn.status)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tanggal Selesai:</span>
                    <span className="font-medium">{new Date().toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {state.permintaanTradeIn.status === 'completed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-left max-w-2xl mx-auto">
                  <h3 className="font-semibold text-green-800 mb-3">Langkah Selanjutnya</h3>
                  <ul className="text-sm text-green-700 space-y-2">
                    <li className="flex items-start">
                      <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">1</span>
                      <span>Tim administrasi akan menghubungi Anda untuk proses pembayaran</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">2</span>
                      <span>Persiapkan dokumen kendaraan untuk proses balik nama</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-3 mt-0.5">3</span>
                      <span>Pembayaran akan diproses dalam 1-2 hari kerja setelah dokumen lengkap</span>
                    </li>
                  </ul>
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setState(prev => ({ ...prev, activeStep: 'akses' }))}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Kembali ke Beranda
                </button>
                {state.permintaanTradeIn.status === 'completed' && (
                  <button
                    onClick={() => navigate('/cars')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Lihat Mobil Baru
                  </button>
                )}
                {state.permintaanTradeIn.status === 'rejected' && (
                  <button
                    onClick={() => setState(prev => ({ 
                      ...prev, 
                      activeStep: 'input-data',
                      dataMobil: {
                        merk: '',
                        model: '',
                        tahun: new Date().getFullYear(),
                        transmisi: 'Manual',
                        bahanBakar: 'Bensin',
                        kilometer: 0,
                        warna: '',
                        nomorPolisi: '',
                        nomorRangka: '',
                        nomorMesin: '',
                        kondisiUmum: 'Baik',
                        kelengkapanDokumen: {
                          stnk: false,
                          bpkb: false,
                          faktur: false,
                          ktp: false,
                          buktiPajak: false
                        },
                        riwayatServis: false,
                        riwayatKecelakaan: false,
                        modifikasi: false,
                        deskripsiTambahan: ''
                      },
                      fotoMobil: [],
                      permintaanTradeIn: null,
                      estimasiHarga: null
                    }))}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Coba Lagi
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {state.showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Konfirmasi Pengiriman</h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin mengirim permintaan trade-in? Data yang sudah dikirim tidak dapat diubah.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setState(prev => ({ ...prev, showConfirmModal: false }))}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    setState(prev => ({ ...prev, showConfirmModal: false }));
                    submitPermintaanTradeIn({
                      dataMobil: state.dataMobil,
                      fotoMobil: state.fotoMobil,
                      catatan: state.dataMobil.deskripsiTambahan
                    });
                  }}
                  disabled={state.loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.loading ? 'Mengirim...' : 'Ya, Kirim'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HalamanTradeIn;