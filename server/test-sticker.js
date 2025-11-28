require('dotenv').config();
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const TEST_PHONE = process.env.TEST_PHONE_NUMBER || '+60123456789';

// Example sticker URLs from WhatsApp's official sticker pack
const EXAMPLE_STICKERS = [
  'https://raw.githubusercontent.com/WhatsApp/stickers/main/Android/app/src/main/assets/1/01_Cuppy_smile.webp',
  'https://raw.githubusercontent.com/WhatsApp/stickers/main/Android/app/src/main/assets/1/02_Cuppy_lol.webp',
  'https://raw.githubusercontent.com/WhatsApp/stickers/main/Android/app/src/main/assets/1/03_Cuppy_rofl.webp'
];

async function testSendSticker() {
  try {
    console.log('🧪 Testing Sticker Sending...\n');

    // 1. Login first
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      username: 'demo',
      password: 'demo123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful\n');

    // 2. Send sticker by URL
    console.log('2️⃣ Sending sticker by URL...');
    const stickerUrl = EXAMPLE_STICKERS[0];
    console.log(`Sticker URL: ${stickerUrl}`);
    
    const response = await axios.post(
      `${API_URL}/messages/send-sticker`,
      {
        to: TEST_PHONE,
        stickerUrl: stickerUrl
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Sticker sent successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('\n📱 Check your WhatsApp to see the sticker!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testSendSticker();
