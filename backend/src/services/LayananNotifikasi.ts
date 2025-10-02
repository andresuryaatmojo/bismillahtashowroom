// LayananNotifikasi.ts - Layanan Notifikasi Komprehensif untuk Mobilindo Showroom
// Menangani berbagai jenis notifikasi: Email, SMS, Push, WhatsApp, In-App

// ==================== INTERFACES & TYPES ====================

export interface NotificationData {
  id: string;
  userId: string;
  type: 'email' | 'sms' | 'push' | 'whatsapp' | 'in_app';
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface EmailNotification extends NotificationData {
  type: 'email';
  to: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  htmlContent?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType: string;
  size: number;
}

export interface SMSNotification extends NotificationData {
  type: 'sms';
  phoneNumber: string;
  countryCode: string;
  provider: 'twilio' | 'nexmo' | 'local';
}

export interface PushNotification extends NotificationData {
  type: 'push';
  deviceTokens: string[];
  platform: 'ios' | 'android' | 'web';
  badge?: number;
  sound?: string;
  icon?: string;
  image?: string;
  clickAction?: string;
}

export interface WhatsAppNotification extends NotificationData {
  type: 'whatsapp';
  phoneNumber: string;
  templateName?: string;
  templateParams?: string[];
  mediaUrl?: string;
  mediaType?: 'image' | 'document' | 'video' | 'audio';
}

export interface InAppNotification extends NotificationData {
  type: 'in_app';
  category: 'system' | 'promotion' | 'reminder' | 'alert' | 'update';
  actionUrl?: string;
  actionText?: string;
  isRead: boolean;
  readAt?: Date;
}

export interface NotificationPreferences {
  userId: string;
  email: {
    enabled: boolean;
    marketing: boolean;
    transactional: boolean;
    reminders: boolean;
  };
  sms: {
    enabled: boolean;
    marketing: boolean;
    alerts: boolean;
  };
  push: {
    enabled: boolean;
    marketing: boolean;
    alerts: boolean;
    reminders: boolean;
  };
  whatsapp: {
    enabled: boolean;
    marketing: boolean;
    alerts: boolean;
  };
  inApp: {
    enabled: boolean;
    all: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:mm format
    endTime: string;   // HH:mm format
    timezone: string;
  };
}

export interface BulkNotificationRequest {
  id: string;
  type: NotificationData['type'];
  recipients: string[]; // user IDs
  template: string;
  templateData?: Record<string, any>;
  scheduledAt?: Date;
  priority: NotificationData['priority'];
  batchSize: number;
  delayBetweenBatches: number; // milliseconds
}

export interface NotificationStatus {
  id: string;
  status: 'pending' | 'processing' | 'sent' | 'delivered' | 'failed' | 'expired';
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: Date;
  provider?: string;
  providerMessageId?: string;
  cost?: number;
}

export interface NotificationLog {
  id: string;
  notificationId: string;
  userId: string;
  type: NotificationData['type'];
  status: NotificationStatus['status'];
  timestamp: Date;
  metadata?: Record<string, any>;
  errorDetails?: string;
  processingTime?: number; // milliseconds
}

export interface ScheduledNotification {
  id: string;
  notification: NotificationData;
  scheduledAt: Date;
  timezone: string;
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[]; // 0-6, Sunday = 0
    dayOfMonth?: number;   // 1-31
  };
  isActive: boolean;
  lastExecuted?: Date;
  nextExecution?: Date;
}

export interface SLAMetrics {
  type: NotificationData['type'];
  targetDeliveryTime: number; // milliseconds
  actualAverageTime: number;
  successRate: number; // percentage
  failureRate: number; // percentage
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface NotificationReport {
  id: string;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    deliveryRate: number;
    averageDeliveryTime: number;
    cost: number;
  };
  byType: Record<NotificationData['type'], {
    sent: number;
    delivered: number;
    failed: number;
    cost: number;
  }>;
  byPriority: Record<NotificationData['priority'], {
    sent: number;
    delivered: number;
    averageTime: number;
  }>;
  slaMetrics: SLAMetrics[];
  topFailureReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  recommendations: string[];
}

export interface NotificationServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: Date;
  requestId: string;
}

// ==================== LAYANAN NOTIFIKASI CLASS ====================

export class LayananNotifikasi {
  private static instance: LayananNotifikasi;
  private notificationQueue: Map<string, NotificationData[]> = new Map();
  private statusTracker: Map<string, NotificationStatus> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private logs: NotificationLog[] = [];
  private slaTargets: Map<NotificationData['type'], number> = new Map([
    ['email', 30000],    // 30 seconds
    ['sms', 10000],      // 10 seconds
    ['push', 5000],      // 5 seconds
    ['whatsapp', 15000], // 15 seconds
    ['in_app', 1000]     // 1 second
  ]);

  private constructor() {
    this.initializeDefaultPreferences();
    this.startScheduledNotificationProcessor();
    this.startSLAMonitoring();
  }

  public static getInstance(): LayananNotifikasi {
    if (!LayananNotifikasi.instance) {
      LayananNotifikasi.instance = new LayananNotifikasi();
    }
    return LayananNotifikasi.instance;
  }

  // ==================== METODE UTAMA ====================

  /**
   * 1. Kirim Notifikasi Email
   */
  public async kirimNotifikasiEmail(
    emailData: Omit<EmailNotification, 'id' | 'type'>
  ): Promise<NotificationServiceResponse<NotificationStatus>> {
    const requestId = this.generateId();
    
    try {
      // Validasi data email
      const validation = this.validateEmailData(emailData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
          code: 'VALIDATION_ERROR',
          timestamp: new Date(),
          requestId
        };
      }

      // Cek preferensi pengguna
      const canSend = await this.checkUserPreferences(emailData.userId, 'email');
      if (!canSend) {
        return {
          success: false,
          error: 'User has disabled email notifications',
          code: 'USER_PREFERENCE_DISABLED',
          timestamp: new Date(),
          requestId
        };
      }

      // Buat notifikasi email
      const notification: EmailNotification = {
        ...emailData,
        id: this.generateId(),
        type: 'email'
      };

      // Proses pengiriman
      const status = await this.processEmailSending(notification);
      this.statusTracker.set(notification.id, status);

      // Log aktivitas
      await this.logNotifikasi({
        id: this.generateId(),
        notificationId: notification.id,
        userId: notification.userId,
        type: 'email',
        status: status.status,
        timestamp: new Date(),
        metadata: {
          to: emailData.to,
          subject: emailData.subject,
          priority: emailData.priority
        }
      });

      return {
        success: true,
        data: status,
        timestamp: new Date(),
        requestId
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'PROCESSING_ERROR',
        timestamp: new Date(),
        requestId
      };
    }
  }

  /**
   * 2. Kirim Notifikasi SMS
   */
  public async kirimNotifikasiSMS(
    smsData: Omit<SMSNotification, 'id' | 'type'>
  ): Promise<NotificationServiceResponse<NotificationStatus>> {
    const requestId = this.generateId();
    
    try {
      // Validasi nomor telepon
      const validation = this.validatePhoneNumber(smsData.phoneNumber, smsData.countryCode);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
          code: 'INVALID_PHONE_NUMBER',
          timestamp: new Date(),
          requestId
        };
      }

      // Cek preferensi pengguna
      const canSend = await this.checkUserPreferences(smsData.userId, 'sms');
      if (!canSend) {
        return {
          success: false,
          error: 'User has disabled SMS notifications',
          code: 'USER_PREFERENCE_DISABLED',
          timestamp: new Date(),
          requestId
        };
      }

      // Buat notifikasi SMS
      const notification: SMSNotification = {
        ...smsData,
        id: this.generateId(),
        type: 'sms'
      };

      // Proses pengiriman
      const status = await this.processSMSSending(notification);
      this.statusTracker.set(notification.id, status);

      // Log aktivitas
      await this.logNotifikasi({
        id: this.generateId(),
        notificationId: notification.id,
        userId: notification.userId,
        type: 'sms',
        status: status.status,
        timestamp: new Date(),
        metadata: {
          phoneNumber: smsData.phoneNumber,
          provider: smsData.provider,
          priority: smsData.priority
        }
      });

      return {
        success: true,
        data: status,
        timestamp: new Date(),
        requestId
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'PROCESSING_ERROR',
        timestamp: new Date(),
        requestId
      };
    }
  }

  /**
   * 3. Kirim Notifikasi Push
   */
  public async kirimNotifikasiPush(
    pushData: Omit<PushNotification, 'id' | 'type'>
  ): Promise<NotificationServiceResponse<NotificationStatus>> {
    const requestId = this.generateId();
    
    try {
      // Validasi device tokens
      const validation = this.validateDeviceTokens(pushData.deviceTokens);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
          code: 'INVALID_DEVICE_TOKENS',
          timestamp: new Date(),
          requestId
        };
      }

      // Cek preferensi pengguna
      const canSend = await this.checkUserPreferences(pushData.userId, 'push');
      if (!canSend) {
        return {
          success: false,
          error: 'User has disabled push notifications',
          code: 'USER_PREFERENCE_DISABLED',
          timestamp: new Date(),
          requestId
        };
      }

      // Buat notifikasi push
      const notification: PushNotification = {
        ...pushData,
        id: this.generateId(),
        type: 'push'
      };

      // Proses pengiriman
      const status = await this.processPushSending(notification);
      this.statusTracker.set(notification.id, status);

      // Log aktivitas
      await this.logNotifikasi({
        id: this.generateId(),
        notificationId: notification.id,
        userId: notification.userId,
        type: 'push',
        status: status.status,
        timestamp: new Date(),
        metadata: {
          platform: pushData.platform,
          deviceCount: pushData.deviceTokens.length,
          priority: pushData.priority
        }
      });

      return {
        success: true,
        data: status,
        timestamp: new Date(),
        requestId
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'PROCESSING_ERROR',
        timestamp: new Date(),
        requestId
      };
    }
  }

  /**
   * 4. Kirim Notifikasi WhatsApp
   */
  public async kirimNotifikasiWhatsApp(
    whatsappData: Omit<WhatsAppNotification, 'id' | 'type'>
  ): Promise<NotificationServiceResponse<NotificationStatus>> {
    const requestId = this.generateId();
    
    try {
      // Validasi nomor WhatsApp
      const validation = this.validateWhatsAppNumber(whatsappData.phoneNumber);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
          code: 'INVALID_WHATSAPP_NUMBER',
          timestamp: new Date(),
          requestId
        };
      }

      // Cek preferensi pengguna
      const canSend = await this.checkUserPreferences(whatsappData.userId, 'whatsapp');
      if (!canSend) {
        return {
          success: false,
          error: 'User has disabled WhatsApp notifications',
          code: 'USER_PREFERENCE_DISABLED',
          timestamp: new Date(),
          requestId
        };
      }

      // Buat notifikasi WhatsApp
      const notification: WhatsAppNotification = {
        ...whatsappData,
        id: this.generateId(),
        type: 'whatsapp'
      };

      // Proses pengiriman
      const status = await this.processWhatsAppSending(notification);
      this.statusTracker.set(notification.id, status);

      // Log aktivitas
      await this.logNotifikasi({
        id: this.generateId(),
        notificationId: notification.id,
        userId: notification.userId,
        type: 'whatsapp',
        status: status.status,
        timestamp: new Date(),
        metadata: {
          phoneNumber: whatsappData.phoneNumber,
          templateName: whatsappData.templateName,
          priority: whatsappData.priority
        }
      });

      return {
        success: true,
        data: status,
        timestamp: new Date(),
        requestId
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'PROCESSING_ERROR',
        timestamp: new Date(),
        requestId
      };
    }
  }

  /**
   * 5. Kirim Notifikasi In-App
   */
  public async kirimNotifikasiInApp(
    inAppData: Omit<InAppNotification, 'id' | 'type' | 'isRead' | 'readAt'>
  ): Promise<NotificationServiceResponse<NotificationStatus>> {
    const requestId = this.generateId();
    
    try {
      // Cek preferensi pengguna
      const canSend = await this.checkUserPreferences(inAppData.userId, 'in_app');
      if (!canSend) {
        return {
          success: false,
          error: 'User has disabled in-app notifications',
          code: 'USER_PREFERENCE_DISABLED',
          timestamp: new Date(),
          requestId
        };
      }

      // Buat notifikasi in-app
      const notification: InAppNotification = {
        ...inAppData,
        id: this.generateId(),
        type: 'in_app',
        isRead: false
      };

      // Proses penyimpanan (in-app notifications are stored, not sent)
      const status = await this.processInAppStorage(notification);
      this.statusTracker.set(notification.id, status);

      // Log aktivitas
      await this.logNotifikasi({
        id: this.generateId(),
        notificationId: notification.id,
        userId: notification.userId,
        type: 'in_app',
        status: status.status,
        timestamp: new Date(),
        metadata: {
          category: inAppData.category,
          priority: inAppData.priority
        }
      });

      return {
        success: true,
        data: status,
        timestamp: new Date(),
        requestId
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'PROCESSING_ERROR',
        timestamp: new Date(),
        requestId
      };
    }
  }

  /**
   * 6. Proses Notifikasi Massal
   */
  public async prosesNotifikasiMassal(
    bulkRequest: BulkNotificationRequest
  ): Promise<NotificationServiceResponse<{ jobId: string; estimatedCompletion: Date }>> {
    const requestId = this.generateId();
    
    try {
      // Validasi bulk request
      const validation = this.validateBulkRequest(bulkRequest);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
          code: 'VALIDATION_ERROR',
          timestamp: new Date(),
          requestId
        };
      }

      // Buat job ID untuk tracking
      const jobId = this.generateId();
      
      // Hitung estimasi waktu penyelesaian
      const totalBatches = Math.ceil(bulkRequest.recipients.length / bulkRequest.batchSize);
      const estimatedTime = totalBatches * bulkRequest.delayBetweenBatches;
      const estimatedCompletion = new Date(Date.now() + estimatedTime);

      // Mulai proses bulk notification secara asinkron
      this.processBulkNotificationAsync(jobId, bulkRequest);

      // Log job creation
      await this.logNotifikasi({
        id: this.generateId(),
        notificationId: jobId,
        userId: 'system',
        type: bulkRequest.type,
        status: 'processing',
        timestamp: new Date(),
        metadata: {
          recipientCount: bulkRequest.recipients.length,
          batchSize: bulkRequest.batchSize,
          estimatedCompletion
        }
      });

      return {
        success: true,
        data: {
          jobId,
          estimatedCompletion
        },
        timestamp: new Date(),
        requestId
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'PROCESSING_ERROR',
        timestamp: new Date(),
        requestId
      };
    }
  }

  /**
   * 7. Cek Status Pengiriman
   */
  public async cekStatusPengiriman(
    notificationId: string
  ): Promise<NotificationServiceResponse<NotificationStatus>> {
    const requestId = this.generateId();
    
    try {
      const status = this.statusTracker.get(notificationId);
      
      if (!status) {
        return {
          success: false,
          error: 'Notification not found',
          code: 'NOT_FOUND',
          timestamp: new Date(),
          requestId
        };
      }

      // Update status jika perlu (cek dengan provider eksternal)
      const updatedStatus = await this.refreshStatusFromProvider(status);
      if (updatedStatus) {
        this.statusTracker.set(notificationId, updatedStatus);
      }

      return {
        success: true,
        data: updatedStatus || status,
        timestamp: new Date(),
        requestId
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'PROCESSING_ERROR',
        timestamp: new Date(),
        requestId
      };
    }
  }

  /**
   * 8. Update Preferensi Notifikasi
   */
  public async updatePreferensiNotifikasi(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationServiceResponse<NotificationPreferences>> {
    const requestId = this.generateId();
    
    try {
      // Ambil preferensi yang ada atau buat default
      const currentPreferences = this.preferences.get(userId) || this.getDefaultPreferences(userId);
      
      // Merge dengan preferensi baru
      const updatedPreferences: NotificationPreferences = {
        ...currentPreferences,
        ...preferences,
        userId
      };

      // Validasi preferensi
      const validation = this.validatePreferences(updatedPreferences);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
          code: 'VALIDATION_ERROR',
          timestamp: new Date(),
          requestId
        };
      }

      // Simpan preferensi
      this.preferences.set(userId, updatedPreferences);
      await this.savePreferencesToDatabase(updatedPreferences);

      // Log perubahan
      await this.logNotifikasi({
        id: this.generateId(),
        notificationId: this.generateId(),
        userId,
        type: 'in_app',
        status: 'sent',
        timestamp: new Date(),
        metadata: {
          action: 'preferences_updated',
          changes: preferences
        }
      });

      return {
        success: true,
        data: updatedPreferences,
        timestamp: new Date(),
        requestId
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'PROCESSING_ERROR',
        timestamp: new Date(),
        requestId
      };
    }
  }

  /**
   * 9. Log Notifikasi
   */
  public async logNotifikasi(
    logData: NotificationLog
  ): Promise<NotificationServiceResponse<NotificationLog>> {
    const requestId = this.generateId();
    
    try {
      // Validasi log data
      if (!logData.id || !logData.notificationId || !logData.userId) {
        return {
          success: false,
          error: 'Missing required log fields',
          code: 'VALIDATION_ERROR',
          timestamp: new Date(),
          requestId
        };
      }

      // Tambahkan ke logs
      this.logs.push(logData);

      // Simpan ke database (simulasi)
      await this.saveLogToDatabase(logData);

      // Cleanup logs lama jika terlalu banyak
      if (this.logs.length > 10000) {
        this.logs = this.logs.slice(-5000); // Keep last 5000 logs
      }

      return {
        success: true,
        data: logData,
        timestamp: new Date(),
        requestId
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'PROCESSING_ERROR',
        timestamp: new Date(),
        requestId
      };
    }
  }

  /**
   * 10. Proses Notifikasi Terjadwal
   */
  public async prosesNotifikasiTerjadwal(
    scheduledData: Omit<ScheduledNotification, 'id' | 'isActive' | 'nextExecution'>
  ): Promise<NotificationServiceResponse<ScheduledNotification>> {
    const requestId = this.generateId();
    
    try {
      // Validasi data terjadwal
      const validation = this.validateScheduledNotification(scheduledData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
          code: 'VALIDATION_ERROR',
          timestamp: new Date(),
          requestId
        };
      }

      // Buat scheduled notification
      const scheduled: ScheduledNotification = {
        ...scheduledData,
        id: this.generateId(),
        isActive: true,
        nextExecution: this.calculateNextExecution(scheduledData)
      };

      // Simpan ke scheduler
      this.scheduledNotifications.set(scheduled.id, scheduled);
      await this.saveScheduledNotificationToDatabase(scheduled);

      // Log scheduling
      await this.logNotifikasi({
        id: this.generateId(),
        notificationId: scheduled.id,
        userId: scheduled.notification.userId,
        type: scheduled.notification.type,
        status: 'pending',
        timestamp: new Date(),
        metadata: {
          action: 'scheduled',
          scheduledAt: scheduled.scheduledAt,
          nextExecution: scheduled.nextExecution,
          recurring: scheduled.recurring
        }
      });

      return {
        success: true,
        data: scheduled,
        timestamp: new Date(),
        requestId
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'PROCESSING_ERROR',
        timestamp: new Date(),
        requestId
      };
    }
  }

  /**
   * 11. Monitoring SLA
   */
  public async monitoringSLA(
    period: { start: Date; end: Date }
  ): Promise<NotificationServiceResponse<SLAMetrics[]>> {
    const requestId = this.generateId();
    
    try {
      const slaMetrics: SLAMetrics[] = [];

      // Hitung SLA untuk setiap tipe notifikasi
      for (const [type, targetTime] of this.slaTargets.entries()) {
        const typeLogs = this.logs.filter(log => 
          log.type === type &&
          log.timestamp >= period.start &&
          log.timestamp <= period.end
        );

        if (typeLogs.length === 0) {
          continue;
        }

        const totalSent = typeLogs.length;
        const delivered = typeLogs.filter(log => log.status === 'delivered').length;
        const failed = typeLogs.filter(log => log.status === 'failed').length;
        
        const deliveryTimes = typeLogs
          .filter(log => log.processingTime)
          .map(log => log.processingTime!);
        
        const averageTime = deliveryTimes.length > 0 
          ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length
          : 0;

        const metrics: SLAMetrics = {
          type,
          targetDeliveryTime: targetTime,
          actualAverageTime: averageTime,
          successRate: (delivered / totalSent) * 100,
          failureRate: (failed / totalSent) * 100,
          totalSent,
          totalDelivered: delivered,
          totalFailed: failed,
          period
        };

        slaMetrics.push(metrics);
      }

      return {
        success: true,
        data: slaMetrics,
        timestamp: new Date(),
        requestId
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'PROCESSING_ERROR',
        timestamp: new Date(),
        requestId
      };
    }
  }

  /**
   * 12. Generate Laporan Notifikasi
   */
  public async generateLaporanNotifikasi(
    period: { start: Date; end: Date },
    includeDetails: boolean = false
  ): Promise<NotificationServiceResponse<NotificationReport>> {
    const requestId = this.generateId();
    
    try {
      // Filter logs berdasarkan periode
      const periodLogs = this.logs.filter(log => 
        log.timestamp >= period.start &&
        log.timestamp <= period.end
      );

      // Hitung summary
      const totalSent = periodLogs.length;
      const totalDelivered = periodLogs.filter(log => log.status === 'delivered').length;
      const totalFailed = periodLogs.filter(log => log.status === 'failed').length;
      const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;

      const deliveryTimes = periodLogs
        .filter(log => log.processingTime)
        .map(log => log.processingTime!);
      const averageDeliveryTime = deliveryTimes.length > 0 
        ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length
        : 0;

      // Hitung by type
      const byType: NotificationReport['byType'] = {} as any;
      for (const type of ['email', 'sms', 'push', 'whatsapp', 'in_app'] as const) {
        const typeLogs = periodLogs.filter(log => log.type === type);
        byType[type] = {
          sent: typeLogs.length,
          delivered: typeLogs.filter(log => log.status === 'delivered').length,
          failed: typeLogs.filter(log => log.status === 'failed').length,
          cost: this.calculateCostForType(type, typeLogs.length)
        };
      }

      // Hitung by priority
      const byPriority: NotificationReport['byPriority'] = {} as any;
      for (const priority of ['low', 'medium', 'high', 'urgent'] as const) {
        const priorityLogs = periodLogs.filter(log => 
          log.metadata?.priority === priority
        );
        const priorityTimes = priorityLogs
          .filter(log => log.processingTime)
          .map(log => log.processingTime!);
        
        byPriority[priority] = {
          sent: priorityLogs.length,
          delivered: priorityLogs.filter(log => log.status === 'delivered').length,
          averageTime: priorityTimes.length > 0 
            ? priorityTimes.reduce((sum, time) => sum + time, 0) / priorityTimes.length
            : 0
        };
      }

      // Get SLA metrics
      const slaMetrics = await this.monitoringSLA(period);
      
      // Analisis failure reasons
      const failureLogs = periodLogs.filter(log => log.status === 'failed');
      const failureReasons = new Map<string, number>();
      
      failureLogs.forEach(log => {
        const reason = log.errorDetails || 'Unknown error';
        failureReasons.set(reason, (failureReasons.get(reason) || 0) + 1);
      });

      const topFailureReasons = Array.from(failureReasons.entries())
        .map(([reason, count]) => ({
          reason,
          count,
          percentage: (count / totalFailed) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Generate recommendations
      const recommendations = this.generateRecommendations(
        deliveryRate,
        averageDeliveryTime,
        slaMetrics.data || [],
        topFailureReasons
      );

      const report: NotificationReport = {
        id: this.generateId(),
        period,
        summary: {
          totalSent,
          totalDelivered,
          totalFailed,
          deliveryRate,
          averageDeliveryTime,
          cost: Object.values(byType).reduce((sum, type) => sum + type.cost, 0)
        },
        byType,
        byPriority,
        slaMetrics: slaMetrics.data || [],
        topFailureReasons,
        recommendations
      };

      return {
        success: true,
        data: report,
        timestamp: new Date(),
        requestId
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'PROCESSING_ERROR',
        timestamp: new Date(),
        requestId
      };
    }
  }

  // ==================== HELPER METHODS ====================

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeDefaultPreferences(): void {
    // Initialize with some mock user preferences
    const mockUsers = ['user1', 'user2', 'user3'];
    mockUsers.forEach(userId => {
      this.preferences.set(userId, this.getDefaultPreferences(userId));
    });
  }

  private getDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      email: {
        enabled: true,
        marketing: true,
        transactional: true,
        reminders: true
      },
      sms: {
        enabled: true,
        marketing: false,
        alerts: true
      },
      push: {
        enabled: true,
        marketing: true,
        alerts: true,
        reminders: true
      },
      whatsapp: {
        enabled: false,
        marketing: false,
        alerts: false
      },
      inApp: {
        enabled: true,
        all: true
      },
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'Asia/Jakarta'
      }
    };
  }

  private validateEmailData(emailData: any): { isValid: boolean; error?: string } {
    if (!emailData.to || !emailData.subject || !emailData.message) {
      return { isValid: false, error: 'Missing required email fields' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.to)) {
      return { isValid: false, error: 'Invalid email address' };
    }
    
    return { isValid: true };
  }

  private validatePhoneNumber(phoneNumber: string, countryCode: string): { isValid: boolean; error?: string } {
    if (!phoneNumber || !countryCode) {
      return { isValid: false, error: 'Missing phone number or country code' };
    }
    
    // Basic phone number validation
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phoneNumber)) {
      return { isValid: false, error: 'Invalid phone number format' };
    }
    
    return { isValid: true };
  }

  private validateDeviceTokens(tokens: string[]): { isValid: boolean; error?: string } {
    if (!tokens || tokens.length === 0) {
      return { isValid: false, error: 'No device tokens provided' };
    }
    
    if (tokens.length > 1000) {
      return { isValid: false, error: 'Too many device tokens (max 1000)' };
    }
    
    return { isValid: true };
  }

  private validateWhatsAppNumber(phoneNumber: string): { isValid: boolean; error?: string } {
    if (!phoneNumber) {
      return { isValid: false, error: 'Missing WhatsApp phone number' };
    }
    
    // WhatsApp numbers should start with country code
    if (!phoneNumber.startsWith('+')) {
      return { isValid: false, error: 'WhatsApp number must include country code' };
    }
    
    return { isValid: true };
  }

  private validateBulkRequest(request: BulkNotificationRequest): { isValid: boolean; error?: string } {
    if (!request.recipients || request.recipients.length === 0) {
      return { isValid: false, error: 'No recipients provided' };
    }
    
    if (request.recipients.length > 100000) {
      return { isValid: false, error: 'Too many recipients (max 100,000)' };
    }
    
    if (request.batchSize <= 0 || request.batchSize > 1000) {
      return { isValid: false, error: 'Invalid batch size (1-1000)' };
    }
    
    return { isValid: true };
  }

  private validatePreferences(preferences: NotificationPreferences): { isValid: boolean; error?: string } {
    if (!preferences.userId) {
      return { isValid: false, error: 'Missing user ID' };
    }
    
    // Validate quiet hours format
    if (preferences.quietHours?.enabled) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(preferences.quietHours.startTime) || 
          !timeRegex.test(preferences.quietHours.endTime)) {
        return { isValid: false, error: 'Invalid quiet hours time format (HH:mm)' };
      }
    }
    
    return { isValid: true };
  }

  private validateScheduledNotification(scheduled: any): { isValid: boolean; error?: string } {
    if (!scheduled.notification || !scheduled.scheduledAt) {
      return { isValid: false, error: 'Missing notification data or schedule time' };
    }
    
    if (scheduled.scheduledAt <= new Date()) {
      return { isValid: false, error: 'Schedule time must be in the future' };
    }
    
    return { isValid: true };
  }

  private async checkUserPreferences(userId: string, type: NotificationData['type']): Promise<boolean> {
    const preferences = this.preferences.get(userId);
    if (!preferences) return true; // Default allow if no preferences set
    
    // Check quiet hours
    if (preferences.quietHours.enabled && this.isInQuietHours(preferences.quietHours)) {
      return false;
    }
    
    // Check type-specific preferences
    switch (type) {
      case 'email':
        return preferences.email.enabled;
      case 'sms':
        return preferences.sms.enabled;
      case 'push':
        return preferences.push.enabled;
      case 'whatsapp':
        return preferences.whatsapp.enabled;
      case 'in_app':
        return preferences.inApp.enabled;
      default:
        return true;
    }
  }

  private isInQuietHours(quietHours: NotificationPreferences['quietHours']): boolean {
    // Simplified quiet hours check (would need proper timezone handling in production)
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return currentTime >= quietHours.startTime && currentTime <= quietHours.endTime;
  }

  private async processEmailSending(notification: EmailNotification): Promise<NotificationStatus> {
    // Simulate email sending process
    const status: NotificationStatus = {
      id: this.generateId(),
      status: 'processing',
      attempts: 1,
      maxAttempts: 3,
      provider: 'sendgrid'
    };

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simulate success/failure (90% success rate)
    if (Math.random() > 0.1) {
      status.status = 'sent';
      status.sentAt = new Date();
      status.providerMessageId = `sg_${this.generateId()}`;
      
      // Simulate delivery confirmation after some time
      setTimeout(() => {
        status.status = 'delivered';
        status.deliveredAt = new Date();
      }, 5000);
    } else {
      status.status = 'failed';
      status.failedAt = new Date();
      status.errorMessage = 'SMTP connection failed';
    }

    return status;
  }

  private async processSMSSending(notification: SMSNotification): Promise<NotificationStatus> {
    // Simulate SMS sending process
    const status: NotificationStatus = {
      id: this.generateId(),
      status: 'processing',
      attempts: 1,
      maxAttempts: 3,
      provider: notification.provider,
      cost: 0.05 // $0.05 per SMS
    };

    await new Promise(resolve => setTimeout(resolve, 50));

    // Simulate success/failure (95% success rate)
    if (Math.random() > 0.05) {
      status.status = 'sent';
      status.sentAt = new Date();
      status.providerMessageId = `sms_${this.generateId()}`;
      
      setTimeout(() => {
        status.status = 'delivered';
        status.deliveredAt = new Date();
      }, 2000);
    } else {
      status.status = 'failed';
      status.failedAt = new Date();
      status.errorMessage = 'Invalid phone number';
    }

    return status;
  }

  private async processPushSending(notification: PushNotification): Promise<NotificationStatus> {
    // Simulate push notification sending
    const status: NotificationStatus = {
      id: this.generateId(),
      status: 'processing',
      attempts: 1,
      maxAttempts: 3,
      provider: notification.platform === 'ios' ? 'apns' : 'fcm'
    };

    await new Promise(resolve => setTimeout(resolve, 30));

    // Simulate success/failure (98% success rate)
    if (Math.random() > 0.02) {
      status.status = 'sent';
      status.sentAt = new Date();
      status.providerMessageId = `push_${this.generateId()}`;
      
      setTimeout(() => {
        status.status = 'delivered';
        status.deliveredAt = new Date();
      }, 1000);
    } else {
      status.status = 'failed';
      status.failedAt = new Date();
      status.errorMessage = 'Invalid device token';
    }

    return status;
  }

  private async processWhatsAppSending(notification: WhatsAppNotification): Promise<NotificationStatus> {
    // Simulate WhatsApp sending process
    const status: NotificationStatus = {
      id: this.generateId(),
      status: 'processing',
      attempts: 1,
      maxAttempts: 3,
      provider: 'whatsapp_business',
      cost: 0.02 // $0.02 per message
    };

    await new Promise(resolve => setTimeout(resolve, 80));

    // Simulate success/failure (92% success rate)
    if (Math.random() > 0.08) {
      status.status = 'sent';
      status.sentAt = new Date();
      status.providerMessageId = `wa_${this.generateId()}`;
      
      setTimeout(() => {
        status.status = 'delivered';
        status.deliveredAt = new Date();
      }, 3000);
    } else {
      status.status = 'failed';
      status.failedAt = new Date();
      status.errorMessage = 'WhatsApp number not registered';
    }

    return status;
  }

  private async processInAppStorage(notification: InAppNotification): Promise<NotificationStatus> {
    // In-app notifications are stored, not sent
    const status: NotificationStatus = {
      id: this.generateId(),
      status: 'sent', // Immediately "sent" since it's stored
      sentAt: new Date(),
      attempts: 1,
      maxAttempts: 1,
      provider: 'internal'
    };

    // Simulate storage
    await this.saveInAppNotificationToDatabase(notification);

    return status;
  }

  private async processBulkNotificationAsync(jobId: string, bulkRequest: BulkNotificationRequest): Promise<void> {
    const batches = this.createBatches(bulkRequest.recipients, bulkRequest.batchSize);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      // Process batch
      const batchPromises = batch.map(async (userId) => {
        const notification = this.createNotificationFromTemplate(
          bulkRequest.template,
          bulkRequest.templateData,
          userId,
          bulkRequest.type
        );
        
        // Send notification based on type
        switch (bulkRequest.type) {
          case 'email':
            return this.kirimNotifikasiEmail(notification as any);
          case 'sms':
            return this.kirimNotifikasiSMS(notification as any);
          case 'push':
            return this.kirimNotifikasiPush(notification as any);
          case 'whatsapp':
            return this.kirimNotifikasiWhatsApp(notification as any);
          case 'in_app':
            return this.kirimNotifikasiInApp(notification as any);
        }
      });

      await Promise.allSettled(batchPromises);
      
      // Delay between batches (except for last batch)
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, bulkRequest.delayBetweenBatches));
      }
    }

    // Log completion
    await this.logNotifikasi({
      id: this.generateId(),
      notificationId: jobId,
      userId: 'system',
      type: bulkRequest.type,
      status: 'delivered',
      timestamp: new Date(),
      metadata: {
        action: 'bulk_completed',
        totalRecipients: bulkRequest.recipients.length,
        totalBatches: batches.length
      }
    });
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private createNotificationFromTemplate(
    template: string,
    templateData: any,
    userId: string,
    type: NotificationData['type']
  ): Partial<NotificationData> {
    // Simple template processing (would use a proper template engine in production)
    let processedMessage = template;
    if (templateData) {
      Object.entries(templateData).forEach(([key, value]) => {
        processedMessage = processedMessage.replace(`{{${key}}}`, String(value));
      });
    }

    return {
      userId,
      type,
      title: 'Bulk Notification',
      message: processedMessage,
      priority: 'medium'
    };
  }

  private async refreshStatusFromProvider(status: NotificationStatus): Promise<NotificationStatus | null> {
    // Simulate checking status with external provider
    if (status.status === 'sent' && status.providerMessageId) {
      // Randomly update to delivered (simulation)
      if (Math.random() > 0.5) {
        return {
          ...status,
          status: 'delivered',
          deliveredAt: new Date()
        };
      }
    }
    return null;
  }

  private calculateNextExecution(scheduled: Omit<ScheduledNotification, 'id' | 'isActive' | 'nextExecution'>): Date {
    if (!scheduled.recurring) {
      return scheduled.scheduledAt;
    }

    const now = new Date();
    let nextExecution = new Date(scheduled.scheduledAt);

    // Calculate next execution based on recurring pattern
    switch (scheduled.recurring.pattern) {
      case 'daily':
        while (nextExecution <= now) {
          nextExecution.setDate(nextExecution.getDate() + scheduled.recurring.interval);
        }
        break;
      case 'weekly':
        while (nextExecution <= now) {
          nextExecution.setDate(nextExecution.getDate() + (7 * scheduled.recurring.interval));
        }
        break;
      case 'monthly':
        while (nextExecution <= now) {
          nextExecution.setMonth(nextExecution.getMonth() + scheduled.recurring.interval);
        }
        break;
      case 'yearly':
        while (nextExecution <= now) {
          nextExecution.setFullYear(nextExecution.getFullYear() + scheduled.recurring.interval);
        }
        break;
    }

    return nextExecution;
  }

  private startScheduledNotificationProcessor(): void {
    // Check for scheduled notifications every minute
    setInterval(async () => {
      const now = new Date();
      
      for (const [id, scheduled] of this.scheduledNotifications.entries()) {
        if (scheduled.isActive && scheduled.nextExecution && scheduled.nextExecution <= now) {
          // Execute notification
          await this.executeScheduledNotification(scheduled);
          
          // Update next execution if recurring
          if (scheduled.recurring) {
            scheduled.lastExecuted = now;
            scheduled.nextExecution = this.calculateNextExecution(scheduled);
            
            // Check if recurring should end
            if (scheduled.recurring.endDate && scheduled.nextExecution > scheduled.recurring.endDate) {
              scheduled.isActive = false;
            }
          } else {
            // One-time notification, deactivate
            scheduled.isActive = false;
          }
        }
      }
    }, 60000); // Check every minute
  }

  private async executeScheduledNotification(scheduled: ScheduledNotification): Promise<void> {
    try {
      const notification = scheduled.notification;
      
      // Send notification based on type
      switch (notification.type) {
        case 'email':
          await this.kirimNotifikasiEmail(notification as any);
          break;
        case 'sms':
          await this.kirimNotifikasiSMS(notification as any);
          break;
        case 'push':
          await this.kirimNotifikasiPush(notification as any);
          break;
        case 'whatsapp':
          await this.kirimNotifikasiWhatsApp(notification as any);
          break;
        case 'in_app':
          await this.kirimNotifikasiInApp(notification as any);
          break;
      }

      // Log execution
      await this.logNotifikasi({
        id: this.generateId(),
        notificationId: scheduled.id,
        userId: notification.userId,
        type: notification.type,
        status: 'sent',
        timestamp: new Date(),
        metadata: {
          action: 'scheduled_executed',
          originalSchedule: scheduled.scheduledAt
        }
      });

    } catch (error) {
      // Log error
      await this.logNotifikasi({
        id: this.generateId(),
        notificationId: scheduled.id,
        userId: scheduled.notification.userId,
        type: scheduled.notification.type,
        status: 'failed',
        timestamp: new Date(),
        errorDetails: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          action: 'scheduled_failed'
        }
      });
    }
  }

  private startSLAMonitoring(): void {
    // Monitor SLA every 5 minutes
    setInterval(async () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      const slaMetrics = await this.monitoringSLA({
        start: fiveMinutesAgo,
        end: now
      });

      if (slaMetrics.success && slaMetrics.data) {
        // Check for SLA violations
        for (const metric of slaMetrics.data) {
          if (metric.actualAverageTime > metric.targetDeliveryTime * 1.5) {
            // SLA violation - log alert
            await this.logNotifikasi({
              id: this.generateId(),
              notificationId: this.generateId(),
              userId: 'system',
              type: metric.type,
              status: 'failed',
              timestamp: new Date(),
              metadata: {
                action: 'sla_violation',
                targetTime: metric.targetDeliveryTime,
                actualTime: metric.actualAverageTime,
                violationPercentage: ((metric.actualAverageTime - metric.targetDeliveryTime) / metric.targetDeliveryTime) * 100
              }
            });
          }
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  private calculateCostForType(type: NotificationData['type'], count: number): number {
    const costs = {
      email: 0.001,    // $0.001 per email
      sms: 0.05,       // $0.05 per SMS
      push: 0,         // Free
      whatsapp: 0.02,  // $0.02 per WhatsApp
      in_app: 0        // Free
    };

    return (costs[type] || 0) * count;
  }

  private generateRecommendations(
    deliveryRate: number,
    averageDeliveryTime: number,
    slaMetrics: SLAMetrics[],
    topFailureReasons: Array<{ reason: string; count: number; percentage: number }>
  ): string[] {
    const recommendations: string[] = [];

    // Delivery rate recommendations
    if (deliveryRate < 95) {
      recommendations.push('Delivery rate is below 95%. Consider reviewing provider configurations and retry mechanisms.');
    }

    // Performance recommendations
    if (averageDeliveryTime > 30000) { // 30 seconds
      recommendations.push('Average delivery time is high. Consider optimizing notification processing pipeline.');
    }

    // SLA recommendations
    slaMetrics.forEach(metric => {
      if (metric.actualAverageTime > metric.targetDeliveryTime * 1.2) {
        recommendations.push(`${metric.type} notifications are exceeding SLA targets. Consider scaling infrastructure or optimizing delivery process.`);
      }
    });

    // Failure analysis recommendations
    if (topFailureReasons.length > 0) {
      const topReason = topFailureReasons[0];
      if (topReason.percentage > 20) {
        recommendations.push(`Top failure reason "${topReason.reason}" accounts for ${topReason.percentage.toFixed(1)}% of failures. Investigate and implement fixes.`);
      }
    }

    // Cost optimization
    recommendations.push('Consider implementing notification batching and deduplication to reduce costs.');
    
    // User experience
    recommendations.push('Implement user preference centers to reduce opt-outs and improve engagement.');

    return recommendations;
  }

  // Mock database operations (would be real database calls in production)
  private async savePreferencesToDatabase(preferences: NotificationPreferences): Promise<void> {
    // Simulate database save
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  private async saveLogToDatabase(log: NotificationLog): Promise<void> {
    // Simulate database save
    await new Promise(resolve => setTimeout(resolve, 5));
  }

  private async saveScheduledNotificationToDatabase(scheduled: ScheduledNotification): Promise<void> {
    // Simulate database save
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  private async saveInAppNotificationToDatabase(notification: InAppNotification): Promise<void> {
    // Simulate database save
    await new Promise(resolve => setTimeout(resolve, 5));
  }
}

// Export singleton instance
export const layananNotifikasi = LayananNotifikasi.getInstance();
export default layananNotifikasi;