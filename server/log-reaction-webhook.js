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

async function logReactionWebhook() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    console.log('📊 REACTION WEBHOOK DIAGNOSTIC TOOL\n');
    console.log('=' .repeat(100));
    
    // Get all messages (both incoming and outgoing)
    const [allMessages] = await sequelize.query(`
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
      LIMIT 20
    `);

    console.log('\n📨 LAST 20 MESSAGES (INCOMING + OUTGOING):\n');
    
    allMessages.forEach((msg, index) => {
      const direction = msg.status === 'received' ? '⬅️ INCOMING' : '➡️ OUTGOING';
      console.log(`${index + 1}. ${direction}`);
      console.log(`   Message ID: ${msg.message_id}`);
      console.log(`   Type: ${msg.type}`);
      console.log(`   Content: ${msg.content?.substring(0, 40)}${msg.content?.length > 40 ? '...' : ''}`);
      console.log(`   From: ${msg.from_number}`);
      console.log(`   To: ${msg.to_number}`);
      console.log(`   Status: ${msg.status}`);
      console.log(`   Created: ${msg.createdAt}`);
      console.log('');
    });

    console.log('=' .repeat(100));
    console.log('\n💡 HOW TO TEST REACTIONS:\n');
    console.log('1. Open WhatsApp on your phone');
    console.log('2. Find a message in the chat (either one you sent or received)');
    console.log('3. Long press the message and add a reaction (👍, ❤️, 😂, etc.)');
    console.log('4. Check your server logs for the reaction webhook');
    console.log('5. The webhook will show the message_id it\'s trying to react to');
    console.log('6. Compare that message_id with the list above\n');
    
    console.log('⚠️  IMPORTANT NOTES:\n');
    console.log('- You can react to BOTH incoming (⬅️) and outgoing (➡️) messages');
    console.log('- The message_id in the reaction webhook MUST match one from the list above');
    console.log('- If the message is not in the list, it means:');
    console.log('  a) The message is too old (older than the last 20 messages)');
    console.log('  b) The message was never saved to the database');
    console.log('  c) The message was sent before the platform was set up\n');
    
    console.log('🔍 NEXT STEPS:\n');
    console.log('1. Send a NEW message from WhatsApp to the platform');
    console.log('2. Wait for it to appear in the Messages page');
    console.log('3. React to THAT specific message');
    console.log('4. Check if the reaction appears\n');

    // Get recent reactions
    const [reactions] = await sequelize.query(`
      SELECT 
        id,
        message_id,
        reaction_emoji,
        reaction_message_id,
        content,
        from_number,
        "createdAt"
      FROM messages 
      WHERE type = 'reaction'
      ORDER BY "createdAt" DESC 
      LIMIT 5
    `);

    if (reactions.length > 0) {
      console.log('=' .repeat(100));
      console.log('\n👍 RECENT REACTIONS RECEIVED:\n');
      
      reactions.forEach((reaction, index) => {
        console.log(`${index + 1}. Reaction: ${reaction.reaction_emoji || '(removed)'}`);
        console.log(`   Reacted to message_id: ${reaction.reaction_message_id}`);
        console.log(`   From: ${reaction.from_number}`);
        console.log(`   Created: ${reaction.createdAt}`);
        console.log('');
      });
    } else {
      console.log('=' .repeat(100));
      console.log('\n⚠️  No reactions found in database yet\n');
    }

    console.log('=' .repeat(100) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

logReactionWebhook();
