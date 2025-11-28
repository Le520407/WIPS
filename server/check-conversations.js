// 检查数据库中的 conversations
const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'whatsapp_platform',
  user: 'whatsapp_user',
  password: '123'
});

async function checkConversations() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // 查询所有用户
    const usersResult = await client.query('SELECT id, email, name FROM users');
    console.log('\n📋 Users:');
    console.log(usersResult.rows);

    // 查询所有 conversations
    const conversationsResult = await client.query(`
      SELECT c.*, u.email 
      FROM conversations c 
      LEFT JOIN users u ON c.user_id = u.id 
      ORDER BY c.last_message_time DESC
    `);
    console.log('\n💬 Conversations:');
    console.log(conversationsResult.rows);

    // 查询所有 messages
    const messagesResult = await client.query(`
      SELECT m.*, u.email 
      FROM messages m 
      LEFT JOIN users u ON m.user_id = u.id 
      ORDER BY m."createdAt" DESC 
      LIMIT 10
    `);
    console.log('\n📨 Recent Messages:');
    console.log(messagesResult.rows);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

checkConversations();
