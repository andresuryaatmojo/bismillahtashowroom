// LayananChatbot.ts - Service untuk mengelola operasi chatbot dan knowledge base

// Interfaces
interface DataKnowledge {
  id: string;
  judul: string;
  kategori: string;
  subkategori?: string;
  pertanyaan: string[];
  jawaban: string;
  konteks?: string;
  tags: string[];
  prioritas: 'rendah' | 'sedang' | 'tinggi' | 'kritis';
  status: 'aktif' | 'nonaktif' | 'review' | 'draft';
  confidence: number;
  usage_count: number;
  success_rate: number;
  feedback_score: number;
  metadata: MetadataKnowledge;
  validasi: ValidasiKnowledge;
  riwayat: RiwayatKnowledge[];
  relasi: RelasiKnowledge[];
  media?: MediaKnowledge[];
  pembuat: InfoPembuat;
  terakhir_update: string;
  tanggal_dibuat: string;
  versi: string;
}

interface MetadataKnowledge {
  bahasa: string;
  domain: string[];
  kompleksitas: 'sederhana' | 'menengah' | 'kompleks' | 'expert';
  akurasi: number;
  relevansi: number;
  freshness: number;
  source_reliability: number;
  update_frequency: 'harian' | 'mingguan' | 'bulanan' | 'tahunan' | 'manual';
  expiry_date?: string;
  review_date?: string;
}

interface ValidasiKnowledge {
  grammar_check: boolean;
  fact_check: boolean;
  consistency_check: boolean;
  completeness_check: boolean;
  relevance_check: boolean;
  last_validated: string;
  validator: string;
  validation_score: number;
  issues: ValidationIssue[];
}

interface ValidationIssue {
  jenis: 'grammar' | 'fact' | 'consistency' | 'completeness' | 'relevance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  deskripsi: string;
  saran: string;
  status: 'open' | 'resolved' | 'ignored';
}

interface RiwayatKnowledge {
  id: string;
  aksi: 'create' | 'update' | 'delete' | 'activate' | 'deactivate' | 'review';
  deskripsi: string;
  perubahan?: any;
  user: string;
  timestamp: string;
  alasan?: string;
}

interface RelasiKnowledge {
  id: string;
  jenis: 'parent' | 'child' | 'related' | 'alternative' | 'prerequisite' | 'follow_up';
  target_id: string;
  strength: number;
  deskripsi?: string;
  auto_generated: boolean;
}

interface MediaKnowledge {
  id: string;
  jenis: 'image' | 'video' | 'audio' | 'document' | 'link';
  url: string;
  nama: string;
  deskripsi?: string;
  ukuran?: number;
  format?: string;
  durasi?: number;
  thumbnail?: string;
}

interface InfoPembuat {
  id: string;
  nama: string;
  role: string;
  email?: string;
  departemen?: string;
}

interface PertanyaanTidakTerjawab {
  id: string;
  pertanyaan: string;
  konteks?: string;
  user_id?: string;
  session_id: string;
  timestamp: string;
  frekuensi: number;
  kategori_prediksi?: string;
  confidence_level: number;
  similar_questions: string[];
  suggested_answers: SuggestedAnswer[];
  prioritas: 'rendah' | 'sedang' | 'tinggi' | 'kritis';
  status: 'baru' | 'review' | 'processed' | 'ignored';
  feedback?: FeedbackPertanyaan[];
  metadata: MetadataPertanyaan;
}

interface SuggestedAnswer {
  jawaban: string;
  confidence: number;
  source: string;
  reasoning: string;
}

interface FeedbackPertanyaan {
  id: string;
  user_id: string;
  rating: number;
  komentar?: string;
  helpful: boolean;
  timestamp: string;
}

interface MetadataPertanyaan {
  user_agent?: string;
  ip_address?: string;
  referrer?: string;
  device_type?: string;
  location?: string;
  language: string;
  intent_analysis?: IntentAnalysis;
}

interface IntentAnalysis {
  primary_intent: string;
  secondary_intents: string[];
  entities: EntityExtraction[];
  sentiment: 'positive' | 'negative' | 'neutral';
  urgency: 'low' | 'medium' | 'high';
  complexity: 'simple' | 'moderate' | 'complex';
}

interface EntityExtraction {
  entity: string;
  value: string;
  confidence: number;
  start: number;
  end: number;
}

interface HasilTestChatbot {
  id: string;
  timestamp: string;
  jenis_test: 'unit' | 'integration' | 'performance' | 'accuracy' | 'comprehensive';
  status: 'passed' | 'failed' | 'warning';
  skor_keseluruhan: number;
  detail_test: DetailTest[];
  statistik: StatistikTest;
  rekomendasi: string[];
  durasi: number;
  environment: string;
  versi_chatbot: string;
}

interface DetailTest {
  nama_test: string;
  kategori: string;
  status: 'passed' | 'failed' | 'skipped';
  skor: number;
  waktu_eksekusi: number;
  input: any;
  output_expected: any;
  output_actual: any;
  error_message?: string;
  metadata?: any;
}

interface StatistikTest {
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  success_rate: number;
  average_response_time: number;
  accuracy_score: number;
  coverage_percentage: number;
}

interface HasilTestKnowledge {
  id: string;
  knowledge_id: string;
  timestamp: string;
  test_scenarios: TestScenario[];
  overall_score: number;
  accuracy: number;
  relevance: number;
  completeness: number;
  consistency: number;
  performance_metrics: PerformanceMetrics;
  issues_found: TestIssue[];
  recommendations: string[];
}

interface TestScenario {
  id: string;
  nama: string;
  deskripsi: string;
  input: string;
  expected_output: string;
  actual_output: string;
  score: number;
  passed: boolean;
  response_time: number;
  confidence: number;
}

interface PerformanceMetrics {
  average_response_time: number;
  max_response_time: number;
  min_response_time: number;
  throughput: number;
  memory_usage: number;
  cpu_usage: number;
}

interface TestIssue {
  jenis: 'accuracy' | 'performance' | 'consistency' | 'completeness';
  severity: 'low' | 'medium' | 'high' | 'critical';
  deskripsi: string;
  affected_scenarios: string[];
  suggested_fix: string;
}

interface KonfigurasiChatbot {
  model_settings: ModelSettings;
  response_settings: ResponseSettings;
  learning_settings: LearningSettings;
  security_settings: SecuritySettings;
  integration_settings: IntegrationSettings;
  monitoring_settings: MonitoringSettings;
}

interface ModelSettings {
  model_name: string;
  version: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  stop_sequences: string[];
}

interface ResponseSettings {
  default_language: string;
  fallback_responses: string[];
  confidence_threshold: number;
  max_response_length: number;
  enable_context: boolean;
  context_window: number;
  enable_memory: boolean;
  memory_duration: number;
}

interface LearningSettings {
  auto_learning: boolean;
  feedback_threshold: number;
  update_frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  learning_rate: number;
  validation_required: boolean;
  human_review_threshold: number;
}

interface SecuritySettings {
  content_filtering: boolean;
  pii_detection: boolean;
  rate_limiting: RateLimitSettings;
  access_control: AccessControlSettings;
  audit_logging: boolean;
  encryption_enabled: boolean;
}

interface RateLimitSettings {
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
  burst_limit: number;
}

interface AccessControlSettings {
  authentication_required: boolean;
  authorized_domains: string[];
  ip_whitelist: string[];
  user_roles: string[];
}

interface IntegrationSettings {
  webhook_url?: string;
  api_endpoints: string[];
  external_services: ExternalServiceConfig[];
  data_sources: DataSourceConfig[];
}

interface ExternalServiceConfig {
  name: string;
  url: string;
  auth_type: 'none' | 'api_key' | 'oauth' | 'basic';
  credentials?: any;
  timeout: number;
  retry_count: number;
}

interface DataSourceConfig {
  name: string;
  type: 'database' | 'api' | 'file' | 'search_engine';
  connection_string?: string;
  query_template?: string;
  update_frequency: string;
  priority: number;
}

interface MonitoringSettings {
  enable_analytics: boolean;
  log_level: 'debug' | 'info' | 'warn' | 'error';
  metrics_collection: boolean;
  alert_thresholds: AlertThreshold[];
  dashboard_enabled: boolean;
}

interface AlertThreshold {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  notification_channels: string[];
}

interface ResponLayanan<T = any> {
  success: boolean;
  data?: T;
  message: string;
  errors?: string[];
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

// Main Service Class
class LayananChatbot {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private konfigurasi!: KonfigurasiChatbot;

  constructor() {
    this.loadConfiguration();
    this.initializeChatbot();
  }

  // Main Methods
  async prosesTambahKnowledge(dataKnowledge: Partial<DataKnowledge>): Promise<ResponLayanan<DataKnowledge>> {
    try {
      await this.simulateApiDelay(800);

      // Validate input data
      const validation = this.validateKnowledgeData(dataKnowledge);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Data knowledge tidak valid',
          errors: validation.errors,
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Check for duplicates
      const duplicateCheck = await this.checkDuplicateKnowledge(dataKnowledge);
      if (duplicateCheck.isDuplicate) {
        return {
          success: false,
          message: 'Knowledge dengan konten serupa sudah ada',
          errors: [`Duplicate found: ${duplicateCheck.similarId}`],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Process and enhance knowledge
      const processedKnowledge = await this.processKnowledgeData(dataKnowledge);
      
      // Generate relations
      const relations = await this.generateKnowledgeRelations(processedKnowledge);
      processedKnowledge.relasi = relations;

      // Validate processed knowledge
      const finalValidation = await this.validateProcessedKnowledge(processedKnowledge);
      processedKnowledge.validasi = finalValidation;

      // Save to knowledge base
      const savedKnowledge = await this.saveKnowledgeToBase(processedKnowledge);

      // Update search index
      await this.updateSearchIndex(savedKnowledge);

      // Train model with new knowledge
      await this.trainModelWithKnowledge(savedKnowledge);

      this.logActivity('Knowledge berhasil ditambahkan', {
        id: savedKnowledge.id,
        kategori: savedKnowledge.kategori,
        prioritas: savedKnowledge.prioritas
      });

      return {
        success: true,
        data: savedKnowledge,
        message: 'Knowledge berhasil ditambahkan',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error tambah knowledge', error);
      return {
        success: false,
        message: 'Gagal menambahkan knowledge',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };
    }
  }

  async prosesHapusKnowledge(idKnowledge: string): Promise<ResponLayanan<boolean>> {
    try {
      await this.simulateApiDelay(600);

      // Validate knowledge ID
      if (!idKnowledge || idKnowledge.trim() === '') {
        return {
          success: false,
          message: 'ID knowledge tidak valid',
          errors: ['ID knowledge harus diisi'],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Check if knowledge exists
      const existingKnowledge = await this.getKnowledgeById(idKnowledge);
      if (!existingKnowledge) {
        return {
          success: false,
          message: 'Knowledge tidak ditemukan',
          errors: [`Knowledge dengan ID ${idKnowledge} tidak ditemukan`],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Check dependencies
      const dependencies = await this.checkKnowledgeDependencies(idKnowledge);
      if (dependencies.hasDependent) {
        return {
          success: false,
          message: 'Knowledge memiliki dependensi',
          errors: [`Knowledge digunakan oleh: ${dependencies.dependentIds.join(', ')}`],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Create backup before deletion
      await this.backupKnowledge(existingKnowledge);

      // Remove from search index
      await this.removeFromSearchIndex(idKnowledge);

      // Update related knowledge
      await this.updateRelatedKnowledge(idKnowledge);

      // Delete from knowledge base
      const deleted = await this.deleteFromKnowledgeBase(idKnowledge);

      // Retrain model
      await this.retrainModelAfterDeletion(idKnowledge);

      // Clear related cache
      this.clearRelatedCache(idKnowledge);

      this.logActivity('Knowledge berhasil dihapus', {
        id: idKnowledge,
        kategori: existingKnowledge.kategori,
        backup_created: true
      });

      return {
        success: true,
        data: deleted,
        message: 'Knowledge berhasil dihapus',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error hapus knowledge', error);
      return {
        success: false,
        message: 'Gagal menghapus knowledge',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };
    }
  }

  async ambilPertanyaanTidakTerjawab(): Promise<ResponLayanan<PertanyaanTidakTerjawab[]>> {
    try {
      await this.simulateApiDelay(500);

      const cacheKey = 'unanswered_questions';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Pertanyaan tidak terjawab berhasil diambil dari cache',
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Get unanswered questions from database
      const unansweredQuestions = await this.fetchUnansweredQuestions();

      // Analyze and categorize questions
      const analyzedQuestions = await this.analyzeUnansweredQuestions(unansweredQuestions);

      // Generate suggested answers
      const questionsWithSuggestions = await this.generateSuggestedAnswers(analyzedQuestions);

      // Sort by priority and frequency
      const sortedQuestions = this.sortQuestionsByPriority(questionsWithSuggestions);

      this.setCache(cacheKey, sortedQuestions);

      this.logActivity('Pertanyaan tidak terjawab berhasil diambil', {
        total: sortedQuestions.length,
        high_priority: sortedQuestions.filter(q => q.prioritas === 'tinggi').length,
        critical: sortedQuestions.filter(q => q.prioritas === 'kritis').length
      });

      return {
        success: true,
        data: sortedQuestions,
        message: 'Pertanyaan tidak terjawab berhasil diambil',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error ambil pertanyaan tidak terjawab', error);
      return {
        success: false,
        message: 'Gagal mengambil pertanyaan tidak terjawab',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };
    }
  }

  async jalankanTestChatbot(): Promise<ResponLayanan<HasilTestChatbot>> {
    try {
      await this.simulateApiDelay(2000);

      const testId = this.generateTestId();
      const startTime = Date.now();

      // Initialize test environment
      await this.initializeTestEnvironment();

      // Run different types of tests
      const unitTests = await this.runUnitTests();
      const integrationTests = await this.runIntegrationTests();
      const performanceTests = await this.runPerformanceTests();
      const accuracyTests = await this.runAccuracyTests();

      // Combine all test results
      const allTests = [
        ...unitTests,
        ...integrationTests,
        ...performanceTests,
        ...accuracyTests
      ];

      // Calculate overall statistics
      const statistik = this.calculateTestStatistics(allTests);

      // Generate recommendations
      const rekomendasi = this.generateTestRecommendations(allTests, statistik);

      // Determine overall status
      const status = this.determineTestStatus(statistik);

      const endTime = Date.now();
      const durasi = endTime - startTime;

      const hasilTest: HasilTestChatbot = {
        id: testId,
        timestamp: new Date().toISOString(),
        jenis_test: 'comprehensive',
        status,
        skor_keseluruhan: statistik.success_rate,
        detail_test: allTests,
        statistik,
        rekomendasi,
        durasi,
        environment: 'test',
        versi_chatbot: '1.0.0'
      };

      // Save test results
      await this.saveTestResults(hasilTest);

      this.logActivity('Test chatbot berhasil dijalankan', {
        id: testId,
        status,
        skor: statistik.success_rate,
        durasi,
        total_tests: statistik.total_tests
      });

      return {
        success: true,
        data: hasilTest,
        message: 'Test chatbot berhasil dijalankan',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error jalankan test chatbot', error);
      return {
        success: false,
        message: 'Gagal menjalankan test chatbot',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };
    }
  }

  async testResponsKnowledge(): Promise<ResponLayanan<HasilTestKnowledge[]>> {
    try {
      await this.simulateApiDelay(1500);

      // Get all active knowledge
      const activeKnowledge = await this.getActiveKnowledge();

      if (activeKnowledge.length === 0) {
        return {
          success: true,
          data: [],
          message: 'Tidak ada knowledge aktif untuk ditest',
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      const testResults: HasilTestKnowledge[] = [];

      // Test each knowledge item
      for (const knowledge of activeKnowledge) {
        try {
          const testResult = await this.testSingleKnowledge(knowledge);
          testResults.push(testResult);
        } catch (error) {
          this.logActivity('Error testing knowledge', { knowledgeId: knowledge.id, error });
        }
      }

      // Generate overall insights
      const overallInsights = this.generateKnowledgeTestInsights(testResults);

      this.logActivity('Test respons knowledge berhasil dijalankan', {
        total_knowledge: activeKnowledge.length,
        tested: testResults.length,
        average_score: overallInsights.averageScore,
        issues_found: overallInsights.totalIssues
      });

      return {
        success: true,
        data: testResults,
        message: 'Test respons knowledge berhasil dijalankan',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error test respons knowledge', error);
      return {
        success: false,
        message: 'Gagal menjalankan test respons knowledge',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };
    }
  }

  // Additional Methods
  async updateKnowledge(idKnowledge: string, dataUpdate: Partial<DataKnowledge>): Promise<ResponLayanan<DataKnowledge>> {
    try {
      await this.simulateApiDelay(700);

      const existingKnowledge = await this.getKnowledgeById(idKnowledge);
      if (!existingKnowledge) {
        return {
          success: false,
          message: 'Knowledge tidak ditemukan',
          errors: [`Knowledge dengan ID ${idKnowledge} tidak ditemukan`],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Validate update data
      const validation = this.validateKnowledgeUpdate(dataUpdate);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Data update tidak valid',
          errors: validation.errors,
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Create backup
      await this.backupKnowledge(existingKnowledge);

      // Merge updates
      const updatedKnowledge = await this.mergeKnowledgeUpdates(existingKnowledge, dataUpdate);

      // Re-validate
      const finalValidation = await this.validateProcessedKnowledge(updatedKnowledge);
      updatedKnowledge.validasi = finalValidation;

      // Update in knowledge base
      const savedKnowledge = await this.updateKnowledgeInBase(updatedKnowledge);

      // Update search index
      await this.updateSearchIndex(savedKnowledge);

      // Retrain model
      await this.retrainModelWithUpdatedKnowledge(savedKnowledge);

      this.logActivity('Knowledge berhasil diupdate', {
        id: idKnowledge,
        changes: Object.keys(dataUpdate)
      });

      return {
        success: true,
        data: savedKnowledge,
        message: 'Knowledge berhasil diupdate',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error update knowledge', error);
      return {
        success: false,
        message: 'Gagal mengupdate knowledge',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };
    }
  }

  async getKnowledgeStatistics(): Promise<ResponLayanan<any>> {
    try {
      await this.simulateApiDelay(400);

      const cacheKey = 'knowledge_statistics';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Statistik knowledge berhasil diambil dari cache',
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      const statistics = await this.calculateKnowledgeStatistics();
      this.setCache(cacheKey, statistics);

      return {
        success: true,
        data: statistics,
        message: 'Statistik knowledge berhasil diambil',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error get knowledge statistics', error);
      return {
        success: false,
        message: 'Gagal mengambil statistik knowledge',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };
    }
  }

  // Private Methods
  private validateKnowledgeData(data: Partial<DataKnowledge>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.judul || data.judul.trim() === '') {
      errors.push('Judul knowledge harus diisi');
    }

    if (!data.kategori || data.kategori.trim() === '') {
      errors.push('Kategori knowledge harus diisi');
    }

    if (!data.pertanyaan || data.pertanyaan.length === 0) {
      errors.push('Minimal satu pertanyaan harus diisi');
    }

    if (!data.jawaban || data.jawaban.trim() === '') {
      errors.push('Jawaban knowledge harus diisi');
    }

    if (data.pertanyaan) {
      for (const pertanyaan of data.pertanyaan) {
        if (!pertanyaan || pertanyaan.trim() === '') {
          errors.push('Pertanyaan tidak boleh kosong');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private async checkDuplicateKnowledge(data: Partial<DataKnowledge>): Promise<{ isDuplicate: boolean; similarId?: string }> {
    // Simulate duplicate check
    await this.simulateApiDelay(200);
    
    const isDuplicate = Math.random() < 0.1; // 10% chance of duplicate
    return {
      isDuplicate,
      similarId: isDuplicate ? `knowledge_${Math.floor(Math.random() * 1000)}` : undefined
    };
  }

  private async processKnowledgeData(data: Partial<DataKnowledge>): Promise<DataKnowledge> {
    const now = new Date().toISOString();
    
    return {
      id: this.generateKnowledgeId(),
      judul: data.judul || '',
      kategori: data.kategori || '',
      subkategori: data.subkategori,
      pertanyaan: data.pertanyaan || [],
      jawaban: data.jawaban || '',
      konteks: data.konteks,
      tags: data.tags || [],
      prioritas: data.prioritas || 'sedang',
      status: data.status || 'draft',
      confidence: 0.8,
      usage_count: 0,
      success_rate: 0,
      feedback_score: 0,
      metadata: {
        bahasa: 'id',
        domain: ['showroom', 'mobil'],
        kompleksitas: 'menengah',
        akurasi: 0.8,
        relevansi: 0.9,
        freshness: 1.0,
        source_reliability: 0.9,
        update_frequency: 'manual'
      },
      validasi: {
        grammar_check: false,
        fact_check: false,
        consistency_check: false,
        completeness_check: false,
        relevance_check: false,
        last_validated: now,
        validator: 'system',
        validation_score: 0,
        issues: []
      },
      riwayat: [{
        id: this.generateHistoryId(),
        aksi: 'create',
        deskripsi: 'Knowledge dibuat',
        user: 'system',
        timestamp: now
      }],
      relasi: [],
      media: data.media,
      pembuat: {
        id: 'system',
        nama: 'System',
        role: 'admin'
      },
      terakhir_update: now,
      tanggal_dibuat: now,
      versi: '1.0'
    };
  }

  private async generateKnowledgeRelations(knowledge: DataKnowledge): Promise<RelasiKnowledge[]> {
    // Simulate relation generation
    await this.simulateApiDelay(300);
    
    const relations: RelasiKnowledge[] = [];
    
    // Generate some mock relations
    for (let i = 0; i < Math.floor(Math.random() * 3); i++) {
      relations.push({
        id: this.generateRelationId(),
        jenis: ['related', 'alternative', 'follow_up'][Math.floor(Math.random() * 3)] as any,
        target_id: `knowledge_${Math.floor(Math.random() * 1000)}`,
        strength: Math.random(),
        auto_generated: true
      });
    }
    
    return relations;
  }

  private async validateProcessedKnowledge(knowledge: DataKnowledge): Promise<ValidasiKnowledge> {
    await this.simulateApiDelay(400);
    
    const issues: ValidationIssue[] = [];
    
    // Simulate validation issues
    if (Math.random() < 0.2) {
      issues.push({
        jenis: 'grammar',
        severity: 'low',
        deskripsi: 'Minor grammar issues detected',
        saran: 'Review grammar and punctuation',
        status: 'open'
      });
    }
    
    return {
      grammar_check: true,
      fact_check: true,
      consistency_check: true,
      completeness_check: true,
      relevance_check: true,
      last_validated: new Date().toISOString(),
      validator: 'system',
      validation_score: Math.random() * 0.3 + 0.7,
      issues
    };
  }

  private async saveKnowledgeToBase(knowledge: DataKnowledge): Promise<DataKnowledge> {
    await this.simulateApiDelay(300);
    return knowledge;
  }

  private async updateSearchIndex(knowledge: DataKnowledge): Promise<void> {
    await this.simulateApiDelay(200);
    this.logActivity('Search index updated', { knowledgeId: knowledge.id });
  }

  private async trainModelWithKnowledge(knowledge: DataKnowledge): Promise<void> {
    await this.simulateApiDelay(500);
    this.logActivity('Model trained with new knowledge', { knowledgeId: knowledge.id });
  }

  private async getKnowledgeById(id: string): Promise<DataKnowledge | null> {
    await this.simulateApiDelay(200);
    
    // Simulate knowledge retrieval
    if (Math.random() > 0.1) { // 90% chance of finding knowledge
      return this.generateMockKnowledge(id);
    }
    
    return null;
  }

  private generateMockKnowledge(id: string): DataKnowledge {
    const now = new Date().toISOString();
    
    return {
      id,
      judul: `Knowledge ${id}`,
      kategori: 'mobil',
      pertanyaan: ['Bagaimana cara membeli mobil?', 'Apa saja syarat kredit mobil?'],
      jawaban: 'Untuk membeli mobil, Anda perlu menyiapkan dokumen dan memilih metode pembayaran.',
      tags: ['mobil', 'pembelian', 'kredit'],
      prioritas: 'sedang',
      status: 'aktif',
      confidence: 0.85,
      usage_count: Math.floor(Math.random() * 100),
      success_rate: Math.random() * 0.3 + 0.7,
      feedback_score: Math.random() * 2 + 3,
      metadata: {
        bahasa: 'id',
        domain: ['showroom', 'mobil'],
        kompleksitas: 'menengah',
        akurasi: 0.8,
        relevansi: 0.9,
        freshness: 1.0,
        source_reliability: 0.9,
        update_frequency: 'manual'
      },
      validasi: {
        grammar_check: true,
        fact_check: true,
        consistency_check: true,
        completeness_check: true,
        relevance_check: true,
        last_validated: now,
        validator: 'system',
        validation_score: 0.85,
        issues: []
      },
      riwayat: [{
        id: this.generateHistoryId(),
        aksi: 'create',
        deskripsi: 'Knowledge dibuat',
        user: 'system',
        timestamp: now
      }],
      relasi: [],
      pembuat: {
        id: 'system',
        nama: 'System',
        role: 'admin'
      },
      terakhir_update: now,
      tanggal_dibuat: now,
      versi: '1.0'
    };
  }

  private async checkKnowledgeDependencies(id: string): Promise<{ hasDependent: boolean; dependentIds: string[] }> {
    await this.simulateApiDelay(200);
    
    const hasDependent = Math.random() < 0.2; // 20% chance of having dependencies
    const dependentIds = hasDependent ? [`dep_${Math.floor(Math.random() * 1000)}`] : [];
    
    return { hasDependent, dependentIds };
  }

  private async backupKnowledge(knowledge: DataKnowledge): Promise<void> {
    await this.simulateApiDelay(100);
    this.logActivity('Knowledge backed up', { knowledgeId: knowledge.id });
  }

  private async removeFromSearchIndex(id: string): Promise<void> {
    await this.simulateApiDelay(150);
    this.logActivity('Removed from search index', { knowledgeId: id });
  }

  private async updateRelatedKnowledge(id: string): Promise<void> {
    await this.simulateApiDelay(200);
    this.logActivity('Related knowledge updated', { knowledgeId: id });
  }

  private async deleteFromKnowledgeBase(id: string): Promise<boolean> {
    await this.simulateApiDelay(250);
    return true;
  }

  private async retrainModelAfterDeletion(id: string): Promise<void> {
    await this.simulateApiDelay(400);
    this.logActivity('Model retrained after deletion', { knowledgeId: id });
  }

  private async fetchUnansweredQuestions(): Promise<PertanyaanTidakTerjawab[]> {
    await this.simulateApiDelay(300);
    
    return Array.from({ length: Math.floor(Math.random() * 20) + 5 }, (_, i) => ({
      id: `unanswered_${i + 1}`,
      pertanyaan: `Pertanyaan tidak terjawab ${i + 1}`,
      session_id: `session_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      frekuensi: Math.floor(Math.random() * 10) + 1,
      confidence_level: Math.random(),
      similar_questions: [],
      suggested_answers: [],
      prioritas: ['rendah', 'sedang', 'tinggi', 'kritis'][Math.floor(Math.random() * 4)] as any,
      status: 'baru',
      feedback: [],
      metadata: {
        language: 'id'
      }
    }));
  }

  private async analyzeUnansweredQuestions(questions: PertanyaanTidakTerjawab[]): Promise<PertanyaanTidakTerjawab[]> {
    await this.simulateApiDelay(500);
    
    return questions.map(question => ({
      ...question,
      kategori_prediksi: ['mobil', 'harga', 'kredit', 'service'][Math.floor(Math.random() * 4)],
      metadata: {
        ...question.metadata,
        intent_analysis: {
          primary_intent: 'information_seeking',
          secondary_intents: ['comparison', 'pricing'],
          entities: [],
          sentiment: 'neutral',
          urgency: 'medium',
          complexity: 'moderate'
        }
      }
    }));
  }

  private async generateSuggestedAnswers(questions: PertanyaanTidakTerjawab[]): Promise<PertanyaanTidakTerjawab[]> {
    await this.simulateApiDelay(600);
    
    return questions.map(question => ({
      ...question,
      suggested_answers: [
        {
          jawaban: `Jawaban yang disarankan untuk: ${question.pertanyaan}`,
          confidence: Math.random() * 0.4 + 0.6,
          source: 'ai_model',
          reasoning: 'Based on similar questions and knowledge base'
        }
      ]
    }));
  }

  private sortQuestionsByPriority(questions: PertanyaanTidakTerjawab[]): PertanyaanTidakTerjawab[] {
    const priorityOrder = { 'kritis': 4, 'tinggi': 3, 'sedang': 2, 'rendah': 1 };
    
    return questions.sort((a, b) => {
      const priorityDiff = priorityOrder[b.prioritas] - priorityOrder[a.prioritas];
      if (priorityDiff !== 0) return priorityDiff;
      
      return b.frekuensi - a.frekuensi;
    });
  }

  private async initializeTestEnvironment(): Promise<void> {
    await this.simulateApiDelay(200);
    this.logActivity('Test environment initialized');
  }

  private async runUnitTests(): Promise<DetailTest[]> {
    await this.simulateApiDelay(500);
    
    return Array.from({ length: 5 }, (_, i) => ({
      nama_test: `Unit Test ${i + 1}`,
      kategori: 'unit',
      status: Math.random() > 0.1 ? 'passed' : 'failed',
      skor: Math.random() * 40 + 60,
      waktu_eksekusi: Math.floor(Math.random() * 100) + 50,
      input: { test: `input_${i + 1}` },
      output_expected: { result: `expected_${i + 1}` },
      output_actual: { result: `actual_${i + 1}` }
    }));
  }

  private async runIntegrationTests(): Promise<DetailTest[]> {
    await this.simulateApiDelay(800);
    
    return Array.from({ length: 3 }, (_, i) => ({
      nama_test: `Integration Test ${i + 1}`,
      kategori: 'integration',
      status: Math.random() > 0.15 ? 'passed' : 'failed',
      skor: Math.random() * 40 + 60,
      waktu_eksekusi: Math.floor(Math.random() * 500) + 200,
      input: { test: `integration_input_${i + 1}` },
      output_expected: { result: `integration_expected_${i + 1}` },
      output_actual: { result: `integration_actual_${i + 1}` }
    }));
  }

  private async runPerformanceTests(): Promise<DetailTest[]> {
    await this.simulateApiDelay(1000);
    
    return Array.from({ length: 2 }, (_, i) => ({
      nama_test: `Performance Test ${i + 1}`,
      kategori: 'performance',
      status: Math.random() > 0.2 ? 'passed' : 'failed',
      skor: Math.random() * 40 + 60,
      waktu_eksekusi: Math.floor(Math.random() * 1000) + 500,
      input: { test: `performance_input_${i + 1}` },
      output_expected: { result: `performance_expected_${i + 1}` },
      output_actual: { result: `performance_actual_${i + 1}` }
    }));
  }

  private async runAccuracyTests(): Promise<DetailTest[]> {
    await this.simulateApiDelay(700);
    
    return Array.from({ length: 4 }, (_, i) => ({
      nama_test: `Accuracy Test ${i + 1}`,
      kategori: 'accuracy',
      status: Math.random() > 0.1 ? 'passed' : 'failed',
      skor: Math.random() * 40 + 60,
      waktu_eksekusi: Math.floor(Math.random() * 300) + 100,
      input: { test: `accuracy_input_${i + 1}` },
      output_expected: { result: `accuracy_expected_${i + 1}` },
      output_actual: { result: `accuracy_actual_${i + 1}` }
    }));
  }

  private calculateTestStatistics(tests: DetailTest[]): StatistikTest {
    const totalTests = tests.length;
    const passedTests = tests.filter(t => t.status === 'passed').length;
    const failedTests = tests.filter(t => t.status === 'failed').length;
    const skippedTests = tests.filter(t => t.status === 'skipped').length;
    
    return {
      total_tests: totalTests,
      passed_tests: passedTests,
      failed_tests: failedTests,
      skipped_tests: skippedTests,
      success_rate: (passedTests / totalTests) * 100,
      average_response_time: tests.reduce((sum, t) => sum + t.waktu_eksekusi, 0) / totalTests,
      accuracy_score: tests.reduce((sum, t) => sum + t.skor, 0) / totalTests,
      coverage_percentage: Math.random() * 20 + 80
    };
  }

  private generateTestRecommendations(tests: DetailTest[], statistik: StatistikTest): string[] {
    const recommendations: string[] = [];
    
    if (statistik.success_rate < 90) {
      recommendations.push('Improve test coverage and fix failing tests');
    }
    
    if (statistik.average_response_time > 500) {
      recommendations.push('Optimize response time performance');
    }
    
    if (statistik.accuracy_score < 80) {
      recommendations.push('Review and improve model accuracy');
    }
    
    recommendations.push('Regular testing schedule recommended');
    
    return recommendations;
  }

  private determineTestStatus(statistik: StatistikTest): 'passed' | 'failed' | 'warning' {
    if (statistik.success_rate >= 95) return 'passed';
    if (statistik.success_rate >= 80) return 'warning';
    return 'failed';
  }

  private async saveTestResults(hasil: HasilTestChatbot): Promise<void> {
    await this.simulateApiDelay(200);
    this.logActivity('Test results saved', { testId: hasil.id });
  }

  private async getActiveKnowledge(): Promise<DataKnowledge[]> {
    await this.simulateApiDelay(300);
    
    return Array.from({ length: Math.floor(Math.random() * 10) + 5 }, (_, i) => 
      this.generateMockKnowledge(`knowledge_${i + 1}`)
    );
  }

  private async testSingleKnowledge(knowledge: DataKnowledge): Promise<HasilTestKnowledge> {
    await this.simulateApiDelay(400);
    
    const testScenarios: TestScenario[] = knowledge.pertanyaan.map((pertanyaan, i) => ({
      id: `scenario_${i + 1}`,
      nama: `Test Scenario ${i + 1}`,
      deskripsi: `Test response for: ${pertanyaan}`,
      input: pertanyaan,
      expected_output: knowledge.jawaban,
      actual_output: knowledge.jawaban + ' (simulated)',
      score: Math.random() * 40 + 60,
      passed: Math.random() > 0.2,
      response_time: Math.floor(Math.random() * 500) + 100,
      confidence: Math.random() * 0.3 + 0.7
    }));
    
    const overallScore = testScenarios.reduce((sum, s) => sum + s.score, 0) / testScenarios.length;
    
    return {
      id: this.generateTestId(),
      knowledge_id: knowledge.id,
      timestamp: new Date().toISOString(),
      test_scenarios: testScenarios,
      overall_score: overallScore,
      accuracy: Math.random() * 0.3 + 0.7,
      relevance: Math.random() * 0.2 + 0.8,
      completeness: Math.random() * 0.3 + 0.7,
      consistency: Math.random() * 0.2 + 0.8,
      performance_metrics: {
        average_response_time: Math.floor(Math.random() * 300) + 100,
        max_response_time: Math.floor(Math.random() * 500) + 300,
        min_response_time: Math.floor(Math.random() * 100) + 50,
        throughput: Math.random() * 50 + 50,
        memory_usage: Math.random() * 100 + 50,
        cpu_usage: Math.random() * 50 + 25
      },
      issues_found: [],
      recommendations: ['Regular knowledge review recommended']
    };
  }

  private generateKnowledgeTestInsights(results: HasilTestKnowledge[]): any {
    const averageScore = results.reduce((sum, r) => sum + r.overall_score, 0) / results.length;
    const totalIssues = results.reduce((sum, r) => sum + r.issues_found.length, 0);
    
    return {
      averageScore,
      totalIssues,
      totalTested: results.length
    };
  }

  private validateKnowledgeUpdate(data: Partial<DataKnowledge>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (data.judul !== undefined && (!data.judul || data.judul.trim() === '')) {
      errors.push('Judul tidak boleh kosong');
    }
    
    if (data.jawaban !== undefined && (!data.jawaban || data.jawaban.trim() === '')) {
      errors.push('Jawaban tidak boleh kosong');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  private async mergeKnowledgeUpdates(existing: DataKnowledge, updates: Partial<DataKnowledge>): Promise<DataKnowledge> {
    await this.simulateApiDelay(200);
    
    const merged = { ...existing, ...updates };
    merged.terakhir_update = new Date().toISOString();
    merged.riwayat.push({
      id: this.generateHistoryId(),
      aksi: 'update',
      deskripsi: 'Knowledge diupdate',
      perubahan: updates,
      user: 'system',
      timestamp: new Date().toISOString()
    });
    
    return merged;
  }

  private async updateKnowledgeInBase(knowledge: DataKnowledge): Promise<DataKnowledge> {
    await this.simulateApiDelay(300);
    return knowledge;
  }

  private async retrainModelWithUpdatedKnowledge(knowledge: DataKnowledge): Promise<void> {
    await this.simulateApiDelay(500);
    this.logActivity('Model retrained with updated knowledge', { knowledgeId: knowledge.id });
  }

  private async calculateKnowledgeStatistics(): Promise<any> {
    await this.simulateApiDelay(400);
    
    return {
      total_knowledge: Math.floor(Math.random() * 1000) + 500,
      active_knowledge: Math.floor(Math.random() * 800) + 400,
      draft_knowledge: Math.floor(Math.random() * 100) + 50,
      categories: {
        mobil: Math.floor(Math.random() * 300) + 200,
        harga: Math.floor(Math.random() * 200) + 100,
        kredit: Math.floor(Math.random() * 150) + 75,
        service: Math.floor(Math.random() * 100) + 50
      },
      usage_stats: {
        total_queries: Math.floor(Math.random() * 10000) + 5000,
        successful_responses: Math.floor(Math.random() * 8000) + 4000,
        average_confidence: Math.random() * 0.3 + 0.7,
        user_satisfaction: Math.random() * 0.2 + 0.8
      },
      performance: {
        average_response_time: Math.floor(Math.random() * 300) + 100,
        accuracy_rate: Math.random() * 0.2 + 0.8,
        knowledge_coverage: Math.random() * 0.1 + 0.9
      }
    };
  }

  private clearRelatedCache(knowledgeId: string): void {
    const keysToDelete: string[] = [];
    
    this.cache.forEach((value, key) => {
      if (key.includes(knowledgeId) || key.includes('knowledge') || key.includes('unanswered')) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Utility Methods
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private clearCache(): void {
    this.cache.clear();
  }

  private loadConfiguration(): void {
    this.konfigurasi = {
      model_settings: {
        model_name: 'chatbot-v1',
        version: '1.0.0',
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.9,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
        stop_sequences: []
      },
      response_settings: {
        default_language: 'id',
        fallback_responses: ['Maaf, saya tidak mengerti pertanyaan Anda.'],
        confidence_threshold: 0.7,
        max_response_length: 1000,
        enable_context: true,
        context_window: 5,
        enable_memory: true,
        memory_duration: 3600000
      },
      learning_settings: {
        auto_learning: true,
        feedback_threshold: 0.8,
        update_frequency: 'daily',
        learning_rate: 0.01,
        validation_required: true,
        human_review_threshold: 0.6
      },
      security_settings: {
        content_filtering: true,
        pii_detection: true,
        rate_limiting: {
          requests_per_minute: 60,
          requests_per_hour: 1000,
          requests_per_day: 10000,
          burst_limit: 10
        },
        access_control: {
          authentication_required: false,
          authorized_domains: [],
          ip_whitelist: [],
          user_roles: ['user', 'admin']
        },
        audit_logging: true,
        encryption_enabled: true
      },
      integration_settings: {
        webhook_url: 'https://n8n-dnnilcm4zr3q.nasgor.sumopod.my.id/webhook/ce580c51-8235-4f4a-8281-45df75fbeef1/chat',
        api_endpoints: [],
        external_services: [],
        data_sources: []
      },
      monitoring_settings: {
        enable_analytics: true,
        log_level: 'info',
        metrics_collection: true,
        alert_thresholds: [],
        dashboard_enabled: true
      }
    };
  }

  private initializeChatbot(): void {
    this.logActivity('Chatbot initialized');
  }

  private async simulateApiDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateKnowledgeId(): string {
    return `knowledge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateHistoryId(): string {
    return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRelationId(): string {
    return `relation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTestId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logActivity(message: string, data?: any): void {
    console.log(`[LayananChatbot] ${message}`, data || '');
  }

  // Webhook Integration Methods
  async sendToWebhook(userMessage: string, sessionId?: string, userId?: string): Promise<{
    success: boolean;
    response?: string;
    error?: string;
    metadata?: any;
  }> {
    try {
      const webhookUrl = this.konfigurasi.integration_settings.webhook_url;

      if (!webhookUrl) {
        return {
          success: false,
          error: 'Webhook URL tidak dikonfigurasi'
        };
      }

      const payload = {
        message: userMessage,
        sessionId: sessionId || `session_${Date.now()}`,
        userId: userId || 'anonymous',
        timestamp: new Date().toISOString(),
        source: 'chatbot_widget'
      };

      this.logActivity('Mengirim pesan ke webhook', payload);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      this.logActivity('Response dari webhook diterima', data);

      // Extract response text from webhook data
      // Adjust this based on your n8n webhook response structure
      const botResponse = data.response || data.message || data.output || 'Maaf, tidak ada respons dari server.';

      return {
        success: true,
        response: botResponse,
        metadata: data
      };

    } catch (error: any) {
      this.logActivity('Error saat mengirim ke webhook', error);
      return {
        success: false,
        error: error.message || 'Terjadi kesalahan saat menghubungi webhook',
        response: 'Maaf, saya mengalami gangguan. Silakan coba lagi nanti atau hubungi admin.'
      };
    }
  }

  // Get webhook configuration
  getWebhookConfig() {
    return {
      url: this.konfigurasi.integration_settings.webhook_url,
      enabled: !!this.konfigurasi.integration_settings.webhook_url
    };
  }

  // Update webhook URL
  updateWebhookUrl(newUrl: string) {
    this.konfigurasi.integration_settings.webhook_url = newUrl;
    this.logActivity('Webhook URL diupdate', { newUrl });
  }

  // Service Info
  getServiceInfo() {
    return {
      name: 'LayananChatbot',
      version: '1.0.0',
      description: 'Service untuk mengelola operasi chatbot dan knowledge base',
      methods: [
        'prosesTambahKnowledge',
        'prosesHapusKnowledge',
        'ambilPertanyaanTidakTerjawab',
        'jalankanTestChatbot',
        'testResponsKnowledge',
        'updateKnowledge',
        'getKnowledgeStatistics'
      ]
    };
  }
}

export default LayananChatbot;