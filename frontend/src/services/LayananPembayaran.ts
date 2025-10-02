/**
 * LayananPembayaran - Comprehensive Payment Service
 * Handles invoice generation, payment processing, verification, pricing, refunds, and notifications
 * for Mobilindo Showroom system
 */

// ==================== INTERFACES ====================

export interface InvoiceData {
  invoiceId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  itemId: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: 'vehicle' | 'service' | 'parts' | 'insurance' | 'other';
}

export interface PaymentTransaction {
  transactionId: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'cash' | 'financing' | 'crypto';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  gatewayResponse?: any;
  referenceNumber?: string;
  processedAt?: Date;
  completedAt?: Date;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentVerification {
  transactionId: string;
  status: 'verified' | 'pending' | 'failed' | 'disputed';
  verificationMethod: 'automatic' | 'manual' | 'third_party';
  verifiedBy?: string;
  verifiedAt?: Date;
  confidence: number;
  details: {
    bankVerification?: boolean;
    amountMatch?: boolean;
    timelineMatch?: boolean;
    documentVerification?: boolean;
  };
  notes?: string;
}

export interface ServicePricing {
  serviceId: string;
  serviceName: string;
  basePrice: number;
  category: 'maintenance' | 'repair' | 'inspection' | 'consultation' | 'delivery';
  pricingTier: 'basic' | 'premium' | 'vip';
  modifiers: PricingModifier[];
  finalPrice: number;
  validUntil: Date;
  terms?: string;
}

export interface PricingModifier {
  type: 'discount' | 'surcharge' | 'tax' | 'fee';
  name: string;
  value: number;
  isPercentage: boolean;
  reason: string;
}

export interface RefundRequest {
  refundId: string;
  transactionId: string;
  customerId: string;
  amount: number;
  reason: string;
  status: 'requested' | 'approved' | 'processing' | 'completed' | 'rejected';
  requestedBy: string;
  approvedBy?: string;
  processedBy?: string;
  refundMethod: 'original_payment' | 'bank_transfer' | 'cash' | 'store_credit';
  estimatedProcessingTime: number; // in days
  actualProcessingTime?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentNotification {
  notificationId: string;
  type: 'invoice_created' | 'payment_received' | 'payment_failed' | 'refund_processed' | 'overdue_reminder';
  recipientId: string;
  recipientType: 'customer' | 'admin' | 'finance';
  channels: ('email' | 'sms' | 'push' | 'whatsapp')[];
  content: {
    subject: string;
    message: string;
    templateId?: string;
    variables?: Record<string, any>;
  };
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  code?: string;
  timestamp: Date;
}

// ==================== MAIN SERVICE CLASS ====================

export class LayananPembayaran {
  private static instance: LayananPembayaran;
  private invoiceCounter: number = 1000;
  private transactionCounter: number = 5000;
  private refundCounter: number = 100;

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): LayananPembayaran {
    if (!LayananPembayaran.instance) {
      LayananPembayaran.instance = new LayananPembayaran();
    }
    return LayananPembayaran.instance;
  }

  private initializeService(): void {
    console.log('LayananPembayaran initialized');
    this.loadCounters();
  }

  // ==================== MAIN METHODS ====================

  /**
   * Generate invoice for customer transactions
   */
  public async generateInvoice(
    customerId: string,
    items: Omit<InvoiceItem, 'total'>[],
    options: {
      dueDate?: Date;
      discount?: number;
      notes?: string;
      paymentMethod?: string;
    } = {}
  ): Promise<PaymentResponse> {
    try {
      // Validate input
      if (!customerId || !items || items.length === 0) {
        return {
          success: false,
          message: 'Data pelanggan dan item invoice harus diisi',
          error: 'INVALID_INPUT',
          timestamp: new Date()
        };
      }

      // Get customer data
      const customer = await this.getCustomerData(customerId);
      if (!customer) {
        return {
          success: false,
          message: 'Data pelanggan tidak ditemukan',
          error: 'CUSTOMER_NOT_FOUND',
          timestamp: new Date()
        };
      }

      // Calculate totals
      const processedItems: InvoiceItem[] = items.map(item => ({
        ...item,
        total: item.quantity * item.unitPrice
      }));

      const subtotal = processedItems.reduce((sum, item) => sum + item.total, 0);
      const tax = subtotal * 0.11; // 11% PPN
      const discount = options.discount || 0;
      const total = subtotal + tax - discount;

      // Generate invoice
      const invoice: InvoiceData = {
        invoiceId: this.generateInvoiceId(),
        customerId,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        items: processedItems,
        subtotal,
        tax,
        discount,
        total,
        dueDate: options.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'draft',
        paymentMethod: options.paymentMethod,
        notes: options.notes,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save invoice
      await this.saveInvoice(invoice);

      // Send notification
      await this.kirimNotifikasiPembayaran(invoice.invoiceId, 'invoice_created', customerId);

      return {
        success: true,
        message: 'Invoice berhasil dibuat',
        data: invoice,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error generating invoice:', error);
      return {
        success: false,
        message: 'Gagal membuat invoice',
        error: 'GENERATION_FAILED',
        timestamp: new Date()
      };
    }
  }

  /**
   * Process payment transaction
   */
  public async prosesTransaksiPembayaran(
    invoiceId: string,
    paymentMethod: PaymentTransaction['paymentMethod'],
    paymentData: {
      amount: number;
      referenceNumber?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<PaymentResponse> {
    try {
      // Validate invoice
      const invoice = await this.getInvoiceData(invoiceId);
      if (!invoice) {
        return {
          success: false,
          message: 'Invoice tidak ditemukan',
          error: 'INVOICE_NOT_FOUND',
          timestamp: new Date()
        };
      }

      if (invoice.status === 'paid') {
        return {
          success: false,
          message: 'Invoice sudah dibayar',
          error: 'ALREADY_PAID',
          timestamp: new Date()
        };
      }

      // Validate amount
      if (paymentData.amount !== invoice.total) {
        return {
          success: false,
          message: 'Jumlah pembayaran tidak sesuai dengan total invoice',
          error: 'AMOUNT_MISMATCH',
          timestamp: new Date()
        };
      }

      // Create transaction
      const transaction: PaymentTransaction = {
        transactionId: this.generateTransactionId(),
        invoiceId,
        customerId: invoice.customerId,
        amount: paymentData.amount,
        paymentMethod,
        status: 'pending',
        referenceNumber: paymentData.referenceNumber,
        metadata: paymentData.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Process payment based on method
      const processResult = await this.processPaymentByMethod(transaction);
      
      if (processResult.success) {
        transaction.status = 'processing';
        transaction.processedAt = new Date();
        
        // Update invoice status
        invoice.status = 'sent';
        invoice.updatedAt = new Date();
        await this.saveInvoice(invoice);

        // Save transaction
        await this.saveTransaction(transaction);

        // Send notification
        await this.kirimNotifikasiPembayaran(invoiceId, 'payment_received', invoice.customerId);

        return {
          success: true,
          message: 'Pembayaran berhasil diproses',
          data: transaction,
          timestamp: new Date()
        };
      } else {
        transaction.status = 'failed';
        transaction.failureReason = processResult.error;
        await this.saveTransaction(transaction);

        await this.kirimNotifikasiPembayaran(invoiceId, 'payment_failed', invoice.customerId);

        return processResult;
      }

    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        message: 'Gagal memproses pembayaran',
        error: 'PROCESSING_FAILED',
        timestamp: new Date()
      };
    }
  }

  /**
   * Verify payment status
   */
  public async verifikasiStatusPembayaran(transactionId: string): Promise<PaymentResponse> {
    try {
      const transaction = await this.getTransactionData(transactionId);
      if (!transaction) {
        return {
          success: false,
          message: 'Transaksi tidak ditemukan',
          error: 'TRANSACTION_NOT_FOUND',
          timestamp: new Date()
        };
      }

      // Perform verification based on payment method
      const verification = await this.performPaymentVerification(transaction);

      // Update transaction status based on verification
      if (verification.status === 'verified') {
        transaction.status = 'completed';
        transaction.completedAt = new Date();
        
        // Update invoice status
        const invoice = await this.getInvoiceData(transaction.invoiceId);
        if (invoice) {
          invoice.status = 'paid';
          invoice.updatedAt = new Date();
          await this.saveInvoice(invoice);
        }
      } else if (verification.status === 'failed') {
        transaction.status = 'failed';
        transaction.failureReason = 'Verification failed';
      }

      transaction.updatedAt = new Date();
      await this.saveTransaction(transaction);

      return {
        success: true,
        message: 'Verifikasi pembayaran selesai',
        data: {
          transaction,
          verification
        },
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error verifying payment:', error);
      return {
        success: false,
        message: 'Gagal memverifikasi pembayaran',
        error: 'VERIFICATION_FAILED',
        timestamp: new Date()
      };
    }
  }

  /**
   * Calculate service pricing
   */
  public async hitungTarifLayanan(
    serviceId: string,
    customerId: string,
    options: {
      tier?: ServicePricing['pricingTier'];
      promoCode?: string;
      membershipLevel?: string;
      urgency?: 'normal' | 'urgent' | 'emergency';
    } = {}
  ): Promise<PaymentResponse> {
    try {
      // Get base service pricing
      const baseService = await this.getServicePricing(serviceId);
      if (!baseService) {
        return {
          success: false,
          message: 'Layanan tidak ditemukan',
          error: 'SERVICE_NOT_FOUND',
          timestamp: new Date()
        };
      }

      // Get customer data for personalized pricing
      const customer = await this.getCustomerData(customerId);
      
      const pricing: ServicePricing = {
        ...baseService,
        pricingTier: options.tier || 'basic',
        modifiers: [],
        finalPrice: baseService.basePrice,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };

      // Apply tier pricing
      if (options.tier === 'premium') {
        pricing.modifiers.push({
          type: 'surcharge',
          name: 'Premium Service',
          value: 25,
          isPercentage: true,
          reason: 'Enhanced service quality'
        });
        pricing.finalPrice *= 1.25;
      } else if (options.tier === 'vip') {
        pricing.modifiers.push({
          type: 'surcharge',
          name: 'VIP Service',
          value: 50,
          isPercentage: true,
          reason: 'Priority service with dedicated support'
        });
        pricing.finalPrice *= 1.5;
      }

      // Apply membership discount
      if (customer && options.membershipLevel) {
        const discount = this.getMembershipDiscount(options.membershipLevel);
        if (discount > 0) {
          pricing.modifiers.push({
            type: 'discount',
            name: `${options.membershipLevel} Member Discount`,
            value: discount,
            isPercentage: true,
            reason: 'Membership benefit'
          });
          pricing.finalPrice *= (1 - discount / 100);
        }
      }

      // Apply urgency surcharge
      if (options.urgency === 'urgent') {
        pricing.modifiers.push({
          type: 'surcharge',
          name: 'Urgent Service',
          value: 20,
          isPercentage: true,
          reason: 'Same-day service'
        });
        pricing.finalPrice *= 1.2;
      } else if (options.urgency === 'emergency') {
        pricing.modifiers.push({
          type: 'surcharge',
          name: 'Emergency Service',
          value: 50,
          isPercentage: true,
          reason: 'Immediate response required'
        });
        pricing.finalPrice *= 1.5;
      }

      // Apply promo code
      if (options.promoCode) {
        const promoDiscount = await this.validatePromoCode(options.promoCode);
        if (promoDiscount > 0) {
          pricing.modifiers.push({
            type: 'discount',
            name: `Promo Code: ${options.promoCode}`,
            value: promoDiscount,
            isPercentage: true,
            reason: 'Promotional discount'
          });
          pricing.finalPrice *= (1 - promoDiscount / 100);
        }
      }

      // Add tax
      const tax = pricing.finalPrice * 0.11; // 11% PPN
      pricing.modifiers.push({
        type: 'tax',
        name: 'PPN 11%',
        value: tax,
        isPercentage: false,
        reason: 'Government tax'
      });
      pricing.finalPrice += tax;

      // Round to nearest hundred
      pricing.finalPrice = Math.round(pricing.finalPrice / 100) * 100;

      return {
        success: true,
        message: 'Tarif layanan berhasil dihitung',
        data: pricing,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error calculating service pricing:', error);
      return {
        success: false,
        message: 'Gagal menghitung tarif layanan',
        error: 'CALCULATION_FAILED',
        timestamp: new Date()
      };
    }
  }

  /**
   * Process refund request
   */
  public async prosesRefund(
    transactionId: string,
    refundData: {
      amount?: number;
      reason: string;
      requestedBy: string;
      refundMethod?: RefundRequest['refundMethod'];
    }
  ): Promise<PaymentResponse> {
    try {
      const transaction = await this.getTransactionData(transactionId);
      if (!transaction) {
        return {
          success: false,
          message: 'Transaksi tidak ditemukan',
          error: 'TRANSACTION_NOT_FOUND',
          timestamp: new Date()
        };
      }

      if (transaction.status !== 'completed') {
        return {
          success: false,
          message: 'Hanya transaksi yang sudah selesai yang bisa di-refund',
          error: 'INVALID_TRANSACTION_STATUS',
          timestamp: new Date()
        };
      }

      const refundAmount = refundData.amount || transaction.amount;
      if (refundAmount > transaction.amount) {
        return {
          success: false,
          message: 'Jumlah refund tidak boleh melebihi jumlah transaksi',
          error: 'INVALID_REFUND_AMOUNT',
          timestamp: new Date()
        };
      }

      // Create refund request
      const refund: RefundRequest = {
        refundId: this.generateRefundId(),
        transactionId,
        customerId: transaction.customerId,
        amount: refundAmount,
        reason: refundData.reason,
        status: 'requested',
        requestedBy: refundData.requestedBy,
        refundMethod: refundData.refundMethod || 'original_payment',
        estimatedProcessingTime: this.getEstimatedProcessingTime(transaction.paymentMethod),
        notes: `Refund request for transaction ${transactionId}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Auto-approve small amounts or specific conditions
      if (refundAmount <= 100000 || refundData.reason === 'system_error') {
        refund.status = 'approved';
        refund.approvedBy = 'system';
      }

      await this.saveRefund(refund);

      // If approved, start processing
      if (refund.status === 'approved') {
        await this.processRefund(refund);
      }

      return {
        success: true,
        message: 'Permintaan refund berhasil dibuat',
        data: refund,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error processing refund:', error);
      return {
        success: false,
        message: 'Gagal memproses refund',
        error: 'REFUND_FAILED',
        timestamp: new Date()
      };
    }
  }

  /**
   * Check refund status
   */
  public async cekStatusRefund(refundId: string): Promise<PaymentResponse> {
    try {
      const refund = await this.getRefundData(refundId);
      if (!refund) {
        return {
          success: false,
          message: 'Data refund tidak ditemukan',
          error: 'REFUND_NOT_FOUND',
          timestamp: new Date()
        };
      }

      // Get related transaction data
      const transaction = await this.getTransactionData(refund.transactionId);

      // Calculate progress
      const progress = this.calculateRefundProgress(refund);

      return {
        success: true,
        message: 'Status refund berhasil diambil',
        data: {
          refund,
          transaction,
          progress,
          estimatedCompletion: this.getEstimatedCompletionDate(refund)
        },
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error checking refund status:', error);
      return {
        success: false,
        message: 'Gagal mengecek status refund',
        error: 'STATUS_CHECK_FAILED',
        timestamp: new Date()
      };
    }
  }

  /**
   * Save transaction data
   */
  public async simpanDataTransaksi(
    transactionData: Partial<PaymentTransaction>,
    metadata: {
      source: string;
      userId: string;
      sessionId?: string;
      ipAddress?: string;
    }
  ): Promise<PaymentResponse> {
    try {
      // Validate required fields
      if (!transactionData.invoiceId || !transactionData.customerId || !transactionData.amount) {
        return {
          success: false,
          message: 'Data transaksi tidak lengkap',
          error: 'INCOMPLETE_DATA',
          timestamp: new Date()
        };
      }

      // Create complete transaction object
      const transaction: PaymentTransaction = {
        transactionId: transactionData.transactionId || this.generateTransactionId(),
        invoiceId: transactionData.invoiceId,
        customerId: transactionData.customerId,
        amount: transactionData.amount,
        paymentMethod: transactionData.paymentMethod || 'bank_transfer',
        status: transactionData.status || 'pending',
        gatewayResponse: transactionData.gatewayResponse,
        referenceNumber: transactionData.referenceNumber,
        processedAt: transactionData.processedAt,
        completedAt: transactionData.completedAt,
        failureReason: transactionData.failureReason,
        metadata: {
          ...transactionData.metadata,
          ...metadata,
          savedAt: new Date().toISOString()
        },
        createdAt: transactionData.createdAt || new Date(),
        updatedAt: new Date()
      };

      // Save to storage
      await this.saveTransaction(transaction);

      // Log the save operation
      console.log(`Transaction ${transaction.transactionId} saved by ${metadata.userId} from ${metadata.source}`);

      return {
        success: true,
        message: 'Data transaksi berhasil disimpan',
        data: transaction,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error saving transaction data:', error);
      return {
        success: false,
        message: 'Gagal menyimpan data transaksi',
        error: 'SAVE_FAILED',
        timestamp: new Date()
      };
    }
  }

  /**
   * Send payment notification
   */
  public async kirimNotifikasiPembayaran(
    invoiceId: string,
    notificationType: PaymentNotification['type'],
    recipientId: string,
    options: {
      channels?: PaymentNotification['channels'];
      customMessage?: string;
      scheduledAt?: Date;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<PaymentResponse> {
    try {
      // Get invoice data
      const invoice = await this.getInvoiceData(invoiceId);
      if (!invoice) {
        return {
          success: false,
          message: 'Invoice tidak ditemukan',
          error: 'INVOICE_NOT_FOUND',
          timestamp: new Date()
        };
      }

      // Get recipient data
      const recipient = await this.getCustomerData(recipientId);
      if (!recipient) {
        return {
          success: false,
          message: 'Penerima notifikasi tidak ditemukan',
          error: 'RECIPIENT_NOT_FOUND',
          timestamp: new Date()
        };
      }

      // Generate notification content
      const content = this.generateNotificationContent(notificationType, invoice, options.customMessage);

      // Create notification
      const notification: PaymentNotification = {
        notificationId: this.generateNotificationId(),
        type: notificationType,
        recipientId,
        recipientType: 'customer',
        channels: options.channels || ['email', 'sms'],
        content,
        status: 'pending',
        scheduledAt: options.scheduledAt,
        metadata: {
          invoiceId,
          ...options.metadata
        }
      };

      // Send notification
      const sendResult = await this.sendNotification(notification);

      if (sendResult.success) {
        notification.status = 'sent';
        notification.sentAt = new Date();
      } else {
        notification.status = 'failed';
      }

      // Save notification record
      await this.saveNotification(notification);

      return {
        success: sendResult.success,
        message: sendResult.success ? 'Notifikasi berhasil dikirim' : 'Gagal mengirim notifikasi',
        data: notification,
        error: sendResult.success ? undefined : 'SEND_FAILED',
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error sending payment notification:', error);
      return {
        success: false,
        message: 'Gagal mengirim notifikasi pembayaran',
        error: 'NOTIFICATION_FAILED',
        timestamp: new Date()
      };
    }
  }

  // ==================== HELPER METHODS ====================

  private generateInvoiceId(): string {
    return `INV-${new Date().getFullYear()}-${String(++this.invoiceCounter).padStart(6, '0')}`;
  }

  private generateTransactionId(): string {
    return `TXN-${Date.now()}-${String(++this.transactionCounter).padStart(6, '0')}`;
  }

  private generateRefundId(): string {
    return `REF-${Date.now()}-${String(++this.refundCounter).padStart(4, '0')}`;
  }

  private generateNotificationId(): string {
    return `NOT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private async getCustomerData(customerId: string): Promise<any> {
    // Mock customer data - in real implementation, this would fetch from database
    return {
      id: customerId,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+62812345678',
      membershipLevel: 'gold'
    };
  }

  private async getInvoiceData(invoiceId: string): Promise<InvoiceData | null> {
    // Mock implementation - would fetch from database
    const mockInvoices = this.getMockInvoices();
    return mockInvoices.find(inv => inv.invoiceId === invoiceId) || null;
  }

  private async getTransactionData(transactionId: string): Promise<PaymentTransaction | null> {
    // Mock implementation - would fetch from database
    const mockTransactions = this.getMockTransactions();
    return mockTransactions.find(txn => txn.transactionId === transactionId) || null;
  }

  private async getRefundData(refundId: string): Promise<RefundRequest | null> {
    // Mock implementation - would fetch from database
    const mockRefunds = this.getMockRefunds();
    return mockRefunds.find(ref => ref.refundId === refundId) || null;
  }

  private async getServicePricing(serviceId: string): Promise<Omit<ServicePricing, 'modifiers' | 'finalPrice' | 'validUntil'> | null> {
    // Mock service pricing data
    const services = {
      'maintenance-basic': {
        serviceId: 'maintenance-basic',
        serviceName: 'Basic Maintenance',
        basePrice: 500000,
        category: 'maintenance' as const,
        pricingTier: 'basic' as const
      },
      'repair-engine': {
        serviceId: 'repair-engine',
        serviceName: 'Engine Repair',
        basePrice: 2000000,
        category: 'repair' as const,
        pricingTier: 'basic' as const
      }
    };
    return services[serviceId as keyof typeof services] || null;
  }

  private async processPaymentByMethod(transaction: PaymentTransaction): Promise<PaymentResponse> {
    // Mock payment processing - in real implementation, this would integrate with payment gateways
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time

    const successRate = 0.9; // 90% success rate for simulation
    const isSuccess = Math.random() < successRate;

    if (isSuccess) {
      return {
        success: true,
        message: 'Payment processed successfully',
        timestamp: new Date()
      };
    } else {
      return {
        success: false,
        message: 'Payment processing failed',
        error: 'GATEWAY_ERROR',
        timestamp: new Date()
      };
    }
  }

  private async performPaymentVerification(transaction: PaymentTransaction): Promise<PaymentVerification> {
    // Mock verification process
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      transactionId: transaction.transactionId,
      status: 'verified',
      verificationMethod: 'automatic',
      verifiedAt: new Date(),
      confidence: 0.95,
      details: {
        bankVerification: true,
        amountMatch: true,
        timelineMatch: true,
        documentVerification: true
      }
    };
  }

  private getMembershipDiscount(membershipLevel: string): number {
    const discounts = {
      'bronze': 5,
      'silver': 10,
      'gold': 15,
      'platinum': 20,
      'diamond': 25
    };
    return discounts[membershipLevel as keyof typeof discounts] || 0;
  }

  private async validatePromoCode(promoCode: string): Promise<number> {
    // Mock promo code validation
    const promoCodes = {
      'WELCOME10': 10,
      'SAVE20': 20,
      'NEWCUSTOMER': 15,
      'LOYALTY25': 25
    };
    return promoCodes[promoCode as keyof typeof promoCodes] || 0;
  }

  private getEstimatedProcessingTime(paymentMethod: PaymentTransaction['paymentMethod']): number {
    const processingTimes = {
      'credit_card': 1,
      'bank_transfer': 3,
      'cash': 0,
      'financing': 7,
      'crypto': 1
    };
    return processingTimes[paymentMethod] || 3;
  }

  private async processRefund(refund: RefundRequest): Promise<void> {
    // Mock refund processing
    refund.status = 'processing';
    refund.updatedAt = new Date();
    
    // Simulate processing time
    setTimeout(async () => {
      refund.status = 'completed';
      refund.actualProcessingTime = Math.ceil(Math.random() * refund.estimatedProcessingTime);
      refund.updatedAt = new Date();
      await this.saveRefund(refund);
    }, 2000);
  }

  private calculateRefundProgress(refund: RefundRequest): number {
    const statusProgress = {
      'requested': 25,
      'approved': 50,
      'processing': 75,
      'completed': 100,
      'rejected': 0
    };
    return statusProgress[refund.status] || 0;
  }

  private getEstimatedCompletionDate(refund: RefundRequest): Date {
    const now = new Date();
    const daysToAdd = refund.estimatedProcessingTime - (refund.actualProcessingTime || 0);
    return new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  }

  private generateNotificationContent(
    type: PaymentNotification['type'],
    invoice: InvoiceData,
    customMessage?: string
  ): PaymentNotification['content'] {
    if (customMessage) {
      return {
        subject: `Payment Notification - ${invoice.invoiceId}`,
        message: customMessage
      };
    }

    const templates = {
      'invoice_created': {
        subject: `Invoice ${invoice.invoiceId} - Mobilindo Showroom`,
        message: `Halo ${invoice.customerName}, invoice Anda sebesar Rp ${invoice.total.toLocaleString('id-ID')} telah dibuat. Silakan lakukan pembayaran sebelum ${invoice.dueDate.toLocaleDateString('id-ID')}.`
      },
      'payment_received': {
        subject: `Pembayaran Diterima - ${invoice.invoiceId}`,
        message: `Terima kasih ${invoice.customerName}, pembayaran Anda sebesar Rp ${invoice.total.toLocaleString('id-ID')} telah kami terima dan sedang diproses.`
      },
      'payment_failed': {
        subject: `Pembayaran Gagal - ${invoice.invoiceId}`,
        message: `Halo ${invoice.customerName}, pembayaran untuk invoice ${invoice.invoiceId} gagal diproses. Silakan coba lagi atau hubungi customer service kami.`
      },
      'refund_processed': {
        subject: `Refund Diproses - ${invoice.invoiceId}`,
        message: `Halo ${invoice.customerName}, refund untuk invoice ${invoice.invoiceId} telah diproses dan akan diterima dalam 3-5 hari kerja.`
      },
      'overdue_reminder': {
        subject: `Pengingat Pembayaran - ${invoice.invoiceId}`,
        message: `Halo ${invoice.customerName}, invoice ${invoice.invoiceId} sebesar Rp ${invoice.total.toLocaleString('id-ID')} telah jatuh tempo. Mohon segera lakukan pembayaran.`
      }
    };

    return templates[type] || templates['invoice_created'];
  }

  private async sendNotification(notification: PaymentNotification): Promise<{ success: boolean }> {
    // Mock notification sending - in real implementation, this would integrate with notification services
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: Math.random() > 0.1 }; // 90% success rate
  }

  private async saveInvoice(invoice: InvoiceData): Promise<void> {
    // Mock save to database
    console.log(`Saving invoice: ${invoice.invoiceId}`);
  }

  private async saveTransaction(transaction: PaymentTransaction): Promise<void> {
    // Mock save to database
    console.log(`Saving transaction: ${transaction.transactionId}`);
  }

  private async saveRefund(refund: RefundRequest): Promise<void> {
    // Mock save to database
    console.log(`Saving refund: ${refund.refundId}`);
  }

  private async saveNotification(notification: PaymentNotification): Promise<void> {
    // Mock save to database
    console.log(`Saving notification: ${notification.notificationId}`);
  }

  private loadCounters(): void {
    // In real implementation, load from persistent storage
    this.invoiceCounter = 1000;
    this.transactionCounter = 5000;
    this.refundCounter = 100;
  }

  private getMockInvoices(): InvoiceData[] {
    return [
      {
        invoiceId: 'INV-2024-001001',
        customerId: 'CUST-001',
        customerName: 'John Doe',
        customerEmail: 'john.doe@example.com',
        customerPhone: '+62812345678',
        items: [
          {
            itemId: 'ITEM-001',
            name: 'Toyota Avanza 2024',
            description: 'New Toyota Avanza 2024 - White',
            quantity: 1,
            unitPrice: 250000000,
            total: 250000000,
            category: 'vehicle'
          }
        ],
        subtotal: 250000000,
        tax: 27500000,
        discount: 0,
        total: 277500000,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'sent',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private getMockTransactions(): PaymentTransaction[] {
    return [
      {
        transactionId: 'TXN-1234567890-005001',
        invoiceId: 'INV-2024-001001',
        customerId: 'CUST-001',
        amount: 277500000,
        paymentMethod: 'bank_transfer',
        status: 'completed',
        referenceNumber: 'REF-BT-001',
        processedAt: new Date(),
        completedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private getMockRefunds(): RefundRequest[] {
    return [
      {
        refundId: 'REF-1234567890-0101',
        transactionId: 'TXN-1234567890-005001',
        customerId: 'CUST-001',
        amount: 277500000,
        reason: 'Customer request',
        status: 'processing',
        requestedBy: 'CUST-001',
        refundMethod: 'original_payment',
        estimatedProcessingTime: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
}

// Export singleton instance
export default LayananPembayaran.getInstance();