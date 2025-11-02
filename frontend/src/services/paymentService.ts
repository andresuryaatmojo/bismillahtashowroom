import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabaseAdmin';

// ==================== INTERFACES ====================

export interface Payment {
  id: string;
  transaction_id: string;
  payment_type: 'booking_fee' | 'down_payment' | 'installment' | 'full_payment' | 'remaining_payment';
  amount: number;
  payment_method: string;
  reference_code?: string;
  bank_name?: string;
  account_number?: string;
  account_holder?: string;
  status: 'pending' | 'uploaded' | 'processing' | 'success' | 'rejected' | 'failed' | 'expired' | 'refunded';
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
  payment_type: 'booking_fee' | 'down_payment' | 'installment' | 'full_payment' | 'remaining_payment';
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
  status?: 'pending' | 'uploaded' | 'processing' | 'success' | 'rejected' | 'failed' | 'expired' | 'refunded';
  proof_of_payment?: string;
  verified_by?: string;
  verified_at?: string;
  rejection_reason?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_count?: number;
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

      // Validasi payment_type
      const validPaymentTypes = ['booking_fee', 'down_payment', 'installment', 'full_payment', 'remaining_payment'];
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
          rejection_count: 0,
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
      // Validasi status jika ada
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
   * PENTING: Untuk booking fee, fungsi ini akan mengupdate status mobil dan transaksi
   */
  async verifyPayment(paymentId: string, verifiedBy: string, isApproved: boolean, rejectionReason?: string): Promise<PaymentResponse> {
    try {
      const now = new Date().toISOString();

      // Ambil payment beserta transaction dan car info
      const { data: paymentData, error: fetchError } = await supabase
        .from('payments')
        .select(`
          *,
          transactions!inner (
            id,
            car_id,
            buyer_id,
            booking_status,
            status,
            created_at
          )
        `)
        .eq('id', paymentId)
        .single();

      if (fetchError) {
        return {
          success: false,
          message: 'Payment tidak ditemukan',
          error: fetchError.message
        };
      }

      const updateData: UpdatePaymentInput = {
        verified_by: verifiedBy,
        verified_at: now,
        status: isApproved ? 'success' : 'rejected'
      };

      if (!isApproved) {
        updateData.rejection_reason = rejectionReason || 'Payment rejected by admin';
        updateData.rejected_by = verifiedBy;
        updateData.rejected_at = now;
        updateData.rejection_count = (paymentData?.rejection_count || 0) + 1;
      } else {
        // **REVISI: Validasi FIRST PAY FIRST GET untuk booking_fee**
        if (paymentData.payment_type === 'booking_fee') {
          const transactionId = paymentData.transaction_id;
          const carId = paymentData.transactions?.[0]?.car_id;
          const buyerId = paymentData.transactions?.[0]?.buyer_id;
          const currentTxCreatedAt = paymentData.transactions?.[0]?.created_at;
          const now = new Date().toISOString();
      
          if (carId) {
            // Cek apakah ada pembeli lain yang lebih dulu
            const { data: otherPayments, error: checkErr } = await supabase
              .from('payments')
              .select(`
                id,
                status,
                created_at,
                transactions!inner (
                  car_id,
                  buyer_id,
                  created_at
                )
              `)
              .eq('payment_type', 'booking_fee')
              .eq('status', 'success')
              .eq('transactions.car_id', carId)
              .neq('transactions.buyer_id', buyerId);
      
            if (!checkErr && otherPayments && otherPayments.length > 0) {
              const earlierPayment = otherPayments.find(p =>
                new Date(p.transactions[0].created_at) < new Date(currentTxCreatedAt)
              );
              if (earlierPayment) {
                return {
                  success: false,
                  message: 'Mobil sudah direservasi oleh pembeli lain yang membayar lebih dulu',
                  error: 'FIRST_PAY_FIRST_GET_VIOLATION'
                };
              }
            }
          }

          if (!carId) {
            return {
              success: false,
              message: 'Car ID tidak ditemukan pada transaksi',
              error: 'INVALID_TRANSACTION'
            };
          }

          // **VALIDASI: Cek apakah ada pembeli lain yang sudah bayar booking fee lebih dulu**
          const { data: otherPayments, error: checkErr } = await supabase
            .from('payments')
            .select(`
              id,
              transaction_id,
              status,
              created_at,
              transactions!inner (
                car_id,
                buyer_id,
                created_at
              )
            `)
            .eq('payment_type', 'booking_fee')
            .eq('status', 'success')
            .eq('transactions.car_id', carId)
            .neq('transactions.buyer_id', buyerId);

          if (checkErr) {
            console.error('Error checking other payments:', checkErr);
          } else if (otherPayments && otherPayments.length > 0) {
            // Ada pembeli lain yang sudah berhasil bayar booking fee untuk mobil yang sama
            const earlierPayment = otherPayments.find(p =>
              new Date(p.transactions[0].created_at) < new Date(currentTxCreatedAt)
            );

            if (earlierPayment) {
              return {
                success: false,
                message: 'Mobil sudah direservasi oleh pembeli lain yang membayar lebih dulu',
                error: 'CAR_ALREADY_RESERVED'
              };
            }
          }

          // **VALIDASI: Cek status mobil saat ini**
          const { data: carData, error: carCheckErr } = await supabase
            .from('cars')
            .select('status')
            .eq('id', carId)
            .single();

          if (carCheckErr) {
            return {
              success: false,
              message: 'Gagal mengecek status mobil',
              error: carCheckErr.message
            };
          }

          if (carData.status !== 'available') {
            return {
              success: false,
              message: `Mobil sudah ${carData.status === 'reserved' ? 'direservasi' : 'terjual'}`,
              error: 'CAR_NOT_AVAILABLE'
            };
          }

          // **AMAN: Update status mobil menjadi 'reserved'**
          const { error: carError } = await supabase
            .from('cars')
            .update({
              status: 'reserved',
              updated_at: now
            })
            .eq('id', carId)
            .eq('status', 'available'); // Double-check dengan kondisi WHERE

          if (carError) {
            console.error('Error updating car status:', carError);
            return {
              success: false,
              message: 'Gagal mengupdate status mobil',
              error: carError.message
            };
          }

          // Update status transaksi
          const { error: txError } = await supabase
            .from('transactions')
            .update({
              payment_status: 'paid',
              booking_status: 'booking_paid',
              status: 'confirmed',
              updated_at: now
            })
            .eq('id', transactionId);

          if (txError) {
            console.error('Error updating transaction status:', txError);
            // Rollback car status jika transaksi gagal
            await supabase
              .from('cars')
              .update({ status: 'available', updated_at: now })
              .eq('id', carId);
            return {
              success: false,
              message: 'Gagal mengupdate status transaksi',
              error: txError.message
            };
          }

          // **AUTO-CANCEL: Batalkan transaksi pending lain untuk mobil yang sama**
          await this.autoCancelOtherPendingTransactions(carId, transactionId, buyerId);
        }
      }

      const result = await this.updatePayment(paymentId, updateData);
      
      if (result.success && isApproved && paymentData.payment_type === 'booking_fee') {
        result.message = 'Booking fee berhasil diverifikasi. Mobil telah di-reserved dan tidak lagi tersedia di katalog. Transaksi pending lain telah dibatalkan.';
      }

      return result;
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
   * **FUNGSI BARU: Auto-cancel transaksi pending lain untuk mobil yang sama**
   */
  private async autoCancelOtherPendingTransactions(
    carId: string,
    excludeTransactionId: string,
    excludeBuyerId: string
  ): Promise<void> {
    try {
      const now = new Date().toISOString();
      const cancelReason = 'Mobil sudah direservasi oleh pembeli lain yang membayar lebih dulu';

      // Ambil semua transaksi pending untuk mobil ini (kecuali transaksi yang baru di-approve)
      const { data: pendingTxs, error: fetchErr } = await supabase
        .from('transactions')
        .select('id, buyer_id')
        .eq('car_id', carId)
        .neq('id', excludeTransactionId)
        .in('status', ['pending', 'confirmed'])
        .neq('booking_status', 'booking_paid');

      if (fetchErr) {
        console.error('Error fetching pending transactions:', fetchErr);
        return;
      }

      if (!pendingTxs || pendingTxs.length === 0) {
        return;
      }

      // Batch update semua transaksi pending menjadi cancelled
      const { error: cancelErr } = await supabase
        .from('transactions')
        .update({
          status: 'cancelled',
          booking_status: 'booking_cancelled',
          cancelled_at: now,
          updated_at: now,
          notes: cancelReason
        })
        .in('id', pendingTxs.map(tx => tx.id));

      if (cancelErr) {
        console.error('Error auto-cancelling pending transactions:', cancelErr);
      } else {
        console.log(`✅ Auto-cancelled ${pendingTxs.length} pending transaction(s) for car ${carId}`);
      }
    } catch (error) {
      console.error('Error in autoCancelOtherPendingTransactions:', error);
    }
  }

  /**
   * **REVISI: Upload bukti pembayaran dengan validasi First Pay First Get**
   */
  async uploadProofOfPayment(paymentId: string, proofUrl: string): Promise<PaymentResponse> {
    try {
      console.log('🔄 uploadProofOfPayment dipanggil dengan paymentId:', paymentId);
      
      // Dapatkan data payment untuk mendapatkan transaction_id
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select(`
          id,
          transaction_id,
          payment_type,
          transactions!inner (
            id,
            car_id,
            buyer_id,
            created_at
          )
        `)
        .eq('id', paymentId)
        .single();

      if (paymentError || !payment) {
        console.error('❌ Error fetching payment data:', paymentError);
        return {
          success: false,
          message: 'Failed to fetch payment data',
          error: paymentError?.message || 'Payment not found'
        };
      }

      console.log('📋 Payment data:', payment);

      // Normalize transactions relation (object or array)
      const txRel: any = Array.isArray((payment as any).transactions)
        ? (payment as any).transactions[0]
        : (payment as any).transactions;

      let carId = txRel?.car_id;
      let buyerId = txRel?.buyer_id;
      let currentTxCreatedAt = txRel?.created_at;

      // Fallback: fetch transaction directly if relation missing
      if (!carId || !buyerId || !currentTxCreatedAt) {
        console.log('ℹ️ Fallback fetching transaction by ID:', payment.transaction_id);
        const { data: tx, error: txErr } = await supabase
          .from('transactions')
          .select('id, car_id, buyer_id, created_at')
          .eq('id', payment.transaction_id)
          .single();

        if (txErr) {
          console.error('❌ Error fetching transaction:', txErr);
        } else {
          carId = tx?.car_id;
          buyerId = tx?.buyer_id;
          currentTxCreatedAt = tx?.created_at;
        }
      }

      // Jika booking_fee dan carId tetap tidak ada, skip FPFG dan tetap simpan proof
      if (payment.payment_type === 'booking_fee' && !carId) {
        console.warn('⚠️ Car ID missing; skip FPFG validation and store proof');
        const result = await this.updatePayment(paymentId, {
          proof_of_payment: proofUrl,
          status: 'uploaded'
        });
        console.log('📊 Final result of uploadProofOfPayment (no car_id):', result);
        return result;
      }

      // Validasi First Pay First Get hanya jika booking_fee dan carId valid
      if (payment.payment_type === 'booking_fee') {
        console.log('✅ Payment type is booking_fee, proceeding with validation');

        // **VALIDASI: Cek apakah ada pembeli lain yang sudah upload bukti pembayaran lebih dulu**
        const { data: otherPayments, error: checkErr } = await supabase
          .from('payments')
          .select(`
            id,
            status,
            created_at,
            transactions!inner (
              car_id,
              buyer_id,
              created_at
            )
          `)
          .eq('payment_type', 'booking_fee')
          .in('status', ['uploaded', 'success'])
          .eq('transactions.car_id', carId)
          .neq('transactions.buyer_id', buyerId);

        if (checkErr) {
          console.warn('⚠️ Error checking other payments:', checkErr);
        } else if (otherPayments && otherPayments.length > 0) {
          // Cek apakah ada pembeli yang transaksinya lebih dulu
          const earlierPayment = otherPayments.find((p: any) => {
            const rel = Array.isArray(p.transactions) ? p.transactions[0] : p.transactions;
            return new Date(rel?.created_at) < new Date(currentTxCreatedAt);
          });

          if (earlierPayment) {
            console.warn('⚠️ Ada pembeli lain yang sudah upload bukti pembayaran lebih dulu');
            
            // Update payment status menjadi failed dengan alasan
            const updateResult = await this.updatePayment(paymentId, {
              status: 'failed',
              notes: 'Booking fee ditolak: pembeli lain lebih dulu'
            });

            updateResult.message = 'First Pay First Get validation failed';
            return updateResult;
          }
        }
      }

      // Update proof_of_payment dan status uploaded
      const result = await this.updatePayment(paymentId, {
        proof_of_payment: proofUrl,
        status: 'uploaded'
      });
      
      console.log('📊 Final result of uploadProofOfPayment:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in uploadProofOfPayment:', error);
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
   * Mendapatkan payments yang perlu verifikasi admin
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
   * Mendapatkan payments yang ditolak
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