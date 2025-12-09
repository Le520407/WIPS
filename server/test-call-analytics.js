/**
 * Call Analytics API 测试脚本
 * 
 * 测试通话分析和报表功能
 */

const axios = require('axios');

const API_URL = 'http://localhost:3002';

// 测试配置
const TEST_PHONE = '60105520735';

async function testAnalyticsDashboard() {
  console.log('\n=== 测试 1: 获取分析仪表板 ===');
  
  try {
    const periods = ['24h', '7d', '30d'];
    
    for (const period of periods) {
      console.log(`\n测试周期: ${period}`);
      const response = await axios.get(`${API_URL}/api/call/analytics/dashboard`, {
        params: { period }
      });
      
      console.log('✅ 成功获取仪表板');
      console.log('总通话数:', response.data.data.summary.total_calls);
      console.log('接通率:', response.data.data.summary.pickup_rate + '%');
      console.log('平均时长:', response.data.data.summary.avg_duration + 's');
      console.log('每日统计数:', response.data.data.daily_stats.length);
      console.log('最活跃联系人:', response.data.data.top_contacts.length);
    }
  } catch (error) {
    console.error('❌ 错误:', error.response?.data || error.message);
  }
}

async function testCallTrends() {
  console.log('\n=== 测试 2: 获取通话趋势 ===');
  
  try {
    const response = await axios.get(`${API_URL}/api/call/analytics/trends`, {
      params: { days: 30 }
    });
    
    console.log('✅ 成功获取趋势数据');
    console.log('周期天数:', response.data.data.period_days);
    console.log('趋势数据点:', response.data.data.trends.length);
    
    if (response.data.data.trends.length > 0) {
      const latest = response.data.data.trends[response.data.data.trends.length - 1];
      console.log('\n最新数据:');
      console.log('  日期:', latest.date);
      console.log('  通话数:', latest.calls);
      console.log('  接通数:', latest.connected);
      console.log('  未接数:', latest.missed);
      console.log('  接通率:', latest.pickup_rate + '%');
    }
  } catch (error) {
    console.error('❌ 错误:', error.response?.data || error.message);
  }
}

async function testContactAnalytics() {
  console.log('\n=== 测试 3: 获取联系人分析 ===');
  
  try {
    const response = await axios.get(`${API_URL}/api/call/analytics/contact/${TEST_PHONE}`);
    
    console.log('✅ 成功获取联系人分析');
    console.log('电话号码:', response.data.data.phone_number);
    console.log('\n统计数据:');
    console.log('  总通话数:', response.data.data.statistics.total_calls);
    console.log('  来电数:', response.data.data.statistics.inbound_calls);
    console.log('  去电数:', response.data.data.statistics.outbound_calls);
    console.log('  接通率:', response.data.data.statistics.pickup_rate + '%');
    console.log('  总时长:', response.data.data.statistics.total_duration + 's');
    console.log('  平均时长:', response.data.data.statistics.avg_duration + 's');
    
    if (response.data.data.quality) {
      console.log('\n质量数据:');
      console.log('  接通率:', response.data.data.quality.pickup_rate + '%');
      console.log('  连续未接:', response.data.data.quality.consecutive_missed);
      console.log('  已警告:', response.data.data.quality.warning_sent);
    }
    
    if (response.data.data.limit) {
      console.log('\n限制数据:');
      console.log('  今日通话:', response.data.data.limit.daily_count);
      console.log('  每日限制:', response.data.data.limit.daily_limit);
      console.log('  剩余次数:', response.data.data.limit.remaining);
    }
    
    console.log('\n最近通话:', response.data.data.recent_calls.length, '条');
  } catch (error) {
    console.error('❌ 错误:', error.response?.data || error.message);
  }
}

async function testExportData() {
  console.log('\n=== 测试 4: 导出通话数据 ===');
  
  try {
    // 测试 JSON 导出
    console.log('\n测试 JSON 导出...');
    const jsonResponse = await axios.get(`${API_URL}/api/call/analytics/export`, {
      params: { format: 'json' }
    });
    
    console.log('✅ JSON 导出成功');
    console.log('导出记录数:', jsonResponse.data.data.total);
    
    // 测试 CSV 导出
    console.log('\n测试 CSV 导出...');
    const csvResponse = await axios.get(`${API_URL}/api/call/analytics/export`, {
      params: { format: 'csv' },
      responseType: 'text'
    });
    
    console.log('✅ CSV 导出成功');
    const lines = csvResponse.data.split('\n');
    console.log('CSV 行数:', lines.length);
    console.log('CSV 头部:', lines[0]);
  } catch (error) {
    console.error('❌ 错误:', error.response?.data || error.message);
  }
}

async function testPerformanceMetrics() {
  console.log('\n=== 测试 5: 获取性能指标 ===');
  
  try {
    const response = await axios.get(`${API_URL}/api/call/analytics/performance`, {
      params: { period: '7d' }
    });
    
    console.log('✅ 成功获取性能指标');
    console.log('周期:', response.data.data.period);
    console.log('\n指标:');
    console.log('  总通话数:', response.data.data.metrics.total_calls);
    console.log('  接通率:', response.data.data.metrics.pickup_rate + '%');
    console.log('  未接率:', response.data.data.metrics.miss_rate + '%');
    console.log('  质量分数:', response.data.data.metrics.quality_score);
    console.log('  限制使用率:', response.data.data.metrics.limit_usage_percent + '%');
    console.log('\n健康状态:', response.data.data.health_status);
  } catch (error) {
    console.error('❌ 错误:', error.response?.data || error.message);
  }
}

async function runAllTests() {
  console.log('🚀 开始测试 Call Analytics API...\n');
  console.log('API URL:', API_URL);
  console.log('测试电话:', TEST_PHONE);
  
  await testAnalyticsDashboard();
  await testCallTrends();
  await testContactAnalytics();
  await testExportData();
  await testPerformanceMetrics();
  
  console.log('\n✅ 所有测试完成！');
}

// 运行测试
runAllTests().catch(console.error);
