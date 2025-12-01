/**
 * Test script for replying to media messages
 * 
 * This script demonstrates how to reply to different types of messages:
 * - Text messages
 * - Image messages
 * - Video messages
 * - Document messages
 * - Sticker messages
 * - Location messages
 * - Contact messages
 */

require('dotenv').config({ path: '.env' });
const axios = require('axios');

const API_URL = 'http://localhost:3002/api';
const TEST_PHONE = '60105520735'; // Replace with your test phone number

// Get token from command line or use default
const TOKEN = process.argv[2] || 'your_token_here';

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

async function replyToMessage(messageId, replyText, messageType) {
  try {
    console.log(`\n📤 Replying to ${messageType} message...`);
    console.log('   Message ID:', messageId);
    console.log('   Reply:', replyText);
    
    const response = await axios.post(
      `${API_URL}/messages/send-reply`,
      {
        to: TEST_PHONE,
        message: replyText,
        contextMessageId: messageId
      },
      {
        headers: {
          'Authorization': `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n✅ Reply sent successfully!');
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
    console.error('\n❌ Error sending reply:', error.response?.data || error.message);
    return null;
  }
}

async function testReplyToMedia() {
  console.log('🧪 Testing Reply to Media Messages\n');
  console.log('=' .repeat(60));
  
  // Step 1: Get the last message
  const lastMessage = await getLastMessage();
  
  if (!lastMessage) {
    console.log('\n⚠️  No message to reply to. Please send a message first.');
    console.log('\nInstructions:');
    console.log('1. Send a message from your phone to the WhatsApp Business number');
    console.log('2. The message can be:');
    console.log('   - Text message');
    console.log('   - Image with caption');
    console.log('   - Video');
    console.log('   - Document');
    console.log('   - Sticker');
    console.log('   - Location');
    console.log('   - Contact');
    console.log('3. Run this script again');
    return;
  }
  
  // Step 2: Reply based on message type
  let replyText = '';
  
  switch (lastMessage.type) {
    case 'text':
      replyText = `Got your text message: "${lastMessage.content}"`;
      break;
    case 'image':
      replyText = '📸 Thanks for the image!';
      break;
    case 'video':
      replyText = '🎥 Thanks for the video!';
      break;
    case 'audio':
      replyText = '🎵 Thanks for the audio!';
      break;
    case 'document':
      replyText = '📄 Thanks for the document!';
      break;
    case 'sticker':
      replyText = '😄 Nice sticker!';
      break;
    case 'location':
      replyText = '📍 Thanks for sharing your location!';
      break;
    case 'contacts':
      replyText = '👤 Thanks for the contact!';
      break;
    default:
      replyText = `Got your ${lastMessage.type} message!`;
  }
  
  // Step 3: Send the reply
  const result = await replyToMessage(lastMessage.messageId, replyText, lastMessage.type);
  
  if (result) {
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test completed successfully!');
    console.log('\n📱 Check your WhatsApp to see:');
    console.log('   1. The reply message');
    console.log('   2. The quoted original message');
    console.log('   3. Media preview (if applicable)');
  } else {
    console.log('\n' + '='.repeat(60));
    console.log('❌ Test failed');
  }
}

// Run the test
testReplyToMedia();
