// 统一所有电话号码格式
const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'whatsapp_platform',
  user: 'whatsapp_user',
  password: '123'
});

async function normalizeAllPhoneNumbers() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // 更新 messages 表中的 from_number
    const updateFrom = await client.query(`
      UPDATE messages 
      SET from_number = REPLACE(from_number, '+', '')
      WHERE from_number LIKE '+%'
    `);
    console.log(`📝 Updated ${updateFrom.rowCount} messages (from_number)`);

    // 更新 messages 表中的 to_number
    const updateTo = await client.query(`
      UPDATE messages 
      SET to_number = REPLACE(to_number, '+', '')
      WHERE to_number LIKE '+%'
    `);
    console.log(`📝 Updated ${updateTo.rowCount} messages (to_number)`);

    // 更新 conversations 表中的 phone_number
    const updateConv = await client.query(`
      UPDATE conversations 
      SET phone_number = REPLACE(phone_number, '+', '')
      WHERE phone_number LIKE '+%'
    `);
    console.log(`📝 Updated ${updateConv.rowCount} conversations`);

    console.log('\n✅ All phone numbers normalized!');
    console.log('Now refresh your platform to see the changes.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

normalizeAllPhoneNumbers();
