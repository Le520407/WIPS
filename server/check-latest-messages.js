// 检查最新的消息
const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'whatsapp_platform',
  user: 'whatsapp_user',
  password: '123'
});

async function checkLatestMessages() {
  try {
    await client.connect();
    
    // 查询最新的 10 条消息
    const result = await client.query(`
      SELECT m.*, u.email 
      FROM messages m 
      LEFT JOIN users u ON m.user_id = u.id 
      WHERE m.from_number = '60105520735' OR m.to_number = '60105520735'
      ORDER BY m."createdAt" DESC 
      LIMIT 10
    `);
    
    console.log('📨 Latest messages for phone 60105520735:\n');
    result.rows.forEach((msg, index) => {
      console.log(`${index + 1}. ${msg.status === 'sent' ? '→' : '←'} ${msg.content}`);
      console.log(`   User: ${msg.email}`);
      console.log(`   From: ${msg.from_number}`);
      console.log(`   To: ${msg.to_number}`);
      console.log(`   Message ID: ${msg.message_id}`);
      console.log(`   Created: ${msg.createdAt}\n`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkLatestMessages();
