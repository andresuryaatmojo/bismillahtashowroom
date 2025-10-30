// Top-level imports
import { supabase } from '../lib/supabase';
import paymentService from './paymentService';

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