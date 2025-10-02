/**
 * LayananChat - Comprehensive Chat Service
 * Handles messaging, validation, auto-replies, escalation, status management,
 * history tracking, notifications, and attachment processing for Mobilindo Showroom
 */

// ==================== INTERFACES ====================

export interface ChatMessage {
  messageId: string;
  chatId: string;
  senderId: string;
  senderType: 'customer' | 'admin' | 'system' | 'bot';
  recipientId?: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'system';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  attachments?: MessageAttachment[];
  metadata?: Record<string, any>;
  replyTo?: string;
  isEdited?: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageAttachment {
  attachmentId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  uploadedBy: string;
  scanStatus: 'pending' | 'clean' | 'infected' | 'failed';
  metadata?: Record<string, any>;
}

export interface ChatSession {
  chatId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  assignedAdminId?: string;
  assignedAdminName?: string;
  status: 'active' | 'waiting' | 'closed' | 'escalated' | 'transferred';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'sales' | 'support' | 'complaint' | 'inquiry' | 'technical' | 'billing';
  tags: string[];
  lastMessageAt: Date;
  lastMessagePreview: string;
  unreadCount: number;
  responseTime?: number; // in minutes
  resolutionTime?: number; // in minutes
  satisfaction?: {
    rating: number;
    feedback?: string;
    ratedAt: Date;
  };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedContent?: string;
  detectedLanguage?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  toxicity?: number; // 0-1 scale
  spamScore?: number; // 0-1 scale
}

export interface AutoReplyRule {
  ruleId: string;
  name: string;
  isActive: boolean;
  priority: number;
  conditions: {
    keywords?: string[];
    patterns?: string[];
    timeRange?: {
      start: string; // HH:mm format
      end: string;
    };
    customerType?: string[];
    category?: string[];
  };
  response: {
    type: 'text' | 'template' | 'escalate' | 'transfer';
    content?: string;
    templateId?: string;
    transferTo?: string;
    delay?: number; // in seconds
  };
  usage: {
    totalUsed: number;
    lastUsed?: Date;
    effectiveness: number; // 0-1 scale
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface EscalationRule {
  ruleId: string;
  name: string;
  isActive: boolean;
  triggers: {
    responseTimeExceeded?: number; // in minutes
    keywordDetected?: string[];
    customerTier?: string[];
    messageCount?: number;
    sentimentThreshold?: number;
    manualTrigger?: boolean;
  };
  actions: {
    notifyAdmins: string[];
    escalateTo?: string;
    changePriority?: ChatSession['priority'];
    addTags?: string[];
    sendNotification?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatNotification {
  notificationId: string;
  chatId: string;
  messageId?: string;
  type: 'new_message' | 'assignment' | 'escalation' | 'status_change' | 'reminder';
  recipientId: string;
  recipientType: 'admin' | 'customer' | 'supervisor';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  channels: ('email' | 'sms' | 'push' | 'in_app' | 'whatsapp')[];
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  code?: string;
  timestamp: Date;
}

// ==================== MAIN SERVICE CLASS ====================

export class LayananChat {
  private static instance: LayananChat;
  private messageCounter: number = 10000;
  private chatCounter: number = 1000;
  private attachmentCounter: number = 5000;

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): LayananChat {
    if (!LayananChat.instance) {
      LayananChat.instance = new LayananChat();
    }
    return LayananChat.instance;
  }

  private initializeService(): void {
    console.log('LayananChat initialized');
    this.loadCounters();
    this.initializeAutoReplyRules();
    this.initializeEscalationRules();
  }

  // ==================== MAIN METHODS ====================

  /**
   * Send message in chat
   */
  public async kirimPesan(
    chatId: string,
    senderId: string,
    senderType: ChatMessage['senderType'],
    content: string,
    options: {
      messageType?: ChatMessage['messageType'];
      priority?: ChatMessage['priority'];
      recipientId?: string;
      attachments?: Omit<MessageAttachment, 'attachmentId' | 'uploadedAt' | 'uploadedBy' | 'scanStatus'>[];
      replyTo?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<ChatResponse> {
    try {
      // Validate chat session
      const chatSession = await this.getChatSession(chatId);
      if (!chatSession) {
        return {
          success: false,
          message: 'Sesi chat tidak ditemukan',
          error: 'CHAT_NOT_FOUND',
          timestamp: new Date()
        };
      }

      if (chatSession.status === 'closed') {
        return {
          success: false,
          message: 'Sesi chat sudah ditutup',
          error: 'CHAT_CLOSED',
          timestamp: new Date()
        };
      }

      // Validate message content
      const validation = await this.validasiPesan(content, senderType);
      if (!validation.isValid) {
        return {
          success: false,
          message: `Pesan tidak valid: ${validation.errors.join(', ')}`,
          error: 'INVALID_MESSAGE',
          timestamp: new Date()
        };
      }

      // Process attachments if any
      let processedAttachments: MessageAttachment[] = [];
      if (options.attachments && options.attachments.length > 0) {
        const attachmentResult = await this.prosesAttachment(options.attachments, senderId);
        if (!attachmentResult.success) {
          return attachmentResult;
        }
        processedAttachments = attachmentResult.data;
      }

      // Create message
      const message: ChatMessage = {
        messageId: this.generateMessageId(),
        chatId,
        senderId,
        senderType,
        recipientId: options.recipientId,
        content: validation.sanitizedContent || content,
        messageType: options.messageType || 'text',
        status: 'sent',
        priority: options.priority || 'normal',
        attachments: processedAttachments.length > 0 ? processedAttachments : undefined,
        metadata: {
          ...options.metadata,
          sentiment: validation.sentiment,
          language: validation.detectedLanguage
        },
        replyTo: options.replyTo,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save message
      await this.saveMessage(message);

      // Update chat session
      await this.updateChatLastMessage(chatId, message);

      // Send notifications
      await this.notifikasiPesanBaru(message);

      // Check for auto-reply (only for customer messages)
      if (senderType === 'customer') {
        await this.balasOtomatis(chatId, message);
      }

      // Check escalation rules
      await this.checkEscalationRules(chatId, message);

      return {
        success: true,
        message: 'Pesan berhasil dikirim',
        data: message,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        message: 'Gagal mengirim pesan',
        error: 'SEND_FAILED',
        timestamp: new Date()
      };
    }
  }

  /**
   * Validate message content
   */
  public async validasiPesan(
    content: string,
    senderType: ChatMessage['senderType']
  ): Promise<MessageValidation> {
    try {
      const validation: MessageValidation = {
        isValid: true,
        errors: [],
        warnings: []
      };

      // Basic validation
      if (!content || content.trim().length === 0) {
        validation.isValid = false;
        validation.errors.push('Pesan tidak boleh kosong');
        return validation;
      }

      if (content.length > 4000) {
        validation.isValid = false;
        validation.errors.push('Pesan terlalu panjang (maksimal 4000 karakter)');
        return validation;
      }

      // Sanitize content
      validation.sanitizedContent = this.sanitizeContent(content);

      // Detect language
      validation.detectedLanguage = this.detectLanguage(content);

      // Analyze sentiment
      validation.sentiment = this.analyzeSentiment(content);

      // Check for spam (only for customer messages)
      if (senderType === 'customer') {
        validation.spamScore = this.calculateSpamScore(content);
        if (validation.spamScore > 0.8) {
          validation.isValid = false;
          validation.errors.push('Pesan terdeteksi sebagai spam');
        } else if (validation.spamScore > 0.6) {
          validation.warnings.push('Pesan mungkin spam');
        }
      }

      // Check toxicity
      validation.toxicity = this.calculateToxicity(content);
      if (validation.toxicity > 0.7) {
        validation.isValid = false;
        validation.errors.push('Pesan mengandung konten tidak pantas');
      } else if (validation.toxicity > 0.5) {
        validation.warnings.push('Pesan mungkin mengandung konten sensitif');
      }

      // Check for prohibited content
      const prohibitedWords = this.getProhibitedWords();
      const foundProhibited = prohibitedWords.filter(word => 
        content.toLowerCase().includes(word.toLowerCase())
      );
      
      if (foundProhibited.length > 0) {
        validation.warnings.push(`Pesan mengandung kata yang perlu diperhatikan: ${foundProhibited.join(', ')}`);
      }

      return validation;

    } catch (error) {
      console.error('Error validating message:', error);
      return {
        isValid: false,
        errors: ['Gagal memvalidasi pesan'],
        warnings: []
      };
    }
  }

  /**
   * Process automatic replies
   */
  public async balasOtomatis(chatId: string, incomingMessage: ChatMessage): Promise<ChatResponse> {
    try {
      const chatSession = await this.getChatSession(chatId);
      if (!chatSession) {
        return {
          success: false,
          message: 'Sesi chat tidak ditemukan',
          error: 'CHAT_NOT_FOUND',
          timestamp: new Date()
        };
      }

      // Skip auto-reply if admin is already assigned and active
      if (chatSession.assignedAdminId && chatSession.status === 'active') {
        return {
          success: true,
          message: 'Auto-reply dilewati karena admin sudah aktif',
          timestamp: new Date()
        };
      }

      // Get applicable auto-reply rules
      const rules = await this.getAutoReplyRules();
      const applicableRules = rules
        .filter(rule => rule.isActive)
        .filter(rule => this.matchesAutoReplyConditions(rule, incomingMessage, chatSession))
        .sort((a, b) => b.priority - a.priority);

      if (applicableRules.length === 0) {
        return {
          success: true,
          message: 'Tidak ada auto-reply rule yang cocok',
          timestamp: new Date()
        };
      }

      const selectedRule = applicableRules[0];

      // Process auto-reply based on rule type
      let replyContent = '';
      let shouldEscalate = false;
      let shouldTransfer = false;
      let transferTo = '';

      switch (selectedRule.response.type) {
        case 'text':
          replyContent = selectedRule.response.content || 'Terima kasih atas pesan Anda. Kami akan segera membalas.';
          break;
        
        case 'template':
          replyContent = await this.getTemplateContent(selectedRule.response.templateId!, {
            customerName: chatSession.customerName,
            chatId: chatSession.chatId
          });
          break;
        
        case 'escalate':
          shouldEscalate = true;
          replyContent = 'Pesan Anda telah diteruskan ke supervisor kami. Mohon tunggu sebentar.';
          break;
        
        case 'transfer':
          shouldTransfer = true;
          transferTo = selectedRule.response.transferTo!;
          replyContent = 'Pesan Anda sedang dialihkan ke departemen yang tepat. Mohon tunggu sebentar.';
          break;
      }

      // Add delay if specified
      if (selectedRule.response.delay && selectedRule.response.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, selectedRule.response.delay! * 1000));
      }

      // Send auto-reply message
      const autoReply = await this.kirimPesan(
        chatId,
        'system',
        'bot',
        replyContent,
        {
          messageType: 'text',
          priority: 'normal',
          metadata: {
            autoReply: true,
            ruleId: selectedRule.ruleId,
            ruleName: selectedRule.name
          }
        }
      );

      // Update rule usage
      await this.updateAutoReplyUsage(selectedRule.ruleId);

      // Handle escalation or transfer
      if (shouldEscalate) {
        await this.eskalasi(chatId, 'auto_reply_trigger', 'system');
      } else if (shouldTransfer && transferTo) {
        await this.transferChat(chatId, transferTo);
      }

      return {
        success: true,
        message: 'Auto-reply berhasil dikirim',
        data: {
          autoReply: autoReply.data,
          ruleUsed: selectedRule.name,
          escalated: shouldEscalate,
          transferred: shouldTransfer
        },
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error processing auto-reply:', error);
      return {
        success: false,
        message: 'Gagal memproses auto-reply',
        error: 'AUTO_REPLY_FAILED',
        timestamp: new Date()
      };
    }
  }

  /**
   * Escalate chat to supervisor
   */
  public async eskalasi(
    chatId: string,
    reason: string,
    escalatedBy: string,
    options: {
      priority?: ChatSession['priority'];
      assignTo?: string;
      notes?: string;
      notifyCustomer?: boolean;
    } = {}
  ): Promise<ChatResponse> {
    try {
      const chatSession = await this.getChatSession(chatId);
      if (!chatSession) {
        return {
          success: false,
          message: 'Sesi chat tidak ditemukan',
          error: 'CHAT_NOT_FOUND',
          timestamp: new Date()
        };
      }

      if (chatSession.status === 'escalated') {
        return {
          success: false,
          message: 'Chat sudah dalam status eskalasi',
          error: 'ALREADY_ESCALATED',
          timestamp: new Date()
        };
      }

      // Update chat status
      const updatedSession: Partial<ChatSession> = {
        status: 'escalated',
        priority: options.priority || 'high',
        assignedAdminId: options.assignTo,
        updatedAt: new Date()
      };

      if (options.assignTo) {
        const assignedAdmin = await this.getAdminData(options.assignTo);
        updatedSession.assignedAdminName = assignedAdmin?.name;
      }

      await this.updateChatSession(chatId, updatedSession);

      // Add escalation tag
      await this.addChatTags(chatId, ['escalated', `escalated_by_${escalatedBy}`]);

      // Create escalation log message
      const escalationMessage = await this.kirimPesan(
        chatId,
        'system',
        'system',
        `Chat telah dieskalasi. Alasan: ${reason}${options.notes ? `. Catatan: ${options.notes}` : ''}`,
        {
          messageType: 'system',
          priority: 'high',
          metadata: {
            escalation: true,
            reason,
            escalatedBy,
            escalatedAt: new Date().toISOString()
          }
        }
      );

      // Notify relevant parties
      const notifications = [];

      // Notify supervisors
      const supervisors = await this.getSupervisors();
      for (const supervisor of supervisors) {
        notifications.push(
          this.sendChatNotification({
            chatId,
            type: 'escalation',
            recipientId: supervisor.id,
            recipientType: 'supervisor',
            title: 'Chat Escalation',
            message: `Chat ${chatId} telah dieskalasi. Alasan: ${reason}`,
            priority: 'high',
            status: 'pending',
            channels: ['email', 'push', 'in_app']
          })
        );
      }

      // Notify assigned admin if specified
      if (options.assignTo) {
        notifications.push(
          this.sendChatNotification({
            chatId,
            type: 'assignment',
            recipientId: options.assignTo,
            recipientType: 'admin',
            title: 'Chat Assignment',
            message: `Anda telah ditugaskan untuk menangani chat yang dieskalasi: ${chatId}`,
            priority: 'high',
            status: 'pending',
            channels: ['email', 'push', 'in_app']
          })
        );
      }

      // Notify customer if requested
      if (options.notifyCustomer) {
        notifications.push(
          this.sendChatNotification({
            chatId,
            type: 'status_change',
            recipientId: chatSession.customerId,
            recipientType: 'customer',
            title: 'Status Chat Diperbarui',
            message: 'Chat Anda telah diteruskan ke supervisor untuk penanganan lebih lanjut.',
            priority: 'normal',
            status: 'pending',
            channels: ['email', 'sms']
          })
        );
      }

      await Promise.all(notifications);

      return {
        success: true,
        message: 'Chat berhasil dieskalasi',
        data: {
          chatId,
          newStatus: 'escalated',
          escalatedBy,
          reason,
          assignedTo: options.assignTo
        },
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error escalating chat:', error);
      return {
        success: false,
        message: 'Gagal melakukan eskalasi chat',
        error: 'ESCALATION_FAILED',
        timestamp: new Date()
      };
    }
  }

  /**
   * Check chat status
   */
  public async cekStatusChat(chatId: string): Promise<ChatResponse> {
    try {
      const chatSession = await this.getChatSession(chatId);
      if (!chatSession) {
        return {
          success: false,
          message: 'Sesi chat tidak ditemukan',
          error: 'CHAT_NOT_FOUND',
          timestamp: new Date()
        };
      }

      // Get recent messages
      const recentMessages = await this.getRecentMessages(chatId, 10);

      // Calculate metrics
      const metrics = await this.calculateChatMetrics(chatId);

      // Get admin info if assigned
      let assignedAdmin = null;
      if (chatSession.assignedAdminId) {
        assignedAdmin = await this.getAdminData(chatSession.assignedAdminId);
      }

      return {
        success: true,
        message: 'Status chat berhasil diambil',
        data: {
          session: chatSession,
          recentMessages,
          metrics,
          assignedAdmin
        },
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error checking chat status:', error);
      return {
        success: false,
        message: 'Gagal mengecek status chat',
        error: 'STATUS_CHECK_FAILED',
        timestamp: new Date()
      };
    }
  }

  /**
   * Update chat status
   */
  public async updateStatusChat(
    chatId: string,
    newStatus: ChatSession['status'],
    updatedBy: string,
    options: {
      reason?: string;
      notes?: string;
      notifyParties?: boolean;
      assignTo?: string;
    } = {}
  ): Promise<ChatResponse> {
    try {
      const chatSession = await this.getChatSession(chatId);
      if (!chatSession) {
        return {
          success: false,
          message: 'Sesi chat tidak ditemukan',
          error: 'CHAT_NOT_FOUND',
          timestamp: new Date()
        };
      }

      const oldStatus = chatSession.status;
      
      // Validate status transition
      const validTransitions = this.getValidStatusTransitions(oldStatus);
      if (!validTransitions.includes(newStatus)) {
        return {
          success: false,
          message: `Transisi status dari ${oldStatus} ke ${newStatus} tidak valid`,
          error: 'INVALID_STATUS_TRANSITION',
          timestamp: new Date()
        };
      }

      // Update chat session
      const updates: Partial<ChatSession> = {
        status: newStatus,
        updatedAt: new Date()
      };

      if (options.assignTo) {
        const assignedAdmin = await this.getAdminData(options.assignTo);
        updates.assignedAdminId = options.assignTo;
        updates.assignedAdminName = assignedAdmin?.name;
      }

      // Calculate resolution time if closing
      if (newStatus === 'closed' && oldStatus !== 'closed') {
        const resolutionTime = Math.floor((Date.now() - chatSession.createdAt.getTime()) / (1000 * 60));
        updates.resolutionTime = resolutionTime;
      }

      await this.updateChatSession(chatId, updates);

      // Create status change log message
      const statusMessage = await this.kirimPesan(
        chatId,
        updatedBy,
        'system',
        `Status chat diubah dari ${oldStatus} ke ${newStatus}${options.reason ? `. Alasan: ${options.reason}` : ''}${options.notes ? `. Catatan: ${options.notes}` : ''}`,
        {
          messageType: 'system',
          priority: 'normal',
          metadata: {
            statusChange: true,
            oldStatus,
            newStatus,
            updatedBy,
            reason: options.reason,
            notes: options.notes
          }
        }
      );

      // Send notifications if requested
      if (options.notifyParties) {
        const notifications = [];

        // Notify customer
        notifications.push(
          this.sendChatNotification({
            chatId,
            type: 'status_change',
            recipientId: chatSession.customerId,
            recipientType: 'customer',
            title: 'Status Chat Diperbarui',
            message: `Status chat Anda telah diubah menjadi: ${this.getStatusDisplayName(newStatus)}`,
            priority: 'normal',
            status: 'pending',
            channels: ['email', 'push']
          })
        );

        // Notify assigned admin if different from updater
        if (chatSession.assignedAdminId && chatSession.assignedAdminId !== updatedBy) {
          notifications.push(
            this.sendChatNotification({
              chatId,
              type: 'status_change',
              recipientId: chatSession.assignedAdminId,
              recipientType: 'admin',
              title: 'Status Chat Diperbarui',
              message: `Status chat ${chatId} telah diubah menjadi: ${newStatus}`,
              priority: 'normal',
              status: 'pending',
              channels: ['push', 'in_app']
            })
          );
        }

        await Promise.all(notifications);
      }

      return {
        success: true,
        message: 'Status chat berhasil diperbarui',
        data: {
          chatId,
          oldStatus,
          newStatus,
          updatedBy,
          updatedAt: new Date()
        },
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error updating chat status:', error);
      return {
        success: false,
        message: 'Gagal memperbarui status chat',
        error: 'UPDATE_FAILED',
        timestamp: new Date()
      };
    }
  }

  /**
   * Save chat history
   */
  public async simpanRiwayatChat(
    chatId: string,
    options: {
      includeSystemMessages?: boolean;
      includeAttachments?: boolean;
      format?: 'json' | 'text' | 'html';
      exportPath?: string;
    } = {}
  ): Promise<ChatResponse> {
    try {
      const chatSession = await this.getChatSession(chatId);
      if (!chatSession) {
        return {
          success: false,
          message: 'Sesi chat tidak ditemukan',
          error: 'CHAT_NOT_FOUND',
          timestamp: new Date()
        };
      }

      // Get all messages
      const messages = await this.getAllMessages(chatId, {
        includeSystem: options.includeSystemMessages ?? true,
        includeAttachments: options.includeAttachments ?? true
      });

      // Prepare chat history data
      const chatHistory = {
        session: chatSession,
        messages,
        exportedAt: new Date(),
        exportedBy: 'system',
        totalMessages: messages.length,
        dateRange: {
          start: chatSession.createdAt,
          end: chatSession.updatedAt
        }
      };

      // Format based on requested format
      let formattedHistory: string;
      const format = options.format || 'json';

      switch (format) {
        case 'json':
          formattedHistory = JSON.stringify(chatHistory, null, 2);
          break;
        
        case 'text':
          formattedHistory = this.formatChatHistoryAsText(chatHistory);
          break;
        
        case 'html':
          formattedHistory = this.formatChatHistoryAsHTML(chatHistory);
          break;
        
        default:
          formattedHistory = JSON.stringify(chatHistory, null, 2);
      }

      // Save to storage
      const fileName = `chat_history_${chatId}_${Date.now()}.${format}`;
      const filePath = options.exportPath || `/exports/chat_histories/${fileName}`;
      
      await this.saveToFile(filePath, formattedHistory);

      // Create archive record
      const archiveRecord = {
        chatId,
        fileName,
        filePath,
        format,
        fileSize: formattedHistory.length,
        messageCount: messages.length,
        createdAt: new Date()
      };

      await this.saveChatArchive(archiveRecord);

      return {
        success: true,
        message: 'Riwayat chat berhasil disimpan',
        data: {
          chatId,
          fileName,
          filePath,
          format,
          messageCount: messages.length,
          fileSize: formattedHistory.length
        },
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error saving chat history:', error);
      return {
        success: false,
        message: 'Gagal menyimpan riwayat chat',
        error: 'SAVE_FAILED',
        timestamp: new Date()
      };
    }
  }

  /**
   * Send new message notification
   */
  public async notifikasiPesanBaru(message: ChatMessage): Promise<ChatResponse> {
    try {
      const chatSession = await this.getChatSession(message.chatId);
      if (!chatSession) {
        return {
          success: false,
          message: 'Sesi chat tidak ditemukan',
          error: 'CHAT_NOT_FOUND',
          timestamp: new Date()
        };
      }

      const notifications = [];

      // Determine who should be notified
      if (message.senderType === 'customer') {
        // Customer sent message - notify admin
        if (chatSession.assignedAdminId) {
          notifications.push(
            this.sendChatNotification({
              chatId: message.chatId,
              messageId: message.messageId,
              type: 'new_message',
              recipientId: chatSession.assignedAdminId,
              recipientType: 'admin',
              title: `Pesan Baru dari ${chatSession.customerName}`,
              message: this.truncateMessage(message.content, 100),
              priority: message.priority,
              status: 'pending',
              channels: ['push', 'in_app', 'email']
            })
          );
        } else {
          // No admin assigned - notify available admins
          const availableAdmins = await this.getAvailableAdmins();
          for (const admin of availableAdmins.slice(0, 3)) { // Notify up to 3 admins
            notifications.push(
              this.sendChatNotification({
                chatId: message.chatId,
                messageId: message.messageId,
                type: 'new_message',
                recipientId: admin.id,
                recipientType: 'admin',
                title: `Pesan Baru dari ${chatSession.customerName}`,
                message: this.truncateMessage(message.content, 100),
                priority: message.priority,
                status: 'pending',
                channels: ['push', 'in_app']
              })
            );
          }
        }
      } else if (message.senderType === 'admin') {
        // Admin sent message - notify customer
        notifications.push(
          this.sendChatNotification({
            chatId: message.chatId,
            messageId: message.messageId,
            type: 'new_message',
            recipientId: chatSession.customerId,
            recipientType: 'customer',
            title: 'Balasan dari Mobilindo Showroom',
            message: this.truncateMessage(message.content, 100),
            priority: 'normal',
            channels: ['email', 'sms', 'push', 'whatsapp'],
            status: 'pending'
          })
        );
      }

      // Send all notifications
      const results = await Promise.allSettled(notifications);
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.length - successCount;

      return {
        success: successCount > 0,
        message: `${successCount} notifikasi berhasil dikirim${failureCount > 0 ? `, ${failureCount} gagal` : ''}`,
        data: {
          messageId: message.messageId,
          notificationsSent: successCount,
          notificationsFailed: failureCount
        },
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error sending new message notification:', error);
      return {
        success: false,
        message: 'Gagal mengirim notifikasi pesan baru',
        error: 'NOTIFICATION_FAILED',
        timestamp: new Date()
      };
    }
  }

  /**
   * Process message attachments
   */
  public async prosesAttachment(
    attachments: Omit<MessageAttachment, 'attachmentId' | 'uploadedAt' | 'uploadedBy' | 'scanStatus'>[],
    uploadedBy: string
  ): Promise<ChatResponse> {
    try {
      const processedAttachments: MessageAttachment[] = [];
      const errors: string[] = [];

      for (const attachment of attachments) {
        try {
          // Validate file
          const validation = this.validateAttachment(attachment);
          if (!validation.isValid) {
            errors.push(`${attachment.fileName}: ${validation.errors.join(', ')}`);
            continue;
          }

          // Create attachment record
          const processedAttachment: MessageAttachment = {
            attachmentId: this.generateAttachmentId(),
            fileName: attachment.fileName,
            fileType: attachment.fileType,
            fileSize: attachment.fileSize,
            mimeType: attachment.mimeType,
            url: attachment.url,
            thumbnailUrl: attachment.thumbnailUrl,
            uploadedAt: new Date(),
            uploadedBy,
            scanStatus: 'pending',
            metadata: attachment.metadata
          };

          // Scan for viruses/malware
          const scanResult = await this.scanAttachment(processedAttachment);
          processedAttachment.scanStatus = scanResult.status;

          if (scanResult.status === 'infected') {
            errors.push(`${attachment.fileName}: File terdeteksi mengandung malware`);
            continue;
          }

          // Generate thumbnail for images
          if (attachment.fileType.startsWith('image/') && !processedAttachment.thumbnailUrl) {
            processedAttachment.thumbnailUrl = await this.generateThumbnail(processedAttachment);
          }

          // Save attachment
          await this.saveAttachment(processedAttachment);
          processedAttachments.push(processedAttachment);

        } catch (attachmentError) {
          console.error(`Error processing attachment ${attachment.fileName}:`, attachmentError);
          errors.push(`${attachment.fileName}: Gagal memproses file`);
        }
      }

      if (processedAttachments.length === 0 && errors.length > 0) {
        return {
          success: false,
          message: `Gagal memproses semua attachment: ${errors.join('; ')}`,
          error: 'ATTACHMENT_PROCESSING_FAILED',
          timestamp: new Date()
        };
      }

      return {
        success: true,
        message: `${processedAttachments.length} attachment berhasil diproses${errors.length > 0 ? `, ${errors.length} gagal` : ''}`,
        data: processedAttachments,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Error processing attachments:', error);
      return {
        success: false,
        message: 'Gagal memproses attachment',
        error: 'PROCESSING_FAILED',
        timestamp: new Date()
      };
    }
  }

  // ==================== HELPER METHODS ====================

  private generateMessageId(): string {
    return `MSG-${Date.now()}-${String(++this.messageCounter).padStart(6, '0')}`;
  }

  private generateChatId(): string {
    return `CHAT-${Date.now()}-${String(++this.chatCounter).padStart(4, '0')}`;
  }

  private generateAttachmentId(): string {
    return `ATT-${Date.now()}-${String(++this.attachmentCounter).padStart(6, '0')}`;
  }

  private sanitizeContent(content: string): string {
    // Remove potentially harmful content
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  private detectLanguage(content: string): string {
    // Simple language detection - in real implementation, use proper language detection library
    const indonesianWords = ['dan', 'atau', 'dengan', 'untuk', 'dari', 'ke', 'di', 'pada', 'yang', 'adalah'];
    const englishWords = ['and', 'or', 'with', 'for', 'from', 'to', 'in', 'on', 'the', 'is'];
    
    const words = content.toLowerCase().split(/\s+/);
    const indonesianCount = words.filter(word => indonesianWords.includes(word)).length;
    const englishCount = words.filter(word => englishWords.includes(word)).length;
    
    return indonesianCount > englishCount ? 'id' : 'en';
  }

  private analyzeSentiment(content: string): 'positive' | 'neutral' | 'negative' {
    // Simple sentiment analysis - in real implementation, use proper sentiment analysis
    const positiveWords = ['bagus', 'baik', 'senang', 'puas', 'terima kasih', 'good', 'great', 'excellent', 'thank you'];
    const negativeWords = ['buruk', 'jelek', 'kecewa', 'marah', 'bad', 'terrible', 'awful', 'disappointed'];
    
    const words = content.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => positiveWords.some(pw => word.includes(pw))).length;
    const negativeCount = words.filter(word => negativeWords.some(nw => word.includes(nw))).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private calculateSpamScore(content: string): number {
    let score = 0;
    
    // Check for excessive caps
    const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
    if (capsRatio > 0.5) score += 0.3;
    
    // Check for excessive punctuation
    const punctuationRatio = (content.match(/[!?]{2,}/g) || []).length;
    if (punctuationRatio > 0) score += 0.2;
    
    // Check for repeated characters
    if (/(.)\1{3,}/.test(content)) score += 0.2;
    
    // Check for spam keywords
    const spamKeywords = ['promo', 'diskon', 'gratis', 'menang', 'hadiah'];
    const spamCount = spamKeywords.filter(keyword => content.toLowerCase().includes(keyword)).length;
    score += spamCount * 0.1;
    
    return Math.min(score, 1);
  }

  private calculateToxicity(content: string): number {
    // Simple toxicity detection - in real implementation, use proper toxicity detection
    const toxicWords = ['bodoh', 'tolol', 'goblok', 'stupid', 'idiot', 'damn'];
    const words = content.toLowerCase().split(/\s+/);
    const toxicCount = words.filter(word => toxicWords.some(tw => word.includes(tw))).length;
    
    return Math.min(toxicCount * 0.3, 1);
  }

  private getProhibitedWords(): string[] {
    return ['spam', 'scam', 'penipuan', 'illegal', 'drugs', 'weapon'];
  }

  private async getChatSession(chatId: string): Promise<ChatSession | null> {
    // Mock implementation - would fetch from database
    const mockSessions = this.getMockChatSessions();
    return mockSessions.find(session => session.chatId === chatId) || null;
  }

  private async saveMessage(message: ChatMessage): Promise<void> {
    // Mock save to database
    console.log(`Saving message: ${message.messageId}`);
  }

  private async updateChatLastMessage(chatId: string, message: ChatMessage): Promise<void> {
    // Mock update chat session
    console.log(`Updating chat ${chatId} last message`);
  }

  private async updateChatSession(chatId: string, updates: Partial<ChatSession>): Promise<void> {
    // Mock update chat session
    console.log(`Updating chat session ${chatId}:`, updates);
  }

  private async getAutoReplyRules(): Promise<AutoReplyRule[]> {
    // Mock auto-reply rules
    return [
      {
        ruleId: 'rule-001',
        name: 'Greeting Response',
        isActive: true,
        priority: 10,
        conditions: {
          keywords: ['halo', 'hai', 'hello', 'hi'],
          timeRange: { start: '08:00', end: '17:00' }
        },
        response: {
          type: 'text',
          content: 'Halo! Selamat datang di Mobilindo Showroom. Ada yang bisa kami bantu?'
        },
        usage: { totalUsed: 150, effectiveness: 0.8 },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }

  private matchesAutoReplyConditions(rule: AutoReplyRule, message: ChatMessage, session: ChatSession): boolean {
    // Check keywords
    if (rule.conditions.keywords) {
      const hasKeyword = rule.conditions.keywords.some(keyword => 
        message.content.toLowerCase().includes(keyword.toLowerCase())
      );
      if (!hasKeyword) return false;
    }

    // Check time range
    if (rule.conditions.timeRange) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      if (currentTime < rule.conditions.timeRange.start || currentTime > rule.conditions.timeRange.end) {
        return false;
      }
    }

    return true;
  }

  private async getTemplateContent(templateId: string, variables: Record<string, any>): Promise<string> {
    // Mock template processing
    const templates = {
      'welcome': 'Halo {{customerName}}, selamat datang di Mobilindo Showroom!'
    };
    
    let content = templates[templateId as keyof typeof templates] || 'Template tidak ditemukan';
    
    // Replace variables
    Object.entries(variables).forEach(([key, value]) => {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    
    return content;
  }

  private async updateAutoReplyUsage(ruleId: string): Promise<void> {
    // Mock update usage statistics
    console.log(`Updating auto-reply rule usage: ${ruleId}`);
  }

  private async transferChat(chatId: string, transferTo: string): Promise<void> {
    // Mock chat transfer
    console.log(`Transferring chat ${chatId} to ${transferTo}`);
  }

  private async checkEscalationRules(chatId: string, message: ChatMessage): Promise<void> {
    // Mock escalation rule checking
    console.log(`Checking escalation rules for chat ${chatId}`);
  }

  private async getAdminData(adminId: string): Promise<any> {
    // Mock admin data
    return {
      id: adminId,
      name: 'Admin User',
      email: 'admin@mobilindo.com',
      department: 'Customer Service'
    };
  }

  private async getSupervisors(): Promise<any[]> {
    // Mock supervisors data
    return [
      { id: 'supervisor-001', name: 'Supervisor 1', email: 'supervisor1@mobilindo.com' }
    ];
  }

  private async sendChatNotification(notification: Omit<ChatNotification, 'notificationId' | 'createdAt'>): Promise<void> {
    // Mock notification sending
    console.log(`Sending chat notification:`, notification);
  }

  private getValidStatusTransitions(currentStatus: ChatSession['status']): ChatSession['status'][] {
    const transitions: Record<ChatSession['status'], ChatSession['status'][]> = {
      'active': ['waiting', 'closed', 'escalated', 'transferred'],
      'waiting': ['active', 'closed', 'escalated'],
      'closed': ['active'], // Can reopen
      'escalated': ['active', 'closed', 'transferred'],
      'transferred': ['active', 'closed', 'escalated']
    };
    
    return transitions[currentStatus] || [];
  }

  private getStatusDisplayName(status: ChatSession['status']): string {
    const displayNames = {
      'active': 'Aktif',
      'waiting': 'Menunggu',
      'closed': 'Ditutup',
      'escalated': 'Dieskalasi',
      'transferred': 'Dialihkan'
    };
    
    return displayNames[status] || status;
  }

  private async getRecentMessages(chatId: string, limit: number): Promise<ChatMessage[]> {
    // Mock recent messages
    return [];
  }

  private async calculateChatMetrics(chatId: string): Promise<any> {
    // Mock chat metrics
    return {
      totalMessages: 15,
      responseTime: 5, // minutes
      customerSatisfaction: 4.5
    };
  }

  private async getAllMessages(chatId: string, options: any): Promise<ChatMessage[]> {
    // Mock all messages
    return [];
  }

  private formatChatHistoryAsText(chatHistory: any): string {
    // Mock text formatting
    return `Chat History for ${chatHistory.session.chatId}\n\nExported: ${chatHistory.exportedAt}\n\n...`;
  }

  private formatChatHistoryAsHTML(chatHistory: any): string {
    // Mock HTML formatting
    return `<html><head><title>Chat History</title></head><body><h1>Chat History for ${chatHistory.session.chatId}</h1>...</body></html>`;
  }

  private async saveToFile(filePath: string, content: string): Promise<void> {
    // Mock file saving
    console.log(`Saving to file: ${filePath}`);
  }

  private async saveChatArchive(record: any): Promise<void> {
    // Mock archive saving
    console.log(`Saving chat archive:`, record);
  }

  private truncateMessage(message: string, maxLength: number): string {
    return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
  }

  private async getAvailableAdmins(): Promise<any[]> {
    // Mock available admins
    return [
      { id: 'admin-001', name: 'Admin 1' },
      { id: 'admin-002', name: 'Admin 2' }
    ];
  }

  private validateAttachment(attachment: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check file size (max 10MB)
    if (attachment.fileSize > 10 * 1024 * 1024) {
      errors.push('File terlalu besar (maksimal 10MB)');
    }
    
    // Check file type
    const allowedTypes = ['image/', 'application/pdf', 'text/', 'application/msword'];
    if (!allowedTypes.some(type => attachment.mimeType.startsWith(type))) {
      errors.push('Tipe file tidak diizinkan');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async scanAttachment(attachment: MessageAttachment): Promise<{ status: MessageAttachment['scanStatus'] }> {
    // Mock virus scanning
    await new Promise(resolve => setTimeout(resolve, 500));
    return { status: 'clean' };
  }

  private async generateThumbnail(attachment: MessageAttachment): Promise<string> {
    // Mock thumbnail generation
    return `${attachment.url}_thumb`;
  }

  private async saveAttachment(attachment: MessageAttachment): Promise<void> {
    // Mock attachment saving
    console.log(`Saving attachment: ${attachment.attachmentId}`);
  }

  private loadCounters(): void {
    // In real implementation, load from persistent storage
    this.messageCounter = 10000;
    this.chatCounter = 1000;
    this.attachmentCounter = 5000;
  }

  private initializeAutoReplyRules(): void {
    // Initialize auto-reply rules
    console.log('Auto-reply rules initialized');
  }

  private initializeEscalationRules(): void {
    // Initialize escalation rules
    console.log('Escalation rules initialized');
  }

  private addChatTags(chatId: string, tags: string[]): Promise<void> {
    // Mock add tags
    console.log(`Adding tags to chat ${chatId}:`, tags);
    return Promise.resolve();
  }

  private getMockChatSessions(): ChatSession[] {
    return [
      {
        chatId: 'CHAT-1234567890-1001',
        customerId: 'CUST-001',
        customerName: 'John Doe',
        customerEmail: 'john.doe@example.com',
        customerPhone: '+62812345678',
        assignedAdminId: 'admin-001',
        assignedAdminName: 'Admin User',
        status: 'active',
        priority: 'normal',
        category: 'inquiry',
        tags: ['new_customer'],
        lastMessageAt: new Date(),
        lastMessagePreview: 'Halo, saya ingin bertanya tentang mobil...',
        unreadCount: 2,
        responseTime: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
}

// Export singleton instance
export default LayananChat.getInstance();