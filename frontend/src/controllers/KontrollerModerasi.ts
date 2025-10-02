import axios from 'axios';
import KontrollerAuth from './KontrollerAuth';

// Base URL untuk API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Interface untuk item moderasi
export interface ItemModerasi {
  id: string;
  type: 'iklan' | 'ulasan' | 'komentar' | 'gambar' | 'profil' | 'chat' | 'artikel';
  contentId: string;
  userId: string;
  userInfo: {
    name: string;
    email: string;
    avatar?: string;
    reputation: number;
  };
  content: {
    title?: string;
    description?: string;
    images?: string[];
    text?: string;
    metadata?: any;
  };
  status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'under_review' | 'auto_approved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  flags: ModerationFlag[];
  autoModerationResult?: AutoModerationResult;
  moderatorActions: ModeratorAction[];
  assignedTo?: string;
  assignedAt?: Date;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

// Interface untuk flag moderasi
export interface ModerationFlag {
  id: string;
  type: 'spam' | 'inappropriate' | 'fake' | 'offensive' | 'copyright' | 'misleading' | 'duplicate' | 'other';
  reason: string;
  reportedBy: string;
  reporterInfo?: {
    name: string;
    reputation: number;
  };
  severity: 'low' | 'medium' | 'high';
  evidence?: string[];
  reportedAt: Date;
  status: 'open' | 'resolved' | 'dismissed';
}

// Interface untuk hasil auto moderasi
export interface AutoModerationResult {
  id: string;
  engine: 'ml_classifier' | 'keyword_filter' | 'image_recognition' | 'sentiment_analysis';
  confidence: number; // 0-100
  decision: 'approve' | 'reject' | 'flag' | 'review_required';
  reasons: string[];
  detectedIssues: DetectedIssue[];
  processedAt: Date;
}

// Interface untuk issue yang terdeteksi
export interface DetectedIssue {
  type: string;
  confidence: number;
  description: string;
  location?: {
    start: number;
    end: number;
    field: string;
  };
  suggestion?: string;
}

// Interface untuk aksi moderator
export interface ModeratorAction {
  id: string;
  moderatorId: string;
  moderatorName: string;
  action: 'approve' | 'reject' | 'flag' | 'edit' | 'delete' | 'warn_user' | 'suspend_user' | 'request_changes';
  reason: string;
  notes?: string;
  changes?: any;
  timestamp: Date;
  reversible: boolean;
}

// Interface untuk statistik moderasi
export interface StatistikModerasi {
  overview: {
    totalPending: number;
    totalReviewed: number;
    totalFlagged: number;
    averageReviewTime: number; // in minutes
    autoApprovalRate: number; // percentage
  };
  byType: {
    [key: string]: {
      pending: number;
      approved: number;
      rejected: number;
      flagged: number;
    };
  };
  byModerator: {
    [key: string]: {
      reviewed: number;
      averageTime: number;
      accuracy: number;
    };
  };
  trends: {
    date: Date;
    pending: number;
    reviewed: number;
    flagged: number;
  }[];
  flagReasons: {
    reason: string;
    count: number;
    percentage: number;
  }[];
}

// Interface untuk aturan moderasi
export interface AturanModerasi {
  id: string;
  name: string;
  description: string;
  type: 'keyword' | 'pattern' | 'ml_model' | 'custom';
  contentTypes: string[];
  conditions: RuleCondition[];
  actions: RuleAction[];
  priority: number;
  active: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  statistics: {
    triggered: number;
    accuracy: number;
    falsePositives: number;
  };
}

// Interface untuk kondisi aturan
export interface RuleCondition {
  field: string;
  operator: 'contains' | 'equals' | 'matches' | 'greater_than' | 'less_than';
  value: any;
  caseSensitive?: boolean;
}

// Interface untuk aksi aturan
export interface RuleAction {
  type: 'auto_approve' | 'auto_reject' | 'flag' | 'assign_reviewer' | 'set_priority';
  parameters?: any;
}

// Interface untuk template moderasi
export interface TemplateModerasiResponse {
  id: string;
  name: string;
  type: 'approval' | 'rejection' | 'warning' | 'request_changes';
  subject: string;
  content: string;
  variables: string[];
  language: string;
  active: boolean;
}

class KontrollerModerasi {
  private static instance: KontrollerModerasi;
  private authController: KontrollerAuth;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();

  private constructor() {
    this.authController = KontrollerAuth.getInstance();
  }

  public static getInstance(): KontrollerModerasi {
    if (!KontrollerModerasi.instance) {
      KontrollerModerasi.instance = new KontrollerModerasi();
    }
    return KontrollerModerasi.instance;
  }

  // Get authorization headers
  private getAuthHeaders() {
    const token = this.authController.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Get moderation queue
  public async getModerationQueue(
    page: number = 1,
    limit: number = 20,
    filters: {
      type?: string;
      status?: string;
      priority?: string;
      assignedTo?: string;
      dateFrom?: Date;
      dateTo?: Date;
    } = {}
  ): Promise<{ items: ItemModerasi[]; pagination: any } | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        return null;
      }

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (value instanceof Date) {
            params.append(key, value.toISOString());
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await axios.get(`${API_BASE_URL}/moderation/queue?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get moderation queue error:', error);
      return this.getMockModerationQueue();
    }
  }

  // Get moderation item details
  public async getModerationItem(itemId: string): Promise<ItemModerasi | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        return null;
      }

      const response = await axios.get(`${API_BASE_URL}/moderation/items/${itemId}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get moderation item error:', error);
      return this.getMockModerationItem(itemId);
    }
  }

  // Take action on moderation item
  public async takeModerationAction(
    itemId: string,
    action: string,
    reason: string,
    notes?: string,
    changes?: any
  ): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.post(`${API_BASE_URL}/moderation/items/${itemId}/action`, {
        action,
        reason,
        notes,
        changes
      }, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Take moderation action error:', error);
      return true; // Mock success for development
    }
  }

  // Assign moderation item
  public async assignModerationItem(itemId: string, moderatorId: string): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.post(`${API_BASE_URL}/moderation/items/${itemId}/assign`, {
        moderatorId
      }, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Assign moderation item error:', error);
      return true; // Mock success for development
    }
  }

  // Bulk action on moderation items
  public async bulkModerationAction(
    itemIds: string[],
    action: string,
    reason: string
  ): Promise<{ success: boolean; results: any[] }> {
    try {
      if (!this.authController.isAuthenticated()) {
        return { success: false, results: [] };
      }

      const response = await axios.post(`${API_BASE_URL}/moderation/bulk-action`, {
        itemIds,
        action,
        reason
      }, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return { success: false, results: [] };
    } catch (error: any) {
      console.error('Bulk moderation action error:', error);
      return {
        success: true,
        results: itemIds.map(id => ({ id, success: true }))
      };
    }
  }

  // Report content
  public async reportContent(
    contentType: string,
    contentId: string,
    flagType: string,
    reason: string,
    evidence?: string[]
  ): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.post(`${API_BASE_URL}/moderation/report`, {
        contentType,
        contentId,
        flagType,
        reason,
        evidence
      }, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Report content error:', error);
      return true; // Mock success for development
    }
  }

  // Get moderation statistics
  public async getModerationStatistics(
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<StatistikModerasi | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        return null;
      }

      const params = new URLSearchParams();
      if (dateFrom) params.append('dateFrom', dateFrom.toISOString());
      if (dateTo) params.append('dateTo', dateTo.toISOString());

      const response = await axios.get(`${API_BASE_URL}/moderation/statistics?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get moderation statistics error:', error);
      return this.getMockModerationStatistics();
    }
  }

  // Get moderation rules
  public async getModerationRules(): Promise<AturanModerasi[]> {
    try {
      if (!this.authController.isAuthenticated()) {
        return [];
      }

      const cacheKey = 'moderation-rules';
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${API_BASE_URL}/moderation/rules`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        const rules = response.data.data;
        this.setCache(cacheKey, rules, 30 * 60 * 1000); // 30 minutes
        return rules;
      }

      return [];
    } catch (error: any) {
      console.error('Get moderation rules error:', error);
      return this.getMockModerationRules();
    }
  }

  // Create/Update moderation rule
  public async saveModerationRule(rule: Partial<AturanModerasi>): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const url = rule.id 
        ? `${API_BASE_URL}/moderation/rules/${rule.id}`
        : `${API_BASE_URL}/moderation/rules`;
      
      const method = rule.id ? 'put' : 'post';

      const response = await axios[method](url, rule, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        // Clear cache
        this.cache.delete('moderation-rules');
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Save moderation rule error:', error);
      return true; // Mock success for development
    }
  }

  // Delete moderation rule
  public async deleteModerationRule(ruleId: string): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.delete(`${API_BASE_URL}/moderation/rules/${ruleId}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        // Clear cache
        this.cache.delete('moderation-rules');
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Delete moderation rule error:', error);
      return true; // Mock success for development
    }
  }

  // Get response templates
  public async getResponseTemplates(): Promise<TemplateModerasiResponse[]> {
    try {
      if (!this.authController.isAuthenticated()) {
        return [];
      }

      const cacheKey = 'response-templates';
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${API_BASE_URL}/moderation/templates`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        const templates = response.data.data;
        this.setCache(cacheKey, templates, 60 * 60 * 1000); // 1 hour
        return templates;
      }

      return [];
    } catch (error: any) {
      console.error('Get response templates error:', error);
      return this.getMockResponseTemplates();
    }
  }

  // Send response to user
  public async sendResponseToUser(
    itemId: string,
    templateId: string,
    customMessage?: string,
    variables?: { [key: string]: string }
  ): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.post(`${API_BASE_URL}/moderation/items/${itemId}/respond`, {
        templateId,
        customMessage,
        variables
      }, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Send response to user error:', error);
      return true; // Mock success for development
    }
  }

  // Cache management
  private getFromCache(key: string): any {
    const expiry = this.cacheExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  private setCache(key: string, value: any, ttl: number): void {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + ttl);
  }

  // Format date and time
  public formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  // Get priority color
  public getPriorityColor(priority: string): string {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      urgent: '#DC2626'
    };
    return colors[priority as keyof typeof colors] || '#6B7280';
  }

  // Get status color
  public getStatusColor(status: string): string {
    const colors = {
      pending: '#F59E0B',
      approved: '#10B981',
      rejected: '#EF4444',
      flagged: '#DC2626',
      under_review: '#3B82F6',
      auto_approved: '#059669'
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  }

  // Mock data for development
  private getMockModerationQueue(): { items: ItemModerasi[]; pagination: any } {
    return {
      items: [
        {
          id: 'mod-1',
          type: 'iklan',
          contentId: 'iklan-123',
          userId: 'user-456',
          userInfo: {
            name: 'John Doe',
            email: 'john@example.com',
            reputation: 85
          },
          content: {
            title: 'Toyota Camry 2023 - Kondisi Prima',
            description: 'Dijual Toyota Camry 2023 warna putih, kondisi sangat baik...',
            images: ['/images/cars/camry-1.jpg']
          },
          status: 'pending',
          priority: 'medium',
          flags: [
            {
              id: 'flag-1',
              type: 'misleading',
              reason: 'Harga terlalu murah untuk tahun tersebut',
              reportedBy: 'user-789',
              severity: 'medium',
              reportedAt: new Date('2024-01-15T10:00:00Z'),
              status: 'open'
            }
          ],
          autoModerationResult: {
            id: 'auto-1',
            engine: 'ml_classifier',
            confidence: 75,
            decision: 'review_required',
            reasons: ['Price anomaly detected'],
            detectedIssues: [
              {
                type: 'price_anomaly',
                confidence: 75,
                description: 'Price significantly below market average'
              }
            ],
            processedAt: new Date('2024-01-15T09:30:00Z')
          },
          moderatorActions: [],
          createdAt: new Date('2024-01-15T09:00:00Z'),
          updatedAt: new Date('2024-01-15T10:00:00Z')
        }
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1
      }
    };
  }

  private getMockModerationItem(itemId: string): ItemModerasi {
    const mockData = this.getMockModerationQueue().items[0];
    return { ...mockData, id: itemId };
  }

  private getMockModerationStatistics(): StatistikModerasi {
    return {
      overview: {
        totalPending: 45,
        totalReviewed: 234,
        totalFlagged: 12,
        averageReviewTime: 15,
        autoApprovalRate: 78
      },
      byType: {
        iklan: { pending: 20, approved: 150, rejected: 25, flagged: 5 },
        ulasan: { pending: 15, approved: 80, rejected: 10, flagged: 3 },
        komentar: { pending: 10, approved: 200, rejected: 15, flagged: 4 }
      },
      byModerator: {
        'mod-1': { reviewed: 50, averageTime: 12, accuracy: 95 },
        'mod-2': { reviewed: 40, averageTime: 18, accuracy: 92 }
      },
      trends: [
        { date: new Date('2024-01-01'), pending: 30, reviewed: 45, flagged: 5 },
        { date: new Date('2024-01-02'), pending: 35, reviewed: 50, flagged: 3 },
        { date: new Date('2024-01-03'), pending: 40, reviewed: 55, flagged: 7 }
      ],
      flagReasons: [
        { reason: 'Spam', count: 25, percentage: 35 },
        { reason: 'Inappropriate', count: 20, percentage: 28 },
        { reason: 'Misleading', count: 15, percentage: 21 },
        { reason: 'Other', count: 11, percentage: 16 }
      ]
    };
  }

  private getMockModerationRules(): AturanModerasi[] {
    return [
      {
        id: 'rule-1',
        name: 'Auto Approve Verified Users',
        description: 'Automatically approve content from verified users with high reputation',
        type: 'custom',
        contentTypes: ['iklan', 'ulasan'],
        conditions: [
          { field: 'user.verified', operator: 'equals', value: true },
          { field: 'user.reputation', operator: 'greater_than', value: 90 }
        ],
        actions: [
          { type: 'auto_approve' }
        ],
        priority: 1,
        active: true,
        createdBy: 'admin-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        statistics: {
          triggered: 150,
          accuracy: 95,
          falsePositives: 2
        }
      }
    ];
  }

  private getMockResponseTemplates(): TemplateModerasiResponse[] {
    return [
      {
        id: 'template-1',
        name: 'Approval Notification',
        type: 'approval',
        subject: 'Konten Anda Telah Disetujui',
        content: 'Selamat! Konten {{contentType}} Anda "{{contentTitle}}" telah disetujui dan sekarang dapat dilihat oleh pengguna lain.',
        variables: ['contentType', 'contentTitle'],
        language: 'id',
        active: true
      },
      {
        id: 'template-2',
        name: 'Rejection Notification',
        type: 'rejection',
        subject: 'Konten Anda Ditolak',
        content: 'Maaf, konten {{contentType}} Anda "{{contentTitle}}" tidak dapat disetujui karena: {{reason}}',
        variables: ['contentType', 'contentTitle', 'reason'],
        language: 'id',
        active: true
      }
    ];
  }
}

export default KontrollerModerasi;