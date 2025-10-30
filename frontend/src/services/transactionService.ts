// Top-level imports
import { supabase } from '../lib/supabase';
import type { Payment } from './paymentService';

export type CreateTransactionInput = {
  buyer_id: string;
  seller_id: string;
  car_id: string;
  car_price: number;
  trade_in_value?: number;
  discount_amount?: number;
  admin_fee?: number;
  total_amount: number;
  payment_method?: string | null;
  payment_status?: 'pending' | 'partial' | 'paid' | 'failed' | 'refunded';
  down_payment?: number;
  remaining_payment?: number;
  status?: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  admin_approval_id?: string | null;
  admin_approved_at?: string | null;
  proof_of_payment?: string | null;
  transaction_details?: string | null;
  notes?: string | null;
  contract_url?: string | null;
  transaction_date?: string | null;
  confirmed_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
};

// Di dalam fungsi createTransaction
export async function createTransaction(input: CreateTransactionInput) {
  // Generator nomor invoice yang unik
  const generateInvoiceNumber = (): string => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const ts = now.getTime(); // timestamp ms
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `INV-${y}${m}${d}-${ts}-${rand}`;
  };

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
    payment_method: input.payment_method ?? null,
    payment_status: input.payment_status ?? 'pending',
    down_payment: input.down_payment ?? 0.0,
    remaining_payment: input.remaining_payment ?? Math.max(input.total_amount - (input.down_payment ?? 0), 0),
    status: input.status ?? 'pending',
    admin_approval_id: input.admin_approval_id ?? null,
    admin_approved_at: input.admin_approved_at ?? null,
    proof_of_payment: input.proof_of_payment ?? null,
    transaction_details: input.transaction_details ?? null,
    notes: input.notes ?? null,
    contract_url: input.contract_url ?? null,
    transaction_date: input.transaction_date ?? null,
    confirmed_at: input.confirmed_at ?? null,
    completed_at: input.completed_at ?? null,
    cancelled_at: input.cancelled_at ?? null,
    // Hapus 'amount' karena tidak ada di schema Supabase Anda
    // Tambahkan invoice_number unik untuk menghindari 409 Conflict
    invoice_number: generateInvoiceNumber(),
  };

  // Coba insert pertama
  let { data, error } = await supabase
    .from('transactions')
    .insert(payload)
    .select('*')
    .single();

  // Jika bentrok unique invoice_number, retry sekali dengan invoice baru
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

    // Tidak membuat payment otomatis lagi
    // Payment akan dibuat hanya ketika pengguna mengisi form pembayaran dan mengunggah bukti

    return { success: true, data: retry.data };
  }

  if (error) {
    return { success: false, error: error.message };
  }

  // Tidak membuat payment otomatis lagi
  // Payment akan dibuat hanya ketika pengguna mengisi form pembayaran dan mengunggah bukti

  return { success: true, data };
}

// Tambahan: tipe dan fungsi untuk admin agar dapat mengambil transaksi pembelian + payments
export type Transaction = {
  id: string;
  buyer_id: string;
  seller_id: string;
  car_id: string;
  transaction_type: 'purchase' | 'trade_in' | 'installment' | string;
  car_price: number;
  trade_in_value?: number;
  discount_amount?: number;
  admin_fee?: number;
  total_amount: number;
  payment_method?: string | null;
  payment_status?: 'pending' | 'partial' | 'paid' | 'failed' | 'refunded';
  down_payment?: number;
  remaining_payment?: number;
  status?: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  invoice_number?: string | null;
  created_at?: string;
  updated_at?: string;
  // Buyer information from join
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

// Fungsi untuk mengambil transaksi showroom (seller dengan role admin/owner)
export async function getShowroomTransactionsWithPayments(
  page: number = 1,
  limit: number = 10,
  opts?: {
    status?: Transaction['status'][];
    payment_status?: Transaction['payment_status'][];
    search?: string; // cari di invoice_number
  }
): Promise<{ success: boolean; data?: TransactionWithPayments[]; total?: number; error?: string }> {
  try {
    const offset = (page - 1) * limit;

    // Ambil mobil yang dimiliki seller dengan role admin/owner
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
      .in('users.role', ['admin']); // perbaikan: hanya 'admin'

    if (!showroomCars || showroomCars.length === 0) {
      return { success: true, data: [], total: 0 };
    }

    const showroomCarIds = showroomCars.map(car => car.id);

    // Ambil transaksi pembelian untuk mobil showroom
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

// Fungsi untuk mengambil transaksi eksternal (seller dengan role user)
export async function getExternalTransactionsWithPayments(
  page: number = 1,
  limit: number = 10,
  opts?: {
    status?: Transaction['status'][];
    payment_status?: Transaction['payment_status'][];
    search?: string; // cari di invoice_number
  }
): Promise<{ success: boolean; data?: TransactionWithPayments[]; total?: number; error?: string }> {
  try {
    const offset = (page - 1) * limit;

    // Ambil mobil yang dimiliki seller dengan role 'seller' (eksternal)
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
      .in('users.role', ['user', 'seller']); // eksternal = user (sesuai komentar)

    if (!externalCars || externalCars.length === 0) {
      return { success: true, data: [], total: 0 };
    }

    const externalCarIds = externalCars.map(car => car.id);

    // Ambil transaksi pembelian untuk mobil eksternal
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

    // Ambil buyer info
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

    // Format transaksi dengan info buyer
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

    // Ambil payments dan rangkum
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
export async function getPurchaseTransactionsWithPayments(
  page: number = 1,
  limit: number = 10,
  opts?: {
    status?: Transaction['status'][];
    payment_status?: Transaction['payment_status'][];
    search?: string; // cari di invoice_number
  }
): Promise<{ success: boolean; data?: TransactionWithPayments[]; total?: number; error?: string }> {
  try {
    const offset = (page - 1) * limit;

    // Ambil SEMUA transaksi pembelian tanpa memfilter role seller
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('transaction_type', 'purchase')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (opts?.status && opts.status.length) {
      query = query.in('status', opts.status);
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

// Tambahan: Konfirmasi DP (booking fee) dan tolak pembayaran
export async function confirmBookingPayment(
  transactionId: string,
  paymentId: string,
  adminId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // 1) Set payment -> success + verified
    const { data: updatedPayment, error: paymentErr } = await supabase
      .from('payments')
      .update({
        status: 'success',
        verified_by: adminId,
        verified_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select()
      .single();
    if (paymentErr) return { success: false, error: paymentErr.message };

    // 2) Ambil transaksi
    const { data: txn, error: txnErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
    if (txnErr || !txn) return { success: false, error: txnErr?.message || 'Transaksi tidak ditemukan' };

    // 3) Hitung total paid (success)
    const { data: payments, error: paysErr } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', transactionId);
    if (paysErr) return { success: false, error: paysErr.message };

    const totalPaid = (payments || [])
      .filter((p: any) => p.status === 'success')
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    const paymentStatus =
      totalPaid >= Number(txn.total_amount) ? 'paid' : totalPaid > 0 ? 'partial' : 'pending';

    // 4) Update transaksi: set confirmed jika sebelumnya pending dan DP sudah sukses
    const shouldConfirm = (txn.status === 'pending');
    const updates: any = {
      payment_status: paymentStatus,
      ...(shouldConfirm ? { status: 'confirmed', confirmed_at: new Date().toISOString() } : {})
    };

    const { error: updErr } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', transactionId);
    if (updErr) return { success: false, error: updErr.message };

    return { success: true, message: 'Pembayaran booking fee telah dikonfirmasi' };
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal konfirmasi pembayaran' };
  }
}

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
    if (getPayErr || !pay) return { success: false, error: getPayErr?.message || 'Payment tidak ditemukan' };

    // 2) Update payment -> failed
    const { error: updPayErr } = await supabase
      .from('payments')
      .update({
        status: 'failed',
        verified_by: adminId,
        verified_at: new Date().toISOString(),
        rejection_reason: reason || null
      })
      .eq('id', paymentId);
    if (updPayErr) return { success: false, error: updPayErr.message };

    // 3) Recompute status transaksi berdasarkan payments yang success
    const { data: payments, error: paysErr } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', pay.transaction_id);
    if (paysErr) return { success: false, error: paysErr.message };

    const totalPaid = (payments || [])
      .filter((p: any) => p.status === 'success')
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

    const { data: txn, error: txnErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', pay.transaction_id)
      .single();
    if (txnErr || !txn) return { success: false, error: txnErr?.message || 'Transaksi tidak ditemukan' };

    // Tentukan payment_status: jika ada failed dan belum ada paid, set 'failed'
    const hasFailed = (payments || []).some((p: any) => p.status === 'failed');
    let paymentStatus: Transaction['payment_status'];
    if (totalPaid >= Number(txn.total_amount)) {
      paymentStatus = 'paid';
    } else if (totalPaid > 0) {
      paymentStatus = 'partial';
    } else if (hasFailed) {
      paymentStatus = 'failed';
    } else {
      paymentStatus = 'pending';
    }

    const { error: updTxnErr } = await supabase
      .from('transactions')
      .update({ payment_status: paymentStatus })
      .eq('id', pay.transaction_id);
    if (updTxnErr) return { success: false, error: updTxnErr.message };

    return { success: true, message: 'Pembayaran ditolak' };
  } catch (e: any) {
    return { success: false, error: e.message || 'Gagal menolak pembayaran' };
  }
}