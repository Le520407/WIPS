/**
 * Test Missed Call Logic
 * 测试未接来电逻辑
 * 
 * 模拟 WhatsApp 发送的 webhook 序列
 */

const axios = require('axios');

const WEBHOOK_URL = 'http://localhost:3002/webhooks';
const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'your_verify_token_here';

// 模拟的 Phone Number ID
const PHONE_NUMBER_ID = '803320889535856';
const BUSINESS_NUMBER = '60105520735';
const USER_NUMBER = '+60111234567';

console.log('\n🧪 Testing Missed Call Logic...\n');
console.log('='.repeat(60));

async function sendWebhook(payload) {
  try {
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error sending webhook:', error.message);
    throw error;
  }
}

async function testMissedCall() {
  const callId = `test_missed_${Date.now()}`;
  const timestamp = Math.floor(Date.now() / 1000);

  console.log('\n📞 Scenario: User calls but doesn\'t answer');
  console.log('-'.repeat(60));
  console.log(`Call ID: ${callId}`);
  console.log(`From: ${USER_NUMBER}`);
  console.log(`To: ${BUSINESS_NUMBER}`);

  // Step 1: Incoming call (RINGING)
  console.log('\n📥 Step 1: Incoming call webhook (RINGING)');
  const ringingPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'BUSINESS_ACCOUNT_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: BUSINESS_NUMBER,
                phone_number_id: PHONE_NUMBER_ID,
              },
              calls: [
                {
                  id: callId,
                  from: USER_NUMBER,
                  to: BUSINESS_NUMBER,
                  timestamp: timestamp.toString(),
                  // No status means RINGING
                },
              ],
            },
            field: 'calls',
          },
        ],
      },
    ],
  };

  await sendWebhook(ringingPayload);
  console.log('✅ Ringing webhook sent');
  console.log('   Expected: Call saved with status "ringing"');

  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 2: Call ends without being answered
  console.log('\n📤 Step 2: Call ended webhook (ENDED - not answered)');
  const endedPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'BUSINESS_ACCOUNT_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: BUSINESS_NUMBER,
                phone_number_id: PHONE_NUMBER_ID,
              },
              calls: [
                {
                  id: callId,
                  from: USER_NUMBER,
                  to: BUSINESS_NUMBER,
                  timestamp: timestamp.toString(),
                  status: 'ENDED',  // Call ended
                  end_time: (timestamp + 30).toString(),  // 30 seconds later
                },
              ],
            },
            field: 'calls',
          },
        ],
      },
    ],
  };

  await sendWebhook(endedPayload);
  console.log('✅ Ended webhook sent');
  console.log('   Expected: Call updated to status "missed"');

  // Step 3: Verify the call status
  console.log('\n🔍 Step 3: Verify call status in database');
  console.log('   Check server logs for:');
  console.log('   - "📞 Call ended without being answered - marking as MISSED"');
  console.log('   - "✅ Call updated: ... - Status: missed"');
  console.log('   - "📊 Call quality updated for ... : missed"');

  console.log('\n' + '='.repeat(60));
  console.log('✅ Test completed!');
  console.log('='.repeat(60));
  console.log('\n📋 Manual Verification:');
  console.log('1. Check server logs for the messages above');
  console.log('2. Visit http://localhost:5174/missed-calls');
  console.log('3. You should see the missed call in the list');
  console.log('4. Visit http://localhost:5174/calls');
  console.log('5. The call should show status "Missed"');
}

async function testAnsweredCall() {
  const callId = `test_answered_${Date.now()}`;
  const timestamp = Math.floor(Date.now() / 1000);

  console.log('\n\n📞 Scenario: User calls and answers');
  console.log('-'.repeat(60));
  console.log(`Call ID: ${callId}`);

  // Step 1: Incoming call (RINGING)
  console.log('\n📥 Step 1: Incoming call webhook (RINGING)');
  const ringingPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'BUSINESS_ACCOUNT_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: BUSINESS_NUMBER,
                phone_number_id: PHONE_NUMBER_ID,
              },
              calls: [
                {
                  id: callId,
                  from: USER_NUMBER,
                  to: BUSINESS_NUMBER,
                  timestamp: timestamp.toString(),
                },
              ],
            },
            field: 'calls',
          },
        ],
      },
    ],
  };

  await sendWebhook(ringingPayload);
  console.log('✅ Ringing webhook sent');

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 2: Call connected
  console.log('\n📞 Step 2: Call connected webhook (CONNECTED)');
  const connectedPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'BUSINESS_ACCOUNT_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: BUSINESS_NUMBER,
                phone_number_id: PHONE_NUMBER_ID,
              },
              calls: [
                {
                  id: callId,
                  from: USER_NUMBER,
                  to: BUSINESS_NUMBER,
                  timestamp: timestamp.toString(),
                  status: 'CONNECTED',
                  start_time: (timestamp + 5).toString(),
                },
              ],
            },
            field: 'calls',
          },
        ],
      },
    ],
  };

  await sendWebhook(connectedPayload);
  console.log('✅ Connected webhook sent');

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 3: Call ended normally
  console.log('\n📤 Step 3: Call ended webhook (ENDED - after connection)');
  const endedPayload = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'BUSINESS_ACCOUNT_ID',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: BUSINESS_NUMBER,
                phone_number_id: PHONE_NUMBER_ID,
              },
              calls: [
                {
                  id: callId,
                  from: USER_NUMBER,
                  to: BUSINESS_NUMBER,
                  timestamp: timestamp.toString(),
                  status: 'ENDED',
                  start_time: (timestamp + 5).toString(),
                  end_time: (timestamp + 65).toString(),  // 60 seconds call
                },
              ],
            },
            field: 'calls',
          },
        ],
      },
    ],
  };

  await sendWebhook(endedPayload);
  console.log('✅ Ended webhook sent');
  console.log('   Expected: Call status remains "ended" (not missed)');
  console.log('   Expected: Call quality updated as "connected"');

  console.log('\n' + '='.repeat(60));
  console.log('✅ Test completed!');
  console.log('='.repeat(60));
}

// Run tests
(async () => {
  try {
    await testMissedCall();
    await new Promise(resolve => setTimeout(resolve, 3000));
    await testAnsweredCall();
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
})();
