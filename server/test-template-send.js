require('dotenv').config();
const axios = require('axios');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const TEST_PHONE = process.env.TEST_PHONE_NUMBER;

async function sendTemplateTest() {
  console.log('📤 Testing template send...\n');
  
  // Test 1: Simple template without variables
  console.log('Test 1: Simple template (no variables)');
  try {
    const response1 = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: TEST_PHONE,
        type: 'template',
        template: {
          name: 'hello_world',
          language: { code: 'en_US' }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Test 1 passed:', response1.data);
  } catch (error) {
    console.error('❌ Test 1 failed:', error.response?.data || error.message);
  }
  
  console.log('\n---\n');
  
  // Test 2: Template with variables
  console.log('Test 2: Template with variables');
  try {
    const response2 = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: TEST_PHONE,
        type: 'template',
        template: {
          name: 'order_confirmation',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: 'John Doe' },
                { type: 'text', text: 'ORD-12345' },
                { type: 'text', text: '$99.99' }
              ]
            }
          ]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Test 2 passed:', response2.data);
  } catch (error) {
    console.error('❌ Test 2 failed:', error.response?.data || error.message);
  }
  
  console.log('\n---\n');
  
  // Test 3: Template with header media
  console.log('Test 3: Template with header media');
  try {
    const response3 = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: TEST_PHONE,
        type: 'template',
        template: {
          name: 'product_promo',
          language: { code: 'en' },
          components: [
            {
              type: 'header',
              parameters: [
                {
                  type: 'image',
                  image: { link: 'https://picsum.photos/800/600' }
                }
              ]
            },
            {
              type: 'body',
              parameters: [
                { type: 'text', text: 'John' },
                { type: 'text', text: 'Premium Headphones' },
                { type: 'text', text: '30' }
              ]
            }
          ]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Test 3 passed:', response3.data);
  } catch (error) {
    console.error('❌ Test 3 failed:', error.response?.data || error.message);
  }
}

sendTemplateTest();
