const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
  }
);

// Import Message model
const Message = require('./dist/models/Message').default;

async function testApiResponse() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Get a message that has a reaction
    const messageWithReaction = await Message.findOne({
      where: {
        reaction_emoji: { [Sequelize.Op.ne]: null }
      },
      order: [['createdAt', 'DESC']]
    });

    if (!messageWithReaction) {
      console.log('❌ No messages with reactions found');
      console.log('Please add a reaction to a message first.');
      await sequelize.close();
      return;
    }

    console.log('📨 Raw database record:');
    console.log('='.repeat(80));
    const rawData = messageWithReaction.get();
    console.log('ID:', rawData.id);
    console.log('Type:', rawData.type);
    console.log('Content:', rawData.content);
    console.log('reaction_emoji (snake_case):', rawData.reaction_emoji);
    console.log('reaction_message_id:', rawData.reaction_message_id);

    console.log('\n\n📤 API Response (toJSON):');
    console.log('='.repeat(80));
    const jsonData = messageWithReaction.toJSON();
    console.log(JSON.stringify(jsonData, null, 2));

    console.log('\n\n🔍 Checking specific fields:');
    console.log('='.repeat(80));
    console.log('Has reactionEmoji field?', 'reactionEmoji' in jsonData);
    console.log('reactionEmoji value:', jsonData.reactionEmoji);
    console.log('Has reactionMessageId field?', 'reactionMessageId' in jsonData);
    console.log('reactionMessageId value:', jsonData.reactionMessageId);

    console.log('\n\n💡 What frontend should receive:');
    console.log('='.repeat(80));
    console.log('message.reactionEmoji =', jsonData.reactionEmoji);
    console.log('message.type =', jsonData.type);
    console.log('');
    console.log('Condition check: message.reactionEmoji && message.type !== "reaction"');
    console.log('Result:', jsonData.reactionEmoji && jsonData.type !== 'reaction' ? '✅ SHOULD SHOW BADGE' : '❌ WILL NOT SHOW BADGE');

    if (jsonData.type === 'reaction') {
      console.log('\n⚠️  This is a REACTION message itself, not the original message!');
      console.log('The badge should appear on the ORIGINAL message, not this one.');
      console.log('');
      console.log('Looking for the original message...');
      
      // Try to find the original message
      const [originalMessages] = await sequelize.query(`
        SELECT id, message_id, type, content, reaction_emoji
        FROM messages
        WHERE type != 'reaction'
          AND reaction_emoji IS NOT NULL
        ORDER BY "createdAt" DESC
        LIMIT 5
      `);

      if (originalMessages.length > 0) {
        console.log('\n📨 Original messages that SHOULD show badges:');
        console.log('='.repeat(80));
        originalMessages.forEach((msg, i) => {
          console.log(`\n${i + 1}. Message:`);
          console.log(`   ID: ${msg.id}`);
          console.log(`   Type: ${msg.type}`);
          console.log(`   Content: ${msg.content?.substring(0, 50)}`);
          console.log(`   ⭐ Reaction: ${msg.reaction_emoji}`);
          console.log(`   ✅ This message SHOULD show a reaction badge`);
        });
      } else {
        console.log('\n❌ No original messages with reactions found!');
        console.log('This means reactions are being saved to reaction messages, not original messages.');
      }
    }

    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testApiResponse();
