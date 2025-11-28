// 清理测试数据
const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'whatsapp_platform',
  user: 'whatsapp_user',
  password: '123'
});

async function cleanTestData() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // 删除所有测试消息（保留真实的 WhatsApp 消息）
    const deleteMessages = await client.query(`
      DELETE FROM messages 
      WHERE message_id LIKE 'wamid.TEST%'
    `);
    console.log(`🗑️  Deleted ${deleteMessages.rowCount} test messages`);

    // 重置 conversation 的 unread_count
    const resetUnread = await client.query(`
      UPDATE conversations 
      SET unread_count = 0
    `);
    console.log(`🔄 Reset unread count for ${resetUnread.rowCount} conversations`);

    console.log('\n✅ Test data cleaned!');
    console.log('Now send a new message from your phone to test.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

cleanTestData();
