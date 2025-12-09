/**
 * 创建测试通话数据
 * 用于测试 Call Analytics 功能
 */

const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// 数据库连接
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

async function createTestCalls() {
  console.log('🚀 开始创建测试通话数据...\n');

  try {
    // 连接数据库
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 获取用户 ID（使用第一个用户）
    const [users] = await sequelize.query('SELECT id FROM users LIMIT 1');
    if (users.length === 0) {
      console.log('❌ 没有找到用户，请先登录系统');
      return;
    }
    const userId = users[0].id;
    console.log(`📱 使用用户 ID: ${userId}\n`);

    // 测试电话号码
    const testPhones = [
      '60105520735',
      '60123456789',
      '60198765432',
      '60187654321',
      '60176543210'
    ];

    // 生成过去7天的测试数据
    const now = new Date();
    const calls = [];

    for (let day = 6; day >= 0; day--) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      
      // 每天生成 5-15 个通话
      const callsPerDay = Math.floor(Math.random() * 11) + 5;
      
      for (let i = 0; i < callsPerDay; i++) {
        const phone = testPhones[Math.floor(Math.random() * testPhones.length)];
        const direction = Math.random() > 0.5 ? 'inbound' : 'outbound';
        const statuses = ['completed', 'completed', 'completed', 'missed', 'rejected']; // 60% completed
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        // 随机时间
        const hour = Math.floor(Math.random() * 12) + 8; // 8am - 8pm
        const minute = Math.floor(Math.random() * 60);
        date.setHours(hour, minute, 0, 0);
        
        const call = {
          id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          user_id: userId,
          call_id: `wa-call-${Date.now()}-${i}`,
          from_phone_number: direction === 'inbound' ? phone : '15551607691',
          to_phone_number: direction === 'outbound' ? phone : '15551607691',
          direction: direction,
          status: status,
          duration: status === 'completed' ? Math.floor(Math.random() * 300) + 30 : 0,
          created_at: new Date(date),
          updated_at: new Date(date)
        };
        
        calls.push(call);
      }
    }

    console.log(`📊 准备插入 ${calls.length} 条通话记录...\n`);

    // 批量插入
    for (const call of calls) {
      await sequelize.query(`
        INSERT INTO calls (
          id, user_id, call_id, from_phone_number, to_phone_number, 
          direction, status, duration, created_at, updated_at
        ) VALUES (
          :id, :user_id, :call_id, :from_phone_number, :to_phone_number,
          :direction, :status, :duration, :created_at, :updated_at
        )
      `, {
        replacements: call
      });
    }

    console.log('✅ 测试数据创建成功！\n');

    // 统计
    const [stats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) as missed,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM calls
      WHERE user_id = :userId
    `, {
      replacements: { userId }
    });

    console.log('📈 统计数据:');
    console.log(`  总通话数: ${stats[0].total}`);
    console.log(`  已接通: ${stats[0].completed}`);
    console.log(`  未接: ${stats[0].missed}`);
    console.log(`  拒绝: ${stats[0].rejected}`);
    console.log(`  接通率: ${((stats[0].completed / stats[0].total) * 100).toFixed(2)}%\n`);

    console.log('✅ 完成！现在可以访问 Call Analytics 页面查看数据了');

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await sequelize.close();
  }
}

createTestCalls();
