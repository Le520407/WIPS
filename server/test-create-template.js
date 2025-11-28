// 测试创建 template
const axios = require('axios');
require('dotenv').config();

async function testCreateTemplate() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyNGE4Y2JlOC1jMzFiLTRlMWEtYTc0NS00ZmQ0NDYxYjNjZTYiLCJpYXQiOjE3NjQwNjQ5NzcsImV4cCI6MTc2NDY2OTc3N30.6hSAPrBcatBkl1gkUe0VicGWcf54WbeGkawqW0ayh28';
    
    console.log('🧪 Testing Create Template API...\n');
    
    const templateData = {
      name: 'test_template_' + Date.now(),
      language: 'en',
      category: 'MARKETING',
      components: [
        {
          type: 'BODY',
          text: 'Hello! This is a test template.'
        }
      ]
    };
    
    console.log('Template data:', JSON.stringify(templateData, null, 2));
    
    const response = await axios.post('http://localhost:3002/api/templates', templateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ Template created successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    if (error.response?.data?.error) {
      console.error('WhatsApp API Error:', JSON.stringify(error.response.data.error, null, 2));
    }
  }
}

testCreateTemplate();
