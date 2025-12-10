require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3001';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

async function testCreateGroup() {
  console.log('🧪 Testing Group Creation\n');
  console.log('='.repeat(50));

  try {
    // Step 1: Login to get token
    console.log('\n📝 Step 1: Logging in...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'demo@example.com',
      password: 'demo123',
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Step 2: Create a group
    console.log('\n📝 Step 2: Creating a group...');
    const groupData = {
      phoneNumberId: PHONE_NUMBER_ID,
      subject: 'Test Group ' + Date.now(),
      description: 'This is a test group created via API',
      joinApprovalMode: 'auto_approve', // or 'approval_required'
    };

    console.log('Group data:', JSON.stringify(groupData, null, 2));

    const createResponse = await axios.post(`${API_URL}/api/groups`, groupData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('\n✅ Group created successfully!');
    console.log('Response:', JSON.stringify(createResponse.data, null, 2));

    // Step 3: Get all groups
    console.log('\n📝 Step 3: Fetching all groups...');
    const groupsResponse = await axios.get(`${API_URL}/api/groups`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        phoneNumberId: PHONE_NUMBER_ID,
      },
    });

    console.log('\n✅ Groups fetched successfully!');
    console.log(`Total groups: ${groupsResponse.data.groups.length}`);
    console.log('Groups:', JSON.stringify(groupsResponse.data.groups, null, 2));

    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests passed!');
    console.log('\n📌 Note: The invite link will be received via webhook.');
    console.log('📌 Check your webhook endpoint for the group_lifecycle_update event.');
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
testCreateGroup();
