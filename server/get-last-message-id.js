const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'whatsapp_platform',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

async function getLastMessageId() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Get the last received message (from_number is not our business number)
    const [results] = await sequelize.query(`
      SELECT message_id, from_number, to_number, content, created_at 
      FROM messages 
      WHERE from_number != '803320889535856'
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    if (results.length === 0) {
      console.log('❌ No received messages found.');
      console.log('📝 Send a message from your phone to the WhatsApp Business number first.');
      return;
    }

    console.log('📨 Last received messages:\n');
    results.forEach((msg, index) => {
      console.log(`${index + 1}. Message ID: ${msg.message_id}`);
      console.log(`   From: ${msg.from_number}`);
      console.log(`   Content: ${msg.content}`);
      console.log(`   Time: ${msg.created_at}`);
      console.log('');
    });

    console.log('💡 Use one of these message_ids to test typing indicator!');

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getLastMessageId();
