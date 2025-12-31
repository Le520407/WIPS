const axios = require('axios');

async function testEmbeddedSignupEndpoint() {
  console.log('🧪 测试 Embedded Signup Endpoint\n');
  
  const testCases = [
    {
      name: '空 code',
      data: { code: '' }
    },
    {
      name: '无效 code',
      data: { code: 'invalid_test_code' }
    },
    {
      name: '缺少 code',
      data: {}
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📝 测试: ${testCase.name}`);
    console.log('   发送数据:', JSON.stringify(testCase.data));
    
    try {
      const response = await axios.post(
        'http://localhost:3299/api/auth/embedded-signup',
        testCase.data,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      console.log('   ✅ 响应:', response.data);
    } catch (error) {
      if (error.response) {
        console.log('   ❌ 错误响应:');
        console.log('      状态码:', error.response.status);
        console.log('      错误:', error.response.data);
      } else {
        console.log('   ❌ 网络错误:', error.message);
      }
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💡 提示:');
  console.log('   - 400 错误通常表示 Meta API 调用失败');
  console.log('   - 检查后端日志查看详细错误信息');
  console.log('   - 确保 META_APP_ID 和 META_APP_SECRET 正确');
}

testEmbeddedSignupEndpoint();
