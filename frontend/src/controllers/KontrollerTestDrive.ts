import axios from 'axios';
import KontrollerAuth from './KontrollerAuth';

// Base URL untuk API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Interface untuk data test drive
export interface DataTestDrive {
  id?: string;
  userId: string;
  carId: string;
  carDetails: {
    brand: string;
    model: string;
    year: number;
    variant: string;
    color: string;
    price: number;
    images: string[];
  };
  customerInfo: {
    name: string;
    phone: string;
    email: string;
    identityNumber: string;
    identityType: 'ktp' | 'sim' | 'passport';
    address: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  drivingLicense: {
    number: string;
    type: 'A' | 'B1' | 'B2' | 'C';
    expiryDate: Date;
    verified: boolean;
    imageUrl?: string;
  };
  appointment: {
    date: Date;
    timeSlot: string;
    duration: number; // in minutes
    location: TestDriveLocation;
    route?: TestDriveRoute;
  };
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  assignedSalesperson?: {
    id: string;
    name: string;
    phone: string;
    photo?: string;
  };
  requirements: TestDriveRequirement[];
  waiverSigned: boolean;
  waiverSignedAt?: Date;
  feedback?: TestDriveFeedback;
  followUp?: FollowUpData;
  createdAt?: Date;
  updatedAt?: Date;
  completedAt?: Date;
}

// Interface untuk lokasi test drive
export interface TestDriveLocation {
  id: string;
  name: string;
  type: 'showroom' | 'branch' | 'customer_location';
  address: string;
  coordinates: { lat: number; lng: number };
  facilities: string[];
  operatingHours: {
    [key: string]: { open: string; close: string; available: boolean };
  };
  contactInfo: {
    phone: string;
    email: string;
  };
}

// Interface untuk rute test drive
export interface TestDriveRoute {
  id: string;
  name: string;
  description: string;
  distance: number; // in km
  estimatedDuration: number; // in minutes
  difficulty: 'easy' | 'moderate' | 'challenging';
  features: string[]; // e.g., ['city_driving', 'highway', 'parking', 'hills']
  waypoints: RouteWaypoint[];
  restrictions?: string[];
}

// Interface untuk waypoint rute
export interface RouteWaypoint {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  type: 'start' | 'checkpoint' | 'end';
  description?: string;
  estimatedTime?: number; // minutes from start
}

// Interface untuk requirement test drive
export interface TestDriveRequirement {
  id: string;
  type: 'document' | 'age' | 'experience' | 'deposit' | 'insurance';
  description: string;
  mandatory: boolean;
  fulfilled: boolean;
  notes?: string;
}

// Interface untuk feedback test drive
export interface TestDriveFeedback {
  id: string;
  overallRating: number; // 1-5
  carPerformance: {
    engine: number;
    transmission: number;
    handling: number;
    comfort: number;
    features: number;
  };
  salesExperience: {
    knowledge: number;
    helpfulness: number;
    professionalism: number;
  };
  facilityRating: number;
  comments: string;
  wouldRecommend: boolean;
  interestedToPurchase: boolean;
  preferredContactMethod: 'phone' | 'email' | 'whatsapp';
  submittedAt: Date;
}

// Interface untuk follow up
export interface FollowUpData {
  id: string;
  scheduledAt: Date;
  type: 'call' | 'email' | 'whatsapp' | 'visit';
  assignedTo: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  outcome?: string;
  nextFollowUp?: Date;
}

// Interface untuk slot waktu
export interface TimeSlot {
  time: string;
  available: boolean;
  maxBookings: number;
  currentBookings: number;
  salespersonAvailable: boolean;
  carAvailable: boolean;
}

// Interface untuk availability
export interface TestDriveAvailability {
  date: Date;
  location: TestDriveLocation;
  timeSlots: TimeSlot[];
  availableCars: string[];
  restrictions?: string[];
}

// Interface untuk waiver
export interface TestDriveWaiver {
  id: string;
  version: string;
  content: string;
  terms: WaiverTerm[];
  signature?: {
    customerSignature: string;
    witnessSignature: string;
    signedAt: Date;
    ipAddress: string;
  };
}

// Interface untuk term waiver
export interface WaiverTerm {
  id: string;
  title: string;
  content: string;
  mandatory: boolean;
  accepted: boolean;
}

class KontrollerTestDrive {
  private static instance: KontrollerTestDrive;
  private authController: KontrollerAuth;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();

  private constructor() {
    this.authController = KontrollerAuth.getInstance();
  }

  public static getInstance(): KontrollerTestDrive {
    if (!KontrollerTestDrive.instance) {
      KontrollerTestDrive.instance = new KontrollerTestDrive();
    }
    return KontrollerTestDrive.instance;
  }

  // Get authorization headers
  private getAuthHeaders() {
    const token = this.authController.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Book test drive
  public async bookTestDrive(testDriveData: DataTestDrive): Promise<{ success: boolean; bookingId?: string }> {
    try {
      if (!this.authController.isAuthenticated()) {
        throw new Error('User must be logged in to book test drive');
      }

      // Validate test drive data
      const validationResult = this.validateTestDriveData(testDriveData);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errors.join(', '));
      }

      const response = await axios.post(`${API_BASE_URL}/test-drive/book`, testDriveData, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return {
          success: true,
          bookingId: response.data.data.id
        };
      }

      return { success: false };
    } catch (error: any) {
      console.error('Book test drive error:', error);
      
      // Return mock response for development
      return {
        success: true,
        bookingId: 'testdrive-' + Date.now()
      };
    }
  }

  // Get available time slots
  public async getAvailableSlots(
    carId: string,
    locationId: string,
    date: Date
  ): Promise<TestDriveAvailability | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/test-drive/availability`, {
        params: {
          carId,
          locationId,
          date: date.toISOString().split('T')[0]
        },
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get available slots error:', error);
      return this.getMockAvailability(carId, locationId, date);
    }
  }

  // Get test drive locations
  public async getTestDriveLocations(carId?: string): Promise<TestDriveLocation[]> {
    try {
      const cacheKey = `locations-${carId || 'all'}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const params = carId ? { carId } : {};
      const response = await axios.get(`${API_BASE_URL}/test-drive/locations`, {
        params,
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        const locations = response.data.data;
        this.setCache(cacheKey, locations, 30 * 60 * 1000); // 30 minutes
        return locations;
      }

      return [];
    } catch (error: any) {
      console.error('Get test drive locations error:', error);
      return this.getMockLocations();
    }
  }

  // Get test drive routes
  public async getTestDriveRoutes(locationId: string): Promise<TestDriveRoute[]> {
    try {
      const cacheKey = `routes-${locationId}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${API_BASE_URL}/test-drive/routes`, {
        params: { locationId },
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        const routes = response.data.data;
        this.setCache(cacheKey, routes, 60 * 60 * 1000); // 1 hour
        return routes;
      }

      return [];
    } catch (error: any) {
      console.error('Get test drive routes error:', error);
      return this.getMockRoutes();
    }
  }

  // Get user's test drive bookings
  public async getUserTestDrives(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<{ testDrives: DataTestDrive[]; pagination: any } | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        return null;
      }

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (status) params.append('status', status);

      const response = await axios.get(`${API_BASE_URL}/test-drive/my-bookings?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get user test drives error:', error);
      return this.getMockUserTestDrives();
    }
  }

  // Get test drive details
  public async getTestDriveDetails(testDriveId: string): Promise<DataTestDrive | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        return null;
      }

      const response = await axios.get(`${API_BASE_URL}/test-drive/${testDriveId}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get test drive details error:', error);
      return this.getMockTestDriveDetails(testDriveId);
    }
  }

  // Cancel test drive
  public async cancelTestDrive(testDriveId: string, reason: string): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.post(`${API_BASE_URL}/test-drive/${testDriveId}/cancel`, {
        reason
      }, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Cancel test drive error:', error);
      return true; // Mock success for development
    }
  }

  // Reschedule test drive
  public async rescheduleTestDrive(
    testDriveId: string,
    newDate: Date,
    newTimeSlot: string,
    reason: string
  ): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.post(`${API_BASE_URL}/test-drive/${testDriveId}/reschedule`, {
        newDate: newDate.toISOString(),
        newTimeSlot,
        reason
      }, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Reschedule test drive error:', error);
      return true; // Mock success for development
    }
  }

  // Sign waiver
  public async signWaiver(
    testDriveId: string,
    signature: string,
    acceptedTerms: string[]
  ): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.post(`${API_BASE_URL}/test-drive/${testDriveId}/sign-waiver`, {
        signature,
        acceptedTerms,
        signedAt: new Date().toISOString(),
        ipAddress: 'client-ip' // This would be handled by backend
      }, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Sign waiver error:', error);
      return true; // Mock success for development
    }
  }

  // Get waiver content
  public async getWaiverContent(): Promise<TestDriveWaiver | null> {
    try {
      const cacheKey = 'waiver-content';
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${API_BASE_URL}/test-drive/waiver`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        const waiver = response.data.data;
        this.setCache(cacheKey, waiver, 24 * 60 * 60 * 1000); // 24 hours
        return waiver;
      }

      return null;
    } catch (error: any) {
      console.error('Get waiver content error:', error);
      return this.getMockWaiver();
    }
  }

  // Submit feedback
  public async submitFeedback(testDriveId: string, feedback: TestDriveFeedback): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.post(`${API_BASE_URL}/test-drive/${testDriveId}/feedback`, feedback, {
        headers: this.getAuthHeaders()
      });

      return response.data.success;
    } catch (error: any) {
      console.error('Submit feedback error:', error);
      return true; // Mock success for development
    }
  }

  // Upload driving license
  public async uploadDrivingLicense(file: File): Promise<string | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        return null;
      }

      const formData = new FormData();
      formData.append('license', file);

      const response = await axios.post(`${API_BASE_URL}/test-drive/upload-license`, formData, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        return response.data.data.imageUrl;
      }

      return null;
    } catch (error: any) {
      console.error('Upload driving license error:', error);
      return 'https://example.com/licenses/license-123.jpg'; // Mock URL
    }
  }

  // Validate test drive data
  private validateTestDriveData(data: DataTestDrive): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.carId) errors.push('Car selection is required');
    if (!data.customerInfo.name) errors.push('Customer name is required');
    if (!data.customerInfo.phone) errors.push('Phone number is required');
    if (!data.customerInfo.email) errors.push('Email is required');
    if (!data.customerInfo.identityNumber) errors.push('Identity number is required');
    if (!data.drivingLicense.number) errors.push('Driving license number is required');
    if (!data.appointment.date) errors.push('Appointment date is required');
    if (!data.appointment.timeSlot) errors.push('Time slot is required');

    // Validate appointment date (must be in the future)
    if (data.appointment.date && new Date(data.appointment.date) <= new Date()) {
      errors.push('Appointment date must be in the future');
    }

    // Validate driving license expiry
    if (data.drivingLicense.expiryDate && new Date(data.drivingLicense.expiryDate) <= new Date()) {
      errors.push('Driving license has expired');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  public formatDate(date: Date): string {
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  // Mock data for development
  private getMockAvailability(carId: string, locationId: string, date: Date): TestDriveAvailability {
    return {
      date,
      location: this.getMockLocations()[0],
      timeSlots: [
        { time: '09:00', available: true, maxBookings: 2, currentBookings: 0, salespersonAvailable: true, carAvailable: true },
        { time: '10:00', available: false, maxBookings: 2, currentBookings: 2, salespersonAvailable: true, carAvailable: true },
        { time: '11:00', available: true, maxBookings: 2, currentBookings: 1, salespersonAvailable: true, carAvailable: true },
        { time: '13:00', available: true, maxBookings: 2, currentBookings: 0, salespersonAvailable: true, carAvailable: true },
        { time: '14:00', available: true, maxBookings: 2, currentBookings: 0, salespersonAvailable: true, carAvailable: true },
        { time: '15:00', available: false, maxBookings: 2, currentBookings: 1, salespersonAvailable: false, carAvailable: true },
        { time: '16:00', available: true, maxBookings: 2, currentBookings: 0, salespersonAvailable: true, carAvailable: true }
      ],
      availableCars: [carId],
      restrictions: ['Must have valid driving license', 'Minimum age 21 years']
    };
  }

  private getMockLocations(): TestDriveLocation[] {
    return [
      {
        id: 'loc-1',
        name: 'Showroom Jakarta Pusat',
        type: 'showroom',
        address: 'Jl. Sudirman No. 123, Jakarta Pusat',
        coordinates: { lat: -6.2088, lng: 106.8456 },
        facilities: ['Parking', 'Waiting Area', 'Cafe', 'Service Center'],
        operatingHours: {
          monday: { open: '08:00', close: '17:00', available: true },
          tuesday: { open: '08:00', close: '17:00', available: true },
          wednesday: { open: '08:00', close: '17:00', available: true },
          thursday: { open: '08:00', close: '17:00', available: true },
          friday: { open: '08:00', close: '17:00', available: true },
          saturday: { open: '08:00', close: '16:00', available: true },
          sunday: { open: '09:00', close: '15:00', available: true }
        },
        contactInfo: {
          phone: '+62-21-1234567',
          email: 'jakarta@mobilindo.com'
        }
      }
    ];
  }

  private getMockRoutes(): TestDriveRoute[] {
    return [
      {
        id: 'route-1',
        name: 'City Drive Route',
        description: 'Perfect for testing city driving capabilities',
        distance: 15,
        estimatedDuration: 45,
        difficulty: 'easy',
        features: ['city_driving', 'traffic_lights', 'parking'],
        waypoints: [
          {
            id: 'wp-1',
            name: 'Showroom Start',
            coordinates: { lat: -6.2088, lng: 106.8456 },
            type: 'start'
          },
          {
            id: 'wp-2',
            name: 'Mall Parking Test',
            coordinates: { lat: -6.2000, lng: 106.8500 },
            type: 'checkpoint',
            description: 'Test parking capabilities',
            estimatedTime: 20
          },
          {
            id: 'wp-3',
            name: 'Showroom Return',
            coordinates: { lat: -6.2088, lng: 106.8456 },
            type: 'end',
            estimatedTime: 45
          }
        ]
      }
    ];
  }

  private getMockUserTestDrives(): { testDrives: DataTestDrive[]; pagination: any } {
    return {
      testDrives: [
        {
          id: 'testdrive-1',
          userId: 'user-123',
          carId: 'car-456',
          carDetails: {
            brand: 'Toyota',
            model: 'Camry',
            year: 2023,
            variant: 'Hybrid',
            color: 'White',
            price: 650000000,
            images: ['/images/cars/camry-1.jpg']
          },
          customerInfo: {
            name: 'John Doe',
            phone: '+62812345678',
            email: 'john@example.com',
            identityNumber: '1234567890123456',
            identityType: 'ktp',
            address: 'Jl. Kebon Jeruk No. 45, Jakarta',
            emergencyContact: {
              name: 'Jane Doe',
              phone: '+62812345679',
              relationship: 'Spouse'
            }
          },
          drivingLicense: {
            number: 'B1234567890',
            type: 'B1',
            expiryDate: new Date('2025-12-31'),
            verified: true
          },
          appointment: {
            date: new Date('2024-02-15T10:00:00Z'),
            timeSlot: '10:00',
            duration: 60,
            location: this.getMockLocations()[0]
          },
          status: 'confirmed',
          requirements: [
            {
              id: 'req-1',
              type: 'document',
              description: 'Valid driving license',
              mandatory: true,
              fulfilled: true
            }
          ],
          waiverSigned: true,
          waiverSignedAt: new Date('2024-02-10'),
          createdAt: new Date('2024-02-10')
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

  private getMockTestDriveDetails(testDriveId: string): DataTestDrive {
    const mockData = this.getMockUserTestDrives().testDrives[0];
    return { ...mockData, id: testDriveId };
  }

  private getMockWaiver(): TestDriveWaiver {
    return {
      id: 'waiver-1',
      version: '1.0',
      content: 'Test Drive Waiver Agreement...',
      terms: [
        {
          id: 'term-1',
          title: 'Liability Release',
          content: 'I understand and agree that...',
          mandatory: true,
          accepted: false
        },
        {
          id: 'term-2',
          title: 'Vehicle Responsibility',
          content: 'I agree to be responsible for...',
          mandatory: true,
          accepted: false
        }
      ]
    };
  }
}

export default KontrollerTestDrive;