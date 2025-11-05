// Debug Google Drive setup
// Run this in browser console to check configuration

console.log('=== Google Drive Debug Info ===');

// Check environment variables
console.log('Environment Variables:');
console.log('REACT_APP_GOOGLE_CLIENT_ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
console.log('REACT_APP_GOOGLE_API_KEY:', process.env.REACT_APP_GOOGLE_API_KEY);
console.log('REACT_APP_GOOGLE_DRIVE_FOLDER_ID:', process.env.REACT_APP_GOOGLE_DRIVE_FOLDER_ID);

// Check Google API availability
console.log('\nGoogle API Status:');
console.log('gapi available:', typeof gapi !== 'undefined');
console.log('window.google available:', typeof window.google !== 'undefined');

if (typeof gapi !== 'undefined') {
  console.log('gapi.client available:', typeof gapi.client !== 'undefined');
  console.log('gapi.load available:', typeof gapi.load !== 'undefined');

  if (gapi.client) {
    console.log('Current token:', gapi.client.getToken());
  }
}

if (typeof window.google !== 'undefined') {
  console.log('google.accounts available:', typeof window.google.accounts !== 'undefined');
  console.log('google.accounts.oauth2 available:', typeof window.google.accounts?.oauth2 !== 'undefined');
}

console.log('\n=== End Debug Info ===');