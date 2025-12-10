/**
 * Voice Message Debug Script
 * 
 * This script helps debug voice message sending issues
 */

require('dotenv').config();
const axios = require('axios');

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const TEST_RECIPIENT = process.env.TEST_RECIPIENT_PHONE || '+60105520735';

const WHATSAPP_API_URL = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}`;

console.log('🐛 Voice Message Debug Script');
console.log('==============================\n');

console.log('📋 Configuration:');
console.log(`   API Version: ${API_VERSION}`);
console.log(`   Phone Number ID: ${PHONE_NUMBER_ID}`);
console.log(`   Test Recipient: ${TEST_RECIPIENT}`);
console.log(`   Token: ${ACCESS_TOKEN ? ACCESS_TOKEN.substring(0, 20) + '...' : 'NOT SET'}`);
console.log('');

/**
 * Test sending voice message with a media ID
 */
async function testVoiceMessage(mediaId) {
  try {
    console.log(`\n🎤 Testing Voice Message with Media ID: ${mediaId}`);
    console.log('─────────────────────────────────────────────────\n');
    
    const messageBody = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: TEST_RECIPIENT,
      type: 'audio',
      audio: {
        id: mediaId,
        voice: true
      }
    };
    
    console.log('📨 Request Body:');
    console.log(JSON.stringify(messageBody, null, 2));
    console.log('');
    
    console.log('🌐 Sending to WhatsApp API...');
    const response = await axios.post(
      `${WHATSAPP_API_URL}/messages`,
      messageBody,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Success! Response:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('');
    console.log(`📱 Message ID: ${response.data.messages[0].id}`);
    console.log(`📞 WhatsApp ID: ${response.data.contacts[0].wa_id}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error sending voice message:');
    console.error('');
    
    if (error.response) {
      console.error('📊 Response Status:', error.response.status);
      console.error('📊 Response Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('📊 Response Data:', JSON.stringify(error.response.data, null, 2));
      
      // Parse error details
      if (error.response.data.error) {
        const err = error.response.data.error;
        console.error('');
        console.error('🔍 Error Details:');
        console.error(`   Code: ${err.code}`);
        console.error(`   Type: ${err.type}`);
        console.error(`   Message: ${err.message}`);
        console.error(`   Subcode: ${err.error_subcode || 'N/A'}`);
        console.error(`   Trace ID: ${err.fbtrace_id || 'N/A'}`);
        
        // Common error codes
        console.error('');
        console.error('💡 Common Causes:');
        if (err.code === 100) {
          console.error('   - Invalid parameter');
          console.error('   - Check media ID is valid');
          console.error('   - Check phone number format');
        } else if (err.code === 131047) {
          console.error('   - Media file format issue');
          console.error('   - Voice messages must be OGG with OPUS codec');
          console.error('   - Check file encoding');
        } else if (err.code === 131056) {
          console.error('   - Media file too large (max 16MB)');
        } else if (err.code === 131051) {
          console.error('   - Unsupported media type');
        }
      }
    } else if (error.request) {
      console.error('📊 No response received from server');
      console.error('Request:', error.request);
    } else {
      console.error('📊 Error:', error.message);
    }
    
    throw error;
  }
}

/**
 * Get media info
 */
async function getMediaInfo(mediaId) {
  try {
    console.log(`\n📊 Getting Media Info for: ${mediaId}`);
    console.log('─────────────────────────────────────────────────\n');
    
    const response = await axios.get(
      `https://graph.facebook.com/${API_VERSION}/${mediaId}`,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    
    console.log('✅ Media Info:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('');
    console.log(`📄 MIME Type: ${response.data.mime_type}`);
    console.log(`📏 File Size: ${response.data.file_size} bytes (${(response.data.file_size / 1024).toFixed(2)} KB)`);
    console.log(`🔗 URL: ${response.data.url}`);
    
    // Check if it's a valid voice message format
    if (response.data.mime_type !== 'audio/ogg') {
      console.warn('');
      console.warn('⚠️  WARNING: MIME type is not audio/ogg');
      console.warn('   Voice messages must be OGG files with OPUS codec');
      console.warn(`   Current MIME type: ${response.data.mime_type}`);
    }
    
    if (response.data.file_size > 16 * 1024 * 1024) {
      console.warn('');
      console.warn('⚠️  WARNING: File size exceeds 16MB limit');
      console.warn(`   Current size: ${(response.data.file_size / 1024 / 1024).toFixed(2)} MB`);
    }
    
    if (response.data.file_size > 512 * 1024) {
      console.warn('');
      console.warn('⚠️  INFO: File size > 512KB');
      console.warn('   User will see download icon instead of play icon');
      console.warn(`   Current size: ${(response.data.file_size / 1024).toFixed(2)} KB`);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Error getting media info:');
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  // Get media ID from command line or use the one from your logs
  const mediaId = process.argv[2] || '1380884380211454';
  
  console.log(`\n🎯 Testing with Media ID: ${mediaId}`);
  console.log('');
  
  try {
    // Step 1: Get media info
    await getMediaInfo(mediaId);
    
    // Step 2: Send voice message
    await testVoiceMessage(mediaId);
    
    console.log('\n═══════════════════════════════════════════════');
    console.log('✅ Test completed successfully!');
    console.log('═══════════════════════════════════════════════');
    
  } catch (error) {
    console.log('\n═══════════════════════════════════════════════');
    console.log('❌ Test failed!');
    console.log('═══════════════════════════════════════════════');
    process.exit(1);
  }
}

// Run the test
main();
