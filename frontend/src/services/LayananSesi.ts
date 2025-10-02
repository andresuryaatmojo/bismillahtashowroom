// LayananSesi.ts - Session management service for Mobilindo Showroom

export interface TokenPayload {
  userId: string;
  namaPengguna: string;
  peran: 'admin' | 'manager' | 'staff' | 'customer' | 'penjual' | 'pembeli';
  email: string;
  iat: number;
  exp: number;
  sessionId: string;
}

export interface SessionData {
  token: string;
  refreshToken: string;
  userId: string;
  namaPengguna: string;
  peran: string;
  email: string;
  loginTime: Date;
  lastActivity: Date;
  expiresAt: Date;
  sessionId: string;
  deviceInfo?: string;
  ipAddress?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  sessionData?: SessionData;
  errors?: string[];
}

export interface LogoutResponse {
  success: boolean;
  message: string;
  errors?: string[];
}

export class LayananSesi {
  private static instance: LayananSesi;
  private currentSession: SessionData | null = null;
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private readonly SESSION_STORAGE_KEY = 'mobilindo_session';
  private readonly REFRESH_TOKEN_KEY = 'mobilindo_refresh_token';
  private readonly SESSION_CHECK_INTERVAL = 60000; // 1 minute
  private readonly TOKEN_REFRESH_THRESHOLD = 300000; // 5 minutes before expiry

  public static getInstance(): LayananSesi {
    if (!LayananSesi.instance) {
      LayananSesi.instance = new LayananSesi();
    }
    return LayananSesi.instance;
  }

  constructor() {
    // Initialize session from storage on startup
    this.initializeFromStorage();
    this.startSessionMonitoring();
  }

  // Method: buatTokenSesi
  public async buatTokenSesi(namaPengguna: string, peran: 'admin' | 'manager' | 'staff' | 'customer' | 'penjual' | 'pembeli'): Promise<LoginResponse> {
    try {
      // Validate input parameters
      if (!namaPengguna || namaPengguna.trim() === '') {
        return {
          success: false,
          message: 'Nama pengguna wajib diisi',
          errors: ['Nama pengguna tidak valid']
        };
      }

      const validRoles = ['admin', 'manager', 'staff', 'customer', 'penjual', 'pembeli'];
      if (!validRoles.includes(peran)) {
        return {
          success: false,
          message: 'Peran pengguna tidak valid',
          errors: ['Peran harus salah satu dari: ' + validRoles.join(', ')]
        };
      }

      // Generate session ID
      const sessionId = this.generateSessionId();
      
      // Get device and IP info
      const deviceInfo = this.getDeviceInfo();
      const ipAddress = await this.getClientIP();

      // Create token payload
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = 24 * 60 * 60; // 24 hours
      const refreshExpiresIn = 7 * 24 * 60 * 60; // 7 days

      const tokenPayload: TokenPayload = {
        userId: this.generateUserId(namaPengguna),
        namaPengguna: namaPengguna.trim(),
        peran,
        email: this.generateEmail(namaPengguna), // In real app, this would come from user data
        iat: now,
        exp: now + expiresIn,
        sessionId
      };

      // Generate tokens (in real app, this would be done by backend)
      const token = this.generateJWT(tokenPayload);
      const refreshToken = this.generateRefreshToken(sessionId, now + refreshExpiresIn);

      // Create session data
      const sessionData: SessionData = {
        token,
        refreshToken,
        userId: tokenPayload.userId,
        namaPengguna: tokenPayload.namaPengguna,
        peran: tokenPayload.peran,
        email: tokenPayload.email,
        loginTime: new Date(),
        lastActivity: new Date(),
        expiresAt: new Date((now + expiresIn) * 1000),
        sessionId,
        deviceInfo,
        ipAddress
      };

      // Store session
      this.currentSession = sessionData;
      this.saveSessionToStorage(sessionData);

      // Log session creation
      this.logSessionActivity('SESSION_CREATED', {
        userId: tokenPayload.userId,
        namaPengguna: tokenPayload.namaPengguna,
        peran: tokenPayload.peran,
        sessionId,
        deviceInfo,
        ipAddress
      });

      return {
        success: true,
        message: 'Sesi berhasil dibuat',
        sessionData
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.logSessionActivity('SESSION_CREATE_ERROR', {
        namaPengguna,
        peran,
        error: errorMessage
      });

      return {
        success: false,
        message: 'Gagal membuat sesi',
        errors: [`Error: ${errorMessage}`]
      };
    }
  }

  // Method: prosesLogout
  public async prosesLogout(): Promise<LogoutResponse> {
    try {
      if (!this.currentSession) {
        return {
          success: false,
          message: 'Tidak ada sesi aktif untuk di-logout',
          errors: ['Sesi tidak ditemukan']
        };
      }

      const sessionInfo = {
        userId: this.currentSession.userId,
        namaPengguna: this.currentSession.namaPengguna,
        sessionId: this.currentSession.sessionId,
        loginDuration: Date.now() - this.currentSession.loginTime.getTime()
      };

      // Invalidate token on server (in real app)
      await this.invalidateTokenOnServer(this.currentSession.token, this.currentSession.sessionId);

      // Clear current session
      const wasSuccessful = await this.hapusSesi();

      if (wasSuccessful) {
        // Log successful logout
        this.logSessionActivity('LOGOUT_SUCCESS', sessionInfo);

        return {
          success: true,
          message: 'Logout berhasil'
        };
      } else {
        return {
          success: false,
          message: 'Logout gagal',
          errors: ['Gagal menghapus sesi']
        };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.logSessionActivity('LOGOUT_ERROR', {
        sessionId: this.currentSession?.sessionId,
        error: errorMessage
      });

      return {
        success: false,
        message: 'Gagal melakukan logout',
        errors: [`Error: ${errorMessage}`]
      };
    }
  }

  // Method: hapusSesi
  public async hapusSesi(): Promise<boolean> {
    try {
      // Log session deletion attempt
      if (this.currentSession) {
        this.logSessionActivity('SESSION_DELETE_ATTEMPT', {
          userId: this.currentSession.userId,
          sessionId: this.currentSession.sessionId
        });
      }

      // Stop session monitoring
      if (this.sessionCheckInterval) {
        clearInterval(this.sessionCheckInterval);
        this.sessionCheckInterval = null;
      }

      // Clear session from memory
      this.currentSession = null;

      // Clear session from storage
      this.clearSessionFromStorage();

      // Clear any cached user data
      this.clearUserCache();

      // Notify other tabs/windows about logout
      this.broadcastLogout();

      // Log successful session deletion
      this.logSessionActivity('SESSION_DELETED', {
        timestamp: new Date().toISOString()
      });

      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.logSessionActivity('SESSION_DELETE_ERROR', {
        error: errorMessage
      });

      return false;
    }
  }

  // Additional helper methods

  // Get current session
  public getCurrentSession(): SessionData | null {
    return this.currentSession;
  }

  // Check if user is logged in
  public isLoggedIn(): boolean {
    return this.currentSession !== null && this.isTokenValid(this.currentSession.token);
  }

  // Get current user info
  public getCurrentUser(): Partial<TokenPayload> | null {
    if (!this.currentSession) return null;

    return {
      userId: this.currentSession.userId,
      namaPengguna: this.currentSession.namaPengguna,
      peran: this.currentSession.peran as any,
      email: this.currentSession.email
    };
  }

  // Refresh token if needed
  public async refreshTokenIfNeeded(): Promise<boolean> {
    if (!this.currentSession) return false;

    const timeUntilExpiry = this.currentSession.expiresAt.getTime() - Date.now();
    
    if (timeUntilExpiry <= this.TOKEN_REFRESH_THRESHOLD) {
      return await this.refreshToken();
    }

    return true;
  }

  // Update last activity
  public updateLastActivity(): void {
    if (this.currentSession) {
      this.currentSession.lastActivity = new Date();
      this.saveSessionToStorage(this.currentSession);
    }
  }

  // Private helper methods

  private initializeFromStorage(): void {
    try {
      const sessionData = localStorage.getItem(this.SESSION_STORAGE_KEY);
      if (sessionData) {
        const parsed: SessionData = JSON.parse(sessionData);
        
        // Convert date strings back to Date objects
        parsed.loginTime = new Date(parsed.loginTime);
        parsed.lastActivity = new Date(parsed.lastActivity);
        parsed.expiresAt = new Date(parsed.expiresAt);

        // Check if session is still valid
        if (this.isTokenValid(parsed.token) && parsed.expiresAt > new Date()) {
          this.currentSession = parsed;
          this.logSessionActivity('SESSION_RESTORED', {
            userId: parsed.userId,
            sessionId: parsed.sessionId
          });
        } else {
          // Session expired, clear it
          this.clearSessionFromStorage();
        }
      }
    } catch (error) {
      // Invalid session data, clear it
      this.clearSessionFromStorage();
    }
  }

  private startSessionMonitoring(): void {
    this.sessionCheckInterval = setInterval(() => {
      if (this.currentSession) {
        // Check if token is about to expire
        this.refreshTokenIfNeeded();
        
        // Update activity
        this.updateLastActivity();
      }
    }, this.SESSION_CHECK_INTERVAL);
  }

  private saveSessionToStorage(sessionData: SessionData): void {
    try {
      localStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      localStorage.setItem(this.REFRESH_TOKEN_KEY, sessionData.refreshToken);
    } catch (error) {
      console.error('Failed to save session to storage:', error);
    }
  }

  private clearSessionFromStorage(): void {
    try {
      localStorage.removeItem(this.SESSION_STORAGE_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      sessionStorage.clear(); // Clear any session-specific data
    } catch (error) {
      console.error('Failed to clear session from storage:', error);
    }
  }

  private clearUserCache(): void {
    // Clear any cached user-specific data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('user_') || key.startsWith('cache_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  private broadcastLogout(): void {
    // Notify other tabs/windows about logout
    try {
      const channel = new BroadcastChannel('mobilindo_auth');
      channel.postMessage({ type: 'LOGOUT', timestamp: Date.now() });
      channel.close();
    } catch (error) {
      // BroadcastChannel not supported, use storage event
      localStorage.setItem('logout_event', Date.now().toString());
      localStorage.removeItem('logout_event');
    }
  }

  private generateSessionId(): string {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private generateUserId(namaPengguna: string): string {
    // In real app, this would be actual user ID from database
    return 'user_' + btoa(namaPengguna).replace(/[^a-zA-Z0-9]/g, '').substr(0, 10);
  }

  private generateEmail(namaPengguna: string): string {
    // In real app, this would come from user data
    return `${namaPengguna.toLowerCase().replace(/\s+/g, '.')}@mobilindo.com`;
  }

  private generateJWT(payload: TokenPayload): string {
    // In real app, this would be generated by backend with proper signing
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = btoa(`signature_${Date.now()}`); // Mock signature
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private generateRefreshToken(sessionId: string, expiresAt: number): string {
    return btoa(`refresh_${sessionId}_${expiresAt}_${Math.random().toString(36)}`);
  }

  private isTokenValid(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);
      
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  private async refreshToken(): Promise<boolean> {
    try {
      if (!this.currentSession) return false;

      // In real app, this would call backend API
      const newExpiresAt = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
      
      // Update token payload
      const currentPayload = this.decodeToken(this.currentSession.token);
      if (currentPayload) {
        currentPayload.exp = newExpiresAt;
        currentPayload.iat = Math.floor(Date.now() / 1000);
        
        const newToken = this.generateJWT(currentPayload);
        
        this.currentSession.token = newToken;
        this.currentSession.expiresAt = new Date(newExpiresAt * 1000);
        this.currentSession.lastActivity = new Date();
        
        this.saveSessionToStorage(this.currentSession);
        
        this.logSessionActivity('TOKEN_REFRESHED', {
          userId: this.currentSession.userId,
          sessionId: this.currentSession.sessionId
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      this.logSessionActivity('TOKEN_REFRESH_ERROR', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }

  private decodeToken(token: string): TokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      return JSON.parse(atob(parts[1]));
    } catch {
      return null;
    }
  }

  private async invalidateTokenOnServer(token: string, sessionId: string): Promise<void> {
    try {
      // In real app, this would call backend API to invalidate token
      // For now, we'll just simulate the API call
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.logSessionActivity('TOKEN_INVALIDATED', {
        sessionId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.logSessionActivity('TOKEN_INVALIDATION_ERROR', {
        sessionId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private getDeviceInfo(): string {
    try {
      const ua = navigator.userAgent;
      const platform = navigator.platform;
      const language = navigator.language;
      
      return `${platform} - ${ua.substring(0, 100)} - ${language}`;
    } catch {
      return 'Unknown Device';
    }
  }

  private async getClientIP(): Promise<string> {
    try {
      // In real app, this would get actual client IP
      return '127.0.0.1';
    } catch {
      return 'Unknown IP';
    }
  }

  private logSessionActivity(activity: string, data: any): void {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        activity,
        data,
        userAgent: navigator.userAgent
      };
      
      // In real app, this would send to logging service
      console.log(`[LayananSesi] ${activity}:`, logEntry);
      
      // Store in session storage for debugging
      const logs = JSON.parse(sessionStorage.getItem('session_logs') || '[]');
      logs.push(logEntry);
      
      // Keep only last 50 logs
      if (logs.length > 50) {
        logs.splice(0, logs.length - 50);
      }
      
      sessionStorage.setItem('session_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to log session activity:', error);
    }
  }
}

// Export singleton instance
export const layananSesi = LayananSesi.getInstance();

// Default export for compatibility
export default LayananSesi;