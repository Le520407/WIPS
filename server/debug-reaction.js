require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function debugReaction() {
  try {
    console.log('🔍 Debugging Reaction System\n');
    console.log('='.repeat(80));

    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Get recent messages
    const [messages] = await sequelize.query(`
      SELECT 
        id,
        message_id,
        from_number,
        to_number,
        type,
        content,
        status,
        reaction_emoji,
        reaction_message_id,
        created_at
      FROM messages
      WHERE type != 'reaction'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log('📨 Recent Messages (last 10):');
    console.log('='.repeat(80));
    messages.forEach((msg, index) => {
      console.log(`\n${index + 1}. Message ID: ${msg.message_id}`);
      console.log(`   Database ID: ${msg.id}`);
      console.log(`   Type: ${msg.type}`);
      console.log(`   From: ${msg.from_number}`);
      console.log(`   To: ${msg.to_number}`);
      console.log(`   Content: ${msg.content?.substring(0, 50)}${msg.content?.length > 50 ? '...' : ''}`);
      console.log(`   Status: ${msg.status}`);
      if (msg.reaction_emoji) {
        console.log(`   ⭐ Has Reaction: ${msg.reaction_emoji}`);
      }
      console.log(`   Created: ${msg.created_at}`);
    });

    // Get recent reactions
    const [reactions] = await sequelize.query(`
      SELECT 
        id,
        message_id,
        from_number,
        content,
        reaction_emoji,
        reaction_message_id,
        created_at
      FROM messages
      WHERE type = 'reaction'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log('\n\n👍 Recent Reactions (last 10):');
    console.log('='.repeat(80));
    if (reactions.length === 0) {
      console.log('No reactions found in database.');
    } else {
      reactions.forEach((reaction, index) => {
        console.log(`\n${index + 1}. Reaction ID: ${reaction.message_id}`);
        console.log(`   Database ID: ${reaction.id}`);
        console.log(`   From: ${reaction.from_number}`);
        console.log(`   Emoji: ${reaction.reaction_emoji || '(removed)'}`);
        console.log(`   Target Message ID: ${reaction.reaction_message_id}`);
        console.log(`   Content: ${reaction.content}`);
        console.log(`   Created: ${reaction.created_at}`);
      });
    }

    // Check for orphaned reactions (reactions without matching original message)
    const [orphanedReactions] = await sequelize.query(`
      SELECT 
        r.id,
        r.message_id,
        r.reaction_message_id,
        r.reaction_emoji,
        r.from_number,
        r.created_at
      FROM messages r
      WHERE r.type = 'reaction'
        AND r.reaction_message_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM messages m 
          WHERE m.message_id = r.reaction_message_id
        )
      ORDER BY r.created_at DESC
      LIMIT 10
    `);

    console.log('\n\n⚠️  Orphaned Reactions (reactions without original message):');
    console.log('='.repeat(80));
    if (orphanedReactions.length === 0) {
      console.log('✅ No orphaned reactions found. All reactions are properly linked!');
    } else {
      console.log(`Found ${orphanedReactions.length} orphaned reaction(s):\n`);
      orphanedReactions.forEach((reaction, index) => {
        console.log(`${index + 1}. Reaction from: ${reaction.from_number}`);
        console.log(`   Emoji: ${reaction.reaction_emoji || '(removed)'}`);
        console.log(`   Looking for message_id: ${reaction.reaction_message_id}`);
        console.log(`   Created: ${reaction.created_at}`);
        console.log('   ❌ Original message not found in database\n');
      });
      
      console.log('💡 SOLUTION:');
      console.log('These reactions are for messages that were:');
      console.log('1. Sent before the platform was set up, OR');
      console.log('2. Not saved to the database, OR');
      console.log('3. Deleted from the database');
      console.log('\nTo fix: Send NEW messages and react to them.');
    }

    // Summary
    console.log('\n\n📊 Summary:');
    console.log('='.repeat(80));
    console.log(`Total recent messages: ${messages.length}`);
    console.log(`Messages with reactions: ${messages.filter(m => m.reaction_emoji).length}`);
    console.log(`Total reaction events: ${reactions.length}`);
    console.log(`Orphaned reactions: ${orphanedReactions.length}`);

    console.log('\n\n💡 Testing Tips:');
    console.log('='.repeat(80));
    console.log('1. Send a message from your platform to a WhatsApp number');
    console.log('2. React to that message from your phone');
    console.log('3. Check the server logs for reaction webhook');
    console.log('4. Run this script again to see if the reaction was saved');
    console.log('5. Refresh your Messages page to see the reaction badge');

    console.log('\n✅ Debug complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

debugReaction();
