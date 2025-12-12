/**
 * Test script for Group Participants Management
 * 
 * Tests:
 * 1. Get group participants list
 * 2. Remove participant from group
 * 3. Handle participant removal errors
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Configuration
const config = {
  phoneNumberId: process.env.PHONE_NUMBER_ID || 'YOUR_PHONE_NUMBER_ID',
  groupId: process.env.TEST_GROUP_ID || 'YOUR_GROUP_ID', // Use existing group
  participantToRemove: process.env.TEST_PARTICIPANT_WA_ID || '1234567890', // Participant to remove
};

console.log('🧪 Group Participants Management Test\n');
console.log('Configuration:', {
  phoneNumberId: config.phoneNumberId,
  groupId: config.groupId,
  participantToRemove: config.participantToRemove,
});
console.log('\n' + '='.repeat(60) + '\n');

/**
 * Test 1: Get Group Info (includes participants)
 */
async function testGetGroupInfo() {
  console.log('📋 Test 1: Get Group Info with Participants');
  console.log('-'.repeat(60));

  try {
    const response = await axios.get(`${BASE_URL}/groups/${config.groupId}`, {
      params: {
        phoneNumberId: config.phoneNumberId,
      },
    });

    console.log('✅ Success!');
    console.log('\nGroup Info:');
    console.log('- Subject:', response.data.group.subject);
    console.log('- Total Participants:', response.data.group.total_participant_count);
    console.log('- Suspended:', response.data.group.suspended);

    if (response.data.participants && response.data.participants.length > 0) {
      console.log('\n👥 Participants:');
      response.data.participants.forEach((p, index) => {
        console.log(`${index + 1}. ${p.wa_id} (${p.role}) - Joined: ${new Date(p.joined_at).toLocaleDateString()}`);
      });
    } else {
      console.log('\n⚠️  No participants found in database');
    }

    return response.data;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test 2: Remove Participant
 */
async function testRemoveParticipant() {
  console.log('\n📋 Test 2: Remove Participant');
  console.log('-'.repeat(60));

  try {
    const response = await axios.delete(`${BASE_URL}/groups/${config.groupId}/participants`, {
      params: {
        phoneNumberId: config.phoneNumberId,
      },
      data: {
        wa_ids: [config.participantToRemove],
      },
    });

    console.log('✅ Success!');
    console.log('\nResponse:', JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('\n💡 Tip: Make sure the participant exists in the group');
    }
    
    throw error;
  }
}

/**
 * Test 3: Remove Multiple Participants
 */
async function testRemoveMultipleParticipants() {
  console.log('\n📋 Test 3: Remove Multiple Participants');
  console.log('-'.repeat(60));

  const participantsToRemove = [
    config.participantToRemove,
    '9876543210', // Another test participant
  ];

  try {
    const response = await axios.delete(`${BASE_URL}/groups/${config.groupId}/participants`, {
      params: {
        phoneNumberId: config.phoneNumberId,
      },
      data: {
        wa_ids: participantsToRemove,
      },
    });

    console.log('✅ Success!');
    console.log('\nRemoved participants:', participantsToRemove.length);
    console.log('Response:', JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Test 4: Error Handling - Invalid Group ID
 */
async function testInvalidGroupId() {
  console.log('\n📋 Test 4: Error Handling - Invalid Group ID');
  console.log('-'.repeat(60));

  try {
    await axios.delete(`${BASE_URL}/groups/invalid-group-id/participants`, {
      params: {
        phoneNumberId: config.phoneNumberId,
      },
      data: {
        wa_ids: [config.participantToRemove],
      },
    });

    console.log('❌ Should have failed but succeeded');
  } catch (error) {
    console.log('✅ Correctly handled error');
    console.log('Error:', error.response?.data?.error || error.message);
  }
}

/**
 * Test 5: Error Handling - Empty wa_ids
 */
async function testEmptyWaIds() {
  console.log('\n📋 Test 5: Error Handling - Empty wa_ids');
  console.log('-'.repeat(60));

  try {
    await axios.delete(`${BASE_URL}/groups/${config.groupId}/participants`, {
      params: {
        phoneNumberId: config.phoneNumberId,
      },
      data: {
        wa_ids: [],
      },
    });

    console.log('❌ Should have failed but succeeded');
  } catch (error) {
    console.log('✅ Correctly handled error');
    console.log('Error:', error.response?.data?.error || error.message);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🚀 Starting Group Participants Tests...\n');

  try {
    // Test 1: Get group info with participants
    await testGetGroupInfo();

    // Test 2: Remove single participant (optional - uncomment to test)
    // console.log('\n⚠️  Skipping participant removal test (uncomment to run)');
    // await testRemoveParticipant();

    // Test 3: Remove multiple participants (optional - uncomment to test)
    // console.log('\n⚠️  Skipping multiple removal test (uncomment to run)');
    // await testRemoveMultipleParticipants();

    // Test 4: Error handling - invalid group ID
    await testInvalidGroupId();

    // Test 5: Error handling - empty wa_ids
    await testEmptyWaIds();

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ Tests failed');
    console.log('='.repeat(60));
    process.exit(1);
  }
}

// Run tests
runTests();

/**
 * Usage:
 * 
 * 1. Set environment variables:
 *    export PHONE_NUMBER_ID=your_phone_number_id
 *    export TEST_GROUP_ID=your_group_id
 *    export TEST_PARTICIPANT_WA_ID=participant_wa_id
 * 
 * 2. Run the test:
 *    node server/test-group-participants.js
 * 
 * Notes:
 * - Participant removal tests are commented out by default to prevent accidental removals
 * - Uncomment the removal tests when you're ready to test them
 * - Make sure the participant exists in the group before testing removal
 * - You cannot remove admins or yourself from the group
 */
