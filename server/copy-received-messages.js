// 复制接收的消息给所有用户
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'whatsapp_platform',
  user: 'whatsapp_user',
  password: '123'
});

async function copyReceivedMessages() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // 获取所有用户
    const usersResult = await client.query('SELECT id, email FROM users');
    const users = usersResult.rows;
    
    console.log(`Found ${users.length} users\n`);

    // 获取所有接收的消息（status = 'received'）
    const messagesResult = await client.query(`
      SELECT DISTINCT ON (message_id) *
      FROM messages 
      WHERE status = 'received'
      ORDER BY message_id, "createdAt" DESC
    `);
    
    console.log(`Found ${messagesResult.rows.length} received messages\n`);

    let copied = 0;
    
    for (const msg of messagesResult.rows) {
      for (const user of users) {
        // 检查这个用户是否已经有这条消息
        const existing = await client.query(`
          SELECT id FROM messages 
          WHERE user_id = $1 AND from_number = $2 AND to_number = $3 AND content = $4 AND "createdAt" = $5
        `, [user.id, msg.from_number, msg.to_number, msg.content, msg.createdAt]);
        
        if (existing.rows.length === 0) {
          // 为这个用户创建消息副本
          await client.query(`
            INSERT INTO messages (id, user_id, from_number, to_number, content, type, status, message_id, "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [
            uuidv4(),
            user.id,
            msg.from_number,
            msg.to_number,
            msg.content,
            msg.type,
            msg.status,
            msg.message_id + '_' + user.id,
            msg.createdAt,
            msg.updatedAt
          ]);
          
          copied++;
          console.log(`✅ Copied message "${msg.content.substring(0, 30)}..." to ${user.email}`);
        }
      }
    }

    console.log(`\n✅ Copied ${copied} messages!`);
    console.log('Now refresh your platform to see all messages.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

copyReceivedMessages();
