// Basic Service Tests - Mobilindo Showroom
// Simple JavaScript tests untuk service layer

describe('Service Layer - Basic Functionality', () => {
  
  describe('Service Files Existence', () => {
    test('should have all required service files', () => {
      const fs = require('fs');
      const path = require('path');
      
      const servicesDir = path.join(__dirname, '../services');
      const expectedServices = [
        'LayananAPI.ts',
        'LayananUser.ts',
        'LayananMobil.ts',
        'LayananPerbandingan.ts',
        'LayananBisnis.ts',
        'LayananIklan.ts',
        'LayananKebijakan.ts',
        'index.ts',
        'types.ts'
      ];
      
      expectedServices.forEach(service => {
        const servicePath = path.join(servicesDir, service);
        expect(fs.existsSync(servicePath)).toBe(true);
      });
    });
  });

  describe('Service Structure Validation', () => {
    test('should have proper service structure', () => {
      const fs = require('fs');
      const path = require('path');
      
      const servicePath = path.join(__dirname, '../services/LayananAPI.ts');
      const content = fs.readFileSync(servicePath, 'utf8');
      
      // Check for class definition
      expect(content).toContain('class LayananAPI');
      expect(content).toContain('getInstance()');
      expect(content).toContain('private static instance');
    });

    test('should have singleton pattern implementation', () => {
      const fs = require('fs');
      const path = require('path');
      
      const servicePath = path.join(__dirname, '../services/LayananUser.ts');
      const content = fs.readFileSync(servicePath, 'utf8');
      
      // Check for singleton pattern
      expect(content).toContain('private static instance');
      expect(content).toContain('getInstance()');
      expect(content).toContain('private constructor');
    });
  });

  describe('Service Methods Validation', () => {
    test('LayananUser should have required methods', () => {
      const fs = require('fs');
      const path = require('path');
      
      const servicePath = path.join(__dirname, '../services/LayananUser.ts');
      const content = fs.readFileSync(servicePath, 'utf8');
      
      const requiredMethods = [
        'daftarUser',
        'loginUser',
        'logoutUser',
        'ambilProfilUser',
        'updateProfilUser'
      ];
      
      requiredMethods.forEach(method => {
        expect(content).toContain(method);
      });
    });

    test('LayananMobil should have required methods', () => {
      const fs = require('fs');
      const path = require('path');
      
      const servicePath = path.join(__dirname, '../services/LayananMobil.ts');
      const content = fs.readFileSync(servicePath, 'utf8');
      
      const requiredMethods = [
        'ambilSemuaMobil',
        'ambilDetailMobil',
        'cariMobil',
        'filterMobil',
        'ambilKategoriMobil'
      ];
      
      requiredMethods.forEach(method => {
        expect(content).toContain(method);
      });
    });

    test('LayananPerbandingan should have required methods', () => {
      const fs = require('fs');
      const path = require('path');
      
      const servicePath = path.join(__dirname, '../services/LayananPerbandingan.ts');
      const content = fs.readFileSync(servicePath, 'utf8');
      
      const requiredMethods = [
        'muatDataMobilPertama',
        'muatDataMobilKedua',
        'buatLinkSharing',
        'hapusMobilDariTabel',
        'hapusSemuaDataPerbandingan'
      ];
      
      requiredMethods.forEach(method => {
        expect(content).toContain(method);
      });
    });

    test('LayananBisnis should have required methods', () => {
      const fs = require('fs');
      const path = require('path');
      
      const servicePath = path.join(__dirname, '../services/LayananBisnis.ts');
      const content = fs.readFileSync(servicePath, 'utf8');
      
      const requiredMethods = [
        'analisisTrenPasar',
        'proyeksiPenjualan',
        'analisisKompetitor',
        'laporanPerformaBisnis',
        'rekomendasiStrategiBisnis',
        'analisisROI',
        'forecastingDemand',
        'optimasiInventori'
      ];
      
      requiredMethods.forEach(method => {
        expect(content).toContain(method);
      });
    });

    test('LayananIklan should have required methods', () => {
      const fs = require('fs');
      const path = require('path');
      
      const servicePath = path.join(__dirname, '../services/LayananIklan.ts');
      const content = fs.readFileSync(servicePath, 'utf8');
      
      const requiredMethods = [
        'moderasiOtomatisIklan',
        'validasiKontenIklan',
        'persetujuanManualIklan',
        'penolakanIklan',
        'flaggingIklanMencurigakan',
        'analisisPerformaIklan',
        'laporanStatistikIklan',
        'optimasiPenempatanIklan',
        'monitoringRealtimeIklan'
      ];
      
      requiredMethods.forEach(method => {
        expect(content).toContain(method);
      });
    });

    test('LayananKebijakan should have required methods', () => {
      const fs = require('fs');
      const path = require('path');
      
      const servicePath = path.join(__dirname, '../services/LayananKebijakan.ts');
      const content = fs.readFileSync(servicePath, 'utf8');
      
      const requiredMethods = [
        'muatManajemenKebijakan',
        'ambilKebijakanSaatIni'
      ];
      
      requiredMethods.forEach(method => {
        expect(content).toContain(method);
      });
    });
  });

  describe('Service Integration', () => {
    test('should have index file with proper exports', () => {
      const fs = require('fs');
      const path = require('path');
      
      const indexPath = path.join(__dirname, '../services/index.ts');
      const content = fs.readFileSync(indexPath, 'utf8');
      
      // Check for exports
      expect(content).toContain('export { default as LayananAPI }');
      expect(content).toContain('export { default as LayananUser }');
      expect(content).toContain('export { default as LayananMobil }');
      expect(content).toContain('export { default as LayananPerbandingan }');
      expect(content).toContain('export { default as LayananBisnis }');
      expect(content).toContain('export { default as LayananIklan }');
      expect(content).toContain('export { default as LayananKebijakan }');
    });

    test('should have types file with proper type definitions', () => {
      const fs = require('fs');
      const path = require('path');
      
      const typesPath = path.join(__dirname, '../services/types.ts');
      const content = fs.readFileSync(typesPath, 'utf8');
      
      // Check for type definitions
      expect(content).toContain('BaseServiceResponse');
      expect(content).toContain('UserServiceResponse');
      expect(content).toContain('MobilServiceResponse');
      expect(content).toContain('PerbandinganServiceResponse');
      expect(content).toContain('BisnisServiceResponse');
      expect(content).toContain('IklanServiceResponse');
      expect(content).toContain('KebijakanServiceResponse');
    });
  });

  describe('File Count Validation', () => {
    test('should have all 29 service files', () => {
      const fs = require('fs');
      const path = require('path');
      
      const servicesDir = path.join(__dirname, '../services');
      const files = fs.readdirSync(servicesDir);
      const tsFiles = files.filter(file => file.endsWith('.ts'));
      
      // Should have 29 service files + index.ts + types.ts = 31 total
      expect(tsFiles.length).toBeGreaterThanOrEqual(31);
    });

    test('should have proper service naming convention', () => {
      const fs = require('fs');
      const path = require('path');
      
      const servicesDir = path.join(__dirname, '../services');
      const files = fs.readdirSync(servicesDir);
      const serviceFiles = files.filter(file => 
        file.startsWith('Layanan') && file.endsWith('.ts')
      );
      
      // Should have 29 Layanan*.ts files
      expect(serviceFiles.length).toBe(29);
    });
  });
});

// Export for potential use
module.exports = {
  testServiceExists: (serviceName) => {
    const fs = require('fs');
    const path = require('path');
    const servicePath = path.join(__dirname, `../services/${serviceName}.ts`);
    return fs.existsSync(servicePath);
  },
  
  testServiceHasMethod: (serviceName, methodName) => {
    const fs = require('fs');
    const path = require('path');
    const servicePath = path.join(__dirname, `../services/${serviceName}.ts`);
    const content = fs.readFileSync(servicePath, 'utf8');
    return content.includes(methodName);
  }
};