// LayananKonten.ts - Service untuk mengelola operasi terkait konten

// Interfaces
interface DataKonten {
  id: string;
  judul: string;
  slug: string;
  konten: string;
  ringkasan: string;
  jenis: 'artikel' | 'berita' | 'promosi' | 'panduan' | 'faq' | 'testimoni';
  kategori: string;
  tags: string[];
  status: 'draft' | 'review' | 'published' | 'archived' | 'deleted';
  prioritas: 'rendah' | 'normal' | 'tinggi' | 'urgent';
  penulis: InfoPenulis;
  editor?: InfoEditor;
  tanggalBuat: string;
  tanggalUpdate: string;
  tanggalPublish?: string;
  tanggalExpire?: string;
  media: MediaKonten[];
  metadata: MetadataKonten;
  seo: SEOKonten;
  interaksi: InteraksiKonten;
  pengaturan: PengaturanKonten;
  versi: VersiKonten[];
  workflow: WorkflowKonten;
}

interface InfoPenulis {
  id: string;
  nama: string;
  email: string;
  foto: string;
  bio: string;
  role: string;
}

interface InfoEditor {
  id: string;
  nama: string;
  email: string;
  tanggalEdit: string;
  catatan: string;
}

interface MediaKonten {
  id: string;
  jenis: 'gambar' | 'video' | 'audio' | 'dokumen';
  nama: string;
  url: string;
  ukuran: number;
  format: string;
  alt?: string;
  caption?: string;
  posisi: number;
}

interface MetadataKonten {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  readTime: number;
  difficulty: 'mudah' | 'sedang' | 'sulit';
  target: string[];
  bahasa: string;
  region: string[];
}

interface SEOKonten {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  schema?: any;
}

interface InteraksiKonten {
  allowComments: boolean;
  allowSharing: boolean;
  allowRating: boolean;
  moderateComments: boolean;
  notifyAuthor: boolean;
}

interface PengaturanKonten {
  featured: boolean;
  sticky: boolean;
  private: boolean;
  passwordProtected: boolean;
  password?: string;
  memberOnly: boolean;
  ageRestriction?: number;
}

interface VersiKonten {
  id: string;
  versi: number;
  konten: string;
  tanggal: string;
  penulis: string;
  catatan: string;
  status: 'current' | 'archived';
}

interface WorkflowKonten {
  currentStep: string;
  steps: WorkflowStep[];
  approvers: string[];
  deadline?: string;
  notes: string[];
}

interface WorkflowStep {
  id: string;
  nama: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  assignee: string;
  tanggal?: string;
  catatan?: string;
}

interface KriteriaKonten {
  jenis?: string[];
  kategori?: string[];
  status?: string[];
  penulis?: string[];
  tags?: string[];
  tanggalMulai?: string;
  tanggalSelesai?: string;
  prioritas?: string[];
  featured?: boolean;
  bahasa?: string;
}

interface HasilPencarianKonten {
  konten: DataKonten[];
  total: number;
  halaman: number;
  totalHalaman: number;
  filterTerapan: FilterTerapanKonten;
  statistikPencarian: StatistikPencarianKonten;
  saranPencarian: string[];
  kategoriTersedia: string[];
  tagsTerpopuler: string[];
}

interface FilterTerapanKonten {
  jenis: string[];
  kategori: string[];
  status: string[];
  penulis: string[];
  tags: string[];
  rentangTanggal: {
    mulai: string;
    selesai: string;
  } | null;
  prioritas: string[];
}

interface StatistikPencarianKonten {
  totalDitemukan: number;
  distribusiJenis: { [key: string]: number };
  distribusiKategori: { [key: string]: number };
  distribusiStatus: { [key: string]: number };
  distribusiPenulis: { [key: string]: number };
  rataViews: number;
  rataLikes: number;
}

interface TemplateKonten {
  id: string;
  nama: string;
  deskripsi: string;
  jenis: string;
  struktur: StrukturTemplate;
  variabel: VariabelTemplate[];
  preview: string;
  kategori: string;
  tags: string[];
  penggunaan: number;
  rating: number;
}

interface StrukturTemplate {
  sections: SectionTemplate[];
  layout: string;
  styling: any;
}

interface SectionTemplate {
  id: string;
  nama: string;
  jenis: 'text' | 'image' | 'video' | 'list' | 'table' | 'custom';
  required: boolean;
  placeholder: string;
  validation?: any;
}

interface VariabelTemplate {
  nama: string;
  jenis: 'string' | 'number' | 'date' | 'boolean' | 'array';
  required: boolean;
  defaultValue?: any;
  description: string;
}

interface StatistikKonten {
  ringkasan: RingkasanKonten;
  performa: PerformaKonten;
  tren: TrenKonten;
  penulis: StatistikPenulis[];
  kategori: StatistikKategori[];
  engagement: EngagementKonten;
}

interface RingkasanKonten {
  totalKonten: number;
  kontenPublished: number;
  kontenDraft: number;
  kontenReview: number;
  kontenArchived: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
}

interface PerformaKonten {
  topPerforming: DataKonten[];
  trending: DataKonten[];
  mostViewed: DataKonten[];
  mostLiked: DataKonten[];
  mostShared: DataKonten[];
  mostCommented: DataKonten[];
}

interface TrenKonten {
  viewsTrend: TrendData[];
  publishTrend: TrendData[];
  engagementTrend: TrendData[];
  categoryTrend: { [key: string]: TrendData[] };
}

interface TrendData {
  tanggal: string;
  nilai: number;
  perubahan?: number;
}

interface StatistikPenulis {
  id: string;
  nama: string;
  totalKonten: number;
  totalViews: number;
  rataRating: number;
  produktivitas: number;
  engagement: number;
}

interface StatistikKategori {
  nama: string;
  totalKonten: number;
  totalViews: number;
  rataEngagement: number;
  pertumbuhan: number;
}

interface EngagementKonten {
  rataViews: number;
  rataLikes: number;
  rataShares: number;
  rataComments: number;
  engagementRate: number;
  bounceRate: number;
  timeOnPage: number;
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
class LayananKonten {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.loadConfiguration();
  }

  // Main Methods
  async simpanKonten(dataKonten: Omit<DataKonten, 'id' | 'tanggalBuat' | 'tanggalUpdate'>): Promise<ResponLayanan<DataKonten>> {
    try {
      await this.simulateApiDelay(800);

      // Validate content data
      const validation = this.validateContentData(dataKonten);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Data konten tidak valid',
          errors: validation.errors,
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Generate slug if not provided
      const slug = dataKonten.slug || this.generateSlug(dataKonten.judul);

      // Check slug uniqueness
      const slugExists = await this.checkSlugExists(slug);
      if (slugExists) {
        return {
          success: false,
          message: 'Slug sudah digunakan',
          errors: ['Slug harus unik'],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Create new content
      const newContent: DataKonten = {
        ...dataKonten,
        id: this.generateContentId(),
        slug,
        tanggalBuat: new Date().toISOString(),
        tanggalUpdate: new Date().toISOString(),
        metadata: {
          ...dataKonten.metadata,
          views: 0,
          likes: 0,
          shares: 0,
          comments: 0,
          readTime: this.calculateReadTime(dataKonten.konten)
        },
        versi: [{
          id: this.generateVersionId(),
          versi: 1,
          konten: dataKonten.konten,
          tanggal: new Date().toISOString(),
          penulis: dataKonten.penulis.nama,
          catatan: 'Versi awal',
          status: 'current'
        }],
        workflow: this.initializeWorkflow(dataKonten.jenis)
      };

      // Clear related cache
      this.clearContentCache();
      this.logActivity('Simpan konten baru', { id: newContent.id, judul: newContent.judul });

      return {
        success: true,
        data: newContent,
        message: 'Konten berhasil disimpan',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error simpan konten', error);
      return {
        success: false,
        message: 'Gagal menyimpan konten',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };
    }
  }

  async perbaruiKonten(idKonten: string, dataKontenBaru: Partial<DataKonten>): Promise<ResponLayanan<DataKonten>> {
    try {
      await this.simulateApiDelay(600);

      // Get existing content
      const existingContent = this.generateMockContent(idKonten);
      if (!existingContent) {
        return {
          success: false,
          message: 'Konten tidak ditemukan',
          errors: ['ID konten tidak valid'],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Validate update data
      const validation = this.validateContentUpdate(dataKontenBaru);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Data pembaruan tidak valid',
          errors: validation.errors,
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Check permissions
      const canEdit = this.checkEditPermission(existingContent, dataKontenBaru.editor?.id);
      if (!canEdit) {
        return {
          success: false,
          message: 'Tidak memiliki izin untuk mengedit konten ini',
          errors: ['Akses ditolak'],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Create new version if content changed
      let newVersions = existingContent.versi;
      if (dataKontenBaru.konten && dataKontenBaru.konten !== existingContent.konten) {
        // Archive current version
        newVersions = newVersions.map(v => ({ ...v, status: 'archived' as const }));
        
        // Add new version
        newVersions.push({
          id: this.generateVersionId(),
          versi: newVersions.length + 1,
          konten: dataKontenBaru.konten,
          tanggal: new Date().toISOString(),
          penulis: dataKontenBaru.editor?.nama || 'System',
          catatan: dataKontenBaru.editor?.catatan || 'Pembaruan konten',
          status: 'current'
        });
      }

      // Update content
      const updatedContent: DataKonten = {
        ...existingContent,
        ...dataKontenBaru,
        id: idKonten,
        tanggalUpdate: new Date().toISOString(),
        versi: newVersions,
        metadata: {
          ...existingContent.metadata,
          ...dataKontenBaru.metadata,
          readTime: dataKontenBaru.konten ? this.calculateReadTime(dataKontenBaru.konten) : existingContent.metadata.readTime
        }
      };

      // Clear related cache
      this.clearContentCache(idKonten);
      this.logActivity('Perbarui konten', { id: idKonten, perubahan: Object.keys(dataKontenBaru) });

      return {
        success: true,
        data: updatedContent,
        message: 'Konten berhasil diperbarui',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error perbarui konten', error);
      return {
        success: false,
        message: 'Gagal memperbarui konten',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };
    }
  }

  async hapusKonten(idKonten: string): Promise<ResponLayanan<boolean>> {
    try {
      await this.simulateApiDelay(500);

      // Get existing content
      const existingContent = this.generateMockContent(idKonten);
      if (!existingContent) {
        return {
          success: false,
          message: 'Konten tidak ditemukan',
          errors: ['ID konten tidak valid'],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Validate deletion rules
      const validation = this.validateContentDeletion(existingContent);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Konten tidak dapat dihapus',
          errors: validation.errors,
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Soft delete - change status to deleted
      const deletedContent = {
        ...existingContent,
        status: 'deleted' as const,
        tanggalUpdate: new Date().toISOString()
      };

      // Clear related cache
      this.clearContentCache(idKonten);
      this.logActivity('Hapus konten', { id: idKonten, judul: existingContent.judul });

      return {
        success: true,
        data: true,
        message: 'Konten berhasil dihapus',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error hapus konten', error);
      return {
        success: false,
        message: 'Gagal menghapus konten',
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
  async ambilSemuaKonten(
    kriteria?: KriteriaKonten,
    halaman: number = 1,
    limit: number = 20,
    urutkan?: string
  ): Promise<ResponLayanan<HasilPencarianKonten>> {
    try {
      await this.simulateApiDelay(600);

      const cacheKey = `all_content_${JSON.stringify(kriteria)}_${halaman}_${limit}_${urutkan}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Data konten berhasil diambil dari cache',
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Generate mock content
      const allContent = this.generateMockContents(100);
      
      // Apply filters
      let filteredContent = this.applyContentFilters(allContent, kriteria);
      
      // Apply sorting
      if (urutkan) {
        filteredContent = this.sortContent(filteredContent, urutkan);
      }

      // Pagination
      const startIndex = (halaman - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedContent = filteredContent.slice(startIndex, endIndex);

      const result: HasilPencarianKonten = {
        konten: paginatedContent,
        total: filteredContent.length,
        halaman,
        totalHalaman: Math.ceil(filteredContent.length / limit),
        filterTerapan: this.buildAppliedFilters(kriteria),
        statistikPencarian: this.generateSearchStatistics(filteredContent),
        saranPencarian: this.generateSearchSuggestions(kriteria),
        kategoriTersedia: this.getAvailableCategories(allContent),
        tagsTerpopuler: this.getPopularTags(allContent)
      };

      this.setCache(cacheKey, result);
      this.logActivity('Mengambil semua konten', { kriteria, halaman, limit });

      return {
        success: true,
        data: result,
        message: 'Data konten berhasil diambil',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error mengambil konten', error);
      return {
        success: false,
        message: 'Gagal mengambil data konten',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };
    }
  }

  async ambilDetailKonten(idKonten: string): Promise<ResponLayanan<DataKonten>> {
    try {
      await this.simulateApiDelay(300);

      const cacheKey = `content_detail_${idKonten}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Detail konten berhasil diambil dari cache',
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      const content = this.generateMockContent(idKonten);
      if (!content) {
        return {
          success: false,
          message: 'Konten tidak ditemukan',
          errors: ['ID konten tidak valid'],
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      // Increment view count
      content.metadata.views += 1;

      this.setCache(cacheKey, content);
      this.logActivity('Mengambil detail konten', { id: idKonten });

      return {
        success: true,
        data: content,
        message: 'Detail konten berhasil diambil',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error mengambil detail konten', error);
      return {
        success: false,
        message: 'Gagal mengambil detail konten',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };
    }
  }

  async ambilTemplateKonten(): Promise<ResponLayanan<TemplateKonten[]>> {
    try {
      await this.simulateApiDelay(400);

      const cacheKey = 'content_templates';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Template konten berhasil diambil dari cache',
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      const templates = this.generateContentTemplates();
      this.setCache(cacheKey, templates);
      this.logActivity('Mengambil template konten');

      return {
        success: true,
        data: templates,
        message: 'Template konten berhasil diambil',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error mengambil template konten', error);
      return {
        success: false,
        message: 'Gagal mengambil template konten',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };
    }
  }

  async ambilStatistikKonten(): Promise<ResponLayanan<StatistikKonten>> {
    try {
      await this.simulateApiDelay(800);

      const cacheKey = 'content_statistics';
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Statistik konten berhasil diambil dari cache',
          metadata: {
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
            version: '1.0.0'
          }
        };
      }

      const contents = this.generateMockContents(50);
      const statistics = this.generateContentStatistics(contents);
      
      this.setCache(cacheKey, statistics);
      this.logActivity('Mengambil statistik konten');

      return {
        success: true,
        data: statistics,
        message: 'Statistik konten berhasil diambil',
        metadata: {
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
          version: '1.0.0'
        }
      };

    } catch (error) {
      this.logActivity('Error mengambil statistik konten', error);
      return {
        success: false,
        message: 'Gagal mengambil statistik konten',
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
  private generateMockContent(id?: string): DataKonten {
    const types = ['artikel', 'berita', 'promosi', 'panduan', 'faq', 'testimoni'];
    const categories = ['Otomotif', 'Tips', 'Berita', 'Promosi', 'Panduan', 'FAQ'];
    const statuses = ['draft', 'review', 'published', 'archived'];
    const priorities = ['rendah', 'normal', 'tinggi', 'urgent'];

    const contentId = id || `content_${Math.floor(Math.random() * 1000) + 1}`;
    const type = types[Math.floor(Math.random() * types.length)];
    const title = `${type.charAt(0).toUpperCase() + type.slice(1)} ${Math.floor(Math.random() * 100) + 1}`;

    return {
      id: contentId,
      judul: title,
      slug: this.generateSlug(title),
      konten: this.generateMockContentBody(type),
      ringkasan: `Ringkasan untuk ${title}`,
      jenis: type as any,
      kategori: categories[Math.floor(Math.random() * categories.length)],
      tags: this.generateRandomTags(),
      status: statuses[Math.floor(Math.random() * statuses.length)] as any,
      prioritas: priorities[Math.floor(Math.random() * priorities.length)] as any,
      penulis: this.generateAuthorInfo(),
      editor: Math.random() > 0.5 ? this.generateEditorInfo() : undefined,
      tanggalBuat: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      tanggalUpdate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      tanggalPublish: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      tanggalExpire: Math.random() > 0.8 ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      media: this.generateContentMedia(),
      metadata: this.generateContentMetadata(),
      seo: this.generateSEOData(title),
      interaksi: this.generateInteractionSettings(),
      pengaturan: this.generateContentSettings(),
      versi: this.generateContentVersions(),
      workflow: this.generateWorkflow(type)
    };
  }

  private generateMockContents(count: number): DataKonten[] {
    return Array.from({ length: count }, () => this.generateMockContent());
  }

  private generateMockContentBody(type: string): string {
    const templates = {
      artikel: 'Ini adalah artikel tentang topik menarik. Artikel ini membahas berbagai aspek penting yang perlu diketahui pembaca.',
      berita: 'Berita terbaru dari industri otomotif. Perkembangan terkini yang perlu diketahui oleh semua pihak.',
      promosi: 'Penawaran spesial untuk pelanggan setia. Dapatkan diskon menarik dan berbagai keuntungan lainnya.',
      panduan: 'Panduan lengkap untuk membantu Anda. Ikuti langkah-langkah berikut untuk hasil yang optimal.',
      faq: 'Pertanyaan yang sering diajukan beserta jawabannya. Temukan solusi untuk masalah umum.',
      testimoni: 'Testimoni dari pelanggan yang puas. Pengalaman nyata dari pengguna layanan kami.'
    };

    return templates[type as keyof typeof templates] || 'Konten default';
  }

  private generateRandomTags(): string[] {
    const allTags = ['mobil', 'otomotif', 'tips', 'panduan', 'berita', 'promo', 'diskon', 'kredit', 'asuransi', 'service'];
    const count = Math.floor(Math.random() * 5) + 1;
    return this.shuffleArray(allTags).slice(0, count);
  }

  private generateAuthorInfo(): InfoPenulis {
    const names = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson'];
    const name = names[Math.floor(Math.random() * names.length)];
    
    return {
      id: `author_${Math.floor(Math.random() * 100) + 1}`,
      nama: name,
      email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
      foto: `/images/authors/${name.toLowerCase().replace(' ', '_')}.jpg`,
      bio: `Bio singkat untuk ${name}`,
      role: ['Writer', 'Editor', 'Content Manager'][Math.floor(Math.random() * 3)]
    };
  }

  private generateEditorInfo(): InfoEditor {
    const names = ['Editor One', 'Editor Two', 'Editor Three'];
    const name = names[Math.floor(Math.random() * names.length)];
    
    return {
      id: `editor_${Math.floor(Math.random() * 10) + 1}`,
      nama: name,
      email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
      tanggalEdit: new Date().toISOString(),
      catatan: 'Revisi konten dan perbaikan struktur'
    };
  }

  private generateContentMedia(): MediaKonten[] {
    const mediaTypes = ['gambar', 'video', 'audio', 'dokumen'];
    const count = Math.floor(Math.random() * 3) + 1;
    
    return Array.from({ length: count }, (_, i) => {
      const type = mediaTypes[Math.floor(Math.random() * mediaTypes.length)];
      return {
        id: `media_${i + 1}`,
        jenis: type as any,
        nama: `${type}_${i + 1}`,
        url: `/media/${type}s/${type}_${i + 1}.${this.getFileExtension(type)}`,
        ukuran: Math.floor(Math.random() * 10000000) + 100000,
        format: this.getFileExtension(type),
        alt: type === 'gambar' ? `Alt text untuk ${type}_${i + 1}` : undefined,
        caption: `Caption untuk ${type}_${i + 1}`,
        posisi: i + 1
      };
    });
  }

  private getFileExtension(type: string): string {
    const extensions = {
      gambar: 'jpg',
      video: 'mp4',
      audio: 'mp3',
      dokumen: 'pdf'
    };
    return extensions[type as keyof typeof extensions] || 'jpg';
  }

  private generateContentMetadata(): MetadataKonten {
    return {
      views: Math.floor(Math.random() * 10000),
      likes: Math.floor(Math.random() * 1000),
      shares: Math.floor(Math.random() * 500),
      comments: Math.floor(Math.random() * 100),
      readTime: Math.floor(Math.random() * 10) + 1,
      difficulty: ['mudah', 'sedang', 'sulit'][Math.floor(Math.random() * 3)] as any,
      target: ['pemula', 'menengah', 'ahli'].slice(0, Math.floor(Math.random() * 3) + 1),
      bahasa: 'id',
      region: ['Jakarta', 'Surabaya', 'Bandung'].slice(0, Math.floor(Math.random() * 3) + 1)
    };
  }

  private generateSEOData(title: string): SEOKonten {
    return {
      metaTitle: title,
      metaDescription: `Deskripsi meta untuk ${title}`,
      metaKeywords: ['mobil', 'otomotif', 'tips'],
      canonicalUrl: `https://example.com/${this.generateSlug(title)}`,
      ogTitle: title,
      ogDescription: `Deskripsi Open Graph untuk ${title}`,
      ogImage: `/images/og/${this.generateSlug(title)}.jpg`,
      twitterCard: 'summary_large_image',
      schema: {
        '@type': 'Article',
        headline: title,
        author: 'Author Name'
      }
    };
  }

  private generateInteractionSettings(): InteraksiKonten {
    return {
      allowComments: Math.random() > 0.2,
      allowSharing: Math.random() > 0.1,
      allowRating: Math.random() > 0.3,
      moderateComments: Math.random() > 0.5,
      notifyAuthor: Math.random() > 0.3
    };
  }

  private generateContentSettings(): PengaturanKonten {
    return {
      featured: Math.random() > 0.8,
      sticky: Math.random() > 0.9,
      private: Math.random() > 0.9,
      passwordProtected: Math.random() > 0.95,
      password: Math.random() > 0.95 ? 'password123' : undefined,
      memberOnly: Math.random() > 0.8,
      ageRestriction: Math.random() > 0.9 ? 18 : undefined
    };
  }

  private generateContentVersions(): VersiKonten[] {
    const count = Math.floor(Math.random() * 3) + 1;
    
    return Array.from({ length: count }, (_, i) => ({
      id: `version_${i + 1}`,
      versi: i + 1,
      konten: `Konten versi ${i + 1}`,
      tanggal: new Date(Date.now() - (count - i) * 24 * 60 * 60 * 1000).toISOString(),
      penulis: `Author ${i + 1}`,
      catatan: `Catatan untuk versi ${i + 1}`,
      status: i === count - 1 ? 'current' : 'archived'
    }));
  }

  private generateWorkflow(type: string): WorkflowKonten {
    const steps = [
      { id: 'draft', nama: 'Draft', status: 'approved' as const, assignee: 'author' },
      { id: 'review', nama: 'Review', status: 'pending' as const, assignee: 'editor' },
      { id: 'approve', nama: 'Approval', status: 'pending' as const, assignee: 'manager' },
      { id: 'publish', nama: 'Publish', status: 'pending' as const, assignee: 'admin' }
    ];

    return {
      currentStep: 'review',
      steps,
      approvers: ['editor', 'manager', 'admin'],
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: ['Konten siap untuk review', 'Menunggu persetujuan editor']
    };
  }

  private generateContentTemplates(): TemplateKonten[] {
    return [
      {
        id: 'template_1',
        nama: 'Template Artikel',
        deskripsi: 'Template standar untuk artikel',
        jenis: 'artikel',
        struktur: {
          sections: [
            { id: 'title', nama: 'Judul', jenis: 'text', required: true, placeholder: 'Masukkan judul artikel' },
            { id: 'intro', nama: 'Pendahuluan', jenis: 'text', required: true, placeholder: 'Tulis pendahuluan' },
            { id: 'content', nama: 'Konten Utama', jenis: 'text', required: true, placeholder: 'Konten artikel' },
            { id: 'conclusion', nama: 'Kesimpulan', jenis: 'text', required: false, placeholder: 'Kesimpulan artikel' }
          ],
          layout: 'standard',
          styling: {}
        },
        variabel: [
          { nama: 'author', jenis: 'string', required: true, description: 'Nama penulis' },
          { nama: 'category', jenis: 'string', required: true, description: 'Kategori artikel' }
        ],
        preview: 'Preview template artikel',
        kategori: 'Artikel',
        tags: ['artikel', 'template', 'standar'],
        penggunaan: 25,
        rating: 4.5
      },
      {
        id: 'template_2',
        nama: 'Template Berita',
        deskripsi: 'Template untuk berita terkini',
        jenis: 'berita',
        struktur: {
          sections: [
            { id: 'headline', nama: 'Headline', jenis: 'text', required: true, placeholder: 'Headline berita' },
            { id: 'lead', nama: 'Lead', jenis: 'text', required: true, placeholder: 'Lead paragraph' },
            { id: 'body', nama: 'Body', jenis: 'text', required: true, placeholder: 'Isi berita' },
            { id: 'quote', nama: 'Quote', jenis: 'text', required: false, placeholder: 'Kutipan' }
          ],
          layout: 'news',
          styling: {}
        },
        variabel: [
          { nama: 'reporter', jenis: 'string', required: true, description: 'Nama reporter' },
          { nama: 'location', jenis: 'string', required: false, description: 'Lokasi berita' }
        ],
        preview: 'Preview template berita',
        kategori: 'Berita',
        tags: ['berita', 'template', 'news'],
        penggunaan: 18,
        rating: 4.2
      }
    ];
  }

  private generateContentStatistics(contents: DataKonten[]): StatistikKonten {
    const published = contents.filter(c => c.status === 'published');
    const draft = contents.filter(c => c.status === 'draft');
    const review = contents.filter(c => c.status === 'review');
    const archived = contents.filter(c => c.status === 'archived');

    const totalViews = contents.reduce((sum, c) => sum + c.metadata.views, 0);
    const totalLikes = contents.reduce((sum, c) => sum + c.metadata.likes, 0);
    const totalShares = contents.reduce((sum, c) => sum + c.metadata.shares, 0);
    const totalComments = contents.reduce((sum, c) => sum + c.metadata.comments, 0);

    return {
      ringkasan: {
        totalKonten: contents.length,
        kontenPublished: published.length,
        kontenDraft: draft.length,
        kontenReview: review.length,
        kontenArchived: archived.length,
        totalViews,
        totalLikes,
        totalShares,
        totalComments
      },
      performa: {
        topPerforming: contents.sort((a, b) => b.metadata.views - a.metadata.views).slice(0, 5),
        trending: contents.sort((a, b) => b.metadata.likes - a.metadata.likes).slice(0, 5),
        mostViewed: contents.sort((a, b) => b.metadata.views - a.metadata.views).slice(0, 10),
        mostLiked: contents.sort((a, b) => b.metadata.likes - a.metadata.likes).slice(0, 10),
        mostShared: contents.sort((a, b) => b.metadata.shares - a.metadata.shares).slice(0, 10),
        mostCommented: contents.sort((a, b) => b.metadata.comments - a.metadata.comments).slice(0, 10)
      },
      tren: {
        viewsTrend: this.generateTrendData('views'),
        publishTrend: this.generateTrendData('publish'),
        engagementTrend: this.generateTrendData('engagement'),
        categoryTrend: {
          'Otomotif': this.generateTrendData('category'),
          'Tips': this.generateTrendData('category'),
          'Berita': this.generateTrendData('category')
        }
      },
      penulis: this.generateAuthorStatistics(contents),
      kategori: this.generateCategoryStatistics(contents),
      engagement: {
        rataViews: Math.floor(totalViews / contents.length),
        rataLikes: Math.floor(totalLikes / contents.length),
        rataShares: Math.floor(totalShares / contents.length),
        rataComments: Math.floor(totalComments / contents.length),
        engagementRate: Math.round(((totalLikes + totalShares + totalComments) / totalViews) * 100),
        bounceRate: Math.round(Math.random() * 30 + 20),
        timeOnPage: Math.round(Math.random() * 300 + 120)
      }
    };
  }

  private generateTrendData(type: string): TrendData[] {
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
      const baseValue = type === 'views' ? 1000 : type === 'publish' ? 5 : 100;
      const value = Math.floor(Math.random() * baseValue) + baseValue;
      
      return {
        tanggal: date.toISOString().split('T')[0],
        nilai: value,
        perubahan: Math.floor(Math.random() * 20) - 10
      };
    });
  }

  private generateAuthorStatistics(contents: DataKonten[]): StatistikPenulis[] {
    const authorMap = new Map<string, StatistikPenulis>();
    
    contents.forEach(content => {
      const authorId = content.penulis.id;
      if (!authorMap.has(authorId)) {
        authorMap.set(authorId, {
          id: authorId,
          nama: content.penulis.nama,
          totalKonten: 0,
          totalViews: 0,
          rataRating: 0,
          produktivitas: 0,
          engagement: 0
        });
      }
      
      const stats = authorMap.get(authorId)!;
      stats.totalKonten += 1;
      stats.totalViews += content.metadata.views;
    });

    return Array.from(authorMap.values()).map(stats => ({
      ...stats,
      rataRating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      produktivitas: Math.round(stats.totalKonten / 30 * 100) / 100,
      engagement: Math.round((stats.totalViews / stats.totalKonten) * 100) / 100
    }));
  }

  private generateCategoryStatistics(contents: DataKonten[]): StatistikKategori[] {
    const categoryMap = new Map<string, StatistikKategori>();
    
    contents.forEach(content => {
      if (!categoryMap.has(content.kategori)) {
        categoryMap.set(content.kategori, {
          nama: content.kategori,
          totalKonten: 0,
          totalViews: 0,
          rataEngagement: 0,
          pertumbuhan: 0
        });
      }
      
      const stats = categoryMap.get(content.kategori)!;
      stats.totalKonten += 1;
      stats.totalViews += content.metadata.views;
    });

    return Array.from(categoryMap.values()).map(stats => ({
      ...stats,
      rataEngagement: Math.round((stats.totalViews / stats.totalKonten) * 100) / 100,
      pertumbuhan: Math.round((Math.random() * 40 - 20) * 100) / 100
    }));
  }

  private applyContentFilters(contents: DataKonten[], kriteria?: KriteriaKonten): DataKonten[] {
    if (!kriteria) return contents;

    return contents.filter(content => {
      if (kriteria.jenis && kriteria.jenis.length > 0 && !kriteria.jenis.includes(content.jenis)) {
        return false;
      }
      
      if (kriteria.kategori && kriteria.kategori.length > 0 && !kriteria.kategori.includes(content.kategori)) {
        return false;
      }
      
      if (kriteria.status && kriteria.status.length > 0 && !kriteria.status.includes(content.status)) {
        return false;
      }
      
      if (kriteria.penulis && kriteria.penulis.length > 0 && !kriteria.penulis.includes(content.penulis.id)) {
        return false;
      }
      
      if (kriteria.tags && kriteria.tags.length > 0) {
        const hasTag = kriteria.tags.some(tag => content.tags.includes(tag));
        if (!hasTag) return false;
      }
      
      if (kriteria.tanggalMulai && new Date(content.tanggalBuat) < new Date(kriteria.tanggalMulai)) {
        return false;
      }
      
      if (kriteria.tanggalSelesai && new Date(content.tanggalBuat) > new Date(kriteria.tanggalSelesai)) {
        return false;
      }
      
      if (kriteria.prioritas && kriteria.prioritas.length > 0 && !kriteria.prioritas.includes(content.prioritas)) {
        return false;
      }
      
      if (kriteria.featured !== undefined && content.pengaturan.featured !== kriteria.featured) {
        return false;
      }
      
      if (kriteria.bahasa && content.metadata.bahasa !== kriteria.bahasa) {
        return false;
      }
      
      return true;
    });
  }

  private sortContent(contents: DataKonten[], sortBy: string): DataKonten[] {
    const [field, direction] = sortBy.split(':');
    const isAsc = direction === 'asc';

    return contents.sort((a, b) => {
      let aVal: any, bVal: any;

      switch (field) {
        case 'judul':
          aVal = a.judul;
          bVal = b.judul;
          break;
        case 'tanggalBuat':
          aVal = new Date(a.tanggalBuat);
          bVal = new Date(b.tanggalBuat);
          break;
        case 'tanggalUpdate':
          aVal = new Date(a.tanggalUpdate);
          bVal = new Date(b.tanggalUpdate);
          break;
        case 'views':
          aVal = a.metadata.views;
          bVal = b.metadata.views;
          break;
        case 'likes':
          aVal = a.metadata.likes;
          bVal = b.metadata.likes;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'prioritas':
          aVal = a.prioritas;
          bVal = b.prioritas;
          break;
        default:
          aVal = a.tanggalUpdate;
          bVal = b.tanggalUpdate;
      }

      if (aVal < bVal) return isAsc ? -1 : 1;
      if (aVal > bVal) return isAsc ? 1 : -1;
      return 0;
    });
  }

  private buildAppliedFilters(kriteria?: KriteriaKonten): FilterTerapanKonten {
    return {
      jenis: kriteria?.jenis || [],
      kategori: kriteria?.kategori || [],
      status: kriteria?.status || [],
      penulis: kriteria?.penulis || [],
      tags: kriteria?.tags || [],
      rentangTanggal: kriteria?.tanggalMulai && kriteria?.tanggalSelesai ? {
        mulai: kriteria.tanggalMulai,
        selesai: kriteria.tanggalSelesai
      } : null,
      prioritas: kriteria?.prioritas || []
    };
  }

  private generateSearchStatistics(contents: DataKonten[]): StatistikPencarianKonten {
    const jenisCount: { [key: string]: number } = {};
    const kategoriCount: { [key: string]: number } = {};
    const statusCount: { [key: string]: number } = {};
    const penulisCount: { [key: string]: number } = {};
    let totalViews = 0;
    let totalLikes = 0;

    contents.forEach(content => {
      jenisCount[content.jenis] = (jenisCount[content.jenis] || 0) + 1;
      kategoriCount[content.kategori] = (kategoriCount[content.kategori] || 0) + 1;
      statusCount[content.status] = (statusCount[content.status] || 0) + 1;
      penulisCount[content.penulis.nama] = (penulisCount[content.penulis.nama] || 0) + 1;
      totalViews += content.metadata.views;
      totalLikes += content.metadata.likes;
    });

    return {
      totalDitemukan: contents.length,
      distribusiJenis: jenisCount,
      distribusiKategori: kategoriCount,
      distribusiStatus: statusCount,
      distribusiPenulis: penulisCount,
      rataViews: contents.length > 0 ? Math.round(totalViews / contents.length) : 0,
      rataLikes: contents.length > 0 ? Math.round(totalLikes / contents.length) : 0
    };
  }

  private generateSearchSuggestions(kriteria?: KriteriaKonten): string[] {
    const suggestions = [
      'Coba gunakan filter kategori yang lebih spesifik',
      'Filter berdasarkan status konten',
      'Gunakan rentang tanggal untuk hasil yang lebih akurat',
      'Cari berdasarkan penulis atau tags',
      'Filter berdasarkan jenis konten'
    ];

    return suggestions.slice(0, 3);
  }

  private getAvailableCategories(contents: DataKonten[]): string[] {
    const categories = new Set(contents.map(c => c.kategori));
    return Array.from(categories).sort();
  }

  private getPopularTags(contents: DataKonten[]): string[] {
    const tagCount = new Map<string, number>();
    
    contents.forEach(content => {
      content.tags.forEach(tag => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }

  private validateContentData(data: Partial<DataKonten>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.judul || data.judul.length < 5) {
      errors.push('Judul minimal 5 karakter');
    }

    if (!data.konten || data.konten.length < 50) {
      errors.push('Konten minimal 50 karakter');
    }

    if (!data.jenis) {
      errors.push('Jenis konten harus dipilih');
    }

    if (!data.kategori) {
      errors.push('Kategori harus dipilih');
    }

    if (!data.penulis || !data.penulis.id) {
      errors.push('Penulis harus ditentukan');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private validateContentUpdate(data: Partial<DataKonten>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.judul && data.judul.length < 5) {
      errors.push('Judul minimal 5 karakter');
    }

    if (data.konten && data.konten.length < 50) {
      errors.push('Konten minimal 50 karakter');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private validateContentDeletion(content: DataKonten): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (content.status === 'published' && content.metadata.views > 1000) {
      errors.push('Konten dengan views tinggi tidak dapat dihapus');
    }

    if (content.pengaturan.featured) {
      errors.push('Konten featured tidak dapat dihapus');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private async checkSlugExists(slug: string): Promise<boolean> {
    // Simulate slug check
    return Math.random() > 0.9; // 10% chance slug exists
  }

  private checkEditPermission(content: DataKonten, editorId?: string): boolean {
    // Simulate permission check
    return true; // Allow all edits for demo
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private generateContentId(): string {
    return `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateVersionId(): string {
    return `version_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeWorkflow(type: string): WorkflowKonten {
    return this.generateWorkflow(type);
  }

  private clearContentCache(contentId?: string): void {
    const keysToDelete = [];
    const cacheKeys = Array.from(this.cache.keys()); for (const key of cacheKeys) {
      if (contentId && key.includes(contentId)) {
        keysToDelete.push(key);
      } else if (!contentId && (key.includes('content') || key.includes('all_content'))) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Utility Methods
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
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
    console.log('Loading LayananKonten configuration...');
  }

  private async simulateApiDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logActivity(activity: string, details?: any): void {
    console.log(`[LayananKonten] ${activity}`, details);
  }

  // Service Info
  getServiceInfo(): any {
    return {
      name: 'LayananKonten',
      version: '1.0.0',
      description: 'Service untuk mengelola operasi terkait konten',
      methods: [
        'simpanKonten',
        'perbaruiKonten',
        'hapusKonten',
        'ambilSemuaKonten',
        'ambilDetailKonten',
        'ambilTemplateKonten',
        'ambilStatistikKonten'
      ],
      features: [
        'Content management',
        'Version control',
        'Workflow management',
        'SEO optimization',
        'Media management',
        'Template system',
        'Content statistics',
        'Advanced search and filtering',
        'Content scheduling',
        'Multi-language support'
      ]
    };
  }
}

// Export default
export default LayananKonten;
