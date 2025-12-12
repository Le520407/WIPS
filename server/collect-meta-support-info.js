/**
 * Meta Support Information Collector
 * 
 * This script helps collect all necessary information for Meta Support ticket
 * regarding Business Configuration ID restriction
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('📋 Meta Support Information Collector');
console.log('=====================================\n');

const info = {
  timestamp: new Date().toISOString(),
  environment: {},
  ids: {},
  urls: {},
  status: {}
};

// Collect Environment Variables
console.log('1️⃣ Collecting Environment Information...\n');

info.environment = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_ID: process.env.META_APP_ID || 'NOT_SET',
  APP_SECRET: process.env.META_APP_SECRET ? '***SET***' : 'NOT_SET',
  BUSINESS_ID: process.env.META_BUSINESS_ID || 'NOT_SET',
  WABA_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || 'NOT_SET',
  PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || 'NOT_SET',
  ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN ? '***SET***' : 'NOT_SET',
  VERIFY_TOKEN: process.env.META_VERIFY_TOKEN ? '***SET***' : 'NOT_SET',
  CLIENT_URL: process.env.CLIENT_URL || 'NOT_SET',
  SERVER_URL: process.env.SERVER_URL || 'NOT_SET'
};

console.log('Environment Variables:');
Object.entries(info.environment).forEach(([key, value]) => {
  const display = value.includes('***') ? value : (value === 'NOT_SET' ? '❌ NOT_SET' : `✅ ${value}`);
  console.log(`  ${key}: ${display}`);
});

// Collect IDs
console.log('\n2️⃣ Collecting IDs for Meta Support...\n');

info.ids = {
  app_id: process.env.META_APP_ID || '[PLEASE_FILL]',
  business_id: process.env.META_BUSINESS_ID || '[PLEASE_FILL]',
  waba_id: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '[PLEASE_FILL]',
  phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || '[PLEASE_FILL]',
  configuration_id: '[PLEASE_FILL_FROM_FACEBOOK_LOGIN_SETTINGS]'
};

console.log('IDs to provide to Meta Support:');
Object.entries(info.ids).forEach(([key, value]) => {
  const status = value.includes('[PLEASE_FILL]') ? '⚠️  NEEDS MANUAL INPUT' : '✅';
  console.log(`  ${key}: ${value} ${status}`);
});

// Collect URLs
console.log('\n3️⃣ Collecting URLs...\n');

info.urls = {
  app_dashboard: `https://developers.facebook.com/apps/${info.ids.app_id || 'YOUR_APP_ID'}`,
  business_settings: `https://business.facebook.com/settings/info/${info.ids.business_id || 'YOUR_BUSINESS_ID'}`,
  facebook_login_config: `https://developers.facebook.com/apps/${info.ids.app_id || 'YOUR_APP_ID'}/fb-login/settings/`,
  waba_settings: `https://business.facebook.com/wa/manage/home/?waba_id=${info.ids.waba_id || 'YOUR_WABA_ID'}`,
  client_url: process.env.CLIENT_URL || 'http://localhost:5174',
  server_url: process.env.SERVER_URL || 'http://localhost:3002',
  callback_url: `${process.env.CLIENT_URL || 'http://localhost:5174'}/auth/callback`
};

console.log('Important URLs:');
Object.entries(info.urls).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});

// Check Status
console.log('\n4️⃣ Checking Configuration Status...\n');

info.status = {
  has_app_id: !!process.env.META_APP_ID,
  has_app_secret: !!process.env.META_APP_SECRET,
  has_business_id: !!process.env.META_BUSINESS_ID,
  has_waba_id: !!process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
  has_phone_number_id: !!process.env.WHATSAPP_PHONE_NUMBER_ID,
  has_access_token: !!process.env.WHATSAPP_ACCESS_TOKEN,
  has_verify_token: !!process.env.META_VERIFY_TOKEN
};

console.log('Configuration Status:');
Object.entries(info.status).forEach(([key, value]) => {
  console.log(`  ${key}: ${value ? '✅ Yes' : '❌ No'}`);
});

// Generate Support Ticket Template
console.log('\n5️⃣ Generating Support Ticket Template...\n');

const ticketTemplate = `
================================================================================
META SUPPORT TICKET - BUSINESS CONFIGURATION ID RESTRICTION
================================================================================

Date: ${new Date().toLocaleDateString()}
Ticket Type: Business Configuration ID Restriction
Priority: High

--------------------------------------------------------------------------------
BASIC INFORMATION
--------------------------------------------------------------------------------

App ID: ${info.ids.app_id}
Business ID: ${info.ids.business_id}
WABA ID: ${info.ids.waba_id}
Phone Number ID: ${info.ids.phone_number_id}
Configuration ID: ${info.ids.configuration_id}

Admin Information:
- Name: [YOUR_NAME]
- Email: [YOUR_EMAIL]
- Facebook User ID: [YOUR_FB_USER_ID]
- Role: Business Admin

--------------------------------------------------------------------------------
ISSUE DESCRIPTION
--------------------------------------------------------------------------------

We are experiencing a restriction on our Business Configuration ID that is 
preventing the Facebook Login + Embedded Signup flow from functioning.

Error: "Something went wrong" appears immediately when initiating the 
Embedded Signup flow.

Impact: Unable to onboard new users to our WhatsApp Business Platform.

--------------------------------------------------------------------------------
BUSINESS CONTEXT
--------------------------------------------------------------------------------

We are developing a WhatsApp Business Platform that provides:
- WhatsApp Business account management
- Message sending and receiving
- Customer communication tools
- Business integration capabilities

The Embedded Signup flow is critical for our user onboarding process.

--------------------------------------------------------------------------------
TECHNICAL DETAILS
--------------------------------------------------------------------------------

Implementation: Facebook Login for Business + Embedded Signup
Permissions: whatsapp_business_management, whatsapp_business_messaging
Environment: ${info.environment.NODE_ENV}

URLs:
- Client: ${info.urls.client_url}
- Server: ${info.urls.server_url}
- Callback: ${info.urls.callback_url}

--------------------------------------------------------------------------------
REQUESTED ACTION
--------------------------------------------------------------------------------

Please review and remove the restriction on Configuration ID: ${info.ids.configuration_id}

We have attached:
1. Error screenshots
2. HAR file (network logs)
3. Configuration page screenshots
4. Business verification documents

--------------------------------------------------------------------------------
ADDITIONAL INFORMATION
--------------------------------------------------------------------------------

App Dashboard: ${info.urls.app_dashboard}
Business Settings: ${info.urls.business_settings}
Facebook Login Config: ${info.urls.facebook_login_config}

================================================================================
`;

// Save to file
const outputDir = path.join(__dirname, '../docs/12-11');
const outputFile = path.join(outputDir, 'META_SUPPORT_TICKET_INFO.txt');

try {
  fs.writeFileSync(outputFile, ticketTemplate);
  console.log(`✅ Support ticket template saved to:`);
  console.log(`   ${outputFile}\n`);
} catch (error) {
  console.error('❌ Error saving file:', error.message);
}

// Generate Checklist
console.log('6️⃣ Document Checklist for Meta Support:\n');

const checklist = [
  { item: 'App ID', status: info.status.has_app_id },
  { item: 'Business ID', status: info.status.has_business_id },
  { item: 'Configuration ID', status: false, note: 'Get from Facebook Login Settings' },
  { item: 'Error Screenshot', status: false, note: 'Take screenshot of error' },
  { item: 'Configuration Screenshot', status: false, note: 'Screenshot of restricted config' },
  { item: 'HAR File', status: false, note: 'Collect from browser DevTools' },
  { item: 'Business Documents', status: false, note: 'Company registration, etc.' },
  { item: 'Admin ID Proof', status: false, note: 'ID card or passport' },
  { item: 'Privacy Policy URL', status: false, note: 'Your privacy policy' },
  { item: 'Terms of Service URL', status: false, note: 'Your terms of service' }
];

checklist.forEach(({ item, status, note }) => {
  const icon = status ? '✅' : '⬜';
  const noteText = note ? ` (${note})` : '';
  console.log(`${icon} ${item}${noteText}`);
});

// Instructions
console.log('\n7️⃣ Next Steps:\n');

const steps = [
  'Review the generated ticket template',
  'Fill in [PLEASE_FILL] placeholders',
  'Collect all required screenshots',
  'Generate HAR file using browser DevTools',
  'Gather business verification documents',
  'Submit ticket through Meta Support Portal',
  'Keep ticket number for follow-up'
];

steps.forEach((step, index) => {
  console.log(`${index + 1}. ${step}`);
});

console.log('\n8️⃣ How to Get Configuration ID:\n');
console.log('1. Go to: https://developers.facebook.com/apps/');
console.log('2. Select your app');
console.log('3. Left menu > Products > Facebook Login for Business');
console.log('4. Look for "Business Configurations" section');
console.log('5. Find the restricted configuration');
console.log('6. Copy the Configuration ID\n');

console.log('9️⃣ How to Collect HAR File:\n');
console.log('1. Open Chrome DevTools (F12)');
console.log('2. Go to Network tab');
console.log('3. Check "Preserve log"');
console.log('4. Clear existing logs');
console.log('5. Reproduce the error');
console.log('6. Right-click > Save all as HAR with content');
console.log('7. Save as: embedded-signup-error.har\n');

console.log('🔟 Support Contact:\n');
console.log('Developer Support: https://developers.facebook.com/support/');
console.log('Business Support: https://business.facebook.com/help/');
console.log('WhatsApp API Support: wa-api-support@support.facebook.com\n');

console.log('=====================================');
console.log('✅ Information collection complete!');
console.log('=====================================\n');

// Save JSON version
const jsonFile = path.join(outputDir, 'meta-support-info.json');
try {
  fs.writeFileSync(jsonFile, JSON.stringify(info, null, 2));
  console.log(`📄 JSON data saved to: ${jsonFile}\n`);
} catch (error) {
  console.error('❌ Error saving JSON:', error.message);
}
