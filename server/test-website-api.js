const axios = require('axios');

const API_URL = 'http://localhost:3002/api';

async function testWebsiteAPI() {
  console.log('🧪 Testing Website Management API\n');

  try {
    // 1. Create a website
    console.log('1️⃣ Creating a new website...');
    const createResponse = await axios.post(`${API_URL}/websites`, {
      name: 'E-commerce Store',
      domain: 'shop.example.com',
      description: 'Main e-commerce website',
      phone_number_id: '803320889535856',
      webhook_url: 'https://shop.example.com/webhooks/whatsapp',
      webhook_secret: 'my-secret-key-123'
    });
    
    const websiteId = createResponse.data.website.id;
    console.log('✅ Website created:', createResponse.data.website.name);
    console.log('   ID:', websiteId);
    console.log('   Phone Number ID:', createResponse.data.website.phone_number_id);
    console.log('');

    // 2. Get all websites
    console.log('2️⃣ Fetching all websites...');
    const listResponse = await axios.get(`${API_URL}/websites`);
    console.log(`✅ Found ${listResponse.data.websites.length} website(s)`);
    listResponse.data.websites.forEach(w => {
      console.log(`   - ${w.name} (${w.domain || 'no domain'})`);
    });
    console.log('');

    // 3. Generate API key
    console.log('3️⃣ Generating API key...');
    const keyResponse = await axios.post(`${API_URL}/websites/${websiteId}/keys`, {
      key_name: 'Production Key',
      rate_limit: 1000
    });
    
    const apiKey = keyResponse.data.apiKey;
    console.log('✅ API Key generated:');
    console.log('   Name:', apiKey.key_name);
    console.log('   Key:', apiKey.api_key);
    console.log('   Rate Limit:', apiKey.rate_limit, 'requests/hour');
    console.log('');

    // 4. Get API keys for website
    console.log('4️⃣ Fetching API keys...');
    const keysResponse = await axios.get(`${API_URL}/websites/${websiteId}/keys`);
    console.log(`✅ Found ${keysResponse.data.apiKeys.length} API key(s)`);
    keysResponse.data.apiKeys.forEach(k => {
      console.log(`   - ${k.key_name}: ${k.api_key.substring(0, 20)}...`);
    });
    console.log('');

    // 5. Update website
    console.log('5️⃣ Updating website...');
    await axios.put(`${API_URL}/websites/${websiteId}`, {
      name: 'E-commerce Store (Updated)',
      domain: 'shop.example.com',
      description: 'Updated description',
      phone_number_id: '803320889535856',
      is_active: true
    });
    console.log('✅ Website updated');
    console.log('');

    // 6. Get single website
    console.log('6️⃣ Fetching website details...');
    const detailResponse = await axios.get(`${API_URL}/websites/${websiteId}`);
    console.log('✅ Website details:');
    console.log('   Name:', detailResponse.data.website.name);
    console.log('   Domain:', detailResponse.data.website.domain);
    console.log('   Active:', detailResponse.data.website.is_active);
    console.log('   API Keys:', detailResponse.data.website.ApiKeys?.length || 0);
    console.log('');

    // 7. Get usage stats (will be empty for now)
    console.log('7️⃣ Fetching usage statistics...');
    const statsResponse = await axios.get(`${API_URL}/websites/${websiteId}/stats?period=month`);
    console.log('✅ Usage statistics:');
    console.log('   Total Requests:', statsResponse.data.totals.requests);
    console.log('   Success:', statsResponse.data.totals.success);
    console.log('   Errors:', statsResponse.data.totals.errors);
    console.log('   Success Rate:', statsResponse.data.successRate.toFixed(2) + '%');
    console.log('');

    console.log('🎉 All tests passed!');
    console.log('');
    console.log('📝 Summary:');
    console.log(`   Website ID: ${websiteId}`);
    console.log(`   API Key: ${apiKey.api_key}`);
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Open http://localhost:5173/websites in your browser');
    console.log('   2. You should see the website you just created');
    console.log('   3. Click "Keys" to manage API keys');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('   Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testWebsiteAPI();
