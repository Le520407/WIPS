require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// Replace with an actual group ID from your WhatsApp account
const GROUP_ID = process.argv[2] || 'YOUR_GROUP_ID_HERE';

async function testGroupInfo() {
  console.log('🧪 Testing Group Info Retrieval\n');
  console.log('='.repeat(50));

  if (GROUP_ID === 'YOUR_GROUP_ID_HERE') {
    console.error('❌ Please provide a group ID as argument:');
    console.error('   node test-group-info.js <GROUP_ID>');
    process.exit(1);
  }

  try {
    // Step 1: Login to get token
    console.log('\n📝 Step 1: Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'demo@example.com',
      password: 'demo123',
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Get group info
    console.log(`\n📝 Step 2: Getting info for group ${GROUP_ID}...`);
    const infoResponse = await axios.get(`${API_URL}/api/groups/${GROUP_ID}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        fields: 'subject,description,participants,join_approval_mode,total_participant_count,suspended,creation_timestamp',
      },
    });

    console.log('\n✅ Group info retrieved successfully!');
    console.log('Group Info:', JSON.stringify(infoResponse.data, null, 2));

    // Step 3: Get invite link
    console.log('\n📝 Step 3: Getting invite link...');
    const linkResponse = await axios.get(`${API_URL}/api/groups/${GROUP_ID}/invite-link`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('\n✅ Invite link retrieved successfully!');
    console.log('Invite Link:', linkResponse.data.invite_link);

    // Step 4: Get join requests (if any)
    console.log('\n📝 Step 4: Getting join requests...');
    try {
      const requestsResponse = await axios.get(`${API_URL}/api/groups/${GROUP_ID}/join-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('\n✅ Join requests retrieved successfully!');
      if (requestsResponse.data.data && requestsResponse.data.data.length > 0) {
        console.log(`Total requests: ${requestsResponse.data.data.length}`);
        console.log('Requests:', JSON.stringify(requestsResponse.data.data, null, 2));
      } else {
        console.log('No pending join requests');
      }
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('ℹ️  This group does not have join approval enabled');
      } else {
        throw error;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

// Run the test
testGroupInfo();
