// 测试 Webhook 接收消息
const axios = require('axios');

async function testWebhook() {
  try {
    console.log('📨 Testing webhook with simulated message...\n');
    
    // Simulate a WhatsApp webhook message
    const webhookData = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
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
                    id: 'wamid.TEST' + Date.now(),
                    timestamp: Math.floor(Date.now() / 1000).toString(),
                    type: 'text',
                    text: {
                      body: 'Hello! This is a NEW test message from user.'
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
    
    const response = await axios.post('http://localhost:3002/webhooks/whatsapp', webhookData);
    
    console.log('✅ Webhook response:', response.status);
    console.log('\n📋 Now check your database for the new message!');
    console.log('Run: node check-conversations.js');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testWebhook();
