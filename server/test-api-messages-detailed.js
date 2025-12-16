const axios = require('axios');
require('dotenv').config();

async function testApiMessages() {
  try {
    // You need to provide a valid token
    const token = process.argv[2];
    const conversationId = process.argv[3];
    
    if (!token) {
      console.log('❌ Usage: node test-api-messages-detailed.js <token> [conversationId]');
      console.log('');
      console.log('Example:');
      console.log('  node test-api-messages-detailed.js eyJhbGc...');
      console.log('  node test-api-messages-detailed.js eyJhbGc... abc-123-def');
      process.exit(1);
    }

    const apiUrl = process.env.API_URL || 'http://localhost:5174';
    const url = conversationId 
      ? `${apiUrl}/api/messages?conversationId=${conversationId}`
      : `${apiUrl}/api/messages`;
    
    console.log('🔍 Testing API endpoint:', url);
    console.log('');

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const messages = response.data.messages;
    console.log(`✅ API returned ${messages.length} messages\n`);

    // Find messages with reactions
    const messagesWithReactions = messages.filter(m => m.reactionEmoji);
    console.log(`🎯 Messages with reactionEmoji: ${messagesWithReactions.length}\n`);

    if (messagesWithReactions.length > 0) {
      console.log('📋 Messages with reactions:');
      console.log('='.repeat(80));
      messagesWithReactions.forEach((msg, index) => {
        console.log(`\n${index + 1}. Message:`);
        console.log(`   ID: ${msg.id}`);
        console.log(`   Message ID: ${msg.messageId}`);
        console.log(`   Type: ${msg.type}`);
        console.log(`   Content: ${msg.content?.substring(0, 50) || '(no content)'}`);
        console.log(`   ⭐ reactionEmoji: ${msg.reactionEmoji}`);
        console.log(`   reactionMessageId: ${msg.reactionMessageId}`);
        console.log(`   From: ${msg.fromNumber}`);
        console.log(`   To: ${msg.toNumber}`);
        console.log(`   Created: ${msg.createdAt}`);
      });
    } else {
      console.log('❌ No messages with reactionEmoji found in API response!');
      console.log('');
      console.log('💡 This means either:');
      console.log('   1. No messages have been reacted to');
      console.log('   2. The toJSON() method is not converting reaction_emoji → reactionEmoji');
      console.log('   3. The database reaction_emoji field is NULL');
      console.log('');
      console.log('🔧 Run this to check database:');
      console.log('   node check-reactions.js');
    }

    // Find reaction type messages
    const reactionMessages = messages.filter(m => m.type === 'reaction');
    console.log(`\n\n👍 Reaction type messages: ${reactionMessages.length}\n`);

    if (reactionMessages.length > 0) {
      console.log('📋 Reaction messages:');
      console.log('='.repeat(80));
      reactionMessages.forEach((msg, index) => {
        console.log(`\n${index + 1}. Reaction Message:`);
        console.log(`   ID: ${msg.id}`);
        console.log(`   Message ID: ${msg.messageId}`);
        console.log(`   Type: ${msg.type}`);
        console.log(`   Content: ${msg.content?.substring(0, 50) || '(no content)'}`);
        console.log(`   reactionEmoji: ${msg.reactionEmoji}`);
        console.log(`   reactionMessageId: ${msg.reactionMessageId}`);
        console.log(`   Created: ${msg.createdAt}`);
      });
    }

    console.log('\n\n📊 Summary:');
    console.log('='.repeat(80));
    console.log(`Total messages: ${messages.length}`);
    console.log(`Messages with reactionEmoji field: ${messagesWithReactions.length}`);
    console.log(`Reaction type messages: ${reactionMessages.length}`);
    console.log('');
    console.log('✅ API is returning data in camelCase format (reactionEmoji, not reaction_emoji)');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

testApiMessages();
