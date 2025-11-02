// Top-level imports
import { supabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import type { Payment } from './paymentService';

export type CreateTransactionInput = {
  buyer_id: string;
  seller_id: string;
  car_id: string;
  car_price: number;
  trade_in_value?: number;
  discount_amount?: number;
  admin_fee?: number;
  booking_fee: number;
  total_amount: number;
  transaction_details?: string | null;
  notes?: string | null;
};

export type BookingStatus = 
  | 'booking_pending'
  | 'booking_paid' 
  | 'booking_rejected'
  | 'booking_expired'
  | 'booking_cancelled'
  | 'booking_refunded';

export type Transaction = {
  id: string;
  buyer_id: string;
  seller_id: string;
  car_id: string;
  invoice_number?: string | null;
  transaction_type: 'purchase' | 'trade_in' | 'installment' | string;
  car_price: number;
  trade_in_value?: number;
  discount_amount?: number;
  admin_fee?: number;
  total_amount: number;
  
  booking_fee: number;
  booking_status: BookingStatus;
  booking_expires_at?: string | null;
  booking_rejected_at?: string | null;
  booking_rejection_reason?: string | null;
  
  final_payment_method?: 'full' | 'credit' | null;
  final_payment_proof?: string | null;
  final_payment_completed_at?: string | null;
  final_payment_notes?: string | null;
  
  refund_amount?: number | null;
  refund_processed_at?: string | null;
  refund_reason?: string | null;
  
  payment_method?: string | null;
  payment_status?: 'pending' | 'partial' | 'paid' | 'failed' | 'refunded';
  status?: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  
  handover_photo?: string | null;
  handover_notes?: string | null;
  handover_at?: string | null;
  handover_by?: string | null;
  
  notes?: string | null;
  proof_of_refund?: string | null;
  
  created_at?: string;
  updated_at?: string;
  transaction_date?: string | null;
  confirmed_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  
  buyer_name?: string;
  buyer_email?: string;
  buyer_phone?: string;
};

export type TransactionWithPayments = {
  transaction: Transaction;
  payments: Payment[];
  paymentSummary: {
    count: number;
    totalPaid: number;
    latestStatus?: Payment['status'];
    latestPaidAt?: string | null;
  };
};

// **REVISI: Fungsi untuk membuat transaksi baru dengan validasi**
export async function createTransaction(input: CreateTransactionInput) {
  // Cegah pembelian mobil sendiri
  if (input.buyer_id === input.seller_id) {
    return { success: false, error: 'Anda tidak dapat membeli mobil yang Anda jual sendiri' };
  }

  // **VALIDASI: Cek apakah mobil masih available**
  const { data: carData, error: carCheckErr } = await supabase
    .from('cars')
    .select('status')
    .eq('id', input.car_id)
    .single();

  if (carCheckErr) {
    return { success: false, error: 'Mobil tidak ditemukan' };
  }

  if (carData.status !== 'available') {
    return { 
      success: false, 
      error: `Maaf, mobil sudah ${carData.status === 'reserved' ? 'direservasi' : 'terjual'} oleh pembeli lain` 
    };
  }
  
  // **BARU: Cek transaksi aktif untuk mobil yang sama (isolasi)**
  const { data: existingActive, error: activeErr } = await supabase
    .from('transactions')
    .select('id, buyer_id, created_at, status, booking_status')
    .eq('car_id', input.car_id)
    .in('status', ['pending', 'confirmed', 'processing'])
    .neq('booking_status', 'booking_cancelled');

  if (activeErr) {
    return { success: false, error: 'Gagal mengecek transaksi aktif' };
  }

  if (existingActive && existingActive.length > 0) {
    const ownedByUser = existingActive.find(tx => tx.buyer_id === input.buyer_id);
    if (ownedByUser) {
      return { success: false, error: 'Anda sudah memiliki transaksi aktif untuk mobil ini' };
    }
    return { success: false, error: 'Mobil sedang dalam proses oleh pembeli lain' };
  }

  const generateInvoiceNumber = (): string => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const ts = now.getTime();
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `INV-${y}${m}${d}-${ts}-${rand}`;
  };

  const bookingExpiresAt = new Date();
  bookingExpiresAt.setHours(bookingExpiresAt.getHours() + 24);

  const payload = {
    buyer_id: input.buyer_id,
    seller_id: input.seller_id,
    car_id: input.car_id,
    transaction_type: 'purchase',
    car_price: input.car_price,
    trade_in_value: input.trade_in_value ?? 0.0,
    discount_amount: input.discount_amount ?? 0.0,
    admin_fee: input.admin_fee ?? 0.0,
    total_amount: input.total_amount,
    booking_fee: input.booking_fee,
    booking_status: 'booking_pending' as BookingStatus,
    booking_expires_at: bookingExpiresAt.toISOString(),
    payment_status: 'pending',
    status: 'pending',
    transaction_details: input.transaction_details ?? null,
    notes: input.notes ?? null,
    invoice_number: generateInvoiceNumber(),
  };

  let { data, error } = await supabase
    .from('transactions')
    .insert(payload)
    .select('*')
    .single();

  if (error && (/duplicate key value/i.test(error.message) && /invoice_number/i.test(error.message))) {
    const retryPayload = { ...payload, invoice_number: generateInvoiceNumber() };
    const retry = await supabase
      .from('transactions')
      .insert(retryPayload)
      .select('*')
      .single();

    if (retry.error) {
      return { success: false, error: retry.error.message };
    }

    return { success: true, data: retry.data };
  }

  // Tambahan: tangani konflik indeks unik active tx per car
  if (error) {
    const msg = error.message || '';
    if (
      /unique_active_tx_per_car/i.test(msg) ||
      ((/duplicate key value/i.test(msg)) && /unique_active_tx_per_car/i.test(msg))
    ) {
      return { success: false, error: 'Mobil sedang dalam proses oleh pembeli lain' };
    }
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

// Fungsi untuk mengambil semua transaksi pembelian
export async function getPurchaseTransactionsWithPayments(
  page: number = 1,
  limit: number = 10,
  opts?: {
    status?: Transaction['status'][];
    booking_status?: BookingStatus[];
    payment_status?: Transaction['payment_status'][];
    search?: string;
  }
): Promise<{ success: boolean; data?: TransactionWithPayments[]; total?: number; error?: string }> {
  try {
    const offset = (page - 1) * limit;

    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('transaction_type', 'purchase')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (opts?.status && opts.status.length) {
      query = query.in('status', opts.status);
    }
    if (opts?.booking_status && opts.booking_status.length) {
      query = query.in('booking_status', opts.booking_status);
    }
    if (opts?.payment_status && opts.payment_status.length) {
      query = query.in('payment_status', opts.payment_status);
    }
    if (opts?.search && opts.search.trim()) {
      query = query.ilike('invoice_number', `%${opts.search.trim()}%`);
    }

    const { data: transactions, error, count } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    const buyerIds = [...new Set((transactions || []).map((tx: any) => tx.buyer_id).filter(Boolean))];

    let buyersMap: Record<string, any> = {};
    if (buyerIds.length > 0) {
      const { data: buyers } = await supabase
        .from('users')
        .select('id, full_name, email, phone_number')
        .in('id', buyerIds);

      if (buyers) {
        buyersMap = buyers.reduce((acc, buyer) => {
          acc[buyer.id] = buyer;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    const txns = (transactions || []).map((tx: any) => {
      const buyer = buyersMap[tx.buyer_id];
      return {
        ...tx,
        buyer_name: buyer?.full_name || null,
        buyer_email: buyer?.email || null,
        buyer_phone: buyer?.phone_number || null,
      };
    }) as Transaction[];

    if (txns.length === 0) {
      return { success: true, data: [], total: count ?? 0 };
    }

    const ids = txns.map(t => t.id);
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .in('transaction_id', ids);

    if (paymentsError) {
      return { success: false, error: paymentsError.message };
    }

    const paymentsByTxn = new Map<string, Payment[]>();
    (paymentsData || []).forEach(p => {
      const list = paymentsByTxn.get(p.transaction_id) || [];
      list.push(p as Payment);
      paymentsByTxn.set(p.transaction_id, list);
    });

    const combined: TransactionWithPayments[] = txns.map(txn => {
      const list = paymentsByTxn.get(txn.id) || [];
      const totalPaid = list
        .filter(p => p.status === 'success')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const latest = list.slice().sort(
        (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
      )[0];

      return {
        transaction: txn,
        payments: list,
        paymentSummary: {
          count: list.length,
          totalPaid,
          latestStatus: latest?.status,
          latestPaidAt: latest?.status === 'success' ? latest.payment_date : null,
        },
      };
    });

    return { success: true, data: combined, total: count ?? txns.length };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

// Fungsi untuk mengambil transaksi showroom
export async function getShowroomTransactionsWithPayments(
  page: number = 1,
  limit: number = 10,
  opts?: {
    status?: Transaction['status'][];
    booking_status?: BookingStatus[];
    payment_status?: Transaction['payment_status'][];
    search?: string;
  }
): Promise<{ success: boolean; data?: TransactionWithPayments[]; total?: number; error?: string }> {
  try {
    const offset = (page - 1) * limit;

    const { data: showroomCars } = await supabase
      .from('cars')
      .select(`
        id,
        seller_id,
        users!inner(
          id,
          role
        )
      `)
      .in('users.role', ['admin']);

    if (!showroomCars || showroomCars.length === 0) {
      return { success: true, data: [], total: 0 };
    }

    const showroomCarIds = showroomCars.map(car => car.id);

    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('transaction_type', 'purchase')
      .in('car_id', showroomCarIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (opts?.status && opts.status.length) {
      query = query.in('status', opts.status);
    }
    if (opts?.booking_status && opts.booking_status.length) {
      query = query.in('booking_status', opts.booking_status);
    }
    if (opts?.payment_status && opts.payment_status.length) {
      query = query.in('payment_status', opts.payment_status);
    }
    if (opts?.search && opts.search.trim()) {
      query = query.ilike('invoice_number', `%${opts.search.trim()}%`);
    }

    const { data: transactions, error, count } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    const buyerIds = [...new Set((transactions || []).map((tx: any) => tx.buyer_id).filter(Boolean))];

    let buyersMap: Record<string, any> = {};
    if (buyerIds.length > 0) {
      const { data: buyers } = await supabase
        .from('users')
        .select('id, full_name, email, phone_number')
        .in('id', buyerIds);

      if (buyers) {
        buyersMap = buyers.reduce((acc, buyer) => {
          acc[buyer.id] = buyer;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    const txns = (transactions || []).map((tx: any) => {
      const buyer = buyersMap[tx.buyer_id];
      return {
        ...tx,
        buyer_name: buyer?.full_name || null,
        buyer_email: buyer?.email || null,
        buyer_phone: buyer?.phone_number || null,
      };
    }) as Transaction[];

    if (txns.length === 0) {
      return { success: true, data: [], total: count ?? 0 };
    }

    const ids = txns.map(t => t.id);
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .in('transaction_id', ids);

    if (paymentsError) {
      return { success: false, error: paymentsError.message };
    }

    const paymentsByTxn = new Map<string, Payment[]>();
    (paymentsData || []).forEach(p => {
      const list = paymentsByTxn.get(p.transaction_id) || [];
      list.push(p as Payment);
      paymentsByTxn.set(p.transaction_id, list);
    });

    const combined: TransactionWithPayments[] = txns.map(txn => {
      const list = paymentsByTxn.get(txn.id) || [];
      const totalPaid = list
        .filter(p => p.status === 'success')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const latest = list.slice().sort(
        (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
      )[0];

      return {
        transaction: txn,
        payments: list,
        paymentSummary: {
          count: list.length,
          totalPaid,
          latestStatus: latest?.status,
          latestPaidAt: latest?.status === 'success' ? latest.payment_date : null,
        },
      };
    });

    return { success: true, data: combined, total: count ?? txns.length };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

// Fungsi untuk mengambil transaksi eksternal
export async function getExternalTransactionsWithPayments(
  page: number = 1,
  limit: number = 10,
  opts?: {
    status?: Transaction['status'][];
    booking_status?: BookingStatus[];
    payment_status?: Transaction['payment_status'][];
    search?: string;
  }
): Promise<{ success: boolean; data?: TransactionWithPayments[]; total?: number; error?: string }> {
  try {
    const offset = (page - 1) * limit;

    const { data: externalCars } = await supabase
      .from('cars')
      .select(`
        id,
        seller_id,
        users!inner(
          id,
          role
        )
      `)
      .in('users.role', ['user', 'seller']);

    if (!externalCars || externalCars.length === 0) {
      return { success: true, data: [], total: 0 };
    }

    const externalCarIds = externalCars.map(car => car.id);

    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('transaction_type', 'purchase')
      .in('car_id', externalCarIds)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (opts?.status && opts.status.length) {
      query = query.in('status', opts.status);
    }
    if (opts?.booking_status && opts.booking_status.length) {
      query = query.in('booking_status', opts.booking_status);
    }
    if (opts?.payment_status && opts.payment_status.length) {
      query = query.in('payment_status', opts.payment_status);
    }
    if (opts?.search && opts.search.trim()) {
      query = query.ilike('invoice_number', `%${opts.search.trim()}%`);
    }

    const { data: transactions, error, count } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    const buyerIds = [...new Set((transactions || []).map((tx: any) => tx.buyer_id).filter(Boolean))];
    let buyersMap: Record<string, any> = {};
    if (buyerIds.length > 0) {
      const { data: buyers } = await supabase
        .from('users')
        .select('id, full_name, email, phone_number')
        .in('id', buyerIds);

      if (buyers) {
        buyersMap = buyers.reduce((acc, buyer) => {
          acc[buyer.id] = buyer;
          return acc;
        }, {} as Record<string, any>);
      }
    }

    const txns = (transactions || []).map((tx: any) => {
      const buyer = buyersMap[tx.buyer_id];
      return {
        ...tx,
        buyer_name: buyer?.full_name || null,
        buyer_email: buyer?.email || null,
        buyer_phone: buyer?.phone_number || null,
      };
    }) as Transaction[];

    if (txns.length === 0) {
      return { success: true, data: [], total: count ?? 0 };
    }

    const ids = txns.map(t => t.id);
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .in('transaction_id', ids);

    if (paymentsError) {
      return { success: false, error: paymentsError.message };
    }

    const paymentsByTxn = new Map<string, Payment[]>();
    (paymentsData || []).forEach(p => {
      const list = paymentsByTxn.get(p.transaction_id) || [];
      list.push(p as Payment);
      paymentsByTxn.set(p.transaction_id, list);
    });

    const combined: TransactionWithPayments[] = txns.map(txn => {
      const list = paymentsByTxn.get(txn.id) || [];
      const totalPaid = list
        .filter(p => p.status === 'success')
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const latest = list.slice().sort(
        (a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
      )[0];

      return {
        transaction: txn,
        payments: list,
        paymentSummary: {
          count: list.length,
          totalPaid,
          latestStatus: latest?.status,
          latestPaidAt: latest?.status === 'success' ? latest.payment_date : null,
        },
      };
    });

    return { success: true, data: combined, total: count ?? combined.length };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

// **REVISI: Konfirmasi pembayaran booking dengan validasi First Pay First Get**
export async function confirmBookingPayment(
  transactionId: string,
  paymentId: string,
  adminId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    console.log('🔄 confirmBookingPayment dipanggil dengan:', { transactionId, paymentId, adminId });
    const now = new Date().toISOString();

    // Ambil data transaksi dan payment untuk validasi
    const { data: tx, error: fetchErr } = await supabase
      .from('transactions')
      .select('id, car_id, buyer_id, created_at')
      .eq('id', transactionId)
      .single();

    if (fetchErr) {
      console.error('❌ Error fetching transaction:', fetchErr);
      return { success: false, error: fetchErr.message };
    }

    console.log('📋 Data transaksi:', tx);

    if (!tx?.car_id) {
      console.error('❌ Car ID tidak ditemukan pada transaksi');
      return { success: false, error: 'Car ID tidak ditemukan pada transaksi' };
    }

    // **VALIDASI: Cek apakah ada pembeli lain yang sudah bayar booking fee lebih dulu**
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
      .eq('transactions.car_id', tx.car_id)
      .neq('transactions.buyer_id', tx.buyer_id);

    if (checkErr) {
      console.error('⚠️ Error checking other payments:', checkErr);
    } else if (otherPayments && otherPayments.length > 0) {
      // Cek apakah ada pembeli yang transaksinya lebih dulu
      const earlierPayment = otherPayments.find(p => 
        new Date(p.transactions[0].created_at) < new Date(tx.created_at)
      );

      if (earlierPayment) {
        console.warn('⚠️ Ada pembeli lain yang sudah bayar booking fee lebih dulu');
        return { 
          success: false, 
          error: 'Mobil sudah direservasi oleh pembeli lain yang membayar lebih dulu' 
        };
      }
    }

    // **VALIDASI: Cek status mobil saat ini**
    const { data: carData, error: carFetchErr } = await supabase
      .from('cars')
      .select('status')
      .eq('id', tx.car_id)
      .single();
      
    if (carFetchErr) {
      console.error('❌ Error fetching car status:', carFetchErr);
      return { success: false, error: 'Gagal mengecek status mobil' };
    }

    console.log('🚗 Status mobil sebelum update:', carData?.status);

    if (carData.status !== 'available') {
      return { 
        success: false, 
        error: `Mobil sudah ${carData.status === 'reserved' ? 'direservasi' : 'terjual'} oleh pembeli lain` 
      };
    }

    // **AMAN: Update status mobil menjadi 'reserved'**
    const { data: updatedCarRows, error: carErr } = await supabase
      .from('cars')
      .update({
        status: 'reserved',
        updated_at: now
      })
      .eq('id', tx.car_id)
      .eq('status', 'available') // Double-check dengan kondisi WHERE
      .select(); // Hapus .single() agar tidak error saat 0 row

    if (carErr) {
      console.error('❌ Error updating car status:', carErr);
      return { success: false, error: `Gagal update status mobil: ${carErr.message}` };
    }

    if (!updatedCarRows || updatedCarRows.length === 0) {
      console.warn('⚠️ Tidak ada baris terupdate saat reservasi mobil. Kemungkinan status berubah.');
      return { success: false, error: 'Mobil tidak lagi tersedia untuk reservasi' };
    }

    const updatedCar = updatedCarRows[0];
    console.log('✅ Status mobil berhasil diubah menjadi reserved:', updatedCar);

    // LANGKAH 2: Update payment -> success + verified
    const { data: updatedPayment, error: paymentErr } = await supabase
      .from('payments')
      .update({
        status: 'success',
        verified_by: adminId,
        verified_at: now
      })
      .eq('id', paymentId)
      .select()
      .single();

    if (paymentErr) {
      console.error('❌ Error updating payment:', paymentErr);
      // Rollback car status jika payment gagal
      await supabase
        .from('cars')
        .update({ status: 'available', updated_at: now })
        .eq('id', tx.car_id);
      return { success: false, error: paymentErr.message };
    }

    console.log('✅ Payment berhasil diupdate menjadi success:', updatedPayment);

    // LANGKAH 3: Update status transaksi
    const { data: updatedTx, error: txnErr } = await supabase
      .from('transactions')
      .update({
        payment_status: 'paid',
        booking_status: 'booking_paid',
        status: 'confirmed',
        updated_at: now,
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (txnErr) {
      console.error('❌ Error updating transaction:', txnErr);
      // Rollback car status dan payment jika transaksi gagal
      await supabase
        .from('cars')
        .update({ status: 'available', updated_at: now })
        .eq('id', tx.car_id);
      await supabase
        .from('payments')
        .update({ status: 'uploaded', verified_by: null, verified_at: null })
        .eq('id', paymentId);
      return { success: false, error: txnErr.message };
    }

    console.log('✅ Transaction berhasil diupdate:', updatedTx);

    // **AUTO-CANCEL: Batalkan transaksi pending lain untuk mobil yang sama**
    await autoCancelOtherPendingTransactions(tx.car_id, transactionId, tx.buyer_id);

    // Verifikasi sekali lagi status mobil
    const { data: finalCarData } = await supabase
      .from('cars')
      .select('status')
      .eq('id', tx.car_id)
      .single();
      
    console.log('🚗 Status mobil setelah semua proses:', finalCarData?.status);

    return { 
      success: true, 
      message: '✅ Pembayaran booking fee dikonfirmasi. Mobil telah di-reserved dan tidak lagi tersedia di katalog. Transaksi pending lain telah dibatalkan.' 
    };
  } catch (e: any) {
    console.error('💥 Error in confirmBookingPayment:', e);
    return { success: false, error: e.message || 'Unknown error' };
  }
}

// **FUNGSI BARU: Auto-cancel transaksi pending lain untuk mobil yang sama**
async function autoCancelOtherPendingTransactions(
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
      console.log('ℹ️ Tidak ada transaksi pending lain untuk mobil ini');
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

// Fungsi untuk menolak pembayaran
export async function rejectPayment(
  paymentId: string,
  adminId: string,
  reason?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // 1) Ambil payment untuk tahu transaction_id
    const { data: pay, error: getPayErr } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();
      
    if (getPayErr || !pay) {
      return { success: false, error: getPayErr?.message || 'Payment tidak ditemukan' };
    }

    // 2) Update payment -> rejected (gunakan status yang ada di constraint)
    const { error: updPayErr } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        verified_by: adminId,
        verified_at: new Date().toISOString(),
        rejection_reason: reason || null,
        rejected_by: adminId,
        rejected_at: new Date().toISOString(),
        rejection_count: (pay.rejection_count || 0) + 1
      })
      .eq('id', paymentId);
      
    if (updPayErr) return { success: false, error: updPayErr.message };

    // 3) Update transaksi: booking_status jadi 'booking_rejected'
    const { error: txnErr } = await supabase
      .from('transactions')
      .update({
        booking_status: 'booking_rejected',
        booking_rejected_at: new Date().toISOString(),
        booking_rejection_reason: reason || null
      })
      .eq('id', pay.transaction_id);
      
    if (txnErr) return { success: false, error: txnErr.message };

    return { success: true, message: 'Pembayaran ditolak' };
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menolak pembayaran' };
  }
}

// Fungsi untuk mark as paid (pembayaran final - full/credit)
export async function markAsPaidFull(
  transactionId: string,
  adminId: string,
  data: {
    payment_proof?: string;
    payment_notes?: string;
  }
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Ambil car_id dari transaksi
    const { data: tx, error: fetchErr } = await supabase
      .from('transactions')
      .select('id, car_id')
      .eq('id', transactionId)
      .single();

    if (fetchErr) {
      return { success: false, error: fetchErr.message };
    }

    const now = new Date().toISOString();

    // Update transaksi dengan status completed
    const { error } = await supabase
      .from('transactions')
      .update({
        final_payment_method: 'full',
        final_payment_proof: data.payment_proof || null,
        final_payment_notes: data.payment_notes || null,
        final_payment_completed_at: now,
        status: 'completed',
        payment_status: 'paid',
        completed_at: now
      })
      .eq('id', transactionId);
      
    if (error) return { success: false, error: error.message };
    
    // Update status mobil menjadi terjual (sold)
    if (tx.car_id) {
      const { error: carErr } = await supabase
        .from('cars')
        .update({
          status: 'sold',
          updated_at: now
        })
        .eq('id', tx.car_id);

      if (carErr) {
        console.error('Error updating car status:', carErr);
      }
    }
    
    return { success: true, message: 'Pembayaran penuh berhasil dicatat' };
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal mencatat pembayaran' };
  }
}

// Fungsi untuk mark as paid credit
export async function markAsPaidCredit(
  transactionId: string,
  adminId: string,
  data: {
    payment_proof?: string;
    payment_notes?: string;
  }
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const { error } = await supabase
      .from('transactions')
      .update({
        final_payment_method: 'credit',
        final_payment_proof: data.payment_proof || null,
        final_payment_notes: data.payment_notes || null,
        final_payment_completed_at: new Date().toISOString(),
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', transactionId);
      
    if (error) return { success: false, error: error.message };
    
    return { success: true, message: 'Pembayaran kredit berhasil dicatat' };
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal mencatat pembayaran' };
  }
}

// Fungsi untuk handover
export async function recordHandover(
  transactionId: string,
  adminId: string,
  data: {
    handover_photo?: string;
    handover_notes?: string;
  }
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const { error } = await supabase
      .from('transactions')
      .update({
        handover_photo: data.handover_photo || null,
        handover_notes: data.handover_notes || null,
        handover_at: new Date().toISOString(),
        handover_by: adminId
      })
      .eq('id', transactionId);
      
    if (error) return { success: false, error: error.message };
    
    return { success: true, message: 'Serah terima mobil berhasil dicatat' };
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal mencatat serah terima' };
  }
}

export async function cancelTransaction(
  transactionId: string,
  adminId: string,
  reason?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('transactions')
      .update({
        status: 'cancelled',
        booking_status: 'booking_cancelled',
        cancelled_at: now,
        updated_at: now,
        notes: reason ? `Cancelled by ${adminId}: ${reason}` : null,
      })
      .eq('id', transactionId)
      .select('*')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, message: 'Transaksi dibatalkan' };
  } catch (e: any) {
    return { success: false, error: e.message || 'Unknown error' };
  }
}

export async function refundBookingFee(
  transactionId: string,
  adminId: string,
  amount: number,
  reason?: string,
  proofUrl?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Ambil booking_fee dan car_id dari transaksi
    const { data: tx, error: fetchErr } = await supabase
      .from('transactions')
      .select('id, booking_fee, car_id')
      .eq('id', transactionId)
      .single();

    if (fetchErr) {
      return { success: false, error: fetchErr.message };
    }
    const bookingFee = Number(tx?.booking_fee || 0);
    if (!Number.isFinite(bookingFee) || bookingFee <= 0) {
      return { success: false, error: 'Tidak ada booking fee pada transaksi ini' };
    }

    const now = new Date().toISOString();

    // Update transaksi dengan status refund
    const { data, error } = await supabase
      .from('transactions')
      .update({
        refund_amount: bookingFee,
        refund_processed_at: now,
        refund_reason: reason || null,
        proof_of_refund: proofUrl || null,
        booking_status: 'booking_refunded',
        payment_status: 'refunded',
        status: 'refunded',
        updated_at: now,
        notes: reason ? `Refund by ${adminId}: ${reason}` : null,
      })
      .eq('id', transactionId)
      .select('*')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Update status mobil kembali menjadi available agar muncul di katalog
    if (tx.car_id) {
      const { error: carErr } = await supabase
        .from('cars')
        .update({
          status: 'available',
          updated_at: now
        })
        .eq('id', tx.car_id);

      if (carErr) {
        console.error('Error updating car status:', carErr);
      }
    }

    return { success: true, message: 'Refund booking fee diproses' };
  } catch (e: any) {
    return { success: false, error: e.message || 'Unknown error' };
  }
}