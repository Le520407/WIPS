const axios = require('axios');
require('dotenv').config();

async function testEmbeddedSignupFlow() {
  console.log('🧪 测试 Embedded Signup Token 交换流程\n');
  
  // 检查环境变量
  console.log('📋 环境变量检查:');
  console.log('   META_APP_ID:', process.env.META_APP_ID ? '✅ 已设置' : '❌ 未设置');
  console.log('   META_APP_SECRET:', process.env.META_APP_SECRET ? '✅ 已设置' : '❌ 未设置');
  console.log('');
  
  if (!process.env.META_APP_ID || !process.env.META_APP_SECRET) {
    console.error('❌ 缺少必要的环境变量！');
    console.log('\n请在 .env 文件中设置:');
    console.log('   META_APP_ID=你的应用ID');
    console.log('   META_APP_SECRET=你的应用密钥');
    return;
  }
  
  // 测试 token 交换 API
  console.log('🔄 测试 Token 交换 API...');
  try {
    const testToken = 'test_token_123'; // 这会失败，但能看到 API 响应
    const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: process.env.META_APP_ID,
        client_secret: process.env.META_APP_SECRET,
        fb_exchange_token: testToken
      }
    });
    
    console.log('✅ API 响应:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('⚠️  API 错误响应:', error.response.data);
      console.log('   状态码:', error.response.status);
      
      if (error.response.data.error) {
        console.log('   错误类型:', error.response.data.error.type);
        console.log('   错误消息:', error.response.data.error.message);
      }
    } else {
      console.error('❌ 网络错误:', error.message);
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 说明:');
  console.log('   1. 如果看到 "Invalid OAuth access token" - 这是正常的（测试 token）');
  console.log('   2. 如果看到 "Invalid client_id" - 检查 META_APP_ID');
  console.log('   3. 如果看到 "Invalid client_secret" - 检查 META_APP_SECRET');
  console.log('   4. 真实的 Embedded Signup 会从前端传来有效的 token');
}

testEmbeddedSignupFlow();
