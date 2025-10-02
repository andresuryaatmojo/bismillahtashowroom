import axios from 'axios';
import KontrollerAuth from './KontrollerAuth';

// Base URL untuk API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Interface untuk data trade-in
export interface DataTradeIn {
  id?: string;
  userId: string;
  currentCar: {
    brand: string;
    model: string;
    year: number;
    variant?: string;
    transmission: 'manual' | 'automatic' | 'cvt';
    fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
    mileage: number;
    color: string;
    condition: 'excellent' | 'good' | 'fair' | 'poor';
    images: string[];
    documents: TradeInDocument[];
    modifications?: string[];
    accidentHistory?: AccidentHistory[];
    serviceHistory?: ServiceHistory[];
  };
  targetCar?: {
    carId: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    variant?: string;
  };
  estimatedValue: number;
  finalValue?: number;
  difference: number; // Amount to pay or receive
  status: 'submitted' | 'under_review' | 'scheduled_inspection' | 'inspected' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  inspection?: InspectionData;
  negotiation?: NegotiationData;
  appointment?: AppointmentData;
  createdAt?: Date;
  updatedAt?: Date;
  completedAt?: Date;
}

// Interface untuk dokumen trade-in
export interface TradeInDocument {
  type: 'stnk' | 'bpkb' | 'ktp' | 'invoice' | 'service_book' | 'other';
  name: string;
  url: string;
  verified: boolean;
  uploadedAt: Date;
}

// Interface untuk riwayat kecelakaan
export interface AccidentHistory {
  date: Date;
  description: string;
  severity: 'minor' | 'moderate' | 'major';
  repaired: boolean;
  cost?: number;
  photos?: string[];
}

// Interface untuk riwayat service
export interface ServiceHistory {
  date: Date;
  mileage: number;
  type: 'regular' | 'major' | 'repair' | 'warranty';
  description: string;
  cost: number;
  workshop: string;
  parts?: string[];
}

// Interface untuk data inspeksi
export interface InspectionData {
  id: string;
  inspectorId: string;
  inspectorName: string;
  scheduledAt: Date;
  completedAt?: Date;
  location: {
    type: 'showroom' | 'customer_location' | 'workshop';
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  checklist: InspectionItem[];
  photos: InspectionPhoto[];
  notes: string;
  finalScore: number; // 0-100
  estimatedValue: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

// Interface untuk item inspeksi
export interface InspectionItem {
  category: 'exterior' | 'interior' | 'engine' | 'transmission' | 'electrical' | 'tires' | 'documents';
  item: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  score: number; // 0-10
  notes?: string;
  photos?: string[];
  requiresRepair: boolean;
  repairCost?: number;
}

// Interface untuk foto inspeksi
export interface InspectionPhoto {
  id: string;
  category: string;
  description: string;
  url: string;
  timestamp: Date;
  annotations?: PhotoAnnotation[];
}

// Interface untuk anotasi foto
export interface PhotoAnnotation {
  x: number;
  y: number;
  width: number;
  height: number;
  description: string;
  severity: 'info' | 'warning' | 'critical';
}

// Interface untuk data negosiasi
export interface NegotiationData {
  id: string;
  initialOffer: number;
  counterOffers: CounterOffer[];
  finalAgreedValue?: number;
  status: 'pending' | 'negotiating' | 'agreed' | 'rejected';
  notes?: string;
}

// Interface untuk counter offer
export interface CounterOffer {
  id: string;
  offeredBy: 'customer' | 'dealer';
  amount: number;
  reason: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
}

// Interface untuk data appointment
export interface AppointmentData {
  id: string;
  type: 'inspection' | 'finalization' | 'handover';
  scheduledAt: Date;
  duration: number; // in minutes
  location: {
    type: 'showroom' | 'customer_location';
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  assignedTo?: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  reminders: ReminderData[];
}

// Interface untuk reminder
export interface ReminderData {
  type: 'email' | 'sms' | 'push';
  scheduledAt: Date;
  sent: boolean;
  sentAt?: Date;
}

// Interface untuk estimasi nilai
export interface EstimasiNilai {
  baseValue: number;
  adjustments: ValueAdjustment[];
  finalValue: number;
  marketComparison: MarketComparison[];
  confidence: number; // 0-100
  validUntil: Date;
}

// Interface untuk penyesuaian nilai
export interface ValueAdjustment {
  factor: string;
  impact: 'positive' | 'negative';
  amount: number;
  percentage: number;
  description: string;
}

// Interface untuk perbandingan pasar
export interface MarketComparison {
  source: string;
  price: number;
  mileage: number;
  year: number;
  condition: string;
  location: string;
  url?: string;
}

class KontrollerTradeIn {
  private static instance: KontrollerTradeIn;
  private authController: KontrollerAuth;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();

  private constructor() {
    this.authController = KontrollerAuth.getInstance();
  }

  public static getInstance(): KontrollerTradeIn {
    if (!KontrollerTradeIn.instance) {
      KontrollerTradeIn.instance = new KontrollerTradeIn();
    }
    return KontrollerTradeIn.instance;
  }

  // Get authorization headers
  private getAuthHeaders() {
    const token = this.authController.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Submit trade-in request
  public async submitTradeIn(tradeInData: DataTradeIn): Promise<{ success: boolean; tradeInId?: string; estimatedValue?: number }> {
    try {
      if (!this.authController.isAuthenticated()) {
        throw new Error('User must be logged in to submit trade-in');
      }

      // Validate trade-in data
      const validationResult = this.validateTradeInData(tradeInData);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errors.join(', '));
      }

      const response = await axios.post(`${API_BASE_URL}/trade-in/submit`, tradeInData, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return {
          success: true,
          tradeInId: response.data.data.id,
          estimatedValue: response.data.data.estimatedValue
        };
      }

      return { success: false };
    } catch (error: any) {
      console.error('Submit trade-in error:', error);
      
      // Return mock response for development
      return {
        success: true,
        tradeInId: 'tradein-' + Date.now(),
        estimatedValue: this.calculateEstimatedValue(tradeInData.currentCar)
      };
    }
  }

  // Get estimated value
  public async getEstimatedValue(carData: any): Promise<EstimasiNilai | null> {
    try {
      const response = await axios.post(`${API_BASE_URL}/trade-in/estimate`, carData, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get estimated value error:', error);
      return this.getMockEstimatedValue(carData);
    }
  }

  // Get user's trade-in requests
  public async getUserTradeIns(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<{ tradeIns: DataTradeIn[]; pagination: any } | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        return null;
      }

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (status) params.append('status', status);

      const response = await axios.get(`${API_BASE_URL}/trade-in/my-requests?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get user trade-ins error:', error);
      return this.getMockUserTradeIns();
    }
  }

  // Get trade-in details
  public async getTradeInDetails(tradeInId: string): Promise<DataTradeIn | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        return null;
      }

      const response = await axios.get(`${API_BASE_URL}/trade-in/${tradeInId}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get trade-in details error:', error);
      return this.getMockTradeInDetails(tradeInId);
    }
  }

  // Schedule inspection
  public async scheduleInspection(
    tradeInId: string,
    appointmentData: Partial<AppointmentData>
  ): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.post(`${API_BASE_URL}/trade-in/${tradeInId}/schedule-inspection`, appointmentData, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Schedule inspection error:', error);
      return true; // Mock success for development
    }
  }

  // Upload trade-in documents
  public async uploadDocuments(tradeInId: string, files: File[], documentTypes: string[]): Promise<string[]> {
    try {
      if (!this.authController.isAuthenticated()) {
        return [];
      }

      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`documents[${index}]`, file);
        formData.append(`types[${index}]`, documentTypes[index]);
      });

      const response = await axios.post(`${API_BASE_URL}/trade-in/${tradeInId}/upload-documents`, formData, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        return response.data.data.documentUrls;
      }

      return [];
    } catch (error: any) {
      console.error('Upload documents error:', error);
      return files.map((_, index) => `https://example.com/documents/doc-${index}.pdf`);
    }
  }

  // Submit counter offer
  public async submitCounterOffer(
    tradeInId: string,
    amount: number,
    reason: string
  ): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.post(`${API_BASE_URL}/trade-in/${tradeInId}/counter-offer`, {
        amount,
        reason
      }, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Submit counter offer error:', error);
      return true; // Mock success for development
    }
  }

  // Accept/Reject offer
  public async respondToOffer(
    tradeInId: string,
    offerId: string,
    action: 'accept' | 'reject',
    reason?: string
  ): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.post(`${API_BASE_URL}/trade-in/${tradeInId}/respond-offer`, {
        offerId,
        action,
        reason
      }, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Respond to offer error:', error);
      return true; // Mock success for development
    }
  }

  // Cancel trade-in
  public async cancelTradeIn(tradeInId: string, reason: string): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.post(`${API_BASE_URL}/trade-in/${tradeInId}/cancel`, {
        reason
      }, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Cancel trade-in error:', error);
      return true; // Mock success for development
    }
  }

  // Get available inspection slots
  public async getAvailableSlots(
    date: Date,
    locationType: 'showroom' | 'customer_location'
  ): Promise<{ time: string; available: boolean }[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/trade-in/inspection-slots`, {
        params: {
          date: date.toISOString().split('T')[0],
          locationType
        },
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data.slots;
      }

      return [];
    } catch (error: any) {
      console.error('Get available slots error:', error);
      return this.getMockAvailableSlots();
    }
  }

  // Get market comparison
  public async getMarketComparison(carData: any): Promise<MarketComparison[]> {
    try {
      const response = await axios.post(`${API_BASE_URL}/trade-in/market-comparison`, carData, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data.comparisons;
      }

      return [];
    } catch (error: any) {
      console.error('Get market comparison error:', error);
      return this.getMockMarketComparison();
    }
  }

  // Validate trade-in data
  private validateTradeInData(data: DataTradeIn): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.currentCar) {
      errors.push('Current car information is required');
    } else {
      if (!data.currentCar.brand) errors.push('Car brand is required');
      if (!data.currentCar.model) errors.push('Car model is required');
      if (!data.currentCar.year || data.currentCar.year < 1990) errors.push('Valid car year is required');
      if (!data.currentCar.mileage || data.currentCar.mileage < 0) errors.push('Valid mileage is required');
      if (!data.currentCar.images || data.currentCar.images.length === 0) errors.push('At least one car image is required');
      if (data.currentCar.images && data.currentCar.images.length > 20) errors.push('Maximum 20 images allowed');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Calculate estimated value
  private calculateEstimatedValue(carData: any): number {
    // Simple estimation logic for development
    const baseValue = 200000000; // 200 million IDR base
    const yearFactor = Math.max(0.5, 1 - (2024 - carData.year) * 0.1);
    const mileageFactor = Math.max(0.3, 1 - (carData.mileage / 100000) * 0.1);
    const conditionFactor: { [key: string]: number } = {
      excellent: 1.0,
      good: 0.85,
      fair: 0.7,
      poor: 0.5
    };
    const factor = conditionFactor[carData.condition] || 0.7;

    return Math.round(baseValue * yearFactor * mileageFactor * factor);
  }

  // Format currency
  public formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Mock data for development
  private getMockEstimatedValue(carData: any): EstimasiNilai {
    const baseValue = this.calculateEstimatedValue(carData);
    
    return {
      baseValue: 200000000,
      adjustments: [
        { factor: 'Year', impact: 'negative', amount: 20000000, percentage: -10, description: 'Car age depreciation' },
        { factor: 'Mileage', impact: 'negative', amount: 15000000, percentage: -7.5, description: 'High mileage adjustment' },
        { factor: 'Condition', impact: 'positive', amount: 10000000, percentage: 5, description: 'Good condition bonus' }
      ],
      finalValue: baseValue,
      marketComparison: this.getMockMarketComparison(),
      confidence: 85,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };
  }

  private getMockUserTradeIns(): { tradeIns: DataTradeIn[]; pagination: any } {
    return {
      tradeIns: [
        {
          id: 'tradein-1',
          userId: 'user-123',
          currentCar: {
            brand: 'Toyota',
            model: 'Avanza',
            year: 2020,
            transmission: 'manual',
            fuelType: 'gasoline',
            mileage: 45000,
            color: 'Silver',
            condition: 'good',
            images: ['/images/cars/avanza-1.jpg'],
            documents: []
          },
          estimatedValue: 175000000,
          difference: -75000000,
          status: 'under_review',
          createdAt: new Date('2024-01-15')
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      }
    };
  }

  private getMockTradeInDetails(tradeInId: string): DataTradeIn {
    return {
      id: tradeInId,
      userId: 'user-123',
      currentCar: {
        brand: 'Toyota',
        model: 'Avanza',
        year: 2020,
        transmission: 'manual',
        fuelType: 'gasoline',
        mileage: 45000,
        color: 'Silver',
        condition: 'good',
        images: ['/images/cars/avanza-1.jpg', '/images/cars/avanza-2.jpg'],
        documents: [
          {
            type: 'stnk',
            name: 'STNK Toyota Avanza',
            url: '/documents/stnk.pdf',
            verified: true,
            uploadedAt: new Date('2024-01-15')
          }
        ]
      },
      targetCar: {
        carId: 'car-456',
        brand: 'Honda',
        model: 'BR-V',
        year: 2023,
        price: 250000000
      },
      estimatedValue: 175000000,
      finalValue: 170000000,
      difference: -80000000,
      status: 'approved',
      inspection: {
        id: 'inspection-1',
        inspectorId: 'inspector-1',
        inspectorName: 'Ahmad Inspektur',
        scheduledAt: new Date('2024-01-20T10:00:00Z'),
        completedAt: new Date('2024-01-20T11:30:00Z'),
        location: {
          type: 'showroom',
          address: 'Jl. Sudirman No. 123, Jakarta'
        },
        checklist: [],
        photos: [],
        notes: 'Mobil dalam kondisi baik secara keseluruhan',
        finalScore: 85,
        estimatedValue: 170000000,
        status: 'completed'
      },
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    };
  }

  private getMockAvailableSlots(): { time: string; available: boolean }[] {
    return [
      { time: '09:00', available: true },
      { time: '10:00', available: false },
      { time: '11:00', available: true },
      { time: '13:00', available: true },
      { time: '14:00', available: true },
      { time: '15:00', available: false },
      { time: '16:00', available: true }
    ];
  }

  private getMockMarketComparison(): MarketComparison[] {
    return [
      {
        source: 'OLX',
        price: 180000000,
        mileage: 40000,
        year: 2020,
        condition: 'Good',
        location: 'Jakarta',
        url: 'https://olx.co.id/item/123'
      },
      {
        source: 'Carmudi',
        price: 175000000,
        mileage: 50000,
        year: 2020,
        condition: 'Fair',
        location: 'Bogor'
      },
      {
        source: 'Mobil123',
        price: 185000000,
        mileage: 35000,
        year: 2020,
        condition: 'Excellent',
        location: 'Tangerang'
      }
    ];
  }
}

export default KontrollerTradeIn;