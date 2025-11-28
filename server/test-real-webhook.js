// 测试真实的 webhook 接收
const axios = require('axios');

async function testRealWebhook() {
  console.log('🧪 Testing real webhook reception...\n');
  
  const NGROK_URL = 'https://blockish-calculatedly-kaleb.ngrok-free.dev';
  
  // 模拟 WhatsApp 发送的真实消息格式
  const webhookData = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: '673274279136021',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '15550000000',
                phone_number_id: '803320889535856'
              },
              contacts: [
                {
                  profile: {
                    name: 'Test User'
                  },
                  wa_id: '60105520735'
                }
              ],
              messages: [
                {
                  from: '60105520735',
                  id: 'wamid.MANUAL_TEST_' + Date.now(),
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  type: 'text',
                  text: {
                    body: 'Manual test message from script'
                  }
                }
              ]
            },
            field: 'messages'
          }
        ]
      }
    ]
  };
  
  try {
    console.log('📤 Sending webhook to:', NGROK_URL + '/webhooks/whatsapp');
    const response = await axios.post(NGROK_URL + '/webhooks/whatsapp', webhookData);
    
    console.log('✅ Webhook response:', response.status);
    console.log('\n📋 Check your server logs for message processing');
    console.log('📋 Check your platform for the new message');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

testRealWebhook();
