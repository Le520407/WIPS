require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const WHATSAPP_API_URL = 'https://graph.facebook.com';
const API_VERSION = 'v21.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const TO_NUMBER = process.env.TEST_PHONE_NUMBER || '60105520735';

async function testVoiceRecording() {
  console.log('🎤 Testing Voice Recording Flow\n');
  
  // Step 1: Create a test WebM file (simulating browser recording)
  console.log('Step 1: Simulating WebM recording...');
  // In real scenario, this would be the recorded audio from browser
  // For testing, we'll use an existing audio file
  
  // Step 2: Upload to our server (which should convert to OGG)
  console.log('Step 2: Uploading to server for conversion...');
  
  try {
    // Test with a public MP3 file (server should handle it)
    const testAudioUrl = 'https://www2.cs.uic.edu/~i101/SoundFiles/BabyElephantWalk60.wav';
    
    console.log('Downloading test audio...');
    const audioResponse = await axios.get(testAudioUrl, { responseType: 'arraybuffer' });
    const audioBuffer = Buffer.from(audioResponse.data);
    
    console.log(`✅ Downloaded ${audioBuffer.length} bytes`);
    
    // Upload to WhatsApp directly (simulating what server does)
    console.log('\nStep 3: Uploading to WhatsApp...');
    
    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: 'voice_test.wav',
      contentType: 'audio/wav'
    });
    formData.append('messaging_product', 'whatsapp');
    
    const uploadResponse = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/media`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      }
    );
    
    const mediaId = uploadResponse.data.id;
    console.log('✅ Media uploaded:', mediaId);
    
    // Step 4: Send as voice message
    console.log('\nStep 4: Sending as voice message...');
    
    const messageBody = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: TO_NUMBER,
      type: 'audio',
      audio: {
        id: mediaId,
        voice: true  // This makes it a voice message
      }
    };
    
    console.log('Message body:', JSON.stringify(messageBody, null, 2));
    
    const sendResponse = await axios.post(
      `${WHATSAPP_API_URL}/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      messageBody,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n✅ Voice message sent successfully!');
    console.log('Message ID:', sendResponse.data.messages[0].id);
    console.log('\n📱 Check your phone for the voice message!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Full error:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run test
testVoiceRecording();
