// Service Types - Mobilindo Showroom
// Definisi tipe data untuk semua service layer

// Base Response Type
export interface BaseServiceResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
  requestId?: string;
}

// Core Service Response Types
export interface UserServiceResponse extends BaseServiceResponse {
  data?: {
    user?: any;
    users?: any[];
    profile?: any;
    preferences?: any;
    activities?: any[];
    statistics?: any;
  };
}

export interface SessionServiceResponse extends BaseServiceResponse {
  data?: {
    session?: any;
    token?: string;
    refreshToken?: string;
    expiresAt?: string;
    user?: any;
  };
}

export interface ValidationServiceResponse extends BaseServiceResponse {
  data?: {
    isValid?: boolean;
    errors?: string[];
    warnings?: string[];
    suggestions?: string[];
  };
}

// Business Service Response Types
export interface MobilServiceResponse extends BaseServiceResponse {
  data?: {
    mobil?: any;
    mobils?: any[];
    categories?: any[];
    brands?: any[];
    specifications?: any;
    pricing?: any;
    availability?: any;
  };
}

export interface TransaksiServiceResponse extends BaseServiceResponse {
  data?: {
    transaksi?: any;
    transaksis?: any[];
    invoice?: any;
    receipt?: any;
    status?: string;
    timeline?: any[];
  };
}

export interface PembayaranServiceResponse extends BaseServiceResponse {
  data?: {
    pembayaran?: any;
    pembayarans?: any[];
    methods?: any[];
    gateway?: any;
    status?: string;
    receipt?: any;
  };
}

export interface KreditServiceResponse extends BaseServiceResponse {
  data?: {
    kredit?: any;
    kredits?: any[];
    simulation?: any;
    approval?: any;
    terms?: any;
    schedule?: any[];
  };
}

// Content Service Response Types
export interface ArtikelServiceResponse extends BaseServiceResponse {
  data?: {
    artikel?: any;
    artikels?: any[];
    categories?: any[];
    tags?: any[];
    comments?: any[];
    statistics?: any;
  };
}

export interface KontenServiceResponse extends BaseServiceResponse {
  data?: {
    konten?: any;
    kontens?: any[];
    media?: any[];
    templates?: any[];
    categories?: any[];
  };
}

export interface PerbandinganServiceResponse extends BaseServiceResponse {
  data?: {
    perbandingan?: any;
    perbandingas?: any[];
    comparison?: any;
    recommendations?: any[];
    shareLink?: string;
  };
}

export interface RekomendasiServiceResponse extends BaseServiceResponse {
  data?: {
    rekomendasi?: any;
    rekomendasis?: any[];
    suggestions?: any[];
    personalized?: any[];
    trending?: any[];
  };
}

// User Interaction Service Response Types
export interface UlasanServiceResponse extends BaseServiceResponse {
  data?: {
    ulasan?: any;
    ulasans?: any[];
    statistics?: any;
    summary?: any;
    ratings?: any;
  };
}

export interface KomentarServiceResponse extends BaseServiceResponse {
  data?: {
    komentar?: any;
    komentars?: any[];
    replies?: any[];
    thread?: any;
    statistics?: any;
  };
}

export interface PenilaianServiceResponse extends BaseServiceResponse {
  data?: {
    penilaian?: any;
    penilaians?: any[];
    average?: number;
    distribution?: any;
    trends?: any;
  };
}

export interface BookmarkServiceResponse extends BaseServiceResponse {
  data?: {
    bookmark?: any;
    bookmarks?: any[];
    folders?: any[];
    statistics?: any;
  };
}

export interface WishlistServiceResponse extends BaseServiceResponse {
  data?: {
    wishlist?: any;
    wishlists?: any[];
    items?: any[];
    statistics?: any;
  };
}

// Communication Service Response Types
export interface ChatServiceResponse extends BaseServiceResponse {
  data?: {
    chat?: any;
    chats?: any[];
    messages?: any[];
    participants?: any[];
    statistics?: any;
  };
}

export interface ChatbotServiceResponse extends BaseServiceResponse {
  data?: {
    response?: string;
    suggestions?: string[];
    context?: any;
    session?: any;
    confidence?: number;
  };
}

// Analytics Service Response Types
export interface AnalitikServiceResponse extends BaseServiceResponse {
  data?: {
    analytics?: any;
    metrics?: any[];
    reports?: any[];
    insights?: any[];
    trends?: any;
  };
}

export interface KPIServiceResponse extends BaseServiceResponse {
  data?: {
    kpi?: any;
    kpis?: any[];
    dashboard?: any;
    targets?: any[];
    performance?: any;
  };
}

export interface DashboardServiceResponse extends BaseServiceResponse {
  data?: {
    dashboard?: any;
    widgets?: any[];
    metrics?: any[];
    charts?: any[];
    summary?: any;
  };
}

export interface BisnisServiceResponse extends BaseServiceResponse {
  data?: {
    analysis?: any;
    trends?: any[];
    projections?: any[];
    recommendations?: any[];
    reports?: any[];
  };
}

// Marketing Service Response Types
export interface IklanServiceResponse extends BaseServiceResponse {
  data?: {
    iklan?: any;
    iklans?: any[];
    campaigns?: any[];
    performance?: any;
    statistics?: any;
  };
}

export interface KemitraanServiceResponse extends BaseServiceResponse {
  data?: {
    kemitraan?: any;
    kemitraans?: any[];
    partners?: any[];
    agreements?: any[];
    performance?: any;
  };
}

// Utility Service Response Types
export interface PencarianServiceResponse extends BaseServiceResponse {
  data?: {
    results?: any[];
    suggestions?: string[];
    filters?: any[];
    pagination?: any;
    statistics?: any;
  };
}

export interface BerkasServiceResponse extends BaseServiceResponse {
  data?: {
    berkas?: any;
    berkass?: any[];
    upload?: any;
    download?: any;
    metadata?: any;
  };
}

export interface ExportServiceResponse extends BaseServiceResponse {
  data?: {
    export?: any;
    file?: any;
    url?: string;
    format?: string;
    status?: string;
  };
}

// AI Service Response Types
export interface AIServiceResponse extends BaseServiceResponse {
  data?: {
    prediction?: any;
    recommendations?: any[];
    analysis?: any;
    insights?: any[];
    confidence?: number;
  };
}

// Policy Service Response Types
export interface KebijakanServiceResponse extends BaseServiceResponse {
  data?: {
    kebijakan?: any[];
    policies?: any[];
    compliance?: any;
    governance?: any;
  };
}

// Common Data Types
export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface FilterData {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'regex';
  value: any;
}

export interface SortData {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SearchData {
  query: string;
  fields?: string[];
  filters?: FilterData[];
  sort?: SortData[];
  pagination?: PaginationData;
}

// Error Types
export interface ServiceError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  rule?: string;
}

// Cache Types
export interface CacheData<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
  tags?: string[];
}

// Event Types
export interface ServiceEvent {
  type: string;
  source: string;
  data: any;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

// Configuration Types
export interface ServiceConfig {
  apiUrl: string;
  timeout: number;
  retries: number;
  cache: {
    enabled: boolean;
    ttl: number;
    maxSize: number;
  };
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
  };
}

// Health Check Types
export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  details?: any;
  dependencies?: ServiceHealth[];
}

// Metrics Types
export interface ServiceMetrics {
  service: string;
  requests: {
    total: number;
    success: number;
    error: number;
    rate: number;
  };
  performance: {
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  errors: {
    total: number;
    rate: number;
    types: Record<string, number>;
  };
}

// Export all types
export type ServiceResponseType = 
  | UserServiceResponse
  | SessionServiceResponse
  | ValidationServiceResponse
  | MobilServiceResponse
  | TransaksiServiceResponse
  | PembayaranServiceResponse
  | KreditServiceResponse
  | ArtikelServiceResponse
  | KontenServiceResponse
  | PerbandinganServiceResponse
  | RekomendasiServiceResponse
  | UlasanServiceResponse
  | KomentarServiceResponse
  | PenilaianServiceResponse
  | BookmarkServiceResponse
  | WishlistServiceResponse
  | ChatServiceResponse
  | ChatbotServiceResponse
  | AnalitikServiceResponse
  | KPIServiceResponse
  | DashboardServiceResponse
  | BisnisServiceResponse
  | IklanServiceResponse
  | KemitraanServiceResponse
  | PencarianServiceResponse
  | BerkasServiceResponse
  | ExportServiceResponse
  | AIServiceResponse
  | KebijakanServiceResponse;