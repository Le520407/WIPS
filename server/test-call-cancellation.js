/**
 * Test Call Cancellation Notification
 * 测试通话取消时的通知系统
 */

const axios = require('axios');

const API_URL = 'http://localhost:3002';

async function testCallCancellation() {
  console.log('🧪 Testing Call Cancellation Notification\n');
  
  try {
    // Step 1: Login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/test-login`, {
      email: 'test@whatsapp-platform.com'
    });
    
    const token = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    console.log('✅ Login Success!');
    console.log('User ID:', userId);
    console.log('');
    
    // Step 2: Simulate incoming call webhook
    console.log('2️⃣ Simulating incoming call webhook...');
    const callWebhook = {
      entry: [{
        changes: [{
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '15551607691',
              phone_number_id: '15551607691'
            },
            calls: [{
              id: 'test_call_' + Date.now(),
              from: '60105520735',
              to: '15551607691',
              status: 'ringing',
              timestamp: Math.floor(Date.now() / 1000).toString()
            }]
          }
        }]
      }]
    };
    
    const webhookResponse = await axios.post(`${API_URL}/webhook`, callWebhook);
    console.log('✅ Incoming call webhook sent');
    console.log('Response:', webhookResponse.data);
    console.log('');
    
    // Wait a bit for the notification to be sent
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 3: Simulate call cancellation (user hangs up)
    console.log('3️⃣ Simulating call cancellation (user hangs up)...');
    const callId = callWebhook.entry[0].changes[0].value.calls[0].id;
    
    // Test different cancellation statuses
    const cancellationStatuses = ['missed', 'rejected', 'ended', 'cancelled', 'failed'];
    
    for (const status of cancellationStatuses) {
      console.log(`\n   Testing status: ${status}`);
      
      const cancelWebhook = {
        entry: [{
          changes: [{
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '15551607691',
                phone_number_id: '15551607691'
              },
              calls: [{
                id: callId,
                from: '60105520735',
                to: '15551607691',
                status: status,
                timestamp: Math.floor(Date.now() / 1000).toString(),
                end_time: Math.floor(Date.now() / 1000).toString()
              }]
            }
          }]
        }]
      };
      
      const cancelResponse = await axios.post(`${API_URL}/webhook`, cancelWebhook);
      console.log(`   ✅ ${status} webhook sent`);
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n🎉 All cancellation tests completed!\n');
    console.log('📝 Summary:');
    console.log('  ✅ Incoming call webhook sent');
    console.log('  ✅ All cancellation statuses tested:');
    cancellationStatuses.forEach(status => {
      console.log(`     - ${status}`);
    });
    console.log('');
    console.log('💡 Check your browser:');
    console.log('   1. The incoming call notification should appear');
    console.log('   2. It should automatically close when status changes');
    console.log('   3. Check browser console for status update logs');
    console.log('');
    console.log('🔍 Expected behavior:');
    console.log('   - Notification appears when call is "ringing"');
    console.log('   - Notification closes when status is:');
    console.log('     • missed');
    console.log('     • rejected');
    console.log('     • ended');
    console.log('     • cancelled');
    console.log('     • failed');
    console.log('   - Notification auto-closes after 60 seconds');
    
  } catch (error) {
    console.error('❌ Test Failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run tests
testCallCancellation();
