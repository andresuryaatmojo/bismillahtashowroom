// LayananUlasan.ts - Service untuk mengelola operasi ulasan dan review

// Interfaces
interface DataUlasan {
  id: string;
  mobil_id: string;
  user_id: string;
  dealer_id?: string;
  sales_id?: string;
  jenis_ulasan: 'mobil' | 'dealer' | 'sales' | 'service' | 'pengalaman_beli';
  rating: number;
  judul: string;
  konten: string;
  konten_original?: string;
  pros: string[];
  cons: string[];
  rekomendasi: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'archived';
  moderasi: ModerasiUlasan;
  metadata: MetadataUlasan;
  media: MediaUlasan[];
  interaksi: InteraksiUlasan;
  verifikasi: VerifikasiUlasan;
  riwayat: RiwayatUlasan[];
  balasan_dealer?: BalasanDealer;
  tags: string[];
  kategori_detail: KategoriDetailUlasan;
  pembuat: InfoPembuat;
  tanggal_dibuat: string;
  tanggal_update: string;
  tanggal_publish?: string;
}

interface ModerasiUlasan {
  status_moderasi: 'pending' | 'approved' | 'rejected' | 'needs_review';
  moderator_id?: string;
  alasan_moderasi?: string;
  catatan_moderator?: string;
  skor_toxicity: number;
  skor_spam: number;
  skor_relevance: number;
  flags: FlagModerasi[];
  auto_moderated: boolean;
  tanggal_moderasi?: string;
  review_required: boolean;
}

interface FlagModerasi {
  jenis: 'spam' | 'inappropriate' | 'fake' | 'offensive' | 'irrelevant' | 'duplicate';
  confidence: number;
  deskripsi: string;
  auto_detected: boolean;
}

interface MetadataUlasan {
  ip_address?: string;
  user_agent?: string;
  device_info?: string;
  location?: string;
  referrer?: string;
  session_id: string;
  purchase_verified: boolean;
  test_drive_verified: boolean;
  ownership_duration?: number;
  mileage_at_review?: number;
  purchase_date?: string;
  review_source: 'web' | 'mobile' | 'email' | 'sms' | 'social';
}

interface MediaUlasan {
  id: string;
  jenis: 'image' | 'video' | 'audio';
  url: string;
  thumbnail?: string;
  nama_file: string;
  ukuran: number;
  format: string;
  durasi?: number;
  deskripsi?: string;
  status: 'pending' | 'approved' | 'rejected';
  metadata_media?: any;
}

interface InteraksiUlasan {
  views: number;
  likes: number;
  dislikes: number;
  shares: number;
  helpful_votes: number;
  not_helpful_votes: number;
  reports: number;
  comments_count: number;
  engagement_score: number;
  viral_score: number;
}

interface VerifikasiUlasan {
  verified_purchase: boolean;
  verified_ownership: boolean;
  verified_test_drive: boolean;
  verification_method?: string;
  verification_date?: string;
  verification_score: number;
  trust_score: number;
  authenticity_score: number;
}

interface RiwayatUlasan {
  id: string;
  aksi: 'create' | 'update' | 'moderate' | 'publish' | 'archive' | 'flag' | 'respond';
  deskripsi: string;
  perubahan?: any;
  user_id: string;
  user_role: string;
  timestamp: string;
  alasan?: string;
  metadata?: any;
}

interface BalasanDealer {
  id: string;
  dealer_id: string;
  sales_id?: string;
  konten: string;
  tanggal_balasan: string;
  status: 'draft' | 'published' | 'archived';
  moderasi_balasan?: ModerasiUlasan;
}

interface KategoriDetailUlasan {
  aspek_dinilai: AspekPenilaian[];
  kategori_utama: string;
  subkategori: string[];
  tingkat_detail: 'basic' | 'detailed' | 'comprehensive';
  fokus_review: string[];
}

interface AspekPenilaian {
  aspek: string;
  rating: number;
  komentar?: string;
  bobot: number;
}

interface InfoPembuat {
  id: string;
  nama: string;
  email?: string;
  level_reviewer: 'newbie' | 'regular' | 'expert' | 'verified' | 'influencer';
  total_reviews: number;
  average_rating_given: number;
  credibility_score: number;
  badges: string[];
}

interface KriteriaPencarian {
  status?: string[];
  jenis_ulasan?: string[];
  rating_min?: number;
  rating_max?: number;
  tanggal_mulai?: string;
  tanggal_akhir?: string;
  mobil_id?: string;
  dealer_id?: string;
  user_id?: string;
  kata_kunci?: string;
  verified_only?: boolean;
  has_media?: boolean;
  has_response?: boolean;
  moderasi_status?: string[];
  sort_by?: 'tanggal' | 'rating' | 'helpful' | 'views';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface HasilPencarian {
  ulasan: DataUlasan[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  filter_terapan: FilterTerapan;
  statistik: StatistikPencarian;
  saran_pencarian: string[];
}

interface FilterTerapan {
  status: string[];
  jenis_ulasan: string[];
  rating_range: { min: number; max: number };
  tanggal_range: { mulai?: string; akhir?: string };
  verified_only: boolean;
  has_media: boolean;
  has_response: boolean;
  kata_kunci?: string;
}

interface StatistikPencarian {
  total_found: number;
  by_status: Record<string, number>;
  by_rating: Record<string, number>;
  by_jenis: Record<string, number>;
  average_rating: number;
  verified_percentage: number;
  with_media_percentage: number;
  response_rate: number;
}

interface StatistikUlasan {
  total_ulasan: number;
  by_status: Record<string, number>;
  by_jenis: Record<string, number>;
  by_rating: Record<string, number>;
  average_rating: number;
  rating_distribution: RatingDistribution[];
  trend_bulanan: TrendBulanan[];
  top_reviewers: TopReviewer[];
  popular_cars: PopularCar[];
  sentiment_analysis: SentimentAnalysis;
  moderasi_stats: ModerasiStats;
  engagement_stats: EngagementStats;
}

interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

interface TrendBulanan {
  bulan: string;
  total_ulasan: number;
  average_rating: number;
  growth_rate: number;
}

interface TopReviewer {
  user_id: string;
  nama: string;
  total_reviews: number;
  average_rating: number;
  credibility_score: number;
  badges: string[];
}

interface PopularCar {
  mobil_id: string;
  nama_mobil: string;
  total_reviews: number;
  average_rating: number;
  recommendation_rate: number;
}

interface SentimentAnalysis {
  positive_percentage: number;
  negative_percentage: number;
  neutral_percentage: number;
  sentiment_score: number;
  common_positive_words: string[];
  common_negative_words: string[];
}

interface ModerasiStats {
  pending_reviews: number;
  auto_approved: number;
  manual_approved: number;
  rejected: number;
  flagged: number;
  average_moderation_time: number;
}

interface EngagementStats {
  total_views: number;
  total_likes: number;
  total_shares: number;
  total_helpful_votes: number;
  average_engagement_rate: number;
  viral_reviews: number;
}

interface LaporanUlasan {
  id: string;
  periode: PeriodeLaporan;
  jenis_laporan: 'summary' | 'detailed' | 'trend' | 'moderation' | 'engagement';
  data: any;
  statistik: StatistikUlasan;
  insights: InsightLaporan[];
  rekomendasi: string[];
  metadata: MetadataLaporan;
  tanggal_generate: string;
}

interface PeriodeLaporan {
  mulai: string;
  akhir: string;
  jenis_periode: 'harian' | 'mingguan' | 'bulanan' | 'kuartalan' | 'tahunan' | 'custom';
}

interface InsightLaporan {
  kategori: string;
  insight: string;
  impact: 'low' | 'medium' | 'high';
  action_required: boolean;
  priority: number;
}

interface MetadataLaporan {
  generated_by: string;
  generation_time: number;
  data_sources: string[];
  filters_applied: any;
  version: string;
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
class LayananUlasan {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeService();
  }

  // Main Methods
  async ambilDataUlasanPending(): Promise<ResponLayanan<DataUlasan[]>> {
    try {
      await this.simulateApiDelay(400);

      const cacheKey = 'pending_reviews';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Data ulasan pending berhasil diambil dari cache',
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Fetch pending reviews from database
      const pendingReviews = await this.fetchPendingReviews();

      // Sort by priority and date
      const sortedReviews = this.sortReviewsByPriority(pendingReviews);

      // Add moderation insights
      const reviewsWithInsights = await this.addModerationInsights(sortedReviews);

      this.setCache(cacheKey, reviewsWithInsights);

      this.logActivity('Data ulasan pending berhasil diambil', {
        total: reviewsWithInsights.length,
        high_priority: reviewsWithInsights.filter(r => r.moderasi.review_required).length,
        auto_flagged: reviewsWithInsights.filter(r => r.moderasi.flags.length > 0).length
      });

      return {
        success: true,
        data: reviewsWithInsights,
        message: 'Data ulasan pending berhasil diambil',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error ambil data ulasan pending', error);
      return {
        success: false,
        message: 'Gagal mengambil data ulasan pending',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };
    }
  }

  async ambilDetailUlasan(idUlasan: string): Promise<ResponLayanan<DataUlasan>> {
    try {
      await this.simulateApiDelay(300);

      // Validate input
      if (!idUlasan || idUlasan.trim() === '') {
        return {
          success: false,
          message: 'ID ulasan tidak valid',
          errors: ['ID ulasan harus diisi'],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      const cacheKey = `review_detail_${idUlasan}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Detail ulasan berhasil diambil dari cache',
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Fetch review details
      const reviewDetail = await this.fetchReviewDetail(idUlasan);

      if (!reviewDetail) {
        return {
          success: false,
          message: 'Ulasan tidak ditemukan',
          errors: [`Ulasan dengan ID ${idUlasan} tidak ditemukan`],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Enrich with additional data
      const enrichedReview = await this.enrichReviewData(reviewDetail);

      // Update view count
      await this.updateViewCount(idUlasan);

      this.setCache(cacheKey, enrichedReview);

      this.logActivity('Detail ulasan berhasil diambil', {
        id: idUlasan,
        status: enrichedReview.status,
        rating: enrichedReview.rating,
        jenis: enrichedReview.jenis_ulasan
      });

      return {
        success: true,
        data: enrichedReview,
        message: 'Detail ulasan berhasil diambil',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error ambil detail ulasan', error);
      return {
        success: false,
        message: 'Gagal mengambil detail ulasan',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };
    }
  }

  async perbaruiStatusUlasan(idUlasan: string, status: string): Promise<ResponLayanan<DataUlasan>> {
    try {
      await this.simulateApiDelay(500);

      // Validate input
      const validation = this.validateStatusUpdate(idUlasan, status);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Input tidak valid',
          errors: validation.errors,
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Check if review exists
      const existingReview = await this.fetchReviewDetail(idUlasan);
      if (!existingReview) {
        return {
          success: false,
          message: 'Ulasan tidak ditemukan',
          errors: [`Ulasan dengan ID ${idUlasan} tidak ditemukan`],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Check status transition validity
      const transitionValid = this.validateStatusTransition(existingReview.status, status);
      if (!transitionValid.valid) {
        return {
          success: false,
          message: 'Transisi status tidak valid',
          errors: transitionValid.errors,
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Create backup before update
      await this.backupReview(existingReview);

      // Update status
      const updatedReview = await this.updateReviewStatus(existingReview, status);

      // Process status-specific actions
      await this.processStatusActions(updatedReview, status);

      // Clear related cache
      this.clearRelatedCache(idUlasan);

      this.logActivity('Status ulasan berhasil diperbarui', {
        id: idUlasan,
        old_status: existingReview.status,
        new_status: status,
        moderator: 'system'
      });

      return {
        success: true,
        data: updatedReview,
        message: 'Status ulasan berhasil diperbarui',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error perbarui status ulasan', error);
      return {
        success: false,
        message: 'Gagal memperbarui status ulasan',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };
    }
  }

  async perbaruiKontenUlasan(idUlasan: string, kontenBaru: string): Promise<ResponLayanan<DataUlasan>> {
    try {
      await this.simulateApiDelay(600);

      // Validate input
      const validation = this.validateContentUpdate(idUlasan, kontenBaru);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Input tidak valid',
          errors: validation.errors,
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Check if review exists
      const existingReview = await this.fetchReviewDetail(idUlasan);
      if (!existingReview) {
        return {
          success: false,
          message: 'Ulasan tidak ditemukan',
          errors: [`Ulasan dengan ID ${idUlasan} tidak ditemukan`],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Check if content can be updated
      const canUpdate = this.canUpdateContent(existingReview);
      if (!canUpdate.allowed) {
        return {
          success: false,
          message: 'Konten tidak dapat diperbarui',
          errors: canUpdate.reasons,
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Create backup
      await this.backupReview(existingReview);

      // Moderate new content
      const moderationResult = await this.moderateContent(kontenBaru);

      // Update content
      const updatedReview = await this.updateReviewContent(existingReview, kontenBaru, moderationResult);

      // Re-analyze sentiment and categorization
      await this.reanalyzeReview(updatedReview);

      // Clear related cache
      this.clearRelatedCache(idUlasan);

      this.logActivity('Konten ulasan berhasil diperbarui', {
        id: idUlasan,
        content_length: kontenBaru.length,
        moderation_score: moderationResult.skor_toxicity,
        requires_review: moderationResult.review_required
      });

      return {
        success: true,
        data: updatedReview,
        message: 'Konten ulasan berhasil diperbarui',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error perbarui konten ulasan', error);
      return {
        success: false,
        message: 'Gagal memperbarui konten ulasan',
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
  async cariUlasan(kriteria: KriteriaPencarian): Promise<ResponLayanan<HasilPencarian>> {
    try {
      await this.simulateApiDelay(400);

      // Validate search criteria
      const validation = this.validateSearchCriteria(kriteria);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Kriteria pencarian tidak valid',
          errors: validation.errors,
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      const cacheKey = this.generateSearchCacheKey(kriteria);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Hasil pencarian berhasil diambil dari cache',
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Perform search
      const searchResults = await this.performSearch(kriteria);

      this.setCache(cacheKey, searchResults);

      this.logActivity('Pencarian ulasan berhasil', {
        criteria: kriteria,
        total_found: searchResults.total,
        page: searchResults.page
      });

      return {
        success: true,
        data: searchResults,
        message: 'Pencarian ulasan berhasil',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error cari ulasan', error);
      return {
        success: false,
        message: 'Gagal melakukan pencarian ulasan',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };
    }
  }

  async ambilStatistikUlasan(): Promise<ResponLayanan<StatistikUlasan>> {
    try {
      await this.simulateApiDelay(500);

      const cacheKey = 'review_statistics';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Statistik ulasan berhasil diambil dari cache',
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      const statistics = await this.calculateReviewStatistics();
      this.setCache(cacheKey, statistics);

      return {
        success: true,
        data: statistics,
        message: 'Statistik ulasan berhasil diambil',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error ambil statistik ulasan', error);
      return {
        success: false,
        message: 'Gagal mengambil statistik ulasan',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };
    }
  }

  async buatLaporanUlasan(periode: PeriodeLaporan, jenisLaporan: string): Promise<ResponLayanan<LaporanUlasan>> {
    try {
      await this.simulateApiDelay(800);

      // Validate input
      const validation = this.validateReportRequest(periode, jenisLaporan);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Parameter laporan tidak valid',
          errors: validation.errors,
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      const report = await this.generateReport(periode, jenisLaporan);

      this.logActivity('Laporan ulasan berhasil dibuat', {
        periode: periode,
        jenis: jenisLaporan,
        total_data: report.statistik.total_ulasan
      });

      return {
        success: true,
        data: report,
        message: 'Laporan ulasan berhasil dibuat',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error buat laporan ulasan', error);
      return {
        success: false,
        message: 'Gagal membuat laporan ulasan',
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
  private async fetchPendingReviews(): Promise<DataUlasan[]> {
    await this.simulateApiDelay(200);
    
    return Array.from({ length: Math.floor(Math.random() * 15) + 5 }, (_, i) => 
      this.generateMockReview(`pending_${i + 1}`, 'pending')
    );
  }

  private sortReviewsByPriority(reviews: DataUlasan[]): DataUlasan[] {
    return reviews.sort((a, b) => {
      // Sort by flags first
      const aFlags = a.moderasi.flags.length;
      const bFlags = b.moderasi.flags.length;
      if (aFlags !== bFlags) return bFlags - aFlags;
      
      // Then by review required
      const aReview = a.moderasi.review_required ? 1 : 0;
      const bReview = b.moderasi.review_required ? 1 : 0;
      if (aReview !== bReview) return bReview - aReview;
      
      // Finally by date
      return new Date(b.tanggal_dibuat).getTime() - new Date(a.tanggal_dibuat).getTime();
    });
  }

  private async addModerationInsights(reviews: DataUlasan[]): Promise<DataUlasan[]> {
    await this.simulateApiDelay(300);
    
    return reviews.map(review => ({
      ...review,
      moderasi: {
        ...review.moderasi,
        // Add additional insights
        skor_toxicity: Math.random() * 0.3,
        skor_spam: Math.random() * 0.2,
        skor_relevance: Math.random() * 0.3 + 0.7
      }
    }));
  }

  private async fetchReviewDetail(id: string): Promise<DataUlasan | null> {
    await this.simulateApiDelay(200);
    
    // Simulate 90% success rate
    if (Math.random() > 0.1) {
      return this.generateMockReview(id);
    }
    
    return null;
  }

  private async enrichReviewData(review: DataUlasan): Promise<DataUlasan> {
    await this.simulateApiDelay(150);
    
    // Add enriched data
    return {
      ...review,
      interaksi: {
        ...review.interaksi,
        engagement_score: Math.random() * 50 + 50,
        viral_score: Math.random() * 20
      }
    };
  }

  private async updateViewCount(id: string): Promise<void> {
    await this.simulateApiDelay(50);
    this.logActivity('View count updated', { reviewId: id });
  }

  private validateStatusUpdate(id: string, status: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!id || id.trim() === '') {
      errors.push('ID ulasan harus diisi');
    }
    
    if (!status || status.trim() === '') {
      errors.push('Status harus diisi');
    }
    
    const validStatuses = ['pending', 'approved', 'rejected', 'flagged', 'archived'];
    if (status && !validStatuses.includes(status)) {
      errors.push('Status tidak valid');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  private validateStatusTransition(currentStatus: string, newStatus: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Define valid transitions
    const validTransitions: Record<string, string[]> = {
      'pending': ['approved', 'rejected', 'flagged'],
      'approved': ['archived', 'flagged'],
      'rejected': ['pending', 'archived'],
      'flagged': ['approved', 'rejected', 'archived'],
      'archived': ['pending']
    };
    
    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      errors.push(`Tidak dapat mengubah status dari ${currentStatus} ke ${newStatus}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  private async backupReview(review: DataUlasan): Promise<void> {
    await this.simulateApiDelay(100);
    this.logActivity('Review backed up', { reviewId: review.id });
  }

  private async updateReviewStatus(review: DataUlasan, newStatus: string): Promise<DataUlasan> {
    await this.simulateApiDelay(200);
    
    const now = new Date().toISOString();
    
    return {
      ...review,
      status: newStatus as any,
      tanggal_update: now,
      tanggal_publish: newStatus === 'approved' ? now : review.tanggal_publish,
      moderasi: {
        ...review.moderasi,
        status_moderasi: newStatus === 'approved' ? 'approved' : 
                        newStatus === 'rejected' ? 'rejected' : 'pending',
        tanggal_moderasi: now,
        moderator_id: 'system'
      },
      riwayat: [
        ...review.riwayat,
        {
          id: this.generateHistoryId(),
          aksi: 'moderate',
          deskripsi: `Status diubah ke ${newStatus}`,
          user_id: 'system',
          user_role: 'moderator',
          timestamp: now
        }
      ]
    };
  }

  private async processStatusActions(review: DataUlasan, status: string): Promise<void> {
    await this.simulateApiDelay(100);
    
    switch (status) {
      case 'approved':
        await this.notifyUserApproval(review);
        await this.updateSearchIndex(review);
        break;
      case 'rejected':
        await this.notifyUserRejection(review);
        break;
      case 'flagged':
        await this.notifyModerators(review);
        break;
      case 'archived':
        await this.removeFromSearchIndex(review.id);
        break;
    }
  }

  private validateContentUpdate(id: string, content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!id || id.trim() === '') {
      errors.push('ID ulasan harus diisi');
    }
    
    if (!content || content.trim() === '') {
      errors.push('Konten tidak boleh kosong');
    }
    
    if (content && content.length < 10) {
      errors.push('Konten terlalu pendek (minimal 10 karakter)');
    }
    
    if (content && content.length > 5000) {
      errors.push('Konten terlalu panjang (maksimal 5000 karakter)');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  private canUpdateContent(review: DataUlasan): { allowed: boolean; reasons: string[] } {
    const reasons: string[] = [];
    
    if (review.status === 'archived') {
      reasons.push('Ulasan yang diarsipkan tidak dapat diubah');
    }
    
    if (review.verifikasi.verified_purchase && review.status === 'approved') {
      reasons.push('Ulasan terverifikasi yang sudah disetujui tidak dapat diubah');
    }
    
    // Check if too much time has passed
    const daysSinceCreation = (Date.now() - new Date(review.tanggal_dibuat).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation > 30) {
      reasons.push('Ulasan yang sudah lebih dari 30 hari tidak dapat diubah');
    }
    
    return {
      allowed: reasons.length === 0,
      reasons
    };
  }

  private async moderateContent(content: string): Promise<ModerasiUlasan> {
    await this.simulateApiDelay(300);
    
    // Simulate content moderation
    const toxicityScore = Math.random() * 0.3;
    const spamScore = Math.random() * 0.2;
    const relevanceScore = Math.random() * 0.3 + 0.7;
    
    const flags: FlagModerasi[] = [];
    
    if (toxicityScore > 0.2) {
      flags.push({
        jenis: 'inappropriate',
        confidence: toxicityScore,
        deskripsi: 'Potentially inappropriate content detected',
        auto_detected: true
      });
    }
    
    if (spamScore > 0.15) {
      flags.push({
        jenis: 'spam',
        confidence: spamScore,
        deskripsi: 'Potential spam content detected',
        auto_detected: true
      });
    }
    
    return {
      status_moderasi: flags.length > 0 ? 'needs_review' : 'approved',
      skor_toxicity: toxicityScore,
      skor_spam: spamScore,
      skor_relevance: relevanceScore,
      flags,
      auto_moderated: true,
      review_required: flags.length > 0,
      tanggal_moderasi: new Date().toISOString()
    };
  }

  private async updateReviewContent(review: DataUlasan, newContent: string, moderation: ModerasiUlasan): Promise<DataUlasan> {
    await this.simulateApiDelay(250);
    
    const now = new Date().toISOString();
    
    return {
      ...review,
      konten: newContent,
      konten_original: review.konten_original || review.konten,
      moderasi: moderation,
      status: moderation.review_required ? 'pending' : review.status,
      tanggal_update: now,
      riwayat: [
        ...review.riwayat,
        {
          id: this.generateHistoryId(),
          aksi: 'update',
          deskripsi: 'Konten ulasan diperbarui',
          user_id: 'system',
          user_role: 'moderator',
          timestamp: now
        }
      ]
    };
  }

  private async reanalyzeReview(review: DataUlasan): Promise<void> {
    await this.simulateApiDelay(200);
    this.logActivity('Review reanalyzed', { reviewId: review.id });
  }

  private generateMockReview(id: string, status?: string): DataUlasan {
    const now = new Date().toISOString();
    const reviewStatus = status || ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)];
    
    return {
      id,
      mobil_id: `mobil_${Math.floor(Math.random() * 100)}`,
      user_id: `user_${Math.floor(Math.random() * 1000)}`,
      dealer_id: `dealer_${Math.floor(Math.random() * 50)}`,
      jenis_ulasan: ['mobil', 'dealer', 'sales', 'service'][Math.floor(Math.random() * 4)] as any,
      rating: Math.floor(Math.random() * 5) + 1,
      judul: `Review ${id}`,
      konten: `Ini adalah konten review untuk ${id}. Pengalaman yang sangat baik dengan pelayanan yang memuaskan.`,
      pros: ['Pelayanan baik', 'Harga kompetitif', 'Kualitas terjamin'],
      cons: ['Waktu tunggu agak lama', 'Parkir terbatas'],
      rekomendasi: Math.random() > 0.3,
      status: reviewStatus as any,
      moderasi: {
        status_moderasi: reviewStatus === 'approved' ? 'approved' : 'pending',
        skor_toxicity: Math.random() * 0.2,
        skor_spam: Math.random() * 0.1,
        skor_relevance: Math.random() * 0.3 + 0.7,
        flags: [],
        auto_moderated: true,
        review_required: Math.random() > 0.7,
        tanggal_moderasi: now
      },
      metadata: {
        session_id: `session_${Math.floor(Math.random() * 1000)}`,
        purchase_verified: Math.random() > 0.5,
        test_drive_verified: Math.random() > 0.6,
        review_source: 'web'
      },
      media: [],
      interaksi: {
        views: Math.floor(Math.random() * 1000),
        likes: Math.floor(Math.random() * 100),
        dislikes: Math.floor(Math.random() * 10),
        shares: Math.floor(Math.random() * 20),
        helpful_votes: Math.floor(Math.random() * 50),
        not_helpful_votes: Math.floor(Math.random() * 5),
        reports: Math.floor(Math.random() * 2),
        comments_count: Math.floor(Math.random() * 10),
        engagement_score: Math.random() * 100,
        viral_score: Math.random() * 20
      },
      verifikasi: {
        verified_purchase: Math.random() > 0.4,
        verified_ownership: Math.random() > 0.6,
        verified_test_drive: Math.random() > 0.5,
        verification_score: Math.random() * 0.4 + 0.6,
        trust_score: Math.random() * 0.3 + 0.7,
        authenticity_score: Math.random() * 0.2 + 0.8
      },
      riwayat: [{
        id: this.generateHistoryId(),
        aksi: 'create',
        deskripsi: 'Ulasan dibuat',
        user_id: `user_${Math.floor(Math.random() * 1000)}`,
        user_role: 'user',
        timestamp: now
      }],
      tags: ['mobil', 'review', 'pengalaman'],
      kategori_detail: {
        aspek_dinilai: [
          { aspek: 'Kualitas', rating: Math.floor(Math.random() * 5) + 1, bobot: 0.3 },
          { aspek: 'Pelayanan', rating: Math.floor(Math.random() * 5) + 1, bobot: 0.3 },
          { aspek: 'Harga', rating: Math.floor(Math.random() * 5) + 1, bobot: 0.4 }
        ],
        kategori_utama: 'mobil',
        subkategori: ['sedan', 'suv'],
        tingkat_detail: 'detailed',
        fokus_review: ['kualitas', 'pelayanan']
      },
      pembuat: {
        id: `user_${Math.floor(Math.random() * 1000)}`,
        nama: `User ${Math.floor(Math.random() * 1000)}`,
        level_reviewer: 'regular',
        total_reviews: Math.floor(Math.random() * 20) + 1,
        average_rating_given: Math.random() * 2 + 3,
        credibility_score: Math.random() * 0.3 + 0.7,
        badges: ['verified_buyer']
      },
      tanggal_dibuat: now,
      tanggal_update: now,
      tanggal_publish: reviewStatus === 'approved' ? now : undefined
    };
  }

  private validateSearchCriteria(criteria: KriteriaPencarian): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (criteria.rating_min !== undefined && (criteria.rating_min < 1 || criteria.rating_min > 5)) {
      errors.push('Rating minimum harus antara 1-5');
    }
    
    if (criteria.rating_max !== undefined && (criteria.rating_max < 1 || criteria.rating_max > 5)) {
      errors.push('Rating maksimum harus antara 1-5');
    }
    
    if (criteria.rating_min !== undefined && criteria.rating_max !== undefined && 
        criteria.rating_min > criteria.rating_max) {
      errors.push('Rating minimum tidak boleh lebih besar dari rating maksimum');
    }
    
    if (criteria.page !== undefined && criteria.page < 1) {
      errors.push('Halaman harus dimulai dari 1');
    }
    
    if (criteria.limit !== undefined && (criteria.limit < 1 || criteria.limit > 100)) {
      errors.push('Limit harus antara 1-100');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  private generateSearchCacheKey(criteria: KriteriaPencarian): string {
    return `search_${JSON.stringify(criteria)}`.replace(/[^a-zA-Z0-9]/g, '_');
  }

  private async performSearch(criteria: KriteriaPencarian): Promise<HasilPencarian> {
    await this.simulateApiDelay(300);
    
    const page = criteria.page || 1;
    const limit = criteria.limit || 20;
    const totalResults = Math.floor(Math.random() * 500) + 100;
    const totalPages = Math.ceil(totalResults / limit);
    
    // Generate mock results
    const results = Array.from({ length: Math.min(limit, totalResults) }, (_, i) => 
      this.generateMockReview(`search_${page}_${i + 1}`)
    );
    
    return {
      ulasan: results,
      total: totalResults,
      page,
      limit,
      total_pages: totalPages,
      has_next: page < totalPages,
      has_prev: page > 1,
      filter_terapan: {
        status: criteria.status || [],
        jenis_ulasan: criteria.jenis_ulasan || [],
        rating_range: {
          min: criteria.rating_min || 1,
          max: criteria.rating_max || 5
        },
        tanggal_range: {
          mulai: criteria.tanggal_mulai,
          akhir: criteria.tanggal_akhir
        },
        verified_only: criteria.verified_only || false,
        has_media: criteria.has_media || false,
        has_response: criteria.has_response || false,
        kata_kunci: criteria.kata_kunci
      },
      statistik: {
        total_found: totalResults,
        by_status: {
          'pending': Math.floor(totalResults * 0.2),
          'approved': Math.floor(totalResults * 0.6),
          'rejected': Math.floor(totalResults * 0.1),
          'flagged': Math.floor(totalResults * 0.1)
        },
        by_rating: {
          '1': Math.floor(totalResults * 0.05),
          '2': Math.floor(totalResults * 0.1),
          '3': Math.floor(totalResults * 0.2),
          '4': Math.floor(totalResults * 0.35),
          '5': Math.floor(totalResults * 0.3)
        },
        by_jenis: {
          'mobil': Math.floor(totalResults * 0.5),
          'dealer': Math.floor(totalResults * 0.3),
          'sales': Math.floor(totalResults * 0.1),
          'service': Math.floor(totalResults * 0.1)
        },
        average_rating: Math.random() * 1.5 + 3.5,
        verified_percentage: Math.random() * 30 + 50,
        with_media_percentage: Math.random() * 20 + 10,
        response_rate: Math.random() * 40 + 30
      },
      saran_pencarian: ['Coba filter berdasarkan rating', 'Gunakan kata kunci yang lebih spesifik']
    };
  }

  private async calculateReviewStatistics(): Promise<StatistikUlasan> {
    await this.simulateApiDelay(400);
    
    const totalReviews = Math.floor(Math.random() * 10000) + 5000;
    
    return {
      total_ulasan: totalReviews,
      by_status: {
        'pending': Math.floor(totalReviews * 0.15),
        'approved': Math.floor(totalReviews * 0.7),
        'rejected': Math.floor(totalReviews * 0.1),
        'flagged': Math.floor(totalReviews * 0.05)
      },
      by_jenis: {
        'mobil': Math.floor(totalReviews * 0.6),
        'dealer': Math.floor(totalReviews * 0.25),
        'sales': Math.floor(totalReviews * 0.1),
        'service': Math.floor(totalReviews * 0.05)
      },
      by_rating: {
        '1': Math.floor(totalReviews * 0.05),
        '2': Math.floor(totalReviews * 0.08),
        '3': Math.floor(totalReviews * 0.15),
        '4': Math.floor(totalReviews * 0.35),
        '5': Math.floor(totalReviews * 0.37)
      },
      average_rating: Math.random() * 1 + 4,
      rating_distribution: [
        { rating: 1, count: Math.floor(totalReviews * 0.05), percentage: 5 },
        { rating: 2, count: Math.floor(totalReviews * 0.08), percentage: 8 },
        { rating: 3, count: Math.floor(totalReviews * 0.15), percentage: 15 },
        { rating: 4, count: Math.floor(totalReviews * 0.35), percentage: 35 },
        { rating: 5, count: Math.floor(totalReviews * 0.37), percentage: 37 }
      ],
      trend_bulanan: Array.from({ length: 12 }, (_, i) => ({
        bulan: `2024-${String(i + 1).padStart(2, '0')}`,
        total_ulasan: Math.floor(Math.random() * 500) + 200,
        average_rating: Math.random() * 1 + 4,
        growth_rate: Math.random() * 20 - 10
      })),
      top_reviewers: Array.from({ length: 10 }, (_, i) => ({
        user_id: `user_${i + 1}`,
        nama: `Top Reviewer ${i + 1}`,
        total_reviews: Math.floor(Math.random() * 100) + 50,
        average_rating: Math.random() * 1 + 4,
        credibility_score: Math.random() * 0.3 + 0.7,
        badges: ['verified_buyer', 'expert_reviewer']
      })),
      popular_cars: Array.from({ length: 10 }, (_, i) => ({
        mobil_id: `mobil_${i + 1}`,
        nama_mobil: `Popular Car ${i + 1}`,
        total_reviews: Math.floor(Math.random() * 200) + 100,
        average_rating: Math.random() * 1 + 4,
        recommendation_rate: Math.random() * 30 + 70
      })),
      sentiment_analysis: {
        positive_percentage: Math.random() * 20 + 60,
        negative_percentage: Math.random() * 15 + 10,
        neutral_percentage: Math.random() * 15 + 15,
        sentiment_score: Math.random() * 0.4 + 0.6,
        common_positive_words: ['bagus', 'memuaskan', 'recommended', 'berkualitas'],
        common_negative_words: ['lambat', 'mahal', 'kurang', 'kecewa']
      },
      moderasi_stats: {
        pending_reviews: Math.floor(totalReviews * 0.15),
        auto_approved: Math.floor(totalReviews * 0.5),
        manual_approved: Math.floor(totalReviews * 0.2),
        rejected: Math.floor(totalReviews * 0.1),
        flagged: Math.floor(totalReviews * 0.05),
        average_moderation_time: Math.random() * 24 + 2
      },
      engagement_stats: {
        total_views: Math.floor(Math.random() * 100000) + 50000,
        total_likes: Math.floor(Math.random() * 10000) + 5000,
        total_shares: Math.floor(Math.random() * 2000) + 1000,
        total_helpful_votes: Math.floor(Math.random() * 5000) + 2500,
        average_engagement_rate: Math.random() * 10 + 5,
        viral_reviews: Math.floor(Math.random() * 50) + 10
      }
    };
  }

  private validateReportRequest(periode: PeriodeLaporan, jenis: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!periode.mulai) {
      errors.push('Tanggal mulai periode harus diisi');
    }
    
    if (!periode.akhir) {
      errors.push('Tanggal akhir periode harus diisi');
    }
    
    if (periode.mulai && periode.akhir && new Date(periode.mulai) > new Date(periode.akhir)) {
      errors.push('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
    }
    
    const validTypes = ['summary', 'detailed', 'trend', 'moderation', 'engagement'];
    if (!validTypes.includes(jenis)) {
      errors.push('Jenis laporan tidak valid');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  private async generateReport(periode: PeriodeLaporan, jenis: string): Promise<LaporanUlasan> {
    await this.simulateApiDelay(600);
    
    const statistics = await this.calculateReviewStatistics();
    
    return {
      id: this.generateReportId(),
      periode,
      jenis_laporan: jenis as any,
      data: {
        // Report specific data would go here
        summary: 'Laporan ulasan untuk periode yang dipilih',
        key_metrics: {
          total_reviews: statistics.total_ulasan,
          average_rating: statistics.average_rating,
          approval_rate: 85
        }
      },
      statistik: statistics,
      insights: [
        {
          kategori: 'trend',
          insight: 'Peningkatan ulasan positif sebesar 15% dibanding periode sebelumnya',
          impact: 'high',
          action_required: false,
          priority: 1
        },
        {
          kategori: 'moderation',
          insight: 'Waktu moderasi rata-rata meningkat menjadi 4 jam',
          impact: 'medium',
          action_required: true,
          priority: 2
        }
      ],
      rekomendasi: [
        'Pertahankan kualitas pelayanan untuk mempertahankan rating tinggi',
        'Tingkatkan efisiensi proses moderasi',
        'Fokus pada peningkatan engagement rate'
      ],
      metadata: {
        generated_by: 'system',
        generation_time: 600,
        data_sources: ['reviews_db', 'analytics_db'],
        filters_applied: { periode },
        version: '1.0.0'
      },
      tanggal_generate: new Date().toISOString()
    };
  }

  private async notifyUserApproval(review: DataUlasan): Promise<void> {
    await this.simulateApiDelay(100);
    this.logActivity('User notified of approval', { reviewId: review.id });
  }

  private async notifyUserRejection(review: DataUlasan): Promise<void> {
    await this.simulateApiDelay(100);
    this.logActivity('User notified of rejection', { reviewId: review.id });
  }

  private async notifyModerators(review: DataUlasan): Promise<void> {
    await this.simulateApiDelay(100);
    this.logActivity('Moderators notified', { reviewId: review.id });
  }

  private async updateSearchIndex(review: DataUlasan): Promise<void> {
    await this.simulateApiDelay(150);
    this.logActivity('Search index updated', { reviewId: review.id });
  }

  private async removeFromSearchIndex(id: string): Promise<void> {
    await this.simulateApiDelay(100);
    this.logActivity('Removed from search index', { reviewId: id });
  }

  private clearRelatedCache(reviewId: string): void {
    const keysToDelete: string[] = [];
    
    for (const [key] of Array.from(this.cache)) {
      if (key.includes(reviewId) || key.includes('review') || key.includes('pending')) {
        keysToDelete.push(key);
      }
    }
    
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

  private initializeService(): void {
    this.logActivity('LayananUlasan initialized');
  }

  private async simulateApiDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateHistoryId(): string {
    return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateReportId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logActivity(message: string, data?: any): void {
    console.log(`[LayananUlasan] ${message}`, data || '');
  }

  // Service Info
  getServiceInfo() {
    return {
      name: 'LayananUlasan',
      version: '1.0.0',
      description: 'Service untuk mengelola operasi ulasan dan review',
      methods: [
        'ambilDataUlasanPending',
        'ambilDetailUlasan',
        'perbaruiStatusUlasan',
        'perbaruiKontenUlasan',
        'cariUlasan',
        'ambilStatistikUlasan',
        'buatLaporanUlasan'
      ]
    };
  }
}

export default LayananUlasan;