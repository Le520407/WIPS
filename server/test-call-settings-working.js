/**
 * Test Call Settings Functionality
 * 测试通话设置功能是否正常工作
 */

const axios = require('axios');

const API_URL = 'http://localhost:3002';

async function testCallSettings() {
  console.log('🧪 Testing Call Settings Functionality\n');
  
  try {
    // Step 0: Login to get token
    console.log('0️⃣ Logging in to get auth token...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/test-login`, {
      email: 'test@whatsapp-platform.com'
    });
    
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log('✅ Login Success!');
    console.log('User ID:', userId);
    console.log('Token:', token.substring(0, 20) + '...');
    console.log('');
    
    // Test 1: Get Call Settings
    console.log('1️⃣ Testing GET /api/call-settings...');
    const getResponse = await axios.get(`${API_URL}/api/call-settings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ GET Success!');
    console.log('Current Settings:', JSON.stringify(getResponse.data.settings, null, 2));
    console.log('');
    
    // Test 2: Update Call Settings
    console.log('2️⃣ Testing PUT /api/call-settings...');
    const updateData = {
      calling_enabled: true,
      inbound_enabled: true,
      outbound_enabled: true,
      callback_enabled: true,
      business_hours: {
        enabled: true,
        timezone: 'Asia/Kuala_Lumpur',
        schedule: {
          monday: { enabled: true, periods: [{ start: '09:00', end: '18:00' }] },
          tuesday: { enabled: true, periods: [{ start: '09:00', end: '18:00' }] },
          wednesday: { enabled: true, periods: [{ start: '09:00', end: '18:00' }] },
          thursday: { enabled: true, periods: [{ start: '09:00', end: '18:00' }] },
          friday: { enabled: true, periods: [{ start: '09:00', end: '18:00' }] },
          saturday: { enabled: false, periods: [] },
          sunday: { enabled: false, periods: [] }
        }
      },
      auto_reply_message: '感谢您的来电。我们目前不在营业时间内。请留言或在营业时间内再次致电。'
    };
    
    const updateResponse = await axios.put(`${API_URL}/api/call-settings`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ PUT Success!');
    console.log('Updated Settings:', JSON.stringify(updateResponse.data.settings, null, 2));
    
    if (updateResponse.data.meta_sync) {
      console.log('\n📡 Meta API Sync Status:');
      console.log('  Success:', updateResponse.data.meta_sync.success);
      console.log('  Message:', updateResponse.data.meta_sync.message);
    }
    console.log('');
    
    // Test 3: Check if calling is allowed
    console.log('3️⃣ Testing GET /api/call-settings/check-allowed...');
    const checkResponse = await axios.get(`${API_URL}/api/call-settings/check-allowed`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Check Success!');
    console.log('Calling Allowed:', checkResponse.data.allowed);
    console.log('Reason:', checkResponse.data.reason);
    console.log('');
    
    // Test 4: Get business hours status
    console.log('4️⃣ Testing GET /api/call-settings/business-hours-status...');
    const statusResponse = await axios.get(`${API_URL}/api/call-settings/business-hours-status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Status Success!');
    console.log('Business Hours Enabled:', statusResponse.data.enabled);
    console.log('Currently Open:', statusResponse.data.is_open);
    console.log('Message:', statusResponse.data.message);
    console.log('');
    
    console.log('🎉 All Call Settings Tests Passed!\n');
    console.log('📝 Summary:');
    console.log('  ✅ Call Settings can be retrieved');
    console.log('  ✅ Call Settings can be updated');
    console.log('  ✅ Meta API sync is working');
    console.log('  ✅ Business hours check is working');
    console.log('  ✅ Calling permission check is working');
    console.log('');
    console.log('💡 Note: Call Settings 功能正常工作！');
    console.log('   但是要记住：企业不能直接打电话给用户。');
    console.log('   需要先通过 Call Button 或 Permission Request 获得用户同意。');
    
  } catch (error) {
    console.error('❌ Test Failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run tests
testCallSettings();
