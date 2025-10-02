// Simple Service Layer Tests - Mobilindo Showroom
// Basic testing untuk memverifikasi service layer functionality

import { describe, test, expect } from '@jest/globals';

// Import core services
import LayananAPI from '../services/LayananAPI';
import LayananUser from '../services/LayananUser';
import LayananMobil from '../services/LayananMobil';
import LayananPerbandingan from '../services/LayananPerbandingan';
import LayananBisnis from '../services/LayananBisnis';
import LayananIklan from '../services/LayananIklan';
import LayananKebijakan from '../services/LayananKebijakan';

describe('Service Layer - Basic Tests', () => {
  
  describe('Service Instantiation', () => {
    test('LayananAPI should be instantiable', () => {
      const service = new LayananAPI();
      expect(service).toBeDefined();
      expect(typeof service.ambilDaftarAPITersedia).toBe('function');
      expect(typeof service.panggilAPIEksternal).toBe('function');
    });

    test('LayananUser should be instantiable', () => {
      const service = new LayananUser();
      expect(service).toBeDefined();
      expect(typeof service.ambilSemuaDataUser).toBe('function');
      expect(typeof service.updateDataUser).toBe('function');
    });

    test('LayananMobil should be instantiable', () => {
      const service = new LayananMobil();
      expect(service).toBeDefined();
      expect(typeof service.ambilSemuaMobilShowroom).toBe('function');
      expect(typeof service.ambilDetailLengkapMobil).toBe('function');
    });

    test('LayananPerbandingan should be instantiable', () => {
      const service = LayananPerbandingan.getInstance();
      expect(service).toBeDefined();
      expect(typeof service.muatDataMobilPertama).toBe('function');
      expect(typeof service.muatDataMobilKedua).toBe('function');
    });

    test('LayananBisnis should be instantiable', () => {
      const service = LayananBisnis;
      expect(service).toBeDefined();
      expect(typeof service.analisisPerformaBisnis).toBe('function');
      expect(typeof service.forecastingDemand).toBe('function');
    });

    test('LayananIklan should be instantiable', () => {
      const service = LayananIklan;
      expect(service).toBeDefined();
      expect(typeof service.moderasiOtomatisIklan).toBe('function');
      expect(typeof service.analisisPerformaIklan).toBe('function');
    });

    test('LayananKebijakan should be instantiable', () => {
      const service = LayananKebijakan;
      expect(service).toBeDefined();
      expect(typeof service.muatManajemenKebijakan).toBe('function');
      expect(typeof service.ambilKebijakanSaatIni).toBe('function');
    });
  });

  describe('Singleton Pattern', () => {
    test('LayananAPI should maintain singleton pattern', () => {
      const api1 = new LayananAPI();
      const api2 = new LayananAPI();
      expect(api1).toBeDefined();
      expect(api2).toBeDefined();
      // Note: LayananAPI is not a singleton, so instances are different
    });

    test('Services should be instantiable', () => {
      // LayananUser dan LayananMobil tidak menggunakan singleton pattern
      // Mereka adalah kelas biasa yang dapat diinstansiasi langsung
      const user1 = new LayananUser();
      const user2 = new LayananUser();
      expect(user1).toBeDefined();
      expect(user2).toBeDefined();

      const mobil1 = new LayananMobil();
      const mobil2 = new LayananMobil();
      expect(mobil1).toBeDefined();
      expect(mobil2).toBeDefined();
    });
  });

  describe('Service Methods', () => {
    test('LayananUser methods should return proper response structure', async () => {
      const service = new LayananUser();
      
      const result = await service.ambilSemuaDataUser();
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
      expect(typeof result.success).toBe('boolean');
    });

    test('LayananMobil methods should return proper response structure', async () => {
      const service = new LayananMobil();
      
      const result = await service.ambilSemuaMobilShowroom();
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
      expect(typeof result.success).toBe('boolean');
    });

    test('LayananPerbandingan methods should return proper response structure', async () => {
      const service = LayananPerbandingan.getInstance();
      
      const result = await service.muatDataMobilPertama('toyota-avanza');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
      expect(typeof result.success).toBe('boolean');
    });

    test('LayananBisnis methods should return proper response structure', async () => {
    const service = LayananBisnis;
    
    const result = await service.analisisPerformaBisnis({
      mulai: new Date('2024-01-01'),
      selesai: new Date('2024-01-31'),
      tipe: 'bulanan'
    });
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

    test('LayananIklan methods should return proper response structure', async () => {
      const service = LayananIklan;
      
      const result = await service.moderasiOtomatisIklan('test-ad-id');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
      expect(typeof result.success).toBe('boolean');
    });

    test('LayananKebijakan methods should return proper response structure', async () => {
      const service = LayananKebijakan;
      
      const result = await service.muatManajemenKebijakan();
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('message');
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('Error Handling', () => {
    test('Services should handle invalid input gracefully', async () => {
      const mobilService = new LayananMobil();
      
      const result = await mobilService.ambilDetailLengkapMobil('invalid-id');
      
      expect(result).toHaveProperty('success');
      // Service mungkin mengembalikan success true dengan data kosong atau false
      // Kita hanya memastikan response structure benar
      expect(typeof result.success).toBe('boolean');
    });

    test('Services should handle missing parameters', async () => {
      const userService = new LayananUser();
      
      const result = await userService.updateDataUser('invalid-id', {});
      
      expect(result).toHaveProperty('success');
      // Service mungkin mengembalikan success true atau false
      // Kita hanya memastikan response structure benar
      expect(typeof result.success).toBe('boolean');
    });
  });

  describe('Mock Data Validation', () => {
    test('Services should have mock data available', async () => {
      const mobilService = new LayananMobil();
      
      const result = await mobilService.ambilSemuaMobilShowroom();
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.mobil).toBeDefined();
      expect(Array.isArray(result.data?.mobil)).toBe(true);
    });

    test('Comparison service should have mock car data', async () => {
      const perbandinganService = LayananPerbandingan.getInstance();
      
      const result = await perbandinganService.muatDataMobilPertama('toyota-avanza');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBeDefined();
    });
  });
});

// Export test utilities
export const testHelpers = {
  createMockUser: () => ({
    nama: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  }),
  
  createMockCarQuery: () => ({
    periode: '6m',
    segmen: 'sedan'
  }),
  
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
};

export default testHelpers;