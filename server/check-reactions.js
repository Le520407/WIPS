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

async function checkReactions() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Check messages with reactions (original messages that have been reacted to)
    const [messagesWithReactions] = await sequelize.query(`
      SELECT 
        id,
        message_id,
        type,
        content,
        reaction_emoji,
        reaction_message_id,
        "createdAt"
      FROM messages 
      WHERE reaction_emoji IS NOT NULL
      ORDER BY "createdAt" DESC
      LIMIT 10
    `);

    console.log('📨 Messages with reactions (被 react 的原始消息):');
    console.log('='.repeat(80));
    
    if (messagesWithReactions.length === 0) {
      console.log('❌ No messages with reactions found');
      console.log('\n💡 This means no original messages have been reacted to.');
      console.log('   The reaction badge appears on the ORIGINAL message, not the reaction message itself.\n');
    } else {
      messagesWithReactions.forEach((msg, index) => {
        console.log(`\n${index + 1}. Original Message:`);
        console.log(`   Database ID: ${msg.id}`);
        console.log(`   Message ID: ${msg.message_id}`);
        console.log(`   Type: ${msg.type}`);
        console.log(`   Content: ${msg.content?.substring(0, 50) || '(no content)'}`);
        console.log(`   ⭐ Reaction Emoji: ${msg.reaction_emoji}`);
        console.log(`   Reaction Message ID: ${msg.reaction_message_id}`);
        console.log(`   Created: ${msg.createdAt}`);
      });
    }

    // Check reaction type messages
    const [reactionMessages] = await sequelize.query(`
      SELECT 
        id,
        message_id,
        type,
        content,
        reaction_emoji,
        reaction_message_id,
        "createdAt"
      FROM messages 
      WHERE type = 'reaction'
      ORDER BY "createdAt" DESC
      LIMIT 10
    `);

    console.log('\n\n👍 Reaction Messages (reaction 类型的消息):');
    console.log('='.repeat(80));
    
    if (reactionMessages.length === 0) {
      console.log('❌ No reaction messages found');
    } else {
      reactionMessages.forEach((msg, index) => {
        console.log(`\n${index + 1}. Reaction Message:`);
        console.log(`   Database ID: ${msg.id}`);
        console.log(`   Message ID: ${msg.message_id}`);
        console.log(`   Type: ${msg.type}`);
        console.log(`   Content: ${msg.content?.substring(0, 50) || '(no content)'}`);
        console.log(`   Emoji: ${msg.reaction_emoji}`);
        console.log(`   Points to Message ID: ${msg.reaction_message_id}`);
        console.log(`   Created: ${msg.createdAt}`);
      });
    }

    console.log('\n\n📊 Summary:');
    console.log('='.repeat(80));
    console.log(`Messages with reactions: ${messagesWithReactions.length}`);
    console.log(`Reaction messages: ${reactionMessages.length}`);
    
    console.log('\n💡 How reactions work:');
    console.log('1. When you react to a message, TWO things happen:');
    console.log('   a) The ORIGINAL message gets reaction_emoji field updated');
    console.log('   b) A NEW message with type="reaction" is created');
    console.log('');
    console.log('2. The reaction badge (小圆圈) appears on the ORIGINAL message');
    console.log('3. The reaction message (type="reaction") shows in the chat as "Reacted to: ..."');
    console.log('');
    console.log('4. If you see reaction messages but no badges:');
    console.log('   - Check if the original messages have reaction_emoji field set');
    console.log('   - Check if frontend is passing reactionEmoji to ChatBubble');
    console.log('   - Check browser console for errors');

    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkReactions();
