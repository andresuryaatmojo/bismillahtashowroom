import { gapi, loadGapiInsideDOM } from 'gapi-script';

// Type declarations
declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  'https://www.googleapis.com/discovery/v1/apis/sheets/v4/rest'
];
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets';

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
                discoveryDocs: DISCOVERY_DOCS,
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

  /**
   * Search for a file by name in Google Drive
   */
  async searchFileByName(fileName: string, mimeType?: string): Promise<any | null> {
    try {
      console.log('[GoogleDriveService] Searching for file:', fileName);

      const token = gapi.client.getToken();
      if (!token?.access_token) {
        await this.signIn();
      }

      let query = `name='${fileName}'`;
      if (mimeType) {
        query += ` and mimeType='${mimeType}'`;
      }
      if (this.folderId) {
        query += ` and '${this.folderId}' in parents`;
      }
      query += ` and trashed=false`;

      const response = await gapi.client.drive.files.list({
        q: query,
        fields: 'files(id, name, mimeType, webViewLink, modifiedTime)',
        spaces: 'drive',
        pageSize: 1,
      });

      const files = response.result.files;
      if (files && files.length > 0) {
        console.log('[GoogleDriveService] Found file:', files[0]);
        return files[0];
      }

      console.log('[GoogleDriveService] File not found:', fileName);
      return null;
    } catch (error) {
      console.error('[GoogleDriveService] Error searching file:', error);
      throw error;
    }
  }

  /**
   * Update an existing file in Google Drive
   */
  async updateFile(fileId: string, file: File): Promise<string> {
    try {
      console.log('[GoogleDriveService] Updating file:', fileId);

      const token = gapi.client.getToken();
      if (!token?.access_token) {
        await this.signIn();
      }

      const form = new FormData();
      form.append('file', file);

      const response = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: new Headers({
            Authorization: `Bearer ${token?.access_token}`,
          }),
          body: file,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GoogleDriveService] Update failed:', errorText);
        throw new Error(`Update failed: ${response.statusText}`);
      }

      const data = await response.json();
      const fileUrl = `https://drive.google.com/file/d/${data.id}/view`;
      console.log('[GoogleDriveService] File updated successfully:', fileUrl);

      return fileUrl;
    } catch (error) {
      console.error('[GoogleDriveService] Error updating file:', error);
      throw error;
    }
  }

  /**
   * Upload or update a file (checks if file exists first)
   */
  async uploadOrUpdateFile(file: File, fileName?: string): Promise<string> {
    try {
      const finalFileName = fileName || file.name;
      console.log('[GoogleDriveService] uploadOrUpdateFile:', finalFileName);

      // Search for existing file
      const existingFile = await this.searchFileByName(finalFileName);

      if (existingFile) {
        console.log('[GoogleDriveService] File exists, updating...');
        return await this.updateFile(existingFile.id, file);
      } else {
        console.log('[GoogleDriveService] File does not exist, creating new...');
        return await this.uploadFile(file, finalFileName);
      }
    } catch (error) {
      console.error('[GoogleDriveService] Error in uploadOrUpdateFile:', error);
      throw error;
    }
  }

  /**
   * Create or update a Google Spreadsheet with multiple sheets
   */
  async createOrUpdateSpreadsheet(
    spreadsheetName: string,
    sheetsData: { sheetName: string; data: any[][] }[]
  ): Promise<string> {
    try {
      console.log('[GoogleDriveService] createOrUpdateSpreadsheet:', spreadsheetName);

      const token = gapi.client.getToken();
      if (!token?.access_token) {
        await this.signIn();
      }

      // Search for existing spreadsheet
      const existingFile = await this.searchFileByName(
        spreadsheetName,
        'application/vnd.google-apps.spreadsheet'
      );

      if (existingFile) {
        console.log('[GoogleDriveService] Spreadsheet exists, updating sheets...');
        // Update existing spreadsheet
        for (const sheetData of sheetsData) {
          await this.updateSheetInSpreadsheet(
            existingFile.id,
            sheetData.sheetName,
            sheetData.data
          );
        }
        return `https://docs.google.com/spreadsheets/d/${existingFile.id}/edit`;
      } else {
        console.log('[GoogleDriveService] Creating new spreadsheet...');
        // Create new spreadsheet
        return await this.createSpreadsheet(spreadsheetName, sheetsData);
      }
    } catch (error) {
      console.error('[GoogleDriveService] Error in createOrUpdateSpreadsheet:', error);
      throw error;
    }
  }

  /**
   * Create a new Google Spreadsheet
   */
  private async createSpreadsheet(
    spreadsheetName: string,
    sheetsData: { sheetName: string; data: any[][] }[]
  ): Promise<string> {
    try {
      const token = gapi.client.getToken();

      // Create spreadsheet with sheets
      const sheets = sheetsData.map(sheet => ({
        properties: {
          title: sheet.sheetName,
        },
      }));

      const createResponse = await fetch(
        'https://sheets.googleapis.com/v4/spreadsheets',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: {
              title: spreadsheetName,
            },
            sheets: sheets,
          }),
        }
      );

      if (!createResponse.ok) {
        throw new Error(`Failed to create spreadsheet: ${createResponse.statusText}`);
      }

      const spreadsheet = await createResponse.json();
      const spreadsheetId = spreadsheet.spreadsheetId;

      console.log('[GoogleDriveService] Spreadsheet created:', spreadsheetId);

      // Populate data in each sheet
      for (const sheetData of sheetsData) {
        await this.updateSheetInSpreadsheet(spreadsheetId, sheetData.sheetName, sheetData.data);
      }

      // Move to folder if specified
      if (this.folderId) {
        await this.moveFileToFolder(spreadsheetId, this.folderId);
      }

      // Make file public
      await this.makeFilePublic(spreadsheetId);

      return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    } catch (error) {
      console.error('[GoogleDriveService] Error creating spreadsheet:', error);
      throw error;
    }
  }

  /**
   * Update a specific sheet in a spreadsheet
   */
  async updateSheetInSpreadsheet(
    spreadsheetId: string,
    sheetName: string,
    data: any[][]
  ): Promise<void> {
    try {
      console.log('[GoogleDriveService] Updating sheet:', sheetName, 'in', spreadsheetId);

      const token = gapi.client.getToken();
      if (!token?.access_token) {
        await this.signIn();
      }

      // Get spreadsheet info to check if sheet exists
      const spreadsheetResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
        {
          headers: {
            Authorization: `Bearer ${token?.access_token}`,
          },
        }
      );

      if (!spreadsheetResponse.ok) {
        throw new Error('Failed to get spreadsheet info');
      }

      const spreadsheetInfo = await spreadsheetResponse.json();
      const existingSheet = spreadsheetInfo.sheets.find(
        (s: any) => s.properties.title === sheetName
      );

      // If sheet doesn't exist, create it
      if (!existingSheet) {
        console.log('[GoogleDriveService] Sheet does not exist, creating:', sheetName);
        await this.createSheet(spreadsheetId, sheetName);
      }

      // Clear existing data
      const clearRange = `${sheetName}!A1:ZZ`;
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${clearRange}:clear`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token?.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Update with new data
      const range = `${sheetName}!A1`;
      const updateResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            range: range,
            values: data,
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Failed to update sheet: ${errorText}`);
      }

      console.log('[GoogleDriveService] Sheet updated successfully:', sheetName);
    } catch (error) {
      console.error('[GoogleDriveService] Error updating sheet:', error);
      throw error;
    }
  }

  /**
   * Create a new sheet in an existing spreadsheet
   */
  private async createSheet(spreadsheetId: string, sheetName: string): Promise<void> {
    try {
      const token = gapi.client.getToken();

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                addSheet: {
                  properties: {
                    title: sheetName,
                  },
                },
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create sheet: ${response.statusText}`);
      }

      console.log('[GoogleDriveService] Sheet created:', sheetName);
    } catch (error) {
      console.error('[GoogleDriveService] Error creating sheet:', error);
      throw error;
    }
  }

  /**
   * Move file to a specific folder
   */
  private async moveFileToFolder(fileId: string, folderId: string): Promise<void> {
    try {
      // Get current parents
      const file = await gapi.client.drive.files.get({
        fileId: fileId,
        fields: 'parents',
      });

      const previousParents = file.result.parents ? file.result.parents.join(',') : '';

      // Move to new folder
      await gapi.client.drive.files.update({
        fileId: fileId,
        addParents: folderId,
        removeParents: previousParents,
        fields: 'id, parents',
      });

      console.log('[GoogleDriveService] File moved to folder:', folderId);
    } catch (error) {
      console.error('[GoogleDriveService] Error moving file to folder:', error);
      // Don't throw, just log
    }
  }

  /**
   * Combine all report types into a single sheet data
   */
  combineAllReportsToSingleSheet(allReportsData: {
    sales?: any;
    financial?: any;
    inventory?: any;
    user_activity?: any;
    performance?: any;
    analytics?: any;
  }): any[][] {
    const data: any[][] = [];

    // Header utama
    data.push(['═══════════════════════════════════════════════════════════════']);
    data.push(['         LAPORAN LENGKAP SHOWROOM MOBILINDO']);
    data.push(['         ' + new Date().toLocaleString('id-ID')]);
    data.push(['═══════════════════════════════════════════════════════════════']);
    data.push([]);
    data.push([]);

    // 1. LAPORAN PENJUALAN
    if (allReportsData.sales) {
      data.push(['▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓']);
      data.push(['                    LAPORAN PENJUALAN']);
      data.push(['▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓']);
      data.push([]);
      const salesData = this.convertReportDataToSheetData('sales', allReportsData.sales);
      // Skip header dari convertReportDataToSheetData (2 baris pertama)
      data.push(...salesData.slice(2));
      data.push([]);
      data.push([]);
    }

    // 2. LAPORAN KEUANGAN
    if (allReportsData.financial) {
      data.push(['▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓']);
      data.push(['                    LAPORAN KEUANGAN']);
      data.push(['▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓']);
      data.push([]);
      const financialData = this.convertReportDataToSheetData('financial', allReportsData.financial);
      data.push(...financialData.slice(2));
      data.push([]);
      data.push([]);
    }

    // 3. LAPORAN INVENTORY
    if (allReportsData.inventory) {
      data.push(['▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓']);
      data.push(['                    LAPORAN INVENTORY']);
      data.push(['▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓']);
      data.push([]);
      const inventoryData = this.convertReportDataToSheetData('inventory', allReportsData.inventory);
      data.push(...inventoryData.slice(2));
      data.push([]);
      data.push([]);
    }

    // 4. LAPORAN ANALYTICS
    if (allReportsData.analytics) {
      data.push(['▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓']);
      data.push(['                   DETAIL TRANSAKSI']);
      data.push(['▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓']);
      data.push([]);
      const analyticsData = this.convertReportDataToSheetData('analytics', allReportsData.analytics);
      data.push(...analyticsData.slice(2));
      data.push([]);
      data.push([]);
    }

    // Footer
    data.push([]);
    data.push(['═══════════════════════════════════════════════════════════════']);
    data.push(['          END OF REPORT - MOBILINDO SHOWROOM']);
    data.push(['═══════════════════════════════════════════════════════════════']);

    return data;
  }

  /**
   * Convert report data to CSV format for spreadsheet
   */
  convertReportDataToSheetData(reportType: string, reportData: any): any[][] {
    const data: any[][] = [];

    // Add header with timestamp
    data.push([`Laporan ${reportType}`, new Date().toLocaleString('id-ID')]);
    data.push([]); // Empty row

    switch (reportType) {
      case 'sales':
        data.push(['RINGKASAN PENJUALAN']);
        data.push(['Total Pendapatan', reportData.summary?.totalRevenue || 0]);
        data.push(['Total Transaksi', reportData.summary?.totalTransactions || 0]);
        data.push(['Rata-rata Transaksi', reportData.summary?.averageTransactionValue || 0]);
        data.push(['Pelanggan Unik', reportData.summary?.uniqueCustomers || 0]);
        data.push([]);

        if (reportData.salesByCategory) {
          data.push(['PENJUALAN PER KATEGORI']);
          data.push(['Kategori', 'Jumlah Penjualan']);
          Object.entries(reportData.salesByCategory).forEach(([category, count]) => {
            data.push([category, count]);
          });
          data.push([]);
        }

        if (reportData.transactions && reportData.transactions.length > 0) {
          data.push(['DETAIL TRANSAKSI']);
          data.push(['Tanggal', 'ID Transaksi', 'Jumlah', 'Kategori']);
          reportData.transactions.slice(0, 50).forEach((t: any) => {
            data.push([
              new Date(t.created_at).toLocaleDateString('id-ID'),
              t.id,
              t.total_amount || 0,
              (t.listings as any)?.car_categories?.name || 'Unknown',
            ]);
          });
        }
        break;

      case 'financial':
        data.push(['RINGKASAN KEUANGAN']);
        data.push(['Total Pendapatan', reportData.summary?.totalRevenue || 0]);
        data.push(['Total Transaksi', reportData.summary?.totalTransactions || 0]);
        data.push(['Rata-rata Transaksi', reportData.summary?.averageTransactionValue || 0]);
        data.push([]);

        if (reportData.revenueByPaymentMethod) {
          data.push(['PENDAPATAN PER METODE PEMBAYARAN']);
          data.push(['Metode', 'Jumlah']);
          Object.entries(reportData.revenueByPaymentMethod).forEach(([method, amount]) => {
            data.push([method, amount]);
          });
          data.push([]);
        }

        if (reportData.monthlyRevenue) {
          data.push(['PENDAPATAN BULANAN']);
          data.push(['Bulan', 'Pendapatan']);
          Object.entries(reportData.monthlyRevenue).forEach(([month, revenue]) => {
            data.push([month, revenue]);
          });
        }
        break;

      case 'inventory':
        data.push(['RINGKASAN INVENTORY']);
        data.push(['Total Kendaraan', reportData.summary?.totalVehicles || 0]);
        data.push(['Total Nilai Inventory', reportData.summary?.totalInventoryValue || 0]);
        data.push(['Harga Rata-rata', reportData.summary?.averageVehiclePrice || 0]);
        data.push([]);

        if (reportData.inventoryByCategory) {
          data.push(['INVENTORY PER KATEGORI']);
          data.push(['Kategori', 'Jumlah']);
          Object.entries(reportData.inventoryByCategory).forEach(([category, count]) => {
            data.push([category, count]);
          });
          data.push([]);
        }

        if (reportData.inventoryByBrand) {
          data.push(['INVENTORY PER BRAND']);
          data.push(['Brand', 'Jumlah']);
          Object.entries(reportData.inventoryByBrand).forEach(([brand, count]) => {
            data.push([brand, count]);
          });
        }
        break;

      case 'user_activity':
        data.push(['RINGKASAN AKTIVITAS USER']);
        data.push(['Total Users', reportData.summary?.totalUsers || 0]);
        data.push(['Active Users', reportData.summary?.activeUsers || 0]);
        data.push(['Total Test Drives', reportData.summary?.totalTestDrives || 0]);
        data.push(['Total Transaksi', reportData.summary?.totalTransactions || 0]);
        data.push([]);

        if (reportData.userStats) {
          data.push(['STATISTIK USER']);
          data.push(['User Baru Periode Ini', reportData.userStats.newUsersThisPeriod || 0]);
          data.push(['User dengan Transaksi', reportData.userStats.usersWithTransactions || 0]);
        }
        break;

      case 'performance':
        data.push(['RINGKASAN PERFORMA']);
        data.push(['Total Revenue', reportData.kpis?.totalRevenue || 0]);
        data.push(['Total Transaksi', reportData.kpis?.totalTransactions || 0]);
        data.push(['Conversion Rate', reportData.kpis?.conversionRate || 0]);
        data.push(['Rata-rata Transaksi', reportData.kpis?.averageTransactionValue || 0]);
        break;

      case 'analytics':
        data.push(['RINGKASAN ANALYTICS']);
        data.push([]);

        if (reportData.analytics?.marketTrends) {
          data.push(['TOP KATEGORI']);
          data.push(['Kategori', 'Jumlah']);
          reportData.analytics.marketTrends.topCategories?.forEach((item: any) => {
            data.push([item.category, item.count]);
          });
          data.push([]);

          data.push(['TOP BRAND']);
          data.push(['Brand', 'Jumlah']);
          reportData.analytics.marketTrends.topBrands?.forEach((item: any) => {
            data.push([item.brand, item.count]);
          });
        }
        break;

      default:
        data.push(['Data laporan tidak tersedia']);
    }

    return data;
  }
}

export default GoogleDriveService;