const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
  }
);

async function testConversationMessages() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Get all messages for the conversation with phone number 60105520735
    const phoneNumber = '60105520735';
    
    console.log(`📱 Getting messages for phone number: ${phoneNumber}`);
    console.log('='.repeat(80));
    
    const [messages] = await sequelize.query(`
      SELECT 
        id,
        message_id,
        type,
        content,
        reaction_emoji,
        reaction_message_id,
        from_number,
        to_number,
        "createdAt"
      FROM messages
      WHERE from_number = :phone OR to_number = :phone
      ORDER BY "createdAt" ASC
    `, {
      replacements: { phone: phoneNumber }
    });
    
    console.log(`\n📊 Found ${messages.length} messages\n`);
    
    // Group messages by type
    const textMessages = messages.filter(m => m.type === 'text');
    const reactionMessages = messages.filter(m => m.type === 'reaction');
    const textWithReactions = textMessages.filter(m => m.reaction_emoji);
    
    console.log('📈 Message breakdown:');
    console.log(`   Total messages: ${messages.length}`);
    console.log(`   Text messages: ${textMessages.length}`);
    console.log(`   Reaction messages: ${reactionMessages.length}`);
    console.log(`   Text messages WITH reactions: ${textWithReactions.length}`);
    console.log('');
    
    // Show all messages in order
    console.log('📝 All messages (chronological order):');
    console.log('='.repeat(80));
    
    messages.forEach((msg, index) => {
      console.log(`\n${index + 1}. Message:`);
      console.log(`   ID: ${msg.id.substring(0, 8)}...`);
      console.log(`   Type: ${msg.type}`);
      console.log(`   Content: ${msg.content?.substring(0, 50) || '(empty)'}`);
      console.log(`   From: ${msg.from_number}`);
      console.log(`   To: ${msg.to_number}`);
      if (msg.reaction_emoji) {
        console.log(`   ⭐ Reaction: ${msg.reaction_emoji}`);
      }
      console.log(`   Created: ${new Date(msg.createdAt).toLocaleString()}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('\n💡 What frontend should see:');
    console.log('   - Text messages with reaction_emoji should show badge');
    console.log('   - Reaction messages should show "Reacted to: ..." text');
    console.log('   - Both should appear in the conversation');
    console.log('');
    
    // Show what the API would return (with toJSON transformation)
    console.log('📤 API Response format (camelCase):');
    console.log('='.repeat(80));
    
    const apiFormat = messages.slice(-5).map(msg => ({
      id: msg.id,
      type: msg.type,
      content: msg.content?.substring(0, 30),
      reactionEmoji: msg.reaction_emoji,
      reactionMessageId: msg.reaction_message_id,
      fromNumber: msg.from_number,
      toNumber: msg.to_number
    }));
    
    console.log(JSON.stringify(apiFormat, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

testConversationMessages();
