require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';

// Replace with an actual group ID that has join approval enabled
const GROUP_ID = process.argv[2] || 'YOUR_GROUP_ID_HERE';

async function testJoinRequests() {
  console.log('🧪 Testing Join Requests Management\n');
  console.log('='.repeat(50));

  if (GROUP_ID === 'YOUR_GROUP_ID_HERE') {
    console.error('❌ Please provide a group ID as argument:');
    console.error('   node test-join-requests.js <GROUP_ID>');
    console.error('\n⚠️  Note: The group must have join_approval_mode set to "approval_required"');
    process.exit(1);
  }

  try {
    // Step 1: Login
    console.log('\n📝 Step 1: Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'demo@example.com',
      password: 'demo123',
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Get join requests
    console.log('\n📝 Step 2: Getting join requests...');
    const requestsResponse = await axios.get(`${API_URL}/api/groups/${GROUP_ID}/join-requests`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('✅ Join requests retrieved successfully!');
    
    if (requestsResponse.data.data && requestsResponse.data.data.length > 0) {
      console.log(`\nFound ${requestsResponse.data.data.length} pending request(s):`);
      requestsResponse.data.data.forEach((request, index) => {
        console.log(`\n${index + 1}. Request ID: ${request.join_request_id}`);
        console.log(`   WhatsApp ID: ${request.wa_id}`);
        console.log(`   Created: ${new Date(request.creation_timestamp * 1000).toLocaleString()}`);
      });

      // Step 3: Approve first request (if any)
      const firstRequest = requestsResponse.data.data[0];
      console.log('\n📝 Step 3: Approving first join request...');
      
      const approveResponse = await axios.post(
        `${API_URL}/api/groups/${GROUP_ID}/join-requests`,
        {
          joinRequestIds: [firstRequest.join_request_id],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Join request approved!');
      console.log('Response:', JSON.stringify(approveResponse.data, null, 2));

      // Step 4: Try to reject a request (if there are more)
      if (requestsResponse.data.data.length > 1) {
        const secondRequest = requestsResponse.data.data[1];
        console.log('\n📝 Step 4: Rejecting second join request...');
        
        const rejectResponse = await axios.delete(
          `${API_URL}/api/groups/${GROUP_ID}/join-requests`,
          {
            data: {
              joinRequestIds: [secondRequest.join_request_id],
            },
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('✅ Join request rejected!');
        console.log('Response:', JSON.stringify(rejectResponse.data, null, 2));
      }
    } else {
      console.log('\nℹ️  No pending join requests found.');
      console.log('\n💡 To test this feature:');
      console.log('   1. Share the group invite link with someone');
      console.log('   2. Have them click "Request to join"');
      console.log('   3. Run this script again');
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 400) {
        console.error('\n💡 Tip: Make sure the group has join_approval_mode set to "approval_required"');
      }
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

// Run the test
testJoinRequests();
