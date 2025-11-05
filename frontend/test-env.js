// Test Environment Variables
// Run this in browser console to debug environment variables

console.log('=== ENVIRONMENT VARIABLES DEBUG ===');

// Check all environment variables
console.log('All process.env keys:', Object.keys(process.env));

// Check Google Drive specific variables
console.log('Google Drive Credentials:');
console.log('REACT_APP_GOOGLE_CLIENT_ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
console.log('REACT_APP_GOOGLE_API_KEY:', process.env.REACT_APP_GOOGLE_API_KEY);
console.log('REACT_APP_GOOGLE_DRIVE_FOLDER_ID:', process.env.REACT_APP_GOOGLE_DRIVE_FOLDER_ID);

// Check Supabase
console.log('Supabase Credentials:');
console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');

// Check Google APIs
console.log('Google API Status:');
console.log('window.gapi:', typeof window.gapi !== 'undefined' ? '✅ Available' : '❌ Not loaded');
console.log('window.google:', typeof window.google !== 'undefined' ? '✅ Available' : '❌ Not loaded');
console.log('window.google.accounts:', typeof window.google?.accounts !== 'undefined' ? '✅ Available' : '❌ Not loaded');

// Test GoogleDriveService instantiation
try {
  const GoogleDriveService = window.require?.('./src/services/GoogleDriveService.ts')?.default;
  if (GoogleDriveService) {
    const service = new GoogleDriveService();
    console.log('✅ GoogleDriveService created successfully');
  } else {
    console.log('❌ GoogleDriveService not available');
  }
} catch (error) {
  console.log('❌ Error creating GoogleDriveService:', error.message);
}

console.log('=== END DEBUG ===');