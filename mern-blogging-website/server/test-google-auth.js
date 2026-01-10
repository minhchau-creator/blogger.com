// Test Google OAuth Configuration
// Run: node test-google-auth.js

import 'dotenv/config';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

console.log("=== Google OAuth Configuration Test ===\n");

console.log("1. Environment Variables:");
console.log("   GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✓ Set" : "✗ Not Set");
console.log("   Value:", process.env.GOOGLE_CLIENT_ID);

console.log("\n2. OAuth2Client:");
console.log("   Client initialized:", googleClient ? "✓ Yes" : "✗ No");

console.log("\n3. Checklist:");
console.log("   ☐ Client ID ends with .apps.googleusercontent.com");
console.log("   ☐ Authorized JavaScript origins includes http://localhost:5173");
console.log("   ☐ Same Client ID in both frontend and backend .env files");
console.log("   ☐ Google Cloud Console → APIs & Services → Credentials");

console.log("\n=== Test Complete ===");
console.log("\nIf issues persist:");
console.log("1. Check browser console for detailed errors");
console.log("2. Verify Google Cloud Console settings");
console.log("3. Try regenerating Client ID");
console.log("4. Check server logs when clicking Google button");
