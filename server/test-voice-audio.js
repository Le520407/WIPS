/**
 * Voice vs Audio Messages Test Script
 * 
 * This script tests the difference between:
 * 1. Voice Messages (voice: true) - Voice memos with transcription
 * 2. Basic Audio Messages (voice: false) - Regular audio files
 * 
 * Based on WhatsApp Cloud API official documentation
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';
const TEST_RECIPIENT = process.env.TEST_RECIPIENT_PHONE;

const WHATSAPP_API_URL = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}`;

console.log('🎤 Voice vs Audio Messages Test');
console.log('================================\n');

// Validate environment variables
if (!ACCESS_TOKEN || !PHONE_NUMBER_ID || !TEST_RECIPIENT) {
  console.error('❌ Missing required environment variables:');
  console.error('   - WHATSAPP_ACCESS_TOKEN');
  console.error('   - WHATSAPP_PHONE_NUMBER_ID');
  console.error('   - TEST_RECIPIENT_PHONE');
  process.exit(1);
}

console.log('📋 Configuration:');
console.log(`   API Version: ${API_VERSION}`);
console.log(`   Phone Number ID: ${PHONE_NUMBER_ID}`);
console.log(`   Test Recipient: ${TEST_RECIPIENT}`);
console.log(`   Token: ${ACCESS_TOKEN.substring(0, 20)}...`);
console.log('');

/**
 * Upload media file
 */
async function uploadMedia(filePath, mimeType) {
  try {
    console.log(`📤 Uploading: ${path.basename(filePath)}`);
    console.log(`   MIME Type: ${mimeType}`);
    
    const FormData = require('form-data');
    const form = new FormData();
    
    form.append('file', fs.createReadStream(filePath));
    form.append('type', mimeType);
    form.append('messaging_product', 'whatsapp');
    
    const response = await axios.post(
      `${WHATSAPP_API_URL}/media`,
      form,
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          ...form.getHeaders()
        }
      }
    );
    
    console.log(`✅ Upload successful!`);
    console.log(`   Media ID: ${response.data.id}`);
    return response.data.id;
  } catch (error) {
    console.error('❌ Upload failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Send voice message (voice: true)
 */
async function sendVoiceMessage(mediaId) {
  try {
    console.log('\n🎤 Sending Voice Message (voice: true)...');
    
    const messageBody = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: TEST_RECIPIENT,
      type: 'audio',
      audio: {
        id: mediaId,
        voice: true  // Voice message with transcription
      }
    };
    
    console.log('📨 Request body:', JSON.stringify(messageBody, null, 2));
    
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
    
    console.log('✅ Voice message sent successfully!');
    console.log(`   Message ID: ${response.data.messages[0].id}`);
    console.log(`   WhatsApp ID: ${response.data.contacts[0].wa_id}`);
    console.log('\n📱 User will see:');
    console.log('   - Microphone icon 🎤');
    console.log('   - Your business profile picture');
    console.log('   - Auto-download enabled');
    console.log('   - Voice transcription (if user enabled)');
    console.log('   - Play icon (if ≤ 512KB) or download icon (if > 512KB)');
    
    return response.data;
  } catch (error) {
    console.error('❌ Failed to send voice message:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Send basic audio message (voice: false)
 */
async function sendAudioMessage(mediaId) {
  try {
    console.log('\n🎵 Sending Basic Audio Message (voice: false)...');
    
    const messageBody = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: TEST_RECIPIENT,
      type: 'audio',
      audio: {
        id: mediaId,
        voice: false  // Basic audio message
      }
    };
    
    console.log('📨 Request body:', JSON.stringify(messageBody, null, 2));
    
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
    
    console.log('✅ Audio message sent successfully!');
    console.log(`   Message ID: ${response.data.messages[0].id}`);
    console.log(`   WhatsApp ID: ${response.data.contacts[0].wa_id}`);
    console.log('\n📱 User will see:');
    console.log('   - Music icon 🎵');
    console.log('   - Download icon ⬇️');
    console.log('   - Manual download required');
    console.log('   - No transcription');
    console.log('   - Play icon only if auto-download enabled');
    
    return response.data;
  } catch (error) {
    console.error('❌ Failed to send audio message:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Main test function
 */
async function runTests() {
  try {
    console.log('\n🧪 Starting Tests...\n');
    
    // Test 1: Voice Message with OGG file
    console.log('═══════════════════════════════════════');
    console.log('Test 1: Voice Message (OGG + OPUS)');
    console.log('═══════════════════════════════════════');
    
    // Note: You need to provide an actual OGG file with OPUS codec
    // For testing, you can record one using the Messages page
    const voiceFilePath = './test-voice.ogg';
    
    if (fs.existsSync(voiceFilePath)) {
      const voiceMediaId = await uploadMedia(voiceFilePath, 'audio/ogg');
      await sendVoiceMessage(voiceMediaId);
    } else {
      console.log('⚠️  Voice file not found: test-voice.ogg');
      console.log('   Please record a voice message using the Messages page');
      console.log('   and save it as test-voice.ogg in the server directory');
    }
    
    // Wait 2 seconds between tests
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Basic Audio Message with MP3 file
    console.log('\n═══════════════════════════════════════');
    console.log('Test 2: Basic Audio Message (MP3)');
    console.log('═══════════════════════════════════════');
    
    const audioFilePath = './test-audio.mp3';
    
    if (fs.existsSync(audioFilePath)) {
      const audioMediaId = await uploadMedia(audioFilePath, 'audio/mpeg');
      await sendAudioMessage(audioMediaId);
    } else {
      console.log('⚠️  Audio file not found: test-audio.mp3');
      console.log('   Please provide an MP3 file for testing');
    }
    
    console.log('\n═══════════════════════════════════════');
    console.log('✅ All tests completed!');
    console.log('═══════════════════════════════════════');
    
    console.log('\n📊 Summary:');
    console.log('   Voice Message: OGG (OPUS) with voice: true');
    console.log('   - Auto-download, transcription, microphone icon');
    console.log('   Audio Message: MP3 with voice: false');
    console.log('   - Manual download, no transcription, music icon');
    
    console.log('\n💡 Key Differences:');
    console.log('   1. Voice messages require OGG + OPUS codec');
    console.log('   2. Voice messages support transcription');
    console.log('   3. Voice messages auto-download');
    console.log('   4. Audio messages support multiple formats');
    console.log('   5. Audio messages require manual download');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
runTests();
