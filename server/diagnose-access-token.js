const axios = require('axios');
require('dotenv').config();

async function diagnoseToken() {
  try {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    
    if (!token) {
      console.log('❌ WHATSAPP_ACCESS_TOKEN not found in .env');
      return;
    }
    
    console.log('🔍 诊断 Access Token\n');
    console.log('Token 长度:', token.length, 'chars');
    console.log('Token 预览:', token.substring(0, 50) + '...\n');
    
    // 1. 检查 token 信息
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Token 详细信息:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    try {
      const debugResponse = await axios.get('https://graph.facebook.com/v18.0/debug_token', {
        params: {
          input_token: token,
          access_token: token
        }
      });
      
      const data = debugResponse.data.data;
      
      console.log('✅ Token 有效！\n');
      console.log('📋 Token 类型:', data.type || 'Unknown');
      console.log('📱 App ID:', data.app_id);
      console.log('👤 User ID:', data.user_id);
      console.log('📅 发行时间:', data.issued_at ? new Date(data.issued_at * 1000).toLocaleString('zh-CN') : 'Unknown');
      
      if (data.expires_at) {
        const expiresAt = new Date(data.expires_at * 1000);
        const now = new Date();
        const daysLeft = Math.floor((expiresAt - now) / (1000 * 60 * 60 * 24));
        
        console.log('⏰ 过期时间:', expiresAt.toLocaleString('zh-CN'));
        console.log('⚠️  剩余天数:', daysLeft, '天');
        
        if (daysLeft < 30) {
          console.log('\n🚨 警告: Token 即将过期！');
        }
      } else {
        console.log('✅ 过期时间: Never (永久有效)');
      }
      
      console.log('\n📝 权限 (Scopes):');
      if (data.scopes && data.scopes.length > 0) {
        data.scopes.forEach(scope => {
          console.log('   ✓', scope);
        });
      } else {
        console.log('   (无权限信息)');
      }
      
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      // 2. 测试 WhatsApp API 访问
      console.log('🧪 测试 WhatsApp API 访问:\n');
      
      const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
      const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      
      if (wabaId) {
        try {
          const wabaResponse = await axios.get(
            `https://graph.facebook.com/v18.0/${wabaId}`,
            {
              params: { access_token: token },
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          console.log('✅ WABA 访问成功');
          console.log('   WABA ID:', wabaResponse.data.id);
          console.log('   Name:', wabaResponse.data.name || 'N/A');
        } catch (error) {
          console.log('❌ WABA 访问失败:', error.response?.data?.error?.message || error.message);
        }
      }
      
      if (phoneId) {
        try {
          const phoneResponse = await axios.get(
            `https://graph.facebook.com/v18.0/${phoneId}`,
            {
              params: { access_token: token },
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          console.log('✅ Phone Number 访问成功');
          console.log('   Phone ID:', phoneResponse.data.id);
          console.log('   Display:', phoneResponse.data.display_phone_number || 'N/A');
          console.log('   Status:', phoneResponse.data.verified_name || 'N/A');
        } catch (error) {
          console.log('❌ Phone Number 访问失败:', error.response?.data?.error?.message || error.message);
        }
      }
      
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      // 3. 建议
      console.log('💡 建议:\n');
      
      if (data.expires_at) {
        console.log('⚠️  你的 Token 会过期！');
        console.log('\n要创建永久 Token，请按以下步骤：');
        console.log('1. 访问 Meta Business Suite: https://business.facebook.com/');
        console.log('2. 点击左上角的设置图标 (齿轮)');
        console.log('3. 左侧菜单选择 "System Users"');
        console.log('4. 创建或选择一个 System User (角色选 Admin)');
        console.log('5. 点击 "Generate Token"');
        console.log('6. 选择你的 App');
        console.log('7. Token Expiration 选择 "Never"');
        console.log('8. 勾选权限:');
        console.log('   - business_management');
        console.log('   - whatsapp_business_management');
        console.log('   - whatsapp_business_messaging');
        console.log('9. 点击 "Generate Token" 并复制');
        console.log('10. 更新 .env 文件中的 WHATSAPP_ACCESS_TOKEN');
      } else {
        console.log('✅ 你的 Token 是永久有效的！');
        console.log('   如果还是遇到过期问题，可能是：');
        console.log('   1. System User 的权限被修改了');
        console.log('   2. App 的权限被撤销了');
        console.log('   3. Business Portfolio 的设置改变了');
      }
      
    } catch (error) {
      console.log('❌ Token 验证失败！\n');
      
      if (error.response?.data?.error) {
        const err = error.response.data.error;
        console.log('错误代码:', err.code);
        console.log('错误信息:', err.message);
        console.log('错误类型:', err.type);
        
        if (err.code === 190) {
          console.log('\n🚨 Token 已过期或无效！');
          console.log('\n请按以下步骤创建新的永久 Token：');
          console.log('1. 访问 https://business.facebook.com/');
          console.log('2. Settings > System Users');
          console.log('3. 创建 Admin System User');
          console.log('4. Generate Token (选择 "Never" expire)');
          console.log('5. 勾选所有 WhatsApp 相关权限');
        }
      } else {
        console.log('错误:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ 诊断失败:', error.message);
  }
}

diagnoseToken();
