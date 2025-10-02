/**
 * EntitasOperasional - Kelas untuk mengelola operasional harian showroom
 * Menangani tugas operasional, tracking progress, dan manajemen workflow
 */

export interface IEntitasOperasional {
  idOperasional: string;
  idTransaksi: string;
  idTestDrive: string;
  idUserPenanggungJawab: string;
  tipeTugas: string;
  deskripsiTugas: string;
  statusTugas: string;
  prioritas: string;
  tanggalDibuat: Date;
  tanggalJatuhTempo: Date;
  tanggalSelesai: Date;
  catatan: string;
  updatedAt: Date;
}

export interface IOperationalMetrics {
  totalTugas: number;
  tugasSelesai: number;
  tugasPending: number;
  tugasOverdue: number;
  efisiensiRate: number;
  averageCompletionTime: number;
}

export interface ITaskAssignment {
  idUser: string;
  namaUser: string;
  jumlahTugas: number;
  workload: string;
  availability: string;
}

export class EntitasOperasional implements IEntitasOperasional {
  // Attributes
  public idOperasional: string;
  public idTransaksi: string;
  public idTestDrive: string;
  public idUserPenanggungJawab: string;
  public tipeTugas: string;
  public deskripsiTugas: string;
  public statusTugas: string;
  public prioritas: string;
  public tanggalDibuat: Date;
  public tanggalJatuhTempo: Date;
  public tanggalSelesai: Date;
  public catatan: string;
  public updatedAt: Date;

  constructor(data: Partial<IEntitasOperasional> = {}) {
    this.idOperasional = data.idOperasional || this.generateId();
    this.idTransaksi = data.idTransaksi || '';
    this.idTestDrive = data.idTestDrive || '';
    this.idUserPenanggungJawab = data.idUserPenanggungJawab || '';
    this.tipeTugas = data.tipeTugas || '';
    this.deskripsiTugas = data.deskripsiTugas || '';
    this.statusTugas = data.statusTugas || 'PENDING';
    this.prioritas = data.prioritas || 'MEDIUM';
    this.tanggalDibuat = data.tanggalDibuat || new Date();
    this.tanggalJatuhTempo = data.tanggalJatuhTempo || new Date(Date.now() + 86400000); // +1 day
    this.tanggalSelesai = data.tanggalSelesai || new Date();
    this.catatan = data.catatan || '';
    this.updatedAt = data.updatedAt || new Date();
  }

  // Main Method
  /**
   * Mengambil data operasional berdasarkan filter dan kriteria
   * @returns Promise<IEntitasOperasional[]> - Array data operasional
   */
  public async ambilDataOperasional(): Promise<IEntitasOperasional[]> {
    try {
      console.log('[EntitasOperasional] Mengambil data operasional...');
      
      await this.simulateDelay(500);
      
      // Simulasi pengambilan data operasional
      const dataOperasional = await this.fetchOperationalData();
      
      // Filter dan sort data
      const filteredData = await this.filterAndSortData(dataOperasional);
      
      // Analisis performa operasional
      await this.analyzeOperationalPerformance(filteredData);
      
      // Update metrics
      await this.updateOperationalMetrics(filteredData);
      
      // Generate insights
      await this.generateOperationalInsights(filteredData);
      
      // Log aktivitas
      await this.logOperationalActivity('DATA_FETCH', `Mengambil ${filteredData.length} data operasional`);
      
      // Cache data untuk performa
      await this.cacheOperationalData(filteredData);
      
      console.log(`[EntitasOperasional] Berhasil mengambil ${filteredData.length} data operasional`);
      return filteredData;
      
    } catch (error) {
      console.error('[EntitasOperasional] Error mengambil data operasional:', error);
      await this.handleOperationalError(error as Error);
      throw error;
    }
  }

  // Helper Methods
  private generateId(): string {
    return `OPS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchOperationalData(): Promise<IEntitasOperasional[]> {
    try {
      console.log('[EntitasOperasional] Fetching operational data from database...');
      
      // Simulasi data operasional
      const operationalData: IEntitasOperasional[] = [];
      const taskTypes = ['DELIVERY', 'INSPECTION', 'DOCUMENTATION', 'CUSTOMER_SERVICE', 'MAINTENANCE', 'FOLLOW_UP'];
      const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'OVERDUE'];
      const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
      
      // Generate 20-50 sample data
      const dataCount = Math.floor(Math.random() * 30) + 20;
      
      for (let i = 0; i < dataCount; i++) {
        const createdDate = new Date(Date.now() - Math.random() * 2592000000); // dalam 30 hari terakhir
        const dueDate = new Date(createdDate.getTime() + Math.random() * 604800000); // +7 hari
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const operationalItem: IEntitasOperasional = {
          idOperasional: this.generateId(),
          idTransaksi: `TXN-${Math.random().toString(36).substr(2, 9)}`,
          idTestDrive: Math.random() > 0.7 ? `TD-${Math.random().toString(36).substr(2, 9)}` : '',
          idUserPenanggungJawab: `USER-${Math.floor(Math.random() * 20) + 1}`,
          tipeTugas: taskTypes[Math.floor(Math.random() * taskTypes.length)],
          deskripsiTugas: this.generateTaskDescription(),
          statusTugas: status,
          prioritas: priorities[Math.floor(Math.random() * priorities.length)],
          tanggalDibuat: createdDate,
          tanggalJatuhTempo: dueDate,
          tanggalSelesai: status === 'COMPLETED' ? new Date(dueDate.getTime() - Math.random() * 86400000) : new Date(),
          catatan: this.generateTaskNotes(),
          updatedAt: new Date()
        };
        
        operationalData.push(operationalItem);
      }
      
      await this.simulateDelay(300);
      return operationalData;
      
    } catch (error) {
      console.error('[EntitasOperasional] Error fetching data:', error);
      throw error;
    }
  }

  private generateTaskDescription(): string {
    const descriptions = [
      'Pengiriman dokumen kontrak ke customer',
      'Inspeksi kendaraan sebelum delivery',
      'Follow up pembayaran dengan customer',
      'Koordinasi jadwal test drive',
      'Pemeriksaan kelengkapan dokumen STNK',
      'Maintenance rutin kendaraan display',
      'Penanganan komplain customer',
      'Persiapan kendaraan untuk test drive',
      'Update status transaksi di sistem',
      'Koordinasi dengan pihak leasing'
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private generateTaskNotes(): string {
    const notes = [
      'Sudah dikonfirmasi dengan customer',
      'Menunggu konfirmasi dari pihak terkait',
      'Perlu follow up lebih lanjut',
      'Dokumen sudah lengkap',
      'Ada kendala teknis yang perlu diselesaikan',
      'Customer meminta reschedule',
      'Proses berjalan sesuai rencana',
      'Memerlukan approval dari supervisor'
    ];
    
    return Math.random() > 0.3 ? notes[Math.floor(Math.random() * notes.length)] : '';
  }

  private async filterAndSortData(data: IEntitasOperasional[]): Promise<IEntitasOperasional[]> {
    try {
      console.log('[EntitasOperasional] Filtering and sorting data...');
      
      // Filter data berdasarkan kriteria tertentu
      let filteredData = data.filter(item => {
        // Filter hanya data 30 hari terakhir
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return item.tanggalDibuat >= thirtyDaysAgo;
      });
      
      // Sort berdasarkan prioritas dan tanggal jatuh tempo
      filteredData.sort((a, b) => {
        const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        const aPriority = priorityOrder[a.prioritas as keyof typeof priorityOrder] || 1;
        const bPriority = priorityOrder[b.prioritas as keyof typeof priorityOrder] || 1;
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Prioritas tinggi di atas
        }
        
        // Jika prioritas sama, sort berdasarkan tanggal jatuh tempo
        return a.tanggalJatuhTempo.getTime() - b.tanggalJatuhTempo.getTime();
      });
      
      await this.simulateDelay(150);
      return filteredData;
      
    } catch (error) {
      console.error('[EntitasOperasional] Error filtering data:', error);
      throw error;
    }
  }

  private async analyzeOperationalPerformance(data: IEntitasOperasional[]): Promise<IOperationalMetrics> {
    try {
      console.log('[EntitasOperasional] Analyzing operational performance...');
      
      const totalTugas = data.length;
      const tugasSelesai = data.filter(item => item.statusTugas === 'COMPLETED').length;
      const tugasPending = data.filter(item => ['PENDING', 'IN_PROGRESS'].includes(item.statusTugas)).length;
      
      // Hitung tugas overdue
      const now = new Date();
      const tugasOverdue = data.filter(item => 
        item.statusTugas !== 'COMPLETED' && item.tanggalJatuhTempo < now
      ).length;
      
      const efisiensiRate = totalTugas > 0 ? (tugasSelesai / totalTugas) * 100 : 0;
      
      // Hitung rata-rata waktu penyelesaian
      const completedTasks = data.filter(item => item.statusTugas === 'COMPLETED');
      let averageCompletionTime = 0;
      
      if (completedTasks.length > 0) {
        const totalCompletionTime = completedTasks.reduce((sum, task) => {
          const completionTime = task.tanggalSelesai.getTime() - task.tanggalDibuat.getTime();
          return sum + completionTime;
        }, 0);
        
        averageCompletionTime = totalCompletionTime / completedTasks.length / (1000 * 60 * 60); // dalam jam
      }
      
      const metrics: IOperationalMetrics = {
        totalTugas,
        tugasSelesai,
        tugasPending,
        tugasOverdue,
        efisiensiRate,
        averageCompletionTime
      };
      
      console.log('[EntitasOperasional] Performance metrics:', metrics);
      await this.simulateDelay(200);
      return metrics;
      
    } catch (error) {
      console.error('[EntitasOperasional] Error analyzing performance:', error);
      throw error;
    }
  }

  private async updateOperationalMetrics(data: IEntitasOperasional[]): Promise<void> {
    try {
      const metrics = await this.analyzeOperationalPerformance(data);
      
      // Update dashboard metrics
      const dashboardUpdate = {
        timestamp: new Date(),
        metrics,
        trends: await this.calculateTrends(data),
        alerts: await this.generateAlerts(metrics)
      };
      
      console.log('[EntitasOperasional] Dashboard metrics updated:', dashboardUpdate);
      await this.simulateDelay(150);
    } catch (error) {
      console.error('[EntitasOperasional] Error updating metrics:', error);
    }
  }

  private async calculateTrends(data: IEntitasOperasional[]): Promise<any> {
    try {
      // Analisis tren 7 hari terakhir vs 7 hari sebelumnya
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      
      const recentTasks = data.filter(item => item.tanggalDibuat >= sevenDaysAgo);
      const previousTasks = data.filter(item => 
        item.tanggalDibuat >= fourteenDaysAgo && item.tanggalDibuat < sevenDaysAgo
      );
      
      const recentCompleted = recentTasks.filter(item => item.statusTugas === 'COMPLETED').length;
      const previousCompleted = previousTasks.filter(item => item.statusTugas === 'COMPLETED').length;
      
      const completionTrend = previousCompleted > 0 
        ? ((recentCompleted - previousCompleted) / previousCompleted) * 100 
        : 0;
      
      return {
        completionTrend,
        taskVolumeTrend: ((recentTasks.length - previousTasks.length) / Math.max(previousTasks.length, 1)) * 100,
        period: '7 days'
      };
    } catch (error) {
      console.error('[EntitasOperasional] Error calculating trends:', error);
      return {};
    }
  }

  private async generateAlerts(metrics: IOperationalMetrics): Promise<string[]> {
    try {
      const alerts: string[] = [];
      
      if (metrics.tugasOverdue > 0) {
        alerts.push(`${metrics.tugasOverdue} tugas melewati deadline`);
      }
      
      if (metrics.efisiensiRate < 70) {
        alerts.push(`Efisiensi operasional rendah: ${metrics.efisiensiRate.toFixed(1)}%`);
      }
      
      if (metrics.averageCompletionTime > 48) {
        alerts.push(`Rata-rata waktu penyelesaian tinggi: ${metrics.averageCompletionTime.toFixed(1)} jam`);
      }
      
      const urgentTasks = await this.countUrgentTasks();
      if (urgentTasks > 5) {
        alerts.push(`${urgentTasks} tugas dengan prioritas urgent`);
      }
      
      return alerts;
    } catch (error) {
      console.error('[EntitasOperasional] Error generating alerts:', error);
      return [];
    }
  }

  private async countUrgentTasks(): Promise<number> {
    // Simulasi penghitungan tugas urgent
    return Math.floor(Math.random() * 10);
  }

  private async generateOperationalInsights(data: IEntitasOperasional[]): Promise<void> {
    try {
      console.log('[EntitasOperasional] Generating operational insights...');
      
      // Analisis distribusi tugas per tipe
      const taskDistribution = this.analyzeTaskDistribution(data);
      
      // Analisis beban kerja per user
      const workloadAnalysis = this.analyzeWorkloadDistribution(data);
      
      // Analisis bottleneck
      const bottleneckAnalysis = this.identifyBottlenecks(data);
      
      // Rekomendasi optimasi
      const optimizationRecommendations = this.generateOptimizationRecommendations(data);
      
      const insights = {
        taskDistribution,
        workloadAnalysis,
        bottleneckAnalysis,
        optimizationRecommendations,
        generatedAt: new Date()
      };
      
      console.log('[EntitasOperasional] Operational insights generated:', insights);
      await this.simulateDelay(200);
    } catch (error) {
      console.error('[EntitasOperasional] Error generating insights:', error);
    }
  }

  private analyzeTaskDistribution(data: IEntitasOperasional[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    data.forEach(item => {
      distribution[item.tipeTugas] = (distribution[item.tipeTugas] || 0) + 1;
    });
    
    return distribution;
  }

  private analyzeWorkloadDistribution(data: IEntitasOperasional[]): ITaskAssignment[] {
    const userWorkload: Record<string, number> = {};
    
    data.forEach(item => {
      if (item.statusTugas !== 'COMPLETED') {
        userWorkload[item.idUserPenanggungJawab] = (userWorkload[item.idUserPenanggungJawab] || 0) + 1;
      }
    });
    
    return Object.entries(userWorkload).map(([userId, taskCount]) => ({
      idUser: userId,
      namaUser: `User ${userId}`,
      jumlahTugas: taskCount,
      workload: taskCount > 10 ? 'HIGH' : taskCount > 5 ? 'MEDIUM' : 'LOW',
      availability: taskCount > 15 ? 'OVERLOADED' : taskCount > 10 ? 'BUSY' : 'AVAILABLE'
    }));
  }

  private identifyBottlenecks(data: IEntitasOperasional[]): string[] {
    const bottlenecks: string[] = [];
    
    // Analisis tugas yang stuck di status tertentu
    const inProgressTasks = data.filter(item => item.statusTugas === 'IN_PROGRESS');
    const avgInProgressTime = this.calculateAverageInProgressTime(inProgressTasks);
    
    if (avgInProgressTime > 72) { // lebih dari 3 hari
      bottlenecks.push('Tugas terlalu lama di status IN_PROGRESS');
    }
    
    // Analisis tipe tugas yang sering overdue
    const overdueTasks = data.filter(item => 
      item.statusTugas !== 'COMPLETED' && item.tanggalJatuhTempo < new Date()
    );
    
    if (overdueTasks.length > data.length * 0.2) {
      bottlenecks.push('Tingkat overdue tinggi (>20%)');
    }
    
    return bottlenecks;
  }

  private calculateAverageInProgressTime(tasks: IEntitasOperasional[]): number {
    if (tasks.length === 0) return 0;
    
    const now = new Date();
    const totalTime = tasks.reduce((sum, task) => {
      return sum + (now.getTime() - task.tanggalDibuat.getTime());
    }, 0);
    
    return totalTime / tasks.length / (1000 * 60 * 60); // dalam jam
  }

  private generateOptimizationRecommendations(data: IEntitasOperasional[]): string[] {
    const recommendations: string[] = [];
    
    const metrics = {
      totalTasks: data.length,
      completedTasks: data.filter(item => item.statusTugas === 'COMPLETED').length,
      overdueTasks: data.filter(item => 
        item.statusTugas !== 'COMPLETED' && item.tanggalJatuhTempo < new Date()
      ).length
    };
    
    const completionRate = metrics.completedTasks / metrics.totalTasks;
    
    if (completionRate < 0.7) {
      recommendations.push('Tingkatkan alokasi resource untuk meningkatkan completion rate');
    }
    
    if (metrics.overdueTasks > 0) {
      recommendations.push('Implementasi sistem reminder otomatis untuk deadline');
    }
    
    const urgentTasks = data.filter(item => item.prioritas === 'URGENT').length;
    if (urgentTasks > data.length * 0.3) {
      recommendations.push('Review sistem prioritas tugas untuk mengurangi urgent tasks');
    }
    
    return recommendations;
  }

  private async logOperationalActivity(action: string, description: string): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date(),
        action,
        description,
        idOperasional: this.idOperasional,
        component: 'EntitasOperasional'
      };

      console.log('[EntitasOperasional] Logging activity:', logEntry);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasOperasional] Error logging activity:', error);
    }
  }

  private async cacheOperationalData(data: IEntitasOperasional[]): Promise<void> {
    try {
      const cacheKey = `operational_data_${new Date().toISOString().split('T')[0]}`;
      const cacheData = {
        data,
        cachedAt: new Date(),
        expiresAt: new Date(Date.now() + 1800000) // 30 minutes cache
      };

      console.log(`[EntitasOperasional] Caching data with key: ${cacheKey}`);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasOperasional] Error caching data:', error);
    }
  }

  private async handleOperationalError(error: Error): Promise<void> {
    try {
      const errorLog = {
        timestamp: new Date(),
        error: error.message,
        idOperasional: this.idOperasional,
        action: 'OPERATIONAL_DATA_ERROR'
      };

      console.error('[EntitasOperasional] Handling operational error:', errorLog);
      
      // Kirim alert ke admin
      await this.sendErrorAlert(error);
      
      await this.simulateDelay(100);
    } catch (handlingError) {
      console.error('[EntitasOperasional] Error in error handling:', handlingError);
    }
  }

  private async sendErrorAlert(error: Error): Promise<void> {
    try {
      const alertData = {
        type: 'OPERATIONAL_ERROR',
        message: error.message,
        idOperasional: this.idOperasional,
        timestamp: new Date(),
        severity: 'HIGH'
      };

      console.log('[EntitasOperasional] Sending error alert:', alertData);
      await this.simulateDelay(100);
    } catch (error) {
      console.error('[EntitasOperasional] Error sending alert:', error);
    }
  }

  // Utility Methods
  public isOverdue(): boolean {
    return this.statusTugas !== 'COMPLETED' && this.tanggalJatuhTempo < new Date();
  }

  public getDaysUntilDue(): number {
    const now = new Date();
    const timeDiff = this.tanggalJatuhTempo.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  }

  public getPriorityLevel(): number {
    const priorityMap: Record<string, number> = {
      'LOW': 1,
      'MEDIUM': 2,
      'HIGH': 3,
      'URGENT': 4
    };
    return priorityMap[this.prioritas] || 1;
  }

  public getTaskAge(): number {
    const now = new Date();
    const ageDiff = now.getTime() - this.tanggalDibuat.getTime();
    return Math.floor(ageDiff / (1000 * 60 * 60 * 24)); // dalam hari
  }

  public updateStatus(newStatus: string, notes?: string): void {
    this.statusTugas = newStatus;
    this.updatedAt = new Date();
    
    if (newStatus === 'COMPLETED') {
      this.tanggalSelesai = new Date();
    }
    
    if (notes) {
      this.catatan = notes;
    }
  }

  public toJSON(): IEntitasOperasional {
    return {
      idOperasional: this.idOperasional,
      idTransaksi: this.idTransaksi,
      idTestDrive: this.idTestDrive,
      idUserPenanggungJawab: this.idUserPenanggungJawab,
      tipeTugas: this.tipeTugas,
      deskripsiTugas: this.deskripsiTugas,
      statusTugas: this.statusTugas,
      prioritas: this.prioritas,
      tanggalDibuat: this.tanggalDibuat,
      tanggalJatuhTempo: this.tanggalJatuhTempo,
      tanggalSelesai: this.tanggalSelesai,
      catatan: this.catatan,
      updatedAt: this.updatedAt
    };
  }
}

export default EntitasOperasional;