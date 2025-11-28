// 测试 Messages API
const axios = require('axios');

async function testMessagesAPI() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyNGE4Y2JlOC1jMzFiLTRlMWEtYTc0NS00ZmQ0NDYxYjNjZTYiLCJpYXQiOjE3NjQwNjQ5NzcsImV4cCI6MTc2NDY2OTc3N30.6hSAPrBcatBkl1gkUe0VicGWcf54WbeGkawqW0ayh28';
    
    console.log('🔐 Testing Messages API...\n');
    
    // First get conversations
    const convResponse = await axios.get('http://localhost:3002/api/messages/conversations', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Conversations:');
    console.log(JSON.stringify(convResponse.data, null, 2));
    
    if (convResponse.data.conversations.length > 0) {
      const conversationId = convResponse.data.conversations[0].id;
      console.log(`\n📨 Getting messages for conversation: ${conversationId}\n`);
      
      const msgResponse = await axios.get(`http://localhost:3002/api/messages?conversationId=${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Messages:');
      console.log(JSON.stringify(msgResponse.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testMessagesAPI();
