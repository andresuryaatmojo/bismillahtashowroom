// testDriveService.ts
// Service untuk mengelola test drive requests
import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabaseAdmin';

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
  status: 'pending' | 'confirmed' | 'rescheduled' | 'reschedule_requested' | 'completed' | 'cancelled' | 'no_show';
  confirmed_by?: string;
  confirmed_at?: string;
  rejection_reason?: string;
  user_notes?: string;
  admin_notes?: string; // <- tambahkan ini agar HalamanRiwayatTestDrive bisa membaca admin_notes
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
  duration_minutes?: number;
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
      console.log('Fetching test drives for user:', userId);
      
      // Langsung query berdasarkan user_id
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
        console.error('Error fetching test drives for user:', error);
        return [];
      }
      
      console.log('Test drives for user:', data);
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
      console.log(`Attempting to cancel test drive: ID=${id}, UserID=${userId}`);
      
      // Check if test drive belongs to user
      const { data: testDrive, error: fetchError } = await supabaseAdmin
        .from('test_drive_requests')
        .select('user_id, status')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching test drive:', fetchError);
        return {
          success: false,
          error: `Gagal mengambil data test drive: ${fetchError.message}`
        };
      }

      if (!testDrive) {
        console.error('Test drive not found:', id);
        return {
          success: false,
          error: 'Test drive tidak ditemukan'
        };
      }

      console.log('Test drive found:', testDrive);

      if (testDrive.user_id !== userId) {
        console.error(`User ID mismatch: Expected=${userId}, Actual=${testDrive.user_id}`);
        return {
          success: false,
          error: 'Anda tidak memiliki akses untuk membatalkan test drive ini'
        };
      }

      if (testDrive.status === 'completed' || testDrive.status === 'cancelled') {
        console.error(`Invalid status for cancellation: ${testDrive.status}`);
        return {
          success: false,
          error: 'Test drive sudah selesai atau dibatalkan'
        };
      }

      console.log('Validation passed, updating test drive status to cancelled');
      
      // Update status to cancelled
      const now = new Date().toISOString();
      const updateData = {
        status: 'cancelled',
        cancelled_at: now,
        updated_at: now
      };
      
      console.log('Update data:', updateData);
      
      // Menggunakan supabaseAdmin untuk bypass RLS
      const { error } = await supabaseAdmin
        .from('test_drive_requests')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error cancelling test drive:', error);
        return {
          success: false,
          error: `Gagal membatalkan test drive: ${error.message}`
        };
      }

      console.log('Test drive successfully cancelled');
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

  /**
   * Confirm rescheduled test drive
   */
  async confirmRescheduledTestDrive(id: string, userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log(`Attempting to confirm rescheduled test drive: ID=${id}, UserID=${userId}`);
      
      // Check if test drive belongs to user and is in rescheduled status
      const { data: testDrive, error: fetchError } = await supabaseAdmin
        .from('test_drive_requests')
        .select('user_id, status')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching test drive:', fetchError);
        return {
          success: false,
          error: `Gagal mengambil data test drive: ${fetchError.message}`
        };
      }

      if (!testDrive) {
        console.error('Test drive not found:', id);
        return {
          success: false,
          error: 'Test drive tidak ditemukan'
        };
      }

      console.log('Test drive found:', testDrive);

      if (testDrive.user_id !== userId) {
        console.error(`User ID mismatch: Expected=${userId}, Actual=${testDrive.user_id}`);
        return {
          success: false,
          error: 'Anda tidak memiliki akses untuk mengonfirmasi test drive ini'
        };
      }

      if (testDrive.status !== 'rescheduled') {
        console.error(`Invalid status for confirmation: ${testDrive.status}`);
        return {
          success: false,
          error: 'Test drive tidak dalam status dijadwalkan ulang'
        };
      }

      console.log('Validation passed, updating test drive status to confirmed');
      
      // Update status to confirmed
      const now = new Date().toISOString();
      const updateData = {
        status: 'confirmed',
        confirmed_at: now,
        updated_at: now
      };
      
      console.log('Update data:', updateData);
      
      // Menggunakan supabaseAdmin untuk bypass RLS
      const { error } = await supabaseAdmin
        .from('test_drive_requests')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error confirming rescheduled test drive:', error);
        return {
          success: false,
          error: `Gagal mengonfirmasi jadwal baru: ${error.message}`
        };
      }

      console.log('Test drive successfully confirmed');
      return {
        success: true
      };
    } catch (error) {
      console.error('Error in confirmRescheduledTestDrive:', error);
      return {
        success: false,
        error: 'Terjadi kesalahan sistem'
      };
    }
  }

  /**
   * Request reschedule by user (propose a new date/time)
   */
  async requestReschedule(
    id: string,
    userId: string,
    newDate: string,
    newTime: string,
    userNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`User requesting reschedule: ID=${id}, UserID=${userId}, Date=${newDate}, Time=${newTime}`);

      const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(newDate);
      const timeOk = /^\d{2}:\d{2}$/.test(newTime);
      if (!dateOk || !timeOk) {
        return { success: false, error: 'Format tanggal atau waktu tidak valid (YYYY-MM-DD, HH:mm)' };
      }

      const { data: testDrive, error: fetchError } = await supabaseAdmin
        .from('test_drive_requests')
        .select('user_id, status')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching test drive for reschedule:', fetchError);
        return { success: false, error: `Gagal mengambil data test drive: ${fetchError.message}` };
      }
      if (!testDrive) {
        return { success: false, error: 'Test drive tidak ditemukan' };
      }
      if (testDrive.user_id !== userId) {
        return { success: false, error: 'Anda tidak memiliki akses untuk mengubah test drive ini' };
      }

      const allowed = ['pending', 'confirmed', 'rescheduled'];
      if (!allowed.includes(testDrive.status)) {
        return { success: false, error: 'Status test drive tidak memungkinkan pengajuan jadwal ulang' };
      }

      const now = new Date().toISOString();

      // Gunakan marker di user_notes untuk menandai pengajuan dari user
      const marker = '[USER_RESCHEDULE_REQUEST]';
      const cleanedNotes = (userNotes || '').replace(/^\[USER_RESCHEDULE_REQUEST\]\s?/, '');
      const updateData = {
        status: 'rescheduled',
        scheduled_date: newDate,
        scheduled_time: newTime,
        user_notes: userNotes || null,
        admin_notes: 'reschedule_requested_by_user', // gunakan kolom baru
        updated_at: now
      };

      const { error: updateError } = await supabaseAdmin
        .from('test_drive_requests')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        console.error('Error requesting reschedule:', updateError);
        return { success: false, error: `Gagal mengajukan jadwal ulang: ${updateError.message}` };
      }

      console.log('Reschedule request submitted successfully');
      return { success: true };
    } catch (error) {
      console.error('Error in requestReschedule:', error);
      return { success: false, error: 'Terjadi kesalahan sistem' };
    }
  }
}

// Export singleton instance
export const testDriveService = new TestDriveService();
export default testDriveService;