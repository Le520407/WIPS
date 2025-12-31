/**
 * Verify Embedded Signup Configuration
 * 
 * This script helps diagnose the config_id mismatch issue.
 * 
 * PROBLEM:
 * - Frontend config_id: 3910307729262069
 * - Backend Meta App ID: 1964783984342192
 * - Error 200: "Cannot call API for app 1964783984342192 on behalf of user"
 * 
 * This means the config_id is from a DIFFERENT Meta App!
 * 
 * SOLUTION:
 * 1. Go to: https://developers.facebook.com/apps/1964783984342192/whatsapp-business/wa-settings/
 * 2. Navigate to: WhatsApp > Configuration > Embedded Signup
 * 3. Find the Configuration ID for your Embedded Signup setup
 * 4. Update client/src/pages/DemoLogin.tsx with the correct config_id
 * 
 * ALTERNATIVE SOLUTION (if you don't have Embedded Signup configured):
 * Use password login instead:
 * 1. Run: node server/set-test-password.js
 * 2. Login with email and password on the frontend
 */

require('dotenv').config();

console.log('🔍 Embedded Signup Configuration Check\n');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📋 Current Configuration:');
console.log('   Meta App ID:', process.env.META_APP_ID);
console.log('   Meta App Secret:', process.env.META_APP_SECRET ? '✅ Set' : '❌ Missing');
console.log('   WABA ID:', process.env.WHATSAPP_BUSINESS_ACCOUNT_ID);
console.log('   Phone Number ID:', process.env.WHATSAPP_PHONE_NUMBER_ID);
console.log('');

console.log('❌ ISSUE DETECTED:');
console.log('   Frontend config_id: 3910307729262069');
console.log('   Backend Meta App ID:', process.env.META_APP_ID);
console.log('   Error: Authorization code is for a DIFFERENT Meta App!');
console.log('');

console.log('✅ SOLUTION:');
console.log('');
console.log('Option 1: Fix config_id (Recommended)');
console.log('─────────────────────────────────────────');
console.log('1. Open Meta Developer Console:');
console.log(`   https://developers.facebook.com/apps/${process.env.META_APP_ID}/whatsapp-business/wa-settings/`);
console.log('');
console.log('2. Navigate to: WhatsApp > Configuration > Embedded Signup');
console.log('');
console.log('3. Find your Configuration ID (should look like: 1234567890123456)');
console.log('');
console.log('4. Update client/src/pages/DemoLogin.tsx:');
console.log('   Change: config_id: \'3910307729262069\'');
console.log('   To:     config_id: \'YOUR_CORRECT_CONFIG_ID\'');
console.log('');
console.log('5. Rebuild frontend:');
console.log('   cd /var/www/whatsapp-integration/client');
console.log('   npm run build');
console.log('');
console.log('6. Restart PM2:');
console.log('   pm2 restart whatsapp');
console.log('');

console.log('Option 2: Use Password Login (Temporary)');
console.log('─────────────────────────────────────────');
console.log('1. Set password for test user:');
console.log('   cd /var/www/whatsapp-integration/server');
console.log('   node set-test-password.js');
console.log('');
console.log('2. Login with:');
console.log('   Email: test@whatsapp-platform.com');
console.log('   Password: (the one you set)');
console.log('');

console.log('Option 3: Add Domain to Meta App (Also Required)');
console.log('─────────────────────────────────────────');
console.log('1. Open Meta App Settings:');
console.log(`   https://developers.facebook.com/apps/${process.env.META_APP_ID}/settings/basic/`);
console.log('');
console.log('2. Add to "App Domains":');
console.log('   acestartechsi.com');
console.log('');
console.log('3. Save changes');
console.log('');

console.log('═══════════════════════════════════════════════════════════\n');
console.log('📝 Note: You need to fix BOTH the config_id AND add the domain!');
console.log('');
