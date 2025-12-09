require('dotenv').config();
const axios = require('axios');

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

async function testCalling() {
  console.log('🧪 Testing WhatsApp Calling API\n');
  
  // Get phone number from command line or use default
  const phoneNumber = process.argv[2] || '60105520735';
  
  console.log('📋 Configuration:');
  console.log('  Phone Number ID:', PHONE_NUMBER_ID);
  console.log('  Target Number:', phoneNumber);
  console.log('  API Version: v21.0\n');
  
  try {
    console.log('📞 Initiating call...');
    
    const response = await axios.post(
      `${GRAPH_API_URL}/${PHONE_NUMBER_ID}/calls`,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    console.log('\n✅ Call initiated successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('\n❌ Call failed!');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', JSON.stringify(error.response.data, null, 2));
      
      // Provide helpful error messages
      const errorData = error.response.data;
      if (errorData.error) {
        console.log('\n💡 Error Analysis:');
        console.log('  Code:', errorData.error.code);
        console.log('  Message:', errorData.error.message);
        
        // Common errors
        if (errorData.error.message.includes('not valid')) {
          console.log('\n🔍 Possible causes:');
          console.log('  - Phone number format is incorrect');
          console.log('  - Phone number should be digits only with country code');
          console.log('  - Example: 60105520735 (Malaysia)');
          console.log('  - Example: 8613800138000 (China)');
        }
        
        if (errorData.error.message.includes('webhooks')) {
          console.log('\n🔍 Possible causes:');
          console.log('  - Webhooks not configured');
          console.log('  - "calls" webhook field not subscribed');
          console.log('  - Go to App Dashboard → WhatsApp → Configuration');
        }
        
        if (errorData.error.message.includes('2000')) {
          console.log('\n🔍 Possible causes:');
          console.log('  - Account needs 2000+ conversations/24h for Calling');
          console.log('  - This is a Real Account limitation');
          console.log('  - Consider using Sandbox Account for testing');
        }
      }
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Usage examples
console.log('Usage: node test-calling.js [phone_number]');
console.log('Example: node test-calling.js 60105520735\n');

testCalling();
