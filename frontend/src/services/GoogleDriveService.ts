import { gapi, loadGapiInsideDOM } from 'gapi-script';

// Type declarations
declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

class GoogleDriveService {
  private clientId: string;
  private apiKey: string;
  private folderId: string;
  private isInitialized = false;
  private tokenClient: any = null;

  // Static method to ensure Google API is loaded
  static async ensureGapiLoaded(): Promise<void> {
    console.log('[GoogleDriveService] 🔧 Ensuring gapi is loaded...');

    // Use gapi-script's utility to load Google APIs
    await loadGapiInsideDOM();

    console.log('[GoogleDriveService] ✅ gapi loaded via gapi-script');
  }

  constructor() {
    this.clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
    this.apiKey = process.env.REACT_APP_GOOGLE_API_KEY || '';
    this.folderId = process.env.REACT_APP_GOOGLE_DRIVE_FOLDER_ID || '';

    // Debug environment variables
    console.log('[GoogleDriveService] Environment Variables Check:');
    console.log('  - Client ID:', this.clientId ? `${this.clientId.substring(0, 20)}...` : '❌ MISSING');
    console.log('  - API Key:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : '❌ MISSING');
    console.log('  - Folder ID:', this.folderId || '❌ MISSING');

    // Validate required environment variables
    if (!this.clientId || !this.apiKey) {
      console.error('[GoogleDriveService] ❌ CRITICAL: Missing Google API credentials!');
      console.error('Expected process.env values:');
      console.error('  REACT_APP_GOOGLE_CLIENT_ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
      console.error('  REACT_APP_GOOGLE_API_KEY:', process.env.REACT_APP_GOOGLE_API_KEY);
    } else {
      console.log('[GoogleDriveService] ✅ All credentials loaded successfully');
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Check if credentials are available
    if (!this.clientId || !this.apiKey) {
      throw new Error('Google API credentials not configured. Please set REACT_APP_GOOGLE_CLIENT_ID and REACT_APP_GOOGLE_API_KEY in your .env.local file.');
    }

    console.log('[GoogleDriveService] 🚀 Starting Google API initialization using gapi-script...');

    try {
      // Use gapi-script to load Google APIs
      console.log('[GoogleDriveService] Loading gapi via gapi-script...');
      await loadGapiInsideDOM();
      console.log('[GoogleDriveService] ✅ gapi loaded via gapi-script');

      // Wait a bit for everything to settle
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Load gapi.client explicitly
      console.log('[GoogleDriveService] Loading gapi.client...');
      await new Promise((resolve, reject) => {
        gapi.load('client', {
          callback: async () => {
            try {
              console.log('[GoogleDriveService] gapi.client loaded, initializing...');
              await gapi.client.init({
                apiKey: this.apiKey,
                discoveryDocs: [DISCOVERY_DOC],
              });
              console.log('[GoogleDriveService] ✅ gapi.client initialized');
              resolve(true);
            } catch (error) {
              console.error('[GoogleDriveService] gapi.client.init failed:', error);
              reject(error);
            }
          },
          onerror: (error: any) => {
            console.error('[GoogleDriveService] gapi.load error:', error);
            reject(new Error('Failed to load gapi.client: ' + error));
          },
          timeout: 10000,
          ontimeout: () => {
            console.error('[GoogleDriveService] gapi.load timeout after 10 seconds');
            reject(new Error('gapi.load timeout after 10 seconds'));
          }
        });
      });

      // Create token client
      console.log('[GoogleDriveService] Creating OAuth token client...');
      if (!window.google?.accounts?.oauth2?.initTokenClient) {
        console.error('[GoogleDriveService] ❌ window.google.accounts.oauth2.initTokenClient not available');
        throw new Error('Google OAuth2 not available');
      }

      this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: SCOPES,
        callback: (tokenResponse: any) => {
          console.log('[GoogleDriveService] Token callback (from init):', tokenResponse);
          if (tokenResponse && tokenResponse.access_token) {
            gapi.client.setToken(tokenResponse);
          }
        },
        error_callback: (error: any) => {
          console.error('[GoogleDriveService] OAuth error (from init):', error);
        }
      });

      if (!this.tokenClient) {
        console.error('[GoogleDriveService] ❌ Failed to create token client');
        throw new Error('Failed to create OAuth token client');
      }

      this.isInitialized = true;
      console.log('[GoogleDriveService] ✅ Successfully initialized with token client');
    } catch (error: any) {
      console.error('[GoogleDriveService] Failed to initialize Google Drive API:', error);
      throw new Error('Failed to initialize Google Drive API: ' + error.message);
    }
  }

  async signIn(): Promise<void> {
    console.log('[GoogleDriveService] 🔑 signIn() called');

    if (!this.isInitialized) {
      console.log('[GoogleDriveService] Not initialized, calling initialize...');
      await this.initialize();
    }

    if (gapi.client.getToken()?.access_token) {
      console.log('[GoogleDriveService] ✅ Already signed in');
      return; // Already signed in
    }

    if (!this.tokenClient) {
      console.error('[GoogleDriveService] ❌ Token client not available');
      throw new Error('OAuth token client not initialized');
    }

    console.log('[GoogleDriveService] Initiating sign-in flow...');

    return new Promise((resolve, reject) => {
      // Set up the callback
      this.tokenClient.callback = (tokenResponse: any) => {
        console.log('[GoogleDriveService] 🎯 Token response received:', tokenResponse);
        if (tokenResponse && tokenResponse.access_token) {
          gapi.client.setToken(tokenResponse);
          console.log('[GoogleDriveService] ✅ Successfully signed in');
          resolve();
        } else {
          console.error('[GoogleDriveService] ❌ Failed to get token:', tokenResponse);
          reject(new Error('Failed to sign in to Google Drive'));
        }
      };

      // Handle token error
      this.tokenClient.error_callback = (error: any) => {
        console.error('[GoogleDriveService] ❌ Sign-in error:', error);
        reject(new Error(`Google sign-in failed: ${error.message || 'Unknown error'}`));
      };

      // Request access token - this should trigger popup
      console.log('[GoogleDriveService] 🚀 Requesting access token (should trigger popup)...');
      this.tokenClient.requestAccessToken({
        prompt: 'consent' // Force consent dialog to show
      });
    });
  }

  async uploadFile(file: File, fileName?: string): Promise<string> {
    const token = gapi.client.getToken();
    console.log('[GoogleDriveService] uploadFile called, token exists:', !!token?.access_token);

    if (!token?.access_token) {
      console.log('[GoogleDriveService] No token in uploadFile, signing in...');
      await this.signIn();
    }

    const finalFileName = fileName || file.name;
    const metadata = {
      name: finalFileName,
      parents: this.folderId ? [this.folderId] : undefined,
    };

    console.log('[GoogleDriveService] Uploading file with metadata:', metadata);

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append('file', file);

    try {
      const currentToken = gapi.client.getToken();
      console.log('[GoogleDriveService] Using token for upload:', currentToken);

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: new Headers({
            Authorization: `Bearer ${currentToken?.access_token}`,
          }),
          body: form,
        }
      );

      console.log('[GoogleDriveService] Upload response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GoogleDriveService] Upload failed response:', errorText);
        throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[GoogleDriveService] Upload response data:', data);

      // Make file publicly accessible
      console.log('[GoogleDriveService] Making file public...');
      await this.makeFilePublic(data.id);

      const fileUrl = `https://drive.google.com/file/d/${data.id}/view`;
      console.log('[GoogleDriveService] File upload completed:', fileUrl);

      return fileUrl;
    } catch (error) {
      console.error('[GoogleDriveService] Error uploading file to Google Drive:', error);
      throw error;
    }
  }

  async uploadFromUrl(url: string, fileName: string, mimeType: string): Promise<string> {
    try {
      console.log('[GoogleDriveService] Starting upload from URL:', { url, fileName, mimeType });

      // Initialize Google API with retry
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Wait a bit for initialization to fully complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check current token status
      const currentToken = gapi.client.getToken();
      console.log('[GoogleDriveService] Current token status:', currentToken);

      // Additional check for gapi.client availability
      let retries = 0;
      const maxRetries = 5;

      while (retries < maxRetries && (!gapi.client || !gapi.client.getToken)) {
        console.log(`[GoogleDriveService] Waiting for gapi.client... (${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        retries++;
      }

      if (!gapi.client || !gapi.client.getToken) {
        throw new Error('Google API not properly initialized. Please refresh the page and try again.');
      }

      if (!gapi.client.getToken()?.access_token) {
        console.log('[GoogleDriveService] No access token found, initiating sign-in...');
        await this.signIn();
      } else {
        console.log('[GoogleDriveService] ✅ Already have access token, proceeding with upload');
      }

      // Download file from URL
      console.log('[GoogleDriveService] Downloading file from URL...');
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      console.log('[GoogleDriveService] File downloaded successfully, creating file object...');
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: mimeType });

      console.log('[GoogleDriveService] Starting upload to Google Drive...');
      const driveUrl = await this.uploadFile(file, fileName);
      console.log('[GoogleDriveService] Upload completed! URL:', driveUrl);

      return driveUrl;
    } catch (error) {
      console.error('[GoogleDriveService] Error uploading file from URL to Google Drive:', error);
      throw error;
    }
  }

  private async makeFilePublic(fileId: string): Promise<void> {
    try {
      await gapi.client.drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (error) {
      console.error('Error making file public:', error);
      // Don't throw error here as the file is still uploaded, just not public
    }
  }

  async isSignedIn(): Promise<boolean> {
    return !!(gapi.client.getToken()?.access_token);
  }

  async signOut(): Promise<void> {
    if (gapi.client.getToken()) {
      (window as any).google.accounts.oauth2.revoke(gapi.client.getToken().access_token);
      gapi.client.setToken(null);
    }
  }
}

export default GoogleDriveService;