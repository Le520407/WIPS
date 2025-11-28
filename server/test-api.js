// 测试 API 获取 conversations
const axios = require('axios');

async function testAPI() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyNGE4Y2JlOC1jMzFiLTRlMWEtYTc0NS00ZmQ0NDYxYjNjZTYiLCJpYXQiOjE3NjQwNjQ5NzcsImV4cCI6MTc2NDY2OTc3N30.6hSAPrBcatBkl1gkUe0VicGWcf54WbeGkawqW0ayh28';
    
    console.log('🔐 Testing API with test@whatsapp-platform.com token...\n');
    
    const response = await axios.get('http://localhost:3002/api/messages/conversations', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Conversations API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAPI();
