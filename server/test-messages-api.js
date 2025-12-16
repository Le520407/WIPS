const axios = require('axios');

async function testMessagesAPI() {
  try {
    // 使用你的实际 token
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyNGE4Y2JlOC1jMzFiLTRlMWEtYTc0NS00ZmQ0NDYxYjNjZTYiLCJlbWFpbCI6InRlc3RAd2hhdHNhcHAtcGxhdGZvcm0uY29tIiwiaWF0IjoxNzM0MzI0NTI5fQ.Oj-Oj8Oj-Oj8Oj-Oj8Oj-Oj8Oj-Oj8Oj-Oj8Oj-Oj8Oj-Oj8'; // 替换为你的实际 token
    
    // 获取对话列表
    console.log('📋 Fetching conversations...\n');
    const conversationsResponse = await axios.get('http://localhost:3000/api/messages/conversations', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const conversations = conversationsResponse.data.conversations;
    console.log(`Found ${conversations.length} conversations\n`);
    
    if (conversations.length === 0) {
      console.log('❌ No conversations found');
      return;
    }
    
    // 获取第一个对话的消息
    const firstConv = conversations[0];
    console.log(`📨 Fetching messages for conversation: ${firstConv.phoneNumber}\n`);
    
    const messagesResponse = await axios.get(`http://localhost:3000/api/messages/${firstConv.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const messages = messagesResponse.data.messages;
    console.log(`Found ${messages.length} messages\n`);
    
    // 查找有 reaction 的消息
    console.log('🔍 Messages with reactions:\n');
    console.log('='.repeat(80));
    
    let foundReactions = false;
    messages.forEach((msg, index) => {
      if (msg.reactionEmoji) {
        foundReactions = true;
        console.log(`\n${index + 1}. Message ID: ${msg.id}`);
        console.log(`   Type: ${msg.type}`);
        console.log(`   Content: ${msg.content?.substring(0, 50)}`);
        console.log(`   ⭐ reactionEmoji: ${msg.reactionEmoji}`);
        console.log(`   reactionMessageId: ${msg.reactionMessageId}`);
        console.log(`   From: ${msg.fromNumber}`);
        console.log(`   To: ${msg.toNumber}`);
      }
    });
    
    if (!foundReactions) {
      console.log('\n❌ No messages with reactions found in API response');
      console.log('\nShowing all messages:');
      messages.forEach((msg, index) => {
        console.log(`\n${index + 1}. ${msg.type}: ${msg.content?.substring(0, 30)}`);
        console.log(`   Has reactionEmoji field? ${msg.hasOwnProperty('reactionEmoji')}`);
        console.log(`   reactionEmoji value: ${msg.reactionEmoji}`);
      });
    } else {
      console.log('\n' + '='.repeat(80));
      console.log('\n✅ Found messages with reactions in API response!');
      console.log('   Frontend should display these reaction badges.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testMessagesAPI();
