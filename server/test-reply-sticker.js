/**
 * Test script for replying with sticker
 * 
 * This demonstrates the "reply + sticker" feature where you can
 * send a sticker as a reply to any message (text, image, video, etc.)
 */

require('dotenv').config({ path: '.env' });
const axios = require('axios');

const API_URL = 'http://localhost:3002/api';
const TEST_PHONE = '60105520735'; // Replace with your test phone number

// Get token from command line or use default
const TOKEN = process.argv[2] || 'your_token_here';

// Example sticker URLs
const STICKER_URLS = [
  'https://raw.githubusercontent.com/WhatsApp/stickers/main/Android/app/src/main/assets/1/01_Cuppy_smile.webp',
  'https://raw.githubusercontent.com/WhatsApp/stickers/main/Android/app/src/main/assets/1/02_Cuppy_lol.webp',
  'https://raw.githubusercontent.com/WhatsApp/stickers/main/Android/app/src/main/assets/1/03_Cuppy_rofl.webp',
];

async function getLastMessage() {
  try {
    console.log('📥 Fetching last message...\n');
    
    const response = await axios.get(`${API_URL}/messages/conversations`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    const conversations = response.data.conversations;
    if (conversations.length === 0) {
      console.log('❌ No conversations found');
      return null;
    }
    
    // Get the first conversation
    const conv = conversations[0];
    console.log(`📱 Found conversation: ${conv.phoneNumber}`);
    
    // Get messages from this conversation
    const messagesResponse = await axios.get(`${API_URL}/messages/${conv.id}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    const messages = messagesResponse.data.messages;
    if (messages.length === 0) {
      console.log('❌ No messages found');
      return null;
    }
    
    // Get the last message from the user (not from us)
    const userMessages = messages.filter(msg => msg.fromNumber !== '803320889535856');
    if (userMessages.length === 0) {
      console.log('❌ No messages from user found');
      return null;
    }
    
    const lastMessage = userMessages[userMessages.length - 1];
    
    console.log('\n📨 Last message from user:');
    console.log('   Type:', lastMessage.type);
    console.log('   Content:', lastMessage.content?.substring(0, 50) || '[No content]');
    console.log('   Message ID:', lastMessage.messageId);
    console.log('   Has Media:', !!lastMessage.mediaUrl);
    
    return lastMessage;
  } catch (error) {
    console.error('❌ Error fetching messages:', error.response?.data || error.message);
    return null;
  }
}

async function replyWithSticker(messageId, stickerUrl, messageType) {
  try {
    console.log(`\n📤 Replying to ${messageType} message with sticker...`);
    console.log('   Message ID:', messageId);
    console.log('   Sticker URL:', stickerUrl.substring(0, 60) + '...');
    
    const response = await axios.post(
      `${API_URL}/messages/send-sticker`,
      {
        to: TEST_PHONE,
        stickerUrl: stickerUrl,
        contextMessageId: messageId
      },
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n✅ Sticker reply sent successfully!');
    console.log('   WhatsApp Message ID:', response.data.result.messages[0].id);
    console.log('   Database ID:', response.data.message.id);
    
    // Show context information
    if (response.data.message.contextMessageType) {
      console.log('\n📎 Context Information:');
      console.log('   Original Type:', response.data.message.contextMessageType);
      console.log('   Original Content:', response.data.message.contextMessageContent?.substring(0, 50));
      console.log('   Has Media URL:', !!response.data.message.contextMessageMediaUrl);
    }
    
    return response.data;
  } catch (error) {
    console.error('\n❌ Error sending sticker reply:', error.response?.data || error.message);
    return null;
  }
}

async function testReplyWithSticker() {
  console.log('🧪 Testing Reply with Sticker\n');
  console.log('=' .repeat(60));
  
  // Step 1: Get the last message
  const lastMessage = await getLastMessage();
  
  if (!lastMessage) {
    console.log('\n⚠️  No message to reply to. Please send a message first.');
    console.log('\nInstructions:');
    console.log('1. Send any message from your phone to the WhatsApp Business number');
    console.log('   - Text message');
    console.log('   - Image');
    console.log('   - Video');
    console.log('   - Document');
    console.log('   - Location');
    console.log('   - etc.');
    console.log('2. Run this script again');
    return;
  }
  
  // Step 2: Choose a random sticker
  const randomSticker = STICKER_URLS[Math.floor(Math.random() * STICKER_URLS.length)];
  
  // Step 3: Send the sticker as a reply
  const result = await replyWithSticker(lastMessage.messageId, randomSticker, lastMessage.type);
  
  if (result) {
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test completed successfully!');
    console.log('\n📱 Check your WhatsApp to see:');
    console.log('   1. The sticker message');
    console.log('   2. The quoted original message above the sticker');
    console.log('   3. The original message preview (text/image/video/etc.)');
    console.log('\n💡 This is the "reply + sticker" feature!');
    console.log('   You can reply to ANY message type with a sticker.');
  } else {
    console.log('\n' + '='.repeat(60));
    console.log('❌ Test failed');
  }
}

// Run the test
testReplyWithSticker();
