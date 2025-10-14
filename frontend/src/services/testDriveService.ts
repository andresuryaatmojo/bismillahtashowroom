// testDriveService.ts
// Service untuk mengelola test drive requests
import { supabase } from '../lib/supabase';

// ==================== INTERFACES ====================
export interface TestDriveRequest {
  id: string;
  user_id: string;
  car_id: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  location?: string;
  location_address?: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled' | 'no_show';
  confirmed_by?: string;
  confirmed_at?: string;
  rejection_reason?: string;
  user_notes?: string;
  feedback?: string;
  experience_rating?: number;
  is_interested?: boolean;
  completed_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTestDriveInput {
  car_id: string;
  scheduled_date: string;
  scheduled_time: string;
  user_notes?: string;
  location?: string;
}

export interface TestDriveWithDetails extends TestDriveRequest {
  cars: {
    id: string;
    title: string;
    year: number;
    price: number;
    car_brands: { name: string };
    car_models: { name: string };
  };
  users: {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
  };
}

// ==================== TEST DRIVE SERVICE ====================
class TestDriveService {
  /**
   * Create new test drive request
   */
  async createTestDrive(userId: string, input: CreateTestDriveInput): Promise<{
    success: boolean;
    data?: TestDriveRequest;
    error?: string;
  }> {
    try {
      console.log('Creating test drive with:', { userId, input });

      // Get current auth user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return {
          success: false,
          error: 'Anda harus login terlebih dahulu'
        };
      }

      // Validate input
      if (!input.car_id || !input.scheduled_date || !input.scheduled_time) {
        return {
          success: false,
          error: 'Data tidak lengkap'
        };
      }

      // Check if car exists and available
      const { data: car, error: carError } = await supabase
        .from('cars')
        .select('id, status')
        .eq('id', input.car_id)
        .single();

      if (carError || !car) {
        console.error('Car not found:', carError);
        return {
          success: false,
          error: 'Mobil tidak ditemukan'
        };
      }

      if (car.status !== 'available') {
        return {
          success: false,
          error: 'Mobil tidak tersedia untuk test drive'
        };
      }

      // Check existing pending requests
      const { data: existing } = await supabase
        .from('test_drive_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('car_id', input.car_id)
        .in('status', ['pending', 'confirmed'])
        .maybeSingle();

      if (existing) {
        return {
          success: false,
          error: 'Anda sudah memiliki permintaan test drive yang belum selesai untuk mobil ini'
        };
      }

      // Create test drive request
      const testDriveData = {
        user_id: user.id, // Use auth user ID directly
        car_id: input.car_id,
        scheduled_date: input.scheduled_date,
        scheduled_time: input.scheduled_time,
        duration_minutes: 30,
        location: input.location || 'Showroom',
        user_notes: input.user_notes || null,
        status: 'pending' as const
      };

      console.log('Inserting test drive:', testDriveData);

      const { data, error } = await supabase
        .from('test_drive_requests')
        .insert(testDriveData)
        .select()
        .single();

      if (error) {
        console.error('Error creating test drive:', error);
        return {
          success: false,
          error: `Gagal membuat permintaan: ${error.message}`
        };
      }

      console.log('Test drive created successfully:', data);

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error in createTestDrive:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan sistem'
      };
    }
  }

  /**
   * Get user's test drive requests
   */
  async getUserTestDrives(userId: string): Promise<TestDriveWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from('test_drive_requests')
        .select(`
          *,
          cars (
            id,
            title,
            year,
            price,
            car_brands (name),
            car_models (name)
          ),
          users (
            id,
            full_name,
            email,
            phone_number
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching test drives:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserTestDrives:', error);
      return [];
    }
  }

  /**
   * Get test drive by ID
   */
  async getTestDriveById(id: string): Promise<TestDriveWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('test_drive_requests')
        .select(`
          *,
          cars (
            id,
            title,
            year,
            price,
            car_brands (name),
            car_models (name)
          ),
          users (
            id,
            full_name,
            email,
            phone_number
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching test drive:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getTestDriveById:', error);
      return null;
    }
  }

  /**
   * Cancel test drive request
   */
  async cancelTestDrive(id: string, userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Check if test drive belongs to user
      const { data: testDrive } = await supabase
        .from('test_drive_requests')
        .select('user_id, status')
        .eq('id', id)
        .single();

      if (!testDrive) {
        return {
          success: false,
          error: 'Test drive tidak ditemukan'
        };
      }

      if (testDrive.user_id !== userId) {
        return {
          success: false,
          error: 'Anda tidak memiliki akses untuk membatalkan test drive ini'
        };
      }

      if (testDrive.status === 'completed' || testDrive.status === 'cancelled') {
        return {
          success: false,
          error: 'Test drive sudah selesai atau dibatalkan'
        };
      }

      // Update status to cancelled
      const { error } = await supabase
        .from('test_drive_requests')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error cancelling test drive:', error);
        return {
          success: false,
          error: 'Gagal membatalkan test drive'
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error in cancelTestDrive:', error);
      return {
        success: false,
        error: 'Terjadi kesalahan sistem'
      };
    }
  }

  /**
   * Check available time slots for a specific date
   */
  async getAvailableTimeSlots(carId: string, date: string): Promise<string[]> {
    try {
      // Get all booked time slots for this car on this date
      const { data: bookedSlots } = await supabase
        .from('test_drive_requests')
        .select('scheduled_time')
        .eq('car_id', carId)
        .eq('scheduled_date', date)
        .in('status', ['pending', 'confirmed']);

      // All possible time slots
      const allSlots = [
        '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'
      ];

      // Filter out booked slots
      const bookedTimes = (bookedSlots || []).map(slot => slot.scheduled_time);
      const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

      return availableSlots;
    } catch (error) {
      console.error('Error checking available slots:', error);
      return [];
    }
  }
}

// Export singleton instance
export const testDriveService = new TestDriveService();
export default testDriveService;