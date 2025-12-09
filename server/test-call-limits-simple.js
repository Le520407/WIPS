/**
 * Simple Call Limits Test
 * Tests call limit tracking without authentication
 */

require('dotenv').config();
const CallLimit = require('./dist/models/CallLimit').default;
const sequelize = require('./dist/config/database').default;

async function testCallLimits() {
  try {
    console.log('🚀 Testing Call Limits System...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Sync model
    await CallLimit.sync();
    console.log('✅ CallLimit model synced\n');

    // Test user ID (use existing user from database)
    const TEST_USER_ID = '24a8cbe8-c31b-4e1a-a745-4fd4461b3ce6';
    const TEST_PHONE = '+60105520735';

    console.log('📊 Test 1: Create/Get Call Limit');
    console.log('================================');
    
    // Find or create
    let [callLimit, created] = await CallLimit.findOrCreate({
      where: {
        user_id: TEST_USER_ID,
        phone_number: TEST_PHONE,
      },
      defaults: {
        limit_24h: process.env.WHATSAPP_ENV === 'sandbox' ? 100 : 10,
      },
    });

    console.log(`${created ? '✅ Created' : '✅ Found'} call limit for ${TEST_PHONE}`);
    console.log(`   Calls (24h): ${callLimit.calls_24h}/${callLimit.limit_24h}`);
    console.log(`   Remaining: ${callLimit.getRemainingCalls()}`);
    console.log(`   Usage: ${callLimit.getUsagePercentage()}%`);
    console.log(`   Can make call: ${callLimit.canMakeCall() ? 'Yes' : 'No'}`);
    console.log(`   Needs warning: ${callLimit.needsWarning() ? 'Yes' : 'No'}\n`);

    console.log('📊 Test 2: Record Calls');
    console.log('================================');
    
    // Record 3 calls
    for (let i = 1; i <= 3; i++) {
      callLimit.incrementCallCount();
      await callLimit.save();
      console.log(`✅ Call ${i} recorded`);
      console.log(`   Total calls: ${callLimit.calls_24h}/${callLimit.limit_24h}`);
      console.log(`   Remaining: ${callLimit.getRemainingCalls()}`);
      console.log(`   Usage: ${callLimit.getUsagePercentage()}%`);
      console.log(`   Needs warning: ${callLimit.needsWarning() ? 'Yes ⚠️' : 'No'}\n`);
    }

    console.log('📊 Test 3: Check Limit Status');
    console.log('================================');
    
    // Reload from database
    await callLimit.reload();
    
    console.log(`Phone: ${callLimit.phone_number}`);
    console.log(`Calls (24h): ${callLimit.calls_24h}/${callLimit.limit_24h}`);
    console.log(`Remaining: ${callLimit.getRemainingCalls()}`);
    console.log(`Usage: ${callLimit.getUsagePercentage()}%`);
    console.log(`Can make call: ${callLimit.canMakeCall() ? '✅ Yes' : '❌ No'}`);
    console.log(`Is limited: ${callLimit.is_limited ? '❌ Yes' : '✅ No'}`);
    console.log(`Needs warning: ${callLimit.needsWarning() ? '⚠️ Yes' : '✅ No'}`);
    
    if (callLimit.window_start_24h) {
      const timeUntilReset = callLimit.getTimeUntilReset();
      const hours = Math.floor(timeUntilReset / (1000 * 60 * 60));
      const minutes = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));
      console.log(`Time until reset: ${hours}h ${minutes}m\n`);
    }

    console.log('📊 Test 4: Get All Limits');
    console.log('================================');
    
    const allLimits = await CallLimit.findAll({
      where: { user_id: TEST_USER_ID },
      order: [['last_call_at', 'DESC']],
    });

    console.log(`Total contacts tracked: ${allLimits.length}`);
    
    allLimits.forEach((limit, index) => {
      console.log(`\n${index + 1}. ${limit.phone_number}`);
      console.log(`   Calls: ${limit.calls_24h}/${limit.limit_24h}`);
      console.log(`   Usage: ${limit.getUsagePercentage()}%`);
      console.log(`   Status: ${limit.is_limited ? '❌ Limited' : limit.needsWarning() ? '⚠️ Warning' : '✅ OK'}`);
    });

    console.log('\n📊 Test 5: Dashboard Statistics');
    console.log('================================');
    
    const totalCalls = allLimits.reduce((sum, l) => sum + l.calls_24h, 0);
    const totalLimit = allLimits.reduce((sum, l) => sum + l.limit_24h, 0);
    const limitedCount = allLimits.filter(l => l.is_limited).length;
    const warningCount = allLimits.filter(l => l.needsWarning() && !l.is_limited).length;
    const activeCount = allLimits.filter(l => l.canMakeCall()).length;

    console.log(`Total contacts: ${allLimits.length}`);
    console.log(`Active contacts: ${activeCount}`);
    console.log(`Warning contacts: ${warningCount}`);
    console.log(`Limited contacts: ${limitedCount}`);
    console.log(`Total calls (24h): ${totalCalls}/${totalLimit}`);
    console.log(`Average usage: ${allLimits.length > 0 ? Math.round((totalCalls / totalLimit) * 100) : 0}%`);
    console.log(`Environment: ${process.env.WHATSAPP_ENV || 'production'}`);
    console.log(`Default limit: ${process.env.WHATSAPP_ENV === 'sandbox' ? 100 : 10} calls/24h`);

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await sequelize.close();
  }
}

testCallLimits();
