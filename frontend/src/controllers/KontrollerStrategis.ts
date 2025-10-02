import axios, { AxiosResponse } from 'axios';
import KontrollerAuth from './KontrollerAuth';

// ==================== INTERFACES ====================

export interface DashboardStrategis {
  id: string;
  periode: {
    mulai: Date;
    selesai: Date;
    label: string;
  };
  ringkasanEksekutif: RingkasanEksekutif;
  kpiUtama: KPIUtama[];
  inisiatifStrategis: InisiatifStrategis[];
  analisisRisiko: AnalisisRisiko;
  proyeksiStrategis: ProyeksiStrategis;
  roadmapStrategis: RoadmapStrategis;
  stakeholderMetrics: StakeholderMetrics;
  competitiveIntelligence: CompetitiveIntelligence;
  lastUpdated: Date;
}

export interface RingkasanEksekutif {
  visiMisi: {
    visi: string;
    misi: string[];
    nilaiInti: string[];
  };
  pencapaianUtama: PencapaianUtama[];
  tantanganUtama: TantanganUtama[];
  fokusStrategis: FokusStrategis[];
  keputusanPenting: KeputusanPenting[];
  outlook: {
    jangkaPendek: string;
    jangkaMenengah: string;
    jangkaPanjang: string;
  };
}

export interface KPIUtama {
  id: string;
  nama: string;
  kategori: 'financial' | 'customer' | 'operational' | 'learning';
  nilaiSaatIni: number;
  target: number;
  pencapaian: number; // persentase
  trend: 'up' | 'down' | 'stable';
  periode: string;
  unit: string;
  deskripsi: string;
  pemilik: string;
  status: 'on_track' | 'at_risk' | 'behind';
  riwayat: HistoricalData[];
  benchmark: {
    internal: number;
    industri: number;
    bestPractice: number;
  };
}

export interface InisiatifStrategis {
  id: string;
  nama: string;
  deskripsi: string;
  tujuan: string[];
  kategori: 'growth' | 'efficiency' | 'innovation' | 'transformation';
  prioritas: 'high' | 'medium' | 'low';
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  progress: number; // persentase
  timeline: {
    mulai: Date;
    selesai: Date;
    milestone: Milestone[];
  };
  budget: {
    dialokasikan: number;
    terpakai: number;
    proyeksi: number;
  };
  tim: {
    sponsor: string;
    leader: string;
    anggota: string[];
  };
  risiko: RisikoInisiatif[];
  dampak: DampakInisiatif;
  metrik: MetrikInisiatif[];
}

export interface DataStrategis {
  marketIntelligence: MarketIntelligence;
  competitorAnalysis: CompetitorAnalysisDetail;
  customerInsights: CustomerInsightsStrategis;
  operationalExcellence: OperationalExcellence;
  financialPerformance: FinancialPerformanceStrategis;
  innovationMetrics: InnovationMetrics;
  sustainabilityMetrics: SustainabilityMetrics;
  digitalTransformation: DigitalTransformation;
}

export interface ManajemenKualitas {
  id: string;
  sistemKualitas: SistemKualitas;
  standarKualitas: StandarKualitas[];
  prosesKualitas: ProsesKualitas[];
  metrikKualitas: MetrikKualitas[];
  auditKualitas: AuditKualitas[];
  perbaikanBerkesinambungan: PerbaikanBerkesinambungan;
  sertifikasi: Sertifikasi[];
  pelatihanKualitas: PelatihanKualitas[];
  customerFeedback: CustomerFeedbackKualitas;
  supplierQuality: SupplierQuality[];
}

export interface StandarKualitas {
  id: string;
  nama: string;
  kategori: 'product' | 'service' | 'process' | 'system';
  deskripsi: string;
  kriteria: KriteriaKualitas[];
  target: number;
  nilaiSaatIni: number;
  unit: string;
  metodePengukuran: string;
  frekuensiEvaluasi: string;
  penanggungJawab: string;
  status: 'achieved' | 'in_progress' | 'not_met';
  riwayatPencapaian: HistoricalData[];
  tindakanPerbaikan: TindakanPerbaikan[];
  dokumentasi: Dokumentasi[];
}

export interface AreaLain {
  id: string;
  nama: string;
  kategori: 'geographic' | 'demographic' | 'psychographic' | 'behavioral';
  deskripsi: string;
  potensiPasar: {
    ukuran: number;
    pertumbuhan: number;
    daya_beli: number;
    kompetisi: number;
  };
  analisisKelayakan: AnalisisKelayakan;
  strategiMasuk: StrategiMasuk;
  investasiDiperlukan: InvestasiDiperlukan;
  proyeksiROI: ProyeksiROI;
  risikoArea: RisikoArea[];
  timeline: TimelineEkspansi;
  status: 'under_review' | 'approved' | 'rejected' | 'in_development';
  rekomendasi: string[];
}

// Supporting Interfaces
export interface PencapaianUtama {
  judul: string;
  deskripsi: string;
  dampak: string;
  tanggal: Date;
  kategori: string;
}

export interface TantanganUtama {
  judul: string;
  deskripsi: string;
  dampak: 'high' | 'medium' | 'low';
  status: 'active' | 'resolved' | 'monitoring';
  tindakan: string[];
}

export interface FokusStrategis {
  area: string;
  prioritas: number;
  tujuan: string;
  inisiatif: string[];
  target: string;
}

export interface KeputusanPenting {
  judul: string;
  deskripsi: string;
  tanggal: Date;
  dampak: string;
  status: 'implemented' | 'in_progress' | 'pending';
}

export interface HistoricalData {
  periode: Date;
  nilai: number;
  target?: number;
  catatan?: string;
}

export interface Milestone {
  id: string;
  nama: string;
  tanggal: Date;
  status: 'completed' | 'in_progress' | 'pending' | 'delayed';
  deskripsi: string;
  deliverables: string[];
}

export interface RisikoInisiatif {
  id: string;
  deskripsi: string;
  probabilitas: number;
  dampak: number;
  skor: number;
  mitigasi: string;
  status: 'active' | 'mitigated' | 'closed';
}

export interface DampakInisiatif {
  finansial: number;
  operasional: string[];
  strategis: string[];
  customer: string[];
}

export interface MetrikInisiatif {
  nama: string;
  nilaiSaatIni: number;
  target: number;
  unit: string;
  status: 'on_track' | 'at_risk' | 'behind';
}

export interface MarketIntelligence {
  ukuranPasar: {
    total: number;
    pertumbuhan: number;
    segmen: SegmenPasar[];
  };
  trendIndustri: TrendIndustri[];
  regulasiTerbaru: Regulasi[];
  peluangPasar: PeluangPasar[];
}

export interface CompetitorAnalysisDetail {
  pesaingUtama: PesaingUtama[];
  posisiKompetitif: PosisiKompetitif;
  analisisGap: AnalisisGap[];
  strategiKompetitif: StrategiKompetitif[];
}

export interface CustomerInsightsStrategis {
  segmentasiLanjutan: SegmentasiLanjutan[];
  customerJourney: CustomerJourney;
  loyaltyMetrics: LoyaltyMetrics;
  voiceOfCustomer: VoiceOfCustomer;
}

export interface OperationalExcellence {
  efisiensiOperasional: EfisiensiOperasional;
  kualitasLayanan: KualitasLayanan;
  inovasiProses: InovasiProses[];
  automationLevel: AutomationLevel;
}

export interface FinancialPerformanceStrategis {
  profitabilitas: Profitabilitas;
  likuiditas: Likuiditas;
  solvabilitas: Solvabilitas;
  efisiensiModal: EfisiensiModal;
  valuationMetrics: ValuationMetrics;
}

export interface InnovationMetrics {
  investasiRnD: number;
  produkBaru: ProdukBaru[];
  patenDanIP: PatenDanIP[];
  kemitraanInovasi: KemitraanInovasi[];
}

export interface SustainabilityMetrics {
  lingkungan: MetrikLingkungan;
  sosial: MetrikSosial;
  governance: MetrikGovernance;
  esgScore: number;
}

export interface DigitalTransformation {
  digitalMaturity: DigitalMaturity;
  teknologiAdopsi: TeknologiAdopsi[];
  digitalCapabilities: DigitalCapabilities[];
  cybersecurity: CybersecurityMetrics;
}

export interface SistemKualitas {
  standarISO: string[];
  sertifikasiAktif: string[];
  prosedurDokumen: number;
  auditTerjadwal: number;
  tingkatKepatuhan: number;
}

export interface ProsesKualitas {
  id: string;
  nama: string;
  deskripsi: string;
  tahapan: TahapanProses[];
  kontrolKualitas: KontrolKualitas[];
  metrikProses: MetrikProses[];
}

export interface MetrikKualitas {
  nama: string;
  nilai: number;
  target: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  kategori: 'defect_rate' | 'customer_satisfaction' | 'process_efficiency' | 'compliance';
}

export interface AuditKualitas {
  id: string;
  jenis: 'internal' | 'external' | 'supplier';
  tanggal: Date;
  auditor: string;
  area: string[];
  temuan: TemuanAudit[];
  rekomendasi: string[];
  status: 'completed' | 'in_progress' | 'planned';
}

export interface PerbaikanBerkesinambungan {
  inisiatifAktif: InisiatifPerbaikan[];
  ideaPerbaikan: IdeaPerbaikan[];
  implementasiSelesai: ImplementasiSelesai[];
  dampakPerbaikan: DampakPerbaikan;
}

export interface Sertifikasi {
  nama: string;
  penerbit: string;
  tanggalTerbit: Date;
  tanggalKadaluarsa: Date;
  status: 'active' | 'expired' | 'renewal_needed';
  cakupan: string[];
}

export interface PelatihanKualitas {
  program: string;
  peserta: number;
  durasi: number;
  efektivitas: number;
  sertifikasiDiperoleh: number;
}

export interface CustomerFeedbackKualitas {
  ratingKualitas: number;
  keluhan: KeluhanKualitas[];
  pujian: PujianKualitas[];
  saran: SaranKualitas[];
}

export interface SupplierQuality {
  supplierId: string;
  nama: string;
  qualityRating: number;
  defectRate: number;
  onTimeDelivery: number;
  certifications: string[];
  auditScore: number;
}

export interface KriteriaKualitas {
  nama: string;
  bobot: number;
  target: number;
  nilaiSaatIni: number;
  status: 'met' | 'not_met' | 'exceeded';
}

export interface TindakanPerbaikan {
  id: string;
  deskripsi: string;
  penanggungJawab: string;
  targetSelesai: Date;
  status: 'planned' | 'in_progress' | 'completed' | 'overdue';
  dampakDiharapkan: string;
}

export interface Dokumentasi {
  jenis: string;
  nama: string;
  versi: string;
  tanggalUpdate: Date;
  url: string;
}

export interface AnalisisKelayakan {
  teknis: number;
  ekonomis: number;
  hukum: number;
  operasional: number;
  jadwal: number;
  keseluruhan: number;
}

export interface StrategiMasuk {
  pendekatan: 'organic' | 'acquisition' | 'partnership' | 'franchise';
  tahapan: TahapanMasuk[];
  sumberDaya: SumberDayaDiperlukan[];
  timeline: string;
}

export interface InvestasiDiperlukan {
  modal: number;
  operasional: number;
  marketing: number;
  teknologi: number;
  sdm: number;
  total: number;
}

export interface ProyeksiROI {
  tahun1: number;
  tahun2: number;
  tahun3: number;
  tahun5: number;
  breakEvenPoint: number; // dalam bulan
  npv: number;
  irr: number;
}

export interface RisikoArea {
  kategori: string;
  deskripsi: string;
  probabilitas: number;
  dampak: number;
  mitigasi: string;
  status: 'active' | 'mitigated';
}

export interface TimelineEkspansi {
  fase1: FaseEkspansi;
  fase2: FaseEkspansi;
  fase3: FaseEkspansi;
}

export interface FaseEkspansi {
  nama: string;
  durasi: string;
  aktivitas: string[];
  target: string[];
  investasi: number;
}

// ==================== MAIN CONTROLLER ====================

export class KontrollerStrategis {
  private baseURL: string;
  private authController: KontrollerAuth;
  private cache: Map<string, any>;
  private cacheTimeout: number = 30 * 60 * 1000; // 30 menit

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
    this.authController = KontrollerAuth.getInstance();
    this.cache = new Map();
  }

  // ==================== MAIN METHODS ====================

  /**
   * Memuat dashboard strategis lengkap
   */
  async muatDashboardStrategis(periode?: { mulai: Date; selesai: Date }): Promise<DashboardStrategis> {
    try {
      const cacheKey = `strategic_dashboard_${periode ? JSON.stringify(periode) : 'default'}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) return cachedData;

      const token = this.authController.getAccessToken();
      const response: AxiosResponse<DashboardStrategis> = await axios.post(
        `${this.baseURL}/strategic/dashboard`,
        periode || this.getDefaultPeriod(),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const dashboardData = response.data;
      this.setCache(cacheKey, dashboardData);
      return dashboardData;

    } catch (error) {
      console.error('Error loading strategic dashboard:', error);
      return this.getMockDashboardStrategis();
    }
  }

  /**
   * Mengambil data strategis berdasarkan kategori
   */
  async ambilDataStrategis(kategori?: string[]): Promise<DataStrategis> {
    try {
      const cacheKey = `strategic_data_${kategori ? kategori.join('_') : 'all'}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) return cachedData;

      const token = this.authController.getAccessToken();
      const response: AxiosResponse<DataStrategis> = await axios.get(
        `${this.baseURL}/strategic/data${kategori ? `?categories=${kategori.join(',')}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const strategicData = response.data;
      this.setCache(cacheKey, strategicData);
      return strategicData;

    } catch (error) {
      console.error('Error fetching strategic data:', error);
      return this.getMockDataStrategis();
    }
  }

  /**
   * Memuat data manajemen kualitas
   */
  async muatManajemenKualitas(): Promise<ManajemenKualitas> {
    try {
      const cacheKey = 'quality_management';
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) return cachedData;

      const token = this.authController.getAccessToken();
      const response: AxiosResponse<ManajemenKualitas> = await axios.get(
        `${this.baseURL}/strategic/quality-management`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const qualityData = response.data;
      this.setCache(cacheKey, qualityData);
      return qualityData;

    } catch (error) {
      console.error('Error loading quality management:', error);
      return this.getMockManajemenKualitas();
    }
  }

  /**
   * Mengambil standar kualitas berdasarkan kategori
   */
  async ambilStandarKualitas(kategori?: string): Promise<StandarKualitas[]> {
    try {
      const cacheKey = `quality_standards_${kategori || 'all'}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) return cachedData;

      const token = this.authController.getAccessToken();
      const response: AxiosResponse<StandarKualitas[]> = await axios.get(
        `${this.baseURL}/strategic/quality-standards${kategori ? `?category=${kategori}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const standards = response.data;
      this.setCache(cacheKey, standards);
      return standards;

    } catch (error) {
      console.error('Error fetching quality standards:', error);
      return this.getMockStandarKualitas();
    }
  }

  /**
   * Mengecek dan mengevaluasi pilihan area lain untuk ekspansi
   */
  async cekPilihAreaLain(kriteria?: any): Promise<AreaLain[]> {
    try {
      const cacheKey = `area_expansion_${kriteria ? JSON.stringify(kriteria) : 'default'}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) return cachedData;

      const token = this.authController.getAccessToken();
      const response: AxiosResponse<AreaLain[]> = await axios.post(
        `${this.baseURL}/strategic/area-expansion`,
        kriteria || {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const areas = response.data;
      this.setCache(cacheKey, areas);
      return areas;

    } catch (error) {
      console.error('Error checking area expansion:', error);
      return this.getMockAreaLain();
    }
  }

  // ==================== ADDITIONAL METHODS ====================

  /**
   * Memperbarui KPI strategis
   */
  async updateKPIStrategis(kpiId: string, nilai: number): Promise<boolean> {
    try {
      const token = this.authController.getAccessToken();
      await axios.put(
        `${this.baseURL}/strategic/kpi/${kpiId}`,
        { nilai },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      this.clearCacheByPattern('strategic_dashboard');
      return true;

    } catch (error) {
      console.error('Error updating strategic KPI:', error);
      return false;
    }
  }

  /**
   * Menambah inisiatif strategis baru
   */
  async tambahInisiatifStrategis(inisiatif: Partial<InisiatifStrategis>): Promise<string> {
    try {
      const token = this.authController.getAccessToken();
      const response: AxiosResponse<{ id: string }> = await axios.post(
        `${this.baseURL}/strategic/initiatives`,
        inisiatif,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      this.clearCacheByPattern('strategic_dashboard');
      return response.data.id;

    } catch (error) {
      console.error('Error adding strategic initiative:', error);
      return '';
    }
  }

  /**
   * Memperbarui progress inisiatif
   */
  async updateProgressInisiatif(inisiatifId: string, progress: number): Promise<boolean> {
    try {
      const token = this.authController.getAccessToken();
      await axios.put(
        `${this.baseURL}/strategic/initiatives/${inisiatifId}/progress`,
        { progress },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      this.clearCacheByPattern('strategic_dashboard');
      return true;

    } catch (error) {
      console.error('Error updating initiative progress:', error);
      return false;
    }
  }

  /**
   * Menambah standar kualitas baru
   */
  async tambahStandarKualitas(standar: Partial<StandarKualitas>): Promise<string> {
    try {
      const token = this.authController.getAccessToken();
      const response: AxiosResponse<{ id: string }> = await axios.post(
        `${this.baseURL}/strategic/quality-standards`,
        standar,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      this.clearCacheByPattern('quality_standards');
      return response.data.id;

    } catch (error) {
      console.error('Error adding quality standard:', error);
      return '';
    }
  }

  /**
   * Melakukan audit kualitas
   */
  async lakukanAuditKualitas(auditData: Partial<AuditKualitas>): Promise<string> {
    try {
      const token = this.authController.getAccessToken();
      const response: AxiosResponse<{ id: string }> = await axios.post(
        `${this.baseURL}/strategic/quality-audit`,
        auditData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      this.clearCacheByPattern('quality_management');
      return response.data.id;

    } catch (error) {
      console.error('Error conducting quality audit:', error);
      return '';
    }
  }

  /**
   * Mengevaluasi kelayakan area ekspansi
   */
  async evaluasiKelayakanArea(areaId: string): Promise<AnalisisKelayakan> {
    try {
      const token = this.authController.getAccessToken();
      const response: AxiosResponse<AnalisisKelayakan> = await axios.get(
        `${this.baseURL}/strategic/area-expansion/${areaId}/feasibility`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return response.data;

    } catch (error) {
      console.error('Error evaluating area feasibility:', error);
      return this.getMockAnalisisKelayakan();
    }
  }

  /**
   * Mengekspor laporan strategis
   */
  async eksporLaporanStrategis(format: 'pdf' | 'excel' | 'pptx'): Promise<string> {
    try {
      const token = this.authController.getAccessToken();
      const response: AxiosResponse<{ downloadUrl: string }> = await axios.post(
        `${this.baseURL}/strategic/export`,
        { format },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.downloadUrl;

    } catch (error) {
      console.error('Error exporting strategic report:', error);
      return '';
    }
  }

  // ==================== UTILITY METHODS ====================

  private getDefaultPeriod(): { mulai: Date; selesai: Date } {
    const selesai = new Date();
    const mulai = new Date();
    mulai.setFullYear(mulai.getFullYear() - 1);

    return { mulai, selesai };
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  private formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  }

  private calculateScore(nilai: number, target: number): number {
    return Math.min((nilai / target) * 100, 100);
  }

  private getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'on_track': '#10B981',
      'at_risk': '#F59E0B',
      'behind': '#EF4444',
      'completed': '#10B981',
      'in_progress': '#3B82F6',
      'pending': '#6B7280',
      'achieved': '#10B981',
      'not_met': '#EF4444',
      'exceeded': '#059669'
    };
    return colors[status] || '#6B7280';
  }

  private getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'high': '#EF4444',
      'medium': '#F59E0B',
      'low': '#10B981'
    };
    return colors[priority] || '#6B7280';
  }

  // ==================== CACHE METHODS ====================

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any, timeout?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      timeout: timeout || this.cacheTimeout
    });
  }

  private clearCacheByPattern(pattern: string): void {
    const cacheKeys = Array.from(this.cache.keys()); for (const key of cacheKeys) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  private clearCache(): void {
    this.cache.clear();
  }

  // ==================== MOCK DATA METHODS ====================

  private getMockDashboardStrategis(): DashboardStrategis {
    const mulai = new Date();
    mulai.setFullYear(mulai.getFullYear() - 1);
    const selesai = new Date();

    return {
      id: 'strategic_dashboard_1',
      periode: {
        mulai,
        selesai,
        label: 'FY 2024'
      },
      ringkasanEksekutif: {
        visiMisi: {
          visi: 'Menjadi platform jual beli mobil terdepan di Indonesia',
          misi: [
            'Memberikan pengalaman terbaik dalam jual beli mobil',
            'Menyediakan layanan yang transparan dan terpercaya',
            'Mengembangkan teknologi inovatif untuk industri otomotif'
          ],
          nilaiInti: ['Integritas', 'Inovasi', 'Kepuasan Pelanggan', 'Kualitas']
        },
        pencapaianUtama: [
          {
            judul: 'Pertumbuhan Revenue 45%',
            deskripsi: 'Mencapai revenue 2.5M dengan pertumbuhan 45% YoY',
            dampak: 'Memperkuat posisi pasar dan kemampuan investasi',
            tanggal: new Date(2024, 11, 31),
            kategori: 'Financial'
          },
          {
            judul: 'Ekspansi ke 5 Kota Baru',
            deskripsi: 'Berhasil membuka layanan di 5 kota besar Indonesia',
            dampak: 'Meningkatkan jangkauan pasar dan customer base',
            tanggal: new Date(2024, 9, 15),
            kategori: 'Growth'
          }
        ],
        tantanganUtama: [
          {
            judul: 'Kompetisi Digital yang Ketat',
            deskripsi: 'Persaingan dengan platform digital lain semakin intensif',
            dampak: 'high',
            status: 'active',
            tindakan: ['Peningkatan fitur digital', 'Strategi marketing agresif', 'Partnership strategis']
          },
          {
            judul: 'Regulasi Pemerintah',
            deskripsi: 'Perubahan regulasi industri otomotif dan e-commerce',
            dampak: 'medium',
            status: 'monitoring',
            tindakan: ['Monitoring regulasi', 'Compliance review', 'Stakeholder engagement']
          }
        ],
        fokusStrategis: [
          {
            area: 'Digital Transformation',
            prioritas: 1,
            tujuan: 'Menjadi platform digital terdepan',
            inisiatif: ['AI Implementation', 'Mobile App Enhancement', 'Data Analytics'],
            target: '90% digital adoption'
          },
          {
            area: 'Customer Experience',
            prioritas: 2,
            tujuan: 'Meningkatkan kepuasan pelanggan',
            inisiatif: ['Service Excellence', 'Omnichannel Experience', 'Personalization'],
            target: 'NPS > 70'
          }
        ],
        keputusanPenting: [
          {
            judul: 'Investasi AI dan Machine Learning',
            deskripsi: 'Alokasi budget 500M untuk pengembangan AI',
            tanggal: new Date(2024, 8, 1),
            dampak: 'Peningkatan efisiensi operasional dan customer experience',
            status: 'implemented'
          }
        ],
        outlook: {
          jangkaPendek: 'Fokus pada peningkatan market share dan customer satisfaction',
          jangkaMenengah: 'Ekspansi regional dan diversifikasi layanan',
          jangkaPanjang: 'Menjadi ecosystem otomotif terintegrasi di Asia Tenggara'
        }
      },
      kpiUtama: this.getMockKPIUtama(),
      inisiatifStrategis: this.getMockInisiatifStrategis(),
      analisisRisiko: this.getMockAnalisisRisiko(),
      proyeksiStrategis: this.getMockProyeksiStrategis(),
      roadmapStrategis: this.getMockRoadmapStrategis(),
      stakeholderMetrics: this.getMockStakeholderMetrics(),
      competitiveIntelligence: this.getMockCompetitiveIntelligence(),
      lastUpdated: new Date()
    };
  }

  private getMockKPIUtama(): KPIUtama[] {
    return [
      {
        id: 'kpi_1',
        nama: 'Revenue Growth',
        kategori: 'financial',
        nilaiSaatIni: 45.2,
        target: 40.0,
        pencapaian: 113.0,
        trend: 'up',
        periode: 'YTD 2024',
        unit: '%',
        deskripsi: 'Pertumbuhan revenue year-over-year',
        pemilik: 'CFO',
        status: 'on_track',
        riwayat: this.generateHistoricalData(12, 35, 50),
        benchmark: {
          internal: 45.2,
          industri: 25.5,
          bestPractice: 55.0
        }
      },
      {
        id: 'kpi_2',
        nama: 'Customer Satisfaction (NPS)',
        kategori: 'customer',
        nilaiSaatIni: 67,
        target: 70,
        pencapaian: 95.7,
        trend: 'up',
        periode: 'Q4 2024',
        unit: 'score',
        deskripsi: 'Net Promoter Score dari customer survey',
        pemilik: 'CMO',
        status: 'at_risk',
        riwayat: this.generateHistoricalData(12, 60, 75),
        benchmark: {
          internal: 67,
          industri: 55,
          bestPractice: 80
        }
      },
      {
        id: 'kpi_3',
        nama: 'Operational Efficiency',
        kategori: 'operational',
        nilaiSaatIni: 85.5,
        target: 90.0,
        pencapaian: 95.0,
        trend: 'stable',
        periode: 'Q4 2024',
        unit: '%',
        deskripsi: 'Efisiensi operasional keseluruhan',
        pemilik: 'COO',
        status: 'at_risk',
        riwayat: this.generateHistoricalData(12, 80, 90),
        benchmark: {
          internal: 85.5,
          industri: 82.0,
          bestPractice: 95.0
        }
      },
      {
        id: 'kpi_4',
        nama: 'Employee Engagement',
        kategori: 'learning',
        nilaiSaatIni: 78,
        target: 80,
        pencapaian: 97.5,
        trend: 'up',
        periode: 'Q4 2024',
        unit: 'score',
        deskripsi: 'Tingkat engagement karyawan',
        pemilik: 'CHRO',
        status: 'on_track',
        riwayat: this.generateHistoricalData(12, 70, 85),
        benchmark: {
          internal: 78,
          industri: 72,
          bestPractice: 85
        }
      }
    ];
  }

  private getMockInisiatifStrategis(): InisiatifStrategis[] {
    return [
      {
        id: 'init_1',
        nama: 'Digital Transformation Program',
        deskripsi: 'Transformasi digital menyeluruh untuk meningkatkan efisiensi dan customer experience',
        tujuan: [
          'Meningkatkan digital adoption rate menjadi 90%',
          'Mengurangi manual process sebesar 70%',
          'Meningkatkan customer satisfaction score'
        ],
        kategori: 'transformation',
        prioritas: 'high',
        status: 'in_progress',
        progress: 65,
        timeline: {
          mulai: new Date(2024, 0, 1),
          selesai: new Date(2024, 11, 31),
          milestone: [
            {
              id: 'ms_1',
              nama: 'System Analysis & Design',
              tanggal: new Date(2024, 2, 31),
              status: 'completed',
              deskripsi: 'Analisis sistem dan perancangan solusi',
              deliverables: ['System Architecture', 'Technical Specification', 'Project Plan']
            },
            {
              id: 'ms_2',
              nama: 'Core System Development',
              tanggal: new Date(2024, 7, 31),
              status: 'in_progress',
              deskripsi: 'Pengembangan sistem inti',
              deliverables: ['Core Modules', 'API Integration', 'Database Migration']
            },
            {
              id: 'ms_3',
              nama: 'User Training & Go-Live',
              tanggal: new Date(2024, 11, 31),
              status: 'pending',
              deskripsi: 'Pelatihan pengguna dan implementasi',
              deliverables: ['Training Materials', 'User Manual', 'Go-Live Support']
            }
          ]
        },
        budget: {
          dialokasikan: 2500000000,
          terpakai: 1625000000,
          proyeksi: 2400000000
        },
        tim: {
          sponsor: 'CEO',
          leader: 'CTO',
          anggota: ['IT Team', 'Business Analyst', 'UX Designer', 'Project Manager']
        },
        risiko: [
          {
            id: 'risk_1',
            deskripsi: 'Keterlambatan pengembangan sistem',
            probabilitas: 40,
            dampak: 70,
            skor: 28,
            mitigasi: 'Penambahan resource dan parallel development',
            status: 'active'
          },
          {
            id: 'risk_2',
            deskripsi: 'Resistensi pengguna terhadap perubahan',
            probabilitas: 60,
            dampak: 50,
            skor: 30,
            mitigasi: 'Program change management dan training intensif',
            status: 'mitigated'
          }
        ],
        dampak: {
          finansial: 500000000,
          operasional: ['Peningkatan efisiensi 30%', 'Pengurangan error 50%', 'Faster processing time'],
          strategis: ['Digital leadership', 'Competitive advantage', 'Scalability improvement'],
          customer: ['Better user experience', 'Faster service', 'More personalized service']
        },
        metrik: [
          {
            nama: 'Digital Adoption Rate',
            nilaiSaatIni: 65,
            target: 90,
            unit: '%',
            status: 'at_risk'
          },
          {
            nama: 'Process Automation',
            nilaiSaatIni: 45,
            target: 70,
            unit: '%',
            status: 'on_track'
          }
        ]
      },
      {
        id: 'init_2',
        nama: 'Market Expansion Strategy',
        deskripsi: 'Ekspansi ke pasar baru untuk meningkatkan market share',
        tujuan: [
          'Membuka 10 cabang baru',
          'Meningkatkan market share menjadi 20%',
          'Mencapai 50,000 customer baru'
        ],
        kategori: 'growth',
        prioritas: 'high',
        status: 'in_progress',
        progress: 40,
        timeline: {
          mulai: new Date(2024, 3, 1),
          selesai: new Date(2025, 2, 31),
          milestone: [
            {
              id: 'ms_4',
              nama: 'Market Research',
              tanggal: new Date(2024, 5, 30),
              status: 'completed',
              deskripsi: 'Riset pasar dan analisis kompetitor',
              deliverables: ['Market Analysis Report', 'Competitor Analysis', 'Target Market Definition']
            },
            {
              id: 'ms_5',
              nama: 'Location Setup',
              tanggal: new Date(2024, 11, 31),
              status: 'in_progress',
              deskripsi: 'Setup lokasi dan infrastruktur',
              deliverables: ['Location Acquisition', 'Infrastructure Setup', 'Staff Recruitment']
            }
          ]
        },
        budget: {
          dialokasikan: 5000000000,
          terpakai: 2000000000,
          proyeksi: 4800000000
        },
        tim: {
          sponsor: 'CEO',
          leader: 'VP Business Development',
          anggota: ['Business Development Team', 'Operations Team', 'Marketing Team']
        },
        risiko: [
          {
            id: 'risk_3',
            deskripsi: 'Kompetisi lokal yang ketat',
            probabilitas: 70,
            dampak: 60,
            skor: 42,
            mitigasi: 'Strategi diferensiasi dan competitive pricing',
            status: 'active'
          }
        ],
        dampak: {
          finansial: 1500000000,
          operasional: ['Network expansion', 'Operational complexity increase'],
          strategis: ['Market leadership', 'Brand recognition', 'Economy of scale'],
          customer: ['Better accessibility', 'Local presence', 'Improved service coverage']
        },
        metrik: [
          {
            nama: 'New Branches Opened',
            nilaiSaatIni: 4,
            target: 10,
            unit: 'units',
            status: 'behind'
          },
          {
            nama: 'Market Share',
            nilaiSaatIni: 14.5,
            target: 20.0,
            unit: '%',
            status: 'on_track'
          }
        ]
      }
    ];
  }

  private getMockDataStrategis(): DataStrategis {
    return {
      marketIntelligence: {
        ukuranPasar: {
          total: 125000000000000,
          pertumbuhan: 8.5,
          segmen: [
            { nama: 'New Cars', ukuran: 75000000000000, pertumbuhan: 6.2 },
            { nama: 'Used Cars', ukuran: 50000000000000, pertumbuhan: 12.8 }
          ]
        },
        trendIndustri: [
          {
            nama: 'Electric Vehicle Adoption',
            deskripsi: 'Peningkatan adopsi kendaraan listrik',
            dampak: 'high',
            timeline: '2-5 years',
            peluang: 85
          },
          {
            nama: 'Digital Platform Growth',
            deskripsi: 'Pertumbuhan platform digital untuk jual beli mobil',
            dampak: 'high',
            timeline: '1-3 years',
            peluang: 92
          }
        ],
        regulasiTerbaru: [
          {
            nama: 'Regulasi Emisi Euro 4',
            deskripsi: 'Implementasi standar emisi Euro 4',
            dampak: 'medium',
            tanggalEfektif: new Date(2025, 0, 1),
            compliance: 'in_progress'
          }
        ],
        peluangPasar: [
          {
            nama: 'Rural Market Expansion',
            deskripsi: 'Ekspansi ke pasar pedesaan',
            potensi: 'high',
            investasi: 2000000000,
            roi: 25.5
          }
        ]
      },
      competitorAnalysis: {
        pesaingUtama: [
          {
            nama: 'AutoMax Indonesia',
            marketShare: 25.3,
            kekuatan: ['Brand recognition', 'Wide network', 'Financial strength'],
            kelemahan: ['Limited digital presence', 'Slow innovation'],
            strategi: 'Traditional approach with gradual digitalization'
          }
        ],
        posisiKompetitif: {
          kuadran: 'Challenger',
          kekuatan: 85,
          posisiPasar: 12.5,
          trendPosisi: 'improving'
        },
        analisisGap: [
          {
            area: 'Digital Capabilities',
            gap: -15,
            prioritas: 'high',
            tindakan: 'Digital transformation acceleration'
          }
        ],
        strategiKompetitif: [
          {
            strategi: 'Digital First Approach',
            deskripsi: 'Fokus pada pengalaman digital yang superior',
            timeline: '12 months',
            investasi: 1500000000
          }
        ]
      },
      customerInsights: {
        segmentasiLanjutan: [
          {
            nama: 'Digital Natives',
            ukuran: 35,
            karakteristik: ['Tech-savvy', 'Online-first', 'Value convenience'],
            nilai: 'High',
            strategi: 'Digital-first experience'
          }
        ],
        customerJourney: {
          awareness: { touchpoints: ['Social Media', 'Search Engine'], konversi: 15 },
          consideration: { touchpoints: ['Website', 'Reviews'], konversi: 35 },
          purchase: { touchpoints: ['Showroom', 'Online'], konversi: 65 },
          retention: { touchpoints: ['Service', 'Support'], konversi: 80 }
        },
        loyaltyMetrics: {
          nps: 67,
          retentionRate: 78,
          repeatPurchase: 25,
          referralRate: 15
        },
        voiceOfCustomer: {
          topCompliments: ['Good service', 'Competitive price', 'Wide selection'],
          topComplaints: ['Slow process', 'Limited financing', 'Documentation'],
          improvementAreas: ['Digital experience', 'Process speed', 'Transparency']
        }
      },
      operationalExcellence: {
        efisiensiOperasional: {
          overallEfficiency: 85.5,
          processEfficiency: 82.3,
          resourceUtilization: 88.7,
          costEfficiency: 86.2
        },
        kualitasLayanan: {
          serviceQuality: 87.5,
          responseTime: 4.2,
          resolutionRate: 92.3,
          customerSatisfaction: 4.3
        },
        inovasiProses: [
          {
            nama: 'Automated Documentation',
            deskripsi: 'Otomasi proses dokumentasi',
            dampak: 'Pengurangan waktu proses 40%',
            status: 'implemented'
          }
        ],
        automationLevel: {
          overall: 65,
          sales: 70,
          service: 60,
          backOffice: 75
        }
      },
      financialPerformance: {
        profitabilitas: {
          grossMargin: 18.5,
          operatingMargin: 12.3,
          netMargin: 8.7,
          roe: 15.2,
          roa: 8.9
        },
        likuiditas: {
          currentRatio: 2.1,
          quickRatio: 1.8,
          cashRatio: 0.9
        },
        solvabilitas: {
          debtToEquity: 0.45,
          debtToAssets: 0.31,
          interestCoverage: 8.5
        },
        efisiensiModal: {
          assetTurnover: 1.2,
          inventoryTurnover: 6.8,
          receivableTurnover: 12.5
        },
        valuationMetrics: {
          peRatio: 18.5,
          pbRatio: 2.3,
          evEbitda: 12.8
        }
      },
      innovationMetrics: {
        investasiRnD: 125000000,
        produkBaru: [
          {
            nama: 'AI-Powered Car Recommendation',
            status: 'development',
            launchDate: new Date(2025, 2, 1),
            investasi: 50000000
          }
        ],
        patenDanIP: [
          {
            nama: 'Car Valuation Algorithm',
            status: 'filed',
            tanggalFiling: new Date(2024, 8, 15),
            kategori: 'Software'
          }
        ],
        kemitraanInovasi: [
          {
            partner: 'Tech University',
            area: 'AI Research',
            durasi: '2 years',
            investasi: 25000000
          }
        ]
      },
      sustainabilityMetrics: {
        lingkungan: {
          carbonFootprint: 1250,
          energyEfficiency: 85,
          wasteReduction: 15,
          greenInitiatives: 8
        },
        sosial: {
          employeeSatisfaction: 78,
          diversityIndex: 65,
          communityInvestment: 50000000,
          trainingHours: 2400
        },
        governance: {
          boardIndependence: 60,
          ethicsTraining: 95,
          complianceScore: 92,
          transparencyIndex: 88
        },
        esgScore: 76
      },
      digitalTransformation: {
        digitalMaturity: {
          overall: 72,
          strategy: 78,
          technology: 75,
          data: 68,
          culture: 70
        },
        teknologiAdopsi: [
          {
            teknologi: 'Cloud Computing',
            adopsi: 85,
            maturity: 'advanced',
            roi: 22.5
          },
          {
            teknologi: 'Artificial Intelligence',
            adopsi: 45,
            maturity: 'developing',
            roi: 15.8
          }
        ],
        digitalCapabilities: [
          {
            capability: 'Data Analytics',
            level: 'intermediate',
            gap: 25,
            prioritas: 'high'
          }
        ],
        cybersecurity: {
          securityScore: 88,
          incidentCount: 2,
          complianceLevel: 95,
          investmentLevel: 'adequate'
        }
      }
    };
  }

  private getMockManajemenKualitas(): ManajemenKualitas {
    return {
      id: 'quality_mgmt_1',
      sistemKualitas: {
        standarISO: ['ISO 9001:2015', 'ISO 14001:2015'],
        sertifikasiAktif: ['ISO 9001', 'ISO 14001', 'OHSAS 18001'],
        prosedurDokumen: 45,
        auditTerjadwal: 12,
        tingkatKepatuhan: 94.5
      },
      standarKualitas: this.getMockStandarKualitas(),
      prosesKualitas: [
        {
          id: 'proc_1',
          nama: 'Vehicle Inspection Process',
          deskripsi: 'Proses inspeksi kendaraan sebelum dijual',
          tahapan: [
            { nama: 'Initial Check', durasi: 30, penanggungJawab: 'Inspector' },
            { nama: 'Detailed Inspection', durasi: 60, penanggungJawab: 'Senior Inspector' },
            { nama: 'Documentation', durasi: 15, penanggungJawab: 'Admin' }
          ],
          kontrolKualitas: [
            { checkpoint: 'Engine Check', kriteria: 'Engine condition', target: 95 },
            { checkpoint: 'Body Inspection', kriteria: 'Body condition', target: 90 }
          ],
          metrikProses: [
            { nama: 'Inspection Accuracy', nilai: 96.5, target: 95, unit: '%' },
            { nama: 'Process Time', nilai: 105, target: 120, unit: 'minutes' }
          ]
        }
      ],
      metrikKualitas: [
        {
          nama: 'Customer Satisfaction',
          nilai: 4.3,
          target: 4.5,
          unit: 'score',
          trend: 'improving',
          kategori: 'customer_satisfaction'
        },
        {
          nama: 'Defect Rate',
          nilai: 2.1,
          target: 2.0,
          unit: '%',
          trend: 'stable',
          kategori: 'defect_rate'
        },
        {
          nama: 'Process Efficiency',
          nilai: 87.5,
          target: 90.0,
          unit: '%',
          trend: 'improving',
          kategori: 'process_efficiency'
        }
      ],
      auditKualitas: [
        {
          id: 'audit_1',
          jenis: 'internal',
          tanggal: new Date(2024, 10, 15),
          auditor: 'Quality Team',
          area: ['Sales Process', 'Customer Service', 'Documentation'],
          temuan: [
            {
              kategori: 'minor',
              deskripsi: 'Documentation delay in some cases',
              area: 'Documentation',
              tindakan: 'Process improvement training'
            }
          ],
          rekomendasi: [
            'Implement automated documentation system',
            'Provide additional training for staff',
            'Regular monitoring of process compliance'
          ],
          status: 'completed'
        }
      ],
      perbaikanBerkesinambungan: {
        inisiatifAktif: [
          {
            id: 'ci_1',
            nama: 'Digital Documentation',
            deskripsi: 'Digitalisasi proses dokumentasi',
            penanggungJawab: 'IT Team',
            targetSelesai: new Date(2025, 1, 28),
            status: 'in_progress',
            dampakDiharapkan: 'Pengurangan waktu proses 30%'
          }
        ],
        ideaPerbaikan: [
          {
            id: 'idea_1',
            judul: 'Mobile Inspection App',
            deskripsi: 'Aplikasi mobile untuk inspeksi kendaraan',
            pengusul: 'Inspector Team',
            tanggal: new Date(2024, 11, 1),
            status: 'under_review',
            potensiDampak: 'high'
          }
        ],
        implementasiSelesai: [
          {
            id: 'impl_1',
            nama: 'Customer Feedback System',
            tanggalSelesai: new Date(2024, 9, 30),
            dampakAktual: 'Peningkatan customer satisfaction 15%',
            roi: 25.5
          }
        ],
        dampakPerbaikan: {
          penghematanBiaya: 125000000,
          peningkatanEfisiensi: 18.5,
          peningkatanKualitas: 12.3,
          kepuasanKaryawan: 8.7
        }
      },
      sertifikasi: [
        {
          nama: 'ISO 9001:2015',
          penerbit: 'BSI Group',
          tanggalTerbit: new Date(2023, 5, 15),
          tanggalKadaluarsa: new Date(2026, 5, 15),
          status: 'active',
          cakupan: ['Quality Management System', 'Customer Service', 'Sales Process']
        },
        {
          nama: 'ISO 14001:2015',
          penerbit: 'TUV Rheinland',
          tanggalTerbit: new Date(2023, 8, 20),
          tanggalKadaluarsa: new Date(2026, 8, 20),
          status: 'active',
          cakupan: ['Environmental Management', 'Waste Management', 'Energy Efficiency']
        }
      ],
      pelatihanKualitas: [
        {
          program: 'Quality Management Fundamentals',
          peserta: 45,
          durasi: 16,
          efektivitas: 87.5,
          sertifikasiDiperoleh: 42
        },
        {
          program: 'Customer Service Excellence',
          peserta: 32,
          durasi: 8,
          efektivitas: 92.3,
          sertifikasiDiperoleh: 30
        }
      ],
      customerFeedback: {
        ratingKualitas: 4.3,
        keluhan: [
          {
            kategori: 'Process',
            jumlah: 15,
            deskripsi: 'Proses dokumentasi terlalu lama',
            tindakan: 'Implementasi sistem digital'
          },
          {
            kategori: 'Service',
            jumlah: 8,
            deskripsi: 'Respon customer service lambat',
            tindakan: 'Pelatihan tambahan untuk CS'
          }
        ],
        pujian: [
          {
            kategori: 'Service',
            jumlah: 125,
            deskripsi: 'Pelayanan yang ramah dan profesional'
          },
          {
            kategori: 'Quality',
            jumlah: 98,
            deskripsi: 'Kualitas kendaraan sesuai deskripsi'
          }
        ],
        saran: [
          {
            kategori: 'Digital',
            jumlah: 45,
            deskripsi: 'Perbaikan aplikasi mobile',
            prioritas: 'high'
          }
        ]
      },
      supplierQuality: [
        {
          supplierId: 'sup_1',
          nama: 'Toyota Astra Motor',
          qualityRating: 96.5,
          defectRate: 0.8,
          onTimeDelivery: 98.2,
          certifications: ['ISO 9001', 'ISO 14001'],
          auditScore: 94.5
        },
        {
          supplierId: 'sup_2',
          nama: 'Honda Prospect Motor',
          qualityRating: 94.8,
          defectRate: 1.2,
          onTimeDelivery: 96.8,
          certifications: ['ISO 9001', 'TS 16949'],
          auditScore: 92.3
        }
      ]
    };
  }

  private getMockStandarKualitas(): StandarKualitas[] {
    return [
      {
        id: 'std_1',
        nama: 'Vehicle Inspection Standard',
        kategori: 'product',
        deskripsi: 'Standar inspeksi kendaraan sebelum dijual',
        kriteria: [
          {
            nama: 'Engine Condition',
            bobot: 30,
            target: 95,
            nilaiSaatIni: 96.5,
            status: 'exceeded'
          },
          {
            nama: 'Body Condition',
            bobot: 25,
            target: 90,
            nilaiSaatIni: 88.5,
            status: 'not_met'
          },
          {
            nama: 'Interior Condition',
            bobot: 20,
            target: 85,
            nilaiSaatIni: 87.2,
            status: 'exceeded'
          },
          {
            nama: 'Documentation Completeness',
            bobot: 25,
            target: 100,
            nilaiSaatIni: 98.5,
            status: 'not_met'
          }
        ],
        target: 92,
        nilaiSaatIni: 92.8,
        unit: 'score',
        metodePengukuran: 'Weighted average of criteria scores',
        frekuensiEvaluasi: 'Monthly',
        penanggungJawab: 'Quality Manager',
        status: 'achieved',
        riwayatPencapaian: this.generateHistoricalData(12, 88, 95),
        tindakanPerbaikan: [
          {
            id: 'action_1',
            deskripsi: 'Improve body condition inspection process',
            penanggungJawab: 'Inspection Team',
            targetSelesai: new Date(2025, 0, 31),
            status: 'in_progress',
            dampakDiharapkan: 'Increase body condition score to 92+'
          }
        ],
        dokumentasi: [
          {
            jenis: 'Procedure',
            nama: 'Vehicle Inspection SOP',
            versi: '2.1',
            tanggalUpdate: new Date(2024, 10, 1),
            url: '/docs/vehicle-inspection-sop-v2.1.pdf'
          }
        ]
      },
      {
        id: 'std_2',
        nama: 'Customer Service Standard',
        kategori: 'service',
        deskripsi: 'Standar pelayanan pelanggan',
        kriteria: [
          {
            nama: 'Response Time',
            bobot: 40,
            target: 5,
            nilaiSaatIni: 4.2,
            status: 'exceeded'
          },
          {
            nama: 'Resolution Rate',
            bobot: 35,
            target: 95,
            nilaiSaatIni: 92.3,
            status: 'not_met'
          },
          {
            nama: 'Customer Satisfaction',
            bobot: 25,
            target: 4.5,
            nilaiSaatIni: 4.3,
            status: 'not_met'
          }
        ],
        target: 4.5,
        nilaiSaatIni: 4.2,
        unit: 'score',
        metodePengukuran: 'Customer survey and system metrics',
        frekuensiEvaluasi: 'Weekly',
        penanggungJawab: 'Customer Service Manager',
        status: 'in_progress',
        riwayatPencapaian: this.generateHistoricalData(12, 3.8, 4.6),
        tindakanPerbaikan: [
          {
            id: 'action_2',
            deskripsi: 'Implement advanced CRM system',
            penanggungJawab: 'IT Team',
            targetSelesai: new Date(2025, 1, 15),
            status: 'planned',
            dampakDiharapkan: 'Improve resolution rate to 97%'
          }
        ],
        dokumentasi: [
          {
            jenis: 'Manual',
            nama: 'Customer Service Manual',
            versi: '3.0',
            tanggalUpdate: new Date(2024, 9, 15),
            url: '/docs/customer-service-manual-v3.0.pdf'
          }
        ]
      }
    ];
  }

  private getMockAreaLain(): AreaLain[] {
    return [
      {
        id: 'area_1',
        nama: 'Kalimantan Timur',
        kategori: 'geographic',
        deskripsi: 'Ekspansi ke wilayah Kalimantan Timur dengan fokus pada kota Balikpapan dan Samarinda',
        potensiPasar: {
          ukuran: 15000000000,
          pertumbuhan: 12.5,
          daya_beli: 85,
          kompetisi: 45
        },
        analisisKelayakan: this.getMockAnalisisKelayakan(),
        strategiMasuk: {
          pendekatan: 'organic',
          tahapan: [
            {
              nama: 'Market Entry',
              durasi: '6 months',
              aktivitas: ['Market research', 'Location scouting', 'Partnership building'],
              target: ['Establish local presence', 'Build brand awareness'],
              investasi: 500000000
            },
            {
              nama: 'Operations Setup',
              durasi: '4 months',
              aktivitas: ['Facility setup', 'Staff recruitment', 'System integration'],
              target: ['Operational readiness', 'Staff training completion'],
              investasi: 800000000
            },
            {
              nama: 'Market Penetration',
              durasi: '12 months',
              aktivitas: ['Marketing campaigns', 'Customer acquisition', 'Service optimization'],
              target: ['Market share 5%', '1000 customers'],
              investasi: 700000000
            }
          ],
          sumberDaya: [
            {
              jenis: 'Human Resources',
              jumlah: 25,
              deskripsi: 'Local staff and management team'
            },
            {
              jenis: 'Infrastructure',
              jumlah: 2,
              deskripsi: 'Showroom and service center'
            }
          ],
          timeline: '22 months'
        },
        investasiDiperlukan: {
          modal: 1500000000,
          operasional: 300000000,
          marketing: 200000000,
          teknologi: 100000000,
          sdm: 150000000,
          total: 2250000000
        },
        proyeksiROI: {
          tahun1: -5.2,
          tahun2: 8.5,
          tahun3: 18.7,
          tahun5: 28.3,
          breakEvenPoint: 18,
          npv: 850000000,
          irr: 22.5
        },
        risikoArea: [
          {
            kategori: 'Market',
            deskripsi: 'Kompetisi dari pemain lokal yang sudah established',
            probabilitas: 70,
            dampak: 60,
            mitigasi: 'Diferensiasi produk dan layanan superior',
            status: 'active'
          },
          {
            kategori: 'Operational',
            deskripsi: 'Kesulitan rekrutmen talent berkualitas',
            probabilitas: 50,
            dampak: 40,
            mitigasi: 'Program training dan development yang intensif',
            status: 'mitigated'
          }
        ],
        timeline: {
          fase1: {
            nama: 'Preparation Phase',
            durasi: '6 months',
            aktivitas: ['Market analysis', 'Business plan', 'Funding approval'],
            target: ['Complete feasibility study', 'Secure funding'],
            investasi: 200000000
          },
          fase2: {
            nama: 'Implementation Phase',
            durasi: '10 months',
            aktivitas: ['Setup operations', 'Staff hiring', 'Marketing launch'],
            target: ['Operational launch', 'First customers'],
            investasi: 1500000000
          },
          fase3: {
            nama: 'Growth Phase',
            durasi: '12 months',
            aktivitas: ['Scale operations', 'Market expansion', 'Optimization'],
            target: ['Achieve profitability', 'Market leadership'],
            investasi: 550000000
          }
        },
        status: 'under_review',
        rekomendasi: [
          'Proceed with detailed market research',
          'Establish local partnerships',
          'Develop phased implementation plan',
          'Secure adequate funding and resources'
        ]
      },
      {
        id: 'area_2',
        nama: 'Millennial Segment',
        kategori: 'demographic',
        deskripsi: 'Fokus pada segmen millennial dengan produk dan layanan yang disesuaikan',
        potensiPasar: {
          ukuran: 25000000000,
          pertumbuhan: 18.5,
          daya_beli: 75,
          kompetisi: 65
        },
        analisisKelayakan: {
          teknis: 90,
          ekonomis: 85,
          hukum: 95,
          operasional: 88,
          jadwal: 92,
          keseluruhan: 90
        },
        strategiMasuk: {
          pendekatan: 'partnership',
          tahapan: [
            {
              nama: 'Digital Platform Development',
              durasi: '8 months',
              aktivitas: ['App development', 'Digital marketing', 'Social media presence'],
              target: ['Launch mobile app', 'Build online community'],
              investasi: 800000000
            }
          ],
          sumberDaya: [
            {
              jenis: 'Technology',
              jumlah: 1,
              deskripsi: 'Advanced mobile platform and digital tools'
            }
          ],
          timeline: '12 months'
        },
        investasiDiperlukan: {
          modal: 1000000000,
          operasional: 200000000,
          marketing: 400000000,
          teknologi: 300000000,
          sdm: 100000000,
          total: 2000000000
        },
        proyeksiROI: {
          tahun1: 5.2,
          tahun2: 15.8,
          tahun3: 25.7,
          tahun5: 35.3,
          breakEvenPoint: 14,
          npv: 1200000000,
          irr: 28.5
        },
        risikoArea: [
          {
            kategori: 'Technology',
            deskripsi: 'Rapid technology changes and platform obsolescence',
            probabilitas: 60,
            dampak: 50,
            mitigasi: 'Agile development and continuous innovation',
            status: 'active'
          }
        ],
        timeline: {
          fase1: {
            nama: 'Research & Development',
            durasi: '4 months',
            aktivitas: ['User research', 'Product design', 'Technology selection'],
            target: ['Define product requirements', 'Technology architecture'],
            investasi: 300000000
          },
          fase2: {
            nama: 'Platform Development',
            durasi: '8 months',
            aktivitas: ['App development', 'Testing', 'Beta launch'],
            target: ['Complete platform', 'Beta user feedback'],
            investasi: 1200000000
          },
          fase3: {
            nama: 'Market Launch',
            durasi: '6 months',
            aktivitas: ['Marketing campaign', 'User acquisition', 'Optimization'],
            target: ['Market penetration', 'User growth'],
            investasi: 500000000
          }
        },
        status: 'approved',
        rekomendasi: [
          'Accelerate digital platform development',
          'Focus on user experience and engagement',
          'Build strong social media presence',
          'Develop millennial-specific financing options'
        ]
      }
    ];
  }

  private getMockAnalisisKelayakan(): AnalisisKelayakan {
    return {
      teknis: 85,
      ekonomis: 78,
      hukum: 92,
      operasional: 80,
      jadwal: 88,
      keseluruhan: 84.6
    };
  }

  // Additional mock methods for complex objects
  private getMockAnalisisRisiko(): AnalisisRisiko {
    return {
      risikoTinggi: [
        {
          nama: 'Economic Recession',
          probabilitas: 35,
          dampak: 85,
          skor: 29.75,
          kategori: 'External',
          mitigasi: 'Diversification and cost optimization',
          status: 'active'
        }
      ],
      risikoMenengah: [
        {
          nama: 'New Competitor Entry',
          probabilitas: 60,
          dampak: 50,
          skor: 30,
          kategori: 'Competitive',
          mitigasi: 'Strengthen competitive advantages',
          status: 'monitoring'
        }
      ],
      risikoRendah: [
        {
          nama: 'Technology Disruption',
          probabilitas: 25,
          dampak: 40,
          skor: 10,
          kategori: 'Technology',
          mitigasi: 'Continuous innovation and adaptation',
          status: 'monitoring'
        }
      ],
      totalRiskScore: 69.75,
      riskAppetite: 'Moderate',
      mitigationBudget: 500000000
    };
  }

  private getMockProyeksiStrategis(): ProyeksiStrategis {
    return {
      proyeksi3Tahun: {
        revenue: [
          { tahun: 2025, nilai: 3000000000, confidence: 85 },
          { tahun: 2026, nilai: 3600000000, confidence: 78 },
          { tahun: 2027, nilai: 4320000000, confidence: 70 }
        ],
        marketShare: [
          { tahun: 2025, nilai: 15.5, confidence: 82 },
          { tahun: 2026, nilai: 18.2, confidence: 75 },
          { tahun: 2027, nilai: 21.8, confidence: 68 }
        ],
        profitability: [
          { tahun: 2025, nilai: 12.5, confidence: 88 },
          { tahun: 2026, nilai: 14.2, confidence: 80 },
          { tahun: 2027, nilai: 16.8, confidence: 72 }
        ]
      },
      skenario: {
        optimistic: {
          revenue: 5000000000,
          marketShare: 25.0,
          probability: 25,
          keyFactors: ['Strong economic growth', 'Successful innovation', 'Market expansion']
        },
        realistic: {
          revenue: 4320000000,
          marketShare: 21.8,
          probability: 50,
          keyFactors: ['Stable market conditions', 'Moderate competition', 'Steady growth']
        },
        pessimistic: {
          revenue: 3500000000,
          marketShare: 18.5,
          probability: 25,
          keyFactors: ['Economic downturn', 'Intense competition', 'Market saturation']
        }
      },
      keyAssumptions: [
        'GDP growth rate 5-6% annually',
        'Automotive market growth 8-10%',
        'Digital adoption continues to increase',
        'Regulatory environment remains stable'
      ]
    };
  }

  private getMockRoadmapStrategis(): RoadmapStrategis {
    return {
      jangkaPendek: {
        periode: '2024-2025',
        fokus: ['Digital transformation', 'Customer experience', 'Operational efficiency'],
        target: ['Complete digital platform', 'Achieve NPS 70+', 'Reduce costs 15%'],
        investasi: 3000000000,
        milestone: [
          { nama: 'Digital Platform Launch', tanggal: new Date(2025, 2, 1), status: 'on_track' },
          { nama: 'Customer Experience Program', tanggal: new Date(2025, 5, 1), status: 'planning' }
        ]
      },
      jangkaMenengah: {
        periode: '2025-2027',
        fokus: ['Market expansion', 'Product innovation', 'Strategic partnerships'],
        target: ['Expand to 15 cities', 'Launch 3 new products', 'Form 5 partnerships'],
        investasi: 7500000000,
        milestone: [
          { nama: 'Regional Expansion', tanggal: new Date(2026, 6, 1), status: 'planning' },
          { nama: 'Innovation Lab Setup', tanggal: new Date(2026, 0, 1), status: 'planning' }
        ]
      },
      jangkaPanjang: {
        periode: '2027-2030',
        fokus: ['International expansion', 'Ecosystem development', 'Sustainability'],
        target: ['Enter 3 ASEAN markets', 'Build automotive ecosystem', 'Carbon neutral'],
        investasi: 15000000000,
        milestone: [
          { nama: 'International Launch', tanggal: new Date(2028, 0, 1), status: 'planning' },
          { nama: 'Ecosystem Platform', tanggal: new Date(2029, 6, 1), status: 'planning' }
        ]
      }
    };
  }

  private getMockStakeholderMetrics(): StakeholderMetrics {
    return {
      shareholders: {
        roi: 18.5,
        dividendYield: 4.2,
        stockPerformance: 25.8,
        satisfaction: 85
      },
      customers: {
        satisfaction: 4.3,
        nps: 67,
        retentionRate: 78,
        acquisitionCost: 850000
      },
      employees: {
        engagement: 78,
        satisfaction: 82,
        turnoverRate: 12.5,
        productivityIndex: 115
      },
      community: {
        socialImpact: 75,
        environmentalScore: 68,
        communityInvestment: 50000000,
        localEmployment: 450
      },
      suppliers: {
        satisfaction: 88,
        paymentTerms: 30,
        qualityScore: 92,
        partnershipIndex: 85
      }
    };
  }

  private getMockCompetitiveIntelligence(): CompetitiveIntelligence {
    return {
      marketPosition: {
        ranking: 3,
        marketShare: 12.5,
        brandStrength: 78,
        competitiveAdvantage: ['Digital platform', 'Customer service', 'Pricing flexibility']
      },
      competitorMovements: [
        {
          competitor: 'AutoMax Indonesia',
          action: 'Digital platform launch',
          impact: 'Medium',
          response: 'Accelerate our digital features',
          timeline: '3 months'
        },
        {
          competitor: 'MobilKu Group',
          action: 'Price reduction campaign',
          impact: 'High',
          response: 'Value proposition enhancement',
          timeline: '1 month'
        }
      ],
      threatAssessment: {
        newEntrants: 'Medium',
        substitutes: 'Low',
        buyerPower: 'High',
        supplierPower: 'Medium',
        rivalry: 'High'
      },
      opportunityMap: [
        {
          opportunity: 'Electric vehicle market',
          attractiveness: 85,
          competitiveStrength: 65,
          priority: 'High',
          timeline: '12-18 months'
        },
        {
          opportunity: 'Rural market expansion',
          attractiveness: 70,
          competitiveStrength: 80,
          priority: 'Medium',
          timeline: '6-12 months'
        }
      ]
    };
  }

  private generateHistoricalData(months: number, minValue: number, maxValue: number): HistoricalData[] {
    const data: HistoricalData[] = [];
    let currentValue = minValue + (maxValue - minValue) * Math.random();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      // Add some trend and randomness
      const trend = (maxValue - minValue) / months * 0.5;
      const randomness = (maxValue - minValue) * 0.1 * (Math.random() - 0.5);
      currentValue = Math.max(minValue, Math.min(maxValue, currentValue + trend + randomness));
      
      data.push({
        periode: date,
        nilai: Math.round(currentValue * 100) / 100,
        target: minValue + (maxValue - minValue) * 0.8
      });
    }
    
    return data;
  }
}

// Additional interfaces for complex mock data
interface AnalisisRisiko {
  risikoTinggi: RisikoItem[];
  risikoMenengah: RisikoItem[];
  risikoRendah: RisikoItem[];
  totalRiskScore: number;
  riskAppetite: string;
  mitigationBudget: number;
}

interface RisikoItem {
  nama: string;
  probabilitas: number;
  dampak: number;
  skor: number;
  kategori: string;
  mitigasi: string;
  status: string;
}

interface ProyeksiStrategis {
  proyeksi3Tahun: {
    revenue: ProyeksiTahunan[];
    marketShare: ProyeksiTahunan[];
    profitability: ProyeksiTahunan[];
  };
  skenario: {
    optimistic: SkenarioProyeksi;
    realistic: SkenarioProyeksi;
    pessimistic: SkenarioProyeksi;
  };
  keyAssumptions: string[];
}

interface ProyeksiTahunan {
  tahun: number;
  nilai: number;
  confidence: number;
}

interface SkenarioProyeksi {
  revenue: number;
  marketShare: number;
  probability: number;
  keyFactors: string[];
}

interface RoadmapStrategis {
  jangkaPendek: FaseRoadmap;
  jangkaMenengah: FaseRoadmap;
  jangkaPanjang: FaseRoadmap;
}

interface FaseRoadmap {
  periode: string;
  fokus: string[];
  target: string[];
  investasi: number;
  milestone: MilestoneRoadmap[];
}

interface MilestoneRoadmap {
  nama: string;
  tanggal: Date;
  status: string;
}

interface StakeholderMetrics {
  shareholders: {
    roi: number;
    dividendYield: number;
    stockPerformance: number;
    satisfaction: number;
  };
  customers: {
    satisfaction: number;
    nps: number;
    retentionRate: number;
    acquisitionCost: number;
  };
  employees: {
    engagement: number;
    satisfaction: number;
    turnoverRate: number;
    productivityIndex: number;
  };
  community: {
    socialImpact: number;
    environmentalScore: number;
    communityInvestment: number;
    localEmployment: number;
  };
  suppliers: {
    satisfaction: number;
    paymentTerms: number;
    qualityScore: number;
    partnershipIndex: number;
  };
}

interface CompetitiveIntelligence {
  marketPosition: {
    ranking: number;
    marketShare: number;
    brandStrength: number;
    competitiveAdvantage: string[];
  };
  competitorMovements: CompetitorMovement[];
  threatAssessment: {
    newEntrants: string;
    substitutes: string;
    buyerPower: string;
    supplierPower: string;
    rivalry: string;
  };
  opportunityMap: OpportunityItem[];
}

interface CompetitorMovement {
  competitor: string;
  action: string;
  impact: string;
  response: string;
  timeline: string;
}

interface OpportunityItem {
  opportunity: string;
  attractiveness: number;
  competitiveStrength: number;
  priority: string;
  timeline: string;
}

// Supporting interfaces for mock data
interface SegmenPasar {
  nama: string;
  ukuran: number;
  pertumbuhan: number;
}

interface TrendIndustri {
  nama: string;
  deskripsi: string;
  dampak: string;
  timeline: string;
  peluang: number;
}

interface Regulasi {
  nama: string;
  deskripsi: string;
  dampak: string;
  tanggalEfektif: Date;
  compliance: string;
}

interface PeluangPasar {
  nama: string;
  deskripsi: string;
  potensi: string;
  investasi: number;
  roi: number;
}

interface PesaingUtama {
  nama: string;
  marketShare: number;
  kekuatan: string[];
  kelemahan: string[];
  strategi: string;
}

interface PosisiKompetitif {
  kuadran: string;
  kekuatan: number;
  posisiPasar: number;
  trendPosisi: string;
}

interface AnalisisGap {
  area: string;
  gap: number;
  prioritas: string;
  tindakan: string;
}

interface StrategiKompetitif {
  strategi: string;
  deskripsi: string;
  timeline: string;
  investasi: number;
}

interface SegmentasiLanjutan {
  nama: string;
  ukuran: number;
  karakteristik: string[];
  nilai: string;
  strategi: string;
}

interface CustomerJourney {
  awareness: { touchpoints: string[]; konversi: number };
  consideration: { touchpoints: string[]; konversi: number };
  purchase: { touchpoints: string[]; konversi: number };
  retention: { touchpoints: string[]; konversi: number };
}

interface LoyaltyMetrics {
  nps: number;
  retentionRate: number;
  repeatPurchase: number;
  referralRate: number;
}

interface VoiceOfCustomer {
  topCompliments: string[];
  topComplaints: string[];
  improvementAreas: string[];
}

interface EfisiensiOperasional {
  overallEfficiency: number;
  processEfficiency: number;
  resourceUtilization: number;
  costEfficiency: number;
}

interface KualitasLayanan {
  serviceQuality: number;
  responseTime: number;
  resolutionRate: number;
  customerSatisfaction: number;
}

interface InovasiProses {
  nama: string;
  deskripsi: string;
  dampak: string;
  status: string;
}

interface AutomationLevel {
  overall: number;
  sales: number;
  service: number;
  backOffice: number;
}

interface Profitabilitas {
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
  roe: number;
  roa: number;
}

interface Likuiditas {
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
}

interface Solvabilitas {
  debtToEquity: number;
  debtToAssets: number;
  interestCoverage: number;
}

interface EfisiensiModal {
  assetTurnover: number;
  inventoryTurnover: number;
  receivableTurnover: number;
}

interface ValuationMetrics {
  peRatio: number;
  pbRatio: number;
  evEbitda: number;
}

interface ProdukBaru {
  nama: string;
  status: string;
  launchDate: Date;
  investasi: number;
}

interface PatenDanIP {
  nama: string;
  status: string;
  tanggalFiling: Date;
  kategori: string;
}

interface KemitraanInovasi {
  partner: string;
  area: string;
  durasi: string;
  investasi: number;
}

interface MetrikLingkungan {
  carbonFootprint: number;
  energyEfficiency: number;
  wasteReduction: number;
  greenInitiatives: number;
}

interface MetrikSosial {
  employeeSatisfaction: number;
  diversityIndex: number;
  communityInvestment: number;
  trainingHours: number;
}

interface MetrikGovernance {
  boardIndependence: number;
  ethicsTraining: number;
  complianceScore: number;
  transparencyIndex: number;
}

interface DigitalMaturity {
  overall: number;
  strategy: number;
  technology: number;
  data: number;
  culture: number;
}

interface TeknologiAdopsi {
  teknologi: string;
  adopsi: number;
  maturity: string;
  roi: number;
}

interface DigitalCapabilities {
  capability: string;
  level: string;
  gap: number;
  prioritas: string;
}

interface CybersecurityMetrics {
  securityScore: number;
  incidentCount: number;
  complianceLevel: number;
  investmentLevel: string;
}

interface TahapanProses {
  nama: string;
  durasi: number;
  penanggungJawab: string;
}

interface KontrolKualitas {
  checkpoint: string;
  kriteria: string;
  target: number;
}

interface MetrikProses {
  nama: string;
  nilai: number;
  target: number;
  unit: string;
}

interface TemuanAudit {
  kategori: string;
  deskripsi: string;
  area: string;
  tindakan: string;
}

interface InisiatifPerbaikan {
  id: string;
  nama: string;
  deskripsi: string;
  penanggungJawab: string;
  targetSelesai: Date;
  status: string;
  dampakDiharapkan: string;
}

interface IdeaPerbaikan {
  id: string;
  judul: string;
  deskripsi: string;
  pengusul: string;
  tanggal: Date;
  status: string;
  potensiDampak: string;
}

interface ImplementasiSelesai {
  id: string;
  nama: string;
  tanggalSelesai: Date;
  dampakAktual: string;
  roi: number;
}

interface DampakPerbaikan {
  penghematanBiaya: number;
  peningkatanEfisiensi: number;
  peningkatanKualitas: number;
  kepuasanKaryawan: number;
}

interface KeluhanKualitas {
  kategori: string;
  jumlah: number;
  deskripsi: string;
  tindakan: string;
}

interface PujianKualitas {
  kategori: string;
  jumlah: number;
  deskripsi: string;
}

interface SaranKualitas {
  kategori: string;
  jumlah: number;
  deskripsi: string;
  prioritas: string;
}

interface TahapanMasuk {
  nama: string;
  durasi: string;
  aktivitas: string[];
  target: string[];
  investasi: number;
}

interface SumberDayaDiperlukan {
  jenis: string;
  jumlah: number;
  deskripsi: string;
}

export default KontrollerStrategis;

