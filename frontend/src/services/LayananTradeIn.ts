// LayananTradeIn.ts
// Service untuk mengelola operasi CRUD trade-in dengan Supabase
import { supabase, supabaseAdmin } from '../lib/supabase';

// ==================== INTERACES ====================
export interface TradeInRequest {
  id: string;
  user_id: string;
  new_car_id: string;
  old_car_brand: string;
  old_car_model: string;
  old_car_year: number;
  old_car_mileage?: number;
  old_car_color?: string;
  old_car_transmission?: string;
  old_car_fuel_type?: string;
  old_car_condition?: string;
  old_car_plate_number?: string;
  old_car_description?: string;
  estimated_value?: number;
  appraised_value?: number;
  final_trade_in_value?: number;
  price_difference?: number;
  inspection_date?: string;
  inspection_time?: string;
  inspection_location?: string;
  inspection_notes?: string;
  inspector_id?: string;
  status: 'pending' | 'inspecting' | 'appraised' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  contract_url?: string;
  user_notes?: string;
  rejection_reason?: string;
  submission_date?: string;
  inspected_at?: string;
  approved_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TradeInImage {
  id: string;
  trade_in_id: string;
  image_url: string;
  image_type?: string;
  display_order?: number;
  caption?: string;
  created_at: string;
}

export interface TradeInRequestWithRelations extends TradeInRequest {
  new_car?: {
    id: string;
    title: string;
    price: number;
    brand?: string;
    model?: string;
    year?: number;
  };
  images: TradeInImage[];
}

export interface TradeInFormData {
  new_car_id: string;
  old_car_brand: string;
  old_car_model: string;
  old_car_year: number;
  old_car_mileage?: number;
  old_car_color?: string;
  old_car_transmission?: string;
  old_car_fuel_type?: string;
  old_car_condition?: string;
  old_car_plate_number?: string;
  old_car_description?: string;
  estimated_value?: number;
  inspection_date?: string;
  inspection_time?: string;
  inspection_location?: string;
  user_notes?: string;
  images: File[];
}

export interface TradeInUpdateData {
  appraised_value?: number;
  final_trade_in_value?: number;
  price_difference?: number;
  inspection_date?: string;
  inspection_time?: string;
  inspection_location?: string;
  inspection_notes?: string;
  inspector_id?: string;
  status?: 'pending' | 'inspecting' | 'appraised' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  contract_url?: string;
  user_notes?: string;
  rejection_reason?: string;
  inspected_at?: string;
  approved_at?: string;
  completed_at?: string;
}

export interface TradeInFilters {
  status?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// ==================== CRUD OPERATIONS ====================

// Mendapatkan semua permintaan trade-in (untuk admin)
export const getAllTradeInRequests = async (
  filters?: TradeInFilters,
  page: number = 1,
  limit: number = 10
): Promise<{ data: TradeInRequestWithRelations[], count: number, error: any }> => {
  try {
    console.log('🔍 getAllTradeInRequests called with:', { filters, page, limit });
    console.log('Using supabaseAdmin for admin access');

    let query = supabaseAdmin
      .from('trade_in_requests')
      .select(`
        *,
        new_car:cars(
          id,
          title,
          price,
          brand_id,
          model_id,
          year
        ),
        trade_in_images(*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    if (filters?.search) {
      query = query.or(`old_car_brand.ilike.%${filters.search}%,old_car_model.ilike.%${filters.search}%,old_car_plate_number.ilike.%${filters.search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    console.log('📊 Query result:', {
      dataLength: data?.length || 0,
      count,
      error: error?.message,
      sampleData: data?.slice(0, 1)
    });

    // Normalisasi: map trade_in_images → images dengan urutan display_order
    const normalized = (data || []).map((item: any) => ({
      ...item,
      images: Array.isArray(item.trade_in_images)
        ? [...item.trade_in_images].sort(
            (a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)
          )
        : []
    }));

    return {
      data: normalized as TradeInRequestWithRelations[],
      count: count || 0,
      error
    };
  } catch (error) {
    console.error('❌ getAllTradeInRequests error:', error);
    return { data: [], count: 0, error };
  }
};

// Mendapatkan trade-in requests milik user tertentu
export const getUserTradeInRequests = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ data: TradeInRequestWithRelations[], count: number, error: any }> => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('trade_in_requests')
      .select(`
        *,
        new_car:cars(
          id,
          title,
          price,
          brand_id,
          model_id,
          year
        ),
        trade_in_images(*)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    // Normalisasi: map trade_in_images → images dengan urutan display_order
    const normalized = (data || []).map((item: any) => ({
      ...item,
      images: Array.isArray(item.trade_in_images)
        ? [...item.trade_in_images].sort(
            (a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)
          )
        : []
    }));

    return {
      data: normalized as TradeInRequestWithRelations[],
      count: count || 0,
      error
    };
  } catch (error) {
    return { data: [], count: 0, error };
  }
};

// Mendapatkan detail trade-in request berdasarkan ID
export const getTradeInRequestById = async (id: string): Promise<{ data: TradeInRequestWithRelations | null, error: any }> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('trade_in_requests')
      .select(`
        *,
        new_car:cars(
          id,
          title,
          price,
          brand_id,
          model_id,
          year
        ),
        trade_in_images(*)
      `)
      .eq('id', id)
      .single();

    // Normalisasi: map trade_in_images → images dengan urutan display_order
    const normalized = data
      ? {
          ...(data as any),
          images: Array.isArray((data as any).trade_in_images)
            ? [...(data as any).trade_in_images].sort(
                (a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)
              )
            : []
        }
      : null;

    return { data: normalized as TradeInRequestWithRelations | null, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Membuat trade-in request baru
export const createTradeInRequest = async (
  formData: TradeInFormData,
  userId: string
): Promise<{ data: TradeInRequest | null, error: any }> => {
  try {
    // Skip UUID validation for now to focus on functionality
    // TODO: Add proper UUID validation later when using real database
    console.log('Creating trade-in request for user:', userId);
    console.log('New car ID:', formData.new_car_id);
    console.log('New car ID type:', typeof formData.new_car_id);
    console.log('Form data being submitted:', JSON.stringify(formData, null, 2));

    // Validate the car ID before submission
    if (!formData.new_car_id || typeof formData.new_car_id !== 'string' || formData.new_car_id === '1') {
      console.error('Invalid car ID detected before submission:', formData.new_car_id);
      return { data: null, error: { message: 'Invalid car ID format' } };
    }

    // 1. Insert trade-in request
    const { data: tradeInData, error: tradeInError } = await supabase
      .from('trade_in_requests')
      .insert({
        user_id: userId,
        new_car_id: formData.new_car_id,
        old_car_brand: formData.old_car_brand,
        old_car_model: formData.old_car_model,
        old_car_year: formData.old_car_year,
        old_car_mileage: formData.old_car_mileage,
        old_car_color: formData.old_car_color,
        old_car_transmission: formData.old_car_transmission,
        old_car_fuel_type: formData.old_car_fuel_type,
        old_car_condition: formData.old_car_condition,
        old_car_plate_number: formData.old_car_plate_number,
        old_car_description: formData.old_car_description,
        estimated_value: formData.estimated_value,
        inspection_date: formData.inspection_date,
        inspection_time: formData.inspection_time,
        inspection_location: formData.inspection_location,
        user_notes: formData.user_notes,
        status: 'pending'
      })
      .select()
      .single();

    if (tradeInError) {
      return { data: null, error: tradeInError };
    }

    // 2. Upload images jika ada
    if (formData.images && formData.images.length > 0) {
      console.log('Uploading images:', formData.images.length);

      const imagePromises = formData.images.map(async (image, index) => {
        try {
          // Validate image size (max 5MB)
          if (image.size > 5 * 1024 * 1024) {
            throw new Error(`Image ${image.name} is too large (max 5MB)`);
          }

          // Generate unique filename
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2, 9);
          const fileName = `trade-in/${tradeInData.id}/${timestamp}_${random}_${image.name}`;

          console.log('Uploading image:', fileName);

          // Upload image ke storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('trade-in-images')
            .upload(fileName, image, {
              contentType: image.type,
              cacheControl: '3600'
            });

          if (uploadError) {
            console.error('Upload error:', uploadError);
            throw uploadError;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('trade-in-images')
            .getPublicUrl(fileName);

          if (!urlData.publicUrl) {
            throw new Error('Failed to get public URL');
          }

          console.log('Image uploaded successfully:', urlData.publicUrl);

          // Insert image record
          const { error: imageError } = await supabase
            .from('trade_in_images')
            .insert({
              trade_in_id: tradeInData.id,
              image_url: urlData.publicUrl,
              image_type: image.type.startsWith('image/') ? image.type.split('/')[1] : 'unknown',
              display_order: index,
              caption: `Gambar ${index + 1}`
            });

          if (imageError) {
            console.error('Database insert error:', imageError);
            throw imageError;
          }

          return { success: true, url: urlData.publicUrl };
        } catch (error) {
          console.error(`Error uploading image ${image.name}:`, error);
          return { success: false, error, imageName: image.name };
        }
      });

      const results = await Promise.allSettled(imagePromises);
      const failedImages = results.filter(result =>
        result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
      );

      if (failedImages.length > 0) {
        console.warn(`${failedImages.length} images failed to upload`);
        // Don't fail the entire trade-in request if some images fail
      }
    }

    return { data: tradeInData as TradeInRequest, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

// Mengupdate trade-in request
export const updateTradeInRequest = async (
  id: string,
  updateData: TradeInUpdateData
): Promise<{ data: TradeInRequest | null, error: any }> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('trade_in_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    return { data: data as TradeInRequest, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Menghapus trade-in request
export const deleteTradeInRequest = async (id: string): Promise<{ error: any }> => {
  try {
    // Hapus images dari storage terlebih dahulu
    const { data: images } = await supabaseAdmin
      .from('trade_in_images')
      .select('image_url')
      .eq('trade_in_id', id);

    if (images && images.length > 0) {
      for (const image of images) {
        // Extract file path from URL
        const urlParts = image.image_url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const filePath = `trade-in/${id}/${fileName}`;

        await supabaseAdmin.storage
          .from('trade-in-images')
          .remove([filePath]);
      }
    }

    // Hapus trade-in request (cascade akan menghapus images dari database)
    const { error } = await supabaseAdmin
      .from('trade_in_requests')
      .delete()
      .eq('id', id);

    return { error };
  } catch (error) {
    return { error };
  }
};

// Menambahkan image ke trade-in request
export const addTradeInImage = async (
  tradeInId: string,
  image: File,
  caption?: string
): Promise<{ data: TradeInImage | null, error: any }> => {
  try {
    // Upload image
    const fileName = `trade-in/${tradeInId}/${Date.now()}_${image.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('trade-in-images')
      .upload(fileName, image);

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('trade-in-images')
      .getPublicUrl(fileName);

    // Get current display order
    const { data: existingImages } = await supabase
      .from('trade_in_images')
      .select('display_order')
      .eq('trade_in_id', tradeInId)
      .order('display_order', { ascending: false })
      .limit(1);

    const displayOrder = existingImages && existingImages.length > 0
      ? (existingImages[0].display_order || 0) + 1
      : 0;

    // Insert image record
    const { data, error } = await supabase
      .from('trade_in_images')
      .insert({
        trade_in_id: tradeInId,
        image_url: urlData.publicUrl,
        image_type: image.type.startsWith('image/') ? image.type.split('/')[1] : 'unknown',
        display_order: displayOrder,
        caption: caption || `Gambar ${displayOrder + 1}`
      })
      .select()
      .single();

    return { data: data as TradeInImage, error };
  } catch (error) {
    return { data: null, error };
  }
};

// Menghapus image trade-in
export const deleteTradeInImage = async (imageId: string): Promise<{ error: any }> => {
  try {
    // Get image data untuk menghapus dari storage
    const { data: imageData } = await supabase
      .from('trade_in_images')
      .select('image_url, trade_in_id')
      .eq('id', imageId)
      .single();

    if (imageData) {
      // Extract file path dari URL
      const urlParts = imageData.image_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `trade-in/${imageData.trade_in_id}/${fileName}`;

      // Hapus dari storage
      await supabase.storage
        .from('trade-in-images')
        .remove([filePath]);
    }

    // Hapus dari database
    const { error } = await supabase
      .from('trade_in_images')
      .delete()
      .eq('id', imageId);

    return { error };
  } catch (error) {
    return { error };
  }
};

// ==================== UTILITY FUNCTIONS ====================

// Mendapatkan statistik trade-in untuk dashboard admin
export const getTradeInStats = async (): Promise<{
  total: number;
  pending: number;
  inspecting: number;
  appraised: number;
  approved: number;
  rejected: number;
  completed: number;
  error: any;
}> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('trade_in_requests')
      .select('status');

    if (error) {
      return {
        total: 0,
        pending: 0,
        inspecting: 0,
        appraised: 0,
        approved: 0,
        rejected: 0,
        completed: 0,
        error
      };
    }

    const stats = {
      total: data.length,
      pending: data.filter(item => item.status === 'pending').length,
      inspecting: data.filter(item => item.status === 'inspecting').length,
      appraised: data.filter(item => item.status === 'appraised').length,
      approved: data.filter(item => item.status === 'approved').length,
      rejected: data.filter(item => item.status === 'rejected').length,
      completed: data.filter(item => item.status === 'completed').length,
      error: null
    };

    return stats;
  } catch (error) {
    return {
      total: 0,
      pending: 0,
      inspecting: 0,
      appraised: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      error
    };
  }
};

// Validasi form data
export const validateTradeInForm = (formData: Partial<TradeInFormData>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!formData.new_car_id) {
    errors.push('Mobil baru harus dipilih');
  }

  if (!formData.old_car_brand || formData.old_car_brand.trim() === '') {
    errors.push('Merek mobil lama harus diisi');
  }

  if (!formData.old_car_model || formData.old_car_model.trim() === '') {
    errors.push('Model mobil lama harus diisi');
  }

  if (!formData.old_car_year || formData.old_car_year < 1900 || formData.old_car_year > new Date().getFullYear() + 1) {
    errors.push('Tahun mobil lama tidak valid');
  }

  if (formData.old_car_mileage !== undefined && formData.old_car_mileage < 0) {
    errors.push('Jarak tempuh tidak boleh negatif');
  }

  if (formData.estimated_value !== undefined && formData.estimated_value < 0) {
    errors.push('Estimasi nilai tidak boleh negatif');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Export semua fungsi
export const TradeInService = {
  getAllTradeInRequests,
  getUserTradeInRequests,
  getTradeInRequestById,
  createTradeInRequest,
  updateTradeInRequest,
  deleteTradeInRequest,
  addTradeInImage,
  deleteTradeInImage,
  getTradeInStats,
  validateTradeInForm
};