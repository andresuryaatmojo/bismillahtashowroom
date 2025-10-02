/**
 * KontrollerPersetujuan
 * 
 * Kontroler untuk mengelola sistem persetujuan (approval) dalam aplikasi.
 * Menangani pending approvals, detail proposal, dan proses persetujuan.
 * 
 * @author Mobilindo Showroom
 * @version 1.0.0
 */

// Interfaces untuk data persetujuan
interface DataPendingApprovals {
  totalPending: number;
  approvalsByCategory: ApprovalCategory[];
  recentApprovals: PendingApproval[];
  urgentApprovals: PendingApproval[];
  approvalStats: ApprovalStats;
  filters: ApprovalFilters;
  pagination: PaginationInfo;
}

interface ApprovalCategory {
  kategori: string;
  jumlah: number;
  prioritas: 'high' | 'medium' | 'low';
  avgProcessingTime: number;
  icon: string;
  color: string;
}

interface PendingApproval {
  id: string;
  judul: string;
  kategori: string;
  pengaju: UserInfo;
  tanggalPengajuan: Date;
  deadline: Date;
  prioritas: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  estimasiWaktu: number;
  deskripsiSingkat: string;
  nilaiTransaksi?: number;
  approver: UserInfo[];
  tags: string[];
  attachments: AttachmentInfo[];
}

interface UserInfo {
  id: string;
  nama: string;
  email: string;
  jabatan: string;
  departemen: string;
  avatar?: string;
}

interface AttachmentInfo {
  id: string;
  nama: string;
  ukuran: number;
  tipe: string;
  url: string;
  tanggalUpload: Date;
}

interface ApprovalStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  avgProcessingTime: number;
  onTimeApproval: number;
  overdueApprovals: number;
  approvalRate: number;
  monthlyTrend: TrendData[];
}

interface TrendData {
  bulan: string;
  approved: number;
  rejected: number;
  pending: number;
}

interface ApprovalFilters {
  kategori: string[];
  prioritas: string[];
  status: string[];
  dateRange: DateRange;
  approver: string[];
  pengaju: string[];
}

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// Interface untuk detail proposal
interface DetailProposal {
  id: string;
  judul: string;
  kategori: string;
  subKategori: string;
  pengaju: UserInfo;
  tanggalPengajuan: Date;
  deadline: Date;
  prioritas: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  deskripsi: string;
  justifikasi: string;
  dampakBisnis: string;
  nilaiTransaksi?: number;
  budget: BudgetInfo;
  timeline: TimelineInfo[];
  approvalFlow: ApprovalFlow[];
  attachments: AttachmentInfo[];
  comments: CommentInfo[];
  riwayatPerubahan: ChangeHistory[];
  relatedProposals: RelatedProposal[];
  riskAssessment: RiskAssessment;
  businessCase: BusinessCase;
  technicalSpecs: TechnicalSpecs;
  complianceCheck: ComplianceCheck;
}

interface BudgetInfo {
  totalBudget: number;
  breakdown: BudgetBreakdown[];
  sumberDana: string;
  approvedBudget?: number;
  variance?: number;
}

interface BudgetBreakdown {
  kategori: string;
  jumlah: number;
  persentase: number;
  deskripsi: string;
}

interface TimelineInfo {
  fase: string;
  tanggalMulai: Date;
  tanggalSelesai: Date;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  milestone: string[];
  penanggungJawab: UserInfo;
}

interface ApprovalFlow {
  level: number;
  approver: UserInfo;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  tanggalApproval?: Date;
  komentar?: string;
  kondisi?: string;
  delegatedTo?: UserInfo;
}

interface CommentInfo {
  id: string;
  author: UserInfo;
  tanggal: Date;
  komentar: string;
  tipe: 'comment' | 'question' | 'concern' | 'suggestion';
  isInternal: boolean;
  replies: CommentReply[];
}

interface CommentReply {
  id: string;
  author: UserInfo;
  tanggal: Date;
  komentar: string;
}

interface ChangeHistory {
  id: string;
  tanggal: Date;
  user: UserInfo;
  aksi: string;
  field: string;
  oldValue: string;
  newValue: string;
  alasan?: string;
}

interface RelatedProposal {
  id: string;
  judul: string;
  status: string;
  relationType: 'dependency' | 'related' | 'alternative';
  deskripsi: string;
}

interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  riskFactors: RiskFactor[];
  mitigationPlan: MitigationPlan[];
  contingencyPlan: string;
}

interface RiskFactor {
  kategori: string;
  deskripsi: string;
  probabilitas: number;
  dampak: number;
  riskScore: number;
  mitigasi: string;
}

interface MitigationPlan {
  risk: string;
  action: string;
  owner: UserInfo;
  deadline: Date;
  status: string;
}

interface BusinessCase {
  problemStatement: string;
  proposedSolution: string;
  benefits: string[];
  costs: CostAnalysis;
  roi: ROIAnalysis;
  alternatives: Alternative[];
  assumptions: string[];
}

interface CostAnalysis {
  initialCost: number;
  operationalCost: number;
  maintenanceCost: number;
  totalCostOfOwnership: number;
}

interface ROIAnalysis {
  paybackPeriod: number;
  npv: number;
  irr: number;
  breakEvenPoint: number;
}

interface Alternative {
  nama: string;
  deskripsi: string;
  cost: number;
  benefit: string;
  recommendation: string;
}

interface TechnicalSpecs {
  requirements: TechnicalRequirement[];
  architecture: string;
  integrations: Integration[];
  performance: PerformanceRequirement[];
  security: SecurityRequirement[];
}

interface TechnicalRequirement {
  kategori: string;
  requirement: string;
  priority: 'must' | 'should' | 'could';
  status: 'defined' | 'approved' | 'implemented';
}

interface Integration {
  system: string;
  type: string;
  complexity: 'low' | 'medium' | 'high';
  effort: number;
}

interface PerformanceRequirement {
  metric: string;
  target: string;
  current?: string;
  gap?: string;
}

interface SecurityRequirement {
  requirement: string;
  level: 'basic' | 'standard' | 'advanced';
  compliance: string[];
  implementation: string;
}

interface ComplianceCheck {
  overallCompliance: boolean;
  checks: ComplianceItem[];
  exemptions: ComplianceExemption[];
  recommendations: string[];
}

interface ComplianceItem {
  rule: string;
  status: 'compliant' | 'non_compliant' | 'not_applicable';
  details: string;
  evidence?: string;
}

interface ComplianceExemption {
  rule: string;
  reason: string;
  approver: UserInfo;
  expiryDate: Date;
}

// Response interfaces
interface ApprovalResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

class KontrollerPersetujuan {
  private baseUrl: string = '/api/approvals';
  private cache: Map<string, any> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeController();
  }

  private initializeController(): void {
    console.log('KontrollerPersetujuan initialized');
  }

  /**
   * Memuat data pending approvals
   * @returns Promise<DataPendingApprovals>
   */
  async muatDataPendingApprovals(): Promise<DataPendingApprovals> {
    try {
      const cacheKey = 'pending_approvals';
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      // Simulate API call
      await this.simulateApiDelay();

      const data = this.getMockPendingApprovals();
      
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Error loading pending approvals:', error);
      throw new Error('Gagal memuat data pending approvals');
    }
  }

  /**
   * Mengambil detail proposal berdasarkan ID
   * @param idProposal - ID proposal yang akan diambil detailnya
   * @returns Promise<DetailProposal>
   */
  async ambilDetailProposal(idProposal: string): Promise<DetailProposal> {
    try {
      if (!idProposal) {
        throw new Error('ID proposal tidak boleh kosong');
      }

      const cacheKey = `proposal_detail_${idProposal}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      // Simulate API call
      await this.simulateApiDelay();

      const data = this.getMockProposalDetail(idProposal);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Error loading proposal detail:', error);
      throw new Error('Gagal memuat detail proposal');
    }
  }

  /**
   * Menyetujui proposal
   * @param idProposal - ID proposal
   * @param komentar - Komentar persetujuan
   * @returns Promise<ApprovalResponse>
   */
  async setujuiProposal(idProposal: string, komentar?: string): Promise<ApprovalResponse> {
    try {
      if (!idProposal) {
        throw new Error('ID proposal tidak boleh kosong');
      }

      // Simulate API call
      await this.simulateApiDelay();

      // Clear related cache
      this.clearRelatedCache(idProposal);

      return {
        success: true,
        message: 'Proposal berhasil disetujui',
        data: {
          idProposal,
          status: 'approved',
          tanggalApproval: new Date(),
          komentar
        }
      };
    } catch (error) {
      console.error('Error approving proposal:', error);
      return {
        success: false,
        message: 'Gagal menyetujui proposal',
        errors: [(error as Error).message]
      };
    }
  }

  /**
   * Menolak proposal
   * @param idProposal - ID proposal
   * @param alasan - Alasan penolakan
   * @returns Promise<ApprovalResponse>
   */
  async tolakProposal(idProposal: string, alasan: string): Promise<ApprovalResponse> {
    try {
      if (!idProposal) {
        throw new Error('ID proposal tidak boleh kosong');
      }

      if (!alasan) {
        throw new Error('Alasan penolakan harus diisi');
      }

      // Simulate API call
      await this.simulateApiDelay();

      // Clear related cache
      this.clearRelatedCache(idProposal);

      return {
        success: true,
        message: 'Proposal berhasil ditolak',
        data: {
          idProposal,
          status: 'rejected',
          tanggalRejection: new Date(),
          alasan
        }
      };
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      return {
        success: false,
        message: 'Gagal menolak proposal',
        errors: [(error as Error).message]
      };
    }
  }

  /**
   * Meminta revisi proposal
   * @param idProposal - ID proposal
   * @param komentar - Komentar revisi
   * @returns Promise<ApprovalResponse>
   */
  async mintaRevisi(idProposal: string, komentar: string): Promise<ApprovalResponse> {
    try {
      if (!idProposal) {
        throw new Error('ID proposal tidak boleh kosong');
      }

      if (!komentar) {
        throw new Error('Komentar revisi harus diisi');
      }

      // Simulate API call
      await this.simulateApiDelay();

      // Clear related cache
      this.clearRelatedCache(idProposal);

      return {
        success: true,
        message: 'Permintaan revisi berhasil dikirim',
        data: {
          idProposal,
          status: 'revision_requested',
          tanggalRevision: new Date(),
          komentar
        }
      };
    } catch (error) {
      console.error('Error requesting revision:', error);
      return {
        success: false,
        message: 'Gagal meminta revisi',
        errors: [(error as Error).message]
      };
    }
  }

  /**
   * Mendelegasikan approval
   * @param idProposal - ID proposal
   * @param idDelegate - ID user yang didelegasikan
   * @param alasan - Alasan delegasi
   * @returns Promise<ApprovalResponse>
   */
  async delegasiApproval(idProposal: string, idDelegate: string, alasan: string): Promise<ApprovalResponse> {
    try {
      if (!idProposal || !idDelegate) {
        throw new Error('ID proposal dan delegate tidak boleh kosong');
      }

      // Simulate API call
      await this.simulateApiDelay();

      // Clear related cache
      this.clearRelatedCache(idProposal);

      return {
        success: true,
        message: 'Approval berhasil didelegasikan',
        data: {
          idProposal,
          idDelegate,
          tanggalDelegasi: new Date(),
          alasan
        }
      };
    } catch (error) {
      console.error('Error delegating approval:', error);
      return {
        success: false,
        message: 'Gagal mendelegasikan approval',
        errors: [(error as Error).message]
      };
    }
  }

  /**
   * Menambahkan komentar pada proposal
   * @param idProposal - ID proposal
   * @param komentar - Isi komentar
   * @param tipe - Tipe komentar
   * @returns Promise<ApprovalResponse>
   */
  async tambahKomentar(idProposal: string, komentar: string, tipe: 'comment' | 'question' | 'concern' | 'suggestion' = 'comment'): Promise<ApprovalResponse> {
    try {
      if (!idProposal || !komentar) {
        throw new Error('ID proposal dan komentar tidak boleh kosong');
      }

      // Simulate API call
      await this.simulateApiDelay();

      // Clear related cache
      this.clearRelatedCache(idProposal);

      return {
        success: true,
        message: 'Komentar berhasil ditambahkan',
        data: {
          idProposal,
          komentar,
          tipe,
          tanggal: new Date()
        }
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      return {
        success: false,
        message: 'Gagal menambahkan komentar',
        errors: [(error as Error).message]
      };
    }
  }

  /**
   * Mengambil statistik approval
   * @param periode - Periode statistik
   * @returns Promise<ApprovalStats>
   */
  async ambilStatistikApproval(periode: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<ApprovalStats> {
    try {
      const cacheKey = `approval_stats_${periode}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      // Simulate API call
      await this.simulateApiDelay();

      const data = this.getMockApprovalStats(periode);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('Error loading approval statistics:', error);
      throw new Error('Gagal memuat statistik approval');
    }
  }

  /**
   * Mengekspor data approval
   * @param format - Format ekspor
   * @param filter - Filter data
   * @returns Promise<string>
   */
  async eksporDataApproval(format: 'excel' | 'pdf' | 'csv', filter?: ApprovalFilters): Promise<string> {
    try {
      // Simulate API call
      await this.simulateApiDelay(2000);

      // Generate mock export URL
      const timestamp = Date.now();
      const exportUrl = `/exports/approvals_${timestamp}.${format}`;

      return exportUrl;
    } catch (error) {
      console.error('Error exporting approval data:', error);
      throw new Error('Gagal mengekspor data approval');
    }
  }

  // Utility methods
  private async simulateApiDelay(delay: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  private clearRelatedCache(idProposal: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => 
      key.includes('pending_approvals') || key.includes(`proposal_detail_${idProposal}`)
    );
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  private clearCache(): void {
    this.cache.clear();
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  private formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  private getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981'
    };
    return colors[priority] || colors.medium;
  }

  private getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      pending: '#f59e0b',
      in_review: '#3b82f6',
      approved: '#10b981',
      rejected: '#ef4444'
    };
    return colors[status] || colors.pending;
  }

  // Mock data methods
  private getMockPendingApprovals(): DataPendingApprovals {
    return {
      totalPending: 24,
      approvalsByCategory: [
        {
          kategori: 'Purchase Request',
          jumlah: 8,
          prioritas: 'high',
          avgProcessingTime: 2.5,
          icon: 'shopping-cart',
          color: '#ef4444'
        },
        {
          kategori: 'Budget Approval',
          jumlah: 6,
          prioritas: 'medium',
          avgProcessingTime: 3.2,
          icon: 'dollar-sign',
          color: '#f59e0b'
        },
        {
          kategori: 'Project Proposal',
          jumlah: 5,
          prioritas: 'medium',
          avgProcessingTime: 5.1,
          icon: 'briefcase',
          color: '#3b82f6'
        },
        {
          kategori: 'Policy Change',
          jumlah: 3,
          prioritas: 'low',
          avgProcessingTime: 7.8,
          icon: 'file-text',
          color: '#10b981'
        },
        {
          kategori: 'HR Request',
          jumlah: 2,
          prioritas: 'low',
          avgProcessingTime: 4.2,
          icon: 'users',
          color: '#8b5cf6'
        }
      ],
      recentApprovals: this.getMockRecentApprovals(),
      urgentApprovals: this.getMockUrgentApprovals(),
      approvalStats: this.getMockApprovalStats('month'),
      filters: this.getMockApprovalFilters(),
      pagination: {
        currentPage: 1,
        totalPages: 3,
        totalItems: 24,
        itemsPerPage: 10
      }
    };
  }

  private getMockRecentApprovals(): PendingApproval[] {
    return [
      {
        id: 'app_001',
        judul: 'Purchase Request - Marketing Equipment',
        kategori: 'Purchase Request',
        pengaju: {
          id: 'user_001',
          nama: 'Sarah Johnson',
          email: 'sarah.johnson@company.com',
          jabatan: 'Marketing Manager',
          departemen: 'Marketing',
          avatar: '/avatars/sarah.jpg'
        },
        tanggalPengajuan: new Date(2024, 11, 15),
        deadline: new Date(2024, 11, 22),
        prioritas: 'high',
        status: 'pending',
        estimasiWaktu: 2,
        deskripsiSingkat: 'Request for new marketing equipment including cameras and lighting',
        nilaiTransaksi: 25000000,
        approver: [
          {
            id: 'user_002',
            nama: 'John Smith',
            email: 'john.smith@company.com',
            jabatan: 'Finance Director',
            departemen: 'Finance'
          }
        ],
        tags: ['marketing', 'equipment', 'urgent'],
        attachments: [
          {
            id: 'att_001',
            nama: 'equipment_quotation.pdf',
            ukuran: 2048000,
            tipe: 'application/pdf',
            url: '/attachments/equipment_quotation.pdf',
            tanggalUpload: new Date(2024, 11, 15)
          }
        ]
      },
      {
        id: 'app_002',
        judul: 'Budget Approval - Q1 2025 Marketing Campaign',
        kategori: 'Budget Approval',
        pengaju: {
          id: 'user_003',
          nama: 'Michael Chen',
          email: 'michael.chen@company.com',
          jabatan: 'Marketing Director',
          departemen: 'Marketing'
        },
        tanggalPengajuan: new Date(2024, 11, 14),
        deadline: new Date(2024, 11, 28),
        prioritas: 'medium',
        status: 'in_review',
        estimasiWaktu: 3,
        deskripsiSingkat: 'Budget approval for comprehensive Q1 2025 marketing campaign',
        nilaiTransaksi: 150000000,
        approver: [
          {
            id: 'user_004',
            nama: 'Lisa Wang',
            email: 'lisa.wang@company.com',
            jabatan: 'CEO',
            departemen: 'Executive'
          }
        ],
        tags: ['budget', 'marketing', 'campaign'],
        attachments: []
      }
    ];
  }

  private getMockUrgentApprovals(): PendingApproval[] {
    return [
      {
        id: 'app_urgent_001',
        judul: 'Emergency IT Infrastructure Upgrade',
        kategori: 'Purchase Request',
        pengaju: {
          id: 'user_005',
          nama: 'David Kim',
          email: 'david.kim@company.com',
          jabatan: 'IT Manager',
          departemen: 'IT'
        },
        tanggalPengajuan: new Date(2024, 11, 16),
        deadline: new Date(2024, 11, 18),
        prioritas: 'high',
        status: 'pending',
        estimasiWaktu: 1,
        deskripsiSingkat: 'Critical server replacement due to hardware failure',
        nilaiTransaksi: 75000000,
        approver: [
          {
            id: 'user_002',
            nama: 'John Smith',
            email: 'john.smith@company.com',
            jabatan: 'Finance Director',
            departemen: 'Finance'
          }
        ],
        tags: ['emergency', 'IT', 'critical'],
        attachments: []
      }
    ];
  }

  private getMockApprovalStats(periode: string): ApprovalStats {
    return {
      totalPending: 24,
      totalApproved: 156,
      totalRejected: 12,
      avgProcessingTime: 3.8,
      onTimeApproval: 89,
      overdueApprovals: 3,
      approvalRate: 92.8,
      monthlyTrend: [
        { bulan: 'Jan', approved: 45, rejected: 3, pending: 8 },
        { bulan: 'Feb', approved: 52, rejected: 2, pending: 12 },
        { bulan: 'Mar', approved: 48, rejected: 4, pending: 15 },
        { bulan: 'Apr', approved: 59, rejected: 1, pending: 18 },
        { bulan: 'May', approved: 43, rejected: 2, pending: 22 },
        { bulan: 'Jun', approved: 38, rejected: 0, pending: 24 }
      ]
    };
  }

  private getMockApprovalFilters(): ApprovalFilters {
    return {
      kategori: ['Purchase Request', 'Budget Approval', 'Project Proposal', 'Policy Change', 'HR Request'],
      prioritas: ['high', 'medium', 'low'],
      status: ['pending', 'in_review', 'approved', 'rejected'],
      dateRange: {
        startDate: new Date(2024, 10, 1),
        endDate: new Date(2024, 11, 31)
      },
      approver: ['John Smith', 'Lisa Wang', 'Michael Brown'],
      pengaju: ['Sarah Johnson', 'Michael Chen', 'David Kim']
    };
  }

  private getMockProposalDetail(idProposal: string): DetailProposal {
    return {
      id: idProposal,
      judul: 'Purchase Request - Marketing Equipment',
      kategori: 'Purchase Request',
      subKategori: 'Equipment & Tools',
      pengaju: {
        id: 'user_001',
        nama: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        jabatan: 'Marketing Manager',
        departemen: 'Marketing',
        avatar: '/avatars/sarah.jpg'
      },
      tanggalPengajuan: new Date(2024, 11, 15),
      deadline: new Date(2024, 11, 22),
      prioritas: 'high',
      status: 'pending',
      deskripsi: 'Request for new marketing equipment including professional cameras, lighting equipment, and audio recording devices to support our upcoming product launch campaigns.',
      justifikasi: 'Current equipment is outdated and affecting the quality of our marketing materials. New equipment will significantly improve our content quality and production efficiency.',
      dampakBisnis: 'Expected to increase marketing campaign effectiveness by 40% and reduce external production costs by 60%.',
      nilaiTransaksi: 25000000,
      budget: {
        totalBudget: 25000000,
        breakdown: [
          { kategori: 'Camera Equipment', jumlah: 15000000, persentase: 60, deskripsi: 'Professional DSLR cameras and lenses' },
          { kategori: 'Lighting Equipment', jumlah: 6000000, persentase: 24, deskripsi: 'LED panels and softboxes' },
          { kategori: 'Audio Equipment', jumlah: 3000000, persentase: 12, deskripsi: 'Microphones and recording devices' },
          { kategori: 'Accessories', jumlah: 1000000, persentase: 4, deskripsi: 'Tripods, memory cards, and cases' }
        ],
        sumberDana: 'Marketing Budget 2024',
        approvedBudget: 0,
        variance: 0
      },
      timeline: [
        {
          fase: 'Approval Process',
          tanggalMulai: new Date(2024, 11, 15),
          tanggalSelesai: new Date(2024, 11, 22),
          status: 'in_progress',
          milestone: ['Submit request', 'Finance review', 'Final approval'],
          penanggungJawab: {
            id: 'user_002',
            nama: 'John Smith',
            email: 'john.smith@company.com',
            jabatan: 'Finance Director',
            departemen: 'Finance'
          }
        },
        {
          fase: 'Procurement',
          tanggalMulai: new Date(2024, 11, 23),
          tanggalSelesai: new Date(2024, 11, 30),
          status: 'not_started',
          milestone: ['Vendor selection', 'Purchase order', 'Delivery'],
          penanggungJawab: {
            id: 'user_006',
            nama: 'Robert Lee',
            email: 'robert.lee@company.com',
            jabatan: 'Procurement Manager',
            departemen: 'Operations'
          }
        }
      ],
      approvalFlow: [
        {
          level: 1,
          approver: {
            id: 'user_002',
            nama: 'John Smith',
            email: 'john.smith@company.com',
            jabatan: 'Finance Director',
            departemen: 'Finance'
          },
          status: 'pending',
          kondisi: 'Budget verification and financial impact assessment'
        },
        {
          level: 2,
          approver: {
            id: 'user_004',
            nama: 'Lisa Wang',
            email: 'lisa.wang@company.com',
            jabatan: 'CEO',
            departemen: 'Executive'
          },
          status: 'pending',
          kondisi: 'Final approval for purchases above 20M IDR'
        }
      ],
      attachments: [
        {
          id: 'att_001',
          nama: 'equipment_quotation.pdf',
          ukuran: 2048000,
          tipe: 'application/pdf',
          url: '/attachments/equipment_quotation.pdf',
          tanggalUpload: new Date(2024, 11, 15)
        },
        {
          id: 'att_002',
          nama: 'business_case.docx',
          ukuran: 1024000,
          tipe: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          url: '/attachments/business_case.docx',
          tanggalUpload: new Date(2024, 11, 15)
        }
      ],
      comments: [
        {
          id: 'comment_001',
          author: {
            id: 'user_007',
            nama: 'Emily Davis',
            email: 'emily.davis@company.com',
            jabatan: 'Finance Analyst',
            departemen: 'Finance'
          },
          tanggal: new Date(2024, 11, 16),
          komentar: 'Budget allocation looks reasonable. Please provide more details on the expected ROI.',
          tipe: 'question',
          isInternal: true,
          replies: [
            {
              id: 'reply_001',
              author: {
                id: 'user_001',
                nama: 'Sarah Johnson',
                email: 'sarah.johnson@company.com',
                jabatan: 'Marketing Manager',
                departemen: 'Marketing'
              },
              tanggal: new Date(2024, 11, 16),
              komentar: 'ROI calculation is included in the business case document. Expected payback period is 8 months.'
            }
          ]
        }
      ],
      riwayatPerubahan: [
        {
          id: 'change_001',
          tanggal: new Date(2024, 11, 15),
          user: {
            id: 'user_001',
            nama: 'Sarah Johnson',
            email: 'sarah.johnson@company.com',
            jabatan: 'Marketing Manager',
            departemen: 'Marketing'
          },
          aksi: 'Created',
          field: 'proposal',
          oldValue: '',
          newValue: 'Initial proposal created',
          alasan: 'New equipment request'
        }
      ],
      relatedProposals: [
        {
          id: 'app_003',
          judul: 'Marketing Team Expansion',
          status: 'approved',
          relationType: 'related',
          deskripsi: 'Related to marketing capacity expansion'
        }
      ],
      riskAssessment: {
        overallRisk: 'low',
        riskFactors: [
          {
            kategori: 'Financial',
            deskripsi: 'Budget overrun risk',
            probabilitas: 20,
            dampak: 30,
            riskScore: 6,
            mitigasi: 'Fixed price quotation from vendor'
          },
          {
            kategori: 'Operational',
            deskripsi: 'Learning curve for new equipment',
            probabilitas: 40,
            dampak: 20,
            riskScore: 8,
            mitigasi: 'Training program included in purchase'
          }
        ],
        mitigationPlan: [
          {
            risk: 'Budget overrun',
            action: 'Negotiate fixed price contract',
            owner: {
              id: 'user_006',
              nama: 'Robert Lee',
              email: 'robert.lee@company.com',
              jabatan: 'Procurement Manager',
              departemen: 'Operations'
            },
            deadline: new Date(2024, 11, 20),
            status: 'in_progress'
          }
        ],
        contingencyPlan: 'If budget exceeds limit, consider phased procurement approach'
      },
      businessCase: {
        problemStatement: 'Current marketing equipment is outdated and limiting our content quality and production efficiency.',
        proposedSolution: 'Invest in modern, professional-grade marketing equipment to improve content quality and reduce external production costs.',
        benefits: [
          'Improved content quality',
          'Reduced external production costs',
          'Increased production efficiency',
          'Better brand image'
        ],
        costs: {
          initialCost: 25000000,
          operationalCost: 2000000,
          maintenanceCost: 1000000,
          totalCostOfOwnership: 28000000
        },
        roi: {
          paybackPeriod: 8,
          npv: 15000000,
          irr: 35.5,
          breakEvenPoint: 8
        },
        alternatives: [
          {
            nama: 'Rent Equipment',
            deskripsi: 'Rent equipment on project basis',
            cost: 8000000,
            benefit: 'Lower upfront cost',
            recommendation: 'Not recommended due to higher long-term costs'
          },
          {
            nama: 'Outsource Production',
            deskripsi: 'Continue using external production services',
            cost: 40000000,
            benefit: 'No equipment management',
            recommendation: 'Not cost-effective for regular production needs'
          }
        ],
        assumptions: [
          'Equipment will be used for at least 3 years',
          'Marketing campaign frequency will remain consistent',
          'External production costs will continue to increase'
        ]
      },
      technicalSpecs: {
        requirements: [
          {
            kategori: 'Camera',
            requirement: 'Full-frame DSLR with 4K video capability',
            priority: 'must',
            status: 'defined'
          },
          {
            kategori: 'Lighting',
            requirement: 'LED panels with color temperature control',
            priority: 'must',
            status: 'defined'
          }
        ],
        architecture: 'Standalone equipment setup',
        integrations: [
          {
            system: 'Content Management System',
            type: 'File transfer',
            complexity: 'low',
            effort: 1
          }
        ],
        performance: [
          {
            metric: 'Content production time',
            target: '50% reduction',
            current: '8 hours per video',
            gap: '4 hours per video'
          }
        ],
        security: [
          {
            requirement: 'Secure storage for equipment',
            level: 'standard',
            compliance: ['Physical security'],
            implementation: 'Locked storage room with access control'
          }
        ]
      },
      complianceCheck: {
        overallCompliance: true,
        checks: [
          {
            rule: 'Budget approval process',
            status: 'compliant',
            details: 'Follows standard procurement process',
            evidence: 'Approval workflow initiated'
          },
          {
            rule: 'Vendor selection criteria',
            status: 'compliant',
            details: 'Multiple quotations obtained',
            evidence: 'Quotation comparison document'
          }
        ],
        exemptions: [],
        recommendations: [
          'Consider extended warranty options',
          'Include training costs in budget planning'
        ]
      }
    };
  }
}

export default KontrollerPersetujuan;
