import axios from 'axios';
import KontrollerAuth from './KontrollerAuth';

// Base URL untuk API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Interface untuk data pesanan
export interface DataPesanan {
  carId: string;
  buyerId: string;
  sellerId: string;
  paymentMethod: 'cash' | 'credit' | 'leasing';
  totalAmount: number;
  downPayment?: number;
  loanDetails?: {
    loanAmount: number;
    interestRate: number;
    loanTerm: number; // in months
    monthlyPayment: number;
    bankId: string;
    bankName: string;
  };
  tradeInDetails?: {
    tradeInCarId: string;
    tradeInValue: number;
    tradeInDescription: string;
  };
  additionalServices?: {
    insurance?: {
      type: 'comprehensive' | 'tlo';
      provider: string;
      premium: number;
      duration: number;
    };
    warranty?: {
      type: 'extended' | 'standard';
      duration: number;
      coverage: string[];
      cost: number;
    };
    maintenance?: {
      package: string;
      duration: number;
      cost: number;
    };
  };
  deliveryInfo?: {
    address: string;
    city: string;
    province: string;
    postalCode: string;
    deliveryDate: Date;
    deliveryFee: number;
  };
  notes?: string;
}

// Interface untuk status transaksi
export interface StatusTransaksi {
  id: string;
  orderId: string;
  status: 'pending' | 'processing' | 'payment_pending' | 'payment_confirmed' | 'preparing' | 'ready_for_delivery' | 'delivered' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  createdAt: Date;
  updatedAt: Date;
  timeline: TransactionTimeline[];
  paymentDetails?: PaymentDetails;
  deliveryDetails?: DeliveryDetails;
}

// Interface untuk timeline transaksi
export interface TransactionTimeline {
  id: string;
  status: string;
  description: string;
  timestamp: Date;
  actor: string;
  notes?: string;
}

// Interface untuk detail pembayaran
export interface PaymentDetails {
  paymentId: string;
  paymentMethod: string;
  paymentProvider: string;
  paymentUrl?: string;
  qrCode?: string;
  virtualAccount?: string;
  bankCode?: string;
  accountNumber?: string;
  expiryTime?: Date;
  instructions?: string[];
  fees: {
    platformFee: number;
    paymentFee: number;
    totalFees: number;
  };
}

// Interface untuk detail pengiriman
export interface DeliveryDetails {
  deliveryId: string;
  courierName: string;
  trackingNumber: string;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  deliveryAddress: {
    recipient: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
  deliveryStatus: 'preparing' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
}

// Interface untuk response transaksi
export interface TransaksiResponse {
  success: boolean;
  message: string;
  data: {
    transactionId: string;
    orderId: string;
    paymentDetails?: PaymentDetails;
    redirectUrl?: string;
  };
}

// Interface untuk response status pembayaran
export interface StatusPembayaranResponse {
  success: boolean;
  message: string;
  data: StatusTransaksi;
}

// Interface untuk invoice
export interface Invoice {
  invoiceId: string;
  orderId: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  subtotal: number;
  taxes: number;
  discount: number;
  total: number;
  paymentTerms: string;
  notes?: string;
}

// Interface untuk item invoice
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate: number;
}

class KontrollerTransaksi {
  private static instance: KontrollerTransaksi;
  private authController: KontrollerAuth;
  private cache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();

  private constructor() {
    this.authController = KontrollerAuth.getInstance();
  }

  public static getInstance(): KontrollerTransaksi {
    if (!KontrollerTransaksi.instance) {
      KontrollerTransaksi.instance = new KontrollerTransaksi();
    }
    return KontrollerTransaksi.instance;
  }

  // Get authorization headers
  private getAuthHeaders() {
    const token = this.authController.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Cache management
  private getCacheKey(method: string, params: any): string {
    return `${method}_${JSON.stringify(params)}`;
  }

  private isValidCache(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private setCache(key: string, data: any, ttlMinutes: number = 5): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + ttlMinutes * 60 * 1000);
  }

  // Proses transaksi baru
  public async prosesTransaksi(dataPesanan: DataPesanan): Promise<TransaksiResponse | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        throw new Error('User must be logged in to create transaction');
      }

      // Validate data pesanan
      const validationResult = this.validateDataPesanan(dataPesanan);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errors.join(', '));
      }

      const response = await axios.post(`${API_BASE_URL}/transactions`, dataPesanan, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        // Clear related cache
        this.clearTransactionCache();
        return response.data;
      }

      return null;
    } catch (error: any) {
      console.error('Proses transaksi error:', error);
      
      // Return mock response for development
      return this.getMockTransaksiResponse(dataPesanan);
    }
  }

  // Cek status pembayaran
  public async cekStatusPembayaran(idPesanan: string): Promise<StatusPembayaranResponse | null> {
    try {
      const cacheKey = this.getCacheKey('payment_status', { idPesanan });
      
      // Check cache first (short TTL for payment status)
      if (this.isValidCache(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const response = await axios.get(`${API_BASE_URL}/transactions/${idPesanan}/payment-status`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        // Cache with short TTL (1 minute) for payment status
        this.setCache(cacheKey, response.data, 1);
        return response.data;
      }

      return null;
    } catch (error: any) {
      console.error('Cek status pembayaran error:', error);
      
      // Return mock response for development
      return this.getMockStatusPembayaran(idPesanan);
    }
  }

  // Get transaction history
  public async getTransactionHistory(
    page: number = 1,
    limit: number = 10,
    status?: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<{ transactions: StatusTransaksi[]; pagination: any } | null> {
    try {
      if (!this.authController.isAuthenticated()) {
        return null;
      }

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (status) params.append('status', status);
      if (dateFrom) params.append('dateFrom', dateFrom.toISOString());
      if (dateTo) params.append('dateTo', dateTo.toISOString());

      const response = await axios.get(`${API_BASE_URL}/transactions/history?${params.toString()}`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get transaction history error:', error);
      return this.getMockTransactionHistory();
    }
  }

  // Cancel transaction
  public async cancelTransaction(idPesanan: string, reason: string): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.post(`${API_BASE_URL}/transactions/${idPesanan}/cancel`, {
        reason
      }, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        this.clearTransactionCache();
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Cancel transaction error:', error);
      return false;
    }
  }

  // Request refund
  public async requestRefund(idPesanan: string, reason: string, amount?: number): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.post(`${API_BASE_URL}/transactions/${idPesanan}/refund`, {
        reason,
        amount
      }, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        this.clearTransactionCache();
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Request refund error:', error);
      return false;
    }
  }

  // Get invoice
  public async getInvoice(idPesanan: string): Promise<Invoice | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/transactions/${idPesanan}/invoice`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Get invoice error:', error);
      return this.getMockInvoice(idPesanan);
    }
  }

  // Download invoice PDF
  public async downloadInvoicePDF(idPesanan: string): Promise<Blob | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/transactions/${idPesanan}/invoice/pdf`, {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      });

      return response.data;
    } catch (error: any) {
      console.error('Download invoice PDF error:', error);
      return null;
    }
  }

  // Update delivery address
  public async updateDeliveryAddress(idPesanan: string, newAddress: any): Promise<boolean> {
    try {
      if (!this.authController.isAuthenticated()) {
        return false;
      }

      const response = await axios.put(`${API_BASE_URL}/transactions/${idPesanan}/delivery-address`, 
        newAddress, 
        {
          headers: this.getAuthHeaders()
        }
      );

      if (response.data.success) {
        this.clearTransactionCache();
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Update delivery address error:', error);
      return false;
    }
  }

  // Track delivery
  public async trackDelivery(idPesanan: string): Promise<DeliveryDetails | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/transactions/${idPesanan}/delivery/track`, {
        headers: this.getAuthHeaders()
      });

      if (response.data.success) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      console.error('Track delivery error:', error);
      return this.getMockDeliveryDetails(idPesanan);
    }
  }

  // Validate data pesanan
  private validateDataPesanan(data: DataPesanan): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.carId) errors.push('Car ID is required');
    if (!data.buyerId) errors.push('Buyer ID is required');
    if (!data.sellerId) errors.push('Seller ID is required');
    if (!data.paymentMethod) errors.push('Payment method is required');
    if (!data.totalAmount || data.totalAmount <= 0) errors.push('Total amount must be greater than 0');

    if (data.paymentMethod === 'credit' && !data.loanDetails) {
      errors.push('Loan details are required for credit payment');
    }

    if (data.loanDetails) {
      if (!data.loanDetails.bankId) errors.push('Bank ID is required for loan');
      if (data.loanDetails.loanAmount <= 0) errors.push('Loan amount must be greater than 0');
      if (data.loanDetails.interestRate < 0) errors.push('Interest rate cannot be negative');
      if (data.loanDetails.loanTerm <= 0) errors.push('Loan term must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Clear transaction cache
  private clearTransactionCache(): void {
    const keysToDelete: string[] = [];
    
    const cacheKeys = Array.from(this.cache.keys()); for (const key of cacheKeys) {
      if (key.includes('transaction') || key.includes('payment_status')) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    });
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

  // Calculate monthly payment
  public calculateMonthlyPayment(
    loanAmount: number,
    interestRate: number,
    loanTerm: number
  ): number {
    const monthlyRate = interestRate / 100 / 12;
    const payment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm)) / 
                   (Math.pow(1 + monthlyRate, loanTerm) - 1);
    return Math.round(payment);
  }

  // Get payment methods
  public getPaymentMethods(): Array<{ id: string; name: string; description: string; fees: number }> {
    return [
      { id: 'cash', name: 'Cash', description: 'Pembayaran tunai', fees: 0 },
      { id: 'bank_transfer', name: 'Transfer Bank', description: 'Transfer melalui bank', fees: 2500 },
      { id: 'credit_card', name: 'Kartu Kredit', description: 'Pembayaran dengan kartu kredit', fees: 0.029 },
      { id: 'e_wallet', name: 'E-Wallet', description: 'Pembayaran melalui dompet digital', fees: 0.007 },
      { id: 'virtual_account', name: 'Virtual Account', description: 'Virtual Account bank', fees: 4000 },
      { id: 'credit', name: 'Kredit', description: 'Pembiayaan kredit kendaraan', fees: 0 }
    ];
  }

  // Mock data for development
  private getMockTransaksiResponse(dataPesanan: DataPesanan): TransaksiResponse {
    return {
      success: true,
      message: 'Transaksi berhasil dibuat',
      data: {
        transactionId: 'TXN-' + Date.now(),
        orderId: 'ORD-' + Date.now(),
        paymentDetails: {
          paymentId: 'PAY-' + Date.now(),
          paymentMethod: dataPesanan.paymentMethod,
          paymentProvider: 'Midtrans',
          paymentUrl: 'https://app.sandbox.midtrans.com/snap/v1/transactions/token',
          expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          fees: {
            platformFee: 5000,
            paymentFee: 2500,
            totalFees: 7500
          }
        },
        redirectUrl: 'https://app.sandbox.midtrans.com/snap/v1/transactions/token'
      }
    };
  }

  private getMockStatusPembayaran(idPesanan: string): StatusPembayaranResponse {
    return {
      success: true,
      message: 'Status pembayaran berhasil diambil',
      data: {
        id: idPesanan,
        orderId: 'ORD-' + idPesanan,
        status: 'payment_pending',
        paymentStatus: 'pending',
        paymentMethod: 'bank_transfer',
        totalAmount: 250000000,
        paidAmount: 0,
        remainingAmount: 250000000,
        createdAt: new Date(),
        updatedAt: new Date(),
        timeline: [
          {
            id: '1',
            status: 'pending',
            description: 'Pesanan dibuat',
            timestamp: new Date(),
            actor: 'System'
          },
          {
            id: '2',
            status: 'payment_pending',
            description: 'Menunggu pembayaran',
            timestamp: new Date(),
            actor: 'System'
          }
        ]
      }
    };
  }

  private getMockTransactionHistory(): { transactions: StatusTransaksi[]; pagination: any } {
    return {
      transactions: [
        {
          id: '1',
          orderId: 'ORD-001',
          status: 'completed',
          paymentStatus: 'paid',
          paymentMethod: 'bank_transfer',
          totalAmount: 250000000,
          paidAmount: 250000000,
          remainingAmount: 0,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          timeline: []
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

  private getMockInvoice(idPesanan: string): Invoice {
    return {
      invoiceId: 'INV-' + idPesanan,
      orderId: idPesanan,
      invoiceNumber: 'INV-2024-001',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'sent',
      items: [
        {
          id: '1',
          description: 'Toyota Avanza 2023',
          quantity: 1,
          unitPrice: 250000000,
          total: 250000000,
          taxRate: 0.1
        }
      ],
      subtotal: 250000000,
      taxes: 25000000,
      discount: 0,
      total: 275000000,
      paymentTerms: '7 hari',
      notes: 'Terima kasih atas pembelian Anda'
    };
  }

  private getMockDeliveryDetails(idPesanan: string): DeliveryDetails {
    return {
      deliveryId: 'DEL-' + idPesanan,
      courierName: 'JNE',
      trackingNumber: 'JNE123456789',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      deliveryAddress: {
        recipient: 'John Doe',
        phone: '08123456789',
        address: 'Jl. Sudirman No. 123',
        city: 'Jakarta',
        province: 'DKI Jakarta',
        postalCode: '12345'
      },
      deliveryStatus: 'in_transit'
    };
  }
}

export default KontrollerTransaksi;
