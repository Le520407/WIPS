require('dotenv').config();
const { Sequelize } = require('sequelize');
const axios = require('axios');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
  }
);

async function testUserTokens() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Get all users with tokens
    const [users] = await sequelize.query(`
      SELECT 
        id,
        email,
        phone_number_id,
        access_token,
        whatsapp_account_id
      FROM users
      WHERE access_token IS NOT NULL
      ORDER BY "createdAt" DESC;
    `);

    console.log(`📋 Found ${users.length} users with access tokens\n`);

    for (const user of users) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Testing: ${user.email}`);
      console.log(`Phone Number ID: ${user.phone_number_id}`);
      console.log(`Token Length: ${user.access_token.length} chars`);
      console.log('');

      // Test the token
      try {
        const response = await axios.get(
          `https://graph.facebook.com/v18.0/${user.phone_number_id}`,
          {
            headers: {
              'Authorization': `Bearer ${user.access_token}`
            }
          }
        );
        
        console.log('✅ TOKEN IS VALID!');
        console.log(`   Phone: ${response.data.display_phone_number}`);
        console.log(`   Name: ${response.data.verified_name}`);
        console.log(`   Quality: ${response.data.quality_rating || 'N/A'}`);
        console.log('');
      } catch (error) {
        console.log('❌ TOKEN IS INVALID!');
        if (error.response) {
          console.log(`   Status: ${error.response.status}`);
          console.log(`   Error Code: ${error.response.data?.error?.code}`);
          console.log(`   Error Message: ${error.response.data?.error?.message}`);
          console.log(`   Error Type: ${error.response.data?.error?.type}`);
          
          // Specific error handling
          if (error.response.data?.error?.code === 190) {
            console.log('\n   🔴 Token 已过期或无效!');
            console.log('   需要重新生成 access token');
          } else if (error.response.data?.error?.code === 100) {
            console.log('\n   🔴 Phone Number ID 不正确或无权限!');
          }
        } else {
          console.log(`   Error: ${error.message}`);
        }
        console.log('');
      }
    }

    // Check environment variables
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 Testing Environment Variables (.env)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
      console.log(`Phone Number ID: ${process.env.WHATSAPP_PHONE_NUMBER_ID}`);
      console.log(`Token Length: ${process.env.WHATSAPP_ACCESS_TOKEN.length} chars\n`);

      try {
        const response = await axios.get(
          `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
            }
          }
        );
        
        console.log('✅ ENV TOKEN IS VALID!');
        console.log(`   Phone: ${response.data.display_phone_number}`);
        console.log(`   Name: ${response.data.verified_name}`);
        console.log(`   Quality: ${response.data.quality_rating || 'N/A'}`);
        console.log('');
      } catch (error) {
        console.log('❌ ENV TOKEN IS INVALID!');
        if (error.response) {
          console.log(`   Status: ${error.response.status}`);
          console.log(`   Error: ${error.response.data?.error?.message}`);
        } else {
          console.log(`   Error: ${error.message}`);
        }
        console.log('');
      }
    } else {
      console.log('⚠️  Environment variables not configured\n');
    }

    // Summary and recommendations
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 RECOMMENDATIONS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const invalidUsers = [];
    for (const user of users) {
      try {
        await axios.get(
          `https://graph.facebook.com/v18.0/${user.phone_number_id}`,
          { headers: { 'Authorization': `Bearer ${user.access_token}` } }
        );
      } catch (error) {
        invalidUsers.push(user.email);
      }
    }

    if (invalidUsers.length > 0) {
      console.log('❌ 以下用户的 token 无效:');
      invalidUsers.forEach(email => console.log(`   - ${email}`));
      console.log('\n🔧 修复方案:');
      console.log('   选项 1: 清空所有用户配置,使用环境变量');
      console.log('           node clear-all-user-tokens.js');
      console.log('');
      console.log('   选项 2: 为每个用户更新 token');
      console.log('           node fix-all-users-token.js');
      console.log('');
    } else {
      console.log('✅ 所有用户的 token 都有效!');
      console.log('\n如果仍然无法发送消息,请检查:');
      console.log('   1. 服务器是否已重启: pm2 restart whatsapp-server');
      console.log('   2. 查看服务器日志: pm2 logs whatsapp-server --lines 50');
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

testUserTokens();
