const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'whatsapp_platform',
  process.env.DB_USER || 'whatsapp_user',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres',
    logging: false,
  }
);

async function checkMessages() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Get recent messages
    const [messages] = await sequelize.query(`
      SELECT 
        id,
        message_id,
        type,
        content,
        from_number,
        to_number,
        status,
        "createdAt"
      FROM messages 
      WHERE type != 'reaction'
      ORDER BY "createdAt" DESC 
      LIMIT 10
    `);

    console.log('📊 Recent 10 messages in database:\n');
    console.log('=' .repeat(100));
    
    messages.forEach((msg, index) => {
      console.log(`\n${index + 1}. Message ID: ${msg.message_id}`);
      console.log(`   Type: ${msg.type}`);
      console.log(`   Content: ${msg.content?.substring(0, 50)}${msg.content?.length > 50 ? '...' : ''}`);
      console.log(`   From: ${msg.from_number}`);
      console.log(`   To: ${msg.to_number}`);
      console.log(`   Status: ${msg.status}`);
      console.log(`   Created: ${msg.createdAt}`);
    });

    console.log('\n' + '='.repeat(100));
    console.log('\n💡 To test reactions:');
    console.log('1. Find a message in your WhatsApp chat');
    console.log('2. Long press the message and add a reaction (👍, ❤️, 😂, etc.)');
    console.log('3. The message_id from WhatsApp must match one of the IDs above');
    console.log('\n⚠️  If the message you want to react to is not in this list:');
    console.log('   - Send a new message FROM WhatsApp to your platform');
    console.log('   - Wait for it to be received and saved');
    console.log('   - Then react to that new message\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkMessages();
