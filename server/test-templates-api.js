// 测试 Templates API
const axios = require('axios');

async function testTemplatesAPI() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyNGE4Y2JlOC1jMzFiLTRlMWEtYTc0NS00ZmQ0NDYxYjNjZTYiLCJpYXQiOjE3NjQwNjQ5NzcsImV4cCI6MTc2NDY2OTc3N30.6hSAPrBcatBkl1gkUe0VicGWcf54WbeGkawqW0ayh28';
    
    console.log('🔐 Testing Templates API...\n');
    
    const response = await axios.get('http://localhost:3002/api/templates', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Templates API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testTemplatesAPI();
