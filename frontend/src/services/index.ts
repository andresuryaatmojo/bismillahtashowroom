// Service Layer Index - Mobilindo Showroom
// Centralized export untuk semua service layer

// Core Services
export { default as LayananAPI } from './LayananAPI';
export { default as LayananUser } from './LayananUser';
export { default as LayananSesi } from './LayananSesi';
export { default as LayananValidasi } from './LayananValidasi';

// Business Logic Services
export { default as LayananMobil } from './LayananMobil';
export { default as LayananTransaksi } from './LayananTransaksi';
export { default as LayananPembayaran } from './LayananPembayaran';
export { default as LayananKredit } from './LayananKredit';

// Content & Information Services
export { default as LayananArtikel } from './LayananArtikel';
export { default as LayananKonten } from './LayananKonten';
export { default as LayananPerbandingan } from './LayananPerbandingan';
export { default as LayananRekomendasi } from './LayananRekomendasi';

// User Interaction Services
export { default as LayananUlasan } from './LayananUlasan';
export { default as LayananKomentar } from './LayananKomentar';
export { LayananPenilaian } from './LayananPenilaian';
export { default as LayananBookmark } from './LayananBookmark';
export { default as LayananWishlist } from './LayananWishlist';

// Communication Services
// (hapus ekspor LayananChat)
// export { default as LayananChat } from './LayananChat';
export { default as LayananChatbot } from './LayananChatbot';

// Analytics & Business Intelligence
export { default as LayananAnalitik } from './LayananAnalitik';
// export { default as LayananKPI } from './LayananKPI'; // Commented out - empty file
export { default as LayananDashboard } from './LayananDashboard';
export { default as LayananBisnis } from './LayananBisnis';

// Marketing & Advertising
export { default as LayananIklan } from './LayananIklan';
export { default as LayananKemitraan } from './LayananKemitraan';

// Utility Services
export { default as LayananPencarian } from './LayananPencarian';
export { default as LayananBerkas } from './LayananBerkas';
export { default as LayananExport } from './LayananExport';

// AI & Advanced Features
export { default as LayananAI } from './LayananAI';

// Policy & Compliance
export { default as LayananKebijakan } from './LayananKebijakan';

// Service Types untuk TypeScript
export type {
  // Core Service Types
  UserServiceResponse,
  SessionServiceResponse,
  ValidationServiceResponse,
  
  // Business Service Types
  MobilServiceResponse,
  TransaksiServiceResponse,
  PembayaranServiceResponse,
  KreditServiceResponse,
  
  // Content Service Types
  ArtikelServiceResponse,
  KontenServiceResponse,
  PerbandinganServiceResponse,
  RekomendasiServiceResponse,
  
  // User Interaction Service Types
  UlasanServiceResponse,
  KomentarServiceResponse,
  PenilaianServiceResponse,
  BookmarkServiceResponse,
  WishlistServiceResponse,
  
  // Communication Service Types
  ChatServiceResponse,
  ChatbotServiceResponse,
  
  // Analytics Service Types
  AnalitikServiceResponse,
  KPIServiceResponse,
  DashboardServiceResponse,
  BisnisServiceResponse,
  
  // Marketing Service Types
  IklanServiceResponse,
  KemitraanServiceResponse,
  
  // Utility Service Types
  PencarianServiceResponse,
  BerkasServiceResponse,
  ExportServiceResponse,
  
  // AI Service Types
  AIServiceResponse,
  
  // Policy Service Types
  KebijakanServiceResponse
} from './types';

// Import classes for service instances
import LayananAPI from './LayananAPI';
import LayananUser from './LayananUser';
import LayananSesi from './LayananSesi';
import LayananValidasi from './LayananValidasi';
import LayananMobil from './LayananMobil';
import LayananTransaksi from './LayananTransaksi';
import layananPembayaran from './LayananPembayaran';
import LayananKredit from './LayananKredit';
import LayananArtikel from './LayananArtikel';
import LayananKonten from './LayananKonten';
import LayananPerbandingan from './LayananPerbandingan';
import layananRekomendasi from './LayananRekomendasi';
import LayananUlasan from './LayananUlasan';
import LayananKomentar from './LayananKomentar';
import LayananPenilaian from './LayananPenilaian';
import LayananBookmark from './LayananBookmark';
import LayananWishlist from './LayananWishlist';
// (hapus import layananChat)
// import layananChat from './LayananChat';
import LayananChatbot from './LayananChatbot';
import LayananAnalitik from './LayananAnalitik';
import layananDashboard from './LayananDashboard';
import layananBisnis from './LayananBisnis';
import layananIklan from './LayananIklan';
import LayananKemitraan from './LayananKemitraan';
import LayananPencarian, { layananPencarian } from './LayananPencarian';
import layananBerkas from './LayananBerkas';
import LayananExport from './LayananExport';
import layananAI from './LayananAI';
import layananKebijakan from './LayananKebijakan';

// Service Instances untuk Singleton Pattern
export const serviceInstances = {
  // Core Services
  api: new LayananAPI(),
  user: new LayananUser(),
  session: LayananSesi.getInstance(),
  validation: LayananValidasi.getInstance(),
  
  // Business Services
  mobil: new LayananMobil(),
  transaksi: new LayananTransaksi(),
  pembayaran: layananPembayaran,
  kredit: LayananKredit.getInstance(),
  
  // Content Services
  artikel: LayananArtikel.getInstance(),
  konten: new LayananKonten(),
  perbandingan: LayananPerbandingan.getInstance(),
  rekomendasi: layananRekomendasi,
  
  // User Interaction Services
  ulasan: new LayananUlasan(),
  komentar: LayananKomentar,
  penilaian: LayananPenilaian.getInstance(),
  bookmark: new LayananBookmark(),
  wishlist: LayananWishlist.getInstance(),
  
  // Communication Services
  // (hapus pemetaan chat)
  // chat: layananChat,
  chatbot: new LayananChatbot(),
  
  // Analytics Services
  analitik: new LayananAnalitik(),
  dashboard: layananDashboard,
  bisnis: layananBisnis,
  
  // Marketing Services
  iklan: layananIklan,
  kemitraan: new LayananKemitraan(),
  
  // Utility Services
  pencarian: layananPencarian,
  berkas: layananBerkas,
  export: new LayananExport(),
  
  // AI Services
  ai: layananAI,

  // Policy Services
  kebijakan: layananKebijakan
};

// Service Categories untuk organisasi
export const serviceCategories = {
  core: ['api', 'user', 'session', 'validation'],
  business: ['mobil', 'transaksi', 'pembayaran', 'kredit'],
  content: ['artikel', 'konten', 'perbandingan', 'rekomendasi'],
  interaction: ['ulasan', 'komentar', 'penilaian', 'bookmark', 'wishlist'],
  // Hanya chatbot yang tersisa di komunikasi
  communication: ['chatbot'],
  analytics: ['analitik', 'kpi', 'dashboard', 'bisnis'],
  marketing: ['iklan', 'kemitraan'],
  utility: ['pencarian', 'berkas', 'export'],
  ai: ['ai'],
  policy: ['kebijakan']
};

// Helper function untuk mendapatkan service berdasarkan kategori
export const getServicesByCategory = (category: keyof typeof serviceCategories) => {
  return serviceCategories[category].map(serviceName => 
    serviceInstances[serviceName as keyof typeof serviceInstances]
  );
};

// Helper function untuk inisialisasi semua services
export const initializeAllServices = async () => {
  console.log('🚀 Initializing Mobilindo Showroom Services...');
  
  try {
    // Initialize core services first
    await Promise.all(getServicesByCategory('core').map(service => 
      service.constructor.name
    ));
    
    // Initialize other services
    const otherCategories = Object.keys(serviceCategories).filter(cat => cat !== 'core');
    await Promise.all(
      otherCategories.flatMap(category => 
        getServicesByCategory(category as keyof typeof serviceCategories)
      ).map(service => service.constructor.name)
    );
    
    console.log('✅ All services initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing services:', error);
    return false;
  }
};

// Service health check
export const checkServiceHealth = () => {
  const healthStatus = Object.entries(serviceInstances).map(([name, instance]) => ({
    service: name,
    status: instance ? 'healthy' : 'unhealthy',
    instance: !!instance
  }));
  
  const healthyCount = healthStatus.filter(s => s.status === 'healthy').length;
  const totalCount = healthStatus.length;
  
  return {
    overall: healthyCount === totalCount ? 'healthy' : 'degraded',
    services: healthStatus,
    summary: `${healthyCount}/${totalCount} services healthy`
  };
};

// Export default sebagai service manager
export default {
  instances: serviceInstances,
  categories: serviceCategories,
  getServicesByCategory,
  initializeAllServices,
  checkServiceHealth
};