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

async function checkSentMessages() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Get messages sent FROM platform (status = sent/delivered/read)
    const [sentMessages] = await sequelize.query(`
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
      WHERE status IN ('sent', 'delivered', 'read', 'failed')
        AND type != 'reaction'
        AND from_number != '803320889535856'
      ORDER BY "createdAt" DESC 
      LIMIT 10
    `);

    console.log('📤 Recent 10 SENT messages (from platform to WhatsApp):\n');
    console.log('=' .repeat(100));
    
    if (sentMessages.length === 0) {
      console.log('\n⚠️  No sent messages found in database!');
      console.log('   This means messages sent from platform are not being saved.');
      console.log('   Or they have a different status/from_number pattern.\n');
    } else {
      sentMessages.forEach((msg, index) => {
        console.log(`\n${index + 1}. Message ID: ${msg.message_id}`);
        console.log(`   Type: ${msg.type}`);
        console.log(`   Content: ${msg.content?.substring(0, 50)}${msg.content?.length > 50 ? '...' : ''}`);
        console.log(`   From: ${msg.from_number}`);
        console.log(`   To: ${msg.to_number}`);
        console.log(`   Status: ${msg.status}`);
        console.log(`   Created: ${msg.createdAt}`);
      });
    }

    console.log('\n' + '='.repeat(100));
    
    // Also check all unique from_numbers
    const [fromNumbers] = await sequelize.query(`
      SELECT DISTINCT from_number, COUNT(*) as count
      FROM messages
      GROUP BY from_number
      ORDER BY count DESC
    `);
    
    console.log('\n📊 All unique from_numbers in database:');
    fromNumbers.forEach(row => {
      console.log(`   ${row.from_number}: ${row.count} messages`);
    });

    console.log('\n💡 Key insight:');
    console.log('   - Messages FROM platform should have from_number = your platform phone number');
    console.log('   - Messages TO platform should have from_number = user phone number');
    console.log('   - Reactions reference the message_id from the ORIGINAL message\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSentMessages();
