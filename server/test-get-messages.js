// 测试获取消息 API
const axios = require('axios');

async function testGetMessages() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyNGE4Y2JlOC1jMzFiLTRlMWEtYTc0NS00ZmQ0NDYxYjNjZTYiLCJpYXQiOjE3NjQwNjQ5NzcsImV4cCI6MTc2NDY2OTc3N30.6hSAPrBcatBkl1gkUe0VicGWcf54WbeGkawqW0ayh28';
    
    console.log('🔐 Testing Get Messages API...\n');
    
    // 先获取 conversations
    const convResponse = await axios.get('http://localhost:3002/api/messages/conversations', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Conversations:');
    console.log(JSON.stringify(convResponse.data.conversations, null, 2));
    
    if (convResponse.data.conversations.length > 0) {
      const conv = convResponse.data.conversations[0];
      console.log(`\n📨 Getting messages for conversation: ${conv.id}`);
      console.log(`   Phone: ${conv.phoneNumber}\n`);
      
      const msgResponse = await axios.get(`http://localhost:3002/api/messages?conversationId=${conv.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Messages:');
      msgResponse.data.messages.forEach((msg, index) => {
        console.log(`\n${index + 1}. ${msg.status === 'sent' ? '→' : '←'} ${msg.content}`);
        console.log(`   From: ${msg.fromNumber}`);
        console.log(`   To: ${msg.toNumber}`);
        console.log(`   Status: ${msg.status}`);
        console.log(`   Type: ${msg.type}`);
      });
      
      console.log(`\n📊 Total messages: ${msgResponse.data.messages.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testGetMessages();
