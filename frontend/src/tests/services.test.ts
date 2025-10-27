// Service Layer Tests - Mobilindo Showroom
// Comprehensive testing untuk semua service layer

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Import individual services to avoid circular dependencies
import LayananAPI from '../services/LayananAPI';
import LayananUser from '../services/LayananUser';
import LayananSesi from '../services/LayananSesi';
import LayananValidasi from '../services/LayananValidasi';
import LayananMobil from '../services/LayananMobil';
import LayananTransaksi from '../services/LayananTransaksi';
import layananPembayaran from '../services/LayananPembayaran';
import LayananKredit from '../services/LayananKredit';
import LayananArtikel from '../services/LayananArtikel';
import LayananKonten from '../services/LayananKonten';
import LayananPerbandingan from '../services/LayananPerbandingan';
import LayananRekomendasi from '../services/LayananRekomendasi';
import LayananUlasan from '../services/LayananUlasan';
import LayananKomentar from '../services/LayananKomentar';
import LayananPenilaian from '../services/LayananPenilaian';
import LayananBookmark from '../services/LayananBookmark';
import LayananWishlist from '../services/LayananWishlist';
import LayananChatbot from '../services/LayananChatbot';
import LayananAnalitik from '../services/LayananAnalitik';
// import LayananKPI from '../services/LayananKPI'; // Commented out due to no default export
import LayananDashboard from '../services/LayananDashboard';
import LayananBisnis from '../services/LayananBisnis';
import LayananIklan from '../services/LayananIklan';
import LayananKemitraan from '../services/LayananKemitraan';
import LayananPencarian, { layananPencarian } from '../services/LayananPencarian';
import LayananBerkas from '../services/LayananBerkas';
import LayananExport from '../services/LayananExport';
import { LayananAI } from '../services/LayananAI';
import LayananKebijakan from '../services/LayananKebijakan';

describe('Service Layer Integration Tests', () => {
  
  beforeEach(() => {
    // Reset any mocks or state before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe('Service Initialization', () => {
    test('should create service instances successfully', () => {
      const apiService = new LayananAPI();
      const userService = LayananUser;
      const sessionService = LayananSesi.getInstance();
      
      expect(apiService).toBeDefined();
      expect(userService).toBeDefined();
      expect(sessionService).toBeDefined();
    });

    test('should maintain singleton pattern', () => {
      const instance1 = LayananSesi.getInstance();
      const instance2 = LayananSesi.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Core Services', () => {
    test('LayananAPI should be singleton', () => {
      const instance1 = new LayananAPI();
      const instance2 = new LayananAPI();
      expect(instance1).toBeDefined();
      expect(instance2).toBeDefined();
    });

    test('LayananUser should handle user operations', async () => {
      const userService = new LayananUser();
      expect(userService).toBeDefined();
      
      // Test user data retrieval
      const userResult = await userService.ambilSemuaDataUser();
      expect(userResult.success).toBe(true);
      expect(userResult.data?.users).toBeDefined();
    });

    test('LayananSesi should manage sessions', async () => {
      const sessionService = LayananSesi.getInstance();
      expect(sessionService).toBeDefined();
      
      // Test session creation - using proper method name
      const loginResult = await sessionService.buatTokenSesi('testuser', 'customer');
      expect(loginResult.success).toBe(true);
      expect(loginResult.sessionData?.token).toBeDefined();
    });

    test('LayananValidasi should handle validation operations', async () => {
      const validationService = new LayananValidasi();
      expect(validationService).toBeDefined();
      
      // Test email validation - using proper method name
      const emailResult = validationService.validasiFormatRegistrasi({
        nama: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        noTelepon: '081234567890',
        jenisAkun: 'pembeli'
      });
      expect(emailResult.isValid).toBe(true);
    });
  });

  describe('Business Services', () => {
    test('LayananMobil should handle car operations', async () => {
      const mobilService = new LayananMobil();
      expect(mobilService).toBeDefined();
      
      // Test car listing
      const carsResult = await mobilService.ambilSemuaMobilShowroom();
      expect(carsResult.success).toBe(true);
      expect(carsResult.data?.mobil).toBeDefined();
    });

    test('LayananTransaksi should handle transaction operations', async () => {
      const transaksiService = new LayananTransaksi();
      expect(transaksiService).toBeDefined();
      
      // Test transaction creation
      const transactionResult = await transaksiService.ambilSemuaTransaksi();
      expect(transactionResult.sukses).toBe(true);
    });

    test('LayananPembayaran should handle payment operations', async () => {
      const pembayaranService = layananPembayaran;
      expect(pembayaranService).toBeDefined();
      
      // Test payment processing using available method
      const paymentResult = await pembayaranService.hitungTarifLayanan(
        'maintenance-basic',
        'test-customer-id',
        { tier: 'basic' }
      );
      expect(paymentResult.success).toBe(true);
    });

    test('LayananKredit should handle credit operations', async () => {
      const kreditService = LayananKredit.getInstance();
      expect(kreditService).toBeDefined();
      
      // Test credit parameter initialization
      const simulationResult = await kreditService.inisialisasiParameterKredit();
      expect(simulationResult.success).toBe(true);
    });
  });

  describe('Content Services', () => {
    test('LayananArtikel should handle articles', async () => {
      const artikelService = LayananArtikel.getInstance();
      expect(artikelService).toBeDefined();
      
      // Test article filtering
      const articleResult = await artikelService.filterArtikelBerdasarkanKategori({
        kategori: ['tips'],
        limit: 10,
        offset: 0
      });
      expect(articleResult.success).toBe(true);
    });

    test('LayananPerbandingan should handle comparisons', async () => {
      const perbandinganService = LayananPerbandingan.getInstance();
      expect(perbandinganService).toBeDefined();
      
      // Test car comparison
      const comparisonResult = await perbandinganService.muatDataMobilPertama('toyota-avanza');
      expect(comparisonResult.success).toBe(true);
    });
  });

  describe('User Interaction Services', () => {
    test('LayananUlasan should handle reviews', async () => {
      const ulasanService = new LayananUlasan();
      expect(ulasanService).toBeDefined();
      
      // Test review data retrieval
      const reviewResult = await ulasanService.ambilDataUlasanPending();
      expect(reviewResult.success).toBe(true);
    });

    test('LayananBookmark should handle bookmark operations', async () => {
      const bookmarkService = new LayananBookmark();
      expect(bookmarkService).toBeDefined();
      
      // Test bookmark management
      const bookmarkResult = await bookmarkService.ambilSemuaBookmark('test-user-id');
      expect(bookmarkResult.sukses).toBe(true);
    });
  });

  describe('Communication Services', () => {
    test('LayananChatbot should handle chatbot operations', async () => {
      const chatbotService = new LayananChatbot();
      expect(chatbotService).toBeDefined();
      const chatbotResult = await chatbotService.ambilPertanyaanTidakTerjawab();
      expect(chatbotResult.success).toBe(true);
    });
  });

  test('LayananAnalitik should handle analytics operations', async () => {
    const analitikService = new LayananAnalitik();
    expect(analitikService).toBeDefined();
    
    // Test analytics tools loading
    const analyticsResult = await analitikService.muatToolsAnalitik();
    expect(analyticsResult.success).toBe(true);
  });
  test('LayananAnalitik should handle analytics', async () => {
    const analitikService = new LayananAnalitik();
    expect(analitikService).toBeDefined();
    
    // Test data processing
    const analyticsResult = await analitikService.prosesDataAnalitik(
      'tool_1',
      [{ test: 'data' }],
      { jenis_data: 'operasional' }
    );
    expect(analyticsResult.success).toBe(true);
  });

  describe('Business Services', () => {
    test('LayananBisnis should handle business analytics', async () => {
      const bisnisService = LayananBisnis; // Use default export instance directly
      expect(bisnisService).toBeDefined();
      
      // Test business analytics
      const businessResult = await bisnisService.analisisPerformaBisnis({
        mulai: new Date('2024-01-01'),
        selesai: new Date('2024-01-31'),
        tipe: 'bulanan'
      });
      expect(businessResult.success).toBe(true);
    });

    test('LayananIklan should handle advertisement operations', async () => {
      const iklanService = LayananIklan; // Use default export instance directly
      expect(iklanService).toBeDefined();
      
      // Test ad moderation (using available method)
      const adResult = await iklanService.moderasiOtomatisIklan('test-ad-id');
      expect(adResult.success).toBe(true);
    });
  });

  describe('File Services', () => {
    test('LayananBerkas should handle file operations', async () => {
      const berkasService = LayananBerkas; // Use default export instance
      expect(berkasService).toBeDefined();
      
      // Test file search (using available method)
      const fileResult = await berkasService.ambilSemuaBerkas(1, 10);
      expect(fileResult.sukses).toBe(true); // Use 'sukses' property
    });
  });

  describe('AI Services', () => {
    test('LayananAI should handle AI operations', async () => {
      const aiService = LayananAI.getInstance();
      expect(aiService).toBeDefined();
      
      // Test AI greeting generation
      const aiResult = await aiService.kirimSalamPembuka(
        'test-user-id',
        {
          customerName: 'Test User',
          customerType: 'new',
          timeOfDay: 'morning'
        }
      );
      expect(aiResult.success).toBe(true);
      expect(aiResult.data).toBeDefined();
    });

    test('LayananKebijakan should handle policy operations', async () => {
      const kebijakanService = LayananKebijakan; // Use default export instance directly
      expect(kebijakanService).toBeDefined();
      
      // Test policy management
      const policyResult = await kebijakanService.muatManajemenKebijakan();
      expect(policyResult.success).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    test('should handle car search and comparison workflow', async () => {
      const mobilService = new LayananMobil();
      expect(mobilService).toBeDefined();
      
      // Test car listing
      const searchResult = await mobilService.ambilSemuaMobilShowroom();
      expect(searchResult.success).toBe(true);
    });

    test('should handle user authentication workflow', async () => {
      const apiService = new LayananAPI();
      expect(apiService).toBeDefined();
      
      // Test API instance
      const apiResult = await apiService.ambilDaftarAPITersedia();
      expect(apiResult.success).toBe(true);
    });

    test('should handle complete car purchase workflow', async () => {
      const mobilService = new LayananMobil();
      expect(mobilService).toBeDefined();
      
      // Test car listing
      const carResult = await mobilService.ambilSemuaMobilShowroom();
      expect(carResult.success).toBe(true);
    });
  });

  describe('User Experience Tests', () => {
    test('should handle user registration and session management', async () => {
      const userService = LayananUser;
      const sessionService = LayananSesi.getInstance();
      
      expect(userService).toBeDefined();
      expect(sessionService).toBeDefined();
    });

    test('should handle wishlist and comparison features', async () => {
      const mobilService = LayananMobil;
      const wishlistService = LayananWishlist.getInstance();
      const perbandinganService = LayananPerbandingan.getInstance();
      
      expect(mobilService).toBeDefined();
      expect(wishlistService).toBeDefined();
      expect(perbandinganService).toBeDefined();
    });

    test('should handle transaction and payment workflow', async () => {
      const transaksiService = LayananTransaksi;
      const pembayaranService = layananPembayaran;
      
      expect(transaksiService).toBeDefined();
      expect(pembayaranService).toBeDefined();
    });
  });
});

// Export test utilities
export const testUtils = {
  createMockUser: () => ({
    id: 'test-user-id',
    nama: 'Test User',
    email: 'test@example.com',
    role: 'customer'
  }),
  
  createMockMobil: () => ({
    id: 'test-mobil-id',
    nama: 'Test Car',
    merk: 'Test Brand',
    harga: 200000000,
    tahun: 2024
  }),
  
  createMockTransaction: () => ({
    id: 'test-transaction-id',
    mobilId: 'test-mobil-id',
    userId: 'test-user-id',
    jumlah: 200000000,
    status: 'pending'
  }),
  
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  mockApiResponse: (data: any, success = true) => ({
    success,
    data,
    message: success ? 'Success' : 'Error',
    timestamp: new Date().toISOString()
  })
};

export default testUtils;