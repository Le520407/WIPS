// 合并重复的 conversations
const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'whatsapp_platform',
  user: 'whatsapp_user',
  password: '123'
});

async function mergeDuplicateConversations() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // 找到所有带 + 的 conversations
    const withPlus = await client.query(`
      SELECT * FROM conversations 
      WHERE phone_number LIKE '+%'
      ORDER BY user_id, phone_number
    `);

    console.log(`Found ${withPlus.rows.length} conversations with + prefix\n`);

    for (const conv of withPlus.rows) {
      const normalizedPhone = conv.phone_number.replace(/^\+/, '');
      
      // 查找是否有对应的不带 + 的 conversation
      const without = await client.query(`
        SELECT * FROM conversations 
        WHERE user_id = $1 AND phone_number = $2
      `, [conv.user_id, normalizedPhone]);

      if (without.rows.length > 0) {
        // 有重复，合并数据
        const existing = without.rows[0];
        console.log(`📋 Merging conversations for phone: ${conv.phone_number}`);
        console.log(`   User: ${conv.user_id}`);
        
        // 保留最新的消息和时间
        const latestTime = new Date(conv.last_message_time) > new Date(existing.last_message_time) 
          ? conv.last_message_time 
          : existing.last_message_time;
        
        const latestMessage = new Date(conv.last_message_time) > new Date(existing.last_message_time)
          ? conv.last_message
          : existing.last_message;

        const totalUnread = conv.unread_count + existing.unread_count;

        // 更新不带 + 的 conversation
        await client.query(`
          UPDATE conversations 
          SET last_message = $1, 
              last_message_time = $2,
              unread_count = $3
          WHERE id = $4
        `, [latestMessage, latestTime, totalUnread, existing.id]);

        // 删除带 + 的 conversation
        await client.query(`DELETE FROM conversations WHERE id = $1`, [conv.id]);
        
        console.log(`   ✅ Merged and deleted duplicate\n`);
      } else {
        // 没有重复，只需要更新电话号码
        console.log(`📝 Normalizing phone number: ${conv.phone_number} -> ${normalizedPhone}`);
        await client.query(`
          UPDATE conversations 
          SET phone_number = $1 
          WHERE id = $2
        `, [normalizedPhone, conv.id]);
        console.log(`   ✅ Updated\n`);
      }
    }

    console.log('✅ All duplicate conversations merged!');
    console.log('Now refresh your platform to see the changes.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

mergeDuplicateConversations();
