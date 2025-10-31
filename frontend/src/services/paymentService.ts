import { supabase } from '../lib/supabase';

// ==================== INTERFACES ====================

export interface Payment {
  id: string;
  transaction_id: string;
  payment_type: 'booking_fee' | 'down_payment' | 'installment' | 'full_payment'; // UPDATE: tambah booking_fee
  amount: number;
  payment_method: string;
  reference_code?: string;
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
  status: 'pending' | 'uploaded' | 'processing' | 'success' | 'rejected' | 'failed' | 'expired' | 'refunded'; // UPDATE: tambah uploaded & rejected
  proof_of_payment?: string;
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  
  // NEW: Rejection tracking fields
  rejected_by?: string;
  rejected_at?: string;
  rejection_count?: number;
  
  gateway_name?: string;
  gateway_transaction_id?: string;
  gateway_response?: any;
  notes?: string;
  payment_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentInput {
  transaction_id: string;
  payment_type: 'booking_fee' | 'down_payment' | 'installment' | 'full_payment'; // UPDATE
  amount: number;
  payment_method: string;
  reference_code?: string;
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
  proof_of_payment?: string;
  gateway_name?: string;
  gateway_transaction_id?: string;
  gateway_response?: any;
  notes?: string;
}

export interface UpdatePaymentInput {
  status?: 'pending' | 'uploaded' | 'processing' | 'success' | 'rejected' | 'failed' | 'expired' | 'refunded'; // UPDATE
  proof_of_payment?: string;
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  rejected_by?: string; // NEW
  rejected_at?: string; // NEW
  rejection_count?: number; // NEW
  gateway_transaction_id?: string;
  gateway_response?: any;
  notes?: string;
}

export interface PaymentResponse {
  success: boolean;
  data?: Payment | Payment[];
  message: string;
  error?: string;
}

// ==================== PAYMENT SERVICE ====================

class PaymentService {
  
  /**
   * Membuat payment baru
   */
  async createPayment(paymentData: CreatePaymentInput): Promise<PaymentResponse> {
    try {
      // Validasi amount harus lebih dari 0
      if (paymentData.amount <= 0) {
        return {
          success: false,
          message: 'Amount must be greater than 0',
          error: 'INVALID_AMOUNT'
        };
      }

      // Validasi payment_type - UPDATE dengan booking_fee
      const validPaymentTypes = ['booking_fee', 'down_payment', 'installment', 'full_payment'];
      if (!validPaymentTypes.includes(paymentData.payment_type)) {
        return {
          success: false,
          message: 'Invalid payment type',
          error: 'INVALID_PAYMENT_TYPE'
        };
      }

      // Tentukan status awal berdasarkan apakah ada bukti pembayaran
      const initialStatus = paymentData.proof_of_payment ? 'uploaded' : 'pending';

      const { data, error } = await supabase
        .from('payments')
        .insert([{
          ...paymentData,
          status: initialStatus,
          rejection_count: 0, // NEW: initialize rejection count
          payment_date: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating payment:', error);
        return {
          success: false,
          message: 'Failed to create payment',
          error: error.message
        };
      }

      return {
        success: true,
        data: data,
        message: 'Payment created successfully'
      };
    } catch (error) {
      console.error('Error in createPayment:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Mengupdate payment
   */
  async updatePayment(paymentId: string, updateData: UpdatePaymentInput): Promise<PaymentResponse> {
    try {
      // Validasi status jika ada - UPDATE dengan status baru
      if (updateData.status) {
        const validStatuses = ['pending', 'uploaded', 'processing', 'success', 'rejected', 'failed', 'expired', 'refunded'];
        if (!validStatuses.includes(updateData.status)) {
          return {
            success: false,
            message: 'Invalid payment status',
            error: 'INVALID_STATUS'
          };
        }
      }

      const { data, error } = await supabase
        .from('payments')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating payment:', error);
        return {
          success: false,
          message: 'Failed to update payment',
          error: error.message
        };
      }

      return {
        success: true,
        data: data,
        message: 'Payment updated successfully'
      };
    } catch (error) {
      console.error('Error in updatePayment:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Mendapatkan payment berdasarkan ID
   */
  async getPaymentById(paymentId: string): Promise<PaymentResponse> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) {
        console.error('Error fetching payment:', error);
        return {
          success: false,
          message: 'Payment not found',
          error: error.message
        };
      }

      return {
        success: true,
        data: data,
        message: 'Payment retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getPaymentById:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Mendapatkan payments berdasarkan transaction ID
   */
  async getPaymentsByTransactionId(transactionId: string): Promise<PaymentResponse> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        return {
          success: false,
          message: 'Failed to fetch payments',
          error: error.message
        };
      }

      return {
        success: true,
        data: data,
        message: 'Payments retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getPaymentsByTransactionId:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Mendapatkan payments berdasarkan status
   */
  async getPaymentsByStatus(status: Payment['status']): Promise<PaymentResponse> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payments by status:', error);
        return {
          success: false,
          message: 'Failed to fetch payments',
          error: error.message
        };
      }

      return {
        success: true,
        data: data,
        message: 'Payments retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getPaymentsByStatus:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Mendapatkan payment berdasarkan reference code
   */
  async getPaymentByReferenceCode(referenceCode: string): Promise<PaymentResponse> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('reference_code', referenceCode)
        .single();

      if (error) {
        console.error('Error fetching payment by reference code:', error);
        return {
          success: false,
          message: 'Payment not found',
          error: error.message
        };
      }

      return {
        success: true,
        data: data,
        message: 'Payment retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getPaymentByReferenceCode:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Memverifikasi payment (untuk admin)
   */
  async verifyPayment(paymentId: string, verifiedBy: string, isApproved: boolean, rejectionReason?: string): Promise<PaymentResponse> {
    try {
      // Ambil payment untuk cek rejection_count
      const { data: existingPayment } = await supabase
        .from('payments')
        .select('rejection_count')
        .eq('id', paymentId)
        .single();

      const updateData: UpdatePaymentInput = {
        verified_by: verifiedBy,
        verified_at: new Date().toISOString(),
        status: isApproved ? 'success' : 'rejected' // UPDATE: gunakan rejected bukan failed
      };

      if (!isApproved) {
        updateData.rejection_reason = rejectionReason || 'Payment rejected by admin';
        updateData.rejected_by = verifiedBy;
        updateData.rejected_at = new Date().toISOString();
        updateData.rejection_count = (existingPayment?.rejection_count || 0) + 1;
      }

      return await this.updatePayment(paymentId, updateData);
    } catch (error) {
      console.error('Error in verifyPayment:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Upload bukti pembayaran
   */
  async uploadProofOfPayment(paymentId: string, proofUrl: string): Promise<PaymentResponse> {
    try {
      return await this.updatePayment(paymentId, {
        proof_of_payment: proofUrl,
        status: 'uploaded' // UPDATE: gunakan uploaded bukan processing
      });
    } catch (error) {
      console.error('Error in uploadProofOfPayment:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate reference code unik
   */
  generateReferenceCode(prefix: string = 'PAY'): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Mendapatkan semua payments dengan pagination
   */
  async getAllPayments(page: number = 1, limit: number = 10): Promise<PaymentResponse> {
    try {
      const offset = (page - 1) * limit;

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching all payments:', error);
        return {
          success: false,
          message: 'Failed to fetch payments',
          error: error.message
        };
      }

      return {
        success: true,
        data: data,
        message: 'Payments retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getAllPayments:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Menghapus payment
   */
  async deletePayment(paymentId: string): Promise<PaymentResponse> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId)
        .select()
        .single();

      if (error) {
        console.error('Error deleting payment:', error);
        return {
          success: false,
          message: 'Failed to delete payment',
          error: error.message
        };
      }

      return {
        success: true,
        data: data,
        message: 'Payment deleted successfully'
      };
    } catch (error) {
      console.error('Error in deletePayment:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * NEW: Mendapatkan payments yang perlu verifikasi admin
   */
  async getPaymentsNeedingVerification(): Promise<PaymentResponse> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .in('status', ['uploaded', 'processing'])
        .not('proof_of_payment', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payments needing verification:', error);
        return {
          success: false,
          message: 'Failed to fetch payments',
          error: error.message
        };
      }

      return {
        success: true,
        data: data,
        message: 'Payments retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getPaymentsNeedingVerification:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * NEW: Mendapatkan payments yang ditolak
   */
  async getRejectedPayments(): Promise<PaymentResponse> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('status', 'rejected')
        .order('rejected_at', { ascending: false });

      if (error) {
        console.error('Error fetching rejected payments:', error);
        return {
          success: false,
          message: 'Failed to fetch rejected payments',
          error: error.message
        };
      }

      return {
        success: true,
        data: data,
        message: 'Rejected payments retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getRejectedPayments:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export instance
const paymentService = new PaymentService();
export default paymentService;