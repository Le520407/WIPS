require('dotenv').config();

async function testAuthAPI() {
  try {
    // Import models first to ensure they're initialized
    const models = require('./dist/models/index');
    console.log('✅ Models loaded');
    
    // Import service
    const authTemplateService = require('./dist/services/auth-template.service').default;
    console.log('✅ Service loaded');
    
    // Test getting templates for a test user
    const testUserId = '00000000-0000-0000-0000-000000000000'; // dummy ID
    const templates = await authTemplateService.getTemplates(testUserId);
    console.log('✅ Templates query successful:', templates.length, 'templates found');
    
    // Test getting OTP history
    const history = await authTemplateService.getOTPHistory(testUserId, 10);
    console.log('✅ OTP history query successful:', history.length, 'records found');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testAuthAPI();
