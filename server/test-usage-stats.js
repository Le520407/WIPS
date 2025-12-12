/**
 * Usage Statistics API Test
 * 使用统计 API 测试
 * 
 * 测试 Phase 3 的使用统计功能
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

// 测试配置
const config = {
  headers: {
    'Content-Type': 'application/json',
  },
};

async function testUsageStats() {
  console.log('\n🧪 Testing Usage Statistics API...\n');
  console.log('='.repeat(60));

  try {
    // Test 1: 获取总体概览
    console.log('\n📊 Test 1: Get Overview Stats');
    console.log('-'.repeat(60));
    const overviewResponse = await axios.get(
      `${BASE_URL}/api/stats/overview?days=7`,
      config
    );
    console.log('✅ Overview stats retrieved successfully');
    console.log('Response:', JSON.stringify(overviewResponse.data, null, 2));

    // Test 2: 获取实时统计
    console.log('\n⚡ Test 2: Get Realtime Stats');
    console.log('-'.repeat(60));
    const realtimeResponse = await axios.get(
      `${BASE_URL}/api/stats/realtime`,
      config
    );
    console.log('✅ Realtime stats retrieved successfully');
    console.log('Response:', JSON.stringify(realtimeResponse.data, null, 2));

    // Test 3: 获取消息趋势
    console.log('\n📈 Test 3: Get Message Trends');
    console.log('-'.repeat(60));
    const trendsResponse = await axios.get(
      `${BASE_URL}/api/stats/trends/messages?days=30`,
      config
    );
    console.log('✅ Message trends retrieved successfully');
    console.log('Response:', JSON.stringify(trendsResponse.data, null, 2));

    // Test 4: 获取错误日志
    console.log('\n❌ Test 4: Get Error Logs');
    console.log('-'.repeat(60));
    const errorsResponse = await axios.get(
      `${BASE_URL}/api/stats/errors?limit=10`,
      config
    );
    console.log('✅ Error logs retrieved successfully');
    console.log('Response:', JSON.stringify(errorsResponse.data, null, 2));

    // Test 5: 获取网站统计（如果有网站）
    if (overviewResponse.data.data.websites.total > 0) {
      console.log('\n🌐 Test 5: Get Website Stats');
      console.log('-'.repeat(60));
      
      // 获取第一个网站
      const websitesResponse = await axios.get(
        `${BASE_URL}/api/websites`,
        config
      );
      
      if (websitesResponse.data.success && websitesResponse.data.data && websitesResponse.data.data.length > 0) {
        const websiteId = websitesResponse.data.data[0].id;
        const websiteStatsResponse = await axios.get(
          `${BASE_URL}/api/stats/websites/${websiteId}?days=30`,
          config
        );
        console.log('✅ Website stats retrieved successfully');
        console.log('Response:', JSON.stringify(websiteStatsResponse.data, null, 2));
      } else {
        console.log('⚠️  No websites found to test stats');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests passed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    process.exit(1);
  }
}

// 运行测试
testUsageStats();
